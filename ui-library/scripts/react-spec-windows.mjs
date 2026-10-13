/**
 * react-spec-windows.mjs — 모달 · 모달 콘텐츠 · 바텀시트 · 접힘 카드의 "밖에서 넣는 길" 선언
 *   열림은 open / defaultOpen / onOpenChange, 닫힌 이유는 detail.reason(confirm · cancel · escape · close-button · backdrop …).
 */

import { attributeValue, literal, partOf } from "./react.mjs";
import { defaultController } from "./react-api.mjs";

export const WINDOWS = {};

const closeReason = (value) => (node) => attributeValue(node, "data-s1-close") === value;

/** 창(모달 · 시트)의 열림 배선. 열림 값은 처음 한 번만 마크업(hidden)에 쓰고, 그 뒤는 배포본 api 가 연다. */
function dialogController(b, c, o) {
  const { id } = c;
  b.standard();
  b.prop("open", "boolean", "열려 있나(제어형) — 바뀌면 부품을 열거나 닫는다(스크롤 잠금 · 초점 · Esc 가 함께 따라온다). 닫힘은 onOpenChange(false) 로 알려 주니 상태를 맞춰 주세요.");
  b.prop("defaultOpen", "boolean", `처음 열려 있나(비제어형, 기본 ${o.defaultOpen})`);
  b.prop("onOpenChange", "(open: boolean, detail: S1OpenDetail) => void", "열리거나(true) 닫힐(false) 때 — detail.reason 이 닫힌 이유. open 을 바꿔 정한 것은 되알리지 않는다");
  const events = b.eventProps();
  b.hook("useRef");
  b.kit("useControlledOpen");
  b.pre(`const initialOpen = useRef(open ?? defaultOpen ?? ${o.defaultOpen}).current;
  const syncing = useRef(false);`);
  const handlers = {
    [`s1:${id}:open`]: "(event) => { onOpen?.(event); if (!syncing.current) onOpenChange?.(true, event.detail); }",
    [`s1:${id}:close`]: `(event) => {
      onClose?.(event);
      ${o.buttons ? `const reason = event.detail?.reason;
      if (reason === "confirm") onConfirm?.(event);
      else if (reason === "cancel") onCancel?.(event);` : ""}
      if (!syncing.current) onOpenChange?.(false, event.detail);
    }`,
    ...(o.extraHandlers ?? {})
  };
  void events;
  b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
  b.post("useControlledOpen(apiRef, open, syncing);");
  if (o.buttons) {
    b.prop("confirmLabel", "ReactNode", "확인 단추 글자 (기본 \"확인\")");
    b.prop("cancelLabel", "ReactNode", "취소 단추 글자 (기본 \"취소\")");
    b.prop("onConfirm", "(event: S1Event<S1OpenDetail>) => void", "확인 단추로 닫힐 때");
    b.prop("onCancel", "(event: S1Event<S1OpenDetail>) => void", "취소 단추로 닫힐 때");
    b.slotProp("confirmLabel", "confirmLabel");
    b.slotProp("cancelLabel", "cancelLabel");
  }
}

const MODAL_RULES = {
  renames: [
    { part: "label", within: closeReason("cancel"), as: "cancel-label" },
    { part: "label", within: closeReason("confirm"), as: "confirm-label" }
  ],
  attrs: [{ root: true, set: { hidden: "initialOpen ? undefined : true" } }]
};

WINDOWS["modal"] = {
  ...MODAL_RULES,
  childrenInto: "body",
  controller(b, c) {
    dialogController(b, c, { defaultOpen: "false", buttons: true });
    b.prop("title", "ReactNode", "제목 글자");
    b.prop("message", "ReactNode", "본문 글자(안내 문장). 본문을 직접 구성하려면 children 을 쓰세요");
    b.prop("children", "ReactNode", "본문 영역 전체 — 주면 message 자리를 대신한다");
    b.slotProp("title", "title");
    b.slotProp("message", "message");
  }
};

WINDOWS["modal-content"] = {
  ...MODAL_RULES,
  childrenInto: "content",
  controller(b, c) {
    dialogController(b, c, { defaultOpen: "false", buttons: true });
    b.prop("title", "ReactNode", "제목 글자");
    b.prop("children", "ReactNode", "내용 영역 — 주면 예제의 견본 글자를 대신한다");
    b.slotProp("title", "title");
  }
};

