# MVP3.4 Button Figma MCP Comparison

**Status:** Complete — Figma MCP 실측 비교 완료  
**Date:** 2026-05-12

---

## 1. Figma MCP 연결 결과

- **파일:** SW-UX-GUIDE V2.4 (`yE5UCFEbmXJBlYJWB24Lz2`)
- **비교 노드:** `6440:4032` (Section 2 — PC + Mobile Button 전체 매트릭스)
- **MCP 도구:** `get_design_context` — 개별 symbol 노드별 토큰명 + resolved HEX 수집
- **결과:** 전체 variant × size × state 실측값 확보 ✅

### 조회한 노드 목록

| 노드 ID | 내용 |
|---|---|
| `540:4501` | primary / medium / default |
| `540:4521` | primary / medium / hover |
| `540:4441` | primary / medium / disabled |
| `540:4541` | secondary / medium / default |
| `540:4561` | secondary / medium / hover |
| `540:4461` | secondary / medium / disabled |
| `540:4581` | blue-line / medium / default |
| `540:4601` | blue-line / medium / hover |
| `540:4481` | blue-line / medium / disabled |

---

## 2. Figma 실측값 정리

### 2-1. Foundation → Semantic 역방향 매핑 (Light mode)

| Figma HEX | Foundation 토큰 | Semantic 토큰 | 역할 |
|---|---|---|---|
| `#F5F5F5` | `--color-gray-50` | `--color-bg-subtle` | disabled 배경 |
| `#E9E9E9` | `--color-gray-100` | `--color-border-subtle` | (사용 없음) |
| `#D9D9D9` | `--color-gray-200` | `--color-border-default` | disabled 테두리, secondary 테두리 |
| `#C4C4C4` | `--color-gray-300` | `--color-text-disabled` / `--color-border-strong` | disabled 텍스트 |
| `#353535` | `--color-gray-800` | `--color-text-secondary` | secondary / blue-line 텍스트 |
| `#1D6CEB` | `--color-blue-400` | `--color-action-primary-default` = `--color-text-link` | blue-line 텍스트·테두리, primary BG |
| `#2158C8` | `--color-blue-450` | `--color-action-primary-hover` | (hover primary BG) |
| `#E2F1FF` | `--color-blue-50` | `--color-action-primary-subtle` | blue-line hover BG |

### 2-2. Figma 노드별 실측값

| 상태 | Figma 토큰명 | Resolved HEX | 속성 |
|---|---|---|---|
| **Primary default** | `color/button/bg/primary--default` | `#1D6CEB` | bg |
| | `color/button/border/primary--default` | `#1D6CEB` | border |
| | `color/button/label/primary--default` | `#FFFFFF` | text |
| **Primary disabled** | `color/button/bg/disabled` | `#F5F5F5` | bg (shared) |
| | `color/button/border/disabled` | `#D9D9D9` | border (shared) |
| | `color/button/label/disabled` | `#C4C4C4` | text (shared) |
| **Secondary default** | `color/button/bg/secondary--default` | `#FFFFFF` | bg |
| | `color/button/border/secondary--default` | `#D9D9D9` | border |
| | `color/button/label/secondary--default` | `#353535` | text |
| **Secondary hover** | (gradient: rgba(0,0,0,0.05) + white) | ≈ `#F2F2F2` | bg |
| | `color/button/border/secondary--default` | `#D9D9D9` | border ← **default와 동일, 변화 없음** |
| | `color/button/label/secondary--hover` | `#353535` | text |
| **Secondary disabled** | `color/button/bg/disabled` | `#F5F5F5` | bg (shared) |
| | `color/button/border/disabled` | `#D9D9D9` | border (shared) |
| | `color/button/label/disabled` | `#C4C4C4` | text (shared) |
| **Blue-line default** | `color/button/bg/blue-line--default` | `#FFFFFF` | bg |
| | `color/button/border/blue-line--default` | `#1D6CEB` | border |
| | `color/button/label/blue-line--default` | `#1D6CEB` | text |
| **Blue-line hover** | `color/button/bg/blue-line--hover` | `#E2F1FF` | bg |
| | `color/button/border/blue-line--hover` | `#1D6CEB` | border ← **default와 동일, 변화 없음** |
| | `color/button/label/blue-line--hover` | `#1D6CEB` | text |
| **Blue-line disabled** | `color/button/bg/disabled` | `#F5F5F5` | bg (shared) |
| | `color/button/border/disabled` | `#D9D9D9` | border (shared) |
| | `color/button/label/disabled` | `#C4C4C4` | text (shared) |

