# 4-verification — Table (기술 검증)

- 날짜: 2026-09-02 · 검증: ⭐ 총괄 (실제 dist 소비 기준)
- 위험도 기반 독립 검증: 설치기 **정본 변경분**은 🤖 component-verifier 가 이미 별도 검증(PASS, Gate 13 기록). 웹 배포본은 아래 자동 검사 + 실제 렌더·동작 확인.

## 자동 검사

| 검사 | 결과 |
|---|---|
| `npm run ui:build` | ✅ 84 files |
| `npm run ui:test` | ✅ PASS (계약·파리티·raw HEX·!important·범위 밖 선택자) |
| `npm run ui:guide:render` | ✅ 컴포넌트 15종 × PC·Mobile 실제 렌더 대조 |
| `npm run gate:check` | ✅ **PASSED** (게이트 46개 · 76건 통과 · error 0) |

## 실제 동작 (검수 화면에서 실행)

정본 행동 장부(`component-behavior.pc.json > Table`)의 두 규칙을 그대로 확인했다.

| 조작 | 기대 | 결과 |
|---|---|---|
| 맨 위 체크박스 클릭 | 전체 행 선택 | `["true","true","true"]` ✅ |
| 다시 클릭 | 전체 해제 | `["false","false","false"]` ✅ |
| 한 행만 선택 | 그 행만 선택 + 맨 위 체크 해제 | `["true","false","false"]`, header `false` ✅ |

## 렌더 (실제 dist)

| 화면 | 확인 |
|---|---|
| `screens/guide-table.png` | 안내 화면 — Action(표 + 페이지네이션 + '15개씩 보기' 셀렉박스) · 크기 3종 매트릭스 |
| `screens/review-table.png` | 검수 화면 — Light·Dark 두 패널 × 크기 3종 · 기본/Hover/선택 표기 |
| `screens/state-matrix.png` | 정본 대조용 매트릭스 — md 44/14 · sm 38/14 · xsm 34/12 |

## 정본 대조

| 항목 | 정본 | 웹 | 결과 |
|---|---|---|---|
| 행 높이 | 44 / 38 / 34 | `--sizing-44/38/34` | ✅ |
| 글자 | 14 / 14 / 12 | `--font-size-14`(기본) · xsm `--font-size-12` | ✅ |
| 셀 좌우 여백 | 글자 x=16 | `padding: 0 var(--spacing-16)` | ✅ |
| 셀 하단선 | 1px `color/table/border/default` | 동일 토큰 | ✅ |
| 표 외곽 | 위 2px · 아래 1px `border/strong` | 동일 토큰 | ✅ |
| 선택 컬럼 | 48px · 코어 Checkbox | `--sizing-48` · `[data-s1-component="checkbox"]` 재사용 | ✅ |
| 상태 소유 | 셀 | 셀(`[data-state]`) + 행 조합 | ✅ |

## 검증하지 않은 것 (정직 명시)

- **모바일**: 정본·Registry에 표의 모바일 표출 규칙이 없어 PC 전용으로 선언했다. 모바일 화면에는 노출하지 않는다.
- **긴 표·가로 스크롤**: 열이 많아 가로로 넘칠 때의 감각은 실제 데이터 화면에서 봐야 한다(컴포넌트는 `overflow-x:auto`).
- **Figma 캔버스 실물**: 코드 정본 대조만 했다(🤖 검증자도 같은 범위를 명시).

## 결론

FAIL 0 · HOLD 0 · BLOCKED 0 → **5-human-review(river UX 검수) 로 넘어간다.**

## 보완 (river 지시 2026-09-02)

