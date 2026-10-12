/* RN 부품의 동작을 실제로 눌러 보는 검사 사례 — react-native-behavior-check.mjs 가 번들해 헤드리스 크롬에서 돌린다.
   각 사례는 부품을 그리고, 눌러 보고, DOM(react-native-web 이 그린 속성)으로 결과를 확인한다.
   기대하는 동작은 승인 배포본의 동작(components/*.js)과 platform/behavior.json 이 정한 것이다. */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { View } from "react-native";
import { S1Provider } from "RN_ENGINE";
import * as Parts from "RN_INDEX";

const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const log = [];

async function mount(element) {
  const host = document.createElement("div");
  host.style.cssText = "width:480px;position:relative;height:600px";
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(<S1Provider dark={false} inline><View>{element}</View></S1Provider>); });
  await wait();
  return { host, root };
}
const q = (host, selector) => host.querySelector(selector);
const all = (host, selector) => [...host.querySelectorAll(selector)];
const part = (host, name, index = 0) => all(host, `[data-s1part="${name}"]`)[index];
async function press(element) {
  await act(async () => { element.click(); });
  await wait();
}
async function typeInto(input, text) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await wait();
}
async function focus(element) {
  await act(async () => { element.focus(); });
  await wait();
}
const attr = (element, name) => (element ? element.getAttribute(name) : "(없음)");

function check(name, ok, detail) { results.push({ name, ok: Boolean(ok), detail: ok ? undefined : detail }); }

