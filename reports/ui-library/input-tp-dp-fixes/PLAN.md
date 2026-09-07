# 인풋·타임피커·데이트피커 구동 지적 6건 — 계획서 (river 승인 완료, 착수 대기)

작성 2026-09-07 · 기준 커밋 `3f7252c` · **착수 조건: `password-search-input` 세션이 커밋을 끝낼 때까지 대기(river 결정 A)**

## 왜 대기하는가
`assets/js/ui-library-guide.js` · `assets/css/ui-library-guide.css` · `ui-library/src/components/input/*` 를
다른 세션(`reports/ui-library/password-search-input/workflow-state.json`, phase `3-build` / `awaiting-user`)이
커밋 전 상태로 고치고 있다. 같은 파일을 지금 만지면 한쪽 변경이 유실된다.

## river 결정 (원문 그대로)

- **HD-A → A** : `HD-A -> A`
  → 기본 인풋·패스워드·서치를 **각각 독립 카드**로 분리하고 **개발 코드도 박스마다 그 형태의 마크업**을 붙인다.
    페이지 분리(B)는 하지 않는다. 세 형태는 여전히 같은 부품(`data-s1-component="input"`)이다.

- **HD-B → A** : `HD-B -> A, 트리거 클릭시 단순 바텀시트가 딤배경위에 표출되는데, 그렇게 하지말고 모바일 목업에 해당 트리거와 다음 동작을 모두 얹어서 모바일에서 실제 보는듯하게 구성해야함`
  → ① 모바일 타임피커 기본 동작을 목록 드롭다운 → **휠 바텀시트**로 교체(2026-09-02 결정 뒤집기 — Gate 34 승인 기록 필요)
    ② 트리거와 열린 시트를 **모바일 목업(`.uilg-phone`) 안**에 얹어 실제 폰 화면처럼 보이게 한다

- **데이트피커 시트도 동일 적용** : `A, 데이트피커 시트도 같이 목업 안에 넣어줘`

## 고칠 것 6건 (원인은 코드 판독 수준 — 착수 시 실제 렌더로 재확인)

| # | 증상 | 원인 위치 |
|---|---|---|
| A-1 | 기본·패스워드·서치가 한 박스 | `ui-library-guide.js:753~779` — 한 `preview-area` 안에서 `<hr>` 로만 구분 |
| M-1 | 모바일 인풋 폭이 타이핑 시 변함 | `components.html:410` `.comp-action-top{align-items:flex-start}` + `ui-library-guide.css:153` `.uilg-input-action{max-width:240px}` → 자식 폭이 내용에 맞춰 줄었다 늘어남 |
| M-2 | 패스워드 상태별 placeholder 잘림 | `ui-library-guide.js:727` 열 너비 180px 고정(PC 공통) — 모바일은 여백16+눈48 로 글자칸 116px |
| M-3 | 서치도 동일 | `ui-library-guide.js:751` 동일 원인(+돋보기 48) |
| D-1 | 데이트피커 모바일 열 제목 어긋남 | `.matrix-col-header{text-align:center}`(components.html:338) vs `ui-library-guide.css:290` 데이트피커 셀만 `flex-start` |
| T-1 | 모바일 타임피커가 드롭다운 | 현재 사양 — `time-picker/manifest.json:114` (wheel 은 `data-mobile-ui="wheel"` 옵션) |

## 지켜야 할 경계
- **배포본(dist·src)의 시트 `position: fixed` 는 건드리지 않는다** — 실제 서비스에서 맞는 동작이다.
  목업 안에 가두는 것은 **안내 화면 전용 래퍼**에서만 처리한다.
  (`time-picker.css:260` · `date-picker.css:470`)
- 목업 틀은 이미 있다 — `.uilg-phone` 360×780 (`ui-library-guide.js:1494`, 하단탭·헤더 안내 화면이 사용 중). 새로 만들지 않는다.
- T-1 은 승인된 기본 동작을 바꾸는 것이므로 **착수 전 Gate 34 승인 기록**(`--by river --quote` 위 HD-B 원문).

