/**
 * react-gen.mjs — 승인된 배포본 → 진짜 React 컴포넌트 생성기 (React DOM 전용)
 * --------------------------------------------------------------------------
 * react.mjs 가 하는 분석(HTML 파서 · 슬롯/반복 목록 판정 · Emitter)을 그대로 쓰되,
 * React 개발자가 실제로 쓰는 모양으로 낸다.
 *
 *   마크업은 새로 쓰지 않는다 — 승인 예제를 옮기기만 한다(react-parity-check 가 기본 그리기를 예제와 대조한다).
 *   달라지는 것은 마크업이 아니라 "밖에서 넣는 길"이다:
 *     · 메뉴·목록·본문·버튼 글자는 props(목록은 { value, label, disabled? … } 한 모양) 또는 children 으로 받는다.
 *     · 값은 value/defaultValue/onChange, 열림은 open/defaultOpen/onOpenChange, 이벤트 이름은 React 대소문자.
 *     · ref 는 루트로 전달하고 안쪽 배선과 합친다. 훅을 쓰는 파일은 "use client".
 *     · name 을 주면 폼 전송에 값이 실린다.
 *   옛 이름·옛 목록 모양은 그대로 받는다(하위 호환).
 *
 * 부품마다 다른 점은 react-api.mjs 의 SPEC 에 선언한다. 이 파일은 선언을 읽어 코드를 낼 뿐이다.
 * (React Native 생성기는 react.mjs 의 Emitter 를 직접 쓴다 — 그쪽 출력은 이 파일과 무관하다.)
 */

import {
  Emitter, RootScope, VOID_ELEMENTS, attributeValue, camel, collectIds, constantName, firstInstance, idSlugMap, isTextOnly,
  literal, parseHtml, partOf, pascal, pluralize, primaryControl, textOf
} from "./react.mjs";
import { buildReactKit, GENERATED_NOTE } from "./react-kit.mjs";
import { EVENT_WORDS, EVENT_DETAIL, defaultController, Builder } from "./react-api.mjs";
import { SPEC } from "./react-spec.mjs";

export { buildReactKit, GENERATED_NOTE };

/* ── 1. 예제 → 그릴 형태(form) 목록 ───────────────────────────────────── */

/** 예제 파일 안의 이 컴포넌트 루트들(다른 같은 컴포넌트 안에 든 것은 제외). */
function topInstances(tree, id) {
  const found = [];
  const walk = (node) => {
    if (node.type !== "element") return;
    if (attributeValue(node, "data-s1-component") === id) { found.push(node); return; }
    for (const child of node.children) walk(child);
  };
  for (const child of tree.children) walk(child);
  return found;
}

/**
 * 컴포넌트를 그릴 "형태" 목록.
 *   기본        예제 파일(breakName)마다 첫 인스턴스 하나
 *   structural  변형마다 마크업이 다른 부품(list-row · gnb-sub-menu-item …)은 변형마다 첫 인스턴스
 */
function formsOf({ id, example, exampleByBreak }, spec) {
  const sources = Object.entries(exampleByBreak ?? { pc: example });
  if (!spec.structural) {
    return sources.map(([breakName, html]) => ({ key: breakName, breakName, tree: firstInstance(parseHtml(html, id), id) }));
  }
  const { attribute } = spec.structural;
  const forms = [];
  for (const [breakName, html] of sources) {
    const seen = new Set();
    for (const instance of topInstances(parseHtml(html, id), id)) {
      const value = attributeValue(instance, attribute);
      if (value === undefined || seen.has(value)) continue;
      seen.add(value);
      forms.push({ key: String(value), breakName, tree: instance, structuralValue: String(value) });
    }
  }
  return forms;
}

/* ── 2. ReactEmitter — react.mjs 의 Emitter 에 React 전용 배선을 얹는다 ─── */

