# Component Token 추출 정의서

> 기준: CLAUDE.md · SW UX GUIDE V2.4
> 원본: Figma `semantic` Variable Collection — Component 수준 토큰 분리
> 업데이트: 2026-04-28

---

## 분리 배경

Figma의 `semantic` 컬렉션에 아래 9개 그룹의 **컴포넌트 수준 토큰**이 혼재되어 있었습니다.
이 파일은 해당 토큰을 Component Token 레이어 기준으로 재정의합니다.

```
color/button/*        → Button
color/chip/*          → Chip
color/dropdown/*      → Dropdown
color/form-control/*  → Input / Textarea
color/control/*       → Checkbox / Radio / Toggle
color/pagination/*    → Pagination
color/navigation/*    → Navigation (GNB / LNB)
color/data/*          → Table / Data Grid
color/status-card/*   → Status Card (관제 도메인)
```

---

## 네이밍 규칙

```
--{component}-{variant}-{state}-{property}
```

- **component**: button, chip, dropdown, input, checkbox, radio, toggle, pagination, nav, table, status-card
- **variant**: primary, secondary, blue-line (ghost deprecated — 2026-04-29 확정) …
- **state**: default, hover, pressed, focus, selected, disabled, error, correct, loading …
- **property**: bg, text, border, icon, indicator, check …

Component Token은 **반드시 Semantic Token을 `var()`로 참조**합니다.
Primitive(Foundation)를 직접 참조하지 않습니다.

---

## 1. Button

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/button/primary/bg--default | `--button-primary-default-bg` | `var(--color-action-primary-default)` | Primary 기본 배경 |
| color/button/primary/bg--hover | `--button-primary-hover-bg` | `var(--color-action-primary-hover)` | Primary hover 배경 |
| color/button/primary/bg--pressed | `--button-primary-pressed-bg` | `var(--color-action-primary-pressed)` | Primary pressed 배경 |
| color/button/primary/bg--disabled | `--button-primary-disabled-bg` | `var(--color-bg-subtle)` | Primary disabled 배경 |
| color/button/primary/border--disabled | `--button-primary-disabled-border` | `var(--color-border-disabled)` | Primary disabled 테두리 |
| color/button/primary/text--default | `--button-primary-default-text` | `var(--color-action-primary-text)` | Primary 텍스트 |
| color/button/primary/text--disabled | `--button-primary-disabled-text` | `var(--color-text-disabled)` | Primary disabled 텍스트 |
| color/button/secondary/bg--default | `--button-secondary-default-bg` | `var(--color-surface-default)` | Secondary 기본 배경 |
| color/button/secondary/bg--hover | `--button-secondary-hover-bg` | `var(--color-bg-subtle)` | Secondary hover 배경 |
| color/button/secondary/bg--pressed | `--button-secondary-pressed-bg` | `var(--color-bg-muted)` | Secondary pressed 배경 |
| color/button/secondary/bg--disabled | `--button-secondary-disabled-bg` | `var(--color-bg-subtle)` | Secondary disabled 배경 |
| color/button/secondary/border--default | `--button-secondary-default-border` | `var(--color-border-default)` | Secondary 기본 테두리 |
| color/button/secondary/border--disabled | `--button-secondary-disabled-border` | `var(--color-border-disabled)` | Secondary disabled 테두리 |
| color/button/secondary/text--default | `--button-secondary-default-text` | `var(--color-text-secondary)` | Secondary 텍스트 |
| color/button/secondary/text--disabled | `--button-secondary-disabled-text` | `var(--color-text-disabled)` | Secondary disabled 텍스트 |
| color/button/blue-line/bg--default | `--button-blue-line-default-bg` | `var(--color-surface-default)` | Blue-line 기본 배경 |
| color/button/blue-line/bg--hover | `--button-blue-line-hover-bg` | `var(--color-action-primary-subtle)` | Blue-line hover 배경 |
| color/button/blue-line/bg--pressed | `--button-blue-line-pressed-bg` | `var(--color-action-primary-subtle)` | Blue-line pressed 배경 |
| color/button/blue-line/bg--disabled | `--button-blue-line-disabled-bg` | `var(--color-bg-subtle)` | Blue-line disabled 배경 |
| color/button/blue-line/border--default | `--button-blue-line-default-border` | `var(--color-action-primary-default)` | Blue-line 기본 테두리 |
| color/button/blue-line/border--hover | `--button-blue-line-hover-border` | `var(--color-action-primary-default)` | Blue-line hover 테두리 (Figma 확인: default와 동일) |
| color/button/blue-line/border--disabled | `--button-blue-line-disabled-border` | `var(--color-border-disabled)` | Blue-line disabled 테두리 |
| color/button/blue-line/text--default | `--button-blue-line-default-text` | `var(--color-action-primary-default)` | Blue-line 텍스트 |
| color/button/blue-line/text--disabled | `--button-blue-line-disabled-text` | `var(--color-text-disabled)` | Blue-line disabled 텍스트 |
| color/button/blue-line/focus-ring | `--button-blue-line-focus-ring` | `var(--color-border-focus)` | Blue-line focus 링 |
| color/button/primary/icon--default | `--button-primary-default-icon` | `var(--color-action-primary-text)` | Primary 아이콘 |
| color/button/secondary/icon--default | `--button-secondary-default-icon` | `var(--color-icon-default)` | Secondary 아이콘 |
| color/button/secondary/icon--disabled | `--button-secondary-disabled-icon` | `var(--color-icon-muted)` | Secondary disabled 아이콘 |
| color/button/primary/focus-ring | `--button-primary-focus-ring` | `var(--color-border-focus)` | Primary focus 링 |
| color/button/secondary/focus-ring | `--button-secondary-focus-ring` | `var(--color-border-focus)` | Secondary focus 링 |

