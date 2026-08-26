export * from "./index.js";

import { init as initInput } from "./components/input/input.js";

export function autoInit(scope = document) {
  const roots = [...scope.querySelectorAll('[data-s1-component="input"]')];
  return Object.freeze(roots.map((root) => initInput(root)).filter(Boolean));
}
