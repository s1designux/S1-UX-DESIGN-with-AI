#!/usr/bin/env node
/**
 * kotlin-compose-preview-page.js — 개발자·디자이너가 함께 보는 검수 화면을 만든다.
 * ─────────────────────────────────────────────────────────────────────────
 * 안드로이드 화면은 이 맥의 브라우저에서 못 연다. 그래서 대신 이렇게 본다:
 *   · 컴포넌트 하나 = 표 한 장 (가로 = 상태 · 세로 = 크기·변형)
 *   · 칸을 누르면 그 조합의 값 전부와 **그대로 붙여 쓸 Compose 코드**가 옆에 열린다
 *   · 위쪽 필터로 크기·상태·변형을 좁히거나 글자로 찾는다
 *
 * 표 안에 그려지는 것은 승인된 웹 배포본이다. 그 값과 Compose 스타일 표가 같다는 것은
 * kotlin-compose-parity-check.js 가 브라우저 실측으로 이미 확인한다.
 *
 * 사용: node scripts/kotlin-compose-preview-page.js
 * 출력: reports/ui-library/kotlin-compose/preview.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'reports/ui-library/kotlin-compose/preview.html');

/* ── 1. 요소 모델 → HTML ─────────────────────────────────────────────── */

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
  const insideModalFooter = (one) => {
    let current = one;
    while (current) {
      if (current.attributes['data-s1-part'] === 'footer') return true;
      current = current.parent;
    }
    return false;
  };
  if (part === 'label' && node.parent && node.parent.attributes['data-s1-component'] === 'button' && insideModalFooter(node)) {
    const own = node.parent.attributes['data-variant'] === 'primary' ? '확인' : '취소';
    return `<${node.tag}${attributeText}>${own}</${node.tag}>`;
  }
  const inner = node.children.length > 0
    ? node.children.map((child) => serialize(child, text)).join('')
    : (PART_TEXT[part] ? PART_TEXT[part](text) : '');
  return `<${node.tag}${attributeText}>${inner}</${node.tag}>`;
}

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

/* ── 2. 표의 축 — 가로는 상태, 세로는 나머지 ────────────────────────── */

const MATRIX = {
  button: { column: 'state', rows: ['variant', 'size'] },
  chip: { column: 'state', rows: ['variant', 'size', 'breakName'] },
  checkbox: { column: 'state', rows: [] },
  radio: { column: 'state', rows: [] },
  toggle: { column: 'state', rows: [] },
  tab: { column: 'state', rows: ['size', 'breakName'] },
  select: { column: 'state', rows: ['size', 'breakName'] },
  dropdown: { column: 'state', rows: ['type', 'size'] },
  input: { column: 'state', rows: ['size', 'breakName'] },
  modal: { column: 'footer', rows: ['breakName'] }
};

/** 조합마다 값 칩으로 보여 줄 대표 부품 — 그 컴포넌트에서 상태가 실제로 드러나는 자리다. */
const MAIN_PART = {
  button: 'root', chip: 'root', checkbox: 'control', radio: 'control', toggle: 'root',
  tab: 'tab', select: 'trigger', dropdown: 'option', input: 'field', modal: 'panel'
};

const SAMPLE_TEXT = {
  button: '버튼', chip: '칩', checkbox: '선택 항목', radio: '항목', toggle: '',
  tab: '탭 메뉴', select: '선택', dropdown: '항목 이름', input: '', modal: '제목 영역'
};

const COMPONENT_TITLE = {
  button: '버튼', chip: '칩', checkbox: '체크박스', radio: '라디오', toggle: '토글',
  tab: '라인 탭', select: '셀렉트 박스', dropdown: '드롭다운 목록', input: '입력칸', modal: '모달'
};

/* ── 3. 붙여 쓸 Compose 코드 ────────────────────────────────────────── */

