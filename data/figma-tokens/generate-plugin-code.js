/**
 * 피그마 플러그인 code.js 생성기
 * 실행: node data/figma-tokens/generate-plugin-code.js
 *
 * Primitive 구조:
 *   Collection "Primitive" — 모드: Light / Dark
 *   color/gray/0  → Light: #FAFAFA  Dark: #0D0E12 (gray-dark/0)
 *   color/blue/50 → Light: #E2F1FF  Dark: #0C1D38 (blue-dark/50)
 *   ... (9개 계열 페어링)
 *   color/status-dark/* → 단일 값 (Dark 전용 alias)
 *   color/visual-gray/* → Light 전용
 *   color/visual-gray-dark/* → Dark 전용
 *   color/base/*, color/brand/* → 동일 값 (모드 무관)
 */

const fs   = require('fs');
const path = require('path');

const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sw-design-system.json'), 'utf8')
);

// ── 색상 변환 ───────────────────────────────────────────────
function hexToRgba(hex) {
  const h = hex.replace('#', '');
  return {
    r: +(parseInt(h.slice(0,2), 16) / 255).toFixed(4),
    g: +(parseInt(h.slice(2,4), 16) / 255).toFixed(4),
    b: +(parseInt(h.slice(4,6), 16) / 255).toFixed(4),
    a: 1
  };
}
function rgbaToRgba(str) {
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    r: +(parseInt(m[1]) / 255).toFixed(4),
    g: +(parseInt(m[2]) / 255).toFixed(4),
    b: +(parseInt(m[3]) / 255).toFixed(4),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}
function parseColor(v) {
  if (!v || typeof v !== 'string') return null;
  if (v.startsWith('#'))   return hexToRgba(v);
  if (v.startsWith('rgb')) return rgbaToRgba(v);
  return null;
}

// ── 토큰 평탄화 ────────────────────────────────────────────
function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}/${k}` : k;
    if (v && v.$value !== undefined) {
      out.push({ path: p, value: v.$value, type: v.$type, desc: v.$description || '' });
    } else if (v && typeof v === 'object') {
      out.push(...flatten(v, p));
    }
  }
  return out;
}

// ── Primitive 데이터 분리 ───────────────────────────────────
const prim = tokens.primitive;

// 페어링 맵: lightKey → darkKey (Figma에서 같은 변수 이름, Light/Dark 모드)
// visual-gray Light + visual-gray-dark Dark → color/visual-gray/{step}
const PAIRED_MAP = {
  'gray':        'gray-dark',
  'blue':        'blue-dark',
  'red':         'red-dark',
  'orange':      'orange-dark',
  'yellow':      'yellow-dark',
  'green':       'green-dark',
  'skyblue':     'skyblue-dark',
  'purple':      'purple-dark',
  'brown':       'brown-dark',
  'visual-gray': 'visual-gray-dark',
};

// 페어 팔레트 데이터 생성
const pairedData = {};
for (const [lightKey, darkKey] of Object.entries(PAIRED_MAP)) {
  const lightSteps = prim.color[lightKey]  || {};
  const darkSteps  = prim.color[darkKey]   || {};
  pairedData[lightKey] = [];
  for (const [step, lv] of Object.entries(lightSteps)) {
    if (!lv.$value) continue;
    const dv = darkSteps[step];
    pairedData[lightKey].push({
      step,
      light: lv.$value,
      dark:  dv ? dv.$value : lv.$value,
      desc:  lv.$description || ''
    });
  }
}

// 페어링 안 되는 단독 그룹 (base, brand만 — status-dark 삭제)
const singleGroups = {
  'base':  flatten(prim.color.base  || {}, 'color/base'),
  'brand': flatten(prim.color.brand || {}, 'color/brand'),
};

// ── Semantic ─────────────────────────────────────────────
const lightTokens = flatten(tokens['semantic-light']).filter(t => t.type === 'color');
const darkTokens  = flatten(tokens['semantic-dark']).filter(t => t.type === 'color');
const darkByPath  = Object.fromEntries(darkTokens.map(t => [t.path, t]));

// {primitive.color.gray.50} → 'color/gray/50'
function resolveRef(refStr) {
  return refStr.slice(1, -1).replace(/^primitive\./, '').replace(/\./g, '/');
}

// ── 코드 생성 ───────────────────────────────────────────────
const L = [];

L.push(`// Auto-generated — SW Design System Variables Plugin`);
L.push(`// Primitive: Light/Dark 모드, Semantic: Light/Dark 모드`);
L.push(`figma.showUI(__html__, { width: 300, height: 200 });`);
L.push(``);
L.push(`figma.ui.onmessage = async (msg) => {`);
L.push(`  if (msg.type !== 'CREATE') return;`);
L.push(`  try {`);
L.push(`    const log = t => figma.ui.postMessage({ type: 'LOG', text: t });`);
L.push(``);

// ── Primitive Collection (Light / Dark 모드) ────────────────
L.push(`    // ── Primitive Collection (Light / Dark) ──`);
L.push(`    log('Primitive 생성 중...');`);
L.push(`    const primCol    = figma.variables.createVariableCollection('Primitive');`);
L.push(`    primCol.renameMode(primCol.modes[0].modeId, 'Light');`);
L.push(`    const lightPrimId = primCol.modes[0].modeId;`);
L.push(`    const darkPrimId  = primCol.addMode('Dark');`);
L.push(`    const P = {};`);
L.push(``);

