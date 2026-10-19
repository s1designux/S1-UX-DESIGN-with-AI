/**
 * react-native-model.mjs — 승인 예제 마크업 + 승인 CSS → "상태별 스타일 표"
 * --------------------------------------------------------------------------
 * 웹은 CSS 캐스케이드를 브라우저가 한다. RN 에는 그런 엔진이 없다. 그래서 빌드 때
 * css-model 로 캐스케이드를 **실제로 계산**해 요소마다 표를 만든다.
 *
 *   요소 E 의 스타일은 "어떤 상태에 있나" 의 함수다. 상태란 E 자신·조상·자손·형제의
 *   속성(aria-selected 등)과 상호작용(hover·pressed·focus·disabled·checked)이다.
 *   E 에 걸릴 수 있는 규칙을 선택자 단위로 따져, 규칙이 실제로 읽는 상태만 "차원"으로 뽑는다.
 *   그 차원들의 모든 조합을 css-model 로 계산해 표로 굳힌다 — 값은 한 자리도 손으로 적지 않는다.
 *
 * [이 파일이 하지 않는 것]
 *   - 값을 지어내지 않는다. CSS 가 답한 것만 표에 들어간다.
 *   - 읽지 못한 문법에서 멈춘다(react-native-css.mjs 의 Converter).
 */

import { computeStyleRanked, element, parseSelector, parseStylesheet, splitTopLevel } from "./css-model.mjs";
import { convertDeclarations } from "./react-native-css.mjs";

/* 런타임에 바뀌지 않는 속성 — 구조·종류를 가르는 것들. 나머지 속성은 전부 "바뀔 수 있는 상태"로 본다. */
const STATIC_ATTRIBUTES = new Set([
  /* 구조가 템플릿 한 벌마다 굳어 있는 속성만 — 목록의 칸마다 값이 달라질 수 있는 속성(data-align · data-depth · data-value …)은
     여기 두지 않는다(2026-10 독립 검증: data-align 을 고정으로 읽어 표의 가운데 정렬 칸이 왼쪽으로 그려졌다). */
  "data-s1-component", "data-s1-part", "role", "type", "data-selection",
  /* 화면 틀은 템플릿 한 벌마다 정해져 있다(breakName 이 고른다). 밀도·검수용 강제 상태는 RN 에 없다(웹 감싸개 전용). */
  "data-break", "data-s1-break", "data-s1-density", "data-force-state"
]);

const FORM_TAGS = new Set(["button", "input", "select", "textarea", "fieldset"]);
const POINTER_PSEUDOS = new Set(["hover", "active", "focus", "focus-within", "focus-visible"]);

export const stripUnsupportedAtRules = (css) => {
  /* @supports (text-box…) — 웹 전용 글자 상하 자르기. 블록 전체가 웹 전용이다. */
  let out = "";
  let index = 0;
  while (index < css.length) {
    const at = css.indexOf("@supports", index);
    if (at === -1) { out += css.slice(index); break; }
    const open = css.indexOf("{", at);
    let depth = 0;
    let end = open;
    for (; end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      else if (css[end] === "}") { depth -= 1; if (depth === 0) break; }
    }
    out += css.slice(index, at);
    index = end + 1;
  }
  return out;
};

/** 모든 컴포넌트 CSS 를 하나의 캐스케이드로 합친다(s1-ui.css 묶음과 같은 순서). */
export function combineStylesheets(componentOutputs) {
  const rules = [];
  let offset = 0;
  for (const { id, css } of componentOutputs) {
    const parsed = parseStylesheet(stripUnsupportedAtRules(css));
    for (const rule of parsed) rules.push({ ...rule, order: rule.order + offset, source: id });
    offset += parsed.length;
  }
  return rules;
}

/* ── 1. 템플릿 모델 ──────────────────────────────────────────────────── */

/**
 * HTML 파서 트리(react.mjs parseHtml) → css-model 요소 트리.
 * 각 요소에 key(n0, n1, …)를 붙인다. 다른 컴포넌트의 루트(중첩)는 잎으로 둔다 — 안쪽은 그 컴포넌트가 그린다.
 */
