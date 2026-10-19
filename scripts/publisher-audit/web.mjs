#!/usr/bin/env node
/**
 * publisher-audit/web.mjs — "퍼블리셔 눈" 검수기 (HTML · CSS · JS 묶음)
 * --------------------------------------------------------------------------
 * 질문 하나에 답한다: **퍼블리셔가 우리 웹 묶음(zip)을 받아 README 대로만 쓰면, 실제로 되나? 쓰기 쉬운가?**
 *
 * 하는 일(전부 실제로 실행한다 — 못 돌린 검사는 notChecked 로 남기고 통과로 치지 않는다):
 *   1. zip 을 임시 폴더에 풀고 로컬 http 로 띄운다(file:// 은 마스크 아이콘·ES 모듈이 막힌다).
 *   2. examples/ 의 예시마다 README 시작하기 단계만 따른 빈 페이지를 만든다
 *      (tokens.css + s1-ui.css 를 head 에, s1-ui.auto.js 의 autoInit() 한 번).
 *      *.mobile.html · *-mobile.html 은 375 폭, 나머지는 PC 1280 폭.
 *   3. 페이지마다: 콘솔 오류·예외·404 / 부품 크기 0 / 아이콘이 실제로 그려졌나(켜고 끈 화면 비교) /
 *      가로 넘침 / 실제 렌더 서체 / 접근 가능한 이름 / 글자 대비 / Tab 순서·초점 표시 /
 *      manifest 가 약속한 동작을 진짜 마우스·키로 눌러 보기 / 다크 모드 / 스크린샷.
 *   4. 묶음 단위: 예시가 모든 variant·size 를 보이나, README 단계가 맞나, 동봉 lint 가 도나·잡아내나,
 *      나중에 넣은 마크업·한 개만 초기화하는 길이 있나, 다크 모드 안내, 속성 이름 일관성.
 *   5. reports/publisher-audit/web/result.json (+ shots/*.png)
 *
 * 실행:  npm run audit:publisher:web            (전체)
 *        npm run audit:publisher:web -- --selftest (심어 둔 고장 페이지로 탐지기가 실제로 울리는지 증명)
 *        옵션 --zip <경로>  기본 assets/downloads/s1-ui-html-css-js.zip
 * 종료: 0 정상 실행(발견 사항이 있어도 0 — 이 도구는 감사 보고용) · 1 자가시험 실패/실행 오류 · 2 크롬 없음
 *
 * 크롬은 자기 프로세스 그룹에서 띄우고 끝날 때(정상·오류·Ctrl+C 모두) 그룹째 정리한다.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

if (typeof WebSocket === "undefined") {
  /* Node 20 은 내장 WebSocket 이 실험 플래그 뒤에 있다 — 플래그를 켜고 자기 자신을 다시 부른다. */
  const rerun = spawnSync(process.execPath, ["--experimental-websocket", "--no-warnings", fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: "inherit" });
  process.exit(rerun.status ?? 1);
}

const { findChrome, launchChrome, openPage, sleep } = await import("./cdp.mjs");
const { installHelper } = await import("./page-helpers.mjs");
const { PROBES, STATIC_COMPONENTS, makeContext, NotFound } = await import("./probes.mjs");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = path.join(ROOT, "reports/publisher-audit/web");
const SHOTS_DIR = path.join(OUT_DIR, "shots");
const args = process.argv.slice(2);
const SELFTEST = args.includes("--selftest");
const argValue = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
const ZIP = path.resolve(argValue("--zip") || path.join(ROOT, "assets/downloads/s1-ui-html-css-js.zip"));
const REF_ZIP = path.join(ROOT, "assets/downloads/s1-ui-dev-package.zip");
const PC = { width: 1280, height: 900, mobile: false };
const MOBILE = { width: 375, height: 812, mobile: true };
const MAX_ICONS_PER_PAGE = 40;

/* ── 정리(누수 방지) ─────────────────────────────────────────── */
const cleanups = [];
let cleaned = false;
function cleanupAll() {
  if (cleaned) return;
  cleaned = true;
  for (const fn of cleanups.reverse()) { try { fn(); } catch { /* 계속 */ } }
}
process.on("exit", cleanupAll);
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => { cleanupAll(); process.exit(130); });
process.on("uncaughtException", (error) => { console.error(`[publisher-audit] 실행 오류: ${error.stack || error}`); cleanupAll(); process.exit(1); });

const log = (...parts) => console.log("[publisher-audit]", ...parts);
const js = (value) => JSON.stringify(value);

