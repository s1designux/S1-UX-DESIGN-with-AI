/* ============================================================
   Pattern Builder · builder.js
   ------------------------------------------------------------
   배포본(ui-library/dist)의 부품만 조립해 화면을 만들고 HTML/CSS 로 내보낸다.
   - 부품·크기·변형 축은 각 부품의 dist manifest 에서 읽는다(새 이름을 만들지 않는다).
   - 마크업은 dist/examples 의 배포 예제를 그대로 가져와 속성만 바꾼다.
   - 패턴 목록은 registry/patterns/builder/catalog.json 을 읽기만 한다.
   - 플랫폼·역할·테마 축은 design/design.manifest.json 을 읽는다.
   ============================================================ */
import { autoInit } from "../../ui-library/dist/s1-ui.auto.js";

const url = (rel) => new URL(rel, import.meta.url);
const URLS = {
  distManifest: url("../../ui-library/dist/manifest.json"),
  designManifest: url("../../design/design.manifest.json"),
  registryIndex: url("../../registry/components/index.json"),
  catalog: url("../../registry/patterns/builder/catalog.json"),
  componentManifest: (id) => url(`../../ui-library/dist/components/${id}.manifest.json`),
  distFile: (file) => url(`../../ui-library/dist/${file}`)
};

/* 오버레이·부속 부품은 화면 안에 놓는 것이 아니라 body 직계(placement) 또는 다른 부품의 부속이다.
   manifest.htmlContract.placement 가 있으면 자동 제외하고, 부속(다른 부품 예제 안에서만 쓰이는 것)은 여기서 제외한다. */
const SUBPART_IDS = new Set(["dropdown", "gnb-sub-menu", "gnb-sub-menu-item", "bottom-sheet-option"]);

const SPACING = ["0", "4", "8", "12", "16", "20", "24", "32", "40", "48", "64"];
const TYPO = ["typo-title-32b", "typo-title-24b", "typo-title-20b", "typo-title-18b", "typo-title-16b", "typo-title-14b",
  "typo-body-16r", "typo-body-14r", "typo-body-14m", "typo-body-12r", "typo-body-12m"];
const TEXT_COLORS = [
  ["title-primary", "제목 기본"], ["title-secondary", "제목 보조"],
  ["body-primary", "본문 기본"], ["body-secondary", "본문 보조"], ["body-tertiary", "본문 3차"]
];
const PLATFORM_BREAK = { web: "pc", app: "pc", mobile: "mobile" };
const STORAGE_KEY = "s1-pattern-builder-state";

/* ── 데이터 ─────────────────────────────────────────────────── */
const data = { dist: null, design: null, registry: null, catalog: null, manifests: {}, examples: {} };

