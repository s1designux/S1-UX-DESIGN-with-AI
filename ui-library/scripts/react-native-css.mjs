/**
 * react-native-css.mjs — 캐스케이드가 끝난 CSS 선언 → React Native 스타일 값
 * --------------------------------------------------------------------------
 * 입력: css-model 이 계산한 "순위가 붙은 최종 선언" (computeStyleRanked)
 * 출력: { style, notes }
 *   style = RN 이 읽는 값. 길이는 숫자(px), 색은 토큰 이름("--color-…") 그대로.
 *   notes = 이 변환이 RN 에서 원리상 표현할 수 없어 따로 처리/무시한 선언들(coverage 보고용)
 *
 * [이 파일이 하지 않는 것]
 *   - 값을 지어내지 않는다. 읽지 못하는 값은 예외로 멈춘다(조용한 누락 금지).
 *   - 색을 토큰이 아닌 값(HEX 등)으로 풀지 않는다 — 라이트/다크는 런타임 팔레트가 정한다.
 *   - RN 이 못 하는 선언을 몰래 버리지 않는다. 버리는 선언은 IGNORED 에 이유와 함께 적혀 있고,
 *     어느 부품이 몇 번 버렸는지 coverage.json 에 남는다.
 */

/* ── 1. 무시하는 선언 — 이유가 있어야 한다 ───────────────────────────── */

export const IGNORED = new Map(Object.entries({
  cursor: "pointer-only",              // 마우스 포인터 모양 — 터치에는 없음(web 은 Pressable 이 알아서 cursor 지정)
  transition: "animation",
  "transition-property": "animation",
  "transition-duration": "animation",
  appearance: "web-only",              // 브라우저 기본 모양 제거 — RN 은 기본 모양이 없다
  "-webkit-appearance": "web-only",
  outline: "web-only",                 // 포커스 윤곽선 — RN 에는 outline 이 없다(포커스 표시는 CSS 가 정한 border 로 대신함)
  "outline-offset": "web-only",
  "user-select": "web-only",
  resize: "web-only",
  "list-style": "web-only",
  "list-style-type": "web-only",
  "scrollbar-width": "web-only",
  "scroll-snap-type": "web-only",      // 시간 휠의 스냅 — 스크롤 스냅은 RN 의 snapToInterval 로 부품이 직접 처리
  "scroll-snap-align": "web-only",
  "caret-color": "text-input-prop",    // TextInput.cursorColor 로 전달
  "box-sizing": "consumed",            // 크기 계산에 쓰고 나면 RN 은 항상 border-box
  "font-family": "font-provider",      // 서체는 S1Provider 가 정한다
  "text-box": "web-only",              // 글자 상하 여백 자르기 — RN 은 줄 높이로 중앙정렬한다
  "word-break": "web-only",
  "vertical-align": "web-only",
  "text-overflow": "consumed",         // ellipsis → numberOfLines 로 대신 처리
  content: "consumed",                 // 가상요소 존재 여부 판정에만 쓴다
  "background-origin": "consumed",
  "background-position": "consumed",
  "background-repeat": "consumed",
  "background-size": "consumed",
  "background-image": "consumed",
  "-webkit-mask": "duplicate",         // mask 와 같은 값을 접두사로 한 번 더 적은 것
  "-webkit-mask-image": "duplicate",
  "-webkit-mask-size": "duplicate",
  "-webkit-mask-repeat": "duplicate",
  "-webkit-mask-position": "duplicate",
  "mask-size": "consumed",
  "mask-repeat": "consumed",
  "mask-position": "consumed",
  "object-fit": "consumed",
  "pointer-events": "consumed",
  "text-decoration": "consumed",
  "white-space": "consumed",
  overflow: "consumed",
  "overflow-x": "consumed",
  "overflow-y": "consumed",
  visibility: "consumed",
  "border-collapse": "web-only"        // 표 모델(table-layout) 은 View 격자로 대신한다
}));

/** 글자 상속 속성 — 요소 자신이 아니라 글자를 그리는 쪽이 읽는다. */
export const INHERITED = new Set([
  "color", "font-size", "font-weight", "line-height", "letter-spacing", "text-align",
  "white-space", "text-decoration", "text-transform", "visibility", "caret-color"
]);

/* ── 2. 값 읽기 도우미 ───────────────────────────────────────────────── */

const VAR_ONLY = /^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/i;