/* ── 준비: 압축 풀기 · http 서버 ─────────────────────────────── */
function unzip(zipPath, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const result = spawnSync("unzip", ["-q", "-o", zipPath, "-d", dest], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`압축 해제 실패(${zipPath}): ${result.stderr || result.error}`);
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff" };

function serve(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      const urlPath = decodeURIComponent(new URL(request.url, "http://x").pathname);
      const filePath = path.join(rootDir, urlPath);
      if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        response.writeHead(404, { "content-type": "text/plain" });
        response.end("not found");
        return;
      }
      response.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream", "cache-control": "no-store" });
      fs.createReadStream(filePath).pipe(response);
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

/** README 시작하기 3·4단계만 따른 페이지. 모듈 스크립트라야 import 가 된다(README 는 이 점을 말하지 않는다 — 별도 검사). */
function readmePage(markup, { title = "publisher audit", script } = {}) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="s1-ui/assets/css/tokens.css">
<link rel="stylesheet" href="s1-ui/s1-ui.css">
</head>
<body>
${markup}
${script ?? `<script type="module">
import { autoInit } from "./s1-ui/s1-ui.auto.js";
autoInit();
window.__s1ready = true;
</script>`}
</body>
</html>
`;
}

async function waitFor(page, expression, timeoutMs = 5000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try { if (await page.eval(expression)) return true; } catch { /* 아직 */ }
    await sleep(100);
  }
  return false;
}

async function capture(page, clip) {
  const { data } = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 1 } });
  return data;
}

async function fullShot(page, file) {
  const metrics = await page.send("Page.getLayoutMetrics");
  const size = metrics.cssContentSize || metrics.contentSize;
  const width = Math.ceil(Math.max(size.width, metrics.cssLayoutViewport ? metrics.cssLayoutViewport.clientWidth : 0));
  const height = Math.min(4000, Math.ceil(size.height));
  const data = await capture(page, { x: 0, y: 0, width, height });
  fs.writeFileSync(file, Buffer.from(data, "base64"));
}

/* ── 페이지 단위 검사 ─────────────────────────────────────────── */
const INTERACTIVE_ROLES = new Set(["button", "link", "checkbox", "radio", "switch", "tab", "option", "menuitem", "menuitemcheckbox", "menuitemradio", "textbox", "searchbox", "combobox", "listbox", "slider", "spinbutton", "treeitem", "dialog", "alertdialog"]);

async function accessibleNames(page) {
  await page.send("Accessibility.enable");
  const { nodes } = await page.send("Accessibility.getFullAXTree");
  const missing = [];
  let checked = 0;
  for (const node of nodes) {
    if (node.ignored) continue;
    const role = node.role && node.role.value;
    if (!INTERACTIVE_ROLES.has(role)) continue;
    checked += 1;
    const name = ((node.name && node.name.value) || "").trim();
    if (name || !node.backendDOMNodeId) continue;
    try {
      const { object } = await page.send("DOM.resolveNode", { backendNodeId: node.backendDOMNodeId });
      const { result } = await page.send("Runtime.callFunctionOn", { objectId: object.objectId, functionDeclaration: "function(){return [window.__A.sel(this), window.__A.vis(this), this.hasAttribute('data-audit-skip')]}", returnByValue: true });
      const [sel, visible, skip] = result.value;
      if (visible && !skip) missing.push({ role, sel });
    } catch { /* 노드가 사라짐 */ }
  }
  return { checked, missing };
}

async function iconPaint(page) {
  const icons = await page.call(() => window.__A.icons());
  await page.eval(`(()=>{const s=document.createElement("style"); s.id="__audit_nt"; s.textContent="*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}"; document.head.append(s); document.activeElement&&document.activeElement.blur(); return true;})()`);
  await sleep(100);
  const results = [];
  for (const icon of icons.slice(0, MAX_ICONS_PER_PAGE)) {
    if (icon.w === 0 || icon.h === 0) { results.push({ ...icon, painted: false, reason: "크기 0" }); continue; }
    const pad = 4;
    const clip = { x: Math.max(0, icon.box.x - pad), y: Math.max(0, icon.box.y - pad), width: Math.max(icon.box.w, icon.w) + pad * 2, height: Math.max(icon.box.h, icon.h) + pad * 2 };
    const pseudoName = icon.pseudo ? icon.pseudo.slice(2) : "self";
    const before = await capture(page, clip);
    await page.eval(`(()=>{const s=document.createElement("style"); s.id="__audit_off"; s.textContent=${js(`[data-audit-icon-${pseudoName}="${icon.key}"]${icon.pseudo || ""}{opacity:0!important}`)}; document.head.append(s); return true;})()`);
    const after = await capture(page, clip);
    await page.eval(`document.getElementById("__audit_off").remove(), true`);
    results.push({ ...icon, painted: before !== after });
  }
  await page.eval(`document.getElementById("__audit_nt").remove(), true`);
  return { total: icons.length, results, truncated: icons.length > MAX_ICONS_PER_PAGE };
}

async function renderedFont(page) {
  const probe = await page.call(() => window.__A.fontProbe());
  if (!probe.sel) return { ...probe, platform: null };
  const { root } = await page.send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await page.send("DOM.querySelector", { nodeId: root.nodeId, selector: "[data-audit-font]" });
  const { fonts } = await page.send("CSS.getPlatformFontsForNode", { nodeId });
  return { ...probe, platform: fonts.map((font) => `${font.familyName}${font.isCustomFont ? "(웹폰트)" : "(이 컴퓨터에 설치된 글꼴)"}`) };
}

async function keyboardWalk(page) {
  await page.eval("document.activeElement && document.activeElement.blur(), window.scrollTo(0,0), true");
  const expected = await page.call(() => window.__A.focusables());
  const reached = [];
  const limit = Math.min(160, Math.max(expected.length * 3, expected.length + 30));
  for (let i = 0; i < limit; i += 1) {
    await page.key("Tab");
    const info = await page.call(() => window.__A.focusInfo());
    if (!info || reached.some((r) => r.sel === info.sel)) break;
    reached.push(info);
  }
  await page.eval("document.activeElement && document.activeElement.blur(), true");
  await sleep(60);
  const noRing = [];
  for (const info of reached) {
    const unfocused = await page.eval(`(()=>{const e=document.querySelector(${js(info.sel)}); return e ? window.__A.styleSnap(e) : null;})()`);
    if (unfocused !== null && unfocused === info.snap) noRing.push(info.sel);
  }
  const reachedSet = new Set(reached.map((r) => r.sel));
  return { expected: expected.length, reached: reached.length, unreachable: expected.filter((sel) => !reachedSet.has(sel)), noRing };
}

async function darkPass(page, shotFile) {
  /* 부품 루트마다 자신+자손(+::before/::after)의 색을 모두 묶는다 — 루트만 보면 투명한 감싸개(checkbox 등)를 '안 바뀜'으로 오판한다 */
  const snap = () => page.eval(`[...document.querySelectorAll('[data-s1-component]')].filter(e=>window.__A.vis(e)).slice(0,30).map(root=>[root,...root.querySelectorAll('*')].slice(0,200).map(e=>[null,'::before','::after'].map(p=>{const c=getComputedStyle(e,p); return c.backgroundColor+'|'+c.color+'|'+c.borderTopColor+'|'+c.outlineColor+'|'+c.fill;}).join(';')).join(','))`);
  const light = await snap();
  const lightBody = await page.eval("getComputedStyle(document.body).backgroundColor");
  await page.eval(`document.documentElement.setAttribute("data-theme","dark"), true`);
  await sleep(150);
  const dark = await snap();
  const autoBody = await page.eval("getComputedStyle(document.body).backgroundColor");
  /* README 가 안내하는 선택 파일(s1-ui.base.css)을 붙이면 바탕이 따라오는가 — 안내를 따른 퍼블리셔의 화면을 본다 */
  await page.eval(`(()=>{const l=document.createElement("link"); l.rel="stylesheet"; l.id="__audit_base"; l.href="s1-ui/s1-ui.base.css"; document.head.appendChild(l); return true;})()`);
  await sleep(250);
  const baseBody = await page.eval("getComputedStyle(document.body).backgroundColor");
  await page.eval(`(()=>{document.getElementById("__audit_base")?.remove(); return true;})()`);
  await sleep(100);
  await page.eval(`document.body.style.background="var(--color-bg-level-0)"; document.body.style.color="var(--color-text-body-primary)"; true`);
  await sleep(100);
  await fullShot(page, shotFile);
  const contrast = await page.call(() => window.__A.contrast());
  await page.eval(`document.documentElement.removeAttribute("data-theme"); document.body.style.background=""; document.body.style.color=""; true`);
  await sleep(100);
  const changed = light.filter((value, i) => value !== dark[i]).length;
  return { components: light.length, changed, pageBackgroundFollows: lightBody !== autoBody, pageBackgroundFollowsWithBase: lightBody !== baseBody, contrast };
}

function exampleLabel(file) { return file.replace(/\.html$/, ""); }

/**
 * 예시 한 장 검사. findings 는 이 예시에서만 생긴 것, facts 는 묶음 단위로 모을 재료.
 */
async function auditExample(cdp, origin, siteDir, spec) {
  const { file, component, viewport, markup } = spec;
  const label = exampleLabel(file);
  const findings = [];
  const notChecked = [];
  const checks = {};
  const add = (area, severity, what, evidence, suggestedFix) => findings.push({ id: `${label}:${area}:${findings.length + 1}`, example: file, area, severity, what, evidence, suggestedFix });
  const skip = (check, reason) => { checks[check] = "notChecked"; notChecked.push({ example: file, check, reason }); };

  const pageName = `__audit_${label}.html`;
  fs.writeFileSync(path.join(siteDir, pageName), readmePage(markup, { title: label }));
  const page = await openPage(cdp, `${origin}/${pageName}`, viewport);
  const facts = { example: file, component, viewport: viewport.mobile ? "mobile(375)" : "pc(1280)", screenshot: null, darkScreenshot: null, interactions: [] };
  try {
    const ready = await waitFor(page, "window.__s1ready === true", 6000);
    checks.autoInit = ready ? "pass" : "fail";
    if (!ready) add("runtime", "broken", "README 대로 autoInit() 을 불렀는데 실행되지 않았습니다 — 동작이 하나도 붙지 않습니다.", `window.__s1ready 미설정. 예외: ${page.exceptions.map((e) => e.text).join(" / ") || "없음"}`, "s1-ui.auto.js import 경로·export 확인");
    await page.call(installHelper);
    await page.eval("document.fonts.ready.then(()=>true)");
    await sleep(400);
    const loadErrors = page.consoleErrors.length + page.exceptions.length;

    /* 크기 0 */
    const sizes = await page.call(() => window.__A.componentSizes());
    checks.componentSize = sizes.zero.length ? "fail" : "pass";
    for (const zero of sizes.zero) add("layout", "broken", `${zero.component} 부품이 화면에 크기 0 으로 그려집니다(안 보임).`, `${zero.sel} → ${zero.w}×${zero.h}, display=${zero.display}`, `components/${zero.component}.css 의 루트 display·크기 확인`);
    facts.componentCount = sizes.checked;

    /* 가로 넘침 */
    const overflow = await page.call(() => window.__A.overflow());
    checks.overflow = overflow.scrollWidth > overflow.clientWidth + 1 ? "fail" : "pass";
    if (checks.overflow === "fail") add("layout", viewport.mobile ? "friction" : "note", `화면 폭(${overflow.clientWidth}px)보다 넓어 가로 스크롤이 생깁니다.`, `문서 폭 ${overflow.scrollWidth}px · 넘친 요소: ${overflow.offenders.map((o) => `${o.sel}(→${o.right}px)`).join(", ")}`, "max-width:100% 또는 예시 폭 조정");

    /* 서체 */
    try {
      facts.font = await renderedFont(page);
      if (!facts.font.platform && !facts.font.undeclared.length) skip("font", "보이는 부품 글자가 없음");
      else checks.font = facts.font.undeclared.length ? "fail" : "pass";
    } catch (error) { skip("font", error.message); }

    /* 대비(밝은 화면) */
    const contrast = await page.call(() => window.__A.contrast());
    checks.contrast = contrast.failing.length ? "fail" : "pass";
    facts.contrast = { checked: contrast.checked, failing: contrast.failing.length, unknown: contrast.unknown, skippedDisabled: contrast.skippedDisabled };
    if (contrast.failing.length) {
      add("a11y-contrast", "note", `글자와 바탕의 명암 대비가 기준(일반 글자 4.5:1)보다 낮은 곳이 ${contrast.failing.length}곳 있습니다. 디자인 의도일 수 있어 판정하지 않고 알려만 드립니다.`,
        contrast.failing.slice(0, 5).map((f) => `"${f.text}" ${f.ratio}:1 (글자 ${f.fg} / 바탕 ${f.bg}, ${f.size}px) @ ${f.sel}`).join(" | "), "해당 Semantic 토큰 조합 재검토");
    }

    /* 접근 가능한 이름 */
    try {
      const names = await accessibleNames(page);
      checks.accessibleName = names.missing.length ? "fail" : "pass";
      facts.accessibleNames = { checked: names.checked, missing: names.missing.length };
      for (const miss of names.missing) add("a11y-name", "broken", `화면읽기 프로그램이 읽을 이름이 없는 ${miss.role} 이 있습니다 — 시각장애 사용자는 무엇인지 알 수 없습니다.`, miss.sel, "aria-label 또는 연결된 label 추가(예시 마크업)");
    } catch (error) { skip("accessibleName", error.message); }

    /* 아이콘 실제로 그려졌나 */
    try {
      const icons = await iconPaint(page);
      const blank = icons.results.filter((icon) => !icon.painted);
      checks.icons = icons.total === 0 ? "notApplicable" : (blank.length ? "fail" : "pass");
      facts.icons = { total: icons.total, checked: icons.results.length, blank: blank.length };
      if (icons.truncated) notChecked.push({ example: file, check: "icons", reason: `아이콘 ${icons.total}개 중 앞 ${MAX_ICONS_PER_PAGE}개만 검사` });
      for (const icon of blank) {
        const fileName = icon.url.split("/").pop();
        const failed = page.failedRequests.find((request) => request.url.endsWith(fileName));
        add("icon", "broken", `아이콘이 화면에 그려지지 않습니다(빈 칸).`, `${icon.sel}${icon.pseudo || ""} · ${icon.kind} ${icon.url}${failed ? ` · 요청 실패 ${failed.status || failed.error}` : ""}${icon.reason ? ` · ${icon.reason}` : ""}`, failed ? "아이콘 경로/파일 확인" : "마스크 색(background-color)·크기 확인");
      }
    } catch (error) { skip("icons", error.message); }

    /* 스크린샷(밝은 화면) */
    const shot = path.join(SHOTS_DIR, `${label}.png`);
    try { await fullShot(page, shot); facts.screenshot = path.relative(ROOT, shot); } catch (error) { skip("screenshot", error.message); }

    /* 다크 모드 */
    try {
      const darkShot = path.join(SHOTS_DIR, `${label}.dark.png`);
      const dark = await darkPass(page, darkShot);
      facts.darkScreenshot = path.relative(ROOT, darkShot);
      facts.dark = { components: dark.components, changed: dark.changed, pageBackgroundFollows: dark.pageBackgroundFollows, pageBackgroundFollowsWithBase: dark.pageBackgroundFollowsWithBase, contrastFailing: dark.contrast.failing.length, worst: dark.contrast.failing.slice(0, 3) };
      checks.dark = dark.components === 0 ? "notApplicable" : (dark.changed > 0 ? "pass" : "fail");
      if (dark.components > 0 && dark.changed === 0) add("dark", "friction", "html 에 data-theme=\"dark\" 를 줘도 이 부품 색이 하나도 바뀌지 않습니다.", `보이는 부품 ${dark.components}개 중 색 변화 0`, "컴포넌트 CSS 가 Semantic 토큰을 쓰는지 확인");
    } catch (error) { skip("dark", error.message); }

    /* 키보드 Tab · 초점 표시 */
    try {
      const walk = await keyboardWalk(page);
      facts.keyboard = { expected: walk.expected, reached: walk.reached, unreachable: walk.unreachable.length, noRing: walk.noRing.length };
      checks.keyboard = walk.unreachable.length || walk.noRing.length ? "fail" : "pass";
      if (walk.unreachable.length) add("keyboard", "friction", `키보드 Tab 만으로는 닿지 않는 조작 요소가 ${walk.unreachable.length}개 있습니다.`, walk.unreachable.slice(0, 6).join(" | "), "tabindex·초점 가둠 범위 확인");
      if (walk.noRing.length) add("keyboard", "friction", `Tab 으로 초점이 가도 겉모습이 전혀 안 바뀌는 요소가 ${walk.noRing.length}개 있습니다 — 키보드 사용자는 지금 어디 있는지 모릅니다.`, walk.noRing.slice(0, 6).join(" | "), ":focus-visible 스타일 추가");
    } catch (error) { skip("keyboard", error.message); }

    /* 동작 시나리오 */
    const probe = PROBES[component];
    if (!probe) {
      if (STATIC_COMPONENTS.has(component)) checks.interaction = "notApplicable";
      else skip("interaction", `${component} 시나리오 없음`);
    } else {
      const multi = ["date-picker", "time-picker"].includes(component);
      const includeHidden = ["modal", "modal-content", "bottom-sheet"].includes(component);
      const roots = await page.eval(`(()=>{const list=[...document.querySelectorAll('[data-s1-component=${js(component)}]')].filter(e=>${includeHidden} || window.__A.vis(e)); return list.slice(0, ${multi ? 3 : 1}).map((e,i)=>{e.setAttribute("data-audit-root","r"+i); return '[data-audit-root="r'+i+'"]';});})()`);
      if (!roots.length) skip("interaction", "보이는 루트 없음");
      let anyFail = false;
      for (const [index, rootSelector] of roots.entries()) {
        const tag = roots.length > 1 ? `#${index + 1} ` : "";
        const record = (name, ok, evidence, options = {}) => {
          facts.interactions.push({ root: index + 1, name, status: ok ? "pass" : "fail", evidence });
          if (!ok) {
            anyFail = true;
            add("interaction", options.severity || "broken", `${component} ${tag}— "${name}" 가 되지 않습니다.`, evidence, `components/${component}.js (manifest 의 states·a11y.keyboard 계약 기준)`);
          }
        };
        try {
          await probe(makeContext(page, rootSelector, record));
        } catch (error) {
          facts.interactions.push({ root: index + 1, name: "(시나리오 진행)", status: "notChecked", evidence: error.message });
          notChecked.push({ example: file, check: `interaction${tag ? ` ${tag.trim()}` : ""}`, reason: error instanceof NotFound ? error.message : `실행 오류: ${error.message}` });
        }
        await page.eval("document.activeElement && document.activeElement.blur(), true").catch(() => {});
        await page.key("Escape").catch(() => {});
      }
      checks.interaction = anyFail ? "fail" : (facts.interactions.some((i) => i.status === "pass") ? "pass" : "notChecked");
    }
    await sleep(200);

    /* 콘솔·예외·네트워크 — 처음부터 끝까지 모은 것 */
    const errors = [...page.exceptions.map((e) => ({ ...e, kind: "예외" })), ...page.consoleErrors.map((e) => ({ ...e, kind: "콘솔 오류" }))];
    const seen = new Set();
    errors.forEach((error, index) => {
      const key = error.text.slice(0, 200);
      if (seen.has(key)) return;
      seen.add(key);
      const when = index < loadErrors ? "페이지를 열자마자" : "눌러 보는 중에";
      add("console", "broken", `${when} 브라우저 ${error.kind}가 납니다.`, error.text.slice(0, 300), "오류 메시지의 스크립트 위치 수정");
    });
    checks.console = errors.length ? "fail" : "pass";
    const failed = page.failedRequests.filter((request) => !/favicon\.ico$/.test(request.url));
    for (const request of failed) {
      const kind = /\.css(\?|$)/.test(request.url) ? "CSS" : /\/icons\//.test(request.url) ? "아이콘" : /\.(woff2?|ttf|otf)(\?|$)/.test(request.url) ? "글꼴" : "파일";
      add("network", "broken", `${kind} 파일을 불러오지 못했습니다.`, `${request.status || request.error} ${request.url.replace(origin, "")}`, "묶음에 파일 포함 또는 경로 수정");
    }
    checks.network = failed.length ? "fail" : "pass";
    facts.consoleWarnings = page.consoleWarnings.length;
  } finally {
    await page.close();
  }
  return { ...facts, checks, findings, notChecked };
}

