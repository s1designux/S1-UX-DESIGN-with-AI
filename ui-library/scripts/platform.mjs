/**
 * platform.mjs — 툴별 전달 산출물 생성기
 * --------------------------------------------------------------------------
 * 승인된 배포본 하나에서 개발 툴별 소비 형식을 결정론적으로 만들어 낸다.
 * build.mjs 안에서 호출되며 dist 와 같은 빌드·같은 지문을 공유한다.
 *
 *   tokens.css(← vars-data.ts)  ──▶ platform/tokens.json · kotlin · swift · cpp
 *   manifest + example.html     ──▶ platform/react · platform/vue · contract.json
 *
 * [이 파일이 하지 않는 것]
 *   - 새 토큰·새 상태·새 판정 기준을 만들지 않는다. 입력에 있는 것만 옮긴다.
 *   - 값을 반올림하거나 "더 나은 값"으로 바꾸지 않는다.
 *
 * 이름 변환은 1:1 역변환이 가능한 기계 규칙이다(2-canon-readiness §4):
 *   --color-base-white → colorBaseWhite (Kotlin·Swift) / S1_COLOR_BASE_WHITE (C++)
 *   JSON 은 원본 이름을 그대로 유지해 정본으로 되짚을 수 있게 한다.
 */

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요.";

/* ── 1. tokens.css 판독 ──────────────────────────────────────────────── */

const DARK_SELECTOR = '[data-theme="dark"]';

/** 셀렉터 블록별 커스텀 속성 선언을 순서대로 수집한다. 마지막 선언이 이긴다(CSS 캐스케이드). */
function collectDeclarations(css, selectorTest) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const values = new Map();
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let block;
  while ((block = blockPattern.exec(withoutComments)) !== null) {
    const selector = block[1].trim();
    if (!selectorTest(selector)) continue;
    const declarationPattern = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let declaration;
    while ((declaration = declarationPattern.exec(block[2])) !== null) {
      values.set(declaration[1], declaration[2].trim());
    }
  }
  return values;
}

/** var(--a, fallback) 참조를 끝까지 따라가 실제 값으로 만든다. 순환은 원문을 그대로 둔다. */
function resolveValue(raw, lookup, seen = new Set()) {
  const match = /^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/i.exec(raw.trim());
  if (!match) return raw.trim();
  const [, reference, fallback] = match;
  if (seen.has(reference)) return raw.trim();
  seen.add(reference);
  const next = lookup(reference);
  if (next === undefined) return fallback ? resolveValue(fallback, lookup, seen) : raw.trim();
  return resolveValue(next, lookup, seen);
}

function classify(value) {
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return "color";
  if (/^rgba?\(/i.test(value)) return "color";
  if (/^-?\d*\.?\d+px$/.test(value)) return "dimension";
  if (/^-?\d*\.?\d+$/.test(value)) return "number";
  return "raw";
}

/** 색을 0xAARRGGBB 정수로. CSS 는 알파가 뒤(#RRGGBBAA)라 자리를 옮긴다. */
function colorToArgb(value) {
  const hex = /^#([0-9a-f]+)$/i.exec(value.trim());
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((c) => c + c).join("");
    if (digits.length === 6) return `0xFF${digits.toUpperCase()}`;
    if (digits.length === 8) return `0x${digits.slice(6, 8).toUpperCase()}${digits.slice(0, 6).toUpperCase()}`;
    return null;
  }
  const rgba = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(value.trim());
  if (!rgba) return null;
  const channel = (input) => Math.round(Number(input)).toString(16).padStart(2, "0").toUpperCase();
  const alphaInput = rgba[4];
  const alpha = alphaInput === undefined
    ? 255
    : Math.round((alphaInput.endsWith("%") ? Number(alphaInput.slice(0, -1)) / 100 : Number(alphaInput)) * 255);
  return `0x${channel(alpha)}${channel(rgba[1])}${channel(rgba[2])}${channel(rgba[3])}`;
}

const numericOf = (value) => Number(/^(-?\d*\.?\d+)/.exec(value)[1]);
/* C++ 부동소수 리터럴은 소수점이 있어야 한다 — `1f` 는 Kotlin 문법이고 C++ 에서는 컴파일되지 않는다.
   (2026-09-04 독립 검증에서 헤더 83개 컴파일 오류로 발견) */
const cppFloat = (value) => {
  const number = numericOf(value);
  return `${Number.isInteger(number) ? number.toFixed(1) : String(number)}f`;
};

