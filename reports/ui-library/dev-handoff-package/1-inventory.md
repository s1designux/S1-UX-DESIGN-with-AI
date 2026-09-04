# 1-inventory — 개발자/퍼블리셔 전달 계층 전수 재고조사

> work-id: `dev-handoff-package` · 조사일 2026-09-04 · 조사자 ⭐ 오케스트레이터
> 방법: 저장소 파일을 기계로 파싱(JSON·npm scripts·빌드 스크립트 실측). 추측 항목은 `미확인`으로 남긴다.

## 1. 대상 컴포넌트 — 승인 18종

`registry/governance/ui-library-migration.json` + 각 `dist/components/*.manifest.json` 실측.

| id | status | variants | sizes | states | parts | JS 런타임 | htmlContract |
|---|---|---|---|---|---|---|---|
| button | approved | 3 | 4 | 4 | 1 | 없음 | ✅ |
| checkbox | approved | 1 | 0 | 5 | 2 | 없음 | ✅ |
| chip | approved | 2 | 2 | 4 | 1 | 있음 | ✅ |
| dropdown | approved | 2 | 3 | 4 | 4 | 있음 | ✅ |
| filter-chip | approved | 2 | 2 | 5 | 5 | 있음 | ✅ |
| input | approved | 1 | 3 | 7 | 6 | 있음 | ✅ |
| mobile-bottom-nav | approved | 0 | 0 | 2 | 2 | 없음 | ✅ |
| mobile-header | approved | 6 | 0 | 0 | 12 | 없음 | ✅ |
| modal | approved | 2 | 0 | 2 | 9 | 있음 | ✅ |
| multi-toggle | approved | 1 | 2 | 4 | 1 | 있음 | ✅ |
| pagination | approved | 1 | 1 | 5 | 4 | 있음 | ✅ |
| radio | approved | 1 | 0 | 5 | 2 | 없음 | ✅ |
| select | approved | 1 | 3 | 5 | 4 | 있음 | ✅ |
| tab | approved | 1 | 3 | 3 | 2 | 있음 | ✅ |
| table | approved | 1 | 3 | 3 | 4 | 있음 | ✅ |
| textarea | approved | 1 | 0 | 5 | 1 | 없음 | ✅ |
| time-picker | approved | 1 | 3 | 5 | 24 | 있음 | ✅ |
| toggle | approved | 1 | 0 | 4 | 1 | 있음 | ✅ |

**제외:** `date-picker` — `status: draft`. 승인되면 생성기가 자동으로 집어간다(하드코딩 목록을 만들지 않는다).

**결론:** 18종 전부 `rootSelector`·`variants`·`sizes`·`states`·`parts`·`htmlContract`를 기계가독으로 갖고 있다 → **프레임워크 껍데기를 manifest 에서 생성할 수 있다.**

## 2. 생성기가 읽을 입력

| 입력 | 경로 | 무엇을 준다 | 정본과의 거리 |
|---|---|---|---|
| 컴포넌트 계약 | `dist/components/{id}.manifest.json` | 허용 variant·size·state·필수 속성·필수 part | build-components.ts 의 파생(지문 보유) |
| 마크업 원형 | `dist/examples/{id}.html`(+`.mobile.html`) | 실제 DOM 구조 | src 원본의 복사 |
| 토큰 값 | `assets/css/tokens.css` (652개, light `:root` × 7블록 / dark `[data-theme="dark"]`) | 색·크기·간격·반경 | vars-data.ts 의 1차 파생 |
| 타이포 | `assets/css/typography.css` (합성 유틸 클래스) | 폰트 크기·굵기·행간·자간 | textstyles-data.ts 의 1차 파생 |
| 동작 계약 | `registry/components/component-behavior.pc.json` | 상태 전이·상호작용 | Registry 정본 |
| 금지 규칙 | `registry/governance/audit-rules.json` (R01~R11) | 검사기 판정 근거 | 거버넌스 정본 |

**중요:** 전부 **이미 있는 파생**이다. 이번 작업은 새 정본을 만들지 않는다.
`tokens.css` 를 입력으로 쓰는 것은 기존 `scripts/gen-design-md.js` 와 같은 선례를 따른 것이다.

## 3. 기존 배선 실측 — 어디에 물려야 하나

