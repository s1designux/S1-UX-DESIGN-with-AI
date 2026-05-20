# MVP-L5 — Canonical Token v0.1 Promotion Plan

**생성일:** 2026-05-19  
**버전:** v0.1.0  
**상태:** Draft — 사람 검수 필요  
**입력:** MVP-L1 ~ L4.5 (F0 Figma Variable Usage Audit + C0 Component Token Coverage + L4.5 Review)

---

## 1. 목적

L1~L4.5 결과를 바탕으로 canonical token v0.1 후보를 정리한다.  
확정 가능한 항목만 `promote-candidate`로 분류하고, 애매한 항목은 보류한다.

이 단계에서 하지 않는 것:
- Figma Variable write/rename/delete
- legacy token 삭제
- tokens.css / components.html 수정
- canonical registry v0.1 자동 확정

---

## 2. 반영된 Human Decisions

| Decision | 결정 | L5 영향 |
|---|---|---|
| HD-L4.5-A | DatePicker nav = component alias only (`--date-picker-nav-*`). 새 semantic 카테고리 신설 없음. | future-component-token으로 분류 |
| HD-L4.5-B | `--color-text-primary` canonical = #202020. Figma `color/text/title/primary` #000000 = 문서 노드(doc-only) | promote-candidate 가능 |
| HD-L4.5-C | `color/text/state/accent-alt` = `--color-text-inverse` alias. CSS 토큰 신설 없음. | alias-only 분류 |
| HD-4 | `correct`가 canonical. `success`는 Figma alias. `--input-correct-*` deprecated 금지. | promote-candidate 유지 |
| ND-2 | Dark border rgba → Foundation gray-dark scale 교체 완료 (tokens.css + semantic.colors.json) | 모든 border 토큰 promote-candidate 가능 |
| ND-5 | Chip 토큰 unified → line/solid split (tokens.css 적용 완료) | --chip-line-*(17) + --chip-solid-*(17) 분리 promote-candidate |
| C0-D001 | readonly 토큰 신설. --input-readonly-* 3개 tokens.css 추가 완료 | promote-candidate |
| C0-D002 | --dropdown-list-bg = var(--color-surface-raised) 통일 | promote-candidate |
| C0-D003 | components.html에 tokens.css 링크 추가. 인라인 semantic 토큰 섹션 제거 | 완료 |

---

## 3. Summary

| 상태 | 수 |
|---|---:|
| promote-candidate | 48 |
| hold-needs-review | 4 |
| hold-access-limited | 3 |
| hold-layer-ambiguous | 2 |
| hold (remove-candidate in holds) | 1 |
| alias-only | 3 |
| deprecated-alias | 6 |
| remove-candidate | 5 |
| future-component-token | 2 |
| **합계** | **74** |

> promote-candidate 48 항목: Foundation 13그룹 + Semantic 19그룹 + Component 16그룹 (chip-line/chip-solid 각각 별도 항목 포함)

---

## 4. Layer별 분포

| Layer | promote-candidate | hold | alias-only | deprecated | future |
|---|---:|---:|---:|---:|---:|
| Foundation | 13 | 0 | 0 | 0 | 0 |
| Semantic | 19 | 5 | 1 | 4 | 0 |
| Component | 16 | 5 | 2 | 2 | 2 |
| **합계** | **48** | **10** | **3** | **6** | **2** |

---

## 5. Promote Candidates

### 5.1 Foundation (13그룹)

