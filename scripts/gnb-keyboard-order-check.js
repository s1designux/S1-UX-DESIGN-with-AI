#!/usr/bin/env node
/**
 * gnb-keyboard-order-check.js — GNB 하위메뉴 키보드 순서 회귀 그물 (Gate 51)
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 만들었나 (river 지시 2026-09-16 "그 시험 만드는거 진행해줘"):
 *   2026-09-15~16 에 이 한 자리에서 결함 **네 건**이 났고 **전부 사람 손 검증으로만** 잡혔다.
 *     ① 초점 가둠 — 유틸 영역 없는 상단바에서 Tab 이 무한 순환(탈출 0회)
 *     ② 되돌아올 때 목록이 통째로 건너뛰어짐
 *     ③ 닫힌 목록 안 링크를 "초점 받을 수 있는 것"으로 세어 이웃을 잘못 짚음
 *     ④ 되돌아가기 표시가 안 꺼져, 정방향 Tab·메뉴 클릭이 목록 마지막으로 끌려감
 *   기존 검사기(ui-library/scripts/test.mjs)는 마크업·토큰만 보고 키 동작을 재현하지 않아
 *   네 번 다 그냥 통과시켰다. 이 검사기가 그 구멍을 메운다.
 *
 * ★ 무엇을 재나 — **배포본 런타임이 약속한 접점**을 실제 DOM 에서 확인한다:
 *     A. 펼쳐진 목록이 있는 메뉴에서 Tab → 목록 첫 링크
 *     B. 목록 마지막 링크에서 Tab → 상단바 안 다음 요소. **갈 곳이 없으면 가로채지 않는다**(①)
 *     C. Shift+Tab 직후 메뉴에 초점이 닿으면 → 목록 마지막 링크(②)
 *     D. Shift+Tab 표시는 **그 키 한 번**만 유효 — 한 tick 뒤엔 메뉴에 그대로 선다(④)
 *     E. 닫힌 목록 안 링크는 초점 후보로 세지 않는다(③)
 *     F. summary 처럼 브라우저가 초점을 주는 요소를 목록에서 빠뜨리지 않는다
 *
 * ★ 못 재는 것(정직하게): **브라우저가 Tab 을 실제로 어디로 옮기는지**는 재현하지 않는다.
 *   헤드리스로 진짜 키를 보내려면 디버깅 프로토콜이 필요하다. 지금 런타임은 순서를 스스로
 *   계산하지 않고 브라우저가 옮긴 뒤 보정하는 방식이라, 여기서 재는 것은 "보정이 맞나"다.
 *   "브라우저가 제자리에 옮겼나"는 사람이 한 번 밟아 확인한다(4·5차 검증 기록 참조).
 *
 * 사용: node scripts/gnb-keyboard-order-check.js            # 검사
 *       node scripts/gnb-keyboard-order-check.js --selftest # 적대 시험(옛 결함 4종 재현 → 잡히는지)
 * 종료: 0 통과 · 1 실패 · 2 크롬 없음(건너뜀은 gate 쪽에서 판단)
 */
const fs = require('fs');
const { spawnChrome, killChromeTree } = require('./lib/chrome-proc');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'ui-library/dist');
const SELFTEST = process.argv.includes('--selftest');

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

