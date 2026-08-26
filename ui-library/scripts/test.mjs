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

const componentIds = ["input", "button"];
const individualCss = [];
for (const id of componentIds) {
  const css = await read(`dist/components/${id}.css`);
  individualCss.push(`/* component:${id} */\n${css.trimEnd()}`);
  if (/#[0-9a-f]{3,8}\b/i.test(css)) failures.push(`${id}.css contains raw HEX`);
  if (/!important\b/.test(css)) failures.push(`${id}.css contains !important`);
  if (/(^|[,{]\s*)(body|html|input|button)(?=[\s,.:{#[])/m.test(css)) failures.push(`${id}.css contains an unscoped tag selector`);
  const manifest = JSON.parse(await read(`dist/components/${id}.manifest.json`));
  for (const field of ["id", "version", "status", "canonicalFingerprint", "rootSelector", "variants", "sizes", "states", "parts", "htmlContract", "cssContract", "dependencies", "icons", "a11y", "jsRequired"]) {
    if (!(field in manifest)) failures.push(`${id} manifest missing ${field}`);
  }
  if (manifest.htmlContract.distribution !== `examples/${id}.html`) failures.push(`${id} HTML contract distribution path differs from build output`);
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
  const module = await import(`${pathToFileURL(path.join(libraryRoot, `dist/components/${id}.js`)).href}?check=${Date.now()}`);
  if (id === "input" && (module.jsRequired !== true || typeof module.init !== "function" || typeof module.destroy !== "function")) {
    failures.push("input runtime lifecycle is incomplete");
  }
  if (id === "button" && (module.jsRequired !== false || module.runtime !== null)) failures.push("button module unexpectedly requires runtime");
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

if (failures.length) {
  console.error(`UI library technical checks found ${failures.length} issue(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`UI library technical checks completed (${checkOnly ? "check mode" : "normal mode"}). Independent visual and UX judgment remains separate.`);
