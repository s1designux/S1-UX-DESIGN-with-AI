export const componentId = "lnb";
export const jsRequired = true;

const instances = new WeakMap();
/* 마우스를 올려 두고 이만큼 머물러야 펼친다 — 판을 스쳐 지나갈 때마다 펼쳐지지 않게. */
const HOVER_DELAY = 120;

/* 하위메뉴를 가진 항목(button[aria-expanded][aria-controls])의 여닫이와, 우측 상단 접기 단추(collapse)를 맞춘다.
   여닫는 것은 aria-expanded ↔ 하위 목록의 hidden, 접는 것은 aria-pressed ↔ 루트 data-state 다.
   접힘 상태에서는 하위 목록이 CSS 로 감춰지므로(display:none) 트리거의 aria-expanded 도 닫힘으로 맞추고,
   열려 있던 것은 remembered 에 기억해 두었다가 다시 펼치면 이어서 연다.
   준비 중 항목([aria-disabled=true])은 눌러도 동작하지 않고(click·Enter 취소) 탭 순서에서도 뺀다(date-picker 의 비활성 칸과 같은 관례: tabIndex -1).
   잠깐 펼침(peek, river 2026-10-21) — 접힌 상태에서 하위메뉴를 가진 항목을 누르거나 마우스를 잠시(HOVER_DELAY) 올려 두면 펼침 모습 그대로 판을 잠깐 펼치고 그 하위메뉴를 연다.
   마우스가 판을 떠나거나, 초점이 판 밖으로 나가거나, Esc 를 누르면 다시 접힌 모습으로 돌아간다.
   잠깐 펼친 동안 루트는 data-state=expanded + data-peek 이고, 사용자가 고른 상태는 여전히 접힘이다(collapsed 는 true, 접기 단추 aria-pressed 도 true).
   이때 접기 단추를 누르면 바로 접힌 모습으로 돌아간다.
   펼치면 칸 높이가 달라져 마우스 아래에 다른 메뉴가 놓인다 — 누른 메뉴에 초점과 표시(data-peek-focus)를 주고,
   마우스를 실제로 움직이기 전까지는 다른 칸의 호버 표시를 막는다(root data-peek-hold, river 2026-10-21). */
