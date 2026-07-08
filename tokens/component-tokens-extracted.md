# Component Token 추출 정의서

> 기준: CLAUDE.md · SW UX GUIDE V2.4
> 원본: Figma `semantic` Variable Collection — Component 수준 토큰 분리
> 업데이트: 2026-04-28

> **📋 참고 문서** — 이 파일은 인간 가독 참고 문서입니다.  
> 기준 데이터는 `registry/tokens/` JSON 파일입니다. 충돌 시 **registry가 우선**합니다.  
> 이 파일 수정 시 반드시 `assets/css/tokens.css`와 동기화해야 합니다.

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
- **state**: default, hover, pressed, focus, selected, disabled, error, correct …
- **property**: bg, text, border, icon, indicator, check …

Component Token은 **반드시 Semantic Token을 `var()`로 참조**합니다.
Foundation(Foundation)를 직접 참조하지 않습니다.

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
| color/button/primary/icon--default | `--button-primary-default-icon` | `var(--color-action-primary-text)` | Primary 아이콘 |
| color/button/secondary/icon--default | `--button-secondary-default-icon` | `var(--color-icon-default)` | Secondary 아이콘 |
| color/button/secondary/icon--disabled | `--button-secondary-disabled-icon` | `var(--color-icon-muted)` | Secondary disabled 아이콘 |

> **Ghost variant — Deprecated (2026-04-29):** ghost는 공식 V2.4 variant가 아닙니다. blue-line으로 대체됩니다. 토큰은 backwards compatibility를 위해 tokens.css에 보존되나 신규 사용 금지입니다.

### 상태 커버리지

| 상태 | primary | secondary | blue-line |
|------|:-------:|:---------:|:---------:|
| default | ✅ | ✅ | ✅ |
| hover | ✅ | ✅ | ✅ |
| pressed | ✅ | ✅ | ✅ |
| disabled | ✅ | ✅ | ✅ |

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
| color/chip/line/bg--hover | `--chip-line-hover-bg` | `var(--color-bg-subtle)` | hover 배경 |
| color/chip/line/bg--selected | `--chip-line-selected-bg` | `var(--color-surface-default)` | 선택 배경 |
| color/chip/line/bg--disabled | `--chip-line-disabled-bg` | `var(--color-bg-subtle)` | disabled 배경 |
| color/chip/line/border--default | `--chip-line-default-border` | `var(--color-border-default)` | 기본 테두리 |
| color/chip/line/border--hover | `--chip-line-hover-border` | `var(--color-border-strong)` | hover 테두리 |
| color/chip/line/border--selected | `--chip-line-selected-border` | `var(--color-action-primary-default)` | 선택 테두리 |
| color/chip/line/border--disabled | `--chip-line-disabled-border` | `var(--color-border-default)` | disabled 테두리 |
| color/chip/line/text--default | `--chip-line-default-text` | `var(--color-text-caption)` | 기본 텍스트 |
| color/chip/line/text--selected | `--chip-line-selected-text` | `var(--color-action-primary-default)` | 선택 텍스트 |
| color/chip/line/text--disabled | `--chip-line-disabled-text` | `var(--color-text-disabled)` | disabled 텍스트 |
| color/chip/line/icon--default | `--chip-line-default-icon` | `var(--color-icon-default)` | 기본 아이콘 |
| color/chip/line/icon--selected | `--chip-line-selected-icon` | `var(--color-action-primary-default)` | 선택 아이콘 |
| color/chip/line/icon--disabled | `--chip-line-disabled-icon` | `var(--color-icon-muted)` | disabled 아이콘 |
| color/chip/line/close-icon--default | `--chip-line-default-close-icon` | `var(--color-icon-default)` | 닫기 아이콘 기본 |
| color/chip/line/close-icon--hover | `--chip-line-hover-close-icon` | `var(--color-icon-emphasis)` | 닫기 아이콘 hover |
| color/chip/line/close-icon--selected | `--chip-line-selected-close-icon` | `var(--color-action-primary-default)` | 닫기 아이콘 선택 |

