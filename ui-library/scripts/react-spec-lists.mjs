/**
 * react-spec-lists.mjs — 목록을 받는 부품 · 값을 쥐는 부품의 "밖에서 넣는 길" 선언
 *   select · dropdown · filter-chip · multi-toggle · tab · table · pagination · date-picker · time-picker
 *
 * 목록 항목은 모두 { value, label, disabled? } 한 모양이다(글자 하나는 value=label). 옛 모양({ optionLabel, attrs } 등)도 그대로 받는다.
 * 값은 value / defaultValue, 바뀐 것은 onChange(이벤트) 와 onValueChange(값) 둘 다 받는다.
 */

import { attributeValue, literal, partOf } from "./react.mjs";
import { defaultController, labelProps } from "./react-api.mjs";
import { frozen } from "./react-spec-basic.mjs";

export const LISTS = {};

const OPTION_TS = "readonly S1OptionInput[]";
const VALUE_TS = "string | number";

/** 선택 목록(select · dropdown · filter-chip)이 공유하는 선언. */
function optionController(b, c, o) {
  const { id } = c;
  b.standard();
  b.control?.();
  b.prop("value", VALUE_TS, "고른 값(제어형) — options 의 value. 문자열이나 숫자");
  b.prop("defaultValue", VALUE_TS, "처음 고른 값(비제어형)");
  b.prop("onValueChange", `(value: ${VALUE_TS}, detail: S1Event<${o.detailType}>["detail"]) => void`, "고른 값이 바뀔 때 — 준 value 그대로 돌아온다");
  const events = b.eventProps();
  if (o.name) b.prop("name", "string", "폼 이름 — 주면 고른 값이 폼 전송에 실린다 (data-name)");
  if (o.disabled) b.prop("disabled", "boolean", "누를 수 없음");
  if (o.placeholder) b.prop("placeholder", "string", "고른 것이 없을 때 보이는 글자");
  if (o.popover) {
    b.prop("open", "boolean", "목록이 열려 있나(제어형) — onOpenChange 와 함께 쓴다");
    b.prop("onOpenChange", "(open: boolean) => void", "목록이 열리거나(true) 닫힐(false) 때 — open 을 바꿔 정한 것은 되알리지 않는다");
  }
  b.hook("useRef");
  b.kit("useApply", "useRerender", "itemValue", "findLabel", "originalValue");
  if (o.popover) b.kit("useControlledOpen");
  const changeEvent = `s1:${id}:change`;
  b.pre(`const initialValue = useRef(value !== undefined ? value : defaultValue).current;
  const chosen = useRef(initialValue);
  const currentValue = value !== undefined ? value : chosen.current;
  const optionList = options ?? null;
  const firstValue = optionList && optionList.length ? itemValue(optionList[0], 0) : undefined;
  const itemCtx = { selected: initialValue !== undefined && initialValue !== null ? String(initialValue) : ${o.selectFirst ? "firstValue" : "undefined"} };
  const initialLabel = findLabel(optionList, itemCtx.selected);
  const rerender = useRerender();
  ${o.popover ? "const syncing = useRef(false);" : ""}`);
  if (o.display) b.slotProp("value", o.placeholder ? "initialLabel !== undefined ? initialLabel : placeholder" : "initialLabel");
  const handlers = Object.fromEntries(events.map((event) => [event.eventName, b.passthrough(event)]));
  handlers[changeEvent] = `(event) => {
      const original = originalValue(optionList, event.detail?.value);
      chosen.current = original;
      ${events.some((event) => event.eventName === changeEvent) ? "onChange?.(event);" : ""}
      onValueChange?.(original, event.detail);
      rerender();
    }`;
  if (o.popover) {
    handlers[`s1:${id}:open`] = "(event) => { onOpen?.(event); if (!syncing.current) onOpenChange?.(true); }";
    handlers[`s1:${id}:close`] = "(event) => { onClose?.(event); if (!syncing.current) onOpenChange?.(false); }";
  }
  b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
  b.post(`useApply(apiRef, (api) => {
    const wanted = currentValue === undefined || currentValue === null ? "" : String(currentValue);
    if (api.value !== wanted) api.setValue(wanted);
  });`);
  if (o.popover) b.post('useControlledOpen(apiRef, open, syncing, { isOpen: "open", open: "openPanel", close: "closePanel" });');
}

