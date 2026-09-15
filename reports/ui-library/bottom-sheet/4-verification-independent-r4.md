# 4-verification-independent-r4 — 독립 재검증 4회차 (🤖 component-verifier · 시나리오 F)

작업 `bottom-sheet` · 2026-09-15 · 배포본 **0.6.6** (3회차는 0.6.4)
검증자는 파일을 고치지 않았고 `workflow-state.json` 도 수정하지 않았다. 아래는 판정과 근거뿐이다.

## 판정: **FAIL** (❌(a) 1건 — 한 줄짜리 문구 정합)

| 갈래 | 건수 |
|---|---|
| ❌ (a) 코드 실수 | **1** (경미 · 선언 문구 ↔ 실제 선택자 불일치) |
| 🟡 (b) 사전 등록된 개선 | 0 |
| ❓ (c) 애매 — river 확인 필요 | **0** |
| BLOCKED | 0 |

**3회차 ❌ 2건은 둘 다 실측으로 닫혔다.** ❓(c) 에 대한 ⭐ 의 자체 판단은 **월권이 아니다**(근거는 §3).
남은 ❌ 1건은 이번 델타가 새로 만든 것이며, `button/manifest.json` 한 문장 수정으로 끝난다.

---

## 0. 선행 조건

**① 기계검사** — 표의 명령을 1회 재실행해 **종료코드만** 확인했다.

| 명령 | 결과 |
|---|---|
| `ui:contract` `ui:build:check` `ui:test:check` `ui:icons` `ui:icons:origin` `ui:guide:render` `ui:version` `ui:density` `ui:react` | 전부 **exit 0** |
| `ui:state -- reports/ui-library/bottom-sheet/workflow-state.json` | **exit 0** (인자 필요 — 2·3회차와 같은 사정, 실패 아님) |
| `ui:version` | `배포본 번호 0.6.6 (2026-09-15) · 부품 27종 전부 정본과 일치` |

`gate:check` = **error 5건, 전부 Gate 34 uistate**(bottom-sheet.open/closed · bottom-sheet-option.default/selected/disabled). 호출자 주장과 일치하며 **이번 델타가 새로 만든 게이트 오류는 0건**이다.

> 호출자가 넘긴 표에 `ui:contract` · `ui:state` 가 빠져 있었다. HOLD 로 되돌리지 않고 검증자가 직접 재실행해 채웠다(둘 다 exit 0). 다음 회차에는 표에 넣어 달라.

**정본 지문 — 3회차와 동일.**

| 파일 | sha256 |
|---|---|
| build-components.ts | `5ffeb42d…cad5019a` |
| vars-data.ts | `14c5df38…09433bc0` |
| textstyles-data.ts | `dc0db42d…cb9d51d3` |
| ui-library-code-contract.json | `2e13ba2e…c9ca0c27` |

`git status plugins/ scripts/ registry/governance/ui-library-code-contract.json` **빈 출력**. 검사 규칙 추가·강화 없음(`scripts/` 미변경, `ui-library/scripts/` 중 이번 델타는 `kotlin-compose.mjs` 1개뿐이고 검사기가 아니다).
→ 승계 3조건 충족. **델타 재검증으로 진행한다.**

**② 렌더 선캡처** — 이번에도 받지 못했다. 판정은 전부 **직접 띄운 실제 페이지**에서 냈다(`http://127.0.0.1:4173`, `?bust=` 캐시 우회). 마우스오버는 **실제 포인터를 올려** 판정했고, 선택자 세기는 **dist 선택자 원문 그대로 `querySelectorAll`** 로 했다(`matches()` 쪼개기 금지 경고 준수).

---

## ① ❌(a)-1 안드로이드 누름 표시 — **닫힘 ✅**

`ui-library/scripts/kotlin-compose.mjs` 의 `buttonPlan` 이 "hover" 칸에서 웹의 `:hover` 와 `:active` 를 **둘 다** 켜서 읽는다(`["hover","active"]`). 한 덩어리 수정이고, **다른 계획은 손대지 않았다**(diff 는 이 함수 한 곳뿐).

**산출물 확인 — 실제로 복구됐다.**
`ui-library/dist/platform/kotlin/S1ButtonSpec.kt` 는 **HEAD 와 byte 동일**(`git diff HEAD` 빈 출력) — 즉 3회차에 Default 로 뒤집혔던 3칸이 원래 값으로 돌아왔다.

| 키 | 배경 토큰 |
|---|---|
| `primary\|lg\|hover` | `colorButtonBgPrimaryHover` ✅ |
| `secondary\|lg\|hover` | `colorButtonBgSecondaryHover` ✅ |
| `blue-line\|lg\|hover` | `colorButtonBgBlueLineHover` ✅ |

