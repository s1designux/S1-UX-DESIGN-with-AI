/**
 * kotlin-compose.mjs — 승인 배포본에서 Jetpack Compose 부품을 뽑아낸다.
 * --------------------------------------------------------------------------
 * 입력: 컴포넌트별 CSS(승인본) · tokens.css · behavior.json 원장 · contract 축
 * 출력: platform/kotlin/*.kt (팔레트·스타일 표·부품·아이콘·미리보기) + 대조표
 *
 * [설계]
 *   값은 사람이 옮겨 적지 않는다. css-model.mjs 가 실제 캐스케이드로 계산한
 *   "이 부품이 이 상태일 때의 최종 선언"을 그대로 스타일 표로 굳힌다.
 *   레이아웃 뼈대(Compose 트리)만 여기 템플릿으로 있고, 치수·색은 전부 표에서 온다.
 *
 * [이 파일이 하지 않는 것]
 *   - CSS 에 없는 값을 채우지 않는다. 없으면 null 로 남고, 필요한 자리에서 빌드가 선다.
 *   - 승인되지 않은 variant·size·state 를 만들지 않는다. 축은 manifest 에서 온다.
 *   - 아무도 읽지 않은 CSS 선언은 coverage 보고서로 드러낸다(조용한 누락 방지).
 */

import { parseStylesheet, element, computeStyle, unusedDeclarations } from "./css-model.mjs";
import { runtimeKt } from "./kotlin-runtime.mjs";
import { paletteKt, specKt } from "./kotlin-emit.mjs";
import { readIcon, iconsKt } from "./kotlin-icons.mjs";
import { readTextStyles, typeKt } from "./kotlin-typography.mjs";
import { buttonKt, chipKt, controlKt, toggleKt, tabKt, selectKt, dropdownKt, inputKt, modalKt, galleryKt } from "./kotlin-components.mjs";

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";
const PACKAGE = "com.s1.designsystem";

const parts = (name) => name.replace(/^--/, "").split("-").filter(Boolean);
const camelName = (name) => parts(name).map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");
const pascal = (id) => id.split(/[-_ ]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/* ── 1. CSS 값 → Kotlin 표현 ─────────────────────────────────────────── */

const VAR_PATTERN = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i;

/** 토큰 참조면 토큰 이름, 아니면 null. */
function tokenOf(value) {
  const match = VAR_PATTERN.exec(String(value).trim());
  return match ? match[1] : null;
}

/** 길이값 → px 숫자. 토큰이면 tokens.css 에서 읽은 값을 쓰되 출처를 함께 남긴다. */
function lengthOf(value, tokenValues, where) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (text === "0" || text === "0px") return { px: 0, token: null };
  if (["auto", "100%", "none", "normal", "inherit", "max-content", "min-content", "fit-content"].includes(text)) return null;
  const token = tokenOf(text);
  if (token) {
    const resolved = tokenValues.get(token);
    if (resolved === undefined) throw new Error(`${where}: 토큰 ${token} 을 tokens.css 에서 찾지 못했습니다.`);
    const number = /^(-?\d*\.?\d+)px$/.exec(resolved);
    if (!number) throw new Error(`${where}: ${token} = ${resolved} 은 길이가 아닙니다.`);
    return { px: Number(number[1]), token };
  }
  const calc = /^calc\(\s*var\(\s*(--[a-z0-9-]+)\s*\)\s*([-+])\s*var\(\s*(--[a-z0-9-]+)\s*\)\s*\)$/i.exec(text);
  if (calc) {
    const left = lengthOf(`var(${calc[1]})`, tokenValues, where);
    const right = lengthOf(`var(${calc[3]})`, tokenValues, where);
    return { px: calc[2] === "-" ? left.px - right.px : left.px + right.px, token: null, calc: text };
  }
  const plain = /^(-?\d*\.?\d+)px$/.exec(text);
  if (plain) return { px: Number(plain[1]), token: null, literal: true };
  throw new Error(`${where}: 길이로 읽을 수 없는 값 "${text}"`);
}

/** 색값 → 팔레트 이름. 토큰이 아니면(transparent 등) 특별값으로 표시. */
function colorOf(value, where) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (text === "transparent" || text === "none" || text === "inherit") return null;
  if (text === "currentcolor" || text === "currentColor") return { inherit: true };
  const token = tokenOf(text);
  if (!token) throw new Error(`${where}: 색이 토큰이 아닙니다 — "${text}" (하드코딩 금지)`);
  return { token };
}

