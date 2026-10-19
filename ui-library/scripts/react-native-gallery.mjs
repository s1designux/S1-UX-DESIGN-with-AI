/**
 * react-native-gallery.mjs — 승인 조합을 한 화면에 늘어놓는 갤러리(S1Gallery)와 그 조합 목록(cases.js)
 * --------------------------------------------------------------------------
 * 조합은 사람이 고르지 않는다. 표(spec)의 루트 요소가 읽는 상태에서 기계로 뽑는다.
 *   변형(variant) × 크기(size) 전부 · 첫 크기에서 상호작용 상태(hover·pressed·focus·disabled) ·
 *   루트가 읽는 속성 상태(aria-pressed·aria-checked·data-state …) 하나씩
 * cases.js 는 데이터라서 렌더 대조 도구가 같은 목록으로 웹 쪽 DOM 도 만든다 — 양쪽이 같은 조합을 본다.
 */

import { GENERATED_NOTE } from "./react-native-emit.mjs";
import { STATE_ALSO, STATE_CASES } from "./react-native-states.mjs";

const pascalId = (id) => id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/** 루트 표(n0)에서 상태 차원을 읽는다. */
function rootDimsOf(template) {
  const table = template.tables.n0;
  return table && table.dims ? table.dims.filter((dim) => dim.n === "n0") : [];
}

/* 열린 패널이 놓일 자리 높이 — 패널이 아래로 펼쳐지므로 칸이 그만큼 있어야 비교 화면에서 잘리지 않는다. */
const opensPanelHeight = (id, breakName) => (id === "date-picker" ? (breakName === "mobile" ? 700 : 460) : id === "time-picker" ? (breakName === "mobile" ? 700 : 420) : 200);

const AXIS_ATTRIBUTES = new Set(["data-variant", "data-size", "data-type", "data-mode", "data-footer", "data-break", "data-shape", "data-tone"]);