/** 상태 중에는 코드로 켜는 것이 아니라 사용자가 만들어 내는 것이 있다. 그건 그렇다고 말해 준다. */
const AUTO_STATE = {
  hover: '마우스를 올리면 저절로 이 모습이 됩니다 — 코드로 켜지 않습니다.',
  focus: '입력칸에 커서가 들어가면 저절로 이 모습이 됩니다 — 코드로 켜지 않습니다.',
  open: '트리거를 누르면 저절로 열립니다 — 코드로 켜지 않습니다.',
  filled: '값이 들어오면 저절로 이 모습이 됩니다 — 코드로 켜지 않습니다.'
};

/** 고정된 축은 코드에도 쓰지 않는다 — 부품이 그 파라미터를 받지 않기 때문이다. */
const axisArg = (api, axis, value) => {
  if (axis === 'size') return api.sizeParam ? [`size = "${value}"`] : [];
  if (axis === 'variant') return api.variantParam ? [`variant = "${value}"`] : [];
  if (axis === 'type') return api.variantParam ? [`type = "${value}"`] : [];
  return [];
};

const SNIPPET = {
  button: (c, api) => call('S1Button', [
    'text = "버튼"', 'onClick = { }',
    ...axisArg(api, 'variant', c.variant), ...axisArg(api, 'size', c.size),
    ...(c.state === 'disabled' ? ['enabled = false'] : [])
  ]),
  chip: (c, api) => call('S1Chip', [
    'text = "칩"', `selected = ${c.state === 'selected'}`, 'onSelectedChange = { }',
    ...axisArg(api, 'variant', c.variant), ...axisArg(api, 'size', c.size),
    ...(c.state === 'disabled' ? ['enabled = false'] : [])
  ]),
  checkbox: (c) => call('S1Checkbox', [
    `checked = ${c.state === 'checked' || c.state === 'disabledChecked'}`,
    'onCheckedChange = { }', 'label = "선택 항목"',
    ...(c.state.startsWith('disabled') ? ['enabled = false'] : [])
  ]),
  radio: (c) => call('S1Radio', [
    `selected = ${c.state === 'checked' || c.state === 'disabledChecked'}`,
    'onClick = { }', 'label = "항목"',
    ...(c.state.startsWith('disabled') ? ['enabled = false'] : [])
  ]),
  toggle: (c) => call('S1Toggle', [
    `checked = ${c.state === 'on' || c.state === 'disabledOn'}`, 'onCheckedChange = { }',
    ...(c.state.startsWith('disabled') ? ['enabled = false'] : [])
  ]),
  tab: (c, api) => call('S1TabRow', [
    'tabs = listOf("탭 메뉴 1", "탭 메뉴 2", "탭 메뉴 3")',
    `selectedIndex = ${c.state === 'selected' ? 0 : 1}`, 'onSelect = { }',
    ...axisArg(api, 'size', c.size)
  ]),
  select: (c, api) => call('S1Select', [
    'options = listOf("서울", "부산", "제주")',
    `selectedIndex = ${c.state === 'filled' ? '0' : 'null'}`, 'onSelect = { }',
    ...axisArg(api, 'size', c.size),
    ...(c.state === 'disabled' ? ['enabled = false'] : [])
  ]),
  dropdown: (c, api) => call('S1Dropdown', [
    'options = listOf("최신순", "인기순", "과거순")',
    `selectedIndices = ${c.state === 'selected' ? 'setOf(0)' : 'emptySet()'}`, 'onOptionClick = { }',
    ...axisArg(api, 'type', c.type), ...axisArg(api, 'size', c.size)
  ]),
  input: (c, api) => call('S1Input', [
    `value = ${c.state === 'default' ? '""' : '"입력한 값"'}`, 'onValueChange = { }',
    'label = "이름"', 'placeholder = "내용을 입력하세요"',
    ...axisArg(api, 'size', c.size),
    ...(c.state === 'error' ? ['isError = true', 'message = "다시 확인해 주세요"'] : []),
    ...(c.state === 'correct' ? ['isCorrect = true', 'message = "사용할 수 있습니다"'] : []),
    ...(c.state === 'readOnly' ? ['readOnly = true'] : []),
    ...(c.state === 'disabled' ? ['enabled = false'] : [])
  ]),
  modal: (c) => call('S1Modal', [
    'title = "제목 영역"', 'message = "변경한 내용이 저장되지 않고 사라집니다."',
    'onDismissRequest = { }', 'confirmLabel = "확인"',
    ...(c.footer === 'dual' ? ['cancelLabel = "취소"'] : [])
  ])
};

