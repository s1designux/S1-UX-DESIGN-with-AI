#!/usr/bin/env node
/**
 * behavior-check.mjs — 실제 브라우저에서 배포본 동작 규칙을 확인한다.
 * --------------------------------------------------------------------------
 * 지금 확인하는 것 (river 결정 2026-10-13):
 *   1. 날짜 선택(date-picker) 열릴 때 키보드 초점 — 골라 둔 날짜(기간이면 시작일), 없으면 오늘,
 *      오늘이 보이는 달에 없으면 그 달의 1일. PC 팝오버와 모바일 시트 모두.
 *   2. 페이지네이션 네 버튼 — |< 이전 묶음 첫 쪽 · < 한 쪽 뒤 · > 한 쪽 앞 · >| 다음 묶음 첫 쪽,
 *      첫/마지막 묶음에서 |< >| 막힘, 눌러서 막혀도 초점이 현재 쪽 번호 버튼에 남음, 이름(aria-label).
 *   3. 선택형 부품이 알아서 고르기(river 결정 2026-10-13 「전부 부품이 알아서」) — 칩 묶음·바텀시트 목록·하단 탭.
 *      켜진 경우(data-s1-select) 와 꺼진 경우(표시 없음) 를 둘 다 본다. beforechange 로 막으면 모양이 안 바뀌는지도 본다.
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

const chipHtml = read("examples/chip.html").replace(/<!--[\s\S]*?-->\s*/g, "").trim();
const chip = (label, extra = "") => chipHtml.replace('data-break="pc"', `data-break="pc"${extra}`).replace(">\n  <span data-s1-part=\"label\">라벨</span>", `>\n  <span data-s1-part="label">${label}</span>`);
const chipsPage = page(`<div id="single" data-s1-select="single">${chip("가")}${chip("나")}${chip("다")}</div><div id="free">${chip("라")}${chip("마")}</div>`);
const navHtml = read("examples/mobile-bottom-nav.mobile.html").replace(/<!--[\s\S]*?-->\s*/g, "").trim();
const sheetSource = read("examples/bottom-sheet.mobile.html").replace(/<!--[\s\S]*?-->\s*/g, "");
const sheetPage = (bodyAttrs) => page(sheetSource
  .replace(/<button[^>]*data-s1-open[^>]*>[\s\S]*?<\/button>/, '<button type="button" id="opener" data-s1-open="bottom-sheet-example"><span data-s1-part="value">선택</span></button>')
  .replace('<div data-s1-part="sheet-body">', `<div data-s1-part="sheet-body"${bodyAttrs}>`));

