#!/usr/bin/env node
/**
 * Sync Install Prompt
 *
 * `pages/install-prompt.html` 의 자동 생성 영역들을 정본에서 동기화한다.
 *   1) 다운로드용 인라인 (`<pre id="code-full">…</pre>`) ← `assets/css/tokens.css`
 *   2) AI 프롬프트 탭 뭉치 (`<pre id="ai-prompt-full">…</pre>`) ← `design/` 의 DESIGN.md 뭉치
 *      (라우터 design.manifest.json + DESIGN.core.md + services/DESIGN.vms.md)
 *
 * - tokens.css 의 모든 토큰(Foundation·Semantic·Component·Light·Dark)을 HTML-escape 후 삽입
 * - 메타 텍스트(`Foundation + Semantic Nx종 + Component Nx종`)는 실제 카운트로 자동 갱신
 * - 다운로드 버튼은 `<pre>` textContent 를 그대로 blob 으로 다운로드하므로
 *   인라인 동기화 = 다운로드 파일 동기화 와 동일
 * - #ai-prompt-full 은 design/*.md(자동 생성물, Gate 24 가 신선도 보증)를 그대로 이어붙여
 *   교체 → 사용자가 통째로 복사/다운로드해 AI 에 붙여넣는 단일 컨텍스트
 *
 * 사용:
 *   node scripts/sync-install-prompt.js              # 동기화 (파일 수정)
 *   node scripts/sync-install-prompt.js --check      # 검증 only (exit 1 if diff)
 *   npm run tokens:sync-prompt
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_CSS    = path.join(ROOT, 'assets/css/tokens.css');
const INSTALL_PROMPT = path.join(ROOT, 'pages/install-prompt.html');
// AI 프롬프트 뭉치 소스 (design/ 자동 생성물 — 정본=tokens.css+registry, Gate 24 가 신선도 보증)
const DESIGN_MANIFEST = path.join(ROOT, 'design/design.manifest.json');
const DESIGN_CORE     = path.join(ROOT, 'design/DESIGN.core.md');
const DESIGN_VMS      = path.join(ROOT, 'design/services/DESIGN.vms.md');

const CHECK_ONLY = process.argv.includes('--check');

function htmlEscape(s) {
  // & 를 먼저 — 다른 entity 의 & 와 충돌 방지
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}

function countTokens(css) {
  const names = new Set();
  for (const r of css.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gmi)) {
    names.add(r[1]);
  }
  // 단순 카테고리 분류
  let foundation = 0, semantic = 0, component = 0;
  for (const n of names) {
    if (/^--(spacing|radius|border-width|font-size|font-weight|line-height|sizing)-/.test(n)) {
      // semantic·component 일 수도 있음 — 일단 sizing semantic, spacing semantic 가 있음
      if (/^--spacing-(padding-block|padding-inline|section|stack|cluster|label-gap-inline|label-gap-block)-/.test(n)) semantic++;
      else if (/^--sizing-/.test(n)) semantic++;
      else if (/^--radius-(control|button|card|modal)-/.test(n)) semantic++;
      else foundation++;
    } else if (/^--color-(gray|gray-dark|blue|blue-dark|red|red-dark|orange|orange-dark|yellow|yellow-dark|green|green-dark|skyblue|skyblue-dark|purple|purple-dark|brown|brown-dark|visual-gray|visual-gray-dark)-\d+$/.test(n)) {
      foundation++;
    } else if (/^--color-(base|brand|status-dark)-/.test(n)) {
      foundation++;
    } else if (/^--color-/.test(n)) {
      semantic++;
    } else {
      component++;
    }
  }
  return { foundation, semantic, component, total: names.size };
}

/**
 * 각 항목(step)의 "마지막 업데이트" 시각을 채운다.
 * - <span class="update-stamp" data-update-file="<상대경로>"> ... </span> 를 찾아 본문을 재생성한다.
 * - 시각 출처: 해당 파일의 git 마지막 커밋 시각(이식 가능·published 상태 기준).
 *   단, 워킹 트리에 미커밋 변경이 있으면 파일 mtime(가장 최신 편집)을 사용한다.
 * - git 사용 불가 시 mtime 으로 폴백.
 * - 표시 형식: YYYY-MM-DD HH:mm (로컬 = KST).
 */
const STAMP_CLOCK_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

