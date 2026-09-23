#!/usr/bin/env node
/**
 * guide-sample-liveness-check.js — 안내 표본 생존 검사기 (Gate 53)
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 만들었나 (river 지시 2026-09-17 "만들어줘"):
 *   안내 화면의 「실제 동작」 표본이 시·분 목록을 네 줄짜리 견본(08·09·10·11 / 00·15·30·45)으로
 *   미리 채워 내보내고 있었다. 배포본 init 은 칸이 이미 있으면 채우기를 건너뛰므로
 *   (time-picker.js `getCells(column).length > 0) continue`) 전 구간(00~23 · 00~59)이 영영
 *   만들어지지 않았고 스크롤도 없었다. 겉은 멀쩡해 보여 **사람이 눌러보기 전까지** 아무 검사기도
 *   잡지 못했다 — river 가 직접 발견했다(2026-09-17).
 *
 * ★ 무엇을 재나 — 두 가지를 **렌더된 화면에서** 확인한다:
 *   T1 깨어나는가 — 움직이는 부품의 살아 있는 표본이 **화면 자신의 손으로** init 되었나.
 *       배포본 모듈의 init 을 검사 중에만 감싸(서버에서 소스 재작성) 실제 호출을 기록한다.
 *       검사기가 대신 깨워 놓고 통과시키는 자기기만을 구조로 막는다.
 *   T2 목록이 배포본 것인가 — 배포본이 만들어 내야 할 목록을, 화면이 손으로 채워 가로막지 않았나.
 *       판정 기준을 이 파일이 정하지 않는다: 같은 표본을 복제해 그 칸만 비우고 배포본으로 다시
 *       채운 뒤(=오라클), 화면에 있는 것과 값이 같은지 본다. 다르면 손으로 채운 것이다.
 *
 * ★ 못 재는 것(정직하게):
 *   · 보기 내용이 디자인 의도에 맞는지(드롭다운 보기 글자, 표 내용 등) — 그건 쓰는 쪽이 채우는 자리다.
 *   · 눈에 보이는 모양·간격 — 이 검사기는 DOM 만 본다.
 *   · 배포본이 스스로 만들지 않는 목록은 T2 대상 밖이다(오라클이 비어 있으면 건너뛴다).
 *
 * 사용: node scripts/guide-sample-liveness-check.js            # 검사
 *       node scripts/guide-sample-liveness-check.js --selftest # 적대 시험(옛 결함 재현 → 잡히는지)
 * 종료: 0 통과 · 1 실패 · 2 크롬 없음(건너뜀은 gate 쪽에서 판단)
 */
const fs = require('fs');
const { spawnChrome, killChromeTree } = require('./lib/chrome-proc');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { StringDecoder } = require('string_decoder');

const ROOT = path.resolve(__dirname, '..');
const DIST_COMPONENTS = path.join(ROOT, 'ui-library/dist/components');
const SELFTEST = process.argv.includes('--selftest');

/* 검사 대상 화면 — 배포본(dist)을 실제로 소비하는 안내·검수 화면.
   정지 그림 칸은 화면마다 표시가 다르다(안내=.is-preview · 검수=data-review-static). */
const PAGES = [
  { url: '/pages/components.html', label: '컴포넌트 안내 화면' },
  { url: '/pages/ui-review.html', label: '배포본 검수 화면' }
];

/* T2 대상 — 배포본이 스스로 목록을 만들어 내는 자리. 여기 적힌 것은 "어느 칸을 비워서 다시 채워볼까"
   뿐이고, **무엇이 옳은 목록인가는 배포본이 정한다**(오라클). 아래 rot 검사가 새로 생긴 자리를 알려준다. */
const GENERATED_LISTS = [
  {
    component: 'time-picker',
    partSelector: '[data-s1-part="column"], [data-s1-part="wheel-col"]',
    cellSelector: '[data-s1-part="cell"], [data-s1-part="wheel-cell"]',
    why: '시·분 목록과 휠 칸은 minute-step 에 따라 배포본이 만든다(1분 단위 = river 결정 D2)'
  }
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
};

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
  ].filter(Boolean);
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (_) { /* */ } }
  return null;
}

