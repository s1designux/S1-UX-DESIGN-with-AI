/**
 * probes.mjs — 컴포넌트별 "눌러 보기" 시나리오
 * --------------------------------------------------------------------------
 * 근거는 각 컴포넌트 manifest(states · a11y.keyboard · javascript.methods)다.
 * 여기서 기대값을 새로 지어내지 않는다 — manifest 가 약속한 것만 진짜 마우스·키로 눌러 본다.
 * 요소를 못 찾거나 계산이 실패하면 그 시나리오는 "확인 못 함(notChecked)"으로 남는다. 통과로 치지 않는다.
 */
import { sleep } from "./cdp.mjs";

export class NotFound extends Error {}

const js = (value) => JSON.stringify(value);
const q = (selector) => `document.querySelector(${js(selector)})`;

export function makeContext(page, rootSelector, record) {
  const t = {
    page,
    R: rootSelector,
    check: record,
    eval: (expression) => page.eval(expression),
    wait: (ms) => sleep(ms),
    async click(selector) {
      const rect = await page.eval(`window.__A.rect(${js(selector)})`);
      if (!rect) throw new NotFound(`요소 없음: ${selector}`);
      if (rect.w === 0 || rect.h === 0) throw new NotFound(`크기 0 이라 누를 수 없음: ${selector}`);
      await page.mouseClickAt(rect.x, rect.y);
      return rect;
    },
    async clickAt(x, y) { await page.mouseClickAt(x, y); },
    async focus(selector) {
      const ok = await page.eval(`(()=>{const e=${q(selector)}; if(!e) return false; e.focus(); return document.activeElement===e;})()`);
      if (!ok) throw new NotFound(`초점을 줄 수 없음: ${selector}`);
    },
    key: (name, options) => page.key(name, options),
    type: (text) => page.typeText(text),
    attr: (selector, name) => page.eval(`${q(selector)}?.getAttribute(${js(name)}) ?? null`),
    prop: (selector, name) => page.eval(`${q(selector)}?.[${js(name)}] ?? null`),
    text: (selector) => page.eval(`(${q(selector)}?.textContent ?? "").trim().replace(/\\s+/g," ")`),
    visible: (selector) => page.eval(`window.__A.vis(${q(selector)})`),
    exists: (selector) => page.eval(`!!${q(selector)}`),
    activeIs: (selector) => page.eval(`document.activeElement === ${q(selector)}`),
    activeIn: (selector) => page.eval(`!!${q(selector)} && ${q(selector)}.contains(document.activeElement)`),
    active: () => page.eval("window.__A.activeSel()"),
    async mark(selector, index, name, onlyVisible = true) {
      const marked = await page.eval(`window.__A.mark(${js(selector)}, ${index}, ${js(name)}, ${onlyVisible})`);
      if (!marked) throw new NotFound(`${index + 1}번째 요소 없음: ${selector}`);
      return marked;
    }
  };
  return t;
}

/* ── 공통 시나리오 조각 ─────────────────────────────────────────── */

async function flipByClickAndKeys(t, attribute, keys = ["Space", "Enter"]) {
  const before = await t.attr(t.R, attribute);
  await t.click(t.R);
  const afterClick = await t.attr(t.R, attribute);
  t.check("마우스로 누르면 상태가 바뀐다", before !== afterClick, `${attribute}: ${before} → ${afterClick}`);
  let previous = afterClick;
  for (const keyName of keys) {
    await t.focus(t.R);
    await t.key(keyName);
    const now = await t.attr(t.R, attribute);
    t.check(`${keyName} 키로 상태가 바뀐다`, now !== previous, `${attribute}: ${previous} → ${now}`);
    previous = now;
  }
}

