# 3-build 사양서 — 오케스트레이터가 빌더에게 주는 지시

작업 `bottom-sheet` · 2026-09-15 · 근거 = `1-inventory.md` · `2-canon-readiness.md`
정본 판독은 끝났다. **이 문서의 수치는 전부 정본에서 읽은 값이다 — 다시 캐지 말고 그대로 쓴다.**

---

## 만들 것

컴포넌트 2개: `bottom-sheet` · `bottom-sheet-option`
그리고 **date-picker·time-picker 를 그 부품의 소비자로 이관**한다.

---

## A. `bottom-sheet`

### A-1. 파일

```
ui-library/src/components/bottom-sheet/bottom-sheet.css
ui-library/src/components/bottom-sheet/bottom-sheet.js
ui-library/src/components/bottom-sheet/bottom-sheet.example.html
ui-library/src/components/bottom-sheet/manifest.json
```

### A-2. 마크업 계약

```html
<div data-s1-component="bottom-sheet" data-s1-part="sheet" data-break="mobile" data-footer="single" hidden>
  <div data-s1-part="sheet-backdrop"></div>
  <div data-s1-part="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="{id}" tabindex="-1">
    <div data-s1-part="sheet-content">
      <div data-s1-part="sheet-header">
        <span data-s1-part="sheet-title" id="{id}">제목</span>
        <button type="button" data-s1-part="sheet-close" aria-label="닫기"></button>
      </div>
      <div data-s1-part="sheet-body"><!-- 화면이 채운다 --></div>
    </div>
    <div data-s1-part="sheet-footer">
      <button type="button" data-s1-component="button" data-variant="primary" data-size="lg"><span data-s1-part="label">적용</span></button>
    </div>
  </div>
</div>
```

- 루트에 `data-s1-part="sheet"` 를 **함께** 단다 — date-picker·time-picker 가 이미 그 이름으로 부르고 있어서 기존 JS 선택자가 그대로 산다.
- `data-footer` = `none|single|dual` (필수). `none` 이면 `sheet-footer` 를 **넣지 않는다**.
- `sheet-content` 는 **선택 부품**이다. date-picker·time-picker 는 이 층을 쓰지 않는다(정본이 한 층).
- `sheet-body` 는 정본 SLOT "Content" 의 웹 대응 — 컴포넌트는 빈 그릇만 소유한다.

### A-3. CSS — 정본 수치 그대로

`[data-s1-component="bottom-sheet"]` 밖으로 새지 않게 전부 이 범위 안에 쓴다.

| 선택자 | 속성 |
|---|---|
| 루트 | `--s1-bottom-sheet-gap: var(--spacing-48)` · `--s1-bottom-sheet-shadow: var(--shadow-raised-up)` · `position:fixed` · `inset:0` · `display:flex` · `align-items:flex-end` · `justify-content:center` · `z-index:1000` |
| 루트`[hidden]` | `display:none` |
| `sheet-backdrop` | `position:absolute` · `inset:0` · `background: var(--color-overlay)` |
| `sheet-panel` | `background: var(--color-surface-raised)` · `border-top-left-radius: var(--radius-8)` · `border-top-right-radius: var(--radius-8)` · `box-shadow: var(--s1-bottom-sheet-shadow)` · `box-sizing:border-box` · `display:flex` · `flex-direction:column` · `gap: var(--s1-bottom-sheet-gap)` · `max-height:92vh` · `overflow-y:auto` · `padding-block: var(--spacing-20)` · `position:relative` · `max-width:360px` · `width:100%` |
| 루트`[data-footer="none"]` `sheet-panel` | `padding-bottom: var(--spacing-40)` |
| `sheet-content` | `display:flex` · `flex-direction:column` · `gap: var(--spacing-24)` |
| `sheet-header` | `align-items:center` · `display:flex` · `justify-content:space-between` · `padding-inline: var(--spacing-20)` |
| `sheet-title` | `color: var(--color-text-title-primary)` · `font-family:"Pretendard", sans-serif` · `font-size: var(--font-size-20)` · `font-weight: var(--font-weight-bold)` · `line-height: var(--line-height-130)` · `letter-spacing: var(--letter-spacing-normal)` |
| `sheet-close` | `appearance:none` · `background-color: var(--color-icon-gray-dark)` · `border:none` · `cursor:pointer` · `width:24px` · `height:24px` · `padding:0` · `mask: url("../assets/icons/close.svg") center / contain no-repeat` |
| `sheet-footer` | `display:flex` · `gap: var(--spacing-8)` · `padding-inline: var(--spacing-20)` |
| `sheet-footer > [data-s1-component="button"]` | `flex:1 1 0` · `width:100%` |

