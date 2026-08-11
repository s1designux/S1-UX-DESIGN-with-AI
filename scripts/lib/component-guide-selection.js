'use strict';

function esc(value) { return String(value).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function coverageValue(value) { return String(value).trim().toLowerCase().replace(/\s+/g, '-'); }
function cssVar(token) { return token && !/^\(/.test(token) ? `var(--${token.replace(/\//g, '-')})` : 'transparent'; }
function setFor(model, name) {
  const set = model.componentSets.find((item) => item.name === name);
  if (!set) throw new Error(`component guide model에 ${name} 세트가 없습니다.`);
  return set;
}
function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children || []) { const found = findNode(child, predicate); if (found) return found; }
  return null;
}
function px(value, fallback = 0) { return `${value == null ? fallback : value}px`; }
function border(node) {
  const width = node.appearance.strokeWeight == null ? 0 : node.appearance.strokeWeight;
  return `${width}px solid ${cssVar(node.appearance.stroke)}`;
}
function radius(node) {
  const value = node.appearance.cornerRadius == null ? node.appearance.topLeftRadius : node.appearance.cornerRadius;
  return value === 999 ? '999px' : px(value);
}

function selectionData(model) {
  const checkbox = setFor(model, 'Checkbox');
  const radio = setFor(model, 'Radio');
  const toggle = setFor(model, 'Toggle');
  const multiToggleElement = setFor(model, 'Multi Toggle Element');
  const multiToggle = setFor(model, 'Multi Toggle');
  const chip = setFor(model, 'Chip');
  const filterChip = setFor(model, 'Filter Chip');
  if (checkbox.variantCount !== (checkbox.axes.State || []).length) throw new Error('Checkbox 축과 variant 개수가 다릅니다.');
  if (radio.variantCount !== (radio.axes.State || []).length * (radio.axes.Label || []).length) throw new Error('Radio 축과 variant 개수가 다릅니다.');
  if (toggle.variantCount !== (toggle.axes.Pressed || []).length * (toggle.axes.State || []).length) throw new Error('Toggle 축과 variant 개수가 다릅니다.');
  if (multiToggleElement.variantCount !== (multiToggleElement.axes.position || []).length * (multiToggleElement.axes.state || []).length * (multiToggleElement.axes.size || []).length) throw new Error('Multi Toggle Element 축과 variant 개수가 다릅니다.');
  if (multiToggle.variantCount !== (multiToggle.axes.Size || []).length * (multiToggle.axes.Selected || []).length) throw new Error('Multi Toggle 축과 variant 개수가 다릅니다.');
  const chipCombos = new Set(chip.variants.map((item) => `${item.axes.Break}/${item.axes.Size}`)).size;
  if (chip.variantCount !== chipCombos * (chip.axes.State || []).length * (chip.axes.Variant || []).length) throw new Error('Chip 유효 플랫폼/사이즈 조합과 variant 개수가 다릅니다.');
  const filterCombos = new Set(filterChip.variants.map((item) => `${item.axes.Break}/${item.axes.Size}`)).size;
  if (filterChip.variantCount !== filterCombos * (filterChip.axes.State || []).length * (filterChip.axes.Variant || []).length * (filterChip.axes.Title || []).length) throw new Error('Filter Chip 유효 플랫폼/사이즈 조합과 variant 개수가 다릅니다.');
  return { checkbox, radio, toggle, multiToggleElement, multiToggle, chip, filterChip };
}

