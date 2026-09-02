export const componentId = "time-picker";
export const jsRequired = true;

const instances = new WeakMap();

function getParts(root) {
  return {
    trigger: root.querySelector('[data-s1-part="trigger"]'),
    value: root.querySelector('[data-s1-part="value"]'),
    panel: root.querySelector('[data-s1-part="panel"]'),
    columns: [...root.querySelectorAll('[data-s1-part="column"]')],
    confirm: root.querySelector('[data-s1-part="confirm"]')
  };
}

function isOpen(trigger) {
  return trigger.getAttribute("aria-expanded") === "true";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// 정본에 실제 목록 범위·간격 규정이 없다(1-inventory §E) — river 결정(D2): 분은 기본 1분 단위,
// data-minute-step 으로 소비자가 조절한다. 시 표기는 24h 2자리 / 12h 1~12(1-inventory 근거).
function buildItems(column, type) {
  if (column === "ampm") return ["오전", "오후"];
  if (column === "hour") {
    return type === "12h"
      ? Array.from({ length: 12 }, (_, i) => String(i + 1))
      : Array.from({ length: 24 }, (_, i) => pad2(i));
  }
  return []; // minute — step 은 호출부에서 처리
}

function buildMinuteItems(step) {
  const items = [];
  for (let m = 0; m < 60; m += step) items.push(pad2(m));
  return items;
}

function getCells(column) {
  return [...column.querySelectorAll('[data-s1-part="cell"]')];
}

function setActive(column, cell) {
  for (const c of getCells(column)) c.tabIndex = c === cell ? 0 : -1;
}

function selectedCell(column) {
  return getCells(column).find((c) => c.getAttribute("aria-selected") === "true") || null;
}

export function init(root) {
  if (!(root instanceof Element) || root.dataset.s1Component !== componentId) return null;
  if (instances.has(root)) return instances.get(root);

  const { trigger, value, panel, columns, confirm } = getParts(root);
  if (!trigger || !panel || !confirm || columns.length === 0) return null;

  const type = root.dataset.type === "12h" ? "12h" : "24h";
  const stepRaw = Number.parseInt(root.dataset.minuteStep, 10);
  const minuteStep = Number.isFinite(stepRaw) && stepRaw >= 1 && stepRaw <= 59 ? stepRaw : 1;

  const columnByKind = {};
  for (const column of columns) columnByKind[column.dataset.column] = column;

  // 마크업이 비어 있으면(기본 예시) 여기서 칸을 채운다. 이미 채워진 마크업(예: filled 데모)은 그대로 둔다.
  for (const column of columns) {
    if (getCells(column).length > 0) continue;
    const kind = column.dataset.column;
    const items = kind === "minute" ? buildMinuteItems(minuteStep) : buildItems(kind, type);
    for (const item of items) {
      const cell = document.createElement("div");
      cell.dataset.s1Part = "cell";
      cell.setAttribute("role", "option");
      cell.setAttribute("aria-selected", "false");
      cell.tabIndex = -1;
      cell.dataset.value = item;
      cell.textContent = item;
      column.appendChild(cell);
    }
    const first = getCells(column)[0];
    if (first) first.tabIndex = 0;
  }
  for (const column of columns) {
    const sel = selectedCell(column);
    if (sel) setActive(column, sel);
  }

  if (!trigger.hasAttribute("aria-haspopup")) trigger.setAttribute("aria-haspopup", "listbox");
  if (!trigger.hasAttribute("aria-expanded")) trigger.setAttribute("aria-expanded", "false");
  panel.hidden = true;

  const requiredKinds = type === "12h" ? ["ampm", "hour", "minute"] : ["hour", "minute"];

  const syncConfirm = () => {
    const complete = requiredKinds.every((kind) => selectedCell(columnByKind[kind]));
    confirm.disabled = !complete;
  };
  syncConfirm();

  const formatValue = () => {
    const hour = selectedCell(columnByKind.hour)?.dataset.value;
    const minute = selectedCell(columnByKind.minute)?.dataset.value;
    if (hour == null || minute == null) return null;
    if (type === "12h") {
      const ampm = selectedCell(columnByKind.ampm)?.dataset.value ?? "";
      return { text: `${ampm} ${hour}:${minute}`.trim(), hour, minute, ampm };
    }
    return { text: `${hour}:${minute}`, hour, minute, ampm: null };
  };

  const close = ({ returnFocus = true } = {}) => {
    if (!isOpen(trigger)) return;
    trigger.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    document.removeEventListener("pointerdown", handleOutsidePointer, true);
    if (returnFocus) trigger.focus();
    root.dispatchEvent(new CustomEvent("s1:time-picker:close", { bubbles: true, detail: {} }));
  };

  const focusInitial = () => {
    for (const column of columns) {
      const target = selectedCell(column) || getCells(column)[0];
      if (target) {
        setActive(column, target);
        if (column === columns[0]) target.focus();
      }
    }
  };

  const open = () => {
    if (trigger.disabled || isOpen(trigger)) return;
    trigger.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    document.addEventListener("pointerdown", handleOutsidePointer, true);
    focusInitial();
    root.dispatchEvent(new CustomEvent("s1:time-picker:open", { bubbles: true, detail: {} }));
  };

  const handleOutsidePointer = (event) => {
    if (!root.contains(event.target)) close({ returnFocus: false });
  };

  const handleTriggerClick = () => {
    if (isOpen(trigger)) close();
    else open();
  };

  const handleTriggerKeydown = (event) => {
    if (trigger.disabled) return;
    if (event.key === "ArrowDown" && !isOpen(trigger)) {
      event.preventDefault();
      open();
    }
  };

  const selectCell = (column, cell) => {
    for (const c of getCells(column)) c.setAttribute("aria-selected", String(c === cell));
    setActive(column, cell);
    syncConfirm();
  };

  const moveFocus = (column, from, delta) => {
    const list = getCells(column);
    if (!list.length) return;
    const index = list.indexOf(from);
    const clamped = Math.min(Math.max((index < 0 ? 0 : index) + delta, 0), list.length - 1);
    const next = list[clamped];
    setActive(column, next);
    next.focus();
  };

  const moveColumn = (from, delta) => {
    const index = columns.indexOf(from);
    const target = columns[Math.min(Math.max(index + delta, 0), columns.length - 1)];
    if (!target || target === from) return;
    const active = selectedCell(target) || getCells(target)[0];
    if (active) {
      setActive(target, active);
      active.focus();
    }
  };

  const handleColumnClick = (event) => {
    const cell = event.target.closest('[data-s1-part="cell"]');
    if (!cell) return;
    const column = cell.closest('[data-s1-part="column"]');
    if (!column) return;
    selectCell(column, cell);
  };

  const handleColumnKeydown = (event) => {
    const cell = event.target.closest('[data-s1-part="cell"]');
    if (!cell) return;
    const column = cell.closest('[data-s1-part="column"]');
    if (!column) return;
    if (event.key === "ArrowDown") { event.preventDefault(); moveFocus(column, cell, 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveFocus(column, cell, -1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); moveColumn(column, 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); moveColumn(column, -1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectCell(column, cell); }
  };

  const handleConfirmClick = () => {
    const result = formatValue();
    if (!result) return;
    if (value) value.textContent = result.text;
    trigger.dataset.filled = "true";
    close();
    root.dispatchEvent(new CustomEvent("s1:time-picker:change", {
      bubbles: true,
      detail: { value: result.text, hour: result.hour, minute: result.minute, ampm: result.ampm, type }
    }));
  };

  // role=listbox 표준 패턴 — 패널 어디에 포커스가 있어도 Esc 로 닫고 트리거로 복귀한다.
  const handleRootKeydown = (event) => {
    if (event.key === "Escape" && isOpen(trigger)) {
      event.preventDefault();
      close();
    }
  };

  trigger.addEventListener("click", handleTriggerClick);
  trigger.addEventListener("keydown", handleTriggerKeydown);
  root.addEventListener("keydown", handleRootKeydown);
  panel.addEventListener("click", handleColumnClick);
  panel.addEventListener("keydown", handleColumnKeydown);
  confirm.addEventListener("click", handleConfirmClick);

  const disabledObserver = new MutationObserver(() => {
    if (trigger.disabled && isOpen(trigger)) close({ returnFocus: false });
  });
  disabledObserver.observe(trigger, { attributes: true, attributeFilter: ["disabled"] });

  const api = Object.freeze({
    get open() { return isOpen(trigger); },
    openPanel: open,
    closePanel: close,
    destroy() {
      trigger.removeEventListener("click", handleTriggerClick);
      trigger.removeEventListener("keydown", handleTriggerKeydown);
      root.removeEventListener("keydown", handleRootKeydown);
      panel.removeEventListener("click", handleColumnClick);
      panel.removeEventListener("keydown", handleColumnKeydown);
      confirm.removeEventListener("click", handleConfirmClick);
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
      disabledObserver.disconnect();
      instances.delete(root);
    }
  });
  instances.set(root, api);
  return api;
}

export function destroy(root) {
  instances.get(root)?.destroy();
}

export const runtime = Object.freeze({ init, destroy });
