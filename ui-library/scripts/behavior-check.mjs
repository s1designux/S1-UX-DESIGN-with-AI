#!/usr/bin/env node
/**
 * behavior-check.mjs — 실제 브라우저에서 배포본 동작 규칙을 확인한다.
 * --------------------------------------------------------------------------
 * 지금 확인하는 것 (river 결정 2026-10-13):
 *   1. 날짜 선택(date-picker) 열릴 때 키보드 초점 — 골라 둔 날짜(기간이면 시작일), 없으면 오늘,
 *      오늘이 보이는 달에 없으면 그 달의 1일. PC 팝오버와 모바일 시트 모두.
 *   2. 페이지네이션 네 버튼 — |< 이전 묶음 첫 쪽 · < 한 쪽 뒤 · > 한 쪽 앞 · >| 다음 묶음 첫 쪽,
 *      첫/마지막 묶음에서 |< >| 막힘, 눌러서 막혀도 초점이 현재 쪽 번호 버튼에 남음, 이름(aria-label).
 *
 * 실행: npm run ui:behavior   (크롬이 없으면 건너뛰고 그 사실을 출력한다 — exit 2)
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const dist = path.join(libraryRoot, "dist");
const { findChrome, launchChrome, openPage, sleep } = await import(path.join(repositoryRoot, "scripts/publisher-audit/cdp.mjs"));

if (!findChrome()) { console.log("⏭️  behavior-check 건너뜀 — 크롬을 찾지 못했습니다."); process.exit(2); }

const read = (rel) => fs.readFileSync(path.join(dist, rel), "utf8");
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const firstOfMonthAfterToday = () => { const d = new Date(); const n = new Date(d.getFullYear(), d.getMonth() + 1, 1); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`; };

function extractDiv(html, component, mode = "") {
  const start = html.search(new RegExp(`<div[^>]*data-s1-component="${component}"${mode ? `[^>]*data-mode="${mode}"` : ""}`));
  const tag = /<(\/?)div\b/g;
  tag.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = tag.exec(html))) { depth += m[1] ? -1 : 1; if (depth === 0) return html.slice(start, html.indexOf(">", m.index) + 1); }
  throw new Error(`${component} 마크업을 찾지 못했습니다`);
}

const page = (body) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/css/tokens.css"><link rel="stylesheet" href="/s1-ui.css"></head><body>${body}<script type="module">import { autoInit } from "/s1-ui.auto.js"; autoInit(); window.__ready = true;</script></body></html>`;

const pcPicker = extractDiv(read("examples/date-picker.html"), "date-picker");
const pcRange = extractDiv(read("examples/date-picker.html"), "date-picker", "range");
const mobilePicker = extractDiv(read("examples/date-picker.mobile.html"), "date-picker");
const withAttrs = (html, attrs) => html.replace(/^<div /, `<div ${attrs} `);
const pagination = read("examples/pagination.html").replace(/<!--[\s\S]*?-->\s*/g, "").replace('data-total-pages="6"', 'data-total-pages="14"');

const pages = {
  "pc.html": page(`<div id="a">${withAttrs(pcPicker, 'data-value="2026-10-15"')}</div><div id="b">${pcPicker}</div><div id="c">${withAttrs(pcRange, 'data-range-start="2026-11-04" data-range-end="2026-11-09"')}</div>`),
  "mobile.html": page(`<div id="a">${withAttrs(mobilePicker, 'data-value="2026-10-15"')}</div><div id="b">${mobilePicker}</div>`),
  "pagination.html": page(pagination)
};

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (pages[url.slice(1)]) { res.writeHead(200, { "content-type": types[".html"] }); res.end(pages[url.slice(1)]); return; }
  const file = path.join(dist, url);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("no"); return; }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const chrome = await launchChrome(findChrome());
const failures = [];
const check = (label, actual, wanted) => { if (JSON.stringify(actual) !== JSON.stringify(wanted)) failures.push(`${label} — 기대 ${JSON.stringify(wanted)} / 실제 ${JSON.stringify(actual)}`); };
const ready = async (p) => { for (let i = 0; i < 60; i += 1) { if (await p.eval("window.__ready === true")) return; await sleep(50); } };