async function nativeButtonActivation(t) {
  await t.eval(`window.__clicks=0; ${q(t.R)}.addEventListener("click",()=>{window.__clicks++}); true`);
  await t.focus(t.R);
  await t.key("Enter");
  const afterEnter = await t.eval("window.__clicks");
  await t.key("Space");
  const afterSpace = await t.eval("window.__clicks");
  t.check("Enter 키로 눌린다", afterEnter === 1, `click 이벤트 ${afterEnter}회`);
  t.check("Space 키로 눌린다", afterSpace === 2, `click 이벤트 누적 ${afterSpace}회`);
}

/** 펼침형(select·filter-chip·date·time) 공통 — 열렸나 = aria-expanded=true + 보이는 패널/시트. */
async function isOpen(t, root) {
  return t.eval(`(()=>{const r=${q(root)}; const tr=r.querySelector('[data-s1-part="trigger"]');
    const surfaces=[...r.querySelectorAll('[data-s1-part="panel"],[data-s1-part="sheet"],[data-s1-part="sheet-panel"],[role="dialog"],[role="listbox"]')];
    return { expanded: tr && tr.getAttribute("aria-expanded"), surface: surfaces.some(e=>window.__A.vis(e)) };})()`);
}

async function escapeReturnsFocus(t, root) {
  const trigger = `${root} [data-s1-part="trigger"]`;
  await t.focus(trigger);
  await t.key("Enter");
  await t.wait(150);
  const opened = await isOpen(t, root);
  t.check("트리거에 초점을 두고 Enter 를 누르면 열린다", opened.expanded === "true" && opened.surface, `aria-expanded=${opened.expanded}, 패널 보임=${opened.surface}`);
  if (!(opened.expanded === "true" && opened.surface)) return;
  await t.key("Escape");
  await t.wait(150);
  const closed = await isOpen(t, root);
  const back = await t.activeIs(trigger);
  t.check("Esc 를 누르면 닫힌다", closed.expanded !== "true" && !closed.surface, `aria-expanded=${closed.expanded}, 패널 보임=${closed.surface}`);
  t.check("닫힌 뒤 초점이 트리거로 돌아온다", back, `지금 초점: ${await t.active()}`);
}

async function pickerSelect(t, root) {
  const trigger = `${root} [data-s1-part="trigger"]`;
  const valueBefore = await t.text(`${root} [data-s1-part="value"]`);
  await t.click(trigger);
  await t.wait(150);
  const opened = await isOpen(t, root);
  t.check("트리거를 누르면 펼쳐진다", opened.expanded === "true" && opened.surface, `aria-expanded=${opened.expanded}, 패널 보임=${opened.surface}`);
  if (!opened.surface) return;
  const option = await t.mark(`${root} [data-s1-part="option"], ${root} [role="option"]`, 1, "pick-opt");
  const label = await t.text(option);
  await t.click(option);
  await t.wait(150);
  const after = await isOpen(t, root);
  const valueAfter = await t.text(`${root} [data-s1-part="value"]`);
  t.check("항목을 고르면 값이 바뀐다", valueAfter !== valueBefore && valueAfter.includes(label), `값: "${valueBefore}" → "${valueAfter}" (고른 항목 "${label}")`);
  t.check("항목을 고르면 닫힌다", after.expanded !== "true" && !after.surface, `aria-expanded=${after.expanded}, 패널 보임=${after.surface}`);
}

