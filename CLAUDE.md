# ASC - AI Context Document (Design System Harness)

> 이 문서는 Claude가 디자인 시스템을 **수집, 정리, 구조화, 검증**하기 위한 기준입니다.
> 현재 목표는 UI 구현이 아니라 **디자인 시스템을 구축하는 것**입니다.
> 마지막 업데이트: 2026-06-06 (규칙 체계 정리: 두 갈래 분류 원리 상위화·rgba EX02/EX06·R12/R13 폐지·hover 레거시 누락 처리·공통 규칙 허브 신설·중복 정본화(audit-rules.json/CLAUDE.md)·README 요약+링크.)

---

## 하네스: Design System

**목표:** 토큰 검증·HTML 가이드 생성·Figma 동기화·리뷰 관리를 자동화한다.

**트리거:** 토큰 검증, 가이드 페이지 업데이트, Figma 동기화, MD 리뷰 등록 작업 요청 시 `design-system` 스킬을 사용하라. **Figma 컴포넌트를 코드로 옮기는 작업**("Figma ~ 구현/변환/만들어줘")은 `figma-to-code` 스킬을 사용하라. 단순 질문과 직접 편집은 스킬 없이 직접 응답 가능.

**에이전트:** `.claude/agents/` — token-validator · guide-builder · figma-inspector · component-verifier · token-sync

**토큰 값 전파:** 사용자가 **토큰 "값"을 바꾸면**(예: "control-bg-disabled를 gray/100으로", "이 토큰 값 일괄 반영해줘") `token-sync` 에이전트가 연관된 모든 표면(tokens.css·vars-data.ts·install-prompt·semantic 문서·설치기 zip)에 누락 없이 전파한다. 표면 위치는 `npm run tokens:locate -- <token>`으로 결정론적으로 확인. 새 토큰 생성·네이밍·구조 변경은 token-sync 범위 밖(token-validator 소관).

**워크플로우 스킬:** `figma-to-code` — Figma 컴포넌트를 코드로 옮기는 5단계 검문소 워크플로우(재고조사 → 수치추출 → 구현 → 자가대조 → 다크모드). 상세: 아래 "🪜 Figma → 코드 5단계 워크플로우" 섹션.

**변경 이력 (작성 규칙):** 본 표에는 **최근 건만 한 줄**(날짜·무엇을·한 줄 사유)로 남긴다. 상세 경위는 **git commit 메시지**와 **`reports/changelog-archive.md`**(전체 보존본, 세션 미로드)에 둔다. 새 항목은 한 줄로 추가하고, 표가 길어지면 오래된 행을 아카이브로 옮긴다. (이력으로 컨텍스트가 무거워지지 않게 — 2026-06-17 정책 확정)

| 날짜 | 변경 내용 (한 줄) |
|------|------------------|
| 2026-06-17 | 🎭 Actor 출처 표식(이모지) 도입 — 🎩오케스트레이터/🛡️게이트/⚙️훅/에이전트(실제spawn시만). CLAUDE.md 범례+규칙+운영원칙(무거운 작업은 component-verifier 실제 spawn해 self-certify 금지), gate-check·harness-audit 출력에 🛡️, 훅 출력에 ⚙️, 각 agent.md 자기 이모지 |
| 2026-06-17 | TimePicker Dropdown 세트 구조 정정 — Time Picker Cell(State=Default/Hover/Selected) 컴포넌트화 후 인스턴스로 패널 조립 + 12h/24h 별도 States 스펙(시·분 Hover/Selected, 분선택=확인활성) 신설(생성기 build-components.ts+하네스 components-new). 드롭다운 width=121px(Figma 24h 최소) |
| 2026-06-17 | ds-extract 제거(중복·배치오류) — 시안 코퍼스 추출은 **별도 생태계(s1-service-intelligence 허브 + s1-moduapp-workspace 등 서비스별 워크스페이스)에 이미 존재**(ui-reader·pattern-finder·ds-mapper·pattern-librarian 에이전트+공유 카탈로그+스크린 분석). DS가이드는 빌드/출력측이라 코퍼스 분석을 둘 곳이 아님 → scripts/ds-extract·corpus-targets·skill·reports·ds:* 스크립트 제거. 시안 분석은 s1-moduapp-workspace에서 진행. (contact-sheet 시각검토 아이디어는 워크스페이스로 이관 후보) |
| 2026-06-17 | Figma MCP 읽기 규칙(단계적 탐색: 선택영역/페이지 리스트업) §🔎 신설 + 변경 이력 슬림화·아카이브 분리 |
| 2026-06-17 | Button loading 상태 완전 삭제 (레거시 보존 없이 제거) |
| 2026-06-17 | 구 components.html legacyFiles 격리(검수 제외) + 검수기 정본 components-new 재지정 |
| 2026-06-16 | site-base 를 Variables 검수에서 제외 (사이트 전용 분리) |
| 2026-06-16 | bg/surface semantic 토큰 편입 + Filter Chip 복구 + reconcile install-prompt 결정화 |
| 2026-06-16 | 레거시 격리 구조 신설(legacy-tokens.css·legacy-skip.js) + Check A 드리프트 정리 |

> 위 이전(2026-04-29 ~ 2026-06-15)의 전체 상세 이력 72건: **`reports/changelog-archive.md`** 참조.

---

# 🎯 현재 프로젝트 단계

## 완료된 단계

* ✅ Foundation Token — Primitive 색상 팔레트 (Light + Dark) 정의 완료
* ✅ Dark Primitive — `gray-dark` (0–900), `blue-dark` (50–500) 추가 완료
* ✅ Semantic Token — 8개 카테고리 Light/Dark 값 전체 정의 완료 (`tokens/semantic.md`)
* ✅ Component Token — 9개 그룹 추출 및 Semantic 참조 구조 정의 완료 (`tokens/component-tokens-extracted.md`)
* ✅ Button variants — primary / secondary / blue-line 토큰 완료 (Danger 삭제, ghost deprecated 확정)
* ✅ Button blue-line variant — tokens.css + component.tokens.json 추가 완료 (2026-05-11)
* ✅ 가이드 HTML — foundation / semantic / components / guide-md / md-review 페이지 완료
* ✅ MVP3.3 Portal IA 재편 — System 그룹 분리, Button 페이지 6탭 구조 전환 완료 (2026-05-11)
* ✅ MVP3.4 Button Figma MCP 비교 — 토큰 불일치 7건 + 이중 CSS 구조 문서화 완료 (2026-05-12)
* ✅ MVP3.4.1 Button Sync 자동화 — 37개 정합성 검사 스크립트 + GitHub Actions 일일 자동화 완료 (2026-05-12)
* ✅ MVP3.5 Source Guard MVP — 외부 서비스 프로젝트 6종 위반 탐지 + 리포트 생성 완료 (2026-05-12)
* ✅ MVP3.6 Source Guard Fix Suggestions — HEX→semantic token 역매핑 엔진 + before/after 수정 후보 + patch diff 생성 완료 (2026-05-12)
* ✅ MVP3.7 Source Guard Apply Mode — high-confidence 자동 적용 + dry-run/apply 분기 + backup + apply log 완료 (2026-05-12)
* ✅ MVP3.8 Source Guard CI Dry-run — GitHub Actions 자동 검수 파이프라인 구축 완료 (2026-05-12)
* ✅ Pre-MVP4 Input 분류 — Figma MCP 8 nodes 분석, Base Input/Slots/Pattern/Picker 분류, 토큰 Gap 17개, HD 8개 도출 (2026-05-12)
* ✅ MVP4.3-A DatePicker Component Candidate — 별도 컴포넌트 후보 등록, Figma node 6443:4655 시도, Interactive preview 구현 완료 (2026-05-12)
* ✅ MVP-C1 Chip 컴포넌트 구현 — chip.json line/solid split 재작성. hover·icon·close-icon variant CSS + 매트릭스. Token Details 탭 34개 토큰 전체 문서화. harnessStatus: implemented (2026-05-19)

## 미결 사항 (다음 우선순위)

> **정리(2026-06-06):** 아래 ✅완료 항목(1·4·7·8·10·15)은 상단 **「변경 이력」 표**에 이미 반영된 **완료 이력**이다. 본 목록에서는 ✅ 스텁으로만 유지하며, **활성 미결은 2·3·5·6·9·11·12·13·14**다. (완료 항목 본문의 물리 삭제는 사용자 확인 후 일괄 진행 — 이관 후보)

