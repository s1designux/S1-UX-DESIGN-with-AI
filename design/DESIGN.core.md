---
version: 1.0.0
name: S1 Design System
scope: core
description: 디자인시스템 소비용 단일 컨텍스트(자동 생성 · 정본=tokens.css+registry)
colors:
  color-brand-blue: "#0072CE"
  color-brand-red: "#FF312C"
  color-brand-gray: "#DFDEDE"
  color-brand-ci: "#004097"
  color-gray-0: "#FAFAFA"
  color-gray-50: "#F5F5F5"
  color-gray-100: "#E9E9E9"
  color-gray-200: "#D9D9D9"
  color-gray-300: "#C4C4C4"
  color-gray-400: "#9D9D9D"
  color-gray-500: "#757575"
  color-gray-600: "#555555"
  color-gray-700: "#434343"
  color-gray-800: "#353535"
  color-gray-900: "#202020"
spacing:
  spacing-2: "2px"
  spacing-4: "4px"
  spacing-6: "6px"
  spacing-8: "8px"
  spacing-10: "10px"
  spacing-12: "12px"
  spacing-14: "14px"
  spacing-16: "16px"
  spacing-20: "20px"
  spacing-24: "24px"
  spacing-28: "28px"
  spacing-32: "32px"
  spacing-36: "36px"
  spacing-40: "40px"
  spacing-44: "44px"
  spacing-48: "48px"
  spacing-56: "56px"
  spacing-64: "64px"
  spacing-80: "80px"
  spacing-96: "96px"
  spacing-128: "128px"
radius:
  radius-0: "0px"
  radius-2: "2px"
  radius-4: "4px"
  radius-6: "6px"
  radius-8: "8px"
  radius-10: "10px"
  radius-12: "12px"
  radius-16: "16px"
  radius-20: "20px"
  radius-full: "9999px"
  radius-control-xs: "var(--radius-2)"
  radius-control-sm: "var(--radius-4)"
  radius-button-md: "var(--radius-4)"
  radius-card-md: "var(--radius-10)"
  radius-modal-md: "var(--radius-8)"
typography:
  fontSize:
    font-size-10: "10px"
    font-size-12: "12px"
    font-size-14: "14px"
    font-size-16: "16px"
    font-size-18: "18px"
    font-size-20: "20px"
    font-size-24: "24px"
    font-size-32: "32px"
  fontWeight:
    font-weight-regular: "400"
    font-weight-medium: "500"
    font-weight-bold: "700"
---

# S1 Design System — Core

> ⚠️ 이 파일은 자동 생성물입니다. 손으로 고치지 마세요. 정본은 `assets/css/tokens.css` + `registry/components/*.json` 이며, `npm run design:md:write` 로 재생성됩니다.

## Profiles

> 소비자(역할·플랫폼·테마)별 적용 프로파일. 해석 순서는 `design.manifest.json` 의 resolutionOrder 참조.

### role
- **admin** — 밀도: `compact` (관리자 — 고밀도(정보 우선))
- **user** — 밀도: `comfortable` (일반 사용자 — 여유 밀도(가독성 우선))

### platform
- **web** — 컨테이너: `1200px`, 컬럼: `12`
- **app** — 컨테이너: `1024px`, 컬럼: `8`
- **mobile** — 컨테이너: `375px`, 컬럼: `4`

### theme
- `light` / `dark`

## Components

### Button

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| primary | --button-primary-default-bg<br>--button-primary-default-text<br>--button-primary-default-icon | --button-primary-hover-bg | --button-primary-pressed-bg | --button-primary-disabled-bg<br>--button-primary-disabled-border<br>--button-primary-disabled-text |
| secondary | --button-secondary-default-bg<br>--button-secondary-default-border<br>--button-secondary-default-text<br>--button-secondary-default-icon | --button-secondary-hover-bg | --button-secondary-pressed-bg | --button-secondary-disabled-bg<br>--button-secondary-disabled-border<br>--button-secondary-disabled-text<br>--button-secondary-disabled-icon |
| blue-line | --button-blue-line-default-bg<br>--button-blue-line-default-border<br>--button-blue-line-default-text | --button-blue-line-hover-bg<br>--button-blue-line-hover-border | --button-blue-line-pressed-bg | --button-blue-line-disabled-bg<br>--button-blue-line-disabled-border<br>--button-blue-line-disabled-text |