**정본 대응 근거** — root itemSpacing 48 · content itemSpacing 24 · padding 위 20 / 아래 None=40·Single·Dual=20 / 좌우 0(좌우 20 은 header·footer 가 각자) · 위 모서리만 8 · 배경 `color/surface/raised` · 그림자 `shadow/raised-up` · footer itemSpacing 8 · 버튼 FILL.

**`max-width:360` + `width:100%`** — 정본 360 은 Figma 모바일 프레임의 화면 폭이다. 이미 배포된 date-picker 시트가 같은 처리를 하고 있으니 그대로 따른다(주석으로 근거를 남긴다).

**사용자 지정 속성 2개는 공개 계약이다.** manifest `cssContract.customization` 에 적는다:
- `--s1-bottom-sheet-gap` (기본 `--spacing-48`)
- `--s1-bottom-sheet-shadow` (기본 `--shadow-raised-up`)
소비자가 자기 정본 값을 준다. 코어 내부 선택자를 덮어쓰는 것이 아니다.

`!important` 금지 · raw HEX 금지 · 태그 선택자 금지.

### A-4. JavaScript

`ui-library/src/components/modal/modal.js` 를 **그대로 본뜬다**(구조·초점 가둠·스크롤 잠금 카운터·이미 열린 마크업 배선까지). 바꾸는 것만 적는다:

1. `componentId = "bottom-sheet"`, 패널 선택자 `[data-s1-part="sheet-panel"]`, 닫기 `[data-s1-part="sheet-close"]`
2. 이벤트 이름 `s1:bottom-sheet:open` / `s1:bottom-sheet:close`
3. **딤 클릭으로 닫는다** — `[data-s1-part="sheet-backdrop"]` 클릭 시 `close({ reason: "backdrop" })`. (modal 에는 없는 동작이다. 이미 배포된 date-picker 시트의 동작이라 빼면 퇴행이다.)
4. `close` detail 의 `reason`: `"escape" | "close-button" | "backdrop"`
5. 공개 API: `open(detail)` · `close(detail)` · `isOpen` · `init(root)` · `destroy(root)` — modal 과 같다.

스크롤 잠금은 modal 과 같은 방식(열린 수 카운트)으로 자체 구현한다. modal.js 를 import 하지 않는다(개별 설치에서 끊긴다).

### A-5. manifest.json

`ui-library/src/components/modal/manifest.json` 을 틀로 쓴다.