### 변수 정의 — Solid type

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/chip/solid/bg--default | `--chip-solid-default-bg` | `var(--color-bg-subtle)` | 기본 배경 |
| color/chip/solid/bg--hover | `--chip-solid-hover-bg` | `var(--color-bg-muted)` | hover 배경 |
| color/chip/solid/bg--selected | `--chip-solid-selected-bg` | `var(--color-action-primary-default)` | 선택 배경 |
| color/chip/solid/bg--disabled | `--chip-solid-disabled-bg` | `var(--color-bg-subtle)` | disabled 배경 |
| color/chip/solid/border--default | `--chip-solid-default-border` | `var(--color-bg-subtle)` | 기본 테두리 (=배경) |
| color/chip/solid/border--hover | `--chip-solid-hover-border` | `var(--color-bg-muted)` | hover 테두리 (=배경) |
| color/chip/solid/border--selected | `--chip-solid-selected-border` | `var(--color-action-primary-default)` | 선택 테두리 |
| color/chip/solid/border--disabled | `--chip-solid-disabled-border` | `var(--color-bg-subtle)` | disabled 테두리 |
| color/chip/solid/text--default | `--chip-solid-default-text` | `var(--color-text-caption)` | 기본 텍스트 |
| color/chip/solid/text--selected | `--chip-solid-selected-text` | `var(--color-action-primary-text)` | 선택 텍스트 |
| color/chip/solid/text--disabled | `--chip-solid-disabled-text` | `var(--color-text-disabled)` | disabled 텍스트 |
| color/chip/solid/icon--default | `--chip-solid-default-icon` | `var(--color-icon-default)` | 기본 아이콘 |
| color/chip/solid/icon--selected | `--chip-solid-selected-icon` | `var(--color-action-primary-text)` | 선택 아이콘 |
| color/chip/solid/icon--disabled | `--chip-solid-disabled-icon` | `var(--color-icon-muted)` | disabled 아이콘 |
| color/chip/solid/close-icon--default | `--chip-solid-default-close-icon` | `var(--color-icon-default)` | 닫기 아이콘 기본 |
| color/chip/solid/close-icon--hover | `--chip-solid-hover-close-icon` | `var(--color-icon-emphasis)` | 닫기 아이콘 hover |
| color/chip/solid/close-icon--selected | `--chip-solid-selected-close-icon` | `var(--color-action-primary-text)` | 닫기 아이콘 선택 |

### CSS 구현

