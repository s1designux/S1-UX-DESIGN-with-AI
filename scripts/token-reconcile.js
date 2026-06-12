#!/usr/bin/env node
/**
 * Token Reconcile — 정본(vars-data·site-base)에서 파생 표면을 재생성해 싱크를 맞춘다.
 *
 * 자동 재생성(결정론적):
 *   1. tokens:gen        vars-data SEMANTIC_COLOR → tokens.css Semantic 섹션
 *   2. tokens:sync-prompt tokens.css → install-prompt.html (다운로드 인라인)
 *   3. installer:build   vars-data → 설치기 zip (+ ~/s1-design-system-installer)
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

run('1/4 tokens:gen      (vars-data → tokens.css Semantic)', 'npm run --silent tokens:gen');
run('2/4 page:gen        (tokens.css → semantic.html SEMANTIC_PAGE)', 'npm run --silent page:gen');
run('3/4 tokens:sync-prompt (tokens.css → install-prompt.html)', 'npm run --silent tokens:sync-prompt');
if (!skipInstaller) {
  run('4/4 installer:build  (vars-data → 설치기 zip)', 'npm run --silent installer:build');
} else {
  console.log('\n▶ 4/4 installer:build — 건너뜀(--no-installer)');
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
console.log('\n✅ Reconcile 완료 — 모든 표면 정본과 일치.');
