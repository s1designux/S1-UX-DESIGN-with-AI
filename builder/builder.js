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
import * as UI from "./ui.js";
import { variantMarkup, hasVariantMarkup } from "./variant-markup.js";

const url = (rel) => new URL(rel, import.meta.url);
const URLS = {
  distManifest: url("../ui-library/dist/manifest.json"),
  designManifest: url("../design/design.manifest.json"),
  registryIndex: url("../registry/components/index.json"),
  catalog: url("../registry/patterns/builder/catalog.json"),
  compositionRules: url("../registry/governance/composition-rules.json"),
  suggest: url("../reports/pattern-builder/profiles/app-modu/suggest-model.json"),
  imported: url("../reports/pattern-builder/imported/index.json"),
  partMap: (profile) => url(`../reports/pattern-builder/profiles/${profile}/part-map.json`),
  importedBase: url("../reports/pattern-builder/"),
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
/* ── 묶음 규칙 (조합 규칙) ─────────────────────────────────────
   부품 하나로는 표현이 안 되고 화면마다 달라지지도 않는 "붙이는 규칙"이다.
   **정본은 registry/governance/composition-rules.json** (river 승인 2026-09-18).
   빌더는 자기 값을 갖지 않는다 — 아래는 정본을 못 읽었을 때의 최후 대비값이고,
   loadAll() 이 정본을 읽어 덮어쓴다. 값을 바꾸려면 정본을 고친다. */
const GROUP_RULES = {
  insideGap: "8",                 // 한 묶음 안 줄 사이 (라벨 ↔ 인풋 등)
  betweenGap: "24",               // 묶음과 묶음 사이
  rowGap: "12",                   // 한 줄 안에서 부품끼리
  labelTypo: "typo-body-14m",     // 라벨 글자
  labelColor: "body-primary"
};
function applyCompositionRules(rules) {
  if (!rules) return;
  const sp = rules.spacing || {};
  if (sp.insideGroup?.value) GROUP_RULES.insideGap = String(sp.insideGroup.value);
  if (sp.betweenGroups?.value) GROUP_RULES.betweenGap = String(sp.betweenGroups.value);
  if (sp.insideRow?.value) GROUP_RULES.rowGap = String(sp.insideRow.value);
  if (rules.label?.typography) GROUP_RULES.labelTypo = rules.label.typography;
  if (rules.label?.color) GROUP_RULES.labelColor = rules.label.color;
}

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
const data = { dist: null, design: null, registry: null, catalog: null, imported: null, suggest: null, manifests: {}, examples: {} };

async function fetchText(u) {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${r.status} ${u.pathname}`);
  return r.text();
}
const fetchJson = async (u) => JSON.parse(await fetchText(u));

async function loadAll() {
  const [dist, design, registry, catalog, suggest] = await Promise.all([
    fetchJson(URLS.distManifest), fetchJson(URLS.designManifest), fetchJson(URLS.registryIndex),
    fetchJson(URLS.catalog).catch(() => ({ patterns: [] })),
    fetchJson(URLS.suggest).catch(() => null)          // 제안표가 없으면 제안 칸을 숨긴다
  ]);
  Object.assign(data, { dist, design, registry, catalog, suggest });
  /* 묶음 규칙은 정본에서 읽는다 — 빌더가 자기 값을 갖지 않게 한다. */
  data.compositionRules = await fetchJson(URLS.compositionRules).catch(() => null);
  applyCompositionRules(data.compositionRules);
  // 가져온 화면 목록은 없을 수도 있다(아직 아무것도 안 가져왔을 때) — 없으면 빈 목록으로 둔다.
  data.imported = await fetchJson(URLS.imported).catch(() => ({ screens: [] }));
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
/* 분류 이름도 정본은 영문이다. 옆에 붙이는 한글은 빌더 화면용 표시어. */
const CATEGORY_KO = { actions: "동작", selection: "선택", form: "입력", table: "표", navigation: "이동", overlay: "겹쳐 뜨는 것" };
const categoryTitle = (cat) => CATEGORY_KO[cat] ? `${categoryLabel(cat)} · ${CATEGORY_KO[cat]}` : categoryLabel(cat);
/* 검색 대상 글 — 정본 이름·id·분류 + registry 의 한글 사용맥락 + 위 화면용 찾기말 */
function searchText(id) {
  const spec = data.specs?.[id] || {};
  const bits = [registryName(id), id, categoryTitle(registryCategory(id)), (SEARCH_KO[id] || []).join(" "),
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
/* 화면 크롬 — 상·하단에 화면 끝까지 붙는 부품. 화면 안쪽 여백 바깥으로 빼서 그린다(river 지적 2026-09-18). */
const CHROME_BLEED = new Set(["mobile-header", "mobile-bottom-nav", "gnb"]);
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
    screen: { padding: "24", groupGap: GROUP_RULES.insideGap, betweenGap: GROUP_RULES.betweenGap },
    reference: null,      // 왼쪽 대조판(가져온 원본 그림) — 보기 전용이라 내보내지 않는다
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
function newRow() { return { id: nextId("r"), gap: GROUP_RULES.rowGap, align: "start", marginBottom: "16", blocks: [] }; }

/* 줄이 어느 묶음에 속하는지 — row.attached 는 "윗줄과 한 묶음" 표시다.
   묶음 안이면 좁은 간격, 묶음이 끝나는 줄이면 넓은 간격을 쓴다(줄마다 손으로 맞추지 않는다). */
function groupRoleOf(index) {
  const row = state.rows[index];
  if (!row) return null;
  const next = state.rows[index + 1];
  const inGroup = !!row.attached || !!(next && next.attached);
  if (!inGroup) return null;
  if (next && next.attached) return row.attached ? "mid" : "start";
  return "end";
}

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
  /* 가져온 레거시 칸 — 원본 그림을 그대로 올린다(river 결정 2026-09-18 "모두앱에서는 레거시 모습 그대로").
     정본 부품이 아니다. 바꿔치기하지 않고, 어디가 레거시인지 보이게 표시만 한다. */
  if (block.kind === "legacy") {
    wrap.className += " s1-legacy";
    wrap.dataset.s1Legacy = "true";
    if (block.legacyLabel) wrap.dataset.s1LegacyLabel = block.legacyLabel;
    const img = document.createElement("img");
    img.src = block.image || "";
    img.alt = block.legacyLabel || "가져온 레거시 칸";
    img.loading = "lazy";
    img.style.display = "block";
    img.style.width = `${Number(block.widthPx) || 0}px`;
    img.style.height = `${Number(block.heightPx) || 0}px`;
    wrap.style.width = `${Number(block.widthPx) || 0}px`;
    if (Number(block.xPx)) wrap.style.marginLeft = `${Number(block.xPx)}px`;
    wrap.appendChild(img);
    return wrap;
  }
  /* 대응 부품이 없어 못 채운 자리 — 원본 크기만큼 빈 칸을 두고 무엇이었는지만 적는다.
     ⛔ 비슷해 보이는 부품을 추측으로 끼워 넣지 않는다(river 결정 2026-09-18). */
  if (block.kind === "placeholder") {
    wrap.dataset.s1Placeholder = "true";
    wrap.style.width = `${Number(block.widthPx) || 120}px`;
    wrap.style.height = `${Number(block.heightPx) || 24}px`;
    wrap.textContent = block.legacyName ? `대응 부품 없음 · ${block.legacyName}` : "대응 부품 없음";
    wrap.title = "이 자리에 해당하는 정본 부품이 아직 없습니다.";
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
  } else if (hasVariantMarkup(block.component) && variantHtml(block.component, { variant: block.variant, size: block.size, text: block.text })) {
    const tpl = document.createElement("template");
    tpl.innerHTML = variantHtml(block.component, { variant: block.variant, size: block.size, text: block.text }).trim();
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

/* ── 모바일 상태바(StatusBar) ────────────────────────────────────────────────
   정본(build-components.ts buildStatusBar · populateStatusRow)의 App 상태바 360×27 을 그대로 옮긴 그림이다.
   **배포 부품이 아니다** — river 결정 D5 로 배포본에서 뺐고(OS·브라우저가 그리는 영역),
   registry/governance/dummy-chrome-parts.json 이 "우리 부품이 아닌 OS 껍데기 소품"으로 선언한다.
   그래서 부품 목록에 넣지 않고 **미리보기 틀 위쪽에 고정**으로만 얹는다(river 지시 2026-09-18).
   수치·색은 가이드 사이트의 같은 그림(assets/css/ui-library-guide.css .uilg-phone-status)과 같다:
   높이 27 · 좌 20 / 우 16 패딩 · 12 Medium · 오른쪽 묶음 간격 6 · 아이콘색 icon/gray-dark. */
/* 정본 NAV_SVG(build-components.ts:6127-6141) — stroke #757575 = color/icon/gray 를 currentColor 로 받는다. */
const SHELL_ICON = (() => {
  const s = (d) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
  const P = (d) => `<path d="${d}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return {
    chevronLeft: s(P("M15 6L9 12L15 18")),
    chevronRight: s(P("M9 6L15 12L9 18")),
    home: s(P("M3.5 11L12 4L20.5 11") + P("M6 9.5V20H18V9.5")),
    star: s(P("M12 3.5L14.58 8.74L20.36 9.58L16.18 13.65L17.17 19.41L12 16.69L6.83 19.41L7.82 13.65L3.64 9.58L9.42 8.74L12 3.5Z")),
    menu: s(P("M4 7H20") + P("M4 12H20") + P("M4 17H20")),
    recents: s(P("M8 6V18") + P("M12 6V18") + P("M16 6V18")),
    androidHome: s(`<rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" stroke-width="2"/>`),
    /* 탭 개수 글리프 — 둥근 사각 + 숫자 29(정본 navTabsIcon) */
    tabs: s(`<rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="2"/><text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="500" fill="currentColor" font-family="Pretendard, sans-serif">29</text>`),
    /* 주소창 — 정본 SHELL_LOCK_SVG · SHELL_REFRESH_SVG (fill #757575 → currentColor) */
    lock: s(`<path d="M12.0002 3C9.16131 3 6.85731 5.39657 6.85731 8.33829V11.2286H5.31445V21H18.6859V11.2286H17.143V8.33829C17.143 5.39657 14.839 3 12.0002 3ZM14.4173 17.8114L13.687 18.5417L11.9899 16.8446L10.2927 18.5417L9.56245 17.8114L11.2596 16.1143L9.56245 14.4171L10.2927 13.6869L11.9899 15.384L13.687 13.6869L14.4173 14.4171L12.7202 16.1143L14.4173 17.8114ZM7.88588 11.2286V8.33829C7.88588 5.96229 9.72702 4.02857 12.0002 4.02857C14.2733 4.02857 16.1145 5.96229 16.1145 8.33829V11.2286H7.88588Z" fill="currentColor"/>`),
    refresh: s(`<path d="M12.0002 19.9411C9.74488 19.9411 7.61666 18.9776 6.12374 17.3364H9.0143V16.2776H5.02257C4.7261 16.2776 4.49316 16.5106 4.49316 16.807V20.7882H5.55198V18.2576C7.23549 19.9941 9.54371 20.9999 12.0002 20.9999C16.966 20.9999 21.0001 16.9659 21.0001 12C21.0001 11.2271 20.9048 10.4647 20.7142 9.72357L19.6871 9.98828C19.8566 10.6342 19.9413 11.3118 19.9413 12C19.9413 16.3835 16.3836 19.9411 12.0002 19.9411Z" fill="currentColor"/><path d="M18.4481 5.74282C16.7646 4.00636 14.4564 3.00049 11.9999 3.00049C7.03408 3.00049 3 7.03457 3 12.0004C3 12.7733 3.09529 13.5357 3.29647 14.2769L4.32352 14.0122C4.15411 13.3663 4.0694 12.6886 4.0694 12.0004C4.05881 7.61692 7.61643 4.0593 11.9999 4.0593C14.2552 4.0593 16.3834 5.02282 17.8763 6.66398H14.9858V7.7228H18.9669C19.2634 7.7228 19.4963 7.48986 19.4963 7.19339V3.21225H18.4375V5.74282H18.4481Z" fill="currentColor"/>`)
  };
})();
const shellIcon = (name) => `<span class="pb-shell-icon">${SHELL_ICON[name]}</span>`;

