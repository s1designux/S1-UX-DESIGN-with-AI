#!/usr/bin/env node
'use strict';

/** Component guide model contact-sheet renderer. */
const fs = require('fs');
const path = require('path');
const { bundleRequire } = require('../lib/component-builder-runtime');
const { escapeHtml, renderSceneNode } = require('../lib/component-guide-scene-renderer');

const ROOT = path.resolve(__dirname, '..', '..');
const MODEL = path.join(ROOT, 'registry/components/component-guide-model.json');
const VARS = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');

function valueAfter(args, name, fallback) { const index = args.indexOf(name); return index >= 0 && args[index + 1] ? args[index + 1] : fallback; }
function resolveColorFactory(vars) {
  return (token, mode) => {
    let value = token, count = 0;
    while (value && count++ < 8) {
      if (typeof value === 'string' && value.startsWith('#')) return value.toUpperCase();
      if (vars.SEMANTIC_COLOR[value]) { value = vars.SEMANTIC_COLOR[value][mode]; continue; }
      if (vars.FOUNDATION_COLOR[value]) return String(vars.FOUNDATION_COLOR[value]).toUpperCase();
      return null;
    }
    return null;
  };
}
function resolveNumberFactory(vars) { return (token) => typeof token === 'number' ? token : typeof vars.FOUNDATION_NUMBER[token] === 'number' ? vars.FOUNDATION_NUMBER[token] : null; }
function combinations(keys, axes) { return keys.reduce((items, key) => items.flatMap((item) => (axes[key] || []).map((value) => ({ ...item, [key]: value }))), [{}]); }

function categoryRows(model) {
  const rows = [];
  for (const item of model.componentIndex) {
    if (!rows[item.gridRow]) rows[item.gridRow] = [];
    if (!rows[item.gridRow][item.categoryOrder]) rows[item.gridRow][item.categoryOrder] = { name: item.category, members: [] };
    rows[item.gridRow][item.categoryOrder].members[item.memberOrder] = item.name;
  }
  return rows.map((row) => row.filter(Boolean).map((category) => ({ ...category, members: category.members.filter(Boolean) })));
}

function renderMatrix(set, variants, combo, mode, resolvers) {
  const layout = set.presentationAxes || { rowAxis: null, columnAxis: null, bandAxes: [] };
  const rowValues = layout.rowAxis ? (set.axes[layout.rowAxis] || []) : [''];
  const columnValues = layout.columnAxis ? (set.axes[layout.columnAxis] || []) : [''];
  const find = (row, column) => variants.find((variant) => {
    if (layout.rowAxis && variant.axes[layout.rowAxis] !== row) return false;
    if (layout.columnAxis && variant.axes[layout.columnAxis] !== column) return false;
    return Object.entries(combo).every(([axis, value]) => variant.axes[axis] === value);
  });
  let html = `<div class="matrix" style="grid-template-columns:${layout.rowAxis ? 'auto ' : ''}repeat(${columnValues.length},max-content)">`;
  if (layout.rowAxis) html += '<div class="mx-corner"></div>';
  for (const value of columnValues) html += `<div class="mx-col">${escapeHtml(value)}</div>`;
  for (const row of rowValues) {
    if (layout.rowAxis) html += `<div class="mx-row">${escapeHtml(row)}</div>`;
    for (const column of columnValues) {
      const variant = find(row, column);
      html += `<div class="mx-cell">${variant ? `<div class="stage">${renderSceneNode(variant.node, mode, resolvers)}</div>` : '<span class="mx-na">—</span>'}</div>`;
    }
  }
  return `${html}</div>`;
}

