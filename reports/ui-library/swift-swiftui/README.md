# Swift(SwiftUI) 부품 — 무엇을 어떻게 만들었나

## 범위 (river 지시 2026-10-02 "swift, c++도 부품 만들어주고 ios도 모바일 사양만 들어가도록 해줘")

23종 — Kotlin 이 내는 모바일 부품과 **같은 집합**이다:
button · input · checkbox · radio · toggle · chip · dropdown · select · tab · modal · mobile-header · mobile-bottom-nav · textarea · text-button · assist-button · filter-chip · bottom-sheet-option · bottom-sheet · date-picker · time-picker · expandable-card · divider · data-tag.
값은 `S1Tokens`, 동작은 `dist/platform/behavior.json` 과 승인 웹 런타임을 따른다(Kotlin 판과 같은 기준).

**모바일 한 벌만 만든다.** iPad 도 모바일 한 벌이다. 화면 축이 있는 부품은 `breaks.mobile` 만 뽑고 PC 조합은 만들지 않는다.
그래서 **고를 것이 하나뿐인 축은 파라미터로 나오지 않는다.** 전달 형식은 **Swift Package**(`Package.swift`, iOS 16+, 패키지 `S1DesignSystem`)이다.

| 부품 | 조합 | 고를 수 있는 것 (파라미터) |
|---|---|---|
| button | 9 | variant(primary·secondary·blue-line) · fullWidth |
| chip | 8 | variant(line·solid) |
| checkbox · radio | 각 5 | 없음 (label · 누를 때 콜백이 nil 이면 표시용) |
| toggle | 4 | 없음 (accessibilityLabel 로 이름) |
| tab | 3 | 없음 |
| select | 5 | 없음 |
| input | 7 (+지우기·비밀번호·검색 12) | mode(text·password·search) |
| dropdown | 18 | type(text·checkbox) · size(xxsm·xsm·md) |
| modal | 2 | 푸터(취소 라벨이 있으면 dual) — `s1Modal` 수식어 / `S1ModalPanel` |
| divider | 12 | axis(x·y) · weight · tone · inset |
| data-tag | 8 | tone(blue·red) · shape · solid |
| expandable-card | 3 | 없음 (expanded 는 화면이 쥔다) |
| bottom-sheet | 3 | 푸터(primary/secondary 라벨을 넘긴 만큼 none·single·dual) — `s1BottomSheet` 수식어 / `S1BottomSheetPanel` |
| bottom-sheet-option | 9 | type(text·checkbox·radio·list) · selected · enabled |
| date-picker | 5 (+조각 6벌) | 한 날짜 `S1DatePicker` / 기간 `S1DateRangePicker` |
| time-picker | 5 (+조각 2벌) | is24Hour · minuteStep · dateContent |
| mobile-header | 6 | variant 6종(유형이 슬롯을 정한다) |
| mobile-bottom-nav | 8 | icon(예시 4) · customIcon(Image) |
| text-button | 8 | variant(primary·secondary) |
| assist-button | 4 | 없음 |
| filter-chip | 20 | variant(line·solid) · title 유무 |

입력칸·텍스트영역은 SwiftUI 관례대로 `Binding<String>` 으로 받는다(Kotlin 의 value + onValueChange 와 같은 뜻).
날짜·시간 값은 `S1Date`·`S1Time`(Foundation 달력에 묶이지 않는 작은 값 타입)으로 주고받는다.
시트(바텀 시트·날짜·시간)는 시스템 `.sheet` + 내용 높이 `presentationDetents` 로 올라오고, 그 자리에 그리는 `…Panel`/`…Sheet` 뷰도 따로 있다.

## 방식 — 손으로 옮겨 적지 않는다

Kotlin 과 **같은 중립 추출 층**에서 같은 표를 받는다. 이번에 그 층을 Kotlin 이름에서 꺼냈다(Kotlin 산출물은 바이트 동일 — 빌드 전후 `diff -r ui-library/dist/platform/kotlin` 이 비어 있다).

| 자리 | 파일 |
|---|---|
| CSS 캐스케이드 계산기 | `ui-library/scripts/css-model.mjs` |
| 값 읽기(CSS → 정규화 상자) | `ui-library/scripts/platform-values.mjs` |
| 무엇을 물을지(코어 16 · 모바일 7) | `platform-plans-core.mjs` · `platform-plans-mobile.mjs` |
| 추출·profile·일괄 추출 | `platform-spec.mjs` |
| 아이콘·텍스트 스타일 읽기 | `platform-icons.mjs` · `platform-typography.mjs` |
| Swift 표 출력 | `swift-emit.mjs` |
| 그리는 뼈대(SwiftUI 트리) | `swift-components.mjs` · `swift-components-mobile.mjs` |
| 런타임(상자·그림자·글자·눌림·SVG 경로) | `swift-runtime.mjs` |
| 아이콘·텍스트 스타일 출력 | `swift-icons.mjs` |
| 갤러리 · README · 패키지 | `swift-gallery.mjs` · `swift-readme.mjs` · `swift-compose.mjs` |

