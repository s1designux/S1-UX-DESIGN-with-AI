/* react-harness/harness.jsx — "React 개발자 눈" 검수기가 진짜 Vite+React 앱 안에서 부품을 띄우는 시험대.
 * --------------------------------------------------------------------------
 * README 「시작하기」 3·4단계만 따른다: tokens.css → s1-ui.css 를 읽히고, ./s1-ui/platform/react 에서 꺼내 쓴다.
 * 검수기(react.mjs)는 이 파일을 임시 앱의 src/ 에 복사해 개발 서버(StrictMode 경고가 살아 있는 모드)로 띄우고,
 * 크롬 디버깅 통로로 window.__s1 를 불러 부품을 하나씩 붙였다 뗐다 한다.
 * 이 파일은 저장소 배포본을 고치지 않는다 — 받은 그대로를 쓴다.
 */
import "./s1-ui/assets/css/tokens.css";
import "./s1-ui/s1-ui.css";
import * as S1 from "./s1-ui/platform/react";
import { Component, StrictMode, useEffect, useRef, useState, createElement as h } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import planted, { catalog as plantedCatalog } from "./planted.jsx";

/* 자가시험(--selftest) 때만 고장 난 부품이 여기 끼어든다. 평소엔 빈 묶음. */
const ALL = { ...S1, ...planted };

/* 부품마다 BREAKS·PARTS 를 읽으려고 개별 모듈도 연다(검수기 전용 — 개발자 사용법 아님). */
const modules = import.meta.glob("./s1-ui/platform/react/*.jsx", { eager: true });
const isComponent = (v) => typeof v === "function" || (v && typeof v === "object" && v.$$typeof);   // forwardRef 로 감싼 부품은 함수가 아니라 객체다
const exportNameOf = new Map(Object.entries(S1).filter(([, v]) => isComponent(v)).map(([k, v]) => [v, k]));
const catalog = Object.entries(modules).map(([file, mod]) => ({
  file: file.split("/").pop(),
  name: exportNameOf.get(mod.default) || null,
  breaks: mod.FORMS || mod.BREAKS || [],
  variants: mod.VARIANTS || [],
  sizes: mod.SIZES || [],
  parts: mod.PARTS || [],
  legacyParts: mod.LEGACY_PARTS || []
})).concat(plantedCatalog || []);

/* ── 기록 ─────────────────────────────────────────────── */
const ev = [];
const rec = (label, payload) => {
  let detail = payload;
  try {
    if (payload && typeof payload === "object" && "detail" in payload && payload.type) detail = { type: payload.type, detail: safe(payload.detail), defaultPrevented: payload.defaultPrevented };
    else if (payload && typeof payload === "object" && payload.target && payload.nativeEvent) detail = { type: payload.type, value: payload.target.value, checked: payload.target.checked };
    else detail = safe(payload);
  } catch { detail = String(payload); }
  ev.push({ label, detail, t: Math.round(performance.now()) });
};
function safe(value) {
  return JSON.parse(JSON.stringify(value, (k, v) => (v instanceof Element ? `<${v.tagName.toLowerCase()} ${v.getAttribute("data-value") ?? ""}>` : v)) ?? "null");
}

/* JSON 으로 받은 props 를 되살린다: "$fn:이름" → 기록 함수, "$prevent:이름" → 기록+preventDefault, "$ref:이름" → ref 객체 */
const refs = {};
const fnCache = new Map();
function revive(value) {
  if (typeof value === "string") {
    if (value.startsWith("$fn:")) { const k = value; if (!fnCache.has(k)) fnCache.set(k, (e) => rec(value.slice(4), e)); return fnCache.get(k); }
    if (value.startsWith("$prevent:")) { const k = value; if (!fnCache.has(k)) fnCache.set(k, (e) => { e?.preventDefault?.(); rec(value.slice(9), e); }); return fnCache.get(k); }
    if (value.startsWith("$ref:")) { const name = value.slice(5); refs[name] ??= { current: null }; return refs[name]; }
    if (value.startsWith("$el:")) return h("b", { "data-audit-el": value.slice(4) }, value.slice(4));
    /* "$toggle:꺼짐|켜짐:이름" — 0.22.0 개발자가 parts.chevron 에 넣던 모양의 토글(aria-checked 를 문자열로, onClick 만) */
    if (value.startsWith("$toggle:")) { const [, on, name] = value.split(":"); return h(S1.S1Toggle, { "aria-checked": on === "true" ? "true" : "false", "aria-label": name, onClick: () => rec(name, "click") }); }
    return value;
  }
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, revive(v)]));
  return value;
}

