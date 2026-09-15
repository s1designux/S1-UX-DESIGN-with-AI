# 3-build(가이드) 결과 — 검수·안내 화면 dist 연결

작업 `bottom-sheet` · 2026-09-15 · 수행 = 🤖 `guide-builder`
**자기 결과를 PASS 로 판정하지 않는다.** 아래는 사실과 측정값이며 합격 판정은 4-verification 소관이다.

---

## 1. 고친 파일

| 파일 | 무엇을 |
|---|---|
| `pages/ui-review.html` | **§7 먼저 처리** — 손으로 쓴 시트 마크업 2자리(time-picker 2061 · date-picker 템플릿 2211) 루트에 `data-s1-component="bottom-sheet" data-break="mobile" data-footer="single"` 추가. 안쪽 부품 이름 무변경 · 검수 전용 CSS(207줄) 무변경 |
| `pages/ui-review.html` | 검수 섹션 24(Bottom Sheet)·25(Bottom Sheet Option) 추가 + `bottomSheetMarkup` · `bottomSheetOptionMarkup` · `renderBottomSheetPanel` · `renderBottomSheetOptionPanel` + Light·Dark 2벌 배선 + 라이브 시트 `init` |
| `pages/ui-review.html` | 페이지 전용 CSS 2개 — `[data-s1-component="bottom-sheet"].is-review-inline`(정적 표본 눕히기) · `.review-bottom-sheet-option-box`(360 폭 상자) |
| `assets/js/ui-library-guide.js` | `componentConfig` 2항목(`runtime: S1UI.bottomSheet` · `null`) · `bottomSheetStateMatrix()` · `bottomSheetOptionStateMatrix()` · `stateMatrix()` 분기 2줄 · `guideComponents` 2개 · `mountGuide` 의 `bottom-sheet` 런타임 배선 |
| `assets/css/ui-library-guide.css` | 안내 화면 전용 4규칙 — `.is-preview` 눕히기 · `.uilg-bottom-sheet-action` · `.uilg-bottom-sheet-option-action` · `.uilg-bottom-sheet-option-cell` |
| `pages/components.html` | `comp-nav` 버튼 2개(`data-platforms="mobile"`, `disabled` 없음) + 빈 mount 2개 + 마커 주석 2개 |
| `registry/governance/component-presentation-policy.json` | `bottom-sheet` · `bottom-sheet-option` 항목 신설(둘 다 `managedBy: "ui-library-guide"`) |

**손으로 베낀 CSS·마크업 0건.** 시각·동작은 전부 `ui-library/dist` 가 그린다. 코드탭은 `mountGuide` 가 `dist/examples/*.html` 을 그대로 읽어 온다.
**정본에 없는 칸 3개(`checkbox:disabled`·`radio:disabled`·`list:selected`) 만들지 않음** — 안내 화면은 "정본에 없음", 검수 화면은 "정본에 없는 칸입니다 — 만들지 않았습니다".
**범위 밖 파일 무수정** — `ui-library/src` · `ui-library/dist` · `registry/components/*.json` · `workflow-state.json`.

---

## 2. 검사 결과 (종료코드 그대로)

| 명령 | 종료코드 |
|---|---|
| `npm run ui:guide:render` | **0** |
| `npm run ui:test` | **0** |
| `npm run gate:check` | **1** — error 14 · warning 18 |

**gate:check 의 14건은 내 변경 이전에 이미 있던 것이다.** 내 5개 파일을 `git stash` 로 뺀 상태에서 같은 명령을 돌려
**error 14 · warning 18 로 완전히 동일**함을 대조했다. 내 변경이 더한 게이트 오류 0건.
(기존 14건 = Gate 34 `uistate:bottom-sheet*` 5건 · Gate 46 ZIP·다운로드 화면 2건 · Gate 47 검수판 신선도 7건 — 전부 dist/배포 산출물 쪽이며 이 작업 범위 밖)

**Gate 19(변형 커버리지):** `component-page-coverage.json` 의 `excluded` 에 두 컴포넌트가 들어 있어 이 게이트가 아예 조준하지 않는다(58/58 검증 · 신규공백 0). 사양서가 걱정한 "없는 칸 3개 때문에 Gate 가 막는" 일은 일어나지 않았고, `data-cov-*` 는 사양서대로 선언해 두었다.

---

## 3. 실제 렌더 확인 (http · `file://` 아님)

서버 `http://127.0.0.1:4173` · 크롬 헤드리스 + 브라우저 실조작.

### 3-1. `pages/ui-review.html` — 전부 확인됨

