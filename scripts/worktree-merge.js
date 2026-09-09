#!/usr/bin/env node
'use strict';
/**
 * worktree-merge.js — 별도 작업 폴더의 결과를 본 폴더 main 에 합친다. (npm run wt:merge)
 *
 * 흐름 (부딪힘은 별도 폴더 안에서만 풀고, 본 폴더 main 은 항상 "앞으로만" 간다):
 *   1. 이 폴더·본 폴더 둘 다 커밋 안 된 변경이 없어야 한다
 *   2. 본 폴더 main 을 원격(origin/main)과 맞춘다 (fast-forward 만, 갈라졌으면 중단)
 *   3. 이 브랜치에 main 을 먼저 들여온다 (git merge main)
 *      → 부딪히면 여기서 멈추고 파일 목록 + 처리 힌트(자동 생성 파일은 재생성 명령)를 보인다.
 *        해결 → git add → git commit → 다시 npm run wt:merge
 *   4. 본 폴더 main 을 이 브랜치로 fast-forward (합치기 커밋 없음, 검문소는 이미 이 폴더 커밋마다 돌았다)
 *   5. 본 폴더에서 반복요청 낱장 접기(rr fold) + 검사기 전체(gate:check). 실패면 main 을 합치기 전으로 되돌린다
 *   6. 원격에 push (--no-push 로 생략)
 *
 * 옵션: --no-push · --dry-run(무엇을 할지 보이기만)
 * 상세 운영 규칙: .claude/docs/worktree-workflow.md
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const wt = require('./lib/worktree');

const ROOT = wt.checkoutRoot(path.resolve(__dirname, '..'));
const MAIN = wt.mainRoot(ROOT);
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const NO_PUSH = argv.includes('--no-push');
const MAIN_BRANCH = 'main';

/** 부딪힌 파일에 붙이는 힌트 — 자동 생성 파일은 손으로 풀지 말고 재생성한다. */
const REGEN_HINTS = [
  [/^ui-library\/dist\//, 'npm run ui:build'],
  [/^ui-library\/verification\/bundle-parity\.json$/, 'npm run ui:build'],
  [/^assets\/downloads\/.*ui.*\.zip$/, 'npm run ui:zip'],
  [/^assets\/downloads\/.*installer.*\.zip$/, 'npm run installer:build'],
  [/^plugins\/figma-vars-installer\/dist\//, 'npm run installer:build'],
  [/^assets\/css\/(tokens|typography)\.css$/, 'npm run tokens:reconcile'],
  [/^registry\/tokens\//, 'npm run tokens:reconcile'],
  [/^registry\/components\/component-facts\.json$/, 'npm run components:facts:write'],
  [/^registry\/components\/component-guide-model\.json$/, 'npm run components:guide-model:write'],
  [/^design\/DESIGN.*\.md$/, 'npm run design:md:write'],
  [/^reports\/repeated-requests\/patterns\//, '본 폴더에서만 쓰는 파일 — 별도 폴더는 낱장(inbox)만 쓴다. 양쪽 다 살리고 count 를 합산'],
  [/^CLAUDE\.md$/, '변경 이력 표는 최근 1건만 남기고, 밀려난 줄은 reports/changelog-archive.md 로'],
];

/**
 * 자식 프로세스 환경 — npm 이 끼워 넣는 PATH 항목(작업 폴더의 node_modules/.bin, 조상 폴더들)을
 * 뺀 깨끗한 PATH 를 쓴다. 별도 폴더의 node_modules 는 본 폴더로 향하는 symlink 라, npm run 안에서
 * 그 PATH 로 git/npm 을 찾으면 macOS 가 ELOOP 로 실패했다(2026-09-09 실측 — 실패가 5단계에서
 * '빈 이유'로 나오던 진짜 원인). node 는 PATH 를 안 타도록 process.execPath 로 고정한다.
 */
const CLEAN_PATH = (process.env.PATH || '').split(path.delimiter)
  .filter((p) => p && !/[\\/]node_modules[\\/]\.bin[\\/]?$/.test(p))
  .join(path.delimiter);
const CHILD_ENV = Object.assign({}, process.env, { PATH: CLEAN_PATH });
for (const k of Object.keys(CHILD_ENV)) if (k.startsWith('npm_')) delete CHILD_ENV[k];

function run(cmd, args, cwd, opts = {}) {
  const bin = cmd === 'node' ? process.execPath : cmd;
  const r = spawnSync(bin, args, { cwd, encoding: 'utf8', stdio: opts.inherit ? 'inherit' : 'pipe', env: CHILD_ENV });
  // 실행 자체가 안 된 경우(status=null) 이유를 잃지 않는다 — 빈 실패 메시지가 나오던 원인.
  if (r.error) return { code: -1, out: '', err: `실행 실패(${cmd}): ${r.error.message}` };
  return { code: r.status === null ? -1 : r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}
const git = (args, cwd = ROOT, opts) => run('git', args, cwd, opts);

function die(msg) { console.error(`\n❌ ${msg}`); process.exit(1); }
function step(s) { console.log(`\n▶ ${s}`); }

function dirty(cwd) {
  const r = git(['status', '--porcelain'], cwd);
  return r.out ? r.out.split('\n') : [];
}

function hintFor(file) {
  for (const [re, hint] of REGEN_HINTS) if (re.test(file)) return hint;
  return '손으로 해결(양쪽 변경을 읽고 정본 규칙에 맞게)';
}

// ── 0. 위치 확인 ───────────────────────────────────────────────────────────
if (ROOT === MAIN) die('본 폴더에서는 wt:merge 를 쓰지 않습니다 — 별도 작업 폴더(.claude/worktrees/<이름>) 안에서 실행하세요.');
const branch = wt.currentBranch(ROOT);
if (branch === MAIN_BRANCH || branch === 'HEAD') die(`이 폴더의 브랜치가 ${branch} 입니다 — 작업 브랜치에서만 합칩니다.`);
const mainBranchNow = wt.currentBranch(MAIN);
if (mainBranchNow !== MAIN_BRANCH) die(`본 폴더가 ${MAIN_BRANCH} 이 아니라 ${mainBranchNow} 에 있습니다. 본 폴더를 ${MAIN_BRANCH} 으로 되돌린 뒤 다시 실행하세요.`);

console.log(`wt:merge — \`${branch}\` (${path.relative(MAIN, ROOT)}) → 본 폴더 ${MAIN_BRANCH}${DRY ? ' [dry-run]' : ''}`);

// ── 1. 양쪽 깨끗한가 ───────────────────────────────────────────────────────
step('1/6 커밋 안 된 변경 확인');
const d1 = dirty(ROOT);
if (d1.length) die(`이 폴더에 커밋 안 된 변경 ${d1.length}건 — 먼저 커밋하세요.\n   ${d1.slice(0, 12).join('\n   ')}`);
const d2 = dirty(MAIN);
if (d2.length) die(`본 폴더에 커밋 안 된 변경 ${d2.length}건 — 본 폴더에서 일하는 세션이 먼저 커밋하거나 치워야 합니다.\n   ${d2.slice(0, 12).join('\n   ')}`);
console.log('   ✅ 둘 다 깨끗함');

// ── 2. 본 폴더 main ↔ 원격 ─────────────────────────────────────────────────
step('2/6 본 폴더 main 을 원격과 맞춤');
let remoteOk = false;
const f = git(['fetch', 'origin', MAIN_BRANCH], MAIN);
if (f.code === 0) {
  remoteOk = true;
  const lr = git(['rev-list', '--left-right', '--count', `${MAIN_BRANCH}...origin/${MAIN_BRANCH}`], MAIN).out.split(/\s+/).map(Number);
  const [ahead, behind] = lr;
  if (behind > 0 && ahead > 0) die(`본 폴더 main 이 원격과 갈라졌습니다 (앞 ${ahead} · 뒤 ${behind}). 본 폴더에서 먼저 정리하세요 (git pull --rebase 등).`);
  if (behind > 0) {
    if (!DRY) {
      const ff = git(['merge', '--ff-only', `origin/${MAIN_BRANCH}`], MAIN);
      if (ff.code !== 0) die(`원격 반영 실패: ${ff.err}`);
    }
    console.log(`   ✅ 원격 커밋 ${behind}건 들여옴`);
  } else console.log(`   ✅ 이미 최신${ahead ? ` (원격보다 ${ahead}건 앞섬 — 마지막에 push)` : ''}`);
} else {
  console.log('   ⚠️ 원격에 닿지 못함(오프라인?) — 로컬 main 기준으로 진행, push 생략');
}

// ── 3. main 을 이 브랜치에 먼저 들여온다 ────────────────────────────────────
step('3/6 main 을 이 브랜치에 들여옴 (부딪힘은 여기서 푼다)');
const behindMain = Number(git(['rev-list', '--count', `${branch}..${MAIN_BRANCH}`], ROOT).out || 0);
if (behindMain === 0) console.log('   ✅ main 의 새 커밋 없음 — 그대로 진행');
else if (DRY) console.log(`   (dry-run) main 커밋 ${behindMain}건을 들여올 예정`);
else {
  const m = git(['merge', '--no-edit', MAIN_BRANCH], ROOT);
  if (m.code !== 0) {
    const files = git(['diff', '--name-only', '--diff-filter=U'], ROOT).out.split('\n').filter(Boolean);
    console.error(`\n❌ 부딪힌 파일 ${files.length}개 — 이 폴더에서 풀고 커밋한 뒤 다시 \`npm run wt:merge\``);
    for (const fp of files) console.error(`   · ${fp}\n       → ${hintFor(fp)}`);
    console.error('\n   자동 생성 파일은 손으로 고치지 말고: main 쪽을 받은 뒤(git checkout --theirs <파일> 또는 그대로) 위 명령으로 재생성 → git add');
    console.error('   전부 풀었으면: git add -A && git commit  (검문소가 돌아 통과해야 커밋됨)');
    console.error('   포기하려면: git merge --abort');
    process.exit(1);
  }
  console.log(`   ✅ main 커밋 ${behindMain}건 들여옴 (충돌 없음)`);
}

// ── 4. 본 폴더 main fast-forward ────────────────────────────────────────────
step('4/6 본 폴더 main 을 이 브랜치로 fast-forward');
const before = git(['rev-parse', MAIN_BRANCH], MAIN).out;
const newCommits = Number(git(['rev-list', '--count', `${MAIN_BRANCH}..${branch}`], MAIN).out || 0);
if (newCommits === 0) { console.log('   ✅ 새 커밋 없음 — 합칠 것이 없습니다'); process.exit(0); }
if (DRY) { console.log(`   (dry-run) 커밋 ${newCommits}건이 main 에 들어갈 예정 — 여기서 멈춤`); process.exit(0); }
const ff = git(['merge', '--ff-only', branch], MAIN);
if (ff.code !== 0) die(`fast-forward 실패(예상 밖): ${ff.err}`);
console.log(`   ✅ 커밋 ${newCommits}건 → main`);

function rollback(reason) {
  console.error(`\n❌ ${reason}\n   본 폴더 main 을 합치기 전(${before.slice(0, 7)})으로 되돌립니다. 이 브랜치의 커밋은 그대로 남아 있습니다.`);
  const r = git(['reset', '--hard', before], MAIN);
  git(['clean', '-fd', 'reports/repeated-requests'], MAIN);
  const now = git(['rev-parse', MAIN_BRANCH], MAIN).out;
  if (r.code !== 0 || now !== before) {
    console.error(`   ⚠️ 되돌리기 실패 — 본 폴더 main 이 ${now.slice(0, 7)} 입니다. 본 폴더에서 직접: git reset --hard ${before.slice(0, 7)}`);
    if (r.err) console.error(`      (${r.err.split('\n')[0]})`);
  } else {
    console.error('   ✅ 되돌림 완료 — 본 폴더는 합치기 전 상태입니다.');
  }
  process.exit(1);
}

// ── 5. 본 폴더에서 낱장 접기 + 검사기 ───────────────────────────────────────
step('5/6 본 폴더: 반복요청 낱장 접기 → 검사기 전체');
const foldR = run('node', ['scripts/repeated-requests.js', 'fold'], MAIN);
if (foldR.code !== 0) rollback(`낱장 접기 실패: ${foldR.err || foldR.out}`);
console.log(`   ${foldR.out}`);
const foldDirty = dirty(MAIN);
if (foldDirty.length) {
  git(['add', 'reports/repeated-requests'], MAIN);
  // 커밋 시 pre-commit 훅이 gate:check 를 돌린다 — 실패면 커밋이 막히고 아래에서 되돌린다.
  const c = git(['commit', '-m', `chore(rr): 반복요청 낱장 접기 (${branch})`], MAIN);
  if (c.code !== 0) rollback(`낱장 접기 커밋이 검문소에 막힘:\n${c.out}\n${c.err}`);
  console.log('   ✅ 낱장 접기 커밋 (검문소 통과)');
} else {
  const g = run('npm', ['run', '--silent', 'gate:check'], MAIN);
  if (g.code !== 0) rollback(`검사기 실패:\n${g.out}\n${g.err}`);
  console.log(`   ✅ 검사기 통과 — ${g.out.split('\n').filter(Boolean).slice(-1)[0] || ''}`);
}

// ── 6. push ────────────────────────────────────────────────────────────────
step('6/6 원격 push');
if (NO_PUSH) console.log('   (--no-push) 생략');
else if (!remoteOk) console.log('   원격에 닿지 못해 생략 — 나중에 본 폴더에서 git push');
else {
  const p = git(['push', 'origin', MAIN_BRANCH], MAIN);
  if (p.code !== 0) console.log(`   ⚠️ push 실패(합치기는 완료됨): ${p.err.split('\n')[0]}`);
  else console.log('   ✅ origin/main 갱신');
}

console.log(`\n✅ 합치기 완료 — \`${branch}\` 의 커밋 ${newCommits}건이 main 에 들어갔습니다.`);
console.log('   이 작업 폴더는 세션을 끝낼 때 정리됩니다(ExitWorktree). 같은 브랜치로 더 일해도 됩니다.');
