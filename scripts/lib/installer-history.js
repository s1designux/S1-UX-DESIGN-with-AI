'use strict';
/**
 * installer-history.js — 과거 시점의 설치기 소스를 꺼내 지문을 계산하고, 릴리스 앵커를 정한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 이전 상태를 **파일로 저장하지 않는다.** git 이 이미 갖고 있는 것을 꺼내 같은 계산을 다시 돌린다.
 *   → 값 사본 0. 저장소가 반복해 데인 "사본 → 드리프트" 패턴(BACKLOG.md)을 피한다.
 *
 * 앵커 정의 (시간간격 군집 + 지문 스킵):
 *   지문이 지금과 다른 첫 커밋까지 걸어가되, "같은 릴리스"로 묶인 커밋 뭉치는 통째로 건너뛴다.
 *   · 커밋 전 여러 번 빌드해도 결과가 안 흔들린다 (지문이 같은 커밋은 무시하므로)
 *   · 커밋 후 재빌드해도 "변경 없음"이 안 된다  (같은 이유)
 *   · 같은 날 여러 번 커밋한 한 릴리스를 하나로 묶는다 (간격 군집)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { fingerprint, SOURCE_FILES } = require('./installer-fingerprint');
const { extractTar } = require('./extract-tar');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC_REL = 'plugins/figma-vars-installer/src';

/** 같은 릴리스로 묶을 커밋 간격 상한. 07-29 작업(2.5h 간격 3커밋)을 묶고 07-15 와 분리하는 폭. */
const CLUSTER_GAP_HOURS = 36;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** 정본 소스 4개를 건드린 커밋을 최신순으로. */
function sourceCommits(limit = 60) {
  const out = git(['log', `-n${limit}`, '--format=%H %cI', '--', ...SOURCE_FILES]).trim();
  if (!out) throw new Error('[history] 정본 소스 커밋 이력을 얻지 못했습니다.');
  return out.split('\n').map((l) => {
    const sp = l.indexOf(' ');
    return { sha: l.slice(0, sp), iso: l.slice(sp + 1), time: new Date(l.slice(sp + 1)).getTime() };
  });
}

/** 워킹트리에 커밋 안 된 정본 소스 변경이 있는가. */
function isDirty() {
  return git(['status', '--porcelain', '--', ...SOURCE_FILES]).trim().length > 0;
}