> **중요 발견:** Figma는 primary / secondary / blue-line 3개 variant의 disabled 상태에 동일한 공유 토큰(`color/button/bg/disabled`, `color/button/border/disabled`, `color/button/label/disabled`)을 사용한다.

---

## 3. Variant / Size / State 구조 확인

| 항목 | Figma | 구현 | 일치 |
|---|---|---|---|
| Variant: primary | ✅ | ✅ | ✅ |
| Variant: secondary | ✅ | ✅ | ✅ |
| Variant: blue-line | ✅ | ✅ | ✅ |
| PC size: medium (44px) | ✅ | ✅ | ✅ |
| PC size: xsmall (34px) | ✅ | ✅ | ✅ |
| PC size: xxsmall (28px) | ✅ | ✅ s1-btn / ❌ sw-button 미구현 | ⚠️ |
| Mobile size: (48px) | ✅ | ✅ | ✅ |
| State: default | ✅ | ✅ | ✅ |
| State: hover | ✅ | ✅ | ✅ |
| State: pressed | ✅ (mobile only) | ✅ | ✅ |
| State: disabled | ✅ | ✅ | ✅ |
| Icon variant (off/on) | ✅ Figma에 있음 | ❌ 미구현 | ⚠️ 미구현 |

---

## 4. 토큰 불일치 상세 — Figma 실측값 기반 정정

### 핵심 발견: components.html이 대부분 정확하고, tokens.css / component.tokens.json이 틀렸다

| # | 토큰 | Figma 실측 | 올바른 Semantic | component.tokens.json / tokens.css | components.html | 판정 |
|---|---|---|---|---|---|---|
| 1 | `--button-primary-disabled-bg` | `#F5F5F5` | `var(--color-bg-subtle)` | `var(--color-border-default)` ← **#D9D9D9 ❌** | `var(--color-bg-subtle)` ✅ | **registry 수정 필요** |
| 2 | `--button-primary-disabled-border` | `#D9D9D9` | `var(--color-border-default)` | **정의 없음 ❌** | `var(--color-border-default)` ✅ | **registry 추가 필요** |
| 3 | `--button-secondary-hover-border` | `#D9D9D9` (default와 동일) | **별도 토큰 없음** (hover = default) | `var(--color-border-strong)` = `#C4C4C4` **❌** | 정의 없음 ✅ (올바름) | **registry에서 제거 필요** |
| 4 | `--button-secondary-disabled-border` | `#D9D9D9` | `var(--color-border-default)` | `var(--color-border-subtle)` = `#E9E9E9` **❌** | `var(--color-border-default)` ✅ | **registry 수정 필요** |
| 5 | `--button-blue-line-hover-border` | `#1D6CEB` (default와 동일) | `var(--color-action-primary-default)` | `var(--color-action-primary-hover)` = `#2158C8` **❌** | `var(--color-action-primary-default)` ✅ | **registry 수정 필요** |
| 6 | `--button-blue-line-disabled-border` | `#D9D9D9` | `var(--color-border-default)` | `var(--color-border-subtle)` = `#E9E9E9` **❌** | `var(--color-border-default)` ✅ | **registry 수정 필요** |
| 7 | `--button-blue-line-default-text` | `#1D6CEB` | `var(--color-action-primary-default)` | `var(--color-action-primary-default)` ✅ | `var(--color-text-link)` ⚠️ | **Light 동일, Dark 상이** |

### 토큰 7번 상세 설명

`--color-action-primary-default` 와 `--color-text-link` 은 Light mode에서 동일한 `#1D6CEB`로 해석된다.  
하지만 Dark mode에서는 다른 토큰을 참조한다:
- `--color-action-primary-default` dark = `var(--color-blue-dark-300)` 
- `--color-text-link` dark = `var(--color-blue-dark-400)`

Figma 버튼 라벨 역할에는 `color-action-primary-default` 가 의미론적으로 정확하다.  
`components.html`을 `color-action-primary-default` 로 수정해야 Dark mode 정합성이 확보된다.

### Secondary hover 배경색 차이

| 항목 | Figma | 구현 |
|---|---|---|
| BG 방식 | `rgba(0,0,0,0.05)` overlay on white ≈ `#F2F2F2` | `var(--color-bg-subtle)` = `#F5F5F5` |
| 시각 차이 | 약 3% 명도 차 | 허용 범위 내 — 수정 불필요 |

---

## 5. 구조적 불일치

### 5-1. 이중 CSS 시스템