function renderSet(set, mode, resolvers) {
  const layout = set.presentationAxes || { bandAxes: [] };
  return combinations(layout.bandAxes || [], set.axes).map((combo) => {
    const variants = set.variants.filter((variant) => Object.entries(combo).every(([axis, value]) => variant.axes[axis] === value));
    if (!variants.length) return '';
    const label = Object.entries(combo).map(([axis, value]) => `${axis}=${value}`).join(' · ');
    return `<div class="variant-group">${label ? `<div class="variant-label">${escapeHtml(label)}</div>` : ''}<div class="preview-area${mode === 'dark' ? ' dark' : ''}">${renderMatrix(set, variants, combo, mode, resolvers)}</div></div>`;
  }).join('');
}

function renderSections(model, sets, mode, resolvers) {
  const byName = new Map(sets.map((set) => [set.name, set]));
  return categoryRows(model).map((row) => `<div class="comp-row">${row.map((category) => {
    const categorySets = category.members.map((name) => byName.get(name)).filter(Boolean);
    if (!categorySets.length) return '<div class="comp-row-item comp-row-item-empty"></div>';
    return `<div class="comp-row-item"><section class="comp-group"><div class="comp-group-header"><span class="comp-group-title">${escapeHtml(category.name)}</span></div>${categorySets.map((set) => `<section class="comp-subsection"><div class="comp-subsection-header"><span class="comp-subsection-title">${escapeHtml(set.name)}</span><span class="comp-badge">${set.variantCount} variants</span><span class="comp-meta">component-guide-model.json · dependencies ${(set.dependencies || []).length}</span></div>${renderSet(set, mode, resolvers)}</section>`).join('')}</section></div>`;
  }).join('')}</div>`).join('');
}

function assetStats(model) {
  let svgCount = 0, svgBytes = 0;
  const walk = (node) => { if (node.asset && node.asset.kind === 'svg') { svgCount += 1; svgBytes += Buffer.byteLength(node.asset.payload || ''); } for (const child of node.children || []) walk(child); };
  for (const set of model.componentSets) for (const variant of set.variants) walk(variant.node);
  return { svgCount, svgBytes };
}

