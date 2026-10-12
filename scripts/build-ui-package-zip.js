#!/usr/bin/env node
/**
 * build-ui-package-zip.js
 * --------------------------------------------------------------------------
 * 승인된 UI 라이브러리 배포본(ui-library/dist)을 개발자·퍼블리셔가 받아 갈
 * 단일 ZIP 으로 묶는다. 압축을 풀면 `s1-ui/` 폴더가 생긴다.
 *
 *   실행: npm run ui:zip            (검사: npm run ui:zip:check)
 *
 * [왜 dist 를 그대로 넣나]
 *   ZIP 안에서 파일을 고르거나 다시 쓰면 그 순간 배포본과 다른 물건이 된다.
 *   여기서는 dist 를 통째로 복사하고, 시작 안내(README)만 dist 의 manifest 에서 생성한다.
 *
 * [검사 모드]
 *   --check 는 ZIP 이 현재 dist 보다 낡았는지만 본다(내용 지문 대조). 파일을 쓰지 않는다.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { allToolFacts, assertProse } = require('./lib/platform-facts.js');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'ui-library', 'dist');
const OUT_DIR = path.join(ROOT, 'assets', 'downloads');
const ZIP_NAME = 's1-ui-dev-package.zip';

/* 툴별 묶음 — React 쓰는 사람이 Vue·안드로이드 것까지 받지 않게 한다(river 지시 2026-09-09).
   "그 툴이 실제로 필요로 하는 것"만 담는다. 겉모습 CSS·아이콘은 웹 계열 전부에 필요하다.
   빠뜨리면 화면이 안 나오므로, 묶은 뒤 파일이 서로를 제대로 가리키는지 기계로 확인한다. */
