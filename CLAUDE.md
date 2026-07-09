# ASC - AI Context Document (Design System Harness)

> 이 문서는 Claude가 디자인 시스템을 **수집, 정리, 구조화, 검증**하기 위한 기준입니다.
> 현재 목표는 UI 구현이 아니라 **디자인 시스템을 구축하는 것**입니다.
> 마지막 업데이트: 2026-06-06 (규칙 체계 정리: 두 갈래 분류 원리 상위화·rgba EX02/EX06·R12/R13 폐지·hover 레거시 누락 처리·공통 규칙 허브 신설·중복 정본화(audit-rules.json/CLAUDE.md)·README 요약+링크.)

---

## 하네스: Design System

**목표:** 토큰 검증·HTML 가이드 생성·Figma 동기화·리뷰 관리를 자동화한다.

**트리거:** 토큰 검증, 가이드 페이지 업데이트, Figma 동기화, MD 리뷰 등록 작업 요청 시 `design-system` 스킬을 사용하라. **Figma 컴포넌트를 코드로 옮기는 작업**("Figma ~ 구현/변환/만들어줘")은 `figma-to-code` 스킬을 사용하라. **레거시 시안의 화면/플로우를 최신 정본 컴포넌트로 Figma에 그대로 재현하는 작업**("이 레거시 화면/플로우 그대로 만들어줘/재현/옮겨줘")은 `screen-rebuild` 스킬을 사용하라. **Figma 디자인 시스템 라이브러리의 컴포넌트/변형세트 "정의" 자체를 빌드·편집하는 작업**("Figma에 ~ 컴포넌트 만들어/추가해줘", "~를 변형세트(variant set)로 묶어/세트화해줘", "variant 추가", "Shell/아이콘 컴포넌트 빌드/수정")은 `figma-library-build` 스킬을 사용하라 — 빌드는 figma-library-builder(🏗️), 검증은 component-verifier(🤖)가 **분리** 수행하고 총괄(⭐)은 흐름만 관리한다(⭐ 단독 빌드+검증 금지·§⚖️ 운영 원칙). 단순 질문과 **단일 노드 좌표/이름 1건 같은 순수 기계적 미세 편집**은 스킬 없이 직접 응답 가능(구조 변경은 위임).

**에이전트:** `.claude/agents/` — token-validator · guide-builder · figma-inspector · component-verifier · token-sync · screen-rebuilder(🪞 레거시 화면 빌드 전용, screen-rebuild 스킬 3단계) · figma-library-builder(🏗️ 라이브러리 컴포넌트/변형세트 빌드 전용, figma-library-build 스킬 3단계) · source-reader(📖 저장소 정본 판독 전용 — ⭐가 소스를 직접 훑어 짐작하는 것을 대체, 읽기 전용·실제 렌더/추적으로 확인, §⚖️ '읽기 위임' 하드룰)

**토큰 값 전파:** 사용자가 **토큰 "값"을 바꾸면**(예: "control-bg-disabled를 gray/100으로", "이 토큰 값 일괄 반영해줘") `token-sync` 에이전트가 연관된 모든 표면(tokens.css·vars-data.ts·install-prompt·semantic 문서·설치기 zip)에 누락 없이 전파한다. 표면 위치는 `npm run tokens:locate -- <token>`으로 결정론적으로 확인. 새 토큰 생성·네이밍·구조 변경은 token-sync 범위 밖(token-validator 소관).

**워크플로우 스킬:** `figma-to-code` — Figma 컴포넌트를 코드로 옮기는 5단계 검문소 워크플로우(재고조사 → 수치추출 → 구현 → 자가대조 → 다크모드). 상세: 아래 "🪜 Figma → 코드 5단계 워크플로우" 섹션. · `screen-rebuild` — 레거시 시안 화면/플로우를 최신 정본 컴포넌트로 Figma에 동일 재현하는 4단계 검문소 워크플로우(원본 재고조사 → 매핑·허용편차 → 빌드 → 3층 검증). figma-to-code의 역방향(레거시 화면→V3.0 Figma). 상세: `.claude/skills/screen-rebuild/SKILL.md`. · `figma-library-build` — 코드/디자인 의도를 Figma **라이브러리 컴포넌트/변형세트 "정의" 자체**로 빌드·편집하는 4단계 검문소 워크플로우(원본/의도+라이브러리 현황 재고조사🔍 → 매핑·빌드계획🎩 → **빌드 위임**🏗️ figma-library-builder → **검증 분리**🤖 component-verifier: variant 전수·**패킹 붕괴**·토큰 바인딩·순환참조·렌더). ⭐ 단독 빌드+검증 금지. screen-rebuild(화면 인스턴스 조립)와 구분. 상세: `.claude/skills/figma-library-build/SKILL.md`.

**변경 이력 (작성 규칙):** 본 표에는 **최근 건만 한 줄**(날짜·무엇을·한 줄 사유)로 남긴다. 상세 경위는 **git commit 메시지**와 **`reports/changelog-archive.md`**(전체 보존본, 세션 미로드)에 둔다. 새 항목은 한 줄로 추가하고, 표가 길어지면 오래된 행을 아카이브로 옮긴다. (이력으로 컨텍스트가 무거워지지 않게 — 2026-06-17 정책 확정)

| 날짜 | 변경 내용 (한 줄) |
|------|------------------|
| 2026-07-06 | **📖 source-reader(정본 판독 에이전트) 신설 + '읽기 위임' 하드룰** — ⭐가 정본 소스를 대충 훑고 짐작하는 반복 문제(components-new Button 표출을 JS 재배치·CSS·렌더 미확인·소스 순서만 보고 "Action이 상태 옆 열"이라 단정→실제는 별도 상단 스트립)를 계기로, "만드는 자≠검증하는 자" 원칙을 **'읽는 자'에게도 적용**. 판단에 필요한 정본 사실(레이아웃/구조/값)은 ⭐가 자기 훑기로 단정 금지, 읽기 전용 `source-reader`에 위임(소스순서→렌더 추측 금지·배치주장은 실제렌더 or CSS+JS 전체추적으로 확인+방법명시·file:line 인용·모르면 미확인). §⚖️ 하드룰+§🎭 액터표(📖)+에이전트 목록 등재. 사용자 결정(영구 표준·새 전담 에이전트). |
| 2026-07-06 | **Gate 23(컴포넌트 표출 레이아웃 검수기) 신설 + PC 17개 표출 규칙 정본화·전면 교정** — river 요구(공통 표출 틀 + 컴포넌트별 개별 규칙)로 PC 메인 17개의 표출 규칙을 정본화(`registry/governance/component-presentation-policy.json`, 컴포넌트별 개별 배정)하고, **실제 렌더 DOM**(헤드리스 크롬 --dump-dom, JS 재배치 후) 기준으로 대조하는 `scripts/presentation-layout-check.js` 신설(gate:check 편입, 크롬없음 SKIP+3회 재시도). 📖 source-reader 렌더 판독으로 재고조사→규칙 확정→Chip 파일럿(승인)→🤖 guide-builder 가 17개 교정(사이즈→Action 통합·별도 사이즈/라벨 블록 제거·Radio 라벨 통합·전 사이즈 인터랙티브화(per-instance JS)·Table Action+사이즈병합+상하단라인정보·Pagination 상태 세로·Dropdown/Multi Toggle/GNB 세트 Action+GNB 하위항목 정보). disabled 금지커서(not-allowed) 페이지 전역 제거(사용자 요청). Gate 23 위반 10→0, 적대적 테스트(사이즈블록 재주입→차단) 통과, gate:check PASSED. 빌드=guide-builder·검증=렌더+게이트 분리. |
| 2026-07-03 | **Gate 22(페이지 레이아웃 검수기) 신설 + 페이지 전폭 정리 + 레거시 검색노출 폐기** — 그리드·표 페이지 5종(icons·foundation·semantic·dashboard(Agent Team)·legacy 중 legacy 제외 4)을 전폭 전환 요청 계기로, "페이지 공통 틀(헤더가 사이드바 LNB 부착)·폭 정책(wide/readable)"을 정본(`registry/governance/page-layout-policy.json`)과 기계 대조하는 `scripts/page-layout-check.js` 신설(gate:check·커밋훅 편입, `--fix` 자동교정). 즉시 실제 위반 3건 적발: components-new·patterns 헤더 폭 미확장(헤더가 컨텐츠/LNB 에 덜 붙음, ⭐가 눈으로 놓치던 클래스)→--fix 교정, legacy 검색인덱스 잔존→제거. 적대적 테스트(헤더 분리·미분류 escape 주입→차단) 통과. 레거시는 이미 deprecated-tokens legacyFiles+site-map _archive 로 제자리 격리 상태라 물리 이동 대신 검색노출 제거+retired 분류(부활 차단). self-certify 사각지대(시각/구조)를 기계 게이트로 승격. |
| 2026-07-02 | **Mobile Bottom Nav 설치기·웹 편입 + 레거시 신호 정리(Gate 20 교정·Gate 21 신설)** — 하단내비바(Tab Item 세트)를 figma-library-build(🏗️빌드/🤖검증 분리)로 V3.0 빌드→육안검수→`buildMobileBottomNav` 설치기 편입(ICON_KEYS home=V2.2·allowed-remote-keys 등록·Light/Dark 스펙 자동)+`components-new.html` 섹션+커버리지, 🤖component-verifier(D) Gate13 기록, zip 재빌드. **레거시 오판 재발 방지:** `component.tokens.json`(은퇴한 컴포넌트-별칭층)을 deprecated-tokens.json legacyFiles 등록 + **Gate 20 이 legacy-skip 을 존중하도록 교정**(규약 위반이었음)·baseline 209→86 축소, index.json `_componentRetired` 강등, CLAUDE.md 은퇴 명시, **Gate 21(active/legacy 일관성) 신설**(은퇴 파일이 index active 로 남는 좀비 등록 차단, 적대적 테스트 통과). 정본=vars-data/build-components. gate:check PASSED |
| 2026-06-30 | **Gate 19(변형/상태 커버리지, Level 2) + 겉핥기 예방 원리** — Gate 18(섹션 존재)의 다음 층: 각 HTML 섹션이 설치기 변형의 State(상태)를 다 보여주나를 mock 실측 ↔ data-cov-states 옵트인 선언 대조(누락=차단). **핵심 예방 원리**: 검사기가 "몇 섹션 검증·몇 섹션 미계측"을 **스스로 선언** → 나도 기계도 '다 됐다'는 거짓 완전성을 구조적으로 못 만듦(Gate 17 '추출 0건=안됨' 확장). Multi Toggle·Dropdown 2섹션 계측(verified), 나머지 12 미계측 정직 보고. stateSource(요소 상태원 매핑). 적대적 테스트(상태 제거→차단) 통과. [[feedback_verify-primary-source-with-citation]] |