function cssFor(data) {
  const checkboxRules = data.checkbox.variants.map((variant) => {
    const n = variant.node;
    return `.guide-checkbox[data-state="${slug(variant.axes.State)}"] .guide-checkbox-box{width:${px(n.dimensions.width)};height:${px(n.dimensions.height)};background:${cssVar(n.appearance.fill)};border:${border(n)};border-radius:${radius(n)}}`;
  });
  const radioRules = data.radio.variants.map((variant) => {
    const circle = findNode(variant.node, (node) => node.name === 'circle') || variant.node;
    const dot = (variant.axes.State === 'Selected' || variant.axes.State === 'Dis+Selected') ? 1 : 0;
    return `.guide-radio[data-state="${slug(variant.axes.State)}"] .guide-radio-circle{width:${px(circle.dimensions.width)};height:${px(circle.dimensions.height)};background:${cssVar(circle.appearance.fill)};border:${border(circle)};border-radius:${radius(circle)}} .guide-radio[data-state="${slug(variant.axes.State)}"] .guide-radio-dot{opacity:${dot};background:${cssVar((circle.children[0] || {}).appearance && circle.children[0].appearance.fill)}}`;
  });
  const toggleRules = data.toggle.variants.map((variant) => {
    const n = variant.node, knob = n.children[0];
    return `.guide-toggle[data-pressed="${slug(variant.axes.Pressed)}"][data-state="${slug(variant.axes.State)}"] .guide-toggle-track{width:${px(n.dimensions.width)};height:${px(n.dimensions.height)};background:${cssVar(n.appearance.fill)};border-radius:${radius(n)}} .guide-toggle[data-pressed="${slug(variant.axes.Pressed)}"][data-state="${slug(variant.axes.State)}"] .guide-toggle-knob{width:${px(knob.dimensions.width)};height:${px(knob.dimensions.height)};left:${px(knob.position.x)};top:${px(knob.position.y)};background:${cssVar(knob.appearance.fill)};border-radius:${radius(knob)}}`;
  });
  return `    .guide-selection-control{font:inherit;color:var(--color-text-primary);background:none;border:0;padding:0;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
    .guide-selection-control[disabled]{cursor:default}.guide-selection-control.is-preview{pointer-events:none}
    .guide-checkbox-box,.guide-radio-circle{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;flex:none}.guide-checkbox-mark{opacity:0;color:var(--color-control-indicator-selected);font-size:12px}.guide-checkbox[data-state="checked"] .guide-checkbox-mark,.guide-checkbox[data-state="dis-checked"] .guide-checkbox-mark{opacity:1}
    .guide-radio-circle{border-radius:50%}.guide-radio-dot{width:10px;height:10px;border-radius:50%}
    .guide-toggle-track{position:relative;display:inline-block;flex:none}.guide-toggle-knob{position:absolute;transition:left .18s ease}
${checkboxRules.join('\n')}
${radioRules.join('\n')}
${toggleRules.join('\n')}`;
}

function textNode(node) { return findNode(node, (item) => item.type === 'TEXT'); }
function corners(node) {
  const a = node.appearance;
  if (a.cornerRadius != null) return radius(node);
  return [a.topLeftRadius, a.topRightRadius, a.bottomRightRadius, a.bottomLeftRadius].map((value) => px(value)).join(' ');
}
function fontWeight(node) { const text = textNode(node); return text && text.text.fontStyle === 'Medium' ? 500 : 400; }
function declarations(node) {
  const text = textNode(node);
  const pad = node.layout.padding || {};
  return [
    node.dimensions.height != null ? `height:${px(node.dimensions.height)}` : null,
    node.layout.minWidth != null ? `min-width:${px(node.layout.minWidth)}` : null,
    `padding:0 ${px(pad.right)} 0 ${px(pad.left)}`,
    `background:${cssVar(node.appearance.fill)}`,
    `border:${border(node)}`,
    `border-width:${[node.appearance.strokeTopWeight, node.appearance.strokeRightWeight, node.appearance.strokeBottomWeight, node.appearance.strokeLeftWeight].map((value) => px(value, node.appearance.strokeWeight || 0)).join(' ')}`,
    `border-radius:${corners(node)}`,
    text ? `color:${cssVar(text.appearance.fill)}` : null,
    text && text.text.fontSize ? `font-size:${px(text.text.fontSize)}` : null,
    `font-weight:${fontWeight(node)}`,
  ].filter(Boolean).join(';');
}

