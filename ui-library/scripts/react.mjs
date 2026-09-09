/**
 * react.mjs — 승인된 배포본 → 진짜 React 컴포넌트 생성기
 * --------------------------------------------------------------------------
 * 이전 세대(껍데기)는 승인 마크업 문자열을 innerHTML 로 꽂았다. 그래서
 *   ① 서버 렌더링에서 빈 화면 ② 표·목록에 데이터를 넣을 통로 없음
 *   ③ 자식(아이콘·요소)을 못 넣음 ④ 예제의 id 가 그대로 박혀 중복
 * 이 네 가지가 구조적으로 막혀 있었다.
 *
 * 이 생성기는 같은 승인 마크업을 **JSX 트리로 옮겨** 위 네 가지를 연다.
 * 마크업을 새로 쓰지 않는다 — 옮기기만 한다. 값·구조·속성은 예제 그대로다.
 *
 * 규칙(전부 기계적이며 지어내지 않는다):
 *   - data-s1-part="X" 요소 = 슬롯. 내용과 속성을 밖에서 갈아끼울 수 있다.
 *   - 같은 부모 안에 같은 part 가 2개 이상 = 반복 목록. 첫 항목이 틀이 되고,
 *     루트 단계면 복수형 prop(rows·options·pages…) 으로 데이터를 받는다.
 *   - 예제에 박힌 id 는 useId 로 갈아끼우고 for/aria-* 참조도 함께 고친다.
 *   - data-s1-part="control" 인 입력 요소에는 value/onChange 등을 그대로 넘긴다.
 *   - part 가 없는 루트 자식(탭 내용 등)은 children 이 주어지면 대체된다.
 */

/* ── 1. HTML 파서 ─────────────────────────────────────────────────────── */

const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function readAttributes(raw) {
  const attributes = [];
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    if (!match[1]) continue;
    const value = match[3] ?? match[4] ?? match[5];
    attributes.push([match[1], value === undefined ? true : value]);
  }
  return attributes;
}

export function parseHtml(html, id) {
  const source = html.replace(/<!--[\s\S]*?-->/g, "");
  const root = { type: "root", tag: "#root", attributes: [], children: [] };
  const stack = [root];
  const pattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let cursor = 0;
  let match;
  const pushText = (text) => {
    if (!text || !text.trim()) return;
    stack[stack.length - 1].children.push({ type: "text", value: text.replace(/\s+/g, " ").trim() });
  };
  while ((match = pattern.exec(source)) !== null) {
    const [full, closing, rawName, rawAttributes, selfClosing] = match;
    pushText(source.slice(cursor, match.index));
    cursor = match.index + full.length;
    const tag = rawName.toLowerCase();
    if (closing) {
      const open = stack.pop();
      if (!open || open.tag !== tag) throw new Error(`${id}: 마크업의 <${tag}> 짝이 맞지 않습니다.`);
      continue;
    }
    const node = { type: "element", tag, attributes: readAttributes(rawAttributes), children: [] };
    stack[stack.length - 1].children.push(node);
    if (!(selfClosing === "/" || VOID_ELEMENTS.has(tag))) stack.push(node);
  }
  pushText(source.slice(cursor));
  if (stack.length !== 1) throw new Error(`${id}: 닫히지 않은 태그가 있습니다.`);
  return root;
}

/** 예제 파일에 인스턴스가 여러 벌이면 첫 벌만 옮긴다(기존 규칙과 같다). */
export function firstInstance(tree, id) {
  const queue = [...tree.children];
  while (queue.length) {
    const node = queue.shift();
    if (node.type !== "element") continue;
    if (node.attributes.some(([name, value]) => name === "data-s1-component" && value === id)) return node;
    queue.unshift(...node.children);
  }
  throw new Error(`${id}: 예제에서 data-s1-component="${id}" 인 요소를 찾지 못했습니다.`);
}

/* ── 2. 속성 이름·이름 규칙 ───────────────────────────────────────────── */

const ATTRIBUTE_NAMES = new Map(Object.entries({
  class: "className", for: "htmlFor", tabindex: "tabIndex", colspan: "colSpan", rowspan: "rowSpan",
  maxlength: "maxLength", minlength: "minLength", readonly: "readOnly", autocomplete: "autoComplete",
  autofocus: "autoFocus", contenteditable: "contentEditable", spellcheck: "spellCheck", inputmode: "inputMode",
  novalidate: "noValidate", enctype: "encType", usemap: "useMap", srcset: "srcSet", crossorigin: "crossOrigin",
  datetime: "dateTime", accesskey: "accessKey"
}));
const BOOLEAN_ATTRIBUTES = new Set(["hidden", "disabled", "checked", "selected", "readonly", "required", "multiple", "autofocus", "novalidate", "open", "inert"]);

