# Multi Toggle (PC 전용) — 빌드 계획서 (2-plan.md)

## 목표
누락된 **PC 전용 멀티토글(분절 토글)** 을 V2.4 원본(`pc_multi-toggle` 540:4733)을 그대로 가져와, 우리 DS **버튼 토큰(선택=primary, 미선택=secondary)** 으로 바인딩해 **신규 라이브러리 컴포넌트**로 빌드한다. Selection 묶음 소속. test 화면에 조립 예시까지 보여준다.

## 소스 / 타깃
- **소스(원본):** 파일 `yE5UCFEbmXJBlYJWB24Lz2`(SW UX GUIDE V2.4) · 노드 `540:4733` (`pc_multi-toggle`, 셀 변형세트 32개)
- **타깃(빌드 위치):** 파일 `cysG5U1udpQqVagYY1hWHW`(SW UX GUIDE V3.0 TEST) · 페이지 `302:19291`(`test`) — 빈 공간 찾아 배치

## 컴포넌트 정의
- **세트 이름:** `Multi Toggle`
- **변형 축 3개 (총 32 variant):**
  - `position` = first · middle-left · middle-right · last
  - `state` = default · hover · selected · disabled
  - `size` = md · sm
- variant 이름 형식: `position=first, state=default, size=md` (원본과 동일)

## 셀 구조 (원본 그대로 — 실측)
| 속성 | md | sm |
|------|----|----|
| 높이 | 44 → `sizing/44` | 34 → `sizing/34` |
| 폭 | 64 (min-w 64) | 56 |
| 패딩(상하/좌우) | 12 → `spacing/padding-block/xs`·`spacing/padding-inline/xs` | 8 → `spacing/padding-block/xxs`·`spacing/padding-inline/xxs` |
| 모서리 반경 | 4 → `radius/control/sm` | 4 → `radius/control/sm` |
| 보더 두께 | 1 → `border-width/1` | 1 → `border-width/1` |
| 라벨 | "항목" · Pretendard Medium 14 · line-height 1.3 · letterSpacing -0.28px · 가운데 정렬 | 동일 |

### 위치별 모서리·보더 (원본 확정 — position = 선택 셀 기준 상대 위치)
> **핵심 의미(사용자 정정 2026-06-25):** position 은 "선택된 파란 셀 기준 어느 쪽인가"다.
> 선택 셀과 **닿는 면엔 회색 보더를 그리지 않는다**(파란 선택 셀의 보더가 그 경계를 책임짐 / 회색+파랑 이중선 방지).
> - middle-left = 선택 셀의 **왼쪽** 칸 → 오른쪽(선택 셀과 닿음) 보더 **없음**, 왼쪽만.
> - middle-right = 선택 셀의 **오른쪽** 칸 → 왼쪽(선택 셀과 닿음) 보더 **없음**, 오른쪽만.
> ⚠️ 이전(6-25 오전) "양쪽 보더" 정정은 **오류**였음(선택 셀 옆에 회색선이 생겨 컴포넌트 활용 불가). 원본대로 환원.
| position | 둥근 모서리 | 보더 변 | 의미 |
|----------|-----------|---------|------|
| first | 좌상 + 좌하 | 상·하·**좌** | 맨 왼쪽(우측은 다음 칸이 책임) |
| middle-left | 없음 | 상·하·**좌** | 선택 셀 왼쪽 — 우측(선택과 닿음) 선 없음 |
| middle-right | 없음 | 상·하·**우** | 선택 셀 오른쪽 — 좌측(선택과 닿음) 선 없음 |
| last | 우상 + 우하 | 상·하·**우** | 맨 오른쪽(좌측은 선택/이전 칸이 책임) |

### 조립 규칙 (선택 셀 중심)
선택 셀은 state=selected(파란 보더 4변). 그 **왼쪽 이웃 = middle-left(또는 first), 오른쪽 이웃 = middle-right(또는 last)**.
- 선택=왼쪽:  `[first/selected][middle-right][last]`
- 선택=가운데: `[first][middle(선택)][last]`
- 선택=오른쪽: `[first][middle-left][last/selected]`
→ 어떤 경우든 선택 셀 인접면엔 회색선 없음, 그 외 경계엔 1px 선.

## 🎨 색상 바인딩 사전 조회표 (전부 토큰 — 하드코딩 hex 금지)
원본은 V2.4 `color/control/*` 토큰을 썼으나, 사용자 지시대로 **우리 DS 버튼 토큰으로 역할 매핑**한다(=의도된 (b) 개선).

| state | 속성 | 원본 raw(V2.4) | → 적용 DS 토큰 | 빌드 지시 |
|-------|------|---------------|---------------|----------|
| default(미선택) | bg | #ffffff | `color/button/bg/secondary--default` | 바인딩 필수 |
| default | border | #d9d9d9 | `color/button/border/secondary--default` | 바인딩 필수 |
| default | text | #757575 | `color/button/label/secondary--default` | 바인딩 필수 |
| hover(미선택) | bg | #fff + 검정5% | `color/button/bg/secondary--hover` | 바인딩 필수 (오버레이 대신 토큰) |
| hover | border | #d9d9d9 | `color/button/border/secondary--hover` | 바인딩 필수 |
| hover | text | #757575 | `color/button/label/secondary--hover` | 바인딩 필수 |
| **selected** | bg | #1d6ceb | `color/button/bg/primary--default` | 바인딩 필수 |
| selected | border | #1d6ceb | `color/button/border/primary--default` | 바인딩 필수 |
| selected | text | #ffffff | `color/button/label/primary--default` | 바인딩 필수 |
| disabled | bg | #f5f5f5 | `color/button/bg/disabled` | 바인딩 필수 |
| disabled | border | #d9d9d9 | `color/button/border/disabled` | 바인딩 필수 |
| disabled | text | #c4c4c4 | `color/button/label/disabled` | 바인딩 필수 |

- 모든 색은 `figma.variables.getVariableById` + `setBoundVariableForPaint` 로 바인딩. raw hex 잔류 = 검증 ❌.
- 폰트: Pretendard. 라벨 텍스트는 DS 텍스트 스타일(Pretendard Medium 14 = 버튼 라벨 스타일)로 `setTextStyleIdAsync` 바인딩. Noto 잔존 = 검증 ❌.

## 빌드 순서·패킹
1. 32개 셀 컴포넌트 생성(오토레이아웃, 위 구조) → 색·텍스트스타일 바인딩.
2. `combineAsVariants` 로 `Multi Toggle` 세트화 → **variant 패킹**(격자 재배치 + 세트 hug resize, 붕괴 방지).
3. **조립 예시**(test 화면): 3칸 토글 [first][middle-left][last] 를 인스턴스로 나란히(셀 폭 hug, 보더 분절 공유), 가운데 칸 selected 1개 + 전체 default 1개. md·sm 각각. 라벨 "항목".
4. 생성/변경 node id 전부 `node-map.json` 기록.

## 결정 필요(HD)
- 없음. (색 매핑 전부 등가물 존재, 구조 실측 완료, 타깃 확정.)
- 단, 타깃 파일에 `color/button/*` 변수·DS 텍스트 스타일이 없으면 빌더가 needs-decision 으로 보고(임의 hex 금지).

## 허용편차
- 없음. (원본 구조·치수 그대로, 색만 DS 버튼 토큰으로 역할 매핑 = 사용자 명시 지시.)
