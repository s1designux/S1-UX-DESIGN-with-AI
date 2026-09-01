# 4-verification (독립) — component-verifier 시나리오 F

- 대상: `select` · `dropdown` · `filter-chip` (work-id `select-dropdown-filter-chip`)
- 검증자: 🤖 component-verifier (구현자·오케스트레이터와 분리)
- 일시: 2026-09-01
- 기준: `plugins/figma-vars-installer/src/build-components.ts`(시각 정본) · `registry/components/{select,dropdown,filter-chip}.json` · `registry/components/component-behavior.pc.json` · `registry/governance/ui-library-code-contract.json`
- 방법: 자체 제작 계측 fixture(전 조합 생성 + `getComputedStyle` 실측) · 실제 마우스 hover · 실제 키보드/클릭 실행 · dist 재생성 대조. **⭐ 의 `4-verification.md` 는 읽지 않았고 근거로 쓰지 않았다.**

## 최종 판정: **FAIL** (❌ 4건 · BLOCKED 0 · ❓ 0)

---

## A. 정본 조합 전수 대조

| 대상 | 정본 조합 | 배포본 축 | 결과 |
|---|---|---|---|
| Select | 20 = 상태 5 × (크기·브레이크) 4 (`build-components.ts:1452-1470`) | `data-size` xxsm/xsm/md × `data-break` pc(3)/mobile(md) = 4 · 상태 default/hover/open/filled/disabled = 5 | ✅ 20/20, 누락 0 · 초과 0 |
| Dropdown 패널 | 6 = 유형 2 × 크기 3 (`:1702-1711`) | `data-type` text/checkbox × `data-size` xxsm/xsm/md | ✅ 6/6 |
| 옵션 행 | 27 = 유형 3 × 크기 3 × 상태 3 (`:1557-1575`) | text / checkbox / checkbox+`data-select-all`(+divider) × 3크기 × default·hover·selected | ✅ 27/27 |
| Filter Chip | 60 = variant 2 × 제목 2 × 상태 5 × (크기·브레이크) 3 (`:2199-2213`) | `data-variant` × `data-title` × 5상태 × sm-pc/md-pc/md-mobile | ✅ 60/60 |

정본에 없는데 만든 조합: **없음.** 정본 밖 추가는 `:focus-visible` 아웃라인뿐이고 세 컴포넌트 모두 `cssContract.nativeStates` 에 선언돼 있다(단 select 의 `notInCanon` 서술이 이를 부정한다 → ❌4).

## B. 실제 렌더 대조 (PC·Mobile × Light·Dark)

스크린샷: `reports/ui-library/select-dropdown-filter-chip/screens/independent-verify-light.png` · `…-dark.png`

