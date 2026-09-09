/**
 * css-model.mjs — 승인된 컴포넌트 CSS 를 "질의할 수 있는 모델"로 바꾼다.
 * --------------------------------------------------------------------------
 * 왜 필요한가: 네이티브(Compose)는 웹 CSS 를 실행할 수 없다. 그렇다고 값을 사람이
 * 옮겨 적으면 배포본과 조용히 어긋난다. 그래서 CSS 를 실제 캐스케이드 규칙대로
 * 계산해, "이 부품이 이 상태일 때 최종 값이 무엇인가"를 기계가 답하게 한다.
 *
 * [이 파일이 하지 않는 것]
 *   - 값을 지어내지 않는다. CSS 에 없는 속성은 undefined 로 남는다.
 *   - var(--token) 을 숫자로 풀지 않는다. 토큰 이름을 그대로 들고 나가야
 *     생성물이 S1Tokens 를 참조할 수 있다.
 *
 * 지원 범위는 배포본 CSS 가 실제로 쓰는 문법으로 한정한다. 범위를 벗어난 선택자를
 * 만나면 조용히 무시하지 않고 예외로 멈춘다 — 조용한 누락이 가장 위험하다.
 */

/* ── 1. 스타일시트 파싱 ──────────────────────────────────────────────── */

/** @media 블록을 펼쳐 평평한 규칙 목록으로 만든다. 규칙 순서는 원문 순서를 지킨다. */
export function parseStylesheet(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  let index = 0;
  let order = 0;

  const readBlock = (start) => {
    let depth = 0;
    for (let i = start; i < source.length; i += 1) {
      if (source[i] === "{") depth += 1;
      else if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
    throw new Error("CSS 블록이 닫히지 않았습니다.");
  };

  const consume = (text, offset, media) => {
    let cursor = 0;
    while (cursor < text.length) {
      const brace = text.indexOf("{", cursor);
      if (brace === -1) break;
      const prelude = text.slice(cursor, brace).trim();
      const end = readBlock(offset + brace) - offset;
      const body = text.slice(brace + 1, end);
      if (prelude.startsWith("@media")) {
        consume(body, offset + brace + 1, prelude.replace(/^@media\s*/, "").trim());
      } else if (prelude.startsWith("@")) {
        /* @keyframes 등 — 배포본 컴포넌트 CSS 에는 없다. 있으면 알린다. */
        throw new Error(`지원하지 않는 at-rule: ${prelude}`);
      } else if (prelude.length > 0) {
        rules.push({
          media,
          selectors: splitTopLevel(prelude, ",").map((one) => one.trim()).filter(Boolean),
          declarations: parseDeclarations(body),
          order: order++
        });
      }
      cursor = end + 1;
    }
  };

  consume(source, index, null);
  return rules;
}

/** 괄호 안의 구분자는 건너뛰고 최상위에서만 나눈다. `:is(a, b)` 를 쪼개지 않기 위함. */
export function splitTopLevel(text, separator) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth -= 1;
    else if (char === separator && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }
  out.push(text.slice(start));
  return out;
}

function parseDeclarations(body) {
  const declarations = [];
  for (const piece of splitTopLevel(body, ";")) {
    const text = piece.trim();
    if (!text) continue;
    const colon = text.indexOf(":");
    if (colon === -1) continue;
    declarations.push({
      property: text.slice(0, colon).trim().toLowerCase(),
      value: text.slice(colon + 1).trim()
    });
  }
  return declarations;
}

/* ── 2. 선택자 파싱 ──────────────────────────────────────────────────── */

const COMBINATORS = new Set([" ", ">", "+", "~"]);

/** `a b > c` → [{combinator, compound}, ...] (왼쪽부터) */
export function parseSelector(selector) {
  const sequence = [];
  let buffer = "";
  let depth = 0;
  let pendingCombinator = null;

  const flush = () => {
    const text = buffer.trim();
    buffer = "";
    if (!text) return;
    sequence.push({ combinator: pendingCombinator ?? "descendant", compound: parseCompound(text) });
    pendingCombinator = null;
  };

  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i];
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth -= 1;
    if (depth === 0 && COMBINATORS.has(char)) {
      if (char === " ") {
        if (buffer.trim()) { flush(); pendingCombinator = "descendant"; }
        continue;
      }
      flush();
      pendingCombinator = char === ">" ? "child" : char === "+" ? "adjacent" : "sibling";
      continue;
    }
    buffer += char;
  }
  flush();
  if (sequence.length > 0) sequence[0].combinator = "start";
  return sequence;
}

const PSEUDO_CLASSES = new Set([
  "hover", "active", "focus", "focus-within", "focus-visible",
  "disabled", "checked", "not", "is", "has", "first-child", "last-child"
]);
const PSEUDO_ELEMENTS = new Set(["before", "after", "placeholder"]);

