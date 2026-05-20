# MVP-L2 Legacy Token Classification Report
**날짜:** 2026-05-20 (v1.0) / 2026-05-20 (v1.2 — Group A·B·C·D·E·F 결정 전량 반영)  
**대상:** UX Guide 2.4 needsReview 115개  
**목적:** MVP-L5 Canonical Token Promotion Plan 입력값 확보

---

## 분류 요약 (115개) — v1.2 최종

| Status | 수 | 설명 |
|---|---|---|
| **alias-only** | 79 | 기존 canonical CSS 토큰으로 매핑 (신규 구현 포함) |
| **future-component-token** | 18 | 도메인 컴포넌트 귀속 확정 (surface/status·assist·status-card) |
| **no-canonical-needed** | 13 | 의도적으로 토큰 미신설 — CSS cascade override 또는 삭제 결정 |
| **hold-duplicate** | 2 | 기존 canonical로 이미 커버됨 |
| **deprecated-alias** | 2 | canonical 존재, legacy name 폐기 예정 |
| **promote-candidate** | 1 | `--color-control-indicator-selected` 신규 semantic 토큰 신설 (구현 완료) |
| **hold-missing-usage** | 0 | 전량 해소 |
| **hold-needs-review** | 0 | Figma snapshot 분석으로 전량 해소 |

---

## 전체 결정 이력

| 단계 | 결정 | 영향 항목 수 |
|---|---|---|
| 세션 초기 | hold-layer-ambiguous 18건 → future-component-token | 18 |
| 세션 초기 | caution → alias-only (→ `--color-text-state-error`) | 1 |
| 세션 초기 | promote-candidate 구현 완료 (`--color-control-indicator-selected`) | 1 |
| Snapshot 분석 | hold-needs-review 15건 전량 alias/missing 해소 | 15 |
| Group B | `--color-control-bg-hover` 신설 → alias-only로 전환 | 1 |
| Group E | `--nav-item-indicator-default` 신설·`--nav-bg` 확인 → alias-only | 2 |
| Group F | `--table-border-light/strong` 신설 → alias-only | 2 |
| Group A | 버튼 hover border → no-canonical-needed (삭제 결정) | 2 |
| Group C | dropdown option border/hover → no-canonical-needed (hover bg로 충분) | 1 |
| Group D | control alt 8건·nav alt 2건 → no-canonical-needed (CSS cascade override) | 10 |

---

## 적용된 확정 결정 (Rule 1~10)

