# 3-build — 개발자·퍼블리셔 전달 계층 구현

> work-id: `dev-handoff-package` · 2026-09-04 · 구현 ⭐ 오케스트레이터
> 원칙: 컴포넌트마다 손으로 만들지 않는다. **생성기를 만들고 컴포넌트는 데이터로 늘린다.**

## 1. 만든 것

| # | 파일 | 무엇을 하나 |
|---|---|---|
| 1 | `ui-library/scripts/platform.mjs` | 툴별 산출물 생성기 (신규) |
| 2 | `ui-library/scripts/build.mjs` | 위 생성기 + 검사기 배포를 빌드에 편입 (수정) |
| 3 | `ui-library/scripts/test.mjs` | 전달본 파리티 검사 추가 (수정) |
| 4 | `ui-library/src/tools/s1-ui-lint.mjs` | 개발자 프로젝트에서 도는 자가 검사기 (신규) |
| 5 | `scripts/build-ui-package-zip.js` | 배포 ZIP 생성·신선도 검사 (신규) |
| 6 | `scripts/gen-dev-download-panel.js` | 다운로드 화면 자동 생성 (신규) |
| 7 | `scripts/platform-tokens-check.mjs` | 색·크기 값 전달본 ↔ 정본 대조 (신규) |
| 8 | `scripts/token-reconcile.js` | 우산에 3단계 편입 — 12 ui:build · 13 ui:zip · 14 devpanel:gen (수정) |
| 9 | `scripts/gate-check.js` | **Gate 46** 신설 (수정) |
| 10 | `registry/governance/canon-manifest.json` | 새 파생 표면 2개 선언 + install-prompt 재생성 경로 추가 (수정) |
| 11 | `pages/install-prompt.html` | "준비 중" 패널 → 자동 생성 구간으로 교체 (수정) |
| 12 | `package.json` | `ui:zip` · `ui:zip:check` · `devpanel:gen` · `devpanel:check` · `platform:tokens:check` |

## 2. 생성물 — 컴포넌트 19종 × 툴 6개

`ui-library/dist/` 안에 함께 만들어진다(빌드 산출 110 → **159 파일**).

| 산출물 | 무엇에서 나오나 | 개수 |
|---|---|---|
| `platform/tokens.json` | tokens.css (var() 참조를 끝까지 풀어 실제 값으로) | 토큰 477개 · 다크 분기 166개 |
| `platform/kotlin/S1Tokens.kt` | 〃 | Colors·ColorsDark·Dimens·Numbers·Raw |
| `platform/swift/S1Tokens.swift` | 〃 | 〃 |
| `platform/cpp/s1_tokens.h` | 〃 | `constexpr` 상수 (프레임워크 타입 미사용) |
| `platform/react/*.jsx` | manifest + 승인 예제 HTML | 19개 + index |
| `platform/vue/*.vue` | 〃 | 19개 + index |
| `platform/contract.json` | 각 manifest 허용목록 | 19종 |
| `platform/behavior.json` | `component-behavior.pc.json` | 그대로 전달 |
| `tools/s1-ui-lint.mjs` · `tools/lint-rules.json` | 검사기 + `audit-rules.json` R02·R07 발췌 | |

배포 ZIP: `assets/downloads/s1-ui-dev-package.zip` (306KB) + 시작 안내 README(자동 생성).

## 3. 핵심 판단 — 껍데기는 마크업을 다시 쓰지 않는다

React·Vue 껍데기는 HTML 을 JSX/template 으로 **옮겨 적지 않는다.** 승인된 예제 HTML **문자열 그대로**를 마운트하고 `init()`/`destroy()` 를 건다.

| 이유 | 효과 |
|---|---|
| 옮겨 적으면 19종 × 최대 30개 part 를 사람이 다시 쓰는 것과 같다 | 옮겨 적기 오류 0 |
| 프레임워크가 우리 컴포넌트 내부를 다시 그리면 런타임 상태가 깨진다 | React 의 재렌더가 내부에 닿지 않는다 |
| 검증이 가능해진다 | 껍데기 마크업 ≡ `examples/*.html` 을 **기계가 글자 단위로 대조** |

