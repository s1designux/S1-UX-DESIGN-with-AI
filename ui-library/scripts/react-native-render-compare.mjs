#!/usr/bin/env node
/**
 * react-native-render-compare.mjs — RN 부품을 웹 배포본과 나란히 그려 비교한다.
 * --------------------------------------------------------------------------
 * 왜: 표의 값이 CSS 와 같아도(결정론 검사), 그 값을 RN 이 그려 낸 결과가 웹과 같다는 뜻은 아니다
 *     (레이아웃 엔진이 다르다). 그래서 같은 조합을 양쪽에서 실제로 그려 상자 크기·위치·색을 잰다.
 *
 * 방식: react-native-web + react-native-svg(웹) 로 갤러리를 브라우저 번들로 묶어 헤드리스 크롬에서 그린다.
 *       왼쪽 = 웹 배포본(dist CSS + 승인 예제 마크업), 오른쪽 = RN 부품(react-native-web).
 *       같은 조합 목록(gallery/cases.js) · PC·Mobile × Light·Dark.
 *
 * 사용: node ui-library/scripts/react-native-render-compare.mjs [--only=button,chip] [--shots] [--no-measure]
 *   산출: reports/ui-library/react-native/compare.html (+ compare.bundle.js · measure.json · shots/*.png)
 * 종료코드: 0 차이 없음 · 1 차이 있음(보고서에 상세) · 2 실행 불가
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { parseHtml } from "./react.mjs";

const require = createRequire(import.meta.url);
const { spawnChrome, killChromeTree } = require("../../scripts/lib/chrome-proc.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const libraryRoot = path.resolve(here, "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const dist = path.join(libraryRoot, "dist");
const rnRoot = path.join(dist, "platform", "react-native");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => args.find((one) => one.startsWith(`--${name}=`))?.slice(name.length + 3);
const only = option("only")?.split(",");
const outDir = path.resolve(repositoryRoot, option("out") ?? "reports/ui-library/react-native");
/* 비교 화면은 저장소 안에서 http 로 열린다(마스크 아이콘은 file:// 로 안 그려진다). 저장소 밖 경로는 열 수 없어 3분을 기다리다 끝나므로 바로 멈춘다. */
if (path.relative(repositoryRoot, outDir).startsWith("..") || path.isAbsolute(path.relative(repositoryRoot, outDir))) {
  console.error(`❌ --out 은 저장소 안의 경로여야 합니다: ${outDir} 는 저장소(${repositoryRoot}) 밖이라 비교 화면을 열 수 없습니다.`);
  process.exit(2);
}
const FONT = '"Pretendard Variable", "Pretendard", sans-serif';

/* ── 1. 웹 쪽 DOM 만들기 ─────────────────────────────────────────────── */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const escapeAttribute = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeText = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** 안쪽 칸 고치기 — { part, nth?, fromNth?, attrs?, force?, text?, remove? } 를 DOM 순서로 세어 맞는 칸에 적용한다. */
function makeEditor(edits) {
  const counters = new Map();
  return (node) => {
    const part = node.attributes.find(([name]) => name === "data-s1-part")?.[1];
    if (part === undefined) return null;
    const index = counters.get(part) ?? 0;
    counters.set(part, index + 1);
    const hits = (edits ?? []).filter((edit) => edit.part === part && (edit.nth === undefined || edit.nth === index) && (edit.fromNth === undefined || index >= edit.fromNth));
    return hits.length ? hits : null;
  };
}

