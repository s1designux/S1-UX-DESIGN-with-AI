/**
 * react-native-docs.mjs — 개발자에게 나가는 README 와 타입 정의(index.d.ts)
 * --------------------------------------------------------------------------
 * 부품 표(무엇을 고를 수 있나)는 생성된 사실(variant·size·화면·받는 값)에서 만들고, "언제 쓰나"는 registry 가 정본이다.
 * 사람이 적는 문장은 쓰는 법과 RN 에서 원리상 다른 점뿐이다.
 */

import { GENERATED_NOTE } from "./react-native-emit.mjs";

const pascal = (value) => value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");

/* ── 타입 정의 ───────────────────────────────────────────────────────── */

const BOOLEAN_PROPS = new Set(["open", "defaultOpen", "collapsed", "defaultCollapsed", "checked", "defaultChecked", "selected", "defaultSelected", "disabled", "readOnly", "invalid"]);
const NUMBER_PROPS = new Set(["page", "defaultPage", "totalPages", "maxLength"]);
const STRING_PROPS = new Set(["today", "placeholder", "name"]);

function propType(name) {
  if (name === "onCheckedChange" || name === "onSelectedChange") return "(value: boolean) => void";
  if (name === "onChangeText") return "(text: string) => void";
  if (/^on[A-Z]/.test(name)) return "(detail: any) => void";
  if (BOOLEAN_PROPS.has(name)) return "boolean";
  if (NUMBER_PROPS.has(name)) return "number";
  if (STRING_PROPS.has(name)) return "string";
  if (name === "selection" || name === "defaultSelection") return "readonly number[]";
  if (name === "disabledDates") return "readonly string[]";
  if (name === "options") return "readonly unknown[]";
  if (name === "openId" || name === "defaultOpenId") return "string | null";
  if (name === "inputRef") return "any";
  if (name === "value" || name === "defaultValue") return "string | number | boolean | readonly string[] | { start?: string | null; end?: string | null } | null";
  return "unknown";
}

export function buildReactNativeTypes(factsList, textStyles) {
  const header = `/* ${GENERATED_NOTE} */
import type { ReactElement, ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** 슬롯 한 칸에 넣을 수 있는 값. 글자·요소를 그대로 주거나, 속성까지 함께 준다. */
export type S1SlotValue = ReactNode | { content?: ReactNode; attrs?: Record<string, unknown> };
/** 목록 한 줄. 글자 하나, 안쪽 목록(배열), 또는 슬롯 이름별 지정. props 는 그 줄 요소에 직접 붙는 RN 속성(onPress 등). */
export type S1ItemValue = ReactNode | readonly S1ItemValue[] | ({
  key?: string | number;
  attrs?: Record<string, unknown>;
  props?: Record<string, unknown>;
} & Record<string, S1SlotValue | readonly S1ItemValue[] | Record<string, unknown> | undefined>);

export interface S1BaseProps {
  /** 슬롯 이름별 내용·속성. 예: parts={{ label: "확인" }} */
  parts?: Record<string, S1SlotValue>;
  /** 칸(part) 이름별 RN 속성. 예: partProps={{ back: { onPress: goBack } }} */
  partProps?: Record<string, Record<string, unknown>>;
  style?: StyleProp<ViewStyle>;
  /** 웹처럼 루트에 직접 주는 상태 속성(aria-pressed · data-state · hidden …) */
  [attribute: string]: unknown;
}

export interface S1ProviderProps {
  /** 다크 모드. 생략하면 기기 설정을 따른다. */
  dark?: boolean;
  /** Pretendard 를 expo-font 로 불러온 뒤 그 이름. 문자열 하나이거나 굵기별 이름 { 400: "Pretendard-Regular", … } */
  fontFamily?: string | Record<number, string> | ((weight: number) => string);
  /** true 면 모달·바텀시트를 RN Modal 이 아니라 놓인 자리 안에 그린다(미리보기·갤러리용) */
  inline?: boolean;
  children?: ReactNode;
}
export declare function S1Provider(props: S1ProviderProps): ReactElement;
export declare function useS1(): { dark: boolean; fontFamily: unknown; inline: boolean };
export declare function Icon(props: { name: string; color: string; style?: unknown }): ReactElement;

export type S1TextStyleName = ${textStyles.map((style) => JSON.stringify(style.name)).join(" | ")};
export declare function S1Text(props: { type?: S1TextStyleName; color?: string; children?: ReactNode; numberOfLines?: number }): ReactElement;

export declare const COLORS: Record<string, readonly [light: string, dark: string]>;
export declare const DIMENS: Record<string, number>;
export declare const NUMBERS: Record<string, number>;
export declare const SHADOWS: Record<string, unknown>;
export declare const TYPES: Record<S1TextStyleName, { fontSize: number; fontWeight: number; lineHeight: number; letterSpacing: number }>;
export declare const ICONS: Record<string, unknown>;
export declare const S1_VERSION: string;
export declare const S1_RELEASED_AT: string;
export declare const S1_CANONICAL_FINGERPRINT: string;
export declare function S1Gallery(props: { only?: readonly string[]; breakName?: "pc" | "mobile" }): ReactElement;
`;
  const body = factsList.map((facts) => {
    const lines = [];
    const seen = new Set();
    const add = (name, type, doc) => { if (seen.has(name)) return; seen.add(name); lines.push(`${doc ? `  /** ${doc} */\n` : ""}  ${name}?: ${type};`); };
    const union = (values) => values.map((value) => JSON.stringify(value)).join(" | ");
    if (facts.variants.length > 1) add("variant", union(facts.variants), `승인된 변형: ${facts.variants.join(" · ")}`);
    if (facts.sizes.length > 1) add("size", union(facts.sizes), `승인된 크기: ${facts.sizes.join(" · ")}`);
    if (facts.breaks.length > 1) add("breakName", union(facts.breaks), `화면 기준: ${facts.breaks.join(" · ")} (기본 ${facts.breaks[0]})`);
    if (facts.modes.length > 0) add("mode", union(facts.modes), `입력 모양: ${facts.modes.join(" · ")}`);
    for (const { prop } of facts.lists) add(prop, "readonly S1ItemValue[]", "목록 데이터 — 주지 않으면 예제 내용이 그려진다.");
    for (const name of facts.controlProps) add(name, propType(name));
    for (const { eventName, propName } of facts.events) add(propName, propType(propName), eventName);
    for (const name of facts.behaviorProps ?? []) add(name, propType(name));
    if (facts.hasOpen) add("open", "boolean", facts.defaultOpen ? "열려 있나 — 안 주면 열림(기본 true). false 면 닫힘." : "열려 있나 — 안 주면 닫힘(그려지지 않음).");
    if (facts.hasChildrenSlot) add("children", "ReactNode", "앱이 소유하는 내용(탭 내용 등). 주면 예제 내용을 대신한다.");
    return `export interface ${facts.componentName}Props extends S1BaseProps {\n${lines.join("\n")}\n}\nexport declare function ${facts.componentName}(props: ${facts.componentName}Props): ReactElement;`;
  }).join("\n\n");
  return `${header}\n${body}\n`;
}