export function buildTemplate(instance, { id, wrapperAttributes, nestedOf }) {
  const nodes = new Map();      // key → 모델 요소
  const keys = new Map();       // 파서 노드 → key
  let counter = 0;

  const attributesOf = (parsed) => {
    const out = {};
    for (const [name, value] of parsed.attributes) out[name.toLowerCase()] = value === true ? "" : String(value);
    return out;
  };

  const build = (parsed, isRoot) => {
    const key = `n${counter}`;
    counter += 1;
    const attributes = attributesOf(parsed);
    const nested = nestedOf(parsed, isRoot);
    const model = element({ tag: parsed.tag, attributes });
    model.key = key;
    model.nested = nested;
    model.parsed = parsed;
    nodes.set(key, model);
    keys.set(parsed, key);
    if (!nested) {
      for (const child of parsed.children) {
        if (child.type !== "element") continue;
        const built = build(child, false);
        built.parent = model;
        model.children.push(built);
      }
    }
    return model;
  };

  const root = build(instance, true);

  /* 조상 쪽 문맥 — 테마·화면 감싸개(data-theme / data-s1-break). 소비 앱이 정하는 값이다. */
  const wrapper = element({ tag: "div", attributes: { ...wrapperAttributes } });
  wrapper.key = "w";
  wrapper.nested = null;
  root.parent = wrapper;
  wrapper.children.push(root);
  nodes.set("w", wrapper);

  return { id, root, wrapper, nodes, keys };
}

/* ── 2. 의존성 탐색 — 어떤 상태를 읽는 규칙이 이 요소에 걸릴 수 있나 ── */

/**
 * 한 복합선택자를 노드에 대 본다. 정적으로 틀리면 null, 아니면 읽는 상태 목록(dep[]).
 * dep = { kind: "a"|"p"|"pos", node, name }
 */
function testCompound(node, compound, context) {
  if (compound.tag && compound.tag !== "*" && compound.tag !== node.tag) return null;
  const deps = [];
  for (const attribute of compound.attributes) {
    const actual = node.attributes[attribute.name];
    /* 루트의 variant·size 축 속성은 구조 속성 이름과 같아도(divider 의 data-axis) 쓰는 쪽이 바꾼다. */
    if (STATIC_ATTRIBUTES.has(attribute.name) && !(node.key === "n0" && context.axis?.has(attribute.name))) {
      if (!attributeMatches(actual, attribute)) return null;
      continue;
    }
    deps.push({ kind: "a", node, name: attribute.name, attribute });
  }
  for (const pseudo of compound.pseudoClasses) {
    const result = testPseudo(node, pseudo, context);
    if (result === null) return null;
    deps.push(...result);
  }
  if (compound.pseudoElement !== (context.pseudoElement ?? null)) return null;
  return deps;
}

function attributeMatches(actual, attribute) {
  if (actual === undefined) return false;
  if (attribute.operator === null) return true;
  if (attribute.operator === "=") return actual === attribute.value;
  if (attribute.operator === "^=") return actual.startsWith(attribute.value);
  throw new Error(`지원하지 않는 속성 연산자: ${attribute.operator}`);
}

