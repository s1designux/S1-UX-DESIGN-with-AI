# 1-inventory — 바텀시트 전수 재고조사

작업: `bottom-sheet` · 2026-09-15 · 판독 = 📖 `source-reader`(build-components.ts 전체 추적) + `registry/components/component-facts.json`

---

## 1. 정본에 무엇이 있나

| 세트 | 빌더 | 등록 위치 |
|---|---|---|
| **Bottom Sheet** | `buildBottomSheet` (5152~5327) | 카테고리 6733 · 의존성 6795 (`["Bottom Sheet Option","Button"]`) · 빌더표 6974 |
| **Bottom Sheet Option** | `buildBottomSheetOption` (4957~5150) | 카테고리 6733 · 의존성 6799 (`["Checkbox","Radio"]`) · 빌더표 6975 |

두 세트는 카테고리 그리드에서 한 묶음(`{ name: "Bottom Sheet", members: [...] }`)이다.

### 이미 배포된 "친척" 시트 (같은 뼈대, 다른 정본)

| 세트 | 빌더 | 웹 구현 |
|---|---|---|
| Date Picker Mobile Bottom Sheet | `buildDatePickerBottomSheet` (4617~) | `date-picker.css` 469~540 · `date-picker.js` · `date-picker.mobile.example.html` |
| Time Picker Mobile Bottom Sheet | `buildTimePickerMobileBottomSheet` (4730~) | `time-picker.css` 262~320, 444~447 |

---

## 2. Bottom Sheet — 정본 실측

### 변형 축
`Footer` 한 축, 값 `None` · `Single` · `Dual` (5242). 다른 축 없음.

### root (5247~5288)

| 속성 | 값 | 줄 |
|---|---|---|
| 방향·크기 | VERTICAL · 세로 AUTO(hug) · 가로 FIXED 360 | 5251~5252 |
| padding | 위 20 / 좌우 0 / 아래 **None=40, Single·Dual=20** | 5254~5255 |
| itemSpacing | **48** (content ↔ footer) | 5253 |
| 정렬 | counterAxisAlignItems CENTER | 5256 |
| 배경 | `color/surface/raised` (Variable 바인딩) | 5257 |
| 반경 | 위 8 / 아래 0 | 5258 |
| clipsContent | true | 5259 |
| 그림자 | `shadow/raised-up` — **Variable 바인딩 아님(raw, 라이트 값 고정)** | 5260~5263 |

### 자식 트리

```
Footer={None|Single|Dual}
└─ content            VERTICAL · 세로 AUTO · 가로 FIXED · itemSpacing 24 · fills 없음
   ├─ header          HORIZONTAL · SPACE_BETWEEN · CENTER · padding 좌우 20 · STRETCH · fills 없음
   │  ├─ title        "헤더 타이틀" · title/20B · color/text/title/primary
   │  └─ close        아이콘 24 · color/icon/gray-dark
   └─ Content         ★ Figma SLOT 노드(이름 "Content") · VERTICAL · itemSpacing 0 · STRETCH
      └─ option × 4   Bottom Sheet Option 세트 Type=Text 인스턴스 (2번째만 Selected, 나머지 Default) · 각각 FILL
└─ footer             (Footer=None 이면 노드 자체가 없음)
      HORIZONTAL · 가로 FIXED · 세로 AUTO · CENTER/CENTER · padding 좌우 20 · itemSpacing 8 · STRETCH · fills 없음
      Single → Button(primary, Size=LG, State=Default, 라벨 "적용") · FILL
      Dual   → Button(secondary "취소") + Button(primary "적용") 순서 · 둘 다 FILL
```

**"좌우 여백 20"은 root 가 아니라 `header` 와 `footer` 각각에 걸려 있다.** root 좌우 패딩은 0이다.

### 토큰

`color/surface/raised` · `color/text/title/primary` · `color/icon/gray-dark` · (세트 컨테이너 배경 `color/bg/level-3` — 피그마 전시용, 웹 무관) · `shadow/raised-up`(raw).
패딩·간격·폭(48·24·20·8·360)은 **숫자 리터럴**이며 Variable 미바인딩이다(설치기 맵에 semantic number 미노출).

---

## 3. Bottom Sheet Option — 정본 실측

### 변형 축과 **실제 존재하는 9칸** (12칸 매트릭스가 아니다)

| Type \ State | Default | Selected | Disabled |
|---|---|---|---|
| Text | ✅ | ✅ | ✅ |
| Checkbox | ✅ | ✅ | ❌ 없음 |
| Radio | ✅ | ✅ | ❌ 없음 |
| List | ✅ | ❌ 없음 | ✅ (잠금 아이콘) |

세트 순서(5123~5124): Text:Default, Text:Selected, Text:Disabled, Checkbox:Default, Checkbox:Selected, Radio:Default, Radio:Selected, List:Default, List:Disabled.

### 행 geometry

| | Text · Checkbox · Radio (5017~5028) | List (5103~5116) |
|---|---|---|
| 크기 | 360 × **48 고정** | 360 × **hug(AUTO)** |
| 방향 | HORIZONTAL | HORIZONTAL |
| 주축 정렬 | MIN — **단 Text:Selected 만 SPACE_BETWEEN** | SPACE_BETWEEN |
| 교차축 | CENTER | CENTER |
| padding | 좌우 20 · 위아래 8 | 좌우 20 · 위아래 12 |
| itemSpacing | 8 | 코드에 지정 없음 → **미확인** |
| 배경 | `color/surface/raised` (전 Type·State 공통) | `color/surface/raised` |

### 자식 구조

