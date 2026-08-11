#!/usr/bin/env node
'use strict';

/**
 * Gate 38 — Component Guide Generation
 *
 * 정본에서 생성된 guide model이 현재 작업 트리와 같은지 확인한다.
 * 메인 사이트는 손관리 화면이므로 이 Gate가 생성하거나 byte 대조하지 않는다.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(script, args = []) {
  const result = spawnSync('node', [path.join(ROOT, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    status: result.status,
    output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
  };
}

function check({ pass, fail }) {
  const checks = [
    ['guide model', 'scripts/gen-component-guide-model.js', ['--check']],
  ];
  let bad = 0;
  for (const [label, script, args] of checks) {
    const result = run(script, args);
    if (result.ok) {
      const summary = result.output.split('\n').filter(Boolean).slice(-1)[0] || `${label} 최신`;
      pass(`${label} 생성 결과 최신 — ${summary}`);
    } else {
      bad += 1;
      fail(`${label} 생성 결과 드리프트(exit ${result.status}) — npm run components:guide-model:write`);
      for (const line of result.output.split('\n').filter((line) => /❌|drift|불일치|missing|누락/i.test(line)).slice(0, 8)) {
        fail(`  ${line.trim()}`);
      }
    }
  }
  return { bad };
}

module.exports = { check };

if (require.main === module) {
  let errors = 0;
  const pass = (message) => console.log(`  ✅ ${message}`);
  const fail = (message) => { errors += 1; console.log(`  ❌ ${message}`); };
  console.log('\n🔎 [Gate 38] 컴포넌트 가이드 생성물 검사기 (Component Guide Generation)');
  check({ pass, fail });
  process.exit(errors ? 1 : 0);
}
