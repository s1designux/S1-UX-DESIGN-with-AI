#!/usr/bin/env node
/**
 * publisher-audit/react.mjs — "React 개발자 눈" 검수기 (s1-ui-react.zip)
 * --------------------------------------------------------------------------
 * 질문 하나에 답한다: **React 개발자가 우리 React 묶음(zip)을 받아 README 대로만 쓰면, 진짜 React 앱에서 되나? 쓰기 쉬운가?**
 * web.mjs(퍼블리셔 눈)의 React 짝이다. 크롬 조종(cdp.mjs)·페이지 계산(page-helpers.mjs)을 그대로 쓴다.
 *
 * 하는 일(전부 실제로 실행한다 — 못 돌린 검사는 notChecked 로 남기고 통과로 치지 않는다):
 *   0. 저장소 밖 환경 폴더(--env)의 진짜 React·React DOM·Vite·TypeScript 를 쓴다. 없으면 만드는 법만 알려 주고 멈춘다.
 *   1. 빌드: README 「시작하기」대로만 쓴 앱을 `vite build` — 오류·경고 0 인가. 안쪽 README(platform/react) 의 import 도 그대로 시도.
 *      TypeScript strict 로 index.d.ts 를 받아들이나, 일부러 틀린 코드를 잡아내나(@ts-expect-error).
 *      한 부품만 쓴 앱 vs 전부 쓴 앱 묶음 크기(트리 셰이킹). 서버 렌더(react-dom/server, Node) 시도.
 *   2. 부품마다(내보낸 32종 × 화면 기준 breakName): 개발 서버 + StrictMode 로 붙이고
 *      콘솔 오류·React 경고 / StrictMode 이중 실행 때 듣기(listener)가 두 번 붙나·떼면 남나 / 크기 0 / 아이콘 / 실제 글꼴 /
 *      prop 을 바꾸면 화면이 따라오나 / className 갱신 / 슬롯 겹침 / 서버 마크업 위에 hydrate 했을 때 어긋남.
 *   3. 진짜 React 상태로 눌러 보기: 제어형·비제어형(value/onChange, checked, selected/onSelectedChange, open),
 *      이벤트가 한 번만 오나, 떼면 스크롤 잠금이 풀리나, 모달·바텀시트·날짜·시간·셀렉트·드롭다운·페이지네이션·칩 묶음·
 *      시트 목록·하단 탭·표·GNB, 폼 전송(name), ref·className.
 *   4. 묶음 단위: README 가 React 개발자에게 맞고 충분한가, 모든 export 에 타입이 있나, prop 이름이 한결같나.
 *   5. reports/publisher-audit/react/result.json (+ shots/*.png) — 발견 사항 형식은 web.mjs 와 같다
 *      {id, area, severity: broken|friction|note, what(쉬운 말), evidence, suggestedFix}
 *
 * 실행:  npm run audit:publisher:react -- --env <환경폴더>
 *        npm run audit:publisher:react -- --env <환경폴더> --selftest   (심어 둔 고장 부품으로 탐지기가 실제로 울리는지 증명)
 *        환경 만들기: bash scripts/publisher-audit/react-env-setup.sh <환경폴더>
 *        옵션 --zip <경로>(기본 assets/downloads/s1-ui-react.zip) · --keep(임시 앱 폴더를 지우지 않음) · --only S1Chip,S1Modal
 * 종료: 0 정상 실행(발견 사항이 있어도 0) · 1 자가시험 실패/실행 오류 · 2 크롬 또는 React 환경 없음
 *
 * 크롬·Vite 개발 서버는 자기 프로세스 그룹에서 띄우고 끝날 때(정상·오류·Ctrl+C 모두) 그룹째 정리한다.
 */
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

if (typeof WebSocket === "undefined") {
  const rerun = spawnSync(process.execPath, ["--experimental-websocket", "--no-warnings", fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: "inherit" });
  process.exit(rerun.status ?? 1);
}

const require = createRequire(import.meta.url);
const { spawnChrome: spawnGroup, killChromeTree: killGroup } = require("../lib/chrome-proc.js");
const { findChrome, launchChrome, openPage, sleep } = await import("./cdp.mjs");
const { installHelper } = await import("./page-helpers.mjs");
const Legacy = await import("./react-legacy.mjs");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const HARNESS = path.join(HERE, "react-harness");
const OUT_DIR = path.join(ROOT, "reports/publisher-audit/react");
const SHOTS_DIR = path.join(OUT_DIR, "shots");
const args = process.argv.slice(2);
const SELFTEST = args.includes("--selftest");
const LEGACY_RECORD = args.includes("--legacy-record");   // 0.22.0 zip 으로 돌려 옛 코드의 실측값(골든)을 기록한다
const LEGACY = LEGACY_RECORD || args.includes("--legacy"); // --only 로 좁혀도 "옛 코드 그대로" 시험은 돈다
const KEEP = args.includes("--keep");
const argValue = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
const ZIP = path.resolve(argValue("--zip") || path.join(ROOT, "assets/downloads/s1-ui-react.zip"));
const ENV = argValue("--env") || process.env.S1_REACT_ENV || null;
const ONLY = (argValue("--only") || "").split(",").filter(Boolean);
const PC = { width: 1280, height: 900, mobile: false };
const MOBILE = { width: 375, height: 812, mobile: true };

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
process.on("uncaughtException", (error) => { console.error(`[react-audit] 실행 오류: ${error.stack || error}`); cleanupAll(); process.exit(1); });

const log = (...parts) => console.log("[react-audit]", ...parts);
const js = (value) => JSON.stringify(value);

/* ── 발견 사항 모음 ─────────────────────────────────────────── */
const findings = [];
const notChecked = [];
const packageChecks = {};
function add(key, area, severity, what, evidence, suggestedFix, extra = {}) {
  findings.push({ id: `react:${key}`, area, severity, what, evidence: typeof evidence === "string" ? evidence : js(evidence), suggestedFix, ...extra });
}
function skip(check, reason) { notChecked.push({ check, reason: String(reason).slice(0, 400) }); packageChecks[check] = "notChecked"; }

/* ── 환경 ─────────────────────────────────────────────────── */
function versionOf(env, name) {
  try { return JSON.parse(fs.readFileSync(path.join(env, "node_modules", name, "package.json"), "utf8")).version; } catch { return null; }
}
function requireEnv() {
  const setup = "bash scripts/publisher-audit/react-env-setup.sh <환경폴더>";
  if (!ENV) {
    console.log(`[react-audit] React 환경 폴더를 알려 주세요: --env <폴더>\n  아직 없으면 먼저 만듭니다(npm 공식 저장소에서 React·Vite·TypeScript 약 60MB, 저장소 밖에 설치):\n    ${setup}`);
    process.exit(2);
  }
  const env = path.resolve(ENV);
  const need = ["react", "react-dom", "vite", "@vitejs/plugin-react"];
  const missing = need.filter((name) => !versionOf(env, name));
  if (missing.length) {
    console.log(`[react-audit] ${env} 에 ${missing.join(", ")} 가 없습니다. 검수기는 몰래 설치하지 않습니다 — 아래로 만드세요:\n    ${setup.replace("<환경폴더>", env)}`);
    process.exit(2);
  }
  const versions = Object.fromEntries(["react", "react-dom", "vite", "@vitejs/plugin-react", "typescript", "@types/react", "@types/react-dom"].map((name) => [name, versionOf(env, name)]));
  return { env, versions, vite: path.join(env, "node_modules/vite/bin/vite.js"), tsc: versionOf(env, "typescript") ? path.join(env, "node_modules/typescript/bin/tsc") : null };
}

function unzip(zipPath, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const result = spawnSync("unzip", ["-q", "-o", zipPath, "-d", dest], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`압축 해제 실패(${zipPath}): ${result.stderr || result.error}`);
}

const VITE_CONFIG = `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// 요즘 Vite+React 기본 틀 그대로(플러그인 하나). 개발 서버 첫 실행 때 페이지가 다시 읽히지 않게 React 만 미리 묶는다.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ["react", "react-dom", "react-dom/client", "react-dom/server", "react/jsx-dev-runtime", "react/jsx-runtime"] }
});
`;

/** 듣기(listener) 세기 — 앱보다 먼저 도는 일반 스크립트. StrictMode 이중 실행에서 두 번 붙거나 떼도 남는 듣기를 센다. */
const LISTENER_PROBE = `(()=>{const reg=new Map();let n=0;const ids=new WeakMap();
const key=(type,l,o)=>{if(!ids.has(l))ids.set(l,++n);const c=typeof o==="boolean"?o:!!(o&&o.capture);return type+"|"+ids.get(l)+"|"+c;};
const add=EventTarget.prototype.addEventListener,rem=EventTarget.prototype.removeEventListener;
EventTarget.prototype.addEventListener=function(type,l,o){if(l){let s=reg.get(this);if(!s){s=new Set();reg.set(this,s);}const k=key(type,l,o);s.add(k);if(o&&o.signal){o.signal.addEventListener("abort",()=>reg.get(this)?.delete(k));}}return add.call(this,type,l,o);};
EventTarget.prototype.removeEventListener=function(type,l,o){if(l){reg.get(this)?.delete(key(type,l,o));}return rem.call(this,type,l,o);};
const types=(t)=>[...(reg.get(t)||[])].map(k=>k.split("|")[0]);
window.__lis={globals(){return types(document).length+types(window).length+types(document.documentElement).length+types(document.body).length;},
globalTypes(){return {document:types(document),window:types(window),body:types(document.body)};},
subtree(root){let c=0;if(!root)return 0;for(const e of [root,...root.querySelectorAll("*")])c+=(reg.get(e)?.size||0);return c;},
subtreeTypes(root){const out=[];if(!root)return out;for(const e of [root,...root.querySelectorAll("*")]){const part=e.getAttribute("data-s1-part")||e.getAttribute("data-s1-component")||"";for(const t of types(e))out.push(e.tagName.toLowerCase()+(part?"["+part+"]":"")+":"+t);}return out.sort();}};})();`;

/** README 가 head 에 넣으라고 한 글꼴 링크(있으면). 개발자가 README 대로 한 모습을 만들려고 검수 앱에도 똑같이 넣는다. */
let README_FONT_LINK = null;
function indexHtml(entry) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>s1 react audit</title>${README_FONT_LINK ? `\n<link rel="stylesheet" href="${README_FONT_LINK}">` : ""}
<script>${LISTENER_PROBE}</script>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/${entry}"></script>
</body>
</html>
`;
}

/** 임시 React 앱 하나. src/s1-ui 에 zip 을 그대로 푼다(README 1단계 "그대로 넣습니다"). */
function makeApp(env, name, files) {
  const dir = path.join(env.env, "apps", `${name}-${process.pid}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  if (!KEEP) cleanups.push(() => fs.rmSync(dir, { recursive: true, force: true }));
  unzip(ZIP, path.join(dir, "src"));
  fs.writeFileSync(path.join(dir, "package.json"), `${js({ name: `s1-audit-${name}`, private: true, type: "module" })}\n`);
  fs.writeFileSync(path.join(dir, "vite.config.js"), VITE_CONFIG);
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

function runNode(cwd, argv, timeoutMs = 120000) {
  const result = spawnSync(process.execPath, argv, { cwd, encoding: "utf8", timeout: timeoutMs, env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
  return { code: result.status, out: `${result.stdout || ""}\n${result.stderr || ""}`.replace(/\x1b\[[0-9;]*m/g, ""), timedOut: !!(result.error && result.error.code === "ETIMEDOUT") };
}

function viteBuild(env, dir, extra = []) {
  const res = runNode(dir, [env.vite, "build", ...extra]);
  const lines = res.out.split("\n").map((l) => l.trim()).filter(Boolean);
  const warnings = lines.filter((l) => /\(!\)|\bwarning\b|\bwarn\b|deprecat/i.test(l));
  const errors = lines.filter((l) => /\berror\b|failed to resolve|could not resolve/i.test(l));
  return { ...res, ok: res.code === 0, warnings, errors };
}

function jsBytes(distDir) {
  let raw = 0;
  let gz = 0;
  const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) { const buf = fs.readFileSync(p); raw += buf.length; gz += zlib.gzipSync(buf).length; } } };
  if (fs.existsSync(distDir)) walk(distDir);
  return { raw, gz };
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => { const { port } = server.address(); server.close(() => resolve(port)); });
    server.on("error", reject);
  });
}

async function startDevServer(env, dir) {
  const port = await freePort();
  const child = spawnGroup(process.execPath, [env.vite, "--port", String(port), "--strictPort", "--host", "127.0.0.1"], { cwd: dir, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NO_COLOR: "1" } });
  let output = "";
  child.stdout.on("data", (c) => { output += c.toString(); });
  child.stderr.on("data", (c) => { output += c.toString(); });
  const stop = () => killGroup(child);
  cleanups.push(stop);
  const origin = `http://127.0.0.1:${port}`;
  const until = Date.now() + 30000;
  while (Date.now() < until) {
    try { const r = await fetch(`${origin}/`); if (r.ok) return { origin, stop, logs: () => output }; } catch { /* 아직 */ }
    await sleep(200);
  }
  stop();
  throw new Error(`Vite 개발 서버가 30초 안에 뜨지 않았습니다: ${output.slice(-400)}`);
}

/* ── 페이지 도구 ─────────────────────────────────────────── */
async function waitFor(page, expression, timeoutMs = 8000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try { if (await page.eval(expression)) return true; } catch { /* 아직 */ }
    await sleep(100);
  }
  return false;
}

async function capture(page, clip, beyond = false) {
  const { data } = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!beyond, clip: { ...clip, scale: 1 } });
  return data;
}

async function stageShot(page, file) {
  const box = await page.eval(`(()=>{const s=document.getElementById("stage"); if(!s) return null; const r=s.getBoundingClientRect(); let w=r.width,h=r.height; for(const e of s.querySelectorAll("*")){const q=e.getBoundingClientRect(); if(q.width&&q.height){w=Math.max(w,q.right-r.left);h=Math.max(h,q.bottom-r.top);}} return {x:r.left+scrollX,y:r.top+scrollY,width:Math.ceil(Math.min(w,1400)),height:Math.ceil(Math.min(h,1600))};})()`);
  if (!box || box.width < 1 || box.height < 1) return null;
  fs.writeFileSync(file, Buffer.from(await capture(page, box, true), "base64"));
  return path.relative(ROOT, file);
}

async function viewportShot(page, file) {
  const metrics = await page.send("Page.getLayoutMetrics");
  const vp = metrics.cssLayoutViewport;
  fs.writeFileSync(file, Buffer.from(await capture(page, { x: 0, y: 0, width: vp.clientWidth, height: vp.clientHeight }), "base64"));
  return path.relative(ROOT, file);
}

const MAX_ICONS = 12;
/** page-helpers 의 A.icons 와 같은 일을 하되, Vite 가 바꿔 쓴 url("data:…'…'") 처럼 따옴표가 섞인 주소에서도 깨지지 않게 이 검수기 페이지에서만 덮어쓴다. */
function installIconsOverride() {
  const A = window.__A;
  A.icons = () => {
    const list = [];
    let k = 0;
    for (const el of document.querySelectorAll("#stage *")) {
      for (const pseudo of [null, "::before", "::after"]) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === "none" || cs.content === "normal")) continue;
        const source = [cs.maskImage, cs.webkitMaskImage, cs.backgroundImage].find((value) => value && value.includes("url("));
        if (!source) continue;
        if (!A.vis(el)) continue;
        const m = /url\((["']?)(.*?)\1\)/.exec(source);
        const url = m ? m[2] : source.slice(0, 80);
        if (url.startsWith("data:") && !url.startsWith("data:image/svg")) continue;
        const r = el.getBoundingClientRect();
        const width = pseudo ? parseFloat(cs.width) || 0 : r.width;
        const height = pseudo ? parseFloat(cs.height) || 0 : r.height;
        const key = `i${k++}`;
        el.setAttribute(`data-audit-icon-${pseudo ? pseudo.slice(2) : "self"}`, key);
        list.push({ key, sel: A.sel(el), pseudo, url: url.slice(0, 120), box: { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }, w: width, h: height });
      }
    }
    return list;
  };
  return true;
}
async function iconPaint(page) {
  const icons = (await page.call(() => window.__A.icons())).filter((icon) => !/audit/.test(icon.sel || ""));
  await page.eval(`(()=>{const s=document.createElement("style"); s.id="__audit_nt"; s.textContent="*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}"; document.head.append(s); document.activeElement&&document.activeElement.blur(); return true;})()`);
  await sleep(60);
  const view = await page.eval("({w: innerWidth, h: innerHeight, x: scrollX, y: scrollY})");
  const results = [];
  for (const icon of icons.slice(0, MAX_ICONS)) {
    if (icon.w === 0 || icon.h === 0) { results.push({ sel: icon.sel, pseudo: icon.pseudo, url: icon.url, painted: false, reason: "크기 0" }); continue; }
    const pad = 3;
    const clip = { x: Math.max(0, icon.box.x - pad), y: Math.max(0, icon.box.y - pad), width: Math.max(icon.box.w, icon.w) + pad * 2, height: Math.max(icon.box.h, icon.h) + pad * 2 };
    const pseudoName = icon.pseudo ? icon.pseudo.slice(2) : "self";
    const beyond = clip.x + clip.width > view.x + view.w || clip.y + clip.height > view.y + view.h || clip.y < view.y;
    const before = await capture(page, clip, beyond);
    await page.eval(`(()=>{const s=document.createElement("style"); s.id="__audit_off"; s.textContent=${js(`[data-audit-icon-${pseudoName}="${icon.key}"]${icon.pseudo || ""}{opacity:0!important}`)}; document.head.append(s); return true;})()`);
    const after = await capture(page, clip, beyond);
    await page.eval(`document.getElementById("__audit_off").remove(), true`);
    results.push({ sel: icon.sel, pseudo: icon.pseudo, url: icon.url, painted: before !== after });
  }
  await page.eval(`(()=>{document.getElementById("__audit_nt")?.remove(); for(const e of document.querySelectorAll("[data-audit-icon-self],[data-audit-icon-before],[data-audit-icon-after]")){e.removeAttribute("data-audit-icon-self");e.removeAttribute("data-audit-icon-before");e.removeAttribute("data-audit-icon-after");} return true;})()`);
  return { total: icons.length, checked: results.length, painted: results.filter((r) => r.painted).length, blank: results.filter((r) => !r.painted) };
}

async function renderedFont(page) {
  const probe = await page.call(() => window.__A.fontProbe());
  if (!probe.sel) return { family: null, platform: null };
  try {
    const { root } = await page.send("DOM.getDocument", { depth: 0 });
    const { nodeId } = await page.send("DOM.querySelector", { nodeId: root.nodeId, selector: "[data-audit-font]" });
    const { fonts } = await page.send("CSS.getPlatformFontsForNode", { nodeId });
    await page.eval(`document.querySelector("[data-audit-font]")?.removeAttribute("data-audit-font"), true`);
    return { family: probe.family, platform: fonts.map((font) => `${font.familyName}${font.isCustomFont ? "(웹폰트)" : "(설치 글꼴)"}`) };
  } catch (error) { return { family: probe.family, platform: null, error: error.message }; }
}

