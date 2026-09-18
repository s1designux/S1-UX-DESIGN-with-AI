/* ============================================================
   Pattern Builder · ui.js — 빌더 화면(도구 UI)이 쓰는 정본 부품 마크업
   ------------------------------------------------------------
   빌더가 손으로 그린 버튼·입력칸·드롭다운·탭·칩을 없애고,
   ui-library/dist 배포본의 htmlContract 그대로를 쓴다.
   - 여기서 만드는 마크업은 각 부품의 dist example 구조와 같다(새 구조를 지어내지 않는다).
   - 동작(열고 닫기·선택·키보드)은 dist 런타임이 맡는다. 빌더는 값만 읽고 쓴다.
   ============================================================ */
import { init as initSelect } from "../ui-library/dist/components/select.js";
import { init as initInput } from "../ui-library/dist/components/input.js";
import { init as initTab } from "../ui-library/dist/components/tab.js";
import { init as initMultiToggle } from "../ui-library/dist/components/multi-toggle.js";
import { init as initChip } from "../ui-library/dist/components/chip.js";
import { init as initModalContent } from "../ui-library/dist/components/modal-content.js";

export const esc = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export const escAttr = (v) => esc(v).replaceAll('"', "&quot;");
const attrs = (o = {}) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== "")
  .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escAttr(v)}"`)).join("");

/* ── Button — examples/button.html ── */
export function buttonHtml(label, { variant = "secondary", size = "xxsm", ...rest } = {}) {
  return `<button type="button" data-s1-component="button" data-variant="${variant}" data-size="${size}"${attrs(rest)}><span data-s1-part="label">${esc(label)}</span></button>`;
}

/* ── Text Button — examples/text-button.html ── */
export function textButtonHtml(label, { variant = "secondary", ...rest } = {}) {
  return `<button type="button" data-s1-component="text-button" data-variant="${variant}"${attrs(rest)}><span data-s1-part="label">${esc(label)}</span></button>`;
}

/* ── Assist Button — examples/assist-button.html (좁은 자리의 보조 동작) ── */
export function assistButtonHtml(label, rest = {}) {
  return `<button type="button" data-s1-component="assist-button"${attrs(rest)}><span data-s1-part="label">${esc(label)}</span></button>`;
}

/* ── Chip — examples/chip.html (aria-pressed 로 선택을 표시한다) ── */
export function chipHtml(label, { pressed = false, variant = "line", size = "sm", brk = "pc", ...rest } = {}) {
  return `<button type="button" data-s1-component="chip" data-variant="${variant}" data-size="${size}" data-break="${brk}" aria-pressed="${pressed ? "true" : "false"}"${attrs(rest)}><span data-s1-part="label">${esc(label)}</span></button>`;
}

/* ── Input — examples/input.html ── */
export function inputHtml({ value = "", placeholder = "", label = "", type = "text", size = "xxsm", brk = "pc", control = {}, ...rest } = {}) {
  return `<div data-s1-component="input" data-size="${size}" data-break="${brk}"${attrs(rest)}>
    <div data-s1-part="field">
      <input type="${escAttr(type)}" data-s1-part="control" aria-label="${escAttr(label)}" placeholder="${escAttr(placeholder)}" value="${escAttr(value)}"${attrs(control)}>
      <button type="button" data-s1-part="action" data-action="clear" aria-label="입력 내용 지우기" hidden>
        <span data-s1-part="action-icon" aria-hidden="true"></span>
      </button>
    </div>
  </div>`;
}

/* ── Textarea — examples/textarea.html ── */
export function textareaHtml({ value = "", placeholder = "", label = "", brk = "pc", control = {}, ...rest } = {}) {
  return `<div data-s1-component="textarea" data-break="${brk}"${attrs(rest)}>
    <textarea data-s1-part="control" aria-label="${escAttr(label)}" placeholder="${escAttr(placeholder)}"${attrs(control)}>${esc(value)}</textarea>
  </div>`;
}

/* ── Select — examples/select.html (트리거 + dropdown 코어) ──
   options: [[value, label], …] · value: 지금 고른 값 */
export function selectHtml({ options = [], value = null, label = "", size = "xxsm", brk = "pc", ...rest } = {}) {
  const chosen = options.find(([v]) => String(v) === String(value)) || options[0] || ["", "선택"];
  const dropSize = size;                       // 배포 예제와 같은 짝 — 트리거 크기 = 목록 크기
  const opts = options.map(([v, l], i) => {
    const on = String(v) === String(chosen[0]);
    return `<div data-s1-part="option" role="option" aria-selected="${on}" tabindex="${on || (i === 0 && !options.some(([x]) => String(x) === String(chosen[0]))) ? "0" : "-1"}" data-value="${escAttr(v)}"><span data-s1-part="option-label">${esc(l)}</span></div>`;
  }).join("");
  return `<div data-s1-component="select" data-size="${size}" data-break="${brk}"${attrs(rest)}>
    <button type="button" data-s1-part="trigger" aria-haspopup="listbox" aria-expanded="false" data-filled="true">
      <span data-s1-part="value">${esc(chosen[1])}</span>
      <span data-s1-part="icon" aria-hidden="true"></span>
    </button>
    <div data-s1-part="panel" hidden>
      <div data-s1-component="dropdown" data-type="text" data-size="${dropSize}" role="listbox" aria-label="${escAttr(label)}">${opts}</div>
    </div>
  </div>`;
}

