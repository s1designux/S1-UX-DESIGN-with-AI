# 1단계 재고조사 — Calendar Cell & Tile 컴포넌트화

## 소스 노드

| 노드 ID | 이름 | 현재 상태 | 크기 |
|--------|------|----------|------|
| 540:4167 | calendar_cell_state | 프레임 (변형세트 미적용) | 264×143 |
| 540:4209 | calendar_tile | 프레임 (변형세트 미적용) | 320×96 |

## A. calendar_cell_state 하위 컴포넌트 (8개)

| # | 노드 ID | 현재 이름 | type | state |
|---|---------|----------|------|-------|
| 1 | 540:4182 | type=standard, state=default | standard | default |
| 2 | 540:4175 | type=standard, state=today | standard | today |
| 3 | 540:4168 | type=standard, state=selected | standard | selected |
| 4 | 540:4189 | type=standard, state=disabled | standard | disabled |
| 5 | 540:4185 | type=range, state=default | range | default |
| 6 | 540:4178 | type=range, state=start | range | start |
| 7 | 540:4171 | type=range, state=end | range | end |
| 8 | 540:4192 | type=range, state=disabled | range | disabled |

- 크기: 44×44px outer, inner circle 30×30px
- 토큰: Variables 바인딩 되어 있음 (control → datepicker로 교체 예정)

## B. calendar_tile 하위 컴포넌트 (3개)

| # | 노드 ID | 현재 이름 | state |
|---|---------|----------|-------|
| 1 | 540:4212 | Property 1=default | default |
| 2 | 540:4210 | Property 1=selected | selected |
| 3 | 540:4214 | Property 1=disabled | disabled |

- 크기: 88×56px, radius 4px
- 속성명: `Property 1` → `state` 리네임 필요
- 토큰 이슈: `color/control/border/disabled-alt1` (삭제된 토큰) 사용 중 → 신설 토큰으로 교체

## 토큰 이슈

| 토큰명 | 사용 위치 | DS 상태 | 처리 |
|--------|----------|---------|------|
| `color/control/border/disabled-alt1` | calendar_tile / disabled border | ❌ 삭제됨 | `date-picker/tile/border/disabled`로 교체 |

## 신설 필요 토큰 (6개)

```
color/date-picker/bg/range             { light: blue/50,    dark: blue-dark/100 }
color/date-picker/tile/bg/default      { light: base/white, dark: gray-dark/100 }
color/date-picker/tile/bg/selected     { light: base/white, dark: gray-dark/100 }
color/date-picker/tile/bg/disabled     { light: gray/100,   dark: gray-dark/200 }
color/date-picker/tile/border/default  { light: gray/200,   dark: gray-dark/500 }
color/date-picker/tile/border/disabled { light: gray/100,   dark: gray-dark/300 }
```

## 라이브러리 현황

- DatePicker 관련 기존 컴포넌트 세트: "Calendar" (State=Date/Year/Month, 전체 패널 레벨)
- 이번 작업 대상: 패널 내부의 개별 셀/타일 — 별도 컴포넌트 세트로 신설
- 충돌 없음 (기존 "Calendar" 세트와 레벨이 다름)