| 확인 항목 | 결과 |
|---|---|
| 섹션 24·25 렌더 | ✅ Light·Dark 2벌 모두 그려진다 |
| 시트가 실제로 열리는가 | ✅ `시트 열기` → 열림, 초점이 시트 안으로 이동 |
| **Esc** 로 닫히는가 | ✅ 닫힘 |
| **어두운 배경(딤)** 으로 닫히는가 | ✅ 닫힘 |
| **닫기(X)** 로 닫히는가 | ✅ 닫힘 |
| 초점 복귀 | ✅ 열기 전 버튼으로 돌아옴 |
| 배경 스크롤 잠금 | ✅ 열릴 때 `hidden`, 닫으면 원복 |
| 푸터 3종이 다르게 보이는가 | ✅ None 은 아래 여백이 넓다(정본 40 vs 20), Single 1개, Dual 2개 |
| Option 9칸 보이고 없는 3칸 안 보이는가 | ✅ 9칸 렌더 · 3칸은 "정본에 없는 칸입니다" 안내만 |
| 고른 줄에 배경색 없음 | ✅ 파란 글자 + 오른쪽 체크만 |
| List 줄 아이콘 | ✅ Default=chevron, Disabled=lock(둘 다 보임 — 마스크 404 아님) |
| Light·Dark 가독 | ✅ 양쪽 모두 읽힘 |
| **페이지 전체 중복 `id`** | ✅ **0개** (라디오만이 아니라 `[id]` 전수 세어 확인) |
| 콘솔 오류 | ✅ **0건** (이 페이지 자체 로드분) |

### 3-2. §7 퇴행 없음 — 실측으로 확인

date-picker·time-picker 검수 칸의 시트 껍데기 계산값을, **속성을 잠깐 떼었다 되돌리는 A/B** 로 측정했다(페이지만 만지고 파일 무수정, 원상복구 확인됨).

| 계산 속성 | §7 **적용 후** | 속성을 뗐을 때(= 고치기 전 상태) |
|---|---|---|
| `position` | `fixed`(라이브) / `relative`(정적 표본) | `static` ← 껍데기 통째로 빠짐 |
| 패널 배경 | `rgb(255,255,255)` (`surface/raised`) | `rgba(0,0,0,0)` 투명 |
| 패널 `gap` | **32px** (date/time picker 정본 값) | `normal` |
| 위 모서리 반경 | **8px** | `0px` |
| `max-width` | **360px** | `none` |
| 세로 패딩 | **20px** | `0px` |
| 그림자 | **none** (date/time picker 정본 값) | none |

→ 이관으로 빠졌던 껍데기가 정확히 되살아났고, **`--s1-bottom-sheet-gap: 32` · `--s1-bottom-sheet-shadow: none` 두 손잡이가 실제로 먹어** 독립 Bottom Sheet(48 · raised-up)와 다르게 그려진다. 1-inventory §4 의 이관 전 값과 일치한다.

---

## 4. 막힌 것 — 안내 화면(`pages/components.html`)은 아직 안 그려진다 ⚠️

**증상:** 두 섹션 자리에 빨간 안내만 뜬다.

```
Bottom Sheet 승인 배포본을 불러오지 못했습니다:
bottom-sheet 배포 상태가 verified 또는 approved가 아닙니다.
```

**원인:** `ui-library/dist/components/bottom-sheet(.option).manifest.json` 의 `status` 가 **`draft`** 다.
`assets/js/ui-library-guide.js` 의 `mountGuide` 는 `approved`·`verified` 만 마운트한다(다른 25종은 전부 그 둘 중 하나).

**내가 고치지 않은 이유:** ① dist 는 이 작업의 범위 밖이다 ② 상태 게이트를 느슨하게 고치는 것은 검사 약화라 임의로 못 한다(하드룰 H6②). 스킬 흐름상 `draft → verified` 승격은 **4-verification** 단계의 일이다.

**그래서 §5 중 이 두 줄은 아직 미확인이다:**
- 안내 화면 Action 칸의 시트가 실제로 열리고 Esc·딤·X 로 닫히는가
- 안내 화면 상태 칸 3종·Option 9칸이 보이는가

같은 마크업·같은 dist·같은 런타임 배선을 쓰는 `pages/ui-review.html` 에서는 **위 전부가 확인됐다**(§3-1). 다만 그것이 안내 화면의 확인을 대신하지는 않는다.

**해소 방법:** 두 manifest 의 `status` 가 `verified` 가 되면 코드 변경 없이 그대로 그려진다.

### 덧 — 미계측이 통과가 아닌 자리 2곳 (함정 T6)

| 검사기 | 무엇을 못 봤나 |
|---|---|
| `ui:guide:render` | `dist/manifest.json` 에서 `approved`·`verified` 만 골라 돈다 → **두 컴포넌트를 통째로 건너뛴다.** 초록(25종 통과)이지만 이 둘은 검사된 적이 없다 |
| Gate 23 | `managedBy: "ui-library-guide"` 를 붙여 위반이 아니라 **미계측**으로 빠진다. Action 영역 존재는 렌더로 직접 봐야 하는데, 위 상태 문제로 **안내 화면에서는 아직 못 봤다**(검수 화면에서는 봤다) |

---

## 5. 판정하지 않은 것

- 합격/PASS 판정 — 4-verification 소관
- 정본 수치 대조(간격·색·타이포의 원본 충실성) — `component-verifier` 시나리오 F 소관
- `ui-library/dist` 자체의 정확성 — 3-build 에서 이미 다뤘고 이 문서 범위 밖
