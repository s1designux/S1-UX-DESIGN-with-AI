#!/usr/bin/env node
'use strict';
/**
 * canon-manifest-check.js  (Gate 36 — 정본 목록 ↔ 실제 배선 대조)
 * ─────────────────────────────────────────────────────────────────────────
 * "정본이라고 선언한 것들이 실제로 그렇게 배선돼 있나?"를 기계 대조한다.
 *
 * 왜 필요한가 (2026-08-03 실측):
 *   정본은 Figma 구조상 3벌로 나뉜다(Variables·Text Styles·Components — 다른 개체·다른 API).
 *   그런데 "무엇이 정본인가"가 **산문에만** 있었고, 그래서:
 *     · 텍스트 스타일 정본은 게이트가 0개였다(게이트 대부분이 vars-data 만 보게 만들어짐)
 *     · 우산 명령(tokens:reconcile)이 9단계 전부 vars-data 기준이라 텍스트 스타일을
 *       추가해도 파생이 안 따라왔다 → typo:gen 을 1단계로 편입해서야 해소
 *     · 대시보드는 정본을 휴리스틱으로 추측하다 스크립트 2개를 정본으로 오분류하고,
 *       자기 자신을 파생이라 선언한 파일을 정본으로 분류했다
 *   같은 유형의 누락이 다시 생기지 않게, 선언(canon-manifest.json)과 실제 배선을 대조한다.
 *
 * 정본: registry/governance/canon-manifest.json
 *
 * 검사 5종:
 *   (1) manifest 파싱 + canon[].path 실재 (추출 0건이면 fail — "판정 불가를 통과로 만들지 않는다")
 *   (2) 선언된 regen 스크립트가 package.json 에 실재
 *   (3) **우산 배선 양방향 대조** — token-reconcile.js 가 실제로 도는 단계 ↔ manifest 선언
 *       · reconcile 이 도는데 manifest 에 없는 단계 = ❌ (선언 누락)
 *       · manifest 의 generated 표면인데 어느 재생성 경로에도 안 걸린 것 = ⚠️ (사각지대 기록)
 *   (4) generated 표면 파일 실재 (없으면 ❌ — 생성물이 사라진 것)
 *   (5) 정본 파일이 스스로 파생이라 선언하지 않았는지(declaredDerived 와 canon 의 모순 차단)
 *
 * 출력 끝줄: `CANONMAN_SUMMARY canon=<n> surfaces=<n> undeclared=<n> unwired=<n> missing=<n>`
 * 사용: node scripts/canon-manifest-check.js   (npm run canon:manifest)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'registry/governance/canon-manifest.json');
const PKG = path.join(ROOT, 'package.json');
const RECONCILE = path.join(ROOT, 'scripts/token-reconcile.js');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function audit() {
  if (!fs.existsSync(MANIFEST)) {
    throw new Error(`정본 목록이 없습니다: registry/governance/canon-manifest.json`);
  }
  const man = readJson(MANIFEST);
  const canon = Array.isArray(man.canon) ? man.canon : [];
  if (canon.length === 0) {
    throw new Error('canon-manifest.json 의 canon[] 이 비었습니다(0건) — 판정 불가를 통과로 처리하지 않습니다.');
  }

  const scripts = readJson(PKG).scripts || {};
  const missingCanon = [];
  const missingScript = [];
  const missingSurface = [];
  const surfaces = [];

  for (const c of canon) {
    if (!c.path || !fs.existsSync(path.join(ROOT, c.path))) {
      missingCanon.push(c.path || `(path 없음: id=${c.id})`);
    }
    for (const s of (c.surfaces || [])) {
      surfaces.push({ canon: c.id, ...s });
      for (const r of (s.regen || [])) {
        if (!scripts[r]) missingScript.push(`${c.id} → ${s.path}: npm script "${r}" 없음`);
      }
      if (s.kind === 'generated' && s.path && !fs.existsSync(path.join(ROOT, s.path))) {
        missingSurface.push(`${s.path} (정본 ${c.id} 의 생성물인데 파일이 없음)`);
      }
    }
  }

  // ── (3) 우산 배선 양방향 대조 ────────────────────────────────────────────
  //   token-reconcile.js 소스에서 실제로 실행하는 npm script 이름을 뽑는다.
  const reconcileSrc = fs.existsSync(RECONCILE) ? fs.readFileSync(RECONCILE, 'utf8') : '';
  const reconcileSteps = [...reconcileSrc.matchAll(/npm run --silent ([a-zA-Z0-9:_-]+)/g)].map((m) => m[1]);
  if (reconcileSrc && reconcileSteps.length === 0) {
    throw new Error('token-reconcile.js 에서 단계를 추출하지 못했습니다(0건) — 호출 형태가 바뀌었는지 확인하세요.');
  }
  const declaredRegen = new Set();
  for (const s of surfaces) for (const r of (s.regen || [])) declaredRegen.add(r);

  // reconcile 이 도는데 manifest 에 선언되지 않은 단계 = 선언 누락(차단)
  const undeclared = [...new Set(reconcileSteps)].filter((s) => !declaredRegen.has(s));

  // manifest 의 generated 표면인데 재생성 경로가 아예 없는 것 = 사각지대(기록)
  const unwired = surfaces
    .filter((s) => s.kind === 'generated' && (!s.regen || s.regen.length === 0))
    .map((s) => `${s.path} (정본 ${s.canon})`);

  // reconcile 에도 없고 다른 재생성 명령으로만 도는 표면 = 참고 기록(차단 아님)
  const outsideUmbrella = surfaces
    .filter((s) => s.kind === 'generated' && (s.regen || []).length > 0
      && !(s.regen || []).some((r) => reconcileSteps.includes(r)))
    .map((s) => `${s.path} ← ${s.regen.join(', ')}`);

  // ── (5) canon ↔ declaredDerived 모순 ────────────────────────────────────
  const derivedPaths = new Set((man.declaredDerived || []).map((d) => d.path));
  const contradiction = canon.filter((c) => derivedPaths.has(c.path)).map((c) => c.path);

  return {
    canon, surfaces, missingCanon, missingScript, missingSurface,
    undeclared, unwired, outsideUmbrella, contradiction, reconcileSteps,
  };
}

function check({ pass, warn, fail }) {
  let r;
  try { r = audit(); }
  catch (e) { fail(`검사 실행 실패: ${e.message}`); return; }

  let bad = 0;
  if (r.missingCanon.length) { bad++; fail(`선언된 정본 파일 없음 ${r.missingCanon.length}: ${r.missingCanon.join(', ')}`); }
  if (r.missingScript.length) { bad++; fail(`선언된 재생성 명령이 package.json 에 없음 ${r.missingScript.length}: ${r.missingScript.join(' · ')}`); }
  if (r.missingSurface.length) { bad++; fail(`선언된 생성물 파일 없음 ${r.missingSurface.length}: ${r.missingSurface.join(' · ')}`); }
  if (r.undeclared.length) {
    bad++;
    fail(`우산 명령이 도는데 정본 목록에 선언되지 않은 단계 ${r.undeclared.length}: ${r.undeclared.join(', ')}`);
    fail('  → canon-manifest.json 의 해당 정본 surfaces[].regen 에 추가하세요(정본↔파생 관계가 목록 밖에 있으면 감시 사각지대가 됩니다).');
  }
  if (r.contradiction.length) { bad++; fail(`정본이면서 파생으로도 선언됨(모순) ${r.contradiction.length}: ${r.contradiction.join(', ')}`); }

  if (!bad) {
    pass(`정본 ${r.canon.length}벌 · 파생 표면 ${r.surfaces.length}개 선언 ↔ 배선 일치 (우산 단계 ${r.reconcileSteps.length}개 전부 선언됨)`);
  }
  if (r.unwired.length) warn(`재생성 경로 미선언 표면 ${r.unwired.length}: ${r.unwired.join(' · ')}`);
  if (r.outsideUmbrella.length) {
    warn(`우산 명령 밖에서만 재생성되는 표면 ${r.outsideUmbrella.length}: ${r.outsideUmbrella.join(' · ')}`);
  }
  return r;
}

module.exports = { check, audit };

if (require.main === module) {
  let bad = 0;
  const pass = (m) => console.log(`  ✅ ${m}`);
  const warn = (m) => console.log(`  ⚠️  ${m}`);
  const fail = (m) => { bad++; console.log(`  ❌ ${m}`); };
  console.log('\n🔎 [Gate 36] 정본목록 검사기 (Canon Manifest)');
  let r;
  try { r = check({ pass, warn, fail }); }
  catch (e) { console.error(`  ❌ 실행 실패: ${e.message}`); process.exit(1); }
  if (r) {
    console.log(`CANONMAN_SUMMARY canon=${r.canon.length} surfaces=${r.surfaces.length} undeclared=${r.undeclared.length} unwired=${r.unwired.length} missing=${r.missingCanon.length + r.missingSurface.length}`);
  }
  process.exit(bad > 0 ? 1 : 0);
}