| ID | cssVariable(s) | Confidence | Evidence |
|---|---|---|---|
| foundation.color.base | `--color-base-white`, `--color-base-black` | high | F0 palette frame 540:7663 확인. Registered in foundation.colors.json |
| foundation.color.gray | `--color-gray-{0..900}`, `--color-gray-dark-{0..900}` | high | All semantic tokens reference. gray-dark-450 gap confirmed. |
| foundation.color.blue | `--color-blue-{50..500}`, `--color-blue-dark-{50..500}` | high | F0: color/blue/50 DatePicker range bg 확인 |
| foundation.color.red | `--color-red-{50..500}`, `--color-red-dark-{50..500}` | high | F0: color/red/300 palette frame 확인 |
| foundation.color.chromatic-scales | orange/yellow/green/skyblue/purple/brown (light+dark) | high | semantic status tokens에서 참조. orange 컴포넌트 사용 미확인이나 foundation 유지 |
| foundation.color.visual-gray | `--color-visual-gray-{50..500}` (light-only) | high | Decorative. Registered. |
| foundation.color.coolgray-dark | `--color-coolgray-dark-{50..500}` (dark-only) | high | Registered. |
| foundation.color.status-dark-aliases | `--color-status-dark-{red,green,yellow}` | high | semantic status dark mode에서 참조 |
| foundation.color.brand | `--color-brand-{blue,red,gray,ci}` | high | F0 palette frame 540:7663 확인. CI/logo 전용. |
| foundation.spacing | `--spacing-{2..128}` (21 tokens) | high | F0: spacing/4, spacing/32 확인. semantic spacing 다수 확인. |
| foundation.typography | font-size(8) + font-weight(3) + line-height(1) | high | Registered in foundation.typography.json |
| foundation.radius | `--radius-{0..full}` (10 tokens) | high | F0: radius/4 5×, radius/full 2× 확인 |
| foundation.border-width | `--border-width-{1,2}` | high | F0: border-width/default 4× 확인 |

### 5.2 Semantic (19그룹/토큰)

