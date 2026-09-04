import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import iconGeometryCheck from "../../scripts/ui-library-icon-geometry-check.js";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const checkOnly = process.argv.includes("--check");
const failures = [];
const read = (relative) => readFile(path.join(libraryRoot, relative), "utf8");

const build = spawnSync(process.execPath, [path.join(libraryRoot, "scripts/build.mjs"), "--check"], { encoding: "utf8" });
if (build.status !== 0) failures.push(`build freshness: ${build.stderr || build.stdout}`);

const componentIds = ["input", "button", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "filter-chip", "tab", "pagination", "textarea", "multi-toggle", "modal", "table", "mobile-bottom-nav", "mobile-header", "time-picker", "date-picker"];
const individualCss = [];
for (const id of componentIds) {
  const css = await read(`dist/components/${id}.css`);
  individualCss.push(`/* component:${id} */\n${css.trimEnd()}`);
  if (/#[0-9a-f]{3,8}\b/i.test(css)) failures.push(`${id}.css contains raw HEX`);
  if (/!important\b/.test(css)) failures.push(`${id}.css contains !important`);
  if (/(^|[,{]\s*)(body|html|input|button)(?=[\s,.:{#[])/m.test(css)) failures.push(`${id}.css contains an unscoped tag selector`);
  const example = await read(`dist/examples/${id}.html`);
  const manifest = JSON.parse(await read(`dist/components/${id}.manifest.json`));
  for (const field of ["id", "version", "status", "canonicalFingerprint", "rootSelector", "variants", "sizes", "states", "parts", "htmlContract", "cssContract", "dependencies", "icons", "a11y", "jsRequired"]) {
    if (!(field in manifest)) failures.push(`${id} manifest missing ${field}`);
  }
  if (manifest.htmlContract.distribution !== `examples/${id}.html`) failures.push(`${id} HTML contract distribution path differs from build output`);
  /* 플랫폼별 예제 — Mobile 크기·break 가 따로 있는 컴포넌트는 mobile 예제를 배포해야 한다.
     퍼블리셔가 Mobile 화면에서 PC 마크업을 복사하는 사고를 막는다(river 결정 2026-09-02). */
  if (manifest.breaks?.mobile?.length) {
    const spec = manifest.htmlContract.breakExamples?.mobile;
    if (!spec || spec.distribution !== `examples/${id}.mobile.html`) {
      failures.push(`${id} declares a mobile break but has no mobile example declaration`);
    } else {
      const mobileExample = await read(`dist/${spec.distribution}`).catch(() => "");
      if (!mobileExample) failures.push(`${id} mobile example is missing from the build output`);
      else {
        const size = mobileExample.match(/data-s1-component="[^"]+"[^>]*?data-size="([^"]+)"/)?.[1];
        if (!manifest.breaks.mobile.includes(size)) failures.push(`${id} mobile example size (${size}) is not a canonical mobile size`);
        if (manifest.htmlContract.requiredAttributes?.includes("data-break") && !mobileExample.includes('data-break="mobile"')) {
          failures.push(`${id} mobile example must declare data-break="mobile"`);
        }
        if (mobileExample === example) failures.push(`${id} mobile example is identical to the PC example`);
      }
    }
    const pcSize = example.match(/data-s1-component="[^"]+"[^>]*?data-size="([^"]+)"/)?.[1];
    if (!manifest.breaks.pc.includes(pcSize)) failures.push(`${id} PC example size (${pcSize}) is not a canonical PC size`);
  }
  if (manifest.cssContract.entry !== `components/${id}.css`) failures.push(`${id} CSS contract entry differs from build output`);
  if (id === "input" && manifest.jsRequired !== true) failures.push("input clear action requires the declared runtime");
  if (id === "input") {
    if (!manifest.actionStates?.hover?.includes("color/form-control/bg/hover")) failures.push("input suffix action hover contract is missing from manifest");
    if (!/@media\s*\(hover:\s*hover\)[\s\S]*?\[data-s1-part="action"\]:hover:not\(:disabled\)[\s\S]*?background:\s*var\(--color-form-control-bg-hover\)/.test(css)) {
      failures.push("input suffix action hover background is missing or not limited to hover-capable devices");
    }
  }
  if (id === "button" && manifest.jsRequired !== false) failures.push("button must remain jsRequired=false");
  if (id === "button") {
    const expectedBreaks = JSON.stringify({ pc: ["md", "xsm", "xxsm"], mobile: ["lg"] });
    if (JSON.stringify(manifest.breaks) !== expectedBreaks) failures.push("button manifest break-size mapping differs from canon");
    const expectedMinWidths = { md: "--sizing-80", xsm: "--sizing-64", xxsm: "--sizing-56", lg: "--sizing-80" };
    if (JSON.stringify(manifest.minWidths) !== JSON.stringify(expectedMinWidths)) failures.push("button manifest minimum widths differ from Figma canon");
    for (const [size, token] of Object.entries(expectedMinWidths)) {
      const rule = css.match(new RegExp(`\\[data-s1-component="button"\\]\\[data-size="${size}"\\]\\s*\\{([^}]*)\\}`));
      if (!rule || !rule[1].includes(`min-width: var(${token});`)) failures.push(`button ${size} minimum width is not explicit`);
    }
    const mobileLabelRule = css.match(/\[data-s1-component="button"\]\[data-size="lg"\] \[data-s1-part="label"\]\s*\{([^}]*)\}/);
    if (!mobileLabelRule || !/align-items:\s*center/.test(mobileLabelRule[1]) || !/justify-content:\s*center/.test(mobileLabelRule[1]) || !/width:\s*100%/.test(mobileLabelRule[1])) {
      failures.push("button mobile label centering contract is missing");
    }
  }
  if (id === "checkbox" || id === "radio") {
    if (manifest.jsRequired !== false) failures.push(`${id} must remain jsRequired=false; native semantics carry the behavior`);
    if (manifest.sizes.length) failures.push(`${id} has no canonical size axis; sizes must stay empty`);
    const control = `[data-s1-component="${id}"] [data-s1-part="control"]`;
    const base = css.match(new RegExp(`${control.replaceAll("[", "\\[").replaceAll("]", "\\]")}\\s*\\{([^}]*)\\}`));
    if (!base || !base[1].includes("width: var(--sizing-18);") || !base[1].includes("height: var(--sizing-18);")) {
      failures.push(`${id} control does not use the canonical 18px control box`);
    }
    if (!base || !base[1].includes("appearance: none;")) failures.push(`${id} control must replace the native paint to match canon`);
    if (!/@media\s*\(hover:\s*hover\)/.test(css)) failures.push(`${id} hover state must be limited to hover-capable devices`);
    if (!css.includes(":hover:not(:disabled):not(:checked)")) failures.push(`${id} hover must not override the canonical selected paint`);
    if (!css.includes("--color-control-bg-disabled") || !css.includes("--color-control-border-disabled")) {
      failures.push(`${id} disabled state is not bound to the canonical control tokens`);
    }
    if (!css.includes(":disabled:checked")) failures.push(`${id} canonical disabled+selected state is missing`);
    if (!/gap:\s*var\(--spacing-8\);/.test(css)) failures.push(`${id} label gap differs from canon`);
    if (!example.includes(`type="${id === "checkbox" ? "checkbox" : "radio"}"`)) failures.push(`${id} example must use the native control`);
    if (!("canonicalStateMap" in manifest)) failures.push(`${id} manifest must map canonical state names to web states`);
  }
  if (id === "checkbox") {
    if (!css.includes('mask: url("../assets/icons/check.svg")')) failures.push("checkbox check indicator does not use the registered canonical icon");
    if (!/height:\s*var\(--sizing-16\);/.test(css)) failures.push("checkbox check indicator size differs from canon");
    if (!css.includes("--color-control-bg-selected")) failures.push("checkbox checked background is not bound to the canonical token");
  }
  if (id === "radio") {
    if (!/height:\s*var\(--sizing-10\);/.test(css)) failures.push("radio dot size differs from canon");
    if (!css.includes("--color-control-indicator-selected-alt")) failures.push("radio dot is not bound to the canonical indicator token");
    const checkedRule = css.match(/\[data-s1-component="radio"\] \[data-s1-part="control"\]:checked\s*\{([^}]*)\}/);
    if (!checkedRule || !checkedRule[1].includes("background: var(--color-control-bg-default);")) {
      failures.push("radio selected state must keep the canonical default background");
    }
  }
  if (id === "toggle") {
    if (manifest.jsRequired !== true) failures.push("toggle aria-checked 전환은 선언된 런타임이 필요하다");
    if (manifest.sizes.length) failures.push("toggle has no canonical size axis; sizes must stay empty");
    if (!("canonicalStateMap" in manifest)) failures.push("toggle manifest must map canonical state names to web states");
    const track = css.match(/\[data-s1-component="toggle"\]\s*\{([^}]*)\}/);
    if (!track || !track[1].includes("width: var(--sizing-40);") || !track[1].includes("height: var(--sizing-20);")) {
      failures.push("toggle track differs from the canonical 40x20 geometry");
    }
    if (!track || !track[1].includes("border-radius: var(--radius-full);")) failures.push("toggle track radius differs from canon");
    if (!track || !track[1].includes("background: var(--color-control-indicator-unselected);")) failures.push("toggle off track is not bound to the canonical token");
    const knob = css.match(/\[data-s1-component="toggle"\] \[data-s1-part="knob"\]\s*\{([^}]*)\}/);
    if (!knob || !knob[1].includes("width: var(--sizing-16);") || !knob[1].includes("height: var(--sizing-16);")) {
      failures.push("toggle knob differs from the canonical 16px indicator");
    }
    if (!knob || !knob[1].includes("left: var(--spacing-2);")) failures.push("toggle off knob offset differs from canon");
    if (!/\[aria-checked="true"\]\s*\{[^}]*background:\s*var\(--color-control-bg-selected\);/.test(css)) {
      failures.push("toggle on track is not bound to the canonical selected token");
    }
    if (!/\[aria-checked="true"\] \[data-s1-part="knob"\]\s*\{[^}]*right:\s*var\(--spacing-2\);/.test(css)) {
      failures.push("toggle on knob must sit 2px from the right edge like canon");
    }
    if (!css.includes("--color-control-bg-disabled") || !css.includes("--color-control-indicator-disabled")) {
      failures.push("toggle disabled state is not bound to the canonical control tokens");
    }
    if (/transition|animation/.test(css)) failures.push("toggle must not add motion; the canonical component declares none");
    if (/\[data-s1-component="toggle"\][^{]*:hover/.test(css)) failures.push("toggle has no canonical hover variant");
    if (!example.includes('role="switch"')) failures.push("toggle example must expose role=switch");
  }
  if (id === "chip") {
    if (manifest.jsRequired !== true) failures.push("chip aria-pressed 전환은 선언된 런타임이 필요하다");
    if (JSON.stringify(manifest.variants) !== JSON.stringify(["line", "solid"])) failures.push("chip variants differ from canon");
    if (JSON.stringify(manifest.breaks) !== JSON.stringify({ pc: ["sm", "md"], mobile: ["sm"] })) failures.push("chip manifest break-size mapping differs from canon");
    if (!("canonicalStateMap" in manifest)) failures.push("chip manifest must map canonical state names to web states");
    const expectedSizes = [
      ["sm", "pc", "--sizing-28", "--font-size-12", "--spacing-16"],
      ["sm", "mobile", "--sizing-30", "--font-size-14", "--spacing-12"],
      ["md", "pc", "--sizing-34", "--font-size-14", "--spacing-16"]
    ];
    for (const [size, breakName, height, fontSize, padding] of expectedSizes) {
      const rule = css.match(new RegExp(`\\[data-s1-component="chip"\\]\\[data-size="${size}"\\]\\[data-break="${breakName}"\\]\\s*\\{([^}]*)\\}`));
      if (!rule) { failures.push(`chip ${breakName} ${size} size rule is missing`); continue; }
      if (!rule[1].includes(`height: var(${height});`)) failures.push(`chip ${breakName} ${size} height differs from canon`);
      if (!rule[1].includes(`font-size: var(${fontSize});`)) failures.push(`chip ${breakName} ${size} font size differs from canon`);
      if (!rule[1].includes(`padding-inline: var(${padding});`)) failures.push(`chip ${breakName} ${size} horizontal padding differs from canon`);
    }
    if (/\[data-size="md"\]\[data-break="mobile"\]/.test(css)) failures.push("chip must not define a Mobile MD combination; canon has none");
    if (!/border-radius:\s*var\(--radius-full\);/.test(css)) failures.push("chip radius differs from canon");
    if (!/border-width:\s*var\(--border-width-1\);/.test(css)) failures.push("chip border width differs from canon");
    if (!/@media\s*\(hover:\s*hover\)/.test(css)) failures.push("chip hover state must be limited to hover-capable devices");
    for (const variant of ["line", "solid"]) {
      if (!new RegExp(`\\[data-variant="${variant}"\\]:hover:not\\(:disabled\\):not\\(\\[aria-pressed="true"\\]\\)`).test(css)) {
        failures.push(`chip ${variant} hover must not override the canonical selected paint`);
      }
      if (!css.includes(`--color-chip-${variant}-bg-selected`) || !css.includes(`--color-chip-${variant}-label-selected`)) {
        failures.push(`chip ${variant} selected state is not bound to the canonical tokens`);
      }
      if (!css.includes(`--color-chip-${variant}-bg-disabled`) || !css.includes(`--color-chip-${variant}-label-disabled`)) {
        failures.push(`chip ${variant} disabled state is not bound to the canonical tokens`);
      }
    }
    if (!/\[data-variant="line"\]:hover[^{]*\{[^}]*\}/.test(css)) failures.push("chip line hover rule is missing");
    if (/--color-chip-solid-bg-selected-hover/.test(css)) failures.push("chip must not use a token the canonical builder never applies (solid selected hover)");
    if (!example.includes('aria-pressed=')) failures.push("chip example must expose the selected state through aria-pressed");
  }
  if (id === "dropdown") {
    if (manifest.jsRequired !== true) failures.push("dropdown option selection requires the declared runtime");
    if (JSON.stringify(manifest.variants) !== JSON.stringify(["text", "checkbox"])) failures.push("dropdown variants differ from canon");
    if (JSON.stringify(manifest.sizes) !== JSON.stringify(["xxsm", "xsm", "md"])) failures.push("dropdown sizes differ from canon");
    const expectedOptionSizes = [
      ["xxsm", "--sizing-28", "--font-size-12"],
      ["xsm", "--sizing-34", "--font-size-14"],
      ["md", "--sizing-44", "--font-size-14"]
    ];
    for (const [size, height, fontSize] of expectedOptionSizes) {
      const rule = css.match(new RegExp(`\\[data-s1-component="dropdown"\\]\\[data-size="${size}"\\] \\[data-s1-part="option"\\]\\s*\\{([^}]*)\\}`));
      if (!rule || !rule[1].includes(`height: var(${height});`) || !rule[1].includes(`font-size: var(${fontSize});`)) {
        failures.push(`dropdown ${size} option geometry differs from canon`);
      }
    }
    if (!css.includes("--color-dropdown-option-bg-hover") || !css.includes("--color-dropdown-option-label-hover")) {
      failures.push("dropdown hover is not bound to the canonical tokens");
    }
    if (!css.includes("--color-dropdown-option-label-selected")) failures.push("dropdown text-type selected is not bound to the canonical token");
    if (!example.includes('role="listbox"') || !example.includes('role="option"') || !example.includes('role="checkbox"')) {
      failures.push("dropdown example must demonstrate both text (listbox/option) and checkbox option roles");
    }
    if (!example.includes('data-s1-component="checkbox"')) failures.push("dropdown checkbox-type option must compose the core checkbox deployment, not duplicate it");
    if (/mixed/i.test(css) || /mixed/i.test(example)) failures.push("dropdown must not implement a mixed (indeterminate) select-all state; canon has none");
  }
  if (id === "select") {
    if (manifest.jsRequired !== true) failures.push("select open/close requires the declared runtime");
    if (JSON.stringify(manifest.sizes) !== JSON.stringify(["xxsm", "xsm", "md"])) failures.push("select sizes differ from canon");
    if (JSON.stringify(manifest.breaks) !== JSON.stringify({ pc: ["xxsm", "xsm", "md"], mobile: ["md"] })) failures.push("select break-size mapping differs from canon");
    if (!css.includes("var(--sizing-48)")) failures.push("select mobile md height is missing");
    if (!example.includes('aria-haspopup="listbox"')) failures.push("select example must expose aria-haspopup=listbox on the trigger");
    if (!example.includes('data-s1-component="dropdown"')) failures.push("select must compose the dropdown core panel, not duplicate its markup");
    if (!manifest.dependencies?.coreComponents?.includes("dropdown")) failures.push("select manifest must declare dropdown as a core dependency");
  }
  if (id === "filter-chip") {
    if (manifest.jsRequired !== true) failures.push("filter-chip open/close requires the declared runtime");
    if (JSON.stringify(manifest.variants) !== JSON.stringify(["line", "solid"])) failures.push("filter-chip variants differ from canon");
    if (JSON.stringify(manifest.breaks) !== JSON.stringify({ pc: ["sm", "md"], mobile: ["md"] })) failures.push("filter-chip break-size mapping differs from canon");
    if (!css.includes("var(--radius-full)")) failures.push("filter-chip radius differs from canon");
    if (!example.includes('aria-haspopup="listbox"')) failures.push("filter-chip example must expose aria-haspopup=listbox on the trigger");
    if (!example.includes('data-s1-component="dropdown"')) failures.push("filter-chip must compose the dropdown core panel, not duplicate its markup");
    if (!manifest.dependencies?.coreComponents?.includes("dropdown")) failures.push("filter-chip manifest must declare dropdown as a core dependency");
    if (example.includes('data-s1-component="filter-chip" data-variant="line" data-size="sm"') && !/data-s1-component="dropdown"[^>]*data-size="xsm"/.test(example)) {
      failures.push("filter-chip SM example must map its panel to dropdown size=xsm (SM→XSM, MD→XSM — river 결정 2026-09-01)");
    }
  }
  if (id === "textarea") {
    if (manifest.jsRequired !== false) failures.push("textarea must remain jsRequired=false; native field states carry the behavior");
    if (manifest.sizes.length) failures.push("textarea has no canonical size axis; sizes must stay empty");
    const control = css.match(/\[data-s1-component="textarea"\] \[data-s1-part="control"\]\s*\{([^}]*)\}/);
    if (!control || !control[1].includes("min-height: var(--sizing-80);")) failures.push("textarea control does not use the canonical 80px minimum height");
    if (!control || !control[1].includes("resize: vertical;")) failures.push("textarea must resize vertically only (river 결정 2026-09-02)");
    if (!control || !control[1].includes("padding: var(--spacing-12) var(--spacing-12) var(--spacing-10) var(--spacing-10);")) {
      failures.push("textarea control padding differs from canon");
    }
    if (!css.includes(":focus-within")) failures.push("textarea focus state is not bound via :focus-within");
    if (!css.includes("--color-form-control-bg-selected") || !css.includes("--color-form-control-border-selected")) {
      failures.push("textarea focus state is not bound to the canonical form-control tokens");
    }
    if (!css.includes("[readonly]")) failures.push("textarea readonly state is missing");
    if (!css.includes(":disabled")) failures.push("textarea disabled state is missing");
    if (!("canonicalStateMap" in manifest)) failures.push("textarea manifest must map canonical state names to web states");
    if (!example.includes("<textarea") || !example.includes('data-s1-part="control"')) failures.push("textarea example must use the native textarea control");
  }
  if (id === "multi-toggle") {
    if (manifest.jsRequired !== true) failures.push("multi-toggle roving tabindex and selection require the declared runtime");
    if (JSON.stringify(manifest.sizes) !== JSON.stringify(["md", "sm"])) failures.push("multi-toggle sizes differ from canon");
    if (!("canonicalStateMap" in manifest)) failures.push("multi-toggle manifest must map canonical state names to web states");
    const expectedSizes = [
      ["md", "--sizing-44", "--spacing-12", "--sizing-64"],
      ["sm", "--sizing-34", "--spacing-8", "--sizing-56"]
    ];
    for (const [size, height, padding, minWidth] of expectedSizes) {
      const rule = css.match(new RegExp(`\\[data-s1-component="multi-toggle"\\]\\[data-size="${size}"\\] \\[data-s1-part="cell"\\]\\s*\\{([^}]*)\\}`));
      if (!rule) { failures.push(`multi-toggle ${size} size rule is missing`); continue; }
      if (!rule[1].includes(`height: var(${height});`)) failures.push(`multi-toggle ${size} height differs from canon`);
      if (!rule[1].includes(`padding-inline: var(${padding});`)) failures.push(`multi-toggle ${size} padding differs from canon`);
      if (!rule[1].includes(`min-width: var(${minWidth});`)) failures.push(`multi-toggle ${size} minimum width differs from canon`);
    }
    if (!css.includes("--color-button-bg-secondary--default") || !css.includes("--color-button-bg-primary--default") || !css.includes("--color-button-bg-disabled")) {
      failures.push("multi-toggle is not bound to the canonical color/button tokens");
    }
    if (css.includes("--color-control-")) failures.push("multi-toggle must not use --color-control-* tokens; canon uses color/button/*");
    if (!/@media\s*\(hover:\s*hover\)/.test(css)) failures.push("multi-toggle hover state must be limited to hover-capable devices");
    if (!css.includes('[aria-checked="true"]')) failures.push("multi-toggle selected state must use aria-checked");
    if (!example.includes('role="radiogroup"') || !example.includes('role="radio"')) failures.push("multi-toggle example must expose radiogroup/radio roles");
    if (!example.includes('aria-checked="true"')) failures.push("multi-toggle example must show a selected cell");
    if (!/flex:\s*0 0 auto;/.test(css) || !/margin-left:\s*calc\(-1 \* var\(--border-width-1\)\)/.test(css)) {
      failures.push("multi-toggle cells must keep a fixed outer width and overlap shared borders without removing them");
    }
    if (/border-(?:left|right):\s*0;/.test(css)) failures.push("multi-toggle must not remove a shared border because selection would change a sibling width");
  }
  if (id === "tab") {
    if (!/\[data-s1-component="tab"\]::before[\s\S]*?bottom:\s*0[\s\S]*?height:\s*var\(--border-width-1\)/.test(css) || !/\[data-s1-part="tab"\][\s\S]*?padding:\s*0 var\(--spacing-16\) var\(--border-width-2\)/.test(css) || !/aria-selected="true"\]\s*::after/.test(css)) {
      failures.push("tab must draw the gray baseline and blue indicator from the same bottom edge while reserving indicator space");
    }
    if (/box-shadow:\s*inset 0 calc\(-1 \* var\(--border-width-1\)\)/.test(css) || /border-bottom:\s*var\(--border-width-2\)/.test(css)) failures.push("tab must not draw its baseline inside the reserved indicator space");
  }
  /* Modal — 정본 buildModalShell(4438). 변형은 Break × Footer 4가지뿐이고 크기·상태 축이 없다.
     PC 만 닫기(X)를 갖고 Mobile 은 갖지 않는다. 접근성은 river 표준안(2026-09-02) 범위를 계약으로 못박는다. */
  if (id === "modal") {
    if (manifest.jsRequired !== true) failures.push("modal open/close, focus trap and scroll lock require the declared runtime");
    if (manifest.sizes.length !== 0) failures.push("modal has no size axis in canon");
    if (JSON.stringify(manifest.variants) !== JSON.stringify(["single", "dual"])) failures.push("modal variants differ from canon Footer axis");
    for (const [breakName, width, gap] of [["pc", "360px", "--spacing-32"], ["mobile", "300px", "30px"]]) {
      const rule = css.match(new RegExp(`\\[data-s1-component="modal"\\]\\[data-break="${breakName}"\\] \\[data-s1-part="panel"\\]\\s*\\{([^}]*)\\}`));
      if (!rule) { failures.push(`modal ${breakName} panel rule is missing`); continue; }
      if (!rule[1].includes(`width: ${width};`)) failures.push(`modal ${breakName} panel width differs from canon`);
      const gapValue = gap.startsWith("--") ? `gap: var(${gap});` : `gap: ${gap};`;
      if (!rule[1].includes(gapValue)) failures.push(`modal ${breakName} panel gap differs from canon`);
    }
    if (!css.includes("var(--color-modal-panel-border)") || !css.includes("var(--shadow-raised)") || !css.includes("var(--color-surface-raised)")) {
      failures.push("modal panel is not bound to the canonical surface/border/shadow tokens");
    }
    if (!css.includes("var(--color-overlay)")) failures.push("modal dim must use the canonical color/overlay token");
    if (!/\[data-s1-part="panel"\]\s*\{[^}]*flex:\s*none;/.test(css)) failures.push("modal panel must keep its canonical fixed width even in a narrow container");
    if (!example.includes('role="dialog"') || !example.includes('aria-modal="true"') || !example.includes("aria-labelledby=")) {
      failures.push("modal example must expose dialog semantics with a labelled title");
    }
    if (!example.includes('data-s1-part="close"')) failures.push("modal PC example must include the canonical close button");
    const mobileExample = await read("src/components/modal/modal.mobile.example.html");
    if (mobileExample.includes('data-s1-part="close"')) failures.push("modal Mobile has no close button in canon");
    if (!mobileExample.includes('data-size="lg"')) failures.push("modal Mobile footer must reuse core Button LG");
    if (!example.includes('data-size="xxsm"')) failures.push("modal PC footer must reuse core Button XXSM");
  }
  /* Time Picker — 정본 buildTimePicker(트리거)·buildTimePickerDropdown(패널)·buildTimePickerCell(칸).
     전용 색 토큰 0개(form-control·dropdown semantic 재사용) — select 와 달리 dropdown 코어를 자식으로 조립하지 않는다. */
  if (id === "time-picker") {
    if (manifest.jsRequired !== true) failures.push("time-picker open/close, column list and confirm gating require the declared runtime");
    if (JSON.stringify(manifest.sizes) !== JSON.stringify(["xxsm", "xsm", "md"])) failures.push("time-picker sizes differ from canon");
    if (JSON.stringify(manifest.breaks) !== JSON.stringify({ pc: ["xxsm", "xsm", "md"], mobile: ["md"] })) failures.push("time-picker break-size mapping differs from canon");
    if (JSON.stringify(manifest.types) !== JSON.stringify(["24h", "12h"])) failures.push("time-picker types differ from canon");
    /* 목록 모드(패널·칸)는 여전히 dropdown 을 자식으로 조립하지 않는다 — 자체 열 구조를 소유한다는
       원래 계약(workflow-state.json public contract)은 유지한다. 모바일 휠 바텀시트가 button·tab 을
       조립하는 것은 다른 계약이라 여기서 막지 않는다(date-picker 모바일 시트와 동일 패턴, 2026-09-03 추가). */
    if (manifest.dependencies?.coreComponents?.includes("dropdown")) failures.push("time-picker must not compose the dropdown core as a child — it owns its own column structure (workflow-state.json public contract)");
    if (!css.includes("var(--color-dropdown-list-bg)") || !css.includes("var(--color-dropdown-option-bg-default)") || !css.includes("var(--color-dropdown-option-bg-selected)")) {
      failures.push("time-picker panel/cell must reuse the canonical dropdown semantic tokens");
    }
    if (!css.includes("var(--shadow-dropdown)")) failures.push("time-picker panel shadow must use the canonical shadow/dropdown token");
    if (!css.includes("121px") || !css.includes("194px")) failures.push("time-picker panel width must match the canonical 24h(121)/12h(194) literals");
    if (!example.includes('aria-haspopup="listbox"')) failures.push("time-picker example must expose aria-haspopup=listbox on the trigger");
    if (!example.includes('role="listbox"') || !(example.match(/data-column="/g) || []).length) {
      failures.push("time-picker example must declare listbox columns (data-column)");
    }
    if (!example.includes('data-type="24h"') || !example.includes('data-type="12h"')) {
      failures.push("time-picker example must demonstrate both 24h and 12h types");
    }
    if (!example.includes('data-s1-part="confirm"') || !example.includes("disabled")) {
      failures.push("time-picker example confirm button must start disabled until hour and minute are both selected");
    }
    if (css.includes("border:") && /\[data-s1-part="cell"\]\s*\{[^}]*border(?!-radius):/.test(css)) {
      failures.push("time-picker cell must not have a border — canon removed it 2026-06-30");
    }
  }

  const module = await import(`${pathToFileURL(path.join(libraryRoot, `dist/components/${id}.js`)).href}?check=${Date.now()}`);
  if (id === "input" && (module.jsRequired !== true || typeof module.init !== "function" || typeof module.destroy !== "function")) {
    failures.push("input runtime lifecycle is incomplete");
  }
  if (id === "button" && (module.jsRequired !== false || module.runtime !== null)) failures.push("button module unexpectedly requires runtime");
  if ((id === "checkbox" || id === "radio" || id === "textarea") && (module.jsRequired !== false || module.runtime !== null)) failures.push(`${id} module unexpectedly requires runtime`);
  if ((id === "toggle" || id === "chip" || id === "dropdown" || id === "select" || id === "filter-chip" || id === "tab" || id === "pagination" || id === "multi-toggle" || id === "modal" || id === "table" || id === "time-picker") && (module.jsRequired !== true || typeof module.init !== "function" || typeof module.destroy !== "function")) {
    failures.push(`${id} runtime lifecycle is incomplete`);
  }
}

const fullCss = await read("dist/s1-ui.css");
const expectedFullCss = `${individualCss.join("\n\n").replaceAll('url("../assets/icons/', 'url("./assets/icons/')}\n`;
if (fullCss !== expectedFullCss) failures.push("full and individual CSS source parity differs");

const iconManifest = JSON.parse(await read("dist/assets/icons/manifest.json"));
const removeIcon = iconManifest.icons.find(({ id }) => id === "remove");
if (!removeIcon || removeIcon.sourceKey !== "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7") failures.push("remove icon provenance is missing");
const paginationEdgeIcon = iconManifest.icons.find(({ id }) => id === "edge_set");
if (!paginationEdgeIcon || paginationEdgeIcon.sourceKey !== "606d0de897175059f133427bf62bb3635d18a860" || !paginationEdgeIcon.sourceBuilderSymbol.includes("CHEV_EDGE")) {
  failures.push("pagination first/last must use the registered Figma edge_set original asset");
}
const paginationExample = await read("src/components/pagination/pagination.example.html");
if (/[«‹›»]/.test(paginationExample) || !paginationExample.includes('data-icon="edge"') || !paginationExample.includes('data-icon="chevron"')) {
  failures.push("pagination examples must use original icon assets, not substitute text glyphs");
}
const paginationCss = await read("src/components/pagination/pagination.css");
if (!/data-s1-action="previous"[\s\S]*?data-s1-action="last"[\s\S]*?rotate\(180deg\)/.test(paginationCss) || /data-s1-action="first"[\s\S]*?rotate\(180deg\)/.test(paginationCss)) {
  failures.push("pagination must keep the canonical |< first-page icon and rotate only the last-page icon");
}
try { await access(path.join(libraryRoot, "dist/assets/icons/remove.svg")); } catch { failures.push("remove icon web asset is missing"); }
for (const icon of iconManifest.icons) {
  const iconSvg = await read(`dist/assets/icons/${icon.file}`);
  failures.push(...iconGeometryCheck.validateIconAsset(icon, iconSvg, `dist:${icon.id}`));
}
if (!iconGeometryCheck.runSelfTest()) failures.push("icon geometry checker adversarial self-test failed");

const fullModule = await import(`${pathToFileURL(path.join(libraryRoot, "dist/s1-ui.js")).href}?check=${Date.now()}`);
if (!fullModule.input || !fullModule.button || !fullModule.tab || !fullModule.pagination || !fullModule.textarea || !fullModule["multiToggle"]) failures.push("full JS metadata bundle omits a component export");

for (const relative of ["verification/empty-consumer.html", "verification/empty-consumer-individual.html"]) {
  const html = await read(relative);
  if (!html.includes("pretendard.min.css")) failures.push(`${relative} does not load the declared Pretendard dependency`);
  if (/\s(?:style|onclick|onchange)=/i.test(html)) failures.push(`${relative} contains an inline implementation`);
  if (!html.includes('data-action="clear"') || !html.includes("입력 내용 지우기")) failures.push(`${relative} omits the canonical Editing clear action`);
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]).filter((item) => item.startsWith("."));
  for (const reference of references) {
    const target = path.resolve(libraryRoot, path.dirname(relative), reference);
    try { await access(target); } catch { failures.push(`${relative} has a missing dependency: ${reference}`); }
  }
}

const fullFixture = await read("verification/empty-consumer.html");
const individualFixture = await read("verification/empty-consumer-individual.html");
const normalizedMain = (html) => (html.match(/<main>[\s\S]*?<\/main>/i)?.[0] || "").replace(/\s+/g, " ").trim();
if (!normalizedMain(fullFixture) || normalizedMain(fullFixture) !== normalizedMain(individualFixture)) {
  failures.push("full and individual consumer fixtures must use identical component DOM; only loading method may differ");
}

const packageData = JSON.parse(await read("package.json"));
for (const target of Object.values(packageData.exports)) {
  try { await access(path.join(libraryRoot, target)); } catch { failures.push(`package export missing: ${target}`); }
}

const guidePage = await readFile(path.join(repositoryRoot, "pages/components.html"), "utf8");
const guideModule = await readFile(path.join(repositoryRoot, "assets/js/ui-library-guide.js"), "utf8");
for (const marker of [
  "../ui-library/dist/s1-ui.css",
  "../ui-library/dist/assets/css/tokens.css",
  "../assets/js/ui-library-guide.js",
  "Approved Input guide",
  "Approved Button guide",
  "Approved Checkbox guide",
  "Approved Radio guide",
  "Approved Toggle guide",
  "Approved Chip guide"
]) {
  if (!guidePage.includes(marker)) failures.push(`components guide missing approved dist marker: ${marker}`);
}
for (const marker of [
  '../../ui-library/dist/s1-ui.js',
  '../../ui-library/dist/examples/${id}.html',
  '../../ui-library/dist/examples/${id}.mobile.html',
  '../../ui-library/dist/components/${id}.css',
  '../../ui-library/dist/components/${id}.js'
]) {
  if (!guideModule.includes(marker)) failures.push(`approved guide module missing source link: ${marker}`);
}
/* 플랫폼 화면 정합 — component-presentation-policy _meta.uiLibraryGuideLayout.platformParity
   (river 확정 2026-09-02). 화면이 아니라 소스에서 잡는 결정론 검사다. */
if (/platform-section-mobile">\s*<div class="preview-area">\s*(\$\{[^}]*\}\s*)?<p/.test(guideModule)) {
  failures.push("mobile preview must start like PC — no leading note paragraph (title-to-action gap must match PC)");
}
if (/Mobile도 PC와 같습니다/.test(guideModule)) {
  failures.push("remove the redundant 'Mobile is the same as PC' notes; the screen already shows it");
}
for (const match of guideModule.matchAll(/mobileSizes\s*=\s*\[\[\s*"[a-z-]+",\s*"([^"]*)"/g)) {
  if (match[1]) failures.push(`mobile size label "${match[1]}" must stay empty — a single-value axis is not shown as an axis`);
}
if (!/\.view-mobile \.platform-section-pc \+ \.platform-section-mobile[^{]*\{[^}]*margin-top:\s*0/.test(guidePage)) {
  failures.push("hidden sibling platform section must not leave a 24px top margin on the visible one");
}
if (!/function tabStateMatrix\(\)[\s\S]*?comp-action-top[\s\S]*?matrix-col-header-action/.test(guideModule)) {
  failures.push("Line Tab guide must use the standard Action title and separator block");
}
if (!/\.matrix-col-header-action\s*\{[^}]*font-size:\s*16px[^}]*font-weight:\s*700[^}]*color:\s*#16a34a/.test(guidePage)) {
  failures.push("all guide Action titles must use the prominent green title typography");
}
/* 색은 semantic 토큰이어야 한다 — 하드코딩 #111827 은 Preview Theme=dark 에서 어두운 카드에
   묻혀 블록 제목이 안 읽혔다(2026-09-03 Time Picker 다크 렌더에서 발견). 검사의 목적인
   "제목 강조"(16px·700)는 그대로 두고, 색만 토큰 경유로 못박는다(CLAUDE.md R01 HEX 금지와도 일치). */
if (!/\.variant-label\s*\{[^}]*color:\s*var\(--color-text-title-primary\)[^}]*font-size:\s*16px[^}]*font-weight:\s*700/.test(guidePage)) {
  failures.push("component type labels such as Line and Solid must use the prominent type title typography with a semantic color token (no hardcoded hex — unreadable in dark)");
}
if (!/\.comp-action-top\s*\{[^}]*gap:\s*12px[^}]*margin-bottom:\s*48px[^}]*padding-bottom:\s*24px/.test(guidePage)) {
  failures.push("all guide Action blocks must retain the shared generous separation before states");
}
if (!/\.uilg-tab-action-top\s*\{[^}]*gap:\s*24px[^}]*margin-bottom:\s*64px[^}]*padding-bottom:\s*40px/.test(guidePage)) {
  failures.push("Line Tab Action must use the expanded title-to-content, content-to-line, and Action-to-state separation");
}
const tabGuideSource = guideModule.match(/function tabStateMatrix\(\)[\s\S]*?function paginationMarkup/)?.[0] || "";
if (tabGuideSource.includes('matrix-row-label">상태')) {
  failures.push("Line Tab state matrix must not repeat the left-side 상태 label");
}
if (!tabGuideSource.includes('grid-template-columns:repeat(3,minmax(120px,1fr))') || !tabGuideSource.includes('tabStateItemMarkup')) {
  failures.push("Line Tab state matrix must align three single-tab states without a leading blank column");
}
if (!/function tabStateMatrix\(\)[\s\S]*?matrix-col-header[\s\S]*?uilg-size-dim/.test(guideModule)) {
  failures.push("Line Tab size labels must use the shared guide heading typography");
}
if (!/function paginationStateMatrix\(\)[\s\S]*?comp-action-top[\s\S]*?matrix-col-header-action/.test(guideModule)) {
  failures.push("Pagination guide must use the shared Action title and separator block");
}
const paginationGuideSource = guideModule.match(/function paginationMarkup\([\s\S]*?function paginationStateMatrix/)?.[0] || "";
if (!paginationGuideSource.includes("const beforeDisabled = page <= 1") || !paginationGuideSource.includes("const afterDisabled = page >= total") || (paginationGuideSource.match(/beforeDisabled \? \" disabled\"/g) || []).length !== 2 || (paginationGuideSource.match(/afterDisabled \? \" disabled\"/g) || []).length !== 2) {
  failures.push("Pagination guide must disable both leading or trailing controls at its page boundaries");
}
if (/PC 3크기\(MD 44 · SM 42 · XSM 40\) · Mobile SM 32/.test(guideModule)) {
  failures.push("Line Tab PC scope must not describe the Mobile content");
}

const guideDemoIndex = guideModule.indexOf('<section class="uilg-demo preview-area"');
const guideOverviewIndex = guideModule.indexOf('${overview(registry)}');
if (guideDemoIndex < 0 || guideOverviewIndex < 0 || guideDemoIndex >= guideOverviewIndex) {
  failures.push("actual behavior and states must appear before component documentation");
}
if (!/<section class="comp-section" id="input"[^>]*><\/section>/.test(guidePage)) failures.push("Input guide mount must not retain legacy duplicate markup");
if (!/<section class="comp-section is-active" id="button"[^>]*><\/section>/.test(guidePage)) failures.push("Button guide mount must not retain legacy duplicate markup");
for (const id of ["checkbox", "radio", "toggle", "chip"]) {
  if (!new RegExp(`<section class="comp-section" id="${id}"[^>]*><\\/section>`).test(guidePage)) {
    failures.push(`${id} guide mount must not retain legacy duplicate markup`);
  }
}

/* 배포본 CSS 가 가리키는 자산이 실제로 dist 에 있는가 —
   2026-09-02 F-3 의 사각지대다. 알림 아이콘의 빨간 점 자산이 dist 에 복사되지 않아 마스크가 404 로
   실패했는데, 아이콘 검사기도 계약 검사기도 "등록된 아이콘"만 돌아서 아무도 못 잡았다.
   여기서는 반대로 **CSS 가 실제로 요구하는 것**에서 출발해 파일 존재를 확인한다. */
const cssUrlTargets = new Map();
for (const [relative, css] of [["s1-ui.css", await read("dist/s1-ui.css")], ...await Promise.all(componentIds.map(async (id) => [`components/${id}.css`, await read(`dist/components/${id}.css`)]))]) {
  for (const [, reference] of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (/^(data:|https?:|#)/.test(reference)) continue;
    const resolved = path.normalize(path.join(path.dirname(path.join(libraryRoot, "dist", relative)), reference));
    if (!cssUrlTargets.has(resolved)) cssUrlTargets.set(resolved, []);
    cssUrlTargets.get(resolved).push(`${relative} → ${reference}`);
  }
}
if (!cssUrlTargets.size) failures.push("dist CSS asset reference check found no url() references — 검사기가 무력화된 상태입니다");
for (const [target, referrers] of cssUrlTargets) {
  try {
    await access(target);
  } catch {
    failures.push(`dist CSS references a file that is not deployed: ${path.relative(path.join(libraryRoot, "dist"), target)} (${referrers.join(", ")})`);
  }
}

/* 렌더 검사 — 소스 문자열로는 못 보는 것(화면이 실제로 무엇을 보여주는가)을 실제 DOM 으로 본다.
   2026-09-02 독립 검증이 실증한 구멍 2개(G1 chip 인라인 크기 라벨 · G2 플랫폼 분기 무력화)를 막는다. */
const renderCheck = spawnSync(process.execPath, [path.join(repositoryRoot, "scripts/ui-guide-render-check.js"), "--quiet"], { encoding: "utf8" });
if (renderCheck.status !== 0) failures.push(`guide render check: ${(renderCheck.stderr || renderCheck.stdout || "").trim()}`);
/* 건너뛴 사실은 반드시 눈에 보여야 한다 — 크롬 없는 환경 + S1_SKIP_RENDER_CHECK 조합에서
   렌더 검사가 통째로 사라졌는데 "PASS" 로만 보이던 문제(2026-09-02 재검증 지적). */
else if (renderCheck.stdout.trim()) console.log(`[guide render check] ${renderCheck.stdout.trim()}`);

if (failures.length) {
  console.error(`UI library technical checks found ${failures.length} issue(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`UI library technical checks completed (${checkOnly ? "check mode" : "normal mode"}). Actual render and UX judgment remain separate; independent review follows the risk-based contract.`);