/* ── 배포본 init 을 검사 중에만 감싼다 ────────────────────────────────────
   저장소 파일은 건드리지 않는다 — 서버가 내보낼 때만 글자를 바꾼다.
   `runtime` 은 Object.freeze 된 뒤라 바깥에서 못 감싸므로, 얼리기 전 자리에서 감싼다.
   `init` 자체(모듈 직접 호출 경로)도 함께 감싼다 — 화면이 두 경로를 섞어 쓴다. */
const PROBE_TAG = '__s1ProbeInited';
function wrapRuntime(source) {
  const marker = 'export const runtime = Object.freeze({ init, destroy });';
  if (!source.includes(marker)) return source;
  const wrapped = [
    `const __probeRecord = (root, api) => { if (api) { (globalThis.${PROBE_TAG} || (globalThis.${PROBE_TAG} = new WeakSet())).add(root); } return api; };`,
    'const __probeInit = (root) => __probeRecord(root, init(root));',
    'export const runtime = Object.freeze({ init: __probeInit, destroy });'
  ].join('\n');
  let out = source.replace(marker, wrapped);
  out += `\n{ const __orig = init; init = function (root) { return __probeRecord(root, __orig(root)); }; }\n`;
  return out;
}

/* ── 페이지에 심는 시험 대본 ─────────────────────────────────────────────── */
function probeScript() {
  return `
<script>
(async () => {
  const results = [];
  const emit = () => {
    const s = document.createElement('script');
    s.type = 'application/json'; s.id = '__probe-results';
    s.textContent = JSON.stringify(results);
    document.body.appendChild(s);
  };
  const camel = (s) => s.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  const isStatic = (n) => n.classList.contains('is-preview') || n.hasAttribute('data-review-static');
  /* 부모 부품이 데리고 있는 껍데기는 그 부모가 움직인다 — 따로 깨우면 오히려 깨진다.
     (date-picker·time-picker 의 바텀시트가 껍데기 CSS 를 쓰려고 bottom-sheet 이름을 함께 단다 —
      ui-review.html:2535 주석이 "전체 문서를 잡으면 그 두 화면이 깨진다"고 못박고 있다.)
     표식은 같은 노드에 data-s1-part 가 있고 바깥에 다른 부품 뿌리가 있다는 것이다. */
  const isOwnedPart = (n) => n.hasAttribute('data-s1-part') && !!(n.parentElement && n.parentElement.closest('[data-s1-component]'));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    /* 화면이 다 그려질 때까지 기다린다 — 부품 수가 세 번 연속 그대로면 끝난 것으로 본다. */
    let last = -1, stable = 0;
    for (let i = 0; i < 120 && stable < 3; i++) {
      await wait(200);
      const n = document.querySelectorAll('[data-s1-component]').length;
      stable = (n === last && n > 0) ? stable + 1 : 0;
      last = n;
    }
    const S = await import('/ui-library/dist/s1-ui.js');
    const inited = globalThis.${PROBE_TAG} || new WeakSet();

    /* ── T1 — 살아 있는 표본이 화면 자신의 손으로 깨어났나 ── */
    let t1checked = 0, t1owned = 0;
    for (const root of document.querySelectorAll('[data-s1-component]')) {
      if (isStatic(root)) continue;
      if (isOwnedPart(root)) { t1owned++; continue; }
      const mod = S[camel(root.dataset.s1Component)];
      if (!mod || typeof mod.runtime?.init !== 'function') continue;  // 움직이는 코드가 없는 부품
      t1checked++;
      if (inited.has(root)) continue;
      let why = '화면이 init 을 부르지 않았습니다';
      try { if (!mod.runtime.init(root)) why = '마크업에 필요한 부품이 빠져 init 이 살아나지 못합니다'; }
      catch (e) { why = 'init 이 멈췄습니다: ' + (e && e.message); }
      results.push({ test: 'T1', component: root.dataset.s1Component, detail: why, html: root.outerHTML.slice(0, 160) });
    }
    results.push({ test: 'T1-count', checked: t1checked, owned: t1owned });

    /* ── T2 — 목록이 배포본 것인가 (오라클 = 같은 표본을 비워 다시 채운 복제본) ── */
    const CONTRACT = ${JSON.stringify(GENERATED_LISTS)};
    const bench = document.createElement('div');
    bench.style.cssText = 'position:absolute;left:-99999px;top:0;width:1200px;';
    document.body.appendChild(bench);
    let t2checked = 0;
    for (const rule of CONTRACT) {
      const mod = S[camel(rule.component)];
      if (!mod || typeof mod.runtime?.init !== 'function') {
        results.push({ test: 'T2', component: rule.component, detail: '배포본에 이 부품의 움직이는 코드가 없습니다(계약이 낡음)' });
        continue;
      }
      for (const root of document.querySelectorAll('[data-s1-component="' + rule.component + '"]')) {
        if (isStatic(root) || isOwnedPart(root)) continue;
        t2checked++;
        const clone = root.cloneNode(true);
        clone.querySelectorAll(rule.partSelector).forEach((p) => p.replaceChildren());
        bench.appendChild(clone);
        try { mod.runtime.init(clone); } catch (e) { /* 아래 비교에서 드러난다 */ }
        const mine = [...root.querySelectorAll(rule.partSelector)];
        const oracle = [...clone.querySelectorAll(rule.partSelector)];
        for (let i = 0; i < oracle.length; i++) {
          const vals = (el) => [...el.querySelectorAll(rule.cellSelector)]
            .map((c) => (c.dataset.value != null ? c.dataset.value : (c.textContent || '').trim()));
          const want = vals(oracle[i]);
          if (want.length === 0) continue;             // 배포본이 만들지 않는 칸 — 쓰는 쪽 몫이다
          const got = mine[i] ? vals(mine[i]) : [];
          if (got.join('|') === want.join('|')) continue;
          results.push({
            test: 'T2', component: rule.component,
            column: oracle[i].dataset.column || oracle[i].dataset.s1Part || '(이름없음)',
            detail: '화면 ' + got.length + '줄(' + got.slice(0, 4).join('·') + '…) ↔ 배포본 ' + want.length + '줄(' + want.slice(0, 4).join('·') + '…)',
            html: root.outerHTML.slice(0, 160)
          });
        }
        clone.remove();
      }
    }
    bench.remove();
    results.push({ test: 'T2-count', checked: t2checked });
  } catch (e) {
    results.push({ test: 'PAGE', detail: '시험이 끝나지 못했습니다: ' + (e && e.message) });
  }
  emit();
})();
</script>`;
}

