'use strict';
/**
 * worktree.js — "세션 하나 = 작업 폴더 하나" 운영의 공용 판독기.
 *
 * 하네스(Claude Code)는 `--worktree` 세션을 저장소 안 `.claude/worktrees/<이름>/` 에
 * 별도 브랜치로 연다. 그 폴더에서 돌아가는 스크립트는 "지금 본 폴더인가, 별도 폴더인가 ·
 * 본 폴더는 어디인가 · 세션 기록 폴더 이름은 무엇인가"를 이 모듈로 판독한다.
 *
 * 실측 (2026-09-09, Claude Code 2.1.263):
 *   · 별도 폴더 세션의 기록은 ~/.claude/projects/<본폴더-slug>--claude-worktrees-<이름>/ 에 쌓인다
 *     (본 폴더와 다른 폴더 → 기억(memory)·Gate 34 세션기록 대조가 그대로는 안 보인다).
 *   · git 훅(.git/hooks)은 본 저장소 것을 공유한다 → pre-commit 검문소는 별도 폴더에서도 발동.
 *   · node_modules 는 복사되지 않는다.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (_) {
    return null;
  }
}

function real(p) {
  try { return fs.realpathSync(p); } catch (_) { return path.resolve(p); }
}

/** 이 스크립트가 속한 체크아웃의 루트(별도 폴더면 그 폴더). */
function checkoutRoot(from) {
  const top = git('rev-parse --show-toplevel', from);
  return real(top || from);
}

/** 본 폴더(주 워크트리) 루트 — `.git` 공용 디렉터리의 부모. */
function mainRoot(from) {
  const common = git('rev-parse --git-common-dir', from);
  if (!common) return checkoutRoot(from);
  return real(path.dirname(path.resolve(from, common)));
}

function isLinkedWorktree(from) {
  return checkoutRoot(from) !== mainRoot(from);
}

/** 하네스의 세션 기록 폴더 이름 규칙: 경로의 / . _ 를 전부 '-' 로. */
function projectSlug(absPath) {
  return String(absPath).replace(/[/\\._]/g, '-');
}

function projectsBase() {
  return path.join(os.homedir(), '.claude', 'projects');
}

/**
 * 이 저장소의 세션 기록 폴더 전부 — 본 폴더 것 + 별도 폴더 것들.
 * (Gate 34 가 river 발화를 대조할 때 별도 폴더 세션의 기록도 봐야 한다.)
 */
function transcriptDirs(from) {
  const base = projectsBase();
  if (!fs.existsSync(base)) return [];
  const main = projectSlug(mainRoot(from));
  const here = projectSlug(checkoutRoot(from));
  const prefix = `${main}--claude-worktrees-`;
  return fs.readdirSync(base)
    .filter((n) => n === main || n === here || n.startsWith(prefix))
    .map((n) => path.join(base, n));
}

function currentBranch(from) {
  return git('rev-parse --abbrev-ref HEAD', from) || 'HEAD';
}

/** 파일 이름에 쓸 수 있는 브랜치 표기. */
function branchSlug(from) {
  return currentBranch(from).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'HEAD';
}

/** `git worktree list --porcelain` → [{ path, branch, isMain }] */
function listWorktrees(from) {
  const out = git('worktree list --porcelain', from);
  if (!out) return [];
  const main = mainRoot(from);
  const rows = [];
  let cur = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('worktree ')) {
      cur = { path: real(line.slice(9)), branch: null };
      rows.push(cur);
    } else if (cur && line.startsWith('branch ')) {
      cur.branch = line.slice(7).replace(/^refs\/heads\//, '');
    } else if (cur && line === 'detached') {
      cur.branch = '(detached)';
    }
  }
  for (const r of rows) r.isMain = r.path === main;
  return rows;
}

/**
 * 추적되면 안 되는 symlink — 별도 작업 폴더가 만드는 연결(node_modules · .claude/cache)이
 * git 에 들어가면, 본 폴더가 그 커밋을 받는 순간 **실제 폴더가 링크로 치환돼 사라진다**
 * (2026-09-09 실측: 본 폴더 node_modules 51MB 소실 · npm/git 이 ELOOP 로 조용히 실패).
 * 절대경로를 가리키는 링크도 다른 컴퓨터에서 깨지므로 함께 막는다.
 * 반환: [{ file, target, why }]
 */
function trackedRiskySymlinks(from) {
  const root = checkoutRoot(from);
  const out = git('ls-files -s', root);
  if (!out) return [];
  const bad = [];
  for (const line of out.split('\n')) {
    if (!line.startsWith('120000')) continue;              // symlink 모드
    const file = line.split('\t').slice(1).join('\t');
    let target = '';
    try { target = fs.readlinkSync(path.join(root, file)); } catch (_) {}
    const base = path.basename(file);
    if (base === 'node_modules' || file.includes('.claude/cache')) {
      bad.push({ file, target, why: '작업 폴더 연결용 링크 — 추적되면 본 폴더의 실제 폴더가 치환돼 사라진다' });
    } else if (path.isAbsolute(target)) {
      bad.push({ file, target, why: '절대경로 링크 — 다른 컴퓨터·다른 작업 폴더에서 깨진다' });
    }
  }
  return bad;
}

module.exports = {
  git, checkoutRoot, mainRoot, isLinkedWorktree, projectSlug, projectsBase,
  transcriptDirs, currentBranch, branchSlug, listWorktrees, trackedRiskySymlinks,
};
