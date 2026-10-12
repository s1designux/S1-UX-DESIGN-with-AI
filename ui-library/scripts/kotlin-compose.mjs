/**
 * kotlin-compose.mjs — 승인 배포본에서 Jetpack Compose 부품을 뽑아낸다.
 * --------------------------------------------------------------------------
 * 입력: 컴포넌트별 CSS(승인본) · tokens.css · behavior.json 원장 · contract 축
 * 출력: platform/kotlin/*.kt (팔레트·스타일 표·부품·아이콘·미리보기) + 대조표
 *
 * [설계]
 *   값은 사람이 옮겨 적지 않는다. css-model.mjs 가 실제 캐스케이드로 계산한
 *   "이 부품이 이 상태일 때의 최종 선언"을 그대로 스타일 표로 굳힌다.
 *   그 추출 층(platform-spec.mjs 외)은 플랫폼 중립이라 Swift(SwiftUI)·C++(Qt) 생성기와 함께 쓴다 —
 *   이 파일에는 Kotlin 출력부(어떤 .kt 파일을 내는가)만 남아 있다.
 *   레이아웃 뼈대(Compose 트리)만 kotlin-components*.mjs 템플릿으로 있고, 치수·색은 전부 표에서 온다.
 *
 * [이 파일이 하지 않는 것]
 *   - CSS 에 없는 값을 채우지 않는다. 없으면 null 로 남고, 필요한 자리에서 빌드가 선다.
 *   - 승인되지 않은 variant·size·state 를 만들지 않는다. 축은 manifest 에서 온다.
 *   - 아무도 읽지 않은 CSS 선언은 coverage 보고서로 드러낸다(조용한 누락 방지).
 */

import { runtimeKt } from "./kotlin-runtime.mjs";
import { paletteKt, specKt } from "./kotlin-emit.mjs";
import { readIcon, iconsKt } from "./kotlin-icons.mjs";
import { readTextStyles, typeKt } from "./kotlin-typography.mjs";
import { MOBILE_PROFILE, MOBILE_COMPONENTS, extractComponents, modalFooterButtonSizes, usedIconsOf } from "./platform-spec.mjs";
import { dividerKt, dataTagKt, expandableCardKt, bottomSheetKt, bottomSheetOptionKt, datePickerKt, timePickerKt } from "./kotlin-components-mobile.mjs";
import { buttonKt, chipKt, controlKt, toggleKt, tabKt, selectKt, dropdownKt, inputKt, modalKt, mobileHeaderKt, mobileBottomNavKt, textareaKt, labelButtonKt, filterChipKt, galleryKt } from "./kotlin-components.mjs";

/* 추출 층은 platform-spec.mjs 로 옮겨 갔다. 옛 import 경로(대조 검사기·미리보기 생성기)가 그대로 동작하도록 다시 내보낸다. */
export const PLANS = MOBILE_PROFILE.plans;
export const EXTRA_PLANS = MOBILE_PROFILE.extraPlans;
export const EXTRA_CSS_OWNERS = MOBILE_PROFILE.extraCssOwners;
export { extractSpec, mobileOnly, apiOf, planFor, DISPLAY_ONLY_PROPERTIES } from "./platform-spec.mjs";
export { _internal } from "./platform-values.mjs";

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";
const PACKAGE = "com.s1.designsystem";

const pascal = (id) => id.split(/[-_ ]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/** A안 범위 — 화면 부품으로 옮기는 스물세 가지. 여기 없는 컴포넌트는 값(S1Tokens)만 제공한다. */
export const COMPOSE_COMPONENTS = MOBILE_COMPONENTS;

const COMPONENT_FILE = {
  button: (pkg, api) => buttonKt(pkg, api),
  chip: (pkg, api) => chipKt(pkg, api),
  checkbox: (pkg) => controlKt(pkg, "checkbox"),
  radio: (pkg) => controlKt(pkg, "radio"),
  toggle: (pkg) => toggleKt(pkg),
  tab: (pkg, api) => tabKt(pkg, api),
  dropdown: (pkg, api) => dropdownKt(pkg, api),
  "mobile-header": (pkg, api) => mobileHeaderKt(pkg, api),
  "mobile-bottom-nav": (pkg, api) => mobileBottomNavKt(pkg, api),
  textarea: (pkg) => textareaKt(pkg),
  "text-button": (pkg, api) => labelButtonKt(pkg, api, "text-button"),
  "assist-button": (pkg, api) => labelButtonKt(pkg, api, "assist-button"),
  "filter-chip": (pkg, api) => filterChipKt(pkg, api),
  divider: (pkg, api) => dividerKt(pkg, api),
  "data-tag": (pkg, api) => dataTagKt(pkg, api),
  "expandable-card": (pkg, api) => expandableCardKt(pkg, api),
  "bottom-sheet": (pkg, api) => bottomSheetKt(pkg, api),
  "bottom-sheet-option": (pkg, api) => bottomSheetOptionKt(pkg, api),
  "date-picker": (pkg, api) => datePickerKt(pkg, api),
  "time-picker": (pkg, api) => timePickerKt(pkg, api)
};

export function buildKotlinOutputs({ componentOutputs, tokenData, iconAssets, typographyCss, pkg = PACKAGE }) {
  const { tokenValues, byId, specs, apis, coverage } = extractComponents({ componentOutputs, tokenData, profile: MOBILE_PROFILE });
  const outputs = new Map();

  for (const spec of specs) outputs.set(`platform/kotlin/S1${pascal(spec.id)}Spec.kt`, specKt(pkg, spec, GENERATED_NOTE));

  /* 부품 파일은 축을 다 안 뒤에 만든다 — select 는 dropdown 의 축을 알아야 목록을 부를 수 있다. */
  for (const id of MOBILE_PROFILE.components) {
    const api = apis[id];
    const build = COMPONENT_FILE[id];
    const text = build
      ? build(pkg, api)
      : id === "select"
        ? selectKt(pkg, api, apis.dropdown)
        : id === "input"
          ? inputKt(pkg, api)
          : modalKt(pkg, api, modalFooterButtonSizes(byId.get(id))[api.breakName]);
    outputs.set(`platform/kotlin/S1${pascal(id)}.kt`, text);
  }

  outputs.set("platform/kotlin/S1Style.kt", runtimeKt(pkg));
  outputs.set("platform/kotlin/S1Palette.kt", paletteKt(pkg, tokenData.tokens, GENERATED_NOTE));
  const textStyles = readTextStyles(typographyCss, tokenValues);
  outputs.set("platform/kotlin/S1Type.kt", typeKt(pkg, textStyles, GENERATED_NOTE));

  const icons = usedIconsOf(specs).map((name) => {
    const asset = iconAssets.find(({ file }) => file === `${name}.svg`);
    if (!asset) throw new Error(`아이콘 ${name}.svg 가 배포본에 없습니다.`);
    return readIcon(name, asset.asset);
  });
  outputs.set("platform/kotlin/S1Icons.kt", iconsKt(pkg, icons, GENERATED_NOTE));
  outputs.set("platform/kotlin/preview/S1Gallery.kt", galleryKt(pkg, apis));

  return { outputs, coverage, icons: icons.map(({ name }) => name), textStyles: textStyles.map(({ name }) => name) };
}