host 요소는 `display:contents` 라 레이아웃에 끼어들지 않는다.
허용되지 않은 `variant`·`size` 는 React 는 예외를 던지고 Vue 는 validator 로 거른다 — 값 목록은 manifest 에서 나온다.

## 4. 자동 검사 (test.mjs 추가분)

| 검사 | 무엇을 막나 |
|---|---|
| 껍데기 마크업 ≡ 배포 예제 (break 별) | React·Vue 개발자만 다른 화면을 보는 것 |
| React 마크업 ≡ Vue 마크업 | 툴별로 갈라지는 것 |
| contract.json ≡ manifest (variant·size·필수 part·지문) | 허용목록이 조용히 늘어나는 것 |
| dist CSS 가 쓰는 var() 전부가 tokens.json 에 존재 | 네이티브에 값이 빠진 채 전달되는 것 |
| tokens.json 에 미해결 `var()` 0건 | 네이티브가 쓸 수 없는 값이 섞이는 것 |
| Kotlin·Swift·C++ 파일에 색·크기 토큰 전량 존재 | 언어별 파일만 누락되는 것 |
| 이름 충돌 방어 (`--a-b` ↔ `--a--b`) | 나중에 토큰이 늘 때 값이 조용히 덮이는 것 |
| platform manifest 지문 ≡ dist 지문 | 다른 정본에서 나온 전달본이 섞이는 것 |

## 5. Gate 46 — 커밋 검문소 신설

전달 계층 3곳의 지문이 한 줄로 이어져 있는지 본다.

| 검사 | 실패 시 안내 |
|---|---|
| 배포 ZIP 이 현재 dist 에서 나왔나 | `npm run ui:zip` |
| 다운로드 화면이 현재 dist 를 말하고 있나 | `npm run devpanel:gen` |
| 색·크기 값 전달본이 현재 tokens.css 와 같나 | `npm run ui:build` |
| 승인 컴포넌트인데 전달본이 없는 것 | 목록 표시 |

## 6. 발견 — 토큰 값이 바뀌면 배포본은 자동으로 못 따라간다

시연으로 확인했다. `--color-base-home-bg` 를 정본에서 바꾸자 **`ui:build` 가 일부러 멈췄다**:

```
Error: input canonicalFingerprint is stale. Review canon changes before rebuilding.
```

이것은 **기존 안전장치**다(내가 만든 규칙이 아니다). 컴포넌트가 그 토큰을 쓰고 있으니 사람이 다시 확인하고 각 manifest 지문을 갱신해야 배포본을 다시 만들 수 있다는 뜻이다.

**그래서 이렇게 처리했다:**
1. `tokens:reconcile` 에서 UI 라이브러리 단계를 **맨 뒤(12~14)** 로 옮겼다 — 여기서 멈춰도 토큰 표면 재생성(1~11)은 이미 끝나 있다.
2. `platform-tokens-check.mjs` 를 만들어 **컴포넌트와 무관하게 값만 대조**한다. 배포본이 옛 값을 든 채 남으면 Gate 46 이 커밋을 막는다.

→ 이전에는 이 상태가 **아무 게이트에도 안 걸렸다.** 지금은 걸린다.

## 7. 적대 시험 (구현자 자가 시험 — 독립 검증은 4단계)

| 시험 | 결과 |
|---|---|
| 껍데기 마크업을 몰래 고침 | ✅ 잡힘 (2건 보고) |
| 계약의 허용 variant 를 늘림 | ✅ 잡힘 |
| 전달본 토큰 목록에서 색 1개 삭제 | ✅ 잡힘 (빌드 신선도) |
| 다운로드 화면 숫자를 손으로 고침 | ✅ Gate 46 차단 |
| 정본 토큰만 바꾸고 배포본을 안 만듦 | ✅ Gate 46 차단 |
| 검사기: 올바른 파일 | ✅ 오류 0 · 경고 0 |
| 검사기: 위반 파일(직접 색·rgba·없는 토큰·미승인 variant·필수 속성 누락·없는 컴포넌트) | ✅ 오류 9건 정확히 지목 |
| 검사기: 재구현 의심 | ✅ 경고 2건 (오류 아님 — 의도) |