function numberOf(value, tokenValues, where) {
  if (value === undefined) return null;
  const token = tokenOf(value);
  const raw = token ? tokenValues.get(token) : String(value).trim();
  if (raw === undefined) throw new Error(`${where}: 토큰 ${token} 없음`);
  const em = /^(-?\d*\.?\d+)em$/.exec(raw);
  if (em) return Number(em[1]);
  const plain = /^(-?\d*\.?\d+)$/.exec(raw);
  if (plain) return Number(plain[1]);
  if (raw === "normal") return null;
  throw new Error(`${where}: 숫자로 읽을 수 없는 값 "${raw}"`);
}

/** box-shadow → 층 목록. Compose 에서 직접 그린다. */
function shadowOf(value, tokenValues, where) {
  if (!value) return null;
  const token = tokenOf(value);
  const raw = token ? tokenValues.get(token) : value;
  if (raw === undefined) throw new Error(`${where}: 그림자 토큰 ${token} 없음`);
  const layers = [];
  for (const piece of splitShadow(raw)) {
    const px = "(-?[\\d.]+)(?:px)?";
    const match = new RegExp(`^${px}\\s+${px}\\s+${px}(?:\\s+${px})?\\s+(rgba?\\([^)]*\\))$`).exec(piece.trim());
    if (!match) throw new Error(`${where}: 그림자를 읽지 못했습니다 — "${piece}"`);
    layers.push({
      x: Number(match[1]), y: Number(match[2]), blur: Number(match[3]),
      spread: match[4] ? Number(match[4]) : 0,
      color: rgbaToArgb(match[5], where)
    });
  }
  return layers;
}

function splitShadow(raw) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] === "(") depth += 1;
    else if (raw[i] === ")") depth -= 1;
    else if (raw[i] === "," && depth === 0) { out.push(raw.slice(start, i)); start = i + 1; }
  }
  out.push(raw.slice(start));
  return out;
}

function rgbaToArgb(text, where) {
  const match = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(text.trim());
  if (!match) throw new Error(`${where}: 색을 읽지 못했습니다 — "${text}"`);
  const channel = (input) => Math.round(Number(input)).toString(16).padStart(2, "0").toUpperCase();
  const alpha = match[4] === undefined ? 255 : Math.round(Number(match[4]) * 255);
  return `0x${channel(alpha)}${channel(match[1])}${channel(match[2])}${channel(match[3])}`;
}

/* ── 2. 계산된 선언 → 스타일 상자 ───────────────────────────────────── */

const BOX_PROPERTIES = new Set([
  "background", "background-color", "color", "border", "border-color", "border-width", "border-style",
  "border-radius", "height", "min-height", "width", "min-width", "max-width",
  "padding", "padding-inline", "padding-block", "padding-left", "padding-right", "padding-top", "padding-bottom",
  "gap", "margin-inline-start", "margin-top", "font-size", "font-weight", "letter-spacing", "line-height", "box-shadow", "left", "right", "top", "bottom",
  "transform", "mask", "opacity", "flex"
]);

