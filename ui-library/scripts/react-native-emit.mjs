/**
 * react-native-emit.mjs — 승인 예제 → React Native 부품 파일 + 상태별 스타일 표
 * --------------------------------------------------------------------------
 * 구조(마크업 계층·슬롯 part·반복 목록)는 react.mjs 가 이미 하는 분석(Emitter)을 그대로 쓴다 —
 * 마크업을 새로 쓰지 않고 승인 예제에서 기계적으로 옮긴다. 달라지는 것은 두 가지다.
 *   ① 출력 요소가 HTML 태그가 아니라 엔진의 <El k="n3" a={{…}}> 이다(스타일은 표에서 온다).
 *   ② 값(치수·색)은 코드에 없다. react-native-model.mjs 가 css-model 로 계산한 표(specs/*.js)에만 있다.
 */

import {
  Emitter, VOID_ELEMENTS, attributeValue, buildReactRuntime, camel, collectIds, constantName, eventPropName, firstInstance, idSlugMap, isTextOnly,
  ItemScope, ITEM_ATTRIBUTES, constantName as constantNameOf, isVariable, itemAttributes, literal, parseHtml, partOf, pascal, pluralize, primaryControl, repeatGroups, shape, textOf
} from "./react.mjs";
import { buildTables, buildTemplate, probe, mediaActive } from "./react-native-model.mjs";
import { behaviorFor } from "./react-native-behaviors.mjs";

export const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요.";

/* ── 1. 예제 → 템플릿 묶음 ───────────────────────────────────────────── */

/** 예제 한 파일 안의 이 컴포넌트 루트들(다른 같은 컴포넌트 안에 들어간 것은 제외). */
function allInstances(tree, id) {
  const found = [];
  const walk = (node) => {
    if (node.type !== "element") return;
    if (attributeValue(node, "data-s1-component") === id) { found.push(node); return; }
    for (const child of node.children) walk(child);
  };
  for (const child of tree.children) walk(child);
  if (found.length === 0) throw new Error(`${id}: 예제에서 data-s1-component="${id}" 인 요소를 찾지 못했습니다.`);
  return found;
}

/**
 * 예제 키(pc · mobile · password · password-mobile …)를 (화면, 모드)로 읽는다.
 * Input 은 비밀번호·검색 모양이 화면 축이 아니라 별도 예제로 나와 있다 — 모드로 따로 고른다.
 */
function readExampleKey(key) {
  if (key === "pc" || key === "mobile") return { breakName: key, mode: null };
  if (key.endsWith("-mobile")) return { breakName: "mobile", mode: key.slice(0, -"-mobile".length) };
  return { breakName: "pc", mode: key };
}

/** repeatGroups 에서 "나란히 붙은 같은 모양 항목"만 목록으로 본다 — 사이에 다른 칸이 끼어 있으면(구분선이 두 곳에 있는 시간 목록 등)
 *  각각 제자리에 둔다. 한 자리로 모으면 화면 순서가 바뀐다. */
function adjacentRepeatGroups(node) {
  const groups = repeatGroups(node);
  const elements = node.children.filter((child) => child.type === "element");
  const result = new Map();
  const seen = new Set();
  for (const [member, group] of groups) {
    if (group === null) continue;
    if (seen.has(group)) continue;
    seen.add(group);
    const indexes = group.members.map((one) => elements.indexOf(one));
    const contiguous = indexes.every((position, i) => i === 0 || position === indexes[i - 1] + 1);
    if (!contiguous) continue;
    result.set(group.members[0], group);
    for (const one of group.members.slice(1)) result.set(one, null);
  }
  return result;
}

const hasNamed = (node) => node.children.some((child) => child.type === "element" && (partOf(child) || attributeValue(child, "data-s1-component") !== undefined || hasNamed(child)));

/** 구조 서명 — 태그·part·안에 든 부품만 본다. 글자·속성 값·같은 모양 항목의 개수는 보지 않는다.
 *  이름 붙은 칸(part) 안에 이름 붙은 것이 하나도 없으면 그 속은 "소비자가 채우는 내용"이라 구조로 보지 않는다. */
function structureSignature(node, isRoot = true) {
  if (!isRoot && partOf(node) && !hasNamed(node)) return `${node.tag}|${partOf(node)}|()`;
  const children = [];
  for (const child of node.children) {
    if (child.type !== "element") continue;
    const sig = structureSignature(child, false);
    if (children.length && children[children.length - 1].sig === sig) { children[children.length - 1].many = true; continue; }
    children.push({ sig, many: false });
  }
  const tag = `${node.tag}|${partOf(node) ?? ""}|${attributeValue(node, "data-s1-component") ?? ""}`;
  return `${tag}(${children.map(({ sig, many }) => `${sig}${many ? "*" : ""}`).join(",")})`;
}

/** 한 예제에서 구조가 다른 루트 묶음을 뽑는다 — 변형마다 마크업이 다른 부품(list-row 일곱 유형 등). */
function structureGroups(instances, manifest) {
  const variants = manifest.variants ?? [];
  const variantOf = (instance) => {
    for (const [name, value] of instance.attributes) {
      if (variants.includes(String(value)) && /^data-/.test(name)) return String(value);
    }
    return null;
  };
  const groups = [];
  for (const instance of instances) {
    const signature = structureSignature(instance);
    let group = groups.find((one) => one.signature === signature);
    if (!group) { group = { signature, instance, instances: [], variants: [] }; groups.push(group); }
    group.instances.push(instance);
    const variant = variantOf(instance);
    if (variant !== null && !group.variants.includes(variant)) group.variants.push(variant);
  }
  return groups;
}

/* ── 반복 목록 기본 데이터 — react.mjs 의 defaultItem 과 같되, 안에 들어간 부품(이름 없는 루트)의 속성 차이도 담는다 ── */

const nestedKeyOf = (node) => `nested:${camel(attributeValue(node, "data-s1-component"))}`;

function rnDescribeInto(member, template, ids, into) {
  const memberChildren = member.children.filter((child) => child.type === "element");
  const templateChildren = template.children.filter((child) => child.type === "element");
  for (let index = 0; index < memberChildren.length; index += 1) {
    const child = memberChildren[index];
    const twin = templateChildren[index] ?? templateChildren[templateChildren.length - 1] ?? child;
    const nested = attributeValue(child, "data-s1-component") !== undefined && !partOf(child);
    const part = partOf(child) ?? (nested ? nestedKeyOf(child) : undefined);
    if (part) {
      const attributes = itemAttributes(child, twin, ids);
      const hasAttributes = Object.keys(attributes).length > 0;
      const hasText = child.children.some((grandchild) => grandchild.type === "text");
      const text = isTextOnly(child) && hasText ? textOf(child) : undefined;
      const key = nested ? part : camel(part);
      if (hasAttributes && text !== undefined) into[key] = { content: text, attrs: attributes };
      else if (hasAttributes) into[key] = { attrs: attributes };
      else if (text !== undefined && !nested) into[key] = text;
    }
    if (!isTextOnly(child)) rnDescribeInto(child, twin, ids, into);
  }
}

