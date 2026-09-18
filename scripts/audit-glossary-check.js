#!/usr/bin/env node
/**
 * audit-glossary-check.js — 검수 화면의 «우리말 사전» 이 정본과 맞는지 기계로 본다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 검수 화면은 변형을 «크기 가장 작음 · 상태 기본» 처럼 우리말로 보여준다(river 지시 2026-09-18).
 *     그 사전은 손으로 적은 것이라 ①정본에 새 값이 생기면 그 자리만 영어로 새고
 *     ②근거 없는 말을 지어 넣어도 아무도 모른다(하드룰 H6② 가 막으려는 구멍).
 *     그래서 양방향으로 본다 — 정본→사전(빠짐)은 error, 사전→정본(근거 없음)은 warn.
 *
 * warn 인 이유: 정본은 값을 변수로 만들어 붙이는 자리가 있어(`comp.name = \`Type=${t}\``)
 *     이 스캔이 모든 값을 보지는 못한다. 없다고 단정하지 않고 사람이 보게만 한다.
 *
 * 사용: node scripts/audit-glossary-check.js [--verbose]
 * 종료코드: 0 통과(warn 포함) · 1 빠진 축·값 있음
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const UI = path.join(ROOT, 'plugins/figma-vars-installer/src/ui.html');
const CANON = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const verbose = process.argv.includes('--verbose');

function grabObject(src, name) {
  const head = 'const ' + name + ' = {';
  const i = src.indexOf(head);
  if (i < 0) throw new Error(`[glossary] ui.html 에서 ${name} 을 찾지 못했습니다`);
  const j = src.indexOf('\n};', i);
  return eval('(' + src.slice(i + head.length - 1, j + 2) + ')');
}
function glossKey(t) {
  return String(t || '').trim().toLowerCase().replace(/\s*\+\s*/g, '+').replace(/\s+/g, ' ');
}

const ui = fs.readFileSync(UI, 'utf8');
const AXIS_WORD = grabObject(ui, 'AXIS_WORD');
const VALUE_WORD = grabObject(ui, 'VALUE_WORD');

// 축·값 목록은 기계가독 표면(registry/components/component-facts.json)에서 읽는다.
// 이 파일은 정본(build-components.ts)에서 생성되므로(scripts/gen-component-facts.js) 정본을 대신 읽는 셈이다.
// 정본 소스를 직접 훑지 않는 이유: 컴포넌트 이름이 대부분 `Size=${size}` 처럼 변수로 조립돼
// 글자만 긁으면 값이 거의 안 잡힌다(그러면 «다 덮었다»가 거짓말이 된다).
const FACTS = path.join(ROOT, 'registry/components/component-facts.json');
const facts = JSON.parse(fs.readFileSync(FACTS, 'utf8'));
const comps = facts.components || facts;
const canon = new Map();
for (const key of Object.keys(comps)) {
  const va = (comps[key] || {}).variantAxes;
  if (!va || typeof va !== 'object') continue;
  for (const axis of Object.keys(va)) {
    const vals = va[axis];
    if (!Array.isArray(vals)) continue;          // "not-defined" 같은 자리
    const a = glossKey(axis);
    if (!canon.has(a)) canon.set(a, new Set());
    for (const v of vals) canon.get(a).add(glossKey(v));
  }
}

const missingAxis = [];
const missingValue = [];
for (const [axis, vals] of canon) {
  if (/^property\s*\d*$/.test(axis)) continue;       // 라이브러리 기계 축은 값만 쓴다
  if (!AXIS_WORD[axis]) missingAxis.push(axis);
  for (const v of vals) if (!(VALUE_WORD[axis] || {})[v]) missingValue.push(axis + '=' + v);
}

const orphanValue = [];
for (const axis of Object.keys(VALUE_WORD)) {
  const known = canon.get(axis);
  for (const v of Object.keys(VALUE_WORD[axis])) {
    if (!known || !known.has(v)) orphanValue.push(axis + '=' + v);
  }
}

// ── 채운 것이 «우리말» 인가 ────────────────────────────────────────
// 칸만 채우고 영어를 그대로 베껴 넣으면 화면엔 영어가 뜨는데 검사는 초록이 된다
// (🤖 독립 검증 2026-09-18 이 실제로 뚫어 보였다). 한글이 한 글자도 없으면 막는다.
const HANGUL = /[가-힣]/;
const ENGLISH_OK = new Set(['PC']);   // 우리말로 옮길 것이 아닌 낱말
const notKorean = [];
for (const axis of Object.keys(AXIS_WORD)) {
  const w = AXIS_WORD[axis];
  if (!HANGUL.test(w) && !ENGLISH_OK.has(w)) notKorean.push(`축 ${axis} → "${w}"`);
}
for (const axis of Object.keys(VALUE_WORD)) {
  for (const v of Object.keys(VALUE_WORD[axis])) {
    const w = VALUE_WORD[axis][v];
    if (!HANGUL.test(w) && !ENGLISH_OK.has(w)) notKorean.push(`${axis}=${v} → "${w}"`);
  }
}

const bad = missingAxis.length + missingValue.length + notKorean.length;
if (bad) {
  console.error(`❌ 검수 사전 — 막을 것 ${bad}건 (빠졌거나, 채운 말이 우리말이 아닙니다 — 그 자리는 화면에 영어로 뜹니다)`);
  if (missingAxis.length) console.error('   · 축: ' + [...new Set(missingAxis)].join(' · '));
  if (missingValue.length) console.error('   · 값: ' + [...new Set(missingValue)].join(' · '));
  if (notKorean.length) console.error('   · 우리말이 아닌 항목: ' + notKorean.join(' · '));
  console.error('   → plugins/figma-vars-installer/src/ui.html 의 AXIS_WORD·VALUE_WORD 를 고치세요.');
  process.exit(1);
}
if (orphanValue.length) {
  console.log(`⚠️  검수 사전 — 정본에서 확인되지 않은 항목 ${orphanValue.length}건 (값을 변수로 붙이는 자리는 이 검사가 못 봅니다)`);
  if (verbose) console.log('   · ' + orphanValue.join(' · '));
} 
console.log(`✅ 검수 사전 — 정본 축 ${canon.size}개의 값이 모두 우리말로 덮였습니다`);