function extendedCssFor(data) {
  const multiRules = data.multiToggleElement.variants.map((variant) => `    .guide-multi-toggle-item[data-position="${slug(variant.axes.position)}"][data-state="${slug(variant.axes.state)}"][data-size="${slug(variant.axes.size)}"]{${declarations(variant.node)}}`).join('\n');
  const multiHoverRules = data.multiToggleElement.variants.filter((variant) => variant.axes.state === 'hover').map((variant) => `    .guide-multi-toggle:not(.is-preview) .guide-multi-toggle-item[data-position="${slug(variant.axes.position)}"][data-state="default"][data-size="${slug(variant.axes.size)}"]:hover{${declarations(variant.node)}}`).join('\n');
  const chipRules = data.chip.variants.map((variant) => `    .guide-chip[data-break="${slug(variant.axes.Break)}"][data-size="${slug(variant.axes.Size)}"][data-variant="${slug(variant.axes.Variant)}"][data-state="${slug(variant.axes.State)}"]{${declarations(variant.node)}}`).join('\n');
  const chipHoverRules = data.chip.variants.filter((variant) => variant.axes.State === 'Hover').map((variant) => `    .guide-chip:not(.is-preview)[data-break="${slug(variant.axes.Break)}"][data-size="${slug(variant.axes.Size)}"][data-variant="${slug(variant.axes.Variant)}"][data-state="default"]:hover{${declarations(variant.node)}}`).join('\n');
  const filterRules = data.filterChip.variants.map((variant) => {
    const chip = findNode(variant.node, (item) => item.name === 'chip');
    const texts = (chip.children || []).filter((item) => item.type === 'TEXT');
    const value = texts[texts.length - 1];
    return `    .guide-filter-chip[data-break="${slug(variant.axes.Break)}"][data-size="${slug(variant.axes.Size)}"][data-variant="${slug(variant.axes.Variant)}"][data-title="${slug(variant.axes.Title)}"][data-state="${slug(variant.axes.State)}"] .guide-filter-trigger{${declarations(chip)};gap:${px(chip.layout.gap)}}\n    .guide-filter-chip[data-break="${slug(variant.axes.Break)}"][data-size="${slug(variant.axes.Size)}"][data-variant="${slug(variant.axes.Variant)}"][data-title="${slug(variant.axes.Title)}"][data-state="${slug(variant.axes.State)}"] .guide-filter-value{color:${cssVar(value && value.appearance.fill)}}`;
  }).join('\n');
  const filterHoverRules = data.filterChip.variants.filter((variant) => variant.axes.State === 'Hover').map((variant) => {
    const chip = findNode(variant.node, (item) => item.name === 'chip');
    const texts = (chip.children || []).filter((item) => item.type === 'TEXT');
    const value = texts[texts.length - 1];
    const selector = `.guide-filter-chip:not(.is-preview)[data-break="${slug(variant.axes.Break)}"][data-size="${slug(variant.axes.Size)}"][data-variant="${slug(variant.axes.Variant)}"][data-title="${slug(variant.axes.Title)}"][data-state="default"]`;
    return `    ${selector} .guide-filter-trigger:hover{${declarations(chip)};gap:${px(chip.layout.gap)}}\n    ${selector} .guide-filter-trigger:hover .guide-filter-value{color:${cssVar(value && value.appearance.fill)}}`;
  }).join('\n');
  const selected = data.filterChip.variants.find((variant) => variant.axes.State === 'Selected');
  const dropdown = selected && findNode(selected.node, (item) => item.name === 'dropdown');
  const option = dropdown && (dropdown.children || [])[0];
  const multiSm = data.multiToggleElement.variants.find((variant) => variant.axes.size === 'sm' && variant.axes.position === 'first' && variant.axes.state === 'default');
  const chipPcSm = data.chip.variants.find((variant) => variant.axes.Break === 'PC' && variant.axes.Size === 'SM' && variant.axes.Variant === 'Line' && variant.axes.State === 'Default');
  const chipMobile = data.chip.variants.find((variant) => variant.axes.Break === 'Mobile' && variant.axes.Variant === 'Line' && variant.axes.State === 'Default');
  return `    .guide-multi-toggle{display:inline-flex}.guide-multi-toggle-item{box-sizing:border-box;font-family:inherit;line-height:var(--line-height-130);white-space:nowrap;cursor:pointer}.guide-multi-toggle-item[disabled],.guide-multi-toggle.is-preview .guide-multi-toggle-item{cursor:default;pointer-events:none}
    .s1-multi-toggle--sm .guide-multi-toggle-item{height:${px(multiSm && multiSm.node.dimensions.height)};padding:0 ${px(multiSm && multiSm.node.layout.padding.right)}}
    .guide-chip{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;font-family:inherit;line-height:1;white-space:nowrap;cursor:pointer}.guide-chip.is-preview{pointer-events:none}.guide-chip:disabled{cursor:default}
    .s1-chip--sm{height:${px(chipPcSm && chipPcSm.node.dimensions.height)};padding:0 ${px(chipPcSm && chipPcSm.node.layout.padding.right)}}.s1-chip--mobile{height:${px(chipMobile && chipMobile.node.dimensions.height)};padding:0 ${px(chipMobile && chipMobile.node.layout.padding.right)}}
    .guide-filter-chip{position:relative;display:inline-block}.guide-filter-trigger{box-sizing:border-box;display:inline-flex;align-items:center;font-family:inherit;white-space:nowrap;cursor:pointer}.guide-filter-trigger:disabled,.guide-filter-chip.is-preview .guide-filter-trigger{cursor:default;pointer-events:none}.guide-filter-arrow{font-size:1em;line-height:1}.guide-filter-chip[data-state="selected"] .guide-filter-arrow{transform:rotate(180deg)}
    .guide-filter-popup{position:absolute;z-index:20;left:0;top:calc(100% + ${px(selected && selected.node.layout.gap)});display:none;box-sizing:border-box;min-width:${px(dropdown && dropdown.dimensions.width)};padding:${px(dropdown && dropdown.layout.padding.top)} 0;background:${cssVar(dropdown && dropdown.appearance.fill)};border:${dropdown ? border(dropdown) : '0 solid transparent'};border-radius:${dropdown ? radius(dropdown) : '0'};box-shadow:var(--shadow-dropdown)}.guide-filter-chip[data-state="selected"]>.guide-filter-popup{display:block}.guide-filter-option{display:flex;align-items:center;box-sizing:border-box;width:100%;height:${px(option && option.dimensions.height)};padding:0 ${px(option && option.layout.padding.right)};border:0;background:${cssVar(option && option.appearance.fill)};color:${cssVar(textNode(option || { children: [] }) && textNode(option || { children: [] }).appearance.fill)};font:inherit;text-align:left;cursor:pointer}.guide-filter-option[aria-selected="true"]{font-weight:var(--font-weight-medium)}
    .guide-filter-dialog{display:none}.guide-filter-dialog[aria-hidden="false"]{position:fixed;z-index:1000;inset:0;display:flex;align-items:flex-end;background:var(--color-overlay)}.guide-filter-chip.is-preview .guide-filter-dialog[aria-hidden="false"]{position:relative;z-index:auto;inset:auto;margin-top:var(--spacing-8)}.guide-filter-sheet{width:100%;padding:var(--spacing-24);background:var(--color-bg-surface-default);border-radius:var(--radius-16) var(--radius-16) 0 0}.guide-filter-sheet [role="option"]{display:block;width:100%;padding:var(--spacing-12);border:0;background:transparent;color:var(--color-text-primary);text-align:left;font:inherit}
${multiRules}\n${multiHoverRules}\n${chipRules}\n${chipHoverRules}\n${filterRules}\n${filterHoverRules}`;
}