| 칸 | 구조 |
|---|---|
| Text:Default | 라벨 "항목" `body/16M` · `color/text/body/primary` |
| Text:Selected | 라벨 `color/text/state/accent` + 우측 **check 아이콘 24** `color/icon/blue` |
| Text:Disabled | 라벨 `color/text/state/disabled` |
| Checkbox:Default/Selected | Checkbox 코어 인스턴스(`State=Default` / `State=Checked`) + 라벨 `color/text/body/primary` |
| Radio:Default/Selected | Radio 코어 인스턴스(`State=Default,Label=Off` / `State=Selected,Label=Off`) + 라벨 `color/text/body/primary` |
| List:Default | `list-left`(HORIZONTAL · gap 12) + 우측 **chevron 24** `color/icon/gray-dark` |
| List:Disabled | `list-left` 동일(글자색 분기 없음) + 우측 **lock 24** `color/icon/gray` |

`list-left` 내부: `avatar` 40×40 · radius 20 · 배경 `color/icon/gray-light` · 안에 **account 아이콘 24** `color/icon/white` / `list-text`(VERTICAL · gap 2) → `title` "제목" `body/16M` `color/text/body/primary` + `sub` "서브 텍스트" `body/14R` `color/text/body/secondary`.

**행 배경은 State 별 분기가 없다** — 선택 표시는 글자색과 아이콘으로만 한다.

### 텍스트 스타일
`body/16M`(행 라벨·List 제목) · `body/14R`(List 서브) · `title/20B`(시트 헤더).

---

## 4. 웹에 이미 있는 것 (재사용 후보)

### 시트 껍데기 — date-picker·time-picker 가 같은 CSS 를 두 벌 갖고 있다

두 파일의 `sheet` · `sheet-backdrop` · `sheet-panel` · `sheet-header` · `sheet-title` · `sheet-close` 규칙은 **주석까지 사실상 동일**하다. 값:

| 부품 | 값 |
|---|---|
| sheet | `position:fixed` · `inset:0` · flex · `align-items:flex-end` · `justify-content:center` · `z-index:1000` · `[hidden]` 숨김 |
| sheet-backdrop | `position:absolute` · `inset:0` · `background: var(--color-overlay)` |
| sheet-panel | `--color-surface-raised` · 위 모서리 `--radius-8` · `padding-block: --spacing-20` · **`gap: --spacing-32`** · `max-width:360px` · `width:100%` · `max-height:92vh` · `overflow-y:auto` · 그림자 없음 |
| sheet-header | flex · `space-between` · `align-items:center` · `padding-inline: --spacing-20` |
| sheet-title | `--color-text-title-primary` · 20 · bold · `line-height:130%` (정본 `title/20B`) |
| sheet-close | 24×24 · `mask: close.svg` · `background-color: --color-icon-gray-dark` |
| sheet-footer | `padding-inline: --spacing-20` · 안의 버튼 `width:100%` |

### 동작 — date-picker.js 가 이미 갖고 있다
열기·닫기(`hidden`) · `role=dialog`+`aria-modal`+`aria-labelledby` · 초점 첫 요소로 이동 · Tab 가둠 · 닫기 X 클릭 · **배경(backdrop) 클릭 닫기**.

### 모달과 겹치는 부분
`modal.js` 가 이미 갖고 있는 것: Esc 닫기 · 초점 가둠 · 초점 복귀 · 배경 스크롤 잠금(중첩 카운트) · focusin/focusout 새어나감 방지 · `init`/`destroy`.
**모달과 다른 점:** 모달은 딤 클릭으로 닫지 않는다(river 결정 2026-09-02, 범위 A). 시트는 배포된 date-picker 가 이미 딤 클릭으로 닫는다.

### 코어 재사용
`button`(푸터 LG) · `checkbox` · `radio`(Option 행) — 셋 다 approved 배포본.

### 아이콘

| 필요 | 등록 상태 |
|---|---|
| close 24 | ✅ 등록됨 (modal 과 공유, `color/icon/gray-dark`) |
| check (Text:Selected) | ✅ 등록됨 — 다만 웹 자산은 16 프레임(체크박스용). glyph=frame 비례라 24 로 확대해 쓴다 |
| chevron 24 (List) | ✅ 등록됨 (오른쪽 방향은 CSS 회전) |
| account 24 (List avatar) | ✅ 등록됨 |
| **lock 24 (List:Disabled)** | ❌ **없음** — 아이콘 라이브러리 키(`b3ccc4b2…` ic_잠김 V2.2)가 `registry/figma/allowed-remote-keys.json` 허용목록에 없다 |

---

## 5. 밀도(density) 판정

`registry/governance/density-policy.json` 의 기준은 "**한 줄에 나란히 놓이는 컨트롤만** 밀도로 묶는다"(`outOfScope._note`).

- **bottom-sheet** — 화면 아래에서 올라오는 전면 오버레이다. 줄에 나란히 서지 않고, 정본에 크기 축 자체가 없다 → **outOfScope**(modal 과 같은 이유).
- **bottom-sheet-option** — 시트 안쪽 줄이다. 정본에 크기 축이 없고 높이는 48 하나뿐이며, 시트 자체가 모바일 전용이라 PC 밀도 3단이 성립하지 않는다 → **outOfScope**.

---

## 6. 목록 누락·미확인

| 항목 | 상태 |
|---|---|
| List 행 `itemSpacing` | **미확인** — 코드에 지정 구문 없음(기본 0 추정, 단정하지 않음) |
| Bottom Sheet 실제 렌더 높이 | **미확인** — AUTO 라 정본에 고정 숫자 없음 |
| Checkbox·Radio·Button 인스턴스 내부 토큰 | 각 코어 정본 범위 — 이 작업에서 건드리지 않는다(재사용만) |
| 슬롯의 웹 대응 | Figma SLOT 노드 ↔ 웹은 빈 컨테이너 + 화면이 채움. 아래 2-canon-readiness 에서 계약으로 확정 |