class ReactEmitter extends Emitter {
  constructor(options) {
    super(options);
    this.spec = options.spec ?? {};
    this.ancestors = [];
    this.formKey = options.formKey;
    this.childrenIntoDone = false;
  }

  /** 슬롯 이름 — 같은 part 이름이 여러 곳이면 SPEC.renames 가 자리마다 이름을 나눈다. */
  slotPart(node) {
    const part = partOf(node);
    if (!part) return part;
    for (const rule of this.spec.renames ?? []) {
      if (rule.part !== part) continue;
      if (rule.within && !this.ancestors.concat([node]).some((ancestor) => rule.within(ancestor))) continue;
      return rule.as;
    }
    return part;
  }

  element(node, options) {
    const { isRoot = false, isTemplate = false, scope, indent, leaf, extra } = options;
    const part = this.slotPart(node);
    const attributes = this.attributeText(node, { scope, isRoot, part, isTemplate, leaf, extra });
    this.ancestors.push(node);
    const children = this.childrenText(node, { scope, indent: `${indent}  `, part, isRoot, leaf });
    this.ancestors.pop();
    const jsx = children === null
      ? `${indent}<${node.tag}${attributes} />`
      : `${indent}<${node.tag}${attributes}>\n${children}\n${indent}</${node.tag}>`;
    /* SPEC.wrapNode — 이 자리를 밖에서 통째로 바꿔 끼울 수 있게 감싼다(스위치 줄의 토글 · 0.22.0 의 parts.chevron 에 준 토글). */
    for (const rule of this.spec.wrapNode ?? []) {
      if (rule.form && rule.form !== this.formKey) continue;
      if (rule.match(node, this)) return rule.wrap(jsx, indent, node);
    }
    return jsx;
  }

  /** SPEC.attrs 규칙에 걸리는 속성은 예제의 고정값 대신 식으로 낸다. */
  attributeText(node, options) {
    const { isRoot } = options;
    const rawPart = partOf(node);
    const rules = (this.spec.attrs ?? []).filter((rule) => {
      if (rule.form && rule.form !== this.formKey) return false;
      if (rule.root) return isRoot;
      if (rule.part) return rule.part === rawPart && !isRoot;
      return rule.match ? Boolean(rule.match(node, this)) : false;
    });
    const replaced = new Set();
    const pieces = [];
    for (const rule of rules) {
      for (const [name, raw] of Object.entries(rule.set ?? {})) {
        const expression = typeof raw === "function" ? raw(node, this) : raw;
        replaced.add(name.toLowerCase());
        if (expression !== null) pieces.push(`${reactName(name)}={${expression}}`);
      }
      for (const piece of rule.pieces ?? []) pieces.push(piece);
    }
    const saved = node.attributes;
    if (replaced.size) node.attributes = saved.filter(([name]) => !replaced.has(name.toLowerCase()));
    let text;
    try {
      text = super.attributeText(node, options);
    } finally {
      node.attributes = saved;
    }
    if (isRoot) text = text.replace("ref={rootRef}", "ref={rootAttr}");
    if (pieces.length) text = ` ${pieces.join(" ")}${text}`;
    return text;
  }