const pages = {
  "chips.html": chipsPage,
  "nav.html": page(navHtml),
  "sheet-on.html": sheetPage(' data-s1-select="single" data-s1-close-on-select'),
  "sheet-off.html": sheetPage(""),
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

  /* ── 3. 선택형 부품이 알아서 고르기 ─────────────────────── */
  const eval$ = (p, expression) => p.eval(expression).then((value) => (typeof value === "string" && /^[\[{]/.test(value) ? JSON.parse(value) : value));

  /* 칩 묶음 */
  p = await openPage(chrome.cdp, `${origin}/chips.html`, { width: 1280, height: 900, mobile: false });
  await ready(p);
  const chipState = (selector) => eval$(p, `JSON.stringify([...document.querySelectorAll('${selector} [data-s1-component="chip"]')].map((c) => c.getAttribute('aria-pressed') === 'true'))`);
  const clickChip = (selector, index) => p.eval(`document.querySelectorAll('${selector} [data-s1-component="chip"]')[${index}].click(), true`);
  await p.eval(`window.__events = []; document.addEventListener('s1:chip:change', (e) => window.__events.push([e.detail.value, e.detail.selected]));`);
  await clickChip("#single", 1);
  check("칩 묶음(켬): 한 칩을 누르면 그 칩만 켜진다", await chipState("#single"), [false, true, false]);
  await clickChip("#single", 2);
  check("칩 묶음(켬): 다른 칩을 누르면 앞 칩은 꺼진다", await chipState("#single"), [false, false, true]);
  await clickChip("#single", 2);
  check("칩 묶음(켬): 켜진 칩을 다시 눌러도 꺼지지 않는다(항상 하나)", await chipState("#single"), [false, false, true]);
  check("칩 묶음(켬): change 이벤트가 값과 함께 나간다", await eval$(p, `JSON.stringify(window.__events)`), [["나", true], ["나", false], ["다", true]]);
  await p.eval(`document.querySelector('#single').addEventListener('s1:chip:beforechange', (e) => e.preventDefault()), true`);
  await clickChip("#single", 0);
  check("칩 묶음(켬): beforechange 를 막으면 모양이 안 바뀐다", await chipState("#single"), [false, false, true]);
  await clickChip("#free", 0);
  await clickChip("#free", 1);
  check("칩(표시 없음): 종전처럼 칩마다 따로 켜진다(여러 개 가능)", await chipState("#free"), [true, true]);
  await clickChip("#free", 0);
  check("칩(표시 없음): 다시 누르면 꺼진다", await chipState("#free"), [false, true]);
  await p.close();

  /* 하단 탭 */
  p = await openPage(chrome.cdp, `${origin}/nav.html`, { width: 375, height: 812, mobile: true });
  await ready(p);
  const navState = () => eval$(p, `JSON.stringify([...document.querySelectorAll('[data-s1-component="mobile-bottom-nav"]')].map((t) => [t.getAttribute('aria-selected'), t.getAttribute('aria-current')]))`);
  const clickTab = (i) => p.eval(`document.querySelectorAll('[data-s1-component="mobile-bottom-nav"]')[${i}].click(), true`);
  await p.eval(`window.__nav = []; document.addEventListener('s1:mobile-bottom-nav:change', (e) => window.__nav.push(e.detail.value));`);
  await clickTab(2);
  check("하단 탭: 누르면 활성 탭이 옮겨가고 aria-current 도 따라간다", await navState(), [["false", null], ["false", null], ["true", "page"], ["false", null]]);
  check("하단 탭: change 이벤트에 값이 실린다", await eval$(p, `JSON.stringify(window.__nav)`), ["notification"]);
  await p.eval(`document.querySelector('nav').addEventListener('s1:mobile-bottom-nav:beforechange', (e) => { if (e.detail.value === 'settings') e.preventDefault(); }), true`);
  await clickTab(3);
  check("하단 탭: 화면이 beforechange 를 막으면 탭이 그대로다(change 도 안 나간다)", [await navState(), await eval$(p, `JSON.stringify(window.__nav)`)], [[["false", null], ["false", null], ["true", "page"], ["false", null]], ["notification"]]);
  await p.eval(`(async () => { const m = await import('/s1-ui.js'); m.mobileBottomNav.init(document.querySelectorAll('[data-s1-component="mobile-bottom-nav"]')[0]).setActive(); return true; })()`);
  check("하단 탭: setActive() 는 이벤트 없이 화면이 직접 활성 탭을 정한다", [await navState(), await eval$(p, `JSON.stringify(window.__nav)`)], [[["true", "page"], ["false", null], ["false", null], ["false", null]], ["notification"]]);
  await p.close();

  /* 바텀시트 목록 */
  const sheetState = () => eval$(p, `JSON.stringify({ selected: [...document.querySelectorAll('[data-s1-component="bottom-sheet-option"]')].map((o) => o.dataset.state), aria: [...document.querySelectorAll('[data-s1-component="bottom-sheet-option"]')].map((o) => o.getAttribute('aria-selected')), role: document.querySelector('[data-s1-part="sheet-body"]').getAttribute('role'), checks: document.querySelectorAll('[data-s1-component="bottom-sheet-option"] [data-s1-part="check"]').length, value: document.querySelector('#opener [data-s1-part="value"]').textContent, hidden: document.getElementById('bottom-sheet-example').hidden })`);
  const options = `document.querySelectorAll('[data-s1-component="bottom-sheet-option"]')`;
  p = await openPage(chrome.cdp, `${origin}/sheet-on.html`, { width: 375, height: 812, mobile: true });
  await ready(p);
  await p.eval(`window.__opt = []; document.addEventListener('s1:bottom-sheet-option:change', (e) => window.__opt.push(e.detail.value));  document.getElementById('opener').click(); true`);
  await sleep(200);
  let s2 = await sheetState();
  check("시트 목록(켬): 묶음이 listbox, 줄이 option 이 된다", [s2.role, s2.aria], ["listbox", ["false", "true", "false", "false"]]);
  await p.eval(`${options}[0].focus(), true`);
  await p.eval(`${options}[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })), true`);
  check("시트 목록(켬): ↓ 키는 다음 줄로 초점을 옮긴다", await p.eval(`[...${options}].indexOf(document.activeElement)`), 1);
  await p.eval(`${options}[2].focus(), ${options}[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })), true`);
  await sleep(150);
  s2 = await sheetState();
  check("시트 목록(켬): Enter 로 고르면 그 줄만 고른 상태(파란 체크 하나)가 되고 값이 나간다", [s2.selected, s2.checks, await eval$(p, `JSON.stringify(window.__opt)`)], [["default", "default", "selected", "default"], 1, ["항목 3"]]);
  check("시트 목록(켬): 고른 값이 연 버튼의 값 글자에 들어가고 시트가 닫힌다(close-on-select)", [s2.value, s2.hidden], ["항목 3", true]);
  await p.eval(`document.getElementById('opener').click(), true`);
  await sleep(150);
  check("시트 목록(켬): 고른 줄이 Tab 정거장(roving tabindex)이다", await p.eval(`JSON.stringify([...${options}].map((o) => o.tabIndex))`), JSON.stringify([-1, -1, 0, -1]));
  await p.eval(`document.getElementById('bottom-sheet-example').querySelector('[data-s1-part="sheet-body"]').addEventListener('s1:bottom-sheet-option:beforechange', (e) => e.preventDefault()), ${options}[0].click(), true`);
  check("시트 목록(켬): beforechange 를 막으면 고른 줄이 그대로다", (await sheetState()).selected, ["default", "default", "selected", "default"]);
  await p.close();

  p = await openPage(chrome.cdp, `${origin}/sheet-off.html`, { width: 375, height: 812, mobile: true });
  await ready(p);
  await p.eval(`document.getElementById('opener').click(), true`);
  await sleep(200);
  const before = await sheetState();
  await p.eval(`${options}[2].click(), true`);
  await sleep(100);
  const after = await sheetState();
  check("시트 목록(표시 없음): 아무것도 바뀌지 않는다(종전 그대로)", [after.selected, after.role, after.value, after.hidden], [before.selected, before.role, "선택", false]);
  await p.close();
} finally {
  await chrome.close();
  server.close();
}

if (failures.length) {
  console.error(`❌ behavior-check 실패 ${failures.length}건\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("✅ behavior-check — 날짜 선택 열림 초점(PC·모바일) · 페이지네이션 네 버튼 · 선택형 부품이 알아서 고르기(칩 묶음·시트 목록·하단 탭)가 실제 브라우저에서 맞습니다.");