/** 특정 ref 의 src 를 임시 폴더로 꺼낸다. 호출자가 cleanup 해야 한다. */
function checkoutSrc(sha) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ihist-${sha.slice(0, 7)}-`));
  try {
    // 워킹트리를 건드리지 않고 과거 ref 의 파일만 꺼낸다.
    //   종전엔 `/bin/sh -c "git archive … | tar -x"` 로 파이프를 썼는데 Windows 에는 /bin/sh 가
    //   없고, 파이프를 없애도 어느 tar 가 PATH 에 잡히느냐로 갈렸다(Git Bash 의 MSYS tar 는
    //   `C:\…` 를 원격 호스트로 오해). 게이트가 셸·PATH 에 좌우되지 않게 tar 를 Node 로 푼다.
    //   (2026-08-03 — zip 은 read-zip-entry.js 가 같은 이유로 담당.)
    const tarBuf = execFileSync('git', ['archive', '--format=tar', sha, SRC_REL],
      { cwd: ROOT, maxBuffer: 256 * 1024 * 1024 });
    const files = extractTar(tarBuf, dir);
    if (files.length === 0) throw new Error(`아카이브가 비었습니다(${SRC_REL} 없음)`);
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw new Error(`[history] ${sha.slice(0, 7)} 의 소스를 꺼내지 못했습니다: ${e.message}`);
  }
  const srcDir = path.join(dir, SRC_REL);
  if (!fs.existsSync(srcDir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw new Error(`[history] ${sha.slice(0, 7)} 에 ${SRC_REL} 이 없습니다.`);
  }
  return { dir, srcDir };
}

/** ref 지문 계산 + 캐시(프로세스 내). 과거 ref 는 반복 조회되므로 캐시가 크게 아낀다. */
const _cache = new Map();
async function fingerprintAt(sha) {
  if (_cache.has(sha)) return _cache.get(sha);
  const { dir, srcDir } = checkoutSrc(sha);
  try {
    const fp = await fingerprint(srcDir);
    _cache.set(sha, fp);
    return fp;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * 앵커를 정한다.
 * @param {object} curFp  현재 워킹트리 지문
 * @returns {{anchorSha:string|null, anchorFp:object|null, releaseDate:string, landedSha:string|null, walked:number}}
 */
async function resolveAnchor(curFp) {
  const commits = sourceCommits();
  const dirty = isDirty();

  // 1) 지금 상태가 착지한 커밋 찾기 — 지문이 현재와 같은 커밋들은 "이미 반영된 것".
  let k = 0;
  while (k < commits.length) {
    const fp = await fingerprintAt(commits[k].sha);
    if (fp.hash !== curFp.hash) break;
    k++;
  }
  const landed = k > 0 ? commits[k - 1] : null;      // 현재 지문이 처음 들어간 커밋
  const t0 = landed ? landed.time : Date.now();      // 더티면 지금
  const releaseDate = kstDate(t0);

  // 2) t0 에서 과거로 간격 < CLUSTER_GAP_HOURS 인 연속 구간(= 같은 릴리스)을 건너뛴다.
  const gapMs = CLUSTER_GAP_HOURS * 3600 * 1000;
  let i = k;
  let prevTime = t0;
  while (i < commits.length && prevTime - commits[i].time < gapMs) {
    prevTime = commits[i].time;
    i++;
  }

  // 3) 군집 밖에서, 지문이 현재와 다른 첫 ref = 앵커. (지문 스킵 재적용 → 빈 툴팁 구조적 불가)
  while (i < commits.length) {
    const fp = await fingerprintAt(commits[i].sha);
    if (fp.hash !== curFp.hash) {
      return { anchorSha: commits[i].sha, anchorFp: fp, releaseDate, landedSha: landed && landed.sha, walked: i + 1, dirty };
    }
    i++;
  }
  // 히스토리 끝까지 같은 지문 = 최초 도입. 앵커 없음(전량 신설로 표시할 근거가 없으므로 호출자가 판단).
  return { anchorSha: null, anchorFp: null, releaseDate, landedSha: landed && landed.sha, walked: commits.length, dirty };
}

/** 특정 토큰 스코프의 지문이 마지막으로 바뀐 커밋 날짜(KST) — 카드 날짜용. */
async function lastChangeDate(curFp, scopeFilter) {
  const scope = (fp) => JSON.stringify(
    Object.keys(fp.tokens).filter(scopeFilter).sort().map((k) => [k, fp.tokens[k]])
  );
  const cur = scope(curFp);
  const commits = sourceCommits();
  if (isDirty()) return kstDate(Date.now());
  let prev = null;
  for (const c of commits) {
    const fp = await fingerprintAt(c.sha);
    if (scope(fp) !== cur) return kstDate(prev ? prev.time : c.time);
    prev = c;
  }
  return kstDate(prev ? prev.time : Date.now());
}

/** 컴포넌트 시각 사양이 마지막으로 바뀐 커밋 날짜(KST) — Component Set 카드용. */
async function lastSpecChangeDate(curFp) {
  const cur = [...curFp.spec].sort().join('\n');
  const commits = sourceCommits();
  if (isDirty()) return kstDate(Date.now());
  let prev = null;
  for (const c of commits) {
    const fp = await fingerprintAt(c.sha);
    if ([...fp.spec].sort().join('\n') !== cur) return kstDate(prev ? prev.time : c.time);
    prev = c;
  }
  return kstDate(prev ? prev.time : Date.now());
}

function kstDate(ms) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(ms));
}

module.exports = {
  sourceCommits, isDirty, fingerprintAt, resolveAnchor,
  lastChangeDate, lastSpecChangeDate, kstDate, CLUSTER_GAP_HOURS, ROOT,
};
