#!/usr/bin/env node
/**
 * gen-semantic-tokens.js
 *
 * Variables(vars-data.ts SEMANTIC_COLOR)를 **정본**으로 tokens.css 의 Semantic 섹션
 * (Light :root + Dark [data-theme="dark"])을 자동 생성한다.
 *
 *   Figma Variables (vars-data.ts)  ──[gen]──▶  tokens.css Semantic 섹션
 *
 * 변환 규칙:
 *   - figma "color/table/cell/default"  → CSS  "--color-table-cell-default"
 *   - alias "blue/400"                  → CSS  "var(--color-blue-400)"
 *   - alias "base/white"/"gray-dark/100"→ CSS  "var(--color-base-white)" / "var(--color-gray-dark-100)"
 *   - "#HEX" / "rgba(...)"              → 리터럴 그대로
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

function block(src, name) {
  const m = src.match(new RegExp('export const ' + name + ':[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};', 'm'));
  return m ? m[1] : '';
}
function aliasToCss(ref) {
  if (/^#/.test(ref) || /^rgba?\(/i.test(ref)) return ref;               // literal hex/rgba
  return `var(--color-${ref.replace(/\//g, '-')})`;                       // foundation alias
}
function figmaToCss(key) { return '--' + key.replace(/\//g, '-'); }       // color/x/y -> --color-x-y

function parseSemantic(src) {
  const b = block(src, 'SEMANTIC_COLOR');
  const re = /"([^"]+)":\s*\{\s*light:\s*"([^"]+)"\s*,\s*dark:\s*"([^"]+)"\s*\}/g;
  const out = [];
  let m;
  while ((m = re.exec(b))) out.push({ key: m[1], light: m[2], dark: m[3] });
  return out;
}

function buildBlock(entries) {
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
  const src = fs.readFileSync(VARS, 'utf-8');
  const entries = parseSemantic(src);
  const blockStr = buildBlock(entries);

  if (PREVIEW) {
    process.stdout.write(blockStr + '\n');
    process.stderr.write(`\n[gen] SEMANTIC_COLOR ${entries.length}개 생성\n`);
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
  console.log(`✅ tokens.css Semantic 섹션 생성 완료 (${entries.length}개 토큰)`);
}

main();
