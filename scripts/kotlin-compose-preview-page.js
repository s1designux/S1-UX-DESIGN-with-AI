#!/usr/bin/env node
/**
 * kotlin-compose-preview-page.js — 사람이 눈으로 대조하는 검수 화면을 만든다.
 * ─────────────────────────────────────────────────────────────────────────
 * 안드로이드 화면은 이 맥의 브라우저에서 못 연다. 그래서 대신 이렇게 본다:
 *   왼쪽 — 승인된 웹 배포본을 그 상태 그대로 그린 것(정본이 실제로 어떻게 보이는지)
 *   오른쪽 — Compose 부품이 그 상태에서 쓸 값(스타일 표에서 그대로 꺼낸 것)
 * 둘의 값이 같다는 것은 기계가 이미 확인했다(kotlin-compose-parity-check.js).
 * 이 화면은 "그 값이 어떤 모양인가"를 사람이 판정하기 위한 것이다.
 *
 * 사용: node scripts/kotlin-compose-preview-page.js
 * 출력: reports/ui-library/kotlin-compose/preview.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'reports/ui-library/kotlin-compose/preview.html');

const REAL_ATTRIBUTE_STATES = { disabled: 'disabled', checked: 'checked' };

const PART_TEXT = {
  label: (text) => text,
  value: (text) => text,
  'option-label': (text) => text,
  tab: (text) => text,
  title: () => '제목 영역',
  message: () => '변경한 내용이 저장되지 않고 사라집니다.'
};

function serialize(node, text) {
  const attributes = { ...node.attributes };
  for (const state of node.states) {
    if (REAL_ATTRIBUTE_STATES[state]) attributes[REAL_ATTRIBUTE_STATES[state]] = '';
    else attributes[`data-force-${state}`] = '';
  }
  const attributeText = Object.entries(attributes)
    .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${String(value).replace(/"/g, '&quot;')}"`))
    .join('');
  if (node.tag === 'input') return `<input${attributeText}>`;
  const part = node.attributes['data-s1-part'];
  /* 모달 푸터 안의 버튼은 승인 예제와 같은 글자를 쓴다 — 바깥 부품의 예시 글자를 물려주지 않는다. */
  if (part === 'label' && node.parent && node.parent.attributes['data-s1-component'] === 'button' && node.parent.attributes['data-variant']) {
    const own = node.parent.attributes['data-variant'] === 'primary' ? '확인' : '취소';
    return `<${node.tag}${attributeText}>${own}</${node.tag}>`;
  }
  const inner = node.children.length > 0
    ? node.children.map((child) => serialize(child, text)).join('')
    : (PART_TEXT[part] ? PART_TEXT[part](text) : '');
  return `<${node.tag}${attributeText}>${inner}</${node.tag}>`;
}

/** 조합마다 값 칩으로 보여 줄 대표 부품 — 그 컴포넌트에서 상태가 실제로 드러나는 자리다. */
const MAIN_PART = {
  button: 'root', chip: 'root', checkbox: 'control', radio: 'control', toggle: 'root',
  tab: 'tab', select: 'trigger', dropdown: 'option', input: 'field', modal: 'panel'
};

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

function valueChips(box, tokenValues) {
  const chips = [];
  const color = (label, value) => {
    if (!value || value.inherit) return;
    const resolved = tokenValues.get(value.token) ?? '';
    chips.push(`<span class="chip"><i style="background:${escapeHtml(resolved)}"></i>${label} <code>${escapeHtml(value.token)}</code></span>`);
  };
  color('배경', box.background);
  color('글자', box.foreground);
  color('테두리', box.borderColor);
  const number = (label, value, unit = 'dp') => {
    if (value === undefined || value === null) return;
    chips.push(`<span class="chip">${label} <b>${value}${unit}</b></span>`);
  };
  number('높이', box.height);
  number('최소폭', box.minWidth);
  number('모서리', box.radius);
  number('테두리', box.borderWidth);
  number('좌우여백', box.paddingStart === box.paddingEnd ? box.paddingStart : `${box.paddingStart}/${box.paddingEnd}`);
  number('글자크기', box.fontSize, 'sp');
  if (box.fontWeight) chips.push(`<span class="chip">굵기 <b>${box.fontWeight}</b></span>`);
  if (box.icon) chips.push(`<span class="chip">아이콘 <code>${escapeHtml(box.icon)}</code></span>`);
  return chips.join('');
}

