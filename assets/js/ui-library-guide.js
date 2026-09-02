import * as S1UI from "../../ui-library/dist/s1-ui.js";

const componentConfig = {
  input: {
    title: "Input",
    description: "한 줄 정보를 입력받는 기본 컴포넌트입니다. 라벨과 안내 메시지는 필요에 따라 함께 사용합니다.",
    approvedScope: { pc: "Base Input · 상태 7종 · PC 3크기 · Mobile 1크기 · remove 동작", mobile: "Base Input · 상태 7종 · remove 동작" },
    runtime: S1UI.input
  },
  button: {
    title: "Button",
    description: "사용자가 저장·확인·취소처럼 명확한 행동을 실행할 때 사용하는 컴포넌트입니다.",
    approvedScope: { pc: "Primary · Secondary · Blue Line · PC 3크기 · Mobile 1크기", mobile: "Primary · Secondary · Blue Line · 상태 4종" },
    runtime: S1UI.button
  },
  checkbox: {
    title: "Checkbox",
    description: "여러 항목을 각각 켜고 끌 때 사용합니다. 라벨은 선택 사항이며, 붙이면 라벨을 눌러도 선택됩니다.",
    approvedScope: "상태 5종 · 라벨 유무 · 크기 축 없음(18px 고정) · JavaScript 불필요",
    runtime: S1UI.checkbox
  },
  toggle: {
    title: "Toggle",
    description: "설정 하나를 즉시 켜고 끌 때 사용합니다. 누르는 순간 바로 반영되며 별도 확인 단계가 없습니다.",
    approvedScope: "켜짐·꺼짐 × 기본·비활성 4가지 · 크기 축 없음(40×20 고정) · 라벨은 화면낭독기용 이름으로",
    runtime: S1UI.toggle
  },
  chip: {
    title: "Chip",
    description: "태그나 조건을 눌러서 고르는 컴포넌트입니다. Line은 외곽선, Solid는 채운 배경 형태입니다.",
    approvedScope: { pc: "Line · Solid × 상태 4종 · PC 2크기(SM 28 · MD 34) · Mobile 1크기(SM 30) · 라벨 전용", mobile: "Line · Solid × 상태 4종 · 라벨 전용" },
    runtime: S1UI.chip
  },
  select: {
    title: "Select Box",
    description: "정해진 보기 중 하나를 고를 때 씁니다. 트리거를 누르면 목록(Dropdown)이 열리고, 고르면 닫히면서 값이 남습니다.",
    approvedScope: { pc: "상태 5종 · PC 3크기(XXSM 28 · XSM 34 · MD 44) · Mobile 1크기(MD 48) · 목록은 Dropdown 배포본을 조립", mobile: "상태 5종 · 목록은 Dropdown 배포본을 조립" },
    runtime: S1UI.select
  },
  dropdown: {
    title: "Dropdown",
    description: "Select·Filter Chip이 열었을 때 나오는 목록입니다. 글자 유형과 체크박스 유형이 있고, 체크박스 유형은 승인된 Checkbox 배포본을 그대로 조립합니다.",
    approvedScope: "유형 3가지(글자 · 체크박스 · 체크박스+전체 선택) · 3크기(XXSM 28 · XSM 34 · MD 44) · 옵션 행 상태 3종 · 패널 자체는 상태 축 없음",
    runtime: S1UI.dropdown
  },
  "filter-chip": {
    title: "Filter Chip",
    description: "목록에서 조건을 골라 거는 칩입니다. 눌러서 열고(Selected), 값을 고르면 닫히면서 칩에 값이 남습니다(Complete).",
    approvedScope: { pc: "Line · Solid × 제목 있음/없음 × 상태 5종 · PC 2크기(SM 28 · MD 34) · Mobile 1크기(MD 30) · 목록 크기 SM·MD 모두 XSM(34px)", mobile: "Line · Solid × 제목 있음/없음 × 상태 5종 · 목록은 Dropdown 배포본을 조립" },
    runtime: S1UI.filterChip
  },
  tab: {
    title: "Line Tab",
    description: "같은 화면 안에서 콘텐츠를 바꿔 볼 때 사용합니다. 선택된 탭은 파란 글자와 하단 선으로 표시됩니다.",
    approvedScope: { pc: "기본 · Hover · 선택 · PC 3크기(MD 44 · SM 42 · XSM 40) · 화살표 키 이동", mobile: "기본 · Hover · 선택 · 화살표 키 이동" },
    runtime: S1UI.tab
  },
  pagination: {
    title: "Pagination",
    description: "긴 목록을 페이지 단위로 나눠 이동할 때 사용합니다. 현재 페이지와 양 끝 이동 가능 여부를 바로 보여줍니다.",
    approvedScope: "화살표 4종 · 페이지 번호 · 28px 컨트롤 · 첫·마지막에서 이동 버튼 비활성",
    runtime: S1UI.pagination
  },
  radio: {
    title: "Radio",
    description: "여러 보기 중 하나만 고를 때 사용합니다. 같은 그룹으로 묶으면 하나만 선택되고 화살표 키로 이동합니다.",
    approvedScope: "상태 5종 · 라벨 유무 · 크기 축 없음(18px 고정) · JavaScript 불필요",
    runtime: S1UI.radio
  },
  textarea: {
    title: "Textarea",
    description: "여러 줄 내용을 입력받을 때 사용합니다. 라벨과 안내 문구는 정본에 없어 화면에서 따로 연결합니다.",
    approvedScope: "상태 5종(Default · Focus · Filled · Disabled · Read-only) · 크기 축 없음 · 세로 방향으로만 크기 조절 · JavaScript 불필요",
    runtime: S1UI.textarea
  },
  "multi-toggle": {
    title: "Multi Toggle",
    description: "붙어 있는 칸 중 하나를 골라 화면 내용을 바꿀 때 사용합니다. 한 번에 하나만 선택됩니다.",
    approvedScope: "상태 4종 · 두 크기(MD 44 · SM 34) · 3칸 구성 · 화살표 키 이동 · PC 전용",
    runtime: S1UI.multiToggle
  }
,
  table: {
    title: "Table",
    description: "행과 열로 정리된 데이터를 보여줍니다. 행을 고를 수 있고, 표 아래 페이지 이동과 '몇 개씩 보기'는 승인된 배포본을 조립해 씁니다.",
    approvedScope: "상태 3종(기본 · Hover · 선택) · 3크기(MD 44 · SM 38 · XSM 34) · 선택 컬럼은 Checkbox 배포본 재사용 · 열 정렬 2종(왼쪽·가운데) · 행 정렬(sort) 기능 없음 · PC 전용",
    runtime: S1UI.table
  },
  modal: {
    title: "Modal",
    description: "흐름을 멈추고 결정을 받을 때 쓰는 팝업입니다. 어두운 배경 위에 제목·본문·버튼 세 층으로 뜹니다.",
    approvedScope: {
      pc: "버튼 1개(Single) · 2개(Dual) · 패널 360 · 제목 옆 닫기 있음 · Esc 닫기 · 초점 가둠",
      mobile: "버튼 1개(Single) · 2개(Dual) · 패널 300 · 닫기 없음 · Esc 닫기 · 초점 가둠"
    },
    runtime: S1UI.modal
  },
  "mobile-bottom-nav": {
    title: "Bottom Nav",
    description: "모바일 화면 최하단에 고정하는 내비게이션의 탭 아이템입니다. 배포 부품은 아이템 1칸뿐이며, 4탭 바는 화면이 조립합니다.",
    approvedScope: "탭 아이템 1칸(60×60) · 상태 2종(unselected·selected) · 크기 축 없음 · JavaScript 불필요",
    runtime: S1UI.mobileBottomNav
  },
  "mobile-header": {
    title: "Mobile Header",
    description: "모바일 화면 상단 AppBar입니다. 상태바(StatusBar)는 OS·브라우저가 그리는 영역이라 배포본에 넣지 않습니다.",
    approvedScope: "Type 6종(Home 2 · Standard 4) · AppBar 56px 고정 · 크기 축 없음 · JavaScript 불필요",
    runtime: S1UI.mobileHeader
  }
};

let controlId = 0;

let inputId = 0;

const urls = (id) => ({
  manifest: new URL(`../../ui-library/dist/components/${id}.manifest.json`, import.meta.url),
  registry: new URL(`../../registry/components/${id}.json`, import.meta.url),
  html: new URL(`../../ui-library/dist/examples/${id}.html`, import.meta.url),
  htmlMobile: new URL(`../../ui-library/dist/examples/${id}.mobile.html`, import.meta.url),
  css: new URL(`../../ui-library/dist/components/${id}.css`, import.meta.url),
  js: new URL(`../../ui-library/dist/components/${id}.js`, import.meta.url)
});

/* 지금 보고 있는 화면의 플랫폼. 메뉴가 ?platform=pc|mobile 로 페이지를 갈라 열고
   pages/components.html 이 <html> 에 view-pc|view-mobile 을 건다(기본 pc). */
