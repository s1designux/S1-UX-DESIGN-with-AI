/**
 * react-legacy.mjs — "0.22.0 코드가 그대로 도는가" 시험 (react.mjs 가 부른다)
 * --------------------------------------------------------------------------
 * 새 버전을 낼 때마다 개발자의 옛 코드가 같은 모양·같은 동작으로 남는지를 본다. 비교 기준은 **글로 쓴 기대값이 아니라
 * 0.22.0 묶음을 같은 시험대에서 돌려 얻은 실측값**(legacy-0.22.0.golden.json)이다.
 *   기록:  node scripts/publisher-audit/react.mjs --zip <0.22.0 zip> --legacy-record --env <환경>
 *          (zip 은 `git show 93b02073:assets/downloads/s1-ui-react.zip` 으로 꺼낸다)
 *   검사:  평소 검수기 실행에 함께 돈다. 다르면 "고장"으로 올라온다 — 옛 슬롯 이름(parts.label · parts.chevron · 카드 판 안쪽 ·
 *          LNB item/itemIcon · 셀렉트 parts.value)이 0.22.0 처럼 일하지 않는다는 뜻이다.
 * 사례는 전부 옛 이름·옛 모양으로만 쓴다(새 prop 을 쓰지 않는다). 0.22.0 에서 일부러 고친 것(리스트 행 종류별 마크업, 모달 defaultOpen 등)은
 * 사례에 넣지 않는다.
 */

import fs from "node:fs";
import path from "node:path";

export const GOLDEN_FILE = "legacy-0.22.0.golden.json";

const norm = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

/** 한 부품의 안쪽을 슬롯 이름 순서대로 펼친 목록 — 글자·켜짐 상태·숨김. id 는 빼서 인스턴스마다 달라지는 값에 흔들리지 않는다. */
const DUMP = `(() => {
  const root = document.querySelector('#stage > *');
  if (!root) return ['(없음)'];
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.replace(/\\s+/g, ' ').trim()).filter(Boolean).join(' ');
  const flags = ['aria-checked', 'aria-selected', 'aria-expanded', 'aria-pressed', 'aria-current', 'data-state', 'data-open', 'data-test', 'data-zz', 'data-value', 'href', 'title'];
  const out = [];
  const walk = (e) => {
    const part = e.getAttribute('data-s1-part') || e.getAttribute('data-s1-component');
    if (part) out.push(part + ' | ' + own(e) + ' | ' + flags.map((a) => e.getAttribute(a) ?? '').join(',') + (e.hidden ? ' | 숨김' : ''));
    for (const child of e.children) walk(child);
  };
  walk(root);
  return out;
})()`;

const sel = (css) => `[...document.querySelectorAll(${JSON.stringify(css)})].map((e) => e.textContent.replace(/\\s+/g, ' ').trim())`;

/**
 * 사례 — key 는 장부 이름. props 는 시험대(harness.jsx)가 되살린다("$fn:이름" 기록 함수 · "$toggle:꺼짐|켜짐:이름" 옛 방식 토글 요소 · "$el:글자" 요소).
 * facts(page, h) 는 화면에서 얻을 사실(JSON)을 돌려준다.
 */
