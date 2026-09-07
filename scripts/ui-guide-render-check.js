#!/usr/bin/env node
/**
 * ui-guide-render-check.js — 컴포넌트 안내 화면을 "실제로 그려서" 검사한다.
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 필요한가(2026-09-02 독립 검증 🤖 component-verifier 지적):
 *   정적 문자열 검사는 **화면이 실제로 무엇을 보여주는지** 를 못 본다. 실증된 구멍 2개:
 *     G1 — 크기 라벨 금지 검사가 `mobileSizes` 라는 *변수 이름*에 묶여 있어,
 *          삼항식으로 인라인 선언한 Chip 경로는 그냥 통과했다.
 *     G2 — 「개발 코드」의 플랫폼 분기를 `false &&` 로 무력화해도 전 검사가 통과했다.
 *          즉 이번에 고친 버그(Mobile 화면에 PC 마크업)가 조용히 되돌아올 수 있었다.
 *   그래서 이 검사는 소스가 아니라 **렌더된 DOM** 을 본다.
 *
 * 검사 항목 (정본: registry/governance/component-presentation-policy.json
 *            _meta.uiLibraryGuideLayout 의 platformParity · stateMatrix.singleValueAxis)
 *   1. codeByPlatform — 각 화면의 「개발 코드」 HTML 이 그 플랫폼의 dist 예제와 글자 그대로 같다.
 *   2. singleValueAxis — Mobile 화면의 상태 표에 크기 라벨(LG·SM·MD·XSM·XXSM)이 없다.
 *   3. sameStartingPoint — Mobile preview 가 Action 상자로 시작한다(선행 안내 문단 없음).
 *
 * 사용: node scripts/ui-guide-render-check.js [--quiet]
 * 종료코드: 0 통과 · 1 위반 · 2 크롬 못 찾음(S1_SKIP_RENDER_CHECK=1 이면 0 으로 건너뜀)
 */
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { StringDecoder } = require('string_decoder');

const ROOT = path.resolve(__dirname, '..');
const quiet = process.argv.includes('--quiet');
const DIST = path.join(ROOT, 'ui-library/dist');
/* 「한 표로 합쳐야 할 유형」의 정본 선언 — 검사기가 §A-5 를 조준하는 데 쓴다(새 기준을 만들지 않는다). */
const presentationPolicy = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/governance/component-presentation-policy.json'), 'utf8'));
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2'
};

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
  ].filter(Boolean);
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (_) {} }
  return null;
}