export function init(root) {
  if (!(root instanceof Element) || root.dataset.s1Component !== componentId) return null;
  if (instances.has(root)) return instances.get(root);

  const doc = root.ownerDocument || document;
  const collapseButton = root.querySelector('[data-s1-part="collapse"]');

  const isCollapsed = () => root.getAttribute("data-state") === "collapsed";
  let peeking = false;

  const triggers = () => root.querySelectorAll('[data-s1-part="item"][aria-controls][aria-expanded]');
  const remembered = new Set();
  const paintExpanded = (trigger, open) => {
    const panel = doc.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  };
  /* 접힘 ↔ 표출 일치 — 접히면 열린 트리거를 기억하고 닫힘 표시, 펼치면 기억한 것을 다시 연다. */
  const syncCollapsedDisclosure = () => {
    if (isCollapsed()) {
      for (const t of triggers()) {
        if (t.getAttribute("aria-expanded") === "true") { remembered.add(t); paintExpanded(t, false); }
      }
    } else {
      for (const t of remembered) paintExpanded(t, true);
      remembered.clear();
    }
  };

  /* 잠깐 펼침 — 펼친 모습으로 바꾸되 사용자가 고른 접힘은 그대로 둔다(이벤트 없음). */
  const startPeek = (trigger, { focus = true } = {}) => {
    peeking = true;
    root.setAttribute("data-peek-enter", "");
    root.setAttribute("data-peek", "");
    root.setAttribute("data-state", "expanded");
    syncCollapsedDisclosure();
    setExpanded(trigger, true);
    markPeekFocus(trigger);
    root.setAttribute("data-peek-hold", "");
    /* 마우스만 올려 펼친 경우는 초점을 옮기지 않는다 — 옮기면 누르지도 않았는데 초점 테두리가 뜬다. */
    if (focus) trigger.focus({ preventScroll: true });
    /* 출발점(투명)을 한 번 그린 뒤 떼어 글자가 서서히 나타나게 한다. */
    void root.offsetWidth;
    requestAnimationFrame(() => root.removeAttribute("data-peek-enter"));
  };
  const markPeekFocus = (trigger) => {
    for (const marked of root.querySelectorAll("[data-peek-focus]")) marked.removeAttribute("data-peek-focus");
    if (trigger) trigger.setAttribute("data-peek-focus", "");
  };
  const releaseHold = () => {
    if (!root.hasAttribute("data-peek-hold")) return;
    root.removeAttribute("data-peek-hold");
    markPeekFocus(null);
  };
  const endPeek = () => {
    if (!peeking) return;
    peeking = false;
    releaseHold();
    root.removeAttribute("data-peek-enter");
    root.removeAttribute("data-peek");
    root.setAttribute("data-state", "collapsed");
    syncCollapsedDisclosure();
  };

  const setCollapsed = (next) => {
    const value = Boolean(next);
    if (peeking) {
      endPeek();
      if (value) return;
    }
    if (value === isCollapsed()) return;
    root.setAttribute("data-state", value ? "collapsed" : "expanded");
    if (collapseButton) collapseButton.setAttribute("aria-pressed", String(value));
    syncCollapsedDisclosure();
    root.dispatchEvent(new CustomEvent("s1:lnb:collapse", { bubbles: true, detail: { collapsed: value } }));
  };

  const setExpanded = (trigger, next) => {
    const panel = doc.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    const value = Boolean(next);
    if (isCollapsed()) {
      /* 접힌 동안은 하위 목록이 보이지 않으므로 표시는 닫힘으로 두고 펼칠 때 열 것만 기억한다. */
      if (value === remembered.has(trigger)) return;
      if (value) remembered.add(trigger); else remembered.delete(trigger);
      root.dispatchEvent(new CustomEvent("s1:lnb:toggle", { bubbles: true, detail: { trigger, expanded: value } }));
      return;
    }
    if (value === (trigger.getAttribute("aria-expanded") === "true")) return;
    trigger.setAttribute("aria-expanded", String(value));
    panel.hidden = !value;
    root.dispatchEvent(new CustomEvent("s1:lnb:toggle", { bubbles: true, detail: { trigger, expanded: value } }));
  };

  /* 처음 표시를 맞춘다 — aria-expanded 가 열림인데 hidden 이면(또는 반대) 하나로 정리한다. */
  for (const trigger of root.querySelectorAll('[data-s1-part="item"][aria-controls][aria-expanded]')) {
    const panel = doc.getElementById(trigger.getAttribute("aria-controls"));
    if (panel) panel.hidden = trigger.getAttribute("aria-expanded") !== "true";
  }
  if (collapseButton) collapseButton.setAttribute("aria-pressed", String(isCollapsed()));
  syncCollapsedDisclosure();
  for (const item of root.querySelectorAll('[data-s1-part="item"][aria-disabled="true"]')) item.tabIndex = -1;

  /* 포인터 누름 뒤에만 초점을 푼다 — 키보드 Enter/Space 의 click 은 detail 이 0 이다. */
  const byPointer = (event) => event.detail > 0;

  const handleClick = (event) => {
    const disabledItem = event.target.closest('[data-s1-part="item"][aria-disabled="true"]');
    if (disabledItem && root.contains(disabledItem)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const collapse = event.target.closest('[data-s1-part="collapse"]');
    if (collapse && root.contains(collapse)) {
      setCollapsed(!isCollapsed());
      if (byPointer(event) && collapse.matches(":hover")) collapse.blur();
      return;
    }
    const trigger = event.target.closest('[data-s1-part="item"][aria-controls][aria-expanded]');
    if (trigger && root.contains(trigger)) {
      if (isCollapsed()) {
        cancelHover();
        startPeek(trigger);
        return;
      }
      setExpanded(trigger, trigger.getAttribute("aria-expanded") !== "true");
      if (byPointer(event) && trigger.matches(":hover")) trigger.blur();
    }
  };
  root.addEventListener("click", handleClick);

  /* 마우스를 올려 두면 잠깐 펼침 — 하위메뉴를 가진 항목에 머물 때만. 펼친 뒤에는 평소처럼 누를 때만 여닫는다. */
  let hoverTimer = 0;
  const cancelHover = () => { clearTimeout(hoverTimer); hoverTimer = 0; };
  const handlePointerOver = (event) => {
    if (event.pointerType === "touch" || !isCollapsed()) return;
    const trigger = event.target.closest('[data-s1-part="item"][aria-controls][aria-expanded]');
    if (!trigger || !root.contains(trigger) || trigger.getAttribute("aria-disabled") === "true") return;
    cancelHover();
    hoverTimer = setTimeout(() => {
      hoverTimer = 0;
      if (isCollapsed() && trigger.matches(":hover")) startPeek(trigger, { focus: false });
    }, HOVER_DELAY);
  };
  const handlePointerOut = (event) => {
    const trigger = event.target.closest('[data-s1-part="item"][aria-controls][aria-expanded]');
    if (trigger && !(event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) cancelHover();
  };

  /* 잠깐 펼침 끝내기 — 마우스가 판을 떠날 때(터치는 떠남이 없어 초점·Esc 로 끝낸다). */
  const handlePointerLeave = (event) => {
    cancelHover();
    if (peeking && event.pointerType !== "touch") endPeek();
  };
  /* 마우스를 실제로 움직이면(펼침으로 생긴 칸 이동이 아니라) 표시를 풀고 평소 호버로 돌아간다. */
  const handlePointerMove = (event) => {
    if (event.movementX || event.movementY) releaseHold();
  };
  const handleFocusOut = (event) => {
    if (peeking && !(event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) && !root.matches(":hover")) endPeek();
  };
  const handleKeydown = (event) => {
    if (!peeking || event.key !== "Escape") return;
    const opened = event.target.closest?.('[data-s1-part="subitems"]');
    const owner = opened ? root.querySelector(`[aria-controls="${opened.id}"]`) : null;
    endPeek();
    if (owner) owner.focus();
  };
  root.addEventListener("pointerleave", handlePointerLeave);
  root.addEventListener("pointermove", handlePointerMove);
  root.addEventListener("pointerover", handlePointerOver);
  root.addEventListener("pointerout", handlePointerOut);
  root.addEventListener("focusout", handleFocusOut);
  root.addEventListener("keydown", handleKeydown);

  const api = Object.freeze({
    get collapsed() { return isCollapsed() || peeking; },
    get peeking() { return peeking; },
    collapse(next = true) { setCollapsed(next); },
    toggleCollapse() { setCollapsed(!isCollapsed()); },
    destroy() {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerover", handlePointerOver);
      root.removeEventListener("pointerout", handlePointerOut);
      cancelHover();
      root.removeEventListener("focusout", handleFocusOut);
      root.removeEventListener("keydown", handleKeydown);
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
