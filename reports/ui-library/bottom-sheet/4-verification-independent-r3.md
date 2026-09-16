# 4-verification-independent-r3 — 독립 재검증 3회차 (🤖 component-verifier · 시나리오 F)

작업 `bottom-sheet` · 2026-09-15 · 배포본 **0.6.4** (2회차는 0.6.3)
검증자는 파일을 고치지 않았고 `workflow-state.json` 도 수정하지 않았다. 아래는 판정과 근거뿐이다.

## 판정: **FAIL**

| 갈래 | 건수 |
|---|---|
| ❌ (a) 코드 실수 | **2** |
| 🟡 (b) 사전 등록된 개선 | 0 |
| ❓ (c) 애매 — river 확인 필요 | **1** |
| BLOCKED | 0 |

river 지적 **②(다크 칸 테마)는 완전히 닫혔다** — 실측으로 확인했다.
river 지적 **①(모바일 LG 버튼 hover 제거)은 웹 CSS 에서는 정확히 됐고 PC 는 깎이지 않았다.** 다만 그 변경의 **파급 두 곳이 따라오지 않아** ❌ 2건이 남는다. 둘 다 이 델타가 만든 것이다.

---

## 0. 선행 조건

**① 기계검사** — 표의 9개 명령을 1회 재실행해 종료코드만 확인했다.

| 명령 | 결과 |
|---|---|
| `ui:contract` `ui:build:check` `ui:test:check` `ui:icons` `ui:icons:origin` `ui:guide:render` `ui:version` `ui:density` | 전부 **exit 0** |
| `ui:state` | 인자 없이는 **exit 1**(`❌ workflow-state.json 경로가 필요합니다`). 경로를 주면 exit 0 — 2회차와 같은 사정이며 실패가 아니다 |
| 추가로 돌린 것 (표 밖) | `ui:react` exit 0 · `ui:runtime` exit 0(22종 failed=0) |

`gate:check` = **error 5건, 전부 Gate 34 uistate**(bottom-sheet.open/closed · bottom-sheet-option.default/selected/disabled). 호출자 주장과 일치하며 **이번 Button 변경이 새로 만든 게이트 오류는 없다.**

**정본 지문 — 2회차와 동일.** `git status plugins/ scripts/ ui-library-code-contract.json` 빈 출력.

| 파일 | sha256 |
|---|---|
| build-components.ts | `5ffeb42d…cad5019a` |
| vars-data.ts | `14c5df38…09433bc0` |
| textstyles-data.ts | `dc0db42d…cb9d51d3` |
| ui-library-code-contract.json | `2e13ba2e…c9ca0c27` |

**검사 규칙 추가·강화 없음** — `scripts/` 미변경, `ui-library/scripts/` 2개는 수정 시각 12:06 으로 델타(13:44~14:54) 이전.
→ 승계 3조건 충족. **델타 재검증으로 진행한다.**

**② 렌더 선캡처** — 받지 못했다. 판정은 전부 **직접 띄운 실제 페이지**에서 냈다(`http://127.0.0.1:4173`, `?bust=` 로 캐시 우회). 마우스오버는 **실제 마우스 포인터를 올려서** 판정했다(선택자 대조만으로 끝내지 않았다).

---

## river ① 모바일 LG hover — 웹 CSS 자체는 ✅

**PC 는 깎이지 않았다.** `ui-review.html` 의 버튼 130개를 전수 실측했다(⭐ 수치를 받지 않고 직접 셌다 — 결과는 우연히 같다).

| 크기 | 개수 | hover 적격 | 누름 적격 | disabled |
|---|---|---|---|---|
| md | 22 | **16** | 16 | 6 |
| xsm | 6 | **6** | 6 | 0 |
| xxsm | 42 | **42** | 42 | 0 |
| lg | 60 | **0** | 54 | 6 |

md 에서 빠진 6개는 **전부 disabled** 다(`:not(:disabled)` 가 원래 막던 것). PC 과잉 삭제 0.

**실제 마우스로 확인:**
- PC 크기(xxsm primary) 위에 포인터 → 배경 `rgb(29,108,235)` → **`rgb(39,71,185)`** 로 바뀜. PC hover 살아 있음 ✅
- LG(시트 푸터 "적용") 위에 포인터 → `:hover` 는 true 인데 배경 **`rgb(29,108,235)` 그대로**. LG hover 없음 ✅

선택자 캐스케이드도 확인했다 — `:hover` 규칙이 `:not([data-size="lg"])` 로 (0,5,0) 이 되어 기존 (0,4,0) 보다 세지만, 이 파일에서 그 자리를 다투는 다른 규칙이 없다. `:disabled` 는 별도 규칙이고 상태 규칙 전부 `:not(:disabled)` 를 달고 있다.

