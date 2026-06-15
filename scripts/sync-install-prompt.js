#!/usr/bin/env node
/**
 * Sync Install Prompt
 *
 * `assets/css/tokens.css` 원본을 `pages/install-prompt.html` 의 두 영역에 자동 동기화한다.
 *   1) 다운로드용 인라인 (`<pre id="code-full">…</pre>`)
 *   2) 개발자용 AI Context Prompt (`<pre id="code-ai">` 안의 `### 전체 토큰 정의` 본문)
 *
 * - tokens.css 의 모든 토큰(Foundation·Semantic·Component·Light·Dark)을 HTML-escape 후 삽입
 * - 메타 텍스트(`Foundation + Semantic Nx종 + Component Nx종`)는 실제 카운트로 자동 갱신
 * - 다운로드 버튼은 `<pre>` textContent 를 그대로 blob 으로 다운로드하므로
 *   인라인 동기화 = 다운로드 파일 동기화 와 동일
 * - #code-ai 는 앞뒤 prose(핵심 규칙·참고)는 보존하고 `### 전체 토큰 정의` ~
 *   `--- 위 토큰을 기반으로` 사이 토큰 본문만 교체 → 손수 유지하던 stale 문제 해소
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

function buildInlineBlock(css, counts) {
  const header = `/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   S1 UX DESIGN GUIDE V2.4 — tokens.css
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

  // 3) AI Context Prompt(<pre id="code-ai">)의 '### 전체 토큰 정의' 토큰 본문 동기화
  //    앞 prose(핵심 규칙) + 뒤 prose(--- 위 토큰을 기반으로…)는 보존하고 가운데 토큰만 교체
  const AI_RE = /(### 전체 토큰 정의\n\n)([\s\S]*?)(\n\n---\n\n위 토큰을 기반으로)/;
  if (!AI_RE.test(updated)) {
    console.error('❌ #code-ai 토큰 영역 앵커(### 전체 토큰 정의 ~ 위 토큰을 기반으로)를 찾을 수 없음');
    process.exit(1);
  }
  const aiTokens = htmlEscape(css.trim());
  updated = updated.replace(AI_RE, (m, p1, p2, p3) => p1 + aiTokens + p3);

  // 4) 각 항목 "마지막 업데이트" 시각 동기화
  updated = injectUpdateStamps(updated);

  if (CHECK_ONLY) {
    // 'Last sync: YYYY-MM-DD' 스탬프는 재생성 시점의 오늘 날짜라 매일 달라짐 →
    // 토큰 내용 검사에서는 제외(정규화)해 날짜만으로 인한 false-positive 차단.
    const stripSyncDate = (s) => s.replace(/Last sync: \d{4}-\d{2}-\d{2}/g, 'Last sync: <DATE>');
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