const TOOL_PACKAGES = {
  'html-css-js': {
    title: 'HTML · CSS · JavaScript',
    include: ['manifest.json', 'component-token-map.json', 'assets', 's1-ui.css', 's1-ui.base.css', 's1-ui.js', 's1-ui.auto.js', 'components', 'examples', 'tools', 'preview.html', 'platform/manifest.json', 'platform/contract.json', 'platform/tokens.json'],
    start: [
      '압축을 풀면 나오는 `s1-ui` 폴더를 프로젝트에 그대로 넣습니다.',
      '**`preview.html` 을 더블클릭하면 컴포넌트 {{count}}종이 실제 모습으로 보입니다**(서버 없이 열립니다) — 무엇을 쓸지 여기서 고르세요.',
      '내 페이지 `<head>` 에 글꼴·`assets/css/tokens.css`·`s1-ui.css` 를 읽힙니다(아래 「내 페이지에 붙이기」 코드 그대로).',
      '페이지 끝에 `<script type="module">` 로 `s1-ui.auto.js` 를 불러 `autoInit()` 을 한 번 부르면 동작이 전부 붙습니다. 일반 `<script src>` 로는 동작하지 않습니다.',
      '마크업은 `examples/` 폴더의 파일을 복사해서 씁니다(모바일용은 `*.mobile.html`). 부품마다 쓰는 법은 `components/` 폴더의 같은 이름 `.md` 설명서에 있습니다.'
    ],
    guide: true
  },
  react: {
    title: 'React · Next.js',
    include: ['manifest.json', 'assets', 's1-ui.css', 's1-ui.auto.js', 'components', 'platform/react', 'platform/manifest.json', 'platform/contract.json', 'platform/tokens.json', 'tools', 'preview.html'],
    filter: (relative) => !relative.startsWith('components/') || relative.endsWith('.js'),
    start: ['압축을 풀면 나오는 `s1-ui` 폴더를 프로젝트에 그대로 넣습니다.', '**`preview.html` 을 브라우저로 열면 컴포넌트 {{count}}종이 실제 모습으로 보입니다** — 무엇을 쓸지 여기서 고르세요.', '앱 진입 파일에서 `assets/css/tokens.css` 와 `s1-ui.css` 를 한 번 읽힙니다.', '`import { S1Button } from "./s1-ui/platform/react";` 처럼 쓸 것만 꺼내 씁니다.', '받는 값과 쓰는 법은 `platform/react/README.md` 에 있습니다.']
  },
  vue: {
    title: 'Vue',
    include: ['manifest.json', 'assets', 's1-ui.css', 's1-ui.auto.js', 'components', 'platform/vue', 'platform/manifest.json', 'platform/contract.json', 'platform/tokens.json', 'tools', 'preview.html'],
    filter: (relative) => !relative.startsWith('components/') || relative.endsWith('.js'),
    start: ['압축을 풀면 나오는 `s1-ui` 폴더를 프로젝트에 그대로 넣습니다.', '**`preview.html` 을 브라우저로 열면 컴포넌트 {{count}}종이 실제 모습으로 보입니다** — 무엇을 쓸지 여기서 고르세요.', '앱 진입 파일에서 `assets/css/tokens.css` 와 `s1-ui.css` 를 한 번 읽힙니다.', '`import { S1Button } from "./s1-ui/platform/vue";` 처럼 쓸 것만 꺼내 씁니다.']
  },
  'react-native': {
    title: 'React Native (Expo)',
    include: ['manifest.json', 'platform/react-native', 'platform/react-native-sample', 'platform/behavior.json', 'platform/tokens.json'],
    start: ['압축을 풀면 나오는 `s1-ui` 폴더에서 `platform/react-native` 폴더를 프로젝트에 넣습니다(예: `src/s1-ui`). `react-native-svg` 를 설치합니다(`npx expo install react-native-svg`).', '**`platform/react-native-sample` 을 `npm install` · `npx expo start` 로 열면 승인된 조합이 한 화면에 보입니다** — PC·Mobile 모두 담겨 있습니다.', '앱 맨 위를 `S1Provider` 로 감쌉니다 — 다크 모드와 서체(Pretendard)가 여기서 정해집니다.', '부품은 이름으로 부릅니다 — `S1Button` 처럼 `S1` 로 시작하고, 화면은 `breakName="pc" | "mobile"` 로 고릅니다.', '쓰는 법과 RN 에서 원리상 다른 점은 `platform/react-native/README.md` 에 있습니다.']
  },
  kotlin: {
    title: 'Kotlin (Android)',
    include: ['manifest.json', 'platform/kotlin', 'platform/kotlin-sample', 'platform/behavior.json', 'platform/tokens.json'],
    start: ['`platform/kotlin` 폴더를 프로젝트 소스에 통째로 넣습니다(패키지 `com.s1.designsystem`).', '부품은 이름으로 부릅니다 — `S1Button` 처럼 `S1` 로 시작합니다. 쓸 수 있는 조합은 `S1*Spec.kt` 에 있습니다.', '글자는 이름 붙은 스타일(`S1Type`)로 부릅니다 — 크기·굵기를 따로 적지 마세요.', '색·크기는 `S1Palette`·`S1Tokens` 상수를 부릅니다 — 값을 눈으로 보고 옮겨 적지 마세요.', '부품에 없는 화면을 직접 그릴 때만 상태 변화를 `platform/behavior.json` 으로 맞춥니다.']
  },
  swift: {
    title: 'Swift (iOS)',
    include: ['manifest.json', 'platform/swift', 'platform/behavior.json', 'platform/tokens.json'],
    start: ['`platform/swift/S1Tokens.swift` 를 프로젝트에 넣습니다.', '색은 `0xAARRGGBB` 정수입니다.', '상태 변화는 `platform/behavior.json` 을 그대로 따릅니다.', '**화면 부품은 들어있지 않습니다 — 직접 그려야 합니다.**']
  },
  cpp: {
    title: 'C++',
    include: ['manifest.json', 'platform/cpp', 'platform/behavior.json', 'platform/tokens.json'],
    start: ['`platform/cpp/s1_tokens.h` 를 프로젝트에 넣고 `#include` 합니다.', '색은 `0xAARRGGBB` 정수입니다.', '값을 다른 형태로 쓰려면 `platform/tokens.json` 을 읽어 씁니다.', '**화면 부품은 들어있지 않습니다 — 직접 그려야 합니다.**']
  }
};
const OUT_PATH = path.join(OUT_DIR, ZIP_NAME);
const STAMP_PATH = path.join(OUT_DIR, 's1-ui-dev-package.stamp.json');
const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(path.join(DIST, 'manifest.json'))) {
  console.error('❌ ui-library/dist 가 없습니다. 먼저 `npm run ui:build` 를 실행하세요.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
const platform = JSON.parse(fs.readFileSync(path.join(DIST, 'platform', 'manifest.json'), 'utf8'));

/** dist 전체 내용의 지문 — 파일 이름과 내용이 하나라도 다르면 값이 달라진다. */
function distFingerprint() {
  const digest = crypto.createHash('sha256');
  const walk = (directory, prefix = '') => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = path.posix.join(prefix, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute, relative);
      else {
        digest.update(`${relative}\0`);
        digest.update(fs.readFileSync(absolute));
        digest.update('\0');
      }
    }
  };
  walk(DIST);
  return digest.digest('hex');
}