  childrenText(node, options) {
    const { scope, indent, part, isRoot } = options;
    const rawPart = partOf(node);
    /* textarea — 자식 없이 그린다(자식을 주면 React 가 오류를 낸다. 처음 값은 defaultValue 로 간다). */
    if (node.tag === "textarea") return null;
    /* SPEC.contentOverride — 이 자리의 안쪽을 선언한 식으로 통째로 바꾼다(메뉴 목록 · 시트 본문 · 쪽 번호). */
    if (rawPart && this.spec.contentOverride?.[rawPart] && !isRoot) return `${indent}${this.spec.contentOverride[rawPart]}`;
    /* 루트가 글자만 담고 있으면(data-tag · gnb-sub-menu-item) 그 글자를 children/label 로 갈아끼운다. */
    if (isRoot && !rawPart && isTextOnly(node) && node.children.length && this.spec.rootText) {
      this.hasChildrenSlot = true;
      return `${indent}{children === undefined ? (${scope.content(this.spec.rootText, textOf(node))}) : children}`;
    }
    /* 안쪽을 밖에서 통째로 바꿀 수 있는 자리(모달 본문 · 시트 본문 · 카드 패널 …). */
    if (rawPart && this.spec.childrenInto === rawPart && !this.childrenIntoDone) {
      this.childrenIntoDone = true;
      this.hasChildrenSlot = true;
      const inner = super.childrenText(node, options);
      this.childrenIntoDone = false;
      if (inner === null) return `${indent}{children}`;
      return `${indent}{children === undefined ? (\n${indent}  <>\n${inner}\n${indent}  </>\n${indent}) : children}`;
    }
    /* 동작 스크립트가 채우는 빈 칸(달력 · 열 · 휠)에는 글자 칸을 주지 않는다 — 아이콘(aria-hidden)만 내용을 받는다. */
    if (!isRoot && rawPart && node.children.length === 0 && !VOID_ELEMENTS.has(node.tag)) {
      const decorative = attributeValue(node, "aria-hidden") === "true" || (this.spec.keepEmptySlots ?? []).includes(rawPart);
      if (!decorative) return null;
    }
    let text = super.childrenText(node, { ...options, part });
    if (isRoot && this.spec.panelsExpr && text) {
      /* 탭 패널 — 항목에 panel 이 있으면 그것을, 아니면 children · 예제 패널 순서. */
      text = text.replace("{children === undefined ? (", `{children === undefined ? (${this.spec.panelsExpr} ?? (`).replace(/\) : children\}\s*$/, ")) : children}");
    }
    if (isRoot && this.spec.rootEnd) text = `${text ?? ""}${text ? "\n" : ""}${this.spec.rootEnd(indent)}`;
    return text;
  }

  listText(group, options) {
    let text = super.listText(group, options);
    const config = (this.spec.lists ?? {})[group.part];
    const depth = (options.scope.depth ?? 0) + 1;
    if (config) {
      if (config.prop && options.scope.depth === 0) {
        const generated = pluralize(group.part);
        text = text.replace(`(${generated} ?? `, `(${config.prop} ?? `);
        const last = this.rootLists[this.rootLists.length - 1];
        if (last && last.part === group.part) last.prop = config.prop;
      }
      /* 예제에서 온 기본 목록은 그대로 두고, 밖에서 준 목록만 새 모양({ value, label })을 풀어 준다. */
      if (config.item) {
        text = text.replace(`const scope${depth} = scopeOf(item${depth});`, `const scope${depth} = scopeOf(${config.prop} ? s1Item(item${depth}, index${depth}, ${config.ctx ?? "itemCtx"}, ${config.item}) : item${depth});`);
      }
      if (config.fn) {
        text = text.replace(`const scope${depth} = scopeOf(item${depth});`, `const scope${depth} = scopeOf(${config.prop} ? ${config.fn}(item${depth}, index${depth}) : item${depth});`);
      }
      if (config.optionalTitle) {
        /* 열에 title 을 안 주면 제목 줄을 그리지 않고(compact 종류), items 를 안 주면 견본 항목을 채우지 않는다 — 예제 내용은 columns 를 안 줬을 때만 나온다. */
        text = text.replace(/(\n\s*)(<li>\n\s*<span data-s1-component="gnb-sub-menu-item" data-depth="1depth"[^\n]*\n[^\n]*\n\s*<\/span>\n\s*<\/li>)/, (all, lead, block) => `${lead}{(${config.prop} === undefined || scope${depth}.title !== undefined || scope${depth}.__content !== undefined) && (${lead}${block}${lead})}`);
        text = text.replace(/\(scope(\d+)\.items \?\? (DEFAULT_ITEMS_\d+\(uid\))\)/g, (all, n, fallback) => `(scope${n}.items ?? (${config.prop} === undefined ? ${fallback} : []))`);
      }
      if (config.nested) {
        text = text.replace(/const scope(\d+) = scopeOf\(item(\d+)\);/g, (all, a, n) => (Number(a) > depth ? `const scope${a} = scopeOf(${config.nested}(item${n}));` : all));
      }
    }
    return text;
  }
}

