/**
 * platform-spec.mjs — 승인 배포본에서 "부품별 조합 → 최종 값" 표를 뽑는 공유 층. 플랫폼 중립.
 * --------------------------------------------------------------------------
 * Kotlin(Compose) · Swift(SwiftUI) · C++(Qt) 생성기가 모두 여기서 표를 받는다.
 * 입력: 컴포넌트별 CSS(승인본) · tokens.css · manifest(축)
 * 출력: extractSpec → { axes, table:{키→{combo, parts:{부품→정규화 값}}}, extras, unused, ignored } — 순수 JSON.
 *
 * [구성]
 *   platform-values.mjs        CSS 선언 → 정규화 상자 값(toBox)
 *   platform-plans-core.mjs    코어 부품 16종의 검사 트리(무엇을 물을지)
 *   platform-plans-mobile.mjs  모바일 부품 7종의 검사 트리
 *   이 파일                     profile(어느 화면 한 벌을 쓰나) + 추출 + 읽힘 분류 + 일괄 추출
 *
 * [profile — 화면 한 벌]
 *   안드로이드·iOS 는 모바일 한 벌만 쓴다(태블릿도 모바일. river 결정 2026-09-09·2026-10-02).
 *   C++(Qt)는 PC 한 벌을 쓸 것이므로 같은 층에 PC profile 을 꽂는다:
 *
 *     import { makeProfile, extractComponents } from "./platform-spec.mjs";
 *     import { CORE_PLANS, CORE_EXTRA_PLANS } from "./platform-plans-core.mjs";
 *     export const PC_PROFILE = makeProfile({
 *       name: "pc", breakName: "pc",
 *       plans: { ...CORE_PLANS, ...PC_PLANS },   // PC 전용 부품의 plan 은 {id, axes, combos, key, build} 한 벌
 *       extraPlans: { ...CORE_EXTRA_PLANS },
 *       components: [...PC 범위...]
 *     });
 *     const { specs, apis, coverage } = extractComponents({ componentOutputs, tokenData, profile: PC_PROFILE });
 *
 * [이 파일이 하지 않는 것]
 *   - CSS 에 없는 값을 채우지 않는다. 없으면 null 로 남고, 필요한 자리에서 빌드가 선다.
 *   - 승인되지 않은 variant·size·state 를 만들지 않는다. 축은 manifest 에서 온다.
 */

import { parseStylesheet, computeStyle, unusedDeclarations } from "./css-model.mjs";
import { toBox, BOX_PROPERTIES, DISPLAY_ONLY_PROPERTIES } from "./platform-values.mjs";
import { CORE_PLANS, CORE_EXTRA_PLANS } from "./platform-plans-core.mjs";
import { MOBILE_PLANS, MOBILE_EXTRA_PLANS, MOBILE_EXTRA_CSS, MOBILE_PC_ONLY_SELECTORS } from "./platform-plans-mobile.mjs";

export { DISPLAY_ONLY_PROPERTIES };

/* ── 1. profile ──────────────────────────────────────────────────────── */

/** break 축이 있는 컴포넌트만 그 화면 한 벌로 좁힌다. 축이 없는 것(체크박스·라디오·토글·드롭다운)은 그대로 둔다. */
export function narrowTo(manifest, breakName) {
  if (!manifest.breaks || !manifest.breaks[breakName]) return manifest;
  return { ...manifest, breaks: { [breakName]: manifest.breaks[breakName] } };
}

/**
 * 어느 화면 한 벌을 쓰는지와, 그 한 벌의 범위를 한 묶음으로 든다.
 *   components          이 profile 이 다루는 부품(생성 순서)
 *   strict              값이 하나라도 표에 못 옮겨지면 빌드가 서는 부품
 *   otherSelectorHints  크기·화면 조건으로 거를 수 없는 "다른 한 벌 전용" 선택자 조각
 */
export function makeProfile({ name, breakName, plans, extraPlans = {}, extraCssOwners = {}, otherSelectorHints = {}, components = [], strict = [], otherBreakName = breakName === "mobile" ? "pc" : "mobile", otherReason = `${otherBreakName}-only` }) {
  return { name, breakName, plans, extraPlans, extraCssOwners, otherSelectorHints, components, strict: new Set(strict), otherBreakName, otherReason };
}

