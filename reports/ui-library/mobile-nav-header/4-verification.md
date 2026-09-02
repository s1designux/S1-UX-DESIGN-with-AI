# 【5회차(부분) · 2026-09-02 · PASS】 F-5 수정분 부분 재검증

- 범위: **F-5(wifi 마스크 중복 id) 1건 + 함께 정정된 서술 2건 + 배선표 T5 확장**만. 나머지는 재실행하지 않았다.
- 검증자는 **아무 파일도 고치지 않았다.** `workflow-state.json` 도 건드리지 않았다. 이 보고서와 `screens/4v5-*` 증거만 추가했다.
- 오케스트레이터가 돌린 검사를 그대로 믿지 않고 전부 다시 실행했다. 아래는 전부 실측값이다.

## 판정: **PASS (F-5 해소)** · 새 FAIL 0건 · HOLD 0건

---

## 0. 판정 요약표

| # | 확인 요청 | 판정 | 실측 근거 |
|---|---|---|---|
| 1 | 실제 화면 wifi 가 **눈으로** 호 2겹 + 점인가 | **PASS** | 실제 화면 6배 확대 2장. Mobile Header `screens/4v5-statusbar-zoom.png` · Bottom Nav `screens/4v5-bottomnav-statusbar-zoom.png` — **바깥 호 · 빈 간격 · 안쪽 호 · 점**이 또렷하다. 4회차의 속 찬 부채꼴과 완전히 다르다 |
| 2 | 페이지 전체 중복 id 0인가 | **PASS** | id 385개 중 **중복 0건**(4회차엔 8건) |
| 3 | wifi 4개가 자기 SVG 안 마스크를 참조하는가 | **PASS** | 4개 전부 `sv.contains(target)` = true · 참조 id 와 자기 마스크 id 가 **순서까지 일치** · 각 id 의 문서 내 개수 = 1 |
| 4 | 마스크 id 가 실제로 갈렸는가 | **PASS** | `sw1a/1b`(BottomNav·PC) · `sw2a/2b`(BottomNav·Mobile) · `sw3a/3b`(Header·PC) · `sw4a/4b`(Header·Mobile) |
| 5 | 다른 곳의 id 를 깨뜨리지 않았는가 — 칩 라디오 | **PASS** | 라디오 12개 · id 전부 고유 · name 2종(`mh-type-pc`/`mh-type-mobile`) · **모든 `label[for]` 이 자기 안의 컨트롤로 해석**(교차 탈취 없음) |
| 6 | 헤더 유형 전환 동작 | **PASS** | 6종 순회 전부 목업 헤더 교체 + `data-header-bg` 동시 갱신 + 선택칩 1개 유지. PC 에서 골라도 Mobile 선택 유지(교차간섭 0) |
| 7 | 전환 후에도 id 무결한가 | **PASS** | 6종 전환 뒤 중복 id **0건** · wifi 4개 유지(마크업 교체가 SVG 를 늘리지 않는다) |
| 8 | 재마운트 반복에도 안전한가(카운터 방식의 약점) | **PASS** | 두 섹션을 3회 왕복 재마운트 후에도 중복 0 · 마스크 id `sw1~sw4` 유지 · 전부 self-contained |
| 9 | 하단탭 목업을 블록마다 새로 만든 것이 Gate 44 격리와 맞는가 | **PASS** | `set` 2개(블록당 1) · `part` 4개 · 두 nav 모두 `space-between`·4칸 · 아이템 **60×60 · margin 0 · flex 0 1 auto** · 목업 크롬에 `data-s1-component` **0건** |
| 10 | `ui:guide:render`(Gate 44) | **PASS** | 컴포넌트 **17종 × PC·Mobile** 통과 |
| 11 | `gate:check` | **PASS** | **PASSED · 게이트 47 · 통과 77 · 오류 0 · 경고 13** — 승격 시점과 동일 |
| 12 | dist 를 안 건드렸는가 | **PASS** | 4회차 dist 스냅샷 ↔ 현재 `diff -r` **차이 0** |
| 13 | `5-human-review.md` 정정이 사실과 맞는가 | **PASS** | §2 |
| 14 | 다른 보고서에 같은 종류의 과장·거짓이 남았는가 | **거짓 0건 · 누락 1건(O-14)** | `workflow-state.json` F-5 기록은 전 항목 사실과 일치. `6-promotion.md` 는 **거짓은 없으나 F-5 를 아예 언급하지 않는다** |
| 15 | 고정 id 가 다른 화면에 복사돼 있는가 | **PASS(0건)** | 저장소 전체에서 `id="uilg-sw1"`·`"uilg-sw2"` 잔존 **0건** · `pages/ui-review.html` 등 다른 소비 화면은 이 그림을 쓰지 않는다 |
| 16 | 배선표 T5 확장 | **PASS** | "문서 안 모든 id" 로 넓히고, SVG 내부 id(mask·filter·clipPath·gradient) · **숨겨진 블록 안 마스크 미적용** · "같은 문자열 두 블록 재사용 금지" · "모양까지 볼 것"을 모두 명시 |

---

## 1. 눈으로 본 결과 (요청한 6배 확대)

| | 4회차(수정 전) | 5회차(수정 후) |
|---|---|---|
| Mobile Header 목업 상태바 | `4v4-statusbar-zoom.png` — **속이 꽉 찬 부채꼴** | `4v5-statusbar-zoom.png` — **바깥 호 + 간격 + 안쪽 호 + 점** ✅ |
| Bottom Nav 목업 상태바 | 같은 결함 | `4v5-bottomnav-statusbar-zoom.png` — 정상 ✅ ("78%" 까지 확인) |

두 화면 모두 **정본 `SHELL_WIFI_SVG` 의 모양**(격리 실험 A 기준, `4v4-wifi-probe2.png`)과 같아졌다.

### PC 블록 쪽 wifi 에 대한 정직한 처리

요청은 "PC 블록 쪽도 열어서 보면 정상인가" 였다. **픽셀로는 확인하지 않았고, 구조로만 확인했다.**

- 이 두 컴포넌트는 **Mobile Components 에서만 열린다**(PC 목록에서 `platformHidden`). 그래서 `?platform=pc#mobile-header` 로 열면 Button 으로 폴백되어 **PC 블록은 실제 사용자 경로에서 화면에 뜨지 않는다.**
- 구조 확인은 마쳤다: PC 블록의 wifi 2개(`sw1a/1b`·`sw3a/3b`)도 **자기 SVG 안의 마스크를 참조**하고 각 id 의 문서 내 개수가 1이다. 4회차에서 실증한 실패 조건("참조 대상이 숨겨진 다른 블록 안")이 **성립하지 않는다.**
- 따라서 "PC 블록도 정상"은 **구조 근거로는 성립하나 픽셀로는 미확인**으로 남긴다(§4).

---

## 2. 정정된 서술 검증

| 정정문 | 판정 | 실측 |
|---|---|---|
| "라디오 `id`·`name` 중복 0건(라디오 12개·name 2종)" | **참** | 라디오 12개·id 전부 고유·name 2종 |
| "정본 상태바 수치 일치**(수치 기준)**" | **참** | 수치 범위로 좁혔고, 그 범위 안에서는 4회차 전수 대조와 동일하게 전 항목 일치 |
| F-5 절 "원인 — 고정 id 중복 → `url(#…)` 이 숨겨진 첫 번째를 가리킴" | **참** | 4회차 격리 실험(A/B/C)·DOM 실측과 일치 |
| F-5 절 "왜 통과했나 — 라디오만 보고 일반화(실제 SVG 마스크 id 8개 중복)" | **참** | 4회차 실측 8건과 일치 |
| F-5 절 "확인 — 중복 0 · wifi 4개 자기 마스크 참조" | **참** | 이번 회차에서 독립 재현 |
| `workflow-state.json` F-5 기록 전체(원인·영향·고침·교훈) | **참** | 전 항목 재현. 특히 "impact: 안내 화면만 · dist 무결"은 `diff -r` 로 재확인 |

---

## 3. 관찰

| id | 무엇 | 왜 남기나 |
|---|---|---|
| **O-14** | `6-promotion.md` 에 **F-5 언급이 전혀 없다**. 거짓은 없다(게이트 수치는 이번에도 그대로 재현된다). 다만 그 문서만 읽으면 "승격 시점에 전부 깨끗했다"로 읽히고, **승격 직후 안내 화면 결함 1건이 발견돼 고쳐졌다는 사실**을 알 수 없다. | 5-human-review.md·workflow-state.json·4-verification.md 에는 기록이 있으므로 사실 은폐는 아니다. 승격 문서에 한 줄 덧붙이면 기록이 닫힌다(구현자 판단). |
| **O-15** | 재마운트를 3회 왕복해도 마스크 id 가 `sw1~sw4` 그대로였다 — 섹션 마크업이 매번 재생성되지는 않는 것으로 보인다. | 중복이 생기지 않는다는 점은 실측으로 확인했다. 다만 카운터 방식은 "재생성될 때마다 증가"를 전제로 하므로, 앞으로 재생성 경로가 늘면 **중복 0 확인을 다시 해야 한다**(단조 증가라 충돌 위험 자체는 낮다). |
| **O-10(유지)** | 배터리 외곽선의 Figma `strokeAlign` 기본값 문제는 **여전히 미확인**이다(4회차 관찰). | 이번 회차 범위 밖. |

---

## 4. 검증하지 못한 범위 (미확인으로 남긴다)

| 범위 | 왜 |
|---|---|
| PC 블록 wifi 의 **픽셀** 확인 | 이 컴포넌트들은 PC 화면에 뜨지 않아 실제 경로로 캡처할 수 없다. 구조(고유·self-contained)로만 확인했다. |
| 칩 배치 반응형 — 1400px 6행 정렬 · ≤860px 접힘 | 5-human-review.md 의 ⭐ 자가인증 항목이며 이번 회차에서 렌더로 확인하지 않았다. CSS 미디어쿼리 선언만 읽었다. |
| Figma `strokeAlign`(배터리 외곽선 0.5px) | 코드만으로 확정 불가(O-10). |
| 실제 기기·보조기기(스크린리더) | 헤드리스 브라우저 실측까지만. |
| 범위 밖 지정 파일 | 지시대로 읽지도 판정하지도 않았다. |

## 5. 권장 조치

```json
{
  "verdict": "PASS — F-5 해소 확인. 새 FAIL 0건. 커밋해도 된다.",
  "recommendation": "6-promotion.md 에 F-5 발견·수정 한 줄만 덧붙이면 기록이 닫힌다(O-14, 선택).",
  "stillOpen": ["HD-3(아이콘 대조 희석 — river 결정 대기)", "B11(작업트리 공유 — 커밋 범위 분리)", "O-10(배터리 stroke 정렬 미확인)"]
}
```


---

# 【4회차(승격 검증) · 2026-09-02 · FAIL 1건 → 5회차에서 해소】 안내 화면 수정 4건 + 승격 정합성 독립 검증

- 범위: river UX 검수 중 들어간 **안내 화면 수정 4건**(⭐ 자가인증분 — 검증자가 처음 보는 것) + **승격(6-promotion) 정합성**.
- 대상 커밋: `ce05344`(칩·하단탭 space-between) · `0e5770f`(칩 왼쪽 세로) · `f675283`(정본 상태바) · `de53237`(홈 배경 잇기) + 미커밋 승격분.
- 검증자는 **아무 파일도 고치지 않았다.** `workflow-state.json` 도 건드리지 않았다. 이 보고서와 `screens/4v4-*` 증거만 추가했다.
- 범위 밖으로 지정된 파일(설치기 `code.ts`·`ui.html`·패턴 신규 파일·`registry/patterns/index.json`·zip·`CLAUDE.md`·`reports/changelog-archive.md`·`reports/repeated-requests.json`·`reports/ui-library/table/**`)은 읽지도 판정하지도 않았다.

## 판정: **FAIL 1건 (F-5)** · HOLD 0 · BLOCKED 0

> **배포 부품(dist)에는 결함이 없다.** F-5 는 **안내 화면 코드**(`assets/js/ui-library-guide.js`)의 결함이고,
> 4건 중 3번(정본 상태바 이식)이 들여왔다. **다만 결과는 "정본과 다른 모습이 실제 안내 화면에 나가고 있다"** 이고,
> 이 화면은 river 가 승인한 바로 그 화면이므로 그대로 둘 수 없다. 고치는 데 필요한 것은 **id 를 고유하게 만드는 것뿐**이며
> `ui-library/**` 재생성도, dist 되돌리기도 필요 없다.

---

## 0. 판정 요약표