function currentPlatform() {
  if (document.documentElement.classList.contains("view-mobile")) return "mobile";
  return new URLSearchParams(location.search).get("platform") === "mobile" ? "mobile" : "pc";
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url.pathname}`);
  return response.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

/* ── Markup generators ── */

function inputMarkup({
  label = false,
  value = "",
  placeholder = "내용을 입력하세요",
  state = "default",
  size = "md",
  breakName = "pc",
  message = true,
  isPreview = false,
  forceState = ""
}) {
  inputId += 1;
  const id = `guide-input-${inputId}`;
  const messageId = `${id}-message`;
  const error = state === "error";
  const correct = state === "correct";
  const rootState = correct ? ' data-state="correct"' : "";
  const controlState = [
    error ? ' aria-invalid="true"' : "",
    state === "readonly" ? " readonly" : "",
    state === "disabled" ? " disabled" : ""
  ].join("");
  const messageText = error
    ? "입력 내용을 다시 확인해 주세요."
    : correct
      ? "사용할 수 있는 내용입니다."
      : "안내 메시지";
  const previewClass = isPreview ? " is-preview" : "";
  const force = forceState ? ` data-force-state="${forceState}"` : "";
  const labelHtml = label ? `<label data-s1-part="label" for="${id}">${escapeHtml(label)}</label>` : "";

  return `
    <div data-s1-component="input" data-size="${size}" data-break="${breakName}"${rootState}${force} class="${previewClass}">
      ${labelHtml}
      <div data-s1-part="field">
        <input id="${id}" data-s1-part="control"${message ? ` aria-describedby="${messageId}"` : ""} placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}"${controlState}>
        <button type="button" data-s1-part="action" data-action="clear" aria-label="입력 내용 지우기" hidden>
          <span data-s1-part="action-icon" aria-hidden="true"></span>
        </button>
      </div>
      ${message ? `<p id="${messageId}" data-s1-part="message">${messageText}</p>` : ""}
    </div>`;
}

function buttonMarkup(variant, size, label = "버튼", disabled = false, forceState = "") {
  const preview = forceState ? " is-preview" : "";
  const force = forceState ? ` data-force-state="${forceState}"` : "";
  return `<button type="button" data-s1-component="button" data-variant="${variant}" data-size="${size}"${disabled ? " disabled" : ""}${force} class="${preview}"><span data-s1-part="label">${escapeHtml(label)}</span></button>`;
}

/* ── State matrix: Button ── */

function buttonStateMatrix() {
  const variants = [
    ["primary", "Primary"],
    ["secondary", "Secondary"],
    ["blue-line", "Blue Line"]
  ];
  const pcSizes = [
    ["xxsm", "XXSM", "56×28"],
    ["xsm", "XSM", "64×34"],
    ["md", "MD", "80×44"]
  ];
  const states = ["default", "hover", "pressed", "disabled"];
  const stateLabels = ["Default", "Hover", "Pressed", "Disabled"];

  function unifiedAction(sizes) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel || ""}${dim ? `<span class="uilg-size-dim">${dim}</span>` : ""}</div>`).join("");
    const activeRows = variants.map(([variant, vLabel]) => {
      const rowLabel = `<div class="matrix-row-label">${vLabel}</div>`;
      const cells = sizes.map(([size]) =>
        `<div class="comp-state-cell">${buttonMarkup(variant, size, "버튼")}</div>`
      ).join("");
      return rowLabel + cells;
    }).join("");
    const disabledRow = `<div class="matrix-row-label">Disabled${sizes.length > 1 ? '<span class="uilg-size-dim">공통</span>' : ""}</div>` +
      sizes.map(([size]) =>
        `<div class="comp-state-cell">${buttonMarkup("primary", size, "비활성", true)}</div>`
      ).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="comp-state-matrix" style="grid-template-columns: 100px repeat(${sizes.length}, minmax(80px, 1fr));">${header}${activeRows}${disabledRow}</div>
    </div>`;
  }

  function variantGrid(sizes, variant) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel]) => `<div class="matrix-col-header">${sLabel}</div>`).join("");
    const rows = states.map((state, si) => {
      const rowLabel = `<div class="matrix-row-label">${stateLabels[si]}</div>`;
      const cells = sizes.map(([size]) => {
        if (state === "disabled") {
          return `<div class="comp-state-cell">${buttonMarkup(variant, size, "버튼", true)}</div>`;
        }
        return `<div class="comp-state-cell">${buttonMarkup(variant, size, "버튼", false, state)}</div>`;
      }).join("");
      return rowLabel + cells;
    }).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns: 100px repeat(${sizes.length}, minmax(80px, 1fr));">${header}${rows}</div>`;
  }

  const pcVariantBlocks = variants.map(([variant, vLabel]) => `
    <div class="uilg-variant-block">
      <div class="variant-label">${vLabel}</div>
      ${variantGrid(pcSizes, variant)}
    </div>`).join('<hr class="uilg-separator">');

  const pcContent = `${unifiedAction(pcSizes)}
    ${pcVariantBlocks}`;

  /* Mobile 은 크기 축이 하나뿐이라 크기 라벨(LG)을 표출하지 않는다.
     한 표에서 유형(행) × 상태(열)를 한꺼번에 본다. */
  const mobileSizes = [["lg", ""]];
  const mobileStateMatrix = `<div class="comp-state-matrix" style="grid-template-columns: 100px repeat(${states.length}, minmax(80px, 1fr));">
      ${`<div class="matrix-col-header" style="grid-column:1"></div>` +
        stateLabels.map((label) => `<div class="matrix-col-header">${label}</div>`).join("")}
      ${variants.map(([variant, vLabel]) =>
        `<div class="matrix-row-label">${vLabel}</div>` +
        states.map((state) => `<div class="comp-state-cell">${state === "disabled"
          ? buttonMarkup(variant, "lg", "버튼", true)
          : buttonMarkup(variant, "lg", "버튼", false, state)}</div>`).join("")
      ).join("")}
    </div>`;

  const mobileContent = `${unifiedAction(mobileSizes)}
    ${mobileStateMatrix}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${pcContent}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">${mobileContent}</div>
    </div>`;
}

/* ── State matrix: Checkbox · Radio ── */

function controlMarkup(kind, { label = "", checked = false, disabled = false, name = "", forceState = "", isPreview = false } = {}) {
  controlId += 1;
  const id = `guide-${kind}-${controlId}`;
  const attrs = [
    `type="${kind}"`,
    `id="${id}"`,
    name ? `name="${name}"` : "",
    'data-s1-part="control"',
    checked ? "checked" : "",
    disabled ? "disabled" : "",
    label ? "" : `aria-label="${kind === "checkbox" ? "라벨 없는 선택 항목" : "라벨 없는 옵션"}"`
  ].filter(Boolean).join(" ");
  const force = forceState ? ` data-force-state="${forceState}"` : "";
  const previewClass = isPreview ? ' class="is-preview"' : "";
  const labelHtml = label ? `<label data-s1-part="label" for="${id}">${escapeHtml(label)}</label>` : "";
  return `<div data-s1-component="${kind}"${force}${previewClass}>
      <input ${attrs}>
      ${labelHtml}
    </div>`;
}

function controlStateMatrix(kind) {
  const onWord = kind === "checkbox" ? "Checked" : "Selected";
  const states = [
    { label: "Default", opts: {} },
    { label: "Hover", opts: { forceState: "hover" } },
    { label: onWord, opts: { checked: true } },
    { label: "Disabled", opts: { disabled: true } },
    { label: `Dis+${onWord}`, opts: { checked: true, disabled: true } }
  ];
  const sampleLabel = kind === "checkbox" ? "선택 항목" : "옵션";

  /* ── 1) Action: 실제로 눌러보는 예시 — 여러 개를 함께 쓸 때 ── */
  function actionSection(platform) {
    const groupName = `guide-${kind}-${platform}-action`;
    const items = kind === "checkbox"
      ? ["이메일", "문자", "앱 푸시"]
      : ["받음", "받지 않음", "나중에 정하기"];
    const legend = kind === "checkbox" ? "받을 알림" : "알림 받기";
    const note = kind === "checkbox"
      ? "항목마다 따로 켜고 끕니다. 라벨을 눌러도 선택됩니다."
      : "같은 그룹에서 하나만 선택되고, 그룹 안에서는 화살표 키로 이동합니다.";
    const rows = items.map((text, index) => controlMarkup(kind, {
      label: text,
      name: kind === "radio" ? groupName : "",
      checked: index === 0
    })).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-control-action">
        <fieldset class="uilg-control-group">
          <legend class="matrix-row-label">${legend}</legend>
          ${rows}
        </fieldset>
        <p class="uilg-demo-note">${note}</p>
      </div>
    </div>`;
  }

  /* ── 2) 상태: 라벨 없음 1행 + 라벨 있음 1행 ── */
  function stateSection(platform) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      states.map((state) => `<div class="matrix-col-header">${state.label}</div>`).join("");
    const row = (labelled) => `<div class="matrix-row-label">${labelled ? "라벨 있음" : "라벨 없음"}<span>${labelled ? "선택 부품" : "기본형"}</span></div>` +
      states.map((state, index) => `<div class="comp-state-cell">${controlMarkup(kind, {
        ...state.opts,
        isPreview: true,
        label: labelled ? sampleLabel : "",
        name: kind === "radio" ? `guide-${kind}-${platform}-${labelled ? "on" : "off"}-${index}` : ""
      })}</div>`).join("");
    return `<div class="uilg-demo-group">
      <div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${states.length}, minmax(104px, 1fr));">
        ${header}${row(false)}${row(true)}
      </div>
    </div>`;
  }

  /* PC·Mobile 은 각각 새로 생성한다 — 같은 문자열을 두 번 붙이면 id 와 radio name 이
     페이지 안에서 충돌해 PC 쪽 선택 상태가 풀린다. */
  /* .comp-action-top 이 이미 아래 구분선을 그리므로 별도 hr 을 두지 않는다(줄 2개로 보임). */
  const content = (platform) => `${actionSection(platform)}
    ${stateSection(platform)}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content("pc")}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content("mobile")}
      </div>
    </div>`;
}

/* ── State matrix: Toggle ── */

let toggleId = 0;

function toggleMarkup({ on = false, disabled = false, label = "알림 받기", isPreview = false } = {}) {
  toggleId += 1;
  const preview = isPreview ? ' class="is-preview"' : "";
  return `<button type="button" data-s1-component="toggle" role="switch" aria-checked="${on}" aria-label="${escapeHtml(label)}"${disabled ? " disabled" : ""}${preview} id="guide-toggle-${toggleId}">
      <span data-s1-part="knob" aria-hidden="true"></span>
    </button>`;
}

function toggleStateMatrix() {
  /* 열 = 정본 상태(Default·Disabled) · 행 = 정본 Pressed 축(Off·On) */
  const states = [
    { label: "Default", disabled: false },
    { label: "Disabled", disabled: true }
  ];
  const rows = [
    { label: "Off", note: "꺼짐", on: false },
    { label: "On", note: "켜짐", on: true }
  ];

  function actionSection() {
    const items = [
      ["앱 푸시 알림", true],
      ["야간 방해 금지", false]
    ];
    const rowsHtml = items.map(([text, on]) => `<div class="uilg-toggle-row">
        ${toggleMarkup({ on, label: text })}
        <span class="uilg-toggle-row-label">${escapeHtml(text)}</span>
      </div>`).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-control-action">
        <div class="uilg-control-group" role="group" aria-label="알림 설정">
          <span class="matrix-row-label">알림 설정</span>
          ${rowsHtml}
        </div>
        <p class="uilg-demo-note">누르는 즉시 반영됩니다. 옆의 글자는 화면 설명용이며 토글의 접근 이름은 aria-label로 붙입니다.</p>
      </div>
    </div>`;
  }

  function stateSection() {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      states.map((state) => `<div class="matrix-col-header">${state.label}</div>`).join("");
    const body = rows.map((row) => `<div class="matrix-row-label">${row.label}<span>${row.note}</span></div>` +
      states.map((state) => `<div class="comp-state-cell">${toggleMarkup({
        on: row.on,
        disabled: state.disabled,
        isPreview: true,
        label: `${row.label} · ${state.label}`
      })}</div>`).join("")).join("");
    return `<div class="uilg-demo-group">
      <div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${states.length}, 140px);">
        ${header}${body}
      </div>
    </div>`;
  }

  const content = () => `${actionSection()}
    ${stateSection()}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content()}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content()}
      </div>
    </div>`;
}

/* ── State matrix: Chip ── */

function chipMarkup({ variant = "line", size = "md", breakName = "pc", label = "라벨", selected = false, disabled = false, forceState = "", isPreview = false } = {}) {
  const force = forceState ? ` data-force-state="${forceState}"` : "";
  const preview = isPreview ? ' class="is-preview"' : "";
  return `<button type="button" data-s1-component="chip" data-variant="${variant}" data-size="${size}" data-break="${breakName}" aria-pressed="${selected}"${disabled ? " disabled" : ""}${force}${preview}><span data-s1-part="label">${escapeHtml(label)}</span></button>`;
}

