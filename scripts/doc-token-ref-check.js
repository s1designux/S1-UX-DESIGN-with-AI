#!/usr/bin/env node
/**
 * doc-token-ref-check.js — Gate 10: Doc Token Reference Drift
 *
 * 목적: 활성 HTML 페이지(가이드·레퍼런스 문서 포함)가 참조하는 토큰명이
 *       정본과 어긋나지 않도록 기계 강제. 토큰을 rename/remove 하면
 *       옛 이름을 쥐고 있는 문서가 자동으로 적발된다.
 *
 * 검사 2종:
 *   A. semantic 변수 존재: 페이지가 var(--color-*) / 바로 --color-* 로 참조하는
 *      모든 --color-* 가 canonical 정의(tokens.css ∪ site-base.css ∪
 *      component-tokens.css ∪ 해당 페이지 inline 정의)에 존재하는가.
 *      → 없는 참조 = rename/오타/삭제 잔재 (예: --color-data-state-hover).
 *   B. 폐기 경로 denylist: registry/tokens/deprecated-tokens.json 의
 *      renamedGroups[].from 문자열이 활성 페이지에 잔존하는가.
 *      → Figma 경로 rename 잔재 적발 (예: "color/data/").
 *
 * 제외: components.html (폐기 예정 페이지 — 수정 금지 규칙).
 * 정본 rename 시: deprecated-tokens.json renamedGroups 에 { from, to } 추가하면
 *   이후 이 게이트가 잔재를 자동 차단한다.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'pages');
const EXCLUDE_PAGES = new Set(['components.html']); // 폐기 예정

function read(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; }
}

// --- canonical 정의 집합 (--color-*) ---
function extractColorDefs(text) {
  const set = new Set();
  for (const m of text.matchAll(/(--color-[a-z0-9-]+)\s*:/g)) set.add(m[1]);
  return set;
}
const globalDefs = new Set([
  ...extractColorDefs(read('assets/css/tokens.css')),
  ...extractColorDefs(read('assets/css/site-base.css')),
  ...extractColorDefs(read('assets/css/component-tokens.css')),
]);

// --- 폐기 경로 denylist ---
let renamedGroups = [];
try {
  renamedGroups = JSON.parse(read('registry/tokens/deprecated-tokens.json')).renamedGroups || [];
} catch { /* 파일 없으면 denylist 검사 생략 */ }

const errors = [];   // Check B — 차단(폐기 경로 잔존)
const warns = [];    // Check A — 경고(미정의 --color-* 참조: 기존 드리프트 가시화)
const pages = fs.readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('.html') && !EXCLUDE_PAGES.has(f));

for (const page of pages) {
  const txt = read(path.join('pages', page));
  const localDefs = extractColorDefs(txt);             // 페이지 inline :root 정의
  const valid = new Set([...globalDefs, ...localDefs]);

  // Check A (WARN) — 참조한 --color-* 가 정의돼 있는가
  const referenced = new Set();
  for (const m of txt.matchAll(/--color-[a-z0-9-]+/g)) referenced.add(m[0]);
  for (const ref of referenced) {
    if (ref.endsWith('-')) continue; // 토큰 prefix 조각(예: "--color-data-") 은 Check B 소관
    if (!valid.has(ref)) {
      warns.push(`${page}: 미정의 semantic 변수 '${ref}' (제안·도메인·폐기 토큰 가능 — 별도 정리 대상)`);
    }
  }

  // Check B (ERROR) — rename/폐기된 경로 잔존
  for (const r of renamedGroups) {
    if (txt.includes(r.from)) {
      errors.push(`${page}: 폐기된 토큰 경로 '${r.from}' 잔존 → '${r.to}' 로 교체 (renamed ${r.renamedAt})`);
    }
  }
}

console.log('[Gate 10] Doc Token Reference Drift');
// Check B 결과 (차단)
if (errors.length) {
  for (const e of errors) console.log('  ❌ ' + e);
} else {
  console.log(`  ✅ rename denylist ${renamedGroups.length}건 잔재 0 — 활성 페이지 ${pages.length}개`);
}
// Check A 결과 (경고만)
if (warns.length) {
  console.log(`  ⚠️  미정의 --color-* 참조 ${warns.length}건 (기존 드리프트 — 차단 안 함):`);
  for (const w of warns) console.log('       · ' + w);
}

process.exit(errors.length ? 1 : 0);