function control(kind, axes, label, preview = false) {
  const state = axes.State || 'Default';
  const disabled = state.startsWith('Dis') || state === 'Disabled';
  const common = `class="guide-selection-control guide-${kind}${preview ? ' is-preview' : ''}" data-component="${kind}" data-state="${slug(state)}"${disabled ? ' disabled' : ''}`;
  if (kind === 'checkbox') {
    const checked = state === 'Checked' || state === 'Dis+Checked';
    return `<button type="button" ${common} role="checkbox" aria-checked="${checked}" aria-label="${esc(label)}"><span class="guide-checkbox-box"><span class="guide-checkbox-mark" aria-hidden="true">✓</span></span><span>${esc(label)}</span></button>`;
  }
  if (kind === 'radio') {
    const checked = state === 'Selected' || state === 'Dis+Selected';
    return `<button type="button" ${common} role="radio" aria-checked="${checked}" tabindex="${checked ? 0 : -1}"><span class="guide-radio-circle"><span class="guide-radio-dot"></span></span><span>${esc(label)}</span></button>`;
  }
  const pressed = axes.Pressed || 'Off';
  return `<button type="button" ${common} data-pressed="${slug(pressed)}" role="switch" aria-checked="${pressed === 'On'}" aria-label="${esc(label)}"><span class="guide-toggle-track"><span class="guide-toggle-knob"></span></span><span>${esc(label)}</span></button>`;
}

function tokensFor(set) {
  const tokens = new Set();
  const walk = (node) => { for (const value of [node.appearance.fill, node.appearance.stroke]) if (value && !value.startsWith('(')) tokens.add(value); for (const child of node.children || []) walk(child); };
  set.variants.forEach((variant) => walk(variant.node));
  return [...tokens].map((token) => `<tr><td class="token-name">--${esc(token.replace(/\//g, '-'))}</td><td class="token-value">${esc(token)}</td><td>정본 바인딩</td></tr>`).join('\n');
}

const PANE_IDS = { checkbox: ['chk-html','chk-css','chk-tokens','chk-js'], radio: ['radio-html','radio-css','radio-tokens'], toggle: ['toggle-html','toggle-css','toggle-tokens'] };
function section(kind, set, meta, css) {
  const axes = set.axes;
  const label = meta.guide.sampleLabels[0];
  const variants = set.variants.map((variant) => `<div class="comp-state-cell"><div class="matrix-row-label">${esc(variant.name)}</div>${control(kind, variant.axes, label, true)}</div>`).join('\n');
  let action;
  if (kind === 'radio') action = `<div class="guide-radio-group" data-component="radio-group" role="radiogroup" aria-label="${esc(meta._meta.name)}">${meta.guide.sampleLabels.map((text, index) => control('radio', { State: index ? 'Default' : 'Selected' }, text)).join('')}</div>`;
  else action = control(kind, kind === 'toggle' ? { Pressed: 'Off', State: 'Default' } : { State: 'Default' }, label);
  const ids = PANE_IDS[kind];
  const example = kind === 'radio' ? action : control(kind, kind === 'toggle' ? { Pressed: 'Off', State: 'Default' } : { State: 'Default' }, label);
  const tabs = ids.map((id, index) => `<button class="code-tab${index ? '' : ' active'}" onclick="switchTab(this,'${id}')">${id.endsWith('html') ? 'HTML' : id.endsWith('css') ? 'CSS' : id.endsWith('js') ? 'JS' : 'Token Details'}</button>`).join('');
  const panes = ids.map((id, index) => `<div class="code-pane${index ? '' : ' active'}" id="${id}">${id.endsWith('tokens') ? `<table class="token-detail-table"><tbody>${tokensFor(set)}</tbody></table>` : `<pre id="${id}-pre">${esc(id.endsWith('css') ? css : id.endsWith('js') ? `// ${meta.guide.interactionPattern}: data-component 자동 탐색` : example)}</pre>`}</div>`).join('\n');
  const cov = Object.entries(axes).map(([axis, values]) => `data-cov-${slug(axis)}="${values.map(coverageValue).join(',')}"`).join(' ');
  return `      <section class="comp-section" id="${kind}" ${cov}>
        <div class="comp-section-header"><h2 class="comp-section-title">${esc(meta._meta.name)}</h2><span class="comp-badge comp-badge-blue">Core</span><span class="comp-badge">${set.variantCount} variants</span><span class="comp-badge">interactive</span></div>
        <p class="variant-group-desc">${esc(meta._meta.description)}</p>
        <div class="variant-block"><div class="variant-label">Action</div><div class="preview-area">${action}</div></div>
        <div class="variant-block"><div class="variant-label">Canonical variants</div><div class="preview-area" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;overflow:auto">${variants}</div></div>
        <div class="code-block"><div class="code-tabs">${tabs}<button class="code-copy-btn" onclick="copyCode('${ids[0]}-pre')">복사</button></div>${panes}</div>
      </section>`;
}