/* ── 묶음 단위 검사 ─────────────────────────────────────────── */
function parseRoots(html) {
  const roots = [];
  const pattern = /<([a-z][a-z0-9-]*)\b([^>]*\bdata-s1-component="([^"]+)"[^>]*)>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const attrs = {};
    const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g;
    let a;
    while ((a = attrPattern.exec(match[2])) !== null) attrs[a[1]] = a[2] ?? "";
    roots.push({ tag: match[1], component: match[3], attrs });
  }
  return roots;
}

function parseLint(output) {
  const lines = output.split("\n");
  const items = [];
  for (const line of lines) {
    const m = /^(✖|⚠)\s+(.+?):(\d+)\s+(.*?)\s+\[([^\]]+)\]\s*$/.exec(line.trim());
    if (m) items.push({ level: m[1] === "✖" ? "error" : "warning", file: path.basename(m[2]), line: Number(m[3]), message: m[4], rule: m[5] });
  }
  return items;
}

function runLint(lintPath, target) {
  const result = spawnSync(process.execPath, [lintPath, target], { encoding: "utf8", timeout: 60000, cwd: path.dirname(target) });
  return { code: result.status, output: `${result.stdout || ""}${result.stderr || ""}`.trim() };
}

const BROKEN_EXAMPLE = `<!-- 일부러 틀린 예시: 없는 variant 와 이름 없는 스위치 -->
<button type="button" data-s1-component="button" data-variant="nope" data-size="md"><span data-s1-part="label">확인</span></button>
<button type="button" data-s1-component="toggle" role="switch" aria-checked="false"><span data-s1-part="knob" aria-hidden="true"></span></button>
`;

/**
 * 동봉 lint 판정. label 은 보고용 이름. 반환: { ran, examples:{file→errors}, broken:{variant, ariaLabel, messages}, findings }
 */
function analyzeLint(lintPath, examplesDir, brokenDir, label, { packaged }) {
  const findings = [];
  const add = (area, severity, what, evidence, suggestedFix) => findings.push({ id: `package:lint:${label}:${findings.length + 1}`, area, severity, what, evidence, suggestedFix });
  const out = { label, lintPath, ran: false };
  const version = runLint(lintPath, "--version");
  const onExamples = runLint(lintPath, examplesDir);
  if (onExamples.code === 2 || /실행하지 못했습니다/.test(onExamples.output)) {
    out.startError = onExamples.output.slice(0, 300);
    if (packaged) add("lint", "broken", "묶음에 들어 있는 검사 도구(s1-ui-lint)가 아예 실행되지 않습니다. README 가 알려 준 '최신인지 확인(--version)'도 실패합니다.", `${onExamples.output.split("\n")[0].slice(0, 260)} · --version: ${version.output.split("\n")[0].slice(0, 120)}`, "html-css-js 묶음 include 에 platform/manifest.json·contract.json·tokens.json 추가 (build-ui-package-zip.js)");
    return { ...out, findings };
  }
  out.ran = true;
  out.version = version.output.split("\n")[0];
  const items = parseLint(onExamples.output);
  out.examples = { exitCode: onExamples.code, errors: items.filter((i) => i.level === "error"), warnings: items.filter((i) => i.level === "warning").length, summary: onExamples.output.split("\n").filter((l) => /검사/.test(l)).pop() };
  if (out.examples.errors.length) add("lint", "broken", `우리 예시를 그대로 복사해도 검사 도구가 오류를 냅니다(${out.examples.errors.length}건).`, out.examples.errors.slice(0, 5).map((e) => `${e.file}:${e.line} ${e.message}`).join(" | "), "예시 또는 lint 규칙 정합");
  const onBroken = runLint(lintPath, brokenDir);
  const brokenItems = parseLint(onBroken.output);
  const variant = brokenItems.find((i) => i.level === "error" && /nope|variant/i.test(i.message));
  const aria = brokenItems.find((i) => /aria-label|이름|label/i.test(i.message) && !/variant/i.test(i.message));
  out.broken = { exitCode: onBroken.code, items: brokenItems, variantCaught: !!variant, ariaLabelCaught: !!aria };
  if (!variant) add("lint", "broken", "일부러 틀린 variant(data-variant=\"nope\")를 넣어도 검사 도구가 잡아내지 못합니다.", onBroken.output.slice(0, 300), "S1-VARIANT 규칙 확인");
  else {
    const understandable = /쓸 수 있는 값/.test(variant.message) && /[가-힣]/.test(variant.message);
    out.broken.variantMessage = variant.message;
    if (!understandable) add("lint", "friction", "틀린 variant 는 잡지만 무엇으로 고쳐야 하는지 알려주지 않습니다.", variant.message, "허용값 목록을 메시지에 포함");
  }
  if (!aria) add("lint", "friction", "이름(aria-label) 없는 스위치를 넣어도 검사 도구가 아무 말을 안 합니다 — 접근성 필수 속성은 검사하지 않습니다.", `검사 결과: ${onBroken.output.split("\n").filter(Boolean).slice(-3).join(" / ").slice(0, 240)}`, "contract.requiredAttributes(toggle: aria-checked 등) + a11y.accessibleName 을 lint 규칙에 추가");
  return { ...out, findings };
}

async function pageProbe(cdp, origin, siteDir, name, html, viewport = PC) {
  fs.writeFileSync(path.join(siteDir, name), html);
  const page = await openPage(cdp, `${origin}/${name}`, viewport);
  await sleep(300);
  await page.call(installHelper);
  return page;
}

const TOGGLE = `<button type="button" data-s1-component="toggle" role="switch" aria-checked="false" aria-label="알림 받기"><span data-s1-part="knob" aria-hidden="true"></span></button>`;

async function dynamicAndSingleInit(cdp, origin, siteDir, selectMarkup) {
  const result = {};
  /* ① autoInit 뒤에 마크업을 넣으면? */
  let page = await pageProbe(cdp, origin, siteDir, "__audit_dynamic.html", readmePage(""));
  try {
    await waitFor(page, "window.__s1ready === true");
    await page.eval(`(()=>{const d=document.createElement("div"); d.id="late"; d.innerHTML=${js(TOGGLE + selectMarkup)}; document.body.append(d); return true;})()`);
    const flip = async () => {
      const r = await page.eval(`window.__A.rect('#late [data-s1-component="toggle"]')`);
      const before = await page.eval(`document.querySelector('#late [data-s1-component="toggle"]').getAttribute("aria-checked")`);
      await page.mouseClickAt(r.x, r.y);
      return before !== await page.eval(`document.querySelector('#late [data-s1-component="toggle"]').getAttribute("aria-checked")`);
    };
    result.lateWithoutInit = await flip();
    await page.eval(`(async()=>{const m=await import("./s1-ui/s1-ui.auto.js"); m.autoInit(document.getElementById("late")); return true;})()`);
    result.lateAfterScopedAutoInit = await flip();
    const trigger = await page.eval(`window.__A.rect('#late [data-s1-component="select"] [data-s1-part="trigger"]')`);
    await page.mouseClickAt(trigger.x, trigger.y);
    result.lateSelectOpens = await page.eval(`document.querySelector('#late [data-s1-component="select"] [data-s1-part="trigger"]').getAttribute("aria-expanded") === "true"`);
    await page.key("Escape");
    await page.eval(`(async()=>{const m=await import("./s1-ui/s1-ui.auto.js"); m.autoInit(); window.__changes=0; document.addEventListener("s1:toggle:change",()=>{window.__changes++}); return true;})()`);
    const r = await page.eval(`window.__A.rect('#late [data-s1-component="toggle"]')`);
    await page.mouseClickAt(r.x, r.y);
    result.doubleInitChangeEvents = await page.eval("window.__changes");
    result.errors = [...page.exceptions, ...page.consoleErrors].map((e) => e.text.slice(0, 160));
  } finally { await page.close(); }

  /* ② autoInit 없이 하나만 */
  const single = async (name, script) => {
    const p = await pageProbe(cdp, origin, siteDir, name, readmePage(TOGGLE, { script }));
    try {
      const ready = await waitFor(p, "window.__s1ready === true", 4000);
      const r = await p.eval(`window.__A.rect('[data-s1-component="toggle"]')`);
      const before = await p.eval(`document.querySelector('[data-s1-component="toggle"]').getAttribute("aria-checked")`);
      await p.mouseClickAt(r.x, r.y);
      const after = await p.eval(`document.querySelector('[data-s1-component="toggle"]').getAttribute("aria-checked")`);
      return { ready, works: ready && before !== after, errors: [...p.exceptions, ...p.consoleErrors].map((e) => e.text.slice(0, 160)) };
    } finally { await p.close(); }
  };
  result.singleViaBundle = await single("__audit_single_bundle.html", `<script type="module">
import { toggle } from "./s1-ui/s1-ui.js";
toggle.init(document.querySelector('[data-s1-component="toggle"]'));
window.__s1ready = true;
</script>`);
  result.singleViaComponentFile = await single("__audit_single_file.html", `<script type="module">
import { init } from "./s1-ui/components/toggle.js";
init(document.querySelector('[data-s1-component="toggle"]'));
window.__s1ready = true;
</script>`);

  /* ③ README 문장만 보고 일반 <script> 로 넣으면? */
  page = await pageProbe(cdp, origin, siteDir, "__audit_classic.html", readmePage(TOGGLE, { script: `<script src="s1-ui/s1-ui.auto.js"></script>
<script>try { autoInit(); window.__s1ready = true; } catch (e) { console.error("autoInit 호출 실패: " + e.message); }</script>` }));
  try {
    await sleep(300);
    result.classicScript = { ready: await page.eval("window.__s1ready === true"), errors: [...page.exceptions, ...page.consoleErrors].map((e) => e.text.slice(0, 160)) };
  } finally { await page.close(); }
  return result;
}