export function parseCompound(text) {
  const compound = { tag: null, attributes: [], pseudoClasses: [], pseudoElement: null };
  let cursor = 0;
  while (cursor < text.length) {
    const char = text[cursor];
    if (char === "[") {
      const close = text.indexOf("]", cursor);
      if (close === -1) throw new Error(`속성 선택자가 닫히지 않았습니다: ${text}`);
      compound.attributes.push(parseAttribute(text.slice(cursor + 1, close)));
      cursor = close + 1;
      continue;
    }
    if (char === ":") {
      const isElement = text[cursor + 1] === ":";
      let start = cursor + (isElement ? 2 : 1);
      let end = start;
      while (end < text.length && /[a-z-]/i.test(text[end])) end += 1;
      const name = text.slice(start, end);
      let args = null;
      if (text[end] === "(") {
        let depth = 0;
        let i = end;
        for (; i < text.length; i += 1) {
          if (text[i] === "(") depth += 1;
          else if (text[i] === ")") { depth -= 1; if (depth === 0) break; }
        }
        args = text.slice(end + 1, i);
        end = i + 1;
      }
      if (isElement || PSEUDO_ELEMENTS.has(name)) {
        compound.pseudoElement = name;
      } else {
        if (!PSEUDO_CLASSES.has(name)) throw new Error(`지원하지 않는 가상 클래스: :${name} (${text})`);
        compound.pseudoClasses.push({ name, args });
      }
      cursor = end;
      continue;
    }
    if (char === "*") { compound.tag = "*"; cursor += 1; continue; }
    let end = cursor;
    while (end < text.length && /[a-z0-9-]/i.test(text[end])) end += 1;
    if (end === cursor) throw new Error(`알 수 없는 선택자 조각: ${text.slice(cursor)} (${text})`);
    compound.tag = text.slice(cursor, end).toLowerCase();
    cursor = end;
  }
  return compound;
}

