#!/usr/bin/env node
/**
 * installer-freshness-check.js  (Gate 6b — Installer Build Freshness)
 *
 * 커밋된 설치기 zip(assets/downloads/s1-design-system-installer.zip)이 vars-data 정본을
 * 반영한 최신 빌드인지 검사한다. Gate 6(installer-coverage)는 *소스* vars-data↔tokens.css
 * 만 비교해, **빌드 산출물(zip)이 stale해도 통과**하는 사각지대가 있었다(2026-06-12 발견:
 * vars-data 수정 후 installer:build 누락 시 zip이 옛 토큰을 담은 채 방치됨).
 *
 * 원리: esbuild 번들 code.js 는 vars-data 의 토큰 객체를 그대로 inline 한다.
 *   → zip 안의 code.js 에 정본의 모든 토큰 키가 들어있어야 최신 빌드.
 *   누락 키가 있으면 zip 이 옛 빌드 = `npm run installer:build` 필요.
 *
 * 사용: node scripts/installer-freshness-check.js   (exit 1 on stale)
 *       const { check } = require('./installer-freshness-check')  // gate-check.js 편입
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VARS_DATA = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const ZIP = path.join(ROOT, 'assets/downloads/s1-design-system-installer.zip');
const ZIP_ENTRY = 's1-design-system-installer/code.js';

function block(text, ident) {
  const i = text.indexOf(ident);
  if (i < 0) return '';
  const open = text.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}') { depth--; if (depth === 0) return text.slice(open, j + 1); }
  }
  return '';
}
function topKeys(blk) {
  // 최상위 "key": 만 (중첩 SEMANTIC_COLOR light/dark 객체 안의 light/dark 제외)
  const out = [];
  for (const m of blk.matchAll(/"([a-z0-9/-]+)"\s*:/g)) {
    if (m[1] === 'light' || m[1] === 'dark') continue;
    out.push(m[1]);
  }
  return out;
}

function canonicalKeys() {
  const vd = fs.readFileSync(VARS_DATA, 'utf8');
  return [
    ...topKeys(block(vd, 'const FOUNDATION_COLOR:')),
    ...topKeys(block(vd, 'const FOUNDATION_NUMBER:')),
    ...topKeys(block(vd, 'const SEMANTIC_COLOR:')),
    ...topKeys(block(vd, 'const SEMANTIC_NUMBER:')),
  ];
}

function check({ pass, warn, fail }) {
  if (!fs.existsSync(ZIP)) { fail('설치기 zip 없음 — npm run installer:build 필요'); return; }
  let bundle;
  try {
    bundle = execSync(`unzip -p "${ZIP}" "${ZIP_ENTRY}"`, { encoding: 'utf-8', maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    fail(`설치기 zip 에서 code.js 추출 실패: ${e.message}`);
    return;
  }
  const keys = canonicalKeys();
  const missing = keys.filter((k) => !bundle.includes(`"${k}"`));
  if (missing.length === 0) {
    pass(`설치기 zip = vars-data 최신 빌드 (토큰 ${keys.length}개 embed 확인)`);
  } else {
    fail(`설치기 zip 이 stale — vars-data 토큰 ${missing.length}개 누락. \`npm run installer:build\` 필요: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ' …' : ''}`);
  }
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