function serialize(node, rootAttributes, editor) {
  if (node.type === "text") return escapeText(node.value);
  let attributes = rootAttributes ?? node.attributes;
  let text = null;
  const hits = editor ? editor(node) : null;
  if (hits) {
    const map = new Map(attributes.map(([name, value]) => [name, value]));
    for (const edit of hits) {
      if (edit.remove) return "";
      for (const [name, value] of Object.entries(edit.attrs ?? {})) map.set(name, value === true ? "" : value);
      for (const name of FORCE_ATTRIBUTE[edit.force] ?? []) map.set(name, "");
      if (edit.text !== undefined) text = edit.text;
    }
    attributes = [...map];
  }
  const attributeText = attributes.map(([name, value]) => (value === true || value === "" ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`)).join("");
  if (VOID.has(node.tag)) return `<${node.tag}${attributeText}>`;
  return `<${node.tag}${attributeText}>${text !== null ? escapeText(text) : node.children.map((child) => serialize(child, undefined, editor)).join("")}</${node.tag}>`;
}

function allInstances(tree, id) {
  const found = [];
  const walk = (node) => {
    if (node.type !== "element") return;
    if (node.attributes.some(([name, value]) => name === "data-s1-component" && value === id)) { found.push(node); return; }
    for (const child of node.children) walk(child);
  };
  for (const child of tree.children) walk(child);
  return found;
}

const distManifest = JSON.parse(fs.readFileSync(path.join(dist, "manifest.json"), "utf8"));
const componentManifests = new Map(distManifest.components.map(({ id }) => [id, JSON.parse(fs.readFileSync(path.join(dist, "components", `${id}.manifest.json`), "utf8"))]));

function exampleFile(id, key) {
  if (key === "pc") return path.join(dist, "examples", `${id}.html`);
  const spec = componentManifests.get(id).htmlContract.breakExamples?.[key];
  return path.join(dist, spec ? spec.distribution : `examples/${id}.${key}.html`);
}

const FORCE_ATTRIBUTE = { hover: ["data-force-hover"], pressed: ["data-force-hover", "data-force-active"], active: ["data-force-hover", "data-force-active"], focus: ["data-force-focus-visible", "data-force-focus-within"] };

/** 한 페이지에 같은 예제를 여러 칸 두므로 id·name 이 겹친다 — 칸마다 꼬리표를 붙여 서로 건드리지 않게 한다
 *  (겹치면 펼침 카드가 첫 칸의 패널을 열고, 라디오는 다른 칸의 선택을 풀어 버린다). */
function uniquify(markup, suffix) {
  const ids = new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const rename = (list) => list.split(/\s+/).map((token) => (ids.has(token) ? `${token}-${suffix}` : token)).join(" ");
  return markup
    .replace(/(\s(?:id|for|aria-controls|aria-labelledby|aria-describedby|aria-owns)=")([^"]*)"/g, (whole, head, value) => `${head}${rename(value)}"`)
    .replace(/(<input\b[^>]*\sname=")([^"]*)"/g, (whole, head, value) => `${head}${value}-${suffix}"`);
}

function webMarkup(one) {
  const id = one.id.split("/")[0];
  const tree = parseHtml(fs.readFileSync(exampleFile(id, one.web.example), "utf8"), id);
  const instance = allInstances(tree, id)[one.web.instance];
  const map = new Map(instance.attributes.map(([name, value]) => [name, value]));
  for (const [name, value] of Object.entries(one.web.attributes ?? {})) map.set(name, value);
  if (one.props.open === true) map.delete("hidden");
  if (one.web.disabled) map.set("disabled", "");
  for (const name of FORCE_ATTRIBUTE[one.web.force] ?? []) map.set(name, "");
  return serialize(instance, [...map], makeEditor(one.web.parts));
}

/** css-model 이 모델에서 빼는 「한글 세로 보정」 규칙(웹 전용 1px)을 웹 쪽에서도 뺀다 — 같은 약속을 비교한다. */
function stripWebOnly(css) {
  const marker = /\/\*(?:(?!\*\/)[\s\S])*?한글 세로 보정(?:(?!\*\/)[\s\S])*?\*\//g;
  let out = "";
  let index = 0;
  let match;
  while ((match = marker.exec(css)) !== null) {
    const open = css.indexOf("{", marker.lastIndex);
    let depth = 0;
    let end = open;
    for (; end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      else if (css[end] === "}") { depth -= 1; if (depth === 0) break; }
    }
    out += css.slice(index, match.index);
    index = end + 1;
    marker.lastIndex = index;
  }
  /* text-box(글자 위아래 여백 자르기)와 그 @supports 블록 — RN 에는 없는 웹 전용 서체 보정이다 */
  const rest = out + css.slice(index);
  return rest.replace(/@supports \(text-box:[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "").replace(/\btext-box:[^;]*;/g, "");
}

/* 상태 가상 클래스를 같은 명시도의 속성으로 — kotlin-compose-parity-check 와 같은 방식(웹에서 :hover 를 스크립트로 켤 수 없다). */
const FORCED = [
  [/:focus-within\b/g, "[data-force-focus-within]"],
  [/:focus-visible\b/g, "[data-force-focus-visible]"],
  [/:hover\b/g, "[data-force-hover]"],
  [/:active\b/g, "[data-force-active]"]
];
const forceStates = (css) => FORCED.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), css);
function unwrapHoverMedia(css) {
  let out = "";
  let index = 0;
  while (index < css.length) {
    const at = css.indexOf("@media", index);
    if (at === -1) { out += css.slice(index); break; }
    const open = css.indexOf("{", at);
    const condition = css.slice(at + 6, open).trim();
    let depth = 0;
    let end = open;
    for (; end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      else if (css[end] === "}") { depth -= 1; if (depth === 0) break; }
    }
    out += css.slice(index, at);
    out += /hover/.test(condition) ? css.slice(open + 1, end) : "";
    index = end + 1;
  }
  return out;
}

/* ── 2. 번들 ─────────────────────────────────────────────────────────── */

async function bundle(cases) {
  const components = [...new Set(cases.map((one) => one.component))];
  const ids = [...new Set(cases.map((one) => one.id.split("/")[0]))];
  const entry = `
import { View } from "react-native";
import { createRoot } from "react-dom/client";
import { S1Provider } from ${JSON.stringify(path.join(rnRoot, "engine.js"))};
import { CASES } from ${JSON.stringify(path.join(rnRoot, "gallery", "cases.js"))};
${ids.map((id) => `import ${components.find((name) => cases.find((one) => one.component === name && one.id.startsWith(`${id}/`)))} from ${JSON.stringify(path.join(rnRoot, "components", `${id}.js`))};`).join("\n")}
const COMPONENTS = { ${components.join(", ")} };
const FONT = ${JSON.stringify(FONT)};
const roots = new Map();
window.S1_RENDER = (id, container, dark) => {
  const one = CASES.find((entry) => entry.id === id);
  const Component = COMPONENTS[one.component];
  const root = createRoot(container);
  roots.set(container, root);
  root.render(<S1Provider dark={dark} inline fontFamily={FONT}><View style={{ width: "100%", height: "100%" }}><Component {...one.props} /></View></S1Provider>);
};
window.S1_READY = true;
`;
  const entryFile = path.join(os.tmpdir(), `s1-rn-compare-entry-${process.pid}.jsx`);
  fs.writeFileSync(entryFile, entry);
  fs.mkdirSync(outDir, { recursive: true });
  const outfile = path.join(outDir, "compare.bundle.js");
  await esbuild.build({
    entryPoints: [entryFile],
    outfile,
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    loader: { ".js": "jsx" },
    nodePaths: [path.join(repositoryRoot, "node_modules")],
    alias: { "react-native": "react-native-web" },
    resolveExtensions: [".web.js", ".web.jsx", ".web.ts", ".web.tsx", ".js", ".jsx", ".ts", ".tsx", ".json"],
    mainFields: ["browser", "module", "main"],
    define: { "process.env.NODE_ENV": '"production"', __DEV__: "false", global: "window" },
    minify: true,
    legalComments: "none",
    logLevel: "warning"
  });
  fs.rmSync(entryFile, { force: true });
  return outfile;
}

/* ── 3. 비교 페이지 ──────────────────────────────────────────────────── */

const cellWidth = (one) => one.frame?.width ?? (one.break === "mobile" ? 360 : 480);

function pageHtml(cases, results) {
  const relDist = path.relative(outDir, dist).split(path.sep).join("/");
  const css = [
    fs.readFileSync(path.join(dist, "assets/css/tokens.css"), "utf8"),
    fs.readFileSync(path.join(dist, "assets/css/typography.css"), "utf8"),
    fs.readFileSync(path.join(dist, "s1-ui.css"), "utf8").replaceAll('url("./assets/icons/', `url("${relDist}/assets/icons/`)
  ].join("\n");
  const seenOverview = new Set();
  const rows = cases.map((one, index) => {
    const templateKey = one.id.split("/").slice(0, 2).join("/");
    const overview = !seenOverview.has(templateKey) || one.web.open;
    seenOverview.add(templateKey);
    const width = cellWidth(one);
    const frame = one.frame ? `height:${one.frame.height}px;${one.frame.clip ? "transform:translateZ(0);overflow:hidden;" : ""}` : "";
    const cell = (kind, theme) => `<div class="cell ${kind}" data-kind="${kind}" data-theme="${theme}" data-case="${index}"><div class="surface" data-theme="${theme}"><div data-s1-break="${one.break}" style="width:${width}px;${frame}position:relative">${kind === "web" ? uniquify(webMarkup(one), `${index}${theme[0]}`) : ""}</div></div></div>`;
    return `<section class="row" data-index="${index}" data-break="${one.break}" data-component="${one.id.split("/")[0]}"${one.web.open ? ' data-open="1"' : ""}${overview ? ' data-overview="1"' : ""}>
  <h3>${one.title}${results ? statusBadge(results[index]) : ""}</h3>
  <div class="pair" data-theme-pair="light">${cell("web", "light")}${cell("rn", "light")}</div>
  <div class="pair" data-theme-pair="dark">${cell("web", "dark")}${cell("rn", "dark")}</div>
  ${results ? detail(results[index]) : ""}
</section>`;
  }).join("\n");
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>S1 UI — React Native 렌더 대조</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
/* 웹 배포본 CSS (상태 강제용 속성 선택자로 바꾼 사본) */
${unwrapHoverMedia(forceStates(stripWebOnly(css)))}
</style>
<style>
body { margin: 0; font-family: -apple-system, system-ui, sans-serif; background: #f4f5f7; color: #1f2328; }
header.bar { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid #d8dde3; padding: 10px 16px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; font-size: 13px; }
header.bar label { display: inline-flex; gap: 4px; align-items: center; }
header.bar .sum { margin-left: auto; color: #667085; }
main { padding: 16px; display: grid; gap: 14px; }
.row { background: #fff; border: 1px solid #d8dde3; border-radius: 8px; padding: 10px 12px; }
.row h3 { margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #344054; }
.pair { display: inline-flex; vertical-align: top; margin-right: 12px; border: 1px solid #e4e7ec; border-radius: 6px; }
.row { overflow-x: auto; }
.cell { padding: 0; overflow: hidden; }   /* 칸보다 넓은 부품(GNB 등)이 이웃 카드를 덮지 않게 칸 안에서 자른다 */
.cell + .cell { border-left: 1px dashed #c3c8d0; }
.surface { padding: 12px; background: var(--color-bg-level-0); min-height: 24px; font-family: "Pretendard Variable", "Pretendard", sans-serif; }
.surface[data-theme="dark"] { background: var(--color-bg-level-0); }
.ok { color: #067647; } .bad { color: #b42318; } .warn { color: #b54708; }
.badge { margin-left: 8px; font-weight: 500; font-size: 11px; }
details { margin-top: 8px; font-size: 11px; } table.diff { border-collapse: collapse; margin-top: 4px; } table.diff td, table.diff th { border: 1px solid #e4e7ec; padding: 2px 6px; text-align: left; font-variant-numeric: tabular-nums; }
body.hide-light [data-theme-pair="light"], body.hide-dark [data-theme-pair="dark"] { display: none; }
body.only-pc .row[data-break="mobile"], body.only-mobile .row[data-break="pc"] { display: none; }
body.diff-only .row.same { display: none; }
body.overview main { display: flex; flex-wrap: wrap; align-items: flex-start; }
body.overview .row { width: max-content; overflow: visible; }
body.overview .row.skip { display: none; }
body.overview .row:not([data-overview]) { display: none; }
body.overview header.bar { position: static; }
</style></head>
<body class="${results ? "" : ""}">
<header class="bar">
  <b>RN ↔ 웹 렌더 대조</b>
  <span>왼쪽 = 웹 배포본 · 오른쪽 = React Native(react-native-web)</span>
  <label><input type="checkbox" id="t-light" checked> 라이트</label>
  <label><input type="checkbox" id="t-dark" checked> 다크</label>
  <label><select id="brk"><option value="all">PC·Mobile</option><option value="pc">PC</option><option value="mobile">Mobile</option></select></label>
  <label><input type="checkbox" id="t-diff"> 차이 있는 것만</label>
  <span class="sum" id="sum"></span>
</header>
<main>
${rows}
</main>
<script type="module">
/* 웹 쪽은 배포본의 실제 동작 스크립트까지 돌린 뒤의 모습이다 — RN 은 같은 동작을 controller 로 옮겼으므로 처음 상태가 같아야 한다. */
import { autoInit } from "${relDist}/s1-ui.auto.js";
/* 겹침(모달·바텀시트)은 열려 있는 동안 초점을 가두는 동작이 있어, 다른 칸의 초점 이동과 맞부딪쳐 끝없이 되돌린다.
   이 칸들은 이미 열린 정적 모양으로만 견주므로 동작 스크립트를 붙이지 않는다. */
const OVERLAY = ["modal", "modal-content", "bottom-sheet"];
for (const holder of document.querySelectorAll(".cell.web [data-s1-break]")) {
  const root = holder.querySelector("[data-s1-component]");
  if (root && OVERLAY.includes(root.getAttribute("data-s1-component"))) continue;
  autoInit(holder);
}
/* 열린 조합은 웹 쪽도 실제로 트리거를 눌러 열어 보여 준다(측정 때는 측정기가 직접 눌러서 여닫는다). */
if (window.S1_MEASURING) window.S1_OPEN_DONE = true;
else {
  /* 라이트·다크 칸 전부(칸마다 트리거가 따로 있다)를 연 뒤, 떠 있는(fixed) 패널을 칸 안의 절대 좌표로 붙박는다 —
     그러지 않으면 패널이 화면 좌표에 매달려 스크롤하면 다른 카드를 덮고, 아래가 모자라면 위로 뒤집힌다. 늘 트리거 아래(8)에 둔다.
     부품이 스크롤·크기 변화 때마다 패널 자리를 다시 잡으므로, 붙박은 사본을 만들어 놓고 원래 패널은 숨긴다(이 화면 안의 웹 쪽 패널은 보여 주기 전용). */
  window.S1_OPEN_DONE = false;
  (async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (const trigger of document.querySelectorAll('.row[data-open] .cell.web [data-s1-part="trigger"]')) {
      if (trigger.getClientRects().length === 0) continue;
      trigger.click();
      await sleep(120);
      const holder = trigger.closest("[data-s1-break]");
      const panel = holder && holder.querySelector('[data-s1-part="panel"][data-s1-float]');
      if (!panel) continue;
      const anchor = trigger.getBoundingClientRect();
      /* 열리는 동안 움직임(transform)이 있어 getBoundingClientRect 는 믿을 수 없다 — 부품이 style 에 적어 둔 화면 좌표를 쓴다. */
      const box = { left: parseFloat(panel.style.left) || 0, top: parseFloat(panel.style.top) || 0 };
      const flipped = panel.getAttribute("data-flip") === "up";
      const frozen = panel.cloneNode(true);
      frozen.removeAttribute("data-flip");
      frozen.style.position = "absolute";
      panel.after(frozen);
      /* 절대 좌표의 기준은 가장 가까운 position 있는 조상이다 — 그 상자 기준으로 계산한다. */
      const parent = frozen.offsetParent || holder;
      const base = parent.getBoundingClientRect();
      frozen.style.left = (box.left - base.left - parent.clientLeft) + "px";
      frozen.style.top = ((flipped ? anchor.bottom + 8 : box.top) - base.top - parent.clientTop) + "px";
      panel.style.display = "none";
    }
    window.S1_OPEN_DONE = true;
  })();
}
window.S1_WEB_READY = true;
</script>
<script>window.S1_CASES = ${JSON.stringify(cases.map((one) => ({ id: one.id, break: one.break, act: one.web.act })))};</script>
<script src="compare.bundle.js"></script>
<script>
const body = document.body;
const bind = (id, fn) => document.getElementById(id).addEventListener("change", fn);
bind("t-light", (e) => body.classList.toggle("hide-light", !e.target.checked));
bind("t-dark", (e) => body.classList.toggle("hide-dark", !e.target.checked));
bind("brk", (e) => { body.classList.remove("only-pc", "only-mobile"); if (e.target.value !== "all") body.classList.add("only-" + e.target.value); });
bind("t-diff", (e) => body.classList.toggle("diff-only", e.target.checked));
const params = new URLSearchParams(location.search);
if (params.get("parts")) {
  /* 개요를 여러 장으로 나눠 찍는다 — part=i&parts=n 이면 개요 칸을 n 등분한 i 번째만 보인다. */
  const parts = Number(params.get("parts")); const part = Number(params.get("part"));
  const cards = [...document.querySelectorAll(".row[data-overview]")];
  const size = Math.ceil(cards.length / parts);
  cards.forEach((card, index) => { if (Math.floor(index / size) !== part) card.classList.add("skip"); });
}
if (params.get("overview") === "1") body.classList.add("overview");
if (params.get("theme") === "light") { document.getElementById("t-dark").checked = false; body.classList.add("hide-dark"); }
if (params.get("theme") === "dark") { document.getElementById("t-light").checked = false; body.classList.add("hide-light"); }
if (params.get("break") === "pc" || params.get("break") === "mobile") { document.getElementById("brk").value = params.get("break"); body.classList.add("only-" + params.get("break")); }
/* 표는 RN 에 자동 배치(열 폭을 내용으로 정함)가 없다 — 웹도 같은 약속(table-layout: fixed)으로 맞춰 견준다. */
for (const table of document.querySelectorAll(".cell.web table")) table.style.tableLayout = "fixed";

/* 웹 쪽 감싸개를 RN 과 같은 세로 쌓기로 — 인라인 계열 루트(inline-flex)는 줄 상자(baseline) 때문에 1px 어긋나 보이지 않게 내용만큼(왼쪽)으로 둔다. */
for (const holder of document.querySelectorAll(".cell.web [data-s1-break]")) {
  const inlineChildren = [...holder.children].filter((child) => /^inline/.test(getComputedStyle(child).display));
  holder.style.display = "flex"; holder.style.flexDirection = "column";
  for (const child of inlineChildren) child.style.alignSelf = "flex-start";
}
for (const cell of document.querySelectorAll(".cell.rn")) {
  const index = Number(cell.dataset.case);
  window.S1_RENDER(window.S1_CASES[index].id, cell.querySelector("[data-s1-break]"), cell.dataset.theme === "dark");
}
/* 승인된 동작이 만드는 상태(선택·펼침·페이지 이동)는 양쪽에서 똑같이 눌러서 만든다. */
window.S1_ACT_ERRORS = [];
window.S1_ACTS = (async () => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await sleep(800);
  for (let i = 0; i < 600 && window.S1_OPEN_DONE !== true; i += 1) await sleep(50);   // 열린 조합을 다 연 뒤에 누른다(바깥 누름이 열린 패널을 닫지 않게)
  const find = (cell, step) => {
    const selector = cell.dataset.kind === "web" ? '[data-s1-part="' + step.part + '"]' : '[data-s1part="' + step.part + '"]';
    let list = [...cell.querySelectorAll(selector)];
    if (step.text !== undefined) list = list.filter((element) => element.textContent.trim() === step.text);
    return list[step.nth ?? 0];
  };
  for (const cell of document.querySelectorAll(".cell")) {
    const act = window.S1_CASES[Number(cell.dataset.case)].act;
    if (!act) continue;
    for (const step of act) {
      const element = find(cell, step);
      if (!element) { window.S1_ACT_ERRORS.push(window.S1_CASES[Number(cell.dataset.case)].id + " (" + cell.dataset.kind + "): 누를 칸을 못 찾았다 — " + JSON.stringify(step)); break; }
      element.click();
      await sleep(160);
    }
  }
  window.S1_ACTS_DONE = true;
  await sleep(300);
  document.documentElement.setAttribute("data-page-h", String(Math.ceil(document.documentElement.scrollHeight)));   // 개요 스크린샷이 전체 높이로 찍히게 알려 준다
})();
${results ? "document.getElementById('sum').textContent = " + JSON.stringify(summaryText(results)) + ";" : ""}
</script>
</body></html>`;
}

function statusBadge(result) {
  if (!result) return "";
  if (result.status === "same") return '<span class="badge ok">일치</span>';
  return `<span class="badge ${result.status === "diff" ? "bad" : "warn"}">${result.status === "diff" ? `차이 ${result.diffCount}건` : result.status}</span>`;
}

function detail(result) {
  if (!result || result.rows.length === 0) return "";
  const body = result.rows.slice(0, 40).map((row) => `<tr><td>${row.theme}</td><td>${row.part}</td><td>${row.field}</td><td>${row.web}</td><td>${row.rn}</td></tr>`).join("");
  return `<details><summary>차이 ${result.rows.length}건 보기</summary><table class="diff"><tr><th>테마</th><th>요소</th><th>항목</th><th>웹</th><th>RN</th></tr>${body}</table></details>`;
}

function summaryText(results) {
  const total = results.length;
  const same = results.filter((one) => one.status === "same").length;
  return `조합 ${total}개 · 일치 ${same} · 차이 ${total - same}`;
}

/* ── 4. 측정 ─────────────────────────────────────────────────────────── */

const MEASURE_SCRIPT = `
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
  await wait(400);
  for (let i = 0; i < 400 && !window.S1_ACTS_DONE; i++) await wait(50);
  const near = (a, b) => Math.abs(a - b) <= 0.75;
  const collect = (cell, kind) => {
    const origin = cell.querySelector("[data-s1-break]").getBoundingClientRect();
    const raw = kind === "web"
      ? [...cell.querySelectorAll("[data-s1-component],[data-s1-part]")].map((el) => ({ el, name: el.hasAttribute("data-s1-component") ? "c:" + el.getAttribute("data-s1-component") : "p:" + el.getAttribute("data-s1-part") }))
      : [...cell.querySelectorAll("[data-s1k]")].filter((el) => el.dataset.s1c || el.dataset.s1part).map((el) => ({ el, name: el.dataset.s1c ? "c:" + el.dataset.s1c : "p:" + el.dataset.s1part }));
    /* 보이지 않는 것(display:none)과, 높이·너비 0 인 자름 상자(접힌 카드 등) 안에 갇힌 것은 양쪽에서 뺀다. */
    const clipped = (el) => { for (let node = el.parentElement; node && node !== cell; node = node.parentElement) { const box = node.getBoundingClientRect(); const overflow = getComputedStyle(node).overflow; if ((box.height === 0 || box.width === 0) && overflow !== "visible") return true; } return false; };
    return raw.filter(({ el }) => el.getClientRects().length > 0 && !clipped(el)).map(({ el, name }) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      const textEl = (function find(node) {
        for (const child of node.childNodes) if (child.nodeType === 3 && child.textContent.trim()) return node;
        for (const child of node.children) { const hit = find(child); if (hit) return hit; }
        return null;
      })(el);
      const t = textEl ? getComputedStyle(textEl) : null;
      /* 가상요소(::before·::after) — 웹은 계산값, RN 은 실제로 그린 View 의 상자·색 */
      const pseudo = {};
      for (const which of ["before", "after"]) {
        if (kind === "web") {
          const ps = getComputedStyle(el, "::" + which);
          if (ps.content && ps.content !== "none" && ps.content !== "normal" && ps.display !== "none") pseudo[which] = { w: parseFloat(ps.width) || 0, h: parseFloat(ps.height) || 0, bg: ps.backgroundColor, mask: ps.maskImage && ps.maskImage !== "none" ? { image: ps.maskImage, size: ps.maskSize, position: ps.maskPosition } : null };
        } else {
          const node = [...el.children].find((child) => child.dataset && child.dataset.s1k === el.dataset.s1k + "::" + which);
          if (node) { const pr = node.getBoundingClientRect(); pseudo[which] = { w: pr.width, h: pr.height, bg: getComputedStyle(node).backgroundColor, icon: node.dataset.s1icon ?? null, el: node }; }
        }
      }
      /* 글자 자리 — 글자 칸(Range) 의 실제 좌표. 상자가 같아도 글자가 한쪽으로 쏠리면 여기서 잡힌다. */
      let textRect = null;
      /* 입력칸 안의 값 글자는 바깥에서 Range 로 잴 수 없다(웹 textarea 는 안쪽 스크롤 좌표) — 이 항목만 글자 자리를 재지 않는다. */
      if (textEl && !/^(TEXTAREA|INPUT)$/.test(textEl.tagName)) {
        const nodes = [...textEl.childNodes].filter((child) => child.nodeType === 3 && child.textContent.trim());
        if (nodes.length) {
          const range = document.createRange();
          range.setStartBefore(nodes[0]); range.setEndAfter(nodes[nodes.length - 1]);
          const tr = range.getBoundingClientRect();
          const tb = textEl.getBoundingClientRect();
          textRect = { lines: new Set([...range.getClientRects()].filter((q) => q.width > 0).map((q) => Math.round(q.top))).size, flexy: /flex|grid/.test(t.display), clipped: t.overflowX !== "visible" && textEl.scrollWidth > textEl.clientWidth + 1, x: tr.left - origin.left, y: tr.top - origin.top, w: tr.width, h: tr.height, boxW: tb.width - (parseFloat(t.paddingLeft) || 0) - (parseFloat(t.paddingRight) || 0) - (parseFloat(t.borderLeftWidth) || 0) - (parseFloat(t.borderRightWidth) || 0) };
        }
      }
      const side = (name) => s["border" + name + "Width"] + " " + s["border" + name + "Color"];
      return {
        el,
        icon: el.dataset && el.dataset.s1icon !== undefined ? el.dataset.s1icon : null,
        mask: kind === "web" && s.maskImage && s.maskImage !== "none" ? { image: s.maskImage, size: s.maskSize, position: s.maskPosition } : null,
        pseudo, name, x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height,
        bg: s.backgroundColor, bt: side("Top"), br: side("Right"), bb: side("Bottom"), bl: side("Left"),
        radius: s.borderTopLeftRadius, rtr: s.borderTopRightRadius, rbr: s.borderBottomRightRadius, rbl: s.borderBottomLeftRadius,
        shadow: s.boxShadow,
        opacity: s.opacity,
        color: t ? t.color : null, fontSize: t ? t.fontSize : null, fontWeight: t ? t.fontWeight : null, letterSpacing: t ? t.letterSpacing : null, lineHeight: t ? t.lineHeight : null,
        textAlign: t ? t.textAlign : null, textRect,
        text: t ? textEl.textContent.trim().slice(0, 24) : null
      };
    });
  };
  const align = (web, rn) => {
    /* 이름 순서로 맞춘다(LCS) */
    const m = web.length, n = rn.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = web[i].name === rn[j].name ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const pairs = []; const onlyWeb = []; const onlyRn = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (web[i].name === rn[j].name) { pairs.push([web[i], rn[j]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) onlyWeb.push(web[i++]); else onlyRn.push(rn[j++]);
    }
    while (i < m) onlyWeb.push(web[i++]);
    while (j < n) onlyRn.push(rn[j++]);
    return { pairs, onlyWeb, onlyRn };
  };
  /* 아이콘 모양 — 래스터 비교. 웹은 mask 로 쓰는 SVG 를 contain·center 로 그린 알파, RN 은 실제로 그려진 svg 를 같은 상자에 그린 알파.
     두 알파(>=128)의 겹침 비율(IoU)이 ICON_IOU_MIN 이상이어야 같은 모양으로 본다. 허용오차 = 0.85 (헤드리스 크롬은 중첩 svg 를 쓰는 원본을 가는 선이 약 13% 얇게 그려 같은 모양도 0.886 까지 내려간다 — 도형 누락은 0.5 안팎이라 가려진다). */
  const ICON_IOU_MIN = 0.85;
  const SCALE = 4;
  const urlOf = (image) => { const m = /url\\("?([^")]+)"?\\)/.exec(image || ""); return m ? m[1] : null; };
  const loadImage = (src) => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("이미지를 읽지 못했습니다: " + String(src).slice(0, 90))); img.src = src; });
  const inkOf = async (img, w, h) => {
    const W = Math.max(1, Math.round(w * SCALE)), H = Math.max(1, Math.round(h * SCALE));
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const nw = img.naturalWidth || W, nh = img.naturalHeight || H;
    const k = Math.min(W / nw, H / nh);
    ctx.drawImage(img, (W - nw * k) / 2, (H - nh * k) / 2, nw * k, nh * k);
    const data = ctx.getImageData(0, 0, W, H).data;
    const ink = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) ink[i] = data[i * 4 + 3] >= 128 ? 1 : 0;
    return ink;
  };
  const svgSource = (svg, w, h) => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("width", String(w)); clone.setAttribute("height", String(h));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("style");
    for (const node of clone.querySelectorAll("*")) {
      const fill = node.getAttribute("fill"); const stroke = node.getAttribute("stroke");
      if (fill !== null && fill !== "none") node.setAttribute("fill", "#000");
      if (stroke !== null && stroke !== "none") node.setAttribute("stroke", "#000");
    }
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  };
  const iconRows = async (theme, part, mask, rnEl, w, h, rows, stats) => {
    const url = urlOf(mask.image);
    const svg = rnEl && rnEl.querySelector("svg");
    if (!url || !svg) { rows.push({ theme, part, field: "아이콘 모양", web: url ? "있음" : "없음", rn: svg ? "있음" : "없음" }); return; }
    if (mask.size !== "contain" || !/^(50% 50%|center)/.test(mask.position)) { stats.skipped++; return; }
    /* 웹 쪽도 RN 쪽과 같은 길(문자열 → 새 크기의 data URL)로 그린다. 파일 주소 그대로 그리면 작은 원래 크기로 한 번 굳은 뒤 늘어나 가는 선이 사라진다. */
    const text = await (await fetch(url)).text();
    const sized = text.replace(/<svg\\b([^>]*)>/, (whole, attrs) => "<svg" + attrs.replace(/\\s(width|height)="[^"]*"/g, "") + ' width="' + (w * SCALE) + '" height="' + (h * SCALE) + '">');
    const webImg = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(sized));
    let a, b;
    try { [a, b] = await Promise.all([inkOf(webImg, w, h), inkOf(await loadImage(svgSource(svg, w * SCALE, h * SCALE)), w, h)]); }
    catch (error) { rows.push({ theme, part, field: "아이콘 그림 읽기", web: url.split("/").pop(), rn: String(error.message).slice(0, 80) }); return; }
    let both = 0, either = 0, webInk = 0, rnInk = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] && b[i]) both++; if (a[i] || b[i]) either++; webInk += a[i]; rnInk += b[i]; }
    const iou = either === 0 ? 1 : both / either;
    stats.icons++;
    if (iou < ICON_IOU_MIN) rows.push({ theme, part, field: "아이콘 모양(IoU<" + ICON_IOU_MIN + ")", web: url.split("/").pop() + " " + w + "x" + h + " nat " + webImg.naturalWidth + "x" + webImg.naturalHeight + " 잉크 " + webInk, rn: "IoU " + iou.toFixed(3) + " 잉크 " + rnInk });
  };
  const stats = { icons: 0, skipped: 0, texts: 0 };
  const results = [];
  const rows = [...document.querySelectorAll(".row")];
  for (const row of rows) {
    const rowResult = { rows: [], status: "same", diffCount: 0, compared: 0 };
    for (const theme of ["light", "dark"]) {
      const pair = row.querySelector('[data-theme-pair="' + theme + '"]');
      /* 열린 모양은 웹에서 실제로 트리거를 눌러 연다 — 떠 있는 패널은 화면 좌표로 붙으므로 보이는 자리로 스크롤한 뒤 바로 잰다. */
      const webTrigger = row.dataset.open ? pair.querySelector('.cell.web [data-s1-part="trigger"]') : null;
      if (webTrigger) { pair.scrollIntoView({ block: "center" }); await wait(50); webTrigger.click(); await wait(80); }
      const web = collect(pair.querySelector(".cell.web"), "web");
      const rn = collect(pair.querySelector(".cell.rn"), "rn");
      const { pairs, onlyWeb, onlyRn } = align(web, rn);
      for (const item of onlyWeb) rowResult.rows.push({ theme, part: item.name, field: "존재", web: "있음", rn: "없음" });
      for (const item of onlyRn) rowResult.rows.push({ theme, part: item.name, field: "존재", web: "없음", rn: "있음" });
      if (webTrigger) webTrigger.click();
      for (const [a, b] of pairs) {
        rowResult.compared++;
        for (const key of ["x", "y", "w", "h"]) if (!near(a[key], b[key])) rowResult.rows.push({ theme, part: a.name, field: key, web: a[key].toFixed(2), rn: b[key].toFixed(2) });
        if (b.icon !== null) { const probe = document.createElement("i"); probe.style.color = b.icon; document.body.appendChild(probe); b.bg = getComputedStyle(probe).color; probe.remove(); }
        const zero = (v) => v.startsWith("0px");
        for (const key of ["bg", "bt", "br", "bb", "bl", "radius", "rtr", "rbr", "rbl", "shadow", "opacity"]) {
          if (a[key] === b[key]) continue;
          if (/^b[trbl]$/.test(key) && zero(a[key]) && zero(b[key])) continue;
          if (key === "shadow" && (a.shadow === "none" || a.shadow === "") && (b.shadow === "none" || b.shadow === "")) continue;
          rowResult.rows.push({ theme, part: a.name, field: { bt: "윗테두리", br: "오른테두리", bb: "아래테두리", bl: "왼테두리", radius: "좌상 반경", rtr: "우상 반경", rbr: "우하 반경", rbl: "좌하 반경", shadow: "그림자", bg: "배경", opacity: "투명도" }[key], web: a[key], rn: b[key] });
        }
        if (a.mask || b.icon !== null) await iconRows(theme, a.name, a.mask || { image: "", size: "", position: "" }, b.el, a.w || b.w, a.h || b.h, rowResult.rows, stats);
        for (const which of ["before", "after"]) {
          const pa = a.pseudo[which], pb = b.pseudo[which];
          if (!pa && !pb) continue;
          if (!pa || !pb) { rowResult.rows.push({ theme, part: a.name + "::" + which, field: "존재", web: pa ? "있음" : "없음", rn: pb ? "있음" : "없음" }); continue; }
          /* 크기가 auto/100% 인 것은 웹 계산값이 px 로 풀려 있어 같은 값을 읽는다. 아이콘 색은 RN 이 s1icon 으로 노출한다. */
          if (pa.w && !near(pa.w, pb.w)) rowResult.rows.push({ theme, part: a.name + "::" + which, field: "w", web: pa.w.toFixed(2), rn: pb.w.toFixed(2) });
          if (pa.h && !near(pa.h, pb.h)) rowResult.rows.push({ theme, part: a.name + "::" + which, field: "h", web: pa.h.toFixed(2), rn: pb.h.toFixed(2) });
          let rnColor = pb.bg;
          if (pb.icon) { const probe = document.createElement("i"); probe.style.color = pb.icon; document.body.appendChild(probe); rnColor = getComputedStyle(probe).color; probe.remove(); }
          if (pa.bg !== rnColor && !(pa.bg === "rgba(0, 0, 0, 0)" && rnColor === "rgba(0, 0, 0, 0)")) rowResult.rows.push({ theme, part: a.name + "::" + which, field: "bg", web: pa.bg, rn: rnColor });
          if (pa.mask || pb.icon) await iconRows(theme, a.name + "::" + which, pa.mask || { image: "", size: "", position: "" }, pb.el, pa.w || pb.w, pa.h || pb.h, rowResult.rows, stats);
        }
        if (a.text !== null && b.text !== null) {
          stats.texts++;
          for (const key of ["color", "fontSize", "fontWeight"]) if (a[key] !== b[key]) rowResult.rows.push({ theme, part: a.name, field: key, web: a[key], rn: b[key] });
          if (Math.abs(parseFloat(a.letterSpacing || 0) - parseFloat(b.letterSpacing || 0)) > 0.02) rowResult.rows.push({ theme, part: a.name, field: "letterSpacing", web: a.letterSpacing, rn: b.letterSpacing });
          /* 행간: 웹이 normal 이면 글꼴이 정한 값이라 견주지 않는다(RN 은 늘 px). */
          if (a.lineHeight !== "normal" && b.lineHeight !== "normal" && Math.abs(parseFloat(a.lineHeight) - parseFloat(b.lineHeight)) > 0.5) rowResult.rows.push({ theme, part: a.name, field: "행간", web: a.lineHeight, rn: b.lineHeight });
          const align = (v) => ({ start: "left", end: "right", "-webkit-left": "left", "-webkit-right": "right", "-webkit-center": "center" }[v] || v);
          /* 글자 상자에 남는 폭이 있고 flex 가 아닐 때만 정렬이 눈에 보인다(flex 안 글자는 내용만큼 줄어들어 text-align 이 힘을 못 쓴다 — 그 경우의 실제 위치는 글자 자리가 잡는다) */
          /* 글자가 상자 밖으로 잘려 말줄임이 되는가 — 웹에서 흘러나와 보이는 글자를 RN 이 잘라 버리면(또는 반대) 여기서 잡힌다. */
          if (a.textRect && b.textRect && a.textRect.clipped !== b.textRect.clipped) rowResult.rows.push({ theme, part: a.name, field: "글자 잘림", web: a.textRect.clipped ? "잘림" : "보임", rn: b.textRect.clipped ? "잘림" : "보임" });
          const roomy = a.textRect && b.textRect && !a.textRect.flexy && !b.textRect.flexy && (a.textRect.boxW - a.textRect.w > 1 || b.textRect.boxW - b.textRect.w > 1);
          if (roomy && align(a.textAlign) !== align(b.textAlign)) rowResult.rows.push({ theme, part: a.name, field: "text-align", web: a.textAlign, rn: b.textAlign });
          if (a.textRect && b.textRect) {
            for (const key of ["x", "y"]) if (!near(a.textRect[key], b.textRect[key])) rowResult.rows.push({ theme, part: a.name, field: "글자 " + key, web: a.textRect[key].toFixed(2), rn: b.textRect[key].toFixed(2) });
            /* 여러 줄 글의 폭은 재지 않는다 — RN(web)은 줄 끝 공백을 칸 안에 남겨(pre-wrap) 줄 폭에 공백 한 칸이 더해진다. 줄 수·높이로 갈음한다. */
            if (a.textRect.lines !== b.textRect.lines) rowResult.rows.push({ theme, part: a.name, field: "글자 줄 수", web: a.textRect.lines, rn: b.textRect.lines });
            for (const key of (a.textRect.lines === 1 && b.textRect.lines === 1 ? ["w", "h"] : ["h"])) if (Math.abs(a.textRect[key] - b.textRect[key]) > 1.0) rowResult.rows.push({ theme, part: a.name, field: "글자 " + key, web: a.textRect[key].toFixed(2), rn: b.textRect[key].toFixed(2) });
          } else if (!!a.textRect !== !!b.textRect) rowResult.rows.push({ theme, part: a.name, field: "글자 자리", web: a.textRect ? "있음" : "없음", rn: b.textRect ? "있음" : "없음" });
        } else if ((a.text === null) !== (b.text === null)) rowResult.rows.push({ theme, part: a.name, field: "글자", web: a.text, rn: b.text });
      }
    }
    rowResult.diffCount = rowResult.rows.length;
    rowResult.status = rowResult.rows.length === 0 ? "same" : "diff";
    row.classList.add(rowResult.status === "same" ? "same" : "differs");
    results.push(rowResult);
  }
  const out = document.createElement("script");
  out.type = "application/json"; out.id = "s1-results"; stats.actErrors = window.S1_ACT_ERRORS; out.textContent = JSON.stringify({ results, stats });
  document.body.appendChild(out);
  } catch (error) {
    const out = document.createElement("script");
    out.type = "application/json"; out.id = "s1-results"; out.textContent = JSON.stringify({ error: String(error && error.stack || error) });
    document.body.appendChild(out);
  }
  document.title = "S1-RN-DONE";
})();
`;

function findChrome() {
  for (const candidate of [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"].filter(Boolean)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function serve(root) {
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png" };
  const server = http.createServer((request, response) => {
    const file = path.join(root, decodeURIComponent(request.url.split("?")[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

function runChromeDump(chrome, url) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "s1-rn-compare-"));
  return new Promise((resolve, reject) => {
    const child = spawnChrome(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", `--user-data-dir=${profile}`, "--virtual-time-budget=200000", "--window-size=1600,2000", "--dump-dom", url], { stdio: ["ignore", "pipe", "ignore"] });
    let buffer = "";
    const timer = setTimeout(() => { killChromeTree(child); reject(new Error("크롬이 시간 안에 결과를 내지 못했습니다.")); }, Number(process.env.S1_COMPARE_TIMEOUT_MS ?? 180000));
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      if (buffer.includes("S1-RN-DONE") && buffer.includes("</html>")) {
        clearTimeout(timer);
        killChromeTree(child);
        try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* 무시 */ }
        const match = /<script type="application\/json" id="s1-results">([\s\S]*?)<\/script>/.exec(buffer);
        if (!match) { reject(new Error("측정 결과를 읽지 못했습니다.")); return; }
        const parsed = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
        if (parsed.error) { reject(new Error(`측정 스크립트 오류: ${parsed.error}`)); return; }
        resolve(parsed);
      }
    });
    child.on("error", reject);
  });
}

/** 쪽 전체 높이(px) — 열린 조합까지 다 그려진 뒤의 문서 높이를 크롬에서 읽는다. */
function pageHeight(url) {
  const chrome = findChrome();
  if (!chrome) return Promise.resolve(1500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "s1-rn-height-"));
  return new Promise((resolve) => {
    const child = spawnChrome(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", `--user-data-dir=${profile}`, "--virtual-time-budget=14000", "--window-size=2300,2000", "--dump-dom", url], { stdio: ["ignore", "pipe", "ignore"] });
    let buffer = "";
    let settled = false;
    const finish = (value) => { if (settled) return; settled = true; clearTimeout(timer); killChromeTree(child); try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* 무시 */ } resolve(value); };
    const timer = setTimeout(() => finish(1500), 60000);
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      if (!buffer.includes("</html>")) return;
      const match = /data-page-h="(\d+)"/.exec(buffer);
      finish(match ? Math.min(15000, Math.max(600, Number(match[1]))) : 1500);
    });
    child.on("error", () => finish(1500));
  });
}

/** 개요 화면(부품마다 대표 조합 + 열린 조합) — 여러 장으로 나눠 32종 전부를 찍는다. npm run shot 과 같은 도구(render-shot.js)로 찍는다(크롬 직접 호출은 종료가 안 된다). */
async function shoot(cases) {
  const { spawn } = await import("node:child_process");
  const runShot = (args) => new Promise((resolve) => { const child = spawn(process.execPath, args, { stdio: "ignore" }); child.on("exit", (code) => resolve({ status: code })); child.on("error", () => resolve({ status: 1 })); });
  const { server, port } = await serve(repositoryRoot);
  const shotsDir = path.join(outDir, "shots");
  fs.rmSync(shotsDir, { recursive: true, force: true });
  fs.mkdirSync(shotsDir, { recursive: true });
  try {
    for (const breakName of ["pc", "mobile"]) {
      const seen = new Set();
      let count = 0;
      for (const one of cases) {
        if (one.break !== breakName) continue;
        const key = one.id.split("/").slice(0, 2).join("/");
        if (!seen.has(key) || one.web.open) count += 1;
        seen.add(key);
      }
      const parts = Math.max(1, Math.ceil(count / 10));
      for (const theme of ["light", "dark"]) {
        for (let part = 0; part < parts; part += 1) {
          const url = `http://127.0.0.1:${port}/${path.relative(repositoryRoot, path.join(outDir, "compare.html"))}?overview=1&theme=${theme}&break=${breakName}&parts=${parts}&part=${part}`;
          const target = path.join(shotsDir, `overview-${breakName}-${theme}-${part + 1}of${parts}.png`);
          /* 카드가 화면 높이에서 잘리지 않게, 먼저 쪽 전체 높이를 재고 그 높이로 찍는다. */
          const height = await pageHeight(url);
          const run = await runShot([path.join(repositoryRoot, "scripts/render-shot.js"), url, target, `--window-size=2300,${height + 24}`, "--wait-ms=12000", "--quiet"]);
          console.log(run.status === 0 ? `   📸 ${path.relative(repositoryRoot, target)}` : `   ⚠️ 스크린샷 실패 — ${breakName}/${theme}/${part + 1}`);
        }
      }
    }
  } finally { server.close(); }
}