| # | 확인 요청 | 판정 | 근거 |
|---|---|---|---|
| 1 | 4건이 배포 부품(dist)을 바꿨는가 | **PASS(안 바꿨다)** | `git diff c9415f7 de53237 -- ui-library/` = **변경 파일 0개**. 4건이 건드린 것은 guide js/css·보고서·스크린샷뿐 |
| 2 | 칩 — 라디오 name·id 분리가 T5 를 실제로 막는가 | **PASS** | name 2종(`mh-type-pc`/`mh-type-mobile`) · id 12개 전부 고유 · **PC 에서 고른 뒤에도 Mobile 선택이 유지**됨(실측) |
| 3 | 칩 — 클릭 시 목업 헤더가 실제로 바뀌는가 | **PASS** | 6종 전부 순회 확인. 유형 교체 + `data-header-bg` 동시 갱신 · 선택칩 항상 1개 |
| 4 | 칩 — 부품 경계 침범 | **PASS** | 칩은 `<label>`+hidden radio 로 된 안내 화면 크롬. `data-s1-component` 없음. 헤더 부품 CSS 를 건드리지 않는다 |
| 5 | 하단탭 space-between — 조립인가 부품 침범인가 | **PASS(조립)** | 인라인 스타일은 `data-guide-sample="set"` 인 바에만 있고, 아이템은 **60×60 고정 · margin 0 · flex 0 1 auto** 그대로. 정본이 "바는 컴포넌트 아님"이라 바 배치는 화면 소유가 맞다. 4칸 간격 33.33·33.34·33.34 균등 |
| 6 | 상태바 — 정본 수치 대조 | **PASS(전 항목 일치)** | 아래 §2 표. 높이 27 · 패딩 20/16/0/0 · space-between/center · bg level-0 · 12/Medium/text-body-secondary · "12:30"·"78%" · 오른쪽 간격 6 · 신호 17×12 막대 4개 좌표까지 · 배터리 24×12 3조각 좌표 · 헤더와의 간격 16 |
| 7 | 상태바 — wifi 를 정본 SHELL_WIFI_SVG 에서 색만 바꿨는가 | **PASS(도형 동일)** | `currentColor`→`#353535`, `uilg-sw`→`sw` 두 치환만 되돌리니 **819자 완전 일치**. 하드코딩 hex 잔존 0 |
| 8 | **상태바 — 실제 렌더 모양** | **FAIL (F-5)** | 안내 화면에서 wifi 가 **마스크가 풀린 속 찬 부채꼴**로 그려진다. 원인은 중복 DOM id(§1) |
| 9 | 홈 배경 잇기 — 라이트/다크 × 유형 | **PASS** | 홈: 상태바=간격=헤더=본문 4곳 모두 라이트 `#F5F6FB` / 다크 `#0C1D38`. 스탠다드: 본문만 다름(라이트 `#F5F5F5` / 다크 `#24252C`). 아이콘·글자색은 양 테마에서 `icon/gray-dark`·`text/body/secondary` 추종 |
| 10 | Gate 44 부품 표본 격리 충돌 | **PASS** | 목업 크롬(`.uilg-phone*`)에 `data-s1-component` **0건** · 헤더 표본 `part` · 조립 바 `set`(2) · 낱개 아이템 `part`(4). `ui:guide:render` **17종 통과** |
| 11 | 승격 — 선언 정합성 | **PASS** | src manifest·dist manifest·dist/manifest.json·이행 장부·workflow-state 다섯 곳이 모두 `approved`/complete/checkpoint 6 로 일치 |
| 12 | 승격 — dist 변경 전수 | **PASS** | `status: verified→approved` + `sourceFingerprint` 2개뿐. **canonicalFingerprint 불변**(`40d88e15…`/`8d2bea4c…`) · CSS·SVG·예제·번들 무변화 |
| 13 | 승격 — "손편집 없음" | **PASS** | `ui:build` 재실행 후 `diff -r` 차이 0 |
| 14 | 승격 시점 검사 재현 | **PASS(수치까지 동일)** | `gate:check` **PASSED · 게이트 47 · 통과 77 · 오류 0 · 경고 13** · Gate 19 **49/49 공백 0** · Gate 44 **17종** — 6-promotion.md 기재와 일치 |
| 15 | 새 유령 필드·거짓 서술 | **FAIL 1건** | 5-human-review.md 의 **"페이지 전체 중복 `id` 0건"** 이 사실이 아니다(§1). 그 외 6-promotion.md 의 서술·수치는 전부 재현됨 |

---

## 1. ❌ FAIL — F-5. 안내 화면 wifi 아이콘이 **정본과 다른 모양**으로 나간다 (중복 DOM id)

**증상:** 실제 안내 화면(Mobile Components → Mobile Header / Bottom Nav)의 목업 상태바에서 wifi 가
**두 겹 호(arc) 모양이 아니라 속이 꽉 찬 부채꼴**로 그려진다. 신호바·배터리·글자는 정상이다.
증거: `screens/4v4-statusbar-zoom.png`(실제 화면 6배 확대) · `screens/4v4-mobileview-full.png` · `screens/4v4-bottomnav-mobileview.png`

**원인(확정):** `PHONE_WIFI_SVG` 가 마스크 id 를 **고정 문자열**(`uilg-sw1`·`uilg-sw2`)로 갖는다.
이 SVG 는 한 페이지에 **4번** 그려진다(Bottom Nav·Mobile Header × PC·Mobile 블록) → **id 가 4중 중복**된다.
`url(#uilg-sw1)` 은 문서 순서상 **첫 번째** 요소로 해석되는데, 그 첫 번째는 `.platform-section-pc` 안에 있고
이 컴포넌트들은 **Mobile Components 에서만 열리므로 PC 블록은 항상 `display:none`** 이다.

**"display:none 안의 마스크는 적용되지 않는다"를 격리 실험으로 실증했다** (`screens/4v4-wifi-probe2.png`):

| 조건 | 결과 |
|---|---|
| A 같은 svg 안 고유 마스크 | ✅ 정상(호 2겹 + 점) |
| B 마스크가 **보이는** 다른 svg 안 (교차 참조만) | ✅ 정상 — 교차 참조 자체는 문제가 아니다 |
| C 마스크가 **display:none** 다른 svg 안 (= 실제 페이지 조건) | ❌ **속 찬 부채꼴** — 실제 화면과 같은 모양 |

실제 페이지 DOM 실측으로 조건 일치도 확인했다:
`보이는 wifi 의 참조 = url(#uilg-sw1)` · `그 id 가 가리키는 노드 = .platform-section-pc 안` · `그 조상의 computed display = none`.

**왜 아무도 못 잡았나(사각지대):**
- `ui:guide:render`(Gate 44)는 DOM·dist CSS 계약을 보지 **픽셀이나 SVG 마스크 해석은 보지 않는다.**
- 배선표 함정 **T5**(같은 마크업을 PC·Mobile 두 곳에 넣으면 id·name 이 중복된다)는 이미 문서화돼 있었고
  같은 커밋에서 **라디오는 정확히 그 규칙대로 방어**했다. 그런데 **같은 커밋에 들어온 SVG 마스크 id 는 놓쳤다** — T5 의 사례 목록이 라디오 중심이라 SVG 내부 id 로 일반화되지 못했다.

**분류:** ❌(a). 정본↔파생 관계라 두갈래 분류 대상이 아니다 — 파생(안내 화면)을 고친다.
**영향 범위:** 안내 화면만. `ui-library/**` 는 무관하다.
**수정 방향(구현자 소관):** 마스크 id 를 인스턴스마다 고유하게 만든다(예: 호출마다 증가하는 일련번호를 접미로). dist 재생성 불필요.

### F-5 에 딸린 거짓 서술

`5-human-review.md` 「확인된 것 (실측)」의 **"칩 동작 — … 페이지 전체 중복 `id` 0건"** 은 사실이 아니다.
실측: `uilg-sw1` 4개 · `uilg-sw2` 4개 = **중복 id 8개**. (라디오 id 는 실제로 0건 중복이 맞다 — 문장이 라디오만 보고 페이지 전체로 일반화됐다.)
또한 같은 문서의 **"상태바를 정본 StatusBar 대로"** 는 **수치로는 참, 렌더 결과로는 거짓**이다 — 이 두 문장은 F-5 수정과 함께 정정돼야 한다.

---

## 2. 정본 상태바 ↔ 안내 화면 실측 대조 (수치는 전 항목 일치)

정본 `build-components.ts populateStatusRow(:4738-4767)`·`buildMobileHeaderVariant(:3106·3107·3117-3119·3132)` ↔ 실제 렌더 계산값.

| 항목 | 정본 | 안내 화면 실측 | |
|---|---|---|---|
| 상태바 크기 | `resize(360, 27)` | 높이 **27px** (폭은 목업 안쪽 340 → O-9) | ✅ |
| 정렬 | SPACE_BETWEEN / CENTER | `space-between` / `center` | ✅ |
| 패딩 | L20 R16 T0 B0 | `20px` / `16px` / `0px` / `0px` | ✅ |
| 배경 | `color/bg/level-0` | `rgb(255,255,255)` = `--color-bg-level-0` | ✅ |
| 왼쪽 글자 | "12:30" 12 Medium `text/body/secondary` | "12:30" · 12px · 500 · `rgb(85,85,85)` | ✅ |
| 오른쪽 글자 | "78%" 같은 스타일 | "78%" · 상속 동일 | ✅ |
| 오른쪽 묶음 | itemSpacing 6 · CENTER | `gap: 6px` · `center` | ✅ |
| 신호 프레임 | 17×12 | 17×12 | ✅ |
| 신호 막대 4개 | (0,8,3,4) (4.5,6,3,6) (9,4,3,8) (13.5,1,3,11) r0.5 `icon/gray-dark` | 좌표·크기·반경·색 **4개 전부 동일** | ✅ |
| wifi | `SHELL_WIFI_SVG` · 16×12 · `icon/gray-dark` | 16×12 · `rgb(53,53,53)` · **도형 문자열 완전 일치** | ✅(수치) / ❌(렌더 = F-5) |
| 배터리 프레임 | 24×12 | 24×12 | ✅ |
| 배터리 외곽 | (0,0.5,20,11) r2.5 **stroke 1** | left0 top0.5 20×11 r2.5 border 1px(border-box) | ✅(→ O-10) |
| 배터리 꼭지 | (20.4,4,1.6,4) r1 | 20.4 / 4 / 1.59375 / 4 / 1 | ✅ |
| 배터리 채움 | (2,2.5,14.5,7) r1 | 2 / 2.5 / 14.5 / 7 / 1 | ✅ |
| 상태바~헤더 간격 | `comp.itemSpacing = 16` | `.uilg-phone-chrome-gap` 16px | ✅ |
| 배경 물려받기 | 상태바 인스턴스 `fills = []` → 헤더 프레임 배경이 비침 | `data-header-bg` 로 상태바·간격을 헤더와 같은 색으로 칠함 | ✅(기제는 다르나 결과 동일) |
| isHome 분기 | `isHome ? bg/home : bg/level-0` | `variant.startsWith("home-")` 로 동일 분기 | ✅ |

**홈 배경 잇기(4-b)** — 라이트/다크 × 2유형 실측:

| | 상태바 | 간격 | 헤더 | 본문 |
|---|---|---|---|---|
| 홈 · 라이트 | #F5F6FB | #F5F6FB | #F5F6FB | #F5F6FB |
| 홈 · 다크 | #0C1D38 | #0C1D38 | #0C1D38 | #0C1D38 |
| 스탠다드 · 라이트 | #FFFFFF | #FFFFFF | #FFFFFF | #F5F5F5(목업 회색) |
| 스탠다드 · 다크 | #0D0E12 | #0D0E12 | #0D0E12 | #24252C(목업 회색) |

선언("Standard 는 본문만 다르다")과 실제가 일치한다. ✅

---

## 3. 관찰

| id | 무엇 | 왜 남기나 |
|---|---|---|
| **O-9** | 목업 폰은 `width:360px` 인데 `border:10px` 이라 **안쪽 화면은 340px** 다. 정본 상태바·AppBar 는 360 기준이므로 안내 화면의 상태바는 20px 좁게 그려진다. | **이번 4건 이전부터 그랬다**(`c9415f7` 의 CSS 와 동일 — 이번 변경 아님). 고정 크기 부품(신호 17·배터리 24·패딩 20/16·간격 6)은 정본 그대로이고 가변 구간만 좁다. 배포 부품은 `width:100%` 로 설계돼 있어 결함이 아니다. |
| **O-10** | 배터리 외곽선을 정본은 Figma **stroke**(정렬 기본값에 따라 안/중앙이 갈린다), 안내 화면은 CSS `border`(border-box)로 그린다. 정렬이 중앙이면 변마다 0.5px 차이가 난다. | 코드만으로는 Figma `strokeAlign` 기본값을 확정할 수 없어 **미확인으로 남긴다**. 안내 화면 전용 그림이고 river 가 눈으로 승인한 범위라 FAIL 로 올리지 않는다. |
| **O-11** | Gate 44(안내 화면 렌더 검사)는 **DOM·dist CSS 계약**만 본다 — SVG 마스크 해석·픽셀 모양은 검사 범위 밖이라 F-5 를 통과시켰다. | F-5 같은 "선언은 맞는데 그려지는 모양이 다른" 결함은 여전히 사람 눈 또는 픽셀 대조로만 잡힌다. |
| **O-12** | 배선표 함정 **T5** 는 라디오 `name`·`id` 중심으로 쓰여 있어, **같은 마크업 안의 SVG 내부 id(mask·filter·gradient·clipPath)** 로 일반화되지 않았다. F-5 가 정확히 그 틈이다. | T5 를 "PC·Mobile 두 곳에 같은 마크업을 넣으면 **문서 안 모든 id**(라디오 name 포함, SVG 내부 id 포함)가 중복된다"로 넓히면 재발을 막는다. |
| **O-13** | 지난 회차의 Gate 6c 오류(다른 세션 소유)는 **해소됐다** — `gate:check` 오류 0. | B11(작업트리 공유)은 여전히 열려 있으나 이번 검증에는 영향 없었다. |