async function dialogLifecycle(t, namespace) {
  /* 퍼블리셔가 할 수 있는 방법: 모듈을 import 해서 init(root).open() — README 에는 없다(패키지 판정에서 따로 기록). */
  await t.eval(`(()=>{let b=document.getElementById("__audit_opener"); if(!b){b=document.createElement("button"); b.type="button"; b.id="__audit_opener"; b.textContent="열기"; b.setAttribute("data-audit-skip",""); document.body.prepend(b);} b.focus(); return true;})()`);
  const opened = await t.eval(`(async()=>{const m=await import("./s1-ui/s1-ui.auto.js"); const api=m[${js(namespace)}].init(${q(t.R)}); if(!api||typeof api.open!=="function") return "open() 없음"; api.open(); return "ok";})()`);
  t.check("스크립트로 열 수 있다(init(root).open())", opened === "ok", `결과: ${opened}`);
  if (opened !== "ok") return;
  await t.wait(200);
  const shown = await t.eval(`(()=>{const r=${q(t.R)}; return !r.hidden && [...r.querySelectorAll('[role="dialog"]')].some(e=>window.__A.vis(e));})()`);
  t.check("열리면 화면에 보인다", shown, `hidden=${await t.eval(`${q(t.R)}.hidden`)}`);
  const inside = await t.activeIn(t.R);
  t.check("열리면 초점이 창 안으로 들어간다", inside, `지금 초점: ${await t.active()}`);
  let escaped = false;
  for (let i = 0; i < 6; i += 1) { await t.key("Tab"); if (!(await t.activeIn(t.R))) { escaped = true; break; } }
  t.check("Tab 을 여러 번 눌러도 초점이 창 밖으로 새지 않는다", !escaped, escaped ? `새어 나간 곳: ${await t.active()}` : "6회 Tab 모두 창 안");
  await t.key("Escape");
  await t.wait(200);
  const hidden = await t.eval(`${q(t.R)}.hidden || ![...${q(t.R)}.querySelectorAll('[role="dialog"]')].some(e=>window.__A.vis(e))`);
  t.check("Esc 로 닫힌다", hidden, `hidden=${await t.eval(`${q(t.R)}.hidden`)}`);
  const back = await t.activeIs("#__audit_opener");
  t.check("닫히면 초점이 열었던 버튼으로 돌아온다", back, `지금 초점: ${await t.active()}`);
}

/* ── 컴포넌트별 시나리오 ─────────────────────────────────────────── */

