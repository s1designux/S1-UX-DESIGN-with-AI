/**
 * SW Design System — Figma Variables Importer
 *
 * 사용법:
 *   node figma-import.js --token=YOUR_TOKEN --file=FILE_KEY
 *
 * 준비:
 *   1. Figma 우상단 프로필 → Settings → Personal access tokens → 토큰 생성
 *   2. 피그마 파일 URL에서 file key 복사
 *      예) https://www.figma.com/design/AbCdEfGhIj.../...
 *                                    ^^^^^^^^^^^^^^^^ 이 부분
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── 인수 파싱 ──────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
);

const FIGMA_TOKEN = args.token;
const FILE_KEY    = args.file;

if (!FIGMA_TOKEN || !FILE_KEY) {
  console.error('사용법: node figma-import.js --token=YOUR_TOKEN --file=FILE_KEY');
  process.exit(1);
}

// ── 토큰 파일 로드 ─────────────────────────────────────────
const tokensPath = path.join(__dirname, 'sw-design-system.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// ── 색상 변환 유틸 ─────────────────────────────────────────
function hexToRgba(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: 1
  };
}

function rgbaStringToRgba(str) {
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    r: parseInt(m[1]) / 255,
    g: parseInt(m[2]) / 255,
    b: parseInt(m[3]) / 255,
    a: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}

function parseColor(value) {
  if (typeof value !== 'string') return null;
  if (value.startsWith('#'))    return hexToRgba(value);
  if (value.startsWith('rgb'))  return rgbaStringToRgba(value);
  return null;
}

// ── 토큰 평탄화 ────────────────────────────────────────────
// { color: { gray: { 0: { $value, $type } } } }
// → [{ path: 'color/gray/0', $value, $type }]
function flatten(obj, prefix = '') {
  const result = [];
  for (const [key, val] of Object.entries(obj)) {
    const p = prefix ? `${prefix}/${key}` : key;
    if (val && val.$value !== undefined) {
      result.push({ path: p, ...val });
    } else if (val && typeof val === 'object') {
      result.push(...flatten(val, p));
    }
  }
  return result;
}

// ── ID 생성기 ──────────────────────────────────────────────
let _id = 1;
const uid = () => `tmp${_id++}`;

// ── 페이로드 구성 ──────────────────────────────────────────
const collections      = [];
const variableModes    = [];
const variables        = [];
const variableModeValues = [];

// (1) Primitive Collection — 단일 모드
const primColId  = uid();
const primModeId = uid();

collections.push({
  action: 'CREATE', id: primColId,
  name: 'Primitive', initialModeId: primModeId
});
variableModes.push({
  action: 'CREATE', id: primModeId,
  name: 'Value', variableCollectionId: primColId
});

const primitiveTokens = flatten(tokens.primitive).filter(t => t.$type === 'color');

// path → varId 맵 (Semantic의 reference 해소에 사용)
// path 형식: 'color/gray/0'
const primVarIdByPath = {};

for (const t of primitiveTokens) {
  const varId = uid();
  primVarIdByPath[t.path] = varId;

  variables.push({
    action: 'CREATE', id: varId,
    name: t.path,
    variableCollectionId: primColId,
    resolvedType: 'COLOR',
    description: t.$description || ''
  });

  const color = parseColor(t.$value);
  if (color) {
    variableModeValues.push({ variableId: varId, modeId: primModeId, value: color });
  }
}

// (2) Semantic Collection — Light / Dark 두 모드
const semColId    = uid();
const lightModeId = uid();
const darkModeId  = uid();

collections.push({
  action: 'CREATE', id: semColId,
  name: 'Semantic', initialModeId: lightModeId
});
variableModes.push(
  { action: 'CREATE', id: lightModeId, name: 'Light', variableCollectionId: semColId },
  { action: 'CREATE', id: darkModeId,  name: 'Dark',  variableCollectionId: semColId }
);

const lightTokens = flatten(tokens['semantic-light']).filter(t => t.$type === 'color');
const darkTokens  = flatten(tokens['semantic-dark']).filter(t => t.$type === 'color');
const darkByPath  = Object.fromEntries(darkTokens.map(t => [t.path, t]));

// {primitive.color.gray.0} → 'color/gray/0' 변환 후 varId 반환
function resolveRef(refStr) {
  // refStr 예: {primitive.color.gray.0}
  const inner = refStr.slice(1, -1);            // primitive.color.gray.0
  const withoutSet = inner.replace(/^primitive\./, ''); // color.gray.0
  const asPath = withoutSet.replace(/\./g, '/'); // color/gray/0
  return primVarIdByPath[asPath] || null;
}

function resolveValue(token) {
  const v = token.$value;
  if (v.startsWith('{')) {
    const refVarId = resolveRef(v);
    if (refVarId) return { type: 'VARIABLE_ALIAS', id: refVarId };
    console.warn(`⚠ 미해소 참조: ${v} (${token.path})`);
    return null;
  }
  return parseColor(v);
}

for (const lightToken of lightTokens) {
  const varId = uid();

  variables.push({
    action: 'CREATE', id: varId,
    name: lightToken.path,
    variableCollectionId: semColId,
    resolvedType: 'COLOR',
    description: lightToken.$description || ''
  });

  const lightVal = resolveValue(lightToken);
  if (lightVal) variableModeValues.push({ variableId: varId, modeId: lightModeId, value: lightVal });

  const darkToken = darkByPath[lightToken.path];
  if (darkToken) {
    const darkVal = resolveValue(darkToken);
    if (darkVal) variableModeValues.push({ variableId: varId, modeId: darkModeId, value: darkVal });
  }
}

// ── 통계 출력 ──────────────────────────────────────────────
console.log('\n📦 생성 예정:');
console.log(`  Collections : ${collections.length} (Primitive, Semantic)`);
console.log(`  Variables   : ${variables.length}`);
console.log(`  Mode Values : ${variableModeValues.length}`);

// ── Figma API 호출 ─────────────────────────────────────────
const payload = JSON.stringify({
  variableCollections: collections,
  variableModes,
  variables,
  variableModeValues
});

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${FILE_KEY}/variables`,
  method: 'POST',
  headers: {
    'X-Figma-Token': FIGMA_TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('\n🚀 Figma API 호출 중...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Variables 생성 완료! 피그마 파일을 열어 확인하세요.');
    } else {
      console.error(`❌ 오류 (HTTP ${res.statusCode}):`);
      try {
        const parsed = JSON.parse(data);
        console.error(JSON.stringify(parsed, null, 2));
      } catch {
        console.error(data);
      }
    }
  });
});

req.on('error', e => console.error('네트워크 오류:', e.message));
req.write(payload);
req.end();
