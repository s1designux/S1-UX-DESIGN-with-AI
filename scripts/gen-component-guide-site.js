#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const selectionGuide = require('./lib/component-guide-selection');
const formGuide = require('./lib/component-guide-form');
const tableNavigationGuide = require('./lib/component-guide-table-navigation');
const componentStubs = require('./gen-component-stubs');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_MODEL = path.join(ROOT, 'registry/components/component-guide-model.json');
const DEFAULT_META = path.join(ROOT, 'registry/components/tab.json');
const DEFAULT_HTML = path.join(ROOT, 'pages/components.html');
const DEFAULT_TEMPLATE = path.join(ROOT, 'scripts/templates/components-page.html');
const DEFAULT_STUBS = path.join(ROOT, 'data/component-element-stubs.json');

const TEMPLATE_SLOTS = {
  css: '{{GENERATED_COMPONENT_CSS}}',
  sections: '{{GENERATED_COMPONENT_SECTIONS}}',
  stubs: '{{GENERATED_STUB_SECTIONS}}',
  runtime: '{{GENERATED_COMPONENT_RUNTIME}}',
};

const MARKERS = {
  selectionCss: {
    open: '    /* >>> GEN:COMPONENT-GUIDE:SELECTION-CONTROLS-CSS >>> 자동 생성. 수동 편집 금지. */',
    close: '    /* <<< GEN:COMPONENT-GUIDE:SELECTION-CONTROLS-CSS <<< */',
  },
  selectionExtendedCss: {
    open: '    /* >>> GEN:COMPONENT-GUIDE:SELECTION-EXTENDED-CSS >>> 자동 생성. 수동 편집 금지. */',
    close: '    /* <<< GEN:COMPONENT-GUIDE:SELECTION-EXTENDED-CSS <<< */',
  },
  formCss: {
    open: '    /* >>> GEN:COMPONENT-GUIDE:FORM-CSS >>> 자동 생성. 수동 편집 금지. */',
    close: '    /* <<< GEN:COMPONENT-GUIDE:FORM-CSS <<< */',
  },
  tableNavigationCss: { open: '    /* >>> GEN:COMPONENT-GUIDE:TABLE-NAVIGATION-CSS >>> 자동 생성. 수동 편집 금지. */', close: '    /* <<< GEN:COMPONENT-GUIDE:TABLE-NAVIGATION-CSS <<< */' },
  checkboxSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:CHECKBOX-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:CHECKBOX-SECTION <<< -->',
  },
  radioSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:RADIO-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:RADIO-SECTION <<< -->',
  },
  toggleSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:TOGGLE-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:TOGGLE-SECTION <<< -->',
  },
  multiToggleSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:MULTI-TOGGLE-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:MULTI-TOGGLE-SECTION <<< -->',
  },
  chipSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:CHIP-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:CHIP-SECTION <<< -->',
  },
  filterChipSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:FILTER-CHIP-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:FILTER-CHIP-SECTION <<< -->',
  },
  inputSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:INPUT-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:INPUT-SECTION <<< -->' },
  textareaSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:TEXTAREA-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:TEXTAREA-SECTION <<< -->' },
  selectSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:SELECT-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:SELECT-SECTION <<< -->' },
  dropdownSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:DROPDOWN-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:DROPDOWN-SECTION <<< -->' },
  datePickerSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:DATE-PICKER-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:DATE-PICKER-SECTION <<< -->' },
  timePickerSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:TIME-PICKER-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:TIME-PICKER-SECTION <<< -->' },
  tableSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:TABLE-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:TABLE-SECTION <<< -->' },
  paginationSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:PAGINATION-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:PAGINATION-SECTION <<< -->' },
  gnbSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:GNB-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:GNB-SECTION <<< -->' },
  mobileBottomNavSection: { open: '      <!-- >>> GEN:COMPONENT-GUIDE:MOBILE-BOTTOM-NAV-SECTION >>> 자동 생성. 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-GUIDE:MOBILE-BOTTOM-NAV-SECTION <<< -->' },
  stubs: { open: '      <!-- >>> GEN:COMPONENT-STUBS >>> 자동 생성 (npm run stubs:gen). 수동 편집 금지. -->', close: '      <!-- <<< GEN:COMPONENT-STUBS <<< -->' },
  buttonCss: {
    open: '    /* >>> GEN:COMPONENT-GUIDE:BUTTON-CSS >>> 자동 생성. 수동 편집 금지. */',
    close: '    /* <<< GEN:COMPONENT-GUIDE:BUTTON-CSS <<< */',
  },
  css: {
    open: '    /* >>> GEN:COMPONENT-GUIDE:LINE-TAB-CSS >>> 자동 생성. 수동 편집 금지. */',
    close: '    /* <<< GEN:COMPONENT-GUIDE:LINE-TAB-CSS <<< */',
  },
  section: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:LINE-TAB-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:LINE-TAB-SECTION <<< -->',
  },
  buttonSection: {
    open: '      <!-- >>> GEN:COMPONENT-GUIDE:BUTTON-SECTION >>> 자동 생성. 수동 편집 금지. -->',
    close: '      <!-- <<< GEN:COMPONENT-GUIDE:BUTTON-SECTION <<< -->',
  },
};

