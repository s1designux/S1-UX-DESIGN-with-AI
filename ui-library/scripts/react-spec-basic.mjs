/**
 * react-spec-basic.mjs — 글자 한 칸 · 고르기 · 입력 · 스위치 부품의 "밖에서 넣는 길" 선언
 */

import { attributeValue, literal } from "./react.mjs";
import { defaultController, labelProps } from "./react-api.mjs";

/* 처음 값만 쓰는 상수 — 동작 스크립트가 그 뒤의 값을 직접 바꾸므로 React 가 같은 속성을 계속 바꾸지 않게 한다. */
export const frozen = (name, expression) => `const ${name} = useRef(${expression}).current;`;

/* ── 고르기 껍데기(chip · bottom-sheet-option · mobile-bottom-nav) ───── */

function selectableController(b, c, extra = {}) {
  b.standard();
  const prefix = `s1:${c.id}`;
  b.prop("selected", "boolean", "켜져 있나(제어형) — 주면 부품은 이 값이 바뀔 때만 모양이 바뀐다. 눌러도 onSelectedChange 로 알리기만 한다.");
  b.prop("defaultSelected", "boolean", "처음 켜져 있나(비제어형)");
  b.prop("onSelectedChange", "(selected: boolean) => void", "눌려서 켜지거나(true) 꺼질(false) 때 — 제어형이면 바뀌기 전에, 비제어형이면 바뀐 뒤에 불린다");
  b.eventProps();
  b.hook("useRef", "useState");
  b.kit("useApply");
  b.pre(frozen("initialSelected", `selected ?? defaultSelected ?? ${extra.initialDefault ?? "false"}`));
  const handlers = {
    [`${prefix}:beforechange`]: "(event) => { if (selected !== undefined) { event.preventDefault(); onSelectedChange?.(event.detail?.selected ?? true); } onBeforeChange?.(event); onBeforechange?.(event); }",
    [`${prefix}:change`]: `(event) => { ${extra.onChange ?? ""}if (selected === undefined) onSelectedChange?.(event.detail?.selected ?? true); onChange?.(event); }`
  };
  b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
  b.post("const seen = useRef(false);");
  b.post(`useApply(apiRef, (api) => {
    if (selected !== undefined) api.setSelected(selected);
    else if (defaultSelected !== undefined && !seen.current) api.setSelected(defaultSelected);
    seen.current = true;
  }, [selected, defaultSelected${c.hasBreaks ? ", breakName" : ""}]);`);
}

const LABEL_ONLY = (b, c) => { defaultController(b, c); labelProps(b, { slot: "label" }); };

export const BASIC = {};

BASIC["button"] = { controller: LABEL_ONLY };
BASIC["text-button"] = { controller: LABEL_ONLY };
BASIC["assist-button"] = { controller: LABEL_ONLY };
BASIC["divider"] = {};
BASIC["checkbox"] = { controller: LABEL_ONLY };
BASIC["radio"] = { controller: LABEL_ONLY };

BASIC["data-tag"] = {
  rootText: "label",
  controller(b, c) {
    defaultController(b, c);
    b.prop("label", "ReactNode", "꼬리표 글자 — children 으로도 줄 수 있다");
    b.prop("children", "ReactNode", "꼬리표 글자 (label 과 같다)");
    b.slotProp("label", "label");
  }
};

/* ── 칩 ── */
BASIC["chip"] = {
  attrs: [{ root: true, pieces: ["data-value={value}"] }],
  rootEnd: (indent) => `${indent}{name ? <input type="hidden" name={name} value={value ?? (typeof labelText === "string" ? labelText : "")} disabled={!isOn} /> : null}`,
  controller(b, c) {
    selectableController(b, c, { onChange: "setOn(Boolean(event.detail?.selected)); " });
    labelProps(b, { slot: "label" });
    b.prop("value", "string", "이 칩의 값 — 칩 묶음에서 어느 칩인지 가리키고, name 을 주면 폼에 실린다 (data-value)");
    b.prop("name", "string", "폼 이름 — 주면 켜진 칩의 값이 폼 전송에 실린다");
    b.pre("const [on, setOn] = useState(initialSelected);");
    b.pre("const isOn = selected !== undefined ? selected : on;");
    b.pre("const labelText = children !== undefined ? children : label;");
  }
};

BASIC["bottom-sheet-option"] = {
  attrs: [
    { root: true, set: { "data-state": 'initialSelected ? "selected" : disabled ? "disabled" : "default"' }, pieces: ["data-value={value}"] }
  ],
  rootEnd: (indent) => `${indent}{initialSelected ? <span data-s1-part="check" aria-hidden="true" /> : null}`,
  controller(b, c) {
    selectableController(b, c);
    labelProps(b, { slot: "label" });
    b.prop("value", "string", "이 줄의 값 — 고른 값으로 돌아온다 (data-value)");
    b.prop("disabled", "boolean", "누를 수 없는 줄");
  }
};

BASIC["mobile-bottom-nav"] = {
  attrs: [{ root: true, set: { "aria-selected": "String(initialSelected)" } }, { root: true, pieces: ["data-value={value}"] }],
  controller(b, c) {
    selectableController(b, c, { initialDefault: "true" });
    labelProps(b, { slot: "label" });
    b.prop("value", "string", "이 탭의 값 (data-value) — 안 주면 아이콘 이름이 값이 된다");
  }
};