function chipStateMatrix() {
  const variants = [["line", "Line"], ["solid", "Solid"]];
  const states = [
    { label: "Default", opts: {} },
    { label: "Hover", opts: { forceState: "hover" } },
    { label: "Selected", opts: { selected: true } },
    { label: "Disabled", opts: { disabled: true } }
  ];

  /* Action — 실제로 눌러서 고르는 자리. 버튼 Action 과 같은 틀: 열=크기, 행=variant.
     크기는 여기에만 표출한다(별도 SIZES 블록 금지). */
  function actionSection(breakName) {
    /* Mobile 은 크기 축이 하나뿐이라 크기 라벨(SM)을 표출하지 않는다. */
    const sizes = breakName === "mobile" ? [["sm", ""]] : [["sm", "SM", "28px"], ["md", "MD", "34px"]];
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel || ""}${dim ? `<span class="uilg-size-dim">${dim}</span>` : ""}</div>`).join("");
    const activeRows = variants.map(([variant, vLabel]) => {
      const rowLabel = `<div class="matrix-row-label">${vLabel}</div>`;
      const cells = sizes.map(([size]) =>
        `<div class="comp-state-cell">${chipMarkup({ variant, size, breakName, label: "라벨" })}</div>`
      ).join("");
      return rowLabel + cells;
    }).join("");
    const disabledRow = `<div class="matrix-row-label">Disabled${sizes.length > 1 ? '<span class="uilg-size-dim">공통</span>' : ""}</div>` +
      sizes.map(([size]) =>
        `<div class="comp-state-cell">${chipMarkup({ variant: "line", size, breakName, label: "라벨", disabled: true })}</div>`
      ).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="comp-state-matrix" style="grid-template-columns: 100px repeat(${sizes.length}, minmax(80px, 1fr));">${header}${activeRows}${disabledRow}</div>
      <p class="uilg-demo-note">눌러서 선택하고 다시 눌러 해제합니다. 선택 상태는 aria-pressed로 전달됩니다.</p>
    </div>`;
  }

  function variantGrid(variant, breakName, size) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      states.map((state) => `<div class="matrix-col-header">${state.label}</div>`).join("");
    const row = `<div class="matrix-row-label">${size.toUpperCase()}<span>${breakName === "mobile" ? "30px" : size === "sm" ? "28px" : "34px"}</span></div>` +
      states.map((state) => `<div class="comp-state-cell">${chipMarkup({
        variant, size, breakName, isPreview: true, ...state.opts
      })}</div>`).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${states.length}, minmax(96px, 1fr));">${header}${row}</div>`;
  }

  /* Mobile — 크기 축이 하나뿐이라 왼쪽 라벨은 크기(SM) 대신 유형(Line·Solid)을 쓰고,
     Line·Solid 를 한 표에서 함께 본다(사이 가로선 없음). */
  function mobileGrid() {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      states.map((state) => `<div class="matrix-col-header">${state.label}</div>`).join("");
    const rows = variants.map(([variant, vLabel]) =>
      `<div class="matrix-row-label">${vLabel}</div>` +
      states.map((state) => `<div class="comp-state-cell">${chipMarkup({
        variant, size: "sm", breakName: "mobile", isPreview: true, ...state.opts
      })}</div>`).join("")).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${states.length}, minmax(96px, 1fr));">${header}${rows}</div>`;
  }

  function content(breakName) {
    if (breakName === "mobile") {
      return `${actionSection(breakName)}
      ${mobileGrid()}`;
    }
    const blocks = variants.map(([variant, label]) => `
      <div class="uilg-variant-block">
        <div class="variant-label">${label}</div>
        ${variantGrid(variant, breakName, "md")}
      </div>`).join('<hr class="uilg-separator">');
    return `${actionSection(breakName)}
      ${blocks}`;
  }

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content("pc")}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content("mobile")}
      </div>
    </div>`;
}

/* ── State matrix: Input ── */

function inputStateMatrix() {
  const states = [
    { label: "Default", opts: {} },
    { label: "Filled", opts: { value: "홍길동" } },
    { label: "Editing", opts: { value: "홍길", forceState: "editing" } },
    { label: "Error", opts: { state: "error", value: "ㅎ" } },
    { label: "Correct", opts: { state: "correct", value: "홍길동" } },
    { label: "Read-only", opts: { state: "readonly", value: "변경할 수 없는 값" } },
    { label: "Disabled", opts: { state: "disabled", value: "사용할 수 없음" } }
  ];

  /* ── 1) Action: XSM 대표 인터랙션 ── */
  function actionSection(breakName) {
    const size = breakName === "mobile" ? "md" : "xsm";
    const toggleId = `input-msg-toggle-${breakName}`;
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-input-action">
        ${inputMarkup({ size, breakName, isPreview: false, message: false })}
      </div>
      <div class="uilg-option-chips">
        <label class="uilg-option-chip" for="${toggleId}">
          <input id="${toggleId}" type="checkbox" data-input-msg-toggle="${breakName}" hidden>
          <span class="uilg-option-chip-text">Message: <strong>off</strong></span>
        </label>
      </div>
      ${breakName === "mobile" ? `<p class="uilg-demo-note">필드 높이와 remove 누르는 영역은 48px을 유지합니다.</p>` : ""}
    </div>`;
  }

  /* ── 2) PC 크기 비교: XXSM · XSM · MD ── */
  function sizeSection() {
    const sizes = [
      ["xxsm", "XXSM", "28px"],
      ["xsm", "XSM", "34px"],
      ["md", "MD", "44px"]
    ];
    const header = sizes.map(([, sLabel, dim]) =>
      `<div class="matrix-col-header">${sLabel}<span class="uilg-size-dim">${dim}</span></div>`
    ).join("");
    const cells = sizes.map(([size]) =>
      `<div class="comp-state-cell">${inputMarkup({ breakName: "pc", size, isPreview: true, message: false })}</div>`
    ).join("");
    return `<div class="uilg-demo-group">
      <div class="comp-state-matrix uilg-input-constrained" style="grid-template-columns: repeat(3, 200px);">
        ${header}${cells}
      </div>
    </div>`;
  }

  /* ── 3) 상태: 메시지 없음 1행 + 메시지 있음 1행 ── */
  function stateSection(breakName) {
    const size = breakName === "mobile" ? "md" : "xsm";
    const cols = states.length;
    const header = states.map((s) => `<div class="matrix-col-header">${s.label}</div>`).join("");

    const noMsgCells = states.map((s) =>
        `<div class="comp-state-cell">${inputMarkup({ breakName, size, isPreview: true, message: false, ...s.opts })}</div>`
      ).join("");

    const withMsgCells = states.map((s) =>
        `<div class="comp-state-cell">${inputMarkup({ breakName, size, isPreview: true, message: true, ...s.opts })}</div>`
      ).join("");

    return `<div class="uilg-demo-group">
      <div class="comp-state-matrix uilg-input-constrained" style="grid-template-columns: repeat(${cols}, 180px);">
        ${header}
        ${noMsgCells}
        ${withMsgCells}
      </div>
    </div>`;
  }

  const pcContent = `
    ${actionSection("pc")}
    ${sizeSection()}
    <hr class="uilg-separator" style="margin-block: 12px 16px;">
    ${stateSection("pc")}`;

  const mobileContent = `
    ${actionSection("mobile")}
    ${stateSection("mobile")}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${pcContent}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${mobileContent}
      </div>
    </div>`;
}


/* ── State matrix: Select · Dropdown · Filter Chip ──
   세 모듈은 사슬로 조립된다 — filter-chip / select → dropdown → checkbox.
   미리보기 칸(.is-preview)은 런타임을 붙이지 않으므로 panel 의 hidden 을 마크업이 직접 들고 있고,
   Open/Selected 칸만 hidden 을 떼어 실제 목록이 보이게 한다. */

function dropdownOptionMarkup(type, { label, selected = false, forceState = "", selectAll = false, value = "" }) {
  const force = forceState ? ` data-force-state="${forceState}"` : "";
  // 「전체 선택」 행은 배포본이 data-select-all 로 식별한다(dropdown.example.html 계약과 동일).
  const all = selectAll ? ' data-select-all="true"' : "";
  const val = value ? ` data-value="${escapeHtml(value)}"` : "";
  if (type === "text") {
    return `<div data-s1-part="option" role="option" aria-selected="${selected}" tabindex="-1"${force}${val}><span data-s1-part="option-label">${escapeHtml(label)}</span></div>`;
  }
  return `<div data-s1-part="option" role="checkbox" aria-checked="${selected}" tabindex="-1"${force}${all}${val}>
      <div data-s1-component="checkbox" aria-hidden="true"><input type="checkbox" data-s1-part="control" tabindex="-1"${selected ? " checked" : ""}></div>
      <span data-s1-part="option-label">${escapeHtml(label)}</span>
    </div>`;
}

function dropdownMarkup({ type = "text", size = "md", withAll = false, ariaLabel = "목록", rows = null, isPreview = false } = {}) {
  const body = rows
    ? rows.map((row) => dropdownOptionMarkup(type, row)).join("")
    : [
        { label: "서울", selected: true },
        { label: "부산", selected: false },
        { label: "제주", selected: false }
      ].map((row) => dropdownOptionMarkup(type, row)).join("");
  const allRow = withAll
    ? dropdownOptionMarkup(type, { label: "전체 선택", selected: false, selectAll: true, value: "all" }) + '<div data-s1-part="divider"></div>'
    : "";
  const listRole = type === "text" ? ' role="listbox"' : "";
  const preview = isPreview ? " is-preview" : "";
  return `<div data-s1-component="dropdown" data-type="${type}" data-size="${size}"${listRole} aria-label="${escapeHtml(ariaLabel)}" class="${preview}">${allRow}${body}</div>`;
}

function selectMarkup({ size = "md", breakName = "pc", state = "default", isPreview = false, valueText = null, placeholder = "선택", ariaLabel = "지역", rows = null } = {}) {
  const open = state === "open";
  const filled = state === "filled";
  const disabled = state === "disabled";
  const force = state === "hover" ? ' data-force-state="hover"' : "";
  const preview = isPreview ? " is-preview" : "";
  /* 미리보기는 init 하지 않으므로 hidden 을 마크업이 든다. Open 칸만 목록을 편다
     (표출 정책 select.keepInState.open = optionList). */
  const panelHidden = isPreview ? (open ? "" : " hidden") : " hidden";
  return `<div data-s1-component="select" data-size="${size}" data-break="${breakName}" class="${preview}">
      <button type="button" data-s1-part="trigger" aria-haspopup="listbox" aria-expanded="${open}"${filled ? ' data-filled="true"' : ""}${disabled ? " disabled" : ""}${force}>
        <span data-s1-part="value">${valueText ?? (filled ? "서울" : placeholder)}</span>
        <span data-s1-part="icon" aria-hidden="true"></span>
      </button>
      <div data-s1-part="panel"${panelHidden}>${dropdownMarkup({ type: "text", size, ariaLabel, rows, isPreview })}</div>
    </div>`;
}

const filterChipPanelSize = { sm: "xsm", md: "xsm" };

function filterChipMarkup({ variant = "line", size = "md", breakName = "pc", title = "on", state = "default", isPreview = false } = {}) {
  const open = state === "selected";
  const complete = state === "complete";
  const disabled = state === "disabled";
  const force = state === "hover" ? ' data-force-state="hover"' : "";
  const preview = isPreview ? " is-preview" : "";
  const panelHidden = isPreview ? (open ? "" : " hidden") : " hidden";
  return `<div data-s1-component="filter-chip" data-variant="${variant}" data-size="${size}" data-break="${breakName}" data-title="${title}" class="${preview}">
      <button type="button" data-s1-part="trigger" aria-haspopup="listbox" aria-expanded="${open}"${complete ? ' data-complete="true"' : ""}${disabled ? " disabled" : ""}${force}>
        ${title === "on" ? '<span data-s1-part="title">정렬</span>' : ""}
        <span data-s1-part="value">${complete ? "인기순" : "최신순"}</span>
        <span data-s1-part="icon" aria-hidden="true"></span>
      </button>
      <div data-s1-part="panel"${panelHidden}>${dropdownMarkup({ type: "text", size: filterChipPanelSize[size], ariaLabel: "정렬", isPreview, rows: [
        { label: "최신순", selected: true }, { label: "인기순", selected: false }, { label: "과거순", selected: false }
      ] })}</div>
    </div>`;
}