function valueAfter(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function esc(value) {
  return String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
}

function slug(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function cssVar(token) {
  return token && !/^\(|\?/.test(token) ? `var(--${token.replace(/\//g, '-')})` : 'transparent';
}

function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children || []) {
    const hit = findNode(child, predicate);
    if (hit) return hit;
  }
  return null;
}

function tabSpec(variant) {
  const label = findNode(variant.node, (node) => node.name === 'label');
  const text = findNode(variant.node, (node) => node.type === 'TEXT');
  const indicator = findNode(variant.node, (node) => node.type === 'RECTANGLE' && node.layout && node.layout.layoutAlign === 'STRETCH');
  return {
    break: variant.axes.Break,
    size: variant.axes.Size,
    state: variant.axes.State,
    height: variant.node.dimensions.height,
    widthSizing: variant.node.layout.counterAxisSizingMode,
    paddingLeft: label && label.layout.padding.left,
    paddingRight: label && label.layout.padding.right,
    fontSize: text && text.text.fontSize,
    fontStyle: text && text.text.fontStyle,
    textStyleId: text && text.text.textStyleId,
    textAutoResize: text && text.text.textAutoResize,
    labelSizing: label && label.layout.primaryAxisSizingMode,
    indicatorHeight: indicator && indicator.dimensions.height,
    indicatorSizing: indicator && indicator.layout.layoutAlign,
    labelToken: text && text.appearance.fill,
    indicatorToken: indicator && indicator.appearance.fill,
  };
}

function getLineTabData(model) {
  const cellSet = model.componentSets.find((set) => set.name === 'Line Tab');
  const composedSet = model.componentSets.find((set) => set.name === 'Line Tab Set');
  if (!cellSet || !composedSet) throw new Error('component guide model에 Line Tab / Line Tab Set이 없습니다.');
  const specs = cellSet.variants.map(tabSpec);
  const platformOrder = cellSet.axes.Break || [];
  const sizeOrderByPlatform = {};
  for (const platform of platformOrder) {
    sizeOrderByPlatform[platform] = (composedSet.variants || [])
      .filter((variant) => variant.axes.Break === platform)
      .map((variant) => variant.axes.Size);
  }
  return { cellSet, composedSet, specs, platformOrder, sizeOrderByPlatform };
}

function assertLineTab(data) {
  const { cellSet, composedSet, specs } = data;
  const errors = [];
  const stateCount = (cellSet.axes.State || []).length;
  const sizeCombos = new Set(specs.map((spec) => `${spec.break}/${spec.size}`)).size;
  if (cellSet.variantCount !== sizeCombos * stateCount) errors.push(`Line Tab variant ${cellSet.variantCount}개 (축 조합 기대 ${sizeCombos * stateCount})`);
  if (composedSet.variantCount !== sizeCombos) errors.push(`Line Tab Set variant ${composedSet.variantCount}개 (플랫폼/사이즈 조합 기대 ${sizeCombos})`);
  const xsm = specs.find((spec) => spec.break === 'PC' && spec.size === 'XSM' && spec.state === 'Selected');
  if (!xsm) errors.push('PC/XSM/Selected 없음');
  else {
    if (xsm.height !== 40) errors.push(`XSM 높이 ${xsm.height} (기대 40)`);
    if (xsm.fontSize !== 14 || xsm.fontStyle !== 'Medium' || xsm.textStyleId !== 'body/14M') errors.push('XSM 타이포가 body/14M이 아님');
    if (xsm.paddingLeft !== 16 || xsm.paddingRight !== 16) errors.push('XSM 좌우 패딩이 16이 아님');
    if (xsm.textAutoResize !== 'WIDTH_AND_HEIGHT' || xsm.labelSizing !== 'AUTO') errors.push('XSM 텍스트/라벨이 HUG가 아님');
    if (xsm.indicatorSizing !== 'STRETCH' || xsm.indicatorHeight !== 2) errors.push('XSM 선택 인디케이터가 STRETCH 2px가 아님');
  }
  if (errors.length) throw new Error(`Line Tab 정본 검증 실패:\n- ${errors.join('\n- ')}`);
}

function getSet(model, name) {
  const set = model.componentSets.find((item) => item.name === name);
  if (!set) throw new Error(`component guide model에 ${name} 세트가 없습니다.`);
  return set;
}

function unique(values) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function buttonData(model) {
  const set = getSet(model, 'Button');
  const variants = set.variants;
  const combinations = unique(variants.map((item) => `${item.axes.Break}/${item.axes.Size}`));
  const expected = combinations.length * (set.axes.State || []).length * (set.axes.Variant || []).length;
  if (set.variantCount !== expected) throw new Error(`Button variant ${set.variantCount}개 (축 조합 기대 ${expected})`);
  return {
    set,
    platforms: set.axes.Break || [],
    states: set.axes.State || [],
    variants: set.axes.Variant || [],
    sizesByPlatform: Object.fromEntries((set.axes.Break || []).map((platform) => [
      platform,
      unique(variants.filter((item) => item.axes.Break === platform).map((item) => item.axes.Size)),
    ])),
  };
}

function lengthValue(node, direct, boundName, fallback = null) {
  if (direct != null) return `${direct}px`;
  const token = node.boundVariables && node.boundVariables[boundName];
  return token ? cssVar(token) : fallback;
}

function buttonDeclarations(variant) {
  const node = variant.node;
  const text = findNode(node, (item) => item.type === 'TEXT');
  const appearance = node.appearance || {};
  const padding = node.layout.padding || {};
  const strokeWidth = lengthValue(node, appearance.strokeWeight, 'strokeWeight', '0px');
  const radius = lengthValue(node, appearance.cornerRadius, 'cornerRadius', null)
    || lengthValue(node, appearance.topLeftRadius, 'topLeftRadius', '0px');
  const fontWeight = text && text.text.fontStyle === 'Medium' ? 500 : text && text.text.fontStyle === 'Bold' ? 700 : 400;
  const styleFontSize = text && text.text.textStyleId && /\/(\d+)/.exec(text.text.textStyleId);
  const declarations = [
    `height:${node.dimensions.height}px`,
    node.layout.minWidth != null ? `min-width:${node.layout.minWidth}px` : null,
    `padding:${lengthValue(node, padding.top, 'paddingTop', '0px')} ${lengthValue(node, padding.right, 'paddingRight', '0px')} ${lengthValue(node, padding.bottom, 'paddingBottom', '0px')} ${lengthValue(node, padding.left, 'paddingLeft', '0px')}`,
    `background:${cssVar(appearance.fill)}`,
    `border:${strokeWidth} solid ${cssVar(appearance.stroke)}`,
    radius ? `border-radius:${radius}` : null,
    text ? `color:${cssVar(text.appearance.fill)}` : null,
    text && (text.text.fontSize || styleFontSize) ? `font-size:${text.text.fontSize || Number(styleFontSize[1])}px` : null,
    `font-weight:${fontWeight}`,
  ].filter(Boolean).join(';');
  return declarations;
}

function buttonSelector(variant, state = variant.axes.State) {
  return `.component-guide-button[data-break="${slug(variant.axes.Break)}"][data-size="${slug(variant.axes.Size)}"][data-variant="${slug(variant.axes.Variant)}"][data-state="${slug(state)}"]`;
}

function buttonRule(variant) {
  return `    ${buttonSelector(variant)} { ${buttonDeclarations(variant)}; }`;
}

function buttonCssFor(data) {
  const interactive = data.set.variants.filter((item) => item.axes.State === 'Default').flatMap((base) => {
    const sibling = (state) => data.set.variants.find((item) => item.axes.Break === base.axes.Break && item.axes.Size === base.axes.Size && item.axes.Variant === base.axes.Variant && item.axes.State === state);
    const hover = sibling('Hover'), pressed = sibling('Pressed'), disabled = sibling('Disabled');
    return [
      hover ? `    ${buttonSelector(base)}:not(:disabled):hover { ${buttonDeclarations(hover)}; }` : '',
      pressed ? `    ${buttonSelector(base)}:not(:disabled):active { ${buttonDeclarations(pressed)}; }` : '',
      disabled ? `    ${buttonSelector(base)}:disabled { ${buttonDeclarations(disabled)}; }` : '',
    ].filter(Boolean);
  });
  return `    .component-guide-button { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; width:max-content; line-height:var(--line-height-130); white-space:nowrap; cursor:pointer; }
    .component-guide-button.is-preview { pointer-events:none; }
    .component-guide-button:disabled { cursor:default; }
${data.set.variants.map(buttonRule).join('\n')}
${interactive.join('\n')}`;
}

function buttonClasses(meta, variantName, sizeName) {
  const config = meta.guide.classInterface;
  const variantClass = `${config.variantPrefix}${slug(variantName)}`;
  const alias = Object.prototype.hasOwnProperty.call(config.sizeAliases, sizeName)
    ? config.sizeAliases[sizeName]
    : slug(sizeName);
  return [config.base, variantClass, alias ? `${config.sizePrefix}${alias}` : '', 'component-guide-button'].filter(Boolean).join(' ');
}

function buttonMarkup(meta, axes, options = {}) {
  const state = axes.State || 'Default';
  const disabled = state === 'Disabled';
  const stateClass = state === 'Default' ? '' : ` is-${slug(state)}`;
  return `<button type="button" class="${buttonClasses(meta, axes.Variant, axes.Size)}${options.preview ? ` is-preview${stateClass}` : ''}" data-guide-component="button" data-break="${slug(axes.Break)}" data-size="${slug(axes.Size)}" data-variant="${slug(axes.Variant)}" data-state="${slug(state)}"${options.action ? ' data-guide-action="invoke-count"' : ''}${disabled ? ' disabled' : ''}>${esc(meta.guide.sampleLabels[0])}</button>`;
}

function buttonTokenRows(data, variantName) {
  const matching = data.set.variants.filter((item) => item.axes.Variant === variantName);
  const tokens = [];
  for (const item of matching) {
    const text = findNode(item.node, (node) => node.type === 'TEXT');
    for (const [role, token] of [['background', item.node.appearance.fill], ['border', item.node.appearance.stroke], ['label', text && text.appearance.fill]]) {
      if (!token || token.startsWith('(') || tokens.some((entry) => entry.token === token && entry.role === role)) continue;
      tokens.push({ token, role });
    }
  }
  return tokens.map((entry) => `                <tr><td class="token-name">--${esc(entry.token.replace(/\//g, '-'))}</td><td class="token-value">${esc(entry.token)}</td><td>${entry.role}</td></tr>`).join('\n');
}

function buttonSectionFor(data, meta, css) {
  const sizeCoverage = unique(data.platforms.flatMap((platform) => data.sizesByPlatform[platform])).map(slug);
  const description = meta._meta.description.replace(/\b(?:PC|Mobile)\b[^.]*\.?/g, '').trim() || '사용자가 실행할 동작을 시작하는 버튼.';
  const pane = (variantName) => (meta.guide.classInterface.paneAliases[variantName] || slug(variantName));
  const matrix = (variantName, platform) => {
    const sizes = data.sizesByPlatform[platform];
    const action = sizes.map((size) => {
      const axes = { Break: platform, Size: size, Variant: variantName, State: 'Default' };
      const spec = data.set.variants.find((item) => Object.entries(axes).every(([key, value]) => item.axes[key] === value));
      const text = findNode(spec.node, (node) => node.type === 'TEXT');
      return `                  <div class="btn-action-item"><div class="matrix-row-label">${esc(size)}<span>h${spec.node.dimensions.height} · ${esc(text.text.textStyleId)}</span></div><div data-guide-action-cell>${buttonMarkup(meta, axes, { action: true })}<span class="action-click-count">Clicks: <span data-guide-click-count>0</span></span></div></div>`;
    }).join('\n');
    const rows = sizes.map((size) => `                <div class="matrix-row-label">${esc(size)}</div>\n${data.states.map((state) => `                <div class="matrix-cell">${buttonMarkup(meta, { Break: platform, Size: size, Variant: variantName, State: state }, { preview: true })}</div>`).join('\n')}`).join('\n');
    return `              <div class="platform-section platform-section-${platform === 'Mobile' ? 'mobile' : 'pc'}">
                <div class="comp-action-top" data-guide-action-group="button"><div class="btn-action-row">${action}</div><button type="button" class="action-mini-toggle" data-guide-disable-group>Disabled: off</button></div>
                <div class="comp-state-matrix" style="grid-template-columns:auto repeat(${data.states.length},minmax(120px,1fr));"><div></div>${data.states.map((state) => `<div class="matrix-col-header">${esc(state)}</div>`).join('')}${rows}</div>
              </div>`;
  };
  const codeBlock = (variantName) => {
    const prefix = pane(variantName);
    const pc = data.sizesByPlatform.PC.map((size) => buttonMarkup(meta, { Break: 'PC', Size: size, Variant: variantName, State: 'Default' })).join('\n');
    const mobile = data.sizesByPlatform.Mobile.map((size) => buttonMarkup(meta, { Break: 'Mobile', Size: size, Variant: variantName, State: 'Default' })).join('\n');
    const rules = data.set.variants.filter((item) => item.axes.Variant === variantName).map(buttonRule).join('\n');
    return `          <div class="code-block">
            <div class="code-tabs"><button class="code-tab active" data-platform="pc" onclick="switchTab(this,'btn-${prefix}-pc')">HTML</button><button class="code-tab" data-platform="mobile" onclick="switchTab(this,'btn-${prefix}-mo')">HTML</button><button class="code-tab" onclick="switchTab(this,'btn-${prefix}-css')">CSS Token</button><button class="code-tab" onclick="switchTab(this,'btn-${prefix}-tokens')">Token Details</button><button class="code-copy-btn" onclick="copyCode('btn-${prefix}-pc-pre')">복사</button></div>
            <div class="code-pane active" id="btn-${prefix}-pc"><pre id="btn-${prefix}-pc-pre">${highlightedCode(pc)}</pre></div>
            <div class="code-pane" id="btn-${prefix}-mo"><pre id="btn-${prefix}-mo-pre">${highlightedCode(mobile)}</pre></div>
            <div class="code-pane" id="btn-${prefix}-css"><pre>${highlightedCode(rules)}</pre></div>
            <div class="code-pane" id="btn-${prefix}-tokens"><table class="token-detail-table"><thead><tr><th>CSS Token</th><th>Figma Variable</th><th>Role</th></tr></thead><tbody>\n${buttonTokenRows(data, variantName)}\n              </tbody></table></div>
          </div>`;
  };
  const blocks = data.variants.map((variantName) => `        <div class="variant-block"><div class="variant-label">${esc(variantName)}</div><div class="preview-area" style="display:flex;flex-direction:column;gap:24px;">\n${data.platforms.map((platform) => matrix(variantName, platform)).join('\n')}\n          </div>\n${codeBlock(variantName)}\n        </div>`).join('\n');
  return `      <section class="comp-section is-active" id="button" data-cov-states="${data.states.map(slug).join(',')}" data-cov-sizes="${sizeCoverage.join(',')}" data-cov-variants="${data.variants.map(slug).join(',')}">
        <div class="comp-section-header"><h2 class="comp-section-title">Button</h2><span class="comp-badge comp-badge-blue">Core</span><span class="comp-badge">${data.set.variantCount} variants</span><span class="comp-badge">interactive</span></div>
        <p class="variant-group-desc">${esc(description)}</p>
${blocks}
        <script>
        ;(function setupGeneratedButtons() {
          document.addEventListener('click', function(event) {
            var action = event.target.closest('[data-guide-action="invoke-count"]');
            if (action && !action.disabled) { var count = action.closest('[data-guide-action-cell]').querySelector('[data-guide-click-count]'); count.textContent = String(Number(count.textContent) + 1); return; }
            var toggle = event.target.closest('[data-guide-disable-group]'); if (!toggle) return;
            var group = toggle.closest('[data-guide-action-group="button"]'), next = toggle.textContent.indexOf('off') >= 0;
            group.querySelectorAll('[data-guide-action="invoke-count"]').forEach(function(button) { button.disabled = next; button.dataset.state = next ? 'disabled' : 'default'; });
            toggle.textContent = 'Disabled: ' + (next ? 'on' : 'off');
          });
        })();
        </script>
      </section>`;
}

function cssFor(data) {
  const representative = data.specs[0];
  const state = Object.fromEntries(data.specs
    .filter((spec) => spec.break === representative.break && spec.size === representative.size)
    .map((spec) => [spec.state, spec]));
  const sizeRules = [];
  for (const platform of data.platformOrder) {
    for (const size of data.sizeOrderByPlatform[platform] || []) {
      const spec = data.specs.find((item) => item.break === platform && item.size === size && item.state === 'Unselected');
      if (!spec) continue;
      const modifier = platform === 'Mobile' ? 'mobile' : `${slug(platform)}-${slug(size)}`;
      sizeRules.push(`    .s1-tab--${modifier} .s1-tab-item { height:${spec.height}px; padding:0 ${spec.paddingRight}px 0 ${spec.paddingLeft}px; font-size:${spec.fontSize}px; }`);
    }
  }
  return `    .s1-tab { position:relative; display:inline-flex; align-items:flex-end; gap:0; border-bottom:${state.Unselected.indicatorHeight}px solid ${cssVar(state.Unselected.indicatorToken)}; }
    .s1-tab-item { position:relative; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; color:${cssVar(state.Unselected.labelToken)}; background:none; border:0; border-bottom:${state.Unselected.indicatorHeight}px solid transparent; margin-bottom:-${state.Unselected.indicatorHeight}px; font-weight:var(--font-weight-medium); line-height:var(--line-height-130); white-space:nowrap; cursor:pointer; }
    .s1-tab-item:not(.is-disabled):not(.is-preview):hover,
    .s1-tab-item.is-hover { color:${cssVar(state.Hover.labelToken)}; border-bottom:${state.Hover.indicatorHeight}px solid ${cssVar(state.Hover.indicatorToken)}; }
    .s1-tab-item.is-selected { color:${cssVar(state.Selected.labelToken)}; border-bottom:${state.Selected.indicatorHeight}px solid ${cssVar(state.Selected.indicatorToken)}; }
    .s1-tab-item.is-preview { pointer-events:none; }
    .s1-tab-indicator { position:absolute; left:0; bottom:-${state.Unselected.indicatorHeight}px; width:0; height:${state.Selected.indicatorHeight}px; background:${cssVar(state.Selected.indicatorToken)}; transition:left .18s ease,width .18s ease; pointer-events:none; }
    .s1-tab.has-sliding-indicator .s1-tab-item { border-bottom-color:transparent; }
${sizeRules.join('\n')}`;
}

function tabStrip(platform, size, labels, selectedIndex = 0) {
  const modifier = platform === 'Mobile' ? 'mobile' : `${slug(platform)}-${slug(size)}`;
  const label = `${platform} ${size} Line Tab`;
  return `<div class="s1-tab s1-tab--${modifier}" data-component="line-tab" role="tablist" aria-label="${esc(label)}">
${labels.map((text, index) => `  <button class="s1-tab-item${index === selectedIndex ? ' is-selected' : ''}" type="button" role="tab" aria-selected="${index === selectedIndex}" tabindex="${index === selectedIndex ? '0' : '-1'}">${esc(text)}</button>`).join('\n')}
</div>`;
}

function highlightedCode(code) {
  return esc(code);
}

function sectionFor(data, meta, css) {
  const labels = (meta.guide && meta.guide.sampleLabels) || ['메뉴1', '메뉴2', '메뉴3'];
  const states = data.cellSet.axes.State || [];
  const pcSizes = data.sizeOrderByPlatform.PC || [];
  const mobileSizes = data.sizeOrderByPlatform.Mobile || [];
  const allSizeNames = pcSizes.map((size) => size.toLowerCase()).concat(mobileSizes.length ? ['mobile'] : []);
  const action = (platform, sizes) => sizes.map((size) => {
    const spec = data.specs.find((item) => item.break === platform && item.size === size && item.state === 'Unselected');
    return `                    <div class="btn-action-item">
                      <div class="matrix-row-label">${esc(size)}<span>h${spec.height} · ${spec.textStyleId}</span></div>
                      ${tabStrip(platform, size, labels)}
                    </div>`;
  }).join('\n');
  const stateCells = (platform, size) => states.map((stateName, index) => {
    const spec = data.specs.find((item) => item.break === platform && item.size === size && item.state === stateName);
    const stateClass = stateName === 'Selected' ? ' is-selected' : stateName === 'Hover' ? ' is-hover' : '';
    return `                <div class="comp-state-cell"><span class="s1-tab-item is-preview${stateClass} s1-tab--${platform === 'Mobile' ? 'mobile' : `${slug(platform)}-${slug(size)}`}" style="height:${spec.height}px;padding:0 ${spec.paddingRight}px;font-size:${spec.fontSize}px;">${esc(labels[index % labels.length])}</span></div>`;
  }).join('\n');
  const htmlPc = pcSizes.map((size) => tabStrip('PC', size, labels)).join('\n\n');
  const htmlMobile = mobileSizes.map((size) => tabStrip('Mobile', size, labels)).join('\n\n');
  const observedTokens = [...new Set(data.specs.flatMap((spec) => [spec.labelToken, spec.indicatorToken]).filter((token) => token && !token.startsWith('(')))];
  const descriptions = new Map((meta.tokens || []).map((token) => [token.figmaVariable, token.description]));
  const tokenRows = observedTokens.map((token) => `              <tr><td class="token-name">--${esc(token.replace(/\//g, '-'))}</td><td class="token-value">${esc(token)}</td><td>${esc(descriptions.get(token) || '정본 컴포넌트 바인딩')}</td></tr>`).join('\n');
  const keyboard = meta.guide && meta.guide.accessibility ? meta.guide.accessibility.keyboard.join(' · ') : 'ArrowLeft/Right · Home/End';
  return `      <section class="comp-section" id="tab" data-cov-sizes="${allSizeNames.join(',')}" data-cov-states="${states.map(slug).join(',')}">
        <div class="comp-section-header">
          <h2 class="comp-section-title">${esc(meta._meta.name)}</h2>
          <span class="comp-badge comp-badge-blue">Core</span>
          <span class="comp-badge"><span class="platform-only-pc">${pcSizes.length} sizes</span><span class="platform-only-mobile">${mobileSizes.length} size</span></span>
          <span class="comp-badge">interactive</span>
        </div>
        <p class="variant-group-desc">${esc(meta._meta.description)} 키보드: ${esc(keyboard)}</p>
        <div class="variant-block">
          <div class="variant-label">States</div>
          <div class="preview-area" style="display:flex;flex-direction:column;gap:0;padding:0;overflow-x:auto;">
            <div class="platform-section platform-section-pc" style="padding:20px;">
              <div class="comp-state-matrix" style="grid-template-columns:260px repeat(${states.length},minmax(140px,1fr));">
                <div class="matrix-col-header-action">Action · Sizes</div>
${states.map((state) => `                <div class="matrix-col-header">${esc(state)}</div>`).join('\n')}
                <div class="comp-action-cell" data-comp-action="tab"><div class="btn-action-row">
${action('PC', pcSizes)}
                </div></div>
${stateCells('PC', pcSizes[0])}
              </div>
            </div>
            <div class="platform-section platform-section-mobile" style="padding:20px;">
              <div class="comp-state-matrix" style="grid-template-columns:260px repeat(${states.length},minmax(140px,1fr));">
                <div class="matrix-col-header-action">Action · Sizes</div>
${states.map((state) => `                <div class="matrix-col-header">${esc(state)}</div>`).join('\n')}
                <div class="comp-action-cell" data-comp-action="tab-mobile"><div class="btn-action-row">
${action('Mobile', mobileSizes)}
                </div></div>
${stateCells('Mobile', mobileSizes[0])}
              </div>
            </div>
          </div>
        </div>
        <div class="code-block">
          <div class="code-tabs">
            <button class="code-tab active" data-platform="pc" onclick="switchTab(this,'tab-pc-html')">HTML</button>
            <button class="code-tab" data-platform="mobile" onclick="switchTab(this,'tab-mo-html')">HTML</button>
            <button class="code-tab" onclick="switchTab(this,'tab-css')">CSS</button>
            <button class="code-tab" onclick="switchTab(this,'tab-tokens')">Token Details</button>
            <button class="code-copy-btn" onclick="copyCode('tab-pc-html-pre')">복사</button>
          </div>
          <div class="code-pane active" id="tab-pc-html"><pre id="tab-pc-html-pre">${highlightedCode(htmlPc)}</pre></div>
          <div class="code-pane" id="tab-mo-html"><pre id="tab-mo-html-pre">${highlightedCode(htmlMobile)}</pre></div>
          <div class="code-pane" id="tab-css"><pre id="tab-css-pre">${highlightedCode(css)}</pre></div>
          <div class="code-pane" id="tab-tokens">
            <table class="token-detail-table"><thead><tr><th>CSS Token</th><th>Figma Variable</th><th>Role</th></tr></thead><tbody>
${tokenRows}
            </tbody></table>
          </div>
        </div>
        <script>
        ;(function setupGeneratedLineTabs() {
          function tabs(root) { return Array.prototype.slice.call(root.querySelectorAll('[role="tab"]')); }
          function place(root, tab, animate) {
            var indicator = root.querySelector('.s1-tab-indicator');
            if (!indicator) return;
            if (!animate) indicator.style.transition = 'none';
            indicator.style.left = tab.offsetLeft + 'px'; indicator.style.width = tab.offsetWidth + 'px';
            if (!animate) requestAnimationFrame(function() { indicator.style.transition = ''; });
          }
          function select(root, tab, focus) {
            tabs(root).forEach(function(item) {
              var selected = item === tab;
              item.classList.toggle('is-selected', selected);
              item.setAttribute('aria-selected', String(selected));
              item.setAttribute('tabindex', selected ? '0' : '-1');
              var panel = item.getAttribute('aria-controls') && document.getElementById(item.getAttribute('aria-controls'));
              if (panel) panel.hidden = !selected;
            });
            root.classList.add('has-sliding-indicator'); place(root, tab, true); if (focus) tab.focus();
          }
          document.querySelectorAll('[data-component="line-tab"]').forEach(function(root, rootIndex) {
            if (root.dataset.lineTabReady) return;
            root.dataset.lineTabReady = 'true';
            var indicator = document.createElement('span'); indicator.className = 's1-tab-indicator'; indicator.setAttribute('aria-hidden', 'true'); root.appendChild(indicator);
            tabs(root).forEach(function(tab, tabIndex) {
              var panelId = 'line-tab-panel-' + rootIndex + '-' + tabIndex;
              tab.id = tab.id || 'line-tab-' + rootIndex + '-' + tabIndex; tab.setAttribute('aria-controls', panelId);
              var panel = document.createElement('div'); panel.id = panelId; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tab.id); panel.hidden = tab.getAttribute('aria-selected') !== 'true'; panel.className = 'visually-hidden';
              root.insertAdjacentElement('afterend', panel);
            });
            var current = root.querySelector('[aria-selected="true"]') || tabs(root)[0]; if (current) place(root, current, false);
          });
          document.addEventListener('click', function(event) {
            var tab = event.target.closest('[data-component="line-tab"] [role="tab"]'); if (!tab) return;
            select(tab.closest('[data-component="line-tab"]'), tab, false);
          });
          document.addEventListener('keydown', function(event) {
            var tab = event.target.closest('[data-component="line-tab"] [role="tab"]'); if (!tab) return;
            var root = tab.closest('[data-component="line-tab"]'), items = tabs(root), index = items.indexOf(tab), next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % items.length;
            else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = items.length - 1;
            else return;
            event.preventDefault(); select(root, items[next], true);
          });
          window.addEventListener('resize', function() { document.querySelectorAll('[data-component="line-tab"]').forEach(function(root) { var selected = root.querySelector('[aria-selected="true"]'); if (selected) place(root, selected, false); }); });
        })();
        </script>
      </section>`;
}

function replaceMarked(source, marker, content) {
  const openIndex = source.indexOf(marker.open);
  const closeIndex = source.indexOf(marker.close);
  if (openIndex < 0 || closeIndex < openIndex) throw new Error(`생성 마커를 찾지 못했습니다: ${marker.open}`);
  return source.slice(0, openIndex) + marker.open + '\n' + content + '\n' + marker.close + source.slice(closeIndex + marker.close.length);
}

function seedMarkers(source) {
  let next = source;
  if (!next.includes(MARKERS.stubs.open) && next.includes(MARKERS.stubs.close)) {
    const firstStub = /[ \t]*<section class="comp-section" id="line-tab"/.exec(next);
    if (!firstStub) throw new Error('COMPONENT-STUBS 시작 구간을 복구할 기준 섹션을 찾지 못했습니다.');
    next = next.slice(0, firstStub.index) + MARKERS.stubs.open + '\n' + next.slice(firstStub.index);
  }
  if (!next.includes(MARKERS.selectionCss.open)) {
    const start = next.indexOf('    /* Checkbox */');
    const end = next.indexOf('    /* Chip ', start);
    if (start < 0 || end < 0) throw new Error('Checkbox/Radio/Toggle CSS 초기 구간을 찾지 못했습니다.');
    next = next.slice(0, start) + MARKERS.selectionCss.open + '\n' + MARKERS.selectionCss.close + '\n\n' + next.slice(end);
  }
  if (!next.includes(MARKERS.selectionExtendedCss.open)) {
    const afterSelection = next.indexOf(MARKERS.selectionCss.close);
    const start = next.indexOf('    /* Chip ', afterSelection);
    const end = next.indexOf('    /* Input */', start);
    if (start < 0 || end < 0) throw new Error('Multi Toggle/Chip/Filter Chip CSS 초기 구간을 찾지 못했습니다.');
    next = next.slice(0, start) + MARKERS.selectionExtendedCss.open + '\n' + MARKERS.selectionExtendedCss.close + '\n\n' + next.slice(end);
  }
  if (!next.includes(MARKERS.formCss.open)) {
    const at = next.indexOf(MARKERS.selectionExtendedCss.close) + MARKERS.selectionExtendedCss.close.length;
    if (at < MARKERS.selectionExtendedCss.close.length) throw new Error('Form CSS 삽입 기준 마커를 찾지 못했습니다.');
    next = next.slice(0, at) + '\n\n' + MARKERS.formCss.open + '\n' + MARKERS.formCss.close + next.slice(at);
  }
  if (!next.includes(MARKERS.tableNavigationCss.open)) {
    const at = next.indexOf(MARKERS.formCss.close) + MARKERS.formCss.close.length;
    if (at < MARKERS.formCss.close.length) throw new Error('Table/Navigation CSS 삽입 기준 마커를 찾지 못했습니다.');
    next = next.slice(0, at) + '\n\n' + MARKERS.tableNavigationCss.open + '\n' + MARKERS.tableNavigationCss.close + next.slice(at);
  }
  if (!next.includes(MARKERS.buttonCss.open)) {
    const start = next.indexOf('    /* Button */');
    const end = next.indexOf('    /* Button: PC/Mobile matrix layout */', start);
    if (start < 0 || end < 0) throw new Error('Button CSS 초기 구간을 찾지 못했습니다.');
    next = next.slice(0, start) + MARKERS.buttonCss.open + '\n' + MARKERS.buttonCss.close + '\n' + next.slice(end);
  }
  if (!next.includes(MARKERS.css.open)) {
    const start = next.indexOf('    /* ── Line Tab ');
    const end = next.indexOf('    /* ── Time Picker ', start);
    if (start < 0 || end < 0) throw new Error('Line Tab CSS 초기 구간을 찾지 못했습니다.');
    next = next.slice(0, start) + MARKERS.css.open + '\n' + MARKERS.css.close + '\n' + next.slice(end);
  }
  if (!next.includes(MARKERS.section.open)) {
    const startMatch = /[ \t]*<section class="comp-section" id="tab"/.exec(next);
    if (!startMatch) throw new Error('id="tab" Line Tab 섹션을 찾지 못했습니다.');
    const start = startMatch.index;
    const nextSection = /[ \t]*<section class="comp-section" id="gnb"/g;
    nextSection.lastIndex = start;
    const endMatch = nextSection.exec(next);
    if (!endMatch) throw new Error('Line Tab 다음 GNB 섹션을 찾지 못했습니다.');
    next = next.slice(0, start) + MARKERS.section.open + '\n' + MARKERS.section.close + '\n\n' + next.slice(endMatch.index);
  }
  if (!next.includes(MARKERS.buttonSection.open)) {
    const startMatch = /[ \t]*<section class="comp-section(?: is-active)?" id="button"/.exec(next);
    if (!startMatch) throw new Error('id="button" Button 섹션을 찾지 못했습니다.');
    const start = startMatch.index;
    const nextSection = /[ \t]*<section class="comp-section" id="textarea"/g;
    nextSection.lastIndex = start;
    const endMatch = nextSection.exec(next);
    if (!endMatch) throw new Error('Button 다음 Textarea 섹션을 찾지 못했습니다.');
    next = next.slice(0, start) + MARKERS.buttonSection.open + '\n' + MARKERS.buttonSection.close + '\n\n' + next.slice(endMatch.index);
  }
  for (const [kind, nextId, markerKey] of [
    ['checkbox', 'radio', 'checkboxSection'],
    ['radio', 'toggle', 'radioSection'],
    ['toggle', 'multi-toggle', 'toggleSection'],
  ]) {
    const marker = MARKERS[markerKey];
    if (next.includes(marker.open)) continue;
    const startMatch = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${kind}"`).exec(next);
    if (!startMatch) throw new Error(`id="${kind}" 섹션을 찾지 못했습니다.`);
    const nextSection = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${nextId}"`, 'g');
    nextSection.lastIndex = startMatch.index;
    const endMatch = nextSection.exec(next);
    if (!endMatch) throw new Error(`${kind} 다음 ${nextId} 섹션을 찾지 못했습니다.`);
    const generatedNext = nextId === 'button' ? MARKERS.buttonSection.open : null;
    const generatedNextIndex = generatedNext ? next.indexOf(generatedNext, startMatch.index) : -1;
    const endIndex = generatedNextIndex >= 0 && generatedNextIndex < endMatch.index ? generatedNextIndex : endMatch.index;
    next = next.slice(0, startMatch.index) + marker.open + '\n' + marker.close + '\n\n' + next.slice(endIndex);
  }
  for (const [kind, nextId, markerKey] of [
    ['multi-toggle', 'input', 'multiToggleSection'],
    ['chip', 'filter-chip', 'chipSection'],
    ['filter-chip', 'button', 'filterChipSection'],
  ]) {
    const marker = MARKERS[markerKey];
    if (next.includes(marker.open)) continue;
    const startMatch = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${kind}"`).exec(next);
    if (!startMatch) throw new Error(`id="${kind}" 섹션을 찾지 못했습니다.`);
    const nextSection = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${nextId}"`, 'g');
    nextSection.lastIndex = startMatch.index;
    const endMatch = nextSection.exec(next);
    if (!endMatch) throw new Error(`${kind} 다음 ${nextId} 섹션을 찾지 못했습니다.`);
    const generatedNext = nextId === 'button' ? MARKERS.buttonSection.open : null;
    const generatedNextIndex = generatedNext ? next.indexOf(generatedNext, startMatch.index) : -1;
    const endIndex = generatedNextIndex >= 0 && generatedNextIndex < endMatch.index ? generatedNextIndex : endMatch.index;
    next = next.slice(0, startMatch.index) + marker.open + '\n' + marker.close + '\n\n' + next.slice(endIndex);
  }
  for (const [kind, nextId, markerKey, nextMarkerKey] of [
    ['input', 'chip', 'inputSection', 'chipSection'],
    ['textarea', 'tab', 'textareaSection', 'section'],
    ['select', 'dropdown', 'selectSection', null],
    ['dropdown', 'table', 'dropdownSection', null],
    ['date-picker', 'time-picker', 'datePickerSection', null],
    ['time-picker', 'line-tab', 'timePickerSection', 'stubs'],
  ]) {
    const marker = MARKERS[markerKey];
    if (next.includes(marker.open)) continue;
    const startMatch = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${kind}"`).exec(next);
    if (!startMatch) throw new Error(`id="${kind}" 섹션을 찾지 못했습니다.`);
    const nextSection = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${nextId}"`, 'g');
    nextSection.lastIndex = startMatch.index;
    const endMatch = nextSection.exec(next);
    if (!endMatch) throw new Error(`${kind} 다음 ${nextId} 섹션을 찾지 못했습니다.`);
    const nextMarkerIndex = nextMarkerKey ? next.indexOf(MARKERS[nextMarkerKey].open, startMatch.index) : -1;
    const endIndex = nextMarkerIndex >= 0 && nextMarkerIndex < endMatch.index ? nextMarkerIndex : endMatch.index;
    next = next.slice(0, startMatch.index) + marker.open + '\n' + marker.close + '\n\n' + next.slice(endIndex);
  }
  for (const [kind, nextId, markerKey, nextMarkerKey] of [
    ['gnb', 'select', 'gnbSection', 'selectSection'],
    ['table', 'pagination', 'tableSection', null],
    ['pagination', 'mobile-bottom-nav', 'paginationSection', null],
    ['mobile-bottom-nav', 'date-picker', 'mobileBottomNavSection', 'datePickerSection'],
  ]) {
    const marker = MARKERS[markerKey];
    if (next.includes(marker.open)) continue;
    const startMatch = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${kind}"`).exec(next);
    if (!startMatch) throw new Error(`id="${kind}" 섹션을 찾지 못했습니다.`);
    const nextSection = new RegExp(`[ \\t]*<section class="comp-section(?: is-active)?" id="${nextId}"`, 'g');
    nextSection.lastIndex = startMatch.index;
    const endMatch = nextSection.exec(next);
    if (!endMatch) throw new Error(`${kind} 다음 ${nextId} 섹션을 찾지 못했습니다.`);
    const nextMarkerIndex = nextMarkerKey ? next.indexOf(MARKERS[nextMarkerKey].open, startMatch.index) : -1;
    const endIndex = nextMarkerIndex >= 0 && nextMarkerIndex < endMatch.index ? nextMarkerIndex : endMatch.index;
    next = next.slice(0, startMatch.index) + marker.open + '\n' + marker.close + '\n\n' + next.slice(endIndex);
  }
  return next;
}

function marked(marker, content) {
  return `${marker.open}\n${content}\n${marker.close}`;
}

function splitRuntime(section) {
  const scripts = [];
  const markup = section.replace(/\s*<script(?:\s[^>]*)?>[\s\S]*?<\/script>/g, (script) => {
    scripts.push(script.trim());
    return '';
  });
  return { markup, scripts };
}

function fillTemplate(template, replacements) {
  let html = template;
  for (const [slot, value] of Object.entries(replacements)) {
    const token = TEMPLATE_SLOTS[slot];
    if (!html.includes(token)) throw new Error(`components page template 슬롯이 없습니다: ${token}`);
    html = html.replace(token, value);
  }
  for (const token of Object.values(TEMPLATE_SLOTS)) if (html.includes(token)) throw new Error(`components page template 슬롯이 중복되었거나 치환되지 않았습니다: ${token}`);
  return html;
}

function generate(template, model, metas, stubData) {
  const tabMeta = metas.tab || metas;
  const buttonMeta = metas.button;
  const selectionMetas = metas.selection || {};
  if (!buttonMeta || !buttonMeta.guide) throw new Error('Button Registry guide 메타가 없습니다.');
  const data = getLineTabData(model);
  assertLineTab(data);
  const css = cssFor(data);
  const section = sectionFor(data, tabMeta, css);
  const buttons = buttonData(model);
  const buttonCss = buttonCssFor(buttons);
  const buttonSection = buttonSectionFor(buttons, buttonMeta, buttonCss);
  const selection = selectionGuide.selectionData(model);
  const selectionCss = selectionGuide.cssFor(selection);
  const selectionExtendedCss = selectionGuide.extendedCssFor(selection);
  const checkboxSection = selectionGuide.section('checkbox', selection.checkbox, selectionMetas.checkbox, selectionCss) + '\n' + selectionGuide.interactionScript();
  const radioSection = selectionGuide.section('radio', selection.radio, selectionMetas.radio, selectionCss);
  const toggleSection = selectionGuide.section('toggle', selection.toggle, selectionMetas.toggle, selectionCss);
  const multiToggleSection = selectionGuide.multiToggleSection(selection, selectionMetas['multi-toggle'], selectionExtendedCss);
  const chipSection = selectionGuide.chipSection(selection, selectionMetas.chip, selectionExtendedCss);
  const filterChipSection = selectionGuide.filterChipSection(selection, selectionMetas['filter-chip'], selectionExtendedCss);
  const formMetas = metas.form || {};
  const form = formGuide.formData(model);
  const formCss = formGuide.cssFor(form);
  const inputSection = formGuide.inputSection(form, formMetas.input, formCss) + '\n' + formGuide.interactionScript();
  const textareaSection = formGuide.textareaSection(form, formMetas.textarea, formCss);
  const selectSection = formGuide.selectSection(form, formMetas.select, formMetas.dropdown, formCss);
  const dropdownSection = formGuide.dropdownSection(form, formMetas.dropdown, formCss);
  const datePickerSection = formGuide.dateSection(form, formMetas['date-picker'], formCss);
  const timePickerSection = formGuide.timeSection(form, formMetas['time-picker'], formCss);
  const tableNavigationMetas = metas.tableNavigation || {};
  const tableNavigation = tableNavigationGuide.dataFor(model);
  const tableNavigationCss = tableNavigationGuide.cssFor(tableNavigation);
  const tableSection = tableNavigationGuide.tableSection(tableNavigation, tableNavigationMetas.table, tableNavigationCss, { form, selectMeta: formMetas.select, dropdownMeta: formMetas.dropdown, paginationMeta: tableNavigationMetas.pagination }) + '\n' + tableNavigationGuide.runtime();
  const paginationSection = tableNavigationGuide.paginationSection(tableNavigation, tableNavigationMetas.pagination, tableNavigationCss);
  const gnbSection = tableNavigationGuide.gnbSection(tableNavigation, tableNavigationMetas.gnb, tableNavigationCss);
  const mobileBottomNavSection = tableNavigationGuide.mobileSection(tableNavigation, tableNavigationMetas['mobile-bottom-nav'], tableNavigationCss);
  const cssBundle = [
    marked(MARKERS.buttonCss, buttonCss), marked(MARKERS.selectionCss, selectionCss),
    marked(MARKERS.selectionExtendedCss, selectionExtendedCss), marked(MARKERS.formCss, formCss),
    marked(MARKERS.tableNavigationCss, tableNavigationCss), marked(MARKERS.css, css),
  ].join('\n');
  const entries = [
    [MARKERS.checkboxSection, checkboxSection], [MARKERS.radioSection, radioSection], [MARKERS.toggleSection, toggleSection],
    [MARKERS.multiToggleSection, multiToggleSection], [MARKERS.inputSection, inputSection], [MARKERS.chipSection, chipSection],
    [MARKERS.filterChipSection, filterChipSection], [MARKERS.buttonSection, buttonSection], [MARKERS.textareaSection, textareaSection],
    [MARKERS.section, section], [MARKERS.gnbSection, gnbSection], [MARKERS.selectSection, selectSection],
    [MARKERS.dropdownSection, dropdownSection], [MARKERS.tableSection, tableSection], [MARKERS.paginationSection, paginationSection],
    [MARKERS.mobileBottomNavSection, mobileBottomNavSection], [MARKERS.datePickerSection, datePickerSection], [MARKERS.timePickerSection, timePickerSection],
  ];
  const runtimes = [];
  const sectionBundle = entries.map(([marker, value]) => {
    const split = splitRuntime(value);
    runtimes.push(...split.scripts);
    return marked(marker, split.markup);
  }).join('\n\n');
  const stubBlock = `${componentStubs.START}\n${componentStubs.buildBlock(stubData.stubs || [])}\n${componentStubs.END}`;
  const runtimeBundle = `<!-- >>> GEN:COMPONENT-GUIDE:RUNTIME >>> 자동 생성. 수동 편집 금지. -->\n${runtimes.join('\n')}\n<!-- <<< GEN:COMPONENT-GUIDE:RUNTIME <<< -->`;
  return fillTemplate(template, { css: cssBundle, sections: sectionBundle, stubs: stubBlock, runtime: runtimeBundle });
}

function selfCheck(html, model) {
  for (const value of ['<!DOCTYPE html>', '../assets/css/style.css', '../assets/css/tokens.css', '../assets/js/main.js', 'data-category-filter="all"', 'data-section="button"', 'Preview Theme', 'Design Mode', "new URLSearchParams(location.search)", 'location.hash.slice(1)', 'GEN:COMPONENT-STUBS', 'GEN:COMPONENT-GUIDE:RUNTIME']) {
    if (!html.includes(value)) throw new Error(`전체 components page template 계약 누락: ${value}`);
  }
  for (const token of Object.values(TEMPLATE_SLOTS)) if (html.includes(token)) throw new Error(`전체 components page template 슬롯 미치환: ${token}`);
  for (const stale of ['chk-action-target', 'radio-action-target', 'toggle-action-target', 'setupCompActionTests']) if (html.includes(stale)) throw new Error(`이전 고정 ID Action runtime 잔존: ${stale}`);
  const data = getLineTabData(model);
  assertLineTab(data);
  const actionCount = (html.match(/data-component="line-tab"/g) || []).length;
  const expectedActions = Object.values(data.sizeOrderByPlatform).reduce((sum, sizes) => sum + sizes.length, 0);
  if (actionCount < expectedActions * 2) throw new Error(`Line Tab Action/코드 예시가 부족합니다: ${actionCount} (최소 ${expectedActions * 2})`);
  for (const value of ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'role="tablist"', 'role="tab"', 'aria-selected', 's1-tab-indicator']) {
    if (!html.includes(value)) throw new Error(`Line Tab 접근성/동작 생성 누락: ${value}`);
  }
  const buttons = buttonData(model);
  for (const size of unique(buttons.platforms.flatMap((platform) => buttons.sizesByPlatform[platform]))) {
    if (!html.includes(`data-size="${slug(size)}"`)) throw new Error(`Button size 생성 누락: ${size}`);
  }
  for (const state of buttons.states) if (!html.includes(`data-state="${slug(state)}"`)) throw new Error(`Button state 생성 누락: ${state}`);
  for (const variant of buttons.variants) if (!html.includes(`data-variant="${slug(variant)}"`)) throw new Error(`Button variant 생성 누락: ${variant}`);
  for (const value of ['data-guide-action="invoke-count"', 'data-guide-disable-group', 'data-guide-click-count', 'GEN:COMPONENT-GUIDE:BUTTON-CSS', 'GEN:COMPONENT-GUIDE:BUTTON-SECTION']) {
    if (!html.includes(value)) throw new Error(`Button 생성/동작 누락: ${value}`);
  }
  const selection = selectionGuide.selectionData(model);
  for (const [kind, set] of [['checkbox', selection.checkbox], ['radio', selection.radio], ['toggle', selection.toggle]]) {
    for (const variant of set.variants) {
      if (!html.includes(esc(variant.name))) throw new Error(`${set.name} variant 생성 누락: ${variant.name}`);
    }
    if (!html.includes(`data-component="${kind}"`)) throw new Error(`${set.name} 자동 탐색 root 누락`);
  }
  for (const [kind, set] of [['multi-toggle-element', selection.multiToggleElement], ['multi-toggle', selection.multiToggle], ['chip', selection.chip], ['filter-chip', selection.filterChip]]) {
    for (const variant of set.variants) if (!html.includes(esc(variant.name))) throw new Error(`${set.name} variant 생성 누락: ${variant.name}`);
    if (!html.includes(`data-component="${kind}"`)) throw new Error(`${set.name} 자동 탐색 root 누락`);
  }
  for (const value of ['GEN:COMPONENT-GUIDE:MULTI-TOGGLE-SECTION', 'GEN:COMPONENT-GUIDE:CHIP-SECTION', 'GEN:COMPONENT-GUIDE:FILTER-CHIP-SECTION', 'role="dialog"', 'role="listbox"', 'aria-haspopup="listbox"', 'aria-expanded', 'aria-pressed', 'data-component="filter-chip"', 'dialog-single-select']) {
    if (!html.includes(value)) throw new Error(`Selection 확장 생성/동작 누락: ${value}`);
  }
  for (const value of ['role="checkbox"', 'role="radiogroup"', 'role="radio"', 'role="switch"', 'aria-checked', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'GEN:COMPONENT-GUIDE:SELECTION-CONTROLS-CSS']) {
    if (!html.includes(value)) throw new Error(`Selection 접근성/동작 생성 누락: ${value}`);
  }
  const form = formGuide.formData(model);
  for (const set of Object.values(form)) for (const variant of set.variants) if (!html.includes(esc(variant.name))) throw new Error(`${set.name} variant 생성 누락: ${variant.name}`);
  for (const value of ['GEN:COMPONENT-GUIDE:INPUT-SECTION', 'GEN:COMPONENT-GUIDE:TEXTAREA-SECTION', 'GEN:COMPONENT-GUIDE:SELECT-SECTION', 'GEN:COMPONENT-GUIDE:DROPDOWN-SECTION', 'GEN:COMPONENT-GUIDE:DATE-PICKER-SECTION', 'GEN:COMPONENT-GUIDE:TIME-PICKER-SECTION', 'data-component="search-input"', 'aria-controls="guide-date-picker-panel-', 'role="gridcell"', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape']) if (!html.includes(value)) throw new Error(`Form 생성/동작 누락: ${value}`);
  const timeBlock = html.slice(html.indexOf(MARKERS.timePickerSection.open), html.indexOf(MARKERS.timePickerSection.close));
  if (/tp-select|timepicker-select-group|select 방식/.test(timeBlock)) throw new Error('Time Picker에 정본 없는 Select형 상위 구성이 생성되었습니다.');
  const formBlock = [MARKERS.inputSection, MARKERS.selectSection, MARKERS.datePickerSection, MARKERS.timePickerSection].map((marker) => html.slice(html.indexOf(marker.open), html.indexOf(marker.close))).join('\n');
  for (const substitute of ['⌕', '⌄', '▣', '◷']) if (formBlock.includes(substitute)) throw new Error(`Form 정본 아이콘 대신 대체 문자가 남았습니다: ${substitute}`);
  if (/<label[^>]*class="guide-input/.test(formBlock)) throw new Error('Input root가 label이라 중첩 label을 만들 수 있습니다.');
  if (!/<label for="guide-input-[^"]+">/.test(formBlock) || !/<input id="guide-input-[^"]+"/.test(formBlock)) throw new Error('Input label과 input의 id/for 연결이 없습니다.');
  const tableNavigation = tableNavigationGuide.dataFor(model);
  for (const set of [tableNavigation.table, tableNavigation.tableCell, tableNavigation.checkbox, tableNavigation.pagination, tableNavigation.gnb, tableNavigation.gnbMenu, tableNavigation.mobileBottomNav]) for (const variant of set.variants) if (!html.includes(esc(variant.name))) throw new Error(`${set.name} variant 생성 누락: ${variant.name}`);
  for (const value of ['GEN:COMPONENT-GUIDE:TABLE-SECTION', 'GEN:COMPONENT-GUIDE:PAGINATION-SECTION', 'GEN:COMPONENT-GUIDE:GNB-SECTION', 'GEN:COMPONENT-GUIDE:MOBILE-BOTTOM-NAV-SECTION', 'scope="col"', 'aria-sort="none"', 'aria-checked="mixed"', 'aria-current="page"', 'role="tablist"', 'role="tab"', 'aria-selected', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'min-width:0', 'overflow:auto']) if (!html.includes(value)) throw new Error(`Table/Navigation 생성/동작 누락: ${value}`);
  for (const value of ['data-table-body-row="8"', 'data-table-strong-line="top"', 'data-table-strong-line="bottom"', 'guide-table-footer', 'data-component-dependency="gnb-utility-icon"', 'data-utility-role="language"', 'data-utility-role="account"', 'data-utility-role="menu"', 'updatePagination', "action==='first'", "action==='previous'", "action==='next'", "action==='last'"]) if (!html.includes(value)) throw new Error(`Table/Navigation scene/runtime 충실도 누락: ${value}`);
  const mobileBlock = html.slice(html.indexOf(MARKERS.mobileBottomNavSection.open), html.indexOf(MARKERS.mobileBottomNavSection.close));
  if (/<nav\b|<a\b|<[^>]+\saria-current=/.test(mobileBlock)) throw new Error('Mobile Bottom Nav에 승인되지 않은 nav/a/aria-current 패턴이 생성되었습니다.');
  if (mobileBlock.includes('●') || !mobileBlock.includes('data-scene-asset="svg"')) throw new Error('Mobile Bottom Nav가 정본 home SVG 대신 대체 문자를 사용합니다.');
  const tableNavigationRuntime = html.match(/<script data-component-guide-table-navigation-runtime>[\s\S]*?<\/script>/);
  if (!tableNavigationRuntime || /getElementById|querySelector\('#/.test(tableNavigationRuntime[0])) throw new Error('Table/Navigation 런타임이 고정 ID 탐색을 사용합니다.');
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const modelFile = path.resolve(valueAfter(args, '--model', DEFAULT_MODEL));
  const metaFile = path.resolve(valueAfter(args, '--meta', DEFAULT_META));
  const htmlFile = path.resolve(valueAfter(args, '--html', DEFAULT_HTML));
  const templateFile = path.resolve(valueAfter(args, '--template', DEFAULT_TEMPLATE));
  const stubsFile = path.resolve(valueAfter(args, '--stubs', DEFAULT_STUBS));
  const model = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  const buttonMeta = JSON.parse(fs.readFileSync(path.join(path.dirname(metaFile), 'button.json'), 'utf8'));
  const selection = Object.fromEntries(['checkbox', 'radio', 'toggle', 'multi-toggle', 'chip', 'filter-chip'].map((name) => [name, JSON.parse(fs.readFileSync(path.join(path.dirname(metaFile), `${name}.json`), 'utf8'))]));
  const form = Object.fromEntries(['input', 'textarea', 'select', 'dropdown', 'date-picker', 'time-picker'].map((name) => [name, JSON.parse(fs.readFileSync(path.join(path.dirname(metaFile), `${name}.json`), 'utf8'))]));
  const tableNavigation = Object.fromEntries(['table', 'pagination', 'gnb', 'mobile-bottom-nav'].map((name) => [name, JSON.parse(fs.readFileSync(path.join(path.dirname(metaFile), `${name}.json`), 'utf8'))]));
  const template = fs.readFileSync(templateFile, 'utf8');
  const stubData = JSON.parse(fs.readFileSync(stubsFile, 'utf8'));
  const source = fs.readFileSync(htmlFile, 'utf8');
  const next = generate(template, model, { tab: meta, button: buttonMeta, selection, form, tableNavigation }, stubData);
  selfCheck(next, model);
  if (write) {
    fs.writeFileSync(htmlFile, next);
    console.log(`  생성: ${path.relative(ROOT, htmlFile)} (전체 페이지 · template + model + Registry + stubs)`);
  } else if (source !== next) {
    console.error(`  ❌ ${path.relative(ROOT, htmlFile)} 전체 파일이 template/정본과 다릅니다. --write 로 재생성하세요.`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ ${path.relative(ROOT, htmlFile)} 전체 파일 template/정본 일치`);
  }
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error); process.exit(1); }
}

module.exports = { generate, getLineTabData, assertLineTab, cssFor, sectionFor, buttonData, buttonCssFor, buttonSectionFor, selfCheck };