async function fetchText(u) {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${r.status} ${u.pathname}`);
  return r.text();
}
const fetchJson = async (u) => JSON.parse(await fetchText(u));

async function loadAll() {
  const [dist, design, registry, catalog] = await Promise.all([
    fetchJson(URLS.distManifest), fetchJson(URLS.designManifest), fetchJson(URLS.registryIndex),
    fetchJson(URLS.catalog).catch(() => ({ patterns: [] }))
  ]);
  Object.assign(data, { dist, design, registry, catalog });
  const ids = (dist.components || []).map((c) => (typeof c === "string" ? c : c.id));
  await Promise.all(ids.map(async (id) => { data.manifests[id] = await fetchJson(URLS.componentManifest(id)); }));
}

async function exampleHtml(id, brk) {
  const m = data.manifests[id];
  const declared = m?.htmlContract?.breakExamples?.[brk]?.distribution;
  const file = declared || `examples/${id}.html`;
  if (!data.examples[file]) {
    try { data.examples[file] = await fetchText(URLS.distFile(file)); }
    catch { data.examples[file] = brk === "mobile" && !declared ? await exampleHtml(id, "pc") : ""; }
  }
  return data.examples[file];
}

/* ── 부품 축 읽기(manifest 그대로) ───────────────────────────── */
function registryName(id) {
  return data.registry?.components?.find((c) => c.id === id)?.name || id;
}
function registryCategory(id) {
  return data.registry?.components?.find((c) => c.id === id)?.category || "etc";
}
function categoryLabel(catId) {
  return data.registry?.categories?.find((c) => c.id === catId)?.label || catId;
}
function isPlaceable(id) {
  const m = data.manifests[id];
  if (!m) return false;
  if (m.htmlContract?.placement) return false;
  if (SUBPART_IDS.has(id)) return false;
  return true;
}
function availableOn(id, brk) {
  const m = data.manifests[id];
  if (!m?.breaks) return true;
  return Object.prototype.hasOwnProperty.call(m.breaks, brk);
}
function sizeAxis(id, brk) {
  const m = data.manifests[id];
  const fromBreak = m?.breaks?.[brk];
  if (Array.isArray(fromBreak) && fromBreak.length) return fromBreak;
  if (Array.isArray(m?.sizes) && m.sizes.length && !m?.breaks) return m.sizes;
  return [];
}
function variantAxis(id) {
  const v = data.manifests[id]?.variants || [];
  if (v.length <= 1) return [];
  return v;
}

/* ── 상태 ───────────────────────────────────────────────────── */
let uid = 0;
const nextId = (p) => `${p}${++uid}`;

function freshState() {
  const d = data.design?.defaults || {};
  return {
    version: 1,
    meta: { name: "", service: d.service || "core", platform: d.platform || "web", role: d.role || "user", theme: d.theme || "light" },
    screen: { padding: "24" },
    rows: []
  };
}
let state = freshState();
let selection = { rowId: null, blockId: null };

function findRow(rowId) { return state.rows.find((r) => r.id === rowId); }
function findBlock(blockId) {
  for (const r of state.rows) { const b = r.blocks.find((x) => x.id === blockId); if (b) return { row: r, block: b }; }
  return null;
}
function newRow() { return { id: nextId("r"), gap: "12", align: "start", marginBottom: "16", blocks: [] }; }

function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* 저장 불가 환경 */ } }
function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (s && s.version === 1 && Array.isArray(s.rows)) { state = s; reseedIds(); return true; }
  } catch { /* 무시 */ }
  return false;
}
/* 공유 링크 — #s=<base64(JSON)> 로 화면 구성을 주소에 담는다(river ↔ Claude 가 화면을 주고받는 용도). */
function encodeState() { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
function restoreFromHash() {
  const m = location.hash.match(/^#s=(.+)$/);
  if (!m) return false;
  try {
    const s = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if (s && s.version === 1 && Array.isArray(s.rows)) { state = s; reseedIds(); return true; }
  } catch { /* 잘못된 링크는 무시 */ }
  return false;
}
function reseedIds() {
  let max = 0;
  for (const r of state.rows) {
    max = Math.max(max, Number(String(r.id).replace(/\D/g, "")) || 0);
    for (const b of r.blocks) max = Math.max(max, Number(String(b.id).replace(/\D/g, "")) || 0);
  }
  uid = max;
}

/* ── 마크업 생성 ─────────────────────────────────────────────── */
function pickFragment(html, id) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  const roots = [...tpl.content.children];
  const hit = roots.find((el) => el.matches(`[data-s1-component="${id}"]`) || el.querySelector(`[data-s1-component="${id}"]`));
  return hit || roots[0] || null;
}

function uniquifyIds(el, suffix) {
  const map = new Map();
  el.querySelectorAll("[id]").forEach((n) => { map.set(n.id, `${n.id}-${suffix}`); n.id = `${n.id}-${suffix}`; });
  if (el.id) { map.set(el.id, `${el.id}-${suffix}`); el.id = `${el.id}-${suffix}`; }
  for (const attr of ["aria-controls", "aria-labelledby", "aria-describedby", "for"]) {
    el.querySelectorAll(`[${attr}]`).forEach((n) => {
      const v = n.getAttribute(attr).split(/\s+/).map((t) => map.get(t) || t).join(" ");
      n.setAttribute(attr, v);
    });
  }
}

function applyAxes(root, block, brk) {
  const comp = root.matches(`[data-s1-component="${block.component}"]`) ? root : root.querySelector(`[data-s1-component="${block.component}"]`);
  if (!comp) return;
  if (block.variant) {
    if (comp.hasAttribute("data-variant") || !comp.hasAttribute("data-type") && !comp.hasAttribute("data-icon")) comp.setAttribute("data-variant", block.variant);
    else if (comp.hasAttribute("data-type")) comp.setAttribute("data-type", block.variant);
    else if (comp.hasAttribute("data-icon")) comp.setAttribute("data-icon", block.variant);
  }
  if (block.size) comp.setAttribute("data-size", block.size);
  if (comp.hasAttribute("data-break")) comp.setAttribute("data-break", brk);
  if (block.text != null && block.text !== "") {
    const target = comp.querySelector('[data-s1-part="label"], [data-s1-part="title"], [data-s1-part="value"], [data-s1-part="lang-label"]');
    if (target) target.textContent = block.text;
    else {
      const ctl = comp.querySelector("input[placeholder], textarea[placeholder]");
      if (ctl) ctl.setAttribute("placeholder", block.text);
    }
  }
}

async function blockElement(block, brk) {
  const wrap = document.createElement("div");
  wrap.className = "s1-block";
  if (block.width === "fill") wrap.style.flex = "1 1 0";
  else if (block.width && block.width !== "auto") wrap.style.width = `${block.width}px`;

  if (block.kind === "text") {
    const p = document.createElement("p");
    p.className = `s1-text ${block.typo || "typo-body-14r"}`;
    p.style.color = `var(--color-text-${block.color || "body-primary"})`;
    p.style.margin = "0";
    p.textContent = block.text || "글자";
    wrap.appendChild(p);
    return wrap;
  }
  if (block.kind === "divider") {
    const hr = document.createElement("hr");
    hr.className = "s1-divider";
    wrap.style.flex = "1 1 0";
    wrap.appendChild(hr);
    return wrap;
  }
  if (block.kind === "space") {
    wrap.className += " s1-space";
    wrap.style.flex = "1 1 0";
    wrap.style.height = `var(--spacing-${block.height || "16"})`;
    return wrap;
  }
  let root;
  if (block.html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = block.html.trim();
    root = tpl.content.firstElementChild;
  } else {
    root = pickFragment(await exampleHtml(block.component, brk), block.component);
    if (root) { root = root.cloneNode(true); applyAxes(root, block, brk); }
  }
  if (!root) {
    const p = document.createElement("p");
    p.className = "s1-text typo-body-12r";
    p.style.color = "var(--color-text-state-caution)";
    p.textContent = `${block.component}: 배포 예제를 찾지 못했습니다`;
    wrap.appendChild(p);
    return wrap;
  }
  uniquifyIds(root, block.id);
  wrap.appendChild(root);
  return wrap;
}

const ALIGN_CSS = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };

async function renderScreen(target, editor) {
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  target.innerHTML = "";
  const screen = document.createElement("div");
  screen.className = "s1-screen";
  screen.style.padding = `var(--spacing-${state.screen.padding || "24"})`;
  for (const row of state.rows) {
    const rowEl = document.createElement("div");
    rowEl.className = "s1-row";
    rowEl.style.display = "flex";
    rowEl.style.flexWrap = "wrap";
    rowEl.style.alignItems = "flex-start";
    rowEl.style.gap = `var(--spacing-${row.gap || "12"})`;
    rowEl.style.justifyContent = ALIGN_CSS[row.align] || "flex-start";
    rowEl.style.marginBottom = `var(--spacing-${row.marginBottom || "16"})`;
    if (editor) {
      rowEl.dataset.pbRow = row.id;
      if (selection.rowId === row.id && !selection.blockId) rowEl.dataset.pbSelected = "true";
      if (!row.blocks.length) {
        const hint = document.createElement("p");
        hint.className = "s1-text typo-body-12r";
        hint.style.margin = "0"; hint.style.color = "var(--color-text-body-tertiary)";
        hint.textContent = "빈 행 — 왼쪽에서 부품을 누르면 이 행에 들어갑니다";
        rowEl.appendChild(hint);
      }
    }
    for (const block of row.blocks) {
      const el = await blockElement(block, brk);
      if (editor) {
        el.dataset.pbBlock = block.id;
        if (selection.blockId === block.id) el.dataset.pbSelected = "true";
      }
      rowEl.appendChild(el);
    }
    screen.appendChild(rowEl);
  }
  target.appendChild(screen);
  return screen;
}

/* ── 화면(에디터) ─────────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const els = {};

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.dataset.show = "true";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { els.toast.dataset.show = "false"; }, 1800);
}

function fillSelect(sel, options, value) {
  sel.innerHTML = options.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  if (value != null) sel.value = value;
}

function platformInfo() {
  const p = data.design?.profiles?.platform?.find((x) => x.id === state.meta.platform);
  return p || { id: state.meta.platform, container: "1200px", columns: 12 };
}

function renderToolbar() {
  const services = [["core", "공통(core)"], ...Object.keys(data.design?.services || {}).map((s) => [s, s]),
    ...(data.design?.servicesPlanned || []).map((s) => [s, `${s} (예정)`])];
  fillSelect(els.service, services, state.meta.service);
  fillSelect(els.platform, (data.design?.profiles?.platform || []).map((p) => [p.id, `${p.id} · ${p.container}`]), state.meta.platform);
  fillSelect(els.role, (data.design?.profiles?.role || []).map((r) => [r.id, `${r.id} · ${r.density}`]), state.meta.role);
  els.theme.value = state.meta.theme;
  els.name.value = state.meta.name || "";
  els.distVersion.textContent = `s1-ui ${data.dist?.version || ""}`;
}

function renderPatternList() {
  const list = els.patternList;
  const brk = state.meta.platform;
  const items = (data.catalog?.patterns || []).filter((p) => ["verified", "approved"].includes(p.status))
    .filter((p) => !p.platform || p.platform === brk)
    .filter((p) => !p.service || p.service === "core" || p.service === state.meta.service);
  if (!items.length) {
    list.innerHTML = `<div class="pb-empty">아직 등록된 패턴이 없습니다.<br>레거시 화면을 읽어 검증을 마친 패턴이 여기에 올라옵니다.</div>`;
    return;
  }
  list.innerHTML = items.map((p) => `<button type="button" class="pb-item" data-pattern="${p.id}"><span>${p.name}</span><small>${p.service || "core"} · ${p.platform || ""}</small></button>`).join("");
  list.querySelectorAll("[data-pattern]").forEach((b) => b.addEventListener("click", () => loadPattern(b.dataset.pattern)));
}

function loadPattern(id) {
  const p = (data.catalog?.patterns || []).find((x) => x.id === id);
  if (!p?.layout?.rows) return;
  state.rows = JSON.parse(JSON.stringify(p.layout.rows));
  state.meta.name = state.meta.name || p.name;
  reseedIds();
  selection = { rowId: null, blockId: null };
  update();
  toast(`패턴 "${p.name}" 을 불러왔습니다`);
}

function renderHelperList() {
  els.helperList.innerHTML = [
    ["text", "글자", "제목·본문 글자"],
    ["divider", "구분선", "1px 가는 선"],
    ["space", "빈 칸", "세로 간격"]
  ].map(([k, n, d]) => `<button type="button" class="pb-item" data-helper="${k}"><span>${n}</span><small>${d}</small></button>`).join("");
  els.helperList.querySelectorAll("[data-helper]").forEach((b) => b.addEventListener("click", () => addBlock({ kind: b.dataset.helper })));
}

function renderPartGroups() {
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  const ids = Object.keys(data.manifests).filter(isPlaceable);
  const groups = new Map();
  for (const id of ids) {
    const cat = registryCategory(id);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(id);
  }
  const order = (data.registry?.categories || []).map((c) => c.id);
  const sorted = [...groups.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  els.partGroups.innerHTML = sorted.map(([cat, list]) => `
    <p class="pb-group-label">${categoryLabel(cat)}</p>
    <div class="pb-list">${list.map((id) => {
      const ok = availableOn(id, brk);
      const axes = [variantAxis(id).length ? `변형 ${variantAxis(id).length}` : "", sizeAxis(id, brk).length ? `크기 ${sizeAxis(id, brk).length}` : ""].filter(Boolean).join(" · ");
      return `<button type="button" class="pb-item" data-part="${id}" data-unavailable="${!ok}" ${ok ? "" : 'title="이 플랫폼 배포본이 없습니다"'}><span>${registryName(id)}</span><small>${ok ? axes : "이 플랫폼 없음"}</small></button>`;
    }).join("")}</div>`).join("");
  els.partGroups.querySelectorAll("[data-part]").forEach((b) => {
    if (b.dataset.unavailable === "true") return;
    b.addEventListener("click", () => addComponent(b.dataset.part));
  });
}

function targetRow() {
  let row = selection.rowId ? findRow(selection.rowId) : null;
  if (!row && selection.blockId) row = findBlock(selection.blockId)?.row || null;
  if (!row) row = state.rows[state.rows.length - 1];
  if (!row) { row = newRow(); state.rows.push(row); }
  return row;
}

function addComponent(id) {
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  const block = { id: nextId("b"), kind: "component", component: id, width: "auto" };
  const v = variantAxis(id); if (v.length) block.variant = v[0];
  const s = sizeAxis(id, brk); if (s.length) block.size = s[0];
  addBlock(block);
}

function addBlock(partial) {
  const block = { id: partial.id || nextId("b"), width: "auto", ...partial };
  if (block.kind === "text") { block.text = block.text || "제목"; block.typo = block.typo || "typo-title-20b"; block.color = block.color || "title-primary"; }
  if (block.kind === "space") block.height = block.height || "16";
  const row = targetRow();
  row.blocks.push(block);
  selection = { rowId: row.id, blockId: block.id };
  update();
}

function removeBlock(blockId) {
  const hit = findBlock(blockId); if (!hit) return;
  hit.row.blocks = hit.row.blocks.filter((b) => b.id !== blockId);
  selection = { rowId: hit.row.id, blockId: null };
  update();
}
function moveBlock(blockId, dir) {
  const hit = findBlock(blockId); if (!hit) return;
  const i = hit.row.blocks.indexOf(hit.block);
  if (dir === "left" || dir === "right") {
    const j = dir === "left" ? i - 1 : i + 1;
    if (j < 0 || j >= hit.row.blocks.length) return;
    [hit.row.blocks[i], hit.row.blocks[j]] = [hit.row.blocks[j], hit.row.blocks[i]];
  } else {
    const ri = state.rows.indexOf(hit.row);
    const rj = dir === "up" ? ri - 1 : ri + 1;
    if (rj < 0 || rj >= state.rows.length) return;
    hit.row.blocks.splice(i, 1);
    state.rows[rj].blocks.push(hit.block);
    selection.rowId = state.rows[rj].id;
  }
  update();
}
function duplicateBlock(blockId) {
  const hit = findBlock(blockId); if (!hit) return;
  const copy = { ...JSON.parse(JSON.stringify(hit.block)), id: nextId("b") };
  hit.row.blocks.splice(hit.row.blocks.indexOf(hit.block) + 1, 0, copy);
  selection.blockId = copy.id;
  update();
}
function removeRow(rowId) {
  state.rows = state.rows.filter((r) => r.id !== rowId);
  selection = { rowId: null, blockId: null };
  update();
}
function moveRow(rowId, dir) {
  const i = state.rows.findIndex((r) => r.id === rowId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= state.rows.length) return;
  [state.rows[i], state.rows[j]] = [state.rows[j], state.rows[i]];
  update();
}

/* ── 속성 패널 ───────────────────────────────────────────────── */
function propRow(label, control) { return `<div class="pb-prop"><label>${label}</label>${control}</div>`; }
function selectHtml(name, options, value) {
  return `<select data-prop="${name}">${options.map(([v, l]) => `<option value="${v}" ${String(v) === String(value) ? "selected" : ""}>${l}</option>`).join("")}</select>`;
}
const spacingOpts = SPACING.map((s) => [s, `${s}px`]);

function renderProps() {
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  const hit = selection.blockId ? findBlock(selection.blockId) : null;
  const row = hit?.row || (selection.rowId ? findRow(selection.rowId) : null);
  const parts = [];

  if (hit) {
    const b = hit.block;
    parts.push(`<p class="pb-section-title">선택한 요소</p>`);
    if (b.kind === "component") {
      const m = data.manifests[b.component];
      parts.push(`<p class="pb-note"><strong>${registryName(b.component)}</strong> · 배포본 ${m?.version || ""}${m?.jsRequired ? " · JS 필요" : ""}</p>`);
      const v = variantAxis(b.component);
      if (v.length) parts.push(propRow("변형", selectHtml("variant", v.map((x) => [x, x]), b.variant)));
      const s = sizeAxis(b.component, brk);
      if (s.length) parts.push(propRow("크기", selectHtml("size", s.map((x) => [x, x]), b.size)));
      parts.push(propRow("글자", `<input type="text" data-prop="text" value="${escapeAttr(b.text || "")}" placeholder="첫 라벨/제목 바꾸기">`));
    } else if (b.kind === "text") {
      parts.push(propRow("내용", `<input type="text" data-prop="text" value="${escapeAttr(b.text || "")}">`));
      parts.push(propRow("글꼴", selectHtml("typo", TYPO.map((t) => [t, t.replace("typo-", "")]), b.typo)));
      parts.push(propRow("색", selectHtml("color", TEXT_COLORS, b.color)));
    } else if (b.kind === "space") {
      parts.push(propRow("높이", selectHtml("height", spacingOpts, b.height)));
    } else {
      parts.push(`<p class="pb-note">구분선 — 행 폭을 채웁니다.</p>`);
    }
    if (b.kind !== "divider" && b.kind !== "space") {
      parts.push(propRow("폭", selectHtml("width", [["auto", "내용만큼"], ["fill", "남은 폭 채우기"], ["200", "200px"], ["320", "320px"], ["480", "480px"]], b.width || "auto")));
    }
    parts.push(`<div class="pb-prop-actions">
      <button type="button" class="pb-btn pb-btn-sm" data-act="left">← 왼쪽</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="right">오른쪽 →</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="up">↑ 윗행</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="down">↓ 아랫행</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="dup">복제</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="del">삭제</button>
    </div>`);
    if (b.kind === "component") {
      parts.push(`<details><summary class="pb-note" style="cursor:pointer">마크업 직접 수정 (고급)</summary>
        <div class="pb-prop"><textarea data-prop="html" placeholder="비우면 배포 예제로 되돌립니다">${escapeHtml(b.html || "")}</textarea></div>
        <button type="button" class="pb-btn pb-btn-sm" data-act="apply-html">적용</button></details>`);
    }
  }

  if (row) {
    parts.push(`<p class="pb-section-title">행</p>`);
    parts.push(propRow("정렬", selectHtml("row.align", [["start", "왼쪽"], ["center", "가운데"], ["end", "오른쪽"], ["between", "양끝"]], row.align)));
    parts.push(propRow("요소 간격", selectHtml("row.gap", spacingOpts, row.gap)));
    parts.push(propRow("아래 여백", selectHtml("row.marginBottom", spacingOpts, row.marginBottom)));
    parts.push(`<div class="pb-prop-actions">
      <button type="button" class="pb-btn pb-btn-sm" data-act="row-up">행 위로</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="row-down">행 아래로</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="row-del">행 삭제</button>
    </div>`);
  }

  parts.push(`<p class="pb-section-title">화면</p>`);
  parts.push(propRow("안쪽 여백", selectHtml("screen.padding", spacingOpts, state.screen.padding)));
  if (!hit && !row) parts.push(`<p class="pb-note">캔버스에서 요소나 행을 누르면 여기서 고칩니다. 왼쪽 부품을 누르면 마지막 행에 들어갑니다.</p>`);

  els.props.innerHTML = parts.join("");

  els.props.querySelectorAll("[data-prop]").forEach((ctl) => {
    if (ctl.dataset.prop === "html") return;
    ctl.addEventListener("change", () => setProp(ctl.dataset.prop, ctl.value));
    if (ctl.tagName === "INPUT") ctl.addEventListener("keydown", (e) => { if (e.key === "Enter") setProp(ctl.dataset.prop, ctl.value); });
  });
  els.props.querySelectorAll("[data-act]").forEach((btn) => btn.addEventListener("click", () => {
    const act = btn.dataset.act;
    const id = selection.blockId;
    if (act === "left" || act === "right" || act === "up" || act === "down") moveBlock(id, act);
    else if (act === "dup") duplicateBlock(id);
    else if (act === "del") removeBlock(id);
    else if (act === "row-up") moveRow(row.id, "up");
    else if (act === "row-down") moveRow(row.id, "down");
    else if (act === "row-del") removeRow(row.id);
    else if (act === "apply-html") { const ta = els.props.querySelector('[data-prop="html"]'); setProp("html", ta.value.trim()); }
  }));
}

function setProp(name, value) {
  if (name.startsWith("row.")) {
    const row = selection.blockId ? findBlock(selection.blockId)?.row : findRow(selection.rowId);
    if (row) row[name.slice(4)] = value;
  } else if (name.startsWith("screen.")) {
    state.screen[name.slice(7)] = value;
  } else {
    const hit = findBlock(selection.blockId);
    if (!hit) return;
    if (name === "html") { if (value) hit.block.html = value; else delete hit.block.html; }
    else hit.block[name] = value;
  }
  update();
}

/* ── 렌더·갱신 ─────────────────────────────────────────────── */
async function renderCanvas() {
  const p = platformInfo();
  els.canvas.style.maxWidth = p.container;
  els.canvas.dataset.theme = state.meta.theme;
  els.frameLabel.textContent = `${p.id} · ${p.container} · ${p.columns}열 · ${state.meta.role} · ${state.meta.theme}`;
  els.frameInfo.textContent = state.rows.length ? `행 ${state.rows.length} · 요소 ${state.rows.reduce((n, r) => n + r.blocks.length, 0)}` : "";
  if (!state.rows.length) {
    els.canvas.innerHTML = `<div class="pb-canvas-empty">아직 비어 있습니다.<br>왼쪽에서 패턴을 고르거나 부품을 눌러 놓아 보세요.</div>`;
    return;
  }
  const screen = await renderScreen(els.canvas, true);
  try { autoInit(screen); } catch (e) { console.warn("autoInit", e); }
  screen.querySelectorAll("[data-pb-block]").forEach((el) => el.addEventListener("click", (e) => {
    e.stopPropagation();
    const row = el.closest("[data-pb-row]");
    selection = { rowId: row?.dataset.pbRow || null, blockId: el.dataset.pbBlock };
    markSelection(); renderProps();
  }, true));
  screen.querySelectorAll("[data-pb-row]").forEach((el) => el.addEventListener("click", () => {
    selection = { rowId: el.dataset.pbRow, blockId: null };
    markSelection(); renderProps();
  }));
}
function markSelection() {
  els.canvas.querySelectorAll("[data-pb-row]").forEach((el) => { el.dataset.pbSelected = String(selection.rowId === el.dataset.pbRow && !selection.blockId); });
  els.canvas.querySelectorAll("[data-pb-block]").forEach((el) => { el.dataset.pbSelected = String(selection.blockId === el.dataset.pbBlock); });
}

let rendering = false, queued = false;
async function update() {
  persist();
  renderProps();
  if (rendering) { queued = true; return; }
  rendering = true;
  try { await renderCanvas(); } finally { rendering = false; if (queued) { queued = false; update(); } }
}

/* ── 내보내기 ───────────────────────────────────────────────── */
const EXPORT_CSS = `
.s1-screen { box-sizing: border-box; margin: 0 auto; background: var(--color-bg-level-0); color: var(--color-text-body-primary); font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.s1-row { display: flex; flex-wrap: wrap; align-items: flex-start; }
.s1-block { min-width: 0; }
.s1-text { margin: 0; }
.s1-divider { border: 0; border-top: 1px solid var(--color-line-gray-subtle); margin: 0; width: 100%; }
`.trim();

async function buildExportHtml() {
  const holder = document.createElement("div");
  const screen = await renderScreen(holder, false);
  const p = platformInfo();
  screen.style.maxWidth = p.container;
  screen.setAttribute("data-s1-service", state.meta.service);
  screen.setAttribute("data-s1-platform", state.meta.platform);
  screen.setAttribute("data-s1-role", state.meta.role);
  const base = "./s1-ui/";
  const title = state.meta.name || "S1 화면";
  return `<!DOCTYPE html>
<!-- Pattern Builder 내보내기 · s1-ui ${data.dist?.version || ""} · ${new Date().toISOString().slice(0, 10)}
     부품 CSS/JS 는 ui-library/dist 배포본을 ${base} 아래에 그대로 두고 씁니다(tokens.css · typography.css · s1-ui.css · s1-ui.auto.js). -->
<html lang="ko" data-theme="${state.meta.theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="${base}assets/css/tokens.css">
  <link rel="stylesheet" href="${base}assets/css/typography.css">
  <link rel="stylesheet" href="${base}s1-ui.css">
  <style>
    body { margin: 0; background: var(--color-bg-level-1); }
    ${EXPORT_CSS.split("\n").join("\n    ")}
  </style>
</head>
<body>
${indent(screen.outerHTML, 2)}
<script type="module">
  import { autoInit } from "${base}s1-ui.auto.js";
  autoInit();
</script>
</body>
</html>
`;
}

function indent(html, n) { const pad = " ".repeat(n); return html.split("\n").map((l) => pad + l).join("\n"); }
function download(name, text, type = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function slug(s) { return (s || "screen").trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase() || "screen"; }

/* ── 새 패턴 요청 ────────────────────────────────────────────── */
function requestPayload() {
  return {
    kind: "pattern-request",
    requestedAt: new Date().toISOString(),
    name: els.reqName.value.trim(),
    purpose: els.reqPurpose.value.trim(),
    notes: els.reqNotes.value.trim(),
    context: { ...state.meta },
    draftLayout: { screen: state.screen, rows: state.rows },
    distVersion: data.dist?.version || null
  };
}
function openRequest() {
  els.reqName.value = state.meta.name || "";
  els.reqPreview.hidden = true;
  els.requestDialog.dataset.open = "true";
  els.reqName.focus();
}
function closeRequest() { els.requestDialog.dataset.open = "false"; }

/* ── 유틸 ───────────────────────────────────────────────────── */
function escapeHtml(v) { return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function escapeAttr(v) { return escapeHtml(v).replaceAll('"', "&quot;"); }

/* ── 시작 ───────────────────────────────────────────────────── */
async function main() {
  Object.assign(els, {
    name: $("#pb-name"), service: $("#pb-service"), platform: $("#pb-platform"), role: $("#pb-role"), theme: $("#pb-theme"),
    distVersion: $("#pb-dist-version"), patternList: $("#pb-pattern-list"), helperList: $("#pb-helper-list"), partGroups: $("#pb-part-groups"),
    canvas: $("#pb-canvas"), frameLabel: $("#pb-frame-label"), frameInfo: $("#pb-frame-info"), props: $("#pb-props"), toast: $("#pb-toast"),
    requestDialog: $("#pb-request-dialog"), reqName: $("#pb-req-name"), reqPurpose: $("#pb-req-purpose"), reqNotes: $("#pb-req-notes"), reqPreview: $("#pb-req-preview")
  });
  try { await loadAll(); }
  catch (e) {
    els.canvas.innerHTML = `<div class="pb-canvas-empty">배포본을 읽지 못했습니다.<br>이 페이지는 로컬 서버(http://…)로 열어야 합니다. file:// 로 열면 배포본을 읽을 수 없습니다.<br><small>${escapeHtml(e.message)}</small></div>`;
    console.error(e);
    return;
  }
  if (!restoreFromHash() && !restore()) state = freshState();

  renderToolbar(); renderPatternList(); renderHelperList(); renderPartGroups();
  await update();

  els.name.addEventListener("input", () => { state.meta.name = els.name.value; persist(); });
  els.service.addEventListener("change", () => { state.meta.service = els.service.value; renderPatternList(); update(); });
  els.platform.addEventListener("change", () => {
    state.meta.platform = els.platform.value;
    const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
    for (const r of state.rows) for (const b of r.blocks) {
      if (b.kind !== "component") continue;
      const s = sizeAxis(b.component, brk);
      if (s.length && !s.includes(b.size)) b.size = s[0];
      if (!s.length) delete b.size;
    }
    renderPatternList(); renderPartGroups(); update();
  });
  els.role.addEventListener("change", () => { state.meta.role = els.role.value; update(); });
  els.theme.addEventListener("change", () => { state.meta.theme = els.theme.value; update(); });

  $("#pb-add-row").addEventListener("click", () => { const r = newRow(); state.rows.push(r); selection = { rowId: r.id, blockId: null }; update(); });
  $("#pb-new").addEventListener("click", () => {
    if (state.rows.length && !confirm("지금 화면을 비우고 새로 시작할까요? (저장하지 않은 구성은 사라집니다)")) return;
    state = freshState(); selection = { rowId: null, blockId: null }; renderToolbar(); update();
  });
  $("#pb-save").addEventListener("click", () => download(`screen-${slug(state.meta.name)}.json`, JSON.stringify(state, null, 2), "application/json"));
  $("#pb-load-file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const s = JSON.parse(await f.text());
      if (s.version !== 1 || !Array.isArray(s.rows)) throw new Error("형식이 다릅니다");
      state = s; reseedIds(); selection = { rowId: null, blockId: null }; renderToolbar(); renderPartGroups(); update(); toast("불러왔습니다");
    } catch (err) { toast(`불러오기 실패: ${err.message}`); }
    e.target.value = "";
  });
  $("#pb-export").addEventListener("click", async () => {
    if (!state.rows.length) { toast("내보낼 요소가 없습니다"); return; }
    download(`${slug(state.meta.name)}.html`, await buildExportHtml(), "text/html");
    toast("HTML 파일을 저장했습니다");
  });
  $("#pb-share").addEventListener("click", async () => {
    const link = `${location.origin}${location.pathname}#s=${encodeState()}`;
    history.replaceState(null, "", `#s=${encodeState()}`);
    try { await navigator.clipboard.writeText(link); toast("이 화면의 링크를 복사했습니다"); } catch { toast("주소창의 링크를 복사해 주세요"); }
  });
  $("#pb-request").addEventListener("click", openRequest);
  $("#pb-req-cancel").addEventListener("click", closeRequest);
  els.requestDialog.addEventListener("click", (e) => { if (e.target === els.requestDialog) closeRequest(); });
  $("#pb-req-copy").addEventListener("click", async () => {
    const text = JSON.stringify(requestPayload(), null, 2);
    els.reqPreview.textContent = text; els.reqPreview.hidden = false;
    try { await navigator.clipboard.writeText(text); toast("요청 내용을 복사했습니다"); } catch { toast("아래 내용을 직접 복사해 주세요"); }
  });
  $("#pb-req-download").addEventListener("click", () => {
    const p = requestPayload();
    if (!p.name) { toast("패턴 이름을 적어 주세요"); els.reqName.focus(); return; }
    download(`pattern-request-${slug(p.name)}.json`, JSON.stringify(p, null, 2), "application/json");
    toast("요청 파일을 저장했습니다 — reports/pattern-builder/requests/ 에 두면 됩니다");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeRequest();
    if ((e.key === "Delete" || e.key === "Backspace") && selection.blockId && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
      e.preventDefault(); removeBlock(selection.blockId);
    }
  });
}

/* 자동 검사·다른 스크립트가 쓰는 읽기용 창구 — 화면 상태를 바꾸는 용도가 아니다. */
window.S1PatternBuilder = {
  getState: () => JSON.parse(JSON.stringify(state)),
  buildExportHtml,
  loadState: (s) => { state = s; reseedIds(); selection = { rowId: null, blockId: null }; renderToolbar(); renderPartGroups(); return update(); }
};

main();