/** 최상위 공백으로 쪼갠다(괄호·따옴표 안은 건드리지 않음). */
export function splitSpaces(value) {
  const out = [];
  let depth = 0;
  let quote = null;
  let buffer = "";
  for (const char of String(value).trim()) {
    if (quote) { buffer += char; if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") { quote = char; buffer += char; continue; }
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (/\s/.test(char) && depth === 0) { if (buffer) out.push(buffer); buffer = ""; continue; }
    buffer += char;
  }
  if (buffer) out.push(buffer);
  return out;
}

function splitCommas(value) {
  const out = [];
  let depth = 0;
  let buffer = "";
  for (const char of String(value)) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) { out.push(buffer); buffer = ""; continue; }
    buffer += char;
  }
  out.push(buffer);
  return out;
}

export class Converter {
  /** tokenValues: Map(--name → 라이트 값 문자열). 길이·수치 토큰을 푸는 데만 쓴다. */
  constructor(tokenValues, shadowTokens) {
    this.tokens = tokenValues;
    this.shadowTokens = shadowTokens;
  }

  /** var(--x[, fallback]) 한 겹을 풀어 원문 값으로. 색 토큰은 풀지 않는다(호출자가 isColorToken 으로 거른다). */
  deref(value, where) {
    let text = String(value).trim();
    for (let guard = 0; guard < 8; guard += 1) {
      const match = VAR_ONLY.exec(text);
      if (!match) return text;
      const resolved = this.tokens.get(match[1]);
      if (resolved !== undefined) { text = resolved.trim(); continue; }
      if (match[2] !== undefined) { text = match[2].trim(); continue; }
      throw new Error(`${where}: 토큰 ${match[1]} 을 tokens.css 에서 찾지 못했습니다.`);
    }
    throw new Error(`${where}: var() 가 끝없이 이어집니다 — ${value}`);
  }

