# UI Library 1단계 재고조사 — Input · Button

- 작업 ID: `input-button-pilot`
- 조사일: 2026-08-24
- 코드 판독: 📖 `source-reader` — 저장소 관련 경로 전체 추적, 파일 수정 없음
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- Figma 정책: 레거시 V2.4는 조사·검문 대상에서 제외. 필요하면 사용자가 지정한 V3.0 overview를 선택적 시각 참고로 사용
- 정책: `registry/governance/ui-library-code-contract.json` v0.1.0 candidate

## 1. 한눈에 보는 결론

| 항목 | Input | Button |
|---|---:|---:|
| 코드 시각 정본 조합 | 112 | 48 |
| 정본 축 | Size × State × Label × Message × Break | Variant × Size × State × Break |
| 사이트 미리보기 | 있음 · PC/Mobile | 있음 · PC/Mobile |
| 사이트 탭 표출 | HTML/CSS/Token/JS 탭 있음 | variant별 HTML/CSS Token 탭 있음 |
| 복사 가능한 실제 component CSS | 없음 · CSS pane은 readonly 주석 한 줄 수준 | 없음 · CSS Token pane은 CSS 규칙이 아니라 토큰 값 목록 |
| 연결된 배포용 component CSS | 없음 | 없음 |
| 배포용 component JS module | 없음 | 없음 |
| Registry 행동 계약 | 사이트 runtime을 현 정본으로 삼는 임시 장부 | 사이트 runtime을 현 정본으로 삼는 임시 장부 |
| 접근성 승인 | 필수 계약 일부 미정의 | `a11yStatus=pending` |
| Figma live 대조 | inventory 통과 조건 아님 | inventory 통과 조건 아님 |
| UI library source/dist/test | 없음 | 없음 |
| 현재 제작 가능 판정 | 정본 경계·상태·size 결정 전 불가 | anatomy·state token·focus 결정 전 불가 |

현재 사이트의 Input·Button은 검토용 후보 구현이다. 퍼블리셔·개발자가 설치할 UI 라이브러리 원본으로 승인된 상태가 아니다.

## 2. 공통 배포 재고

| 층 | 현재 상태 | 판정 |
|---|---|---|
| 시각 정본 | `build-components.ts`에 Input·Button builder 존재 | 확인 |
| 의미·행동 Registry | 파일은 있으나 사이트 runtime을 source of truth로 삼고 일부 축이 정본과 충돌 | 이행 필요 |
| 사이트 후보 | `pages/components.html` 인라인 CSS·JS로 동작 | 배포 정본 아님 |
| 외부 CSS | `assets/css/components/input.css`, `button.css` 존재하지만 사이트 미연결·stale/비공식 | 사용 금지 후보 |
| UI source | `ui-library/src` 없음 | 미존재 |
| dist | `ui-library/dist` 없음 | 미존재 |
| build/test/exports | `ui:build`, `ui:test`, package exports 없음 | 미존재 |
| 실제 dist 검수 화면 | `pages/ui-review.html` 없음 | 미존재 |
| 이행 장부 | `registry/governance/ui-library-migration.json` 없음 | 미존재 |

근거: `package.json:46-50`, `registry/governance/ui-library-code-contract.json:48-58,171-223`, `pages/components.html:8-10`.

## 3. Input 재고

### 3.1 코드 시각 정본 — 112개 전수 정의

`buildInput`의 모든 조합은 아래 축의 곱이다. 목록에서 임의 제외되는 조합은 없다.

| 축 | 값 | 개수 |
|---|---|---:|
| Platform·Size | PC/XXSM 28, PC/XSM 34, PC/MD 44, Mobile/MD 48 | 4 |
| State | Default, Filled, Editing, Error, Correct, Read-Only, Disabled | 7 |
| Label | Off, On | 2 |
| Message | Off, On | 2 |
| 합계 | 4 × 7 × 2 × 2 | 112 |

Variant 이름 형식은 `Size={size}, State={state}, Label={On|Off}, Message={On|Off}, Break={PC|Mobile}`이다.

근거: `build-components.ts:873-897,945-965`.

### 3.2 정본 anatomy·아이콘·시각 값

- root: 투명 세로 container.
- 선택 label → field → 선택 message 순서다.
- 일반 상태 field: text + `trail(eye)`.
- Editing field: `lead(text+caret)` + `trail(eye+remove)`.
- `Password Icon` boolean property가 모든 variant의 eye 표시 여부에 연결되며 기본값은 false다.
- eye/clear 크기: XXSM 20, 나머지 24.
- 사용 아이콘 키: `eye` 별칭은 현재 `eye_hide`, clear는 `remove`. 허용목록에는 `eye_show`도 있지만 Input builder swap property에는 연결되지 않는다.
- 직접 참조 색 역할 21개, 텍스트 스타일 `body/14R`, `body/14M`, `body/12R`.
- height·padding·gap·radius·stroke는 builder에 raw number로 들어 있고 Foundation number 변수에 직접 바인딩되지 않는다.

근거: `build-components.ts:899-975,1052-1064,1150-1158`, `registry/figma/allowed-remote-keys.json:20-31`.