function logMark(page) { return { e: page.consoleErrors.length, w: page.consoleWarnings.length, x: page.exceptions.length }; }
function logSince(page, mark) {
  return {
    errors: page.consoleErrors.slice(mark.e).map((m) => m.text),
    warnings: page.consoleWarnings.slice(mark.w).map((m) => m.text),
    exceptions: page.exceptions.slice(mark.x).map((m) => m.text)
  };
}
const short = (text, n = 220) => String(text).replace(/\s+/g, " ").slice(0, n);
const isReactWarning = (text) => /Warning:|React does not recognize|unique "key"|changing an? (un)?controlled|hydrat|act\(|Invalid DOM property|Received `(true|false)` for a non-boolean|Function components cannot be given refs|forwardRef|Each child in a list/i.test(text);

async function mount(page, spec) {
  await page.eval(`window.__s1.clearEvents(), window.__s1.mount(${js(spec)})`);
  await sleep(spec.wait ?? 250);
}
const events = (page) => page.eval("window.__s1.ev.map(e=>({label:e.label, detail:e.detail}))");
const count = (list, label) => list.filter((e) => e.label === label).length;

/* ── 부품 목록·슬롯 ─────────────────────────────────────── */
function slotKeysOf(file, reactDir) {
  try {
    const source = fs.readFileSync(path.join(reactDir, file), "utf8");
    const keys = new Set();
    for (const m of source.matchAll(/slot\(partScope, "([\w]+)"\)\.content/g)) keys.add(m[1]);
    return [...keys];
  } catch { return []; }
}
const isMobileOnly = (name) => /Mobile|BottomSheet/.test(name);
function casesFor(catalog, reactDir) {
  const out = [];
  for (const entry of catalog) {
    if (!entry.name) continue;
    if (ONLY.length && !ONLY.includes(entry.name)) continue;
    const breaks = entry.breaks.length ? entry.breaks : ["pc"];
    const slots = entry.planted ? ["label"] : slotKeysOf(entry.file, reactDir);
    for (const breakName of breaks) {
      const mobile = /mobile/.test(breakName) || isMobileOnly(entry.name);
      out.push({ name: entry.name, file: entry.file, breakName, multiBreak: breaks.length > 1, slots, parts: entry.parts, legacyParts: entry.legacyParts || [], viewport: mobile ? "mobile" : "pc", planted: !!entry.planted });
    }
  }
  return out;
}

/* ── 부품 한 칸 검사(일반 탐지기) ───────────────────────── */
async function auditCase(page, c, { shots = true } = {}) {
  const label = `${c.name}${c.multiBreak ? `[${c.breakName}]` : ""}`;
  const result = { component: c.name, breakName: c.breakName, viewport: c.viewport, checks: {}, findings: [], notChecked: [] };
  const local = (key, area, severity, what, evidence, suggestedFix) => result.findings.push({ id: `react:${c.name}:${c.breakName}:${key}`, area, severity, what, evidence: typeof evidence === "string" ? evidence : js(evidence), suggestedFix, component: c.name, breakName: c.breakName });
  const nc = (check, reason) => { result.checks[check] = "notChecked"; result.notChecked.push({ check: `${label} ${check}`, reason: String(reason).slice(0, 300) }); };
  const baseProps = c.multiBreak ? { breakName: c.breakName } : {};

  /* ⓪ 한 번 붙였다 떼기(예열) — React·런타임이 페이지에 한 번만 다는 공용 듣기(위임 클릭 등)를 기준선에 미리 넣는다.
        그래야 "처음 한 번" 을 새는 것·두 번 붙는 것으로 오판하지 않는다. */
  const preWarm = await page.eval("window.__lis.globals()");
  await mount(page, { name: c.name, props: baseProps, strict: true, wait: 150 });
  await page.eval("window.__s1.unmount()");
  await sleep(80);
  await page.eval("document.documentElement.style.overflow='';document.body.style.overflow='';true");
  result.oneTimeGlobalListeners = (await page.eval("window.__lis.globals()")) - preWarm;
  /* ① StrictMode 로 붙이기 */
  const baseGlobals = await page.eval("window.__lis.globals()");
  const baseOverflow = await page.eval("[document.documentElement.style.overflow, document.body.style.overflow].join('|')");
  let mark = logMark(page);
  await mount(page, { name: c.name, props: baseProps, strict: true });
  const info = await page.eval(`(()=>{const s=document.getElementById("stage"); const r=s.querySelector("[data-s1-component]"); if(!r) return {root:false, stageText:s.textContent.slice(0,80)}; const b=r.getBoundingClientRect(); return {root:true, component:r.getAttribute("data-s1-component"), hidden:r.hidden||!!r.closest("[hidden]"), w:Math.round(b.width), h:Math.round(b.height), subtree: window.__lis.subtree(r), subtreeTypes: window.__lis.subtreeTypes(r), globals: window.__lis.globals(), overflow:[document.documentElement.style.overflow, document.body.style.overflow].join('|')};})()`);
  let logs = logSince(page, mark);
  result.mount = info;
  const errs = [...logs.exceptions, ...logs.errors];
  const reactWarn = errs.filter(isReactWarning);
  const otherErr = errs.filter((t) => !isReactWarning(t));
  result.checks.consoleClean = errs.length === 0 && logs.warnings.length === 0 ? "pass" : "fail";
  if (reactWarn.length) local("react-warning", "console", "friction", `${label} 를 StrictMode 로 그리면 React 경고가 콘솔에 찍힙니다.`, reactWarn.slice(0, 3).map((t) => short(t)).join(" | "), "경고 문구가 가리키는 prop·key·제어형 처리를 생성기에서 바로잡기");
  if (otherErr.length) local("console-error", "console", "broken", `${label} 를 그리기만 해도 콘솔에 오류가 납니다.`, otherErr.slice(0, 3).map((t) => short(t)).join(" | "), "오류가 나는 부품 생성 코드/런타임 확인");
  if (logs.warnings.length) local("console-warning", "console", "note", `${label} 를 그리면 콘솔 경고가 찍힙니다.`, logs.warnings.slice(0, 2).map((t) => short(t)).join(" | "), "경고 원인 확인");
  if (!info.root) {
    local("no-root", "render", "broken", `${label} 가 화면에 아무 부품도 그리지 않습니다.`, `stage: "${info.stageText}"`, "생성된 JSX 확인");
    await page.eval("window.__s1.unmount()");
    return result;
  }
  /* ② 크기·아이콘·글꼴·스크린샷 */
  if (info.hidden) { result.checks.size = "hiddenByDesign"; nc("size", "처음에 닫힌 채(hidden) 그려지는 부품 — 크기·아이콘은 열린 상태 시나리오에서 본다"); }
  else {
    result.checks.size = info.w > 0 && info.h > 0 ? "pass" : "fail";
    if (result.checks.size === "fail") local("zero-size", "render", "broken", `${label} 가 크기 0 으로 그려져 보이지 않습니다.`, `${info.w}×${info.h}`, "CSS 연결 확인");
    try {
      const icons = await iconPaint(page);
      result.icons = { total: icons.total, checked: icons.checked, painted: icons.painted };
      result.checks.icons = icons.checked === 0 ? "none" : (icons.blank.length ? "fail" : "pass");
      if (icons.blank.length) local("icon-blank", "icon", "broken", `${label} 의 아이콘 ${icons.blank.length}/${icons.checked}개가 빈 칸으로 그려집니다.`, icons.blank.slice(0, 3).map((i) => `${i.sel}${i.pseudo || ""} ← ${i.url}`).join(" | "), "아이콘 경로가 Vite 묶음 뒤에도 살아 있는지 확인");
    } catch (error) { nc("icons", error.message); }
    try { result.font = await renderedFont(page); } catch (error) { nc("font", error.message); }
  }
  if (shots) {
    try { result.screenshot = await stageShot(page, path.join(SHOTS_DIR, `${c.name}-${c.breakName}.png`)); } catch (error) { nc("screenshot", error.message); }
  }
  /* ③ prop 을 바꾸면 화면이 따라오나 — 첫 글자 슬롯에 표식 A → B */
  const slot = c.slots.find((k) => !/icon|close|overlay|backdrop|check|control/i.test(k));
  if (slot) {
    mark = logMark(page);
    await page.eval(`window.__s1.set(${js({ ...baseProps, parts: { [slot]: "⟦A⟧" } })})`);
    await sleep(120);
    const a = await page.eval(`document.getElementById("stage").textContent.includes("⟦A⟧")`);
    await page.eval(`window.__s1.set(${js({ ...baseProps, parts: { [slot]: "⟦B⟧" } })})`);
    await sleep(120);
    const b = await page.eval(`(()=>{const t=document.getElementById("stage").textContent; return {b:t.includes("⟦B⟧"), a:t.includes("⟦A⟧")};})()`);
    const ok = a && b.b && !b.a;
    result.checks.propUpdate = ok ? "pass" : "fail";
    if (!ok) local("prop-stale", "react-state", "broken", `${label} 에 넘긴 값(parts.${slot})을 바꿔도 화면 글자가 따라 바뀌지 않습니다.`, `처음 값 보임=${a} · 바꾼 값 보임=${b.b} · 옛 값 남음=${b.a}`, "부품이 첫 값만 기억하지 않게(상태 복사 금지) — 받은 prop 을 그대로 그리기");
    const l2 = logSince(page, mark);
    if (l2.exceptions.length || l2.errors.length) local("prop-update-error", "react-state", "broken", `${label} 의 값을 바꿔 다시 그릴 때 오류가 납니다.`, [...l2.exceptions, ...l2.errors].slice(0, 2).map((t) => short(t)).join(" | "), "다시 그리기 경로 확인");
    /* 슬롯 겹침 — 슬롯마다 다른 표식을 넣어 몇 번 나오나 센다 */
    if (c.slots.length) {
      const parts = Object.fromEntries(c.slots.map((k) => [k, `⟦${k}⟧`]));
      await page.eval(`window.__s1.set(${js({ ...baseProps, parts })})`);
      await sleep(120);
      const counts = await page.eval(`(()=>{const t=document.getElementById("stage").textContent; const out={}; for(const k of ${js(c.slots)}){ out[k]=t.split("⟦"+k+"⟧").length-1; } return out;})()`);
      /* 0.22.0 에서 쓰던 슬롯 이름(LEGACY_PARTS)은 옛 코드가 그대로 돌게 일부러 여러 자리를 함께 채운다 — 겹침으로 세지 않는다. */
      const multi = Object.entries(counts).filter(([k, n]) => n > 1 && !(c.legacyParts || []).includes(k));
      result.slotCounts = counts;
      result.checks.slotUnique = multi.length ? "fail" : "pass";
      if (multi.length) local("slot-shared", "api", "friction", `${label} 는 서로 다른 자리가 같은 슬롯 이름을 함께 씁니다 — 한 곳 글자를 바꾸면 다른 곳까지 같이 바뀝니다.`, multi.map(([k, n]) => `parts.${k} → ${n}군데에 동시에 들어감`).join(" · "), "자리마다 다른 슬롯 이름(예: cancelLabel·confirmLabel)을 주거나 목록 prop 으로 받기");
    }
  } else nc("propUpdate", "글자 슬롯이 없는 부품");
  /* className 갱신 */
  await page.eval(`window.__s1.set(${js({ ...baseProps, className: "audit-a" })})`);
  await sleep(80);
  await page.eval(`window.__s1.set(${js({ ...baseProps, className: "audit-b" })})`);
  await sleep(80);
  const cls = await page.eval(`(()=>{const r=document.querySelector("#stage [data-s1-component]"); return r ? r.getAttribute("class") : null;})()`);
  result.checks.className = cls && cls.includes("audit-b") && !cls.includes("audit-a") ? "pass" : "fail";
  if (result.checks.className === "fail") local("classname", "api", "friction", `${label} 에 준 className 이 루트에 제대로 붙지 않습니다.`, `class="${cls}"`, "루트에 className 을 그대로(또는 합쳐서) 붙이기");
  /* ④ 떼기 — 듣기·스크롤 잠금 */
  mark = logMark(page);
  await page.eval("window.__s1.unmount()");
  await sleep(150);
  const after = await page.eval(`({globals: window.__lis.globals(), types: window.__lis.globalTypes(), overflow:[document.documentElement.style.overflow, document.body.style.overflow].join('|')})`);
  logs = logSince(page, mark);
  const leaked = after.globals - baseGlobals;
  result.unmount = { leakedGlobalListeners: leaked, overflow: after.overflow };
  result.checks.unmountClean = leaked <= 0 && after.overflow === baseOverflow ? "pass" : "fail";
  if (leaked > 0) local("listener-leak", "lifecycle", "broken", `${label} 를 화면에서 떼어도 문서(document/window)에 단 듣기 ${leaked}개가 남습니다 — 화면을 오갈수록 쌓입니다.`, `떼기 전 ${baseGlobals} → 뗀 뒤 ${after.globals} · 남은 종류 ${js(after.types).slice(0, 200)}`, "useEffect 정리(return)에서 removeEventListener / destroy 가 전부 떼는지 확인");
  if (after.overflow !== baseOverflow) {
    local("scroll-lock-left", "lifecycle", "broken", `${label} 를 떼어도 페이지 스크롤 잠금이 풀리지 않습니다.`, `overflow(html|body) ${baseOverflow} → ${after.overflow}`, "destroy 때 스크롤 잠금 해제");
    await page.eval("document.documentElement.style.overflow='';document.body.style.overflow='';true");
  }
  if (logs.exceptions.length || logs.errors.length) local("unmount-error", "lifecycle", "broken", `${label} 를 뗄 때 오류가 납니다.`, [...logs.exceptions, ...logs.errors].slice(0, 2).map((t) => short(t)).join(" | "), "destroy 경로 확인");
  /* ⑤ StrictMode 이중 실행 — StrictMode 아닌 때와 듣기 수 비교 */
  const base2 = await page.eval("window.__lis.globals()");
  await mount(page, { name: c.name, props: baseProps, strict: false });
  const plain = await page.eval(`(()=>{const r=document.querySelector("#stage [data-s1-component]"); return {subtree: window.__lis.subtree(r), subtreeTypes: window.__lis.subtreeTypes(r), globals: window.__lis.globals()};})()`);
  await page.eval("window.__s1.unmount()");
  await sleep(100);
  await page.eval("document.documentElement.style.overflow='';document.body.style.overflow='';true");
  const strictGlobals = info.globals - baseGlobals;
  const plainGlobals = plain.globals - base2;
  result.strictMode = { strictSubtree: info.subtree, plainSubtree: plain.subtree, strictGlobals, plainGlobals };
  const doubled = info.subtree > plain.subtree || strictGlobals > plainGlobals;
  result.checks.strictModeSingleBind = doubled ? "fail" : "pass";
  const extraTypes = (() => { const rest = [...plain.subtreeTypes]; const out = []; for (const t of info.subtreeTypes) { const i = rest.indexOf(t); if (i >= 0) rest.splice(i, 1); else out.push(t); } return out; })();
  result.strictMode.extraInStrict = extraTypes;
  if (doubled) local("strict-double-bind", "lifecycle", "broken", `${label} 는 React 개발 모드(StrictMode)에서 동작 스크립트가 두 번 붙습니다 — 한 번 눌러도 두 번 반응할 수 있습니다.`, `살아 있는 듣기 수 StrictMode: 부품 ${info.subtree} + 문서 ${strictGlobals} · 일반: 부품 ${plain.subtree} + 문서 ${plainGlobals} · StrictMode 에만 더 붙은 것: ${extraTypes.slice(0, 6).join(", ") || "(문서 쪽)"}`, "init 을 같은 요소에 두 번 불러도 한 번만 붙게, 정리(return) 때 전부 떼기");
  /* ⑥ 서버 마크업 위에 hydrate — 어긋남 경고 */
  mark = logMark(page);
  await page.eval(`window.__s1.clearEvents(), window.__s1.mount(${js({ name: c.name, props: baseProps, strict: true, hydrate: true })})`);
  await sleep(250);
  logs = logSince(page, mark);
  const evs = await events(page);
  const hydrationIssues = [...logs.errors, ...logs.exceptions].filter((t) => /hydrat|did not match|server rendered/i.test(t)).concat(evs.filter((e) => e.label === "recoverable-error").map((e) => String(e.detail)));
  result.checks.hydration = hydrationIssues.length ? "fail" : "pass";
  if (hydrationIssues.length) local("hydration", "ssr", "broken", `${label} 를 서버에서 그린 뒤 브라우저에서 이어 붙이면(hydrate) 마크업이 어긋난다는 오류가 납니다.`, hydrationIssues.slice(0, 2).map((t) => short(t)).join(" | "), "서버·브라우저 첫 그리기가 같은 마크업을 내게(useId·기본값)");
  await page.eval("window.__s1.unmount()");
  await page.eval("document.documentElement.style.overflow='';document.body.style.overflow='';true");
  await sleep(60);
  return result;
}

/* ── 상호작용 시나리오(실제 React 상태) ─────────────────── */
async function rectOf(page, selector) {
  return page.eval(`(()=>{const e=document.querySelector(${js(selector)}); if(!e) return null; e.scrollIntoView({block:"center"}); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, w:r.width, h:r.height};})()`);
}
async function click(page, selector) {
  const r = await rectOf(page, selector);
  if (!r || !r.w || !r.h) throw new Error(`누를 요소가 없거나 크기 0: ${selector}`);
  await page.mouseClickAt(r.x, r.y);
  await sleep(150);
}
/** 겹쳐 덮인 바탕(시트 뒤 어두운 판)을 누를 때 — 가운데는 패널에 덮이니 왼쪽 위 모서리 가까이를 누른다. */
async function clickCorner(page, selector) {
  const r = await page.eval(`(()=>{const e=document.querySelector(${js(selector)}); if(!e) return null; const b=e.getBoundingClientRect(); return {x:b.left+8, y:b.top+8, w:b.width, h:b.height};})()`);
  if (!r || !r.w || !r.h) throw new Error(`누를 요소가 없거나 크기 0: ${selector}`);
  await page.mouseClickAt(r.x, r.y);
  await sleep(150);
}
const attr = (page, selector, name) => page.eval(`document.querySelector(${js(selector)})?.getAttribute(${js(name)}) ?? null`);
const visible = (page, selector) => page.eval(`(()=>{const e=document.querySelector(${js(selector)}); return !!e && window.__A.vis(e);})()`);
const scrollLock = (page) => page.eval("[document.documentElement.style.overflow, document.body.style.overflow].filter(Boolean).join('|') || ''");
const activeInside = (page, selector) => page.eval(`!!document.querySelector(${js(selector)})?.contains(document.activeElement)`);
const resetLock = (page) => page.eval("document.documentElement.style.overflow='';document.body.style.overflow='';true");

/** 부품 단위 검사에서 이미 보고한 콘솔 문구 — 시나리오에서 같은 문구를 또 올리지 않는다 */
const seenConsole = new Set();
const hangs = [];
function scenarioRunner(holder, which, results) {
  return async function scenario(key, title, fn, attempt = 0) {
    const page = holder[which];
    log(`  시나리오 ${key}${attempt ? " (새 페이지에서 다시)" : ""}`);
    const record = { key, title, checks: [], status: "pass" };
    const pending = [];
    const check = (name, ok, evidence, severity = "broken", suggestedFix = "") => {
      record.checks.push({ name, ok: !!ok, severity: ok ? null : severity, evidence: String(evidence ?? "") });
      if (!ok) {
        if (record.status === "pass") record.status = "fail";
        pending.push([`${key}:${record.checks.length}`, "interaction", severity, `${title} — ${name}`, String(evidence ?? ""), suggestedFix]);
      }
    };
    const mark = logMark(page);
    try {
      await fn(check);
    } catch (error) {
      record.status = record.checks.length ? "partial" : "notChecked";
      record.error = error.message;
      notChecked.push({ check: `시나리오 ${key}${record.checks.length ? "(일부)" : ""}`, reason: error.message.slice(0, 300) });
    }
    /* 페이지가 멈췄으면(무한 반복 등) 그 사실을 남기고 새 페이지로 갈아 끼운다 — 다음 시나리오까지 끌려가지 않게 */
    const alive = await Promise.race([page.eval("1").then(() => true).catch(() => false), sleep(4000).then(() => false)]);
    if (!alive) {
      record.status = record.checks.length ? "partial" : "notChecked";
      record.hung = true;
      const lastStep = record.checks.length ? record.checks[record.checks.length - 1].name : "(시작 직후)";
      try { await page.close(); } catch { /* 무시 */ }
      holder[which] = await holder.reopen(which);
      if (attempt === 0) {
        /* 첫 번째 멈춤 — 앞 시나리오들이 남긴 상태 탓일 수 있으니 새 페이지에서 한 번 더 돌린다(결과는 그쪽을 쓴다) */
        if (record.error) notChecked.pop();
        hangs.push({ key, lastStep });
        return { hung: true };
      }
      add(`${key}:hang`, "interaction", "broken", `${title} — 쓰는 도중 페이지가 멈춥니다(응답 없음). 새 페이지에서 다시 해도 멈췄습니다.`, `${record.error || ""} · 마지막 확인: ${lastStep}`.slice(0, 300), "멈추는 지점의 런타임 반복(포커스 되돌리기·관찰자) 확인");
      for (const f of pending) add(...f);
      results.push(record);
      return record;
    }
    if (attempt === 1) {
      const first = hangs.find((h) => h.key === key);
      record.hungOnFirstTry = first || true;
      add(`${key}:hang-once`, "interaction", "note", `${title} — 검수기가 앞 시나리오들을 한 페이지에서 이어 돌린 뒤에는 이 시나리오에서 페이지가 멈췄지만, 새 페이지에서는 멈추지 않았습니다(원인 미확정 — 화면을 오래 쓰면 생길 수 있는 누적 문제인지 검수기 탓인지 가려지지 않음).`, `첫 시도 마지막 확인: ${first ? first.lastStep : "?"}`, "같은 순서로 손으로 재현해 보기");
    }
    for (const f of pending) add(...f);
    const logs = logSince(page, mark);
    const errs = [...logs.exceptions, ...logs.errors].filter((t) => !seenConsole.has(short(t, 120)));
    for (const t of errs) seenConsole.add(short(t, 120));
    record.console = errs.slice(0, 4).map((t) => short(t, 300));
    if (errs.length) {
      const reactish = errs.filter(isReactWarning);
      const crashes = errs.filter((t) => !isReactWarning(t));
      if (crashes.length) add(`${key}:console`, "console", "broken", `${title} — 쓰는 도중 콘솔에 오류가 납니다.`, crashes.slice(0, 2).map((t) => short(t, 300)).join(" | "), "오류 문구의 원인 확인");
      if (reactish.length) add(`${key}:react-warning`, "console", "friction", `${title} — 쓰는 도중 React 경고가 찍힙니다.`, reactish.slice(0, 2).map((t) => short(t, 300)).join(" | "), "경고가 가리키는 prop·제어형 처리 바로잡기");
    }
    try { await page.eval("window.__s1.unmount()"); await resetLock(page); } catch { /* 무시 */ }
    await sleep(80);
    results.push(record);
    return record;
  };
}

async function interactionScenarios(holder) {
  const results = [];
  const pcRun = scenarioRunner(holder, "pc", results);
  const moRun = scenarioRunner(holder, "mobile", results);
  let P = holder.pc;
  let M = holder.mobile;
  /* 페이지를 갈아 끼웠을 수 있으니 시나리오마다 최신 페이지를 쓴다 */
  const pc = async (key, title, fn) => { P = holder.pc; let r = await pcRun(key, title, fn, 0); P = holder.pc; if (r.hung && !r.key) { r = await pcRun(key, title, fn, 1); P = holder.pc; } return r; };
  const mo = async (key, title, fn) => { M = holder.mobile; let r = await moRun(key, title, fn, 0); M = holder.mobile; if (r.hung && !r.key) { r = await moRun(key, title, fn, 1); M = holder.mobile; } return r; };
  const want = (name) => !ONLY.length || ONLY.includes(name);

  if (want("S1Input")) await pc("input-controlled", "입력칸(S1Input)을 React 상태로 제어", async (check) => {
    await mount(P, { scenario: "controlledInput" });
    await click(P, '#stage [data-s1-part="control"]');
    await P.eval(`(()=>{const i=document.querySelector('#stage [data-s1-part="control"]'); i.setSelectionRange(i.value.length,i.value.length); return true;})()`);
    await P.eval("window.__s1.clearEvents()");
    await P.typeText("다");
    await sleep(100);
    let ev = await events(P);
    const state = await P.eval("window.__s1.ctl.input.get()");
    check("글자 하나 치면 onChange 가 한 번 온다", count(ev, "input:onChange") === 1, `onChange ${count(ev, "input:onChange")}회`);
    check("친 글자가 React 상태에 들어간다", state === "가나다", `상태 "${state}"`);
    await P.eval(`window.__s1.ctl.input.set("새 값")`);
    await sleep(100);
    const dom = await P.eval(`document.querySelector('#stage [data-s1-part="control"]').value`);
    check("상태를 바꾸면 입력칸 글자가 따라 바뀐다", dom === "새 값", `입력칸 "${dom}"`);
    const clearVisible = await visible(P, '#stage [data-action="clear"]');
    if (clearVisible) {
      await P.eval("window.__s1.clearEvents()");
      await click(P, '#stage [data-action="clear"]');
      ev = await events(P);
      const domAfter = await P.eval(`document.querySelector('#stage [data-s1-part="control"]').value`);
      const stateAfter = await P.eval("window.__s1.ctl.input.get()");
      check("지우기(X) 버튼을 누르면 React 상태도 비워진다(onChange 가 온다)", stateAfter === "" && domAfter === "", `입력칸 "${domAfter}" · React 상태 "${stateAfter}" · onChange ${count(ev, "input:onChange")}회 · onClear ${count(ev, "input:onClear")}회`, "broken", "지우기 때 React 가 듣는 input 이벤트를 쏘거나(네이티브 setter + input 이벤트), onClear 로 상태를 비우라고 README 에 적기");
    } else check("값이 있을 때 지우기(X) 버튼이 보인다", false, "제어형 value 로 값을 넣었는데 지우기 버튼이 hidden — 런타임은 사용자가 친 글자에만 반응", "friction", "value prop 변화에도 지우기 버튼 표시를 맞추기");
  });

  if (want("S1Checkbox")) await pc("checkbox-controlled", "체크박스(S1Checkbox)를 React 상태로 제어", async (check) => {
    await mount(P, { scenario: "controlledCheckbox" });
    await click(P, '#stage [data-s1-part="label"]');
    const ev = await events(P);
    const state = await P.eval("window.__s1.ctl.checkbox.get()");
    const dom = await P.eval(`document.querySelector('#stage [data-s1-part="control"]').checked`);
    check("라벨을 누르면 onChange 가 한 번 온다", count(ev, "checkbox:onChange") === 1, `onChange ${count(ev, "checkbox:onChange")}회`);
    check("누르면 상태·화면이 함께 켜진다", state === true && dom === true, `상태 ${state} · 화면 ${dom}`);
    await P.eval("window.__s1.ctl.checkbox.set(false)");
    await sleep(100);
    check("상태를 끄면 화면도 꺼진다", (await P.eval(`document.querySelector('#stage [data-s1-part="control"]').checked`)) === false, "set(false) 후");
  });

  if (want("S1Chip")) await pc("chip-controlled", "칩(S1Chip) 제어형 selected/onSelectedChange", async (check) => {
    const chip = '#stage [data-s1-component="chip"]';
    await mount(P, { scenario: "controlledChip" });
    await click(P, chip);
    let ev = await events(P);
    check("한 번 누르면 onSelectedChange 가 한 번(true) 온다", count(ev, "chip:onSelectedChange") === 1 && ev.find((e) => e.label === "chip:onSelectedChange")?.detail === true, js(ev.filter((e) => e.label === "chip:onSelectedChange").map((e) => e.detail)));
    check("부모가 상태를 바꾸면 칩이 켜진다", (await attr(P, chip, "aria-pressed")) === "true", `aria-pressed=${await attr(P, chip, "aria-pressed")}`);
    await P.eval("window.__s1.clearEvents()");
    await click(P, chip);
    ev = await events(P);
    check("다시 누르면 꺼진다(false 한 번)", count(ev, "chip:onSelectedChange") === 1 && (await attr(P, chip, "aria-pressed")) === "false", `${js(ev.filter((e) => e.label === "chip:onSelectedChange").map((e) => e.detail))} · aria-pressed=${await attr(P, chip, "aria-pressed")}`);
    await mount(P, { scenario: "lockedChip" });
    await click(P, chip);
    check("제어형인데 부모가 값을 안 바꾸면 눌러도 모양이 그대로다", (await attr(P, chip, "aria-pressed")) === "false", `aria-pressed=${await attr(P, chip, "aria-pressed")}`);
    await mount(P, { scenario: "uncontrolledChip" });
    const first = await attr(P, chip, "aria-pressed");
    check("비제어형 defaultSelected 가 처음 모양에 반영된다", first === "true", `aria-pressed=${first}`);
    await P.eval("window.__s1.clearEvents()");
    await click(P, chip);
    ev = await events(P);
    check("비제어형은 눌러서 꺼지고 onSelectedChange·onChange 가 각각 한 번", (await attr(P, chip, "aria-pressed")) === "false" && count(ev, "uchip:onSelectedChange") === 1 && count(ev, "uchip:onChange") === 1, `aria-pressed=${await attr(P, chip, "aria-pressed")} · onSelectedChange ${count(ev, "uchip:onSelectedChange")}회 · onChange ${count(ev, "uchip:onChange")}회`);
  });

  if (want("S1Chip")) await pc("chip-group", "칩 묶음 하나만 고르기", async (check) => {
    await mount(P, { scenario: "chipGroupState" });
    await click(P, '#stage [data-s1-component="chip"]:nth-child(2)');
    const pressed = await P.eval(`[...document.querySelectorAll('#stage [data-s1-component="chip"]')].map(c=>c.getAttribute("aria-pressed"))`);
    check("React 상태로 묶으면 누른 칩 하나만 켜진다", js(pressed) === js(["false", "true", "false"]), `aria-pressed ${js(pressed)}`);
    await mount(P, { scenario: "chipGroupAuto" });
    await click(P, '#stage [data-s1-component="chip"]:nth-child(3)');
    const ev = await events(P);
    const auto = await P.eval(`[...document.querySelectorAll('#stage [data-s1-component="chip"]')].map(c=>c.getAttribute("aria-pressed"))`);
    check('data-s1-select="single" 로 감싸면 부품이 알아서 하나만 켠다', js(auto) === js(["false", "false", "true"]), `aria-pressed ${js(auto)}`);
    check("묶음에서 하나 고를 때 onChange 는 누른 칩 한 번(+꺼진 칩 한 번까지)", count(ev, "chipGroupAuto:onChange") >= 1 && count(ev, "chipGroupAuto:onChange") <= 2, `onChange ${count(ev, "chipGroupAuto:onChange")}회 ${js(ev.filter((e) => e.label === "chipGroupAuto:onChange").map((e) => e.detail?.detail))}`.slice(0, 300), "friction");
  });

  if (want("S1Modal")) await pc("modal-open-prop", "모달(S1Modal) 을 React 상태 open 으로 열기", async (check) => {
    await mount(P, { scenario: "modalOpenProp" });
    await P.eval("window.__s1.ctl.modal.set(true)");
    await sleep(250);
    const shown = await visible(P, '#stage [data-s1-component="modal"] [role="dialog"]');
    check("open={true} 를 주면 모달이 열린다(옛 방식: onOpen/onClose 로 상태를 되돌린다)", shown, `보임=${shown}`, "broken", "S1Modal·S1ModalContent 에도 S1BottomSheet 처럼 open prop(+onClose 로 상태 되돌리기)을 생성하기");
  });

  if (want("S1Modal")) await pc("modal-declarative", "모달 — 배포본 런타임의 data-s1-open 길로 열기(README 에 없음)", async (check) => {
    await mount(P, { scenario: "modalDeclarative" });
    const before = await scrollLock(P);
    await click(P, "#modal-opener");
    await sleep(200);
    let ev = await events(P);
    check("열린다", await visible(P, '#audit-modal [role="dialog"]'), "data-s1-open 클릭 후");
    check("onOpen 이 한 번 온다", count(ev, "modal:onOpen") === 1, `onOpen ${count(ev, "modal:onOpen")}회`);
    check("열리면 스크롤이 잠긴다", (await scrollLock(P)) !== before, `overflow ${before || "(없음)"} → ${await scrollLock(P) || "(없음)"}`, "friction");
    check("열리면 초점이 창 안으로", await activeInside(P, "#audit-modal"), `초점: ${await P.eval("document.activeElement?.outerHTML?.slice(0,80)")}`);
    try { await viewportShot(P, path.join(SHOTS_DIR, "scenario-modal-open.png")); } catch { /* 무시 */ }
    await P.key("Escape");
    await sleep(200);
    ev = await events(P);
    check("Esc 로 닫힌다", !(await visible(P, '#audit-modal [role="dialog"]')), "Esc 후");
    check("onClose 가 한 번 온다", count(ev, "modal:onClose") === 1, `onClose ${count(ev, "modal:onClose")}회`);
    check("닫히면 초점이 연 버튼으로 돌아온다", await P.eval(`document.activeElement?.id === "modal-opener"`), `초점: ${await P.eval("document.activeElement?.id || document.activeElement?.tagName")}`);
    check("닫히면 스크롤 잠금이 풀린다", (await scrollLock(P)) === before, `overflow ${await scrollLock(P) || "(없음)"}`);
    await click(P, "#modal-opener");
    await sleep(200);
    await P.eval("window.__s1.unmount()");
    await sleep(150);
    check("열린 채 화면에서 떼도 스크롤 잠금이 풀린다", (await scrollLock(P)) === before, `떼고 난 overflow ${await scrollLock(P) || "(없음)"}`);
  });

  if (want("S1BottomSheet")) await mo("sheet-open-prop", "바텀시트(S1BottomSheet) open prop + onClose 로 상태 되돌리기", async (check) => {
    const dialog = '#stage [data-s1-component="bottom-sheet"] [role="dialog"]';
    await mount(M, { scenario: "sheet", options: { initialOpen: false } });
    const before = await scrollLock(M);
    check("open={false} 로 시작하면 닫혀 있다", !(await visible(M, dialog)), "처음");
    await click(M, "#sheet-opener");
    await sleep(300);
    let ev = await events(M);
    check("상태를 true 로 바꾸면 열린다", await visible(M, dialog), "열기 버튼 후");
    check("open prop 으로 열어도 onOpen 이 한 번 온다", count(ev, "sheet:onOpen") === 1, `onOpen ${count(ev, "sheet:onOpen")}회 — 시트 자체는 열렸음. Esc 처럼 런타임이 스스로 닫을 땐 onClose 가 오는데, prop 으로 여닫을 땐 이벤트가 듣기 연결보다 먼저 쏘아진다(여닫기 효과가 듣기 연결 효과보다 앞에 선언됨)`, "broken", "듣기 연결 효과를 여닫기 효과보다 먼저 두거나, prop 으로 여닫을 때 콜백을 직접 부르기");
    check("열리면 스크롤이 잠긴다", (await scrollLock(M)) !== before, `overflow ${await scrollLock(M) || "(없음)"}`, "friction");
    check("열리면 초점이 시트 안으로", await activeInside(M, '#stage [data-s1-component="bottom-sheet"]'), `초점: ${await M.eval("document.activeElement?.outerHTML?.slice(0,80)")}`);
    try { await viewportShot(M, path.join(SHOTS_DIR, "scenario-sheet-open.png")); } catch { /* 무시 */ }
    await M.eval("window.__s1.clearEvents()");
    await M.key("Escape");
    await sleep(300);
    ev = await events(M);
    check("Esc 로 닫힌다", !(await visible(M, dialog)), "Esc 후");
    check("Esc 로 닫을 때 onClose 가 한 번만 온다(상태를 false 로 되돌려도 두 번 오지 않는다)", count(ev, "sheet:onClose") === 1, `onClose ${count(ev, "sheet:onClose")}회`);
    check("React 상태도 닫힘(false)으로 맞춰진다", (await M.eval("window.__s1.ctl.sheet.get()")) === false, `open 상태 ${await M.eval("window.__s1.ctl.sheet.get()")}`);
    check("닫히면 초점이 연 버튼으로", await M.eval(`document.activeElement?.id === "sheet-opener"`), `초점: ${await M.eval("document.activeElement?.id || document.activeElement?.tagName")}`);
    check("닫히면 스크롤 잠금이 풀린다", (await scrollLock(M)) === before, `overflow ${await scrollLock(M) || "(없음)"}`);
    await click(M, "#sheet-opener");
    await sleep(300);
    check("다시 열 수 있다", await visible(M, dialog), "두 번째 열기");
    await M.eval("window.__s1.unmount()");
    await sleep(150);
    check("열린 채 화면에서 떼도 스크롤 잠금이 풀린다", (await scrollLock(M)) === before, `떼고 난 overflow ${await scrollLock(M) || "(없음)"}`);
    await resetLock(M);
    /* 기본값 open=true(아무것도 안 줌) — 처음부터 보이는데 열린 창의 약속(잠금)이 지켜지나 */
    await mount(M, { name: "S1BottomSheet", props: {} });
    const defOpen = { shown: await visible(M, dialog), lock: await scrollLock(M) };
    check("open 을 안 주면(기본 true) 보이고 열린 창처럼 스크롤도 잠긴다", defOpen.shown && defOpen.lock !== before, js(defOpen), "friction", "기본 열림이면 마운트 때 api.open() 으로 잠금·초점까지 맞추거나, 기본을 false 로");
    await M.eval("window.__s1.unmount()");
    await resetLock(M);
    /* 시트 안에 내 목록을 넣을 수 있나 — children / parts.sheetBody */
    await mount(M, { name: "S1BottomSheet", props: { children: "$el:내목록", parts: { sheetBody: { content: "$el:내본문" } } } });
    const mine = await M.eval(`({children: !!document.querySelector('#stage [data-audit-el="내목록"]'), body: !!document.querySelector('#stage [data-audit-el="내본문"]'), options: document.querySelectorAll('#stage [data-s1-component="bottom-sheet-option"]').length})`);
    check("시트 본문에 내 목록(children 또는 parts.sheetBody)을 넣을 수 있다", mine.children || mine.body, `children 들어감=${mine.children} · parts.sheetBody 들어감=${mine.body} · 예제 줄 ${mine.options}개가 그대로`, "broken", "S1BottomSheet 에 children(또는 sheetBody 내용)을 받게 생성하기");
  });

  if (want("S1BottomSheetOption")) await mo("sheet-option-single", "바텀시트 목록(S1BottomSheetOption) 하나만 고르기", async (check) => {
    await mount(M, { scenario: "sheetOptions" });
    await click(M, '#stage [data-s1-component="bottom-sheet-option"]:nth-child(2)');
    const ev = await events(M);
    const states = await M.eval(`[...document.querySelectorAll('#stage [data-s1-component="bottom-sheet-option"]')].map(o=>o.getAttribute("data-state"))`);
    check("누른 줄 하나만 selected", js(states) === js(["default", "selected", "default"]), `data-state ${js(states)}`);
    check("onChange 가 온다", count(ev, "sheetOption:onChange") >= 1, `onChange ${count(ev, "sheetOption:onChange")}회`);
  });

  if (want("S1Select")) await pc("select", "셀렉트(S1Select) — 고르기·값·다시 그리기", async (check) => {
    await mount(P, { scenario: "select" });
    await click(P, '#stage [data-s1-part="trigger"]');
    await sleep(150);
    let ev = await events(P);
    check("트리거를 누르면 열리고 onOpen 한 번", (await attr(P, '#stage [data-s1-part="trigger"]', "aria-expanded")) === "true" && count(ev, "select:onOpen") === 1, `aria-expanded=${await attr(P, '#stage [data-s1-part="trigger"]', "aria-expanded")} · onOpen ${count(ev, "select:onOpen")}회`);
    await click(P, '#stage [data-s1-part="option"]:nth-child(2)');
    await sleep(150);
    ev = await events(P);
    const change = ev.filter((e) => e.label === "select:onChange");
    const value = await P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    check("항목을 고르면 onChange 가 한 번", change.length === 1, `onChange ${change.length}회`);
    check("고른 항목 글자가 트리거에 보인다", value === "부산", `트리거 "${value}"`);
    const dv = change[0]?.detail?.detail?.value;
    check("options 를 글자 목록으로 주면 onChange 의 value 가 고른 항목을 가리킨다", dv === "부산" || dv === "busan", `event.detail.value = ${js(dv)} (고른 것: 부산)`, "broken", "글자만 준 항목은 data-value 를 그 글자로(또는 순번으로) 채우기 — 지금은 예제 값이 모든 줄에 박힘");
    await P.eval(`window.__s1.ctl.select.setOptions(["대구","광주"])`);
    await sleep(150);
    const opts = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map(o=>o.textContent.trim())`);
    check("options 를 바꾸면 목록이 바뀐다", js(opts) === js(["대구", "광주"]), `목록 ${js(opts)}`);
    await P.eval(`window.__s1.ctl.select.setLabel("직접 지정")`);
    await sleep(150);
    const v2 = await P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    check("옛 방식: 고른 뒤 parts.value 로 트리거 글자를 바꾸면 화면이 따라온다", v2 === "직접 지정", `트리거 "${v2}"`, "friction", "parts.value 로 준 글자가 런타임이 쓴 글자를 이기게(값 표시는 React 가 소유)");
  });

  if (want("S1Dropdown")) await pc("dropdown", "드롭다운(S1Dropdown) 고르기", async (check) => {
    await mount(P, { scenario: "dropdown" });
    await click(P, '#stage [data-s1-part="option"]:nth-child(2)');
    const ev = await events(P);
    check("항목을 누르면 onChange 가 한 번", count(ev, "dropdown:onChange") === 1, `onChange ${count(ev, "dropdown:onChange")}회 ${js(ev.map((e) => e.detail?.detail?.value))}`);
  });

  if (want("S1Pagination")) await pc("pagination", "페이지네이션(S1Pagination)", async (check) => {
    await mount(P, { scenario: "pagination" });
    const arrows = await P.eval(`[...document.querySelectorAll('#stage [data-s1-action]')].map(b=>b.getAttribute("data-s1-action"))`);
    check("화살표 버튼 4개(처음·이전·다음·끝)", arrows.length === 4, js(arrows));
    await click(P, '#stage [data-s1-part="page"]:nth-child(3)');
    let cur = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="page"]')].filter(b=>b.getAttribute("aria-current")==="page").map(b=>b.textContent.trim())`);
    const ev = await events(P);
    check("페이지 3 을 누르면 3 이 현재 페이지", js(cur) === js(["3"]), `현재 ${js(cur)}`);
    check("페이지가 바뀐 걸 React 가 받을 prop(onChange·onPageChange)이 있다", count(ev, "pagination:onChange(prop)") > 0, `onChange prop 으로 ${count(ev, "pagination:onChange(prop)")}회 받음 — 타입 정의에 이벤트 prop 없음(배포본은 s1:pagination:change 를 쏨)`, "broken", "S1Pagination 에 page/onPageChange(또는 onChange) prop 생성");
    const last = arrows.find((a) => /last|end/.test(a)) || arrows[arrows.length - 1];
    await click(P, `#stage [data-s1-action="${last}"]`);
    cur = await P.eval(`({pages:[...document.querySelectorAll('#stage [data-s1-part="page"]')].map(b=>b.textContent.trim()), cur:[...document.querySelectorAll('#stage [data-s1-part="page"][aria-current="page"]')].map(b=>b.textContent.trim())})`);
    check(`"${last}" 화살표를 누르면 현재 페이지가 하나로 옮겨 간다`, cur.cur.length === 1, js(cur), "friction");
    await P.eval(`window.__s1.ctl.pagination.setPages(["1","2","3","4","5","6","7","8","9","10"])`);
    await sleep(200);
    const after = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="page"]')].map(b=>b.textContent.trim())`);
    check("런타임이 번호를 다시 그린 뒤에도 React 가 pages 를 바꿔 그릴 수 있다(충돌·중복 없음)", after.length > 0 && new Set(after).size === after.length, `번호 ${js(after)}`, "broken", "번호 버튼을 런타임이 replaceChildren 으로 갈아 끼우지 말고 React 가 소유하게(page/total prop)");
    await mount(P, { scenario: "paginationStrings" });
    const plain = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="page"]')].map(b=>({t:b.textContent.trim(), p:b.getAttribute("data-page"), c:b.getAttribute("aria-current")}))`);
    check('pages={["1","2","3"]} 처럼 글자만 주면 현재 페이지 표시가 하나뿐이다', plain.filter((b) => b.c === "page").length === 1 && new Set(plain.map((b) => b.p)).size === plain.length, js(plain), "broken", "글자만 준 항목은 data-page 를 그 번호로, aria-current 는 첫 번째에만");
    const total = await attr(P, '#stage [data-s1-component="pagination"]', "data-total-pages");
    check("pages 를 3개 주면 전체 쪽수도 3 으로 맞춰진다", total === "3", `data-total-pages="${total}"`, "friction", "data-total-pages 를 pages 길이(또는 total prop)로");
  });

  if (want("S1Table")) await pc("table", "표(S1Table) — 행 데이터·선택", async (check) => {
    await mount(P, { scenario: "table" });
    let rows = await P.eval(`document.querySelectorAll('#stage tbody tr').length`);
    check("rows 2줄이 그려진다", rows === 2, `${rows}줄`);
    await click(P, '#stage tbody tr:nth-child(1) input[type="checkbox"]');
    let ev = await events(P);
    check("행 체크박스를 누르면 onSelectionchange 가 한 번", count(ev, "table:onSelectionchange") === 1, `onSelectionchange ${count(ev, "table:onSelectionchange")}회`);
    await P.eval("window.__s1.clearEvents()");
    await click(P, '#stage thead input[type="checkbox"]');
    ev = await events(P);
    const all = await P.eval(`[...document.querySelectorAll('#stage tbody input[type="checkbox"]')].map(i=>i.checked)`);
    check("전체 선택을 누르면 모든 행이 켜지고 onSelectionchange 한 번", all.every(Boolean) && count(ev, "table:onSelectionchange") === 1, `${js(all)} · ${count(ev, "table:onSelectionchange")}회`);
    await P.eval(`window.__s1.ctl.table.setRows([["가","나",1],["다","라",2],["마","바",3]])`);
    await sleep(150);
    rows = await P.eval(`document.querySelectorAll('#stage tbody tr').length`);
    check("rows 를 바꾸면 줄 수가 따라 바뀐다", rows === 3, `${rows}줄`);
    const labels = await P.eval(`[...document.querySelectorAll('#stage tbody input[type="checkbox"]')].map(i=>i.getAttribute("aria-label"))`);
    check("행 체크박스 접근 이름이 줄마다 다르다", new Set(labels).size === labels.length, js(labels), "friction", "행 체크박스 aria-label 을 줄 내용/번호로 채우기(지금은 예제 문구가 모든 줄에 같음)");
  });

  if (want("S1DatePicker")) await pc("date-picker", "날짜 선택(S1DatePicker) — 값 넣고 빼기", async (check) => {
    await mount(P, { scenario: "datePicker", options: { breakName: "pc" } });
    const shownValue = await P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    check('defaultValue="2026-10-01" 을 주면 그 날짜가 보인다(값 넣기)', /2026|10/.test(shownValue), `트리거 "${shownValue}" — 타입 정의에 value·defaultValue 없음`, "broken", "S1DatePicker 에 value/defaultValue/onValueChange 생성(런타임 setValue 연결)");
    await click(P, '#stage [data-s1-part="trigger"]');
    await sleep(200);
    let ev = await events(P);
    check("트리거를 누르면 열리고 onOpen 한 번", count(ev, "date:onOpen") === 1, `onOpen ${count(ev, "date:onOpen")}회`);
    try { await viewportShot(P, path.join(SHOTS_DIR, "scenario-date-picker-open.png")); } catch { /* 무시 */ }
    const cell = await P.eval(`(()=>{const cs=[...document.querySelectorAll('#stage button')].filter(b=>/^\\d{1,2}$/.test(b.textContent.trim()) && !b.disabled && b.getAttribute("aria-disabled")!=="true" && window.__A.vis(b) && !b.closest('[data-s1-part="trigger"]')); const c=cs.find(b=>b.textContent.trim()==="15")||cs[10]; if(!c) return null; c.setAttribute("data-audit-m","day"); return c.textContent.trim();})()`);
    if (!cell) throw new Error("달력 날짜 칸을 찾지 못함");
    await click(P, '[data-audit-m="day"]');
    await sleep(200);
    ev = await events(P);
    const changes = ev.filter((e) => e.label === "date:onChange");
    const after = await P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    check("날짜를 누르면 onChange 가 한 번(값 빼기)", changes.length === 1, `onChange ${changes.length}회 · detail ${String(js(changes[0]?.detail?.detail)).slice(0, 160)}`);
    check("고른 날짜가 트리거에 보인다", after.includes(cell), `트리거 "${after}" (고른 칸 ${cell})`);
  });

  if (want("S1DatePicker")) await mo("date-picker-mobile", "날짜 선택 모바일(바텀시트로 열림)", async (check) => {
    await mount(M, { scenario: "datePicker", options: { breakName: "mobile" } });
    await click(M, '#stage [data-s1-part="trigger"]');
    await sleep(300);
    const ev = await events(M);
    const sheet = await M.eval(`[...document.querySelectorAll('#stage [role="dialog"], #stage [data-s1-part="sheet"], #stage [data-s1-part="sheet-panel"]')].some(e=>window.__A.vis(e))`);
    check("모바일 트리거를 누르면 시트가 열리고 onOpen 한 번", sheet && count(ev, "date:onOpen") === 1, `시트 보임=${sheet} · onOpen ${count(ev, "date:onOpen")}회`);
    try { await viewportShot(M, path.join(SHOTS_DIR, "scenario-date-picker-mobile-open.png")); } catch { /* 무시 */ }
    await M.key("Escape");
    await sleep(250);
    check("Esc 로 닫히고 onClose 한 번", count(await events(M), "date:onClose") === 1, `onClose ${count(await events(M), "date:onClose")}회`);
  });

  if (want("S1TimePicker")) await pc("time-picker", "시간 선택(S1TimePicker) — 값 넣고 빼기", async (check) => {
    await mount(P, { scenario: "timePicker", options: { breakName: "pc" } });
    const shownValue = await P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    check('defaultValue="09:30" 을 주면 그 시간이 보인다(값 넣기)', /0?9/.test(shownValue) && /30/.test(shownValue), `트리거 "${shownValue}" — 타입 정의에 value 없음`, "broken", "S1TimePicker 에 value/defaultValue 생성(런타임 setValue 연결)");
    await click(P, '#stage [data-s1-part="trigger"]');
    await sleep(200);
    let ev = await events(P);
    check("트리거를 누르면 onOpen 한 번", count(ev, "time:onOpen") === 1, `onOpen ${count(ev, "time:onOpen")}회`);
    /* 열(오전/오후·시·분)마다 칸 하나씩 고른 뒤 확인 — 배포본은 모든 열이 골라져야 값을 낸다 */
    const columns = await P.eval(`(()=>{const cols=[...document.querySelectorAll('#stage [data-s1-part="column"]')].filter(c=>window.__A.vis(c)); cols.forEach((col,i)=>{const cells=[...col.querySelectorAll('[data-s1-part="cell"]')].filter(c=>window.__A.vis(c) && c.getAttribute("aria-disabled")!=="true"); const c=cells[Math.min(1,cells.length-1)]; if(c) c.setAttribute("data-audit-m","t"+i);}); return cols.length;})()`);
    if (!columns) throw new Error("시간 열(data-s1-part=column)을 찾지 못함");
    for (let i = 0; i < columns; i += 1) { try { await click(P, `[data-audit-m="t${i}"]`); } catch { /* 그 열은 건너뜀 */ } }
    await sleep(150);
    const okBtn = await P.eval(`(()=>{const b=[...document.querySelectorAll('#stage button')].find(b=>/확인|적용|완료/.test(b.textContent) && window.__A.vis(b)); if(!b) return false; b.setAttribute("data-audit-m","ok"); return true;})()`);
    if (okBtn) { await click(P, '[data-audit-m="ok"]'); await sleep(200); }
    ev = await events(P);
    check("열마다 고르고 확인을 누르면 onChange 가 한 번(값 빼기)", count(ev, "time:onChange") === 1, `열 ${columns}개 · onChange ${count(ev, "time:onChange")}회 · 확인 버튼 ${okBtn ? "누름" : "없음"} · detail ${String(js(ev.find((e) => e.label === "time:onChange")?.detail?.detail)).slice(0, 120)}`);
    await P.key("Escape");
    await sleep(150);
  });

  if (want("S1MobileBottomNav")) await mo("bottom-nav", "모바일 하단 탭(S1MobileBottomNav) 자동 이동 · preventDefault", async (check) => {
    const sel = () => M.eval(`[...document.querySelectorAll('#stage [data-s1-component="mobile-bottom-nav"]')].map(b=>b.getAttribute("aria-selected"))`);
    await mount(M, { scenario: "bottomNav", options: { block: false } });
    let s = await sel();
    check("defaultSelected 를 첫 칸에만 주면 첫 칸만 켜진 채 시작", js(s) === js(["true", "false", "false", "false"]), js(s));
    await click(M, '#stage [data-s1-component="mobile-bottom-nav"]:nth-child(3)');
    let ev = await events(M);
    s = await sel();
    check("세 번째를 누르면 그 칸 하나만 켜진다", js(s) === js(["false", "false", "true", "false"]), js(s));
    check("onBeforechange·onChange 가 각각 한 번", count(ev, "nav:onBeforechange") === 1 && count(ev, "nav:onChange") === 1, `before ${count(ev, "nav:onBeforechange")}회 · change ${count(ev, "nav:onChange")}회`);
    try { await stageShot(M, path.join(SHOTS_DIR, "scenario-bottom-nav.png")); } catch { /* 무시 */ }
    await mount(M, { scenario: "bottomNav", options: { block: true } });
    await click(M, '#stage [data-s1-component="mobile-bottom-nav"]:nth-child(3)');
    ev = await events(M);
    s = await sel();
    check("onBeforechange 에서 preventDefault 하면 움직이지 않는다", js(s) === js(["true", "false", "false", "false"]) && count(ev, "nav:onChange") === 0, `${js(s)} · change ${count(ev, "nav:onChange")}회`);
  });

  if (!ONLY.length) await pc("form", "폼 안에서 name 으로 값 보내기", async (check) => {
    await mount(P, { scenario: "form" });
    await click(P, "#audit-submit");
    const ev = await events(P);
    const sent = ev.find((e) => e.label === "form:submit")?.detail || {};
    const wantSent = { nm: "홍길동", agree: "yes", pick: "a" };
    const nativeOk = Object.entries(wantSent).every(([k, v]) => sent[k] === v);
    check("입력·체크박스·라디오는 name/defaultValue/defaultChecked 로 폼에 실린다", nativeOk, `보낸 값 ${js(sent)}`);
    const missing = ["city", "time", "day"].filter((k) => !(k in sent));
    check("셀렉트·시간·날짜도 name 을 주면 폼에 실린다", missing.length === 0, `빠진 name: ${missing.join(", ") || "없음"} — 배포본 런타임은 name 이 아니라 data-name 을 보고 숨은 input 을 만든다 · 보낸 값 ${js(sent)}`, "friction", "S1Select·S1TimePicker·S1DatePicker 에 name prop 을 받아 data-name 으로 넘기거나, README 에 data-name 을 쓰라고 적기");
  });

  if (want("S1Textarea")) await pc("textarea", "여러 줄 입력(S1Textarea) — defaultValue·value", async (check) => {
    await mount(P, { scenario: "textareaDefault" });
    let ev = await events(P);
    const crashed = await P.eval(`document.querySelector('#stage [data-audit-crash]')?.textContent ?? null`);
    check("defaultValue 를 주면 그 글자로 그려진다(비제어형)", !crashed && (await P.eval(`document.querySelector('#stage textarea')?.value ?? null`)) === "메모", crashed ? `화면이 그려지지 않고 오류: ${crashed.slice(0, 160)}` : `값 "${await P.eval(`document.querySelector('#stage textarea')?.value ?? null`)}"`, "broken", "textarea 에 예제 글자를 children 으로 넣지 말고 defaultValue 로(값이 오면 children 생략)");
    if (!crashed) {
      await click(P, "#ta-submit");
      ev = await events(P);
      check("폼으로 보내면 name 으로 실린다", ev.find((e) => e.label === "ta:submit")?.detail?.memo === "메모", js(ev.find((e) => e.label === "ta:submit")?.detail));
    }
    await mount(P, { scenario: "textareaControlled" });
    const crashed2 = await P.eval(`document.querySelector('#stage [data-audit-crash]')?.textContent ?? null`);
    const v = await P.eval(`document.querySelector('#stage textarea')?.value ?? null`);
    check("value(제어형)를 주면 그 글자로 그려진다", !crashed2 && v === "처음", crashed2 ? `오류: ${crashed2.slice(0, 160)}` : `값 "${v}"`);
    if (!crashed2) {
      await P.eval("window.__s1.ctl.textarea.set('바뀜')");
      await sleep(120);
      check("상태를 바꾸면 글자가 따라 바뀐다", (await P.eval(`document.querySelector('#stage textarea').value`)) === "바뀜", `값 "${await P.eval(`document.querySelector('#stage textarea').value`)}"`);
    }
  });

  if (want("S1Gnb")) await pc("gnb-composed", "GNB + GNB 하위 메뉴를 함께 두고 id 를 맞춰 쓰기(개발자 우회로)", async (check) => {
    await mount(P, { scenario: "gnbComposed" });
    const ok = await P.eval(`(()=>{const m=document.querySelector('#stage [data-s1-part="menu"][aria-controls="gnb-sub-menu-a-service"]'); if(!m) return false; m.setAttribute("data-audit-m","menu2"); return true;})()`);
    if (!ok) throw new Error("aria-controls 메뉴를 찾지 못함");
    await click(P, '[data-audit-m="menu2"]');
    await sleep(250);
    const ev = await events(P);
    const st = await P.eval(`(()=>{const p=document.getElementById("gnb-sub-menu-a-service"); return {expanded: document.querySelector('[data-audit-m="menu2"]').getAttribute("aria-expanded"), panel: !!p && window.__A.vis(p), subMenuHasIdProp: !!p};})()`);
    check("하위 메뉴에 id 를 직접 주고 같이 두면 펼쳐진다", st.expanded === "true" && st.panel, `${js(st)} · onOpen ${count(ev, "gnb:onOpen")}회`, "friction", "README 에 조합법(같은 id) 안내 또는 S1Gnb 가 하위 메뉴를 함께 그리기");
    try { await viewportShot(P, path.join(SHOTS_DIR, "scenario-gnb-composed.png")); } catch { /* 무시 */ }
  });

  /* ══ 새 길을 진짜 React 로 눌러 보는 시나리오 (R1~R17) ═════════════════════════════════
     위쪽 시나리오는 옛 방식 그대로 — "옛 코드가 계속 된다" 를 본다. 아래는 새 방식이다. */
  const texts = (page, selector) => page.eval(`[...document.querySelectorAll(${js(selector)})].map(e=>e.textContent.replace(/\\s+/g," ").trim())`);
  const stageText = (page) => page.eval(`document.getElementById("stage").textContent.replace(/\\s+/g," ")`);

  if (want("S1Modal")) await pc("modal-state", "모달(S1Modal) — open · onOpenChange · onConfirm/onCancel · 글자 props", async (check) => {
    const root = '#stage [data-s1-component="modal"]';
    await mount(P, { scenario: "modalState" });
    check("open=false 로 시작하면 닫혀 있다", !(await visible(P, `${root} [role="dialog"]`)), "처음");
    const before = await scrollLock(P);
    await P.eval("window.__s1.ctl.modal.set(true)");
    await sleep(250);
    let ev = await events(P);
    check("open=true 로 바꾸면 열린다", await visible(P, `${root} [role="dialog"]`), "상태 true 후");
    check("열릴 때 onOpen 은 한 번, 화면이 연 것은 onOpenChange 로 되알리지 않는다", count(ev, "modal:onOpen") === 1 && count(ev, "modal:onOpenChange") === 0, `onOpen ${count(ev, "modal:onOpen")}회 · onOpenChange ${count(ev, "modal:onOpenChange")}회`);
    check("열리면 스크롤이 잠기고 초점이 창 안으로 들어간다", (await scrollLock(P)) !== before && (await activeInside(P, root)), `overflow ${await scrollLock(P) || "(없음)"} · 초점 안=${await activeInside(P, root)}`);
    const shown = {
      title: (await texts(P, `${root} [data-s1-part="title"]`))[0],
      message: (await texts(P, `${root} [data-s1-part="message"]`))[0],
      cancel: (await texts(P, `${root} [data-s1-close="cancel"]`))[0],
      confirm: (await texts(P, `${root} [data-s1-close="confirm"]`))[0]
    };
    check("title · message · cancelLabel · confirmLabel 로 넣은 글자가 각자 자리에 그려진다(견본 글자가 남지 않는다)", shown.title === "삭제할까요?" && shown.message === "되돌릴 수 없습니다" && shown.cancel === "그만두기" && shown.confirm === "지우기", js(shown));
    try { await viewportShot(P, path.join(SHOTS_DIR, "scenario-modal-state.png")); } catch { /* 무시 */ }
    await P.eval("window.__s1.clearEvents()");
    await P.key("Escape");
    await sleep(250);
    ev = await events(P);
    check("Esc 로 닫히면 onClose 한 번 + onOpenChange(false, escape) 한 번이고 React 상태도 false", count(ev, "modal:onClose") === 1 && ev.filter((e) => e.label === "modal:onOpenChange" && e.detail?.next === false && e.detail?.reason === "escape").length === 1 && (await P.eval("window.__s1.ctl.modal.get()")) === false, `onClose ${count(ev, "modal:onClose")}회 · onOpenChange ${js(ev.filter((e) => e.label === "modal:onOpenChange").map((e) => e.detail))} · 상태 ${await P.eval("window.__s1.ctl.modal.get()")}`);
    check("닫히면 스크롤 잠금이 풀린다", (await scrollLock(P)) === before, `overflow ${await scrollLock(P) || "(없음)"}`);
    await P.eval("window.__s1.ctl.modal.set(true)");
    await sleep(250);
    await P.eval("window.__s1.clearEvents()");
    await click(P, `${root} [data-s1-close="confirm"]`);
    await sleep(200);
    ev = await events(P);
    check("확인 단추를 누르면 onConfirm 한 번 + 닫힌 이유 confirm", count(ev, "modal:onConfirm") === 1 && ev.some((e) => e.label === "modal:onOpenChange" && e.detail?.reason === "confirm"), `onConfirm ${count(ev, "modal:onConfirm")}회 · ${js(ev.filter((e) => e.label === "modal:onOpenChange").map((e) => e.detail))}`);
    await P.eval("window.__s1.ctl.modal.set(true)");
    await sleep(250);
    await P.eval("window.__s1.clearEvents()");
    await click(P, `${root} [data-s1-close="cancel"]`);
    await sleep(200);
    ev = await events(P);
    check("취소 단추를 누르면 onCancel 한 번 + 닫힌 이유 cancel", count(ev, "modal:onCancel") === 1 && ev.some((e) => e.label === "modal:onOpenChange" && e.detail?.reason === "cancel"), `onCancel ${count(ev, "modal:onCancel")}회`);
    await P.eval("window.__s1.ctl.modal.set(true)");
    await sleep(250);
    await P.eval("window.__s1.unmount()");
    await sleep(150);
    check("열린 채 화면에서 떼도 스크롤 잠금이 풀린다", (await scrollLock(P)) === before, `떼고 난 overflow ${await scrollLock(P) || "(없음)"}`);
    await resetLock(P);
    await mount(P, { scenario: "modalDefaultOpen" });
    await sleep(250);
    const mine = await P.eval(`!!document.querySelector('#stage [data-audit-el="본문"]')`);
    check("defaultOpen 은 처음부터 열려 있고, children 이 본문(message 자리)을 대신한다", (await visible(P, `${root} [role="dialog"]`)) && mine, `보임=${await visible(P, `${root} [role="dialog"]`)} · 내 본문=${mine}`);
    check("본문을 children 으로 줬을 때 견본 문장이 남지 않는다", !(await stageText(P)).includes("변경한 내용이 저장되지 않고"), (await stageText(P)).slice(0, 120));
  });

  if (want("S1ModalContent")) await pc("modal-content-state", "모달 콘텐츠(S1ModalContent) — open · onOpenChange · children", async (check) => {
    const root = '#stage [data-s1-component="modal-content"]';
    await mount(P, { scenario: "modalContentState" });
    check("open=false 로 시작하면 닫혀 있다", !(await visible(P, `${root} [role="dialog"]`)), "처음");
    await P.eval("window.__s1.ctl.modalContent.set(true)");
    await sleep(250);
    let ev = await events(P);
    check("open=true 로 바꾸면 열리고 onOpen 한 번, onOpenChange 는 오지 않는다", (await visible(P, `${root} [role="dialog"]`)) && count(ev, "modalContent:onOpen") === 1 && count(ev, "modalContent:onOpenChange") === 0, `onOpen ${count(ev, "modalContent:onOpen")}회 · onOpenChange ${count(ev, "modalContent:onOpenChange")}회`);
    const body = await P.eval(`({mine: !!document.querySelector('#stage [data-audit-el="내용"]'), sample: document.getElementById("stage").textContent.includes("컨텐츠 영역")})`);
    check("children 이 내용 영역을 대신하고 견본 글자가 남지 않는다", body.mine && !body.sample, js(body));
    const labels = [(await texts(P, `${root} [data-s1-close="cancel"]`))[0], (await texts(P, `${root} [data-s1-close="confirm"]`))[0], (await texts(P, `${root} [data-s1-part="title"]`))[0]];
    check("title · cancelLabel · confirmLabel 글자가 반영된다", js(labels) === js(["닫기", "저장", "내용 창"]), js(labels));
    await P.eval("window.__s1.clearEvents()");
    await click(P, `${root} [data-s1-close="confirm"]`);
    await sleep(200);
    ev = await events(P);
    check("확인으로 닫히면 onClose 한 번 + onOpenChange(false, confirm) 한 번 + 상태 false", count(ev, "modalContent:onClose") === 1 && ev.filter((e) => e.label === "modalContent:onOpenChange" && e.detail?.reason === "confirm").length === 1 && (await P.eval("window.__s1.ctl.modalContent.get()")) === false, `onClose ${count(ev, "modalContent:onClose")}회 · ${js(ev.filter((e) => e.label === "modalContent:onOpenChange").map((e) => e.detail))}`);
    await resetLock(P);
  });

  if (want("S1BottomSheet")) await mo("sheet-state", "바텀시트(S1BottomSheet) — options · value · onValueChange · onOpenChange", async (check) => {
    const dialog = '#stage [data-s1-component="bottom-sheet"] [role="dialog"]';
    await mount(M, { scenario: "sheetState" });
    check("처음엔 닫혀 있다", !(await visible(M, dialog)), "open=false");
    const rowTexts = await texts(M, '#stage [data-s1-component="bottom-sheet-option"] [data-s1-part="label"]');
    check("options 로 준 줄만 그려진다(견본 \"항목 1~4\" 가 남지 않는다)", js(rowTexts) === js(["작게", "보통", "크게"]), js(rowTexts));
    await click(M, "#sheet-opener");
    await sleep(300);
    const selected = await M.eval(`[...document.querySelectorAll('#stage [data-s1-component="bottom-sheet-option"]')].map(o=>o.getAttribute("data-state"))`);
    check("value 가 가리키는 줄이 처음부터 선택돼 있다", js(selected) === js(["default", "selected", "default"]), js(selected));
    await M.eval("window.__s1.clearEvents()");
    await click(M, '#stage [data-s1-component="bottom-sheet-option"]:nth-child(3)');
    await sleep(300);
    const ev = await events(M);
    check("줄을 누르면 onValueChange 가 한 번, 준 그대로의 값(숫자 3)으로 온다", count(ev, "sheetState:onValueChange") === 1 && ev.find((e) => e.label === "sheetState:onValueChange")?.detail === 3, js(ev.filter((e) => e.label === "sheetState:onValueChange").map((e) => e.detail)));
    check("고르면 시트가 닫히고(closeOnSelect) onClose 한 번 + onOpenChange(false) + 상태 false", !(await visible(M, dialog)) && count(ev, "sheetState:onClose") === 1 && (await M.eval("window.__s1.ctl.sheetState.get()")) === false, `보임=${await visible(M, dialog)} · onClose ${count(ev, "sheetState:onClose")}회 · 상태 ${await M.eval("window.__s1.ctl.sheetState.get()")}`);
    await M.eval(`window.__s1.ctl.sheetState.setSize("작게")`);
    await sleep(200);
    const after = await M.eval(`[...document.querySelectorAll('#stage [data-s1-component="bottom-sheet-option"]')].map(o=>o.getAttribute("data-state"))`);
    check("부모가 value 를 바꾸면 선택된 줄이 따라 바뀐다", js(after) === js(["selected", "default", "default"]), js(after));
    await resetLock(M);
  });

  if (want("S1Select")) await pc("select-value", "셀렉트(S1Select) — options 의 고유 값 · value/onValueChange · name · open", async (check) => {
    const trigger = '#stage [data-s1-part="trigger"]';
    const shownValue = () => P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    await mount(P, { scenario: "selectValue" });
    check("value=\"busan\" 이면 트리거에 처음부터 \"부산\" 이 보인다", (await shownValue()) === "부산", `트리거 "${await shownValue()}"`);
    const values = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map(o=>o.getAttribute("data-value"))`);
    check("항목마다 고유한 value 가 붙는다(모두 같아지지 않는다)", js(values) === js(["seoul", "busan", "3"]), js(values));
    const selected = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map(o=>o.getAttribute("aria-selected"))`);
    check("고른 항목에만 선택 표시가 있다", js(selected) === js(["false", "true", "false"]), js(selected));
    await click(P, trigger);
    await sleep(150);
    await P.eval("window.__s1.clearEvents()");
    await click(P, '#stage [data-s1-part="option"]:nth-child(3)');
    await sleep(200);
    let ev = await events(P);
    const raw = ev.find((e) => e.label === "select:onChange")?.detail?.detail?.value;
    check("항목을 고르면 onValueChange 가 한 번, 준 그대로의 값(숫자 3)으로 온다", count(ev, "select:onValueChange") === 1 && ev.find((e) => e.label === "select:onValueChange")?.detail === 3, js(ev.filter((e) => e.label === "select:onValueChange").map((e) => e.detail)));
    check("onChange(옛 방식 이벤트)도 그대로 와서 event.detail.value 가 고른 항목을 가리킨다", count(ev, "select:onChange") === 1 && raw === "3", `event.detail.value = ${js(raw)}`);
    check("트리거에 고른 글자가 보인다", (await shownValue()) === "제주", `트리거 "${await shownValue()}"`);
    await P.eval(`window.__s1.ctl.selectValue.set("seoul")`);
    await sleep(200);
    ev = await events(P);
    check("부모가 value 를 바꾸면 트리거 글자도 따라 바뀐다", (await shownValue()) === "서울", `트리거 "${await shownValue()}"`);
    check("화면이 정한 값은 onValueChange 로 되알리지 않는다", count(ev, "select:onValueChange") === 1, `onValueChange ${count(ev, "select:onValueChange")}회`);
    await click(P, "#sel-submit");
    ev = await events(P);
    check("name 을 주면 폼 전송에 고른 값이 실린다", ev.find((e) => e.label === "sel:submit")?.detail?.city === "seoul", js(ev.find((e) => e.label === "sel:submit")?.detail));
    await P.eval(`window.__s1.ctl.selectValue.setOpen(true)`);
    await sleep(250);
    check("open=true 를 주면 목록이 열린다", (await attr(P, trigger, "aria-expanded")) === "true", `aria-expanded=${await attr(P, trigger, "aria-expanded")}`);
    await P.eval("window.__s1.clearEvents()");
    await P.key("Escape");
    await sleep(250);
    ev = await events(P);
    check("Esc 로 닫히면 onOpenChange(false) 가 한 번 오고 상태가 맞춰진다", count(ev, "select:onOpenChange") === 1 && (await attr(P, trigger, "aria-expanded")) === "false", `onOpenChange ${count(ev, "select:onOpenChange")}회 · aria-expanded=${await attr(P, trigger, "aria-expanded")}`);
    await mount(P, { scenario: "selectUncontrolled" });
    check("defaultValue 는 처음 값만 정한다(비제어형)", (await shownValue()) === "비", `트리거 "${await shownValue()}"`);
    await click(P, trigger);
    await click(P, '#stage [data-s1-part="option"]:nth-child(1)');
    await sleep(150);
    check("비제어형은 눌러서 바뀌고 onValueChange 가 값으로 온다", (await shownValue()) === "에이" && (await events(P)).some((e) => e.label === "selectU:onValueChange" && e.detail === "a"), `트리거 "${await shownValue()}"`);
  });

  if (want("S1Dropdown")) await pc("dropdown-value", "드롭다운 · 필터 칩 — value/onValueChange · name", async (check) => {
    await mount(P, { scenario: "dropdownValue" });
    let selected = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map(o=>o.getAttribute("aria-selected"))`);
    check("드롭다운: value 가 가리키는 항목이 처음부터 선택돼 있다", js(selected) === js(["false", "false", "true"]), js(selected));
    await click(P, '#stage [data-s1-part="option"]:nth-child(2)');
    let ev = await events(P);
    check("드롭다운: 누르면 onValueChange 가 한 번 \"popular\" 로 온다", count(ev, "dropdown:onValueChange") === 1 && ev.find((e) => e.label === "dropdown:onValueChange")?.detail === "popular", js(ev.map((e) => e.detail)));
    await P.eval(`window.__s1.ctl.dropdownValue.set("latest")`);
    await sleep(150);
    selected = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map(o=>o.getAttribute("aria-selected"))`);
    check("드롭다운: 부모가 value 를 바꾸면 선택 표시가 따라 바뀐다", js(selected) === js(["true", "false", "false"]), js(selected));
    await mount(P, { scenario: "filterChipValue" });
    const shown = () => P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    check("필터 칩: value=\"name\" 이면 처음부터 \"이름순\" 이 보인다", (await shown()) === "이름순", `"${await shown()}"`);
    await click(P, '#stage [data-s1-part="trigger"]');
    await click(P, '#stage [data-s1-part="option"]:nth-child(1)');
    await sleep(150);
    ev = await events(P);
    check("필터 칩: 고르면 onValueChange(\"latest\") 한 번 + 글자가 바뀐다", count(ev, "filterChip:onValueChange") === 1 && (await shown()) === "최신순", `onValueChange ${js(ev.filter((e) => e.label === "filterChip:onValueChange").map((e) => e.detail))} · "${await shown()}"`);
    await P.eval(`window.__s1.ctl.filterChipValue.set("name")`);
    await sleep(200);
    check("필터 칩: 부모가 value 를 바꾸면 글자도 따라 바뀐다", (await shown()) === "이름순", `"${await shown()}"`);
    await click(P, "#fc-submit");
    ev = await events(P);
    check("필터 칩: name 을 주면 폼에 값이 실린다", ev.find((e) => e.label === "fc:submit")?.detail?.sort === "name", js(ev.find((e) => e.label === "fc:submit")?.detail));
  });

  if (want("S1MultiToggle")) await pc("multi-toggle-tab", "멀티 토글 · 탭 — 목록 항목 · value · name", async (check) => {
    await mount(P, { scenario: "multiToggleValue" });
    const checked = () => P.eval(`[...document.querySelectorAll('#stage [data-s1-part="cell"]')].map(c=>c.getAttribute("aria-checked"))`);
    check("멀티 토글: cells 로 준 글자가 그려지고 value 가 가리키는 칸이 켜져 있다", js(await texts(P, '#stage [data-s1-part="cell"]')) === js(["왼쪽", "가운데", "오른쪽"]) && js(await checked()) === js(["false", "true", "false"]), `${js(await texts(P, '#stage [data-s1-part="cell"]'))} · ${js(await checked())}`);
    const disabled = await P.eval(`document.querySelectorAll('#stage [data-s1-part="cell"][aria-disabled="true"]').length`);
    check("멀티 토글: disabled 칸은 비활성 표시가 붙는다", disabled === 1, `비활성 ${disabled}칸`);
    await click(P, '#stage [data-s1-part="cell"]:nth-child(1)');
    let ev = await events(P);
    check("멀티 토글: 누르면 onValueChange(\"a\") 한 번 + 켜진 칸이 옮겨진다", count(ev, "multiToggle:onValueChange") === 1 && ev.find((e) => e.label === "multiToggle:onValueChange")?.detail === "a" && js(await checked()) === js(["true", "false", "false"]), `${js(ev.filter((e) => e.label === "multiToggle:onValueChange").map((e) => e.detail))} · ${js(await checked())}`);
    await P.eval(`window.__s1.ctl.multiToggle.set("b")`);
    await sleep(150);
    check("멀티 토글: 부모가 value 를 바꾸면 켜진 칸이 따라 바뀌고 되알리지 않는다", js(await checked()) === js(["false", "true", "false"]) && count(await events(P), "multiToggle:onValueChange") === 1, `${js(await checked())}`);
    await click(P, "#mt-submit");
    ev = await events(P);
    check("멀티 토글: name 을 주면 켜진 칸의 값이 폼에 실린다", ev.find((e) => e.label === "mt:submit")?.detail?.align === "b", js(ev.find((e) => e.label === "mt:submit")?.detail));

    await mount(P, { scenario: "tabValue" });
    const selTabs = () => P.eval(`[...document.querySelectorAll('#stage [data-s1-part="tab"]')].map(t=>t.getAttribute("aria-selected"))`);
    const panels = () => P.eval(`[...document.querySelectorAll('#stage [role="tabpanel"]')].map(p=>p.hidden ? "" : p.textContent.trim())`);
    check("탭: tabs 의 { value, label, panel } 대로 탭과 패널이 그려지고 value 가 가리키는 탭이 켜진다", js(await texts(P, '#stage [data-s1-part="tab"]')) === js(["하나", "둘", "셋"]) && js(await selTabs()) === js(["false", "true", "false"]) && js(await panels()) === js(["", "둘째 내용", ""]), `${js(await texts(P, '#stage [data-s1-part="tab"]'))} · ${js(await selTabs())} · ${js(await panels())}`);
    await P.eval("window.__s1.clearEvents()");
    await click(P, '#stage [data-s1-part="tab"]:nth-child(3)');
    ev = await events(P);
    check("탭: 누르면 onValueChange(\"three\") 한 번 + 패널이 따라 바뀐다", count(ev, "tab:onValueChange") === 1 && ev.find((e) => e.label === "tab:onValueChange")?.detail === "three" && js(await panels()) === js(["", "", "셋째 내용"]), `${js(ev.map((e) => e.detail))} · ${js(await panels())}`);
    await P.eval(`window.__s1.ctl.tab.set("one")`);
    await sleep(150);
    check("탭: 부모가 value 를 바꾸면 탭과 패널이 따라 바뀐다", js(await selTabs()) === js(["true", "false", "false"]) && js(await panels()) === js(["첫 내용", "", ""]), `${js(await selTabs())} · ${js(await panels())}`);
  });

  if (want("S1Pagination")) await pc("pagination-state", "페이지네이션(S1Pagination) — page · totalPages · onPageChange", async (check) => {
    const current = () => P.eval(`[...document.querySelectorAll('#stage [data-s1-part="page"][aria-current="page"]')].map(b=>b.textContent.trim())`);
    const numbers = () => texts(P, '#stage [data-s1-part="page"]');
    await mount(P, { scenario: "paginationState" });
    check("처음 6쪽 · 현재 1쪽이 그려진다", js(await numbers()) === js(["1", "2", "3", "4", "5", "6"]) && js(await current()) === js(["1"]), `${js(await numbers())} · 현재 ${js(await current())}`);
    await click(P, '#stage [data-s1-part="page"]:nth-child(3)');
    let ev = await events(P);
    check("3쪽을 누르면 onPageChange(3) 가 한 번 오고 React 상태도 3 이다", count(ev, "pager:onPageChange") === 1 && ev.find((e) => e.label === "pager:onPageChange")?.detail === 3 && (await P.eval("window.__s1.ctl.pager.get()")) === 3, `${js(ev.filter((e) => e.label === "pager:onPageChange").map((e) => e.detail))} · 상태 ${await P.eval("window.__s1.ctl.pager.get()")}`);
    check("옛 방식 onChange(이벤트)도 그대로 한 번 온다", count(ev, "pager:onChange") === 1, `${count(ev, "pager:onChange")}회`);
    await P.eval("window.__s1.clearEvents()");
    await P.eval("window.__s1.ctl.pager.setTotal(25)");
    await sleep(200);
    await P.eval("window.__s1.ctl.pager.set(8)");
    await sleep(250);
    ev = await events(P);
    check("부모가 totalPages · page 를 바꾸면 번호 줄이 다시 그려지고 8쪽이 현재가 된다(다음 묶음 7~12)", js(await numbers()) === js(["7", "8", "9", "10", "11", "12"]) && js(await current()) === js(["8"]), `${js(await numbers())} · 현재 ${js(await current())}`);
    check("화면이 정한 쪽은 onPageChange 로 되알리지 않는다", count(ev, "pager:onPageChange") === 0, `${count(ev, "pager:onPageChange")}회`);
    const last = await P.eval(`document.querySelector('#stage [data-s1-action="last"]') ? 1 : 0`);
    await click(P, '#stage [data-s1-action="next"]');
    ev = await events(P);
    check("다음 쪽 단추를 누르면 onPageChange(9)", ev.some((e) => e.label === "pager:onPageChange" && e.detail === 9) && js(await current()) === js(["9"]), `${js(ev.filter((e) => e.label === "pager:onPageChange").map((e) => e.detail))} · 현재 ${js(await current())} · last단추=${last}`);
    await P.eval("window.__s1.clearEvents()");
    await P.eval("window.__s1.ctl.pager.setTotal(4)");
    await sleep(300);
    ev = await events(P);
    check("총 쪽수가 줄어 현재 쪽이 밀려나면 그 사실을 onPageChange 로 알린다(마지막 쪽 4)", ev.some((e) => e.label === "pager:onPageChange" && e.detail === 4) && (await P.eval("window.__s1.ctl.pager.get()")) === 4, `${js(ev.filter((e) => e.label === "pager:onPageChange").map((e) => e.detail))} · 상태 ${await P.eval("window.__s1.ctl.pager.get()")}`);
  });

  if (want("S1Table")) await pc("table-state", "표 — onSelectionChange(새 이름) · 옛 이름 · 줄마다 다른 선택 이름", async (check) => {
    await mount(P, { scenario: "tableState" });
    const labels = await P.eval(`[...document.querySelectorAll('#stage tbody input[type="checkbox"]')].map(i=>i.getAttribute("aria-label"))`);
    check("행 체크박스 접근 이름이 줄마다 다르다(첫 칸 글자로 채워진다)", js(labels) === js(["김하늘 선택", "박바다 선택", "이구름 선택"]), js(labels));
    await click(P, '#stage tbody tr:nth-child(2) input[type="checkbox"]');
    const ev = await events(P);
    check("행을 고르면 onSelectionChange 와 옛 이름 onSelectionchange 가 각각 한 번, detail 에 선택 수가 온다", count(ev, "table:onSelectionChange") === 1 && count(ev, "table:onSelectionchange(old)") === 1 && ev.find((e) => e.label === "table:onSelectionChange")?.detail?.selectedCount === 1, `새 ${count(ev, "table:onSelectionChange")}회 · 옛 ${count(ev, "table:onSelectionchange(old)")}회 · ${js(ev.find((e) => e.label === "table:onSelectionChange")?.detail)}`);
  });

  if (want("S1DatePicker")) await pc("date-state", "날짜 선택 — value · onValueChange · name · 기간 · open", async (check) => {
    const shown = () => P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    await mount(P, { scenario: "dateState", options: { breakName: "pc" } });
    check("value=\"2026-10-01\" 이면 트리거에 그 날짜가 처음부터 보인다", /26\.10\.01/.test(await shown()), `"${await shown()}"`);
    await click(P, '#stage [data-s1-part="trigger"]');
    await sleep(250);
    const cell = await P.eval(`(()=>{const cs=[...document.querySelectorAll('#stage button')].filter(b=>/^\\d{1,2}$/.test(b.textContent.trim()) && !b.disabled && b.getAttribute("aria-disabled")!=="true" && window.__A.vis(b) && !b.closest('[data-s1-part="trigger"]')); const c=cs.find(b=>b.textContent.trim()==="15")||cs[10]; if(!c) return null; c.setAttribute("data-audit-m","day"); return c.textContent.trim();})()`);
    if (!cell) throw new Error("달력 날짜 칸을 찾지 못함");
    await P.eval("window.__s1.clearEvents()");
    await click(P, '[data-audit-m="day"]');
    await sleep(250);
    let ev = await events(P);
    const picked = await P.eval("window.__s1.ctl.date.get()");
    check("날짜를 누르면 onValueChange 가 \"YYYY-MM-DD\" 문자열로 한 번 오고 React 상태가 된다", count(ev, "date:onValueChange") === 1 && /^2026-10-\d\d$/.test(picked) && ev.find((e) => e.label === "date:onValueChange")?.detail === picked, `${js(ev.filter((e) => e.label === "date:onValueChange").map((e) => e.detail))} · 상태 ${picked}`);
    await P.eval(`window.__s1.ctl.date.set("2026-11-20")`);
    await sleep(250);
    check("부모가 value 를 바꾸면 트리거 글자가 따라 바뀌고 되알리지 않는다", /11/.test(await shown()) && count(await events(P), "date:onValueChange") === 1, `"${await shown()}"`);
    await click(P, "#dt-submit");
    ev = await events(P);
    check("name 을 주면 고른 날짜가 폼에 실린다", ev.find((e) => e.label === "dt:submit")?.detail?.day === "2026-11-20", js(ev.find((e) => e.label === "dt:submit")?.detail));
    await mount(P, { scenario: "dateRange" });
    const rangeText = await shown();
    check("기간(variant=\"range\"): value={start,end} 이면 시작~끝이 보인다", /~/.test(rangeText) && /3/.test(rangeText) && /9/.test(rangeText), `"${rangeText}"`);
  });

  if (want("S1TimePicker")) await pc("time-state", "시간 선택 — value(24시간) · onValueChange · name", async (check) => {
    const shown = () => P.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.trim()`);
    await mount(P, { scenario: "timeState", options: { breakName: "pc" } });
    check("value=\"09:30\" 이면 트리거에 처음부터 그 시간이 보인다", /09:30/.test(await shown()), `"${await shown()}"`);
    await P.eval(`window.__s1.ctl.time.set("14:05")`);
    await sleep(250);
    check("부모가 value=\"14:05\" 로 바꾸면 트리거가 따라 바뀐다", /14:05/.test(await shown()) && count(await events(P), "time:onValueChange") === 0, `"${await shown()}"`);
    await click(P, "#tm-submit");
    let ev = await events(P);
    check("name 을 주면 시간이 폼에 실린다", /14:05/.test(ev.find((e) => e.label === "tm:submit")?.detail?.clock ?? ""), js(ev.find((e) => e.label === "tm:submit")?.detail));
    await click(P, '#stage [data-s1-part="trigger"]');
    await sleep(250);
    const columns = await P.eval(`(()=>{const cols=[...document.querySelectorAll('#stage [data-s1-part="column"]')].filter(c=>window.__A.vis(c)); cols.forEach((col,i)=>{const cells=[...col.querySelectorAll('[data-s1-part="cell"]')].filter(c=>window.__A.vis(c)); const c=cells[i===0?7:30] || cells[cells.length-1]; if(c) c.setAttribute("data-audit-m","t"+i);}); return cols.length;})()`);
    for (let i = 0; i < columns; i += 1) { try { await click(P, `[data-audit-m="t${i}"]`); } catch { /* 건너뜀 */ } }
    await P.eval("window.__s1.clearEvents()");
    const ok = await P.eval(`(()=>{const b=[...document.querySelectorAll('#stage button')].find(b=>/확인|적용|완료/.test(b.textContent) && window.__A.vis(b)); if(!b) return false; b.setAttribute("data-audit-m","ok"); return true;})()`);
    if (ok) { await click(P, '[data-audit-m="ok"]'); await sleep(250); }
    ev = await events(P);
    const got = ev.find((e) => e.label === "time:onValueChange")?.detail;
    check("시간을 고르고 확인하면 onValueChange 가 24시간 \"HH:mm\" 문자열로 한 번 온다", count(ev, "time:onValueChange") === 1 && /^\d\d:\d\d$/.test(got ?? "") && got === (await P.eval("window.__s1.ctl.time.get()")), `${js(got)} · 상태 ${await P.eval("window.__s1.ctl.time.get()")}`);
    check("열고 닫음은 onOpen/onClose 가 각각 한 번, 사용자가 연 것은 onOpenChange 로도 온다", count(ev, "time:onClose") === 1, `onClose ${count(ev, "time:onClose")}회 · onOpenChange ${js(ev.filter((e) => e.label === "time:onOpenChange").map((e) => e.detail))}`, "friction");
  });

  if (want("S1TimePicker")) await mo("time-mobile-sheet", "시간 선택 모바일 — StrictMode 에서 한 번만 반응", async (check) => {
    await mount(M, { scenario: "timeMobileSheet" });
    await M.eval("window.__s1.ctl.timeSheet.set(true)");
    await sleep(350);
    const sheet = '#stage [data-s1-component="time-picker"] [data-s1-part="sheet"]';
    check("open=true 로 시트가 열리고 onOpen 한 번(onOpenChange 는 되알리지 않음)", (await visible(M, sheet)) && count(await events(M), "timeSheet:onOpen") === 1 && count(await events(M), "timeSheet:onOpenChange") === 0, `보임=${await visible(M, sheet)} · onOpen ${count(await events(M), "timeSheet:onOpen")}회`);
    await M.eval("window.__s1.clearEvents()");
    await click(M, '#stage [data-s1-part="sheet-close"]');
    await sleep(300);
    const ev = await events(M);
    check("닫기 단추 한 번에 onClose 가 한 번만 온다(StrictMode 이중 등록 없음)", count(ev, "timeSheet:onClose") === 1, `onClose ${count(ev, "timeSheet:onClose")}회`);
    check("닫히면 onOpenChange(false) 한 번 + 상태 false", count(ev, "timeSheet:onOpenChange") === 1 && (await M.eval("window.__s1.ctl.timeSheet.get()")) === false, `onOpenChange ${count(ev, "timeSheet:onOpenChange")}회 · 상태 ${await M.eval("window.__s1.ctl.timeSheet.get()")}`);
    await M.eval("window.__s1.ctl.timeSheet.set(true)");
    await sleep(350);
    await M.eval("window.__s1.clearEvents()");
    await clickCorner(M, '#stage [data-s1-part="sheet-backdrop"]');
    await sleep(300);
    check("바탕을 눌러 닫을 때도 onClose 한 번", count(await events(M), "timeSheet:onClose") === 1, `onClose ${count(await events(M), "timeSheet:onClose")}회`);
    await resetLock(M);
  });

  if (!ONLY.length) await pc("form-all", "폼 — 토글 · 칩 · 멀티 토글에도 name 이 실린다", async (check) => {
    await mount(P, { scenario: "toggleState" });
    await click(P, "#tg-submit");
    let sent = (await events(P)).find((e) => e.label === "tg:submit")?.detail ?? {};
    check("토글: 꺼져 있으면 폼에 실리지 않는다", !("notify" in sent), js(sent));
    await P.eval("window.__s1.clearEvents()");
    await click(P, '#stage [data-s1-component="toggle"]');
    let ev = await events(P);
    check("토글: 누르면 onCheckedChange(true) 가 한 번 오고 React 상태가 켜진다", count(ev, "toggle:onCheckedChange") === 1 && ev.find((e) => e.label === "toggle:onCheckedChange")?.detail === true && (await P.eval("window.__s1.ctl.toggle.get()")) === true, js(ev.map((e) => e.detail)));
    await click(P, "#tg-submit");
    sent = (await events(P)).find((e) => e.label === "tg:submit")?.detail ?? {};
    check("토글: 켜지면 폼에 name 으로 실린다", sent.notify === "on", js(sent));
    await P.eval("window.__s1.ctl.toggle.set(false)");
    await sleep(150);
    check("토글: 부모가 checked 를 바꾸면 모양도 따라 바뀐다", (await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")) === "false", `aria-checked=${await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")}`);
    await mount(P, { scenario: "chipForm" });
    await click(P, "#chip-submit");
    sent = (await events(P)).find((e) => e.label === "chipForm:submit")?.detail ?? {};
    check("칩: 켜진 칩의 값만 name 으로 실린다", sent.gate === "북문", js(sent));
    await click(P, '#stage [data-s1-component="chip"]:nth-child(2)');
    await click(P, "#chip-submit");
    const events2 = await events(P);
    sent = events2.filter((e) => e.label === "chipForm:submit").at(-1)?.detail ?? {};
    check("칩: 묶음에서 다른 칩을 켜면 폼 값도 따라 바뀐다", sent.gate === "남문", js(sent));
  });

  await pc("list-rows", "리스트 행(S1ListRow) — 7가지 종류가 웹 예시와 같은 마크업으로 나온다", async (check) => {
    await mount(P, { scenario: "listRows" });
    const rows = await P.eval(`[...document.querySelectorAll('#stage [data-s1-component="list-row"]')].map(r=>({type:r.getAttribute("data-type"), tag:r.tagName.toLowerCase(), buttonsInside:r.querySelectorAll("button").length, hasToggle: !!r.querySelector('[data-s1-component="toggle"]'), hasValue: !!r.querySelector('[data-s1-part="value"]'), nestedButton: !!r.closest("button") && r.tagName!=="BUTTON" }))`);
    const byType = Object.fromEntries(rows.map((r) => [r.type, r]));
    check("7종이 모두 그려진다", js(Object.keys(byType)) === js(["nav", "value", "read", "pick", "agree", "switch", "thumb"]), js(Object.keys(byType)));
    check("스위치 형: 줄은 button 이 아니고 안에 스위치(토글)가 있다", byType.switch?.tag === "div" && byType.switch?.hasToggle, js(byType.switch));
    check("값 표시 형: 줄은 button 이고 오른쪽에 값 글자가 있다", byType.value?.tag === "button" && byType.value?.hasValue, js(byType.value));
    check("읽기 형은 button 이 아니다(눌리는 것처럼 보이지 않는다)", byType.read?.tag === "div", js(byType.read));
    const valueText = (await texts(P, '#stage [data-s1-component="list-row"][data-type="value"] [data-s1-part="value"]'))[0];
    check("value prop 으로 준 글자가 오른쪽 값 자리에 그려진다", valueText === "라이트", `"${valueText}"`);
    await P.eval("window.__s1.clearEvents()");
    await click(P, '#stage [data-s1-component="list-row"][data-type="switch"] [data-s1-component="toggle"]');
    const ev = await events(P);
    check("스위치를 누르면 onCheckedChange(false) 가 한 번 오고 모양이 꺼진다", count(ev, "rows:push") === 1 && ev.find((e) => e.label === "rows:push")?.detail === false && (await attr(P, '#stage [data-s1-component="list-row"][data-type="switch"] [data-s1-component="toggle"]', "aria-checked")) === "false", `${js(ev.map((e) => e.detail))} · aria-checked=${await attr(P, '#stage [data-s1-component="list-row"][data-type="switch"] [data-s1-component="toggle"]', "aria-checked")}`);
    await P.eval("window.__s1.clearEvents()");
    await click(P, '#stage [data-s1-component="list-row"][data-type="agree"] input[type="checkbox"]');
    check("동의 줄의 체크를 누르면 onCheckedChange(true) 가 한 번", count(await events(P), "rows:agree") === 1 && (await P.eval(`document.querySelector('#stage [data-s1-component="list-row"][data-type="agree"] input[type="checkbox"]').checked`)) === true, js((await events(P)).map((e) => e.detail)));
    try { await viewportShot(P, path.join(SHOTS_DIR, "scenario-list-rows.png")); } catch { /* 무시 */ }
  });

  await pc("list-row-switch", "리스트 행 스위치 — 안 주면 꺼진 채 · checked/defaultChecked 를 따른다 · name 이 폼에 실린다 · 견본 글자가 끼어들지 않는다", async (check) => {
    await mount(P, { name: "S1ListRow", props: { variant: "switch", title: "알림" } });
    const bare = await P.eval(`({checked: document.querySelector('#stage [data-s1-component="toggle"]')?.getAttribute('aria-checked'), text: document.getElementById('stage').textContent.replace(/\\s+/g,' ').trim(), desc: document.querySelectorAll('#stage [data-s1-part="description"]').length})`);
    check("내용 prop 을 일부만 주면(title) 안 준 설명 칸은 그려지지 않고 견본(새 소식 알림 받기)이 끼어들지 않는다", bare.text === "알림" && bare.desc === 0, js(bare));
    check("스위치는 안 주면 꺼진 채 시작한다(0.22.0 과 같다)", bare.checked === "false", `aria-checked=${bare.checked}`);
    await mount(P, { name: "S1ListRow", props: { variant: "switch", title: "알림", defaultChecked: true } });
    check("defaultChecked 를 주면 켜진 채 시작한다", (await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")) === "true", `aria-checked=${await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")}`);
    await mount(P, { name: "S1ListRow", props: { variant: "switch", title: "알림", checked: true } });
    check("checked 를 주면 그 값을 따른다", (await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")) === "true", `aria-checked=${await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")}`);
    await mount(P, { scenario: "listRowForm" });
    await click(P, "#lr-submit");
    let sent = (await events(P)).find((e) => e.label === "lr:submit")?.detail ?? {};
    check("스위치 줄에 name 을 주면: 꺼진 줄은 폼에 안 실리고 켜진 줄은 실린다", !("off" in sent) && sent.on === "on", js(sent));
    await click(P, '#stage [data-s1-component="list-row"]:first-of-type [data-s1-component="toggle"]');
    await click(P, "#lr-submit");
    sent = (await events(P)).filter((e) => e.label === "lr:submit").at(-1)?.detail ?? {};
    check("꺼진 줄을 눌러 켜면 그 name 의 값이 실린다", sent.off === "on", js(sent));
    await mount(P, { name: "S1ListRow", props: { variant: "value", title: "글자 크기" } });
    const value = await P.eval(`document.getElementById('stage').textContent.replace(/\\s+/g,' ').trim()`);
    check("값 표시형에 title 만 주면 견본 값(라이트)·견본 설명이 끼어들지 않는다", value === "글자 크기", `"${value}"`);
    await mount(P, { name: "S1ListRow", props: { variant: "value" } });
    const bareValue = await P.eval(`document.getElementById('stage').textContent.replace(/\\s+/g,' ').trim()`);
    check("아무것도 안 주면 견본(테마·라이트)이 그려진다 — 보기용", /라이트/.test(bareValue), `"${bareValue}"`);
    await mount(P, { name: "S1Modal", props: { title: "삭제" } });
    const modal = await P.eval(`({message: document.querySelector('#stage [data-s1-part="message"]')?.textContent.trim() ?? null, labels: [...document.querySelectorAll('#stage [data-s1-part="label"]')].map((e) => e.textContent.trim())})`);
    check("모달에 title 만 주면 본문 견본은 비고, 꼭 필요한 단추 글자(취소·확인)는 기본으로 남는다", modal.message === "" && js(modal.labels) === js(["취소", "확인"]), js(modal));
    await mount(P, { name: "S1Modal", props: {} });
    const modalBare = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="label"]')].map((e) => e.textContent.trim())`);
    check("모달에 아무것도 안 주면 견본(취소·확인)이 그려진다 — 0.22.0 과 같다", js(modalBare) === js(["취소", "확인"]), js(modalBare));
  });

  await pc("accessible-names", "내용 prop 을 준 렌더 — 단추·입력 등 누를 수 있는 요소의 접근 가능한 이름이 비어 있지 않다(견본 정책이 꼭 필요한 글자를 비우지 않는다)", async (check) => {
    const cases = [
      ["S1Modal", { title: "x" }], ["S1Modal", { title: "x", breakName: "mobile" }], ["S1ModalContent", { title: "x" }],
      ["S1BottomSheet", { title: "x", variant: "dual" }], ["S1BottomSheet", { title: "x", options: ["a", "b"] }],
      ["S1ExpandableCard", { title: "x" }], ["S1Button", { label: "x" }], ["S1TextButton", { label: "x" }], ["S1AssistButton", { label: "x" }],
      ["S1Checkbox", { label: "x" }], ["S1Radio", { label: "x" }], ["S1Chip", { label: "x" }], ["S1Toggle", { label: "x" }],
      ["S1ListRow", { variant: "nav", title: "x" }], ["S1ListRow", { variant: "pick", title: "x" }], ["S1ListRow", { variant: "agree", title: "x" }],
      ["S1ListRow", { variant: "switch", title: "x" }], ["S1ListRow", { variant: "value", title: "x" }],
      ["S1Gnb", { logo: "x" }], ["S1Lnb", { items: ["a", { label: "b", children: ["c"] }] }], ["S1MobileHeader", { title: "x" }],
      ["S1Select", { options: ["a"], placeholder: "x" }], ["S1FilterChip", { title: "x", options: ["a"] }], ["S1Dropdown", { options: ["a"] }],
      ["S1Tab", { tabs: ["a", "b"] }], ["S1MultiToggle", { cells: ["a", "b"] }], ["S1Pagination", { totalPages: 5 }],
      ["S1Input", { label: "x" }], ["S1Input", { label: "x", type: "password" }], ["S1Input", { label: "x", type: "search" }], ["S1Textarea", { label: "x" }],
      ["S1DatePicker", {}], ["S1TimePicker", {}], ["S1MobileBottomNav", { label: "x" }], ["S1Table", { headerCells: ["a"], rows: [["1"]] }]
    ];
    const bad = [];
    for (const [name, props] of cases) {
      if (ONLY.length && !ONLY.includes(name) && !LEGACY) continue;
      await mount(P, { name, props, wait: 200 });
      const empty = await P.eval(`(()=>{const out=[]; const stage=document.getElementById("stage"); const sel='button,a[href],input:not([type=hidden]),textarea,[role=button],[role=tab],[role=switch],[role=option]';
        const nameOf=(e)=>{ if(e.getAttribute("aria-label")) return e.getAttribute("aria-label"); const lb=e.getAttribute("aria-labelledby"); if(lb){ const t=lb.split(/\\s+/).map(i=>document.getElementById(i)?.textContent||"").join(" ").trim(); if(t) return t;} if(e.id){ const l=document.querySelector('label[for="'+e.id+'"]'); if(l&&l.textContent.trim()) return l.textContent.trim(); } if(e.closest("label")?.textContent.trim()) return "label"; if(e.getAttribute("title")) return "t"; if(e.getAttribute("placeholder")) return "p"; return e.textContent.trim(); };
        for(const e of stage.querySelectorAll(sel)){ if(!nameOf(e)) out.push(e.tagName.toLowerCase()+"["+(e.getAttribute("data-s1-part")||e.getAttribute("data-s1-component")||"")+"]"); } return out; })()`);
      if (empty.length) bad.push(`${name} ${js(props)} → 이름 없음: ${[...new Set(empty)].join(", ")}`);
    }
    check("내용 prop 을 준 렌더에서 이름 없는 단추·입력이 없다", bad.length === 0, bad.length ? bad.slice(0, 8).join(" | ") : `${cases.length}개 렌더 모두 이름 있음`, "broken", "꼭 필요한 단추 글자(취소·확인·적용)·aria-label 은 견본 규칙에서 빼고 기본 글자를 남기기");
  });

  await pc("input-types", "입력칸(S1Input) — type · breakName 분리와 옛 이름", async (check) => {
    await mount(P, { scenario: "inputTypes" });
    const kinds = await P.eval(`[...document.querySelectorAll('#stage [data-s1-component="input"]')].map(r=>({breakName: r.getAttribute("data-break"), password: !!r.querySelector('[data-action="password"]'), search: !!r.querySelector('[data-action="search"]'), controlType: r.querySelector('[data-s1-part="control"]').getAttribute("type") || "text", label: r.querySelector('[data-s1-part="control"]').getAttribute("aria-label")}))`);
    check("type=\"password\" 는 보기/숨기기 단추와 password 입력이 나온다", kinds[0]?.password && kinds[0]?.controlType === "password" && kinds[0]?.breakName === "pc", js(kinds[0]));
    check("type=\"search\" 는 돋보기 단추가 나온다", kinds[1]?.search && kinds[1]?.breakName === "pc", js(kinds[1]));
    check("옛 이름 breakName=\"password-mobile\" 도 같은 결과(모바일 비밀번호)", kinds[2]?.password && kinds[2]?.breakName === "mobile", js(kinds[2]));
    check("breakName=\"mobile\" + type=\"search\" 로 조합된다", kinds[3]?.search && kinds[3]?.breakName === "mobile", js(kinds[3]));
    check("label prop 이 입력 요소의 접근 이름(aria-label)이 된다", js(kinds.map((k) => k.label)) === js(["비밀번호", "검색", "옛 이름", "모바일 검색"]), js(kinds.map((k) => k.label)));
  });

  if (want("S1Gnb")) await pc("gnb-data", "GNB — menus 로 메뉴 글자를 넣고, 하위 메뉴(columns)를 함께 그려 펼친다", async (check) => {
    await mount(P, { scenario: "gnbMenus" });
    const labels = await texts(P, '#stage [data-s1-part="menu"]');
    check("menus 로 준 글자가 그려진다(메뉴마다 따로, 견본 \"공지사항·서비스·통계\" 가 남지 않는다)", js(labels) === js(["대시보드", "출입", "설정"]), js(labels));
    check("logo · langLabel 로 준 글자가 그려진다", (await texts(P, '#stage [data-s1-part="logo"]'))[0] === "관제 시스템" && (await texts(P, '#stage [data-s1-part="lang-label"]'))[0] === "English", `${js(await texts(P, '#stage [data-s1-part="logo"]'))} · ${js(await texts(P, '#stage [data-s1-part="lang-label"]'))}`);
    const menu = await P.eval(`(()=>{const m=[...document.querySelectorAll('#stage [data-s1-part="menu"]')].find(m=>m.hasAttribute("aria-controls")); if(!m) return null; m.setAttribute("data-audit-m","menu"); return {controls:m.getAttribute("aria-controls"), panelExists: !!document.getElementById(m.getAttribute("aria-controls"))};})()`);
    if (!menu) throw new Error("하위 메뉴가 있는 메뉴(aria-controls)가 없음");
    check("메뉴가 가리키는 하위 메뉴 판이 부품 안에서 함께 그려진다", menu.panelExists, js(menu));
    await click(P, '[data-audit-m="menu"]');
    await sleep(300);
    const ev = await events(P);
    const st = await P.eval(`(()=>{const m=document.querySelector('[data-audit-m="menu"]'); const p=document.getElementById(m.getAttribute("aria-controls")); return {expanded:m.getAttribute("aria-expanded"), panel: !!p && window.__A.vis(p), titles:[...p.querySelectorAll('[data-depth="1depth"]')].map(e=>e.textContent.trim()), links:[...p.querySelectorAll('[data-depth="2depth"]')].map(e=>({t:e.textContent.trim(), href:e.getAttribute("href"), current:e.getAttribute("aria-current")}))};})()`);
    check("메뉴를 누르면 하위 메뉴가 펼쳐지고 onOpen 한 번", st.expanded === "true" && st.panel && count(ev, "gnb:onOpen") === 1, `${js({ expanded: st.expanded, panel: st.panel })} · onOpen ${count(ev, "gnb:onOpen")}회`);
    check("onOpenChange(true) 도 한 번 온다", count(ev, "gnb:onOpenChange") === 1, `${count(ev, "gnb:onOpenChange")}회`);
    check("하위 메뉴 제목·항목·링크·현재 표시가 columns 대로 그려진다", js(st.titles) === js(["출입 관리", "기록"]) && st.links.some((l) => l.t === "출입 기록" && l.href === "/log") && st.links.some((l) => l.t === "현재" && l.current === "page") && st.links.some((l) => l.t === "방문 예약"), js(st));
    try { await viewportShot(P, path.join(SHOTS_DIR, "scenario-gnb-menus.png")); } catch { /* 무시 */ }
    await P.key("Escape");
    await sleep(200);
  });

  await pc("data-driven", "데이터로 그리는 부품 — LNB · 하위 메뉴 · 꼬리표 · 버튼 · 칩 글자가 견본으로 남지 않는다", async (check) => {
    await mount(P, { name: "S1Lnb", props: { items: [{ label: "알파", current: true, href: "/a" }, { label: "베타", children: [{ label: "감마", href: "/c" }, "델타"], expanded: true }, { label: "엡실론", disabled: true }], "aria-label": "내 메뉴" } });
    const lnb = await P.eval(`({items:[...document.querySelectorAll('#stage [data-s1-part="item"]')].map(e=>e.textContent.trim()), current:[...document.querySelectorAll('#stage [data-s1-part="item"][aria-current="page"]')].map(e=>e.textContent.trim()), disabled:[...document.querySelectorAll('#stage [data-s1-part="item"][aria-disabled="true"]')].map(e=>e.textContent.trim()), sub: !!document.querySelector('#stage [data-s1-part="subitems"]:not([hidden])'), aria:document.querySelector('#stage [data-s1-component="lnb"]').getAttribute("aria-label")})`);
    check("LNB: items 로 준 메뉴·하위 메뉴·현재·비활성이 그려지고 견본(개요·기반 토큰·컴포넌트)이 남지 않는다", js(lnb.items) === js(["알파", "베타", "감마", "델타", "엡실론"]) && js(lnb.current) === js(["알파"]) && js(lnb.disabled) === js(["엡실론"]) && lnb.sub, js(lnb));
    const sub = (await texts(P, '#stage [data-s1-part="item"]'))[2];
    await click(P, '#stage [data-s1-part="item"][aria-controls]');
    check("LNB: 묶음 메뉴를 누르면 접히고 다시 누르면 펼쳐진다(동작 유지)", (await visible(P, '#stage [data-s1-part="subitems"]')) === false, `하위 보임=${await visible(P, '#stage [data-s1-part="subitems"]')} · ${sub}`);

    await mount(P, { name: "S1GnbSubMenu", props: { type: "compact-2", columns: [{ title: "제목A", items: [{ label: "링크1", href: "/1", current: true }, "링크2"] }, { items: ["링크3"] }] } });
    const subMenu = await P.eval(`({type:document.querySelector('#stage [data-s1-component="gnb-sub-menu"]').getAttribute("data-type"), links:[...document.querySelectorAll('#stage [data-depth="2depth"]')].map(e=>({t:e.textContent.trim(),href:e.getAttribute("href"),cur:e.getAttribute("aria-current")})), titles:[...document.querySelectorAll('#stage [data-depth="1depth"]')].map(e=>e.textContent.trim())})`);
    check("GNB 하위 메뉴: columns 의 제목·링크({label, href, current})·글자 항목이 그려지고 type 이 반영된다", subMenu.type === "compact-2" && js(subMenu.titles) === js(["제목A"]) && js(subMenu.links.map((l) => l.t)) === js(["링크1", "링크2", "링크3"]) && subMenu.links[0].href === "/1" && subMenu.links[0].cur === "page", js(subMenu));

    await mount(P, { name: "S1GnbSubMenuItem", props: { depth: "2depth", href: "/x", current: true, children: "내 항목" } });
    const item = await P.eval(`(()=>{const e=document.querySelector('#stage [data-s1-component="gnb-sub-menu-item"]'); return {tag:e.tagName.toLowerCase(), text:e.textContent.trim(), href:e.getAttribute("href"), cur:e.getAttribute("aria-current"), depth:e.getAttribute("data-depth")};})()`);
    check("GNB 하위 메뉴 항목: depth · href · current · children 이 반영된다", js(item) === js({ tag: "a", text: "내 항목", href: "/x", cur: "page", depth: "2depth" }), js(item));

    await mount(P, { name: "S1DataTag", props: { variant: "red", children: "점검" } });
    check("꼬리표: children 이 글자가 된다(견본 \"승인\" 이 남지 않는다)", (await texts(P, '#stage [data-s1-component="data-tag"]'))[0] === "점검", js(await texts(P, '#stage [data-s1-component="data-tag"]')));
    await mount(P, { name: "S1DataTag", props: { label: "라벨로", variant: "blue" } });
    check("꼬리표: label prop 도 글자가 된다", (await texts(P, '#stage [data-s1-component="data-tag"]'))[0] === "라벨로", js(await texts(P, '#stage [data-s1-component="data-tag"]')));

    for (const [name, selector, expected] of [["S1Button", '[data-s1-part="label"]', "저장"], ["S1TextButton", '[data-s1-part="label"]', "저장"], ["S1AssistButton", '[data-s1-part="label"]', "저장"], ["S1Chip", '[data-s1-part="label"]', "저장"]]) {
      await mount(P, { name, props: { children: "저장" } });
      check(`${name}: children 이 라벨이 된다`, (await texts(P, `#stage ${selector}`))[0] === expected, js(await texts(P, `#stage ${selector}`)));
    }
    await mount(P, { name: "S1Tab", props: { tabs: ["가", "나"], children: "$el:내 패널" } });
    check("탭: tabs 글자 + children(패널) 을 직접 둘 수 있다", js(await texts(P, '#stage [data-s1-part="tab"]')) === js(["가", "나"]) && (await P.eval(`!!document.querySelector('#stage [data-audit-el="내 패널"]')`)), js(await texts(P, '#stage [data-s1-part="tab"]')));
    await mount(P, { name: "S1ExpandableCard", props: { title: "제목", subtitle: "부제", children: "$el:펼친 내용" } });
    const card = await P.eval(`({head:[...document.querySelectorAll('#stage [data-s1-part="header"] [data-s1-part]')].map(e=>e.textContent.trim()).filter(Boolean), panel: !!document.querySelector('#stage [data-audit-el="펼친 내용"]'), sample: document.getElementById("stage").textContent.includes("서브타이틀") && document.querySelectorAll('#stage [data-s1-part="panel"] [data-s1-part="subtitle"]').length>0})`);
    check("접힘 카드: title·subtitle 은 머리줄에, children 은 펼침 내용에 들어간다(두 군데에 겹쳐 들어가지 않는다)", card.head.includes("제목") && card.head.includes("부제") && card.panel && !card.sample, js(card));
    await mount(P, { name: "S1MobileHeader", props: { title: "내 화면" } });
    check("모바일 헤더: title 이 제목이 된다", (await texts(P, '#stage [data-s1-part="title"]'))[0] === "내 화면", js(await texts(P, '#stage [data-s1-part="title"]')));
  });

  if (want("S1ExpandableCard")) await pc("expandable-card-open", "접힘 카드 — open/defaultOpen/onOpenChange", async (check) => {
    await mount(P, { name: "S1ExpandableCard", props: { defaultOpen: true, onOpenChange: "$fn:card:onOpenChange" } });
    check("defaultOpen 은 처음부터 펼쳐져 있다", (await attr(P, '#stage [data-s1-part="header"]', "aria-expanded")) === "true", `aria-expanded=${await attr(P, '#stage [data-s1-part="header"]', "aria-expanded")}`);
    await click(P, '#stage [data-s1-part="header"]');
    const ev = await events(P);
    check("눌러 접으면 onOpenChange(false) 가 한 번", count(ev, "card:onOpenChange") === 1 && (await attr(P, '#stage [data-s1-part="header"]', "aria-expanded")) === "false", `${count(ev, "card:onOpenChange")}회`);
  });

  if (want("S1MobileBottomNav")) await mo("bottom-nav-new-name", "하단 탭 — 새 이름 onBeforeChange 로 막고 통과시킨다", async (check) => {
    const sel = () => M.eval(`[...document.querySelectorAll('#stage [data-s1-component="mobile-bottom-nav"]')].map(b=>b.getAttribute("aria-selected"))`);
    await mount(M, { scenario: "bottomNavNewName" });
    await click(M, '#stage [data-s1-component="mobile-bottom-nav"]:nth-child(2)');
    check("onBeforeChange(새 이름)를 거쳐 둘째 탭이 켜진다", js(await sel()) === js(["false", "true", "false"]) && count(await events(M), "navNew:onBeforeChange") === 1, `${js(await sel())} · before ${count(await events(M), "navNew:onBeforeChange")}회`);
    await M.eval("window.__s1.clearEvents()");
    await click(M, '#stage [data-s1-component="mobile-bottom-nav"]:nth-child(3)');
    const ev = await events(M);
    check("onBeforeChange 에서 preventDefault 하면 그 탭으로 안 넘어가고 onChange 도 오지 않는다", js(await sel()) === js(["false", "true", "false"]) && count(ev, "navNew:onChange") === 0 && count(ev, "navNew:onBeforeChange") === 1, `${js(await sel())} · change ${count(ev, "navNew:onChange")}회`);
  });

  if (!ONLY.length) await pc("locked-controls", "제어형 — 부모가 값을 안 바꾸면 눌러도 모양이 value 로 되돌아온다", async (check) => {
    await mount(P, { scenario: "lockedControls" });
    const shown = () => P.eval(`document.querySelector('#stage [data-s1-component="select"] [data-s1-part="value"]').textContent.trim()`);
    check("셀렉트: value=\"a\" 로 처음 \"에이\"", (await shown()) === "에이", `"${await shown()}"`);
    await click(P, '#stage [data-s1-component="select"] [data-s1-part="trigger"]');
    await click(P, '#stage [data-s1-component="select"] [data-s1-part="option"]:nth-child(2)');
    await sleep(250);
    let ev = await events(P);
    check("셀렉트: 눌러도 부모가 안 바꾸면 글자가 \"에이\" 로 되돌아오고, onValueChange 는 한 번 불린다", (await shown()) === "에이" && count(ev, "locked:select") === 1, `"${await shown()}" · ${count(ev, "locked:select")}회`);
    await click(P, '#stage [data-s1-component="toggle"]');
    await sleep(200);
    check("토글: 눌러도 checked=false 라 모양이 그대로 꺼져 있다(onCheckedChange 는 불린다)", (await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")) === "false" && count(await events(P), "locked:toggle") === 1, `aria-checked=${await attr(P, '#stage [data-s1-component="toggle"]', "aria-checked")}`);
    await click(P, '#stage [data-s1-part="page"]:nth-child(3)');
    await sleep(250);
    const cur = await P.eval(`[...document.querySelectorAll('#stage [data-s1-part="page"][aria-current="page"]')].map(b=>b.textContent.trim())`);
    check("페이지네이션: 눌러도 page=1 이라 현재 쪽이 1 로 되돌아온다(onPageChange(3) 는 불린다)", js(cur) === js(["1"]) && count(await events(P), "locked:page") === 1, `현재 ${js(cur)}`);
    await click(P, '#stage [data-s1-part="cell"]:nth-child(2)');
    await sleep(250);
    const checked = await P.eval(`[...document.querySelectorAll('#stage [data-s1-component="multi-toggle"] [data-s1-part="cell"]')].map(c=>c.getAttribute("aria-checked"))`);
    check("멀티 토글: 눌러도 value=\"x\" 라 켜진 칸이 그대로 첫 칸이다", js(checked) === js(["true", "false"]) && count(await events(P), "locked:multi") === 1, js(checked));
  });

  if (!ONLY.length) await pc("readme-examples", "README 예시 코드를 그대로 붙여 넣으면 돌아가고, 눌러 보면 README 가 말한 대로 움직인다", async (check) => {
    const count0 = await P.eval("window.__s1.readmeCount");
    check("README 의 예시가 하나 이상 있다", count0 > 0, `${count0}개`);
    const rendered = [];
    for (let index = 0; index < count0; index += 1) {
      await mount(P, { scenario: "readmeExample", options: { index }, wait: 350 });
      const probe = await P.eval(`({parts: document.querySelectorAll('#stage [data-s1-component]').length, text: document.getElementById("stage").textContent.replace(/\\s+/g," ").slice(0, 80)})`);
      rendered.push(probe.parts);
      check(`예시 ${index + 1}: 그려진다(부품 ${probe.parts}개)`, probe.parts > 0, probe.text);
    }
    const run = async (index, fn) => { await mount(P, { scenario: "readmeExample", options: { index }, wait: 350 }); await fn(); };
    /* 3-1 입력과 폼 */
    await run(0, async () => {
      await click(P, '#stage [data-s1-part="control"]');
      await P.typeText("가나");
      await sleep(100);
      check("예시 1: 입력칸에 친 글자가 React 상태를 거쳐 그대로 남는다", (await P.eval(`document.querySelector('#stage input[data-s1-part="control"]').value`)) === "가나", `값 "${await P.eval(`document.querySelector('#stage input[data-s1-part="control"]').value`)}"`);
      await click(P, '#stage [data-s1-component="checkbox"] [data-s1-part="label"]');
      check("예시 1: 체크박스 라벨(children 으로 준 글자)을 누르면 켜진다", (await P.eval(`document.querySelector('#stage [data-s1-component="checkbox"] input').checked`)) === true, "누른 뒤");
      check("예시 1: 여러 줄 입력의 defaultValue 가 그려진다", (await P.eval(`document.querySelector('#stage textarea').value`)) === "처음 메모", `"${await P.eval(`document.querySelector('#stage textarea').value`)}"`);
    });
    /* 3-2 목록 고르기 */
    await run(1, async () => {
      const line = () => P.eval(`document.querySelector('#stage p').textContent.trim()`);
      check("예시 2: value=\"busan\" 이라 처음 줄에 busan 이 나온다", (await line()).startsWith("busan"), await line());
      await click(P, '#stage [data-s1-component="select"] [data-s1-part="trigger"]');
      await click(P, '#stage [data-s1-component="select"] [data-s1-part="option"]:nth-child(1)');
      await sleep(150);
      check("예시 2: 셀렉트에서 서울을 고르면 아래 줄이 seoul 로 바뀐다", (await line()).startsWith("seoul"), await line());
      await click(P, '#stage [data-s1-component="filter-chip"] [data-s1-part="trigger"]');
      await click(P, '#stage [data-s1-component="filter-chip"] [data-s1-part="option"]:nth-child(2)');
      await sleep(150);
      check("예시 2: 필터 칩에서 이름순을 고르면 아래 줄이 name 으로 바뀐다", (await line()).endsWith("name"), await line());
    });
    /* 3-3 창 */
    await run(2, async () => {
      await click(P, '#stage > div > button[data-s1-component="button"]:nth-of-type(1)');
      await sleep(250);
      check("예시 3: 삭제 단추를 누르면 모달이 열리고 글자 props 가 반영된다", (await visible(P, '#stage [data-s1-component="modal"] [role="dialog"]')) && (await texts(P, '#stage [data-s1-component="modal"] [data-s1-close="confirm"]'))[0] === "삭제" && (await texts(P, '#stage [data-s1-component="modal"] [data-s1-part="title"]'))[0] === "삭제할까요?", js(await texts(P, '#stage [data-s1-component="modal"] [data-s1-part="title"]')));
      await P.key("Escape");
      await sleep(250);
      check("예시 3: Esc 로 닫히면 onOpenChange={setConfirmOpen} 으로 상태가 맞춰져 다시 열 수 있다", !(await visible(P, '#stage [data-s1-component="modal"] [role="dialog"]')), "Esc 후");
      await resetLock(P);
    });
    /* 3-6 표와 페이지 */
    await run(5, async () => {
      const first = () => P.eval(`document.querySelector('#stage tbody tr td:nth-child(2)')?.textContent.trim()`);
      check("예시 6: 처음 표 첫 줄이 장비 1", (await first()) === "장비 1", `"${await first()}"`);
      await click(P, '#stage [data-s1-part="page"]:nth-child(2)');
      await sleep(250);
      check("예시 6: 2쪽을 누르면 표가 11번부터 다시 그려진다(onPageChange={setPage})", (await first()) === "장비 11", `"${await first()}"`);
    });
    /* 3-7 칩 · 탭 */
    await run(6, async () => {
      await click(P, '#stage [data-s1-component="chip"]:nth-child(2)');
      const pressed = await P.eval(`[...document.querySelectorAll('#stage [data-s1-component="chip"]')].map(c=>c.getAttribute("aria-pressed"))`);
      check("예시 7: 칩 묶음에서 진행을 누르면 그 칩 하나만 켜진다", js(pressed) === js(["false", "true", "false"]), js(pressed));
      await click(P, '#stage [data-s1-part="tab"]:nth-child(2)');
      check("예시 7: 탭을 누르면 그 탭의 패널이 보인다", (await P.eval(`[...document.querySelectorAll('#stage [role="tabpanel"]')].filter(p=>!p.hidden).map(p=>p.textContent.trim())`))[0] === "상세 내용", "탭 2");
    });
  });

  /* 옛 코드 그대로(0.22.0): 옛 슬롯 이름 · 옛 목록 모양으로만 쓴 사례를 0.22.0 실측값과 견준다(react-legacy.mjs). */
  if (!ONLY.length || LEGACY) await pc("legacy-usage", "0.22.0 코드 그대로 — 옛 슬롯 이름(parts.label · parts.chevron · 카드 판 안쪽 · LNB item/itemIcon · 셀렉트 parts.value …)이 0.22.0 처럼 일한다", async (check) => {
    const helpers = { mount, click, sleep, events };
    const facts = {};
    for (const c of Legacy.LEGACY_CASES) {
      try { facts[c.key] = await Legacy.collectFacts(P, c, helpers); } catch (error) { facts[c.key] = { __error: String(error.message).slice(0, 200) }; }
    }
    if (LEGACY_RECORD) {
      Legacy.writeGolden(HARNESS, facts, `0.22.0 묶음(${path.basename(ZIP)})을 같은 시험대에서 돌려 얻은 실측값 — 새 버전이 옛 코드를 깨지 않는지 견주는 기준. node scripts/publisher-audit/react.mjs --zip <0.22.0 zip> --legacy-record 로 다시 만든다.`);
      check(`옛 코드 실측값 ${Object.keys(facts).length}건을 기록했다`, true, `${Legacy.goldenPath(HARNESS)}`);
      return;
    }
    const golden = Legacy.readGolden(HARNESS);
    if (!golden) throw new Error(`${Legacy.GOLDEN_FILE} 이 없습니다 — 0.22.0 zip 으로 --legacy-record 를 먼저 돌려야 합니다`);
    for (const c of Legacy.LEGACY_CASES) {
      const was = JSON.stringify(golden.facts[c.key]);
      const now = JSON.stringify(facts[c.key]);
      check(c.title, was !== undefined && was === now, `0.22.0: ${was} · 지금: ${now}`.slice(0, 900), "broken", "옛 슬롯 이름은 새 이름의 별칭으로 계속 받아야 한다(kit.mergeParts 의 aliases) — 0.22.0 에서 쓰던 코드가 같은 모양·같은 동작이어야 한다");
    }
  });

  await pc("ref", "ref 로 루트 DOM 받기 · ref 를 줘도 동작 유지", async (check) => {
    const bad = [];
    for (const name of await P.eval("window.__s1.catalog.filter(c=>c.name && !c.planted).map(c=>c.name)")) {
      if (ONLY.length && !ONLY.includes(name)) continue;
      await P.eval("window.__s1.refProbe = null; true");
      await mount(P, { scenario: "refAndClass", options: { name }, wait: 150 });
      const probe = await P.eval("window.__s1.refProbe");
      if (!probe || !probe.isElement || !probe.component) bad.push(`${name}: ref.current=${probe ? (probe.isElement ? probe.component : "요소 아님") : "없음"}`);
    }
    check("ref 를 주면 부품마다 루트 DOM 요소가 들어온다", bad.length === 0, bad.length ? `${bad.length}종: ${bad.slice(0, 6).join(" · ")}` : "전부 루트 요소", "friction");
    if (want("S1Chip")) {
      await mount(P, { scenario: "chipWithRef" });
      await click(P, '#stage [data-s1-component="chip"]');
      const ev = await events(P);
      const pressed = await attr(P, '#stage [data-s1-component="chip"]', "aria-pressed");
      check("ref 를 줘도 부품 동작(눌러서 켜기)이 그대로다", count(ev, "refChip:onChange") === 1 && pressed === "true", `S1Chip 에 ref 를 주고 한 번 누름 → aria-pressed=${pressed} · onChange ${count(ev, "refChip:onChange")}회`, "broken", "React 19 에서 ref 는 일반 prop 으로 {...rest} 에 섞여 내부 rootRef 를 덮는다 — ref 를 받아 내부 ref 와 합치기(mergeRefs)");
    }
  });

  return results;
}

/* ── 묶음(README·타입) 정적 검사 ─────────────────────── */
function packageStatic(pkgDir) {
  const top = fs.readFileSync(path.join(pkgDir, "README.md"), "utf8");
  const reactDir = path.join(pkgDir, "platform/react");
  const inner = fs.readFileSync(path.join(reactDir, "README.md"), "utf8");
  const indexJs = fs.readFileSync(path.join(reactDir, "index.js"), "utf8");
  const dts = fs.readFileSync(path.join(reactDir, "index.d.ts"), "utf8");
  const pkgJson = JSON.parse(fs.readFileSync(path.join(reactDir, "package.json"), "utf8"));
  const exported = [...indexJs.matchAll(/export \{ default as (\w+) \}/g)].map((m) => m[1]);
  const facts = { exported: exported.length };
  const interfaces = [...dts.matchAll(/export interface (S1\w+)Props[\s\S]*?\n}/g)];

  /* 타입이 있는 export */
  const typed = new Set([...dts.matchAll(/export declare function (\w+)/g)].map((m) => m[1]));
  const untyped = exported.filter((n) => !typed.has(n));
  const extraNamed = [...indexJs.matchAll(/export \{ ([^}]+) \} from/g)].flatMap((m) => m[1].split(",").map((s) => s.trim())).filter((s) => !s.startsWith("default"));
  const untypedNamed = extraNamed.filter((n) => !new RegExp(`\\b${n}\\b`).test(dts));
  packageChecks.typedExports = untyped.length || untypedNamed.length ? "fail" : "pass";
  if (untyped.length) add("types:untyped", "types", "broken", `부품 ${untyped.length}종은 타입 정의가 없습니다.`, untyped.join(", "), "index.d.ts 에 선언 추가");
  if (untypedNamed.length) add("types:untyped-named", "types", "note", `index.js 가 내보내는 값 ${untypedNamed.join(", ")} 의 타입이 index.d.ts 에 없습니다 — TypeScript 에서 import 하면 오류가 납니다(README 1장이 S1_VERSION 을 쓰라고 안내함).`, `index.js: export { ${untypedNamed.join(", ")} } · index.d.ts 에 선언 없음`, "index.d.ts 에 export declare const 추가");

  /* 시작하기 단계 대조 */
  const steps = (top.split("## 시작하기")[1] || "").split("\n## ")[0];
  facts.readmeStartSteps = steps.trim().split("\n").filter(Boolean);
  const cssInTop = [...steps.matchAll(/`([^`]+\.css)`/g)].map((m) => m[1]);
  const missingCss = cssInTop.filter((p) => !fs.existsSync(path.join(pkgDir, p)));
  if (missingCss.length) add("readme:css-missing", "readme", "broken", "README 시작하기가 가리키는 CSS 파일이 묶음에 없습니다.", missingCss.join(", "), "경로 바로잡기");
  const innerCss = [...inner.matchAll(/import "([^"]+\.css)"/g)].map((m) => m[1]);
  const innerPkg = [...new Set([...inner.matchAll(/from "([^"]+)"/g)].map((m) => m[1]))].filter((p) => !/^react(-dom(\/.*)?)?$/.test(p));
  const topImport = (/from "([^"]+)"/.exec(steps) || [])[1];
  facts.importPaths = { top: topImport, inner: innerPkg, topCss: cssInTop, innerCss };
  if (topImport && innerPkg.some((p) => p !== topImport)) add("readme:two-import-paths", "readme", "friction", `README 두 개가 서로 다른 import 경로를 알려 줍니다 — 바깥 README 는 "${topImport}", 안쪽 React README 는 "${innerPkg.join('", "')}". 안쪽 것은 설치 안내가 없는 패키지 이름이라 그대로 붙이면 빌드가 실패합니다.`, `바깥 시작하기 4단계 vs platform/react/README.md 1·2장 · CSS: 바깥 ${js(cssInTop)} / 안쪽 ${js(innerCss)}`, "안쪽 README 예시를 압축 푼 폴더 기준 상대 경로로 통일하거나, 패키지로 쓰려면 설치(npm i ./s1-ui/platform/react) 안내를 추가");
  if (innerCss.some((p) => /typography/.test(p)) && !cssInTop.some((p) => /typography/.test(p))) add("readme:typography", "readme", "friction", "안쪽 README 는 typography.css 도 읽히라는데, 바깥 시작하기에는 없습니다 — 어느 쪽을 따라야 할지 모릅니다.", `바깥 ${js(cssInTop)} · 안쪽 ${js(innerCss)}`, "두 README 의 CSS 목록·순서를 하나로");
  const countClaims = [...inner.matchAll(/(\d+)종/g)].map((m) => Number(m[1])).filter((n) => n !== exported.length);
  if (countClaims.length) add("readme:count", "readme", "note", `React README 가 부품 수를 ${countClaims.join("·")}종이라 적었는데 실제로는 ${exported.length}종입니다.`, `platform/react/README.md 5장 "${countClaims[0]}종"`, "숫자를 생성 값으로 채우기");
  const fontMention = /Pretendard|글꼴|폰트|font/i.test(top + inner);
  packageChecks.readmeFont = fontMention ? "pass" : "fail";
  if (!fontMention) add("readme:font", "readme", "friction", "React README 어디에도 글꼴(Pretendard)을 읽히라는 안내가 없습니다.", "README.md · platform/react/README.md 에 Pretendard/글꼴 언급 0건 (웹 묶음 README 는 head 에 글꼴 링크를 안내함) — 실제 렌더 결과는 font:not-loaded 항목", "시작하기에 글꼴 import(또는 link) 한 줄 추가");
  const mentions = (re) => re.test(top + inner);
  const controlled = { selectedProp: mentions(/onSelectedChange|selected=\{/), openProp: mentions(/open=\{|`open`/), modalHowToOpen: mentions(/data-s1-open|모달.*열/) };
  facts.readmeControlled = controlled;
  if (!controlled.selectedProp || !controlled.openProp || !controlled.modalHowToOpen) add("readme:controlled", "readme", "friction", "README 가 고르기·열기를 React 상태로 다루는 법(칩 selected/onSelectedChange, 바텀시트 open/onClose)을 알려 주지 않고, 모달은 여는 방법 자체가 없습니다 — 타입 정의나 런타임 코드를 열어 봐야 압니다.", `README 언급: selected/onSelectedChange=${controlled.selectedProp} · open=${controlled.openProp} · 모달 여는 법=${controlled.modalHowToOpen}`, "README 2장에 칩 selected · 바텀시트 open/onClose · 모달 여는 법 예시 추가");
  const tsMention = /TypeScript|index\.d\.ts/i.test(top + inner);
  if (!tsMention) add("readme:typescript", "readme", "note", "README 에 TypeScript(타입 정의 index.d.ts) 쓰는 법 안내가 없습니다.", "README 두 개 모두 TypeScript/index.d.ts 언급 0건 (바깥 「이 묶음에 들어있는 것」에 '타입 정의' 한 단어만)", "TypeScript 에서 그대로 import 하면 타입이 붙는다는 한 줄 추가");
  const nextMention = /Next|use client|App Router|서버 컴포넌트/i.test(inner) || /use client|App Router/i.test(top);
  const files = fs.readdirSync(reactDir).filter((f) => f.endsWith(".jsx"));
  const withHooks = files.filter((f) => /\buse(Effect|Ref|Id|State)\(/.test(fs.readFileSync(path.join(reactDir, f), "utf8")));
  const useClient = files.filter((f) => /^\s*(\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(fs.readFileSync(path.join(reactDir, f), "utf8")));
  facts.nextjs = { readmeMentionsNextUsage: nextMention, filesWithHooks: withHooks.length, filesWithUseClient: useClient.length };
  packageChecks.nextUseClient = useClient.length === withHooks.length ? "pass" : "fail";
  if (useClient.length < withHooks.length) add("ssr:use-client", "ssr", "friction", `묶음 제목이 "React · Next.js" 인데, Next.js(App Router) 서버 컴포넌트 파일에서 그대로 import 하면 오류가 날 구조입니다 — 훅(useEffect 등)을 쓰는 ${withHooks.length}개 파일 중 "use client" 표시가 있는 파일이 ${useClient.length}개이고, README 에도 Next.js 쓰는 법이 ${nextMention ? "있습니다" : "없습니다"}.`, `"use client" 없음: ${withHooks.filter((f) => !useClient.includes(f)).slice(0, 5).join(", ")} 외 (정적 확인 — Next.js 로 직접 빌드해 보지는 않음)`, '생성되는 .jsx 맨 위에 "use client" 를 넣거나, README 4장에 "Next.js 에서는 use client 파일 안에서 쓰세요" 안내');
  /* prop 이름 일관성 */
  /* @deprecated 로 표시된 옛 이름은 "함께 받는 별칭" 이다 — 새 이름이 있으니 이름 일관성 검사에서 뺀다(옛 코드가 계속 되게 두는 것이 제안된 해법이다). */
  const dtsLines = dts.split("\n");
  const eventProps = [...new Set(dtsLines.flatMap((line, index) => {
    const m = /^\s+(on[A-Z]\w*)\?:/.exec(line);
    return m && !/@deprecated/.test(dtsLines[index - 1] ?? "") ? [m[1]] : [];
  }))];
  const lowerJoined = eventProps.filter((n) => /^on[A-Z][a-z]{3,}(change|close|open|toggle|collapse|select)$/.test(n));
  facts.eventProps = eventProps;
  packageChecks.propNaming = lowerJoined.length ? "fail" : "pass";
  if (lowerJoined.length) add("api:event-casing", "api", "friction", "이벤트 prop 이름 일부가 React 관례(낱말마다 대문자, onSelectionChange)와 다릅니다 — 자동완성에서 못 찾거나 오타로 씁니다.", `${lowerJoined.join(", ")} (같은 묶음 안에 onSelectedChange 는 관례대로)`, "onBeforeChange · onSelectionChange 로 이름 짓고 옛 이름은 한동안 같이 받기");
  /* onChange 는 입력칸류는 브라우저 이벤트(event.target.value), 고르기류는 배포본 사용자 이벤트(event.detail)다.
     같은 이름이 다른 것을 주는 것 자체는 하위 호환(옛 코드가 event.detail 을 읽는다) 때문에 남긴다 —
     그 대신 고르기류마다 "값만 주는 짝(onValueChange · onSelectedChange · onCheckedChange · onPageChange · onOpenChange)"이 있는지를 본다. */
  const onChangeKinds = { native: [], custom: [], customWithoutValueCallback: [] };
  for (const m of interfaces) {
    if (/(?<![A-Za-z])onChange\?: ChangeEventHandler/.test(m[0])) onChangeKinds.native.push(m[1]);
    else if (/(?<![A-Za-z])onChange\?: \(event: S1Event/.test(m[0])) {
      onChangeKinds.custom.push(m[1]);
      if (!/(onValueChange|onSelectedChange|onCheckedChange|onPageChange|onOpenChange)\?:/.test(m[0])) onChangeKinds.customWithoutValueCallback.push(m[1]);
    }
  }
  facts.onChangeKinds = onChangeKinds;
  if (onChangeKinds.customWithoutValueCallback.length) add("api:onchange-shape", "api", "friction", "고르기류 onChange 는 이벤트(event.detail)를 주는데 값만 주는 짝 콜백이 없는 부품이 있습니다.", `짝 콜백 없음: ${onChangeKinds.customWithoutValueCallback.join(", ")} · event.target 쪽: ${onChangeKinds.native.join(", ")} · event.detail 쪽: ${onChangeKinds.custom.join(", ")}`, "고르기류에 값만 넘기는 onValueChange(value) 를 두기");
  const withOpen = interfaces.filter((m) => /\bopen\?: boolean/.test(m[0])).map((m) => m[1]);
  const withOnOpen = interfaces.filter((m) => /onOpen\?:/.test(m[0])).map((m) => m[1]);
  const valueless = interfaces.filter((m) => /(?<![A-Za-z])onChange\?: \(event: S1Event/.test(m[0]) && !/\b(value|selected|checked|open|page)\?:/.test(m[0])).map((m) => m[1]);
  facts.controlledSurface = { withOpen, withOnOpen, customOnChangeWithoutValue: valueless };
  const missingOpen = withOnOpen.filter((name) => !withOpen.includes(name));
  const windowsMissingOpen = missingOpen.filter((name) => ["S1Modal", "S1ModalContent", "S1BottomSheet"].includes(name));
  if (windowsMissingOpen.length) add("api:open-prop", "api", "friction", `창(${windowsMissingOpen.join(", ")})은 React 상태로 열고 닫을 open prop 이 있어야 합니다.`, `open 없음: ${windowsMissingOpen.join(", ")} · open 있음: ${withOpen.join(", ")}`, "모달·모달콘텐츠·바텀시트에 open/defaultOpen/onOpenChange 생성");
  else if (missingOpen.length) add("api:open-prop", "api", "note", `마우스를 올리거나 초점이 가면 펼쳐지는 부품(${missingOpen.join(", ")})은 open prop 없이 펼침·접힘을 onOpen/onOpenChange 로 알려 주기만 합니다(창과 달리 사용자 동작이 정하는 부품).`, `open 있음: ${withOpen.join(", ")} · 알리기만: ${missingOpen.join(", ")}`, "필요하면 선택적 open 추가");
  if (valueless.length) add("api:no-value-prop", "api", "friction", `고르는 부품 ${valueless.length}종은 고른 값을 React 상태로 넣는(value/defaultValue) 길이 없습니다 — 바뀐 걸 듣기만 할 수 있습니다.`, valueless.join(", "), "value·defaultValue 를 받아 런타임 setValue 와 잇기(제어형/비제어형)");
  const weird = [];
  for (const m of interfaces) {
    if (/S1(Checkbox|Radio)$/.test(m[1]) && /placeholder\?:/.test(m[0])) weird.push(`${m[1]}.placeholder`);
    if (/S1(Checkbox|Radio)$/.test(m[1]) && /defaultValue\?:/.test(m[0])) weird.push(`${m[1]}.defaultValue`);
    if (/name\?: string \| number/.test(m[0])) weird.push(`${m[1]}.name: string|number`);
  }
  if (weird.length) add("types:odd-props", "types", "note", "타입 정의에 그 부품에 뜻이 없는 prop 이 섞여 있습니다(입력칸용 공통 묶음을 그대로 붙인 흔적).", weird.join(" · "), "부품 종류별로 받는 prop 을 나누기");
  facts.indexSignature = /\[attribute: string\]: unknown/.test(dts);
  /* PARTS 이름 vs parts 키 */
  const mismatch = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(reactDir, f), "utf8");
    let parts = [];
    try { parts = JSON.parse((/export const PARTS = (\[[^\]]*\])/.exec(src) || [, "[]"])[1]); } catch { parts = []; }
    const keys = new Set([...src.matchAll(/slot\(partScope, "([\w]+)"\)/g)].map((m) => m[1]));
    const kebab = parts.filter((p) => p.includes("-") && !keys.has(p) && keys.has(p.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())));
    if (kebab.length) mismatch.push(`${f}: ${kebab.slice(0, 3).join(",")}`);
  }
  if (mismatch.length) add("api:parts-names", "api", "note", '부품이 내보내는 PARTS 목록은 "sheet-title" 처럼 줄표 이름인데, parts prop 은 sheetTitle 처럼 낙타 이름만 받습니다 — 목록을 보고 그대로 쓰면 무시됩니다.', `${mismatch.length}개 파일 · ${mismatch.slice(0, 4).join(" | ")}`, "PARTS 를 parts 키 이름으로 내보내거나 두 이름을 다 받기");
  facts.sideEffects = pkgJson.sideEffects;
  return { facts, exported };
}

/* ── 빌드·타입·서버 렌더 ─────────────────────────────── */
function appMain(importPath, cssList, body) {
  return `${cssList.map((c) => `import "${c}";`).join("\n")}
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
${body.imports.replace("__PATH__", importPath)}
createRoot(document.getElementById("root")).render(<StrictMode>${body.jsx}</StrictMode>);
`;
}

function buildChecks(env, exported, readme) {
  const out = {};
  /* README 가 시키는 CSS 를 그 순서 그대로 읽힌다(없으면 필수 둘). */
  const README_CSS = readme.css.length ? readme.css : ["./s1-ui/assets/css/tokens.css", "./s1-ui/s1-ui.css"];
  const oneBody = { imports: 'import { S1Button } from "__PATH__";', jsx: '<S1Button variant="primary" size="md" parts={{ label: "확인" }} />' };
  const allBody = { imports: `import { ${exported.join(", ")} } from "__PATH__";`, jsx: `<>${exported.map((n) => `<${n} />`).join("")}</>` };
  const errLines = (res) => res.out.split("\n").filter((l) => /error|Error|resolve/.test(l)).slice(0, 4).join(" | ").slice(0, 400);
  /* ① 바깥 README 그대로(한 부품) */
  const oneDir = makeApp(env, "readme-one", { "index.html": indexHtml("main.jsx"), "src/main.jsx": appMain("./s1-ui/platform/react", README_CSS, oneBody) });
  const one = viteBuild(env, oneDir);
  out.readmeOne = { ok: one.ok, warnings: one.warnings, errors: one.errors.slice(0, 5), js: jsBytes(path.join(oneDir, "dist")) };
  packageChecks.viteBuild = one.ok && one.warnings.length === 0 ? "pass" : "fail";
  if (!one.ok) add("build:readme", "build", "broken", "README 시작하기 그대로 만든 Vite 앱이 빌드되지 않습니다.", errLines(one), "오류 위치 확인");
  else if (one.warnings.length) add("build:readme-warn", "build", "friction", "README 시작하기 그대로 만든 Vite 앱 빌드에 경고가 찍힙니다.", one.warnings.slice(0, 3).join(" | ").slice(0, 400), "경고 원인 제거");
  /* ② 전부 쓰는 앱 */
  const allDir = makeApp(env, "readme-all", { "index.html": indexHtml("main.jsx"), "src/main.jsx": appMain("./s1-ui/platform/react", README_CSS, allBody) });
  const all = viteBuild(env, allDir);
  out.readmeAll = { ok: all.ok, warnings: all.warnings, errors: all.errors.slice(0, 5), js: jsBytes(path.join(allDir, "dist")) };
  packageChecks.viteBuildAll = all.ok && all.warnings.length === 0 ? "pass" : "fail";
  if (!all.ok) add("build:all", "build", "broken", `${exported.length}종을 모두 import 한 앱이 빌드되지 않습니다.`, errLines(all), "오류 위치 확인");
  else if (all.warnings.length) add("build:all-warn", "build", "friction", `${exported.length}종을 모두 쓰는 앱 빌드에 경고가 찍힙니다.`, all.warnings.slice(0, 3).join(" | ").slice(0, 400), "경고 원인 제거");
  /* 빈 앱(React 만) — 기준선 */
  const baseDir = makeApp(env, "react-only", { "index.html": indexHtml("main.jsx"), "src/main.jsx": 'import { createRoot } from "react-dom/client";\ncreateRoot(document.getElementById("root")).render(<b>hi</b>);\n' });
  const base = viteBuild(env, baseDir);
  out.reactOnly = { ok: base.ok, js: jsBytes(path.join(baseDir, "dist")) };
  if (one.ok && all.ok && base.ok) {
    const oneOwn = out.readmeOne.js.gz - out.reactOnly.js.gz;
    const allOwn = out.readmeAll.js.gz - out.reactOnly.js.gz;
    out.treeShaking = { reactOnlyGz: out.reactOnly.js.gz, oneComponentGz: out.readmeOne.js.gz, allComponentsGz: out.readmeAll.js.gz, oneOwnGz: oneOwn, allOwnGz: allOwn, ratio: allOwn > 0 ? Math.round((oneOwn / allOwn) * 1000) / 1000 : null };
    packageChecks.treeShaking = out.treeShaking.ratio !== null && out.treeShaking.ratio < 0.3 ? "pass" : "fail";
    if (packageChecks.treeShaking === "fail") add("build:tree-shaking", "build", "friction", `버튼 하나만 import 해도 부품 ${exported.length}종 코드의 ${Math.round(out.treeShaking.ratio * 100)}% 가 따라 들어옵니다 — 쓸 것만 꺼내 써도 앱이 가벼워지지 않습니다.`, `JS gzip: React 만 ${out.reactOnly.js.gz}B · 버튼 1종 앱 ${out.readmeOne.js.gz}B(+${oneOwn}) · ${exported.length}종 앱 ${out.readmeAll.js.gz}B(+${allOwn})`, "index.js 재수출·런타임 모듈의 부작용 확인(sideEffects 선언이 이 경로에 적용되는지)");
    else add("build:tree-shaking-ok", "build", "note", `버튼 하나만 쓰면 부품 코드는 ${exported.length}종의 ${Math.round(out.treeShaking.ratio * 100)}% 만 들어옵니다(트리 셰이킹 됨).`, `JS gzip: React 만 ${out.reactOnly.js.gz}B · 버튼 1종 앱 ${out.readmeOne.js.gz}B · ${exported.length}종 앱 ${out.readmeAll.js.gz}B`, "—");
  } else skip("treeShaking", "빌드 실패로 크기 비교 불가");
  /* ③ 안쪽 README 의 예시 코드를 그대로 붙여 넣은 앱 — 전부 빌드되고(경고 0) 서버에서도 그려져야 한다 */
  if (readme.examples.length) {
    const files = { "index.html": indexHtml("main.jsx") };
    readme.examples.forEach((source, index) => { files[`src/readme-example-${index}.jsx`] = source; });
    files["src/main.jsx"] = `${README_CSS.map((c) => `import "${c}";`).join("\n")}
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
${readme.examples.map((_, index) => `import Example${index} from "./readme-example-${index}.jsx";`).join("\n")}
createRoot(document.getElementById("root")).render(<StrictMode>{[${readme.examples.map((_, index) => `<Example${index} key={${index}} />`).join(", ")}]}</StrictMode>);
`;
    const exDir = makeApp(env, "readme-examples", files);
    const exB = viteBuild(env, exDir);
    out.readmeExamples = { count: readme.examples.length, ok: exB.ok, warnings: exB.warnings, errors: exB.errors.slice(0, 5) };
    packageChecks.readmeExamplesBuild = exB.ok && exB.warnings.length === 0 ? "pass" : "fail";
    packageChecks.innerReadmeImports = exB.ok ? "pass" : "fail";
    if (!exB.ok) add("build:readme-examples", "readme", "broken", "React README 의 예시 코드를 그대로 붙여 넣으면 빌드가 실패합니다.", errLines(exB), "예시의 import 경로·prop 이름을 실제 묶음과 맞추기");
    else if (exB.warnings.length) add("build:readme-examples-warn", "readme", "friction", "React README 예시를 붙여 넣은 앱 빌드에 경고가 찍힙니다.", exB.warnings.slice(0, 3).join(" | ").slice(0, 400), "경고 원인 제거");
    /* lint: 소스 폴더 안에 s1-ui 를 넣은 모습 그대로 검사 — 묶음 자기 파일에서는 오류가 나오면 안 되고, 내가 쓴 진짜 문제는 잡아야 한다 */
    fs.writeFileSync(path.join(exDir, "src/zz-bad.jsx"), 'import { S1Button } from "./s1-ui/platform/react";\nexport default function Bad() { return <S1Button style={{ color: "#ff0000" }} />; }\n');
    const lint = runNode(exDir, [path.join(exDir, "src/s1-ui/tools/s1-ui-lint.mjs"), "src"]);
    const lintLines = lint.out.split("\n").filter((l) => /^✖|^⚠/.test(l));
    const inPackage = lintLines.filter((l) => /src\/s1-ui\//.test(l));
    const mine = lintLines.filter((l) => /zz-bad\.jsx/.test(l));
    out.lint = { totalLines: lintLines.length, inPackage: inPackage.length, caughtRealProblem: mine.length > 0 };
    packageChecks.lintSkipsOwnFiles = inPackage.length === 0 ? "pass" : "fail";
    packageChecks.lintCatchesRealProblem = mine.length > 0 ? "pass" : "fail";
    if (inPackage.length) add("lint:own-files", "lint", "friction", `묶음에 든 규칙 검사 도구가 묶음 자기 파일에서 ${inPackage.length}건을 잡습니다 — 내가 쓴 코드의 진짜 문제가 묻힙니다.`, inPackage.slice(0, 2).join(" | ").slice(0, 300), "검사에서 s1-ui 폴더 자신을 빼기");
    if (!mine.length) add("lint:misses-real", "lint", "friction", "내가 쓴 코드의 진짜 문제(직접 적은 색)를 규칙 검사 도구가 잡지 못합니다.", lint.out.slice(0, 300), "검사 규칙 확인");
  } else {
    add("readme:no-examples", "readme", "friction", "React README 에 그대로 붙여 넣을 예시 코드(```jsx)가 없습니다.", "platform/react/README.md", "예시 추가");
  }
  return out;
}