  isColorValue(value) {
    const text = String(value).trim();
    if (/^(transparent|currentcolor|inherit)$/i.test(text)) return true;
    if (/^#|^rgba?\(/i.test(text)) return true;
    const match = VAR_ONLY.exec(text);
    if (match && this.tokens.has(match[1])) {
      const resolved = this.tokens.get(match[1]).trim();
      return /^#|^rgba?\(|^transparent$/i.test(resolved);
    }
    return false;
  }

  /** 색 → 토큰 이름 | "transparent" | "currentColor". 토큰이 아닌 리터럴은 허용하지 않는다. */
  color(value, where) {
    const text = String(value).trim();
    if (/^transparent$/i.test(text)) return "transparent";
    if (/^currentcolor$/i.test(text)) return "currentColor";
    if (/^inherit$/i.test(text)) return "inherit";
    const match = VAR_ONLY.exec(text);
    if (match && this.tokens.has(match[1])) return match[1];
    if (match && match[2] !== undefined) return this.color(match[2], where);
    throw new Error(`${where}: 색이 토큰이 아닙니다 — "${text}" (하드코딩 금지)`);
  }

  /** 길이 → 숫자(px) | "N%" | {vw|vh, px} | "auto" | null(해석 불가는 예외) */
  length(value, where) {
    const text = String(value).trim();
    if (text === "0") return 0;
    if (text === "auto") return "auto";
    if (/^(none|normal|inherit|initial)$/.test(text)) return null;
    if (/^max-content|^min-content|^fit-content/.test(text)) return "fit";
    const terms = this.linear(text, where);
    const { px, pct, vw, vh } = terms;
    const kinds = [pct !== 0, vw !== 0, vh !== 0].filter(Boolean).length;
    if (kinds === 0) return round(px);
    if (kinds === 1 && pct !== 0 && px === 0) return `${round(pct)}%`;
    if (kinds === 1 && pct === 0) return vw !== 0 ? { vw: round(vw), px: round(px) } : { vh: round(vh), px: round(px) };
    throw new Error(`${where}: 퍼센트와 다른 단위가 섞인 계산식은 RN 이 표현하지 못합니다 — "${text}"`);
  }

  /** px / % / vw / vh 의 일차 결합으로 푼다. */
  linear(text, where) {
    const zero = () => ({ px: 0, pct: 0, vw: 0, vh: 0 });
    const add = (a, b, sign) => ({ px: a.px + sign * b.px, pct: a.pct + sign * b.pct, vw: a.vw + sign * b.vw, vh: a.vh + sign * b.vh });
    const scale = (a, k) => ({ px: a.px * k, pct: a.pct * k, vw: a.vw * k, vh: a.vh * k });
    const parseTerm = (raw) => {
      const t = raw.trim();
      const v = VAR_ONLY.exec(t);
      if (v) return parseTerm(this.deref(t, where));
      const number = /^(-?\d*\.?\d+)(px|%|vw|vh)?$/.exec(t);
      if (number) {
        const result = zero();
        const amount = Number(number[1]);
        const unit = number[2] ?? "px";
        if (unit === "px") result.px = amount;
        else if (unit === "%") result.pct = amount;
        else if (unit === "vw") result.vw = amount;
        else result.vh = amount;
        return result;
      }
      const calc = /^calc\(([\s\S]*)\)$/.exec(t);
      if (calc) return parseExpression(calc[1]);
      throw new Error(`${where}: 길이로 읽을 수 없는 값 "${t}"`);
    };
    const parseExpression = (expression) => {
      /* 괄호 깊이 0 에서 +,- 로 먼저 쪼개고, 그 안에서 * 를 처리한다. */
      const pieces = [];
      let depth = 0;
      let buffer = "";
      let sign = 1;
      const flush = (nextSign) => { pieces.push([sign, buffer.trim()]); buffer = ""; sign = nextSign; };
      for (let i = 0; i < expression.length; i += 1) {
        const char = expression[i];
        if (char === "(") depth += 1;
        if (char === ")") depth -= 1;
        if (depth === 0 && (char === "+" || char === "-") && expression[i - 1] === " " && expression[i + 1] === " ") { flush(char === "+" ? 1 : -1); continue; }
        buffer += char;
      }
      flush(1);
      let total = zero();
      for (const [pieceSign, piece] of pieces) {
        const factors = splitMultiply(piece);
        let term = null;
        let factor = 1;
        for (const part of factors) {
          if (/^-?\d*\.?\d+$/.test(part)) factor *= Number(part);
          else term = parseTerm(part);
        }
        total = add(total, scale(term ?? { px: 1, pct: 0, vw: 0, vh: 0 }, factor), pieceSign);
        if (term === null) throw new Error(`${where}: 계산식에 길이가 없습니다 — "${piece}"`);
      }
      return total;
    };
    return parseTerm(text);
  }

  number(value, where) {
    const text = this.deref(value, where);
    if (/^(normal|none|auto)$/.test(text)) return null;
    const plain = /^(-?\d*\.?\d+)$/.exec(text);
    if (plain) return Number(plain[1]);
    throw new Error(`${where}: 숫자로 읽을 수 없는 값 "${text}"`);
  }

  /** box-shadow → 층 목록. 층 하나는 { token }(그림자 토큰) 또는 { inset, x, y, blur, spread, color }(색은 토큰 이름) */
  shadow(value, where) {
    const text = String(value).trim();
    if (text === "none") return null;
    const layers = [];
    for (const piece of splitCommas(text)) {
      const layer = piece.trim();
      const token = VAR_ONLY.exec(layer);
      if (token && this.shadowTokens.has(token[1])) { layers.push({ token: token[1] }); continue; }
      const parts = splitSpaces(layer);
      const inset = parts[0] === "inset";
      const rest = inset ? parts.slice(1) : parts;
      const color = rest.pop();
      const numbers = rest.map((one) => this.length(one, `${where} box-shadow`));
      if (numbers.length < 3 || numbers.some((n) => typeof n !== "number")) throw new Error(`${where}: 그림자를 읽지 못했습니다 — "${layer}"`);
      layers.push({ inset, x: numbers[0], y: numbers[1], blur: numbers[2], spread: numbers[3] ?? 0, color: this.color(color, where) });
    }
    return layers;
  }
}

function splitMultiply(piece) {
  const out = [];
  let depth = 0;
  let buffer = "";
  for (const char of piece) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "*" && depth === 0) { out.push(buffer.trim()); buffer = ""; continue; }
    buffer += char;
  }
  out.push(buffer.trim());
  return out.filter(Boolean);
}

const round = (value) => Math.round(value * 10000) / 10000;

/* ── 3. shorthand → longhand ─────────────────────────────────────────── */

const SIDES = ["top", "right", "bottom", "left"];

/** 1~4 값 규칙(위·오른·아래·왼) */
function boxValues(values) {
  const [a, b = a, c = a, d = b] = values;
  return [a, b, c, values.length === 3 ? b : d];
}
function fourValues(values) {
  if (values.length === 1) return [values[0], values[0], values[0], values[0]];
  if (values.length === 2) return [values[0], values[1], values[0], values[1]];
  if (values.length === 3) return [values[0], values[1], values[2], values[1]];
  return values;
}

