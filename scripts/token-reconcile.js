#!/usr/bin/env node
/**
 * Token Reconcile — 정본(vars-data·textstyles-data)에서 파생 표면을 재생성해 싱크를 맞춘다. (site-base 는 사이트 전용·Variables 검수 제외)
 *
 * 자동 재생성(결정론적) — 순서가 곧 의존성이다 (2026-08-01 확장: 누락 3단계 편입 + 순서 함정 내재화 · 2026-08-03 typo:gen 편입 9→10단계):
 *   1. typo:gen               textstyles-data → typography.css (텍스트 스타일 정본 — Gate 35 표면)
 *   2. tokens:gen             vars-data SEMANTIC_COLOR → tokens.css Semantic 섹션
 *   3. tokens:gen:foundation  vars-data FOUNDATION_* → tokens.css Foundation 섹션
 *   4. color:gen              vars-data → foundation.html 색 팔레트 3블록
 *   5. number:gen             vars-data → foundation.html number 5블록
 *   6. registry:foundation:gen vars-data → registry/tokens/foundation.colors.json (Gate 7 표면)
 *   7. page:gen               tokens.css → semantic.html SEMANTIC_PAGE   (2·3 뒤여야 함)
 *   8. components:facts:write build-components 실제 실행 → component-facts.json
 *   9. components:guide-model:write build-components 실제 scene graph → component-guide-model.json
 *  10. design:md:write        tokens.css+component facts+registry → DESIGN.core/vms.md
 *  11. tokens:sync-prompt     tokens.css + design/*.md → install-prompt.html (10 뒤여야 함)
 *  12. installer:build        vars-data+textstyles-data → 설치기 zip (+ ~/s1-ux-design-guide-installer)
 *
 * pages/components.html은 손관리 화면이다. 이 명령은 사이트를 생성하거나 덮어쓰지 않는다.
 *
 * 그 후 모니터 실행 → 자동 재생성으로 못 고치는 **손유지 표면**의 잔여 드리프트를 보고한다.
 * 이 잔여분은 token-sync 에이전트/수동으로 정본에 맞춰 고친다(값 추측 금지).
 *
 * 사용: npm run tokens:reconcile  [--no-installer]
 */
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const skipInstaller = process.argv.includes('--no-installer');

function run(label, cmd) {
  // 성공 단계는 1줄로 접는다 — 자식 출력 상세는 실패 시에만 (대화 컨텍스트 절약, 2026-08-12)
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe' });
    process.stdout.write(`▶ ${label} ✅\n`);
    return true;
  } catch (e) {
    process.stdout.write(`\n▶ ${label}\n`);
    process.stdout.write(`   ⚠️ ${label} 실패: ${(e.stdout || e.message).toString().slice(0, 300)}\n`);
    return false;
  }
}

console.log('\n🔧 Token Reconcile — 정본 → 파생 표면 재생성\n');

// 0단계: 텍스트 스타일 정본(textstyles-data.ts) → typography.css.
//   2026-08-03 편입 — 종전 우산은 vars-data 만 봐서 **텍스트 스타일을 추가해도 파생이 안 따라왔다**.
//   Gate 35 가 그 어긋남을 잡는다.
run('1/12 typo:gen              (textstyles-data → assets/css/typography.css)', 'npm run --silent typo:gen');
run('2/12 tokens:gen            (vars-data → tokens.css Semantic)', 'npm run --silent tokens:gen');
run('3/12 tokens:gen:foundation (vars-data → tokens.css Foundation)', 'npm run --silent tokens:gen:foundation');
run('4/12 color:gen             (vars-data → foundation.html 색 팔레트)', 'npm run --silent color:gen');
run('5/12 number:gen            (vars-data → foundation.html number 5종)', 'npm run --silent number:gen');
run('6/12 registry:foundation:gen (vars-data → registry/tokens/foundation.colors.json)', 'npm run --silent registry:foundation:gen');
run('7/12 page:gen              (tokens.css → semantic.html SEMANTIC_PAGE)', 'npm run --silent page:gen');
run('8/12 components:facts:write (build-components → component-facts.json)', 'npm run --silent components:facts:write');
run('9/12 components:guide-model:write (build-components → component-guide-model.json)', 'npm run --silent components:guide-model:write');
run('10/12 design:md:write       (tokens+facts+registry → DESIGN.core/vms.md)', 'npm run --silent design:md:write');
run('11/12 tokens:sync-prompt   (tokens.css+design md → install-prompt.html)', 'npm run --silent tokens:sync-prompt');
if (!skipInstaller) {
  run('12/12 installer:build       (vars-data → 설치기 zip)', 'npm run --silent installer:build');
} else {
  console.log('\n▶ 12/12 installer:build — 건너뜀(--no-installer)');
}

console.log('\n──────────────────────────────────────────────');
console.log('🛰️  재생성 후 모니터 — 잔여 드리프트(손유지 표면)는 직접 수정 필요:\n');

let monitorFailed = false;
try {
  execSync('node scripts/token-sync-monitor.js', { cwd: ROOT, stdio: 'pipe' });
  console.log('   토큰 값 모니터 ✅ — 전 표면 정본 일치');
} catch (e) {
  monitorFailed = true;
  process.stdout.write(((e.stdout || '') + (e.stderr || '')).toString());
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
try {
  execSync('node scripts/sync-install-prompt.js --check', { cwd: ROOT, stdio: 'pipe' });
  console.log('   install-prompt 권위 검증 ✅ (#code-full · #code-ai)');
} catch (e) {
  process.stdout.write(((e.stdout || '') + (e.stderr || '')).toString());
  console.log('\n🔴 install-prompt 가 정본과 불일치(누락/드리프트) — `npm run tokens:sync-prompt` 후 재확인.');
  process.exit(1);
}

console.log('\n✅ Reconcile 완료 — 모든 표면 정본과 일치.');