/* 브라우저 주소창 — 정본 buildShellUrlBar: h50 · 좌우 16 / 위아래 12 · 간격 6 · 자물쇠24 + URL 알약(radius 100, bg/level-2, 14 Regular, text/body/tertiary) + 새로고침24 */
const urlBarHtml = () => `<div class="pb-shell-urlbar">${shellIcon("lock")}<span class="pb-shell-url">m.s1.co.kr</span>${shellIcon("refresh")}</div>`;
/* 브라우저 툴바 — 정본 buildBrowserToolbarRow: h50 · 좌우 16 · SPACE_BETWEEN · 6개 글리프 */
const browserToolbarHtml = () => `<div class="pb-shell-toolbar">${["chevronLeft", "chevronRight", "home", "star", "tabs", "menu"].map(shellIcon).join("")}</div>`;
/* 안드로이드 내비 — 정본 populateAndroidNav: 360×45 · 좌우 48 · SPACE_BETWEEN · 최근·홈·뒤로 */
const androidNavHtml = () => `<div class="pb-shell-nav">${["recents", "androidHome", "chevronLeft"].map(shellIcon).join("")}</div>`;

let statusWifiSeq = 0;
function statusBarHtml() {
  const uid = `pb-sw${++statusWifiSeq}`;                    // 마스크 id 는 인스턴스마다 새로 — 겹치면 호가 뭉개진다
  const wifi = `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="${uid}a" fill="white"><path d="M2.34315 4.34315C3.84344 2.84286 5.87827 2 8 2C10.1217 2 12.1566 2.84285 13.6569 4.34314L8 10L2.34315 4.34315Z"/></mask><path d="M2.34315 4.34315C3.84344 2.84286 5.87827 2 8 2C10.1217 2 12.1566 2.84285 13.6569 4.34314L8 10L2.34315 4.34315Z" stroke="currentColor" stroke-width="3.2" mask="url(#${uid}a)"/><mask id="${uid}b" fill="white"><path d="M4.46447 6.46447C5.40215 5.52678 6.67392 5 8 5C9.32608 5 10.5979 5.52678 11.5355 6.46447L8 10L4.46447 6.46447Z"/></mask><path d="M4.46447 6.46447C5.40215 5.52678 6.67392 5 8 5C9.32608 5 10.5979 5.52678 11.5355 6.46447L8 10L4.46447 6.46447Z" stroke="currentColor" stroke-width="3.2" mask="url(#${uid}b)"/><circle cx="7.9998" cy="10.2" r="1.2" fill="currentColor"/></svg>`;
  const bars = [[0, 8, 3, 4], [4.5, 6, 3, 6], [9, 4, 3, 8], [13.5, 1, 3, 11]]
    .map(([x, y, w, h]) => `<i style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></i>`).join("");
  return `<div class="pb-statusbar" aria-hidden="true">
    <span class="pb-statusbar-time">12:30</span>
    <span class="pb-statusbar-right">
      <span class="pb-statusbar-signal">${bars}</span>
      <span class="pb-statusbar-wifi">${wifi}</span>
      <span class="pb-statusbar-battery"><i class="pb-statusbar-battery-shell"></i><i class="pb-statusbar-battery-tip"></i><i class="pb-statusbar-battery-fill"></i></span>
      <span class="pb-statusbar-pct">78%</span>
    </span>
  </div>`;
}

/* ── 변형마다 뼈대가 다른 부품 ─────────────────────────────────────────────
   대부분의 부품은 data-variant 만 바꾸면 CSS 가 모습을 바꾼다. 그런데 배포본 manifest 의
   htmlContract.perVariantParts 가 선언된 부품(mobile-header · gnb)은 **변형마다 들어가는 부품(part)이 다르다.**
   배포본 예제는 한 변형만 담고 있어서 attribute 만 바꾸면 틀린 모습이 나온다(river 지적 2026-09-18).
   뼈대는 variant-markup.js 가 **manifest 선언을 읽어** 조립한다 — 빌더가 새 구조를 지어내지 않는다. */
function variantHtml(id, { variant, size, text } = {}) {
  return variantMarkup(id, data.manifests[id], { variant: variant || variantAxis(id)[0], size, text });
}

