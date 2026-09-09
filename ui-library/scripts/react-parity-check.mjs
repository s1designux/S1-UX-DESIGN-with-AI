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
import { firstInstance, parseHtml } from "./react.mjs";

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
export default { createElement, Fragment, isValidElement, useId, useRef, useEffect };
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
  if (typeof node.type === "function") { renderNode(node.type({ ...node.props, children: node.children }), into); return; }
  if (typeof node.type === "symbol") { for (const child of node.children) renderNode(child, into); return; }

  const attributes = new Map();
  for (const [name, value] of Object.entries(node.props ?? {})) {
    if (["key", "ref", "children"].includes(name)) continue;
    if (value === undefined || value === null || value === false) continue;
    attributes.set(HTML_NAMES.get(name) ?? name, value === true ? "" : String(value));
  }
  const children = [];
  for (const child of node.children) renderNode(child, children);
  into.push({ type: "element", tag: String(node.type).toLowerCase(), attributes, children });
}

/* ── 예제 → 비교용 트리 ───────────────────────────────────────────────── */

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
    const html = await readFile(path.join(distRoot, examplePath), "utf8");
    const expected = fromExample(firstInstance(parseHtml(html, component.id), component.id));
    const rendered = [];
    const props = module.BREAKS.length > 1 ? { breakName } : {};
    renderNode(module.default(props), rendered);
    const actual = rendered.find((node) => node.type === "element");
    if (!actual) { failures.push(`${component.id} (${breakName}): 아무것도 그려지지 않았습니다.`); continue; }
    canonicalizeLinks(expected);
    canonicalizeLinks(actual);
    const left = describe(expected);
    const right = describe(actual);
    compared += 1;
    if (left !== right) {
      const leftLines = left.split("\n");
      const rightLines = right.split("\n");
      const at = leftLines.findIndex((line, index) => line !== rightLines[index]);
      failures.push(`${component.id} (${breakName}): ${at + 1}번째 줄부터 다릅니다.\n  예제 : ${leftLines[at] ?? "(없음)"}\n  컴포넌트: ${rightLines[at] ?? "(없음)"}`);
    }
  }
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
  const signature = source.match(/export default function \w+\(\{([^}]*)\}/s)?.[1] ?? "";
  const has = (name) => new RegExp(`(^|[,{\\s])${name}([,}\\s=]|$)`).test(signature);

  /* 목록 데이터 */
  for (const match of signature.matchAll(/\b(rows|options|pages|tabs|cells|headerCells|items|values|texts|links|columns)\b/g)) {
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
    if (!textIn(rendered).includes(MARK)) capability.push(`${component.id}: parts 로 넣은 내용이 화면에 나오지 않습니다.`);
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

if (failures.length || capability.length) {
  if (failures.length) {
    console.error(`❌ React 컴포넌트가 승인 마크업과 다릅니다 (${failures.length}건 / ${compared}벌 대조)\n`);
    for (const failure of failures) console.error(`- ${failure}\n`);
  }
  if (capability.length) {
    console.error(`❌ 밖에서 넣은 값이 화면에 반영되지 않습니다 (${capability.length}건)\n`);
    for (const item of capability) console.error(`- ${item}`);
  }
  process.exit(1);
}
console.log(`✅ React 컴포넌트 ${approved.length}개 · ${compared}벌이 승인 마크업과 같고, 목록·슬롯·폼·자식·id 통로가 모두 열려 있습니다.`);
