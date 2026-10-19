/**
 * react-native.mjs — 승인 배포본에서 React Native(Expo) 패키지를 만든다.
 * --------------------------------------------------------------------------
 * 입력: 컴포넌트별 CSS(승인본) · 승인 예제 마크업 · tokens.css · typography.css · 아이콘 SVG · behavior 원장
 * 출력: platform/react-native/** (부품·표·팔레트·타이포·아이콘·엔진·README·예제)
 *
 * [설계] Kotlin(Compose) 과 같은 원칙이다.
 *   값은 사람이 옮겨 적지 않는다. css-model 이 배포본 CSS 를 캐스케이드까지 계산한 표(specs/*.js)가
 *   값의 전부이고, 부품 코드에는 치수·색이 한 자리도 없다. 색은 라이트/다크 팔레트 쌍을 토큰 이름으로 부른다.
 *   구조(마크업 계층·슬롯·반복 목록)는 React 생성기와 같은 분석으로 승인 예제에서 옮긴다.
 *
 * [이 파일이 하지 않는 것]
 *   - CSS 에 없는 값을 지어내지 않는다. 읽지 못한 문법은 빌드가 선다.
 *   - RN 이 원리상 못 하는 CSS 는 조용히 버리지 않는다. coverage.json 에 이유와 함께 센다.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Converter } from "./react-native-css.mjs";
import { combineStylesheets } from "./react-native-model.mjs";
import { GENERATED_NOTE, buildRnComponent, buildReactRuntime, firstRootAttributes, specSource } from "./react-native-emit.mjs";
import { readRnIcon } from "./react-native-icons.mjs";
import { readTextStyles } from "./kotlin-typography.mjs";
import { galleryFiles } from "./react-native-gallery.mjs";
import { buildReactNativeDocs, buildReactNativeTypes } from "./react-native-docs.mjs";
import { sampleFiles } from "./react-native-sample.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const runtimeSourceDir = path.resolve(here, "..", "src", "react-native");
const read = (name) => readFileSync(path.join(runtimeSourceDir, name), "utf8");

const ROOT = "platform/react-native";
const pascalId = (id) => id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/** 손으로 쓴 엔진 파일 목록 — 생성물과 같은 폴더에 그대로 복사한다(머리에 생성물 문구를 붙이지 않는다: 이 파일들은 손 원본이다). */
export const HAND_WRITTEN = ["engine.js", "text.js", "behaviors.js", "chip-group.js"];