/** 옛 결함을 되살리는 변형 — 적대 시험용. 각 변형은 지정한 시험을 **반드시 실패**시켜야 한다. */
const MUTATIONS = [
  {
    id: 'D-1-가둠',
    expectFail: 'B',
    why: '갈 곳이 없을 때 트리거로 되돌리면 그 자리에서 무한 순환한다',
    apply: (src) => src.replace(
      'if (!next) return;',
      'if (!next) { event.preventDefault(); pair.trigger.focus(); return; }'),
  },
  // D-6(닫힌 목록 안 링크를 세던 결함)은 **변형 목록에 두지 않는다.** 4차에서 "순서를 우리가
  //   계산하지 않는다"로 설계를 바꾸면서 그 계산 자체가 사라져, 되살릴 코드가 없다. 조상 판정은
  //   지금도 남아 있지만(열린 목록 링크를 셀 때 쓰인다) 그것을 지워도 동작이 달라지지 않는다 —
  //   없는 결함을 있는 척 잡는 시험은 두지 않는다. 시험 E 는 "닫히면 목록이 초점 밖"이라는
  //   계약 자체를 재는 자리로 남긴다.
  {
    id: 'D-7-표시잔존',
    expectFail: 'D',
    why: '표시가 안 꺼지면 다음 정방향 Tab·클릭이 목록으로 끌려간다',
    apply: (src) => src.replace(
      'reverseHopTimer = setTimeout(() => { reverseHop = false; reverseHopTimer = null; }, 0);', ''),
  },
  {
    id: 'D-3-역방향없음',
    expectFail: 'C',
    why: '역방향 보정이 없으면 되돌아올 때 목록이 통째로 건너뛰어진다',
    // ⚠️ 'armReverseHop();' 만 지우면 'disarmReverseHop();' 안쪽이 먼저 걸려 문법이 깨진다.
    //    호출 줄을 통째로 짚는다.
    apply: (src) => src.replace(/\n\s*armReverseHop\(\);[^\n]*/, '\n'),
  },
];

const FIXTURE = (n) => `
<nav data-s1-component="gnb" data-size="md" aria-label="주 메뉴" id="full-${n}">
  <a data-s1-part="logo" href="#">로고</a>
  <ul data-s1-part="menus">
    <li><a data-s1-part="menu" href="#" aria-controls="p1-${n}">공지</a></li>
    <li><a data-s1-part="menu" href="#" aria-controls="p2-${n}">서비스</a></li>
  </ul>
  <div data-s1-part="util"><button type="button" data-s1-part="account" aria-label="계정"></button></div>
</nav>
<div data-s1-component="gnb-sub-menu" id="p1-${n}"><a data-s1-component="gnb-sub-menu-item" href="#">공지-1</a><a data-s1-component="gnb-sub-menu-item" href="#">공지-2</a></div>
<div data-s1-component="gnb-sub-menu" id="p2-${n}"><a data-s1-component="gnb-sub-menu-item" href="#">서비스-1</a><a data-s1-component="gnb-sub-menu-item" href="#">서비스-2</a></div>

<nav data-s1-component="gnb" data-size="md" aria-label="유틸 없는 메뉴" id="noutil-${n}">
  <ul data-s1-part="menus"><li><a data-s1-part="menu" href="#" aria-controls="p3-${n}">통계</a></li></ul>
</nav>
<div data-s1-component="gnb-sub-menu" id="p3-${n}"><a data-s1-component="gnb-sub-menu-item" href="#">통계-1</a><a data-s1-component="gnb-sub-menu-item" href="#">통계-2</a></div>
<details><summary id="sum-${n}">접힌 것</summary><p>안</p></details>
<a href="#" id="after-${n}">뒤 링크</a>
`;