| 항목 | `sw-button` (button.css) | `s1-btn` (components.html 인라인) |
|---|---|---|
| 네이밍 | BEM (`sw-button--primary`) | 레거시 (`s1-btn-primary`) |
| 위치 | `assets/css/components/button.css` | `pages/components.html` `<style>` |
| 토큰 소스 | `tokens.css` 전역 변수 참조 | components.html `:root` 인라인 정의 |
| Loading | ✅ `.sw-button--loading` | ❌ 미구현 |
| Focus | `:focus-visible` + offset `+2px` (outset) | `.is-focus` 만, offset `-2px` (inset) |
| xxsmall | ❌ 없음 | ✅ `s1-btn-sm` (28px) |
| 공식 지정 | ❌ 미결정 | ❌ 미결정 |

### 5-2. Focus ring 방향

| 구현 | `outline-offset` | 시각 |
|---|---|---|
| `s1-btn` | `-2px` (inset — 버튼 내부) | Figma 확인 필요 |
| `sw-button` | `+2px` (outset — 버튼 외부) | Figma 확인 필요 |

Figma 노드에 focus 상태 variant가 없어 이번 MCP 비교로는 판단 불가.

---

## 6. 최종 불일치 요약 (Figma 실측 기반)

| # | 항목 | 심각도 | 수정 대상 | 조치 |
|---|---|---|---|---|
| 1 | `--button-primary-disabled-bg` | 높음 | `component.tokens.json` + `tokens.css` | `color-border-default` → `color-bg-subtle` |
| 2 | `--button-primary-disabled-border` | 중간 | `component.tokens.json` + `tokens.css` | 토큰 추가: `var(--color-border-default)` |
| 3 | `--button-secondary-hover-border` | 중간 | `component.tokens.json` + `tokens.css` | 삭제 (Figma: hover border = default, 변화 없음) |
| 4 | `--button-secondary-disabled-border` | 중간 | `component.tokens.json` + `tokens.css` | `color-border-subtle` → `color-border-default` |
| 5 | `--button-blue-line-hover-border` | 중간 | `component.tokens.json` + `tokens.css` | `color-action-primary-hover` → `color-action-primary-default` |
| 6 | `--button-blue-line-disabled-border` | 중간 | `component.tokens.json` + `tokens.css` | `color-border-subtle` → `color-border-default` |
| 7 | `--button-blue-line-default-text` | 낮음 (Dark only) | `components.html` | `color-text-link` → `color-action-primary-default` |
| 8 | xxsmall (sw-button) | 낮음 | `button.css` | `sw-button--xs` 추가 (h28) |
| 9 | focus-ring 방향 | 낮음 | `s1-btn` 또는 `sw-button` | Figma focus 상태 확인 후 통일 |
| 10 | loading (s1-btn) | 낮음 | `components.html` | `.s1-btn.is-loading` CSS 추가 |
| 11 | 이중 CSS 시스템 | 높음 | 구조 결정 | 공식 시스템 확정 필요 |

**Human Decision 없이 즉시 수정 가능 (1~6번 — Figma 원본으로 정답 확인됨):**
- `component.tokens.json` / `tokens.css` 수정: 1, 2, 3(삭제), 4, 5, 6

**Human Decision 필요:**
- 7번: `components.html`의 `color-text-link` → `color-action-primary-default` 변경 (Dark mode 정합성 목적)
- 9번: focus-ring 방향 (Figma focus 상태 variant 확인 필요)
- 11번: sw-button ↔ s1-btn 공식 결정

---

## 7. Registry 업데이트 — figma-map.json

Button 컴포넌트 nodeId 등록 완료 (2026-05-12):

| 항목 | nodeId |
|---|---|
| Section (전체) | `6440:4032` |
| PC frame | `540:4440` |
| Mobile frame | `540:4626` |
| primary / medium / default | `540:4501` |
| primary / medium / hover | `540:4521` |
| primary / medium / disabled | `540:4441` |
| secondary / medium / default | `540:4541` |
| secondary / medium / hover | `540:4561` |
| secondary / medium / disabled | `540:4461` |
| blue-line / medium / default | `540:4581` |
| blue-line / medium / hover | `540:4601` |
| blue-line / medium / disabled | `540:4481` |

---

## 8. 다음 단계

1. **즉시 수정 (승인 시):** `component.tokens.json` + `tokens.css` 불일치 6건 일괄 수정
2. **`components.html` blue-line text 토큰 교체:** `color-text-link` → `color-action-primary-default`
3. **Icon variant 구현 검토:** Figma에는 icon=off/on 분기가 있으나 현재 미구현
4. **focus 상태 Figma 노드 확인:** focus 상태가 별도 variant로 있으면 MCP 재조회
5. **이중 CSS 공식 결정:** sw-button 공식화 또는 s1-btn 유지 확정