const componentList = manifest.components.filter((component) => component.status === 'approved').map(({ id }) => id);
const FACTS = allToolFacts(manifest, platform);

/** 웹(HTML·CSS·JS) 사용 안내 — 전체 README 와 html-css-js 묶음 README 가 같은 내용을 쓴다.
 *  숫자·목록은 배포본 manifest 에서 읽는다(손으로 적지 않는다). */
function webGuideMd() {
  const pascal = (id) => id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  const count = manifest.components.length;
  const mobileOnly = manifest.components.filter((component) => component.mobileOnly).map(({ id }) => id);
  const rows = manifest.components.map((component) => {
    const files = [...new Set(Object.values(component.examples ?? { pc: component.example }))];
    return `| ${component.id} | S1${pascal(component.id)} | ${files.map((file) => `\`${file}\``).join(' ')} | \`components/${component.id}.md\` |`;
  }).join('\n');
  const font = manifest.fontDependencies[0].source;
  const [tokensCss, typographyCss] = manifest.commonCssDependencies;
  const baseCss = (manifest.optionalCssDependencies ?? [])[0]?.file ?? 's1-ui.base.css';

  return `### 내 페이지에 붙이기

\`\`\`html
<!doctype html>
<html lang="ko">                       <!-- 다크 모드: <html lang="ko" data-theme="dark"> -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- 글꼴 Pretendard (묶음에 들어 있지 않습니다 — 아래 링크로 받습니다) -->
  <link rel="stylesheet" href="${font}">
  <link rel="stylesheet" href="s1-ui/${tokensCss}">
  <link rel="stylesheet" href="s1-ui/${typographyCss}">   <!-- 선택: typo-* 글자 클래스를 쓸 때 -->
  <link rel="stylesheet" href="s1-ui/${baseCss}">            <!-- 선택: 페이지 바탕·기본 글자색 (다크 모드에서 바탕이 따라옵니다) -->
  <link rel="stylesheet" href="s1-ui/s1-ui.css">
</head>
<body>
  <!-- examples/ 에서 복사한 마크업 -->
  <script type="module">
    import { autoInit } from "./s1-ui/s1-ui.auto.js";
    autoInit();
  </script>
</body>
</html>
\`\`\`

- **\`<script type="module">\` 이어야 합니다.** 일반 \`<script src="…s1-ui.auto.js">\` 로 넣으면 오류가 나고 아무 동작도 붙지 않습니다.
- 모듈 스크립트는 파일을 더블클릭(\`file://\`)해서 연 내 페이지에서는 브라우저가 막습니다 — 로컬 서버(예: \`npx serve\`)로 여세요. (\`preview.html\` 은 서버 없이 열리도록 따로 만들어 둔 파일입니다.)
- 글꼴은 위 Pretendard 링크가 있어야 설계한 모양 그대로 나옵니다. 링크가 없으면 부품은 글꼴이 깔린 컴퓨터에서만 그대로 보입니다.

### 다크 모드

\`<html>\` 에 \`data-theme="dark"\` 를 달면 부품 전체가 다크로 바뀝니다(끄려면 속성을 지웁니다). 페이지 바탕과 기본 글자색은 부품이 아니라 내 페이지의 몫이라 그냥 두면 흰색 그대로입니다 — \`${baseCss}\` 를 읽거나, 직접 \`background: var(--color-bg-level-0)\` 를 칠하세요.

### 나중에 넣은 마크업에 동작 붙이기

\`autoInit()\` 은 부른 시점에 있는 마크업에만 동작을 붙입니다. 목록을 불러와 그린 화면처럼 나중에 넣은 조각은 그 조각을 감싼 요소를 넘겨 다시 부르세요 — 두 번 불러도 겹치지 않습니다.

\`\`\`js
autoInit(document.getElementById("late-area"));
\`\`\`

부품 하나만 직접 붙이려면(자동 연결 없이):

\`\`\`js
import { toggle } from "./s1-ui/s1-ui.js";
const api = toggle.init(document.querySelector('[data-s1-component="toggle"]'));
\`\`\`

### 모달·바텀시트 열고 닫기

처음에는 숨겨져 있습니다. **속성 한 줄로** 엽니다 — 열 버튼에 창의 id 를, 창 안에서 닫을 요소에 \`data-s1-close\` 를 답니다(값은 닫힌 이유: \`cancel\`·\`confirm\` 등).

\`\`\`html
<button type="button" data-s1-open="my-modal">열기</button>
<div id="my-modal" data-s1-component="modal" data-break="pc" data-footer="dual" hidden> … <button type="button" data-s1-close="cancel">취소</button> … </div>
\`\`\`

스크립트로 열려면 \`import { modal } from "./s1-ui/s1-ui.js"; modal.init(요소).open()\`, 닫으려면 \`.close()\` 입니다. 창 안에서 달력·시간·드롭다운이 열려 있을 때 Esc 는 그것만 닫고 창은 남깁니다. 자세한 것은 \`components/modal.md\` · \`components/modal-content.md\` · \`components/bottom-sheet.md\`.

### 값 넣기·읽기·폼 전송

셀렉트·달력·시간 선택은 \`data-name="이름"\` 을 주면 숨은 입력이 만들어져 \`<form>\` 으로 함께 전송됩니다. 셀렉트는 \`data-value\`(처음 값)·\`api.value\`·\`api.setValue()\`, 달력은 \`data-value\`(단일)·\`data-range-start\`/\`data-range-end\`(기간)·\`api.value\`·\`api.setValue()\`, 페이지네이션은 총 쪽수만 \`api.setTotalPages(n)\` 으로 주면 번호 줄을 다시 그립니다.

### 모바일

모바일용 마크업은 \`*.mobile.html\` 입니다(비밀번호·검색 입력도 \`examples/input.password.mobile.html\` · \`examples/input.search.mobile.html\` 처럼 같은 규칙입니다). 모바일에만 쓰는 부품은 PC 용 파일이 따로 없고 파일 이름에 \`.mobile\` 이 붙습니다: **${mobileOnly.join(' · ')}**.

### 부품 목록 (${count}종)

부품마다 마크업·고르는 속성·옵션·이벤트·여닫기를 적은 설명서가 있습니다. 쓰려는 부품의 \`components/<이름>.md\` 를 먼저 읽으세요. 쓸 수 있는 종류·크기 값도 거기 있습니다.

| 이름 | React·Vue 이름 | 마크업 예시 | 설명서 |
|---|---|---|---|
${rows}
`;
}