/* ── 적대 시험용 가짜 화면 ────────────────────────────────────────────────
   ① 정상 — 칸을 비워 내보낸 표본(배포본이 채운다)                → 아무것도 안 걸려야 한다
   ② 옛 결함 — 네 줄짜리 견본을 미리 채운 표본                    → T2 가 잡아야 한다
   ③ 안 깨운 것 — 화면이 init 을 부르지 않은 표본                  → T1 이 잡아야 한다 */
function selftestPage() {
  const tp = (id, cells) => `
<div id="${id}" data-s1-component="time-picker" data-size="md" data-break="pc" data-type="24h" data-minute-step="1">
  <button type="button" data-s1-part="trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="시간">
    <span data-s1-part="value">시간 선택</span><span data-s1-part="icon" aria-hidden="true"></span>
  </button>
  <div data-s1-part="panel" hidden>
    <div data-s1-part="columns">
      <div data-s1-part="column" data-column="hour" role="listbox" aria-label="시">${cells.hour}</div>
      <div data-s1-part="divider"></div>
      <div data-s1-part="column" data-column="minute" role="listbox" aria-label="분">${cells.minute}</div>
    </div>
    <div data-s1-part="footer"><button type="button" data-s1-part="confirm" disabled>확인</button></div>
  </div>
</div>`;
  const cell = (v) => `<div data-s1-part="cell" role="option" data-value="${v}" aria-selected="false">${v}</div>`;
  const stale = { hour: ['08', '09', '10', '11'].map(cell).join(''), minute: ['00', '15', '30', '45'].map(cell).join('') };
  const empty = { hour: '', minute: '' };
  return `<!doctype html><meta charset="utf-8"><title>selftest</title><body>
${tp('ok', empty)}
${tp('stale', stale)}
${tp('asleep', empty)}
<script type="module">
  import * as S1UI from '/ui-library/dist/s1-ui.js';
  /* 'asleep' 은 일부러 깨우지 않는다 */
  S1UI.timePicker.runtime.init(document.getElementById('ok'));
  S1UI.timePicker.runtime.init(document.getElementById('stale'));
</script>
</body>`;
}

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]).replace(/^\/+/, '');
      if (rel === '__selftest.html') {
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        res.end(selftestPage() + probeScript());
        return;
      }
      const abs = path.join(ROOT, rel);
      if (!abs.startsWith(ROOT) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
        res.writeHead(404).end('not found');
        return;
      }
      const ext = path.extname(abs);
      const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
      /* 배포본 부품 파일은 감싼 판으로 내보낸다(저장소 파일은 그대로다). */
      if (ext === '.js' && abs.startsWith(DIST_COMPONENTS)) {
        res.writeHead(200, headers).end(wrapRuntime(fs.readFileSync(abs, 'utf8')));
        return;
      }
      /* 검사 대상 화면에는 시험 대본을 덧붙인다. */
      if (ext === '.html' && PAGES.some((p) => p.url === '/' + rel)) {
        const html = fs.readFileSync(abs, 'utf8');
        res.writeHead(200, headers).end(html.replace(/<\/body>/i, probeScript() + '</body>'));
        return;
      }
      res.writeHead(200, headers);
      fs.createReadStream(abs).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/* `--dump-dom` 은 다 쓰고도 스스로 안 죽는다(ui-guide-render-check.js 와 같은 함정). */