const reactAttributeName = (name) =>
  name.startsWith("data-") || name.startsWith("aria-") ? name : ATTRIBUTE_NAMES.get(name.toLowerCase()) ?? name;

const camel = (value) => String(value).replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
export const pascal = (value) => camel(value).replace(/^[a-z]/, (character) => character.toUpperCase());
const pluralize = (value) => {
  const name = camel(value);
  if (/(s|x|z|ch|sh)$/.test(name)) return `${name}es`;
  if (/[^aeiou]y$/.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
};
const constantName = (value) => camel(value).replace(/[A-Z]/g, (character) => `_${character}`).toUpperCase();
const literal = (value) => JSON.stringify(value);

/* ── 3. 반복 목록 판정 ────────────────────────────────────────────────── */

/* 항목마다 달라지는(=상태·데이터) 속성. 모양 비교에서 빼야 첫 항목만 특별해 보이지 않는다. */
const ITEM_ATTRIBUTES = new Set([
  "id", "hidden", "tabindex", "checked", "disabled", "data-align", "data-value", "data-page", "data-state",
  "aria-selected", "aria-current", "aria-expanded", "aria-pressed", "aria-checked", "aria-disabled",
  "aria-controls", "aria-labelledby", "aria-describedby", "aria-label"
]);

const partOf = (node) => node.attributes.find(([name]) => name === "data-s1-part")?.[1];
const isTextOnly = (node) => node.children.every((child) => child.type === "text");
const attributeValue = (node, name) => node.attributes.find(([key]) => key.toLowerCase() === name)?.[1];

/** "같은 모양"인지 판정한다. 값까지 본다 — data-action="clear" 와 "search" 는 다른 것이다.
 *  항목마다 달라지는 상태(선택됨·값·라벨)만 빼고, 속 구조까지 통째로 견준다. */
function signature(node) {
  const attributes = node.attributes
    .filter(([name]) => !ITEM_ATTRIBUTES.has(name.toLowerCase()))
    .map(([name, value]) => `${name.toLowerCase()}=${value === true ? "" : value}`)
    .sort()
    .join(",");
  const children = node.children
    .map((child) => child.type === "text" ? "#text" : signature(child))
    .join("+");
  return `${node.tag}|${attributes}|(${children})`;
}

function repeatGroups(node) {
  const groups = new Map();
  for (const child of node.children) {
    if (child.type !== "element") continue;
    const part = partOf(child);
    if (!part) continue;
    const key = `${part}::${signature(child)}`;
    if (!groups.has(key)) groups.set(key, { part, members: [] });
    groups.get(key).members.push(child);
  }
  const repeats = new Map();
  for (const group of groups.values()) {
    if (group.members.length < 2) continue;
    repeats.set(group.members[0], group);
    for (const member of group.members.slice(1)) repeats.set(member, null);
  }
  return repeats;
}

/* ── 4. 예제 내용 → 기본 데이터 ───────────────────────────────────────── */

const textOf = (node) => node.children.filter((child) => child.type === "text").map((child) => child.value).join(" ");

/** 항목이 틀과 다르게 가진 속성만 모은다 — 틀과 같은 것은 적지 않는다. */
function itemAttributes(member, template, ids) {
  const attributes = {};
  for (const [name, value] of member.attributes) {
    const lower = name.toLowerCase();
    if (!ITEM_ATTRIBUTES.has(lower)) continue;
    if (attributeValue(template, lower) === value) continue;
    attributes[reactAttributeName(name)] = value === true ? true : ids.has(value) ? { __id: value } : value;
  }
  for (const [name] of template.attributes) {
    const lower = name.toLowerCase();
    if (!ITEM_ATTRIBUTES.has(lower)) continue;
    if (member.attributes.some(([key]) => key.toLowerCase() === lower)) continue;
    attributes[reactAttributeName(name)] = undefined;   // 틀에는 있고 이 항목에는 없는 것 → 지운다
  }
  return attributes;
}

/** 항목과 틀을 같은 자리끼리 견주어, 항목마다 다른 내용·속성만 뽑는다.
 *  슬롯 이름은 깊이와 상관없이 한 층으로 모은다 — 컴포넌트가 슬롯을 그렇게 찾기 때문이다. */
function describeInto(member, template, ids, into) {
  const memberChildren = member.children.filter((child) => child.type === "element");
  const templateChildren = template.children.filter((child) => child.type === "element");
  for (let index = 0; index < memberChildren.length; index += 1) {
    const child = memberChildren[index];
    const twin = templateChildren[index] ?? templateChildren[templateChildren.length - 1] ?? child;
    const part = partOf(child);
    if (part) {
      const attributes = itemAttributes(child, twin, ids);
      const hasAttributes = Object.keys(attributes).length > 0;
      const hasText = child.children.some((grandchild) => grandchild.type === "text");
      const text = isTextOnly(child) && hasText ? textOf(child) : undefined;
      if (hasAttributes && text !== undefined) into[camel(part)] = { content: text, attrs: attributes };
      else if (hasAttributes) into[camel(part)] = { attrs: attributes };
      else if (text !== undefined) into[camel(part)] = text;
    }
    if (!isTextOnly(child)) describeInto(child, twin, ids, into);
  }
}

function defaultItem(member, template, ids) {
  const nested = [...repeatGroups(member).values()].filter(Boolean);
  const attributes = itemAttributes(member, template, ids);
  const described = {};
  describeInto(member, template, ids, described);
  for (const group of nested) {
    described[camel(pluralize(group.part))] = group.members.map((child) => defaultItem(child, group.members[0], ids));
    delete described[camel(group.part)];
  }
  if (Object.keys(attributes).length > 0) described.attrs = attributes;

  const keys = Object.keys(described);
  if (keys.length === 0) return isTextOnly(member) ? textOf(member) : "";
  /* 글자 하나뿐이면 문자열로 — 쓰는 쪽이 rows={[["가","나"]]} 처럼 짧게 쓸 수 있게. */
  if (isTextOnly(member) && keys.length === 0) return textOf(member);
  if (keys.length === 1 && typeof described[keys[0]] === "string" && keys[0] !== "attrs") return described[keys[0]];
  if (isTextOnly(member)) {
    const text = textOf(member);
    return keys.length === 1 && keys[0] === "attrs" ? { content: text, attrs: described.attrs } : described;
  }
  return described;
}

/** 기본 데이터를 소스 코드로 낸다. { __id: "x" } 는 uid 로 갈아끼운 문자열이 된다. */
function dataSource(value) {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return literal(value);
  if (Array.isArray(value)) return `[${value.map(dataSource).join(", ")}]`;
  if (Object.hasOwn(value, "__id")) return `\`\${uid}-${value.__id}\``;
  const entries = Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${dataSource(item)}`);
  return `{ ${entries.join(", ")} }`;
}

/* ── 5. JSX 로 옮기기 ─────────────────────────────────────────────────── */

class RootScope {
  constructor() { this.depth = 0; this.name = "partScope"; }
  attrs() { return null; }
  content(part, fallback) { return `slot(partScope, ${literal(camel(part))}).content ?? ${literal(fallback)}`; }
  slotAttrs(part) { return `slot(partScope, ${literal(camel(part))}).attrs`; }
}

class ItemScope {
  constructor(depth) { this.depth = depth; this.name = `scope${depth}`; this.primaryUsed = false; }
  attrs() { return `attrsOf(${this.name})`; }
  content(part, fallback) {
    const primary = this.primaryUsed ? "false" : "true";
    this.primaryUsed = true;
    return `slot(${this.name}, ${literal(camel(part))}, ${primary}).content ?? ${literal(fallback)}`;
  }
  slotAttrs(part) { return `slot(${this.name}, ${literal(camel(part))}).attrs`; }
}

class Emitter {
  constructor({ id, ids, idSlugs, controlNode, variants, sizes, suffix = "" }) {
    this.suffix = suffix;
    this.id = id;
    this.ids = ids;
    this.idSlugs = idSlugs;
    this.controlNode = controlNode;
    this.variants = variants;
    this.sizes = sizes;
    this.rootLists = [];
    this.nestedLists = [];
    this.hasChildrenSlot = false;
    this.counter = 0;
  }

  attributeText(node, { scope, isRoot, part, isTemplate }) {
    const pieces = [];
    for (const [name, value] of node.attributes) {
      const lower = name.toLowerCase();
      const jsxName = reactAttributeName(name);
      if (lower === "id" && this.ids.has(value)) { pieces.push(`id={\`\${uid}-${this.idSlugs.get(value)}\`}`); continue; }
      if (["for", "aria-labelledby", "aria-describedby", "aria-controls"].includes(lower) && this.ids.has(value)) {
        pieces.push(`${jsxName}={\`\${uid}-${this.idSlugs.get(value)}\`}`);
        continue;
      }
      if (value === true || (BOOLEAN_ATTRIBUTES.has(lower) && value === "")) { pieces.push(jsxName); continue; }
      if (isRoot && this.variants.length > 1 && this.variants.includes(String(value))) { pieces.push(`${jsxName}={variant ?? ${literal(String(value))}}`); continue; }
      if (isRoot && this.sizes.length > 1 && this.sizes.includes(String(value))) { pieces.push(`${jsxName}={size ?? ${literal(String(value))}}`); continue; }
      pieces.push(`${jsxName}=${literal(String(value))}`);
    }
    if (part && !isTemplate) pieces.push(`{...(${scope.slotAttrs(part)} ?? {})}`);
    if (isTemplate) pieces.push(`{...${scope.attrs()}}`);
    if (node === this.controlNode) pieces.push("{...controlProps}");
    if (isRoot) pieces.push("ref={rootRef}", "className={className}", "style={style}", "{...rest}");
    if (isTemplate) pieces.push(`key={keyOf(item${scope.depth}, index${scope.depth})}`);
    return pieces.length ? ` ${pieces.join(" ")}` : "";
  }

  element(node, { scope, isRoot = false, isTemplate = false, indent }) {
    const part = partOf(node);
    const attributes = this.attributeText(node, { scope, isRoot, part, isTemplate });
    const children = this.childrenText(node, { scope, indent: `${indent}  `, part, isRoot });
    if (children === null) return `${indent}<${node.tag}${attributes} />`;
    return `${indent}<${node.tag}${attributes}>\n${children}\n${indent}</${node.tag}>`;
  }

  childrenText(node, { scope, indent, part, isRoot }) {
    if (VOID_ELEMENTS.has(node.tag)) return null;
    if (part && isTextOnly(node)) return `${indent}{${scope.content(part, textOf(node))}}`;
    if (node.children.length === 0) return part ? `${indent}{${scope.content(part, "")}}` : null;

    const repeats = repeatGroups(node);
    const pieces = [];
    const literalChildren = [];
    for (const child of node.children) {
      if (child.type === "text") { pieces.push(`${indent}{${literal(child.value)}}`); continue; }
      if (repeats.get(child) === null) continue;
      if (repeats.has(child)) { pieces.push(this.listText(repeats.get(child), { scope, indent })); continue; }
      if (isRoot && !partOf(child)) { literalChildren.push(child); continue; }
      pieces.push(this.element(child, { scope, indent }));
    }
    if (literalChildren.length) {
      this.hasChildrenSlot = true;
      const rendered = literalChildren.map((child) => this.element(child, { scope, indent: `${indent}    ` })).join("\n");
      pieces.push(`${indent}{children === undefined ? (\n${indent}  <>\n${rendered}\n${indent}  </>\n${indent}) : children}`);
    }
    return pieces.length ? pieces.join("\n") : null;
  }

  listText(group, { scope, indent }) {
    const template = group.members[0];
    const defaults = group.members.map((member) => defaultItem(member, template, this.ids));
    const depth = scope.depth + 1;
    const innerScope = new ItemScope(depth);
    let source;
    if (scope.depth === 0) {
      const prop = pluralize(group.part);
      const constant = `DEFAULT_${constantName(prop)}${this.suffix}`;
      this.rootLists.push({ part: group.part, prop, constant, defaults });
      source = `${prop} ?? ${constant}(uid)`;
    } else {
      this.counter += 1;
      const constant = `DEFAULT_${constantName(pluralize(group.part))}_${this.counter}${this.suffix}`;
      this.nestedLists.push({ constant, defaults });
      source = `list(${scope.name}, ${literal(camel(pluralize(group.part)))}, ${constant}(uid))`;
    }
    const body = this.element(template, { scope: innerScope, isTemplate: true, indent: `${indent}    ` });
    return `${indent}{(${source}).map((item${depth}, index${depth}) => {\n`
      + `${indent}  const scope${depth} = scopeOf(item${depth});\n`
      + `${indent}  return (\n${body}\n${indent}  );\n`
      + `${indent}})}`;
  }
}

