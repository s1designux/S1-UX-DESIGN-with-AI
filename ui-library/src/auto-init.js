export * from "./index.js";

import { init as initInput } from "./components/input/input.js";
import { init as initToggle } from "./components/toggle/toggle.js";
import { init as initChip } from "./components/chip/chip.js";
import { init as initDropdown } from "./components/dropdown/dropdown.js";
import { init as initSelect } from "./components/select/select.js";
import { init as initFilterChip } from "./components/filter-chip/filter-chip.js";

export function autoInit(scope = document) {
  const instances = [
    ...[...scope.querySelectorAll('[data-s1-component="input"]')].map((root) => initInput(root)),
    ...[...scope.querySelectorAll('[data-s1-component="toggle"]')].map((root) => initToggle(root)),
    ...[...scope.querySelectorAll('[data-s1-component="chip"]')].map((root) => initChip(root)),
    ...[...scope.querySelectorAll('[data-s1-component="dropdown"]')].map((root) => initDropdown(root)),
    ...[...scope.querySelectorAll('[data-s1-component="select"]')].map((root) => initSelect(root)),
    ...[...scope.querySelectorAll('[data-s1-component="filter-chip"]')].map((root) => initFilterChip(root))
  ];
  return Object.freeze(instances.filter(Boolean));
}