WINDOWS["bottom-sheet"] = {
  renames: [{ part: "label", within: closeReason("apply"), as: "apply-label" }],
  attrs: [
    { root: true, set: { hidden: "initialOpen ? undefined : true" } },
    { part: "sheet-body", pieces: ['{...(selectable ? { "data-s1-select": "single", ...(closeOnSelect ? { "data-s1-close-on-select": "" } : {}) } : {})}'] }
  ],
  contentOverride: { "sheet-body": "{children !== undefined ? children : sheetBodyContent}" },
  controller(b, c) {
    const bodyNodes = [];
    const walk = (node) => {
      if (!node || node.type !== "element") return;
      if (partOf(node) === "sheet-body") bodyNodes.push(node);
      for (const child of node.children) walk(child);
    };
    walk(c.forms[0].tree);
    const options = (bodyNodes[0]?.children ?? []).filter((child) => child.type === "element" && attributeValue(child, "data-s1-component") === "bottom-sheet-option").map((option) => {
      const label = option.children.find((child) => child.type === "element" && partOf(child) === "label");
      return { label: label ? label.children.filter((child) => child.type === "text").map((child) => child.value).join(" ") : "", selected: attributeValue(option, "data-state") === "selected" };
    });
    b.moduleConst(`const DEFAULT_SHEET_OPTIONS = ${JSON.stringify(options)};`);
    b.moduleImport('import S1BottomSheetOption from "./bottom-sheet-option.jsx";');
    b.moduleImport('import { init as initSheetOption } from "../../components/bottom-sheet-option.js";');
    b.hook("isValidElement", "useRef");
    b.kit("useApply", "useRerender", "itemValue", "originalValue");
    b.pre("const rerender = useRerender();");
    dialogController(b, c, {
      defaultOpen: "true",
      buttons: false,
      extraHandlers: {
        "s1:bottom-sheet-option:change": "(event) => { if (onValueChange) onValueChange(originalValue(sheetItems, event.detail?.value), event.detail); rerender(); }"
      }
    });
    b.prop("options", "readonly S1SheetOptionInput[]", "고르는 줄 목록 — { value, label, disabled? } 또는 글자. 주면 하나만 고르는 시트가 된다. 주지 않으면 예제 내용");
    b.prop("value", "string | number", "고른 값(제어형) — options 의 value");
    b.prop("defaultValue", "string | number", "처음 고른 값(비제어형)");
    b.prop("onValueChange", "(value: string | number, detail: S1Event<{ value: string; label: string; selected: boolean; option: HTMLElement }>[\"detail\"]) => void", "줄을 고르면 — 준 value 그대로 돌아온다");
    b.prop("closeOnSelect", "boolean", "고르면 시트를 닫나 (기본 true)", { def: "true" });
    b.prop("title", "ReactNode", "시트 제목 글자");
    b.prop("applyLabel", "ReactNode", "아래 단추 글자 (기본 \"적용\")");
    b.prop("children", "ReactNode", "시트 본문 전체 — 주면 options 를 대신한다");
    b.slotProp("sheetTitle", "title");
    b.slotProp("applyLabel", "applyLabel");
    b.pre(`const sheetItems = options ?? DEFAULT_SHEET_OPTIONS;
  const selectable = options !== undefined || value !== undefined || defaultValue !== undefined;
  const initialSheetValue = useRef(value !== undefined ? value : defaultValue).current;
  const sheetSelected = initialSheetValue !== undefined && initialSheetValue !== null ? String(initialSheetValue) : undefined;
  const sheetBodyContent = sheetItems.map((entry, index) => {
    const item = typeof entry === "object" && entry !== null && !isValidElement(entry) ? entry : { label: entry, value: entry };
    const entryValue = itemValue(item, index);
    const on = sheetSelected !== undefined ? entryValue === sheetSelected : Boolean(item.selected);
    return <S1BottomSheetOption key={entryValue + ":" + index} variant="text" value={item.value !== undefined ? String(item.value) : undefined} label={item.label} disabled={item.disabled} defaultSelected={on} />;
  });`);
    b.post(`useApply(apiRef, () => {
    const wanted = value === undefined || value === null ? "" : String(value);
    const first = rootRef.current?.querySelector('[data-s1-component="bottom-sheet-option"]');
    const optionApi = first ? initSheetOption(first) : null;
    if (wanted !== "" && optionApi && optionApi.value !== wanted) optionApi.setValue(wanted);
  });`);
  }
};

/* ── 접힘 카드 ── */
WINDOWS["expandable-card"] = {
  childrenInto: "panel",
  renames: ["title", "subtitle", "body", "note", "caption"].map((part) => ({ part, within: (node) => partOf(node) === "panel", as: `panel-${part}` })),
  attrs: [
    { part: "header", set: { "aria-expanded": "String(initialOpen)" } },
    { part: "panel-wrap", set: { "data-open": 'initialOpen ? "true" : undefined' } }
  ],
  controller(b, c) {
    b.standard();
    b.prop("open", "boolean", "펼쳐져 있나(제어형)");
    b.prop("defaultOpen", "boolean", "처음 펼쳐져 있나(비제어형)");
    b.prop("onOpenChange", "(open: boolean) => void", "펼쳐지거나(true) 접힐(false) 때 — open 을 바꿔 정한 것은 되알리지 않는다");
    for (const name of ["title", "subtitle", "body", "note", "caption"]) {
      b.prop(name, "ReactNode", `머리줄 ${name} 글자`);
      b.slotProp(name, name);
    }
    b.prop("children", "ReactNode", "펼쳐지는 내용 — 주면 예제 견본을 대신한다");
    const events = b.eventProps();
    b.hook("useRef");
    b.kit("useApply", "useRerender");
    b.pre(`${"const initialOpen = useRef(open ?? defaultOpen ?? false).current;"}
  const syncing = useRef(false);
  const rerender = useRerender();`);
    b.runtime({
      "s1:expandable-card:change": `(event) => {
      ${events.length ? "onChange?.(event);" : ""}
      if (!syncing.current) onOpenChange?.(Boolean(event.detail?.open));
      rerender();
    }`
    });
    b.post(`useApply(apiRef, (api) => {
    if (open === undefined || api.open === open) return;
    syncing.current = true;
    try { api.set(open); } finally { syncing.current = false; }
  });`);
  }
};

void defaultController;
void literal;
