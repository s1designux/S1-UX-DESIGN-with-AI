/**
 * react-api.mjs — React 부품마다 "밖에서 넣는 길" 선언 (react-gen.mjs 가 읽는다)
 * --------------------------------------------------------------------------
 * 마크업은 승인 예제에서 온다. 여기에는 마크업이 아니라 다음만 적는다.
 *   · 어떤 prop 을 받나(이름 · 타입 · 설명)         → Builder.prop
 *   · 그 prop 이 마크업·동작 스크립트에 어떻게 닿나   → pre/post 코드, attrs 규칙, 이벤트 핸들러
 *   · 같은 part 이름이 여러 곳일 때 슬롯 이름 나누기  → renames
 *   · 목록 항목은 { value, label, disabled? } 한 모양 → lists[part].item (kit.js 의 s1Item 설정)
 * 정본에 없는 variant · 상태 · 토큰 · 아이콘은 만들지 않는다. 여기서 늘어나는 것은 "넘기는 길"뿐이다.
 */

import { attributeValue, isTextOnly, literal, partOf, textOf } from "./react.mjs";

/* 이벤트 이름 → React 낱말 대소문자(옛 이름은 낱말 첫 글자만 대문자라 그대로 함께 받는다) */
export const EVENT_WORDS = { beforechange: "BeforeChange", selectionchange: "SelectionChange" };

/* 이벤트마다 event.detail 모양 — 타입 정의가 any 가 되지 않게 모두 적는다. */
export const EVENT_DETAIL = {
  "s1:bottom-sheet-option:beforechange": "{ value: string; label: string; selected: boolean; option: HTMLElement }",
  "s1:bottom-sheet-option:change": "{ value: string; label: string; selected: boolean; option: HTMLElement }",
  "s1:bottom-sheet:open": "S1OpenDetail",
  "s1:bottom-sheet:close": "S1OpenDetail",
  "s1:chip:beforechange": "{ selected: boolean; value: string; group: boolean }",
  "s1:chip:change": "{ selected: boolean; value: string; group: boolean }",
  "s1:date-picker:open": "Record<string, never>",
  "s1:date-picker:close": "Record<string, never>",
  "s1:date-picker:change": "{ mode: \"single\"; value: string | null } | { mode: \"range\"; start: string | null; end: string | null }",
  "s1:dropdown:change": "S1DropdownDetail",
  "s1:expandable-card:change": "{ open: boolean }",
  "s1:filter-chip:change": "{ value: string; option: HTMLElement }",
  "s1:filter-chip:open": "Record<string, never>",
  "s1:filter-chip:close": "Record<string, never>",
  "s1:gnb:open": "{ trigger: HTMLElement; panel: HTMLElement }",
  "s1:gnb:close": "{ trigger: HTMLElement; panel: HTMLElement }",
  "s1:input:clear": "{ value: \"\" }",
  "s1:input:search": "{ value: string }",
  "s1:lnb:collapse": "{ collapsed: boolean }",
  "s1:lnb:toggle": "{ trigger: HTMLElement; expanded: boolean }",
  "s1:mobile-bottom-nav:beforechange": "{ value: string; selected: boolean; tab: HTMLElement; previous: HTMLElement | null }",
  "s1:mobile-bottom-nav:change": "{ value: string; selected: boolean; tab: HTMLElement; previous: HTMLElement | null }",
  "s1:modal-content:open": "S1OpenDetail",
  "s1:modal-content:close": "S1OpenDetail",
  "s1:modal:open": "S1OpenDetail",
  "s1:modal:close": "S1OpenDetail",
  "s1:multi-toggle:change": "{ index: number; value: string; cell: HTMLElement }",
  "s1:pagination:change": "{ page: number; totalPages: number }",
  "s1:select:change": "{ value: string; option: HTMLElement }",
  "s1:select:open": "Record<string, never>",
  "s1:select:close": "Record<string, never>",
  "s1:tab:change": "{ tab: HTMLElement; value: string }",
  "s1:table:selectionchange": "{ selectedCount: number; totalCount: number }",
  "s1:time-picker:open": "Record<string, never>",
  "s1:time-picker:close": "Record<string, never>",
  "s1:time-picker:change": "{ value: string; hour: string; minute: string; ampm: string | null; type: \"12h\" | \"24h\" }",
  "s1:toggle:change": "{ checked: boolean }"
};

