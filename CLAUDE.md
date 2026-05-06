# ASC - AI Context Document (Design System Harness)

> 이 문서는 Claude가 디자인 시스템을 **수집, 정리, 구조화, 검증**하기 위한 기준입니다.
> 현재 목표는 UI 구현이 아니라 **디자인 시스템을 구축하는 것**입니다.
> 마지막 업데이트: 2026-04-30 (토큰 파일 전수 검수 후 반영)

---

## 하네스: Design System

**목표:** 토큰 검증·HTML 가이드 생성·Figma 동기화·리뷰 관리를 자동화한다.

**트리거:** 토큰 검증, 가이드 페이지 업데이트, Figma 동기화, MD 리뷰 등록 작업 요청 시 `design-system` 스킬을 사용하라. 단순 질문과 직접 편집은 스킬 없이 직접 응답 가능.

**에이전트:** `.claude/agents/` — token-validator · guide-builder · figma-inspector

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-04-29 | 초기 하네스 구성 | 전체 | revfactory/harness 기반 신규 구축 |
| 2026-04-30 | 토큰 파일 전수 검수 후 CLAUDE.md 동기화 | Foundation·Semantic·Component | tokens.css·MD 파일과 불일치 항목 수정 |

---

# 🎯 현재 프로젝트 단계

## 완료된 단계

* ✅ Foundation Token — Primitive 색상 팔레트 (Light + Dark) 정의 완료
* ✅ Dark Primitive — `gray-dark` (0–900), `blue-dark` (50–500) 추가 완료
* ✅ Semantic Token — 8개 카테고리 Light/Dark 값 전체 정의 완료 (`tokens/semantic.md`)
* ✅ Component Token — 9개 그룹 추출 및 Semantic 참조 구조 정의 완료 (`tokens/component-tokens-extracted.md`)
  > ⚠️ Chip: MD는 line/solid 2타입 분리 정의, tokens.css는 단일 구조로 통합 — 불일치 미결
* ✅ Button variants — primary / secondary / ghost 토큰 완료 (Danger 삭제 확정)
* ⬜ Button blue-line variant — Figma 설계 확정, CSS 토큰 미추출 (pending)
* ✅ 가이드 HTML — foundation / semantic / components / guide-md / md-review 페이지 완료

## 미결 사항 (다음 우선순위)

```
1. Dark Mode 버튼·컨트롤 색상 확정
   - --color-text-disabled dark 값: 현재 #35363F → #55575F 조정 검토 중
   - --button-primary-disabled-bg dark: 현재 var(--color-border-default) = rgba(255,255,255,0.07)
     → var(--color-bg-muted) 참조 수정 검토 중
   - ghost focus ring 미정의: --button-ghost-focus-ring 추가 필요
   - toggle tokens 불일치: MD는 var(--color-text-placeholder), CSS는 var(--color-border-default)

2. Chip 토큰 구조 정합
   - component-tokens-extracted.md: line/solid 2타입 분리 정의
   - tokens.css: 단일 구조(--chip-default-*, --chip-selected-* 등) 통합
   - 어느 구조로 확정할지 결정 필요

3. Button blue-line 토큰 추출
   - Figma 설계 확정 상태, CSS 변수 미정의

4. Semantic Token Figma 반영 (Figma 파일 직접 수정 필요)
   - 오타 수정: color/status-card/text/*--defualt → --default (3건)
   - surface/status/* → Domain Token 이동 여부 확정

5. Pattern 페이지 설계 (search-table, tree-detail)
6. Legacy 가이드 작성
```

---

# 🧠 Claude의 역할 (핵심)

Claude는 다음 역할만 수행한다:

✔ Figma 변수 및 스타일 분석
✔ Token 구조 정리 및 재설계
✔ Semantic Token 설계
✔ Component Token 설계
✔ 상태값 구조 정의
✔ Core / Domain / Legacy 분류
✔ 다크모드 확장성 검토
✔ 문서화 및 HTML 가이드 구조 제안

❌ UI 디자인 생성 금지
❌ React / Vue 코드 생성 금지
❌ 임의 컴포넌트 설계 금지