function dumpDom(chrome, url) {
  return new Promise((resolve, reject) => {
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 's1-liveness-'));
    const child = spawnChrome(chrome, [
      '--headless=new', '--dump-dom', '--virtual-time-budget=45000',
      '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
      '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage',
      `--user-data-dir=${profileDir}`, url
    ], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    const decoder = new StringDecoder('utf8');
    let settled = false;
    let guard;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      out += decoder.end();
      try { killChromeTree(child); } catch (_) { /* */ }
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) { /* */ }
      const m = /<script type="application\/json" id="__probe-results">([\s\S]*?)<\/script>/.exec(out);
      if (!m) { reject(new Error(`시험 결과를 받지 못했습니다: ${url}`)); return; }
      try { resolve(JSON.parse(m[1])); } catch (e) { reject(new Error(`시험 결과를 읽지 못했습니다: ${e.message}`)); }
    };
    child.stdout.on('data', (chunk) => {
      out += decoder.write(chunk);
      if (out.includes('id="__probe-results"') && out.includes('</html>')) finish();
    });
    child.on('exit', finish);
    child.on('error', reject);
    guard = setTimeout(finish, 180000);
  });
}

/* 새로 생긴 "배포본이 만드는 목록"이 계약 밖에 있으면 알려준다 — 계약이 조용히 낡는 것을 막는다. */
function contractRotWarnings() {
  const warnings = [];
  const covered = new Set(GENERATED_LISTS.map((r) => r.component));
  for (const file of fs.readdirSync(DIST_COMPONENTS).filter((f) => f.endsWith('.js'))) {
    const id = file.replace(/\.js$/, '');
    if (covered.has(id)) continue;
    const src = fs.readFileSync(path.join(DIST_COMPONENTS, file), 'utf8');
    if (/\.length\s*>\s*0\)\s*continue/.test(src)) {
      warnings.push(`${id} — 마크업이 이미 채웠으면 건너뛰는 자리가 생겼는데 T2 계약에 없습니다`);
    }
  }
  return warnings;
}