/* 공통 — 열=크기 · 행=상태 그리드 (Button·Chip 과 같은 틀) */
function sizeStateGrid(sizes, states, cell, { tall = false } = {}) {
  /* 열이 하나뿐이면(크기 축이 하나인 Mobile) 1fr 로 늘리지 않는다 — 칸 가운데 정렬 탓에
     실물이 표 오른쪽으로 밀려 Action 영역과 어긋난다. */
  const colWidth = sizes.length === 1 ? "220px" : "minmax(140px, 1fr)";
  const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
    sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel}${dim ? `<span class="uilg-size-dim">${dim}</span>` : ""}</div>`).join("");
  const rows = states.map(([stateLabel, state, note]) => {
    const rowLabel = `<div class="matrix-row-label">${stateLabel}${note ? `<span>${note}</span>` : ""}</div>`;
    return rowLabel + sizes.map(([size]) =>
      `<div class="comp-state-cell${tall && state === states[states.length - 1][1] ? " uilg-open-cell" : ""}">${cell(size, state)}</div>`).join("");
  }).join("");
  return `<div class="comp-state-matrix" style="grid-template-columns: 120px repeat(${sizes.length}, ${colWidth});">${header}${rows}</div>`;
}

function selectStateMatrix() {
  const pcSizes = [["xxsm", "XXSM", "28px"], ["xsm", "XSM", "34px"], ["md", "MD", "44px"]];
  /* Mobile 은 크기 축이 하나뿐이라 크기 라벨(MD)을 표출하지 않는다. */
  const mobileSizes = [["md", ""]];
  /* 열 = 정본 상태 전수(5종). Open 은 목록을 편 채로 보인다(표출 정책 keepInState). */
  const states = [
    ["Default", "default"],
    ["Hover", "hover", "검수 표시"],
    ["Filled", "filled", "값 선택됨"],
    ["Disabled", "disabled"],
    ["Open", "open", "목록 열림"]
  ];

  function actionSection(breakName, sizes) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel || ""}${dim ? `<span class="uilg-size-dim">${dim}</span>` : ""}</div>`).join("");
    const liveRow = `<div class="matrix-row-label">Select</div>` +
      sizes.map(([size]) => `<div class="comp-state-cell">${selectMarkup({ size, breakName })}</div>`).join("");
    const disabledRow = `<div class="matrix-row-label">Disabled${sizes.length > 1 ? '<span class="uilg-size-dim">공통</span>' : ""}</div>` +
      sizes.map(([size]) => `<div class="comp-state-cell">${selectMarkup({ size, breakName, state: "disabled", isPreview: true })}</div>`).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="comp-state-matrix" style="grid-template-columns: 120px repeat(${sizes.length}, minmax(140px, 1fr));">${header}${liveRow}${disabledRow}</div>
      <p class="uilg-demo-note">눌러서 목록을 열고 화살표 키·Enter로 고릅니다. 고르면 닫히고 값이 남습니다. 바깥을 눌러도 닫힙니다.</p>
    </div>`;
  }

  const content = (breakName, sizes) => `${actionSection(breakName, sizes)}
    ${sizeStateGrid(sizes, states, (size, state) => selectMarkup({ size, breakName, state, isPreview: true }), { tall: true })}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content("pc", pcSizes)}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content("mobile", mobileSizes)}
      </div>
    </div>`;
}

function dropdownStateMatrix() {
  const sizes = [["xxsm", "XXSM", "28px"], ["xsm", "XSM", "34px"], ["md", "MD", "44px"]];
  const types = [
    ["text", "글자 유형", { type: "text" }],
    ["checkbox", "체크박스 유형", { type: "checkbox" }],
    ["checkbox-all", "체크박스 + 전체 선택", { type: "checkbox", withAll: true }]
  ];
  /* 열 = 크기 · 행 = 옵션 행 상태(정본 3종). 패널 자체에는 상태 축이 없다. */
  const optionStates = [
    ["Default", "default"],
    ["Hover", "hover", "검수 표시"],
    ["Selected", "selected"]
  ];

  function actionSection() {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel || ""}${dim ? `<span class="uilg-size-dim">${dim}</span>` : ""}</div>`).join("");
    const rows = types.map(([, typeLabel, opts]) => `<div class="matrix-row-label">${typeLabel}</div>` +
      sizes.map(([size]) => `<div class="comp-state-cell">${dropdownMarkup({ ...opts, size, ariaLabel: typeLabel })}</div>`).join("")).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="comp-state-matrix" style="grid-template-columns: 120px repeat(${sizes.length}, minmax(160px, 1fr));">${header}${rows}</div>
      <p class="uilg-demo-note">눌러서 고르고 화살표 키·Home·End로 이동합니다. 체크박스 유형은 여러 개를 함께 고릅니다.</p>
    </div>`;
  }

  const optionCell = (type, size, state) => dropdownMarkup({
    type, size, isPreview: true, ariaLabel: "옵션 상태",
    rows: [{ label: type === "text" ? "서울" : "서울", selected: state === "selected", forceState: state === "hover" ? "hover" : "" }]
  });

  const blocks = [["text", "글자 유형"], ["checkbox", "체크박스 유형"]].map(([type, typeLabel]) => `
    <div class="uilg-variant-block">
      <div class="variant-label">${typeLabel} · 옵션 행 상태</div>
      ${sizeStateGrid(sizes, optionStates, (size, state) => optionCell(type, size, state))}
    </div>`).join('<hr class="uilg-separator">');

  const content = () => `${actionSection()}
    ${blocks}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content()}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content()}
      </div>
    </div>`;
}

function filterChipStateMatrix() {
  const pcSizes = [["sm", "SM", "28px"], ["md", "MD", "34px"]];
  const mobileSizes = [["md", ""]];
  const variants = [["line", "Line"], ["solid", "Solid"]];
  const titles = [["on", "제목 있음"], ["off", "제목 없음"]];
  const states = [
    ["Default", "default"],
    ["Hover", "hover", "검수 표시"],
    ["Complete", "complete", "값 확정"],
    ["Disabled", "disabled"],
    ["Selected", "selected", "열림"]
  ];

  /* Action — Button·Chip Action 과 같은 틀: 열=크기 · 행=유형(+Disabled).
     Filter Chip 은 유형 축이 variant(Line·Solid) × 제목 유무 2겹이라 행을 그 조합으로 편다.
     크기는 여기에만 표출한다(별도 SIZES 블록 금지). 모든 칸이 실제로 눌리는 실물이다. */
  function actionSection(breakName, sizes) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel || ""}${dim ? `<span class="uilg-size-dim">${dim}</span>` : ""}</div>`).join("");
    const activeRows = variants.map(([variant, vLabel]) =>
      titles.map(([title, titleLabel]) =>
        /* 유형 라벨은 한 줄 글자로 둔다 — .comp-state-matrix .matrix-row-label span 은
           페이지 규칙(2026-07-06)에 따라 display:none 이라 span 으로 넣으면 보이지 않는다. */
        `<div class="matrix-row-label">${vLabel} · ${titleLabel}</div>` +
        sizes.map(([size]) => `<div class="comp-state-cell">${filterChipMarkup({ variant, size, breakName, title })}</div>`).join("")
      ).join("")).join("");
    const disabledRow = `<div class="matrix-row-label">Disabled${sizes.length > 1 ? '<span class="uilg-size-dim">공통</span>' : ""}</div>` +
      sizes.map(([size]) => `<div class="comp-state-cell">${filterChipMarkup({ variant: "line", size, breakName, state: "disabled", isPreview: true })}</div>`).join("");
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="comp-state-matrix" style="grid-template-columns: 120px repeat(${sizes.length}, minmax(140px, 1fr));">${header}${activeRows}${disabledRow}</div>
      <p class="uilg-demo-note">눌러서 열고 값을 고르면 닫히면서 값이 남습니다. Esc·바깥 클릭으로도 닫힙니다.</p>
    </div>`;
  }

  /* Mobile — 크기 축이 하나뿐이라 왼쪽 라벨은 크기(MD) 대신 유형(Line·Solid × 제목 유무)을 쓰고,
     네 조합을 한 표에서 함께 본다(사이 가로선 없음). */
  function mobileGrid() {
    /* 열 = 유형 4조합 · 행 = 상태. 열림(Selected) 행만 목록을 펴므로 세로가 짧다. */
    const columns = variants.flatMap(([variant, vLabel]) =>
      titles.map(([title, titleLabel]) => [variant, title, `${vLabel} · ${titleLabel}`]));
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      columns.map(([, , colLabel]) => `<div class="matrix-col-header">${colLabel}</div>`).join("");
    const rows = states.map(([stateLabel, state, note], index) =>
      `<div class="matrix-row-label">${stateLabel}${note ? `<span>${note}</span>` : ""}</div>` +
      columns.map(([variant, title]) => `<div class="comp-state-cell${index === states.length - 1 ? " uilg-open-cell" : ""}">${filterChipMarkup({
        variant, size: "md", breakName: "mobile", title, state, isPreview: true
      })}</div>`).join("")).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns: 120px repeat(${columns.length}, minmax(140px, 1fr));">${header}${rows}</div>`;
  }

  function content(breakName, sizes) {
    if (breakName === "mobile") {
      return `${actionSection(breakName, sizes)}
      ${mobileGrid()}`;
    }
    const blocks = variants.map(([variant, vLabel]) => {
      const grids = titles.map(([title, titleLabel]) => `
        <div class="uilg-demo-group">
          <div class="matrix-row-label">${titleLabel}</div>
          ${sizeStateGrid(sizes, states, (size, state) => filterChipMarkup({ variant, size, breakName, title, state, isPreview: true }), { tall: true })}
        </div>`).join("");
      return `<div class="uilg-variant-block">
        <div class="variant-label">${vLabel}</div>
        ${grids}
      </div>`;
    }).join('<hr class="uilg-separator">');
    return `${actionSection(breakName, sizes)}
      ${blocks}`;
  }

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content("pc", pcSizes)}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content("mobile", mobileSizes)}
      </div>
    </div>`;
}

/* ── Line Tab · Pagination ── */

function tabMarkup({ size = "md", breakName = "pc", selected = 0, hover = -1, preview = false } = {}) {
  const labels = ["탭 메뉴 1", "탭 메뉴 2", "탭 메뉴 3"];
  return `<div data-s1-component="tab" data-size="${size}" data-break="${breakName}" role="tablist" aria-label="콘텐츠 보기 선택"${preview ? ' class="is-preview"' : ""}>${labels.map((label, index) => `<button type="button" data-s1-part="tab" role="tab" aria-selected="${index === selected}"${index === hover ? ' data-force-state="hover"' : ""}>${label}</button>`).join("")}</div>`;
}

function tabStateItemMarkup({ size = "md", breakName = "pc", selected = false, hover = false } = {}) {
  return `<div data-s1-component="tab" data-size="${size}" data-break="${breakName}" role="tablist" aria-label="탭 상태 미리보기" class="is-preview"><button type="button" data-s1-part="tab" role="tab" aria-selected="${selected}"${hover ? ' data-force-state="hover"' : ""}>탭 메뉴</button></div>`;
}

function tabStateMatrix() {
  const sizes = currentPlatform() === "mobile" ? [["sm", "SM", "32px"]] : [["md", "MD", "44px"], ["sm", "SM", "42px"], ["xsm", "XSM", "40px"]];
  const breakName = currentPlatform() === "mobile" ? "mobile" : "pc";
  const action = `<div class="comp-action-top uilg-tab-action-top"><div class="matrix-col-header-action">Action</div><div class="uilg-tab-action-row">${sizes.map(([size, label, height]) => `<div class="uilg-tab-action-item"><div class="matrix-col-header">${label}<span class="uilg-size-dim">${height}</span></div>${tabMarkup({ size, breakName })}</div>`).join("")}</div></div>`;
  const states = [["기본", {}], ["선택", { selected: true }], ["Hover", { hover: true }]];
  return `<div class="platform-section"><div class="preview-area">${action}<div class="comp-state-matrix" style="grid-template-columns:repeat(3,minmax(120px,1fr));">${states.map(([label]) => `<div class="matrix-col-header">${label}</div>`).join("")}${states.map(([, options]) => `<div class="comp-state-cell">${tabStateItemMarkup({ size: sizes[0][0], breakName, ...options })}</div>`).join("")}</div></div></div>`;
}

function paginationMarkup({ page = 1, total = 6, preview = false } = {}) {
  const beforeDisabled = page <= 1;
  const afterDisabled = page >= total;
  return `<nav data-s1-component="pagination" data-total-pages="${total}" data-page="${page}" aria-label="페이지 탐색"${preview ? ' class="is-preview"' : ""}><span data-s1-part="arrow-group"><button type="button" data-s1-action="first" aria-label="첫 페이지"${beforeDisabled ? " disabled" : ""}><span data-s1-part="icon" data-icon="edge" aria-hidden="true"></span></button><button type="button" data-s1-action="previous" aria-label="이전 페이지"${beforeDisabled ? " disabled" : ""}><span data-s1-part="icon" data-icon="chevron" aria-hidden="true"></span></button></span><span data-s1-part="pages">${Array.from({ length: total }, (_, index) => { const number = index + 1; return `<button type="button" data-s1-part="page" data-page="${number}"${number === page ? ' aria-current="page"' : ""}>${number}</button>`; }).join("")}</span><span data-s1-part="arrow-group"><button type="button" data-s1-action="next" aria-label="다음 페이지"${afterDisabled ? " disabled" : ""}><span data-s1-part="icon" data-icon="chevron" aria-hidden="true"></span></button><button type="button" data-s1-action="last" aria-label="마지막 페이지"${afterDisabled ? " disabled" : ""}><span data-s1-part="icon" data-icon="edge" aria-hidden="true"></span></button></span></nav>`;
}

/* ── State matrix: Table ──
   정본 buildTableCell(Size 3 × Type 2 × Variant 3) · buildTable(Size 3).
   상태는 정본과 같이 '셀'이 소유하고 행은 그 조합으로 표현한다.
   Action 영역은 river 결정(2026-09-02)대로 표 + 페이지네이션 + 보기 셀렉박스를 함께 보여주되,
   뒤 둘은 승인된 배포본을 조립해 쓴다 — Table 안에 다시 구현하지 않는다. */

let tableRowId = 0;

function tableSelectionCell({ tag = "td", label = "", checked = false, isPreview = false } = {}) {
  tableRowId += 1;
  const attrs = [
    'type="checkbox"',
    'data-s1-part="control"',
    `aria-label="${escapeHtml(label)}"`,
    checked ? "checked" : "",
    isPreview ? 'tabindex="-1"' : ""
  ].filter(Boolean).join(" ");
  const part = tag === "th" ? 'data-s1-part="header-cell" scope="col"' : 'data-s1-part="cell"';
  return `<${tag} ${part} data-selection><div data-s1-component="checkbox"><input ${attrs}></div></${tag}>`;
}

function tableMarkup({ size = "md", rows = null, isPreview = false } = {}) {
  const data = rows ?? [
    { name: "항목 1", category: "카테고리 A", count: 10, state: "활성" },
    { name: "항목 2", category: "카테고리 B", count: 20, state: "검토중" },
    { name: "항목 3", category: "카테고리 C", count: 30, state: "완료" },
    { name: "항목 4", category: "카테고리 A", count: 40, state: "활성" }
  ];
  const preview = isPreview ? " is-preview" : "";
  const body = data.map((row, index) => `<tr data-s1-part="row"${row.selected ? ' data-selected="true"' : ""}>
        ${tableSelectionCell({ label: `${row.name} 선택`, checked: Boolean(row.selected), isPreview })}
        <td data-s1-part="cell"${row.forceState ? ` data-state="${row.forceState}"` : ""}>${escapeHtml(row.name)}</td>
        <td data-s1-part="cell"${row.forceState ? ` data-state="${row.forceState}"` : ""}>${escapeHtml(row.category)}</td>
        <td data-s1-part="cell" data-align="center"${row.forceState ? ` data-state="${row.forceState}"` : ""}>${row.count}</td>
        <td data-s1-part="cell" data-align="center"${row.forceState ? ` data-state="${row.forceState}"` : ""}>${escapeHtml(row.state)}</td>
      </tr>`).join("");
  return `<div data-guide-sample="set" data-s1-component="table" data-size="${size}" class="${preview.trim()}">
      <table data-s1-part="table">
        <thead>
          <tr>
            ${tableSelectionCell({ tag: "th", label: "전체 선택", isPreview })}
            <th data-s1-part="header-cell" scope="col">항목명</th>
            <th data-s1-part="header-cell" scope="col">카테고리</th>
            <th data-s1-part="header-cell" data-align="center" scope="col">수량</th>
            <th data-s1-part="header-cell" data-align="center" scope="col">상태</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

