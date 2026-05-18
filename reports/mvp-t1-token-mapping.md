# MVP-T1 Figma CSS Token Mapping

**Date:** 2026-05-18  
**Status:** Draft  
**Phase:** MVP-T1

---

## Scope

CSS 토큰과 Figma Variables가 서로 다른 이름을 사용하더라도 같은 의미로 연결될 수 있는 매핑 기준을 구축한다.

이 매핑 registry는 이후 다음 기능의 기반이 된다:
- Code Token → Figma Variables Sync Plugin
- Figma Design Guard Plugin
- Figma 작업물 Variable 사용 여부 검수
- Source Guard와 Figma Guard 기준 통합

---

## Sources Reviewed

| 파일 | 상태 |
|---|---|
| `registry/tokens/component.tokens.json` | ✅ 읽음 |
| `registry/tokens/semantic.colors.json` | ✅ 읽음 |
| `registry/components/input.json` | ✅ 읽음 |
| `registry/components/date-picker.json` | ✅ 읽음 |
| `registry/components/select.json` | ✅ 읽음 (skeleton) |
| `registry/figma/figma-map.json` | ✅ 읽음 |
| `reports/pre-mvp4-input-classification.md` | ✅ 읽음 |
| `assets/css/tokens.css` (form-control 섹션) | ✅ grep으로 확인 |
| Figma MCP — node 540:7663 (foundation collection) | ✅ 조회 |
| Figma MCP — node 540:3794 (datepicker_input) | ✅ 조회 — form-control variables 확인 |
| Figma MCP — node 540:4501 (button primary) | ✅ 조회 — button variables 확인 |
| Figma MCP — node 540:3836 (mobile bottomsheet) | ✅ 조회 — control/text/state variables 확인 |
| `registry/components/time-picker.json` | ❌ 없음 (MVP5 예정) |
| `reports/mvp4-input-implementation.md` | ❌ 없음 |

---

## Token Mapping Strategy

1. **Code registry is source of truth.** Figma Variable 이름과 CSS 토큰 이름이 달라도 무방하다.
2. **의미 기반 매핑.** 이름 동일성이 아닌 용도/역할로 연결한다.
3. **form-control semantic이 공통 기준.** Input, Select, DatePicker, TimePicker는 모두 `--color-form-control-*` semantic을 공유한다.
4. **Component token은 alias.** `--input-*`는 form-control semantic을 참조하는 component-level alias다.
5. **Figma Variable 미확인 항목은 pending 유지.** MCP 조회 결과 없으면 임의 확정 금지.

---

## Created

- `registry/tokens/figma-css-token-map.json` — Figma Variable ↔ CSS Token 의미 기반 연결표
- `registry/tokens/token-aliases.json` — state alias / token alias 정의
- `registry/tokens/deprecated-tokens.json` — 삭제/교체 토큰 기록

## Updated

- `registry/index.json` — 신규 파일 경로 3개 추가 (`figmaCssTokenMap`, `tokenAliases`, `deprecatedTokens`)
- `registry/figma/figma-map.json` — `_meta`에 token map 경로 3개 추가
- `README.md` — MVP-T1 섹션 추가 (한글 설명 포함)
- `CLAUDE.md` — 변경 이력 + MVP-T1 Token Mapping Rules 12개 추가

---

## Form-control Mapping Summary

| Meaning | Figma Variable | CSS Variable | Figma Value | Status |
|---|---|---|---|---|
| Form control default bg | `color/form-control/bg/default` | `--color-form-control-bg-default` | #ffffff | stable |
| Form control disabled bg | `color/form-control/bg/disabled` | `--color-form-control-bg-disabled` | #f5f5f5 | stable |
| Form control default border | `color/form-control/border/default` | `--color-form-control-border-default` | #d9d9d9 | stable |
| Form control focus/selected border | `color/form-control/border/selected` | `--color-form-control-border-selected` | #1d6ceb | stable |
| Form control error border | `color/form-control/border/error` | `--color-form-control-border-error` | #e50533 (inferred) | pending |
| Form control correct/success border | `color/form-control/border/selected` | `--color-form-control-border-correct` | #1d6ceb | stable |
| Form control disabled border | `color/form-control/border/disabled` | `--color-form-control-border-disabled` | #d9d9d9 | stable |
| Form control typed text | `color/form-control/text/default` | `--color-form-control-text-default` | #353535 | stable (value mismatch w/ CSS — needs-review) |
| Form control placeholder | `color/form-control/text/placeholder` | `--color-form-control-text-placeholder` | #757575 | needs-review |
| Form control disabled text | `color/form-control/text/disabled` | `--color-form-control-text-disabled` | #c4c4c4 | stable |