/* ── 6. 컴포넌트 파일 ─────────────────────────────────────────────────── */

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요.";

function collectIds(node, into) {
  if (node.type !== "element") return;
  const id = attributeValue(node, "id");
  if (typeof id === "string") into.add(id);
  for (const child of node.children) collectIds(child, into);
}

/** 이 컴포넌트 자신의 입력 요소만 찾는다.
 *  ① 반복 틀 안(항목마다 여러 개) ② 다른 컴포넌트 속(표 안의 체크박스 등)은 제외한다. */
function primaryControl(node) {
  const repeats = repeatGroups(node);
  for (const child of node.children) {
    if (child.type !== "element") continue;
    if (repeats.has(child)) continue;
    if (attributeValue(child, "data-s1-component") !== undefined) continue;
    if (partOf(child) === "control" && ["input", "textarea", "select"].includes(child.tag)) return child;
    const found = primaryControl(child);
    if (found) return found;
  }
  return null;
}

/** id 는 "쓰는 쪽이 읽을 수 있는 이름"으로 짧게 만든다: 예제 id 대신 그 자리의 part 이름. */
function idSlugMap(node, into = new Map(), used = new Set()) {
  if (node.type !== "element") return into;
  const id = attributeValue(node, "id");
  if (typeof id === "string" && !into.has(id)) {
    const base = (partOf(node) ?? id).replace(/[^a-zA-Z0-9-]/g, "-");
    let slug = base;
    let counter = 2;
    while (used.has(slug)) { slug = `${base}-${counter}`; counter += 1; }
    used.add(slug);
    into.set(id, slug);
  }
  for (const child of node.children) idSlugMap(child, into, used);
  return into;
}