/* ── Builder — 부품 한 개의 prop · 코드 조각 모음 ───────────────────────── */

const CONTROL_ORDER = ["value", "defaultValue", "onChange", "onInput", "onBlur", "onFocus", "name", "placeholder", "disabled", "required", "readOnly"];

export class Builder {
  constructor(context) {
    this.c = context;
    this.props = new Map();          // name → { ts, doc, def, deprecated, hidden }
    this.reactHooks = [];
    this.kitNames = [];
    this.preLines = [];
    this.postLines = [];
    this.direct = new Map();         // 슬롯 이름 → 식(parts 에 합쳐지는 직접 prop)
    this.moduleImports = [];
    this.moduleConsts = [];
    this.runtimeModules = [];        // 동작 스크립트가 없어도 가져올 배포본 모듈 [{ names, id }]
    this.needsRoot = false;
    this.formKeyExpr = null;
    this.slotNames = [];
    this.assertLines = [];
    this.info = {};                  // README · 타입 생성용 사실
  }

  prop(name, ts, doc, options = {}) {
    this.props.set(name, { name, ts, doc, ...options });
    return this;
  }

  hook(...names) { for (const name of names) if (!this.reactHooks.includes(name)) this.reactHooks.push(name); return this; }
  kit(...names) { for (const name of names) if (!this.kitNames.includes(name)) this.kitNames.push(name); return this; }
  pre(code) { this.preLines.push(code); return this; }
  post(code) { this.postLines.push(code); return this; }
  slotProp(slot, expression) { this.direct.set(slot, expression); return this; }
  moduleImport(line) { this.moduleImports.push(line); return this; }
  moduleConst(code) { this.moduleConsts.push(code); return this; }

  /** 목록 prop(Emitter 가 찾아낸 반복 목록). */
  listProp(name, config = {}) {
    if (!this.props.has(name)) this.prop(name, config.ts ?? "readonly S1Entry[]", config.doc ?? "목록 데이터 — 주지 않으면 예제 내용이 그려진다.", { list: true });
  }

  nestedListProps() {}

  /** 변형 · 크기 · 화면 기준 · parts */
  standard() {
    const { variants, sizes, hasBreaks, breakKeys, structural, forms, spec } = this.c;
    const variantProp = structural ? (spec.structural.prop ?? "variant") : "variant";
    const variantValues = structural ? forms.map((form) => form.key) : variants;
    if (structural) {
      this.prop(variantProp, variantValues.map((value) => JSON.stringify(value)).join(" | "), `승인된 종류: ${variantValues.join(" · ")}`);
      this.assertLines.push(`assertAllowed(${literal(variantProp)}, ${variantProp}, VARIANTS);`);
      this.formKeyExpr = `(${variantProp} ?? DEFAULT_VARIANT)`;
    } else if (variants.length > 1) {
      this.prop("variant", variants.map((value) => JSON.stringify(value)).join(" | "), `승인된 변형: ${variants.join(" · ")}`);
      this.assertLines.push("assertAllowed(\"variant\", variant, VARIANTS);");
    }
    if (sizes.length > 1) {
      this.prop("size", sizes.map((value) => JSON.stringify(value)).join(" | "), `승인된 크기: ${sizes.join(" · ")}`);
      this.assertLines.push("assertAllowed(\"size\", size, SIZES);");
    }
    if (hasBreaks) {
      this.prop("breakName", breakKeys.map((value) => JSON.stringify(value)).join(" | "), `화면 기준: ${breakKeys.join(" · ")} (기본 ${breakKeys[0]})`, { def: "DEFAULT_BREAK" });
      this.assertLines.push("assertAllowed(\"breakName\", breakName, BREAKS);");
      this.formKeyExpr = "breakName";
    }
    this.prop("parts", "S1Parts", "슬롯 이름별 내용·속성. 예: parts={{ label: \"확인\" }}");
    this.info.variantProp = variantProp;
  }