function testPseudo(node, pseudo, context) {
  const { name, args } = pseudo;
  if (POINTER_PSEUDOS.has(name)) return [{ kind: "p", node, name }];
  if (name === "disabled") return FORM_TAGS.has(node.tag) ? [{ kind: "p", node, name }] : null;
  if (name === "checked") return node.tag === "input" && ["checkbox", "radio"].includes(node.attributes.type) ? [{ kind: "p", node, name }] : null;
  if (name === "empty") return [{ kind: "p", node, name }];
  if (name === "first-child" || name === "last-child") {
    const siblings = node.parent ? node.parent.children : [node];
    const part = node.attributes["data-s1-part"];
    const inGroup = part !== undefined && siblings.filter((one) => one.attributes["data-s1-part"] === part).length > 1;
    if (inGroup) return [{ kind: "pos", node, name }];
    const hit = name === "first-child" ? siblings[0] === node : siblings[siblings.length - 1] === node;
    return hit ? [] : null;
  }
  if (name === "not") {
    const inner = splitTopLevel(args, ",").map((one) => matchComplex(node, one.trim(), context));
    /* :not(a, b) = a 도 b 도 아니다. 하나라도 정적으로 반드시 맞으면 항상 거짓. */
    const deps = [];
    for (const result of inner) {
      if (result === null) continue;
      if (result.length === 0) return null;
      deps.push(...result);
    }
    return deps;
  }
  if (name === "is" || name === "where") {
    const deps = [];
    let any = false;
    for (const one of splitTopLevel(args, ",")) {
      const result = matchComplex(node, one.trim(), context);
      if (result === null) continue;
      any = true;
      deps.push(...result);
    }
    return any ? deps : null;
  }
  if (name === "has") {
    const deps = [];
    let any = false;
    for (const one of splitTopLevel(args, ",")) {
      const relative = one.trim();
      if (relative.startsWith("+")) {
        const sequence = parseSelector(relative.slice(1).trim());
        const siblings = node.parent ? node.parent.children : [];
        const next = siblings[siblings.indexOf(node) + 1];
        if (!next) continue;
        const result = matchSequence(next, sequence, sequence.length - 1, { ...context, pseudoElement: null });
        if (result === null) continue;
        any = true; deps.push(...result);
        continue;
      }
      const sequence = parseSelector(relative);
      for (const descendant of descendantsOf(node)) {
        const result = matchSequence(descendant, sequence, sequence.length - 1, { ...context, pseudoElement: null, within: node });
        if (result === null) continue;
        any = true; deps.push(...result);
      }
    }
    return any ? deps : null;
  }
  throw new Error(`지원하지 않는 가상 클래스: :${name}`);
}

function descendantsOf(node) {
  const out = [];
  const walk = (current) => { for (const child of current.children) { out.push(child); walk(child); } };
  walk(node);
  return out;
}

function matchComplex(node, selector, context) {
  const sequence = parseSelector(selector);
  return matchSequence(node, sequence, sequence.length - 1, { ...context, pseudoElement: null });
}

/** 오른쪽 끝에서 왼쪽으로, 되돌아가기를 하며 맞춘다. 성공하면 모든 경로의 의존성을 합쳐 돌려준다. */
function matchSequence(node, sequence, index, context) {
  const own = testCompound(node, sequence[index].compound, index === sequence.length - 1 ? context : { ...context, pseudoElement: null });
  if (own === null) return null;
  if (index === 0) return own;
  const relation = sequence[index].combinator;
  const candidates = [];
  if (relation === "descendant") {
    let ancestor = node.parent;
    while (ancestor) { candidates.push(ancestor); ancestor = ancestor.parent; }
  } else if (relation === "child") {
    if (node.parent) candidates.push(node.parent);
  } else if (relation === "adjacent" || relation === "sibling") {
    const siblings = node.parent ? node.parent.children : [];
    const at = siblings.indexOf(node);
    if (relation === "adjacent") { if (at > 0) candidates.push(siblings[at - 1]); }
    else for (let i = 0; i < at; i += 1) candidates.push(siblings[i]);
  } else throw new Error(`지원하지 않는 결합자: ${relation}`);

  let merged = null;
  for (const candidate of candidates) {
    const result = matchSequence(candidate, sequence, index - 1, { ...context, pseudoElement: null });
    if (result === null) continue;
    merged = (merged ?? []).concat(result);
  }
  return merged === null ? null : own.concat(merged);
}

/** 요소(또는 가상요소)에 걸릴 수 있는 규칙과, 그 규칙들이 읽는 상태. */
export function probe(node, rules, pseudoElement, mediaActive, axis) {
  const candidates = [];
  const deps = [];
  for (const rule of rules) {
    if (rule.media && !mediaActive(rule.media)) continue;
    let matched = false;
    for (const selector of rule.selectors) {
      const sequence = rule._parsed?.get(selector) ?? parseSelector(selector);
      if (!rule._parsed) rule._parsed = new Map();
      rule._parsed.set(selector, sequence);
      const result = matchSequence(node, sequence, sequence.length - 1, { pseudoElement, axis });
      if (result === null) continue;
      matched = true;
      deps.push(...result);
    }
    if (matched) candidates.push(rule);
  }
  return { candidates, deps };
}