### 3.3 Registry·행동·사이트 후보

| 영역 | 확인 내용 |
|---|---|
| 의미 | 한 줄 입력. Registry 설명상 label/helper는 Input Slots 조합 |
| 상태 | Registry는 default/focus/filled/error/correct/disabled 6개 |
| suffix 접근성 | clear/search/password에 aria-label, password에 aria-pressed, clear는 값이 있을 때만 표시 |
| 행동 장부 | focus/blur/input/clear/password toggle, clear·toggle 뒤 input focus 복귀 |
| 사이트 CSS | `components.html` 인라인 CSS |
| 사이트 runtime | focus/clear, disabled/helper demo, Search/Password 동작 |
| 코드탭 표출 | HTML/CSS/Token/JS 탭은 존재하지만 CSS pane은 readonly 주석 한 줄 수준 |

근거: `registry/components/input.json:12-58,95-102,183-279`, `registry/components/component-behavior.pc.json:99-113`, `pages/components.html:760-918,2803-3100,8729-8746,9225-9296,9697-9712`.

### 3.4 Input 충돌·stale

| ID | 충돌 | 영향 |
|---|---|---|
| I-01 | 정본 7상태 vs Registry 6상태. `Editing`↔`focus`, Read-Only 누락 | 공개 상태 API 확정 불가 |
| I-02 | 정본 Mobile=`Size=MD, Break=Mobile` vs 사이트 48=`lg` 표현 | 공개 size API 확정 불가 |
| I-03 | Registry는 base Input을 label/helper 없는 pure input으로 설명하지만 builder는 Label·Message를 variant 축으로 내장 | 코어/조합 경계 확정 불가 |
| I-04 | Registry는 Password Field를 composed field로 두지만 builder는 base Input에 Password Icon/eye를 내장 | dependency·public part 충돌 |
| I-05 | builder는 `eye_hide`만 표시하고 eye swap property가 없음. 사이트만 inline SVG 2종을 JS로 교체 | password visible 상태의 정본 연결 없음 |
| I-06 | 외부 `input.css`는 hover를 구현하고 padding·action 크기도 현재 정본/사이트와 다름 | 배포 후보 사용 불가 |
| I-07 | 코드탭 HTML은 전체 112조합·Mobile·action anatomy를 제공하지 않고 CSS pane 일부는 readonly 주석뿐 | 복붙 완결성 없음 |
| I-08 | Input 현재 node `540:3328`, `figma-map.json`에는 stale `6443:4408` 잔존 | Figma 재개 ID 드리프트 |
| I-09 | Registry dark mode pending, builder는 Dark spec을 생성 | 생성 존재와 검증 완료를 혼동하면 안 됨 |
| I-10 | 정본 field 폭은 200px 고정, 사이트 기본은 180px이며 예시에서 160~200px 혼용 | 고정폭/부모 FILL 책임 확정 필요 |
| I-11 | 정본의 내용↔우측 action 간격은 0, 사이트는 6px, 외부 CSS는 4px | 내부 anatomy 간격 충돌 |
| I-12 | 정본은 20/24px 시각 아이콘만 정의하고 사이트 action은 24/28px. Mobile 48px 터치 영역 계약 없음 | 아이콘 크기와 누르는 영역 분리 필요 |

근거: `build-components.ts:875-897,930-975`, `registry/components/input.json:9-12,49-58,82-102,183-279`, `registry/figma/figma-map.json:73-85`, `assets/css/components/input.css:1-170`, `pages/components.html:3022-3099`.

### 3.5 Input 미확인·결정 필요

1. 공개 상태명을 `editing`과 `focus` 중 무엇으로 둘지, Read-Only를 포함할지.
2. Mobile 48 공개 size를 `MD+Break=Mobile`, `lg`, 승인된 alias 중 무엇으로 둘지.
3. Label·Message·Password Icon을 base Input에 둘지 Input Slots·Password Field로 분리할지.
4. 파일럿 범위에 Search Input·Password Field를 포함할지.
5. Search action이 submit/event인지 시각 affordance인지, password `eye_show`를 어떤 property로 연결할지.
6. keyboard matrix, focus, reduced motion, error relation의 required/not-applicable 계약.
7. Input 폭을 고정값으로 둘지 부모 영역을 채우게 할지, 공개 layout 책임.
8. suffix action 간격과 Mobile 최소 터치 영역.

## 4. Button 재고

### 4.1 코드 시각 정본 — 48개 전수 정의

| 축 | 값 | 개수 |
|---|---|---:|
| Variant | Primary, Secondary, Blue-Line | 3 |
| Platform·Size | PC/MD 44, PC/XSM 34, PC/XXSM 28, Mobile/LG 48 | 4 |
| State | Default, Hover, Pressed, Disabled | 4 |
| 합계 | 3 × 4 × 4 | 48 |

Variant 이름에는 `Variant`, `Size`, `State`, `Break`가 들어간다. Pressed는 현재 코드에서 Hover 색 역할을 재사용한다.

근거: `build-components.ts:166-201,216-231,266-313,480-523`.

