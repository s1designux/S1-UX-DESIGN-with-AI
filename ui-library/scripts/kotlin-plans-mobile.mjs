/**
 * kotlin-plans-mobile.mjs — 모바일 부품 7종의 "무엇을 물어볼지"(검사 트리).
 * --------------------------------------------------------------------------
 * 구분선 · 데이터 태그 · 접힘 카드 · 바텀 시트 · 시트 옵션 · 날짜 선택 · 시간 선택
 * (river 승인 2026-10-02 "코틀린은 모바일버전만 들어가면 돼").
 *
 * 값은 여기 없다. 승인 예제 마크업과 같은 모양의 요소 트리를 세우고 상태마다 CSS 를 질의할 뿐이다.
 * 질의 규칙(요소 만들기·표 추출)은 kotlin-compose.mjs 의 extractSpec 이 소유한다 —
 * 이 파일의 plan 은 {id, axes, combos, key, build} 한 벌이면 어느 플랫폼 생성기든 그대로 읽을 수 있다.
 *
 * 움직임이 있는 부품은 "줄임 모션" 미디어 규칙을 끈다 — 그 규칙이 켜지면 전환 시간이 0 이 되어
 * 정본의 전환 값(.22s 등)을 읽을 수 없다. 접근성 설정에 따른 모션 축소는 앱이 시스템 설정으로 따른다.
 */

import { element } from "./css-model.mjs";

const el = (tag, attributes = {}, states = [], children = []) => element({ tag, attributes, states, children });
const hoverOnly = (isHover) => (condition) => (/^supports:|reduced-motion/.test(condition) ? false : /hover/.test(condition) ? isHover : true);
const motionOk = hoverOnly(false);

const parts = (name) => name.split("-").filter(Boolean);
const camel = (id) => parts(id).map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");
const pascal = (id) => parts(id).map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/** 모바일 한 벌 — 화면 축이 있는 manifest 를 (size, break) 쌍 목록으로 편다. */
function sizeBreaksOf(manifest) {
  const pairs = [];
  for (const [breakName, sizes] of Object.entries(manifest.breaks ?? {})) {
    for (const size of sizes) pairs.push({ size, breakName });
  }
  return pairs;
}

/* ── 구분선 ──────────────────────────────────────────────────────────── */

function dividerPlan(manifest) {
  const axes = manifest.variants;
  const weights = ["default", "strong"];
  const tones = ["default", "strong"];
  const insets = ["none", "text"];
  const combos = [];
  for (const axis of axes) {
    for (const weight of weights) {
      for (const tone of tones) {
        for (const inset of insets) {
          /* 들여쓰기는 가로 전용이다(manifest htmlContract.axes data-inset). 세로선에는 만들지 않는다. */
          if (axis === "y" && inset === "text") continue;
          combos.push({ axis, weight, tone, inset });
        }
      }
    }
  }
  return {
    id: "divider",
    axes: { variants: axes, weights, tones, insets },
    combos,
    key: (combo) => `${combo.axis}|${combo.weight}|${combo.tone}|${combo.inset}`,
    build: (combo) => {
      const attributes = { "data-s1-component": "divider", "data-axis": combo.axis };
      if (combo.weight === "strong") attributes["data-weight"] = "strong";
      if (combo.tone === "strong") attributes["data-tone"] = "strong";
      if (combo.inset === "text") attributes["data-inset"] = "text";
      if (combo.axis === "y") attributes["aria-orientation"] = "vertical";
      const root = el("hr", attributes);
      return { targets: { root: { node: root } }, mediaActive: motionOk };
    }
  };
}

/* ── 데이터 태그 ─────────────────────────────────────────────────────── */

function dataTagPlan(manifest) {
  const tones = manifest.variants;
  const shapes = ["chips", "square"];
  const solids = ["on", "off"];
  const combos = [];
  for (const tone of tones) for (const shape of shapes) for (const solid of solids) combos.push({ tone, shape, solid });
  return {
    id: "data-tag",
    axes: { tones, shapes, solids },
    combos,
    key: (combo) => `${combo.tone}|${combo.shape}|${combo.solid}`,
    build: (combo) => {
      const root = el("span", {
        "data-s1-component": "data-tag", "data-shape": combo.shape, "data-solid": combo.solid, "data-tone": combo.tone
      });
      return { targets: { root: { node: root } }, mediaActive: motionOk };
    }
  };
}