/** 계산된 선언 뭉치에서 Compose 가 쓰는 값만 뽑아 정규화한다. */
function toBox(style, tokenValues, where) {
  const box = {};
  const length = (value) => lengthOf(value, tokenValues, where);

  const border = style.border;
  if (border !== undefined) {
    if (border.trim() === "0") { box.borderWidth = 0; box.borderColor = null; }
    else {
      const pieces = splitOutside(border);
      const widthPiece = pieces.find((piece) => tokenOf(piece)?.startsWith("--border-width") || /^\d+px$/.test(piece));
      const colorPiece = pieces.find((piece) => tokenOf(piece)?.startsWith("--color"));
      if (widthPiece) box.borderWidth = length(widthPiece)?.px ?? 0;
      if (colorPiece) box.borderColor = colorOf(colorPiece, where);
    }
  }
  if (style["border-width"] !== undefined) box.borderWidth = length(style["border-width"])?.px ?? 0;
  if (style["border-color"] !== undefined) box.borderColor = colorOf(style["border-color"], where);
  if (style.background !== undefined) box.background = colorOf(style.background, where);
  if (style["background-color"] !== undefined) box.background = colorOf(style["background-color"], where);
  if (style.color !== undefined) box.foreground = colorOf(style.color, where);
  if (style["border-radius"] !== undefined) box.radius = length(style["border-radius"])?.px ?? 0;

  for (const [property, field] of [["height", "height"], ["min-height", "minHeight"], ["width", "width"], ["min-width", "minWidth"]]) {
    if (style[property] === undefined) continue;
    const measured = length(style[property]);
    if (measured) box[field] = measured.px;
  }

  const sides = { paddingTop: null, paddingBottom: null, paddingStart: null, paddingEnd: null };
  const applyPair = (value, [first, second]) => {
    const pieces = splitOutside(value);
    const one = length(pieces[0]);
    const two = pieces[1] === undefined ? one : length(pieces[1]);
    if (one) sides[first] = one.px;
    if (two) sides[second] = two.px;
  };
  if (style.padding !== undefined) {
    const pieces = splitOutside(style.padding);
    const measured = pieces.map((piece) => length(piece)?.px ?? 0);
    const [top, right, bottom, left] = measured.length === 1
      ? [measured[0], measured[0], measured[0], measured[0]]
      : measured.length === 2
        ? [measured[0], measured[1], measured[0], measured[1]]
        : measured.length === 3
          ? [measured[0], measured[1], measured[2], measured[1]]
          : measured;
    sides.paddingTop = top; sides.paddingEnd = right; sides.paddingBottom = bottom; sides.paddingStart = left;
  }
  if (style["padding-block"] !== undefined) applyPair(style["padding-block"], ["paddingTop", "paddingBottom"]);
  if (style["padding-inline"] !== undefined) applyPair(style["padding-inline"], ["paddingStart", "paddingEnd"]);
  if (style["padding-left"] !== undefined) sides.paddingStart = length(style["padding-left"])?.px ?? 0;
  if (style["padding-right"] !== undefined) sides.paddingEnd = length(style["padding-right"])?.px ?? 0;
  if (style["padding-top"] !== undefined) sides.paddingTop = length(style["padding-top"])?.px ?? 0;
  if (style["padding-bottom"] !== undefined) sides.paddingBottom = length(style["padding-bottom"])?.px ?? 0;
  for (const [field, value] of Object.entries(sides)) if (value !== null) box[field] = value;

  if (style.gap !== undefined) box.gap = length(style.gap)?.px ?? 0;
  if (style["margin-inline-start"] !== undefined) box.marginStart = length(style["margin-inline-start"])?.px ?? 0;
  if (style["margin-top"] !== undefined) box.marginTop = length(style["margin-top"])?.px ?? 0;
  if (style["font-size"] !== undefined) box.fontSize = length(style["font-size"])?.px ?? null;
  if (style["font-weight"] !== undefined) box.fontWeight = numberOf(style["font-weight"], tokenValues, where);
  if (style["letter-spacing"] !== undefined) box.letterSpacing = numberOf(style["letter-spacing"], tokenValues, where);
  if (style["line-height"] !== undefined) box.lineHeight = numberOf(style["line-height"], tokenValues, where);
  if (style["box-shadow"] !== undefined) box.shadow = shadowOf(style["box-shadow"], tokenValues, where);
  for (const [property, field] of [["left", "left"], ["right", "right"], ["top", "top"], ["bottom", "bottom"]]) {
    if (style[property] === undefined) continue;
    const measured = length(style[property]);
    box[field] = measured ? measured.px : null;
  }
  if (style.mask !== undefined) {
    const icon = /url\(\s*"?([^")]+)"?\s*\)/.exec(style.mask);
    if (icon) box.icon = icon[1].split("/").pop().replace(/\.svg$/, "");
  }
  if (style.opacity !== undefined) box.opacity = numberOf(style.opacity, tokenValues, where);
  if (style.transform !== undefined) {
    const rotate = /rotate\((-?[\d.]+)deg\)/.exec(style.transform);
    if (rotate) box.rotation = Number(rotate[1]);
  }
  return box;
}

function splitOutside(value) {
  const out = [];
  let depth = 0;
  let buffer = "";
  for (const char of String(value).trim()) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === " " && depth === 0) { if (buffer) out.push(buffer); buffer = ""; continue; }
    buffer += char;
  }
  if (buffer) out.push(buffer);
  return out;
}

export const _internal = { tokenOf, lengthOf, colorOf, toBox, BOX_PROPERTIES };

/* ── 3. 컴포넌트별 검사 트리 ────────────────────────────────────────────
   승인된 예제 마크업과 같은 모양의 요소 트리를 만들어, 상태마다 CSS 를 질의한다.
   여기서 만드는 것은 "무엇을 물어볼지"이지 값이 아니다 — 값은 전부 CSS 가 답한다. */

const el = (tag, attributes = {}, states = [], children = []) => element({ tag, attributes, states, children });
const hoverOnly = (isHover) => (condition) => (/hover/.test(condition) ? isHover : true);

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
      const root = el("button", {
        "data-s1-component": "button", "data-variant": combo.variant, "data-size": combo.size, type: "button"
      }, combo.state === "hover" ? ["hover"] : combo.state === "disabled" ? ["disabled"] : [], [label]);
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