/* ── 3. 차원(dimension) ──────────────────────────────────────────────── */

const ABSENT = "∅";   // 속성이 없다
const OTHER = "•";    // 속성이 있지만 선택자가 구분하지 않는 값

/**
 * 차원 후보에 값 영역(domain)을 붙인다.
 *   속성: 이 요소에 걸린 선택자가 구분하는 값 + 템플릿에 적힌 값 + (축 속성이면) manifest 가 허용하는 값 + ∅ + •
 *   상호작용: 0 | 1
 * 축 속성(루트의 variant·size 등)은 쓰는 쪽이 항상 값을 주므로 ∅·• 를 만들지 않는다 — 표가 헛되이 커지지 않게.
 */
function domainOf(dim, { axisValues }) {
  if (dim.kind === "p" || dim.kind === "pos") return [0, 1];
  const set = new Set();
  const axis = dim.node.key === "n0" ? axisValues.get(dim.name) : undefined;
  for (const attribute of dim.tests) {
    if (attribute.operator === "=") set.add(attribute.value);
  }
  const own = dim.node.attributes[dim.name];
  if (own !== undefined && own !== "") set.add(own);
  if (axis && axis.length > 0) for (const value of axis) set.add(value);
  const prefixed = dim.tests.some((attribute) => attribute.operator === "^=");
  if (prefixed) for (const value of axisValues.get(dim.name) ?? []) set.add(value);
  const closedAxis = dim.node.key === "n0" && axis && axis.length > 0 && own !== undefined;
  if (!closedAxis) { set.add(ABSENT); set.add(OTHER); }
  return [...set].sort((a, b) => (a === ABSENT ? -1 : b === ABSENT ? 1 : a === OTHER ? -1 : b === OTHER ? 1 : a.localeCompare(b)));
}

const dimKey = (dep) => `${dep.node.key}:${dep.kind}:${dep.name}`;

