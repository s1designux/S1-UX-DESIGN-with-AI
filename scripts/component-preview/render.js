#!/usr/bin/env node
/**
 * Component Preview Renderer (빌더 미리보기 렌더러)
 * ─────────────────────────────────────────────────────────────────────────
 * build-components.ts (Figma 컴포넌트 생성 정본)를 Figma 없이 브라우저에서 본다.
 *
 * 동작:
 *   1. esbuild 로 build-components.ts·vars-data.ts 를 CJS 번들 → require.
 *   2. "가짜 figma" scene-graph 레코더를 global.figma 에 꽂고 buildAllComponents 실행.
 *      → 빌더가 만드는 모든 노드(프레임·텍스트·세트)의 layout·fill·stroke·크기를 기록.
 *   3. 토큰 바인딩(fill/stroke)을 vars-data 로 hex(Light/Dark) 해석.
 *   4. 오토레이아웃 프레임 → CSS flexbox 로 직렬화 → HTML 컨택트시트 생성.
 *
 * 핵심: 보는 것 = "빌더 자체 산출물". 손으로 짠 harness 와 별개라 drift 가 없다.
 *       Figma 플러그인과 동일 소스(build-components.ts + vars-data)에서 그리므로
 *       브라우저에 뜨는 게 ≈ Figma 가 만들 결과.
 *
 * 사용: node scripts/component-preview/render.js [--filter <name>] [--out <path>]
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");
const VD = path.join(ROOT, "plugins/figma-vars-installer/src/vars-data.ts");

// ── esbuild 로 TS → CJS 번들 후 require ──────────────────────────────────
function bundleRequire(entry, tag) {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({ entryPoints: [entry], bundle: true, format: "cjs", platform: "node", write: false });
  const tmp = path.join(os.tmpdir(), `cp-${tag}-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { delete require.cache[tmp]; return require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* noop */ } }
}

const vars = bundleRequire(VD, "vd");
const FOUNDATION_COLOR = vars.FOUNDATION_COLOR;
const SEMANTIC_COLOR = vars.SEMANTIC_COLOR;
const FOUNDATION_NUMBER = vars.FOUNDATION_NUMBER;

