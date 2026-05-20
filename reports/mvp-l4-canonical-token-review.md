# MVP-L4 — Canonical Token Review & Promotion Plan

**날짜:** 2026-05-18  
**단계:** MVP-L4  
**상태:** Draft  
**소스:** canonical-token-draft.json + L2 재분류 결과 + token-aliases.json + deprecated-tokens.json  
**출력:** `registry/tokens/canonical-token-promotion-plan.json`

> **이번 단계에서 수행하지 않은 것:**  
> Figma Variable write/rename/delete · UX Guide 2.4 운영 파일 수정 · Legacy token 삭제 · promote-candidate를 최종 canonical로 자동 확정

---

## 1. 목적

L3에서 생성한 canonical token draft를 검토하고,  
공식 registry로 승격 가능한 token 후보와 보류/검토 항목을 분리한다.

---

## 2. 원칙

- Code Registry가 source of truth다.
- UX Guide 2.4는 legacy source snapshot이다.
- 이번 단계에서는 Figma write / rename을 하지 않는다.
- canonical-token-draft는 아직 final이 아니다.

---

## 3. Summary

| category | count | 비고 |
|---|---:|---|
| promote-candidate | **42** | 6 Foundation그룹 + 8 Semantic카테고리 + 18 new Semantic + 4 non-color카테고리 + 6 Component그룹 |
| hold-candidates | **8** | 7 semantic candidate + 1 stray component token |
| needs-decision | **7** | ⚠️ ND-NAMING-01 최우선 확인 |
| alias-candidates | **6** | 3 state alias + 3 token alias |
| deprecated-candidates | **8** | ghost button + removed tokens |
| duplicate-candidates | **5** | 모두 의도적 — 1건만 결정 필요 |

> **promote-candidate 42개**는 plan entries 수이며, 실제 대표 CSS 변수는 ~186개다.  
> Foundation은 이미 foundation.colors.json에 등록됨. Semantic 18개 + Component 6그룹이 즉시 JSON 등록 가능.

---

## 4. Promotion Candidates

### 4-1. Foundation (이미 registry 등록 완료 — 검증만)

| group | tokens | registry 파일 | 상태 |
|---|---:|---|---|
| color primitives (23 groups) | 221 | foundation.colors.json | ✅ stable |
| spacing | 21 | foundation.spacing.json | ✅ stable |
| typography | 12 | foundation.typography.json | ✅ stable |
| radius | 10 | foundation.radius.json | ✅ stable |
| border-width | 2 | foundation.border.json | ✅ stable |

> Foundation 전체 등록 완료. 개별 검토 불필요.

### 4-2. Semantic — 기존 등록 토큰 검증

semantic.colors.json(2026-05-11 기준)에 이미 등록된 37개 토큰:

| category | tokens | confidence |
|---|---:|---|
| color-bg (stable 4개) | 4 | high |
| color-surface | 2 | high |
| color-text (stable 10개) | 10 | high |
| color-border (stable 4개: focus/white/danger/correct) | 4 | high |
| color-icon | 6 | high |
| color-action | 5 | high |
| color-status | 4 | high |
| color-overlay | 1 | high |

> `--color-text-correct` 포함. naming ND-NAMING-01 결정 후 최종 확정.

### 4-3. Semantic — NEW tokens (semantic.colors.json 미등록)

즉시 promotion 가능한 18개:

| cssVariable | group | confidence | 비고 |
|---|---|---|---|
| `--color-border-disabled` | color-border | medium | dark rgba → ND-2 연계 (light 확정) |
| `--color-control-border-default` | color-control-border | high | |
| `--color-control-border-hover` | color-control-border | high | |
| `--color-control-border-selected` | color-control-border | high | |
| `--color-control-border-disabled` | color-control-border | high | |
| `--color-form-control-bg-default` | color-form-control | high | Figma MCP 540:3794 확인 |
| `--color-form-control-bg-disabled` | color-form-control | high | |
| `--color-form-control-border-default` | color-form-control | high | |
| `--color-form-control-border-selected` | color-form-control | high | |
| `--color-form-control-border-error` | color-form-control | high | |
| `--color-form-control-border-correct` | color-form-control | medium | ND-NAMING-01 pending |
| `--color-form-control-border-disabled` | color-form-control | high | |
| `--color-form-control-text-default` | color-form-control | high | gray-800 확정 |
| `--color-form-control-text-placeholder` | color-form-control | high | gray-500 확정 |
| `--color-form-control-text-disabled` | color-form-control | high | |
| `--color-text-state-helper` | color-text-state | high | |
| `--color-text-state-correct` | color-text-state | medium | ND-NAMING-01 pending |
| `--color-text-state-error` | color-text-state | high | |