LISTS["select"] = {
  lists: { option: { prop: "options", item: "OPTION_ITEM", ts: OPTION_TS, doc: "고를 수 있는 목록 — { value, label } 또는 글자. 주지 않으면 예제 내용이 그려진다." } },
  attrs: [
    { root: true, pieces: ["data-name={name}", "data-value={initialValue !== undefined && initialValue !== null ? String(initialValue) : undefined}", "data-placeholder={initialLabel !== undefined ? (placeholder ?? PLACEHOLDER) : placeholder}"] },
    { part: "trigger", pieces: ["disabled={disabled}"] }
  ],
  controller(b, c) {
    const placeholder = c.forms[0].tree && findText(c.forms[0].tree, "value");
    b.moduleConst(`const PLACEHOLDER = ${literal(placeholder ?? "선택")};
const OPTION_ITEM = { slot: "optionLabel", selected: "aria-selected", roving: true };`);
    optionController(b, c, { detailType: "{ value: string; option: HTMLElement }", name: true, disabled: true, placeholder: true, popover: true, selectFirst: false, display: true });
  }
};

LISTS["filter-chip"] = {
  lists: { option: { prop: "options", item: "OPTION_ITEM", ts: OPTION_TS, doc: "고를 수 있는 목록 — { value, label } 또는 글자. 주지 않으면 예제 내용이 그려진다." } },
  attrs: [
    { root: true, pieces: ["data-name={name}", "data-value={initialValue !== undefined && initialValue !== null ? String(initialValue) : undefined}"] },
    { part: "trigger", pieces: ["disabled={disabled}"] }
  ],
  controller(b, c) {
    b.moduleConst('const OPTION_ITEM = { slot: "optionLabel", selected: "aria-selected", roving: true };');
    optionController(b, c, { detailType: "{ value: string; option: HTMLElement }", name: true, disabled: true, popover: true, selectFirst: true, display: true });
    b.prop("title", "ReactNode", "칩 앞의 이름 글자 (예: \"정렬\")");
    b.slotProp("title", "title");
  }
};

LISTS["dropdown"] = {
  lists: { option: { prop: "options", item: "OPTION_ITEM", ts: OPTION_TS, doc: "고를 수 있는 목록 — { value, label } 또는 글자. 주지 않으면 예제 내용이 그려진다." } },
  controller(b, c) {
    b.moduleConst('const OPTION_ITEM = { slot: "optionLabel", selected: "aria-selected", roving: true };');
    optionController(b, c, { detailType: "S1DropdownDetail", name: false, disabled: false, popover: false, selectFirst: true, display: false });
  }
};

function findText(tree, part) {
  const hit = [];
  const walk = (node) => {
    if (!node || node.type !== "element") return;
    if (partOf(node) === part) hit.push(node);
    for (const child of node.children) walk(child);
  };
  walk(tree);
  const first = hit[0];
  return first ? first.children.filter((child) => child.type === "text").map((child) => child.value).join(" ") : null;
}

/* ── 멀티 토글 · 탭: 하나만 고르는 줄 ── */

