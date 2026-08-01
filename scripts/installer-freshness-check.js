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
// 설치기 이름 변경(f1807dc: s1-design-system-installer → s1-ux-design-guide-installer)에 맞춰 교정.
// installer:build 가 실제 생성하는 zip 을 검사한다(옛 이름은 vestigial).
const ZIP = path.join(ROOT, 'assets/downloads/s1-ux-design-guide-installer.zip');
const ZIP_ENTRY = 's1-ux-design-guide-installer/code.js';

// 2026-08-01 Phase 1: 텍스트 슬라이스(선언부 탐색 + 중괄호 깊이 추적) → 공용 로더 이관.
//   종전의 침묵 통과 방어(선언부 못 찾으면 throw)는 로더가 승계한다 — 로더는 5개 상수를
//   모두 확인하고 0건/급감이면 throw 하므로, "검사 대상이 줄어든 채 ✅ 통과"가 구조적으로
//   불가능하다(실측 사례: FOUNDATION_COLOR 개명 시 464→256 인 채 exit 0 이던 옛 결함).
const { loadVarsData } = require('./lib/load-vars-data');

function canonicalKeys() {
  const V = loadVarsData();
  return [
    ...Object.keys(V.FOUNDATION_COLOR),
    ...Object.keys(V.FOUNDATION_NUMBER),
    ...Object.keys(V.SEMANTIC_COLOR),
    ...Object.keys(V.SEMANTIC_NUMBER),
    // 2026-07-31 편입: 그림자 3종이 이 목록에 없어 zip 최신성 검사 밖이었다
    //   (Gate 6 installer-coverage 는 이미 3/3 검사 중이라 소스 커버리지만 지켜지던 상태).
    ...Object.keys(V.SEMANTIC_SHADOW),
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