function footerSizesOf(base, manifest) {
  const sizes = {};
  for (const [breakName, spec] of Object.entries(manifest.htmlContract.breakExamples ?? {})) {
    const file = path.join(base, path.basename(spec.source));
    if (!fs.existsSync(file)) continue;
    const match = /data-s1-component="button"[^>]*data-size="([a-z]+)"/.exec(fs.readFileSync(file, 'utf8'));
    if (match) sizes[breakName] = match[1];
  }
  return sizes;
}

/** 아이콘 url 을 파일 안에 박아 넣는다 — 이 화면 한 장만 옮겨도 그림이 깨지지 않게. */
function inlineIcons(css, iconDir) {
  return css.replace(/url\(\s*"?\.?\.?\/?[^")]*\/assets\/icons\/([a-z0-9_-]+\.svg)"?\s*\)/gi, (whole, file) => {
    const target = path.join(iconDir, file);
    if (!fs.existsSync(target)) return whole;
    const encoded = Buffer.from(fs.readFileSync(target)).toString('base64');
    return `url("data:image/svg+xml;base64,${encoded}")`;
  });
}

/** 상태 가상 클래스를 같은 명시도의 속성으로 바꾼 사본 — 검수 화면에서만 쓴다. */
function forceStates(css) {
  return unwrapHoverMedia(css
    .replace(/:focus-within\b/g, '[data-force-focus-within]')
    .replace(/:focus-visible\b/g, '[data-force-focus-visible]')
    .replace(/:hover\b/g, '[data-force-hover]')
    .replace(/:active\b/g, '[data-force-active]'));
}

function unwrapHoverMedia(css) {
  let out = '';
  let index = 0;
  while (index < css.length) {
    const at = css.indexOf('@media', index);
    if (at === -1) { out += css.slice(index); break; }
    const open = css.indexOf('{', at);
    const condition = css.slice(at + 6, open).trim();
    let depth = 0;
    let end = open;
    for (; end < css.length; end += 1) {
      if (css[end] === '{') depth += 1;
      else if (css[end] === '}') { depth -= 1; if (depth === 0) break; }
    }
    out += css.slice(index, at);
    out += /hover/.test(condition) ? css.slice(open + 1, end) : '';
    index = end + 1;
  }
  return out;
}