function readme() {
  /* "어디까지 쓰나" 는 배포본이 선언한 사실에서 온다(scripts/lib/platform-facts.js). */
  const toolRows = [...FACTS.values()]
    .map((facts) => `| ${facts.key} | ${facts.entry} | ${facts.scope} | ${facts.lint ? '가능' : '해당 없음'} |`)
    .join('\n');
  const tokensOnly = [...FACTS.values()].filter((facts) => facts.support === 'tokens-only');
  const withParts = [...FACTS.values()].filter((facts) => facts.support === 'components');
  const nativeLines = [
    ...withParts.map((facts) => `- **${TOOL_PACKAGES[facts.key]?.title ?? facts.key}**: ${facts.containsMd} 부품에 없는 화면만 값과 동작 명세를 보고 직접 그리세요.`),
    tokensOnly.length
      ? `- **${tokensOnly.map((facts) => TOOL_PACKAGES[facts.key]?.title ?? facts.key).join(' · ')}**: 컴포넌트는 각자 구현해야 합니다. 대신 색·크기 값(\`platform/\`)과 동작 명세(\`platform/behavior.json\`)를 그대로 쓰세요. **값을 눈으로 보고 옮겨 적지 마세요.**`
      : ''
  ].filter(Boolean).join('\n');

  return `# S1 UI 라이브러리 — 개발자·퍼블리셔 배포본

> 자동 생성물입니다. 이 폴더의 파일을 손으로 고치지 마세요 — 다음 배포 때 사라집니다.
> 필요한 것이 없으면 만들지 말고 디자인팀에 요청해 주세요.

- 버전: **${manifest.version}**
- 정본 지문: \`${manifest.canonicalFingerprint}\`
- 승인 컴포넌트: **${componentList.length}종** (${componentList.join(', ')})
- 토큰: **${platform.tokenCount}개**

## 1. 웹(HTML·CSS·JS)에서 쓰기

\`preview.html\` 을 더블클릭하면 컴포넌트 ${manifest.components.length}종이 실제 모습으로 보입니다 — 무엇을 쓸지 여기서 고르세요.

${webGuideMd()}
## 2. 내 개발 툴에서 쓰기

| 툴 | 시작 파일 | 어디까지 쓰나 | 자가 검사 |
|---|---|---|---|
${toolRows}

- **React**: \`import { S1Button } from "./s1-ui/platform/react/index.js"\` — 승인된 마크업을 그대로 마운트하는 껍데기입니다. JSX 빌드 도구가 필요하고, **JSX 런타임은 automatic 이어야 합니다**(요즘 기본값입니다. \`tsconfig\` 의 \`"jsx": "react-jsx"\`, Babel 의 \`runtime: "automatic"\`). 옛 classic 설정이면 컴파일되지 않습니다.
- **Vue**: \`import { S1Button } from "./s1-ui/platform/vue/index.js"\` — SFC(.vue) 빌드 도구가 필요합니다.
- **React Native(Expo)**: \`import { S1Provider, S1Button } from "./s1-ui/platform/react-native"\` — iOS·Android·웹. 위 React 는 React DOM(웹)이라 RN 에서 쓰지 못합니다. PC·Mobile 두 화면 기준을 모두 담았습니다.
- **이벤트 받는 모양이 둘이 다릅니다**: React 는 핸들러가 **이벤트 객체**를 받고(\`event.detail\` 로 값을 꺼냅니다), Vue 는 emit 이 **detail 값 자체**를 바로 넘깁니다.
- **화면 크기별 마크업**: PC·Mobile 마크업이 다른 컴포넌트는 \`breakName\` 으로 고릅니다(\`"pc"\` / \`"mobile"\`). 값을 바꾸면 마크업이 다시 마운트됩니다.
${nativeLines}

## 3. 내가 만든 것이 규칙에 맞는지 검사하기

\`\`\`bash
node s1-ui/tools/s1-ui-lint.mjs <내 소스 폴더>
\`\`\`

직접 적은 색, 승인되지 않은 variant·size, 빠진 필수 속성, 없는 토큰 이름을 찾아 줍니다.

## 4. 내 배포본이 최신인지 확인하기

\`\`\`bash
node s1-ui/tools/s1-ui-lint.mjs --version
\`\`\`

여기 나오는 정본 지문이 디자인가이드 다운로드 화면의 지문과 같아야 최신입니다.

## 5. 폴더 안내

| 폴더 | 내용 |
|---|---|
| \`s1-ui.css\` · \`s1-ui.auto.js\` | 전체 묶음 (한 번에 설치) |
| \`components/\` | 컴포넌트별 개별 설치용 CSS·JS·계약 |
| \`examples/\` | 복사해서 쓰는 마크업 (PC·Mobile) |
| \`assets/\` | 토큰 CSS·타이포 CSS·아이콘 SVG |
| \`platform/\` | 툴별 산출물 (React·Vue 껍데기, Kotlin·Swift·C++ 값, 계약·동작 명세) |
| \`tools/\` | 자가 검사기 |
`;
}

