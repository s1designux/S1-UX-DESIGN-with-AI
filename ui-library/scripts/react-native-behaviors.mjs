/**
 * react-native-behaviors.mjs — 부품마다 "어떤 동작 종류인가"와 그 동작의 처음 상태를 승인 예제에서 읽는다.
 * --------------------------------------------------------------------------
 * 동작 자체(눌렀을 때 무엇이 바뀌나)는 src/react-native/behaviors.js 의 controller 가 한다.
 * 여기서는 부품 → 종류 연결과, 예제 마크업이 정한 처음 상태(고른 탭·열린 카드·체크된 줄 …)만 뽑는다 — 사람이 적지 않는다.
 * 동작 계약의 원문은 platform/behavior.json(registry/components/component-behavior.pc.json)이다.
 */

import { attributeValue, partOf } from "./react.mjs";

const elementsOf = (node) => node.children.filter((child) => child.type === "element");
const attr = (node, name) => attributeValue(node, name);

function* walk(node) {
  for (const child of elementsOf(node)) { yield child; yield* walk(child); }
}

const withPart = (root, part) => [...walk(root)].filter((node) => partOf(node) === part);
const withComponent = (root, id) => [...walk(root)].filter((node) => attr(node, "data-s1-component") === id);

/** 같은 part 항목 중 속성 값이 true 인 것의 순번(없으면 0) */
function initialIndex(root, part, name, truthy = "true") {
  const items = withPart(root, part);
  const index = items.findIndex((item) => attr(item, name) === truthy);
  return index < 0 ? 0 : index;
}

/** 안에 든 드롭다운에서 처음부터 골라져 있는 옵션의 값(없으면 null) */
function initialOption(instance) {
  const hit = withPart(instance, "option").find((option) => attr(option, "aria-selected") === "true");
  return hit ? (attr(hit, "data-value") ?? null) : null;
}

/**
 * @returns null | { kind, config, props: { 외부 prop 이름 → controller 입력 이름 }, extra: [외부로 받는 prop 이름…] }
 *   props     controller 가 읽는 이름(value·defaultValue·onChange …) ← 부품이 받는 이름
 */
