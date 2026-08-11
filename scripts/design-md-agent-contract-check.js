#!/usr/bin/env node
'use strict';
/** DESIGN.core.md의 AI 실행 계약이 핵심 의사결정을 보존하는지 검사한다. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DOC = fs.readFileSync(path.join(ROOT, 'design/DESIGN.core.md'), 'utf8');

const failures = [];
const expect = (label, test) => { if (!test) failures.push(label); };
const section = (name) => {
  const start = DOC.indexOf(`### ${name}\n`);
  if (start < 0) return '';
  const next = DOC.indexOf('\n### ', start + 5);
  return DOC.slice(start, next < 0 ? DOC.length : next);
};
const between = (text, from, to) => {
  const start = text.indexOf(from);
  if (start < 0) return '';
  const end = text.indexOf(to, start + from.length);
  return text.slice(start, end < 0 ? text.length : end);
};

expect('Agent contract defaults 없음', DOC.includes('### Agent contract defaults'));
expect('추측 금지 gap 형식 없음', DOC.includes('DESIGN_SYSTEM_GAP: <missing definition>'));
expect('unknown marker 3종 없음', ['unknown', 'not-defined', 'figma-unconfirmed'].every((x) => DOC.includes(x)));
expect('S1 아이콘 허용목록 없음', ['search', 'close', 'chevron', 'calendar'].every((x) => DOC.includes(`- "${x}"`)));

const button = section('Button');
expect('Button 실제 variant 누락', ['Primary', 'Secondary', 'Blue-Line'].every((x) => button.includes(`- "${x}"`)));
const buttonAxes = between(button, 'variantAxes:', 'states:');
expect('Button 폐기 danger/ghost가 Agent variant에 재유입', !buttonAxes.includes('Danger') && !buttonAxes.includes('Ghost'));
expect('Button PC MD 44 geometry 누락', button.includes('height: 44'));
expect('미해결 component alias 표시 누락', button.includes('status: "unresolved"'));
expect('Button PC click/disabled 행동 계약 누락', button.includes('invoke the assigned action once') && button.includes('disabled=true'));

const input = section('Input');
expect('Input builder state 누락', ['Default', 'Filled', 'Editing', 'Error', 'Correct', 'Read-Only', 'Disabled'].every((x) => input.includes(`- "${x}"`)));
const inputBuilderStates = between(input, 'builder:', 'metadata:');
expect('Input hover가 builder state로 재유입', !inputBuilderStates.includes('- "Hover"'));
expect('Input mobile 48 geometry 누락', input.includes('height: 48'));
expect('Input 기본 편집/label 연결 행동 계약 누락', input.includes('edit the native input value') && input.includes('connect one label to input with unique id/for'));

const filterChip = section('Filter Chip');
expect('Filter Chip complete/selected 구분 누락', filterChip.includes('- "Selected"') && filterChip.includes('- "Complete"'));
expect('Filter Chip Dropdown 재사용 누락', filterChip.includes('- "Dropdown"'));
expect('Filter Chip 선택/닫힘 행동 계약 누락', filterChip.includes('update the trigger label') && filterChip.includes('Escape: "close"') && filterChip.includes('aria-haspopup=listbox'));

const table = section('Table');
expect('Table Pagination/Table Cell 재사용 누락', table.includes('- "Pagination"') && table.includes('- "Table Cell"'));
expect('Table Checkbox 재사용 메타 누락', table.includes('- "checkbox"'));

const pagination = section('Pagination');
expect('Pagination geometry 누락', pagination.includes('height: 28'));
expect('Pagination 이동/경계 행동 계약 누락', pagination.includes('move to the previous page') && pagination.includes('disable unavailable edge actions'));

const datePicker = section('DatePicker');
expect('DatePicker 키보드/포커스 행동 계약 누락', datePicker.includes('ArrowDown') && datePicker.includes('return focus to input'));

const timePicker = section('TimePicker');
expect('TimePicker 단일 선택/닫힘 행동 계약 누락', timePicker.includes('single time value') && timePicker.includes('Escape: "close"') && timePicker.includes('aria-haspopup=listbox'));

const modal = section('Modal');
expect('PC 사이트에 없는 Modal 행동이 임의 생성됨', modal.includes('behavior:') && modal.includes('status: "not-defined"'));

if (failures.length) {
  console.error('🔎 DESIGN MD Agent Contract 검사');
  failures.forEach((f) => console.error(`  ❌ ${f}`));
  process.exit(1);
}
console.log('🔎 DESIGN MD Agent Contract 검사');
console.log('  ✅ 핵심 구현 계약 유지 — 시각·토큰 + PC click/keyboard/focus/a11y 규칙');