/* 셀 한 칸짜리 표본 — 정본 Table Cell 세트의 낱개 변형만 보여준다.
   정본에서 셀이 가진 선은 **아래 1px(color/table/border/default) 하나뿐**이다.
   위·아래의 진한 선(위 2px · 아래 1px, border/strong)은 셀이 아니라 **표 세트**가 그리는 외곽선이라
   낱개 셀 표본에서는 꺼 둔다 — 켜 두면 정본에 없는 모습이 된다(river 지적 2026-09-02). */
function tableCellSample({ size = "md", type = "cell", state = "default", align = "left", width = null } = {}) {
  const forced = state === "default" ? "" : ` data-state="${state}"`;
  /* 열 정렬 — 정본 Table Cell 의 Align 축(Left·Center)과 1:1. 기본(왼쪽)은 속성을 붙이지 않는다. */
  const aligned = align === "center" ? ` data-align="center"` : "";
  const inner = type === "header"
    ? `<thead><tr><th data-s1-part="header-cell" scope="col"${aligned}>헤더</th></tr></thead>`
    : `<tbody><tr data-s1-part="row"><td data-s1-part="cell"${forced}${aligned}>셀 내용</td></tr></tbody>`;
  /* 정렬은 열 폭이 있어야 눈에 보인다 — 정렬 표본만 폭을 고정한다(그 외는 종전대로 내용 폭). */
  const boxW = width ? `${width}px` : "auto";
  return `<div data-guide-sample="part" data-s1-component="table" data-size="${size}" class="is-preview" style="width:${boxW};border-top:0;border-bottom:0;">
      <table data-s1-part="table" style="width:${boxW};">${inner}</table>
    </div>`;
}

function tableStateMatrix() {
  /* Action — 표 + 페이지네이션 + 보기 셀렉박스(정본 푸터 구성). 뒤 둘은 각자의 배포본이다. */
  const action = `<div class="comp-action-top"><div class="matrix-col-header-action">Action</div>
      <div class="uilg-table-action" style="display:flex;flex-direction:column;gap:12px;width:100%;">
        ${tableMarkup()}
        <div style="display:flex;align-items:center;justify-content:center;position:relative;">
          ${paginationMarkup({ page: 1, total: 5 })}
          <div style="position:absolute;right:0;">${selectMarkup({
            size: "xxsm",
            ariaLabel: "한 페이지에 보여줄 행 수",
            valueText: "15개씩 보기",
            rows: [
              { label: "10개씩 보기", selected: false },
              { label: "15개씩 보기", selected: true },
              { label: "20개씩 보기", selected: false },
              { label: "50개씩 보기", selected: false }
            ]
          })}</div>
        </div>
      </div></div>`;

  /* 크기 3종 — 정본 사다리(MD 44 · SM 38 · XSM 34, XSM 만 글자 12) */
  const sizes = [["MD", "md", "행 44 · 글자 14"], ["SM", "sm", "행 38 · 글자 14"], ["XSM", "xsm", "행 34 · 글자 12"]];
  const sizeRows = sizes.map(([label, size, note]) => `<div class="matrix-row-label">${label} · ${note}</div><div class="comp-state-cell">${tableMarkup({
    size,
    isPreview: true,
    rows: [
      { name: "기본 행", category: "카테고리 A", count: 10, state: "활성" },
      { name: "Hover 행", category: "카테고리 B", count: 20, state: "검토중", forceState: "hover" },
      { name: "선택된 행", category: "카테고리 C", count: 30, state: "완료", selected: true }
    ]
  })}</div>`).join("");

  /* 셀 단위 — 정본 Table Cell 세트(Size × Type × Variant).
     부품(바디 셀 / 헤더 셀)으로 먼저 묶고 그 안에서 크기를 비교한다(river 지시 2026-09-02).
     헤더는 정본에 Default 변형만 있어 상태 열이 하나뿐이다. */
  /* 두 표는 같은 열 격자를 쓴다 — 헤더 셀의 Default 가 아래 바디 셀의 Default 와 같은 세로선에
     놓이게 하기 위함이다(river 지시 2026-09-02). 헤더에 없는 Hover·Selected 칸은 비워 둔다. */
  const CELL_GRID_COLUMNS = "150px repeat(3, minmax(120px, 1fr))";
  const cellGrid = (type) => {
    const states = type === "header" ? ["default", null, null] : ["default", "hover", "selected"];
    const headers = type === "header"
      ? '<div class="matrix-col-header">Default</div><div class="matrix-col-header"></div><div class="matrix-col-header"></div>'
      : '<div class="matrix-col-header">Default</div><div class="matrix-col-header">Hover</div><div class="matrix-col-header">Selected</div>';
    const rows = sizes.map(([label, size, note]) =>
      `<div class="matrix-row-label">${label} · ${note}</div>${states.map((state) => `<div class="comp-state-cell">${state ? tableCellSample({ size, type, state }) : ""}</div>`).join("")}`
    ).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns:${CELL_GRID_COLUMNS};">
        <div class="matrix-col-header">크기</div>${headers}
        ${rows}
      </div>`;
  };

  return `<div class="platform-section"><div class="preview-area">${action}
    <div class="uilg-variant-block">
      <div class="variant-label">세트 — 크기별 표 전체</div>
      <div class="comp-state-matrix" style="grid-template-columns:150px minmax(0,1fr);">
        <div class="matrix-col-header">크기</div>
        <div class="matrix-col-header">기본 · Hover · 선택</div>
        ${sizeRows}
      </div>
    </div>
    <hr class="uilg-separator">
    <div class="uilg-variant-block">
      <div class="variant-label">셀 단위 — 헤더 셀 <span style="font-weight:400;font-size:11px;color:#9ca3af;text-transform:none;letter-spacing:0;">— 정본에 Default 변형만 있습니다 · 셀이 가진 선은 아래 1px 하나뿐입니다(표 위·아래 진한 선은 표 세트 몫)</span></div>
      ${cellGrid("header")}
    </div>
    <hr class="uilg-separator">
    <div class="uilg-variant-block">
      <div class="variant-label">셀 단위 — 바디 셀</div>
      ${cellGrid("cell")}
    </div>
    <hr class="uilg-separator">
    <div class="uilg-variant-block">
      <div class="variant-label">열 정렬 — 왼쪽 · 가운데 <span style="font-weight:400;font-size:11px;color:#9ca3af;text-transform:none;letter-spacing:0;">— 기본은 왼쪽입니다. 수량·상태처럼 짧은 값만 열 단위로 가운데를 씁니다 · 좌우 여백 16은 그대로입니다</span></div>
      <div class="comp-state-matrix" style="grid-template-columns:150px repeat(2, minmax(120px, 1fr));">
        <div class="matrix-col-header">부품</div>
        <div class="matrix-col-header">왼쪽 (기본)</div>
        <div class="matrix-col-header">가운데</div>
        ${["header", "cell"].map((type) => `<div class="matrix-row-label">${type === "header" ? "헤더 셀" : "바디 셀"}</div>` +
          ["left", "center"].map((align) => `<div class="comp-state-cell">${tableCellSample({ type, align, width: 180 })}</div>`).join("")).join("")}
      </div>
    </div></div></div>`;
}

function paginationStateMatrix() {
  const states = [["한 페이지", 1, 1], ["첫 페이지", 1, 6], ["마지막 페이지", 6, 6], ["중간 페이지", 4, 6]];
  const action = `<div class="comp-action-top"><div class="matrix-col-header-action">Action</div>${paginationMarkup()}</div>`;
  return `<div class="platform-section"><div class="preview-area">${action}<div class="comp-state-matrix" style="grid-template-columns:120px minmax(0,1fr);"><div class="matrix-col-header">상태</div><div class="matrix-col-header"></div>${states.map(([label, page, total]) => `<div class="matrix-row-label">${label}</div><div class="comp-state-cell">${paginationMarkup({ page, total, preview: true })}</div>`).join("")}</div></div></div>`;
}

/* ── State matrix: Textarea ──
   정본 buildTextarea 는 State 축 하나뿐이다(크기·라벨·안내문구 부품 없음).
   Focus 는 미리보기 칸에 초점을 줄 수 없어 검수 전용 data-force-state 로만 표시한다. */

let textareaId = 0;

function textareaMarkup({ breakName = "pc", value = "", state = "default", isPreview = false } = {}) {
  textareaId += 1;
  const id = `guide-textarea-${breakName}-${textareaId}`;
  const force = state === "focus" ? ' data-force-state="focus"' : "";
  const preview = isPreview ? ' class="is-preview"' : "";
  const attrs = [
    `id="${id}"`,
    'data-s1-part="control"',
    'rows="3"',
    'aria-label="설명"',
    'placeholder="여러 줄 내용을 입력하세요"',
    state === "disabled" ? "disabled" : "",
    state === "readonly" ? "readonly" : "",
    isPreview ? 'tabindex="-1"' : ""
  ].filter(Boolean).join(" ");
  return `<div data-s1-component="textarea" data-break="${breakName}"${force}${preview}>
      <textarea ${attrs}>${escapeHtml(value)}</textarea>
    </div>`;
}

function textareaStateMatrix() {
  const states = [
    { label: "Default", opts: {} },
    { label: "Focus", opts: { state: "focus" }, note: "검수 표시" },
    { label: "Filled", opts: { value: "회의 내용을 정리했습니다." } },
    { label: "Disabled", opts: { state: "disabled" } },
    { label: "Read-only", opts: { state: "readonly", value: "읽기 전용 내용입니다." } }
  ];

  function actionSection(breakName) {
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-textarea-action">${textareaMarkup({ breakName })}</div>
      <p class="uilg-demo-note">직접 입력해 보세요. 오른쪽 아래를 끌면 세로 방향으로만 커집니다. 라벨은 화면에서 따로 연결합니다.</p>
    </div>`;
  }

  function stateSection(breakName) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      states.map((state) => `<div class="matrix-col-header">${state.label}${state.note ? `<span class="uilg-size-dim">${state.note}</span>` : ""}</div>`).join("");
    const row = `<div class="matrix-row-label">Text Area</div>` +
      states.map((state) => `<div class="comp-state-cell">${textareaMarkup({
        breakName, isPreview: true, ...state.opts
      })}</div>`).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${states.length}, minmax(150px, 1fr));">${header}${row}</div>`;
  }

  const content = (breakName) => `${actionSection(breakName)}
    ${stateSection(breakName)}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content("pc")}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content("mobile")}
      </div>
    </div>`;
}

