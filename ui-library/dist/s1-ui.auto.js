import { init as initInput } from "./components/input.js";
export * as input from "./components/input.js";
export * as button from "./components/button.js";

export function autoInit(scope = document) {
  const roots = [...scope.querySelectorAll('[data-s1-component="input"]')];
  return Object.freeze(roots.map((root) => initInput(root)).filter(Boolean));
}
