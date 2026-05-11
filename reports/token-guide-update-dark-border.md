# Dark Border Token Guide Update

> 완료일: 2026-05-11
> Phase: MVP3 — Dark Semantic Border Opacity Composition Policy

## Status

Complete (policy 반영, token candidate 전환)

## Scope

Dark mode semantic border token의 opacity composition 정책 수립.
stable token 기준에서 Figma opacity composition 방식을 제외.

---

## Problem

Figma Variables에서 dark mode border token이 opacity composition 형태로 표현됨:

| Token | Figma opacity composition |
|-------|--------------------------|
| `--color-border-subtle` dark | `color/gray/100 + #FFFFFF 4%` |
| `--color-border-default` dark | `color/gray/200 + #FFFFFF 7%` |
| `--color-border-strong` dark | `color/gray/300 + #FFFFFF 12%` |
| `--color-border-emphasis` dark | `color/gray/800 + #FFFFFF 20%` |

이 방식은 Figma 상에서는 시각적으로 동작하지만, 코드 기반 registry, Source Guard, Figma Plugin, 자동 검수 하네스에서는 기준이 모호해진다.

기존 registry 상태: `"status": "stable"` + `"rgbaException": "dark-border"` (rgba 값 그대로 사용)

---

## Decision

Stable semantic border token은 명시적 resolved 값을 사용해야 한다.

**허용 stable 정의:**
1. Foundation dark scale token 참조 (예: `var(--color-gray-dark-300)`)
2. 시각 승인 후 resolved HEX 값

**stable로 허용하지 않음:**
- `rgba(255,255,255,N%)` 직접 사용
- `#FFFFFF + N%` opacity composition
- layer opacity를 token 정의로 사용

**Migration 경로:**
- Figma opacity composition 값 → `candidate` 상태로 downgrade
- `source.figma`에 원본 opacity composition 기록
- resolved 값 승인 후 stable로 전환

---

## Actions Taken

### semantic.colors.json 업데이트

4개 dark border token을 `stable` → `candidate`로 변경하고 source metadata 추가:

```json
{
  "cssVar": "--color-border-subtle",
  "light": "var(--color-gray-100)",
  "dark": "rgba(255,255,255,0.04)",
  "status": "candidate",
  "source": {
    "figma": "color/gray/100 + #FFFFFF 4%",
    "previousValue": "rgba(255,255,255,0.04)"
  },
  "description": "Figma opacity composition. Needs resolved HEX or foundation dark scale before stable release.",
  "note": "Human decision needed."
}
```

### token-exceptions.json 업데이트 (EX06 추가)

Figma opacity-composed dark border values를 migration candidate로만 허용하는 정책 추가.
`stableAllowed: false` 명시.

### audit-rules.json 업데이트 (R12, R13 추가)

- R12: `no-stable-opacity-composition-for-dark-border` — severity: warning
- R13: `dark-border-resolved-value-required` — severity: warning

---

## Human Decisions Needed

다음 4개 토큰의 dark 값을 실제 resolved HEX 또는 foundation dark scale 참조로 확정해야 합니다:

| Token | 현재 값 | 확정 방법 |
|-------|--------|----------|
| `--color-border-subtle` dark | `rgba(255,255,255,0.04)` | Figma에서 배경 위 실제 색 측정 또는 gray-dark scale 참조 |
| `--color-border-default` dark | `rgba(255,255,255,0.07)` | 동상 |
| `--color-border-strong` dark | `rgba(255,255,255,0.12)` | 동상 |
| `--color-border-emphasis` dark | `rgba(255,255,255,0.20)` | 동상 |

임의 계산 또는 추정 금지. 반드시 디자인 검수 후 확정.

---

## Impact on Product Components

- `tokens.css`에 현재 rgba 값이 남아있음 — CSS 동작에는 영향 없음
- Button CSS(`assets/css/components/button.css`)에서 border token은 secondary/blue-line border에만 사용됨
- Button secondary/blue-line의 border tokens: `--button-secondary-default-border`, `--button-secondary-hover-border` 등 — semantic을 경유하므로 직접 rgba 사용 아님 ✅

---

## Required Follow-up

1. Figma UX GUIDE V2.4에서 dark mode border 실제 색 측정 (배경색 고정 후 overlay 색 추출).
2. 또는 gray-dark scale 중 적합한 step 선택.
3. `semantic.colors.json` dark 값 업데이트 → status stable 전환.
4. `assets/css/tokens.css`에도 동기 반영.
5. Source Guard 구현 시 R12/R13 규칙 적용.