try {
  /* ── 1. date-picker 초점 ─────────────────────────────────── */
  const focusAfterOpen = (selector) => `(async () => { const root = document.querySelector('${selector} [data-s1-component="date-picker"]'); root.querySelector('[data-s1-part="trigger"]').click(); await new Promise((r) => setTimeout(r, 250)); const a = document.activeElement; return a && a.dataset ? a.dataset.date ?? a.dataset.s1Part ?? a.tagName : null; })()`;
  const closeOpen = (selector) => `(async () => { const root = document.querySelector('${selector} [data-s1-component="date-picker"]'); if (root.querySelector('[data-s1-part="trigger"]').getAttribute('aria-expanded') === 'true') root.querySelector('[data-s1-part="trigger"]').click(); await new Promise((r) => setTimeout(r, 120)); return true; })()`;

  let p = await openPage(chrome.cdp, `${origin}/pc.html`, { width: 1280, height: 900, mobile: false });
  await ready(p);
  check("PC · 골라 둔 날짜가 있으면 그 날짜", await p.eval(focusAfterOpen("#a")), "2026-10-15");
  await p.eval(closeOpen("#a"));
  check("PC · 아무것도 안 골랐으면 오늘", await p.eval(focusAfterOpen("#b")), todayIso());
  /* 오늘이 안 보이는 달: 다음 달로 넘겼다 닫고 다시 열면 그 달의 1일 */
  await p.eval(`document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true })), true`);
  await sleep(150);
  await p.eval(closeOpen("#b"));
  check("PC · 오늘이 안 보이는 달이면 그 달의 1일", await p.eval(focusAfterOpen("#b")), firstOfMonthAfterToday());
  check("PC · 기간이면 시작일", await p.eval(focusAfterOpen("#c")), "2026-11-04");
  await p.close();

  p = await openPage(chrome.cdp, `${origin}/mobile.html`, { width: 375, height: 812, mobile: true });
  await ready(p);
  check("모바일 시트 · 골라 둔 날짜", await p.eval(focusAfterOpen("#a")), "2026-10-15");
  await p.eval(closeOpen("#a"));
  check("모바일 시트 · 아무것도 안 골랐으면 오늘", await p.eval(focusAfterOpen("#b")), todayIso());
  await p.close();

  /* ── 2. pagination 네 버튼 ───────────────────────────────── */
  p = await openPage(chrome.cdp, `${origin}/pagination.html`, { width: 1280, height: 900, mobile: false });
  await ready(p);
  const state = () => p.eval(`JSON.stringify({ page: document.querySelector('[data-s1-component="pagination"]').dataset.page, numbers: [...document.querySelectorAll('[data-s1-part="page"]')].map((b) => b.textContent).join(","), off: [...document.querySelectorAll('[data-s1-action]')].filter((b) => b.disabled).map((b) => b.dataset.s1Action).join(","), focus: document.activeElement && document.activeElement.getAttribute('aria-current') === 'page' ? 'current' : (document.activeElement && document.activeElement.tagName) })`).then((s) => JSON.parse(s));
  const press = async (action) => { await p.eval(`(() => { const b = document.querySelector('[data-s1-action="${action}"]'); b.focus(); b.click(); return true; })()`); await sleep(80); return state(); };

  check("이름 네 개", await p.eval(`JSON.stringify([...document.querySelectorAll('[data-s1-action]')].map((b) => b.getAttribute('aria-label')))`), JSON.stringify(["이전 페이지 묶음", "이전 페이지", "다음 페이지", "다음 페이지 묶음"]));
  let s = await state();
  check("처음: 1쪽 · 1-6 · |< < 막힘", [s.page, s.numbers, s.off], ["1", "1,2,3,4,5,6", "first,previous"]);
  s = await press("last");
  check(">| 은 다음 묶음의 첫 쪽(7) · 번호 7-12", [s.page, s.numbers], ["7", "7,8,9,10,11,12"]);
  s = await press("last");
  check(">| 한 번 더: 마지막 묶음의 첫 쪽(13) · 번호 13-14 · >| 막힘 · 초점은 현재 쪽 번호", [s.page, s.numbers, s.off.includes("last"), s.focus], ["13", "13,14", true, "current"]);
  s = await press("first");
  check("|< 는 이전 묶음의 첫 쪽(7)", [s.page, s.numbers], ["7", "7,8,9,10,11,12"]);
  s = await press("previous");
  check("< 는 한 쪽 뒤(6) · 묶음 경계를 넘으면 번호 창도 따라감(1-6)", [s.page, s.numbers], ["6", "1,2,3,4,5,6"]);
  s = await press("next");
  check("> 는 한 쪽 앞(7) · 번호 창 7-12", [s.page, s.numbers], ["7", "7,8,9,10,11,12"]);
  s = await press("first");
  check("첫 묶음으로 돌아오면 |< 막힘 · 초점은 현재 쪽 번호", [s.page, s.off.includes("first"), s.focus], ["1", true, "current"]);
  await p.close();
} finally {
  await chrome.close();
  server.close();
}

if (failures.length) {
  console.error(`❌ behavior-check 실패 ${failures.length}건\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("✅ behavior-check — 날짜 선택 열림 초점(PC·모바일)과 페이지네이션 네 버튼 규칙이 실제 브라우저에서 맞습니다.");
