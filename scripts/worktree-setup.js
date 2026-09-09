#!/usr/bin/env node
'use strict';
/**
 * worktree-setup.js — 세션 시작 훅(SessionStart). "세션 하나 = 작업 폴더 하나" 준비.
 *
 * 별도 작업 폴더(.claude/worktrees/<이름>)에서 세션이 열리면 본 폴더에만 있는 것들을 잇는다:
 *   ① node_modules → 본 폴더 것을 symlink (검문소·검사기가 바로 돈다, npm install 불필요)
 *   ② 저장소에 안 올리는 로컬 파일(.env 등) → 복사
 *   ③ .claude/cache (문서 색인) → symlink
 *   ④ 기억(memory) → 이 폴더의 세션기록 폴더에 본 폴더 memory 를 symlink
 *      (하네스는 별도 폴더 세션의 기록을 다른 폴더에 쌓아, 그대로면 기억이 안 보인다)
 * 그리고 세션(⭐)에게 "지금 어느 폴더·브랜치인지, 끝나면 무엇을 하는지" 한 줄을 남긴다.
 *
 * 본 폴더에서 열린 세션에는 진행 중인 다른 작업 폴더 목록만 알린다.
 * 항상 exit 0 — 준비가 실패해도 세션을 막지 않는다(막힘은 출력으로만 알린다).
 *
 * 수동 실행: node scripts/worktree-setup.js   (npm run wt:setup)
 * 상세 운영 규칙: .claude/docs/worktree-workflow.md
 */
const fs = require('fs');
const path = require('path');
const wt = require('./lib/worktree');

const ROOT = wt.checkoutRoot(path.resolve(__dirname, '..'));
const MAIN = wt.mainRoot(ROOT);
const out = [];
const say = (s) => out.push(s);

const LOCAL_FILES = [
  '.env',
  '.env.local',
  'registry/figma/figma-variable-metadata.local.json',
  'data/.figma-raw-metadata.json',
];

function linkIfMissing(target, linkPath, label) {
  if (fs.existsSync(linkPath)) return false;
  if (!fs.existsSync(target)) { say(`   ⚠️ ${label}: 본 폴더에 없음(${path.relative(MAIN, target) || target}) — 건너뜀`); return false; }
  try {
    fs.mkdirSync(path.dirname(linkPath), { recursive: true });
    fs.symlinkSync(target, linkPath, 'dir');
    return true;
  } catch (e) {
    say(`   ⚠️ ${label} 연결 실패: ${e.message}`);
    return false;
  }
}

function setupLinkedWorktree() {
  const rel = path.relative(MAIN, ROOT);
  const branch = wt.currentBranch(ROOT);
  const done = [];

  if (linkIfMissing(path.join(MAIN, 'node_modules'), path.join(ROOT, 'node_modules'), 'node_modules')) done.push('node_modules');
  if (linkIfMissing(path.join(MAIN, '.claude', 'cache'), path.join(ROOT, '.claude', 'cache'), '문서 색인 캐시')) done.push('.claude/cache');

  for (const f of LOCAL_FILES) {
    const src = path.join(MAIN, f);
    const dst = path.join(ROOT, f);
    if (!fs.existsSync(src) || fs.existsSync(dst)) continue;
    try {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      done.push(f);
    } catch (e) {
      say(`   ⚠️ ${f} 복사 실패: ${e.message}`);
    }
  }

  // 기억 브리지 — 별도 폴더 세션의 기록 폴더에 본 폴더 memory 를 잇는다.
  const mainMemory = path.join(wt.projectsBase(), wt.projectSlug(MAIN), 'memory');
  const hereProj = path.join(wt.projectsBase(), wt.projectSlug(ROOT));
  const hereMemory = path.join(hereProj, 'memory');
  let memoryFresh = false;
  if (fs.existsSync(mainMemory) && !fs.existsSync(hereMemory)) {
    try {
      fs.mkdirSync(hereProj, { recursive: true });
      fs.symlinkSync(mainMemory, hereMemory, 'dir');
      done.push('memory');
      memoryFresh = true;
    } catch (e) {
      say(`   ⚠️ 기억 연결 실패: ${e.message}`);
    }
  }

  say(`📂 별도 작업 폴더 세션 — 브랜치 \`${branch}\` · 폴더 \`${rel}\` · 본 폴더 \`${MAIN}\``);
  if (done.length) say(`   준비됨: ${done.join(' · ')}`);
  say('   규칙: 이 폴더 안에서만 작업 · 끝나면 커밋 → `npm run wt:merge` 로 main 에 합친다 · 상세 `.claude/docs/worktree-workflow.md`');

  if (memoryFresh) {
    // 이 세션은 기억 없이 시작했을 수 있다 — 색인만 여기서 대신 보여준다(다음 세션부터는 자동).
    const idx = path.join(mainMemory, 'MEMORY.md');
    if (fs.existsSync(idx)) {
      say('   기억 색인(이번 세션만 여기서 대신 로드 — 파일은 본 폴더 memory/ 에 있음):');
      const body = fs.readFileSync(idx, 'utf8').split('\n').filter((l) => l.trim()).slice(0, 60);
      for (const l of body) say('   ' + l);
    }
  }
}

function reportOthers() {
  const others = wt.listWorktrees(ROOT).filter((w) => w.path !== ROOT);
  if (!others.length) return;
  const names = others.map((w) => `${w.isMain ? '본 폴더' : path.basename(w.path)}(${w.branch || '?'})`);
  say(`🧭 진행 중인 다른 작업 폴더 ${others.length}개: ${names.join(' · ')}`);
}

function warnStaleLedger() {
  if (fs.existsSync(path.join(ROOT, 'reports', 'repeated-requests.json'))) {
    say('   ⚠️ 옛 단일 장부 `reports/repeated-requests.json` 이 남아 있음 — 정본은 `reports/repeated-requests/` 폴더(낱장). `npm run rr -- check` 참조');
  }
  const inbox = path.join(ROOT, 'reports', 'repeated-requests', 'inbox');
  if (ROOT === MAIN && fs.existsSync(inbox)) {
    const sheets = fs.readdirSync(inbox).filter((n) => n.endsWith('.jsonl'));
    if (sheets.length) say(`   📎 반복요청 낱장 ${sheets.length}장 미접힘 — \`npm run rr -- fold\``);
  }
}

try {
  if (ROOT !== MAIN) {
    setupLinkedWorktree();
  } else {
    const others = wt.listWorktrees(ROOT).filter((w) => !w.isMain);
    say(`📂 본 폴더 세션(\`${wt.currentBranch(ROOT)}\`) — 본 폴더는 합치기·소규모 작업 전용. 큰 작업은 별도 폴더에서(\`.claude/docs/worktree-workflow.md\`)${others.length ? '' : ' · 진행 중인 별도 폴더 없음'}`);
  }
  reportOthers();
  warnStaleLedger();
} catch (e) {
  say(`⚠️ worktree-setup 실패(세션은 계속): ${e.message}`);
}

process.stdout.write(out.join('\n') + '\n');
process.exit(0);
