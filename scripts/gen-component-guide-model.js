#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, DEFAULT_BUILD_SOURCE, buildGuideModel, stableJson } = require('./lib/component-guide-model');

function valueAfter(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const check = args.includes('--check') || !write;
  const buildSource = valueAfter(args, '--source', DEFAULT_BUILD_SOURCE);
  const outFile = path.resolve(valueAfter(args, '--out', path.join(ROOT, 'registry/components/component-guide-model.json')));
  const model = await buildGuideModel({ buildSource });
  const next = stableJson(model);

  if (model.componentCount !== 42) throw new Error(`정본 grid 항목은 42개여야 합니다. 현재 ${model.componentCount}개`);
  const invalid = model.componentIndex.filter((item) => !['public', 'internal', 'excluded'].includes(item.visibility));
  if (invalid.length) throw new Error(`공개/내부/제외 미분류: ${invalid.map((item) => item.name).join(', ')}`);

  if (write) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, next);
    console.log(`  생성: ${path.relative(ROOT, outFile)} (${model.componentCount}개)`);
    return;
  }
  const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : '';
  if (current !== next) {
    console.error(`  ❌ ${path.relative(ROOT, outFile)} 이 정본과 다릅니다. --write 로 재생성하세요.`);
    process.exitCode = 1;
  } else if (check) {
    console.log(`  ✅ ${path.relative(ROOT, outFile)} 정본 일치 (${model.componentCount}개)`);
  }
}

if (require.main === module) main().catch((error) => { console.error(error.stack || error); process.exit(1); });

module.exports = { main };