- `id`: `bottom-sheet` · `version`: `0.1.0` · `status`: `draft`
- `canonicalSources`: `build-components.ts`, `vars-data.ts`, `textstyles-data.ts`, `registry/components/bottom-sheet.json` (지문 계산법 = `references/wiring-and-traps.md` §1-1)
- `rootSelector`: `[data-s1-component="bottom-sheet"]`
- `variants`: `["none","single","dual"]` · `sizes`: `[]` · `breaks`: `{ "pc": [], "mobile": [] }`
- `states`: `{ "closed": "root[hidden] (기본값)", "open": "root:not([hidden]) — 런타임 open() 이 전환한다" }`
- `canonicalStateMap`: `{ "Default": "open" }`
- `notInCanon` 에 적을 것:
  - `sizeAxis` — 정본에 크기 축이 없다. 폭은 화면 폭(정본 360 = 모바일 프레임 폭), 높이는 내용만큼.
  - `breakAxis` — 정본에 Break 축이 없다. 시트 자체가 모바일 전용이다.
  - `closedState` — modal 과 같은 이유(피그마는 닫힌 시트를 그릴 수 없다). river 결정 2026-09-08 ④A 와 같은 처리.
  - `backdropClickToClose` — 정본에 없다. 이미 배포된 date-picker 시트의 동작을 그대로 옮긴 것이며, 빼면 그 화면이 퇴행한다. modal 의 "딤 클릭 닫기 없음"(river 2026-09-02 범위 A)은 modal 에 대한 결정이라 시트에 자동 적용되지 않는다.
  - `motion` — 정본이 여닫기 모션을 정의하지 않는다. 올라오는 애니메이션을 만들지 않는다.
  - `overflow` — 정본 clipsContent=true 지만 웹은 `overflow-y:auto` 로 둔다. 내용이 화면보다 길 때 잘려서 못 읽는 사고를 막기 위해서이며, 이미 배포된 시트 두 곳과 같은 처리다.
  - `closeHover` — 모바일 전용이라 hover 가 없다(modal 의 PC close hover 는 여기 해당 없음).
- `parts`: `sheet-backdrop` · `sheet-panel` · `sheet-content` · `sheet-header` · `sheet-title` · `sheet-close` · `sheet-body` · `sheet-footer`
- `htmlContract`: `requiredAttributes` = `["data-break","data-footer"]`, `requiredParts` = backdrop·panel·header·title·close·body, `optionalParts` = `["sheet-content","sheet-footer"]`. `placement`: "body 직계 자식". `relations` 에 modal 과 같은 항목 + "루트에 `data-s1-part=\"sheet\"` 를 함께 달 수 있다 — date-picker·time-picker 가 그 이름으로 부른다" + "한 페이지에 시트를 여럿 두면 title id 는 자리마다 새로 만든다".
- `dependencies.css`: `tokens.css` · `typography.css` · `components/button.css` · `components/bottom-sheet-option.css`
- `dependencies.coreComponents`: `["button","bottom-sheet-option"]`
- `icons`: `close` 1개 — modal 항목을 그대로 복사한다(같은 자산, 재등록 아님)
- `a11y`: modal 과 같은 항목 + `backgroundInert` required. `errorRelation`·`reducedMotion` 은 `not-applicable` + 사유
- `jsRequired`: `true` · `javascript.runtime`: `components/bottom-sheet.js` · `events`·`methods`·`lifecycle`·`controlMode: "uncontrolled"`
- `cssContract.customization` 에 A-3 의 사용자 지정 속성 2개를 적는다

### A-6. 예시 마크업

`bottom-sheet.example.html` — **정본 기본 채움 그대로**: `data-footer="single"`, 제목 "항목 선택", 본문에 `bottom-sheet-option` Type=Text 4줄(2번째가 Selected), 푸터 primary LG "적용".
검수·예시라서 `hidden` 없이 열린 상태로 둔다(modal 예시와 같은 방식).

---

## B. `bottom-sheet-option`

### B-1. 파일

```
ui-library/src/components/bottom-sheet-option/bottom-sheet-option.css
ui-library/src/components/bottom-sheet-option/bottom-sheet-option.js      ← 런타임 없음(3줄 스텁)
ui-library/src/components/bottom-sheet-option/bottom-sheet-option.example.html
ui-library/src/components/bottom-sheet-option/manifest.json
```

`bottom-sheet-option.js` 는 런타임이 없어도 **파일은 반드시 있어야 한다**(빌드가 무조건 읽는다) — `gnb-sub-menu-item` 처럼 `jsRequired:false` + `runtime:null` 스텁으로 둔다.

### B-2. 마크업 계약

