import { init as init_input } from "./components/input.js";
import { init as init_toggle } from "./components/toggle.js";
import { init as init_chip } from "./components/chip.js";
export * as input from "./components/input.js";
export * as button from "./components/button.js";
export * as checkbox from "./components/checkbox.js";
export * as radio from "./components/radio.js";
export * as toggle from "./components/toggle.js";
export * as chip from "./components/chip.js";

export function autoInit(scope = document) {
  const instances = [
    ...[...scope.querySelectorAll('[data-s1-component="input"]')].map((root) => init_input(root)),
    ...[...scope.querySelectorAll('[data-s1-component="toggle"]')].map((root) => init_toggle(root)),
    ...[...scope.querySelectorAll('[data-s1-component="chip"]')].map((root) => init_chip(root))
  ];
  return Object.freeze(instances.filter(Boolean));
}