/* ── State matrix: Multi Toggle ──
   정본은 md·sm 두 크기와 상태 4종만 가진다. 모바일 크기가 없어 PC 전용으로 한 벌만 둔다.
   Hover 는 미리보기 칸에 마우스를 올릴 수 없어 검수 전용 data-force-state 로만 표시한다. */

let multiToggleId = 0;

function multiToggleMarkup({ size = "md", selected = 0, disabled = false, forceState = "", isPreview = false } = {}) {
  multiToggleId += 1;
  const cells = [["left", "왼쪽"], ["center", "가운데"], ["right", "오른쪽"]];
  const preview = isPreview ? ' class="is-preview"' : "";
  const body = cells.map(([value, label], index) => {
    const checked = index === selected;
    const force = forceState && index === 1 && !checked ? ` data-force-state="${forceState}"` : "";
    return `<button type="button" data-s1-part="cell" role="radio" aria-checked="${checked}" data-value="${value}"${disabled ? ' aria-disabled="true"' : ""}${force}>${label}</button>`;
  }).join("");
  return `<div data-s1-component="multi-toggle" data-size="${size}" role="radiogroup" aria-label="정렬 기준 ${multiToggleId}"${preview}>${body}</div>`;
}

function multiToggleStateMatrix() {
  const sizes = [["md", "MD", "44px"], ["sm", "SM", "34px"]];
  const states = [
    { label: "Default", opts: { selected: -1 } },
    { label: "Hover", opts: { selected: -1, forceState: "hover" }, note: "검수 표시" },
    { label: "Selected", opts: { selected: 1 } },
    { label: "Disabled", opts: { selected: -1, disabled: true } }
  ];

  const actionHeader = `<div class="matrix-col-header" style="grid-column:1"></div>` +
    sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel}<span class="uilg-size-dim">${dim}</span></div>`).join("");
  const liveRow = `<div class="matrix-row-label">Multi Toggle</div>` +
    sizes.map(([size]) => `<div class="comp-state-cell">${multiToggleMarkup({ size })}</div>`).join("");
  const action = `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${sizes.length}, minmax(200px, 1fr));">${actionHeader}${liveRow}</div>
      <p class="uilg-demo-note">칸을 누르면 선택이 옮겨집니다. 키보드에서는 화살표 키로 이동하며 이동과 동시에 선택됩니다.</p>
    </div>`;

  const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
    states.map((state) => `<div class="matrix-col-header">${state.label}${state.note ? `<span class="uilg-size-dim">${state.note}</span>` : ""}</div>`).join("");
  const rows = sizes.map(([size, sLabel, dim]) =>
    `<div class="matrix-row-label">${sLabel}<span>${dim}</span></div>` +
    states.map((state) => `<div class="comp-state-cell">${multiToggleMarkup({ size, isPreview: true, ...state.opts })}</div>`).join("")).join("");
  const grid = `<div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${states.length}, minmax(200px, 1fr));">${header}${rows}</div>`;

  return `
    <div class="platform-section">
      <div class="preview-area">${action}
      ${grid}</div>
    </div>`;
}

/* ── State matrix: Modal ──
   정본 buildModalShell 의 변형은 Break(PC·Mobile) × Footer(Single·Dual) 4가지뿐이고 상태 축이 없다.
   Action 은 실제로 열리는 진짜 모달(딤이 화면을 덮는다)이고, 아래 칸은 지면에 눕혀 보여주는 검수 표시다. */

let modalId = 0;

function modalMarkup({ breakName = "pc", footer = "dual", isPreview = false } = {}) {
  modalId += 1;
  const titleId = `guide-modal-title-${modalId}`;
  const messageId = `guide-modal-message-${modalId}`;
  const preview = isPreview ? ' class="is-preview"' : "";
  const mobile = breakName === "mobile";
  const buttonSize = mobile ? "lg" : "xxsm";
  const title = mobile
    ? (footer === "dual" ? "자동 로그인 설정" : "업데이트 안내")
    : "제목 영역";
  const message = mobile
    ? (footer === "dual" ? "로그인되었어요.\n다음부터 자동으로 로그인할까요?" : "보다 안정적인 서비스 이용을 위해 최신\n버전으로 업데이트해 주세요.")
    : (footer === "dual" ? "변경한 내용이 저장되지 않고 사라집니다.\n정말 이 작업을 진행하시겠어요?" : "요청하신 작업이 정상적으로 처리되었습니다.\n변경된 내용은 목록에서 확인하실 수 있어요.");
  const labels = footer === "dual"
    ? (mobile ? ["아니오", "네"] : ["취소", "확인"])
    : (mobile ? ["업데이트"] : ["확인"]);
  const buttons = footer === "dual"
    ? `<button type="button" data-s1-component="button" data-variant="secondary" data-size="${buttonSize}" data-modal-close${isPreview ? ' tabindex="-1"' : ""}><span data-s1-part="label">${labels[0]}</span></button>` +
      `<button type="button" data-s1-component="button" data-variant="primary" data-size="${buttonSize}" data-modal-close${isPreview ? ' tabindex="-1"' : ""}><span data-s1-part="label">${labels[1]}</span></button>`
    : `<button type="button" data-s1-component="button" data-variant="primary" data-size="${buttonSize}" data-modal-close${isPreview ? ' tabindex="-1"' : ""}><span data-s1-part="label">${labels[0]}</span></button>`;
  /* 정본은 PC 에만 닫기(X)를 둔다. Mobile 변형에는 없다. */
  const close = mobile ? "" : `<button type="button" data-s1-part="close" aria-label="닫기" data-modal-close${isPreview ? ' tabindex="-1"' : ""}></button>`;
  return `<div data-s1-component="modal" data-break="${breakName}" data-footer="${footer}"${preview}${isPreview ? "" : " hidden"}>
      <div data-s1-part="overlay"></div>
      <div data-s1-part="panel" role="dialog" aria-modal="true" aria-labelledby="${titleId}" aria-describedby="${messageId}" tabindex="-1">
        <div data-s1-part="content">
          <div data-s1-part="header">
            <h2 data-s1-part="title" id="${titleId}">${title}</h2>
            ${close}
          </div>
          <div data-s1-part="body">
            <p data-s1-part="message" id="${messageId}">${escapeHtml(message)}</p>
          </div>
        </div>
        <div data-s1-part="footer">${buttons}</div>
      </div>
    </div>`;
}