function rnDefaultItem(member, template, ids) {
  const nestedGroups = [...adjacentRepeatGroups(member).values()].filter(Boolean);
  const attributes = itemAttributes(member, template, ids);
  const described = {};
  rnDescribeInto(member, template, ids, described);
  for (const group of nestedGroups) {
    described[camel(pluralize(group.part))] = group.members.map((child) => rnDefaultItem(child, group.members[0], ids));
    delete described[camel(group.part)];
  }
  if (Object.keys(attributes).length > 0) described.attrs = attributes;
  const keys = Object.keys(described);
  if (keys.length === 0) return isTextOnly(member) ? textOf(member) : "";
  if (keys.length === 1 && typeof described[keys[0]] === "string" && keys[0] !== "attrs") return described[keys[0]];
  if (isTextOnly(member)) {
    const text = textOf(member);
    return keys.length === 1 && keys[0] === "attrs" ? { content: text, attrs: described.attrs } : described;
  }
  return described;
}

/* ── 예제가 비워 둔 자리 — JS 가 만드는 DOM 의 견본 ──────────────────────────────────────
   달력·시간 목록은 승인 예제에 비어 있고(배포본 JS 가 열릴 때 만든다), 그 칸의 모양은 CSS 가 정한다.
   RN 에도 칸 모양을 계산할 요소가 있어야 하므로, 배포본 JS 가 만드는 DOM 과 **같은 모양의 견본 하나**를 끼운다.
   견본의 개수·내용·상태는 controller 가 정한다(견본 하나를 데이터만큼 되풀이). 값은 견본에 없다 — CSS 가 정한다. */
const CALENDAR_SAMPLE = `
          <div data-s1-part="header">
            <button type="button" data-s1-part="prev" aria-label="이전"><span data-s1-part="chevron-icon" aria-hidden="true"></span></button>
            <div data-s1-part="header-label"><button type="button" data-s1-part="year-label">2026년</button><button type="button" data-s1-part="month-label">1월</button></div>
            <button type="button" data-s1-part="next" aria-label="다음"><span data-s1-part="chevron-icon" aria-hidden="true"></span></button>
          </div>
          <div data-s1-part="view">
            <div data-s1-part="weekdays"><span data-s1-part="weekday" data-weekday="1">일</span></div>
            <div data-s1-part="grid" role="grid"><div data-s1-part="week" role="row"><button type="button" data-s1-part="cell" role="gridcell" data-date="2026-01-01" data-other-month="false" data-weekday="1" data-state="default" aria-selected="false"><span data-s1-part="cell-inner"><span data-s1-part="cell-num">1</span></span></button></div></div>
            <div data-s1-part="grid" data-tile-grid="month"><div data-s1-part="tile-row"><button type="button" data-s1-part="tile" data-value="0" aria-selected="false">1월</button></div></div>
          </div>`;

export function augmentExample(id, html) {
  if (id === "date-picker") return html.replaceAll('<div data-s1-part="calendar"></div>', `<div data-s1-part="calendar">${CALENDAR_SAMPLE}</div>`);
  if (id === "time-picker") {
    return html
      .replace(/(<div data-s1-part="column"[^>]*>)(<\/div>)/g, '$1<div data-s1-part="cell" role="option" aria-selected="false" tabindex="-1" data-value="00">00</div>$2')
      .replace(/(<div data-s1-part="wheel-col" data-column="colon"[^>]*>)(<\/div>)/g, '$1<div data-s1-part="wheel-cell">:</div>$2')
      .replace(/(<div data-s1-part="wheel-col" data-column="(?!colon)[^>]*>)(<\/div>)/g, '$1<div data-s1-part="wheel-cell" role="option" data-value="00">00</div>$2');
  }
  return html;
}

/** 목록 항목 하나를 "틀과의 차이"가 아니라 **전부** 적은 데이터로 — 다른 부품의 목록 prop 으로 넘길 때 쓴다. */
function fullItem(member, defaults) {
  const attrs = {};
  for (const [name, value] of member.attributes) {
    const lower = name.toLowerCase();
    if (lower === "data-s1-part" || lower === "class" || lower === "style" || lower === "type" || lower === "role" || lower === "tabindex") continue;
    attrs[lower] = value === true ? "" : String(value);
  }
  for (const name of Object.keys(defaults)) if (STATE_ATTRIBUTE.test(name) && attrs[name] === undefined) attrs[name] = undefined;
  if (isTextOnly(member)) return { content: textOf(member), attrs };
  const slots = {};
  const walk = (node) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      const part = partOf(child);
      if (part && isTextOnly(child) && textOf(child)) slots[camel(part)] = textOf(child);
      walk(child);
    }
  };
  walk(member);
  return { ...slots, attrs };
}

/** 이 부품 예제의 모든 인스턴스 루트에 나타나는 상태 속성 이름 — 다른 부품 안에 들어갈 때, 쓰지 않은 상태가
 *  이 부품의 기본값(예: 첫 인스턴스가 선택 상태)으로 새어 들어가지 않게 하는 데 쓴다. */
export function firstRootAttributes({ id, exampleByBreak }) {
  const out = {};
  for (const html of Object.values(exampleByBreak)) {
    for (const instance of allInstances(parseHtml(html, id), id)) {
      for (const [name] of instance.attributes) out[name.toLowerCase()] = "";
    }
  }
  return out;
}

const STATE_ATTRIBUTE = /^(aria-(current|selected|pressed|checked|expanded|disabled|invalid)|data-state|data-selected|data-open|data-filled|hidden)$/;

/** 이 노드가 "안에 들어간 다른 부품"이면 그 부품 id, 아니면 null. */
export function nestedIdOf(parsed, { id, isRoot, manifests }) {
  if (isRoot) return null;
  const nestedId = attributeValue(parsed, "data-s1-component");
  if (nestedId === undefined || nestedId === id) return null;
  const manifest = manifests.get(nestedId);
  if (!manifest) return nestedId;
  const allowed = new Set(manifest.parts ?? []);
  const composed = (node) => node.children.some((child) => {
    if (child.type !== "element") return false;
    if (attributeValue(child, "data-s1-component") !== undefined) return false;   // 그 부품 안의 칸은 그 부품 몫
    const part = partOf(child);
    return (part !== undefined && !allowed.has(part)) || composed(child);
  });
  return composed(parsed) ? null : nestedId;
}

/* ── 2. 방출기 ───────────────────────────────────────────────────────── */

const SKIP_ATTRIBUTES = new Set(["class", "style", "href", "src", "alt", "tabindex", "for", "aria-labelledby", "aria-describedby", "xmlns", "name"]);
const SVG_TAGS = { svg: "Svg", rect: "Rect", circle: "Circle", path: "Path", g: "G", line: "Line", ellipse: "Ellipse", polygon: "Polygon" };

class RnEmitter extends Emitter {
  constructor(options) {
    super(options);
    this.keys = options.keys;
    this.template = options.template;
    this.manifests = options.manifests;
    this.nestedDefaults = options.nestedDefaults ?? new Map();
    this.nestedOf = options.nestedOf;
    this.visited = [];
    this.nestedImports = new Set();
    this.svgUsed = new Set();
    this.listDepthByNode = new Map();
  }

  keyOf(node) { return this.keys.get(node); }

  isNested(node) {
    return this.nestedOf(node, node === this.rootNode) !== null;
  }

