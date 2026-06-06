# SW Design System Guide

**SW UX GUIDE V2.4** 기반 디자인시스템 가이드 사이트입니다.  
디자이너와 개발자가 함께 사용하는 Foundation Token, Component, Pattern 문서를 제공합니다.

> 📌 **규칙·AI 작업 기준의 정본은 [`CLAUDE.md`](CLAUDE.md)다.** 이 README의 규칙성 섹션(Button 표준·Token Layer·MVP IA·Input 분류 등)은 **요약**이며, 상세·최신 규칙이 충돌하면 CLAUDE.md가 우선한다. 기계 검사 규칙은 `registry/governance/audit-rules.json`(R01~R11)이 정본.

---

## 최신 디자인시스템 기준

이 프로젝트의 최신 기준은 Markdown 문서가 아니라 `registry`입니다.

| 기준 | 위치 |
|------|------|
| 토큰 기준 | `registry/tokens/` |
| 컴포넌트 기준 | `registry/components/` |
| Figma 매핑 기준 | `registry/figma/` |
| 검수 결과 | `reports/` |

과거 Markdown 문서(`tokens/*.md`, `docs/*.md`)는 설명용 또는 archive 자료입니다.  
작업 시 오래된 Markdown 문서만 보고 최신 기준으로 판단하지 마세요.

**기준 충돌 시 우선순위:**

1. `registry/` (최우선)
2. guard rule (`scripts/guard/`)
3. `reports/` (latest report)
4. `README.md`
5. 설명용 Markdown (`tokens/*.md`)
6. archive 문서 (`docs/archive/`)

---

## 사이트 구조

```
/
├── index.html                  # Overview (홈)
├── pages/                      # 가이드 HTML 페이지
│   ├── foundation.html         # Foundation Tokens
│   ├── semantic.html           # Semantic Tokens
│   ├── components.html         # Components
│   ├── icons.html              # Icons
│   ├── patterns.html           # Patterns (예정)
│   ├── policy.html             # Policy
│   ├── legacy.html             # Legacy Guide (예정)
│   ├── guide-md.html           # MD 원본 스니펫 (AI 프롬프트 복사용)
│   ├── md-review.html          # 리뷰·결정·체크리스트
│   └── ai-snippets.html        # AI Snippets
├── registry/                   # ★ 기준 데이터 (Source of Truth)
│   ├── index.json              # 진입점
│   ├── tokens/                 # 토큰 기준 JSON
│   ├── components/             # 컴포넌트 사양 JSON
│   └── figma/                  # Figma 노드 매핑
├── tokens/                     # 인간 가독 참고 문서 (설명용)
│   ├── foundation.md           # Foundation Token 참고 문서
│   ├── semantic.md             # Semantic Token 참고 문서
│   └── component-tokens-extracted.md  # Component Token 참고 문서
├── docs/
│   └── archive/                # 과거 참고 문서 (archive)
│       └── design-principles.md
├── assets/
│   ├── css/style.css           # 공용 스타일시트
│   ├── css/tokens.css          # CSS 변수 전체 (registry 기준 동기화)
│   └── js/main.js              # 공용 JavaScript
├── reports/                    # 검수 결과물 (MD)
└── scripts/                    # 자동화 스크립트 (guard, sync, figma)
```

---

## 실행 방법

별도 서버 불필요. 브라우저에서 `index.html`을 직접 열면 됩니다.

```bash
# macOS
open index.html

# 또는 VS Code Live Server 확장 사용
```

> **주의:** `ai-snippets.html`은 `fetch()`로 JSON을 로드하므로 `file://` 프로토콜에서 열면 CORS 오류가 발생할 수 있습니다. 이 경우 VS Code Live Server 또는 `python3 -m http.server`를 사용하세요. 오류 시 자동으로 인라인 데이터를 사용하는 fallback이 동작합니다.

---

## 현재 완료 현황

| 페이지 | 상태 | 내용 |
|--------|------|------|
| Overview | ✅ 완료 | 전체 소개, 통계, 로드맵 |
| Foundation Tokens | ✅ 완료 | 색상 107개, Semantic 27개, 타이포 |
| AI Snippets | ✅ 완료 | 10종 프롬프트 |
| Policy | 🔄 작성 중 | 6개 정책 섹션 |
| Semantic Tokens | 📅 예정 | — |
| Components | 📅 예정 | — |
| Patterns | 📅 예정 | — |
| Legacy Guide | 📅 예정 | — |

---

## MVP3.3 Portal IA 변경 이력 (2026-05-11)

### 네비게이션 재편

운영/시스템 메뉴를 사용자 대면 메뉴와 분리하는 구조로 개편했습니다.