export function readTokens(tokensCss) {
  const light = collectDeclarations(tokensCss, (selector) => !selector.includes(DARK_SELECTOR));
  const dark = collectDeclarations(tokensCss, (selector) => selector.includes(DARK_SELECTOR));
  const lightLookup = (name) => light.get(name);
  const darkLookup = (name) => (dark.has(name) ? dark.get(name) : light.get(name));

  const tokens = [];
  for (const [name, declared] of light) {
    const lightValue = resolveValue(declared, lightLookup);
    const darkDeclared = dark.get(name);
    const darkValue = resolveValue(darkDeclared ?? declared, darkLookup);
    tokens.push({
      name,
      type: classify(lightValue),
      declared,
      value: lightValue,
      darkValue: darkValue === lightValue ? null : darkValue,
      overriddenInDark: dark.has(name)
    });
  }
  const darkOnly = [...dark.keys()].filter((name) => !light.has(name));
  return { tokens: tokens.sort((a, b) => a.name.localeCompare(b.name)), darkOnly: darkOnly.sort() };
}

/* ── 2. 이름 변환 (1:1 역변환 가능) ──────────────────────────────────── */

const parts = (name) => name.replace(/^--/, "").split("-").filter(Boolean);
export const camelName = (name) => parts(name).map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");
export const screamName = (name) => `S1_${parts(name).join("_").toUpperCase()}`;
const pascalId = (id) => id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
const camelId = (id) => id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/* ── 3. 값 파일 생성 ─────────────────────────────────────────────────── */

const bucketOf = (token) => (token.type === "color" ? "colors" : token.type === "dimension" ? "dimens" : token.type === "number" ? "numbers" : "raw");

function bucketTokens(tokens) {
  const buckets = { colors: [], dimens: [], numbers: [], raw: [] };
  for (const token of tokens) buckets[bucketOf(token)].push(token);
  return buckets;
}

/** 이름 변환이 1:1 이라는 약속을 기계로 지킨다. `--a-b` 와 `--a--b` 가 한 이름으로 뭉개지면
 *  생성물이 컴파일되지 않거나 값이 조용히 덮인다 — 그때 빌드가 서게 한다. */
function assertNameCollisionFree(tokens) {
  /* 라이트 집합과 다크 집합을 각각 본다 — 두 집합은 서로 다른 네임스페이스에 들어가므로
     집합 안에서만 충돌하면 된다. 종전에는 라이트만 봐서 다크 쪽 충돌을 놓쳤다. */
  const sets = [
    ["전체", tokens],
    ["다크", tokens.filter((token) => token.darkValue)]
  ];
  for (const [scope, group] of sets) {
    for (const [label, convert] of [["Kotlin·Swift", camelName], ["C++", screamName]]) {
      const seen = new Map();
      for (const token of group) {
        const converted = convert(token.name);
        if (seen.has(converted)) {
          throw new Error(`${label} ${scope} 이름 충돌: ${seen.get(converted)} 와 ${token.name} 이 모두 ${converted} 로 변환된다. 토큰 이름을 구분하거나 변환 규칙을 고쳐야 한다.`);
        }
        seen.set(converted, token.name);
      }
    }
  }
}

export function buildTokensJson(tokenData, sourceFingerprints) {
  assertNameCollisionFree(tokenData.tokens);
  return {
    _meta: {
      note: GENERATED_NOTE,
      canonicalSource: "plugins/figma-vars-installer/src/vars-data.ts",
      generatedFrom: "assets/css/tokens.css",
      sourceFingerprints,
      nameRule: "원본 CSS 변수 이름이 정본 식별자다. 언어별 이름은 여기서 1:1 로 파생된다.",
      darkRule: "darkValue 가 null 이면 라이트와 같은 값이다."
    },
    tokens: tokenData.tokens.map(({ name, type, value, darkValue }) => ({
      name,
      type,
      value,
      darkValue,
      kotlin: camelName(name),
      swift: camelName(name),
      cpp: screamName(name)
    })),
    darkOnlyTokens: tokenData.darkOnly
  };
}