const CASES = [
  ["toggle · 눌러서 켜고 끈다(승인 동작: toggle off ↔ on)", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Toggle onCheckedChange={(value) => calls.push(value)} />);
    const root = q(host, '[data-s1c="toggle"]');
    check("처음 꺼짐", attr(root, "aria-checked") === "false", attr(root, "aria-checked"));
    await press(root);
    check("누르면 켜짐", attr(root, "aria-checked") === "true", attr(root, "aria-checked"));
    await press(root);
    check("다시 누르면 꺼짐", attr(root, "aria-checked") === "false", attr(root, "aria-checked"));
    check("콜백 true → false", JSON.stringify(calls) === "[true,false]", JSON.stringify(calls));
  }],
  ["toggle · 비활성이면 눌러도 그대로", async () => {
    const { host } = await mount(<Parts.S1Toggle disabled />);
    const root = q(host, '[data-s1c="toggle"]');
    await press(root);
    check("그대로 꺼짐", attr(root, "aria-checked") === "false", attr(root, "aria-checked"));
  }],
  ["chip · 눌러서 선택·해제", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Chip onSelectedChange={(value) => calls.push(value)} />);
    const root = q(host, '[data-s1c="chip"]');
    await press(root);
    check("선택됨", attr(root, "aria-pressed") === "true", attr(root, "aria-pressed"));
    await press(root);
    check("해제됨", attr(root, "aria-pressed") === "false", attr(root, "aria-pressed"));
    check("콜백", JSON.stringify(calls) === "[true,false]", JSON.stringify(calls));
  }],
  ["checkbox · 체크 칸과 글자 어디를 눌러도 바뀐다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Checkbox onCheckedChange={(value) => calls.push(value)} />);
    await press(part(host, "control"));
    check("칸을 누르면 체크", attr(part(host, "control"), "aria-checked") === "true", attr(part(host, "control"), "aria-checked"));
    await press(part(host, "label"));
    check("글자를 누르면 해제", attr(part(host, "control"), "aria-checked") === "false", attr(part(host, "control"), "aria-checked"));
    check("콜백", JSON.stringify(calls) === "[true,false]", JSON.stringify(calls));
  }],
  ["tab · 누른 탭이 선택되고 그 내용만 보인다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Tab onChange={(detail) => calls.push(detail.index)} />);
    const tabs = all(host, '[data-s1part="tab"]');
    check("처음 첫 탭 선택", attr(tabs[0], "aria-selected") === "true", attr(tabs[0], "aria-selected"));
    check("처음엔 첫 내용만", host.textContent.includes("첫 번째 내용") && !host.textContent.includes("두 번째 내용"), host.textContent);
    await press(tabs[1]);
    const after = all(host, '[data-s1part="tab"]');
    check("둘째 탭 선택", attr(after[1], "aria-selected") === "true" && attr(after[0], "aria-selected") === "false", `${attr(after[0], "aria-selected")}/${attr(after[1], "aria-selected")}`);
    check("둘째 내용만 보임", host.textContent.includes("두 번째 내용") && !host.textContent.includes("첫 번째 내용"), host.textContent);
    check("콜백 index 1", JSON.stringify(calls) === "[1]", JSON.stringify(calls));
  }],
  ["multi-toggle · 한 칸만 고른다", async () => {
    const { host } = await mount(<Parts.S1MultiToggle />);
    const cells = () => all(host, '[data-s1part="cell"]');
    const before = cells().map((one) => attr(one, "aria-checked"));
    await press(cells()[2]);
    const after = cells().map((one) => attr(one, "aria-checked"));
    check("셋째만 켜짐", after.filter((one) => one === "true").length === 1 && after[2] === "true", JSON.stringify({ before, after }));
  }],
  ["dropdown(글자) · 누른 옵션이 선택된다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Dropdown onChange={(detail) => calls.push(detail)} />);
    const options = () => all(host, '[data-s1part="option"]');
    await press(options()[1]);
    check("둘째 옵션 선택", attr(options()[1], "aria-selected") === "true" && attr(options()[0], "aria-selected") === "false", options().map((one) => attr(one, "aria-selected")).join());
    check("콜백 값·글자", calls[0]?.value === "popular" && calls[0]?.label === "인기순", JSON.stringify(calls));
  }],
  ["dropdown(체크박스) · 전체 선택·개별 토글", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Dropdown variant="checkbox" onChange={(detail) => calls.push(detail)} />);
    const options = () => all(host, '[data-s1part="option"]');
    const checks = () => options().map((one) => attr(one, "aria-checked"));
    const first = checks();
    await press(options()[0]);
    check("전체 켜기", checks().every((one) => one === "true"), `${first.join()} → ${checks().join()}`);
    await press(options()[2]);
    check("개별 끄면 전체도 꺼짐", checks()[0] === "false" && checks()[2] === "false", checks().join());
    check("콜백이 체크박스형", calls.every((one) => one.type === "checkbox"), JSON.stringify(calls));
  }],
  ["pagination · 쪽 이동·화살표 막힘", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Pagination onChange={(detail) => calls.push(detail.page)} />);
    const pages = () => all(host, '[data-s1part="page"]');
    await press(pages()[2]);
    check("3쪽이 현재", attr(pages()[2], "aria-current") === "page", pages().map((one) => attr(one, "aria-current")).join());
    check("콜백 3", calls[calls.length - 1] === 3, JSON.stringify(calls));
  }],
  ["expandable-card · 머리를 누르면 펼쳐진다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1ExpandableCard onChange={(detail) => calls.push(detail.open)} />);
    const header = part(host, "header");
    const closed = attr(header, "aria-expanded");
    await press(header);
    check("펼침", closed === "false" && attr(part(host, "header"), "aria-expanded") === "true", `${closed} → ${attr(part(host, "header"), "aria-expanded")}`);
    const wrap = part(host, "panel-wrap");
    check("펼친 칸 높이가 생김", wrap.getBoundingClientRect().height > 0, wrap.getBoundingClientRect().height);
    await press(part(host, "header"));
    check("다시 접힘", attr(part(host, "header"), "aria-expanded") === "false" && part(host, "panel-wrap").getBoundingClientRect().height === 0, attr(part(host, "header"), "aria-expanded"));
    check("콜백", JSON.stringify(calls) === "[true,false]", JSON.stringify(calls));
  }],
  ["lnb · 접기 단추로 접고 펼친다 / 하위 메뉴 여닫이", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Lnb onCollapse={(detail) => calls.push(detail.collapsed)} />);
    const navigation = q(host, '[data-s1c="lnb"]');
    const wide = navigation.getBoundingClientRect().width;
    await press(part(host, "collapse"));
    const narrow = q(host, '[data-s1c="lnb"]').getBoundingClientRect().width;
    check("접으면 폭이 줄어든다", narrow < wide, `${wide} → ${narrow}`);
    await press(part(host, "collapse"));
    check("다시 펼치면 원래 폭", q(host, '[data-s1c="lnb"]').getBoundingClientRect().width === wide, q(host, '[data-s1c="lnb"]').getBoundingClientRect().width);
    const toggles = all(host, '[data-s1part="item"][aria-expanded]');
    check("하위 메뉴 가진 항목이 있다", toggles.length > 0, toggles.length);
    if (toggles.length > 0) {
      const before = all(host, '[data-s1part="subitems"]').length;
      await press(toggles[0]);
      check("눌러서 하위 목록이 나타난다", all(host, '[data-s1part="subitems"]').length > before, `${before} → ${all(host, '[data-s1part="subitems"]').length}`);
    }
    check("콜백", JSON.stringify(calls) === "[true,false]", JSON.stringify(calls));
  }],
  ["select · 열고 고르면 값이 바뀌고 닫힌다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Select onChange={(detail) => calls.push(detail.value)} />);
    check("처음 목록이 닫혀 있다", all(host, '[data-s1part="option"]').length === 0, all(host, '[data-s1part="option"]').length);
    await press(part(host, "trigger"));
    const options = all(host, '[data-s1part="option"]');
    check("열면 옵션이 보인다", options.length > 0, options.length);
    await press(options[1]);
    check("값 글자가 바뀐다", part(host, "value").textContent !== "", part(host, "value").textContent);
    check("고르면 닫힌다", all(host, '[data-s1part="option"]').length === 0, all(host, '[data-s1part="option"]').length);
    check("콜백", calls.length === 1, JSON.stringify(calls));
  }],
  ["filter-chip · 열고 고르면 값이 바뀐다", async () => {
    const { host } = await mount(<Parts.S1FilterChip />);
    await press(part(host, "trigger"));
    const options = all(host, '[data-s1part="option"]');
    check("열면 옵션이 보인다", options.length > 0, options.length);
    await press(options[2]);
    check("값이 바뀐다", part(host, "value").textContent.length > 0 && part(host, "value").textContent !== "최신순", part(host, "value").textContent);
  }],
  ["input · 글자를 치면 지우기가 나타나고 누르면 비워진다(검색)", async () => {
    const searched = [];
    const { host } = await mount(<Parts.S1Input mode="search" onSearch={(detail) => searched.push(detail.value)} />);
    const input = q(host, "input");
    check("처음엔 지우기 없음", all(host, '[data-s1part="action"]').length === 1, all(host, '[data-s1part="action"]').length);
    await typeInto(input, "안녕");
    check("글자를 치면 지우기가 보인다", all(host, '[data-s1part="action"]').length === 2, all(host, '[data-s1part="action"]').length);
    const search = all(host, '[data-s1part="action"]').find((one) => true);
    await press(all(host, '[data-s1part="action"]')[all(host, '[data-s1part="action"]').length - 1]);
    check("검색 단추 → onSearch", searched[0] === "안녕", JSON.stringify(searched));
    await press(all(host, '[data-s1part="action"]')[0]);
    check("지우기 → 비워진다", q(host, "input").value === "", q(host, "input").value);
  }],
  ["input · 비밀번호 보기 단추", async () => {
    const { host } = await mount(<Parts.S1Input mode="password" />);
    check("처음엔 가려진다", q(host, "input").type === "password", q(host, "input").type);
    const toggle = all(host, '[data-s1part="action"]').find((one) => attr(one, "aria-pressed") !== null && attr(one, "aria-pressed") !== "(없음)");
    await press(toggle);
    check("누르면 보인다", q(host, "input").type === "text", q(host, "input").type);
  }],
  ["table · 행 선택과 전체 선택", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Table onSelectionChange={(detail) => calls.push(detail.selectedCount)} />);
    const controls = () => all(host, '[data-s1c="checkbox"] [data-s1part="control"]');
    await press(controls()[1]);
    check("행 하나 선택", attr(controls()[1], "aria-checked") === "true", controls().map((one) => attr(one, "aria-checked")).join());
    await press(controls()[0]);
    check("헤더로 전체 선택", controls().every((one) => attr(one, "aria-checked") === "true"), controls().map((one) => attr(one, "aria-checked")).join());
    await press(controls()[0]);
    check("다시 누르면 전체 해제", controls().every((one) => attr(one, "aria-checked") === "false"), controls().map((one) => attr(one, "aria-checked")).join());
  }],
  ["modal · 열려 있고 닫기·취소·확인이 콜백을 부른다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1Modal open onClose={() => calls.push("close")} onConfirm={() => calls.push("confirm")} onCancel={() => calls.push("cancel")} />);
    check("열려 있으면 제목이 보인다", host.textContent.includes("제목 영역"), host.textContent);
    await press(part(host, "close"));
    const buttons = all(host, '[data-s1c="button"]');
    await press(buttons[0]);
    await press(buttons[1]);
    check("close · cancel · confirm", JSON.stringify(calls) === '["close","cancel","confirm"]', JSON.stringify(calls));
  }],
  ["modal · open 을 안 주면 그려지지 않는다", async () => {
    const { host } = await mount(<Parts.S1Modal />);
    check("제목이 없다", !host.textContent.includes("제목 영역"), host.textContent);
  }],
  ["date-picker · 열고 날짜를 고르면 값이 채워진다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1DatePicker today="2026-10-12" onChange={(detail) => calls.push(detail.value)} />);
    await press(part(host, "trigger"));
    const cells = all(host, '[data-s1part="cell"]');
    check("달력이 그려진다(35칸 이상)", cells.length >= 35, cells.length);
    const target = cells.find((one) => one.textContent === "15");
    await press(target);
    check("값 글자가 YY.MM.DD", part(host, "value").textContent === "26.10.15", part(host, "value").textContent);
    check("콜백이 ISO", calls[0] === "2026-10-15", JSON.stringify(calls));
    check("고르면 닫힌다", all(host, '[data-s1part="cell"]').length === 0, all(host, '[data-s1part="cell"]').length);
  }],
  ["date-picker · 기간 선택은 두 번째 날짜에서 확정된다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1DatePicker variant="range" today="2026-10-12" onChange={(detail) => calls.push(detail)} />);
    await press(part(host, "trigger"));
    const day = (n) => all(host, '[data-s1part="cell"]').find((one) => one.textContent === String(n));
    await press(day(10));
    check("시작만 고르면 아직 안 닫힌다", all(host, '[data-s1part="cell"]').length > 0 && calls.length === 0, JSON.stringify(calls));
    await press(day(20));
    check("끝을 고르면 확정", calls.length === 1 && calls[0].start === "2026-10-10" && calls[0].end === "2026-10-20", JSON.stringify(calls));
    check("값 글자가 기간", part(host, "value").textContent === "26.10.10 ~ 26.10.20", part(host, "value").textContent);
  }],
  ["date-picker · 월 이동과 연·월 선택", async () => {
    const { host } = await mount(<Parts.S1DatePicker today="2026-10-12" />);
    await press(part(host, "trigger"));
    check("헤더에 2026년 10월", part(host, "year-label").textContent === "2026년" && part(host, "month-label").textContent === "10월", part(host, "year-label").textContent + part(host, "month-label").textContent);
    await press(part(host, "next"));
    check("다음 달 11월", part(host, "month-label").textContent === "11월", part(host, "month-label").textContent);
    await press(part(host, "year-label"));
    check("연 타일 12개", all(host, '[data-s1part="tile"]').length === 12, all(host, '[data-s1part="tile"]').length);
  }],
  ["time-picker(PC) · 시·분을 고르고 확인하면 값이 채워진다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1TimePicker onChange={(detail) => calls.push(detail.value)} />);
    await press(part(host, "trigger"));
    const confirm = () => part(host, "confirm");
    check("처음엔 확인이 막혀 있다", confirm() && attr(confirm(), "aria-disabled") === "true", attr(confirm(), "aria-disabled"));
    const cells = (name) => all(host, `[data-s1part="column"][aria-label="${name}"] [data-s1part="cell"]`);
    await press(cells("시")[9]);
    await press(cells("분")[30]);
    await press(confirm());
    check("값 글자 09:30", part(host, "value").textContent === "09:30", part(host, "value").textContent);
    check("콜백", calls[0] === "09:30", JSON.stringify(calls));
  }],
  ["list-row(pick) · 줄을 누르면 체크가 바뀐다", async () => {
    const calls = [];
    const { host } = await mount(<Parts.S1ListRow variant="pick" onCheckedChange={(value) => calls.push(value)} />);
    await press(q(host, '[data-s1c="list-row"]'));
    check("체크됨", calls[0] === true, JSON.stringify(calls));
  }]
];

(async () => {
  for (const [title, run] of CASES) {
    const before = results.length;
    try { await run(); } catch (error) { check(`${title} — 실행 오류`, false, String(error?.stack ?? error).slice(0, 400)); }
    window.__caseSummary = window.__caseSummary ?? [];
    window.__caseSummary.push({ title, checks: results.slice(before) });
  }
  const output = document.createElement("script");
  output.type = "application/json";
  output.id = "s1-behavior";
  output.textContent = JSON.stringify(window.__caseSummary);
  document.body.appendChild(output);
  document.title = "S1-RN-BEHAVIOR-DONE";
})();
