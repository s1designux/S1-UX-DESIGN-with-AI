# MVP-L3 Canonical Token Architecture Draft

**날짜:** 2026-05-18  
**단계:** MVP-L3  
**상태:** Draft (사람 확인 후 확정)  
**소스:** MVP-L1 Legacy Token Audit + registry/tokens/* + assets/css/tokens.css  
**출력:** `registry/tokens/canonical-token-draft.json`

> ⚠️ 이 단계에서 금지된 작업: Figma Variable rename/write/delete · 레거시 토큰 삭제 · 정식 확정 · Figma 파일 직접 수정

---

## 0. 전제 조건

### MVP-L2 파일 부재

`reports/mvp-l2-foundation-reclassification.md` 파일이 존재하지 않는다.  
MVP-L3는 다음 파일을 직접 참조하여 작성되었다:

| 참조 파일 | 역할 |
|---|---|
| `reports/mvp-l1-legacy-token-audit.md` | Legacy 419개 변수 분석 결과 |
| `registry/tokens/semantic.colors.json` | Semantic 색상 토큰 레지스트리 |
| `registry/tokens/foundation.colors.json` | Foundation 색상 프리미티브 레지스트리 |
| `registry/tokens/figma-css-token-map.json` | Figma Variable ↔ CSS 토큰 매핑 |
| `registry/tokens/token-aliases.json` | 상태/토큰 alias 규칙 |
| `registry/tokens/deprecated-tokens.json` | 삭제·deprecated 토큰 목록 |
| `assets/css/tokens.css` | 2026-05-18 기준 최신 토큰 구현체 (소스오브트루스) |

---

## 1. 토큰 레이어 요약

| 레이어 | 그룹 수 | 토큰 수 | 상태 |
|---|---|---|---|
| **Foundation — Color Primitives** | 23개 그룹 | 221개 CSS 변수 | stable |
| **Foundation — Spacing Primitives** | 1 | 21개 스텝 | stable |
| **Foundation — Typography** | 3 (size/weight/line-height) | 12개 | stable |
| **Foundation — Radius Primitives** | 1 | 10개 스텝 | stable |
| **Foundation — Border Width** | 1 | 2개 | stable |
| **Semantic — Color** | 11개 카테고리 | 61개 | 53 stable / 8 candidate |
| **Semantic — Spacing (semantic)** | 7 | 29개 | stable |
| **Semantic — Sizing (semantic)** | 7 | 25개 | stable |
| **Semantic — Radius (semantic)** | 1 | 5개 | stable |
| **Semantic — Border Width (semantic)** | 1 | 2개 | stable |
| **Component — Official** | 10개 컴포넌트 | 118개 | stable |
| **Component — Legacy** | 1 (ghost button) | 6개 | deprecated |
| **합계 (Component)** | — | **124개** | — |

---

## 2. Foundation 레이어 Draft

### 2-1. Color Primitive 그룹

| 그룹 | CSS 변수 접두사 (Light) | CSS 변수 접두사 (Dark) | 스텝 | 토큰 수 | 비고 |
|---|---|---|---|---|---|
| base | `--color-base-` | — | white · black | 2 | 불변 상수 |
| brand | `--color-brand-` | — | blue · red · gray · ci | 4 | CI/로고 전용 |
| gray | `--color-gray-` | `--color-gray-dark-` | 0·50·100~900 (11) | 22 | Dark 450 미정의 (ND-1) |
| blue | `--color-blue-` | `--color-blue-dark-` | 50~500 (10) | 20 | |
| red | `--color-red-` | `--color-red-dark-` | 50~500 (10) | 20 | |
| orange | `--color-orange-` | `--color-orange-dark-` | 50~500 (10) | 20 | |
| yellow | `--color-yellow-` | `--color-yellow-dark-` | 50~500 (10) | 20 | |
| green | `--color-green-` | `--color-green-dark-` | 50~500 (10) | 20 | |
| skyblue | `--color-skyblue-` | `--color-skyblue-dark-` | 50~500 (10) | 20 | |
| purple | `--color-purple-` | `--color-purple-dark-` | 50~500 (10) | 20 | |
| brown | `--color-brown-` | `--color-brown-dark-` | 50~500 (10) | 20 | |
| visual-gray | `--color-visual-gray-` | — | 50~500 (10) | 10 | Light 전용 |
| coolgray-dark | — | `--color-coolgray-dark-` | 50~500 (10) | 10 | Dark 전용 |
| status-dark aliases | `--color-status-dark-` | — | red·green·yellow | 3 | step-350 alias |
| **합계** | | | | **211 color** | |

> **스텝 방향 규칙 (Dark Scale)**  
> `gray-dark`: 0(어두움) → 900(밝음) — 배경(0~400) · 텍스트(700~900)  
> `blue-dark`: 50(어두움) → 500(밝음) — 선택배경(50~100) · 버튼(300) · 링크(400)

### 2-2. 비-Color Foundation

| 카테고리 | 변수 패턴 | 스텝/목록 | 수 |
|---|---|---|---|
| Spacing | `--spacing-{n}` | 2·4·6·8·10·12·14·16·20·24·28·32·36·40·44·48·56·64·80·96·128 | 21 |
| Font Size | `--font-size-{n}` | 10·12·14·16·18·20·24·32 | 8 |
| Font Weight | `--font-weight-{name}` | regular(400)·medium(500)·bold(700) | 3 |
| Line Height | `--line-height-{n}` | 130 | 1 |
| Radius | `--radius-{n}` | 0·2·4·6·8·10·12·16·20·full | 10 |
| Border Width | `--border-width-{n}` | 1(1px)·2(2px) | 2 |

---

## 3. Semantic 레이어 Draft

### 3-1. Color Semantic — 카테고리별 전체 목록

#### color-bg (6개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-bg-default` | `gray-0` | `gray-dark-50` | stable |
| `--color-bg-subtle` | `gray-50` | `gray-dark-200` | stable |
| `--color-bg-muted` | `gray-100` | `gray-dark-300` | stable |
| `--color-bg-elevated` | `gray-100` | `gray-dark-400` | stable |
| `--color-bg-home` | `#F5F6FB` ⚠️ | `gray-dark-50` | **candidate** — HEX 직접 참조 |
| `--color-bg-selected` | `blue-50` | `blue-dark-100` | **candidate** — Figma 검증 필요 |

#### color-surface (2개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-surface-default` | `base-white` | `gray-dark-100` | stable |
| `--color-surface-raised` | `base-white` | `gray-dark-400` | stable |

#### color-text (11개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-text-primary` | `gray-900` (#202020) | `gray-dark-900` | stable |
| `--color-text-secondary` | `gray-800` (#353535) | `gray-dark-800` | stable |
| `--color-text-tertiary` | `gray-600` | `gray-dark-700` | stable |
| `--color-text-caption` | `gray-500` | `gray-dark-700` | stable |
| `--color-text-placeholder` | `gray-500` (#757575) ✅ | `gray-dark-600` | stable |
| `--color-text-helper` | `gray-400` | `gray-dark-600` | stable |
| `--color-text-link` | `blue-400` | `blue-dark-400` | stable |
| `--color-text-correct` | `blue-400` | `blue-dark-400` | stable |
| `--color-text-danger` | `red-300` | `status-dark-red` | stable |
| `--color-text-disabled` | `gray-300` | `gray-dark-400` ⚠️ | **candidate** — Dark 조정 검토 중 |
| `--color-text-inverse` | `base-white` | `base-white` | stable |

> ✅ `placeholder = gray/500 (#757575)` — MVP-T1에서 확정 (이전: gray-400)

#### color-border (9개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-border-subtle` | `gray-100` | `rgba(255,255,255,0.04)` ⚠️ | **candidate** |
| `--color-border-default` | `gray-200` | `rgba(255,255,255,0.07)` ⚠️ | **candidate** |
| `--color-border-disabled` | `gray-200` | `rgba(255,255,255,0.07)` ⚠️ | stable* |
| `--color-border-strong` | `gray-300` | `rgba(255,255,255,0.12)` ⚠️ | **candidate** |
| `--color-border-emphasis` | `gray-800` | `rgba(255,255,255,0.20)` ⚠️ | **candidate** |
| `--color-border-focus` | `blue-400` | `blue-dark-350` | stable |
| `--color-border-white` | `base-white` | `base-white` | stable |
| `--color-border-danger` | `red-300` | `status-dark-red` | stable |
| `--color-border-correct` | `blue-400` | `blue-dark-350` | stable |

> ⚠️ Dark rgba 값 4개 — Figma opacity composition. resolved HEX 또는 foundation dark scale alias 확정 필요 (ND-2)  
> *`border-disabled`는 구현체에서 stable로 표기되나, dark rgba 미해결 시 candidate로 재분류 필요

#### color-icon (6개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-icon-default` | `gray-500` | `gray-dark-700` | stable |
| `--color-icon-muted` | `gray-300` | `gray-dark-400` | stable |
| `--color-icon-emphasis` | `gray-800` | `gray-dark-800` | stable |
| `--color-icon-accent` | `blue-400` | `blue-dark-400` | stable |
| `--color-icon-inverse` | `base-white` | `gray-dark-900` | stable |
| `--color-icon-danger` | `red-300` | `status-dark-red` | stable |

#### color-action (5개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-action-primary-default` | `blue-400` | `blue-dark-300` | stable |
| `--color-action-primary-hover` | `blue-450` | `blue-dark-250` | stable |
| `--color-action-primary-pressed` | `blue-500` | `blue-dark-200` | stable |
| `--color-action-primary-text` | `base-white` | `base-white` | stable |
| `--color-action-primary-subtle` | `blue-50` | `blue-dark-100` | stable |

#### color-status (4개)

| CSS 변수 | Light | Dark | Status | 비고 |
|---|---|---|---|---|
| `--color-status-success` | `blue-400` | `status-dark-green` | stable | Light = blue (서비스 관례) |
| `--color-status-error` | `red-400` | `status-dark-red` | stable | |
| `--color-status-warning` | `yellow-400` | `status-dark-yellow` | stable | |
| `--color-status-info` | `gray-500` | `gray-dark-700` | stable | |

#### color-control-border (4개) — MVP4.4 추가

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-control-border-default` | `gray-200` | `gray-dark-500` | stable |
| `--color-control-border-hover` | `blue-400` | `blue-dark-300` | stable |
| `--color-control-border-selected` | `blue-400` | `blue-dark-300` | stable |
| `--color-control-border-disabled` | `gray-300` | `gray-dark-300` | stable |

> Checkbox·Radio·Toggle 전용 border semantic. 일반 `color-border-*` (divider)와 독립.

#### color-form-control (10개) — MVP4-token 추가

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-form-control-bg-default` | `surface-default` | `gray-dark-50` | stable |
| `--color-form-control-bg-disabled` | `bg-subtle` | (상속) | stable |
| `--color-form-control-border-default` | `control-border-default` | (상속) | stable |
| `--color-form-control-border-selected` | `border-focus` | (상속) | stable |
| `--color-form-control-border-error` | `status-error` | (상속) | stable |
| `--color-form-control-border-correct` | `border-focus` | (상속) | stable |
| `--color-form-control-border-disabled` | `border-subtle` | `control-border-disabled` | stable |
| `--color-form-control-text-default` | `text-secondary` (#353535) ✅ | (상속) | stable |
| `--color-form-control-text-placeholder` | `text-placeholder` (#757575) ✅ | (상속) | stable |
| `--color-form-control-text-disabled` | `text-disabled` | (상속) | stable |

> Input / Select / DatePicker / TimePicker 공용 Semantic 레이어

#### color-text-state (3개) — MVP4-token 추가

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-text-state-helper` | `text-secondary` | (상속) | stable |
| `--color-text-state-correct` | `blue-400` | `blue-dark-400` | stable |
| `--color-text-state-error` | `status-error` | (상속) | stable |

#### color-overlay (1개)

| CSS 변수 | Light | Dark | Status |
|---|---|---|---|
| `--color-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.75)` | stable |

> rgba 허용 예외 — alpha 채널은 Foundation primitive alias 불가

### 3-2. Semantic 카테고리 수량 요약

| 카테고리 | 토큰 수 | Stable | Candidate |
|---|---|---|---|
| color-bg | 6 | 4 | 2 |
| color-surface | 2 | 2 | 0 |
| color-text | 11 | 10 | 1 |
| color-border | 9 | 5 | 4 |
| color-icon | 6 | 6 | 0 |
| color-action | 5 | 5 | 0 |
| color-status | 4 | 4 | 0 |
| color-control-border | 4 | 4 | 0 |
| color-form-control | 10 | 10 | 0 |
| color-text-state | 3 | 3 | 0 |
| color-overlay | 1 | 1 | 0 |
| **합계 (Color)** | **61** | **54** | **7** |

---

## 4. Component 레이어 Draft

### 4-1. 토큰 수 요약

| 컴포넌트 | 토큰 수 | 상태 |
|---|---|---|
| Button — Primary | 8 | stable |
| Button — Secondary | 10 | stable |
| Button — Blue-line | 9 | stable |
| Button — Ghost | 6 | **legacy (deprecated)** |
| Chip | 17 | stable |
| Dropdown | 13 | stable |
| Input / Form-control | 13 | stable |
| Checkbox | 10 | stable |
| Radio | 8 | stable |
| Toggle | 4 | stable |
| Pagination | 8 | stable |
| Navigation | 9 | stable |
| Table | 8 | stable |
| **합계** | **123** | 117 stable + 6 legacy |

### 4-2. 컴포넌트별 Semantic 참조 구조

**Button** 참조 체계:
```
primary-default-bg → color-action-primary-default
primary-hover-bg   → color-action-primary-hover
primary-text       → color-action-primary-text
disabled-bg        → color-bg-subtle
disabled-text      → color-text-disabled
```

**Input** 2-레이어 참조 체계:
```
--input-{state}-{property}
  → --color-form-control-{property}-{state}
    → Semantic (color-border-focus, color-surface-default 등)
```

**Checkbox / Radio** 참조 체계:
```
border tokens → color-control-border-{state}  ← color-border-*와 독립
bg tokens     → color-form-control-bg-{state}
icon tokens   → color-action-primary-text / color-border-strong
```

---

## 5. Alias 및 Deprecated 규칙

### 5-1. 상태 Alias 규칙

| Figma 상태명 | Code 상태명 | 적용 범위 | 확정일 |
|---|---|---|---|
| `complete` | `filled` | input, form-control | 2026-05-18 |
| `selected` | `focus` | input, form-control (포커스 상태) | 2026-05-18 |
| `success` | `correct` | input, form-control, text-state | 2026-05-18 |

> ⚠️ `selected → focus`는 **form-control 컨텍스트만**. 테이블 행 선택·아이템 선택의 `selected`는 그대로 사용.

### 5-2. 토큰 Alias 규칙

| 가상 토큰 | 실제 참조 토큰 | 이유 |
|---|---|---|
| `--input-filled-bg` | `--input-default-bg` | filled bg = default bg (HD-3) |
| `--input-filled-border` | `--input-default-border` | filled border = default border |
| `--color-form-control-border-correct` | `--color-form-control-border-selected` | correct border = focus border |

### 5-3. Deprecated / 삭제 목록

| 토큰 | 상태 | 처리 방침 |
|---|---|---|
| `--button-ghost-*` (6개) | **deprecated (legacy)** | tokens.css 유지. 신규 사용 금지. blue-line으로 교체. |
| `--button-danger-*` | **deleted (영구)** | 재추가 금지. V2.4 기준 없음. |
| `--input-hover-bg` | removed | HD-2: hover bg 미정의 |
| `--input-hover-border` | removed | HD-2: hover border 미정의 |
| `--input-focus-bg` | removed | HD-3: focus bg = default bg |
| `--input-error-bg` | removed | HD-8: error bg = default bg |
| `--select-disabled-border` | relocated | HD-5: Select 컴포넌트로 이동 예정 |

---

## 6. 중복 토큰 분석

| ID | 토큰 쌍 | 공유 값 | 판정 |
|---|---|---|---|
| dup-1 | `text-placeholder` / `text-caption` | gray-500 (light) | 의도적 분리 유지 |
| dup-2 | `border-focus` / `border-correct` | blue-400 light, blue-dark-350 dark | 의도적 분리 유지 |
| dup-3 | `text-correct` / `text-link` | blue-400 light | 의도적 분리 유지 |
| dup-4 | `border-default` / `border-disabled` | gray-200 light, rgba 0.07 dark | ⚠️ **결정 필요** (ND-2 연계) |
| dup-5 | `input-focus-border` → `form-control-border-selected` → `border-focus` | — | 의도적 3단계 체인. 정상. |

---

## 7. Needs Decision (사람 결정 필요)

| ID | 우선순위 | 제목 | 영향 범위 |
|---|---|---|---|
| ~~ND-1~~ | ✅ RESOLVED | `--color-gray-dark-450` → `gray-dark-500` 교체 완료 | — |
| ND-2 | 🔴 HIGH | Dark border 4개 rgba → resolved 값 확정 | border-subtle/default/strong/emphasis |
| ND-3 | 🟡 MEDIUM | `--color-text-disabled` dark 값 (#35363F vs #55575F) | button/input/chip disabled text |
| ND-4 | 🟡 MEDIUM | `--color-bg-home` light raw HEX | bg-home foundation 등록 여부 |
| ND-5 | 🟡 MEDIUM | Chip 구조: 통합 vs line/solid 2타입 | chip 전체 토큰 구조 |
| ~~ND-6~~ | ✅ RESOLVED | `--chip-focus-ring` 삭제 완료 | — |
| ND-7 | 🟢 LOW | `semantic.colors.json` 최신 레이어 미등록 | registry JSON 갱신 |
| ND-8 | 🟢 LOW | `--select-disabled-border` Select 레지스트리로 이동 | Select component registry 생성 시 |

### ND-1 상세: `--color-gray-dark-450` 미정의

```css
/* tokens.css line 577 */
[data-theme="dark"] {
  --dropdown-trigger-hover-bg: var(--color-gray-dark-450); /* ← UNDEFINED */
}
```

Foundation primitives에 gray-dark-450 없음. 400(#35363F)과 500(#3E4049) 사이 값.

**권장 옵션:**
- **A** (권장): `--color-gray-dark-500` (#3E4049)으로 교체 — 기존 foundation 사용
- **B**: gray-dark-450 primitives에 추가 (HEX 값 확정 필요)

### ND-2 상세: Dark Border rgba 처리

현재 값:
```css
--color-border-subtle:   rgba(255,255,255,0.04) /* dark */
--color-border-default:  rgba(255,255,255,0.07) /* dark */
--color-border-strong:   rgba(255,255,255,0.12) /* dark */
--color-border-emphasis: rgba(255,255,255,0.20) /* dark */
```

**권장 옵션:**
- **A** (권장): Foundation dark scale alias 확정
  - subtle → `gray-dark-100` (#1C1D23) 참고
  - default → `gray-dark-200` or `gray-dark-300`
  - strong → `gray-dark-400`
  - emphasis → `gray-dark-700`
- **B**: rgba 영구 허용 (border category rgba exception 추가)

---

## 8. semantic.colors.json 갱신 필요 항목

현재 `registry/tokens/semantic.colors.json` (2026-05-11 업데이트)에 누락된 항목:

| 누락 항목 | 토큰 수 | 추가된 날짜 |
|---|---|---|
| `--color-border-disabled` | 1 | 2026-05-18 (MVP-T1) |
| `--color-control-border-*` | 4 | 2026-05-18 (MVP4.4) |
| `--color-form-control-*` | 10 | 2026-05-18 (MVP4-token) |
| `--color-text-state-*` | 3 | 2026-05-18 (MVP4-token) |

→ semantic.colors.json을 61개 기준으로 갱신하거나, 별도 JSON 파일로 분리 관리.

---

## 9. Figma → Code 네이밍 변환 확정 규칙

| Figma Variable 경로 | CSS 변수명 | 변환 규칙 |
|---|---|---|
| `color/form-control/bg/default` | `--color-form-control-bg-default` | `/` → `-` |
| `color/button/bg/blue-line--default` | `--button-blue-line-default-bg` | variant·state·property 순서 재배치 |
| `color/text/state/placehoder` ⚠️ | `--color-text-placeholder` | Figma 오타 `placehoder` → 코드는 정상 spelling |
| `color/text/state/success` | `--color-text-state-correct` | `success` → `correct` (alias 규칙) |
| `color/form-control/border/selected` | `--color-form-control-border-selected` | `selected` → code에서는 focus 의미지만 variable명 유지 |

> **Figma 원본 오타 확인:** `color/text/state/placehoder` (l 누락) — code에서는 `placeholder`로 교정하여 사용.

---

## 10. 다음 단계

| 단계 | 작업 | 우선순위 |
|---|---|---|
| ND-1 해결 | `--color-gray-dark-450` → `--color-gray-dark-500` 교체 | 🔴 |
| ND-2 해결 | Dark border rgba → foundation dark scale 참조 확정 | 🔴 |
| ND-7 해결 | `semantic.colors.json` 61개 기준으로 갱신 | 🟢 (Claude 처리 가능) |
| MVP-L4 | legacy-token-map.json 매핑 완성 (semanticCandidates, needs-review 정리) | 다음 |
| MVP-L5 | Figma Variable → canonical CSS 정식 sync (plugin write 활성화) | ND-2 해결 후 |

---

*생성: Claude Sonnet 4.6 — 2026-05-18*  
*출력 파일: `registry/tokens/canonical-token-draft.json`*