function coverageAttrs(axes) {
  const names = { State: 'states', state: 'states', Size: 'sizes', size: 'sizes', Variant: 'variants', Title: 'titles', Selected: 'selected', position: 'position', Break: 'breaks' };
  return Object.entries(axes).map(([axis, values]) => `data-cov-${names[axis] || slug(axis)}="${values.map(coverageValue).join(',')}"`).join(' ');
}

function codeBlock(prefix, html, css, set, includeCss = true) {
  const panes = [{ id: `${prefix}-html`, label: 'HTML', body: `<pre id="${prefix}-html-pre">${esc(html)}</pre>` }];
  if (includeCss) panes.push({ id: `${prefix}-css`, label: 'CSS', body: `<pre>${esc(css)}</pre>` });
  panes.push({ id: `${prefix}-tokens`, label: 'Token Details', body: `<table class="token-detail-table"><tbody>${tokensFor(set)}</tbody></table>` });
  return `<div class="code-block"><div class="code-tabs">${panes.map((pane, index) => `<button class="code-tab${index ? '' : ' active'}" onclick="switchTab(this,'${pane.id}')">${pane.label}</button>`).join('')}<button class="code-copy-btn" onclick="copyCode('${prefix}-html-pre')">복사</button></div>${panes.map((pane, index) => `<div class="code-pane${index ? '' : ' active'}" id="${pane.id}">${pane.body}</div>`).join('')}</div>`;
}

function multiToggleMarkup(size, selected, labels, preview = false) {
  const selectedIndex = ['Left', 'Center', 'Right'].indexOf(selected);
  const positions = ['first', selected === 'Left' ? 'middle-right' : 'middle-left', 'last'];
  return `<div class="guide-multi-toggle s1-multi-toggle${size === 'sm' ? ' s1-multi-toggle--sm' : ''}${preview ? ' is-preview' : ''}" data-component="multi-toggle" data-size="${slug(size)}" role="radiogroup" aria-label="Multi Toggle ${esc(size)}">${labels.map((label, index) => `<button type="button" class="guide-multi-toggle-item" data-position="${positions[index]}" data-size="${slug(size)}" data-state="${index === selectedIndex ? 'selected' : 'default'}" role="radio" aria-checked="${index === selectedIndex}" tabindex="${index === selectedIndex ? 0 : -1}">${esc(label)}</button>`).join('')}</div>`;
}