정본 대조: `registry/components/button.json` 의 `size.mobile = [lg]` · manifest `breaks = {pc:[md,xsm,xxsm], mobile:[lg]}`. **LG 는 계약상 모바일 전용**이므로 "PC 자리의 LG 를 잃었다"는 손실은 발생하지 않는다.

**그런데 아래 ❌ 2건이 이 변경에서 따라 나왔다.**

---

## ❌ (a)-1 안드로이드(Kotlin) 버튼이 **누름 표시를 통째로 잃었다**

가장 무거운 건이다. 웹에서는 "누름(:active)은 전 크기 유지"라고 정해 놓고, **같은 배포본의 안드로이드 몫에서는 그 누름이 사라졌다.**

근거는 세 조각이 맞물린다.

1. **생성기가 누름을 hover 칸에 담는다.** `ui-library/scripts/kotlin-components.mjs:88-92`
   ```
   val pressed by interactionSource.collectIsPressedAsState()
   val state = when { !enabled -> "disabled"; hovered || pressed -> "hover"; else -> "default" }
   ```
   그리고 `.clickable(..., indication = null, ...)` — 리플(파문) 효과도 끈다. 즉 **누름의 시각 피드백은 오직 `…|hover` 칸의 값뿐이다.**
2. **그 칸이 이번에 Default 색으로 바뀌었다.** `ui-library/dist/platform/kotlin/S1ButtonSpec.kt` 의 git diff — `primary|lg|hover` · `secondary|lg|hover` · `blue-line|lg|hover` 3개 모두 `…Hover` → `…Default` 로 교체됐다. Kotlin 산출물은 `sizes = listOf("lg")` 뿐이라 **안드로이드 버튼 전량**이다.
3. **왜 그렇게 됐는지도 기계가 적어 뒀다.** `dist/platform/kotlin/coverage.json` 의 button 항목에서 `unreadDisplayRules` 가 **25 → 43** 으로 늘고, 새로 "읽지 않음"이 된 선택자가 정확히 이것들이다.
   ```
   [data-s1-component="button"][data-variant="…"]:active:not(:disabled)
   @media (hover: hover) …:hover:not(:disabled):not([data-size="lg"])
   ```
   포트 생성기는 `:active` 를 원래부터 읽지 않는다(`display-rule`). 전에는 `:is(:hover,:active)` 한 덩어리였기에 hover 칸이 그 칠을 대신 날라 줬는데, 둘로 쪼개면서 **양쪽 다 포트에서 사라졌다.**

**결과:** 안드로이드에서 버튼을 눌러도 아무 변화가 없다. 웹의 결정("누름은 전 크기 유지")과 **정반대**다.
Swift·C++ 은 토큰만 있고 버튼 사양이 없어 영향 없음. React·Vue 는 CSS 를 그대로 쓰므로 웹과 동일(`ui:react` exit 0).

이 실패는 어떤 기계검사도 잡지 못한다 — `ui:build:check` 는 "재생성 결과가 작업 트리와 같은가"만 보므로 **틀린 값이 그대로 굳어도 초록**이다.

> 참고: 다른 작업 폴더(`.claude/worktrees/river-decisions/`)의 kotlin 생성기도 같은 매핑이라 거기서 고쳐지고 있는 중인 것도 아니다(85~95줄 동일).

---

## ❌ (a)-2 모바일 안내 화면이 **없어진 Hover 를 아직 보여준다**

`pages/components.html?platform=mobile` 의 Button 상태표에 **DEFAULT · HOVER · PRESSED · DISABLED** 네 칸이 그대로 있고, HOVER 칸의 LG 버튼 3개가 `data-force-state="hover"` 로 **`rgb(39,71,185)`** 칠을 하고 있다(실측·스크린샷 확인). 실제 배포본은 그 칠을 절대 내지 않는다.

여기엔 **이미 정해진 답이 있다.** `registry/components/button.json` 의
```
"mobileColumns": ["action", "default", "pressed", "disabled"]
```
— 모바일 표에는 Hover 칸을 두지 말라고 **2026-05-11 부터** 적혀 있다. 그런데 `assets/js/ui-library-guide.js` 의 `buttonStateMatrix()` 는 모바일 블록에서도 `states = ["default","hover","pressed","disabled"]` 를 하드코딩한다(340~420줄 부근).

registry 의 표출 메타는 **정본에 대응물이 없는 영역이라 registry 가 기준**이다(CLAUDE.md §정본). 즉 파생(안내 화면)을 고치는 쪽이 맞다.

**이 어긋남 자체는 이번 델타 이전부터 있었다**(오래된 부채). 다만 전에는 "코드에는 있는데 registry 가 숨기라고 한 상태"였고, 지금은 **코드에도 없고 registry 도 숨기라는데 화면만 보여주는 상태** — 즉 river 가 검수에서 보게 될 화면이 **사실과 다른 것을 말한다.** 그래서 이번에 ❌ 로 센다.

