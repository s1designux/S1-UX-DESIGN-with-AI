/**
 * platform-plans-core.mjs — 코어 부품 16종의 "무엇을 물어볼지"(검사 트리). 플랫폼 중립.
 * --------------------------------------------------------------------------
 * 값은 여기 없다. 승인 예제 마크업과 같은 모양의 요소 트리를 세우고 상태마다 CSS 를 질의할 뿐이다.
 * plan 은 {id, axes, combos, key, build} 한 벌이라 어느 플랫폼 생성기든 그대로 읽는다.
 * 화면 크기 축(manifest.breaks)은 profile 이 좁혀서 넘긴다 — platform-spec.mjs 참고.
 * (원래 kotlin-compose.mjs 안에 있던 것을 2026-10-02 에 꺼냈다. 동작은 그대로다.)
 */

import { element } from "./css-model.mjs";

const camel = (id) => id.split(/[-_ ]/).filter(Boolean).map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");

const el = (tag, attributes = {}, states = [], children = []) => element({ tag, attributes, states, children });
const hoverOnly = (isHover) => (condition) => (/^supports:/.test(condition) ? false : /hover/.test(condition) ? isHover : true);

function buttonPlan(manifest) {
  const states = ["default", "hover", "disabled"];
  const combos = [];
  /* 크기는 manifest.sizes 전부가 아니라 **쓰이는 화면의 크기**만 본다 —
     안드로이드는 모바일 한 벌이라 여기 오는 breaks 에는 mobile 만 남아 있다. */
  const sizes = manifest.breaks ? [...new Set(Object.values(manifest.breaks).flat())] : manifest.sizes;
  for (const size of sizes) {
    for (const variant of manifest.variants) {
      for (const state of states) combos.push({ size, variant, state });
    }
  }
  return {
    id: "button",
    axes: { variants: manifest.variants, sizes, states, breaks: manifest.breaks },
    combos,
    key: (combo) => `${combo.variant}|${combo.size}|${combo.state}`,
    build: (combo) => {
      const label = el("span", { "data-s1-part": "label" });
      /* "hover" 칸은 Compose 에서 `hovered || pressed` 를 함께 담는 칸이다(kotlin-components.mjs buttonKt).
         그래서 웹의 :hover 와 :active 를 **둘 다** 켜서 읽는다 — 어느 쪽이 걸리든 그 칠을 가져온다.
         2026-09-15 이후 웹 Button 은 모바일(LG)에서 :hover 를 걷어내고 :active(누름)만 남겼다.
         여기서 :hover 만 켜면 LG 칸이 통째로 Default 색이 되어 **안드로이드가 누름 표시를 잃는다**
         (독립 검증 3회차 ❌(a)-1). PC 크기는 :hover 와 :active 가 같은 토큰이라 결과가 달라지지 않는다. */
      const root = el("button", {
        "data-s1-component": "button", "data-variant": combo.variant, "data-size": combo.size, type: "button"
      }, combo.state === "hover" ? ["hover", "active"] : combo.state === "disabled" ? ["disabled"] : [], [label]);
      return { targets: { root: { node: root }, label: { node: label } }, mediaActive: hoverOnly(combo.state === "hover") };
    }
  };
}

function chipPlan(manifest) {
  const states = ["default", "hover", "selected", "disabled"];
  const sizeBreaks = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks)) {
    for (const size of sizes) sizeBreaks.push({ size, breakName });
  }
  const combos = [];
  for (const { size, breakName } of sizeBreaks) {
    for (const variant of manifest.variants) {
      for (const state of states) combos.push({ size, breakName, variant, state });
    }
  }
  return {
    id: "chip",
    axes: { variants: manifest.variants, sizeBreaks, states },
    combos,
    key: (combo) => `${combo.variant}|${combo.size}|${combo.breakName}|${combo.state}`,
    build: (combo) => {
      const label = el("span", { "data-s1-part": "label" });
      const root = el("button", {
        "data-s1-component": "chip", "data-variant": combo.variant, "data-size": combo.size,
        "data-break": combo.breakName, "aria-pressed": combo.state === "selected" ? "true" : "false", type: "button"
      }, combo.state === "hover" ? ["hover"] : combo.state === "disabled" ? ["disabled"] : [], [label]);
      return { targets: { root: { node: root }, label: { node: label } }, mediaActive: hoverOnly(combo.state === "hover") };
    }
  };
}

