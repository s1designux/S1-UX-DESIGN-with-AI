#!/usr/bin/env node
/**
 * screen-rebuild-evidence-check.js  (Gate 40 — 화면 재현 근거 검사기)
 * ─────────────────────────────────────────────────────────────────────────
 * "이 화면 작업이 **무엇을 기준으로 맞다고 판정됐는지**"의 근거가 실제로 남아 있나를 본다.
 *
 * ★ 왜 필요한가(2026-08-24 판독): 이 하네스의 규칙은 대부분 문서(SKILL.md·references)에
 *   있고, 문서는 **읽기로 선택해야** 작동한다. 실제로 이번 세션에서 터진 문제 3개 중 2개가
 *   "규칙은 이미 있는데 안 걸림" 유형이었다.
 *     - fast-safe 규칙은 이미 있었는데 발동 안 함 → 검증자 128K 토큰
 *     - 상태 검사기는 8/21부터 실패 중이었는데 게이트 미배선이라 3일간 아무도 모름
 *   게이트는 "잊어버림"을 막는 유일한 층이다.
 *
 * ★ 기준(baseline)은 작업마다 다르다 — 무엇을 요구할지 선언에 따라 바꾼다:
 *     legacy          레거시 원본을 재현       → 원본 전수표(1-inventory.md)
 *     existing-nodes  이미 있는 노드를 수정     → 스냅샷 3종 + snapdiff 통과 기록
 *     intent-spec     레거시 없이 신규 제작     → 의도 선언서 + 승인
 *   여러 개 동시 선언 가능(예: 레거시 재현인데 기존 노드도 고침).
 *
 * ★ 왜 intent-spec 에 선언서를 요구하나: 레거시가 없다는 것은 "자유롭게 만들어도 된다"가
 *   아니라 "기준을 사람이 줘야 한다"는 뜻이다. 근거 없이 에이전트가 빈자리를 메우는 것이
 *   하드룰 H6② 가 막는 바로 그 실패이고, 이 스킬이 태어난 원인(원본을 안 읽고 지어냄)이다.
 *
 * 판정: 현재 **warn 단계**(기록만, 커밋 차단 안 함). 스냅샷 흐름이 실전 1~2회 돌아
 *       안정되면 `--strict` 를 기본값으로 승격한다(사용자 결정 2026-08-24).
 *       기존 부채는 evidence.exempt 로 동결 — 신규만 본다(래칫, Gate 19/20/29/30 과 동일 방식).
 *
 * 선언 위치: reports/screen-rebuild/{service}/{flow}/workflow-state.json 의 `evidence`
 *   {
 *     "baseline": ["existing-nodes"],
 *     "snapdiff": { "ranAt": "2026-08-24", "violations": 0, "by": "component-verifier" },
 *     "intent":   { "doc": "intent.md", "approvedBy": "river", "approvedAt": "..." },
 *     "exempt":   { "reason": "...", "at": "..." }
 *   }
 *
 * 출력 끝줄: `SREVIDENCE_SUMMARY flows=<n> ok=<n> missing=<n> undeclared=<n> exempt=<n>`
 * 사용: node scripts/screen-rebuild-evidence-check.js [--strict]  (npm run screen-rebuild:evidence)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = path.join(ROOT, 'reports/screen-rebuild');
const STRICT = process.argv.includes('--strict');

const VALID = ['legacy', 'existing-nodes', 'intent-spec'];

// baseline 종류별 요구 산출물
const REQUIRED = {
  'legacy': [
    { file: '1-inventory.md', why: '레거시 원본 전수표 — 무엇을 베꼈는지의 근거' },
  ],
  'existing-nodes': [
    { file: 'snapshot-before.json', why: '변경 전 구조 — 없으면 부수 피해 0 을 증명할 수 없다' },
    { file: 'snapshot-expect.json', why: '무엇을 바꿀 것인지 사전 선언' },
    { file: 'snapshot-after.json', why: '변경 후 구조' },
  ],
  'intent-spec': [
    { file: 'intent.md', why: '레거시가 없으므로 사람이 준 기준 — 없으면 착수 자체가 금지' },
  ],
};

function listFlows() {
  const out = [];
  if (!fs.existsSync(BASE)) return out;
  for (const svc of fs.readdirSync(BASE)) {
    const sp = path.join(BASE, svc);
    if (!fs.statSync(sp).isDirectory()) continue;
    for (const flow of fs.readdirSync(sp)) {
      const fp = path.join(sp, flow);
      if (!fs.statSync(fp).isDirectory()) continue;
      if (fs.existsSync(path.join(fp, 'workflow-state.json'))) out.push({ svc, flow, dir: fp });
    }
  }
  return out;
}

function checkFlow(f) {
  const rel = `${f.svc}/${f.flow}`;
  let st;
  try { st = JSON.parse(fs.readFileSync(path.join(f.dir, 'workflow-state.json'), 'utf8')); }
  catch (e) { return { rel, kind: 'broken', notes: [`workflow-state.json 파싱 실패: ${e.message}`] }; }

  const ev = st.evidence;
  if (ev && ev.exempt && ev.exempt.reason) {
    return { rel, kind: 'exempt', notes: [ev.exempt.reason] };
  }
  if (!ev || !Array.isArray(ev.baseline) || !ev.baseline.length) {
    return { rel, kind: 'undeclared', notes: ['evidence.baseline 선언 없음 — 무엇을 기준으로 맞다고 판정했는지 알 수 없다'] };
  }

  const bad = ev.baseline.filter((b) => !VALID.includes(b));
  if (bad.length) return { rel, kind: 'missing', notes: [`알 수 없는 baseline 값: ${bad.join(', ')} (허용: ${VALID.join(' | ')})`] };

  const notes = [];
  for (const b of ev.baseline) {
    for (const req of REQUIRED[b]) {
      if (!fs.existsSync(path.join(f.dir, req.file))) notes.push(`[${b}] ${req.file} 없음 — ${req.why}`);
    }
  }
  // existing-nodes 는 파일 존재만으로 부족하다 — diff 가 실제로 통과했다는 기록이 있어야 한다
  if (ev.baseline.includes('existing-nodes')) {
    const sd = ev.snapdiff;
    if (!sd || typeof sd.violations !== 'number') notes.push('[existing-nodes] evidence.snapdiff 기록 없음 — npm run snapdiff 결과(violations)를 남길 것');
    else if (sd.violations !== 0) notes.push(`[existing-nodes] snapdiff 위반 ${sd.violations}건이 미해소 상태로 기록돼 있음`);
  }
  if (ev.baseline.includes('intent-spec')) {
    const it = ev.intent;
    if (!it || !it.approvedBy) notes.push('[intent-spec] evidence.intent.approvedBy 없음 — 레거시가 없는 작업은 사람 승인이 기준을 대신한다');
  }

  return { rel, kind: notes.length ? 'missing' : 'ok', notes };
}

function main() {
  const flows = listFlows();
  const results = flows.map(checkFlow);
  const by = (k) => results.filter((r) => r.kind === k);

  console.log('🔎 화면 재현 근거 검사기 (Screen Rebuild Evidence) — Gate 40');
  console.log(`  대상 플로우 ${flows.length}개 · 기준 선언 = workflow-state.json 의 evidence.baseline`);

  const missing = by('missing'), undeclared = by('undeclared'), broken = by('broken'), exempt = by('exempt');
  const okN = by('ok').length;

  if (broken.length) {
    console.log('  ❌ 상태 파일 문제:');
    broken.forEach((r) => r.notes.forEach((n) => console.log(`     - ${r.rel}: ${n}`)));
  }
  if (missing.length) {
    console.log('  ⚠️ 근거 산출물 누락:');
    missing.forEach((r) => r.notes.forEach((n) => console.log(`     - ${r.rel}: ${n}`)));
  }
  if (undeclared.length) {
    console.log('  ⚠️ 기준 미선언:');
    undeclared.forEach((r) => console.log(`     - ${r.rel}: ${r.notes[0]}`));
    console.log('       → workflow-state.json 에 "evidence": { "baseline": ["legacy"|"existing-nodes"|"intent-spec"] } 를 넣는다.');
    console.log('       → 규약 신설(2026-08-24) 이전 작업이면 evidence.exempt.reason 으로 동결한다.');
  }
  if (exempt.length) console.log(`  ℹ️ 동결(기존 부채) ${exempt.length}건 — 신규 작업만 검사한다.`);

  const problems = broken.length + missing.length + undeclared.length;
  if (!problems) console.log(`  ✅ 근거 선언·산출물 정합 — ok ${okN} · 동결 ${exempt.length}`);

  console.log(`SREVIDENCE_SUMMARY flows=${flows.length} ok=${okN} missing=${missing.length} undeclared=${undeclared.length} exempt=${exempt.length}`);

  if (problems && STRICT) process.exit(1);
  process.exit(0);
}

main();