function multiToggleSection(data, meta, css) {
  const labels = meta.guide.sampleLabels;
  const action = (data.multiToggle.axes.Size || []).map((size) => `<div class="btn-action-item"><div class="matrix-row-label">${esc(size)}<span>h${data.multiToggleElement.variants.find((item) => item.axes.size === size).node.dimensions.height}</span></div>${multiToggleMarkup(size, 'Left', labels)}</div>`).join('');
  const composed = data.multiToggle.variants.map((variant) => `<div class="comp-state-cell"><div class="matrix-row-label">${esc(variant.name)}</div>${multiToggleMarkup(variant.axes.Size, variant.axes.Selected, labels, true)}</div>`).join('\n');
  const elements = data.multiToggleElement.variants.map((variant) => `<div class="comp-state-cell"><div class="matrix-row-label">${esc(variant.name)}</div><button type="button" class="guide-multi-toggle-item" data-component="multi-toggle-element" data-position="${slug(variant.axes.position)}" data-state="${slug(variant.axes.state)}" data-size="${slug(variant.axes.size)}"${variant.axes.state === 'disabled' ? ' disabled' : ''}>${esc(labels[0])}</button></div>`).join('\n');
  const cov = `${coverageAttrs(data.multiToggleElement.axes)} ${coverageAttrs(data.multiToggle.axes)}`;
  const example = data.multiToggle.axes.Size.map((size) => multiToggleMarkup(size, data.multiToggle.axes.Selected[0], labels)).join('\n');
  return `      <section class="comp-section" id="multi-toggle" ${cov}>
        <div class="comp-section-header"><h2 class="comp-section-title">${esc(meta._meta.name)}</h2><span class="comp-badge comp-badge-blue">Core</span><span class="comp-badge">${data.multiToggleElement.variantCount} element + ${data.multiToggle.variantCount} composed</span><span class="comp-badge">interactive</span></div>
        <p class="variant-group-desc">${esc(meta._meta.description)}</p>
        <div class="variant-block"><div class="variant-label">Action · segmented-radio</div><div class="preview-area"><div class="btn-action-row">${action}</div></div></div>
        <div class="variant-block"><div class="variant-label">Composed variants</div><div class="preview-area" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">${composed}</div></div>
        <div class="variant-block"><div class="variant-label">Element variants</div><div class="preview-area" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px">${elements}</div></div>
        ${codeBlock('mtog', example, css, data.multiToggleElement)}
      </section>`;
}

function chipMarkup(axes, label, preview = false) {
  const selected = axes.State === 'Selected';
  const disabled = axes.State === 'Disabled';
  const sizeClass = axes.Break === 'Mobile' ? ' s1-chip--mobile' : axes.Size === 'SM' ? ' s1-chip--sm' : '';
  return `<button type="button" class="guide-chip s1-chip${sizeClass}${preview ? ' is-preview' : ''}" data-component="chip" data-break="${slug(axes.Break)}" data-size="${slug(axes.Size)}" data-variant="${slug(axes.Variant)}" data-state="${slug(axes.State)}" aria-pressed="${selected}"${disabled ? ' disabled' : ''}>${esc(label)}</button>`;
}

function chipSection(data, meta, css) {
  const label = meta.guide.sampleLabels[0];
  const combos = [...new Set(data.chip.variants.map((item) => `${item.axes.Break}/${item.axes.Size}`))];
  const action = (data.chip.axes.Variant || []).flatMap((variant) => combos.map((combo) => {
    const [platform, size] = combo.split('/');
    return `<div class="btn-action-item"><div class="matrix-row-label">${esc(variant)} · ${esc(platform)} ${esc(size)}</div>${chipMarkup({ Break: platform, Size: size, Variant: variant, State: 'Default' }, label)}</div>`;
  })).join('');
  const variants = data.chip.variants.map((variant) => `<div class="comp-state-cell"><div class="matrix-row-label">${esc(variant.name)}</div>${chipMarkup(variant.axes, label, true)}</div>`).join('\n');
  const example = combos.map((combo) => { const [Break, Size] = combo.split('/'); return chipMarkup({ Break, Size, Variant: 'Line', State: 'Default' }, label); }).join('\n');
  return `      <section class="comp-section" id="chip" ${coverageAttrs(data.chip.axes)}>
        <div class="comp-section-header"><h2 class="comp-section-title">${esc(meta._meta.name)}</h2><span class="comp-badge comp-badge-blue">Core</span><span class="comp-badge">${data.chip.variantCount} variants</span><span class="comp-badge">interactive</span></div>
        <p class="variant-group-desc">${esc(meta._meta.description)}</p>
        <div class="variant-block"><div class="variant-label">Action · ${esc(meta.guide.interactionPattern)}</div><div class="preview-area"><div class="btn-action-row">${action}</div></div></div>
        <div class="variant-block"><div class="variant-label">Canonical variants</div><div class="preview-area" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px">${variants}</div></div>
        ${codeBlock('chip', example, css, data.chip)}
      </section>`;
}

