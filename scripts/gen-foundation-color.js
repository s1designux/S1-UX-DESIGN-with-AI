#!/usr/bin/env node
/**
 * gen-foundation-color.js
 *
 * 정본 vars-data.ts FOUNDATION_COLOR 를 읽어 pages/foundation.html 의 색상 데이터
 * 배열(BRAND · PALETTES · DARK_PALETTES)을 자동 생성한다. gen-foundation-number.js 와
 * 동일한 마커 치환 + --check + --preview 패턴.
 *
 *   vars-data FOUNDATION_COLOR  ──[gen]──▶  foundation.html { BRAND · PALETTES · DARK_PALETTES }
 *
 * 마커: /* >>> GEN:FOUNDATION-COLOR >>> ... <<< GEN:FOUNDATION-COLOR <<< *​/  (세 배열을 한 블록으로)
 *
 * 관할/보존 규칙:
 *   - BRAND: hex 만 vars-data 에서 생성. label·desc(사람이 쓴 문구)는 기존 블록에서 cssVar 기준 보존.
 *   - PALETTES(light): 소문자 hex. 키필드 폭 14 정렬(기존 파일 관례).
 *   - DARK_PALETTES: 대문자 hex. 키필드 폭 17 정렬(긴 키는 +1 space, 기존 파일 관례).
 *   - base/*(white·black)는 이 세 배열에 렌더되지 않으므로 제외.
 *   - 마커 밖(FONT_WEIGHTS·number GEN 블록 등)은 한 글자도 안 건드림.
 *
 * 사용:
 *   node scripts/gen-foundation-color.js --preview   # 생성 블록 + 실제 diff 출력(파일 미변경)
 *   node scripts/gen-foundation-color.js --check      # 불일치 시 exit 1 (Gate용)
 *   node scripts/gen-foundation-color.js              # foundation.html 적용
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VARS_DATA = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const FOUNDATION_HTML = path.join(ROOT, 'pages/foundation.html');
const CHECK = process.argv.includes('--check');
const PREVIEW = process.argv.includes('--preview');

const MARK_START = '/* >>> GEN:FOUNDATION-COLOR >>> 자동 생성 (npm run color:gen). 수동 편집 금지. */';
const MARK_END = '/* <<< GEN:FOUNDATION-COLOR <<< */';

const LIGHT_PAD = 14; // 기존 파일 관례: light 키필드 폭
const DARK_PAD = 17;  // 기존 파일 관례: dark 키필드 폭(긴 키는 초과 시 +1 space)

// ── vars-data FOUNDATION_COLOR 블록 추출 ──────────────────────────────────
function foundationColorBlock() {
  const text = fs.readFileSync(VARS_DATA, 'utf8');
  const i = text.indexOf('const FOUNDATION_COLOR:');
  const open = text.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}') { depth--; if (depth === 0) return text.slice(open, j + 1); }
  }
  throw new Error('FOUNDATION_COLOR block not found');
}

// "group/step": "#HEX" 를 선언 순서대로 수집
function parseColorEntries(block) {
  const out = [];
  const re = /"([a-z0-9-]+)\/([a-z0-9-]+)"\s*:\s*"(#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\))"/g;
  for (const m of block.matchAll(re)) out.push({ group: m[1], step: m[2], hex: m[3] });
  return out;
}

// ── BRAND 기존 label/desc 보존용 파서 ─────────────────────────────────────
function parseExistingBrand(regionText) {
  const map = {};
  const re = /\{\s*label:\s*'([^']*)',\s*cssVar:\s*'(--[a-z0-9-]+)',\s*hex:\s*'[^']*',\s*desc:\s*'([^']*)'\s*\}/g;
  for (const m of regionText.matchAll(re)) map[m[2]] = { label: m[1], desc: m[3] };
  return map;
}

function padToCol(s, col) {
  return s.length >= col ? s + ' ' : s + ' '.repeat(col - s.length);
}
function identKey(name) {
  return /^[a-z][a-z0-9]*$/.test(name) ? `${name}:` : `'${name}':`;
}
function padKey(keyField, pad) {
  return keyField.length > pad ? keyField + ' ' : keyField.padEnd(pad);
}
function tuples(steps, upper) {
  return '[' + steps.map(([s, h]) => `['${s}','${upper ? h.toUpperCase() : h.toLowerCase()}']`).join(',') + ']';
}

