/**
 * css-scope.mjs — 부품 CSS 의 「자손 부품 선택자」가 안에 끼워 넣은 다른 부품의 부분까지 먹지 않게 좁힌다.
 * --------------------------------------------------------------------------
 * 문제: `[data-s1-component="modal-content"][data-size="md"] [data-s1-part="panel"] { width:520px }` 처럼
 *   루트 뒤에 자손 결합자로 부분(data-s1-part)을 고르면, 그 안에 들어온 date-picker 의 `panel` 까지 같이 잡힌다.
 *   달력 팝업이 정본 폭(356/267) 대신 520px 로 열리는 식의 오염이다.
 * 해결: 부분을 고르는 자손형 선택자 끝에 「이 부품 루트와 이 요소 사이에 다른 부품이 끼어 있지 않을 것」을 붙인다.
 *   :where(:not([c=X] [c]:not([c=X]) *))
 *   - 안에 낀 다른 부품의 부분만 빠진다. X 가 다른 부품 안에 들어간 경우(바깥 조상)는 영향이 없다.
 *   - :where 라 명시도가 0 이다 — 다른 규칙과의 우선순위(덮어쓰기 순서)가 바뀌지 않는다.
 * 건드리지 않는 것: 루트 바로 아래만 고르는 `>` 사슬, 사이에 부품 선택자가 명시된 선택자(`X [c=checkbox] …`),
 *   @keyframes·@font-face 안, 부분을 고르지 않는 선택자.
 * 값(크기·색)은 한 글자도 바꾸지 않는다. 선택 범위만 좁힌다.
 */

const ATTR = "data-s1-component";

/** 문자열·괄호를 건너뛰며 최상위에서 끊는다. */
function splitTop(text, separator) {
  const pieces = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"' || ch === "'") { const close = text.indexOf(ch, i + 1); i = close === -1 ? text.length : close; continue; }
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;
    else if (ch === separator && depth === 0) { pieces.push(text.slice(start, i)); start = i + 1; }
  }
  pieces.push(text.slice(start));
  return pieces;
}

/** 선택자 하나를 (결합자, 복합부) 목록으로 나눈다. */
function tokenize(selector) {
  const tokens = [];
  let i = 0;
  let combinator = null;
  const n = selector.length;
  while (i < n) {
    let sawSpace = false;
    while (i < n && /\s/.test(selector[i])) { i += 1; sawSpace = true; }
    if (i >= n) break;
    if (">+~".includes(selector[i])) {
      combinator = selector[i];
      i += 1;
      while (i < n && /\s/.test(selector[i])) i += 1;
    } else if (tokens.length) {
      combinator = sawSpace ? " " : combinator;
    }
    let depth = 0;
    const start = i;
    for (; i < n; i += 1) {
      const ch = selector[i];
      if (ch === '"' || ch === "'") { const close = selector.indexOf(ch, i + 1); i = close === -1 ? n : close; continue; }
      if (ch === "(" || ch === "[") depth += 1;
      else if (ch === ")" || ch === "]") depth -= 1;
      else if (depth === 0 && (/\s/.test(ch) || ">+~".includes(ch))) break;
    }
    tokens.push({ combinator: tokens.length ? (combinator ?? " ") : null, compound: selector.slice(start, i) });
    combinator = null;
  }
  return tokens;
}

/** 복합부 끝(의사 요소 앞)에 붙일 자리. */
function insertionIndex(compound) {
  let depth = 0;
  for (let i = 0; i < compound.length; i += 1) {
    const ch = compound[i];
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;
    else if (ch === ":" && depth === 0 && compound[i + 1] === ":") return i;
  }
  return compound.length;
}