### Checkbox

| variant | default | hover | checked | disabled |
| --- | --- | --- | --- | --- |
| default | --checkbox-default-bg → color-control-bg-default<br>--checkbox-default-border → color-control-border-default | --checkbox-hover-bg → color-control-bg-hover<br>--checkbox-hover-border → color-control-border-default | --checkbox-checked-bg → color-control-bg-selected<br>--checkbox-checked-border → color-control-border-selected<br>--checkbox-check-icon → color-control-indicator-selected | --checkbox-disabled-bg → color-control-bg-disabled<br>--checkbox-disabled-border → color-control-border-disabled<br>--checkbox-disabled-check-icon → color-control-indicator-disabled |

### Chip

| variant | default | hover | selected | complete | disabled |
| --- | --- | --- | --- | --- | --- |
| line | --chip-line-default-bg → color-chip-line-bg-default<br>--chip-line-default-border → color-chip-line-border-default<br>--chip-line-default-text → color-chip-line-label-default<br>--chip-line-default-icon → color-chip-line-label-default<br>--chip-line-default-close-icon → color-chip-line-label-default | --chip-line-hover-bg → color-chip-line-bg-hover<br>--chip-line-hover-border → color-chip-line-border-default<br>--chip-line-hover-close-icon → color-chip-line-label-default | --chip-line-selected-bg → color-chip-line-bg-selected<br>--chip-line-selected-border → color-chip-line-border-selected<br>--chip-line-selected-text → color-chip-line-label-selected<br>--chip-line-selected-icon → color-chip-line-label-selected<br>--chip-line-selected-close-icon → color-chip-line-label-selected | — | --chip-line-disabled-bg → color-chip-line-bg-disabled<br>--chip-line-disabled-border → color-chip-line-border-disabled<br>--chip-line-disabled-text → color-chip-line-label-disabled<br>--chip-line-disabled-icon → color-chip-line-label-disabled |
| solid | --chip-solid-default-bg → color-chip-solid-bg-default<br>--chip-solid-default-border → color-chip-solid-border-default<br>--chip-solid-default-text → color-chip-solid-label-default<br>--chip-solid-default-icon → color-chip-solid-label-default<br>--chip-solid-default-close-icon → color-chip-solid-label-default | --chip-solid-hover-bg → color-chip-solid-bg-hover<br>--chip-solid-hover-border → color-chip-solid-bg-hover<br>--chip-solid-hover-close-icon → color-chip-solid-label-default | --chip-solid-selected-bg → color-chip-solid-bg-selected<br>--chip-solid-selected-border → color-chip-solid-border-selected<br>--chip-solid-selected-text → color-chip-solid-label-selected<br>--chip-solid-selected-icon → color-chip-solid-label-selected<br>--chip-solid-selected-close-icon → color-chip-solid-label-selected | — | --chip-solid-disabled-bg → color-chip-solid-bg-disabled<br>--chip-solid-disabled-border → color-chip-solid-border-disabled<br>--chip-solid-disabled-text → color-chip-solid-label-disabled<br>--chip-solid-disabled-icon → color-chip-solid-label-disabled |
| filter | — | — | — | — | — |

### DatePicker

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| default | --input-default-bg<br>--input-default-border | --date-picker-cell-hover-bg → color-bg-subtle<br>--date-picker-nav-hover-bg → color-bg-subtle | — | --input-disabled-bg<br>--input-disabled-border<br>--input-disabled-text<br>--date-picker-cell-disabled-text → color-text-disabled |