같은 집 관례도 있다 — Select·Dropdown 은 Hover 칸에 "검수 표시" 꼬리표를 단다. Button 모바일 표에는 그 꼬리표조차 없다.

---

## ❓ (c) "모바일 버튼"이 **`data-size="lg"` 하나만 뜻하나?** — river 확인 필요

이번 규칙은 `:not([data-size="lg"])` 로만 좁혔다. 그런데 어제 승격한 밀도(density)에는 **크기를 안 적는 모바일 표기법**이 따로 있고, 그 표기로 만든 48px 버튼은 **여전히 마우스오버 칠을 한다.**

실제 마우스로 확인했다 — `ui-review.html` 에 다음을 끼워 넣고 포인터를 올렸다.
```html
<div data-s1-break="mobile">
  <button type="button" data-s1-component="button" data-variant="primary">…</button>
</div>
```
높이 **48px** · 글자 16px(= 모바일 버튼 그대로)인데 배경이 `rgb(29,108,235)` → **`rgb(39,71,185)`** 로 바뀐다. 근거는 `dist/components/button.css` 의 밀도 블록이 `[data-s1-break="mobile"] [data-s1-component="button"]:not([data-size])` 로 48px 을 주는데, 새 hover 규칙은 `data-size` 가 **아예 없는** 그 버튼을 걸러내지 못하기 때문이다.

판정이 갈리는 이유를 그대로 적는다 — **내가 임의로 정하지 않는다.**
- **"고쳐야 한다" 쪽:** button.css 주석과 manifest 가 근거로 든 **Input 선례는 이 경우를 막는다** — `input.css:110` 은 `:not([data-break="mobile"])` 에 더해 `:not([data-s1-break="mobile"] *)` 까지 달았다. Button 은 그 선례의 절반만 베꼈다. 게다가 밀도는 river 승인으로 **권장 표기법**이 된 길이다.
- **"지금이 맞다" 쪽:** Button 의 `htmlContract.requiredAttributes` 는 `data-size` 를 **필수**로 못 박는다. 그러면 크기 없는 버튼은 애초에 규격 밖 마크업이고, Button 의 모바일 표기는 `lg` 하나뿐이다.

즉 **밀도 정책과 Button html 계약이 서로 다른 말을 하는 자리**이고, 이번 규칙이 그중 한쪽을 조용히 고른 셈이다. 이건 (b) 로 빼면 안 되는 애매함이라 (c) 로 올린다.

곁가지 하나(같은 결정에 딸린 범위 질문): `text-button.css:37` 은 아직 `:is(:hover, :active)` 라 모바일에서도 마우스오버가 산다. river 의 "모바일 버튼에는 호버 없게"가 **Button 컴포넌트만**인지, **모바일에 나오는 버튼 전부**인지도 같이 정해 주면 뒤에 같은 왕복이 없다.

---

## river ② 다크 칸 시트 — **닫힘 (실측 확인)**

진단(배포본의 `body` 직계 배치 계약 ↔ 검수 화면의 칸 단위 `[data-theme]`)은 **맞다.** 검수 화면은 테마를 `:root` 가 아니라 `.review-panel[data-theme]` 로 씌우고, `html`·`body` 에는 `data-theme` 이 없다(실측: 둘 다 `null`). 그러니 `body` 로 옮기는 순간 테마 밖으로 나가는 게 맞다.

고친 뒤 동작을 직접 열어서 쟀다 — **라이트 → 다크 → 라이트 순서로 반복**해 "앞서 새긴 테마가 남는" 함정까지 봤다.

| 연 칸 | 시트에 새겨진 테마 | 패널 배경 | 제목 색 | 패널 폭 |
|---|---|---|---|---|
| Light | `light` | `rgb(255,255,255)` | `rgb(0,0,0)` | 360 |
| Dark | `dark` | `rgb(28,29,35)` | `rgb(236,237,240)` | 360 |
| Light (다크 다음) | `light` | `rgb(255,255,255)` | `rgb(0,0,0)` | 360 |

딤도 정상이다 — 옮겨진 시트의 backdrop 이 `1024×768` 전면에 `rgba(0,0,0,0.75)`, host 는 `position:fixed; inset:0; z-index:1000`.

**modal·modal-content 를 함께 건드린 것은 정당하다.** 바꾼 것은 **검수 화면(`pages/ui-review.html`) 배선뿐**이고, 승인된 컴포넌트 소스는 손대지 않았다 — `git status ui-library/src/components/modal ui-library/src/components/modal-content` **빈 출력**. 다크 칸에서 연 modal-content 2곳도 실측 결과 `data-theme="dark"` · 패널 `rgb(28,29,35)` 로 제대로 뜬다.

