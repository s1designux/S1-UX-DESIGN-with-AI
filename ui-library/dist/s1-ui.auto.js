import { init as init_input } from "./components/input.js";
import { init as init_toggle } from "./components/toggle.js";
import { init as init_chip } from "./components/chip.js";
import { init as init_dropdown } from "./components/dropdown.js";
import { init as init_select } from "./components/select.js";
import { init as init_filterChip } from "./components/filter-chip.js";
export * as input from "./components/input.js";
export * as button from "./components/button.js";
export * as checkbox from "./components/checkbox.js";
export * as radio from "./components/radio.js";
export * as toggle from "./components/toggle.js";
export * as chip from "./components/chip.js";
export * as dropdown from "./components/dropdown.js";
export * as select from "./components/select.js";
export * as filterChip from "./components/filter-chip.js";

export function autoInit(scope = document) {
  const instances = [
    ...[...scope.querySelectorAll('[data-s1-component="input"]')].map((root) => init_input(root)),
    ...[...scope.querySelectorAll('[data-s1-component="toggle"]')].map((root) => init_toggle(root)),
    ...[...scope.querySelectorAll('[data-s1-component="chip"]')].map((root) => init_chip(root)),
    ...[...scope.querySelectorAll('[data-s1-component="dropdown"]')].map((root) => init_dropdown(root)),
    ...[...scope.querySelectorAll('[data-s1-component="select"]')].map((root) => init_select(root)),
    ...[...scope.querySelectorAll('[data-s1-component="filter-chip"]')].map((root) => init_filterChip(root))
  ];
  return Object.freeze(instances.filter(Boolean));
}
