#!/usr/bin/env node
'use strict';
/**
 * reports-check.js
 * reports/*.md 전체가 data/reports-index.json에 인덱싱되어 있는지 검증한다.
 * 누락 파일이 있으면 목록을 출력하고 exit 1로 종료한다.
 *
 * Usage: node scripts/reports-check.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const INDEX_FILE  = path.join(ROOT, 'data', 'reports-index.json');

const SKIP_FILES = new Set(['README.md']);

// ── index 읽기 ─────────────────────────────────────────────────────────────────

if (!fs.existsSync(INDEX_FILE)) {
  console.error('ERROR: data/reports-index.json not found.');
  console.error('       Run:  npm run reports:sync');
  process.exit(1);
}

let index;
try {
  index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
} catch (e) {
  console.error('ERROR: Failed to parse data/reports-index.json —', e.message);
  process.exit(1);
}

const indexedIds = new Set((index.reports || []).map(r => r.id));

// ── reports/*.md 스캔 ──────────────────────────────────────────────────────────

const mdFiles = fs.readdirSync(REPORTS_DIR)
  .filter(f => f.endsWith('.md') && !SKIP_FILES.has(f));

const missing = mdFiles.filter(f => !indexedIds.has(f.replace(/\.md$/, '')));

// ── 결과 출력 ─────────────────────────────────────────────────────────────────

if (missing.length > 0) {
  console.error(`\nERROR: ${missing.length} report file(s) not indexed:`);
  missing.forEach(f => console.error(`  - reports/${f}`));
  console.error('\nFix:  npm run reports:sync\n');
  process.exit(1);
}

const ts = index.generatedAt ? new Date(index.generatedAt).toLocaleString('ko-KR') : '?';
console.log(`reports:check ✓  ${mdFiles.length}/${mdFiles.length} indexed  (generated: ${ts})`);
process.exit(0);
