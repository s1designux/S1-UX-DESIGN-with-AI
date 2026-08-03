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
const { readZipEntry } = require('./lib/read-zip-entry');

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
    // 순수 Node 로 읽는다 — 종전 `unzip -p` 는 Windows 에 없어 게이트가 OS 에 좌우됐다(2026-08-03).
    bundle = readZipEntry(ZIP, ZIP_ENTRY);
  } catch (e) {
    fail(`설치기 zip 에서 code.js 추출 실패: ${e.message}`);
    return;
  }
  const keys = canonicalKeys();
  const missing = keys.filter((k) => !bundle.includes(`"${k}"`));
  if (missing.length) {
    fail(`설치기 zip 이 stale — vars-data 토큰 ${missing.length}개 누락. \`npm run installer:build\` 필요: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ' …' : ''}`);
    return;
  }

  // ── 값 검사(2026-08-01 신설) — 종전엔 "키 존재"만 봐서 **값만 바꾸고 빌드를 잊으면 통과**했다.
  //   (Gate 6c 는 툴팁 날짜, Gate 13 은 build-components 해시라 값은 어느 게이트도 안 봤다.)
  //   esbuild 번들은 Foundation hex 를 그대로 inline 하므로 "키: 값" 쌍이 번들에 있어야 한다.
  //   대상은 리터럴 hex 로 값이 고정된 FOUNDATION_COLOR (semantic 은 참조라 문자열 형태가 다양).
  const V = loadVarsData();
  const valueMismatch = [];
  for (const [k, hex] of Object.entries(V.FOUNDATION_COLOR)) {
    if (typeof hex !== 'string' || !/^#[0-9a-fA-F]{3,8}$/.test(hex)) continue;
    // 번들은 "key": "#HEX" 형태로 유지된다(esbuild 는 객체 리터럴을 보존).
    const re = new RegExp(`"${k.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}"\\s*:\\s*"([^"]+)"`);
    const m = bundle.match(re);
    if (m && m[1].toUpperCase() !== hex.toUpperCase()) valueMismatch.push(`${k}: zip="${m[1]}" ≠ 정본="${hex}"`);
  }
  if (valueMismatch.length) {
    fail(`설치기 zip 값 드리프트 ${valueMismatch.length}건 — 값만 바꾸고 \`npm run installer:build\` 를 잊었습니다: ${valueMismatch.slice(0, 5).join(' · ')}${valueMismatch.length > 5 ? ' …' : ''}`);
    return;
  }
  pass(`설치기 zip = vars-data 최신 빌드 (토큰 ${keys.length}개 키 + Foundation 색 값 일치 확인)`);
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
