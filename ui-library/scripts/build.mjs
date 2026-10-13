import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import iconGeometryCheck from "../../scripts/ui-library-icon-geometry-check.js";
import { componentIds } from "./component-ids.mjs";
import { buildPlatformOutputs, buildContract } from "./platform.mjs";
import { buildPreviewPage } from "./preview.mjs";
import { densityCssFor } from "./density.mjs";
import { buildComponentDoc, isMobileOnly } from "./component-doc.mjs";
import esbuild from "esbuild";
import { scopeNestedParts } from "./css-scope.mjs";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const sourceRoot = path.join(libraryRoot, "src");
const distRoot = path.join(libraryRoot, "dist");
const verificationRoot = path.join(libraryRoot, "verification");
const checkOnly = process.argv.includes("--check");

const read = (file) => readFile(file, "utf8");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

/* 배포본에는 내부 작업 메모(결정 날짜·사람 이름·내부 문서 이름)를 싣지 않는다.
   원본(src)의 설명 주석은 그대로 두고, 나가는 CSS·예시에서만 주석을 걷어낸다. 쓰는 법은 components/{id}.md 가 맡는다. */
/* 예외 하나: 「한글 세로 보정」 주석은 css-model 이 "웹 전용 규칙" 표식으로 읽는다(RN 표에서 뺀다).
   표식은 남기되 내부 메모(날짜·사람 이름·실측 문서)는 빼고 짧은 한 줄로 바꾼다. */
const WEB_ONLY_MARK = "/* 한글 세로 보정 — 웹 전용 */";
const stripCssComments = (css) => css
  .replace(/\/\*(?:(?!\*\/)[\s\S])*?한글 세로 보정(?:(?!\*\/)[\s\S])*?\*\//g, "\u0000WEBONLY\u0000")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll("\u0000WEBONLY\u0000", WEB_ONLY_MARK)
  .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/^\s+/, "");
const stripHtmlComments = (html) => html.replace(/<!--[\s\S]*?-->\s*/g, "");
const exampleHeader = (id) => `<!-- 쓰는 법(옵션·값·이벤트·여닫기)은 components/${id}.md 에 있습니다. -->\n`;
/* 예시 파일 이름 — 모바일 변형은 어느 부품이든 *.mobile.html 로 읽히게 한다(password-mobile → password.mobile). */
const exampleFileKey = (breakName) => (breakName.endsWith("-mobile") ? `${breakName.slice(0, -"-mobile".length)}.mobile` : breakName);
const toIdentifierName = (id) => id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/* 정본 지문 = **부품 몫만** 센다. 계산은 저장소 한 곳(scripts/lib/canonical-fingerprint.js)에
   있고 `npm run ui:version` 도 같은 모듈을 쓴다 — 두 벌로 두면 갈라진다.
   종전에는 정본 파일을 통째로 세서 주석 한 줄만 고쳐도 부품 27종이 전부 "달라짐"이 됐다. */
const { canonicalFingerprint } = createRequire(import.meta.url)(
  path.join(repositoryRoot, "scripts/lib/canonical-fingerprint.js")
);

/* 가상 파일(아직 디스크에 없는 dist 출력)을 esbuild 로 한 덩어리 일반 스크립트(IIFE)로 묶는다. */
async function bundleClassicScript(entrySource, outputs) {
  const result = await esbuild.build({
    stdin: { contents: entrySource, resolveDir: libraryRoot, sourcefile: "s1-ui.auto.js" },
    bundle: true,
    format: "iife",
    globalName: "S1UI",
    write: false,
    legalComments: "none",
    target: "es2020",
    logLevel: "silent",
    plugins: [{
      name: "dist-virtual",
      setup(build) {
        build.onResolve({ filter: /^\.\.?\// }, (args) => {
          const base = args.namespace === "dist-virtual" ? path.posix.dirname(args.importer) : "";
          return { path: path.posix.normalize(path.posix.join(base, args.path)), namespace: "dist-virtual" };
        });
        build.onLoad({ filter: /.*/, namespace: "dist-virtual" }, (args) => {
          const contents = outputs.get(args.path);
          if (contents === undefined) return { errors: [{ text: `preview 번들: ${args.path} 가 출력에 없습니다` }] };
          return { contents, loader: "js" };
        });
      }
    }]
  });
  return result.outputFiles[0].text;
}