/* ── 접힘 카드 ───────────────────────────────────────────────────────── */

const CARD_TEXTS = ["title", "subtitle", "body", "note", "caption"];

function expandableCardPlan() {
  const states = ["closed", "hover", "open"];
  return {
    id: "expandable-card",
    axes: { states },
    combos: states.map((state) => ({ state })),
    key: (combo) => combo.state,
    build: (combo) => {
      const open = combo.state === "open";
      const headerTexts = CARD_TEXTS.map((part) => el("span", { "data-s1-part": part }));
      const text = el("span", { "data-s1-part": "text" }, [], headerTexts);
      const icon = el("span", { "data-s1-part": "toggle-icon", "aria-hidden": "true" });
      const header = el("button", {
        "data-s1-part": "header", type: "button", "aria-expanded": open ? "true" : "false", "aria-controls": "exp-card-panel"
      }, combo.state === "hover" ? ["hover"] : [], [text, icon]);
      const panelTexts = CARD_TEXTS.map((part) => el("span", { "data-s1-part": part }));
      const panel = el("div", { "data-s1-part": "panel" }, [], panelTexts);
      const wrapAttributes = { "data-s1-part": "panel-wrap", id: "exp-card-panel" };
      if (open) wrapAttributes["data-open"] = "true";
      const wrap = el("div", wrapAttributes, [], [panel]);
      const root = el("div", { "data-s1-component": "expandable-card" }, [], [header, wrap]);
      const targets = {
        root: { node: root }, header: { node: header }, text: { node: text }, toggleIcon: { node: icon },
        panelWrap: { node: wrap }, panel: { node: panel }
      };
      /* 같은 이름의 글자 자리가 머리줄과 펼침칸 두 곳에 있다 — 머리줄 제목만 높이 24 를 받는다. */
      CARD_TEXTS.forEach((part, index) => {
        targets[camel(part)] = { node: headerTexts[index] };
        targets[`panel${pascal(part)}`] = { node: panelTexts[index] };
      });
      return { targets, mediaActive: motionOk };
    }
  };
}

/* ── 바텀 시트 ───────────────────────────────────────────────────────── */

function bottomSheetPlan(manifest, planOptions = {}) {
  const footers = manifest.variants;
  const buttonSize = planOptions.footerButtonSize ?? "lg";
  return {
    id: "bottom-sheet",
    axes: { footers },
    combos: footers.map((footer) => ({ footer })),
    key: (combo) => combo.footer,
    build: (combo) => {
      const title = el("span", { "data-s1-part": "sheet-title" });
      const close = el("button", { "data-s1-part": "sheet-close", type: "button", "aria-label": "닫기" });
      const header = el("div", { "data-s1-part": "sheet-header" }, [], [title, close]);
      const body = el("div", { "data-s1-part": "sheet-body" });
      const content = el("div", { "data-s1-part": "sheet-content" }, [], [header, body]);
      /* 푸터 버튼은 코어 Button 인스턴스다 — 값 질의 대상이 아니라 자리만 트리에 남긴다. */
      const button = (variant) => el("button", {
        "data-s1-component": "button", "data-variant": variant, "data-size": buttonSize, type: "button"
      }, [], [el("span", { "data-s1-part": "label" })]);
      const footerButtons = combo.footer === "dual" ? [button("secondary"), button("primary")] : combo.footer === "single" ? [button("primary")] : [];
      const footer = combo.footer === "none" ? null : el("div", { "data-s1-part": "sheet-footer" }, [], footerButtons);
      const panel = el("div", { "data-s1-part": "sheet-panel", role: "dialog", "aria-modal": "true" }, [], [content, footer].filter(Boolean));
      const backdrop = el("div", { "data-s1-part": "sheet-backdrop" });
      const root = el("div", {
        "data-s1-component": "bottom-sheet", "data-s1-part": "sheet", "data-break": "mobile", "data-footer": combo.footer
      }, [], [backdrop, panel]);
      const targets = {
        root: { node: root }, backdrop: { node: backdrop }, panel: { node: panel }, content: { node: content },
        header: { node: header }, title: { node: title }, close: { node: close }, body: { node: body }
      };
      if (footer) targets.footer = { node: footer };
      return { targets, mediaActive: motionOk };
    }
  };
}

