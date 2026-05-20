# MVP-L4.5 — Token Coverage Review

> 작성일: 2026-05-19  
> 단계: L5 Canonical Token Promotion 전 보정/분류/검토  
> 상태: **review** (확정 아님)  
> 입력: F0 Figma Variable Usage Audit + C0 Component Token Coverage Pilot  
> 출력: canonical-token-draft.json 보정 notes, legacy-token-usage-map.json 상태 업데이트, component-token-coverage.json rescanStatus 추가

---

## 1. 목적

F0 Figma Variable Usage Audit과 C0 Component Token Coverage 결과를 바탕으로,
L5 Canonical Token Promotion 전에 token draft의 부족/중복/이름/레이어 문제를 정리한다.

이번 단계는 **확정이 아니라 보정/분류/검토 상태 정리**다.  
Figma write/rename/delete 금지. canonical v0.1 promotion 금지.

---

## 2. 입력 데이터

| source | role | 비고 |
|---|---|---|
| F0 Variable Usage Audit | Figma 컴포넌트의 실제 variable 사용처 | partial — 8 nodes |
| C0 Component Coverage Pilot | 코드화한 컴포넌트의 token 요구사항 | 6 components |
| legacy-token-usage-map.json | F0 MCP audit 기반 legacy token 매핑 | 83개 항목 |
| canonical-token-draft.json | 앞으로의 canonical token 후보 | v0.1.0 draft |
| token-aliases.json | 상태/토큰 별칭 정의 | |
| deprecated-tokens.json | 제거/이전 확정 항목 + needsReview | |
| component-token-coverage.json | 컴포넌트별 토큰 커버리지 | C0 pilot 결과 |

---

## 3. F0 제약 사항

- MCP known nodeId 8개 기준 partial scan  
- Login input (6443:4408) / DatePicker (6443:4655) / TimePicker (6443:4606) 접근 실패 (ACCESS-01)  
- property-level binding 전수조사 미완료 — inferredRole은 추정값  
- mode별 값(light/dark) 비교 불가  
- 따라서 L4.5는 **확정이 아니라 review/promotion 준비 단계**

---

## 4. Summary