```html
<!-- Text -->
<div data-s1-component="bottom-sheet-option" data-type="text" data-state="default">
  <span data-s1-part="label">항목</span>
</div>
<div data-s1-component="bottom-sheet-option" data-type="text" data-state="selected">
  <span data-s1-part="label">항목</span><span data-s1-part="check" aria-hidden="true"></span>
</div>
<div data-s1-component="bottom-sheet-option" data-type="text" data-state="disabled">
  <span data-s1-part="label">항목</span>
</div>

<!-- Checkbox -->
<div data-s1-component="bottom-sheet-option" data-type="checkbox" data-state="default">
  <div data-s1-component="checkbox"><input type="checkbox" data-s1-part="control"></div>
  <span data-s1-part="label">항목</span>
</div>

<!-- Radio -->
<div data-s1-component="bottom-sheet-option" data-type="radio" data-state="selected">
  <div data-s1-component="radio"><input type="radio" data-s1-part="control" checked></div>
  <span data-s1-part="label">항목</span>
</div>

<!-- List -->
<div data-s1-component="bottom-sheet-option" data-type="list" data-state="default">
  <div data-s1-part="list-left">
    <div data-s1-part="avatar" aria-hidden="true"></div>
    <div data-s1-part="list-text">
      <span data-s1-part="list-title">제목</span>
      <span data-s1-part="list-sub">서브 텍스트</span>
    </div>
  </div>
  <span data-s1-part="chevron" aria-hidden="true"></span>
</div>
<!-- List disabled 는 chevron 대신 -->
<span data-s1-part="lock" aria-hidden="true"></span>
```

Checkbox·Radio 코어 내부 마크업은 **그 코어의 예시(`checkbox.example.html`·`radio.example.html`)를 그대로 따른다** — 이 문서의 위 예시는 자리만 보인 것이다. 실제 마크업은 코어 예시에서 확인해 복사한다.

**존재하지 않는 칸 3개는 만들지 않는다**: `checkbox:disabled` · `radio:disabled` · `list:selected`.

### B-3. CSS — 정본 수치 그대로

| 선택자 | 속성 |
|---|---|
| 루트 | `background: var(--color-surface-raised)` · `box-sizing:border-box` · `display:flex` · `align-items:center` · `width:100%` |
| 루트 `[data-type="text"], [data-type="checkbox"], [data-type="radio"]` | `height:48px` · `justify-content:flex-start` · `gap: var(--spacing-8)` · `padding-block: var(--spacing-8)` · `padding-inline: var(--spacing-20)` |
| 루트 `[data-type="text"][data-state="selected"]` | `justify-content: space-between` |
| 루트 `[data-type="list"]` | `justify-content: space-between` · `padding-block: var(--spacing-12)` · `padding-inline: var(--spacing-20)` |
| `label` | `font-family:"Pretendard",sans-serif` · `font-size: var(--font-size-16)` · `font-weight: var(--font-weight-medium)` · `line-height: var(--line-height-130)` · `letter-spacing: var(--letter-spacing-tight)` · `color: var(--color-text-body-primary)` |
| `[data-type="text"][data-state="selected"] label` | `color: var(--color-text-state-accent)` |
| `[data-type="text"][data-state="disabled"] label` | `color: var(--color-text-state-disabled)` |
| `check` | 24×24 · `background-color: var(--color-icon-blue)` · `mask: url("../assets/icons/check.svg") center / contain no-repeat` · `flex:none` |
| `list-left` | `display:flex` · `align-items:center` · `gap: var(--spacing-12)` · `min-width:0` |
| `avatar` | `width:40px` · `height:40px` · `border-radius: var(--radius-full)` · `background-color: var(--color-icon-gray-light)` · `flex:none` · 안의 account 아이콘은 `::after` 로 24×24 · `background-color: var(--color-icon-white)` · `mask: url("../assets/icons/account.svg") center / contain no-repeat` · flex 중앙정렬 |
| `list-text` | `display:flex` · `flex-direction:column` · `gap: var(--spacing-2)` · `min-width:0` |
| `list-title` | body/16M · `color: var(--color-text-body-primary)` |
| `list-sub` | 14 · `font-weight: var(--font-weight-regular)` · `line-height: var(--line-height-130)` · `letter-spacing: var(--letter-spacing-tight)` · `color: var(--color-text-body-secondary)` |
| `chevron` | 24×24 · `background-color: var(--color-icon-gray-dark)` · `mask: url("../assets/icons/chevron.svg") center / contain no-repeat` · **`transform: rotate(-90deg)`** · `flex:none` |
| `lock` | 24×24 · `background-color: var(--color-icon-gray)` · `mask: url("../assets/icons/lock.svg") center / contain no-repeat` · `flex:none` |

