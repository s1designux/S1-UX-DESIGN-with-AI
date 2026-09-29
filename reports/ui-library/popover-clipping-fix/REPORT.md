# 팝오버 잘림 수정 — date-picker · time-picker · select · filter-chip

- 작업일: 2026-09-28~29 · 브랜치 `fix/datepicker-popup-clip` · 배포본 0.13.14 → **0.13.15**
- 갈래: **이미 승인된 컴포넌트의 후속 수정**이라 0-governance~2-canon-readiness 는 해당 없다(3-build·4-verification 만).
  그래서 `workflow-state.json` 을 두지 않는다 — 선례 `input-tp-dp-fixes` · `dropdown-max-width` 와 같다.
- 진입: river 「현재 피씨-데이트피커 액션을 동작해보면 xxsm의 달력이 위로 나오면서 잘려서 안보임. 이거 문제 해결해주고, 또 이런 문제가 발생하는 곳이 있는지 확인해봐」 → 「네 개 전부 고쳐줘」

## 1. 증상과 원인 (실측)

`pages/components.html` Date Picker 의 Action 영역에서, 트리거를 화면 아래쪽에 두고 XXSM 날짜 선택을 누르면
달력이 위로 뒤집히면서 **위쪽 165px 이 잘렸다**(1440×900, 실측).

원인은 두 겹이다.

1. 팝오버 패널이 컴포넌트 안에 `position: absolute` 로 붙는다.
2. 안내 페이지의 `.preview-area`(= 소비자의 스크롤 상자, `overflow: auto`)가 그 패널을 잘라낸다.
   위로 뒤집을 때 패널 top 이 상자 윗변보다 위로 올라가므로 상자가 그만큼 베어 낸다.

`positionPanel()` 은 **뷰포트** 여유만 보고 뒤집기를 결정했고, 자신을 자르는 조상의 존재는 계산에 없었다.

### 같은 구조인 곳 (전수 확인)

브라우저에서 네 컴포넌트를 실제로 열어 조상 클리핑 여부를 측정했다.

| 컴포넌트 | 패널 배치 | 뒤집기 | 수정 전 실측 |
|---|---|---|---|
| date-picker | `absolute` / `top:100%` | 있음 | **위쪽 165px 잘림** (스크롤 상자 윗변) |
| time-picker | `absolute` / `top:100%` | **없음** | 화면 아래로 6px 밀려남 — 아래가 모자라도 뒤집지 않음 |
| select | `absolute` / `top:100%` | **없음** | 같은 구조 — 아래가 모자라면 밀려남 |
| filter-chip | `absolute` / `top:100%` | **없음** | 같은 구조 — 아래가 모자라면 밀려남 |

`position: fixed` 를 막는 조상(transform·filter·contain·will-change)은 0건이라 고정 층 방식이 성립한다.

## 2. 고친 방법

네 컴포넌트 모두 **열려 있는 동안만** 패널을 `position: fixed` 로 띄우고, 트리거 좌표에서 위치를 직접 계산한다.
닫으면 인라인 값을 전부 지워 원래 `absolute` 계약으로 되돌린다 — 안내 페이지의 **정적 Open 표본은 손대지 않는다**(JS init 대상이 아님).

- 공통 함수 `floatPanel()` / `unfloatPanel()` 를 네 컴포넌트 JS 에 같은 구현으로 둔다
  (개별 설치 계약상 컴포넌트 JS 는 자립해야 하고, 빌드 파이프라인에 공용 모듈 개념이 없다).
- 뒤집기: **아래에 안 들어가고 위에는 온전히 들어갈 때만** `data-flip="up"` (기존 계약 표식·기존 안전장치 유지).
  양쪽 다 모자라면 아래로 둔다 — 아래로 넘친 부분은 스크롤로 볼 수 있지만, 위로 넘친 부분은 볼 방법이 없다.
- 세로는 트리거에 그대로 붙인다(화면 안으로 끌어당기지 않는다) — 끌어당기면 트리거가 화면 밖으로
  스크롤됐을 때 패널만 화면 끝에 홀로 남는다. 가로만 화면 밖으로 나가지 않게 당긴다.
- 폭: `fixed` 가 되면 `width:100%` / `min-width:100%` 의 기준이 뷰포트로 바뀌므로, 띄우는 동안
  트리거(또는 root)의 실제 폭을 px 로 고정한다. date-picker 는 고정폭이라 해당 없음.
- 열려 있는 동안만 `scroll`(capture)·`resize` 를 듣고 다시 붙인다. `close()`·`destroy()` 에서 모두 해제.

### 건드린 파일

| 파일 | 변경 |
|---|---|
| `ui-library/src/components/date-picker/date-picker.{js,css}` | floatPanel 배선 · `[data-s1-float="fixed"]` 규칙 |
| `ui-library/src/components/time-picker/time-picker.{js,css}` | 동일 (gap 4 · min-width 트리거 추종) |
| `ui-library/src/components/select/select.{js,css}` | 동일 (width root 추종) |
| `ui-library/src/components/filter-chip/filter-chip.{js,css}` | 동일 (width root 추종) |
| `ui-library/dist/**` · 전달본 ZIP · 다운로드 화면 · 검수판 | 재생성(손편집 없음) |

## 3. 수정 후 실측 (1440×900, 실제 dist 소비)

트리거를 화면 위쪽(여유 있음)·아래쪽(여유 없음) 두 자리에 두고 각각 열어 측정.