> **Ghost variant — Deprecated (2026-04-29):** ghost는 공식 V2.4 variant가 아닙니다. blue-line으로 대체됩니다. 토큰은 backwards compatibility를 위해 tokens.css에 보존되나 신규 사용 금지입니다.

### 상태 커버리지

| 상태 | primary | secondary | blue-line |
|------|:-------:|:---------:|:---------:|
| default | ✅ | ✅ | ✅ |
| hover | ✅ | ✅ | ✅ |
| pressed | ✅ | ✅ | ✅ |
| focus | ✅ | ✅ | ✅ |
| disabled | ✅ | ✅ | ✅ |
| loading | ⚠️ Human Decision 필요 | ⚠️ | ⚠️ |

> **loading 상태:** Figma 원본 확인 전까지 visual 기준 미확정. sw-button.css에 `.sw-button--loading` 골격 존재.

### CSS 구현

```css
/* Button — Primary */
--button-primary-default-bg:      var(--color-action-primary-default);
--button-primary-hover-bg:        var(--color-action-primary-hover);
--button-primary-pressed-bg:      var(--color-action-primary-pressed);
--button-primary-disabled-bg:     var(--color-bg-subtle);        /* Figma: #F5F5F5 */
--button-primary-disabled-border: var(--color-border-disabled);  /* Figma: #D9D9D9 — 추가됨 */
--button-primary-default-text:    var(--color-action-primary-text);
--button-primary-disabled-text:   var(--color-text-disabled);
--button-primary-default-icon:    var(--color-action-primary-text);
--button-primary-focus-ring:      var(--color-border-focus);

/* Button — Secondary */
--button-secondary-default-bg:      var(--color-surface-default);
--button-secondary-hover-bg:        var(--color-bg-subtle);
--button-secondary-pressed-bg:      var(--color-bg-muted);
--button-secondary-disabled-bg:     var(--color-bg-subtle);
--button-secondary-default-border:  var(--color-border-default);
/* secondary hover border — Figma 확인: hover 시 border 변화 없음 (default와 동일) */
--button-secondary-disabled-border: var(--color-border-disabled);  /* Figma: #D9D9D9 */
--button-secondary-default-text:    var(--color-text-secondary);
--button-secondary-disabled-text:   var(--color-text-disabled);
--button-secondary-default-icon:    var(--color-icon-default);
--button-secondary-disabled-icon:   var(--color-icon-muted);
--button-secondary-focus-ring:      var(--color-border-focus);

/* Button — Blue-line (Figma MCP 확인 완료 2026-05-12) */
--button-blue-line-default-bg:      var(--color-surface-default);
--button-blue-line-hover-bg:        var(--color-action-primary-subtle);
--button-blue-line-pressed-bg:      var(--color-action-primary-subtle);
--button-blue-line-disabled-bg:     var(--color-bg-subtle);
--button-blue-line-default-border:  var(--color-action-primary-default);
--button-blue-line-hover-border:    var(--color-action-primary-default); /* Figma: hover = default와 동일 */
--button-blue-line-disabled-border: var(--color-border-disabled);
--button-blue-line-default-text:    var(--color-action-primary-default);
--button-blue-line-disabled-text:   var(--color-text-disabled);
--button-blue-line-focus-ring:      var(--color-border-focus);

/* Button — Ghost (DEPRECATED 2026-04-29 — 신규 사용 금지, blue-line 사용) */
/* --button-ghost-*: tokens.css에 legacy 보존, 구현 금지 */


```

