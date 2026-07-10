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
| default | — | — | — | — |

### Chip

| variant | default | hover | selected | complete | disabled |
| --- | --- | --- | --- | --- | --- |
| line | — | — | — | — | — |
| solid | — | — | — | — | — |
| filter | — | — | — | — | — |

### DatePicker

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| default | — | — | — | — |

### Dropdown

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| default | — | — | — | — |

### GNB

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| menuSlot | — | — | — | — |
| bar | — | — | — | — |

### Input

| variant | default | focus | filled | error | correct | disabled |
| --- | --- | --- | --- | --- | --- | --- |
| default | — | — | — | — | — | — |

### Modal

| variant | default | hover | pressed | disabled |
| --- | --- | --- | --- | --- |
| default | — | — | — | — |

### Navigation

| variant | default | hover | active | disabled |
| --- | --- | --- | --- | --- |
| default | — | — | — | — |

### Pagination

| variant | default | hover | selected | disabled |
| --- | --- | --- | --- | --- |
| arrow | — | — | — | — |
| number | — | — | — | — |

### Radio

| variant | default | hover | selected | disabled |
| --- | --- | --- | --- | --- |
| default | — | — | — | — |

### Select

| variant | default | hover | open | filled | disabled |
| --- | --- | --- | --- | --- | --- |
| default | — | — | — | — | — |

### Line Tab

| variant | unselected | selected | hover | pressed |
| --- | --- | --- | --- | --- |
| size | — | — | — | — |

### Table

| variant | default | hover | selected |
| --- | --- | --- | --- |
| header | — | — | — |
| body | — | — | — |

### Textarea

| variant | default | focus | error | correct | disabled | readonly |
| --- | --- | --- | --- | --- | --- | --- |
| default | — | — | — | — | — | — |

### TimePicker

| variant | default | focus | filled | disabled |
| --- | --- | --- | --- | --- |
| input | — | — | — | — |
| select | — | — | — | — |
| dropdown_panel | — | — | — | — |

### Toggle

| variant | on | off | disabled |
| --- | --- | --- | --- |
| default | — | — | — |

<!-- generated-stamp: 44f9e2399186 · 손편집 금지 -->