/** 순위 오름차순 선언 → 길이·색 등이 아직 원문인 longhand 맵 */
export function expandShorthands(ranked, where) {
  const L = new Map();
  const set = (name, value) => L.set(name, String(value).trim());
  for (const { property, value } of ranked) {
    const raw = String(value).trim();
    switch (property) {
      case "padding": case "margin": {
        fourValues(splitSpaces(raw)).forEach((side, index) => set(`${property}-${SIDES[index]}`, side));
        break;
      }
      case "padding-inline": case "margin-inline": {
        const base = property.split("-")[0];
        const [a, b = a] = splitSpaces(raw);
        set(`${base}-left`, a); set(`${base}-right`, b);
        break;
      }
      case "padding-block": case "margin-block": {
        const base = property.split("-")[0];
        const [a, b = a] = splitSpaces(raw);
        set(`${base}-top`, a); set(`${base}-bottom`, b);
        break;
      }
      case "padding-inline-start": set("padding-left", raw); break;
      case "padding-inline-end": set("padding-right", raw); break;
      case "padding-block-start": set("padding-top", raw); break;
      case "padding-block-end": set("padding-bottom", raw); break;
      case "margin-inline-start": set("margin-left", raw); break;
      case "margin-inline-end": set("margin-right", raw); break;
      case "margin-block-start": set("margin-top", raw); break;
      case "margin-block-end": set("margin-bottom", raw); break;
      case "inset": {
        fourValues(splitSpaces(raw)).forEach((side, index) => set(SIDES[index], side));
        break;
      }
      case "gap": {
        const [row, column = row] = splitSpaces(raw);
        set("row-gap", row); set("column-gap", column);
        break;
      }
      case "border-width": fourValues(splitSpaces(raw)).forEach((side, index) => set(`border-${SIDES[index]}-width`, side)); break;
      case "border-color": fourValues(splitSpaces(raw)).forEach((side, index) => set(`border-${SIDES[index]}-color`, side)); break;
      case "border-style": fourValues(splitSpaces(raw)).forEach((side, index) => set(`border-${SIDES[index]}-style`, side)); break;
      case "border": case "border-top": case "border-right": case "border-bottom": case "border-left": {
        const sides = property === "border" ? SIDES : [property.slice("border-".length)];
        let width = "medium"; let style = "none"; let color = "currentColor";
        if (raw === "0" || raw === "none") { width = "0"; style = "none"; }
        else {
          for (const piece of splitSpaces(raw)) {
            if (/^(solid|dashed|dotted|none|hidden|double)$/.test(piece)) style = piece;
            else if (/^(-?\d*\.?\d+px|0|var\(--border-width[^)]*\)|thin|medium|thick)$/.test(piece)) width = piece;
            else color = piece;
          }
        }
        for (const side of sides) { set(`border-${side}-width`, width); set(`border-${side}-style`, style); set(`border-${side}-color`, color); }
        break;
      }
      case "border-radius": {
        const corners = ["top-left", "top-right", "bottom-right", "bottom-left"];
        const values = splitSpaces(raw.split("/")[0]);
        const four = values.length === 1 ? [values[0], values[0], values[0], values[0]]
          : values.length === 2 ? [values[0], values[1], values[0], values[1]]
            : values.length === 3 ? [values[0], values[1], values[2], values[1]] : values;
        corners.forEach((corner, index) => set(`border-${corner}-radius`, four[index]));
        break;
      }
      case "overflow": { const [x, y = x] = splitSpaces(raw); set("overflow-x", x); set("overflow-y", y); break; }
      case "flex": {
        if (raw === "none") { set("flex-grow", "0"); set("flex-shrink", "0"); set("flex-basis", "auto"); break; }
        if (raw === "auto") { set("flex-grow", "1"); set("flex-shrink", "1"); set("flex-basis", "auto"); break; }
        const pieces = splitSpaces(raw);
        if (pieces.length === 1 && /^\d*\.?\d+$/.test(pieces[0])) { set("flex-grow", pieces[0]); set("flex-shrink", "1"); set("flex-basis", "0"); break; }
        set("flex-grow", pieces[0] ?? "0");
        if (pieces.length >= 2 && /^\d*\.?\d+$/.test(pieces[1])) set("flex-shrink", pieces[1]); else set("flex-shrink", "1");
        set("flex-basis", pieces.length >= 3 ? pieces[2] : pieces.length === 2 && !/^\d*\.?\d+$/.test(pieces[1]) ? pieces[1] : "0");
        break;
      }
      case "flex-flow": {
        for (const piece of splitSpaces(raw)) {
          if (/^(row|column)/.test(piece)) set("flex-direction", piece);
          else set("flex-wrap", piece);
        }
        break;
      }
      case "background": {
        /* 배경 한 줄: 색 하나이거나, 선 그리기용 linear-gradient 하나. */
        if (/^linear-gradient\(/.test(raw)) { set("background-image", raw); break; }
        if (raw === "none") { set("background-color", "transparent"); break; }
        set("background-color", raw);
        break;
      }
      case "mask": {
        /* mask: url(...) center / contain no-repeat — 소비자가 var(--s1-…, url(...)) 로 갈아끼우는 꼴도 있다 */
        const urls = [...raw.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)];
        if (urls.length) set("mask-image", `url(${urls[urls.length - 1][1]})`);
        break;
      }
      case "mask-image": {
        set("mask-image", raw);
        break;
      }
      case "font": {
        /* font: <weight>? <size>/<line-height> <family> — 배포본에서 3곳 */
        const head = splitSpaces(raw);
        for (const piece of head) {
          if (/^\d{3}$/.test(piece) || /^var\(--font-weight/.test(piece)) set("font-weight", piece);
          else if (/^var\(--font-size/.test(piece) || /^\d+px$/.test(piece)) set("font-size", piece);
          else if (piece.includes("/")) { const [size, lh] = piece.split("/"); set("font-size", size); set("line-height", lh); }
        }
        break;
      }
      case "text-decoration": set("text-decoration", raw); break;
      default: set(property, raw);
    }
  }
  return L;
}

/* ── 4. 변환 ─────────────────────────────────────────────────────────── */

const STRING_ENUM = {
  "flex-direction": { row: "row", column: "column", "row-reverse": "row-reverse", "column-reverse": "column-reverse" },
  "flex-wrap": { wrap: "wrap", nowrap: "nowrap", "wrap-reverse": "wrap-reverse" },
  "align-items": { center: "center", "flex-start": "flex-start", start: "flex-start", "flex-end": "flex-end", end: "flex-end", stretch: "stretch", baseline: "baseline", normal: null },
  "align-self": { center: "center", "flex-start": "flex-start", start: "flex-start", "flex-end": "flex-end", end: "flex-end", stretch: "stretch", baseline: "baseline", auto: null },
  "align-content": { center: "center", "flex-start": "flex-start", start: "flex-start", "flex-end": "flex-end", end: "flex-end", stretch: "stretch", "space-between": "space-between", "space-around": "space-around", normal: null },
  "justify-content": { center: "center", "flex-start": "flex-start", start: "flex-start", "flex-end": "flex-end", end: "flex-end", "space-between": "space-between", "space-around": "space-around", "space-evenly": "space-evenly", normal: null }
};

const COLOR_PROPS = new Set(["background-color", "color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color"]);

/**
 * 한 요소(또는 가상요소)의 순위 선언 → RN 스타일.
 * 반환 style 의 키 규칙:
 *   배치·치수  display(문자열, 판정용) flexDirection … width height … (숫자|문자열%|{vw|vh})
 *   그림      backgroundColor borderTopColor … = 토큰 이름 | "transparent" | "currentColor"
 *   글자      color fontSize fontWeight lineHeight(px) lineHeightRatio letterSpacing(px) letterSpacingEm textAlign
 *   확장      shadow:{token} icon:{name} nowrap ellipsis scrollY scrollX underline rotate …
 */
export function convertDeclarations(ranked, { converter, where, tag, notes }) {
  const L = expandShorthands(ranked, where);
  const style = {};
  const note = (property, reason) => { notes.push({ property, reason }); };

  const len = (name, to = name) => {
    if (!L.has(name)) return;
    const value = converter.length(L.get(name), `${where} ${name}`);
    if (value === null) return;
    style[to] = value;
  };

  /* display */
  const display = L.get("display");
  if (display !== undefined) style.display = display;

  for (const [name, table] of Object.entries(STRING_ENUM)) {
    if (!L.has(name)) continue;
    const value = L.get(name);
    if (!(value in table)) throw new Error(`${where}: ${name}: ${value} 은 RN 이 표현하지 못합니다.`);
    if (table[value] !== null) style[camelCase(name)] = table[value];
  }

  /* flex 항목 */
  if (L.has("flex-grow")) style.flexGrow = Number(converter.deref(L.get("flex-grow"), where));
  if (L.has("flex-shrink")) style.flexShrink = Number(converter.deref(L.get("flex-shrink"), where));
  if (L.has("flex-basis")) {
    const value = converter.length(L.get("flex-basis"), `${where} flex-basis`);
    if (value !== null && value !== "auto") style.flexBasis = value;
    if (value === "auto") style.flexBasis = "auto";
  }

  /* 크기 */
  for (const name of ["width", "height", "min-width", "min-height", "max-width", "max-height"]) {
    if (!L.has(name)) continue;
    const value = converter.length(L.get(name), `${where} ${name}`);
    if (value === null || value === "auto") continue;
    if (value === "fit") { style[`${camelCase(name)}Fit`] = true; continue; }
    style[camelCase(name)] = value;
  }

  /* 여백 */
  for (const kind of ["padding", "margin"]) {
    for (const side of SIDES) {
      const name = `${kind}-${side}`;
      if (!L.has(name)) continue;
      const value = converter.length(L.get(name), `${where} ${name}`);
      if (value === "auto") { style[`${kind}${cap(side)}Auto`] = true; continue; }
      if (value !== null) style[`${kind}${cap(side)}`] = value;
    }
  }
  if (L.has("row-gap")) { const v = converter.length(L.get("row-gap"), where); if (v !== null && v !== "auto") style.rowGap = v; }
  if (L.has("column-gap")) { const v = converter.length(L.get("column-gap"), where); if (v !== null && v !== "auto") style.columnGap = v; }

  /* 위치 */
  if (L.has("position")) style.position = L.get("position");
  for (const side of SIDES) {
    if (!L.has(side)) continue;
    const value = converter.length(L.get(side), `${where} ${side}`);
    if (value !== null && value !== "auto") style[side] = value;
  }
  if (L.has("z-index")) style.zIndex = Number(converter.deref(L.get("z-index"), where));

  /* 테두리 */
  for (const side of SIDES) {
    const widthRaw = L.get(`border-${side}-width`);
    const styleRaw = L.get(`border-${side}-style`) ?? "none";
    const colorRaw = L.get(`border-${side}-color`);
    if (widthRaw === undefined && colorRaw === undefined) continue;
    const solid = !/^(none|hidden)$/.test(styleRaw);
    const widthValue = widthRaw === undefined ? 0 : /^(thin|medium|thick)$/.test(widthRaw) ? ({ thin: 1, medium: 3, thick: 5 }[widthRaw]) : converter.length(widthRaw, `${where} border-${side}-width`);
    const px = solid ? widthValue : 0;
    style[`border${cap(side)}Width`] = px;
    if (px !== 0 && colorRaw !== undefined) { const value = converter.color(colorRaw, `${where} border-${side}-color`); style[`border${cap(side)}Color`] = value === "inherit" ? "currentColor" : value; }
    else if (px !== 0) style[`border${cap(side)}Color`] = "currentColor";
  }
  for (const corner of ["top-left", "top-right", "bottom-right", "bottom-left"]) {
    const name = `border-${corner}-radius`;
    if (!L.has(name)) continue;
    const value = converter.length(L.get(name), `${where} ${name}`);
    if (value !== null && value !== "auto") style[`border${corner.split("-").map(cap).join("")}Radius`] = value;
  }

  /* 배경 */
  if (L.has("background-color")) {
    const raw = L.get("background-color");
    const value = converter.color(raw, `${where} background-color`);
    style.backgroundColor = value === "inherit" ? "transparent" : value;
  }
  if (L.has("background-image")) {
    const raw = L.get("background-image");
    if (raw !== "none") {
      const parsed = parseGradient(raw, converter, `${where} background-image`);
      if (parsed.kind === "line") style.line = { color: parsed.color, insetX: parsed.insetX, height: parsed.height };
      else style.gradient = { to: parsed.to, stops: parsed.stops };
    }
  }
  if (L.has("box-shadow")) { const shadow = converter.shadow(L.get("box-shadow"), `${where} box-shadow`); if (shadow) style.shadow = shadow; }
  if (L.has("grid-template-rows")) { if (/^0fr$/.test(L.get("grid-template-rows"))) style.gridCollapsed = true; }
  if (L.has("opacity")) style.opacity = converter.number(L.get("opacity"), where);

  /* 글자 */
  if (L.has("color")) { const value = converter.color(L.get("color"), `${where} color`); if (value !== "inherit") style.color = value; }
  if (L.has("font-size")) style.fontSize = converter.length(L.get("font-size"), `${where} font-size`);
  if (L.has("font-weight")) style.fontWeight = converter.number(L.get("font-weight"), `${where} font-weight`);
  if (L.has("line-height")) {
    const raw = converter.deref(L.get("line-height"), where);
    if (/^\d*\.?\d+$/.test(raw)) style.lineHeightRatio = Number(raw);
    else if (raw !== "normal") style.lineHeight = converter.length(raw, `${where} line-height`);
  }
  if (L.has("letter-spacing")) {
    const raw = converter.deref(L.get("letter-spacing"), where);
    const em = /^(-?\d*\.?\d+)em$/.exec(raw);
    if (em) style.letterSpacingEm = Number(em[1]);
    else if (raw !== "normal") style.letterSpacing = converter.length(raw, `${where} letter-spacing`);
  }
  if (L.has("text-align")) {
    const value = L.get("text-align");
    style.textAlign = { start: "left", left: "left", center: "center", right: "right", end: "right", justify: "justify" }[value] ?? "left";
  }
  if (L.has("text-decoration")) style.underline = /underline/.test(L.get("text-decoration"));
  if (L.has("white-space")) style.nowrap = /nowrap/.test(L.get("white-space"));
  if (L.has("text-overflow")) style.ellipsis = L.get("text-overflow") === "ellipsis";
  if (L.has("text-transform")) style.textTransform = L.get("text-transform");

  /* 넘침 */
  for (const axis of ["x", "y"]) {
    const value = L.get(`overflow-${axis}`);
    if (value === undefined) continue;
    if (value === "hidden" || value === "clip") style.overflow = "hidden";
    else if (value === "auto" || value === "scroll") style[axis === "y" ? "scrollY" : "scrollX"] = true;
  }
  if (L.get("visibility") === "hidden") style.invisible = true;
  if (L.get("pointer-events") === "none") style.pointerEventsNone = true;
  if (L.has("object-fit")) style.objectFit = L.get("object-fit");

  /* 가상요소(::before·::after)는 content 가 있어야 생긴다 */
  if (L.has("content") && !/^(none|normal)$/.test(L.get("content"))) style.content = true;

  /* 마스크 아이콘 — 마지막 url() 이 기본 그림이다(앞의 var(--s1-…)는 소비자가 갈아끼우는 자리). */
  if (L.has("mask-image") && L.get("mask-image") !== "none") {
    const urls = [...L.get("mask-image").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)];
    if (urls.length) style.icon = urls[urls.length - 1][1].split("/").pop().replace(/\.svg$/, "");
    else notes.push({ property: "mask-image", reason: "consumer-provided" });
  }

  /* 변환 — 함수 목록을 CSS 순서 그대로 [[이름, 값], …] 로 둔다 */
  if (L.has("transform") && L.get("transform") !== "none") {
    const list = [];
    for (const piece of L.get("transform").matchAll(/(rotate|scaleX|scaleY)\(\s*(-?[\d.]+)(?:deg)?\s*\)/g)) list.push([piece[1], Number(piece[2])]);
    const rebuilt = list.map(([name, value]) => `${name}(${value}${name === "rotate" ? "deg" : ""})`).join(" ").replace(/\s+/g, "");
    if (list.length === 0 || rebuilt !== L.get("transform").replace(/\s+/g, "")) throw new Error(`${where}: 변환을 읽지 못했습니다 — ${L.get("transform")}`);
    style.transform = list;
  }

  /* 상자 모델 — content-box 이면 padding·border 를 더해 RN(border-box)에 맞춘다. */
  const boxSizing = L.get("box-sizing") ?? (["button", "select", "input", "textarea"].includes(tag) ? "border-box" : "content-box");
  if (boxSizing === "content-box") {
    /* CSS content-box: width·height 는 안쪽 상자 크기. RN 은 항상 border-box 라 padding·border 를 더해 준다. */
    const horizontal = (style.paddingLeft ?? 0) + (style.paddingRight ?? 0) + (style.borderLeftWidth ?? 0) + (style.borderRightWidth ?? 0);
    const vertical = (style.paddingTop ?? 0) + (style.paddingBottom ?? 0) + (style.borderTopWidth ?? 0) + (style.borderBottomWidth ?? 0);
    for (const [name, extra] of [["width", horizontal], ["minWidth", horizontal], ["maxWidth", horizontal], ["height", vertical], ["minHeight", vertical], ["maxHeight", vertical]]) {
      if (style[name] === undefined || extra === 0) continue;
      if (typeof style[name] === "number") style[name] += extra;
      else notes.push({ property: name, reason: "content-box-non-numeric" });
    }
  }

  /* 이름이 정해진 무시 목록 외의 모르는 속성은 멈춘다. */
  const KNOWN = new Set([
    "display", "flex-direction", "flex-wrap", "align-items", "align-self", "align-content", "justify-content",
    "flex-grow", "flex-shrink", "flex-basis", "width", "height", "min-width", "min-height", "max-width", "max-height",
    "row-gap", "column-gap", "position", "top", "right", "bottom", "left", "z-index",
    "background-color", "box-shadow", "opacity", "color", "font-size", "font-weight", "line-height", "letter-spacing",
    "text-align", "text-decoration", "white-space", "text-overflow", "text-transform", "overflow-x", "overflow-y", "visibility",
    "pointer-events", "object-fit", "mask-image", "transform", "box-sizing", "background-image", "justify-items", "order", "grid-template-rows", "content"
  ]);
  for (const name of L.keys()) {
    if (KNOWN.has(name) || name.startsWith("padding-") || name.startsWith("margin-") || name.startsWith("border-")) continue;
    if (name.startsWith("--")) { note(name, "custom-property"); continue; }
    if (IGNORED.has(name)) { note(name, IGNORED.get(name)); continue; }
    if (name === "justify-items" || name === "order") throw new Error(`${where}: ${name} 은 아직 지원하지 않습니다.`);
    throw new Error(`${where}: 알 수 없는 CSS 속성 "${name}: ${L.get(name)}" — react-native-css.mjs 의 IGNORED(이유 포함) 또는 변환에 추가해야 합니다.`);
  }

  /* 무시한 선언 중 값이 의미를 바꾸는 것(소비한 것)은 note 에서 걸러 낸다 */
  for (const name of ["cursor", "transition", "appearance"]) if (L.has(name)) note(name, IGNORED.get(name));

  return style;
}