### 4-4. Semantic non-color (registry JSON 확인 필요)

| category | tokens | 추정 registry 파일 |
|---|---:|---|
| semantic spacing (29개) | 29 | semantic.spacing.json (exists) |
| semantic sizing (25개) | 25 | semantic.sizing.json (exists) |
| semantic radius (5개) | 5 | semantic.radius.json (exists) |
| semantic border-width (2개) | 2 | semantic.border.json (exists) |

### 4-5. Component Tokens

| component | tokens | 현재 registry | 액션 |
|---|---:|---|---|
| button (primary/secondary/blue-line) | 27 | ✅ button.json | verified |
| input | 12 | ✅ input.json | verified (select-disabled-border 제외) |
| chip | 17 | ❌ 없음 | chip.json 생성 필요 |
| dropdown | 13 | ❌ 없음 | dropdown.json 생성 필요 |
| checkbox | 10 | ❌ 없음 | checkbox.json 생성 필요 |
| radio | 8 | ❌ 없음 | radio.json 생성 필요 |
| toggle | 4 | ❌ 없음 | toggle.json 생성 필요 |
| pagination | 8 | ❌ 없음 | pagination.json 생성 필요 |
| navigation | 9 | ❌ 없음 | navigation.json 생성 필요 |
| table | 8 | ❌ 없음 | table.json 생성 필요 |

---

## 5. Hold Candidates

| cssVariable | 이유 | 연계 ND |
|---|---|---|
| `--color-bg-home` | light = raw HEX #F5F6FB (Foundation 미등록) | ND-4 |
| `--color-bg-selected` | Figma validation 미완료 | — |
| `--color-text-disabled` (dark) | dark 값 #35363F vs #55575F 미결 | ND-3 |
| `--color-border-subtle` (dark) | rgba(255,255,255,0.04) — Foundation 참조 아님 | ND-2 |
| `--color-border-default` (dark) | rgba(255,255,255,0.07) | ND-2 |
| `--color-border-strong` (dark) | rgba(255,255,255,0.12) | ND-2 |
| `--color-border-emphasis` (dark) | rgba(255,255,255,0.20) | ND-2 |
| `--select-disabled-border` | Input 그룹에 잘못 배치. Select 레지스트리로 이동 필요 | ND-8 |

---

## 6. Needs Decision

### ⚠️ ND-NAMING-01 [HIGH] — `correct` vs `success` — 최우선 결정 필요

**현재 상황:**

| 출처 | 내용 |
|---|---|
| CLAUDE.md HD-4 | `correct`가 canonical. `success`는 Figma alias. 토큰 리네임 금지. |
| L4 spec (이번 작업 지시) | `success`가 canonical. `correct`는 deprecated alias. |
| token-aliases.json stateAliases.correct | canonical = 'correct' |
| token-aliases.json figmaStateMapping.success.description | "Deprecated: 'correct'. Canonical: 'success'" ← **파일 내부 모순** |

**영향 토큰 (option B 선택 시 rename 필요):**
```
--input-correct-border        →  --input-success-border
--input-correct-text          →  --input-success-text
--color-text-correct          →  --color-text-success
--color-border-correct        →  --color-border-success
--color-form-control-border-correct  →  --color-form-control-border-success
--color-text-state-correct    →  --color-text-state-success
```

| 옵션 | 내용 | 영향 |
|---|---|---|
| **A** (현행 유지) | `correct` = canonical. 변경 없음. CLAUDE.md 유지. | 코드 변경 없음. Figma naming 불일치 유지. |
| **B** (L4 방향) | `success` = canonical. 6개 CSS 변수 rename + CLAUDE.md 수정 + token-aliases.json 정리. | breaking change. Figma naming 일치. |