function formatStamp(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ` +
         `${p(date.getHours())}:${p(date.getMinutes())}`;
}

function lastUpdatedDate(relPath) {
  const abs = path.join(ROOT, relPath);
  try {
    const dirty = execSync(`git status --porcelain -- "${relPath}"`, { cwd: ROOT })
      .toString().trim();
    if (!dirty) {
      const iso = execSync(`git log -1 --format=%cI -- "${relPath}"`, { cwd: ROOT })
        .toString().trim();
      if (iso) return new Date(iso);
    }
  } catch (_) { /* git 불가 → mtime 폴백 */ }
  return fs.statSync(abs).mtime; // 미커밋 변경 or git 불가
}

function injectUpdateStamps(html) {
  const cache = new Map();
  return html.replace(
    /<span class="update-stamp" data-update-file="([^"]+)">[\s\S]*?<\/span>/g,
    (m, relPath) => {
      if (!cache.has(relPath)) cache.set(relPath, formatStamp(lastUpdatedDate(relPath)));
      const stamp = cache.get(relPath);
      return `<span class="update-stamp" data-update-file="${relPath}">${STAMP_CLOCK_SVG} 업데이트 ${stamp}</span>`;
    }
  );
}

/**
 * AI 프롬프트 뭉치를 조립한다: 헤더 + 라우터(manifest) + 코어 + 서비스분.
 * design/*.md 는 자동 생성물이므로 원문을 그대로 이어붙인다(가공 최소화).
 * 비결정 값(오늘 날짜 등)은 넣지 않는다 → --check 안정성.
 */
function buildAiPromptBundle() {
  const manifest = fs.readFileSync(DESIGN_MANIFEST, 'utf-8').trim();
  const core     = fs.readFileSync(DESIGN_CORE, 'utf-8').trim();
  const vms      = fs.readFileSync(DESIGN_VMS, 'utf-8').trim();

  const header = `# S1 Design System — AI 컨텍스트 프롬프트

> 이 문서를 AI(Claude·GPT 등) 대화의 첫 메시지로 통째로 붙여넣으세요.
> 그러면 AI 가 S1 디자인시스템 기준(토큰·컴포넌트·프로파일)으로 산출물을 만듭니다.
> 정본: assets/css/tokens.css + registry/components/*.json · 자동 생성 뭉치(손편집 금지).

이 뭉치는 세 부분으로 구성됩니다.
1. 라우터(manifest) — 어떤 순서로 읽고 무엇이 무엇을 덮는지(뒤가 앞을 override).
2. Core — 토큰 사전 + 컴포넌트 상태표 + 프로파일 정의.
3. 서비스 분기 — Core 를 상속하고 차이분만 기재.

---

## 1. 라우터 (design.manifest.json)

\`\`\`json
${manifest}
\`\`\`

---

## 2. Core

${core}

---

## 3. 서비스 분기 (VMS)

${vms}
`;
  return htmlEscape(header);
}

function buildInlineBlock(css, counts) {
  const header = `/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   S1 UX DESIGN GUIDE — tokens.css
   Foundation → Semantic → Component
   Auto-synced from assets/css/tokens.css (npm run tokens:sync-prompt)
   Last sync: ${new Date().toISOString().slice(0, 10)}
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

`;
  return htmlEscape(header + css);
}

function main() {
  const css = fs.readFileSync(TOKENS_CSS, 'utf-8');
  const html = fs.readFileSync(INSTALL_PROMPT, 'utf-8');
  const counts = countTokens(css);

  // 1) <pre id="code-full">...</pre> 본문 교체
  const PRE_RE = /(<pre\s+class="expand-pre"\s+id="code-full">)([\s\S]*?)(<\/pre>)/;
  const match = html.match(PRE_RE);
  if (!match) {
    console.error('❌ <pre id="code-full"> 블록을 찾을 수 없음');
    process.exit(1);
  }
  const newInline = buildInlineBlock(css, counts);
  let updated = html.replace(PRE_RE, `$1${newInline}$3`);

  // 2) 메타 텍스트 갱신: "Foundation + Semantic N종 + Component N종"
  const META_RE = /(<div class="file-meta">)([^<]*?)(<\/div>)/;
  const newMeta = `Foundation ${counts.foundation}종 + Semantic ${counts.semantic}종 + Component ${counts.component}종 · Light + Dark`;
  updated = updated.replace(META_RE, `$1${newMeta}$3`);

  // 3) AI 프롬프트 뭉치(<pre id="ai-prompt-full">) 본문 교체 — design/*.md 이어붙임
  const AI_PRE_RE = /(<pre\s+class="ai-pre"\s+id="ai-prompt-full">)([\s\S]*?)(<\/pre>)/;
  if (!AI_PRE_RE.test(updated)) {
    console.error('❌ <pre id="ai-prompt-full"> 블록을 찾을 수 없음');
    process.exit(1);
  }
  const aiBundle = buildAiPromptBundle();
  updated = updated.replace(AI_PRE_RE, `$1${aiBundle}$3`);

  // 4) 각 항목 "마지막 업데이트" 시각 동기화
  updated = injectUpdateStamps(updated);

  if (CHECK_ONLY) {
    // 시각 스탬프는 토큰 내용과 무관하게 매번 달라짐(아래 2종) → 정규화해 false-positive 차단.
    // --check 는 토큰 "내용" 드리프트만 잡는다(스탬프는 write 시 항상 갱신되므로 검사 불필요).
    //   ① 'Last sync: YYYY-MM-DD' — 재생성 시점의 오늘 날짜.
    //   ② '업데이트 YYYY-MM-DD HH:MM' — dirty 파일 mtime 기반(분 단위). 빌드가 파일 mtime 을
    //      건드리면 내용은 같아도 달라져 비결정적 실패를 유발(2026-06-16 발견).
    const stripSyncDate = (s) => s
      .replace(/Last sync: \d{4}-\d{2}-\d{2}/g, 'Last sync: <DATE>')
      .replace(/(업데이트 )\d{4}-\d{2}-\d{2} \d{2}:\d{2}/g, '$1<STAMP>');
    if (stripSyncDate(updated) !== stripSyncDate(html)) {
      console.error('❌ install-prompt.html 인라인 CSS 가 tokens.css 와 불일치');
      console.error('   실행: npm run tokens:sync-prompt');
      process.exit(1);
    }
    console.log(`✅ install-prompt.html 동기화 OK (Foundation ${counts.foundation} + Semantic ${counts.semantic} + Component ${counts.component})`);
    process.exit(0);
  }

  if (updated === html) {
    console.log(`✅ 이미 동기화 상태 (변경 없음)`);
    return;
  }

  fs.writeFileSync(INSTALL_PROMPT, updated, 'utf-8');
  console.log(`✅ install-prompt.html 동기화 완료`);
  console.log(`   tokens.css → <pre id="code-full"> (${css.length} bytes, ${counts.total} 토큰)`);
  console.log(`   메타 텍스트: Foundation ${counts.foundation}종 + Semantic ${counts.semantic}종 + Component ${counts.component}종`);
}

if (require.main === module) {
  main();
}

module.exports = { countTokens };
