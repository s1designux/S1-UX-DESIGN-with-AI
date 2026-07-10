#!/usr/bin/env node
/**
 * 🔎 DESIGN.md 드리프트 검사기 (token-drift-check.js 와 동일 패턴)
 *
 * 역할: gen-design-md.js 를 dry-run 으로 돌려, 소비용 산출물(design/DESIGN.core.md·services/*.md)이
 *       정본(tokens.css + registry)보다 낡았는지(=재생성하면 바뀌는지) 확인한다.
 *       바뀔 게 있으면 커밋을 막아(재생성 강제) md 손편집·드리프트를 차단한다.
 *
 * 판정: gen-design-md dry-run stdout 에 "변경감지" 가 있으면 exit 1(차단), 없으면 exit 0.
 *
 * 폐쇄망: Node 내장 모듈(path/child_process)만 사용.
 */
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

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
  console.error('  ❌ DESIGN.md 가 정본(tokens.css + registry)보다 낡음 — 재생성 필요:');
  for (const l of lines) console.error('     • ' + l.trim());
  console.error('  → npm run design:md:write 후 커밋하세요.');
  process.exit(1);
}

console.log('  ✅ DESIGN.md 최신 — 정본과 일치 (드리프트 없음)');
process.exit(0);