export function buildKotlin(tokenData) {
  const { colors, dimens, numbers, raw } = bucketTokens(tokenData.tokens);
  const lines = [
    "// " + GENERATED_NOTE,
    "// 정본: plugins/figma-vars-installer/src/vars-data.ts → assets/css/tokens.css",
    "// 색은 0xAARRGGBB 이다. Compose 는 Color(S1Tokens.Colors.x), View 는 x.toInt() 로 쓴다.",
    "",
    "package com.s1.designsystem",
    "",
    "object S1Tokens {",
    "    object Colors {"
  ];
  for (const token of colors) {
    const argb = colorToArgb(token.value);
    if (argb === null) continue;
    lines.push(`        /** ${token.name} = ${token.value} */`);
    lines.push(`        const val ${camelName(token.name)}: Long = ${argb}`);
  }
  lines.push("    }", "", "    /** 다크 테마에서 값이 달라지는 색만 담는다. 없으면 라이트 값을 쓴다. */", "    object ColorsDark {");
  for (const token of colors) {
    if (!token.darkValue) continue;
    const argb = colorToArgb(token.darkValue);
    if (argb === null) continue;
    lines.push(`        /** ${token.name} = ${token.darkValue} */`);
    lines.push(`        const val ${camelName(token.name)}: Long = ${argb}`);
  }
  lines.push("    }", "", "    /** px 단위 값. Android 에서는 dp 로 읽는다. */", "    object Dimens {");
  for (const token of dimens) {
    lines.push(`        /** ${token.name} = ${token.value} */`);
    lines.push(`        const val ${camelName(token.name)}: Float = ${numericOf(token.value)}f`);
  }
  lines.push("    }", "", "    object Numbers {");
  for (const token of numbers) {
    lines.push(`        /** ${token.name} */`);
    lines.push(`        const val ${camelName(token.name)}: Float = ${numericOf(token.value)}f`);
  }
  lines.push("    }", "", "    /** 자동 변환이 안 되는 값은 원문 그대로 둔다(임의 해석 금지). */", "    object Raw {");
  for (const token of raw) {
    lines.push(`        /** ${token.name} */`);
    lines.push(`        const val ${camelName(token.name)}: String = ${JSON.stringify(token.value)}`);
  }
  lines.push("    }", "}", "");
  return lines.join("\n");
}

export function buildSwift(tokenData) {
  const { colors, dimens, numbers, raw } = bucketTokens(tokenData.tokens);
  const lines = [
    "// " + GENERATED_NOTE,
    "// 정본: plugins/figma-vars-installer/src/vars-data.ts → assets/css/tokens.css",
    "// 색은 0xAARRGGBB 이다. S1Tokens.color(_:) 로 UIColor 를 만든다.",
    "",
    "import CoreGraphics",
    "import Foundation",
    "",
    "public enum S1Tokens {",
    "    public enum Colors {"
  ];
  for (const token of colors) {
    const argb = colorToArgb(token.value);
    if (argb === null) continue;
    lines.push(`        /// ${token.name} = ${token.value}`);
    lines.push(`        public static let ${camelName(token.name)}: UInt32 = ${argb}`);
  }
  lines.push("    }", "", "    /// 다크 테마에서 값이 달라지는 색만 담는다.", "    public enum ColorsDark {");
  for (const token of colors) {
    if (!token.darkValue) continue;
    const argb = colorToArgb(token.darkValue);
    if (argb === null) continue;
    lines.push(`        /// ${token.name} = ${token.darkValue}`);
    lines.push(`        public static let ${camelName(token.name)}: UInt32 = ${argb}`);
  }
  lines.push("    }", "", "    /// px 단위 값. iOS 에서는 pt 로 읽는다.", "    public enum Dimens {");
  for (const token of dimens) {
    lines.push(`        /// ${token.name} = ${token.value}`);
    lines.push(`        public static let ${camelName(token.name)}: CGFloat = ${numericOf(token.value)}`);
  }
  lines.push("    }", "", "    public enum Numbers {");
  for (const token of numbers) {
    lines.push(`        /// ${token.name}`);
    lines.push(`        public static let ${camelName(token.name)}: CGFloat = ${numericOf(token.value)}`);
  }
  lines.push("    }", "", "    /// 자동 변환이 안 되는 값은 원문 그대로 둔다(임의 해석 금지).", "    public enum Raw {");
  for (const token of raw) {
    lines.push(`        /// ${token.name}`);
    lines.push(`        public static let ${camelName(token.name)}: String = ${JSON.stringify(token.value)}`);
  }
  lines.push("    }", "}", "");
  return lines.join("\n");
}

