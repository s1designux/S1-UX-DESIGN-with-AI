#!/usr/bin/env node
/**
 * swift-preview-page.js — 웹 렌더와 SwiftUI 렌더를 나란히 놓는 검수 화면을 만든다.
 * ─────────────────────────────────────────────────────────────────────────
 *   · 부품(구역)마다 한 줄: 라이트 [웹 | Swift] · 다크 [웹 | Swift]
 *   · 웹 쪽은 승인된 배포본의 예제 마크업을 배포본 CSS 로 **지금 이 브라우저가 그린 것**이다(대표 모양).
 *   · Swift 쪽은 같은 소스를 macOS ImageRenderer 로 찍은 PNG 다(npm run swift:shots) — 승인 조합 전체.
 *
 * 값이 같다는 것은 이 화면이 아니라 swift:parity 가 숫자로 확인한다(브라우저 실측 ↔ 표 ↔ 컴파일한 Swift 값).
 * 이 화면은 "눈으로 보기에 같은 부품으로 보이는가"를 사람이 보는 자리다.
 *
 * 사용: node scripts/swift-preview-page.js      (먼저 npm run swift:shots)
 * 출력: reports/ui-library/swift-swiftui/preview.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'ui-library/dist');
const OUT_DIR = path.join(ROOT, 'reports/ui-library/swift-swiftui');
const SHOTS = path.join(OUT_DIR, 'shots');

/** 구역 → 웹 예제 파일(dist/examples). 모바일 예제가 있으면 그것을 쓴다. */
const SECTIONS = [
  ['button', 'Button', ['button.mobile']],
  ['chip', 'Chip', ['chip.mobile']],
  ['checkboxRadio', 'Checkbox · Radio', ['checkbox', 'radio']],
  ['toggle', 'Toggle', ['toggle']],
  ['tab', 'Line Tab', ['tab.mobile']],
  ['select', 'Select Box', ['select.mobile']],
  ['dropdown', 'Dropdown', ['dropdown']],
  ['input', 'Input', ['input.mobile', 'input.password-mobile', 'input.search-mobile']],
  ['textStyle', 'Text Style', []],
  ['modal', 'Modal', ['modal.mobile']],
  ['textButtonAssist', 'Text Button · Assist Button', ['text-button', 'assist-button']],
  ['textarea', 'Textarea', ['textarea.mobile']],
  ['filterChip', 'Filter Chip', ['filter-chip.mobile']],
  ['mobileHeader', 'Mobile Header', ['mobile-header']],
  ['divider', 'Divider', ['divider']],
  ['dataTag', 'Data Tag', ['data-tag']],
  ['expandableCard', 'Expandable Card', ['expandable-card']],
  ['bottomSheetOption', 'Bottom Sheet Option', ['bottom-sheet-option']],
  ['bottomSheet', 'Bottom Sheet', ['bottom-sheet']],
  ['datePicker', 'Date Picker', ['date-picker.mobile']],
  ['timePicker', 'Time Picker', ['time-picker.mobile']],
  ['mobileBottomNav', 'Mobile Bottom Nav', ['mobile-bottom-nav']]
];

const read = (relative) => fs.readFileSync(path.join(DIST, relative), 'utf8');

/** 파일로 열면 mask 아이콘이 비므로 아이콘을 데이터 주소로 박는다. */
function inlineIcons(css) {
  return css.replace(/url\(\s*"?\.?\.?\/?[^")]*\/assets\/icons\/([a-z0-9_-]+\.svg)"?\s*\)/gi, (whole, file) => {
    const target = path.join(DIST, 'assets/icons', file);
    if (!fs.existsSync(target)) return whole;
    return `url("data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(target)).toString('base64')}")`;
  });
}

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

/** 예제에서 첫 태그의 hidden 만 걷어 낸다(모달·시트가 닫힌 채로 오는 예제를 열어 보이려고). */
const openRoot = (html) => html.replace(/^(\s*(?:<!--[\s\S]*?-->\s*)*<[a-z0-9]+\b[^>]*?)\s+hidden(?=[\s>])/i, '$1');

function webCell(ids) {
  if (ids.length === 0) return '<p class="note">웹 예제 없음 — 텍스트 스타일은 글자 값 표(typography.css)로 비교합니다.</p>';
  return ids.map((id) => {
    const file = path.join(DIST, 'examples', `${id}.html`);
    if (!fs.existsSync(file)) return `<p class="note">예제 없음: ${escapeHtml(id)}</p>`;
    return `<div class="web-item"><div class="web-name">${escapeHtml(id)}</div>${openRoot(fs.readFileSync(file, 'utf8'))}</div>`;
  }).join('\n');
}