### Select — 20셀 전수 실측 ✅
높이 28/34/44/48 · 글자 12/14/14/14 · 아이콘 20/24/24/24(`fcIconPx` h≤28→20) · `padding-left 16` `padding-right 8` · `border-radius 4` · `border-width 1` — 20셀 모두 정본 일치.
상태 토큰: Default·Hover `bg/default`+`border/default`+`text/placeholder` / Open `bg/selected`(#FFFFFF)+`border/selected`(#1D6CEB) / Filled `text/selected`(#202020) / Disabled `bg/disabled`(#F5F5F5)+`border/disabled`(#E9E9E9)+`text/disabled`+`icon/disabled`(#C4C4C4) — 일치. **단 hover 겹침은 ❌1 참조.**

### Dropdown ✅ (1px 예외는 ❌2)
패널: `padding-block 4` · `radius 4` · `border 1` `#D9D9D9`(`list/border`) · `bg #FFFFFF`(`list/bg`) · `box-shadow rgba(0,0,0,0.15) 0 4px 8px` — 정본 `shadow/dropdown` 일치, 다크에서 동일값 유지(정본대로, 정상).
옵션 행: 28/34/44 · 12/14/14 · `padding-inline 12` · 체크박스 유형만 `gap 8`(글자 유형 `normal`) · 체크박스 실치수 18px(정본 `CHK_PX=18`) — 일치.
상태(실제 hover 실측): hover `bg #F5F5F5`·`label #202020` / Text-Selected `bg #FFFFFF`(default 재사용)·`label #1D6CEB` / **Checkbox-Selected 라벨은 강조 없음 `#353535`** — 정본 2026-08-14 결정 그대로 ✅.

### Filter Chip — 60셀 전수 실측 ✅
높이 28(SM·PC)/34(MD·PC)/30(MD·Mobile) · padding 12·6 / 16·8 / 12·6 · `gap 4` · `radius 9999px` · `border 1` · 아이콘 **20px 고정**(fcIconPx 미사용) · 글자 14 Medium(500) — 60셀 일치.

브리핑에서 지목한 항목 직접 확인 결과:

| 확인 요청 | 결과 |
|---|---|
| **Complete 가 Default 와 같은 토큰인가** | ✅ 사실. Line·Solid 모두 Complete 실측이 Default 와 완전 동일(bg/border/label/icon). `data-complete="true"` 에 걸린 CSS 규칙 0건 — 전용 스타일을 만들지 않았다. 정본 `chipSlot` 의 `default:` 분기와 일치. 문구만 "과거순". |
| **패널 매핑 SM→xxsm · MD→xsm** | ✅ 실측 확인. md-mobile 도 `xsm`(정본은 `sc.size` 로만 매핑하므로 브레이크 무관) — 일치. |
| **Line Selected = 테두리만 파랑, 라벨은 default** | ✅ `border #1D6CEB` · 트리거 color `#757575`(label/default) · 아이콘 `#757575`. Title=On 의 값 라벨만 `#1D6CEB`(정본 `valLbSlot`), Disabled 에서는 `#C4C4C4` 로 내려감 — 정본과 일치. |
| **Solid Selected 는 라벨도 selected** | ✅ `bg/border #1D6CEB` · 제목·값·아이콘 모두 `#FFFFFF`. |
| **`shadow/dropdown` 다크 동일** | ✅ 라이트·다크 모두 `rgba(0,0,0,0.15) 0 4px 8px` — 정본대로, 결함 아님. |

실제 hover 실측: Line hover `bg #FAFAFA` + **테두리 `#C4C4C4`(border/default 유지)** ✅ / Solid hover `bg #E9E9E9` + **테두리도 `#E9E9E9`**(정본 `bdGroup:"bg"`) ✅.

### 다크모드 ✅
`[data-theme="dark"]` 에서 세 컴포넌트 모두 표면·테두리·라벨이 전환되고, 화살표 방향·기하는 라이트와 동일. 라이트에서만 정의된 하드코딩 색 0건(모두 토큰 경유).

### 화살표 방향 — ⭐ 주장 검증
**⭐ 의 "방향 반전을 고쳤다"는 주장은 사실이다.** 직접 확인:
- 자산 `ui-library/src/assets/icons/chevron.svg` 의 glyph path = `M4 6L8 10L12 6` → **아래(∨)**. 정본 `chevDown`(`build-components.ts:1450`)과 문자 단위로 동일.
- 닫힘 실측 `transform: matrix(1,0,0,1,0,0)`(0°) → ∨ · 열림 실측 `matrix(-1,0,0,-1,0,0)`(180°) → ∧. Select 4크기·Filter Chip 12조합 전부 동일.
- 스크린샷 육안 대조에서도 닫힘 ∨ / 열림 ∧ 확인. 정본 `st.up ? 90 : 270`(Figma 회전 = 최종 방향: 90=위·270=아래)과 같은 방향.

### 아이콘 hit area / frame / glyph 독립 실측 ✅
| 층 | Select xxsm | Select xsm·md | Filter Chip |
|---|---|---|---|
| hit area(`[data-s1-part="icon"]` 박스) | 20×20 | 24×24 | 20×20 |
| SVG frame(외곽 `<svg>` viewBox) | 16×16 | 16×16 | 16×16 |
| glyph(내부 `data-s1-part="glyph"` viewBox) | 16×16 (= frame) | 16×16 | 16×16 |
| 실제 잉크(획 bbox) | 8×4 (16기준) → 렌더 10×5 | → 12×6 | → 10×5 |

`mask: … center / contain` 으로 비율 유지 확대되어 잉크 비율이 정본 인라인 SVG(16 viewBox 안 8×4)와 동일. source ↔ dist 아이콘 파일 **바이트 동일** ✅. `npm run ui:icons` = `icons=3 errors=0`(적대 테스트 포함) ✅.

## C. 동작·접근성 (실제 실행)

`ui-library/verification/empty-consumer.html` 에서 전수 실행 (※ `ui-library/src/verification/…` 를 직접 열면 상대경로가 `ui-library/src/dist/` 로 404 난다 — 빌드가 `ui-library/verification/` 로 내보내는 사본이 소비 지점이다. 도구 경로 문제이지 결함 아님).

| 항목 | 결과 |
|---|---|
| 트리거 클릭 열기/닫기 · `aria-expanded` 동기화 | ✅ Select·Filter Chip |
| 열 때 패널 활성 옵션으로 포커스 이동 | ✅ |
| **Esc — 포커스가 목록 안일 때도** 닫히고 트리거로 복귀 | ✅ 둘 다 (root 범위 리스너) |
| 바깥 pointerdown 으로 닫기 (포커스는 뺏지 않음) | ✅ |
| ↑ ↓ Home End | ✅ (↑↓ 는 양끝에서 순환 — 계약에 명시 없음, 표준 listbox 관행) |
| Enter / Space 선택 | ✅ |
| roving tabindex (tabIndex 0 이 정확히 1개) | ✅ |
| `aria-haspopup="listbox"` · 패널 `role="listbox"` · `aria-selected` 단일 | ✅ |
| `data-filled` / `data-complete` 전환 | ✅ |
| Filter Chip 접근 이름 `"정렬, 최신순"` → 선택 후 `"정렬, 과거순"` 재동기화 | ✅ |
| Disabled 트리거 클릭 무반응 | ✅ |
| **「전체 선택」 3동작** — ①전체 켜기 ②전체 끄기 ③개별로 다 켜면 자동 켜짐 | ✅ 3/3. 개별 토글은 형제 불변 ✅, 하나 끄면 select-all 자동 해제 ✅, native `input.checked` 동기 ✅ |
| `aria-checked="mixed"` | ✅ 0건 |
| 선택이 체크박스 패널을 닫지 않음 | ✅ (dropdown 모듈은 open/close 를 소유하지 않음) |
| 이벤트 detail 형태(`selectAll`/`affected`/`selectAllChecked`) | ✅ manifest 선언대로 |
| 다중 인스턴스 비간섭 | ✅ A 를 열어도 B 무영향, A 선택이 B 값·`data-filled` 에 무영향. 실제 pointerdown 으로 다른 트리거를 누르면 열려 있던 쪽이 닫힘 ✅ |
| init 중복 호출 안전 | ✅ 같은 api 반환(WeakMap) |
| destroy 후 리스너 해제 · 재 init 가능 | ✅ |
| **`on: disable → close`** (behavior 계약) | ❌ → ❌3 |

## D. 배포 동일성

| 항목 | 결과 |
|---|---|
| src → dist 재생성 드리프트 | ✅ `npm run ui:build` 후 `diff -r` 차이 0 — dist 손편집 없음 |
| `select/dropdown/filter-chip` 의 `.css`·`.js` src↔dist | ✅ 바이트 동일 |
| `dist/examples/*.html` ↔ `src/components/*/*.example.html` | ✅ 3종 모두 바이트 동일 (코드탭 출처 = source/example ✅) |
| **전체 묶음(`s1-ui.auto.js`) vs 개별 설치(`components/*.js`)** | ✅ 26개 노드 × 21속성(치수·색·테두리·radius·타이포·transform·mask·shadow·ARIA) 스냅샷 **해시 완전 일치** `d4d1c94b…6879f` |
| 두 방식의 동작 동일성 | ✅ 열기·포커스·Enter 선택·Esc·aria-label 동일 |
| `pages/ui-review.html` 의 의존성 | ✅ Pretendard + `ui-library/dist/{tokens.css, typography.css, s1-ui.css}` + `import "../ui-library/dist/s1-ui.js"` 만. dist 밖 컴포넌트 CSS·JS **0건** |
| `pages/components.html` 의 "approved 아님" 안내 | ✅ 계약대로 (`manifest.status !== "approved"` → 안내). 결함 아님 |
| `npm run ui:contract` / `ui:icons` / `ui:test` / `ui:state` | ✅ 전부 PASS |

---

## ❌ 결함 (정본·계약과 어긋남 — 파생을 고친다)

### ❌1 · select.css 의 hover 규칙이 Open·Filled 를 덮어쓴다 — **시각 결함**
`ui-library/src/components/select/select.css:56-61`

```
[data-s1-component="select"] [data-s1-part="trigger"]:hover:not(:disabled)   → 특이도 (0,4,0)
[data-s1-component="select"] [data-s1-part="trigger"][aria-expanded="true"]  → (0,3,0)
[data-s1-component="select"] [data-s1-part="trigger"][data-filled="true"]    → (0,3,0)
```
hover 가 둘 다 이긴다. 실제 마우스 hover 실측:

| 상태 | 실측 | 정본 |
|---|---|---|
| Open + hover | `background rgb(250,250,250)` = `bg/hover` #FAFAFA | Open = `color/form-control/bg/selected` **#FFFFFF** |
| Filled + hover | `color rgb(117,117,117)` = `text/placeholder` | Filled = `color/form-control/text/selected` **#202020** |

Filled 쪽이 특히 눈에 띈다 — 사용자가 고른 값이 마우스를 올리는 동안 회색 플레이스홀더처럼 보인다.
같은 자리에서 `filter-chip.css:75, 95` 는 `:hover:not(:disabled):not([aria-expanded="true"])` 로 정확히 막아 뒀다. **select 만 가드가 빠진 비대칭**이며, manifest `states.hover` 도 결함이 있는 선택자를 그대로 옮겨 적어 문서가 이를 잡아내지 못한다.

### ❌2 · Checkbox+All 줄이 정본보다 1px 높다
`ui-library/src/components/dropdown/dropdown.css:24-45, 78-82`

정본은 「전체 선택」 줄의 **총높이를 다른 줄과 같게** 유지한다 — 내용 행 `sz.h - 1` + 구분선 1px = `sz.h` (`build-components.ts:1626-1650`, 주석 "총높이는 다른 줄과 같게 유지(내용 = h-1)"). 웹은 `[data-s1-part="option"]` 이 `sz.h` 를 그대로 갖고 `[data-s1-part="divider"]` 1px 이 **형제로 더해진다**.

| 크기 | 정본 줄 높이 | 실측 (option + divider) | 정본 패널 높이 `4h+8` | 실측 checkbox 패널 (테두리 2 포함) | 실측 text 패널 |
|---|---|---|---|---|---|
| xxsm | 28 | **29** | 120 | **123** | 122 ✅ |
| xsm | 34 | **35** | 144 | **147** | 146 ✅ |
| md | 44 | **45** | 184 | **187** | 186 ✅ |

text 유형 패널은 정확히 맞는데 checkbox 유형만 1px 크다 — 정본이 두 유형의 높이를 일부러 맞춰 둔 설계가 웹에서 깨졌다.

### ❌3 · behavior 계약의 `on: disable → close` 가 구현돼 있지 않다
`registry/components/component-behavior.pc.json` (`"Select Box"` · `"Filter Chip"`, 둘 다 `status: "verified"`)

계약: `{ "on": "disable", "result": "close and block trigger clicks" }`
실측: 패널을 연 뒤 `trigger.disabled = true` → `aria-expanded` 가 `"true"` 로 남고 패널이 계속 보인다. Select·Filter Chip 둘 다 동일. 구현된 것은 "block trigger clicks" 뿐이다(`open()` 의 `if (trigger.disabled) return`).
`select.js` / `filter-chip.js` 어디에도 disabled 변화를 관찰하는 코드가 없다.
→ 코드가 계약을 채우거나 계약 기록이 실제와 맞아야 한다. **어느 쪽을 고칠지는 구현자·river 몫이며, 검증자는 판단하지 않는다.** 다만 계약이 `status: "verified"` 로 서 있는 지금 상태는 그 자체로 결함이다.

### ❌4 · select manifest 의 `notInCanon.focusAxis` 서술이 자기 CSS 와 모순
`ui-library/src/components/select/manifest.json` → `dist/components/select.manifest.json`

> "정본에 Open 과 별개인 Focus 축이 없다 … **웹에서도 별도 focus 시각을 만들지 않았다.**"

그러나 `select.css:82-85` 는 `:focus-visible` 에 `outline: var(--border-width-2) solid var(--color-form-control-border-selected); outline-offset: var(--spacing-2)` 를 그린다(실측 확인). 같은 manifest 의 `cssContract.nativeStates` 는 `":focus-visible"` 을 정직하게 선언하고 있어 한 파일 안에서 서로 어긋난다.
dropdown 은 같은 추가를 `notInCanon.optionFocus` 에 "웹에서만 추가했으며 새 토큰을 만들지 않았다"로 정확히 적어 뒀다 — select 만 서술이 틀렸다.

---

## 관찰 (❌ 아님 · 기록용)

1. **패널 폭 처리가 두 컴포넌트에서 다르다.** select 패널은 트리거 폭 100%, filter-chip 패널은 내용에 맞춰 줄어든다. 정본은 둘 다 140px 고정이지만, 140 은 트리거·옵션 행에도 똑같이 쓰인 **캔버스 자리표시값**이라 설계 치수로 보지 않았다(웹은 트리거도 유동으로 만들었다). 의도된 선택이면 그대로, 아니면 결정 필요.
2. **패널 크기 매핑이 마크업 선언에 의존한다.** SM→xxsm·MD→xsm 을 컴포넌트가 계산하지 않는다(manifest `htmlContract` 가 "자동 계산하지 않고 마크업에 그대로 선언"이라고 명시). 예시·가이드·검수 화면은 모두 맞게 선언돼 있으나, 소비자가 틀리게 써도 막는 장치는 없다.
3. **`assets/css/ui-library-guide.css:268-286`** 이 select·dropdown·filter-chip 의 hover 도색을 dist 밖에서 다시 선언한다(`data-force-state="hover"`). 값은 dist 와 같은 토큰이고, 정적 상태표에서 hover 를 보여주기 위한 장치로 button·chip·input 에 이미 쓰이는 기존 패턴이다. 다만 dist 가 바뀌어도 자동으로 따라오지 않는 이중 선언이다. `pages/ui-review.html` 은 깨끗하다(dist 만 사용).
4. **저장소 전체 `npm run gate:check` 는 현재 red** 이지만 원인은 **Gate 6c**(설치기 zip 날짜 `2026-08-31` ≠ 재계산 `2026-09-01`)로 이번 작업과 무관하다. Gate 16 은 `filter-chip 분류 미정(tbd)` 을 경고(차단 아님).
5. ↑↓ 가 양끝에서 순환한다. behavior 계약에 명시가 없어 결함으로 보지 않았다(표준 listbox 관행).

## 검증하지 못한 범위

- **Figma 캔버스 실물 대조**: 이번 검증의 기준은 코드 정본(`build-components.ts`)이며, 실제 Figma V3.0 캔버스 렌더와의 대조는 하지 않았다(상태 파일이 요구하지 않음).
- **실기기·스크린리더 실사용**: ARIA 속성·포커스 이동은 DOM 수준에서 전수 확인했으나 VoiceOver/NVDA 실제 읽기는 확인하지 못했다.
- **터치 전용 환경**: `@media (hover: hover)` 밖 동작(모바일 실기기)은 확인하지 못했다.
- **`prefers-reduced-motion`**: 세 컴포넌트 모두 모션이 없어 대상 없음(manifest `reducedMotion: not-applicable` 과 일치, 실제 transition 선언 0건 확인).

## 권장

| 항목 | 권장값 |
|---|---|
| `workflowStatus` | `4-verification` 유지 (통과 처리하지 말 것) |
| `uiLibraryStatus` | `candidate` 유지 — `approved` 승격 불가 |
| `nextAction` | ❌1·❌2·❌4 를 `ui-library-builder` 가 수정 → dist 재생성 → 재검증. ❌3 은 코드/계약 중 어느 쪽을 맞출지 river 결정 후 반영 |

> 검증자는 파일을 고치지 않았고 `workflow-state.json` 을 수정하지 않았다.

---

# 재검증(2회차) — 2026-09-01

- 범위: 1회차 ❌ 4건의 해소 여부 + 그 수정이 만든 회귀. **전수 재검증이 아니다.**
- 방법: 자체 제작 계측 fixture 재생성(전 조합) · **실제 마우스 hover 재실측** · MutationObserver 전용 단일모듈 테스트 페이지 · dist 재생성 대조 · 라이트/다크 렌더.
- 스크린샷: `screens/independent-verify-r2-light.png` · `screens/independent-verify-r2-dark.png`
- 빌더 보고는 근거로 쓰지 않고 전부 직접 재실측했다.

## 1회차 지적 4건의 해소 여부

### ✅ ①  select hover 가드 — 해소
`ui-library/src/components/select/select.css:55` 가 `:hover:not(:disabled):not([aria-expanded="true"]):not([data-filled="true"])` 로 바뀐 것을 확인. **실제 마우스 hover 재실측**(md·PC, viewport 1280×900):

| 경우 | 1회차 실측 | 2회차 실측 | 정본 | 판정 |
|---|---|---|---|---|
| **Filled + hover** | `color rgb(117,117,117)` (placeholder) | **`color rgb(32,32,32)`** | `text/selected` #202020 | ✅ 해소 |
| **Open + hover** | `background rgb(250,250,250)` | **`background rgb(255,255,255)`** · border `rgb(29,108,235)` | `bg/selected` #FFFFFF · `border/selected` | ✅ 해소 |
| **Default + hover** (가드가 hover 를 죽이지 않았나) | — | **`background rgb(250,250,250)`**, `matches(':hover')===true` | `bg/hover` #FAFAFA | ✅ hover 정상 동작 |
| **Disabled + hover** | 변화 없음 | `bg rgb(245,245,245)` · `color rgb(196,196,196)` | disabled 유지 | ✅ 영향 없음 |
| **Filter Chip line Default + hover** (인접 회귀) | `#FAFAFA` / border `#C4C4C4` | 동일 | `bg/hover` + `border/default` | ✅ 회귀 없음 |

가드가 hover 를 통째로 죽였을 가능성을 별도 셀로 확인했고, default 상태 hover 는 그대로 살아 있다.

### ✅ ②  전체선택 줄 높이 — 해소
`ui-library/src/components/dropdown/dropdown.css:32-42` 에 `height: calc(var(--sizing-28|34|44) - var(--border-width-1))` 가 `[data-select-all="true"]` 한정으로 추가된 것을 확인. 재실측:

| 크기 | 전체선택 내용 행 | 구분선 | **합계** | 일반 줄 | 판정 |
|---|---|---|---|---|---|
| xxsm | 27 | 1 | **28** | 28 | ✅ (1회차 29) |
| xsm | 33 | 1 | **34** | 34 | ✅ (1회차 35) |
| md | 43 | 1 | **44** | 44 | ✅ (1회차 45) |

**구분선 유지 확인** — `divider` 높이 1px, `background rgb(217,217,217)`(`dropdown/list/border`), `display` 정상. 라이트·다크 렌더 스크린샷에서도 「전체 선택」 아래 선이 그대로 보인다.

**패널 총높이 일치** — checkbox 유형 **122 / 146 / 186**, text 유형 **122 / 146 / 186** → 두 유형이 같아졌다(1회차엔 checkbox 만 123/147/187 로 1px 컸다). 정본 `4·h+8` + 테두리 2px 과 일치.
실사용 패널에서도 재확인: `sa=43 + divider=1 = 44 == 일반 줄 44` ✅

### ✅ ③  `on: disable → close` — 해소, observer 위생도 통과
`select.js:37-40` · `filter-chip.js:45-48` 이 `observe(trigger, { attributes: true, attributeFilter: ["disabled"] })`, `select.js:100` · `filter-chip.js:110` 이 `disabledObserver.disconnect()` 를 확인.

모듈을 **정확히 한 번만** import 하는 전용 페이지에서 실행(자동 init 과 겹치지 않게 격리). **select · filter-chip 각 10항목, 20/20 PASS:**

| 확인 | select | filter-chip | 근거 |
|---|---|---|---|
| 열린 채 `disabled=true` → 자동 닫힘 | ✅ | ✅ | `aria-expanded="false"` · `panel.hidden===true` |
| close 이벤트 정확히 1회 | ✅ | ✅ | `closes=1` |
| 닫힌 채 disable/enable → 헛 이벤트 없음 | ✅ | ✅ | `closes=0` |
| 재활성해도 저절로 안 열림 | ✅ | ✅ | `aria-expanded="false"` |
| 포커스가 disabled 트리거로 안 튐 | ✅ | ✅ | `close({returnFocus:false})` — activeElement ≠ trigger |
| **init 3회 호출 = 같은 api** (2번째 observer 생성 안 됨) | ✅ | ✅ | `a1===a2===a3` (WeakMap 가드가 함수 본문 재실행을 막음) |
| **클릭 1회 = open 이벤트 1회** (리스너 중복 없음) | ✅ | ✅ | `opens=1` |
| **open→disable 3사이클 = close 정확히 3회** (observer 누적 없음) | ✅ | ✅ | `closes=3` |
| **destroy 후 disabled 토글 무반응** | ✅ | ✅ | 강제로 열어 둔 뒤 disable → `aria-expanded` 그대로 `"true"`, `closes=0` |
| destroy → 재 init 후 정상 복구 | ✅ | ✅ | `opens=1`, `closes=1` |

> 기록 — 첫 시도에서 `?v=` 캐시버스터를 붙여 모듈을 import 했더니 **같은 파일의 두 번째 모듈 인스턴스**(별도 WeakMap)가 생겨 리스너·observer 가 이중 등록됐고 일부 항목이 거짓 FAIL 로 나왔다. 검사 도구 문제였고, 단일 모듈 페이지로 다시 돌려 전부 PASS 임을 확인했다. 판정 근거는 후자다.

### ✅ ④  select manifest `notInCanon.focusAxis` — 해소
현재 서술: *"…키보드 접근성 때문에 웹에서만 트리거에 focus-visible 테두리를 추가했으며 새 토큰을 만들지 않았다(선택 테두리 토큰 재사용, cssContract.nativeStates 에 :focus-visible 로 정직하게 선언)"*
실제 CSS `select.css:82-85` 는 `:focus-visible { outline: var(--border-width-2) solid var(--color-form-control-border-selected); outline-offset: var(--spacing-2) }` — **서술과 일치** ✅. 새 토큰 0건도 사실 ✅.
같은 파일의 `notInCanon.openFilledCross` 도 재확인했는데 **여전히 정확하다** — Open 과 Filled 는 지금도 동일 특이도(0,3,0)라 source order 로 Open 이 이긴다.

## 회귀 검사

| 항목 | 결과 |
|---|---|
| **조합 113개 전수 존재** | ✅ select **20** · dropdown 패널 **6** · 옵션 행 **27** · filter chip **60** — 누락·초과 0 |
| **기하·토큰 유지** | ✅ select 16셀(4크기 × Default/Open/Filled/Disabled) 재실측 — 28/34/44/48, 글자 12/14, 아이콘 20/24, pl16·pr8·radius4·bw1, 상태색 전부 1회차와 동일. filter chip 24셀(3크기 × 2variant × 4상태) — 28/34/30, 12·6 / 16·8 / 12·6, gap4, radius full, 아이콘 20, 상태색 동일 |
| **chevron 방향 유지** | ✅ 닫힘 `matrix(1,0,0,1,0,0)`(0°=∨) · 열림 `matrix(-1,0,0,-1,0,0)`(180°=∧) — select 4크기·filter chip 12조합 전부. 렌더 육안 확인 |
| **라이트 렌더** | ✅ `screens/independent-verify-r2-light.png` — 1회차와 시각적으로 동일. 구분선 유지, Complete=Default, Line Selected 테두리만 파랑, Solid Selected 흰 라벨 |
| **다크 렌더** | ✅ `screens/independent-verify-r2-dark.png` — 전 표면 전환, 하드코딩 색 0건, 방향·기하 동일 |
| **전체묶음 ↔ 개별설치 동일성** | ✅ 26노드 × 21속성 스냅샷 해시 양쪽 `d4d1c94b…6879f` 일치. **게다가 1회차 해시와도 동일** → 이번 수정이 기본(닫힘) 상태의 렌더값을 하나도 건드리지 않았음이 증명됨 |
| **개별설치 동작** | ✅ 열기·포커스 이동·Esc 복귀·disable 자동닫힘 모두 동작 |
| **동작 회귀 15항목** | ✅ 전부 PASS — Esc(목록 포커스)·↑↓·Home/End·Enter 선택·`data-filled`·바깥 클릭·fc 접근 이름·「전체 선택」 3동작·`aria-checked="mixed"` 0건 |
| **src → dist** | ✅ `npm run ui:build` 후 `diff -r` 차이 0 · 6개 파일 src↔dist 바이트 동일 |
| **검사기** | ✅ `ui:contract`(errors=0) · `ui:icons`(icons=3 errors=0) · `ui:test` · `ui:state` 전부 PASS |

**회귀 0건.** 세 수정 모두 자기 자리에만 영향을 줬다.

## ❌5 (신규) · select manifest `states.hover` 가 낡았다 — 문서 1줄

`ui-library/src/components/select/manifest.json` → `dist/components/select.manifest.json`

| | 값 |
|---|---|
| manifest `states.hover` | `@media (hover: hover) [data-s1-part="trigger"]:hover:not(:disabled)` |
| 실제 CSS (`select.css:55`) | `…:hover:not(:disabled)`**`:not([aria-expanded="true"]):not([data-filled="true"])`** |

①을 고치면서 CSS 에는 가드 2개가 붙었는데 이 필드가 따라오지 않았다. 이 필드가 **선택자를 그대로 미러링하는 것이 관례**임은 같은 저장소가 증명한다:

- `filter-chip` → `…:hover:not(:disabled):not([aria-expanded="true"])` (가드 포함)
- `chip` → `…:hover:not(:disabled):not([aria-pressed="true"])`
- `checkbox` → `…control:hover:not(:disabled):not(:checked)`

세 컴포넌트 모두 가드까지 적어 뒀고 **select 만 어긋난다.** 1회차 ❌4 와 정확히 같은 종류(파생 문서가 자기 CSS 를 틀리게 기술)이므로 같은 잣대로 처리한다. `ui:contract` 는 이 필드의 내용을 대조하지 않아 검사기로는 잡히지 않는다.

시각·동작에는 영향이 없다. **문자열 1줄 수정이면 끝난다.**

## 2회차 요약

| | 결과 |
|---|---|
| 1회차 ❌ 4건 | **4/4 실제 해소 확인** (실측 근거 포함) |
| 회귀 | **0건** |
| 신규 ❌ | **1건** — ❌5, manifest 문서 1줄 (시각·동작 영향 없음) |
| BLOCKED / ❓(c) | 0 |

## 검증하지 못한 범위 (1회차와 동일)

- Figma 캔버스 실물 대조(기준은 코드 정본) · 스크린리더 실사용 · 터치 전용 실기기 · `prefers-reduced-motion`(대상 없음).
- 2회차는 지정된 4건 + 회귀만 봤다. 1회차에서 PASS 한 항목 중 이번에 재실행하지 않은 것은 위 회귀표에 적은 범위까지다.

## 권장

| 항목 | 권장값 |
|---|---|
| `workflowStatus` | `4-verification` 유지 |
| `uiLibraryStatus` | `candidate` 유지 |
| `nextAction` | ❌5(manifest `states.hover` 문자열) 수정 → `ui:build` → 이 한 줄만 재확인하면 PASS 전환 가능. 코드·CSS·동작은 더 손댈 것이 없다 |

> 검증자는 파일을 고치지 않았고 `workflow-state.json` 을 수정하지 않았다.

**최종 판정: FAIL** — 지적한 4건은 전부 해소되고 회귀도 0건이지만, ①의 수정을 따라오지 못한 manifest 서술 1줄(❌5)이 남아 있어 통과시키지 않는다.

---

# 최종 확인(3회차) — 2026-09-01

- 범위: 2회차 ❌5(select manifest `states.hover` 문자열) 해소 여부 + 그 수정이 문자열에만 그쳤는지. **전수 재검증 안 함.**
- 수정 주체: ⭐ 총괄 직접(기계적 문서 수정). 보고 내용은 근거로 쓰지 않고 전부 직접 재확인했다.

## ① `states.hover` ↔ 실제 CSS 정확 일치 — ✅

스크립트로 `select.css` 의 `@media (hover: hover)` 블록에서 실제 선택자를 뽑아 문자 단위 대조했다(이 필드는 root scope `[data-s1-component="select"]` 를 생략하는 것이 저장소 관례).

```
CSS 실제(정규화) : @media (hover: hover) [data-s1-part="trigger"]:hover:not(:disabled):not([aria-expanded="true"]):not([data-filled="true"])
src  manifest.json                : MATCH
dist select.manifest.json         : MATCH
```

관례 대조군도 다시 확인 — `filter-chip` / `chip` / `checkbox` 모두 가드까지 적혀 있고, 이제 `select` 도 같은 형식을 따른다.
브라우저에 실제로 적용된 규칙도 CSSOM 에서 직접 읽어 대조: `[data-s1-component="select"] [data-s1-part="trigger"]:hover:not(:disabled):not([aria-expanded="true"]):not([data-filled="true"])` — 2회차에서 본 것과 동일하다.

## ② manifest 내부 모순 신규 발생 없음 — ✅

| 필드 | 값 | CSS 대조 |
|---|---|---|
| `states.open` | `[data-s1-part="trigger"][aria-expanded="true"]` | ✅ 존재 |
| `states.filled` | `[data-s1-part="trigger"][data-filled="true"]` | ✅ 존재 |
| `states.disabled` | `[data-s1-part="trigger"]:disabled` | ✅ 존재 |
| `cssContract.nativeStates` | `:hover` · `:disabled` · `:focus-visible` | ✅ 3개 모두 CSS 에 존재 |
| `cssContract.ariaStates` | `[aria-expanded="true"]` | ✅ 존재 |
| `cssContract.documentedDataStates` | `[data-filled="true"]` | ✅ 존재 |
| `notInCanon.focusAxis` | focus-visible 테두리를 웹에서만 추가·새 토큰 0 | ✅ 2회차 확인 그대로 유효 |
| `notInCanon.openFilledCross` | "…Filled 시각은 닫힌 뒤에만 적용한다(**source order 로 처리**)" | ✅ **여전히 정확** |

`openFilledCross` 를 특히 다시 따졌다 — hover 에 가드가 붙어도 `[aria-expanded="true"]` 와 `[data-filled="true"]` 는 지금도 같은 특이도 `(0,3,0)` 이라 둘 사이 승부는 변함없이 source order 가 정한다(Open 이 뒤에 있어 이긴다). 서술이 낡지 않았다. **새로 생긴 모순 0건.**

## ③ 문자열 수정뿐 — 시각·동작 무변경 — ✅ (하지만 조사가 필요했다)

| 증거 | 결과 |
|---|---|
| src↔dist 바이트 동일 (`select`·`dropdown`·`filter-chip` × css·js 6개) | ✅ 전부 동일 |
| `npm run ui:build` 재실행 후 `diff -r` | ✅ 드리프트 0 |
| CSSOM 의 실제 hover 규칙 | ✅ 2회차와 동일 |
| **전체묶음 렌더 스냅샷 해시**(26노드×21속성) | ✅ `d4d1c94b…6879f` — **1·2회차와 동일** |
| **개별설치 렌더 스냅샷 해시** | ✅ `d4d1c94b…6879f` — 동일 |
| 동작 스팟체크: 열린 채 `disabled` → 자동 닫힘 | ✅ `aria-expanded="false"` |
| 검사 5종 + `component-behavior-check` | ✅ 아래 ④ |

> **해시가 한 번 달라져서 원인을 밝혔다.** 첫 측정에서 `7c6cf7a0…` 이 나왔다. 조사해 보니 새로 연 브라우저 창이 **viewport 를 0×0 으로 보고**(패널이 가려진 상태) 폭 측정이 전부 무너진 것이었다 — `dropdown` 폭이 1264 대신 **2** 로 잡혔다. 1·2회차와 같은 **1280×900** 으로 되돌리자 `d4d1c94b…6879f` 가 그대로 재현됐다(`innerWidth=1280`, `dropdown` 폭 1264 확인). **측정 환경 문제이지 코드 변화가 아니다.**

이후 회차를 위해 dist 해시를 기준선으로 남긴다:

```
2691a0e3…  dist/components/select.css        c88c1634…  dist/components/select.js
5eaf2da0…  dist/components/dropdown.css      5f913263…  dist/components/dropdown.js
3010443a…  dist/components/filter-chip.css   81fb2b0e…  dist/components/filter-chip.js
630e06dd…  dist/s1-ui.css                    c58c97c2…  dist/s1-ui.js
```

## ④ 검사 — ✅ 전부 PASS

| 검사 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS · errors=0 |
| `npm run ui:icons` | ✅ icons=3 errors=0 (적대 테스트 포함) |
| `npm run ui:build` | ✅ 재생성 드리프트 0 |
| `npm run ui:test` | ✅ PASS |
| `npm run ui:state` | ✅ PASS |
| `node scripts/component-behavior-check.js` | ✅ PC 20개 계약 전부 근거 연결됨 |

## 3회차 요약

| | 결과 |
|---|---|
| 2회차 ❌5 | **해소 확인** (src·dist 양쪽 문자 단위 일치) |
| manifest 내부 신규 모순 | **0건** |
| 시각·동작 변화 | **0건** (렌더 해시 1·2회차와 동일, 동작 스팟체크 정상) |
| 검사 | **6/6 PASS** |
| 미해결 ❌ · BLOCKED · ❓(c) | **0** |

## 누적 결과 (1~3회차)

| 회차 | 지적 | 결과 |
|---|---|---|
| 1회차 | ❌1 select hover 겹침 · ❌2 전체선택 줄 1px · ❌3 `on: disable → close` 미구현 · ❌4 manifest focusAxis 서술 | 4건 FAIL |
| 2회차 | 4건 전부 해소 확인 · 회귀 0 · 신규 ❌5(manifest `states.hover` 낡음) | 1건 FAIL |
| 3회차 | ❌5 해소 확인 · 신규 0 · 시각·동작 무변경 | **미해결 0** |

## 검증하지 못한 범위

3회차는 지정된 4개 항목만 봤다. 1·2회차에서 PASS 한 항목(조합 113개 전수·기하/토큰 전수·라이트/다크 렌더·키보드·「전체 선택」 3동작·observer 위생)은 재실행하지 않았고, 이번 수정이 그 범위를 건드리지 않았음은 **렌더 해시 동일 + dist CSS·JS 바이트 동일 + 드리프트 0** 으로 갈음했다.
1회차부터 이어지는 미검증 범위는 그대로다 — Figma 캔버스 실물 대조 · 스크린리더 실사용 · 터치 전용 실기기.

## 권장

| 항목 | 권장값 |
|---|---|
| `workflowStatus` | `4-verification` **완료** 처리 가능 |
| `uiLibraryStatus` | `candidate` → **river 검수(검수본 07) 로 진행**. `approved` 승격은 river UX 승인 뒤 |
| `nextAction` | 독립 검증 통과. river 검수 화면(`pages/ui-review.html`)으로 넘긴다 |

> 검증자는 파일을 고치지 않았고 `workflow-state.json` 을 수정하지 않았다.

**최종 판정: PASS** — 1~3회차에서 지적한 ❌ 5건이 모두 해소됐고, 미해결 ❌·BLOCKED·❓ 0건이다.