/* ── README ──────────────────────────────────────────────────────────── */

export function buildReactNativeDocs({ factsList, usageById, release, textStyles, iconNames, tokenData }) {
  const sizeText = (facts) => {
    if (facts.sizes.length <= 1) return "—";
    if (facts.sizeBreaks) {
      const groups = Object.entries(facts.sizeBreaks).filter(([, sizes]) => sizes.length > 0);
      if (groups.length > 0) return groups.map(([breakName, sizes]) => `${breakName === "mobile" ? "모바일" : "PC"} ${sizes.map((size) => `\`${size}\``).join(" ")}`).join(" · ");
    }
    return facts.sizes.map((size) => `\`${size}\``).join(" ");
  };
  const rows = factsList.map((facts) => {
    const variantText = facts.variants.length > 1 ? facts.variants.map((variant) => `\`${variant}\``).join(" ") : "—";
    const breakText = facts.breaks.length > 1 ? facts.breaks.map((name) => `\`${name}\``).join(" ") : "—";
    const knobs = [
      ...facts.modes.length ? [`\`mode\`(${facts.modes.join("·")})`] : [],
      ...facts.lists.map(({ prop }) => `\`${prop}\``),
      ...(facts.behaviorProps ?? []).filter((name) => !/^on[A-Z]|^default/.test(name)).map((name) => `\`${name}\``),
      ...[...facts.events.map(({ propName }) => propName), ...(facts.behaviorProps ?? []).filter((name) => /^on[A-Z]/.test(name))].filter((name, index, all) => all.indexOf(name) === index).map((name) => `\`${name}\``)
    ];
    const whenToUse = (usageById[facts.id]?.whenToUse ?? []).join(" ");
    return `| \`${facts.componentName}\` | ${variantText} | ${sizeText(facts)} | ${breakText} | ${knobs.join(" · ") || "`parts`"} | ${whenToUse} |`;
  }).join("\n");

  const colorCount = tokenData.tokens.filter((token) => token.type === "color").length;

  return `# @s1/ui-react-native

**S1 디자인 시스템의 React Native(Expo) 부품입니다.** iOS · Android · 웹(react-native-web) 에서 같은 코드로 그려지고,
**PC·Mobile 두 화면 기준을 모두 담았습니다**(\`breakName="pc" | "mobile"\`). 부품 ${factsList.length}종.
${release ? `
**배포본 번호 ${release.version}** · ${release.releasedAt} 판 — 디자인가이드 내려받기 화면의 번호와 다르면 새로 받으세요.
코드에서 볼 때는 \`import { S1_VERSION } from "@s1/ui-react-native"\` 입니다.
` : ""}
이 패키지는 웹용 React(\`@s1/ui-react\`)와 다릅니다. 그쪽은 \`<button>\`·\`<span>\` 과 CSS 파일을 쓰는 **React DOM** 이라 iOS·Android 에서 돌지 않습니다.
여기 부품은 \`View\`·\`Text\`·\`Pressable\`·\`TextInput\` 으로 그려집니다.

## 1. 설치 (Expo)

\`\`\`bash
npx expo install react-native-svg expo-font
\`\`\`

압축을 풀어 나온 \`s1-ui-react-native\` 폴더를 프로젝트에 넣고(예: \`src/s1-ui\`) 그 폴더에서 꺼내 씁니다.
필요한 것: **React Native 0.76 이상**(Expo SDK 52 이상) · \`react-native-svg\`. 다른 의존 패키지는 없습니다.

## 2. 앱 맨 위에 한 번 — 서체와 다크 모드

서체는 **Pretendard** 입니다. 앱이 \`expo-font\` 로 불러온 뒤 이름을 넘깁니다.

\`\`\`jsx
import { useFonts } from "expo-font";
import { S1Provider, S1Button } from "./src/s1-ui";

export default function App() {
  const [loaded] = useFonts({
    "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("./assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("./assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.otf")
  });
  if (!loaded) return null;
  return (
    <S1Provider
      fontFamily={{ 400: "Pretendard-Regular", 500: "Pretendard-Medium", 600: "Pretendard-SemiBold", 700: "Pretendard-Bold" }}
    >
      <S1Button variant="primary" size="lg" breakName="mobile" parts={{ label: "확인" }} onPress={save} />
    </S1Provider>
  );
}
\`\`\`

- \`fontFamily\` 를 문자열 하나로 주면(예: \`"Pretendard"\`) 굵기는 \`fontWeight\` 로 고릅니다(웹·iOS). 안드로이드는 굵기별 이름을 주는 쪽이 정확합니다.
- **다크 모드**는 \`<S1Provider dark>\` 로 고정하거나, 생략하면 기기 설정(\`useColorScheme\`)을 따라 바뀝니다. 색은 라이트·다크 한 쌍을 토큰 이름으로 들고 있어서 별도 작업이 없습니다.

## 3. 쓰기

\`\`\`jsx
import { S1Button, S1Input, S1Tab, S1Table, S1DatePicker } from "./src/s1-ui";

<S1Button variant="primary" size="md" parts={{ label: "확인" }} onPress={save} />

<S1Input value={name} onChangeText={setName} placeholder="이름" />

<S1Tab onChange={({ index }) => setPage(index)} tabs={["전체", "진행", "완료"]} />

<S1Table headerCells={["이름", "부서"]} rows={[["김하늘", "디자인"], ["박바다", "개발"]]} onSelectionChange={({ selected }) => setPicked(selected)} />

<S1DatePicker variant="range" onChange={({ start, end }) => setRange([start, end])} />
\`\`\`

| 통로 | 언제 쓰나 | 예 |
|---|---|---|
| \`parts\` | 글자·아이콘 한 칸을 갈아끼울 때 | \`parts={{ label: <><Icon name="check" color={ink} /> 저장</> }}\` |
| 목록 prop | 표·목록에 내 데이터를 넣을 때 | \`rows={[["가", "나"]]}\` · \`tabs\` · \`options\` |
| 값 prop | 입력값을 상태와 이을 때 | \`value\` · \`onChangeText\` · \`checked\` · \`onCheckedChange\` |
| \`partProps\` | 칸 하나에 RN 속성(눌림 등)을 줄 때 | \`partProps={{ back: { onPress: goBack } }}\` |
| \`style\` | 루트에 바깥 여백·배치를 줄 때 | \`style={{ marginTop: 16 }}\` |

## 4. PC·Mobile 화면 고르기

화면 크기가 아니라 **쓰는 쪽이 정합니다.** 태블릿에서 PC 화면 기준을 쓰고 싶으면 \`breakName="pc"\`, 폰이면 \`"mobile"\`.
\`breakName\` 을 고르면 그 화면에 승인된 크기만 쓸 수 있고(\`size\`), 없는 조합은 그 자리에서 멈추고 쓸 수 있는 값을 알려 줍니다.

## 5. 어떤 부품을 쓸까

**먼저 \`<S1Gallery />\` 를 앱에 올려 보세요.** 승인된 조합이 실제 모습으로 한 화면에 늘어섭니다.

| 부품 | 변형(variant) | 크기(size) | 화면(breakName) | 그 밖에 받는 값 | 언제 쓰나 |
|---|---|---|---|---|---|
${rows}

크기·변형·화면은 위에 적힌 값만 쓸 수 있습니다. 다른 값을 주면 그 자리에서 오류로 알려 줍니다.

## 6. 값 체계 — 손으로 옮겨 적지 마세요

| 층 | 어디에 | 개수 |
|---|---|---|
| 색(라이트·다크 한 쌍) | \`COLORS\` (\`tokens.js\`) | ${colorCount} |
| 길이·수치 | \`DIMENS\` · \`NUMBERS\` | ${tokenData.tokens.filter((token) => token.type === "dimension").length} · ${tokenData.tokens.filter((token) => token.type === "number").length} |
| 이름 붙은 텍스트 스타일 | \`TYPES\` · \`<S1Text type="body-14r">\` | ${textStyles.length} |
| 아이콘 | \`ICONS\` · \`<Icon name="check" color={…} />\` | ${iconNames.length} |

\`\`\`jsx
<S1Text type="body-14r" color="--color-text-body-primary">본문</S1Text>
\`\`\`

부품에 없는 화면을 직접 그릴 때만 위 값을 이름으로 부르세요. 값을 눈으로 보고 옮겨 적으면 배포본과 조용히 어긋납니다.

## 7. 어떻게 만들었나

부품마다 **승인된 웹 배포본의 CSS 를 실제 캐스케이드까지 계산해**(요소 × 상태 조합) \`specs/*.js\` 의 표로 굳혔습니다.
\`components/*.js\` 에는 치수·색 값이 한 자리도 없고, \`engine.js\` 가 지금 상태(속성·눌림·포커스·비활성)를 읽어 표에서 골라 그립니다.
마크업 구조(칸 이름·반복 목록)는 승인 예제에서 그대로 옮겼습니다.

| 검사 | 방법 |
|---|---|
| 값이 CSS 계산과 같은가 | \`npm run rn:parity\` — 표의 모든 칸을 다시 계산해 대조 |
| 웹과 같은 모양인가 | \`npm run rn:compare\` — 같은 조합을 웹 배포본과 나란히 그려 상자 크기·위치·색을 잼 |
| 동작이 승인 계약대로인가 | \`npm run rn:behavior\` — 실제로 눌러 속성·보이는 칸을 확인 |
| RN 이 못 옮긴 CSS 가 있는가 | \`coverage.json\` — 이유와 함께 센 목록 |

## 8. RN 에서 원리상 다른 점

- **hover** 는 마우스가 있는 환경(웹)에서만 켜집니다. 터치 기기에서는 눌림(pressed)만 있습니다 — 웹 배포본이 모바일에서 hover 를 끈 것과 같습니다.
- **키보드 조작**(화살표·Home·End·Esc)은 터치 화면에 없어 옮기지 않았습니다. 웹(react-native-web)에서는 포커스·Enter/Space 가 동작합니다.
- **표**는 열 폭을 내용으로 정하는 자동 배치가 없습니다. 폭을 정하지 않은 칸은 남는 폭을 같은 몫으로 나눕니다(CSS \`table-layout: fixed\` 와 같습니다).
- **그림자·테두리 모양**은 RN \`boxShadow\`(0.76 이상)로 그립니다. 안쪽 그림자(inset)도 같은 속성입니다.
- **한글 세로 1px 보정**은 웹 브라우저가 글자를 1px 단위로 놓는 보정이라 RN 에는 옮기지 않았습니다(정본 결정).
- **마스크 아이콘**(CSS mask)은 같은 SVG path 에 색을 직접 칠합니다. 모양은 같습니다.
- **모달·바텀시트**는 RN \`Modal\` 에 그립니다(\`open\` 일 때만). \`<S1Provider inline>\` 이면 놓인 자리 안에 그립니다(미리보기용).
- **팝업(셀렉트·날짜·시간)**은 트리거 아래에 겹쳐 그립니다. 바깥을 눌러 닫는 동작은 없고, 고르거나 트리거를 다시 눌러 닫습니다.
- 날짜·시간 휠의 **스크롤 스냅**은 \`snapToInterval\` 로 옮겼습니다(칸 간격은 CSS 계산값).

## 9. 고치지 마세요

이 폴더는 자동 생성물입니다. 고치면 다음 배포에서 지워집니다. 필요한 것이 없으면 만들지 말고 디자인팀에 요청해 주세요.
`;
}