**권장:** 결정 후 CLAUDE.md, token-aliases.json, deprecated-tokens.json, tokens.css, 관련 component JSON 동시 업데이트 필요.

---

### ND-2 [HIGH] — Dark border rgba 처리

4개 border dark 값이 `rgba(255,255,255,x)` — Foundation 직접 참조 불가:

| 토큰 | 현재 dark 값 | 권장 대안 (option A) |
|---|---|---|
| `--color-border-subtle` | rgba(255,255,255,0.04) | var(--color-gray-dark-100) |
| `--color-border-default` | rgba(255,255,255,0.07) | var(--color-gray-dark-200) |
| `--color-border-strong` | rgba(255,255,255,0.12) | var(--color-gray-dark-400) |
| `--color-border-emphasis` | rgba(255,255,255,0.20) | var(--color-gray-dark-700) |

| 옵션 | 내용 |
|---|---|
| **A** (권장) | Foundation dark scale alias로 교체. 아키텍처 일관성 확보. |
| **B** | rgba 영구 허용 예외 선언. semantic.colors.json에 `"rgbaAllowed": "dark-border"` 추가. |

---

### ND-3 [MEDIUM] — `--color-text-disabled` dark 값

| 현재 | 후보 |
|---|---|
| var(--color-gray-dark-400) = #35363F | var(--color-gray-dark-600) = #55575F |

→ 더 밝은 값(600)이 dark 배경에서 접근성 향상. dark theme에서 시각 검증 후 결정.

---

### ND-4 [MEDIUM] — `--color-bg-home` raw HEX

현재 light 값: `#F5F6FB` — Foundation 등록 안 됨.

| 옵션 | 값 |
|---|---|
| A | 새 Foundation 등록: `--color-gray-home: #F5F6FB` |
| B | `--color-visual-gray-50: #F3F5F7` (근사값) |
| C | `--color-gray-0: #FAFAFA` (의미적 근사) |

---

### ND-5 [MEDIUM] — Chip 구조: 통합 vs line/solid 분리

| 현재 tokens.css | component-tokens-extracted.md |
|---|---|
| `--chip-*` 통합 구조 | `--chip-line-*` / `--chip-solid-*` 분리 |

→ Figma에서 line/solid 두 variant가 별도 token을 갖는지 확인 필요.

---

### ND-7 [LOW] — semantic.colors.json 갱신

18개 신규 semantic color 토큰이 tokens.css에는 있으나 semantic.colors.json에 미등록.

→ 결정: 기존 파일 확장(A) vs 별도 파일 분리(B).  
→ Claude가 A 방식으로 처리 가능. 승인만 받으면 즉시 반영 가능.

---

### ND-8 [LOW] — `--select-disabled-border` 위치

Input 그룹에 있는 Select 전용 토큰. Select 컴포넌트 레지스트리 생성 시 이동.

---

## 7. Alias / Deprecated Rules

### Alias 규칙

| legacy/figma | canonical (code) | 상태 | 비고 |
|---|---|---|---|
| `complete` (Figma state) | `filled` | confirmed | container bg/border 변화 없음. text만 변경. |
| `selected` (form-control) | `focus` | confirmed | Chip/Nav의 selected와 무관 |
| `success` (Figma state) | `correct` or `success` | **needs-decision** | ND-NAMING-01 참조 |
| `--input-filled-bg` | `--input-default-bg` | confirmed alias | filled bg = default bg |
| `--input-filled-border` | `--input-default-border` | confirmed alias | filled border = default border |
| `--color-form-control-border-correct` | `--color-form-control-border-selected` | alias | correct border = focus border |

### Deprecated 토큰

| cssVariable | 상태 | 대체 |
|---|---|---|
| `--button-ghost-*` (6개) | deprecated (tokens.css 유지) | `--button-blue-line-*` |
| `--button-danger-*` | deleted (영구) | 없음 — 재추가 금지 |
| `--input-hover-bg` | removed | 없음 |
| `--input-hover-border` | removed | 없음 |
| `--input-focus-bg` | removed | `--input-default-bg` |
| `--input-error-bg` | removed | `--input-default-bg` |
| `--chip-focus-ring` | removed (2026-05-18) | 없음 |
| `--select-disabled-border` | relocated | Select registry |