/* ── 표(table) 모델 — 배포 예제의 구조(htmlContract)를 그대로 지키면서 열·행 수만 화면에서 정한다 ── */
function tableModelFromExample(html) {
  const root = pickFragment(html, "table");
  const model = { selection: false, rows: 3, columns: [] };
  if (!root) { model.columns = [{ label: "항목명" }, { label: "카테고리" }, { label: "수량", align: "center" }, { label: "상태", align: "center" }]; return model; }
  root.querySelectorAll('thead th[data-s1-part="header-cell"]').forEach((th) => {
    if (th.hasAttribute("data-selection")) { model.selection = true; return; }
    const col = { label: th.textContent.trim() };
    if (th.dataset.align === "center") col.align = "center";
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
    if (col.align === "center") th.setAttribute("data-align", "center");   // 배포본이 구현한 정렬은 center 뿐이다
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
      if (col.align === "center") td.setAttribute("data-align", "center");
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
    rowEl.style.flexWrap = row.blocks.some((b) => b.bleed) ? "nowrap" : "wrap";
    rowEl.style.alignItems = "flex-start";
    rowEl.style.gap = `var(--spacing-${row.gap || "12"})`;
    rowEl.style.justifyContent = ALIGN_CSS[row.align] || "flex-start";
    /* 묶음에 든 줄은 묶음 규칙이 간격을 정한다 — 줄마다 손으로 맞추지 않는다.
       묶음이 아니면 예전대로(가져온 화면은 원본 px 그대로 — 토큰 눈금에 반올림하면 원본 모습이 아니다). */
    const groupRole = groupRoleOf(ri);
    if (groupRole) {
      const gapToken = groupRole === "end"
        ? (state.screen.betweenGap || GROUP_RULES.betweenGap)
        : (state.screen.groupGap || GROUP_RULES.insideGap);
      rowEl.style.marginBottom = `var(--spacing-${gapToken})`;
      rowEl.dataset.s1Group = groupRole;
    } else {
      rowEl.style.marginBottom = row.marginBottomPx != null
        ? `${row.marginBottomPx}px`
        : `var(--spacing-${row.marginBottom || "16"})`;
    }
    /* 가져온 화면 위에 새로 놓은 줄은 원본 본문과 같은 좌우 자리에 맞춘다(레거시 그림 줄은 이미 제 자리다). */
    const inset = Number(state.screen.importedInset) || 0;
    if (inset && !row.blocks.some((b) => b.kind === "legacy" || b.bleed)) {
      rowEl.style.paddingLeft = `${inset}px`;
      rowEl.style.paddingRight = `${inset}px`;
      rowEl.style.boxSizing = "border-box";
      rowEl.style.width = "100%";
    }
    /* 화면 끝까지 붙는 줄 — 화면 안쪽 여백만큼 바깥으로 빼서 헤더·하단바가 가장자리에 닿게 한다. */
    if (row.blocks.some((b) => b.bleed)) {
      const pad = `var(--spacing-${state.screen.padding || "24"})`;
      rowEl.style.marginLeft = `calc(${pad} * -1)`;
      rowEl.style.marginRight = `calc(${pad} * -1)`;
      rowEl.style.width = `calc(100% + ${pad} + ${pad})`;
      // 맨 윗줄·맨 아랫줄이면 위아래 여백도 없앤다 — 상단 헤더·하단 메뉴가 화면 끝에 닿아야 한다
      if (ri === 0) rowEl.style.marginTop = `calc(${pad} * -1)`;
      if (ri === state.rows.length - 1) rowEl.style.marginBottom = `calc(${pad} * -1)`;
      rowEl.dataset.s1Bleed = "true";
    }
    if (editor) {
      rowEl.dataset.pbRow = row.id;
      if (selection.rowId === row.id && !selection.blockId) rowEl.dataset.pbSelected = "true";
      if (!row.blocks.length) rowEl.dataset.pbEmpty = "true";   // 글자 없이 자리만 남긴다(놓을 수 있게)
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

/* 배포본 Select 를 칸 안에 심는다. 값이 바뀌면 onChange 로 알려준다(네이티브 select 를 대신한다). */
function mountSelect(box, { options, value, label, onChange, size = "xxsm" }) {
  if (!box) return null;
  box.innerHTML = UI.selectHtml({ options, value, label, size });
  UI.mount(box);
  const root = box.firstElementChild;
  if (onChange) UI.onSelectChange(root, onChange);
  return root;
}
/* 배포본 Input 을 칸 안에 심고, 안의 control 을 돌려준다. */
function mountInput(box, { value = "", placeholder = "", label = "", size = "xxsm", onInput } = {}) {
  if (!box) return null;
  box.innerHTML = UI.inputHtml({ value, placeholder, label, size });
  UI.mount(box);
  const control = UI.controlOf(box.firstElementChild);
  if (onInput && control) control.addEventListener("input", () => onInput(control.value));
  return control;
}
/* Multi Toggle(놓는 방식·보기) 의 선택을 맞춘다 — 값 쓰기는 배포본 계약(aria-checked)으로 한다. */
function setToggle(root, value) {
  if (!root) return;
  root.querySelectorAll('[data-s1-part="cell"]').forEach((cell) => {
    const on = cell.dataset.value === value;
    cell.setAttribute("aria-checked", String(on));
    cell.tabIndex = on ? 0 : -1;
  });
}
const onToggleChange = (root, fn) => root?.addEventListener("s1:multi-toggle:change", (e) => fn(e.detail?.value, e));

function platformInfo() {
  const id = PLATFORM_ALIAS[state.meta.platform] || state.meta.platform;
  return PLATFORMS.find((x) => x.id === id) || PLATFORMS[0];
}

/* 캔버스를 프레임 실제 크기(1920 등)로 그리고, 무대 폭에 맞춰 축소해 보여준다. */
/* 모바일 미리보기의 기기 크롬 — 앱이냐 웹이냐에 따라 위아래에 자동으로 붙는다(river 지시 2026-09-18).
   정본 StatusBar·NavBar 의 Platform=App / Platform=Web 변형 구성 그대로:
     앱  — 위: 상태바 27           · 아래: 안드로이드 내비 45
     웹  — 위: 상태바 27 + 주소창 50(=77) · 아래: 브라우저 툴바 50 + 안드로이드 내비 45(=95)
   배포 부품이 아니라 OS·브라우저 껍데기 소품이므로(D5 · dummy-chrome-parts.json) 미리보기에만 얹고 내보내지 않는다. */
/* 맨 윗줄이 Home 유형 Mobile Header 인가 — 위쪽 크롬·본문 배경을 bg/home 으로 잇는 조건. */
function homeHeaderFirst() {
  const first = state.rows[0]?.blocks?.[0];
  return first?.component === "mobile-header" && String(first.variant || "").startsWith("home-");
}

/* 왼쪽 대조판 — 가져온 원본 그림을 원본 좌표 그대로 겹쳐 올린다. 보기 전용이라 놓을 수도 고칠 수도 없다. */
function renderReference() {
  const ref = state.reference;
  if (!els.refSide) return;
  els.refSide.hidden = !ref;
  if (!ref) return;
  els.refCanvas.innerHTML = "";
  const box = document.createElement("div");
  box.className = "pb-ref-screen";
  box.style.width = `${ref.width}px`;
  box.style.height = `${ref.height}px`;
  for (const r of ref.rows || []) {
    if (!r.image) continue;
    const img = document.createElement("img");
    img.src = r.image;
    img.alt = r.label || "가져온 원본 칸";
    img.loading = "lazy";
    img.style.left = `${r.x || 0}px`;
    img.style.top = `${r.y || 0}px`;
    img.style.width = `${r.w}px`;
    img.style.height = `${r.h}px`;
    box.appendChild(img);
  }
  els.refCanvas.appendChild(box);
}
function fitReference(avail) {
  const ref = state.reference;
  if (!els.refSide || !ref) return;
  const scale = Math.min(1, avail / ref.width);
  els.refCanvas.style.width = `${ref.width}px`;
  els.refCanvas.style.height = `${ref.height}px`;
  els.refCanvas.style.minHeight = "0";
  els.refCanvas.style.transform = `scale(${scale})`;
  els.refCanvas.style.transformOrigin = "top left";
  els.refWrap.style.width = `${Math.ceil(ref.width * scale)}px`;
  els.refWrap.style.height = `${Math.ceil(ref.height * scale)}px`;
  els.refLabel.textContent = `원본 그대로 · ${ref.name} · 보기 전용`
    + (scale < 1 ? ` · ${Math.round(scale * 100)}%` : "");
}

function paintShell() {
  els.canvas.querySelectorAll(".pb-shell-top, .pb-shell-bottom").forEach((n) => n.remove());
  const on = platformInfo().id === "mobile" && state.screen.shell !== "none";
  els.canvas.dataset.shell = on ? (state.screen.shell || "app") : "none";
  /* Home 유형 헤더면 위쪽 크롬과 본문 배경까지 bg/home 한 색으로 잇는다.
     정본 buildMobileHeaderVariant 의 isHome 분기(build-components.ts:3107·3132) · river 지시 2026-09-02.
     크롬을 끄더라도 본문 배경 판단은 같아야 한다 — 내보내기(data-s1-header-bg)와 어긋나지 않게 먼저 맞춘다. */
  els.canvas.dataset.headerBg = homeHeaderFirst() ? "home" : "level-0";
  if (!on) return;
  const web = (state.screen.shell || "app") === "web";
  const add = (cls, html, where) => {
    const box = document.createElement("div");
    box.className = cls;
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = html;
    where === "top" ? els.canvas.prepend(box) : els.canvas.append(box);
  };
  /* 상태바와 AppBar 사이 16 — 정본 Mobile Header 합성물의 itemSpacing(build-components.ts:3487).
     맨 윗줄이 헤더이고 앱 유형일 때만(웹은 주소창이 그 자리를 채운다). */
  const first = state.rows[0]?.blocks?.[0];
  const headerFirst = first?.component === "mobile-header";
  add("pb-shell-top", statusBarHtml() + (web ? urlBarHtml() : (headerFirst ? `<div class="pb-statusbar-gap"></div>` : "")), "top");
  add("pb-shell-bottom", (web ? browserToolbarHtml() : "") + androidNavHtml(), "bottom");
}

/* 보기 방식(river 결정 2026-09-18)
   device — 기기처럼: 틀을 그 기기 크기로 고정하고 넘치는 내용은 틀 안에서 스크롤. 크롬은 위아래에 붙어 있다(기본).
   full   — 한눈에: 내용 길이만큼 틀을 늘려 전체를 본다. "여기까지가 첫 화면" 선을 그어 접히는 자리를 보여준다. */
const viewModeOf = () => (state.screen.view === "full" ? "full" : "device");

function fitCanvas() {
  const p = platformInfo();
  const mode = viewModeOf();
  const stage = els.canvasWrap.closest(".pb-stage");     // 무대 폭을 기준으로 잰다(래퍼가 아니라)
  /* 왼쪽에 원본 대조판이 서 있으면 무대를 둘로 나눠 쓴다 — 두 화면이 같은 배율로 나란히 보이게. */
  const refOn = Boolean(state.reference);
  const avail = Math.max(200, (stage.clientWidth - 48 - (refOn ? 24 : 0)) / (refOn ? 2 : 1));
  const scale = Math.min(1, avail / p.width);
  els.canvas.dataset.view = mode;
  els.canvas.style.width = `${p.width}px`;
  if (mode === "device") { els.canvas.style.height = `${p.height}px`; els.canvas.style.minHeight = ""; }
  else { els.canvas.style.height = ""; els.canvas.style.minHeight = `${p.height}px`; }
  els.canvas.style.transform = `scale(${scale})`;
  els.canvas.style.transformOrigin = "top left";
  els.canvas.style.marginLeft = scale < 1 ? "0" : "auto";
  els.canvasWrap.style.height = `${Math.ceil(els.canvas.offsetHeight * scale)}px`;
  els.canvasWrap.style.width = scale < 1 ? `${Math.ceil(p.width * scale)}px` : `${p.width}px`;
  paintFoldLine(p, mode);
  const overflow = mode === "device" && els.canvas.querySelector(".pb-scroll")
    ? (() => { const s = els.canvas.querySelector(".pb-scroll"); return s.scrollHeight > s.clientHeight + 1 ? " · 스크롤 있음" : ""; })() : "";
  els.frameLabel.textContent = (refOn ? "새로 그린 화면 · " : "") + `${p.label} · ${state.meta.role} · ${state.meta.theme}`
    + (scale < 1 ? ` · 미리보기 ${Math.round(scale * 100)}%` : "") + overflow;
  fitReference(avail);
}

/* 한눈에 보기에서 "여기까지가 첫 화면" 선 — 기기 높이만큼 내려온 자리에 긋는다. */
function paintFoldLine(p, mode) {
  els.canvasWrap.querySelector(".pb-fold")?.remove();
  if (mode !== "full") return;
  if (els.canvas.offsetHeight <= p.height + 1) return;
  const line = document.createElement("div");
  line.className = "pb-fold";
  line.style.top = `${p.height}px`;
  line.innerHTML = `<span>여기까지가 첫 화면</span>`;
  els.canvas.appendChild(line);
}

function renderToolbar() {
  const services = [["core", "공통(core)"], ...Object.keys(data.design?.services || {}).map((s) => [s, s]),
    ...(data.design?.servicesPlanned || []).map((s) => [s, `${s} (예정)`])];
  state.meta.platform = PLATFORM_ALIAS[state.meta.platform] || state.meta.platform;

  els.name = mountInput(els.nameBox, {
    value: state.meta.name || "", label: "화면 이름", placeholder: "예: 목록 조회",
    onInput: (v) => { state.meta.name = v; persist(); }
  });
  mountSelect(els.service, {
    options: services, value: state.meta.service, label: "서비스",
    onChange: (v) => { state.meta.service = v; renderPatternList(); update(); }
  });
  mountSelect(els.platform, {
    options: PLATFORMS.map((p) => [p.id, p.label]), value: state.meta.platform, label: "플랫폼",
    onChange: (v) => changePlatform(v)
  });
  mountSelect(els.role, {
    options: (data.design?.profiles?.role || []).map((r) => [r.id, `${r.id} · ${r.density}`]), value: state.meta.role, label: "역할",
    onChange: (v) => { state.meta.role = v; update(); }
  });
  mountSelect(els.theme, {
    options: [["light", "라이트"], ["dark", "다크"]], value: state.meta.theme, label: "테마",
    onChange: (v) => { state.meta.theme = v; update(); }
  });
  els.shellField.hidden = platformInfo().id !== "mobile";          // 기기 크롬은 모바일 틀에서만 쓴다
  mountSelect(els.shell, {
    options: [["app", "앱 — 상태바 · 안드로이드 내비"], ["web", "웹 — 상태바+주소창 · 브라우저 툴바+내비"], ["none", "없음"]],
    value: state.screen.shell || "app", label: "기기 크롬",
    onChange: (v) => { state.screen.shell = v; update(); }
  });
  setToggle(els.view, viewModeOf());
  setToggle(els.place, placeMode);
  UI.linkSelectLabels(document);
  els.distVersion.textContent = `s1-ui ${data.dist?.version || ""}`;
}

/* 플랫폼을 바꾸면 각 부품의 크기 축을 그 플랫폼 배포본에 맞춰 다시 맞춘다. */
function changePlatform(value) {
  state.meta.platform = value;
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  for (const r of state.rows) for (const b of r.blocks) {
    if (b.kind !== "component") continue;
    const s = sizeAxis(b.component, brk);
    if (s.length && !s.includes(b.size)) b.size = s[0];
    if (!s.length) delete b.size;
  }
  els.shellField.hidden = platformInfo().id !== "mobile";
  renderPatternList(); renderPartGroups(); update();
}

/* 패턴 탭 — 최상위 갈래(화면 종류)만 접힌 채로 보이고, 펼치면 그 안의 패턴이 나온다. */
function renderPatternList() {
  const brk = state.meta.platform;
  const items = (data.catalog?.patterns || []).filter((p) => ["verified", "approved"].includes(p.status))
    .filter((p) => !p.platform || p.platform === brk)
    .filter((p) => !p.service || p.service === "core" || p.service === state.meta.service);
  const groups = new Map();
  for (const p of items) {
    const key = p.group || p.kind || "기타";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const helperHtml = `<div class="pb-list">${HELPERS.map(([k, n, d]) =>
    `<div class="pb-item pb-item-helper" data-helper="${k}" data-search="${escapeAttr(`${n} ${d} ${k}`)}" draggable="true" role="button" tabindex="0"><span>${n}</span><small>${d}</small></div>`).join("")}</div>`;
  const patternHtml = items.length
    ? [...groups.entries()].map(([g, list]) => accordion(g, `${list.length}개`, `<div class="pb-list">${list.map((p) =>
        `<button type="button" class="pb-item" data-pattern="${p.id}" data-search="${escapeAttr(`${p.name} ${p.id} ${g} ${p.description || ""}`)}"><span>${escapeHtml(p.name)}</span><small>${escapeHtml(p.service || "core")}</small></button>`).join("")}</div>`)).join("")
    : `<div class="pb-empty" data-keep>아직 등록된 패턴이 없습니다.<br>레거시 화면을 읽어 검증을 마친 패턴이 여기에 올라옵니다.</div>`;
  els.patternGroups.innerHTML = patternHtml + accordion("레이아웃 보조", `${HELPERS.length}개`, helperHtml);
  wireAccordions(els.patternGroups);
  els.patternGroups.querySelectorAll("[data-pattern]").forEach((b) => b.addEventListener("click", () => loadPattern(b.dataset.pattern)));
  wireHelpers(els.patternGroups);
  applySearch();
}

/* 접힘·펼침 한 칸 */
function accordion(title, meta, bodyHtml, open = false) {
  return `<div class="pb-group pb-acc" data-open="${open}">
    <button type="button" class="pb-acc-head" aria-expanded="${open}"><span class="pb-acc-caret" aria-hidden="true">▸</span><span class="pb-acc-title">${escapeHtml(title)}</span><small>${escapeHtml(meta)}</small></button>
    <div class="pb-acc-body">${bodyHtml}</div>
  </div>`;
}
function wireAccordions(scope) {
  scope.querySelectorAll(".pb-acc-head").forEach((head) => head.addEventListener("click", () => {
    const acc = head.closest(".pb-acc");
    const open = acc.dataset.open !== "true";
    acc.dataset.open = String(open);
    head.setAttribute("aria-expanded", String(open));
    if (open) acc.dispatchEvent(new CustomEvent("pb-open", { bubbles: true }));
  }));
}
function wireHelpers(scope) {
  scope.querySelectorAll("[data-helper]").forEach((b) => {
    b.addEventListener("click", () => addBlock({ kind: b.dataset.helper }));
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addBlock({ kind: b.dataset.helper }); } });
    b.addEventListener("dragstart", (e) => startDrag(e, { kind: b.dataset.helper }));
    b.addEventListener("dragend", endDrag);
  });
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


/* ── 가져온 화면 ──────────────────────────────────────────────
   이미 만들어 둔 Figma 화면을 빌더 캔버스에 그대로 올린다.
   가져오기 규칙은 묶음(profile)마다 다르다 — 지금은 모두앱만 있고 「레거시 모습 그대로」다.
   ⛔ 레거시 칸을 정본 부품으로 바꿔치기하지 않는다. 가져온 화면은 정본 패턴 목록과 섞이지 않는다. */
function renderImportedList() {
  const box = els.importedGroups;
  if (!box) return;
  const list = (data.imported?.screens || []);
  const fileList = (data.fileScreens || []);
  els.empty_imported.hidden = list.length + fileList.length > 0;
  if (!list.length && !fileList.length) {
    box.innerHTML = "";
    return;
  }
  const byService = new Map();
  for (const it of list) {
    const key = `${it.service}${it.medium ? ` · ${MEDIUM_KO[it.medium] || it.medium}` : ""}`;
    if (!byService.has(key)) byService.set(key, []);
    byService.get(key).push(it);
  }
  let html = "";
  for (const [service, items] of byService) {
    const cards = items.map((it) => `
      <button type="button" class="pb-card pb-card-imported" data-imported="${escapeAttr(it.profile + "/" + it.slug)}"
        data-search="${escapeAttr(`${it.name} ${it.service} ${it.slug}`)}">
        <span class="pb-card-name">${escapeHtml(it.name)}</span>
        <span class="pb-card-meta">${it.width}×${it.height} · 칸 ${it.rows}</span>
        <span class="pb-card-meta pb-card-mode">${it.mode === "legacy-as-is" ? "레거시 모습 그대로" : escapeHtml(it.mode)}</span>
      </button>`).join("");
    html += accordion(service, `${items.length}장`, cards);
  }
  /* 파일로 불러온 화면 — 저장소에 없고 이 브라우저 안에만 있다(플러그인이 내려준 파일). */
  const byFile = new Map();
  for (const it of fileList) {
    if (!byFile.has(it.fileLabel)) byFile.set(it.fileLabel, []);
    byFile.get(it.fileLabel).push(it);
  }
  for (const [label, items] of byFile) {
    const cards = items.map((it) => `
      <button type="button" class="pb-card pb-card-imported" data-filescreen="${escapeAttr(it.key)}"
        data-search="${escapeAttr(`${it.name} ${label}`)}">
        <span class="pb-card-name">${escapeHtml(it.name)}</span>
        <span class="pb-card-meta">${it.width}×${it.height} · 칸 ${it.rows}</span>
        <span class="pb-card-meta pb-card-mode">불러온 파일</span>
      </button>`).join("");
    html += accordion(`📂 ${label}`, `${items.length}장`, cards, true);
  }
  box.innerHTML = html;
  wireAccordions(box);
  box.querySelectorAll("[data-imported]").forEach((b) => b.addEventListener("click", () => loadImportedScreen(b.dataset.imported)));
  box.querySelectorAll("[data-filescreen]").forEach((b) => b.addEventListener("click", () => loadFileScreen(b.dataset.filescreen)));
}

const MEDIUM_KO = { app: "휴대폰 앱", mweb: "모바일 웹", pcweb: "PC 웹", console: "관제/콘솔" };

/** 왼쪽 칸의 탭을 바꾼다(컴포넌트 · 패턴 · 가져온 화면) — 배포본 Tab 계약(aria-selected)대로. */
function switchTab(name) {
  els.tabs.querySelectorAll('[data-s1-part="tab"]').forEach((t) => {
    const on = t.dataset.value === name;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const pane = document.querySelector(`#pb-pane-${t.dataset.value}`);
    if (pane) pane.hidden = !on;
  });
}

/* ── 플러그인이 내려준 화면 파일 읽기 ───────────────────────────
   S-1 GUI Builder 플러그인은 화면마다 「칸(rows)」과 칸 그림을 함께 담는다.
   빌더가 저장소에서 읽던 것과 같은 모양이라, 주소만 그림 자체로 바뀐다.
   ⛔ 레거시 칸을 정본 부품으로 바꿔치기하지 않는다 — 가져오기와 같은 경계선. */
function readScreenPack(pack) {
  if (!pack || !pack._meta || pack._meta.source !== "figma:plugin:s1-gui-builder") {
    throw new Error("S-1 GUI Builder 가 내려준 파일이 아닙니다");
  }
  const out = [];
  for (const sc of pack.screens || []) {
    if (!Array.isArray(sc.rows) || !sc.rows.length) continue;
    out.push({
      mode: "legacy-as-is",
      service: pack._meta.file?.name || "",
      screen: {
        id: sc.id,
        name: sc.name,
        width: Math.round(sc.box?.w || 0),
        height: Math.round(sc.box?.h || 0),
        orderText: sc.orderText || ""
      },
      rows: sc.rows.map((r, i) => ({
        i,
        label: r.label,
        name: r.name,
        type: r.type,
        x: r.x, y: r.y, w: r.w, h: r.h, depth: r.depth,
        image: r.image || "",
        parts: r.parts || {},
        canon: []                      // 이름 대응은 저장소 쪽 결정표의 몫 — 브라우저에서 지어내지 않는다
      }))
    });
  }
  return out;
}

/* ── Figma 링크로 바로 가져오기 ────────────────────────────────
   링크만 이 맥 안의 빌더 서버(npm run builder)에 넘긴다. Figma 읽기 열쇠는 브라우저에 두지 않는다.
   그래서 **웹에 올린 주소(GitHub Pages)에서는 가져오기가 되지 않는다** — 거기서는 버튼을 잠그고 그 이유를 적는다.
   이미 가져다 둔 화면은 웹 주소에서도 그대로 열린다(파일로 올라가 있으니까). */
let canImport = false;
let importModal = null;
async function checkImportAvailable() {
  try {
    const res = await fetch("/api/ping", { cache: "no-store" });
    canImport = res.ok && (await res.json()).canImport === true;
  } catch { canImport = false; }
  const btn = $("#pb-import-open");
  if (!btn) return;
  btn.disabled = !canImport;
  btn.title = canImport ? "" : "가져오기는 내 컴퓨터에서 띄운 빌더에서만 됩니다";
  const note = $("#pb-import-offline");
  if (note) note.hidden = canImport;
}

function openImport() {
  if (!canImport) { toast("가져오기는 내 컴퓨터에서 띄운 빌더에서만 됩니다"); return; }
  els.importStatus.hidden = true;
  els.importStatus.textContent = "";
  els.importLink.value = "";
  importModal?.open();
  els.importLink.focus();
}
function closeImport() { importModal?.close(); }

function importSay(msg, tone) {
  els.importStatus.hidden = false;
  els.importStatus.textContent = msg;
  els.importStatus.dataset.tone = tone || "info";
}

async function runImport() {
  const link = els.importLink.value.trim();
  if (!link) { importSay("링크를 붙여 넣어 주세요.", "warn"); return; }
  els.importGo.disabled = true;
  importSay("원본을 읽는 중입니다… 칸이 많으면 십여 초 걸립니다.", "info");
  let r;
  try {
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link })
    });
    if (!res.ok) throw new Error(String(res.status));
    r = await res.json();
  } catch {
    els.importGo.disabled = false;
    importSay("빌더 서버에 닿지 못했습니다. 터미널에서 npm run builder 로 띄운 주소로 열어 주세요.", "warn");
    return;
  }
  els.importGo.disabled = false;

  if (!r.ok) {
    if (r.code === "no-profile") {
      importSay(`${r.message} 이 서비스의 묶음을 먼저 만들고, 가져오기 규칙(레거시 모습 그대로 / 최신 부품으로)을 정해야 합니다.`, "warn");
    } else {
      importSay(r.message, "warn");
    }
    return;
  }

  // 목록을 새로 받아 다시 그리고, 방금 가져온 화면을 캔버스에 올린다
  data.imported = await fetchJson(URLS.imported).catch(() => ({ screens: [] }));
  renderImportedList();
  closeImport();
  if (r.warnings && r.warnings.length) toast(`${r.name} — 칸 ${r.rows}개 중 ${r.warnings.length}개는 그림을 못 받았습니다`);
  await loadImportedScreen(`${r.profile}/${r.entry.slug}`);
}