function filterMarkup(axes, meta, preview = false) {
  const selected = axes.State === 'Selected';
  const disabled = axes.State === 'Disabled';
  const mobile = axes.Break === 'Mobile';
  const labels = meta.guide.sampleLabels;
  const value = axes.State === 'Complete' ? labels[1] : labels[0];
  const title = axes.Title === 'On' ? `<span class="guide-filter-title">${esc(meta.guide.sampleTitle)}</span>` : '';
  const popup = mobile ? `<div class="guide-filter-dialog" role="dialog" aria-modal="true" aria-label="${esc(meta.guide.sampleTitle)}" aria-hidden="${!selected}"><div class="guide-filter-sheet"><div role="listbox" aria-label="${esc(meta.guide.sampleTitle)}">${labels.map((label, index) => `<button type="button" role="option" aria-selected="${index === 0}">${esc(label)}</button>`).join('')}</div></div></div>` : `<div class="guide-filter-popup" role="listbox" aria-label="${esc(meta.guide.sampleTitle)}">${labels.map((label, index) => `<button type="button" class="guide-filter-option" role="option" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${esc(label)}</button>`).join('')}</div>`;
  return `<div class="guide-filter-chip${preview ? ' is-preview' : ''}" data-component="filter-chip" data-break="${slug(axes.Break)}" data-size="${slug(axes.Size)}" data-variant="${slug(axes.Variant)}" data-title="${slug(axes.Title)}" data-state="${slug(axes.State)}"><button type="button" class="guide-filter-trigger" aria-haspopup="listbox" aria-expanded="${selected}"${disabled ? ' disabled' : ''}>${title}<span class="guide-filter-value">${esc(value)}</span><span class="guide-filter-arrow" aria-hidden="true">⌄</span></button>${popup}</div>`;
}

function filterChipSection(data, meta, css) {
  const combos = [...new Set(data.filterChip.variants.map((item) => `${item.axes.Break}/${item.axes.Size}`))];
  const action = combos.map((combo) => { const [Break, Size] = combo.split('/'); return `<div class="btn-action-item"><div class="matrix-row-label">${esc(Break)} ${esc(Size)}</div>${filterMarkup({ Break, Size, Variant: 'Line', Title: 'On', State: 'Default' }, meta)}</div>`; }).join('');
  const variants = data.filterChip.variants.map((variant) => `<div class="comp-state-cell"><div class="matrix-row-label">${esc(variant.name)}</div>${filterMarkup(variant.axes, meta, true)}</div>`).join('\n');
  const example = combos.map((combo) => { const [Break, Size] = combo.split('/'); return filterMarkup({ Break, Size, Variant: 'Line', Title: 'On', State: 'Default' }, meta); }).join('\n');
  return `      <section class="comp-section" id="filter-chip" ${coverageAttrs(data.filterChip.axes)}>
        <div class="comp-section-header"><h2 class="comp-section-title">${esc(meta._meta.name)}</h2><span class="comp-badge comp-badge-blue">Core</span><span class="comp-badge">${data.filterChip.variantCount} variants</span><span class="comp-badge">interactive</span></div>
        <p class="variant-group-desc">${esc(meta._meta.description)}</p>
        <div class="variant-block"><div class="variant-label">Action · PC disclosure-listbox · Mobile dialog-single-select</div><div class="preview-area" style="overflow:visible"><div class="btn-action-row">${action}</div></div></div>
        <div class="variant-block"><div class="variant-label">Canonical variants · Selected includes Dropdown dependency</div><div class="preview-area" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;overflow:visible">${variants}</div></div>
        ${codeBlock('filter-chip', example, css, data.filterChip, false)}
      </section>`;
}