**chevron 방향 ⚠️** — 등록된 `chevron.svg` 는 **오른쪽(▶)** 을 가리키는 자산이다(`M10.375 7.75 L14.625 12 L10.375 16.25`). 정본 List 는 오른쪽 화살표를 쓴다. **자산이 이미 오른쪽이면 회전하지 않는다.** 실제 자산을 열어보고 방향을 확인한 뒤 결정하고, 판단 근거를 CSS 주석에 남긴다. (함정 T8: Figma 각도를 그대로 옮기면 반대가 된다.)

**check 아이콘 ⚠️** — 등록된 `check.svg` 는 16 프레임이고 glyph 가 frame 을 가득 채운다(manifest geometry `0,0,16,16`). 24 로 그릴 때 `mask-size: contain` 이면 비례 확대되어 정본 24 프레임 잉크(18×12)와 사실상 같아진다. **새 자산을 만들지 말고 등록된 것을 쓴다.**

**`lock.svg` 는 아직 없다.** 오케스트레이터가 아이콘 원본을 받아 `ui-library/src/assets/icons/lock.svg` 와 icon manifest 에 등록한다. **빌더는 List:Disabled 의 CSS·마크업·예시까지 전부 만들어 두고**, 자산이 들어오면 바로 동작하게 둔다. 자산이 없어 검사가 실패하면 그 사실을 보고하고 **임의로 SVG 를 그리지 않는다.**

### B-4. manifest.json

- `id`: `bottom-sheet-option` · `status`: `draft` · `variants`: `["text","checkbox","radio","list"]` · `sizes`: `[]` · `breaks`: `{"pc":[],"mobile":[]}`
- `states`: `default` · `selected` · `disabled` (각각 `[data-state="…"]` 로 설명)
- `absentCombinations`: `["checkbox:disabled","radio:disabled","list:selected"]` — 정본에 없는 칸. `gnb-sub-menu-item` 의 같은 필드를 틀로 쓴다.
- `notInCanon`: `selectedBackground`(정본은 선택 줄에 배경색을 칠하지 않는다 — 글자색·아이콘으로만 구분) · `standalone`(단독 배포하지 않고 Bottom Sheet 본문 안에서 쓴다) · `listItemSpacing`(List 행 itemSpacing 이 정본 코드에 지정돼 있지 않다 — 웹은 `space-between` 양끝 배치라 영향 없음)
- `parts`: `label` · `check` · `list-left` · `avatar` · `list-text` · `list-title` · `list-sub` · `chevron` · `lock`
- `htmlContract.grouping`: "이 컴포넌트는 줄 모양만 소유한다. 목록 구조(role·이름·선택 상태)와 고르기 동작은 시트를 여는 화면이 소유한다."
- `dependencies.css`: `tokens.css` · `typography.css` · `components/checkbox.css` · `components/radio.css`
- `dependencies.coreComponents`: `["checkbox","radio"]`
- `icons`: `check` · `chevron` · `account` · `lock` — 앞의 3개는 기존 manifest 항목을 그대로 복사(재등록 아님). `lock` 은 오케스트레이터가 넣는다.
- `jsRequired`: `false` · `javascript`: `{ "runtime": null, "reason": "줄 모양만 소유한다. 고르기 동작은 시트를 여는 화면이 배선한다." }`