// ── 토큰 → hex (Light/Dark). semantic → foundation 1~2 hop 재귀 해석 ───────
function resolveColor(tokenKey, mode) {
  let seen = 0;
  let val = tokenKey;
  while (val && seen++ < 8) {
    if (typeof val === "string" && /^#/.test(val)) return val.toUpperCase();
    if (SEMANTIC_COLOR[val]) { val = SEMANTIC_COLOR[val][mode]; continue; }   // semantic → 그 mode 의 참조
    if (FOUNDATION_COLOR[val]) return FOUNDATION_COLOR[val].toUpperCase();    // foundation → hex
    return null; // 미해석
  }
  return null;
}
function resolveNumber(tokenKey) {
  if (tokenKey == null) return null;
  if (typeof tokenKey === "number") return tokenKey;
  const v = FOUNDATION_NUMBER[tokenKey];
  return typeof v === "number" ? v : null;
}

// ── 가짜 figma scene-graph 레코더 ────────────────────────────────────────
let NODE_SEQ = 0;
function makeNode(type) {
  const node = {
    __id: ++NODE_SEQ, type, name: "",
    children: [], fills: [], strokes: [],
    _bound: {},            // setBoundVariable 로 묶인 토큰 키 (geometry)
    // 기본 figma 프로퍼티 (할당되면 자기 값 보유)
    appendChild(c) { if (c) this.children.push(c); return c; },
    insertChild(i, c) { if (c) this.children.splice(i, 0, c); return c; },
    resize(w, h) { this.width = w; this.height = h; return this; },
    resizeWithoutConstraints(w, h) { this.width = w; this.height = h; return this; },
    setBoundVariable(prop, v) { if (v && v.__key) this._bound[prop] = v.__key; },
    setExplicitVariableModeForCollection() { /* noop — Light 고정 렌더 */ },
    setTextStyleIdAsync(id) { this._textStyleKey = (id && id.__key) || id; return Promise.resolve(); },
    setRangeFills() { /* noop */ },
    findOne(pred) {
      const stack = [...this.children];
      while (stack.length) { const n = stack.shift(); if (pred(n)) return n; stack.push(...n.children); }
      return null;
    },
    findAll(pred) {
      const res = []; const stack = [...this.children];
      while (stack.length) { const n = stack.shift(); if (!pred || pred(n)) res.push(n); stack.push(...n.children); }
      return res;
    },
    clone() { return cloneNode(this); },
    createInstance() { const c = cloneNode(this); c.__instanceOf = this.name; return c; },
    remove() { /* noop */ },
  };
  // 텍스트 노드는 실제 Figma 처럼 폭/높이를 측정해야 수동 중앙정렬·폭계산(GNB 슬롯 등)이 깨지지 않는다.
  // mock 은 측정기가 없으므로 글자수×폰트크기로 근사(한글/전각 ≈1.0em, ASCII ≈0.56em). resize 시 명시값 우선.
  if (type === "TEXT") {
    let ew = null, eh = null;
    Object.defineProperty(node, "width", {
      configurable: true, enumerable: true,
      get() {
        if (ew != null) return ew;
        const fs = this.fontSize || 14; let u = 0;
        for (const ch of String(this.characters || "")) u += /[\x00-\xff]/.test(ch) ? 0.56 : 1.0;
        return Math.round(u * fs);
      },
      set(v) { ew = v; },
    });
    Object.defineProperty(node, "height", {
      configurable: true, enumerable: true,
      get() { return eh != null ? eh : Math.round((this.fontSize || 14) * 1.3); },
      set(v) { eh = v; },
    });
  }
  return node;
}
function cloneNode(src) {
  const n = makeNode(src.type);
  // 얕은 프로퍼티 복사 (children/fns 제외)
  for (const k of Object.keys(src)) {
    if (["children", "_bound"].includes(k)) continue;
    if (typeof src[k] === "function") continue;
    n[k] = src[k];
  }
  n._bound = { ...src._bound };
  n.fills = Array.isArray(src.fills) ? src.fills.map((p) => ({ ...p })) : src.fills;
  n.strokes = Array.isArray(src.strokes) ? src.strokes.map((p) => ({ ...p })) : src.strokes;
  n.children = src.children.map(cloneNode);
  return n;
}

const SETS = []; // combineAsVariants 결과 (컴포넌트 세트)

const figmaMock = {
  createComponent() { return makeNode("COMPONENT"); },
  createFrame() { return makeNode("FRAME"); },
  createText() { return makeNode("TEXT"); },
  createRectangle() { return makeNode("RECTANGLE"); },
  createEllipse() { return makeNode("ELLIPSE"); },
  createVector() { return makeNode("VECTOR"); },
  createNodeFromSvg(svg) { const n = makeNode("FRAME"); n.__svg = svg; const v = makeNode("VECTOR"); n.children.push(v); return n; },
  combineAsVariants(comps, _page) {
    const set = makeNode("COMPONENT_SET");
    set.children = comps.slice();
    SETS.push(set);
    return set;
  },
  group(nodes) { const g = makeNode("GROUP"); g.children = nodes.slice(); return g; },
  loadFontAsync() { return Promise.resolve(); },
  currentPage: { appendChild() {}, get children() { return []; } },
  variables: {
    setBoundVariableForPaint(paint, _field, variable) {
      const p = { ...paint, __tokenKey: variable && variable.__key };
      return p;
    },
    setBoundVariableForEffect(effect) { return effect; },
  },
  mixed: Symbol("mixed"),
  notify() {}, closePlugin() {},
};

// 알 수 없는 figma.* 접근(viewport·root·util 등)은 만능 stub 로 흡수 → 빌드 중단 방지.
function universalStub() {
  const f = function () { return universalStub(); };
  return new Proxy(f, {
    get(_t, p) {
      if (p === "then") return undefined;
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === Symbol.iterator) return undefined;
      if (p === "children") return [];
      return universalStub();
    },
    set() { return true; }, apply() { return universalStub(); },
  });
}
const figmaProxy = new Proxy(figmaMock, {
  get(t, p) { return p in t ? t[p] : universalStub(); },
});