/* ── 마운트 도구 ─────────────────────────────────────── */
let root = null;
let hostSet = null;
let stage = null;
function Host({ name, initial }) {
  const [props, setProps] = useState(initial);
  hostSet = setProps;
  const C = ALL[name];
  if (!C) throw new Error(`없는 부품: ${name}`);
  return h(C, revive(props));
}

const SCENARIOS = {};
function ScenarioHost({ scenario, options }) {
  const C = SCENARIOS[scenario];
  return h(C, options || {});
}

function freshStage() {
  if (root) { try { root.unmount(); } catch (e) { rec("unmount-error", String(e)); } root = null; }
  stage?.remove();
  stage = document.createElement("div");
  stage.id = "stage";
  stage.style.cssText = "padding:16px;display:inline-block;min-width:200px";
  document.body.appendChild(stage);
  return stage;
}

function element({ name, props = {}, scenario, options }) {
  return scenario ? h(ScenarioHost, { scenario, options }) : h(Host, { name, initial: props });
}

window.__s1 = {
  catalog,
  ev,
  refs,
  clearEvents() { ev.length = 0; return true; },
  /** 붙이기. strict=true 면 StrictMode. hydrate=true 면 renderToString 결과를 먼저 깔고 hydrateRoot. */
  mount(spec) {
    const { strict = true, hydrate = false } = spec;
    const container = freshStage();
    const tree = strict ? h(StrictMode, null, element(spec)) : element(spec);
    if (hydrate) {
      container.innerHTML = renderToString(tree);
      root = hydrateRoot(container, tree, { onRecoverableError: (error) => rec("recoverable-error", String(error && error.message || error)) });
    } else {
      root = createRoot(container);
      root.render(tree);
    }
    return true;
  },
  set(props) { hostSet?.(props); return true; },
  merge(props) { hostSet?.((old) => ({ ...old, ...props })); return true; },
  unmount() { if (root) { root.unmount(); root = null; } return true; },
  ssr(spec) { try { return { ok: true, html: renderToString(element(spec)) }; } catch (e) { return { ok: false, error: String(e && e.message || e) }; } },
  ctl: {}
};

/* ── 실제 React 상태로 쓰는 시나리오 ─────────────────── */
const ctl = window.__s1.ctl;

SCENARIOS.controlledInput = function ControlledInput() {
  const [value, setValue] = useState("가나");
  ctl.input = { get: () => value, set: setValue };
  return h(S1.S1Input, { value, onChange: (e) => { rec("input:onChange", e.target.value); setValue(e.target.value); }, onClear: (e) => rec("input:onClear", e) });
};

SCENARIOS.controlledCheckbox = function ControlledCheckbox() {
  const [checked, setChecked] = useState(false);
  ctl.checkbox = { get: () => checked, set: setChecked };
  return h(S1.S1Checkbox, { checked, onChange: (e) => { rec("checkbox:onChange", e.target.checked); setChecked(e.target.checked); } });
};

SCENARIOS.controlledChip = function ControlledChip() {
  const [selected, setSelected] = useState(false);
  ctl.chip = { get: () => selected, set: setSelected };
  return h(S1.S1Chip, { selected, onSelectedChange: (next) => { rec("chip:onSelectedChange", next); setSelected(next); }, onChange: (e) => rec("chip:onChange", e) });
};

SCENARIOS.lockedChip = function LockedChip() {
  /* 제어형인데 부모가 값을 안 바꾼다 — 눌러도 모양이 바뀌면 안 된다 */
  return h(S1.S1Chip, { selected: false, onSelectedChange: (next) => rec("lockedChip:onSelectedChange", next) });
};