/* ── 시트 옵션 ───────────────────────────────────────────────────────── */

function bottomSheetOptionPlan(manifest) {
  const types = manifest.variants;
  const states = Object.keys(manifest.states);
  /* 정본에 없는 칸은 manifest.absentCombinations 가 "type:state — 이유" 로 적어 둔다 — 여기서 읽어 건너뛴다. */
  const absent = new Set((manifest.absentCombinations ?? [])
    .map((line) => /^([a-z]+):([a-z]+)/.exec(line))
    .filter(Boolean)
    .map((match) => `${match[1]}|${match[2]}`));
  const combos = [];
  for (const type of types) {
    for (const state of states) if (!absent.has(`${type}|${state}`)) combos.push({ type, state });
  }
  return {
    id: "bottom-sheet-option",
    axes: { variants: types, states },
    combos,
    key: (combo) => `${combo.type}|${combo.state}`,
    build: (combo) => {
      const { type, state } = combo;
      const targets = {};
      let children;
      if (type === "text") {
        const label = el("span", { "data-s1-part": "label" });
        targets.label = { node: label };
        children = [label];
        if (state === "selected") {
          const check = el("span", { "data-s1-part": "check", "aria-hidden": "true" });
          targets.check = { node: check };
          children.push(check);
        }
      } else if (type === "checkbox" || type === "radio") {
        const control = el("input", { "data-s1-part": "control", type }, state === "selected" ? ["checked"] : []);
        const core = el("div", { "data-s1-component": type }, [], [control]);
        const label = el("span", { "data-s1-part": "label" });
        targets.label = { node: label };
        children = [core, label];
      } else if (type === "list") {
        const avatar = el("div", { "data-s1-part": "avatar", "aria-hidden": "true" });
        const listTitle = el("span", { "data-s1-part": "list-title" });
        const listSub = el("span", { "data-s1-part": "list-sub" });
        const listText = el("div", { "data-s1-part": "list-text" }, [], [listTitle, listSub]);
        const listLeft = el("div", { "data-s1-part": "list-left" }, [], [avatar, listText]);
        const trailingPart = state === "disabled" ? "lock" : "chevron";
        const trailing = el("span", { "data-s1-part": trailingPart, "aria-hidden": "true" });
        targets.listLeft = { node: listLeft };
        targets.avatar = { node: avatar };
        targets.avatarIcon = { node: avatar, pseudoElement: "after" };
        targets.listText = { node: listText };
        targets.listTitle = { node: listTitle };
        targets.listSub = { node: listSub };
        targets[trailingPart] = { node: trailing };
        children = [listLeft, trailing];
      } else {
        throw new Error(`bottom-sheet-option: 알 수 없는 유형 "${type}" — 뼈대를 먼저 정해야 합니다.`);
      }
      const root = el("div", { "data-s1-component": "bottom-sheet-option", "data-type": type, "data-state": state }, [], children);
      return { targets: { root: { node: root }, ...targets }, mediaActive: motionOk };
    }
  };
}

/* ── 날짜 선택 ───────────────────────────────────────────────────────────
   트리거(상태 5) + 모바일 시트(껍데기·달력·적용). 달력은 런타임이 칸을 채우는 부분이라
   정본 승인 예제에는 비어 있다 — 여기서는 런타임이 만드는 것과 같은 속성으로 칸을 세운다
   (date-picker.js renderCell·renderTileView). */

const DAY_KINDS = [{ kind: "weekday", number: "3" }, { kind: "sunday", number: "0" }, { kind: "saturday", number: "6" }];