// maps: scv(maps.semanticColor, key) → {__key:key}. requireVar 가 truthy 요구 → 프록시.
function tokenProxy() {
  return new Proxy({}, { get(_t, prop) { return typeof prop === "string" ? { __key: prop, id: { __key: prop } } : undefined; } });
}
const maps = {
  semanticColor: tokenProxy(),
  foundationNumber: tokenProxy(),
  textStyles: tokenProxy(),
  semanticColorCollectionId: "cid",
  semanticLightModeId: "light",
  semanticDarkModeId: "dark",
};

// ── 노드 → CSS 직렬화 ────────────────────────────────────────────────────
const ALIGN = { MIN: "flex-start", CENTER: "center", MAX: "flex-end", SPACE_BETWEEN: "space-between", BASELINE: "baseline" };
const TEXT_STYLE = {
  "body/14M": { size: 14, weight: 500 }, "body/16M": { size: 16, weight: 500 },
  "body/14R": { size: 14, weight: 400 }, "body/16R": { size: 16, weight: 400 },
  "body/12M": { size: 12, weight: 500 }, "body/12R": { size: 12, weight: 400 },
};
function weightFromStyle(style) {
  if (!style) return null;
  const s = String(style.style || style).toLowerCase();
  if (s.includes("bold")) return 700; if (s.includes("semi")) return 600;
  if (s.includes("medium")) return 500; if (s.includes("regular")) return 400;
  return null;
}
function paintHex(paints, mode) {
  if (!Array.isArray(paints) || paints.length === 0) return null;
  const p = paints[0];
  if (p.__tokenKey) return resolveColor(p.__tokenKey, mode);
  if (p.color) { // raw SOLID {r,g,b} 0..1
    const c = p.color, to = (x) => Math.round((x || 0) * 255).toString(16).padStart(2, "0");
    return ("#" + to(c.r) + to(c.g) + to(c.b)).toUpperCase();
  }
  return null;
}
function geom(node, prop) {
  if (node[prop] != null) return node[prop];
  if (node._bound[prop] != null) return resolveNumber(node._bound[prop]);
  return null;
}
function radiusOf(node) {
  if (node.cornerRadius != null && node.cornerRadius !== figmaMock.mixed) return node.cornerRadius;
  const tl = node.topLeftRadius != null ? node.topLeftRadius : resolveNumber(node._bound.topLeftRadius);
  return tl != null ? tl : null;
}
function strokeWeightOf(node) {
  if (node.strokeWeight != null) return node.strokeWeight;
  if (node._bound.strokeWeight != null) return resolveNumber(node._bound.strokeWeight);
  return null;
}
function axisFixed(node) {
  // returns {wFixed, hFixed}
  if (!node.layoutMode) return { wFixed: node.width != null, hFixed: node.height != null };
  const prim = node.primaryAxisSizingMode === "FIXED";
  const ctr = node.counterAxisSizingMode === "FIXED";
  return node.layoutMode === "VERTICAL" ? { wFixed: ctr, hFixed: prim } : { wFixed: prim, hFixed: ctr };
}
function styleFor(node, mode) {
  const s = ["box-sizing:border-box"];
  const isText = node.type === "TEXT";
  if (node.layoutMode) {
    s.push("display:flex", "flex-direction:" + (node.layoutMode === "VERTICAL" ? "column" : "row"));
    s.push("justify-content:" + (ALIGN[node.primaryAxisAlignItems] || "flex-start"));
    s.push("align-items:" + (ALIGN[node.counterAxisAlignItems] || "flex-start"));
    if (node.itemSpacing) s.push("gap:" + node.itemSpacing + "px");
  }
  // flex-fill 반영 (빌더의 layoutGrow / layoutAlign=STRETCH) — footer 확인 우측정렬·컬럼/셀 폭 채움 재현
  if (node.layoutGrow) s.push("flex-grow:1");
  if (node.layoutAlign === "STRETCH") s.push("align-self:stretch");
  const pt = geom(node, "paddingTop") || 0, pr = geom(node, "paddingRight") || 0,
        pb = geom(node, "paddingBottom") || 0, pl = geom(node, "paddingLeft") || 0;
  if (pt || pr || pb || pl) s.push(`padding:${pt}px ${pr}px ${pb}px ${pl}px`);
  const { wFixed, hFixed } = axisFixed(node);
  // 텍스트는 폭/높이를 박지 않는다 — 추정 metric(빌더 레이아웃 계산용)을 span 크기로 강제하면
  // 실제 글리프보다 좁아 좌측·상단으로 치우쳐 보인다. 브라우저가 실제 글자 크기로 그리게 둔다.
  if (!isText) {
    if (wFixed && node.width != null) s.push("width:" + node.width + "px");
    else if (node.minWidth) s.push("min-width:" + node.minWidth + "px");
    if (hFixed && node.height != null) s.push("height:" + node.height + "px");
  }
  if (node.type === "ELLIPSE") s.push("border-radius:50%"); // ELLIPSE = 원형 (라디오 점 등)
  else { const r = radiusOf(node); if (r) s.push("border-radius:" + r + "px"); }
  const sw = strokeWeightOf(node), sk = paintHex(node.strokes, mode);
  if (sw && sk) s.push(`border:${sw}px solid ${sk}`);
  if (node.clipsContent) s.push("overflow:hidden");
  if (isText) {
    const tsz = node.fontSize || (TEXT_STYLE[node._textStyleKey] && TEXT_STYLE[node._textStyleKey].size) || 14;
    const tw = weightFromStyle(node.fontName) || (TEXT_STYLE[node._textStyleKey] && TEXT_STYLE[node._textStyleKey].weight) || 400;
    s.push("font-size:" + tsz + "px", "font-weight:" + tw, "white-space:nowrap", "line-height:1.3");
    const col = paintHex(node.fills, mode); if (col) s.push("color:" + col);
  } else {
    const bg = paintHex(node.fills, mode); if (bg) s.push("background:" + bg);
  }
  return s.join(";");
}
// abs=true → 부모가 비-auto-layout 이라 이 노드를 절대좌표(x/y)로 배치. (라디오 점·체크·아이콘 등 수동 배치 충실 재현)
function serialize(node, mode, abs) {
  const absStyle = abs ? `position:absolute;left:${node.x || 0}px;top:${node.y || 0}px;` : "";
  if (node.type === "TEXT") {
    return `<span style="${absStyle}${styleFor(node, mode)}">${esc(node.characters || "")}</span>`;
  }
  if (node.__svg) {
    // 아이콘: makeStrokeIcon 이 자식 도형 stroke 를 토큰에 바인딩 → 그 토큰색으로 SVG 재색.
    let svg = node.__svg;
    let iconHex = null;
    const stack = [...(node.children || [])];
    while (stack.length) {
      const n = stack.shift();
      const tk = (n.strokes && n.strokes[0] && n.strokes[0].__tokenKey) || (n.fills && n.fills[0] && n.fills[0].__tokenKey);
      if (tk) { iconHex = resolveColor(tk, mode); break; }
      stack.push(...(n.children || []));
    }
    if (iconHex) svg = svg.replace(/stroke="#[0-9a-fA-F]{3,8}"/g, `stroke="${iconHex}"`).replace(/fill="#[0-9a-fA-F]{3,8}"/g, (m) => /fill="none"/i.test(m) ? m : `fill="${iconHex}"`);
    return `<div style="${absStyle}${styleFor(node, mode)};display:flex;align-items:center;justify-content:center">${svg}</div>`;
  }
  // 자식 배치: 이 노드가 auto-layout 이면 flex 흐름, 아니면 자식을 절대좌표(x/y)로 — Figma 와 동일.
  const childAbs = !node.layoutMode;
  const relStyle = childAbs ? "position:relative;" : "";
  const inner = (node.children || []).map((c) => serialize(c, mode, childAbs)).join("");
  return `<div style="${absStyle}${relStyle}${styleFor(node, mode)}">${inner}</div>`;
}
function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