  /** 입력 요소로 그대로 넘어가는 값(value · defaultValue · onChange · name …) */
  control() {
    const { firstControl, isCheckLike } = this.c;
    if (!firstControl) return;
    const element = firstControl.tag === "textarea" ? "HTMLTextAreaElement" : "HTMLInputElement";
    const names = [...CONTROL_ORDER, ...(isCheckLike ? ["checked", "defaultChecked"] : []), "inputRef"];
    const types = isCheckLike
      ? {
        value: ["string", "폼에 실릴 값"], defaultValue: ["string", null, true], onChange: [`ChangeEventHandler<${element}>`, "바뀔 때(event.target.checked)"],
        onInput: [`FormEventHandler<${element}>`, null], onBlur: [`FocusEventHandler<${element}>`, null], onFocus: [`FocusEventHandler<${element}>`, null],
        name: ["string", "폼 이름 — 주면 폼 전송에 값이 실린다"], placeholder: ["string", null, true], disabled: ["boolean", null], required: ["boolean", null], readOnly: ["boolean", null, true],
        checked: ["boolean", "켜져 있나(제어형)"], defaultChecked: ["boolean", "처음 켜져 있나(비제어형)"], inputRef: [`Ref<${element}>`, "입력 요소에 직접 닿는 ref"]
      }
      : {
        value: ["string | number", "값(제어형)"], defaultValue: ["string | number", "처음 값(비제어형)"], onChange: [`ChangeEventHandler<${element}>`, "바뀔 때(event.target.value)"],
        onInput: [`FormEventHandler<${element}>`, null], onBlur: [`FocusEventHandler<${element}>`, null], onFocus: [`FocusEventHandler<${element}>`, null],
        name: ["string", "폼 이름 — 주면 폼 전송에 값이 실린다"], placeholder: ["string", null], disabled: ["boolean", null], required: ["boolean", null], readOnly: ["boolean", null],
        inputRef: [`Ref<${element}>`, "입력 요소에 직접 닿는 ref"]
      };
    for (const name of names) {
      const [ts, doc, hidden] = types[name];
      this.prop(name, ts, doc ?? "", { hidden: Boolean(hidden) });
    }
    this.controlNames = names;
    this.pre([
      "/* 입력 요소로 그대로 넘어가는 값 — 정의되지 않은 것은 넘기지 않는다(비제어 상태 유지). */",
      "const controlProps = {};",
      ...names.filter((name) => name !== "inputRef").map((name) => `if (${name} !== undefined) controlProps.${name} = ${name};`),
      "if (inputRef !== undefined) controlProps.ref = inputRef;"
    ].join("\n  "));
  }

  /** 동작 스크립트 · 이벤트: handlers 는 { 이벤트이름: "코드" } */
  runtime(handlers, deps = [], runtimeExpr = null) {
    const { jsRequired, id, forms } = this.c;
    this.needsRoot = true;
    this.hook("useRef");
    this.kit("useMergedRef");
    const depList = [...deps];
    if (forms.length > 1 && this.formKeyExpr && !depList.includes("formKey")) depList.push("formKey");
    const entries = Object.entries(handlers).map(([name, code]) => `    ${literal(name)}: ${code}`);
    this.kit("useRuntime");
    this.postLines.push(`const apiRef = useRuntime(rootRef, ${runtimeExpr ?? (jsRequired ? "{ init, destroy }" : "null")}, {\n${entries.join(",\n")}\n  }, [${depList.join(", ")}]);`);
    this.hasApi = true;
    this.info.id = id;
  }