function buildBlock(entries, brandProse) {
  // 그룹화
  const brand = [];
  const light = new Map();  // group -> [[step,hex]]
  const dark = new Map();   // group -> [[step,hex]]
  for (const { group, step, hex } of entries) {
    if (group === 'base') continue;            // base/white·black 는 이 배열에 미렌더 → 제외
    if (group === 'brand') { brand.push({ step, hex }); continue; }
    const bucket = group.endsWith('-dark') ? dark : light;
    if (!bucket.has(group)) bucket.set(group, []);
    bucket.get(group).push([step, hex]);
  }

  // BRAND
  const brandLines = brand.map(({ step, hex }) => {
    const cssVar = `--color-brand-${step}`;
    const prose = brandProse[cssVar] || { label: '', desc: '' };
    let s = `  { label: '${prose.label}',`;
    s = padToCol(s, 26);
    s += `cssVar: '${cssVar}',`;
    s = padToCol(s, 56);
    s += `hex: '${hex.toLowerCase()}',`;
    s = padToCol(s, 72);
    s += `desc: '${prose.desc}' },`;
    return s;
  });

  // PALETTES (light) — 소문자, pad 14
  const lightLines = [...light.entries()].map(([group, steps]) =>
    `  ${padKey(identKey(group), LIGHT_PAD)}${tuples(steps, false)},`
  );

  // DARK_PALETTES — 대문자, pad 17
  const darkLines = [...dark.entries()].map(([group, steps]) =>
    `  ${padKey(identKey(group), DARK_PAD)}${tuples(steps, true)},`
  );

  return [
    MARK_START,
    'const BRAND = [',
    ...brandLines,
    '];',
    '',
    'const PALETTES = {',
    ...lightLines,
    '};',
    '',
    'const DARK_PALETTES = {',
    ...darkLines,
    '};',
    MARK_END,
  ].join('\n');
}

// 기존 블록 영역(마커 유무 모두) 찾기 → [start,end)
function locateRegion(html) {
  const sMark = html.indexOf(MARK_START);
  if (sMark >= 0) {
    const eMark = html.indexOf(MARK_END);
    if (eMark < 0) throw new Error('시작 마커는 있는데 종료 마커가 없음');
    return { start: sMark, end: eMark + MARK_END.length, hadMarkers: true };
  }
  // 부트스트랩(마커 없음): const BRAND = [ ... DARK_PALETTES = {...}; 까지
  const bStart = html.indexOf('const BRAND = [');
  if (bStart < 0) throw new Error('const BRAND = [ 를 못 찾음');
  const dIdx = html.indexOf('const DARK_PALETTES = {', bStart);
  if (dIdx < 0) throw new Error('const DARK_PALETTES = { 를 못 찾음');
  const close = html.indexOf('\n};', dIdx);
  if (close < 0) throw new Error('DARK_PALETTES 종료 }; 를 못 찾음');
  return { start: bStart, end: close + 3, hadMarkers: false };
}

function main() {
  const html = fs.readFileSync(FOUNDATION_HTML, 'utf8');
  const entries = parseColorEntries(foundationColorBlock());
  const region = locateRegion(html);
  const oldRegion = html.slice(region.start, region.end);
  const brandProse = parseExistingBrand(oldRegion);
  const newBlock = buildBlock(entries, brandProse);
  const newHtml = html.slice(0, region.start) + newBlock + html.slice(region.end);

  if (PREVIEW) {
    process.stderr.write(`[color:gen --preview] FOUNDATION_COLOR ${entries.length}개 파싱 · 마커 ${region.hadMarkers ? '있음(교체)' : '없음(최초 도입)'}\n\n`);
    console.log('========== 생성될 GEN:FOUNDATION-COLOR 블록 전체 ==========');
    console.log(newBlock);
    console.log('\n========== 현재 foundation.html 과의 실제 diff ==========');
    const tmp = path.join(require('os').tmpdir(), 'foundation.preview.html');
    fs.writeFileSync(tmp, newHtml, 'utf8');
    try {
      const out = execSync(`git --no-pager diff --no-index -- "${FOUNDATION_HTML}" "${tmp}" || true`, { encoding: 'utf8' });
      console.log(out.trim() ? out : '(diff 없음 — 완전 동일)');
    } finally { fs.unlinkSync(tmp); }
    console.log('\n[preview 전용 — foundation.html 은 전혀 수정하지 않았습니다]');
    return;
  }

  if (oldRegion === newBlock) {
    process.stderr.write('[color:gen] foundation.html 색상 배열 정본 일치 ✅\n');
    return;
  }
  if (CHECK) {
    console.error('❌ foundation.html 색상 배열이 정본과 불일치. `npm run color:gen` 실행 필요.');
    process.exit(1);
  }
  let finalHtml = newHtml;
  const today = new Date().toISOString().slice(0, 10);
  const re = /(<span data-gen-date>)[^<]*(<\/span>)/;
  const stamped = re.test(finalHtml);
  if (stamped) finalHtml = finalHtml.replace(re, `$1${today}$2`);
  fs.writeFileSync(FOUNDATION_HTML, finalHtml, 'utf8');
  process.stderr.write(`[color:gen] foundation.html 색상 배열 갱신 ✅${stamped ? ' · 📅 날짜 스탬프됨' : ''}\n`);
}

main();
