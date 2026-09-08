import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import iconGeometryCheck from "../../scripts/ui-library-icon-geometry-check.js";
import { buildPlatformOutputs } from "./platform.mjs";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const sourceRoot = path.join(libraryRoot, "src");
const distRoot = path.join(libraryRoot, "dist");
const verificationRoot = path.join(libraryRoot, "verification");
const checkOnly = process.argv.includes("--check");
const componentIds = ["input", "button", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "filter-chip", "tab", "pagination", "textarea", "multi-toggle", "modal", "table", "mobile-bottom-nav", "mobile-header", "time-picker", "date-picker", "assist-button", "text-button", "modal-content"];

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
  const iconManifest = JSON.parse(await read(path.join(sourceRoot, "assets/icons/manifest.json")));
  const iconRegistry = await read(path.join(repositoryRoot, iconManifest.sourceRegistry));
  if (hash(iconRegistry) !== iconManifest.sourceRegistryFingerprint) {
    throw new Error("icon source registry fingerprint is stale");
  }
  const allowedIconKeys = JSON.parse(iconRegistry).allowedRemoteComponentKeys;
  const iconAssets = [];
  for (const icon of iconManifest.icons) {
    // 파생 색 레이어는 자기 이름의 허용 key 를 갖지 않는다 — 부모 원본의 key 를 그대로 쓴다.
    const allowedKeyOwner = icon.derivedFrom ?? icon.id;
    if (allowedIconKeys[allowedKeyOwner] !== icon.sourceKey) throw new Error(`${icon.id} source key differs from the allowed registry`);
    const asset = await read(path.join(sourceRoot, "assets/icons", icon.file));
    if (hash(asset) !== icon.webAssetFingerprint) throw new Error(`${icon.id} web asset fingerprint is stale`);
    const geometryErrors = iconGeometryCheck.validateIconAsset(icon, asset);
    if (geometryErrors.length) throw new Error(`icon geometry contract failed:\n- ${geometryErrors.join("\n- ")}`);
    iconAssets.push({ ...icon, asset });
  }
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
    /* 플랫폼별 예제 — Mobile 크기·break 가 PC 와 다른 컴포넌트는 mobile 예제를 따로 낸다.
       manifest.htmlContract.breakExamples 가 선언한 것만 읽는다(선언 없으면 PC 1벌). */
    const breakExamples = manifest.htmlContract.breakExamples ?? {};
    const extraExamples = [];
    for (const [breakName, spec] of Object.entries(breakExamples)) {
      if (spec.distribution === `examples/${id}.html`) continue;
      const expected = `components/${id}/${id}.${breakName}.example.html`;
      if (spec.source !== expected) throw new Error(`${id} ${breakName} example source must be ${expected}`);
      if (spec.distribution !== `examples/${id}.${breakName}.html`) throw new Error(`${id} ${breakName} example distribution must be examples/${id}.${breakName}.html`);
      extraExamples.push([spec.distribution, await read(path.join(sourceRoot, spec.source))]);
    }
    const componentIconAssets = iconAssets.filter(({ id: iconId }) => manifest.icons.some(({ id: usedId }) => usedId === iconId));
    const sourceFingerprint = hash([css, js, example, ...extraExamples.map(([, text]) => text), stableJson(manifest), ...componentIconAssets.map(({ asset }) => asset)].join("\0"));
    const outputManifest = { ...manifest, sourceFingerprint };
    const exampleByBreak = { pc: example };
    for (const [breakName, spec] of Object.entries(breakExamples)) {
      const match = extraExamples.find(([distPath]) => distPath === spec.distribution);
      exampleByBreak[breakName] = match ? match[1] : example;
    }
    componentOutputs.push({ id, css, js, example, exampleByBreak, manifest: outputManifest });
    outputs.set(`components/${id}.css`, css);
    outputs.set(`components/${id}.js`, js);
    outputs.set(`components/${id}.manifest.json`, stableJson(outputManifest));
    outputs.set(`examples/${id}.html`, example);
    for (const [distPath, text] of extraExamples) outputs.set(distPath, text);
  }

  const toIdentifier = (id) => id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const bundleCss = `${componentOutputs.map(({ id, css }) => `/* component:${id} */\n${css.trimEnd().replaceAll('url("../assets/icons/', 'url("./assets/icons/')}`).join("\n\n")}\n`;
  const bundleJs = `${componentOutputs.map(({ id }) => `export * as ${toIdentifier(id)} from "./components/${id}.js";`).join("\n")}\n`;
  const runtimeIds = componentOutputs.filter(({ manifest }) => manifest.jsRequired).map(({ id }) => id);
  const autoImports = runtimeIds.map((id) => `import { init as init_${toIdentifier(id)} } from "./components/${id}.js";`).join("\n");
  const autoCalls = runtimeIds.map((id) => `    ...[...scope.querySelectorAll('[data-s1-component="${id}"]')].map((root) => init_${toIdentifier(id)}(root))`).join(",\n");
  const autoJs = `${autoImports}\n${bundleJs}\nexport function autoInit(scope = document) {\n  const instances = [\n${autoCalls}\n  ];\n  return Object.freeze(instances.filter(Boolean));\n}\n`;
  const canonicalFingerprintValue = hash(componentOutputs.map(({ manifest }) => manifest.canonicalFingerprint).join("\0"));
  const distManifest = {
    id: "s1-ui",
    version: packageData.version,
    status: "approved",
    canonicalFingerprint: canonicalFingerprintValue,
    tokenMapFingerprint: hash(tokenMap),
    commonCssDependencies: ["assets/css/tokens.css", "assets/css/typography.css"],
    fontDependencies: [{ family: "Pretendard", source: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" }],
    commonCssFingerprints: {
      "assets/css/tokens.css": hash(tokensCss),
      "assets/css/typography.css": hash(typographyCss)
    },
    jsRequired: componentOutputs.some(({ manifest }) => manifest.jsRequired),
    icons: iconManifest.icons,
    components: componentOutputs.map(({ id, manifest }) => ({
      id,
      version: manifest.version,
      status: manifest.status,
      jsRequired: manifest.jsRequired,
      canonicalFingerprint: manifest.canonicalFingerprint,
      sourceFingerprint: manifest.sourceFingerprint,
      css: `components/${id}.css`,
      js: `components/${id}.js`,
      example: `examples/${id}.html`,
      examples: Object.fromEntries(Object.entries(manifest.htmlContract.breakExamples ?? { pc: { distribution: `examples/${id}.html` } })
        .map(([breakName, spec]) => [breakName, spec.distribution]))
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
  outputs.set("assets/icons/manifest.json", stableJson(iconManifest));
  for (const icon of iconAssets) outputs.set(`assets/icons/${icon.file}`, icon.asset);
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

  /* 툴별 전달 산출물 — 같은 빌드·같은 지문에서 생성한다.
     dist 를 매번 통째로 지우므로 여기서 함께 만들지 않으면 조용히 낡는다. */
  const behaviorLedger = JSON.parse(await read(path.join(repositoryRoot, "registry/components/component-behavior.pc.json")));
  const platformOutputs = buildPlatformOutputs({
    componentOutputs,
    tokensCss,
    typographyCss,
    distManifest,
    behaviorLedger,
    fingerprints: {
      "assets/css/tokens.css": hash(tokensCss),
      "assets/css/typography.css": hash(typographyCss)
    }
  });
  for (const [relative, content] of platformOutputs) outputs.set(relative, content);

  /* 자가 검사기 — 판정 근거(HEX·rgba 금지)는 거버넌스 정본에서 뽑아 함께 배포한다.
     개발자 PC 에는 registry/ 가 없으므로, 규칙을 여기서 발췌해 넣지 않으면 검사기가 근거 없이 돌게 된다. */
  const auditRules = JSON.parse(await read(path.join(repositoryRoot, "registry/governance/audit-rules.json")));
  const ruleById = (ruleId) => {
    const found = auditRules.rules.find(({ id }) => id === ruleId);
    if (!found) throw new Error(`audit-rules.json does not declare ${ruleId}; the linter must not invent one`);
    return { id: found.id, name: found.name, severity: found.severity, description: found.description };
  };
  outputs.set("tools/lint-rules.json", stableJson({
    _meta: {
      note: "자동 생성물 — 손으로 고치지 마세요.",
      source: "registry/governance/audit-rules.json",
      sourceVersion: auditRules._meta.version,
      rule: "검사기는 여기 있는 규칙만 집행한다. 새 판정 기준을 검사기가 만들지 않는다."
    },
    hex: ruleById("R02"),
    rgba: ruleById("R07"),
    exception: "EX03 — color-overlay 만 rgba 를 허용한다."
  }));
  outputs.set("tools/s1-ui-lint.mjs", await read(path.join(sourceRoot, "tools", "s1-ui-lint.mjs")));

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