| 사실 | 확인한 곳 | 이번 작업에 주는 의미 |
|---|---|---|
| **`ui:build` 는 매번 `dist` 를 통째로 지운다** (`rm(distRoot, {recursive:true})`) | `ui-library/scripts/build.mjs:150` | 툴별 산출물을 dist 밖에 따로 두면 조용히 낡는다 → **같은 빌드 안에서 생성해야 한다** |
| `tokens:reconcile` 는 12단계로 파생 전체를 재생성 | `scripts/token-reconcile.js:49-61` | 여기에 `ui:build` 를 물리면 토큰 변경 → 네이티브 값 파일까지 자동 갱신된다 |
| `manifest.json` 에 `canonicalFingerprint` 존재 | `dist/manifest.json`, 각 컴포넌트 manifest | 버전 대조를 사람 공지가 아니라 지문으로 할 수 있다 |
| `package.json exports` 에 컴포넌트별 3줄 배선 | `ui-library/package.json` | 툴별 진입점도 같은 방식으로 늘린다 |
| ZIP 생성 선례 존재 | `scripts/build-icons-zip.js` (`npm run icons:zip`) | 배포 ZIP 을 같은 방식으로 만든다 |
| 개발자 탭이 "준비 중" 패널로 비어 있음 | `pages/install-prompt.html:433-449` | 이 자리를 툴별 카드로 채운다 |
| 파이프라인 대시보드 생성기 존재 | `pipeline-status.js` (쓰기는 뷰어 1개만) | 지문 격자를 여기에 얹는다 |

## 4. 툴별로 무엇을 줄 수 있나 (한계 포함)

| 툴 | 줄 수 있는 것 | 생성 근거 | 검사기 |
|---|---|---|---|
| HTML·CSS·JS | 완제품(현재 dist 그대로) | 이미 있음 | ✅ 강함 |
| React | 완제품 + 껍데기 | manifest + example HTML → JSX 기계 변환 | ✅ |
| Vue | 완제품 + 껍데기 | manifest + example HTML → SFC 기계 변환 | ✅ |
| Kotlin | 값 + 동작 명세 | tokens.css → `S1Tokens.kt` | ⚠️ 값 대조만 |
| Swift(iOS) | 값 + 동작 명세 | tokens.css → `S1Tokens.swift` | ⚠️ 값 대조만 |
| C++ | 값 + 동작 명세 | tokens.css → `s1_tokens.h` + JSON | ⚠️ 값 대조만 · **프레임워크 미확인** |

⚠️ 는 **정직한 한계**다. 네이티브는 컴포넌트를 우리가 줄 수 없어 개발자가 만들 수밖에 없고, 웹 코드 검사기를 붙일 수 없다.

## 5. 껍데기를 어떻게 "기계로" 만드나 (핵심 판단)

manifest 만으로는 24개 part 를 가진 time-picker 의 DOM 을 만들 수 없다. 그래서:

1. **마크업 원형은 `dist/examples/{id}.html`** 을 쓴다 (이미 승인된 실제 DOM).
2. HTML → JSX/SFC 변환은 **기계적**이다: `class`→`className`, self-closing, `data-*` 유지.
3. **props 는 manifest 의 허용목록에서만** 나온다 — `variant`·`size` 는 manifest 에 선언된 값만 받고, 그 밖의 값은 타입/런타임에서 거부한다.
4. 내용은 `data-s1-part` 지점을 slot/children 으로 연다.
5. JS 런타임이 있는 컴포넌트는 마운트 시 `init(root)`, 해제 시 `destroy(root)` 를 호출한다.

→ **검증 가능:** 껍데기가 그린 DOM 이 `examples/{id}.html` 과 같은지 기계가 대조할 수 있다.

## 6. 미확인 / 보류

| 항목 | 상태 |
|---|---|
| C++ UI 프레임워크(Qt·MFC·자체) | **미확인** — river 가 개발자에게 확인 후 회신 예정. 진행을 막지 않음(상수 헤더 + JSON 까지 만든다) |
| Kotlin 이 Android View 인지 Compose 인지 | **미확인** — 값 파일은 두 방식 모두에서 쓰이므로 이번 범위에서는 영향 없음. 컴포넌트 수준 지원을 논할 때 필요 |
| 개발자들이 쓰는 React/Vue 버전 | **미확인** — 껍데기는 빌드 도구 없이 쓰이는 표준 문법으로 생성해 영향을 줄인다 |

## 검문소 — 1-inventory

- 대상 목록 누락: **0건** (승인 18종 전수, draft 1종 제외 사유 명시)
- 입력 경로 미확인: **0건**
- 추측으로 채운 항목: **0건** (모르는 3건은 §6 에 `미확인` 으로 남김)