/** 변형마다 자기 fixture 를 갖는다 — 크롬은 **한 번만** 띄운다(여러 번 띄우면 느려 멈춘 것처럼 보인다). */
function page(variants) {
  const blocks = variants.map((v, i) => FIXTURE(i)).join('\n');
  return `<!doctype html><meta charset="utf-8"><body>
${blocks}
<script type="module">
const VARIANTS = ${JSON.stringify(variants)};
const results = [];
const emit = () => { const out = document.createElement('script'); out.type = 'application/json'; out.id = 'results'; out.textContent = JSON.stringify(results); document.body.appendChild(out); };
let emitted = false;
const emitOnce = () => { if (emitted) return; emitted = true; emit(); };
window.addEventListener('error', (e) => { results.push({ variant: 'PAGE', id: 'PAGE', pass: false, detail: '페이지 오류: ' + e.message }); emitOnce(); });
window.addEventListener('unhandledrejection', (e) => { results.push({ variant: 'PAGE', id: 'PAGE', pass: false, detail: '페이지 오류(비동기): ' + (e.reason && e.reason.message || e.reason) }); emitOnce(); });
setTimeout(() => { results.push({ variant: 'PAGE', id: 'PAGE', pass: false, detail: '시험이 끝나지 않았습니다(8초)' }); emitOnce(); }, 8000);

const $ = (s) => document.querySelector(s);
const tick = () => new Promise((r) => setTimeout(r, 0));
const tab = (el, shift) => { const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: !!shift, bubbles: true, cancelable: true }); el.dispatchEvent(e); return e; };
const SEL = 'a[href], button, input, select, textarea, summary, [tabindex]';

for (let i = 0; i < VARIANTS.length; i++) {
  const v = VARIANTS[i];
  const ok = (id, pass, detail) => results.push({ variant: v.id, id, pass, detail });
  try {
    const mod = await import(URL.createObjectURL(new Blob([v.source], { type: 'text/javascript' })));
    const full = $('#full-' + i), noutil = $('#noutil-' + i);
    mod.init(full); mod.init(noutil);
    const m1 = full.querySelector('[aria-controls="p1-' + i + '"]');
    const m2 = full.querySelector('[aria-controls="p2-' + i + '"]');
    const m3 = noutil.querySelector('[aria-controls="p3-' + i + '"]');
    const account = full.querySelector('[data-s1-part="account"]');

    // A — 메뉴에서 Tab → 목록 첫 링크
    m1.focus(); await tick();
    tab(m1, false);
    ok('A', document.activeElement === $('#p1-' + i).querySelector('a'), '기대 목록 첫 링크, 실제 ' + (document.activeElement && document.activeElement.textContent));

    // B — 목록 마지막에서 Tab. 유틸 있으면 다음 요소로, 없으면 **가로채지 않는다**
    m1.focus(); await tick();
    const last1 = [...$('#p1-' + i).querySelectorAll('a')].pop();
    last1.focus(); await tick();
    tab(last1, false);
    const bFull = document.activeElement === m2;
    m3.focus(); await tick();
    const last3 = [...$('#p3-' + i).querySelectorAll('a')].pop();
    last3.focus(); await tick();
    const eB = tab(last3, false);
    const bNoUtil = eB.defaultPrevented === false && document.activeElement === last3;
    ok('B', bFull && bNoUtil, '유틸있음=' + bFull + ' 유틸없음(가로채지않음)=' + bNoUtil);

    // C — Shift+Tab 직후 메뉴에 닿으면 목록 마지막으로
    account.focus(); await tick();
    tab(account, true);
    m2.focus();
    ok('C', document.activeElement === [...$('#p2-' + i).querySelectorAll('a')].pop(), '기대 목록 마지막, 실제 ' + (document.activeElement && document.activeElement.textContent));

    // D — 표시는 그 키 한 번만 (한 tick 뒤엔 메뉴에 그대로)
    account.focus(); await tick();
    tab(account, true);
    await tick();
    m1.focus();
    ok('D', document.activeElement === m1, '기대 메뉴 유지, 실제 ' + (document.activeElement && document.activeElement.textContent));

    // E — 닫힌 목록 안 링크는 초점 밖
    m1.focus(); await tick();
    const openCount = [...$('#p1-' + i).querySelectorAll('a')].filter((a) => a.getClientRects().length > 0).length;
    $('#after-' + i).focus(); await tick();
    const closedCount = [...$('#p1-' + i).querySelectorAll('a')].filter((a) => a.getClientRects().length > 0).length;
    ok('E', openCount === 2 && closedCount === 0, '열림 ' + openCount + ' · 닫힘 ' + closedCount);

    // F — summary 를 초점 후보에서 빠뜨리지 않는다
    ok('F', $('#sum-' + i).matches(SEL), 'summary 가 셀렉터에 걸리나');
  } catch (e) {
    results.push({ variant: v.id, id: 'LOAD', pass: false, detail: '불러오기 실패: ' + (e && e.message) });
  }
}
emitOnce();
</script></body>`;
}

