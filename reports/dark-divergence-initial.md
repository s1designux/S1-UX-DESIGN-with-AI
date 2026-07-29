# 다크값 갈림 초기 실측 (Gate 29 도입 시점)

> 작성: 2026-07-28 · 기준 커밋 `fb90bfe` · 데이터 소스: `plugins/figma-vars-installer/src/vars-data.ts` (SEMANTIC_COLOR 170개)
> "라이트 최종값은 같은데 같은 비교 단위 안에서 다크 최종값이 갈리는" 토큰의 전량 사실 기록.
> **판정·추천 없음** — 각 건이 실수인지 의도인지는 이 문서가 정하지 않는다. 향후 정리 작업의 근거 목록.
> 비교 단위: 컴포넌트 계열=seg1 · 역할 계열(text·icon·bg·line·overlay·surface)=seg1/seg2.
> ◆ = 이상치(다수파와 다른 다크값을 가진 토큰. `[동수]`는 다수파가 없어 전원 등록).
> 게이트 baseline: `registry/governance/dark-divergence-baseline.json` (33키). 현황 재실행: `npm run tokens:darkdiv`

## 집계

| 항목 | 값 |
|---|---|
| 라이트 동일 그룹(크기≥2) | 15그룹 / 167토큰 |
| 단위 내부 갈림 | **20건** (관여 토큰 59개 · 이상치 키 33개) |
| 단위 간 갈림(기록만) | 13그룹 |
| 다크까지 완전 일관 그룹 | 2그룹 (#FF4554 n=5 → 전부 #F06070 · #9D9D9D n=4 → 전부 #55575F) |

단위별 내부 갈림 분포: chip 5 · button 4 · form-control 4 · control 3 · date-picker 3 · pagination 1.

## 단위 내부 갈림 전량 (20건)

### 1. button · 라이트 #FFFFFF — [동수] 2:2

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/button/bg/blue-line--default | gray-dark/100 = #1C1D23 |
| ◆ | color/button/bg/secondary--default | gray-dark/100 = #1C1D23 |
| ◆ | color/button/label/primary--default | base/white = #FFFFFF |
| ◆ | color/button/label/primary--hover | base/white = #FFFFFF |

bg 계열과 label 계열이 동수로 갈림.

### 2. chip · 라이트 #FFFFFF — 다수 #1C1D23×2

| | 토큰 | 다크 |
|---|---|---|
| | color/chip/line/bg/default | gray-dark/100 = #1C1D23 |
| | color/chip/line/bg/selected | gray-dark/100 = #1C1D23 |
| ◆ | color/chip/solid/label/selected | base/white = #FFFFFF |

### 3. control · 라이트 #FFFFFF — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/control/bg/default | gray-dark/100 = #1C1D23 |
| ◆ | color/control/indicator/selected | base/white = #FFFFFF |

### 4. form-control · 라이트 #FFFFFF — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/form-control/bg/default | gray-dark/100 = #1C1D23 |
| ◆ | color/form-control/bg/selected | gray-dark/200 = #24252C |

### 5. date-picker · 라이트 #FFFFFF — 다수 #1C1D23×4

| | 토큰 | 다크 |
|---|---|---|
| | color/date-picker/panel/bg | gray-dark/100 = #1C1D23 |
| | color/date-picker/cell/bg/today | gray-dark/100 = #1C1D23 |
| ◆ | color/date-picker/text/selected | base/white = #FFFFFF |
| | color/date-picker/tile/bg/default | gray-dark/100 = #1C1D23 |
| | color/date-picker/tile/bg/selected | gray-dark/100 = #1C1D23 |

참고: 같은 라이트 #FFFFFF 그룹(전체 26토큰)의 타 단위 다크 — bg #0D0E12 · surface/table/dropdown/navigation/overlay/pagination #1C1D23 · icon/text #FFFFFF.

### 6. button · 라이트 #F5F5F5 — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/button/bg/disabled | gray-dark/300 = #2E2F38 |
| ◆ | color/button/bg/secondary--hover | gray-dark/200 = #24252C |

### 7. chip · 라이트 #F5F5F5 — 다수 #24252C×4

| | 토큰 | 다크 |
|---|---|---|
| | color/chip/line/bg/disabled | gray-dark/200 = #24252C |
| ◆ | color/chip/solid/bg/default | gray-dark/300 = #2E2F38 |
| | color/chip/solid/bg/disabled | gray-dark/200 = #24252C |
| | color/chip/solid/border/default | gray-dark/200 = #24252C |
| | color/chip/solid/border/disabled | gray-dark/200 = #24252C |

### 8. pagination · 라이트 #F5F5F5 — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/pagination/control/bg/disabled | gray-dark/300 = #2E2F38 |
| ◆ | color/pagination/control/bg/hover | gray-dark/200 = #24252C |

참고: #F5F5F5 그룹 타 단위 다크 — bg #1C1D23 · control/table/dropdown/form-control/date-picker #24252C.

### 9. chip · 라이트 #E9E9E9 — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/chip/line/border/disabled | gray-dark/200 = #24252C |
| ◆ | color/chip/solid/bg/hover | gray-dark/400 = #35363F |

### 10. date-picker · 라이트 #E9E9E9 — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/date-picker/tile/bg/disabled | gray-dark/200 = #24252C |
| ◆ | color/date-picker/tile/border/disabled | gray-dark/300 = #2E2F38 |

### 11. chip · 라이트 #1D6CEB — 다수 #3070D8×3

| | 토큰 | 다크 |
|---|---|---|
| | color/chip/line/border/selected | blue-dark/300 = #3070D8 |
| ◆ | color/chip/line/label/selected | blue-dark/350 = #4285E8 |
| | color/chip/solid/bg/selected | blue-dark/300 = #3070D8 |
| | color/chip/solid/border/selected | blue-dark/300 = #3070D8 |

chip 4개 중 1개만 blue-dark/350. (게이트 도입 계기가 된 사례)
참고: #1D6CEB 그룹 타 단위 다크 — button/control/icon/line/navigation/date-picker/text = #3070D8 · dropdown/form-control = #4285E8.

### 12. button · 라이트 #2747B9 — 다수 #2A65C8×2

| | 토큰 | 다크 |
|---|---|---|
| | color/button/bg/primary--hover | blue-dark/250 = #2A65C8 |
| | color/button/border/primary--hover | blue-dark/250 = #2A65C8 |
| ◆ | color/button/label/blue-line--hover | blue-dark/300 = #3070D8 |

### 13. button · 라이트 #D9D9D9 — 다수 #3E4049×2

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/button/border/disabled | gray-dark/300 = #2E2F38 |
| | color/button/border/secondary--default | gray-dark/500 = #3E4049 |
| | color/button/border/secondary--hover | gray-dark/500 = #3E4049 |

### 14. control · 라이트 #D9D9D9 — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/control/border/default | gray-dark/500 = #3E4049 |
| ◆ | color/control/border/disabled | gray-dark/300 = #2E2F38 |

참고: #D9D9D9 그룹 타 단위 다크 — dropdown/form-control/date-picker/pagination #3E4049 · navigation #2E2F38 · scroll #55575F.

### 15. chip · 라이트 #C4C4C4 — 다수 #55575F×2

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/chip/line/border/default | gray-dark/500 = #3E4049 |
| | color/chip/line/label/disabled | gray-dark/600 = #55575F |
| | color/chip/solid/label/disabled | gray-dark/600 = #55575F |

### 16. control · 라이트 #C4C4C4 — [동수] 1:1:1 (3분열)

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/control/indicator/disabled | gray-dark/500 = #3E4049 |
| ◆ | color/control/indicator/unselected | gray-dark/400 = #35363F |
| ◆ | color/control/label/disabled | gray-dark/600 = #55575F |

### 17. form-control · 라이트 #C4C4C4 — 다수 #55575F×2

| | 토큰 | 다크 |
|---|---|---|
| | color/form-control/label/disabled | gray-dark/600 = #55575F |
| | color/form-control/text/disabled | gray-dark/600 = #55575F |
| ◆ | color/form-control/icon/disabled | gray-dark/500 = #3E4049 |

### 18. date-picker · 라이트 #C4C4C4 — 다수 #3E4049×3

| | 토큰 | 다크 |
|---|---|---|
| | color/date-picker/panel/border | gray-dark/500 = #3E4049 |
| | color/date-picker/icon/disabled | gray-dark/500 = #3E4049 |
| | color/date-picker/text/disabled | gray-dark/500 = #3E4049 |
| ◆ | color/date-picker/text/other-month | gray-dark/400 = #35363F |

참고: #C4C4C4 그룹 타 단위 다크 — button/pagination #55575F · icon/status-card/text 계열 #35363F.

### 19. form-control · 라이트 #353535 — 다수 #B8BABF×2

| | 토큰 | 다크 |
|---|---|---|
| | color/form-control/label/default | gray-dark/800 = #B8BABF |
| | color/form-control/text/default | gray-dark/800 = #B8BABF |
| ◆ | color/form-control/icon/default | gray-dark/700 = #8A8C96 |

참고: #353535 그룹(19토큰)에서 단위 내부 갈림은 form-control 뿐. 타 단위는 chip/table #8A8C96 · 나머지 전부 #B8BABF.

### 20. form-control · 라이트 #757575 — [동수] 1:1

| | 토큰 | 다크 |
|---|---|---|
| ◆ | color/form-control/text/placeholder | gray-dark/600 = #55575F |
| ◆ | color/form-control/text/read-only | gray-dark/700 = #8A8C96 |

## 측정 시점에 잡혔다가 단위 세분화로 제외된 1건 (사실 기록)

seg1 통짜 비교(측정 초기안)에서는 21번째 건으로 잡혔던 항목. 최종 규칙(역할 계열 = seg1/seg2)에서는 `text/body`와 `text/state`가 서로 다른 단위라 내부 갈림이 아니며, 단위 간 갈림(기록만)으로 분류된다.

| 토큰 | 라이트 | 다크 |
|---|---|---|
| color/text/body/tertiary | #757575 | gray-dark/700 = #8A8C96 |
| color/text/state/caption | #757575 | gray-dark/800 = #B8BABF |

## 단위 간 갈림 13그룹 (기록만 — 요약)

| 라이트 | n | 다크 분포(단위별) |
|---|---|---|
| #FFFFFF | 26 | bg #0D0E12 · 대다수 #1C1D23 · form-control(selected) #24252C · icon/text/일부 label #FFFFFF |
| #1D6CEB | 28 | 대다수 #3070D8 · dropdown/form-control #4285E8 |
| #C4C4C4 | 19 | #55575F / #3E4049 / #35363F 3종 혼재 |
| #353535 | 19 | 대다수 #B8BABF · chip/table #8A8C96 |
| #F5F5F5 | 16 | bg #1C1D23 · 대다수 #24252C · 일부 #2E2F38 |
| #D9D9D9 | 12 | 대다수 #3E4049 · navigation #2E2F38 · scroll #55575F |
| #E9E9E9 | 10 | #24252C / #2E2F38 / #35363F 혼재 |
| #202020 | 7 | 대다수 #ECEDF0 · form-control #B8BABF |
| #757575 | 6 | #8A8C96 / #55575F / #B8BABF 혼재 |
| #2747B9 | 5 | 대다수 #2A65C8 · 일부 #3070D8 |
| #FAFAFA | 4 | bg #131418 · 나머지 #24252C |
| #E2F1FF | 4 | button #24252C · 나머지 #112B55 |
| #555555 | 2 | navigation #55575F · status-card #8A8C96 |