export function buildCases({ factsList, manifests, specs }) {
  const cases = [];
  const stateBreaks = new Set();
  for (const facts of factsList) {
    const spec = specs.get(facts.id);
    const manifest = manifests.get(facts.id);
    spec.templates.forEach((template) => {
      const rootStyleList = template.tables.n0?.map
        ? [...new Set(Object.values(template.tables.n0.map))].map((index) => spec.styles[index])
        : [spec.styles[template.tables.n0.s]];
      const overlay = rootStyleList.some((style) => style.position === "fixed");
      const hiddenRoot = Object.hasOwn(template.rootAttributes ?? {}, "hidden");
      const variantList = Array.isArray(template.variants)
        ? (template.variants.length ? template.variants : [undefined])
        : (facts.variants.length > 1 ? facts.variants : [undefined]);
      const breakSizes = manifest.breaks?.[template.break]?.length ? manifest.breaks[template.break] : facts.sizes;
      const sizeList = facts.sizes.length > 1 ? breakSizes : [undefined];
      const dims = rootDimsOf(template);
      const base = { breakName: template.break };
      if (template.mode) base.mode = template.mode;
      /* 구조를 가르는 속성(list-row 유형 · bottom-sheet-option 선택 상태 등)은 이 묶음의 값으로 고정한다 */
      const selectorProps = {};
      const selectorAttributes = {};
      for (const name of Object.keys(template.selects ?? {})) {
        if (name === template.axis.variant || name === template.axis.size) continue;
        const own = template.rootAttributes?.[name];
        if (own !== undefined) { selectorProps[name] = own; selectorAttributes[name] = own; }
      }
      Object.assign(base, selectorProps);
      const web = (extra) => ({ example: template.src.example, instance: template.src.instance, ...extra });

      const make = (props, label, webExtra) => {
        const merged = { ...base, ...props };
        if (hiddenRoot && merged.open === undefined) merged.open = true;
        cases.push({
          id: `${facts.id}/${template.name}/${label}`,
          component: facts.componentName,
          break: template.break,
          title: `${facts.id} · ${template.name} · ${label}`,
          frame: overlay
            ? { width: template.break === "mobile" ? 360 : 440, height: 520, clip: true }
            : (webExtra?.open ? { width: template.break === "mobile" ? 360 : 480, height: opensPanelHeight(facts.id, template.break) } : undefined),
          /* 모바일의 날짜·시간 시트는 화면 전체를 덮는 겹침이 부품 안쪽에 들어 있다 — RN 은 Modal 로 그리고 웹은 화면 고정이라 칸 안에서 자리를 견줄 수 없다 */
          skipCompare: Boolean(webExtra?.open && template.break === "mobile" && ["date-picker", "time-picker"].includes(facts.id)) || undefined,
          props: merged,
          web: web({ ...webExtra, attributes: { ...(webExtra?.attributes ?? {}) } })
        });
      };

      const variantAttr = (value) => (value === undefined ? {} : { [template.axis.variant]: value });
      const sizeAttr = (value) => (value === undefined ? {} : { [template.axis.size]: value });

      /* ① 변형 × 크기 */
      for (const variant of variantList) {
        for (const size of sizeList) {
          const props = {};
          if (variant !== undefined) props.variant = variant;
          if (size !== undefined) props.size = size;
          make(props, `${variant ?? "-"}/${size ?? "-"}/default`, { attributes: { ...selectorAttributes, ...variantAttr(variant), ...sizeAttr(size) } });
        }
      }

      /* ② 상태 — 첫 크기, 변형마다 */
      const firstSize = sizeList[0];
      const states = [];
      const has = (kind, name) => dims.some((dim) => dim[kind] === name);
      if (has("p", "hover")) states.push({ label: "hover", props: { forceState: "hover" }, force: "hover" });
      if (has("p", "active")) states.push({ label: "pressed", props: { forceState: "pressed" }, force: "pressed" });
      if (has("p", "focus") || has("p", "focus-visible")) states.push({ label: "focus", props: { forceState: "focus" }, force: "focus" });
      if (has("p", "disabled")) states.push({ label: "disabled", props: { disabled: true }, disabled: true });
      for (const dim of dims.filter((one) => one.a !== undefined && !AXIS_ATTRIBUTES.has(one.a) && one.a !== "hidden" && !Object.hasOwn(template.selects ?? {}, one.a))) {
        const own = template.rootAttributes?.[dim.a];
        for (const value of dim.d) {
          if (value === "∅" || value === "•" || value === own) continue;
          states.push({ label: `${dim.a}=${value}`, props: { [dim.a]: value }, attributes: { [dim.a]: value } });
        }
      }
      /* 열림 — 트리거가 여는 패널(셀렉트·필터 칩·날짜·시간)은 열린 모양도 한 칸 */
      const opensPanel = Object.values(template.nodes).some((node) => node.part === "trigger") && Object.values(template.nodes).some((node) => node.part === "panel" || node.part === "sheet");
      if (opensPanel) {
        for (const variant of variantList) {
          const props = { open: true };
          if (variant !== undefined) props.variant = variant;
          if (firstSize !== undefined) props.size = firstSize;
          make(props, `${variant ?? "-"}/${firstSize ?? "-"}/open`, { attributes: { ...selectorAttributes, ...variantAttr(variant), ...sizeAttr(firstSize) }, open: true });
        }
      }
      for (const variant of variantList) {
        for (const state of states) {
          const props = { ...state.props };
          if (variant !== undefined) props.variant = variant;
          if (firstSize !== undefined) props.size = firstSize;
          make(props, `${variant ?? "-"}/${firstSize ?? "-"}/${state.label}`, {
            attributes: { ...selectorAttributes, ...variantAttr(variant), ...sizeAttr(firstSize), ...(state.attributes ?? {}) },
            force: state.force,
            disabled: state.disabled
          });
        }
      }

      /* ③ 정본이 허용하는 나머지 상태(react-native-states.mjs) — 화면(break)마다 첫 템플릿에만 붙인다 */
      const stateKey = `${facts.id}/${template.break}`;
      if (!stateBreaks.has(stateKey)) {
        stateBreaks.add(stateKey);
        for (const entry of STATE_CASES[facts.id] ?? []) {
          if (entry.only && entry.only !== template.break) continue;
          const variant = variantList[0];
          const props = { ...(entry.props ?? {}) };
          if (entry.partProps) props.partProps = { ...(props.partProps ?? {}), ...entry.partProps };
          if (variant !== undefined) props.variant = variant;
          if (firstSize !== undefined) props.size = firstSize;
          const webSpec = entry.web ?? {};
          make(props, `${variant ?? "-"}/${firstSize ?? "-"}/${entry.label}`, {
            attributes: { ...selectorAttributes, ...variantAttr(variant), ...sizeAttr(firstSize), ...(webSpec.attributes ?? {}) },
            parts: webSpec.parts,
            force: webSpec.force,
            disabled: webSpec.disabled,
            act: entry.act
          });
        }
      }
    });
  }
  /* 완전성 — 정본이 허용하는 상태는 하나도 빠지지 않아야 한다(덮이지 않으면 빌드를 멈춘다). */
  const missing = [];
  for (const facts of factsList) {
    const manifest = manifests.get(facts.id);
    const labels = new Set(cases.filter((one) => one.id.startsWith(`${facts.id}/`)).map((one) => one.id.split("/").slice(4).join("/")));
    const covered = new Set((STATE_CASES[facts.id] ?? []).flatMap((entry) => entry.covers));
    for (const key of Object.keys(manifest.states ?? {})) {
      if (covered.has(key)) continue;
      const also = STATE_ALSO[facts.id]?.[key];
      if (also === undefined) { missing.push(`${facts.id}.${key}`); continue; }
      if (also.startsWith("label:") && !labels.has(also.slice(6))) missing.push(`${facts.id}.${key} (조합 ${also.slice(6)} 이 만들어지지 않았다)`);
    }
  }
  if (missing.length) throw new Error(`[react-native gallery] 정본이 허용하는 상태가 조합에 없습니다: ${missing.join(", ")}. react-native-states.mjs 에 연결을 적으세요.`);
  return cases;
}