```css
/* Chip — Line type */
--chip-line-default-bg:          var(--color-surface-default);
--chip-line-hover-bg:            var(--color-bg-subtle);
--chip-line-selected-bg:         var(--color-surface-default);
--chip-line-disabled-bg:         var(--color-bg-subtle);
--chip-line-default-border:      var(--color-border-default);
--chip-line-hover-border:        var(--color-border-strong);
--chip-line-selected-border:     var(--color-action-primary-default);
--chip-line-disabled-border:     var(--color-border-default);
--chip-line-default-text:        var(--color-text-caption);
--chip-line-selected-text:       var(--color-action-primary-default);
--chip-line-disabled-text:       var(--color-text-disabled);
--chip-line-default-icon:        var(--color-icon-default);
--chip-line-selected-icon:       var(--color-action-primary-default);
--chip-line-disabled-icon:       var(--color-icon-muted);
--chip-line-default-close-icon:  var(--color-icon-default);
--chip-line-hover-close-icon:    var(--color-icon-emphasis);
--chip-line-selected-close-icon: var(--color-action-primary-default);

/* Chip — Solid type */
--chip-solid-default-bg:          var(--color-bg-subtle);
--chip-solid-hover-bg:            var(--color-bg-muted);
--chip-solid-selected-bg:         var(--color-action-primary-default);
--chip-solid-disabled-bg:         var(--color-bg-subtle);
--chip-solid-default-border:      var(--color-bg-subtle);
--chip-solid-hover-border:        var(--color-bg-muted);
--chip-solid-selected-border:     var(--color-action-primary-default);
--chip-solid-disabled-border:     var(--color-bg-subtle);
--chip-solid-default-text:        var(--color-text-caption);
--chip-solid-selected-text:       var(--color-action-primary-text);
--chip-solid-disabled-text:       var(--color-text-disabled);
--chip-solid-default-icon:        var(--color-icon-default);
--chip-solid-selected-icon:       var(--color-action-primary-text);
--chip-solid-disabled-icon:       var(--color-icon-muted);
--chip-solid-default-close-icon:  var(--color-icon-default);
--chip-solid-hover-close-icon:    var(--color-icon-emphasis);
--chip-solid-selected-close-icon: var(--color-action-primary-text);
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
| color/dropdown/trigger/border--default | `--dropdown-trigger-default-border` | `var(--color-form-control-border-default)` | 트리거 기본 테두리 |
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
--dropdown-trigger-default-border:  var(--color-form-control-border-default);
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

> **토큰 2-레이어 구조 (MVP4 — 2026-05-18 확정)**
> Semantic = `--color-form-control-*` / Component alias = `--input-*` (form-control 참조)
> HD-2 hover 삭제 · HD-3/8 focus-bg/error-bg 삭제 (default와 동일, 별도 토큰 불필요)

### Semantic 레이어 (color-form-control-*)

| CSS Variable | 참조 | 설명 |
|---|---|---|
| `--color-form-control-bg-default` | `var(--color-surface-default)` | 기본 배경 |
| `--color-form-control-bg-hover` | `var(--color-surface-default)` (light), `var(--color-bg-muted)` (dark override) | hover 배경. Dropdown·Input·TimePicker 공용 |
| `--color-form-control-bg-disabled` | `var(--color-bg-subtle)` | disabled 배경 |
| `--color-form-control-border-default` | `var(--color-control-border-default)` | 기본 테두리 |
| `--color-form-control-border-hover` | `var(--color-border-strong)` | hover 강조 테두리. Dropdown trigger hover에서 사용 |
| `--color-form-control-border-selected` | `var(--color-border-focus)` | focus/selected 테두리 (파란색) |
| `--color-form-control-border-error` | `var(--color-status-error)` | 에러 테두리 |
| `--color-form-control-border-correct` | `var(--color-border-focus)` | correct 테두리 (= selected, 파란색) |
| `--color-form-control-border-disabled` | `var(--color-border-subtle)` | disabled 테두리 |
| `--color-form-control-text-default` | `var(--color-text-secondary)` | 입력 텍스트 (#353535) |
| `--color-form-control-text-placeholder` | `var(--color-text-placeholder)` | 플레이스홀더 |
| `--color-form-control-text-disabled` | `var(--color-text-disabled)` (light), `var(--color-text-readonly)` (dark override) | disabled 텍스트 |
| `--color-form-control-label-default` | `var(--color-text-secondary)` | TimePicker "시"/"분" 등 form-control 라벨 |
| `--color-form-control-label-disabled` | `var(--color-text-disabled)` | 비활성 라벨 |
| `--color-form-control-icon-default` | `var(--color-gray-800)` (light), `var(--color-gray-dark-700)` (dark override) | form-control 기본 아이콘 색 |

### Semantic 레이어 (color-text-state-*)

| CSS Variable | Light | Dark | 설명 |
|---|---|---|---|
| `--color-text-state-helper` | `var(--color-text-secondary)` | (상속) | 도움말 텍스트 |
| `--color-text-state-correct` | `var(--color-blue-400)` = #1D6CEB | `var(--color-blue-dark-400)` | correct 피드백 텍스트 |
| `--color-text-state-error` | `var(--color-status-error)` | (상속) | 에러 메시지 텍스트 |

### Component alias (--input-*)

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/form-control/bg--default | `--input-default-bg` | `var(--color-form-control-bg-default)` | 기본 배경 |
| color/form-control/bg--disabled | `--input-disabled-bg` | `var(--color-form-control-bg-disabled)` | disabled 배경 |
| color/form-control/bg--disabled | `--input-readonly-bg` | `var(--color-form-control-bg-disabled)` | readonly 배경 (disabled와 동일) |
| color/form-control/border--default | `--input-default-border` | `var(--color-form-control-border-default)` | 기본 테두리 |
| color/form-control/border--selected | `--input-focus-border` | `var(--color-form-control-border-selected)` | focus 테두리 |
| color/form-control/border--error | `--input-error-border` | `var(--color-form-control-border-error)` | 에러 테두리 |
| color/form-control/border--correct | `--input-correct-border` | `var(--color-form-control-border-correct)` | correct 테두리 |
| color/form-control/border--disabled | `--input-disabled-border` | `var(--color-form-control-border-disabled)` | disabled 테두리 |
| color/form-control/border--disabled | `--input-readonly-border` | `var(--color-form-control-border-disabled)` | readonly 테두리 (disabled와 동일) |
| color/form-control/text--placeholder | `--input-placeholder-text` | `var(--color-form-control-text-placeholder)` | 플레이스홀더 |
| color/form-control/text--disabled | `--input-disabled-text` | `var(--color-form-control-text-disabled)` | disabled 텍스트 |
| color/text/state/readonly | `--input-readonly-text` | `var(--color-text-readonly)` | readonly 텍스트 (text-disabled보다 한 단계 진함) |
| color/text/state/helper | `--input-helper-text` | `var(--color-text-state-helper)` | 도움말 텍스트 |
| color/text/state/correct | `--input-correct-text` | `var(--color-text-state-correct)` | correct 피드백 텍스트 |
| color/text/state/error | `--input-error-text` | `var(--color-text-state-error)` | 에러 메시지 텍스트 |

> **Select disabled border** `--select-disabled-border: var(--color-border-subtle)` — Select 컴포넌트 개별 정의.

> **삭제된 토큰** (HD-2/3/8): `--input-hover-bg`, `--input-focus-bg`, `--input-error-bg`, `--input-hover-border`

### CSS 구현

```css
/* Semantic: Form-control */
--color-form-control-bg-default:       var(--color-surface-default);
--color-form-control-bg-disabled:      var(--color-bg-subtle);
--color-form-control-border-default:   var(--color-border-default);
--color-form-control-border-selected:  var(--color-border-focus);
--color-form-control-border-error:     var(--color-status-error);
--color-form-control-border-correct:   var(--color-border-focus);
--color-form-control-border-disabled:  var(--color-border-subtle);
--color-form-control-text-default:     var(--color-text-secondary);
--color-form-control-text-placeholder: var(--color-text-placeholder);
--color-form-control-text-disabled:    var(--color-text-disabled);

/* Semantic: Text state */
--color-text-state-helper:  var(--color-text-secondary);
--color-text-state-correct: var(--color-blue-400);   /* Light: #1D6CEB */
--color-text-state-error:   var(--color-status-error);