---

# 🎨 디자인 시스템 구조

디자인 시스템은 아래 레이어로 구성된다:

```
1. Foundation Token (Primitive)
2. Semantic Token
3. Component Token
4. Pattern
5. Legacy
```

---

# 🎨 Foundation Token 규칙

## 색상

* HEX 직접 사용 금지
* CSS 변수만 사용

```css
--color-gray-900
--color-blue-400
--color-gray-dark-900
--color-blue-dark-300
```

**예외 — rgba 허용 범위 (2가지만)**

| 토큰 카테고리 | 모드 | 허용 이유 |
|---|---|---|
| `color-border-*` | Dark 전용 | 배경 명도 편차가 넓어 HEX로 일관 대비 유지 불가 |
| `color-overlay` | Light·Dark 공통 | alpha 채널 포함 값은 Foundation Primitive alias 불가 |

위 두 경우 외 rgba 직접 사용은 금지한다.

---

## 전체 색상 계열 (tokens.css 기준)

| 계열 | Light 변수 접두사 | Dark 변수 접두사 | 스텝 범위 |
|---|---|---|---|
| Gray | `--color-gray-{step}` | `--color-gray-dark-{step}` | 0 ~ 900 |
| Blue | `--color-blue-{step}` | `--color-blue-dark-{step}` | 50 ~ 500 |
| Red | `--color-red-{step}` | `--color-red-dark-{step}` | 50 ~ 500 |
| Orange | `--color-orange-{step}` | `--color-orange-dark-{step}` | 50 ~ 500 |
| Yellow | `--color-yellow-{step}` | `--color-yellow-dark-{step}` | 50 ~ 500 |
| Green | `--color-green-{step}` | `--color-green-dark-{step}` | 50 ~ 500 |
| Skyblue | `--color-skyblue-{step}` | `--color-skyblue-dark-{step}` | 50 ~ 500 |
| Purple | `--color-purple-{step}` | `--color-purple-dark-{step}` | 50 ~ 500 |
| Brown | `--color-brown-{step}` | `--color-brown-dark-{step}` | 50 ~ 500 |
| Visual Gray | `--color-visual-gray-{step}` | — | 50 ~ 500 |
| Cool Gray Dark | — | `--color-coolgray-dark-{step}` | 50 ~ 500 |
| Base | `--color-base-white` / `--color-base-black` | — | — |
| Brand | `--color-brand-blue` / `-red` / `-gray` / `-ci` | — | — |
| Status Dark | `--color-status-dark-red` / `-green` / `-yellow` | — | alias |

> **스텝 간격**: 모든 계열 50 단위 (50·100·150·200·250·300·350·400·450·500). Gray만 예외: 0·50·100·200·300·400·500·600·700·800·900.

---

## Dark Primitive 스텝 방향 (핵심 규칙)

| 그룹 | 스텝 방향 | 역할 요약 |
|---|---|---|
| `gray-dark` | 0(어두움) → 900(밝음) | 배경(0~400) · 텍스트(700~900) |
| `blue-dark` | 50(어두움) → 500(밝음) | 선택배경(50~100) · 버튼(300) · 링크(400) |
| `status-dark` | red / green / yellow | 피드백 상태 전용 (각 계열 350 step alias) |

---

## 타이포그래피

* 정의된 토큰만 사용
* 임의 값 금지

```css
/* Font Size (10 ~ 32 — 38 없음) */
--font-size-10 / -12 / -14 / -16 / -18 / -20 / -24 / -32

/* Font Weight */
--font-weight-regular: 400
--font-weight-medium:  500
--font-weight-bold:    700

/* Line Height */
--line-height-130: 1.3
```

---

## 스페이싱

* Foundation primitive spacing: `--spacing-2` ~ `--spacing-128`
* Semantic spacing 토큰 (역할 기반): `--spacing-padding-block-*`, `--spacing-section-*`, `--spacing-stack-*`, `--spacing-cluster-*`, `--spacing-label-gap-*`
* 임의 px 금지 — 위 토큰만 사용

---

## Sizing / Radius