---

## 2. Chip

> Figma 원본 기준 두 가지 타입: **Line** (테두리 표시, 흰 배경) / **Solid** (채운 배경, 테두리=배경색)

### 변수 정의 — Line type

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/chip/line/bg--default | `--chip-line-default-bg` | `var(--color-surface-default)` | 기본 배경 |
| color/chip/line/border--default | `--chip-line-default-border` | `var(--color-border-default)` | 기본 테두리 |
| color/chip/line/text--default | `--chip-line-default-text` | `var(--color-text-caption)` | 기본 텍스트 |
| color/chip/line/bg--selected | `--chip-line-selected-bg` | `var(--color-surface-default)` | 선택 배경 |
| color/chip/line/border--selected | `--chip-line-selected-border` | `var(--color-action-primary-default)` | 선택 테두리 |
| color/chip/line/text--selected | `--chip-line-selected-text` | `var(--color-action-primary-default)` | 선택 텍스트 |
| color/chip/line/bg--disabled | `--chip-line-disabled-bg` | `var(--color-bg-subtle)` | disabled 배경 |
| color/chip/line/border--disabled | `--chip-line-disabled-border` | `var(--color-border-default)` | disabled 테두리 |
| color/chip/line/text--disabled | `--chip-line-disabled-text` | `var(--color-text-disabled)` | disabled 텍스트 |

### 변수 정의 — Solid type

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/chip/solid/bg--default | `--chip-solid-default-bg` | `var(--color-bg-subtle)` | 기본 배경 |
| color/chip/solid/border--default | `--chip-solid-default-border` | `var(--color-bg-subtle)` | 기본 테두리 (=배경) |
| color/chip/solid/text--default | `--chip-solid-default-text` | `var(--color-text-caption)` | 기본 텍스트 |
| color/chip/solid/bg--selected | `--chip-solid-selected-bg` | `var(--color-action-primary-default)` | 선택 배경 |
| color/chip/solid/border--selected | `--chip-solid-selected-border` | `var(--color-action-primary-default)` | 선택 테두리 |
| color/chip/solid/text--selected | `--chip-solid-selected-text` | `var(--color-action-primary-text)` | 선택 텍스트 |
| color/chip/solid/bg--disabled | `--chip-solid-disabled-bg` | `var(--color-bg-subtle)` | disabled 배경 |
| color/chip/solid/border--disabled | `--chip-solid-disabled-border` | `var(--color-bg-subtle)` | disabled 테두리 |
| color/chip/solid/text--disabled | `--chip-solid-disabled-text` | `var(--color-text-disabled)` | disabled 텍스트 |

### CSS 구현

