/**
 * swift-compose.mjs — 승인 배포본에서 SwiftUI 부품(Swift Package)을 뽑아낸다.
 * --------------------------------------------------------------------------
 * 입력: 컴포넌트별 CSS(승인본) · tokens.css · typography.css · 아이콘 SVG
 * 출력: platform/swift/*.swift (팔레트·스타일 표·부품·아이콘·미리보기) + Package.swift + 대조표
 *
 * [설계]
 *   값은 사람이 옮겨 적지 않는다. Kotlin 과 같은 중립 추출 층(platform-spec.mjs)이
 *   배포본 CSS 를 캐스케이드까지 계산해 "이 부품이 이 상태일 때의 최종 선언"을 표로 뽑는다.
 *   이 파일은 그 표를 Swift 로 굳히는 출력부일 뿐이다 — 어떤 .swift 파일을 내는가만 안다.
 *   레이아웃 뼈대(SwiftUI 트리)는 swift-components*.mjs 템플릿에 있고, 치수·색은 전부 표에서 온다.
 *
 * [이 파일이 하지 않는 것]
 *   - CSS 에 없는 값을 채우지 않는다. 없으면 nil 로 남고, 필요한 자리에서 빌드가 선다.
 *   - 승인되지 않은 variant·size·state 를 만들지 않는다. 축은 manifest 에서 온다.
 *   - 아무도 읽지 않은 CSS 선언은 coverage 보고서로 드러낸다(조용한 누락 방지).
 */

import { MOBILE_PROFILE, extractComponents, modalFooterButtonSizes, usedIconsOf } from "./platform-spec.mjs";
import { readIcon } from "./platform-icons.mjs";
import { readTextStyles } from "./platform-typography.mjs";
import { paletteSwift, specSwift } from "./swift-emit.mjs";
import { runtimeSwift, iconRuntimeSwift } from "./swift-runtime.mjs";
import { iconsSwift, typeSwift } from "./swift-icons.mjs";
import { buttonSwift, chipSwift, controlSwift, toggleSwift, tabSwift, dropdownSwift, selectSwift, inputSwift, modalSwift, mobileBottomNavSwift, mobileHeaderSwift, textareaSwift, labelButtonSwift, filterChipSwift } from "./swift-components.mjs";
import { dividerSwift, dataTagSwift, expandableCardSwift, bottomSheetSwift, bottomSheetOptionSwift, datePickerSwift, timePickerSwift } from "./swift-components-mobile.mjs";
import { gallerySwift } from "./swift-gallery.mjs";

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";

const pascal = (id) => id.split(/[-_ ]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/** 부품 id → 파일 내용. 파일 이름은 S1{Pascal}.swift 다(Kotlin 과 같다). */
const COMPONENT_FILE = {
  button: (api) => buttonSwift(api),
  chip: (api) => chipSwift(api),
  checkbox: () => controlSwift("checkbox"),
  radio: () => controlSwift("radio"),
  toggle: () => toggleSwift(),
  tab: (api) => tabSwift(api),
  dropdown: (api) => dropdownSwift(api),
  "mobile-header": (api) => mobileHeaderSwift(api),
  "mobile-bottom-nav": (api) => mobileBottomNavSwift(api),
  textarea: () => textareaSwift(),
  "text-button": (api) => labelButtonSwift(api, "text-button"),
  "assist-button": (api) => labelButtonSwift(api, "assist-button"),
  "filter-chip": (api) => filterChipSwift(api),
  divider: (api) => dividerSwift(api),
  "data-tag": (api) => dataTagSwift(api),
  "expandable-card": () => expandableCardSwift(),
  "bottom-sheet": (api) => bottomSheetSwift(api),
  "bottom-sheet-option": (api) => bottomSheetOptionSwift(api),
  "date-picker": (api) => datePickerSwift(api),
  "time-picker": (api) => timePickerSwift(api)
};

/** SwiftPM 패키지 선언. 소스는 이 폴더 전체다(path: "." — 파일 위치를 옮기지 않으려는 것). */
export function packageSwift() {
  return `// swift-tools-version:5.7
// ${GENERATED_NOTE}
import PackageDescription

let package = Package(
    name: "S1DesignSystem",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "S1DesignSystem", targets: ["S1DesignSystem"])
    ],
    targets: [
        .target(
            name: "S1DesignSystem",
            path: ".",
            exclude: ["README.md", "coverage.json"]
        )
    ]
)
`;
}

export function buildSwiftOutputs({ componentOutputs, tokenData, iconAssets, typographyCss }) {
  const { tokenValues, byId, specs, apis, coverage } = extractComponents({ componentOutputs, tokenData, profile: MOBILE_PROFILE });
  const outputs = new Map();

  for (const spec of specs) outputs.set(`platform/swift/S1${pascal(spec.id)}Spec.swift`, specSwift(spec, GENERATED_NOTE));

  /* 부품 파일은 축을 다 안 뒤에 만든다 — select 는 dropdown 의 축을 알아야 목록을 부를 수 있다. */
  for (const id of MOBILE_PROFILE.components) {
    const api = apis[id];
    const build = COMPONENT_FILE[id];
    const text = build
      ? build(api)
      : id === "select"
        ? selectSwift(api, apis.dropdown)
        : id === "input"
          ? inputSwift(api)
          : modalSwift(api, modalFooterButtonSizes(byId.get(id))[api.breakName]);
    outputs.set(`platform/swift/S1${pascal(id)}.swift`, text);
  }

  outputs.set("platform/swift/S1Style.swift", runtimeSwift());
  outputs.set("platform/swift/S1IconView.swift", iconRuntimeSwift());
  outputs.set("platform/swift/S1Palette.swift", paletteSwift(tokenData.tokens, GENERATED_NOTE));
  const textStyles = readTextStyles(typographyCss, tokenValues);
  outputs.set("platform/swift/S1Type.swift", typeSwift(textStyles, GENERATED_NOTE));

  const icons = usedIconsOf(specs).map((name) => {
    const asset = iconAssets.find(({ file }) => file === `${name}.svg`);
    if (!asset) throw new Error(`아이콘 ${name}.svg 가 배포본에 없습니다.`);
    return readIcon(name, asset.asset);
  });
  outputs.set("platform/swift/S1Icons.swift", iconsSwift(icons, GENERATED_NOTE));
  outputs.set("platform/swift/preview/S1Gallery.swift", gallerySwift(apis));
  outputs.set("platform/swift/Package.swift", packageSwift());

  return { outputs, coverage, icons: icons.map(({ name }) => name), textStyles: textStyles.map(({ name }) => name) };
}