/* ── Multi Toggle — examples/multi-toggle.html (라디오 한 벌) ── */
export function multiToggleHtml({ items = [], value = null, label = "", size = "sm", ...rest } = {}) {
  const cells = items.map(([v, l], i) => {
    const on = value == null ? i === 0 : String(v) === String(value);
    return `<button type="button" data-s1-part="cell" role="radio" aria-checked="${on}" data-value="${escAttr(v)}">${esc(l)}</button>`;
  }).join("");
  return `<div data-s1-component="multi-toggle" data-size="${size}" role="radiogroup" aria-label="${escAttr(label)}"${attrs(rest)}>${cells}</div>`;
}

/* ── Tab — examples/tab.html. 패널은 탭 묶음 바깥에 두고(탭 묶음은 inline-flex 한 줄이다)
   화면이 s1:tab:change 를 받아 직접 여닫는다 — 패널 연결은 강제가 아니다(tab.js 는 못 찾으면 넘어간다). ── */
export function tabHtml({ items = [], value = null, label = "", size = "xsm", brk = "pc", ...rest } = {}) {
  const tabs = items.map(([v, l], i) => {
    const on = value == null ? i === 0 : String(v) === String(value);
    return `<button type="button" data-s1-part="tab" role="tab" aria-selected="${on}" data-value="${escAttr(v)}">${esc(l)}</button>`;
  }).join("");
  return `<div data-s1-component="tab" data-size="${size}" data-break="${brk}" role="tablist" aria-label="${escAttr(label)}"${attrs(rest)}>${tabs}</div>`;
}

/* ── Modal Content — examples/modal-content.html (제목 + 본문 + 버튼 2개) ── */
export function modalContentHtml({ id, titleId, title = "", bodyHtml = "", footerHtml = "", size = "md" } = {}) {
  return `<div data-s1-component="modal-content" data-size="${size}" data-footer="dual" id="${escAttr(id)}" hidden>
    <div data-s1-part="overlay"></div>
    <div data-s1-part="panel" role="dialog" aria-modal="true" aria-labelledby="${escAttr(titleId)}" tabindex="-1">
      <div data-s1-part="header">
        <h2 data-s1-part="title" id="${escAttr(titleId)}">${esc(title)}</h2>
        <button type="button" data-s1-part="close" aria-label="닫기"></button>
      </div>
      <div data-s1-part="content-area">
        <div data-s1-part="content">${bodyHtml}</div>
      </div>
      <div data-s1-part="footer">${footerHtml}</div>
    </div>
  </div>`;
}

/* ── 배포 런타임 물리기 — 도구 UI 안의 부품에 dist 동작을 붙인다 ──
   (미리보기 캔버스는 builder.js 가 autoInit 으로 따로 물린다) */
const INITS = [
  ['[data-s1-component="input"]', initInput],
  ['[data-s1-component="select"]', initSelect],
  ['[data-s1-component="tab"]', initTab],
  ['[data-s1-component="multi-toggle"]', initMultiToggle],
  ['[data-s1-component="chip"]', initChip]
];
export function mount(scope = document) {
  for (const [sel, init] of INITS) {
    scope.querySelectorAll(`${sel}:not([data-pb-static])`).forEach((root) => { try { init(root); } catch (e) { console.warn("mount", sel, e); } });
  }
  return scope;
}
export function mountModal(root) { return initModalContent(root); }

/* ── 값 읽기·쓰기 ── */
export const controlOf = (root) => root?.querySelector('[data-s1-part="control"]') || null;
export function selectValueOf(root) {
  return root?.querySelector('[data-s1-part="option"][aria-selected="true"]')?.dataset.value ?? null;
}
export function onSelectChange(root, fn) {
  root?.addEventListener("s1:select:change", (e) => fn(e.detail?.value, e));
}
/* 스크롤되는 칸 안에서 목록이 잘리지 않게, 열릴 때 보이는 자리로 끌어온다. */
export function keepOpenPanelVisible(scope = document) {
  scope.addEventListener("s1:select:open", (e) => {
    const root = e.target;
    requestAnimationFrame(() => root.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  });
}

/* 셀렉트의 접근 이름 — 트리거 안 글자가 "고른 값" 이라 aria-label 을 씌우면 값이 안 읽힌다.
   옆에 있는 라벨과 트리거를 이어 "서비스, 공통(core)" 처럼 읽히게 한다. */
let labelSeq = 0;
export function linkSelectLabels(scope = document) {
  scope.querySelectorAll(".pb-prop, .pb-field").forEach((row) => {
    const label = row.querySelector(".pb-prop-label, .pb-field-label");
    const trigger = row.querySelector('[data-s1-component="select"] [data-s1-part="trigger"]');
    if (!label || !trigger) return;
    if (!label.id) label.id = `pb-label-${++labelSeq}`;
    if (!trigger.id) trigger.id = `${label.id}-trigger`;
    /* 표 열처럼 묶음 제목이 따로 있으면 그 제목까지 이어 "열 2, 정렬, 가운데" 로 읽히게 한다. */
    const group = row.closest(".pb-col")?.querySelector(".pb-col-title");
    if (group && !group.id) group.id = `pb-label-${++labelSeq}`;
    trigger.removeAttribute("aria-label");
    trigger.setAttribute("aria-labelledby", `${group ? `${group.id} ` : ""}${label.id} ${trigger.id}`);
  });
}
