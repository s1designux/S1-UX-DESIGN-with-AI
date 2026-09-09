#!/usr/bin/env node
/**
 * gen-dev-download-panel.js
 * --------------------------------------------------------------------------
 * pages/install-prompt.html 의 개발자 패널을 배포본에서 자동 생성한다.
 *
 *   실행: npm run devpanel:gen      (검사: npm run devpanel:check)
 *
 * [왜 생성물인가]
 *   컴포넌트 목록·버전 지문·토큰 개수를 손으로 적으면 배포본이 바뀔 때마다 어긋난다.
 *   화면에 적힌 지문이 실제 배포본과 다르면 개발자는 최신 여부를 확인할 방법을 잃는다.
 *
 * 입력: ui-library/dist/manifest.json · dist/platform/manifest.json · assets/downloads/*.stamp.json
 * 출력: install-prompt.html 의 <!-- DEV-PANEL:START --> ~ <!-- DEV-PANEL:END --> 구간
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGE = path.join(ROOT, 'pages', 'install-prompt.html');
const DIST = path.join(ROOT, 'ui-library', 'dist');
const STAMP = path.join(ROOT, 'assets', 'downloads', 's1-ui-dev-package.stamp.json');
const UPDATES = path.join(ROOT, 'assets', 'downloads', 'platform-updates.json');
const REPOSITORY = 'https://github.com/s1designux/S1-UX-DESIGN-with-AI';
const START = '<!-- DEV-PANEL:START — 자동 생성(npm run devpanel:gen). 손으로 고치지 마세요. -->';
const END = '<!-- DEV-PANEL:END -->';
const checkOnly = process.argv.includes('--check');

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
const platform = JSON.parse(fs.readFileSync(path.join(DIST, 'platform', 'manifest.json'), 'utf8'));
if (!fs.existsSync(STAMP)) {
  console.error('❌ 배포 ZIP 지문이 없습니다 — 먼저 `npm run ui:zip` 을 실행하세요.');
  process.exit(1);
}
const stamp = JSON.parse(fs.readFileSync(STAMP, 'utf8'));
if (stamp.distFingerprint && stamp.canonicalFingerprint !== manifest.canonicalFingerprint) {
  console.error('❌ 배포 ZIP 이 현재 배포본과 다른 정본에서 나왔습니다 — `npm run ui:zip` 을 다시 실행하세요.');
  process.exit(1);
}

const approved = manifest.components.filter((component) => component.status === 'approved');

/* ── 툴별 "마지막으로 바뀐 날" ───────────────────────────────────────────
   빌드는 날짜를 남기지 않는다(같은 정본이면 같은 결과여야 하므로). 그래서 툴마다
   전달본 내용의 지문을 떠서 장부에 적어 두고, 지문이 달라진 날만 날짜를 새로 적는다.
   → 내용이 그대로면 날짜도 그대로다(다시 만들어도 화면이 흔들리지 않는다). */
const TOOL_SOURCES = {
  'html-css-js': ['s1-ui.css', 's1-ui.js', 's1-ui.auto.js', 'components', 'examples', 'assets'],
  react: ['platform/react'],
  vue: ['platform/vue'],
  kotlin: ['platform/kotlin', 'platform/behavior.json'],
  swift: ['platform/swift', 'platform/behavior.json'],
  cpp: ['platform/cpp', 'platform/behavior.json']
};

function collectFiles(target, into = []) {
  const absolute = path.join(DIST, target);
  if (!fs.existsSync(absolute)) return into;
  if (fs.statSync(absolute).isDirectory()) {
    for (const entry of fs.readdirSync(absolute).sort()) collectFiles(path.join(target, entry), into);
    return into;
  }
  into.push(absolute);
  return into;
}

function toolFingerprint(key) {
  const digest = crypto.createHash('sha256');
  for (const source of TOOL_SOURCES[key] ?? []) {
    for (const file of collectFiles(source)) {
      digest.update(path.relative(DIST, file));
      digest.update('\0');
      digest.update(fs.readFileSync(file));
      digest.update('\0');
    }
  }
  return digest.digest('hex');
}

