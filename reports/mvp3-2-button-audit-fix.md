# MVP3.2 Button Variant Audit & Fix

> 완료일: 2026-05-11
> Phase: MVP3.2 — Button Variant 기준 수정 및 구현 품질 검수

## Status

Complete (blue-line token 추가, ghost 제거, HTML/CSS code view 추가)

## Scope

Button의 공식 variant 기준(primary / secondary / blue-line)에 맞게 구현 정합성을 검수하고 수정한다.
ghost variant를 구현에서 제거하고 deprecated 처리한다.
HTML/CSS code view 섹션을 button-harness.html에 추가한다.

---

## Audit Findings

| 항목 | 발견 내용 | 조치 |
|------|---------|------|
| `--button-blue-line-*` in tokens.css | ❌ **완전 누락** — 10개 토큰 미정의 | ✅ tokens.css에 추가 |
| `--button-blue-line-*` in component.tokens.json | ❌ **누락** — ghost만 있었음 | ✅ blue-line 그룹 추가 |
| `ghost` in button.css | ❌ 풀 구현 상태 (.sw-button--ghost CSS 규칙 존재) | ✅ deprecated 주석으로 대체 |
| `ghost` in component.tokens.json | ❌ status: stable | ✅ status: deprecated, usedBy: [] 수정 |
| `ghost` in figma-map.json | ⚠️ ghost가 variants에 포함, note 없음 | ✅ status: deprecated 추가 |
| HTML/CSS code view | ❌ button-harness.html에 없음 | ✅ Section 6으로 추가 |

---

## Changes

### `assets/css/tokens.css`

`--button-ghost-*` 섹션 앞에 `--button-blue-line-*` 10개 토큰 추가:

| Token | Value |
|-------|-------|
| `--button-blue-line-default-bg` | `var(--color-surface-default)` |
| `--button-blue-line-hover-bg` | `var(--color-action-primary-subtle)` |
| `--button-blue-line-pressed-bg` | `var(--color-action-primary-subtle)` |
| `--button-blue-line-disabled-bg` | `var(--color-bg-subtle)` |
| `--button-blue-line-default-border` | `var(--color-action-primary-default)` |
| `--button-blue-line-hover-border` | `var(--color-action-primary-hover)` |
| `--button-blue-line-disabled-border` | `var(--color-border-subtle)` |
| `--button-blue-line-default-text` | `var(--color-action-primary-default)` |
| `--button-blue-line-disabled-text` | `var(--color-text-disabled)` |
| `--button-blue-line-focus-ring` | `var(--color-border-focus)` |

Ghost 섹션 주석 업데이트: `(legacy — do not use in new code)`

### `registry/tokens/component.tokens.json`

`tokens.button` 에 `blue-line` 그룹 추가 (10개 토큰, status: stable).
`ghost` 그룹 tokens: status `stable` → `deprecated`, `usedBy: []`로 변경.

### `assets/css/components/button.css`

`.sw-button--ghost` CSS 규칙 블록 제거.
GHOST 섹션은 deprecated 주석만 남김:
```
/* GHOST — DEPRECATED
   Not an official V2.4 variant. CSS variables preserved in tokens.css
   for backwards compatibility only. Use .sw-button--blue-line instead. */
```

### `registry/figma/figma-map.json`

Button variants에서 ghost에 `"status": "deprecated"` 및 note 추가.
Blue-line note 업데이트: "CSS tokens extracted in tokens.css (2026-05-11)."

### `pages/button-harness.html`

Section 6 "HTML / CSS Code" 추가 (기존 Section 6~8이 7~9로 이동).

**HTML 탭**: primary / secondary / blue-line 각 3 sizes + disabled + loading 사용 예시.
**CSS 탭**: Base+Sizes / Primary / Secondary / Blue-line 각 CSS 규칙 스니펫.
Copy 버튼: `navigator.clipboard.writeText` 기반.

### `assets/js/button-harness.js`

`renderButtonTokenUsage`: `OFFICIAL_VARIANTS = ['primary', 'secondary', 'blue-line']` 필터 추가 — ghost 토큰이 Token Usage 섹션에 표시되지 않도록 처리.
`renderVariant`: `badge-deprecated` 클래스 추가.

---

## Token Validation (MVP3.2 기준)

| 검수 항목 | 결과 |
|---------|------|
| raw HEX 사용 | ✅ Pass |
| blue-line 토큰 정의 | ✅ Pass (추가 완료) |
| ghost 구현 제거 | ✅ Pass |
| Foundation color 직접 참조 | ✅ Pass — 전 토큰 semantic 경유 |
| component.tokens.json 정합 | ✅ Pass — blue-line 추가, ghost deprecated |
| tokens.css 정합 | ✅ Pass |
| figma-map.json 정합 | ✅ Pass |
| HTML/CSS code view | ✅ Pass |

---

## Variant Coverage (확정)

| Variant | 상태 | tokens.css | component.tokens.json | button.css |
|---------|------|-----------|----------------------|-----------|
| primary | ✅ Official | ✅ | ✅ stable | ✅ |
| secondary | ✅ Official | ✅ | ✅ stable | ✅ |
| blue-line | ✅ Official | ✅ (신규 추가) | ✅ stable (신규 추가) | ✅ |
| ghost | ⚫ Deprecated | ✅ legacy 유지 | ✅ deprecated | 제거됨 |
| danger | ⛔ Deleted | — | — | — |

---

## Remaining Warnings

- blue-line `darkModeStatus: pending` — 시각 검증 미완료.
- `--button-primary-disabled-bg` dark 값: `var(--color-border-default)` = rgba candidate.
- Figma componentSetKey 전 컴포넌트 미완료.

---

## Next

1. Dark mode 시각 검증 (특히 blue-line, disabled 상태).
2. `--button-primary-disabled-bg` dark 값 확정.
3. Checkbox 또는 Input implementation 시작.
