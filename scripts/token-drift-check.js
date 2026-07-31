#!/usr/bin/env node
/**
 * 🔎 토큰 drift 검사기 (Registry Token Drift) — baseline ratchet
 *
 * 기준(정본) = **최신 컴포넌트가 실제로 쓰는 토큰** (build-components.ts 를 mock 실행해 수집).
 * 역할     = registry 설명 데이터(component.tokens.json·components/*.json)가
 *            "최신 컴포넌트가 안 쓰는 토큰"을 언급/참조하면 잡는다.
 *            → 옛 토큰 정보가 grep 하는 사람·AI 를 오도하는 것을 차단(2026-06-30 table-row 사태).
 *
 * "안 쓰는 토큰" 2종:
 *   (1) 삭제됨   — tokens.css 에도 없음 (예: --color-action-primary-default)
 *   (2) 미사용   — tokens.css 엔 있으나 어떤 컴포넌트도 요청 안 함 (예: 컴포넌트가 안 쓰는 bg/selected)
 *   ※ 컴포넌트가 아닌 레이아웃용 토큰(bg/level 등)은 intentional-unused-tokens.json 으로 면제.
 *
 * baseline(registry/governance/registry-drift-baseline.json):
 *   현재 알려진 stale 를 기록(--update-baseline). 새 stale 추가=❌차단, 알려진 것=⚠️개수, 줄면=✅갱신권장.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const BASELINE = path.join(ROOT, 'registry/governance/registry-drift-baseline.json');
const ALLOW = path.join(ROOT, 'registry/governance/intentional-unused-tokens.json');
const { isLegacyFile } = require('./lib/legacy-skip'); // 레거시 격리 규약: 격리 파일은 검사 제외(공용 필터)
const UPDATE = process.argv.includes('--update-baseline');

// tokens.css 정의 집합 (삭제됨 vs 미사용 구분용)
const css = fs.readFileSync(path.join(ROOT, 'assets/css/tokens.css'), 'utf8');
const definedCss = new Set([...css.matchAll(/(--color-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));

// color/x/y → --color-x-y (정방향만; 역방향은 모호해서 안 씀)
const toCss = (figPath) => '--color-' + figPath.replace(/^color\//, '').replace(/\//g, '-');

// ── 최신 컴포넌트가 실제 요청하는 토큰 (build-components mock 실행) ──────────────
function makeStub() {
  const f = function () { return makeStub(); };
  return new Proxy(f, {
    get(_t, p) {
      if (p === 'then') return undefined;
      if (p === Symbol.iterator) return undefined;
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === 'children') return [];
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      return makeStub();
    },
    set() { return true; }, apply() { return makeStub(); },
  });
}
async function builderColorKeys() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(require('os').tmpdir(), 'bc-drift-' + process.pid + '.cjs');
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  const req = new Set();
  const rec = (sink) => new Proxy({}, { get(_t, p) { if (typeof p === 'string') sink.add(p); return makeStub(); } });
  global.figma = makeStub();   // build-components 가 figma 전역을 참조 → 없으면 즉시 throw(키 0)
  const maps = {
    semanticColor: rec(req), foundationColor: rec(new Set()), foundationNumber: rec(new Set()), textStyles: rec(new Set()),
    semanticColorCollectionId: 'c', semanticLightModeId: 'l', semanticDarkModeId: 'd',
  };
  try { await require(tmp).buildAllComponents(maps); } catch (e) { /* throw 전까지 키 수집됨 */ }
  try { fs.unlinkSync(tmp); } catch (e) { /* */ }
  return new Set([...req].filter((k) => k.startsWith('color/')));
}

function entriesOf(obj, out) {
  if (Array.isArray(obj)) { obj.forEach((o) => entriesOf(o, out)); return; }
  if (obj && typeof obj === 'object') {
    const name = obj.cssVar || obj.name;
    const value = obj.value !== undefined ? obj.value : obj.ref;
    if (name && typeof value === 'string') out.push({ name, value, fig: obj.figmaVariable });
    Object.values(obj).forEach((v) => entriesOf(v, out));
  }
}

