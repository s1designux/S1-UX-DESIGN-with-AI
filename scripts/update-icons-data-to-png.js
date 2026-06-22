#!/usr/bin/env node
/**
 * update-icons-data-to-png.js
 * export-icons-png.js 실행 후 assets/icons/ 에 PNG가 저장됐다면,
 * icons-data.js 의 각 variant에서 svg 필드를 제거하고 png 경로를 추가한다.
 *
 * 실행:
 *   node scripts/update-icons-data-to-png.js
 *   node scripts/update-icons-data-to-png.js --keep-svg   (svg 필드 유지, png만 추가)
 *   node scripts/update-icons-data-to-png.js --dry-run    (변경 미리보기만)
 */

const fs   = require('fs');
const path = require('path');

const ICONS_DATA_PATH = path.join(__dirname, '..', 'assets', 'js', 'icons-data.js');
const ICONS_DIR       = path.join(__dirname, '..', 'assets', 'icons');

const args    = process.argv.slice(2);
const keepSvg = args.includes('--keep-svg');
const dryRun  = args.includes('--dry-run');

// icons-data.js 파싱
const src = fs.readFileSync(ICONS_DATA_PATH, 'utf8');
eval(src.replace('window.ICONS_DATA', 'global.ICONS_DATA'));
const data = global.ICONS_DATA;

let updated = 0, skipped = 0, missing = 0;

data.icons.forEach(icon => {
  Object.entries(icon.variants).forEach(([type, variant]) => {
    const filename = icon.id + '_' + type + '.png';
    const pngPath  = path.join(ICONS_DIR, filename);
    const pngSrc   = '../assets/icons/' + filename;

    if (!fs.existsSync(pngPath)) {
      missing++;
      return;
    }

    if (variant.png === pngSrc && !variant.svg) {
      skipped++;
      return;
    }

    if (dryRun) {
      console.log(`[변경 예정] ${icon.id}/${type}: png="${pngSrc}"${keepSvg ? ' (svg 유지)' : ' (svg 제거)'}`);
      updated++;
      return;
    }

    variant.png = pngSrc;
    if (!keepSvg) delete variant.svg;
    updated++;
  });
});

if (dryRun) {
  console.log(`\n--dry-run: 변경 예정 ${updated}개 / PNG 없음 ${missing}개 / 이미 완료 ${skipped}개`);
  process.exit(0);
}

// 재직렬화: window.ICONS_DATA = { ... }
const serialized = JSON.stringify(data, null, 2)
  .replace(/"figmaNodeId"/g, 'figmaNodeId')  // 키에 따옴표 제거는 JS 문법상 불필요 — 그냥 JSON 그대로 사용
;

const output =
  `/* ============================================================\n` +
  `   icons-data.js — 아이콘 정적 데이터\n` +
  `   PNG: assets/icons/{iconId}_{type}.png\n` +
  `   export-icons-png.js + update-icons-data-to-png.js 로 생성됨\n` +
  `============================================================ */\n\n` +
  `window.ICONS_DATA = ${JSON.stringify(data, null, 2)};\n`;

fs.writeFileSync(ICONS_DATA_PATH, output, 'utf8');

console.log(`✅ icons-data.js 업데이트 완료`);
console.log(`   변경: ${updated}개 / PNG 없음(스킵): ${missing}개 / 이미 완료: ${skipped}개`);
if (missing > 0) console.log(`   ⚠ PNG 없는 항목은 export-icons-png.js 를 먼저 실행하세요.`);