* Sizing: `--sizing-form-control-height-*`, `--sizing-button-height-*`, `--sizing-chip-height-*`, `--sizing-table-row-height-*`, `--sizing-icon-*`
* Radius primitive: `--radius-0` ~ `--radius-full` (0·2·4·6·8·10·12·16·20·full)
* Radius semantic: `--radius-control-xs/sm`, `--radius-button-md`, `--radius-card-md`, `--radius-modal-md`
* Border Width: `--border-width-default(1px)`, `--border-width-strong(2px)`
* 임의 값 금지

---

# 🧩 Semantic Token 설계 기준

Semantic Token은 "역할 기반"으로 정의한다.

## 카테고리

```
color-bg        → 페이지·레이아웃 배경
color-surface   → 컴포넌트 표면 배경 (카드·패널·모달)
color-text      → 텍스트 색상
color-border    → 테두리·구분선
color-icon      → 아이콘
color-action    → 인터랙션 액션 (컴포넌트가 참조)
color-status    → UI 피드백 상태 (성공·에러·경고·정보)
color-overlay   → 딤·오버레이
```

> `color-surface`는 `color-bg` 위에 올라오는 컴포넌트 표면 배경.
> Light에서는 둘 다 흰색이나, Dark에서 레이어 깊이가 시각적으로 분리됨.

## 주요 확정값

```css
--color-status-success: #1D6CEB   /* Light — blue 계열, 현재 서비스 기준 */
--color-status-success: #3FBE7E   /* Dark — green-dark/350 */
--color-text-primary:   #202020   /* Off-black — 확정값 */
```

## 예시

```css
--color-bg-default
--color-bg-subtle
--color-surface-default
--color-surface-raised
--color-text-primary
--color-text-secondary
--color-text-disabled
--color-border-default
--color-border-focus
--color-action-primary-default
--color-action-primary-hover
--color-status-success
--color-status-error
```

---

# 🧱 Component Token 설계 기준

Component Token의 참조 기준은 속성 유형에 따라 다르다.

## 색상 (color) — Semantic 경유 필수

Light/Dark 테마 전환이 Semantic 레이어에서 이루어지므로, 색상은 반드시 Semantic을 거쳐야 한다.
Foundation을 직접 참조하면 테마 전환 시 올바른 값을 얻을 수 없다.

```css
--button-primary-default-bg: var(--color-action-primary-default);
--button-primary-hover-bg:   var(--color-action-primary-hover);
--input-focus-border:        var(--color-border-focus);
--table-row-selected-bg:     var(--color-bg-selected);
```

## 크기·간격·반경 (sizing / spacing / radius) — 규칙 구분

| 경우 | 참조 방식 | 이유 |
|---|---|---|
| 여러 컴포넌트가 같은 값을 공유 | Semantic 경유 | 한 곳 수정으로 전체 적용 |
| 컴포넌트 전용 값 (다른 곳에서 쓰지 않음) | Foundation 직접 참조 가능 | Semantic 중간 레이어가 추가하는 가치 없음 |

```css
/* 공유 값 → Semantic 경유 */
--button-height-md: var(--sizing-button-height-md);

/* 전용 값 → Foundation 직접 참조 */
--modal-border-radius: var(--radius-8);
--chip-height-sm: var(--spacing-28);
```

> **색상은 예외 없이 Semantic 경유.** 크기·간격·반경만 위 규칙 적용.

## 네이밍 규칙

```
--{component}-{variant}-{state}-{property}
```

## 예시

```css
--button-primary-default-bg
--button-primary-hover-bg
--button-primary-pressed-bg
--button-primary-disabled-bg

--button-secondary-default-border
--button-ghost-hover-bg

--input-default-border
--input-focus-border
--input-error-border

--table-row-hover-bg
--table-row-selected-bg
```

---

# 🎛️ 컴포넌트 관리 기준

모든 컴포넌트를 통합하지 않는다.

## 분류 기준

### 1. Core Component

* 공통 UI
* 버튼, 인풋, 셀렉트, 팝업, 바텀시트 등

