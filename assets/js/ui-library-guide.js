import * as S1UI from "../../ui-library/dist/s1-ui.js";

const componentConfig = {
  input: {
    title: "Input",
    description: "한 줄 정보를 입력받는 기본 컴포넌트입니다. 라벨과 안내 메시지는 필요에 따라 함께 사용합니다.",
    approvedScope: "Base Input · 상태 7종 · PC 3크기 · Mobile 1크기 · remove 동작",
    runtime: S1UI.input
  },
  button: {
    title: "Button",
    description: "사용자가 저장·확인·취소처럼 명확한 행동을 실행할 때 사용하는 컴포넌트입니다.",
    approvedScope: "Primary · Secondary · Blue Line · PC 3크기 · Mobile 1크기",
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
    approvedScope: "Line · Solid × 상태 4종 · PC 2크기(SM 28 · MD 34) · Mobile 1크기(SM 30) · 라벨 전용",
    runtime: S1UI.chip
  },
  radio: {
    title: "Radio",
    description: "여러 보기 중 하나만 고를 때 사용합니다. 같은 그룹으로 묶으면 하나만 선택되고 화살표 키로 이동합니다.",
    approvedScope: "상태 5종 · 라벨 유무 · 크기 축 없음(18px 고정) · JavaScript 불필요",
    runtime: S1UI.radio
  }
};

let controlId = 0;

let inputId = 0;

const urls = (id) => ({
  manifest: new URL(`../../ui-library/dist/components/${id}.manifest.json`, import.meta.url),
  registry: new URL(`../../registry/components/${id}.json`, import.meta.url),
  html: new URL(`../../ui-library/dist/examples/${id}.html`, import.meta.url),
  css: new URL(`../../ui-library/dist/components/${id}.css`, import.meta.url),
  js: new URL(`../../ui-library/dist/components/${id}.js`, import.meta.url)
});

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
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel}<span class="uilg-size-dim">${dim}</span></div>`).join("");
    const activeRows = variants.map(([variant, vLabel]) => {
      const rowLabel = `<div class="matrix-row-label">${vLabel}</div>`;
      const cells = sizes.map(([size]) =>
        `<div class="comp-state-cell">${buttonMarkup(variant, size, "버튼")}</div>`
      ).join("");
      return rowLabel + cells;
    }).join("");
    const disabledRow = `<div class="matrix-row-label">Disabled<span class="uilg-size-dim">공통</span></div>` +
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

  const mobileSizes = [["lg", "LG", "80×48"]];
  const mobileVariantBlocks = variants.map(([variant, vLabel]) => `
    <div class="uilg-variant-block">
      <div class="variant-label">${vLabel}</div>
      <div class="comp-state-matrix" style="grid-template-columns: 100px minmax(80px, 1fr);">
        <div class="matrix-col-header" style="grid-column:1"></div>
        <div class="matrix-col-header">LG</div>
        ${states.map((state, si) => {
          const rowLabel = `<div class="matrix-row-label">${stateLabels[si]}</div>`;
          const cell = state === "disabled"
            ? `<div class="comp-state-cell">${buttonMarkup(variant, "lg", "버튼", true)}</div>`
            : `<div class="comp-state-cell">${buttonMarkup(variant, "lg", "버튼", false, state)}</div>`;
          return rowLabel + cell;
        }).join("")}
      </div>
    </div>`).join('<hr class="uilg-separator">');

  const mobileContent = `${unifiedAction(mobileSizes)}
    ${mobileVariantBlocks}`;

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
        <p class="uilg-demo-note">정본에 플랫폼·크기 축이 없어 Mobile도 PC와 같습니다(18px 고정).</p>
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
        <p class="uilg-demo-note">정본에 플랫폼·크기 축이 없어 Mobile도 PC와 같습니다(40×20 고정).</p>
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
    const sizes = breakName === "mobile" ? [["sm", "SM", "30px"]] : [["sm", "SM", "28px"], ["md", "MD", "34px"]];
    const header = `<div class="matrix-col-header" style="grid-column:1"></div>` +
      sizes.map(([, sLabel, dim]) => `<div class="matrix-col-header">${sLabel}<span class="uilg-size-dim">${dim}</span></div>`).join("");
    const activeRows = variants.map(([variant, vLabel]) => {
      const rowLabel = `<div class="matrix-row-label">${vLabel}</div>`;
      const cells = sizes.map(([size]) =>
        `<div class="comp-state-cell">${chipMarkup({ variant, size, breakName, label: "라벨" })}</div>`
      ).join("");
      return rowLabel + cells;
    }).join("");
    const disabledRow = `<div class="matrix-row-label">Disabled<span class="uilg-size-dim">공통</span></div>` +
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

  function content(breakName) {
    const size = breakName === "mobile" ? "sm" : "md";
    const blocks = variants.map(([variant, label]) => `
      <div class="uilg-variant-block">
        <div class="variant-label">${label}</div>
        ${variantGrid(variant, breakName, size)}
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
        <p class="uilg-demo-note">정본 Mobile은 SM 한 가지(30px)이며 글자 크기 14px, 좌우 여백 12px입니다.</p>
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
        <p class="uilg-demo-note">필드 높이와 remove 누르는 영역은 48px을 유지합니다.</p>
        ${mobileContent}
      </div>
    </div>`;
}

/* ── Component documentation (실제 동작 다음에 온다) ── */

function stateMatrix(id) {
  if (id === "input") return inputStateMatrix();
  if (id === "button") return buttonStateMatrix();
  if (id === "toggle") return toggleStateMatrix();
  if (id === "chip") return chipStateMatrix();
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
    const [manifest, registry, html, css, js] = await Promise.all([
      fetchJson(sourceUrls.manifest),
      fetchJson(sourceUrls.registry),
      fetchText(sourceUrls.html),
      fetchText(sourceUrls.css),
      fetchText(sourceUrls.js)
    ]);

    if (manifest.status !== "approved") throw new Error(`${id} 배포 상태가 approved가 아닙니다.`);

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
          <span class="uilg-badge uilg-badge-approved">Approved</span>
          <span class="uilg-badge">Core</span>
          <span class="uilg-badge">v${escapeHtml(manifest.version)}</span>
          <span class="uilg-badge">실제 dist 사용</span>
        </div>
      </header>
      <section class="uilg-demo preview-area" aria-labelledby="${id}-demo-title">
        <div class="uilg-demo-head">
          <div><h2 class="uilg-section-title" id="${id}-demo-title">실제 동작과 상태</h2><p class="uilg-demo-note">${config.approvedScope}</p></div>
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
    if (id === "toggle" || id === "chip") {
      section.querySelectorAll(`[data-s1-component="${id}"]:not(.is-preview)`).forEach((root) => config.runtime.init(root));
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

const guideComponents = ["input", "button", "checkbox", "radio", "toggle", "chip"];
await Promise.all(guideComponents.map(mountGuide));
document.dispatchEvent(new CustomEvent("s1:component-guide:ready", { detail: { components: guideComponents } }));