/**
 * background-image: linear-gradient(…)
 *   ① 같은 색 두 개 + no-repeat + 위치/크기 → "한 줄"(가로선): { line }
 *   ② 방향 + 색 멈춤점 여럿(color-mix 로 투명도를 준 것 포함) → "흐림": { gradient }
 */
function parseGradient(raw, converter, where) {
  const text = raw.trim();
  if (!text.startsWith("linear-gradient(")) throw new Error(`${where}: 그라디언트를 읽지 못했습니다 — ${raw}`);
  let depth = 0;
  let close = -1;
  for (let i = "linear-gradient".length; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") { depth -= 1; if (depth === 0) { close = i; break; } }
  }
  if (close === -1) throw new Error(`${where}: 그라디언트 괄호가 닫히지 않았습니다 — ${raw}`);
  const inner = splitCommas(text.slice("linear-gradient(".length, close)).map((one) => one.trim()).filter(Boolean);
  const rest = text.slice(close + 1).trim();
  const direction = /^to (top|bottom)$/.exec(inner[0]);

  if (!direction) {
    /* 한 줄: linear-gradient(c, c) no-repeat 50% 0 / calc(100% - 16px) 1px */
    const color = converter.color(inner[0], where);
    const sized = /\/\s*(.+)$/.exec(rest);
    if (!sized) throw new Error(`${where}: 선 크기를 읽지 못했습니다 — ${raw}`);
    const pieces = splitSpaces(sized[1]);
    const height = pieces[pieces.length - 1];
    const widthText = pieces.slice(0, -1).join(" ");
    const inset = /^calc\(\s*100%\s*-\s*(.+)\)$/.exec(widthText);
    const insetX = inset ? converter.length(inset[1], where) / 2 : widthText === "100%" ? 0 : null;
    if (insetX === null || typeof insetX !== "number") throw new Error(`${where}: 선 폭을 읽지 못했습니다 — ${widthText}`);
    return { kind: "line", color, insetX, height: converter.length(height, where) };
  }

  const stops = [];
  let base = null;
  for (const piece of inner.slice(1)) {
    const at = /\s+(-?[\d.]+)%$/.exec(piece);
    if (!at) throw new Error(`${where}: 멈춤점 위치를 읽지 못했습니다 — ${piece}`);
    const colorText = piece.slice(0, at.index).trim();
    let color;
    let alpha = 1;
    const mix = /^color-mix\(\s*in srgb\s*,\s*(var\([^)]+\))\s+([\d.]+)%\s*,\s*transparent\s*\)$/.exec(colorText);
    if (mix) { color = converter.color(mix[1], where); alpha = Number(mix[2]) / 100; }
    else if (colorText === "transparent") { color = null; alpha = 0; }
    else { color = converter.color(colorText, where); }
    if (color !== null && base === null) base = color;
    stops.push({ color, alpha, at: Number(at[1]) / 100 });
  }
  if (base === null) throw new Error(`${where}: 그라디언트에 색이 없습니다 — ${raw}`);
  /* 투명 멈춤점은 같은 색의 알파 0 으로 둔다(CSS 는 미리곱한 색으로 섞으므로 같은 결과다) */
  return { kind: "fade", to: direction[1], stops: stops.map((stop) => ({ color: stop.color ?? base, alpha: stop.alpha, at: stop.at })) };
}

const camelCase = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const cap = (value) => value[0].toUpperCase() + value.slice(1);