**CSS 토큰 추출 완료 variants**: `primary` / `secondary` / `ghost`
**Figma 설계 확정, 토큰 미추출**: `blue-line`
> Danger variant는 사용하지 않음 — 삭제 확정 (2026-04-29)

### 2. Domain Component

* 서비스 특화 UI
* 관제 / 영상 / 운영관리 등

### 3. Pattern

* 반복 구조
* search-table, tree-detail, dashboard 등

### 4. Legacy

* 기존 서비스 유지용
* 신규 사용 제한

---

## 운영 원칙

* Core는 통일
* Domain은 허용
* Pattern으로 재사용
* Legacy는 분리 관리

---

# 🌗 Light / Dark Theme 기준

변수명은 유지하고 값만 변경한다.

```css
:root {
  --color-bg-default: #FAFAFA;
}

[data-theme="dark"] {
  --color-bg-default: #131418;
}
```

## 반드시 고려할 상태

```
default
hover
pressed
focus
selected
disabled
error
loading
```

---

# 📁 파일 구조

## 토큰 정의 파일

| 파일 | 역할 | 상태 |
|---|---|---|
| `tokens/semantic.md` | Semantic Token 정의 (Light/Dark) | ✅ 완료 |
| `tokens/component-tokens-extracted.md` | Component Token 정의 (9개 그룹) | ✅ 완료 |
| `tokens/foundation.md` | Foundation Primitive 정의 + Dark 스텝 방향 규칙 | ✅ 완료 |
| `tokens/token-map.json` | 전체 토큰 매핑 JSON | 작성 예정 |

## HTML 가이드 페이지

| 파일 | 역할 | 상태 |
|---|---|---|
| `pages/foundation.html` | Foundation 색상·타이포·간격 | ✅ 완료 |
| `pages/semantic.html` | Semantic Token 테이블 | ✅ 완료 |
| `pages/components.html` | Component 인터랙션 상태 미리보기 | ✅ 완료 |
| `pages/guide-md.html` | MD 원본 코드스니펫 (복사용) | ✅ 완료 |
| `pages/md-review.html` | 수정 제안·결정 대기·Figma 체크리스트 | ✅ 완료 |
| `pages/patterns.html` | Pattern 가이드 | 예정 |
| `pages/legacy.html` | Legacy 마이그레이션 가이드 | 예정 |
| `pages/policy.html` | 토큰 사용 정책 | 작성 중 |

## 네비게이션 관리

| 파일 | 역할 |
|---|---|
| `assets/js/main.js` | 사이드바 네비게이션 렌더링 (SITE_NAV 배열) |
| `data/site-map.json` | 페이지 메타데이터 |

> 새 페이지 추가 시 `main.js`의 `SITE_NAV` 배열과 `site-map.json` 모두 업데이트 필요.

---

# 🔗 파일 연동 규칙 (변경 시 자동 동기화 필수)

파일을 수정할 때는 아래 연동 관계를 확인하고 **연관 파일을 함께 수정한다.**
사용자가 개별 파일만 언급해도, 연동 파일에 미치는 영향을 즉시 반영한다.
별도 요청 없이 자동 적용한다.

## 연동 관계 맵

### `tokens/semantic.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Semantic 섹션 값·구조 반영 |
| `pages/semantic.html` | 토큰 테이블 표시 업데이트 |
| `pages/guide-md.html` | MD 스니펫 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `tokens/component-tokens-extracted.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Component 섹션 값·구조 반영 |
| `pages/components.html` | 컴포넌트 미리보기 업데이트 |
| `pages/guide-md.html` | MD 스니펫 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `tokens/foundation.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Foundation 섹션 값·구조 반영 |
| `pages/foundation.html` | 색상·타이포 팔레트 업데이트 |
| `pages/guide-md.html` | MD 스니펫 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `assets/css/tokens.css` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 (다운로드 원본) |

### `assets/js/main.js` (SITE_NAV) 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `index.html` | 개요 섹션 카드 목록 동기화 |
| `data/site-map.json` | 페이지 메타데이터 동기화 |

### 새 페이지 (`pages/*.html`) 추가 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/js/main.js` | SITE_NAV 배열에 항목 추가 |
| `data/site-map.json` | 페이지 메타데이터 추가 |
| `index.html` | 해당 섹션 카드 추가 |