| 변경 전 | 변경 후 | 비고 |
|---------|---------|------|
| Registry 그룹 | System 그룹 | 그룹 리네임 |
| Registry Health | System Status | 항목 리네임 |
| Button Harness (Registry 하위) | Button (Design System 하위) | 이동 + 리네임 |

### Button 페이지 탭 구조

`pages/button-harness.html`에 6개 탭이 추가됐습니다:
- **Preview** — Variant Matrix + Special States
- **Usage** — Variant 선택 기준 + Do/Don't
- **Code** — HTML/CSS 코드
- **Figma** — Figma 매핑
- **Review** — 검토 노트 + Registry Status
- **Token Details** — 토큰 목록 + Accessibility

---

## MVP3.3 Button Components Integration (2026-05-11)

MVP3.3 consolidates Button guidance under Components > Button.

Key decisions:
- Components > Button (`pages/components.html`) is the single user-facing entry point for Button.
- Existing Components and component guide content are prioritized for user-facing standards.
- Registry data is aligned to the existing component standard, not the other way around.
- Button Harness is no longer exposed as a separate main menu item.
- Component Registry and Component Tokens remain in the System group only.
- The Button matrix includes an ACTION column before DEFAULT.
- ACTION is used for real interaction testing (disabled toggle, loading toggle, click counter).
- DEFAULT is a static preview state only (`.is-preview` class).

Registry data is still used internally to render and validate the Button guide after alignment.

---

## Button Current Standard

> **규칙 정본: [`CLAUDE.md` → "Current Button Standard"](CLAUDE.md).** 공식 variant = primary·secondary·blue-line (ghost deprecated·danger 삭제), Figma states = default·hover·pressed·disabled. 정합성 검사 `npm run sync:button`.
> (이 섹션은 요약. 상세·최신은 CLAUDE.md 우선.)

---

## Pre-MVP4 — Input Component Audit & Classification (2026-05-12)

Figma MCP를 통해 Input 관련 컴포넌트 전체를 조회하고, 구조·상태·토큰을 분류했습니다.

실제 구현은 없음 — 분류 분석 및 Gap 리포트만 생성합니다.

### 분류 결과

| 분류 | Figma 이름 | NodeId | 설명 |
|---|---|---|---|
| **Base Input** | `Login input` | 6443:4408 | 순수 input field (label/helper 없음) |
| **Input with Slots** | `pc_input field with helper text` | 6443:4203 | Base Input + Label + Helper (PC 3 sizes) |
| **Input with Slots** | `mobile_input field with helper text` | 6443:4105 | Base Input + Label + Helper (Mobile) |
| **Pattern** | `input+btn` | 6443:4033 | Input + Secondary Button 복합 레이아웃 |
| **Pattern** | `Inputbox_large` | 6443:4072 | Multi-line / Textarea 입력 |
| **Picker** | `timepicker_input` | 6443:4606 | 시간 선택 input (alarm 아이콘) |
| **Picker** | `datepicker_input` | 6443:4655 | 날짜 선택 input (calendar 아이콘) |

### Base Input 상태 × 사이즈

| 사이즈 | 높이 | 플랫폼 |
|---|---|---|
| mobile | 48px | Mobile |
| medium (pc-md) | 44px | PC |
| xsmall (pc-sm) | 34px | PC |
| xxsmall (pc-xsm) | 28px | PC |

상태: default / selected(focus) / complete / error / success / disabled

### Figma 확인 토큰 (핵심)

```
--color/form-control/bg/default        → #FFFFFF
--color/form-control/bg/selected       → #FFFFFF
--color/form-control/bg/disabled       → #F5F5F5
--color/form-control/border/default    → #D9D9D9
--color/form-control/border/selected   → #1D6CEB  (focus)
--color/form-control/border/error      → #FF4554
--color/form-control/border/disabled   → #D9D9D9
--color/form-control/text/placeholder  → #757575
--color/form-control/text/default      → #353535
--color/form-control/text/disabled     → #C4C4C4
--color/text/state/helper              → #757575
```

> ⚠️ 현 registry `--input-*` 토큰 네이밍과 Figma `--color/form-control/*` 네임스페이스 불일치.  
> Human Decision 8개 항목은 `reports/pre-mvp4-input-classification.md` 참조.

---

## MVP3.8 Source Guard CI Dry Run

Source Guard CI Dry Run runs Source Guard checks automatically through GitHub Actions.

한글 설명: GitHub Actions에서 Source Guard를 자동 실행하여 외부 서비스 프로젝트 또는 테스트 fixture가 디자인시스템 기준을 지키는지 검사합니다. CI에서는 실제 파일을 수정하지 않고 리포트만 생성합니다.