function parseAttribute(text) {
  const match = /^([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*([~^$*|]?=)\s*("([^"]*)"|'([^']*)'|([^\]]*)))?$/.exec(text.trim());
  if (!match) throw new Error(`속성 선택자를 읽지 못했습니다: [${text}]`);
  const value = match[4] ?? match[5] ?? match[6];
  return { name: match[1], operator: match[2] ?? null, value: value === undefined ? null : value };
}

/* ── 3. 요소 모델 ────────────────────────────────────────────────────── */

/** 검사용 요소 하나. attributes 는 문자열 맵, states 는 :hover 같은 활성 상태 집합. */
export function element({ tag = "div", attributes = {}, states = [], children = [], pseudoElements = [] }) {
  const node = {
    tag,
    attributes: { ...attributes },
    states: new Set(states),
    children: [],
    pseudoElements: new Set(pseudoElements),
    parent: null
  };
  for (const child of children) {
    child.parent = node;
    node.children.push(child);
  }
  return node;
}

export function descendants(node) {
  const out = [];
  const walk = (current) => {
    for (const child of current.children) { out.push(child); walk(child); }
  };
  walk(node);
  return out;
}

/* ── 4. 매칭 ─────────────────────────────────────────────────────────── */

function matchesAttribute(node, attribute) {
  const actual = node.attributes[attribute.name];
  if (actual === undefined) return false;
  if (attribute.operator === null) return true;
  if (attribute.operator === "=") return actual === attribute.value;
  throw new Error(`지원하지 않는 속성 연산자: ${attribute.operator}`);
}

export function matchesCompound(node, compound, options = {}) {
  if (compound.tag && compound.tag !== "*" && compound.tag !== node.tag) return false;
  for (const attribute of compound.attributes) {
    if (!matchesAttribute(node, attribute)) return false;
  }
  for (const pseudo of compound.pseudoClasses) {
    if (!matchesPseudoClass(node, pseudo, options)) return false;
  }
  if (compound.pseudoElement) {
    if (!options.pseudoElement || options.pseudoElement !== compound.pseudoElement) return false;
  } else if (options.pseudoElement) {
    return false;
  }
  return true;
}

function matchesPseudoClass(node, pseudo, options) {
  switch (pseudo.name) {
    case "hover": case "active": case "focus": case "focus-within":
    case "focus-visible": case "disabled": case "checked":
      return node.states.has(pseudo.name);
    case "first-child":
      return node.parent ? node.parent.children[0] === node : true;
    case "last-child":
      return node.parent ? node.parent.children[node.parent.children.length - 1] === node : true;
    case "not":
      return splitTopLevel(pseudo.args, ",").every((one) => !matchesRelative(node, one.trim(), options));
    case "is":
      return splitTopLevel(pseudo.args, ",").some((one) => matchesRelative(node, one.trim(), options));
    case "has":
      return splitTopLevel(pseudo.args, ",").some((one) => matchesHas(node, one.trim(), options));
    default:
      throw new Error(`지원하지 않는 가상 클래스: :${pseudo.name}`);
  }
}

/** :not()/:is() 안은 이 요소 자신에 대한 복합 선택자다(자손 결합자는 배포본에 없다). */
function matchesRelative(node, selector, options) {
  const sequence = parseSelector(selector);
  if (sequence.length !== 1) throw new Error(`:not()/:is() 안에서는 복합 선택자 하나만 지원합니다: ${selector}`);
  return matchesCompound(node, sequence[0].compound, { ...options, pseudoElement: options.pseudoElement });
}

/** :has() — 자손형과 바로 뒤 형제형(`+ x`) 둘 다 배포본에서 쓴다. */
function matchesHas(node, selector, options) {
  const relative = selector.trim();
  if (relative.startsWith("+")) {
    const sequence = parseSelector(relative.slice(1).trim());
    const siblings = node.parent ? node.parent.children : [];
    const index = siblings.indexOf(node);
    const next = index === -1 ? undefined : siblings[index + 1];
    return Boolean(next) && matchesCompound(next, sequence[sequence.length - 1].compound, {});
  }
  const sequence = parseSelector(relative);
  if (sequence.length !== 1) throw new Error(`:has() 안에서는 복합 선택자 하나만 지원합니다: ${selector}`);
  return descendants(node).some((child) => matchesCompound(child, sequence[0].compound, {}));
}

/** 오른쪽 끝 복합부터 왼쪽으로 거슬러 맞춘다(브라우저와 같은 방향). */
export function matchesSelector(node, sequence, options = {}) {
  const last = sequence[sequence.length - 1];
  if (!matchesCompound(node, last.compound, options)) return false;

  let current = node;
  for (let i = sequence.length - 2; i >= 0; i -= 1) {
    const step = sequence[i];
    const relation = sequence[i + 1].combinator;
    if (relation === "descendant") {
      let ancestor = current.parent;
      let found = null;
      while (ancestor) {
        if (matchesCompound(ancestor, step.compound, {})) { found = ancestor; break; }
        ancestor = ancestor.parent;
      }
      if (!found) return false;
      current = found;
      continue;
    }
    if (relation === "child") {
      if (!current.parent || !matchesCompound(current.parent, step.compound, {})) return false;
      current = current.parent;
      continue;
    }
    if (relation === "adjacent") {
      const siblings = current.parent ? current.parent.children : [];
      const previous = siblings[siblings.indexOf(current) - 1];
      if (!previous || !matchesCompound(previous, step.compound, {})) return false;
      current = previous;
      continue;
    }
    throw new Error(`지원하지 않는 결합자: ${relation}`);
  }
  return true;
}

/* ── 5. 명시도와 캐스케이드 ─────────────────────────────────────────── */

export function specificity(sequence) {
  let b = 0;
  let c = 0;
  for (const { compound } of sequence) {
    b += compound.attributes.length;
    for (const pseudo of compound.pseudoClasses) {
      if (pseudo.name === "not" || pseudo.name === "is" || pseudo.name === "has") {
        const inner = splitTopLevel(pseudo.args, ",").map((one) => specificity(parseSelector(one.replace(/^\s*\+/, "").trim())));
        const best = inner.sort((x, y) => y[0] - x[0] || y[1] - x[1])[0] ?? [0, 0];
        b += best[0];
        c += best[1];
      } else {
        b += 1;
      }
    }
    if (compound.tag && compound.tag !== "*") c += 1;
    if (compound.pseudoElement) c += 1;
  }
  return [b, c];
}

/**
 * 한 요소의 최종 선언을 계산한다.
 * mediaActive(condition) 가 false 인 @media 규칙은 건너뛴다.
 * 소비된 규칙은 usage 집합에 기록해, 아무도 쓰지 않은 선언을 나중에 드러낸다.
 */
export function computeStyle(node, rules, { pseudoElement = null, mediaActive = () => true, usage = null } = {}) {
  const winners = new Map();
  for (const rule of rules) {
    if (rule.media && !mediaActive(rule.media)) continue;
    for (const selector of rule.selectors) {
      const sequence = rule._parsed?.get(selector) ?? parseSelector(selector);
      if (!rule._parsed) rule._parsed = new Map();
      rule._parsed.set(selector, sequence);
      if (!matchesSelector(node, sequence, { pseudoElement })) continue;
      const [b, c] = specificity(sequence);
      for (const declaration of rule.declarations) {
        const previous = winners.get(declaration.property);
        const rank = [b, c, rule.order];
        if (previous && !outranks(rank, previous.rank)) continue;
        winners.set(declaration.property, { value: declaration.value, rank, rule, selector });
      }
      if (usage) {
        for (const declaration of rule.declarations) usage.add(`${rule.order}|${declaration.property}`);
      }
    }
  }
  const style = {};
  for (const [property, entry] of winners) style[property] = entry.value;
  return style;
}

function outranks(rank, previous) {
  for (let i = 0; i < rank.length; i += 1) {
    if (rank[i] !== previous[i]) return rank[i] > previous[i];
  }
  return true;
}

/** 어느 질의에서도 쓰이지 않은 선언 — "생성기가 조용히 빠뜨린 것"을 드러낸다. */
export function unusedDeclarations(rules, usage) {
  const out = [];
  for (const rule of rules) {
    for (const declaration of rule.declarations) {
      if (usage.has(`${rule.order}|${declaration.property}`)) continue;
      out.push({
        selector: rule.selectors.join(", "),
        media: rule.media,
        property: declaration.property,
        value: declaration.value
      });
    }
  }
  return out;
}