/** 중복 제거한 차원 목록(결정적 순서). */
function uniqueDims(deps, context) {
  const byKey = new Map();
  for (const dep of deps) {
    const key = dimKey(dep);
    if (!byKey.has(key)) byKey.set(key, { kind: dep.kind, node: dep.node, name: dep.name, key, tests: [] });
    if (dep.attribute) byKey.get(key).tests.push(dep.attribute);
  }
  const orderOf = (node) => (node.key === "w" ? -1 : Number(node.key.slice(1)));
  return [...byKey.values()]
    .sort((a, b) => orderOf(a.node) - orderOf(b.node) || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
    .map((dim) => ({ ...dim, domain: domainOf(dim, context) }));
}

function applyAssignment(dim, value) {
  const { node, kind, name } = dim;
  if (kind === "a") {
    if (value === ABSENT) delete node.attributes[name];
    else node.attributes[name] = value === OTHER ? "__other__" : value;
  } else if (kind === "p") {
    if (value) node.states.add(name); else node.states.delete(name);
  } else {
    node.positional = node.positional ?? { first: true, last: true };
    node.positional[name === "first-child" ? "first" : "last"] = Boolean(value);
  }
}

/** 차원 값들의 조합을 돌며 callback 을 부른다. 원래 상태는 끝나면 복구한다. */
function enumerate(dims, callback) {
  const saved = dims.map((dim) => ({
    dim,
    attribute: dim.node.attributes[dim.name],
    had: Object.hasOwn(dim.node.attributes, dim.name),
    state: dim.node.states.has(dim.name),
    positional: dim.node.positional ? { ...dim.node.positional } : undefined
  }));
  const counters = dims.map(() => 0);
  const total = dims.reduce((product, dim) => product * dim.domain.length, 1);
  for (let step = 0; step < total; step += 1) {
    const values = counters.map((position, index) => dims[index].domain[position]);
    dims.forEach((dim, index) => applyAssignment(dim, values[index]));
    callback(values);
    for (let index = dims.length - 1; index >= 0; index -= 1) {
      counters[index] += 1;
      if (counters[index] < dims[index].domain.length) break;
      counters[index] = 0;
    }
  }
  for (const entry of saved) {
    const { dim } = entry;
    if (entry.had) dim.node.attributes[dim.name] = entry.attribute; else delete dim.node.attributes[dim.name];
    if (entry.state) dim.node.states.add(dim.name); else dim.node.states.delete(dim.name);
    dim.node.positional = entry.positional;
  }
  return total;
}

/* ── 4. 표 만들기 ────────────────────────────────────────────────────── */

export const mediaActive = (condition) => {
  if (/prefers-reduced-motion/.test(condition)) return false;
  if (/hover:\s*hover/.test(condition)) return true;
  /* 화면 폭 조건(Footer PC 의 768 미만 모바일 전환 — river D-3)은 웹 전용이다. 앱은 data-platform="mobile" 을 직접 고른다. */
  if (/\((max|min)-width:/.test(condition)) return false;
  throw new Error(`알 수 없는 @media 조건: ${condition}`);
};

/* ── 사용자 지정 속성(--s1-*) ─────────────────────────────────────────
   부품 CSS 는 소비자가 값을 줄 수 있는 손잡이를 사용자 지정 속성으로 열어 둔다
   (--s1-bottom-sheet-gap · --s1-mobile-nav-icon · --s1-icon …). 사용자 지정 속성은 **상속**되므로
   값은 요소 자신 또는 가장 가까운 조상의 선언에서 온다. 그 조상의 상태(variant 등)도 값을 바꾼다. */

/** var(--s1-x[, 대체값]) 를 값으로 바꾼다. 선언이 없고 대체값도 없으면 null(= 그 선언 전체가 무효). */
export function substituteVars(value, lookup, depth = 0) {
  if (depth > 8) return null;
  let out = "";
  let index = 0;
  while (index < value.length) {
    const at = value.indexOf("var(", index);
    if (at === -1) { out += value.slice(index); break; }
    let level = 0;
    let end = at + 3;
    for (; end < value.length; end += 1) {
      if (value[end] === "(") level += 1;
      else if (value[end] === ")") { level -= 1; if (level === 0) break; }
    }
    const inner = value.slice(at + 4, end);
    const comma = inner.indexOf(",");
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? undefined : inner.slice(comma + 1).trim();
    out += value.slice(index, at);
    if (!name.startsWith("--s1-")) { out += value.slice(at, end + 1); index = end + 1; continue; }
    let resolved = lookup(name);
    if (resolved !== undefined && resolved !== null) resolved = substituteVars(resolved, lookup, depth + 1);
    if (resolved === undefined || resolved === null || resolved === "initial") {
      if (fallback === undefined) return null;
      resolved = substituteVars(fallback, lookup, depth + 1);
      if (resolved === null) return null;
    }
    out += resolved;
    index = end + 1;
  }
  return out;
}

const customNamesIn = (rules) => {
  const names = new Set();
  for (const rule of rules) for (const declaration of rule.declarations) {
    for (const match of declaration.value.matchAll(/var\(\s*(--s1-[a-z0-9-]+)/g)) names.add(match[1]);
  }
  return names;
};

/**
 * 후보 규칙을 좁히지 않고 **모든 규칙**으로 한 요소의 스타일을 계산한다 — 대조 검사(react-native-parity-check)가
 * 표 생성(buildTables, probe 로 좁힌 규칙)과 다른 길로 같은 값을 얻는지 확인하는 데 쓴다.
 */
export function evaluateFull(node, pseudoElement, { rules, converter, notes = [] }) {
  const own = node.nested ? rules.filter((rule) => rule.source !== node.nested) : rules;
  let ranked = computeStyleRanked(node, own, { pseudoElement, mediaActive });
  if (ranked.some((entry) => entry.value.includes("--s1-"))) {
    const lookup = (name) => {
      for (let current = node; current; current = current.parent) {
        const hits = computeStyleRanked(current, own, { mediaActive }).filter((entry) => entry.property === name);
        if (hits.length > 0) return hits[hits.length - 1].value;
      }
      return undefined;
    };
    const kept = [];
    for (const entry of ranked) {
      if (!entry.value.includes("--s1-") || entry.property.startsWith("--")) { kept.push(entry); continue; }
      const value = substituteVars(entry.value, lookup);
      if (value === null) continue;
      kept.push({ ...entry, value });
    }
    ranked = kept;
  }
  return convertDeclarations(ranked, { converter, where: "parity", tag: node.tag, notes });
}

/**
 * 템플릿 한 벌의 요소들에 대해 표를 만든다.
 *   targets: [{ key, pseudoElement }] — 표가 필요한 요소(가상요소 포함)
 * 반환: { styles[], tables: { "n3" | "n3::before": { dims, map|style } }, notes, stats }
 */
export function buildTables(template, targets, { rules, converter, axisValues, where }) {
  const styles = [];
  const styleIndex = new Map();
  const tables = {};
  const notes = [];
  const intern = (style) => {
    const text = JSON.stringify(style);
    if (!styleIndex.has(text)) { styleIndex.set(text, styles.length); styles.push(style); }
    return styleIndex.get(text);
  };

  let evaluated = 0;
  for (const { key, pseudoElement } of targets) {
    const node = template.nodes.get(key);
    const label = `${where} ${key}${pseudoElement ? `::${pseudoElement}` : ""}<${node.tag}${node.attributes["data-s1-part"] ? ` ${node.attributes["data-s1-part"]}` : ""}>`;
    /* 안에 들어간 부품(중첩)의 루트는 그 부품 자신의 CSS 로 자기 표를 가진다 — 여기서는 **바깥 부품이 이 자리에 주는 값**만 계산한다. */
    const ownRules = node.nested ? rules.filter((rule) => rule.source !== node.nested) : rules;
    const { candidates, deps } = probe(node, ownRules, pseudoElement, mediaActive, axisValues);

    /* 사용자 지정 속성이 걸리면 요소 자신과 조상의 선언도 함께 읽는다. */
    const names = customNamesIn(candidates);
    const customChain = [];
    if (names.size > 0) {
      const declaring = ownRules.filter((rule) => rule.declarations.some((declaration) => names.has(declaration.property)));
      for (let current = node; current; current = current.parent) {
        const result = probe(current, declaring, null, mediaActive, axisValues);
        if (result.candidates.length === 0) continue;
        customChain.push({ node: current, rules: result.candidates });
        deps.push(...result.deps);
      }
    }

    const dims = uniqueDims(deps, { axisValues });
    const map = {};
    const unique = new Set();
    evaluated += enumerate(dims, (values) => {
      let ranked = computeStyleRanked(node, candidates, { pseudoElement, mediaActive });
      if (names.size > 0) {
        const lookup = (name) => {
          for (const link of customChain) {
            const hits = computeStyleRanked(link.node, link.rules, { mediaActive }).filter((entry) => entry.property === name);
            if (hits.length > 0) return hits[hits.length - 1].value;
          }
          return undefined;
        };
        const kept = [];
        for (const entry of ranked) {
          if (!entry.value.includes("--s1-") || entry.property.startsWith("--")) { kept.push(entry); continue; }
          const value = substituteVars(entry.value, lookup);
          if (value === null) { notes.push({ property: entry.property, reason: "consumer-provided" }); continue; }
          kept.push({ ...entry, value });
        }
        ranked = kept;
      }
      /* 요소 자신이 hidden 인데 CSS 가 display 를 정하지 않았으면 브라우저 기본값(display:none)이 적용된다. */
      const style = convertDeclarations(ranked, { converter, where: label, tag: node.tag, notes });
      const index = intern(style);
      unique.add(index);
      map[values.join("|")] = index;
    });
    const dimSpecs = dims.map((dim) => ({ n: dim.node.key, [dim.kind]: dim.name, d: dim.kind === "a" ? dim.domain : undefined }));
    const tableKey = pseudoElement ? `${key}::${pseudoElement}` : key;
    if (unique.size === 1) tables[tableKey] = { s: [...unique][0] };
    else tables[tableKey] = { dims: dimSpecs, map };
  }
  return { styles, tables, notes, evaluated };
}

export { ABSENT, OTHER };
export { STATIC_ATTRIBUTES };