```css
/* Chip — Line type */
--chip-line-default-bg:        var(--color-surface-default);
--chip-line-default-border:    var(--color-border-default);
--chip-line-default-text:      var(--color-text-caption);
--chip-line-selected-bg:       var(--color-surface-default);
--chip-line-selected-border:   var(--color-action-primary-default);
--chip-line-selected-text:     var(--color-action-primary-default);
--chip-line-disabled-bg:       var(--color-bg-subtle);
--chip-line-disabled-border:   var(--color-border-default);
--chip-line-disabled-text:     var(--color-text-disabled);

/* Chip — Solid type */
--chip-solid-default-bg:       var(--color-bg-subtle);
--chip-solid-default-border:   var(--color-bg-subtle);
--chip-solid-default-text:     var(--color-text-caption);
--chip-solid-selected-bg:      var(--color-action-primary-default);
--chip-solid-selected-border:  var(--color-action-primary-default);
--chip-solid-selected-text:    var(--color-action-primary-text);
--chip-solid-disabled-bg:      var(--color-bg-subtle);
--chip-solid-disabled-border:  var(--color-bg-subtle);
--chip-solid-disabled-text:    var(--color-text-disabled);
```

---

## 3. Dropdown

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/dropdown/trigger/bg--default | `--dropdown-trigger-default-bg` | `var(--color-surface-default)` | 트리거 기본 배경 |
| color/dropdown/trigger/bg--hover | `--dropdown-trigger-hover-bg` | `var(--color-bg-subtle)` | 트리거 hover 배경 |
| color/dropdown/trigger/bg--open | `--dropdown-trigger-open-bg` | `var(--color-bg-subtle)` | 트리거 열림 배경 |
| color/dropdown/trigger/bg--disabled | `--dropdown-trigger-disabled-bg` | `var(--color-bg-subtle)` | 트리거 disabled 배경 |
| color/dropdown/trigger/border--default | `--dropdown-trigger-default-border` | `var(--color-border-default)` | 트리거 기본 테두리 |
| color/dropdown/trigger/border--hover | `--dropdown-trigger-hover-border` | `var(--color-border-strong)` | 트리거 hover 테두리 |
| color/dropdown/trigger/border--open | `--dropdown-trigger-open-border` | `var(--color-border-focus)` | 트리거 열림 테두리 |
| color/dropdown/trigger/border--disabled | `--dropdown-trigger-disabled-border` | `var(--color-border-subtle)` | 트리거 disabled 테두리 |
| color/dropdown/trigger/text--default | `--dropdown-trigger-default-text` | `var(--color-text-secondary)` | 트리거 텍스트 |
| color/dropdown/trigger/text--disabled | `--dropdown-trigger-disabled-text` | `var(--color-text-disabled)` | 트리거 disabled 텍스트 |
| color/dropdown/list/bg | `--dropdown-list-bg` | `var(--color-surface-raised)` | 목록 배경 |
| color/dropdown/option/bg--hover | `--dropdown-option-hover-bg` | `var(--color-bg-subtle)` | 옵션 hover 배경 |
| color/dropdown/option/bg--selected | `--dropdown-option-selected-bg` | `var(--color-action-primary-subtle)` | 옵션 선택 배경 |

### CSS 구현

```css
/* Dropdown — Trigger */
--dropdown-trigger-default-bg:      var(--color-surface-default);
--dropdown-trigger-hover-bg:        var(--color-bg-subtle);
--dropdown-trigger-open-bg:         var(--color-bg-subtle);
--dropdown-trigger-disabled-bg:     var(--color-bg-subtle);
--dropdown-trigger-default-border:  var(--color-border-default);
--dropdown-trigger-hover-border:    var(--color-border-strong);
--dropdown-trigger-open-border:     var(--color-border-focus);
--dropdown-trigger-disabled-border: var(--color-border-subtle);
--dropdown-trigger-default-text:    var(--color-text-secondary);
--dropdown-trigger-disabled-text:   var(--color-text-disabled);

/* Dropdown — List & Option */
--dropdown-list-bg:             var(--color-surface-raised);
--dropdown-option-hover-bg:     var(--color-bg-subtle);
--dropdown-option-selected-bg:  var(--color-action-primary-subtle);
```

