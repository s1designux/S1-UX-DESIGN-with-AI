# Mobile Header — 2. Build Plan v2 (river 결정 반영 · 2026-08-25)

> v1(오전 빌드) 결과를 river 가 렌더로 검수해 4건을 결정했다. 이 문서가 v2 빌드의 기준이다.

## river 결정 (2026-08-25)

| # | 결정 | 근거 |
|---|---|---|
| 1 | `Home / Title + 2 Icons` **유형 삭제** | 실제로 쓰지 않는 기준. (부수효과: v1 이 원본의 알림×2 를 알림+닫기로 잘못 만든 결함도 함께 소멸) |
| 2 | 백/닫기 아이콘 색 = **`color/icon/gray-dark`(#353535)** | V2.4 원본 실측값. v1 은 `color/icon/gray-light` 로 잘못 바인딩 |
| 3 | Standard 타이틀 **중앙정렬 유지** | river 확인 — 원본 의도가 중앙정렬이 맞음. v1 그대로 |
| 4 | 신설 유형 이름은 **`Standard / No Title`** 이 맞음 | river 자신의 `home_notitle` 표기는 착오. 회원가입 9개 화면 전부 뒤로가기 있는 Standard 계열 |
| 5 | **`Standard / No Title + Close` 추가** | 회원가입 화면2(약관 상세) = 제목 없음 + 닫기. 문구를 비워 쓰는 편법(레거시의 흰 글자 숨김과 동일)을 피하기 위해 정식 유형으로 신설 |

## 최종 6종 (Type 단일 축 — v1 구조 유지)

세트명 `Mobile Header` · 전 variant 360×99 (StatusBar 27 + gap 16 + AppBar 56)

| # | Type 값 | 좌측 | 타이틀 | 우측 | 배경 |
|---|---|---|---|---|---|
| 1 | `Standard / Title` | Back(#353535) | 중앙 · `title/18M` | 빈 슬롯 | `color/navigation/bg` |
| 2 | `Standard / Title + Close` | Back(#353535) | 중앙 · `title/18M` | Close(#353535) | `color/navigation/bg` |
| 3 | `Standard / No Title` | Back(#353535) | 없음 | 빈 슬롯 | `color/navigation/bg` |
| 4 | `Standard / No Title + Close` ⭐신규 | Back(#353535) | 없음 | Close(#353535) | `color/navigation/bg` |
| 5 | `Home / Title + Subtitle + 1 Icon` | 없음 | 좌측 · `title/18B` + 화살표 / 서브 `body/14R` | 알림 1개 | ⚠️ 결정 대기 (아래) |
| 6 | `Home / Title + Alt Title` | 없음 | 좌측 · `title/18B` | 없음 | `color/navigation/bg` |

## 색상 바인딩 조회표

| 값 | 용도 | 정본 조회 결과 | 지시 |
|---|---|---|---|
| #353535 | Back·Close 아이콘 | `color/icon/gray-dark` ✅ | 토큰 바인딩 필수 (v1 오류 수정) |
| #000000 | 타이틀 텍스트 | `color/text/title/primary` ✅ | 유지 |
| #757575 | 서브타이틀 | `color/text/body/tertiary` ✅ | 유지 |
| #FF4554 | 알림 accent | `color/icon/red` ✅ | 유지 |
| #FFFFFF | Standard 배경 | `color/navigation/bg` ✅ | 유지 |
| **#F5F6FB** | **Home 배경** | **등가물 없음** — 현재 `color/bg/level-2`(=#F5F5F5, 푸른기 없음)로 **잘못** 칠해져 있음 | **⛔ HD — river 결정 대기. 이번 v2 빌드에서는 손대지 않고 v1 상태 유지** |

## 허용편차 선언

- 허용편차 #1: `Standard / Title` 의 **우측 빈 슬롯** — V2.4 원본(540:6113)에는 렌더에 보이지 않는 정체불명 아이콘 노드(`previous`, 540:6132)가 있으나, 레거시 실수로 판단해 정본에서는 빈 스페이서로만 재현한다. (빌더에게: 아이콘 넣지 말 것)
- 허용편차 #2: 컴포넌트에 **StatusBar 를 내장**한다(360×99). 원본 구조 그대로이며, 화면 조립 시 StatusBar 를 따로 얹지 않는다.

## 검증자 확인 요청 (component-verifier)

- 서브타이틀 유형의 **아래화살표 아이콘 색**이 현재 `color/icon/gray-light` 다. 원본 실측에서 이 아이콘의 색이 확정되지 않았다 — 원본과 대조해 (a)/(b)/(c) 로 판정할 것. ⭐ 가 임의로 바꾸지 않았다.
- `Home / Title + Alt Title` 이 Home 계열인데 배경만 흰색인 것은 원본 실측 그대로다. 원본 오류인지 의도인지 미확정 — (c) 후보.

---

## v3.1 이후 추가 — 허용편차 선언 보강 (2026-08-25)

- **허용편차 #3: 서브타이틀 유형의 아래화살표 아이콘이 원본과 다른 컴포넌트다.**
  원본은 `ic_menu_arrow_down`(key `e694d942…`)이지만 **V3 파일로 import 가 불가능**해,
  아이콘 라이브러리 V2.2 의 오른쪽 화살표(419:68, key `6babc3f4…`)를 **-90° 회전**해 쓴다.
  **river 승인 2026-08-25** (근거: `registry/components/mobile-header.json` `_meta.notes`).
  이 선언이 2-plan-v2.md 에 빠져 있어 component-verifier 가 ❓(c)로 올렸다 — 선언 누락이었고 대체 자체는 승인된 것이다.
  (빌더에게: 색·크기는 원본을 따른다 = `color/icon/gray-dark` · 24px)

## v3.1 검증에서 나온 ❌(a) 5건 — 수정 지시 (2026-08-25)

| # | 결함 | 조치 |
|---|---|---|
| a1 | 아래화살표 색이 `color/icon/gray-light` — 원본은 stroke #353535 | 코드 ✅ 수정 / Figma 재바인딩 필요 |
| a2 | 아래화살표 크기 16 — 원본·Figma 는 24 | 코드 ✅ 수정 / Figma 확인 |
| a3 | 상태바 투명화가 Figma 에만 있고 코드에 없음 → 재생성 시 이음매 재발 | 코드 ✅ 수정(`statusInst.fills = []`) |
| a4 | Figma 세트의 variant 나열 순서가 코드·기록과 다름(Home 이 중간에 낌) | Figma 재정렬 필요 |
| a5 | 폐기된 `Alt Title` 이름이 스펙 시트 셀 프레임에 잔존 | Figma 개명 필요 |