async function loadImportedScreen(key) {
  const it = (data.imported?.screens || []).find((x) => `${x.profile}/${x.slug}` === key);
  if (!it) return;
  let doc;
  try { doc = await fetchJson(new URL(it.path, URLS.importedBase)); }
  catch (e) { toast("가져온 화면을 읽지 못했습니다"); console.error(e); return; }

  const base = new URL(it.imgBase, URLS.importedBase);
  await placeImportedDoc(doc, (img) => (img ? new URL(img, base).href : ""),
    { profile: it.profile, slug: it.slug, screenId: doc.screen.id, mode: doc.mode, name: doc.screen.name });
}

/* 파일로 불러온 화면을 캔버스에 올린다 — 그림이 파일 안에 들어 있어 주소를 붙일 필요가 없다. */
async function loadFileScreen(key) {
  const it = (data.fileScreens || []).find((x) => x.key === key);
  if (!it) return;
  await placeImportedDoc(it.doc, (img) => img || "",
    { profile: null, slug: null, screenId: it.doc.screen.id, mode: it.doc.mode, name: it.doc.screen.name, fromFile: it.fileLabel });
}


/* ── 가져온 화면을 우리 부품으로 「새로 그리기」 ───────────────────
   왼쪽에 원본 그림을 두고, 오른쪽에 같은 차례로 정본 부품을 놓아 화면을 다시 그린다.
   원칙 셋 (river 결정 2026-09-18):
     ① 원본은 손대지 않는다 — 왼쪽은 보기 전용 대조판이다.
     ② 대응 부품이 없는 자리는 회색 빈 칸 + 이름표로 남긴다. 비슷해 보이는 것을 추측으로 끼워 넣지 않는다.
     ③ 이름 대응표는 레거시 관찰 자료(part-map.json)이고 정본 규칙이 아니다 — 정본에 합치지 않는다.  */
