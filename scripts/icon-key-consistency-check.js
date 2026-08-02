#!/usr/bin/env node
/**
 * icon-key-consistency-check.js  (Gate 31 — 아이콘 키 정합)
 * ─────────────────────────────────────────────────────────────────────────
 * 설치기가 쓰는 아이콘 컴포넌트 키(`ICON_KEYS`)와 provenance 허용목록
 * (`registry/figma/allowed-remote-keys.json`)이 어긋나지 않는지 기계 대조한다.
 *
 * 왜 필요한가 (2026-08-01 실측):
 *   두 곳이 손 동기화라 숫자가 셋 다 달랐다 — ICON_KEYS 12개 · 허용목록 19개 ·
 *   허용목록의 `source` 주석은 "installer 아이콘 9키". 어느 것이 맞는지 아무도 안 봤다.
 *   아이콘 키가 어긋나면 Gate 12(아이콘 인스턴스 정책)가 정상 아이콘을 위반으로 잡거나
 *   반대로 미등록 아이콘을 통과시킨다.
 *
 * 검사 3종:
 *   (1) **포함관계** — ICON_KEYS 의 모든 키가 허용목록에 있어야 한다(설치기가 쓰는데 허용
 *       안 된 키 = Gate 12 오탐 원인). 반대 방향(허용목록에만 있는 키)은 정상이다 —
 *       V3.0-only·video-only 추가분처럼 설치기 밖에서 쓰는 것이 있기 때문(허용목록 note 참조).
 *   (2) **값 일치** — 같은 이름의 키가 양쪽에서 다른 컴포넌트 키를 가리키면 드리프트다.
 *   (3) **주석 정직성** — `source` 문구가 "installer 아이콘 N키"라고 적었다면 그 N 이
 *       실제 ICON_KEYS 개수와 같아야 한다. 문서가 사실과 다르면 다음 사람이 오독한다.
 *
 * 출력 끝줄: `ICONKEY_SUMMARY installer=<n> allowed=<n> missing=<n> mismatch=<n> staleComment=<0|1> noDeclaration=<0|1>`
 * 사용: node scripts/icon-key-consistency-check.js   (npm run icons:keycheck)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const ALLOWED = path.join(ROOT, 'registry/figma/allowed-remote-keys.json');

// 정본 로드 — Gate 18/30 과 동일한 esbuild+require 패턴(소스 텍스트 긁기 금지).
function installerIconKeys() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-iconkey-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  global.figma = new Proxy(function () {}, { get: () => global.figma, apply: () => global.figma });
  let mod;
  try { delete require.cache[tmp]; mod = require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* skip */ } }
  const keys = mod.ICON_KEYS;
  if (!keys || Object.keys(keys).length === 0) {
    throw new Error('build-components.ts 에서 ICON_KEYS 를 얻지 못했습니다(0건). export 구조 변경 의심 — 검사 중단.');
  }
  return keys;
}

function check({ pass, warn, fail }) {
  let iconKeys;
  try { iconKeys = installerIconKeys(); }
  catch (e) { fail(`Gate 31 실행 실패: ${e.message}`); return; }

  const doc = JSON.parse(fs.readFileSync(ALLOWED, 'utf8'));
  const allowed = doc.allowedRemoteComponentKeys || {};
  // 이름 별칭 — 같은 아이콘을 양쪽이 다른 이름으로 부르는 경우(예: 설치기 eye ↔ 허용목록 eye_hide).
  //   별칭은 **값(컴포넌트 키)이 같을 때만** 인정한다. 이름만 이어 붙여 다른 아이콘을 통과시키지 않는다.
  const aliases = doc.nameAliases || {};
  const resolve = (n) => (typeof aliases[n] === 'string' ? aliases[n] : n);

  // (1) 포함관계 (별칭 해석 후)
  const missing = Object.keys(iconKeys).filter((n) => !(resolve(n) in allowed));
  // (2) 값 일치 — 별칭으로 이어진 경우도 값이 다르면 드리프트다.
  const mismatch = Object.keys(iconKeys)
    .filter((n) => resolve(n) in allowed && allowed[resolve(n)] !== iconKeys[n])
    .map((n) => `${n}${resolve(n) !== n ? `(→${resolve(n)})` : ''}: installer=${String(iconKeys[n]).slice(0, 8)}… ≠ 허용목록=${String(allowed[resolve(n)]).slice(0, 8)}…`);
  // (3) 주석 정직성
  //   ⚠️ 문구가 **없어도** 위반이다. 종전엔 declared=null 이면 조용히 통과해서,
  //   "installer 아이콘 N키" 한 줄을 지우기만 하면 이 검사가 사라졌다(🤖 verifier 지적 (c)-3).
  //   검사를 끄는 가장 쉬운 방법이 "근거 문장을 지우는 것"이면 검사가 아니다.
  const m = String(doc.source || '').match(/installer\s*아이콘\s*(\d+)\s*키/);
  const declared = m ? Number(m[1]) : null;
  const actual = Object.keys(iconKeys).length;
  const missingDeclaration = declared === null;
  const staleComment = declared !== null && declared !== actual;

  if (missing.length) {
    fail(`Gate 31: 설치기가 쓰는 아이콘 키 ${missing.length}개가 허용목록에 없음 — ${missing.join(', ')} (Gate 12 오탐 원인). registry/figma/allowed-remote-keys.json 에 추가할 것`);
  }
  if (mismatch.length) {
    fail(`Gate 31: 같은 이름인데 컴포넌트 키가 다름 ${mismatch.length}건 — ${mismatch.join(' · ')}`);
  }
  if (staleComment) {
    fail(`Gate 31: allowed-remote-keys.json 의 source 주석이 "installer 아이콘 ${declared}키"라고 적었으나 실제 ICON_KEYS 는 ${actual}개 — 문구를 사실에 맞출 것`);
  }
  if (missingDeclaration) {
    fail(`Gate 31: allowed-remote-keys.json 의 source 에 "installer 아이콘 N키" 선언이 없습니다 — 문구를 지워 검사를 무력화할 수 없게 필수로 요구합니다(현재 실제 ${actual}키).`);
  }
  if (!missing.length && !mismatch.length && !staleComment && !missingDeclaration) {
    const extra = Object.keys(allowed).length - actual;
    pass(`아이콘 키 정합 — 설치기 ${actual}키 전부 허용목록에 있고 값 일치${extra > 0 ? ` (허용목록 ${extra}키는 설치기 밖 사용분: V3.0/video 등)` : ''}`);
  }

  return { installer: actual, allowed: Object.keys(allowed).length, missing, mismatch, staleComment, missingDeclaration };
}

module.exports = { check };

if (require.main === module) {
  let errors = 0;
  const r = check({
    pass: (m) => console.log(`  ✅ ${m}`),
    warn: (m) => console.warn(`  ⚠️  ${m}`),
    fail: (m) => { console.error(`  ❌ ${m}`); errors++; },
  }) || {};
  console.log(`ICONKEY_SUMMARY installer=${r.installer || 0} allowed=${r.allowed || 0} missing=${(r.missing || []).length} mismatch=${(r.mismatch || []).length} staleComment=${r.staleComment ? 1 : 0} noDeclaration=${r.missingDeclaration ? 1 : 0}`);
  process.exit(errors > 0 ? 1 : 0);
}