/** 모바일 부품 전체 범위 — 안드로이드(Kotlin)와 iOS(Swift)가 같은 집합을 낸다(river 승인 2026-10-02). */
export const MOBILE_COMPONENTS = ["button", "input", "checkbox", "radio", "toggle", "chip", "dropdown", "select", "tab", "modal", "mobile-header", "mobile-bottom-nav", "textarea", "text-button", "assist-button", "filter-chip", "bottom-sheet-option", "bottom-sheet", "date-picker", "time-picker", "expandable-card", "divider", "data-tag"];

/** 값이 하나라도 표에 옮겨지지 않으면 빌드가 서는 부품 — 새로 들어온 모바일 부품이다(기존 부품의 알려진 잔여는 coverage 에만 남긴다). */
const STRICT_COMPONENTS = ["bottom-sheet-option", "bottom-sheet", "date-picker", "time-picker", "expandable-card", "divider", "data-tag"];

export const MOBILE_PROFILE = makeProfile({
  name: "mobile",
  breakName: "mobile",
  /* 모바일 부품 7종 — 묶음 순서(component-ids.mjs)를 따른다. 대조 검사가 이 순서로 CSS 를 겹쳐 놓는다. */
  plans: { ...CORE_PLANS, ...MOBILE_PLANS },
  extraPlans: { ...CORE_EXTRA_PLANS, ...MOBILE_EXTRA_PLANS },
  extraCssOwners: MOBILE_EXTRA_CSS,
  otherSelectorHints: MOBILE_PC_ONLY_SELECTORS,
  components: MOBILE_COMPONENTS,
  strict: STRICT_COMPONENTS
});

/* ── 2. 축 ────────────────────────────────────────────────────────────── */

export const mobileOnly = (manifest) => narrowTo(manifest, "mobile");

/** 부품이 실제로 받는 축 — 값이 하나뿐인 축은 파라미터로 내보내지 않는다. */
export function apiOf(id, manifest, profile = MOBILE_PROFILE) {
  const narrowed = narrowTo(manifest, profile.breakName);
  const sizes = narrowed.breaks ? narrowed.breaks[profile.breakName] : (narrowed.sizes ?? []);
  const variants = narrowed.variants ?? [];
  return {
    id,
    sizes,
    sizeParam: sizes.length > 1,
    size: sizes[0] ?? null,
    breakName: narrowed.breaks ? profile.breakName : null,
    variants,
    variantParam: variants.length > 1,
    variant: variants[0] ?? null
  };
}

export function planFor(id, manifest, planOptions, profile = MOBILE_PROFILE) {
  return profile.plans[id](narrowTo(manifest, profile.breakName), planOptions);
}

/* ── 3. 스펙 추출 ────────────────────────────────────────────────────── */

/**
 * 승인 CSS 가 쓰는 "공개 손잡이"(--s1-… 사용자 지정 속성)를 값으로 푼다.
 * 손잡이는 감싸는 부품이 안쪽 부품의 값을 갈아 끼우는 통로다(시트의 간격·그림자).
 * 토큰이 아닌 var() 만 여기서 푼다 — 토큰 참조(var(--spacing-48) 등)는 그대로 둬야 S1Tokens 를 가리킬 수 있다.
 */