---

## 4. 검증하지 못한 범위

| 범위 | 왜 |
|---|---|
| Figma `strokeAlign` 기본값에 따른 배터리 외곽선 0.5px 차 | 코드만으로 확정 불가(O-10). Figma 실물 확인 필요. |
| 좁은 화면(≤860px)에서 칩이 다시 접히는 반응형 동작 | 이번 회차에서 렌더로 확인하지 않았다. CSS 미디어쿼리 선언은 읽었다. |
| 실제 기기·보조기기(스크린리더) | 헤드리스 브라우저 실측까지만. |
| 범위 밖 지정 파일 전체 | 지시대로 읽지도 판정하지도 않았다. |

## 5. 권장 조치

```json
{
  "recommendation": "승격 자체는 되돌릴 필요가 없다(dist 무결·선언 정합·게이트 재현 전부 PASS). 안내 화면 결함 F-5 1건만 고치고 5-human-review.md 의 두 문장을 정정한 뒤 닫는다.",
  "blockers": [
    { "id": "F-5", "severity": "error", "owner": "assets/js/ui-library-guide.js",
      "what": "PHONE_WIFI_SVG 의 마스크 id 가 고정이라 한 페이지에 4중 중복되고, 첫 번째가 display:none 인 PC 블록에 있어 실제 화면의 wifi 가 마스크 없이 속 찬 부채꼴로 그려진다",
      "fix": "마스크 id 를 인스턴스마다 고유하게 만든다(dist 재생성 불필요)" },
    { "id": "F-5b", "severity": "error", "owner": "reports/ui-library/mobile-nav-header/5-human-review.md",
      "what": "\"페이지 전체 중복 id 0건\" 이 사실과 다르고(중복 8개), \"정본 StatusBar 대로\" 가 렌더 결과로는 성립하지 않는다",
      "fix": "두 문장을 실측대로 정정한다" }
  ]
}
```


---

# 【3회차(부분) · 2026-09-02 · PASS】 4-verification — F-4 수정분 부분 재검증

- 범위: **F-4(헤더 manifest 유령 필드 선언) 1건 + 함께 정정된 `statesLayout` 1건**만. 오케스트레이터 요청대로 다른 항목은 재실행하지 않았고,
  대신 **dist 를 다시 생성했으므로 무효화 위험이 있는 3가지**(결정론 · 전체묶음↔개별설치 동일성 · 정본 지문)는 재측정했다.
- 검증자는 **아무 파일도 고치지 않았다.** `workflow-state.json` 도 건드리지 않았다.
- 오케스트레이터가 돌린 검사 결과를 그대로 믿지 않고 전부 다시 실행했으며, 판정 근거는 아래 실측값이다.

## 판정: **PASS (F-4 해소)** · 다만 오케스트레이터의 설명 1건이 사실과 다르다(아래 §2)

| # | 확인 요청 | 판정 | 실측 근거 |
|---|---|---|---|
| 1 | note 가 실제 존재하는 필드만 가리키는가 (src) | **PASS** | `derivedFrom·derivationRule` 로 교체됨. 두 필드 모두 icon manifest 에 실재하고 검사기가 읽는다(refs 6·5건) |
| 2 | note 가 실제 존재하는 필드만 가리키는가 (dist) | **PASS** | `dist/components/mobile-header.manifest.json` 도 동일 문장으로 재생성됨 — src↔dist 문장 완전 일치 |
| 3 | 유령 필드가 저장소에 남아 있는가 | **PASS(0건)** | `combinedOriginComparisonWith` 저장소 전체 **0건**(이 보고서 제외) |
| 4 | 같은 종류의 유령 선언이 더 있는가 | **PASS(0건)** | 두 컴포넌트 manifest·icon manifest·표출 정책의 **서술 필드에서 기계가독 이름처럼 보이는 토큰을 전부 뽑아 실재 여부를 대조**했다. 미해결 0건 (§3) |
| 5 | `statesLayout` 변경이 검사를 느슨하게 했는가 | **아니오 — 느슨해지지 않았다** | `matrix`/`vertical` 두 값으로 각각 돌린 결과가 **완전히 동일**: `checks=4 pass=4 fail=0 uninstrumented=23` |
| 6 | 오케스트레이터가 말한 "미계측 22 → 23" | **사실과 다름** | 이 컴포넌트는 `managedBy: ui-library-guide` 라 `presentation-layout-check.js:148` 에서 **`continue` 로 먼저 빠져나간다** — `statesLayout` 줄(:184)에 도달조차 하지 않는다 |
| 7 | source→dist 결정론 (재생성했으므로 재확인) | **PASS 유지** | `ui:build` 재실행 후 `diff -r` 차이 0 |
| 8 | 전체묶음 ↔ 개별설치 동일성 | **PASS 유지** | 두 소비자 화면 재촬영 sha256 동일(`ba739a03…`), **2회차 증거 파일과도 동일** = 픽셀 변화 0 |
| 9 | 정본 지문(canonicalFingerprint) | **PASS 유지** | 재산출값이 선언값과 일치하고 **2회차와 같은 값**(`8d2bea4c…` / `40d88e15…`) — 정본은 건드려지지 않았다 |
| 10 | 재생성이 바꾼 것의 전수 | **note 문장 + 그 해시뿐** | 2회차 dist 스냅샷과 `diff -rq` → 달라진 파일 **2개**: `components/mobile-header.manifest.json`(note 1문장 + `sourceFingerprint`) · `manifest.json`(같은 `sourceFingerprint` 1줄). **CSS·SVG·예제·번들 전부 무변화** |
| 11 | 검사기 재실행 | **PASS** | `ui:contract` errors=0 · `ui:icons` errors=0 · `ui:icons:origin` errors=0(경고 2 = 등재된 기존 부채) · `ui:test` 통과 · `ui:state` PASS |

## 1. 왜 2회차 PASS 들이 무효화되지 않는가

dist 를 다시 생성했지만 **바뀐 바이트가 문서 문장 하나와 그 해시 2곳뿐**이다. 렌더에 쓰이는 CSS·SVG·번들·예제는
2회차 검증 시점과 **바이트 동일**하고, 소비자 화면 스크린샷 해시가 2회차 증거와 **완전히 같다**.
따라서 2회차의 렌더·기하·색·설치 동일성 판정은 그대로 유효하다. (재측정으로 확인한 것이지 추론으로 넘긴 것이 아니다.)

## 2. `statesLayout` 정정에 대한 정확한 판정

**결론부터: 통과로 둔갑시킨 것이 아니다. 그러나 "미계측이 1건 늘었다" 도 사실이 아니다 — 아무 것도 늘지 않았다.**

`scripts/presentation-layout-check.js` 의 흐름은 이렇다.

```js
for (const [id, spec] of Object.entries(comps)) {
  if (spec.managedBy === 'ui-library-guide') {          // :148
    uninstr.push(`${id}: ui-library-guide 관리 — …`);
    continue;                                           // ← 여기서 끝난다
  }
  … // 검사 1·2·3
  if (spec.statesLayout === 'vertical') uninstr.push(`${id}.상태 세로배치`);   // :184  ← 도달하지 않음
}
```

`mobile-header` 는 `managedBy: "ui-library-guide"` 라 **:148 에서 빠져나가므로 `statesLayout` 값이 무엇이든 읽히지 않는다.**
실제로 저장소 파일을 고치지 않고 값만 메모리에서 되돌려 두 번 돌려 보았다.

| 돌린 값 | 결과 |
|---|---|
| `statesLayout: "matrix"` (수정 전) | `checks=4 pass=4 fail=0 uninstrumented=23` |
| `statesLayout: "vertical"` (수정 후) | `checks=4 pass=4 fail=0 uninstrumented=23` |

**완전히 동일하다.** 미계측 목록에도 `mobile-header.상태 세로배치` 항목은 **나타나지 않는다**(`mobile-header: ui-library-guide 관리` 한 줄뿐).
`statesLayout` 은 저장소 전체에서 이 한 줄(:184)에서만 읽히므로, 다른 검사기에 미치는 영향도 없다(전수 grep 확인).

정리하면:
- **위험(느슨해짐): 없음.** 검사 수·통과 수·위반 수가 모두 그대로다. 없던 면제가 생기지도 않았다.
- **효과(정직해짐): 서술 정확도에 한정.** 실제 렌더가 세로 행 목록이므로 `vertical` 이 사실에 맞다. 다만 **이 값은 이 컴포넌트에 대해 기계가 읽지 않는 죽은 데이터**다.
- 따라서 수정 자체는 옳지만, 근거로 제시된 "미계측 22 → 23" 은 **일어나지 않은 일**이다. 앞으로 이 필드를 근거로 검사 강도를 논하지 않는 편이 안전하다(→ O-8).

## 3. 유령 필드 전수 점검

두 컴포넌트 manifest·icon manifest·표출 정책의 **서술 필드**(`note`·`why`·`rule`·`geometryEvidence`·`changeFromCurrent`·`sourceBuilderSymbol`·`approvedScope` 등)에서
기계가독 이름처럼 보이는 토큰을 자동 추출해 실재 여부를 대조했다.

| 결과 | 항목 |
|---|---|
| 실재 확인 | `derivedFrom`(6건) · `derivationRule`(5건) · `sourceKey`(23건) · `originComparable` 계열 등 |
| 정본 TS 심볼로 실재 | `fcIconPx`(8건) · `makeCheckIcon`(3건) · `makeMobileHeaderIconSlot`(4건) — 모두 `build-components.ts` 에 존재 |
| 오탐(평범한 단어) | `heading` · `sample`(= `data-guide-sample`) · `started`(= `not-started`) |
| **미해결 유령** | **0건** |

## 4. 관찰 추가

| id | 무엇 | 왜 남기나 |
|---|---|---|
| **O-8** | `component-presentation-policy.json` 의 `statesLayout` 은 `managedBy: ui-library-guide` 인 항목(현재 13개)에 대해 **어떤 검사기도 읽지 않는 죽은 데이터**다. | 값이 틀려도 아무도 못 잡는다 — 이번에 사람 눈으로 잡았을 뿐이다. 서술 정확도만 갖는 필드임을 알고 쓰면 되고, 검사 강도의 근거로는 삼지 않는다. |

## 5. 권장 상태 전환 (3회차)

```json
{
  "workflowStatus": "in-progress",
  "uiLibraryStatus": "draft",
  "lastCompletedCheckpoint": 4,
  "checkpointLog[4]": { "status": "passed", "by": "component-verifier (시나리오 F · 2회차 + 3회차 부분 재검증)" },
  "nextAction": "5-human-review(river) 로 넘긴다. 승격(6-promotion) 시 Gate 44·Gate 19 를 실제 status 로 재실행할 것."
}
```

blocker 갱신 권고: **B9(=F-4) resolved 확인.** B10(아이콘 검사기 희석 취약성)·B11(다른 세션 미커밋 변경/Gate 6c)은 그대로 open —
B10 은 river 후속 결정으로, B11 은 커밋 분리로 처리한다는 오케스트레이터 계획을 확인했다.


---

# 【2회차 · 2026-09-02 · FAIL(1건, 문서선언) → 3회차에서 해소】 4-verification — Mobile Bottom Nav · Mobile Header (시나리오 F 독립 검증)

