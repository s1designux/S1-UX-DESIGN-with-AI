/**
 * react-spec-pickers.mjs — 표 · 페이지네이션 · 날짜 선택 · 시간 선택의 "밖에서 넣는 길" 선언
 */

import { attributeValue } from "./react.mjs";
import { defaultController } from "./react-api.mjs";

export const PICKERS = {};

/* ── 표 ── */
PICKERS["table"] = {
  lists: {
    row: { prop: "rows", fn: "s1Row", ts: "readonly S1TableRowInput[]", doc: "줄 목록 — 글자 배열 [\"가\", \"나\"] 이거나 { cells, attrs?, control? }. 주지 않으면 예제 내용이 그려진다." },
    "header-cell": { prop: "headerCells", ts: "readonly S1TableCellInput[]", doc: "머리 칸 목록 — 글자 또는 { content, attrs }. 주지 않으면 예제 내용이 그려진다." }
  },
  controller(b, c) {
    defaultController(b, c);
    b.kit("s1Row");
  }
};

/* ── 페이지네이션 ── */
PICKERS["pagination"] = {
  extraEvents: ["s1:pagination:change"],
  contentOverride: { pages: "{pageButtons}" },
  attrs: [{ root: true, set: { "data-total-pages": "String(initialTotal)", "data-page": "String(initialPage)" } }],
  controller(b, c) {
    const tree = c.forms[0].tree;
    const defaultTotal = Number(attributeValue(tree, "data-total-pages") ?? 6);
    b.standard();
    b.prop("page", "number", "현재 쪽(제어형) — 1부터");
    b.prop("defaultPage", "number", "처음 현재 쪽(비제어형, 기본 1)");
    b.prop("totalPages", "number", `전체 쪽 수 — 바뀌면 번호 줄을 다시 그린다 (기본 ${defaultTotal})`);
    b.prop("onPageChange", "(page: number, detail: { page: number; totalPages: number }) => void", "쪽이 바뀔 때 — 사용자가 눌러 바뀐 것만 알린다 (page 를 바꿔 정한 것은 되알리지 않는다)");
    b.prop("pages", "readonly S1Entry[]", "번호 칸에 쓸 글자(옛 방식) — 주면 그 개수만큼 번호 칸이 그려진다. 새 코드는 totalPages 를 쓰세요.", { deprecated: true });
    b.eventProps();
    b.hook("useRef");
    b.kit("useApply", "useRerender", "attrsOf");
    b.pre(`const initialTotal = useRef(totalPages ?? (pages ? pages.length : ${defaultTotal})).current;
  const initialPage = useRef(page ?? defaultPage ?? 1).current;
  const syncing = useRef(false);
  const rerender = useRerender();
  const firstPage = Math.floor((initialPage - 1) / 6) * 6 + 1;
  const lastPage = Math.min(initialTotal, firstPage + 5);
  const pageButtons = Array.from({ length: Math.max(0, lastPage - firstPage + 1) }, (_, offset) => {
    const number = firstPage + offset;
    const scope = scopeOf(pages ? pages[number - 1] : undefined);
    return (
      <button type="button" data-s1-part="page" data-page={number} aria-current={number === initialPage ? "page" : undefined} {...attrsOf(scope)} key={number}>
        {slot(scope, "page", true).content ?? String(number)}
      </button>
    );
  });`);
    b.runtime({
      "s1:pagination:change": `(event) => {
      if (syncing.current) return;
      onChange?.(event);
      onPageChange?.(event.detail.page, event.detail);
      rerender();
    }`
    });
    /* 화면이 정한 쪽·총 쪽수는 이벤트 없이 넣는다. 총 쪽수가 줄어 현재 쪽이 밀려났을 때만(화면이 모르는 변화) 알린다. */
    b.post(`useApply(apiRef, (api) => {
    const before = api.page;
    syncing.current = true;
    try {
      if (totalPages !== undefined && api.totalPages !== totalPages) api.setTotalPages(totalPages);
      if (page !== undefined && api.page !== page) api.setPage(page);
    } finally { syncing.current = false; }
    const settled = api.page;
    if (settled !== before && settled !== page) onPageChange?.(settled, { page: settled, totalPages: api.totalPages });
  });`);
  }
};