### B-5. 예시 마크업

정본 9칸을 전부 보이되(List:Disabled 포함), 실제 쓰임을 보이도록 시트 안 목록 형태로 묶는다.

---

## C. 배선 — 빠뜨리면 조용히 dist 에 안 나온다

`references/wiring-and-traps.md` §1 배선표 그대로:

| 파일 | 무엇 |
|---|---|
| `ui-library/scripts/component-ids.mjs` | `componentIds` 에 `"bottom-sheet-option"`, `"bottom-sheet"` 추가. **순서 = CSS 묶음 순서**이므로 option 을 먼저, sheet 를 뒤에 둔다(sheet 가 option 을 감싼다). `modal-content` 뒤에 붙인다. |
| `ui-library/scripts/test.mjs` | 같은 `componentIds` 배열에 추가 + 두 컴포넌트 계약 검사 추가(아래 C-1) |
| `ui-library/package.json` | `exports` 에 각 3줄 (`./components/{id}`, `/css`, `/html`) |
| `ui-library/src/verification/empty-consumer.html` | 전체 묶음 소비 예시에 시트 1개 추가 |
| `ui-library/src/verification/empty-consumer-individual.html` | 개별 설치 예시. **`<main>` 안 DOM 이 위 파일과 완전히 같아야 한다** — 로딩 방법만 다르다 |

### C-1. `test.mjs` 에 넣을 계약 검사

정본이 흔들리면 잡히도록, **값을 눈으로 지키지 말고 검사기가 지키게 한다**:

- `bottom-sheet`: `jsRequired === true` · `variants` 가 `["none","single","dual"]` · `breaks` 가 `{pc:[],mobile:[]}` · panel 규칙이 `--color-surface-raised`·`--radius-8`·`--shadow-raised-up` 을 쓰는가 · `gap: var(--s1-bottom-sheet-gap)` 과 기본값 `--spacing-48` 선언이 있는가 · `[data-footer="none"]` 이 `padding-bottom: var(--spacing-40)` 인가 · `sheet-content` gap 이 `--spacing-24` 인가 · header·footer 가 `padding-inline: var(--spacing-20)` 인가 · footer gap 이 `--spacing-8` 인가 · 딤이 `var(--color-overlay)` 인가 · close 가 `close.svg` 를 마스크하는가 · 런타임이 `s1:bottom-sheet:open`·`close` 를 내고 backdrop 클릭을 배선하는가
- `bottom-sheet-option`: `jsRequired === false` · `variants` 가 `["text","checkbox","radio","list"]` · `absentCombinations` 3건이 선언돼 있는가 · Text·Checkbox·Radio 줄 높이가 48 인가 · List 세로 패딩이 `--spacing-12` 인가 · 좌우가 `--spacing-20` 인가 · 선택 글자색이 `--color-text-state-accent` 인가 · 비활성 글자색이 `--color-text-state-disabled` 인가 · **선택 상태에 배경색 규칙이 없는가**(정본에 없다) · avatar 가 40px·`--radius-full`·`--color-icon-gray-light` 인가 · 예시에 없는 칸 3개가 **나타나지 않는가**

---

## D. date-picker · time-picker 이관 — ★ 렌더가 바뀌면 퇴행이다

### D-1. 지울 것

| 파일 | 줄(현재) | 무엇 |
|---|---|---|
| `date-picker.css` | 469~540 근처 | `sheet` · `sheet-backdrop` · `sheet-panel` · `sheet-header` · `sheet-title` · `sheet-close` 규칙 |
| `time-picker.css` | 262~320 근처 | 같은 6종 |

`calendar-wrap`·`sheet-footer`·`apply`·`tabs`·`wheel` 등 **자기 내용 배치 규칙은 남긴다** — 그건 그 컴포넌트 소유다.

### D-2. 넣을 것

두 CSS 에 각각 한 블록:

