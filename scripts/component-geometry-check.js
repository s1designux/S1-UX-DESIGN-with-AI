#!/usr/bin/env node
'use strict';
/**
 * component-geometry-check.js — 정본 수치 ↔ 웹 가이드 크기 CSS 대조기 (Gate 39)
 * @role: 정본 컴포넌트 수치와 components.html 크기 CSS 대조 (높이·여백·반경·간격)
 *
 * [왜 만들었나] 2026-08-12 판독 결과, `pages/components.html` 은 10,240줄 중 자동 생성이 475줄(4.6%)
 *   뿐이고 나머지는 옛날 손편집이다. 크기 수치는 416줄이 px 로 직접 박혀 있는데, 정본은 토큰 이름
 *   (`spacing/16`·`radius/4`)으로 적혀 있어 형태가 달라 아무도 비교하지 못했다.
 *   게이트 43개를 전수 확인했을 때 "정본 수치 ↔ 웹 수치"를 값으로 비교하는 검사기는 0개였다
 *   (18·19·23·32 는 각각 커버리지·커버리지·구조·어휘). 그래서 정본을 고쳐도 웹은 조용히 옛 값으로
 *   남았고, 43세트 중 8개만 우연히 확인된 상태였다.
 *
 * [무엇을 새로 만들지 않았나 — 중요]
 *   판정에 필요한 두 선언은 **이미 저장소에 있다.** 이 검사기는 매핑을 새로 지어내지 않는다.
 *     · 정본 수치      = registry/components/component-facts.json  (build-components.ts 에서 자동 생성, Gate 24)
 *     · 세트 ↔ 섹션    = registry/governance/component-page-coverage.json 의 sectionFor (Gate 18 정본)
 *   variant 하나하나를 CSS 클래스에 손으로 이어붙이는 매핑표는 만들지 않는다. 그건 추측이 되고,
 *   틀리면 가짜 합격/가짜 불합격을 만든다. 대신 **집합 대조**를 한다(아래).
 *
 * [판정 방식 — 집합 대조, 주 신호는 '정본 → 웹 미반영']
 *   세트마다 "정본이 선언한 값의 집합"과 "그 섹션 CSS 가 쓰는 값의 집합"을 속성별로 비교한다.
 *     · canon-only(주 신호) : 정본이 선언한 수치가 웹 CSS 어디에도 없다
 *                             = 정본을 고쳤는데 웹이 안 따라온 상태. 이게 이 검사기의 목적이다.
 *     · web-only(참고)      : 웹에만 있는 수치. 정본은 컴포넌트 바깥 틀만 선언하는데 웹 CSS 는
 *                             안쪽 부품 크기(토글 손잡이 16·라디오 점 10 등)까지 갖고 있어
 *                             층위가 달라 오탐이 많다. 그래서 보고만 하고 게이트로 삼지 않는다.
 *   웹 쪽 수집 범위를 섹션 전체로 넓게 잡는 것은 의도한 보수 설정이다 — 넓을수록 "정본 값이 웹에
 *   없다"는 판정이 확실해진다(있는데 못 찾는 오탐이 줄어든다).
 *
 *   1:1 짝짓기를 하지 않으므로 "MD 가 어느 클래스냐"를 몰라도 판정이 선다. 대신 "어느 variant 가
 *   틀렸나"까지는 말하지 않는다 — 말할 수 없는 것을 말하지 않는 쪽을 택했다.
 *
 * [래칫] 기존 부채는 baseline 으로 동결하고 신규만 막는다. 갑자기 조이면 --no-verify 우회를 부른다.
 *   baseline: registry/governance/component-geometry-baseline.json
 *
 * 사용:
 *   node scripts/component-geometry-check.js                  # 사람이 읽는 보고
 *   node scripts/component-geometry-check.js --json           # 기계 판독용
 *   node scripts/component-geometry-check.js --check          # 게이트 모드(baseline 대비 신규만 실패)
 *   node scripts/component-geometry-check.js --update-baseline
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FACTS = path.join(ROOT, 'registry/components/component-facts.json');
const COVERAGE = path.join(ROOT, 'registry/governance/component-page-coverage.json');
const GEOMAP = path.join(ROOT, 'registry/governance/component-geometry-map.json');
const BASELINE = path.join(ROOT, 'registry/governance/component-geometry-baseline.json');

const argv = process.argv.slice(2);
const AS_JSON = argv.includes('--json');
const CHECK = argv.includes('--check');
const UPDATE = argv.includes('--update-baseline');

// ── 비교 대상 속성 ────────────────────────────────────────────────────────
//   정본 geometry 키 → 웹 CSS 속성. 값이 px 하나로 떨어지는 것만 다룬다(정렬·방향 등 제외).
const PROPS = {
  height: { canon: ['height'], css: ['height', 'min-height'], label: '높이' },
  padding: {
    canon: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    css: ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'], label: '여백',
  },
  radius: {
    canon: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'cornerRadius'],
    css: ['border-radius', 'border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius'], label: '반경',
  },
  gap: { canon: ['itemSpacing'], css: ['gap', 'column-gap', 'row-gap'], label: '간격' },
};

// ── 토큰 이름 → 숫자 (정본은 긁지 말고 로드) ──────────────────────────────
let NUMBER_TOKENS = null;
function tokenValue(name) {
  if (NUMBER_TOKENS === null) {
    NUMBER_TOKENS = {};
    try {
      const { loadVarsData } = require('./lib/load-vars-data');
      const V = loadVarsData();
      Object.assign(NUMBER_TOKENS, V.FOUNDATION_NUMBER || {}, V.SEMANTIC_NUMBER || {});
    } catch (e) {
      NUMBER_TOKENS = null;   // 로드 실패 → 토큰형 값은 '해석 불가'로 남긴다(추측하지 않음)
      return null;
    }
  }
  if (!NUMBER_TOKENS) return null;
  const v = NUMBER_TOKENS[name];
  return typeof v === 'number' ? v : (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : null);
}
// 정본 geometry 값 하나 → px 숫자 (못 풀면 null)
function canonNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.includes('/')) return tokenValue(v);
  return null;
}

// ── 웹: 인라인 <style> 파싱 ───────────────────────────────────────────────
//   중첩(@media 등)까지 훑는 brace 스캐너. 정규식 한 방으로 규칙을 뜨면 미디어쿼리에서 무너진다.
function parseRules(css) {
  const rules = [];
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0, selStart = 0, depth = 0, stack = [];
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') {
      const sel = src.slice(selStart, i).trim();
      stack.push({ sel, bodyStart: i + 1, depth });
      depth++; i++; selStart = i; continue;
    }
    if (ch === '}') {
      depth--;
      const top = stack.pop();
      if (top) {
        const body = src.slice(top.bodyStart, i);
        // 선언만 있는(=중첩 블록이 없는) 블록만 규칙으로 인정
        if (!body.includes('{')) rules.push({ selector: top.sel, body });
      }
      i++; selStart = i; continue;
    }
    if (ch === ';' && depth === 0) { i++; selStart = i; continue; }
    i++;
  }
  return rules;
}
// ── CSS 변수 → 숫자 (웹이 토큰을 경유해 쓴 값도 비교 대상이다) ────────────
//   `padding: 0 var(--spacing-16)` 을 건너뛰면 정본 16 이 "웹에 없음"으로 잡히는 가짜 불일치가 난다
//   (실측 확인). tokens.css 는 정본에서 생성된 파일이므로 여기서 값을 풀어도 정본을 벗어나지 않는다.
let CSS_VARS = null;
function cssVarMap() {
  if (CSS_VARS) return CSS_VARS;
  CSS_VARS = new Map();
  ['assets/css/tokens.css', 'assets/css/site-base.css', 'assets/css/typography.css'].forEach(rel => {
    let src; try { src = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (_) { return; }
    const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let m;
    while ((m = re.exec(src))) {
      const v = m[2].trim();
      const num = v.match(/^-?\d+(?:\.\d+)?(px)?$/) ? parseFloat(v) : null;
      if (num !== null) CSS_VARS.set(m[1], num);
    }
  });
  return CSS_VARS;
}
// var(--x) / var(--x, fallback) 을 값으로 치환. 못 푸는 건 그대로 둔다.
function resolveVars(val, depth) {
  if (depth > 3 || !val.includes('var(')) return val;
  const map = cssVarMap();
  const out = val.replace(/var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]*)?\)/gi, (whole, name) => {
    const v = map.get(name);
    return v === undefined ? whole : String(v) + 'px';
  });
  return out === val ? out : resolveVars(out, (depth || 0) + 1);
}

// 선언 본문 → { 속성: [px 숫자…] }
function declNumbers(body) {
  const out = {};
  body.split(';').forEach(d => {
    const m = d.match(/^\s*([a-z-]+)\s*:\s*(.+)$/i);
    if (!m) return;
    const prop = m[1].toLowerCase();
    const val = resolveVars(m[2], 0);
    if (/var\(/.test(val)) return;                    // 끝내 못 푼 것만 제외
    const nums = (val.match(/-?\d+(?:\.\d+)?px/g) || []).map(s => parseFloat(s));
    // CSS 에서 길이 0 은 단위를 안 붙인다(`padding: 0 8px`). px 만 훑으면 0 을 통째로 놓쳐
    // "정본 0 이 웹에 없음" 이라는 가짜 불일치가 난다. 단위 없는 토큰은 0 만 인정한다.
    if (/(^|\s)0(\s|$)/.test(val.replace(/-?\d+(?:\.\d+)?[a-z%]+/gi, ' '))) nums.push(0);
    if (!nums.length) return;
    (out[prop] = out[prop] || []).push(...nums);
  });
  return out;
}

// ── 웹: 섹션별로 쓰이는 클래스 수집 ───────────────────────────────────────
//   클래스 접두사를 가정하지 않는다 — 이 파일은 `s1-btn` 과 `ds-filter-chip` 이 섞여 있어
//   접두사로 거르면 Filter Chip 처럼 통째로 빠지는 세트가 생긴다(실측 확인).
//   대신 **등장 섹션 수**로 거른다: 여러 섹션에 나오는 클래스는 페이지 공통 크롬
//   (표·배지·상태 매트릭스 등)이므로 컴포넌트 수치로 볼 수 없다. 한 섹션에만 나오면 그 컴포넌트
//   고유 클래스다. 이름 규칙을 몰라도 서고, 추측이 들어가지 않는다.
function sectionClasses(html) {
  const raw = new Map();                       // 섹션 id → Set(클래스)
  const seenIn = new Map();                    // 클래스 → 등장 섹션 수
  const re = /<section\b[^>]*class="[^"]*comp-section[^"]*"[^>]*id="([^"]+)"[^>]*>/g;
  const marks = [];
  let m;
  while ((m = re.exec(html))) marks.push({ id: m[1], start: m.index });
  marks.forEach((mk, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].start : html.length;
    const chunk = html.slice(mk.start, end);
    const set = new Set();
    let c;
    const cre = /class="([^"]+)"/g;
    while ((c = cre.exec(chunk))) c[1].split(/\s+/).forEach(cl => { if (cl) set.add(cl); });
    raw.set(mk.id, set);
    set.forEach(cl => seenIn.set(cl, (seenIn.get(cl) || 0) + 1));
  });
  const own = new Map();
  raw.forEach((set, id) => own.set(id, new Set([...set].filter(cl => seenIn.get(cl) === 1))));
  return { own, raw, seenIn };
}

// ══════════════════════════════════════════════════════════════════════════
function build() {
  const facts = JSON.parse(fs.readFileSync(FACTS, 'utf8'));
  const cov = JSON.parse(fs.readFileSync(COVERAGE, 'utf8'));
  const htmlPath = path.join(ROOT, cov.htmlPage || 'pages/components.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const styleBlocks = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [])
    .map(b => b.replace(/^<style[^>]*>/i, '').replace(/<\/style>$/i, ''));
  const rules = styleBlocks.flatMap(parseRules);
  const secCls = sectionClasses(html).raw;   // 선언 검증용(그 섹션에 실제로 쓰인 클래스)

  // 클래스 → 그 클래스를 선택자에 포함하는 규칙의 숫자들
  const classNums = new Map();
  rules.forEach(r => {
    const nums = declNumbers(r.body);
    if (!Object.keys(nums).length) return;
    const cls = (r.selector.match(/\.[a-z][a-z0-9_-]*/gi) || []).map(s => s.slice(1));
    cls.forEach(c => {
      const cur = classNums.get(c) || {};
      Object.entries(nums).forEach(([p, ns]) => { (cur[p] = cur[p] || []).push(...ns); });
      classNums.set(c, cur);
    });
  });

  const geomap = JSON.parse(fs.readFileSync(GEOMAP, 'utf8'));

  const results = [];
  const unresolved = [];      // 토큰을 못 푼 정본 값 (정직 보고용)
  for (const [setName, sectionId] of Object.entries(cov.sectionFor || {})) {
    const comp = (facts.components || {})[setName];
    const decl = (geomap.sets || {})[setName];
    const row = { set: setName, section: sectionId, props: {}, status: 'ok', reasons: [] };
    if (!comp) { row.status = 'no-canon'; row.reasons.push('component-facts 에 세트 없음'); results.push(row); continue; }
    if (!decl) {
      row.status = 'not-measurable';
      row.reasons.push((geomap.notMeasurable || {})[setName] || '이 세트의 CSS 클래스가 선언되지 않음 (component-geometry-map.json)');
      results.push(row); continue;
    }
    // 선언 검증: 선언한 접두사가 실제로 그 섹션 마크업에 쓰이는가 (선언이 낡으면 여기서 드러난다)
    const usedInSection = secCls.get(sectionId) || new Set();
    const live = decl.prefixes.filter(p => [...usedInSection].some(c => c.startsWith(p)));
    if (!live.length) {
      row.status = 'unverified';
      row.reasons.push(`선언한 클래스 ${decl.prefixes.join('·')} 가 섹션 ${sectionId} 마크업에 없음 — 선언이 낡았습니다`);
      results.push(row); continue;
    }
    row.prefixes = live;
    // 대조 대상 = 선언 접두사로 시작하는 모든 클래스 (섹션 밖에서 재사용돼도 같은 컴포넌트다)
    const classes = new Set([...classNums.keys()].filter(c => live.some(p => c.startsWith(p))));
    if (!classes.size) { row.status = 'no-css'; row.reasons.push('그 접두사를 가진 CSS 크기 규칙이 없음'); results.push(row); continue; }

    // 정본 값 집합
    const canonSets = {};
    for (const [key, spec] of Object.entries(PROPS)) canonSets[key] = new Set();
    (comp.geometry || []).forEach(g => {
      for (const [key, spec] of Object.entries(PROPS)) {
        spec.canon.forEach(ck => {
          if (!(ck in g)) return;
          const n = canonNumber(g[ck]);
          if (n === null) { unresolved.push({ set: setName, key: ck, value: g[ck] }); return; }
          canonSets[key].add(n);
        });
      }
    });

    // 웹 값 집합
    const webSets = {};
    for (const key of Object.keys(PROPS)) webSets[key] = new Set();
    classes.forEach(c => {
      const nums = classNums.get(c);
      if (!nums) return;
      for (const [key, spec] of Object.entries(PROPS)) {
        spec.css.forEach(p => (nums[p] || []).forEach(n => webSets[key].add(n)));
      }
    });

    for (const [key, spec] of Object.entries(PROPS)) {
      const canon = [...canonSets[key]].sort((a, b) => a - b);
      const web = [...webSets[key]].sort((a, b) => a - b);
      const webOnly = web.filter(v => !canonSets[key].has(v));
      const canonOnly = canon.filter(v => !webSets[key].has(v));
      row.props[key] = { canon, web, webOnly, canonOnly, measured: canon.length > 0 && web.length > 0 };
      if (canonOnly.length && web.length) row.status = 'suspect';   // 주 신호: 정본 값이 웹에 없음
    }
    if (row.status === 'ok' && !Object.values(row.props).some(p => p.measured)) row.status = 'unmeasured';
    results.push(row);
  }

  // 섹션 매핑이 없어 이 검사기가 아예 못 보는 세트
  const uncovered = Object.keys(facts.components || {}).filter(n => !(cov.sectionFor || {})[n]);

  return { results, uncovered, unresolved, tokensLoaded: NUMBER_TOKENS !== null };
}