산출물은 `ui-library/dist/platform/swift/` 이며 `npm run ui:build` 한 번으로 전부 다시 만들어진다. **dist 손편집 금지.**
부품 뼈대에는 치수·색 리터럴이 없다 — 전부 `S1*Spec.box(...)` 에서 꺼낸다(`swift:lint` 가 기계로 본다).

## 값 체계

| 층 | 어디에 | 개수 |
|---|---|---|
| 토큰(색·크기·간격·반경·글꼴값) | `S1Tokens.swift` · `S1Palette.swift`(색 라이트·다크 한 쌍) | 499 토큰 중 색 406 |
| 이름 붙은 텍스트 스타일 | `S1Type.swift` | 21 |
| 아이콘(SVG 경로 그대로) | `S1Icons.swift` | 21 |

색은 화면의 `colorScheme` 을 따르고(`S1Theme(.system)`), `S1Theme(.dark)` 로 고정할 수도 있다.
서체 Pretendard 는 앱이 등록하고 이름만 `S1Theme(fontFamily:)` 로 넘긴다.

## 검증

| 검사 | 방법 | 결과 |
|---|---|---|
| 표가 브라우저와 같은가 | 헤드리스 크롬 `getComputedStyle` 대조 (`npm run swift:parity` 1단계) | ✅ 1017건 질의 · 5359개 값 |
| Swift 값이 표와 같은가 | 생성된 `S1*Spec.swift` 를 **컴파일해서 값을 찍어** 추출 표와 대조 (2단계) | ✅ 부품 23종 · 41832개 값. 값 하나를 일부러 틀리게 해서 잡히는 것도 확인 |
| 참조·리터럴 | 괄호 짝 · 팔레트 색 · 아이콘 · 조합 열쇠 · 치수/색 리터럴 0 (`npm run swift:lint`) | ✅ |
| 컴파일 | macOS 13 + iOS 16 면(Mac Catalyst) 형 검사, `--build` 로 패키지 전체 빌드 (`npm run swift:typecheck`) | ✅ 오류 0 · 경고 0 |
| 사람이 보는 검수 | `reports/ui-library/swift-swiftui/preview.html` — 웹 렌더 ↔ Swift 렌더 라이트·다크 나란히 (`npm run swift:shots` → `swift:preview`) | 구역 22 × 라이트·다크 = PNG 44장 |
| 빠뜨린 CSS 선언 | `dist/platform/swift/coverage.json` | PC 전용 371건 · 표시·배치 규칙 194건 · 빠뜨린 값 0건 |

렌더는 같은 소스를 macOS 용으로 컴파일해 `ImageRenderer` 로 찍은 것이다(서체 Pretendard, 가로 390pt, 2배).

### 아직 확인 못 한 것 (정직하게)

- **iOS 에서 실행**: 이 맥에는 iOS SDK(Xcode)가 없어 시뮬레이터·실기기에서 돌려 보지 못했다. iOS 쪽은 Mac Catalyst 면(UIKit 기반 SwiftUI)으로 **형 검사만** 했다. 시스템 시트(`.sheet` + `presentationDetents`)가 올라오는 모양·높이, 휠의 끌기 감각, 키보드 올라올 때의 입력칸 위치는 눈으로 못 봤다.
- **VoiceOver**: 접근성 이름·값·트레이트를 registry 메타에 맞게 붙였지만 실제로 읽혀 보지 못했다. 토글만 `accessibilityRepresentation`(스위치) 이고 나머지는 이름·값·선택 트레이트다.
- **입력칸 사진**: `ImageRenderer` 가 `TextField` 를 못 그려서 사진에서는 글자로 대체했다(내부 `s1StaticFields`). 실제 입력·초점 상태는 사진에 없다.
- **포인터(hover)**: iPad 포인터·Mac 에서만 생기는 hover 칸은 사진에 없다. 손가락 누름은 정본 Hover 칸으로 그린다(모바일 정책).
- **커서 색**: 정본 CSS 의 `caret-color` 는 표로 옮기지 않는 속성이라 Kotlin 처럼 글자색으로 칠한다.
- **Kotlin 쪽에서 발견한 것(고치지 않음)**: 아이콘 읽기가 `<circle>` 을 건너뛰어 Kotlin 의 시계·하단 내비 돋보기 아이콘에 원이 빠진다. Swift 는 원까지 읽는다. Kotlin 을 바이트 동일로 두라는 조건이라 그대로 두었다.
