#!/usr/bin/env node
/**
 * Token Value Consistency Check  (Gate 7)
 *
 * 토큰 "값"이 표면 간에 실제로 일치하는지 기계적으로 판정한다.
 * token-sync 에이전트(작업자)가 빠뜨려도 이 Gate(검사기)가 잡는다.
 *
 * Check A — tokens.css ↔ vars-data.ts (설치기)
 *   두 파일에 동일 이름으로 존재하는 semantic 토큰만 비교(교집합).
 *   양쪽을 각각 Foundation HEX까지 해석(resolve)해 Light/Dark 모두 대조.
 *   tokens.css는 semantic→semantic→foundation 체인을 따라가고,
 *   vars-data는 foundation 팔레트(gray/100)를 FOUNDATION_COLOR HEX로 해석.
 *   → 불일치 = 설치기 zip이 가이드와 다른 색을 심는다는 뜻 = ERROR.
 *
 * Check B — pages/semantic.html resolved hex ↔ tokens.css
 *   semantic.html 표에 하드코딩된 light/dark HEX가 tokens.css 해석값과 같은지.
 *   → 불일치 = 문서 표가 stale = ERROR.
 *
 * 사용:
 *   node scripts/token-value-consistency-check.js          # 단독 실행(리포트)
 *   require('./token-value-consistency-check').check()     # gate-check.js에서 호출
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_CSS   = path.join(ROOT, 'assets/css/tokens.css');
const VARS_DATA    = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const SEMANTIC_HTML = path.join(ROOT, 'pages/semantic.html');

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

// ── tokens.css 파서 ────────────────────────────────
// :root 블록(들) = Light, [data-theme="dark"] 블록 = Dark override.
function parseTokensCss() {
  const text = fs.readFileSync(TOKENS_CSS, 'utf8');
  const light = {};   // var → raw value (hex or var(--x))
  const dark  = {};
  let mode = null;    // 'light' | 'dark' | null
  for (let line of text.split('\n')) {
    const stripped = line.replace(/\/\*.*?\*\//g, '').trim();   // inline 주석 제거
    if (/\[data-theme="dark"\]\s*\{/.test(stripped)) { mode = 'dark'; continue; }
    if (/:root\s*\{/.test(stripped))                 { mode = 'light'; continue; }
    if (stripped === '}')                            { mode = null; continue; }
    if (!mode) continue;
    const m = stripped.match(/^(--[\w-]+)\s*:\s*([^;]+);/);
    if (!m) continue;
    (mode === 'dark' ? dark : light)[m[1]] = m[2].trim();
  }
  return { light, dark };
}

// var() 체인을 따라 Foundation HEX까지 해석. 못 풀면 null.
function makeResolver({ light, dark }) {
  return function resolve(varName, isDark, seen = new Set()) {
    if (seen.has(varName)) return null;             // 순환 가드
    seen.add(varName);
    let val = (isDark && dark[varName] !== undefined) ? dark[varName] : light[varName];
    if (val === undefined) val = light[varName];    // foundation(gray-dark-*)은 light맵에만 존재
    if (val === undefined) return null;
    val = val.trim();
    const ref = val.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (ref) return resolve(ref[1], isDark, seen);
    if (HEX_RE.test(val)) return val.toUpperCase();
    return val;                                     // rgba 등 리터럴 — 그대로 반환
  };
}

// ── vars-data.ts 파서 ────────────────────────────────
function parseVarsData() {
  const text = fs.readFileSync(VARS_DATA, 'utf8');

  // FOUNDATION_COLOR: "key": "#HEX"
  const foundationHex = {};
  const fStart = text.indexOf('FOUNDATION_COLOR');
  const fBlock = text.slice(fStart, text.indexOf('};', fStart));
  for (const m of fBlock.matchAll(/"([^"]+)"\s*:\s*"(#[0-9a-fA-F]{3,8})"/g)) {
    foundationHex[m[1]] = m[2].toUpperCase();
  }

  // SEMANTIC_COLOR: "key": { light: "x/y", dark: "a/b" }
  const semantic = {};
  const sStart = text.indexOf('SEMANTIC_COLOR:');
  const sBlock = sStart >= 0 ? text.slice(sStart) : '';
  for (const m of sBlock.matchAll(/"([^"]+)"\s*:\s*\{\s*light:\s*"([^"]+)"\s*,\s*dark:\s*"([^"]+)"\s*\}/g)) {
    semantic[m[1]] = { light: m[2], dark: m[3] };
  }
  // 침묵 누락 방어(2026-07-31): 위 정규식은 "한 줄·light 먼저" 서식을 전제하고,
  // sStart 가 -1 이면 sBlock 이 빈 문자열이 된다. 어느 쪽이든 semantic 이 조용히 비어
  // Check A 루프가 0회 돌고 mismatches 도 0 이라 ✅ 로 통과해버린다(Check B 는 vars-data 를
  // 읽지 않아 계속 정상 건수를 찍으므로 착시가 생긴다). 블록 안의 "color/…" 키 개수와
  // 파싱 개수가 다르면 요란하게 실패한다. dark-divergence-check.js:81-86 과 동일한 방어.
  //   선언부 자체를 못 찾은 경우(sStart < 0)는 keyCount·parsed 가 둘 다 0 이라 개수 대조를
  //   빠져나가므로 따로 막는다.
  if (sStart < 0) {
    throw new Error('SEMANTIC_COLOR 선언부를 vars-data.ts 에서 찾지 못함 (이름 변경/삭제 의심). 검사를 신뢰할 수 없어 중단.');
  }
  const sEnd = sBlock.indexOf('};');
  const keyCount = [...(sEnd >= 0 ? sBlock.slice(0, sEnd) : sBlock).matchAll(/"color\/[^"]+"\s*:/g)].length;
  const parsed = Object.keys(semantic).length;
  if (keyCount !== parsed) {
    throw new Error(`SEMANTIC_COLOR 파싱 누락 — 블록 내 키 ${keyCount}개 중 ${parsed}개만 파싱됨 (vars-data.ts 서식 변경 의심). 검사를 신뢰할 수 없어 중단.`);
  }
  return { foundationHex, semantic };
}

// ── semantic.html 파서 ────────────────────────────────
function parseSemanticHtml() {
  const text = fs.readFileSync(SEMANTIC_HTML, 'utf8');
  const rows = [];
  const re = /\{\s*v:\s*'(--color-[\w-]+)'[^}]*?light:\s*'(#[0-9a-fA-F]{3,8})'[^}]*?dark:\s*'(#[0-9a-fA-F]{3,8})'/g;
  for (const m of text.matchAll(re)) {
    rows.push({ v: m[1], light: m[2].toUpperCase(), dark: m[3].toUpperCase() });
  }
  return rows;
}

// ── 메인 검사 ────────────────────────────────
function check() {
  const css = parseTokensCss();
  const resolve = makeResolver(css);
  const { foundationHex, semantic } = parseVarsData();
  const htmlRows = parseSemanticHtml();

  const A = { compared: 0, mismatches: [], skipped: 0 };
  for (const [figmaKey, refs] of Object.entries(semantic)) {
    const cssVar = '--' + figmaKey.replace(/\//g, '-');
    if (css.light[cssVar] === undefined) continue;          // 교집합 아님 → 비교 안 함
    const tcLight = resolve(cssVar, false);
    const tcDark  = resolve(cssVar, true);
    const vdLight = foundationHex[refs.light];
    const vdDark  = foundationHex[refs.dark];
    if (vdLight === undefined && vdDark === undefined) { A.skipped++; continue; }
    A.compared++;
    if (vdLight && tcLight && tcLight !== vdLight) {
      A.mismatches.push({ token: cssVar, mode: 'light', tokensCss: tcLight, varsData: `${refs.light}=${vdLight}` });
    }
    if (vdDark && tcDark && tcDark !== vdDark) {
      A.mismatches.push({ token: cssVar, mode: 'dark', tokensCss: tcDark, varsData: `${refs.dark}=${vdDark}` });
    }
  }
  // 추출 0건 = 검증 안 됨(✅ 아님) — token-sync-monitor.js:249 의 unmonitored 판정 기준을
  // 그대로 쓰되, 이쪽은 vars-data 대조 경로가 이 루프 하나뿐이라 경고가 아니라 중단으로 처리한다.
  // (파싱은 됐는데 tokens.css 와 교집합이 0 인 경우 — 이름 규칙이 바뀌면 여기서 걸린다.)
  if (A.compared === 0) {
    throw new Error(`Check A 비교 0건 — tokens.css ↔ vars-data 교집합 없음 (semantic ${Object.keys(semantic).length}종 · skip ${A.skipped}). 검사를 신뢰할 수 없어 중단.`);
  }

  const B = { compared: 0, mismatches: [] };
  for (const row of htmlRows) {
    if (css.light[row.v] === undefined) continue;
    const tcLight = resolve(row.v, false);
    const tcDark  = resolve(row.v, true);
    B.compared++;
    if (tcLight && HEX_RE.test(tcLight) && tcLight !== row.light) {
      B.mismatches.push({ token: row.v, mode: 'light', tokensCss: tcLight, semanticHtml: row.light });
    }
    if (tcDark && HEX_RE.test(tcDark) && tcDark !== row.dark) {
      B.mismatches.push({ token: row.v, mode: 'dark', tokensCss: tcDark, semanticHtml: row.dark });
    }
  }

  return { A, B };
}

module.exports = { check, parseTokensCss, makeResolver, parseVarsData, SEMANTIC_HTML };

// ── 단독 실행(CLI) ────────────────────────────────
if (require.main === module) {
  const { A, B } = check();
  console.log('\n🔗 Token Value Consistency Check\n');

  console.log(`[Check A] tokens.css ↔ vars-data.ts (설치기)  — 비교 ${A.compared}건, 교집합외 skip ${A.skipped}`);
  if (A.mismatches.length === 0) {
    console.log('  ✅ 모든 공통 토큰 값 일치 (Light/Dark)');
  } else {
    for (const m of A.mismatches) {
      console.error(`  ❌ ${m.token} [${m.mode}]  tokens.css=${m.tokensCss}  ≠  vars-data ${m.varsData}`);
    }
  }

  console.log(`\n[Check B] semantic.html resolved hex ↔ tokens.css  — 비교 ${B.compared}건`);
  if (B.mismatches.length === 0) {
    console.log('  ✅ semantic.html 표 HEX 모두 tokens.css와 일치');
  } else {
    for (const m of B.mismatches) {
      console.error(`  ❌ ${m.token} [${m.mode}]  tokens.css=${m.tokensCss}  ≠  semantic.html=${m.semanticHtml}`);
    }
  }

  const total = A.mismatches.length + B.mismatches.length;
  console.log('\n─────────────────────────────────────────────────────');
  if (total > 0) {
    console.error(`Consistency FAILED — ${total} mismatch(es)\n`);
    process.exit(1);
  }
  console.log('Consistency PASSED — 모든 표면 값 일치\n');
  process.exit(0);
}
