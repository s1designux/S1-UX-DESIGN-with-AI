# MVP3 Button Review

> 완료일: 2026-05-11
> Phase: MVP3 — Button Core Component 구현

## Status

Draft (harness 구현 완료, Figma 시각 비교 검수 미완료)

## Scope

Button core component의 registry 기반 HTML harness 구현 및 token 검수.

---

## Updated Files

| 파일 | 변경 내용 |
|------|----------|
| `registry/components/button.json` | version 0.2.0, summary/platformSupport/themeSupport/sizing/pendingVariants/tokens map 추가 |
| `assets/css/components/button.css` | **신규** — sw-button 네이밍, V2.4 component token 기반 |
| `assets/js/button-harness.js` | **신규** — registry 기반 status/token 렌더링, theme/platform toggle |
| `pages/button-harness.html` | **신규** — 8섹션 Button Harness 페이지 |

---

## Token Usage

모든 색상 token은 V2.4 component token을 사용함. raw HEX 없음.

### Primary
| Property | Token |
|----------|-------|
| default bg | `--button-primary-default-bg` |
| hover bg | `--button-primary-hover-bg` |
| pressed bg | `--button-primary-pressed-bg` |
| disabled bg | `--button-primary-disabled-bg` |
| text | `--button-primary-default-text` |
| disabled text | `--button-primary-disabled-text` |
| focus ring | `--button-primary-focus-ring` |

### Secondary
| Property | Token |
|----------|-------|
| default bg | `--button-secondary-default-bg` |
| hover bg | `--button-secondary-hover-bg` |
| pressed bg | `--button-secondary-pressed-bg` |
| disabled bg | `--button-secondary-disabled-bg` |
| default border | `--button-secondary-default-border` |
| hover border | `--button-secondary-hover-border` |
| disabled border | `--button-secondary-disabled-border` |
| text | `--button-secondary-default-text` |
| disabled text | `--button-secondary-disabled-text` |
| focus ring | `--button-secondary-focus-ring` |

### Blue-line
| Property | Token |
|----------|-------|
| default bg | `--button-blue-line-default-bg` |
| hover bg | `--button-blue-line-hover-bg` |
| pressed bg | `--button-blue-line-pressed-bg` |
| disabled bg | `--button-blue-line-disabled-bg` |
| default border | `--button-blue-line-default-border` |
| hover border | `--button-blue-line-hover-border` |
| disabled border | `--button-blue-line-disabled-border` |
| text | `--button-blue-line-default-text` |
| disabled text | `--button-blue-line-disabled-text` |
| focus ring | `--button-blue-line-focus-ring` |

---

## Variants

- **Primary** ✅ — 구현 완료. tokenStatus: stable.
- **Secondary** ✅ — 구현 완료. tokenStatus: stable.
- **Blue-line** ✅ — 구현 완료. tokenStatus: stable. darkModeStatus: pending (검수 필요).
- **Danger** ❌ — 삭제 확정 (2026-04-29). 공식 V2.4 component token 없음. `pendingVariants`로 기록.
- **Ghost** ⬜ — tokens.css에 존재하나 harness에서 blue-line으로 대체됨. `pendingVariants` legacy로 기록.

---

## Size Support

| Size key | Token | 실제 높이 |
|----------|-------|----------|
| sm | `--sizing-button-height-xs` | 34px |
| md | `--sizing-button-height-md` | 44px |
| lg | `--sizing-button-height-lg` | 48px |

- `min-width`: `--sizing-button-min-width` (80px)
- `border-radius`: `--radius-button-md` (= `--radius-4` = 4px)

---

## State Support

| State | 구현 방법 |
|-------|---------|
| default | 기본 클래스 |
| hover | `:hover` + `.is-hover` |
| pressed | `:active` + `.is-pressed` |
| focus | `:focus-visible` + `.is-focus` |
| disabled | `:disabled` + `.is-disabled` |
| loading | `.sw-button--loading` + CSS animation |

---

## Light / Dark Support

- Light: `:root` 기반 semantic token 자동 적용
- Dark: `[data-theme="dark"]` 스코프의 semantic token remapping으로 자동 전환
- button-harness.html: `data-theme-toggle` 버튼 → `id="button-preview"` (main element)에 `data-theme="dark"` 속성 설정

---

## Platform Support

| Platform | 상태 |
|----------|------|
| All | ✅ — `.view-all` 클래스, PC + Mobile 모두 표시 |
| PC | ✅ — `.view-pc`, 3 sizes (sm/md/lg), 4 states (default/hover/pressed/disabled) |
| Mobile | ✅ — `.view-mobile`, 1 size (lg), 3 states (default/pressed/disabled, hover 없음) |

---

## Accessibility Review

| 항목 | 상태 |
|------|------|
| focus-visible | ✅ — `:focus-visible` 구현. outline: 2px solid focus-ring token |
| disabled | ✅ — pointer-events:none, cursor:not-allowed. `:disabled` + `.is-disabled` 양방향 처리 |
| loading | ✅ — pointer-events:none, cursor:wait. `sw-button--loading::after` CSS spinner |
| keyboard | ✅ — 기본 `<button>` 요소 사용 (Tab/Enter/Space 자동 지원) |
| ARIA | ⬜ — 아이콘만 있는 버튼 `aria-label` 미검증. a11yStatus: pending |

---

## Figma Mapping Review

| 항목 | 상태 |
|------|------|
| componentSetKey | ⬜ — 미완료 (빈 문자열) |
| componentName | ✅ — "Button" |
| propertyMap | ✅ — Variant/Size/State 매핑 정의됨 |
| valueMap | ✅ — primary/secondary/blue-line/sm/md/lg/default/hover/pressed/disabled |

---

## Validation

| 검수 항목 | 결과 |
|---------|------|
| raw HEX 사용 | ✅ Pass — button.css에 HEX 없음 |
| undefined token 사용 | ✅ Pass — 모든 var() 참조가 tokens.css에 정의됨 |
| Foundation color 직접 참조 | ✅ Pass — semantic/component token만 사용 |
| 공식 component token 사용 | ✅ Pass — registry/tokens/component.tokens.json button 섹션 기준 |
| focus-visible 구현 | ✅ Pass |
| disabled 상태 구현 | ✅ Pass |
| loading 상태 표시 | ✅ Pass (CSS spinner, aria-busy 권장 사항 표시됨) |
| dark theme 토큰 자동 전환 | ✅ Pass — semantic token remapping 정상 동작 |

---

## Warnings

- `--button-primary-disabled-bg`: `var(--color-border-default)` 참조 중. dark에서 `rgba(255,255,255,0.07)` 값 (candidate). `var(--color-bg-muted)` 참조로 수정 검토 중.
- blue-line variant darkModeStatus: pending — 시각 검증 미완료.
- `--color-border-*` dark 값이 모두 candidate 상태. secondary/blue-line border가 이 토큰을 경유하므로 dark mode border 시각 검증 필요.
- Figma componentSetKey 없음 — Figma 비교 자동화 불가.

---

## Next Review

1. Figma UX GUIDE V2.4에서 Button visual 비교 검수.
2. dark mode 버튼 상태 시각 검증 (특히 disabled, blue-line).
3. `--button-primary-disabled-bg` dark 값 확정 (candidate → stable).
4. Figma componentSetKey 확보 (MCP/Plugin).
5. ARIA 검수 (icon-only button aria-label).
6. Input 또는 Checkbox implementation 시작.