const fingerprint = distFingerprint();
const readmeText = readme();
const stamp = {
  note: '자동 생성물 — ZIP 이 현재 배포본에서 나왔는지 확인하는 지문입니다.',
  zip: ZIP_NAME,
  version: manifest.version,
  canonicalFingerprint: manifest.canonicalFingerprint,
  distFingerprint: fingerprint,
  readmeFingerprint: crypto.createHash('sha256').update(readmeText).digest('hex'),
  components: componentList,
  tokenCount: platform.tokenCount
};

if (checkOnly) {
  if (!fs.existsSync(OUT_PATH) || !fs.existsSync(STAMP_PATH)) {
    console.error(`❌ 배포 ZIP 이 없습니다 — \`npm run ui:zip\` 을 실행하세요.`);
    process.exit(1);
  }
  const recorded = JSON.parse(fs.readFileSync(STAMP_PATH, 'utf8'));
  if (recorded.distFingerprint !== fingerprint || recorded.readmeFingerprint !== stamp.readmeFingerprint) {
    console.error('❌ 배포 ZIP 이 현재 배포본보다 낡았습니다 — `npm run ui:zip` 을 실행하세요.');
    process.exit(1);
  }
  /* ZIP 파일 자신의 해시도 본다 — 이게 없으면 배포본은 그대로인데 ZIP 내용만 바뀐 경우를 놓친다.
     (2026-09-04 독립 검증 지적) */
  if (!recorded.zipFingerprint) {
    console.error('❌ 배포 ZIP 지문 기록이 없습니다(옛 형식) — `npm run ui:zip` 을 실행하세요.');
    process.exit(1);
  }
  const actualZip = crypto.createHash('sha256').update(fs.readFileSync(OUT_PATH)).digest('hex');
  if (recorded.zipFingerprint !== actualZip) {
    console.error('❌ 배포 ZIP 파일이 만들어진 뒤에 바뀌었습니다 — `npm run ui:zip` 으로 다시 만드세요.');
    process.exit(1);
  }
  /* 툴별 묶음도 같은 눈으로 본다 — 하나라도 없거나 바뀌었으면 화면의 받기 버튼이 헛것을 가리킨다. */
  for (const key of Object.keys(TOOL_PACKAGES)) {
    const item = recorded.packages?.[key];
    if (!item) {
      console.error(`❌ ${key} 묶음 기록이 없습니다 — \`npm run ui:zip\` 을 실행하세요.`);
      process.exit(1);
    }
    const packagePath = path.join(OUT_DIR, item.zip);
    if (!fs.existsSync(packagePath)) {
      console.error(`❌ ${item.zip} 이(가) 없습니다 — \`npm run ui:zip\` 을 실행하세요.`);
      process.exit(1);
    }
    const actual = crypto.createHash('sha256').update(fs.readFileSync(packagePath)).digest('hex');
    if (actual !== item.zipFingerprint) {
      console.error(`❌ ${item.zip} 이(가) 만들어진 뒤에 바뀌었습니다 — \`npm run ui:zip\` 으로 다시 만드세요.`);
      process.exit(1);
    }
  }
  console.log(`✅ 배포 ZIP 최신 (${componentList.length}종 · 지문 ${manifest.canonicalFingerprint.slice(0, 12)}…)`);
  process.exit(0);
}