// 페어 팔레트 (10개: gray~brown + visual-gray)
for (const name of Object.keys(PAIRED_MAP)) {
  L.push(`    // ${name}`);
  for (const { step, light, dark, desc } of pairedData[name]) {
    const varPath = `color/${name}/${step}`;
    const q = JSON.stringify(varPath);
    const lc = parseColor(light);
    const dc = parseColor(dark);
    if (!lc || !dc) continue;
    L.push(`    P[${q}] = figma.variables.createVariable(${q}, primCol, 'COLOR');`);
    L.push(`    P[${q}].setValueForMode(lightPrimId, ${JSON.stringify(lc)});`);
    L.push(`    P[${q}].setValueForMode(darkPrimId,  ${JSON.stringify(dc)});`);
    if (desc) L.push(`    P[${q}].description = ${JSON.stringify(desc)};`);
  }
  L.push(``);
}

// 단독 그룹
for (const [groupName, items] of Object.entries(singleGroups)) {
  L.push(`    // ${groupName}`);
  for (const t of items) {
    if (t.type !== 'color') continue;
    const c = parseColor(t.value);
    if (!c) continue;
    const q = JSON.stringify(t.path);
    L.push(`    P[${q}] = figma.variables.createVariable(${q}, primCol, 'COLOR');`);
    L.push(`    P[${q}].setValueForMode(lightPrimId, ${JSON.stringify(c)});`);
    L.push(`    P[${q}].setValueForMode(darkPrimId,  ${JSON.stringify(c)});`);
    if (t.desc) L.push(`    P[${q}].description = ${JSON.stringify(t.desc)};`);
  }
  L.push(``);
}

// ── Semantic Collection (Light / Dark 모드) ─────────────────
L.push(`    // ── Semantic Collection (Light / Dark) ──`);
L.push(`    log('Semantic 생성 중...');`);
L.push(`    const semCol     = figma.variables.createVariableCollection('Semantic');`);
L.push(`    semCol.renameMode(semCol.modes[0].modeId, 'Light');`);
L.push(`    const lightSemId = semCol.modes[0].modeId;`);
L.push(`    const darkSemId  = semCol.addMode('Dark');`);
L.push(``);

for (const lt of lightTokens) {
  const dt = darkByPath[lt.path];
  if (!dt) continue;

  const q = JSON.stringify(lt.path);
  L.push(`    {`);
  L.push(`      const v = figma.variables.createVariable(${q}, semCol, 'COLOR');`);
  if (lt.desc) L.push(`      v.description = ${JSON.stringify(lt.desc)};`);

  // Light 값
  if (lt.value.startsWith('{')) {
    const ref = resolveRef(lt.value);
    L.push(`      v.setValueForMode(lightSemId, figma.variables.createVariableAlias(P[${JSON.stringify(ref)}]));`);
  } else {
    const c = parseColor(lt.value);
    if (c) L.push(`      v.setValueForMode(lightSemId, ${JSON.stringify(c)});`);
  }

  // Dark 값
  if (dt.value.startsWith('{')) {
    const ref = resolveRef(dt.value);
    L.push(`      v.setValueForMode(darkSemId, figma.variables.createVariableAlias(P[${JSON.stringify(ref)}]));`);
  } else {
    const c = parseColor(dt.value);
    if (c) L.push(`      v.setValueForMode(darkSemId, ${JSON.stringify(c)});`);
  }

  L.push(`    }`);
}

L.push(``);
L.push(`    const result = [`);
L.push(`      '✅ Variables 생성 완료!',`);
L.push(`      'Primitive : ' + primCol.variableIds.length + '개 (Light/Dark 모드)',`);
L.push(`      'Semantic  : ' + semCol.variableIds.length + '개 (Light/Dark 모드)'`);
L.push(`    ].join('\\n');`);
L.push(`    figma.ui.postMessage({ type: 'DONE', text: result });`);
L.push(`    figma.notify('✅ SW Design System Variables 생성 완료!');`);
L.push(`  } catch(e) {`);
L.push(`    figma.ui.postMessage({ type: 'ERROR', text: e.message });`);
L.push(`  }`);
L.push(`};`);

// ── 저장 ───────────────────────────────────────────────────
const output  = L.join('\n');
const outPath = path.join(__dirname, 'figma-plugin', 'code.js');
fs.writeFileSync(outPath, output, 'utf8');

// 통계
let primCount = 0;
for (const name of Object.keys(PAIRED_MAP)) primCount += pairedData[name].length;
for (const items of Object.values(singleGroups)) primCount += items.filter(t => t.type === 'color').length;

console.log(`✅ 생성 완료: data/figma-tokens/figma-plugin/code.js`);
console.log(`   Primitive : ${primCount}개 변수 (Light/Dark 두 모드)`);
console.log(`   Semantic  : ${lightTokens.length}개 변수 (Light/Dark 두 모드)`);
console.log(`\n구조:`);
console.log(`   Primitive — color/gray/0  Light:#FAFAFA  Dark:#0D0E12`);
console.log(`   Primitive — color/blue/50 Light:#E2F1FF  Dark:#0C1D38`);
console.log(`   Semantic  — color/bg/default → alias(gray/50) per mode`);
