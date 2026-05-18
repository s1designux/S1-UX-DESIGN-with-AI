# Token Page Audit — 2026-05-18

> 검수 목적: `assets/css/tokens.css` 실제 값 vs `pages/foundation.html` / `pages/semantic.html` 표시 값 일치 여부 확인

---

## 검수 방법 요약

- **foundation.html** — 색상 팔레트·타이포·스페이싱·반경 값을 인라인 JS 데이터(`const PALETTES`, `const DARK_PALETTES` 등)로 하드코딩. registry JSON 미사용.
- **semantic.html** — 색상 토큰을 인라인 `const TOKENS` JS 객체에 `light`/`dark` hex 값으로 하드코딩. tokens.css의 `var()` 참조를 resolved HEX로 변환해 비교.

---

## Foundation 검수 결과

### 불일치 항목

| 토큰명 | tokens.css 값 | foundation.html 값 | 비고 |
|---|---|---|---|
| `--color-orange-100` | `#FDDBBF` | `#FDD8BF` | G채널 3 차이. Figma 원본 확인 필요 — Human Decision |

### 미표시 항목 (표시 누락, 오류 아님)

| 항목 | 비고 |
|---|---|
| `--color-base-white` / `--color-base-black` | Brand 섹션에 의도적 생략으로 판단 |
| `--color-status-dark-red/green/yellow` | status-dark 팔레트 카드 없음. 추가 검토 필요 |

### 일치 확인

- 색상 팔레트 전체 (gray/blue/red/orange-非100/yellow/green/skyblue/purple/brown/visual-gray/coolgray-dark/dark 계열): **✓ 일치**
- Spacing 21개, Radius primitive 10개, Border-width 2개: **✓ 일치**
- Font-size 8개, Font-weight 3개, Line-height: **✓ 일치**
- Brand 4개: **✓ 일치**

> 전체 약 205개 비교 → **204개 일치, 1개 불일치**

---

## Semantic 검수 결과

### 값 불일치 항목

| 토큰명 | tokens.css 실제 값 | semantic.html 표시 값 | 비고 |
|---|---|---|---|
| `--color-text-placeholder` (light) | `var(--color-gray-500)` = **#757575** | **#9D9D9D** (gray-400) | MVP-T1 2026-05-18 확정 값. semantic.html 미반영 |
| `--color-status-success` (dark) | `var(--color-status-dark-green)` = **#3FBE7E** | **#4285E8** (blue-dark-350) | green vs blue — 완전히 다른 계열 |
| `--color-icon-inverse` (dark) | `var(--color-gray-dark-900)` = **#ECEDF0** | **#FFFFFF** | 이번 세션 변경 미반영 |
| `--color-bg-selected` (dark) | `var(--color-blue-dark-100)` = **#112B55** | **#0C1D38** (blue-dark-50) | 1스텝 차이 |

### 미표시 항목 (tokens.css에 있으나 semantic.html에 없음)

| 카테고리 | 토큰 수 | 해당 토큰 | 추가 시기 |
|---|---|---|---|
| `--color-control-border-*` | 4개 | default/hover/selected/disabled | MVP4.4 |
| `--color-form-control-*` | 10개 | bg-default/bg-disabled/border-*6개/text-*3개 | MVP4/MVP-T1 |
| `--color-text-state-*` | 3개 | helper/correct/error | MVP4 |
| `--sizing-button-height-xxs` | 1개 | 28px | — |

### semantic.html에 있으나 tokens.css에 없는 항목 (미구현)

| 토큰명 | semantic.html 값 | 비고 |
|---|---|---|
| `--color-bg-active` | light #E9E9E9 / dark #3E4049 | tokens.css에 `pending-review` 주석 |
| `--color-bg-deepest` | light #E9E9E9 / dark #0D0E12 | 동상 |
| `--color-domain-status-*` (7개) | light 값만 정의 | Domain Token 레이어 이동 예정 |

### 일치 확인

- Semantic color light 44개 비교 → **43개 일치, 1개 불일치** (text-placeholder)
- Semantic color dark 18개 비교 → **15개 일치, 3개 불일치**
- Spacing/Sizing/Radius 수치: **✓ 전체 일치**

---

## 수정 필요 항목 우선순위

### HIGH — 렌더 색상이 크게 다른 불일치

| 항목 | 파일 | 수정 내용 |
|---|---|---|
| `--color-status-success` dark | `semantic.html` TOKENS | `'#4285E8'` → `'#3FBE7E'`, description `'blue-dark/350'` → `'status-dark/green'` |
| `--color-icon-inverse` dark | `semantic.html` TOKENS | `'#FFFFFF'` → `'#ECEDF0'`, `'color/base/white'` → `'gray-dark/900'` |
| `--color-text-placeholder` light | `semantic.html` TOKENS | `'#9D9D9D'` → `'#757575'`, `'color/gray/400'` → `'color/gray/500'` |

### MEDIUM — 불일치, 다크 테마에서만 표시

| 항목 | 파일 | 수정 내용 |
|---|---|---|
| `--color-bg-selected` dark | `semantic.html` TOKENS | `'#0C1D38'` → `'#112B55'`, `'blue-dark/50'` → `'blue-dark/100'` |
| `--color-orange-100` | `foundation.html` PALETTES | Figma 원본 확인 후 `#FDD8BF` 또는 `#FDDBBF` 결정 |

### LOW — 표시 누락 (오류 아님, 가이드 완성도 문제)

| 항목 | 파일 | 수정 내용 |
|---|---|---|
| `--color-control-border-*` 4개 | `semantic.html` | MVP4.4 신규 섹션 추가 |
| `--color-form-control-*` 10개 | `semantic.html` | MVP4/MVP-T1 신규 섹션 추가 |
| `--color-text-state-*` 3개 | `semantic.html` | 신규 섹션 추가 |
| `--sizing-button-height-xxs` | `semantic.html` | sizing 테이블 행 추가 |
| `--color-status-dark-*` 3개 | `foundation.html` | status-dark 팔레트 카드 추가 검토 |
| `--color-bg-active`, `--color-bg-deepest` | `tokens.css` | pending-review 처리 방향 결정 필요 |
| `--color-domain-status-*` 7개 | `tokens.css` | Domain Token 레이어 이동 시점에 구현 |

---

## 요약

| 검수 영역 | 비교 수 | 일치 | 불일치 | 미표시 누락 |
|---|---|---|---|---|
| Foundation 색상 팔레트 | 205 | 204 | 1 | 3 |
| Semantic light | 44 | 43 | 1 | 17 |
| Semantic dark | 18 | 15 | 3 | 0 |
| 수치(spacing/radius/sizing) | 전체 | ✓ | 0 | 1 |

**즉시 수정 권장:** `semantic.html` HIGH 3개 항목 (status-success dark, icon-inverse dark, text-placeholder light)