/* ── 툴별 묶음 만들기 ───────────────────────────────────────────────────
   dist 에서 그 툴이 쓰는 것만 복사한다. 복사한 뒤 **서로를 가리키는 경로가 실제로 있는지**
   확인한다 — 하나라도 빠지면 개발자 화면에서 조용히 안 그려진다. */

function copySelected(target, spec) {
  const copied = [];
  const copyPath = (relative) => {
    const source = path.join(DIST, relative);
    if (!fs.existsSync(source)) throw new Error(`배포본에 ${relative} 가 없습니다.`);
    if (fs.statSync(source).isDirectory()) {
      for (const entry of fs.readdirSync(source).sort()) copyPath(path.posix.join(relative, entry));
      return;
    }
    if (spec.filter && !spec.filter(relative)) return;
    const destination = path.join(target, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied.push(relative);
  };
  for (const item of spec.include) copyPath(item);
  return copied;
}

/** 묶음 안의 파일이 참조하는 상대 경로가 묶음 안에 실제로 있는지 본다. */
function assertSelfContained(stage, key) {
  const missing = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(absolute); continue; }
      if (!/\.(js|jsx|mjs|vue|css)$/.test(entry.name)) continue;
      const text = fs.readFileSync(absolute, 'utf8');
      const references = [
        ...[...text.matchAll(/from\s+["'](\.[^"']+)["']/g)].map((match) => match[1]),
        ...[...text.matchAll(/import\s+["'](\.[^"']+)["']/g)].map((match) => match[1]),
        ...[...text.matchAll(/url\(\s*["']?(\.[^"')]+)["']?\s*\)/g)].map((match) => match[1])
      ];
      for (const reference of references) {
        const resolved = path.resolve(path.dirname(absolute), reference.split('?')[0]);
        if (!fs.existsSync(resolved)) missing.push(`${path.relative(stage, absolute)} → ${reference}`);
      }
    }
  };
  walk(stage);
  if (missing.length) {
    throw new Error(`${key} 묶음에 빠진 파일이 있습니다(${missing.length}건):\n  - ${missing.slice(0, 8).join('\n  - ')}`);
  }
}

