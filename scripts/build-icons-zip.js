#!/usr/bin/env node
/**
 * build-icons-zip.js
 * assets/icons/ 의 모든 PNG 아이콘을 assets/downloads/s1-design-icons.zip 으로 묶는다.
 * 개발자가 압축을 풀면 icons/ 폴더가 생겨 프로젝트에 통째로 넣을 수 있다.
 *
 * 실행: node scripts/build-icons-zip.js  (또는 npm run icons:zip)
 *
 * 링크(URL) 사용은 GitHub Pages 가 그대로 제공하고, 이 ZIP 은 오프라인/프로젝트
 * 폴더 내장용 별도 통로다. 같은 PNG 를 두 경로로 내보내는 것이라 충돌하지 않는다.
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT       = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');
const ICONS_DIR  = path.join(ASSETS_DIR, 'icons');
const OUT_DIR    = path.join(ASSETS_DIR, 'downloads');
const ZIP_NAME   = 's1-design-icons.zip';
const OUT_PATH   = path.join(OUT_DIR, ZIP_NAME);

if (!fs.existsSync(ICONS_DIR)) {
  console.error('❌ assets/icons 폴더가 없습니다. 먼저 npm run icons:export 를 실행하세요.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const pngCount = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.png')).length;
if (pngCount === 0) {
  console.error('❌ assets/icons 에 PNG 가 없습니다. npm run icons:export 후 다시 시도하세요.');
  process.exit(1);
}

// 기존 zip 제거 (덮어쓰기 시 stale 항목 잔재 방지)
if (fs.existsSync(OUT_PATH)) fs.unlinkSync(OUT_PATH);

console.log(`📦 아이콘 ${pngCount}개를 압축하는 중...`);

// cwd=assets 로 두고 icons 폴더를 통째로 압축 → 풀면 icons/ 폴더가 생김.
// -X: 맥 확장 속성 제외, -q: 조용히, -r: 재귀
execSync(
  `zip -X -q -r "downloads/${ZIP_NAME}" icons -x "*.DS_Store"`,
  { cwd: ASSETS_DIR, stdio: 'inherit' }
);

const sizeMB = (fs.statSync(OUT_PATH).size / (1024 * 1024)).toFixed(1);
console.log(`✅ 완료: assets/downloads/${ZIP_NAME} (${sizeMB}MB, PNG ${pngCount}개)`);
console.log('   압축을 풀면 icons/ 폴더가 생겨 프로젝트에 그대로 넣을 수 있습니다.');