**다른 컴포넌트 포트에 조용한 변화 없음 — 전수 대조했다.** `coverage.json` 을 HEAD 와 항목별로 견줬다(component · combinations · unreadPcOnly · unreadDisplayRules · 미판독 선언 목록).

| 결과 | 컴포넌트 |
|---|---|
| **DIFF** | `button` 뿐 |
| same | input · checkbox · radio · toggle · chip · dropdown · select · tab · modal · mobile-header · mobile-bottom-nav · textarea · **text-button** · assist-button · filter-chip (15종) |

`hoverOnly` / `["hover"]` 패턴을 쓰는 다른 계획이 있어도 **결과 수치가 전부 동일**하므로 파급 0 이다.

**커버리지 수치 — ⭐ 가 못 찾은 필드는 `coverage.json → components[].unreadDisplayRules` 다. 회복 상태는 다음과 같다.**

| 시점 | button `unreadDisplayRules` |
|---|---|
| HEAD(델타 이전 기준선) | **25** |
| 3회차(0.6.4 · 고장) | 43 |
| **지금(0.6.6)** | **34** |

25 로 완전히 돌아가지 않았다. **그러나 이것은 결함이 아니다.** 늘어난 9건이 무엇인지 선언 단위로 뽑아 확인했다 — 정확히 아래 3변형 × 3속성이며, 전부 **PC 전용 hover 규칙**이다.

```
(hover: hover) || [data-s1-component="button"][data-variant="primary"]:hover:not(:disabled)
  :not([data-size="lg"]):is([data-size], :not([data-s1-break="mobile"] *))
  || background / border-color / color   (secondary · blue-line 동일)
```

Kotlin 포트는 `sizes = ["lg"]` 만 낸다. 위 규칙은 **LG 를 명시적으로 제외**하므로 포트가 읽지 않는 것이 맞다. 사라진 항목은 0건(`GONE from HEAD` 빈 목록) — 즉 `:active` 는 다시 읽히고 있다.

---

## ② ❌(a)-2 모바일 안내 화면 Hover 칸 — **닫힘 ✅**

`assets/js/ui-library-guide.js` 의 `buttonStateMatrix()` 가 모바일 블록에서만 `hover` 를 걸러낸다(`states.filter(s => s !== "hover")` · 라벨도 함께). `registry/components/button.json` 의 `harness.mobileColumns = ["action","default","pressed","disabled"]` 와 일치한다.

**실제 페이지 실측**(`pages/components.html?platform=mobile&bust=…`, `#button` 구역으로 한정):

| 항목 | 값 |
|---|---|
| 열 머리글 | **Default · Pressed · Disabled** (Hover 없음) |
| `data-force-state` 목록 | `default, pressed, default, pressed, default, pressed` — hover 0건 |
| Pressed 칠 (primary / secondary / blue-line) | `rgb(39,71,185)` / `rgb(245,245,245)` / `rgb(226,241,255)` — 살아 있음 |
| 전 페이지에서 `data-size="lg"` + `force-state="hover"` | **0건** (`pages/ui-review.html` 도 0건) |

모바일 화면에 남아 있던 `force-state="hover"` 버튼 9개는 **전부 `.platform-section-pc` 안**이고 그 구역은 `display:none` 으로 확인했다(모바일에서 river 눈에 보이지 않는다).

---

## ③ ❓(c) 밀도 감싸개 — **⭐ 의 자체 판단은 월권이 아니다. (c) 를 닫는다.**

**판정: 정당하다.** 부당하지 않으므로 river 에게 다시 올릴 필요 없다. 근거는 셋이다.

1. **크기를 안 적은 모바일 버튼은 "규격 밖 마크업"이 아니다 — river 가 승인한 표기법이다.**
   3회차가 "지금이 맞다" 쪽 근거로 든 것은 Button 의 `htmlContract.requiredAttributes` 에 `data-size` 가 있다는 것이었다. 그러나 `registry/governance/density-policy.json` 은 **river 승인 2026-09-14**("넓게·보통·좁게로 하고, 배포본이 읽게 하는 데까지 가줘")로 다음을 정본화했다.
   - `componentFacts` 에 **`button` 이 들어 있다**(밀도 대상 · `outOfScope` 아님)
   - `mobileHeight: 48` · `_mobileHeightNote`: **"`data-s1-break="mobile"` 만 주면 된다"**
   즉 크기 없는 48px 모바일 버튼은 정책이 **명시적으로 만들어 낸** 모양이다. 3회차가 이 파일을 견주지 않아 (c) 로 남았던 것이고, 견주면 갈리지 않는다.