### Dropdown

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| default | --dropdown-trigger-default-bg → color-surface-default<br>--dropdown-trigger-default-border → color-form-control-border-default<br>--dropdown-trigger-default-text → color-text-secondary<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default | --dropdown-trigger-hover-bg → color-bg-subtle<br>--dropdown-trigger-hover-border → color-border-strong<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default<br>--dropdown-option-hover-bg → color-bg-subtle | --dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default | --dropdown-trigger-disabled-bg → color-bg-subtle<br>--dropdown-trigger-disabled-border → color-border-subtle<br>--dropdown-trigger-disabled-text → color-text-disabled<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default |

### GNB

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| menuSlot | --gnb-menu-label-default → color-navigation-label-default-alt | — | — | — |
| bar | --gnb-menu-label-default → color-navigation-label-default-alt | — | — | — |

### Input

| variant | default | focus | filled | error | correct | disabled |
| --- | --- | --- | --- | --- | --- | --- |
| default | --color-form-control-bg-default → color-surface-default<br>--color-form-control-border-default → color-border-default<br>--color-form-control-text-default → color-text-secondary | — | — | --color-form-control-border-error → color-status-error<br>--color-text-state-error → color-status-error | --color-form-control-border-correct → color-border-focus<br>--color-text-state-correct | --color-form-control-bg-disabled → color-bg-subtle<br>--color-form-control-border-disabled → color-border-subtle<br>--color-form-control-text-disabled → color-text-disabled |

### Modal

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| default | — | — | — | — |

### Navigation

| variant | default | hover | active | disabled |
| --- | --- | --- | --- | --- |
| default | --nav-bg → color-surface-default<br>--nav-item-default-text → color-text-tertiary<br>--nav-item-default-icon → color-icon-default<br>--nav-item-indicator-default → color-border-subtle<br>--nav-divider → color-border-subtle | --nav-bg → color-surface-default<br>--nav-item-hover-bg → color-bg-subtle<br>--nav-divider → color-border-subtle | --nav-bg → color-surface-default<br>--nav-item-active-bg → color-action-primary-subtle<br>--nav-item-active-text → color-action-primary-default<br>--nav-item-active-icon → color-action-primary-default<br>--nav-item-indicator → color-action-primary-default<br>--nav-divider → color-border-subtle | --nav-bg → color-surface-default<br>--nav-divider → color-border-subtle |

### Pagination

| variant | default | hover | selected | disabled |
| --- | --- | --- | --- | --- |
| arrow | — | --pagination-control-hover-bg → color-bg-subtle | — | — |
| number | — | --pagination-control-hover-bg → color-bg-subtle | --pagination-number-text-selected → color-text-secondary | — |

### Radio

| variant | default | hover | selected | disabled |
| --- | --- | --- | --- | --- |
| default | --radio-default-bg → color-control-bg-default<br>--radio-default-border → color-control-border-default | --radio-hover-bg → color-control-bg-hover<br>--radio-hover-border → color-control-border-default | --radio-selected-border → color-control-border-selected<br>--radio-selected-dot → color-control-indicator-selected-alt | --radio-disabled-bg → color-control-bg-disabled<br>--radio-disabled-border → color-control-border-disabled<br>--radio-disabled-dot → color-control-indicator-disabled |

### Select

| variant | default | hover | open | filled | disabled |
| --- | --- | --- | --- | --- | --- |
| default | --dropdown-trigger-default-bg → color-surface-default<br>--dropdown-trigger-default-border → color-form-control-border-default<br>--dropdown-trigger-default-text → color-text-secondary<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default | --dropdown-trigger-hover-bg → color-bg-subtle<br>--dropdown-trigger-hover-border → color-border-strong<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default<br>--dropdown-option-hover-bg → color-bg-subtle | --dropdown-trigger-open-bg → color-bg-subtle<br>--dropdown-trigger-open-border → color-border-focus<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default | --dropdown-trigger-selected-text → color-text-primary<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default | --dropdown-trigger-disabled-bg → color-bg-subtle<br>--dropdown-trigger-disabled-border → color-border-subtle<br>--dropdown-trigger-disabled-text → color-text-disabled<br>--dropdown-list-bg → color-surface-raised<br>--dropdown-list-border → color-border-default |