export function galleryFiles({ factsList, manifests, specs }) {
  const out = new Map();
  const cases = buildCases({ factsList, manifests, specs });
  out.set("gallery/cases.js", `/* ${GENERATED_NOTE} */
/* 승인 조합 목록 — 표(specs/*.js)의 루트가 읽는 상태에서 기계로 뽑았다.
   props 는 부품에 그대로 넘기는 값이고, web 은 같은 조합을 웹 배포본 DOM 으로 만들 때 쓰는 정보다(렌더 대조 도구가 읽는다). */
export const CASES = ${JSON.stringify(cases, null, 1)};
`);
  out.set("gallery/S1Gallery.js", `/* ${GENERATED_NOTE} */
/* S1Gallery — 승인 조합을 한 화면에 늘어놓는다. 앱에 그대로 올려 부품이 제대로 나오는지 눈으로 확인하는 용도다.
     <S1Provider dark={false} fontFamily="Pretendard"><S1Gallery /></S1Provider>
   only 로 부품을 고르고, break 로 PC·Mobile 을 고른다. */
import { ScrollView, Text, View } from "react-native";
import { paint, useS1 } from "../engine.js";
import { CASES } from "./cases.js";
${factsList.map((facts) => `import ${facts.componentName} from "../components/${facts.id}.js";`).join("\n")}

const COMPONENTS = { ${factsList.map((facts) => facts.componentName).join(", ")} };

export function S1Gallery({ only, breakName, columns }) {
  const { dark } = useS1();
  const shown = CASES.filter((one) => (only === undefined || only.includes(one.component) || only.includes(one.id.split("/")[0])) && (breakName === undefined || one.break === breakName));
  const sections = [];
  for (const one of shown) {
    const last = sections[sections.length - 1];
    if (last && last.component === one.component) last.items.push(one);
    else sections.push({ component: one.component, items: [one] });
  }
  const ink = paint("--color-text-title-primary", dark);
  const mute = paint("--color-text-body-secondary", dark);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: paint("--color-bg-level-0", dark) }} contentContainerStyle={{ padding: 16, gap: 24 }}>
      {sections.map((section) => (
        <View key={section.component} style={{ gap: 12 }}>
          <Text style={{ color: ink, fontSize: 16, fontWeight: "700" }}>{section.component}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
            {section.items.map((one) => {
              const Component = COMPONENTS[one.component];
              return (
                <View key={one.id} style={{ gap: 6, width: columns ? undefined : undefined }}>
                  <Text style={{ color: mute, fontSize: 10 }}>{one.id.split("/").slice(1).join(" · ")}</Text>
                  <View style={one.frame ? { width: one.frame.width, height: one.frame.height, overflow: one.frame.clip ? "hidden" : "visible", position: "relative" } : undefined}>
                    <Component {...one.props} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
`);
  return out;
}

export { pascalId };
