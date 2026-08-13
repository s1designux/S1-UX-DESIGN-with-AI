'use strict';

function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char])); }
function cssVar(token) { return token && !/^\(|\?/.test(token) ? `var(--${String(token).replace(/\//g, '-')})` : 'transparent'; }
function weight(style) { const value = String(style || '').toLowerCase(); if (value.includes('bold')) return 700; if (value.includes('semi')) return 600; if (value.includes('medium')) return 500; return 400; }
function rawColor(paints) { const paint = (paints || []).find((item) => item && item.color); if (!paint) return null; const hex = (value) => Math.round(Math.max(0, Math.min(1, value || 0)) * 255).toString(16).padStart(2, '0'); return `#${hex(paint.color.r)}${hex(paint.color.g)}${hex(paint.color.b)}`.toUpperCase(); }
function tokenColor(node, role, mode, resolveColor) { const token = node.appearance && node.appearance[role]; if (token && !/^\(|\?/.test(token)) return resolveColor(token, mode); return rawColor(node.appearance && node.appearance[role === 'fill' ? 'fillPaints' : 'strokePaints']); }
function numberValue(node, field, resolveNumber) { const direct = node.layout && node.layout.padding && Object.prototype.hasOwnProperty.call(node.layout.padding, field) ? node.layout.padding[field] : null; if (direct != null) return direct; const key = node.boundVariables && node.boundVariables[`padding${field[0].toUpperCase()}${field.slice(1)}`]; return key ? resolveNumber(key) : 0; }
// 반경은 네 갈래로 들어온다: raw cornerRadius · cornerRadius 바인딩 · 네 모서리 개별 바인딩 · raw topLeftRadius.
// 정본이 setBoundVariable("topLeftRadius"…) 로 네 모서리를 따로 걸기 때문에(Button 은 예전부터, Chip·
// Calendar 는 2026-08-13 부터) cornerRadius 만 보면 반경이 통째로 사라져 알약이 각진 사각형으로 그려진다.
// 🤖 component-verifier 적발(2026-08-13): 이 구멍으로 미리보기 186개 노드의 border-radius 가 누락됐다.
const CORNERS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
function radius(node, resolveNumber) {
  const appearance = node.appearance || {};
  if (appearance.cornerRadius != null) return appearance.cornerRadius;
  const bound = node.boundVariables || {};
  if (bound.cornerRadius) return resolveNumber(bound.cornerRadius);
  // 네 모서리를 따로 받는다. 모서리마다 값이 다른 노드가 실재하므로(Multi Toggle 세그먼트 [4,0,4,0]·
  // 바텀시트 상단만 [8,8,0,0] 등 35개) 첫 값 하나로 뭉개면 미리보기가 정본과 다르게 그려진다.
  const each = CORNERS.map((corner) => {
    if (bound[corner]) return resolveNumber(bound[corner]);
    return appearance[corner] != null ? appearance[corner] : null;
  });
  if (each.every((value) => value == null)) return null;
  const filled = each.map((value) => (value == null ? 0 : value));
  return filled.every((value) => value === filled[0]) ? filled[0] : filled;
}
// 숫자 하나면 `4px`, 네 값이면 `8px 8px 0px 0px` (CSS 는 시계방향 = 좌상·우상·우하·좌하)
function radiusCss(value) {
  if (value == null) return null;
  if (!Array.isArray(value)) return `${value}px`;
  const [tl, tr, bl, br] = value;
  return `${tl}px ${tr}px ${br}px ${bl}px`;
}

function sceneNodeDeclarations(node, options = {}) {
  const colorFor = options.colorFor || cssVar;
  const includeWidth = options.includeWidth !== false;
  const text = node.text;
  const pad = (node.layout && node.layout.padding) || {};
  return [
    includeWidth && node.dimensions.width != null ? `width:${node.dimensions.width}px` : null,
    node.dimensions.height != null ? `height:${node.dimensions.height}px` : null,
    `padding:${pad.top || 0}px ${pad.right || 0}px ${pad.bottom || 0}px ${pad.left || 0}px`,
    node.appearance.fill && !/^\(|\?/.test(node.appearance.fill) ? `background:${colorFor(node.appearance.fill)}` : null,
    node.appearance.stroke && !/^\(|\?/.test(node.appearance.stroke) ? `border:${node.appearance.strokeWeight || 1}px solid ${colorFor(node.appearance.stroke)}` : null,
    radiusCss(radius(node, () => null)) ? `border-radius:${radiusCss(radius(node, () => null))}` : null,
    text && node.appearance.fill && !/^\(|\?/.test(node.appearance.fill) ? `color:${colorFor(node.appearance.fill)}` : null,
    text && text.fontSize ? `font-size:${text.fontSize}px` : null,
  ].filter(Boolean).join(';');
}

const ALIGN = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between', BASELINE: 'baseline' };
function previewStyle(node, mode, resolvers) {
  const layout = node.layout || {}, text = node.text, styles = ['box-sizing:border-box'];
  if (layout.layoutMode) {
    styles.push('display:flex', `flex-direction:${layout.layoutMode === 'VERTICAL' ? 'column' : 'row'}`);
    styles.push(`justify-content:${ALIGN[layout.primaryAxisAlignItems] || 'flex-start'}`, `align-items:${ALIGN[layout.counterAxisAlignItems] || 'flex-start'}`);
    if (layout.gap) styles.push(`gap:${layout.gap}px`);
  }
  if (layout.layoutGrow) styles.push('flex-grow:1');
  if (layout.layoutAlign === 'STRETCH') styles.push('align-self:stretch');
  const pt = numberValue(node, 'top', resolvers.resolveNumber), pr = numberValue(node, 'right', resolvers.resolveNumber), pb = numberValue(node, 'bottom', resolvers.resolveNumber), pl = numberValue(node, 'left', resolvers.resolveNumber);
  if (pt || pr || pb || pl) styles.push(`padding:${pt}px ${pr}px ${pb}px ${pl}px`);
  if (!text) {
    if (node.dimensions.width != null) styles.push(`width:${node.dimensions.width}px`); else if (layout.minWidth) styles.push(`min-width:${layout.minWidth}px`);
    if (node.dimensions.height != null) styles.push(`height:${node.dimensions.height}px`);
  }
  if (node.type === 'ELLIPSE') styles.push('border-radius:50%'); else { const css = radiusCss(radius(node, resolvers.resolveNumber)); if (css) styles.push(`border-radius:${css}`); }
  const stroke = tokenColor(node, 'stroke', mode, resolvers.resolveColor); if (stroke) styles.push(`border:${node.appearance.strokeWeight || 1}px solid ${stroke}`);
  if (text) {
    const styleSize = /\/(\d+)/.exec(text.textStyleId || '');
    styles.push(`font-size:${text.fontSize || (styleSize && Number(styleSize[1])) || 14}px`, `font-weight:${weight(text.fontStyle)}`, 'white-space:nowrap', 'line-height:1.3');
    const fill = tokenColor(node, 'fill', mode, resolvers.resolveColor); if (fill) styles.push(`color:${fill}`);
  } else { const fill = tokenColor(node, 'fill', mode, resolvers.resolveColor); if (fill) styles.push(`background:${fill}`); }
  return styles.join(';');
}

function renderSceneNode(node, mode, resolvers, absolute = false) {
  const position = node.position || {};
  const absoluteStyle = absolute ? `position:absolute;left:${position.x || 0}px;top:${position.y || 0}px;` : '';
  if (node.text) return `<span style="${absoluteStyle}${previewStyle(node, mode, resolvers)}">${escapeHtml(node.text.characters)}</span>`;
  if (node.asset && node.asset.kind === 'svg' && node.asset.payload) {
    let svg = node.asset.payload;
    const color = node.asset.colorToken && resolvers.resolveColor(node.asset.colorToken, mode);
    if (color) {
      if (node.asset.colorBinding === 'stroke' || node.asset.colorBinding === 'both') svg = svg.replace(/stroke="(?:#[0-9a-f]{3,8}|currentColor)"/gi, `stroke="${color}"`);
      if (node.asset.colorBinding === 'fill' || node.asset.colorBinding === 'both') svg = svg.replace(/fill="(?:#[0-9a-f]{3,8}|currentColor)"/gi, `fill="${color}"`);
    }
    return `<div data-scene-asset="svg" style="${absoluteStyle}${previewStyle(node, mode, resolvers)};display:flex;align-items:center;justify-content:center">${svg}</div>`;
  }
  const childAbsolute = !(node.layout && node.layout.layoutMode);
  const relative = childAbsolute ? 'position:relative;' : '';
  return `<div style="${absoluteStyle}${relative}${previewStyle(node, mode, resolvers)}">${(node.children || []).map((child) => renderSceneNode(child, mode, resolvers, childAbsolute)).join('')}</div>`;
}

function guideStyle(node, options = {}) {
  const layout = node.layout || {}, styles = ['box-sizing:border-box'];
  if (layout.layoutMode) {
    styles.push('display:flex', `flex-direction:${layout.layoutMode === 'VERTICAL' ? 'column' : 'row'}`);
    styles.push(`justify-content:${ALIGN[layout.primaryAxisAlignItems] || 'flex-start'}`, `align-items:${ALIGN[layout.counterAxisAlignItems] || 'flex-start'}`);
    if (layout.gap) styles.push(`gap:${layout.gap}px`);
  }
  if (node.dimensions.width != null) styles.push(`width:${node.dimensions.width}px`);
  if (node.dimensions.height != null) styles.push(`height:${node.dimensions.height}px`);
  if (node.text) {
    if (node.appearance.fill && !/^\(|\?/.test(node.appearance.fill)) styles.push(`color:${cssVar(node.appearance.fill)}`);
    if (node.text.fontSize) styles.push(`font-size:${node.text.fontSize}px`);
    styles.push(`font-weight:${weight(node.text.fontStyle)}`, 'white-space:nowrap');
  } else if (node.appearance.fill && !/^\(|\?/.test(node.appearance.fill)) styles.push(`background:${cssVar(node.appearance.fill)}`);
  if (node.appearance.stroke && !/^\(|\?/.test(node.appearance.stroke)) styles.push(`border:${node.appearance.strokeWeight || 1}px solid ${cssVar(node.appearance.stroke)}`);
  if (options.extraStyle) styles.push(options.extraStyle);
  return styles.join(';');
}

function renderGuideSceneNode(node, options = {}) {
  if (!node) return '';
  const className = options.className ? ` class="${escapeHtml(options.className)}"` : '';
  const aria = options.ariaHidden === false ? '' : ' aria-hidden="true"';
  if (node.text) return `<span${className}${aria} style="${guideStyle(node, options)}">${escapeHtml(options.text == null ? node.text.characters : options.text)}</span>`;
  if (node.asset && node.asset.kind === 'svg' && node.asset.payload) {
    let svg = node.asset.payload;
    if (node.asset.colorBinding === 'stroke' || node.asset.colorBinding === 'both') svg = svg.replace(/stroke="(?:#[0-9a-f]{3,8}|currentColor)"/gi, 'stroke="currentColor"');
    if (node.asset.colorBinding === 'fill' || node.asset.colorBinding === 'both') svg = svg.replace(/fill="(?:#[0-9a-f]{3,8}|currentColor)"/gi, 'fill="currentColor"');
    const color = node.asset.colorToken && !/^\(|\?/.test(node.asset.colorToken) ? `color:${cssVar(node.asset.colorToken)}` : '';
    return `<span${className}${aria} data-scene-asset="svg" style="${guideStyle(node, { extraStyle: `display:inline-flex;align-items:center;justify-content:center;${color}${options.extraStyle || ''}` })}">${svg}</span>`;
  }
  return `<span${className}${aria} style="${guideStyle(node, options)}">${(node.children || []).map((child) => renderGuideSceneNode(child)).join('')}</span>`;
}

module.exports = { escapeHtml, cssVar, sceneNodeDeclarations, previewStyle, renderSceneNode, renderGuideSceneNode };
