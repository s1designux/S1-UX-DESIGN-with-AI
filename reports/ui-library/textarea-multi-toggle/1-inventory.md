# 1-inventory — Textarea · Multi Toggle

- 작업: textarea-multi-toggle
- 날짜: 2026-09-02
- 판독: 📖 source-reader (⭐ 자기 훑기 없음 — 하드룰 H5)
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- Figma V3.0: 조회하지 않음(코드 정본만으로 축·수치·토큰 확정)

## A. Textarea — 정본 `buildTextarea` (build-components.ts:1388)

| 항목 | 정본 사실 | 근거 |
|---|---|---|
| 축 | State 1축만 — Default / Focus / Filled / Disabled / Readonly (5) | `:1391-1397` |
| 크기 | 240 × 80 고정. size 축·breakpoint 축 **없음** | `:1403-1412` |
| padding | 상 12 / 우 12 / 하 10 / 좌 10 | `:1403-1412` |
| radius · border | 4 · 1(INSIDE) | `:1403-1412` |
| 타이포 | 14 / Regular | `:1408-1421` |
| 부품 | 텍스트만. Focus 는 텍스트+커서를 `lead` 프레임으로 묶음 | `:1396, :1408-1421` |
| **없는 것** | 라벨 · 안내문구(helper) · 글자수 카운터 — 주석 "원본 Helper=On 은 별도 스펙, 1차는 필드 상태만" | `:1396` |

### 상태별 색 토큰 (모두 `color/form-control/*`)

| 상태 | 배경 | 테두리 | 글자 |
|---|---|---|---|
| Default | bg/default | border/default | text/placeholder |
| Focus | bg/selected | border/selected | text/selected |
| Filled | bg/default | border/default | text/default |
| Disabled | bg/disabled | border/disabled | text/disabled |
| Readonly | bg/disabled | border/default | text/read-only |

### Input(`buildInput` :948)과의 관계

| | Textarea | Input |
|---|---|---|
| 축 | State(5) | Size(4) × State(7) × Message(2) |
| 높이 | 80 고정 | 28 / 34 / 44 / 48 |
| 트레일링 아이콘 | 없음 | 있음(비밀번호 눈·지우기 ×) |
| 안내메시지 | 없음 | 있음 |
| 토큰 | `color/form-control/*` **전부 공유** · 커서 구조 동일 | 좌동 |

## B. Multi Toggle — 정본 세트 2벌

### B-1. 셀 정의 `buildMultiToggleElement` (:5376)

- 축: position(first / middle-left / middle-right / last) × state(default / hover / selected / disabled) × size(md / sm) = **32 variant**
- 크기: md = 높이 44 · 좌우 12 · 글자 14 · 최소너비 64 / sm = 높이 34 · 좌우 8 · 글자 14 · 최소너비 56 (`:5399-5412`)
- 모서리: first = 좌상4·좌하4 / last = 우상4·우하4 / middle 둘 다 0 (`:5420-5424`)
- 테두리(면별): first·middle-left = 좌1 우0 상1 하1 / middle-right·last = 좌0 우1 상1 하1 (`:5443-5448`)
- 색(**신규 토큰 0건, 버튼 토큰 재사용**, `:5384-5391`)

| 상태 | 토큰 |
|---|---|
| default | `color/button/{bg,border,label}/secondary--default` |
| hover | `.../secondary--hover` |
| selected | `.../primary--default` |
| disabled | `.../disabled` |

### B-2. 조합형 `buildMultiToggle` (:5513)

- 축: Size(md / sm) × Selected(Left / Center / Right) = **6 variant**
- 배치: 셀 인스턴스 3개, 간격 0, 가로 오토레이아웃 (`:5540-5573`)
- 자체 색 토큰 없음 — 색은 전부 자식 셀이 갖는다

### 정본에 **없는 것**

- focus 상태 없음 (`:5379`)
- 모바일 전용 크기 없음 — md/sm 뿐 (`:5382-5385`)
- 3칸 외 구성 없음 — 항상 3칸 고정 (`:5567`)

## C. 토큰 존재 확인 — `vars-data.ts`

A·B 에서 나온 색 토큰 **전수 존재 확인, 없는 토큰 0건.**

- `color/form-control/*` 14종 — `vars-data.ts:582-598, 717`
- `color/button/*`(secondary·primary·disabled) bg·border·label — `:503-521`
- `color/text/state/*` — `:706-709`

## D. 현재 사이트(파생) 현황 — `pages/components.html`

| 항목 | Textarea (#textarea :2261) | Multi Toggle (#multi-toggle :2039) |
|---|---|---|
| CSS | **인라인 손관리** `:731-756` (공통 `.s1-input-wrap*` `:676-730`) | **인라인 손관리** `:1052-1094` |
| JS | 인라인 스니펫 `:2416-2436` | 인라인 `wireMultiToggle()` `:6366-6389` |
| dist 소비 | **아니오** (dist 에 해당 클래스 0건) | **아니오** |
| 아이콘 | 없음 | 없음 |
| 내비 버튼 | `disabled` (`:1985`) | `disabled` (`:1979`) |
| `ui-library-guide.js` componentConfig | **없음** | **없음** |

## E. ui-library 배선 현황

| 항목 | 현재 |
|---|---|
| `src/components/` | button·checkbox·chip·dropdown·filter-chip·input·radio·select·toggle (9) — **대상 2종 없음** |
| `scripts/build.mjs` componentIds | 9개 배열 (`:13`) — 대상 없음 |
| `scripts/test.mjs` componentIds | 동일 (`:16`) — 대상 없음 |
| `package.json` exports | 9개 컴포넌트 — 대상 없음 |

## F. 착수 차단 요인

| # | 항목 | 처리 |
|---|---|---|
| 1 | `registry/components/textarea.json` a11yStatus = **pending** | 2-canon-readiness 에서 확정 |
| 2 | `registry/components/multi-toggle.json` a11yStatus = **pending** | 2-canon-readiness 에서 확정 |
| 3 | Textarea 안내문구 — 사이트에는 있고 정본에는 없음 | river 결정(D1) — 이번 범위 밖 |
| 4 | Textarea resize 정책 미확정 | river 결정(D2) — 세로만 |

## 미확인 (정직하게 남김)

- 두 섹션의 **실제 브라우저 렌더 픽셀** 대조는 이 단계에서 하지 않았다(코드 추적만). 4-verification 에서 실제 렌더로 확인한다.
- Figma 원본 노드 실측값과의 대조는 하지 않았다 — 이 작업의 시각 정본은 저장소 코드다.