export const LEGACY_CASES = [
  {
    key: "modal-parts-label-pc", title: "모달 parts.label — 두 단추 글자를 함께 정한다(pc · 단추 둘)",
    name: "S1Modal", props: { variant: "dual", parts: { title: "T", message: "M", label: "예" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "modal-parts-label-mobile", title: "모달 parts.label(모바일)",
    name: "S1Modal", props: { variant: "single", breakName: "mobile", parts: { label: "닫기" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "modal-parts-title-message", title: "모달 parts.title·message 만 주면 단추 글자는 견본이 남는다(0.22.0 쓰는 법)",
    name: "S1Modal", props: { variant: "dual", breakName: "mobile", parts: { title: "알림 화면으로 이동", message: "이동할까요?" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "modal-content-parts-label", title: "모달 콘텐츠 parts.label — 두 단추 글자를 함께 정한다",
    name: "S1ModalContent", props: { variant: "dual", size: "md", parts: { title: "수정", label: "닫기" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "sheet-parts-label", title: "바텀시트 parts.label — 아래 단추(와 견본 줄) 글자를 정한다",
    name: "S1BottomSheet", props: { variant: "single", parts: { sheetTitle: "정렬", label: "완료" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "sheet-parts-title-only", title: "바텀시트 parts.sheetTitle 만 — 나머지는 견본 그대로",
    name: "S1BottomSheet", props: { variant: "none", parts: { sheetTitle: "글자 크기" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "card-parts-panel", title: "접힘 카드 parts.title·subtitle·body — 머리줄과 펼침 판 안쪽 둘 다 채운다",
    name: "S1ExpandableCard", props: { parts: { title: "질문1", subtitle: "부제", body: "본문1" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "card-parts-note-caption", title: "접힘 카드 parts.note·caption",
    name: "S1ExpandableCard", props: { parts: { note: "메모", caption: "설명" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "lnb-parts-item", title: "LNB parts.item — 모든 항목(하위 포함)에 같은 속성",
    name: "S1Lnb", props: { variant: "menu", parts: { item: { attrs: { "data-test": "it", title: "공통" } } } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "lnb-parts-icon", title: "LNB parts.itemIcon · itemToggle · item 글자 — 모든 항목에 같은 내용",
    name: "S1Lnb", props: { variant: "menu", parts: { itemIcon: "★", itemToggle: "▾", item: "하위" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "listrow-nav-title-only", title: "리스트 행 variant=nav, parts.title 만 — 설명은 견본이 남는다(0.22.0)",
    name: "S1ListRow", props: { variant: "nav", parts: { title: "버전 정보" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "listrow-nav", title: "리스트 행 variant=nav, parts.title·description",
    name: "S1ListRow", props: { variant: "nav", parts: { title: "버전 정보", description: "0.22.0" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "listrow-value-parts", title: "리스트 행 variant=value, parts.title·description — 값 칸에 견본 글자(라이트)가 끼어들지 않는다",
    name: "S1ListRow", props: { variant: "value", parts: { title: "글자 크기", description: "보통" } },
    facts: async (page) => ({ title: await page.eval(sel('#stage [data-s1-part="title"]')), description: await page.eval(sel('#stage [data-s1-part="description"]')), value: await page.eval(sel('#stage [data-s1-part="value"]')) })
  },
  {
    key: "listrow-switch-chevron-toggle", title: "리스트 행 variant=switch, parts.chevron 에 준 토글 — 보이고 · 눌러지고 · 상태가 그 토글 것이다",
    name: "S1ListRow", props: { variant: "switch", parts: { title: "푸시 알림", description: "새 출입 기록을 알려 드려요", chevron: "$toggle:false:행토글" } },
    facts: async (page, h) => {
      const read = () => page.eval(`[...document.querySelectorAll('#stage [data-s1-component="toggle"]')].map((e) => e.getAttribute('aria-checked'))`);
      const before = await read();
      await h.click(page, '#stage [data-s1-component="toggle"]');
      const after = await read();
      const ev = await h.events(page);
      return { texts: await page.eval(sel('#stage [data-s1-part="title"], #stage [data-s1-part="description"]')), before, after, userClicks: ev.filter((e) => e.label === "행토글").length };
    }
  },
  {
    key: "listrow-switch-chevron-toggle-on", title: "리스트 행 variant=switch, parts.chevron 에 켜진 토글을 준다(앱 상태가 켜짐)",
    name: "S1ListRow", props: { variant: "switch", parts: { title: "마케팅", chevron: "$toggle:true:마케팅토글" } },
    facts: async (page, h) => {
      const read = () => page.eval(`[...document.querySelectorAll('#stage [data-s1-component="toggle"]')].map((e) => e.getAttribute('aria-checked'))`);
      const before = await read();
      await h.click(page, '#stage [data-s1-component="toggle"]');
      return { before, after: await read() };
    }
  },
  {
    key: "select-parts-value", title: "셀렉트 parts.value — 트리거 글자를 정하고, 고른 뒤 React 가 parts.value 를 바꾸면 따라온다",
    scenario: "legacySelect", options: {},
    facts: async (page, h) => {
      const trigger = () => page.eval(`document.querySelector('#stage [data-s1-part="value"]').textContent.replace(/\\s+/g, ' ').trim()`);
      const first = await trigger();
      await h.click(page, '#stage [data-s1-part="trigger"]');
      await h.click(page, '#stage [data-s1-part="option"]:nth-child(2)');
      const afterPick = await trigger();
      await page.eval(`window.__s1.ctl.legacySelect.setLabel("직접 지정")`);
      await h.sleep(200);
      const afterSet = await trigger();
      const ev = await h.events(page);
      return { first, afterPick, afterSet, onChange: ev.filter((e) => e.label === "legacySelect:onChange").length, picked: ev.find((e) => e.label === "legacySelect:onChange")?.detail?.detail?.value ?? null };
    }
  },
  {
    key: "dropdown-no-prop", title: "드롭다운에 아무것도 안 주면 처음에 고른 줄(최신순)이 켜진 채 보인다",
    name: "S1Dropdown", props: {},
    facts: (page) => page.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map((e) => e.textContent.trim() + '|' + e.getAttribute('aria-selected') + '|' + e.getAttribute('tabindex'))`)
  },
  {
    key: "dropdown-legacy-items", title: "드롭다운 옛 항목 모양({ optionLabel, attrs })",
    name: "S1Dropdown", props: { options: [{ optionLabel: "A", attrs: { "data-value": "a", "aria-selected": "true" } }, { optionLabel: "B", attrs: { "data-value": "b" } }] },
    facts: (page) => page.eval(`[...document.querySelectorAll('#stage [data-s1-part="option"]')].map((e) => e.textContent.trim() + '|' + e.getAttribute('aria-selected') + '|' + e.getAttribute('data-value'))`)
  },
  {
    key: "gnb-parts-logo", title: "GNB parts.logo — 메뉴는 견본 그대로",
    name: "S1Gnb", props: { parts: { logo: "S1 관제" } }, facts: async (page) => ({ menus: await page.eval(sel('#stage [data-s1-part="menu"]')), logo: await page.eval(sel('#stage [data-s1-part="logo"]')) })
  },
  {
    key: "filter-chip-parts", title: "필터 칩 parts.title·value",
    name: "S1FilterChip", props: { size: "sm", parts: { title: "정렬", value: "최신순" } }, facts: (page) => page.eval(DUMP)
  },
  {
    key: "time-parts-value", title: "시간 선택 parts.value",
    name: "S1TimePicker", props: { size: "xsm", parts: { value: "09:10" } }, facts: async (page) => ({ value: await page.eval(sel('#stage [data-s1-part="value"]')) })
  }
];

export function goldenPath(harnessDir) {
  return path.join(harnessDir, GOLDEN_FILE);
}

export function readGolden(harnessDir) {
  const file = goldenPath(harnessDir);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

export function writeGolden(harnessDir, facts, note) {
  fs.writeFileSync(goldenPath(harnessDir), `${JSON.stringify({ _meta: { note, recordedAt: new Date().toISOString().slice(0, 10) }, facts }, null, 2)}\n`);
}

/** 사례 하나를 시험대에서 돌려 사실을 얻는다. */
export async function collectFacts(page, c, h) {
  const spec = c.scenario ? { scenario: c.scenario, options: c.options } : { name: c.name, props: c.props };
  await h.mount(page, { ...spec, wait: 400 });
  return JSON.parse(JSON.stringify(await c.facts(page, h)));
}

export { norm };
