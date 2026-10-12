/**
 * platform-values.mjs — 승인 CSS 값을 플랫폼 중립 "상자(box)" 값으로 읽는 층.
 * --------------------------------------------------------------------------
 * Kotlin(Compose)·Swift(SwiftUI)·C++(Qt) 생성기가 함께 쓴다. 이 파일에는 어느 플랫폼의 이름도 없다 —
 * CSS 선언 → {background, foreground, radius, padding…} 정규화 값(순수 JSON)까지만 한다.
 * (원래 kotlin-compose.mjs 안에 있던 것을 2026-10-02 에 꺼냈다. 동작은 그대로다.)
 */

import { splitTopLevel } from "./css-model.mjs";

/* ── 1. CSS 값 → 정규화 값 ───────────────────────────────────────────── */

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
  if (!value || String(value).trim() === "none") return null;
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

/**
 * linear-gradient(to bottom, color-mix(in srgb, var(--토큰) 90%, transparent) 0%, ... transparent 100%) →
 * 세로 흐림 정거장 목록. 휠의 위·아래 흐림이 이 모양이다. 읽지 못하는 꼴은 멈춘다 — 조용히 건너뛰지 않는다.
 */
function gradientOf(value, where) {
  const inner = /^linear-gradient\((.*)\)$/s.exec(value.trim());
  if (!inner) throw new Error(`${where}: 그라데이션을 읽지 못했습니다 — "${value}"`);
  const pieces = splitTopLevel(inner[1], ",").map((one) => one.trim());
  if (pieces[0] !== "to bottom") throw new Error(`${where}: 위에서 아래로 가는 그라데이션만 지원합니다 — "${pieces[0]}"`);
  const stops = [];
  for (const piece of pieces.slice(1)) {
    const at = /\s(-?\d*\.?\d+)%$/.exec(piece);
    if (!at) throw new Error(`${where}: 정거장 위치가 없습니다 — "${piece}"`);
    const colorText = piece.slice(0, at.index).trim();
    const offset = Number(at[1]) / 100;
    if (colorText === "transparent") { stops.push({ offset, token: null, alpha: 0 }); continue; }
    const mix = /^color-mix\(\s*in srgb\s*,\s*var\(\s*(--[a-z0-9-]+)\s*\)\s+(\d*\.?\d+)%\s*,\s*transparent\s*\)$/i.exec(colorText);
    if (mix) { stops.push({ offset, token: mix[1], alpha: Number(mix[2]) / 100 }); continue; }
    const token = tokenOf(colorText);
    if (token) { stops.push({ offset, token, alpha: 1 }); continue; }
    throw new Error(`${where}: 그라데이션 색을 읽지 못했습니다 — "${colorText}"`);
  }
  return stops;
}

/* ── 2. 계산된 선언 → 스타일 상자 ───────────────────────────────────── */

export const BOX_PROPERTIES = new Set([
  "background", "background-color", "color", "border", "border-color", "border-width", "border-style",
  "border-radius", "height", "min-height", "width", "min-width", "max-width",
  "padding", "padding-inline", "padding-block", "padding-left", "padding-right", "padding-top", "padding-bottom",
  "padding-inline-start", "padding-inline-end", "padding-block-start", "padding-block-end", "inset",
  "gap", "margin-inline-start", "margin-top", "font-size", "font-weight", "letter-spacing", "line-height", "box-shadow", "left", "right", "top", "bottom",
  "transform", "mask", "mask-image", "opacity", "flex", "text-decoration",
  "max-height", "margin", "margin-inline", "margin-inline-end", "margin-bottom",
  "border-top-left-radius", "border-top-right-radius", "justify-content", "transition",
  "row-gap", "column-gap", "flex-basis"
]);

/** 값이 아니라 표시·배치·동작 규칙이라 부품 뼈대가 직접 담당하는 속성 — 읽지 않아도 값이 새지 않는다. */
export const DISPLAY_ONLY_PROPERTIES = new Set([
  "display", "flex-direction", "align-items", "align-self", "align-content", "position", "z-index", "overflow", "overflow-x", "overflow-y",
  "cursor", "appearance", "box-sizing", "font-family", "pointer-events", "white-space", "text-overflow", "text-align",
  "visibility", "content", "flex-wrap", "scroll-snap-type", "scroll-snap-align", "scrollbar-width", "text-box",
  "grid-template-rows", "-webkit-mask"
]);

