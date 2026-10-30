/**
 * react-native-states.mjs — 정본(manifest.states)이 허용하는 상태를 갤러리·렌더 대조 조합으로 옮기는 표
 * --------------------------------------------------------------------------
 * 이 표는 값을 만들지 않는다. 상태 이름은 manifest.states 의 키 그대로이고, 표는 "그 상태를 웹에서는 이렇게 만들고
 * RN 에서는 이 prop 으로 만든다" 는 연결만 적는다. 새 상태·새 속성을 지어내지 않는다.
 *
 * 각 항목:
 *   label    조합 이름의 끝 토막
 *   covers   이 조합이 증명하는 manifest.states 키들
 *   props    RN 부품에 넘기는 값(partProps 로 안쪽 칸에 줄 수 있다)
 *   web      같은 조합을 웹 배포본 DOM 으로 만드는 방법
 *              attributes  루트 속성
 *              parts       [{ part, nth?, attrs?, force?, text?, remove? }] 안쪽 칸 고치기(nth 를 안 주면 그 칸 전부)
 *              force       루트 상태 강제(hover·pressed·focus)
 *   act      양쪽에서 똑같이 누르는 순서 [{ part, text?, nth? }] — 승인된 동작(선택·펼침)이 만드는 상태는 직접 눌러서 만든다
 *
 * 완전성: buildCases 가 manifest.states 의 모든 키가 (이 표 · 자동 조합 · 승인 예제 안의 인스턴스) 중 어느 하나로 덮이는지 확인하고,
 * 덮이지 않는 키가 있으면 빌드를 멈춘다.
 */

const hover = (part) => ({ partProps: { [part]: { forceState: "hover" } }, web: { parts: [{ part, force: "hover" }] } });
const partDisabled = (part) => ({ partProps: { [part]: { disabled: true } }, web: { parts: [{ part, attrs: { disabled: "" } }] } });
const control = (attrs, props, extra = {}) => ({ props, web: { parts: [{ part: "control", attrs }] }, ...extra });

/** 컴포넌트 id → 항목 목록. 기본은 화면(break)마다 첫 템플릿에만 붙인다(only 로 좁히거나 everywhere 로 넓힌다). */
export const STATE_CASES = {
  checkbox: [
    { label: "hover", covers: ["hover"], ...hover("control") },
    { label: "checked", covers: ["checked"], ...control({ checked: "" }, { checked: true }) },
    { label: "disabled", covers: ["disabled"], ...control({ disabled: "" }, { disabled: true }) },
    { label: "disabledChecked", covers: ["disabledChecked"], ...control({ checked: "", disabled: "" }, { checked: true, disabled: true }) }
  ],
  radio: [
    { label: "hover", covers: ["hover"], ...hover("control") },
    { label: "selected", covers: ["selected"], ...control({ checked: "" }, { checked: true }) },
    { label: "disabled", covers: ["disabled"], ...control({ disabled: "" }, { disabled: true }) },
    { label: "disabledSelected", covers: ["disabledSelected"], ...control({ checked: "", disabled: "" }, { checked: true, disabled: true }) }
  ],
  toggle: [
    { label: "disabledOn", covers: ["disabledOn"], props: { disabled: true, "aria-checked": "true" }, web: { attributes: { "aria-checked": "true" }, disabled: true } }
  ],
  input: [
    { label: "filled", covers: ["filled"], props: { defaultValue: "입력한 내용" }, web: { parts: [{ part: "control", attrs: { value: "입력한 내용" } }] } },
    { label: "focus", covers: ["focus"], props: { forceState: "focus" }, web: { force: "focus", parts: [{ part: "control", force: "focus" }] } },
    { label: "error", covers: ["error"], props: { invalid: true }, web: { parts: [{ part: "control", attrs: { "aria-invalid": "true" } }] } },
    { label: "correct", covers: ["correct"], props: { "data-state": "correct" }, web: { attributes: { "data-state": "correct" } } },
    { label: "readOnly", covers: ["readOnly"], props: { readOnly: true }, web: { parts: [{ part: "control", attrs: { readonly: "" } }] } },
    { label: "disabled", covers: ["disabled"], props: { disabled: true }, web: { parts: [{ part: "control", attrs: { disabled: "" } }] } }
  ],
  textarea: [
    { label: "focus", covers: ["focus"], props: { forceState: "focus" }, web: { force: "focus", parts: [{ part: "control", force: "focus" }] } },
    { label: "filled", covers: ["filled"], props: { defaultValue: "입력한 내용" }, web: { parts: [{ part: "control", text: "입력한 내용" }] } },
    { label: "disabled", covers: ["disabled"], props: { disabled: true }, web: { parts: [{ part: "control", attrs: { disabled: "" } }] } },
    { label: "readonly", covers: ["readonly"], props: { readOnly: true }, web: { parts: [{ part: "control", attrs: { readonly: "" } }] } }
  ],
  select: [
    { label: "hover", covers: ["hover"], ...hover("trigger") },
    { label: "filled", covers: ["filled"], act: [{ part: "trigger" }, { part: "option", text: "서울" }] },
    { label: "disabled", covers: ["disabled"], ...partDisabled("trigger") }
  ],
  "date-picker": [
    { label: "hover", covers: ["hover"], ...hover("trigger") },
    { label: "filled", covers: ["filled"], act: [{ part: "trigger" }, { part: "cell", text: "15" }], actRange: [{ part: "cell", text: "18" }] },
    { label: "disabled", covers: ["disabled"], ...partDisabled("trigger") }
  ],
  "time-picker": [
    { label: "hover", covers: ["hover"], ...hover("trigger") },
    { label: "filled", covers: ["filled"], act: [{ part: "trigger" }, { part: "cell", text: "05", nth: 0 }, { part: "cell", text: "30", nth: 0 }, { part: "confirm" }], only: "pc" },
    { label: "disabled", covers: ["disabled"], ...partDisabled("trigger") }
  ],
  "filter-chip": [
    { label: "hover", covers: ["hover"], ...hover("trigger") },
    { label: "complete", covers: ["complete"], act: [{ part: "trigger" }, { part: "option", text: "인기순" }] },
    { label: "disabled", covers: ["disabled"], ...partDisabled("trigger") }
  ],
  dropdown: [
    { label: "hover", covers: ["hover"], ...hover("option") }
  ],
  tab: [
    { label: "hover", covers: ["hover"], ...hover("tab") }
  ],
  "multi-toggle": [
    { label: "hover", covers: ["hover"], ...hover("cell") },
    {
      label: "disabled", covers: ["disabled"],
      props: { cells: [{ content: "왼쪽" }, { content: "가운데", attrs: { "aria-disabled": "true" } }, { content: "오른쪽" }] },
      web: { parts: [{ part: "cell", nth: 1, attrs: { "aria-disabled": "true" } }] }
    }
  ],
  table: [
    { label: "hover", covers: ["hover"], ...hover("row") },
    { label: "selected", covers: ["selected"], act: [{ part: "control", nth: 1 }] }
  ],
  pagination: [
    {
      label: "single", covers: ["single"],
      props: { totalPages: 1, pages: [{ content: "1", attrs: { "data-page": "1" } }] },
      web: { attributes: { "data-total-pages": "1" }, parts: [{ part: "page", fromNth: 1, remove: true }] }
    },
    { label: "middle", covers: ["middle"], act: [{ part: "page", text: "3" }] },
    { label: "last", covers: ["last"], act: [{ part: "page", text: "6" }] }
  ],
  lnb: [
    { label: "collapsed", covers: ["collapsed"], props: { collapsed: true }, web: { attributes: { "data-state": "collapsed" } } },
    { label: "hover", covers: ["hover"], ...hover("item") }
  ],
  gnb: [
    { label: "hover", covers: ["hover"], ...hover("menu") }
  ],
  "mobile-bottom-nav": [
    { label: "unselected", covers: ["unselected"], props: { "aria-selected": "false" }, web: { attributes: { "aria-selected": "false" } } }
  ],
  "expandable-card": [
    { label: "open", covers: ["open"], act: [{ part: "header" }] },
    { label: "hover", covers: ["hover"], ...hover("header") }
  ],
  modal: [{ label: "closed", covers: ["closed"], props: { open: false }, closed: true }],
  "modal-content": [{ label: "closed", covers: ["closed"], props: { open: false }, closed: true }],
  "bottom-sheet": [{ label: "closed", covers: ["closed"], props: { open: false }, closed: true }]
};