```css
/* 시트 껍데기는 bottom-sheet 코어 배포본이 소유한다. 정본이 이 시트에 준 값만 여기서 준다
   — 간격 32(buildDatePickerBottomSheet itemSpacing) · 그림자 없음(정본에 effects 없음).
   독립 Bottom Sheet 정본은 48 + shadow/raised-up 이라 값이 다르다. */
[data-s1-component="date-picker"] [data-s1-component="bottom-sheet"] {
  --s1-bottom-sheet-gap: var(--spacing-32);
  --s1-bottom-sheet-shadow: none;
}
```

time-picker 도 같은 값(정본 itemSpacing 32 · effects 없음).

### D-3. 마크업 바꿀 것

`date-picker.mobile.example.html` 의 `<div data-s1-part="sheet" hidden>` 에 **`data-s1-component="bottom-sheet"` 와 `data-break="mobile"` `data-footer="single"` 을 더한다.** 안쪽 부품 이름은 **하나도 바꾸지 않는다** — `sheet-backdrop`·`sheet-panel`·`sheet-header`·`sheet-title`·`sheet-close`·`sheet-footer` 그대로. `sheet-content` 층은 **넣지 않는다**(정본이 한 층).

`calendar-wrap` 은 `sheet-body` 로 **바꾸지 않는다** — date-picker 자기 부품 이름이고 그 CSS 도 date-picker 가 갖고 있다.

time-picker 도 같은 방식. 두 컴포넌트의 예시·검수 마크업을 전부 찾아 같이 고친다(`grep -rn 'data-s1-part="sheet"'`).

### D-4. 런타임

`date-picker.js`·`time-picker.js` 는 **지금 코드를 그대로 둔다.** 자기 시트를 자기가 여닫고 있고, 선택자(`[data-s1-part="sheet"]` 등)가 그대로 살아 있다. bottom-sheet 런타임을 겹쳐 물리면 초점 가둠·스크롤 잠금이 두 벌 돈다. **이번 범위에서는 CSS 만 공유한다** — 이 판단과 근거를 manifest 와 3-build 보고서에 적는다.

### D-5. 의존성 선언

`date-picker`·`time-picker` manifest 의 `dependencies.css` 에 `components/bottom-sheet.css` 를, `dependencies.coreComponents` 에 `bottom-sheet` 를 추가한다. **개별 설치할 때 같이 로드해야 한다**는 문장도 `coreComponentsNote` 에 넣는다.

### D-6. 증명

이관 전후로 두 화면의 렌더가 같아야 한다. **이관 전 스크린샷을 먼저 찍고**(PC·Mobile × Light·Dark), 이관 후 같은 조건으로 다시 찍어 대조한다. 파일은 `reports/ui-library/bottom-sheet/screens/` 에 `before-*.png` / `after-*.png` 로 둔다. 차이가 있으면 그 자리를 보고한다.

---

## E. 하지 말 것

- `ui-library/dist` 손편집 (생성물이다)
- `pages/*.html` · `assets/js/ui-library-guide.js` 손대기 (**다음 단계에서 guide-builder 가 한다**)
- `registry/components/*.json` 손대기 (**오케스트레이터가 이미 썼다**)
- `reports/ui-library/bottom-sheet/workflow-state.json` 손대기 (**오케스트레이터만 고친다**)
- `lock.svg` 를 직접 그리기
- 정본에 없는 값·상태·모션 추가
- 자기 결과를 PASS 로 판정하기 (**검증은 오케스트레이터와 component-verifier 소관**)

## F. 끝내고 돌려줄 것

`reports/ui-library/bottom-sheet/3-build.md` 에:
1. 만든·고친 파일 목록
2. 정본 수치 ↔ 구현 값 대조표 (두 컴포넌트 전부)
3. `npm run ui:build` · `ui:test` · `ui:icons` 결과(종료코드 그대로, 실패면 실패라고)
4. D-6 이관 전후 스크린샷 경로와 육안 대조 결과
5. 막힌 것·판단이 필요한 것 (`needs-decision`)