const today = new Date().toISOString().slice(0, 10);
const ledger = fs.existsSync(UPDATES) ? JSON.parse(fs.readFileSync(UPDATES, 'utf8')) : { note: '자동 생성물 — 툴별 전달본이 마지막으로 바뀐 날. 지문이 달라진 날만 갱신된다.', tools: {} };
const updatedAt = {};
let ledgerChanged = false;
for (const key of Object.keys(TOOL_SOURCES)) {
  const fingerprint = toolFingerprint(key);
  const known = ledger.tools[key];
  if (!known || known.fingerprint !== fingerprint) {
    ledger.tools[key] = { fingerprint, date: today };
    ledgerChanged = true;
  }
  updatedAt[key] = ledger.tools[key].date;
}
if (ledgerChanged && !checkOnly) fs.writeFileSync(UPDATES, `${JSON.stringify(ledger, null, 2)}\n`);
if (ledgerChanged && checkOnly) {
  console.error('❌ 툴별 전달본이 바뀌었는데 갱신 날짜가 적히지 않았습니다 — `npm run devpanel:gen` 을 실행하세요.');
  process.exit(1);
}

/* 툴 카드 — 무엇을 주는지, 어디까지 되는지, **어떻게 설치하고 무엇이 들어있는지**.
   예시 코드만 보이면 "그 세 개만 있나" 로 읽힌다(river 지적 2026-09-09).
   그래서 카드는 ①설치 순서 ②들어있는 것 을 먼저 말하고, 코드는 붙여넣을 최소 줄만 남긴다. */