const partMapCache = {};
async function partMapFor(profile) {
  if (!profile) return null;
  if (!(profile in partMapCache)) {
    partMapCache[profile] = await fetchJson(URLS.partMap(profile)).catch(() => null);
  }
  return partMapCache[profile];
}
const normName = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* 정본 세트 이름("Mobile Header") → 배포본 부품 id("mobile-header"). 배포본에 없으면 쓰지 않는다. */
function distIdByCanonName(name) {
  const hit = (data.registry?.components || []).find((c) => normName(c.name) === normName(name));
  const id = hit ? hit.id : normName(name);
  return data.manifests[id] ? id : null;
}
/* 이 칸의 canon 메모(가져오기가 적어 둔 이름 대응 결과) → 레거시 이름별 부품 id */
function canonMapOf(legacyRow) {
  const m = new Map();
  for (const c of legacyRow.canon || []) {
    if (c.status !== "matched") continue;
    const id = (c.canonSets || []).map(distIdByCanonName).find(Boolean);
    if (id) m.set(String(c.legacy).trim(), id);
  }
  return m;
}
function resolvePart(name, partMap, canonById) {
  const raw = String(name || "");
  for (const k of [raw, raw.trim(), raw.split("/")[0].trim()]) {
    const m = partMap?.map?.[k];
    if (!m) continue;
    if (m.kind === "component") return data.manifests[m.id] ? { kind: "component", id: m.id } : null;
    if (m.kind === "helper") return { kind: "helper", id: m.id };
    if (m.kind === "chrome") return { kind: "chrome" };
    return null;                                   // unmapped — 대응 부품이 아직 없다
  }
  const byCanon = canonById.get(raw.trim());
  return byCanon ? { kind: "component", id: byCanon } : null;
}
/* 원본 글자 크기·굵기에 가장 가까운 정본 타이포 토큰을 고른다(새 값을 만들지 않는다). */
function typoFor(item) {
  const size = Number(item.size) || 14;
  const w = Number(item.weight) || 400;
  if (size >= 30) return "typo-title-32b";
  if (size >= 22) return "typo-title-24b";
  if (size >= 19) return "typo-title-20b";
  if (size >= 17) return w >= 500 ? "typo-title-18b" : "typo-body-16r";
  if (size >= 15) return w >= 500 ? "typo-title-16b" : "typo-body-16r";
  if (size >= 13) return w >= 700 ? "typo-title-14b" : (w >= 500 ? "typo-body-14m" : "typo-body-14r");
  return w >= 500 ? "typo-body-12m" : "typo-body-12r";
}
const placeholderBlock = (o) => ({
  id: nextId("b"), kind: "placeholder", width: "auto",
  widthPx: Math.max(24, Number(o.w) || 120), heightPx: Math.max(16, Number(o.h) || 24),
  legacyName: o.name || ""
});
/* 한 칸 안에서 위아래로 겹치는 알맹이들은 같은 줄에 나란히 놓는다. */
function groupLines(items) {
  const lines = [];
  for (const it of items) {
    const cur = lines[lines.length - 1];
    if (cur && it.y < cur.bottom - 6) { cur.items.push(it); cur.bottom = Math.max(cur.bottom, it.y + it.h); }
    else lines.push({ top: it.y, bottom: it.y + it.h, items: [it] });
  }
  for (const l of lines) l.items.sort((x, y) => x.x - y.x);   // 한 줄 안에서는 왼쪽부터
  return lines;
}
async function blockForItem(it, doc, partMap, canonById, notes) {
  if (it.kind === "text") {
    const big = (Number(it.size) || 14) >= 16 || (Number(it.weight) || 400) >= 700;
    return { id: nextId("b"), kind: "text", width: "auto", text: it.text, typo: typoFor(it), color: big ? "title-primary" : "body-primary" };
  }
  const r = resolvePart(it.name, partMap, canonById);
  if (!r) { notes.unknown.push(String(it.name || "").trim()); return placeholderBlock({ name: it.name, w: it.w, h: it.h }); }
  if (r.kind === "chrome") { notes.chrome.push(String(it.name || "").trim()); return "chrome"; }
  if (r.kind === "helper") return { id: nextId("b"), kind: r.id, width: "auto" };
  const block = await makeComponentBlock(r.id, {});
  const label = (it.texts || [])[0];
  if (label) block.text = label;
  if (!block.bleed && it.w >= doc.screen.width - 8) block.width = "fill";
  notes.made.push(r.id);
  return block;
}
const newImportedRow = (blocks, gapPx) => ({
  id: nextId("r"), gap: String(GROUP_RULES.rowGap), align: "start",
  marginBottom: "0", marginBottomPx: Math.max(0, Math.round(gapPx || 0)), blocks
});
/* 가져온 화면 한 장 → 우리 부품으로 다시 그린 줄들 */
async function rebuildRows(doc, partMap) {
  const rows = [];
  const notes = { made: [], unknown: [], chrome: [], emptyRows: [] };
  for (let i = 0; i < doc.rows.length; i += 1) {
    const lr = doc.rows[i];
    const next = doc.rows[i + 1];
    const tailGap = next ? Math.max(0, next.y - (lr.y + lr.h)) : 0;
    const canonById = canonMapOf(lr);
    const lines = groupLines(lr.items || []);
    const made = [];
    for (const line of lines) {
      const blocks = [];
      for (const it of line.items) {
        const b = await blockForItem(it, doc, partMap, canonById, notes);
        if (b && b !== "chrome") blocks.push(b);
      }
      if (blocks.length) made.push({ line, blocks });
    }
    if (!made.length) {
      // 알맹이를 하나도 못 읽었거나 전부 기기 크롬인 칸 — 빈 칸으로 자리만 남긴다
      if (!(lr.items || []).length) notes.emptyRows.push(lr.label);
      if ((lr.items || []).length) continue;               // 크롬만 있던 칸은 빌더가 화면 틀로 그린다
      rows.push(newImportedRow([placeholderBlock({ name: lr.label, w: lr.w, h: lr.h })], tailGap));
      continue;
    }
    made.forEach((m, j) => {
      const nx = made[j + 1];
      rows.push(newImportedRow(m.blocks, nx ? Math.max(0, nx.line.top - m.line.bottom) : tailGap));
    });
  }
  return { rows, notes };
}

/* 가져온 화면 한 장을 캔버스에 올리는 한 갈래 — 저장소에서 온 것도, 파일에서 온 것도 여기로 모인다. */
async function placeImportedDoc(doc, imgUrl, meta) {
  state = freshState();
  state.meta.name = doc.screen.name;
  state.meta.platform = doc.screen.width <= 480 ? "mobile" : "pc";
  state.screen.padding = "0";      // 원본 그림이 이미 제 자리·제 여백을 갖고 있다
  /* 원본 본문이 좌우 어디서 시작하는지 재 둔다 — 새로 놓는 정본 부품이 원본과 같은 자리에 들어가게.
     화면 폭을 꽉 채우지 않는 칸들 중 가장 흔한 시작 위치를 쓴다(예: 모두앱 홈 = 20). */
  const insets = doc.rows.filter((r) => r.w < doc.screen.width - 8).map((r) => r.x || 0);
  const tally = new Map();
  for (const v of insets) tally.set(v, (tally.get(v) || 0) + 1);
  state.screen.importedInset = insets.length
    ? [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0]
    : 0;
  state.screen.shell = "none";     // 위아래 크롬은 왼쪽 원본이 이미 갖고 있다 — 겹치지 않게 끈 채로 시작한다
  state.imported = meta;

  /* 왼쪽 — 원본 그대로(보기 전용 대조판). 자리·크기는 원본 좌표 그대로 겹쳐 올린다. */
  state.reference = {
    name: doc.screen.name,
    width: doc.screen.width,
    height: doc.screen.height,
    rows: doc.rows.map((r) => ({ image: imgUrl(r.image), x: r.x || 0, y: r.y || 0, w: r.w, h: r.h, label: r.label }))
  };

  /* 오른쪽 — 같은 차례로 우리 부품을 놓아 새로 그린 화면. 여기가 고치고 내보내는 쪽이다. */
  const { rows, notes } = await rebuildRows(doc, await partMapFor(meta.profile));
  state.rows = rows;
  selection = { rowId: null, blockId: null };
  renderToolbar();
  await update();
  const holes = new Set(notes.unknown.filter(Boolean));
  toast(`"${doc.screen.name}" — 왼쪽은 원본, 오른쪽은 새로 그린 화면입니다`
    + (holes.size ? ` · 아직 부품이 없는 자리 ${holes.size}종` : ""));
}