function pickController(b, c, o) {
  const { id } = c;
  b.standard();
  b.prop("value", VALUE_TS, "고른 값(제어형) — 목록의 value");
  b.prop("defaultValue", VALUE_TS, "처음 고른 값(비제어형)");
  b.prop("onValueChange", `(value: ${VALUE_TS}, detail: ${o.detailType}) => void`, "고른 값이 바뀔 때 — 준 value 그대로 돌아온다");
  const events = b.eventProps();
  b.hook("useRef", "useState");
  b.kit("useApply", "useRerender", "itemValue", "originalValue");
  const changeEvent = `s1:${id}:change`;
  b.pre(`const initialValue = useRef(value !== undefined ? value : defaultValue).current;
  const itemList = ${o.listProp} ?? null;
  const firstValue = itemList && itemList.length ? itemValue(itemList[0], 0) : undefined;
  const itemCtx = { selected: initialValue !== undefined && initialValue !== null ? String(initialValue) : firstValue${o.ctxExtra ?? ""} };
  const [picked, setPicked] = useState(itemCtx.selected);
  const currentValue = value !== undefined ? String(value) : picked;
  const syncing = useRef(false);
  const rerender = useRerender();`);
  if (o.beforeHandlers) o.beforeHandlers(b);
  const handlers = Object.fromEntries(events.filter((event) => event.eventName !== changeEvent).map((event) => [event.eventName, b.passthrough(event)]));
  const rawChange = events.find((event) => event.eventName === changeEvent);
  handlers[changeEvent] = `(event) => {
      if (syncing.current) return;
      const raw = event.detail?.value;
      setPicked(String(raw));
      ${rawChange ? "onChange?.(event); " + (rawChange.legacy !== rawChange.canonical ? "" : "") : ""}
      onValueChange?.(originalValue(itemList, raw), event.detail);
      rerender();
    }`;
  b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
  b.post(`useApply(apiRef, (api) => {
    const wanted = currentValue === undefined || currentValue === null ? "" : String(currentValue);
    const current = ${o.currentOf};
    if (wanted === "" || current === wanted) return;
    const target = ${o.findTarget};
    if (!target) return;
    syncing.current = true;
    try { api.select(target); } finally { syncing.current = false; }
  });`);
}

LISTS["multi-toggle"] = {
  lists: { cell: { prop: "cells", item: "CELL_ITEM", ts: "readonly S1CellInput[]", doc: "칸 목록 — { value, label, disabled? } 또는 글자. 주지 않으면 예제 내용이 그려진다." } },
  rootEnd: (indent) => `${indent}{name ? <input type="hidden" name={name} value={currentValue ?? ""} /> : null}`,
  controller(b, c) {
    b.moduleConst('const CELL_ITEM = { slot: "content", selected: "aria-checked", roving: true, disabled: "aria-disabled" };');
    pickController(b, c, {
      listProp: "cells",
      detailType: "S1Event<{ index: number; value: string; cell: HTMLElement }>[\"detail\"]",
      currentOf: "api.selected?.dataset.value ?? \"\"",
      findTarget: "rootRef.current?.querySelector(`[data-s1-part=\"cell\"][data-value=\"${CSS.escape(wanted)}\"]`)"
    });
    b.prop("name", "string", "폼 이름 — 주면 고른 칸의 값이 폼 전송에 실린다");
  }
};

LISTS["tab"] = {
  extraEvents: ["s1:tab:change"],
  lists: { tab: { prop: "tabs", item: "TAB_ITEM", ts: "readonly S1TabInput[]", doc: "탭 목록 — { value, label, panel? } 또는 글자. panel 을 주면 그 탭의 내용이 함께 그려진다. 주지 않으면 예제 내용." } },
  panelsExpr: "tabPanels",
  controller(b, c) {
    b.moduleConst(`const TAB_ITEM = { slot: "content", selected: "aria-selected", roving: true, extra: (item, index, ctx) => (ctx.hasPanels ? { "aria-controls": \`\${ctx.uid}-tabpanel-\${index}\` } : {}) };`);
    pickController(b, c, {
      listProp: "tabs",
      detailType: "{ tab: HTMLElement; value: string }",
      ctxExtra: "",
      currentOf: "api.selected?.dataset.value ?? \"\"",
      findTarget: "rootRef.current?.querySelector(`[data-s1-part=\"tab\"][data-value=\"${CSS.escape(wanted)}\"]`)",
      beforeHandlers: (builder) => {
        builder.pre(`const hasPanels = Boolean(itemList && itemList.some((item) => item && typeof item === "object" && "panel" in item));
  itemCtx.uid = uid;
  itemCtx.hasPanels = hasPanels;
  const tabPanels = hasPanels ? itemList.map((item, index) => (
    <div key={index} id={\`\${uid}-tabpanel-\${index}\`} role="tabpanel" hidden={itemValue(item, index) !== String(itemCtx.selected)}>{item && typeof item === "object" ? item.panel : null}</div>
  )) : null;`);
      }
    });
    b.prop("children", "ReactNode", "탭 내용(패널)을 직접 둘 때 — 주면 예제 패널을 대신한다. 탭 항목의 panel 로 주는 쪽이 간단하다.");
  }
};
