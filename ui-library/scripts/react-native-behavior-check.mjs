#!/usr/bin/env node
/**
 * react-native-behavior-check.mjs — RN 부품을 실제로 눌러 보고 동작을 확인한다.
 * --------------------------------------------------------------------------
 * 모양(react-native-render-compare)은 웹과 견줘서, 동작은 승인 배포본의 동작 계약(components/*.js ·
 * platform/behavior.json)이 정한 대로 되는지 사례로 확인한다. react-native-web 으로 헤드리스 크롬에서
 * 부품을 그리고 click 을 보내, 바뀐 속성(aria-* )과 보이는 칸을 읽는다.
 *
 *   사용: node ui-library/scripts/react-native-behavior-check.mjs
 *   종료코드: 0 전부 통과 · 1 실패가 있음 · 2 실행 불가
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const require = createRequire(import.meta.url);
const { spawnChrome, killChromeTree } = require("../../scripts/lib/chrome-proc.js");
const here = path.dirname(fileURLToPath(import.meta.url));
const libraryRoot = path.resolve(here, "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const rnRoot = path.join(libraryRoot, "dist", "platform", "react-native");

function findChrome() {
  for (const candidate of [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"].filter(Boolean)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function main() {
  if (!fs.existsSync(path.join(rnRoot, "index.js"))) { console.error("❌ platform/react-native 가 없습니다. 먼저 `npm run ui:build` 를 실행하세요."); return 2; }
  const chrome = findChrome();
  if (!chrome) { console.error("❌ 크롬을 찾지 못했습니다. CHROME_PATH 를 지정하세요."); return 2; }

  const work = fs.mkdtempSync(path.join(os.tmpdir(), "s1-rn-behavior-"));
  const outfile = path.join(work, "behavior.js");
  await esbuild.build({
    entryPoints: [path.join(here, "react-native-behavior-cases.jsx")],
    outfile,
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    loader: { ".js": "jsx" },
    nodePaths: [path.join(repositoryRoot, "node_modules")],
    alias: { "react-native": "react-native-web", RN_ENGINE: path.join(rnRoot, "engine.js"), RN_INDEX: path.join(rnRoot, "index.js") },
    resolveExtensions: [".web.js", ".web.jsx", ".web.ts", ".web.tsx", ".js", ".jsx", ".ts", ".tsx", ".json"],
    mainFields: ["browser", "module", "main"],
    define: { "process.env.NODE_ENV": '"development"', __DEV__: "true", global: "window" },
    logLevel: "warning"
  });
  fs.writeFileSync(path.join(work, "index.html"), `<!doctype html><meta charset="utf-8"><script>globalThis.IS_REACT_ACT_ENVIRONMENT = true;</script><body><script src="behavior.js"></script></body>`);

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "s1-rn-behavior-profile-"));
  const dump = await new Promise((resolve, reject) => {
    const child = spawnChrome(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", `--user-data-dir=${profile}`, "--virtual-time-budget=30000", "--window-size=1200,900", "--dump-dom", `file://${path.join(work, "index.html")}`], { stdio: ["ignore", "pipe", "ignore"] });
    let buffer = "";
    const timer = setTimeout(() => { killChromeTree(child); reject(new Error("크롬이 시간 안에 결과를 내지 못했습니다.")); }, 120000);
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      if (buffer.includes("S1-RN-BEHAVIOR-DONE") && buffer.includes("</html>")) { clearTimeout(timer); killChromeTree(child); resolve(buffer); }
    });
    child.on("error", reject);
  });
  try { fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(work, { recursive: true, force: true }); } catch { /* 무시 */ }

  const match = /<script type="application\/json" id="s1-behavior">([\s\S]*?)<\/script>/.exec(dump);
  if (!match) { console.error("❌ 결과를 읽지 못했습니다."); return 2; }
  const cases = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
  let checks = 0;
  const failures = [];
  for (const one of cases) {
    for (const entry of one.checks) {
      checks += 1;
      if (!entry.ok) failures.push({ title: one.title, name: entry.name, detail: entry.detail });
    }
  }
  console.log(`🔎 RN 동작 검사 — 사례 ${cases.length}개 · 확인 ${checks}건`);
  if (failures.length === 0) { console.log("✅ PASS — 모든 동작이 승인된 계약대로 바뀝니다."); return 0; }
  console.log(`❌ FAIL — ${failures.length}건`);
  for (const failure of failures) console.log(`   · ${failure.title} — ${failure.name}: ${failure.detail}`);
  return 1;
}

main().then((code) => process.exit(code)).catch((error) => { console.error(`❌ ${error.stack ?? error.message}`); process.exit(2); });
