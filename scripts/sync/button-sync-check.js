/**
 * SW Design System — Button Sync Check
 *
 * Button 관련 파일 간 기준 정합성을 검사하고 reports/button-sync-check.md 를 생성한다.
 * 자동 수정하지 않는다 — 검사와 리포트 생성만 담당한다.
 *
 * Usage: node scripts/sync/button-sync-check.js
 */

'use strict';

const { readJson, readFile, writeReport, formatDate } = require('./utils');

// ── 공식 Button 기준 ──────────────────────────────────────────────
const CANONICAL = {
  variants:       ['primary', 'secondary', 'blue-line'],
  deprecatedVariants: ['ghost', 'danger', 'outlined'],
  figmaStates:    ['default', 'hover', 'pressed', 'disabled', 'loading'],
  harnessColumns: ['action', 'default', 'hover', 'pressed', 'disabled', 'loading'],
  interactiveColumn: 'action',
  staticColumns:  ['default', 'hover', 'pressed', 'disabled', 'loading'],
  sizes: {
    pc: ['medium', 'xsmall', 'xxsmall'],
    mobile: ['mobile'],
  },
};

// ── 대상 파일 ─────────────────────────────────────────────────────
const FILES = {
  buttonJson:      'registry/components/button.json',
  figmaMap:        'registry/figma/figma-map.json',
  componentTokens: 'registry/tokens/component.tokens.json',
  componentsMd:    'tokens/component-tokens-extracted.md',
  readme:          'README.md',
  claudeMd:        'CLAUDE.md',
  componentsHtml:  'pages/components-new.html',  // 정본 (구 components.html 은 레거시·검수 제외 2026-06-17)
  buttonCss:       'assets/css/components/button.css',
  buttonHarnessJs: 'assets/js/button-harness.js',
};

// ── 검사 결과 수집 ────────────────────────────────────────────────
const issues   = [];
const warnings = [];
const passed   = [];

function issue(file, msg)   { issues.push(`[ISSUE] ${file}: ${msg}`); }
function warn(file, msg)    { warnings.push(`[WARN]  ${file}: ${msg}`); }
function pass(file, msg)    { passed.push(`[OK]    ${file}: ${msg}`); }

// ── button.json 검사 ──────────────────────────────────────────────
function checkButtonJson() {
  const { data, error } = readJson(FILES.buttonJson);
  if (error) { issue(FILES.buttonJson, error); return; }

  const variants = data?.variants?.list || [];
  const state    = data?.variants?.state || [];
  const harness  = data?.harness || {};

  // variants
  for (const v of CANONICAL.variants) {
    if (variants.includes(v)) pass(FILES.buttonJson, `variant "${v}" present`);
    else issue(FILES.buttonJson, `official variant "${v}" missing from variants.list`);
  }
  for (const bad of CANONICAL.deprecatedVariants) {
    if (variants.includes(bad))
      issue(FILES.buttonJson, `deprecated variant "${bad}" still in variants.list`);
  }

  // state — loading
  if (state.includes('loading')) pass(FILES.buttonJson, 'state includes "loading"');
  else issue(FILES.buttonJson, 'state missing "loading"');

  // harness columns
  for (const col of CANONICAL.harnessColumns) {
    if ((harness.columns || []).includes(col))
      pass(FILES.buttonJson, `harness.columns includes "${col}"`);
    else
      issue(FILES.buttonJson, `harness.columns missing "${col}"`);
  }

  // action must not be in Figma states
  if ((state || []).includes('action'))
    issue(FILES.buttonJson, '"action" must not appear in variants.state (it is a harness column only)');

  // interactiveColumn
  if (harness.interactiveColumn === 'action')
    pass(FILES.buttonJson, 'interactiveColumn = "action"');
  else
    issue(FILES.buttonJson, `interactiveColumn should be "action", got "${harness.interactiveColumn}"`);
}

