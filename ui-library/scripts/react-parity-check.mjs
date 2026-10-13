/**
 * react-parity-check.mjs — React 컴포넌트가 "승인된 마크업 그대로"인지 기계로 확인한다.
 * --------------------------------------------------------------------------
 * 생성기가 JSX 로 옮겼으니, 옮기다 무엇이 빠지거나 바뀌었는지는 사람 눈으로 볼 수 없다.
 * 그래서 컴포넌트를 실제로 그려 보고(작은 React 대역), 그 결과를 승인 예제와 대조한다.
 *
 *   실행: npm run ui:react:parity
 *
 * 대조 규칙
 *   - 태그 구조·속성·글자가 같아야 한다.
 *   - id / for / aria-controls 처럼 서로를 가리키는 값은 "누가 누구를 가리키는가"만 본다
 *     (컴포넌트는 화면마다 다른 id 를 쓰므로 글자 자체는 달라야 정상이다).
 *   - React 가 쓰는 이름(className·htmlFor·tabIndex)은 HTML 이름으로 되돌려 비교한다.
 */

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { attributeValue, firstInstance, parseHtml } from "./react.mjs";
import { stripDefaultOpenHidden } from "./platform.mjs";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(libraryRoot, "dist");

/* ── 작은 React 대역 ──────────────────────────────────────────────────── */

const SHIM = `
export const Fragment = Symbol.for("s1.fragment");
const ELEMENT = Symbol.for("s1.element");
export function createElement(type, props, ...children) {
  const { children: nested, ...rest } = props ?? {};
  const list = children.length ? children : nested === undefined ? [] : [nested];
  return { $$typeof: ELEMENT, type, props: rest, children: list.flat(Infinity) };
}
export function isValidElement(value) {
  return Boolean(value) && typeof value === "object" && value.$$typeof === ELEMENT;
}
let counter = 0;
export function useId() { counter += 1; return "uid" + counter; }
export function useRef(initial) { return { current: initial ?? null }; }
export function useEffect() {}
export const useLayoutEffect = useEffect;
export function useState(initial) { return [typeof initial === "function" ? initial() : initial, () => {}]; }
export function useCallback(fn) { return fn; }
export function useMemo(fn) { return fn(); }
export function forwardRef(render) { const component = (props) => render(props, props?.ref ?? null); component.render = render; return component; }
export default { createElement, Fragment, isValidElement, useId, useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo, forwardRef };
`;

const RUNTIME_STUB = "export function init() {}\nexport function destroy() {}\n";

/* ── 그린 결과 → 비교용 트리 ──────────────────────────────────────────── */

const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const HTML_NAMES = new Map(Object.entries({
  className: "class", htmlFor: "for", tabIndex: "tabindex", colSpan: "colspan", rowSpan: "rowspan",
  maxLength: "maxlength", readOnly: "readonly", autoComplete: "autocomplete", contentEditable: "contenteditable"
}));

function renderNode(node, into) {
  if (node === null || node === undefined || node === false || node === true) return;
  if (typeof node === "string" || typeof node === "number") {
    const text = String(node).replace(/\s+/g, " ").trim();
    if (text) into.push({ type: "text", value: text });
    return;
  }
  if (Array.isArray(node)) { for (const child of node) renderNode(child, into); return; }
  if (typeof node.type === "function") {
    /* 진짜 React 처럼 자식이 없으면 children 을 아예 주지 않는다. */
    const given = node.children.length === 0 ? {} : { children: node.children.length === 1 ? node.children[0] : node.children };
    renderNode(node.type({ ...node.props, ...given }), into);
    return;
  }
  if (typeof node.type === "symbol") { for (const child of node.children) renderNode(child, into); return; }

  const attributes = new Map();
  for (const [name, value] of Object.entries(node.props ?? {})) {
    if (["key", "ref", "children"].includes(name)) continue;
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === "function") continue;   // 이벤트 핸들러는 마크업이 아니다
    attributes.set(HTML_NAMES.get(name) ?? name, value === true ? "" : String(value));
  }
  const children = [];
  for (const child of node.children) renderNode(child, children);
  into.push({ type: "element", tag: String(node.type).toLowerCase(), attributes, children });
}

/* ── 예제 → 비교용 트리 ───────────────────────────────────────────────── */

