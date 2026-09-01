# 3-build-guide — 검수 화면·안내 페이지를 실제 dist 소비자로 연결

작업: `select-dropdown-filter-chip` · 담당: 🤖 `guide-builder` · 2026-09-01
(단계마다 append — 세션이 끊겨도 진행 지점이 남도록)

## 0. 입력 확인 (완료)

읽은 것: `2-canon-readiness.md` · `3-build.md` · `ui-library/src/components/{dropdown,select,filter-chip}/manifest.json` + `*.example.html` ·
`component-page-template.md §A` · `.claude/skills/ui-library-code/references/wiring-and-traps.md` ·
`assets/js/ui-library-guide.js`(802줄 전문) · `pages/components.html` 손관리 구간 · `registry/governance/component-presentation-policy.json`.

### ⚠️ 착수 시점에 발견한 차단 요인 (BLOCK-1)

`assets/js/ui-library-guide.js:718`

```js
if (manifest.status !== "approved") throw new Error(`${id} 배포 상태가 approved가 아닙니다.`);
```

| 컴포넌트 | dist manifest status |
|---|---|
| input · button · checkbox · radio · toggle · chip | `approved` |
| **dropdown · select · filter-chip** | **`candidate`** |

즉 지금 `pages/components.html` 의 3개 섹션을 §A 빈 mount 로 교체하면, 그 자리에는 컴포넌트 대신
「승인 배포본을 불러오지 못했습니다: … approved가 아닙니다」 **오류 박스**가 뜬다.
`status` 는 `ui-library/src/components/*/manifest.json` 에 있고 6-promotion 에서 river 승인 후 바뀌는 값이며,
이 에이전트는 `ui-library/src/**` 를 수정하지 않는다(지시).

→ 처리 방침은 아래 각 단계 기록 참조.

---

## 1단계 — `pages/ui-review.html` 검수본 07 추가 ✅ 완료

**손댄 파일 1개: `pages/ui-review.html` (625줄 → 857줄, +232줄)**

| 구간 | 무엇을 |
|---|---|
| `:234` | h1 에 `Select · Dropdown · Filter Chip` 추가 |
| `:238-241` | 뱃지 — `Toggle · Chip`(신규 표식 제거) · `Select · Dropdown · Filter Chip (신규)` · `검수본 2026-09-01 · 07` |
| `:253-255` | 「직접 확인하는 방법」에 3줄 추가(Select 열기/고르기 · Dropdown 두 유형 · Filter Chip Esc 닫기) |
| `:165-171` | 페이지 틀 CSS 3줄 — `.review-sample{align-content:start}` · `.review-static{pointer-events:none}` · `.review-overlay-slot{min-height:190px}` |
| `:320-342` | 섹션 `7. Select Box` · `8. Dropdown (목록 패널 + 옵션 행)` · `9. Filter Chip` 마크업 |
| `:641-822` | 렌더러 — `dropdownOption` · `dropdownMarkup` · `renderDropdownPanel` · `selectMarkup` · `renderSelectPanel` · `filterChipMarkup` · `renderFilterChipPanel` |
| `:828-830` | 3개 matrix 에 렌더 결과 주입 |
| `:834-838` | `S1UI.select` · `S1UI.filterChip` · `S1UI.dropdown` init (정적 표본 제외) |
| `:849` | 포커스 안내 이름표에 3종 추가 |
| `:860-861` | 푸터 런타임 상태 문구에 3종 componentId 추가 |
| `:344` | 푸터 후속 범위에서 Filter Chip 제거 |

### 실제 dist 만 소비했는가 — 그렇다
- 컴포넌트 CSS: 페이지 상단의 기존 `../ui-library/dist/s1-ui.css` 한 줄이 전부다. **인라인 컴포넌트 CSS 를 한 줄도 새로 쓰지 않았다.**
- 컴포넌트 JS: 기존 `import * as S1UI from "../ui-library/dist/s1-ui.js"` 를 그대로 쓰고 `select`/`filterChip`/`dropdown` 만 추가로 init.
- 마크업: 세 모듈 `*.example.html` 의 DOM 계약(부품 이름·role·aria·`data-*` 축)을 그대로 따랐다.
- 새로 쓴 CSS 3줄은 **검수 화면 배치용**(정적 표본 클릭 차단·열린 패널 자리 확보·칸 정렬)이며 컴포넌트 시각이 아니다.

