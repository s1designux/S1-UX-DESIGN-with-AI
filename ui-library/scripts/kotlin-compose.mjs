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
import { buttonKt, chipKt, controlKt, toggleKt, tabKt, selectKt, dropdownKt, inputKt, modalKt, mobileHeaderKt, mobileBottomNavKt, textareaKt, labelButtonKt, filterChipKt, galleryKt } from "./kotlin-components.mjs";

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";
const PACKAGE = "com.s1.designsystem";

const parts = (name) => name.replace(/^--/, "").split("-").filter(Boolean);
const camelName = (name) => parts(name).map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");
const camel = (id) => id.split(/[-_ ]/).filter(Boolean).map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");
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
  /* calc(var(--x) * -1) — 바깥으로 넓히는 값(터치 영역)을 음수로 쓴 꼴이다. */
  const scaled = /^calc\(\s*var\(\s*(--[a-z0-9-]+)\s*\)\s*\*\s*(-?\d*\.?\d+)\s*\)$/i.exec(text);
  if (scaled) {
    const base = lengthOf(`var(${scaled[1]})`, tokenValues, where);
    return { px: base.px * Number(scaled[2]), token: null, calc: text };
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
  "padding-inline-start", "padding-inline-end", "padding-block-start", "padding-block-end", "inset",
  "gap", "margin-inline-start", "margin-top", "font-size", "font-weight", "letter-spacing", "line-height", "box-shadow", "left", "right", "top", "bottom",
  "transform", "mask", "mask-image", "opacity", "flex", "text-decoration"
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
  if (style["padding-inline-start"] !== undefined) sides.paddingStart = length(style["padding-inline-start"])?.px ?? 0;
  if (style["padding-inline-end"] !== undefined) sides.paddingEnd = length(style["padding-inline-end"])?.px ?? 0;
  if (style["padding-block-start"] !== undefined) sides.paddingTop = length(style["padding-block-start"])?.px ?? 0;
  if (style["padding-block-end"] !== undefined) sides.paddingBottom = length(style["padding-block-end"])?.px ?? 0;
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
  /* inset 은 네 변을 한 줄로 쓴 것이다 — 터치 영역을 바깥으로 넓히는 값이 여기 담긴다. */
  if (style.inset !== undefined) {
    const pieces = splitOutside(style.inset).map((piece) => length(piece)?.px ?? 0);
    const [top, right, bottom, left] = pieces.length === 1
      ? [pieces[0], pieces[0], pieces[0], pieces[0]]
      : pieces.length === 2
        ? [pieces[0], pieces[1], pieces[0], pieces[1]]
        : pieces.length === 3
          ? [pieces[0], pieces[1], pieces[2], pieces[1]]
          : pieces;
    box.top = top; box.right = right; box.bottom = bottom; box.left = left;
  }
  for (const [property, field] of [["left", "left"], ["right", "right"], ["top", "top"], ["bottom", "bottom"]]) {
    if (style[property] === undefined) continue;
    const measured = length(style[property]);
    box[field] = measured ? measured.px : null;
  }
  /* mask 는 한 줄로 쓴 것(shorthand), mask-image 는 그림만 바꿔 끼운 것이다 —
     하단 내비가 칸마다 아이콘을 갈아 끼울 때 뒤엣것을 쓴다. 나중 선언이 이긴다. */
  for (const property of ["mask", "mask-image"]) {
    if (style[property] === undefined) continue;
    const icon = /url\(\s*"?([^")]+)"?\s*\)/.exec(style[property]);
    if (icon) box.icon = icon[1].split("/").pop().replace(/\.svg$/, "");
  }
  /* 밑줄 — 글자 버튼이 hover·pressed 에서 색 대신 밑줄로만 달라진다(정본 그대로). */
  if (style["text-decoration"] !== undefined) box.underline = /underline/.test(style["text-decoration"]);
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
   유형 6종이 유일한 축이고, 유형마다 들어있는 슬롯이 다르다(manifest.htmlContract.perVariantParts).
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
  modal: modalPlan,
  "mobile-bottom-nav": mobileBottomNavPlan,
  "mobile-header": mobileHeaderPlan,
  textarea: textareaPlan,
  "text-button": (manifest) => labelButtonPlan("text-button", manifest),
  "assist-button": (manifest) => labelButtonPlan("assist-button", manifest),
  "filter-chip": filterChipPlan
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
export const COMPOSE_COMPONENTS = ["button", "input", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "tab", "modal", "mobile-header", "mobile-bottom-nav", "textarea", "text-button", "assist-button", "filter-chip"];

const COMPONENT_FILE = {
  button: (pkg, api) => buttonKt(pkg, api),
  chip: (pkg, api) => chipKt(pkg, api),
  checkbox: (pkg) => controlKt(pkg, "checkbox"),
  radio: (pkg) => controlKt(pkg, "radio"),
  toggle: (pkg) => toggleKt(pkg),
  tab: (pkg, api) => tabKt(pkg, api),
  dropdown: (pkg, api) => dropdownKt(pkg, api),
  "mobile-header": (pkg, api) => mobileHeaderKt(pkg, api),
  "mobile-bottom-nav": (pkg, api) => mobileBottomNavKt(pkg, api),
  textarea: (pkg) => textareaKt(pkg),
  "text-button": (pkg, api) => labelButtonKt(pkg, api, "text-button"),
  "assist-button": (pkg, api) => labelButtonKt(pkg, api, "assist-button"),
  "filter-chip": (pkg, api) => filterChipKt(pkg, api)
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