### Line Tab

| variant | unselected | selected | hover | pressed |
| --- | --- | --- | --- | --- |
| size | — | --tab-label-selected → color-navigation-label-selected<br>--tab-indicator-selected → color-navigation-indicator-selected | — | — |

### Table

| variant | default | hover | selected |
| --- | --- | --- | --- |
| header | --table-row-default-bg → color-table-cell-default | --table-row-hover-bg → color-table-cell-hover | --table-row-selected-bg → color-table-cell-selected |
| body | --table-row-default-bg → color-table-cell-default | --table-row-hover-bg → color-table-cell-hover | --table-row-selected-bg → color-table-cell-selected |

### Textarea

| variant | default | focus | error | correct | disabled | readonly |
| --- | --- | --- | --- | --- | --- | --- |
| default | --input-default-bg → color-form-control-bg-default<br>--input-default-border → color-form-control-border-default<br>--input-placeholder-text → color-form-control-text-placeholder<br>--input-helper-text → color-text-state-helper | --input-focus-border → color-form-control-border-selected<br>--input-placeholder-text → color-form-control-text-placeholder | --input-error-border → color-form-control-border-error<br>--input-placeholder-text → color-form-control-text-placeholder<br>--input-error-text → color-text-state-error | --input-correct-border → color-form-control-border-correct<br>--input-placeholder-text → color-form-control-text-placeholder<br>--input-correct-text → color-text-state-correct | --input-disabled-bg → color-form-control-bg-disabled<br>--input-disabled-border → color-form-control-border-disabled<br>--input-placeholder-text → color-form-control-text-placeholder<br>--input-disabled-text → color-form-control-text-disabled | --input-readonly-bg → color-form-control-bg-disabled<br>--input-readonly-border → color-form-control-border-disabled<br>--input-placeholder-text → color-form-control-text-placeholder<br>--input-readonly-text → color-text-readonly |

### TimePicker

| variant | default | focus | filled | disabled |
| --- | --- | --- | --- | --- |
| input | --color-form-control-bg-default → color-surface-default<br>--color-form-control-border-default → color-control-border-default<br>--color-form-control-text-default → color-text-secondary<br>--color-form-control-label-default → color-text-secondary | — | — | --color-form-control-bg-disabled → color-bg-subtle<br>--color-form-control-border-disabled → color-border-subtle<br>--color-form-control-text-disabled → color-text-disabled<br>--color-form-control-label-disabled → color-text-disabled |
| select | --color-form-control-bg-default → color-surface-default<br>--color-form-control-border-default → color-control-border-default<br>--color-form-control-text-default → color-text-secondary<br>--color-form-control-label-default → color-text-secondary | — | — | --color-form-control-bg-disabled → color-bg-subtle<br>--color-form-control-border-disabled → color-border-subtle<br>--color-form-control-text-disabled → color-text-disabled<br>--color-form-control-label-disabled → color-text-disabled |
| dropdown_panel | --color-form-control-bg-default → color-surface-default<br>--color-form-control-border-default → color-control-border-default<br>--color-form-control-text-default → color-text-secondary<br>--color-form-control-label-default → color-text-secondary | — | — | --color-form-control-bg-disabled → color-bg-subtle<br>--color-form-control-border-disabled → color-border-subtle<br>--color-form-control-text-disabled → color-text-disabled<br>--color-form-control-label-disabled → color-text-disabled |

### Toggle

| variant | on | off | disabled |
| --- | --- | --- | --- |
| default | --toggle-on-bg → color-control-bg-selected<br>--toggle-knob → color-control-indicator-selected | --toggle-off-bg → color-control-indicator-unselected<br>--toggle-knob → color-control-indicator-selected | --toggle-disabled-bg → color-control-bg-disabled<br>--toggle-knob → color-control-indicator-selected |

<!-- generated-stamp: ca9468f2a971 · 손편집 금지 -->