/** 표 밖에서 덮이는 상태 — 이유를 적는다. 앞 토막이 label: 이면 실제로 그 조합이 생성됐는지 buildCases 가 확인한다. */
export const STATE_ALSO = {
  "assist-button": { default: "axes", hover: "label:hover", pressed: "label:pressed", disabled: "label:disabled" },
  button: { default: "axes", hover: "label:hover", pressed: "label:pressed", disabled: "label:disabled" },
  "text-button": { default: "axes", hover: "label:hover", pressed: "label:pressed", disabled: "label:disabled" },
  chip: { default: "axes", hover: "label:hover", selected: "label:aria-pressed=true", disabled: "label:disabled" },
  toggle: { off: "axes", on: "label:aria-checked=true", disabled: "label:disabled" },
  checkbox: { default: "axes" },
  radio: { default: "axes" },
  input: { default: "axes" },
  textarea: { default: "axes" },
  select: { default: "axes", open: "label:open" },
  "date-picker": { default: "axes", open: "label:open" },
  "time-picker": { default: "axes", focus: "label:open" },
  "filter-chip": { default: "axes", selected: "label:open" },
  dropdown: { default: "axes", selectedText: "example:text 유형 예제가 첫 옵션을 선택 상태로 둔다", selectedCheckbox: "example:checkbox 유형 예제가 '서울'을 체크 상태로 둔다" },
  tab: { default: "axes", selected: "example:예제의 첫 탭이 aria-selected=true" },
  "multi-toggle": { default: "axes", selected: "example:예제의 첫 칸이 aria-checked=true" },
  table: { default: "axes" },
  pagination: { first: "axes", selected: "axes" },
  "list-row": { default: "axes", pressed: "label:pressed", disabled: "label:disabled" },
  lnb: { expanded: "axes", current: "example:예제의 항목이 aria-current=page", disabled: "example:예제의 '준비 중' 항목이 aria-disabled=true" },
  gnb: { default: "axes", selected: "example:예제의 '공지사항' 메뉴가 aria-current=page" },
  "gnb-sub-menu-item": { default: "axes", hover: "label:hover", selected: "example:2depth 예제가 aria-current=page" },
  "mobile-bottom-nav": { selected: "axes" },
  "expandable-card": { closed: "axes" },
  "bottom-sheet-option": { default: "example:유형별 예제 인스턴스", selected: "example:유형별 예제 인스턴스(data-state=selected)", disabled: "example:유형별 예제 인스턴스(data-state=disabled)" },
  "bottom-sheet": { open: "axes" },
  modal: { open: "axes" },
  "modal-content": { open: "axes" },
  "data-tag": { default: "axes" },
  divider: { default: "axes" },
  footer: { default: "axes" },
  ci: { default: "axes" },
  "login-gnb": { default: "axes" }
};
