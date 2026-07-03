#!/usr/bin/env node
/**
 * gen-icons-stats.js
 * icons-data.js(window.ICONS_DATA · 단일 정본)에서 아이콘/섹션 개수를 계산해
 * 경량 통계 파일 assets/js/icons-stats.js(window.ICONS_STATS) 로 내보낸다.
 *
 * index.html 같은 페이지가 708KB 짜리 icons-data.js 전체를 로드하지 않고도
 * 개수를 표출할 수 있게 하는 용도.
 *
 * 아이콘 콘텐츠가 갱신되면(update-icons-data-to-png.js) 자동으로 함께 재생성되도록
 * 그 스크립트 끝에서 호출된다. 수동 실행: node scripts/gen-icons-stats.js
 */

const fs   = require('fs');
const path = require('path');

const ICONS_DATA_PATH  = path.join(__dirname, '..', 'assets', 'js', 'icons-data.js');
const ICONS_STATS_PATH = path.join(__dirname, '..', 'assets', 'js', 'icons-stats.js');

function computeStats() {
  const src = fs.readFileSync(ICONS_DATA_PATH, 'utf8');
  const sandbox = {};
  eval(src.replace('window.ICONS_DATA', 'sandbox.ICONS_DATA'));
  const data = sandbox.ICONS_DATA || {};
  const icons    = Array.isArray(data.icons) ? data.icons.length : 0;
  // 'all'(전체) 탭은 실제 섹션이 아니므로 제외
  const sections = Array.isArray(data.sections)
    ? data.sections.filter(s => s && s.id !== 'all').length
    : 0;
  return { icons, sections };
}

function main() {
  const stats = computeStats();
  const output =
    `/* ============================================================\n` +
    `   icons-stats.js — 아이콘 개수 통계 (자동 생성)\n` +
    `   정본: assets/js/icons-data.js · 생성기: scripts/gen-icons-stats.js\n` +
    `   ⚠ 직접 수정 금지 — npm run icons:stats 로 재생성\n` +
    `============================================================ */\n\n` +
    `window.ICONS_STATS = ${JSON.stringify(stats)};\n`;
  fs.writeFileSync(ICONS_STATS_PATH, output, 'utf8');
  console.log(`✅ icons-stats.js 생성 — 아이콘 ${stats.icons}개 · 섹션 ${stats.sections}개`);
  return stats;
}

if (require.main === module) main();

module.exports = { computeStats, main };