SCENARIOS.uncontrolledChip = function UncontrolledChip() {
  return h(S1.S1Chip, { defaultSelected: true, onSelectedChange: (next) => rec("uchip:onSelectedChange", next), onChange: (e) => rec("uchip:onChange", e) });
};

SCENARIOS.chipGroupState = function ChipGroupState() {
  const [picked, setPicked] = useState(0);
  ctl.chipGroup = { get: () => picked, set: setPicked };
  return h("div", { "data-audit-group": "state", style: { display: "flex", gap: 8 } },
    ["전체", "진행", "완료"].map((label, i) => h(S1.S1Chip, { key: label, parts: { label }, "data-value": label, selected: picked === i, onSelectedChange: (on) => { rec("chipGroupState:onSelectedChange", { i, on }); if (on) setPicked(i); } })));
};

SCENARIOS.chipGroupAuto = function ChipGroupAuto() {
  return h("div", { "data-s1-select": "single", "data-audit-group": "auto", style: { display: "flex", gap: 8 } },
    ["전체", "진행", "완료"].map((label, i) => h(S1.S1Chip, { key: label, parts: { label }, "data-value": label, defaultSelected: i === 0, onChange: (e) => rec("chipGroupAuto:onChange", e) })));
};

SCENARIOS.sheet = function Sheet({ initialOpen = false, wireClose = true }) {
  const [open, setOpen] = useState(initialOpen);
  ctl.sheet = { get: () => open, set: setOpen };
  return h("div", null,
    h("button", { type: "button", id: "sheet-opener", onClick: () => setOpen(true) }, "시트 열기"),
    h(S1.S1BottomSheet, { open, onOpen: (e) => rec("sheet:onOpen", e), onClose: (e) => { rec("sheet:onClose", e); if (wireClose) setOpen(false); } }));
};

SCENARIOS.sheetOptions = function SheetOptions() {
  return h("div", { "data-s1-select": "single", "data-audit-group": "sheet-options", style: { width: 360 } },
    ["가", "나", "다"].map((label, i) => h(S1.S1BottomSheetOption, { key: label, variant: "text", parts: { label }, "data-value": label, defaultSelected: i === 0, onChange: (e) => rec("sheetOption:onChange", e) })));
};

SCENARIOS.modalOpenProp = function ModalOpenProp() {
  const [open, setOpen] = useState(false);
  ctl.modal = { get: () => open, set: setOpen };
  return h(S1.S1Modal, { open, onOpen: (e) => rec("modal:onOpen", e), onClose: (e) => { rec("modal:onClose", e); setOpen(false); } });
};

SCENARIOS.modalDeclarative = function ModalDeclarative() {
  /* README 에는 없지만 배포본 런타임이 아는 길: data-s1-open="<창 id>" */
  return h("div", null,
    h("button", { type: "button", id: "modal-opener", "data-s1-open": "audit-modal" }, "창 열기"),
    h(S1.S1Modal, { id: "audit-modal", onOpen: (e) => rec("modal:onOpen", e), onClose: (e) => rec("modal:onClose", e) }));
};

SCENARIOS.bottomNav = function BottomNav({ block = false }) {
  return h("div", { role: "tablist", "data-audit-group": "nav", style: { display: "flex", width: 375 } },
    ["home", "search", "notification", "settings"].map((variant, i) => h(S1.S1MobileBottomNav, {
      key: variant, variant, defaultSelected: i === 0,
      onBeforechange: (e) => { rec("nav:onBeforechange", e); if (block) e.preventDefault(); },
      onChange: (e) => rec("nav:onChange", e)
    })));
};