// ── figma-map.json 검사 ───────────────────────────────────────────
function checkFigmaMap() {
  const { data, error } = readJson(FILES.figmaMap);
  if (error) { issue(FILES.figmaMap, error); return; }

  const btn = data?.components?.button || {};
  const variantKeys = Object.keys(btn.variants || {});

  // official variants present
  for (const v of CANONICAL.variants) {
    if (variantKeys.includes(v)) pass(FILES.figmaMap, `variant "${v}" in figma mapping`);
    else warn(FILES.figmaMap, `variant "${v}" not yet in figma mapping`);
  }

  // ghost should be deprecated, not official
  const ghost = btn.variants?.ghost;
  if (ghost) {
    if (ghost.status === 'deprecated') pass(FILES.figmaMap, 'ghost.status = deprecated');
    else issue(FILES.figmaMap, 'ghost is present in figma mapping without deprecated status');
  }

  // action should NOT be in Figma valueMap states
  const valueMap = data?.components?.button?.figmaPropertyMap?.valueMap || {};
  if (Object.keys(valueMap).includes('action'))
    issue(FILES.figmaMap, '"action" should not be in Figma valueMap — it is a harness column only');

  // nodeId check
  if (btn.figmaNodeId && btn.figmaNodeId !== '')
    pass(FILES.figmaMap, `figmaNodeId registered: ${btn.figmaNodeId}`);
  else
    warn(FILES.figmaMap, 'Button figmaNodeId is empty — Figma MCP comparison not possible');
}