---

## Input Alias Mapping Summary

| Meaning | Figma Variable | CSS Alias | Semantic Variable | Status |
|---|---|---|---|---|
| Input default bg | `color/form-control/bg/default` | `--input-default-bg` | `--color-form-control-bg-default` | stable |
| Input disabled bg | `color/form-control/bg/disabled` | `--input-disabled-bg` | `--color-form-control-bg-disabled` | stable |
| Input default border | `color/form-control/border/default` | `--input-default-border` | `--color-form-control-border-default` | stable |
| Input focus border | `color/form-control/border/selected` | `--input-focus-border` | `--color-form-control-border-selected` | stable |
| Input error border | `color/form-control/border/error` | `--input-error-border` | `--color-form-control-border-error` | pending |
| Input success border | `color/form-control/border/selected` | `--input-correct-border` → `--input-success-border` | `--color-form-control-border-correct` | stable (rename pending) |
| Input disabled border | `color/form-control/border/disabled` | `--input-disabled-border` | `--color-form-control-border-disabled` | stable |
| Input placeholder text | `color/form-control/text/placeholder` | `--input-placeholder-text` | `--color-form-control-text-placeholder` | needs-review |
| Input disabled text | `color/form-control/text/disabled` | `--input-disabled-text` | `--color-form-control-text-disabled` | stable |
| Input helper text | `color/text/state/helper` (pending) | `--input-helper-text` | `--color-text-state-helper` | pending |
| Input correct text | `color/text/state/accent` | `--input-correct-text` | `--color-text-state-correct` | stable |
| Input error text | `color/text/state/error` (pending) | `--input-error-text` | `--color-text-state-error` | pending |

---

## Button Mapping Summary

| Meaning | Figma Variable | CSS Token | Figma Value | Status |
|---|---|---|---|---|
| Button primary default bg | `color/button/bg/primary--default` | `--button-primary-default-bg` | #1d6ceb | stable |
| Button primary default text | `color/button/label/primary--default` | `--button-primary-default-text` | #ffffff | stable |
| Button primary border | `color/button/border/primary--default` | (없음) | #1d6ceb | needs-review |
| Button primary hover bg | `color/button/bg/primary--hover` (pending) | `--button-primary-hover-bg` | — | pending |
| Button primary pressed bg | `color/button/bg/primary--pressed` (pending) | `--button-primary-pressed-bg` | — | pending |
| Button secondary variants | pending | `--button-secondary-*` | — | pending |
| Button blue-line variants | pending (SW-specific) | `--button-blue-line-*` | — | pending |

---

## DatePicker Cell Mapping Summary (from 540:3836)

| Meaning | Figma Variable | CSS Token | Figma Value | Status |
|---|---|---|---|---|
| Selected day bg | `color/control/bg/selected` | `--date-picker-cell-selected-bg` | #1d6ceb | stable |
| Today cell border | `color/control/border/selected` | `--date-picker-cell-today-border` | #1d6ceb | stable |
| Selected day text | `color/text/state/accent-alt` | `--date-picker-cell-selected-text` | #ffffff | stable |
| Today day text | `color/text/state/accent` | `--date-picker-cell-today-text` | #1d6ceb | stable |
| Other month text | `color/text/state/disabled` | `--date-picker-cell-other-month-text` | #c4c4c4 | stable |
| Today cell bg | `color/control/bg/selected-alt` | `--date-picker-cell-today-bg` | #ffffff | stable |

---

## State Alias Decisions

| Figma / Legacy | Canonical | Reason | Status |
|---|---|---|---|
| `complete` | `filled` | Figma complete state = content state. No separate bg/border token. | alias |
| `correct` | **correct** | HD-4: 코드/registry canonical. Figma 'success'가 아닌 'correct'로 통일. | **stable (canonical)** |
| `selected` (form-control) | `focus` | Figma uses selected for focus/active state on form controls. | alias |
| `success` | `correct` | Figma state name. Code canonical = correct. 코드 리네임 불필요. | figma-alias |