// ── baseline (래칫) ───────────────────────────────────────────────────────
const fingerprintOf = r => Object.entries(r.props)
  .filter(([, p]) => p.canonOnly.length && p.web.length)
  .map(([k, p]) => `${k}:${p.canonOnly.join(',')}`).join(' | ');

function loadBaseline() {
  try { return JSON.parse(fs.readFileSync(BASELINE, 'utf8')); } catch (_) { return null; }
}

// ══════════════════════════════════════════════════════════════════════════
function main() {
  const data = build();
  const suspects = data.results.filter(r => r.status === 'suspect');

  if (UPDATE) {
    const known = {};
    suspects.forEach(r => { known[r.set] = fingerprintOf(r); });
    // 사람이 채운 사유(_reasons)는 갱신 때 보존한다 — 단, 동결 목록에서 빠진 세트의 사유는 같이 지운다.
    const prev = loadBaseline() || {};
    const reasons = {};
    Object.entries(prev._reasons || {}).forEach(([set, why]) => { if (known[set]) reasons[set] = why; });
    fs.writeFileSync(BASELINE, JSON.stringify({
      _role: '정본 수치 ↔ 웹 크기 CSS 대조(Gate 39)의 기존 부채 동결 목록. 신규만 차단한다.',
      _note: '값은 "정본에 있는데 웹에 없는 수치"의 지문이다. 웹을 정본에 맞춰 고치면 이 줄을 지우면 된다(하드룰 H6: 정본이 맞고 웹을 고친다). 층위가 달라 대조 자체가 성립하지 않는 항목(표 전체 프레임 높이 등)도 여기 동결되므로, 각 줄의 사유는 사람이 확인해 _reasons 에 채운다(갱신 시 보존됨).',
      _reasons: reasons,
      _updated: new Date().toISOString().slice(0, 10),
      knownMismatch: known,
    }, null, 2) + '\n');
    console.log(`baseline 갱신 — 동결 ${Object.keys(known).length}건 → ${path.relative(ROOT, BASELINE)}`);
    return 0;
  }

  if (AS_JSON) { console.log(JSON.stringify(data, null, 2)); return 0; }

  if (CHECK) {
    const base = loadBaseline();
    if (!base) {
      console.log('⚠️  Gate 39: baseline 없음 — 먼저 `node scripts/component-geometry-check.js --update-baseline`');
      return 0;
    }
    const known = base.knownMismatch || {};
    const fresh = suspects.filter(r => known[r.set] !== fingerprintOf(r));
    const fixed = Object.keys(known).filter(s => !suspects.some(r => r.set === s));
    if (fresh.length) {
      console.log(`❌ Gate 39: 정본 수치가 웹 가이드에 반영되지 않았습니다 (${fresh.length}건)`);
      fresh.forEach(r => {
        console.log(`   · ${r.set} (섹션 ${r.section})`);
        Object.entries(r.props).forEach(([k, p]) => {
          if (p.canonOnly.length && p.web.length)
            console.log(`       ${PROPS[k].label}: 정본 ${p.canonOnly.join('·')} 가 웹에 없음 (웹은 ${p.web.join('·')})`);
        });
      });
      console.log('   → 하드룰 H6: 정본이 맞습니다. 웹을 고치세요. 층위가 달라 대조 부적합이면 --update-baseline');
      return 1;
    }
    const measured = data.results.filter(r => Object.values(r.props).some(p => p.measured)).length;
    console.log(`정본 수치 ↔ 웹 크기 CSS 일치 — 대조 ${measured}세트 · 동결 ${Object.keys(known).length}건`
      + (fixed.length ? ` · 해소 ${fixed.length}건(baseline 갱신 권장)` : ''));
    return 0;
  }

  // 사람이 읽는 보고
  const L = [];
  L.push('정본 수치 ↔ 웹 크기 CSS 대조');
  L.push('  정본: registry/components/component-facts.json (build-components.ts 에서 자동 생성)');
  L.push('  웹  : pages/components.html 인라인 <style>');
  L.push('  매핑: registry/governance/component-page-coverage.json 의 sectionFor (Gate 18 정본 재사용)');
  L.push('');
  const measured = data.results.filter(r => Object.values(r.props).some(p => p.measured));
  L.push(`대조된 세트 ${measured.length} / 섹션 선언 ${data.results.length} / 전체 세트 ${data.results.length + data.uncovered.length}`);
  L.push('');
  data.results.forEach(r => {
    const mark = { ok: '✅', suspect: '❌', unmeasured: '❓', 'no-canon': '❓',
      'not-measurable': '❓', unverified: '⚠', 'no-css': '❓' }[r.status] || '❓';
    const why = r.reasons.length ? '  — ' + r.reasons.join(', ') : '';
    L.push(`${mark} ${r.set}  (섹션 ${r.section})${why}`);
    Object.entries(r.props).forEach(([k, p]) => {
      if (!p.canon.length) return;
      const lab = PROPS[k].label;
      if (p.canonOnly.length && p.web.length)
        L.push(`     ${lab}  ❌ 정본 ${p.canonOnly.join(' · ')} 가 웹에 없음   (웹이 쓰는 값: ${p.web.join(' · ')})`);
      else if (p.measured)
        L.push(`     ${lab}  ✅ 정본 ${p.canon.join(' · ')} 전부 웹에 있음`);
    });
  });
  L.push('');
  L.push(`이 검사기가 보지 못하는 세트 ${data.uncovered.length} (HTML 섹션 매핑이 선언되지 않음):`);
  L.push('  ' + data.uncovered.join(' · '));
  if (data.unresolved.length) {
    const uniq = [...new Set(data.unresolved.map(u => u.value))];
    L.push('');
    L.push(`토큰 이름을 숫자로 못 푼 정본 값 ${uniq.length}종: ${uniq.join(' · ')}`);
  }
  if (!data.tokensLoaded) L.push('⚠ vars-data 로드 실패 — 토큰형 정본 값(spacing/16 등)은 비교에서 빠졌습니다.');
  console.log(L.join('\n'));
  return 0;
}

if (require.main === module) process.exit(main());
module.exports = { build };
