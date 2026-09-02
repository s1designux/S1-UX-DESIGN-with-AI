# 1-inventory — Time Picker 전수 재고조사

- 작업: `time-picker` · 날짜 2026-09-02
- 판독: 📖 `source-reader` (실제 파일·줄 인용 기반) · 정리: ⭐ 오케스트레이터
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- 의미·행동·접근성 정본: `registry/components/time-picker.json`

## A. 정본에 있는 것

### A-1. 트리거(시간 입력칸) — `buildTimePicker` (2357–2422)

| 크기(축) | 높이 | 글자 | 좌 패딩 | 우 패딩 | 아이콘 |
|---|---|---|---|---|---|
| XXSM · PC | 28 | 12 | 10 | 6 | 20 |
| XSM · PC | 34 | 14 | 12 | 8 | 24 |
| MD · PC | 44 | 14 | 16 | 8 | 24 |
| MD · Mobile | 48 | 14 | 16 | 8 | 24 |

- 모서리 4px(전 크기 공통, 2382), 테두리 1px INSIDE, 내부 가로 배치 SPACE_BETWEEN, 항목 간격 8 (2377–2385)
- 상태 5종 (2358–2363): Default(placeholder "시간 선택") · Hover(bg hover) · Focus(선택 테두리) · Filled("09:30", 본문색) · Disabled(비활성 bg·테두리·글자·아이콘)
- 정본은 폭 150 고정(2389) — 스펙시트 표현용
- Focus 변형에만 드롭다운 인스턴스가 세로로 붙는다(2391–2404, Select 와 동일 방식)

### A-2. 드롭다운 패널 — `buildTimePickerDropdown` (2477–2624)

| 항목 | 값 | 줄 |
|---|---|---|
| 24시간형 | 시·분 2열, 패널 폭 121 | 2469, 2591–2596 |
| 오전오후형 | 오전오후·시·분 3열, 패널 폭 194 | 2469, 2591–2596 |
| 목록 영역 높이 | 192 | 2468 |
| 모서리 / 그림자 | 4 / `shadow/dropdown` = 0 4px 8px rgba(0,0,0,.15) | 2513, 2516 |
| 위 여백 / 열 좌우 여백·간격 | 12 / 8·8 | 2468, 2514, 2536 |
| 열 사이 구분선 | 1px 세로, `color/line/gray/subtle` | 2493–2498 |
| 확인 줄 | 위 가로 구분선 1px + 좌우 16·위아래 12, 우측 정렬 "확인"(14 Medium) | 2549–2565 |
| 확인 활성 색 | 활성 `color/text/state/accent` · 비활성 `color/text/state/disabled` | 2559–2565 |
| 세트 변형 | Type(24h/12h) × State(시 Hover·시 Selected·분 Hover·분 Selected) = 8 | 2568–2582 |

### A-3. 목록 칸 — `buildTimePickerCell` (2437–2476)

- 44 × 32, 좌우 여백 12, 모서리 4 (2434, 2450)
- 상태 3종: Default / Hover / Selected — `color/dropdown/option/{bg,label}/*` (2439–2443)
- **테두리 없음** — 2026-06-30 정본에서 제거됨 (2432–2433)
- 패널 안에서는 열 폭을 채우도록 늘어난다(STRETCH, 2489–2492)

### A-4. 아이콘

- 역할 키 `clock`, `ICON_KEYS.clock = ca1d043a…`(V2.2 아이콘 라이브러리, 원본 97:271) — 1173
- 트리거 안 크기 20 또는 24 (`fcIconPx`, 1312)

### A-5. 토큰 — 전용 토큰 0개

| 대상 | 토큰 | 출처 |
|---|---|---|
| 트리거 배경·테두리·글자·아이콘 | `color/form-control/*` | Input 과 공유 (registry 70–131 전부 `semantic-shared`) |
| 패널 배경·테두리 | `color/dropdown/list/*` | Dropdown 재사용 |
| 패널 그림자 | `shadow/dropdown` | vars-data.ts:455 |
| 칸 배경·글자 | `color/dropdown/option/*` | Dropdown 재사용 |
| 구분선 | `color/line/gray/subtle` | 공용 |
| 확인 글자 | `color/text/state/{accent,disabled}` | 공용 |

## B. 정본에 있으나 이번 범위 밖

| 대상 | 정본 위치 | 처리 |
|---|---|---|
| 모바일 바텀시트(휠 4열·상하 흐림 110px·날짜/시간 탭 변형·적용 버튼, 폭 360) | `buildTimePickerMobileBottomSheet` 3894–4113 | **범위 밖** — river 결정(D1). Date Picker 바텀시트와 구조를 공유하므로 그 작업 때 함께 만든다 |

## C. 정본에 없는 것 (만들지 않음)

| 대상 | 어디에 있나 | 판정 |
|---|---|---|
| TimePicker Select (시·분 각각 화살표 필드) | `pages/components.html` 1271~ 손관리 마크업 (옛 Figma `timepicker_select 540:3636`) | 정본 빌더에 없음 → 웹 배포본 만들지 않음 (D3) |
| 칸 테두리 | 2026-06-30 정본에서 제거 | 되살리지 않음 |
| Error 상태 | 정본 상태 5종에 없음 | 만들지 않음 |

## D. 현재 웹 라이브러리 상태

- `ui-library/src/components/` 에 time-picker **없음**
- `ui-library/scripts/build.mjs` · `test.mjs` · `package.json exports` 어디에도 미등록
- `pages/components.html` 은 손관리 마크업만 있고 내비 버튼 비활성
- 시계 아이콘이 `ui-library/src/assets/icons/` 에 **없음** → 신규 등록 필요(2겹 frame/glyph 구조)

## E. 미확인 (추측하지 않음)

- 정본 빌더의 시/분 샘플은 데모용 7칸뿐이라 **실제 목록 범위·간격에 대한 정본 규정이 없다** → river 결정으로 처리(D2)
- 열 스크롤은 정본이 스펙시트라 잘림(clip)만 있고 스크롤 동작 규정이 없다 → 웹에서 표준 세로 스크롤로 구현
- registry `figmaNodeId 958:26994` 와 정본 주석 `540:3690` 번호 불일치 — 해석하지 않고 둘 다 기록만 한다

## 검문소

목록 누락 0건. 모르는 항목은 §E 에 `미확인` 으로 남겼다. ✅ 통과