| status | count | 비고 |
|---|---:|---|
| `semantic-confirm-candidate` | 1 | color/form-control/* 섹션 (8개 semantic token 묶음) |
| `component-alias-candidate` | 1 | color/button/* 섹션 (3개 Figma Variable 묶음) |
| `rename-candidate` | 1 | color/text/state/accent-alt |
| `value-mismatch` | 1 | color/text/title/primary |
| `human-decision-required` | 3 | navigation 구조 / title/primary 값 / accent-alt 이름 |
| `dedup-candidate` | 5 | F-1~F-5 (border-width, radius, typography 대소문자, control-bg-disabled, border-disabled-alt1) |
| `rescan-needed` | 3 | ACCESS-01: Login input / DatePicker / TimePicker |
| `resolved (prior)` | 8 | ND-1~ND-6 (canonical-token-draft.json 기준) |
| `blocked` | 1 | Textarea (ACCESS-01 + not-implemented) |

---

## 5. Semantic Confirm Candidates

### color/form-control/* — `semantic-confirm-candidate`

**근거:** F0에서 `datepicker_input / form-control`(540:3794)과 `DatePicker Section 2`(6456:4033) 두 컴포넌트가 동일한 8개 Figma Variable을 공유 사용함을 확인.

| Figma Variable | value | usageCount | 확인 컴포넌트 |
|---|---|---:|---|
| color/form-control/bg/default | #ffffff | 2 | 540:3794, 6456:4033 |
| color/form-control/bg/disabled | #f5f5f5 | 2 | 540:3794, 6456:4033 |
| color/form-control/border/default | #d9d9d9 | 2 | 540:3794, 6456:4033 |
| color/form-control/border/selected | #1d6ceb | 2 | 540:3794, 6456:4033 |
| color/form-control/border/disabled | #d9d9d9 | 2 | 540:3794, 6456:4033 |
| color/form-control/text/default | #353535 | 2 | 540:3794, 6456:4033 |
| color/form-control/text/placeholder | #757575 | 2 | 540:3794, 6456:4033 |
| color/form-control/text/disabled | #c4c4c4 | 2 | 540:3794, 6456:4033 |

**결론:** semantic layer 유지 타당. `--color-form-control-*` 8개 토큰은 Input + DatePicker 공통 사용 확인됨.

**미확인 (rescan-needed):** Select, Textarea, TimePicker가 동일 form-control 변수를 사용하는지는 ACCESS-01 제약으로 미확인.

**canonical-token-draft.json 반영:** `colorFormControl` 섹션에 `l4_5_status`, `usageEvidence` notes 추가 완료.

---

## 6. Component Alias Candidates

### color/button/* — `component-alias-candidate`

**근거:** F0에서 button Variables가 button-primary 전용으로 3–4개 노드에서 사용됨.

| Figma Variable | value | usageCount | 비고 |
|---|---|---:|---|
| color/button/bg/primary--default | #1d6ceb | 3 | = --color-action-primary-default |
| color/button/border/primary--default | #1d6ceb | 3 | = --color-action-primary-default |
| color/button/label/primary--default | #ffffff | 4 | = --color-action-primary-text |

**결론:** Figma에서 이미 button 전용 Variable로 관리 → component-alias 구조 확인됨.  
canonical CSS `--button-primary-default-bg → var(--color-action-primary-default)` 구조 유지.

**canonical-token-draft.json 반영:** `component.button` 섹션에 `l4_5_status`, `usageEvidence` notes 추가 완료.

---

## 7. Naming Issues (rename-candidate)

### color/text/state/accent-alt — `rename-candidate`

| 항목 | 내용 |
|---|---|
| Figma Variable | `color/text/state/accent-alt` |
| Resolved value | `#ffffff` |
| usageCount | **5** (F0 최다 사용 text variable) |
| 사용 컨텍스트 | 선택된 day-cell(blue bg) 위의 날짜 숫자 텍스트, style guide 라벨 |
| 문제 | 'accent-alt' 이름 모호 |

**canonical 이름 후보:**

| 후보 | 평가 |
|---|---|
| `--color-text-on-accent` | 의미 가장 명확, 권장 |
| `--color-text-on-action` | action primary bg 위 텍스트, 좁은 의미 |
| `--color-text-inverse` | generic. 현재 `--color-text-inverse: #ffffff` 이미 존재 → alias 가능 |

**권장:** `--color-text-inverse`와 값이 동일(`#ffffff`)하므로 alias 처리가 효율적.  
action: Figma Variable rename 금지. 코드 canonical 이름만 결정. Human Decision 필요.

---

## 8. Value Mismatch

### color/text/title/primary — `value-mismatch` + `human-decision-required`

| 항목 | 내용 |
|---|---|
| Figma Variable | `color/text/title/primary` |
| Figma resolved value | `#000000` (pure black) |
| Canonical `--color-text-primary` | `#202020` (off-black, var(--color-gray-900)) |
| usageCount | 4 |
| 사용 노드 | 540:3836 (datepicker mobile), 6456:4033 (section2), 540:7663 (palette frame), 540:7368 (typography frame) |

**옵션:**

| 옵션 | 내용 |
|---|---|
| A | legacy token `--color-text-title-primary: #000000` 별도 신설 |
| B | canonical `#202020`으로 Figma 업데이트 (현재 단계 금지) |
| C | 사용처가 문서 노드 전용이면 canonical에 매핑하지 않고 문서용 foundation 직접 참조 처리 |

**권장:** 옵션 C 검토 권장. DatePicker heading 실제 사용 여부 Figma 직접 확인 후 결정.  
`--color-text-primary` status `stable` 값 변경 없음.

---

## 9. Dedup Candidates (5건)

### F-1. border-width/default ≡ border-width/100

- 값 동일: 1px. `border-width/100` usageCount: 2 (두 노드 모두 `border-width/default`도 사용)
- **결론:** 완전 중복. `border-width/100` → deprecated-alias 처리 권장.
- `legacy-token-usage-map.json` 상태 → `dedup-candidate` 업데이트 완료

### F-2. radius/4 ≡ radius/control/sm (부분 dedup)

- 값 동일: 4px. 레이어 역할 다름 (foundation vs semantic form-control)
- **결론:** 각각 유지 권장. semantic `--radius-control-sm`은 form-control 전용 반경 의미 있음.
- `legacy-token-usage-map.json` `l4_5_status: "dedup-candidate"` + resolution notes 업데이트 완료

### F-3. title/16M ≡ Title/16M (대소문자 중복)

- 값 동일: Pretendard 16 Medium. 동일 노드에서 동시 사용
- **결론:** canonical = `title/16M`(소문자). `Title/16M`(대문자) → deprecated-alias
- `legacy-token-usage-map.json` 상태 → `dedup-candidate` 업데이트 완료

### F-4. color/form-control/bg/disabled ≡ color/control/bg/disabled

- 값 동일: #f5f5f5. 의미 범위 다름 (폼 입력 전용 vs generic control)
- **결론:** 의도적 분리. 통합 권장 안 함. 역할 주석 보강 필요.
- `legacy-token-usage-map.json` `l4_5_status: "dedup-candidate"` + resolution notes 업데이트 완료

### F-5. color/control/border/disabled-alt1 — `remove-candidate`

- 값 동일: #d9d9d9 = `color/control/border/default`. usageCount: 1
- `-alt1` suffix = legacy variant 표시
- **결론:** remove-candidate. 사용처 1개 교체 후 deprecated 처리 가능.
- `legacy-token-usage-map.json` 상태 → `dedup-candidate` (내부 remove-candidate) 업데이트 완료

---

## 10. Rescan Needed (ACCESS-01)

| nodeId | nodeName | error |
|---|---|---|
| 6443:4408 | Login input frame | invalid node — UUID 57f814a0 |
| 6443:4655 | DatePicker component | invalid node — UUID 0b52f46d |
| 6443:4606 | TimePicker component | invalid node — UUID 40f7e142 |

**L4.5 결론:** "전수 확정 불가. Plugin Export Variable Usage 모드(MVP-F1) 필요."

**component-token-coverage.json 반영:** Textarea 항목에 `rescanStatus: "access-failed"` + `accessFailedComponents` 3개 배열 추가 완료.

---

## 11. Navigation Token 미결 분석 (HD-L4.5-A)

F0에서 `color/navigation/*` 5개 Variables가 DatePicker Section 2(6456:4033)에서만 사용됨 (usageCount: 각 1).

| Figma Variable | value | canonical 매핑 후보 |
|---|---|---|
| color/navigation/background | #ffffff | --color-surface-default 또는 --nav-bg |
| color/navigation/label/default | #555555 | --color-text-tertiary 또는 --nav-item-default-text |
| color/navigation/label/selected | #1d6ceb | --color-action-primary-default 또는 --nav-item-active-text |
| color/navigation/indicator/default | #d9d9d9 | --color-border-default 또는 --nav-divider |
| color/navigation/indicator/selected | #1d6ceb | --color-action-primary-default |

**분석:** 모든 값이 기존 canonical semantic token과 일치. DatePicker nav가 일반 nav와 같은 의미라면 기존 `--nav-*` 토큰 재사용 가능. DatePicker 전용 component token 별도 신설은 중복.

**status:** `human-decision-required` (HD-L4.5-A)

---

## 12. Human Decision Required

| id | decision | options | recommendation |
|---|---|---|---|
| HD-L4.5-A | color/navigation/* 구조 | A: DatePicker 전용 `--date-picker-nav-*` / B: 기존 `--nav-*` 재사용 | B 권장. 값이 nav semantic과 일치. DatePicker-only라도 재사용 가능. |
| HD-L4.5-B | color/text/title/primary value mismatch | A: legacy token 분리 / B: Figma 업데이트(금지) / C: 문서용 참조 처리 | C 권장. 문서 노드 전용 사용 가능성 높음. 확인 후 결정. |
| HD-L4.5-C | color/text/state/accent-alt rename | `--color-text-on-accent` 신설 / `--color-text-inverse` alias 처리 | `--color-text-inverse` alias 처리 권장 (값 동일, 중복 방지). |

---

## 13. L5 Readiness

| area | ready? | reason |
|---|---|---|
| foundation tokens | ready | stable 확정 완료 |
| semantic color tokens (core) | ready | bg, surface, text, border, icon, action, status — stable |
| color-form-control semantic | partial | Input+DatePicker 공유 확인. Select/Textarea/TimePicker rescan-needed |
| color-control-border semantic | ready | MVP4.4, stable |
| button component tokens | ready | primary/secondary/blue-line stable |
| input component tokens | ready | 2-layer 구조 stable |
| checkbox/radio/toggle | ready | stable |
| dropdown/select | partial | 4개 extra token candidate 등록 필요 잔여 |
| navigation tokens (Figma) | not ready | HD-L4.5-A human-decision-required |
| color/text/title/primary | not ready | value-mismatch HD-L4.5-B |
| color/text/state/accent-alt | not ready | rename-candidate HD-L4.5-C |
| border-width/100 dedup | not ready | deprecated-tokens.json 추가 미완 |
| Title/16M dedup | not ready | deprecated-tokens.json 추가 미완 |
| ACCESS-01 rescan | blocked | Plugin Export(MVP-F1) 필요 |

---

## 14. 다음 단계

1. **Human Decision 먼저 처리 (L5 진행 전 권장):**
   - HD-L4.5-A: navigation token 구조 결정
   - HD-L4.5-B: color/text/title/primary value-mismatch 해결
   - HD-L4.5-C: color/text/state/accent-alt canonical 이름 확정

2. **Dedup 처리 (Human Decision 불필요):**
   - `border-width/100` → deprecated-tokens.json 추가
   - `Title/16M`(대문자) → deprecated-tokens.json 추가
   - `color/control/border/disabled-alt1` → deprecated-tokens.json 추가 (사용처 교체 후)

3. **ACCESS-01 해소: Plugin Export Variable Usage 모드(MVP-F1) 실행:**
   - nodeId 재확인 및 Variable binding 데이터 수집

4. **L5 Canonical Token v0.1 Promotion:**
   - HD 항목 해결 후 진행
   - promotion-plan.json 기준 candidate → stable 전환

---

## 15. 변경 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `registry/tokens/canonical-token-draft.json` | colorFormControl l4_5 notes, button l4_5 notes, color-text-primary l4_5_value_mismatch notes, colorTextState l4_5_rename_candidate notes 추가 (값/구조 변경 없음) |
| `registry/tokens/legacy-token-usage-map.json` | border-width/100·accent-alt·title/primary·radius/control/sm·control-bg-disabled·border-disabled-alt1·Title/16M 상태 업데이트 |
| `registry/tokens/component-token-coverage.json` | Textarea 항목에 rescanStatus + accessFailedComponents 추가 |
| `reports/mvp-l4-5-token-coverage-review.md` | 본 파일 (F0+C0 합산 재작성) |
