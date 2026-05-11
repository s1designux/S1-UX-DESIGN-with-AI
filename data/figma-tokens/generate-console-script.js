/**
 * 피그마 콘솔 스크립트 생성기
 * 실행: node data/figma-tokens/generate-console-script.js
 * 결과: data/figma-tokens/figma-console.js (이 파일을 피그마 콘솔에 붙여넣기)
 */

const fs   = require('fs');
const path = require('path');

const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sw-design-system.json'), 'utf8')
);

function hexToRgba(hex) {
  const h = hex.replace('#', '');
  return {
    r: +(parseInt(h.slice(0,2), 16) / 255).toFixed(4),
    g: +(parseInt(h.slice(2,4), 16) / 255).toFixed(4),
    b: +(parseInt(h.slice(4,6), 16) / 255).toFixed(4),
    a: 1
  };
}

function rgbaStringToRgba(str) {
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    r: +(parseInt(m[1]) / 255).toFixed(4),
    g: +(parseInt(m[2]) / 255).toFixed(4),
    b: +(parseInt(m[3]) / 255).toFixed(4),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}

function parseColor(value) {
  if (value.startsWith('#'))   return hexToRgba(value);
  if (value.startsWith('rgb')) return rgbaStringToRgba(value);
  return null;
}

function flatten(obj, prefix = '') {
  const result = [];
  for (const [key, val] of Object.entries(obj)) {
    const p = prefix ? `${prefix}/${key}` : key;
    if (val && val.$value !== undefined) {
      result.push({ path: p, value: val.$value, type: val.$type, desc: val.$description || '' });
    } else if (val && typeof val === 'object') {
      result.push(...flatten(val, p));
    }
  }
  return result;
}

const primitiveTokens = flatten(tokens.primitive).filter(t => t.type === 'color');
const lightTokens     = flatten(tokens['semantic-light']).filter(t => t.type === 'color');
const darkTokens      = flatten(tokens['semantic-dark']).filter(t => t.type === 'color');
const darkByPath      = Object.fromEntries(darkTokens.map(t => [t.path, t]));

// primitive path → 변수 이름 매핑용
const primPathSet = new Set(primitiveTokens.map(t => t.path));

function resolveRef(refStr) {
  // {primitive.color.gray.0} → color/gray/0
  const inner      = refStr.slice(1, -1);
  const withoutSet = inner.replace(/^primitive\./, '');
  return withoutSet.replace(/\./g, '/');
}

// ── 콘솔 스크립트 생성 ─────────────────────────────────────
const lines = [];

lines.push(`// SW Design System — Figma Variables 자동 생성 스크립트`);
lines.push(`// 피그마 메뉴 → Plugins → Development → Open Console 에서 붙여넣기 후 실행`);
lines.push(`(async () => {`);
lines.push(`  const delay = ms => new Promise(r => setTimeout(r, ms));`);
lines.push(``);

// ── Primitive Collection ────────────────────────────────────
lines.push(`  // ── 1. Primitive Collection ──`);
lines.push(`  const primCol = figma.variables.createVariableCollection('Primitive');`);
lines.push(`  primCol.renameMode(primCol.modes[0].modeId, 'Value');`);
lines.push(`  const primModeId = primCol.modes[0].modeId;`);
lines.push(`  const primVars = {};`);
lines.push(``);

for (const t of primitiveTokens) {
  const color = parseColor(t.value);
  if (!color) continue;
  const safeKey = t.path.replace(/[^a-zA-Z0-9]/g, '_');
  lines.push(`  primVars['${t.path}'] = figma.variables.createVariable('${t.path}', primCol, 'COLOR');`);
  lines.push(`  primVars['${t.path}'].setValueForMode(primModeId, ${JSON.stringify(color)});`);
  if (t.desc) {
    lines.push(`  primVars['${t.path}'].description = ${JSON.stringify(t.desc)};`);
  }
}

lines.push(``);

// ── Semantic Collection ─────────────────────────────────────
lines.push(`  // ── 2. Semantic Collection (Light / Dark) ──`);
lines.push(`  const semCol = figma.variables.createVariableCollection('Semantic');`);
lines.push(`  semCol.renameMode(semCol.modes[0].modeId, 'Light');`);
lines.push(`  const lightModeId = semCol.modes[0].modeId;`);
lines.push(`  const darkModeId  = semCol.addMode('Dark');`);
lines.push(``);

for (const lt of lightTokens) {
  const dt = darkByPath[lt.path];
  if (!dt) continue;

  lines.push(`  {`);
  lines.push(`    const v = figma.variables.createVariable('${lt.path}', semCol, 'COLOR');`);
  if (lt.desc) lines.push(`    v.description = ${JSON.stringify(lt.desc)};`);

  // Light value
  if (lt.value.startsWith('{')) {
    const refPath = resolveRef(lt.value);
    lines.push(`    v.setValueForMode(lightModeId, { type: 'VARIABLE_ALIAS', id: primVars['${refPath}'].id });`);
  } else {
    const color = parseColor(lt.value);
    if (color) lines.push(`    v.setValueForMode(lightModeId, ${JSON.stringify(color)});`);
  }

  // Dark value
  if (dt.value.startsWith('{')) {
    const refPath = resolveRef(dt.value);
    lines.push(`    v.setValueForMode(darkModeId, { type: 'VARIABLE_ALIAS', id: primVars['${refPath}'].id });`);
  } else {
    const color = parseColor(dt.value);
    if (color) lines.push(`    v.setValueForMode(darkModeId, ${JSON.stringify(color)});`);
  }

  lines.push(`  }`);
}

lines.push(``);
lines.push(`  console.log('✅ Variables 생성 완료!');`);
lines.push(`  console.log('  Primitive:', primCol.variableIds.length, '개');`);
lines.push(`  console.log('  Semantic:', semCol.variableIds.length, '개 (Light/Dark)');`);
lines.push(`})();`);

// ── 파일 저장 ──────────────────────────────────────────────
const output = lines.join('\n');
const outPath = path.join(__dirname, 'figma-console.js');
fs.writeFileSync(outPath, output, 'utf8');

const lineCount = lines.length;
console.log(`✅ 생성 완료: data/figma-tokens/figma-console.js`);
console.log(`   Primitive Variables : ${primitiveTokens.length}개`);
console.log(`   Semantic Variables  : ${lightTokens.length}개 (Light/Dark)`);
console.log(`   총 줄 수            : ${lineCount}줄`);
console.log(`\n다음 단계:`);
console.log(`  1. figma-console.js 파일 전체 복사`);
console.log(`  2. 피그마 → Plugins → Development → Open Console`);
console.log(`  3. 콘솔창에 붙여넣기 → Enter`);
