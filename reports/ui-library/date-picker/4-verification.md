# 4-verification — Date Picker (오케스트레이터 검증)

작성: ⭐ 오케스트레이터 · 2026-09-03
독립 검증(🤖 component-verifier 시나리오 F)은 별도 문서 `4-verification-independent.md`.
계약의 위험 조건 3가지에 해당해 **독립 검증을 생략하지 않았다** — ①복합 flow·접근성 동작 신규 ②다중 컴포넌트 상태 연결(휠 시트가 tab·button 재사용) ③작업 중 자동 검사 차단 이력.

---

## 1. 자동 검사

| 검사 | 결과 | 비고 |
|---|---|---|
| `npm run ui:contract` | ✅ PASS | policy=candidate, errors=0 |
| `npm run ui:icons` | ✅ PASS | icons=13 errors=0 (calendar 신규 포함) |
| `npm run ui:build` | ✅ PASS | 110 files |
| `npm run ui:test` | ✅ PASS | |
| `npm run ui:guide:render` | ✅ PASS | 18종 — date-picker 는 draft 라 대상 밖(승격 후 19종) |
| `node scripts/variant-coverage-check.js` | ✅ PASS | pairs=49 verified=49 newGaps=0 |
| `npm run gate:check` | ❌ 5 error | **전부 Gate 34 = river 타이핑 승인 대기**(uistate:date-picker.default/filled/open/hover/disabled). 다른 error 0 |

### 작업 중 해소한 차단 2건
- **저장소 전체 빌드 정지(사전 존재)** — 커밋 `dc5ac98` 이 정본을 바꾸고 모듈 지문 갱신을 빠뜨려 `ui:build` 가 `input` 에서 즉시 실패하고 있었다. 변경 hunk 가 `buildOrderFor`(5719)·`buildAllComponents`(5843) 뿐임을 확인하고 19개 지문을 재계산했다(`workflow-state.json fingerprintRefreshes`).
- **깨진 import 경로** — 휠 시트 작업 중 들어간 `../tab/tab.js` 가 dist 평탄 구조에서 404 를 내 `s1-ui.js` 전체 로드가 죽었다(브라우저 콘솔로 확인). 빌더가 기존 관례대로 `./tab.js` 로 교정.

---

## 2. 실제 렌더 확인 (http, `file://` 아님)

| 대상 | 확인 | 근거 |
|---|---|---|
| PC · Light | ✅ | `screens/review-pc-light.png` — 트리거 4상태 × 3크기, 달력 패널 356×352, 일요일 시작(일=`text/sunday` 빨강 · 토=`text/saturday` 파랑), 오늘 10일 테두리 원, 선택 17일 채운 원, 25일 비활성, 지난달 30·31 흐림 |
| PC · Dark | ✅ | 패널 `panel/bg`(gray-dark/100) 적용, 대비 정상, 요일 색 다크 대응 |
| Year / Month 화면 | ✅ | 4행×3열 88×56 타일. Year 2025 선택(파란 테두리·파란 글자), 2021~2023·2030~2032 비활성. Month 1월 선택 |
| 기간 선택(D4·D6) | ✅ | 17일 시작(테두리 원) → 18~21 띠(`cell/bg/range`) → 22일 종료(채운 원). 트리거 `26.01.17 - 26.01.22` |
| 모바일 날짜 시트(M7) | ✅ | `screens/mobile-sheet-light.png` — 배경 딤, 상단 라운드 8, 헤더 "날짜 선택"+닫기, 캘린더, 하단 "적용"(button 코어 primary LG) |
| 모바일 시간 휠 · TimeOnly | ✅ | `screens/mobile-wheel-timeonly.png` |
| 모바일 시간 휠 · DateTime | ✅ | `screens/mobile-wheel-datetime.png` — 날짜/시간 탭(Line Tab 재사용), 오전·오후 열 포함 |

### 렌더에서 잡아 고친 결함 3건 (⭐ 직접)
| # | 증상 | 원인 | 조치 |
|---|---|---|---|
| F1 | 연·월 칸이 **전부 비활성 회색** | 검수 화면 정적 표본이 모든 타일에 무조건 `disabled` 를 붙임(`pages/ui-review.html`) | 조건부로 교정 · 죽은 코드 제거 |
| F2 | 패널이 옆 칸 침범 + 큰 빈 칸 | 2열 고정 격자에 356px 패널 · 자리확보를 전 슬롯에 적용 | 칸 폭 `minmax(380px,1fr)` · 자리확보를 정적 표본에만 |
| F3 | 시트 폭 360px 고정 | 정본 `SHEET_W=360` 을 CSS 고정폭으로 직역 | `width:100%; max-width:360px` — 360 은 Figma 모바일 프레임의 **화면 폭**(3757)이므로 웹에서 화면 폭을 따르는 것이 같은 뜻. date-picker·time-picker 양쪽 적용 |

### 오판했다가 실측으로 정정한 것 1건
휠 시트가 "폭을 넘치고 세로 정렬이 어긋난 것처럼" 보였으나, 브라우저 실측 결과 vw=375 에서 panel `x=8 w=360`(중앙), wheel `h=272`, fade top `440~550` · bottom `602~712`, 선택 행이 그 사이 빈 띠(550~602)에 정확히 놓여 있었다. **눈짐작이 틀렸고 구현은 정상이었다.**

---

## 3. 정본 이탈·결정 반영 확인

| ID | 확인 |
|---|---|
| D3/CU-1 | 웹 일요일 시작 ✅ (Figma 정본은 월요일 시작 — 이탈로 기록, 후속 작업) |
| D4 | 역순 클릭 시 새 시작일 — 코드 경로 확인, 실제 클릭 검증은 독립 검증에 맡김 |
| D5/CU-2 | 헤더 연·월 라벨 분리 ✅ 렌더 확인. 새 시각 부품 0건 |
| D6 | 기간 미리보기 — 정본 기존 토큰만 사용 ✅ |
| 새 색 토큰 | 0건 ✅ (`ui:contract`·`gate:check` 의 HEX·토큰 검사 통과) |

---

## 4. 검증하지 못한 것 (정직하게)

- **키보드 전 시나리오**(Home/End·PageUp/Down·격자 화살표·포커스 복귀)를 내가 직접 키 입력으로 돌리지 않았다 — 독립 검증에 위임.
- **다중 인스턴스 동시 동작**과 `init/destroy` 를 실제로 반복 실행해 보지 않았다 — 독립 검증에 위임.
- **Figma 원본 대조** 미수행(MCP 미인증). 시각 정본은 코드(`build-components.ts`)이며 그 대조는 했으나, Figma 캔버스와의 대조는 이번 범위 밖.
- `pages/components.html` 안내 화면의 date-picker 표출은 **승격 후에만** 확인 가능하다(현재 draft 라 "승인 배포본 아님" 안내가 뜨는 것이 설계된 동작).

---

## 5. 판정

**⭐ 오케스트레이터 판정: 조건부 PASS** — 자동 검사는 Gate 34(승인 대기)를 제외하고 전부 통과했고, 실제 렌더로 PC·Mobile × Light·Dark 와 기간 선택·연월 화면·두 종류 바텀시트를 확인했다. 다만 계약상 **독립 검증이 필수**인 작업이므로 `4-verification-independent.md` 의 판정이 나오기 전에는 4단계 통과로 선언하지 않는다.