// ── 메인 ─────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const filterIdx = args.indexOf("--filter");
  const filter = filterIdx >= 0 ? args[filterIdx + 1] : null;
  const outIdx = args.indexOf("--out");
  const outPath = outIdx >= 0 ? args[outIdx + 1] : path.join(ROOT, "reports/component-preview/index.html");
  const STAMP = String(Date.now()); // 빌드 스탬프 — 열린 탭 자동 새로고침 감지용

  global.figma = figmaProxy;
  const bc = bundleRequire(BC, "bc");
  let threw = null;
  try { await bc.buildAllComponents(maps); } catch (e) { threw = (e && e.message) || String(e); }

  // 세트 필터 (이름 부분일치). 기본=전체. 파일럿: --filter "Time Picker".
  let sets = SETS.filter((s) => s.name);
  if (filter) sets = sets.filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()));

  // ── variant 이름 파싱 → 축 결정 (Size=행 · State=열 · 나머지=밴드) ──────────
  const parseProps = (name) => { const o = {}; (name || "").split(",").forEach((p) => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }); return o; };
  const distinct = (a) => a.filter((v, i) => a.indexOf(v) === i);
  function layoutSet(set) {
    const items = set.children.map((c) => ({ comp: c, props: parseProps(c.name) }));
    const keys = distinct(items.flatMap((it) => Object.keys(it.props)));
    let colKey = keys.includes("State") ? "State" : null;
    if (!colKey) { // State 없으면 (Size 제외) 가장 값이 많은 속성을 열로
      const cand = keys.filter((k) => k !== "Size").sort((a, b) =>
        distinct(items.map((i) => i.props[b]).filter(Boolean)).length - distinct(items.map((i) => i.props[a]).filter(Boolean)).length);
      colKey = cand[0] || null;
    }
    const rowKey = keys.includes("Size") ? "Size" : null;
    const bandKeys = keys.filter((k) => k !== colKey && k !== rowKey);
    return { items, colKey, rowKey, bandKeys };
  }
  const cartesian = (bands) => bands.reduce((out, { k, vals }) =>
    out.flatMap((o) => vals.map((v) => ({ ...o, [k]: v }))), [{}]);

  function renderMatrix(items, rowKey, colKey, rowVals, colVals, mode) {
    const find = (r, c) => items.find((it) => (!rowKey || it.props[rowKey] === r) && (!colKey || it.props[colKey] === c));
    let h = `<div class="matrix" style="grid-template-columns:${rowKey ? "auto " : ""}repeat(${colVals.length},max-content)">`;
    if (rowKey) h += `<div class="mx-corner"></div>`;
    for (const c of colVals) h += `<div class="mx-col">${esc(c || "")}</div>`;
    for (const r of rowVals) {
      if (rowKey) h += `<div class="mx-row">${esc(r || "")}</div>`;
      for (const c of colVals) { const it = find(r, c); h += `<div class="mx-cell">${it ? `<div class="stage">${serialize(it.comp, mode)}</div>` : `<span class="mx-na">—</span>`}</div>`; }
    }
    return h + `</div>`;
  }

  function renderSet(set, mode) {
    const { items, colKey, rowKey, bandKeys } = layoutSet(set);
    const colVals = colKey ? distinct(items.map((it) => it.props[colKey]).filter(Boolean)) : [""];
    const bands = bandKeys.map((k) => ({ k, vals: distinct(items.map((it) => it.props[k]).filter(Boolean)) }));
    const groups = cartesian(bands).map((combo) => {
      const inBand = items.filter((it) => Object.entries(combo).every(([k, v]) => it.props[k] === v));
      if (!inBand.length) return "";
      const rowVals = rowKey ? distinct(inBand.map((it) => it.props[rowKey]).filter(Boolean)) : [""];
      const bandLabel = Object.values(combo).join(" · ");
      return `<div class="variant-group">${bandLabel ? `<div class="variant-label">${esc(bandLabel)}</div>` : ""}` +
        `<div class="preview-area${mode === "dark" ? " dark" : ""}">${renderMatrix(inBand, rowKey, colKey, rowVals, colVals, mode)}</div></div>`;
    }).join("");
    return groups;
  }

  const sectionsFor = (mode) => sets.map((set) => `
    <section class="comp-section">
      <div class="comp-section-header">
        <span class="comp-section-title">${esc(set.name)}</span>
        <span class="comp-badge">${set.children.length} variants</span>
        <span class="comp-meta">build-components.ts 자동 생성 · 손편집 금지</span>
      </div>
      ${renderSet(set, mode)}
    </section>`).join("\n");

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>Builder Preview${filter ? " · " + esc(filter) : ""}</title>
<style>
  /* components-new.html 레이아웃 chrome 재현 (별도 파일 — 페이지엔 안 섞음) */
  body { font-family: Pretendard, system-ui, sans-serif; margin: 0; background: #fff; color: #202020; }
  .top { padding: 18px 40px; border-bottom: 1px solid #ECECEC; position: sticky; top: 0; background: #fff; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .top h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
  .top h1 .tag { color: #1D6CEB; font-size: 13px; font-weight: 600; margin-left: 8px; }
  .top .sub { margin: 5px 0 0; font-size: 12px; color: #9aa0a6; font-weight: 400; }
  .theme-toggle { display: inline-flex; background: #F1F2F4; border-radius: 8px; padding: 3px; gap: 2px; }
  .theme-toggle button { border: 0; background: transparent; font: inherit; font-size: 13px; padding: 6px 16px; border-radius: 6px; cursor: pointer; color: #6b7280; }
  .theme-toggle button.on { background: #fff; color: #111827; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
  .page { max-width: 1500px; padding: 28px 40px; }
  .comp-section { margin-bottom: 48px; }
  .comp-section-header { border-bottom: 1px solid #ECECEC; padding-bottom: 14px; margin-bottom: 18px; display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .comp-section-title { font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -.02em; }
  .comp-badge { font-size: 11px; font-weight: 600; color: #1D6CEB; background: #EAF2FD; padding: 2px 9px; border-radius: 10px; }
  .comp-meta { font-size: 12px; color: #9aa0a6; }
  .variant-group { margin-bottom: 18px; }
  .variant-label { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
  .preview-area { border: 1px solid #EDEDED; border-radius: 10px; padding: 22px 26px; background: #fff; display: inline-block; }
  .preview-area.dark { background: #131418; border-color: #2A2C33; }
  /* 매트릭스: 행=Size · 열=State (비교 편하게 격자) */
  .matrix { display: grid; gap: 16px 30px; align-items: center; justify-items: center; }
  .mx-col { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #9aa0a6; }
  .mx-row { font-size: 11px; font-weight: 700; color: #4b5563; justify-self: start; white-space: nowrap; }
  .mx-cell { display: flex; align-items: center; justify-content: center; }
  .mx-na { color: #cbd1d9; font-size: 14px; user-select: none; } /* 해당 상태 없음(N/A) — 정본 매트릭스의 "—" 와 동일 */
  .preview-area.dark .mx-col { color: #7c828c; } .preview-area.dark .mx-row { color: #aab0bb; }
  /* 스테이지: 흰색·투명 컴포넌트도 보이게 옅은 체커 */
  .stage { display: inline-flex; align-items: center; justify-content: center; padding: 8px; border-radius: 6px; }
  .preview-area .stage { background-image: linear-gradient(45deg,#f1f2f4 25%,transparent 25%),linear-gradient(-45deg,#f1f2f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f2f4 75%),linear-gradient(-45deg,transparent 75%,#f1f2f4 75%); background-size: 12px 12px; background-position: 0 0,0 6px,6px -6px,-6px 0; }
  .preview-area.dark .stage { background-image: linear-gradient(45deg,#202228 25%,transparent 25%),linear-gradient(-45deg,#202228 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#202228 75%),linear-gradient(-45deg,transparent 75%,#202228 75%); background-size: 12px 12px; background-position: 0 0,0 6px,6px -6px,-6px 0; }
</style></head><body>
<div class="top">
  <div>
    <h1>Builder Preview${filter ? " <span class='tag'>" + esc(filter) + "</span>" : ""}</h1>
    <div class="sub">build-components.ts 산출물 · Figma 없이 렌더 · 행=Size · 열=State · 세트 ${sets.length}개 · ${threw ? "⚠️ 빌드 예외: " + esc(threw) : "빌드 정상"}</div>
  </div>
  <div class="theme-toggle"><button data-mode="light" class="on">Light</button><button data-mode="dark">Dark</button></div>
</div>
<div class="page">
  <div id="root-light">${sets.length ? sectionsFor("light") : "<p>표시할 세트가 없습니다 (필터 확인).</p>"}</div>
  <div id="root-dark" hidden>${sectionsFor("dark")}</div>
</div>
<script>
  // 테마 토글 + 상태(테마·스크롤) 보존 + 빌더 재생성 시 같은 탭 자동 새로고침(open 새 창 안 띄움)
  (function () {
    var INIT = "${STAMP}";
    function setTheme(m) {
      document.getElementById("root-light").hidden = m !== "light";
      document.getElementById("root-dark").hidden = m !== "dark";
      document.querySelectorAll(".theme-toggle button").forEach(function (x) { x.classList.toggle("on", x.dataset.mode === m); });
      sessionStorage.setItem("cp-theme", m);
    }
    document.querySelectorAll(".theme-toggle button").forEach(function (b) { b.addEventListener("click", function () { setTheme(b.dataset.mode); }); });
    setTheme(sessionStorage.getItem("cp-theme") || "light");            // 테마 복원
    var sy = sessionStorage.getItem("cp-scroll"); if (sy) { window.scrollTo(0, +sy); sessionStorage.removeItem("cp-scroll"); }
    // 빌더 재생성(_stamp.js 변경) 감지 → 같은 탭 새로고침. file:// 동적 스크립트 로드(가능 시), 실패하면 조용히 무시.
    setInterval(function () {
      var s = document.createElement("script");
      s.src = "_stamp.js?t=" + Date.now();
      s.onload = function () { s.remove(); if (window.__BUILD_STAMP && String(window.__BUILD_STAMP) !== INIT) { sessionStorage.setItem("cp-scroll", String(window.scrollY)); location.reload(); } };
      s.onerror = function () { s.remove(); };
      document.head.appendChild(s);
    }, 1500);
  })();
</script>
</body></html>`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  fs.writeFileSync(path.join(path.dirname(outPath), "_stamp.js"), `window.__BUILD_STAMP=${STAMP};`);
  return { outPath, setCount: sets.length, threw };
}

if (require.main === module) {
  main().then((r) => {
    console.log(`\n[Component Preview] 렌더 완료`);
    console.log(`  세트 ${r.setCount}개 → ${path.relative(ROOT, r.outPath)}`);
    if (r.threw) console.warn(`  ⚠️  buildAllComponents 예외: ${r.threw}`);
    console.log(`  열린 탭은 자동 새로고침됩니다(1.5s 폴링). 첫 1회만: open ${path.relative(ROOT, r.outPath)}\n`);
  }).catch((e) => { console.error("렌더 실패:", e); process.exit(1); });
}

module.exports = { main };