| 컴포넌트 | 아래 여유 있음 | 아래 여유 없음 | 닫은 뒤 |
|---|---|---|---|
| date-picker XXSM | 아래로, gap 8, 좌측 정렬 0 | **위로 뒤집힘, gap 8, 잘림 0** | `absolute` 복귀 |
| time-picker XXSM | 아래로, gap 4 | **위로 뒤집힘, gap 4, 잘림 0** | `absolute` 복귀 |
| select XXSM | 아래로, gap 8, 폭 140 = 트리거 140 | 위로 뒤집힘(뷰포트 420 강제), 잘림 0 | `absolute` 복귀 |
| filter-chip SM | 아래로, gap 8, 폭 109 = 트리거 109 | 위로 뒤집힘(뷰포트 420 강제), 잘림 0 | `absolute` 복귀 |

화면 밖으로 넘어간 픽셀(위·아래) 모두 0.

### 렌더 증거

- `screens/fixture.html` — 스크롤 상자 안에서 네 팝오버를 동시에 연 재현 틀(실제 dist 소비)
- `screens/fixture-after.png` — 네 팝오버 모두 상자 경계를 넘어 온전히 그려짐
- 안내 페이지 실제 화면: Light·Dark 양쪽에서 XXSM 달력이 위로 뒤집혀도 온전히 보임(세션 캡처)

## 3-1. 독립 검증 (🤖 component-verifier, 2026-09-29)

첫 판정 **FAIL** — 지적 2건.

| 번호 | 지적 | 처리 |
|---|---|---|
| F-1 (a) | 뒤집기 조건에서 「위에 온전히 들어가는가」 검사가 빠져, 창 높이 700 에서 MD 달력이 **화면 위로 32px 잘렸다**(종전에는 아래로 넘쳐 스크롤로 볼 수 있었다) | **수정 완료** — 조건을 `아래에 안 들어감 && 위에 들어감` 으로 되돌림. 같은 조건 재측정: `flip=none` · 위 넘침 0 · 아래 넘침 32(스크롤 가능) |
| F-2 (c) | 안내 페이지 `.preview-area { isolation: isolate }`(원래 의도: 드롭다운이 헤더 위로 올라오지 않게)가 그리는 순서를 가둬, 고정 층으로 올라간 패널이 **상단 고정 바에 덮인다** | **river 결정 대기** — 1440×900 실측: XXSM 가림 0px · MD 약 35px. 라이브러리 단독 결함이 아니라 라이브러리 ↔ 안내 페이지 설계 충돌 |

그 밖 전 항목 PASS — 상자 탈출 · gap · 폭 · 정적 Open 표본 **바이트 동일** · 닫기/수명주기 · 스크롤 추종 ·
Light/Dark · Mobile 하단 시트 **바이트 동일** · 콘솔 오류 0건.

**F-1 수정 후 델타 재검증(2026-09-29) → 판정 PASS** (❌ 0 · ❓ 0 · BLOCKED 0)

- F-1 재현 조건(1440×700 · MD · roomAbove = roomBelow = 320 · 패널 352): `flip` 없음 · 위 넘침 **0** · 아래 넘침 32(스크롤 가능) — 직전 라운드의 「위로 32px 잘림」 재현 안 됨.
- **뒤집기 경계 전수** — 네 컴포넌트 모두 「위 여유 = 패널 높이」에 정확히 붙고, **뒤집힌 모든 경우에 위 잘림 0건**.
- 원래 목적 유지 — 스크롤 상자 안·아래 여유 부족에서 date-picker XXSM·time-picker 는 여전히 위로 뒤집히고 상자 잘림 0.
- 회귀 재확인(Action 영역 13칸 전수): gap 8/4/8/8 · 좌측 편차 0 · 폭 전부 종전값 · 닫은 뒤 absolute 복귀·인라인 삭제.
- 콘솔 오류 0건. 기계검사 전부 종료코드 0.
- 델타 밖(스크롤 추종·닫기/수명주기·정적 표본·Mobile 시트)은 지문이 조건 한 줄+주석에 한정됨을 확인하고 직전 PASS 승계.

부수 효과: F-1 수정으로 **안내 페이지 1440×700 MD 케이스에서는 위로 뒤집지 않게 되어 F-2 의 가림도 그 상황에선 함께 사라졌다.** 트리거가 더 아래에 있는 배치에서는 F-2 가 그대로 남는다.

## 4. 검사기

| 검사 | 결과 |
|---|---|
| 🔎 ui:contract · ui:version · ui:build:check · ui:test:check · ui:icons · ui:icons:origin · ui:guide:render | ✅ 전부 통과 |
| 🔎 gate:check (게이트 59개) | ✅ PASSED · error 0 · warning 20(기존 부채) |

> Gate 51(GNB 키보드 순서)은 헤드리스 크롬이 쌓이면 시간 초과로 빨갛게 뜬다 — 이 변경과 무관한 도구 문제다.
> 크롬 프로세스를 정리하고 다시 돌리면 통과한다(기억 `headless-chrome-leaks`).

## 5. 검증 안 한 범위

- Mobile break 의 date-picker·time-picker 는 팝오버가 아니라 하단 시트라 이 변경의 영향 밖 — 시트 동작은 재확인하지 않았다.
- IME·터치 기기 실제 단말 확인은 하지 않았다(데스크톱 헤드리스/브라우저 렌더만).