/* file:// 은 ES module 이 안 돌아 화면이 텅 빈다(wiring-and-traps §2 T2) — 반드시 http 로 띄운다. */
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]).replace(/^\/+/, '');
      const abs = path.join(ROOT, rel);
      if (!abs.startsWith(ROOT) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(abs).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/* `--dump-dom` 은 출력을 다 쓰고도 스스로 종료하지 않는다(render-shot.js 와 같은 함정).
   </html> 를 받은 즉시 죽인다. */
function dumpDom(chrome, url) {
  return new Promise((resolve, reject) => {
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-dom-'));
    const child = spawn(chrome, [
      '--headless=new', '--dump-dom', '--virtual-time-budget=4000',
      /* 바깥 폰트 CDN 을 기다리느라 크롬이 30초씩 매달린다 — 로컬 외 요청은 즉시 실패시킨다.
         (검사 대상은 우리 화면 구조이지 웹폰트가 아니다.) */
      '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
      '--no-sandbox', '--disable-gpu', `--user-data-dir=${profileDir}`, url
    ], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    const decoder = new StringDecoder('utf8');
    let settled = false;
    /* 안전망 타이머를 그대로 두면 이미 끝났는데도 이벤트 루프가 60초 더 살아 있다
       (실측: 검사 자체는 1.7초인데 전체가 62초였다). 끝나면 반드시 해제한다. */
    let guard;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      out += decoder.end();
      try { child.kill('SIGKILL'); } catch (_) {}
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
      out.includes('</html>') ? resolve(out) : reject(new Error(`DOM 을 받지 못했습니다: ${url}`));
    };
    child.stdout.on('data', (chunk) => { out += decoder.write(chunk); if (out.includes('</html>')) finish(); });
    child.on('exit', finish);
    guard = setTimeout(finish, 60000);
  });
}

const unescapeHtml = (value) => value
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"')
  .replaceAll('&#039;', "'").replaceAll('&amp;', '&');

const stripTags = (value) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** 렌더된 DOM 에서 컴포넌트 섹션 하나를 잘라낸다.
    안내 화면은 안에 또 <section>(실제 동작·개발 코드·문서)을 두므로 첫 </section> 에서 끊으면 안 된다 —
    다음 형제 .comp-section 이 시작하는 자리까지가 그 컴포넌트다. */
function sectionOf(dom, id) {
  const start = dom.indexOf(`<section class="comp-section`);
  if (start < 0) return '';
  const anchor = dom.indexOf(`id="${id}"`);
  if (anchor < 0) return '';
  const open = dom.lastIndexOf('<section class="comp-section', anchor);
  if (open < 0) return '';
  const next = dom.indexOf('<section class="comp-section', open + 1);
  return dom.slice(open, next < 0 ? undefined : next);
}

/* 배포본 manifest 는 검사 중 여러 번 필요하다 — 파일을 한 번만 읽는다. */
const manifestCache = new Map();
function componentManifestOf(id) {
  if (!manifestCache.has(id)) {
    manifestCache.set(id, JSON.parse(fs.readFileSync(path.join(DIST, `components/${id}.manifest.json`), 'utf8')));
  }
  return manifestCache.get(id);
}

/* 한 플랫폼 화면만 잘라낸다. PC·Mobile 두 블록이 같은 DOM 에 다 있어서(한쪽은 display:none)
   자르지 않으면 PC 검사가 Mobile 마크업을 보고 틀린 판정을 낸다. 개발 코드 칸은 이 경계 밖이다. */
function platformSlice(html, platform) {
  const start = html.indexOf(`platform-section-${platform}`);
  if (start < 0) return '';
  const rest = html.slice(start);
  const ends = [
    rest.indexOf('platform-section-', 1),
    rest.indexOf('<section class="uilg-code"'),
    rest.indexOf('<div class="uilg-demo-block"')
  ].filter((n) => n > 0);
  return ends.length ? rest.slice(0, Math.min(...ends)) : rest;
}

/* 화면이 쓰는 「열림 방식」이 그 화면이 선언한 배포 예제와 같은가.
   예제가 시트(sheet)로 여는 형태면 화면 표본도 목록 패널(panel)을 들고 있으면 안 되고, 반대도 같다.
   판정 근거는 예제 파일 자신이라 새 기준이 아니다. 열림 방식이 없는 컴포넌트는 그냥 건너뛴다. */
function demoOpeningParity(id, blockKey, platform, demoHtml, exampleHtml, failures) {
  const scoped = platformSlice(demoHtml, platform);
  if (!scoped) return;
  const has = (html, part) => new RegExp(`data-s1-part="${part}"`).test(html);
  const wantsSheet = has(exampleHtml, 'sheet');
  const wantsPanel = has(exampleHtml, 'panel');
  if (wantsSheet === wantsPanel) return; // 둘 다이거나 둘 다 아니면 가릴 것이 없다
  const strayPart = wantsSheet ? 'panel' : 'sheet';
  if (has(scoped, strayPart)) {
    failures.push(`${id}/${blockKey} 화면 표본이 ${strayPart} 로 열립니다 — 선언한 예제는 ${wantsSheet ? 'sheet' : 'panel'} 입니다 (${platform})`);
  }
  /* aria-haspopup 값은 예제 파일에서 읽는다. 「패널이면 listbox」처럼 내가 짝을 지어 두면
     그것은 검사기가 만든 기준이다 — Date Picker 는 패널(팝오버 달력)인데도 dialog 를 쓴다. */
  const wantPopup = (exampleHtml.match(/aria-haspopup="([a-z]+)"/) || [])[1];
  if (wantPopup) {
    for (const m of scoped.matchAll(/aria-haspopup="([a-z]+)"/g)) {
      if (m[1] !== wantPopup) {
        failures.push(`${id}/${blockKey} 화면 표본의 aria-haspopup 이 ${m[1]} 입니다 — 선언한 예제는 ${wantPopup} 입니다 (${platform})`);
        break;
      }
    }
  }
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    if (process.env.S1_SKIP_RENDER_CHECK === '1') {
      console.log('⚠️  크롬을 찾지 못해 안내 화면 렌더 검사를 건너뜁니다(S1_SKIP_RENDER_CHECK=1).');
      process.exit(0);
    }
    console.error('❌ 크롬을 찾지 못했습니다. CHROME_PATH 를 지정하거나 S1_SKIP_RENDER_CHECK=1 로 건너뛰세요.');
    process.exit(2);
  }

  const distManifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
  const components = distManifest.components.filter(({ status }) => ['approved', 'verified'].includes(status));
  const failures = [];
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/pages/components.html`;

  try {
    for (const platform of ['pc', 'mobile']) {
      const t0 = Date.now();
      const dom = await dumpDom(chrome, `${base}?platform=${platform}`);
      if (process.env.S1_DEBUG) console.error(`[debug] ${platform} dump ${Date.now() - t0}ms len=${dom.length}`);

      /* 부품 표본 격리 — 부품 표본이 세트 소유 장식을 함께 보여주는지(Gate 44).
         같은 DOM 을 재사용해 크롬을 한 번만 띄운다. */
      const partSample = require('./ui-guide-part-sample-check.js').checkDom(dom, { label: platform });
      failures.push(...partSample.failures);
      for (const warning of partSample.warnings) if (!quiet) console.warn(`⚠️  ${warning}`);

      for (const component of components) {
        const { id, examples = {} } = component;
        const section = sectionOf(dom, id);
        if (!section) { failures.push(`${id} 섹션이 렌더되지 않았습니다 (${platform})`); continue; }

        /* 1) 개발 코드 = 그 플랫폼의 dist 예제와 글자 그대로 같아야 한다. */
        const expectedPath = examples[platform] || examples.pc || `examples/${id}.html`;
        const expected = fs.readFileSync(path.join(DIST, expectedPath), 'utf8').trim();
        const pane = section.match(/<pre data-guide-code="html">([\s\S]*?)<\/pre>/);
        if (!pane) {
          if (process.env.S1_DEBUG) console.error(`[debug] ${id}/${platform}: ${stripTags(section).slice(0, 500)}`);
          failures.push(`${id} 개발 코드 HTML 칸이 없습니다 (${platform})`);
        }
        else if (unescapeHtml(pane[1]).trim() !== expected) {
          failures.push(`${id} (${platform}) 개발 코드가 ${expectedPath} 와 다릅니다 — 보고 있는 화면의 마크업만 보여야 합니다`);
        }

        /* 1c) 상자가 하나인 화면도 같은 대조를 받는다 — 1b 는 상자가 둘 이상일 때만 돈다. */
        {
          const expectedHtml = fs.readFileSync(path.join(DIST, expectedPath), 'utf8');
          demoOpeningParity(id, 'main', platform, section, expectedHtml, failures);
        }

        /* 1b) 상자를 여럿 두는 화면(Input = 기본·패스워드·서치)은 상자마다 자기 개발 코드를 단다
              (river 결정 HD-A, 2026-09-07). 위 ①은 첫 상자만 봐서, 뒤 상자가 엉뚱한 마크업을 보여도
              통과한다 — 상자가 스스로 「어느 배포 예제를 썼다」고 말한 것(data-guide-example)과
              실제 코드 칸을 대조하고, 그 예제가 배포본 manifest 가 선언한 것인지도 함께 본다.
              새 기준을 만들지 않는다 — ①과 같은 규칙을 상자 수만큼 적용할 뿐이다. */
        const declaredDistributions = new Set(
          Object.values(componentManifestOf(id).htmlContract?.breakExamples ?? {}).map((e) => e.distribution)
        );
        /* 상자 경계는 여는 태그로만 끊는다 — 끝을 「uilg-rules 섹션」에 기대면 그 섹션이 없는 화면에서
           마지막 상자가 통째로 빠진다(🤖 component-verifier 2026-09-07 구멍 2). */
        const blockRe = /<div class="uilg-demo-block"([^>]*)>([\s\S]*?)(?=<div class="uilg-demo-block"|<section class="uilg-rules|$)/g;
        const blocks = [...section.matchAll(blockRe)].map((m) => {
          const attrs = m[1];
          return {
            key: (attrs.match(/data-guide-block="([^"]*)"/) || [])[1],
            example: (attrs.match(/data-guide-example="([^"]*)"/) || [])[1],
            body: m[2]
          };
        });
        /* 속성이 없으면 조용히 건너뛰던 것 → 실패로 올린다(구멍 1). 자기신고가 없으면 대조할 수 없다. */
        for (const b of blocks) {
          if (!b.key || !b.example) {
            failures.push(`${id} 상자가 자기 예제를 신고하지 않습니다(data-guide-block·data-guide-example) — 대조할 수 없습니다 (${platform})`);
          }
        }
        if (blocks.length > 1) {
          for (const { key: blockKey, example: examplePath, body } of blocks) {
            if (!blockKey || !examplePath) continue; // 위에서 이미 실패로 올렸다
            if (!declaredDistributions.has(examplePath)) {
              failures.push(`${id}/${blockKey} 상자가 배포본이 선언하지 않은 예제(${examplePath})를 씁니다 (${platform})`);
              continue;
            }
            const blockPane = body.match(/<pre data-guide-code="html">([\s\S]*?)<\/pre>/);
            if (!blockPane) { failures.push(`${id}/${blockKey} 상자에 개발 코드 HTML 칸이 없습니다 (${platform})`); continue; }
            const want = fs.readFileSync(path.join(DIST, examplePath), 'utf8').trim();
            if (unescapeHtml(blockPane[1]).trim() !== want) {
              failures.push(`${id}/${blockKey} 개발 코드가 ${examplePath} 와 다릅니다 (${platform})`);
            }
            /* 코드 칸만 보면 「코드는 새 형태, 화면은 옛 형태」가 통과한다 — 실제로 그렇게 샜다
               (🤖 component-verifier 2026-09-07 A-2: Mobile Time Picker 코드는 휠 시트인데
                표본 12개 중 10개가 폐기된 목록 마크업이었다). 화면이 쓰는 열림 방식이 선언한
                예제와 같은지도 본다 — 판정 기준은 예제 파일 자신이다(새 기준을 만들지 않는다). */
            demoOpeningParity(id, blockKey, platform, body, want, failures);
          }
        }

        /* Line Tab은 PC·Mobile이 서로 다른 size/break 예제를 쓴다. 실제 동작 영역에
           반대 플랫폼 마크업이나 요약이 섞이면 코드 탭만 맞아도 화면은 틀린 것이다. */
        if (id === 'tab') {
          const visibleGuide = section.slice(0, section.indexOf('<section aria-labelledby="tab-code-heading"'));
          if (platform === 'pc' && (/data-break="mobile"/.test(visibleGuide) || /Mobile SM 32/.test(visibleGuide))) {
            failures.push('tab PC 화면에 Mobile 내용이 함께 표시됩니다');
          }
          if (platform === 'mobile' && (/data-break="pc"/.test(visibleGuide) || /PC 3크기/.test(visibleGuide))) {
            failures.push('tab Mobile 화면에 PC 내용이 함께 표시됩니다');
          }
        }

        if (platform !== 'mobile') continue;
        const mobileStart = section.indexOf('platform-section-mobile');
        if (mobileStart < 0) continue;
        const mobile = section.slice(mobileStart);

        /* 2) Mobile 상태 표에 크기 축을 세우지 않는다 — Mobile 크기가 실제로 한 가지일 때만.
              플랫폼 축이 없어 PC 와 같은 내용을 두는 컴포넌트(Dropdown)는 크기 축이 살아 있다.
              ⚠️ 이 건너뛰기는 검사 ②에만 걸린다 — ③④는 전 컴포넌트에 적용한다
              (2026-09-02 재검증 G3: HD-3 결함이 있던 checkbox·radio·toggle·dropdown 이 통째로 빠져 있었다). */
        const componentManifest = componentManifestOf(id);
        if (componentManifest.breaks?.mobile?.length === 1) {
          /* 크기 라벨은 열 머리(matrix-col-header)에도, 행 라벨(matrix-row-label)에도 설 수 있다.
             종전 Chip 이 행 라벨에 크기를 넣던 방식이라 열만 보면 되돌리기가 그대로 통과한다. */
          for (const cell of mobile.matchAll(/<div class="(matrix-col-header|matrix-row-label)"[^>]*>([\s\S]*?)<\/div>/g)) {
            const label = stripTags(cell[2]);
            if (/^(LG|SM|MD|XSM|XXSM)\b/.test(label)) {
              failures.push(`${id} Mobile 표에 크기 라벨("${label}")이 있습니다 — 크기가 한 가지면 축으로 세우지 않습니다`);
            }
          }
          /* 두 갈래가 같은 규칙이므로 단위 목록도 같아야 한다 — 뒤 갈래에 × 가 빠져 있었다
             (2026-09-02 3회차 재검증 B2b: button Mobile 의 종전 표기가 문자 그대로 "80×48" 이었다). */
          if (/uilg-size-dim[^>]*>\s*(\d+\s*(px|×))/i.test(mobile) || /<span>\s*\d+\s*(px|×)/i.test(mobile)) {
            failures.push(`${id} Mobile 표에 크기 수치 꼬리표가 있습니다 — 크기가 한 가지면 표기하지 않습니다`);
          }
          /* 유형(variant)은 한 표에서 함께 본다 — 사이 가로선으로 가르지 않는다.
             §A-5 가 막는 것은 「한 표로 합쳐야 할 유형」을 선으로 가르는 것이지 모든 선이 아니다.
             무엇이 「합쳐야 할 유형」인지는 이미 정본급 선언이 있다 —
             `registry/governance/component-presentation-policy.json` 의 `variants`
             (button=primary/secondary/blue-line · chip·filter-chip=line/solid). 새 기준을 만들지 않고 그것을 쓴다.
               · `variants` 를 선언한 컴포넌트 → 그 유형들은 한 표에 합쳐야 하므로 Mobile 가로선 0개.
                 (블록으로 갈라 그 사이에 선을 넣는 형태도 이 조건에 걸린다 — 개수 비교만으로는 새어나갔다.
                  🤖 component-verifier 2026-09-07 4회차 A-2 가 그 구멍을 찾았다.)
               · `variants` 가 없는 컴포넌트 → Mobile 에 남는 블록은 합칠 수 없는 별개 섹션이므로
                 PC 와 같이 가로선으로 구분한다(river 결정 HD-7, 2026-09-07). 다만 선이 블록보다 많으면
                 표 안을 가른 것이므로 실패. */
          const mobileBlocks = (mobile.match(/class="uilg-variant-block"/g) || []).length;
          const mobileRules = (mobile.match(/<hr class="uilg-separator"/g) || []).length;
          const declaredVariants = presentationPolicy.components?.[id]?.variants;
          if (Array.isArray(declaredVariants) && declaredVariants.length > 0) {
            if (mobileRules > 0) {
              failures.push(`${id} Mobile 에 유형 사이 가로선이 ${mobileRules}개 있습니다 — 유형(${declaredVariants.join('·')})은 크기가 한 가지면 한 표에서 함께 봅니다`);
            }
          } else if (mobileRules > mobileBlocks) {
            failures.push(`${id} Mobile 가로선이 ${mobileRules}개로 섹션 블록 ${mobileBlocks}개보다 많습니다 — 표 안 유형을 선으로 가른 것입니다`);
          }
        }

        /* 3) 요약 한 줄에도 크기 얘기를 두지 않는다(크기가 한 가지인 화면). */
        const scope = section.match(/<p class="uilg-demo-note">([^<]*)<\/p>/);
        if (scope && /(PC|Mobile)\s*\d\s*크기/.test(scope[1])) {
          failures.push(`${id} Mobile 요약에 크기 문구("${scope[1].trim()}")가 있습니다 — 크기가 한 가지면 언급하지 않습니다`);
        }

        /* 4) 「개발 코드」 위에 안내 문구를 두지 않는다 (river 결정 2026-09-02) —
              어느 화면인지는 화면 이름으로 이미 알 수 있다. */
        const codeSection = section.match(/<section class="uilg-code"[\s\S]*?<div class="uilg-code-toolbar"/);
        if (codeSection && /<p class="uilg-demo-note"/.test(codeSection[0])) {
          failures.push(`${id} 개발 코드 위에 안내 문구가 있습니다 — 두지 않습니다`);
        }

        /* 5) Mobile preview 는 PC 처럼 Action 상자로 시작한다(선행 안내 문단 금지). */
        const preview = mobile.match(/<div class="preview-area">([\s\S]{0,400})/);
        if (preview && /^\s*<p\b/.test(preview[1])) {
          failures.push(`${id} Mobile preview 가 안내 문단으로 시작합니다 — PC 와 시작 지점이 달라집니다`);
        }
      }
    }
  } finally {
    server.close();
  }

  if (failures.length) {
    console.error(`❌ 안내 화면 렌더 검사 실패 ${failures.length}건:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  if (!quiet) console.log(`✅ 안내 화면 렌더 검사 통과 — 컴포넌트 ${components.length}종 × PC·Mobile 실제 렌더 대조.`);
}

main().catch((error) => { console.error(`❌ ${error.message}`); process.exit(1); });
