# MVP-C0 — Component Token Coverage Pilot

> 작성일: 2026-05-19  
> 기준 파일: assets/css/tokens.css · registry/tokens/canonical-token-draft.json · canonical-token-promotion-plan.json · token-aliases.json · tokens/component-tokens-extracted.md · pages/components.html

---

## 1. 목적

Components 핵심 7종을 HTML/CSS 구현 관점에서 검토하고,  
현재 canonical-token-draft 기준으로 토큰 커버리지를 검증한다.

---

## 2. 원칙

- Code Registry가 source of truth다.
- deprecated alias(`correct` 이름 자체는 canonical — 재명명 금지. `complete`는 deprecated, `filled` 사용).
- registry에 없는 token을 임의 생성하지 않는다.
- Figma Variable write/rename/delete 금지.
- components.html 수정은 이 보고서 기록 후 사용자 승인 시 진행.

---

## 3. Summary

| 항목 | 값 |
|---|---|
| 코드화 완료 컴포넌트 | 6 (Button, Input, Search Input, Password Field, Input with Unit, Select) |
| 미구현 컴포넌트 | 1 (Textarea) |
| 사용 token 수 (고유, 컴포넌트+시멘틱 포함) | 약 56개 |
| missing token (신규 정의 필요) | 5건 |
| alias candidate | 1건 |
| deprecated 사용 발견 | 2건 |
| needs decision | 4건 |

---

## 4. 컴포넌트별 결과

| 컴포넌트 | 상태/variant 구현 | tokens used | coverage issue |
|---|---|---|---|
| Button | primary/secondary/blue-line · default/hover/pressed/disabled | 24 component tokens | loading 상태 미구현, icon token 미적용, --color-border-disabled dark 미정의 |
| Input | default/focus/complete/error/correct/disabled (3 sizes) | 22 component+semantic tokens | readonly 미구현, is-error-text 클래스 CSS 누락, --color-text-state-correct Foundation 직접 참조, --input-action-icon 미정의 |
| Search Input | suffixActionGroup: clear+search | Base Input 토큰 상속 | error/disabled 상태 없음, action-icon token 없음 |
| Password Field | suffixActionGroup: visibilityToggle+clear | Base Input 토큰 상속 | error/disabled 상태 없음 |
| Input with Unit | suffixText: unitLabel | Base Input 토큰 상속 | 없음 |
| Select | default/open/selected/disabled | 15 component tokens (4개 비정규) | 4개 extra token 미등록, --dropdown-list-bg 불일치, --select-disabled-border stray, error/correct 미구현 |
| Textarea | 미구현 | 없음 | registry/components/textarea.json 없음 |

---

## 5. Missing Token 목록

| id | component | state | property | recommendation |
|---|---|---|---|---|
| missing-001 | Input | readonly | border-color | --color-form-control-border-readonly 신설 검토 (Human Decision C0-D001) |
| missing-002 | Input, Search Input, Password Field | default | action-icon-color | --input-action-icon → var(--color-icon-emphasis) alias 신설 |
| missing-003 | Input | default | typed-text-color | --color-form-control-text-default을 components.html :root에 명시 추가 |
| missing-004 | Button | loading | bg/border/text/icon | Figma loading variant 조회 후 토큰 신설 |
| missing-005 | Select | default | placeholder-text, selected-text, list-border, selected-option-text | canonical-token-draft.json dropdown 섹션에 4개 토큰 추가 |

---

## 6. Deprecated Usage

| component | token / issue | canonical 대체 / 조치 |
|---|---|---|
| Input (components.html :root) | `--color-text-state-correct: var(--color-blue-400)` — Foundation 직접 참조 | `--color-text-state-correct: #1D6CEB` (HEX 인라인)로 교체하거나 tokens.css 링크 방식으로 전환 |
| All (components.html dark section) | `--color-border-subtle/default/strong/emphasis` dark값이 여전히 rgba(255,255,255,0.04/0.07/0.12/0.20) 사용 — ND-2에서 tokens.css는 수정 완료, components.html 미동기화 | tokens.css 기준(gray-dark-200/300/500/700)으로 동기화 필요 |

---

## 7. Token Coverage Issues

| issue | component | recommendation |
|---|---|---|
| Button: loading 상태 미구현 | Button | Figma loading variant 원본 확인 후 token + CSS 추가 |
| Button: icon token 미적용 | Button | --button-primary-default-icon 등 icon token을 SVG 색상에 명시 적용 |
| Button: dark mode disabled border 누락 | Button (components.html) | components.html dark 섹션에 --color-border-disabled: var(--color-gray-dark-200) 추가 |
| Input: is-error-text / is-correct-text 클래스 CSS 없음 | Input | 독립 클래스 규칙 추가 또는 클래스 제거 후 부모 state 방식으로 통일 |
| Input: --color-text-state-correct Foundation 직접 참조 | Input | components.html :root 수정 |
| Input: --input-action-icon 미정의 | Input, Search Input, Password Field | component alias 신설 검토 |
| Input: --color-form-control-text-default 미정의 (components.html) | Input | :root에 추가 |
| Input: readonly 상태 미구현 | Input | Human Decision C0-D001 후 진행 |
| Select: 4개 extra token 비정규 | Select | canonical 등록 또는 semantic 직접 참조 교체 |
| Select: --dropdown-list-bg 불일치 | Select | canonical(surface-raised)로 통일 (Decision C0-D002) |
| Select: --select-disabled-border stray token | Select | select.json 생성 후 이전 (ND-8) |
| Select: error/correct 상태 없음 | Select | Figma Select error/correct 조회 후 추가 |
| Textarea: 미구현 | Textarea | CLAUDE.md 미결 #10 — Input 안정화 후 구현 |
| Dark border 미동기화 | All (components.html) | ND-2 수정 결과를 components.html에 반영 |