/* ── 5. 실행 ─────────────────────────────────────────────────────────── */

async function main() {
  if (!fs.existsSync(path.join(rnRoot, "gallery", "cases.js"))) {
    console.error("❌ platform/react-native 가 없습니다. 먼저 `npm run ui:build` 를 실행하세요.");
    return 2;
  }
  const { CASES } = await import(pathToFileURL(path.join(rnRoot, "gallery", "cases.js")).href);
  const cases = (only ? CASES.filter((one) => only.includes(one.id.split("/")[0])) : CASES).filter((one) => !one.skipCompare);
  console.log(`🔎 RN ↔ 웹 렌더 대조 — 조합 ${cases.length}개 (PC·Mobile × Light·Dark)`);

  await bundle(cases);
  fs.writeFileSync(path.join(outDir, "compare.html"), pageHtml(cases, null));

  let results = null;
  let totalDiffs = 0;
  let measuredStats = null;
  if (!flag("no-measure")) {
    const chrome = findChrome();
    if (!chrome) { console.error("❌ 크롬을 찾지 못했습니다. CHROME_PATH 를 지정하세요."); return 2; }
    /* 측정용 사본: 같은 페이지 + 측정 스크립트 */
    const measurePage = pageHtml(cases, null).replace('<script type="module">', '<script>window.S1_MEASURING = true;</script><script type="module">').replace("</body>", `<script>${MEASURE_SCRIPT}</script></body>`);
    fs.writeFileSync(path.join(outDir, ".measure.html"), measurePage);
    const { server, port } = await serve(repositoryRoot);
    try {
      const url = `http://127.0.0.1:${port}/${path.relative(repositoryRoot, path.join(outDir, ".measure.html"))}`;
      const measured = await runChromeDump(chrome, url);
      results = measured.results;
      measuredStats = measured.stats;
    } finally {
      server.close();
      fs.rmSync(path.join(outDir, ".measure.html"), { force: true });
    }
    fs.writeFileSync(path.join(outDir, "measure.json"), `${JSON.stringify(cases.map((one, index) => ({ id: one.id, ...results[index] })), null, 1)}\n`);
    fs.writeFileSync(path.join(outDir, "compare.html"), pageHtml(cases, results));
    const same = results.filter((one) => one.status === "same").length;
    const compared = results.reduce((sum, one) => sum + one.compared, 0);
    const diffs = results.reduce((sum, one) => sum + one.rows.length, 0);
    totalDiffs = diffs + (measuredStats.actErrors?.length ?? 0);
    for (const message of measuredStats.actErrors ?? []) console.log(`   ⚠️ ${message}`);
    console.log(`   요소 ${compared}개 대조 · 일치 조합 ${same}/${results.length} · 차이 ${diffs}건`);
    console.log(`   새 측정: 글자 자리·행간·정렬 ${measuredStats.texts}곳 · 아이콘 래스터 ${measuredStats.icons}개 (건너뜀 ${measuredStats.skipped}) · 네 변 테두리·네 모서리·그림자 전 요소`);
    const byComponent = new Map();
    cases.forEach((one, index) => {
      const key = one.id.split("/")[0];
      const entry = byComponent.get(key) ?? { cases: 0, same: 0, diffs: 0 };
      entry.cases += 1; entry.same += results[index].status === "same" ? 1 : 0; entry.diffs += results[index].rows.length;
      byComponent.set(key, entry);
    });
    for (const [key, entry] of byComponent) console.log(`   · ${key.padEnd(20)} 조합 ${String(entry.cases).padStart(3)} · 일치 ${String(entry.same).padStart(3)} · 차이 ${entry.diffs}`);
  }
  if (flag("shots")) await shoot(cases);
  console.log(`📄 ${path.relative(repositoryRoot, path.join(outDir, "compare.html"))}`);
  if (totalDiffs > 0) { console.error(`❌ 차이 ${totalDiffs}건 — 종료코드 1`); return 1; }
  return 0;
}

main().then((code) => process.exit(code)).catch((error) => { console.error(`❌ ${error.stack ?? error.message}`); process.exit(2); });