### 4.2 정본 anatomy·토큰·geometry

- Figma builder anatomy는 component root + text label 1개다.
- icon node·icon property는 없다.
- height: 44/34/28/48.
- horizontal padding: 16/8/8/16.
- minWidth: 80/64/64/80.
- radius 4, border width 1.
- Semantic Button color 21개, Foundation number 4개, text style `body/14M`, `body/12M`, `body/16M`.

근거: `build-components.ts:192-231,266-313`, `vars-data.ts:317-352,487-508`, `textstyles-data.ts:57-61`.

### 4.3 Registry·행동·사이트 후보

| 영역 | 확인 내용 |
|---|---|
| 의미 | native button 기반 단일 action |
| 상태 | default/hover/pressed/disabled |
| 행동 | enabled click 1회 실행, disabled 무시. native keyboard/focus/disabled 사용 |
| Registry anatomy | label + optional icon + container |
| 사이트 CSS | `.s1-btn` 인라인 CSS와 size/variant/state selector |
| 사이트 runtime | click counter와 disabled demo |
| 코드탭 표출 | Primary/Secondary/Blue-line별 PC/Mobile HTML과 CSS Token pane. CSS Token pane은 실제 selector 규칙이 아니라 토큰 값 목록 |

근거: `registry/components/button.json:27-99`, `registry/components/component-behavior.pc.json:11-22`, `pages/components.html:238-300,4120-4444,8911-8932`.

### 4.4 Button 충돌·stale

| ID | 충돌 | 영향 |
|---|---|---|
| B-01 | 정본은 모든 size에 Hover·Pressed. 사이트 PC에는 Pressed, Mobile에는 Hover 표출이 없음 | 사이트 전수 검수 불가 |
| B-02 | 정본 pressed=hover. Registry·Token Details는 별도 pressed token과 다른 값 설명 | 토큰 migration 필요 |
| B-03 | Blue-line Token pane hover border와 현재 정본 역할값 불일치 | 사이트 문서 stale |
| B-04 | 정본 minWidth 64/80이 일반 `.s1-btn` CSS에 없고 demo 전용 layout에만 있음 | 복붙 결과 geometry 누락 |
| B-05 | Registry는 optional icon anatomy/token을 선언하지만 builder는 text-only | 공개 icon slot 충돌 |
| B-06 | `Blue-Line`·`Blue Line`·`blue-line`, `Break` property의 alias가 불완전 | manifest 어휘 확정 불가 |
| B-07 | `_meta.codeStatus=implemented`, variant/index는 in-progress, a11y pending | 기존 상태만으로 승인 불가 |
| B-08 | 외부 `button.css`는 UNOFFICIAL/deprecated `.sw-button`, 사이트 미연결 | 배포 후보 사용 불가 |
| B-09 | 사이트 `.s1-btn`은 outline을 없애지만 focus-visible 대체 표현이 없음 | 접근성 승인 차단 |

근거: `build-components.ts:216-231,266-313`, `registry/components/button.json:8-13,37-49,100-184,219-239`, `registry/components/index.json:53-63`, `assets/css/components/button.css:1-56`, `pages/components.html:239-300,404-413,4120-4444,8507-8567`.

### 4.5 Button 미확인·결정 필요

1. optional icon slot을 정식 Button anatomy/property로 만들지, 제거하거나 별도 Icon Button으로 둘지.
2. 공개 alias `Blue-Line`↔`Blue Line`↔`blue-line`과 Break property를 어떻게 고정할지.
3. pressed=hover를 유지할지, 기존 pressed component token을 어떻게 이행할지.
4. focus-visible 표현과 접근성 계약.
5. UI library Button을 `jsRequired=false` native control로 둘지, 외부 CustomEvent를 제공할지.

## 5. 시각 참고 정책

- 재고와 구현 수치는 `build-components.ts`, `vars-data.ts`, `textstyles-data.ts`에서 읽는다.
- 레거시 `SW-UX-GUIDE V2.4`는 현재 UI 라이브러리 작업의 비교 대상이 아니다.
- 사람이 정리된 화면을 볼 필요가 있을 때만 `SW-UX-GUIDE V3.0 TEST` overview `5:5706`을 참고한다.
- V3.0 화면도 정본을 변경하는 근거가 아니라 정본의 시각적 이해와 렌더 sanity check를 돕는 참고 자료다.
- 웹 구현의 최종 UX 검수는 실제 dist를 사용하는 디자인가이드 검수 화면에서 수행한다.

## 6. 1단계 검문소 판정

| 검사 | 판정 |
|---|---|
| 코드 정본 axes·조합 목록 | PASS |
| Registry·사이트·외부 CSS·배포 경로 목록 | PASS |
| 충돌·미확인·결정 필요 분리 | PASS · 독립 누락 검사 반영 |
| Figma 전수 목록 | 비대상 · 코드 정본으로 대체 |
| 전체 1-inventory | PASS |

1-inventory를 완료했다. 다음은 코드 정본과 Registry 충돌을 정리하는 2-canon-readiness이며, 이미지로 알 수 없는 동작만 river에게 질문한다.