### `assets/js/icons-data.js` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `pages/icons.html` | 아이콘 렌더링 동기화 |

### `pages/md-review.html` (결정 확정 항목) 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `tokens/semantic.md` 또는 `tokens/component-tokens-extracted.md` | 확정된 항목 즉시 반영 |
| `assets/css/tokens.css` | 확정된 토큰 값 즉시 반영 |

## 동기화 원칙

1. **단방향 금지** — 한 파일만 수정하고 연동 파일을 방치하지 않는다
2. **누락 없이 전파** — 연동 관계 맵의 모든 대상을 확인 후 수정한다
3. **install-prompt 인라인 CSS 최우선** — `tokens.css` 변경 시 항상 함께 수정한다
4. **요청 없이 자동 적용** — 사용자가 별도로 지시하지 않아도 연동 파일을 자동 수정한다

---

# 🤖 AI 작업 원칙

Claude는 "구현"이 아니라 "구조"를 만든다.

## 반드시 지킬 것

1. 토큰 없이 스타일링 금지
2. 추측 금지 (검증 후 판단)
3. 기존 구조 우선 탐색
4. 임의 생성 금지
5. **파일 편집은 허가 없이 즉시 진행** (사용자 명시 지시)
6. 파괴적 작업(파일 삭제, 구조 전면 변경)만 사전 확인

---

# 📋 작업 프로세스

## 토큰·구조 변경 전 필수 확인

토큰 이름·값·구조를 생성하거나 수정하기 전 반드시 확인:

```
1. tokens/component-tokens-extracted.md — 기추출 Component Token
2. tokens/semantic.md — Semantic Token 정의
3. Figma MCP (get_variable_defs, get_design_context) — 원본 직접 조회
```

위 확인 없이 새 토큰 이름이나 값을 생성하는 것은 금지한다.

## 큰 변경 시 사전 알림 양식

구조적 변경(새 카테고리 추가, 기존 토큰 삭제 등)에 한해:

```
📋 변경 계획

🔍 현재 상태:
🎯 목표:
📁 변경 대상:
🧩 토큰 영향 범위:
🌗 다크모드 영향 범위:
⚠️ 삭제/비호환 여부:
```

---

# 🧪 검증 기준

1. 토큰 구조 일관성 유지
2. Semantic 역할 명확성
3. Component Token → Semantic 참조 여부 (Foundation 직접 참조 금지)
4. 상태값 누락 여부
5. Dark Mode 확장 가능성
6. Core / Domain / Legacy 구분
7. 신규에서 Legacy 사용 유도 금지
8. kebab-case 네이밍 준수
9. CSS 클래스 약어 금지 (전체 단어 사용 원칙)

---

# 🏷️ CSS 클래스 네이밍 원칙

가이드 HTML 내 CSS 클래스는 약어 없이 의미 중심으로 작성한다.

## 허용 접두사

| 접두사 | 의미 | 사용 범위 |
|---|---|---|
| `typo-` | Typography | foundation.html 타이포 섹션 |
| `token-` | Token | semantic.html 토큰 테이블 |
| `border-width-` | Border Width | foundation.html 테두리 두께 섹션 |
| `color-` | Color | 색상 팔레트 |
| `spacing-` | Spacing | 간격 섹션 |
| `radius-` | Radius | 모서리 반경 섹션 |
| `palette-` / `pal-` | Palette | 색상 팔레트 그룹 |
| `platform-` | Platform | components.html PC/Mobile 구분 |

## 금지 약어

| 금지 | 대체 | 이유 |
|---|---|---|
| `tok-` | `token-` | `token-`과 혼재 금지 |
| `type-` | `typo-` | HTML `type` 속성과 혼동 |
| `bw-` | `border-width-` | 의미 불명확 |
| `fw-` | `weight-` | font-weight 약자 불명확 |
| `cat-` | `category-` | 의미 불명확 |
| `cnt-` | `count-` | 의미 불명확 |

---

# ⛔ 금지사항

