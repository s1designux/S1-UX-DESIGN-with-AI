#!/usr/bin/env node
/**
 * board-freshness-check.js — Gate 47: 검수판 신선도
 * ─────────────────────────────────────────────────────────────────────────
 * 레거시 대응 검수판은 정본 화면을 이미지로 박아 둔다. 정본이 바뀌어도
 * 아무도 그 화면을 보지 않아 조용히 낡는다 → 찍을 때 기록해 둔 정본 상태
 * (status·sourceFingerprint)를 지금 값과 대조해, 달라졌으면 재캡처를 요구한다.
 *
 * 판정: 상태·지문이 달라진 칸이 있으면 error (npm run board:refresh 로 해소)
 *       선언서에 기록이 아예 없는 칸은 warn
 * 단독 실행: node scripts/board-freshness-check.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'reports/legacy-crosswalk-board');
const MANIFEST = path.join(DIR, 'board-manifest.json');
const TEMPLATE = path.join(DIR, 'board.template.html');  // 게시본(board.html)은 조립 결과라 저장소에 없다

if (!fs.existsSync(MANIFEST) || !fs.existsSync(TEMPLATE)) {
  console.log('Gate 47: 검수판이 없습니다 — 검사 생략(SKIP)');
  process.exit(0);
}

const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const errors = [];
const warns = [];

const untracked = [];
for (const p of man.panes) {
  if (p.tracked === false) { untracked.push(`${p.decision}(${p.component})`); continue; }
  const rec = man.provenance[p.decision];
  if (!rec) { warns.push(`${p.decision}(${p.component}) — 언제 찍었는지 기록이 없습니다`); continue; }
  const f = path.join(ROOT, 'ui-library/dist/components', `${p.component}.manifest.json`);
  if (!fs.existsSync(f)) { warns.push(`${p.decision}(${p.component}) — 배포본 매니페스트가 없습니다`); continue; }
  const now = JSON.parse(fs.readFileSync(f, 'utf8'));
  if ((now.status || '미확인') !== rec.status) {
    errors.push(`${p.decision}(${p.component}) — 승인 상태가 '${rec.status}' → '${now.status}' 로 바뀌었습니다 (찍은 날 ${rec.capturedAt})`);
  } else if ((now.sourceFingerprint || null) !== rec.sourceFingerprint) {
    errors.push(`${p.decision}(${p.component}) — 배포본 내용이 바뀌었습니다 (찍은 날 ${rec.capturedAt})`);
  }
}

if (untracked.length) console.log(`⚠️  Gate 47: 자동 감지 밖 ${untracked.length}칸 — ${untracked.join(' · ')} (배포본 컴포넌트가 아니라 가이드 화면)`);
for (const w of warns) console.log(`⚠️  Gate 47: ${w}`);
if (errors.length) {
  console.error(`Gate 47: 검수판 화면이 정본보다 낡았습니다 — ${errors.length}칸`);
  for (const e of errors) console.error(`   · ${e}`);
  console.error('   → 해소: npm run board:refresh (그 뒤 Claude 가 같은 링크로 재게시)');
  process.exit(1);
}
console.log(`✅ Gate 47: 검수판 ${man.panes.length - untracked.length}칸이 현재 배포본과 같습니다`);