- 작업: `mobile-nav-header` · 검증자: 🤖 `component-verifier`(시나리오 F) · 날짜: 2026-09-02(2회차)
- 규격: `.claude/skills/ui-library-code/references/verify-F.md` · 함정목록 `references/wiring-and-traps.md §2`
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts` `buildMobileBottomNav`(:2959) · `buildMobileHeaderVariant`(:3069) · `buildMobileHeader`(:3184)
- **검증자는 아무 파일도 고치지 않았다.** `workflow-state.json` 도 수정하지 않았다. 이 보고서와 `screens/4v2-*` 증거만 추가했다.
  적대 테스트에서 자산·CSS·manifest 를 잠시 훼손했다가 **바이트 단위로 복원했음을 sha256 로 확인**했고, `diff -r` 로 dist 전체 무드리프트를 재확인했다.
- 1회차 PASS 30건을 재사용하지 않았다. 기하 실측·토큰 전환·설치 동일성·결정론을 **전부 다시 측정**했다.

## 검문소 결과

> **FAIL 1건(F-4, 문서 선언) · HOLD 0건 · BLOCKED 0건 · 범위밖 실패 1건(Gate 6c) → 검문소 미통과.**
> 1회차 FAIL 3건(F-1·F-2·F-3)은 **전부 독립 실측으로 해소 확인**했다. 남은 FAIL 은 새로 발견한 것 하나뿐이며
> **렌더·동작에 영향이 없는 한 문장짜리 선언 오류**다 — 자산 재작업 없이 `manifest.json` 1줄 수정 + `ui:build` 로 끝난다.
> 권고: `workflowStatus: in-progress` 유지 · `lastCompletedCheckpoint: 3` 유지 · F-4 수정 후 **부분 재검증(F-4 + `ui:build`/`ui:test` 재실행)** 으로 4단계 통과 처리.

---

## 0. 판정 요약표 (2회차)

| # | 항목 | 판정 | 한 줄 근거 |
|---|---|---|---|
| 1 | 1회차 F-1 (화살표 글리프 잘림) 해소 | **해소 PASS** | 잉크 경계상자가 원본과 **완전 일치**(48px 기준 (19,14) 12×20) · 잉크비 0.87 → **1.036** · 전프레임 오차 0.00372 → **0.00089** |
| 2 | F-1 재발 시 검사기가 잡는가(희석 문제) | **미해소(관찰 O-1)** | 옛 잘린 자산을 재현해 재측정 → 전프레임 오차 0.00372 로 **임계 0.015 를 여전히 통과**. 검사기는 아직 글리프영역 측정을 하지 않는다 |
| 3 | 1회차 F-2 (화살표 방향 반대) 해소 | **해소 PASS** | 계산 transform = `matrix(0, 1, -1, 0, 0, 0)`(시계 90°) · 렌더에서 `v`(아래) 확인 · ×6 확대 증거 |
| 4 | F-2 의 정본 의미 대조 | **PASS** | 정본 `rotation = -90`(Figma 반시계 양수) = 아래 ↔ CSS `rotate(90deg)`(시계 양수) = 아래. **부호만 뒤집고 방향은 동일** |
| 5 | 1회차 F-3 (빨간 점 미배포) 해소 | **해소 PASS** | dist 에 accent SVG 존재(HTTP 200) · 마스크 URL 해석됨 · **Light `rgb(255,69,84)` / Dark `rgb(240,96,112)`** = `--color-icon-red` 실측 |
| 6 | F-3 파생 선언이 "검사 우회"로 기능하는가 | **PASS(적대 테스트 3종 통과)** | 점 1px 이동 → ❌ · 부모의 다른 경로로 바꿔치기 → ❌ · 재현 규칙 적용 불가 → ❌. 손으로 그린 조각은 통과 못 한다 |
| 7 | 신설 검사기 ①(`ui-library-icon-origin-check.js` derivedFrom 분기) 실효성 | **PASS(1개 잠복 약점 = O-2)** | 위 적대 테스트로 실증. 다만 부모 기록이 낡았을 때 자식이 낡은 PASS 를 읽는다(단독으로 초록 만들지는 못함) |
| 8 | 신설 검사기 ②(dist CSS `url()` 해석 검사) 실효성 | **PASS** | F-3 형태(배포 안 된 자산을 CSS 가 가리킴)를 **실제로 재현해 적발**. 무력화 방지 가드(`url()` 0건이면 실패)도 있다 |
| 9 | 검사기 ② 의 우회 구멍 | **현재 없음 · 미래 1곳(O-3)** | 스캔 대상 18개 = dist 컴포넌트 CSS 전량과 정확히 일치. `assets/css/*.css`·예제 HTML 은 미스캔이나 현재 `url()` 0건 |
| 10 | 아이콘 기하 실측 재측정(hit area·frame·glyph 분리) | **PASS** | 프레임 24 · 글리프 24 · 렌더 24×24 · 액션버튼 32×32 · 히트영역 32+6×2 = **44** (`::before` inset 실측 −6px 4변) |
| 11 | Light·Dark 토큰 전환 재측정 | **PASS** | 아이콘 red/gray-dark, 헤더 배경, 탭 라벨·아이콘 선택/비선택 전부 다크에서 다른 값으로 전환 |
| 12 | source → dist 결정론 재측정 | **PASS** | `ui:build` 재실행 후 `diff -r` 차이 0 (적대 테스트 복원 뒤에도 재확인) |
| 13 | 전체묶음 ↔ 개별설치 동일성 재측정 | **PASS** | 두 소비자 화면 스크린샷이 **sha256 완전 동일**(`ba739a03…`) |
| 14 | 변형 전수(헤더 6종 · 탭 2상태) 재대조 | **PASS** | 6종 전부 렌더 · 정본에 없는 축 신설 0건 · 하단탭 60×60 고정 |
| 15 | HD-1(B) 코어 경계 침범 여부 | **PASS** | `mobile-bottom-nav.css` 에 `nav`/`tablist`/`:has` 를 건드리는 selector **0건** — 껍데기는 순수 마크업 |
| 16 | HD-1(B) ↔ 부품 표본 격리(Gate 44) 충돌 | **PASS** | 안내 화면 부품 표본은 여전히 버튼 1칸(`data-guide-sample="part"` 14개), 조립 예시만 `"set"` — 예제의 `nav` 는 코드탭에만 나온다 |
| 17 | HD-2(A) 선언 ↔ 실제 화면 | **PASS(잔여 1건 O-4)** | 실제 화면 = Action 목업 + 평면 목록. 고친 note 와 일치. 다만 같은 항목의 `statesLayout` 은 여전히 `"matrix"` |
| 18 | 안내 화면(승격 후) 실제 렌더 | **PASS(모의 승격으로 실측)** | status 를 임시로 approved 로 두고 렌더 → 오류 0 · 6종 전부 표출 · 화살표 아래 · 점 빨강. 측정 후 원상복구 확인 |
| 19 | Gate 44(안내화면 렌더 검사) 커버리지 | **PASS(모의 승격 조건부)** | 임시 승격 상태에서 재실행하니 **17종**으로 늘고 통과. 실제 승격 뒤 6-promotion 에서 재실행 필요 |
| 20 | 실제 검수 화면(`pages/ui-review.html`) 렌더 | **PASS** | 14·15번 섹션 Light·Dark 모두 화살표 아래·빨간 점 정상 (`4v2-ui-review-14-15.png`) |
| 21 | 콘솔 오류 | **PASS** | 렌더 화면 콘솔 오류 0건 |
| 22 | `ui:contract`·`ui:icons`·`ui:icons:origin`·`ui:test`·`ui:state` | **PASS** | 전부 errors=0 (실측 재실행). 경고 2건은 등재된 기존 부채(check·edge_set) |
| 23 | 아이콘 source ↔ dist 동일성 | **PASS** | `diff -r` 차이 0 (accent 포함 13개 전량) |
| 24 | 컴포넌트 manifest 선언 ↔ 실제 기계가독 필드 | **FAIL (F-4)** | 헤더 manifest 가 "`originComparable=false`·`combinedOriginComparisonWith` 로 선언한다"고 쓰는데 **둘 다 존재하지 않는다** |
| 25 | 화살표 자산이 chevron 과 바이트 동일한 점 | **PASS(해명됨 · O-5)** | 두 원본 내보내기 PNG(`_solid`/`_line`)가 **픽셀 완전 동일**(평균차 0.000000)임을 실측 — 베껴 쓴 것이 아니라 원본이 같다 |
| 26 | `gate:check` 전체 | **범위 밖 실패 1건** | Gate 6c 1 error. 원인은 **다른 세션이 지금 편집 중인** `plugins/figma-vars-installer/src/ui.html`(패턴 탭 카드 추가) — 이 작업 소유 아님 |
| 27 | 빈 소비자 화면에서 하단탭이 세로로 쌓이는 것 | **알려진 한계(설계상)** | HD-1(B)는 무효 ARIA 만 해소한다. 바 배치는 여전히 화면 소유 — 예제 주석이 그렇게 명시 |

---

## 1. ❌ FAIL — 반드시 고칠 것

### F-4. 헤더 manifest 가 **존재하지 않는 기계가독 필드**로 대조 제외 경계를 선언한다고 쓴다

**무엇:** `ui-library/src/components/mobile-header/manifest.json` 의 `mobileHeaderNotification` 항목 note 마지막 문장이

> "대조 제외 경계는 icon manifest 의 `originComparable=false`·`combinedOriginComparisonWith` 로 기계가독 선언한다."

라고 말한다. 그런데 실제 icon manifest 의 `mobileHeaderNotificationAccent` 항목에는

- `originComparable` 필드가 **없고**(그 필드는 `check`·`edge_set` 두 기존 부채에만 있다),
- `combinedOriginComparisonWith` 라는 이름은 **저장소 전체에 한 번도 등장하지 않는다.**

실제로 쓰인 기계가독 선언은 **`derivedFrom` + `derivationRule`**(river 지시 2026-09-02)이고, 검사기도 그 두 필드만 읽는다(`scripts/ui-library-icon-origin-check.js:227~`).

**왜 FAIL 인가:** 이 note 는 dist 로 그대로 복사돼 퍼블리셔·개발자가 받는 배포 산출물의 일부다. 다음 사람이 "어디에 선언돼 있나" 를 찾으면 **없는 필드를 찾게 된다.** 정본↔파생 관계이므로 두갈래 분류 대상이 아니고(하드룰 H6), 애매하지도 않다 — 폐기된 설계의 문장이 남은 것이다.

**분류:** ❌(a). **영향 범위: 문서 문장 1개.** 자산·CSS·렌더에는 영향 없다.
**수정 방향(구현자 소관):** note 의 마지막 문장을 실제 기제(`derivedFrom` + `derivationRule` = path-subset #1, 검사기가 매번 재현 증명)로 고치고 `npm run ui:build` 로 dist 반영.

**근거:** `ui-library/src/components/mobile-header/manifest.json:122` · `ui-library/src/assets/icons/manifest.json`(accent 항목에 해당 필드 없음) · `grep -rn "combinedOriginComparisonWith"` = 0건.

---

## 2. 1회차 FAIL 3건 — 독립 재측정 결과

### F-1 (글리프 잘림) → 해소 확인

원본 `assets/icons/ic_화살표더보기_solid.png`(48px) ↔ 현재 웹 자산을 검증자가 **직접 래스터화해 재측정**했다(검사기 기록을 신뢰하지 않고 새로 렌더).

| 대상 | 잉크 경계상자(48px) | 24 좌표 환산 | 잉크 총량 | 전프레임 평균오차 | 글리프영역 평균오차 |
|---|---|---|---|---|---|
| Figma 원본 내보내기 | (19,14) **12×20** | (9.5,7.0) 6×10 | 50.44 | — | — |
| **현재 웹 자산** | (19,14) **12×20** | (9.5,7.0) 6×10 | 52.24 (**×1.036**) | **0.00089** | **0.00669** |
| (참고) 1회차의 잘린 자산 | (20,15) 10×18 | (10,7.5) 5×9 | 43.61 (×0.865) | 0.00372 | 0.02484 |

- 경계상자가 **원본과 정확히 일치**한다. 1회차의 13% 잉크 손실이 사라졌고 오히려 3.6% 많은데, 이는 중심정렬 획을 24 좌표계에 직접 그릴 때 안티에일리어싱이 원본 래스터보다 살짝 두껍게 잡히는 정상 범위다(같은 규칙을 쓰는 chevron 도 동일).
- **1회차가 지적한 "24 프레임 평균은 희석된다" 는 문제가 이번 형상에서는 결과를 바꾸지 않는다** — 글리프 영역만 재도 0.00669 로 임계(0.015)의 절반 이하다. 즉 이번 자산은 어느 잣대로 재도 통과한다.
- 다만 **검사기 자체의 희석 취약성은 그대로 남았다** → O-1.

### F-2 (방향 반대) → 해소 확인

- 계산된 transform: `matrix(0, 1, -1, 0, 0, 0)` = CSS 시계 90°.
- 렌더 육안: `screens/4v2-matrix-light.png` 의 ×6 확대에서 **명백한 `v`(아래)**. 실제 검수 화면(`4v2-ui-review-14-15.png`)의 "홈 타이틀" 옆에서도 `v`.
- 정본 의미 대조: `build-components.ts:3169` 는 Figma 인스턴스 `rotation = -90`. Figma 는 **반시계 양수**라 −90 = 시계 90° = 아래. CSS 는 **시계 양수**라 같은 "아래" 가 `+90deg`. **숫자는 부호가 반대이고 의미는 같다** — 올바른 이식이다.
- 부품 CSS 주석·아이콘 manifest·컴포넌트 manifest 세 곳 모두 이 부호 반전을 명시적으로 적어 두었다(재발 방지 서술). 배선표 함정 T8 등재도 확인.

### F-3 (빨간 점 미배포) → 해소 확인

| 확인 항목 | 결과 |
|---|---|
| dist 에 accent SVG 존재 | ✅ `ui-library/dist/assets/icons/mobile-header-notification-accent.svg` · HTTP **200** |
| src ↔ dist 바이트 동일 | ✅ `diff -r` 차이 0 |
| CSS 마스크 URL 해석 | ✅ 개별 CSS·번들 CSS 양쪽 모두 정상 경로(번들은 `./assets/...` 로 재작성됨) |
| **Light** 점 색 | ✅ `rgb(255, 69, 84)` = `--color-icon-red` (#FF4554) |
| **Dark** 점 색 | ✅ `rgb(240, 96, 112)` = 다크 `--color-icon-red` (#F06070) |
| 본체 색 | ✅ Light `rgb(53,53,53)` / Dark `rgb(184,186,191)` = `--color-icon-gray-dark` |
| 정본 대조 | ✅ `build-components.ts:3173` 본체 `color/icon/gray-dark` + 점 `color/icon/red` 와 1:1 |
| 실제 소비 화면 | ✅ `pages/ui-review.html` 15번 섹션 Light·Dark 모두 빨간 점 |

---

## 3. 적대 테스트 기록 (검사기가 자기 몫을 실제로 잡는가)

모든 테스트는 파일을 잠시 훼손 → 검사 실행 → **sha256 대조로 원상복구 확인** 순으로 했다.

| # | 조작 | 기대 | 실제 |
|---|---|---|---|
| A1 | 점 조각의 좌표를 1px 이동 | 실패 | ✅ `❌ … 규칙대로 떼어낸 모양과 다릅니다 — 손으로 그린 조각을 쓰면 안 됩니다` |
| A2 | 점 조각을 부모의 **본체(pathIndex 0)** 도형으로 바꿔치기 | 실패 | ✅ 같은 오류로 차단 |
| A3 | 부모 자산 훼손(기록 stale) | 실패 | ✅ 전체 실패(부모 오류). **단 자식은 낡은 PASS 기록을 읽어 ✅ 로 표시된다 → O-2** |
| A4 | dist 에서 accent 파일 삭제 | 실패 | ✅ 차단됨. **다만 잡은 주체는 신설 `url()` 검사가 아니라 기존 아이콘 source/dist 대조**(등록됐기 때문에 먼저 걸림) |
| A5 | dist CSS 의 accent 경로를 배포 안 된 이름으로 변경(**1회차 F-3 과 같은 모양**) | 실패 | ✅ `dist CSS references a file that is not deployed: assets/icons/…-NOTDEPLOYED.svg (components/mobile-header.css → …)` — **신설 검사가 정확히 이 형태를 잡는다** |
| A6 | 부품 표본 격리 검사기 자체 적대 테스트 | 통과 | ✅ `--selftest` 4항목 전부 통과 |

**결론:** 신설 검사기 2종은 **자기가 잡아야 할 것을 실제로 잡는다.** 파생(`derivedFrom`) 선언은 "예외"가 아니라 더 값싼 다른 증명으로 작동한다 — 손으로 그린 조각은 통과하지 못한다.

---

## 4. 관찰(Observation) — 지금 막지는 않지만 기록해 둔다

| id | 무엇 | 왜 남기나 |
|---|---|---|
| **O-1** | **아이콘 원본 검사기의 희석 취약성이 그대로다.** 1회차 F-1 의 잘린 자산을 재현해 재측정하니 전프레임 오차 0.00372 로 **여전히 임계 0.015 를 통과**한다. | 이번 자산은 문제없지만, **같은 종류의 결함이 다시 들어오면 검사기는 또 못 잡는다.** 글리프 잉크 영역 기준 오차를 함께 재는 보강을 권한다(임계는 별도 보정 필요). |
| **O-2** | 파생 검사에서 **부모 기록이 낡았을 때 자식이 그 낡은 PASS 를 읽는다**(비기록 모드). | 단독으로 초록을 만들지는 못한다(부모가 error 를 낸다). 다만 "부모 PASS 확인" 이라는 방어선이 실제로는 한 겹 얇다. 자식 판정 전에 부모의 신선도(지문 일치)까지 확인하면 완결된다. |
| **O-3** | 신설 `url()` 검사의 스캔 대상은 `dist/s1-ui.css` + 컴포넌트 CSS 18개다. `dist/assets/css/tokens.css`·`typography.css` 와 예제 HTML 은 스캔하지 않는다. | **현재는 구멍이 아니다**(그 파일들의 `url()` 은 0건, 컴포넌트 목록은 dist 실물과 정확히 일치). 다만 나중에 `@font-face url()` 같은 것이 들어오면 검사 밖이다. |
| **O-4** | HD-2 로 note 는 고쳤지만 같은 항목의 `statesLayout` 은 여전히 `"matrix"` 다(실제 화면은 평면 목록). | 이 필드는 `vertical` 일 때만 기계가 읽으므로 지금 아무 것도 깨지지 않는다. 선언 위생 차원의 정리 대상. |
| **O-5** | `mobile-header-arrow-down.svg` 가 `chevron.svg` 와 **바이트 완전 동일**하다(sha `818bd5f7…`). Figma 노드·sourceKey·sourceExport 는 서로 다르다. | 처음에는 "chevron 을 복사한 것 아닌가" 를 의심했으나, 두 원본 내보내기 PNG(`ic_화살표더보기_solid.png` / `_line.png`)를 알파 채널로 대조하니 **평균차 0.000000 = 픽셀 완전 동일**이었다. 파일 바이트만 다르고 그림은 같다. **의심은 해소됐고, 이 사실을 남겨 다음 검증자가 같은 의심을 반복하지 않게 한다.** |
| **O-6** | 작업 트리에 **다른 세션의 미커밋 변경**이 섞여 있다(`plugins/figma-vars-installer/src/code.ts`·`src/ui.html`·신규 `build-patterns.ts`·`pattern-data.ts` = 설치기 '패턴' 탭). 검증 중에도 파일이 늘었다. | `gate:check` 의 유일한 error(Gate 6c "카드 날짜 4개여야 하는데 5개")가 **그 변경 때문**이다 — 이 작업 소유가 아니다. 또한 지금 커밋하면 남의 작업을 함께 삼킨다(알려진 멀티세션 함정). 커밋 전 분리 필요. |
| **O-7** | 빈 소비자 화면의 하단탭 2칸이 여전히 **세로로 쌓인다**. | HD-1(B)는 무효 ARIA 만 해소했고 바 배치는 화면 소유라는 정본 선언 그대로다. 예제 주석이 "스타일은 호스트 화면이 정한다" 로 명시하므로 **설계상 한계이지 결함이 아니다.** river 가 이미 알고 (B)를 골랐다. |

---

## 5. 검증하지 못한 범위 (정직 보고 — PASS 로 올리지 않는다)

| 범위 | 왜 |
|---|---|
| **실제 승격 상태에서의 Gate 44** | 두 부품이 `candidate` 라 검사기가 제외한다. **모의 승격(status 임시 approved)으로 17종 통과를 실측**했으나, 실제 승격 뒤 6-promotion 에서 반드시 재실행해야 한다. |
| **포인터 히트테스트(±21/±23 적중)** | 이번 회차 브라우저 창이 숨김 상태(viewport 0×0)라 `elementFromPoint` 가 동작하지 않았다. 대신 `::before` inset 이 4변 모두 **−6px**, 호스트 32×32·`position:relative` 임을 계산값으로 확인해 **44×44** 를 도출했다. 해당 CSS 는 이번 회차에 **한 줄도 바뀌지 않았다**(diff 확인). 1회차의 실제 히트테스트 결과가 여전히 유효하다고 본다. |
| **Figma V3.0 캔버스 시각 대조** | 상태파일이 `source: "not-consulted"` 로 선언 — verify-F 규격상 참고 대상 아님. 아이콘 5종만 Figma 원본 내보내기 PNG 로 실제 대조했다. |
| **Gate 19 커버리지(`data-cov-type` 표기·Platform 축 면제 등재)** | B3 `promotionTaskSpec` 이 이미 잡아 둔 승격 전 과제. 이번 범위 밖. |
| **Gate 6c 실패의 해소** | 다른 세션 소유. 원인 파일이 이 작업 밖임을 확인하는 데서 멈췄다. |
| **실제 기기·보조기기(스크린리더) 검증** | 헤드리스 브라우저 실측(ARIA 속성·포커스 규칙·계산 스타일)까지만. |
| **사람의 UX 판단** | 5-human-review(river) 소관. |

---

## 6. 증거 파일

| 파일 | 내용 |
|---|---|
| `screens/4v2-matrix-light.png` | 실제 dist 만 물린 정적 매트릭스 · 헤더 6종 + 하단탭 4칸 + 화살표 ×6 확대 (Light) |
| `screens/4v2-matrix-dark.png` | 같은 화면 Dark — 빨간 점·아래화살표·토큰 전환 확인 |
| `screens/4v2-ui-review-14-15.png` | 실제 검수 화면 `pages/ui-review.html` 14·15번 섹션(Light·Dark 패널) |
| `screens/4v2-empty-bundle.png` / `4v2-empty-individual.png` | 전체묶음 ↔ 개별설치 소비 결과 — **sha256 동일** |
| `screens/4v2-matrix.html` | 위 매트릭스를 만든 검증용 페이지(재현 가능하도록 보존) |

---

## 7. 권장 상태 전환

```json
{
  "workflowStatus": "in-progress",
  "uiLibraryStatus": "draft",
  "lastCompletedCheckpoint": 3,
  "checkpointLog[4]": { "status": "failed-minor", "by": "component-verifier (시나리오 F · 2회차)" },
  "nextAction": "F-4(헤더 manifest note 가 없는 필드를 선언 기제로 지목) 한 줄을 실제 기제(derivedFrom·derivationRule)로 고치고 npm run ui:build 후, 그 항목만 부분 재검증한다. 1회차 F-1·F-2·F-3 은 2회차에서 독립 실측으로 해소 확인됐다."
}
```

blocker 갱신 권고(오케스트레이터가 등재):

| id | severity | 상태 | what |
|---|---|---|---|
| B4 (=F-1) | error | **resolved 확인** | 화살표 글리프 잘림 — 경계상자·잉크량·오차 전부 원본과 일치 |
| B5 (=F-2) | error | **resolved 확인** | 회전 방향 — 렌더에서 아래(`v`) 확인, 정본 의미와 일치 |
| B6 (=F-3) | error | **resolved 확인** | 빨간 점 — dist 배포·Light/Dark 색 실측 일치 |
| B7 (=H-1) | question | **resolved (river HD-1 B)** | 코어 경계·부품 표본 격리와 충돌 없음 확인. 세로 쌓임은 설계상 한계로 남음(O-7) |
| B8 (=H-2) | question | **resolved (river HD-2 A)** | 선언 note ↔ 실제 화면 일치 확인. `statesLayout` 필드만 정리 대상(O-4) |
| **B9 (=F-4)** | **error** | **신규 open** | 헤더 manifest note 가 존재하지 않는 필드(`combinedOriginComparisonWith` 등)를 선언 기제로 지목한다 — 실제는 `derivedFrom`·`derivationRule` |
| B10 (=O-1) | warning | 신규 open | 아이콘 원본 검사기가 프레임 전체 평균만 재서, 작은 글리프의 형상 손실을 여전히 희석한다(옛 결함 재현 시 통과) |
| B11 (=O-6) | warning | 신규 open | 작업 트리에 다른 세션의 미커밋 설치기 변경이 섞여 있고 그 때문에 Gate 6c 가 실패한다 — 커밋 전 분리 필요 |


---

# 【1회차 · 2026-09-02 · FAIL 3 · HOLD 2】 4-verification — Mobile Bottom Nav · Mobile Header (시나리오 F 독립 검증)

> 아래는 **1회차 기록(보존)** 이다. 현재 유효한 판정은 이 파일 위쪽의 **2회차** 다.

- 작업: `mobile-nav-header` · 검증자: 🤖 `component-verifier`(시나리오 F) · 날짜: 2026-09-02
- 규격: `.claude/skills/ui-library-code/references/verify-F.md` · 함정목록 `references/wiring-and-traps.md §2`
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts` `buildMobileBottomNav`(:2983) · `buildMobileHeaderVariant`(:3093) · `buildMobileHeader`(:3184)
- 검증자는 **아무 파일도 고치지 않았다.** `workflow-state.json` 도 수정하지 않았다. 이 보고서와 `screens/4v-*.png` 증거만 추가했다.

## 검문소 결과

> **FAIL 3건 · HOLD 2건 · BLOCKED 0건 → 검문소 미통과.**
> 권고 `workflowStatus: blocked` · `uiLibraryStatus: draft`(candidate 유지) · `lastCompletedCheckpoint: 3` 유지 ·
> `nextAction`: FAIL 3건을 `ui-library-builder` 가 고친 뒤 **4-verification 재실행**. 5-human-review 로 넘기지 않는다
> (FAIL 2건은 river 가 화면에서 바로 보게 되는 시각 결함이다).

---

## 0. 판정 요약표

| # | 항목 | 판정 | 한 줄 근거 |
|---|---|---|---|
| 1 | 정본↔상태파일 지문 대조 | **PASS** | `canonicalInputs` 7건 전부 현재 파일 sha256 과 일치 · `ui:state` PASS |
| 2 | manifest canonicalFingerprint 실산출 | **PASS** | 두 부품 재계산값이 선언값과 동일(40d88e15… / 8d2bea4c…) |
| 3 | variant·state·size 전수 대조 | **PASS** | 하단탭 state 2종 · 헤더 Type 6종 1:1 · 정본에 없는 축 신설 0건 |
| 4 | StatusBar·Platform 축 제외(D5)의 정당성 | **PASS** | river 결정 + `notInCanon` 선언 + 사유 기록 (단 선언 누락 1건 → §관찰 O-1) |
| 5 | 하단탭 '바' 제외(D1)의 정당성 | **PASS** | 정본 주석 :2982 + registry anatomy 둘 다 "바는 컴포넌트 아님" |
| 6 | source→dist 재생성 결정론 · 손편집 없음 | **PASS** | `ui:build` 재실행 후 `diff -r` 차이 0 |
| 7 | 토큰 배선 (하드코딩 hex 0건) | **PASS** | 부품 CSS 의 hex/rgb/hsl **0건** · 참조 변수 32종 전부 정의됨 |
| 8 | Light·Dark 토큰 전환 | **PASS** | 12개 색 토큰 전부 다크에서 다른 값으로 실측 전환 |
| 9 | 렌더 기하 대조 (하단탭) | **PASS** | 60×60 · gap 4 · 아이콘 32 · 라벨 12/500/15.6/0 실측 일치 |
| 10 | 렌더 기하 대조 (헤더 6종) | **PASS** | 360×56 · 여백 12/6 · 좌 20/16 · gap 8/0 · 타이포 4종 실측 일치 |
| 11 | 아이콘 hit area·frame·glyph 독립 실측 | **FAIL** | **F-1** `mobileHeaderArrowDown` 글리프 잉크가 잘려 원본과 다르다 |
| 12 | 아이콘 회전 방향 대조 | **FAIL** | **F-2** 정본은 아래(↓), 웹은 위(↑) — 부호 규약 반대로 옮겼다 |
| 13 | 아이콘 원본 색·레이어 대조 | **FAIL** | **F-3** 알림 신규 점이 빨강이 아니라 회색 — accent 자산이 dist 에 없다(404) |
| 14 | 아이콘 source↔dist 동일성 | **PASS** | 등록 5종 바이트 동일 · `ui:icons` errors=0 |
| 15 | 알림 아이콘 대조 경계(결합형 1건) 타당성 | **부분 PASS** | 픽셀 대조 경계는 타당(도형 바이트 동일 증명) / **등록 경계는 부당 → F-3** |
| 16 | 키보드·포커스 | **PASS** | 3개 버튼 전부 `:focus-visible` 매치 · outline 2px rgb(29,108,235) offset 2px |
| 17 | ARIA·접근성 이름 | **PASS** | `role=tab`+`aria-selected` · aria-label 3종 · 아이콘 전부 `aria-hidden` |
| 18 | 터치 영역 44×44 | **PASS** | ±21px 히트테스트 7/7 버튼 적중 · ±23px 전부 비적중 = 정확히 44 |
| 19 | 오류 연결 · reduced motion | **PASS(해당없음)** | 정본에 Error·모션 없음 · CSS 에 transition/animation 0건 |
| 20 | jsRequired=false 선언의 사실성 | **PASS** | `runtime:null`·`init` 미존재 · auto-init 미등록 · 동적 삽입 4개 정상 |
| 21 | 다중 인스턴스 · 동적 재삽입 · 제거 | **PASS** | 로드 후 삽입 4칸 각각 60×60 · 선택 1칸만 파랑 · 중복 id 0 · 제거 후 잔여 0 |
| 22 | 빈 HTML 소비(전체묶음) | **PASS** | `empty-consumer.html` 렌더 정상 · 런타임 부재 단정 통과 |
| 23 | 빈 HTML 소비(개별설치) | **PASS** | 두 부품 CSS `<link>` 등재 · `<main>` DOM 완전 동일 |
| 24 | 전체묶음 ↔ 개별설치 동일성 | **PASS** | 계산스타일·기하 전항목 동일 + **픽셀 diff 0바이트**(2쌍) |
| 25 | 빈 소비자 화면에서 하단탭 표출 방식(B1 해소) | **HOLD** | **H-1** 바가 없어 탭 칸이 세로로 쌓인다 — "배포본만으로 제대로 보인다"를 이 부품은 증명 못함 |
| 26 | 배포 예제(`examples/mobile-bottom-nav.html`) 자체 유효성 | **HOLD** | **H-1** `role=tab` 이 `tablist` 없이 홀로 배포된다 |
| 27 | 안내 페이지가 실제 dist 만 소비 | **PASS** | `components.html`·`ui-review.html` 모두 dist 3파일만 · 부품 selector 재구현 0건 |
| 28 | 안내 페이지 실제 렌더 (Action 영역 존재) | **PASS** | 승격 후 모습을 읽기전용 오버레이로 미리 렌더 — 2섹션 모두 Action 표출 |
| 29 | 코드탭 생성 출처 | **PASS** | `ui-library-guide.js:119` 가 `dist/examples/{id}.html` 을 fetch |
| 30 | 등록부·거버넌스 배선 | **PASS** | a11yStatus=implemented · migration 2건 · `managedBy:ui-library-guide` |
| 31 | presentation-policy 선언 ↔ 실제 화면 | **HOLD** | **H-2** 헤더 정책 note 는 "상태 매트릭스도 목업 위"라는데 실제는 평면 목록 |
| 32 | `ui:contract` · `ui:test` · `ui:icons` · 아이콘 원본 게이트 | **PASS** | 전부 errors=0 (재실행 실측) |
| 33 | `gate:check` 전체 | **미확인(외부 실패)** | 현재 **4 error** — 전부 Gate 6c 설치기 zip 카드날짜, 이 작업 범위 밖 |
| 34 | Gate 44 안내화면 렌더 검사가 이 2종을 덮는가 | **미계측** | `ui-guide-render-check.js:134` 가 candidate 를 제외 — 승격 후 재실행 필요 |
| 35 | 폰트 정체성(Pretendard) | **PASS(조건부)** | 부품 CSS 는 family 미지정(호스트 소유) · 소비 화면 3곳 모두 Pretendard 선언 |
| 36 | Figma V3.0 캔버스 대조 | **미확인** | 상태파일이 `source: not-consulted`(코드 정본으로 충분) 로 선언 — 규격상 참고 대상 아님 |

---

## 1. ❌ FAIL — 반드시 고칠 것 (전부 (a) 코드 실수)

> 세 건 모두 **정본↔파생** 관계다. 두갈래 분류를 적용하지 않는다(하드룰 H6) — 파생을 고친다.

### F-1. `mobileHeaderArrowDown` 글리프가 잘려 원본보다 작게 그려진다

**무엇:** 웹 자산 `mobile-header-arrow-down.svg` 의 안쪽 `<svg data-s1-part="glyph">` 뷰포트가 **획(stroke) 좌표 기준**이 아니라 **경로(path) 좌표 기준**으로 잡혀 있다. 중심 정렬 획의 바깥 절반이 중첩 `<svg>` 뷰포트에 잘린다.

**독립 실측(48px 프레임, 24 좌표계 환산):**

| 대상 | 잉크 경계상자 | 잉크 총량 | 프레임전체 평균오차 | 글리프영역 평균오차 |
|---|---|---|---|---|
| Figma 원본 `assets/icons/ic_화살표더보기_solid.png` | (9.50, 7.00) **6.00 × 10.00** | 50.4 | — | — |
| 현재 웹 자산(2겹 구조) | (10.00, 7.50) **5.00 × 9.00** | 43.8 (**−13%**) | 0.00372 | **0.02484** |
| 잘림 없는 대조본(같은 도형을 바깥 24 viewBox 에 직접) | (9.50, 7.00) **6.00 × 10.00** | 52.5 | **0.00089** | — |
| 대조군 `home`(채움 도형) | 원본과 동일 | 비율 1.003 | 0.00169 | 0.00337 |

- 잘림 없는 대조본이 오차 **0.00089** 로 4.2배 좋아진다 = 원인이 뷰포트 잘림임이 실증된다.
- **왜 게이트가 통과했나:** `ui-library-icon-origin-check.js` 는 **24 프레임 전체 평균**으로 판정한다(임계 0.015). 이 글리프는 프레임의 약 3% 만 차지해 13% 잉크 손실이 0.00372 로 희석됐다. **글리프 영역만 재면 0.02484 로 임계를 넘는다.**
- manifest `geometry.glyph = (10.375, 7.75) 4.25×8.5` 도 **획을 포함한 잉크 경계가 아니라 경로 경계**다 — 획 기반 글리프에는 성립하지 않는 선언이다.

**근거:** `ui-library/src/assets/icons/mobile-header-arrow-down.svg` (안쪽 `<svg x="10.375" y="7.75" width="4.25" height="8.5" viewBox="0 0 4.25 8.5">` 안에 `stroke` 폭 1 의 경로) · 실측 스크립트 결과 위 표 · `reports/ui-library/mobile-nav-header/screens/4v-icon-arrow-vs-origin.png`

**분류:** ❌(a). 채움 전용 4종(home·back·close·notification)은 같은 문제가 없다(전부 정확 일치) — 획 기반 글리프에만 2겹 구조 규칙이 맞지 않는다.

### F-2. 아래화살표가 **위쪽(↑)** 으로 그려진다 — 정본은 아래(↓)

**무엇:** 정본은 `makeRequiredIconInstance("mobileHeaderArrowDown", iconDark, 24, undefined, -90)` 으로 인스턴스 `rotation = -90` 을 준다. **Figma `rotation` 은 반시계 양수**이므로 −90 = 시계 90° → 오른쪽 쉐브론(`>`)이 **아래(`v`)** 를 향한다. 웹 CSS 는 같은 숫자를 그대로 `transform: rotate(-90deg)` 로 옮겼는데 **CSS 는 시계 양수**라 −90 = 반시계 90° → **위(`^`)** 를 향한다. 부호 규약이 반대다.

**실측:** 계산 transform = `matrix(0, -1, 1, 0, 0, 0)`(반시계 90°). 렌더 결과가 `^` 로 확인된다.

**정본·문서와의 모순 3중:**
- 아이콘 id 가 `mobileHeaderArrowDown`
- 정본 상태파일: "헤더에서는 −90° 회전해 **아래 방향**"(`workflow-state.json` iconNodes.mobileHeaderArrowDown.note)
- 부품 CSS 주석: "서브타이틀 옆 **아래화살표** — 원본은 −90° 회전해 **아래 방향으로 쓴다**"(`mobile-header.css:102`)

즉 **선언은 전부 '아래', 실제 렌더는 '위'** 다. 숫자가 같아도 시각이 다른 전형적인 사례(시각 매칭 2대 원리 ①).

**근거:** `ui-library/src/components/mobile-header/mobile-header.css:110` (`transform: rotate(-90deg)`) · `screens/4v-matrix-light.png`·`4v-matrix-dark.png`(홈 타이틀 옆 `^`) · `screens/4v-zoom-notification-arrow.png`(×8 확대) · `screens/4v-ui-review-14-15.png`(실제 검수 화면에서도 `^`)

**분류:** ❌(a).

### F-3. 알림 아이콘의 '신규' 점이 **빨강이 아니라 회색** 으로 배포된다

**무엇:** 정본은 본체 `color/icon/gray-dark` + 신규 점 `color/icon/red` **2색**이다(`build-components.ts:3173` `accentVar = scv(maps,"color/icon/red")`). 웹은 `::after` 두 번째 마스크로 2색을 만드는데, 그 마스크가 가리키는 **`mobile-header-notification-accent.svg` 가 dist 에 존재하지 않는다(HTTP 404).** 마스크 이미지 로드 실패 → `::after` 가 전부 마스크아웃 → 아래 본체색(회색)이 그대로 보인다.

**원인(확정):** `ui-library/scripts/build.mjs:41·73·132` 는 **`assets/icons/manifest.json` 의 `icons` 배열에 등록된 자산만** dist 로 복사한다. 빌더가 accent 를 "비등록 보조 자산"으로 두었기 때문에(3-build.md §G) 복사 대상에서 빠졌다.

**증명(3단 비교 · `screens/4v-notification-accent-404.png`):**

| 조건 | 결과 |
|---|---|
| src 자산(파일 존재) + 같은 2겹 규칙 | **빨간 점** — Figma 원본과 일치 |
| dist 자산(accent 404) = 실제 배포본 | **회색 점** — 정본 불일치 |
| Figma 원본 PNG | 빨간 점 |

- 즉 **2겹 마스크 기법 자체는 정상**이다. 결함은 오직 "자산이 dist 에 없다" 한 가지이므로 수정 방향이 분명하다.
- `ls ui-library/dist/assets/icons/` 에 `mobile-header-notification-accent.svg` 없음 / `curl` 404 확인.
- 보조 증거: `registry/governance/ui-library-migration.json` 의 mobile-header `dependencies` 에는 이 파일이 **의존물로 선언돼 있다** — 장부는 필요하다고 말하는데 빌드가 내보내지 않는다.
- 실제 소비 화면에서도 재현: `pages/ui-review.html` 15번 섹션(`screens/4v-ui-review-14-15.png`)에서 회색 점. 같은 화면 본문은 "알림 아이콘은 2색(본체 gray-dark + 신규 점 red)이라 CSS 마스크 2겹으로 표현합니다"라고 쓰여 있어 **화면이 자기 설명을 배반한다.**

**왜 모든 게이트가 통과했나(사각지대):**
- `ui:icons`·아이콘 원본 게이트는 **등록된 아이콘만** 검사한다 → 비등록 자산은 검사 대상 밖.
- `ui-library/scripts/test.mjs:362` 도 `iconManifest.icons` 순회뿐 → **부품 CSS 의 `url(...)` 이 dist 에서 실제로 해석되는지 검사하는 장치가 없다.**
- 빈 소비자 화면·코드탭 예제에는 알림 유형(`home-title-subtitle`)이 없어 눈으로도 안 걸렸다.

**분류:** ❌(a).

**§ 빌더가 올린 경계 질문에 대한 판정 (3-build.md §G):**
- **픽셀 대조를 결합형 1건으로 한 것 = 타당(PASS).** accent 의 경로 `d` 값이 등록 자산 `mobile-header-notification.svg` 의 **두 번째 경로와 바이트 단위로 동일**하고 glyph 프레임 속성(`x/y/width/height/viewBox`)도 완전히 동일함을 결정론적으로 확인했다. 부분 도형을 따로 픽셀 대조할 이유가 없다.
- **점 레이어를 '등록'에서 뺀 것 = 부당(FAIL).** 이 저장소에서 **등록(icon manifest)이 곧 배포 통로이자 게이트 적용 범위**다. 등록에서 빼면 자산이 dist 에 안 실리고, 어떤 검사기도 그 사실을 못 본다. "대조 방식"과 "등록 여부"는 분리해서 결정해야 했다.

---

## 2. ❓ HOLD — 확인 필요 ((c) 애매 · 검증자가 임의 판정하지 않음)

### H-1. "혼자서는 완성될 수 없는 부품"을 배포 표면에서 어떻게 보여줄지

정본이 "4탭 바는 컴포넌트가 아니다"(`build-components.ts:2982`)라고 선언한 것 자체는 맞고, B1 해소(인라인 style 제거·`role="tablist"` 유지)의 **정본 충실성은 PASS** 다. `role=tablist` 를 남긴 것도 ARIA 상 `role=tab` 의 유효 조건이라 옳다. 다만 두 가지 부작용이 남는데, 어느 쪽을 기준으로 삼을지는 계약 소유자 판단이 필요하다.

1. **빈 소비자 화면**(`ui-library/verification/empty-consumer.html:149-158`): 바 레이아웃이 없어 탭 칸 2개가 **세로로 쌓여** 그려진다(`screens/4v-empty-consumer-bundle.png`). 이 화면의 목적("소비자는 CSS 를 한 줄도 안 써도 배포본만으로 제대로 보인다")을 **이 부품에 대해서는 증명하지 못한다.** 그런데 검사기(`test.mjs:374`)가 이 화면의 인라인 style 을 금지하므로 화면 안에서 해결할 방법이 없다.
2. **배포 예제**(`ui-library/dist/examples/mobile-bottom-nav.html`): `role="tab"` 버튼 1개만 들어 있어 **그대로 복사하면 tablist 없는 홀로된 `role=tab`** 이 된다(무효 ARIA). registry a11y 는 "탭 목록은 role=tablist·각 항목 role=tab 으로 표시"를 요구하는데 배포 예제는 그 요구를 스스로 만족하지 못한다.

**선택지(river/오케스트레이터 판단):**
- **(A)** 지금 그대로 둔다 — 대신 빈 소비자 화면과 예제에 "이 부품은 화면이 `role=tablist` 컨테이너로 조립한다"를 **문서로만** 명시. 배포 예제는 조립 없는 조각으로 인정.
- **(B)** 예제·빈 소비자 화면에 **꾸미기 없는 `<nav role="tablist">` 래퍼만** 포함(레이아웃·배경은 여전히 화면 소유). 인라인 style 금지 규칙과 충돌하지 않는다.
- **(C)** 바 레이아웃을 **선택 부품(optional part)** 으로 배포본에 정식 편입 — 정본 선언을 바꾸는 일이므로 Gate 34 승인 사항.

**안 정하면:** 현재대로 (A) 이며, 배포 예제를 복사한 개발자가 무효 ARIA 를 만들 수 있다.

### H-2. 헤더 안내 화면의 표출 방식 선언과 실제 화면이 다르다

`registry/governance/component-presentation-policy.json` 의 `components.mobile-header.note` 는 **"Action·상태 매트릭스 모두 360×780 모바일 목업 위에서 보여준다(D6)"** 라고 선언한다. 실제 구현은 Action 만 목업 위에 올리고, Type 6종 상태 매트릭스는 **평면 목록**(`ui-library-guide.js:1402` `uilg-mobile-header-list`)이다(`screens/4v-guide-mobile-header.png`).

- river 결정 D6 원문은 "안내 화면에서 실제 360×780 모바일 목업 위에 올려 보여준다"까지이고, "상태 매트릭스도"는 정책 note 에서 추가된 말이다.
- 실제 구현(평면 목록)은 부품 표본 격리 규칙(`data-guide-sample="part"`)과 더 잘 맞는다 — 목업 크롬 위에 6종을 올리면 표본에 부품 아닌 것이 섞일 위험이 커진다.
- 그래서 **정책 note 를 화면에 맞게 고칠 일**인지 **화면을 note 에 맞게 고칠 일**인지 검증자가 정할 수 없다. registry 는 메타의 기준이지만, 이 note 는 river 결정문을 확장한 것이라 확장분의 권한이 불분명하다.

**선택지:** **(A)** 정책 note 를 실제 화면대로 정정("Action 은 목업, 상태 매트릭스는 목록") / **(B)** 상태 매트릭스도 목업 위로 옮긴다. **안 정하면** 선언과 화면이 계속 어긋난 채로 남는다.

---

## 3. 상세 근거

### 3-1. 지문·결정론 (항목 1·2·6)

```
canonicalInputs 7건 → 전부 MATCH (build-components.ts / vars-data.ts / textstyles-data.ts /
  ui-library-code-contract.json / registry mobile-bottom-nav·mobile-header / icons manifest)
npm run ui:state -- reports/ui-library/mobile-nav-header/workflow-state.json → ✅ PASS
manifest 지문 재계산: mobile-bottom-nav 40d88e15f0bb… = 선언값 / mobile-header 8d2bea4c0ccb… = 선언값
npm run ui:build 재실행 후 diff -r (재생성 전 사본 ↔ 재생성 후) → 차이 0 "NO DRIFT"
src/components/{id}/{id}.css == dist/components/{id}.css → true (두 부품)
s1-ui.css 의 component 구간 == 개별 CSS(아이콘 경로 재작성 후) → true (두 부품)
```

`3-build.md §B` 가 적은 지문(`9c152fe7…`·`47bb563d…`)은 **현재값과 다르다**(등록부 수정 뒤 재산출된 것으로 보인다). manifest·dist 가 서로 일치하고 재계산도 맞으므로 실물에는 문제가 없으나, **3-build 보고서의 그 수치는 낡았다**(문서 정정 대상).

### 3-2. variant·state·size 전수 대조 (항목 3~5)

| 정본 | 배포본 | 판정 |
|---|---|---|
| `state=unselected` / `state=selected` | `aria-selected="false"` / `"true"` | ✅ 1:1 |
| hover·disabled 없음 | 만들지 않음 | ✅ D2 준수 |
| 60×60 고정, 크기 축 없음 | `sizes: []` | ✅ |
| `Type=Home / Title` … 6종 | `home-title` … 6종 (`canonicalVariantMap`) | ✅ 1:1 |
| `Platform=[App, Web]` | 제외 (`notInCanon.platform`) | ✅ D5 (§O-1 참조) |
| StatusBar 27/77, root 99/149 | 제외 (`notInCanon.statusBar`) | ✅ D5 |
| 삭제된 `Home / Title + 2 Icons` | 만들지 않음 | ✅ |

**D5 제외 판정 근거:** ①river 가 결정자 자격으로 2026-09-02 승인 ②부품 manifest `notInCanon` 에 사유가 기계가독으로 선언됨 ③사유가 실질적으로 타당하다(상태바·주소창은 OS·브라우저 소유라 웹 코드로 내보내면 가짜 크롬이 된다) ④Type 축은 온전히 보존됐다. 따라서 "정본에 있는데 파생에서 뺐다"가 **미신고 누락이 아니라 신고된 범위 축소**다.

**D1 제외 판정 근거:** 정본 주석(`build-components.ts:2982` "4탭 '바'는 설치기에서 만들지 않음 — Tab Item 세트만")과 registry `anatomy` 의 `{"part":"바(bar)","role":"컴포넌트가 아님 …"}` 이 **독립적으로 같은 말**을 한다. 부작용은 H-1 로 분리했다.

### 3-3. 실제 렌더 실측 — PC·Mobile × Light·Dark

렌더 방법: 저장소 루트를 로컬 HTTP(127.0.0.1)로 서비스하고, **실제 dist** (`dist/assets/css/tokens.css` + `typography.css` + `s1-ui.css`)만 물린 정적 매트릭스를 헤드리스 크롬으로 렌더 → `getBoundingClientRect` + `getComputedStyle` 전항목 수집(함정 T1·T2·T4 회피). 다크는 `data-theme="dark"`.
증거: `screens/4v-matrix-light.png` · `screens/4v-matrix-dark.png`

**하단 탭 (Light / Dark)**

| 정본 | 실측 | 판정 |
|---|---|---|
| 60×60 FIXED, VERTICAL, 가운데 정렬 | 60×60, `column`, `center`/`center` | ✅ |
| `itemSpacing 4` | `gap: 4px` (아이콘 하단 36.2 → 라벨 상단 40.2) | ✅ |
| `fills = []` (배경 투명) | `rgba(0,0,0,0)` | ✅ |
| 아이콘 32 | 32×32 | ✅ |
| unselected 아이콘 `color/icon/gray` | `rgb(85,87,95)` = 토큰 프로브 동일 / 다크 `rgb(138,140,150)` | ✅ |
| selected 아이콘 `color/icon/blue` | `rgb(29,108,235)` / 다크 `rgb(48,112,216)` | ✅ |
| 라벨 12 Medium (body/12M = 130% · 0%) | `12px / 500 / 15.6px / normal` | ✅ |
| unselected 라벨 `navigation/label/default` | `rgb(85,85,85)` / 다크 `rgb(85,87,95)` | ✅ |
| selected 라벨 `navigation/label/selected` | `rgb(29,108,235)` / 다크 `rgb(48,112,216)` | ✅ |

**헤더 6종 (Light / Dark)**

| 정본 | 실측 | 판정 |
|---|---|---|
| AppBar 360×56 | 6종 모두 360×56 | ✅ |
| 여백 상하 12 (`Home / Title + Subtitle + 1 Icon` 만 6) | `12px` 5종 · `home-title-subtitle` 만 `6px` | ✅ |
| 좌 여백 Home 20 / Standard 16, 우 16 | `padding: 12px 16px 12px 20px` (home) · `… 16px` (standard) | ✅ |
| `itemSpacing 8`(Standard) / 미설정=0(Home) | `gap: 8px` / `normal`(=0) | ✅ |
| 배경 `color/bg/home`(Home) | `rgb(245,246,251)` / 다크 `rgb(12,29,56)` | ✅ |
| 배경 `color/bg/level-0`(Standard) | `rgb(255,255,255)` / 다크 `rgb(13,14,18)` | ✅ |
| Standard 제목 18 Medium `title/18M`(130% · −2%) 중앙 | `18px / 500 / 23.4px / −0.36px`, `text-align:center` | ✅ |
| Home 제목 18 Bold `title/18B`(130% · 0%) 좌측 | `18px / 700 / 23.4px / normal`, `left` | ✅ |
| 서브타이틀 14 Regular `body/14R`(130% · −2%), `text/body/tertiary` | `14px / 400 / 18.2px / −0.28px`, `rgb(117,117,117)` / 다크 `rgb(138,140,150)` | ✅ |
| 제목 색 `text/title/primary` | `rgb(0,0,0)` / 다크 `rgb(236,237,240)` | ✅ |
| 2줄 스택 gap 2, 제목행 gap 4 | 제목행 하단 229.9 → 서브 상단 231.9 (=2) · 제목 우단 86.375 → 화살표 90.375 (=4) | ✅ |
| 액션 슬롯 32×32, 아이콘 24 | back·close·notification 32×32 · 아이콘 24×24 | ✅ |
| 아이콘 색 `color/icon/gray-dark` | `rgb(53,53,53)` / 다크 `rgb(184,186,191)` | ✅ |
| 알림 accent `color/icon/red` | **회색으로 렌더 → F-3** | ❌ |
| 화살표 24, −90° | 24×24 / 회전 방향 반대 → **F-2** · 글리프 잘림 → **F-1** | ❌ |

토큰 프로브 12종 전부 Light↔Dark 값이 다르게 해석됨(다크 대응 실재 확인).

### 3-4. 아이콘 독립 실측 — 틀(frame)·도형(glyph)·source↔dist

각 자산을 192px 로 래스터화해 잉크 경계상자를 **직접 측정**하고, 같은 좌표계로 환산한 Figma 원본 내보내기와 대조했다(빌더 선언값을 신뢰하지 않고 재측정).

| id | manifest 선언 glyph | 웹 자산 실측 잉크 | Figma 원본 실측 잉크 | source==dist | 판정 |
|---|---|---|---|---|---|
| `home` | (3, 3.9983) 18×16.0034 | (3, 4.000) 18×16.000 | (3, 4) 18×16 | ✅ | ✅ |
| `mobileHeaderBack` | (3, 4.2137) 18×15.5726 | (3, 4.188) 18×15.625 | (3, 4) 18×16 | ✅ | ✅ (48px 양자화 범위) |
| `mobileHeaderClose` | (4, 4) 16×16 | (4, 4) 16×16 | (4, 4) 16×16 | ✅ | ✅ |
| `mobileHeaderNotification` | (3, 3.0024) 18×17.9953 | (3, 3.000) 18×18.000 | (3, 3) 18×18 | ✅ | ✅ (도형) / ❌ (색 = F-3) |
| `mobileHeaderArrowDown` | (10.375, 7.75) 4.25×8.5 | **(10.375, 7.75) 4.25×8.5** | **(9.5, 7) 6×10** | ✅ | ❌ **F-1** |

- **hit area·frame·glyph 를 서로 대신하지 않았다:** hit area 는 히트테스트(±21 적중 / ±23 비적중 = 44×44), frame 은 SVG 바깥 24×24 및 슬롯 32×32, glyph 는 위 잉크 실측으로 각각 따로 측정했다.
- 등록 5종의 `sourceKey` 가 정본 `ICON_KEYS`(`build-components.ts:1180-1184`)와 **완전 일치**(정확 대조 항목 — 두갈래 미적용).
- `npm run ui:icons` → `UIICON_SUMMARY icons=11 errors=0`(적대 테스트 통과) · `ui-library-icon-origin-check.js` → `icons=9 errors=0 warnings=2`. 경고 2건(`check`·`edge_set`)은 이 작업 소유가 아닌 기존 부채.
- 5종의 `svgSha256` 이 `reports/ui-library/icon-origin-verification.json` 기록값 및 manifest `webAssetFingerprint` 와 일치 = 3-build 이후 자산이 바뀌지 않았다.

### 3-5. 접근성·행동 (항목 16~21)

```
포커스: nav/back/close 각각 focus({focusVisible:true}) → matches(":focus-visible")=true,
        outline "2px solid rgb(29,108,235)", outline-offset "2px"  (= --border-width-2 · --color-form-control-border-selected · --spacing-2)
CSSOM: :focus-visible 규칙 2건이 dist CSS 안에 실제 존재 확인
탭 순서: 문서 순서 그대로 nav → back → close (임의 tabindex 없음)
접근성 이름: 하단탭 = 라벨 텍스트("홈") · back "이전" · close "닫기" · notification "알림"
아이콘: 전부 aria-hidden="true" (장식)
44×44 터치: 7개 액션 버튼 × (±21 전부 BUTTON 적중 / ±23 전부 비적중) → 정확히 44×44, 인접 요소와 겹침 없음
::before 실측: content:"" · position:absolute · inset −6px 4방향 (32+12=44)
런타임: jsRequired=false · runtime=null · init 미존재(undefined) · auto-init.js 미등록
다중/동적: 로드 후 4칸 동적 삽입 → 전부 60×60, 2번째만 파랑, 중복 id 0건, innerHTML="" 후 잔여 노드 0
모션: dist CSS 에 transition/animation/@keyframes 0건 → reduced-motion "not-applicable" 선언과 일치
```

`role=tab` 의 tablist 컨테이너 요구는 H-1 로 분리했다(선언은 있으나 배포 예제가 스스로 만족하지 못함).

### 3-6. 설치 동일성 (항목 22~24)

```
<main> DOM: empty-consumer.html ↔ empty-consumer-individual.html  → diff 없음
개별 소비본에 두 부품 CSS <link> 등재 (empty-consumer-individual.html:25·26)
계산스타일·기하 전항목(root+모든 part, 8케이스, Light·Dark): 전체묶음 == 개별설치 → true
픽셀 diff: empty-consumer 전체페이지 2000×4800 → 다른 바이트 0 / 28,800,000
픽셀 diff: 8케이스 매트릭스 840×1120 → 다른 바이트 0 / 2,822,400
package.json exports 6줄 · index.js/s1-ui.js/s1-ui.auto.js export 2건 확인
```

### 3-7. 안내 페이지 (항목 27~29)

- `pages/components.html:9-12` · `pages/ui-review.html:7-10` — 의존은 Pretendard CDN + **dist 3파일뿐**. 컴포넌트 CSS/JS 를 별도로 물지 않는다.
- `assets/css/ui-library-guide.css` 안의 부품 selector 언급은 2줄뿐이며(`:572`·`:597`) 모두 **폭 지정**(`width:100%` / `max-width:360px`)이다 — 색·여백·타이포 재구현 0건. 다만 §O-3 참조.
- 코드탭: `ui-library-guide.js:119` `new URL("../../ui-library/dist/examples/{id}.html")` → **source example 에서 생성된 dist 예제**를 fetch. ✅
- 안내 화면 실제 렌더: dist manifest 의 두 부품 `status` 를 **읽기전용 오버레이 서버에서만** `verified` 로 바꿔 내려보내 승격 후 모습을 미리 확인했다(**저장소 파일 무수정**). 두 섹션 모두 Action 영역·상태 매트릭스·코드탭이 정상 표출된다 → 함정 T6("미계측을 통과로 보지 않는다") 대응 완료. 증거 `screens/4v-guide-bottom-nav.png` · `screens/4v-guide-mobile-header.png`
- 현재(승격 전) `pages/components.html` 이 "승인 배포본을 불러오지 못했습니다"를 표출하는 것은 `ui-library-guide.js:1576` 의 의도된 상태 게이트다 — **결함 아님**(확인함).

---

## 4. 관찰 사항 (판정 아님 · 고치면 좋은 것)

- **O-1. `notInCanon` 선언이 D5 범위를 다 못 담는다.** StatusBar·Platform 은 선언돼 있으나, 정본이 함께 갖는 **root 세로 컨테이너(`itemSpacing 16` = 상태바↔AppBar 간격, root fill, 360×99/149)** 는 언급이 없다. 범위 축소를 기계가독으로 완결하려면 이 항목도 `notInCanon` 에 적는 것이 맞다.
- **O-2. 안내 화면 목업이 정본 간격을 반영하지 않는다.** 정본은 상태바와 AppBar 사이 16px 간격에 root 배경색이 보이는데, 목업은 상태바 띠에 헤더가 바로 붙어 있다(`screens/4v-guide-mobile-header.png`). 목업은 D6 로 "안내 화면 전용 크롬"이라 선언돼 계약 위반은 아니지만, 5-human-review 에서 river 가 볼 지점이다.
- **O-3. 안내 화면 CSS 가 부품 공개 selector 에 `max-width` 를 건다.** `ui-library-guide.css:597`. manifest `cssContract.customization` 은 "공개 selector 의 구조를 override 하지 않는다"고 하므로, 래퍼 쪽에 폭을 주는 편이 계약에 더 맞다. 값 자체는 정본 360 과 같아 시각 피해는 없다.
- **O-4. `standard-no-title` 의 빈 제목 자리 높이가 24 다**(`mobile-header.css:56`). 정본 grow 프레임은 32 다. 내용이 없고 root 높이가 56 고정이라 **렌더 결과는 동일**함을 실측으로 확인했다(6종 모두 360×56). 값만 정본과 다르다.
- **O-5. 안내 화면 `componentConfig` 의 `runtime` 항목이 죽은 배선이다.** `ui-library-guide.js:102·108` 이 `S1UI.mobileBottomNav`/`mobileHeader` 를 넣지만 `init` 호출은 명시적 id 목록으로 제한돼(`:1626`) 이 둘을 포함하지 않는다. 지금은 무해하지만 목록이 늘 때 `TypeError` 위험이 있다.
- **O-6. registry note 의 줄번호가 낡았다.** `registry/components/mobile-bottom-nav.json` `_meta.notes` 가 `build-components.ts:2604`·`components.html:6279` 를 인용하는데 현재 정본 주석은 `:2982` 이고 그 손관리 섹션은 3-build 에서 삭제됐다.
- **O-7. `3-build.md §B` 의 지문 2건이 현재값과 다르다**(§3-1). 문서 정정 대상.
- **O-8. 게이트 사각지대 2건 — 검사기 보강 권고.**
  ① **부품 CSS 의 `url(...)` 자산이 dist 에서 실제로 해석되는지 검사하는 장치가 없다**(F-3 의 통과 경로). `test.mjs` 에 "CSS 가 참조하는 모든 자산이 dist 에 존재" 검사를 넣으면 결정론적으로 막힌다.
  ② **아이콘 원본 대조가 프레임 전체 평균만 본다**(F-1 의 통과 경로). **글리프 경계상자 내부 평균**을 함께 판정하거나, 획 기반 글리프의 잉크 경계를 선언·대조하도록 규칙을 보강해야 한다.

---

## 5. 검사기 실제 실행 결과 (재실행 실측)

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ `UI_CONTRACT_SUMMARY status=candidate errors=0` |
| `npm run ui:build` | ✅ 103 files · 재생성 후 dist 차이 0 |
| `npm run ui:test` | ✅ 통과 |
| `npm run ui:icons` | ✅ `icons=11 errors=0` (적대 테스트 통과 · warnings 2 = 기존 부채) |
| `node scripts/ui-library-icon-origin-check.js` | ✅ `icons=9 errors=0 warnings=2 threshold=0.015` (단 F-1 은 이 판정 방식의 사각지대) |
| `npm run ui:state -- …/workflow-state.json` | ✅ PASS |
| `npm run components:guide-model:check` | ✅ 정본 일치 (43개) |
| `npm run components:behavior:check` | ✅ PC 20개 계약 연결 |
| `npm run components:facts:check` | ✅ 최신 |
| `npm run design:md:check` | ⚠️ DESIGN.md 드리프트 없음 / **Agent Contract 1건 실패 = Modal 항목**(`design-md-agent-contract-check.js:64`) — 이 작업 diff 에 Modal 없음, 범위 밖 |
| `node scripts/ui-guide-render-check.js` | ✅ 15종 통과 — **이 2종은 candidate 라 제외됨**(`:134`), 승격 후 재실행 필요 |
| `npm run gate:check` | ❌ **4 error / 13 warning** — 전부 **Gate 6c 설치기 zip 카드날짜**(`installer:build` 필요). 이 작업 범위 밖이지만 커밋 훅이 막으므로 승격 전 해소 필요 |

> ⚠️ `workflow-state.json` 의 `gateSnapshot` 은 "gate:check PASSED · 오류 0"이라고 적혀 있으나 **검증 시점에는 사실이 아니다**(Gate 6c 4건). 스냅샷 이후 다른 세션이 정본을 건드린 결과로 보인다.

---

## 6. 검증하지 못한 범위 (통과로 쓰지 않음 · 미확인)

| 항목 | 왜 미확인인가 |
|---|---|
| Figma V3.0 캔버스 시각 대조 | 상태파일이 두 컴포넌트를 `source: "not-consulted"`(코드 정본으로 충분)로 선언했고 verify-F 는 V3.0 을 "상태 파일이 필요하다고 선언한 경우에만" 참고하라고 규정한다. **아이콘 5종은 Figma 원본 내보내기 PNG 로 실제 대조했다.** |
| Gate 44(안내화면 렌더 검사)의 이 2종 커버리지 | 검사기가 candidate 를 제외한다. **승격(6-promotion)에서 status 가 올라간 뒤 반드시 재실행.** 또한 이 검사기는 렌더 DOM ↔ dist CSS 를 대조하므로 **F-1·F-2·F-3 같은 "Figma 원본과의 차이"는 원래 잡지 못한다**(대조 축이 다르다). |
| Gate 19 커버리지(`data-cov-type`·`data-cov-platform`) | B3 `promotionTaskSpec` 이 이미 실측해 둔 승격 전 할 일. `pages/components.html:2880` 의 `data-cov-type` 이 슬러그(`home-title` 등)이고 정본 표기(`Home / Title` 등)와 다르다는 점, Platform 축 면제를 `variant-coverage-baseline.json` 에 등재해야 한다는 점 모두 이번 검증 범위 밖(6-promotion·river 확인). |
| Gate 6c(설치기 zip) 실패의 원인 추적 | 이 작업 소유가 아니다. 실패 항목이 Foundation·Semantic·Text Styles 카드 날짜여서 이 작업이 건드리지 않은 표면임을 확인하는 데서 멈췄다. |
| 실제 모바일 기기·터치·스크린리더 검증 | 헤드리스 브라우저 실측(히트테스트·ARIA 속성·포커스)까지만 했다. 실제 보조기기 낭독 결과는 미확인. |
| 사람의 UX 판단(목업 여백·정보량 등) | 5-human-review(river) 소관. O-2 를 그 자리에 올려 둔다. |

---

## 7. 권장 상태 전환

```json
{
  "workflowStatus": "blocked",
  "uiLibraryStatus": "draft",
  "lastCompletedCheckpoint": 3,
  "checkpointLog[4]": { "status": "failed", "by": "component-verifier (시나리오 F)" },
  "nextAction": "F-1(화살표 글리프 잘림)·F-2(회전 방향 반대)·F-3(알림 accent 자산 dist 누락)을 ui-library-builder 가 고치고, H-1·H-2 를 river 에게 올린 뒤 4-verification 재실행. 재검증 시 아이콘 글리프영역 오차와 dist 자산 404 를 함께 재측정한다."
}
```

신규 blocker 권고(오케스트레이터가 등재):

| id | severity | what |
|---|---|---|
| B4 | error | `mobileHeaderArrowDown` 웹 자산의 획이 중첩 `<svg>` 뷰포트에 잘려 원본보다 작게 그려진다(글리프영역 오차 0.02484 > 0.015) |
| B5 | error | 헤더 아래화살표가 CSS `rotate(-90deg)` 로 **위쪽**을 향한다 — Figma 회전 부호 규약이 반대다 |
| B6 | error | `mobile-header-notification-accent.svg` 가 dist 에 없어(404) 알림 신규 점이 빨강이 아니라 회색으로 배포된다 |
| B7 | question | (H-1) tablist 없이 배포되는 `role=tab` 예제·세로로 쌓이는 빈 소비자 화면 — 선택지 A/B/C |
| B8 | question | (H-2) presentation-policy 헤더 note 와 실제 상태 매트릭스 표출 방식 불일치 — 선택지 A/B |
