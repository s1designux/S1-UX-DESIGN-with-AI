#!/usr/bin/env node
/**
 * number-page-check.js  (Gate 9 — Number/Sizing Page Consistency)
 *
 * "색상은 자동 동기화되는데 number(sizing·spacing·radius·border-width·font·opacity·breakpoint)는
 * 페이지에 반영 안 됨" 문제를 영구 차단한다. 색상 전용이던 Gate 7의 사각지대를 메운다.
 *
 * 검사 3종:
 *   A) Foundation number 페이지 정합 — foundation.html 의 5개 GEN 블록
 *      (SIZING·FONT_SIZES·LINE_HEIGHTS·OPACITIES·BREAKPOINTS)이 vars-data 정본과 일치
 *      (gen-foundation-number --check 위임)
 *   B) 전 number 토큰 페이지 노출 — vars-data FOUNDATION_NUMBER/SEMANTIC_NUMBER 의 모든
 *      토큰이 해당 페이지(foundation.html / semantic.html)에 실제로 표기돼 있는지(누락=신규 토큰
 *      추가 시 페이지 미반영 탐지). 데이터 표(typography 합성 등 별도 표면) 차원은 제외 목록으로 관리.
 *   C) 컴포넌트 사이징 토큰 재유입 0건 — 폐지된 --sizing-{role}-* 가 어떤 소스에도 재유입 안 됨.
 *
 * 사용: node scripts/number-page-check.js   (exit 1 on fail)
 *       const { check } = require('./number-page-check')  // gate-check.js 편입
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ── 폐지된 컴포넌트 사이징 토큰 패턴 ──
const DEAD = /--sizing-(?:button-height|chip-height|table-row-height|form-control-height|form-control-dataview-height|dropdown-item-height|button-min-width|icon)-?[a-z0-9]/;

const REUSE_TARGETS = [
  'assets/css/tokens.css', 'assets/css/components/input.css', 'assets/css/components/button.css',
  'pages/install-prompt.html', 'pages/semantic.html', 'pages/foundation.html',
  'pages/components.html', 'pages/components-new.html', 'pages/patterns.html',
  'pages/button-harness.html', 'pages/ai-snippets.html', 'pages/guide-md.html', 'pages/legacy.html',
  'plugins/figma-vars-installer/src/vars-data.ts',
];
const ALLOW_LINE = /(폐지|이관|제거|removed|deprecated)/;
const registryJsons = () =>
  fs.readdirSync(path.join(ROOT, 'registry/components')).filter((f) => f.endsWith('.json')).map((f) => 'registry/components/' + f);

// ── vars-data number 블록 파싱 ──
function block(text, ident) {
  const i = text.indexOf(ident);
  const open = text.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}') { depth--; if (depth === 0) return text.slice(open, j + 1); }
  }
  return '';
}
function keysOf(blk) {
  const out = [];
  for (const m of blk.matchAll(/"([a-z0-9/-]+)"\s*:/g)) out.push(m[1]);
  return out;
}
const toCss = (k) => '--' + k.replace(/\//g, '-');
const hasVar = (txt, cssVar) => new RegExp(cssVar.replace(/[-]/g, '\\-') + '(?![\\w-])').test(txt);

// 페이지 토큰 노출에서 제외하는 카테고리(별도 표면이 담당):
//   font-size·line-height 는 GEN 블록(Font Scale)에서 노출 → 포함. font-weight 는 Typography 표가 담당 → 제외.
const FOUNDATION_PAGE_SKIP = new Set(['font-weight']);

function check({ pass, warn, fail }) {
  // ── A) foundation number 페이지 정합 ──
  const r = spawnSync('node', [path.join(ROOT, 'scripts/gen-foundation-number.js'), '--check'], { encoding: 'utf-8' });
  if (r.status === 0) pass('foundation.html number 5종(sizing·font-size·line-height·opacity·breakpoint) = 정본 일치');
  else fail((r.stderr || r.stdout || '').trim().split('\n').filter(Boolean).pop() || 'foundation number drift');

  // ── B) 전 number 토큰 페이지 노출 ──
  const vd = read('plugins/figma-vars-installer/src/vars-data.ts');
  const fKeys = keysOf(block(vd, 'const FOUNDATION_NUMBER:'));
  const sKeys = keysOf(block(vd, 'const SEMANTIC_NUMBER:'));
  const fHtml = read('pages/foundation.html');
  const sHtml = read('pages/semantic.html');

  const missF = fKeys.filter((k) => !FOUNDATION_PAGE_SKIP.has(k.split('/')[0]) && !hasVar(fHtml, toCss(k)));
  const missS = sKeys.filter((k) => !hasVar(sHtml, toCss(k)));
  if (missF.length === 0) pass(`Foundation number ${fKeys.length}개 전부 foundation.html 노출`);
  else fail(`foundation.html 미노출 ${missF.length}건 — 새 토큰은 number:gen/섹션 추가 필요: ${missF.slice(0, 8).map(toCss).join(', ')}${missF.length > 8 ? ' …' : ''}`);
  if (missS.length === 0) pass(`Semantic number ${sKeys.length}개 전부 semantic.html 노출`);
  else fail(`semantic.html 미노출 ${missS.length}건: ${missS.slice(0, 8).map(toCss).join(', ')}${missS.length > 8 ? ' …' : ''}`);

  // ── C) 컴포넌트 사이징 토큰 재유입 0건 ──
  const hits = [];
  for (const rel of [...REUSE_TARGETS, ...registryJsons()]) {
    const fp = path.join(ROOT, rel);
    if (!fs.existsSync(fp)) continue;
    fs.readFileSync(fp, 'utf8').split('\n').forEach((line, i) => {
      if (ALLOW_LINE.test(line)) return;
      if (line.includes('--sizing-') && /--sizing-[a-z-]*-\*/.test(line)) return;
      if (DEAD.test(line)) hits.push(`${rel}:${i + 1}`);
    });
  }
  if (hits.length === 0) pass('폐지된 컴포넌트 사이징 토큰 재유입 0건');
  else fail(`컴포넌트 사이징 토큰 재유입 ${hits.length}건: ${hits.slice(0, 6).join(', ')}${hits.length > 6 ? ' …' : ''}`);
}

module.exports = { check };

if (require.main === module) {
  let errors = 0;
  check({
    pass: (m) => console.log(`  ✅ ${m}`),
    warn: (m) => console.warn(`  ⚠️  ${m}`),
    fail: (m) => { console.error(`  ❌ ${m}`); errors++; },
  });
  process.exit(errors > 0 ? 1 : 0);
}