/* [data-theme="dark"] */
--color-text-state-correct: var(--color-blue-dark-400);

/* Component alias: Input */
--input-default-bg:       var(--color-form-control-bg-default);
--input-disabled-bg:      var(--color-form-control-bg-disabled);
--input-readonly-bg:      var(--color-form-control-bg-disabled);
--input-default-border:   var(--color-form-control-border-default);
--input-focus-border:     var(--color-form-control-border-selected);
--input-error-border:     var(--color-form-control-border-error);
--input-correct-border:   var(--color-form-control-border-correct);
--input-disabled-border:  var(--color-form-control-border-disabled);
--input-readonly-border:  var(--color-form-control-border-disabled);
--input-placeholder-text: var(--color-form-control-text-placeholder);
--input-disabled-text:    var(--color-form-control-text-disabled);
--input-readonly-text:    var(--color-text-readonly);
--input-helper-text:      var(--color-text-state-helper);
--input-correct-text:     var(--color-text-state-correct);
--input-error-text:       var(--color-text-state-error);
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
| color/control/checkbox/border--default | `--checkbox-default-border` | `var(--color-control-border-default)` | 체크박스 기본 테두리 |
| color/control/checkbox/border--hover | `--checkbox-hover-border` | `var(--color-control-border-hover)` | 체크박스 hover 테두리 |
| color/control/checkbox/border--checked | `--checkbox-checked-border` | `var(--color-control-border-selected)` | 체크박스 체크 테두리 |
| color/control/checkbox/border--disabled | `--checkbox-disabled-border` | `var(--color-control-border-disabled)` | 체크박스 disabled 테두리 |
| color/control/checkbox/check-icon | `--checkbox-check-icon` | `var(--color-action-primary-text)` | 체크 마크 |
| color/control/radio/bg--default | `--radio-default-bg` | `var(--color-surface-default)` | 라디오 기본 배경 |
| color/control/radio/bg--disabled | `--radio-disabled-bg` | `var(--color-bg-subtle)` | 라디오 disabled 배경 |
| color/control/radio/border--default | `--radio-default-border` | `var(--color-control-border-default)` | 라디오 기본 테두리 |
| color/control/radio/border--hover | `--radio-hover-border` | `var(--color-control-border-hover)` | 라디오 hover 테두리 |
| color/control/radio/border--selected | `--radio-selected-border` | `var(--color-control-border-selected)` | 라디오 선택 테두리 |
| color/control/radio/border--disabled | `--radio-disabled-border` | `var(--color-control-border-disabled)` | 라디오 disabled 테두리 |
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
--checkbox-default-border:   var(--color-control-border-default);
--checkbox-hover-border:     var(--color-control-border-hover);
--checkbox-checked-border:   var(--color-control-border-selected);
--checkbox-disabled-border:  var(--color-control-border-disabled);
--checkbox-check-icon:       var(--color-action-primary-text);

/* Radio */
--radio-default-bg:      var(--color-surface-default);
--radio-disabled-bg:     var(--color-bg-subtle);
--radio-default-border:  var(--color-control-border-default);
--radio-hover-border:    var(--color-control-border-hover);
--radio-selected-border: var(--color-control-border-selected);
--radio-disabled-border: var(--color-control-border-disabled);
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

