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

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'ui-library', 'dist');
const OUT_DIR = path.join(ROOT, 'assets', 'downloads');
const ZIP_NAME = 's1-ui-dev-package.zip';
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

function readme() {
  const toolRows = Object.entries(platform.platforms)
    .map(([name, spec]) => `| ${name} | ${spec.entry} | ${spec.componentSupport === 'full' ? '컴포넌트까지 그대로 사용' : '토큰(색·크기) 값만 제공'} | ${spec.lint ? '가능' : '해당 없음'} |`)
    .join('\n');

  return `# S1 UI 라이브러리 — 개발자·퍼블리셔 배포본

> 자동 생성물입니다. 이 폴더의 파일을 손으로 고치지 마세요 — 다음 배포 때 사라집니다.
> 필요한 것이 없으면 만들지 말고 디자인팀에 요청해 주세요.

- 버전: **${manifest.version}**
- 정본 지문: \`${manifest.canonicalFingerprint}\`
- 승인 컴포넌트: **${componentList.length}종** (${componentList.join(', ')})
- 토큰: **${platform.tokenCount}개**

## 1. 웹(HTML·CSS·JS)에서 쓰기 — 3줄

\`\`\`html
<link rel="stylesheet" href="s1-ui/assets/css/tokens.css">
<link rel="stylesheet" href="s1-ui/s1-ui.css">
<script type="module">
  import { autoInit } from "./s1-ui/s1-ui.auto.js";
  autoInit();
</script>
\`\`\`

글꼴은 Pretendard 입니다: \`${manifest.fontDependencies[0].source}\`

마크업은 상상하지 말고 \`examples/\` 안의 파일을 복사해서 쓰세요. 모바일용은 \`*.mobile.html\` 입니다.

## 2. 내 개발 툴에서 쓰기

| 툴 | 시작 파일 | 어디까지 쓰나 | 자가 검사 |
|---|---|---|---|
${toolRows}

- **React**: \`import { S1Button } from "./s1-ui/platform/react/index.js"\` — 승인된 마크업을 그대로 마운트하는 껍데기입니다. JSX 빌드 도구가 필요하고, **JSX 런타임은 automatic 이어야 합니다**(요즘 기본값입니다. \`tsconfig\` 의 \`"jsx": "react-jsx"\`, Babel 의 \`runtime: "automatic"\`). 옛 classic 설정이면 컴파일되지 않습니다.
- **Vue**: \`import { S1Button } from "./s1-ui/platform/vue/index.js"\` — SFC(.vue) 빌드 도구가 필요합니다.
- **이벤트 받는 모양이 둘이 다릅니다**: React 는 핸들러가 **이벤트 객체**를 받고(\`event.detail\` 로 값을 꺼냅니다), Vue 는 emit 이 **detail 값 자체**를 바로 넘깁니다.
- **화면 크기별 마크업**: PC·Mobile 마크업이 다른 컴포넌트는 \`breakName\` 으로 고릅니다(\`"pc"\` / \`"mobile"\`). 값을 바꾸면 마크업이 다시 마운트됩니다.
- **Kotlin·Swift·C++**: 컴포넌트는 각자 구현해야 합니다. 대신 색·크기 값(\`platform/\`)과 동작 명세(\`platform/behavior.json\`)를 그대로 쓰세요. **값을 눈으로 보고 옮겨 적지 마세요.**

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
  console.log(`✅ 배포 ZIP 최신 (${componentList.length}종 · 지문 ${manifest.canonicalFingerprint.slice(0, 12)}…)`);
  process.exit(0);
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
fs.writeFileSync(STAMP_PATH, `${JSON.stringify(stamp, null, 2)}\n`);

const sizeKB = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
console.log(`✅ 완료: assets/downloads/${ZIP_NAME} (${sizeKB}KB · 컴포넌트 ${componentList.length}종 · 토큰 ${platform.tokenCount}개)`);