  attributeText(node, { scope, isRoot, part, isTemplate, leaf, extra }) {
    const key = this.keyOf(node);
    const entries = [];
    const isControl = node === this.controlNode;
    for (const [name, value] of node.attributes) {
      const lower = name.toLowerCase();
      if (SKIP_ATTRIBUTES.has(lower)) continue;
      const jsxName = JSON.stringify(lower.startsWith("data-") || lower.startsWith("aria-") ? lower : lower);
      if (isRoot && lower === "hidden") { entries.push('"hidden": open ? undefined : ""'); this.usesOpen = true; continue; }
      if (value === true || (value === "" && ["hidden", "disabled", "checked", "selected", "readonly", "required", "multiple", "open", "inert"].includes(lower))) {
        if (isControl && ["disabled", "checked", "readonly"].includes(lower)) continue;   // 입력 요소의 이 상태는 prop 이 정한다(ctlState)
        entries.push(`${jsxName}: ""`);
        continue;
      }
      if (isRoot && this.variants.length > 1 && this.variants.includes(String(value))) { entries.push(`${jsxName}: variant ?? ${literal(String(value))}`); continue; }
      if (isRoot && this.sizes.length > 1 && this.sizes.includes(String(value))) { entries.push(`${jsxName}: size ?? ${literal(String(value))}`); continue; }
      entries.push(`${jsxName}: ${literal(String(value))}`);
    }
    if (isControl) entries.push("...ctlState");
    if (part && !isTemplate) entries.push(`...(${scope.slotAttrs(part)} ?? {})`);
    if (isTemplate) entries.push(`...${scope.attrs()}`);
    if (leaf && !part && isTextOnly(node) && node.children.length) entries.push(`...(${leaf.attrs} ?? {})`);

    const pieces = [`k=${literal(key)}`];
    if (isRoot) pieces.unshift(`t={SPEC.templates[tpl]}`);
    pieces.push(`a={{ ${entries.join(", ")} }}`);
    if (isControl) pieces.push("ctl={ctl}");
    if (isControl && this.controlIsCheck) pieces.push("onPress={onControlPress}");
    if (node.tag === "label" && attributeValue(node, "for") !== undefined && this.controlNode) pieces.push("onPress={onControlPress}");
    if (isTemplate) pieces.push(`at={[index${scope.depth}, all${scope.depth}.length]}`, `props={propsOf(scope${scope.depth})}`, `key={keyOf(item${scope.depth}, index${scope.depth})}`);
    if (extra) {
      for (const piece of extra) {
        pieces.push(piece);
        const match = /^key=\{keyOf\(item(\d+), index(\d+)\)\}$/.exec(piece);
        if (match) pieces.push(`at={[index${match[2]}, all${match[1]}.length]}`, `props={propsOf(scope${match[1]})}`);
      }
    }
    if (isRoot) pieces.push("controller={controller}", "partProps={partProps}", "style={style}", "outer={outer}", "omit={omit}", "lifted={lifted}", "forceState={forceState}", "{...rest}");
    return ` ${pieces.join(" ")}`;
  }

  element(node, options) {
    const { isRoot = false, indent } = options;
    const key = this.keyOf(node);
    if (SVG_TAGS[node.tag]) return this.svgElement(node, indent);
    this.visited.push({ node, key, isRoot });
    if (this.isNested(node)) return this.nestedElement(node, options);
    const part = partOf(node);
    const attributes = this.attributeText(node, { ...options, part });
    const children = this.childrenText(node, { scope: options.scope, indent: `${indent}  `, part, isRoot, leaf: options.leaf });
    const tag = isRoot ? "Root" : "El";
    if (children === null) return `${indent}<${tag}${attributes} />`;
    return `${indent}<${tag}${attributes}>\n${children}\n${indent}</${tag}>`;
  }

  /* react.mjs 의 childrenText 와 같다. 단 하나 — 루트의 이름 없는 자식(탭 내용·안에 든 부품 등)을 맨 끝이 아니라
     **원래 자리**에 둔다. 순서가 바뀌면 RN 에서는 화면 순서가 그대로 바뀐다(웹은 CSS order 가 없어 같은 문제가 드러나지 않았다). */
  childrenText(node, { scope, indent, part, isRoot, leaf }) {
    if (VOID_ELEMENTS.has(node.tag)) return null;
    if (this.variableTemplates.has(node)) return this.variableChildren(node, { scope, indent });
    if (leaf && !part && isTextOnly(node) && node.children.length) return `${indent}{${leaf.content(textOf(node))}}`;
    if (part && isTextOnly(node)) return `${indent}{${scope.content(part, textOf(node))}}`;
    if (node.children.length === 0) return part ? `${indent}{${scope.content(part, "")}}` : null;
    /* 루트 자신이 글자만 담고 있으면(gnb 하위 메뉴 항목 등) 그 글자는 children 으로 갈아끼운다. */
    if (isRoot && !part && isTextOnly(node)) {
      this.hasChildrenSlot = true;
      return `${indent}{children === undefined ? ${literal(textOf(node))} : children}`;
    }

    const repeats = adjacentRepeatGroups(node);
    const pieces = [];
    const literalChildren = [];
    let slotAt = -1;
    for (const child of node.children) {
      if (child.type === "text") { pieces.push(`${indent}{${literal(child.value)}}`); continue; }
      if (repeats.get(child) === null) continue;
      if (repeats.has(child)) { pieces.push(this.listText(repeats.get(child), { scope, indent })); continue; }
      if (isRoot && !partOf(child)) {
        if (slotAt === -1) { slotAt = pieces.length; pieces.push(null); }
        literalChildren.push(child);
        continue;
      }
      pieces.push(this.element(child, { scope, indent, leaf }));
    }
    if (literalChildren.length) {
      this.hasChildrenSlot = true;
      const rendered = literalChildren.map((child) => this.element(child, { scope, indent: `${indent}    ` })).join("\n");
      pieces[slotAt] = `${indent}{children === undefined ? (\n${indent}  <>\n${rendered}\n${indent}  </>\n${indent}) : children}`;
    }
    return pieces.length ? pieces.join("\n") : null;
  }

  /* react.mjs 의 listText 와 같다 — 기본 데이터만 rnDefaultItem 으로 만든다. */
  listText(group, { scope, indent }) {
    const template = group.members[0];
    const variable = isVariable(group.members);
    if (variable) this.variableTemplates.set(template, group.members);
    const defaults = group.members.map((member) => variable
      ? this.variableDefault(member, template, group.members)
      : rnDefaultItem(member, template, this.ids));
    const depth = scope.depth + 1;
    const innerScope = new ItemScope(depth);
    let source;
    if (scope.depth === 0) {
      const prop = pluralize(group.part);
      const constant = `DEFAULT_${constantNameOf(prop)}${this.suffix}`;
      this.rootLists.push({ part: group.part, prop, constant, defaults });
      source = `${prop} ?? ${constant}(uid)`;
    } else {
      this.counter += 1;
      const constant = `DEFAULT_${constantNameOf(pluralize(group.part))}_${this.counter}${this.suffix}`;
      this.nestedLists.push({ constant, defaults });
      source = `list(${scope.name}, ${literal(camel(pluralize(group.part)))}, ${constant}(uid))`;
    }
    const body = this.element(template, { scope: innerScope, isTemplate: true, indent: `${indent}    ` });
    return `${indent}{(${source}).map((item${depth}, index${depth}) => {\n`
      + `${indent}  const scope${depth} = scopeOf(item${depth});\n`
      + `${indent}  return (\n${body}\n${indent}  );\n`
      + `${indent}})}`;
  }