### Manual Run

GitHub Actions에서 `Source Guard Dry Run` workflow를 수동 실행할 수 있습니다.

**Input:**
```
target = scripts/guard/__fixtures__/bad-service
```

검사할 대상 경로입니다. 실제 외부 서비스 프로젝트를 연결하기 전에는 테스트 fixture를 기본값으로 사용합니다.

### Commands Used in CI

```bash
npm run guard -- --target <target>
npm run guard:suggest -- --target <target>
npm run guard:apply -- --target <target> --dry-run
```

- `guard`: 디자인시스템 위반 항목을 검사합니다.
- `guard:suggest`: 발견된 문제에 대한 수정 후보를 생성합니다.
- `guard:apply --dry-run`: 실제 수정 없이 적용 예정 변경을 미리 확인합니다.

### Artifacts

CI가 생성하는 리포트 파일은 GitHub Actions artifact로 다운로드할 수 있습니다 (30일 보관).

```
reports/source-guard-*.md
reports/patch-candidates-*.diff
reports/source-guard-apply-log-*.md
```

### Trigger

| 트리거 | 조건 |
|--------|------|
| `workflow_dispatch` | GitHub Actions UI에서 수동 실행 |
| `pull_request` | `registry/`, `scripts/guard/`, `package.json`, `CLAUDE.md`, `README.md` 변경 시 |
| `schedule` | 매일 09:30 KST (00:30 UTC) |

---

## MVP-T1 Figma CSS Token Mapping (2026-05-18)

MVP-T1 creates a mapping registry between CSS tokens, registry tokens, and Figma Variables.

한글 설명: MVP-T1은 코드에 정의된 CSS 토큰과 Figma Variables가 서로 다른 이름을 쓰더라도 같은 의미로 연결될 수 있도록 매핑 기준을 만드는 단계입니다.

This mapping is required before building Figma sync or guard plugins.

한글 설명: 이 매핑 기준은 이후 Figma Variables 동기화 플러그인, 디자인 작업물 검수 플러그인, 컴포넌트 교체 플러그인의 기반이 됩니다.

### Key files

```
registry/tokens/figma-css-token-map.json   → Figma Variable과 CSS Token의 의미 기반 연결표
registry/tokens/token-aliases.json         → complete → filled 같은 alias 기준
registry/tokens/deprecated-tokens.json     → correct처럼 더 이상 권장하지 않는 상태/토큰 기록
```

### Mapping Strategy

- Code registry is source of truth.
- Figma Variable names and CSS token names do not need to be identical — mapping is meaning-based.
- `form-control` semantic tokens are the shared base for Input, Select, DatePicker, and TimePicker.
- Component tokens (`--input-*`, `--select-*`, `--date-picker-*`) are aliases to shared semantic tokens.

### State Alias Decisions (HD-4 확정 2026-05-18)

| Figma / Legacy | Canonical | Reason |
|---|---|---|
| `complete` | `filled` | Figma complete state = content state in code (no separate token needed) |
| `success` | `correct` | HD-4: `correct`이 canonical. Figma가 `success`로 부르는 것은 Figma alias. `--input-correct-*`는 canonical 토큰 — deprecated 아님. |
| `selected` | `focus` | Figma uses `selected` for focus state on form controls |

### Confirmed Decisions (2026-05-18)