---

## 4. Input / Form-control

> `border/disabled-alt1`, `border/disabled-alt2` 처리:
> Semantic 레이어에서 단일 `--color-border-disabled` (= `--color-border-subtle`) 제공.
> 컴포넌트별로 아래와 같이 override.

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/form-control/bg--default | `--input-default-bg` | `var(--color-surface-default)` | 기본 배경 |
| color/form-control/bg--hover | `--input-hover-bg` | `var(--color-surface-default)` | hover 배경 (변화 없음) |
| color/form-control/bg--focus | `--input-focus-bg` | `var(--color-surface-default)` | focus 배경 |
| color/form-control/bg--disabled | `--input-disabled-bg` | `var(--color-bg-subtle)` | disabled 배경 |
| color/form-control/bg--error | `--input-error-bg` | `var(--color-surface-default)` | 에러 배경 |
| color/form-control/border--default | `--input-default-border` | `var(--color-border-default)` | 기본 테두리 |
| color/form-control/border--hover | `--input-hover-border` | `var(--color-border-strong)` | hover 테두리 |
| color/form-control/border--focus | `--input-focus-border` | `var(--color-border-focus)` | focus 테두리 |
| color/form-control/border--error | `--input-error-border` | `var(--color-border-danger)` | 에러 테두리 |
| color/form-control/border--correct | `--input-correct-border` | `var(--color-border-correct)` | 올바른 입력 테두리 |
| color/form-control/border--disabled | `--input-disabled-border` | `var(--color-border-default)` | disabled 테두리 (alt1) |

> **Select / 별도 컴포넌트의 disabled border (alt2)**
> `--select-disabled-border: var(--color-border-subtle)` — 컴포넌트 파일에서 개별 정의.

### 텍스트 / 아이콘 변수

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/form-control/text--placeholder | `--input-placeholder-text` | `var(--color-text-placeholder)` | 플레이스홀더 |
| color/form-control/text--helper | `--input-helper-text` | `var(--color-text-helper)` | 도움말 텍스트 |
| color/form-control/text--error | `--input-error-text` | `var(--color-text-danger)` | 에러 메시지 |
| color/form-control/text--correct | `--input-correct-text` | `var(--color-text-correct)` | 올바른 입력 피드백 |
| color/form-control/text--disabled | `--input-disabled-text` | `var(--color-text-disabled)` | disabled 텍스트 |

### CSS 구현

```css
/* Input / Form-control */
--input-default-bg:      var(--color-surface-default);
--input-hover-bg:        var(--color-surface-default);
--input-focus-bg:        var(--color-surface-default);
--input-disabled-bg:     var(--color-bg-subtle);
--input-error-bg:        var(--color-surface-default);
--input-default-border:  var(--color-border-default);
--input-hover-border:    var(--color-border-strong);
--input-focus-border:    var(--color-border-focus);
--input-error-border:    var(--color-border-danger);
--input-correct-border:  var(--color-border-correct);
--input-disabled-border: var(--color-border-default);    /* alt1 */

/* Select (disabled border alt2) */
--select-disabled-border: var(--color-border-subtle);   /* alt2 */

/* Text */
--input-placeholder-text: var(--color-text-placeholder);
--input-helper-text:       var(--color-text-helper);
--input-error-text:        var(--color-text-danger);
--input-correct-text:      var(--color-text-correct);
--input-disabled-text:     var(--color-text-disabled);
```

---