function modalStateMatrix() {
  const footers = [["single", "Single", "버튼 1개"], ["dual", "Dual", "버튼 2개"]];

  function actionSection(breakName) {
    return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-modal-action">
        <button type="button" data-s1-component="button" data-variant="secondary" data-size="${breakName === "mobile" ? "lg" : "md"}" data-modal-open><span data-s1-part="label">모달 열기</span></button>
        ${modalMarkup({ breakName, footer: "dual" })}
      </div>
      <p class="uilg-demo-note">눌러서 열어 보세요. Esc 키로 닫히고, Tab 키는 팝업 안에서만 돕니다. 닫으면 열기 전 자리로 초점이 돌아옵니다.</p>
    </div>`;
  }

  function stateSection(breakName) {
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      footers.map(([, label, dim]) => `<div class="matrix-col-header">${label}<span class="uilg-size-dim">${dim}</span></div>`).join("");
    const row = `<div class="matrix-row-label">Modal<span>${breakName === "mobile" ? "300px" : "360px"}</span></div>` +
      footers.map(([footer]) => `<div class="comp-state-cell">${modalMarkup({ breakName, footer, isPreview: true })}</div>`).join("");
    return `<div class="comp-state-matrix" style="grid-template-columns: 110px repeat(${footers.length}, minmax(420px, 1fr));">${header}${row}</div>`;
  }

  const content = (breakName) => `${actionSection(breakName)}
    ${stateSection(breakName)}`;

  return `
    <div class="platform-section platform-section-pc">
      <div class="preview-area">${content("pc")}</div>
    </div>
    <div class="platform-section platform-section-mobile">
      <div class="preview-area">
        ${content("mobile")}
      </div>
    </div>`;
}

/* ── Mobile Bottom Nav — 탭 아이템 1칸(60×60). 360×780 모바일 목업은 안내 화면 전용 크롬이다(D6).
   목업 크롬(휴대폰 테두리·상태바 그림·화면 내용 스켈레톤)은 dist 부품이 아니므로 data-s1-component 을
   갖지 않는다 — 부품 표본에는 data-guide-sample="part", 조립 표본에는 "set" 을 붙인다(부품 표본 격리). */
function mobileBottomNavItemMarkup({ selected = false, label = "라벨" } = {}) {
  return `<button type="button" data-s1-component="mobile-bottom-nav" role="tab" aria-selected="${selected}">
    <span data-s1-part="icon" aria-hidden="true"></span>
    <span data-s1-part="label">${label}</span>
  </button>`;
}

function phoneMockup(bodyHtml, { statusText = "9:41" } = {}) {
  return `<div class="uilg-phone" role="img" aria-label="모바일 화면 목업">
    <div class="uilg-phone-status" aria-hidden="true"><span>${statusText}</span><span class="uilg-phone-status-icons"></span></div>
    <div class="uilg-phone-screen">${bodyHtml}</div>
  </div>`;
}

function mobileBottomNavStateMatrix() {
  const bar = ["홈", "검색", "알림", "내 정보"]
    .map((label, index) => mobileBottomNavItemMarkup({ selected: index === 0, label })).join("");
  const mock = phoneMockup(`
    <div class="uilg-phone-content" aria-hidden="true">
      <div class="uilg-phone-skeleton uilg-phone-skeleton--title"></div>
      <div class="uilg-phone-skeleton uilg-phone-skeleton--line"></div>
      <div class="uilg-phone-card"></div>
      <div class="uilg-phone-card"></div>
    </div>
    <nav data-guide-sample="set" role="tablist" aria-label="하단 내비게이션" style="display:flex;justify-content:space-between;background:var(--color-navigation-bg);">${bar}</nav>`);

  const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
    `<div class="matrix-col-header">Unselected</div><div class="matrix-col-header">Selected</div>`;
  const row = `<div class="matrix-row-label">Tab Item<span>60×60</span></div>` +
    `<div class="comp-state-cell"><span data-guide-sample="part">${mobileBottomNavItemMarkup({ selected: false })}</span></div>` +
    `<div class="comp-state-cell"><span data-guide-sample="part">${mobileBottomNavItemMarkup({ selected: true })}</span></div>`;

  const content = `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-mobile-action">${mock}</div>
      <p class="uilg-demo-note">배포 부품은 아이템 1칸뿐입니다. 위 4탭 바는 화면이 조립한 예시이고, 배경은 --color-navigation-bg 입니다.</p>
    </div>
    <div class="comp-state-matrix" style="grid-template-columns: 110px repeat(2, minmax(120px,1fr));">${header}${row}</div>`;

  return `<div class="platform-section platform-section-pc"><div class="preview-area">${content}</div></div>
    <div class="platform-section platform-section-mobile"><div class="preview-area">${content}</div></div>`;
}

/* ── Mobile Header — Type 6종. StatusBar·Platform 축은 river 결정(D5)으로 배포본에서 뺐다.
   안내 화면 목업 안에서만 상태바를 그림으로 보여준다(D6). */
function mobileHeaderMarkup(variant) {
  const back = `<button type="button" data-s1-part="back" aria-label="이전"><span data-s1-part="back-icon" aria-hidden="true"></span></button>`;
  const close = `<button type="button" data-s1-part="close" aria-label="닫기"><span data-s1-part="close-icon" aria-hidden="true"></span></button>`;
  const spacer = `<span data-s1-part="spacer" aria-hidden="true"></span>`;
  if (variant === "home-title") {
    return `<header data-guide-sample="part" data-s1-component="mobile-header" data-variant="home-title"><h1 data-s1-part="title">홈 타이틀</h1></header>`;
  }
  if (variant === "home-title-subtitle") {
    return `<header data-guide-sample="part" data-s1-component="mobile-header" data-variant="home-title-subtitle">
      <div data-s1-part="stack">
        <div data-s1-part="title-row"><h1 data-s1-part="title">홈 타이틀</h1><span data-s1-part="arrow-icon" aria-hidden="true"></span></div>
        <p data-s1-part="subtitle">홈 서브타이틀</p>
      </div>
      <button type="button" data-s1-part="notification" aria-label="알림"><span data-s1-part="notification-icon" aria-hidden="true"></span></button>
    </header>`;
  }
  const hasClose = variant.endsWith("-close");
  const hasTitle = !variant.includes("no-title");
  return `<header data-guide-sample="part" data-s1-component="mobile-header" data-variant="${variant}">
    ${back}
    ${hasTitle ? '<h1 data-s1-part="title">스탠다드형 타이틀</h1>' : '<span data-s1-part="title" aria-hidden="true"></span>'}
    ${hasClose ? close : spacer}
  </header>`;
}

const MOBILE_HEADER_TYPES = [
  ["Home / Title", "home-title"],
  ["Home / Title + Subtitle + 1 Icon", "home-title-subtitle"],
  ["Standard / Title", "standard-title"],
  ["Standard / Title + Close", "standard-title-close"],
  ["Standard / No Title", "standard-no-title"],
  ["Standard / No Title + Close", "standard-no-title-close"]
];
const MOBILE_HEADER_DEFAULT_TYPE = "standard-title";

/* Action 영역 — 유형을 옵션칩으로 골라 목업 위에 얹어 본다(river 지시 2026-09-02).
   칩은 PC·Mobile 두 섹션에 같은 내용이 두 번 그려지므로 name·id 를 break 별로 나눈다
   — 같은 name 의 라디오는 하나만 선택될 수 있어 먼저 그려진 쪽 선택이 조용히 풀린다(함정 T5). */
function mobileHeaderActionBlock(breakName) {
  const mock = phoneMockup(`
    <div class="uilg-phone-header-slot">${mobileHeaderMarkup(MOBILE_HEADER_DEFAULT_TYPE)}</div>
    <div class="uilg-phone-content" aria-hidden="true">
      <div class="uilg-phone-skeleton uilg-phone-skeleton--title"></div>
      <div class="uilg-phone-skeleton uilg-phone-skeleton--line"></div>
      <div class="uilg-phone-card"></div>
    </div>`);

  const chips = MOBILE_HEADER_TYPES.map(([label, variant]) => {
    const inputId = `mh-type-${breakName}-${variant}`;
    const on = variant === MOBILE_HEADER_DEFAULT_TYPE;
    return `<label class="uilg-option-chip${on ? " is-on" : ""}" for="${inputId}">
      <input id="${inputId}" type="radio" name="mh-type-${breakName}" value="${variant}" data-mobile-header-type${on ? " checked" : ""} hidden>
      <span class="uilg-option-chip-text">${label}</span>
    </label>`;
  }).join("");

  return `<div class="comp-action-top">
      <div class="matrix-col-header-action">Action</div>
      <div class="uilg-mobile-action">${mock}</div>
      <div class="uilg-option-chips" role="group" aria-label="헤더 유형 선택">${chips}</div>
      <p class="uilg-demo-note">유형을 고르면 위 목업의 헤더가 바뀝니다. 상태바(시간·배터리)는 그림일 뿐 배포 부품이 아닙니다 — 실제 서비스에서는 OS·브라우저가 그립니다.</p>
    </div>`;
}

function mobileHeaderStateMatrix() {
  const rows = MOBILE_HEADER_TYPES.map(([label, variant]) => `
    <div class="review-sample" style="width:100%;">
      <p class="review-state-label">${label}</p>
      <div class="uilg-mobile-header-row">${mobileHeaderMarkup(variant)}</div>
    </div>`).join("");

  const list = `<div class="uilg-mobile-header-list">${rows}</div>`;

  return `<div class="platform-section platform-section-pc"><div class="preview-area">${mobileHeaderActionBlock("pc")}${list}</div></div>
    <div class="platform-section platform-section-mobile"><div class="preview-area">${mobileHeaderActionBlock("mobile")}${list}</div></div>`;
}

/* ── Component documentation (실제 동작 다음에 온다) ── */

function stateMatrix(id) {
  if (id === "input") return inputStateMatrix();
  if (id === "button") return buttonStateMatrix();
  if (id === "toggle") return toggleStateMatrix();
  if (id === "chip") return chipStateMatrix();
  if (id === "select") return selectStateMatrix();
  if (id === "dropdown") return dropdownStateMatrix();
  if (id === "filter-chip") return filterChipStateMatrix();
  if (id === "tab") return tabStateMatrix();
  if (id === "pagination") return paginationStateMatrix();
  if (id === "textarea") return textareaStateMatrix();
  if (id === "multi-toggle") return multiToggleStateMatrix();
  if (id === "table") return tableStateMatrix();
  if (id === "modal") return modalStateMatrix();
  if (id === "mobile-bottom-nav") return mobileBottomNavStateMatrix();
  if (id === "mobile-header") return mobileHeaderStateMatrix();
  return controlStateMatrix(id);
}

function componentOverview(id, registry) {
  return `${implementationRules(id, registry)}\n      ${usageGuide(id, registry)}`;
}

/* ── Implementation rules ── */

function implementationRules(id, registry) {
  const anatomy = registry.anatomy || [];
  const a11y = Array.isArray(registry.a11y) ? registry.a11y : [];
  const doDont = registry.doDont || {};
  const donts = doDont.dont || [];

  /* registry 규약: 선택 부품은 part 이름에 "(선택)" 을 붙인다(role 문장이 아니라). */
  const isOptional = (a) => a.part.includes("(선택)");
  const required = anatomy.filter((a) => !isOptional(a));
  const optional = anatomy.filter(isOptional);

  function ruleList(items) {
    if (!items.length) return "";
    return `<ul class="uilg-rule-list">${items.map((item) => {
      const text = typeof item === "string" ? item : `${item.part} — ${item.role}`;
      return `<li>${escapeHtml(text)}</li>`;
    }).join("")}</ul>`;
  }

  const sections = [];

  if (required.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">필수 요소</h4>${ruleList(required)}</div>`);
  }
  if (optional.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">선택 가능한 요소</h4>${ruleList(optional)}</div>`);
  }
  if (donts.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">하지 말 것</h4>${ruleList(donts)}</div>`);
  }
  if (a11y.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">접근성·동작 규칙</h4>${ruleList(a11y)}</div>`);
  }

  return `
    <section class="uilg-rules" aria-labelledby="${id}-rules-heading">
      <h2 class="uilg-section-title" id="${id}-rules-heading">구현 시 꼭 지킬 것</h2>
      <div class="uilg-rules-body">${sections.join("")}</div>
    </section>`;
}