const HELPERS = [
  ["text", "글자", "제목·본문 글자"],
  ["divider", "구분선", "1px 가는 선"],
  ["space", "빈 칸", "세로 간격"]
];
/* ── 검색 — 탭마다 따로. 찾는 말이 있으면 해당 갈래를 자동으로 펼친다. ── */
function applySearch() {
  const GROUP_BOX = { parts: "#pb-part-groups", patterns: "#pb-pattern-groups", imported: "#pb-imported-groups" };
  for (const pane of ["parts", "patterns", "imported"]) {
    const box = document.querySelector(GROUP_BOX[pane]);
    if (!box) continue;
    const q = (els[`search_${pane}`]?.value || "").trim().toLowerCase();
    const items = box.querySelectorAll("[data-search]");
    items.forEach((el) => { el.hidden = Boolean(q) && !el.dataset.search.toLowerCase().includes(q); });
    box.querySelectorAll(".pb-group").forEach((g) => {
      const all = [...g.querySelectorAll("[data-search]")];
      g.hidden = all.length > 0 && all.every((el) => el.hidden);
      if (q && !g.hidden && g.classList.contains("pb-acc") && g.dataset.open !== "true") {  // 찾는 말이 있으면 펼쳐서 보여준다
        g.dataset.open = "true";
        g.querySelector(".pb-acc-head")?.setAttribute("aria-expanded", "true");
        g.dispatchEvent(new CustomEvent("pb-open", { bubbles: true }));   // 그 안의 미리보기 그림을 그리게 알린다
      }
    });
    const empty = els[`empty_${pane}`];
    if (empty) empty.hidden = !q || [...items].some((el) => !el.hidden);
  }
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
  const choice = chosenAxis[id] || {};
  const skeleton = hasVariantMarkup(id) ? variantHtml(id, { variant: choice.variant, size: choice.size }) : null;
  if (skeleton) {                                            // 변형마다 뼈대가 다른 부품은 그 변형 뼈대로 그린다
    const tpl = document.createElement("template");
    tpl.innerHTML = skeleton.trim();
    frag = tpl.content.firstElementChild;
  } else {
    frag = frag.cloneNode(true);
    applyAxes(frag, { component: id, size: choice.size, variant: choice.variant }, brk);
  }
  if (!frag) { box.textContent = "미리보기 없음"; return; }
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
    ? `<div class="pb-chips" data-axis="${axis}">${values.map((v) => UI.chipHtml(v, { pressed: v === current, "data-chip": v })).join("")}</div>` : "";
  els.partGroups.innerHTML = sorted.map(([cat, list]) => {
    const visible = list.filter((id) => availableOn(id, brk));   // 이 플랫폼 배포본이 없는 부품은 목록에서 뺀다
    if (!visible.length) return "";
    return accordion(categoryTitle(cat), `${visible.length}개`, `<div class="pb-list">${visible.map((id) => {
      const sizes = sizeAxis(id, brk), variants = variantAxis(id);
      const c = chosenAxis[id] = { size: sizes.includes(chosenAxis[id]?.size) ? chosenAxis[id].size : sizes[0], variant: variants.includes(chosenAxis[id]?.variant) ? chosenAxis[id].variant : variants[0] };
      return `<div class="pb-card" data-part="${id}" data-search="${escapeAttr(searchText(id))}" draggable="true" role="button" tabindex="0" aria-label="${escapeAttr(registryName(id))} 놓기">
        <div class="pb-card-head"><span class="pb-card-name">${registryName(id)}</span><small>${[variants.length ? `변형 ${variants.length}` : "", sizes.length ? `크기 ${sizes.length}` : ""].filter(Boolean).join(" · ") || "축 없음"}</small></div>
        <p class="pb-card-ko">${escapeHtml(koLabel(id))}</p>
        <div class="pb-thumb" aria-hidden="true"></div>
        ${chips(id, "variant", variants, c.variant)}${chips(id, "size", sizes, c.size)}
      </div>`;
    }).join("")}</div>`);
  }).join("");
  UI.mount(els.partGroups);                                  // 카드 안의 축 칩에 배포본 동작을 물린다
  wireAccordions(els.partGroups);
  els.partGroups.querySelectorAll("[data-part]").forEach((card) => {
    const id = card.dataset.part;
    let drawn = false;
    const draw = () => { if (!drawn) { drawn = true; renderThumb(card.querySelector(".pb-thumb"), id, brk); } };
    const acc = card.closest(".pb-acc");
    if (acc?.dataset.open === "true") draw(); else acc?.addEventListener("pb-open", draw);
    card.addEventListener("click", (e) => { if (e.target.closest("[data-chip]")) return; addComponent(id, chosenAxis[id]); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addComponent(id, chosenAxis[id]); } });
    card.addEventListener("dragstart", (e) => startDrag(e, { component: id, ...chosenAxis[id] }));
    card.addEventListener("dragend", endDrag);
    card.querySelectorAll("[data-chip]").forEach((chip) => chip.addEventListener("click", (e) => {
      e.stopPropagation();
      const axis = chip.closest("[data-axis]").dataset.axis;
      chosenAxis[id][axis] = chip.dataset.chip;
      chip.parentElement.querySelectorAll("[data-chip]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      drawn = false; draw();
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
  if (CHROME_BLEED.has(id)) { block.width = "fill"; block.bleed = true; }
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
/* 라벨 붙이기 — 고른 부품 바로 윗줄에 라벨 글자를 넣고 둘을 한 묶음으로 묶는다.
   라벨 글자 규격과 부품과의 간격은 묶음 규칙(GROUP_RULES)이 정한다 — 매번 사람이 고르지 않는다. */
function attachLabel(blockId) {
  const hit = findBlock(blockId); if (!hit) return;
  const ri = state.rows.indexOf(hit.row);
  const above = state.rows[ri - 1];
  if (above && above.blocks.length === 1 && above.blocks[0].kind === "text" && hit.row.attached) {
    selection = { rowId: above.id, blockId: above.blocks[0].id };   // 이미 붙어 있으면 그 라벨을 고른다
    update();
    return;
  }
  const labelRow = newRow();
  const label = {
    id: nextId("b"), kind: "text", width: "auto",
    text: "라벨", typo: GROUP_RULES.labelTypo, color: GROUP_RULES.labelColor
  };
  labelRow.blocks.push(label);
  labelRow.attached = hit.row.attached || false;   // 윗묶음에 이어 붙던 줄이면 그 자리를 라벨이 물려받는다
  state.rows.splice(ri, 0, labelRow);
  hit.row.attached = true;
  selection = { rowId: labelRow.id, blockId: label.id };
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
function propRow(label, control) { return `<div class="pb-prop"><span class="pb-prop-label">${label}</span>${control}</div>`; }
/* 아래 세 도구가 속성 패널의 컨트롤을 모두 만든다 — 전부 배포본 부품이다. */
function selectHtml(name, options, value, label) {
  return UI.selectHtml({ options, value, label: label || name, "data-prop": name });
}
function textFieldHtml(name, value, { label = name, placeholder = "", type = "text" } = {}) {
  return UI.inputHtml({ value, placeholder, label, type, control: { "data-prop": name } });
}
function actionButtonHtml(label, act, extra = {}) {
  return UI.buttonHtml(label, { "data-act": act, ...extra });
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
      if (v.length) parts.push(propRow("변형", selectHtml("variant", v.map((x) => [x, x]), b.variant, "변형")));
      const s = sizeAxis(b.component, brk);
      if (s.length) parts.push(propRow("크기", selectHtml("size", s.map((x) => [x, x]), b.size, "크기")));
      parts.push(propRow("글자", textFieldHtml("text", b.text || "", { label: "글자", placeholder: "첫 라벨/제목 바꾸기" })));
    } else if (b.kind === "text") {
      parts.push(propRow("내용", textFieldHtml("text", b.text || "", { label: "내용" })));
      parts.push(propRow("글꼴", selectHtml("typo", TYPO.map((t) => [t, t.replace("typo-", "")]), b.typo, "글꼴")));
      parts.push(propRow("색", selectHtml("color", TEXT_COLORS, b.color, "글자색")));
    } else if (b.kind === "legacy") {
      /* 레거시 칸 — 고칠 수 있는 값이 없다. 무엇이 원본에 있었고 정본에 대응이 있는지만 보여 준다. */
      const LABEL = { matched: "정해짐", pattern: "부품이 아니라 배치 규칙", "legacy-only": "레거시에만 있음", undecided: "아직 안 정함", "no-canon": "교체 대상 아님", unknown: "모름" };
      parts.push(`<p class="pb-note"><strong>${escapeHtml(b.legacyLabel || "원본 칸")}</strong> · ${b.widthPx}×${b.heightPx}</p>`);
      parts.push(`<p class="pb-note">원본 화면을 그대로 찍은 그림입니다. 우리 부품이 아니라서 변형·크기를 바꿀 수 없습니다. 지우고 그 자리에 새 부품을 놓을 수는 있습니다.</p>`);
      const cn = (b.canon || []);
      if (cn.length) {
        parts.push(`<p class="pb-section-title">원본에 쓰인 이름</p>`);
        parts.push(`<ul class="pb-note pb-legacy-canon">${cn.map((c) =>
          `<li>${escapeHtml(c.legacy)} → ${c.status === "matched" && c.canonSets.length ? escapeHtml(c.canonSets.join(" + ")) : (LABEL[c.status] || c.status)}</li>`).join("")}</ul>`);
        parts.push(`<p class="pb-note">「정해짐」이라도 <strong>자동으로 바꾸지 않습니다</strong> — 이 묶음은 레거시 모습 그대로가 규칙입니다.</p>`);
      }
    } else if (b.kind === "placeholder") {
      parts.push(`<p class="pb-note"><strong>${escapeHtml(b.legacyName || "원본 자리")}</strong> · ${b.widthPx}×${b.heightPx}</p>`);
      parts.push(`<p class="pb-note">원본의 이 자리에 해당하는 <strong>정본 부품이 아직 없습니다.</strong> 비슷해 보이는 부품을 임의로 끼워 넣지 않고 자리만 비워 두었습니다. 지우고 직접 부품을 놓거나, 부품이 생길 때까지 그대로 두세요.</p>`);
    } else if (b.kind === "space") {
      parts.push(propRow("높이", selectHtml("height", spacingOpts, b.height, "높이")));
    } else {
      parts.push(`<p class="pb-note">구분선 — 행 폭을 채웁니다.</p>`);
    }
    if (b.kind !== "divider" && b.kind !== "space" && b.kind !== "placeholder") {
      const w = ["auto", "fill", "custom"].includes(b.width) ? b.width : "custom";
      if (w === "custom" && !b.widthPx) b.widthPx = Number(b.width) || 320;
      parts.push(propRow("폭", selectHtml("width", [["auto", "내용만큼"], ["fill", "남은 폭 채우기"], ["custom", "직접 입력(px)"]], w, "폭")));
      if (w === "custom") parts.push(propRow("폭(px)", textFieldHtml("widthPx", b.widthPx || 320, { label: "폭(px)", type: "number" })));
      parts.push(propRow("가장자리", selectHtml("bleed", [["false", "화면 여백 안쪽"], ["true", "화면 끝까지"]], String(!!b.bleed), "가장자리")));
    }
    if (b.kind === "component" && b.component === "table" && !b.table && !b.html) {
      exampleHtml("table", brk).then((html) => { b.table = tableModelFromExample(html); update(); });
    }
    if (b.kind === "component" && b.component === "table" && b.table) {
      parts.push(`<p class="pb-section-title">표 구성</p>`);
      parts.push(propRow("행 수", textFieldHtml("table.rows", b.table.rows, { label: "행 수", type: "number" })));
      parts.push(propRow("선택 칸", selectHtml("table.selection", [["true", "체크박스 열 있음"], ["false", "없음"]], String(!!b.table.selection), "선택 칸")));
      parts.push(`<p class="pb-note">열 — 이름 · 정렬 · 폭(px, 비우면 자동)</p>`);
      b.table.columns.forEach((col, i) => {
        parts.push(`<div class="pb-col">
          <div class="pb-col-head"><span class="pb-col-title">열 ${i + 1}</span>${UI.assistButtonHtml("삭제", { "data-act": "col-del", "data-col": i, "aria-label": `열 ${i + 1} 삭제` })}</div>
          ${propRow("이름", textFieldHtml(`table.columns.${i}.label`, col.label || "", { label: `열 ${i + 1} 이름`, placeholder: "열 이름" }))}
          ${propRow("정렬", selectHtml(`table.columns.${i}.align`, [["", "왼쪽"], ["center", "가운데"]], col.align === "center" ? "center" : "", `열 ${i + 1} 정렬`))}
          ${propRow("폭", textFieldHtml(`table.columns.${i}.width`, col.width || "", { label: `열 ${i + 1} 폭`, placeholder: "폭(px, 비우면 자동)", type: "number" }))}
        </div>`);
      });
      parts.push(`<div class="pb-prop-actions">${actionButtonHtml("+ 열 추가", "col-add")}</div>`);
    }
    parts.push(`<div class="pb-prop-actions">
      ${actionButtonHtml("← 왼쪽", "left")}${actionButtonHtml("오른쪽 →", "right")}
      ${actionButtonHtml("↑ 윗행", "up")}${actionButtonHtml("↓ 아랫행", "down")}
      ${actionButtonHtml("↵ 새 줄로 분리", "split")}${b.kind === "component" ? actionButtonHtml("＋ 라벨 붙이기", "label") : ""}
      ${actionButtonHtml("복제", "dup")}${actionButtonHtml("삭제", "del")}
    </div>`);
    if (b.kind === "component") {
      parts.push(`<details class="pb-details"><summary class="pb-note">마크업 직접 수정 (고급)</summary>
        <div class="pb-prop">${UI.textareaHtml({ value: b.html || "", label: "마크업", placeholder: "비우면 배포 예제로 되돌립니다", control: { "data-prop": "html" } })}</div>
        <div class="pb-prop-actions">${actionButtonHtml("적용", "apply-html")}</div></details>`);
    }
  }

  if (row) {
    parts.push(`<p class="pb-section-title">행</p>`);
    parts.push(propRow("정렬", selectHtml("row.align", [["start", "왼쪽"], ["center", "가운데"], ["end", "오른쪽"], ["between", "양끝"]], row.align, "행 정렬")));
    parts.push(propRow("요소 간격", selectHtml("row.gap", spacingOpts, row.gap, "요소 간격")));
    const rowIndex = state.rows.indexOf(row);
    const role = groupRoleOf(rowIndex);
    if (rowIndex > 0) parts.push(propRow("윗줄과 한 묶음", selectHtml("row.attached", [["false", "아니오"], ["true", "예"]], String(!!row.attached), "윗줄과 한 묶음")));
    if (role) parts.push(`<p class="pb-note">묶음에 들어 있어 아래 여백은 <strong>묶음 규칙</strong>이 정합니다 — ${role === "end" ? "묶음 사이" : "묶음 안"} 간격.</p>`);
    else parts.push(propRow("아래 여백", selectHtml("row.marginBottom", spacingOpts, row.marginBottom, "아래 여백")));
    parts.push(`<div class="pb-prop-actions">
      ${actionButtonHtml("행 위로", "row-up")}${actionButtonHtml("행 아래로", "row-down")}${actionButtonHtml("행 삭제", "row-del")}
    </div>`);
  }

  parts.push(`<p class="pb-section-title">화면</p>`);
  parts.push(propRow("안쪽 여백", selectHtml("screen.padding", spacingOpts, state.screen.padding, "화면 안쪽 여백")));
  parts.push(propRow("묶음 안 간격", selectHtml("screen.groupGap", spacingOpts, state.screen.groupGap || GROUP_RULES.insideGap, "묶음 안 간격")));
  parts.push(propRow("묶음 사이 간격", selectHtml("screen.betweenGap", spacingOpts, state.screen.betweenGap || GROUP_RULES.betweenGap, "묶음 사이 간격")));
  if (!hit && !row) parts.push(`<p class="pb-note">캔버스에서 요소나 줄을 누르면 여기서 고칩니다. 왼쪽 부품을 누르면 새 줄로 내려가고, "선택한 줄 옆"을 고르면 나란히 들어갑니다.</p>`);

  els.props.innerHTML = parts.join("");

  UI.mount(els.props);
  UI.linkSelectLabels(els.props);
  els.props.querySelectorAll('[data-s1-component="select"][data-prop]').forEach((root) => {
    UI.onSelectChange(root, (value) => setProp(root.dataset.prop, value));
  });
  els.props.querySelectorAll("input[data-prop], textarea[data-prop]").forEach((ctl) => {
    if (ctl.dataset.prop === "html") return;
    ctl.addEventListener("change", () => setProp(ctl.dataset.prop, ctl.value));
    if (ctl.tagName === "INPUT") ctl.addEventListener("keydown", (e) => { if (e.key === "Enter") setProp(ctl.dataset.prop, ctl.value); });
  });
  els.props.querySelectorAll("[data-act]").forEach((btn) => btn.addEventListener("click", () => {
    const act = btn.dataset.act;
    const id = selection.blockId;
    if (act === "left" || act === "right" || act === "up" || act === "down" || act === "split") moveBlock(id, act);
    else if (act === "label") attachLabel(id);
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
    if (!row) return;
    const key = name.slice(4);
    if (key === "attached") row.attached = value === "true";
    else row[key] = value;
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
    else if (name === "bleed") hit.block.bleed = value === "true";
    else hit.block[name] = value;
  }
  update();
}

/* ── 렌더·갱신 ─────────────────────────────────────────────── */
async function renderCanvas() {
  els.canvas.dataset.theme = state.meta.theme;
  els.frameInfo.textContent = state.rows.length ? `행 ${state.rows.length} · 요소 ${state.rows.reduce((n, r) => n + r.blocks.length, 0)}` : "";
  /* 본문은 스크롤 칸 안에 둔다 — 기기처럼 보기에서 위아래 크롬은 붙어 있고 내용만 스크롤된다. */
  els.canvas.innerHTML = "";
  renderReference();
  const scroll = document.createElement("div");
  scroll.className = "pb-scroll";
  els.canvas.appendChild(scroll);
  if (!state.rows.length) {
    scroll.innerHTML = `<div class="pb-canvas-empty">아직 비어 있습니다.<br>왼쪽 부품을 이리로 끌어다 놓거나, 눌러서 놓아 보세요.</div>`;
    wireDropZone(scroll.lastElementChild, () => ({ index: 0 }));
    paintShell();
    fitCanvas();
    return;
  }
  const screen = await renderScreen(scroll, true);
  try { autoInit(screen); } catch (e) { console.warn("autoInit", e); }
  paintShell();
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
  renderSuggest();
  if (rendering) { queued = true; return; }
  rendering = true;
  try { await renderCanvas(); } finally { rendering = false; if (queued) { queued = false; update(); } }
}


/* ── 다음에 올 만한 것 ───────────────────────────────────────
   모두앱 레거시 화면에서 「무엇 다음에 무엇이 왔는지」를 세어 둔 표(suggest-model.json)를 읽어
   지금 캔버스 마지막 줄 다음에 올 만한 것을 보여준다.
   ⛔ 레거시 관찰일 뿐 가이드 규칙이 아니다 — 화면에도 그렇게 적는다(river 2026-09-18).
   ⛔ 레거시 칸을 바꿔치기하는 것이 아니라, 놓는 것은 언제나 정본 부품이다.
   제안 조각은 **정본 Assist Button**(좁은 자리의 보조 동작)으로 그린다 — 누르면 그 부품을 놓는
   '동작'이지 켜고 끄는 토글이 아니라서 Chip 을 쓰지 않는다. */
const SUGGEST_START = "__start__";
const HELPER_KO = Object.fromEntries(HELPERS.map(([k, n]) => [k, n]));

function suggestKeyOfBlock(block) {
  if (block.kind === "component") return `component:${block.component}`;
  if (block.kind === "text") return "helper:text";
  if (block.kind === "divider") return "helper:divider";
  return null;
}
/* 지금 어디까지 놓았나 — 마지막으로 채워진 줄의 구성이 다음 제안의 근거가 된다 */
function suggestContext() {
  const row = [...state.rows].reverse().find((r) => r.blocks.length);
  if (!row) return { group: SUGGEST_START, part: SUGGEST_START };
  const keys = [...new Set(row.blocks.map(suggestKeyOfBlock).filter(Boolean))].sort();
  const last = [...row.blocks].reverse().map(suggestKeyOfBlock).find(Boolean);
  return { group: keys.length ? keys.join("+") : SUGGEST_START, part: last || SUGGEST_START };
}
/* 이 플랫폼에서 실제로 놓을 수 있는 것만 제안한다 */
function suggestUsable(key) {
  const [kind, id] = key.split(":");
  if (kind === "helper") return Boolean(HELPER_KO[id]);
  const brk = PLATFORM_BREAK[state.meta.platform] || "pc";
  return Boolean(data.manifests[id]) && isPlaceable(id) && availableOn(id, brk);
}
const suggestLabel = (key) => {
  const [kind, id] = key.split(":");
  return kind === "helper" ? HELPER_KO[id] || id : registryName(id);
};

function renderSuggest() {
  const box = els.suggest;
  if (!box) return;
  const model = data.suggest;
  const isMobile = (PLATFORM_BREAK[state.meta.platform] || "pc") === "mobile";
  if (!model || !isMobile) { box.hidden = true; return; }   // 지금 셈해 둔 것은 모두앱(휴대폰 앱)뿐이다

  const ctx = suggestContext();
  const groups = (model.nextGroups?.[ctx.group] || []).filter((c) => c.key.split("+").every(suggestUsable));
  const parts = (model.nextParts?.[ctx.part] || []).filter((c) => suggestUsable(c.key));
  if (!groups.length && !parts.length) { box.hidden = true; return; }
  box.hidden = false;

  const chip = (c, type) => UI.assistButtonHtml(
    `${c.key.split("+").map(suggestLabel).join(" + ")} · ${c.share}%`,
    { "data-suggest": c.key, "data-suggest-type": type });

  els.suggestGroups.innerHTML = groups.length ? `<span class="pb-suggest-kind">묶음으로</span>${groups.map((c) => chip(c, "group")).join("")}` : "";
  els.suggestParts.innerHTML = parts.length ? `<span class="pb-suggest-kind">하나씩</span>${parts.map((c) => chip(c, "part")).join("")}` : "";
  const base = ctx.group === SUGGEST_START ? "빈 화면에서 맨 처음 놓은 것" : `「${ctx.group.split("+").map(suggestLabel).join(" + ")}」 다음에 놓은 것`;
  els.suggestSrc.textContent = `모두앱 레거시 화면 ${(model._meta?.usableScreens || 0).toLocaleString()}장에서 ${base} · 가이드 규칙이 아니라 참고입니다`;

  box.querySelectorAll("[data-suggest]").forEach((b) => b.addEventListener("click", () =>
    (b.dataset.suggestType === "group" ? placeSuggestGroup : placeSuggestPart)(b.dataset.suggest)));
}

async function suggestBlock(key) {
  const [kind, id] = key.split(":");
  if (kind === "component") return makeComponentBlock(id, chosenAxis[id] || {});
  return { kind: id };
}
/* 묶음 제안 — 한 줄을 통째로 놓는다 */
async function placeSuggestGroup(key) {
  const keys = key.split("+");
  const row = targetRow();
  for (const k of keys) addBlock(await suggestBlock(k), { row });
  toast(`「${keys.map(suggestLabel).join(" + ")}」 줄을 놓았습니다`);
}
/* 부품 제안 — 하나만 놓는다(놓는 방식을 그대로 따른다) */
async function placeSuggestPart(key) {
  addBlock(await suggestBlock(key));
}

/* ── 내보내기 ───────────────────────────────────────────────── */
const EXPORT_CSS = `
.s1-screen { box-sizing: border-box; margin: 0 auto; background: var(--color-bg-level-0); color: var(--color-text-body-primary); font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.s1-screen[data-s1-header-bg="home"] { background: var(--color-bg-home); }   /* Home 유형 헤더 화면은 상단부터 본문까지 한 배경 */
.s1-row { display: flex; flex-wrap: wrap; align-items: flex-start; }
.s1-row[data-s1-bleed="true"] { flex-wrap: nowrap; }
/* 묶음(data-s1-group) — 라벨+부품처럼 한 덩어리로 읽히는 줄들.
   간격은 묶음 규칙이 정한 값이 각 줄에 인라인으로 박혀 나가므로 여기 규칙은 없다. */
.s1-block { min-width: 0; }
.s1-text { margin: 0; }
.s1-divider { border: 0; border-top: 1px solid var(--color-line-gray-subtle); margin: 0; width: 100%; }
/* 하단 메뉴 바 — 배포 부품은 탭 1칸(60×60)뿐이고 바(가로 배치·배경)는 화면이 소유한다.
   근거: registry/components/mobile-bottom-nav.json(bar-background = --color-navigation-bg) · s1-ui.css D1. */
.s1-block [role="tablist"]:has(> [data-s1-component="mobile-bottom-nav"]) { display: flex; width: 100%; background: var(--color-navigation-bg); }
.s1-block [role="tablist"]:has(> [data-s1-component="mobile-bottom-nav"]) > [data-s1-component="mobile-bottom-nav"] { flex: 1 1 0; }
/* 대응 부품이 아직 없어 비워 둔 자리 — 채운 척하지 않는다. */
.s1-block[data-s1-placeholder="true"] { box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center; border: 1px dashed var(--color-line-gray-subtle); border-radius: var(--radius-4); background: var(--color-bg-level-1); color: var(--color-text-body-tertiary); font-size: 11px; line-height: 1.4; padding: 4px 6px; overflow: hidden; }
/* 가져온 레거시 칸 — 원본 화면을 찍은 그림이다. 우리 부품이 아니고 토큰도 타지 않는다. */
.s1-block[data-s1-legacy="true"] { line-height: 0; }
.s1-block[data-s1-legacy="true"] img { display: block; max-width: none; }
`.trim();

/* 내보낼 때 레거시 그림은 파일 안에 넣는다 — 내보낸 HTML 하나만 열어도 보이게. */
async function inlineLegacyImages(root) {
  const imgs = [...root.querySelectorAll('[data-s1-legacy="true"] img')];
  let failed = 0;
  for (const img of imgs) {
    try {
      const res = await fetch(img.src);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      img.src = await new Promise((ok, no) => {
        const fr = new FileReader();
        fr.onload = () => ok(fr.result);
        fr.onerror = no;
        fr.readAsDataURL(blob);
      });
    } catch { failed += 1; }
  }
  return { count: imgs.length, failed };
}

async function buildExportHtml() {
  const holder = document.createElement("div");
  const screen = await renderScreen(holder, false);
  const legacy = await inlineLegacyImages(screen);
  const p = platformInfo();
  screen.style.maxWidth = `${p.width}px`;
  screen.style.minHeight = `${p.height}px`;
  if (homeHeaderFirst()) screen.setAttribute("data-s1-header-bg", "home");
  screen.setAttribute("data-s1-service", state.meta.service);
  screen.setAttribute("data-s1-platform", state.meta.platform);
  screen.setAttribute("data-s1-role", state.meta.role);
  const base = "./s1-ui/";
  const title = state.meta.name || "S1 화면";
  const legacyNote = legacy.count ? `
     ⚠️ 이 화면에는 **가져온 레거시 칸 ${legacy.count}개**가 그림으로 들어 있습니다${legacy.failed ? ` (그 중 ${legacy.failed}개는 그림을 못 넣었습니다)` : ""}.
     원본 화면(${escapeHtml(state.imported?.name || "")})을 그대로 찍은 그림이라 우리 부품도 토큰도 아닙니다 — 코드로 만들려면 따로 옮겨야 합니다.` : "";
  return `<!DOCTYPE html>
<!-- Pattern Builder 내보내기 · s1-ui ${data.dist?.version || ""} · ${new Date().toISOString().slice(0, 10)}
     부품 CSS/JS 는 ui-library/dist 배포본을 ${base} 아래에 그대로 두고 씁니다(tokens.css · typography.css · s1-ui.css · s1-ui.auto.js).${legacyNote} -->
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
let requestModal = null;
function openRequest() {
  els.reqName.value = state.meta.name || "";
  els.reqPreview.hidden = true;
  requestModal?.open();
  els.reqName.focus();
}
function closeRequest() { requestModal?.close(); }

/* ── 유틸 ───────────────────────────────────────────────────── */
function escapeHtml(v) { return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function escapeAttr(v) { return escapeHtml(v).replaceAll('"', "&quot;"); }

/* ── 시작 ───────────────────────────────────────────────────── */
async function main() {
  Object.assign(els, {
    nameBox: $("#pb-name-box"), service: $("#pb-service"), platform: $("#pb-platform"), role: $("#pb-role"), theme: $("#pb-theme"),
    tabs: $("#pb-tabs"), place: $("#pb-place"), view: $("#pb-view"),
    distVersion: $("#pb-dist-version"), patternGroups: $("#pb-pattern-groups"), partGroups: $("#pb-part-groups"),
    canvas: $("#pb-canvas"), canvasWrap: $("#pb-canvas-wrap"), frameLabel: $("#pb-frame-label"), frameInfo: $("#pb-frame-info"), props: $("#pb-props"), toast: $("#pb-toast"),
    shell: $("#pb-shell"), shellField: $("#pb-shell-field"),
    search_parts: $("#pb-search-parts"), search_patterns: $("#pb-search-patterns"), search_imported: $("#pb-search-imported"),
    empty_parts: $("#pb-empty-parts"), empty_patterns: $("#pb-empty-patterns"), empty_imported: $("#pb-empty-imported"),
    importedGroups: $("#pb-imported-groups"),
    refSide: $("#pb-ref-side"), refWrap: $("#pb-ref-wrap"), refCanvas: $("#pb-ref-canvas"), refLabel: $("#pb-ref-label"),
    suggest: $("#pb-suggest"), suggestGroups: $("#pb-suggest-groups"), suggestParts: $("#pb-suggest-parts"), suggestSrc: $("#pb-suggest-src"),
    importDialog: $("#pb-import-dialog"), importLink: $("#pb-import-link"), importStatus: $("#pb-import-status"), importGo: $("#pb-import-go"),
    requestDialog: $("#pb-request-dialog"), reqName: $("#pb-req-name"), reqPurpose: $("#pb-req-purpose"), reqNotes: $("#pb-req-notes"), reqPreview: $("#pb-req-preview")
  });
  try { await loadAll(); }
  catch (e) {
    els.canvas.innerHTML = `<div class="pb-canvas-empty">배포본을 읽지 못했습니다.<br>이 페이지는 로컬 서버(http://…)로 열어야 합니다. file:// 로 열면 배포본을 읽을 수 없습니다.<br><small>${escapeHtml(e.message)}</small></div>`;
    console.error(e);
    return;
  }
  if (!restoreFromHash() && !restore()) state = freshState();

  UI.mount(document);                       // 정적으로 적어 둔 도구 UI 부품(탭·검색칸·멀티토글·버튼)
  UI.keepOpenPanelVisible(document);        // 스크롤 칸 안에서 드롭다운이 잘리지 않게
  requestModal = UI.mountModal(els.requestDialog);
  importModal = UI.mountModal(els.importDialog);
  renderToolbar(); renderPatternList(); renderPartGroups(); renderImportedList();
  checkImportAvailable();
  await update();

  els.search_parts.addEventListener("input", applySearch);
  els.search_patterns.addEventListener("input", applySearch);
  els.search_imported.addEventListener("input", applySearch);
  $("#pb-import-open").addEventListener("click", openImport);
  els.importGo.addEventListener("click", runImport);
  els.importLink.addEventListener("keydown", (e) => { if (e.key === "Enter") runImport(); });
  /* 탭 — 패널은 탭 묶음 바깥에 있으므로 화면이 직접 여닫는다(ui.js 주석 참조). */
  els.tabs.addEventListener("s1:tab:change", (e) => {
    const value = e.detail?.value;
    for (const pane of ["parts", "patterns", "imported"]) document.querySelector(`#pb-pane-${pane}`).hidden = pane !== value;
  });
  window.addEventListener("resize", fitCanvas);
  if (window.ResizeObserver) new ResizeObserver(() => fitCanvas()).observe(els.canvasWrap.parentElement);
  onToggleChange(els.place, (value) => { placeMode = value; });
  onToggleChange(els.view, (value) => { state.screen.view = value; update(); });
  $("#pb-add-row").addEventListener("click", () => { const r = newRow(); state.rows.push(r); selection = { rowId: r.id, blockId: null }; update(); });
  $("#pb-new").addEventListener("click", () => {
    if (state.rows.length && !confirm("지금 화면을 비우고 새로 시작할까요? (저장하지 않은 구성은 사라집니다)")) return;
    state = freshState(); selection = { rowId: null, blockId: null }; renderToolbar(); update();
  });
  $("#pb-save").addEventListener("click", () => download(`screen-${slug(state.meta.name)}.json`, JSON.stringify(state, null, 2), "application/json"));
  $("#pb-load").addEventListener("click", () => $("#pb-load-file").click());
  $("#pb-load-screen-btn").addEventListener("click", () => $("#pb-load-screen").click());
  /* 기존화면 불러오기 — Figma 플러그인(S-1 GUI Builder)이 내려준 파일을 연다.
     열쇠도 서버도 쓰지 않는다. 읽은 화면은 이 브라우저 안에만 있고 저장소에는 남지 않는다. */
  $("#pb-load-screen").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      const pack = JSON.parse(await f.text());
      const screens = readScreenPack(pack);
      if (!screens.length) throw new Error("화면이 들어 있지 않습니다");
      const label = f.name.replace(/\.json$/i, "");
      data.fileScreens = (data.fileScreens || []).filter((x) => x.fileLabel !== label);
      screens.forEach((doc, i) => {
        data.fileScreens.push({
          key: `${label}#${i}`,
          fileLabel: label,
          name: doc.screen.name,
          width: doc.screen.width,
          height: doc.screen.height,
          rows: doc.rows.length,
          doc
        });
      });
      switchTab("imported");
      renderImportedList();
      await loadFileScreen(`${label}#0`);
      if (screens.length > 1) toast(`화면 ${screens.length}장을 불러왔습니다 — 목록에서 고르세요`);
    } catch (err) {
      toast(`불러오기 실패: ${err.message}`);
      console.error(err);
    }
  });
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