/** 날짜 선택 안에 놓인 모바일 시트 — 안쪽 부품을 질의하려면 조상 사슬이 같아야 캐스케이드가 같다. */
function datePickerShell(calendar) {
  const backdrop = el("div", { "data-s1-part": "sheet-backdrop" });
  const title = el("span", { "data-s1-part": "sheet-title" });
  const close = el("button", { "data-s1-part": "sheet-close", type: "button", "aria-label": "닫기" });
  const header = el("div", { "data-s1-part": "sheet-header" }, [], [title, close]);
  const apply = el("button", {
    "data-s1-part": "apply", "data-s1-component": "button", "data-variant": "primary", "data-size": "lg", type: "button"
  }, [], [el("span", { "data-s1-part": "label" })]);
  const footer = el("div", { "data-s1-part": "sheet-footer" }, [], [apply]);
  const calendarWrap = el("div", { "data-s1-part": "calendar-wrap" }, [], [calendar]);
  const panel = el("div", { "data-s1-part": "sheet-panel", role: "dialog", "aria-modal": "true" }, [], [header, calendarWrap, footer]);
  const sheet = el("div", {
    "data-s1-component": "bottom-sheet", "data-s1-part": "sheet", "data-break": "mobile", "data-footer": "single"
  }, [], [backdrop, panel]);
  const trigger = el("button", { "data-s1-part": "trigger", type: "button", "aria-haspopup": "dialog", "aria-expanded": "true" }, [], [
    el("span", { "data-s1-part": "value" }), el("span", { "data-s1-part": "icon" })
  ]);
  const root = el("div", {
    "data-s1-component": "date-picker", "data-size": "md", "data-break": "mobile", "data-mode": "single"
  }, [], [trigger, sheet]);
  return { root, sheet, panel, backdrop, title, close, header, calendarWrap, footer, apply };
}

