export const componentId = "input";
export const jsRequired = true;

const instances = new WeakMap();

function refresh(root, control, clearAction) {
  const editable = !control.disabled && !control.readOnly;
  const editing = root.matches(":focus-within");
  clearAction.hidden = !(editable && editing && control.value.length > 0);
}

export function init(root) {
  if (!(root instanceof Element) || root.dataset.s1Component !== componentId) return null;
  if (instances.has(root)) return instances.get(root);

  const control = root.querySelector('[data-s1-part="control"]');
  const clearAction = root.querySelector('[data-s1-part="action"][data-action="clear"]');
  if (!(control instanceof HTMLInputElement) || !(clearAction instanceof HTMLButtonElement)) return null;

  const update = () => refresh(root, control, clearAction);

  /* 마우스·손가락으로 눌러 들어온 초점은 누른 자리에 커서를 둔다(드래그 선택도 그대로).
     키보드(Tab)로 들어온 초점만 값 끝으로 커서를 옮긴다. (river 지시 2026-09-04)

     판정은 "표식이 켜져 있나"가 아니라 "직전 포인터 조작이 방금이었나"로 한다.
     ① 표식이 켜진 채 굳는 경로가 없다(초점을 못 받는 자리를 눌러도 시간만 지나면 사라진다).
     ② 초점이 pointerdown 과 다른 task 에서 와도 된다 — 모바일은 손을 뗀 뒤 초점을 주는데,
        타이머로 표식을 지우면 그 탭이 '키보드'로 오인돼 글 중간을 눌러도 커서가 끝으로 튄다.
     ③ 화면이 숨겨져 타이머가 밀리는 환경에서도 판정이 흔들리지 않는다(같은 시계의 timeStamp 비교). */
  const POINTER_FOCUS_WINDOW_MS = 500;
  let lastPointerAt = -Infinity;
  const markPointer = (event) => { lastPointerAt = event.timeStamp; };
  const handleFocusIn = (event) => {
    const fromPointer = event.timeStamp - lastPointerAt < POINTER_FOCUS_WINDOW_MS;
    if (event.target === control && !fromPointer) {
      const end = control.value.length;
      if (end > 0) {
        try { control.setSelectionRange(end, end); } catch (_) { /* 캐럿을 못 옮기는 type 은 건너뛴다 */ }
      }
    }
    update();
  };
  const handleFocusOut = () => requestAnimationFrame(update);
  const handleClear = () => {
    control.value = "";
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.focus();
    update();
    root.dispatchEvent(new CustomEvent("s1:input:clear", { bubbles: true, detail: { value: "" } }));
  };

  control.addEventListener("input", update);
  root.addEventListener("pointerdown", markPointer);
  root.addEventListener("pointerup", markPointer);
  root.addEventListener("focusin", handleFocusIn);
  root.addEventListener("focusout", handleFocusOut);
  clearAction.addEventListener("click", handleClear);

  const api = Object.freeze({
    destroy() {
      control.removeEventListener("input", update);
      root.removeEventListener("pointerdown", markPointer);
      root.removeEventListener("pointerup", markPointer);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      clearAction.removeEventListener("click", handleClear);
      clearAction.hidden = true;
      instances.delete(root);
    },
    update
  });
  instances.set(root, api);
  update();
  return api;
}

export function destroy(root) {
  instances.get(root)?.destroy();
}

export const runtime = Object.freeze({ init, destroy });
