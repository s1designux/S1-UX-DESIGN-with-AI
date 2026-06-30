#!/usr/bin/env node
/**
 * gen-foundation-number.js
 *
 * 정본 vars-data.ts FOUNDATION_NUMBER 를 읽어 pages/foundation.html 의 number 차원
 * 데이터 배열(GEN 블록)을 자동 생성한다. 페이지가 정본과 어긋나지 않도록 강제.
 *
 *   vars-data FOUNDATION_NUMBER  ──[gen]──▶  foundation.html { SIZING·FONT_SIZES·LINE_HEIGHTS·OPACITIES·BREAKPOINTS }
 *
 * 대상 차원(각 GEN 마커):
 *   - sizing      → SIZING        (px)
 *   - font-size   → FONT_SIZES    (px)
 *   - line-height → LINE_HEIGHTS  (unitless)
 *   - opacity     → OPACITIES     (unitless)
 *   - breakpoint  → BREAKPOINTS   (px)
 *
 * usage(편집 문구)는 기존 블록에서 var명 기준으로 보존(없으면 빈 문자열).
 *
 * 사용:
 *   node scripts/gen-foundation-number.js --check   # 불일치 시 exit 1 (Gate용)
 *   node scripts/gen-foundation-number.js           # foundation.html 적용
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VARS_DATA = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const FOUNDATION_HTML = path.join(ROOT, 'pages/foundation.html');
const CHECK = process.argv.includes('--check');

// 차원 설정: vars-data 카테고리 → GEN 마커 / 배열명 / 값 프로퍼티
const DIMS = [
  { cat: 'sizing',      marker: 'FOUNDATION-SIZING',     arr: 'SIZING',        prop: 'px'  },
  { cat: 'font-size',   marker: 'FOUNDATION-FONTSIZE',   arr: 'FONT_SIZES',    prop: 'px'  },
  { cat: 'line-height', marker: 'FOUNDATION-LINEHEIGHT', arr: 'LINE_HEIGHTS',  prop: 'val' },
  { cat: 'opacity',     marker: 'FOUNDATION-OPACITY',    arr: 'OPACITIES',     prop: 'val' },
  { cat: 'breakpoint',  marker: 'FOUNDATION-BREAKPOINT', arr: 'BREAKPOINTS',   prop: 'px'  },
];

function foundationNumberBlock() {
  const text = fs.readFileSync(VARS_DATA, 'utf8');
  const i = text.indexOf('const FOUNDATION_NUMBER:');
  const open = text.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}') { depth--; if (depth === 0) return text.slice(open, j + 1); }
  }
  throw new Error('FOUNDATION_NUMBER block not found');
}

// cat 별 항목 수집(선언 순서). 값은 number(정수·소수 모두).
function entriesOf(block, cat) {
  const out = [];
  const re = new RegExp('"' + cat + '\\/([a-z0-9-]+)"\\s*:\\s*([0-9.]+)', 'g');
  for (const m of block.matchAll(re)) out.push({ key: m[1], val: Number(m[2]) });
  return out;
}

function existingUsage(htmlBlock, prop) {
  const usage = {};
  const re = new RegExp("\\{\\s*v:\\s*'(--[a-z0-9-]+)',\\s*" + prop + ":\\s*[0-9.]+,\\s*usage:\\s*'([^']*)'\\s*\\}", 'g');
  for (const m of htmlBlock.matchAll(re)) usage[m[1]] = m[2];
  return usage;
}

function buildOne(html, fnBlock, dim) {
  const START = `/* >>> GEN:${dim.marker} >>>`;
  const END = `/* <<< GEN:${dim.marker} <<< */`;
  const sIdx = html.indexOf(START);
  const eIdx = html.indexOf(END);
  if (sIdx < 0 || eIdx < 0) return null; // 마커 없으면 스킵(해당 차원 미도입)
  const oldBlock = html.slice(sIdx, eIdx + END.length);
  const usageMap = existingUsage(oldBlock, dim.prop);

  const items = entriesOf(fnBlock, dim.cat);
  const rows = items.map(({ key, val }) => {
    const v = `--${dim.cat}-${key}`;
    const usage = usageMap[v] || '';
    return `  { v: '${v}', ${dim.prop}: ${val}, usage: '${usage}' },`;
  });
  const block = `${START} 자동 생성 (npm run number:gen). 수동 편집 금지. */
const ${dim.arr} = [
${rows.join('\n')}
];
${END}`;
  return { oldBlock, block };
}

function main() {
  let html = fs.readFileSync(FOUNDATION_HTML, 'utf8');
  const fnBlock = foundationNumberBlock();
  let changed = 0, missing = [];
  for (const dim of DIMS) {
    const r = buildOne(html, fnBlock, dim);
    if (!r) { missing.push(dim.marker); continue; }
    if (r.oldBlock !== r.block) {
      changed++;
      if (!CHECK) html = html.replace(r.oldBlock, r.block);
    }
  }
  if (missing.length) {
    console.error(`❌ foundation.html 에 GEN 마커 없음: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (changed === 0) {
    process.stderr.write('[number:gen] foundation.html number 차원 5종 정본 일치 ✅\n');
    return;
  }
  if (CHECK) {
    console.error(`❌ foundation.html number 블록 ${changed}개 정본 불일치. \`npm run number:gen\` 실행 필요.`);
    process.exit(1);
  }
  // 헤더 '최종 갱신' 날짜 자동 스탬프 — number 블록이 실제 바뀔 때만(여기는 changed>0 경로).
  // 정적 텍스트가 토큰 변경 후 stale 되던 사각지대를 자동화로 제거. (semantic.html 과 동일 패턴)
  const today = new Date().toISOString().slice(0, 10);
  const re = /(<span data-gen-date>)[^<]*(<\/span>)/;
  const stamped = re.test(html);
  if (stamped) html = html.replace(re, `$1${today}$2`);
  fs.writeFileSync(FOUNDATION_HTML, html, 'utf8');
  process.stderr.write(`[number:gen] foundation.html number 블록 ${changed}개 갱신 ✅` +
    (stamped ? ' · 📅 최종 갱신 날짜 스탬프됨' : ' · ⚠️ data-gen-date 마커 없음') + '\n');
}

main();