function typeCheck(env, appDir) {
  if (!env.tsc) { skip("typescript", "환경에 typescript 가 없음"); return null; }
  fs.copyFileSync(path.join(HARNESS, "usage.tsx"), path.join(appDir, "src/usage.tsx"));
  /* README 예시도 TypeScript 로 받아 본다 — .tsx 로 복사해 strict 로 검사(TS 개발자가 그대로 붙여 넣는 경우). */
  const readmeTs = fs.readdirSync(path.join(appDir, "src")).filter((f) => /^readme-example-\d+\.jsx$/.test(f)).map((f) => {
    const target = f.replace("readme-example-", "readme-ts-").replace(".jsx", ".tsx");
    fs.copyFileSync(path.join(appDir, "src", f), path.join(appDir, "src", target));
    return `src/${target}`;
  });
  fs.writeFileSync(path.join(appDir, "tsconfig.audit.json"), `${js({ compilerOptions: { target: "es2022", lib: ["ES2022", "DOM"], module: "esnext", moduleResolution: "bundler", jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: false, types: [] }, files: ["src/usage.tsx", ...readmeTs] })}\n`);
  const res = runNode(appDir, [env.tsc, "-p", "tsconfig.audit.json", "--pretty", "false"]);
  const lines = res.out.split("\n").filter((l) => /error TS/.test(l));
  const usage = fs.readFileSync(path.join(appDir, "src/usage.tsx"), "utf8").split("\n");
  const expectLabelAt = (lineNo) => { for (let i = lineNo - 1; i >= 0; i -= 1) { const m = /EXPECT:([\w-]+)/.exec(usage[i]); if (m) return m[1]; } return null; };
  const okEnd = usage.findIndex((l) => /export function Expect/.test(l)) + 1;
  const okErrors = [];
  const readmeTsErrors = [];
  const dtsErrors = [];
  const notCaught = [];
  const otherErrors = [];
  for (const line of lines) {
    const m = /^(.+?)\((\d+),\d+\): error (TS\d+): (.*)$/.exec(line.trim());
    if (!m) { otherErrors.push(line.trim()); continue; }
    const [, file, lineNo, code, message] = m;
    if (/index\.d\.ts/.test(file)) dtsErrors.push(`${code} ${message}`);
    else if (/readme-ts-\d+\.tsx/.test(file)) readmeTsErrors.push(`${path.basename(file)} 줄 ${lineNo}: ${code} ${message}`);
    else if (/usage\.tsx/.test(file)) {
      if (code === "TS2578") notCaught.push(expectLabelAt(Number(lineNo)) || `줄 ${lineNo}`);
      else if (Number(lineNo) < okEnd) okErrors.push(`줄 ${lineNo}: ${code} ${message}`);
    } else otherErrors.push(line.trim());
  }
  const out = { version: env.versions.typescript, strict: true, skipLibCheck: false, exitCode: res.code, okErrors, readmeTsErrors, dtsErrors, notCaught, otherErrors: otherErrors.slice(0, 5) };
  packageChecks.typescriptAccepts = okErrors.length === 0 && dtsErrors.length === 0 ? "pass" : "fail";
  packageChecks.readmeExamplesTypeCheck = readmeTsErrors.length === 0 ? "pass" : "fail";
  if (readmeTsErrors.length) add("types:readme-examples", "types", "friction", "README 예시를 TypeScript(strict) 파일에 그대로 붙여 넣으면 타입 오류가 납니다.", readmeTsErrors.slice(0, 4).join(" | ").slice(0, 400), "예시를 TS 에서도 통과하게(as const · 타입 좁히기)");
  packageChecks.typescriptCatchesMistakes = notCaught.length === 0 ? "pass" : "fail";
  if (dtsErrors.length) add("types:dts-errors", "types", "broken", "TypeScript(strict)가 index.d.ts 자체에서 오류를 냅니다.", dtsErrors.slice(0, 3).join(" | "), "index.d.ts 생성 바로잡기");
  if (okErrors.length) add("types:readme-code", "types", "broken", "README 예시·타입 정의대로 쓴 TSX 가 TypeScript(strict)에서 오류가 납니다.", okErrors.slice(0, 3).join(" | "), "타입 정의를 README 예시와 맞추기");
  const expectCount = usage.filter((line) => /@ts-expect-error/.test(line)).length;
  const what = {
    variant: '없는 variant("danger")', "typo-prop": "오타 난 prop(varaint)", "size-type": "size 에 숫자", "onchange-param": "onSelectedChange 에 잘못된 함수",
    "input-onchange-any": "Input onChange 의 event 가 any", "modal-typo": "Modal 의 오타 prop", "value-change-param": "onValueChange 에 잘못된 함수",
    "option-shape": "value 없는 목록 항목", "event-detail": "이벤트 detail 에 없는 속성", "parts-key": "parts 에 없는 슬롯 이름", "disabled-type": "disabled 에 글자",
    "onchange-is-event": "고르는 부품 onChange 가 값을 받는 함수도 통과", "onvaluechange-is-value": "onValueChange 가 이벤트를 받는 함수도 통과"
  };
  if (notCaught.length) add("types:not-caught", "types", "friction", `타입 정의가 흔한 실수를 못 잡습니다: ${notCaught.map((k) => what[k] || k).join(" · ")} — 오류 없이 통과해 실행해 봐야 압니다.`, `strict tsc 에서 @ts-expect-error 가 쓰이지 않음(TS2578) ${notCaught.length}/${expectCount}건 — S1BaseProps 의 [attribute: string]: unknown(아무 prop 이나 통과) · event: any`, "인덱스 시그니처 대신 React.HTMLAttributes<HTMLElement> 상속 + data-*/aria-* 만 허용, onChange 에 구체 이벤트 타입");
  return out;
}