---

## 8. Duplicate 분석

| ID | 토큰 쌍 | 판정 |
|---|---|---|
| dup-1 | `text-placeholder` / `text-caption` | 의도적 분리 유지 |
| dup-2 | `border-focus` / `border-correct` | 의도적 분리 유지 |
| dup-3 | `text-correct` / `text-link` | 의도적 분리 유지 |
| **dup-4** | `border-default` / `border-disabled` (light 동일) | ⚠️ ND-2 해결 후 alias 가능성 검토 |
| dup-5 | `input-focus-border` → `form-control-border-selected` → `border-focus` 3단 체인 | 의도적 아키텍처. 정상. |

---

## 9. token-aliases.json 내부 모순 발견

`token-aliases.json` 파일 내에 **직접 모순**이 존재한다:

```json
// stateAliases.correct
"canonical": "correct",
"notes": ["--input-correct-border / --input-correct-text 는 canonical — deprecated 아님"]

// figmaStateMapping[success].description (같은 파일)
"Deprecated: 'correct'. Canonical: 'success'."
```

→ ND-NAMING-01 결정 시 이 파일도 함께 수정해야 한다.

---

## 10. Foundation layer 검토 — 아키텍처 안전성 확인

L2 재분류 결과 요약:

| 항목 | 내용 |
|---|---|
| Legacy "Foundation" 컬렉션 | classifier 오류로 0개로 잘못 분류 → 실제 133개 후보 확인 |
| Legacy Semantic 컬렉션 | 271개 → 138개 semantic-candidate + 115개 needs-review |
| Foundation namespace | gray/blue/red 등 10개 color scale (108개) + name-pattern 기반 25개 |

Code Registry Foundation (tokens.css 기준)과 Legacy Figma Foundation의 관계:
- Code Foundation 221개 primitives = Legacy Foundation 108개의 상위집합
- Legacy에는 dark scale, 일부 color 계열(coolgray) 미포함
- Legacy Semantic 일부가 Code Foundation에 해당 (`surface/neutral/bg/base` → `--color-bg-subtle` 등)

→ **Foundation 레이어 아키텍처는 안정적. Figma Foundation ↔ Code Foundation 1:1 매핑은 별도 단계(L5 또는 Figma sync)에서 처리.**

---

## 11. Component 레이어 아키텍처 확인

```
모든 Official Component 토큰의 색상 참조 체계:
  --{component}-{state}-{property}
    → --color-{semantic-category}-{role}   ← Semantic layer
      → var(--color-{foundation}-{step})   ← Foundation layer
```

**예외 없이 Semantic 경유 확인됨:**
- Button: action/surface/bg/text → semantic
- Input: form-control → semantic
- Checkbox/Radio: control-border → semantic
- Dropdown: form-control/surface/bg → semantic
- Toggle/Pagination/Navigation/Table: bg/text/border → semantic

→ **Component ↔ Semantic 참조 구조 아키텍처 안전.**

---

## 12. 다음 단계

| 우선순위 | 작업 | 담당 |
|---|---|---|
| 🔴 즉시 | **ND-NAMING-01**: correct vs success 결정 | Human |
| 🔴 즉시 | **ND-2**: Dark border rgba 처리 방식 결정 | Human |
| 🟡 다음 | ND-3: text-disabled dark 값 결정 | Human |
| 🟡 다음 | ND-4: bg-home HEX 처리 결정 | Human |
| 🟡 다음 | ND-5: Chip 구조 결정 | Human |
| 🟢 준비됨 | semantic.colors.json에 18개 new token 추가 (ND-7) | Claude (승인 후) |
| 🟢 준비됨 | 8개 Component registry JSON 생성 (chip~table) | Claude (승인 후) |
| 🟢 준비됨 | token-aliases.json 내부 모순 수정 | Claude (ND-NAMING-01 결정 후) |

---

*생성: Claude Sonnet 4.6 — 2026-05-18*  
*출력 파일: `registry/tokens/canonical-token-promotion-plan.json`*