function resolveHandles(node, style, rules, { mediaActive, usage, tokenValues }) {
  const needs = Object.values(style).some((value) => /var\(\s*--s1-/.test(value));
  if (!needs) return style;
  const handles = new Map();
  const chain = [];
  for (let current = node; current; current = current.parent) chain.unshift(current);
  for (const ancestor of chain) {
    const own = computeStyle(ancestor, rules, { mediaActive, usage });
    for (const [property, value] of Object.entries(own)) if (property.startsWith("--s1-")) handles.set(property, value);
  }
  const out = {};
  for (const [property, value] of Object.entries(style)) {
    out[property] = value.replace(/var\(\s*(--s1-[a-z0-9-]+)\s*\)/g, (whole, name) => {
      if (tokenValues.has(name)) return whole;
      if (!handles.has(name)) throw new Error(`손잡이 ${name} 의 값을 찾지 못했습니다 — 어느 조상도 정하지 않았습니다.`);
      return handles.get(name);
    });
  }
  return out;
}

/**
 * 읽은 선언 중 toBox 가 값으로 옮기지도, 표시 규칙이라고 선언하지도 않은 속성.
 * 이게 있으면 "계산은 했는데 표에는 안 들어간 값"이 있다는 뜻이다 — 조용히 넘기지 않고 드러낸다.
 */
function ignoredProperties(style) {
  return Object.keys(style).filter((property) => !property.startsWith("--") && !BOX_PROPERTIES.has(property) && !DISPLAY_ONLY_PROPERTIES.has(property));
}

export function extractSpec({ id, css, extraCss = [], manifest, tokenValues, planOptions, profile = MOBILE_PROFILE }) {
  const own = parseStylesheet(css);
  /* 같은 묶음 안에서 뒤에 오는 부품의 CSS — 시트처럼 다른 부품의 모양을 입는 부품이 쓴다.
     읽히지 않은 선언은 이 부품 몫(own)만 센다. */
  let offset = own.length;
  const rules = [...own];
  for (const extra of extraCss) {
    for (const rule of parseStylesheet(extra)) { rule.order += offset; rules.push(rule); }
    offset = rules.length;
  }
  const usage = new Set();
  const ignored = new Map();
  const collect = (plan) => {
    const table = {};
    for (const combo of plan.combos) {
      const { targets, mediaActive } = plan.build(combo);
      const key = plan.key(combo);
      table[key] = { combo, parts: {} };
      for (const [name, target] of Object.entries(targets)) {
        const raw = computeStyle(target.node, rules, {
          pseudoElement: target.pseudoElement ?? null,
          mediaActive,
          usage
        });
        const style = resolveHandles(target.node, raw, rules, { mediaActive, usage, tokenValues });
        for (const property of ignoredProperties(style)) {
          const entry = ignored.get(property) ?? { property, samples: new Set() };
          entry.samples.add(`${plan.id}/${key}/${name}: ${style[property]}`);
          ignored.set(property, entry);
        }
        table[key].parts[name] = toBox(style, tokenValues, `${id}/${key}/${name}`);
      }
    }
    return { axes: plan.axes, table };
  };

  const main = collect(planFor(id, manifest, planOptions, profile));
  const extras = {};
  for (const factory of profile.extraPlans[id] ?? []) {
    const plan = factory(narrowTo(manifest, profile.breakName));
    extras[plan.id] = collect(plan);
  }
  return {
    id, axes: main.axes, table: main.table, extras,
    unused: unusedDeclarations(own, usage),
    ignored: [...ignored.values()].map((entry) => ({ property: entry.property, samples: [...entry.samples].slice(0, 3) }))
  };
}

/* ── 4. 읽힘 분류 · 계획 옵션 ────────────────────────────────────────── */

/**
 * 읽히지 않은 선언이 왜 안 읽혔는지 기계로 가른다.
 * 다른 화면 한 벌 전용 규칙과 표시·배치 규칙은 뜻이 전혀 다르다 —
 * 한 덩어리로 묶어 놓으면 "빠뜨린 값"을 그 안에 숨길 수 있다.
 */
export function classifyUnread(unread, api, profile = MOBILE_PROFILE) {
  const ownSizes = new Set(api.sizes);
  const hints = profile.otherSelectorHints[api.id] ?? [];
  return unread.map((one) => {
    const selector = one.selector;
    const sizes = [...selector.matchAll(/data-size="([a-z]+)"/g)].map((match) => match[1]);
    const other = selector.includes(`data-break="${profile.otherBreakName}"`)
      || selector.includes(`:not([data-break="${profile.breakName}"])`)
      || (sizes.length > 0 && sizes.every((size) => !ownSizes.has(size)))
      || hints.some((pattern) => pattern.test(selector));
    return { ...one, reason: other ? profile.otherReason : "display-rule" };
  });
}

/** 승인된 예제 마크업에서 모달 푸터 버튼 크기를 읽는다 — 값을 정하지 않고 읽는다. */
export function modalFooterButtonSizes(component) {
  const sizes = {};
  for (const [breakName, html] of Object.entries(component.exampleByBreak ?? {})) {
    const match = /data-s1-component="button"[^>]*data-size="([a-z]+)"/.exec(html);
    if (!match) throw new Error(`modal ${breakName}: 예제에서 푸터 버튼 크기를 찾지 못했습니다.`);
    sizes[breakName] = match[1];
  }
  return sizes;
}

/** 시트 푸터 버튼 크기 — 승인 예제(루트 시트의 푸터 버튼)에서 읽는다. 예제에 없으면 멈춘다. */
export function footerButtonSizeOf(component, breakName) {
  const html = component.exampleByBreak?.[breakName] ?? component.example;
  const match = /data-s1-part="sheet-footer"[\s\S]*?data-s1-component="button"[^>]*data-size="([a-z]+)"/.exec(html);
  if (!match) throw new Error(`${component.id}: 예제에서 푸터 버튼 크기를 찾지 못했습니다.`);
  return match[1];
}

/** 부품별 plan 옵션 — 승인 예제에서 읽은 값. */
export function planOptionsFor(id, component, profile = MOBILE_PROFILE) {
  return id === "modal" ? modalFooterButtonSizes(component)
    : id === "bottom-sheet" ? { footerButtonSize: footerButtonSizeOf(component, profile.breakName) }
    : undefined;
}

/* ── 5. 일괄 추출 ────────────────────────────────────────────────────── */

/**
 * profile 의 부품 전부를 추출한다. 생성기(Kotlin·Swift·C++)가 같은 함수를 부른다.
 *   반환: { tokenValues, byId, specs[], apis{}, coverage[] }
 */
export function extractComponents({ componentOutputs, tokenData, profile = MOBILE_PROFILE }) {
  const tokenValues = new Map(tokenData.tokens.map((token) => [token.name, token.value]));
  const byId = new Map(componentOutputs.map((component) => [component.id, component]));
  const specs = [];
  const coverage = [];
  const apis = {};
  for (const id of profile.components) {
    const component = byId.get(id);
    if (!component) throw new Error(`${profile.name} 범위에 있는 ${id} 가 배포본에 없습니다.`);
    if (component.manifest.status !== "approved") throw new Error(`${id} 는 승인 상태가 아닙니다(${component.manifest.status}).`);
    const planOptions = planOptionsFor(id, component, profile);
    const extraCss = (profile.extraCssOwners[id] ?? []).map((owner) => {
      const other = byId.get(owner);
      if (!other) throw new Error(`${id} 가 겹쳐 읽는 ${owner} 의 CSS 가 배포본에 없습니다.`);
      return other.css;
    });
    const spec = extractSpec({ id, css: component.css, extraCss, manifest: component.manifest, tokenValues, planOptions, profile });
    if (profile.strict.has(id) && spec.ignored.length > 0) {
      throw new Error(`${id}: 계산은 했지만 표에 옮기지 못한 속성이 있습니다 — ${spec.ignored.map((one) => `${one.property} (${one.samples[0]})`).join(" · ")}. toBox 에 옮기거나 DISPLAY_ONLY_PROPERTIES 에 이유와 함께 올리세요.`);
    }
    specs.push(spec);
    const api = apiOf(id, component.manifest, profile);
    const unread = classifyUnread(spec.unused, api, profile);
    coverage.push({
      component: id,
      combinations: Object.keys(spec.table).length,
      parts: Object.keys(Object.values(spec.table)[0].parts),
      unreadPcOnly: unread.filter((one) => one.reason === profile.otherReason).length,
      unreadDisplayRules: unread.filter((one) => one.reason === "display-rule").length,
      unreadDeclarations: unread,
      /* 계산은 했지만 표에 옮기지 않은 속성 — 값이면 빠뜨린 것이다. 비어 있어야 한다. */
      ignoredProperties: spec.ignored
    });
    apis[id] = api;
  }
  return { tokenValues, byId, specs, apis, coverage };
}

/** 표에 쓰인 아이콘 이름 모음(정렬) — 아이콘 파일을 만들 때 쓴다. */
export function usedIconsOf(specs) {
  const used = new Set();
  for (const spec of specs) {
    const tables = [spec.table, ...Object.values(spec.extras ?? {}).map((extra) => extra.table)];
    for (const table of tables) {
      for (const row of Object.values(table)) {
        for (const box of Object.values(row.parts)) if (box.icon) used.add(box.icon);
      }
    }
  }
  return [...used].sort();
}