/** 계산된 선언 뭉치에서 Compose 가 쓰는 값만 뽑아 정규화한다. */
export function toBox(style, tokenValues, where) {
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
  if (style.background !== undefined) {
    if (/^linear-gradient\(/.test(style.background.trim())) box.gradient = gradientOf(style.background, where);
    else box.background = colorOf(style.background, where);
  }
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
  /* row-gap·column-gap 은 gap 의 한 축만 적은 것이다. 한 부품에 한 축만 쓰므로 같은 칸에 담는다. */
  if (style["row-gap"] !== undefined) box.gap = length(style["row-gap"])?.px ?? 0;
  if (style["column-gap"] !== undefined) box.gap = length(style["column-gap"])?.px ?? 0;
  /* margin 은 한 값짜리 줄임 표기만 읽는다(여러 값은 이 저장소에 없다 — 생기면 멈춘다).
     자세한 변(margin-inline 등)이 뒤에 오면 그 변만 덮는다 — 이 저장소는 항상 줄임 표기가 앞이다. */
  if (style.margin !== undefined) {
    const pieces = splitOutside(style.margin);
    if (pieces.length !== 1) throw new Error(`${where}: margin 값이 여러 개입니다 — "${style.margin}" (지원하지 않음)`);
    const all = length(pieces[0])?.px ?? 0;
    box.marginStart = all; box.marginEnd = all; box.marginTop = all; box.marginBottom = all;
  }
  if (style["margin-inline"] !== undefined) {
    const pieces = splitOutside(style["margin-inline"]);
    const first = length(pieces[0])?.px ?? 0;
    const second = pieces[1] === undefined ? first : (length(pieces[1])?.px ?? 0);
    box.marginStart = first; box.marginEnd = second;
  }
  if (style["margin-inline-start"] !== undefined) box.marginStart = length(style["margin-inline-start"])?.px ?? 0;
  if (style["margin-inline-end"] !== undefined) box.marginEnd = length(style["margin-inline-end"])?.px ?? 0;
  if (style["margin-top"] !== undefined) box.marginTop = length(style["margin-top"])?.px ?? 0;
  if (style["margin-bottom"] !== undefined) box.marginBottom = length(style["margin-bottom"])?.px ?? 0;
  if (style["max-width"] !== undefined) {
    const measured = length(style["max-width"]);
    if (measured) box.maxWidth = measured.px;
  }
  /* 화면 높이의 몇 퍼센트(vh) — 시트가 화면을 다 덮지 않게 하는 상한이다. 절대 길이는 그대로 dp 로 둔다. */
  if (style["max-height"] !== undefined) {
    const vh = /^(\d*\.?\d+)vh$/.exec(String(style["max-height"]).trim());
    if (vh) box.maxHeightVh = Number(vh[1]);
    else {
      const measured = length(style["max-height"]);
      if (measured) box.maxHeight = measured.px;
    }
  }
  if (style["border-top-left-radius"] !== undefined) box.radiusTopStart = length(style["border-top-left-radius"])?.px ?? 0;
  if (style["border-top-right-radius"] !== undefined) box.radiusTopEnd = length(style["border-top-right-radius"])?.px ?? 0;
  if (style["justify-content"] !== undefined) box.spaceBetween = style["justify-content"].trim() === "space-between";
  /* flex 줄임 표기의 마지막이 px 길이면 그 칸의 기본 크기다(휠 칸 높이 42 가 여기 있다). */
  const basisSource = style["flex-basis"] ?? (style.flex === undefined ? undefined : splitOutside(style.flex).pop());
  if (basisSource !== undefined && /^\d*\.?\d+px$/.test(String(basisSource).trim())) box.flexBasis = length(basisSource).px;
  /* 전환 시간 — 첫 항목의 시간(s·ms)을 ms 로 읽는다. 0 이면 움직임이 없는 것이다. */
  if (style.transition !== undefined && style.transition.trim() !== "none") {
    const time = /(?:^|\s)(\d*\.?\d+)(ms|s)(?=\s|,|$)/.exec(style.transition);
    if (time) box.durationMs = Math.round(Number(time[1]) * (time[2] === "s" ? 1000 : 1));
  }
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
    /* 좌우 뒤집기 — 접힘카드 화살표가 열리면 위를 가리키게 만드는 값이다. */
    const flip = /scaleX\((-?[\d.]+)\)/.exec(style.transform);
    if (flip) box.scaleX = Number(flip[1]);
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