/* ── Detailed usage guide ── */

function usageGuide(id, registry) {
  const usage = registry.usage || {};
  const doDont = registry.doDont || {};
  const dos = doDont.do || [];
  const whenToUse = usage.whenToUse || [];
  const whenNotToUse = usage.whenNotToUse || [];

  const sections = [];
  if (whenToUse.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">언제 사용하나요?</h4>${list(whenToUse)}</div>`);
  }
  if (whenNotToUse.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">사용하지 않는 경우</h4>${list(whenNotToUse)}</div>`);
  }
  if (dos.length) {
    sections.push(`<div class="uilg-rule-group"><h4 class="uilg-rule-heading">권장 사항</h4>${list(dos)}</div>`);
  }

  return `
    <details class="uilg-usage-details" aria-labelledby="${id}-usage-heading">
      <summary class="uilg-usage-summary" id="${id}-usage-heading">상세 사용 가이드</summary>
      <div class="uilg-usage-body">${sections.join("")}</div>
    </details>`;
}

/* ── Code viewer ── */

function codeViewer(id) {
  /* 보고 있는 화면의 마크업만 보여준다 — Mobile 화면에서 PC 코드를 복사하는 사고를 막는다
     (river 결정 2026-09-01). 코드 위 안내 문구는 두지 않는다(river 결정 2026-09-02). */
  const tabs = [
    ["html", "HTML"],
    ["css", "CSS"],
    ["js", "JavaScript"]
  ];
  return `
    <section class="uilg-code" aria-labelledby="${id}-code-title">
      <div class="uilg-code-toolbar">
        <div class="uilg-code-tabs" role="tablist" aria-label="${componentConfig[id].title} 코드">
          ${tabs.map(([key, label], index) => `<button type="button" class="uilg-code-tab" role="tab" data-guide-tab="${key}" aria-selected="${index === 0}" aria-controls="${id}-code-${key}">${label}</button>`).join("")}
        </div>
        <button type="button" class="uilg-copy">현재 코드 복사</button>
      </div>
      ${tabs.map(([key], index) => `<div class="uilg-code-panel${index === 0 ? " is-active" : ""}" id="${id}-code-${key}" role="tabpanel"><pre data-guide-code="${key}"></pre></div>`).join("")}
    </section>`;
}

function wireCodeViewer(section, sources) {
  for (const [key, value] of Object.entries(sources)) {
    const pre = section.querySelector(`[data-guide-code="${key}"]`);
    if (pre) pre.textContent = value.trim();
  }

  const tabs = [...section.querySelectorAll("[data-guide-tab]")];
  const panels = [...section.querySelectorAll(".uilg-code-panel")];
  const activate = (key) => {
    tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.guideTab === key)));
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.id.endsWith(`-${key}`)));
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.guideTab)));

  section.querySelector(".uilg-copy")?.addEventListener("click", async (event) => {
    const selected = section.querySelector('[data-guide-tab][aria-selected="true"]')?.dataset.guideTab || "html";
    const text = sources[selected].trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    const button = event.currentTarget;
    const original = button.textContent;
    button.textContent = "복사됨";
    setTimeout(() => { button.textContent = original; }, 1400);
  });
}

/* ── Mount ── */

async function mountGuide(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const config = componentConfig[id];
  const sourceUrls = urls(id);

  try {
    const [manifest, registry, htmlPc, css, js] = await Promise.all([
      fetchJson(sourceUrls.manifest),
      fetchJson(sourceUrls.registry),
      fetchText(sourceUrls.html),
      fetchText(sourceUrls.css),
      fetchText(sourceUrls.js)
    ]);

    if (!["approved", "verified"].includes(manifest.status)) throw new Error(`${id} 배포 상태가 verified 또는 approved가 아닙니다.`);

    /* 요약 한 줄도 보고 있는 화면 기준이다 — 크기가 한 가지인 화면에서는 크기를 말하지 않는다
       (river 확정 2026-09-01). 갈래 선언이 없는 컴포넌트는 한 문장을 그대로 쓴다. */
    const scopeText = typeof config.approvedScope === "string"
      ? config.approvedScope
      : config.approvedScope[currentPlatform()] ?? config.approvedScope.pc;

    /* 배포본이 선언한 플랫폼별 예제만 쓴다. 선언이 없으면 PC 1벌(플랫폼 축 없는 컴포넌트). */
    const platform = currentPlatform();
    const hasMobileExample = Boolean(manifest.htmlContract?.breakExamples?.mobile);
    const html = hasMobileExample && platform === "mobile"
      ? await fetchText(sourceUrls.htmlMobile)
      : htmlPc;

    // 실제 동작·상태를 먼저 보이고, 설명 문서는 그 뒤에 둔다.
    const overview = (data) => componentOverview(id, data);
    const fragment = document.createElement("div");
    fragment.className = "uilg";
    fragment.dataset.guideComponent = id;
    fragment.innerHTML = `
      <header class="uilg-header">
        <div class="uilg-title-group">
          <h2 class="uilg-title">${config.title}</h2>
          <p class="uilg-description">${config.description}</p>
        </div>
        <div class="uilg-badges" aria-label="배포 상태">
          <span class="uilg-badge uilg-badge-approved">${manifest.status === "approved" ? "Approved" : "검수 준비"}</span>
          <span class="uilg-badge">Core</span>
          <span class="uilg-badge">v${escapeHtml(manifest.version)}</span>
          <span class="uilg-badge">실제 dist 사용</span>
        </div>
      </header>
      <section class="uilg-demo preview-area" aria-labelledby="${id}-demo-title">
        <div class="uilg-demo-head">
          <div><h2 class="uilg-section-title" id="${id}-demo-title">실제 동작과 상태</h2><p class="uilg-demo-note">${scopeText}</p></div>
          <p class="uilg-status-text">이 설명 화면과 배포 파일은 같은 <strong>ui-library/dist</strong>를 사용합니다.</p>
        </div>
        ${stateMatrix(id)}
      </section>
      <section aria-labelledby="${id}-code-heading">
        <div class="uilg-title-group">
          <h2 class="uilg-section-title" id="${id}-code-heading">개발 코드</h2>
        </div>
        ${codeViewer(id)}
      </section>
      ${overview(registry)}`;

    section.replaceChildren(fragment);
    wireCodeViewer(section, { html, css, js });
    if (id === "toggle" || id === "chip" || id === "select" || id === "dropdown" || id === "filter-chip" || id === "tab" || id === "pagination" || id === "multi-toggle" || id === "table") {
      /* 미리보기 칸(.is-preview)은 init 하지 않는다 — 런타임이 패널을 다시 닫아
         Open/Selected 칸이 사라진다. Action 영역의 실물만 살린다. */
      section.querySelectorAll(`[data-s1-component="${id}"]:not(.is-preview)`).forEach((root) => config.runtime.init(root));
    }
    if (id === "table") {
      /* Action 영역에 조립한 페이지네이션·보기 셀렉박스는 각자의 배포본 런타임으로 살린다.
         (Table 은 이 둘을 소유하지 않는다 — river 결정 2026-09-02) */
      section.querySelectorAll('.uilg-table-action [data-s1-component="pagination"]').forEach((root) => S1UI.pagination.init(root));
      section.querySelectorAll('.uilg-table-action [data-s1-component="select"]').forEach((root) => S1UI.select.init(root));
    }
    if (id === "modal") {
      /* Action 영역의 진짜 모달만 배선한다. 미리보기 칸(.is-preview)은 지면에 눕혀 둔 표시라
         init 하지 않는다 — init 하면 배경 스크롤이 잠긴 채로 남는다. */
      section.querySelectorAll(".uilg-modal-action").forEach((area) => {
        const root = area.querySelector('[data-s1-component="modal"]');
        const trigger = area.querySelector("[data-modal-open]");
        if (!root || !trigger) return;
        /* 배포본 계약대로 모달은 body 바로 아래에 둔다(manifest.htmlContract.placement).
           안내 화면 안에 두면 상단 고정바가 모달 위에 남는다 — 쌓임 맥락에 갇히기 때문이다. */
        document.body.append(root);
        const api = config.runtime.init(root);
        trigger.addEventListener("click", () => api?.open());
        root.querySelectorAll("[data-modal-close]").forEach((button) => {
          if (button.dataset.s1Part === "close") return;   /* 닫기(X)는 런타임이 이미 배선한다 */
          button.addEventListener("click", () => api?.close({ reason: "footer-button" }));
        });
      });
    }
    if (id === "mobile-header") {
      /* 옵션칩으로 고른 유형을 목업 헤더 슬롯에 다시 그린다. 배포본은 런타임이 없는 정적 크롬이라
         init 은 필요 없고, 화면이 마크업만 갈아끼운다(부품 경계 그대로). */
      section.querySelectorAll("[data-mobile-header-type]").forEach((radio) => {
        radio.addEventListener("change", () => {
          const action = radio.closest(".comp-action-top");
          const slot = action?.querySelector(".uilg-phone-header-slot");
          if (!slot) return;
          slot.innerHTML = mobileHeaderMarkup(radio.value);
          action.querySelectorAll("[data-mobile-header-type]").forEach((other) => {
            other.closest(".uilg-option-chip")?.classList.toggle("is-on", other.checked);
          });
        });
      });
    }
    if (id === "input") {
      section.querySelectorAll('[data-s1-component="input"]:not(.is-preview)').forEach((root) => config.runtime.init(root));
      /* Wire message toggle chips in Action area */
      section.querySelectorAll("[data-input-msg-toggle]").forEach((toggle) => {
        const chipText = toggle.closest(".uilg-option-chip")?.querySelector(".uilg-option-chip-text");
        toggle.addEventListener("change", () => {
          const action = toggle.closest(".comp-action-top");
          if (!action) return;
          const input = action.querySelector('[data-s1-component="input"]');
          if (!input) return;
          let msg = input.querySelector('[data-s1-part="message"]');
          if (toggle.checked) {
            if (!msg) {
              msg = document.createElement("p");
              msg.dataset.s1Part = "message";
              msg.id = "action-input-msg";
              msg.textContent = "안내 메시지";
              input.append(msg);
              const ctrl = input.querySelector('[data-s1-part="control"]');
              if (ctrl) ctrl.setAttribute("aria-describedby", msg.id);
            }
            msg.hidden = false;
            if (chipText) chipText.innerHTML = 'Message: <strong>on</strong>';
          } else if (msg) {
            msg.hidden = true;
            const ctrl = input.querySelector('[data-s1-part="control"]');
            if (ctrl) ctrl.removeAttribute("aria-describedby");
          }
          if (!toggle.checked && chipText) chipText.innerHTML = 'Message: <strong>off</strong>';
          toggle.closest(".uilg-option-chip")?.classList.toggle("is-on", toggle.checked);
        });
      });
    }
  } catch (error) {
    section.replaceChildren();
    const message = document.createElement("div");
    message.className = "uilg-load-error";
    message.textContent = `${config.title} 승인 배포본을 불러오지 못했습니다: ${error.message}`;
    section.append(message);
    console.error(error);
  }
}

const guideComponents = ["input", "button", "checkbox", "radio", "toggle", "chip", "select", "dropdown", "filter-chip", "tab", "pagination", "textarea", "multi-toggle", "modal", "table", "mobile-bottom-nav", "mobile-header"];
await Promise.all(guideComponents.map(mountGuide));
document.dispatchEvent(new CustomEvent("s1:component-guide:ready", { detail: { components: guideComponents } }));