  /** 이벤트 prop 들 — 새 이름과 옛 이름을 함께 받는다. */
  eventProps(skip = []) {
    const out = [];
    for (const event of this.c.events) {
      if (skip.includes(event.eventName)) continue;
      const detail = EVENT_DETAIL[event.eventName];
      if (!detail) throw new Error(`${this.c.id}: ${event.eventName} 의 detail 타입이 react-api.mjs EVENT_DETAIL 에 없습니다.`);
      const ts = `(event: S1Event<${detail}>) => void`;
      const label = event.eventName;
      this.prop(event.canonical, ts, `${label}`);
      if (event.legacy !== event.canonical) this.prop(event.legacy, ts, `${label} (옛 이름 — ${event.canonical} 을 쓰세요)`, { deprecated: true });
      out.push(event);
    }
    return out;
  }

  /** 이벤트 한 개를 받는 핸들러 식: 새 이름 · 옛 이름 모두 부른다. */
  passthrough(event) {
    const names = event.legacy === event.canonical ? [event.canonical] : [event.canonical, event.legacy];
    return names.length === 1 ? `(event) => ${names[0]}?.(event)` : `(event) => { ${names[0]}?.(event); ${names[1]}?.(event); }`;
  }

  destructure() {
    const names = [];
    for (const [name, def] of this.props) names.push(def.def ? `${name} = ${def.def.default ?? def.def}` : name);
    /* 슬롯으로 가는 직접 prop 이 props 에 없을 수 있다 — 등록된 것만 꺼낸다 */
    if (this.c.hasChildrenSlot && !this.props.has("children")) names.push("children");
    names.push("className", "style", "...rest");
    return names.join(", ");
  }

  hookLines() {
    const lines = [];
    if (this.needsRoot) {
      lines.push("  const rootRef = useRef(null);", "  const rootAttr = useMergedRef(rootRef, forwardedRef);");
    } else {
      lines.push("  const rootAttr = forwardedRef;");
    }
    for (const line of this.assertLines) lines.push(`  ${line}`);
    if (this.c.forms.length > 1) lines.push(`  const formKey = ${this.formKeyExpr ?? "breakName"};`);
    for (const line of this.preLines) lines.push(`  ${line}`);
    const direct = [...this.direct.entries()].map(([slot, expression]) => `${camelSlot(slot)}: ${expression}`);
    lines.push(`  const partScope = scopeOf(${direct.length ? `mergeParts(parts, { ${direct.join(", ")} })` : "parts"});`);
    for (const line of this.postLines) lines.push(`  ${line}`);
    return lines.join("\n");
  }

  runtimeImports(id, jsRequired) {
    return jsRequired ? `import { init, destroy } from "../../components/${id}.js";` : "";
  }

  facts() {
    const { c } = this;
    return {
      id: c.id,
      componentName: c.componentName,
      rootTag: c.rootTag,
      props: [...this.props.values()],
      partNames: this.slotNames,
      variants: c.variants,
      sizes: c.sizes,
      sizeBreaks: c.manifest.breaks ?? null,
      breaks: c.breakKeys,
      hasBreaks: c.hasBreaks,
      structural: c.structural ? c.spec.structural : null,
      info: this.info,
      jsRequired: c.jsRequired,
      hasChildren: this.props.has("children"),
      lists: [...this.props.values()].filter((p) => p.list).map((p) => p.name)
    };
  }
}

const camelSlot = (slot) => slot.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());

/* ── 기본 컨트롤러 ───────────────────────────────────────────────────── */

export function defaultController(b, c) {
  b.standard();
  b.control();
  const events = b.eventProps();
  const handlers = Object.fromEntries(events.map((event) => [event.eventName, b.passthrough(event)]));
  if (c.jsRequired || events.length) b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
  const spec = c.spec;
  if (spec.label) labelProps(b, spec.label);
  if (b.c.hasChildrenSlot && !b.props.has("children")) b.prop("children", "ReactNode", "앱이 소유하는 내용 — 주면 예제 내용을 대신한다.");
}

/** 글자 칸 하나를 label · children 으로 받는다 — 예: 버튼 라벨. */
export function labelProps(b, { slot = "label", children = true, doc = "글자 — parts 로도 줄 수 있다" } = {}) {
  b.prop("label", "ReactNode", doc);
  if (children) b.prop("children", "ReactNode", `${doc} (label 과 같다)`);
  b.slotProp(slot, children ? "children !== undefined ? children : label" : "label");
}