**부수 피해도 없다.** 시트·모달을 10회 넘게 여닫은 뒤 `html`·`body` 인라인 `overflow` 가 **둘 다 빈 문자열** — 2회차에 닫은 스크롤 잠금 잔류가 되살아나지 않았다.

규칙을 `htmlContract.relations` 에 적은 것도 확인했다(마지막 항목에 modal 계열도 같은 처리가 필요하다고 명시). `notInCanon.scopedThemePlacement` 로 "새 토큰·새 상태 0건"도 선언돼 있다. dist 코드·토큰 변경 0건 주장은 `ui:build:check` exit 0 + `git diff` 로 확인했다(dist 변경은 재생성분과 판번호뿐).

---

## 이번에 재확인하지 않고 2회차 PASS 를 승계한 항목

승계 3조건(정본 지문 동일 · 검사 규칙 추가 없음 · 변경 목록 제공)을 충족해 승계한다. **아래는 이번에 다시 보지 않았다.**

- 스크롤 잠금 8경로 실입력 재현 · `close` reason · 초점 복귀 (여닫기 반복 뒤 잠금 해제만 재확인)
- `check24` 아이콘 원본 대조·획 무게 · 아이콘 manifest
- `bottom-sheet-option` 9칸 × Light/Dark 18개 치수 실측
- 시트 6벌 geometry(폭 360·반경·그림자·패딩) · 이관 전후 date-picker·time-picker 렌더 수치
- 손잡이 2개(`--s1-bottom-sheet-gap`·`--s1-bottom-sheet-shadow`) 정당성 · 정본 빌더 전수 판독 · 없는 칸 3개 grep
- 묶음 CSS ↔ 개별 CSS 규칙 동일성

---

## 관찰 (❌ 아님)

**① 검수 화면에서 시트를 열면 옆 칸의 표본 시트들이 딤 위로 뜬다.** 칸 안의 표본은 `position:relative; z-index:1000` 이라 전면 딤과 같은 층에서 다툰다. 실제 배포본 동작이 아니라 검수 하네스의 표시 문제이고, 이번 델타가 만든 것도 아니다.

**② modal·modal-content manifest 에는 「테마 새겨 옮기기」 규칙이 아직 없다.** bottom-sheet manifest 에만 적혀 있다. `workflow-state.json` 의 `openGaps` 에 후속으로 선언돼 있어 숨긴 것은 아니다.

**③ Button manifest 판번호는 0.1.1 그대로다.** 동작이 바뀌었는데 판번호가 그대로인 것은 이 집 관례와 같다(modal-content 도 hover 추가 때 0.1.0 유지). 변경 추적은 `contract.json` 의 `sourceFingerprint` 가 한다 — 실제로 바뀌었다.

---

## 이번에도 검증하지 못한 범위 (통과로 보지 말 것)

- **실기기** — 안드로이드·iOS 실단말 미확인. ❌(a)-1 은 생성물과 생성기 코드로 판정했고 실기기로 눌러 보지는 않았다.
- **터치 기기에서의 `@media (hover: hover)` 실동작** — 데스크톱 브라우저에서 `matchMedia` 가 true 인 것만 확인.
- **스크린리더 실낭독 · 키보드 전수 순회**
- **river 발화 원문** — 세션 기록 접근 불가. D-14·D-15 에 인용이 존재한다는 것까지만 확인했다.
- **Figma 캔버스 렌더**

---

## 권장 상태 전환

| 필드 | 권장값 |
|---|---|
| `workflowStatus` | `in-progress` (유지) |
| `currentPhase` | **`4-verification` 유지** (5-human-review 로 넘기지 말 것) |
| `uiLibraryStatus` | `candidate` 로 되돌림 권장 — 3회차가 FAIL 이므로 `verified` 라벨의 근거가 없다 |
| `button` manifest `status` | `approved` 유지 (되돌릴 사안 아님 — 고칠 것은 포트와 안내 화면) |
| `nextAction` | ❌ 2건 수정 → 4회차 재검증 → ❓(c) 는 river 결정과 함께 |

**구현자에게 넘기는 목록(검증자는 고치지 않았다):**
1. Kotlin 포트에서 누름 표시를 되살릴 것 — 생성기가 `:active` 를 읽게 하거나, Compose 의 `pressed` 를 `hover` 칸에 맵핑하는 것을 끊고 누름 전용 칸을 만들 것.
2. 모바일 안내 화면 Button 상태표에서 Hover 칸을 뺄 것 — `registry/components/button.json` 의 `harness.mobileColumns` 가 이미 정답을 갖고 있다.
3. ❓(c) 는 river 에게 물을 것 — "모바일 버튼"의 범위(크기 이름 `lg` 만인가, 모바일 표기로 그려지는 것 전부인가)와 text-button 포함 여부.