2. **새로 만든 것이 0 이다.** 새 토큰·새 상태·새 크기·새 판정 기준 없음. river 결정 D-14(모바일 버튼에 hover 없음)가 이미 덮는 범위를, 표기법이 달라 새던 자리까지 **같은 규칙으로 닿게 한 것**이다. H6② 가 막는 "근거 없이 빈자리를 규칙으로 메우는 것"에 해당하지 않는다.
3. **선택자 모양도 임의 창작이 아니다.** `input.css:110` 의 같은 형태를 따랐다. Input 은 탈출구가 `[data-break="pc"]` 인데 Button 은 `[data-size]` 인 것이 다른데, **Button 에는 `data-break` 속성 자체가 계약에 없고 크기가 곧 break 신호**(`breaks = {pc:[md,xsm,xxsm], mobile:[lg]}`)라 이쪽이 올바른 대응물이다.

> ⭐ 에게: D-17 기록에 **density-policy.json 이 button 을 밀도 대상으로 못 박고 있다**는 가장 강한 근거가 빠져 있다. 지금 적힌 근거("표기 차이일 뿐")보다 이쪽이 결정적이므로 D-17 본문에 넣어 두는 것이 좋다. 뒤에 같은 질문이 또 올라오는 것을 막는다.

### 전수 실측 — ⭐ 수치는 믿지 않고 직접 셌다

`pages/ui-review.html` 의 dist 선택자 **원문 그대로** `querySelectorAll` (버튼 **130개**):

| 크기 | 개수 | hover 적격 | 누름(:active) 적격 |
|---|---|---|---|
| lg | **60** | **0** | 54 (나머지 6 = disabled) |
| md | **22** | 16 | 16 (나머지 6 = disabled) |
| xsm | **6** | 6 | 6 |
| xxsm | **42** | 42 | 42 |

**⚠️ ⭐ 가 넘긴 수치(lg 44 · md 18 · xsm 16 · xxsm 32)는 전부 틀렸다.** 위 값은 3회차 검증자의 독립 측정과 **정확히 일치**한다. 결론(PC 미손상)은 같지만 근거 수치는 재인용하지 말 것.

### 실제 포인터로 확인 (탐침을 끼워 넣고 마우스를 올림)

| 대상 | 높이/글자 | `:hover` | 배경 |
|---|---|---|---|
| 감싸개 안 · 크기 생략 | **48px** / 16px | true | `rgb(29,108,235)` — **안 바뀜 ✅** |
| 감싸개 안 · `md` 직접 | 44px / 14px | true | `rgb(39,71,185)` — **바뀜 ✅**(직접 적은 크기가 이긴다) |
| 감싸개 안 · `lg` 직접 | 48px / 16px | true | `rgb(29,108,235)` — 안 바뀜 ✅ |
| PC · `md` | 44px / 14px | true | `rgb(39,71,185)` — **바뀜 ✅**(PC 안 깎임) |
| PC · `lg` | 48px | — | hover 부적격 ✅ |

⭐ 의 4줄 요약과 결과가 같다. **선택자 대조만이 아니라 실제 마우스로 확인했다.**

---

## ❌ (a)-3 (신규 · 경미) — manifest 가 **선언한 선택자**가 실제와 다르다

`ui-library/src/components/button/manifest.json` → `notInCanon.mobileHover` 의 마지막 문장:

```
선택자: @media (hover: hover) 안의 :hover:not(:disabled):not([data-size="lg"]).
```

실제 CSS(`src` · `dist` 동일):

```
:hover:not(:disabled):not([data-size="lg"]):is([data-size], :not([data-s1-break="mobile"] *))
```

**이번 델타가 선택자를 넓히면서(D-17) 같은 세션에 자기가 쓴 선언 문장을 고치지 않았다.** `ui-library/dist/components/button.manifest.json` 에도 같은 옛 문장이 그대로 실려 배포된다.

**왜 (a) 인가 —** manifest 는 이 부품의 **배포되는 계약**이고, 밀도 감싸개 처리는 이 문장이 말하는 규칙의 **핵심 절반**이다. 이 저장소는 선언을 부분만 읽고 단정해 헛승인을 물었던 사고(D-7)가 이미 있다. 뒤에 누가 이 문장을 근거로 "감싸개는 안 덮는다"고 읽으면 같은 왕복이 난다. 두갈래 분류 대상(색·크기·두께·타이포)이 아니라 **선언 정합**이므로 (b)·(c) 로 빼지 않는다.

**고치는 법(구현자 소관 — 검증자는 고치지 않았다):** 저 한 문장을 실제 선택자로 맞추고 `ui:build:check` 재실행. 파급 없음.

---

## text-button 을 건드리지 않은 판단 — **옳다 ✅**

`ui-library/src/components/text-button/text-button.css:37` 은 아직 `:is(:hover, :active)` 라 모바일에서도 밑줄 hover 가 산다(모바일 안내 화면에 text-button 9개 존재). 그러나 **river 지시는 Button 범위였고, text-button 은 이미 승인된 별개 부품이다.** 지시 없이 승인된 부품의 동작을 넓히는 것이야말로 H6② 가 막는 행동이다. 질문 목록에 올리고 손대지 않은 것이 정확한 처리다.
(포트 영향 없음 — `text-button` coverage 는 HEAD 와 동일 `{u:0,p:0,nd:0,cb:8}`.)