function hasCheckedToggle(node) {
  if (node.type !== "element") return false;
  if (attributeValue(node, "data-s1-component") === "toggle" && attributeValue(node, "aria-checked") === "true") return true;
  return node.children.some(hasCheckedToggle);
}

function fromExample(node) {
  const attributes = new Map();
  for (const [name, value] of node.attributes) attributes.set(name.toLowerCase(), value === true ? "" : String(value));
  return {
    type: "element",
    tag: node.tag,
    attributes,
    children: node.children.map((child) => child.type === "text" ? { type: "text", value: child.value } : fromExample(child))
  };
}

/* ── 서로를 가리키는 값은 "가리키는 관계"만 본다 ─────────────────────── */

const LINK_ATTRIBUTES = ["id", "for", "aria-labelledby", "aria-describedby", "aria-controls"];

function canonicalizeLinks(root) {
  const order = new Map();
  const walk = (node) => {
    if (node.type !== "element") return;
    for (const name of LINK_ATTRIBUTES) {
      const value = node.attributes.get(name);
      if (value === undefined) continue;
      if (!order.has(value)) order.set(value, `link-${order.size + 1}`);
      node.attributes.set(name, order.get(value));
    }
    for (const child of node.children) walk(child);
  };
  walk(root);
}

function describe(node, depth = 0) {
  if (node.type === "text") return `${"  ".repeat(depth)}"${node.value}"`;
  const attributes = [...node.attributes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${name}=${JSON.stringify(value)}`).join(" ");
  const head = `${"  ".repeat(depth)}<${node.tag}${attributes ? ` ${attributes}` : ""}>`;
  if (VOID_ELEMENTS.has(node.tag) || node.children.length === 0) return head;
  return [head, ...node.children.map((child) => describe(child, depth + 1))].join("\n");
}

/* ── 실행 ─────────────────────────────────────────────────────────────── */

const manifest = JSON.parse(await readFile(path.join(distRoot, "manifest.json"), "utf8"));
const componentManifests = new Map();
for (const entry of manifest.components) componentManifests.set(entry.id, JSON.parse(await readFile(path.join(distRoot, "components", `${entry.id}.manifest.json`), "utf8")));
const componentManifestOf = (id) => componentManifests.get(id);
const approved = manifest.components.filter((component) => component.status === "approved");
const workspace = await mkdtemp(path.join(tmpdir(), "s1-react-parity-"));
await writeFile(path.join(workspace, "react-shim.js"), SHIM);
await writeFile(path.join(workspace, "runtime-stub.js"), RUNTIME_STUB);

const alias = {
  name: "s1-alias",
  setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: path.join(workspace, "react-shim.js") }));
    build.onResolve({ filter: /\/components\/[a-z-]+\.js$/ }, () => ({ path: path.join(workspace, "runtime-stub.js") }));
  }
};

const failures = [];
let compared = 0;

for (const component of approved) {
  const bundlePath = path.join(workspace, `${component.id}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(distRoot, "platform", "react", `${component.id}.jsx`)],
    outfile: bundlePath,
    bundle: true,
    format: "esm",
    platform: "neutral",
    jsx: "transform",
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    inject: [path.join(workspace, "react-shim.js")],
    plugins: [alias],
    logLevel: "silent"
  });
  const module = await import(pathToFileURL(bundlePath).href);

  for (const [breakName, examplePath] of Object.entries(component.examples)) {
    const rawHtml = await readFile(path.join(distRoot, examplePath), "utf8");
    const html = componentManifestOf(component.id)?.htmlContract?.platformDefaultOpen === true ? stripDefaultOpenHidden(rawHtml, component.id) : rawHtml;
    const tree = parseHtml(html, component.id);
    /* 비교할 형태 목록: 변형마다 마크업이 다른 부품은 변형마다 첫 인스턴스, 아니면 예제 파일의 첫 인스턴스. */
    const targets = [];
    if (module.STRUCTURAL) {
      const seen = new Set();
      for (const instance of topInstances(tree, component.id)) {
        const value = attributeValue(instance, module.STRUCTURAL.attribute);
        if (value === undefined || seen.has(value)) continue;
        seen.add(value);
        const props = { [module.STRUCTURAL.prop]: value };
        /* 스위치 줄은 안 주면 꺼진 채 시작한다(0.22.0 과 같다). 예제는 켜진 토글을 보여 주므로 같은 모양을 prop 으로 준다. */
        if (component.id === "list-row" && hasCheckedToggle(instance)) props.defaultChecked = true;
        targets.push({ label: `${breakName}:${value}`, props, node: instance });
      }
    } else {
      let props = module.BREAKS.length > 1 ? { breakName } : {};
      if (module.TYPES) {
        /* 입력칸: 예제 파일 이름은 pc · mobile · password · password-mobile · search · search-mobile — 화면 기준 + 종류로 되돌려 준다. */
        const mobile = breakName.endsWith("mobile");
        const kind = breakName.replace(/-?mobile$/, "") || "text";
        props = { breakName: mobile ? "mobile" : "pc", type: module.TYPES.includes(kind) ? kind : "text" };
      }
      targets.push({ label: breakName, props, node: firstInstance(tree, component.id) });
    }
    for (const target of targets) {
      const expected = fromExample(target.node);
      const rendered = [];
      renderNode(module.default(target.props), rendered);
      const actual = rendered.find((node) => node.type === "element");
      if (!actual) { failures.push(`${component.id} (${target.label}): 아무것도 그려지지 않았습니다.`); continue; }
      canonicalizeLinks(expected);
      canonicalizeLinks(actual);
      const left = describe(expected);
      const right = describe(actual);
      compared += 1;
      if (left !== right) {
        const leftLines = left.split("\n");
        const rightLines = right.split("\n");
        const at = leftLines.findIndex((line, index) => line !== rightLines[index]);
        failures.push(`${component.id} (${target.label}): ${at + 1}번째 줄부터 다릅니다.\n  예제 : ${leftLines[at] ?? "(없음)"}\n  컴포넌트: ${rightLines[at] ?? "(없음)"}`);
      }
    }
  }
}

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