---

## Unmapped Items

| ID | 이유 |
|---|---|
| `input.value.text` | component alias `--input-value-text` 없음. `--color-form-control-text-default` 직접 사용 |
| `input.unit.text` | `--input-unit-text` 없음. `--color-text-secondary` 관례적 사용. Figma 미확인 |
| `select.*` | select.json skeleton 상태. 토큰 미정의. form-control semantic 공유 예정 |
| `time-picker.*` | MVP5 예정. figmaNodeId 6443:4606 — 미분석 |
| `date-picker.panel.shadow` | Figma Variable 아님. rgba 예외 허용 |
| `button.primary.default.border` | Figma has variable but code has no token. needs-review |

---

## Needs Review

| ID | 심각도 | 이슈 | Human Decision |
|---|---|---|---|
| ~~placeholder-gray-step-mismatch~~ | — | ✅ 해소: gray/500 (#757575) 확정. `--color-text-placeholder` = `var(--color-gray-500)`. Figma 일치. | 완료 |
| `button-primary-border-token-gap` | low | Figma has color/button/border/primary--default but code has no equivalent. | No (의도적 생략 가능) |
| `input-action-icon-token-missing` | low | No --input-action-icon token. Figma: color/icon/gray-dark (#353535). | No (--color-icon-emphasis 직접 사용 가능) |

---

## Confirmed Decisions (2026-05-18)

| 항목 | 결정 내용 |
|---|---|
| `form-control-text-default` 값 | **#353535 확정 → `var(--color-text-secondary)` 사용.** tokens.css·semantic.md·component-tokens-extracted.md·input.json 수정 완료 |
| `correct` vs `success` | **HD-4: `correct` = canonical. `success` = Figma alias.** --input-correct-border / --input-correct-text 는 canonical — deprecated 아님 |
| caption / placeholder 관리 | **별개 토큰으로 분리 관리.** caption으로 placeholder 교체 금지. --color-text-placeholder 전용 사용 |
| placeholder 값 | **gray/500 (#757575) 확정.** `--color-text-placeholder` = `var(--color-gray-500)`. Figma 일치. tokens.css·semantic.md·semantic.colors.json 수정 완료 |

---

## Human Decisions Needed

1. ~~**Placeholder gray step 확정**~~ — ✅ gray/500 (#757575) 확정 완료 (2026-05-18)
2. **Button Figma Variables 추가 확인** — hover, pressed, disabled, secondary, blue-line 상태 Variables 확인 (Figma에서 직접 조회 필요)
3. **Label text Figma Variable 확인** — `color/text/title/secondary` Variable 존재 여부 MCP 확인 필요

---

## Figma Variables Confirmed via MCP

| 노드 | 확인 항목 |
|---|---|
| 540:3794 (datepicker_input) | color/form-control/bg/default, /border/default, /border/selected, /border/disabled, /bg/disabled, /text/default, /text/placeholder, /text/disabled |
| 540:4501 (button primary default) | color/button/bg/primary--default, color/button/label/primary--default, color/button/border/primary--default |
| 540:3836 (mobile bottomsheet) | color/control/bg/selected, color/control/border/selected, color/text/state/accent, color/text/state/accent-alt, color/text/state/disabled, color/control/bg/selected-alt |
| 540:7663 (foundation collection) | color/gray/*, color/blue/*, color/base/white, color/brand/*, etc. |

---

## Next Recommended Step

1. **Human Decision 해소** — placeholder text, form-control typed text 값 불일치 확인 후 semantic.md / tokens.css 수정
2. **`correct` → `success` 리네임** — 결정 후 tokens.css, input.json, components.html 동기화
3. **Code Token → Figma Variables Sync Plugin** — 이 매핑 파일을 읽고 Figma Variables를 자동 생성/업데이트하는 플러그인 구축
4. **Figma Design Guard Plugin** — 작업물에서 Variables 미사용 여부 검수
5. **Select / TimePicker 토큰 정의** — form-control semantic 기준으로 component alias 추가