function ssrNode(env, appDir) {
  fs.copyFileSync(path.join(HARNESS, "ssr-entry.jsx"), path.join(appDir, "src/ssr-entry.jsx"));
  const build = runNode(appDir, [env.vite, "build", "--ssr", "src/ssr-entry.jsx", "--outDir", "dist-ssr"]);
  if (build.code !== 0) { add("ssr:build", "ssr", "broken", "서버 렌더용으로 묶는(vite build --ssr) 단계가 실패합니다.", build.out.split("\n").filter((l) => /error/i.test(l)).slice(0, 3).join(" | ").slice(0, 300), "서버에서 import 할 때 깨지는 모듈 확인"); return { built: false }; }
  const entry = fs.readdirSync(path.join(appDir, "dist-ssr")).find((f) => /^ssr-entry\.(m?js)$/.test(f));
  const run = runNode(appDir, [path.join(appDir, "dist-ssr", entry)], 60000);
  const m = /__SSR_RESULT__(.*)/.exec(run.out);
  if (!m) { packageChecks.ssrRenderToString = "fail"; add("ssr:run", "ssr", "broken", "서버(Node)에서 부품을 import 하는 순간 오류가 납니다.", run.out.split("\n").filter(Boolean).slice(-4).join(" | ").slice(0, 400), "모듈 맨 위에서 window/document 를 만지지 않게"); return { built: true, ran: false }; }
  const res = JSON.parse(m[1]);
  const failed = res.out.filter((r) => !r.ok);
  packageChecks.ssrRenderToString = failed.length ? "fail" : "pass";
  if (failed.length) add("ssr:render", "ssr", "broken", `서버(Node)에서 renderToString 하면 ${failed.length}개 조합이 오류를 냅니다.`, failed.slice(0, 3).map((r) => `${r.name}[${r.breakName}]: ${r.error}`).join(" | "), "서버에서 그릴 때 브라우저 전역에 기대지 않게");
  return { built: true, ran: true, cases: res.out.length, failed, warnings: run.out.split("\n").filter((l) => /warn/i.test(l)).slice(0, 3) };
}

