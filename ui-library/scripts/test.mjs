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

const componentIds = ["input", "button", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "filter-chip"];
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
    if (!css.includes(":focus-visible")) failures.push(`${id} keyboard focus is not visible`);
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
    if (!css.includes(":focus-visible")) failures.push("toggle keyboard focus is not visible");
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
    if (!css.includes(":focus-visible")) failures.push("chip keyboard focus is not visible");
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
    if (!css.includes(":focus-visible")) failures.push("dropdown keyboard focus is not visible");
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
  const module = await import(`${pathToFileURL(path.join(libraryRoot, `dist/components/${id}.js`)).href}?check=${Date.now()}`);
  if (id === "input" && (module.jsRequired !== true || typeof module.init !== "function" || typeof module.destroy !== "function")) {
    failures.push("input runtime lifecycle is incomplete");
  }
  if (id === "button" && (module.jsRequired !== false || module.runtime !== null)) failures.push("button module unexpectedly requires runtime");
  if ((id === "checkbox" || id === "radio") && (module.jsRequired !== false || module.runtime !== null)) failures.push(`${id} module unexpectedly requires runtime`);
  if ((id === "toggle" || id === "chip" || id === "dropdown" || id === "select" || id === "filter-chip") && (module.jsRequired !== true || typeof module.init !== "function" || typeof module.destroy !== "function")) {
    failures.push(`${id} runtime lifecycle is incomplete`);
  }
}

const fullCss = await read("dist/s1-ui.css");
const expectedFullCss = `${individualCss.join("\n\n").replaceAll('url("../assets/icons/', 'url("./assets/icons/')}\n`;
if (fullCss !== expectedFullCss) failures.push("full and individual CSS source parity differs");

const iconManifest = JSON.parse(await read("dist/assets/icons/manifest.json"));
const removeIcon = iconManifest.icons.find(({ id }) => id === "remove");
if (!removeIcon || removeIcon.sourceKey !== "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7") failures.push("remove icon provenance is missing");
try { await access(path.join(libraryRoot, "dist/assets/icons/remove.svg")); } catch { failures.push("remove icon web asset is missing"); }
for (const icon of iconManifest.icons) {
  const iconSvg = await read(`dist/assets/icons/${icon.file}`);
  failures.push(...iconGeometryCheck.validateIconAsset(icon, iconSvg, `dist:${icon.id}`));
}
if (!iconGeometryCheck.runSelfTest()) failures.push("icon geometry checker adversarial self-test failed");

const fullModule = await import(`${pathToFileURL(path.join(libraryRoot, "dist/s1-ui.js")).href}?check=${Date.now()}`);
if (!fullModule.input || !fullModule.button) failures.push("full JS metadata bundle omits a component export");

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