const reactName = (name) => (name.startsWith("data-") || name.startsWith("aria-") ? name : camel(name));

/* ── 3. 컴포넌트 파일 ─────────────────────────────────────────────────── */

export function eventNames(eventName) {
  const last = eventName.split(":").pop();
  return { canonical: `on${EVENT_WORDS[last] ?? pascal(last)}`, legacy: `on${pascal(last)}`, last };
}

/** 이 부품이 받는 이벤트 — 새 이름 + 옛 이름(대소문자만 다르면 하나). */
function eventsOf(manifest, spec) {
  const names = [...(manifest.javascript?.events ?? []), ...(spec.extraEvents ?? [])];
  return [...new Set(names)].map((eventName) => ({ eventName, ...eventNames(eventName) }));
}

export function buildReactComponent(view) {
  return generate(view).source;
}

export function reactComponentFacts(view) {
  return generate(view).facts;
}

const cache = new WeakMap();

function generate(view) {
  if (cache.has(view)) return cache.get(view);
  const out = generateUncached(view);
  cache.set(view, out);
  return out;
}

function generateUncached(view) {
  const { id, manifest } = view;
  const spec = SPEC[id] ?? {};
  const componentName = `S1${pascal(id)}`;
  const forms = formsOf(view, spec);
  const variants = manifest.variants ?? [];
  const sizes = manifest.sizes ?? [];
  const jsRequired = Boolean(manifest.jsRequired);
  const structural = Boolean(spec.structural);
  const breakKeys = [...new Set(forms.map((form) => form.breakName))];
  const hasBreaks = !structural && forms.length > 1;

  const firstControl = forms.map((form) => primaryControl(form.tree)).find(Boolean) ?? null;
  const isCheckLike = firstControl?.tag === "input" && ["checkbox", "radio"].includes(String(attributeValue(firstControl, "type")));
  const rootTag = forms[0].tree.tag;

  const rendered = forms.map((form) => {
    const ids = new Set();
    collectIds(form.tree, ids);
    const suffix = forms.length > 1 ? `_${constantName(form.key)}` : "";
    const emitter = new ReactEmitter({
      id, ids, idSlugs: idSlugMap(form.tree), controlNode: primaryControl(form.tree),
      variants: structural ? [] : variants, sizes, suffix, defaultOpen: false, spec, formKey: form.key
    });
    const body = emitter.element(form.tree, { scope: new RootScope(), isRoot: true, indent: "      " });
    return { ...form, body, emitter };
  });

  const context = {
    view, spec, id, manifest, componentName, forms, rendered, variants, sizes, jsRequired, structural, hasBreaks, breakKeys,
    firstControl, isCheckLike, rootTag, events: eventsOf(manifest, spec), hasChildrenSlot: rendered.some(({ emitter }) => emitter.hasChildrenSlot)
  };
  const builder = new Builder(context);
  (spec.controller ?? defaultController)(builder, context);
  return assemble(builder, context);
}

function listConstants(rendered) {
  const rootLists = [];
  const nestedLists = [];
  const seen = new Set();
  for (const { emitter } of rendered) {
    for (const item of emitter.rootLists) if (!seen.has(item.constant)) { seen.add(item.constant); rootLists.push(item); }
    for (const item of emitter.nestedLists) if (!seen.has(item.constant)) { seen.add(item.constant); nestedLists.push(item); }
  }
  return { rootLists, nestedLists };
}

