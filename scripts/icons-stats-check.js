#!/usr/bin/env node
/**
 * icons-stats-check.js
 * 이 게이트는 [icons-data.js ↔ icons-stats.js] 만 검사한다.
 * [Figma ↔ icons-data.js] 는 의도적으로 검사하지 않는다 (사내망 Figma 접근 불가).
 * Figma 대조는 npm run icons:figma:check 로 별도 실행할 것.
 *
 * index.html 이 표출하는 아이콘 개수(icons-stats.js)가 정본(icons-data.js)과 일치하는지
 * 검사·재생성한다. 기본=check(드리프트 시 exit 1), --fix=icons-stats.js 재생성.
 * (color:gen/color:check · layout:check/layout:fix 관례를 따른다.)
 */

const fs   = require('fs');
const path = require('path');

const DATA_PATH  = path.join(__dirname, '..', 'assets', 'js', 'icons-data.js');
const STATS_PATH = path.join(__dirname, '..', 'assets', 'js', 'icons-stats.js');

// 정본에서 개수 계산: icons=항목 수(변형 아님), sections='all' 탭 제외
function computeStats() {
  const src = fs.readFileSync(DATA_PATH, 'utf8');
  const sandbox = {};
  eval(src.replace('window.ICONS_DATA', 'sandbox.ICONS_DATA'));
  const d = sandbox.ICONS_DATA || {};
  const icons = Array.isArray(d.icons) ? d.icons.length : 0;
  const sections = Array.isArray(d.sections) ? d.sections.filter(s => s && s.id !== 'all').length : 0;
  return { icons, sections };
}

function readStats() {
  if (!fs.existsSync(STATS_PATH)) return null;
  const m = fs.readFileSync(STATS_PATH, 'utf8').match(/ICONS_STATS\s*=\s*(\{[^;]*\})/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (_) { return null; }
}

function writeStats(stats) {
  const out =
    `/* ============================================================\n` +
    `   icons-stats.js — 아이콘 개수 통계 (자동 생성)\n` +
    `   정본: assets/js/icons-data.js · 정합성 게이트/재생성: scripts/icons-stats-check.js\n` +
    `   ⚠ 직접 수정 금지 — npm run icons:stats 로 재생성 (검사: npm run icons:stats:check)\n` +
    `============================================================ */\n\n` +
    `window.ICONS_STATS = ${JSON.stringify(stats)};\n`;
  fs.writeFileSync(STATS_PATH, out, 'utf8');
}

// gate-check.js 가 호출: { ok, expected, actual }
function check() {
  const expected = computeStats();
  const actual = readStats();
  const ok = !!actual && actual.icons === expected.icons && actual.sections === expected.sections;
  return { ok, expected, actual };
}

function fix() {
  const stats = computeStats();
  writeStats(stats);
  return stats;
}

function main() {
  if (process.argv.includes('--fix')) {
    const s = fix();
    console.log(`✅ icons-stats.js 재생성 — 아이콘 ${s.icons}개 · 섹션 ${s.sections}개`);
    return;
  }
  const r = check();
  if (!r.ok) {
    const a = r.actual ? r.actual.icons : '없음';
    console.error(`❌ icons-stats.js 개수 불일치 (표기 ${a} ≠ 정본 ${r.expected.icons})`);
    console.error(`   * icons = icons-data.js 아이콘 항목 수 (변형 아님)`);
    console.error(`   * sections = 'all' 탭 제외 섹션 수`);
    console.error(`   → npm run icons:stats`);
    process.exit(1);
  }
  console.log(`✅ icons-stats.js 정합 — 아이콘 ${r.expected.icons}개 · 섹션 ${r.expected.sections}개`);
}

if (require.main === module) main();

module.exports = { check, fix, computeStats };
