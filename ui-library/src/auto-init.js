export * from "./index.js";

import { init as initInput } from "./components/input/input.js";
import { init as initToggle } from "./components/toggle/toggle.js";
import { init as initChip } from "./components/chip/chip.js";
import { init as initDropdown } from "./components/dropdown/dropdown.js";
import { init as initSelect } from "./components/select/select.js";
import { init as initFilterChip } from "./components/filter-chip/filter-chip.js";
import { init as initTab } from "./components/tab/tab.js";
import { init as initPagination } from "./components/pagination/pagination.js";
import { init as initMultiToggle } from "./components/multi-toggle/multi-toggle.js";
import { init as initTable } from "./components/table/table.js";
import { init as initModal } from "./components/modal/modal.js";
import { init as initTimePicker } from "./components/time-picker/time-picker.js";

export function autoInit(scope = document) {
  const instances = [
    ...[...scope.querySelectorAll('[data-s1-component="input"]')].map((root) => initInput(root)),
    ...[...scope.querySelectorAll('[data-s1-component="toggle"]')].map((root) => initToggle(root)),
    ...[...scope.querySelectorAll('[data-s1-component="chip"]')].map((root) => initChip(root)),
    ...[...scope.querySelectorAll('[data-s1-component="dropdown"]')].map((root) => initDropdown(root)),
    ...[...scope.querySelectorAll('[data-s1-component="select"]')].map((root) => initSelect(root)),
    ...[...scope.querySelectorAll('[data-s1-component="filter-chip"]')].map((root) => initFilterChip(root)),
    ...[...scope.querySelectorAll('[data-s1-component="tab"]')].map((root) => initTab(root)),
    ...[...scope.querySelectorAll('[data-s1-component="pagination"]')].map((root) => initPagination(root)),
    ...[...scope.querySelectorAll('[data-s1-component="multi-toggle"]')].map((root) => initMultiToggle(root)),
    ...[...scope.querySelectorAll('[data-s1-component="table"]')].map((root) => initTable(root)),
    ...[...scope.querySelectorAll('[data-s1-component="modal"]')].map((root) => initModal(root)),
    ...[...scope.querySelectorAll('[data-s1-component="time-picker"]')].map((root) => initTimePicker(root))
  ];
  return Object.freeze(instances.filter(Boolean));
}