export function buildCppHeader(tokenData) {
  const { colors, dimens, numbers, raw } = bucketTokens(tokenData.tokens);
  const lines = [
    "// " + GENERATED_NOTE,
    "// 정본: plugins/figma-vars-installer/src/vars-data.ts → assets/css/tokens.css",
    "// 색은 0xAARRGGBB 이다. UI 프레임워크(Qt·MFC 등)는 아직 정해지지 않아 프레임워크 타입을 쓰지 않는다.",
    "",
    "#ifndef S1_TOKENS_H",
    "#define S1_TOKENS_H",
    "",
    "#include <cstdint>",
    "",
    "namespace s1 {",
    "namespace tokens {",
    "",
    "// ── 색 (0xAARRGGBB) ──"
  ];
  for (const token of colors) {
    const argb = colorToArgb(token.value);
    if (argb === null) continue;
    lines.push(`constexpr std::uint32_t ${screamName(token.name)} = ${argb}u; // ${token.name} = ${token.value}`);
  }
  /* 다크 값은 접미사(_DARK)로 붙이지 않는다 — 이름에 dark 가 들어간 실제 토큰
     (예: --color-icon-gray-dark)과 부딪혀 값이 조용히 덮인다.
     Kotlin·Swift 가 Colors / ColorsDark 로 가르는 것과 같게 네임스페이스로 가른다.
     (2026-09-04 독립 검증에서 충돌 1건으로 발견) */
  lines.push("", "// ── 다크 테마에서 값이 달라지는 색 ──", "namespace dark {");
  for (const token of colors) {
    if (!token.darkValue) continue;
    const argb = colorToArgb(token.darkValue);
    if (argb === null) continue;
    lines.push(`constexpr std::uint32_t ${screamName(token.name)} = ${argb}u; // ${token.name} = ${token.darkValue}`);
  }
  lines.push("} // namespace dark");
  lines.push("", "// ── 크기 (px) ──");
  for (const token of dimens) lines.push(`constexpr float ${screamName(token.name)} = ${cppFloat(token.value)}; // ${token.name} = ${token.value}`);
  lines.push("", "// ── 수치 ──");
  for (const token of numbers) lines.push(`constexpr float ${screamName(token.name)} = ${cppFloat(token.value)}; // ${token.name}`);
  lines.push("", "// ── 자동 변환이 안 되는 값은 원문 그대로 (임의 해석 금지) ──");
  for (const token of raw) lines.push(`constexpr const char* ${screamName(token.name)} = ${JSON.stringify(token.value)}; // ${token.name}`);
  lines.push("", "} // namespace tokens", "} // namespace s1", "", "#endif // S1_TOKENS_H", "");
  return lines.join("\n");
}

/* ── 4. 컴포넌트 계약 (개발자·검사기 공용 입력) ──────────────────────── */

/** 계약에 실을 variant·size 속성 이름을 승인 마크업에서 읽어 온다(못 찾으면 null). */
function attributeOf(componentOutputs, id, allowed) {
  if (!allowed.length) return null;
  const component = componentOutputs.find((entry) => entry.id === id);
  if (!component) return null;
  try {
    return detectAttribute(rootAttributes(extractInstance(component.example, id)), allowed);
  } catch {
    return null;
  }
}

export function buildContract(componentOutputs, distManifest) {
  return {
    _meta: {
      note: GENERATED_NOTE,
      purpose: "개발 툴과 검사기가 함께 읽는 허용목록. 여기 없는 variant·size·속성은 승인된 적이 없는 것이다.",
      canonicalFingerprint: distManifest.canonicalFingerprint
    },
    components: componentOutputs.map(({ id, manifest }) => ({
      id,
      status: manifest.status,
      rootSelector: manifest.rootSelector,
      root: manifest.htmlContract.root,
      variants: manifest.variants ?? [],
      sizes: manifest.sizes ?? [],
      breaks: manifest.breaks ?? null,
      states: Object.keys(manifest.states ?? {}),
      parts: manifest.parts ?? [],
      /* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 검사기가 data-variant 로
         짐작하면 dropdown(data-type)·date-picker(data-mode)·modal(data-footer)을 못 본다. */
      variantAttribute: attributeOf(componentOutputs, id, manifest.variants ?? []),
      sizeAttribute: attributeOf(componentOutputs, id, manifest.sizes ?? []),
      requiredAttributes: manifest.htmlContract.requiredAttributes ?? [],
      requiredParts: manifest.htmlContract.requiredParts ?? [],
      jsRequired: manifest.jsRequired,
      events: manifest.javascript?.events ?? [],
      lifecycle: manifest.javascript?.lifecycle ?? [],
      canonicalFingerprint: manifest.canonicalFingerprint,
      sourceFingerprint: manifest.sourceFingerprint
    }))
  };
}

/* ── 5. 프레임워크 껍데기 ────────────────────────────────────────────────
 * 마크업을 JSX·template 로 옮겨 적지 않는다. 승인된 예제 HTML **문자열 그대로**를
 * 마운트해 init/destroy 를 건다. 그래서 껍데기가 그리는 DOM 은 배포본과 글자 단위로 같고,
 * 프레임워크가 우리 컴포넌트 내부를 다시 그려 상태를 깨뜨리지 않는다.
 * host 는 display:contents 라 레이아웃에 끼어들지 않는다.
 */

const eventPropName = (eventName) => `on${eventName.split(":").slice(2).join(":").split(/[-:]/).map((part) => part[0].toUpperCase() + part.slice(1)).join("")}`;