| 지시 | 반영 |
|---|---|
| 크기별 표 아래에 **최하위 부품 상태** 표시가 없다 · 헤더/바디를 각각 묶고 위 세트 비교와 영역을 나눌 것 · **헤더 셀을 바디 셀 위에, 헤더의 Default 는 바디의 Default 와 같은 세로선에** | 안내 화면을 세 구역으로 나눴다 — **① 세트 — 크기별 표 전체 ② 셀 단위 — 헤더 셀 ③ 셀 단위 — 바디 셀**. 각 구역에 제목과 구분선을 넣었다. 헤더·바디 두 표는 **같은 열 격자**(150px + 3열)를 써서 Default 열이 같은 세로선에 놓이고, 헤더에 없는 Hover·Selected 칸은 비워 둔다 |
| **(실제 배포본)** 표기 삭제 (다른 컴포넌트도) | Table 열 제목의 `(실제 배포본)` 제거 · Pagination 열 제목의 `실제 배포본` 제거. 저장소에 남은 같은 문구는 검수 화면 `h1` 제목 문장 하나뿐이라 그대로 두었다(문장 속 표현) |

## 오류 정정 (river 지적 2026-09-02)

**셀 단위 표본이 정본에 없는 선을 보여주고 있었다.**

| | 정본 | 잘못 보여준 것 |
|---|---|---|
| 셀(헤더·바디) | 아래 **1px** `color/table/border/default` **하나뿐** (`build-components.ts:1997-2006`) | 위·아래에 진한 선 |
| 위 2px · 아래 1px `border/strong` | **표 세트**가 그리는 외곽선 (`:2178-2183`) | 낱개 셀마다 그려짐 |

원인: 셀 표본을 표 전체 껍데기(`[data-s1-component="table"]`)로 감쌌더니 표 외곽선 규칙이 셀 하나짜리 표본에도 적용됐다. 낱개 셀 표본에서는 외곽선을 끄도록 고쳤고, 구역 설명에 "셀이 가진 선은 아래 1px 하나뿐(표 위·아래 진한 선은 표 세트 몫)"을 명시했다.

**교훈:** 세트가 그리는 것과 부품이 그리는 것을 표본에서 섞지 않는다. 부품 표본은 부품이 소유한 것만 보여야 한다.

## 사각지대 보완 — Gate 44 신설 (river 지시 2026-09-02)

위 오류는 **기계가 못 잡던 유형**이었다. 배포본 CSS 는 정확했고 안내 화면의 표본 조립만 틀려서, 계약·파리티·수치 대조 검사기가 전부 통과했다. 같은 실수가 다시 나오지 않도록 검사 장치를 만들었다.

| 층위 | 무엇 |
|---|---|
| **규칙 정본** | `registry/governance/component-presentation-policy.json` → `_meta.uiLibraryGuideLayout.partSampleIsolation` — "부품 표본은 그 부품이 소유한 것만 보여준다" (river 지시로 선언, 검사기가 규칙을 만들지 않는다) |
| **판정부** | `scripts/ui-guide-part-sample-check.js` — 렌더된 DOM 에서 `data-guide-sample="part"` 표본을 찾아, 실제 dist CSS 의 **루트 단독 규칙**이 칠하는 테두리·그림자를 그 표본이 끄고 있는지 대조 |
| **집행** | **Gate 44** (`npm run gate:check`) — 여태 커밋 검문소 밖에 있던 안내 화면 렌더 검사 전체를 함께 넣었다 |
| **예외** | 표본에 `data-guide-sample-keeps="border-top,…"` 로 선언 — 숨겨지지 않고 경고로 보인다 |

### 검사기가 실제로 잡는지 확인 (가짜 합격 방지)

| 확인 | 결과 |
|---|---|
| 적대 테스트 `--selftest` (위반 검출 · 정상 통과 · 예외 경고 · 규칙 정본 존재) | ✅ 4/4 |
| **이번 버그를 실제로 되돌려 재현** (셀 표본의 외곽선 끄기를 취소) | ✅ 검사 실패(exit 1) · PC·Mobile 양쪽에서 검출 |
| 고친 상태 | ✅ 통과(exit 0) |
| `npm run gate:check` | ✅ PASSED · 게이트 **47개** |
