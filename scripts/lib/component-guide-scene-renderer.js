'use strict';

function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char])); }
function cssVar(token) { return token && !/^\(|\?/.test(token) ? `var(--${String(token).replace(/\//g, '-')})` : 'transparent'; }
function weight(style) { const value = String(style || '').toLowerCase(); if (value.includes('bold')) return 700; if (value.includes('semi')) return 600; if (value.includes('medium')) return 500; return 400; }
function rawColor(paints) { const paint = (paints || []).find((item) => item && item.color); if (!paint) return null; const hex = (value) => Math.round(Math.max(0, Math.min(1, value || 0)) * 255).toString(16).padStart(2, '0'); return `#${hex(paint.color.r)}${hex(paint.color.g)}${hex(paint.color.b)}`.toUpperCase(); }
function tokenColor(node, role, mode, resolveColor) { const token = node.appearance && node.appearance[role]; if (token && !/^\(|\?/.test(token)) return resolveColor(token, mode); return rawColor(node.appearance && node.appearance[role === 'fill' ? 'fillPaints' : 'strokePaints']); }
function numberValue(node, field, resolveNumber) { const direct = node.layout && node.layout.padding && Object.prototype.hasOwnProperty.call(node.layout.padding, field) ? node.layout.padding[field] : null; if (direct != null) return direct; const key = node.boundVariables && node.boundVariables[`padding${field[0].toUpperCase()}${field.slice(1)}`]; return key ? resolveNumber(key) : 0; }
function radius(node, resolveNumber) { const appearance = node.appearance || {}; if (appearance.cornerRadius != null) return appearance.cornerRadius; const key = node.boundVariables && node.boundVariables.cornerRadius; if (key) return resolveNumber(key); return appearance.topLeftRadius; }

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
    radius(node, () => null) != null ? `border-radius:${radius(node, () => null)}px` : null,
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
  if (node.type === 'ELLIPSE') styles.push('border-radius:50%'); else { const value = radius(node, resolvers.resolveNumber); if (value != null) styles.push(`border-radius:${value}px`); }
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