> 위 이전(2026-04-29 ~ 2026-06-15)의 전체 상세 이력 72건: **`reports/changelog-archive.md`** 참조.

---

# 🎯 현재 프로젝트 단계

> **완료된 단계·미결 사항(다음 우선순위) 전문은 `.claude/docs/project-status.md` 참조.** 다음 작업 계획 시 그 파일을 읽는다.

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

## 이 프로젝트 공식 token layer 용어

```
Foundation Token   (기본 팔레트 — gray/blue/red scale 등)
       ↓
Semantic Token     (역할 기반 — bg/text/border/action 등)
       ↓
Component Token    (컴포넌트 별칭 — --input-* / --button-* 등)
```

| 기존/일반 용어 | 이 프로젝트 공식 용어 |
|---|---|
| Primitive | **Foundation** |
| Base Palette | **Foundation** |
| Raw Color | **Foundation** |
| Semantic | Semantic |
| Component Alias | Component |

> **Foundation은 Primitive가 아니다.** 이 프로젝트에서 기본 팔레트 계층은 항상 "Foundation"으로 부른다.
> `Primitive`, `Base`, `Raw` 등의 용어는 다른 디자인시스템에서의 동의어이며, 이 프로젝트에서는 사용하지 않는다.

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

> **전 색상 계열(Gray·Blue·Red·Orange·Yellow·Green·Skyblue·Purple·Brown·Visual Gray + Base·Brand)의 Light/Dark 접두사·스텝 범위·실제 HEX 값과 Dark Primitive 스텝 방향 규칙(gray-dark 0→900·blue-dark 50→500 등) 정본은 `tokens/foundation.md`** (CLAUDE.md 본문보다 풍부·전 계열 HEX 수록). 스텝 간격: 모든 계열 50 단위(Gray만 0·50·100·200~900 예외).
> **Status Dark**(`--color-status-dark-red`/`-green`/`-yellow`, 각 계열 350 step alias, 피드백 상태 전용)는 foundation.md 프로즈엔 없고 `assets/css/tokens.css`·`tokens/semantic.md`·`registry/tokens/foundation.colors.json`에 정의됨.

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

# 🎛️ 컴포넌트 관리 기준

모든 컴포넌트를 통합하지 않는다.

## 분류 기준

### 1. Core Component

* 공통 UI
* 버튼, 인풋, 셀렉트, 팝업, 바텀시트 등

**CSS 토큰 추출 완료 variants**: `primary` / `secondary` / `blue-line`
> `ghost`: tokens.css에 legacy 보존. CSS 구현 없음 (deprecated 확정 2026-05-11)
> `danger`: 삭제 확정 (2026-04-29). 공식 V2.4 token 없음. 재추가 금지.

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

## 📐 표시(나열) 순서 ≠ 빌드(생성) 순서 규칙 (2026-06-24 확정 · 영구)

설치기/Figma 생성기(`build-components.ts`)와 프리뷰(`render.js`)에서 컴포넌트를 다룰 때 **두 순서를 분리**한다.

| 구분 | 순서 기준 | 원칙 |
|------|----------|------|
| **표시(나열) 순서** | `COMPONENT_CATEGORIES_GRID` 의 `members` 배열 | **메인 컴포넌트 → 그 안을 구성하는 요소 컴포넌트** 순 (예: Select Box → Dropdown → Dropdown List) |
| **빌드(생성) 순서** | `BUILD_DEPENDENCIES` 위상정렬(`buildOrderFor`) | **요소 컴포넌트 먼저** — 부모가 자식을 인스턴스로 부착하므로(예: Select Box Open 이 Dropdown 을 `BUILT_COMPS` 에서 가져다 붙임) 자식이 먼저 빌드돼야 함 |

- `members` 는 **항상 표시 순서**로만 유지한다. 빌드 의존성 때문에 members 를 재배열하지 않는다(그렇게 하면 나열 순서가 깨진다 — 이번 회귀의 원인).
- 부모↔자식 부착 관계가 새로 생기면 `BUILD_DEPENDENCIES[부모] = [자식…]` 에 한 줄 추가한다. 빌드는 `buildOrderFor` 가 요소를 먼저 생성하고, `buildAllComponents` 의 layout 패스가 카테고리 내부를 members(표시) 순서로 세로 재배치한다. 프리뷰는 `render.js` 가 categorySets 를 members 순서로 정렬한다.
- 이 규칙 변경(루프·BUILD_DEPENDENCIES)은 `build-components.ts` 구조 변경 → ⭐ 단독 자가검증 금지, 🤖 component-verifier 검증(Gate 13) 필수.

---

## 🔁 Core Component Reuse Rule (2026-05-20 확정)

모듈·패턴을 만들기 전에 component registry에서 기존 코어 컴포넌트를 먼저 확인한다.

### 원칙

1. **새로 만들기 전에 확인** — Button, Checkbox, Radio, Toggle, Input, Select, Textarea, Chip 등 이미 정의된 컴포넌트는 새로 만들지 않는다.
2. **모듈의 역할은 조합** — 모듈은 코어 컴포넌트의 배치·조합·상태 연결을 담당한다.
3. **시각 스타일 override 금지** — 코어 컴포넌트의 시각 스타일, 상태 스타일, 토큰을 모듈에서 재정의하지 않는다.
4. **없는 상태는 기록** — 필요한 상태·variant가 코어에 없으면 `needs-core-update` 또는 `decision-required`로 기록한다. 임의 구현 금지.
5. **dependency 명시 의무** — 모듈 registry JSON에 사용한 코어 컴포넌트를 `dependencies.coreComponents`로 명시한다.
6. **중복 발견 시 수정** — 모듈 안에서 임의로 만든 유사 컴포넌트가 발견되면 중복 구현으로 보고 코어로 교체한다.

