#!/usr/bin/env node
/**
 * runtime-check.mjs — 프레임워크 껍데기 "동작" 검사
 * --------------------------------------------------------------------------
 * 컴파일은 "열리는가"까지만 증명한다. 이 검사는 그 다음 칸이다:
 * **실제로 prop 을 주고 DOM 이 그대로 바뀌는가.**
 *
 * 2026-09-04 독립 검증 3차가 실증한 실패 모양 —
 *   Vue 껍데기 19종이 컴파일도 되고 마운트도 됐지만, watchEffect 가 죽어 있어
 *   variant·size·parts 를 **오류도 경고도 없이 조용히 버렸다.**
 *   문자열 대조도, 컴파일 검사도 이걸 못 잡는다.
 *
 * 실행: node ui-library/scripts/runtime-check.mjs [--quiet]
 * 도구(vue·esbuild·크롬)가 없으면 건너뛰되 **건너뛴 사실을 반드시 출력**한다(exit 2).
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const dist = path.join(libraryRoot, "dist");
const quiet = process.argv.includes("--quiet");

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  ].filter(Boolean);
  for (const candidate of candidates) { try { if (fs.existsSync(candidate)) return candidate; } catch { /* 무시 */ } }
  return null;
}

/* --dump-dom 은 출력을 다 쓰고도 스스로 종료하지 않는다(ui-guide-render-check.js 와 같은 함정). */
function dumpDom(chrome, url) {
  return new Promise((resolve, reject) => {
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "s1-runtime-"));
    const child = spawn(chrome, [
      "--headless=new", "--dump-dom", "--virtual-time-budget=6000",
      "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
      "--no-sandbox", "--disable-gpu", `--user-data-dir=${profileDir}`, url
    ], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    const decoder = new StringDecoder("utf8");
    let settled = false;
    let guard;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      out += decoder.end();
      try { child.kill("SIGKILL"); } catch { /* 이미 죽음 */ }
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch { /* 무시 */ }
      out.includes("</html>") ? resolve(out) : reject(new Error(`DOM 을 받지 못했습니다: ${url}`));
    };
    child.stdout.on("data", (chunk) => { out += decoder.write(chunk); if (out.includes("</html>")) finish(); });
    child.on("exit", finish);
    guard = setTimeout(finish, 60000);
  });
}

const pascal = (id) => id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/** 껍데기가 들고 있는 마크업의 루트 속성을 읽는다 — 시험값을 고를 때 쓴다. */
function markupsOf(vuePath) {
  const source = fs.readFileSync(vuePath, "utf8");
  return JSON.parse(/const MARKUPS = (\{[\s\S]*?\n\});/.exec(source)[1]);
}
function rootAttributesOf(markup) {
  const first = /<[a-zA-Z][^>]*>/.exec(markup)[0];
  const attributes = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = pattern.exec(first)) !== null) attributes[match[1]] = match[2];
  return attributes;
}

/** 컴포넌트마다 "이 값을 주면 이렇게 보여야 한다"를 계약에서 만든다 — 시험값을 지어내지 않는다.
 *  **이미 화면에 있는 값과 같은 값을 고르면 그 단언은 아무것도 증명하지 않는다**(공회전).
 *  그래서 허용목록 중 현재 마크업과 **다른** 값을 고르고, 다른 값이 없으면 그 축은
 *  시험하지 않았다고 분명히 기록한다. (2026-09-04 독립 검증 4차에서 18종 중 7종이 공회전이었다) */
function buildCases(contract, distRoot) {
  const cases = [];
  const notExercised = [];
  for (const component of contract.components) {
    if (component.status !== "approved") continue;
    const vuePath = path.join(distRoot, "platform/vue", `${pascal(component.id)}.vue`);
    const markups = markupsOf(vuePath);
    const breaks = Object.keys(markups);
    const current = rootAttributesOf(markups[breaks[0]]);

    const pick = (allowed, attribute, axis) => {
      if (!attribute || allowed.length < 2) return undefined;
      const different = allowed.find((value) => value !== current[attribute]);
      if (different === undefined) { notExercised.push(`${component.id}.${axis}`); return undefined; }
      return different;
    };

    const props = { attrs: { "data-s1-runtime-probe": component.id } };
    const variant = pick(component.variants, component.variantAttribute, "variant");
    const size = pick(component.sizes, component.sizeAttribute, "size");
    if (variant !== undefined) props.variant = variant;
    if (size !== undefined) props.size = size;
    const textPart = component.requiredParts.find((part) => ["label", "value", "option-label", "title"].includes(part));
    if (textPart) props.parts = { [textPart]: "런타임확인" };

    /* break 가 둘이면 기본이 아닌 쪽을 준다 — 마크업 파일 자체가 갈리는 자리라 놓치면 화면이 통째로 틀린다. */
    let breakName;
    let expectedBreak;
    if (breaks.length > 1) {
      breakName = breaks[1];
      const target = rootAttributesOf(markups[breaks[1]]);
      if (target["data-break"] && target["data-break"] !== current["data-break"]) expectedBreak = target["data-break"];
      else notExercised.push(`${component.id}.break`);
      props.breakName = breakName;
    }

    /* 2단계에서 되돌릴 값 — break 를 원래대로 돌려 "바뀌는가"를 본다. */
    const returnBreakName = breaks.length > 1 ? breaks[0] : null;
    const returnBreak = returnBreakName ? (rootAttributesOf(markups[breaks[0]])["data-break"] ?? null) : null;
    const secondVariant = variant !== undefined ? component.variants.find((value) => value !== variant) : undefined;
    cases.push({
      id: component.id, props,
      variantAttribute: component.variantAttribute,
      sizeAttribute: component.sizeAttribute,
      expectedBreak: expectedBreak ?? null,
      returnBreakName: expectedBreak ? returnBreakName : null,
      returnBreak: expectedBreak ? returnBreak : null,
      secondVariant
    });
  }
  return { cases, notExercised };
}