### 정적 표본을 init 하지 않는 이유 (검증 함정 대응)
런타임 `init()` 은 `panel.hidden = true` 를 강제한다. Open/Selected 표본을 init 하면 **패널이 즉시 닫혀 상태가 사라진다.**
그래서 정적 표본에 `data-review-static` 을 붙이고 init 대상에서 제외했다(`:not([data-review-static])`).
Hover 칸만 `class="review-static"` 없이 두어 마우스를 받게 했다(런타임이 없어 클릭해도 아무 일 없음).

### 커버리지
| 컴포넌트 | 정본 조합 | 검수 화면 |
|---|---|---|
| select | 20 (5상태 × 4 size/break) | 정적 4상태 × 4 size/break = 16 + Hover 4칸(마우스 확인) = **20 전수** |
| dropdown-panel | 6 (2유형 × 3크기) | 유형 3표기(글자·체크박스·체크박스+전체선택) × 3크기 = 9 패널 × Light/Dark |
| dropdown-list(옵션 행) | 27 | 각 패널에 Default·Selected 행이 함께 있고 Hover 는 마우스로. 정적 패널도 hover 를 받게 열어둠 |
| filter-chip | 60 (2variant × 2제목 × 5상태 × 3 size/break) | 정적 4상태 × 2×2×3 = 48 + Hover 12칸 = **60 전수** |

### 렌더 확인 (http · 실제 dist)
| 파일 | 육안 대조 결과 |
|---|---|
| `screens/review-07-select-light-pc.png` | ✅ 크기 4종·Default/Filled/Open/Disabled 정상, 열린 패널이 트리거 아래 8px 간격 오버레이로 뜸 |
| `screens/review-08-dropdown-light-dark.png` | ✅ Light·Dark 양쪽, 체크 표시(mask) 정상 표출, 「전체 선택」 아래 구분선 있음, 글자 유형만 선택 라벨이 파랑 |
| `screens/review-09-filter-chip-light-pc.png` | ✅ Line/Solid × 제목 유무 × 크기별 4상태, Complete 는 Default 와 같은 색(값 문구만 다름 — 정본대로) |

- 브라우저 콘솔 오류 **0건**, 페이지 전체 중복 `id` **0개**(실측), `#select/#dropdown/#filter-chip-review-matrix` 모두 내용 채워짐.
- 런타임 상태줄: `… Select select · Dropdown dropdown · Filter Chip filter-chip (열림·키보드·바깥클릭 런타임 포함)`

### ❗ 렌더에서 발견한 구현 결함 — `needs-rebuild` (REBUILD-1)

**chevron 방향이 정본과 반대다.**

| | 정본 `build-components.ts:1452-1454` | 실제 dist 표출 |
|---|---|---|
| 닫힘(Default·Filled·Disabled) | `chevDown` (아래 ∨) | **위 ∧** |
| 열림(Open/Selected) | `chevUp` (위 ∧) | **아래 ∨** |

원인: `ui-library/dist/components/select.css:47` · `filter-chip.css:56` 이 아이콘 기본값에 `transform: rotate(180deg)` 를 주고
`[aria-expanded="true"]` 에서 `rotate(0deg)` 로 되돌린다. 그런데 `assets/icons/chevron.svg` 는 이미 **아래 방향(`M4 6L8 10L12 6`)** 이라
기본값에서 180° 돌면 위를 향하게 된다. 두 규칙의 값을 서로 바꾸면 해결된다.

- 이 에이전트는 `ui-library/src/**` 를 고치지 않는다(지시) → **`needs-rebuild` 로 올린다.**
- 갈래 판정: 「원본을 베껴야 하는 것」(아이콘 방향) 이므로 두갈래 분류 (b)/(c) 대상이 아니라 **(a) 코드 실수**다.

---

## 2단계 — `assets/js/ui-library-guide.js` ✅ 완료 · 3단계 — 표출 정책 ✅ 완료