async function main() {
  const chrome = findChrome();
  if (!chrome) { const e = new Error('크롬을 찾지 못했습니다'); e.code = 2; throw e; }
  console.log('\n🔎 안내 표본 생존 검사기 (Gate 53)\n');

  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  let failures = 0;
  try {
    if (SELFTEST) {
      const r = await dumpDom(chrome, `${base}/__selftest.html`);
      const page = r.find((x) => x.test === 'PAGE');
      if (page) { console.error(`  ❌ 가짜 화면 — ${page.detail}`); return 1; }
      const t2 = r.filter((x) => x.test === 'T2');
      const t1 = r.filter((x) => x.test === 'T1');
      let escaped = 0;
      if (t2.length) console.log(`  ✅ 옛 결함(견본이 목록을 가로막음) — T2 가 잡아냄 · ${t2[0].detail}`);
      else { console.error('  ❌ 옛 결함을 되살렸는데 T2 가 통과시켰습니다(그물에 구멍)'); escaped++; }
      if (t1.length === 1) console.log(`  ✅ 안 깨운 표본 — T1 이 잡아냄 · ${t1[0].detail}`);
      else { console.error(`  ❌ 안 깨운 표본을 T1 이 제대로 짚지 못했습니다(잡은 것 ${t1.length}건, 1건이어야 함)`); escaped++; }
      if (t1.some((x) => /멈췄/.test(x.detail))) { console.error('  ❌ 정상 표본까지 실패로 셌습니다'); escaped++; }
      if (escaped) { console.error(`\n❌ 적대 시험 ${escaped}건이 그물을 빠져나갔습니다.\n`); return 1; }
      console.log('\n  ✅ 옛 결함 2종 전부 이 검사기에 걸립니다.\n');
      return 0;
    }

    for (const p of PAGES) {
      const r = await dumpDom(chrome, `${base}${p.url}`);
      const page = r.find((x) => x.test === 'PAGE');
      if (page) { console.error(`  ❌ ${p.label} — ${page.detail}`); failures++; continue; }
      const t1 = r.filter((x) => x.test === 'T1');
      const t2 = r.filter((x) => x.test === 'T2');
      const n1 = r.find((x) => x.test === 'T1-count')?.checked ?? 0;
      const owned = r.find((x) => x.test === 'T1-count')?.owned ?? 0;
      const n2 = r.find((x) => x.test === 'T2-count')?.checked ?? 0;
      console.log(`  ${t1.length || t2.length ? '❌' : '✅'} ${p.label} — 깨어남 ${n1 - t1.length}/${n1} · 목록 대조 ${n2}개${owned ? ` · 부모가 데리고 있는 껍데기 ${owned}개는 건너뜀` : ''}`);
      for (const f of t1) { console.error(`     ❌ [T1] ${f.component} — ${f.detail}\n        ${f.html}`); failures++; }
      for (const f of t2) { console.error(`     ❌ [T2] ${f.component} ${f.column} 칸 — 손으로 채운 목록이 배포본을 가로막았습니다\n        ${f.detail}\n        ${f.html}`); failures++; }
    }
  } finally {
    server.close();
  }

  for (const w of contractRotWarnings()) console.warn(`  ⚠️  ${w}`);

  if (failures) {
    console.error(`\n❌ 표본 ${failures}건 — 안내 화면이 보여 주는 것이 실제 배포본 동작이 아닙니다.\n`);
    return 1;
  }
  console.log('\n  ✅ 살아 있는 표본 전부 화면 자신의 손으로 깨어났고, 목록도 배포본이 만든 것입니다.');
  console.log('  ℹ️ 못 재는 것: 보기 글자·표 내용 같은 "쓰는 쪽이 채우는 자리"와 눈에 보이는 모양.\n');
  return 0;
}

main().then((c) => process.exit(c)).catch((e) => {
  if (e.code === 2) { console.log('  ⏭️  크롬이 없어 건너뜁니다 (CHROME_PATH 로 지정 가능)'); process.exit(2); }
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