async function main() {
  const skipped = [];
  let esbuild = null;
  let sfc = null;
  try { esbuild = (await import("esbuild")).default ?? await import("esbuild"); } catch { skipped.push("esbuild"); }
  try { sfc = await import("@vue/compiler-sfc"); } catch { skipped.push("@vue/compiler-sfc"); }
  try { await import("vue"); } catch { skipped.push("vue"); }
  const chrome = findChrome();
  if (!chrome) skipped.push("크롬");
  if (skipped.length) {
    console.log(`RUNTIMECHECK_SUMMARY skipped=${skipped.join(",")} cases=0 failed=0`);
    console.log(`[runtime check] 건너뜀 — ${skipped.join(" · ")} 없음. 껍데기가 실제로 prop 을 반영하는지는 이번 실행에서 확인되지 않았습니다.`);
    process.exit(2);
  }

  let exitCode = 0;
  const contract = JSON.parse(fs.readFileSync(path.join(dist, "platform/contract.json"), "utf8"));
  const { cases, notExercised } = buildCases(contract, dist);

  const vuePlugin = {
    name: "vue-sfc",
    setup(build) {
      build.onLoad({ filter: /\.vue$/ }, (args) => {
        const source = fs.readFileSync(args.path, "utf8");
        const { descriptor } = sfc.parse(source, { filename: path.basename(args.path) });
        const id = path.basename(args.path, ".vue");
        const script = sfc.compileScript(descriptor, { id, inlineTemplate: true });
        return { contents: `${sfc.rewriteDefault(script.content, "__sfc__")}\nexport default __sfc__;`, loader: "js", resolveDir: path.dirname(args.path) };
      });
    }
  };

  const entryPath = path.join(dist, "__runtime-entry.js");
  const pagePath = path.join(repositoryRoot, "ui-library/dist/__runtime-check.html");
  fs.writeFileSync(entryPath, `
import { createApp, h, reactive } from "vue";
${cases.map(({ id }) => `import ${pascal(id)} from "./platform/vue/${pascal(id)}.vue";`).join("\n")}
const COMPONENTS = { ${cases.map(({ id }) => pascal(id)).join(", ")} };
const CASES = ${JSON.stringify(cases)};
/* 마운트를 먼저 다 하고, Vue 가 effect 를 흘려보낸 뒤에 읽는다 —
   마운트 직후 같은 턴에 읽으면 아직 반영 전이라 거짓 실패가 난다.
   그리고 **마운트 뒤에 값을 바꿔** 한 번 더 읽는다 — 초기 주입만 보면
   "처음엔 맞고 이후 안 바뀌는" 결함(breakName)을 통째로 놓친다.
   (2026-09-04 독립 검증 4차 지적) */
const mounted = [];
for (const item of CASES) {
  const holder = document.createElement("div");
  document.body.appendChild(holder);
  const state = reactive({ ...item.props });
  let error = null;
  try {
    const name = item.id.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
    createApp({ render: () => h(COMPONENTS[name], { ...state }) }).mount(holder);
  } catch (thrown) {
    error = String(thrown && thrown.message).slice(0, 80);
  }
  mounted.push({ item, holder, state, error });
}

function assess(phase) {
  const lines = [];
  let failed = 0;
  for (const { item, holder, state, error } of mounted) {
    const checks = [];
    if (error) checks.push(["threw:" + error, false]);
    const element = holder.querySelector('[data-s1-runtime-probe="' + item.id + '"]');
    checks.push(["mount", !!element]);
    checks.push(["host-contents", !!holder.firstElementChild && getComputedStyle(holder.firstElementChild).display === "contents"]);
    if (element) {
      if (state.variant !== undefined) checks.push(["variant", element.getAttribute(item.variantAttribute) === state.variant]);
      if (state.size !== undefined) checks.push(["size", element.getAttribute(item.sizeAttribute) === state.size]);
      if (state.parts) for (const [name, text] of Object.entries(state.parts)) {
        const target = element.querySelector('[data-s1-part="' + name + '"]');
        checks.push(["parts." + name, !!target && target.textContent === text]);
      }
      if (phase === 1 && item.expectedBreak) checks.push(["break", element.getAttribute("data-break") === item.expectedBreak]);
      if (phase === 2 && item.returnBreak) checks.push(["break-change", element.getAttribute("data-break") === item.returnBreak]);
    }
    const bad = checks.filter((entry) => !entry[1]).map((entry) => entry[0]);
    failed += bad.length;
    if (bad.length) lines.push("p" + phase + " " + item.id + " FAIL " + bad.join(","));
  }
  return { failed, lines };
}

setTimeout(() => {
  const first = assess(1);
  /* 2단계 — 마운트 뒤에 값을 바꾼다. */
  for (const entry of mounted) {
    if (entry.item.returnBreakName) entry.state.breakName = entry.item.returnBreakName;
    if (entry.item.secondVariant !== undefined) entry.state.variant = entry.item.secondVariant;
    if (entry.state.parts) entry.state.parts = Object.fromEntries(Object.keys(entry.state.parts).map((key) => [key, "변경확인"]));
  }
  setTimeout(() => {
    const second = assess(2);
    const output = document.createElement("pre");
    output.id = "s1-runtime-result";
    output.textContent = "CASES=" + CASES.length + " FAILED=" + (first.failed + second.failed) + "\\n" + first.lines.concat(second.lines).join("\\n");
    document.body.appendChild(output);
  }, 0);
}, 0);
`);

  const bundle = await esbuild.build({
    entryPoints: [entryPath], bundle: true, write: false, format: "iife",
    plugins: [vuePlugin], define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent"
  });
  fs.writeFileSync(pagePath, `<!doctype html><meta charset="utf-8"><title>runtime</title>
<link rel="stylesheet" href="assets/css/tokens.css"><link rel="stylesheet" href="s1-ui.css">
<body><script>${bundle.outputFiles[0].text}</script></body>`);

  const server = await new Promise((resolve) => {
    import("node:http").then(({ default: http }) => {
      const instance = http.createServer((request, response) => {
        const relative = decodeURIComponent(request.url.split("?")[0]).replace(/^\/+/, "");
        const absolute = path.join(dist, relative);
        if (!absolute.startsWith(dist) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) { response.writeHead(404).end("nf"); return; }
        const type = absolute.endsWith(".css") ? "text/css" : absolute.endsWith(".js") ? "text/javascript" : absolute.endsWith(".svg") ? "image/svg+xml" : "text/html";
        response.writeHead(200, { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-store" });
        fs.createReadStream(absolute).pipe(response);
      });
      instance.listen(0, "127.0.0.1", () => resolve(instance));
    });
  });

  try {
    const dom = await dumpDom(chrome, `http://127.0.0.1:${server.address().port}/__runtime-check.html`);
    const match = /<pre id="s1-runtime-result">([\s\S]*?)<\/pre>/.exec(dom);
    if (!match) throw new Error("런타임 검사 결과를 화면에서 찾지 못했습니다(번들이 실행되지 않았을 수 있습니다).");
    const text = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const summary = /CASES=(\d+) FAILED=(\d+)/.exec(text);
    const failed = Number(summary[2]);
    console.log(`RUNTIMECHECK_SUMMARY skipped= cases=${summary[1]} failed=${failed}`);
    if (failed > 0) {
      console.error(text.split("\n").filter((line) => line.includes("FAIL")).slice(0, 10).join("\n"));
      console.error("프레임워크 껍데기가 prop 을 반영하지 않습니다 — 컴파일은 되지만 값이 버려집니다.");
      exitCode = 1;
    } else if (!quiet) {
      console.log(`[runtime check] Vue 껍데기 ${summary[1]}종 — prop 주입 후 DOM 반영 확인`);
    }
    /* 시험하지 못한 축은 반드시 보이게 한다 — 허용값이 하나뿐이라 주입해도 화면이 그대로인 자리다.
       "통과"와 "시험 안 함"을 섞으면 검사기가 있는 것처럼 보이면서 아무것도 안 지킨다. */
    if (notExercised.length) console.log(`[runtime check] 시험하지 않은 축 ${notExercised.length}건(허용값이 하나뿐): ${notExercised.join(" · ")}`);
  } finally {
    /* 실패했을 때도 반드시 지운다 — try 안에서 exit 하면 dist 에 임시 파일이 남아
       다음 게이트가 "배포 ZIP 이 낡았다"고 엉뚱하게 진단한다(독립 검증 4차 재현). */
    server.close();
    fs.rmSync(entryPath, { force: true });
    fs.rmSync(pagePath, { force: true });
  }
  if (exitCode) process.exit(exitCode);
}

main().catch((error) => {
  console.error(`runtime-check 실행 실패: ${error.message}`);
  process.exit(1);
});