### `assets/js/ui-library-guide.js` (802줄 → 1057줄, +255줄)
| 구간 | 무엇을 |
|---|---|
| `:33-51` | `componentConfig` 에 `select` · `dropdown` · `"filter-chip"` 3항목(toggle·chip 과 같은 형식, `runtime` 은 `S1UI.select`/`S1UI.dropdown`/**`S1UI.filterChip`**) |
| `:648-892` | 마크업 생성기 `dropdownOptionMarkup`·`dropdownMarkup`·`selectMarkup`·`filterChipMarkup`, 공통 `sizeStateGrid`, 매트릭스 `selectStateMatrix`·`dropdownStateMatrix`·`filterChipStateMatrix` |
| `:900-902` | `stateMatrix(id)` 분기 3줄 |
| `:1046` | 마운트 후 init 대상에 3종 추가(`:not(.is-preview)` 유지) |
| `:1056` | `guideComponents` 배열에 3종 추가 |

**dist 만 소비한다** — 마크업은 `*.example.html` 계약 그대로, CSS·JS·코드탭 내용은 전부 `ui-library/dist` 에서 fetch 한다(기존 `urls(id)` 경로 그대로).
`S1UI.filterChip` 이 하이픈 없는 camelCase 인 점을 배선에 반영했다(dist 번들이 `export * as filterChip` 로 낸다).

### 레이아웃 — §A 준수
- 상태 표 축을 **열=크기 · 행=상태**로 통일했다(Button 의 `variantGrid` 와 같은 틀). 공통 함수 `sizeStateGrid()` 하나가 세 컴포넌트를 모두 그린다 — 유형이 섞이지 않는다.
- Action 은 **열=크기 · 행=variant**(Button·Chip 과 동일). Select 는 variant 가 없어 `Select` 1행 + `Disabled` 1행.
- variant 블록 사이는 공유 규칙 `.uilg-variant-block + .uilg-separator`(24px)를 그대로 쓴다 — **새 값을 만들지 않았다.**
- Filter Chip 은 variant 블록 2개(Line·Solid), 각 블록 안에 제목 있음/없음 두 표. Dropdown 은 옵션 행 상태 블록 2개(글자·체크박스).

### `assets/css/ui-library-guide.css` (+27줄, `:262-288`)
검수 전용 forced state 4개(select trigger hover · dropdown option hover · filter-chip line/solid hover) + `.uilg-open-cell { min-height: 200px }`.
**forced state 는 dist 의 Hover 규칙과 완전히 같은 토큰만 쓴다**(`--color-form-control-bg-hover` · `--color-dropdown-option-bg-hover`/`-label-hover` · `--color-chip-line-bg-hover` · `--color-chip-solid-bg-hover`). 새 값·새 토큰 0건.

### `registry/governance/component-presentation-policy.json`
`filter-chip`(`:238`) · `select`(`:348`) · `dropdown`(`:392`) 세 블록에 `"managedBy": "ui-library-guide"` 1줄씩 추가.
현재 `managedBy` 선언 = `toggle · checkbox · radio · button · chip · filter-chip · input · select · dropdown` **9건**.

> 참고(고치지 않음): `dropdown` 표출 정책의 `states` 에 `disabled` 가 있으나 정본 `buildDropdownList` 와 웹 모듈에는 옵션 행 disabled 가 없다. 정책 메타의 상태 목록 수정은 이 작업 범위 밖이라 손대지 않고 여기 적어 둔다.

### 커버리지 — 정본 조합 대비
| 컴포넌트 | 정본 | 안내 페이지 |
|---|---|---|
| select | 5상태 × 4 size/break = 20 | PC 3크기 × 5상태 = 15 + Mobile 1크기 × 5상태 = 5 → **20 전수** |
| dropdown | 패널 6(2유형×3크기) + 옵션 행 27 | Action 에 유형 3 × 크기 3 = 9 패널, 상태 블록에 유형 2 × 크기 3 × 상태 3 = 18 셀 |
| filter-chip | 2variant × 2제목 × 5상태 × 3 size/break = 60 | PC 2×2×2크기×5 = 40 + Mobile 2×2×1크기×5 = 20 → **60 전수** |