## 8. 실제 렌더 확인

`reports/ui-library/dev-handoff-package/screens/dev-panel.png` — 개발자 패널 전체.
1차 렌더에서 React·C++ 코드 예시가 카드 밖으로 잘려 나가는 것을 발견해 예시를 줄이고 재확인했다.

## 9. 검문소 — 3-build

- `npm run ui:build` ✅ · `npm run ui:test` ✅ · `npm run ui:zip:check` ✅ · `npm run devpanel:check` ✅
- `npm run gate:check` ✅ PASSED (게이트 49개 · 경고 13건은 기존 부채)
- `npm run tokens:reconcile -- --no-installer` ✅ 전 표면 정본 일치
- dist 손편집 **0건** (전부 생성물)

---

## 10. 브라우저 실측에서 나온 결함 5건 (문자열 검사로는 안 잡혔다)

`ui:test` 는 통과하는데도 껍데기가 깨지는 경우가 있었다. **실제 브라우저에 마크업을 붙여 보고** 발견했다.

| 결함 | 실제 사실 | 내 잘못된 가정 |
|---|---|---|
| date-picker(PC 3개) · dropdown(2개) · time-picker(PC 2·Mobile 3개) | 승인 예제는 인스턴스 1개가 아니라 **변형을 나란히 보여 주는 예시 모음**이다 | "예제 = 인스턴스 1개" |
| mobile-bottom-nav | 최상위는 **화면이 소유하는 `<nav role="tablist">`** 이고 코어는 그 안의 버튼이다 | "예제 최상위 = 컴포넌트 루트" |
| dropdown · date-picker · modal | variant 를 담는 속성이 `data-type` · `data-mode` · `data-footer` 로 **컴포넌트마다 다르다** | "variant = 항상 `data-variant`" |

**고친 방법 (이름을 지어내지 않는 방향으로)**

1. 예제에서 `data-s1-component="{id}"` 인 **첫 요소만 도려내** 껍데기 마크업으로 쓴다.
2. 도려낸 조각이 최상위 요소 1개인지 **생성 시점에 검사**하고, 아니면 빌드를 세운다.
3. variant·size 속성 이름을 **승인된 마크업에서 읽어 온다**(`VARIANT_ATTRIBUTE`·`SIZE_ATTRIBUTE`). 고를 축이 둘 이상인데 속성을 못 찾으면 빌드를 세운다.
4. `ui:test` 의 대조 기준을 "예제 파일 전체"에서 **"예제 안의 승인된 인스턴스"** 로 바꾸고, 껍데기 마크업이 컴포넌트 루트에서 시작하는지도 검사한다.

**재확인 결과 (브라우저 실측):** 19종 × break = **29건 전부 PASS** — 최상위 1개 · 루트가 해당 컴포넌트 · 감지된 variant/size 속성이 실제로 존재.

| 컴포넌트 | variant 속성 | size 속성 |
|---|---|---|
| button · chip · filter-chip · mobile-header | `data-variant` | `data-size` |
| dropdown | `data-type` | `data-size` |
| date-picker | `data-mode` | `data-size` |
| modal | `data-footer` | — |
| select · tab · table · input · multi-toggle · time-picker | (축 1개 — 속성 없음) | `data-size` |
| checkbox · radio · toggle · textarea · pagination · mobile-bottom-nav | (없음) | (없음) |

> **교훈:** 문자열 대조는 "같은가"만 본다. "이게 브라우저에서 하나의 컴포넌트로 서는가"는 렌더해야 보인다.
> `ui:test` 통과를 시각·구조 검증으로 대체하면 안 된다는 CLAUDE.md 규칙이 그대로 실증됐다.