## 5. Control (Checkbox / Radio / Toggle)

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/control/checkbox/bg--default | `--checkbox-default-bg` | `var(--color-surface-default)` | 체크박스 기본 배경 |
| color/control/checkbox/bg--checked | `--checkbox-checked-bg` | `var(--color-action-primary-default)` | 체크박스 체크 배경 |
| color/control/checkbox/bg--indeterminate | `--checkbox-indeterminate-bg` | `var(--color-action-primary-default)` | 체크박스 중간 상태 배경 |
| color/control/checkbox/bg--disabled | `--checkbox-disabled-bg` | `var(--color-bg-subtle)` | 체크박스 disabled 배경 |
| color/control/checkbox/border--default | `--checkbox-default-border` | `var(--color-border-default)` | 체크박스 기본 테두리 |
| color/control/checkbox/border--hover | `--checkbox-hover-border` | `var(--color-border-focus)` | 체크박스 hover 테두리 |
| color/control/checkbox/border--checked | `--checkbox-checked-border` | `var(--color-action-primary-default)` | 체크박스 체크 테두리 |
| color/control/checkbox/border--disabled | `--checkbox-disabled-border` | `var(--color-border-subtle)` | 체크박스 disabled 테두리 |
| color/control/checkbox/check-icon | `--checkbox-check-icon` | `var(--color-action-primary-text)` | 체크 마크 |
| color/control/radio/bg--default | `--radio-default-bg` | `var(--color-surface-default)` | 라디오 기본 배경 |
| color/control/radio/bg--disabled | `--radio-disabled-bg` | `var(--color-bg-subtle)` | 라디오 disabled 배경 |
| color/control/radio/border--default | `--radio-default-border` | `var(--color-border-default)` | 라디오 기본 테두리 |
| color/control/radio/border--selected | `--radio-selected-border` | `var(--color-action-primary-default)` | 라디오 선택 테두리 |
| color/control/radio/border--disabled | `--radio-disabled-border` | `var(--color-border-strong)` | 라디오 disabled 테두리 (#C4C4C4) |
| color/control/radio/dot--selected | `--radio-selected-dot` | `var(--color-action-primary-default)` | 라디오 선택 도트 |
| color/control/radio/dot--disabled | `--radio-disabled-dot` | `var(--color-border-strong)` | 라디오 disabled-selected 도트 (#C4C4C4) |
| color/control/toggle/bg--on | `--toggle-on-bg` | `var(--color-action-primary-default)` | 토글 ON 배경 |
| color/control/toggle/bg--off | `--toggle-off-bg` | `var(--color-text-placeholder)` | 토글 OFF 배경 (#9D9D9D) |
| color/control/toggle/bg--disabled | `--toggle-disabled-bg` | `var(--color-bg-muted)` | 토글 disabled 배경 |
| color/control/toggle/knob | `--toggle-knob` | `var(--color-action-primary-text)` | 토글 노브 색상 |

### CSS 구현

```css
/* Checkbox */
--checkbox-default-bg:       var(--color-surface-default);
--checkbox-checked-bg:       var(--color-action-primary-default);
--checkbox-indeterminate-bg: var(--color-action-primary-default);
--checkbox-disabled-bg:      var(--color-bg-subtle);
--checkbox-default-border:   var(--color-border-default);
--checkbox-hover-border:     var(--color-border-focus);
--checkbox-checked-border:   var(--color-action-primary-default);
--checkbox-disabled-border:  var(--color-border-subtle);
--checkbox-check-icon:       var(--color-action-primary-text);

/* Radio */
--radio-default-bg:      var(--color-surface-default);
--radio-disabled-bg:     var(--color-bg-subtle);
--radio-default-border:  var(--color-border-default);
--radio-selected-border: var(--color-action-primary-default);
--radio-disabled-border: var(--color-border-strong);
--radio-selected-dot:    var(--color-action-primary-default);
--radio-disabled-dot:    var(--color-border-strong);

/* Toggle */
--toggle-on-bg:       var(--color-action-primary-default);
--toggle-off-bg:      var(--color-text-placeholder);
--toggle-disabled-bg: var(--color-bg-muted);
--toggle-knob:        var(--color-action-primary-text);
```

---

## 6. Pagination

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/pagination/bg--default | `--pagination-default-bg` | `var(--color-surface-default)` | 기본 배경 |
| color/pagination/bg--hover | `--pagination-hover-bg` | `var(--color-bg-subtle)` | hover 배경 |
| color/pagination/bg--active | `--pagination-active-bg` | `var(--color-action-primary-default)` | 현재 페이지 배경 |
| color/pagination/bg--disabled | `--pagination-disabled-bg` | `var(--color-surface-default)` | disabled 배경 |
| color/pagination/text--default | `--pagination-default-text` | `var(--color-text-secondary)` | 기본 텍스트 |
| color/pagination/text--active | `--pagination-active-text` | `var(--color-action-primary-text)` | 현재 페이지 텍스트 |

### CSS 구현

```css
/* Pagination */
--pagination-default-bg:   var(--color-surface-default);
--pagination-hover-bg:     var(--color-bg-subtle);
--pagination-active-bg:    var(--color-action-primary-default);
--pagination-disabled-bg:  var(--color-surface-default);
--pagination-default-text: var(--color-text-secondary);
--pagination-active-text:  var(--color-action-primary-text);
--pagination-disabled-text: var(--color-text-disabled);
--pagination-border:       var(--color-border-default);
```

---

## 7. Navigation (GNB / LNB)

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/navigation/bg | `--nav-bg` | `var(--color-surface-default)` | 내비게이션 배경 |
| color/navigation/item/bg--hover | `--nav-item-hover-bg` | `var(--color-bg-subtle)` | 아이템 hover 배경 |
| color/navigation/item/bg--active | `--nav-item-active-bg` | `var(--color-action-primary-subtle)` | 아이템 활성 배경 |
| color/navigation/item/text--default | `--nav-item-default-text` | `var(--color-text-tertiary)` | 기본 텍스트 |
| color/navigation/item/text--active | `--nav-item-active-text` | `var(--color-action-primary-default)` | 활성 텍스트 |
| color/navigation/item/icon--default | `--nav-item-default-icon` | `var(--color-icon-default)` | 기본 아이콘 |
| color/navigation/item/icon--active | `--nav-item-active-icon` | `var(--color-action-primary-default)` | 활성 아이콘 |
| color/navigation/item/indicator | `--nav-item-indicator` | `var(--color-action-primary-default)` | 활성 인디케이터 |

### CSS 구현

```css
/* Navigation */
--nav-bg:                  var(--color-surface-default);
--nav-item-hover-bg:       var(--color-bg-subtle);
--nav-item-active-bg:      var(--color-action-primary-subtle);
--nav-item-default-text:   var(--color-text-tertiary);
--nav-item-active-text:    var(--color-action-primary-default);
--nav-item-default-icon:   var(--color-icon-default);
--nav-item-active-icon:    var(--color-action-primary-default);
--nav-item-indicator:      var(--color-action-primary-default);
--nav-divider:             var(--color-border-subtle);
```

---

## 8. Table / Data Grid

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/data/table/header-bg | `--table-header-bg` | `var(--color-bg-subtle)` | 헤더 배경 |
| color/data/table/row-bg--default | `--table-row-default-bg` | `var(--color-surface-default)` | 행 기본 배경 |
| color/data/table/row-bg--hover | `--table-row-hover-bg` | `var(--color-bg-subtle)` | 행 hover 배경 |
| color/data/table/row-bg--selected | `--table-row-selected-bg` | `var(--color-bg-selected)` | 행 선택 배경 |

### CSS 구현

```css
/* Table / Data Grid */
--table-header-bg:        var(--color-bg-subtle);
--table-header-text:      var(--color-text-tertiary);
--table-header-border:    var(--color-border-default);
--table-row-default-bg:   var(--color-surface-default);
--table-row-hover-bg:     var(--color-bg-subtle);
--table-row-selected-bg:  var(--color-bg-selected);
--table-cell-border:      var(--color-border-subtle);
--table-cell-text:        var(--color-text-secondary);
```

---

## 9. Status Card *(관제 도메인)*

> 이 그룹은 관제 시스템의 장치 상태 표시용입니다.
> 표준 UI 피드백(성공/에러)과 다른 개념으로, **Domain Token 레이어로 이동 예정**입니다.
> Figma 오타 3건 포함: `--defualt` → `--default`.

### 변수 정의

| Figma 원본 (오타 수정 후) | CSS Variable | Semantic / Domain 참조 | 설명 |
|---|---|---|---|
| color/status-card/text/primary--default | `--status-card-primary-text` | `var(--color-domain-status-primary)` | 주요 상태 텍스트 |
| color/status-card/text/secondary--default | `--status-card-secondary-text` | `var(--color-domain-status-secondary)` | 보조 상태 텍스트 |
| color/status-card/text/tertiary--default | `--status-card-tertiary-text` | `var(--color-domain-status-tertiary)` | 3차 상태 텍스트 |
| color/status-card/bg/primary | `--status-card-primary-bg` | `var(--color-action-primary-subtle)` | 주요 상태 배경 |
| color/status-card/bg/secondary | `--status-card-secondary-bg` | `var(--color-bg-subtle)` | 보조 상태 배경 |
| color/status-card/icon/primary | `--status-card-primary-icon` | `var(--color-domain-status-primary)` | 주요 상태 아이콘 |
| color/status-card/icon/secondary | `--status-card-secondary-icon` | `var(--color-domain-status-secondary)` | 보조 상태 아이콘 |
| color/status-card/icon/tertiary | `--status-card-tertiary-icon` | `var(--color-domain-status-tertiary)` | 3차 상태 아이콘 |

> **오타 수정 필요 (Figma)**
> `color/status-card/text/primary--defualt` → `color/status-card/text/primary--default`
> `color/status-card/text/secondary--defualt` → `color/status-card/text/secondary--default`
> `color/status-card/text/tertiary--defualt` → `color/status-card/text/tertiary--default`

### CSS 구현

```css
/* Status Card (Domain) */
--status-card-primary-text:   var(--color-domain-status-primary);
--status-card-secondary-text: var(--color-domain-status-secondary);
--status-card-tertiary-text:  var(--color-domain-status-tertiary);
--status-card-primary-bg:     var(--color-action-primary-subtle);
--status-card-secondary-bg:   var(--color-bg-subtle);
--status-card-primary-icon:   var(--color-domain-status-primary);
--status-card-secondary-icon: var(--color-domain-status-secondary);
--status-card-tertiary-icon:  var(--color-domain-status-tertiary);
```

---

## 전체 참조 구조 요약

```
Component Token
  └─ var(--color-action-*)      ← 버튼 primary, 컨트롤 체크 등
  └─ var(--color-bg-*)          ← hover/selected 배경
  └─ var(--color-surface-*)     ← 컴포넌트 기본 배경
  └─ var(--color-border-*)      ← 테두리, focus ring
  └─ var(--color-text-*)        ← 텍스트, 플레이스홀더, 에러
  └─ var(--color-icon-*)        ← 아이콘
  └─ var(--color-status-*)      ← UI 피드백 (에러, 경고)
  └─ var(--color-domain-*)      ← 도메인 상태 (관제 시스템)
```

> **원칙**: Foundation(Primitive) 직접 참조 금지.
> 반드시 Semantic Token을 경유합니다.

---

## Figma 작업 체크리스트

- [ ] `semantic` 컬렉션에서 위 9개 그룹을 `component` 컬렉션으로 이동
- [ ] `color/status-card/text/*--defualt` → `--default` 오타 3건 수정
- [ ] 각 Component Token이 Semantic Token을 올바르게 alias하는지 검증
- [ ] `color/dropdown/list/bg` → `surface/raised` 참조로 업데이트
- [ ] `border/disabled-alt1`, `border/disabled-alt2` → Component 레이어에서 `--input-disabled-border` / `--select-disabled-border`로 분리
- [ ] `color/status-card/*` → Domain Token 컬렉션 이동 여부 확정