| ID | cssVariable(s) | Confidence | Evidence |
|---|---|---|---|
| semantic.color.bg.stable | `--color-bg-{default,subtle,muted,elevated}` | high | F0: surface/neutral/bg/subtle 3× 확인 |
| semantic.color.surface | `--color-surface-{default,raised}` | high | F0: DatePicker panel surface 확인. C0-D002 surface-raised 확인 |
| semantic.color.text.primary | `--color-text-primary` (#202020) | high | HD-L4.5-B 확정. Figma doc-only 노드 제외 |
| semantic.color.text.stable | 9개 text 토큰 (secondary/tertiary/caption/placeholder/helper/link/correct/danger/inverse) | high | MVP-T1: placeholder=gray-500 확정. HD-4: correct canonical |
| semantic.color.text-readonly | `--color-text-readonly` | medium | C0-D001 신설. Figma Variable 미확인 |
| semantic.color.border.stable | 8개 border 토큰 (subtle/default/strong/emphasis/focus/white/danger/correct) | high | ND-2 해소. dark 값 Foundation gray-dark scale 교체 완료 |
| semantic.color.border-disabled | `--color-border-disabled` | medium | Dark 값 gray-dark-200 (border-default dark = gray-dark-300와 다름). 의도적 분리. C0 button disabled 확인 |
| semantic.color.icon | 6개 icon 토큰 (default/muted/emphasis/accent/inverse/danger) | high | F0: color/icon/gray-dark 3×, gray-light 2× 확인 |
| semantic.color.action | 5개 action 토큰 (primary default/hover/pressed/text/subtle) | high | F0: button bg = action-primary-default 확인 |
| semantic.color.status | 4개 status 토큰 (success/error/warning/info) | high | Registered in semantic.colors.json |
| semantic.color.overlay | `--color-overlay` | high | rgba 예외 허용 문서화 완료 |
| semantic.color.control-border | 4개 control-border 토큰 (default/hover/selected/disabled) | high | F0: color/control/border/selected 2× 확인. MVP4.4 추가 |
| semantic.color.form-control.bg | `--color-form-control-bg-{default,disabled}` | high | F0: 540:3794 + 6456:4033 공유 확인 |
| semantic.color.form-control.border | 5개 form-control border (default/selected/error/correct/disabled) | high | F0: 모두 확인. HD-4: correct canonical |
| semantic.color.form-control.text | 3개 form-control text (default/placeholder/disabled) | high | MVP-T1: text-default=#353535, placeholder=#757575 확정 |
| semantic.color.form-control.border-readonly | `--color-form-control-border-readonly` | medium | C0-D001 신설. Figma 미확인 |
| semantic.color.text-state | `--color-text-state-{helper,correct,error}` | high | C0: Input 컴포넌트 사용 확인. correct canonical |
| semantic.spacing.all | 29개 semantic spacing 토큰 | high | F0: padding-inline/sm 4×, block/xs 2×, section/xs,lg 2× 등 확인 |
| semantic.sizing.all + radius.all + border-width.all | sizing 25 + radius 5 + border-width 2 = 32 | high | F0: form-control height 4종, button height, icon/24 확인 |

### 5.3 Component (12그룹)

| ID | cssVariable(s) | 토큰 수 | Confidence | Evidence |
|---|---|---:|---|---|
| component.button.primary | `--button-primary-*` | 8 | high | F0: bg/border/text 3~4 노드 확인. C0: 7개 확인 |
| component.button.secondary | `--button-secondary-*` | 10 | high | C0: 9개 확인 |
| component.button.blue-line | `--button-blue-line-*` | 9 | high | C0: 9개 확인 |
| component.input | `--input-*` (12) | 12 | high | F0: form-control 8개 확인. C0: 12개 확인. correct 토큰 canonical |
| component.input.readonly | `--input-readonly-{bg,border,text}` | 3 | medium | C0-D001 신설 |
| component.chip.line | `--chip-line-*` | 17 | high | ND-5 적용. tokens.css 확인 완료 |
| component.chip.solid | `--chip-solid-*` | 17 | high | ND-5 적용. tokens.css 확인 완료 |
| component.checkbox | `--checkbox-*` | 10 | high | MVP4.4 stable |
| component.radio | `--radio-*` | 8 | high | MVP4.4 stable |
| component.toggle | `--toggle-*` | 4 | high | MVP4.4 stable |
| component.dropdown | `--dropdown-*` | 17 | high | C0: 4개 extra 토큰 추가 확인 (C0-missing-005). C0-D002 확인 |
| component.pagination | `--pagination-*` | 8 | medium | registry stable. F0 미확인 |
| component.navigation | `--nav-*` | 9 | medium | HD-L4.5-A: DatePicker nav 매핑 확인 |
| component.table | `--table-*` | 8 | medium | --table-row-selected-bg → color-bg-selected(hold)에 의존 |

> **주의:** component.pagination, navigation, table은 F0 Figma 사용 미확인. 코드 기반 stable이므로 promote-candidate 유지하되 confidence=medium.

---

## 6. Hold Items

### 6.1 hold-needs-review

| ID | cssVariable | Hold 이유 | 필요 조치 |
|---|---|---|---|
| hold.semantic.bg-home | `--color-bg-home` | Light = raw HEX #F5F6FB. Foundation 미등록. | ND-4: Foundation primitive 신규 등록 또는 기존 foundation 교체. Human decision. |
| hold.semantic.bg-selected | `--color-bg-selected` | candidate 상태. Figma validation 미완료. | Figma 직접 확인. dark=blue-dark-100 확정 필요. `--table-row-selected-bg`도 영향. |
| hold.semantic.text-disabled | `--color-text-disabled` | dark 값 gray-dark-400 = candidate. WCAG 검토 미완. | dark 배경 기준 WCAG AA 대비율 확인. gray-dark-400 vs gray-dark-600 결정. |
| hold.semantic.colors-json-sync | 20개 semantic 토큰 | tokens.css에 존재하나 semantic.colors.json 미등록 (ND-7). | ND-7 결정 후 JSON 등록. Option A: 기존 파일에 추가. Option B: 파일 분리. |

### 6.2 hold-access-limited

| ID | cssVariable | Hold 이유 | 필요 조치 |
|---|---|---|---|
| hold.component.textarea | (없음) | ACCESS-01: Figma 6443:4408 invalid. Textarea 미구현. | MVP-F1 Plugin Export. registry/components/textarea.json 생성. |
| hold.component.date-picker.tokens | `--date-picker-*` | ACCESS-01: Figma 6443:4655 invalid. 전체 스코프 미확인. | MVP-F1 + DatePicker HD-1~5 해소. |
| hold.component.time-picker | (없음) | ACCESS-01: Figma 6443:4606 invalid. 미구현. | MVP-F1. CLAUDE.md 미결 #11. |

### 6.3 hold-layer-ambiguous

| ID | cssVariable | Hold 이유 | 필요 조치 |
|---|---|---|---|
| hold.component.select-disabled-border | `--select-disabled-border` | stray token in input group. Select component에 속함 (HD-5, ND-8). | registry/components/select.json 생성 후 이전. |
| hold.component.ghost-button-migration | `--button-ghost-*` (6개) | deprecated이나 backward compat을 위해 tokens.css 잔존. | consumer code 마이그레이션 완료 후 삭제. |

---

## 7. Alias Only

| Figma Variable | CSS Canonical | 이유 |
|---|---|---|
| `color/text/state/accent-alt` (#ffffff) | `--color-text-inverse` | HD-L4.5-C 확정. 값 동일(#ffffff). CSS 토큰 신설 없음. Figma Variable 이름 유지. |
| state: `complete` | 상태 이름 `filled` | Figma 'complete' = code 'filled'. bg/border 토큰 변화 없음. placeholder → typed text만 변경. |
| state: `selected` (form-control) | 상태 이름 `focus` / `--input-focus-border` | Figma 'selected' in form-control = code 'focus'. Chip/Nav의 'selected'와 다름. |

---

## 8. Deprecated Aliases

| Legacy | Canonical | 상태 | 비고 |
|---|---|---|---|
| Figma state: `success` | code state: `correct` | figma-alias-only | HD-4 확정. correct가 canonical. code 토큰 rename 금지. |
| state: `complete` | state: `filled` | alias-confirmed-no-separate-token | bg/border 변화 없음. token-aliases.json 등록 완료. |
| `--input-filled-bg` | `--input-default-bg` | alias-resolved-no-separate-token | token-aliases.json 등록 완료. |
| `--input-filled-border` | `--input-default-border` | alias-resolved-no-separate-token | token-aliases.json 등록 완료. |
| Figma: `border-width/100` | `--border-width-default` | dedup-remove | L4.5 F-1. 동일 1px. legacy Figma Variable. |
| Figma: `Title/16M` (대문자) | `title/16M` (소문자) | dedup-document | L4.5 F-3. Figma Variable rename 금지. code registry에서 deprecated 표시. |

---

## 9. Remove Candidates

| Token | 상태 | 이유 |
|---|---|---|
| `--input-hover-bg` | 이미 제거됨 | HD-2: Figma hover bg 미정의. 2026-05-12 삭제. |
| `--input-hover-border` | 이미 제거됨 | HD-2 동일 이유. |
| `--input-focus-bg` | 이미 제거됨 | HD-3: focus bg = default bg. 2026-05-12 삭제. |
| `--input-error-bg` | 이미 제거됨 | HD-8: error bg = default bg. 2026-05-12 삭제. |
| Figma: `color/control/border/disabled-alt1` | dedup-candidate | L4.5 F-5. 값 동일 #d9d9d9 = border/default. -alt1 = legacy suffix. 사용처 1개 교체 후 제거. |

---

## 10. Future Component Tokens

| Token | Component | 이유 | 준비 조건 |
|---|---|---|---|
| `--date-picker-nav-*` (5개) | DatePicker | HD-L4.5-A: nav = component alias만. --nav-* semantic 값 재사용. ACCESS-01 차단. | MVP-F1 + DatePicker HD-1 해소 |
| `--input-action-icon` | Input, Search Input, Password Field | C0 missing-002. suffix 아이콘 color = --color-icon-default 직접 참조. component alias 필요. | Figma Variable `color/icon/gray-dark` 확정 |

---

## 11. Decisions Required

| 항목 | 옵션 | 권장 |
|---|---|---|
| ND-4: --color-bg-home 라이트 raw HEX | A: 신규 Foundation 등록 / B: visual-gray-50 / C: gray-0 | A (Figma 확인 후) 또는 B (시각 match) |
| ND-7: semantic.colors.json 동기화 (20개 토큰) | A: 기존 파일에 추가 / B: 파일 분리 | A — 단순성 우선 |
| decision-003: 8개 component registry JSON 생성 | A: 일괄 생성 / B: 순차 생성 | A — Claude가 실행 가능 (사람 승인 필요) |
| decision-004: ghost button 제거 시점 | A: 사용처 추적 후 제거 / B: 기한 설정 | A — 백로그 등록 |
| decision-005: ACCESS-01 해소 | A: MVP-F1 Plugin Export / B: Figma 직접 접근 | A — 자동화 |
| decision-006: DatePicker HD-1~5 해소 | — | ACCESS-01 해소 후 진행 |
| decision-007: --color-text-disabled dark | A: gray-dark-400 유지 / B: gray-dark-600으로 업그레이드 | WCAG 검토 후 결정 |

---

## 12. L5 Readiness 평가

| 영역 | 상태 | 이유 |
|---|---|---|
| Foundation tokens (color + spacing + typography + radius + border-width) | ready | 모두 stable. F0 확인 완료. |
| Semantic color (bg/surface/text/border/icon/action/status/overlay) | ready | ND-2 해소. HD-L4.5-B/C 확정. |
| Semantic color-control-border | ready | MVP4.4 stable. F0 확인. |
| Semantic color-form-control | ready (partial) | F0: Input+DatePicker 확인. Select/Textarea/TimePicker ACCESS-01 차단. |
| Semantic color-text-state | ready | C0 확인. correct canonical. |
| Button component tokens | ready | F0 + C0 확인 완료. |
| Input component tokens | ready | F0 + C0 확인. correct canonical. readonly 신설 완료. |
| Chip component tokens | ready | ND-5: line/solid split tokens.css 적용 완료. |
| Checkbox/Radio/Toggle | ready | MVP4.4 stable. |
| Dropdown/Select | ready (partial) | C0-D002 확인. 4개 extra 토큰 등록 완료. select-disabled-border stray 미해소. |
| Textarea, TimePicker | blocked | ACCESS-01. 미구현. |
| DatePicker component | blocked | ACCESS-01. HD-1~5 미해소. |
| Navigation, Pagination, Table | partial | code stable. F0 미확인. |

---

## 13. 다음 단계

1. **사람이 promote-candidate 검수** — confidence=medium 항목 우선 확인
2. **hold item 정리** — ND-4, ND-7, decision-003 결정
3. **ACCESS-01 해소** — MVP-F1 Plugin Export Variable Usage 실행
4. **DatePicker HD-1~5 해소** — ACCESS-01 후 진행
5. **ND-7 실행** — 20개 semantic 토큰 registry/tokens/semantic.colors.json 등록
6. **8개 component JSON 생성** — decision-003 승인 후 Claude 실행
7. **MVP-L6 Canonical Registry v0.1 생성** — 위 조치 완료 후

---

## 14. 변경 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `registry/tokens/canonical-token-promotion-plan.json` | 전면 재작성. L1~L4.5 결과 통합. HD-L4.5-A/B/C 반영. promote 44그룹/hold 11/alias-only 3/deprecated 6/remove 5/future 2 분류. |
| `reports/mvp-l5-canonical-token-promotion-plan.md` | 본 파일 신규 생성 |

---

## 1. 목적

L1~L4 산출물을 기반으로 canonical token v0.1 후보를 정리하고,
promote/hold/deprecate/remove 분류를 확정한다.

---

## 2. 원칙

- Code Registry가 source of truth다.
- UX Guide 2.4는 legacy source snapshot이다. 이 파일의 Variable 이름이 달라도 CSS 토큰을 변경하지 않는다.
- 모든 토큰을 한 번에 확정하지 않는다. 확정 가능한 항목만 promote-candidate로 분류한다.
- Figma write / rename은 하지 않는다.
- deprecated alias는 promote-candidate로 승격하지 않는다.
- needs-review 항목은 자동 확정하지 않는다.
- darkmode-test 결과를 운영 기준으로 사용하지 않는다.

---

## 3. Summary

| status | count |
|---|---:|
| promote-candidate | 44 |
| needs-review | 8 |
| hold | 7 |
| deprecated-alias | 6 |
| remove-candidate (already removed) | 4 |
| new-token-required | 3 |
| **total tracked** | **72** |

> promote-candidate 44개는 개별 CSS 변수가 아닌 그룹 단위 항목이다.  
> 실제 CSS 변수 수: Foundation 약 262개 + Semantic 약 95개 + Component 약 141개 = 약 498개.

---

## 4. Layer별 후보

| layer | promote-candidate | needs-review | hold |
|---|---:|---:|---:|
| foundation | 11 | 0 | 0 |
| semantic | 22 | 5 | 5 |
| component | 11 | 3 | 2 |
| **합계** | **44** | **8** | **7** |

---

## 5. Promote Candidates

### Foundation (11개 그룹)

| id | cssVariables 범위 | token count | confidence |
|---|---|---:|---|
| foundation.color.base | --color-base-white / --color-base-black | 2 | high |
| foundation.color.gray | --color-gray-{0..900} + --color-gray-dark-{0..900} | 22 | high |
| foundation.color.blue | --color-blue-{50..500} + --color-blue-dark-{50..500} | 20 | high |
| foundation.color.chromatic-scales | red/orange/yellow/green/skyblue/purple/brown (light+dark) | 140 | high |
| foundation.color.visual-gray | --color-visual-gray-{50..500} | 10 | high |
| foundation.color.coolgray-dark | --color-coolgray-dark-{50..500} | 10 | high |
| foundation.color.status-dark-aliases | --color-status-dark-red/green/yellow | 3 | high |
| foundation.spacing | --spacing-{2..128} | 21 | high |
| foundation.typography | font-size(8) + font-weight(3) + line-height(1) | 12 | high |
| foundation.radius | --radius-0 ~ --radius-full | 10 | high |
| foundation.border-width | --border-width-1 / --border-width-2 | 2 | high |

**Foundation 소계: 약 252개 CSS 변수**

---

### Semantic (22개 그룹)

| id | cssVariables 핵심 | confidence | 비고 |
|---|---|---|---|
| semantic.color.bg.stable | --color-bg-default/subtle/muted/elevated | high | 4 stable bg tokens |
| semantic.color.surface | --color-surface-default/raised | high | 2 tokens |
| semantic.color.text.stable | primary~inverse 10개 | high | --color-text-disabled는 hold |
| semantic.color.border.stable | subtle/default/strong/emphasis/focus/white/danger/correct | high | ND-2 resolved. 8 tokens |
| semantic.color.icon | default/muted/emphasis/accent/inverse/danger | high | 6 tokens |
| semantic.color.action | primary 5개 | high | 5 tokens |
| semantic.color.status | success/error/warning/info | high | 4 tokens |
| semantic.color.overlay | --color-overlay | high | rgba 예외 허용 |
| semantic.color.control-border | default/hover/selected/disabled | high | 4 tokens. semantic.colors.json 미등록 |
| semantic.color.form-control.bg | bg-default/bg-disabled | high | 2 tokens. Figma 540:3794 확인 |
| semantic.color.form-control.border | default/selected/error/correct/disabled | high | 5 tokens. correct=canonical |
| semantic.color.form-control.text | default/placeholder/disabled | high | 3 tokens. MVP-T1 확정값 |
| semantic.color.text-state | helper/correct/error | high | 3 tokens. accent 540:3836 확인 |
| semantic.spacing.all | padding-block/inline, section, stack, cluster, label-gap | high | 29 tokens |
| semantic.sizing.all | form-control/button/chip/table-row/icon height | high | 25 tokens |
| semantic.radius.all | control-xs/sm, button-md, card-md, modal-md | high | 5 tokens |
| semantic.border-width.all | --border-width-default / --border-width-strong | high | 2 tokens |

> semantic.color.control-border / form-control / text-state 15개 그룹: tokens.css에서 stable이나 semantic.colors.json에 미등록. ND-7 결정 후 등록 필요.

---

### Component (11개 그룹)

| id | token count | confidence | registry 상태 |
|---|---:|---|---|
| component.button.primary | 8 | high | 등록됨 — button.json |
| component.button.secondary | 10 | high | 등록됨 — button.json |
| component.button.blue-line | 9 | high | 등록됨 — button.json |
| component.input | 12 | high | 등록됨 — input.json |
| component.checkbox | 10 | high | 미등록 — checkbox.json 생성 필요 |
| component.radio | 8 | high | 미등록 — radio.json 생성 필요 |
| component.toggle | 4 | high | 미등록 — toggle.json 생성 필요 |
| component.dropdown | 13 | high | 미등록 — dropdown.json 생성 필요 |
| component.pagination | 8 | high | 미등록 — pagination.json 생성 필요 |
| component.navigation | 9 | high | 미등록 — navigation.json 생성 필요 |
| component.table | 8 | high | 미등록 — table.json 생성 필요 |

---

## 6. Needs Review

| id | issue | recommendation | priority |
|---|---|---|---|
| review.semantic.color.text.correct.naming | --color-text-correct vs --color-text-state-correct 역할 중복 가능성 | 역할 명확화 또는 하나를 alias로 처리 | medium |
| review.semantic.color.border.disabled.vs.control | --color-border-disabled와 --color-control-border-disabled 의미 중복 검토 | dark 모드 차이 확인 후 alias 또는 분리 결정 | medium |
| review.component.chip.structure | canonical-token-draft.json(17 unified) vs CLAUDE.md ND-5 resolved(34 split) 불일치 | tokens.css 현재 상태 확인 후 구조 일치화 | **high** |
| review.component.button.primary.border | Figma에 border/primary--default 있으나 코드에 --button-primary-default-border 없음 | 토큰 추가 또는 미필요 명시적 문서화 | low |
| review.component.input.action-icon | --input-action-icon 토큰 없음. Figma color/icon/gray-dark 미매핑 | new-token-required에 등록됨 | low |
| review.component.date-picker | 6개 DatePicker 셀 토큰 Figma 확인됐으나 registry 미완성 | date-picker.json 완성 | medium |
| review.semantic.text-title-secondary | --color-text-title-secondary Figma Variable name 미확인 | Figma에서 직접 확인 후 결정 | low |
| review.semantic.form-control.border.default.reference | form-control-border-default가 --color-control-border-default vs --color-border-default 중 어느 것을 참조해야 하는지 불일치 | Option A(control-border-default) 권장 | **high** |

---

## 7. Hold / Blocked

| id | cssVariable | holdReason | requiredDecision |
|---|---|---|---|
| hold.semantic.bg-home | --color-bg-home | hold-missing-foundation | ND-4: raw HEX #F5F6FB Foundation 등록 또는 교체 |
| hold.semantic.bg-selected | --color-bg-selected | hold-darkmode-required | Figma dark 값 검증 필요 |
| hold.semantic.text-disabled | --color-text-disabled | hold-darkmode-required | dark 값 gray-dark-400 vs gray-dark-600 확인 |
| hold.component.select-disabled-border | --select-disabled-border | hold-ambiguous-layer | ND-8: Select component registry 생성 후 이동 |
| hold.semantic.colors-json-sync | 18개 semantic 토큰 | hold-missing-foundation | ND-7: semantic.colors.json 동기화 결정 |
| hold.component.chip | --chip-* | hold-ambiguous-layer | ND-5: unified vs line/solid 구조 확정 |
| hold.component.ghost-button-migration | --button-ghost-* (6개) | hold-ambiguous-layer | 서비스 코드 마이그레이션 완료 후 삭제 |

---

## 8. Deprecated / Alias

| legacyName | canonicalName | cssVariableLegacy | cssVariableCanonical | action |
|---|---|---|---|---|
| correct (Figma 'success' state) | correct | — | --input-correct-border, --input-correct-text 등 | no-rename-needed (ND-NAMING-01 resolved) |
| complete | filled | --input-complete-bg/border | --input-default-bg/border | alias-confirmed-no-separate-token |
| selected (form-control context) | focus | — | --color-form-control-border-selected, --input-focus-border | alias-documented |
| success (Figma state name) | correct | — | --input-correct-border, --input-correct-text | figma-alias-only |
| --input-filled-bg | no-token-needed | --input-filled-bg | --input-default-bg | alias-resolved-no-separate-token |
| --input-filled-border | no-token-needed | --input-filled-border | --input-default-border | alias-resolved-no-separate-token |

---

## 9. Remove Candidates (이미 제거됨)

| cssVariable | reason | removedAt |
|---|---|---|
| --input-hover-bg | HD-2: Figma 미정의 hover 상태 | 2026-05-12 |
| --input-hover-border | HD-2: 동일 | 2026-05-12 |
| --input-focus-bg | HD-3: focus bg = default bg | 2026-05-12 |
| --input-error-bg | HD-8: error bg = default bg | 2026-05-12 |

> 위 4개는 이미 tokens.css에서 제거됨. deprecated-tokens.json에 기록됨. 별도 조치 불필요.

---

## 10. Decisions Required

| id | topic | recommendation | priority |
|---|---|---|---|
| decision-001 | --color-bg-home raw HEX #F5F6FB (ND-4) | Option A: Foundation 등록 (Figma 확인 시) / Option B: visual-gray-50으로 교체 | medium |
| decision-002 | semantic.colors.json 18개 누락 토큰 동기화 (ND-7) | Option A: 기존 파일에 추가 (Claude 실행 가능) | **high** |
| decision-003 | Chip 구조: unified vs line/solid split | tokens.css 현재 상태 확인 후 canonical-token-draft.json 정합 | **high** |
| decision-004 | 8개 component registry JSON 생성 | Option A: 일괄 생성 (Claude 승인 후 실행 가능) | medium |
| decision-005 | Ghost button 마이그레이션 타임라인 | 서비스 마이그레이션 완료 시점 결정 | low |
| decision-006 | --color-form-control-border-default 참조 대상 확정 | Option A: --color-control-border-default 사용 (dark 값 올바름) | **high** |
| decision-007 | DatePicker registry 완성 | 확인된 6개 셀 토큰 등록 (MVP4.3-A HD 완료 대기) | medium |

---

## 11. 다음 단계

1. **즉시 실행 가능 (Claude, 승인 후):**
   - decision-002: semantic.colors.json에 18개 누락 토큰 추가
   - decision-004: 8개 component registry JSON 일괄 생성 (canonical-token-draft.json 기준)

2. **Human 결정 필요:**
   - decision-003 (Chip 구조): tokens.css 현재 상태 확인 후 구조 확정
   - decision-006 (form-control-border-default 참조): --color-control-border-default로 통일 확정
   - decision-001 (bg-home raw HEX): Foundation 등록 또는 대체값 선택

3. **다음 MVP 단계:**
   - canonical registry v0.1 생성 (promote-candidate 모두 확정 후)
   - Updated Figma Design Guide 설계 단계 진입 (canonical v0.1 완성 후)
   - MVP-L6: Select / Textarea / TimePicker 컴포넌트 registry 완성
   - MVP-L7: canonical token → Figma Variables 동기화 준비 (collectionId 확보 후)

---

## 12. 파일 목록

| 파일 | 역할 | 상태 |
|---|---|---|
| `registry/tokens/canonical-token-draft.json` | 전체 토큰 구조 정의 | ✅ 완료 (v0.1) |
| `registry/tokens/canonical-token-promotion-plan.json` | 분류 결정 계획서 | ✅ MVP-L5에서 보정 |
| `registry/tokens/figma-css-token-map.json` | Figma↔CSS 매핑 | ✅ 완료 (v0.2) |
| `registry/tokens/token-aliases.json` | 상태 alias 정의 | ✅ 완료 |
| `registry/tokens/deprecated-tokens.json` | 삭제/이동 토큰 기록 | ✅ 완료 |
| `registry/tokens/semantic.colors.json` | Semantic 색상 JSON | ✅ ND-7 완료 (2026-05-19) — 19개 추가, 총 62개 |
| `registry/tokens/legacy-token-map.json` | UX Guide 2.4 마이그레이션 맵 | ✅ 존재 (v0.2) |

---

## 13. ND-7 완료 기록 (2026-05-19)

semantic.colors.json에 누락됐던 19개 토큰을 장부에 추가 완료.

| 카테고리 | 추가 토큰 수 | 주요 토큰 |
|---|---:|---|
| `text` 추가 | 1 | `--color-text-readonly` |
| `border` 추가 | 1 | `--color-border-disabled` |
| `controlBorder` 신규 | 4 | `--color-control-border-default/hover/selected/disabled` |
| `formControl` 신규 | 10 | `--color-form-control-bg-*/border-*/text-*` |
| `textState` 신규 | 3 | `--color-text-state-helper/correct/error` |

- CSS 변경 없음. 장부(JSON) 등록만 수행.
- promote-candidate 수 변동 없음 (이미 계획에 포함돼 있었음).

---

*MVP-L5 + ND-7 완료. 다음: Human 검수 → promote-candidate 확정 → canonical registry v0.1 생성.*