export function buildReactNativeOutputs({ componentOutputs, tokenData, iconAssets, typographyCss, usageById, release, behaviorLedger, only = null }) {
  const outputs = new Map();
  const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;

  const rules = combineStylesheets(componentOutputs);
  const tokenValues = new Map(tokenData.tokens.map((token) => [token.name, token.value]));
  const shadows = shadowTable(tokenData);
  const converter = new Converter(tokenValues, new Set(Object.keys(shadows)));
  const approved = componentOutputs.filter(({ manifest }) => manifest.status === "approved" && (only === null || only.includes(manifest.id)));
  const manifests = new Map(componentOutputs.map(({ id, manifest }) => [id, manifest]));

  const nestedDefaults = new Map(componentOutputs.map((component) => [component.id, firstRootAttributes(component)]));

  /* 팔레트·타이포·아이콘 */
  outputs.set(`${ROOT}/tokens.js`, tokensSource(tokenData, shadows));
  const textStyles = readTextStyles(typographyCss, tokenValues);
  outputs.set(`${ROOT}/typography.js`, typographySource(textStyles));
  const icons = readAllIcons(iconAssets);
  outputs.set(`${ROOT}/icons.js`, iconsSource(icons));

  /* 손으로 쓴 엔진 */
  for (const name of HAND_WRITTEN) outputs.set(`${ROOT}/${name}`, read(name));
  outputs.set(`${ROOT}/runtime.js`, buildReactRuntime());

  /* 부품 */
  const factsList = [];
  const specs = new Map();
  const noteTotals = new Map();
  const coverage = {};
  for (const component of approved) {
    const built = buildRnComponent({ component, rules, converter, manifests, nestedDefaults });
    outputs.set(`${ROOT}/components/${component.id}.js`, built.source);
    outputs.set(`${ROOT}/specs/${component.id}.js`, specSource(built.spec));
    factsList.push(built.facts);
    specs.set(component.id, built.spec);
    const tally = {};
    for (const { property, reason } of built.notes) {
      const key = `${reason}:${property}`;
      tally[key] = (tally[key] ?? 0) + 1;
      noteTotals.set(key, (noteTotals.get(key) ?? 0) + 1);
    }
    coverage[component.id] = {
      templates: built.facts.templates.length,
      styles: built.spec.styles.length,
      tableEntries: built.spec.templates.reduce((sum, template) => sum + Object.values(template.tables).reduce((n, table) => n + (table.map ? Object.keys(table.map).length : 1), 0), 0),
      ignored: tally
    };
  }

  /* 갤러리·예제 앱 */
  for (const [relative, content] of galleryFiles({ factsList, manifests, specs })) outputs.set(`${ROOT}/${relative}`, content);
  for (const [relative, content] of sampleFiles({ factsList, release })) outputs.set(relative, content);

  /* 패키지 */
  outputs.set(`${ROOT}/package.json`, packageJson(release));
  outputs.set(`${ROOT}/version.js`, versionJs(release));
  outputs.set(`${ROOT}/index.js`, indexSource(approved));
  outputs.set(`${ROOT}/index.d.ts`, buildReactNativeTypes(factsList, textStyles));
  outputs.set(`${ROOT}/README.md`, buildReactNativeDocs({ factsList, usageById, release, textStyles, iconNames: Object.keys(icons), tokenData }));
  outputs.set(`${ROOT}/coverage.json`, stable({
    _meta: {
      note: GENERATED_NOTE,
      purpose: "RN 부품이 배포본 CSS 의 어느 선언을 RN 에 옮기지 못해 따로 처리/무시했는지 드러낸다.",
      rule: "reason 이 web-only·pointer-only·animation 이면 RN 에 대응물이 없는 선언이고, consumed 는 다른 값으로 이미 옮겨 쓴 선언이다. 이 외에 색·치수가 남으면 부품이 그만큼 정본과 다르다는 뜻이다(빌드가 알 수 없는 속성에서 멈춘다)."
    },
    totals: Object.fromEntries([...noteTotals].sort()),
    components: coverage
  }));

  return { outputs, facts: factsList, textStyles, icons: Object.keys(icons), componentNames: approved.map(({ id }) => `S1${pascalId(id)}`) };
}

/* ── 토큰 ────────────────────────────────────────────────────────────── */

function shadowTable(tokenData) {
  const out = {};
  const parse = (text) => splitTop(text).map((layer) => {
    const m = /^\s*(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(rgba?\([^)]*\))\s*$/.exec(layer);
    if (!m) throw new Error(`그림자를 읽지 못했습니다 — "${layer}"`);
    return { offsetX: Number(m[1]), offsetY: Number(m[2]), blurRadius: Number(m[3]), spreadDistance: m[4] ? Number(m[4]) : 0, color: m[5].replace(/\s+/g, "") };
  });
  for (const token of tokenData.tokens) {
    if (token.type !== "raw" || !/^--shadow-/.test(token.name)) continue;
    out[token.name] = [parse(token.value), parse(token.darkValue ?? token.value)];
  }
  return out;
}

function splitTop(text) {
  const out = [];
  let depth = 0;
  let buffer = "";
  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) { out.push(buffer); buffer = ""; continue; }
    buffer += char;
  }
  out.push(buffer);
  return out;
}