/* ── 5-a. 예제에서 "컴포넌트 인스턴스 하나"를 도려내기 ────────────────
 * 승인된 예제 파일은 인스턴스 1개가 아니다:
 *   - dropdown·date-picker·time-picker 예제는 변형을 2~3개 나란히 보여 준다.
 *   - mobile-bottom-nav 예제의 최상위는 화면이 소유하는 <nav> 이고 코어는 그 안의 버튼이다.
 * 껍데기는 "컴포넌트 하나"를 그려야 하므로, data-s1-component="{id}" 를 단 첫 요소만 도려낸다.
 * (2026-09-04 브라우저 실측으로 발견 — 예제 최상위를 그대로 쓰면 4개 컴포넌트가 깨진다.)
 */

const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

/** 여는/닫는 태그를 순서대로 훑어 균형을 맞춘다. 주석은 미리 지운다. */
function* scanTags(html) {
  const pattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const [full, closing, name, attributes, selfClosing] = match;
    yield {
      start: match.index,
      end: match.index + full.length,
      closing: closing === "/",
      name: name.toLowerCase(),
      attributes,
      selfClosing: selfClosing === "/" || VOID_ELEMENTS.has(name.toLowerCase())
    };
  }
}

/* 끝태그를 생략해도 되는 요소들. 생략돼 있으면 태그 균형으로는 끝을 알 수 없어
   옆 컴포넌트를 통째로 삼킨다 — 조용히 잘못 도려내느니 빌드를 세운다.
   (2026-09-04 독립 검증이 짚은 잠재 결함. 현재 예제 19종에는 없다.) */
const OPTIONAL_END_TAGS = ["p", "li", "dt", "dd", "option", "thead", "tbody", "tfoot", "tr", "td", "th", "rt", "rp", "colgroup", "caption"];

function assertNoOmittedEndTags(html, id) {
  for (const name of OPTIONAL_END_TAGS) {
    const opens = (html.match(new RegExp(`<${name}(?=[\\s/>])`, "gi")) ?? []).length;
    const closes = (html.match(new RegExp(`</${name}\\s*>`, "gi")) ?? []).length;
    if (opens !== closes) {
      throw new Error(`${id}: 예제에 <${name}> 의 끝태그가 생략돼 있어(여는 ${opens} · 닫는 ${closes}) 인스턴스를 안전하게 도려낼 수 없습니다. 예제에 끝태그를 명시하세요.`);
    }
  }
}

export function extractInstance(html, id) {
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, (comment) => " ".repeat(comment.length));
  assertNoOmittedEndTags(cleaned, id);
  const needle = new RegExp(`data-s1-component\\s*=\\s*["']${id}["']`);
  let depth = 0;
  let openDepth = null;
  let startIndex = null;
  for (const tag of scanTags(cleaned)) {
    if (tag.closing) {
      depth -= 1;
      if (openDepth !== null && depth === openDepth) return html.slice(startIndex, tag.end);
      continue;
    }
    if (openDepth === null && needle.test(tag.attributes)) {
      if (tag.selfClosing) return html.slice(tag.start, tag.end);
      openDepth = depth;
      startIndex = tag.start;
    }
    if (!tag.selfClosing) depth += 1;
  }
  throw new Error(`${id}: 예제에서 data-s1-component="${id}" 인 요소를 찾지 못했습니다.`);
}

/** 도려낸 조각이 정말 "최상위 요소 하나"인지 확인한다. 아니면 껍데기가 조용히 깨진다. */
function assertSingleRoot(instance, id) {
  const cleaned = instance.replace(/<!--[\s\S]*?-->/g, (comment) => " ".repeat(comment.length)).trim();
  let depth = 0;
  let roots = 0;
  for (const tag of scanTags(cleaned)) {
    if (tag.closing) { depth -= 1; continue; }
    if (depth === 0) roots += 1;
    if (!tag.selfClosing) depth += 1;
  }
  if (roots !== 1) throw new Error(`${id}: 껍데기 마크업의 최상위 요소가 ${roots}개입니다(1개여야 합니다).`);
}

/** 루트 요소의 속성을 읽는다. */
function rootAttributes(instance) {
  const first = scanTags(instance).next().value;
  const attributes = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = pattern.exec(first.attributes)) !== null) attributes[match[1]] = match[3] ?? match[4];
  return attributes;
}

/** variant·size 를 담는 속성 이름은 컴포넌트마다 다르다
 *  (button=data-variant · dropdown=data-type · date-picker=data-mode …).
 *  이름을 지어내지 않고, 실제 마크업에서 허용목록 값을 가진 속성을 찾아 쓴다. */
function detectAttribute(attributes, allowed) {
  if (!allowed || allowed.length === 0) return null;
  for (const [name, value] of Object.entries(attributes)) {
    if (allowed.includes(value)) return name;
  }
  return null;
}