const TOOL_CARDS = [
  {
    key: 'html-css-js',
    title: 'HTML · CSS · JavaScript',
    note: `${approved.length}종 전부 · 퍼블리싱 · jQuery · JSP·PHP 같은 서버 렌더링`,
    support: 'full',
    supportLabel: '컴포넌트 그대로 사용',
    install: [
      '압축을 풀면 나오는 <code>s1-ui</code> 폴더를 프로젝트에 그대로 넣습니다 — 안에 있는 <code>preview.html</code> 을 열면 22종이 실제 모습으로 보입니다',
      '아래 두 줄을 <code>&lt;head&gt;</code> 에 넣어 겉모습을 읽힙니다',
      '동작이 있는 컴포넌트는 <code>autoInit()</code> 한 번으로 전부 붙습니다'
    ],
    code: `<link rel="stylesheet" href="s1-ui/assets/css/tokens.css">
<link rel="stylesheet" href="s1-ui/s1-ui.css">
<script type="module">
  import { autoInit } from "./s1-ui/s1-ui.auto.js";
  autoInit();
</script>`,
    contains: `컴포넌트 ${approved.length}종의 마크업(<code>examples/</code>) · 겉모습 한 벌(<code>s1-ui.css</code>) · 동작 스크립트 · 아이콘`,
    files: ['s1-ui.css', 's1-ui.auto.js', 'examples/'],
    lint: true
  },
  {
    key: 'react',
    title: 'React · Next.js',
    note: `${approved.length}종 전부 · JSX 빌드 도구 필요 · 서버 렌더링·타입 정의 포함`,
    support: 'full',
    supportLabel: '컴포넌트 그대로 사용',
    install: [
      '압축을 풀면 나오는 <code>s1-ui</code> 폴더를 프로젝트에 그대로 넣습니다 — 안에 있는 <code>preview.html</code> 을 열면 22종이 실제 모습으로 보입니다',
      '앱 진입 파일에서 겉모습 CSS 를 한 번 읽힙니다 (<code>tokens.css</code> · <code>s1-ui.css</code>)',
      '쓸 컴포넌트만 이름으로 꺼내 씁니다 — 아래는 그 한 줄입니다'
    ],
    code: `import { S1Button, S1DatePicker }
  from "./s1-ui/platform/react";`,
    contains: `컴포넌트 ${approved.length}종 전부 — 이름은 앞에 <code>S1</code> (<code>input → S1Input</code> · <code>date-picker → S1DatePicker</code>) · 사용 설명서(README) · 타입 정의(index.d.ts)`,
    files: ['platform/react/', 'platform/react/README.md', 'platform/react/index.d.ts'],
    lint: true
  },
  {
    key: 'vue',
    title: 'Vue',
    note: `${approved.length}종 전부 · SFC(.vue) 빌드 도구가 필요합니다`,
    support: 'full',
    supportLabel: '컴포넌트 그대로 사용',
    install: [
      '압축을 풀면 나오는 <code>s1-ui</code> 폴더를 프로젝트에 그대로 넣습니다 — 안에 있는 <code>preview.html</code> 을 열면 22종이 실제 모습으로 보입니다',
      '앱 진입 파일에서 겉모습 CSS 를 한 번 읽힙니다 (<code>tokens.css</code> · <code>s1-ui.css</code>)',
      '쓸 컴포넌트만 이름으로 꺼내 씁니다 — 아래는 그 한 줄입니다'
    ],
    code: `import { S1Button, S1DatePicker }
  from "./s1-ui/platform/vue";`,
    contains: `컴포넌트 ${approved.length}종 전부 — 이름은 앞에 <code>S1</code> (<code>input → S1Input</code> · <code>date-picker → S1DatePicker</code>)`,
    files: ['platform/vue/'],
    lint: true
  },
  {
    key: 'kotlin',
    title: 'Kotlin (Android)',
    note: 'Compose · View 공용 상수',
    support: 'tokens',
    supportLabel: '색·크기 값만',
    install: [
      '<code>S1Tokens.kt</code> 를 프로젝트 소스에 넣습니다 (패키지 <code>com.s1.designsystem</code>)',
      '색·크기는 이 상수를 부릅니다 — 값을 눈으로 보고 옮겨 적지 마세요',
      '눌렀을 때·꺼졌을 때 같은 상태 변화는 <code>behavior.json</code> 을 그대로 따릅니다'
    ],
    code: `Color(S1Tokens.Colors.colorBgLevel0)   // Compose
S1Tokens.ColorsDark.colorBgLevel0      // 다크 값
S1Tokens.Dimens.radiusControlSm        // 4.0f`,
    contains: `색 ${platform.tokenCount}개(라이트·다크) · 크기·간격·반경 값 · 컴포넌트 동작 명세(<code>behavior.json</code>). <strong>화면 부품은 들어있지 않습니다 — 직접 그려야 합니다.</strong>`,
    files: ['platform/kotlin/S1Tokens.kt', 'platform/behavior.json'],
    lint: false
  },
  {
    key: 'swift',
    title: 'Swift (iOS)',
    note: 'UIKit · SwiftUI 공용 상수',
    support: 'tokens',
    supportLabel: '색·크기 값만',
    install: [
      '<code>S1Tokens.swift</code> 를 프로젝트에 넣습니다',
      '색·크기는 이 상수를 부릅니다 — 색은 <code>0xAARRGGBB</code> 정수입니다',
      '눌렀을 때·꺼졌을 때 같은 상태 변화는 <code>behavior.json</code> 을 그대로 따릅니다'
    ],
    code: `let bg = S1Tokens.Colors.colorBgLevel0
let radius = S1Tokens.Dimens.radiusControlSm`,
    contains: `색 ${platform.tokenCount}개(라이트·다크) · 크기·간격·반경 값 · 컴포넌트 동작 명세(<code>behavior.json</code>). <strong>화면 부품은 들어있지 않습니다 — 직접 그려야 합니다.</strong>`,
    files: ['platform/swift/S1Tokens.swift', 'platform/behavior.json'],
    lint: false
  },
  {
    key: 'cpp',
    title: 'C++',
    note: '화면 라이브러리(Qt·MFC 등)가 정해지면 더 붙습니다',
    support: 'tokens',
    supportLabel: '색·크기 값만',
    install: [
      '<code>s1_tokens.h</code> 를 프로젝트에 넣고 <code>#include</code> 합니다',
      '색·크기는 이 상수를 부릅니다 — 색은 <code>0xAARRGGBB</code> 정수입니다',
      '값을 다른 형태로 쓰려면 <code>tokens.json</code> 을 읽어 쓰세요'
    ],
    code: `#include "s1_tokens.h"
using namespace s1::tokens;

auto bg = S1_COLOR_BG_LEVEL_0;    // 0xAARRGGBB
auto r  = S1_RADIUS_CONTROL_SM;   // 4.0f`,
    contains: `색 ${platform.tokenCount}개(라이트·다크) · 크기·간격·반경 값 · 같은 값의 JSON 사본. <strong>화면 부품은 들어있지 않습니다 — 직접 그려야 합니다.</strong>`,
    files: ['platform/cpp/s1_tokens.h', 'platform/tokens.json'],
    lint: false
  }
];