export const PLANS = {
  button: buttonPlan,
  chip: chipPlan,
  checkbox: () => controlPlan("checkbox"),
  radio: () => controlPlan("radio"),
  toggle: togglePlan,
  tab: tabPlan,
  select: selectPlan,
  dropdown: dropdownPlan,
  input: inputPlan,
  modal: modalPlan
};

export const EXTRA_PLANS = {
  input: [inputActionsPlan],
  modal: [modalCloseHoverPlan]
};

/* ── 4. 스펙 추출 ────────────────────────────────────────────────────── */

/**
 * Kotlin 은 안드로이드다 — PC 조합은 쓰이지 않는다(태블릿에서도 모바일을 쓴다. river 결정 2026-09-09).
 * break 축이 있는 컴포넌트만 모바일로 좁히고, 축이 없는 것(체크박스·라디오·토글·드롭다운)은 그대로 둔다.
 */
export function mobileOnly(manifest) {
  if (!manifest.breaks || !manifest.breaks.mobile) return manifest;
  return { ...manifest, breaks: { mobile: manifest.breaks.mobile } };
}

/** 부품이 실제로 받는 축 — 값이 하나뿐인 축은 파라미터로 내보내지 않는다. */
export function apiOf(id, manifest) {
  const mobile = mobileOnly(manifest);
  const sizes = mobile.breaks ? mobile.breaks.mobile : (mobile.sizes ?? []);
  const variants = mobile.variants ?? [];
  return {
    id,
    sizes,
    sizeParam: sizes.length > 1,
    size: sizes[0] ?? null,
    breakName: mobile.breaks ? "mobile" : null,
    variants,
    variantParam: variants.length > 1,
    variant: variants[0] ?? null
  };
}

export function planFor(id, manifest, planOptions) {
  return PLANS[id](mobileOnly(manifest), planOptions);
}

export function extractSpec({ id, css, manifest, tokenValues, planOptions }) {
  const rules = parseStylesheet(css);
  const usage = new Set();
  const collect = (plan) => {
    const table = {};
    for (const combo of plan.combos) {
      const { targets, mediaActive } = plan.build(combo);
      const key = plan.key(combo);
      table[key] = { combo, parts: {} };
      for (const [name, target] of Object.entries(targets)) {
        const style = computeStyle(target.node, rules, {
          pseudoElement: target.pseudoElement ?? null,
          mediaActive,
          usage
        });
        table[key].parts[name] = toBox(style, tokenValues, `${id}/${key}/${name}`);
      }
    }
    return { axes: plan.axes, table };
  };

  const main = collect(planFor(id, manifest, planOptions));
  const extras = {};
  for (const factory of EXTRA_PLANS[id] ?? []) {
    const plan = factory(mobileOnly(manifest));
    extras[plan.id] = collect(plan);
  }
  return { id, axes: main.axes, table: main.table, extras, unused: unusedDeclarations(rules, usage) };
}

/* ── 5. 묶어서 파일로 ────────────────────────────────────────────────── */

/** A안 범위 — 화면 부품으로 옮기는 열 가지. 여기 없는 컴포넌트는 값(S1Tokens)만 제공한다. */
export const COMPOSE_COMPONENTS = ["button", "input", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "tab", "modal"];

const COMPONENT_FILE = {
  button: (pkg, api) => buttonKt(pkg, api),
  chip: (pkg, api) => chipKt(pkg, api),
  checkbox: (pkg) => controlKt(pkg, "checkbox"),
  radio: (pkg) => controlKt(pkg, "radio"),
  toggle: (pkg) => toggleKt(pkg),
  tab: (pkg, api) => tabKt(pkg, api),
  dropdown: (pkg, api) => dropdownKt(pkg, api)
};

/**
 * 읽히지 않은 선언이 왜 안 읽혔는지 기계로 가른다.
 * PC 전용 규칙(안드로이드가 안 쓰는 것)과 표시·배치 규칙(값이 아닌 것)은 뜻이 전혀 다르다 —
 * 한 덩어리로 묶어 놓으면 "빠뜨린 값"을 그 안에 숨길 수 있다.
 */
