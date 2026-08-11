#!/usr/bin/env node
/**
 * 🔎 DESIGN.md 드리프트 검사기 (token-drift-check.js 와 동일 패턴)
 *
 * 역할: component facts + gen-design-md.js 를 dry-run 으로 돌려, 소비용 산출물이
 *       입력(build-components + tokens.css + component-tokens.css + registry 메타)보다 낡았는지 확인한다.
 *       바뀔 게 있으면 커밋을 막아(재생성 강제) md 손편집·드리프트를 차단한다.
 *
 * 판정: gen-design-md dry-run stdout 에 "변경감지" 가 있으면 exit 1(차단), 없으면 exit 0.
 *
 * 폐쇄망: Node 내장 모듈(path/child_process)만 사용.
 */
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

// PC UI 라이브러리의 실제 JavaScript 근거가 행동 계약과 먼저 일치해야 한다.
const behavior = spawnSync('node', [path.join(ROOT, 'scripts/component-behavior-check.js')], { encoding: 'utf-8' });
const behaviorOut = (behavior.stdout || '') + (behavior.stderr || '');
if (behavior.status !== 0) {
  console.error('🔎 DESIGN.md 드리프트 검사기 (Design MD Drift)');
  console.error('  ❌ PC component behavior 계약이 UI 라이브러리 JavaScript와 어긋남:');
  console.error(behaviorOut.trim());
  process.exit(1);
}

// build-components 정본 파생 facts 가 먼저 최신이어야 DESIGN.md 최신성도 의미가 있다.
const facts = spawnSync('node', [path.join(ROOT, 'scripts/gen-component-facts.js')], { encoding: 'utf-8' });
const factsOut = (facts.stdout || '') + (facts.stderr || '');
if (facts.status !== 0) {
  console.error('🔎 DESIGN.md 드리프트 검사기 (Design MD Drift)');
  console.error('  ❌ component-facts.json 이 build-components.ts 보다 낡았거나 생성에 실패함:');
  console.error(factsOut.trim());
  console.error('  → npm run components:facts:write 후 npm run design:md:write 를 실행하세요.');
  process.exit(1);
}

const r = spawnSync('node', [path.join(ROOT, 'scripts/gen-design-md.js')], { encoding: 'utf-8' });
const out = (r.stdout || '') + (r.stderr || '');

console.log('🔎 DESIGN.md 드리프트 검사기 (Design MD Drift)');

if (r.status !== 0) {
  console.error('  ❌ gen-design-md.js 실행 실패:');
  console.error(out.trim());
  process.exit(1);
}

if (out.includes('변경감지')) {
  const lines = out.split('\n').filter((l) => l.includes('변경감지'));
  console.error('  ❌ DESIGN.md 가 입력(tokens.css + registry 메타)보다 낡음 — 재생성 필요:');
  for (const l of lines) console.error('     • ' + l.trim());
  console.error('  → npm run design:md:write 후 커밋하세요.');
  process.exit(1);
}

console.log('  ✅ DESIGN.md 최신 — 정본과 일치 (드리프트 없음)');
process.exit(0);