/* ── 날짜 선택 ── */
PICKERS["date-picker"] = {
  attrs: [
    { root: true, pieces: ["data-name={name}", "data-placeholder={placeholder}", "data-value={initialSingle}", "data-range-start={initialStart}", "data-range-end={initialEnd}"] },
    { part: "trigger", pieces: ["disabled={disabled}"] }
  ],
  controller(b, c) {
    b.standard();
    const detail = "S1Event<{ mode: \"single\"; value: string | null } | { mode: \"range\"; start: string | null; end: string | null }>[\"detail\"]";
    b.prop("value", "S1DateValue", "날짜(제어형) — 한 날짜는 \"2026-10-01\", 기간(variant=\"range\")은 { start, end }");
    b.prop("defaultValue", "S1DateValue", "처음 날짜(비제어형)");
    b.prop("onValueChange", `(value: S1DateValue, detail: ${detail}) => void`, "날짜를 고르면 — 한 날짜는 \"YYYY-MM-DD\" 문자열(없으면 null), 기간은 { start, end }");
    b.prop("name", "string", "폼 이름 — 주면 고른 날짜가 폼 전송에 실린다 (기간은 name-start · name-end)");
    b.prop("placeholder", "string", "고른 날짜가 없을 때 보이는 글자");
    b.prop("disabled", "boolean", "누를 수 없음");
    b.prop("open", "boolean", "달력이 열려 있나(제어형)");
    b.prop("onOpenChange", "(open: boolean) => void", "달력이 열리거나 닫힐 때 — open 을 바꿔 정한 것은 되알리지 않는다");
    const events = b.eventProps();
    b.hook("useRef");
    b.kit("useApply", "useControlledOpen", "useRerender");
    b.pre(`const initialValue = useRef(value !== undefined ? value : defaultValue).current;
  const initialSingle = typeof initialValue === "string" ? initialValue : undefined;
  const initialStart = initialValue && typeof initialValue === "object" ? initialValue.start ?? undefined : undefined;
  const initialEnd = initialValue && typeof initialValue === "object" ? initialValue.end ?? undefined : undefined;
  const chosen = useRef(initialValue);
  const currentValue = value !== undefined ? value : chosen.current;
  const syncing = useRef(false);
  const rerender = useRerender();`);
    b.slotProp("value", "placeholder");
    const handlers = Object.fromEntries(events.map((event) => [event.eventName, b.passthrough(event)]));
    handlers["s1:date-picker:change"] = `(event) => {
      const found = event.detail;
      chosen.current = found?.mode === "range" ? { start: found.start, end: found.end } : (found?.value ?? null);
      onChange?.(event);
      onValueChange?.(chosen.current, found);
      rerender();
    }`;
    handlers["s1:date-picker:open"] = "(event) => { onOpen?.(event); if (!syncing.current) onOpenChange?.(true); }";
    handlers["s1:date-picker:close"] = "(event) => { onClose?.(event); if (!syncing.current) onOpenChange?.(false); }";
    b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
    b.post(`useApply(apiRef, (api) => {
    if (currentValue === undefined) return;
    const wanted = typeof currentValue === "string" || currentValue === null ? currentValue : { start: currentValue.start ?? null, end: currentValue.end ?? null };
    if (JSON.stringify(api.value) !== JSON.stringify(wanted)) api.setValue(wanted);
  });`);
    b.post('useControlledOpen(apiRef, open, syncing, { isOpen: "open", open: "openPanel", close: "closePanel" });');
  }
};

/* ── 시간 선택 ── */
PICKERS["time-picker"] = {
  attrs: [
    { root: true, pieces: ["data-name={name}", "data-placeholder={placeholder}", "data-value={initialValue || undefined}"] },
    { part: "trigger", pieces: ["disabled={disabled}"] }
  ],
  controller(b, c) {
    b.standard();
    b.prop("value", "string", "시간(제어형) — 24시간 \"HH:mm\" (예: \"09:30\", \"14:05\"). 12시간 표시여도 값은 24시간으로 주고받는다");
    b.prop("defaultValue", "string", "처음 시간(비제어형)");
    b.prop("onValueChange", "(value: string, detail: S1Event<{ value: string; hour: string; minute: string; ampm: string | null; type: \"12h\" | \"24h\" }>[\"detail\"]) => void", "시간을 고르면 — 24시간 \"HH:mm\" 문자열");
    b.prop("name", "string", "폼 이름 — 주면 고른 시간(화면에 보이는 글자)이 폼 전송에 실린다");
    b.prop("placeholder", "string", "고른 시간이 없을 때 보이는 글자");
    b.prop("disabled", "boolean", "누를 수 없음");
    b.prop("open", "boolean", "시간 목록(모바일은 시트)이 열려 있나(제어형)");
    b.prop("onOpenChange", "(open: boolean) => void", "열리거나 닫힐 때 — open 을 바꿔 정한 것은 되알리지 않는다");
    const events = b.eventProps();
    b.hook("useRef");
    b.kit("useApply", "useControlledOpen", "useRerender", "clockValue");
    b.pre(`const initialValue = useRef(value !== undefined ? value : defaultValue).current;
  const chosen = useRef(initialValue);
  const currentValue = value !== undefined ? value : chosen.current;
  const syncing = useRef(false);
  const rerender = useRerender();`);
    b.slotProp("value", "placeholder");
    const handlers = Object.fromEntries(events.map((event) => [event.eventName, b.passthrough(event)]));
    handlers["s1:time-picker:change"] = `(event) => {
      chosen.current = clockValue(event.detail);
      onChange?.(event);
      onValueChange?.(chosen.current, event.detail);
      rerender();
    }`;
    handlers["s1:time-picker:open"] = "(event) => { onOpen?.(event); if (!syncing.current) onOpenChange?.(true); }";
    handlers["s1:time-picker:close"] = "(event) => { onClose?.(event); if (!syncing.current) onOpenChange?.(false); }";
    b.runtime(handlers, c.hasBreaks ? ["breakName"] : []);
    b.post(`useApply(apiRef, (api) => {
    if (currentValue === undefined) return;
    const wanted = currentValue === null ? "" : String(currentValue);
    const now = api.value ? clockValue(api.value) : "";
    if (now !== wanted) api.setValue(wanted);
  });`);
    b.post('useControlledOpen(apiRef, open, syncing, { isOpen: "open", open: "openPanel", close: "closePanel" });');
  }
};