function wrapperFacts({ id, manifest, example, exampleByBreak }) {
  const events = manifest.javascript?.events ?? [];
  const markups = {};
  for (const [breakName, html] of Object.entries(exampleByBreak ?? { pc: example })) {
    const instance = extractInstance(html, id).trim();
    assertSingleRoot(instance, id);
    markups[breakName] = instance;
  }
  const defaultBreak = Object.keys(markups)[0];
  const attributes = rootAttributes(markups[defaultBreak]);
  const variants = manifest.variants ?? [];
  const sizes = manifest.sizes ?? [];
  const variantAttribute = detectAttribute(attributes, variants);
  const sizeAttribute = detectAttribute(attributes, sizes);
  /* 고를 수 있는 축이 둘 이상인데 그 값을 담는 속성을 못 찾았다면, 껍데기는 변형을 바꿀 방법이 없다.
     조용히 하나만 그리는 껍데기를 내보내지 말고 여기서 멈춘다. */
  if (variants.length > 1 && !variantAttribute) throw new Error(`${id}: variant 가 ${variants.length}개인데 승인 마크업에서 그 값을 담는 속성을 찾지 못했습니다.`);
  if (sizes.length > 1 && !sizeAttribute) throw new Error(`${id}: size 가 ${sizes.length}개인데 승인 마크업에서 그 값을 담는 속성을 찾지 못했습니다.`);
  return {
    id,
    componentName: `S1${pascalId(id)}`,
    markups,
    defaultBreak,
    variants,
    sizes,
    variantAttribute,
    sizeAttribute,
    parts: manifest.parts ?? [],
    jsRequired: Boolean(manifest.jsRequired),
    events: events.map((eventName) => ({ eventName, propName: eventPropName(eventName) }))
  };
}

export function buildReactComponent(component) {
  const facts = wrapperFacts(component);
  const runtimeImport = facts.jsRequired
    ? `import { init, destroy } from "../../components/${facts.id}.js";`
    : `// ${facts.id} 는 JavaScript 런타임이 없다 — 브라우저 기본 동작만 쓴다.`;
  const eventProps = facts.events.map(({ propName }) => propName);
  const signature = ["variant", "size", "breakName = DEFAULT_BREAK", "parts", "className", "style", ...eventProps, "...rest"].join(", ");
  const eventEffect = facts.events.length === 0
    ? ""
    : `
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const props = { ${eventProps.join(", ")} };
    const bound = ${JSON.stringify(facts.events.map(({ eventName, propName }) => [eventName, propName]))}
      .map(([eventName, propName]) => [eventName, props[propName]])
      .filter(([, handler]) => typeof handler === "function");
    for (const [eventName, handler] of bound) root.addEventListener(eventName, handler);
    return () => { for (const [eventName, handler] of bound) root.removeEventListener(eventName, handler); };
  });
`;
  return `/* ${GENERATED_NOTE} */
/* ${facts.componentName} — 승인된 배포본을 그대로 마운트하는 React 껍데기.
   마크업을 새로 쓰지 않는다. MARKUPS 는 dist/examples/${facts.id}*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다.
   host 는 display:contents 라 레이아웃에 끼어들지 않는다. */
import { useEffect, useRef } from "react";
${runtimeImport}

export const MARKUPS = ${JSON.stringify(facts.markups, null, 2)};
export const DEFAULT_BREAK = ${JSON.stringify(facts.defaultBreak)};
export const BREAKS = ${JSON.stringify(Object.keys(facts.markups))};
export const VARIANTS = ${JSON.stringify(facts.variants)};
export const SIZES = ${JSON.stringify(facts.sizes)};
export const PARTS = ${JSON.stringify(facts.parts)};
/* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다.
   null 이면 그 축이 마크업 속성으로 드러나지 않아 prop 으로 바꿀 수 없다는 뜻이다. */
export const VARIANT_ATTRIBUTE = ${JSON.stringify(facts.variantAttribute)};
export const SIZE_ATTRIBUTE = ${JSON.stringify(facts.sizeAttribute)};

function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(\`[s1-ui] ${facts.id}: 승인되지 않은 \${label} "\${value}". 쓸 수 있는 값: \${allowed.join(", ")}\`);
}

export default function ${facts.componentName}({ ${signature} }) {
  const hostRef = useRef(null);
  const rootRef = useRef(null);
  assertAllowed("variant", variant, VARIANTS);
  assertAllowed("size", size, SIZES);
  assertAllowed("breakName", breakName, BREAKS);

  useEffect(() => {
    const host = hostRef.current;
    host.innerHTML = MARKUPS[breakName] ?? MARKUPS[DEFAULT_BREAK];
    const root = host.firstElementChild;
    rootRef.current = root;
${facts.jsRequired ? "    init(root);\n" : ""}    return () => {
${facts.jsRequired ? "      destroy(root);\n" : ""}      host.innerHTML = "";
      rootRef.current = null;
    };
  }, [breakName]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (variant !== undefined && VARIANT_ATTRIBUTE) root.setAttribute(VARIANT_ATTRIBUTE, variant);
    if (size !== undefined && SIZE_ATTRIBUTE) root.setAttribute(SIZE_ATTRIBUTE, size);
    if (className) root.className = className;
    if (style) Object.assign(root.style, style);
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined || value === null || value === false) root.removeAttribute(key);
      else root.setAttribute(key, value === true ? "" : String(value));
    }
    for (const [name, text] of Object.entries(parts ?? {})) {
      const target = root.querySelector(\`[data-s1-part="\${name}"]\`);
      if (target) target.textContent = text;
    }
  });
${eventEffect}
  return <div ref={hostRef} style={{ display: "contents" }} />;
}
`;
}