function toolCard(tool) {
  const packageInfo = stamp.packages?.[tool.key];
  if (!packageInfo) {
    console.error(`❌ ${tool.key} 묶음이 없습니다 — 먼저 \`npm run ui:zip\` 을 실행하세요.`);
    process.exit(1);
  }
  const badge = tool.support === 'full'
    ? '<span class="devtool-badge devtool-badge-full">컴포넌트 그대로 사용</span>'
    : '<span class="devtool-badge devtool-badge-tokens">색·크기 값만</span>';
  const lint = tool.lint
    ? '<span class="devtool-check">자가 검사기 사용 가능</span>'
    : '<span class="devtool-check devtool-check-off">자가 검사기 없음 — 값 대조까지만</span>';
  return `          <div class="devtool-card">
            <div class="devtool-head">
              <div>
                <div class="devtool-title">${escape(tool.title)}</div>
                <div class="devtool-note">${escape(tool.note)}</div>
              </div>
              <div class="devtool-head-right">
                ${badge}
                <span class="devtool-updated">업데이트 ${escape(updatedAt[tool.key] ?? '—')}</span>
              </div>
            </div>
            <div class="devtool-section">설치</div>
            <ol class="devtool-steps">
              ${tool.install.map((step) => `<li>${step}</li>`).join('\n              ')}
            </ol>
            <pre class="devtool-code"><code>${escape(tool.code)}</code></pre>
            <div class="devtool-section">들어있는 것</div>
            <p class="devtool-contains">${tool.contains}</p>
            <div class="devtool-get">
              <a class="devtool-btn" href="../assets/downloads/${escape(packageInfo.zip)}" download>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                이 툴만 받기
              </a>
              <span class="devtool-size">${packageInfo.sizeKB}KB · 파일 ${packageInfo.files}개</span>
            </div>
            <div class="devtool-foot">
              <span class="devtool-files">${tool.files.map((file) => `<code>${escape(file)}</code>`).join(' ')}</span>
              ${lint}
            </div>
          </div>`;
}

const componentChips = approved
  .map(({ id }) => `<span class="devcomp-chip">${escape(id)}</span>`)
  .join('\n              ');