function toolReadme(key, spec) {
  const facts = FACTS.get(key);
  /* 숫자는 손으로 적지 않는다 — 배포본 manifest 의 컴포넌트 수로 채운다. */
  const start = spec.start.map((step) => step.replaceAll('{{count}}', String(manifest.components.length)));
  /* 사람이 적은 시작 순서가 배포본과 어긋나면 여기서 멈춘다 — 옛 안내가 남지 않게. */
  const problems = assertProse(facts, start);
  if (problems.length) {
    console.error(`❌ ${key} 묶음 안내가 배포본과 다릅니다:\n   - ${problems.join('\n   - ')}`);
    process.exit(1);
  }
  return `# S1 UI 라이브러리 — ${spec.title} 묶음

> 자동 생성물입니다. 이 폴더의 파일을 손으로 고치지 마세요 — 다음 배포 때 사라집니다.
> **${spec.title} 에 필요한 것만 담은 묶음입니다.** 다른 툴 것까지 필요하면 전체 묶음(\`${ZIP_NAME}\`)을 받으세요.

- 버전: **${manifest.version}**
- 정본 지문: \`${manifest.canonicalFingerprint}\`
- 승인 컴포넌트: **${componentList.length}종** (${componentList.join(', ')})
- 토큰: **${platform.tokenCount}개**

## 이 묶음에 들어있는 것

${facts.containsMd}

## 시작하기

${start.map((step, index) => `${index + 1}. ${step}`).join('\n')}
${spec.guide ? `\n## 자세한 사용법\n\n${webGuideMd()}` : ''}
## 내 배포본이 최신인지 확인

디자인가이드 다운로드 화면의 지문과 위 정본 지문이 같아야 최신입니다.${spec.include.includes('tools') ? `

\`\`\`bash
node s1-ui/tools/s1-ui-lint.mjs --version          # 지문 확인
node s1-ui/tools/s1-ui-lint.mjs <내 소스 폴더>      # 규칙 검사
\`\`\`` : ''}
`;
}

function buildToolPackages() {
  const packages = {};
  for (const [key, spec] of Object.entries(TOOL_PACKAGES)) {
    const stageRoot = fs.mkdtempSync(path.join(require('os').tmpdir(), `s1-ui-zip-${key}-`));
    const stage = path.join(stageRoot, 's1-ui');
    fs.mkdirSync(stage, { recursive: true });
    const copied = copySelected(stage, spec);
    fs.writeFileSync(path.join(stage, 'README.md'), toolReadme(key, spec));
    assertSelfContained(stage, key);

    const zipName = `s1-ui-${key}.zip`;
    const zipPath = path.join(OUT_DIR, zipName);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    execSync(`zip -X -q -r "${zipPath}" s1-ui -x "*.DS_Store"`, { cwd: stageRoot, stdio: 'inherit' });
    fs.rmSync(stageRoot, { recursive: true, force: true });
    packages[key] = {
      zip: zipName,
      title: spec.title,
      files: copied.length + 1,
      sizeKB: Number((fs.statSync(zipPath).size / 1024).toFixed(0)),
      zipFingerprint: crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex')
    };
  }
  return packages;
}

const stageRoot = fs.mkdtempSync(path.join(require('os').tmpdir(), 's1-ui-zip-'));
const stage = path.join(stageRoot, 's1-ui');
fs.cpSync(DIST, stage, { recursive: true });
fs.writeFileSync(path.join(stage, 'README.md'), readmeText);

fs.mkdirSync(OUT_DIR, { recursive: true });
if (fs.existsSync(OUT_PATH)) fs.unlinkSync(OUT_PATH);
execSync(`zip -X -q -r "${OUT_PATH}" s1-ui -x "*.DS_Store"`, { cwd: stageRoot, stdio: 'inherit' });
fs.rmSync(stageRoot, { recursive: true, force: true });
stamp.zipFingerprint = crypto.createHash('sha256').update(fs.readFileSync(OUT_PATH)).digest('hex');
stamp.packages = buildToolPackages();
fs.writeFileSync(STAMP_PATH, `${JSON.stringify(stamp, null, 2)}\n`);

const sizeKB = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
console.log(`✅ 완료: assets/downloads/${ZIP_NAME} (${sizeKB}KB · 컴포넌트 ${componentList.length}종 · 토큰 ${platform.tokenCount}개)`);
for (const [key, item] of Object.entries(stamp.packages)) {
  console.log(`   └ ${key}: ${item.zip} (${item.sizeKB}KB · 파일 ${item.files}개)`);
}
