# Mobile Header — 2. Build Plan

## 승인·정본 결정

- Gate 34: river가 2026-08-25 사전 승인. 실제 정본 신설 뒤 `component:Mobile Header`로 승인 기록한다.
- 세트명: `Mobile Header`.
- variant 축: `Type` 단일 축.
- 승인된 값: `Standard / Title`, `Standard / Title + Close`, `Home / Title + 2 Icons`, `Home / Title + Subtitle + 1 Icon`, `Home / Title + Alt Title`, `Standard / No Title`.
- 전체 variant 크기: 360×99.

## 빌드 매핑

| Type | 작업 | 소스 | 배경 Semantic | 타이포 | 아이콘 |
|---|---|---|---|---|---|
| Standard / Title | 신규 정본 variant | `540:6113` | `color/navigation/bg` | `title/18M` | 이전 + 우측 spacer |
| Standard / Title + Close | 신규 정본 variant | `540:6137` | `color/navigation/bg` | `title/18M` | 이전 + 닫기 |
| Home / Title + 2 Icons | 신규 정본 variant | `540:6157` | `color/bg/level-2` | `title/18B` | 알림 + 닫기 |
| Home / Title + Subtitle + 1 Icon | 신규 정본 variant | `540:6178` | `color/bg/level-2` | `title/18B`, `body/14R` | Solid key `6babc3f493e48be1e7191a7b8a68945833039fe8`를 `-90°` 회전 + 알림 |
| Home / Title + Alt Title | 신규 정본 variant | `540:6201` | `color/navigation/bg` | `title/18B` | 없음 |
| Standard / No Title | 신규 유형 | 회원가입 구조 요구 | `color/navigation/bg` | 텍스트 노드 없음 | 이전 + 우측 spacer |

## 구조·패킹

- 각 variant root는 360×99 vertical Auto Layout: StatusBar 27, gap 16, AppBar 56.
- StatusBar는 V3 정본 `Platform=App` 컴포넌트 인스턴스를 사용한다.
- AppBar는 원본 padding·gap·정렬을 보존한다.
- 제목 없는 유형은 중앙 제목 노드를 만들지 않고, 좌우 32 슬롯 균형으로 레이아웃을 유지한다.
- 각 variant는 결합 전 `Type=<값>`으로 명명하고 `combineAsVariants` 후 패딩+갭으로 컴팩트 패킹한다.
- 세트와 각 variant는 node-map에 기록한다. 같은 세트 형제 인스턴스 포함·순환참조는 0이어야 한다.

## Figma 배치

- 타깃 file: SW UX GUIDE V3.0 TEST (`cysG5U1udpQqVagYY1hWHW`).
- parent: `Core / Navigation` (`1654:38976`).
- 시작: section 로컬 x=64, y=3036 (절대 x=2384, y=3036).
- 기존 관례대로 세트와 Dark spec을 가로 배치하고 80px gap을 사용한다.
- 사용자가 요청한 미리보기는 같은 section에서 이 신규 세트 아래에 6종을 전수 배치한다.
- section 높이는 신규 콘텐츠가 잘리지 않는 최소치로만 확장한다.

## 코드 정본·파생

- `plugins/figma-vars-installer/src/build-components.ts`에 `Mobile Header` build 함수, Navigation category member, runner 등록을 추가한다.
- 모든 text는 `makeBoundText`와 Pretendard 정본 text style key를 사용한다.
- 모든 fill/stroke는 Semantic Variable로 바인딩한다. 아이콘 fallback raw SVG는 허용하지 않는다.
- Registry 메타·색인은 신규 코어를 찾을 수 있도록 등록하되, 이번 범위에는 손관리 사이트 제작이 없으므로 coverage는 shell 성격의 `noSectionNeeded`로 분류한다. 별도 웹 UI 라이브러리 작업 때 `sectionFor` 승격을 검토한다.
- `npm run tokens:reconcile`로 facts, guide model, DESIGN 안내, 설치기 파생을 재생성한다.
- `pages/components.html`은 변경 전후 동일해야 한다.

## 허용편차 선언서

- 허용편차 #1: `Type=Home / Title + 2 Icons` root fill — 원본 `#F5F6FB` exact Semantic 부재로 `color/bg/level-2`(`#F5F5F5`) 사용.
- 허용편차 #2: `Type=Home / Title + Subtitle + 1 Icon` root fill — 원본 `#F5F6FB` exact Semantic 부재로 `color/bg/level-2`(`#F5F5F5`) 사용.
- 허용편차 #3: 원본 StatusBar 배터리 내부 raw fill/stroke — 신규로 복제하지 않고 V3 정본 StatusBar instance를 재사용해 신규 raw color를 만들지 않음.

## needs-decision

- 없음. 이름, 신규 6번째 유형, Semantic-only 원칙, Gate 34 추가, `>` 화살표 회전 사용은 river 승인 완료.

## 검문소

- Gate 1 inventory: 원본 5 + 신규 1 = 총 6종, 이름 충돌 0.
- Gate 2 plan: 사용자 확인 완료, needs-decision 0.
- Gate 3: builder 결과의 needs-decision 0 필요.
- Gate 4: variant 6/6, raw color 0, 비-Pretendard 0, 순환참조 0, 렌더 불일치 0 필요.