  svgElement(node, indent) {
    const name = SVG_TAGS[node.tag];
    this.svgUsed.add(name);
    const attributes = node.attributes
      .filter(([attribute]) => !["role", "aria-hidden", "xmlns"].includes(attribute.toLowerCase()))
      .map(([attribute, value]) => {
        const jsx = attribute.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (jsx === "fill" && value === "currentColor") return "fill={svgColor}";
        return value === true ? jsx : `${jsx}=${literal(String(value))}`;
      });
    if (node.tag === "svg") attributes.push('width="100%"', 'height="100%"');
    const kids = node.children.filter((child) => child.type === "element").map((child) => this.svgElement(child, `${indent}  `));
    if (kids.length === 0) return `${indent}<${name} ${attributes.join(" ")} />`;
    return `${indent}<${name} ${attributes.join(" ")}>\n${kids.join("\n")}\n${indent}</${name}>`;
  }

  /** 다른 부품이 이 자리에 들어간 경우 — 바깥 CSS 가 이 자리에 주는 값은 N 이 계산하고, 안쪽은 그 부품이 그린다. */
  nestedElement(node, { scope, indent, extra, isTemplate, leaf }) {
    const nestedId = attributeValue(node, "data-s1-component");
    const manifest = this.manifests.get(nestedId);
    if (!manifest) throw new Error(`${this.id}: 안에 들어간 부품 ${nestedId} 의 배포본 정보를 찾지 못했습니다.`);
    this.nestedImports.add(nestedId);
    const key = this.keyOf(node);
    const props = [];
    const attrs = {};
    for (const [name, value] of node.attributes) {
      const lower = name.toLowerCase();
      attrs[lower] = value === true ? "" : String(value);
      const isVariant = /^data-/.test(lower) && (manifest.variants ?? []).includes(String(value));
      const isSize = /^data-/.test(lower) && (manifest.sizes ?? []).includes(String(value));
      if (isVariant) props.push(`variant: ${literal(String(value))}`);
      else if (isSize) props.push(`size: ${literal(String(value))}`);
      else if (lower === "disabled") props.push("disabled: true");
      else if (lower === "hidden") props.push('hidden: ""');
      else if ((/^data-/.test(lower) && !lower.startsWith("data-s1") && lower !== "data-break") || (/^aria-/.test(lower) && !["aria-hidden", "aria-label"].includes(lower))) {
        /* 안에 들어간 부품의 상태 속성(data-state · aria-selected …) — 그 부품이 구조·모양을 고르는 데 쓴다 */
        props.push(`${JSON.stringify(lower)}: ${literal(value === true ? "" : String(value))}`);
      }
    }
    /* 안쪽 부품의 칸 중 이 자리에 없는 것은 그리지 않는다(예: 표 안의 체크박스는 label 이 없다). */
    const present = new Set();
    const texts = {};
    const walk = (current) => {
      for (const child of current.children) {
        if (child.type !== "element") continue;
        const childPart = partOf(child);
        if (childPart) {
          present.add(childPart);
          if (isTextOnly(child) && textOf(child)) texts[camel(childPart)] = textOf(child);
        }
        if (attributeValue(child, "checked") !== undefined || child.attributes.some(([n]) => n === "checked")) props.push("checked: true");
        if (child.attributes.some(([n]) => n === "disabled")) props.push("disabled: true");
        const aria = attributeValue(child, "aria-label");
        if (aria !== undefined && !props.some((p) => p.startsWith('"aria-label"'))) props.push(`"aria-label": ${literal(aria)}`);
        walk(child);
      }
    };
    walk(node);
    const ownAria = attributeValue(node, "aria-label");
    if (ownAria !== undefined) props.push(`"aria-label": ${literal(ownAria)}`);
    /* 안에 들어간 부품의 기본 상태(예: 첫 인스턴스가 선택 상태)가 이 자리에 없던 것이면 지운다. */
    for (const name of Object.keys(this.nestedDefaults.get(nestedId) ?? {})) {
      if (STATE_ATTRIBUTE.test(name) && !node.attributes.some(([n]) => n.toLowerCase() === name)) props.push(`${JSON.stringify(name)}: undefined`);
    }
    const controlPart = [...present].includes("control") ? "control" : null;
    /* 안에 들어간 부품이 되풀이 칸(탭·옵션 …)을 가진 경우 — 이 자리에 쓴 항목을 그 부품의 목록 prop 으로 넘긴다. */
    for (const group of [...adjacentRepeatGroups(node).values()].filter(Boolean)) {
      if (!(manifest.parts ?? []).includes(group.part)) continue;
      props.push(`${camel(pluralize(group.part))}: ${JSON.stringify(group.members.map((member) => fullItem(member, this.nestedDefaults.get(nestedId) ?? {})))}`);
    }
    const omit = (manifest.parts ?? []).filter((part) => !present.has(part));
    if (omit.length > 0) props.push(`omit: ${JSON.stringify(omit)}`);
    if (Object.keys(texts).length > 0) props.push(`parts: ${JSON.stringify(texts)}`);
    const entries = Object.entries(attrs).map(([name, value]) => `${JSON.stringify(name)}: ${literal(value)}`);
    /* 목록의 항목마다 안쪽 입력 요소의 상태(checked 등)가 다를 수 있다 — 항목 데이터가 이긴다. */
    const fromItem = `${controlPart ? `, ...nestedFrom(${scope.slotAttrs(controlPart)})` : ""}${leaf && scope.depth > 0 ? `, ...attrProps(${scope.attrs()})` : `, ...attrProps(${scope.slotAttrs(nestedKeyOf(node))})`}`;
    const pieces = [`k=${literal(key)}`, `as={${nestedComponentName(nestedId)}}`, `a={{ ${entries.join(", ")} }}`, `p={{ ${props.join(", ")}${fromItem} }}`];
    if (scope.depth > 0 && extra) {
      for (const piece of extra) {
        pieces.push(piece);
        const match = /^key=\{keyOf\(item(\d+), index(\d+)\)\}$/.exec(piece);
        if (match) pieces.push(`at={[index${match[2]}, all${match[1]}.length]}`);
      }
    }
    /* 안에 들어간 부품의 루트가 글자를 직접 담고 있으면(하위 메뉴 항목 등) 그 글자를 children 으로 넘긴다. */
    if (node.children.length > 0 && isTextOnly(node)) {
      const text = textOf(node);
      const ownPart = partOf(node);
      const expression = leaf && !ownPart ? leaf.content(text) : ownPart ? scope.content(ownPart, text) : `slot(${scope.name}, ${literal(nestedKeyOf(node))}).content ?? ${literal(text)}`;
      return `${indent}<N ${pieces.join(" ")}>{${expression}}</N>`;
    }
    return `${indent}<N ${pieces.join(" ")} />`;
  }
}

const nestedComponentName = (id) => `S1${pascal(id)}`;

/* ── 3. 부품 하나 만들기 ─────────────────────────────────────────────── */

/**
 * @returns { source, spec, facts, coverage }
 *   source  부품 파일(JSX)
 *   spec    { styles[], templates[{ id, break, mode, variants, nodes, tables }] } — specs/{id}.js 로 굳힌다
 */