export function buildVueComponent(component) {
  const facts = wrapperFacts(component);
  const runtimeImport = facts.jsRequired
    ? `import { init, destroy } from "../../components/${facts.id}.js";`
    : `// ${facts.id} 는 JavaScript 런타임이 없다 — 브라우저 기본 동작만 쓴다.`;
  const emitNames = facts.events.map(({ propName }) => propName.replace(/^on/, "").toLowerCase());
  return `<!-- ${GENERATED_NOTE} -->
<!-- ${facts.componentName} — 승인된 배포본을 그대로 마운트하는 Vue 껍데기.
     MARKUPS 는 dist/examples/${facts.id}*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다. -->
<script setup>
import { onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
${runtimeImport}

const MARKUPS = ${JSON.stringify(facts.markups, null, 2)};
const DEFAULT_BREAK = ${JSON.stringify(facts.defaultBreak)};
const BREAKS = ${JSON.stringify(Object.keys(facts.markups))};
const VARIANTS = ${JSON.stringify(facts.variants)};
const SIZES = ${JSON.stringify(facts.sizes)};
/* variant·size 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다. */
const VARIANT_ATTRIBUTE = ${JSON.stringify(facts.variantAttribute)};
const SIZE_ATTRIBUTE = ${JSON.stringify(facts.sizeAttribute)};

/* defineProps 는 컴파일 타임 매크로라 인자가 setup() 밖으로 끌어올려진다 —
   여기서 위 상수들을 참조하면 SFC 가 컴파일되지 않는다(Vue 3.2+ 하드 제약).
   그래서 허용목록을 리터럴로 박아 넣는다. 값의 출처는 위 상수와 같은 manifest 다.
   (2026-09-04 독립 검증에서 19종 전부 컴파일 실패로 발견) */
const props = defineProps({
  variant: { type: String, default: undefined, validator: (value) => ${facts.variants.length ? `${JSON.stringify(facts.variants)}.includes(value)` : "true"} },
  size: { type: String, default: undefined, validator: (value) => ${facts.sizes.length ? `${JSON.stringify(facts.sizes)}.includes(value)` : "true"} },
  breakName: { type: String, default: ${JSON.stringify(facts.defaultBreak)}, validator: (value) => ${JSON.stringify(Object.keys(facts.markups))}.includes(value) },
  parts: { type: Object, default: () => ({}) },
  attrs: { type: Object, default: () => ({}) }
});
const emit = defineEmits(${JSON.stringify(emitNames)});

/* root 는 반드시 ref 여야 한다 — 보통 변수로 두면 watchEffect 가 setup 중 한 번 돌 때
   root 가 아직 없어 그대로 끝나고, 의존성이 하나도 등록되지 않아 **영원히 다시 돌지 않는다.**
   그러면 variant·size·parts 를 줘도 조용히 버려진다(오류도 경고도 없이).
   (2026-09-04 독립 검증 3차에서 19종 전부 이 상태로 발견) */
const host = ref(null);
const root = ref(null);
const listeners = [];

/* React 껍데기와 같게 승인되지 않은 값을 막는다 — Vue 의 validator 는 개발 빌드에서만 돈다. */
function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(\`[s1-ui] ${facts.id}: 승인되지 않은 \${label} "\${value}". 쓸 수 있는 값: \${allowed.join(", ")}\`);
}

function mount() {
  host.value.innerHTML = MARKUPS[props.breakName] ?? MARKUPS[DEFAULT_BREAK];
  const element = host.value.firstElementChild;
${facts.jsRequired ? "  init(element);\n" : ""}  for (const [eventName, emitName] of ${JSON.stringify(facts.events.map(({ eventName, propName }) => [eventName, propName.replace(/^on/, "").toLowerCase()]))}) {
    const handler = (event) => emit(emitName, event.detail ?? event);
    element.addEventListener(eventName, handler);
    listeners.push([eventName, handler]);
  }
  root.value = element;
}

function unmount() {
  const element = root.value;
  if (!element) return;
  for (const [eventName, handler] of listeners.splice(0)) element.removeEventListener(eventName, handler);
${facts.jsRequired ? "  destroy(element);\n" : ""}  root.value = null;
}

onMounted(mount);
onBeforeUnmount(unmount);

/* break 가 바뀌면 마크업 자체가 다른 파일이라 다시 마운트해야 한다.
   mount() 는 onMounted 로 한 번만 도니 여기서 갈아 끼운다
   (React 껍데기의 useEffect(..., [breakName]) 와 같은 동작).
   (2026-09-04 독립 검증 4차에서 Vue 만 반영이 안 되는 것으로 발견) */
watch(() => props.breakName, () => {
  if (!root.value) return;
  unmount();
  mount();
});

watchEffect(() => {
  const element = root.value;          // ref 를 먼저 읽어 의존성을 등록한다
  if (!element) return;
  assertAllowed("variant", props.variant, VARIANTS);
  assertAllowed("size", props.size, SIZES);
  assertAllowed("breakName", props.breakName, BREAKS);
  if (props.variant !== undefined && VARIANT_ATTRIBUTE) element.setAttribute(VARIANT_ATTRIBUTE, props.variant);
  if (props.size !== undefined && SIZE_ATTRIBUTE) element.setAttribute(SIZE_ATTRIBUTE, props.size);
  for (const [key, value] of Object.entries(props.attrs)) {
    if (value === undefined || value === null || value === false) element.removeAttribute(key);
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  for (const [name, text] of Object.entries(props.parts)) {
    const target = element.querySelector(\`[data-s1-part="\${name}"]\`);
    if (target) target.textContent = text;
  }
});
</script>

<template>
  <div ref="host" style="display: contents" />
</template>
`;
}