async function previewCheck(cdp, origin, siteDir) {
  const out = {};
  for (const [mode, url] of [["http", `${origin}/s1-ui/preview.html`], ["file", pathToFileURL(path.join(siteDir, "s1-ui/preview.html")).href]]) {
    const page = await openPage(cdp, url, PC);
    try {
      await sleep(1500);
      await page.call(installHelper);
      const icons = await iconPaint(page);
      const toggleWorks = await page.eval(`(()=>{const t=document.querySelector('[data-s1-component="toggle"]:not([disabled])'); if(!t) return null; const b=t.getAttribute("aria-checked"); t.click(); return b!==t.getAttribute("aria-checked");})()`);
      out[mode] = {
        url: mode === "file" ? "file://…/s1-ui/preview.html" : "/s1-ui/preview.html",
        errors: [...page.exceptions, ...page.consoleErrors].map((e) => e.text.slice(0, 200)),
        failedRequests: page.failedRequests.map((r) => `${r.status || r.error} ${r.url.replace(origin, "")}`).slice(0, 10),
        icons: { total: icons.total, checked: icons.results.length, painted: icons.results.filter((i) => i.painted).length },
        toggleWorks
      };
    } finally { await page.close(); }
  }
  return out;
}

function packageStatic(pkgDir, manifest, readme, contract, exampleFiles) {
  const findings = [];
  const checks = {};
  const add = (key, area, severity, what, evidence, suggestedFix) => findings.push({ id: `package:${key}`, area, severity, what, evidence, suggestedFix });

  /* README 경로 */
  const mentioned = [...readme.matchAll(/`([^`]+\.(?:css|js|html)|examples\/)`/g)].map((m) => m[1]).filter((p) => !p.includes("<") && !p.includes("*"));
  const missingPaths = [...new Set(mentioned)].filter((p) => !fs.existsSync(path.join(pkgDir, p)));
  checks.readmePaths = missingPaths.length ? "fail" : "pass";
  if (missingPaths.length) add("readme-paths", "readme", "broken", "README 가 가리키는 파일이 묶음에 없습니다.", missingPaths.join(", "), "README 경로 수정");

  /* README 숫자 */
  const count = manifest.components.length;
  const claims = [...readme.matchAll(/컴포넌트 \*{0,2}(\d+)종/g)].map((m) => Number(m[1]));
  const wrong = claims.filter((n) => n !== count);
  checks.readmeCount = wrong.length ? "fail" : "pass";
  if (wrong.length) add("readme-count", "readme", "friction", `README 안에서 컴포넌트 개수가 엇갈립니다 — 실제 ${count}종인데 '${wrong.join("·")}종'이라고 적힌 곳이 있습니다.`, `README: ${claims.map((n) => `${n}종`).join(", ")} / manifest.json components=${count}`, "build-ui-package-zip.js TOOL_PACKAGES['html-css-js'].start 의 숫자를 manifest 에서 계산");

  /* autoInit 이름 */
  const autoSource = fs.readFileSync(path.join(pkgDir, "s1-ui.auto.js"), "utf8");
  checks.autoInitExport = /export function autoInit\(/.test(autoSource) && /autoInit\(\)/.test(readme) ? "pass" : "fail";
  if (checks.autoInitExport === "fail") add("readme-autoinit", "readme", "broken", "README 의 autoInit() 이름이 실제 파일과 다릅니다.", "s1-ui.auto.js export 확인", "README 수정");

  /* 모듈 방식 */
  checks.readmeModule = /type="module"|type=module|import \{/.test(readme) ? "pass" : "fail";
  if (checks.readmeModule === "fail") add("readme-module", "readme", "friction", "README 가 s1-ui.auto.js 를 '어떻게' 부르는지(<script type=\"module\"> 과 import 한 줄) 알려주지 않습니다. 평소처럼 <script src> 로 넣으면 오류가 나고 아무것도 동작하지 않습니다.", "README 4단계: '`s1-ui.auto.js` 의 `autoInit()` 을 한 번 부르면…' — 코드 예시 없음", "README 에 <script type=\"module\">import { autoInit } from \"./s1-ui/s1-ui.auto.js\"; autoInit();</script> 예시 추가");

  /* typography.css */
  const typoNeeded = (manifest.commonCssDependencies || []).filter((dep) => !readme.includes(dep));
  checks.readmeCssDeps = typoNeeded.length ? "fail" : "pass";
  if (typoNeeded.length) add("readme-typography", "readme", "note", `묶음 정보(manifest.json)는 공통 CSS 로 ${typoNeeded.join(", ")} 도 꼽는데 README 시작하기에는 빠져 있습니다. 부품 겉모습엔 영향이 없지만(부품은 자체 글자 설정을 가짐) 일반 글자용 typo-* 클래스를 쓰려면 필요합니다.`, `manifest.commonCssDependencies=${js(manifest.commonCssDependencies)}`, "README 3단계에 typography.css 를 선택 항목으로 안내");

  /* 서체 */
  const fontDeps = manifest.fontDependencies || [];
  checks.readmeFont = fontDeps.length && !/Pretendard/i.test(readme) ? "fail" : "pass";
  if (checks.readmeFont === "fail") add("readme-font", "font", "friction", "부품이 쓰는 글꼴(Pretendard)이 묶음에 들어 있지 않고, README 에도 따로 넣으라는 말이 없습니다. README 대로만 하면 글꼴이 깔리지 않은 컴퓨터에서는 다른 글꼴로 보입니다.", `manifest.fontDependencies: ${fontDeps.map((f) => f.source).join(", ")} · 묶음 안 @font-face 0개`, "README 3단계에 Pretendard CDN <link> 한 줄 추가(또는 woff2 동봉)");

  /* 다크 모드 안내 */
  checks.readmeDark = /data-theme|다크/.test(readme) ? "pass" : "fail";
  if (checks.readmeDark === "fail") add("readme-dark", "dark", "friction", "다크 모드를 켜는 방법(html 에 data-theme=\"dark\")이 README 어디에도 없습니다. 토큰 파일 안을 열어 봐야 알 수 있습니다.", "tokens.css 에 [data-theme=\"dark\"] 블록 존재 · README 언급 0", "README 에 다크 모드 한 줄 + 페이지 바탕은 var(--color-bg-level-0) 로 직접 칠해야 한다는 안내 추가");

  /* 모달 여는 법 */
  checks.readmeOpen = /\.open\(|open\(\)/.test(readme) ? "pass" : "fail";
  if (checks.readmeOpen === "fail") add("readme-open", "readme", "friction", "팝업(modal)·바텀시트 예시는 처음에 숨어 있는데, 버튼을 눌러 여는 방법이 README·예시 어디에도 없습니다. 각 부품 manifest 의 methods(open/close)를 읽고 모듈을 직접 import 해야 합니다.", "examples/modal.html: <div … hidden> · README 'open' 언급 0 · components/modal.manifest.json javascript.methods=[open(detail), close(detail), isOpen]", "README 에 import { modal } from './s1-ui/s1-ui.js'; modal.init(el).open() 예시, 또는 data-s1-open 같은 선언형 트리거 제공");

  /* 예시 주석이 README 를 가리키는데 README 에 없음 */
  const dangling = [];
  for (const file of exampleFiles) {
    const html = fs.readFileSync(path.join(pkgDir, "examples", file), "utf8");
    if (!/README/.test(html)) continue;
    const props = [...new Set([...html.matchAll(/--s1-[a-z0-9-]+/g)].map((m) => m[0]))];
    const lost = props.filter((prop) => !readme.includes(prop));
    if (lost.length) dangling.push(`${file}: ${lost.join(", ")}`);
  }
  checks.exampleReadmeRefs = dangling.length ? "fail" : "pass";
  if (dangling.length) add("readme-dangling", "readme", "friction", "예시 주석이 '쓰는 법은 배포본 README' 라고 안내하는데, 묶음 README 에는 그 내용(아이콘 바꾸는 CSS 변수)이 없습니다.", dangling.join(" | "), "README 에 아이콘 교체 변수(--s1-icon 등) 사용법 추가");

  /* 모바일 예시 이름 */
  const oddMobile = exampleFiles.filter((f) => /-mobile\.html$/.test(f));
  const mobileOnlyUnnamed = [];
  for (const file of exampleFiles) {
    if (/\.mobile\.html$|-mobile\.html$/.test(file)) continue;
    const roots = parseRoots(fs.readFileSync(path.join(pkgDir, "examples", file), "utf8"));
    if (roots.some((r) => r.attrs["data-break"] === "mobile") || /^mobile-/.test(file)) mobileOnlyUnnamed.push(file);
  }
  checks.mobileNaming = oddMobile.length || mobileOnlyUnnamed.length ? "fail" : "pass";
  if (oddMobile.length) add("mobile-naming", "mobile", "friction", "README 는 모바일용을 '*.mobile.html' 로 찾으라는데, 그 규칙을 따르지 않는 모바일 예시가 있습니다.", oddMobile.join(", "), "input.password.mobile.html 처럼 이름 통일");
  if (mobileOnlyUnnamed.length) add("mobile-unnamed", "mobile", "friction", "모바일 전용 부품인데 파일 이름에 mobile 표시가 없어, README 규칙만 보면 PC 용으로 착각합니다.", mobileOnlyUnnamed.join(", "), "*.mobile.html 로 이름 변경 또는 README 에 '모바일 전용 부품' 목록 표기");

  /* 예시 존재 · variant/size 커버 */
  const missingExamples = [];
  const coverage = [];
  for (const entry of manifest.components) {
    const files = [...new Set(Object.values(entry.examples || { pc: entry.example }).filter(Boolean))];
    const existing = files.filter((rel) => fs.existsSync(path.join(pkgDir, rel)));
    if (!existing.length) { missingExamples.push(entry.id); continue; }
    const contractEntry = contract && contract.components.find((c) => c.id === entry.id);
    if (!contractEntry) continue;
    const roots = existing.flatMap((rel) => parseRoots(fs.readFileSync(path.join(pkgDir, rel), "utf8"))).filter((r) => r.component === entry.id);
    const componentManifest = JSON.parse(fs.readFileSync(path.join(pkgDir, "components", `${entry.id}.manifest.json`), "utf8"));
    const documented = (componentManifest.htmlContract && componentManifest.htmlContract.requiredAttributes) || [];
    for (const [axis, attr, values] of [["variant", contractEntry.variantAttribute, contractEntry.variants], ["size", contractEntry.sizeAttribute, contractEntry.sizes]]) {
      if (!attr || !values || values.length < 2) continue;
      const shown = new Set(roots.map((r) => r.attrs[attr]).filter(Boolean));
      const absent = values.filter((v) => !shown.has(v));
      if (absent.length) coverage.push({ component: entry.id, axis, attr, absent, shown: [...shown], documented: documented.includes(attr) });
    }
  }
  checks.examplesExist = missingExamples.length ? "fail" : "pass";
  if (missingExamples.length) add("examples-missing", "coverage", "broken", "예시 파일이 없는 컴포넌트가 있습니다.", missingExamples.join(", "), "examples/ 에 추가");
  checks.variantCoverage = coverage.length ? "fail" : "pass";
  const undocumented = coverage.filter((c) => !c.documented);
  const documentedOnly = coverage.filter((c) => c.documented);
  if (undocumented.length) add("coverage-undocumented", "coverage", "friction", `예시에 안 나오는 종류·크기가 있는데, 그걸 고르는 속성 이름도 그 부품 안내(manifest)의 필수 속성 목록에 없습니다 — ${undocumented.length}건.`, undocumented.map((c) => `${c.component} ${c.attr}: 예시엔 ${c.shown.join("/") || "없음"}, 빠진 값 ${c.absent.join("/")}`).join(" | "), "예시에 나머지 값 추가 또는 manifest.htmlContract 에 속성 명시");
  if (documentedOnly.length) add("coverage-documented", "coverage", "note", `예시에는 일부 종류·크기만 나옵니다(${documentedOnly.length}건). 나머지는 속성 값만 바꾸면 되고, 쓸 수 있는 값은 각 부품 manifest.json 에 적혀 있습니다 — 다만 README 는 manifest 를 보라고 안내하지 않습니다.`, documentedOnly.map((c) => `${c.component} ${c.attr}: 예시 ${c.shown.join("/") || "-"} / 빠짐 ${c.absent.join("/")}`).join(" | "), "README 에 'variant·size 값 목록은 components/<id>.manifest.json' 안내, 또는 preview.html 에 값 표");

  /* 속성 이름 일관성 */
  if (contract) {
    const byAttr = {};
    for (const c of contract.components) if (c.variantAttribute) (byAttr[c.variantAttribute] ||= []).push(c.id);
    const axes = Object.keys(byAttr);
    /* README 의 「종류를 고르는 속성」 표가 모든 부품·속성·값을 적어 두었으면 이름이 달라도 찾을 수 있다 — 안내로 해결 */
    const undocumentedKinds = [];
    for (const c of contract.components) {
      if (!c.variantAttribute || (c.variants || []).length < 2) continue;
      for (const value of c.variants) {
        const row = new RegExp(`\\|\\s*${c.id.replace(/[-]/g, "\\-")}\\s*\\|\\s*\`${c.variantAttribute}\`\\s*\\|\\s*\`${String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\`\\s*\\|`);
        if (!row.test(readme)) undocumentedKinds.push(`${c.id} ${c.variantAttribute}=${value}`);
      }
    }
    const kindsDocumented = undocumentedKinds.length === 0;
    checks.attributeConsistency = axes.length > 2 ? (kindsDocumented ? "documented" : "fail") : "pass";
    if (axes.length > 2) add("consistency-variant-attr", "consistency", kindsDocumented ? "note" : "friction", `'종류'를 고르는 속성 이름이 부품마다 ${axes.length}가지로 다릅니다.${kindsDocumented ? " — 안내로 해결: README 의 「종류를 고르는 속성」 표가 모든 부품·속성·값을 적어 두었습니다(이름은 정본 어휘 그대로 유지)." : ` README 표에 빠진 것: ${undocumentedKinds.slice(0, 8).join(", ")}`}`, axes.map((a) => `${a}: ${byAttr[a].join(", ")}`).join(" | "), kindsDocumented ? "표 유지 — 이름을 바꾸지 않기로 한 결정(river 2026-10-13)" : "README 에 부품별 속성·값 표 제공");
    const odd = contract.components.filter((c) => (c.sizes || []).some((s) => /^\d+$/.test(s)));
    if (odd.length) add("consistency-size-values", "consistency", "note", "크기 값 이름 규칙이 섞여 있습니다 — 대부분 xxsm·xsm·sm·md·lg 인데 숫자로 된 것이 있습니다.", odd.map((c) => `${c.id}: ${c.sizes.join("/")}`).join(" | "), "크기 이름 규칙 통일");
    const breakMixed = [];
    for (const c of contract.components) {
      const m = JSON.parse(fs.readFileSync(path.join(pkgDir, "components", `${c.id}.manifest.json`), "utf8"));
      const declaresBreak = m.breaks && Object.keys(m.breaks).length > 0;
      const required = ((m.htmlContract && m.htmlContract.requiredAttributes) || []).includes("data-break");
      if (declaresBreak && !required) breakMixed.push(c.id);
    }
    if (breakMixed.length) add("consistency-break", "consistency", "note", "PC/모바일 두 벌이 있다고 적힌 부품 중 일부는 data-break 로 고르고, 일부는 data-break 를 받지 않습니다(속성 없이 한 벌로 자동).", `data-break 필수 아님: ${breakMixed.join(", ")}`, "README 에 부품별 PC/모바일 전환 방법 표");
    const stateAttrs = [];
    for (const file of exampleFiles) for (const r of parseRoots(fs.readFileSync(path.join(pkgDir, "examples", file), "utf8"))) if (r.attrs["data-state"] !== undefined) stateAttrs.push(`${r.component}(${r.attrs["data-state"]})`);
    if (stateAttrs.length) add("consistency-state", "consistency", "note", "상태를 대부분 aria-* (aria-pressed·aria-checked·aria-expanded)로 표현하는데, 일부는 data-state 를 씁니다.", [...new Set(stateAttrs)].join(", "), "상태 표현 규칙 안내");
  } else {
    checks.attributeConsistency = "notChecked";
  }
  return { findings, checks };
}