async function main() {
  const args = process.argv.slice(2);
  const filter = valueAfter(args, '--filter', null);
  const modelPath = path.resolve(valueAfter(args, '--model', MODEL));
  const outPath = path.resolve(valueAfter(args, '--out', path.join(ROOT, 'reports/component-preview/index.html')));
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  const vars = bundleRequire(VARS, 'component-preview-vars');
  const resolvers = { resolveColor: resolveColorFactory(vars), resolveNumber: resolveNumberFactory(vars) };
  let sets = model.componentSets;
  if (filter) sets = sets.filter((set) => set.name.toLowerCase().includes(filter.toLowerCase()));
  const stats = assetStats({ componentSets: sets });
  const stamp = String(Date.now());
  const light = renderSections(model, sets, 'light', resolvers), dark = renderSections(model, sets, 'dark', resolvers);
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Component Model Preview${filter ? ` · ${escapeHtml(filter)}` : ''}</title><style>
body{font-family:Pretendard,system-ui,sans-serif;margin:0;background:#fff;color:#202020}.top{padding:18px 40px;border-bottom:1px solid #ececec;position:sticky;top:0;background:#fff;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:20px}.top h1{margin:0;font-size:18px}.sub{margin-top:5px;font-size:12px;color:#737984}.theme-toggle{display:inline-flex;background:#f1f2f4;border-radius:8px;padding:3px}.theme-toggle button{border:0;background:transparent;padding:6px 16px;border-radius:6px}.theme-toggle button.on{background:#fff;font-weight:600}.page{padding:28px 40px;display:flex;flex-direction:column;gap:60px}.comp-row{display:flex;gap:40px;align-items:flex-start;overflow-x:auto;padding-bottom:20px}.comp-row-item{flex:0 0 auto;min-width:0}.comp-row-item-empty{width:200px}.comp-group-header{border-bottom:2px solid #d1d5db;padding-bottom:12px;margin-bottom:24px}.comp-group-title{font-size:20px;font-weight:700}.comp-subsection{margin-bottom:24px}.comp-subsection-header{border-bottom:1px solid #f3f4f6;padding-bottom:12px;margin-bottom:14px;display:flex;align-items:baseline;gap:12px}.comp-subsection-title{font-size:15px;font-weight:600}.comp-badge{font-size:11px;font-weight:600;color:#1d6ceb;background:#eaf2fd;padding:2px 9px;border-radius:10px}.comp-meta{font-size:12px;color:#737984}.variant-group{margin-bottom:18px}.variant-label{font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:8px}.preview-area{border:1px solid #ededed;border-radius:10px;padding:22px 26px;background:#fff;display:inline-block}.preview-area.dark{background:#131418;border-color:#2a2c33}.matrix{display:grid;gap:16px 30px;align-items:center;justify-items:center}.mx-col{font-size:11px;font-weight:600;text-transform:uppercase;color:#737984}.mx-row{font-size:11px;font-weight:700;color:#4b5563;justify-self:start;white-space:nowrap}.mx-cell{display:flex;align-items:center;justify-content:center}.mx-na{color:#aab0bb}.dark .mx-col{color:#aab0bb}.dark .mx-row{color:#c4c9d4}.stage{display:inline-flex;align-items:center;justify-content:center;padding:8px;border-radius:6px;background-image:linear-gradient(45deg,#f1f2f4 25%,transparent 25%),linear-gradient(-45deg,#f1f2f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f2f4 75%),linear-gradient(-45deg,transparent 75%,#f1f2f4 75%);background-size:12px 12px}.dark .stage{background-image:linear-gradient(45deg,#202228 25%,transparent 25%),linear-gradient(-45deg,#202228 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#202228 75%),linear-gradient(-45deg,transparent 75%,#202228 75%)}
</style></head><body><div class="top"><div><h1>Component Model Preview${filter ? ` · ${escapeHtml(filter)}` : ''}</h1><div class="sub">component-guide-model.json 직접 소비 · 세트 ${sets.length}개 · SVG ${stats.svgCount}개/${stats.svgBytes} bytes</div></div><div class="theme-toggle"><button data-mode="light" class="on">Light</button><button data-mode="dark">Dark</button></div></div><div class="page"><div id="root-light">${light || '<p>표시할 세트가 없습니다.</p>'}</div><div id="root-dark" hidden>${dark}</div></div><script>;(()=>{const INIT='${stamp}';function setTheme(mode){document.getElementById('root-light').hidden=mode!=='light';document.getElementById('root-dark').hidden=mode!=='dark';document.querySelectorAll('.theme-toggle button').forEach(button=>button.classList.toggle('on',button.dataset.mode===mode));sessionStorage.setItem('cp-theme',mode)}document.querySelectorAll('.theme-toggle button').forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.mode)));setTheme(sessionStorage.getItem('cp-theme')||'light');const y=sessionStorage.getItem('cp-scroll');if(y){scrollTo(0,+y);sessionStorage.removeItem('cp-scroll')}setInterval(()=>{const script=document.createElement('script');script.src='_stamp.js?t='+Date.now();script.onload=()=>{script.remove();if(window.__BUILD_STAMP&&String(window.__BUILD_STAMP)!==INIT){sessionStorage.setItem('cp-scroll',String(scrollY));location.reload()}};script.onerror=()=>script.remove();document.head.appendChild(script)},1500)})();</script></body></html>`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  fs.writeFileSync(path.join(path.dirname(outPath), '_stamp.js'), `window.__BUILD_STAMP=${stamp};`);
  return { outPath, setCount: sets.length, ...stats };
}

if (require.main === module) main().then((result) => { console.log('\n[Component Preview] model 렌더 완료'); console.log(`  세트 ${result.setCount}개 · SVG ${result.svgCount}개/${result.svgBytes} bytes → ${path.relative(ROOT, result.outPath)}`); }).catch((error) => { console.error('렌더 실패:', error); process.exit(1); });
module.exports = { main, renderSections, assetStats };