function main() {
  if (!fs.existsSync(SHOTS) || fs.readdirSync(SHOTS).filter((name) => name.endsWith('.png')).length === 0) {
    console.error('❌ Swift 렌더 PNG 가 없습니다. 먼저 `npm run swift:shots` 를 실행하세요.');
    process.exit(1);
  }
  const meta = fs.existsSync(path.join(SHOTS, '.render.json')) ? JSON.parse(fs.readFileSync(path.join(SHOTS, '.render.json'), 'utf8')) : {};
  const manifest = JSON.parse(read('manifest.json'));
  const css = inlineIcons([read('assets/css/tokens.css'), read('assets/css/typography.css'), read('s1-ui.css')].join('\n'));

  const rows = SECTIONS.map(([key, title, ids]) => {
    const shot = (scheme) => {
      const file = `${key}-${scheme}.png`;
      return fs.existsSync(path.join(SHOTS, file))
        ? `<img src="shots/${file}" alt="${escapeHtml(title)} Swift ${scheme}" loading="lazy">`
        : '<p class="note">PNG 없음</p>';
    };
    const web = webCell(ids);
    return `<section id="${key}">
  <h2>${escapeHtml(title)}</h2>
  <div class="grid">
    <div class="cell light"><div class="tag">웹 · 라이트</div><div class="web" data-theme="light">${web}</div></div>
    <div class="cell light"><div class="tag">Swift · 라이트</div>${shot('light')}</div>
    <div class="cell dark"><div class="tag">웹 · 다크</div><div class="web" data-theme="dark">${web}</div></div>
    <div class="cell dark"><div class="tag">Swift · 다크</div>${shot('dark')}</div>
  </div>
</section>`;
  }).join('\n');

  const nav = SECTIONS.map(([key, title]) => `<a href="#${key}">${escapeHtml(title)}</a>`).join('');
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Swift 부품 검수 — 웹 ↔ SwiftUI</title>
<style>
${css}
</style>
<style>
/* 이 화면의 틀(부품 값이 아니다) */
body { margin: 0; font-family: Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif; background: #f2f3f5; color: #1c1f23; }
header.top { position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid #d9dce0; padding: 10px 20px; }
header.top h1 { font-size: 16px; margin: 0 0 4px; }
header.top p { margin: 0 0 6px; font-size: 12px; color: #555; line-height: 1.5; }
nav.jump { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12px; }
nav.jump a { color: #1a5fd0; text-decoration: none; }
main { padding: 16px 20px 60px; }
section { margin-bottom: 40px; }
section h2 { font-size: 16px; margin: 0 0 8px; }
.grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; align-items: start; }
@media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.cell { border: 1px solid #d9dce0; border-radius: 8px; overflow: hidden; background: #fff; }
.cell.dark { background: #0c0e12; }
.tag { font-size: 11px; padding: 4px 8px; background: #eef0f3; color: #444; }
.cell.dark .tag { background: #1b1f26; color: #bbb; }
.cell img { display: block; width: 100%; height: auto; }
.web { padding: 16px; transform: translateZ(0); overflow: hidden; min-height: 120px; background: var(--color-bg-level-0, #fff); color: var(--color-text-body-primary, #222); }
.web-item { margin-bottom: 14px; }
.web-name { font-size: 10px; color: #888; margin-bottom: 4px; }
.note { font-size: 12px; color: #888; padding: 8px; }
</style>
</head>
<body>
<header class="top">
  <h1>Swift(SwiftUI) 부품 검수 — 웹 ↔ Swift 나란히 · 배포본 ${escapeHtml(manifest.version)}</h1>
  <p>웹 칸은 승인 예제를 이 브라우저가 지금 그린 것(대표 모양), Swift 칸은 같은 소스를 macOS 에서 사진 찍은 것(승인 조합 전체)입니다.
  서체 ${escapeHtml(meta.family === '-' ? '기기 기본(Pretendard 미설치)' : (meta.family ?? '?'))} · 가로 ${escapeHtml(meta.width ?? 390)}pt · ${escapeHtml(meta.scale ?? 2)}배.
  값이 같은지는 <code>npm run swift:parity</code> 가 숫자로 확인합니다. <strong>iPhone 실기기·시뮬레이터에서 돌려 본 것은 아닙니다.</strong></p>
  <nav class="jump">${nav}</nav>
</header>
<main>
${rows}
</main>
</body>
</html>
`;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'preview.html'), html);
  console.log(`✅ ${path.relative(ROOT, path.join(OUT_DIR, 'preview.html'))} (구역 ${SECTIONS.length}개)`);
}

main();
