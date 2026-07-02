#!/usr/bin/env node
/**
 * Token Reconcile — 정본(vars-data)에서 파생 표면을 재생성해 싱크를 맞춘다. (site-base 는 사이트 전용·Variables 검수 제외)
 *
 * 자동 재생성(결정론적):
 *   1. tokens:gen        vars-data SEMANTIC_COLOR → tokens.css Semantic 섹션
 *   2. tokens:sync-prompt tokens.css → install-prompt.html (다운로드 인라인)
 *   3. installer:build   vars-data → 설치기 zip (+ ~/s1-ux-design-guide-installer)
 *
 * 그 후 모니터 실행 → 자동 재생성으로 못 고치는 **손유지 표면**(semantic.html hex·
 * registry/semantic.colors.json·sw-v2.4.tokens.css 등)의 잔여 드리프트를 보고한다.
 * 이 잔여분은 token-sync 에이전트/수동으로 정본에 맞춰 고친다(값 추측 금지).
 *
 * 사용: npm run tokens:reconcile  [--no-installer]
 */
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const skipInstaller = process.argv.includes('--no-installer');

function run(label, cmd) {
  process.stdout.write(`\n▶ ${label}\n`);
  try {
    const out = execSync(cmd, { cwd: ROOT, stdio: 'pipe' }).toString();
    process.stdout.write(out.split('\n').filter(Boolean).slice(-4).map(l => '   ' + l).join('\n') + '\n');
    return true;
  } catch (e) {
    process.stdout.write(`   ⚠️ ${label} 실패: ${(e.stdout || e.message).toString().slice(0, 300)}\n`);
    return false;
  }
}

console.log('\n🔧 Token Reconcile — 정본 → 파생 표면 재생성\n');

run('1/5 tokens:gen      (vars-data → tokens.css Semantic)', 'npm run --silent tokens:gen');
run('2/5 page:gen        (tokens.css → semantic.html SEMANTIC_PAGE)', 'npm run --silent page:gen');
run('3/5 number:gen      (vars-data → foundation.html number 5종)', 'npm run --silent number:gen');
run('4/5 tokens:sync-prompt (tokens.css → install-prompt.html)', 'npm run --silent tokens:sync-prompt');
if (!skipInstaller) {
  run('5/5 installer:build  (vars-data → 설치기 zip)', 'npm run --silent installer:build');
} else {
  console.log('\n▶ 5/5 installer:build — 건너뜀(--no-installer)');
}

console.log('\n──────────────────────────────────────────────');
console.log('🛰️  재생성 후 모니터 — 잔여 드리프트(손유지 표면)는 직접 수정 필요:\n');

let monitorFailed = false;
try {
  execSync('node scripts/token-sync-monitor.js', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  monitorFailed = true;
}

if (monitorFailed) {
  console.log('\n🔴 잔여 드리프트 있음 — 위 ❌ 표면은 자동 생성 대상이 아니다(손유지).');
  console.log('   정본에 맞춰 수동/에이전트 수정 후 `npm run tokens:monitor` 재확인.');
  process.exit(1);
}

// ── install-prompt 권위 검증 (값 모니터의 완전성 사각지대 보완) ─────────────
//   값 모니터(위)는 install-prompt 를 "있는 토큰의 값"만 보고 "토큰 누락"은 못 잡는다
//   (semantic.html 만 complete 검사). 그래서 4/5 sync-prompt 가 조용히 헛돌아도
//   모니터는 "일치"로 통과시킨다(2026-06-16 발견된 사각지대).
//   sync-install-prompt --check 는 #code-full(다운로드)·#code-ai(AI 컨텍스트 프롬프트)
//   둘 다 tokens.css 와 완전 일치하는지 검사(exit 1 if diff) → stale 시 reconcile 실패.
console.log('\n🔎 install-prompt 동기화 권위 검증 (#code-full · #code-ai):');
try {
  execSync('node scripts/sync-install-prompt.js --check', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.log('\n🔴 install-prompt 가 정본과 불일치(누락/드리프트) — `npm run tokens:sync-prompt` 후 재확인.');
  process.exit(1);
}

console.log('\n✅ Reconcile 완료 — 모든 표면 정본과 일치.');
