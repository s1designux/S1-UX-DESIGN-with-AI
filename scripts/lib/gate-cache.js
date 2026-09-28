/**
 * Gate Cache — 「답이 같을 때만 건너뛴다」 (2026-09-28 도입)
 *
 * 왜:
 *   커밋 검문소 59개 중 4개가 전체 27초의 18초를 먹었다(실측 2026-09-23).
 *   무거운 이유는 전부 같다 — 볼 파일이 하나도 안 바뀐 커밋에서도 매번 처음부터
 *   git 이력을 되짚거나(설치기 툴팁 10초) 크롬을 띄워 화면을 그려 본다(안내 화면 2.1초 ·
 *   안내 표본 1.8초) 또는 저장소를 통째로 훑어 시스템 맵을 다시 만든다(2.3초).
 *
 * 무엇을 하지 않는가 (검사를 약화하지 않는다 — CLAUDE.md 금지행동):
 *   · 판정 로직을 건드리지 않는다. 캐시가 비면 종전과 똑같이 전부 돈다.
 *   · **통과(status 0)만** 저장한다. 실패·경고·크롬부재(status 2)는 저장하지 않아
 *     매 커밋 그대로 다시 돌고 사용자는 메시지를 계속 본다.
 *   · 지문은 「그 게이트가 보는 파일들의 크기+수정시각」이다. 내용이 같은데 파일을
 *     다시 쓰면 지문이 달라져 **괜히 한 번 더 도는 쪽**으로 틀린다(안전한 방향).
 *
 * 끄는 방법: `node scripts/gate-check.js --no-cache` 또는 `GATE_CACHE=0`.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const CACHE_DIR = path.join(ROOT, '.gate-cache');
const VERSION = 'v1'; // 지문 규칙을 바꾸면 올린다 = 기존 캐시 전량 무효

const DISABLED = process.env.GATE_CACHE === '0' || process.argv.includes('--no-cache');

// 시스템 맵처럼 「저장소에 어떤 파일이 있는가」 자체가 입력인 게이트를 위해
// 트리를 한 번만 훑어 재사용한다(실측 4620개 77ms). pipeline-status.js 의 walk 와 같은 제외·깊이.
const EXCLUDE = new Set(['node_modules', '.git', '.claude', '.vscode', '.github', '.husky', '.gate-cache']);
let SNAP = null;
function snapshot() {
  if (SNAP) return SNAP;
  const rows = new Map();
  (function walk(dir, depth) {
    if (depth > 6) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      if (EXCLUDE.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else if (e.isFile()) {
        let st;
        try { st = fs.statSync(full); } catch (_) { continue; }
        rows.set(path.relative(ROOT, full).replace(/\\/g, '/'), `${st.size}|${st.mtimeMs}`);
      }
    }
  })(ROOT, 0);
  SNAP = rows;
  return SNAP;
}

const under = (rel, dep) => rel === dep || rel.startsWith(dep.endsWith('/') ? dep : `${dep}/`);

/**
 * deps      : 내용(크기+수정시각)까지 보는 경로 — 파일 또는 폴더
 * namesOnly : 「있는지/없는지」만 보는 경로 — 목록만 지문에 넣는다(대량 에셋 제외용)
 * gitPaths  : 이 경로들을 마지막으로 건드린 커밋 해시도 지문에 넣는다
 *             (내용은 같은데 이력이 다시 쓰여 판정이 달라지는 경우 대비)
 */
function fingerprint({ deps = [], namesOnly = [], gitPaths = [] }) {
  const snap = snapshot();
  const h = crypto.createHash('sha1').update(VERSION);
  const keys = [...snap.keys()].sort();
  for (const rel of keys) {
    if (deps.some((d) => under(rel, d))) h.update(`\n${rel}\0${snap.get(rel)}`);
    else if (namesOnly.some((d) => d === '.' || under(rel, d))) h.update(`\n${rel}`);
  }
  if (gitPaths.length) {
    const r = spawnSync('git', ['log', '-1', '--format=%H', '--', ...gitPaths], { cwd: ROOT, encoding: 'utf-8' });
    h.update(`\ngit:${r.status === 0 ? (r.stdout || '').trim() : 'unknown'}`);
  }
  return h.digest('hex');
}

function cachePath(key) { return path.join(CACHE_DIR, `${key}.json`); }

/**
 * 캐시에 「같은 지문의 통과 기록」이 있으면 exec 를 돌리지 않고 그 결과를 돌려준다.
 * 반환: { status, stdout, stderr, cached }
 */
function runCached({ key, deps, namesOnly, gitPaths, exec }) {
  if (DISABLED) return { ...exec(), cached: false };

  let fp;
  try { fp = fingerprint({ deps, namesOnly, gitPaths }); } catch (_) { return { ...exec(), cached: false }; }

  try {
    const hit = JSON.parse(fs.readFileSync(cachePath(key), 'utf-8'));
    if (hit.fp === fp && hit.status === 0) {
      return { status: 0, stdout: hit.stdout || '', stderr: hit.stderr || '', cached: true };
    }
  } catch (_) { /* 캐시 없음·깨짐 = 그냥 돈다 */ }

  const r = exec();
  if (r.status === 0) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cachePath(key), JSON.stringify({
        fp, status: 0, stdout: r.stdout || '', stderr: r.stderr || '', at: new Date().toISOString(),
      }));
    } catch (_) { /* 캐시 못 써도 판정에는 영향 없음 */ }
  }
  return { ...r, cached: false };
}

let skipped = 0;
const noteSkip = () => { skipped++; };
const skippedCount = () => skipped;

module.exports = { runCached, noteSkip, skippedCount, DISABLED };