/* ── 6. 전체 묶음 ────────────────────────────────────────────────────── */

export function buildPlatformOutputs({ componentOutputs, tokensCss, typographyCss, distManifest, behaviorLedger, fingerprints }) {
  const outputs = new Map();
  const tokenData = readTokens(tokensCss);
  const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;

  outputs.set("platform/tokens.json", stable(buildTokensJson(tokenData, fingerprints)));
  outputs.set("platform/kotlin/S1Tokens.kt", buildKotlin(tokenData));
  outputs.set("platform/swift/S1Tokens.swift", buildSwift(tokenData));
  outputs.set("platform/cpp/s1_tokens.h", buildCppHeader(tokenData));
  outputs.set("platform/contract.json", stable(buildContract(componentOutputs, distManifest)));
  outputs.set("platform/behavior.json", stable({
    _meta: {
      note: GENERATED_NOTE,
      source: "registry/components/component-behavior.pc.json",
      purpose: "컴포넌트를 직접 구현해야 하는 네이티브(C++·Kotlin·iOS)가 상태 전이를 상상하지 않게 한다."
    },
    behavior: behaviorLedger
  }));

  const approved = componentOutputs.filter(({ manifest }) => manifest.status === "approved");
  for (const component of approved) {
    outputs.set(`platform/react/${component.id}.jsx`, buildReactComponent(component));
    outputs.set(`platform/vue/${pascalId(component.id)}.vue`, buildVueComponent(component));
  }
  outputs.set("platform/react/index.js", `/* ${GENERATED_NOTE} */\n${approved.map(({ id }) => `export { default as S1${pascalId(id)} } from "./${id}.jsx";`).join("\n")}\n`);
  outputs.set("platform/vue/index.js", `/* ${GENERATED_NOTE} */\n${approved.map(({ id }) => `export { default as S1${pascalId(id)} } from "./${pascalId(id)}.vue";`).join("\n")}\n`);

  outputs.set("platform/manifest.json", stable({
    _meta: { note: GENERATED_NOTE },
    canonicalFingerprint: distManifest.canonicalFingerprint,
    generatedAt: null,
    platforms: {
      "html-css-js": { entry: "s1-ui.css · s1-ui.auto.js", componentSupport: "full", lint: true },
      react: { entry: "platform/react/index.js", componentSupport: "full", lint: true, requires: "JSX 빌드 도구" },
      vue: { entry: "platform/vue/index.js", componentSupport: "full", lint: true, requires: "SFC 빌드 도구" },
      kotlin: { entry: "platform/kotlin/S1Tokens.kt", componentSupport: "tokens-only", lint: false },
      swift: { entry: "platform/swift/S1Tokens.swift", componentSupport: "tokens-only", lint: false },
      cpp: { entry: "platform/cpp/s1_tokens.h", componentSupport: "tokens-only", lint: false, note: "UI 프레임워크 미확정 — 상수와 JSON 까지만 제공한다." }
    },
    components: approved.map(({ id }) => id),
    tokenCount: tokenData.tokens.length
  }));
  return outputs;
}

export const _internal = { collectDeclarations, resolveValue, classify, colorToArgb };