function datePickerPlan(manifest) {
  const states = ["default", "hover", "filled", "open", "disabled"];
  const combos = [];
  for (const pair of sizeBreaksOf(manifest)) for (const state of states) combos.push({ ...pair, state });
  return {
    id: "date-picker",
    axes: { sizeBreaks: sizeBreaksOf(manifest), states },
    combos,
    key: (combo) => `${combo.size}|${combo.breakName}|${combo.state}`,
    build: (combo) => {
      const attributes = { "data-s1-part": "trigger", type: "button", "aria-haspopup": "dialog", "aria-expanded": combo.state === "open" ? "true" : "false" };
      if (combo.state === "filled") attributes["data-filled"] = "true";
      const value = el("span", { "data-s1-part": "value" });
      const icon = el("span", { "data-s1-part": "icon", "aria-hidden": "true" });
      const trigger = el("button", attributes, combo.state === "hover" ? ["hover"] : combo.state === "disabled" ? ["disabled"] : [], [value, icon]);
      const root = el("div", {
        "data-s1-component": "date-picker", "data-size": combo.size, "data-break": combo.breakName, "data-mode": "single"
      }, [], [trigger]);
      return {
        targets: { root: { node: root }, trigger: { node: trigger }, value: { node: value }, icon: { node: icon } },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

/** 시트 껍데기 — 달력 밖의 것(딤·패널·헤더·제목·닫기·달력 감싸개·푸터·적용). */
function datePickerSheetPlan() {
  return {
    id: "sheet",
    axes: { states: ["default"] },
    combos: [{ state: "default" }],
    key: (combo) => combo.state,
    build: () => {
      const shell = datePickerShell(el("div", { "data-s1-part": "calendar" }));
      return {
        targets: {
          root: { node: shell.sheet }, backdrop: { node: shell.backdrop }, panel: { node: shell.panel },
          header: { node: shell.header }, title: { node: shell.title }, close: { node: shell.close },
          calendarWrap: { node: shell.calendarWrap }, footer: { node: shell.footer }, apply: { node: shell.apply }
        },
        mediaActive: motionOk
      };
    }
  };
}

/** 달력 머리 — 보기(날짜·연·월) × 화살표·라벨 상태. 라벨은 날짜 보기에서만 연·월 둘이고 나머지는 연 하나다. */
function datePickerCalendarPlan() {
  const views = ["date", "year", "month"];
  const navs = ["default", "hover", "disabled"];
  const combos = [];
  for (const view of views) for (const nav of navs) combos.push({ view, nav });
  return {
    id: "calendar",
    axes: { views, navs },
    combos,
    key: (combo) => `${combo.view}|${combo.nav}`,
    build: (combo) => {
      const navStates = combo.nav === "hover" ? ["hover"] : combo.nav === "disabled" ? ["disabled"] : [];
      const mk = (part, tag = "span", attributes = {}, states = [], children = []) => el(tag, { "data-s1-part": part, ...attributes }, states, children);
      const prevIcon = mk("chevron-icon", "span", { "aria-hidden": "true" });
      const nextIcon = mk("chevron-icon", "span", { "aria-hidden": "true" });
      const prev = mk("prev", "button", { type: "button", "aria-label": "이전" }, navStates, [prevIcon]);
      const next = mk("next", "button", { type: "button", "aria-label": "다음" }, navStates, [nextIcon]);
      const labelStates = combo.nav === "hover" ? ["hover"] : [];
      const yearLabel = mk("year-label", "button", { type: "button" }, labelStates);
      const monthLabel = mk("month-label", "button", { type: "button" }, labelStates);
      const headerLabel = mk("header-label", "div", {}, [], combo.view === "date" ? [yearLabel, monthLabel] : [yearLabel]);
      const header = mk("header", "div", {}, [], [prev, headerLabel, next]);
      const calendar = mk("calendar", "div", { "data-view": combo.view }, [], [header]);
      datePickerShell(calendar);
      const targets = {
        calendar: { node: calendar }, header: { node: header }, prev: { node: prev }, next: { node: next },
        prevIcon: { node: prevIcon }, nextIcon: { node: nextIcon }, headerLabel: { node: headerLabel }, yearLabel: { node: yearLabel }
      };
      if (combo.view === "date") targets.monthLabel = { node: monthLabel };
      return { targets, mediaActive: hoverOnly(combo.nav === "hover") };
    }
  };
}

/** 요일줄과 날짜 칸 줄 — 요일 색(평일·일·토)이 유일한 축이다. */
function datePickerWeekdayPlan() {
  return {
    id: "weekday",
    axes: { kinds: DAY_KINDS.map((one) => one.kind) },
    combos: DAY_KINDS,
    key: (combo) => combo.kind,
    build: (combo) => {
      const weekday = el("span", { "data-s1-part": "weekday", "data-weekday": combo.number });
      const weekdays = el("div", { "data-s1-part": "weekdays" }, [], [weekday]);
      const week = el("div", { "data-s1-part": "week", role: "row" });
      const grid = el("div", { "data-s1-part": "grid", role: "grid" }, [], [week]);
      const view = el("div", { "data-s1-part": "view" }, [], [weekdays, grid]);
      const calendar = el("div", { "data-s1-part": "calendar", "data-view": "date" }, [], [view]);
      datePickerShell(calendar);
      return {
        targets: { weekdays: { node: weekdays }, weekday: { node: weekday }, grid: { node: grid }, week: { node: week } },
        mediaActive: motionOk
      };
    }
  };
}

/** 날짜 칸 한 개를 달력 사슬 안에 세운다 — 띠(::before)와 칸이 같은 사슬을 쓴다. */
function dateCellChain(cell) {
  const week = el("div", { "data-s1-part": "week" }, [], [cell]);
  const grid = el("div", { "data-s1-part": "grid" }, [], [week]);
  const view = el("div", { "data-s1-part": "view" }, [], [grid]);
  const calendar = el("div", { "data-s1-part": "calendar", "data-view": "date" }, [], [view]);
  datePickerShell(calendar);
}

/**
 * 날짜 칸 — 요일색 × 옆달 여부 × 상태(date-picker.js renderCell 이 만드는 여섯 가지) × hover(눌리는 세 상태만).
 * 기간 선택에서 시작일은 today, 끝일은 selected 모양을 쓴다(renderCell) — 상태 이름은 그 모양의 이름이다.
 */
function datePickerCellPlan() {
  const states = ["default", "today", "selected", "disabled", "range-mid", "range-disabled"];
  const hoverable = new Set(["default", "today", "selected"]);
  const combos = [];
  for (const { kind, number } of DAY_KINDS) {
    for (const other of ["false", "true"]) {
      for (const state of states) {
        combos.push({ kind, number, other, state, hover: "rest" });
        if (hoverable.has(state)) combos.push({ kind, number, other, state, hover: "hover" });
      }
    }
  }
  return {
    id: "cell",
    axes: { kinds: DAY_KINDS.map((one) => one.kind), others: ["false", "true"], states, hovers: ["rest", "hover"] },
    combos,
    key: (combo) => `${combo.kind}|${combo.other}|${combo.state}|${combo.hover}`,
    build: (combo) => {
      const num = el("span", { "data-s1-part": "cell-num" });
      const inner = el("span", { "data-s1-part": "cell-inner" }, [], [num]);
      const nodeStates = [];
      if (combo.hover === "hover") nodeStates.push("hover");
      if (combo.state === "disabled" || combo.state === "range-disabled") nodeStates.push("disabled");
      const cell = el("button", {
        "data-s1-part": "cell", type: "button", role: "gridcell", "data-state": combo.state,
        "data-weekday": combo.number, "data-other-month": combo.other
      }, nodeStates, [inner]);
      dateCellChain(cell);
      return {
        targets: { cell: { node: cell }, cellInner: { node: inner }, cellNum: { node: num } },
        mediaActive: hoverOnly(combo.hover === "hover")
      };
    }
  };
}

/** 기간 띠 — 칸의 ::before. 시작은 오른쪽 절반, 끝은 왼쪽 절반, 가운데는 칸 전체다. */
function datePickerBandPlan() {
  const bands = ["start", "mid", "end"];
  return {
    id: "band",
    axes: { bands },
    combos: bands.map((band) => ({ band })),
    key: (combo) => combo.band,
    build: (combo) => {
      const cell = el("button", { "data-s1-part": "cell", type: "button", "data-state": "range-mid", "data-range-band": combo.band });
      dateCellChain(cell);
      return { targets: { band: { node: cell, pseudoElement: "before" } }, mediaActive: motionOk };
    }
  };
}

/** 연·월 칸 — 3열 4행 타일. 연 보기와 월 보기가 같은 모양이라 한 벌이다. */
function datePickerTilePlan() {
  const states = ["default", "hover", "selected", "disabled"];
  return {
    id: "tile",
    axes: { states },
    combos: states.map((state) => ({ state })),
    key: (combo) => combo.state,
    build: (combo) => {
      const attributes = { "data-s1-part": "tile", type: "button", "aria-selected": combo.state === "selected" ? "true" : "false" };
      const tile = el("button", attributes, combo.state === "hover" ? ["hover"] : combo.state === "disabled" ? ["disabled"] : []);
      const row = el("div", { "data-s1-part": "tile-row" }, [], [tile]);
      const grid = el("div", { "data-s1-part": "grid", "data-tile-grid": "year" }, [], [row]);
      const view = el("div", { "data-s1-part": "view" }, [], [grid]);
      const calendar = el("div", { "data-s1-part": "calendar", "data-view": "year" }, [], [view]);
      datePickerShell(calendar);
      return {
        targets: { grid: { node: grid }, tileRow: { node: row }, tile: { node: tile } },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

/* ── 시간 선택 ───────────────────────────────────────────────────────────
   모바일 승인 예제는 휠 시트 한 가지다(목록 드롭다운은 PC 형태로 남는다 — manifest notInCanon.mobileBottomSheet). */

function timePickerPlan(manifest) {
  const states = ["default", "hover", "focus", "filled", "disabled"];
  const combos = [];
  for (const pair of sizeBreaksOf(manifest)) for (const state of states) combos.push({ ...pair, state });
  return {
    id: "time-picker",
    axes: { sizeBreaks: sizeBreaksOf(manifest), states },
    combos,
    key: (combo) => `${combo.size}|${combo.breakName}|${combo.state}`,
    build: (combo) => {
      const attributes = { "data-s1-part": "trigger", type: "button", "aria-haspopup": "dialog", "aria-expanded": combo.state === "focus" ? "true" : "false" };
      if (combo.state === "filled") attributes["data-filled"] = "true";
      const value = el("span", { "data-s1-part": "value" });
      const icon = el("span", { "data-s1-part": "icon", "aria-hidden": "true" });
      const trigger = el("button", attributes, combo.state === "hover" ? ["hover"] : combo.state === "disabled" ? ["disabled"] : [], [value, icon]);
      const root = el("div", {
        "data-s1-component": "time-picker", "data-size": combo.size, "data-break": combo.breakName, "data-type": "12h",
        "data-mobile-ui": "wheel", "data-mobile-content": "time-only"
      }, [], [trigger]);
      return {
        targets: { root: { node: root }, trigger: { node: trigger }, value: { node: value }, icon: { node: icon } },
        mediaActive: hoverOnly(combo.state === "hover")
      };
    }
  };
}

/** 휠 시트의 사슬 — 시간 선택 안에 놓인 바텀 시트. 휠·탭·날짜 자리는 호출자가 넣는다. */
function timePickerShell(middle, { content = "time-only", type = "12h" } = {}) {
  const backdrop = el("div", { "data-s1-part": "sheet-backdrop" });
  const title = el("span", { "data-s1-part": "sheet-title" });
  const close = el("button", { "data-s1-part": "sheet-close", type: "button", "aria-label": "닫기" });
  const header = el("div", { "data-s1-part": "sheet-header" }, [], [title, close]);
  const apply = el("button", {
    "data-s1-part": "apply", "data-s1-component": "button", "data-variant": "primary", "data-size": "lg", type: "button"
  }, [], [el("span", { "data-s1-part": "label" })]);
  const footer = el("div", { "data-s1-part": "sheet-footer" }, [], [apply]);
  const panel = el("div", { "data-s1-part": "sheet-panel", role: "dialog", "aria-modal": "true" }, [], [header, ...middle, footer]);
  const sheet = el("div", {
    "data-s1-component": "bottom-sheet", "data-s1-part": "sheet", "data-break": "mobile", "data-footer": "single"
  }, [], [backdrop, panel]);
  const trigger = el("button", { "data-s1-part": "trigger", type: "button", "aria-haspopup": "dialog", "aria-expanded": "true" }, [], [
    el("span", { "data-s1-part": "value" }), el("span", { "data-s1-part": "icon" })
  ]);
  const root = el("div", {
    "data-s1-component": "time-picker", "data-size": "md", "data-break": "mobile", "data-type": type,
    "data-mobile-ui": "wheel", "data-mobile-content": content
  }, [], [trigger, sheet]);
  return { root, sheet, panel, backdrop, title, close, header, footer, apply };
}

/** 시트 껍데기 — 날짜·시간 탭이 있는 형태(date-time)와 없는 형태(time-only). */
function timePickerSheetPlan() {
  const contents = ["time-only", "date-time"];
  return {
    id: "sheet",
    axes: { contents },
    combos: contents.map((content) => ({ content })),
    key: (combo) => combo.content,
    build: (combo) => {
      const middle = [];
      const targets = {};
      if (combo.content === "date-time") {
        const tabs = el("div", { "data-s1-part": "tabs", "data-s1-component": "tab", "data-size": "sm", "data-break": "mobile", role: "tablist" });
        const note = el("p", { "data-s1-part": "date-panel-note" });
        const datePanel = el("div", { "data-s1-part": "date-panel" }, [], [note]);
        middle.push(tabs, datePanel);
        targets.tabs = { node: tabs };
        targets.datePanel = { node: datePanel };
        targets.datePanelNote = { node: note };
      }
      middle.push(el("div", { "data-s1-part": "wheel" }));
      const shell = timePickerShell(middle, { content: combo.content });
      return {
        targets: {
          root: { node: shell.sheet }, backdrop: { node: shell.backdrop }, panel: { node: shell.panel },
          header: { node: shell.header }, title: { node: shell.title }, close: { node: shell.close },
          footer: { node: shell.footer }, apply: { node: shell.apply }, ...targets
        },
        mediaActive: motionOk
      };
    }
  };
}

/** 휠 — 열(오전오후·시·콜론·분)과 칸, 위·아래 흐림. 12시간제만 오전오후 열이 있고 그 옆 열은 4 더 떨어진다. */
function timePickerWheelPlan() {
  const types = ["12h", "24h"];
  return {
    id: "wheel",
    axes: { types },
    combos: types.map((type) => ({ type })),
    key: (combo) => combo.type,
    build: (combo) => {
      const column = (kind) => {
        const cell = el("div", { "data-s1-part": "wheel-cell" });
        const node = el("div", { "data-s1-part": "wheel-col", "data-column": kind }, [], [cell]);
        return { node, cell };
      };
      const ampm = combo.type === "12h" ? column("ampm") : null;
      const hour = column("hour");
      const colon = column("colon");
      const minute = column("minute");
      const fadeTop = el("div", { "data-s1-part": "fade-top", "aria-hidden": "true" });
      const fadeBottom = el("div", { "data-s1-part": "fade-bottom", "aria-hidden": "true" });
      const columns = [ampm, hour, colon, minute].filter(Boolean).map((one) => one.node);
      const wheel = el("div", { "data-s1-part": "wheel" }, [], [...columns, fadeTop, fadeBottom]);
      timePickerShell([wheel], { type: combo.type });
      const targets = {
        wheel: { node: wheel }, colHour: { node: hour.node }, colColon: { node: colon.node }, colMinute: { node: minute.node },
        cell: { node: hour.cell }, colonCell: { node: colon.cell }, fadeTop: { node: fadeTop }, fadeBottom: { node: fadeBottom }
      };
      if (ampm) targets.colAmpm = { node: ampm.node };
      return { targets, mediaActive: motionOk };
    }
  };
}

/** id → plan 만드는 함수. kotlin-compose.mjs 의 PLANS 에 그대로 펼쳐 넣는다. */
export const MOBILE_PLANS = {
  divider: dividerPlan,
  "data-tag": dataTagPlan,
  "expandable-card": expandableCardPlan,
  "bottom-sheet": bottomSheetPlan,
  "bottom-sheet-option": bottomSheetOptionPlan,
  "date-picker": datePickerPlan,
  "time-picker": timePickerPlan
};

/** 주 plan 말고 더 물어볼 것들(같은 CSS 를 다른 자리에서 읽는다). */
export const MOBILE_EXTRA_PLANS = {
  "date-picker": [datePickerSheetPlan, datePickerCalendarPlan, datePickerWeekdayPlan, datePickerCellPlan, datePickerBandPlan, datePickerTilePlan],
  "time-picker": [timePickerSheetPlan, timePickerWheelPlan]
};

/**
 * 같은 묶음 안에서 뒤에 오는 부품의 CSS 를 함께 쓰는 부품 — 시트처럼 다른 부품의 모양을 입는다.
 * 묶음 순서(component-ids.mjs)에서 뒤에 오는 것만 적는다(앞에 오는 것은 캐스케이드에서 먼저 깔린다).
 */
export const MOBILE_EXTRA_CSS = {
  "date-picker": ["bottom-sheet"],
  "time-picker": ["bottom-sheet"]
};

/**
 * 안드로이드가 쓰지 않는 선언을 고르는 선택자 조각 — 크기·화면 조건으로 거를 수 없는 것만 적는다.
 *   · 날짜 선택의 PC 팝오버 패널(panel)
 *   · 시간 선택의 PC 목록 패널(panel·columns·column·divider·cell·footer·confirm) — 모바일 승인 예제는 휠 시트뿐이다
 */
export const MOBILE_PC_ONLY_SELECTORS = {
  "date-picker": [/data-s1-part="panel"\]/],
  "time-picker": [/data-s1-part="(?:panel|columns|column|divider|cell|footer|confirm)"\]/, /data-type="(?:12h|24h)"\] \[data-s1-part="panel"/]
};
