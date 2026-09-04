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
 * 구조: board.template.html(뼈대 87KB, 그림은 {{IMG:...}} 자리표시자)
 *       + screens/**.png(그림 원본) → board.html(조립 결과 5MB, git 에 담지 않음)
 *       그림을 파일로 빼 두어야 재캡처할 때마다 5MB 통짜가 새로 쌓이지 않는다.
 *
 * 사용: npm run board:refresh            전체 다시 찍기
 *       npm run board:build              다시 찍지 않고 조립만
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
const TEMPLATE = path.join(DIR, 'board.template.html');   // 뼈대 — 그림은 {{IMG:...}} 자리표시자
const SCREENS = path.join(DIR, 'screens');                 // 그림 원본(정본 canon/ · 레거시 legacy/)
const FACTS = path.join(DIR, 'canon-facts.json');            // 정본 사실 — 기계가 뽑는다
const BOARD = path.join(DIR, 'board.html');                // 조립 결과 = 게시용. git 에 담지 않는다
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


// 카드에 박을 「지금 정본」 표 — 사람이 요약하지 않고 canon-facts.json 을 그대로 렌더한다
function factsBlock(comp, facts) {
  const f = facts.components[comp];
  if (!f) return `<div class="facts"><h4>지금 정본</h4><p class="fsrc">${comp} 은(는) 웹 배포본 컴포넌트가 아니라 가이드 화면입니다 — 기계가 읽을 정본 사실표가 없습니다.</p></div>`;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = [];
  if (f.sizeBreakGrid.length) {
    const cells = f.sizeBreakGrid.map((g) => {
      const brk = g.break === 'mobile' ? 'Mobile' : 'PC';
      const dim = g.height ? ` <i>${g.height}${g.fontSize ? '/' + g.fontSize : ''}</i>` : '';
      return `<span class="fg${g.break === 'mobile' ? ' fm' : ''}">${g.size.toUpperCase()}·${brk}${dim}</span>`;
    }).join('');
    rows.push(['크기 × 화면', cells + '<em>높이/글자크기</em>']);
  } else if (f.sizes.length) {
    rows.push(['크기', f.sizes.map((x) => `<span class="fg">${esc(x)}</span>`).join('')]);
  } else {
    rows.push(['크기', '<em>크기 축 없음</em>']);
  }
  if (f.variants.length) rows.push(['변형', f.variants.map((v) => `<span class="fg">${esc(v)}</span>`).join('')]);
  if (f.types) rows.push(['유형', f.types.map((v) => `<span class="fg">${esc(v)}</span>`).join('')]);
  if (f.states.length) rows.push(['상태', f.states.map((v) => `<span class="fg">${esc(v)}</span>`).join('')]);
  if (f.canonicalStateMap) {
    const pairs = Object.entries(f.canonicalStateMap).map(([a, b]) => `${esc(a)} → ${esc(b)}`).join(' · ');
    rows.push(['정본이 선언한 상태 대응', `<span class="fmap">${pairs}</span>`]);
  }
  if (f.absentCombinations.length) {
    rows.push(['정본에 <b>없다</b>고 못박은 것',
      f.absentCombinations.map((a) => `<span class="fno">${esc(a.key)}</span>`).join('')]);
  }
  return `<div class="facts">
  <h4>지금 정본 <span>기계가 읽은 것 — 사람이 요약하지 않았습니다</span></h4>
  <table class="ftab">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>
  <p class="fsrc">${esc(f.id)} v${esc(f.version)} · ${esc(f.status)} · 크기 값 출처 = 정본 build-components.ts</p>
</div>`;
}

// 뼈대 + 그림 파일 → 게시용 board.html 조립
function assemble() {
  const tpl = fs.readFileSync(TEMPLATE, 'utf8');
  const facts = JSON.parse(fs.readFileSync(FACTS, 'utf8'));
  const missing = [];
  const out = tpl
    .replace(/\{\{FACTS:([^}]+)\}\}/g, (_, comp) => factsBlock(comp, facts))
    .replace(/\{\{IMG:([^}]+)\}\}/g, (_, rel) => {
    const f = path.join(SCREENS, rel);
    if (!fs.existsSync(f)) { missing.push(rel); return ''; }
    return `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
  });
  if (missing.length) throw new Error(`그림 파일이 없습니다 — ${missing.slice(0, 5).join(' · ')}`);
  fs.writeFileSync(BOARD, out);
  return out.length;
}

function componentProvenance(component) {
  const f = path.join(ROOT, 'ui-library/dist/components', `${component}.manifest.json`);
  if (!fs.existsSync(f)) return { status: '미확인', sourceFingerprint: null };
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  return { status: m.status || '미확인', sourceFingerprint: m.sourceFingerprint || null };
}

async function main() {
  // 정본 사실표를 먼저 다시 뽑는다 — 카드에 박히는 값이 항상 지금 정본이어야 한다
  execFileSync('node', [path.join(ROOT, 'scripts/board-canon-facts.js')], { cwd: ROOT, stdio: 'inherit' });

  const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const cfg = man.capture;
  const tpl = fs.readFileSync(TEMPLATE, 'utf8');

  if (process.argv.includes('--assemble-only')) {          // 다시 찍지 않고 조립만
    const size = assemble();
    console.log(`✅ 조립 완료 · 게시용 검수판 ${(size / 1048576).toFixed(2)}MB`);
    return;
  }

  const server = await ensureServer(cfg.port);
  const done = [];
  const failed = [];
  const shotFor = (p) => `canon/${p.section}--${p.platform}--${p.scrollY}.png`;
  try {
    const seen = new Set();
    for (const p of man.panes) {
      if (only.length && !only.includes(p.decision)) continue;
      const rel = shotFor(p);
      if (!tpl.includes(`{{IMG:${rel}}}`)) { failed.push(`${p.decision} — 뼈대에서 그 칸(${rel})을 못 찾았습니다`); continue; }
      if (!seen.has(rel)) {                                 // 같은 그림을 쓰는 칸은 한 번만 찍는다
        const tmp = path.join(WORK, 'shot.png');
        shoot(cfg, p.section, p.platform, p.scrollY, tmp);
        if (looksBlank(tmp)) { failed.push(`${p.decision} (${p.component}) — 캡처가 빈 화면입니다`); continue; }
        fs.mkdirSync(path.join(SCREENS, 'canon'), { recursive: true });
        fs.copyFileSync(tmp, path.join(SCREENS, rel));
        seen.add(rel);
      }
      man.provenance[p.decision] = {
        component: p.component,
        screen: rel,
        capturedAt: new Date().toISOString().slice(0, 10),
        ...componentProvenance(p.component),
      };
      done.push(`${p.decision} ${p.component}`);
    }
  } finally {
    if (server) { try { server.kill(); } catch (_) {} }
    try { fs.rmSync(WORK, { recursive: true, force: true }); } catch (_) {}
  }
  if (done.length) fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  const size = assemble();
  console.log(`✅ 다시 찍은 칸 ${done.length}개 · 게시용 검수판 ${(size / 1048576).toFixed(2)}MB`);
  for (const d of done) console.log(`   · ${d}`);
  if (failed.length) {
    console.error(`\n❌ 실패 ${failed.length}건`);
    for (const f of failed) console.error(`   · ${f}`);
    process.exit(1);
  }
  console.log('\n다음: Claude 가 같은 링크로 다시 올리면 끝입니다 (스크립트는 게시를 못 합니다).');
}

main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
