import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const sourceRoot = path.join(libraryRoot, "src");
const distRoot = path.join(libraryRoot, "dist");
const verificationRoot = path.join(libraryRoot, "verification");
const checkOnly = process.argv.includes("--check");
const componentIds = ["input", "button"];

const read = (file) => readFile(file, "utf8");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

async function canonicalFingerprint(manifest) {
  const digest = createHash("sha256");
  for (const relative of manifest.canonicalSources) {
    digest.update(`${relative}\0`);
    digest.update(await read(path.join(repositoryRoot, relative)));
    digest.update("\0");
  }
  return digest.digest("hex");
}

async function createOutputs() {
  const packageData = JSON.parse(await read(path.join(libraryRoot, "package.json")));
  const tokenMap = await read(path.join(sourceRoot, "component-token-map.json"));
  const tokensCss = await read(path.join(repositoryRoot, "assets/css/tokens.css"));
  const typographyCss = await read(path.join(repositoryRoot, "assets/css/typography.css"));
  const componentOutputs = [];
  const outputs = new Map();

  for (const id of componentIds) {
    const base = path.join(sourceRoot, "components", id);
    const manifest = JSON.parse(await read(path.join(base, "manifest.json")));
    const actualFingerprint = await canonicalFingerprint(manifest);
    if (manifest.canonicalFingerprint !== actualFingerprint) {
      throw new Error(`${id} canonicalFingerprint is stale. Review canon changes before rebuilding.`);
    }
    const css = await read(path.join(base, `${id}.css`));
    const js = await read(path.join(base, `${id}.js`));
    const example = await read(path.join(base, `${id}.example.html`));
    const sourceFingerprint = hash([css, js, example, stableJson(manifest)].join("\0"));
    const outputManifest = { ...manifest, sourceFingerprint };
    componentOutputs.push({ id, css, js, example, manifest: outputManifest });
    outputs.set(`components/${id}.css`, css);
    outputs.set(`components/${id}.js`, js);
    outputs.set(`components/${id}.manifest.json`, stableJson(outputManifest));
    outputs.set(`examples/${id}.html`, example);
  }

  const bundleCss = `${componentOutputs.map(({ id, css }) => `/* component:${id} */\n${css.trimEnd()}`).join("\n\n")}\n`;
  const bundleJs = `${componentOutputs.map(({ id }) => `export * as ${id} from "./components/${id}.js";`).join("\n")}\n`;
  const autoJs = `${bundleJs}\n/** CSS-only pilot: there are no roots to initialize. */\nexport function autoInit() { return Object.freeze([]); }\n`;
  const canonicalFingerprintValue = hash(componentOutputs.map(({ manifest }) => manifest.canonicalFingerprint).join("\0"));
  const distManifest = {
    id: "s1-ui",
    version: packageData.version,
    status: "candidate",
    canonicalFingerprint: canonicalFingerprintValue,
    tokenMapFingerprint: hash(tokenMap),
    commonCssDependencies: ["assets/css/tokens.css", "assets/css/typography.css"],
    fontDependencies: [{ family: "Pretendard", source: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" }],
    commonCssFingerprints: {
      "assets/css/tokens.css": hash(tokensCss),
      "assets/css/typography.css": hash(typographyCss)
    },
    jsRequired: false,
    components: componentOutputs.map(({ id, manifest }) => ({
      id,
      version: manifest.version,
      status: manifest.status,
      jsRequired: manifest.jsRequired,
      canonicalFingerprint: manifest.canonicalFingerprint,
      sourceFingerprint: manifest.sourceFingerprint,
      css: `components/${id}.css`,
      js: `components/${id}.js`,
      example: `examples/${id}.html`
    })),
    bundleParity: {
      cssOrder: componentIds,
      source: "ui-library/src/components/*",
      rule: "Full and individual outputs are generated in this build invocation from identical source strings."
    }
  };

  outputs.set("s1-ui.css", bundleCss);
  outputs.set("s1-ui.js", bundleJs);
  outputs.set("s1-ui.auto.js", autoJs);
  outputs.set("assets/css/tokens.css", tokensCss);
  outputs.set("assets/css/typography.css", typographyCss);
  outputs.set("component-token-map.json", tokenMap);
  outputs.set("manifest.json", stableJson(distManifest));
  outputs.set("../verification/empty-consumer.html", await read(path.join(sourceRoot, "verification", "empty-consumer.html")));
  outputs.set("../verification/empty-consumer-individual.html", await read(path.join(sourceRoot, "verification", "empty-consumer-individual.html")));
  outputs.set("../verification/bundle-parity.json", stableJson({
    status: "fixture",
    components: componentIds,
    fullCssSha256: hash(bundleCss),
    individualCssSha256: hash(componentOutputs.map(({ css }) => css).join("\0")),
    note: "Independent verification must render and judge parity; this file only records deterministic build inputs."
  }));
  return outputs;
}

async function writeOutputs(outputs) {
  await rm(distRoot, { recursive: true, force: true });
  await mkdir(distRoot, { recursive: true });
  await mkdir(verificationRoot, { recursive: true });
  for (const [relative, content] of outputs) {
    const target = path.resolve(distRoot, relative);
    if (!target.startsWith(`${libraryRoot}${path.sep}`)) throw new Error(`Unsafe output path: ${relative}`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}

async function checkOutputs(outputs) {
  const mismatches = [];
  for (const [relative, expected] of outputs) {
    const target = path.resolve(distRoot, relative);
    let actual;
    try { actual = await read(target); } catch { mismatches.push(`${relative}: missing`); continue; }
    if (actual !== expected) mismatches.push(`${relative}: stale`);
  }
  let existing = [];
  try {
    const walk = async (directory, prefix = "") => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const relative = path.join(prefix, entry.name);
        if (entry.isDirectory()) await walk(path.join(directory, entry.name), relative);
        else existing.push(relative);
      }
    };
    await walk(distRoot);
  } catch { /* missing dist is reported above */ }
  const expectedDist = new Set([...outputs.keys()].filter((item) => !item.startsWith("../")));
  for (const relative of existing) if (!expectedDist.has(relative)) mismatches.push(`${relative}: unexpected dist file`);
  if (mismatches.length) throw new Error(`Generated outputs differ:\n- ${mismatches.join("\n- ")}`);
}

const outputs = await createOutputs();
if (checkOnly) await checkOutputs(outputs);
else await writeOutputs(outputs);
console.log(`UI library build ${checkOnly ? "checked" : "generated"}: ${outputs.size} files.`);
