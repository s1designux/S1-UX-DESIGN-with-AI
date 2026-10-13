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
const exportNameOf = new Map(Object.entries(S1).filter(([, v]) => typeof v === "function").map(([k, v]) => [v, k]));
const catalog = Object.entries(modules).map(([file, mod]) => ({
  file: file.split("/").pop(),
  name: exportNameOf.get(mod.default) || null,
  breaks: mod.BREAKS || [],
  variants: mod.VARIANTS || [],
  sizes: mod.SIZES || [],
  parts: mod.PARTS || []
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
  return h(S1.S1DatePicker, { breakName, value: "2026-10-01", defaultValue: "2026-10-01", onChange: (e) => rec("date:onChange", e), onOpen: (e) => rec("date:onOpen", e), onClose: (e) => rec("date:onClose", e) });
};

SCENARIOS.timePicker = function TimePickerCase({ breakName = "pc" }) {
  return h(S1.S1TimePicker, { breakName, value: "09:30", onChange: (e) => rec("time:onChange", e), onOpen: (e) => rec("time:onOpen", e), onClose: (e) => rec("time:onClose", e) });
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

/* 시험대가 준비됐다는 표시 */
window.__s1ready = true;