/* ── 본 실행 ─────────────────────────────────────────────── */
async function openHarness(cdp, origin, viewport) {
  const page = await openPage(cdp, `${origin}/`, viewport);
  const ready = await waitFor(page, "window.__s1ready === true", 30000);
  if (!ready) throw new Error(`시험대가 준비되지 않았습니다(${viewport.mobile ? "mobile" : "pc"}): ${page.exceptions.concat(page.consoleErrors).map((e) => e.text).slice(0, 3).join(" | ")}`);
  await page.call(installHelper);
  await page.call(installIconsOverride);
  await page.eval(`(()=>{const s=document.createElement("style"); s.textContent="body{margin:0;background:#fff}"; document.head.append(s); return true;})()`);
  return page;
}

async function selftest(env, chrome) {
  const appDir = makeApp(env, "selftest", {
    "index.html": indexHtml("harness.jsx"),
    "src/harness.jsx": fs.readFileSync(path.join(HARNESS, "harness.jsx"), "utf8"),
    "src/planted.jsx": fs.readFileSync(path.join(HARNESS, "planted-broken.jsx"), "utf8")
  });
  const server = await startDevServer(env, appDir);
  const page = await openHarness(chrome.cdp, server.origin, PC);
  const catalog = await page.eval("window.__s1.catalog");
  const cases = casesFor(catalog.filter((c) => c.planted), "");
  const byName = {};
  for (const c of cases) byName[c.name] = await auditCase(page, c, { shots: false });
  const has = (name, keyRe) => (byName[name]?.findings || []).some((f) => keyRe.test(f.id));
  /* 이벤트 두 번 — 심은 부품을 StrictMode 로 붙이고 한 번 클릭하면 문서 듣기가 두 번 반응한다 */
  await page.eval("window.__plantedClicks = 0, true");
  await mount(page, { name: "PlantedDoubleBind", props: {}, strict: true });
  await page.eval("window.__plantedClicks = 0, true");
  await click(page, '#stage [data-s1-component="planted-double-bind"]');
  const clicks = await page.eval("window.__plantedClicks");
  await page.eval("window.__s1.unmount()");
  /* 진짜 부품 하나(S1Button)는 대조군으로 깨끗해야 한다 */
  const control = await auditCase(page, { name: "S1Button", file: "button.jsx", breakName: "pc", multiBreak: true, slots: ["label"], parts: ["label"], viewport: "pc" }, { shots: false });
  const results = [
    ["콘솔 오류 탐지(PlantedConsoleError)", has("PlantedConsoleError", /console-error/)],
    ["StrictMode 이중 바인딩 탐지(PlantedDoubleBind)", has("PlantedDoubleBind", /strict-double-bind/)],
    ["떼어도 남는 듣기 탐지(PlantedDoubleBind)", has("PlantedDoubleBind", /listener-leak/)],
    ["한 번 클릭에 두 번 반응 실측(PlantedDoubleBind)", clicks >= 2],
    ["prop 이 바뀌어도 화면 그대로 탐지(PlantedStaleProp)", has("PlantedStaleProp", /prop-stale/)],
    ["대조군 PlantedGood 은 아무것도 안 걸림", (byName.PlantedGood?.findings || []).filter((f) => f.severity !== "note").length === 0],
    ["대조군 S1Button 은 일반 탐지기에 안 걸림", control.findings.filter((f) => f.severity !== "note").length === 0]
  ];
  let failed = 0;
  for (const [name, ok] of results) { if (!ok) failed += 1; console.log(`${ok ? "✅" : "❌"} ${name}`); }
  if (failed) console.log(js({ ...Object.fromEntries(Object.entries(byName).map(([k, v]) => [k, v.findings.map((f) => f.id)])), S1Button: control.findings.map((f) => `${f.id} ${f.evidence}`) }));
  console.log(`\nSELFTEST ${failed ? "FAIL" : "PASS"} — 탐지기 ${results.length - failed}/${results.length} (심은 부품 클릭 1회에 반응 ${clicks}회)`);
  await page.close();
  server.stop();
  return failed === 0;
}