const call = (name, args) => `${name}(\n${args.map((one) => `    ${one}`).join(',\n')}\n)`;

/* ── 4. 값 칩 ────────────────────────────────────────────────────────── */

function valueChips(parts, tokenValues) {
  const groups = [];
  for (const [partName, box] of Object.entries(parts)) {
    const chips = [];
    const color = (label, value) => {
      if (!value) return;
      if (value.inherit) { chips.push(`<span class="chip">${label} <b>글자색을 따라감</b></span>`); return; }
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
    number('최소 높이', box.minHeight);
    number('너비', box.width);
    number('최소 너비', box.minWidth);
    number('모서리', box.radius);
    number('테두리', box.borderWidth);
    if (box.paddingStart || box.paddingEnd) {
      chips.push(`<span class="chip">좌우 여백 <b>${box.paddingStart ?? 0}/${box.paddingEnd ?? 0}dp</b></span>`);
    }
    if (box.paddingTop || box.paddingBottom) {
      chips.push(`<span class="chip">상하 여백 <b>${box.paddingTop ?? 0}/${box.paddingBottom ?? 0}dp</b></span>`);
    }
    number('사이 간격', box.gap);
    number('글자 크기', box.fontSize, 'sp');
    if (box.fontWeight) chips.push(`<span class="chip">굵기 <b>${box.fontWeight}</b></span>`);
    if (box.icon) chips.push(`<span class="chip">아이콘 <code>${escapeHtml(box.icon)}</code></span>`);
    if (box.shadow) chips.push(`<span class="chip">그림자 <b>${box.shadow.length}겹</b></span>`);
    if (chips.length === 0) continue;
    groups.push(`<div class="partgroup"><h4>${escapeHtml(partName)}</h4><div>${chips.join('')}</div></div>`);
  }
  return groups.join('');
}

/* ── 5. 배포본 CSS 를 파일 안에 박아 넣기 ───────────────────────────── */

function inlineIcons(css, iconDir) {
  return css.replace(/url\(\s*"?\.?\.?\/?[^")]*\/assets\/icons\/([a-z0-9_-]+\.svg)"?\s*\)/gi, (whole, file) => {
    const target = path.join(iconDir, file);
    if (!fs.existsSync(target)) return whole;
    return `url("data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(target)).toString('base64')}")`;
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

/* ── 6. 화면 만들기 ─────────────────────────────────────────────────── */

const AXIS_LABEL = { state: '상태', footer: '푸터', size: '크기', breakName: '화면', variant: '변형', type: '유형' };

async function main() {
  const { PLANS, extractSpec, planFor, apiOf } = await import(path.join(ROOT, 'ui-library/scripts/kotlin-compose.mjs'));
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
  const details = {};
  const filterValues = { size: new Set(), state: new Set(), variant: new Set(), breakName: new Set() };

  for (const id of Object.keys(PLANS)) {
    const base = path.join(ROOT, 'ui-library/src/components', id);
    const css = fs.readFileSync(path.join(base, `${id}.css`), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
    const planOptions = id === 'modal' ? footerSizesOf(base, manifest) : undefined;
    const spec = extractSpec({ id, css, manifest, tokenValues, planOptions });
    /* 안드로이드는 모바일 한 벌만 쓴다 — PC 조합은 아예 만들지 않는다(river 결정 2026-09-09). */
    const plan = planFor(id, manifest, planOptions);
    const api = apiOf(id, manifest);
    /* 값이 하나뿐인 축은 줄 이름에 쓰지 않는다 — 고를 것이 없는 것을 이름에 달면 읽는 사람이 헷갈린다. */
    const shape = {
      column: MATRIX[id].column,
      rows: MATRIX[id].rows.filter((axis) => new Set(plan.combos.map((combo) => combo[axis])).size > 1)
    };

    const columns = [];
    const rows = new Map();
    for (const combo of plan.combos) {
      const columnValue = combo[shape.column];
      if (!columns.includes(columnValue)) columns.push(columnValue);
      const rowKey = shape.rows.map((axis) => combo[axis]).join(' · ') || '기본';
      if (!rows.has(rowKey)) rows.set(rowKey, { values: shape.rows.map((axis) => combo[axis]), cells: new Map() });
      rows.get(rowKey).cells.set(columnValue, combo);
    }

    for (const combo of plan.combos) {
      for (const [axis, value] of Object.entries(combo)) {
        const bucket = axis === 'type' ? 'variant' : axis === 'footer' ? 'state' : axis;
        if (filterValues[bucket]) filterValues[bucket].add(value);
      }
    }

    const headCells = columns.map((one) => `<th data-col="${escapeHtml(one)}">${escapeHtml(one)}</th>`).join('');
    const bodyRows = [];
    for (const [rowKey, row] of rows) {
      const cells = columns.map((columnValue) => {
        const combo = row.cells.get(columnValue);
        if (!combo) return `<td data-col="${escapeHtml(columnValue)}" class="empty">—</td>`;
        const key = plan.key(combo);
        const built = plan.build(combo);
        const rootTarget = built.targets.root ?? Object.values(built.targets)[0];
        let root = rootTarget.node;
        while (root.parent) root = root.parent;
        const detailId = `${id}|${key}`;
        details[detailId] = {
          component: id,
          title: `${COMPONENT_TITLE[id] ?? id} — ${rowKey === '기본' ? '' : rowKey + ' · '}${columnValue}`,
          key,
          sample: serialize(root, SAMPLE_TEXT[id] ?? '보기'),
          values: valueChips(spec.table[key].parts, tokenValues),
          code: SNIPPET[id](combo, api),
          note: AUTO_STATE[columnValue] ?? null
        };
        return `<td data-col="${escapeHtml(columnValue)}"><button type="button" class="cell" data-detail="${escapeHtml(detailId)}">${serialize(root, SAMPLE_TEXT[id] ?? '보기')}</button></td>`;
      }).join('');
      bodyRows.push(`<tr data-row="${escapeHtml(JSON.stringify(row.values))}" data-search="${escapeHtml((id + ' ' + rowKey).toLowerCase())}"><th scope="row">${escapeHtml(rowKey)}</th>${cells}</tr>`);
    }

    const unread = coverage.components.find((entry) => entry.component === id)?.unreadDeclarations ?? [];
    const pcOnly = unread.filter((one) => one.reason === 'pc-only');
    const displayRules = unread.filter((one) => one.reason === 'display-rule');
    const summaryParts = [];
    if (pcOnly.length > 0) summaryParts.push(`안드로이드가 안 쓰는 PC 조합 ${pcOnly.length}건`);
    if (displayRules.length > 0) summaryParts.push(`값이 아닌 표시·배치 규칙 ${displayRules.length}건`);
    const list = (items) => `<ul>${items.map((one) => `<li><code>${escapeHtml(one.property)}: ${escapeHtml(one.value)}</code> <span>${escapeHtml(one.selector)}</span></li>`).join('')}</ul>`;
    const unreadBlock = unread.length === 0
      ? '<p class="ok">배포본 CSS 의 모든 선언을 읽었습니다.</p>'
      : `<details class="unread"><summary>부품이 값으로 읽지 않은 선언 ${unread.length}건 — ${summaryParts.join(' · ')}</summary>
         ${pcOnly.length > 0 ? `<p class="unreadhead">안드로이드가 안 쓰는 PC 조합</p>${list(pcOnly)}` : ''}
         ${displayRules.length > 0 ? `<p class="unreadhead">값이 아닌 표시·배치 규칙 (부품 뼈대가 직접 담당)</p>${list(displayRules)}` : ''}
         </details>`;

    sections.push(`
    <section id="${id}" data-component="${id}">
      <div class="sectionhead">
        <h2>${escapeHtml(COMPONENT_TITLE[id] ?? id)} <span class="en">${id}</span></h2>
        <p class="meta">승인 조합 ${plan.combos.length}가지 · 세로 ${shape.rows.map((axis) => AXIS_LABEL[axis] ?? axis).join('·') || '없음'} · 가로 ${AXIS_LABEL[shape.column]}</p>
      </div>
      <div class="tablewrap">
        <table class="matrix">
          <thead><tr><th class="corner"></th>${headCells}</tr></thead>
          <tbody>${bodyRows.join('')}</tbody>
        </table>
      </div>
      ${unreadBlock}
    </section>`);
  }

  const filterGroup = (bucket, label) => {
    const values = [...filterValues[bucket]].sort();
    if (values.length === 0) return '';
    return `<div class="filtergroup"><span class="filterlabel">${label}</span>${values
      .map((value) => `<label class="pill"><input type="checkbox" data-filter="${bucket}" value="${escapeHtml(value)}" checked><span>${escapeHtml(value)}</span></label>`)
      .join('')}</div>`;
  };

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
  :root { --gap: 16px; }
  body { background: var(--color-bg-level-1); color: var(--color-text-body-primary); font-family: "Pretendard", sans-serif; margin: 0; padding: 0 0 120px; }
  .page { margin: 0 auto; max-width: 1400px; padding: 0 24px; }
  header.top { padding: 28px 0 12px; }
  h1 { font-size: 24px; margin: 0 0 10px; }
  .lead { font-size: 14px; line-height: 1.65; margin: 0 0 4px; max-width: 900px; opacity: .85; }
  .lead b { opacity: 1; }

  /* 도구줄 — 스크롤해도 위에 붙어 있는다 */
  .toolbar { backdrop-filter: blur(8px); background: color-mix(in srgb, var(--color-bg-level-1) 88%, transparent); border-bottom: 1px solid var(--color-bg-level-3); margin-bottom: 24px; position: sticky; top: 0; z-index: 50; }
  .toolbar .inner { display: flex; flex-direction: column; gap: 10px; margin: 0 auto; max-width: 1400px; padding: 12px 24px; }
  .row1 { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; }
  .row2 { display: flex; flex-wrap: wrap; gap: 16px; }
  nav a { background: var(--color-bg-level-0); border: 1px solid var(--color-bg-level-3); border-radius: 999px; color: inherit; font-size: 12px; margin-right: 4px; padding: 5px 12px; text-decoration: none; }
  nav a:hover { background: var(--color-bg-level-2); }
  #search { background: var(--color-bg-level-0); border: 1px solid var(--color-bg-level-3); border-radius: 8px; color: inherit; font: inherit; font-size: 13px; padding: 7px 12px; width: 220px; }
  .themebtn { background: var(--color-bg-level-0); border: 1px solid var(--color-bg-level-3); border-radius: 8px; color: inherit; cursor: pointer; font: inherit; font-size: 13px; padding: 7px 14px; }
  .themebtn[aria-pressed="true"] { background: var(--color-blue-400); border-color: var(--color-blue-400); color: #fff; }
  .filtergroup { align-items: center; display: flex; flex-wrap: wrap; gap: 4px; }
  .filterlabel { font-size: 11px; margin-right: 4px; opacity: .6; }
  .pill { cursor: pointer; }
  .pill input { position: absolute; opacity: 0; pointer-events: none; }
  .pill span { background: var(--color-bg-level-0); border: 1px solid var(--color-bg-level-3); border-radius: 999px; display: inline-block; font-size: 11px; padding: 4px 10px; }
  .pill input:checked + span { background: var(--color-blue-400); border-color: var(--color-blue-400); color: #fff; }
  .reset { background: none; border: 0; color: var(--color-blue-400); cursor: pointer; font: inherit; font-size: 11px; text-decoration: underline; }

  section { background: var(--color-bg-level-0); border-radius: 12px; margin-bottom: 20px; padding: 20px 24px; scroll-margin-top: 130px; }
  .sectionhead { align-items: baseline; display: flex; gap: 10px; margin-bottom: 12px; }
  h2 { font-size: 18px; margin: 0; }
  h2 .en { font-size: 12px; font-weight: 400; opacity: .5; }
  .meta { font-size: 12px; margin: 0; opacity: .6; }

  .tablewrap { overflow-x: auto; }
  table.matrix { border-collapse: separate; border-spacing: 0; min-width: 100%; }
  table.matrix th, table.matrix td { border-bottom: 1px solid var(--color-bg-level-2); padding: 10px 12px; text-align: left; vertical-align: middle; }
  table.matrix thead th { background: var(--color-bg-level-0); font-size: 12px; opacity: .7; }
  table.matrix tbody th { font-family: ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 500; opacity: .8; white-space: nowrap; }
  td.empty { opacity: .25; text-align: center; }
  .cell { background: none; border: 1px dashed transparent; border-radius: 8px; cursor: pointer; display: block; padding: 8px; text-align: left; width: 100%; }
  .cell:hover { border-color: var(--color-blue-300); }
  .cell.active { background: var(--color-bg-level-1); border-color: var(--color-blue-400); border-style: solid; }
  /* 검수 화면 전용 받침 — 모달은 화면 전체를 덮는 부품이라 칸 안에 눕혀 놓는다. */
  .cell [data-s1-component="modal"] { display: inline-flex; inset: auto; position: relative; transform: scale(.62); transform-origin: top left; z-index: 0; }
  .cell [data-s1-component="modal"] [data-s1-part="overlay"] { display: none; }
  .cell [data-s1-component="select"] [data-s1-part="panel"] { display: none; }
  .cell [data-s1-component="tab"] { min-width: 240px; }

  .ok { color: var(--color-text-state-correct); font-size: 12px; margin: 12px 0 0; }
  .unread { font-size: 12px; margin-top: 12px; }
  .unread summary { color: var(--color-text-state-caution); cursor: pointer; }
  .unread ul { font-size: 11px; opacity: .8; padding-left: 18px; }
  .unread span { opacity: .6; }
  .unreadhead { font-size: 11px; font-weight: 600; margin: 8px 0 2px; opacity: .7; }

  /* 자세히 보기 — 오른쪽에서 열린다 */
  .drawer { background: var(--color-bg-level-0); border-left: 1px solid var(--color-bg-level-3); bottom: 0; box-shadow: -8px 0 24px rgba(0,0,0,.08); display: flex; flex-direction: column; overflow-y: auto; position: fixed; right: 0; top: 0; transform: translateX(100%); transition: transform .18s ease; width: 420px; z-index: 100; }
  .drawer[data-open="true"] { transform: translateX(0); }
  .drawer .head { align-items: flex-start; display: flex; justify-content: space-between; padding: 20px 20px 8px; }
  .drawer h3 { font-size: 16px; margin: 0 0 4px; }
  .drawer .keytext { font-family: ui-monospace, Menlo, monospace; font-size: 11px; opacity: .6; }
  .drawer .close { background: none; border: 0; color: inherit; cursor: pointer; font-size: 20px; line-height: 1; padding: 0 4px; }
  .drawer .body { padding: 0 20px 32px; }
  .drawerSample { background: var(--color-bg-level-1); border-radius: 8px; margin: 12px 0 16px; padding: 20px; }
  .drawerSample [data-s1-component="modal"] { display: inline-flex; inset: auto; position: relative; z-index: 0; }
  .drawerSample [data-s1-component="modal"] [data-s1-part="overlay"] { display: none; }
  .drawerSample [data-s1-component="select"] [data-s1-part="panel"] { display: none; }
  .note { background: var(--color-bg-level-1); border-left: 3px solid var(--color-blue-300); border-radius: 4px; font-size: 12px; line-height: 1.6; margin: 0 0 16px; padding: 10px 12px; }
  .codehead { align-items: center; display: flex; justify-content: space-between; margin: 20px 0 6px; }
  .codehead h4 { font-size: 13px; margin: 0; }
  .copy { background: var(--color-blue-400); border: 0; border-radius: 6px; color: #fff; cursor: pointer; font: inherit; font-size: 12px; padding: 5px 12px; }
  .copy[data-done="true"] { background: var(--color-text-state-correct, #1a8f4c); }
  pre.code { background: var(--color-bg-level-2); border-radius: 8px; font-family: ui-monospace, Menlo, monospace; font-size: 12px; line-height: 1.55; margin: 0; overflow-x: auto; padding: 14px; }
  .partgroup { margin-bottom: 12px; }
  .partgroup h4 { font-size: 11px; letter-spacing: .04em; margin: 0 0 4px; opacity: .55; text-transform: uppercase; }
  .chip { align-items: center; background: var(--color-bg-level-1); border-radius: 999px; display: inline-flex; font-size: 11px; gap: 4px; margin: 2px 4px 2px 0; padding: 3px 8px; }
  .chip i { border: 1px solid rgba(0,0,0,.15); border-radius: 3px; display: inline-block; height: 12px; width: 12px; }
  .chip code { font-size: 10px; opacity: .75; }
  .valueshead { font-size: 13px; margin: 20px 0 8px; }
  .backdrop { background: rgba(0,0,0,.25); inset: 0; opacity: 0; pointer-events: none; position: fixed; transition: opacity .18s ease; z-index: 90; }
  .backdrop[data-open="true"] { opacity: 1; pointer-events: auto; }
  .hidden { display: none !important; }
  .emptynote { font-size: 13px; opacity: .6; padding: 8px 0; }
</style>
</head>
<body>
<div class="toolbar">
  <div class="inner">
    <div class="row1">
      <nav>${Object.keys(PLANS).map((id) => `<a href="#${id}">${escapeHtml(COMPONENT_TITLE[id] ?? id)}</a>`).join('')}</nav>
      <input id="search" type="search" placeholder="찾기 (예: md, disabled, 버튼)" autocomplete="off">
      <button type="button" class="themebtn" id="light" aria-pressed="true">라이트</button>
      <button type="button" class="themebtn" id="dark" aria-pressed="false">다크</button>
    </div>
    <div class="row2">
      ${filterGroup('size', '크기')}
      ${filterGroup('state', '상태')}
      ${filterGroup('variant', '변형')}
      ${filterGroup('breakName', '화면')}
      <button type="button" class="reset" id="reset">전부 켜기</button>
    </div>
  </div>
</div>

<div class="page">
  <header class="top">
    <h1>Kotlin(Compose) 부품 검수</h1>
    <p class="lead">표 안에 보이는 것은 <b>승인된 웹 배포본</b>이 그 상태에서 실제로 그리는 모습입니다. 안드로이드 부품은 <b>같은 값</b>을 씁니다 — 브라우저가 계산한 값과 전부 맞춰 봤고 어긋난 곳이 없습니다.</p>
    <p class="lead">칸을 누르면 <b>그 조합의 값 전부와 붙여 쓸 코드</b>가 오른쪽에 열립니다. 위쪽에서 크기·상태로 좁히거나 글자로 찾을 수 있습니다.</p>
  </header>
  ${sections.join('')}
</div>

<div class="backdrop" id="backdrop"></div>
<aside class="drawer" id="drawer" aria-hidden="true">
  <div class="head">
    <div>
      <h3 id="drawerTitle">조합</h3>
      <div class="keytext" id="drawerKey"></div>
    </div>
    <button type="button" class="close" id="drawerClose" aria-label="닫기">×</button>
  </div>
  <div class="body">
    <div class="drawerSample" id="drawerSample"></div>
    <p class="note hidden" id="drawerNote"></p>
    <div class="codehead">
      <h4>붙여 쓰는 코드</h4>
      <button type="button" class="copy" id="copy">복사</button>
    </div>
    <pre class="code" id="drawerCode"></pre>
    <h4 class="valueshead">이 조합이 쓰는 값</h4>
    <div id="drawerValues"></div>
  </div>
</aside>

<script id="details" type="application/json">${JSON.stringify(details)}</script>
<script>
  const details = JSON.parse(document.getElementById('details').textContent);
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('backdrop');
  let activeCell = null;

  function openDetail(id, cell) {
    const detail = details[id];
    if (!detail) return;
    if (activeCell) activeCell.classList.remove('active');
    activeCell = cell;
    if (cell) cell.classList.add('active');
    document.getElementById('drawerTitle').textContent = detail.title;
    document.getElementById('drawerKey').textContent = detail.component + ' · ' + detail.key;
    document.getElementById('drawerSample').innerHTML = detail.sample;
    document.getElementById('drawerCode').textContent = detail.code;
    document.getElementById('drawerValues').innerHTML = detail.values;
    const note = document.getElementById('drawerNote');
    note.textContent = detail.note || '';
    note.classList.toggle('hidden', !detail.note);
    drawer.dataset.open = 'true';
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.dataset.open = 'true';
    document.getElementById('copy').dataset.done = 'false';
    document.getElementById('copy').textContent = '복사';
  }

  function closeDetail() {
    drawer.dataset.open = 'false';
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.dataset.open = 'false';
    if (activeCell) activeCell.classList.remove('active');
    activeCell = null;
  }

  document.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (cell) { openDetail(cell.dataset.detail, cell); return; }
  });
  document.getElementById('drawerClose').addEventListener('click', closeDetail);
  backdrop.addEventListener('click', closeDetail);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDetail(); });

  document.getElementById('copy').addEventListener('click', async () => {
    const button = document.getElementById('copy');
    const text = document.getElementById('drawerCode').textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    button.dataset.done = 'true';
    button.textContent = '복사됨';
  });

  /* 필터 — 켜진 값만 남긴다. 칸이 하나도 없는 표는 통째로 접는다. */
  const search = document.getElementById('search');
  function apply() {
    const allowed = {};
    for (const input of document.querySelectorAll('[data-filter]')) {
      (allowed[input.dataset.filter] = allowed[input.dataset.filter] || new Set());
      if (input.checked) allowed[input.dataset.filter].add(input.value);
    }
    const every = new Set([...Object.values(allowed)].flatMap((set) => [...set]));
    const query = search.value.trim().toLowerCase();

    for (const section of document.querySelectorAll('section')) {
      const table = section.querySelector('table');
      const columns = [...table.querySelectorAll('thead th[data-col]')];
      let visibleColumns = 0;
      for (const head of columns) {
        const show = every.has(head.dataset.col);
        head.classList.toggle('hidden', !show);
        if (show) visibleColumns += 1;
        for (const cell of table.querySelectorAll('td[data-col="' + CSS.escape(head.dataset.col) + '"]')) {
          cell.classList.toggle('hidden', !show);
        }
      }
      let visibleRows = 0;
      for (const row of table.querySelectorAll('tbody tr')) {
        const values = JSON.parse(row.dataset.row);
        const matchesFilters = values.every((value) => every.has(value));
        const matchesQuery = query === '' || row.dataset.search.includes(query) || section.dataset.component.includes(query);
        const show = matchesFilters && matchesQuery;
        row.classList.toggle('hidden', !show);
        if (show) visibleRows += 1;
      }
      const empty = visibleRows === 0 || visibleColumns === 0;
      section.classList.toggle('hidden', empty);
    }
  }
  for (const input of document.querySelectorAll('[data-filter]')) input.addEventListener('change', apply);
  search.addEventListener('input', apply);
  document.getElementById('reset').addEventListener('click', () => {
    for (const input of document.querySelectorAll('[data-filter]')) input.checked = true;
    search.value = '';
    apply();
  });

  const light = document.getElementById('light');
  const dark = document.getElementById('dark');
  const setTheme = (value) => {
    document.documentElement.dataset.theme = value;
    light.setAttribute('aria-pressed', String(value === 'light'));
    dark.setAttribute('aria-pressed', String(value === 'dark'));
  };
  light.addEventListener('click', () => setTheme('light'));
  dark.addEventListener('click', () => setTheme('dark'));
  apply();
</script>
</body>
</html>
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(`✅ 검수 화면: ${path.relative(ROOT, OUT)}`);
}

main().catch((error) => { console.error(`❌ ${error.message}`); process.exit(1); });