function interactionScript() {
  return `      <script data-component-guide-selection-runtime>
      ;(function setupGeneratedSelection(){
        if(window.__componentGuideSelectionReady)return;window.__componentGuideSelectionReady=true;
        document.addEventListener('click',function(event){
          var checkbox=event.target.closest('[data-component="checkbox"]');if(checkbox&&!checkbox.closest('[data-component="table"]')&&!checkbox.disabled&&!checkbox.classList.contains('is-preview')){var on=checkbox.getAttribute('aria-checked')!=='true';checkbox.setAttribute('aria-checked',String(on));checkbox.dataset.state=on?'checked':'default';return;}
          var toggle=event.target.closest('[data-component="toggle"]');if(toggle&&!toggle.disabled&&!toggle.classList.contains('is-preview')){var pressed=toggle.getAttribute('aria-checked')!=='true';toggle.setAttribute('aria-checked',String(pressed));toggle.dataset.pressed=pressed?'on':'off';return;}
          var radio=event.target.closest('[data-component="radio-group"] [role="radio"]');if(radio&&!radio.disabled){selectRadio(radio.closest('[data-component="radio-group"]'),radio,true);}
          var multi=event.target.closest('[data-component="multi-toggle"] [role="radio"]');if(multi&&!multi.disabled&&!multi.closest('[data-component="multi-toggle"]').classList.contains('is-preview')){selectMulti(multi.closest('[data-component="multi-toggle"]'),multi,true);return;}
          var chip=event.target.closest('[data-component="chip"]');if(chip&&!chip.disabled&&!chip.classList.contains('is-preview')){var chipOn=chip.getAttribute('aria-pressed')!=='true';chip.setAttribute('aria-pressed',String(chipOn));chip.dataset.state=chipOn?'selected':'default';return;}
          var filterTrigger=event.target.closest('[data-component="filter-chip"]>.guide-filter-trigger');if(filterTrigger){var filterRoot=filterTrigger.closest('[data-component="filter-chip"]');if(!filterTrigger.disabled&&!filterRoot.classList.contains('is-preview'))toggleFilter(filterRoot,filterRoot.dataset.state!=='selected');return;}
          var option=event.target.closest('[data-component="filter-chip"] [role="option"]');if(option){var optionRoot=option.closest('[data-component="filter-chip"]');if(!optionRoot.classList.contains('is-preview'))chooseFilter(optionRoot,option);}
        });
        function radios(root){return Array.prototype.slice.call(root.querySelectorAll('[role="radio"]:not(:disabled)'));}
        function selectRadio(root,item,focus){radios(root).forEach(function(r){var on=r===item;r.setAttribute('aria-checked',String(on));r.tabIndex=on?0:-1;r.dataset.state=on?'selected':'default';});if(focus)item.focus();}
        function multiItems(root){return Array.prototype.slice.call(root.querySelectorAll('[role="radio"]:not(:disabled)'));}
        function selectMulti(root,item,focus){multiItems(root).forEach(function(r){var on=r===item;r.setAttribute('aria-checked',String(on));r.tabIndex=on?0:-1;r.dataset.state=on?'selected':'default';});if(focus)item.focus();}
        function filterOptions(root){return Array.prototype.slice.call(root.querySelectorAll('[role="option"]'));}
        function toggleFilter(root,open){var trigger=root.querySelector('.guide-filter-trigger'),mobile=root.dataset.break==='mobile',dialog=root.querySelector('.guide-filter-dialog');root.dataset.state=open?'selected':'default';trigger.setAttribute('aria-expanded',String(open));if(dialog)dialog.setAttribute('aria-hidden',String(!open));if(open){var selected=root.querySelector('[role="option"][aria-selected="true"]')||filterOptions(root)[0];if(selected)selected.focus();}else trigger.focus();}
        function chooseFilter(root,option){filterOptions(root).forEach(function(item){var on=item===option;item.setAttribute('aria-selected',String(on));item.tabIndex=on?0:-1;});root.querySelector('.guide-filter-value').textContent=option.textContent.trim();root.dataset.state='complete';root.querySelector('.guide-filter-trigger').setAttribute('aria-expanded','false');var dialog=root.querySelector('.guide-filter-dialog');if(dialog)dialog.setAttribute('aria-hidden','true');root.querySelector('.guide-filter-trigger').focus();}
        document.addEventListener('keydown',function(event){
          var item=event.target.closest('[data-component="radio-group"] [role="radio"]');if(item){var root=item.closest('[data-component="radio-group"]'),list=radios(root),i=list.indexOf(item),next=i;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%list.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i-1+list.length)%list.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=list.length-1;else return;event.preventDefault();selectRadio(root,list[next],true);return;}
          var multi=event.target.closest('[data-component="multi-toggle"] [role="radio"]');if(multi){var multiRoot=multi.closest('[data-component="multi-toggle"]'),multiList=multiItems(multiRoot),mi=multiList.indexOf(multi),mn=mi;if(event.key==='ArrowRight')mn=(mi+1)%multiList.length;else if(event.key==='ArrowLeft')mn=(mi-1+multiList.length)%multiList.length;else if(event.key==='Home')mn=0;else if(event.key==='End')mn=multiList.length-1;else return;event.preventDefault();selectMulti(multiRoot,multiList[mn],true);return;}
          var trigger=event.target.closest('[data-component="filter-chip"]>.guide-filter-trigger');if(trigger&&(event.key==='ArrowDown'||event.key==='ArrowUp')){event.preventDefault();toggleFilter(trigger.closest('[data-component="filter-chip"]'),true);return;}
          var option=event.target.closest('[data-component="filter-chip"] [role="option"]');if(option){var filterRoot=option.closest('[data-component="filter-chip"]'),options=filterOptions(filterRoot),oi=options.indexOf(option),on=oi;if(event.key==='ArrowDown')on=(oi+1)%options.length;else if(event.key==='ArrowUp')on=(oi-1+options.length)%options.length;else if(event.key==='Enter'||event.key===' '){event.preventDefault();chooseFilter(filterRoot,option);return;}else if(event.key==='Escape'){event.preventDefault();toggleFilter(filterRoot,false);return;}else return;event.preventDefault();options[on].focus();return;}
          if(event.key==='Escape'){var open=event.target.closest('[data-component="filter-chip"][data-state="selected"]');if(open){event.preventDefault();toggleFilter(open,false);}}
        });
      })();
      </script>`;
}

module.exports = { selectionData, cssFor, extendedCssFor, section, multiToggleSection, chipSection, filterChipSection, interactionScript, PANE_IDS };