---

## 8. L5 전에 결정해야 할 항목

| decision | options | recommendation |
|---|---|---|
| C0-D001: Input readonly 상태 등록 여부 | A: token 신설 / B: disabled와 동일 처리 | Figma readonly state 존재 여부 확인 후 결정 |
| C0-D002: --dropdown-list-bg surface-raised vs surface-default | A: surface-raised (canonical) / B: surface-default (현재 구현) | Option A 권장 — canonical 기준, dark 레이어 분리 |
| C0-D003: components.html dark border 동기화 방식 | A: dark 섹션에 직접 추가 / B: tokens.css 링크 방식 전환 | 단기: A, 장기: B |
| C0-D004: Button loading 상태 토큰 | A: Figma 조회 후 신설 / B: disabled 시각과 동일 | Figma 확인 우선 |

---

## 9. 검증 결과

**HEX 직접 사용 발견:**  
- components.html 인라인 토큰 정의 섹션 (`:root`, `[data-theme="dark"]`)에서 다수의 HEX 값 직접 사용. 이는 tokens.css 미임포트 구조에서 불가피한 인라인 방식이며, tokens.css 값과 동기화되어 있음. 단, --color-border-subtle/default/strong/emphasis dark 값이 rgba로 잔존 (ND-2 미동기화).
- UI 페이지 Chrome/navigation 색상 (#f3f4f6, #e5e7eb, #1d4ed8 등)은 디자인시스템 컴포넌트 토큰이 아닌 harness UI 전용 색상으로 허용 범위.

**deprecated alias 신규 사용:**  
- `--input-correct-border`, `--input-correct-text`, `--input-correct-*` 계열은 canonical이므로 문제 없음.
- `complete` 상태 레이블이 components.html matrix 헤더에 표시되어 있으나 (`Complete` 컬럼), 실제 CSS/token은 default 값을 사용 (no separate token) — 이는 aliases 정의에 부합하므로 정상.

**Foundation 직접 참조 위반:**  
- components.html :root의 `--color-text-state-correct: var(--color-blue-400)` — Foundation var() 직접 참조. 아키텍처 위반.
- 동일 파일 내 `--color-action-primary-hover: #1756BC` — HEX 직접 사용. 단, 이 값은 tokens.css의 --color-blue-450 (#2158C8)와 불일치. tokens.css 값 기준 동기화 필요.

---

## 10. 추가 발견: components.html vs tokens.css 불일치

아래 항목은 components.html 인라인 토큰 정의가 tokens.css와 일치하지 않음.

| token | components.html 값 | tokens.css 값 | 비고 |
|---|---|---|---|
| --color-action-primary-hover | #1756BC | var(--color-blue-450) = #2158C8 | HEX 불일치 |
| --color-text-placeholder | #9D9D9D | var(--color-gray-400) = #9D9D9D | HEX 일치, 다만 gray-400이 아닌 gray-500(#757575)이 확정값. 주의: tokens.css에서 --color-text-placeholder: var(--color-gray-500) = #757575이고, components.html은 #9D9D9D(=gray-400). MVP-T1에서 placeholder = gray/500 (#757575) 확정. components.html 불일치. |
| --color-border-subtle (dark) | rgba(255,255,255,0.04) | var(--color-gray-dark-200) | ND-2 미동기화 |
| --color-border-default (dark) | rgba(255,255,255,0.07) | var(--color-gray-dark-300) | ND-2 미동기화 |
| --color-border-strong (dark) | rgba(255,255,255,0.12) | var(--color-gray-dark-500) | ND-2 미동기화 |
| --color-border-emphasis (dark) | rgba(255,255,255,0.20) | var(--color-gray-dark-700) | ND-2 미동기화 |

> --color-text-placeholder 불일치는 별도 missing token으로 등록이 필요. MVP-T1에서 gray/500 (#757575) 확정 완료.

---

## 11. 다음 단계

1. **MVP-L4.5 Token Coverage Review** — 이번 결과 기반으로 canonical-token-draft.json 보정
   - missing-005 (Select extra tokens) canonical 등록
   - deprecated usage 2건 수정 승인 후 반영
   - --color-text-placeholder components.html 불일치 수정
   - --dropdown-list-bg canonical 기준 통일 (C0-D002)

2. **Human Decision 처리**
   - C0-D001: Input readonly 상태 결정
   - C0-D002: dropdown-list-bg 참조 통일
   - C0-D003: components.html dark border 동기화 방식
   - C0-D004: Button loading 상태 결정

3. **이후 MVP-L5 Canonical Token v0.1 Promotion**
   - C0 결과 기반 draft 보정 완료 후 진행
   - 8개 컴포넌트 registry JSON 생성 (decision-004)
