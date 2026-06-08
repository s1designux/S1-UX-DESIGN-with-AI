#!/usr/bin/env node
/**
 * Sync Install Prompt
 *
 * `assets/css/tokens.css` 원본을 `pages/install-prompt.html` 의 다운로드용 인라인
 * (`<pre id="code-full">…</pre>`) 영역에 자동 동기화한다.
 *
 * - tokens.css 의 모든 토큰(Foundation·Semantic·Component·Light·Dark)을 HTML-escape 후 삽입
 * - 메타 텍스트(`Foundation + Semantic Nx종 + Component Nx종`)는 실제 카운트로 자동 갱신
 * - 다운로드 버튼은 `<pre>` textContent 를 그대로 blob 으로 다운로드하므로
 *   인라인 동기화 = 다운로드 파일 동기화 와 동일
 *
 * 사용:
 *   node scripts/sync-install-prompt.js              # 동기화 (파일 수정)
 *   node scripts/sync-install-prompt.js --check      # 검증 only (exit 1 if diff)
 *   npm run tokens:sync-prompt
 */

const fs = require('fs');
const path = require('path');

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

  if (CHECK_ONLY) {
    if (updated !== html) {
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
