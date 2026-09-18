/* ============================================================
   Pattern Builder · builder.js
   ------------------------------------------------------------
   배포본(ui-library/dist)의 부품만 조립해 화면을 만들고 HTML/CSS 로 내보낸다.
   - 부품·크기·변형 축은 각 부품의 dist manifest 에서 읽는다(새 이름을 만들지 않는다).
   - 마크업은 dist/examples 의 배포 예제를 그대로 가져와 속성만 바꾼다.
   - 패턴 목록은 registry/patterns/builder/catalog.json 을 읽기만 한다.
   - 플랫폼·역할·테마 축은 design/design.manifest.json 을 읽는다.
   ============================================================ */
import { autoInit } from "../ui-library/dist/s1-ui.auto.js";

const url = (rel) => new URL(rel, import.meta.url);
const URLS = {
  distManifest: url("../ui-library/dist/manifest.json"),
  designManifest: url("../design/design.manifest.json"),
  registryIndex: url("../registry/components/index.json"),
  catalog: url("../registry/patterns/builder/catalog.json"),
  componentManifest: (id) => url(`../ui-library/dist/components/${id}.manifest.json`),
  componentSpec: (id) => url(`../registry/components/${id}.json`),
  distFile: (file) => url(`../ui-library/dist/${file}`)
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
/* 화면 틀(프레임) — river 결정 2026-09-18: PC 1920×1080 · 모바일 360×780.
   break 는 배포본 manifest 의 breaks 키(pc | mobile)와 잇는다. 옛 저장본의 web/app 값은 pc 로 읽는다. */
const PLATFORMS = [
  { id: "pc", label: "PC · 1920×1080", width: 1920, height: 1080, break: "pc" },
  { id: "mobile", label: "모바일 · 360×780", width: 360, height: 780, break: "mobile" }
];
const PLATFORM_ALIAS = { web: "pc", app: "pc" };
const PLATFORM_BREAK = { pc: "pc", mobile: "mobile", web: "pc", app: "pc" };
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
  data.specs = {};
  await Promise.all(ids.map(async (id) => {
    try { data.specs[id] = await fetchJson(URLS.componentSpec(id)); } catch { data.specs[id] = {}; }
  }));
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
/* 빌더 화면에서만 쓰는 한글 찾기말 — **정본 이름이 아니다.**
   정본에는 부품의 한글 이름이 없어서(legacy:resolve 도 "모름") 검색이 안 되던 것을 메우는 화면용 낱말이다.
   카드에 보이는 이름은 정본 영문 이름 그대로 두고, 이 낱말은 검색에만 쓴다. 정본 승격은 river 결정 사항. */
const SEARCH_KO = {
  button: ["버튼", "확인 저장 취소 액션"],
  "assist-button": ["보조 버튼", "아이콘 버튼 작은 동작"],
  "text-button": ["텍스트 버튼", "링크 더보기 자세히"],
  checkbox: ["체크박스", "다중 선택 동의"],
  radio: ["라디오", "단일 선택 하나만"],
  toggle: ["토글", "스위치 켜기 끄기"],
  "multi-toggle": ["멀티 토글", "분절 선택 정렬 기간"],
  chip: ["칩", "태그 라벨"],
  "filter-chip": ["필터 칩", "조건 필터 검색 조건"],
  input: ["입력창", "텍스트 필드 검색창 비밀번호"],
  select: ["셀렉트 박스", "선택 상자 고르기 목록"],
  textarea: ["여러 줄 입력창", "메모 설명 긴 글"],
  "date-picker": ["날짜 선택", "달력 캘린더 기간"],
  "time-picker": ["시간 선택", "시 분 시각"],
  table: ["표", "테이블 목록 행 열 데이터"],
  pagination: ["페이지 이동", "페이지네이션 쪽번호"],
  tab: ["탭", "라인 탭 화면 전환"],
  gnb: ["상단 메뉴", "전역 내비게이션 지엔비 헤더"],
  "mobile-header": ["모바일 상단 헤더", "앱바 뒤로가기 제목"],
  "mobile-bottom-nav": ["모바일 하단 메뉴", "하단 탭바 내비"],
  dropdown: ["드롭다운", "목록 옵션 펼침"],
  modal: ["모달", "팝업 확인창 알림"],
  "modal-content": ["내용 모달", "큰 팝업 본문"],
  "bottom-sheet": ["바텀시트", "하단 시트"],
  "bottom-sheet-option": ["바텀시트 항목", "옵션 줄"],
  "gnb-sub-menu": ["하위 메뉴 패널", "서브 메뉴"],
  "gnb-sub-menu-item": ["하위 메뉴 항목", "서브 메뉴 줄"]
};
const koLabel = (id) => SEARCH_KO[id]?.[0] || "";
/* 검색 대상 글 — 정본 이름·id·분류 + registry 의 한글 사용맥락 + 위 화면용 찾기말 */
function searchText(id) {
  const spec = data.specs?.[id] || {};
  const bits = [registryName(id), id, categoryLabel(registryCategory(id)), (SEARCH_KO[id] || []).join(" "),
    JSON.stringify(spec.usage || ""), JSON.stringify(spec.summary || ""), spec._meta?.title || ""];
  return bits.join(" ").replace(/[{}\[\]"\\]/g, " ");
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
/* 배포본 manifest 에 breaks(플랫폼별 크기 축)가 없는 부품의 플랫폼 — 이름·가이드 설명이 플랫폼을 명시한 것만 적는다.
   (GNB 는 PC 웹 상단 메뉴, Mobile Header·Mobile Bottom Nav 는 모바일 전용. 나머지 breaks 없는 부품은 양쪽 공통으로 본다 — river 확인 대상) */
const PLATFORM_ONLY = { gnb: ["pc"], "mobile-header": ["mobile"], "mobile-bottom-nav": ["mobile"] };
function availableOn(id, brk) {
  const m = data.manifests[id];
  if (m?.breaks) return Object.prototype.hasOwnProperty.call(m.breaks, brk);
  if (PLATFORM_ONLY[id]) return PLATFORM_ONLY[id].includes(brk);
  return true;
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
    meta: { name: "", service: d.service || "core", platform: "pc", role: d.role || "user", theme: d.theme || "light" },
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
  else if (block.width === "custom") wrap.style.width = `${Number(block.widthPx) || 320}px`;
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
  } else if (block.component === "table" && block.table) {
    root = buildTableElement(block);
    applyAxes(root, block, brk);
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

/* ── 표(table) 모델 — 배포 예제의 구조(htmlContract)를 그대로 지키면서 열·행 수만 화면에서 정한다 ── */
function tableModelFromExample(html) {
  const root = pickFragment(html, "table");
  const model = { selection: false, rows: 3, columns: [] };
  if (!root) { model.columns = [{ label: "항목명" }, { label: "카테고리" }, { label: "수량", align: "center" }, { label: "상태", align: "center" }]; return model; }
  root.querySelectorAll('thead th[data-s1-part="header-cell"]').forEach((th) => {
    if (th.hasAttribute("data-selection")) { model.selection = true; return; }
    const col = { label: th.textContent.trim() };
    if (th.dataset.align) col.align = th.dataset.align;
    model.columns.push(col);
  });
  model.rows = root.querySelectorAll('tbody tr[data-s1-part="row"]').length || 3;
  return model;
}

function buildTableElement(block) {
  const t = block.table;
  const root = document.createElement("div");
  root.setAttribute("data-s1-component", "table");
  root.setAttribute("data-size", block.size || "md");
  const table = document.createElement("table");
  table.setAttribute("data-s1-part", "table");
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  const checkbox = (label) => {
    const box = document.createElement("div");
    box.setAttribute("data-s1-component", "checkbox");
    const input = document.createElement("input");
    input.type = "checkbox"; input.setAttribute("data-s1-part", "control"); input.setAttribute("aria-label", label);
    box.appendChild(input);
    return box;
  };
  if (t.selection) {
    const th = document.createElement("th");
    th.setAttribute("data-s1-part", "header-cell"); th.setAttribute("data-selection", ""); th.setAttribute("scope", "col");
    th.appendChild(checkbox("전체 선택"));
    hr.appendChild(th);
  }
  t.columns.forEach((col) => {
    const th = document.createElement("th");
    th.setAttribute("data-s1-part", "header-cell"); th.setAttribute("scope", "col");
    if (col.align) th.setAttribute("data-align", col.align);
    if (Number(col.width)) th.style.width = `${Number(col.width)}px`;
    th.textContent = col.label || "";
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  const tbody = document.createElement("tbody");
  for (let i = 1; i <= (Number(t.rows) || 0); i++) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-s1-part", "row");
    if (t.selection) {
      const td = document.createElement("td");
      td.setAttribute("data-s1-part", "cell"); td.setAttribute("data-selection", "");
      td.appendChild(checkbox(`항목 ${i} 선택`));
      tr.appendChild(td);
    }
    t.columns.forEach((col, ci) => {
      const td = document.createElement("td");
      td.setAttribute("data-s1-part", "cell");
      if (col.align) td.setAttribute("data-align", col.align);
      const custom = (t.cells && t.cells[i - 1] && t.cells[i - 1][ci]);
      td.textContent = custom != null && custom !== "" ? custom : `${col.label || "내용"} ${i}`;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(thead); table.appendChild(tbody);
  root.appendChild(table);
  return root;
}

const ALIGN_CSS = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };

async function renderScreen(target, editor) {
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  target.innerHTML = "";
  const screen = document.createElement("div");
  screen.className = "s1-screen";
  screen.style.padding = `var(--spacing-${state.screen.padding || "24"})`;
  const gapAt = (index) => {                             // 줄 사이 놓을 자리(편집 모드에서만)
    const gap = document.createElement("div");
    gap.className = "pb-gap"; gap.dataset.pbGap = String(index);
    gap.innerHTML = `<span>여기에 새 줄</span>`;
    wireDropZone(gap, () => ({ index }));
    return gap;
  };
  for (let ri = 0; ri < state.rows.length; ri++) {
    const row = state.rows[ri];
    if (editor) screen.appendChild(gapAt(ri));
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
        hint.textContent = "빈 줄 — 부품을 끌어다 놓거나 왼쪽에서 누르면 여기에 들어갑니다";
        rowEl.appendChild(hint);
      }
      wireDropZone(rowEl, () => ({ row }));
    }
    for (const block of row.blocks) {
      const el = await blockElement(block, brk);
      if (editor) {
        el.dataset.pbBlock = block.id;
        if (block.kind === "component" && !availableOn(block.component, brk)) el.dataset.pbOffPlatform = "true";
        el.draggable = true;
        el.addEventListener("dragstart", (e) => { e.stopPropagation(); startDrag(e, { blockId: block.id }); });
        el.addEventListener("dragend", endDrag);
        if (selection.blockId === block.id) el.dataset.pbSelected = "true";
      }
      rowEl.appendChild(el);
    }
    screen.appendChild(rowEl);
  }
  if (editor) screen.appendChild(gapAt(state.rows.length));
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
  const id = PLATFORM_ALIAS[state.meta.platform] || state.meta.platform;
  return PLATFORMS.find((x) => x.id === id) || PLATFORMS[0];
}

/* 캔버스를 프레임 실제 크기(1920 등)로 그리고, 무대 폭에 맞춰 축소해 보여준다. */
function fitCanvas() {
  const p = platformInfo();
  const stage = els.canvasWrap.parentElement;            // .pb-stage (무대) — 래퍼가 아니라 무대 폭을 기준으로 잰다
  const avail = Math.max(200, stage.clientWidth - 48);
  const scale = Math.min(1, avail / p.width);
  els.canvas.style.width = `${p.width}px`;
  els.canvas.style.minHeight = `${p.height}px`;
  els.canvas.style.transform = `scale(${scale})`;
  els.canvas.style.transformOrigin = "top left";
  els.canvas.style.marginLeft = scale < 1 ? "0" : "auto";
  els.canvasWrap.style.height = `${Math.ceil(els.canvas.offsetHeight * scale)}px`;
  els.canvasWrap.style.width = scale < 1 ? `${Math.ceil(p.width * scale)}px` : `${p.width}px`;
  els.frameLabel.textContent = `${p.label} · ${state.meta.role} · ${state.meta.theme}${scale < 1 ? ` · 미리보기 ${Math.round(scale * 100)}%` : ""}`;
}

function renderToolbar() {
  const services = [["core", "공통(core)"], ...Object.keys(data.design?.services || {}).map((s) => [s, s]),
    ...(data.design?.servicesPlanned || []).map((s) => [s, `${s} (예정)`])];
  fillSelect(els.service, services, state.meta.service);
  state.meta.platform = PLATFORM_ALIAS[state.meta.platform] || state.meta.platform;
  fillSelect(els.platform, PLATFORMS.map((p) => [p.id, p.label]), state.meta.platform);
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
  list.innerHTML = items.map((p) => `<button type="button" class="pb-item" data-pattern="${p.id}" data-search="${escapeAttr(`${p.name} ${p.id} ${p.description || ""}`)}"><span>${p.name}</span><small>${p.service || "core"} · ${p.platform || ""}</small></button>`).join("");
  list.querySelectorAll("[data-pattern]").forEach((b) => b.addEventListener("click", () => loadPattern(b.dataset.pattern)));
  applySearch();
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

const HELPERS = [
  ["text", "글자", "제목·본문 글자"],
  ["divider", "구분선", "1px 가는 선"],
  ["space", "빈 칸", "세로 간격"]
];
function renderHelperList() {
  els.helperList.innerHTML = HELPERS.map(([k, n, d]) => `<div class="pb-item pb-item-helper" data-helper="${k}" data-search="${escapeAttr(`${n} ${d} ${k}`)}" draggable="true" role="button" tabindex="0"><span>${n}</span><small>${d}</small></div>`).join("");
  els.helperList.querySelectorAll("[data-helper]").forEach((b) => {
    b.addEventListener("click", () => addBlock({ kind: b.dataset.helper }));
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addBlock({ kind: b.dataset.helper }); } });
    b.addEventListener("dragstart", (e) => startDrag(e, { kind: b.dataset.helper }));
    b.addEventListener("dragend", endDrag);
  });
  applySearch();
}

/* ── 검색 — 패턴·레이아웃 보조·부품 이름으로 거른다 ── */
function applySearch() {
  const q = (els.search?.value || "").trim().toLowerCase();
  const items = document.querySelectorAll("#pb-pattern-list [data-search], #pb-helper-list [data-search], #pb-part-groups [data-search]");
  items.forEach((el) => { el.hidden = Boolean(q) && !el.dataset.search.toLowerCase().includes(q); });
  document.querySelectorAll("#pb-part-groups .pb-group").forEach((g) => {
    g.hidden = [...g.querySelectorAll("[data-search]")].every((el) => el.hidden);
  });
  if (els.searchEmpty) els.searchEmpty.hidden = !q || [...items].some((el) => !el.hidden);
}

/* ── 드래그 앤 드롭 — 팔레트 카드·캔버스 요소를 줄이나 줄 사이로 끌어 놓는다 ── */
const DRAG_MIME = "application/x-s1-builder";
let dragPayload = null;
function startDrag(e, payload) {
  dragPayload = payload;
  try { e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload)); e.dataTransfer.setData("text/plain", payload.component || payload.kind || "block"); } catch { /* 일부 브라우저 */ }
  e.dataTransfer.effectAllowed = payload.blockId ? "move" : "copy";
  document.body.dataset.pbDragging = "true";
}
function endDrag() { dragPayload = null; delete document.body.dataset.pbDragging; document.querySelectorAll("[data-pb-over]").forEach((el) => delete el.dataset.pbOver); }
function readDrag(e) {
  if (dragPayload) return dragPayload;
  try { const raw = e.dataTransfer.getData(DRAG_MIME); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
async function dropInto(payload, target) {           // target: { row } | { index }(줄 사이) | {}(빈 캔버스)
  if (!payload) return;
  if (payload.blockId) {                               // 캔버스 안 이동
    const hit = findBlock(payload.blockId); if (!hit) return;
    hit.row.blocks.splice(hit.row.blocks.indexOf(hit.block), 1);
    if (target.row && target.row !== hit.row) target.row.blocks.push(hit.block);
    else if (target.row === hit.row) target.row.blocks.push(hit.block);
    else { const r = newRow(); state.rows.splice(target.index ?? state.rows.length, 0, r); r.blocks.push(hit.block); target = { row: r }; }
    if (!hit.row.blocks.length && target.row !== hit.row) state.rows = state.rows.filter((r) => r !== hit.row);
    selection = { rowId: target.row.id, blockId: hit.block.id };
    update();
    return;
  }
  const block = payload.component ? await makeComponentBlock(payload.component, payload) : { kind: payload.kind };
  if (target.row) addBlock(block, { row: target.row });
  else addBlock(block, { index: target.index });
}
function wireDropZone(el, targetOf) {
  el.addEventListener("dragover", (e) => { if (!readDrag(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = dragPayload?.blockId ? "move" : "copy"; el.dataset.pbOver = "true"; });
  el.addEventListener("dragleave", () => { delete el.dataset.pbOver; });
  el.addEventListener("drop", (e) => { const p = readDrag(e); if (!p) return; e.preventDefault(); e.stopPropagation(); delete el.dataset.pbOver; dropInto(p, targetOf()); endDrag(); });
}

/* ── 부품 카드 미리보기(썸네일) — 배포 예제 마크업을 그대로 작게 그린다 ── */
const chosenAxis = {};                                 // id → { size, variant } 카드에서 고른 값
async function renderThumb(box, id, brk) {
  const html = await exampleHtml(id, brk);
  let frag = pickFragment(html, id);
  if (!frag) { box.textContent = "미리보기 없음"; return; }
  frag = frag.cloneNode(true);
  const choice = chosenAxis[id] || {};
  applyAxes(frag, { component: id, size: choice.size, variant: choice.variant }, brk);
  uniquifyIds(frag, `thumb-${id}`);
  frag.querySelectorAll("[hidden]").forEach((n) => { if (n.matches('[data-s1-part="panel"], [data-s1-component="gnb-sub-menu"]')) n.remove(); });
  const inner = document.createElement("div");
  inner.className = "pb-thumb-inner";
  inner.appendChild(frag);
  box.innerHTML = "";
  box.appendChild(inner);
  requestAnimationFrame(() => {
    const w = inner.scrollWidth || 1, h = inner.scrollHeight || 1;
    const scale = Math.min(1, (box.clientWidth - 12) / w, (box.clientHeight - 12) / h);
    inner.style.transform = `scale(${scale})`;
    inner.style.left = `${Math.max(0, (box.clientWidth - w * scale) / 2)}px`;
    inner.style.top = `${Math.max(0, (box.clientHeight - h * scale) / 2)}px`;
  });
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
  const chips = (id, axis, values, current) => values.length
    ? `<div class="pb-chips" data-axis="${axis}">${values.map((v) => `<button type="button" class="pb-chip-btn" data-chip="${v}" aria-pressed="${v === current}">${v}</button>`).join("")}</div>` : "";
  els.partGroups.innerHTML = sorted.map(([cat, list]) => {
    const visible = list.filter((id) => availableOn(id, brk));   // 이 플랫폼 배포본이 없는 부품은 목록에서 뺀다
    if (!visible.length) return "";
    return `<div class="pb-group"><p class="pb-group-label">${categoryLabel(cat)}</p>
    <div class="pb-list">${visible.map((id) => {
      const sizes = sizeAxis(id, brk), variants = variantAxis(id);
      const c = chosenAxis[id] = { size: sizes.includes(chosenAxis[id]?.size) ? chosenAxis[id].size : sizes[0], variant: variants.includes(chosenAxis[id]?.variant) ? chosenAxis[id].variant : variants[0] };
      return `<div class="pb-card" data-part="${id}" data-search="${escapeAttr(searchText(id))}" draggable="true" role="button" tabindex="0" aria-label="${escapeAttr(registryName(id))} 놓기">
        <div class="pb-card-head"><span class="pb-card-name">${registryName(id)}</span><small>${[variants.length ? `변형 ${variants.length}` : "", sizes.length ? `크기 ${sizes.length}` : ""].filter(Boolean).join(" · ") || "축 없음"}</small></div>
        <p class="pb-card-ko">${escapeHtml(koLabel(id))}</p>
        <div class="pb-thumb" aria-hidden="true"></div>
        ${chips(id, "variant", variants, c.variant)}${chips(id, "size", sizes, c.size)}
      </div>`;
    }).join("")}</div></div>`;
  }).join("");
  els.partGroups.querySelectorAll("[data-part]").forEach((card) => {
    const id = card.dataset.part;
    renderThumb(card.querySelector(".pb-thumb"), id, brk);
    card.addEventListener("click", (e) => { if (e.target.closest("[data-chip]")) return; addComponent(id, chosenAxis[id]); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addComponent(id, chosenAxis[id]); } });
    card.addEventListener("dragstart", (e) => startDrag(e, { component: id, ...chosenAxis[id] }));
    card.addEventListener("dragend", endDrag);
    card.querySelectorAll("[data-chip]").forEach((chip) => chip.addEventListener("click", (e) => {
      e.stopPropagation();
      const axis = chip.closest("[data-axis]").dataset.axis;
      chosenAxis[id][axis] = chip.dataset.chip;
      chip.parentElement.querySelectorAll("[data-chip]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      renderThumb(card.querySelector(".pb-thumb"), id, brk);
    }));
  });
  applySearch();
}

/* 놓는 방식 — below: 선택한 줄 바로 아래 새 줄(기본) · beside: 선택한 줄 옆에 나란히 */
let placeMode = "below";
function currentRow() {
  let row = selection.rowId ? findRow(selection.rowId) : null;
  if (!row && selection.blockId) row = findBlock(selection.blockId)?.row || null;
  return row || state.rows[state.rows.length - 1] || null;
}
function insertRowAfter(row) {
  const r = newRow();
  const i = row ? state.rows.indexOf(row) : -1;
  state.rows.splice(i + 1, 0, r);
  return r;
}
function targetRow() {
  const cur = currentRow();
  if (placeMode === "beside" && cur) return cur;
  if (cur && !cur.blocks.length) return cur;          // 비어 있는 줄이면 그 줄을 채운다
  return insertRowAfter(cur);
}

async function makeComponentBlock(id, opts = {}) {
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  const block = { id: nextId("b"), kind: "component", component: id, width: "auto" };
  const v = variantAxis(id); if (v.length) block.variant = v.includes(opts.variant) ? opts.variant : v[0];
  const s = sizeAxis(id, brk); if (s.length) block.size = s.includes(opts.size) ? opts.size : s[0];
  if (id === "table") { block.width = "fill"; block.table = tableModelFromExample(await exampleHtml("table", brk)); }
  return block;
}
function addComponent(id, opts) { makeComponentBlock(id, opts).then((block) => addBlock(block)); }

/* target: 없으면 '놓는 방식' 기준 · { row } 그 줄 끝 · { index } 그 자리에 새 줄 */
function addBlock(partial, target) {
  const block = { id: partial.id || nextId("b"), width: "auto", ...partial };
  if (block.kind === "text") { block.text = block.text || "제목"; block.typo = block.typo || "typo-title-20b"; block.color = block.color || "title-primary"; }
  if (block.kind === "space") block.height = block.height || "16";
  let row;
  if (target?.row) row = target.row;
  else if (target && target.index != null) { row = newRow(); state.rows.splice(target.index, 0, row); }
  else row = targetRow();
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
  } else if (dir === "split") {
    hit.row.blocks.splice(i, 1);
    const r = insertRowAfter(hit.row);
    r.blocks.push(hit.block);
    selection.rowId = r.id;
  } else {
    const ri = state.rows.indexOf(hit.row);
    let rj = dir === "up" ? ri - 1 : ri + 1;
    if (rj < 0) return;
    if (rj >= state.rows.length) { insertRowAfter(hit.row); rj = ri + 1; }   // 아래 줄이 없으면 새로 만든다
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
      if (!availableOn(b.component, brk)) parts.push(`<p class="pb-warn">이 부품은 지금 고른 플랫폼 배포본이 없습니다. 지우거나 플랫폼을 바꾸세요.</p>`);
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
      const w = ["auto", "fill", "custom"].includes(b.width) ? b.width : "custom";
      if (w === "custom" && !b.widthPx) b.widthPx = Number(b.width) || 320;
      parts.push(propRow("폭", selectHtml("width", [["auto", "내용만큼"], ["fill", "남은 폭 채우기"], ["custom", "직접 입력(px)"]], w)));
      if (w === "custom") parts.push(propRow("폭(px)", `<input type="number" min="40" step="10" data-prop="widthPx" value="${escapeAttr(b.widthPx || 320)}">`));
    }
    if (b.kind === "component" && b.component === "table" && !b.table && !b.html) {
      exampleHtml("table", brk).then((html) => { b.table = tableModelFromExample(html); update(); });
    }
    if (b.kind === "component" && b.component === "table" && b.table) {
      parts.push(`<p class="pb-section-title">표 구성</p>`);
      parts.push(propRow("행 수", `<input type="number" min="0" max="50" data-prop="table.rows" value="${escapeAttr(b.table.rows)}">`));
      parts.push(propRow("선택 칸", selectHtml("table.selection", [["true", "체크박스 열 있음"], ["false", "없음"]], String(!!b.table.selection))));
      parts.push(`<p class="pb-note">열 — 이름 · 정렬 · 폭(px, 비우면 자동)</p>`);
      b.table.columns.forEach((col, i) => {
        parts.push(`<div class="pb-col">
          <input type="text" data-prop="table.columns.${i}.label" value="${escapeAttr(col.label || "")}" placeholder="열 이름" aria-label="열 ${i + 1} 이름">
          ${selectHtml(`table.columns.${i}.align`, [["", "왼쪽"], ["center", "가운데"], ["right", "오른쪽"]], col.align || "")}
          <input type="number" min="0" step="10" data-prop="table.columns.${i}.width" value="${escapeAttr(col.width || "")}" placeholder="폭" aria-label="열 ${i + 1} 폭">
          <button type="button" class="pb-btn pb-btn-sm" data-act="col-del" data-col="${i}" aria-label="열 ${i + 1} 삭제">×</button>
        </div>`);
      });
      parts.push(`<div class="pb-prop-actions"><button type="button" class="pb-btn pb-btn-sm" data-act="col-add">+ 열 추가</button></div>`);
    }
    parts.push(`<div class="pb-prop-actions">
      <button type="button" class="pb-btn pb-btn-sm" data-act="left">← 왼쪽</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="right">오른쪽 →</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="up">↑ 윗행</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="down">↓ 아랫행</button>
      <button type="button" class="pb-btn pb-btn-sm" data-act="split">↵ 새 줄로 분리</button>
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
  if (!hit && !row) parts.push(`<p class="pb-note">캔버스에서 요소나 줄을 누르면 여기서 고칩니다. 왼쪽 부품을 누르면 새 줄로 내려가고, "선택한 줄 옆"을 고르면 나란히 들어갑니다.</p>`);

  els.props.innerHTML = parts.join("");

  els.props.querySelectorAll("[data-prop]").forEach((ctl) => {
    if (ctl.dataset.prop === "html") return;
    ctl.addEventListener("change", () => setProp(ctl.dataset.prop, ctl.value));
    if (ctl.tagName === "INPUT") ctl.addEventListener("keydown", (e) => { if (e.key === "Enter") setProp(ctl.dataset.prop, ctl.value); });
  });
  els.props.querySelectorAll("[data-act]").forEach((btn) => btn.addEventListener("click", () => {
    const act = btn.dataset.act;
    const id = selection.blockId;
    if (act === "left" || act === "right" || act === "up" || act === "down" || act === "split") moveBlock(id, act);
    else if (act === "dup") duplicateBlock(id);
    else if (act === "del") removeBlock(id);
    else if (act === "col-add") { hit.block.table.columns.push({ label: `열 ${hit.block.table.columns.length + 1}` }); update(); }
    else if (act === "col-del") { hit.block.table.columns.splice(Number(btn.dataset.col), 1); update(); }
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
    else if (name.startsWith("table.")) {
      const path = name.slice(6).split(".");
      let obj = hit.block.table;
      while (path.length > 1) obj = obj[path.shift()];
      const key = path[0];
      obj[key] = key === "selection" ? value === "true" : key === "rows" ? Math.max(0, Number(value) || 0) : value;
    }
    else hit.block[name] = value;
  }
  update();
}

/* ── 렌더·갱신 ─────────────────────────────────────────────── */
async function renderCanvas() {
  els.canvas.dataset.theme = state.meta.theme;
  els.frameInfo.textContent = state.rows.length ? `행 ${state.rows.length} · 요소 ${state.rows.reduce((n, r) => n + r.blocks.length, 0)}` : "";
  if (!state.rows.length) {
    els.canvas.innerHTML = `<div class="pb-canvas-empty">아직 비어 있습니다.<br>왼쪽 부품을 이리로 끌어다 놓거나, 눌러서 놓아 보세요.</div>`;
    wireDropZone(els.canvas.firstElementChild, () => ({ index: 0 }));
    fitCanvas();
    return;
  }
  const screen = await renderScreen(els.canvas, true);
  try { autoInit(screen); } catch (e) { console.warn("autoInit", e); }
  fitCanvas();
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
  screen.style.maxWidth = `${p.width}px`;
  screen.style.minHeight = `${p.height}px`;
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
    canvas: $("#pb-canvas"), canvasWrap: $("#pb-canvas-wrap"), frameLabel: $("#pb-frame-label"), frameInfo: $("#pb-frame-info"), props: $("#pb-props"), toast: $("#pb-toast"),
    search: $("#pb-search"), searchEmpty: $("#pb-search-empty"),
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

  els.search.addEventListener("input", applySearch);
  window.addEventListener("resize", fitCanvas);
  if (window.ResizeObserver) new ResizeObserver(() => fitCanvas()).observe(els.canvasWrap.parentElement);
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

  document.querySelectorAll("[data-place]").forEach((btn) => btn.addEventListener("click", () => {
    placeMode = btn.dataset.place;
    document.querySelectorAll("[data-place]").forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
  }));
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
