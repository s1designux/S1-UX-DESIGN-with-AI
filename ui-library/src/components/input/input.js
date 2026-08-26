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
  const handleFocusOut = () => requestAnimationFrame(update);
  const handleClear = () => {
    control.value = "";
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.focus();
    update();
    root.dispatchEvent(new CustomEvent("s1:input:clear", { bubbles: true, detail: { value: "" } }));
  };

  control.addEventListener("input", update);
  root.addEventListener("focusin", update);
  root.addEventListener("focusout", handleFocusOut);
  clearAction.addEventListener("click", handleClear);

  const api = Object.freeze({
    destroy() {
      control.removeEventListener("input", update);
      root.removeEventListener("focusin", update);
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
