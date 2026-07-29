#!/usr/bin/env node
'use strict';
/**
 * 다크값갈림 검사기 (Gate 29 — Dark Divergence)
 *
 * 무엇을 검사하나:
 *   정본(vars-data.ts SEMANTIC_COLOR)에서 "라이트 최종값은 같은데 다크 최종값이 갈리는"
 *   토큰을 찾는다. 같은 비교 단위(컴포넌트) 안에서 갈리는 것은 대부분 실수이므로
 *   이상치(outlier) 토큰을 baseline과 대조해 신규 발생 시 차단(exit 1)한다.
 *   비교 단위 간(컴포넌트끼리) 갈림은 의도인 경우가 많아 기록만 한다(warn, 비차단).
 *
 * 비교 단위:
 *   - 컴포넌트 계열(button·chip·form-control 등): color/{seg1}/… 의 seg1
 *   - 역할 계열(ROLE_SEGS: text·icon·bg·line·overlay·surface): seg1/seg2
 *     (예: text/body 내부 갈림 = 이상치 / text/body vs text/state = 단위 간 → 기록만)
 *   알려진 한계: 역할 계열은 seg1+seg2 단위로 비교하므로, seg2 가 카테고리가 아니라 변형인
 *     계열(bg/level-* 등)은 단위당 토큰이 1개가 되어 내부 갈림 검출이 적용되지 않는다.
 *
 * 이상치(소수파) 판정:
 *   단위×라이트값 그룹에서 다수파 다크값과 다른 토큰 = 이상치.
 *   동수로 갈리면 전원을 이상치로 등록하고 [동수]로 표시한다. 옳은 쪽 판정은 하지 않는다.
 *
 * baseline: registry/governance/dark-divergence-baseline.json
 *   키 형식: <단위>::<라이트최종값>::<토큰명(color/ 제거, /→-)>::<다크최종값>
 *   예:      chip::#1D6CEB::chip-line-label-selected::#4285E8
 *   items[].reason 은 선택(비어 있어도 실패하지 않음).
 *   --update-baseline 은 줄이기 전용 래칫: 신규 키가 1건이라도 있으면 기록 거부 + exit 1,
 *   해소분만 있을 때만 축소 기록한다(.claude/docs/gate20-update-baseline-fix.md A안 선반영).
 *   baseline 파일이 아예 없을 때만 초기 생성(bootstrap)을 허용한다.
 *
 * 데이터 소스는 vars-data.ts 단일(파일 스캔 없음)이라 legacy-skip 필터 대상이 아니다.
 *
 * 출력 끝줄: DARKDIV_SUMMARY units=N outliers=N baselined=N new=N resolved=N crossGroups=N
 * 사용법: npm run tokens:darkdiv  ·  단독 상세: node scripts/dark-divergence-check.js
 *
 * 도입 사유(2026-07-28): chip 선택 라벨 다크가 같은 chip 선택 계열(blue-dark/300)과 달리
 *   blue-dark/350 으로 홀로 어긋난 것을 사람이 손으로 발견 — 같은 유형을 기계가 잡도록 신설.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VARS_DATA = path.join(ROOT, 'plugins', 'figma-vars-installer', 'src', 'vars-data.ts');
const BASELINE = path.join(ROOT, 'registry', 'governance', 'dark-divergence-baseline.json');

// 역할·전역 계열: 비교 단위를 seg1/seg2 로 세분한다(컴포넌트가 아니므로 seg1 통짜 비교는 과판정).
const ROLE_SEGS = new Set(['text', 'icon', 'bg', 'line', 'overlay', 'surface']);

// ── 값 정규화 ─────────────────────────────────────────
// 실측(2026-07-28): Foundation 208개 전부 대문자 #RRGGBB, rgba 는 color/overlay 1쌍뿐.
// 아래는 방어적 처리 — 표기 변형이 유입돼도 같은 값으로 묶이게 한다.
function normVal(v) {
  const s = String(v).trim();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return ('#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toUpperCase();
  }
  if (/^#[0-9a-fA-F]{6,8}$/.test(s)) return s.toUpperCase();
  return s.toLowerCase().replace(/\s+/g, ''); // rgba 등 리터럴
}

// ── vars-data.ts 파서 ─────────────────────────────────
// token-value-consistency-check.js parseVarsData 패턴 차용 + 경로 매개변수화(적대 테스트용).
function parseVars(tsPath) {
  const text = fs.readFileSync(tsPath, 'utf8');
  const foundationHex = {};
  const fStart = text.indexOf('FOUNDATION_COLOR');
  const fBlock = text.slice(fStart, text.indexOf('};', fStart));
  for (const m of fBlock.matchAll(/"([^"]+)"\s*:\s*"(#[0-9a-fA-F]{3,8})"/g)) {
    foundationHex[m[1]] = normVal(m[2]);
  }
  const semantic = {};
  const sStart = text.indexOf('SEMANTIC_COLOR:');
  const sBlock = sStart >= 0 ? text.slice(sStart) : '';
  for (const m of sBlock.matchAll(/"([^"]+)"\s*:\s*\{\s*light:\s*"([^"]+)"\s*,\s*dark:\s*"([^"]+)"\s*\}/g)) {
    semantic[m[1]] = { light: m[2], dark: m[3] };
  }
  // 침묵 누락 방어(검증자 지적 2026-07-28): 위 정규식은 "한 줄·light 먼저" 서식을 전제한다.
  // 서식이 달라진 엔트리는 조용히 검사 대상에서 빠지므로, 블록 안의 "color/…" 키 개수와
  // 파싱 개수가 다르면 요란하게 실패한다(Gate 17/19 "추출 0건=안 됨" 원칙의 적용).
  const sEnd = sBlock.indexOf('};');
  const keyCount = [...(sEnd >= 0 ? sBlock.slice(0, sEnd) : sBlock).matchAll(/"color\/[^"]+"\s*:/g)].length;
  const parsed = Object.keys(semantic).length;
  if (keyCount !== parsed) {
    throw new Error(`SEMANTIC_COLOR 파싱 누락 — 블록 내 키 ${keyCount}개 중 ${parsed}개만 파싱됨 (vars-data.ts 서식 변경 의심). 검사를 신뢰할 수 없어 중단.`);
  }
  return { foundationHex, semantic };
}

// Foundation 키 참조("blue/400") 또는 리터럴(rgba/#hex)을 최종값으로 해소.
function resolveRef(ref, foundationHex) {
  if (foundationHex[ref] !== undefined) return foundationHex[ref];
  if (/^(#|rgba?\()/i.test(ref)) return normVal(ref);
  return null; // 끊긴 참조 — 침묵 통과 금지, 호출부가 실패 처리
}

function unitOf(key) {
  const parts = key.split('/'); // ['color', seg1, seg2, …]
  const seg1 = parts[1] || '';
  if (ROLE_SEGS.has(seg1)) return parts[2] ? `${seg1}/${parts[2]}` : seg1;
  return seg1;
}

const tokenId = (key) => key.replace(/^color\//, '').replace(/\//g, '-');

// ── 본검사 ───────────────────────────────────────────
function analyze(varsDataPath) {
  const { foundationHex, semantic } = parseVars(varsDataPath);
  const entries = [];
  const unresolved = [];
  for (const [key, lv] of Object.entries(semantic)) {
    const light = resolveRef(lv.light, foundationHex);
    const dark = resolveRef(lv.dark, foundationHex);
    if (light === null || dark === null) {
      unresolved.push(`${key} (light=${lv.light} dark=${lv.dark})`);
      continue;
    }
    entries.push({ key, unit: unitOf(key), light, dark, darkRef: lv.dark });
  }

  // 라이트 최종값 동일 그룹(크기 2 이상)
  const byLight = new Map();
  for (const e of entries) {
    if (!byLight.has(e.light)) byLight.set(e.light, []);
    byLight.get(e.light).push(e);
  }

  const intraUnits = []; // 단위 내부 갈림 (error 후보)
  let crossGroups = 0;   // 단위 간 갈림 그룹 수 (기록만)

  for (const [light, group] of byLight) {
    if (group.length < 2) continue;
    const byUnit = new Map();
    for (const e of group) {
      if (!byUnit.has(e.unit)) byUnit.set(e.unit, []);
      byUnit.get(e.unit).push(e);
    }

    // 단위 간 갈림: 단위별 다크 집합이 서로 다른 조합이 하나라도 있으면 그룹 1회 계수
    if (byUnit.size >= 2) {
      const sigs = [...byUnit.values()].map((es) => [...new Set(es.map((e) => e.dark))].sort().join('|'));
      if (new Set(sigs).size > 1) crossGroups++;
    }

    // 단위 내부 갈림 → 이상치 산출
    for (const [unit, es] of byUnit) {
      if (es.length < 2) continue;
      const counts = new Map();
      for (const e of es) counts.set(e.dark, (counts.get(e.dark) || 0) + 1);
      if (counts.size < 2) continue;
      const max = Math.max(...counts.values());
      const tops = [...counts.entries()].filter(([, c]) => c === max).map(([d]) => d);
      const tie = tops.length > 1;
      const majority = tie ? null : tops[0];
      const outliers = tie ? es : es.filter((e) => e.dark !== majority);
      intraUnits.push({ unit, light, entries: es, counts, tie, majority, outliers });
    }
  }

  return { entries, unresolved, intraUnits, crossGroups, groupCount: [...byLight.values()].filter((g) => g.length >= 2).length };
}

const keyOf = (unit, light, e) => `${unit}::${light}::${tokenId(e.key)}::${e.dark}`;

function loadBaseline(baselinePath) {
  if (!fs.existsSync(baselinePath)) return null;
  const j = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  return new Map((j.items || []).map((it) => [it.key, it.reason || '']));
}

function outlierLine(u, e) {
  const dist = [...u.counts.entries()].map(([d, c]) => `${d}×${c}`).join(' · ');
  const minority = u.tie ? '[동수]' : `${u.entries.length}개 중 소수 ${u.outliers.length}`;
  return `${u.unit}::${u.light} — ${tokenId(e.key)} 다크 ${e.darkRef}=${e.dark} (${minority} · 분포 ${dist})`;
}

function check(opts = {}) {
  const varsDataPath = opts.varsDataPath || VARS_DATA;
  const baselinePath = opts.baselinePath || BASELINE;
  const a = analyze(varsDataPath);
  const baseline = loadBaseline(baselinePath) || new Map();

  const current = []; // {key, line, unit, entry}
  for (const u of a.intraUnits) {
    for (const e of u.outliers) {
      current.push({ key: keyOf(u.unit, u.light, e), line: outlierLine(u, e), unit: u, entry: e });
    }
  }
  const currentKeys = new Set(current.map((c) => c.key));
  const newOutliers = current.filter((c) => !baseline.has(c.key));
  const resolved = [...baseline.keys()].filter((k) => !currentKeys.has(k));

  return {
    intraUnits: a.intraUnits,
    crossGroups: a.crossGroups,
    groupCount: a.groupCount,
    unresolved: a.unresolved,
    current,
    newOutliers,
    resolved,
    baselined: current.length - newOutliers.length,
    baselineMissing: !fs.existsSync(baselinePath),
  };
}

// ── 줄이기 전용 baseline 갱신 (래칫) ───────────────────
function updateBaseline() {
  const r = check();
  if (r.unresolved.length) {
    console.error(`❌ 끊긴 참조 ${r.unresolved.length}건 — baseline 갱신 거부`);
    r.unresolved.forEach((u) => console.error(`   ${u}`));
    process.exit(1);
  }
  const existed = !r.baselineMissing;
  if (existed && r.newOutliers.length > 0) {
    console.error(`❌ 신규 이상치 ${r.newOutliers.length}건 — baseline 에 넣지 않고 기록을 거부합니다(줄이기 전용).`);
    console.error('   baseline 에 추가하지 말고 먼저 정본(vars-data.ts) 다크값을 확인·교정하세요.');
    r.newOutliers.forEach((c) => console.error(`   ❌ ${c.line}`));
    process.exit(1);
  }
  const prev = loadBaseline(BASELINE) || new Map();
  const items = r.current
    .map((c) => ({ key: c.key, reason: prev.get(c.key) || '' }))
    .sort((x, y) => x.key.localeCompare(y.key));
  const out = {
    _note: '라이트 최종값이 같은데 같은 비교 단위 안에서 다크값이 갈리는 이상치 토큰 목록. Gate 29(dark-divergence-check)가 여기 없는 신규 이상치를 차단한다. 갱신은 줄이기 전용(--update-baseline) — 신규가 있으면 기록 거부. reason 은 선택(비어 있어도 실패하지 않음). 각 건의 라이트/다크 값·다수파·컴포넌트 내 분포 등 상세 사실은 reports/dark-divergence-initial.md 참조.',
    _updated: new Date().toISOString().slice(0, 10),
    count: items.length,
    items,
  };
  fs.writeFileSync(BASELINE, JSON.stringify(out, null, 2) + '\n');
  console.log(existed
    ? `✅ baseline 축소 기록 — ${items.length}건 (해소 ${r.resolved.length}건 제거)`
    : `✅ baseline 초기 생성 — ${items.length}건`);
}

module.exports = { check, analyze, parseVars, normVal, unitOf, ROLE_SEGS };

// ── 단독 실행(CLI) ────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--update-baseline')) { updateBaseline(); process.exit(0); }

  const r = check();
  console.log('\n🌓 Dark Divergence Check (Gate 29) — 라이트 동일 · 다크 갈림\n');
  if (args.includes('--print-keys')) {
    r.current.forEach((c) => console.log(c.key));
    process.exit(0);
  }

  for (const u of r.intraUnits) {
    const head = u.tie ? '[동수]' : `다수 ${u.majority}×${u.counts.get(u.majority)}`;
    console.log(`■ ${u.unit} · 라이트 ${u.light} (${u.entries.length}토큰 · ${head})`);
    for (const e of u.entries) {
      const mark = u.outliers.includes(e) ? '◆' : ' ';
      console.log(`  ${mark} ${e.key}  다크 ${e.darkRef} = ${e.dark}`);
    }
  }
  if (r.unresolved.length) {
    console.log('\n❌ 끊긴 참조 (해소 불가):');
    r.unresolved.forEach((u) => console.log(`  ❌ ${u}`));
  }
  if (r.newOutliers.length) {
    console.log('\n❌ baseline 에 없는 신규 이상치:');
    r.newOutliers.forEach((c) => console.log(`  ❌ ${c.line}`));
  }
  if (r.resolved.length) {
    console.log(`\n✅ 해소됨(baseline 축소 가능): ${r.resolved.length}건`);
    r.resolved.forEach((k) => console.log(`  ✅ ${k}`));
  }
  console.log(`\nDARKDIV_SUMMARY units=${r.intraUnits.length} outliers=${r.current.length} baselined=${r.baselined} new=${r.newOutliers.length} resolved=${r.resolved.length} crossGroups=${r.crossGroups}`);
  process.exit(r.newOutliers.length || r.unresolved.length ? 1 : 0);
}