(async function main() {
  // 권위 집합 = 컴포넌트 실사용 토큰 (+ 의도적 비사용/레이아웃 면제)
  const usedPaths = await builderColorKeys();
  let allow = new Set();
  if (fs.existsSync(ALLOW)) { try { allow = new Set((JSON.parse(fs.readFileSync(ALLOW, 'utf8')).tokens || []).map((t) => t.token)); } catch (e) { /* */ } }
  const authorityPaths = new Set([...usedPaths, ...allow]);          // color/x 형태
  const authorityCss = new Set([...authorityPaths].map(toCss));      // --color-x 형태

  let files = ['registry/tokens/component.tokens.json'];
  const compDir = path.join(ROOT, 'registry/components');
  if (fs.existsSync(compDir)) for (const f of fs.readdirSync(compDir)) if (f.endsWith('.json')) files.push('registry/components/' + f);
  // 레거시 격리 규약: deprecated-tokens.json legacyFiles 에 등록된 파일은 스캔 제외(다른 게이트와 동일).
  files = files.filter((rel) => !isLegacyFile(rel));

  const drift = new Map();
  // 미계측 계수(2026-07-31) — entriesOf 는 {name|cssVar} + {value|ref} 형태의 "객체형" 엔트리만
  //   인정한다. registry/components/*.json 중 일부는 tokens 를 {"background": ["--a","--b"]} 처럼
  //   문자열 배열로 적어 두는데, 그러면 추출이 0건이 되고 그 파일은 통째로 검사에서 빠진다.
  //   지금까지 그 사실이 출력 어디에도 드러나지 않아 "검사됨"과 구분되지 않았다.
  //   → 추출 0건인데 파일 안에 --토큰 이름이 있는 파일을 "미계측"으로 세어 보고한다.
  //   (배열형까지 읽게 만드는 확장은 하지 않는다. baseline ratchet 방식이라 추출이 늘면
  //    newItems 폭증으로 즉시 차단된다 — 별칭층 철거 방침이 정해진 뒤 별건으로 다룰 일.)
  //   보고 전용이며 exit 코드에 영향을 주지 않는다.
  const scanStats = [];
  for (const rel of files) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    let raw;
    try { raw = fs.readFileSync(full, 'utf8'); }
    catch (e) { drift.set(`${rel}::READ`, `${rel}: 읽기 실패 — ${e.message}`); continue; }
    let data;
    try { data = JSON.parse(raw); }
    catch (e) { drift.set(`${rel}::PARSE`, `${rel}: JSON parse 실패 — ${e.message}`); continue; }
    const entries = []; entriesOf(data, entries);
    // 파일 안에 실제로 토큰 이름이 있는가(접두 조각 제외) — 추출 0건이 "형식 때문"인지
    // "애초에 토큰이 없어서"인지 구분한다. 후자는 미계측이 아니다.
    const tokenNames = new Set([...raw.matchAll(/--[a-z0-9-]+/g)].map((m) => m[0]).filter((t) => !t.endsWith('-')));
    scanStats.push({ rel, entries: entries.length, tokenNames: tokenNames.size });
    for (const e of entries) {
      const refs = [...e.value.matchAll(/var\((--color-[a-z0-9-]+)\)/g)].map((m) => m[1]);
      for (const r of refs) {
        if (authorityCss.has(r)) continue;
        if (!definedCss.has(r)) drift.set(`${rel}::${e.name}::removed::${r}`, `${rel} · ${e.name}: 삭제된 토큰 참조 ${r}`);
        else drift.set(`${rel}::${e.name}::unused::${r}`, `${rel} · ${e.name}: 컴포넌트 미사용 토큰 참조 ${r}`);
      }
      if (e.fig && /^color\//.test(e.fig) && !authorityPaths.has(e.fig)) {
        drift.set(`${rel}::${e.name}::figunused::${e.fig}`, `${rel} · ${e.name}: figmaVariable ${e.fig} — 최신 컴포넌트가 안 씀`);
      }
      if (e.fig && /^color\//.test(e.fig) && refs.length === 1 && refs[0] !== toCss(e.fig)) {
        drift.set(`${rel}::${e.name}::figmismatch`, `${rel} · ${e.name}: figmaVariable(${e.fig}→${toCss(e.fig)}) ↔ value(${refs[0]}) 불일치`);
      }
    }
  }
  const currentKeys = new Set(drift.keys());

  if (UPDATE) {
    fs.writeFileSync(BASELINE, JSON.stringify({
      note: 'registry 비정본(descriptive) 데이터의 알려진 stale 목록. 기준=최신 컴포넌트 실사용 토큰(build-components). 새 stale 는 token-drift-check 가 차단. 줄면 --update-baseline.',
      count: currentKeys.size, knownDrift: [...currentKeys].sort(),
    }, null, 2) + '\n');
    console.log(`🔎 토큰 drift baseline 기록 — known ${currentKeys.size}건`);
    return;
  }

  let baseline = new Set();
  if (fs.existsSync(BASELINE)) { try { baseline = new Set(JSON.parse(fs.readFileSync(BASELINE, 'utf8')).knownDrift || []); } catch (e) { /* */ } }
  const newItems = [...currentKeys].filter((k) => !baseline.has(k));
  const fixedItems = [...baseline].filter((k) => !currentKeys.has(k));

  console.log('🔎 토큰 drift 검사기 (Registry Token Drift · baseline ratchet)');
  console.log(`  기준=최신 컴포넌트 실사용 토큰 ${usedPaths.size}종 · registry stale: 알려진 ${baseline.size}건 · 새로 생김 ${newItems.length}건 · 해소됨 ${fixedItems.length}건`);
  if (fixedItems.length) console.log(`  ✅ ${fixedItems.length}건 해소 — \`node scripts/token-drift-check.js --update-baseline\` 로 baseline 줄이기 권장`);

  // 미계측 보고 — 성공/차단 어느 쪽으로 끝나든 반드시 찍는다(조용히 사라지지 않게).
  //   ⚠️ 출력 규약 2가지:
  //     ① gate-check.js:531 의 정규식은 위 요약줄의 `알려진 N건 · 새로 생김 N건 · 해소됨 N건`
  //        연속 구간을 잡는다. 그 줄은 건드리지 말고 **별도 줄**로만 덧붙일 것.
  //     ② gate-check.js:537 의 실패 분기는 `•` 가 든 줄을 실패 항목으로 수집한다.
  //        아래 줄에는 `•` 를 쓰지 않는다(`-` 사용).
  const printScanReport = () => {
    const uninstrumented = scanStats.filter((s) => s.entries === 0 && s.tokenNames > 0);
    const totalEntries = scanStats.reduce((n, s) => n + s.entries, 0);
    console.log(`  ℹ️ 스캔 ${scanStats.length}파일 · 추출 ${totalEntries}엔트리 · 미계측 ${uninstrumented.length}파일`);
    if (uninstrumented.length) {
      console.log('     (아래는 토큰 이름이 있는데 추출 0건 — tokens 가 {name,value} 객체형이 아니라 검사에서 빠짐)');
      uninstrumented.forEach((s) => console.log(`     - ${s.rel} (토큰명 ${s.tokenNames}종)`));
    }
    console.log(`DRIFT_SUMMARY files=${scanStats.length} entries=${totalEntries} uninstrumented=${uninstrumented.length}`);
  };

  if (newItems.length) {
    console.log('  ❌ 새 stale 추가 감지 (차단) — 최신 컴포넌트가 쓰는 토큰만 언급하세요:');
    newItems.forEach((k) => console.log('     • ' + drift.get(k)));
    console.log(`  → ${newItems.length}건.`);
    printScanReport();
    process.exit(1);
  }
  console.log('  ✅ 새 stale 0 — registry 가 최신 컴포넌트 토큰 밖을 더 언급하지 않음 (알려진 backlog 만 잔존)');
  printScanReport();
})();