async function main() {
  const env = requireEnv();
  const chromePath = findChrome();
  if (!chromePath) { console.log("[react-audit] 크롬이 없어 실행하지 못했습니다(검사 0건)."); process.exit(2); }
  if (!fs.existsSync(ZIP)) {
    log(`묶음이 없어 새로 만듭니다: ${path.relative(ROOT, ZIP)}`);
    const built = spawnSync(process.execPath, [path.join(ROOT, "scripts/build-ui-package-zip.js")], { stdio: "inherit", cwd: ROOT });
    if (built.status !== 0 || !fs.existsSync(ZIP)) throw new Error("묶음을 만들지 못했습니다");
  }
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  const started = Date.now();

  if (SELFTEST) {
    const chrome = await launchChrome(chromePath);
    cleanups.push(chrome.close);
    const ok = await selftest(env, chrome);
    cleanupAll();
    process.exit(ok ? 0 : 1);
  }

  if (!ONLY.length) for (const f of fs.readdirSync(SHOTS_DIR)) if (f.endsWith(".png")) fs.rmSync(path.join(SHOTS_DIR, f));

  const appDir = makeApp(env, "harness", {
    "index.html": indexHtml("harness.jsx"),
    "src/harness.jsx": fs.readFileSync(path.join(HARNESS, "harness.jsx"), "utf8"),
    "src/planted.jsx": "export const catalog = [];\nexport default {};\n"
  });
  const pkgDir = path.join(appDir, "src/s1-ui");
  const manifest = JSON.parse(fs.readFileSync(path.join(pkgDir, "manifest.json"), "utf8"));
  log(`묶음 ${manifest.version} · React ${env.versions.react} · Vite ${env.versions.vite} · TypeScript ${env.versions.typescript}`);
  const statics = packageStatic(pkgDir);
  const readmeText = fs.readFileSync(path.join(pkgDir, "platform/react/README.md"), "utf8");
  const readme = {
    css: [...(/```js\n([\s\S]*?)```/.exec(readmeText)?.[1] ?? "").matchAll(/^import "([^"]+\.css)";/gm)].map((m) => m[1]),
    examples: [...readmeText.matchAll(/```jsx\n([\s\S]*?)```/g)].map((m) => m[1])
  };
  README_FONT_LINK = /<link rel="stylesheet" href="(https:[^"]*pretendard[^"]*)">/i.exec(readmeText)?.[1] ?? null;
  /* 0.22.0 zip 으로 옛 코드 실측값을 기록할 때(--legacy-record)는 옛 README 의 조각 예시(그대로 붙이면 빌드 안 되는 것)를 시험대에 넣지 않는다. */
  if (!LEGACY_RECORD) readme.examples.forEach((source, index) => fs.writeFileSync(path.join(appDir, `src/readme-example-${index}.jsx`), source));
  if (README_FONT_LINK) fs.writeFileSync(path.join(appDir, "index.html"), indexHtml("harness.jsx"));

  let builds = null;
  let types = null;
  let ssr = null;
  if (!ONLY.length) {
    log("빌드·타입·서버 렌더 …");
    try { builds = buildChecks(env, statics.exported, readme); } catch (error) { skip("viteBuild", error.message); }
    try { types = typeCheck(env, appDir); } catch (error) { skip("typescript", error.message); }
    try { ssr = ssrNode(env, appDir); } catch (error) { skip("ssrNode", error.message); }
  }
  skip("nextjsBuild", 'Next.js 는 설치하지 않았다(수백 MB) — "use client" 표시 여부만 정적으로 봤다(ssr:use-client 항목)');

  log("개발 서버 + 크롬 …");
  const server = await startDevServer(env, appDir);
  let chrome = await launchChrome(chromePath);
  cleanups.push(() => chrome.close());
  const vpOf = (which) => (which === "pc" ? PC : MOBILE);
  const holder = { pc: await openHarness(chrome.cdp, server.origin, PC), mobile: await openHarness(chrome.cdp, server.origin, MOBILE), restarts: 0 };
  /* 멈춘 탭을 닫고 새 탭을 연다. 크롬 자체가 응답하지 않으면 크롬을 그룹째 끄고 새로 띄운다. */
  holder.reopen = async (which) => {
    try { return await openHarness(chrome.cdp, server.origin, vpOf(which)); } catch (error) {
      log(`  크롬이 응답하지 않아 새로 띄웁니다(${error.message.slice(0, 60)})`);
      try { chrome.close(); } catch { /* 무시 */ }
      chrome = await launchChrome(chromePath);
      holder.restarts += 1;
      const other = which === "pc" ? "mobile" : "pc";
      holder[other] = await openHarness(chrome.cdp, server.origin, vpOf(other));
      return openHarness(chrome.cdp, server.origin, vpOf(which));
    }
  };
  const catalog = await holder.pc.eval("window.__s1.catalog");
  const cases = casesFor(catalog, path.join(pkgDir, "platform/react"));
  const missingCatalog = statics.exported.filter((n) => !catalog.some((c) => c.name === n));
  if (missingCatalog.length) skip("catalog", `개별 모듈과 이어지지 않은 export: ${missingCatalog.join(", ")}`);
  log(`부품 ${new Set(cases.map((c) => c.name)).size}종 · 조합 ${cases.length}개 …`);
  const caseResults = [];
  for (const c of cases) {
    const which = c.viewport === "mobile" ? "mobile" : "pc";
    const page = holder[which];
    try {
      const r = await auditCase(page, c);
      caseResults.push(r);
      for (const f of r.findings) if (f.area === "console") for (const part of f.evidence.split(" | ")) seenConsole.add(short(part, 120));
      findings.push(...r.findings);
      notChecked.push(...r.notChecked);
      const bad = r.findings.filter((f) => f.severity !== "note").length;
      log(`  ${c.name}[${c.breakName}] ${bad ? `발견 ${bad}` : "ok"}`);
    } catch (error) {
      caseResults.push({ component: c.name, breakName: c.breakName, error: error.message });
      notChecked.push({ check: `${c.name}[${c.breakName}] 일부/전체`, reason: `실행 오류: ${error.message.slice(0, 200)}` });
      log(`  ${c.name}[${c.breakName}] 실행 오류: ${error.message.slice(0, 120)}`);
      const alive = await Promise.race([page.eval("1").then(() => true).catch(() => false), sleep(4000).then(() => false)]);
      if (!alive) {
        add(`${c.name}:${c.breakName}:hang`, "lifecycle", "broken", `${c.name}[${c.breakName}] 를 붙였다 떼는 동안 페이지가 멈춥니다(응답 없음).`, error.message.slice(0, 200), "멈춘 지점의 런타임 반복(초점 되돌리기·관찰자) 확인");
        try { await page.close(); } catch { /* 무시 */ }
        holder[which] = await holder.reopen(which);
      } else { try { await page.eval("window.__s1.unmount()"); } catch { /* 무시 */ } }
    }
  }

  const fonts = caseResults.filter((r) => r.font && r.font.platform && r.font.platform.length);
  const webFont = fonts.filter((r) => r.font.platform.some((p) => /Pretendard/i.test(p) && /웹폰트/.test(p)));
  const pretendardAny = fonts.filter((r) => r.font.platform.some((p) => /Pretendard/i.test(p)));
  packageChecks.fontResolved = fonts.length ? (webFont.length === fonts.length ? "pass" : "fail") : "notChecked";
  if (fonts.length && webFont.length < fonts.length) add("font:not-loaded", "font", "friction", `README 대로 하면 Pretendard 웹폰트가 읽히지 않습니다 — ${fonts.length}개 조합 중 ${fonts.length - pretendardAny.length}개는 다른 글꼴로, ${pretendardAny.length - webFont.length}개는 이 컴퓨터에 깔린 Pretendard 로 그려졌습니다(사용자 컴퓨터엔 없을 수 있음).`, `실제 렌더 글꼴: ${[...new Set(fonts.map((r) => r.font.platform.join("+")))].slice(0, 3).join(" | ")} · CSS 지정: ${fonts[0].font.family}`, "시작하기에 Pretendard 읽히기(웹폰트 import) 단계 추가 또는 s1-ui.css 에 @font-face 포함");

  log("상호작용 시나리오 …");
  const scenarios = await interactionScenarios(holder);

  const chromeVersion = await chrome.cdp.send("Browser.getVersion").then((v) => v.product).catch(() => null);
  try { await holder.pc.close(); } catch { /* 무시 */ }
  try { await holder.mobile.close(); } catch { /* 무시 */ }
  server.stop();

  /* 결과 */
  const order = { broken: 0, friction: 1, note: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  const totals = { broken: 0, friction: 0, note: 0 };
  for (const f of findings) totals[f.severity] += 1;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = {
    tool: "scripts/publisher-audit/react.mjs",
    generatedAt: new Date().toISOString(),
    durationSec: Math.round((Date.now() - started) / 1000),
    environment: { node: process.version, ...env.versions, chrome: chromeVersion, runtimeMode: "Vite 개발 서버(React development 빌드 · StrictMode)", setup: "scripts/publisher-audit/react-env-setup.sh" },
    package: { zip: path.relative(ROOT, ZIP), version: manifest.version, canonicalFingerprint: manifest.canonicalFingerprint, exportedComponents: statics.exported.length, readmeStartSteps: statics.facts.readmeStartSteps },
    method: {
      app: "Vite 기본 틀(@vitejs/plugin-react) 임시 앱의 src/ 에 zip 을 그대로 풀고, README 시작하기 3·4단계대로 tokens.css → s1-ui.css → ./s1-ui/platform/react 에서 import",
      runtime: "Vite 개발 서버(React 개발 빌드 — 경고·StrictMode 이중 실행이 살아 있음) + 헤드리스 크롬(CDP 실제 마우스·키)",
      perComponent: "StrictMode 로 붙이기 → 콘솔/React 경고 · 크기 · 아이콘(켠/끈 화면 픽셀 비교) · 실제 렌더 글꼴 · parts 값 A→B 갱신 · 슬롯 겹침 · className 갱신 · 떼기(문서 듣기·스크롤 잠금) · StrictMode 아닌 때와 듣기 수 비교 · renderToString 마크업 위 hydrateRoot",
      listenerCount: "앱보다 먼저 EventTarget.addEventListener/removeEventListener 를 감싸 대상별 살아 있는 듣기 수를 센다",
      viewports: { pc: PC, mobile: MOBILE, rule: "breakName 에 mobile 이 들었거나 이름이 Mobile*/BottomSheet* 인 부품 → 375 폭" },
      typescript: "strict · skipLibCheck=false · README 예시(OK 구역) + 일부러 틀린 코드(@ts-expect-error)",
      treeShaking: "같은 Vite 설정으로 React 만 / 버튼 1종 / 전 종 앱을 각각 build 해 JS gzip 크기 비교",
      ssr: "vite build --ssr 로 묶어 Node 에서 모든 부품·breakName renderToString"
    },
    summary: { components: new Set(cases.map((c) => c.name)).size, cases: cases.length, scenarios: scenarios.length, ...totals, notChecked },
    packageChecks,
    packageFacts: statics.facts,
    builds,
    typescript: types,
    ssr,
    findings,
    cases: caseResults.map(({ findings: f, notChecked: n, ...rest }) => ({ ...rest, findingIds: (f || []).map((x) => x.id) })),
    scenarios
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const text = JSON.stringify(result, null, 2).replace(new RegExp(esc(appDir), "g"), "<임시앱>").replace(new RegExp(esc(env.env), "g"), "<환경폴더>");
  fs.writeFileSync(path.join(OUT_DIR, ONLY.length ? "result.only.json" : "result.json"), `${text}\n`);
  log(`부품 ${result.summary.components}종(${cases.length}조합) · 시나리오 ${scenarios.length} · broken ${totals.broken} · friction ${totals.friction} · note ${totals.note} · 확인 못 함 ${notChecked.length} · ${result.durationSec}초`);
  log(`결과: ${path.relative(ROOT, path.join(OUT_DIR, ONLY.length ? "result.only.json" : "result.json"))}`);
  cleanupAll();
  process.exit(0);
}

main().catch((error) => { console.error(`[react-audit] 실행 오류: ${error.stack || error}`); cleanupAll(); process.exit(1); });