export function scopeSelector(selector, id, allowed = []) {
  const core = selector.trim();
  if (!core) return selector;
  const tokens = tokenize(core);
  const root = `[${ATTR}="${id}"]`;
  const rootIndex = tokens.findIndex(({ compound }) => compound.includes(root));
  const last = tokens.length - 1;
  if (rootIndex === -1 || last <= rootIndex) return selector;
  if (!tokens[last].compound.includes("[data-s1-part")) return selector;
  for (let k = rootIndex + 1; k <= last; k += 1) if (tokens[k].compound.includes(`[${ATTR}`)) return selector; // 사이(또는 대상)에 부품이 명시됨
  const onlyChild = tokens.slice(rootIndex + 1).every(({ combinator }) => combinator === ">");
  if (onlyChild) return selector;
  /* 이 부품이 설계상 품고 있는 코어 부품(manifest dependencies.coreComponents — 예: date-picker 모바일 시트의 bottom-sheet)은
     바깥 규칙이 안쪽 부분을 꾸미는 게 의도이므로 가로막지 않는다. 그 밖의 부품(퍼블리셔가 끼워 넣은 것)만 막는다. */
  const except = allowed.map((one) => `:not([${ATTR}="${one}"])`).join("");
  /* 부분은 가장 가까운 부품 루트에 속한다. 그래서 「X 안의 다른 부품 C 안」에 있는 부분만 막되,
     그 C 안에 다시 X 가 들어 있고 부분이 그 X 에 속하면(X > C > X' > 부분) 막지 않는다 —
     같은 종류 부품의 부분을 막으면 시트 안의 달력 안의 시트처럼 겹친 쓰임이 투명하게 깨진다. */
  const blocked = `${root} [${ATTR}]:not(${root})${except}`;
  const guard = `:where(:not(${blocked} *:not(${blocked} ${root} *)))`;
  const at = insertionIndex(tokens[last].compound);
  const rebuilt = tokens[last].compound.slice(0, at) + guard + tokens[last].compound.slice(at);
  // 원문 공백을 그대로 두기 위해 마지막 복합부만 바꿔 끼운다.
  const position = core.lastIndexOf(tokens[last].compound);
  const scoped = core.slice(0, position) + rebuilt + core.slice(position + tokens[last].compound.length);
  const lead = selector.match(/^\s*/)[0];
  const tail = selector.match(/\s*$/)[0];
  return lead + scoped + tail;
}

function scopePrelude(prelude, id, allowed) {
  const m = /^((?:\s|\/\*[\s\S]*?\*\/)*)([\s\S]*)$/.exec(prelude);
  const lead = m[1];
  const body = m[2];
  return lead + splitTop(body, ",").map((one) => scopeSelector(one, id, allowed)).join(",");
}

function findClose(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); i = e === -1 ? src.length : e + 1; continue; }
    if (ch === '"' || ch === "'") { const close = src.indexOf(ch, i + 1); i = close === -1 ? src.length : close; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) return i; }
  }
  return src.length - 1;
}

function scopeBlock(src, pos, id, allowed) {
  let out = "";
  while (pos < src.length) {
    const start = pos;
    let i = pos;
    let paren = 0;
    for (; i < src.length; i += 1) {
      const ch = src[i];
      if (ch === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); i = e === -1 ? src.length : e + 1; continue; }
      if (ch === '"' || ch === "'") { const close = src.indexOf(ch, i + 1); i = close === -1 ? src.length : close; continue; }
      if (ch === "(" || ch === "[") paren += 1;
      else if (ch === ")" || ch === "]") paren -= 1;
      else if (paren === 0 && (ch === "{" || ch === "}" || ch === ";")) break;
    }
    if (i >= src.length) { out += src.slice(start); pos = src.length; break; }
    const ch = src[i];
    if (ch === "}") { out += src.slice(start, i); return [out, i + 1]; }
    if (ch === ";") { out += src.slice(start, i + 1); pos = i + 1; continue; }
    const prelude = src.slice(start, i);
    const head = prelude.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const close = findClose(src, i);
    if (head.startsWith("@")) {
      if (/^@(media|supports|layer|container)\b/.test(head)) {
        const [inner] = scopeBlock(src.slice(0, close), i + 1, id, allowed);
        out += `${prelude}{${inner}}`;
      } else {
        out += src.slice(start, close + 1);
      }
    } else {
      out += scopePrelude(prelude, id, allowed) + src.slice(i, close + 1);
    }
    pos = close + 1;
  }
  return [out, pos];
}

export function scopeNestedParts(css, id, allowed = []) {
  return scopeBlock(css, 0, id, allowed)[0];
}

/** 안전띠(:where(:not(…)))를 걷어낸다. RN·Kotlin·React·Vue 생성기와 값 대조는 안전띠 없는 의미 그대로의 CSS 를 읽어야 한다. */
export function stripScopeGuard(css) {
  const mark = `:where(:not([${ATTR}="`;
  let out = "";
  let at = 0;
  for (;;) {
    const start = css.indexOf(mark, at);
    if (start === -1) { out += css.slice(at); return out; }
    out += css.slice(at, start);
    let depth = 0;
    let i = start + ":where".length;
    for (; i < css.length; i += 1) {
      if (css[i] === "(") depth += 1;
      else if (css[i] === ")") { depth -= 1; if (depth === 0) { i += 1; break; } }
    }
    at = i;
  }
}