```
1. Button 토큰 불일치 수정 ✅ 2026-05-12 완료
   결정 내용:
   - focus-ring 삭제: 디자인시스템 기준 없음. --button-*-focus-ring 3개 토큰 제거, .is-focus outline CSS 제거.
   - s1-btn 공식화: sw-button(button.css)은 deprecated. s1-btn(components.html)이 공식 CSS 시스템.
   - --color-border-disabled: semantic.md Light/Dark 섹션에 문서화 완료.
   이미 적용된 토큰 수정: primary-disabled-bg, blue-line-hover-border, blue-line-default-text, disabled-border 계열.

2. Figma Button nodeId 등록
   - registry/figma/figma-map.json 의 Button componentSetKey / figmaNodeId 모두 빈 문자열
   - Figma URL (node-id 포함) 제공 시 즉시 등록 가능

3. Dark Mode 버튼·컨트롤 색상 확정
   - --color-text-disabled dark 값: 현재 #35363F → #55575F 조정 검토 중
   - blue-line variant dark mode 시각 검증 미완료 (darkModeStatus: pending)
   - toggle tokens 불일치: MD는 var(--color-text-placeholder), CSS는 var(--color-border-default)

4. Chip 토큰 구조 정합 → ✅ 2026-05-19 완료
   - line/solid split 확정. chip.json·components.html 반영. hover·icon·close-icon variant 구현.

5. Semantic Token Figma 반영 (Figma 파일 직접 수정 필요)
   - 오타 수정: color/status-card/text/*--defualt → --default (3건)
   - surface/status/* → Domain Token 이동 여부 확정

6. Dark border 4 토큰 확정
   - --color-border-subtle/default/strong/emphasis dark 값 candidate 상태
   - resolved HEX 또는 foundation dark scale 참조 확정 필요 (Human decision)

7. Input 토큰 Human Decision → ✅ 2026-05-12 전체 결정 완료
   HD-1: --color-form-control-* Semantic 유지, --input-*은 Component alias
   HD-2: hover 상태 삭제 (Figma 미정의)
   HD-3: complete = 별도 bg/border 없음. default와 동일. text 차이로 구분
   HD-4: correct로 통일
   HD-5: --select-disabled-border → Select registry로 이동
   HD-6: Inputbox_large → Textarea 컴포넌트로 편입
   HD-7: Label 색상 → --color-text-primary 연결
   HD-8: --input-error-bg 불필요 (default와 동일)
   상세: reports/pre-mvp4-input-classification.md

8. MVP4 Input 구현 → ✅ 2026-05-18 토큰 레이어 완료
   - tokens/semantic.md: color-form-control-* + color-text-state-* 추가 완료
   - tokens/component-tokens-extracted.md: --input-* 2-layer 구조 반영 완료
   - assets/css/tokens.css: form-control semantic 레이어 + 정정된 --input-* 완료
   - assets/css/components/input.css: 신규 생성 완료
   - pages/components.html: 하네스 + 인라인 CSS 동기화 완료
   미완: darkModeStatus pending (--input-* dark 시각 검증 필요)
9. DatePicker component candidate Human Decisions (MVP4.3-A)
   - HD-1: Figma node 6443:4655 componentSetKey 확인 (MCP invalid — Figma 직접 확인 필요)
   - HD-2: 공식 컴포넌트명 확정 (DatePicker vs DayPicker)
   - HD-3: calendar icon Figma 노드명 확정 (현재 candidate SVG)
   - HD-4: Mobile 인터랙션 확정 (bottom sheet vs inline vs popover)
   - HD-5: DatePicker 전용 token candidate → stable 전환 여부 결정
   상세: reports/mvp4-3-a-date-picker.md
10. Textarea 컴포넌트 registry 생성 → ✅ 2026-05-20 완료
    - registry/components/textarea.json: tokenStatus→stable, harnessStatus→implemented, figmaNodeId→641:4060
    - Token Details 탭 15개 --input-* 토큰 문서화 완료 (--textarea-* 별도 불필요)
    - PC 버전 figmaNodeId 미확인 (Figma 직접 확인 필요)
11. TimePicker component candidate 정리 (figmaNodeId: 6443:4606)
12. Pattern 페이지 설계 (search-table, tree-detail)
13. Legacy 가이드 작성
14. MVP-L1 UX Guide 2.4 Variables export → npm run figma:audit 실행
    - Figma에서 실제 S1 UX 디자인가이드 2.4 파일 열기
    - SW Token Sync 플러그인 → Export Variables → Download JSON
    - registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json으로 저장
    - npm run figma:audit 실행 → reports/mvp-l1-legacy-token-audit.md 생성
15. MVP-L2 Legacy Token Classification → ✅ 2026-05-20 완료
    - 115건 전량 분류: alias-only 74·future-component-token 18·hold-missing-usage 18·기타 5건
    - hold-needs-review 15건 Figma snapshot VariableID 분석으로 전량 해소
    - hold-missing-usage 18건 (버튼 hover border x2·control hover bg·dropdown option hover border 포함) — 신규 canonical 신설 여부 Human Decision 필요
    - 상세: reports/mvp-l2-legacy-token-classification.md
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
| Visual Gray | `--color-visual-gray-{step}` | `--color-visual-gray-dark-{step}` | 50 ~ 500 |
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

1. **단일 진입점** — Components > Button (`pages/components.html`)이 Button의 유일한 사용자-facing 진입점이다.
2. **기존 문서 우선** — 기존 `components.html` + 기존 컴포넌트 가이드 내용이 우선 기준이다. registry와 충돌하면 기존 문서 기준으로 registry를 수정한다.
3. **Button Harness 메뉴 제거** — `pages/button-harness.html`은 별도 메인 메뉴로 노출하지 않는다.
4. **Registry/System 메뉴** — Component Registry, Component Tokens는 별도 사용자-facing 메뉴로 노출하지 않는다.
5. **ACTION 컬럼** — Button matrix에서 DEFAULT 앞에 ACTION 컬럼을 배치한다.
6. **ACTION = 인터랙션 전용** — ACTION 셀만 실제 클릭/disabled 테스트가 가능하다.
7. **DEFAULT = 정적 프리뷰** — DEFAULT 셀 버튼에는 `.is-preview`를 적용한다 (pointer-events: none).
8. **공식 variants** — primary / secondary / blue-line만 공식 노출. ghost는 노출 금지.
9. **Size 명칭** — PC: medium(h44) / xsmall(h34) / xxsmall(h28), Mobile: mobile(h48).
10. **Class naming** — `s1-btn` 기반 (s1-btn-lg=medium, 무수식어=xsmall, s1-btn-sm=xxsmall, s1-btn-mobile=mobile).
11. **변경 기록** — `reports/mvp3-3-button-components-integration.md`에 기록한다.

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

# 🖥️ MVP2 Portal Registry Rendering 규칙 (추가: 2026-05-11)

포털 페이지 편집 시 반드시 준수한다.

1. **registry 우선** — 하드코딩 토큰 테이블보다 registry 기반 렌더링을 우선한다.
2. **index 먼저** — `registry/index.json`을 먼저 읽고, 그 안의 경로로 각 JSON을 로드한다.
3. **HTML에 값 중복 금지** — token 값을 HTML에 다시 하드코딩하지 않는다.
4. **legacy 보존** — 교체가 검증될 때까지 기존 하드코딩 콘텐츠를 삭제하지 않는다.
5. **Vanilla JS** — 명시적 승인 없이 외부 프레임워크를 도입하지 않는다.
6. **에러 표시** — registry JSON 로드 실패 시 화면에 명확한 오류 메시지를 표시한다.
7. **호환성 유지** — Portal 렌더링은 향후 Figma Plugin, Source Guard 워크플로우와 호환 가능하게 유지한다.

## 신규 JS 모듈 역할

| 파일 | 역할 |
|------|------|
| `assets/js/registry-loader.js` | `loadJson`, `loadRegistryIndex`, `loadRegistryResource`, `loadAllComponents`, `renderError` 제공 |
| `assets/js/token-renderer.js` | `renderFoundationColors`, `renderSemanticColors`, `renderComponentTokens` 제공 |
| `assets/js/component-renderer.js` | `renderComponentList`, `renderComponentDetail`, `renderComponentStatusBadge` 제공 |
| `assets/js/registry-health.js` | `renderRegistryHealth` 제공 |

## fetch 경로 규칙

- pages/*.html에서 registry 로드: `REGISTRY_BASE = '../'` (자동 감지)
- index.html(root)에서: `REGISTRY_BASE = './'` (자동 감지)
- 경로 예: `../registry/tokens/foundation.colors.json`

---

# 🔲 MVP3 / MVP3.1 Core Component Harness 규칙 (추가: 2026-05-11)

## Core Component Harness 편집 시

1. `registry/components/index.json`을 먼저 읽는다.
2. registry 데이터가 있으면 component tab 목록을 하드코딩하지 않는다.
3. Theme과 Platform 컨트롤은 registry harness config와 일관되게 유지한다.
4. Button이 첫 번째 상세 구현 대상이다.
5. Button 외 컴포넌트는 해당 MVP 구현 단계 전까지 skeleton으로 유지한다.
6. 없는 component token을 임의로 생성하지 않는다.
7. Figma componentSetKey를 모르면 빈 문자열로 둔다.
8. Harness 변경 사항은 `reports/mvp3-core-harness-review.md`에 기록한다.

## Button 편집 시

1. `registry/tokens/component.tokens.json`을 먼저 읽는다.
2. 공식 Button component token만 사용한다.
3. raw HEX를 사용하지 않는다.
4. Foundation color primitive를 직접 참조하지 않는다.
5. 없는 Button token을 임의로 생성하지 않는다.
6. 공식 component token이 없는 variant는 pending으로 표시한다.
7. Light/Dark 지원은 semantic token remapping으로 유지한다.
8. Button 변경 후 button-harness를 업데이트한다.
9. 검토 결과는 `reports/mvp3-button-review.md`에 기록한다.

## Dark Border Token 편집 시

1. opacity-composed dark border 값을 stable로 표시하지 않는다.
2. foundation dark scale 참조 또는 resolved HEX 값을 사용한다.
3. Figma opacity composition은 source metadata로만 보존한다.
4. resolved 값이 승인되기 전까지 candidate 상태를 유지한다.
5. Product UI 컴포넌트에서 raw rgba border 값을 직접 사용하지 않는다.
6. unresolved opacity 기반 border 값은 report에 기록한다.

---

# 🛡️ MVP3.5 Source Guard Rules (추가: 2026-05-12)

## Source Guard 편집 시

1. **디자인시스템 폴더 자체를 검사 대상으로 보지 않는다.** Source Guard는 `--target`으로 전달된 외부 서비스 프로젝트를 검사한다.
2. **registry가 기준 원장이다.** Guard rules와 allowed token 목록은 항상 registry JSON에서 로드한다.
3. **실행 방법:**
   ```bash
   npm run guard -- --target ../service-project
   ```
4. **MVP3.5에서는 자동 수정하지 않는다.** 리포트 생성 후 Human 확인이 선행되어야 서비스 파일을 수정할 수 있다.
5. **리포트 위치:** `reports/source-guard-[target-name].md`
6. **exit code 기준:** error 발견 시 1, warning만이면 0, 이상 없으면 0.

## Guard 검사 항목

| 검사 | 심각도 | 규칙 |
|------|--------|------|
| Raw HEX (#color) | error | R02 |
| rgb() | error | R02 |
| rgba() | warning | EX02/EX03 예외 확인 필요 |
| Foundation color 직접 참조 | warning | R01 |
| Undefined CSS variable | error | — |
| Ghost/Danger button variant | error | R05 |
| Outline/Line button variant | warning | 혼동 가능성 |
| Inline style color | error | — |

## MVP3.8 Source Guard CI Rules

When editing Source Guard CI workflow:

1. **CI에서는 `--apply`를 사용하지 않는다.** CI는 항상 dry-run / report mode만 실행한다.
2. **`--dry-run`은 CI에서 허용된다.** 파일을 수정하지 않기 때문이다.
3. **reports는 artifact로 업로드해야 한다.** `retention-days: 30`.
4. **디자인시스템 repository가 source of truth다.** target은 `--target` 옵션으로 전달한다.
5. **외부 서비스 프로젝트가 CI 환경에 없을 경우** `scripts/guard/__fixtures__/bad-service`를 기본 target으로 사용한다.
6. **CI에서 자동으로 commit/push하지 않는다.** 리포트 생성만 수행한다.
7. **guard step이 실패(error)해도 suggest와 dry-run은 실행된다.** `if: always()` + `continue-on-error: true`로 처리한다.
8. **최종 job 실패 여부는 guard exit code를 따른다.** error가 있으면 CI 실패.

## MVP3.7 Source Guard Apply Mode Rules

When applying Source Guard fixes:

1. **외부 서비스 파일은 `--apply` 옵션이 있을 때만 수정한다.** 없으면 절대 파일을 수정하지 않는다.
2. **`--dry-run`을 먼저 실행해서 적용 예정 내용을 확인한다.**
3. **High-confidence 항목만 자동 적용한다.** Medium 이하는 needs-review로 분류한다.
4. **아래 항목은 절대 자동 적용하지 않는다:**
   - ghost / danger button variant
   - rgba() 값
   - 다의적 색상 (#FFFFFF 등 여러 semantic token이 공유하는 색상)
   - foundation color → semantic 교체 중 후보가 여러 개인 경우
   - inline style → class 구조 변경
   - 새 token 생성
5. **`--apply` 실행 시 수정 전 반드시 backup을 생성한다.** (`reports/apply-backups/`)
6. **apply log는 항상 생성한다.** (`reports/source-guard-apply-log-[target].md`)
7. **파일 치환 안전성:** before 내용이 파일에 정확히 1번 존재할 때만 적용한다. 0번이거나 2번 이상이면 skip.

## MVP3.6 Source Guard Fix Suggestion Rules

When generating Source Guard fix suggestions:

1. **디자인시스템 폴더가 source of truth다.** 외부 서비스 프로젝트는 `--target`으로 전달된다.
2. **MVP3.6에서는 외부 서비스 파일을 직접 수정하지 않는다.** 리포트와 patch 후보만 생성한다.
3. **High confidence 항목만 patch candidate에 포함한다.** 모호한 항목은 Needs Review로 분류한다.
4. **rgba는 자동 치환하지 않는다.** token-exceptions EX02/EX03 해당 여부를 Human이 확인해야 한다.
5. **ghost → secondary/blue-line 교체는 Human decision 필수다.** 자동 수정 금지.
6. **HEX 역매핑 엔진:** foundation.colors.json HEX → semantic.colors.json light value 경로로 역추적한다.
7. **Confidence 기준:**
   - `high`: semantic token 1개 exact match
   - `medium`: foundation token exact match (semantic 없음)
   - `needs-review`: 여러 semantic token이 동일 HEX를 공유
   - `needs-human`: rgba, ghost/danger variant, 구조 변경 필요
   - `unmapped`: 어떤 token도 매핑되지 않음

## Guard 추가 확장 시

- `scripts/guard/check-*.js` 패턴으로 새 검사기를 추가한다.
- 새 검사기는 `index.js`에서 import 후 `allFindings.push(...)` 형태로 연결한다.
- registry에 새 token 카테고리 추가 시 `load-registry.js`의 `knownTokens` 수집 로직을 업데이트한다.

## Input 편집 시 (HD 확정 2026-05-12)

Input 컴포넌트를 편집하거나 토큰을 정의할 때:

1. **Figma Base Input 프레임명은 `Login input`으로 잘못 등록되어 있다.** 이는 Figma 원본의 오류. 디자인시스템 canonical 명칭은 `Input`으로 확정 (2026-05-20). nodeId 6443:4408은 동일하게 유지.
2. **Figma 상태 이름 ≠ registry 상태 이름.** `selected` = `focus`, `success` = `correct`.
3. **토큰 2레이어 구조:** Semantic = `--color-form-control-*`, Component alias = `--input-*` (→ form-control 참조).
4. **`complete` 상태는 별도 bg/border 토큰 없다.** default와 동일한 시각. text 차이로만 구분.
5. **`hover` 상태 토큰 없다.** Figma 미정의, registry에서 삭제됨.
6. **`--select-disabled-border`는 Input에 없다.** Select 컴포넌트로 이동.
7. **Picker (timepicker/datepicker)는 별도 컴포넌트로 취급.** error/correct 상태 없음. MVP5 이후 구현.
8. **Inputbox_large = Textarea 컴포넌트.** Input의 variant가 아님.
9. **Label 색상 = `--color-form-control-text-label` → `var(--color-text-primary)`.**
10. **`--input-error-bg` 없다.** error bg = default bg와 동일 (white), 별도 토큰 불필요.
11. **확정 토큰 목록은 `registry/components/input.json` 참조.**

## Input Related Composed Fields Rules (MVP4.1 — 2026-05-12 확정)

Input 컴포넌트를 편집하거나 구성 필드를 추가할 때:

1. **Search Input, Password Field, Input with Unit은 Components > Input 하단에 위치한다.** 별도 Pattern 페이지로 분리하지 않는다.
2. **Basic Input 설명 최하단 `Related Composed Fields` 섹션에 배치한다.** Base Input의 state/variant 매트릭스에 추가하지 않는다.
3. **이 항목들은 Base Input 공식 상태(state)가 아니다.** `is-search`, `is-password` 등 modifier class로 처리하지 않는다.
4. **드롭다운·리스트·폼·결과 패널을 포함하는 더 큰 흐름은 Pattern/Module로 분리한다.** Search Input + Dropdown + Result List = Search Module Pattern.
5. **DatePicker, TimePicker, Textarea는 별도 Component 후보로 유지한다.** Input 섹션에 혼재하지 않는다.
6. **registry/components/input.json의 `relatedComposedFields` 배열이 기준 원장이다.**

## Input Composed Field Slot Rules (MVP4.2 — 2026-05-12 확정)

Related Composed Fields의 slot 구조를 편집할 때:

1. **Search Input은 prefixIcon 구조가 아니다.** 검색 아이콘은 `suffixActionGroup` 안에 위치한다.
2. **Search Input suffixActionGroup 순서:** `clearAction` (조건부, 왼쪽) → `searchAction` (항상, 오른쪽). clearAction은 값이 있을 때만 나타나며, searchAction의 왼쪽에 위치한다.
3. **Password Field suffixActionGroup 순서:** `visibilityToggle` (항상, 왼쪽) → `clearAction` (조건부, 오른쪽). clearAction은 값이 있을 때만 나타난다.
4. **Input with Unit은 `suffixText: unitLabel` 구조다.** 버튼이 아닌 텍스트 레이블이며 `flex-shrink: 0`.
5. **suffixActionGroup은 flex row 컨테이너다.** gap: 2px. `.s1-suffix-action-group` CSS 클래스 사용.
6. **카드 프리뷰는 단일 interactive 상태로 제공한다.** 정적 2-state(Empty/Filled, Hidden/Visible) 대신 실제 입력 가능한 interactive preview 1개를 사용한다. MVP4.2 Revision에서 전환됨.
7. **registry `slotStructure` 필드가 slot 정의의 기준 원장이다.** 기존 `slots: []` 배열 형식은 MVP4.2에서 `slotStructure` 객체로 교체됨.
8. **Related Composed Fields preview는 실제 interactive다.** 정적 is-preview가 아니라 입력 가능한 실제 input 요소를 사용한다. pointer-events:none / is-preview 클래스 사용 금지.
9. **인터랙션 JS는 `setupRelatedComposedFields()` 함수로 초기화한다.** DOMContentLoaded 직후 또는 script 말미에 `setupRelatedComposedFields(document)` 호출. `setupSearchInputField(root)` + `setupPasswordFieldInput(root)` 두 함수로 구성.
10. **Search Input / Password Field clear 버튼은 `hidden` attribute로 제어한다.** CSS `display:none`이 아닌 HTML `hidden`으로 가시성 관리. `[data-clear-action]` 셀렉터 사용.
11. **Password Field visibility toggle은 `aria-pressed` attribute를 업데이트한다.** 상태 전환 시 aria-label도 함께 변경 ("비밀번호 보기" / "비밀번호 숨기기"). `[data-icon-hidden]` / `[data-icon-visible]` data attribute로 아이콘 전환.
12. **Figma 아이콘 노드명 확인 완료 (2026-05-12).** `ic_찾기/조회` (검색, 6452:5930), `ic_비밀번호미표시` (비밀번호 숨김, 135:6692), `remove` (삭제, 882:4061). eye-off(visible) 아이콘 노드명 미확인 — candidate SVG 사용 중.
13. **`data-related-field` attribute가 각 composed field 컨테이너의 식별자다.** `data-related-field="search-input"` / `"password-field"` / `"input-with-unit"`. JS는 이 attribute로 스코프를 한정한다.

## MVP4.3-A DatePicker Rules (2026-05-12)

DatePicker를 편집하거나 토큰을 정의할 때:

1. **DatePicker는 Base Input의 state/variant가 아니다.** 별도 컴포넌트 후보로 분리한다.
2. **DatePicker는 Related Composed Field로 축소하지 않는다.** calendar panel + day grid가 있어서 별도 컴포넌트다.
3. **Trigger는 Base Input (s1-input-wrap + s1-input-field)을 재사용한다.** 별도 shell을 만들지 않는다.
4. **calendar icon은 suffixIcon (s1-input-action-btn)으로 배치한다.**
5. **panel token은 candidate 상태다.** --date-picker-panel-bg 등 신규 토큰은 임의 확정하지 않는다.
6. **Figma componentSetKey를 임의로 생성하지 않는다.** 빈 문자열로 유지하며 Figma 직접 확인 후 등록한다.
7. **Figma node 6443:4655는 MCP get_design_context 접근 불가 상태다.** invalid node 오류 발생. Figma URL 또는 Plugin 직접 접근으로 재확인 필요.
8. **인터랙션 JS는 `setupDatePicker()` 함수로 초기화한다.** components.html script 말미에 `setupDatePicker(document)` 호출.
9. **panel shadow에 한해 rgba 1회 허용한다.** `box-shadow: 0 4px 16px rgba(0,0,0,0.10)`. 이 외 HEX/rgba 직접 사용 금지.
10. **미결 사항은 reports/mvp4-3-a-date-picker.md에 기록한다.**

## MVP-T1 Token Mapping Rules (2026-05-18)

Token Mapping 파일을 편집하거나 Figma Variable을 참조할 때:

1. **Code registry remains the source of truth.** Figma Variable names and CSS token names do not need to be identical.
2. **Always map tokens by meaning, not by name alone.** Slash-separated Figma paths convert to hyphen-separated CSS vars.
3. **Keep form-control semantic tokens as common standards.** `--color-form-control-*` is the shared semantic layer for Input, Select, DatePicker, and TimePicker.
4. **Component tokens such as `--input-*` are aliases when they reference shared form-control semantics.** Direct-reference only if the component diverges from shared form-control.
5. **Map Figma `complete` to registry/code `filled`.** No separate bg or border token needed — only text changes.
6. **Map Figma `selected` (form-control context) to code `focus`.** `selected` means focused/active state, not chosen item.
7. **Use `correct` as the canonical state name (HD-4).** Figma calls it 'success' — that is a Figma alias only. `--input-correct-border` / `--input-correct-text` are canonical tokens, not deprecated. Do not rename to 'success'.
8. **Do not invent confirmed Figma Variable names without MCP evidence.** Mark uncertain mappings as `pending` or `needs-review`.
9. **Placeholder = gray/500 (#757575) 확정 (2026-05-18).** `--color-text-placeholder` = `var(--color-gray-500)`. Figma 일치. `--color-form-control-text-default` = `var(--color-text-secondary)` (#353535) 확정. tokens.css·semantic.md·input.json 수정 완료.
10. **Record mapping decisions in `reports/mvp-t1-token-mapping.md`.**
11. **Figma Variables confirmed via MCP nodes:** form-control (540:3794), button-primary (540:4501), date-picker-mobile (540:3836). Other Variables are pending.
12. **Token mapping file locations:**
    - `registry/tokens/figma-css-token-map.json` — main mapping table
    - `registry/tokens/token-aliases.json` — state and token alias definitions
    - `registry/tokens/deprecated-tokens.json` — removed/renamed tokens

## MVP-T2 Token Sync Plugin Rules (2026-05-18)

Figma Token Sync Plugin 파일을 편집하거나 플러그인 동작을 수정할 때:

1. **플러그인 진입점은 `plugins/figma-token-sync/src/code.ts`다.** Figma sandbox에서 실행. `figma.showUI(__html__)` + `figma.ui.onmessage` 패턴 사용.
2. **UI는 `src/ui.html`이다.** `parent.postMessage({ pluginMessage: {...} }, "*")`로 code.ts와 통신한다.
3. **레지스트리 JSON은 esbuild 번들 시점에 인라인된다.** 런타임에 파일 접근 없음. `require("../../../../registry/tokens/figma-css-token-map.json")` 상대경로 사용.
4. **`tsc --noEmit`는 타입 체크 전용이다.** 실제 빌드는 `esbuild`로 한다. `npm run plugin:check`(타입체크)와 `npm run plugin:build`(빌드)를 분리한다.
5. **SyncClassification 기준을 엄수한다:** stable + cssVariable + registryToken + figmaVariable 모두 있음 → `sync-ready`, pending + 비-alias → `preview-only`, needs-review → `needs-review`, component-alias 또는 deprecated → `excluded`.
6. **sync-ready 분류는 collection ID 존재 여부와 무관하다.** 분류는 token ref 완전성 기준. collection ID gate는 `syncStableTokens()`에서 별도로 처리한다.
7. **`syncStableTokens()`는 항상 throw한다.** Figma Variables collection ID 미확정 상태에서 실수로 쓰기가 실행되는 것을 방지한다.
8. **component-alias 항목은 excluded로 처리한다.** 같은 figmaVariable을 semantic 항목이 이미 대표하기 때문에 중복 쓰기를 방지한다.
9. **`manifest.json`의 `permissions`는 현재 빈 배열이다.** 실제 Figma Variables 쓰기를 활성화하려면 `"variables:write"`를 추가해야 한다. 이는 Human Decision 후에만 변경한다.
10. **플러그인 빌드 결과물은 `plugins/figma-token-sync/dist/code.js`다.** 이 파일은 gitignore 대상이다.
11. **동기화 활성화 조건 3가지 모두 충족 후에만 쓰기를 활성화한다:** (1) FIGMA_SEMANTIC_COLLECTION_ID 확정, (2) manifest permissions에 variables:write 추가, (3) Dry-run 미리보기 결과 사람이 검토·승인.
12. **플러그인 작업 결과는 `reports/mvp-t2-token-sync.md`에 기록한다.**

## MVP-T2 REST API Metadata Collector Rules (2026-05-18)

`scripts/figma/fetch-figma-variables.mjs` 및 `scripts/figma/match-figma-variable-metadata.mjs`를 편집하거나 실행할 때:

1. **PAT(`FIGMA_TOKEN`)는 환경변수로만 전달한다.** 코드·출력 JSON·리포트 어디에도 저장하지 않는다. `.env` 파일은 `.gitignore` 대상.
2. **fetch script는 Read-only다.** Figma Variables 쓰기 API를 호출하지 않는다. 출력은 `figma-variable-metadata.local.json` 하나뿐.
3. **`figma-variable-metadata.local.json`은 gitignore 대상이다.** PAT 정보가 간접 포함될 수 있으므로 커밋하지 않는다. `.gitignore`에 등록됨.
4. **fetch endpoint는 `GET /v1/files/{fileKey}/variables/local`만 사용한다.** write endpoint(`POST /v1/files/{fileKey}/variables`) 호출 금지.
5. **match script는 `figma-css-token-map.json`을 직접 수정하지 않는다.** 출력은 리포트 MD와 patch 후보 JSON뿐. 레지스트리 자동 반영 금지.
6. **`figma-variable-metadata.patch.json`은 사람이 검토 후 registry에 반영한다.** 자동 적용 금지. 파일 헤더에 "자동 적용 금지" 명시됨.
7. **matchStatus `dedup-required` 항목은 write 시 1회만 실행한다.** 여러 registry 항목이 같은 variableId를 공유하는 경우 중복 쓰기를 방지한다.
8. **`not-found` 항목은 Figma Variables 패널에서 이름을 직접 확인해야 한다.** 임의로 이름을 추측하거나 수정하지 않는다.
9. **실행 명령: `npm run figma:fetch` → `npm run figma:match`.** 순서를 지킨다. match는 local.json이 있어야 실행 가능. REST API가 막혀 있으면 Plugin Export 방식 사용.
10. **`figma-variable-metadata.sample.json`은 API 응답 구조 샘플이다.** 실제 데이터가 아님. 구조 파악 용도로만 사용. PAT 없음.
11. **match script는 `meta.source`가 `"figma-plugin-api"`와 `"figma-rest-api"` 모두 처리한다.** `meta.fileKey`(REST) 또는 `meta.fileName`(Plugin) 중 존재하는 값을 `figmaFileRef`로 사용.

## MVP-T2 Plugin Read Metadata Export Rules (2026-05-18)

Figma Plugin의 Export Variables 기능을 편집하거나 실행할 때:

1. **플러그인 manifest에 `"variables:read"`만 추가한다.** `"variables:write"`는 추가하지 않는다.
2. **`figma.variables.getLocalVariablesAsync()`와 `figma.variables.getLocalVariableCollectionsAsync()`만 사용한다.** write 계열 API(`figma.variables.setVariableValue`, `figma.variables.createVariable` 등) 호출 금지.
3. **Export 결과는 `meta.source: "figma-plugin-api"`, `meta.writeEnabled: false`로 마킹된다.** 이 필드는 변경하지 않는다.
4. **Export 결과 JSON은 `registry/figma/figma-variable-metadata.local.json`에 저장한다.** 파일이 gitignore 대상이므로 커밋하지 않는다.
5. **Download 파일명은 `figma-variable-metadata.local.json`으로 고정한다.** 사용자가 올바른 경로에 저장할 수 있게 안내한다.
6. **export 결과의 구조는 REST API fetch 결과와 동일하다.** `collections` 배열, `variables` 배열, `meta` 객체. match script는 둘 다 처리한다.
7. **Plugin export는 현재 열린 Figma 파일의 Local Variables만 읽는다.** Remote Variables는 읽지 않는다.
8. **export-variables 메시지 처리는 async다.** `figma.ui.onmessage` 내부에서 즉시 return하고 async IIFE로 처리한다.
9. **Export 후 match 실행 순서:** Plugin Export → Download JSON → 저장 → `npm run figma:match`.
10. **REST API Collector는 유지한다.** Figma Variables REST 권한이 향후 확보되면 REST API 방식으로 자동화할 수 있다. 현재는 Plugin Read 방식이 우선.

## MVP-L1 Legacy UX Guide 2.4 Token Audit Rules (2026-05-18)

`scripts/figma/match-figma-variable-metadata.mjs --profile ux-guide-2.4`를 실행하거나, Legacy Token Audit 관련 파일을 편집할 때:

1. **Code Registry가 canonical source of truth다.** UX Guide 2.4 Figma Variables는 레거시 소스 스냅샷일 뿐, 규범적 기준이 아니다. UX Guide 2.4 Variable 이름이 달라도 CSS 토큰을 바꾸지 않는다.
2. **UX Guide 2.4 스냅샷은 `registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json`에 저장한다.** `figma-variable-metadata.local.json` (gitignore)과 구분한다.
3. **darkmode-test 결과는 `snapshots/figma-variable-metadata.darkmode-test.json`에 격리한다.** production registry에 섞지 않는다. "S1VaaS — Screen Designs" 파일 출처 스냅샷임.
4. **`--profile ux-guide-2.4` 모드는 레거시 매핑 분석만 한다.** Figma Variables를 canonical token으로 교체하거나 registry를 자동 수정하지 않는다.
5. **Legacy audit 출력물은 사람이 검토 후 registry에 반영한다.** `registry/tokens/legacy-token-map.json`은 초안이며 자동 적용 금지.
6. **legacy-token-map.json은 UX Guide 2.4 Variable → canonical CSS token의 의미 기반 매핑이다.** 이름 기반 자동 매칭이 아니라 의미·역할·값을 비교한 후 사람이 확정한 매핑만 `status: "confirmed"`로 표시한다.
7. **`suggestCanonical()` 함수는 제안일 뿐이다.** 자동으로 registry에 적용하지 않는다. 제안 confidence가 high여도 사람 검토 없이 확정하지 않는다.
8. **프로파일 종류:** `token-sync`(기본, T2 sync match) / `ux-guide-2.4`(legacy audit) / `darkmode-test`(실험 참조). 프로파일에 따라 소스 파일과 출력 파일이 달라진다.
9. **스냅샷 파일은 git에 커밋한다.** local.json(gitignore)과 달리 snapshots/ 내 파일은 변경 이력을 보존한다. PAT·민감 정보가 포함되지 않음을 확인 후 커밋.
10. **UX Guide 2.4 export 절차:** Figma에서 실제 `S1 UX 디자인가이드 2.4` 파일 열기 → SW Token Sync 플러그인 → Export Variables → Download JSON → `registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json`으로 저장 → `npm run figma:audit` 실행.
11. **mvp-l1-legacy-token-audit.md는 `reports/`에 생성된다.** 그룹별 분류, canonical 추천, no-candidate 항목, 미결 사항을 포함한다.
12. **MVP-L2는 legacy-to-canonical 마이그레이션 맵을 완성하는 단계다.** MVP-L1 결과를 바탕으로 `reports/mvp-l2-legacy-to-canonical-token-map.md`를 작성한다. MVP-L1이 완료되기 전까지 MVP-L2를 시작하지 않는다.

---

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

# 🪜 Figma → 코드 5단계 워크플로우 (2026-06-05 확정)

Figma 원본 컴포넌트를 **누락·추측 없이** 코드로 옮기기 위한 단계형 워크플로우다.
**진입:** `figma-to-code` 스킬 (`.claude/skills/figma-to-code/SKILL.md`). "Figma {URL/nodeId}의 {컴포넌트} 구현/변환해줘" 요청 시 발동.

## 5단계 + 검문소

각 단계는 **검문소(STOP)** 를 가지며, 통과 전엔 다음 단계로 못 넘어간다.

| 단계 | 담당 에이전트 | 산출물 | 🚦 검문소 |
|------|-------------|--------|----------|
| 1 재고조사 | figma-inspector (추출 모드) | `1-inventory.md` | 총 variant 개수 명시 후 **사용자 확인** |
| 2 수치추출 | figma-inspector + token-validator | `2-extraction.md` | 빈칸(`MCP 미제공`) 있으면 **3단계 금지** |
| 3 구현 | guide-builder | components.html + registry JSON | — |
| 4 자가대조 | **component-verifier** (검증 전용) | `4-verification.md` | **❌ 0** 될 때까지 3단계 반복 |
| 5 다크모드 | guide-builder + component-verifier | `5-darkmode.md` | 1차안 후 **개선안 먼저 제안** |

산출물 위치: `reports/figma-to-code/{component}/`

## 핵심 — 만드는 자 ≠ 검증하는 자

- **구현**은 `guide-builder`, **4단계 대조**는 별도 `component-verifier`가 한다.
- 자기 작업을 자기가 검사해 관대해지는 것을 막기 위함. **구현자는 4단계 대조를 직접 하지 않는다.**
- `component-verifier`는 1·2단계 표를 기준으로 결과물을 항목별 대조하고 ❌ 목록만 반환한다(직접 수정 금지).

## 절대 규칙 (모든 단계)

> 1·3은 **공통 규칙**(정본: §🤖 공통 규칙 허브). 2·4는 **figma-to-code 전용**(정본: `figma-to-code/SKILL.md`). 아래는 이 워크플로우 맥락의 요약.

1. **추측 금지** — 모든 수치는 Figma MCP에서 실제로 읽은 값만 사용. (공통)
2. **아이콘 원본 강제** — MCP 제공 SVG/localhost 에셋을 그대로 사용. 새로 그리거나 외부 패키지 추가 금지. (figma-to-code 전용)
3. **막히면 보고** — MCP에서 값·에셋을 못 받으면 임의로 채우지 말고 어떤 항목인지 사용자에게 알린다(표에 `MCP 미제공` 표기). (공통)
4. **목록 책임** — 1단계 목록은 끝까지 지키고 4단계에서 반드시 대조. (figma-to-code 전용)

## 6 Gate와의 관계 (층위 분리)

| 구분 | 5단계 워크플로우 | 6 Gate |
|------|----------------|--------|
| 시점 | 작업 **진행 중** (사전 검문소) | 작업 **완료 직전** (사후 검문) |
| 작동 | 검문소에서 STOP, 사용자 확인/❌0 대기 | `npm run gate:check` 자동 판정 |
| 관계 | 5단계가 위에 얹힘 | 그대로 유지, 완료 보고에 함께 포함 |

> 두 층은 충돌하지 않는다. 5단계 완료 후 6 Gate(특히 Gate 1 Registry·Gate 5 UI)를 실행하고, Orchestrator Summary에 함께 보고한다.
> Harness Audit(`npm run harness:audit`)은 Gate 5 사후 검문이자, figma-to-code 4단계에서 component-verifier의 대조 도구로도 쓰인다.

---

# 🎛️ Main Orchestrator & Gate Check 구조 (2026-05-20 확정)

## Main Orchestrator 역할

Claude는 단일 **Main Orchestrator**로서 모든 작업 흐름을 직접 조율한다.

- 작업 요청 → 내부 Gate 검사 → 구현 → 완료 보고 (순서 고정)
- 모든 Gate 체크는 내부적으로 수행하고 결과를 Orchestrator Summary에 포함한다
- 완료 보고는 반드시 **Orchestrator Summary** 형식을 사용한다

## 🎭 Actor 출처 표식 (이모지) — 누가 했는지 가시화 (2026-06-17 확정)

> 사용자가 "오케스트레이터·게이트·에이전트가 각각 뭘 했는지 안 보여 불안하다"고 한 데 따른 **정직한 출처 표시 규칙**이다.
> 핵심 원칙: **이모지는 실제로 독립적으로 일한 주체에만 붙인다.** 내가(🎩) 직접 한 일에 에이전트 이모지를 붙이면 "딴 주체가 한 것"처럼 보여 거짓이 되므로 금지.

### 범례

| 이모지 | 주체 | 실체 | 표시 시점 |
|--------|------|------|----------|
| 🎩 | **Orchestrator (나)** | 메인 루프 — 계획·구현·조율 직접 수행 | 내가 직접 한 일(대부분) |
| 🛡️ | **Gate (검사기)** | `scripts/*.js` 결정론적 자동 판정 | gate:check·harness:audit 출력·Gate 결과 행 |
| ⚙️ | **Hooks (집행)** | pre-commit·PostToolUse | 훅이 실제로 돌 때 |
| 🔍 | figma-inspector | 서브에이전트(spawn 시) | **실제로 Task로 띄웠을 때만** |
| 🏗️ | guide-builder | 서브에이전트(spawn 시) | **실제로 띄웠을 때만** |
| 🕵️ | component-verifier | 서브에이전트(spawn 시) | **실제로 띄웠을 때만** |
| 🔁 | token-sync | 서브에이전트(spawn 시) | **실제로 띄웠을 때만** |
| 📐 | token-validator | 서브에이전트(spawn 시) | **실제로 띄웠을 때만** |

### 표시 규칙

1. **Orchestrator Summary**: `변경 내용` 각 행은 그 일을 한 주체 이모지로 시작(내가 직접=🎩). `Gate 결과` 행은 🛡️, 훅이 돌았으면 ⚙️.
2. **에이전트 이모지는 진짜 spawn했을 때만.** 내가 'guide-builder 역할'을 직접 수행한 것은 🎩다(🏗️ 아님). spawn한 에이전트는 반환 보고 첫 줄을 자기 이모지로 시작(각 `.claude/agents/*.md`에 정의).
3. **게이트·훅 출력**: `gate-check.js`·`harness-audit.js`는 헤더에 🛡️, 훅 스크립트는 출력에 ⚙️ (이미 적용됨).

### ⚖️ 운영 원칙 — 정확도를 위한 실제 검증 분리 (self-certify 금지 조건)

기계적 정합성은 게이트(🛡️)·훅(⚙️)이 이미 결정론적으로 보장한다. 하지만 **"내가 원본을 잘못 읽었나·구조를 잘못 이해했나" 같은 판단 오류**는 게이트가 못 잡는다(③ 자기검사 편향). 따라서:

- **무거운/위험한 작업**(Figma→코드 구현, 구조 변경, 역방향 생성기 수정 등)은 내가 구현한 뒤 **`component-verifier`(🕵️)를 실제로 Task로 spawn**해 원본과 적대적으로 대조시킨다. Figma 원본 읽기가 핵심이면 **`figma-inspector`(🔍)** 도 분리한다. → 내가 만들고 내가 "됐다"고 self-certify하지 않는다.
- **가벼운 기계적 수정**(한 줄 값 변경, 오타, 카피 등)은 게이트·훅으로 충분하다. 검증 에이전트를 띄우지 않는다(토큰·속도 낭비).
- 이렇게 하면 이모지가 **"독립 검증이 실제로 돌았는지"를 사용자가 한눈에 확인하는 대시보드**가 된다. 보고가 전부 🎩면 = 혼자 self-certify, 🕵️가 보이면 = 독립 검증이 진짜 일어남.

## 5개 Gate 정의

### Gate 1: Registry Gate
**파일:** `.claude/agents/token-validator.md`
**트리거:** 컴포넌트 registry JSON 생성/수정, 토큰 추가/삭제, `tokens/*.md` 변경
**체크 항목:**
- `registry/components/index.json` path → 실제 파일 존재
- Component Token → Semantic 경유 여부 (Foundation 직접 참조 금지)
- 네이밍 규칙 (`--{component}-{variant}-{state}-{property}`)
- 신규 컴포넌트의 `harnessStatus / tokenStatus / darkModeStatus` 필드 존재
**자동 스크립트:** `npm run gate:check` (Gate 1 + Gate 3 포함)

### Gate 2: Figma Gate
**파일:** `.claude/agents/figma-inspector.md`
**트리거:** `registry/*.json`의 `figmaNodeId / componentSetKey / componentKey` 변경, Figma MCP 조회
**체크 항목:**
- 등록된 `figmaNodeId`가 Figma MCP에서 유효한 노드인지 확인
- `componentKey` → Figma 라이브러리 실존 여부
- ACCESS-01: `figma-usage-targets.json`의 stale nodeId 경고
- MCP 접근 실패 시 스냅샷으로 대체, SKIP으로 기록
**주의:** MCP 접근 실패 = SKIP (FAIL 아님). nodeId 미확인 = WARN.

### Gate 3: Quality Gate
**파일:** `scripts/gate-check.js` (Gate 3 섹션)
**트리거:** `assets/css/tokens.css` 변경, 모든 완료 보고 전
**체크 항목:**
- Foundation 이외 구역에 raw HEX 없음
- rgba 허용 예외 (`--color-overlay-*`)만 사용
- `pages/install-prompt.html` 존재 확인
**자동 스크립트:** `npm run gate:check`

### Gate 4: Report Gate
**파일:** `scripts/gate-check.js` (Gate 2 섹션)
**트리거:** `reports/*.md` 추가/수정, 작업 완료 전
**체크 항목:**
- `reports/reports-index.json` vs 실제 `.md` 파일 커버리지
- 미색인 report 파일 탐지
**자동 스크립트:** `npm run reports:sync && npm run reports:check`

### Gate 5: UI Gate + Harness Audit
**파일:** `.claude/agents/guide-builder.md`
**트리거:** `pages/*.html` 추가/수정, SITE_NAV 변경, 컴포넌트 섹션 수정
**자동 스크립트:** `npm run harness:audit` (Harness Audit 전용)
**체크 항목 — UI Gate:**
- 신규 페이지 → `assets/js/main.js` SITE_NAV 등록
- 신규 페이지 → `data/site-map.json` 메타데이터 등록
- HTML 인라인 HEX 색상 없음 (`style="color:#..."` 패턴)
- 금지 약어 미사용 (tok-, type-, bw-, fw-, cat-, cnt-)
**체크 항목 — Harness Audit (`scripts/harness-audit.js`):**
- RULE-1 SIZE_SPLIT: 사이즈 variant 있는 컴포넌트 HTML/CSS 탭 분기 완비 여부
- RULE-2 DARK_COMPARE: HTML 요소에 `data-theme="dark"` attribute 직접 사용 금지
- RULE-3 ICON_COLOR: 유사 역할 아이콘 색상 토큰 일관성 (독립 선택자 기준)

### Gate 6: Installer Coverage Gate (2026-06-02 신설)
**파일:** `scripts/installer-coverage-check.js`
**트리거:** `assets/css/tokens.css` 변경, `plugins/figma-vars-installer/src/vars-data.ts` 변경
**자동 스크립트:** `npm run installer:coverage` 또는 `npm run gate:check` (Gate 4 섹션)
**체크 항목:**
- Foundation Color (Light palette): tokens.css의 모든 `--color-{palette}-{step}`이 vars-data.ts FOUNDATION_COLOR에 존재하는가
- Foundation Number: `--spacing-N`·`--radius-N`·`--border-width-N`·`--font-size-N`·`--font-weight-*`·`--line-height-N`이 FOUNDATION_NUMBER에 존재하는가
- Semantic Color (반영 역할): `--color-{bg|surface|text|border|icon|action|status|overlay}-*`이 SEMANTIC_COLOR에 존재하는가
- Semantic Number: `--spacing-padding-*`·`--sizing-*`·`--radius-{control|button|card|modal}-*`이 SEMANTIC_NUMBER에 존재하는가
- 미반영 역할 보고 (WARN): `--color-{control-bg|control-border|form-control|navigation|data|text-state}-*`는 installer 미반영 — 정책 결정 필요
- Dark palette: `--color-*-dark-*`는 Light 변수의 Dark 모드로 흡수되므로 별도 검사 제외
**도입 사유:** 2026-06-02 사용자가 Figma 플러그인 설치 후 spacing·icon-size 등 누락을 시각적으로 발견. 5개 gate·3개 agent 모두 외부 산출물(installer ZIP)을 검사하지 않음. 커버리지 자동화로 동일 누락 재발 방지.

### Gate 7: Token Sync Monitor (2026-06-11 신설 · 2026-06-12 전 표면 확장)
**파일:** `scripts/token-sync-monitor.js` (`npm run tokens:monitor`)
**트리거:** `tokens.css`·`vars-data.ts`·`semantic.html`·`registry/tokens/semantic.colors.json` 변경 / 항상 (site-base.css 는 사이트 전용·검수 제외)
**자동 스크립트:** `npm run tokens:monitor` · `npm run gate:check` · 드리프트 해소 `npm run tokens:reconcile`
**역할:** 토큰 "값"이 **모든 표면**에서 정본과 일치하는지 한 번에 기계 판정. 컴포넌트를 계속 정리하면서 tokens.css·Variables·화면 토큰표가 어긋나는 것을 잡는다. **검증 최종 주체 = 이 Gate(검사기). 전파 = token-sync 에이전트.**

**정본(Canonical) = vars-data 단일** (2026-06-16 site-base 제외 확정):
- **Foundation + semantic**(color/button·control·text·icon·bg·surface …) = `vars-data.ts` (FOUNDATION_COLOR + SEMANTIC_COLOR). `tokens:gen`이 tokens.css Semantic을 여기서 생성. Variables 검수의 유일한 정본.
- **`assets/css/site-base.css` = 사이트 전용 표면 (Variables 검수 제외).** 역할 토큰(text/border/icon-role/action/status 등 site-base 전용분)은 포털 사이트가 `style.css → @import`로 적용하지만, **Variables(컴포넌트) 검수에는 검출되지 않는다** — 컴포넌트 검수와 사이트 스타일이 섞이는 혼란 방지(사용자 결정). `bg/surface`는 vars-data로 편입돼 정상 감시됨. site-base 값 자체는 Gate 7이 더 이상 감시하지 않으며, 문서 참조 유효성(Gate 10)만 site-base 정의를 silent def-source로 참고(검출 아님).

**비교:** 모든 표면 값을 resolved HEX(Light/Dark)로 정규화해 정본과 대조. 표면별 렌더 토큰 ∩ 정본만 비교(이름 차이 false positive 0). **추출 0건 = ⚠️ "모니터 안 됨"으로 보고(✅ 아님)** — 셀렉터 부패 방지.

**모니터 표면:**
| Tier | 표면 | 심각도 |
|------|------|--------|
| 1 | tokens.css · install-prompt.html · semantic.html · registry/semantic.colors.json · registry/foundation.colors.json | ERROR |
| 2 | tokens/semantic.md | WARN |
| 확장슬롯(미구현) | foundation.html · foundation.md · component-tokens-extracted.md | — |

**한계:** 손유지 표면(semantic.html hex·registry json)은 모니터가 *탐지*만 한다. *재생성*은 `tokens:reconcile`(deterministic: tokens:gen·sync-prompt·installer:build)이 하고, 하드코딩 잔여분은 token-sync 에이전트/수동 수정.
**도입 사유:** 2026-06-11 control-bg-disabled 값 정정 시 vars-data 드리프트·semantic.html stale hex 사각지대 확인 → 값 일치 검사를 Gate로 승격(초판 3표면). 2026-06-12 사용자가 "전 표면 강력 모니터링" 요청 → 정본 2계층화·표면 6종 확장. 도입 시 semantic.html stale hex 10건 + registry icon-inverse dark drift(#FFFFFF→gray-dark-900) 발견·정정.

### Gate 8: Component Key Coverage (2026-06-12 신설)
**파일:** `scripts/component-key-coverage-check.js` (`npm run components:keycheck`)
**트리거:** `plugins/figma-vars-installer/src/build-components.ts` 또는 `vars-data.ts` 변경 / 항상(gate:check 포함)
**자동 스크립트:** `npm run components:keycheck` · `npm run gate:check` (Gate 8 섹션)
**역할:** build-components.ts 빌더가 런타임에 **동적 조합**하는 변수 키(예: `color/chip/${v}/border/${state}`)가 vars-data 정본(SEMANTIC_COLOR·FOUNDATION_COLOR·*_NUMBER)에 **모두 존재**하는지 기계 판정.
**방법:** 정적 추측 불가(키가 동적 조합) → esbuild 로 build-components.ts 를 CJS 번들 후, **mock figma + 키 기록 maps 프록시**로 `buildAllComponents` 를 실제 실행해 요청된 전 키를 수집, vars-data 공급분과 대조.
**범위:** color/number 키(vars-data 공급분)만. 텍스트 스타일은 code.ts 소관(별도).
**도입 사유:** 2026-06-12 `buildFilterChip` solid Hover 가 `color/chip/solid/border/hover`(미정의)를 요청 → Figma 플러그인 실행 중 `requireVar` 가 "변수 누락"으로 **전체 빌드 중단**. `audit-bindings`(네임스페이스 `color/chip/` 만 검사)의 사각지대였음. leaf 키 누락을 **커밋 단계에서 기계 차단**해 동일 크래시 클래스 재발 방지. 정본 Chip·line variant 와 일치하도록 solid Hover 보더를 default 로 정정(토큰 신설 없이 내부 일관성 복원).

## Gate 실행 순서

```
작업 완료 직전:
  1. Gate 1 (Registry)  — 항상
  2. Gate 2 (Figma)     — figmaNodeId 관련 변경 시
  3. Gate 3 (Quality)   — tokens.css 변경 시 / 항상
  4. Gate 4 (Report)    — reports/*.md 추가 시
  5. Gate 5 (UI)        — pages/*.html 변경 시
  6. Gate 6 (Installer Coverage) — tokens.css 또는 vars-data.ts 변경 시 / 항상
  6b. Gate 6b (Installer Build Freshness) — 커밋된 zip 이 vars-data 최신 빌드인지(빌드 누락 stale 탐지) / 항상
  7. Gate 7 (Token Sync Monitor) — 토큰 값(tokens.css·vars-data·semantic.html·registry) 변경 시 / 항상 (site-base.css = 사이트 전용·검수 제외)
  8. Gate 8 (Component Key Coverage) — build-components.ts 또는 vars-data.ts 변경 시 / 항상
  9. Gate 9 (Number/Sizing Page Consistency) — number 토큰(sizing·spacing·radius·border-width·font·opacity·breakpoint)·foundation/semantic 페이지 변경 시 / 항상
  10. Gate 10 (Doc Token Reference Drift) — 가이드/레퍼런스 HTML(ai-snippets·guide-md 등) 토큰 참조 / 항상. Check B(rename denylist 잔재)=차단 · Check A(미정의 --color-* 참조)=경고
```

스크립트 일괄 실행: `npm run gate:check` (Gate 1 + 3 + 4 + 6 + 7 + 8 + 9 + 10 자동)

> **Gate 10 (doc-token-ref-check):** 토큰을 rename/remove 하면 옛 이름을 쥔 가이드 문서가 자동 적발된다. **정본 rename 시 `registry/tokens/deprecated-tokens.json` 의 `renamedGroups` 에 `{from,to}` 한 줄 추가**하면 이후 게이트가 전 활성 페이지에서 잔재를 차단(Check B). `--color-*` 참조 존재성은 Check A(경고)로 가시화. 단독 실행 `npm run docs:tokencheck`. `components.html`(폐기 예정)은 검사 제외.

> **🗂️ 레거시 격리 규약 (2026-06-16):** 활성 정본과 레거시를 **파일 단위로 분리**해 검사 제외한다. 폐기 토큰 CSS = `assets/css/legacy-tokens.css`(미로드), 폐기 문서 = `tokens/legacy/deprecated-reference.md`(아카이브). **단일 정본 = `registry/tokens/deprecated-tokens.json`**(`deprecatedTokens[].cssVariable`·`renamedGroups`·`legacyFiles`). 공용 필터 `scripts/lib/legacy-skip.js`(`isDeprecatedToken`·`isLegacyFile`)를 게이트가 공유 → **새 폐기 건은 deprecated-tokens.json 에 등록만 하면 전 검사에서 자동 제외**. 와일드카드 `--button-ghost-*` 형태 지원. 신규 게이트도 이 헬퍼를 import 해 레거시를 건너뛴다.

> **Gate 9 (number-page-check):** 색상 전용이던 자동 동기화(생성기·Gate 7)의 **number 사각지대**를 메운다. 검사 3종 — **(A)** foundation.html 의 number 5종 GEN 블록(`SIZING`·`FONT_SIZES`·`LINE_HEIGHTS`·`OPACITIES`·`BREAKPOINTS`) = vars-data FOUNDATION_NUMBER 정본 일치(`npm run number:gen`), **(B)** vars-data 의 **모든** Foundation/Semantic number 토큰이 foundation.html / semantic.html 에 실제 노출(신규 토큰 추가 시 페이지 미반영 탐지·font-weight는 Typography 표가 담당해 제외), **(C)** 폐지된 컴포넌트 사이징 토큰(`--sizing-{button-height|chip-height|table-row-height|form-control-height|dropdown-item-height|icon|button-min-width}-*`) 재유입 0건. 데이터 파이프라인(tokens.css·install-prompt·설치기 zip)은 Gate 6(installer-coverage)+Gate 3가 별도 강제.

## ⚙️ 강제 계층 — Hooks (2026-06-11 신설)

> **핵심:** Gate·서브에이전트는 *자동이 아니다*. Gate는 사람이 `npm run gate:check`를 칠 때만, 에이전트는 호출돼야만 돈다. **진짜 자동·강제는 hook만 가능하다.** 토큰 값 드리프트가 과거에 방치된 근본 원인 = 자동 트리거 부재.

| 훅 | 위치 | 발동 | 동작 | 강제력 |
|----|------|------|------|--------|
| **PostToolUse** (알림) | `.claude/settings.json` → `.claude/hooks/on-token-edit.sh` | `tokens.css`·`vars-data.ts` 편집 즉시 | install-prompt 자동 재동기화 + Gate 7 값 검증. 불일치면 exit 2로 모델에 피드백 | 알림(차단 안 함) |
| **pre-commit** (차단) | `.git/hooks/pre-commit` (정본: `scripts/hooks/pre-commit`) | `git commit` 시 | `npm run gate:check` 실행, error면 **커밋 차단**(exit 1) | 물리 차단 |

- **재설치:** git 훅은 커밋되지 않지만, **package.json `prepare` 스크립트가 `npm install` 시 자동 설치**하므로 보통 수동 입력 불필요. (수동 강제: `bash scripts/hooks/install-git-hooks.sh`. git 없는 환경에선 조용히 통과.)
- **우회:** `git commit --no-verify` (비권장 — 드리프트가 저장소에 유입됨).
- **검증 완료:** vars-data 값을 일부러 어긋나게 하면 PostToolUse가 exit 2로 정확한 불일치를 보고하고, pre-commit이 exit 1로 커밋을 막는 것을 확인(2026-06-11).
- **책임 분리 최종형:** 전파=token-sync 에이전트(작업자) · 판정=Gate 7(검사기) · **강제=hooks(집행자)**. 세 층이 모두 있어야 "성실성 의존"이 "기계 강제"가 된다.

## Orchestrator Summary (완료 보고 형식)

작업 완료 시 반드시 아래 형식으로 보고한다. 섹션은 해당 항목이 있을 때만 포함한다.

```
## Orchestrator Summary — {작업명}

### 변경 내용
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| 🎩 | path/to/file | 내가 직접 한 변경 |
| 🕵️ | (검증) | component-verifier 를 spawn한 경우만 |

> 주체 열 = §🎭 Actor 출처 표식 이모지. 내가 직접=🎩, 실제 spawn한 에이전트만 그 이모지. (없으면 열 생략 가능하나, 무거운 작업은 🕵️/🔍 가 보여야 정상)

### Gate 결과 (🛡️ 검사기 / ⚙️ 훅)
| Gate | 결과 | 비고 |
|------|------|------|
| 🛡️ Registry | ✅ PASS | |
| 🛡️ Figma    | ⚠️ WARN | {component} figmaNodeId 미확인 |
| 🛡️ Quality  | ✅ PASS | |
| 🛡️ Report   | ✅ PASS | |
| 🛡️ UI       | ✅ PASS | |
| ⚙️ pre-commit | ✅ 통과 | 커밋 시 |

### 미결 사항 (Human Decision 필요)
- HD-X: {내용}

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

`npm run figma:usage:check`에서 stale nodeId 경고 3건이 지속되는 경우:

```
1. Figma Desktop 실행 → SW UX 디자인가이드 2.4 파일 열기
2. 메뉴: Plugins > Development > Import plugin from manifest
   경로: {project_root}/plugins/figma-token-sync/manifest.json
3. 플러그인 실행 → UI에서 "Scan from Selection" 탭 선택
4. Figma 캔버스에서 검사할 컴포넌트 프레임 선택
5. Scan 버튼 클릭 → nodeId 확인
6. registry/figma/figma-usage-targets.json targets 배열 업데이트
7. npm run figma:usage:check 재실행 → 경고 해소 확인
```

ACCESS-01 해소 (2026-05-20 MVP-F1 플러그인 스캔 완료):
- `540:3328` — Input (Figma 내 잘못된 명칭 'Login input' — canonical: 'Input')
- `540:3794` — DatePicker (datepicker_input)
- `540:3690` — TimePicker Input (timepicker_input)
- `540:3636` — TimePicker Select
- `540:3489` — TimePicker Select Dropdown
- `540:3506` — TimePicker PC Input Dropdown
- `540:4216` — TimePicker PC Calendar