/** 낱말 하나(`dataSource`)는 react.mjs 의 것과 같다 — 기본 목록 상수를 소스로 낸다. */
function dataSourceOf(value) {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return literal(value);
  if (Array.isArray(value)) return `[${value.map(dataSourceOf).join(", ")}]`;
  if (Object.hasOwn(value, "__id")) return `\`\${uid}-${value.__id}\``;
  return `{ ${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${dataSourceOf(item)}`).join(", ")} }`;
}

function assemble(b, c) {
  const { spec, id, manifest, componentName, forms, rendered, variants, sizes, structural, hasBreaks, breakKeys } = c;
  const { rootLists, nestedLists } = listConstants(rendered);

  /* 목록 prop — Emitter 가 찾아낸 반복 목록 */
  for (const item of rootLists) b.listProp(item.prop, spec.lists?.[item.part]);
  b.nestedListProps(nestedLists);

  const slotNames = new Set();
  for (const { body } of rendered) for (const match of body.matchAll(/slot\(partScope, "(\w+)"\)/g)) slotNames.add(match[1]);
  /* 0.22.0 에서 쓰던 슬롯 이름(별칭 · 옛 이름)도 parts 로 계속 받는다 — 타입에도 남긴다. */
  for (const legacy of [...Object.keys(b.aliases), ...(spec.legacyParts ?? [])]) slotNames.add(legacy);
  b.slotNames = [...slotNames];

  /* 견본 글자 정책 — 견본은 "내용 prop 이 하나도 없을 때"만 나온다. 한 번이라도 내용을 주면 비워 둔 글자 칸은 비어 있다.
     (parts 만 쓰는 0.22.0 코드는 그대로 견본이 남는다 · 목록 견본(메뉴 · 선택지)은 목록 prop 을 안 줬을 때만 나온다.) */
  const contentProps = new Set();
  for (const expression of b.direct.values()) for (const token of expression.match(/[A-Za-z_$][\w$]*/g) ?? []) if (b.props.has(token)) contentProps.add(token);
  if (c.hasChildrenSlot) contentProps.add("children");
  if (contentProps.size || spec.bareParts) {
    const conditions = [...[...contentProps].map((name) => `${name} === undefined`), ...(spec.bareParts ? [typeof spec.bareParts === "string" ? spec.bareParts : "parts === undefined"] : [])];
    let guarded = false;
    for (const form of rendered) {
      form.body = form.body.replace(/(slot\(partScope, "\w+"\)\.content) \?\? ("(?:[^"\\]|\\.)+")/g, (all, left, sample) => {
        guarded = true;
        return `${left} ?? (bare ? ${sample} : undefined)`;
      });
    }
    if (guarded) b.preLines.unshift(`/* 견본 글자는 내용 prop 을 하나도 주지 않았을 때만 그린다. */\n  const bare = ${conditions.join(" && ")};`);
  }

  const listCode = [...rootLists, ...nestedLists]
    .map(({ constant, defaults }) => `const ${constant} = (uid) => [${defaults.map(dataSourceOf).join(", ")}];`)
    .join("\n");

  /* 그릴 형태 → return */
  const returnKey = "formKey";
  const wrap = (body) => (spec.afterRoot ? spec.afterRoot(body, c, b) : body);
  const renderSource = rendered.length === 1
    ? `  return (\n${wrap(rendered[0].body)}\n  );`
    : `${rendered.map(({ key, body }, index) =>
      `  ${index === 0 ? "if" : "} else if"} (${returnKey} === ${literal(key)}) {\n    return (\n${wrap(body)}\n    );\n`).join("")}  }\n`
      + `  throw new Error(\`[s1-ui] ${id}: 승인되지 않은 ${structural ? "variant" : "breakName"} "\${${structural ? (spec.structural.prop ?? "variant") : "breakName"}}". 쓸 수 있는 값: \${${structural ? "VARIANTS" : "BREAKS"}.join(", ")}\`);`;

  const reactImports = ["forwardRef", "useId", ...b.reactHooks].filter((name, index, all) => all.indexOf(name) === index);
  const usedListHelpers = rendered.flatMap(({ body }) => ["s1Item", "s1Row", "s1Link"].filter((name) => body.includes(`${name}(`)));
  const kitImports = [...new Set(["scopeOf", "slot", "mergeParts", ...(rootLists.length || nestedLists.length ? ["attrsOf", "keyOf"] : []), ...(nestedLists.length ? ["list"] : []), ...usedListHelpers, ...b.kitNames])].sort();

  const legacyParts = [...new Set([...Object.keys(b.aliases), ...(spec.legacyParts ?? [])])];
  const destructure = b.destructure();
  const hooks = b.hookLines();
  const source = `"use client";
/* ${GENERATED_NOTE} */
/* ${componentName} — 승인된 배포본 마크업을 그대로 옮긴 React 컴포넌트.
   마크업을 새로 쓰지 않는다. dist/examples/${id}*.html 의 승인 인스턴스를 JSX 로 옮긴 것이다.
   서버에서 그려도 같은 마크업이 나온다. */
import { ${reactImports.join(", ")} } from "react";
import { ${kitImports.join(", ")} } from "./kit.js";
${c.jsRequired || b.runtimeModules.length ? b.runtimeImports(id, c.jsRequired) : `// ${id} 는 JavaScript 런타임이 없다 — 브라우저 기본 동작만 쓴다.`}
${b.moduleImports.join("\n")}

export const BREAKS = ${JSON.stringify(spec.breakList ?? breakKeys)};
${spec.breakList ? `export const FORMS = ${JSON.stringify(breakKeys)};\n` : ""}export const DEFAULT_BREAK = ${literal(breakKeys[0])};
export const VARIANTS = ${JSON.stringify(structural ? forms.map((form) => form.key) : variants)};
export const SIZES = ${JSON.stringify(sizes)};
/* parts 로 줄 수 있는 슬롯 이름(낙타 표기) — 타입 정의의 parts 키와 같다. */
export const PARTS = ${JSON.stringify(b.slotNames)};
${legacyParts.length ? `/* 0.22.0 에서 쓰던 슬롯 이름 — 계속 받는다(옛 이름 하나가 여러 자리를 함께 채우는 것도 그때 그대로). 새 코드는 위 이름을 쓰세요. */\nexport const LEGACY_PARTS = ${JSON.stringify(legacyParts)};\n` : ""}${structural ? `export const DEFAULT_VARIANT = ${literal(forms[0].key)};\nexport const STRUCTURAL = ${JSON.stringify({ attribute: spec.structural.attribute, prop: spec.structural.prop ?? "variant" })};\n` : ""}${listCode ? `\n/* 예제에 있던 내용 — prop 을 주지 않으면 이게 그려진다. */\n${listCode}\n` : ""}${b.moduleConsts.length ? `\n${b.moduleConsts.join("\n")}\n` : ""}
function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(\`[s1-ui] ${id}: 승인되지 않은 \${label} "\${value}". 쓸 수 있는 값: \${allowed.join(", ")}\`);
}

const ${componentName} = forwardRef(function ${componentName}({ ${destructure} }, forwardedRef) {
  const uid = useId();
${hooks}
${renderSource}
});
${componentName}.displayName = ${literal(componentName)};
export default ${componentName};
`;
  return { source, facts: b.facts() };
}

/* ── 4. 타입 · 안내 · 패키지 ──────────────────────────────────────────── */

export { EVENT_DETAIL };

export function buildReactPackage(release) {
  const version = typeof release === "string" ? release : release.version;
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
    files: ["*.jsx", "index.js", "index.d.ts", "kit.js", "version.js", "README.md"]
  }, null, 2)}\n`;
}

export { buildReactTypes, buildReactReadme } from "./react-docs.mjs";