/* ── 겹쳐 쓰기 검사: 창 안에 넣은 팝업의 크기 · 창 안에서 창 열기 ───────────────────────────── */
function extractDiv(html, component) {
  const start = html.search(new RegExp(`<div[^>]*data-s1-component="${component}"`));
  if (start === -1) return null;
  const tag = /<(\/?)div\b/g;
  tag.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = tag.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, html.indexOf(">", m.index) + 1);
  }
  return null;
}

const POPOVERS = [["date-picker", true], ["time-picker", true], ["select", false], ["filter-chip", false]];

async function nestedLayerChecks(cdp, origin, siteDir, pkgDir) {
  const read = (rel) => fs.readFileSync(path.join(pkgDir, rel), "utf8");
  const out = { popovers: [], modalOpenFromModal: null };
  const snippets = {};
  for (const [name] of POPOVERS) snippets[name] = extractDiv(read(`examples/${name}.html`), name);
  const wrappers = [["modal", read("examples/modal.html")], ["modal-content", read("examples/modal-content.html")]];
  const nestedBlock = POPOVERS.map(([name]) => `<div class="__nest" data-nest="${name}">${snippets[name] ?? ""}</div>`).join("\n");
  const stdBlock = POPOVERS.map(([name]) => `<div class="__std" data-nest="${name}">${snippets[name] ?? ""}</div>`).join("\n");
  const stripOpener = (html) => html.replace(/<!--[\s\S]*?-->\s*/g, "").replace(/<button[^>]*data-s1-open[^>]*>[\s\S]*?<\/button>\s*/, "");
  const measure = `(async () => {
    const results = {};
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const holder of document.querySelectorAll("[data-nest]")) {
      const name = holder.dataset.nest;
      const root = holder.querySelector('[data-s1-component="' + name + '"]');
      if (!root) continue;
      const trigger = root.querySelector('[data-s1-part="trigger"]');
      trigger.click();
      await sleep(150);
      const panel = root.querySelector('[data-s1-part="panel"]');
      const cs = getComputedStyle(panel);
      const rect = panel.getBoundingClientRect();
      const key = holder.classList.contains("__std") ? "std" : holder.closest('[data-s1-component="modal-content"]') ? "modal-content" : "modal";
      (results[name] ||= {})[key] = { width: Math.round(rect.width), height: Math.round(rect.height), border: cs.borderTopWidth, overflowY: cs.overflowY, padding: cs.paddingTop, bg: cs.backgroundColor, display: cs.display };
      trigger.click();
      await sleep(80);
    }
    return JSON.stringify(results);
  })()`;
  for (const [wrapperName, wrapperHtml] of wrappers) {
    const html = stripOpener(wrapperHtml);
    const at = html.search(/<div data-s1-part="footer"/);
    if (at === -1) continue;
    const withNested = html.slice(0, at) + nestedBlock + html.slice(at);
    const page = await pageProbe(cdp, origin, siteDir, `__audit_nested_${wrapperName}.html`, readmePage(`<div style="padding:16px">${stdBlock}</div>${withNested}`, { title: "nested" }));
    try {
      await waitFor(page, "window.__s1ready === true", 5000);
      await page.eval(`(()=>{const m=document.querySelector('[data-s1-component="${wrapperName}"]'); m.hidden=false; return true;})()`);
      await sleep(200);
      const got = JSON.parse(await page.eval(measure));
      for (const [name, byContext] of Object.entries(got)) {
        const std = byContext.std;
        const inner = byContext[wrapperName];
        if (!std || !inner) continue;
        const fixedWidth = POPOVERS.find(([n]) => n === name)[1];
        const diffs = [];
        for (const key of ["border", "overflowY", "padding", "bg"]) if (std[key] !== inner[key]) diffs.push(`${key} ${std[key]} → ${inner[key]}`);
        if (fixedWidth && std.width !== inner.width) diffs.push(`폭 ${std.width}px → ${inner.width}px`);
        out.popovers.push({ wrapper: wrapperName, component: name, std, inner, diffs });
      }
    } finally { await page.close(); }
  }

  /* 모바일: 바텀시트 안에서 날짜·시간 시트를 열었을 때 단독으로 열 때와 같은 상자(위치·폭·바탕·머리)인가 */
  out.sheets = [];
  const sheetNames = ["date-picker", "time-picker"];
  const mobileSnippets = {};
  for (const name of sheetNames) mobileSnippets[name] = extractDiv(read(`examples/${name}.mobile.html`), name);
  const sheetHtml = stripOpener(read("examples/bottom-sheet.mobile.html")).replace(/(<div id="[^"]*" data-s1-component="bottom-sheet"[^>]*?)\shidden/, "$1");
  const sheetAt = sheetHtml.search(/<div data-s1-part="sheet-footer"/);
  const measureSheet = `(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const results = {};
    for (const holder of document.querySelectorAll("[data-nest]")) {
      const name = holder.dataset.nest;
      const root = holder.querySelector('[data-s1-component="' + name + '"]');
      if (!root) continue;
      root.querySelector('[data-s1-part="trigger"]').click();
      await sleep(250);
      const panel = root.querySelector('[data-s1-part="sheet-panel"]');
      const header = root.querySelector('[data-s1-part="sheet-header"]');
      if (!panel) continue;
      const r = panel.getBoundingClientRect();
      const h = header ? header.getBoundingClientRect() : null;
      const key = holder.classList.contains("__std") ? "std" : "inSheet";
      (results[name] ||= {})[key] = { x: Math.round(r.x), w: Math.round(r.width), bg: getComputedStyle(panel).backgroundColor, headerH: h ? Math.round(h.height) : 0 };
      root.querySelector('[data-s1-part="trigger"]').click();
      await sleep(120);
    }
    return JSON.stringify(results);
  })()`;
  if (sheetAt !== -1 && sheetNames.every((name) => mobileSnippets[name])) {
    const stdMobile = sheetNames.map((name) => `<div class="__std" data-nest="${name}">${mobileSnippets[name]}</div>`).join("\n");
    const nestedMobile = sheetNames.map((name) => `<div class="__nest" data-nest="${name}">${mobileSnippets[name]}</div>`).join("\n");
    const withSheet = sheetHtml.slice(0, sheetAt) + nestedMobile + sheetHtml.slice(sheetAt);
    const mp = await pageProbe(cdp, origin, siteDir, "__audit_nested_sheet.html", readmePage(`<div style="padding:8px">${stdMobile}</div>${withSheet}`, { title: "nested sheet" }), MOBILE);
    try {
      await waitFor(mp, "window.__s1ready === true", 5000);
      const got = JSON.parse(await mp.eval(measureSheet));
      for (const [name, byContext] of Object.entries(got)) {
        if (!byContext.std || !byContext.inSheet) continue;
        const diffs = [];
        for (const key of ["x", "w", "bg", "headerH"]) if (byContext.std[key] !== byContext.inSheet[key]) diffs.push(`${key} ${byContext.std[key]} → ${byContext.inSheet[key]}`);
        out.sheets.push({ component: name, std: byContext.std, inSheet: byContext.inSheet, diffs });
      }
    } finally { await mp.close(); }
  }

  /* 창 안에서 다른 창 열기 — 예외 없이 응답해야 한다 */
  /* 예시에 id 가 있든 없든 같은 조건으로 시험한다 — 루트 id 를 우리가 지정한다 */
  const withRootId = (html, id) => html.replace(/^(\s*)<div\b([^>]*?)>/, (m, lead, attrs) => `${lead}<div id="${id}"${attrs.replace(/\sid="[^"]*"/, "")}>`);
  const base = stripOpener(read("examples/modal.html"));
  const second = withRootId(base, "__second").replace(/confirm-modal-(title|message)/g, "second-modal-$1");
  const first = withRootId(base, "__first").replace(/(<div data-s1-part="footer")/, `<div style="padding:8px"><button type="button" id="__inner" data-s1-open="__second">다음 창</button></div>$1`);
  const page = await pageProbe(cdp, origin, siteDir, "__audit_modal_stack.html", readmePage(`<button type="button" id="__outer" data-s1-open="__first">열기</button>${first}${second}`, { title: "stack" }));
  try {
    await waitFor(page, "window.__s1ready === true", 5000);
    try {
      await page.eval(`document.getElementById("__outer").click(), true`);
      await sleep(200);
      await page.eval(`document.getElementById("__inner").click(), true`);
      await sleep(400);
      const alive = await Promise.race([page.eval("1+1").then((v) => v === 2), sleep(4000).then(() => false)]);
      out.modalOpenFromModal = { responsive: alive, exceptions: page.exceptions.slice(0, 3).map((e) => e.text.slice(0, 160)) };
    } catch (error) {
      /* 페이지가 멈추면 CDP 응답이 끊긴다 — 그 자체가 고장이다 */
      out.modalOpenFromModal = { responsive: false, exceptions: [...page.exceptions.slice(0, 3).map((e) => e.text.slice(0, 160)), `페이지가 응답하지 않음: ${error.message.slice(0, 80)}`] };
    }
  } finally { try { await page.close(); } catch { /* 멈춘 페이지 */ } }
  return out;
}


/* ── 부품이 알아서 고르기(river 결정 2026-10-13 「전부 부품이 알아서」) — 퍼블리셔가 README 대로 표시만 달면 되는가 ─────── */
async function selectionChecks(cdp, origin, siteDir, pkgDir) {
  const read = (rel) => fs.readFileSync(path.join(pkgDir, rel), "utf8");
  const strip = (html) => html.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  const out = [];
  const record = (label, actual, wanted) => out.push({ label, ok: JSON.stringify(actual) === JSON.stringify(wanted), actual, wanted });
  const chipHtml = strip(read("examples/chip.html"));
  const chip = (label) => chipHtml.replace(/<span data-s1-part="label">[^<]*<\/span>/, `<span data-s1-part="label">${label}</span>`);
  const navHtml = strip(read("examples/mobile-bottom-nav.mobile.html"));
  const sheetHtml = strip(read("examples/bottom-sheet.mobile.html")).replace(/<button[^>]*data-s1-open[^>]*>[\s\S]*?<\/button>/, '<button type="button" id="opener" data-s1-open="bottom-sheet-example"><span data-s1-part="value">선택</span></button>');
  const sheetWith = (attrs) => sheetHtml.replace('<div data-s1-part="sheet-body">', `<div data-s1-part="sheet-body"${attrs}>`);
  const markup = `<div id="g1" data-s1-select="single">${chip("가")}${chip("나")}${chip("다")}</div><div id="g2">${chip("라")}${chip("마")}</div>
<div id="navbox">${navHtml}</div><div id="sheet-on">${sheetWith(' data-s1-select="single" data-s1-close-on-select')}</div>`;
  const page = await pageProbe(cdp, origin, siteDir, "__audit_selection.html", readmePage(markup, { title: "selection" }), MOBILE);
  try {
    await waitFor(page, "window.__s1ready === true", 5000);
    const run = (expression) => page.eval(expression);
    const chipOn = (id) => run(`JSON.stringify([...document.querySelectorAll('#${id} [data-s1-component="chip"]')].map((c) => c.getAttribute("aria-pressed") === "true"))`);
    await run(`document.querySelectorAll('#g1 [data-s1-component="chip"]')[1].click(), document.querySelectorAll('#g1 [data-s1-component="chip"]')[2].click(), true`);
    record("칩 묶음에 표시를 달면 하나만 켜진다", await chipOn("g1"), JSON.stringify([false, false, true]));
    await run(`document.querySelectorAll('#g2 [data-s1-component="chip"]')[0].click(), document.querySelectorAll('#g2 [data-s1-component="chip"]')[1].click(), true`);
    record("표시가 없는 칩은 종전처럼 여러 개 켜진다", await chipOn("g2"), JSON.stringify([true, true]));

    const tabs = `document.querySelectorAll('#navbox [data-s1-component="mobile-bottom-nav"]')`;
    await run(`${tabs}[2].click(), true`);
    record("하단 탭을 누르면 부품이 활성 탭을 옮긴다", await run(`${tabs}[2].getAttribute("aria-selected") + "/" + ${tabs}[2].getAttribute("aria-current") + "/" + ${tabs}[0].getAttribute("aria-selected")`), "true/page/false");
    await run(`document.querySelector('#navbox nav').addEventListener("s1:mobile-bottom-nav:beforechange", (e) => e.preventDefault()), ${tabs}[3].click(), true`);
    record("화면이 beforechange 를 막으면 탭이 그대로다", await run(`${tabs}[3].getAttribute("aria-selected") + "/" + ${tabs}[2].getAttribute("aria-selected")`), "false/true");

    await run(`document.getElementById("opener").click(), true`);
    await sleep(200);
    await run(`document.querySelectorAll('#sheet-on [data-s1-component="bottom-sheet-option"]')[2].click(), true`);
    await sleep(150);
    record("시트 목록에 표시를 달면 줄을 눌러 고르고(체크 하나) 값이 연 버튼에 들어가고 시트가 닫힌다", await run(`JSON.stringify([[...document.querySelectorAll('#sheet-on [data-s1-component="bottom-sheet-option"]')].map((o) => o.dataset.state), document.querySelector('#opener [data-s1-part="value"]').textContent, document.getElementById("bottom-sheet-example").hidden])`), JSON.stringify([["default", "default", "selected", "default"], "항목 3", true]));
  } finally { await page.close(); }
  return out;
}

/* ── 자가시험 ─────────────────────────────────────────────── */
async function selftest(cdp, origin, siteDir, tmp) {
  const planted = `<button type="button" data-s1-component="button" data-variant="primary" data-size="md"><span data-s1-part="label">정상 버튼</span></button>
<span data-s1-component="planted-good-icon" style="display:inline-block;width:24px;height:24px;background-color:var(--color-icon-default, #222);-webkit-mask:url(s1-ui/assets/icons/close.svg) center/contain no-repeat;mask:url(s1-ui/assets/icons/close.svg) center/contain no-repeat"></span>
<span data-s1-component="planted-bad-icon" style="display:inline-block;width:24px;height:24px;background-color:#222;-webkit-mask:url(s1-ui/assets/icons/__missing__.svg) center/contain no-repeat;mask:url(s1-ui/assets/icons/__missing__.svg) center/contain no-repeat"></span>
<script>console.error("planted-console-error");</script>
<script>setTimeout(function(){ throw new Error("planted-exception"); }, 0);</script>`;
  const report = await auditExample(cdp, origin, siteDir, { file: "__selftest.html", component: "button", viewport: PC, markup: planted });
  const has = (area, pattern) => report.findings.some((f) => f.area === area && pattern.test(`${f.what} ${f.evidence}`));
  const results = [
    ["콘솔 오류 탐지", has("console", /planted-console-error/)],
    ["예외 탐지", has("console", /planted-exception/)],
    ["아이콘 404 탐지(네트워크)", has("network", /__missing__\.svg/)],
    ["빈 아이콘 탐지(그려지지 않음)", has("icon", /planted-bad-icon/)],
    ["정상 아이콘은 빈 칸으로 오판하지 않음(대조군)", !has("icon", /planted-good-icon/)],
    ["정상 버튼 Enter/Space 동작은 통과(대조군)", report.interactions.length > 0 && report.interactions.every((i) => i.status === "pass")]
  ];

  /* lint 음성 탐지: ①실제 묶음 lint → 실행 불가 탐지 ②참조 lint → 틀린 예시 오류 탐지 ③모든 걸 통과시키는 가짜 lint → '못 잡음' 탐지 */
  const brokenDir = path.join(tmp, "lint-broken");
  fs.mkdirSync(brokenDir, { recursive: true });
  fs.writeFileSync(path.join(brokenDir, "broken-example.html"), BROKEN_EXAMPLE);
  const packaged = analyzeLint(path.join(siteDir, "s1-ui/tools/s1-ui-lint.mjs"), path.join(siteDir, "s1-ui/examples"), brokenDir, "packaged", { packaged: true });
  const refLint = fs.existsSync(path.join(tmp, "ref/s1-ui/tools/s1-ui-lint.mjs")) ? path.join(tmp, "ref/s1-ui/tools/s1-ui-lint.mjs") : path.join(ROOT, "ui-library/dist/tools/s1-ui-lint.mjs");
  const reference = analyzeLint(refLint, path.join(siteDir, "s1-ui/examples"), brokenDir, "reference", { packaged: false });
  const fakeLint = path.join(tmp, "fake-lint.mjs");
  fs.writeFileSync(fakeLint, `if (process.argv[2] === "--version") { console.log("fake 0"); } else { console.log("\\n파일 1개 검사 · 오류 0 · 경고 0"); }\n`);
  const fake = analyzeLint(fakeLint, path.join(siteDir, "s1-ui/examples"), brokenDir, "fake", { packaged: false });
  results.push(
    ["lint: 실행조차 안 되는 묶음 lint 를 broken 으로 잡음", packaged.ran ? "skip" : packaged.findings.some((f) => f.severity === "broken")],
    ["lint: 참조 lint 가 틀린 variant 를 오류로 보고", reference.ran && reference.broken.variantCaught],
    ["lint: 다 통과시키는 가짜 lint 를 '못 잡음'(broken)으로 판정", fake.findings.some((f) => f.severity === "broken" && /nope/.test(f.what))]
  );
  let failed = 0;
  for (const [name, ok] of results) {
    const mark = ok === "skip" ? "－" : ok ? "✅" : "❌";
    if (ok === false) failed += 1;
    console.log(`${mark} ${name}${ok === "skip" ? " (묶음 lint 가 실행됨 — 이 항목은 해당 없음)" : ""}`);
  }
  console.log(`\nSELFTEST ${failed ? "FAIL" : "PASS"} — 탐지기 ${results.length - failed}/${results.length}`);
  return failed === 0;
}

/* ── 본 실행 ─────────────────────────────────────────────── */
async function main() {
  const chromePath = findChrome();
  if (!chromePath) { console.log("[publisher-audit] 크롬이 없어 실행하지 못했습니다(검사 0건)."); process.exit(2); }
  if (!fs.existsSync(ZIP)) {
    log(`묶음이 없어 새로 만듭니다: ${path.relative(ROOT, ZIP)}`);
    const built = spawnSync(process.execPath, [path.join(ROOT, "scripts/build-ui-package-zip.js")], { stdio: "inherit", cwd: ROOT });
    if (built.status !== 0 || !fs.existsSync(ZIP)) throw new Error("묶음을 만들지 못했습니다");
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s1-pubaudit-"));
  cleanups.push(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const siteDir = path.join(tmp, "site");
  unzip(ZIP, siteDir);
  const pkgDir = path.join(siteDir, "s1-ui");
  if (!fs.existsSync(pkgDir)) throw new Error("압축을 풀었는데 s1-ui 폴더가 없습니다 — README 1단계와 다름");
  if (fs.existsSync(REF_ZIP)) { try { unzip(REF_ZIP, path.join(tmp, "ref")); } catch { /* 참조 없음 */ } }
  const { server, origin } = await serve(siteDir);
  cleanups.push(() => server.close());
  const chrome = await launchChrome(chromePath);
  cleanups.push(chrome.close);
  const cdp = chrome.cdp;
  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  if (SELFTEST) {
    const ok = await selftest(cdp, origin, siteDir, tmp);
    cleanupAll();
    process.exit(ok ? 0 : 1);
  }

  if (args.includes("--nested-only")) {
    /* 빠른 확인용: 겹쳐 쓰기 검사만 돌린다(결과 파일은 쓰지 않는다) */
    const nested = await nestedLayerChecks(cdp, origin, siteDir, pkgDir);
    console.log(JSON.stringify({ popoverDiffs: nested.popovers.filter((p) => p.diffs.length).map((p) => `${p.component} in ${p.wrapper}: ${p.diffs.join(", ")}`), sheetDiffs: (nested.sheets || []).map((s) => `${s.component}: ${s.diffs.join(", ") || "same"}`), modalOpenFromModal: nested.modalOpenFromModal, autoSelect: (await selectionChecks(cdp, origin, siteDir, pkgDir)).map((item) => `${item.ok ? "ok" : "FAIL"} ${item.label}`) }, null, 2));
    cleanupAll();
    process.exit(0);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(pkgDir, "manifest.json"), "utf8"));
  const readme = fs.readFileSync(path.join(pkgDir, "README.md"), "utf8");
  const contractPath = [path.join(tmp, "ref/s1-ui/platform/contract.json"), path.join(ROOT, "ui-library/dist/platform/contract.json")].find((p) => fs.existsSync(p));
  const contract = contractPath ? JSON.parse(fs.readFileSync(contractPath, "utf8")) : null;
  const baseCssName = ((manifest.optionalCssDependencies || [])[0] || {}).file || "s1-ui.base.css";
  const exampleFiles = fs.readdirSync(path.join(pkgDir, "examples")).filter((f) => f.endsWith(".html")).sort();
  const fileToComponent = {};
  for (const entry of manifest.components) for (const rel of Object.values(entry.examples || { pc: entry.example })) fileToComponent[path.basename(rel)] = entry.id;

  for (const old of fs.readdirSync(SHOTS_DIR)) if (old.endsWith(".png")) fs.rmSync(path.join(SHOTS_DIR, old));

  const examples = [];
  for (const file of exampleFiles) {
    const component = fileToComponent[file] || file.split(".")[0];
    const viewport = /\.mobile\.html$|-mobile\.html$/.test(file) ? MOBILE : PC;
    const markup = fs.readFileSync(path.join(pkgDir, "examples", file), "utf8");
    const started = Date.now();
    try {
      const report = await auditExample(cdp, origin, siteDir, { file, component, viewport, markup });
      examples.push(report);
      const counts = ["broken", "friction", "note"].map((s) => report.findings.filter((f) => f.severity === s).length);
      log(`${file.padEnd(32)} broken ${counts[0]} · friction ${counts[1]} · note ${counts[2]} · ${Date.now() - started}ms`);
    } catch (error) {
      examples.push({ example: file, component, checks: {}, findings: [], interactions: [], notChecked: [{ example: file, check: "전체", reason: `실행 오류: ${error.message}` }] });
      log(`${file} 실행 오류: ${error.message}`);
    }
  }

  /* 묶음 단위 */
  const pkgFindings = [];
  const pkgChecks = {};
  const pkgNotChecked = [];
  const pkgAdd = (key, area, severity, what, evidence, suggestedFix) => pkgFindings.push({ id: `package:${key}`, area, severity, what, evidence, suggestedFix });
  const stat = packageStatic(pkgDir, manifest, readme, contract, exampleFiles);
  pkgFindings.push(...stat.findings);
  Object.assign(pkgChecks, stat.checks);
  if (!contract) pkgNotChecked.push({ check: "variant 축 속성 이름", reason: "contract.json 을 찾지 못함" });

  /* 서체 실측 묶기 */
  const fontFacts = examples.filter((e) => e.font && e.font.platform).map((e) => ({ example: e.example, family: e.font.family, platform: e.font.platform, faces: e.font.faces }));
  const usesPretendard = fontFacts.filter((f) => f.platform.some((p) => /pretendard/i.test(p)));
  const webFont = fontFacts.filter((f) => f.platform.some((p) => /웹폰트/.test(p)));
  pkgChecks.fontRendered = fontFacts.length ? (usesPretendard.length === fontFacts.length && webFont.length === fontFacts.length ? "pass" : "fail") : "notChecked";
  if (fontFacts.length) {
    const sample = fontFacts.find((f) => !f.platform.some((p) => /pretendard/i.test(p))) || fontFacts[0];
    if (usesPretendard.length < fontFacts.length) pkgAdd("font-rendered", "font", "friction", `README 대로 만든 페이지에서 실제로 그려진 글꼴이 Pretendard 가 아닙니다(${fontFacts.length - usesPretendard.length}/${fontFacts.length} 페이지).`, `예: ${sample.example} → 지정 ${sample.family} / 실제 ${sample.platform.join(", ")}`, "Pretendard 를 묶음에 넣거나 README 에 CDN link 안내");
    else if (!webFont.length) pkgAdd("font-local-only", "font", "note", `이 검사 컴퓨터에서는 Pretendard 로 보였지만(${usesPretendard.length}/${fontFacts.length} 페이지), 웹 글꼴로 받은 게 아니라 이 컴퓨터에 깔린 글꼴을 쓴 것입니다. 글꼴이 깔리지 않은 사용자 PC 에서는 다른 글꼴로 보입니다.`, `예: ${sample.example} → ${sample.platform.join(", ")} · 페이지에 등록된 웹 글꼴 ${sample.faces.length}개`, "README 에 Pretendard CDN link 안내 또는 woff2 동봉");
  } else pkgNotChecked.push({ check: "실제 렌더 글꼴", reason: "Pretendard 를 지정한 부품 글자를 찾지 못함" });
  const undeclared = examples.flatMap((e) => (e.font && e.font.undeclared ? e.font.undeclared.map((u) => ({ ...u, example: e.example })) : []));
  if (undeclared.length) {
    const byComponent = {};
    for (const u of undeclared) (byComponent[u.component] ||= new Set()).add(u.part);
    pkgAdd("font-undeclared", "font", "friction", `일부 부품은 글꼴을 스스로 정하지 않고 페이지 글꼴을 그대로 물려받습니다(${Object.keys(byComponent).length}종). README 대로 만든 빈 페이지에서는 이 부품들만 다른 글꼴(브라우저 기본)로 보입니다.`, `${Object.entries(byComponent).map(([c, parts]) => `${c}(${[...parts].join("/")})`).join(", ")} · 예: ${undeclared[0].example} "${undeclared[0].text}" → ${undeclared[0].family}`, "해당 components/*.css 루트에 font-family: \"Pretendard Variable\", \"Pretendard\", sans-serif 지정");
  }

  /* 다크 모드 실측 묶기 */
  const darkFacts = examples.filter((e) => e.dark && e.dark.components > 0);
  if (darkFacts.length) {
    const changedPages = darkFacts.filter((e) => e.dark.changed > 0).length;
    /* README 가 선택 파일(s1-ui.base.css)을 안내하고, 그 파일을 붙이면 바탕이 따라오면 통과 — 안내대로 한 퍼블리셔의 화면이 기준이다 */
    const baseDocumented = new RegExp(`${baseCssName.replace(/\./g, "\\.")}`).test(readme) && /선택|옵션|optional/i.test(readme.slice(Math.max(0, readme.indexOf(baseCssName) - 200), readme.indexOf(baseCssName) + 200));
    const followsBg = darkFacts.some((e) => e.dark.pageBackgroundFollows) || (baseDocumented && darkFacts.every((e) => e.dark.pageBackgroundFollowsWithBase));
    pkgChecks.darkWorks = changedPages === darkFacts.length ? "pass" : "fail";
    if (!followsBg) pkgAdd("dark-page-bg", "dark", "friction", "다크 모드를 켜도 페이지 바탕은 흰색 그대로라, 퍼블리셔가 body 바탕을 직접 칠해야 합니다(안내 없음). 칠하지 않으면 어두운 부품이 흰 바탕 위에 뜹니다.", `data-theme="dark" 적용 후 body 배경 변화 0/${darkFacts.length} 페이지`, "s1-ui.css 에 [data-theme=dark] body 바탕 지정 또는 README 안내");
    const darkContrast = darkFacts.filter((e) => e.dark.contrastFailing > 0);
    if (darkContrast.length) {
      const worst = darkContrast.flatMap((e) => e.dark.worst.map((w) => ({ ...w, example: e.example }))).sort((a, b) => a.ratio - b.ratio).slice(0, 5);
      pkgAdd("dark-contrast", "a11y-contrast", "note", `다크 모드(바탕을 --color-bg-level-0 으로 칠한 상태)에서 글자 대비가 기준보다 낮은 곳이 ${darkContrast.length}개 예시에 있습니다. 디자인 의도일 수 있어 알려만 드립니다.`, worst.map((w) => `${w.example} "${w.text}" ${w.ratio}:1 (${w.fg}/${w.bg})`).join(" | "), "다크 Semantic 토큰 조합 재검토");
    }
  } else { pkgChecks.darkWorks = "notChecked"; pkgNotChecked.push({ check: "다크 모드 동작", reason: "보이는 부품이 있는 예시가 없음" }); }

  /* lint */
  const brokenDir = path.join(tmp, "lint-broken");
  fs.mkdirSync(brokenDir, { recursive: true });
  fs.writeFileSync(path.join(brokenDir, "broken-example.html"), BROKEN_EXAMPLE);
  const packagedLint = analyzeLint(path.join(pkgDir, "tools/s1-ui-lint.mjs"), path.join(pkgDir, "examples"), brokenDir, "packaged", { packaged: true });
  pkgFindings.push(...packagedLint.findings);
  pkgChecks.lintRuns = packagedLint.ran ? "pass" : "fail";
  let referenceLint = null;
  const refLintPath = path.join(tmp, "ref/s1-ui/tools/s1-ui-lint.mjs");
  if (fs.existsSync(refLintPath)) {
    referenceLint = analyzeLint(refLintPath, path.join(pkgDir, "examples"), brokenDir, "reference", { packaged: false });
    if (!packagedLint.ran) {
      /* 묶음 lint 가 안 돌 때만 참조 lint 결과를 대신 싣는다 — 같은 규칙 파일이라 '고치면 어떻게 되나'의 증거 */
      for (const f of referenceLint.findings) pkgFindings.push({ ...f, what: `(전체 묶음의 같은 lint 로 대신 돌려 본 결과) ${f.what}` });
    }
  } else pkgNotChecked.push({ check: "참조 lint", reason: "s1-ui-dev-package.zip 없음" });
  const lintForExamples = packagedLint.ran ? packagedLint : referenceLint;
  for (const report of examples) {
    if (!lintForExamples || !lintForExamples.ran) { report.checks.lint = "notChecked"; report.notChecked.push({ example: report.example, check: "lint", reason: "동봉 lint 실행 불가 · 참조 lint 없음" }); continue; }
    const errors = lintForExamples.examples.errors.filter((e) => e.file === report.example);
    report.checks.lint = errors.length ? "fail" : "pass";
    report.lintBy = packagedLint.ran ? "packaged" : "reference(dev-package)";
  }
  pkgChecks.lintCatchesVariant = lintForExamples && lintForExamples.ran ? (lintForExamples.broken.variantCaught ? "pass" : "fail") : "notChecked";
  pkgChecks.lintCatchesMissingName = lintForExamples && lintForExamples.ran ? (lintForExamples.broken.ariaLabelCaught ? "pass" : "fail") : "notChecked";

  /* 나중에 넣은 마크업 · 하나만 초기화 · 일반 script */
  try {
    const selectMarkup = fs.readFileSync(path.join(pkgDir, "examples/select.html"), "utf8");
    const dyn = await dynamicAndSingleInit(cdp, origin, siteDir, selectMarkup);
    const documented = /autoInit\([^)]/.test(readme) || /init\(/.test(readme.replace(/autoInit\(\)/g, ""));
    pkgChecks.dynamicInsert = dyn.lateAfterScopedAutoInit && dyn.lateSelectOpens ? "pass" : "fail";
    pkgChecks.singleInit = dyn.singleViaBundle.works && dyn.singleViaComponentFile.works ? "pass" : "fail";
    pkgChecks.doubleInitSafe = dyn.doubleInitChangeEvents === 1 ? "pass" : "fail";
    if (!dyn.lateAfterScopedAutoInit || !dyn.lateSelectOpens) pkgAdd("dynamic-init", "init", "broken", "페이지가 뜬 뒤에 넣은 부품은 autoInit(감쌀 영역) 을 다시 불러도 동작하지 않습니다.", js(dyn), "autoInit(scope) 확인");
    if (!dyn.lateWithoutInit) pkgAdd("dynamic-doc", "init", documented ? "note" : "friction", `페이지가 뜬 뒤에 넣은 부품(예: 목록을 불러와 그린 화면)은 자동으로 동작하지 않습니다. autoInit(감쌀 요소) 를 한 번 더 부르면 되고 두 번 불러도 겹치지 않지만${documented ? "" : ", README 에는 이 방법이 없습니다"}.`, `나중에 넣은 스위치 클릭 → 변화 없음 · autoInit(#late) 후 → 동작=${dyn.lateAfterScopedAutoInit}, select 열림=${dyn.lateSelectOpens} · 전체 autoInit() 재호출 후 클릭 1번에 change 이벤트 ${dyn.doubleInitChangeEvents}회`, "README 에 '나중에 넣은 마크업은 autoInit(그 요소)' 한 줄 추가");
    if (dyn.doubleInitChangeEvents !== 1) pkgAdd("double-init", "init", "broken", "autoInit() 을 두 번 부르면 한 번 눌렀는데 두 번 반응합니다.", `change 이벤트 ${dyn.doubleInitChangeEvents}회`, "init 의 WeakMap 중복 방지 확인");
    if (dyn.singleViaBundle.works && dyn.singleViaComponentFile.works) {
      if (!/init\(/.test(readme.replace(/autoInit\(\)/g, ""))) pkgAdd("single-init-doc", "init", "note", "autoInit 없이 부품 하나만 붙이는 길(import { toggle } from './s1-ui/s1-ui.js' → toggle.init(요소))은 실제로 동작하지만 README 에는 없습니다. 부품 manifest 의 lifecycle 에만 적혀 있습니다.", `s1-ui.js 경유=${dyn.singleViaBundle.works}, components/toggle.js 직접=${dyn.singleViaComponentFile.works}`, "README 에 개별 초기화 예시 추가");
    } else pkgAdd("single-init", "init", "broken", "부품 하나만 초기화하는 방법이 동작하지 않습니다.", js({ bundle: dyn.singleViaBundle, file: dyn.singleViaComponentFile }), "개별 init export 확인");
    pkgChecks.classicScript = dyn.classicScript.ready ? "pass" : "fail";
    if (!dyn.classicScript.ready && pkgChecks.readmeModule === "fail") {
      const target = pkgFindings.find((f) => f.id === "package:readme-module");
      if (target) target.evidence += ` · 실제로 <script src="s1-ui/s1-ui.auto.js"> 로 넣어 본 결과: ${dyn.classicScript.errors.join(" / ").slice(0, 200)}`;
    }
  } catch (error) { pkgNotChecked.push({ check: "나중에 넣은 마크업·개별 초기화", reason: error.message }); }

  /* 겹쳐 쓰기: 창 안에 넣은 팝업이 자기 정본 크기로 열리나 · 창 안에서 창을 열면 멈추지 않나 */
  try {
    const nested = await nestedLayerChecks(cdp, origin, siteDir, pkgDir);
    const bad = nested.popovers.filter((p) => p.diffs.length);
    pkgChecks.nestedPopoverSize = nested.popovers.length ? (bad.length ? "fail" : "pass") : "notChecked";
    if (bad.length) pkgAdd("nested-popover-size", "nested", "broken", `창(modal·modal-content) 안에 넣은 팝업이 창 밖에서 열 때와 다른 모양으로 열립니다 — 창 CSS 가 안쪽 부품의 부분까지 먹고 있습니다(${bad.length}건).`, bad.map((p) => `${p.component} in ${p.wrapper}: ${p.diffs.join(", ")}`).join(" | "), "창 CSS 의 부분 선택자를 그 부품 자신의 부분만 고르게 좁힌다");
    const badSheets = (nested.sheets || []).filter((s) => s.diffs.length);
    pkgChecks.nestedSheetBox = (nested.sheets || []).length ? (badSheets.length ? "fail" : "pass") : "notChecked";
    if (badSheets.length) pkgAdd("nested-sheet-box", "nested", "broken", "바텀시트 안에서 연 날짜·시간 시트가 단독으로 열 때와 다른 상자(위치·폭·바탕·머리)로 열립니다 — 겹친 시트의 CSS 가 서로를 가리고 있습니다.", badSheets.map((s) => `${s.component}: ${s.diffs.join(", ")}`).join(" | "), "같은 종류 부품의 부분은 가장 가까운 부품 루트 기준으로 고른다");
    pkgChecks.nestedModalOpen = nested.modalOpenFromModal && nested.modalOpenFromModal.responsive && !nested.modalOpenFromModal.exceptions.length ? "pass" : "fail";
    if (pkgChecks.nestedModalOpen === "fail") pkgAdd("nested-modal-crash", "nested", "broken", "열린 창 안의 버튼으로 다른 창을 열면 오류가 나거나 페이지가 멈춥니다.", js(nested.modalOpenFromModal), "열린 겹 중 맨 위 하나만 초점 가둠을 맡게 한다");
    pkgChecks.nestedDetail = nested;
  } catch (error) { pkgNotChecked.push({ check: "겹쳐 쓰기(팝업 크기·창 안에서 창 열기)", reason: error.message }); }

  /* 부품이 알아서 고르기: 표시를 달면 되고, 표시가 없으면 그대로이고, 화면이 막을 수 있다 */
  try {
    const picked = await selectionChecks(cdp, origin, siteDir, pkgDir);
    const bad = picked.filter((item) => !item.ok);
    pkgChecks.autoSelect = bad.length ? "fail" : "pass";
    if (bad.length) pkgAdd("auto-select", "interaction", "broken", `부품이 알아서 고르기가 약속대로 되지 않습니다(${bad.length}건).`, bad.map((item) => `${item.label} — 기대 ${item.wanted} / 실제 ${item.actual}`).join(" | "), "칩 묶음·시트 목록(data-s1-select=single)·하단 탭 런타임 확인");
    pkgChecks.autoSelectDetail = picked;
  } catch (error) { pkgNotChecked.push({ check: "부품이 알아서 고르기", reason: error.message }); }

  /* preview.html — README 2단계 "브라우저로 열면" */
  try {
    const preview = await previewCheck(cdp, origin, siteDir);
    pkgChecks.previewHttp = preview.http.errors.length === 0 && preview.http.icons.painted === preview.http.icons.checked ? "pass" : "fail";
    pkgChecks.previewFile = preview.file.errors.length === 0 && preview.file.icons.painted === preview.file.icons.checked && preview.file.toggleWorks ? "pass" : "fail";
    if (pkgChecks.previewFile === "fail") pkgAdd("preview-file", "readme", "broken", `README 2단계대로 preview.html 을 더블클릭해 브라우저로 열면(file://) 제대로 안 보입니다 — 아이콘 ${preview.file.icons.checked - preview.file.icons.painted}/${preview.file.icons.checked}개가 빈 칸이고, 동작 스크립트도 ${preview.file.toggleWorks ? "붙습니다" : "붙지 않습니다"}. 로컬 서버(http)로 열면 정상입니다.`, `file://: 오류 ${preview.file.errors.length}건(${preview.file.errors.slice(0, 2).join(" / ").slice(0, 200)}) · http: 오류 ${preview.http.errors.length}건, 아이콘 ${preview.http.icons.painted}/${preview.http.icons.checked} 그려짐`, "README 에 'npx serve s1-ui 처럼 로컬 서버로 여세요' 안내, 또는 preview 를 file:// 에서도 되게(아이콘 data URI·classic script 번들)");
    if (pkgChecks.previewHttp === "fail") pkgAdd("preview-http", "readme", "friction", "preview.html 을 로컬 서버로 열어도 오류나 빈 아이콘이 있습니다.", `오류 ${preview.http.errors.join(" / ").slice(0, 200)} · 요청 실패 ${preview.http.failedRequests.join(", ").slice(0, 200)} · 아이콘 ${preview.http.icons.painted}/${preview.http.icons.checked}`, "preview.html 점검");
    pkgChecks.previewDetail = preview;
  } catch (error) { pkgNotChecked.push({ check: "preview.html", reason: error.message }); }

  /* 결과 */
  const allExampleFindings = examples.flatMap((e) => e.findings);
  const allFindings = [...pkgFindings, ...allExampleFindings];
  const order = { broken: 0, friction: 1, note: 2 };
  allFindings.sort((a, b) => order[a.severity] - order[b.severity]);
  const notChecked = [...pkgNotChecked, ...examples.flatMap((e) => e.notChecked)];
  const totals = { broken: 0, friction: 0, note: 0 };
  for (const f of allFindings) totals[f.severity] += 1;
  const result = {
    tool: "scripts/publisher-audit/web.mjs",
    generatedAt: new Date().toISOString(),
    package: { zip: path.relative(ROOT, ZIP), version: manifest.version, canonicalFingerprint: manifest.canonicalFingerprint, components: manifest.components.length, readmeStartSteps: readme.split("## 시작하기")[1]?.split("##")[0].trim().split("\n").filter(Boolean) },
    method: {
      pageTemplate: "README 3·4단계만: <link tokens.css> <link s1-ui.css> + <script type=module> import { autoInit } … autoInit()",
      viewports: { pc: PC, mobile: MOBILE, rule: "*.mobile.html · *-mobile.html → mobile, 나머지 → pc" },
      server: "임시 폴더에 zip 해제 → 127.0.0.1 http",
      iconPaint: "아이콘 하나씩 켠 화면/끈 화면(opacity:0) 픽셀 비교 — 같으면 '그려지지 않음'",
      contrast: "WCAG 2.x 비율, 일반 4.5:1 · 큰 글자 3:1, disabled 제외, 배경 이미지 위 글자는 '판정 불가'로 셈",
      keyboard: "CDP 실제 Tab 키 — 닿은 요소마다 초점 있을 때/없을 때 스타일(자신+조상 3단, ::before/::after) 비교",
      lintReference: referenceLint ? "묶음 lint 가 안 돌면 s1-ui-dev-package.zip 의 같은 lint 로 대신 돌려 증거로 싣는다" : null
    },
    summary: { examplesChecked: examples.length, ...totals, notChecked },
    packageChecks: pkgChecks,
    lint: { packaged: { ran: packagedLint.ran, startError: packagedLint.startError || null }, reference: referenceLint ? { ran: referenceLint.ran, examples: referenceLint.examples && { errors: referenceLint.examples.errors.length, summary: referenceLint.examples.summary }, broken: referenceLint.broken } : null },
    findings: allFindings,
    examples: examples.map(({ findings, ...rest }) => ({ ...rest, findingIds: findings.map((f) => f.id) }))
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  /* 임시 폴더 경로는 실행마다 바뀌어 읽기만 어렵다 — 이름표로 바꿔 싣는다 */
  const tmpMark = new RegExp(`[^\\s'"(]*${path.basename(tmp).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
  fs.writeFileSync(path.join(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2).replace(tmpMark, "<압축푼폴더>")}\n`);
  log(`예시 ${examples.length}개 · broken ${totals.broken} · friction ${totals.friction} · note ${totals.note} · 확인 못 함 ${notChecked.length}`);
  log(`결과: ${path.relative(ROOT, path.join(OUT_DIR, "result.json"))}`);
  cleanupAll();
  process.exit(0);
}

main().catch((error) => { console.error(`[publisher-audit] 실행 오류: ${error.stack || error}`); cleanupAll(); process.exit(1); });