> **Figma 확인 (V3.0, 2026-07-08 · node 956:19066):** 선택 페이지 = bg 변화 없음, 텍스트 색만 변경 (#9D9D9D → #353535).
> hover 배경(`color/pagination/control/bg/hover`)·disabled 전용 bg/border/icon 토큰이 V3.0 원본에 정의됨 → 기존 assumed/candidate 해소.
> disabled 화살표 = 전용 토큰(bg #F5F5F5 / border #E9E9E9 / icon #C4C4C4) 기반. 기존 opacity:0.9 처리의 실제 CSS 제거는 3단계 구현 소관.

### 컨트롤 구조

- **화살표 컨트롤**: first(`<<`) / prev(`<`) / next(`>`) / last(`>>`) — 테두리 있음, 28×28px
- **페이지 번호**: default / selected — 테두리 없음, 텍스트 색으로만 구분

### 변수 정의

> **정본 참조:** 값은 `plugins/figma-vars-installer/src/vars-data.ts`(팔레트 매핑) + `assets/css/tokens.css`(라이트/다크 `--color-pagination-*`)가 정본. 컴포넌트는 `--pagination-*` 별칭(아래 "컴포넌트 소비 별칭")으로 소비한다. 아래 표는 그 정본을 미러링한다.

| Figma 원본 | CSS Variable (`--color-pagination-*`) | Light | Dark | 설명 | 상태 |
|---|---|---|---|---|---|
| color/pagination/control/bg/default | `--color-pagination-control-bg-default` | `base/white` #FFFFFF | `gray-dark/100` #1C1D23 | 화살표·번호 기본 배경 | stable |
| color/pagination/control/bg/hover | `--color-pagination-control-bg-hover` | `gray/50` #F5F5F5 | `gray-dark/200` #24252C | hover 배경 | stable |
| color/pagination/control/bg/disabled | `--color-pagination-control-bg-disabled` | `gray/50` #F5F5F5 | `gray-dark/300` #2E2F38 | disabled 화살표 배경 | stable |
| color/pagination/control/border/default | `--color-pagination-control-border-default` | `gray/200` #D9D9D9 | `gray-dark/500` #3E4049 | 화살표 버튼 테두리 (V3.0: #E9E9E9→#D9D9D9 교정) | stable |
| color/pagination/control/border/hover | `--color-pagination-control-border-hover` | `gray/200` #D9D9D9 | `gray-dark/500` #3E4049 | hover 테두리 | stable |
| color/pagination/control/border/disabled | `--color-pagination-control-border-disabled` | `gray/100` #E9E9E9 | `gray-dark/300` #2E2F38 | disabled 테두리 | stable |
| color/pagination/control/icon/default | `--color-pagination-control-icon-default` | `gray/800` #353535 | `gray-dark/800` #B8BABF | 화살표 아이콘 | stable |
| color/pagination/control/icon/hover | `--color-pagination-control-icon-hover` | `gray/800` #353535 | `gray-dark/800` #B8BABF | hover 아이콘 | stable |
| color/pagination/control/icon/selected | `--color-pagination-control-icon-selected` | `gray/800` #353535 | `gray-dark/800` #B8BABF | selected 아이콘 | stable |
| color/pagination/control/icon/disabled | `--color-pagination-control-icon-disabled` | `gray/300` #C4C4C4 | `gray-dark/600` #55575F | disabled 아이콘 | stable |
| color/pagination/number/default | `--color-pagination-number-default` | `gray/400` #9D9D9D | `gray-dark/600` #55575F | 비선택 번호 텍스트 (전용변수 매핑, 구 color/gray/400 직참조 정합) | stable |
| color/pagination/number/hover | `--color-pagination-number-hover` | `gray/400` #9D9D9D | `gray-dark/600` #55575F | hover 번호 텍스트 | stable |
| color/pagination/number/selected | `--color-pagination-number-selected` | `gray/800` #353535 | `gray-dark/800` #B8BABF | 선택 번호 텍스트 | stable |

> **삭제된 토큰 (2026-05-20):**
> `--pagination-active-bg` (action-primary-default) — Figma에 없음, 선택 페이지에 bg 변화 없음
> `--pagination-active-text` (action-primary-text) — Figma에 없음, 선택 페이지는 텍스트 색만 변경
>
> **V3.0 갱신 (2026-07-08):** disabled 화살표는 더 이상 "opacity만 · 별도 토큰 없음"이 아니다 —
> `color/pagination/control/bg|border|icon/disabled` 전용 토큰으로 대체됨(위 표). opacity 실제 제거는 3단계 구현 소관.

### CSS 구현

```css
/* Pagination — :root (light) */
--color-pagination-control-bg-default     : var(--color-base-white);  /* #FFFFFF */
--color-pagination-control-bg-hover       : var(--color-gray-50);      /* #F5F5F5 */
--color-pagination-control-bg-disabled    : var(--color-gray-50);      /* #F5F5F5 */
--color-pagination-control-border-default : var(--color-gray-200);     /* #D9D9D9 */
--color-pagination-control-border-hover   : var(--color-gray-200);     /* #D9D9D9 */
--color-pagination-control-border-disabled: var(--color-gray-100);     /* #E9E9E9 */
--color-pagination-control-icon-default   : var(--color-gray-800);     /* #353535 */
--color-pagination-control-icon-hover     : var(--color-gray-800);     /* #353535 */
--color-pagination-control-icon-selected  : var(--color-gray-800);     /* #353535 */
--color-pagination-control-icon-disabled  : var(--color-gray-300);     /* #C4C4C4 */
--color-pagination-number-default         : var(--color-gray-400);     /* #9D9D9D */
--color-pagination-number-hover           : var(--color-gray-400);     /* #9D9D9D */
--color-pagination-number-selected        : var(--color-gray-800);     /* #353535 */

/* [data-theme="dark"] */
--color-pagination-control-bg-default     : var(--color-gray-dark-100);  /* #1C1D23 */
--color-pagination-control-bg-hover       : var(--color-gray-dark-200);  /* #24252C */
--color-pagination-control-bg-disabled    : var(--color-gray-dark-300);  /* #2E2F38 */
--color-pagination-control-border-default : var(--color-gray-dark-500);  /* #3E4049 */
--color-pagination-control-border-hover   : var(--color-gray-dark-500);  /* #3E4049 */
--color-pagination-control-border-disabled: var(--color-gray-dark-300);  /* #2E2F38 */
--color-pagination-control-icon-default   : var(--color-gray-dark-800);  /* #B8BABF */
--color-pagination-control-icon-hover     : var(--color-gray-dark-800);  /* #B8BABF */
--color-pagination-control-icon-selected  : var(--color-gray-dark-800);  /* #B8BABF */
--color-pagination-control-icon-disabled  : var(--color-gray-dark-600);  /* #55575F */
--color-pagination-number-default         : var(--color-gray-dark-600);  /* #55575F */
--color-pagination-number-hover           : var(--color-gray-dark-600);  /* #55575F */
--color-pagination-number-selected        : var(--color-gray-dark-800);  /* #B8BABF */

/* 컴포넌트 소비 별칭 (components-new.html) */
--pagination-control-bg:            var(--color-pagination-control-bg-default);
--pagination-control-border:        var(--color-pagination-control-border-default);
--pagination-control-hover-bg:      var(--color-pagination-control-bg-hover);
--pagination-arrow-disabled-bg:     var(--color-pagination-control-bg-disabled);
--pagination-arrow-disabled-border: var(--color-pagination-control-border-disabled);
--pagination-arrow-disabled-color:  var(--color-pagination-control-icon-disabled);
--pagination-number-text:           var(--color-pagination-number-default);
--pagination-number-text-hover:     var(--color-pagination-number-hover);
--pagination-number-text-selected:  var(--color-pagination-number-selected);
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
| color/navigation/indicator/default | `--nav-item-indicator-default` | `var(--color-border-subtle)` | 비선택 항목 인디케이터 |

### CSS 구현

```css
/* Navigation */
--nav-bg:                      var(--color-surface-default);
--nav-item-hover-bg:           var(--color-bg-subtle);
--nav-item-active-bg:          var(--color-action-primary-subtle);
--nav-item-default-text:       var(--color-text-tertiary);
--nav-item-active-text:        var(--color-action-primary-default);
--nav-item-default-icon:       var(--color-icon-default);
--nav-item-active-icon:        var(--color-action-primary-default);
--nav-item-indicator:          var(--color-action-primary-default);
--nav-item-indicator-default:  var(--color-border-subtle);
--nav-divider:                 var(--color-border-subtle);
```

---

## 8. Table / Data Grid

> Figma node: `pc_table_header` (540:4940) · `pc_table_body` (540:4851)
> 확인 일시: 2026-05-20 — MCP get_design_context 직접 조회

### 변수 정의

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| surface/neutral/bg/base-alt | `--table-header-bg` | `var(--color-bg-default)` | 헤더 기본 배경 (#FAFAFA) |
| surface/neutral/bg/subtle | `--table-header-hover-bg` | `var(--color-bg-subtle)` | 헤더 hover 배경 (#F5F5F5) |
| color/text/title/secondary | `--table-header-text` | `var(--color-text-secondary)` | 헤더 텍스트 (#353535) |
| color/data/border/light  | `--table-border-light`   | `var(--color-border-subtle)`  | 행 구분선 기준 토큰 (#E9E9E9) |
| color/data/border/strong | `--table-border-strong`  | `var(--color-border-default)` | 열·외곽 강조 구분선 (#D9D9D9) |
| color/data/border/light  | `--table-header-border`  | `var(--table-border-light)`   | 헤더 하단 테두리 |
| color/data/state/default | `--table-row-default-bg` | `var(--color-surface-default)` | 행 기본 배경 (#FFFFFF) |
| color/data/state/hover   | `--table-row-hover-bg`   | `var(--color-data-state-hover)` | 행 hover 배경 (#E2F1FF — blue-50) |
| —                        | `--table-row-selected-bg`| `var(--color-bg-selected)`    | 행 선택 배경 (candidate — HD-Table-2) |
| color/data/border/light  | `--table-cell-border`    | `var(--table-border-light)`   | 셀 하단 테두리 |
| color/text/body/primary  | `--table-cell-text`      | `var(--color-text-secondary)` | 셀 본문 텍스트 (#353535) |

### Figma 확인 변수 정보

| Figma 변수 경로 | 값 (Light) | 비고 |
|---|---|---|
| `surface/neutral/bg/base-alt` | #FAFAFA (gray-0) | 헤더 default bg |
| `surface/neutral/bg/subtle` | #F5F5F5 (gray-50) | 헤더 hover bg |
| `color/data/border/light` | #E9E9E9 (gray-100) | 헤더·셀 border |
| `color/data/state/default` | #FFFFFF (white) | 행 default bg |
| `color/data/state/hover` | #E2F1FF (blue-50) | 행 hover bg |
| `color/text/title/secondary` | #353535 (gray-800) | 헤더 텍스트 |
| `color/text/body/primary` | #353535 (gray-800) | 셀 본문 텍스트 |

### Figma 컴포넌트 Variant 구조

**pc_table_header (헤더 셀)**
- size: md(h44) / sm(h38)
- position: middle / last
- align: center / left
- state: default / hover
- icon: on(정렬 아이콘 포함) / off
- check box: on(체크박스 컬럼) / off

**pc_table_body (바디 셀)**
- size: md(h44) / sm(h38)
- position: middle / last
- align: center / left
- state: default / hover

**Sizing**
- 행 높이 md: 44px (`--sizing-table-row-height-md`)
- 행 높이 sm: 38px (`--sizing-table-row-height-sm`)
- 패딩 좌: 12px (`--spacing-padding-inline-xs`)
- 패딩 우(last column): 16px (`--spacing-padding-inline-sm`)
- 폰트: Pretendard Medium 14px (헤더), Regular 14px (바디)

### CSS 구현

```css
/* Table / Data Grid */
--table-header-bg:        var(--color-bg-default);       /* #FAFAFA */
--table-header-hover-bg:  var(--color-bg-subtle);        /* #F5F5F5 */
--table-header-text:      var(--color-text-secondary);   /* #353535 */
--table-header-border:    var(--color-border-subtle);    /* #E9E9E9 */
--table-row-default-bg:   var(--color-surface-default);  /* #FFFFFF */
--table-row-hover-bg:     var(--color-data-state-hover);  /* #E2F1FF — Figma: color/data/state/hover = blue-50 */
--table-row-selected-bg:  var(--color-bg-selected);      /* #E2F1FF — candidate */
--table-cell-border:      var(--color-border-subtle);    /* #E9E9E9 */
--table-cell-text:        var(--color-text-secondary);   /* #353535 */
```

### Human Decisions (미결)

| ID | 항목 | 내용 |
|---|---|---|
| HD-Table-1 | dark row hover | `--color-data-state-hover` dark값 = `var(--color-blue-dark-100)` (#112B55) candidate — Figma 확인 필요 |
| HD-Table-2 | selected ≠ hover | 현재 `--table-row-selected-bg` = blue-50 = hover와 동일. 선택 행은 더 강한 시각 처리 필요 여부 결정 |

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

## 10. TimePicker

> **Figma 확인 (2026-05-20):** 5개 Figma COMPONENT_SET 확인 (MVP-F1).
> **색상 토큰 100% `--color-form-control-*` Semantic 재사용.** 전용 색상 토큰 없음.
> **신규 Semantic 2개:** `--color-form-control-label-default/disabled` — timepicker_select "시"/"분" 라벨 전용.

### 컴포넌트 구조

| variant | Figma 노드 | 설명 | PC/Mobile |
|---|---|---|---|
| `timepicker_input` | `540:3690` | 단일 인풋 + 클릭 시 드롭다운 패널 | PC(md/xsm/xxsm) + Mobile |
| `timepicker_select` | `540:3636` | 시/분 분리 셀렉트 2개 | PC only (md/sm) |
| `pc_timepicker_input_dropdown` | `540:3506` | 드롭다운 패널 (24h/12h) | PC only |

### 사이즈

| platform | height | font-size |
|---|---|---|
| mobile | `var(--sizing-form-control-height-lg)` 48px | 14px |
| pc-md | `var(--sizing-form-control-height-md)` 44px | 14px |
| pc-xsm | `var(--sizing-form-control-height-xs)` 34px | 14px |
| pc-xxsm | `var(--sizing-form-control-height-xxs)` 28px | **12px** |

### Figma State → Code Canonical 매핑

| Figma state | Code canonical | token-aliases.json |
|---|---|---|
| `selected` | `focus` | ✅ 기존 |
| `completed` | `filled` | ✅ 기존 |
| `editing` (timepicker_select) | `focus` | ✅ 2026-05-20 추가 |

### 변수 정의 — 공유 Semantic (form-control 재사용)

| Figma Variable | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/form-control/bg/default | `--color-form-control-bg-default` | `var(--color-surface-default)` | 기본 배경 |
| color/form-control/bg/disabled | `--color-form-control-bg-disabled` | `var(--color-bg-subtle)` | disabled 배경 |
| color/form-control/border/default | `--color-form-control-border-default` | `var(--color-control-border-default)` | 기본 테두리 |
| color/form-control/border/selected | `--color-form-control-border-selected` | `var(--color-border-focus)` | focus 테두리 |
| color/form-control/border/disabled | `--color-form-control-border-disabled` | `var(--color-border-subtle)` | disabled 테두리 |
| color/form-control/text/placeholder | `--color-form-control-text-placeholder` | `var(--color-text-placeholder)` | placeholder 텍스트 |
| color/form-control/text/default | `--color-form-control-text-default` | `var(--color-text-secondary)` | 입력값 텍스트 |
| color/form-control/text/disabled | `--color-form-control-text-disabled` | `var(--color-text-disabled)` | disabled 텍스트 |

### 변수 정의 — 신규 Semantic (2026-05-20)

| Figma Variable | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/form-control/label/default | `--color-form-control-label-default` | `var(--color-text-secondary)` | "시"/"분" 라벨 기본 색상 |
| color/form-control/label/disabled | `--color-form-control-label-disabled` | `var(--color-text-disabled)` | "시"/"분" 라벨 disabled 색상 |

### CSS 구현

```css
/* TimePicker — form-control 100% 재사용 */
/* 신규 semantic (TimePicker select 라벨용) */
--color-form-control-label-default:  var(--color-text-secondary);  /* #353535 */
--color-form-control-label-disabled: var(--color-text-disabled);   /* #BDBDBD */
```

### 미결 사항 (Human Decision)

| ID | 내용 |
|---|---|
| HD-Time-1 | `timepicker_input` disabled suffix icon 교체 (ic_시계 → ic_알람) — 의도인지 Figma 실수인지 |
| HD-Time-4 | Mobile 인터랙션 방식 (bottom sheet vs inline vs dropdown) |
| HD-Time-5 | 드롭다운 패널 shadow `rgba(0,0,0,0.15)` — token 처리 vs DatePicker 예외 패턴 동일 적용 |

---

## 11. Line Tab (Navigation 카테고리)

> 2026-05-28 신설 (Figma 540:6032). Semantic 카테고리 `color-navigation`(semantic.md ## 8-3) 위에 정의된 Component alias.
> Dark 값은 candidate — Figma dark 시각 검증 후 확정 예정.

### Semantic 레이어 (color-navigation-*)

| CSS Variable | 참조 | 설명 |
|---|---|---|
| `--color-navigation-bg` | `var(--color-surface-default)` | 라인탭 컨테이너 배경 |
| `--color-navigation-label-default` | `var(--color-gray-600)` | 미선택 라벨 텍스트 |
| `--color-navigation-label-selected` | `var(--color-action-primary-default)` | 선택 라벨 텍스트 |
| `--color-navigation-indicator-default` | `var(--color-gray-200)` | 탭 하단 구분선 (비선택) |
| `--color-navigation-indicator-selected` | `var(--color-action-primary-default)` | 선택 탭 하단 indicator |

### Component alias (--tab-*)

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/navigation/bg | `--tab-bg` | `var(--color-navigation-bg)` | 라인탭 배경 |
| color/navigation/label/default | `--tab-label-default` | `var(--color-navigation-label-default)` | 미선택 라벨 |
| color/navigation/label/selected | `--tab-label-selected` | `var(--color-navigation-label-selected)` | 선택 라벨 |
| color/navigation/indicator/default | `--tab-indicator-default` | `var(--color-navigation-indicator-default)` | 비선택 indicator |
| color/navigation/indicator/selected | `--tab-indicator-selected` | `var(--color-navigation-indicator-selected)` | 선택 indicator (2px line) |

### CSS 구현

```css
/* Semantic: Navigation */
--color-navigation-bg:                 var(--color-surface-default);
--color-navigation-label-default:      var(--color-gray-600);
--color-navigation-label-selected:     var(--color-action-primary-default);
--color-navigation-indicator-default:  var(--color-gray-200);
--color-navigation-indicator-selected: var(--color-action-primary-default);

/* [data-theme="dark"] (candidate — 시각 검증 필요) */
--color-navigation-bg:                 var(--color-surface-default);  /* gray-dark-100 */
--color-navigation-label-default:      var(--color-gray-dark-600);    /* #55575F */
--color-navigation-label-selected:     var(--color-action-primary-default);  /* blue-dark-300 */
--color-navigation-indicator-default:  var(--color-gray-dark-300);    /* #2E2F38 */
--color-navigation-indicator-selected: var(--color-action-primary-default);  /* blue-dark-300 */

/* Component alias: Line Tab */
--tab-bg:                 var(--color-navigation-bg);
--tab-label-default:      var(--color-navigation-label-default);
--tab-label-selected:     var(--color-navigation-label-selected);
--tab-indicator-default:  var(--color-navigation-indicator-default);
--tab-indicator-selected: var(--color-navigation-indicator-selected);
```

> **주의**: `## 7. Navigation (GNB / LNB)`의 `--nav-*` 토큰과 별개. LNB/GNB는 사이드바·헤더 네비게이션 컴포넌트 전용, Line Tab은 본문 내 탭 전용.

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

> **원칙**: Foundation(Foundation) 직접 참조 금지.
> 반드시 Semantic Token을 경유합니다.

---

## Figma 작업 체크리스트

- [ ] `semantic` 컬렉션에서 위 9개 그룹을 `component` 컬렉션으로 이동
- [ ] `color/status-card/text/*--defualt` → `--default` 오타 3건 수정
- [ ] 각 Component Token이 Semantic Token을 올바르게 alias하는지 검증
- [ ] `color/dropdown/list/bg` → `surface/raised` 참조로 업데이트
- [ ] `border/disabled-alt1`, `border/disabled-alt2` → Component 레이어에서 `--input-disabled-border` / `--select-disabled-border`로 분리
- [ ] `color/status-card/*` → Domain Token 컬렉션 이동 여부 확정