export const PROBES = {
  toggle: (t) => flipByClickAndKeys(t, "aria-checked"),
  chip: (t) => flipByClickAndKeys(t, "aria-pressed"),
  button: nativeButtonActivation,
  "assist-button": nativeButtonActivation,
  "text-button": nativeButtonActivation,

  async checkbox(t) {
    const control = `${t.R} [data-s1-part="control"]`;
    const before = await t.prop(control, "checked");
    await t.click(`${t.R} [data-s1-part="label"]`);
    const afterLabel = await t.prop(control, "checked");
    t.check("글자(라벨)를 눌러도 체크된다", afterLabel !== before, `checked: ${before} → ${afterLabel}`);
    await t.focus(control);
    await t.key("Space");
    const afterSpace = await t.prop(control, "checked");
    t.check("Space 키로 체크가 바뀐다", afterSpace !== afterLabel, `checked: ${afterLabel} → ${afterSpace}`);
  },

  async radio(t) {
    const control = `${t.R} [data-s1-part="control"]`;
    await t.click(`${t.R} [data-s1-part="label"]`);
    t.check("글자(라벨)를 누르면 선택된다", await t.prop(control, "checked") === true, `checked=${await t.prop(control, "checked")}`);
  },

  async textarea(t) {
    const control = `${t.R} [data-s1-part="control"]`;
    await t.click(control);
    await t.type("여러 줄 확인");
    t.check("글자를 입력할 수 있다", (await t.prop(control, "value")) === "여러 줄 확인", `value="${await t.prop(control, "value")}"`);
  },

  async input(t) {
    const control = `${t.R} [data-s1-part="control"]`;
    const clear = `${t.R} [data-action="clear"]`;
    const password = `${t.R} [data-action="password"]`;
    if (await t.exists(password)) {
      await t.click(control);
      await t.type("secret12");
      const typeBefore = await t.prop(control, "type");
      await t.click(password);
      const typeAfter = await t.prop(control, "type");
      t.check("눈 버튼을 누르면 비밀번호가 보인다", typeBefore === "password" && typeAfter === "text", `type: ${typeBefore} → ${typeAfter}, aria-pressed=${await t.attr(password, "aria-pressed")}`);
      await t.click(password);
      t.check("한 번 더 누르면 다시 가려진다", (await t.prop(control, "type")) === "password", `type=${await t.prop(control, "type")}`);
      await t.eval(`(()=>{const c=${q(control)}; c.value=""; c.dispatchEvent(new Event("input",{bubbles:true})); return true;})()`);
    }
    if (!(await t.exists(clear))) return;
    const hiddenAtStart = !(await t.visible(clear));
    t.check("빈 칸일 때는 지우기 버튼이 숨어 있다", hiddenAtStart, `보임=${!hiddenAtStart}`, { severity: "friction" });
    await t.click(control);
    await t.type("테스트");
    await t.wait(80);
    const shown = await t.visible(clear);
    t.check("글자를 치면 지우기 버튼이 나타난다", shown, `value="${await t.prop(control, "value")}", 지우기 보임=${shown}`);
    if (!shown) return;
    await t.click(clear);
    await t.wait(80);
    const value = await t.prop(control, "value");
    t.check("지우기 버튼을 누르면 글자가 지워진다", value === "", `value="${value}"`);
    t.check("지운 뒤 지우기 버튼이 다시 숨는다", !(await t.visible(clear)), `보임=${await t.visible(clear)}`);
    t.check("지운 뒤 초점이 입력칸으로 돌아온다", await t.activeIs(control), `지금 초점: ${await t.active()}`, { severity: "friction" });
  },

  async dropdown(t) {
    const textRoot = '[data-s1-component="dropdown"][data-type="text"]';
    const options = `${textRoot} [data-s1-part="option"]`;
    const second = await t.mark(options, 1, "dd-opt-2");
    await t.click(second);
    const selected = await t.eval(`[...document.querySelectorAll(${js(options)})].filter(e=>e.getAttribute("aria-selected")==="true").map(e=>e.textContent.trim())`);
    t.check("항목을 누르면 그 항목만 선택된다", selected.length === 1 && selected[0] === (await t.text(second)), `선택됨: ${JSON.stringify(selected)}`);
    await t.focus(second);
    await t.key("ArrowDown");
    const moved = await t.eval(`document.activeElement !== ${q(second)} && document.activeElement.matches(${js(options)})`);
    t.check("↓ 키로 다음 항목으로 초점이 옮겨진다", moved, `지금 초점: ${await t.active()}`);
    await t.key("Enter");
    const enterSelected = await t.eval(`document.activeElement.getAttribute("aria-selected")`);
    t.check("Enter 키로 고를 수 있다", enterSelected === "true", `aria-selected=${enterSelected}`);
    const checkRoot = '[data-s1-component="dropdown"][data-type="checkbox"]';
    if (await t.exists(checkRoot)) {
      const opt = await t.mark(`${checkRoot} [data-s1-part="option"][aria-checked="false"]:not([data-select-all])`, 0, "dd-chk");
      await t.click(opt);
      t.check("체크형: 항목을 누르면 체크된다", (await t.attr(opt, "aria-checked")) === "true", `aria-checked=${await t.attr(opt, "aria-checked")}`);
    }
  },

  async select(t) { await pickerSelect(t, t.R); await escapeReturnsFocus(t, t.R); },
  async "filter-chip"(t) { await pickerSelect(t, t.R); await escapeReturnsFocus(t, t.R); },

  async tab(t) {
    const tabs = `${t.R} [role="tab"]`;
    const second = await t.mark(tabs, 1, "tab-2");
    await t.click(second);
    t.check("탭을 누르면 그 탭이 선택된다", (await t.attr(second, "aria-selected")) === "true", `aria-selected=${await t.attr(second, "aria-selected")}`);
    const controls = await t.attr(second, "aria-controls");
    if (controls && (await t.exists(`#${controls}`))) {
      t.check("선택한 탭의 내용이 보인다", await t.visible(`#${controls}`), `#${controls} 보임=${await t.visible(`#${controls}`)}`);
    }
    await t.focus(second);
    await t.key("ArrowRight");
    const third = await t.eval(`(()=>{const a=document.activeElement; return {sel: window.__A.sel(a), selected: a.getAttribute("aria-selected"), isTab: a.getAttribute("role")==="tab", same: a===${q(second)}};})()`);
    t.check("→ 키로 다음 탭으로 옮겨 선택된다", third.isTab && !third.same && third.selected === "true", `초점 ${third.sel}, aria-selected=${third.selected}`);
  },

  async pagination(t) {
    const current = () => t.text(`${t.R} [aria-current="page"]`);
    await t.click(`${t.R} [data-s1-part="page"][data-page="3"]`);
    t.check("3쪽을 누르면 3쪽이 현재 쪽이 된다", (await current()) === "3", `현재 쪽 표시="${await current()}", data-page=${await t.attr(t.R, "data-page")}`);
    await t.click(`${t.R} [data-s1-action="next"]`);
    t.check("다음 버튼을 누르면 한 쪽 넘어간다", (await current()) === "4", `현재 쪽 표시="${await current()}"`);
    await t.focus(`${t.R} [data-s1-part="page"][data-page="2"]`);
    await t.key("Enter");
    t.check("Enter 키로 쪽을 고를 수 있다", (await current()) === "2", `현재 쪽 표시="${await current()}"`);
    /* 네 버튼(river 2026-10-13): |< 이전 묶음 · < 이전 쪽 · > 다음 쪽 · >| 다음 묶음 — 묶음 이동은 이전/다음 묶음의 첫 쪽 */
    const names = await t.eval(`JSON.stringify([...document.querySelectorAll(${js(`${t.R} [data-s1-action]`)})].map((b) => b.getAttribute("aria-label")))`);
    t.check("이동 버튼 네 개의 이름이 묶음/쪽을 구분한다", names === JSON.stringify(["이전 페이지 묶음", "이전 페이지", "다음 페이지", "다음 페이지 묶음"]), `이름=${names}`);
    await t.eval(`(async()=>{const m=await import("./s1-ui/s1-ui.js"); m.pagination.init(${q(t.R)}).setTotalPages(14); m.pagination.init(${q(t.R)}).setPage(1); return true;})()`);
    await t.wait(100);
    const nums = () => t.eval(`[...document.querySelectorAll(${js(`${t.R} [data-s1-part="page"]`)})].map((b) => b.textContent).join(",")`);
    const lastOff = () => t.eval(`document.querySelector(${js(`${t.R} [data-s1-action="last"]`)}).disabled`);
    await t.focus(`${t.R} [data-s1-action="last"]`);
    await t.key("Enter");
    t.check(">| 는 다음 묶음의 첫 쪽으로 간다", (await current()) !== "1" && (await nums()).split(",")[0] === (await current()), `현재 쪽="${await current()}", 번호 창=${await nums()}`);
    await t.focus(`${t.R} [data-s1-action="last"]`);
    await t.key("Enter");
    t.check("마지막 묶음에서는 >| 가 막히고 초점이 현재 쪽 번호에 남는다", (await lastOff()) === true && (await t.eval(`document.activeElement.getAttribute("aria-current")`)) === "page", `>| 막힘=${await lastOff()}, 초점=${await t.eval(`document.activeElement.tagName + ":" + document.activeElement.getAttribute("aria-current")`)}`);
  },

  async "multi-toggle"(t) {
    const cells = `${t.R} [data-s1-part="cell"]`;
    const second = await t.mark(cells, 1, "mt-2");
    await t.click(second);
    t.check("칸을 누르면 그 칸이 선택된다", (await t.attr(second, "aria-checked")) === "true", `aria-checked=${await t.attr(second, "aria-checked")}`);
    await t.focus(second);
    await t.key("ArrowRight");
    const now = await t.eval(`(()=>{const a=document.activeElement; return {checked:a.getAttribute("aria-checked"), same:a===${q(second)}, sel: window.__A.sel(a)};})()`);
    t.check("→ 키로 옆 칸이 선택된다", !now.same && now.checked === "true", `초점 ${now.sel}, aria-checked=${now.checked}`);
  },

  modal: (t) => dialogLifecycle(t, "modal"),
  "modal-content": (t) => dialogLifecycle(t, "modalContent"),

  async "bottom-sheet"(t) {
    const visibleNow = await t.eval(`!${q(t.R)}.hidden`);
    if (visibleNow) {
      await t.focus(`${t.R} [data-s1-part="sheet-close"]`);
      await t.key("Escape");
      await t.wait(200);
      t.check("열린 채 들어온 시트도 Esc 로 닫힌다", await t.eval(`${q(t.R)}.hidden`), `hidden=${await t.eval(`${q(t.R)}.hidden`)}`);
    }
    await dialogLifecycle(t, "bottomSheet");
    await t.eval(`(async()=>{const m=await import("./s1-ui/s1-ui.auto.js"); document.getElementById("__audit_opener").focus(); m.bottomSheet.init(${q(t.R)}).open(); return true;})()`);
    await t.wait(200);
    const top = await t.eval(`${q(`${t.R} [data-s1-part="sheet-panel"]`)}.getBoundingClientRect().top`);
    if (top > 20) {
      await t.clickAt(20, Math.max(5, Math.floor(top / 2)));
      await t.wait(200);
      t.check("바깥 어두운 곳을 누르면 닫힌다", await t.eval(`${q(t.R)}.hidden`), `hidden=${await t.eval(`${q(t.R)}.hidden`)}`);
    }
  },

  async "date-picker"(t) {
    const root = t.R;
    const trigger = `${root} [data-s1-part="trigger"]`;
    const cells = `${root} [data-s1-part="cell"]`;
    const valueBefore = await t.text(`${root} [data-s1-part="value"]`);
    await t.click(trigger);
    await t.wait(200);
    const opened = await isOpen(t, root);
    t.check("트리거를 누르면 달력이 열린다", opened.expanded === "true" && opened.surface, `aria-expanded=${opened.expanded}, 달력 보임=${opened.surface}`);
    if (!opened.surface) return;
    /* 열리면 키보드 초점이 날짜 칸으로 간다 — 고른 날짜(기간이면 시작일), 없으면 오늘, 오늘이 안 보이는 달이면 그 달의 1일 (river 2026-10-13) */
    const focusInfo = await t.eval(`(()=>{const a=document.activeElement; const d=new Date(); const iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); const root=${q(root)}; return {date:a&&a.dataset?a.dataset.date:null, inRoot: root.contains(a), today: iso, preset: !!(root.dataset.value||root.dataset.rangeStart)};})()`);
    if (!focusInfo.preset) t.check("열리면 초점이 오늘 날짜 칸으로 간다", focusInfo.inRoot && focusInfo.date === focusInfo.today, `초점 날짜=${focusInfo.date}, 오늘=${focusInfo.today}`);
    const days = await t.eval(`[...document.querySelectorAll(${js(cells)})].filter(e=>window.__A.vis(e) && e.getAttribute("aria-disabled")!=="true").length`);
    t.check("달력에 날짜 칸이 그려진다", days >= 28, `보이는 날짜 칸 ${days}개`);
    const pickDay = async (n, name) => {
      const index = await t.eval(`[...document.querySelectorAll(${js(cells)})].filter(e=>window.__A.vis(e)).findIndex(e=>e.textContent.trim()===${js(String(n))} && e.getAttribute("aria-disabled")!=="true")`);
      if (index < 0) throw new NotFound(`${n}일 칸 없음`);
      await t.click(await t.mark(cells, index, name));
      await t.wait(120);
    };
    const mode = await t.attr(root, "data-mode");
    if (mode === "range") { await pickDay(10, "dp-a"); await pickDay(20, "dp-b"); } else { await pickDay(15, "dp-a"); }
    const apply = `${root} [data-s1-part="apply"]`;
    if (await t.visible(apply)) { await t.click(apply); await t.wait(200); }
    const valueAfter = await t.text(`${root} [data-s1-part="value"]`);
    const after = await isOpen(t, root);
    t.check(mode === "range" ? "시작·끝 날짜를 고르면 값이 바뀐다" : "날짜를 고르면 값이 바뀐다", valueAfter !== valueBefore, `값: "${valueBefore}" → "${valueAfter}"`);
    t.check("고른 뒤 달력이 닫힌다", after.expanded !== "true" && !after.surface, `aria-expanded=${after.expanded}, 달력 보임=${after.surface}`);
    await escapeReturnsFocus(t, root);
  },

  async "time-picker"(t) {
    const root = t.R;
    const trigger = `${root} [data-s1-part="trigger"]`;
    const columnSelector = `${root} [data-s1-part="column"][role="listbox"], ${root} [data-s1-part="wheel-col"][role="listbox"]`;
    const valueBefore = await t.text(`${root} [data-s1-part="value"]`);
    await t.click(trigger);
    await t.wait(200);
    const opened = await isOpen(t, root);
    t.check("트리거를 누르면 시간 목록이 열린다", opened.expanded === "true" && opened.surface, `aria-expanded=${opened.expanded}, 패널 보임=${opened.surface}`);
    if (!opened.surface) return;
    const columns = await t.eval(`[...document.querySelectorAll(${js(columnSelector)})].filter(e=>window.__A.vis(e)).length`);
    for (let c = 0; c < columns; c += 1) {
      const col = await t.mark(columnSelector, c, `tp-col-${c}`);
      await t.click(await t.mark(`${col} [role="option"]`, 1, `tp-cell-${c}`));
    }
    const confirm = (await t.visible(`${root} [data-s1-part="confirm"]`)) ? `${root} [data-s1-part="confirm"]` : `${root} [data-s1-part="apply"]`;
    const enabled = await t.eval(`!!${q(confirm)} && !${q(confirm)}.disabled`);
    t.check("시·분을 고르면 확인 버튼을 누를 수 있게 된다", enabled, `확인 버튼 disabled=${!enabled}`);
    if (enabled) { await t.click(confirm); await t.wait(200); }
    const valueAfter = await t.text(`${root} [data-s1-part="value"]`);
    const after = await isOpen(t, root);
    t.check("확인을 누르면 값이 바뀐다", valueAfter !== valueBefore, `값: "${valueBefore}" → "${valueAfter}"`);
    t.check("확인을 누르면 닫힌다", after.expanded !== "true" && !after.surface, `aria-expanded=${after.expanded}, 패널 보임=${after.surface}`);
    await escapeReturnsFocus(t, root);
  },

  async "expandable-card"(t) {
    const header = `${t.R} [data-s1-part="header"]`;
    const before = await t.attr(header, "aria-expanded");
    await t.click(header);
    await t.wait(450);
    const after = await t.attr(header, "aria-expanded");
    const panelId = await t.attr(header, "aria-controls");
    const height = await t.eval(`(document.getElementById(${js(panelId)})?.getBoundingClientRect().height) ?? -1`);
    t.check("머리줄을 누르면 펼쳐진다", before === "false" && after === "true" && height > 0, `aria-expanded: ${before} → ${after}, 펼친 칸 높이 ${Math.round(height)}px`);
    await t.focus(header);
    await t.key("Enter");
    await t.wait(450);
    t.check("Enter 키로 다시 접힌다", (await t.attr(header, "aria-expanded")) === "false", `aria-expanded=${await t.attr(header, "aria-expanded")}`);
  },

  async gnb(t) {
    await t.eval("document.activeElement && document.activeElement.blur(), true");
    let trigger = null;
    for (let i = 0; i < 25; i += 1) {
      await t.key("Tab");
      const info = await t.eval(`(()=>{const a=document.activeElement; return a && a.hasAttribute("aria-controls") && ${q(t.R)}.contains(a) ? {sel: window.__A.sel(a), controls: a.getAttribute("aria-controls")} : null;})()`);
      if (info) { trigger = info; break; }
    }
    if (!trigger) throw new NotFound("하위메뉴가 달린 메뉴에 Tab 으로 닿지 못함");
    await t.wait(150);
    const panel = `#${trigger.controls}`;
    t.check("하위메뉴가 있는 메뉴에 Tab 으로 가면 하위메뉴가 펼쳐진다", await t.visible(panel), `${panel} 보임=${await t.visible(panel)}`);
    await t.key("Escape");
    await t.wait(150);
    t.check("Esc 를 누르면 하위메뉴가 닫힌다", !(await t.visible(panel)), `${panel} 보임=${await t.visible(panel)}`);
    t.check("닫힌 뒤 초점이 그 메뉴로 돌아온다", (await t.active()) === trigger.sel, `지금 초점: ${await t.active()}`);
  },

  async lnb(t) {
    const collapse = `${t.R} [data-s1-part="collapse"]`;
    const widthBefore = await t.eval(`${q(t.R)}.getBoundingClientRect().width`);
    await t.click(collapse);
    await t.wait(400);
    const widthAfter = await t.eval(`${q(t.R)}.getBoundingClientRect().width`);
    t.check("접기 단추를 누르면 메뉴가 접힌다", (await t.attr(collapse, "aria-pressed")) === "true" && widthAfter < widthBefore, `aria-pressed=${await t.attr(collapse, "aria-pressed")}, 폭 ${Math.round(widthBefore)} → ${Math.round(widthAfter)}px, data-state=${await t.attr(t.R, "data-state")}`);
    await t.click(collapse);
    await t.wait(400);
    const sub = `${t.R} button[aria-controls]`;
    if (await t.exists(sub)) {
      const id = await t.attr(sub, "aria-controls");
      await t.click(sub);
      await t.wait(200);
      t.check("하위메뉴 항목을 누르면 하위메뉴가 열린다", (await t.attr(sub, "aria-expanded")) === "true" && (await t.visible(`#${id}`)), `aria-expanded=${await t.attr(sub, "aria-expanded")}, #${id} 보임=${await t.visible(`#${id}`)}`);
    }
  },

  async table(t) {
    const all = `${t.R} thead input[type="checkbox"]`;
    await t.click(all);
    const rows = await t.eval(`[...${q(t.R)}.querySelectorAll('tbody input[type="checkbox"]')].map(e=>e.checked)`);
    t.check("전체 선택을 누르면 모든 줄이 선택된다", rows.length > 0 && rows.every(Boolean), `줄 체크 ${rows.filter(Boolean).length}/${rows.length}`);
    const one = await t.mark(`${t.R} tbody input[type="checkbox"]`, 0, "tbl-row-1");
    await t.click(one);
    const head = await t.eval(`(()=>{const h=${q(all)}; return {checked:h.checked, indeterminate:h.indeterminate};})()`);
    t.check("한 줄을 풀면 전체 선택 표시도 풀린다", head.checked === false || head.indeterminate === true, `전체 선택 checked=${head.checked}, 일부 표시=${head.indeterminate}`);
  }
};

/** 상태 전환 계약이 없는(정적) 컴포넌트 — 시나리오 대상 아님을 명시해 둔다. */
export const STATIC_COMPONENTS = new Set(["divider", "data-tag", "gnb-sub-menu", "gnb-sub-menu-item", "bottom-sheet-option", "list-row", "mobile-header", "mobile-bottom-nav"]);
