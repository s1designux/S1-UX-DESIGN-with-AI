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

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGE = path.join(ROOT, 'pages', 'install-prompt.html');
const DIST = path.join(ROOT, 'ui-library', 'dist');
const STAMP = path.join(ROOT, 'assets', 'downloads', 's1-ui-dev-package.stamp.json');
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

/* 툴 카드 — 무엇을 주는지, 어디까지 되는지, 첫 줄을 어떻게 시작하는지. */
const TOOL_CARDS = [
  {
    key: 'html-css-js',
    title: 'HTML · CSS · JavaScript',
    note: '퍼블리싱 · jQuery · JSP·PHP 같은 서버 렌더링',
    support: 'full',
    supportLabel: '컴포넌트 그대로 사용',
    code: `<link rel="stylesheet" href="s1-ui/assets/css/tokens.css">
<link rel="stylesheet" href="s1-ui/s1-ui.css">
<script type="module">
  import { autoInit } from "./s1-ui/s1-ui.auto.js";
  autoInit();
</script>`,
    files: ['s1-ui.css', 's1-ui.auto.js', 'examples/'],
    lint: true
  },
  {
    key: 'react',
    title: 'React · Next.js',
    note: 'JSX 빌드 도구 필요 · JSX 런타임 automatic',
    support: 'full',
    supportLabel: '컴포넌트 그대로 사용',
    code: `import { S1Button } from "./s1-ui/platform/react";

<S1Button variant="primary" size="md"
          parts={{ label: "확인" }} />`,
    files: ['platform/react/'],
    lint: true
  },
  {
    key: 'vue',
    title: 'Vue',
    note: 'SFC(.vue) 빌드 도구가 필요합니다',
    support: 'full',
    supportLabel: '컴포넌트 그대로 사용',
    code: `import { S1Button } from "./s1-ui/platform/vue";

<S1Button variant="primary" size="md"
          :parts="{ label: '확인' }" />`,
    files: ['platform/vue/'],
    lint: true
  },
  {
    key: 'kotlin',
    title: 'Kotlin (Android)',
    note: 'Compose · View 공용 상수',
    support: 'tokens',
    supportLabel: '색·크기 값만',
    code: `import com.s1.designsystem.S1Tokens

Color(S1Tokens.Colors.colorBgLevel0)   // Compose
S1Tokens.ColorsDark.colorBgLevel0      // 다크 값
S1Tokens.Dimens.radiusControlSm        // 4.0f`,
    files: ['platform/kotlin/S1Tokens.kt', 'platform/behavior.json'],
    lint: false
  },
  {
    key: 'swift',
    title: 'Swift (iOS)',
    note: 'UIKit · SwiftUI 공용 상수',
    support: 'tokens',
    supportLabel: '색·크기 값만',
    code: `// 색은 0xAARRGGBB 정수입니다
let bg = S1Tokens.Colors.colorBgLevel0
let radius = S1Tokens.Dimens.radiusControlSm`,
    files: ['platform/swift/S1Tokens.swift', 'platform/behavior.json'],
    lint: false
  },
  {
    key: 'cpp',
    title: 'C++',
    note: '화면 라이브러리(Qt·MFC 등)가 정해지면 더 붙습니다',
    support: 'tokens',
    supportLabel: '색·크기 값만',
    code: `#include "s1_tokens.h"
using namespace s1::tokens;

auto bg = S1_COLOR_BG_LEVEL_0;    // 0xAARRGGBB
auto r  = S1_RADIUS_CONTROL_SM;   // 4.0f`,
    files: ['platform/cpp/s1_tokens.h', 'platform/tokens.json'],
    lint: false
  }
];

function toolCard(tool) {
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
              ${badge}
            </div>
            <pre class="devtool-code"><code>${escape(tool.code)}</code></pre>
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
                <div class="step-desc">디자인에서 승인한 컴포넌트 ${approved.length}종과 토큰 ${platform.tokenCount}개를 그대로 담은 웹 배포본입니다. 색·크기·동작을 새로 만들지 말고 이 안에 있는 것을 쓰세요 <strong style="color:#c2410c;">— 지금은 화면만 공개돼 있고 받기는 준비 중입니다</strong></div>
              </div>
              <!-- 배포 준비 전이라 받기는 막아 둔다(river 지시 2026-09-04). 화면 구성만 먼저 연다.
                   열 때는 이 버튼을 a.download-btn 으로 되돌리면 된다 — 파일 경로는 이미 만들어져 있다. -->
              <span class="download-btn download-btn-disabled" style="margin-left:auto;" aria-disabled="true" title="배포 준비 중입니다">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ZIP 다운로드
                <em class="download-soon">준비 중</em>
              </span>
            </div>
            <div class="devget-row">
              <div class="devget-item">
                <div class="devget-label">항상 최신으로 쓰려면</div>
                <div class="devget-body">저장소를 그대로 참조하면 디자인이 고칠 때 같이 최신이 됩니다.
                  <span class="devget-pending">${REPOSITORY.replace('https://', '')}/ui-library/dist — 공개 준비 중</span>
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
                <div class="step-desc">마크업은 상상하지 말고 <code>examples/</code> 폴더의 파일을 복사해서 쓰세요. 모바일용은 <code>*.mobile.html</code> 입니다</div>
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