export function behaviorFor(id, { instance, rootAttributes }) {
  switch (id) {
    case "chip":
      return {
        kind: "toggle",
        config: { attr: "aria-pressed", initial: rootAttributes["aria-pressed"] === "true" },
        props: { value: "selected", defaultValue: "defaultSelected", onChange: "onSelectedChange", onBeforechange: "onBeforechange", onAfterchange: "onChange" }
      };
    /* 선택형 — river 결정 2026-10-13 「전부 부품이 알아서」. 웹 런타임이 없는 RN 은 같은 규칙을 여기서 지킨다:
       selected 를 주면 제어형(눌러도 값이 바뀌기 전엔 모양이 안 바뀌고 onSelectedChange 만 부른다), 안 주면 부품이 알아서 바꾸고 알린다.
       하나만 고르는 묶음은 화면이 각 항목의 selected 를 정한다(웹의 data-s1-select 에 해당). */
    case "mobile-bottom-nav":
      return {
        kind: "toggle",
        config: { attr: "aria-selected", initial: rootAttributes["aria-selected"] === "true", also: { "aria-current": ["page", undefined] } },
        props: { value: "selected", defaultValue: "defaultSelected", onChange: "onSelectedChange", onBeforechange: "onBeforechange", onAfterchange: "onChange" }
      };
    case "bottom-sheet-option":
      /* 웹과 같다: 고르는 줄은 Text·Radio 뿐이다. List 는 선택 모양이 정본에 없고(list:selected 없음) Checkbox 는 여러 개 고르는 줄이다. */
      if (!["text", "radio"].includes(rootAttributes["data-type"])) return null;
      return {
        kind: "toggle",
        config: { attr: "data-state", values: ["selected", "default"], initial: rootAttributes["data-state"] === "selected", also: { "aria-selected": ["true", "false"] } },
        props: { value: "selected", defaultValue: "defaultSelected", onChange: "onSelectedChange", onBeforechange: "onBeforechange", onAfterchange: "onChange" }
      };
    case "toggle":
      return {
        kind: "toggle",
        config: { attr: "aria-checked", initial: rootAttributes["aria-checked"] === "true" },
        props: { value: "checked", defaultValue: "defaultChecked", onChange: "onCheckedChange" }
      };
    case "tab":
      return {
        kind: "select-one",
        config: { itemPart: "tab", attr: "aria-selected", panelRole: "tabpanel", initial: initialIndex(instance, "tab", "aria-selected") },
        props: { value: "value", defaultValue: "defaultValue", onChange: "onChange" }
      };
    case "multi-toggle":
      return {
        kind: "select-one",
        config: { itemPart: "cell", attr: "aria-checked", initial: initialIndex(instance, "cell", "aria-checked") },
        props: { value: "value", defaultValue: "defaultValue", onChange: "onChange" }
      };
    case "dropdown": {
      const type = rootAttributes["data-type"] === "checkbox" ? "checkbox" : "text";
      const options = withPart(instance, "option");
      let initial;
      if (type === "text") {
        const hit = options.find((option) => attr(option, "aria-selected") === "true");
        initial = hit ? (attr(hit, "data-value") ?? options.indexOf(hit)) : undefined;
      } else {
        initial = options.filter((option) => attr(option, "data-select-all") !== "true" && attr(option, "aria-checked") === "true")
          .map((option) => attr(option, "data-value"));
      }
      return {
        kind: "dropdown",
        config: { type, initial, values: options.filter((option) => attr(option, "data-select-all") !== "true").map((option) => attr(option, "data-value")).filter((value) => value !== undefined) },
        props: { value: "value", defaultValue: "defaultValue", onChange: "onChange" }
      };
    }
    case "pagination": {
      const pages = withPart(instance, "page");
      const numbers = pages.map((page) => Number(attr(page, "data-page"))).filter(Number.isFinite);
      const current = pages.find((page) => attr(page, "aria-current") === "page");
      return {
        kind: "pagination",
        config: { initial: current ? Number(attr(current, "data-page")) : 1, total: numbers.length ? Math.max(...numbers) : 1, block: Math.min(6, numbers.length || 6) },
        props: { page: "page", defaultPage: "defaultPage", totalPages: "totalPages", onChange: "onChange" }
      };
    }
    case "expandable-card": {
      const header = withPart(instance, "header")[0];
      return {
        kind: "disclosure",
        config: { headerPart: "header", targetPart: "panel-wrap", targetAttr: "data-open", initial: header ? attr(header, "aria-expanded") === "true" : false },
        props: { open: "open", defaultOpen: "defaultOpen", onChange: "onChange" }
      };
    }
    case "lnb": {
      const opened = withPart(instance, "item").filter((item) => attr(item, "aria-expanded") === "true").map((item) => attr(item, "aria-controls")).filter(Boolean);
      return {
        kind: "side-menu",
        config: { collapsed: rootAttributes["data-state"] === "collapsed", openIds: opened },
        props: { collapsed: "collapsed", defaultCollapsed: "defaultCollapsed", onCollapse: "onCollapse", onToggle: "onToggle" }
      };
    }
    case "gnb":
      return { kind: "top-bar", config: {}, props: { openId: "openId", defaultOpenId: "defaultOpenId", onOpen: "onOpen", onClose: "onClose" } };
    case "modal":
    case "modal-content":
      return { kind: "overlay", config: { closeParts: ["close"] }, props: { onClose: "onClose", onConfirm: "onConfirm", onCancel: "onCancel" } };
    case "bottom-sheet":
      return { kind: "overlay", config: { closeParts: ["sheet-close", "sheet-backdrop"] }, props: { onClose: "onClose", onConfirm: "onConfirm", onCancel: "onCancel" } };
    case "select":
      return { kind: "popup", config: { filledAttr: "data-filled", initialValue: initialOption(instance) }, props: { open: "open", defaultOpen: "defaultOpen", value: "value", defaultValue: "defaultValue", options: "options", onChange: "onChange", onOpen: "onOpen", onClose: "onClose" } };
    case "filter-chip":
      return { kind: "popup", config: { filledAttr: "data-complete", initialValue: initialOption(instance) }, props: { open: "open", defaultOpen: "defaultOpen", value: "value", defaultValue: "defaultValue", options: "options", onChange: "onChange", onOpen: "onOpen", onClose: "onClose" } };
    case "input": {
      const mode = withPart(instance, "action").some((action) => attr(action, "data-action") === "search") ? "search"
        : withPart(instance, "action").some((action) => attr(action, "data-action") === "password") ? "password" : "base";
      return {
        kind: "input",
        config: { mode },
        props: { value: "value", defaultValue: "defaultValue", onChangeText: "onChangeText", onFocus: "onFocus", onBlur: "onBlur", readOnly: "readOnly", inputRef: "inputRef", onClear: "onClear", onSearch: "onSearch" }
      };
    }
    case "table":
      return { kind: "table", config: {}, props: { selection: "selection", defaultSelection: "defaultSelection", onSelectionChange: "onSelectionChange" } };
    case "list-row": {
      const type = rootAttributes["data-type"];
      if (!["pick", "agree", "switch"].includes(type)) return { kind: "row-control", config: { initial: false, rootPress: false }, props: { checked: "checked", defaultChecked: "defaultChecked", onCheckedChange: "onCheckedChange", onOpen: "onOpen" } };
      const checkbox = withComponent(instance, "checkbox")[0];
      const toggle = withComponent(instance, "toggle")[0];
      const initial = checkbox
        ? [...walk(checkbox)].some((node) => node.tag === "input" && node.attributes.some(([name]) => name === "checked"))
        : toggle ? attr(toggle, "aria-checked") === "true" : false;
      return { kind: "row-control", config: { initial, rootPress: type === "pick" }, props: { checked: "checked", defaultChecked: "defaultChecked", onCheckedChange: "onCheckedChange", onOpen: "onOpen" } };
    }
    case "date-picker":
      return {
        kind: "date-picker",
        config: { mode: rootAttributes["data-mode"] === "range" ? "range" : "single", mobile: rootAttributes["data-break"] === "mobile" },
        props: { variant: "variant", open: "open", value: "value", defaultValue: "defaultValue", disabledDates: "disabledDates", placeholder: "placeholder", today: "today", onChange: "onChange", onOpen: "onOpen", onClose: "onClose" }
      };
    case "time-picker": {
      const step = Number.parseInt(rootAttributes["data-minute-step"], 10);
      return {
        kind: "time-picker",
        config: {
          type: rootAttributes["data-type"] === "12h" ? "12h" : "24h",
          minuteStep: Number.isFinite(step) && step >= 1 && step <= 59 ? step : 1,
          mobile: rootAttributes["data-break"] === "mobile",
          mobileContent: rootAttributes["data-mobile-content"] === "date-time" ? "date-time" : "time-only"
        },
        props: { open: "open", onChange: "onChange", onOpen: "onOpen", onClose: "onClose" }
      };
    }
    default:
      return null;
  }
}