async function createOutputs() {
  const packageData = JSON.parse(await read(path.join(libraryRoot, "package.json")));
  /* 배포본 번호는 장부가 정본이다 — 사람이 손으로 찍지 않는다(`npm run ui:bump` · Gate 50). */
  const releaseLog = JSON.parse(await read(path.join(libraryRoot, "release-log.json")));
  if (releaseLog.version !== packageData.version) {
    throw new Error(`release-log.json(${releaseLog.version}) 과 package.json(${packageData.version}) 의 번호가 다릅니다 — npm run ui:version 으로 확인하세요.`);
  }
  const tokenMap = await read(path.join(sourceRoot, "component-token-map.json"));
  const densityPolicy = JSON.parse(await read(path.join(repositoryRoot, "registry/governance/density-policy.json")));
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
    const actualFingerprint = canonicalFingerprint(manifest);
    if (manifest.canonicalFingerprint !== actualFingerprint) {
      throw new Error(`${id} canonicalFingerprint is stale. Review canon changes before rebuilding.`);
    }
    const sourceCss = await read(path.join(base, `${id}.css`));
    /* 밀도 규칙은 원본 CSS 안의 크기 규칙을 선택자만 바꿔 복사한 것이다 — 값이 갈라지지 않는다.
       전체 묶음과 개별 설치가 같은 CSS 를 쓰도록 여기서 한 번만 붙인다. */
    /* css = 의미 그대로의 원본(안전띠 없음) — React·Vue·RN·Kotlin 생성기와 값 대조는 이것을 읽는다.
       안전띠(scopeNestedParts)는 웹 배포 CSS(distCss)에만 붙는다. */
    const css = `${sourceCss}${densityCssFor(id, sourceCss, densityPolicy, manifest.breaks)}`;
    const distCss = stripCssComments(scopeNestedParts(css, id, manifest.dependencies?.coreComponents ?? []));
    const js = await read(path.join(base, `${id}.js`));
    const example = await read(path.join(base, `${id}.example.html`));
    /* 플랫폼별 예제 — Mobile 크기·break 가 PC 와 다른 컴포넌트는 mobile 예제를 따로 낸다.
       manifest.htmlContract.breakExamples 가 선언한 것만 읽는다(선언 없으면 PC 1벌). */
    const breakExamples = manifest.htmlContract.breakExamples ?? {};
    /* 기본 예시의 배포 경로 — 모바일 전용 부품은 manifest 가 examples/{id}.mobile.html 로 선언한다. */
    const mainDistribution = manifest.htmlContract.distribution ?? `examples/${id}.html`;
    const extraExamples = [];
    for (const [breakName, spec] of Object.entries(breakExamples)) {
      if (spec.distribution === mainDistribution) continue;
      const fileKey = exampleFileKey(breakName);
      const expected = `components/${id}/${id}.${fileKey}.example.html`;
      if (spec.source !== expected) throw new Error(`${id} ${breakName} example source must be ${expected}`);
      if (spec.distribution !== `examples/${id}.${fileKey}.html`) throw new Error(`${id} ${breakName} example distribution must be examples/${id}.${fileKey}.html`);
      extraExamples.push([spec.distribution, await read(path.join(sourceRoot, spec.source))]);
    }
    const componentIconAssets = iconAssets.filter(({ id: iconId }) => manifest.icons.some(({ id: usedId }) => usedId === iconId));
    const sourceFingerprint = hash([sourceCss, js, example, ...extraExamples.map(([, text]) => text), stableJson(manifest), ...componentIconAssets.map(({ asset }) => asset)].join("\0"));
    const outputManifest = { ...manifest, sourceFingerprint };
    const exampleByBreak = { pc: example };
    for (const [breakName, spec] of Object.entries(breakExamples)) {
      const match = extraExamples.find(([distPath]) => distPath === spec.distribution);
      exampleByBreak[breakName] = match ? match[1] : example;
    }
    componentOutputs.push({ id, css, js, example, exampleByBreak, manifest: outputManifest, mainDistribution, distCss });
    outputs.set(`components/${id}.css`, distCss);
    outputs.set(`components/${id}.js`, js);
    outputs.set(`components/${id}.manifest.json`, stableJson(outputManifest));
    outputs.set(mainDistribution, `${exampleHeader(id)}${stripHtmlComments(example)}`);
    for (const [distPath, text] of extraExamples) outputs.set(distPath, `${exampleHeader(id)}${stripHtmlComments(text)}`);
  }

  const toIdentifier = (id) => id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const bundleCss = `${componentOutputs.map(({ id, distCss }) => `/* component:${id} */\n${distCss.trimEnd().replaceAll('url("../assets/icons/', 'url("./assets/icons/')}`).join("\n\n")}\n`;
  const bundleJs = `${componentOutputs.map(({ id }) => `export * as ${toIdentifier(id)} from "./components/${id}.js";`).join("\n")}\n`;
  const runtimeIds = componentOutputs.filter(({ manifest }) => manifest.jsRequired).map(({ id }) => id);
  const autoImports = runtimeIds.map((id) => `import { init as init_${toIdentifier(id)} } from "./components/${id}.js";`).join("\n");
  const autoCalls = runtimeIds.map((id) => `    ...[...scope.querySelectorAll('[data-s1-component="${id}"]')].map((root) => init_${toIdentifier(id)}(root))`).join(",\n");
  const autoJs = `${autoImports}\n${bundleJs}\nexport function autoInit(scope = document) {\n  const instances = [\n${autoCalls}\n  ];\n  return Object.freeze(instances.filter(Boolean));\n}\n`;
  const canonicalFingerprintValue = hash(componentOutputs.map(({ manifest }) => manifest.canonicalFingerprint).join("\0"));
  const distManifest = {
    id: "s1-ui",
    version: releaseLog.version,
    releasedAt: releaseLog.releasedAt,
    status: "approved",
    canonicalFingerprint: canonicalFingerprintValue,
    tokenMapFingerprint: hash(tokenMap),
    commonCssDependencies: ["assets/css/tokens.css", "assets/css/typography.css"],
    optionalCssDependencies: [{ file: "s1-ui.base.css", note: "선택 — 페이지 바탕·기본 글자색·글꼴을 토큰으로 잡는다(다크 모드에서 바탕이 따라오게 한다)" }],
    fontDependencies: [{ family: "Pretendard Variable", source: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" }],
    commonCssFingerprints: {
      "assets/css/tokens.css": hash(tokensCss),
      "assets/css/typography.css": hash(typographyCss)
    },
    jsRequired: componentOutputs.some(({ manifest }) => manifest.jsRequired),
    icons: iconManifest.icons,
    components: componentOutputs.map(({ id, manifest, mainDistribution }) => ({
      id,
      version: manifest.version,
      status: manifest.status,
      jsRequired: manifest.jsRequired,
      canonicalFingerprint: manifest.canonicalFingerprint,
      sourceFingerprint: manifest.sourceFingerprint,
      css: `components/${id}.css`,
      js: `components/${id}.js`,
      example: mainDistribution,
      ...(isMobileOnly(id, manifest) ? { mobileOnly: true } : {}),
      examples: Object.fromEntries(Object.entries(manifest.htmlContract.breakExamples ?? { pc: { distribution: mainDistribution } })
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
    individualCssSha256: hash(componentOutputs.map(({ distCss }) => distCss).join("\0")),
    note: "Independent verification must render and judge parity; this file only records deterministic build inputs."
  }));

  /* 툴별 전달 산출물 — 같은 빌드·같은 지문에서 생성한다.
     dist 를 매번 통째로 지우므로 여기서 함께 만들지 않으면 조용히 낡는다. */
  const behaviorLedger = JSON.parse(await read(path.join(repositoryRoot, "registry/components/component-behavior.pc.json")));

  /* "언제 쓰나 / 이럴 땐 다른 걸" — 고를 때 필요한 말은 registry 가 정본이다.
     개발자에게 나가는 자료에도 그대로 싣는다(옮겨 적지 않는다). */
  const usageById = {};
  for (const { id } of componentOutputs) {
    const registry = JSON.parse(await read(path.join(repositoryRoot, `registry/components/${id}.json`)));
    if (!registry.usage) throw new Error(`registry/components/${id}.json 에 usage 가 없습니다 — 고르기 안내를 만들 수 없습니다.`);
    usageById[id] = registry.usage;
  }
  /* 부품별 사람이 읽는 설명서 — manifest·registry usage 에서 생성한다(손으로 쓰지 않는다). */
  const docContract = buildContract(componentOutputs, distManifest);
  for (const { id, manifest, distCss } of componentOutputs) {
    const distEntry = distManifest.components.find((component) => component.id === id);
    outputs.set(`components/${id}.md`, buildComponentDoc({
      id,
      manifest,
      contract: docContract.components.find((component) => component.id === id),
      usage: usageById[id],
      css: distCss,
      examplePaths: [...new Set(Object.values(distEntry.examples))]
    }));
  }

  /* 선택형 페이지 기본 스타일 — 다크 모드에서 페이지 바탕이 따라오지 않던 문제(퍼블리셔가 body 를 직접 칠해야 했음)를
     토큰으로 해결한다. 부품 CSS(s1-ui.css)에는 넣지 않는다 — 퍼블리셔 페이지 body 를 말없이 바꾸지 않기 위해서다. */
  outputs.set("s1-ui.base.css", `/* S1 UI — 선택: 페이지 바탕·기본 글자색·글꼴. tokens.css 다음에 읽습니다.
   <html data-theme="dark"> 로 다크 모드를 켜면 바탕·글자색이 같이 바뀝니다. */
html {
  background: var(--color-bg-level-0);
  color: var(--color-text-body-primary);
}

body {
  background: var(--color-bg-level-0);
  color: var(--color-text-body-primary);
  font-family: "Pretendard Variable", "Pretendard", sans-serif;
  margin: 0;
}
`);

  /* preview.html 은 서버 없이 더블클릭(file://)으로도 보여야 한다 — 그래서 자기 안에 다 넣는다.
     ① 마스크 아이콘은 file:// 에서 CORS 로 막히므로 data URI 로 바꾼 CSS 를 안에 싣고
     ② ES module 은 file:// 에서 import 가 막히므로 한 덩어리 일반 스크립트로 묶어 싣는다. */
  const iconByFile = new Map(iconAssets.map((icon) => [icon.file, icon.asset]));
  const previewCss = bundleCss.replace(/url\("\.\/assets\/icons\/([^"]+)"\)/g, (match, file) => {
    const asset = iconByFile.get(file);
    return asset ? `url("data:image/svg+xml;base64,${Buffer.from(asset).toString("base64")}")` : match;
  });
  const previewScript = await bundleClassicScript(autoJs, outputs);
  outputs.set("preview.html", buildPreviewPage({
    componentOutputs,
    usageById,
    version: distManifest.version,
    canonicalFingerprint: distManifest.canonicalFingerprint,
    inlineCss: previewCss,
    inlineScript: previewScript
  }));

  const platformOutputs = buildPlatformOutputs({
    componentOutputs,
    tokensCss,
    typographyCss,
    distManifest,
    behaviorLedger,
    iconAssets,
    usageById,
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