## 검증 계획
로컬 서버 실제 렌더 대조(file:// 로는 dist 로딩이 막혀 본문이 비어 나온다 — 2026-09-07 실측) + 🤖 `component-verifier` 독립 검증.

---

# 실행 결과 (2026-09-07, 다른 세션 커밋 `860603a` 이후 착수)

| # | 무엇을 고쳤나 | 어디를 고쳤나 | 확인 방법·수치 |
|---|---|---|---|
| A-1 | 기본 인풋·패스워드·서치를 **상자 3개**로 분리, 상자마다 개발 코드 | `assets/js/ui-library-guide.js` (`demoBlockConfig`·mountGuide blocks·codeViewer(id,key)) · `assets/css/ui-library-guide.css` `.uilg-demo-block` | 렌더 DOM 에 `data-guide-block=base/password/search` 3개. 각 상자 코드칸이 배포본 선언 예제와 글자 일치(검사기 1b) |
| M-1 | 모바일 인풋 Action 폭 흔들림 | `.uilg-input-action { width: 240px }` | 타이핑 전/중 필드 폭 **168→216 이던 것이 240→240** |
| M-2·M-3 | 패스워드·서치 placeholder 잘림 | `colWidth(breakName)` — Mobile 열 180→200px | 글자 필요폭 vs 실제폭 대조: **잘림 2건 → 0건** (PC 도 0건) |
| D-1 | 데이트피커 모바일 열 제목 어긋남 | `[data-guide-component="date-picker"] .matrix-col-header { text-align:left }` | 렌더 확인 — 제목이 목업 왼쪽 끝에서 시작 |
| T-1 | 모바일 타임피커 목록 → **휠 바텀시트**, 목업 안에서 열림 | `time-picker.mobile.example.html`(목록 형태 제거) → `npm run ui:build` · src manifest 주석 갱신 · 가이드 mobileContent | 시트 열림 실측: 폰 화면 안(340×733) · 패널 450 · **바닥 붙음 gap 0** |
| T-2 | 데이트피커 모바일 시트도 목업 안 | 같은 CSS(`.uilg-phone [data-s1-part="sheet"]{position:absolute}` + 뿌리 static) | 시트 열림 실측: 폰 안 · 패널 490 · 바닥 gap 0 |

## 건드리지 않은 것
- **정본 `build-components.ts` 0줄.**
- **배포본의 시트 `position: fixed`** — 실제 서비스에서 화면 전체를 덮는 것이 맞는 동작이라 그대로 뒀다. 목업 안에 가두는 것은 안내 화면 전용 CSS 뿐이다.

## ⭐ 가 스스로 판단한 것 (river 가 명시하지 않음 — 되돌릴 수 있음)
- 모바일 타임피커 화면에서 **「목록 칸 상태」 표를 뺐다.** 목록 드롭다운이 더 이상 모바일 동작이 아니라 그 칸을 모바일 화면에 두면 틀린 안내가 된다고 봤다. PC 화면에는 그대로 있다.
- 모바일 열 너비 200px, Action 폭 240px 은 실측(필요폭 125·잘림 11px)에 여유를 둔 값이다.

## 검사기
- `npm run ui:zip` · `npm run board:refresh` 재생성 완료.
- `scripts/ui-guide-render-check.js` 에 **상자별 코드 대조(1b)** 추가 — 새 기준을 만들지 않고 기존 ①규칙을 상자 수만큼 적용. 일부러 서치 상자에 기본 인풋 코드를 물려 **실패하는 것을 확인**한 뒤 되돌렸다.
- `npm run gate:check` — 남은 error 는 **설치기 zip 툴팁/카드날짜 1건뿐이며 내 변경 이전(HEAD `860603a`)부터 있던 것**이다(임시 작업트리에서 HEAD 만으로 재현 확인). `npm run installer:build` 로 풀리지만 다른 세션 작업 영역이라 손대지 않았다.

---

# 🤖 독립 검증 1회차 (component-verifier, 2026-09-07) — FAIL 판정 → 교정 완료

검증자가 ❌ 2건 · ❓ 3건을 냈다. ❌ 2건은 실제 결함이라 고쳤고, ❓ 는 river 에게 올린다.

| 판정 | 무엇 | 교정 |
|---|---|---|
| ❌ A-1 | `.uilg-phone [data-s1-component] { position: static }` 이 시트 안 Line Tab 뿌리까지 static 으로 만들어 탭 밑줄이 시트 바닥으로 **404px** 날아갔다 | 시트를 가진 두 부품(`time-picker`·`date-picker`)만 지목하도록 좁힘. 재실측: 탭 `position:relative` 복귀, `::before top:31px`(탭 높이 32) = 자기 바닥 |
| ❌ A-2 | 모바일 기본을 시트로 바꿔놓고 상태표 표본 12개 중 10개가 옛 목록 마크업(`aria-haspopup=listbox` + `panel`) | `timePickerMarkup({sheetMode})` 신설 — 모바일 표본은 트리거만(`aria-haspopup=dialog`). 재실측: **12/12 dialog, listbox 0건** |
| ❓ C-1 | manifest 의 river 인용문이 **실제 발화가 아니었다**(⭐ 가 요약을 따옴표로 적음) | 실제 발화로 교체하고, 선택지 A 본문은 대화에만 있다는 사실을 함께 적었다. → **river 확인 항목으로 보고** |
| ❓ C-2 | ⭐ 가 스스로 건 "Gate 34 승인 기록" 조건을 지키지도 철회하지도 않음 | Gate 34 는 토큰·컴포넌트 *항목* 신설만 추적해 이번 변경은 기계적으로 해당 없음. 조건을 잘못 건 것이라 명시하고 철회 → **river 확인 항목으로 보고** |
| ❓ C-3 | 모바일에서 「목록 칸 상태」 표를 뺀 것 | 검증자도 정당한 파생 판단으로 봄. river 에게 사실만 보고 |

## 검사기 구멍 3개도 막았다 (검증자 지적)
1. **자기신고 없으면 무음 통과** → 신고 속성이 없으면 **실패**로 올린다.
2. **끝 경계를 `uilg-rules` 에 기대** → 그 섹션이 없으면 마지막 상자가 빠졌다 → 여는 태그로만 끊는다.
3. **코드 칸만 보고 화면은 안 봄**(A-2 가 새어나간 경로) → `demoOpeningParity` 신설: 화면 표본의 열림 방식(panel/sheet)과 `aria-haspopup` 이 **선언한 예제 파일과 같은지** 대조. 값은 예제에서 읽는다 — 「패널이면 listbox」처럼 짝을 지어 두면 그것이 검사기가 만든 기준이 된다(Date Picker 는 패널인데 dialog 다. 실제로 이 함정에 한 번 빠져 교정했다).

세 구멍 모두 **일부러 되돌려 실패하는 것을 확인**한 뒤 되돌렸다.

---

# river 검수 2회차 지적 2건 (2026-09-07)

## 1. 데이트피커 모바일에 상태값·최하위 요소 설명이 빠졌다 → 보강 완료
Action(휴대폰 목업)만 남기고 아래 층을 통째로 지웠던 것을 되살리고, 정본이 선언한 최하위 부품까지 채웠다.

| 층 | 내용 |
|---|---|
| 상태값 | 트리거 5상태(Default·Hover·Filled·Disabled·Open) × 단일/기간 — manifest `states` 전수 |
| 캘린더 | Date · Year · Month 뷰 |
| 기간 선택 | 완료(17~22) · hover 미리보기 |
| **최하위 요소(신규)** | **날짜 칸**(Type=Standard: Default·Hover·Today·Selected·Disabled / Type=Range: Default·Start·End·Disabled) · **월·년 칸**(Default·Hover·Selected·Disabled) |

최하위 요소의 상태 이름·색은 📖 source-reader 가 읽어 온 정본 선언 그대로다
(`buildCalendarCell` build-components.ts:3520-3612 · `buildCalendarTile` :3615-3646). 새 상태를 만들지 않았다.
hover 표본은 `data-force-state="hover"` 로 세우고 값은 배포본 hover 규칙을 가리킨다(새 색 0건).
PC 화면에도 같은 최하위 요소 표를 붙였다 — 같은 부품인데 화면마다 설명이 다르면 안 된다.

## 2. 모바일 타임피커 바텀시트가 정본과 상이하다 → 1건 교정 · 2건 river 결정 대기

📖 source-reader 가 정본(`buildTimePickerMobileBottomSheet` :4134-4319)과 웹 CSS 를 나란히 읽었다.

| 항목 | 정본 | 웹(교정 전) | 조치 |
|---|---|---|---|
| 열 간격 | 오전오후↔시각묶음 **36** · 시↔콜론↔분 **32** | 간격 규칙 없음(폭만 지정) | ✅ **교정** — `column-gap:32` + 오전오후 다음 열만 +4 |
| 휠 열 구성 | **두 변형 모두 4열**(오전/오후·시·콜론·분) | TimeOnly 3열(오전/오후 없음) | ⏸ **river 결정 대기** |
| 휠 위아래 여백·행 높이 | 여백 40, 정적 목록(스크롤 개념 없음) | 스크롤 창 272 · 행 44 · 열폭 64/48/24 | ⏸ 2026-09-03 승인 시 `notInCanon.wheelScrollMechanism` 으로 선언된 웹 전용 값 — river 확인 |
| 글자·색·흐림(fade) | 32px Regular `text/state/accent` · fade 110 4-stop | 동일 | ✅ 일치 |
| 헤더·푸터·패딩·라운드 | 20/32/8 | 동일 | ✅ 일치 |

---

# river 결정 3건 반영 (2026-09-07 · HD-3 / HD-4 / 설치기)

## HD-3 — 모바일 시트는 24시간제 없음, 오전/오후 휠 하나
river 원문: `HD-3 B - 모바일 데이트피커는 24시간제는 없음. 오전/오후 열 들어간 휠 바텀시트 하나만 제공함.`
- `time-picker.mobile.example.html`: TimeOnly 를 `data-type="12h"` + **오전/오후 열 추가**(4열) → dist 재생성
- 안내 화면도 같은 형태로. 유형이 한 가지가 되어 **모바일 상태표에서 유형 축 제거**(값이 하나뿐인 축 금지, river 확정 2026-09-02)
- 정본과 열 구성 일치: 정본도 두 변형 모두 4열(build-components.ts:4276-4283)

## HD-4 — 열었을 때 값이 가운데 놓이게
river 원문: `HD-4 B - B`
- 기본값 **오전 9:30** — 정본 Time Picker 의 Filled 표본 `09:30` 과 같은 값(새 값 만들지 않음)
- 함정: 시트가 닫혀 있는 동안 열 높이가 0 이라 스크롤 위치가 안 잡힌다 → **열 때 다시 잡는다.**
  이미 고른 값이 있으면(`data-filled`) 그 자리를 지킨다. 트리거 값은 "적용" 전까지 바뀌지 않는다.

## 설치기 zip 날짜 오류 — 근본 원인 제거 (river 지시: 헷징 방안)
`scripts/lib/installer-history.js` 의 `lastChangeDate`·`lastSpecChangeDate` 가
**정본 소스 4개 중 하나라도 더러우면 카드 4장을 전부 "오늘"로 찍고** 있었다.
그 상태로 zip 을 만들고 커밋하면, 커밋 뒤 재계산값(그 스코프가 마지막으로 바뀐 날)과 **영구히 어긋난다.**
실제로 그렇게 났다 — 다른 세션이 `build-components.ts` 를 고치는 중에 zip 을 빌드했고,
Foundation·Semantic·Text Styles 는 손대지도 않았는데 날짜가 2026-09-07 로 찍혔다.

**고친 방식(느슨하게가 아니라 정확하게):** 더럽더라도 **그 스코프의 지문이 HEAD 와 실제로 다를 때만** 오늘로 본다(`dirtyChanged`).
정말 그 스코프를 고친 채 커밋 전이면 종전과 똑같이 오늘로 찍힌다 — 게이트가 약해지지 않는다.
`npm run installer:build` 재실행 후 **Gate Check PASSED (error 0)**.

---

# river 검수 3회차 지적 3건 (2026-09-07)

| # | 지적 | 원인 | 고친 곳 | 실측 |
|---|---|---|---|---|
> ⚠️ **이 표의 휠 수치(41.6 · 272 · row-gap)는 4회차에서 42 · 270 · 114 로 대체됐다.** 아래 「4회차」 절이 최신이다.

| 1 | 휠 간격이 Figma 와 다름 | 웹이 행을 **44px 통짜**로 잡아 정본보다 30px 가까이 좁았다. 정본은 항목 높이를 글자 그대로 두고(32×130%=41.6) 항목 사이 간격 32 를 준다(build-components.ts makeWheelCol :4276-4283) | `time-picker.css` — 행 41.6 + `row-gap:32`, 위아래 여백 `(272-41.6)/2` | 행높이 **41.6** · 행간격 **32** · 피치 **73.6** |
| 2 | 목업 시트가 열리면 바깥 화면 스크롤이 멈춤 | 배포본이 시트를 열 때 `document.body` 스크롤을 잠근다 — 실제 서비스에서는 화면 전체를 덮으므로 맞는 동작이다. 목업 안에서는 페이지를 덮지 않는데도 잠겼다 | **배포본은 그대로 두고** 안내 화면에서만 되돌림 — 목업 안에서 열린 경우에만(`s1:*:open` → `.uilg-phone` 안이면 잠금 해제) | 시트 열린 상태에서 `body overflow = visible` |
| 3 | 열었을 때 현재 시각이 뜨게 | 기본값이 09:30 고정이었다 | `time-picker.js` — `wheelNow()`: 지금 시각, 분은 소비자가 정한 간격(minuteStep)의 아래 눈금으로 내림 | 실측 15:41 → 휠 가운데 **오후 3:41** |

- 2번은 date-picker 시트에도 같이 적용된다(같은 잠금을 쓴다).
- 3번은 트리거 값을 바꾸지 않는다 — "적용"을 눌러야 값이 남는 동작은 그대로다. 이미 고른 값이 있으면 그 자리를 지킨다.
- 검사기: 안내 화면 렌더 검사 ✅ · `gate:check` **PASSED (error 0)**.

---

# river 검수 4회차 — 휠 좌우 패딩 (2026-09-07) · **정본 신설 1건**

## river 지적
`휠영역 좌우 패딩이 달라. https://www.figma.com/design/cysG5U1udpQqVagYY1hWHW/...?node-id=2386-57755
정본이랑 똑같이(figma처럼) 만들라고 했는데 왜 자꾸 다르게 만드는건데?`
이어서: `정본이 제대로 안잡혀있으면 그걸 검수먼저 했었어야지`

## 무엇이 잘못돼 있었나 (순서의 실패)
정본(build-components.ts)은 휠 열 폭을 **지정하지 않는다**(auto-layout hug). 그래서 웹은 값을 받지 못했고,
이전 세션이 `64/48/24` 를 지어 넣고 `notInCanon` 으로 선언해 두었다. ⭐ 는 그 상태를 알고도
**정본 결함으로 올리지 않고** 그 위에서 간격만 고쳤다. 올바른 순서는 «정본에 수치가 없다 → 정본 검수부터» 였다.

## Figma 원본 실측 (node 2386:57682 · TimeOnly · 시트 폭 360)
| 요소 | x | 폭 |
|---|---|---|
| ampm | 68 | 56 |
| hour | 160 | **20** (7·8·9 **한 자리 정지 샘플**) |
| colon | 212 | 9 |
| minute | 253 | 39 |
- 열 간격 36 / 32 / 32 · 텍스트 높이 42 · 행 피치 74 · 휠 높이 270 · **좌우 여백 68**

## 왜 원본 68 을 그대로 못 쓰나
원본 68 은 시 열이 **한 자리**일 때만 성립한다. 실제 휠은 1~12 를 굴리므로 두 자리 폭이 필요하고,
그만큼 좌우가 줄어든다. 즉 «원본과 똑같이 68» 은 굴러가는 목록과 양립하지 않는다.
또 원본 39 를 그대로 쓰면 브라우저 Pretendard 에서 "59"(38.72~39.9)가 아슬아슬해 잘릴 수 있다.

## river 승인 — A′ (원문: `권장안으로 적용해봐`, 2026-09-07T07:26:45Z)
제안 시 **68→58 변화와 "설치기를 돌리면 Figma 원본 그림도 새 폭으로 다시 그려진다"는 파급을 표에 명시**하고 승인받았다.

| 항목 | 원본 | **정본에 못 박은 값(A′)** |
|---|---|---|
| 오전오후 / 시 / 콜론 / 분 | 56 / 20 / 9 / 39 | **56 / 40 / 8 / 40** |
| 열 간격 | 36 / 32 / 32 | 그대로 |
| 항목 높이 · 피치 | 42 · 74 | 그대로 |
| 휠 창 높이 | 270 | 그대로 |
| 좌우 여백 | 68 | **58** (시 열 20→40 만큼) |
| 위아래 스크롤 여백 | — | **114** = (270−42)/2 |
**전부 정수로 떨어진다 — 소수점 0건.**

## 어디에 넣었나
- 정본 `build-components.ts` — `WHEEL_COL_W = { ampm: 56, hour: 40, colon: 8, minute: 40 }` 신설,
  열 프레임 `counterAxisSizingMode="FIXED"` + `resize`. 실패 시 **throw**(조용히 100 폭으로 굳는 것 방지).
- 웹 `time-picker.css` 는 그 값을 그대로 쓴다. **값의 출처가 정본 한 곳이 되었다.**
- `notInCanon.wheelScrollMechanism` 정정 — 이제 웹 전용으로 남는 것은 **스크롤 메커니즘뿐**이다.
  (종전 선언문의 44/272 는 폐기. 42·270·열 폭은 정본에서 내려온다.)

## 남은 것 — Figma 반영
정본 코드가 Figma 를 만드는 구조라, **설치기를 돌려야 캔버스도 새 폭(시 20→40, 좌우 68→58)이 된다.**
현재는 코드·웹만 일치하고 Figma 는 옛 그림이다.

## 🤖 독립 검증 (component-verifier, Gate 13)
1회차 **FAIL — ❌3건(전부 기록·주석이 코드와 어긋남)**: ①notInCanon 선언문이 옛 수치 ②CSS 에 모순되는 옛 주석 잔존
③이 회차가 PLAN.md 에 없음. 정본 코드·값 일치·승인 인용 진위·빌드 검문소 무력화 여부는 전부 PASS.
→ 3건 모두 교정하고 이 문서로 ③을 해소했다. 재검증 요청 예정.