/* ── 토글(스위치) ── */
BASIC["toggle"] = {
  attrs: [
    { root: true, set: { "aria-checked": "String(initialChecked)", "aria-label": 'label ?? "알림 받기"' }, pieces: ["disabled={disabled}"] }
  ],
  rootEnd: (indent) => `${indent}{name ? <input type="hidden" name={name} value={value ?? "on"} disabled={!isOn} /> : null}`,
  controller(b, c) {
    b.standard();
    b.prop("checked", "boolean", "켜져 있나(제어형)");
    b.prop("defaultChecked", "boolean", "처음 켜져 있나(비제어형)");
    b.prop("onCheckedChange", "(checked: boolean) => void", "눌러서 켜지거나(true) 꺼질(false) 때");
    b.prop("onChange", "(event: S1Event<{ checked: boolean }>) => void", "s1:toggle:change (event.detail.checked)");
    b.prop("name", "string", "폼 이름 — 주면 켜져 있을 때 값이 폼 전송에 실린다");
    b.prop("value", "string", "폼에 실릴 값 (기본 \"on\")");
    b.prop("disabled", "boolean", "누를 수 없음");
    b.prop("label", "string", "스크린리더가 읽는 이름 (aria-label, 기본 \"알림 받기\")");
    b.hook("useRef", "useState");
    b.kit("useApply", "useRerender");
    b.pre(frozen("initialChecked", "checked ?? defaultChecked ?? false"));
    b.pre("const [on, setOn] = useState(initialChecked);");
    b.pre("const isOn = checked !== undefined ? checked : on;");
    b.pre("const syncing = useRef(false);");
    b.pre("const rerender = useRerender();");
    b.runtime({
      "s1:toggle:change": "(event) => { setOn(Boolean(event.detail?.checked)); if (!syncing.current) onCheckedChange?.(Boolean(event.detail?.checked)); onChange?.(event); rerender(); }"
    });
    b.post(`useApply(apiRef, (api) => {
    if (checked === undefined || api.checked === checked) return;
    syncing.current = true;
    try { api.set(checked); } finally { syncing.current = false; }
  });`);
  }
};

/* ── 입력 · 여러 줄 입력 ── */

const INPUT_FORMS = `{ password: ["pc", "password"], "password-mobile": ["mobile", "password"], search: ["pc", "search"], "search-mobile": ["mobile", "search"] }`;

BASIC["input"] = {
  breakList: ["pc", "mobile"],
  attrs: [
    { match: (node, em) => node === em.controlNode, set: { "aria-label": (node) => `label ?? ${literal(attributeValue(node, "aria-label") ?? "")}` } }
  ],
  controller(b, c) {
    const sizes = c.sizes;
    b.prop("size", sizes.map((value) => JSON.stringify(value)).join(" | "), `승인된 크기: ${sizes.join(" · ")}`);
    b.prop("breakName", "\"pc\" | \"mobile\" | \"password\" | \"password-mobile\" | \"search\" | \"search-mobile\"", "화면 기준: pc · mobile (옛 이름 password · search · password-mobile · search-mobile 도 받는다 — type 을 쓰세요)", { def: "\"pc\"" });
    b.prop("type", "\"text\" | \"password\" | \"search\"", "입력칸 종류: text(기본) · password(보기/숨기기 버튼) · search(돋보기 버튼)", { def: "undefined" });
    b.prop("label", "string", "스크린리더가 읽는 이름 (aria-label)");
    b.prop("parts", "S1Parts", "슬롯 이름별 내용·속성. 예: parts={{ control: { attrs: { \"aria-label\": \"이름\" } } }}");
    b.assertLines.push('assertAllowed("size", size, SIZES);');
    b.assertLines.push('assertAllowed("breakName", breakName, ["pc", "mobile", ...Object.keys(LEGACY_FORMS)]);');
    b.assertLines.push('assertAllowed("type", type, ["text", "password", "search"]);');
    b.moduleConst(`const LEGACY_FORMS = ${INPUT_FORMS};
export const TYPES = ["text", "password", "search"];
/* 화면 기준(pc · mobile)과 종류(text · password · search)를 예제 파일 이름으로 합친다. 옛 이름(password-mobile 등)도 받는다. */
function inputFormKey(breakName, type) {
  const legacy = LEGACY_FORMS[breakName];
  const screen = legacy ? legacy[0] : breakName;
  const kind = legacy ? legacy[1] : (type ?? "text");
  return kind === "text" ? screen : screen === "mobile" ? \`\${kind}-mobile\` : kind;
}`);
    b.formKeyExpr = "inputFormKey(breakName, type)";
    b.control();
    const events = b.eventProps();
    b.hook("useEffect");
    b.runtime(Object.fromEntries(events.map((event) => [event.eventName, b.passthrough(event)])), ["formKey"]);
    /* 값이 바깥에서 바뀌면 지우기 버튼 보임 여부를 다시 맞춘다. */
    b.post("useEffect(() => { apiRef.current?.update?.(); }, [value]);");
    b.info.inputBreaks = true;
  }
};

BASIC["textarea"] = {
  attrs: [
    {
      match: (node, em) => node === em.controlNode,
      set: { "aria-label": (node) => `label ?? ${literal(attributeValue(node, "aria-label") ?? "")}` },
      pieces: ['{...(slot(partScope, "control").content !== undefined && value === undefined && defaultValue === undefined ? { defaultValue: slot(partScope, "control").content } : {})}']
    }
  ],
  controller(b, c) {
    defaultController(b, c);
    b.prop("label", "string", "스크린리더가 읽는 이름 (aria-label)");
  }
};
