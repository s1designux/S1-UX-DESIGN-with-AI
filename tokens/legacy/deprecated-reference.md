# Deprecated / Legacy Reference (격리 아카이브)

> ⚠️ 이 문서는 **폐기된 토큰·variant의 기록 보관용**이다. 활성 가이드가 아니다.
> 검사 게이트는 이 위치(`tokens/legacy/`)를 스캔하지 않는다. 신규 사용 금지.
> 활성 컴포넌트 가이드: `pages/components-new.html` · `pages/ai-snippets.html` · `pages/guide-md.html`
> 폐기 근거(기계 판정용): `registry/tokens/deprecated-tokens.json`

마지막 정리: 2026-06-16 — ai-snippets/guide-md·component-tokens.css 에서 ghost·danger variant 격리.

---

## Button — Ghost variant (deprecated 2026-05-11)

- 사유: 공식 variant 아님. blue-line 으로 대체. tokens.css 계열에 legacy 보존했으나 CSS 구현·실사용 0건.
- CSS 토큰은 `assets/css/legacy-tokens.css` 로 격리(미로드).

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/button/ghost/bg--hover | `--button-ghost-hover-bg` | `var(--color-bg-subtle)` | Ghost hover 배경 |
| color/button/ghost/bg--pressed | `--button-ghost-pressed-bg` | `var(--color-bg-muted)` | Ghost pressed 배경 |
| color/button/ghost/text--default | `--button-ghost-default-text` | `var(--color-text-secondary)` | Ghost 텍스트 |
| color/button/ghost/text--disabled | `--button-ghost-disabled-text` | `var(--color-text-disabled)` | Ghost disabled 텍스트 |
| color/button/ghost/icon--default | `--button-ghost-default-icon` | `var(--color-icon-default)` | Ghost 아이콘 |
| color/button/ghost/icon--disabled | `--button-ghost-disabled-icon` | `var(--color-icon-muted)` | Ghost disabled 아이콘 |

```css
/* Button — Ghost (legacy) */
--button-ghost-hover-bg:      var(--color-bg-subtle);
--button-ghost-pressed-bg:    var(--color-bg-muted);
--button-ghost-default-text:  var(--color-text-secondary);
--button-ghost-disabled-text: var(--color-text-disabled);
--button-ghost-default-icon:  var(--color-icon-default);
--button-ghost-disabled-icon: var(--color-icon-muted);
```

---

## Button — Danger variant (삭제 확정 2026-04-29 · 재추가 금지)

- 사유: 공식 V2.4 token 없음. 삭제 확정. semantic 에러색(`--color-text/border/icon-danger`)과 혼동 주의 — 그쪽은 활성.

| Figma 원본 | CSS Variable | Semantic 참조 | 설명 |
|---|---|---|---|
| color/button/danger/bg--default | `--button-danger-default-bg` | `var(--color-status-error)` | Danger 기본 배경 |
| color/button/danger/bg--hover | `--button-danger-hover-bg` | `var(--color-text-danger)` | Danger hover 배경 |
| color/button/danger/text--default | `--button-danger-default-text` | `var(--color-action-primary-text)` | Danger 텍스트 |
| color/button/danger/icon--default | `--button-danger-default-icon` | `var(--color-action-primary-text)` | Danger 아이콘 |

```css
/* Button — Danger (deleted) */
--button-danger-default-bg:   var(--color-status-error);
--button-danger-hover-bg:     var(--color-text-danger);
--button-danger-default-text: var(--color-action-primary-text);
--button-danger-default-icon: var(--color-action-primary-text);
```
