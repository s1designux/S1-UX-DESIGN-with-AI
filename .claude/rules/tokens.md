---
paths:
  - "plugins/figma-vars-installer/src/**"
  - "assets/css/tokens.css"
  - "assets/css/typography.css"
  - "registry/tokens/**"
  - "pages/semantic.html"
  - "pages/foundation.html"
---

# 토큰 규칙 (Foundation · Semantic · Component · Light/Dark · 연동)

> CLAUDE.md 에서 이동(2026-08-05). 문장은 원문 그대로다. 정본·우선순위·정본 신설 금지는 루트 CLAUDE.md 소관.

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

**예외 — rgba 허용 범위 (1가지만)**

| 토큰 카테고리 | 모드 | 허용 이유 |
|---|---|---|
| `color-overlay` | Light·Dark 공통 | alpha 채널 포함 값은 Foundation Primitive alias 불가 |

> ~~`color-border-*` Dark 예외~~ — 2026-05-18 ND-2 해소. Dark border는 Foundation gray-dark 스케일로 교체됨.

위 경우 외 rgba 직접 사용은 금지한다.

---

## 전체 색상 계열 · Dark 스텝 방향

> **전 색상 계열의 실제 HEX 값 정본은 `plugins/figma-vars-installer/src/vars-data.ts` FOUNDATION_COLOR** (사람이 보기 편한 표는 `pages/foundation.html`, AI 소비용은 `design/DESIGN.core.md` frontmatter). 스텝 간격: 모든 계열 50 단위(Gray만 0·50·100·200~900 예외).
> **Dark 스텝 방향 규칙**(낮은 숫자=어두움·높은 숫자=밝음 + 새 팔레트 추가 체크리스트) 정본은 **vars-data.ts 의 gray-dark 팔레트 주석**이며, 사람이 읽는 요약은 `registry/governance/design-narrative.json` → DESIGN.md §2 에 있다. (2026-08-01: 종전 정본이던 `tokens/foundation.md` 아카이브에 맞춰 이관.)
> **Status Dark**(`--color-status-dark-red`/`-green`/`-yellow`, 각 계열 350 step alias, 피드백 상태 전용)는 vars-data 정본에 없는 별칭이라 `assets/css/tokens.css` 에 정의되고, `registry/tokens/foundation.colors.json` 의 `_nonCanonical.statusDarkAlias` 로 보존된다(생성기가 지우지 않음).

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

> **⚠️ 은퇴 알림(2026-07-02):** `registry/tokens/component.tokens.json`(컴포넌트→별칭→semantic **별칭 CSS 변수층** 서술 파일)은 **은퇴**됐다. 현행 정본은 **설치기가 각 컴포넌트를 semantic 토큰에 직접 바인딩**(`plugins/figma-vars-installer/src/build-components.ts` 의 `scv()` + `vars-data.ts`)하는 방식이다. 이 파일은 `deprecated-tokens.json` legacyFiles 로 격리(Gate 20 검사 제외)됐고 index.json 에서 `_componentRetired` 로 강등됐다. **"컴포넌트가 어떤 토큰을 쓰나"는 이 문서가 아니라 vars-data/build-components(정본)에서 확인**한다. 아래 설계 원칙(색은 Semantic 경유·네이밍 등)은 개념 기준으로 유효하나, 별칭 CSS 변수 레지스트리 자체는 더 이상 정본이 아니다. (레거시 판단은 항상 `deprecated-tokens.json` 단일정본부터 — Gate 21 이 좀비 active 등록을 차단.)

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
```

---


# 📁 토큰 정의 파일

| 파일 | 역할 | 상태 |
|---|---|---|
| ~~`tokens/semantic.md`~~ | **아카이브(2026-08-01)** → `tokens/legacy/`. 값 정본=vars-data, 사람용 문서=DESIGN.md·웹 가이드 |
| ~~`tokens/component-tokens-extracted.md`~~ | **아카이브(2026-08-01)** → `tokens/legacy/`. 은퇴한 컴포넌트-별칭층 시대의 추출 기록 |
| ~~`tokens/foundation.md`~~ | **아카이브(2026-08-01)** → `tokens/legacy/`. Dark 스텝 규칙은 vars-data 주석 + design-narrative 로 이관 |

# 🔗 파일 연동 규칙 (변경 시 자동 동기화 필수)

파일을 수정할 때는 아래 연동 관계를 확인하고 **연관 파일을 함께 수정한다.**
사용자가 개별 파일만 언급해도, 연동 파일에 미치는 영향을 즉시 반영한다.
별도 요청 없이 자동 적용한다.

## 연동 관계 맵

### `plugins/figma-vars-installer/src/vars-data.ts`(토큰 값 정본) 변경 시
> **`npm run tokens:reconcile` 한 번이면 아래가 전부 재생성된다** (2026-08-01: 9단계 우산 명령 완성).
> 손으로 하나씩 칠 필요 없고, 빠뜨리면 게이트가 커밋을 막는다.

| 연동 대상 | 동기화 내용 | 생성 단계 |
|---|---|---|
| `assets/css/tokens.css` | Semantic·Foundation 섹션 전체 | 1·2 |
| `pages/foundation.html` | 색 팔레트 3블록 + number 5블록 | 3·4 |
| `registry/tokens/foundation.colors.json` | Foundation 색 목록(Gate 7 대조 표면) | 5 |
| `pages/semantic.html` | 토큰 표 | 6 |
| `design/DESIGN.core.md`·`DESIGN.vms.md` | AI 소비용 문서 | 7 |
| `pages/install-prompt.html` | 다운로드 인라인 CSS + AI 프롬프트 | 8 |
| 설치기 zip | Figma Variables 설치본 | 9 |

> 종전에 여기 있던 `tokens/semantic.md`·`foundation.md`·`component-tokens-extracted.md` 3개 항목은
> 그 문서들이 2026-08-01 아카이브되면서 제거됐다(손유지 사본 폐지 — 정본은 1곳).

### `assets/css/tokens.css` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 (다운로드 원본) |

## 동기화 원칙

1. **단방향 금지** — 한 파일만 수정하고 연동 파일을 방치하지 않는다
2. **누락 없이 전파** — 연동 관계 맵의 모든 대상을 확인 후 수정한다
3. **install-prompt 인라인 CSS 최우선** — `tokens.css` 변경 시 항상 함께 수정한다
4. **요청 없이 자동 적용** — 사용자가 별도로 지시하지 않아도 연동 파일을 자동 수정한다

---


# 📋 작업 프로세스

## 토큰·구조 변경 전 필수 확인

토큰 이름·값·구조를 생성하거나 수정하기 전 반드시 확인:

```
1. plugins/figma-vars-installer/src/vars-data.ts — 토큰 값 정본(FOUNDATION_COLOR·SEMANTIC_COLOR 등)
2. design/DESIGN.core.md — 역할·용도 서술(자동 생성, 손편집 금지)
3. registry/components/*.json — 컴포넌트가 어떤 토큰을 쓰나
4. Figma MCP (get_variable_defs, get_design_context) — 원본 직접 조회
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