const panel = `${START}
      <div class="top-panel" id="top-dev">
        <div class="install-steps">

          <!-- 받기 -->
          <div class="install-step">
            <div class="step-header">
              <div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                  <div class="step-title">S1 UI 라이브러리 배포본 <span class="ver-badge">${escape(manifest.version)}</span></div>
                </div>
                <div class="step-desc">디자인에서 승인한 컴포넌트 ${approved.length}종과 토큰 ${platform.tokenCount}개를 그대로 담은 웹 배포본입니다. 색·크기·동작을 새로 만들지 말고 이 안에 있는 것을 쓰세요</div>
              </div>
              <!-- 받기 공개 (river 지시 2026-09-09). 다시 막을 때는 span.download-btn-disabled 로 되돌린다. -->
              <a class="download-btn" style="margin-left:auto;" href="../assets/downloads/${escape(stamp.zip)}" download>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ZIP 다운로드
              </a>
            </div>
            <div class="devget-row">
              <div class="devget-item">
                <div class="devget-label">항상 최신으로 쓰려면</div>
                <div class="devget-body">저장소를 그대로 참조하면 디자인이 고칠 때 같이 최신이 됩니다.
                  <a class="devget-link" href="${REPOSITORY}/tree/main/ui-library/dist" target="_blank" rel="noopener">${REPOSITORY.replace('https://', '')}/ui-library/dist ↗</a>
                </div>
              </div>
              <div class="devget-item">
                <div class="devget-label">내 배포본이 최신인지 확인</div>
                <div class="devget-body">아래 지문과 <code>node s1-ui/tools/s1-ui-lint.mjs --version</code> 결과가 같아야 최신입니다.
                  <div class="devget-fingerprint">${escape(manifest.canonicalFingerprint)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 툴별 -->
          <div class="install-step">
            <div class="step-header">
              <div>
                <div class="step-title">내 개발 툴에서 시작하기</div>
                <div class="step-desc">쓰는 툴의 카드만 보면 됩니다. 웹 계열은 컴포넌트를 그대로 쓰고, 네이티브는 색·크기 값과 동작 명세를 씁니다</div>
              </div>
            </div>
            <div class="devtool-grid">
${TOOL_CARDS.map(toolCard).join('\n')}
            </div>
            <p class="devtool-caveat">네이티브(Kotlin·Swift·C++)는 화면 그리는 방식이 웹과 달라 컴포넌트를 그대로 드릴 수 없습니다. 직접 구현하시되 색·크기는 <code>platform/</code> 값을, 상태 변화는 <code>platform/behavior.json</code> 을 그대로 쓰세요 — 값을 눈으로 보고 옮겨 적지 마세요.</p>
          </div>

          <!-- 들어있는 컴포넌트 -->
          <div class="install-step">
            <div class="step-header">
              <div>
                <div class="step-title">들어있는 컴포넌트 ${approved.length}종</div>
                <div class="step-desc" style="margin-bottom:2px;"><a class="devget-link" href="../ui-library/dist/preview.html" target="_blank" rel="noopener">실제 모습으로 보기 ↗</a> — 크기·변형과 "언제 쓰나"가 함께 보입니다</div>
                <div class="step-desc">아래 ${approved.length}종이 모두 들어 있습니다. HTML 은 <code>examples/</code> 폴더의 파일을 복사해서 쓰고(모바일용은 <code>*.mobile.html</code>), React·Vue 는 이름 앞에 <code>S1</code> 을 붙여 부릅니다 — <code>input → S1Input</code> · <code>date-picker → S1DatePicker</code></div>
              </div>
            </div>
            <div class="devcomp-list">
              ${componentChips}
            </div>
          </div>

          <!-- 검사 -->
          <div class="install-step">
            <div class="step-header">
              <div>
                <div class="step-title">내가 만든 것이 규칙에 맞는지 검사하기</div>
                <div class="step-desc">직접 적은 색, 승인되지 않은 variant·size, 빠진 필수 속성, 없는 토큰 이름을 찾아 줍니다</div>
              </div>
            </div>
            <pre class="devtool-code"><code>node s1-ui/tools/s1-ui-lint.mjs &lt;내 소스 폴더&gt;</code></pre>
            <div class="devask">
              <strong>필요한 것이 없으면 만들지 마세요.</strong>
              디자인에 없는 컴포넌트·색이 필요하면 디자인팀에 요청해 주세요. 임시로 만든 것은 나중에 전부 다시 걷어내야 합니다.
            </div>
          </div>

        </div>
      </div><!-- /top-dev -->
      ${END}`;

const page = fs.readFileSync(PAGE, 'utf8');
const startIndex = page.indexOf(START);
const endIndex = page.indexOf(END);
if (startIndex === -1 || endIndex === -1) {
  console.error(`❌ install-prompt.html 에 개발자 패널 표시(${START})가 없습니다.`);
  process.exit(1);
}
const updated = `${page.slice(0, startIndex)}${panel}${page.slice(endIndex + END.length)}`;

if (checkOnly) {
  if (updated !== page) {
    console.error('❌ 개발자 패널이 배포본보다 낡았습니다 — `npm run devpanel:gen` 을 실행하세요.');
    process.exit(1);
  }
  console.log(`✅ 개발자 패널 최신 (컴포넌트 ${approved.length}종 · 지문 ${manifest.canonicalFingerprint.slice(0, 12)}…)`);
  process.exit(0);
}
fs.writeFileSync(PAGE, updated);
console.log(`✅ 개발자 패널 생성 (컴포넌트 ${approved.length}종 · 툴 ${TOOL_CARDS.length}개)`);