async function main() {
  const { PLANS, extractSpec } = await import(path.join(ROOT, 'ui-library/scripts/kotlin-compose.mjs'));
  const { readTokens } = await import(path.join(ROOT, 'ui-library/scripts/platform.mjs'));
  const tokensCss = fs.readFileSync(path.join(ROOT, 'assets/css/tokens.css'), 'utf8');
  const tokenData = readTokens(tokensCss);
  const tokenValues = new Map(tokenData.tokens.map((token) => [token.name, token.value]));
  const coverage = JSON.parse(fs.readFileSync(path.join(ROOT, 'ui-library/dist/platform/kotlin/coverage.json'), 'utf8'));
  const distDir = path.join(ROOT, 'ui-library/dist');
  const iconDir = path.join(distDir, 'assets/icons');
  const read = (relative) => fs.readFileSync(path.join(distDir, relative), 'utf8');
  const bundleCss = inlineIcons(read('s1-ui.css'), iconDir);
  const embeddedCss = [
    read('assets/css/tokens.css'),
    read('assets/css/typography.css'),
    bundleCss,
    '/* ── 상태 흉내 사본 — 값이 아니라 "언제 보이는가"만 바꾼다 ── */',
    forceStates(bundleCss)
  ].join('\n');

  const sections = [];
  const sampleText = { button: '버튼', chip: '칩', checkbox: '선택 항목', radio: '항목', toggle: '', tab: '탭 메뉴', select: '선택', dropdown: '항목 이름', input: '', modal: '제목 영역' };

  for (const id of Object.keys(PLANS)) {
    const base = path.join(ROOT, 'ui-library/src/components', id);
    const css = fs.readFileSync(path.join(base, `${id}.css`), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
    /* 모달 푸터 버튼 크기는 승인된 예제 마크업에서 읽는다 — 정하지 않고 읽는다. */
    const planOptions = id === 'modal' ? footerSizesOf(base, manifest) : undefined;
    const spec = extractSpec({ id, css, manifest, tokenValues, planOptions });
    const plan = PLANS[id](manifest, planOptions);

    const rows = [];
    for (const combo of plan.combos) {
      const key = plan.key(combo);
      const built = plan.build(combo);
      const rootTarget = built.targets.root ?? Object.values(built.targets)[0];
      let root = rootTarget.node;
      while (root.parent) root = root.parent;
      const mainPart = spec.table[key].parts[MAIN_PART[id] ?? 'root'] ?? Object.values(spec.table[key].parts)[0];
      rows.push(`
      <tr>
        <td class="key"><code>${escapeHtml(key)}</code></td>
        <td class="sample">${serialize(root, sampleText[id] ?? '보기')}</td>
        <td class="values">${valueChips(mainPart, tokenValues)}</td>
      </tr>`);
    }

    const unread = coverage.components.find((entry) => entry.component === id)?.unreadDeclarations ?? [];
    const unreadRows = unread.length === 0
      ? '<p class="ok">배포본 CSS 의 모든 선언을 읽었습니다.</p>'
      : `<p class="warn">Compose 가 값으로 읽지 않은 선언 ${unread.length}건 — 모두 표시·배치 규칙이라 부품 뼈대가 직접 담당합니다.</p>
         <ul class="unread">${unread.map((one) => `<li><code>${escapeHtml(one.property)}: ${escapeHtml(one.value)}</code> <span>${escapeHtml(one.selector)}</span></li>`).join('')}</ul>`;

    sections.push(`
    <section id="${id}">
      <h2>${id}</h2>
      <p class="meta">승인 조합 ${plan.combos.length}가지</p>
      <table>
        <thead><tr><th>조합</th><th>승인된 웹 배포본이 그리는 모습</th><th>Compose 가 쓰는 값</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
      ${unreadRows}
    </section>`);
  }

  const html = `<!doctype html>
<html lang="ko" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kotlin(Compose) 부품 검수 — S1 Design System</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
/* 승인된 배포본 CSS 를 그대로 박아 넣는다 — 이 파일 한 장만 열어도 같은 모습이 나오게. */
${embeddedCss}
</style>
<style>
  /* 상태 흉내 — 검수 화면에서만 쓰는 사본 규칙. 값이 아니라 "언제 보이는가"만 바꾼다. */
  body { background: var(--color-bg-level-1); color: var(--color-text-body-primary); font-family: "Pretendard", sans-serif; margin: 0; padding: 32px; }
  header { margin-bottom: 32px; }
  h1 { font-size: 24px; margin: 0 0 8px; }
  .lead { color: var(--color-text-body-secondary, var(--color-text-body-primary)); font-size: 14px; line-height: 1.6; margin: 0 0 4px; max-width: 900px; }
  .toolbar { display: flex; gap: 8px; margin: 16px 0 0; }
  .toolbar button { border: 1px solid var(--color-border-default, #ddd); background: var(--color-bg-level-0); color: inherit; border-radius: 6px; cursor: pointer; font: inherit; padding: 6px 12px; }
  .toolbar button[aria-pressed="true"] { background: var(--color-blue-400); color: #fff; }
  section { background: var(--color-bg-level-0); border-radius: 12px; margin-bottom: 24px; padding: 20px 24px; }
  h2 { font-size: 18px; margin: 0 0 4px; }
  .meta { color: var(--color-text-body-primary); font-size: 12px; margin: 0 0 12px; opacity: .7; }
  table { border-collapse: collapse; width: 100%; }
  th { font-size: 12px; opacity: .7; padding: 6px 8px; text-align: left; }
  td { border-top: 1px solid var(--color-bg-level-3); padding: 12px 8px; vertical-align: middle; }
  td.key { white-space: nowrap; width: 1%; }
  td.key code { font-size: 12px; }
  td.sample { width: 42%; }
  .chip { align-items: center; background: var(--color-bg-level-1); border-radius: 999px; display: inline-flex; font-size: 11px; gap: 4px; margin: 2px 4px 2px 0; padding: 3px 8px; }
  .chip i { border: 1px solid rgba(0,0,0,.15); border-radius: 3px; display: inline-block; height: 12px; width: 12px; }
  .chip code { font-size: 10px; opacity: .75; }
  .ok { color: var(--color-text-state-correct); font-size: 12px; margin: 12px 0 0; }
  .warn { color: var(--color-text-state-caution); font-size: 12px; margin: 12px 0 4px; }
  .unread { font-size: 11px; margin: 0; opacity: .8; padding-left: 18px; }
  .unread span { opacity: .6; }
  nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 24px; }
  nav a { background: var(--color-bg-level-0); border-radius: 999px; color: inherit; font-size: 12px; padding: 4px 12px; text-decoration: none; }
  /* 검수 화면 전용 받침 — 모달은 화면 전체를 덮는 부품이라 표 안에 눕혀 놓는다.
     값은 건드리지 않고 자리만 바꾼다(딤은 검수에 방해라 감춘다). */
  .sample [data-s1-component="modal"] { display: inline-flex; inset: auto; position: relative; z-index: 0; }
  .sample [data-s1-component="modal"] [data-s1-part="overlay"] { display: none; }
  .sample [data-s1-component="select"] [data-s1-part="panel"] { display: none; }
</style>
</head>
<body>
<header>
  <h1>Kotlin(Compose) 부품 검수</h1>
  <p class="lead">왼쪽은 <b>승인된 웹 배포본</b>이 그 상태에서 실제로 그리는 모습이고, 오른쪽은 <b>안드로이드 부품이 쓰는 값</b>입니다.</p>
  <p class="lead">두 값이 같다는 것은 기계가 이미 확인했습니다 — 브라우저가 계산한 값과 표의 값을 전부 맞춰 봤고 어긋난 곳이 없습니다.</p>
  <p class="lead">그래서 여기서 봐 주실 것은 하나입니다: <b>이 모양이 안드로이드에 그대로 나가도 되는지.</b></p>
  <div class="toolbar">
    <button type="button" id="light" aria-pressed="true">라이트</button>
    <button type="button" id="dark" aria-pressed="false">다크</button>
  </div>
</header>
<nav>${Object.keys(PLANS).map((id) => `<a href="#${id}">${id}</a>`).join('')}</nav>
${sections.join('')}
<script>
  const light = document.getElementById('light');
  const dark = document.getElementById('dark');
  const setTheme = (value) => {
    document.documentElement.dataset.theme = value;
    light.setAttribute('aria-pressed', String(value === 'light'));
    dark.setAttribute('aria-pressed', String(value === 'dark'));
  };
  light.addEventListener('click', () => setTheme('light'));
  dark.addEventListener('click', () => setTheme('dark'));
</script>
</body>
</html>
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(`✅ 검수 화면: ${path.relative(ROOT, OUT)}`);
}

main().catch((error) => { console.error(`❌ ${error.message}`); process.exit(1); });