### 확정 사례

| 모듈 | 사용 코어 컴포넌트 | 비고 |
|------|-----------------|------|
| Table selection | Checkbox (`s1-checkbox`) | header indeterminate 포함, `is-indeterminate` CSS 코어에 추가됨 |
| Filter group | Checkbox / Radio / Chip | 예정 |
| Form row | Input / Select / Textarea | 예정 |
| Action area | Button | 예정 |
| Toggle setting row | Toggle | 예정 |

### 금지 패턴

```css
/* 금지 — Table이 Checkbox를 재정의하는 class */
.s1-table-checkbox { accent-color: ...; }
```

```html
<!-- 금지 — 모듈 전용 체크박스 -->
<input type="checkbox" class="s1-table-checkbox">

<!-- 올바른 사용 — 코어 컴포넌트 배치 -->
<td class="s1-table-td--selection">
  <label class="s1-checkbox" aria-label="행 선택">
    <div class="s1-checkbox-box">…</div>
  </label>
</td>
```

### 모듈 편집 시 체크리스트

```
□ component registry에서 재사용 가능한 코어 컴포넌트 확인
□ 모듈 전용 class로 코어 컴포넌트를 재정의하지 않았는지 확인
□ registry JSON에 dependencies.coreComponents 명시
□ 필요한 상태가 코어에 없으면 needs-core-update 기록
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
| `pages/components-new.html` | Component 인터랙션 상태 미리보기 | ✅ 완료 |
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

## MVP3.3 Portal IA 규칙 (2026-05-11 확정)

### SITE_NAV 그룹 구조

SITE_NAV는 사용자 대면 그룹과 System 운영 그룹으로 분리한다.

**사용자 대면 그룹** (디자이너·개발자 탐색용):
- `개요`: Overview, 토큰 설치 프롬프트
- `Foundation`: Foundation Tokens, Semantic Tokens
- `Design System`: Components, Button, Icons, Patterns, Policy, Legacy Guide
- `AI 워크플로우`: AI Snippets, Guide MD, MD 리뷰

**System 그룹** (운영·검증용, 사이드바 하단):
- System Status (구: Registry Health)
- Foundation Registry, Semantic Registry, Component Tokens, Component Registry

### 규칙

1. **System 그룹 격리** — 레지스트리 뷰어·거버넌스·상태 대시보드는 System 그룹에만 배치한다. 사용자 대면 그룹에 혼재 금지.
2. **Button 위치** — Button 컴포넌트 페이지는 Design System 그룹에 위치한다. Registry/System에 두지 않는다.
3. **리네임 규칙** — "Registry Health"는 항상 "System Status"로 표시한다. 코드(id, 파일명)는 유지, 텍스트만 변경.
4. **컴포넌트 상세 페이지 탭 구조** — 컴포넌트 harness 페이지는 Preview / Usage / Code / Figma / Review / Token Details 탭을 기본 구조로 사용한다.

## Current Button Standard (MVP3.4.2 — 2026-05-12 확정)

Button을 편집하거나 검토할 때 아래 기준을 단일 참조점으로 사용한다.

1. **공식 variants** — primary / secondary / blue-line. ghost는 공식 variant가 아니다. danger는 삭제됨.
2. **Figma states** — default / hover / pressed / disabled
3. **Harness columns** — action / default / hover / pressed / disabled
4. **action ≠ Figma state** — action은 Figma 디자인 상태가 아니다. HTML harness의 실제 인터랙션 테스트 컬럼이다.
5. **default = static preview** — default 컬럼 버튼에는 `.is-preview`를 적용한다.
6. **Size** — PC: medium(h44) / xsmall(h34) / xxsmall(h28), Mobile: mobile(h48)
7. **CSS class** — s1-btn-lg=medium, 무수식어=xsmall, s1-btn-sm=xxsmall, s1-btn-mobile=mobile. **s1-btn이 공식 CSS 시스템. sw-button(button.css)은 deprecated.**
8. **Token policy** — 색상은 반드시 Semantic 경유. raw HEX 금지. Foundation 직접 참조 금지.
9. **focus-ring 없음** — 디자인시스템 기준 미정의. --button-*-focus-ring 토큰 없음. is-focus outline CSS 없음.
10. **Sync** — Button 기준 변경 시 registry / HTML / md / reports를 함께 수정. `npm run sync:button`으로 정합성 검사.
11. **불일치 발견 시** — 임의 결정 금지. `reports/button-sync-check.md`에 기록 후 사용자 확인.

## MVP3.3 Button Components Integration 규칙 (2026-05-11 확정)

Button 페이지 편집 시:

1. **단일 진입점** — Components > Button (`pages/components-new.html`)이 Button의 유일한 사용자-facing 진입점이다.
2. **기존 문서 우선** — 기존 `components-new.html` + 기존 컴포넌트 가이드 내용이 우선 기준이다. registry와 충돌하면 기존 문서 기준으로 registry를 수정한다.
3. **Registry/System 메뉴** — Component Registry, Component Tokens는 별도 사용자-facing 메뉴로 노출하지 않는다.
4. **ACTION 컬럼** — Button matrix에서 DEFAULT 앞에 ACTION 컬럼을 배치한다.
5. **ACTION = 인터랙션 전용** — ACTION 셀만 실제 클릭/disabled 테스트가 가능하다.
6. **DEFAULT = 정적 프리뷰** — DEFAULT 셀 버튼에는 `.is-preview`를 적용한다 (pointer-events: none).
7. **공식 variants** — primary / secondary / blue-line만 공식 노출. ghost는 노출 금지.
8. **Size 명칭** — PC: medium(h44) / xsmall(h34) / xxsmall(h28), Mobile: mobile(h48).
9. **Class naming** — `s1-btn` 기반 (s1-btn-lg=medium, 무수식어=xsmall, s1-btn-sm=xxsmall, s1-btn-mobile=mobile).
10. **변경 기록** — `reports/mvp3-3-button-components-integration.md`에 기록한다.

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
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `tokens/component-tokens-extracted.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Component 섹션 값·구조 반영 |
| `pages/components-new.html` | 컴포넌트 미리보기 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `tokens/foundation.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Foundation 섹션 값·구조 반영 |
| `pages/foundation.html` | 색상·타이포 팔레트 업데이트 |
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

# 🤖 AI 작업 원칙 — 공통 규칙 허브 (정본)

> **이 섹션이 "공통 규칙"의 정본이다.** 모든 작업(figma-to-code·layout-builder·토큰 검증 등)에 공통 적용된다.
> 작업별(전용) 규칙은 각 작업 문서에만 둔다 → figma-to-code: `.claude/skills/figma-to-code/SKILL.md` · 레이아웃 틀: `component-page-template.md` · 토큰 거버넌스(R01~R11): `registry/governance/audit-rules.json`.

Claude는 "구현"이 아니라 "구조"를 만든다.

## 반드시 지킬 것 (공통)

1. 토큰 없이 스타일링 금지
2. **추측 금지** (검증 후 판단) — 모든 수치는 실제로 읽은 값만 사용
3. 기존 구조·토큰·컴포넌트 **우선 탐색·재사용** (임의 생성 금지)
4. 임의 생성 금지
5. **파일 편집은 허가 없이 즉시 진행** (사용자 명시 지시)
6. 파괴적 작업(파일 삭제, 구조 전면 변경)만 사전 확인
7. **막히면 보고** — 값·에셋을 못 얻으면 임의로 채우지 말고 어떤 항목인지 사용자에게 알린다
8. **두 갈래 분류** — 코드↔Figma 불일치를 자동 "코드 오류"로 보지 않는다: (a) 코드 실수→수정 / (b) 사전 등록된 개선→유지+개선목록 / (c) 애매→사용자 확인 (§🚫 상위 원리)
9. **검증 역할 분리** — 만드는 자 ≠ 검증하는 자 (구현=guide-builder, 4단계 대조=component-verifier)
10. **단계/검문소 승인 대기** — 검문소 통과 전 다음 단계로 넘어가지 않는다
11. **색상은 Semantic 경유**·HEX 직접 금지 (열거 규칙 R01~R11은 `audit-rules.json` 정본 참조)
12. 완료 시 **Orchestrator Summary** 형식 보고

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
| `platform-` | Platform | components-new.html PC/Mobile 구분 |

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

> 기계가 검사하는 열거 규칙의 **정본은 `registry/governance/audit-rules.json`(R01~R11)** 이다. 아래는 사람용 요약이며, 충돌 시 audit-rules.json이 우선한다.

* HEX 직접 사용 금지 (예외: `color-overlay`만 rgba 허용 = EX03. ~~border rgba 예외(EX02)~~ 폐지 — ND-2(2026-05-18) 및 EX02/EX06·R12/R13 제거 2026-06-06)
* Foundation 직접 참조 남용 금지
* 의미 없는 이름 금지
* Legacy를 신규 기준처럼 사용 금지
* 서비스 UI를 강제 통합 금지
* 다크모드 고려 없는 토큰 확정 금지
* Danger 버튼 variant 재추가 금지 (삭제 확정)

---

# 🚫 Figma 원본 기준 준수 (임의 생성/값 변경 방지)

## 핵심 원칙

**Figma DS 2.4(SW UX GUIDE V2.4)는 "정답지"가 아니라 "유일한 참고 출발점"이다.** (모든 검증 규칙의 상위 원리)

- DS 2.4는 레거시이며 개선이 필요한 자료다. 무엇을 개선할지 보기 위한 참고용이지, 그대로 베껴야 할 정본이 아니다.
- 따라서 **"코드가 Figma와 다르면 코드 오류"라고 자동 판정하는 것을 금지한다.**

### 두 갈래 분류 (불일치 처리의 상위 원칙)

코드와 Figma가 다를 때는 반드시 분류한다:

- **(a) 코드 실수** (색 오연결·variant 누락 등) → **코드를 고친다.**
- **(b) 사전 등록된 개선** (Figma 레거시의 누락/구식을 코드가 개선) → **코드를 유지하고 "Figma 개선 필요 목록"에 적재.**
- **(c) 애매** → (b)로 빼지 말고 **사용자에게 확인한다.** 검사기가 임의 판정하지 않는다. **애매한 것을 (b)로 처리하면 버그 면죄부가 되므로 금지.**
- 이미 합의된 개선(예: **hover** — 레거시에 자주 누락)은 **(b)로 사전 등록**한다.

### 두 갈래 분류의 적용 범위 (정확 대조와 구분)

두 갈래 분류는 **레거시가 잘못 정의했을 수 있는 값(색·크기·두께·타이포 등)** 에만 적용한다.
**원본을 그대로 가져와야 하는 것(variant 구성·아이콘 원본·토큰 참조 구조)** 은 두 갈래에서 제외하고 **항상 엄격하게 ❌ 처리한다(개선 핑계 금지).**
새로운 속성이 나오면 **"레거시가 틀렸을 수 있는 값인가, 원본을 베껴야 하는 것인가"** 로 갈래를 판단한다.

| 갈래 | 대상(예) | 처리 |
|------|---------|------|
| **두갈래 분류** ((a)/(b)/(c)) | 색상값·크기·두께·타이포 등 — 레거시가 틀렸을 수 있는 값 | 불일치 시 (a)코드실수→수정 / (b)사전등록 개선→유지+목록 / (c)애매→확인 |
| **정확 대조** (두갈래 제외, 항상 엄격) | variant 구성·아이콘 원본·토큰 참조 구조 — 원본을 베껴야 하는 것 | 불일치 시 무조건 ❌ ((b)/(c) 적용 금지) |

이 원리를 `token-validator`·`component-verifier`·`figma-inspector` 등 **검증 규칙 전반**에 적용한다. "Figma 불일치 = FAIL"로 단정하지 않는다.

> 단, 아래 "임의 생성/값 변경 방지"는 그대로 유지한다. 두 갈래 분류는 *이미 발견된 차이*를 다루는 것이지, 추측으로 새 값을 만들 허가가 아니다.

Claude는 토큰 이름·값·구조를 임의로 생성하거나 추측하지 않는다.
"일반적인 관례"나 "더 나은 값"을 이유로 **원본 값을 무단으로 잘못 읽거나 반올림·변환하는 것**은 금지한다.

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

> ⚠️ **인프라 부재, 재설계 대기 (2026-07-08 기록)** — 아래가 등록처로 지정한 `pages/md-review.html`은 2026-06-24 삭제되어 현재 존재하지 않는다. 이 워크플로우는 지금 등록할 곳이 없는 상태다. 청소 대상이 아니라 재설계 과제로 남겨둔다(파일명 참조는 그대로 유지).

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

> **토큰/페이지 산출물 현황표는 `.claude/docs/project-status.md` 참조.**

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

---

# 🗂️ MVP0 Registry 운영 기준 (추가: 2026-05-11)

## Registry 위치와 역할

```
registry/index.json           ← 모든 Registry 파일의 진입점
registry/tokens/              ← 토큰 기준 데이터 (JSON)
registry/components/          ← Core Component 사양 (JSON)
registry/figma/               ← Figma 노드 매핑
registry/governance/          ← 버전·검증규칙·deprecated·마이그레이션
registry/ai/                  ← AI 스니펫·리뷰 프롬프트
reports/                      ← 검수 결과물 (MD)
```

## Claude가 registry를 사용하는 방법

- 토큰 이름·값을 확인할 때: `registry/tokens/*.json` 우선 참조
- 컴포넌트 사양을 확인할 때: `registry/components/*.json` 참조
- 새 토큰 생성 전: `registry/governance/audit-rules.json` 검증 규칙 확인
- Deprecated 항목: `registry/governance/deprecated.json` 확인 후 재추가 금지

## 상태값 (status / darkStatus)

| 값 | 의미 |
|----|------|
| `stable` | 확정 완료, 그대로 사용 |
| `candidate` | 미확정 — md-review.html 등록 후 사용자 승인 필요 |
| `planned` | 작성 예정 |
| `deprecated` | 삭제 확정, 사용 금지 |

## 기존 MD 파일과의 관계

`tokens/*.md` 파일은 인간 가독 문서로 유지된다.
**기준 데이터는 registry JSON이며, MD는 설명 문서다.**
충돌 시 registry JSON이 우선한다.

---


# 🗂️ 아카이브된 휴면 규칙 (작업 트리거 시 해당 문서 참조)

> 아래는 **이미 완료된 서브시스템의 상세 규칙**이다. 매 세션 컨텍스트를 가볍게 유지하려고 CLAUDE.md에서 분리했다.
> 해당 작업을 시작할 때 **반드시 그 문서를 먼저 Read** 해서 규칙을 따른다. (정본은 각 문서 + 거기 명시된 registry/SKILL)

| 작업 트리거 | 참조 문서 |
|------------|----------|
| Portal 페이지 렌더링·Core Harness·Button/Dark Border 토큰 편집 | `.claude/docs/portal-harness-rules.md` (MVP2/MVP3) |
| Source Guard (외부 서비스 토큰 검수/수정/CI) | `.claude/docs/source-guard-rules.md` (MVP3.5~3.8) |
| Input·Search·Password·Unit·DatePicker 컴포넌트 편집 | `.claude/docs/input-component-rules.md` (MVP4.x) |
| Figma Variable 매핑·Token Sync 플러그인·Legacy 토큰 감사 | `.claude/docs/token-mapping-sync-rules.md` (MVP-T1/T2/L1) |

> MVP0 Registry 운영 기준(바로 위)은 활성 참조라 본문 유지. 토큰 열거 규칙 정본=`registry/governance/audit-rules.json`, 워크플로우 상세 정본=각 `.claude/skills/*/SKILL.md`.

# 🔎 Figma MCP 읽기 규칙 (단계적 탐색 — 2026-06-17 확정)

> Figma MCP로 원본을 읽을 때의 **공통 탐색 절차**다. 큰 영역을 한 번에 `get_design_context`로 호출하면 응답이 잘리므로, **항상 메타데이터로 먼저 좁히고 → 사용자가 고른 노드만 깊이 들어간다.** 아래 5단계 워크플로우의 1·2단계(재고조사·수치추출)에 선행하는 읽기 규율이며, 추측 금지(§🤖 공통 규칙 허브)의 실행 절차다.

## 진입 분기 — 무엇이 선택돼 있는가

| 상황 | 진입 절차 |
|------|----------|
| **단일 컴포넌트 등 작은 선택** | 1단계 생략 가능 — 바로 `get_design_context` + `get_variable_defs` 호출 |
| **화면·프레임 등 큰 선택** | **A. 선택 영역 탐색** 절차 |
| **선택 없이 페이지만 보는 중** | **B. 페이지 리스트업** 절차 |

## A. 선택 영역 탐색 (큰 프레임/화면)

1. 현재 선택 영역에 **`get_metadata`** 를 호출한다 (절대 `get_design_context`를 먼저 호출하지 않는다 — 응답 잘림 방지).
2. 구성 노드를 아래 표로 정리해 보여준다:
   ```
   | 번호 | 노드 ID | 이름 | 타입 |
   ```
3. 표 아래에 **"어떤 노드부터 작업할까요?"** 라고 묻고, 사용자가 번호나 이름으로 고를 때까지 **반드시 대기**한다.
4. 사용자가 고르기 전에는 `get_design_context`를 호출하지 않는다.
5. 고른 노드에만 **`get_design_context` + `get_variable_defs`** 를 호출해 코드와 토큰을 가져온다.

## B. 페이지 리스트업 (선택 없이 페이지 전체가 대상)

1. **`get_metadata`** 를 호출한다. 결과가 토큰 한도를 넘겨 **파일로 저장되면 에러로 보지 말고 다음으로 진행**한다.
2. 저장된 파일에서 페이지의 **직계 자식(top-level, 1depth) 노드만** 추출한다. 하위 노드는 펼치지 않는다. (python/jq로 `id`·`name`·`type` 파싱)
3. 아래 표로 정리해 보여준다:
   ```
   | 번호 | 노드 ID | 이름 | 타입 |
   ```
4. **"어떤 노드를 열어볼까요?"** 라고 묻고, 사용자가 번호로 고를 때까지 **대기**한다.
5. 고른 노드에만 `get_metadata`(하위 구조) 또는 `get_design_context`를 다시 호출해 더 깊이 들어간다.

> **공통 원칙:** ①한 번에 한 깊이만 펼친다 ②표로 보여주고 사용자 선택을 기다린다 ③선택 전 `get_design_context` 금지 ④큰 응답이 파일로 저장돼도 정상 흐름으로 처리한다.

---

# 🪜 Figma → 코드 5단계 워크플로우

> **정본은 `figma-to-code` 스킬**(`.claude/skills/figma-to-code/SKILL.md`) — "Figma {URL/nodeId} 구현/변환해줘" 요청 시 발동. 5단계(재고조사→수치추출→구현→자가대조→다크모드)·검문소(STOP)·**만드는 자≠검증하는 자**(구현=guide-builder / 4단계 대조=component-verifier)·절대규칙(추측 금지·아이콘 원본 강제·막히면 보고·목록 책임) 전문은 스킬에 있다. 아래는 본문에 남길 **교차 규칙**만.

> **6 Gate와의 관계(층위 분리):** 5단계는 작업 **진행 중** 사전 검문소, 6 Gate(`npm run gate:check`)는 완료 **직전** 사후 검문 — 층위가 달라 충돌하지 않는다. 5단계 완료 후 6 Gate(특히 Gate 1 Registry·Gate 5 UI)를 실행하고 Orchestrator Summary에 함께 보고한다. Harness Audit(`npm run harness:audit`)은 Gate 5 사후 검문이자 figma-to-code 4단계 component-verifier의 대조 도구로도 쓰인다.

---

# 🎛️ Main Orchestrator & Gate Check 구조 (2026-05-20 확정)

## Main Orchestrator 역할 (2026-06-17 개정 — 고도/자율성)

Claude는 **Main Orchestrator**다. 사용자는 **목표 수준 의도**만 준다 — 메커니즘(px·줄바꿈·토큰 배선·Figma 실측값 등)을 직접 지시하거나 줄 단위로 검수하지 않는다. 사소한 것까지 사용자가 신경 쓰는 상황은 **증상**이며, 그 책임은 오케스트레이터(나)에게 있다.

**작동 모델 — "계획 1회 확인 후 자율 실행" (사용자 결정 2026-06-17):**

1. **계획 1회 확인 (plan-gate):** 목표 수준 요청은 착수 전 **"이렇게 할게요"**(핵심 수치·구조·영향 범위 요약, + 진짜 결정/애매 (c)케이스가 있으면 모아서 질문)를 **한 번** 제시하고 OK를 받는다. → `ExitPlanMode` 또는 간결한 계획+확인.
2. **OK 후 자율 실행:** 모든 **메커니즘 결정**은 내가 Figma/정본 기준으로 정한다. 중간 디테일(px·줄바꿈·토큰·실측값)은 **사용자에게 올리지 않는다.**
3. **검증은 내가** (사용자가 QA 아님): 검사기(🔎) + **사각지대**(시각=렌더 확인, 구조·원본충실성=🤖 `component-verifier` 실제 spawn). 사소한 실수가 사용자에게 새기 전에 잡는다. (§⚖️ 운영 원칙)
4. **검수는 결과로:** 완료 보고 = **렌더 스크린샷 + Orchestrator Summary**. 사용자는 줄 단위가 아닌 결과를 글랜스로 본다.
5. **올라오는 건 진짜 결정만** — 주관적 제품 선택·애매 케이스. 모아서, 드물게, "결정해주세요" 형태로. 메커니즘은 절대 안 올린다.

**예외(plan-gate 생략, 즉시 실행):** 사용자가 이미 정밀 지시를 한 경우(=이미 계획됨)·오타/카피 같은 사소 작업·대화형 질문. (§🤖 공통 규칙 5 "파일 편집 즉시 진행"은 이 경우에 적용. 목표 수준 요청만 plan-gate 대상.)

**작업 모양별 하이브리드 (누가 실행하나):** 작은·순차·강결합 → ⭐ 내가 직접 / 무거운 탐색·병렬·광범위 → 🤖 작업 에이전트 위임(내 컨텍스트 보존) / 위험한 것의 검증 → 🤖 원본대조 검증 에이전트 분리.

- 모든 Gate 체크는 내부적으로 수행하고 결과를 Orchestrator Summary에 포함한다
- 완료 보고는 반드시 **Orchestrator Summary** 형식을 사용한다

## 🎭 Actor 출처 표식 (이모지·이름) — 요약

> 상세 이름표·표시 규칙 전문은 **`.claude/docs/actors-reference.md`** 참조. 아래는 카테고리 요약.

| 이모지 | 카테고리 | 실체 |
|--------|---------|------|
| ⭐ | 총괄 에이전트(나) | 메인 루프 — 계획·구현·조율 |
| 🤖 | 작업 에이전트 | 서브에이전트(LLM 판단/창작) — **실제 Task spawn 시만** |
| 🔎 | 검사기 | `scripts/*.js` 결정론적 자동 검사(기계) |
| 🚧 / 🔄 | 훅(자동 발동) | 🚧 커밋 검문소 · 🔄 토큰편집 동기화기 |

**핵심 규칙:** 이모지=카테고리, 이름=대상+역할. **내가 직접 한 일=⭐, 실제 spawn한 작업 에이전트만 🤖**(자기 일에 🤖 붙이면 거짓). 보고가 전부 ⭐면 혼자 self-certify, 🤖/렌더샷 보이면 독립 검증 실제 실행됨. 개별 에이전트/검사기(Gate 번호 포함) 상세 이름표는 참조 문서에 있다. **§⚖️ 운영 원칙(self-certify 금지 조건·하드룰 5개)은 아래 본문에 그대로 유지**한다.

### ⚖️ 운영 원칙 — 정확도를 위한 실제 검증 분리 (self-certify 금지 조건)

> **판단 기준은 작업의 "크기"가 아니라 "게이트가 그 실패를 실제로 커버하는가"다.** (2026-06-17 보정 — 가벼운 작업에서도 시각·구조 미스가 전 게이트를 통과해버린 사례 반복: TimePicker 세트 구조 미스(사용자가 잡음)·12h 오전/오후 글자 세로쪼개짐(렌더 확인서 잡음) — 둘 다 게이트·harness ✅인데 틀렸음.)

검사기(🔎)·훅(🚧🔄)은 **기계적 실패만** 결정론적으로 잡는다. 아래 3가지는 **사각지대**라 작아도 별도 검증한다:

| 실패 유형 | 검사기 | 작아도 해야 할 검증 |
|---|---|---|
| 토큰 누락·HEX·정합성·키 | ✅ 잡음 | 검사기로 충분 |
| **시각 깨짐** (렌더·레이아웃·줄바꿈) | ❌ 못 잡음 | **HTML/CSS 변경 시 실제 렌더 확인 의무** (headless Chrome 스크린샷 / Figma get_screenshot 대조) |
| **구조·의미 오류** (원본 충실성·"이렇게 만드는 게 맞나") | ❌ 못 잡음 | 무거우면 **🤖 원본대조 검증 에이전트(`component-verifier`) 실제 spawn** 적대적 대조. Figma 읽기 핵심이면 **🤖 Figma원본 조사 에이전트(`figma-inspector`)** 분리 |
| **폰트 정체성** (use_figma 캔버스 텍스트 — Noto 잔존 등) | ❌ 못 잡음(캔버스는 파일 아님) | **데이터 스캔 필수·렌더 판정 금지**(MCP 렌더는 Pretendard 미설치라 Noto/Pretendard 구분 불가). `figma-font-scan.md`로 전 TEXT 노드 fontName 스캔→비-Pretendard 0건 확인. 예방=PreToolUse 폰트 훅, 집행=component-verifier. 정본 `registry/governance/figma-font-policy.json` |
| **정본 오독** (⭐가 소스 훑고 짐작 — 소스 순서를 렌더 배치로 단정 등) | ❌ 못 잡음(사람/기계 게이트 밖) | **읽기를 📖 `source-reader` 에 위임**(아래 하드룰). ⭐ 자기 훑기로 레이아웃/구조/값 단정 금지 |

규칙:
- **UI/HTML/CSS를 건드렸으면 크기 불문 렌더 1회 확인.** "검사기·div개수 통과"로 시각 검증을 대체하지 않는다. (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=… "file://…#섹션"` → 스크린샷 Read 로 육안 대조)
- **구조 변경·Figma→코드·역방향 생성기 수정**은 self-certify하지 않고 검증 분리(🤖).
- 🚫 **하드룰 — Figma 라이브러리 컴포넌트/변형세트 빌드·편집은 ⭐ 단독 빌드+검증 금지.** 신규 컴포넌트 생성·combineAsVariants 변형세트화·토큰 바인딩·variant 패킹 등 **구조 변경**은 ⭐가 직접 use_figma로 빌드하지 않고 **`figma-library-build` 스킬**로 진입한다: 빌드=🏗️ `figma-library-builder`(실제 spawn), 검증=🤖 `component-verifier`(실제 spawn, 빌더와 분리). ⭐는 흐름(계획·검문소·종합)만 관리한다. **예외:** 단일 노드 좌표/이름 1건 같은 순수 기계적 미세 편집은 ⭐ 직접+렌더 1회로 갈음 가능. (근거: ⭐ 단독 인라인 빌드+자가검증이 패킹 붕괴·정렬·세트화 누락을 사용자에게 새게 한 반복 실패. 빌드자≠검증자 + 위임 강제로 구조 차단.)
- 🚫 **하드룰 — `use_figma`로 Figma에 그리는 모든 노드의 색은 Variable 바인딩 필수, 하드코딩 hex 금지(2026-06-22 신설).** fill·stroke·텍스트 색은 `figma.variables.getVariableById(ID)` + `setBoundVariableForPaint`로 바인딩한다. **용도(라이브러리 컴포넌트/검토 프레임/스펙 프레임/레이아웃 프레임) 불문 동일 적용** — 검토용 프레임도 결국 라이브러리화되므로 처음부터 바인딩한다(사용자 결정 2026-06-22). 정본에 해당 토큰이 없으면 임의 hex로 채우지 말고 **신규 Variable을 먼저 생성(Foundation alias)** 후 바인딩하거나, 없으면 needs-decision으로 보고한다. **예외:** 검토 프레임의 회색 배경·열 라벨 같은 **순수 장식 크롬(컴포넌트 부품이 아닌 것)만** 줄 끝 `// figma-hex-allow: <사유>` 마커로 허용. 컴포넌트 부품(셀·타일·아이콘·버튼 등)의 색은 마커로 우회 금지. **집행:** PreToolUse 훅(`scripts/figma-code-hex-check.js`)이 use_figma 코드를 실행 직전 스캔해 hex면 exit 2로 차단. (근거: Gate 3·12·pre-commit이 전부 "파일"만 검사해 use_figma의 직접 쓰기는 사각지대였고, "검토 프레임이니 라이브러리 빌드 아님" 자기분류로 스킬/에이전트 경로마저 건너뛰어 Calendar Cell/Tile 검토 프레임이 hex로 2회 유출. 도구 호출 자체를 가로채 기계 차단.)
- 🚫 **하드룰 — `use_figma`로 author/override 하는 캔버스 텍스트의 폰트는 정본(Pretendard) 필수, Noto 잔존 금지(2026-06-24 신설).** Pretendard 가 MCP 에서 로드 불가라 글자 입력 시 Noto 를 일시로 써야 하면, **입력 후 반드시 `setTextStyleIdAsync`로 정본 텍스트 스타일을 재바인딩**해 최종 폰트를 Pretendard 로 되돌린다(폰트 로드 불필요·검증됨). 원본 컴포넌트 라벨이 raw 폰트면 동일 metric 텍스트 스타일을 `weightStyleMap`(예: Medium14→body/14M)으로 바인딩, 없으면 needs-decision. **검증은 렌더 금지·데이터 스캔 필수**(MCP 렌더는 Pretendard 미설치라 Noto/Pretendard 구분 불가 — 노드 `fontName`/`textStyleId`만 신뢰). **집행 3층:** L1 예방=PreToolUse 폰트 훅(`scripts/figma-code-font-check.js`, 비-Pretendard family 는 줄 끝 `// figma-font-temp:` 마커 필수), L2 탐지=`figma-font-scan.md`(전 TEXT 노드 스캔, 비-Pretendard 0건), L3 집행=`component-verifier`(§(C)/(B) 필수 항목, 비-Pretendard 1건=❌(a)). 정본 `registry/governance/figma-font-policy.json`. (근거: datepicker 재구성 시 탭·버튼 라벨을 Noto 로 덮어쓰고 텍스트 스타일 재바인딩을 빠뜨려 3개 라벨이 Noto 로 박힘 — 폰트는 캔버스 노드라 파일 게이트 전부 사각지대, 사용자가 Desktop 에서 발견. hex 와 동일 계열을 3층으로 차단.)
- 🚫 **하드룰 — 설치기 생성기 코드(`build-components.ts`) 구조 변경은 ⭐ 단독 자가검증 금지(2026-06-19 신설).** 새 build 함수·`combineAsVariants`·variant 스펙·셀↔스펙시트 키 같은 **구조 변경**은 build-components.ts 가 곧 Figma 라이브러리 컴포넌트 빌드라 위 하드룰과 동급이다. **빌드는 ⭐(강결합 잔손질) 또는 코드 에이전트가 해도, 검증은 반드시 🤖 `component-verifier`(D) 실제 spawn**으로 분리한다. 검증 후 `node scripts/installer-build-verify-check.js --record --by component-verifier …` 로 기록 → **Gate 13 이 해시로 집행**(검증 기록 없는/stale 한 build-components.ts 는 커밋 차단). **예외:** 순수 기계적 수정(토큰 값 1건·오타)은 `--by orchestrator --change mechanical` 자가인증 가능(git 가시·감사). (근거: 설치기 9개 이슈가 9줄 전부 ⭐ → 독립 검증 부재로 Input 스펙 빈칸 버그가 토큰 게이트 전부 ✅인 채 유출 직전. 검증 분리를 기계 강제로 전환.)
- 🚫 **하드룰 — 정본 '읽기'도 ⭐ 단독 훑기+짐작 금지(2026-07-06 신설).** 판단(규칙 작성·계획·비교)에 필요한 **정본 사실**(레이아웃/표출 구조·값·이름)은 ⭐가 소스를 직접 대충 훑어 단정하지 않고 **읽기 전용 📖 `source-reader` 에이전트에 위임**한다. 그 에이전트는 ①소스 순서를 렌더 배치로 추측 금지 ②레이아웃/표출 주장은 **실제 렌더(헤드리스 스크린샷) 또는 CSS+JS 전체 추적**으로 확인하고 **확인 방법을 명시** ③`파일:줄` 인용 ④모르면 `미확인`(짐작 금지). ⭐는 그 검증된 사실 위에서만 행동한다. **예외:** 단일 값·이름 1건 조회 같은 순수 기계적 확인, 또는 방금 자기가 편집해 상태가 확실한 파일은 ⭐ 직접 가능. (근거: ⭐가 components-new Button 표출을 JS 재배치·CSS·렌더 미확인·**소스 순서만 보고** "Action이 상태 옆 열"이라 단정→실제는 별도 상단 스트립. 소스≠렌더인데 자기 훑기로 단정하는 반복 실패를, "만드는 자≠검증하는 자" 원칙을 '읽는 자'로 확장해 구조 차단. figma-inspector=Figma 원본 / component-verifier=구현 정확성 / **source-reader=저장소 정본 사실**로 3분.)
- **순수 기계적 수정**(토큰 값 1건·오타·문서 카피)은 검사기로 충분 — 렌더/에이전트 생략 가능.
- **검증 안 한 부분은 보고에 ⭐ 자가인증으로 명시**한다(사용자가 어디를 의심할지 보이게).
- 이렇게 하면 이모지가 **"독립 검증이 실제로 돌았는지"를 사용자가 한눈에 확인하는 대시보드**가 된다. 전부 ⭐면 = 혼자 self-certify, 🤖/렌더샷이 보이면 = 사각지대까지 검증됨.

## Gate 정의 · 실행 순서 — 요약

> **상세 정의·실행 순서 전문은 `.claude/docs/gates-reference.md` 참조.** 강제는 `npm run gate:check`가 수행한다(Claude가 정의문을 외워 지키는 게 아님). 아래는 무슨 Gate가 있는지 한눈표.

| # | 이름 | 무엇을 지키나 |
|---|------|------|
| 1 | Registry | registry JSON 구조·Semantic 경유·네이밍·필드 |
| 2 | Figma | 등록 figmaNodeId/componentKey 유효성(MCP, 실패=SKIP) |
| 3 | Quality | Foundation 외 raw HEX 금지·rgba 예외만·install-prompt 존재 |
| 4 | Report | reports 색인 커버리지 |
| 5 | UI + Harness Audit | 페이지 Nav 등록·인라인 HEX 금지·사이즈 분기·다크 비교·아이콘 색 |
| 6 | Installer Coverage | 설치기 토큰 커버리지 |
| 6b | Installer Build Freshness | 커밋 zip 이 최신 빌드인지 |
| 7 | Token Sync Monitor | 전 표면 토큰 '값' 일치(정본=vars-data) |
| 8 | Component Key Coverage | 빌더 동적 조합 키가 정본에 다 있나 |
| 9 | Number/Sizing Page | number 토큰 페이지 일치·폐지 사이징 재유입 0 |
| 10 | Doc Token Ref Drift | 옛 토큰명 잔재·폐기 토큰 재유입·유령행 차단 |
| 11 | Component Anatomy | 상태별 필수/금지 하위 요소(caret·clear 등) |
| 12 | Icon Instance Policy | 아이콘=라이브러리 인스턴스 강제(벡터=allow 마커) |
| 13 | Installer Build Verification | build-components.ts 독립 검증(해시)·⭐ 단독 자가검증 차단 |
| 14 | Verified Content | 검증 고정 문구(법인·약관·브랜드) verbatim·날조 차단 |
| 15 | Token Naming | 토큰 이름 규칙(bg·brand-in-semantic 금지·kebab) |
| 16 | Component Origin | Ⓑ(원본틀 필요)인데 완료+원본대조 0 차단·미분류 차단 |
| 17 | Orphan Token | 안 쓰이는 semantic color 토큰 결정론 검사 |
| 18 | Component Page Coverage | 설치기 컴포넌트 ↔ HTML 페이지 대조 |
| 19 | Variant/State Coverage | 섹션이 설치기 State 다 보여주나(미계측 정직 보고) |
| 20 | Registry Token Drift | 비정본 registry 의 stale 토큰 언급 추적(legacy-skip) |
| 21 | Registry Active/Legacy | 은퇴 파일이 index active 로 남는 좀비 등록 차단 |
| 22 | Page Layout Policy | 페이지 공통 틀·폭 정책(wide/readable) 준수 |
| 23 | Component Presentation | PC 컴포넌트 표출 규칙(실제 렌더 DOM 대조) |

스크립트 일괄 실행: `npm run gate:check` (Gate 1~23 자동). 개별 게이트 트리거·판정 로직·도입 사유·`npm run` 단독 실행 명령은 참조 문서에 전문 수록.

## ⚙️ 강제 계층 — Hooks (2026-06-11 신설)

> **핵심:** Gate·서브에이전트는 *자동이 아니다*. Gate는 사람이 `npm run gate:check`를 칠 때만, 에이전트는 호출돼야만 돈다. **진짜 자동·강제는 hook만 가능하다.** 토큰 값 드리프트가 과거에 방치된 근본 원인 = 자동 트리거 부재.

| 훅 | 위치 | 발동 | 동작 | 강제력 |
|----|------|------|------|--------|
| **PreToolUse** (차단) | `~/.claude/settings.json` (전역 — 이 컴퓨터의 모든 프로젝트에 적용) → `scripts/figma-code-hex-check.js` | `use_figma` 호출 직전 | code 안 하드코딩 hex(`#RRGGBB`/`#RGB`) 탐지. 있으면 exit 2로 **도구 실행 차단**(Figma 노드 색=Variable 바인딩 강제). 순수 장식 크롬만 `// figma-hex-allow: 사유` 예외 | 물리 차단 |
| **PreToolUse** (차단) | `~/.claude/settings.json` (전역 — 이 컴퓨터의 모든 프로젝트에 적용) → `scripts/figma-code-font-check.js` | `use_figma` 호출 직전 | code 안 비-Pretendard 폰트(`fontName`/`loadFontAsync` family) 탐지. 있으면 exit 2로 **차단**(캔버스 텍스트=Pretendard 정본 강제). 일시 Noto 는 줄 끝 `// figma-font-temp: <재바인딩 계획>` 마커 필수(인지 강제, 최종 검증은 L2 figma-font-scan). 정본 `registry/governance/figma-font-policy.json` | 물리 차단 |
| **pre-commit** (차단) | `.git/hooks/pre-commit` (정본: `scripts/hooks/pre-commit`) | `git commit` 시 | `npm run gate:check` 실행, error면 **커밋 차단**(exit 1) | 물리 차단 |

- **재설치:** git 훅은 커밋되지 않지만, **package.json `prepare` 스크립트가 `npm install` 시 자동 설치**하므로 보통 수동 입력 불필요. (수동 강제: `bash scripts/hooks/install-git-hooks.sh`. git 없는 환경에선 조용히 통과.)
- **우회:** `git commit --no-verify` (비권장 — 드리프트가 저장소에 유입됨).
- **검증 완료:** vars-data 값을 일부러 어긋나게 하면 pre-commit이 exit 1로 커밋을 막는 것을 확인(2026-06-11).
- **책임 분리 최종형:** 전파=token-sync 에이전트(작업자) · 판정=Gate 7(검사기) · **강제=hooks(집행자, commit 시점 — 편집 즉시 아님)**. 세 층이 모두 있어야 "성실성 의존"이 "기계 강제"가 된다.

## 🧹 컨텍스트 비대화 자가 점검 (완료 보고 시 · 2026-07-07 신설)

> river님은 UX가이드 데이터화를 **지속 진행**하므로 토큰 효율이 중요하다([[claudemd-token-efficiency]]). 매 완료 보고 직전, 아래를 **스스로** 점검하고 하나라도 걸리면 Orchestrator Summary에 **`🧹 정리 권장`** 한 줄을 붙인다(권장만 — 강제 아님, 실행은 사용자 확인 후).

- **CLAUDE.md 크기** — `wc -c CLAUDE.md` 가 **85,000 byte 초과**면 권장(현재 기준선 ~70k). 초과분이 참조성이면 `.claude/docs/`·정본 파일 포인터로 뺄 후보를 1줄로 제시.
- **이번 세션에 규칙/이력을 3개 이상 본문에 추가**했으면 권장 — 참조로 뺄 수 있는지 분류(항상 필요 / 가끔 참조 / 기계 강제).
- **내가 편집한 문서가 눈에 띄게 커졌으면**(예: 한 파일에 큰 블록 추가) 권장.
- 정리 실행 시 항상: git 스냅샷 → byte 보존 검증 → gate:check → 하드룰 개수 불변 확인(오늘 절차).

## Orchestrator Summary (완료 보고 형식)

작업 완료 시 반드시 아래 형식으로 보고한다. 섹션은 해당 항목이 있을 때만 포함한다.

```
## Orchestrator Summary — {작업명}

### 변경 내용
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| ⭐ | path/to/file | 내가 직접 한 변경 |
| 🤖 | (검증) | 원본대조 검증 에이전트를 spawn한 경우만 |

> 주체 열 = §🎭 Actor 출처 표식 이모지. 내가 직접=⭐, 실제 spawn한 작업 에이전트만 🤖. (없으면 열 생략 가능하나, 무거운 작업은 🤖/렌더샷이 보여야 정상)

### 검사기 결과 (🔎 검사기 / 🚧🔄 훅)
| 검사기 | 결과 | 비고 |
|------|------|------|
| 🔎 부품명세 검사기 | ✅ PASS | |
| 🔎 색상규칙 검사기 | ✅ PASS | |
| 🔎 토큰값일치 검사기 | ✅ PASS | |
| 🤖🔎 컴포넌트표출 검사기 | ✅ 13 pass | harness |
| 🚧 커밋 검문소 | ✅ 통과 | 커밋 시 |

### 미결 사항 (Human Decision 필요)
- HD-X: {무엇에 대한 결정인지 — 쉬운 말로} · 왜 결정이 필요한지 · 선택지(있으면 A/B) · 안 정하면 어떻게 되는지(현재 기본값)

> **HD 작성 규칙 (2026-06-20 — 사용자는 비개발자 UX 디자이너):** HD 항목은 `HD: State=default_button` 처럼 **코드 약어·노드ID만 던지지 않는다.** 사용자가 "무슨 항목인지" 한 줄로 이해되게 **①평이한 이름(무엇) ②왜 결정이 필요한지 ③선택지 ④안 정할 때의 현재 동작**을 풀어쓴다. 노드ID·variant명 같은 기계식별자는 괄호 보조로만.
> - ❌ 나쁜 예: `HD: State=default_button (540:4217)`
> - ✅ 좋은 예: `HD: 달력에 '확인 버튼이 붙은 형태'를 추가할까요? — 날짜를 고르고 확인을 눌러야 적용되는 모달용 변형입니다. (A) 추가 / (B) 지금처럼 날짜 클릭 즉시 적용만 유지. 안 정하면 현재대로 '즉시 적용' 형태만 만듭니다. (Figma 원본 540:4217)`
> 이 규칙은 §🎭 "쉽게 설명하기"(전문용어 없이 결과 중심)의 보고서 적용판이다. HD뿐 아니라 사용자에게 **결정/확인을 요청하는 모든 질문**(AskUserQuestion 포함)에 동일 적용.

### 🔁 자동화 승격 후보 (반복 3회 도달 시만 표시)
| 패턴 | 횟수 | 추천 규칙 |
|------|------|---------|
| {label} | {count}회 | {automationNote} |

### 다음 단계
- {다음 작업}
```

> **승격 후보 섹션은 count ≥ 3인 패턴이 있을 때만 포함한다. 없으면 섹션 전체 생략.**

## 반복 요청 추적 규칙 (Repeated Request Tracker)

**파일:** `reports/repeated-requests.json`
**승격 기준:** 동일 패턴 3회 이상 → Orchestrator Summary에 승격 후보 보고

### 추적 방법

작업을 완료할 때마다:
1. 사용자의 요청이 `reports/repeated-requests.json`의 기존 패턴과 유사한지 확인
2. 유사한 패턴이 있으면 `count` +1, `occurrences`에 기록
3. 없으면 새 항목으로 추가 (`count: 1`, `promotionStatus: "tracking"`)
4. **count가 3에 도달하면** Orchestrator Summary에 아래 형식으로 보고

### 승격 후보 보고 형식 (Orchestrator Summary에 포함)

```
### 🔁 자동화 승격 후보
| 패턴 ID | 반복 횟수 | 내용 | 추천 규칙 |
|---------|---------|------|---------|
| {id} | {count}회 | {label} | {automationNote} |
```

### 현재 패턴 상태

| 패턴 ID | 횟수 | 상태 | 설명 |
|--------|------|------|------|
| `harness-layout-fix` | 3회 | ✅ promoted | harness-audit RULE-1b 커버 |
| `size-split-missing` | 3회 | ✅ promoted | harness-audit RULE-1 커버 |
| `harnessStatus-not-updated` | 2회 | 🟡 candidate | Gate 1에 추가 검토 필요 |
| `code-tab-order` | 2회 | 🟡 candidate | harness-audit RULE-4 후보 |
| `dropdown-gap-inconsistency` | 2회 | 🟡 candidate | harness-audit RULE 추가 가능 |

> 상세 이력: `reports/repeated-requests.json`

## 금지 행동

- Gate 실패(error)를 숨기고 완료 보고하는 것
- 사용자 승인 없이 gate-check.js를 수정해 체크 항목을 약화하는 것
- Orchestrator Summary 없이 작업 완료를 선언하는 것
- Figma Gate SKIP을 FAIL로 잘못 기록하는 것
- 반복 요청 패턴을 발견하고도 `repeated-requests.json`에 기록하지 않는 것

## ACCESS-01: Figma Plugin 재등록 절차

> `npm run figma:usage:check` stale nodeId 경고 3건 지속 시의 **플러그인 재등록 복구 절차**(단계별 매뉴얼 + 해소된 노드 목록) 전문은 **`.claude/docs/ops-procedures.md`** 참조. 해당 경고가 실제 발생할 때만 연다.

## 대시보드 업데이트
내가 "대시보드 업데이트" (또는 "대시보드 갱신")라고 말하면 다음을 실행한다:
1. 프로젝트 루트에서 `node pipeline-status.js --check --skip gate:check,components:presentation --out pages/pipeline-status.html` 를 실행한다.
2. 끝나면 pages/pipeline-status.html 을 연다.
3. 콘솔 출력에서 "사각지대", "드리프트", "표면 무관 검사 실패" 줄을 요약해 알려준다.
주의: 이 명령은 pipeline-status.html 하나만 새로 쓰고, 다른 파일은 수정하지 않는다. pipeline-status.js 가 루트에 없으면 먼저 위치를 찾아 실행한다.