export function buildRnComponent({ component, rules, converter, manifests, nestedDefaults }) {
  const { id, manifest, exampleByBreak } = component;
  const variants = manifest.variants ?? [];
  const sizes = manifest.sizes ?? [];
  const jsRequired = Boolean(manifest.jsRequired);
  const notes = [];

  /* ① 템플릿 목록: 예제 키 → (화면, 모드) → 구조 묶음 */
  const entries = [];
  for (const [exampleKey, html] of Object.entries(exampleByBreak)) {
    const { breakName, mode } = readExampleKey(exampleKey);
    const tree = parseHtml(augmentExample(id, html), id);
    const instances = allInstances(tree, id);
    for (const group of structureGroups(instances, manifest)) {
      entries.push({ exampleKey, breakName, mode, group, instance: group.instance, instanceIndex: instances.indexOf(group.instance) });
    }
  }
  /* 같은 (화면, 모드)에서 구조 묶음이 하나뿐이면 변형 선택이 필요 없다. */
  const templates = [];
  const sources = [];
  const styles = [];
  const styleIndex = new Map();
  const remap = (localStyles) => localStyles.map((style) => {
    const text = JSON.stringify(style);
    if (!styleIndex.has(text)) { styleIndex.set(text, styles.length); styles.push(style); }
    return styleIndex.get(text);
  });

  const rootLists = [];
  const nestedLists = [];
  const knownConstants = new Set();
  let hasChildrenSlot = false;
  let usesOpen = false;
  let controlFacts = null;
  const nestedImports = new Set();
  const svgUsed = new Set();
  const eventDefs = (manifest.javascript?.events ?? []).map((eventName) => ({ eventName, propName: null }));
  let behavior = null;
  const behaviorConfigs = [];

  const perBreakGroups = new Map();
  for (const entry of entries) {
    const key = `${entry.breakName}|${entry.mode ?? ""}`;
    if (!perBreakGroups.has(key)) perBreakGroups.set(key, []);
    perBreakGroups.get(key).push(entry);
  }

  /* 같은 (화면, 모드) 안에서 구조가 갈리는 묶음이 여럿이면, 무엇이 묶음을 가르는지(루트 속성)를 찾는다.
     예: list-row 는 유형(data-type)이 구조를 가르고, bottom-sheet-option 은 선택 상태(data-state)가 check 칸의 유무를 가른다. */
  const SELECTOR_SKIP = new Set(["data-s1-component", "data-break", "id", "aria-label", "aria-labelledby", "aria-describedby", "aria-controls", "hidden", "title", "placeholder", "role", "type", "tabindex", "class", "style", "data-s1-part", "disabled", "checked", "readonly", "required", "selected"]);
  const selectorAttrsOf = (list) => {
    if (list.length < 2) return [];
    const names = new Set();
    /* 크기 속성은 구조를 가르지 않는다 — 같은 구조가 크기만 달리 쓰인 것이다. */
    for (const entry of list) for (const instanceNode of entry.group.instances) for (const [name, value] of instanceNode.attributes) if (!SELECTOR_SKIP.has(name.toLowerCase()) && !sizes.includes(String(value))) names.add(name.toLowerCase());
    const valuesOf = (entry, name) => [...new Set(entry.group.instances.map((one) => { const found = one.attributes.find(([n]) => n.toLowerCase() === name); return found ? (found[1] === true ? "" : String(found[1])) : null; }))].sort();
    return [...names].filter((name) => new Set(list.map((entry) => JSON.stringify(valuesOf(entry, name)))).size > 1);
  };
  const selectorValues = (entry, name) => [...new Set(entry.group.instances.map((one) => { const found = one.attributes.find(([n]) => n.toLowerCase() === name); return found ? (found[1] === true ? "" : String(found[1])) : null; }))].filter((value) => value !== null);

  /* 속성으로는 고를 수 없는 묶음(앞 묶음과 같은 값으로만 설명되는 것)은 버린다 — 같은 부품의 내용만 다른 예시다. */
  const pickIndex = (current, group) => {
    let best = 0;
    let bestScore = -1;
    group.forEach((candidate, position) => {
      let score = 0;
      let ok = true;
      for (const [name, values] of Object.entries(candidate.selects)) {
        const value = current[name];
        if (value === undefined || values.length === 0) continue;
        if (values.includes(value)) score += 1; else ok = false;
      }
      if (ok && score > bestScore) { best = position; bestScore = score; }
    });
    return best;
  };
  for (const [key, original] of [...perBreakGroups]) {
    if (original.length < 2) continue;
    const names = selectorAttrsOf(original);
    const withSelects = original.map((entry) => ({ entry, selects: Object.fromEntries(names.map((name) => [name, selectorValues(entry, name)])) }));
    const reachable = withSelects.filter((candidate, position) => {
      const options = names.map((name) => [undefined, ...candidate.selects[name]]);
      const combos = options.reduce((acc, values) => acc.flatMap((one) => values.map((value) => [...one, value])), [[]]);
      return combos.some((combo) => pickIndex(Object.fromEntries(names.map((name, i) => [name, combo[i]])), withSelects) === position);
    });
    if (reachable.length !== original.length) perBreakGroups.set(key, reachable.map(({ entry }) => entry));
  }

  let index = 0;
  for (const [, list] of perBreakGroups) {
    const selectorAttrs = selectorAttrsOf(list);
    for (const entry of list) {
      const { breakName, mode, group, instance } = entry;
      const groupVariants = list.length > 1 ? group.variants : variants;
      const breakSizes = manifest.breaks?.[breakName]?.length ? manifest.breaks[breakName] : sizes;
      const axis = new Map();
      for (const [attributeName, attributeValueText] of instance.attributes) {
        const lower = attributeName.toLowerCase();
        if (variants.includes(String(attributeValueText))) axis.set(lower, groupVariants.length ? groupVariants : variants);
        else if (sizes.includes(String(attributeValueText))) axis.set(lower, breakSizes);
      }
      const wrapperAttributes = { "data-theme": "light", "data-s1-break": breakName };
      /* 다른 부품이 들어간 자리 — 단, 그 부품이 자기 칸 이름에 없는 칸을 품고 있으면(date-picker 가 bottom-sheet 껍데기에
         calendar-wrap 을 끼운 경우) 부품을 따로 그리지 않고 **이 자리에서 함께** 그린다(껍데기 CSS 는 속성으로 걸린다). */
      const nestedOf = (parsed, isRoot) => nestedIdOf(parsed, { id, isRoot, manifests });
      const template = buildTemplate(instance, { id, wrapperAttributes, nestedOf });
      /* RN 에는 문서 전체 id 가 없다 — 요소끼리 잇는 id(탭↔내용 등)는 예제의 값 그대로 쓰고 uid 로 바꾸지 않는다. */
      const ids = new Set();
      const controlNode = primaryControl(instance);
      const suffix = `_${index}`;
      const emitter = new RnEmitter({
        id, ids, idSlugs: new Map(), controlNode, variants: groupVariants, sizes, suffix,
        keys: template.keys, template, manifests, nestedDefaults, nestedOf
      });
      emitter.rootNode = instance;
      emitter.usesOpen = false;
      emitter.controlIsCheck = controlNode && controlNode.tag === "input" && ["checkbox", "radio"].includes(String(attributeValue(controlNode, "type")));
      const body = emitter.element(instance, { scope: makeRootScope(), isRoot: true, indent: "      " });
      const codeBody = body.replace(/\.map\(\(item(\d+), index(\d+)\) =>/g, ".map((item$1, index$2, all$1) =>");

      for (const item of emitter.rootLists) if (!knownConstants.has(item.constant)) { knownConstants.add(item.constant); rootLists.push(item); }
      for (const item of emitter.nestedLists) if (!knownConstants.has(item.constant)) { knownConstants.add(item.constant); nestedLists.push(item); }
      hasChildrenSlot = hasChildrenSlot || emitter.hasChildrenSlot;
      if (emitter.usesOpen) usesOpen = true;
      for (const nestedId of emitter.nestedImports) nestedImports.add(nestedId);
      for (const name of emitter.svgUsed) svgUsed.add(name);
      if (controlNode && !controlFacts) {
        controlFacts = { tag: controlNode.tag, type: String(attributeValue(controlNode, "type") ?? "text"), isCheck: emitter.controlIsCheck, key: template.keys.get(controlNode), checked: controlNode.attributes.some(([n]) => n === "checked") };
      }

      /* 표: 방문한 요소 + 가상요소 */
      const visitedKeys = [...new Set(emitter.visited.map(({ key }) => key))];
      const targets = visitedKeys.map((key) => ({ key, pseudoElement: null }));
      for (const key of visitedKeys) {
        const node = template.nodes.get(key);
        if (node.nested) continue;
        for (const pseudoElement of ["before", "after", "placeholder"]) {
          if (pseudoElement === "placeholder" && node.tag !== "input" && node.tag !== "textarea") continue;
          if (probe(node, rules, pseudoElement, mediaActive, axis).candidates.length > 0) targets.push({ key, pseudoElement });
        }
      }
      const axisValues = axis;
      const built = buildTables(template, targets, { rules, converter, axisValues, where: `${id}/${entry.exampleKey}` });
      notes.push(...built.notes);
      const map = remap(built.styles);
      const tables = {};
      const psByNode = new Map();
      for (const [tableKey, table] of Object.entries(built.tables)) {
        const converted = table.s !== undefined ? { s: map[table.s] } : { dims: table.dims, map: Object.fromEntries(Object.entries(table.map).map(([k, v]) => [k, map[v]])) };
        const [hostKey, pseudo] = tableKey.split("::");
        if (pseudo === "before" || pseudo === "after") {
          const used = (table.s !== undefined ? [table.s] : [...new Set(Object.values(table.map))]).some((localIndex) => built.styles[localIndex].content !== undefined && built.styles[localIndex].display !== "none");
          if (!used) continue;
        }
        if (pseudo === "placeholder") {
          const used = (table.s !== undefined ? [table.s] : [...new Set(Object.values(table.map))]).some((localIndex) => built.styles[localIndex].color !== undefined);
          if (!used) continue;
        }
        tables[tableKey] = converted;
        if (pseudo) { if (!psByNode.has(hostKey)) psByNode.set(hostKey, []); psByNode.get(hostKey).push(pseudo); }
      }

      /* 요소 메타: 어떤 상호작용을 들어야 하나(ix) · 다른 요소가 읽나(ref) · 형제/자손이 읽나(lift) */
      const nodes = {};
      const ancestorsOf = (node) => { const out = new Set(); let current = node; while (current) { out.add(current.key); current = current.parent; } return out; };
      for (const key of visitedKeys) {
        const node = template.nodes.get(key);
        nodes[key] = { tag: node.tag };
        const part = node.attributes["data-s1-part"];
        if (part !== undefined) nodes[key].part = part;
        if (psByNode.has(key)) nodes[key].ps = psByNode.get(key);
        if (node.tag === "img") {
          const source = attributeValue(node.parsed, "src");
          const box = typeof source === "string" ? /viewBox%3D%27\s*0%200%20([\d.]+)%20([\d.]+)/.exec(source) ?? /viewBox=['"]0 0 ([\d.]+) ([\d.]+)/.exec(decodeURIComponent(source)) : null;
          if (box) nodes[key].aspect = Number(box[1]) / Number(box[2]);
        }
        if (node.nested) nodes[key].nested = node.nested;
      }
      for (const [tableKey, table] of Object.entries(tables)) {
        const hostKey = tableKey.split("::")[0];
        if (table.s !== undefined) continue;
        const hostAncestors = ancestorsOf(template.nodes.get(hostKey));
        for (const dim of table.dims) {
          if (dim.n === "w") continue;
          const target = nodes[dim.n];
          if (!target) continue;
          if (dim.n !== hostKey) {
            target.ref = true;
            if (!hostAncestors.has(dim.n)) target.lift = true;
          }
          if (dim.p) {
            const mapped = dim.p === "hover" ? "hover" : dim.p === "active" ? "active" : ["focus", "focus-visible", "focus-within"].includes(dim.p) ? "focus" : null;
            if (mapped) { target.ix = target.ix ?? []; if (!target.ix.includes(mapped)) target.ix.push(mapped); }
          }
        }
      }
      for (const meta of Object.values(nodes)) if (meta.ix) meta.ix.sort();

      const rootAttributes = {};
      for (const [attributeName, attributeValueText] of instance.attributes) rootAttributes[attributeName.toLowerCase()] = attributeValueText === true ? "" : String(attributeValueText);
      const found = behaviorFor(id, { instance, rootAttributes });
      if (found) {
        if (behavior && behavior.kind !== found.kind) throw new Error(`${id}: 템플릿마다 동작 종류가 다릅니다(${behavior.kind} · ${found.kind}).`);
        behavior = found;
      }
      behaviorConfigs[index] = found ? found.config : null;
      const selects = Object.fromEntries(selectorAttrs.map((name) => [name, selectorValues(entry, name)]));
      const axisNames = { variant: null, size: null };
      for (const [attributeName, attributeValueText] of instance.attributes) {
        const lower = attributeName.toLowerCase();
        if (variants.includes(String(attributeValueText))) axisNames.variant = lower;
        else if (sizes.includes(String(attributeValueText))) axisNames.size = lower;
      }
      const metrics = {};
      /* 휠의 한 칸 간격(피치) = 칸 높이 + 열의 행 간격 — CSS 가 계산한 값에서 읽는다(손으로 적지 않는다). */
      if (found && id === "time-picker") {
        const keyOfPart = (part) => Object.keys(nodes).find((one) => nodes[one].part === part);
        const stylesOf = (key) => {
          const table = tables[key];
          const indexes = table.s !== undefined ? [table.s] : [...new Set(Object.values(table.map))];
          return indexes.map((one) => styles[one]);
        };
        const cellKey = keyOfPart("wheel-cell");
        const colKey = keyOfPart("wheel-col");
        if (cellKey && colKey) {
          const cellBasis = Math.max(...stylesOf(cellKey).map((style) => (typeof style.flexBasis === "number" ? style.flexBasis : 0)));
          const gap = Math.max(...stylesOf(colKey).map((style) => (typeof style.rowGap === "number" ? style.rowGap : 0)));
          metrics.pitch = cellBasis + gap;
        }
      }
      const rootTable = tables.n0;
      const rootStyleIndexes = rootTable.s !== undefined ? [rootTable.s] : [...new Set(Object.values(rootTable.map))];
      const overlay = rootStyleIndexes.some((styleIndex) => styles[styleIndex].position === "fixed") ? "modal" : undefined;
      templates.push({
        overlay,
        id: `${breakName}${mode ? `:${mode}` : ""}${list.length > 1 ? `#${group.variants.join("+") || "default"}.${list.indexOf(entry)}` : ""}`,
        break: breakName, mode, variants: list.length > 1 ? group.variants : null,
        rootAttributes, axis: axisNames, src: { example: entry.exampleKey, instance: entry.instanceIndex }, selects,
        nodes, tables, metrics: Object.keys(metrics).length ? metrics : undefined
      });
      sources.push({ index, breakName, mode, variants: list.length > 1 ? group.variants : null, selects, body: codeBody, hasControl: Boolean(controlNode) });
      index += 1;
    }
  }

  const spec = { id, styles, templates: templates.map((t) => ({ ...t, id: undefined, name: t.id })) };

  /* ② prop 이름 */
  const breaks = [...new Set(entries.map((e) => e.breakName))];
  const modes = [...new Set(entries.map((e) => e.mode).filter(Boolean))];
  const eventPropNames = eventDefs.map(({ eventName }) => ({ eventName, propName: rnEventProp(eventName) }));
  const controlProps = controlFacts
    ? controlFacts.isCheck
      ? ["checked", "defaultChecked", "onCheckedChange", "disabled", "name"]
      : ["value", "defaultValue", "onChangeText", "onFocus", "onBlur", "placeholder", "disabled", "readOnly", "invalid", "maxLength", "inputRef"]
    : [];

  const facts = {
    id,
    componentName: `S1${pascal(id)}`,
    breaks,
    modes,
    sizeBreaks: manifest.breaks ?? null,
    variants,
    sizes,
    parts: (manifest.parts ?? []).map((part) => camel(part)),
    lists: rootLists,
    controlProps,
    isCheckLike: Boolean(controlFacts?.isCheck),
    events: eventPropNames,
    hasChildrenSlot,
    hasOpen: usesOpen,
    behaviorKind: behavior ? behavior.kind : null,
    behaviorProps: behavior ? [...new Set(Object.values(behavior.props))].filter((name) => name !== 'variant') : [],
    axisAttrs: axisAttrsOf(templates),
    jsRequired,
    templates: templates.map((t) => ({ name: t.id, break: t.break, mode: t.mode, variants: t.variants }))
  };

  const source = componentSource({ id, manifest, facts, sources, usesOpen, behavior, behaviorConfigs, rootLists, nestedLists, nestedImports, svgUsed, controlFacts, modes, breaks, variants, sizes, hasChildrenSlot, eventPropNames });
  return { source, spec, facts, notes };
}

function axisAttrsOf(templates) {
  const out = { variant: null, size: null };
  for (const template of templates) {
    out.variant = out.variant ?? template.axis.variant;
    out.size = out.size ?? template.axis.size;
  }
  return out;
}

const rnEventProp = (eventName) => {
  const last = eventName.split(":").pop();
  if (last === "selectionchange") return "onSelectionChange";
  return `on${pascal(last)}`;
};

/* 루트 범위 — react.mjs 의 RootScope 와 같은 일을 한다(밖에서 내용을 갈아끼우는 통로). */
function makeRootScope() {
  return {
    depth: 0,
    name: "partScope",
    attrs() { return null; },
    content(part, fallback) { return `slot(partScope, ${literal(camel(part))}).content ?? ${literal(fallback)}`; },
    slotAttrs(part) { return `slot(partScope, ${literal(camel(part))}).attrs`; }
  };
}

/* ── 4. 부품 파일 본문 ───────────────────────────────────────────────── */

function componentSource({ id, manifest, facts, sources, usesOpen, behavior, behaviorConfigs, rootLists, nestedLists, nestedImports, svgUsed, controlFacts, modes, breaks, variants, sizes, hasChildrenSlot, eventPropNames }) {
  const componentName = facts.componentName;
  const listConstants = [...rootLists, ...nestedLists]
    .map(({ constant, defaults }) => `const ${constant} = (uid) => [${defaults.map(dataSourceOf).join(", ")}];`)
    .join("\n");

  /* 동작이 받는 prop — 이미 선언된 것(입력 prop·이벤트)은 다시 선언하지 않는다. */
  const declared = new Set([
    ...facts.controlProps, ...eventPropNames.map(({ propName }) => propName), usesOpen ? "open" : "", hasChildrenSlot ? "children" : "",
    variants.length > 1 ? "variant" : "", sizes.length > 1 ? "size" : "", breaks.length > 1 ? "breakName" : "", modes.length > 0 ? "mode" : "", "parts",
    ...rootLists.map(({ prop }) => prop)
  ]);
  const behaviorExternal = behavior ? [...new Set(Object.values(behavior.props))].filter((name) => !declared.has(name)) : [];
  const propNames = [
    variants.length > 1 ? "variant" : null,
    sizes.length > 1 ? "size" : null,
    breaks.length > 1 ? "breakName = DEFAULT_BREAK" : null,
    modes.length > 0 ? "mode" : null,
    "parts",
    ...[...new Set(rootLists.map(({ prop }) => prop))],
    ...facts.controlProps,
    ...eventPropNames.map(({ propName }) => propName),
    hasChildrenSlot ? "children" : null,
    usesOpen ? "open" : null,
    ...behaviorExternal,
    "partProps",
    "style", "outer", "omit", "lifted: initialLifted", "forceState", "...rest"
  ].filter(Boolean);

  const imports = [`import { useId, useState } from "react";`, `import { El, N, Root${svgUsed.size ? ", useSvgColor" : ""}, attrProps, nestedFrom, propsOf } from "../engine.js";${behavior ? `\nimport { useBehavior } from "../behaviors.js";` : ""}`, `import { scopeOf, slot${rootLists.length || nestedLists.length ? ", attrsOf, keyOf" : ""}${nestedLists.length ? ", list" : ""} } from "../runtime.js";`, `import SPEC from "../specs/${id}.js";`];
  if (svgUsed.size) {
    const named = [...svgUsed].filter((name) => name !== "Svg").sort();
    imports.push(`import Svg${named.length ? `, { ${named.join(", ")} }` : ""} from "react-native-svg";`);
  }
  for (const nestedId of [...nestedImports].sort()) imports.push(`import ${nestedComponentName(nestedId)} from "./${nestedId}.js";`);

  const selection = templateSelection(sources, breaks, modes);
  const selectorNames = [...new Set(sources.flatMap((source) => Object.keys(source.selects ?? {})))];
  const axisNames = new Set(facts.axisNames ?? []);

  const behaviorBlock = behavior ? behaviorSource(behavior, behaviorConfigs, declared, behaviorExternal) : "  const controller = undefined;\n";
  const controlBlock = controlFacts ? controlSource(controlFacts) : "  const lifted = initialLifted;\n";
  const stateBlock = `  const uid = useId();
  const partScope = scopeOf(parts);
${variants.length > 1 ? `  assertAllowed("variant", variant, VARIANTS);\n` : ""}${sizes.length > 1 ? `  assertAllowed("size", size, SIZES);\n` : ""}${breaks.length > 1 ? `  assertAllowed("breakName", breakName, BREAKS);\n` : ""}${modes.length > 0 ? `  assertAllowed("mode", mode, MODES);\n` : ""}`;

  const renderSource = sources.map(({ index, body }) => `  if (tpl === ${index}) {\n    return (\n${body}\n    );\n  }`).join("\n");

  const needsSvgColor = svgUsed.size > 0 ? "  const svgColor = useSvgColor();\n" : "";

  return `/* ${GENERATED_NOTE} */
/* ${componentName} — 승인된 배포본 마크업을 그대로 옮긴 React Native 부품.
   마크업을 새로 쓰지 않는다. dist/examples/${id}*.html 의 승인 인스턴스에서 옮긴 것이다.
   치수·색은 이 파일에 없다 — specs/${id}.js 의 표(배포본 CSS 를 캐스케이드까지 계산한 결과)에서 온다. */
${imports.join("\n")}

export const BREAKS = ${JSON.stringify(breaks)};
export const DEFAULT_BREAK = ${literal(breaks[0])};
export const VARIANTS = ${JSON.stringify(variants)};
export const SIZES = ${JSON.stringify(sizes)};
export const MODES = ${JSON.stringify(modes)};
export const PARTS = ${JSON.stringify(manifest.parts ?? [])};
${listConstants ? `\n/* 예제에 있던 내용 — prop 을 주지 않으면 이게 그려진다. */\n${listConstants}\n` : ""}
function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(\`[s1-ui] ${id}: 승인되지 않은 \${label} "\${value}". 쓸 수 있는 값: \${allowed.join(", ")}\`);
}

${behavior ? `/* 동작의 처음 상태 — 승인 예제가 정한 값(고른 탭·열린 카드·체크된 줄 …). 템플릿(화면·모드·유형)마다 하나. */\nconst BEHAVIOR = ${JSON.stringify(behaviorConfigs.map((one) => one ?? null))};\n\n` : ""}${selection}

export default function ${componentName}({ ${propNames.join(", ")} }) {
${stateBlock}  const tpl = pickTemplate(${breaks.length > 1 ? "breakName" : "DEFAULT_BREAK"}, ${modes.length > 0 ? "mode" : "undefined"}, ${currentSource(selectorNames, facts)});
${needsSvgColor}${behaviorBlock}${controlBlock}
${renderSource}
  throw new Error("[s1-ui] ${id}: 그릴 템플릿을 고르지 못했습니다.");
}
`;
}

/** 템플릿을 고르는 속성의 지금 값 — 변형·크기는 prop 에서, 나머지는 루트에 직접 준 속성(rest)에서 읽는다. */
function currentSource(names, facts) {
  if (names.length === 0) return "undefined";
  const parts = names.map((name) => {
    const source = name === facts.axisAttrs?.variant ? "variant" : name === facts.axisAttrs?.size ? "size" : `rest[${literal(name)}]`;
    return `${JSON.stringify(name)}: ${source}`;
  });
  return `{ ${parts.join(", ")} }`;
}

function templateSelection(sources, breaks, modes) {
  const lines = [
    "/* 같은 화면·모드에 구조가 다른 템플릿이 여럿이면, 루트 속성이 가장 많이 맞는 것을 고른다(안 준 속성은 따지지 않는다). */",
    "function pickGroup(current, groups) {",
    "  let best = groups[0];",
    "  let bestScore = -1;",
    "  for (const group of groups) {",
    "    let score = 0;",
    "    let ok = true;",
    "    for (const [name, values] of Object.entries(group.values)) {",
    "      const value = current?.[name];",
    "      if (value === undefined || values.length === 0) continue;",
    "      if (values.includes(String(value))) score += 1; else ok = false;",
    "    }",
    "    if (ok && score > bestScore) { best = group; bestScore = score; }",
    "  }",
    "  return best.index;",
    "}",
    "",
    "function pickTemplate(breakName, mode, current) {"
  ];
  for (const breakName of breaks) {
    const inBreak = sources.filter((s) => s.breakName === breakName);
    const modeList = [...new Set(inBreak.map((s) => s.mode))];
    for (const mode of modeList) {
      const atMode = inBreak.filter((s) => s.mode === mode);
      const cond = [`breakName === ${literal(breakName)}`];
      if (modes.length > 0) cond.push(mode === null ? "(mode === undefined || mode === \"base\")" : `mode === ${literal(mode)}`);
      lines.push(`  if (${cond.join(" && ")}) {`);
      if (atMode.length === 1) lines.push(`    return ${atMode[0].index};`);
      else lines.push(`    return pickGroup(current, ${JSON.stringify(atMode.map((s) => ({ index: s.index, values: s.selects })))});`);
      lines.push("  }");
    }
  }
  lines.push("  return 0;", "}");
  return lines.join("\n");
}

function behaviorSource(behavior, configs, declared, external) {
  const names = new Set([...declared, ...external]);
  const input = Object.entries(behavior.props).map(([internal, outer]) => (internal === outer ? internal : `${internal}: ${outer}`));
  input.push(`disabled: ${names.has("disabled") ? "disabled" : "rest.disabled"}`, "rest");
  return `  /* 동작 — 눌렀을 때 무엇이 바뀌는지는 behaviors.js 가 정한다(승인 배포본의 동작 · platform/behavior.json). */
  const controller = useBehavior(${JSON.stringify(behavior.kind)}, { ...BEHAVIOR[tpl], ...SPEC.templates[tpl].metrics }, { ${input.join(", ")} });
`;
}

function controlSource(control) {
  if (control.isCheck) {
    return `  /* 체크 계열 — checked 를 주면 제어, 안 주면 안에서 상태를 들고 있는다. */
  const [innerChecked, setInnerChecked] = useState(defaultChecked ?? ${control.checked});
  const isChecked = checked ?? innerChecked;
  const onControlPress = () => {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) setInnerChecked(next);
    onCheckedChange?.(next);
  };
  const ctlState = { ...(disabled ? { disabled: "" } : {}), ...(isChecked ? { checked: "" } : {}) };
  const ctl = {};
  const lifted = initialLifted ?? { ${control.key}: { k: ${literal(control.key)}, a: ctlState, p: { disabled: Boolean(disabled), checked: Boolean(isChecked) } } };
`;
  }
  return `  /* 입력 계열 — value 를 주면 제어, defaultValue 면 비제어. */
  const ctlState = {
    ...(disabled ? { disabled: "" } : {}),
    ...(readOnly ? { readonly: "" } : {}),
    ...(invalid ? { "aria-invalid": "true" } : {})
  };
  const ctl = { value, defaultValue, onChangeText, onFocus, onBlur, placeholder, readOnly, maxLength, inputRef, ...(controller?.ctl ?? {}) };
  const lifted = initialLifted ?? { ${control.key}: { k: ${literal(control.key)}, a: ctlState, p: { disabled: Boolean(disabled), focus: false, "focus-visible": false } } };
`;
}

/* 기본 데이터를 소스로 — react.mjs 의 dataSource 와 같다(내보내지 않아 같은 규칙으로 다시 쓴다). */
function dataSourceOf(value) {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return literal(value);
  if (Array.isArray(value)) return `[${value.map(dataSourceOf).join(", ")}]`;
  if (Object.hasOwn(value, "__id")) return `\`\${uid}-${value.__id}\``;
  const entries = Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${dataSourceOf(item)}`);
  return `{ ${entries.join(", ")} }`;
}

/* ── 5. 표 파일 ──────────────────────────────────────────────────────── */

export function specSource(spec) {
  const templates = spec.templates.map((template) => {
    return {
      name: template.name, break: template.break, mode: template.mode, variants: template.variants, overlay: template.overlay,
      rootAttributes: template.rootAttributes, axis: template.axis, src: template.src, selects: template.selects,
      nodes: template.nodes, tables: template.tables, metrics: template.metrics
    };
  });
  const lines = [
    `/* ${GENERATED_NOTE} */`,
    `/* ${spec.id} 의 상태별 최종 스타일 표 — 배포본 CSS 를 캐스케이드까지 계산해 굳힌 것이다(손으로 옮겨 적은 값 없음).`,
    `   styles[] 는 중복을 없앤 스타일 모음이고, 각 템플릿의 tables 는 "요소 × 상태 조합 → styles 의 번호" 이다. */`,
    `const styles = ${JSON.stringify(spec.styles)};`,
    "",
    "const templates = ["
  ];
  templates.forEach((template, position) => {
    lines.push(`  { id: ${JSON.stringify(spec.id)}, styles, ...${JSON.stringify(template)} }${position === templates.length - 1 ? "" : ","}`);
  });
  lines.push("];", "", "export default { id: " + JSON.stringify(spec.id) + ", styles, templates };", "");
  return lines.join("\n");
}

export { buildReactRuntime };