function tokensSource(tokenData, shadows) {
  const colors = {};
  const dimens = {};
  const numbers = {};
  for (const token of tokenData.tokens) {
    if (token.type === "color") colors[token.name] = [token.value, token.darkValue ?? token.value];
    else if (token.type === "dimension") dimens[token.name] = Number(/^(-?\d*\.?\d+)/.exec(token.value)[1]);
    else if (token.type === "number") numbers[token.name] = Number(token.value);
  }
  return `/* ${GENERATED_NOTE} */
/* 정본: plugins/figma-vars-installer/src/vars-data.ts → assets/css/tokens.css
   색 한 개마다 [라이트, 다크] 한 쌍. 어느 쪽을 쓸지는 S1Provider 가 정한다. 이름은 CSS 변수 이름 그대로다. */
export const COLORS = ${JSON.stringify(colors)};

/** 길이 값(px → dp). 화면을 직접 그릴 때 값을 눈으로 옮겨 적지 말고 이름으로 부르세요. */
export const DIMENS = ${JSON.stringify(dimens)};

export const NUMBERS = ${JSON.stringify(numbers)};

/** 그림자: [라이트 층 목록, 다크 층 목록]. RN 의 boxShadow 에 그대로 들어가는 모양이다. */
export const SHADOWS = ${JSON.stringify(shadows)};
`;
}

function typographySource(styles) {
  const table = Object.fromEntries(styles.map((style) => [style.name, {
    fontSize: style.fontSize.value, fontWeight: style.fontWeight.value, lineHeight: style.lineHeight.value, letterSpacing: style.letterSpacing.value
  }]));
  return `/* ${GENERATED_NOTE} */
/* 이름 붙은 텍스트 스타일. lineHeight 는 글자 크기에 곱하는 배수, letterSpacing 은 em 이다.
   정본: plugins/figma-vars-installer/src/textstyles-data.ts → assets/css/typography.css */
export const TYPES = ${JSON.stringify(table, null, 2)};
`;
}

function readAllIcons(iconAssets) {
  const out = {};
  for (const { file, asset } of iconAssets) {
    const name = file.replace(/\.svg$/, "");
    const icon = readRnIcon(name, asset);
    out[name] = {
      w: icon.width,
      h: icon.height,
      paths: icon.paths.map((path) => ({
        d: path.data,
        fill: path.filled,
        stroke: path.stroked,
        strokeWidth: path.strokeWidth,
        cap: path.strokeCap,
        join: path.strokeJoin,
        rule: path.fillRule
      }))
    };
  }
  return out;
}

function iconsSource(icons) {
  return `/* ${GENERATED_NOTE} */
/* 원본: ui-library/src/assets/icons/*.svg — 모양(path)은 그대로, 색은 그릴 때 칠한다. */
export const ICONS = ${JSON.stringify(icons)};
`;
}

/* ── 패키지 파일 ─────────────────────────────────────────────────────── */

function packageJson(release) {
  return `${JSON.stringify({
    name: "@s1/ui-react-native",
    version: release.version,
    description: "S1 디자인 시스템 — 승인된 배포본 CSS 를 계산해 굳힌 React Native(Expo) 컴포넌트 (iOS · Android · 웹)",
    type: "module",
    main: "./index.js",
    types: "./index.d.ts",
    exports: { ".": { types: "./index.d.ts", default: "./index.js" }, "./*": "./*" },
    sideEffects: false,
    peerDependencies: { react: ">=18", "react-native": ">=0.76", "react-native-svg": ">=15" },
    files: ["*.js", "components", "specs", "gallery", "index.d.ts", "README.md", "coverage.json"]
  }, null, 2)}\n`;
}

function versionJs(release) {
  return [
    `/* ${GENERATED_NOTE} */`,
    `export const S1_VERSION = "${release.version}";`,
    `export const S1_RELEASED_AT = "${release.releasedAt}";`,
    `export const S1_CANONICAL_FINGERPRINT = "${release.canonicalFingerprint}";`,
    ""
  ].join("\n");
}

function indexSource(approved) {
  return `/* ${GENERATED_NOTE} */
export { S1Provider, useS1, Icon } from "./engine.js";
export { S1Text } from "./text.js";
export { S1ChipGroup } from "./chip-group.js";
export { COLORS, DIMENS, NUMBERS, SHADOWS } from "./tokens.js";
export { TYPES } from "./typography.js";
export { ICONS } from "./icons.js";
${approved.map(({ id }) => `export { default as S1${pascalId(id)} } from "./components/${id}.js";`).join("\n")}
export { S1Gallery } from "./gallery/S1Gallery.js";
export { S1_VERSION, S1_RELEASED_AT, S1_CANONICAL_FINGERPRINT } from "./version.js";
`;
}

export { readdirSync };
