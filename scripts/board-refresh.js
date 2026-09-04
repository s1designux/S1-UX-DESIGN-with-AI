#!/usr/bin/env node
/**
 * board-refresh.js — 레거시 대응 검수판의 '정본(현재 배포본)' 칸을 다시 찍는다.
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 필요한가(2026-09-04):
 *   검수판은 정본 화면을 이미지로 박아 둔다. 정본 상태가 바뀌어도(draft→approved)
 *   어떤 Gate·훅도 그 화면을 보지 않아 조용히 낡는다. 실제로 9/3 검수판이
 *   date-picker 를 '초안 — 보여줄 화면 없음' 으로 하루 만에 잘못 표시하고 있었다.
 *   (반복 패턴 external-review-artifact-goes-stale)
 *
 * 하는 일:
 *   1) 선언(board-manifest.json)대로 pages/components.html 의 컴포넌트 섹션만 캡처
 *   2) board.html 의 data-canon 칸 이미지를 그 캡처로 교체
 *   3) 찍을 때의 정본 상태(status·sourceFingerprint)를 선언서에 기록 → Gate 46 이 감시
 *
 * 캡처 방식: 사이트 크롬(사이드바·헤더·탭)을 숨기고 대상 섹션만 남긴 임시 사본을
 *   http 로 띄워 찍는다. file:// 로는 dist 를 fetch 못 해(CORS) 빈 화면이 나온다.
 *   섹션 안에서 아래쪽을 담아야 할 때는 scrollTo 대신 음수 margin 으로 밀어 올린다
 *   (scrollTo 는 렌더 타이밍에 따라 빈 화면이 나온다 — 실측).
 *
 * 사용: npm run board:refresh            전체 다시 찍기
 *       npm run board:refresh -- D-10    특정 칸만
 *
 * 게시는 사람/Claude 몫이다. 이 스크립트는 board.html 까지만 만든다.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'reports/legacy-crosswalk-board');
const MANIFEST = path.join(DIR, 'board-manifest.json');
const BOARD = path.join(DIR, 'board.html');
const PAGE = path.join(ROOT, 'pages/components.html');
const TMP_PAGE = path.join(ROOT, 'pages', '__board-shot.html');
const WORK = fs.mkdtempSync(path.join(require('os').tmpdir(), 'board-refresh-'));

const only = process.argv.slice(2).filter((a) => /^D-\d+$/.test(a));

function alive(port) {
  return new Promise((res) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/pages/components.html', timeout: 1200 },
      (r) => { r.resume(); res(r.statusCode === 200); });
    req.on('error', () => res(false));
    req.on('timeout', () => { req.destroy(); res(false); });
  });
}

async function ensureServer(port) {
  if (await alive(port)) return null;                       // 이미 떠 있으면 그대로 쓴다
  const p = spawn('python3', ['-m', 'http.server', String(port)],
    { cwd: ROOT, stdio: 'ignore', detached: false });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (await alive(port)) return p;
  }
  try { p.kill(); } catch (_) {}
  throw new Error(`캡처용 임시 서버(포트 ${port})를 못 띄웠습니다`);
}

// 대상 섹션만 남긴 임시 사본을 만들고 찍는다 → PNG 경로
function shoot(cfg, section, platform, scrollY, out) {
  const page = fs.readFileSync(PAGE, 'utf8');
  const inject = `
<style id="board-shot-iso">
#sidebar,.sidebar,.sidebar-overlay,.mobile-header,.page-header,.comp-sticky-bar{display:none!important}
.main-content{margin-left:0!important;padding-top:0!important}
.page-content{padding-top:16px!important}
#${section}{margin-top:${-scrollY}px!important}
</style>
<script>
(function(){
  function go(){
    try{ if(typeof showSection==='function') showSection(${JSON.stringify(section)}); }catch(e){}
    document.querySelectorAll('.comp-section').forEach(function(s){s.classList.remove('is-active')});
    var s=document.getElementById(${JSON.stringify(section)});
    if(s) s.classList.add('is-active');
  }
  go(); window.addEventListener('load',function(){ go(); setTimeout(go,500); setTimeout(go,1500); });
})();
<\/script>
`;
  fs.writeFileSync(TMP_PAGE, page.replace('</body>', inject + '</body>'));
  const raw = path.join(WORK, 'raw.png');
  try {
    execFileSync('node', [path.join(ROOT, 'scripts/render-shot.js'),
      `http://127.0.0.1:${cfg.port}/pages/__board-shot.html?platform=${platform}`,
      raw, `--window-size=${cfg.windowSize}`, `--wait-ms=${cfg.waitMs}`, '--quiet'],
      { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
  } finally {
    try { fs.unlinkSync(TMP_PAGE); } catch (_) {}
  }
  execFileSync('sips', ['--resampleWidth', String(cfg.outWidth), raw, '--out', out], { stdio: 'ignore' });
  return out;
}

// 빈 화면(렌더 실패) 판별 — 색이 거의 없는 PNG 는 용량이 급격히 작다
function looksBlank(png) { return fs.statSync(png).size < 20 * 1024; }

function componentProvenance(component) {
  const f = path.join(ROOT, 'ui-library/dist/components', `${component}.manifest.json`);
  if (!fs.existsSync(f)) return { status: '미확인', sourceFingerprint: null };
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  return { status: m.status || '미확인', sourceFingerprint: m.sourceFingerprint || null };
}

async function main() {
  const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const cfg = man.capture;
  let board = fs.readFileSync(BOARD, 'utf8');
  const server = await ensureServer(cfg.port);
  const cache = new Map();
  const done = [];
  const failed = [];
  try {
    for (const p of man.panes) {
      if (only.length && !only.includes(p.decision)) continue;
      const key = `${p.section}|${p.platform}|${p.scrollY}`;
      let png = cache.get(key);
      if (!png) {
        png = shoot(cfg, p.section, p.platform, p.scrollY, path.join(WORK, `${key.replace(/\|/g, '_')}.png`));
        if (looksBlank(png)) { failed.push(`${p.decision} (${p.component}) — 캡처가 빈 화면입니다`); continue; }
        cache.set(key, png);
      }
      const b64 = fs.readFileSync(png).toString('base64');
      const re = new RegExp(
        `(<figure class="pane canon" data-canon="${p.decision}">[\\s\\S]*?<img class="shot" src="data:image/png;base64,)[^"]*`);
      if (!re.test(board)) { failed.push(`${p.decision} — 검수판에서 그 칸을 못 찾았습니다`); continue; }
      board = board.replace(re, `$1${b64}`);
      man.provenance[p.decision] = {
        component: p.component,
        capturedAt: new Date().toISOString().slice(0, 10),
        ...componentProvenance(p.component),
      };
      done.push(`${p.decision} ${p.component}`);
    }
  } finally {
    if (server) { try { server.kill(); } catch (_) {} }
    try { fs.rmSync(WORK, { recursive: true, force: true }); } catch (_) {}
  }
  if (done.length) {
    fs.writeFileSync(BOARD, board);
    fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  }
  console.log(`✅ 다시 찍은 칸 ${done.length}개 · 검수판 ${(fs.statSync(BOARD).size / 1048576).toFixed(2)}MB`);
  for (const d of done) console.log(`   · ${d}`);
  if (failed.length) {
    console.error(`\n❌ 실패 ${failed.length}건`);
    for (const f of failed) console.error(`   · ${f}`);
    process.exit(1);
  }
  console.log('\n다음: Claude 가 같은 링크로 다시 올리면 끝입니다 (스크립트는 게시를 못 합니다).');
}

main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
