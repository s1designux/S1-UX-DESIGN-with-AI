#!/usr/bin/env node
/**
 * gen-semantic-tokens.js
 *
 * Variables(vars-data.ts SEMANTIC_COLOR + SEMANTIC_SHADOW)를 **정본**으로 tokens.css 의
 * Semantic 섹션(Light :root + Dark [data-theme="dark"])을 자동 생성한다.
 *
 *   Figma Variables (vars-data.ts)  ──[gen]──▶  tokens.css Semantic 섹션
 *
 * 변환 규칙 (색):
 *   - figma "color/table/cell/default"  → CSS  "--color-table-cell-default"
 *   - alias "blue/400"                  → CSS  "var(--color-blue-400)"
 *   - alias "base/white"/"gray-dark/100"→ CSS  "var(--color-base-white)" / "var(--color-gray-dark-100)"
 *   - "#HEX" / "rgba(...)"              → 리터럴 그대로
 *
 * 변환 규칙 (그림자 — 2026-07-29 신설):
 *   - figma "shadow/raised"             → CSS  "--shadow-raised"
 *   - 값은 **완성된 box-shadow 문자열**이라 aliasToCss 를 절대 태우지 않고 raw 그대로 출력한다.
 *     (색 경로로 보내면 var(--color-0 4px 16px …) 로 뭉개진다 — 백로그 6표면 #2 진단)
 *   - 2겹 값의 콤마는 vars-data 에서 따옴표 안에 있고, 파서가 "…" 통째로 캡처하며,
 *     출력도 문자열 그대로 붙이므로 어느 단계에서도 콤마로 쪼개지지 않는다.
 *
 * 사용:
 *   node scripts/gen-semantic-tokens.js --preview   # 생성 결과를 stdout 으로 출력(파일 미변경)
 *   node scripts/gen-semantic-tokens.js             # tokens.css 의 마커 사이를 교체(=적용)
 *
 * tokens.css 마커(적용 모드):
 *   /​* >>> GEN:SEMANTIC >>> *​/  …생성 본문…  /​* <<< GEN:SEMANTIC <<< *​/
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const VARS = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const TOKENS_CSS = path.join(ROOT, 'assets/css/tokens.css');

const PREVIEW = process.argv.includes('--preview');

// 2026-08-01 Phase 1: 소스 텍스트 정규식 긁기 → 공용 로더(esbuild 모듈 로드) 이관.
//   종전 block() 정규식은 "주석에 상수명이 등장하면 먼저 걸리는" 결합이 있었고,
//   2026-07-29 실제로 색 토큰 400여 개가 통째로 유실됐다. 모듈 로드는 그 결합이 없다.
const { loadVarsData } = require('./lib/load-vars-data');

function aliasToCss(ref) {
  if (/^#/.test(ref) || /^rgba?\(/i.test(ref)) return ref;               // literal hex/rgba
  return `var(--color-${ref.replace(/\//g, '-')})`;                       // foundation alias
}
function figmaToCss(key) { return '--' + key.replace(/\//g, '-'); }       // color/x/y -> --color-x-y

// 모듈 객체 → {key, light, dark}[] (선언 순서 = 객체 삽입 순서 보존)
function parseEntries(obj) {
  const out = [];
  for (const [key, e] of Object.entries(obj || {})) {
    if (e && typeof e.light === 'string' && typeof e.dark === 'string') out.push({ key, light: e.light, dark: e.dark });
  }
  return out;
}

function buildBlock(entries, shadows) {
  // group by category = 2nd path segment (color/<cat>/...)
  const groups = new Map();
  for (const e of entries) {
    const cat = e.key.split('/')[1] || 'misc';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(e);
  }
  const lightLines = [], darkLines = [];
  // align name width per group for readability
  for (const [cat, list] of groups) {
    lightLines.push(`  /* ── ${cat} ── */`);
    darkLines.push(`  /* ── ${cat} ── */`);
    const w = Math.max(...list.map(e => figmaToCss(e.key).length));
    for (const e of list) {
      const name = figmaToCss(e.key).padEnd(w);
      lightLines.push(`  ${name}: ${aliasToCss(e.light)};`);
      darkLines.push(`  ${name}: ${aliasToCss(e.dark)};`);
    }
    lightLines.push('');
    darkLines.push('');
  }

  // ── shadow — 색 그룹 뒤에 별도 그룹으로 붙인다 ──────────────────────────────
  // 색과 달리 값을 aliasToCss 로 감싸지 않는다(완성된 box-shadow 문자열이므로 raw 출력).
  // 그룹 키도 색처럼 "2번째 경로 세그먼트"로 묶으면 shadow/raised → 'raised' 로 흩어지므로
  // 경로 1번째 세그먼트(shadow) 하나로 고정한다.
  if (shadows && shadows.length) {
    lightLines.push(`  /* ── shadow ── */`);
    darkLines.push(`  /* ── shadow ── */`);
    const w = Math.max(...shadows.map(e => figmaToCss(e.key).length));
    for (const e of shadows) {
      const name = figmaToCss(e.key).padEnd(w);
      lightLines.push(`  ${name}: ${e.light};`);   // raw — aliasToCss 태우지 않음
      darkLines.push(`  ${name}: ${e.dark};`);     // raw — 2겹 콤마 문자열 그대로
    }
    lightLines.push('');
    darkLines.push('');
  }

  const stamp = `Auto-generated from vars-data.ts (npm run tokens:gen) — Variables 정본. 수동 편집 금지.`;
  return `/* >>> GEN:SEMANTIC >>> ${stamp} */
/* ══════════════════════════════════════════════════
   SEMANTIC TOKENS — Light (Variables 기준 자동 생성)
   ══════════════════════════════════════════════════ */
:root {
${lightLines.join('\n').replace(/\n+$/, '')}
}

/* ══════════════════════════════════════════════════
   SEMANTIC TOKENS — Dark (Variables 기준 자동 생성)
   ══════════════════════════════════════════════════ */
[data-theme="dark"] {
${darkLines.join('\n').replace(/\n+$/, '')}
}
/* <<< GEN:SEMANTIC <<< */`;
}

function main() {
  // "추출 0건 = 안 됨" 원칙(Gate 17/19)은 로더가 집행한다(0건/급감 시 throw).
  const V = loadVarsData();
  const entries = parseEntries(V.SEMANTIC_COLOR);
  const shadows = parseEntries(V.SEMANTIC_SHADOW);
  const blockStr = buildBlock(entries, shadows);

  if (PREVIEW) {
    process.stdout.write(blockStr + '\n');
    process.stderr.write(`\n[gen] SEMANTIC_COLOR ${entries.length}개 + SEMANTIC_SHADOW ${shadows.length}개 생성\n`);
    return;
  }

  let css = fs.readFileSync(TOKENS_CSS, 'utf-8');
  const RE = /\/\* >>> GEN:SEMANTIC >>>[\s\S]*?<<< GEN:SEMANTIC <<< \*\//;
  if (!RE.test(css)) {
    console.error('❌ tokens.css 에 GEN:SEMANTIC 마커가 없습니다. 최초 1회는 수동으로 마커 위치를 잡아야 합니다.');
    process.exit(1);
  }
  css = css.replace(RE, blockStr);
  fs.writeFileSync(TOKENS_CSS, css, 'utf-8');
  console.log(`✅ tokens.css Semantic 섹션 생성 완료 (color ${entries.length}개 + shadow ${shadows.length}개)`);
}

main();