// ── component.tokens.json 검사 ───────────────────────────────────
function checkComponentTokens() {
  const { data, error } = readJson(FILES.componentTokens);
  if (error) { issue(FILES.componentTokens, error); return; }

  const buttonTokens = data?.tokens?.button || {};

  // official variants have token arrays
  for (const v of CANONICAL.variants) {
    if (Array.isArray(buttonTokens[v]) && buttonTokens[v].length > 0)
      pass(FILES.componentTokens, `"${v}" token array present`);
    else
      issue(FILES.componentTokens, `"${v}" token array missing or empty`);
  }

  // raw HEX check
  const allValues = Object.values(buttonTokens).flat()
    .map(t => t?.value || '')
    .filter(v => /^#[0-9a-fA-F]{3,8}$/.test(v));
  if (allValues.length > 0)
    issue(FILES.componentTokens, `raw HEX values found: ${allValues.join(', ')}`);
  else
    pass(FILES.componentTokens, 'no raw HEX values in button tokens');

  // ghost should be deprecated
  const ghost = buttonTokens.ghost;
  if (ghost) {
    const hasDeprecated = (Array.isArray(ghost) ? ghost : []).every(t => t.status === 'deprecated');
    if (hasDeprecated) pass(FILES.componentTokens, 'ghost tokens all marked deprecated');
    else issue(FILES.componentTokens, 'ghost tokens exist without deprecated status');
  }
}

// ── 텍스트 파일 키워드 검사 헬퍼 ────────────────────────────────
function checkTextFile(filePath, checks) {
  const { content, error } = readFile(filePath);
  if (error) { issue(filePath, error); return; }

  for (const { keyword, expect, message } of checks) {
    const found = content.includes(keyword);
    if (expect === 'present') {
      if (found) pass(filePath, message || `"${keyword}" found`);
      else issue(filePath, message || `"${keyword}" not found`);
    } else if (expect === 'absent') {
      if (!found) pass(filePath, message || `"${keyword}" not present (correct)`);
      else issue(filePath, message || `"${keyword}" should not be present`);
    } else if (expect === 'warn-present') {
      if (!found) warn(filePath, message || `"${keyword}" not found`);
    }
  }
}

// ── components.html 검사 ─────────────────────────────────────────
function checkComponentsHtml() {
  checkTextFile(FILES.componentsHtml, [
    { keyword: 's1-btn-primary',    expect: 'present',  message: 'primary variant CSS class present' },
    { keyword: 's1-btn-secondary',  expect: 'present',  message: 'secondary variant CSS class present' },
    { keyword: 's1-btn-blue-line',  expect: 'present',  message: 'blue-line variant CSS class present' },
    { keyword: 'action-cell',       expect: 'present',  message: 'ACTION column cell present' },
    { keyword: 'is-preview',        expect: 'present',  message: 'static preview class present' },
    { keyword: 'is-loading',        expect: 'warn-present', message: 'is-loading CSS not defined — loading state unimplemented in s1-btn' },
    { keyword: 'ghost',             expect: 'absent',   message: 'ghost should not be exposed in components.html button section' },
  ]);
}

// ── README.md 검사 ───────────────────────────────────────────────
function checkReadme() {
  checkTextFile(FILES.readme, [
    { keyword: 'Button Current Standard', expect: 'present', message: 'Button Current Standard section present' },
    { keyword: 'action',                  expect: 'present', message: '"action" column reference present' },
    { keyword: 'ghost` is not',            expect: 'present', message: 'ghost disclaimer present' },
  ]);
}

// ── CLAUDE.md 검사 ───────────────────────────────────────────────
function checkClaudeMd() {
  checkTextFile(FILES.claudeMd, [
    { keyword: 'Current Button Standard', expect: 'present', message: 'Current Button Standard section present' },
    { keyword: 'action ≠ Figma state',    expect: 'present', message: 'action ≠ Figma state rule present' },
    { keyword: 'ghost',                   expect: 'present', message: 'ghost deprecation rule present' },
  ]);
}

// ── button.css 검사 ──────────────────────────────────────────────
function checkButtonCss() {
  checkTextFile(FILES.buttonCss, [
    { keyword: 'sw-button--primary',   expect: 'present', message: 'primary CSS class present' },
    { keyword: 'sw-button--secondary', expect: 'present', message: 'secondary CSS class present' },
    { keyword: 'sw-button--blue-line', expect: 'present', message: 'blue-line CSS class present' },
    { keyword: 'sw-button--loading',   expect: 'present', message: 'loading CSS class present' },
    { keyword: '#',                    expect: 'warn-present', message: 'raw HEX detected — verify no component-level HEX' },
  ]);
}

// ── 리포트 생성 ───────────────────────────────────────────────────
function generateReport() {
  const date = formatDate();
  const total  = issues.length + warnings.length + passed.length;
  const status = issues.length === 0 ? '✅ PASS' : `❌ ${issues.length} issue(s) found`;

  const lines = [
    `# Button Sync Check Report`,
    ``,
    `**Date:** ${date}  `,
    `**Status:** ${status}  `,
    `**Summary:** ${passed.length} passed · ${warnings.length} warnings · ${issues.length} issues (total ${total} checks)`,
    ``,
    `---`,
    ``,
    `## Canonical Button Standard (checked against)`,
    ``,
    `- **Variants:** ${CANONICAL.variants.join(', ')}`,
    `- **Figma States:** ${CANONICAL.figmaStates.join(', ')}`,
    `- **Harness Columns:** ${CANONICAL.harnessColumns.join(', ')}`,
    `- **Deprecated:** ${CANONICAL.deprecatedVariants.join(', ')}`,
    ``,
    `---`,
    ``,
  ];

  if (issues.length > 0) {
    lines.push(`## Issues (${issues.length})`, ``);
    issues.forEach(i => lines.push(`- ${i}`));
    lines.push(``);
  }

  if (warnings.length > 0) {
    lines.push(`## Warnings (${warnings.length})`, ``);
    warnings.forEach(w => lines.push(`- ${w}`));
    lines.push(``);
  }

  lines.push(`## Passed (${passed.length})`, ``);
  passed.forEach(p => lines.push(`- ${p}`));
  lines.push(``);

  lines.push(
    `---`,
    ``,
    `## Files Checked`,
    ``,
    ...Object.values(FILES).map(f => `- \`${f}\``),
    ``,
    `---`,
    ``,
    `*Generated by \`npm run sync:button\`*`,
  );

  writeReport('reports/button-sync-check.md', lines.join('\n'));
  return { issueCount: issues.length, warnCount: warnings.length };
}

// ── 실행 ─────────────────────────────────────────────────────────
function main() {
  console.log('Button Sync Check — SW Design System');
  console.log('=====================================');

  checkButtonJson();
  checkFigmaMap();
  checkComponentTokens();
  checkComponentsHtml();
  checkReadme();
  checkClaudeMd();
  checkButtonCss();

  const { issueCount, warnCount } = generateReport();

  console.log(`\nResults: ${passed.length} passed · ${warnCount} warnings · ${issueCount} issues`);
  console.log('Report: reports/button-sync-check.md');

  if (issueCount > 0) {
    console.error(`\n${issueCount} issue(s) found — review reports/button-sync-check.md`);
    process.exit(1);
  } else {
    console.log('\nAll checks passed.');
    process.exit(0);
  }
}

main();