const eventPropName = (eventName, taken = []) => {
  const segments = eventName.split(":");
  const base = `on${pascal(segments[segments.length - 1])}`;
  return taken.includes(base) ? `on${pascal(segments.slice(1).join("-"))}` : base;
};

export function buildReactComponent({ id, manifest, example, exampleByBreak }) {
  const componentName = `S1${pascal(id)}`;
  const breaks = Object.entries(exampleByBreak ?? { pc: example });
  const variants = manifest.variants ?? [];
  const sizes = manifest.sizes ?? [];
  const jsRequired = Boolean(manifest.jsRequired);

  const trees = breaks.map(([breakName, html]) => [breakName, firstInstance(parseHtml(html, id), id)]);
  const firstControl = trees.map(([, tree]) => primaryControl(tree)).find(Boolean) ?? null;
  const isCheckLike = firstControl?.tag === "input" && ["checkbox", "radio"].includes(String(attributeValue(firstControl, "type")));
  const controlProps = firstControl
    ? ["value", "defaultValue", "onChange", "onInput", "onBlur", "onFocus", "name", "placeholder", "disabled", "required", "readOnly",
      ...(isCheckLike ? ["checked", "defaultChecked"] : []), "inputRef"]
    : [];
  const events = (manifest.javascript?.events ?? []).map((eventName) => ({ eventName, propName: eventPropName(eventName, controlProps) }));

  const rendered = trees.map(([breakName, tree]) => {
    const ids = new Set();
    collectIds(tree, ids);
    const suffix = breaks.length > 1 ? `_${constantName(breakName)}` : "";
    const emitter = new Emitter({ id, ids, idSlugs: idSlugMap(tree), controlNode: primaryControl(tree), variants, sizes, suffix });
    const body = emitter.element(tree, { scope: new RootScope(), isRoot: true, indent: "      " });
    return { breakName, body, emitter };
  });
  const control = firstControl;

  const rootLists = [];
  const nestedLists = [];
  const seen = new Set();
  for (const { emitter } of rendered) {
    for (const item of emitter.rootLists) if (!seen.has(item.constant)) { seen.add(item.constant); rootLists.push(item); }
    for (const item of emitter.nestedLists) if (!seen.has(item.constant)) { seen.add(item.constant); nestedLists.push(item); }
  }
  const hasChildrenSlot = rendered.some(({ emitter }) => emitter.hasChildrenSlot);

  const propNames = [
    variants.length > 1 ? "variant" : null,
    sizes.length > 1 ? "size" : null,
    breaks.length > 1 ? "breakName = DEFAULT_BREAK" : null,
    "parts",
    ...[...new Set(rootLists.map(({ prop }) => prop))],
    ...controlProps,
    ...events.map(({ propName }) => propName),
    hasChildrenSlot ? "children" : null,
    "className", "style", "...rest"
  ].filter(Boolean);

  const listConstants = [...rootLists, ...nestedLists]
    .map(({ constant, defaults }) => `const ${constant} = (uid) => [${defaults.map(dataSource).join(", ")}];`)
    .join("\n");

  const controlBlock = control ? `
  /* 입력 요소로 그대로 넘어가는 값 — 정의되지 않은 것은 넘기지 않는다(비제어 상태 유지). */
  const controlProps = {};
${controlProps.filter((name) => name !== "inputRef").map((name) => `  if (${name} !== undefined) controlProps.${name} = ${name};`).join("\n")}
  if (inputRef !== undefined) controlProps.ref = inputRef;
` : "";

  const runtimeEffect = jsRequired ? `
  /* 배포본의 실제 동작 스크립트를 그대로 쓴다 — 브라우저에서만 돈다(서버 렌더링은 마크업까지). */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    init(root);
    return () => destroy(root);
  }, [${breaks.length > 1 ? "breakName" : ""}]);
` : "";

  const eventEffect = events.length === 0 ? "" : `
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const bound = [${events.map(({ eventName, propName }) => `[${literal(eventName)}, ${propName}]`).join(", ")}]
      .filter(([, handler]) => typeof handler === "function");
    for (const [eventName, handler] of bound) root.addEventListener(eventName, handler);
    return () => { for (const [eventName, handler] of bound) root.removeEventListener(eventName, handler); };
  });
` ;

  const renderSource = breaks.length === 1
    ? `  return (\n${rendered[0].body}\n  );`
    : `${rendered.map(({ breakName, body }, index) =>
      `  ${index === 0 ? "if" : "} else if"} (breakName === ${literal(breakName)}) {\n    return (\n${body}\n    );\n`).join("")}  }\n`
      + `  throw new Error(\`[s1-ui] ${id}: 승인되지 않은 breakName "\${breakName}". 쓸 수 있는 값: \${BREAKS.join(", ")}\`);`;

  return `/* ${GENERATED_NOTE} */
/* ${componentName} — 승인된 배포본 마크업을 그대로 옮긴 React 컴포넌트.
   마크업을 새로 쓰지 않는다. dist/examples/${id}*.html 의 승인 인스턴스를 JSX 로 옮긴 것이다.
   서버에서 그려도 같은 마크업이 나온다. */
import { ${["useEffect", "useId", "useRef"].filter((name) => name !== "useEffect" || jsRequired || events.length > 0).join(", ")} } from "react";
import { ${["scopeOf", "slot", ...(rootLists.length || nestedLists.length ? ["attrsOf", "keyOf"] : []), ...(nestedLists.length ? ["list"] : [])].sort().join(", ")} } from "./runtime.js";
${jsRequired ? `import { init, destroy } from "../../components/${id}.js";` : `// ${id} 는 JavaScript 런타임이 없다 — 브라우저 기본 동작만 쓴다.`}

export const BREAKS = ${JSON.stringify(breaks.map(([name]) => name))};
export const DEFAULT_BREAK = ${literal(breaks[0][0])};
export const VARIANTS = ${JSON.stringify(variants)};
export const SIZES = ${JSON.stringify(sizes)};
export const PARTS = ${JSON.stringify(manifest.parts ?? [])};
${listConstants ? `\n/* 예제에 있던 내용 — prop 을 주지 않으면 이게 그려진다. */\n${listConstants}\n` : ""}
function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(\`[s1-ui] ${id}: 승인되지 않은 \${label} "\${value}". 쓸 수 있는 값: \${allowed.join(", ")}\`);
}

export default function ${componentName}({ ${propNames.join(", ")} }) {
  const uid = useId();
  const rootRef = useRef(null);
  const partScope = scopeOf(parts);
${variants.length > 1 ? `  assertAllowed("variant", variant, VARIANTS);\n` : ""}${sizes.length > 1 ? `  assertAllowed("size", size, SIZES);\n` : ""}${breaks.length > 1 ? `  assertAllowed("breakName", breakName, BREAKS);\n` : ""}${controlBlock}${runtimeEffect}${eventEffect}
${renderSource}
}
`;
}

/** 타입·문서를 만들기 위해 컴포넌트의 겉모습(받는 prop)만 뽑는다. */
export function reactComponentFacts({ id, manifest, example, exampleByBreak }) {
  const breaks = Object.entries(exampleByBreak ?? { pc: example });
  const trees = breaks.map(([breakName, html]) => [breakName, firstInstance(parseHtml(html, id), id)]);
  const variants = manifest.variants ?? [];
  const sizes = manifest.sizes ?? [];
  const control = trees.map(([, tree]) => primaryControl(tree)).find(Boolean) ?? null;
  const isCheckLike = control?.tag === "input" && ["checkbox", "radio"].includes(String(attributeValue(control, "type")));
  const controlProps = control
    ? ["value", "defaultValue", "onChange", "onInput", "onBlur", "onFocus", "name", "placeholder", "disabled", "required", "readOnly",
      ...(isCheckLike ? ["checked", "defaultChecked"] : []), "inputRef"]
    : [];
  const events = (manifest.javascript?.events ?? []).map((eventName) => ({ eventName, propName: eventPropName(eventName, controlProps) }));

  const lists = [];
  let hasChildrenSlot = false;
  for (const [, tree] of trees) {
    const ids = new Set();
    collectIds(tree, ids);
    const emitter = new Emitter({ id, ids, idSlugs: idSlugMap(tree), controlNode: primaryControl(tree), variants, sizes });
    emitter.element(tree, { scope: new RootScope(), isRoot: true, indent: "" });
    for (const item of emitter.rootLists) if (!lists.some((known) => known.prop === item.prop)) lists.push(item);
    hasChildrenSlot = hasChildrenSlot || emitter.hasChildrenSlot;
  }
  return {
    id,
    componentName: `S1${pascal(id)}`,
    breaks: breaks.map(([name]) => name),
    variants,
    sizes,
    parts: (manifest.parts ?? []).map((part) => camel(part)),
    lists,
    controlProps,
    isCheckLike,
    events,
    hasChildrenSlot,
    jsRequired: Boolean(manifest.jsRequired)
  };
}

/* ── 7. 패키지·타입·안내 ──────────────────────────────────────────────── */

export function buildReactPackage(version) {
  return `${JSON.stringify({
    name: "@s1/ui-react",
    version,
    description: "S1 디자인 시스템 — 승인된 배포본 마크업을 그대로 옮긴 React 컴포넌트",
    type: "module",
    main: "./index.js",
    types: "./index.d.ts",
    exports: { ".": { types: "./index.d.ts", default: "./index.js" }, "./*": "./*" },
    sideEffects: false,
    peerDependencies: { react: ">=17" },
    files: ["*.jsx", "index.js", "index.d.ts", "runtime.js", "README.md"]
  }, null, 2)}\n`;
}

export function buildReactTypes(factsList) {
  const header = `/* ${GENERATED_NOTE} */
import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";

/** 슬롯 한 칸에 넣을 수 있는 값. 글자·요소를 그대로 주거나, 속성까지 함께 준다. */
export type S1SlotValue = ReactNode | { content?: ReactNode; attrs?: Record<string, unknown> };
/** 목록 한 줄. 글자 하나, 안쪽 목록(배열), 또는 슬롯 이름별 지정. */
export type S1ItemValue = ReactNode | readonly S1ItemValue[] | ({
  key?: string | number;
  attrs?: Record<string, unknown>;
} & Record<string, S1SlotValue | readonly S1ItemValue[] | undefined>);

export interface S1BaseProps {
  /** 슬롯 이름별 내용·속성. 예: parts={{ label: "확인" }} */
  parts?: Record<string, S1SlotValue>;
  className?: string;
  style?: CSSProperties;
  [attribute: string]: unknown;
}
`;
  const body = factsList.map((facts) => {
    const lines = [];
    if (facts.variants.length > 1) lines.push(`  /** 승인된 변형: ${facts.variants.join(" · ")} */\n  variant?: ${facts.variants.map((value) => JSON.stringify(value)).join(" | ")};`);
    if (facts.sizes.length > 1) lines.push(`  /** 승인된 크기: ${facts.sizes.join(" · ")} */\n  size?: ${facts.sizes.map((value) => JSON.stringify(value)).join(" | ")};`);
    if (facts.breaks.length > 1) lines.push(`  /** 화면 기준: ${facts.breaks.join(" · ")} (기본 ${facts.breaks[0]}) */\n  breakName?: ${facts.breaks.map((value) => JSON.stringify(value)).join(" | ")};`);
    for (const { prop } of facts.lists) lines.push(`  /** 목록 데이터 — 주지 않으면 예제 내용이 그려진다. */\n  ${prop}?: readonly S1ItemValue[];`);
    for (const name of facts.controlProps) {
      if (name === "inputRef") { lines.push("  /** 입력 요소에 직접 닿는 ref */\n  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;"); continue; }
      if (name.startsWith("on")) { lines.push(`  ${name}?: (event: any) => void;`); continue; }
      if (["disabled", "required", "readOnly", "checked", "defaultChecked"].includes(name)) { lines.push(`  ${name}?: boolean;`); continue; }
      lines.push(`  ${name}?: string | number;`);
    }
    for (const { eventName, propName } of facts.events) lines.push(`  /** ${eventName} */\n  ${propName}?: (event: CustomEvent) => void;`);
    if (facts.hasChildrenSlot) lines.push("  /** 앱이 소유하는 내용(탭 내용 등). 주면 예제 내용을 대신한다. */\n  children?: ReactNode;");
    return `export interface ${facts.componentName}Props extends S1BaseProps {\n${lines.join("\n")}\n}\nexport declare function ${facts.componentName}(props: ${facts.componentName}Props): ReactElement;`;
  }).join("\n\n");
  return `${header}\n${body}\n`;
}

export function buildReactReadme(factsList) {
  const rows = factsList.map((facts) => {
    const knobs = [
      facts.variants.length > 1 ? `variant(${facts.variants.length})` : null,
      facts.sizes.length > 1 ? `size(${facts.sizes.length})` : null,
      facts.breaks.length > 1 ? `breakName(${facts.breaks.join("·")})` : null,
      ...facts.lists.map(({ prop }) => prop),
      facts.controlProps.length ? "value·onChange" : null,
      ...facts.events.map(({ propName }) => propName),
      facts.hasChildrenSlot ? "children" : null
    ].filter(Boolean);
    return `| \`${facts.componentName}\` | ${knobs.join(" · ") || "parts"} |`;
  }).join("\n");

  return `# @s1/ui-react

S1 디자인 시스템의 **승인된 배포본 마크업을 그대로 옮긴 React 컴포넌트**입니다.
마크업을 새로 쓰지 않았고, 값·구조·속성은 배포본 예제와 같습니다.

## 1. 준비 — CSS 를 먼저 읽힌다

컴포넌트는 배포본 CSS 로 그려집니다. 앱 진입점에서 한 번 읽히세요.

\`\`\`js
import "@s1/ui/assets/css/tokens.css";
import "@s1/ui/assets/css/typography.css";
import "@s1/ui/s1-ui.css";
\`\`\`

## 2. 쓰기

\`\`\`jsx
import { S1Button, S1Input, S1Table } from "@s1/ui-react";

<S1Button variant="primary" size="md" parts={{ label: "확인" }} onClick={save} />

<S1Input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" />

<S1Table
  headerCells={["이름", "부서", "수량"]}
  rows={[["김하늘", "디자인", 3], ["박바다", "개발", 5]]}
/>
\`\`\`

## 3. 네 가지 통로

| 통로 | 언제 쓰나 | 예 |
|---|---|---|
| \`parts\` | 글자·아이콘 한 칸을 갈아끼울 때 | \`parts={{ label: <><Icon /> 저장</> }}\` |
| 목록 prop | 표·목록에 내 데이터를 넣을 때 | \`rows={[["가", "나"]]}\` |
| 폼 prop | 입력값을 React 상태와 잇을 때 | \`value\` · \`onChange\` · \`inputRef\` |
| 나머지 속성 | 루트에 그대로 붙는다 | \`id\` · \`onClick\` · \`aria-*\` |

슬롯 한 칸에 속성까지 주려면 \`{ content, attrs }\` 로 넘깁니다.

\`\`\`jsx
<S1Table rows={[{ cells: ["합계", "", { content: 8, attrs: { "data-align": "center" } }] }]} />
\`\`\`

## 4. 서버 렌더링

컴포넌트는 서버에서도 같은 마크업을 냅니다. 동작 스크립트(열고 닫기·키보드)는 브라우저에서 붙습니다.

## 5. 컴포넌트와 받는 값

| 컴포넌트 | 받는 값 |
|---|---|
${rows}

## 6. 고치지 마세요

이 폴더는 자동 생성물입니다. 고치면 다음 배포에서 지워집니다.
`;
}

export function buildReactRuntime() {
  return `/* ${GENERATED_NOTE} */
/* 컴포넌트들이 함께 쓰는 작은 도우미. 슬롯 값 하나를 "내용 + 속성" 으로 읽어 준다.
   넘길 수 있는 모양:
     "글자"                      → 내용만
     <아이콘 />                  → 요소도 그대로
     { content, attrs }          → 내용과 속성을 같이
     ["가", "나"]                → 안쪽 목록(표의 한 줄 등)
     { cell: "가", attrs: {} }   → 안쪽 슬롯 이름으로 지정 */
import { isValidElement } from "react";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value) && !isValidElement(value);

export function scopeOf(value) {
  if (value === undefined || value === null) return {};
  if (Array.isArray(value)) return { __list: value };
  if (!isPlainObject(value)) return { __content: value };
  return value;
}

export function attrsOf(scope) {
  const attrs = scope?.attrs;
  return isPlainObject(attrs) ? attrs : {};
}

export function slot(scope, name, primary = false) {
  let raw = scope?.[name];
  if (raw === undefined && primary) raw = scope?.__content ?? scope?.content;
  if (raw === undefined || raw === null) return { content: undefined, attrs: undefined };
  if (isPlainObject(raw) && ("content" in raw || "attrs" in raw)) return { content: raw.content, attrs: raw.attrs };
  return { content: raw, attrs: undefined };
}

export function list(scope, name, fallback) {
  const raw = scope?.[name] ?? (Array.isArray(scope?.__list) ? scope.__list : undefined);
  if (Array.isArray(raw)) return raw;
  /* 한 줄을 글자 하나로 준 경우 — rows={["가", "나"]} 처럼. 그 줄의 첫 칸으로 본다. */
  if (scope?.__content !== undefined) return [scope.__content];
  return fallback;
}

export function keyOf(item, index) {
  if (isPlainObject(item) && item.key !== undefined && item.key !== null) return item.key;
  return index;
}
`;
}

export const _internal = { repeatGroups, defaultItem, pluralize, signature };