function controlPlan(id) {
  const states = ["default", "hover", "checked", "disabled", "disabledChecked"];
  return {
    id,
    axes: { states },
    combos: states.map((state) => ({ state })),
    key: (combo) => combo.state,
    build: (combo) => {
      const controlStates = [];
      if (combo.state === "hover") controlStates.push("hover");
      if (combo.state === "checked" || combo.state === "disabledChecked") controlStates.push("checked");
      if (combo.state === "disabled" || combo.state === "disabledChecked") controlStates.push("disabled");
      const control = el("input", { "data-s1-part": "control", type: "checkbox" }, controlStates);
      const label = el("span", { "data-s1-part": "label" });
      const root = el("div", { "data-s1-component": id }, [], [control, label]);
      return {
        targets: {
          root: { node: root },
          control: { node: control },
          indicator: { node: control, pseudoElement: "before" },
          label: { node: label }
        },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

function togglePlan() {
  const states = ["off", "on", "disabledOff", "disabledOn"];
  return {
    id: "toggle",
    axes: { states },
    combos: states.map((state) => ({ state })),
    key: (combo) => combo.state,
    build: (combo) => {
      const on = combo.state === "on" || combo.state === "disabledOn";
      const disabled = combo.state.startsWith("disabled");
      const knob = el("span", { "data-s1-part": "knob" });
      const root = el("button", {
        "data-s1-component": "toggle", role: "switch", "aria-checked": on ? "true" : "false", type: "button"
      }, disabled ? ["disabled"] : [], [knob]);
      return { targets: { root: { node: root }, knob: { node: knob } }, mediaActive: hoverOnly(false) };
    }
  };
}

function tabPlan(manifest) {
  const states = ["default", "hover", "selected"];
  const sizeBreaks = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks)) {
    for (const size of sizes) sizeBreaks.push({ size, breakName });
  }
  const combos = [];
  for (const pair of sizeBreaks) for (const state of states) combos.push({ ...pair, state });
  return {
    id: "tab",
    axes: { sizeBreaks, states },
    combos,
    key: (combo) => `${combo.size}|${combo.breakName}|${combo.state}`,
    build: (combo) => {
      const tab = el("button", {
        "data-s1-part": "tab", role: "tab", "aria-selected": combo.state === "selected" ? "true" : "false", type: "button"
      }, combo.state === "hover" ? ["hover"] : []);
      const root = el("div", {
        "data-s1-component": "tab", "data-size": combo.size, "data-break": combo.breakName, role: "tablist"
      }, [], [tab]);
      return {
        targets: {
          root: { node: root },
          baseline: { node: root, pseudoElement: "before" },
          tab: { node: tab },
          indicator: { node: tab, pseudoElement: "after" }
        },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

function selectPlan(manifest) {
  const states = ["default", "hover", "filled", "open", "disabled"];
  const sizeBreaks = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks)) {
    for (const size of sizes) sizeBreaks.push({ size, breakName });
  }
  const combos = [];
  for (const pair of sizeBreaks) for (const state of states) combos.push({ ...pair, state });
  return {
    id: "select",
    axes: { sizeBreaks, states },
    combos,
    key: (combo) => `${combo.size}|${combo.breakName}|${combo.state}`,
    build: (combo) => {
      const attributes = { "data-s1-part": "trigger", type: "button", "aria-haspopup": "listbox", "aria-expanded": combo.state === "open" ? "true" : "false" };
      if (combo.state === "filled") attributes["data-filled"] = "true";
      const value = el("span", { "data-s1-part": "value" });
      const icon = el("span", { "data-s1-part": "icon" });
      const trigger = el("button", attributes, combo.state === "hover" ? ["hover"] : combo.state === "disabled" ? ["disabled"] : [], [value, icon]);
      const panel = el("div", { "data-s1-part": "panel" });
      const root = el("div", {
        "data-s1-component": "select", "data-size": combo.size, "data-break": combo.breakName
      }, [], [trigger, panel]);
      return {
        targets: { root: { node: root }, trigger: { node: trigger }, value: { node: value }, icon: { node: icon }, panel: { node: panel } },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

function dropdownPlan(manifest) {
  const states = ["default", "hover", "selected"];
  const combos = [];
  for (const type of manifest.variants) {
    for (const size of manifest.sizes) {
      for (const state of states) combos.push({ type, size, state });
    }
  }
  return {
    id: "dropdown",
    axes: { types: manifest.variants, sizes: manifest.sizes, states },
    combos,
    key: (combo) => `${combo.type}|${combo.size}|${combo.state}`,
    build: (combo) => {
      const optionLabel = el("span", { "data-s1-part": "option-label" });
      const optionAttributes = { "data-s1-part": "option", role: combo.type === "checkbox" ? "checkbox" : "option" };
      if (combo.type === "checkbox") optionAttributes["aria-checked"] = combo.state === "selected" ? "true" : "false";
      else optionAttributes["aria-selected"] = combo.state === "selected" ? "true" : "false";
      const option = el("div", optionAttributes, combo.state === "hover" ? ["hover"] : [], [optionLabel]);
      const selectAll = el("div", { ...optionAttributes, "data-select-all": "true" }, [], []);
      const divider = el("div", { "data-s1-part": "divider" });
      const root = el("div", {
        "data-s1-component": "dropdown", "data-type": combo.type, "data-size": combo.size
      }, [], [selectAll, divider, option]);
      return {
        targets: {
          root: { node: root }, option: { node: option }, optionLabel: { node: optionLabel },
          selectAll: { node: selectAll }, divider: { node: divider }
        },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

function inputPlan(manifest) {
  const states = ["default", "filled", "focus", "error", "correct", "readOnly", "disabled"];
  const sizeBreaks = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks)) {
    for (const size of sizes) sizeBreaks.push({ size, breakName });
  }
  const combos = [];
  for (const pair of sizeBreaks) for (const state of states) combos.push({ ...pair, state });
  return {
    id: "input",
    axes: { sizeBreaks, states },
    combos,
    key: (combo) => `${combo.size}|${combo.breakName}|${combo.state}`,
    build: (combo) => {
      const controlAttributes = { "data-s1-part": "control" };
      const controlStates = [];
      if (combo.state === "focus") controlStates.push("focus", "focus-visible");
      if (combo.state === "error") controlAttributes["aria-invalid"] = "true";
      if (combo.state === "readOnly") controlAttributes.readonly = "";
      if (combo.state === "disabled") controlStates.push("disabled");
      const control = el("input", controlAttributes, controlStates);
      const actionIcon = el("span", { "data-s1-part": "action-icon" });
      const action = el("button", { "data-s1-part": "action", type: "button", "data-action": "clear" }, [], [actionIcon]);
      const actionHover = el("span", { "data-s1-part": "action-icon" });
      const field = el("div", { "data-s1-part": "field" }, [], [control, action]);
      const label = el("span", { "data-s1-part": "label" });
      const message = el("p", { "data-s1-part": "message" });
      const rootAttributes = {
        "data-s1-component": "input", "data-size": combo.size, "data-break": combo.breakName
      };
      if (combo.state === "correct") rootAttributes["data-state"] = "correct";
      const root = el("div", rootAttributes, combo.state === "focus" ? ["focus-within"] : [], [label, field, message]);
      return {
        targets: {
          root: { node: root }, label: { node: label }, field: { node: field }, control: { node: control },
          action: { node: action }, actionIcon: { node: actionIcon }, message: { node: message },
          placeholder: { node: control, pseudoElement: "placeholder" }
        },
        mediaActive: hoverOnly(false)
      };
    }
  };
}

/** Input 액션(지우기·비밀번호·검색) — 아이콘·색·간격은 상태 축이 아니라 부품 축이라 따로 묻는다. */
function inputActionsPlan(manifest) {
  const sizeBreaks = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks)) {
    for (const size of sizes) sizeBreaks.push({ size, breakName });
  }
  const actions = ["clear", "password", "password-pressed", "search"];
  const states = ["default", "hover", "disabled"];
  const combos = [];
  for (const pair of sizeBreaks) {
    for (const action of actions) {
      for (const state of states) combos.push({ ...pair, action, state });
    }
  }
  return {
    id: "input-actions",
    axes: { sizeBreaks, actions, states },
    combos,
    key: (combo) => `${combo.size}|${combo.breakName}|${combo.action}|${combo.state}`,
    build: (combo) => {
      const actionName = combo.action.replace("-pressed", "");
      const icon = el("span", { "data-s1-part": "action-icon" });
      const attributes = { "data-s1-part": "action", type: "button", "data-action": actionName };
      if (combo.action === "password-pressed") attributes["aria-pressed"] = "true";
      const action = el("button", attributes, combo.state === "hover" ? ["hover"] : [], [icon]);
      const leading = el("button", { "data-s1-part": "action", type: "button", "data-action": "clear" }, [], [el("span", { "data-s1-part": "action-icon" })]);
      const control = el("input", { "data-s1-part": "control" }, combo.state === "disabled" ? ["disabled"] : []);
      const field = el("div", { "data-s1-part": "field" }, [], [control, leading, action]);
      const rootAttributes = { "data-s1-component": "input", "data-size": combo.size, "data-break": combo.breakName };
      if (actionName === "search") rootAttributes["data-mode"] = "search";
      const root = el("div", rootAttributes, [], [field]);
      return {
        targets: { action: { node: action }, icon: { node: icon } },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

function modalPlan(manifest, footerSizes = {}) {
  const footers = ["single", "dual"];
  const combos = [];
  for (const breakName of Object.keys(manifest.breaks)) {
    for (const footer of footers) combos.push({ breakName, footer });
  }
  return {
    id: "modal",
    axes: { breaks: Object.keys(manifest.breaks), footers },
    combos,
    key: (combo) => `${combo.breakName}|${combo.footer}`,
    build: (combo) => {
      const footerButtonSize = footerSizes[combo.breakName] ?? "xxsm";
      const title = el("h2", { "data-s1-part": "title" });
      const close = el("button", { "data-s1-part": "close", type: "button" });
      const closeHover = el("button", { "data-s1-part": "close", type: "button" }, ["hover"]);
      const header = el("div", { "data-s1-part": "header" }, [], [title, close, closeHover]);
      const message = el("p", { "data-s1-part": "message" });
      const body = el("div", { "data-s1-part": "body" }, [], [message]);
      const content = el("div", { "data-s1-part": "content" }, [], [header, body]);
      /* 푸터 버튼은 별도 부품(button)의 인스턴스다 — 승인 예제와 같은 자리에 둔다.
         값 질의 대상은 아니지만, 이 자리에 무엇이 오는지 트리에 남겨 둔다. */
      const footerButton = (variant) => el("button", {
        "data-s1-component": "button", "data-variant": variant, "data-size": footerButtonSize, type: "button"
      }, [], [el("span", { "data-s1-part": "label" })]);
      const footerChildren = combo.footer === "dual"
        ? [footerButton("secondary"), footerButton("primary")]
        : [footerButton("primary")];
      const footer = el("div", { "data-s1-part": "footer" }, [], footerChildren);
      const panel = el("div", { "data-s1-part": "panel", role: "dialog" }, [], [content, footer]);
      const overlay = el("div", { "data-s1-part": "overlay" });
      const root = el("div", {
        "data-s1-component": "modal", "data-break": combo.breakName, "data-footer": combo.footer
      }, [], [overlay, panel]);
      return {
        targets: {
          root: { node: root }, overlay: { node: overlay }, panel: { node: panel }, content: { node: content },
          header: { node: header }, title: { node: title }, body: { node: body }, message: { node: message },
          footer: { node: footer }, close: { node: close }, closeIcon: { node: close, pseudoElement: "after" }
        },
        mediaActive: hoverOnly(false)
      };
    }
  };
}

/** 모달 닫기 버튼 hover 는 PC 에만 있다 — 별도 질의로 확인한다. */
function modalCloseHoverPlan(manifest) {
  return {
    id: "modal-close-hover",
    axes: { breaks: Object.keys(manifest.breaks) },
    combos: Object.keys(manifest.breaks).map((breakName) => ({ breakName })),
    key: (combo) => combo.breakName,
    build: (combo) => {
      const close = el("button", { "data-s1-part": "close", type: "button" }, ["hover"]);
      const header = el("div", { "data-s1-part": "header" }, [], [close]);
      const panel = el("div", { "data-s1-part": "panel" }, [], [header]);
      const root = el("div", { "data-s1-component": "modal", "data-break": combo.breakName, "data-footer": "single" }, [], [panel]);
      return { targets: { close: { node: close } }, mediaActive: hoverOnly(true) };
    }
  };
}

/* ── 모바일 하단 내비 ──────────────────────────────────────────────────
   정본은 "탭 1칸"만 만든다(바 4칸은 화면이 조립한다) — 여기서도 1칸만 부품으로 낸다.
   축은 선택 여부 하나뿐이고, 그 표현은 aria-selected 라는 네이티브 상태다. */
function mobileBottomNavPlan(manifest) {
  const states = ["unselected", "selected"];
  const icons = manifest.variants;
  const combos = [];
  /* 축 이름은 다른 부품과 같은 variant 를 쓴다 — 검수 화면의 변형 거르개가 같은 이름을 본다. */
  for (const variant of icons) for (const state of states) combos.push({ variant, state });
  return {
    id: "mobile-bottom-nav",
    axes: { variants: icons, states },
    combos,
    key: (combo) => `${combo.variant}|${combo.state}`,
    build: (combo) => {
      const icon = el("span", { "data-s1-part": "icon" });
      const label = el("span", { "data-s1-part": "label" });
      const root = el("button", {
        "data-s1-component": "mobile-bottom-nav", "data-icon": combo.variant, role: "tab",
        "aria-selected": combo.state === "selected" ? "true" : "false", type: "button"
      }, [], [icon, label]);
      return {
        targets: { root: { node: root }, icon: { node: icon }, label: { node: label } },
        mediaActive: hoverOnly(false)
      };
    }
  };
}

/* ── 모바일 헤더 ──────────────────────────────────────────────────────
   유형이 유일한 축이고, 유형마다 들어있는 슬롯이 다르다(manifest.htmlContract.perVariantParts).
   개수를 문장에 박지 않는다 — 아래 "쓸 수 있는 유형" 줄이 manifest.variants 를 그대로 옮기므로
   정본이 늘면 그 줄만 따라온다(2026-09-15 에 6종 → 7종이 되며 이 문장만 낡았다).
   그래서 조합마다 물어보는 부품 집합 자체가 다르다 — 없는 슬롯을 있는 척 묻지 않는다. */
function mobileHeaderPlan(manifest) {
  const variants = manifest.variants;
  const partsOf = (variant) => manifest.htmlContract.perVariantParts[variant];
  return {
    id: "mobile-header",
    axes: { variants },
    combos: variants.map((variant) => ({ variant })),
    key: (combo) => combo.variant,
    build: (combo) => {
      const present = new Set(partsOf(combo.variant));
      const nodes = {};
      const make = (part, tag, attributes = {}) => {
        const node = el(tag, { "data-s1-part": part, ...attributes });
        nodes[part] = node;
        return node;
      };
      const children = [];
      if (present.has("back")) {
        const back = make("back", "button", { type: "button", "aria-label": "이전" });
        back.children.push(Object.assign(make("back-icon", "span", { "aria-hidden": "true" }), { parent: back }));
        children.push(back);
      }
      if (present.has("stack")) {
        /* Home / Title + Subtitle — 제목줄(제목 + 아래화살표)과 부제목이 세로로 쌓인다. */
        const stack = make("stack", "div");
        const titleRow = make("title-row", "div");
        titleRow.parent = stack;
        stack.children.push(titleRow);
        const title = make("title", "h1");
        title.parent = titleRow;
        titleRow.children.push(title);
        if (present.has("arrow-icon")) {
          const arrow = make("arrow-icon", "span", { "aria-hidden": "true" });
          arrow.parent = titleRow;
          titleRow.children.push(arrow);
        }
        const subtitle = make("subtitle", "p");
        subtitle.parent = stack;
        stack.children.push(subtitle);
        children.push(stack);
      } else if (present.has("title")) {
        /* 제목이 없는 유형도 자리는 차지한다 — 빈 heading 을 만들지 않으려고 span 이다. */
        const titled = combo.variant !== "standard-no-title" && combo.variant !== "standard-no-title-close";
        children.push(make("title", titled ? "h1" : "span"));
      }
      if (present.has("notification")) {
        const notification = make("notification", "button", { type: "button", "aria-label": "알림" });
        const icon = make("notification-icon", "span", { "aria-hidden": "true" });
        icon.parent = notification;
        notification.children.push(icon);
        children.push(notification);
      }
      if (present.has("close")) {
        const close = make("close", "button", { type: "button", "aria-label": "닫기" });
        const icon = make("close-icon", "span", { "aria-hidden": "true" });
        icon.parent = close;
        close.children.push(icon);
        children.push(close);
      }
      if (present.has("spacer")) children.push(make("spacer", "span", { "aria-hidden": "true" }));

      const root = el("header", { "data-s1-component": "mobile-header", "data-variant": combo.variant }, [], children);
      const targets = { root: { node: root } };
      for (const [part, node] of Object.entries(nodes)) targets[camel(part)] = { node };
      /* 알림 아이콘의 빨간 점은 본체 위에 겹치는 두 번째 마스크 레이어다(::after). */
      if (nodes["notification-icon"]) targets.notificationDot = { node: nodes["notification-icon"], pseudoElement: "after" };
      /* 눌리는 영역은 보이는 32 보다 바깥으로 넓다(::before inset -6 → 44). 값이지 표시 규칙이 아니다. */
      for (const part of ["back", "close", "notification"]) {
        if (nodes[part]) targets[`${part}Hit`] = { node: nodes[part], pseudoElement: "before" };
      }
      return { targets, mediaActive: hoverOnly(false) };
    }
  };
}

/* ── 여러 줄 입력 ─────────────────────────────────────────────────────
   축은 상태 하나뿐이다(크기·헬퍼·글자수 없음). filled 는 값이 있는 문서 상태라
   강제 시각이 없고 default 와 같은 면을 쓴다 — 표에도 그대로 담는다. */
function textareaPlan() {
  const states = ["default", "focus", "readOnly", "disabled"];
  return {
    id: "textarea",
    axes: { states },
    combos: states.map((state) => ({ state })),
    key: (combo) => combo.state,
    build: (combo) => {
      const attributes = { "data-s1-part": "control" };
      const controlStates = [];
      if (combo.state === "focus") controlStates.push("focus", "focus-visible");
      if (combo.state === "readOnly") attributes.readonly = "";
      if (combo.state === "disabled") controlStates.push("disabled");
      const control = el("textarea", attributes, controlStates);
      const root = el("div", { "data-s1-component": "textarea" }, combo.state === "focus" ? ["focus-within"] : [], [control]);
      return {
        targets: {
          root: { node: root },
          control: { node: control },
          placeholder: { node: control, pseudoElement: "placeholder" }
        },
        mediaActive: hoverOnly(false)
      };
    }
  };
}

/* ── 글자 버튼 · 보조 버튼 ────────────────────────────────────────────
   둘 다 크기 축이 없고 상태 4가지뿐이다. pressed 는 hover 와 같은 면을 쓴다(코어 Button 규칙)
   — 같은 값이 두 칸에 들어가는 것이 맞다. 값을 하나로 줄이면 규칙이 보이지 않는다. */
function labelButtonPlan(id, manifest) {
  const states = ["default", "hover", "pressed", "disabled"];
  const variants = manifest.variants ?? [];
  const combos = [];
  if (variants.length) {
    for (const variant of variants) for (const state of states) combos.push({ variant, state });
  } else {
    for (const state of states) combos.push({ state });
  }
  return {
    id,
    axes: variants.length ? { variants, states } : { states },
    combos,
    key: (combo) => (combo.variant ? `${combo.variant}|${combo.state}` : combo.state),
    build: (combo) => {
      const nodeStates = [];
      if (combo.state === "hover") nodeStates.push("hover");
      if (combo.state === "pressed") nodeStates.push("active");
      if (combo.state === "disabled") nodeStates.push("disabled");
      const label = el("span", { "data-s1-part": "label" });
      const attributes = { "data-s1-component": id, type: "button" };
      if (combo.variant) attributes["data-variant"] = combo.variant;
      const root = el("button", attributes, nodeStates, [label]);
      return {
        targets: { root: { node: root }, label: { node: label } },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

/* ── 필터 칩 ──────────────────────────────────────────────────────────
   제목 유무(data-title)가 값 라벨의 색을 바꾸므로 축으로 함께 물어본다.
   열림(selected)은 목록을 자식으로 붙이는데, 목록 자체의 값은 dropdown 이 소유한다 — 여기서는 자리만 잰다. */
function filterChipPlan(manifest) {
  const states = ["default", "hover", "selected", "complete", "disabled"];
  const titles = ["on", "off"];
  const sizeBreaks = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks)) {
    for (const size of sizes) sizeBreaks.push({ size, breakName });
  }
  const combos = [];
  for (const pair of sizeBreaks) {
    for (const variant of manifest.variants) {
      for (const title of titles) {
        for (const state of states) combos.push({ ...pair, variant, title, state });
      }
    }
  }
  return {
    id: "filter-chip",
    axes: { variants: manifest.variants, sizeBreaks, titles, states },
    combos,
    key: (combo) => `${combo.variant}|${combo.size}|${combo.breakName}|${combo.title}|${combo.state}`,
    build: (combo) => {
      const open = combo.state === "selected";
      const triggerStates = [];
      if (combo.state === "hover") triggerStates.push("hover");
      if (combo.state === "disabled") triggerStates.push("disabled");
      const title = el("span", { "data-s1-part": "title" });
      const value = el("span", { "data-s1-part": "value" });
      const icon = el("span", { "data-s1-part": "icon" });
      const triggerAttributes = {
        "data-s1-part": "trigger", type: "button", "aria-haspopup": "listbox",
        "aria-expanded": open ? "true" : "false"
      };
      if (combo.state === "complete") triggerAttributes["data-complete"] = "true";
      const children = combo.title === "on" ? [title, value, icon] : [value, icon];
      const trigger = el("button", triggerAttributes, triggerStates, children);
      const panelAttributes = { "data-s1-part": "panel" };
      if (!open) panelAttributes.hidden = "";
      const panel = el("div", panelAttributes);
      const root = el("div", {
        "data-s1-component": "filter-chip", "data-variant": combo.variant, "data-size": combo.size,
        "data-break": combo.breakName, "data-title": combo.title
      }, [], [trigger, panel]);
      const targets = {
        root: { node: root }, trigger: { node: trigger }, value: { node: value },
        icon: { node: icon }, panel: { node: panel }
      };
      if (combo.title === "on") targets.title = { node: title };
      return { targets, mediaActive: hoverOnly(combo.state === "hover") };
    }
  };
}

export const CORE_PLANS = {
  button: buttonPlan,
  chip: chipPlan,
  checkbox: () => controlPlan("checkbox"),
  radio: () => controlPlan("radio"),
  toggle: togglePlan,
  tab: tabPlan,
  select: selectPlan,
  dropdown: dropdownPlan,
  input: inputPlan,
  modal: modalPlan,
  "mobile-bottom-nav": mobileBottomNavPlan,
  "mobile-header": mobileHeaderPlan,
  textarea: textareaPlan,
  "text-button": (manifest) => labelButtonPlan("text-button", manifest),
  "assist-button": (manifest) => labelButtonPlan("assist-button", manifest),
  "filter-chip": filterChipPlan
};

export const CORE_EXTRA_PLANS = {
  input: [inputActionsPlan],
  modal: [modalCloseHoverPlan]
};