SCENARIOS.form = function FormCase() {
  return h("form", { id: "audit-form", onSubmit: (e) => { e.preventDefault(); rec("form:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1Input, { name: "nm", defaultValue: "홍길동" }),
    h(S1.S1Checkbox, { name: "agree", value: "yes", defaultChecked: true }),
    h(S1.S1Radio, { name: "pick", value: "a", defaultChecked: true }),
    h(S1.S1Select, { name: "city" }),
    h(S1.S1TimePicker, { name: "time" }),
    h(S1.S1DatePicker, { name: "day" }),
    h("button", { type: "submit", id: "audit-submit" }, "보내기"));
};

/* 여러 줄 입력 — 비제어(defaultValue)·제어(value) 를 각각. 그리다 오류가 나도 시험대 전체가 죽지 않게 작은 경계로 감싼다. */
class Boundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { rec("boundary:error", String(error && error.message || error)); }
  render() { return this.state.error ? h("p", { "data-audit-crash": "1" }, `오류: ${this.state.error.message}`) : this.props.children; }
}
SCENARIOS.textareaDefault = function TextareaDefault() {
  return h(Boundary, null, h("form", { id: "ta-form", onSubmit: (e) => { e.preventDefault(); rec("ta:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1Textarea, { name: "memo", defaultValue: "메모" }),
    h("button", { type: "submit", id: "ta-submit" }, "보내기")));
};
SCENARIOS.textareaControlled = function TextareaControlled() {
  const [value, setValue] = useState("처음");
  ctl.textarea = { get: () => value, set: setValue };
  return h(Boundary, null, h(S1.S1Textarea, { value, onChange: (e) => { rec("ta:onChange", e.target.value); setValue(e.target.value); } }));
};

SCENARIOS.gnbComposed = function GnbComposed() {
  /* 개발자가 할 법한 조합: S1Gnb 아래에 S1GnbSubMenu 를 두고, 메뉴가 가리키는 id 를 직접 붙인다 */
  return h("div", null,
    h(S1.S1Gnb, { onOpen: (e) => rec("gnb:onOpen", e), onClose: (e) => rec("gnb:onClose", e) }),
    h(S1.S1GnbSubMenu, { id: "gnb-sub-menu-a-service" }));
};

SCENARIOS.select = function SelectCase() {
  const [options, setOptions] = useState(["서울", "부산", "제주"]);
  const [label, setLabel] = useState(undefined);
  ctl.select = { setOptions, setLabel };
  return h(S1.S1Select, { options, parts: label ? { value: label } : undefined, onChange: (e) => rec("select:onChange", e), onOpen: (e) => rec("select:onOpen", e), onClose: (e) => rec("select:onClose", e) });
};

/* 0.22.0 쓰는 법 그대로: 옛 항목 모양({ optionLabel, attrs })과 parts.value — 새 prop 을 쓰지 않는다(react-legacy.mjs). */
SCENARIOS.legacySelect = function LegacySelectCase() {
  const [label, setLabel] = useState("도시 선택");
  ctl.legacySelect = { setLabel };
  const options = ["서울", "부산", "제주"].map((optionLabel, i) => ({ optionLabel, attrs: { "data-value": ["seoul", "busan", "jeju"][i] } }));
  return h(S1.S1Select, { options, parts: { value: label }, onChange: (e) => rec("legacySelect:onChange", e) });
};

SCENARIOS.dropdown = function DropdownCase() {
  return h(S1.S1Dropdown, { options: ["가", "나", "다"], onChange: (e) => rec("dropdown:onChange", e) });
};

SCENARIOS.pagination = function PaginationCase() {
  const [pages, setPages] = useState(undefined);
  ctl.pagination = { setPages };
  return h(S1.S1Pagination, { pages, onChange: (e) => rec("pagination:onChange(prop)", e) });
};

SCENARIOS.paginationStrings = function PaginationStrings() {
  return h(S1.S1Pagination, { pages: ["1", "2", "3"] });
};

SCENARIOS.table = function TableCase() {
  const [rows, setRows] = useState([["김하늘", "디자인", 3], ["박바다", "개발", 5]]);
  ctl.table = { setRows };
  return h(S1.S1Table, { headerCells: ["이름", "부서", "수량"], rows, onSelectionchange: (e) => rec("table:onSelectionchange", e) });
};

SCENARIOS.datePicker = function DatePickerCase({ breakName = "pc" }) {
  return h(S1.S1DatePicker, { breakName, defaultValue: "2026-10-01", onChange: (e) => rec("date:onChange", e), onOpen: (e) => rec("date:onOpen", e), onClose: (e) => rec("date:onClose", e) });
};

SCENARIOS.timePicker = function TimePickerCase({ breakName = "pc" }) {
  return h(S1.S1TimePicker, { breakName, defaultValue: "09:30", onChange: (e) => rec("time:onChange", e), onOpen: (e) => rec("time:onOpen", e), onClose: (e) => rec("time:onClose", e) });
};

SCENARIOS.gnb = function GnbCase() {
  return h(S1.S1Gnb, { onOpen: (e) => rec("gnb:onOpen", e), onClose: (e) => rec("gnb:onClose", e) });
};

SCENARIOS.refAndClass = function RefAndClass({ name }) {
  const ref = useRef(null);
  const [, force] = useState(0);
  useEffect(() => {
    window.__s1.refProbe = { isElement: ref.current instanceof Element, component: ref.current?.getAttribute?.("data-s1-component") ?? null, className: ref.current?.className ?? null };
    force(1);
  }, []);
  return h(ALL[name], { ref, className: "audit-mine", "data-audit-root": "1" });
};

SCENARIOS.chipWithRef = function ChipWithRef() {
  const ref = useRef(null);
  return h(S1.S1Chip, { ref, onChange: (e) => rec("refChip:onChange", e) });
};

/* ══ 새 길 — value/defaultValue · open/defaultOpen/onOpenChange · 데이터 목록 · name ══════════════════
   위쪽 시나리오는 옛 방식(options 글자 목록 · onChange 이벤트 · 방치된 우회로)을 그대로 두어 "옛 코드가 계속 된다" 를 본다.
   아래는 새 방식이다. */

const OPEN_LOG = (label) => ({
  onOpen: (e) => rec(`${label}:onOpen`, e),
  onClose: (e) => rec(`${label}:onClose`, e),
  onOpenChange: (next, detail) => rec(`${label}:onOpenChange`, { next, reason: detail?.reason ?? null })
});

SCENARIOS.modalState = function ModalState() {
  const [open, setOpen] = useState(false);
  ctl.modal = { get: () => open, set: setOpen };
  return h(S1.S1Modal, {
    open, title: "삭제할까요?", message: "되돌릴 수 없습니다", cancelLabel: "그만두기", confirmLabel: "지우기",
    ...OPEN_LOG("modal"),
    onOpenChange: (next, detail) => { rec("modal:onOpenChange", { next, reason: detail?.reason ?? null }); setOpen(next); },
    onConfirm: () => rec("modal:onConfirm", 1), onCancel: () => rec("modal:onCancel", 1)
  });
};

SCENARIOS.modalDefaultOpen = function ModalDefaultOpen() {
  return h(S1.S1Modal, { defaultOpen: true, title: "처음부터 열림", ...OPEN_LOG("modal") }, h("p", { "data-audit-el": "본문" }, "내가 만든 본문"));
};

SCENARIOS.modalContentState = function ModalContentState() {
  const [open, setOpen] = useState(false);
  ctl.modalContent = { get: () => open, set: setOpen };
  return h(S1.S1ModalContent, {
    open, title: "내용 창", confirmLabel: "저장", cancelLabel: "닫기",
    onOpenChange: (next, detail) => { rec("modalContent:onOpenChange", { next, reason: detail?.reason ?? null }); setOpen(next); },
    onOpen: (e) => rec("modalContent:onOpen", e), onClose: (e) => rec("modalContent:onClose", e)
  }, h("div", { "data-audit-el": "내용" }, "내가 만든 내용"));
};

SCENARIOS.sheetState = function SheetState() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState("보통");
  ctl.sheetState = { get: () => open, set: setOpen, size: () => size, setSize };
  return h("div", null,
    h("button", { type: "button", id: "sheet-opener", onClick: () => setOpen(true) }, "시트 열기"),
    h(S1.S1BottomSheet, {
      open, title: "글자 크기", options: ["작게", { value: "보통", label: "보통" }, { value: 3, label: "크게" }], value: size,
      onOpen: (e) => rec("sheetState:onOpen", e), onClose: (e) => rec("sheetState:onClose", e),
      onOpenChange: (next, detail) => { rec("sheetState:onOpenChange", { next, reason: detail?.reason ?? null }); setOpen(next); },
      onValueChange: (value) => { rec("sheetState:onValueChange", value); setSize(value); }
    }));
};

SCENARIOS.selectValue = function SelectValue() {
  const [value, setValue] = useState("busan");
  const [open, setOpen] = useState(undefined);
  ctl.selectValue = { get: () => value, set: setValue, setOpen };
  return h("form", { id: "sel-form", onSubmit: (e) => { e.preventDefault(); rec("sel:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1Select, {
      name: "city", placeholder: "도시 선택", open, value,
      options: [{ value: "seoul", label: "서울" }, { value: "busan", label: "부산" }, { value: 3, label: "제주" }],
      onValueChange: (v) => { rec("select:onValueChange", v); setValue(v); },
      onChange: (e) => rec("select:onChange", e),
      onOpen: (e) => rec("select:onOpen", e), onClose: (e) => rec("select:onClose", e),
      onOpenChange: (next) => { rec("select:onOpenChange", next); if (open !== undefined) setOpen(next); }
    }),
    h("button", { type: "submit", id: "sel-submit" }, "보내기"));
};

SCENARIOS.selectUncontrolled = function SelectUncontrolled() {
  return h(S1.S1Select, { defaultValue: "b", options: [{ value: "a", label: "에이" }, { value: "b", label: "비" }], onValueChange: (v) => rec("selectU:onValueChange", v) });
};

SCENARIOS.dropdownValue = function DropdownValue() {
  const [value, setValue] = useState("past");
  ctl.dropdownValue = { get: () => value, set: setValue };
  return h(S1.S1Dropdown, { options: [{ value: "latest", label: "최신순" }, { value: "popular", label: "인기순" }, { value: "past", label: "과거순" }], value, onValueChange: (v) => { rec("dropdown:onValueChange", v); setValue(v); } });
};

SCENARIOS.filterChipValue = function FilterChipValue() {
  const [value, setValue] = useState("name");
  ctl.filterChipValue = { get: () => value, set: setValue };
  return h("form", { id: "fc-form", onSubmit: (e) => { e.preventDefault(); rec("fc:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1FilterChip, { name: "sort", title: "정렬", options: [{ value: "latest", label: "최신순" }, { value: "name", label: "이름순" }], value, onValueChange: (v) => { rec("filterChip:onValueChange", v); setValue(v); } }),
    h("button", { type: "submit", id: "fc-submit" }, "보내기"));
};

SCENARIOS.multiToggleValue = function MultiToggleValue() {
  const [value, setValue] = useState("b");
  ctl.multiToggle = { get: () => value, set: setValue };
  return h("form", { id: "mt-form", onSubmit: (e) => { e.preventDefault(); rec("mt:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1MultiToggle, { name: "align", cells: [{ value: "a", label: "왼쪽" }, { value: "b", label: "가운데" }, { value: "c", label: "오른쪽", disabled: true }], value, onValueChange: (v) => { rec("multiToggle:onValueChange", v); setValue(v); }, onChange: (e) => rec("multiToggle:onChange", e) }),
    h("button", { type: "submit", id: "mt-submit" }, "보내기"));
};

SCENARIOS.tabValue = function TabValue() {
  const [value, setValue] = useState("two");
  ctl.tab = { get: () => value, set: setValue };
  return h(S1.S1Tab, { tabs: [{ value: "one", label: "하나", panel: "첫 내용" }, { value: "two", label: "둘", panel: "둘째 내용" }, { value: "three", label: "셋", panel: "셋째 내용" }], value, onValueChange: (v) => { rec("tab:onValueChange", v); setValue(v); }, onChange: (e) => rec("tab:onChange", e) });
};

SCENARIOS.paginationState = function PaginationState() {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(6);
  ctl.pager = { get: () => page, set: setPage, setTotal };
  return h(S1.S1Pagination, { page, totalPages: total, onPageChange: (p) => { rec("pager:onPageChange", p); setPage(p); }, onChange: (e) => rec("pager:onChange", e) });
};

SCENARIOS.tableState = function TableState() {
  const [rows, setRows] = useState([["김하늘", "디자인", 3], ["박바다", "개발", 5], ["이구름", "디자인", 2]]);
  ctl.tableRows = { setRows };
  return h(S1.S1Table, { headerCells: ["이름", "부서", "수량"], rows, onSelectionChange: (e) => rec("table:onSelectionChange", e.detail), onSelectionchange: (e) => rec("table:onSelectionchange(old)", e.detail) });
};

SCENARIOS.dateState = function DateState({ breakName = "pc" }) {
  const [value, setValue] = useState("2026-10-01");
  ctl.date = { get: () => value, set: setValue };
  return h("form", { id: "dt-form", onSubmit: (e) => { e.preventDefault(); rec("dt:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1DatePicker, { breakName, name: "day", value, onValueChange: (v) => { rec("date:onValueChange", v); setValue(v); }, ...OPEN_LOG("date") }),
    h("button", { type: "submit", id: "dt-submit" }, "보내기"));
};

SCENARIOS.dateRange = function DateRange() {
  const [value, setValue] = useState({ start: "2026-10-03", end: "2026-10-09" });
  ctl.dateRange = { get: () => value, set: setValue };
  return h(S1.S1DatePicker, { variant: "range", value, onValueChange: (v) => { rec("dateRange:onValueChange", v); setValue(v); } });
};

SCENARIOS.timeState = function TimeState({ breakName = "pc" }) {
  const [value, setValue] = useState("09:30");
  ctl.time = { get: () => value, set: setValue };
  return h("form", { id: "tm-form", onSubmit: (e) => { e.preventDefault(); rec("tm:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1TimePicker, { breakName, name: "clock", value, onValueChange: (v) => { rec("time:onValueChange", v); setValue(v); }, ...OPEN_LOG("time") }),
    h("button", { type: "submit", id: "tm-submit" }, "보내기"));
};

SCENARIOS.toggleState = function ToggleState() {
  const [checked, setChecked] = useState(false);
  ctl.toggle = { get: () => checked, set: setChecked };
  return h("form", { id: "tg-form", onSubmit: (e) => { e.preventDefault(); rec("tg:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h(S1.S1Toggle, { name: "notify", checked, onCheckedChange: (v) => { rec("toggle:onCheckedChange", v); setChecked(v); }, label: "알림" }),
    h("button", { type: "submit", id: "tg-submit" }, "보내기"));
};

SCENARIOS.chipForm = function ChipForm() {
  return h("form", { id: "chip-form", onSubmit: (e) => { e.preventDefault(); rec("chipForm:submit", Object.fromEntries(new FormData(e.currentTarget).entries())); } },
    h("div", { "data-s1-select": "single" },
      ["북문", "남문"].map((label, i) => h(S1.S1Chip, { key: label, name: "gate", value: label, defaultSelected: i === 0 }, label))),
    h("button", { type: "submit", id: "chip-submit" }, "보내기"));
};

SCENARIOS.listRows = function ListRows() {
  const [push, setPush] = useState(true);
  const [agree, setAgree] = useState(false);
  ctl.rows = { push: () => push, setPush, agree: () => agree };
  return h("div", { style: { width: 375 } },
    h(S1.S1ListRow, { variant: "nav", title: "설정", description: "환경설정" }),
    h(S1.S1ListRow, { variant: "value", title: "테마", description: "표시 방식", value: "라이트" }),
    h(S1.S1ListRow, { variant: "read", title: "버전", description: "0.23.0" }),
    h(S1.S1ListRow, { variant: "pick", title: "빠른 배송", description: "당일", name: "fast" }),
    h(S1.S1ListRow, { variant: "agree", title: "약관 동의", description: "필수", checked: agree, onCheckedChange: (v) => { rec("rows:agree", v); setAgree(v); } }),
    h(S1.S1ListRow, { variant: "switch", title: "푸시 알림", description: "새 소식", checked: push, onCheckedChange: (v) => { rec("rows:push", v); setPush(v); } }),
    h(S1.S1ListRow, { variant: "thumb", title: "사진", description: "2026-10-13" }));
};

/* 리스트 행 스위치를 폼 안에 두고 name 으로 보낸다 — 꺼진 채 시작(기본), defaultChecked 로 켠 채 시작. */
SCENARIOS.listRowForm = function ListRowForm() {
  return h("form", { id: "lr-form", onSubmit: (e) => { e.preventDefault(); rec("lr:submit", Object.fromEntries([...new FormData(e.currentTarget).entries()])); } },
    h(S1.S1ListRow, { variant: "switch", title: "기본(꺼짐)", name: "off" }),
    h(S1.S1ListRow, { variant: "switch", title: "켜진 채", name: "on", defaultChecked: true }),
    h("button", { type: "submit", id: "lr-submit" }, "보내기"));
};

SCENARIOS.inputTypes = function InputTypes() {
  return h("div", null,
    h(S1.S1Input, { type: "password", label: "비밀번호" }),
    h(S1.S1Input, { type: "search", label: "검색", onSearch: (e) => rec("input:onSearch", e.detail) }),
    h(S1.S1Input, { breakName: "password-mobile", label: "옛 이름" }),
    h(S1.S1Input, { breakName: "mobile", type: "search", label: "모바일 검색" }));
};

SCENARIOS.gnbMenus = function GnbMenus() {
  return h("div", { style: { position: "relative" } },
    h(S1.S1Gnb, {
      logo: "관제 시스템", langLabel: "English",
      menus: [{ label: "대시보드", current: true, href: "/dash" }, { label: "출입", columns: [{ title: "출입 관리", items: [{ label: "출입 기록", href: "/log" }, "방문 예약", { label: "현재", current: true }] }, { title: "기록", items: ["감사 로그"] }] }, "설정"],
      onOpen: (e) => rec("gnb:onOpen", e), onClose: (e) => rec("gnb:onClose", e),
      onOpenChange: (next) => rec("gnb:onOpenChange", next)
    }));
};

SCENARIOS.timeMobileSheet = function TimeMobileSheet() {
  const [open, setOpen] = useState(false);
  ctl.timeSheet = { get: () => open, set: setOpen };
  return h(S1.S1TimePicker, { breakName: "mobile", open, onOpenChange: (next) => { rec("timeSheet:onOpenChange", next); setOpen(next); }, onOpen: (e) => rec("timeSheet:onOpen", e), onClose: (e) => rec("timeSheet:onClose", e) });
};



/* 부모가 값을 안 바꾸는 제어형 — 눌러도 부품 모양이 value 로 되돌아와야 한다(진짜 제어형) */
SCENARIOS.lockedControls = function LockedControls() {
  return h("div", null,
    h(S1.S1Select, { value: "a", options: [{ value: "a", label: "에이" }, { value: "b", label: "비" }], onValueChange: (v) => rec("locked:select", v) }),
    h(S1.S1Toggle, { checked: false, onCheckedChange: (v) => rec("locked:toggle", v), label: "잠금" }),
    h(S1.S1Pagination, { page: 1, totalPages: 6, onPageChange: (p) => rec("locked:page", p) }),
    h(S1.S1MultiToggle, { value: "x", cells: [{ value: "x", label: "엑스" }, { value: "y", label: "와이" }], onValueChange: (v) => rec("locked:multi", v) }));
};


/* 새 이벤트 이름(onBeforeChange) 으로 하단 탭 이동을 막는다 */
SCENARIOS.bottomNavNewName = function BottomNavNewName() {
  return h("div", { role: "tablist", style: { display: "flex", width: 375 } },
    ["home", "search", "notification"].map((variant, i) => h(S1.S1MobileBottomNav, {
      key: variant, variant, defaultSelected: i === 0,
      onBeforeChange: (e) => { rec("navNew:onBeforeChange", e.detail?.value); if (variant === "notification") e.preventDefault(); },
      onChange: (e) => rec("navNew:onChange", e.detail?.value)
    })));
};

/* README 의 예시 코드(```jsx) — 검수기가 README 에서 꺼내 src/readme-example-N.jsx 로 써 둔다. 그대로 붙여 넣은 코드가 돌아가는지 본다. */
const readmeModules = import.meta.glob("./readme-example-*.jsx", { eager: true });
const readmeExamples = Object.keys(readmeModules).sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1])).map((key) => readmeModules[key].default);
SCENARIOS.readmeExample = function ReadmeExample({ index }) { return h(readmeExamples[index]); };
window.__s1.readmeCount = readmeExamples.length;

/* 시험대가 준비됐다는 표시 */
window.__s1ready = true;