| 항목 | 결정 내용 |
|---|---|
| `form-control-text-default` 값 | **#353535 확정 → `var(--color-text-secondary)` 사용** |
| `correct` vs `success` | **`correct` = canonical. `success` = Figma alias만. `--input-correct-border/text` 는 canonical** |
| placeholder 값 | **gray/500 (#757575) 확정. `--color-text-placeholder` = `var(--color-gray-500)`** |

---

## MVP-T2 Figma Token Sync Plugin (2026-05-18)

MVP-T2는 MVP-T1에서 생성한 매핑 레지스트리를 기반으로 Figma Variables 동기화 플러그인 구조를 구축합니다.

한글 설명: CSS 토큰 레지스트리를 읽어 Figma Variables와 동기화하는 TypeScript 플러그인입니다. Dry-run / Preview-first 아키텍처로, Figma Variables collection ID가 확정되기 전까지 실제 쓰기를 비활성화합니다.

### Plugin files

```
plugins/figma-token-sync/
├── manifest.json               ← Figma 플러그인 매니페스트
├── tsconfig.json               ← TypeScript 설정 (noEmit — 타입체크 전용)
├── src/
│   ├── code.ts                 ← Figma 플러그인 sandbox 진입점
│   ├── ui.html                 ← 미리보기 UI (Dry Run 패널)
│   └── sync/
│       ├── types.ts            ← 공유 TypeScript 타입
│       ├── loadRegistry.ts     ← figma-css-token-map.json 로드
│       └── tokenSync.ts        ← 분류 로직 + 동기화 게이트
└── dist/
    └── code.js                 ← esbuild 빌드 출력 (gitignore)
```

### Build & Type Check

```bash
# 의존성 설치
npm install

# 타입 체크 (빌드 없음)
npm run plugin:check

# 플러그인 빌드 (esbuild)
npm run plugin:build
```

### SyncClassification

| 분류 | 조건 | 수 |
|---|---|---|
| `sync-ready` | stable + cssVariable + registryToken + figmaVariable 모두 있음 | 18개 |
| `preview-only` | pending + 비-alias | 11개 |
| `needs-review` | status = needs-review | 1개 |
| `excluded` | component-alias 또는 deprecated | 13개 |

### 동기화 활성화 조건

실제 Figma Variables 쓰기를 활성화하려면 아래 3가지를 모두 충족해야 합니다:

1. `FIGMA_SEMANTIC_COLLECTION_ID` 확정 (REST API fetch 후 확인)
2. `plugins/figma-token-sync/manifest.json`의 `permissions`에 `"variables:write"` 추가
3. Dry-run 미리보기 결과 사람이 검토·승인

`FIGMA_SEMANTIC_COLLECTION_ID`가 빈 문자열인 동안 `syncStableTokens()`는 의도적으로 항상 오류를 발생시킵니다.

---

## MVP-T2 Figma Variable Metadata Collector (2026-05-18)

sync-ready 18개 항목의 실제 Figma Variables metadata(collectionId, modeId, variableId)를 수집하고, 토큰 매핑 레지스트리와 매칭합니다. 실제 쓰기는 수행하지 않습니다.

### metadata 수집 방법 (둘 중 하나)

#### A. Plugin Read 방식 (현재 권장 — Variables API 권한 불필요)

```
1. Figma에서 SW Design Guide 파일 열기
2. Plugins > SW Token Sync 실행
3. [Export Variables] 버튼 클릭
4. [Download JSON] 클릭
5. 다운로드된 파일을 아래 경로에 저장:
   registry/figma/figma-variable-metadata.local.json
6. npm run figma:match 실행
```

#### B. REST API 방식 (Figma Variables Read 권한 필요 — 현재 보류)

```bash
# .env에 FIGMA_FILE_KEY와 FIGMA_TOKEN 입력
# PAT에 Variables (Read only) 권한 필요
npm run figma:fetch
npm run figma:match
```

> REST API는 Figma 플랜/조직 조건에 따라 Variables API가 제한될 수 있습니다.
> REST API 방식이 막혀있으면 Plugin Read 방식을 사용하세요.

### 파일 구조

```
plugins/figma-token-sync/
└── src/code.ts                       ← Export Variables 핸들러 (variables:read)

scripts/figma/
├── fetch-figma-variables.mjs         ← REST API fetch (Read-only, 보류)
└── match-figma-variable-metadata.mjs ← metadata와 registry 매칭 (두 방식 모두 처리)

registry/figma/
├── figma-variable-metadata.local.json  ← Plugin Export 또는 fetch 결과 (gitignore)
├── figma-variable-metadata.patch.json  ← 매칭 결과 + patch 후보 (검수용)
└── figma-variable-metadata.sample.json ← 구조 샘플 (PAT 없음)

reports/
└── mvp-t2-figma-variable-metadata.md  ← 매칭 리포트
```

### matchStatus 종류

| matchStatus | 의미 |
|---|---|
| `matched` | Figma Variable 1:1 매칭 성공 (COLOR 타입, mode 있음) |
| `dedup-required` | 여러 registry 항목이 동일 variableId 공유 → write 시 1회만 실행 |
| `duplicate-name` | 같은 이름의 Figma Variable 2개 이상 → 컬렉션으로 구분 필요 |
| `not-found` | Figma Variables에 해당 이름 없음 |
| `type-mismatch` | resolvedType이 COLOR가 아님 |
| `mode-missing` | 컬렉션 mode 정보 없음 |

### 하지 않는 것

- Figma Variables 쓰기
- PAT 저장
- registry 자동 수정 (`figma-css-token-map.json` 자동 수정 금지)

---

## Token Layer 기준 (이 프로젝트 공식)

> **정본: [`CLAUDE.md` → "Foundation Token 규칙 / 공식 token layer 용어"](CLAUDE.md).** 요약: `Foundation → Semantic → Component` 3층. Primitive·Base·Raw = 이 프로젝트에선 모두 **Foundation**으로 부른다.

---

## MVP-L1 Legacy UX Guide 2.4 Token Audit (2026-05-18)

MVP-L1은 실제 S1 UX 디자인가이드 2.4 Figma 파일의 Variables를 Code Registry와 대조하여 레거시 매핑 기준을 만드는 단계입니다.

- Code Registry = canonical source of truth (CSS tokens)
- UX Guide 2.4 = legacy source snapshot (Figma Variables snapshot only)
- darkmode-test 결과는 별도 snapshot으로 격리됨

### 실행 방법

#### 1. UX Guide 2.4에서 Variables 내보내기

```
1. Figma에서 S1 UX 디자인가이드 2.4 파일 열기
2. Plugins > SW Token Sync 실행
3. [Export Variables] 클릭
4. [Download JSON] 클릭
5. 다운로드된 파일을 아래 경로에 저장:
   registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json
```

#### 2. Legacy Token Audit 실행

```bash
npm run figma:audit
```

또는 소스 파일 경로를 직접 지정:

```bash
npm run figma:match -- --source registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json --profile ux-guide-2.4
```

### 출력 파일

```
registry/tokens/legacy-token-map.json       ← UX Guide 2.4 Variables → canonical token 매핑 초안
reports/mvp-l1-legacy-token-audit.md        ← 그룹별 분류 + canonical 추천 + 미결 항목 리스트
```

### snapshot 파일 구조

```
registry/figma/snapshots/
├── figma-variable-metadata.ux-guide-2.4.json    ← 실제 UX Guide 2.4 Figma Variables (미수집)
├── figma-variable-metadata.darkmode-test.json   ← S1VaaS Screen Designs 참조용 스냅샷
└── figma-variable-metadata.darkmode-test.patch.json  ← darkmode-test 매칭 결과 (not-found 18)
```

> `figma-variable-metadata.local.json`은 gitignore 대상입니다. snapshot 파일만 git에 보관됩니다.

### 프로파일 종류

| profile | 용도 | 소스 |
|---|---|---|
| `token-sync` (기본) | T2 sync match — sync-ready 18개 매칭 | local.json |
| `ux-guide-2.4` | Legacy audit — UX Guide 2.4 전체 Variables 분류 | snapshots/ux-guide-2.4.json |
| `darkmode-test` | 실험용 참조 — S1VaaS Screen Designs 결과 | snapshots/darkmode-test.json |

---

## MVP3.7 Source Guard Apply Mode

Source Guard Apply Mode applies high-confidence fix suggestions to an external service project.

외부 서비스 프로젝트에서 발견된 디자인시스템 위반 항목 중 확실한 수정 후보만 실제 파일에 적용합니다.
`--apply` 옵션이 없으면 절대 파일을 수정하지 않습니다.

### Dry Run

```bash
npm run guard:apply -- --target ../service-project --dry-run
```

적용될 변경 사항을 미리 확인합니다. 실제 파일은 수정하지 않습니다.

### Apply

```bash
npm run guard:apply -- --target ../service-project --apply
```

확실한 수정 후보만 실제 외부 서비스 프로젝트 파일에 적용합니다.
적용 전 자동으로 백업을 생성합니다 (`reports/apply-backups/`).

### Safety Rules

- `ghost` variant is never auto-fixed.
- `rgba()` values are never auto-fixed.
- Ambiguous colors like `#FFFFFF` are never auto-fixed.
- New tokens are never created automatically.
- Human approval is required for ambiguous component decisions.
- `--apply` flag must be explicit — no accidental file modification.

---

## MVP3.6 Source Guard Fix Suggestions

Source Guard Fix Suggestions generates recommended fixes for an external service project.

외부 서비스 프로젝트에서 발견된 디자인시스템 위반 항목에 대해 수정 후보를 생성합니다.
실제 파일은 바로 수정하지 않고, 추천 수정안과 사람이 판단해야 할 항목을 리포트로 남깁니다.

### Usage

```bash
npm run guard:suggest -- --target ../service-project
```

`../service-project` 위치의 외부 서비스 프로젝트를 검사하고, 디자인시스템 기준에 맞는 수정 후보를 생성합니다.

### Outputs

```
reports/source-guard-fix-suggestions-[target].md   ← 사람이 읽는 수정 제안 리포트
reports/patch-candidates-[target].diff              ← 적용 전 검토용 patch 후보
```

첫 번째 파일은 수정 제안 리포트이고, 두 번째 파일은 적용 전 검토용 patch 후보입니다.
High confidence 항목만 patch 후보에 포함됩니다. **외부 서비스 파일은 자동 수정하지 않습니다.**

---

## MVP3.5 Source Guard

Source Guard checks an external service project against the SW Design System registry.
The design system repository is the source of truth.
The external project is passed as a `--target` argument.

### Usage

```bash
npm run guard -- --target ../service-project
```

### Checks

- Raw HEX colors
- RGB/RGBA colors
- Undefined CSS variables
- Direct foundation color primitive usage
- Unsupported Button variants (ghost, danger, outline, tertiary)
- Inline style colors

### Report

Reports are generated under:

```
reports/source-guard-[target-name].md
```

---

## MVP3.4 Button Figma MCP Comparison (2026-05-12)

MVP3.4 compares the Button implementation against Figma and the registry, documenting all token/structural discrepancies.

Key findings:
- Figma MCP connection confirmed (file `yE5UCFEbmXJBlYJWB24Lz2`), but Button componentSetKey / figmaNodeId are all empty — direct design comparison not possible.
- 7 token value mismatches found between `component.tokens.json` and `components.html` inline definitions.
- Critical: `--button-primary-disabled-bg` in registry uses `color-border-default` (a border token) instead of `color-bg-subtle` — registry needs correction.
- `--button-blue-line-default-text`: registry uses `color-action-primary-default`, components.html uses `color-text-link` — requires Human Decision.
- Dual CSS systems (`sw-button` in button.css vs `s1-btn` in components.html) are undocumented and inconsistent (focus-ring direction, loading state, xxsmall size).
- Full report: `reports/mvp3-4-button-figma-mcp-comparison.md`

---

## 토큰 업데이트 방법

### 1. Figma에서 토큰 변경 시

1. `data/foundation-tokens.json` 업데이트
2. `src/styles/theme.css` CSS 변수 추가/수정
3. `tokens/token-map.json` 매핑 업데이트
4. `tokens/design-tokens.md` 문서 업데이트
5. (필요 시) `tailwind.config.js` 추가

### 2. 네이밍 규칙

- Figma 변수명 → CSS 변수명: `/` → `-`, 공백 → `-`, `&` 제거, 대문자 → 소문자
- 예: `color/action/Primary` → `--color-action-primary`

### 3. AI 스니펫 추가 시

`data/ai-snippets.json`에 항목 추가 후 `pages/ai-snippets.html`의 `SNIPPETS_INLINE` 배열도 동기화하세요.

---

## 파일 참조 관계

```
Figma Variables
    ↓
tokens/raw-figma-tokens.json    ← Figma MCP 추출 원본
    ↓
data/foundation-tokens.json     ← 정규화된 토큰 데이터 (pages의 인라인 JS 참조)
    ↓
src/styles/theme.css            ← CSS Custom Properties 선언
    ↓
tokens/token-map.json           ← CSS 변수 → 역할 매핑
src/styles/theme.js             ← JS 토큰 객체
tailwind.config.js              ← Tailwind CSS 클래스 연결
```

---

## 기술 스택

- **HTML/CSS/JS** — 프레임워크 없는 정적 사이트
- **CSS Custom Properties** — 토큰 구현체
- **Tailwind CSS v3** — 프로덕션 코드 유틸리티 (가이드 사이트 자체는 미사용)
- **Figma Variables** — 디자인 토큰 원천

---

## Figma 연결

- 파일: SW-UX-GUIDE V2.4
- 주요 노드: `540:7663` (Foundation Token 정의)
- Figma URL: `https://www.figma.com/design/yE5UCFEbmXJBlYJWB24Lz2/`

---

## Registry 기반 운영 (MVP0 ~)

> 추가일: 2026-05-11 / Phase: MVP0

### 구조 역할 분리

| 폴더 | 역할 | 소비자 |
|------|------|--------|
| `registry/` | **기준 데이터** — 토큰·컴포넌트·Figma 매핑 JSON | Claude, HTML Portal, Figma Plugin (예정) |
| `tokens/*.md` | 인간 가독 문서 (유지) | 디자이너·개발자 참조용 |
| `data/` | HTML Portal 렌더링 전용 데이터 | pages/*.html |
| `reports/` | 검수·리뷰 결과물 | 팀 리뷰 |
| `pages/` | HTML 포털 뷰 | 브라우저 |

### Registry 진입점

```
registry/index.json          ← 전체 구조 인덱스
registry/tokens/
  foundation.colors.json     ← Foundation Token 팔레트 (원천값)
  semantic.colors.json       ← Semantic Token Light/Dark
  component.tokens.json      ← Component Token (Semantic 참조)
registry/components/
  button.json                ← Button Core Component 사양
registry/figma/figma-map.json
registry/governance/         ← versions / audit-rules / deprecated / migration
registry/ai/                 ← AI 스니펫·리뷰 프롬프트
```

### 토큰 3레이어 원칙

```
Foundation (원천값)
  ↓ Semantic이 참조
Semantic (역할 기반, Light/Dark 전환 지점)
  ↓ Component가 참조
Component (컴포넌트 전용)
```

Component Token 색상은 Foundation을 직접 참조하지 않는다.

---

## MVP2 Registry-based Portal Rendering

> 추가일: 2026-05-11 / Phase: MVP2

MVP2는 HTML 포털을 하드코딩된 문서 중심 구조에서 registry를 읽어 렌더링하는 Design System Portal로 점진 전환한다.

### 추가된 Portal Registry 레이어

```
assets/js/
  registry-loader.js    ← registry JSON 공통 fetch 유틸리티
  token-renderer.js     ← Foundation / Semantic / Component Token 렌더링
  component-renderer.js ← registry/components/*.json 상태 렌더링
  registry-health.js    ← Registry 전체 상태 요약 렌더링
```

### Registry 기반 신규 페이지 (5종)

| 페이지 | 소스 |
|--------|------|
| `pages/registry-health.html` | registry 전체 상태 요약 |
| `pages/foundation-tokens.html` | `registry/tokens/foundation.colors.json` |
| `pages/semantic-tokens.html` | `registry/tokens/semantic.colors.json` |
| `pages/component-tokens.html` | `registry/tokens/component.tokens.json` |
| `pages/component-registry.html` | `registry/components/*.json` |

기존 하드코딩 포털 콘텐츠(foundation.html, semantic.html, components.html)는 마이그레이션 완료 시까지 legacy/fallback으로 유지한다.

> **실행 주의:** Registry 페이지는 `fetch()`로 JSON을 로드하므로 반드시 로컬 서버에서 열어야 합니다.  
> `python3 -m http.server` 또는 VS Code Live Server 사용.

---

## MVP3 / MVP3.1 Core Component Harness

> 추가일: 2026-05-11 / Phase: MVP3

MVP3는 첫 번째 registry 기반 Core Component 구현(Button)을 도입한다.
MVP3.1은 Core Component Harness shell을 registry와 연결한다.

### Harness 컨트롤 구조

- Preview Theme: Light / Dark
- Platform: All / PC / Mobile
- Core component tabs: Button · Checkbox · Radio · Toggle · Chip · FilterChip · Input · Select

### Button 구현

Button은 이번 단계의 첫 번째 상세 구현 대상이다.

```
assets/css/components/button.css  ← sw-button 네이밍, V2.4 component token 기반
pages/button-harness.html         ← Variant × Size × State 미리보기
assets/js/button-harness.js       ← registry 기반 status / token 렌더링
assets/js/core-component-harness.js ← 공통 harness 컨트롤러
registry/components/index.json    ← harness entry point
```

나머지 컴포넌트(Checkbox, Radio, Toggle, Chip, Input, Select)는 skeleton 상태로 등록되어 있다.

### Dark Semantic Border Policy

Dark mode semantic border token은 명시적 resolved 값을 사용해야 한다.
다음 Figma opacity composition은 stable token으로 사용하지 않는다.

| Token | Figma opacity |
|-------|--------------|
| `--color-border-subtle` dark | `#FFFFFF 4%` |
| `--color-border-default` dark | `#FFFFFF 7%` |
| `--color-border-strong` dark | `#FFFFFF 12%` |
| `--color-border-emphasis` dark | `#FFFFFF 20%` |

위 토큰은 현재 `candidate` 상태. 실제 resolved HEX 값이 확정되면 stable로 전환한다.
권장 stable 정의: foundation dark scale 토큰 참조 또는 resolved HEX 값 사용.
Product UI 컴포넌트에서는 raw `rgba()` border 값을 직접 사용하지 않는다.

---

## MVP4.1 — Input Related Composed Fields (2026-05-12)

Search Input, Password Field, Input with Unit은 독립 Pattern이 아니라 Input의 slot과 보조 액션을 조합한 사용 예시입니다.

**위치:** Components > Input 화면 하단 `Related Composed Fields` 섹션

| 항목 | 구성 | 분류 |
|---|---|---|
| Search Input | Base Input + search icon + clear action | composed-field |
| Password Field | Base Input + visibility toggle | composed-field |
| Input with Unit | Base Input + unit label | composed-field |

These are not Base Input states or variants. They are documented under Input for discoverability.

**별도 Component 후보:** DatePicker · TimePicker · Textarea

**Pattern / Module 후보:** Login Form · Search Module · Address Search · Date Range Selection


---

## MVP4.2 — Input Composed Fields Slot Correction (2026-05-12)

Search Input의 slot 구조를 Figma 기준으로 정정합니다.

**핵심 변경: Search Input은 prefixIcon 구조가 아닙니다.**

검색 아이콘은 오른쪽 `suffixActionGroup` 안에 위치하며, clearAction이 그 왼쪽에 조건부로 표시됩니다.

| 항목 | 슬롯 구조 | 비고 |
|---|---|---|
| Search Input | `suffixActionGroup: clearAction (조건부) + searchAction (항상)` | 입력값 없음: searchAction만 / 입력값 있음: clearAction + searchAction |
| Password Field | `suffixActionGroup: visibilityToggle (항상) + clearAction (조건부)` | Hidden / Visible 두 상태 표시 |
| Input with Unit | `suffixText: unitLabel` | 변경 없음 |

**변경 파일:**

- `pages/components.html` — Related Composed Fields 카드 HTML 재작성 (suffixActionGroup 구조 반영, 2-state 프리뷰 추가)
- `registry/components/input.json` — `relatedComposedFields` 슬롯 정의 전면 교체
- `CLAUDE.md` — Input Composed Field Slot Rules 추가

---

## MVP4.2 Revision — Related Composed Fields Interactive Update (2026-05-12)

Search Input, Password Field, Input with Unit을 실제 인터랙션이 동작하는 interactive preview로 업그레이드합니다.

**변경 내용:**
- Search Input: 입력값 있을 때 clear 아이콘 표시 (실제 동작). 빈 상태에서 hide.
- Password Field: visibility toggle (password/text 전환) 및 clear 기능 실제 동작
- Input with Unit: Basic Input 동일 구조 재사용 확인. 실제 입력 가능.
- 모든 카드: 정적 `is-preview` 제거 → Basic Input (`.s1-input-wrap`, `.s1-input-field`) 동일 구조 재사용
- JS: `setupRelatedComposedFields()` 함수 추가 (components.html script 블록)

**Figma 기준:** Section 3 (6452:5955), SW UX GUIDE V2.4 (`yE5UCFEbmXJBlYJWB24Lz2`)

**Figma 아이콘 노드 확인:**
| 아이콘 | Figma 노드명 | Figma 노드 ID | 상태 |
|---|---|---|---|
| 검색 | ic_찾기/조회 | 6452:5930 | candidate (임시 SVG) |
| 삭제 | remove | 882:4061 | candidate (임시 SVG) |
| 비밀번호 숨김 | ic_비밀번호미표시 | 135:6692 | candidate (임시 SVG) |
| 비밀번호 표시 | (노드명 미확인) | — | candidate (임시 SVG) |

**아이콘 상태:** candidate — Figma 노드명 확인 완료, 로컬 SVG asset 미등록. 실제 asset 등록 후 iconStatus stable 전환 필요.

**변경 파일:**
- `pages/components.html` — Related Composed Fields HTML interactive 재작성 + CSS 보정 + JS 추가
- `registry/components/input.json` — `relatedComposedFields` figmaStatus/figmaNote/figmaIconName/figmaNodeId 업데이트
- `CLAUDE.md` — Input Composed Field Slot Rules 8~13 추가

---

## MVP4.3-A — DatePicker Component Candidate (2026-05-12)

DatePicker를 별도 컴포넌트 후보로 정리하고 interactive preview를 구현합니다.

**방향:**
- DatePicker는 Base Input state가 아닌 별도 컴포넌트 후보
- Trigger: Base Input (s1-input-wrap) 재사용
- Calendar panel: day grid + month navigation 포함
- Figma node: 6443:4655 (MCP 접근 불가 — invalid node 오류, Figma 직접 확인 필요)

**구현 내용:**
- Trigger states: Default / Filled / Disabled / Error (정적 프리뷰)
- Interactive Preview: 달력 패널 열기/닫기, 날짜 선택, 이전/다음 월 이동, ESC/외부 클릭 닫기
- Token: Base Input 재사용 + DatePicker 전용 candidate token 등록
- JS: `setupDatePicker(document)` 함수 (components.html)

**변경 파일:**
- `registry/components/date-picker.json` — 신규 생성
- `registry/components/index.json` — DatePicker candidate 추가
- `registry/figma/figma-map.json` — datePicker 항목 추가
- `pages/components.html` — DatePicker 섹션 추가 (CSS + HTML + JS)
- `CLAUDE.md` — MVP4.3-A 규칙 추가
- `reports/mvp4-3-a-date-picker.md` — 신규 생성