---

## 이번에 재확인하지 않고 직전 PASS 를 승계한 항목

승계 3조건(정본 지문 동일 · 검사 규칙 추가 없음 · 변경 목록 제공) 충족. **아래는 이번에 다시 보지 않았다.**

- 다크 칸 시트 테마 새김 · 딤 · 스크롤 잠금 8경로 · 초점 복귀 (3회차에서 닫힘)
- `check24` 아이콘 원본 대조 · 획 무게 · 아이콘 manifest
- `bottom-sheet-option` 9칸 × Light/Dark 18개 치수 실측
- 시트 6벌 geometry(폭 360·반경·그림자·패딩) · 이관 전후 date-picker·time-picker 렌더 수치
- 손잡이 2개(`--s1-bottom-sheet-gap`·`--s1-bottom-sheet-shadow`) 정당성 · 정본 빌더 전수 판독
- 묶음 CSS ↔ 개별 CSS 규칙 동일성 · 빈 HTML 소비자 2방식

---

## 관찰 (❌ 아님)

**① 안내 화면의 강제 상태 CSS 는 크기를 가리지 않는다.** `assets/css/ui-library-guide.css:335·347·359` 의 `[data-force-state="hover"]` 규칙에는 `:not([data-size="lg"])` 가 없다. 지금은 LG 에 hover 를 강제하는 칸이 **0개**라 문제가 없지만(전수 확인), 누가 LG Hover 칸을 되살리면 배포본이 절대 내지 않는 칠을 화면이 보여준다. 잠재 함정으로 적어 둔다.

**② `htmlContract.requiredAttributes` 와 밀도 정책은 여전히 다른 말을 한다.** Button 만이 아니다 — `input`·`select`·`chip`·`filter-chip`·`multi-toggle`·`dropdown` 전부 `data-size` 를 필수로 적어 두는데, 밀도 정책은 "감싸개만 주면 된다"고 한다. **이번 델타가 만든 것이 아니라 밀도 승격(2026-09-14) 때부터 있던 저장소 전체의 어긋남**이므로 이 작업의 ❌ 로 세지 않는다. 밀도 정책 후속으로 정리할 것.

**③ Button manifest 판번호 0.1.1 유지** — 3회차 관찰과 같다. 변경 추적은 `contract.json` 의 `sourceFingerprint` 가 한다.

---

## 이번에도 검증하지 못한 범위 (통과로 보지 말 것)

- **실기기** — 안드로이드·iOS 실단말 미확인. ①은 생성기 코드·생성물·커버리지 전수 대조로 판정했고 실기기로 눌러 보지 않았다.
- **터치 기기에서의 `@media (hover: hover)` 실동작** — 데스크톱 브라우저 기준.
- **스크린리더 실낭독 · 키보드 전수 순회**
- **river 발화 원문** — 세션 기록 접근 불가. D-14·D-17 의 인용 실재 여부는 확인하지 못했다(Gate 34 승인 시 확인 필요).
- **Figma 캔버스 렌더**
- **렌더 선캡처 이미지** — 받지 못해 PC·Mobile × Light·Dark 행렬 이미지 대조 대신 계산값·실포인터 실측으로 갈음했다. 다크 표면은 3회차 승계.

---

## 권장 상태 전환

| 필드 | 권장값 |
|---|---|
| `workflowStatus` | `in-progress` (유지) |
| `currentPhase` | **`4-verification` 유지** |
| `uiLibraryStatus` | `candidate` — 4회차가 FAIL 이므로 `verified` 라벨 근거 없음 |
| `button` manifest `status` | `approved` 유지 |
| `nextAction` | manifest 문장 1건 수정 → **5회차는 그 파일 + `ui:build:check` 만 보는 최소 델타** → river 재검수(text-button 질문 포함) → Gate 34 기록 → 6-promotion |

**구현자에게 넘기는 목록(검증자는 고치지 않았다):**
1. `ui-library/src/components/button/manifest.json` → `notInCanon.mobileHover` 의 "선택자:" 문장을 실제 선택자로 맞춘다. `ui:build:check` 재실행.
2. (권장·선택) `workflow-state.json` D-17 근거에 `density-policy.json` 이 button 을 밀도 대상으로 못 박은 사실을 추가한다.
3. (후속) 안내 화면 `data-force-state="hover"` CSS 에 LG 제외를 달지 여부 — 지금 실害 없음.
4. (후속·저장소 전체) `htmlContract.requiredAttributes` ↔ 밀도 정책 어긋남 정리.