function classifyUnread(unread, api) {
  const mobileSizes = new Set(api.sizes);
  return unread.map((one) => {
    const selector = one.selector;
    const sizes = [...selector.matchAll(/data-size="([a-z]+)"/g)].map((match) => match[1]);
    const pcOnly = selector.includes('data-break="pc"')
      || selector.includes(':not([data-break="mobile"])')
      || (sizes.length > 0 && sizes.every((size) => !mobileSizes.has(size)));
    return { ...one, reason: pcOnly ? "pc-only" : "display-rule" };
  });
}

/** 승인된 예제 마크업에서 모달 푸터 버튼 크기를 읽는다 — 값을 정하지 않고 읽는다. */
function modalFooterButtonSizes(component) {
  const sizes = {};
  for (const [breakName, html] of Object.entries(component.exampleByBreak ?? {})) {
    const match = /data-s1-component="button"[^>]*data-size="([a-z]+)"/.exec(html);
    if (!match) throw new Error(`modal ${breakName}: 예제에서 푸터 버튼 크기를 찾지 못했습니다.`);
    sizes[breakName] = match[1];
  }
  return sizes;
}

export function buildKotlinOutputs({ componentOutputs, tokenData, iconAssets, typographyCss, pkg = PACKAGE }) {
  const tokenValues = new Map(tokenData.tokens.map((token) => [token.name, token.value]));
  const byId = new Map(componentOutputs.map((component) => [component.id, component]));
  const outputs = new Map();
  const specs = [];
  const coverage = [];

  const apis = {};
  for (const id of COMPOSE_COMPONENTS) {
    const component = byId.get(id);
    if (!component) throw new Error(`Compose 범위에 있는 ${id} 가 배포본에 없습니다.`);
    if (component.manifest.status !== "approved") throw new Error(`${id} 는 승인 상태가 아닙니다(${component.manifest.status}).`);
    const planOptions = id === "modal" ? modalFooterButtonSizes(component) : undefined;
    const spec = extractSpec({ id, css: component.css, manifest: component.manifest, tokenValues, planOptions });
    specs.push(spec);
    const api = apiOf(id, component.manifest);
    const unread = classifyUnread(spec.unused, api);
    coverage.push({
      component: id,
      combinations: Object.keys(spec.table).length,
      parts: Object.keys(Object.values(spec.table)[0].parts),
      unreadPcOnly: unread.filter((one) => one.reason === "pc-only").length,
      unreadDisplayRules: unread.filter((one) => one.reason === "display-rule").length,
      unreadDeclarations: unread
    });
    outputs.set(`platform/kotlin/S1${pascal(id)}Spec.kt`, specKt(pkg, spec, GENERATED_NOTE));
    apis[id] = api;
  }

  /* 부품 파일은 축을 다 안 뒤에 만든다 — select 는 dropdown 의 축을 알아야 목록을 부를 수 있다. */
  for (const id of COMPOSE_COMPONENTS) {
    const api = apis[id];
    const build = COMPONENT_FILE[id];
    const text = build
      ? build(pkg, api)
      : id === "select"
        ? selectKt(pkg, api, apis.dropdown)
        : id === "input"
          ? inputKt(pkg, api)
          : modalKt(pkg, api, modalFooterButtonSizes(byId.get(id))[api.breakName]);
    outputs.set(`platform/kotlin/S1${pascal(id)}.kt`, text);
  }

  outputs.set("platform/kotlin/S1Style.kt", runtimeKt(pkg));
  outputs.set("platform/kotlin/S1Palette.kt", paletteKt(pkg, tokenData.tokens, GENERATED_NOTE));
  const textStyles = readTextStyles(typographyCss, tokenValues);
  outputs.set("platform/kotlin/S1Type.kt", typeKt(pkg, textStyles, GENERATED_NOTE));

  const usedIcons = new Set();
  for (const spec of specs) {
    const tables = [spec.table, ...Object.values(spec.extras ?? {}).map((extra) => extra.table)];
    for (const table of tables) {
      for (const row of Object.values(table)) {
        for (const box of Object.values(row.parts)) if (box.icon) usedIcons.add(box.icon);
      }
    }
  }
  const icons = [...usedIcons].sort().map((name) => {
    const asset = iconAssets.find(({ file }) => file === `${name}.svg`);
    if (!asset) throw new Error(`아이콘 ${name}.svg 가 배포본에 없습니다.`);
    return readIcon(name, asset.asset);
  });
  outputs.set("platform/kotlin/S1Icons.kt", iconsKt(pkg, icons, GENERATED_NOTE));
  outputs.set("platform/kotlin/preview/S1Gallery.kt", galleryKt(pkg, apis));

  return { outputs, coverage, icons: icons.map(({ name }) => name), textStyles: textStyles.map(({ name }) => name) };
}