* HEX 직접 사용 금지 (예외: `color-border-*` Dark 값·`color-overlay`는 rgba 허용)
* Foundation 직접 참조 남용 금지
* 의미 없는 이름 금지
* Legacy를 신규 기준처럼 사용 금지
* 서비스 UI를 강제 통합 금지
* 다크모드 고려 없는 토큰 확정 금지
* Danger 버튼 variant 재추가 금지 (삭제 확정)

---

# 🚫 Figma 원본 기준 준수 (임의 생성/값 변경 방지)

## 핵심 원칙

**Figma SW UX GUIDE V2.4 원본이 유일한 기준이다.**

Claude는 토큰 이름·값·구조를 절대 임의로 생성하거나 추측하지 않는다.
"일반적인 관례"나 "더 나은 값"을 이유로 원본을 무단 수정하는 것은 금지한다.

---

## 원본 값 절대 보존

- 색상 HEX 값: 원본 그대로 사용 (반올림·변환 금지)
- 수치 값(폰트 크기·간격·반경): 원본 숫자 그대로 사용
- Semantic 참조 구조: Figma 원본 연결 구조 그대로 유지
- "더 나은 값"·"표준 값"을 이유로 무단 수정 금지

---

## 토큰 생성 조건 (엄격 적용)

다음 두 조건을 모두 만족할 때만 새 토큰을 생성한다:

1. Figma 원본에서 해당 토큰 존재 확인됨
2. 아직 추출·정의되지 않은 상태임

조건 미충족 시 토큰을 생성하지 않고 사용자에게 확인을 요청한다.

---

## Figma 원본 네이밍 → CSS 변수 변환 규칙

| Figma 원본 경로 | CSS 변수명 |
|---|---|
| `color/button/primary/bg--default` | `--button-primary-default-bg` |
| `color/text/primary` | `--color-text-primary` |

변환 규칙: `/` → `-` · 공백 제거 · 대문자 → 소문자 · `--` 접두사 추가

---

# 🔍 토큰 수정 제안 워크플로우 (Review → 승인 → 반영)

## 원칙

토큰 유지보수 중 문제 발견 또는 개선이 필요한 경우:
- `pages/md-review.html` — 수정 제안·결정 대기 항목으로 등록
- 사용자 검토 및 승인 후에만 최종 토큰 파일에 반영

## 리뷰 대상 (이런 경우 반드시 제안으로 처리)

| 유형 | 예시 |
|---|---|
| 오타·네이밍 오류 | `placehoder` → `placeholder` |
| Semantic 참조 불일치 | Foundation을 직접 참조하고 있는 Component Token |
| 상태값 누락 | hover는 있으나 focus·disabled 없음 |
| 구조 개선 | 중복 정의된 토큰 통합 제안 |
| 다크모드 대응 누락 | 라이트 값만 있고 다크 값 미정의 |

---

# 📦 산출물 현황

```
tokens/
  semantic.md                    ✅ Light/Dark 전체 정의 완료
  component-tokens-extracted.md  ✅ 9개 그룹 완료 (Danger 제거됨)
  foundation.md                  ✅ 완료 (Dark 스텝 방향 규칙 포함)
  token-map.json                 ⬜ 미작성

pages/
  foundation.html    ✅ Dark Palette 포함
  semantic.html      ✅ Light/Dark 테마 전환
  components.html    ✅ PC/Mobile 플랫폼 전환 포함
  guide-md.html      ✅ MD 원본 코드스니펫 뷰어
  md-review.html     ✅ 리뷰·결정·체크리스트
  policy.html        🚧 작성 중
  patterns.html      ⬜ 미작성
  legacy.html        ⬜ 미작성
```

---

# 📌 핵심 원칙

디자인 시스템의 목표는 UI 통일이 아니다.

목표는:

1. 공통 기준 통일
2. 서비스별 확장 허용
3. 반복 구조 패턴화
4. 레거시 분리 및 점진적 전환
5. 토큰 중심 구조 유지

---

# 🧠 한 줄 정리

👉 디자인 시스템은 "컴포넌트"가 아니라
👉 **토큰 + 구조 + 규칙의 시스템이다**