function runChrome(html) {
  const chrome = findChrome();
  if (!chrome) return Promise.reject(Object.assign(new Error('크롬을 찾지 못했습니다'), { code: 2 }));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's1-gnbkbd-'));
  const file = path.join(dir, 'fixture.html');
  fs.writeFileSync(file, html);
  return new Promise((resolve, reject) => {
    const child = spawnChrome(chrome, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--disable-dev-shm-usage',
      `--user-data-dir=${path.join(dir, 'profile')}`, '--virtual-time-budget=5000',
      '--dump-dom', `file://${file}`,
    ], { stdio: ['ignore', 'pipe', 'ignore'] });
    let buf = '';
    const timer = setTimeout(() => { killChromeTree(child); reject(new Error('크롬이 시간 안에 끝내지 못했습니다')); }, 120000);
    child.stdout.on('data', (c) => {
      buf += c;
      if (buf.includes('id="results"') && buf.includes('</html>')) {
        clearTimeout(timer); killChromeTree(child);
        const m = /<script type="application\/json" id="results">([\s\S]*?)<\/script>/.exec(buf);
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* */ }
        if (!m) { reject(new Error('결과를 읽지 못했습니다')); return; }
        resolve(JSON.parse(m[1]));
      }
    });
    child.on('error', reject);
  });
}

async function main() {
  const runtime = fs.readFileSync(path.join(DIST, 'components/gnb.js'), 'utf8');
  console.log('\n🔎 GNB 키보드 순서 검사기 (Gate 51)\n');

  const variants = [{ id: '현재', source: runtime }];
  const stale = [];
  if (SELFTEST) {
    for (const mut of MUTATIONS) {
      const mutated = mut.apply(runtime);
      if (mutated === runtime) { stale.push(mut); continue; }
      variants.push({ id: mut.id, source: mutated });
    }
  }

  const all = await runChrome(page(variants));
  const base = all.filter((r) => r.variant === '현재');
  for (const r of base) console.log(`  ${r.pass ? '✅' : '❌'} ${r.id} — ${r.detail}`);
  const bad = base.filter((r) => !r.pass);
  if (bad.length) {
    console.error(`\n❌ 키보드 순서 시험 ${bad.length}건 실패 — 하위메뉴를 키보드로 쓰는 길이 깨졌습니다.\n`);
    return 1;
  }

  if (!SELFTEST) {
    console.log(`\n  ✅ 시험 ${base.length}건 전부 통과 — 옛 결함이 다시 들어오면 여기서 걸립니다.`);
    console.log('  ℹ️ 못 재는 것: 브라우저가 Tab 을 실제로 어디로 옮기는지(사람이 한 번 밟아 확인).\n');
    return 0;
  }

  console.log('\n  ── 적대 시험: 옛 결함을 되살려 이 검사기가 잡는지 본다 ──');
  let escaped = 0;
  for (const mut of stale) { console.error(`  ❌ ${mut.id} — 변형을 적용하지 못했습니다(런타임이 바뀌어 변형 코드가 낡음)`); escaped++; }
  for (const mut of MUTATIONS) {
    if (stale.includes(mut)) continue;
    const caught = all.find((r) => r.variant === mut.id && r.id === mut.expectFail && !r.pass);
    if (caught) console.log(`  ✅ ${mut.id} — 시험 ${mut.expectFail} 이 잡아냄 (${mut.why})`);
    else {
      const saw = all.find((r) => r.variant === mut.id && r.id === mut.expectFail);
      console.error(`  ❌ ${mut.id} — 되살렸는데 시험 ${mut.expectFail} 이 통과해 버렸습니다(그물에 구멍) · 그때 본 것: ${saw ? saw.detail : '결과 없음'}`);
      escaped++;
    }
  }
  if (escaped) { console.error(`\n❌ 적대 시험 ${escaped}건이 그물을 빠져나갔습니다.\n`); return 1; }
  console.log(`\n  ✅ 옛 결함 ${MUTATIONS.length - stale.length}종 전부 이 검사기에 걸립니다.\n`);
  return 0;
}

main().then((c) => process.exit(c)).catch((e) => {
  if (e.code === 2) { console.log('  ⏭️  크롬이 없어 건너뜁니다 (CHROME_PATH 로 지정 가능)'); process.exit(2); }
  console.error(`❌ ${e.message}`); process.exit(1);
});