| Rule | 결정 내용 | 영향 항목 |
|---|---|---|
| 1 | DatePicker nav = component alias, not semantic | 미해당 |
| 2 | `--color-text-primary` (#202020) → alias-only | color/text/title·body/primary → alias-only |
| 3 | accent-alt → `--color-text-inverse` alias-only | token-aliases.json 기등록 |
| 4 | accent-alt CSS token 신설 안 함 | 해당 없음 |
| 5 | correct = success의 deprecated alias | deprecated-alias 2건 |
| 6 | complete = filled (content state) | form-control/text/selected → alias-only |
| 7 | filled = container bg/border 변경 없음 | form-control/bg/selected → alias-only |
| 8 | alias-only는 promote-candidate 중복 승격 안 함 | 전체 적용 |
| 9 | deprecated-alias는 promote 안 함 | 전체 적용 |
| 10 | TimePicker = 구조 미확정 | 이번 배치 미해당 |

---

## promote-candidate (1건) — ✅ 구현 완료

| Figma Variable | 신규 CSS Token | 값 |
|---|---|---|
| `color/control/indicator/selected` | `--color-control-indicator-selected` | `var(--color-action-primary-default)` |

---

## deprecated-alias (2건)

| Figma Variable | 매핑 CSS Token | 사유 |
|---|---|---|
| `color/text/state/correct` | `--color-text-state-correct` | correct = success deprecated alias |
| `color/form-control/border/correct` | `--color-form-control-border-correct` | 동일 |

---

## future-component-token (18건) — 도메인 컴포넌트 확정

### surface/status 배경 (6건) — StatusCard Domain Component
`surface/status/main/primary`, `/sub/primary`, `/main/secondary`, `/sub/secondary`, `/main/tertiary`, `/sub/tertiary`

### color/button "assist" variant (6건) — 별도 컴포넌트 분리
`color/button/bg/assist--{default|hover}`, `border/assist--{default|hover}`, `label/assist--{default|hover}`

### color/status-card 텍스트 (6건) — StatusCard Domain Component
`color/status-card/text/{primary|secondary|tertiary}--{defualt|sub}`

---

## no-canonical-needed (13건) — 의도적 미신설

### Group A — 버튼 hover border (2건)
| Figma Variable | 이유 |
|---|---|
| `color/button/border/primary--hover` | solid 버튼 크기 안정을 위해 Figma에 추가했던 투명 테두리. 현재 구현에서 불필요로 확정·삭제. |
| `color/button/border/secondary--hover` | 동일 |

### Group C — Dropdown option border/hover (1건)
| Figma Variable | 이유 |
|---|---|
| `color/dropdown/option/border/hover` | hover bg 색상 변경으로 충분히 구분됨. 추가 border 없음. |

### Group D — alt 변형 (10건) — CSS Cascade Override 정책
| Figma Variable | 이유 |
|---|---|
| `color/control/bg/default-alt` | 기본형으로 대응이 안 되는 배치 맥락이 있을 때, 해당 배치 컴포넌트 CSS 스코프에서 `--color-control-bg-hover` 등을 재정의하는 방식으로 처리. 별도 alt 토큰 미신설. |
| `color/control/border/default-alt` | 동일 |
| `color/control/border/disabled-alt1` | 동일 |
| `color/control/border/disabled-alt2` | 동일 |
| `color/control/indicator/selected-alt` | 동일 |
| `color/control/indicator/unselected` | 동일 |
| `color/control/indicator/unselected-alt` | 동일 |
| `color/control/text/unselected` | 동일 |
| `color/navigation/label/default-alt` | 동일 (nav 맥락) |
| `color/navigation/indicator/default-alt` | 동일 (nav 맥락) |

> **CSS Cascade Override 원칙:** 여러 컴포넌트가 하나의 semantic 토큰을 공유할 때, 특수 배경(어두운 카드, 컬러 헤더 등) 위에 컴포넌트를 배치하는 **부모**가 해당 토큰 값을 스코프 안에서 재정의한다. tokens.css의 control-border·nav 섹션에 한글 주석으로 예시 포함.

---

## hold-duplicate (2건)

| Figma Variable | 중복 canonical |
|---|---|
| `surface/status/state/disabled` | `--color-form-control-bg-disabled` |
| `surface/status/state/error` | `--color-form-control-border-error` |

---

## alias-only 전체 목록 (79건)

<details>
<summary>펼치기</summary>

| Figma Variable | → CSS Token | 비고 |
|---|---|---|
| color/control/bg/disabled | --color-form-control-bg-disabled | |
| color/control/bg/default | --color-form-control-bg-default | VariableID:1:3 = white |
| color/control/bg/hover | --color-control-bg-hover | ✅ 신규 구현 (Group B) |
| color/control/border/default | --color-control-border-default | |
| color/control/border/disabled | --color-control-border-disabled | |
| color/control/text/disabled | --color-text-disabled | |
| color/control/text/selected | --color-text-inverse | VariableID:1:3 = white |
| color/control/label/default | --color-text-primary | |
| color/control/label/disabled | --color-text-disabled | |
| color/control/indicator/disabled | --color-text-disabled | |
| color/text/title/primary | --color-text-primary | |
| color/text/title/tertiary | --color-text-tertiary | #555555 = gray-600 |
| color/text/body/primary | --color-text-primary | |
| color/text/body/secondary | --color-text-secondary | |
| color/text/body/tertiary | --color-text-caption | VariableID:1:28 = #757575 |
| color/text/state/placehoder (typo) | --color-text-placeholder | |
| color/text/state/caption | --color-text-caption | VariableID:1:28 = #757575 |
| color/text/state/caution | --color-text-state-error | 사용자 결정: error로 통일 |
| color/form-control/label/default | --color-form-control-text-label | |
| color/form-control/label/disabled | --color-form-control-text-disabled | |
| color/form-control/text/selected | --color-form-control-text-default | |
| color/form-control/bg/selected | --color-form-control-bg-default | |
| color/button/bg/secondary--hover | --button-secondary-hover-bg | |
| color/button/bg/disabled | --color-form-control-bg-disabled | |
| color/button/border/disabled | --color-control-border-disabled | |
| color/button/label/primary--hover | --color-text-inverse | VariableID:1:3 = white |
| color/button/label/secondary--default | --color-text-secondary | VariableID:1:34 |
| color/button/label/secondary--hover | --color-text-secondary | VariableID:1:34 |
| color/button/label/disabled | --color-text-disabled | |
| color/dropdown/option/bg/default | --color-surface-default | |
| color/dropdown/option/bg/hover | --dropdown-option-hover-bg | |
| color/dropdown/option/bg/selected | --dropdown-option-selected-bg | |
| color/dropdown/option/bg/disabled | --color-form-control-bg-disabled | |
| color/dropdown/option/label/default | --color-text-primary | |
| color/dropdown/option/label/hover | --color-text-primary | |
| color/dropdown/option/label/selected | --dropdown-trigger-selected-text | |
| color/dropdown/option/label/disabled | --color-text-disabled | |
| color/dropdown/option/border/default | --color-base-white | VariableID:1:3 = white (투명 효과) |
| color/dropdown/option/border/selected | --color-action-primary-default | VariableID:2:26 = blue-400 |
| color/dropdown/list/bg | --dropdown-list-bg | |
| color/dropdown/list/border | --dropdown-list-border | |
| color/chip/solid/bg/default | --chip-solid-default-bg | |
| color/chip/solid/bg/selected | --chip-solid-selected-bg | |
| color/chip/solid/bg/disabled | --chip-solid-disabled-bg | |
| color/chip/solid/border/default | --chip-solid-default-border | |
| color/chip/solid/border/selected | --chip-solid-selected-border | |
| color/chip/solid/border/disabled | --chip-solid-disabled-border | |
| color/chip/solid/label/default | --chip-solid-default-text | |
| color/chip/solid/label/selected | --chip-solid-selected-text | |
| color/chip/solid/label/disabled | --chip-solid-disabled-text | |
| color/chip/line/bg/default | --chip-line-default-bg | |
| color/chip/line/bg/selected | --chip-line-selected-bg | |
| color/chip/line/bg/disabled | --chip-line-disabled-bg | |
| color/chip/line/border/default | --chip-line-default-border | |
| color/chip/line/border/selected | --chip-line-selected-border | |
| color/chip/line/border/disabled | --chip-line-disabled-border | |
| color/chip/line/label/default | --chip-line-default-text | |
| color/chip/line/label/selected | --chip-line-selected-text | |
| color/chip/line/label/disabled | --chip-line-disabled-text | |
| color/navigation/background | --nav-bg | 기존 토큰으로 커버 |
| color/navigation/label/default | --nav-item-default-text | |
| color/navigation/label/selected | --nav-item-active-text | |
| color/navigation/label/hover | --color-text-state-accent | VariableID:2:26 = blue-400 |
| color/navigation/indicator/selected | --nav-item-indicator | |
| color/navigation/indicator/hover | --nav-item-indicator | |
| color/navigation/indicator/default | --nav-item-indicator-default | ✅ 신규 구현 (Group E) |
| color/pagination/control/bg/default | --pagination-default-bg | |
| color/pagination/control/bg/hover | --pagination-hover-bg | |
| color/pagination/control/bg/disabled | --pagination-disabled-bg | |
| color/pagination/control/border/default | --pagination-border | |
| color/pagination/control/border/hover | --pagination-border | |
| color/pagination/control/border/disabled | --pagination-border | |
| color/data/state/default | --color-surface-default | |
| color/data/state/hover | --color-data-state-hover | |
| color/data/border/light | --table-border-light | ✅ 신규 구현 (Group F) |
| color/data/border/strong | --table-border-strong | ✅ 신규 구현 (Group F) |
| color/overlay | --color-overlay | |
| color/status-card/text/disabled | --color-text-disabled | |
| color/status-card/text/error | --color-text-state-error | |

</details>

---

## figma:usage:apply 전 위험 항목

| 항목 | 위험 | 조치 |
|---|---|---|
| `surface/status/*` (6건) | future-component-token — auto-match 오류 | apply 제외 |
| `color/button/*/assist--*` (6건) | future-component-token | apply 제외 |
| `color/status-card/text/*--defualt` (오타) | future-component-token + Figma 오타 | apply 제외 |
| deprecated-alias 2건 | 중복 적용 금지 | apply skip |
| no-canonical-needed 13건 | 의도적 미신설 — 적용 시 잘못된 매핑 | apply 제외 |

---

## 수정/생성 파일 (v1.2 기준)

| 파일 | 변경 |
|---|---|
| `reports/mvp-l2-legacy-token-classification.md` | v1.1 → v1.2 (Group A~F 결정 전량 반영) |
| `assets/css/tokens.css` | `--color-control-bg-hover`, `--nav-item-indicator-default`, `--table-border-light/strong` 추가. CSS cascade override 한글 주석 추가 |
| `registry/components/nav.json` | tokens 배열 완성. `--nav-item-indicator-default` 등록. tokenStatus → stable |
| `registry/components/table.json` | `--table-border-light/strong` 등록. header/cell-border 참조 갱신 |
| `registry/tokens/semantic.colors.json` | `--color-control-bg-hover` 등록 |
| `tokens/semantic.md` | `--color-control-bg-hover` 행 추가 |
| `tokens/component-tokens-extracted.md` | nav indicator-default, table border-light/strong 추가 |

---

## 다음 단계 (MVP-L5 연계)

1. **즉시 가능:** alias-only 79건 → MVP-L5에서 Figma legacy variable ↔ canonical CSS token 매핑 확정
2. **no-canonical-needed 13건:** CSS cascade override 적용 사례가 실제 서비스 컴포넌트(StatusCard 등) 구현 시 tokens.css 주석 패턴 참고
3. **Figma 오타 수정:** `color/status-card/text/*--defualt` → `--default` (3건 Figma 직접 수정 필요)
4. **figma:usage:apply:** 위험 항목 제외 후 alias-only 79건 기준으로만 적용 검토