/* ── 2단계: "밖에서 넣은 값이 실제로 들어가는가" ──────────────────────
   껍데기 시절에는 막혀 있던 네 통로(목록 데이터·슬롯 내용·폼 값·자식)를 실제로 넣어 보고
   그린 결과에 나타나는지 확인한다. 나타나지 않으면 통로가 이름만 있는 것이다. */

const MARK = "확인용표식";

function flatten(node, into = []) {
  into.push(node);
  if (node.type === "element") for (const child of node.children) flatten(child, into);
  return into;
}

function renderWith(module, props) {
  const out = [];
  renderNode(module.default(props), out);
  return out.find((node) => node.type === "element");
}

const textIn = (root) => flatten(root).filter((node) => node.type === "text").map((node) => node.value).join(" ");
const attributesIn = (root) => flatten(root).filter((node) => node.type === "element")
  .flatMap((node) => [...node.attributes.values()]).join(" ");

const capability = [];

for (const component of approved) {
  const module = await import(pathToFileURL(path.join(workspace, `${component.id}.mjs`)).href);
  const source = await readFile(path.join(distRoot, "platform", "react", `${component.id}.jsx`), "utf8");
  const signature = source.match(/forwardRef\(function \w+\(\{([^}]*)\}/s)?.[1] ?? "";
  const has = (name) => new RegExp(`(^|[,{\\s])${name}([,}\\s=]|$)`).test(signature);

  /* 목록 데이터 */
  for (const match of signature.matchAll(/\b(rows|options|pages|tabs|cells|headerCells|items|menus|values|texts|links|columns)\b/g)) {
    const prop = match[1];
    const rendered = renderWith(module, { [prop]: [MARK, `${MARK}2`] });
    if (!textIn(rendered).includes(MARK)) capability.push(`${component.id}: ${prop} 로 넣은 데이터가 화면에 나오지 않습니다.`);
    const before = renderWith(module, { [prop]: [MARK] });
    if (flatten(before).length >= flatten(rendered).length) capability.push(`${component.id}: ${prop} 의 개수가 화면에 반영되지 않습니다.`);
  }

  /* 슬롯 내용 */
  /* 루트 단계 슬롯만 본다 — 목록 안쪽 슬롯은 목록 prop 으로 넣는 자리다. */
  const slotNames = [...new Set([...source.matchAll(/slot\(partScope, "([^"]+)"\)\.content/g)].map((match) => match[1]))];
  if (slotNames.length) {
    const rendered = renderWith(module, Object.fromEntries([["parts", Object.fromEntries(slotNames.map((name) => [name, MARK]))]]));
    if (!textIn(rendered).includes(MARK) && !attributesIn(rendered).includes(MARK)) capability.push(`${component.id}: parts 로 넣은 내용이 화면에 나오지 않습니다.`);
  }

  /* 폼 값 */
  if (has("placeholder")) {
    const rendered = renderWith(module, { placeholder: MARK });
    if (!attributesIn(rendered).includes(MARK)) capability.push(`${component.id}: placeholder 가 입력 요소에 닿지 않습니다.`);
  }

  /* 자식 */
  if (has("children")) {
    const rendered = renderWith(module, { children: MARK });
    if (!textIn(rendered).includes(MARK)) capability.push(`${component.id}: children 이 화면에 나오지 않습니다.`);
  }

  /* 같은 컴포넌트를 두 번 놓아도 id 가 겹치지 않아야 한다. */
  const first = renderWith(module, {});
  const second = renderWith(module, {});
  const ids = (root) => flatten(root).filter((node) => node.type === "element")
    .map((node) => node.attributes.get("id")).filter(Boolean);
  const shared = ids(first).filter((value) => ids(second).includes(value));
  if (shared.length) capability.push(`${component.id}: 두 번 놓으면 id 가 겹칩니다 (${shared.join(", ")}).`);
}

/* ── 3단계~5단계: 배선(훅)이 배포본 api 를 실제로 부르는가 ─────────────────────
   진짜 React 는 이 저장소에 없으므로, 훅이 실제로 돌고 다시 그려지는 작은 대역으로 시험한다.
   (진짜 React 로 하는 시험은 `npm run audit:publisher:react` 가 한다.)
   부품이 배포본 api(init 이 돌려주는 객체)를 어떻게 부르는지만 본다 — 아래 api 는 부른 기록을 남기는 대역이다. */
const STATEFUL_SHIM = `
let current = null;
export const Fragment = Symbol.for("s1.fragment");
export function createElement(type, props, ...children) { return { type, props: props ?? {}, children }; }
export function isValidElement(value) { return Boolean(value) && typeof value === "object" && "type" in value && "props" in value; }
export function useId() { return "uid"; }
function slot() { const h = current; const i = h.index++; return [h, i]; }
export function useRef(initial) { const [h, i] = slot(); if (!(i in h.slots)) h.slots[i] = { current: initial ?? null }; return h.slots[i]; }
export function useState(initial) {
  const [h, i] = slot();
  if (!(i in h.slots)) h.slots[i] = { value: typeof initial === "function" ? initial() : initial };
  const cell = h.slots[i];
  return [cell.value, (next) => { cell.value = typeof next === "function" ? next(cell.value) : next; }];
}
const same = (a, b) => a && b && a.length === b.length && a.every((value, k) => Object.is(value, b[k]));
export function useCallback(fn, deps) { const [h, i] = slot(); const cell = h.slots[i]; if (cell && same(cell.deps, deps)) return cell.fn; h.slots[i] = { fn, deps }; return fn; }
export function useMemo(fn, deps) { const [h, i] = slot(); const cell = h.slots[i]; if (cell && same(cell.deps, deps)) return cell.value; const value = fn(); h.slots[i] = { value, deps }; return value; }
export function useEffect(fn, deps) { const [h, i] = slot(); h.effects.push({ fn, deps, i }); }
export const useLayoutEffect = useEffect;
export function forwardRef(render) { const component = (props) => render(props, props?.ref ?? null); component.render = render; return component; }
const findRef = (element) => {
  if (!element || typeof element !== "object") return null;
  if (element.props?.ref) return element.props.ref;
  for (const child of element.children ?? []) { const found = findRef(child); if (found) return found; }
  return null;
};
globalThis.__s1Harness = (Component) => {
  const h = { slots: {}, index: 0, effects: [], prev: {}, cleanups: {} };
  const root = { fake: true, hidden: false, listeners: {},
    addEventListener(name, handler) { (this.listeners[name] ??= new Set()).add(handler); },
    removeEventListener(name, handler) { this.listeners[name]?.delete(handler); },
    querySelector() { return null; },
    dispatch(name, detail) { let prevented = false; const event = { type: name, detail, preventDefault() { prevented = true; } }; for (const handler of [...(this.listeners[name] ?? [])]) handler(event); return prevented; } };
  let attached = false;
  return {
    root,
    render(props) {
      current = h; h.index = 0; h.effects = [];
      const element = Component(props);
      const ref = findRef(element);
      if (ref && !attached) { if (typeof ref === "function") ref(root); else ref.current = root; attached = true; }
      for (const { fn, deps, i } of h.effects) {
        const before = h.prev[i];
        const changed = !before || !deps || !before.deps || deps.length !== before.deps.length || deps.some((value, k) => !Object.is(value, before.deps[k]));
        if (!changed) continue;
        if (h.cleanups[i]) h.cleanups[i]();
        h.cleanups[i] = fn();
        h.prev[i] = { deps };
      }
      return element;
    },
    unmount() { for (const cleanup of Object.values(h.cleanups)) if (typeof cleanup === "function") cleanup(); }
  };
};
export default { createElement, Fragment, isValidElement, useId, useRef, useState, useCallback, useMemo, useEffect, useLayoutEffect, forwardRef };
`;

/* 배포본 api 대역: 부른 기록을 남기고, 열림 · 값 같은 상태를 들고 있어 실제 api 처럼 "지금 상태"를 돌려준다.
   open/close/setValue 가 실제 배포본처럼 이벤트를 쏘는 것도 흉내 낸다(화면이 시킨 변화에 이벤트가 따라오는 경우 되알림이 없는지 보려고). */
const RECORDING_STUB = `
const DIALOGS = ["modal", "modal-content", "bottom-sheet"];
export function init(root) {
  const calls = globalThis.__s1Calls;
  calls.push("init");
  const state = globalThis.__s1Start ?? {};
  const kind = globalThis.__s1Kind;
  const dialog = DIALOGS.includes(kind);
  const box = { open: Boolean(state.open), value: state.value ?? "", page: state.page ?? 1, total: state.total ?? 6, checked: Boolean(state.checked) };
  const say = (name, detail) => root.dispatch(name, detail);
  const api = {
    get value() { return box.value; },
    get page() { return box.page; },
    get totalPages() { return box.total; },
    get checked() { return box.checked; },
    set(next) { calls.push("set:" + next); box.checked = Boolean(next); say("s1:" + kind + ":change", { checked: box.checked, open: box.checked }); },
    setSelected(next) { calls.push("setSelected:" + next); },
    setValue(next) { calls.push("setValue:" + JSON.stringify(next)); box.value = next; },
    setPage(next) { calls.push("setPage:" + next); box.page = next; say("s1:pagination:change", { page: box.page, totalPages: box.total }); },
    setTotalPages(next) { calls.push("setTotalPages:" + next); box.total = next; say("s1:pagination:change", { page: box.page, totalPages: box.total }); },
    update() { calls.push("update"); },
    forceOpen(next) { box.open = next; }
  };
  if (dialog) {
    Object.defineProperty(api, "isOpen", { get() { return box.open; } });
    api.open = () => { calls.push("open"); box.open = true; say("s1:" + kind + ":open", {}); };
    api.close = () => { calls.push("close"); box.open = false; say("s1:" + kind + ":close", {}); };
  } else {
    Object.defineProperty(api, "open", { get() { return box.open; } });
    api.openPanel = () => { calls.push("openPanel"); box.open = true; say("s1:" + kind + ":open", {}); };
    api.closePanel = () => { calls.push("closePanel"); box.open = false; say("s1:" + kind + ":close", {}); };
  }
  globalThis.__s1Api = api;
  return api;
}
export function destroy() { globalThis.__s1Calls.push("destroy"); }
`;

const dynamicProblems = [];
const dynamicDir = await mkdtemp(path.join(tmpdir(), "s1-react-dynamic-"));
await writeFile(path.join(dynamicDir, "shim.js"), STATEFUL_SHIM);
await writeFile(path.join(dynamicDir, "stub.js"), RECORDING_STUB);

async function loadDynamic(id) {
  const out = path.join(dynamicDir, `${id}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(distRoot, "platform", "react", `${id}.jsx`)],
    outfile: out, bundle: true, format: "esm", platform: "neutral", jsx: "transform", jsxFactory: "createElement", jsxFragment: "Fragment",
    inject: [path.join(dynamicDir, "shim.js")], logLevel: "silent",
    plugins: [{ name: "dynamic-alias", setup(build) {
      build.onResolve({ filter: /^react$/ }, () => ({ path: path.join(dynamicDir, "shim.js") }));
      build.onResolve({ filter: /\/components\/[a-z-]+\.js$/ }, () => ({ path: path.join(dynamicDir, "stub.js") }));
    } }]
  });
  return import(`${pathToFileURL(out).href}?t=${Date.now()}`);
}

const expectEqual = (id, label, actual, wanted) => {
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) dynamicProblems.push(`${id}: ${label} — 기대 ${JSON.stringify(wanted)} / 실제 ${JSON.stringify(actual)}`);
};
const hiddenOf = (element) => {
  const find = (node) => (node && typeof node === "object" ? (node.props?.["data-s1-component"] ? node : (node.children ?? []).map(find).find(Boolean)) : null);
  return find(element)?.props?.hidden;
};

/* 3단계: 창(모달 · 모달 콘텐츠 · 바텀시트)의 open / defaultOpen / onOpenChange */
for (const [id, defaultOpen] of [["modal", false], ["modal-content", false], ["bottom-sheet", true]]) {
  const component = await loadDynamic(id);
  const calls = (globalThis.__s1Calls = []);
  globalThis.__s1Kind = id;
  const told = [];
  const handlers = { onOpen: () => told.push("onOpen"), onClose: (event) => told.push("onClose"), onOpenChange: (value, detail) => told.push(`change:${value}:${detail?.reason ?? ""}`) };

  /* 처음 모양 — open 을 안 주면 종전 그대로(모달은 닫힘, 시트는 보임) */
  globalThis.__s1Start = { open: defaultOpen };
  let view = globalThis.__s1Harness(component.default);
  let element = view.render({ ...handlers });
  expectEqual(id, "처음 그리기(open 안 줌)는 종전 모양 그대로", [hiddenOf(element), calls], [defaultOpen ? undefined : true, ["init"]]);
  expectEqual(id, "open 을 안 주면 화면이 열고 닫지 않는다", calls.filter((name) => name === "open" || name === "close"), []);
  view.unmount();

  /* defaultOpen — 처음 열림/닫힘만 정한다 */
  globalThis.__s1Calls.length = 0;
  globalThis.__s1Start = { open: !defaultOpen };
  view = globalThis.__s1Harness(component.default);
  element = view.render({ defaultOpen: !defaultOpen, ...handlers });
  expectEqual(id, "defaultOpen 이 처음 hidden 을 정한다", hiddenOf(element), !defaultOpen ? undefined : true);
  view.unmount();

  /* 제어형 — open 이 바뀌면 api 로 열고 닫고, 화면이 시킨 변화는 onOpenChange 로 되알리지 않는다(onOpen/onClose 는 나간다) */
  globalThis.__s1Calls.length = 0;
  told.length = 0;
  globalThis.__s1Start = { open: false };
  view = globalThis.__s1Harness(component.default);
  view.render({ open: false, ...handlers });
  view.render({ open: true, ...handlers });
  expectEqual(id, "open false→true 는 api.open() 한 번", calls.filter((name) => name === "open"), ["open"]);
  expectEqual(id, "화면이 열었을 때 onOpen 은 한 번, onOpenChange 는 오지 않는다", told, ["onOpen"]);
  view.render({ open: true, ...handlers });
  expectEqual(id, "같은 값으로 다시 그려도 api 를 또 부르지 않는다", calls.filter((name) => name === "open"), ["open"]);
  told.length = 0;
  globalThis.__s1Api.forceOpen(false);
  view.root.dispatch(`s1:${id}:close`, { reason: "escape" });
  expectEqual(id, "사용자가 닫으면(Esc) onClose 한 번 + onOpenChange(false, reason) 한 번", told, ["onClose", "change:false:escape"]);
  told.length = 0;
  view.render({ open: false, ...handlers });
  expectEqual(id, "부모가 상태를 맞춰 open=false 가 되면 api 를 또 부르지 않는다(이미 닫힘)", [calls.filter((name) => name === "close"), told], [[], []]);
  view.unmount();
  expectEqual(id, "떼어낼 때 destroy", calls.at(-1), "destroy");
}

/* 확인 · 취소 단추 */
for (const id of ["modal", "modal-content"]) {
  const component = await loadDynamic(id);
  globalThis.__s1Calls = [];
  globalThis.__s1Kind = id;
  globalThis.__s1Start = { open: true };
  const view = globalThis.__s1Harness(component.default);
  const told = [];
  view.render({ onConfirm: () => told.push("confirm"), onCancel: () => told.push("cancel"), onOpenChange: (open, detail) => told.push(`change:${open}:${detail.reason}`) });
  view.root.dispatch(`s1:${id}:close`, { reason: "confirm" });
  view.root.dispatch(`s1:${id}:close`, { reason: "cancel" });
  expectEqual(id, "확인/취소로 닫히면 onConfirm/onCancel 이 불리고 onOpenChange 에 이유가 실린다", told, ["confirm", "change:false:confirm", "cancel", "change:false:cancel"]);
}

/* 4단계: 선택형(chip · bottom-sheet-option · mobile-bottom-nav)의 제어형/비제어형 — river 결정 2026-10-13 「전부 부품이 알아서」 */
for (const [id, eventPrefix] of [["chip", "s1:chip"], ["bottom-sheet-option", "s1:bottom-sheet-option"], ["mobile-bottom-nav", "s1:mobile-bottom-nav"]]) {
  const component = await loadDynamic(id);
  const told = [];

  globalThis.__s1Calls = [];
  const controlled = globalThis.__s1Harness(component.default);
  controlled.render({ selected: false, onSelectedChange: (value) => told.push(value) });
  expectEqual(id, "제어형: 처음 값은 이벤트 없이 api.setSelected", globalThis.__s1Calls, ["init", "setSelected:false"]);
  const prevented = controlled.root.dispatch(`${eventPrefix}:beforechange`, { selected: true });
  expectEqual(id, "제어형: 눌러도 부품이 스스로 바뀌지 않게 beforechange 를 막고 알리기만 한다", [prevented, told], [true, [true]]);
  controlled.render({ selected: true, onSelectedChange: (value) => told.push(value) });
  expectEqual(id, "제어형: 값이 바뀌어야 부품 모양이 바뀐다", globalThis.__s1Calls.at(-1), "setSelected:true");
  controlled.root.dispatch(`${eventPrefix}:change`, { selected: true });
  expectEqual(id, "제어형: change 로는 다시 알리지 않는다(이중 호출 없음)", told, [true]);

  globalThis.__s1Calls = [];
  const toldFree = [];
  const free = globalThis.__s1Harness(component.default);
  free.render({ defaultSelected: true, onSelectedChange: (value) => toldFree.push(value) });
  expectEqual(id, "비제어형: defaultSelected 가 처음 값", globalThis.__s1Calls, ["init", "setSelected:true"]);
  const freePrevented = free.root.dispatch(`${eventPrefix}:beforechange`, { selected: true });
  expectEqual(id, "비제어형: beforechange 를 막지 않는다", [freePrevented, toldFree], [false, []]);
  free.root.dispatch(`${eventPrefix}:change`, { selected: true });
  expectEqual(id, "비제어형: 바뀐 뒤 알린다", toldFree, [true]);

  /* 새 이름과 옛 이름이 둘 다 불린다 */
  const names = [];
  const both = globalThis.__s1Harness(component.default);
  both.render({ onBeforeChange: () => names.push("onBeforeChange"), onBeforechange: () => names.push("onBeforechange") });
  both.root.dispatch(`${eventPrefix}:beforechange`, { selected: true });
  expectEqual(id, "onBeforeChange(새) · onBeforechange(옛) 둘 다 받는다", names, ["onBeforeChange", "onBeforechange"]);
}

/* 5단계: 값을 쥐는 부품 — value/defaultValue 가 부품에 들어가고, 화면이 시킨 변화는 되알리지 않는다 */
{
  const select = await loadDynamic("select");
  globalThis.__s1Calls = [];
  globalThis.__s1Kind = "select";
  globalThis.__s1Start = {};
  const told = [];
  const view = globalThis.__s1Harness(select.default);
  const options = [{ value: "a", label: "가" }, { value: 2, label: "나" }];
  view.render({ options, value: "a", onValueChange: (value) => told.push(value) });
  expectEqual("select", "value 가 부품에 들어간다(api.setValue)", globalThis.__s1Calls.filter((name) => name.startsWith("setValue")), ['setValue:"a"']);
  view.render({ options, value: "a", onValueChange: (value) => told.push(value) });
  expectEqual("select", "같은 값으로 다시 그리면 또 넣지 않는다", globalThis.__s1Calls.filter((name) => name.startsWith("setValue")).length, 1);
  view.root.dispatch("s1:select:change", { value: "2" });
  expectEqual("select", "고르면 onValueChange 에 준 그대로의 값(숫자 2)이 온다", told, [2]);
  view.render({ options, value: 2, onValueChange: (value) => told.push(value) });
  expectEqual("select", "value 가 바뀌면 부품에도 넣는다", globalThis.__s1Calls.filter((name) => name.startsWith("setValue")).at(-1), 'setValue:"2"');
}
{
  const pager = await loadDynamic("pagination");
  globalThis.__s1Calls = [];
  globalThis.__s1Kind = "pagination";
  globalThis.__s1Start = { page: 1, total: 6 };
  const told = [];
  const view = globalThis.__s1Harness(pager.default);
  view.render({ page: 3, totalPages: 10, onPageChange: (page) => told.push(page) });
  expectEqual("pagination", "totalPages · page 를 부품에 넣는다", globalThis.__s1Calls.filter((name) => /^set/.test(name)), ["setTotalPages:10", "setPage:3"]);
  expectEqual("pagination", "화면이 정한 변화는 onPageChange 로 되알리지 않는다", told, []);
  view.root.dispatch("s1:pagination:change", { page: 4, totalPages: 10 });
  expectEqual("pagination", "사용자가 눌러 바뀌면 onPageChange(page)", told, [4]);
}
for (const [id, kind, valueFor] of [["date-picker", "date-picker", "2026-10-01"], ["time-picker", "time-picker", "09:30"]]) {
  const component = await loadDynamic(id);
  globalThis.__s1Calls = [];
  globalThis.__s1Kind = kind;
  globalThis.__s1Start = {};
  const view = globalThis.__s1Harness(component.default);
  const told = [];
  view.render({ value: valueFor, onValueChange: (value) => told.push(value), onOpenChange: (open) => told.push(`open:${open}`) });
  expectEqual(id, "value 가 부품에 들어간다", globalThis.__s1Calls.filter((name) => name.startsWith("setValue")), [`setValue:${JSON.stringify(valueFor)}`]);
  view.render({ value: valueFor, open: true, onValueChange: (value) => told.push(value), onOpenChange: (open) => told.push(`open:${open}`) });
  expectEqual(id, "open 을 주면 열고, 되알리지 않는다", [globalThis.__s1Calls.includes("openPanel"), told], [true, []]);
}
{
  const toggle = await loadDynamic("toggle");
  globalThis.__s1Calls = [];
  globalThis.__s1Kind = "toggle";
  globalThis.__s1Start = { checked: false };
  const told = [];
  const view = globalThis.__s1Harness(toggle.default);
  view.render({ checked: true, onCheckedChange: (value) => told.push(value) });
  expectEqual("toggle", "checked 를 부품에 넣고 되알리지 않는다", [globalThis.__s1Calls.includes("set:true"), told], [true, []]);
  view.root.dispatch("s1:toggle:change", { checked: false });
  expectEqual("toggle", "사용자가 누르면 onCheckedChange(false)", told, [false]);
}

if (failures.length || capability.length || dynamicProblems.length) {
  if (failures.length) {
    console.error(`❌ React 컴포넌트가 승인 마크업과 다릅니다 (${failures.length}건 / ${compared}벌 대조)\n`);
    for (const failure of failures) console.error(`- ${failure}\n`);
  }
  if (capability.length) {
    console.error(`❌ 밖에서 넣은 값이 화면에 반영되지 않습니다 (${capability.length}건)\n`);
    for (const item of capability) console.error(`- ${item}`);
  }
  if (dynamicProblems.length) {
    console.error(`❌ 열림 · 값 · 선택 배선이 어긋납니다 (${dynamicProblems.length}건)\n`);
    for (const item of dynamicProblems) console.error(`- ${item}`);
  }
  process.exit(1);
}
console.log(`✅ React 컴포넌트 ${approved.length}개 · ${compared}벌이 승인 마크업과 같고, 목록·슬롯·폼·자식·id 통로와 열림·값·선택 배선이 모두 열려 있습니다.`);
