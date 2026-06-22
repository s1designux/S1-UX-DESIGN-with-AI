# 2단계 빌드 계획 — DatePicker/Calendar Cell & DatePicker/Calendar Tile

## 전체 작업 순서

1. ⭐ vars-data.ts 신설 토큰 6개 추가 (기계적 작업)
2. 🏗️ figma-library-builder 위임:
   - Figma Variables에 신설 토큰 6개 추가
   - DatePicker/Calendar Cell 변형세트화 + 토큰 바인딩 교체
   - DatePicker/Calendar Tile 변형세트화 + 토큰 바인딩 교체

---

## 사전 작업: 신설 토큰 6개 (vars-data.ts)

```ts
// vars-data.ts — date-picker 그룹 하단에 추가
"color/date-picker/bg/range":             { light: "blue/50",    dark: "blue-dark/100" },
"color/date-picker/tile/bg/default":      { light: "base/white", dark: "gray-dark/100" },
"color/date-picker/tile/bg/selected":     { light: "base/white", dark: "gray-dark/100" },
"color/date-picker/tile/bg/disabled":     { light: "gray/100",   dark: "gray-dark/200" },
"color/date-picker/tile/border/default":  { light: "gray/200",   dark: "gray-dark/500" },
"color/date-picker/tile/border/disabled": { light: "gray/100",   dark: "gray-dark/300" },
```

---

## 빌드 계획 표

| 대상 | 작업 | 소스 노드 | 결과 이름 | 배치 |
|------|------|---------|---------|------|
| calendar_cell_state | 변형세트화 | 540:4167 하위 8개 | `DatePicker/Calendar Cell` | 원본 위치 유지 |
| calendar_tile | 변형세트화 | 540:4209 하위 3개 | `DatePicker/Calendar Tile` | 원본 위치 유지 |

---

## DatePicker/Calendar Cell 변형 구조

**variant 속성 축:**
- `type` = `standard` | `range`
- `state` = `default` | `today` | `selected` | `disabled` | `start` | `end`

유효 조합 8개 (6개 미존재 — Figma에서 자동 생성되는 빈 슬롯):
- standard: default / today / selected / disabled
- range: default / start / end / disabled

**토큰 바인딩 교체 명세:**

| 레이어 | 속성 | 기존 토큰 | 교체 토큰 |
|--------|------|---------|---------|
| standard/today — circle bg | fill | `color/control/bg/selected-alt` | `color/date-picker/bg/today` |
| standard/selected — circle bg | fill | `color/control/bg/selected` | `color/date-picker/bg/selected` |
| standard/today — circle border | stroke | `color/control/border/selected` | `color/date-picker/border/today` |
| standard/selected — circle border | stroke | `color/control/border/selected` | `color/date-picker/border/today` |
| range/default — band bg | fill | Foundation `blue/50` 직접 | `color/date-picker/bg/range` |
| range/start — band bg | fill | Foundation `blue/50` 직접 | `color/date-picker/bg/range` |
| range/end — band bg | fill | Foundation `blue/50` 직접 | `color/date-picker/bg/range` |
| range/disabled — band bg | fill | Foundation `blue/50` 직접 | `color/date-picker/bg/range` |
| range/default — circle bg | fill | Foundation `blue/50` 직접 | `color/date-picker/bg/range` |
| range/disabled — circle bg | fill | Foundation `blue/50` 직접 | `color/date-picker/bg/range` |
| standard/default — text | fill | `color/text/body/tertiary` | `color/date-picker/text/secondary` |
| standard/today — text | fill | `color/text/state/accent` | `color/date-picker/text/today` |
| standard/selected — text | fill | `color/text/state/accent-alt` | `color/date-picker/text/selected` |
| standard/disabled — text | fill | `color/text/state/disabled` | `color/date-picker/text/disabled` |
| range/* — text | fill | 동일 패턴 | 동일 datepicker 패턴 적용 |

> 참고: `color/control/bg/default`, `color/base/white`, `color/control/border` 기본값은 Figma에서 이미 Variable이 아닌 구조(흰 배경)일 수 있음. 실제 바인딩 확인 후 필요한 것만 교체.

---

## DatePicker/Calendar Tile 변형 구조

**variant 속성 축:**
- `state` = `default` | `selected` | `disabled`

속성명 리네임: `Property 1` → `state`

**토큰 바인딩 교체 명세:**

| 레이어 | 속성 | 기존 토큰 | 교체 토큰 |
|--------|------|---------|---------|
| default — bg | fill | `color/control/bg/default` | `color/date-picker/tile/bg/default` |
| selected — bg | fill | `color/control/bg/selected-alt` | `color/date-picker/tile/bg/selected` |
| disabled — bg | fill | `color/control/bg/disabled` | `color/date-picker/tile/bg/disabled` |
| default — border | stroke | `color/control/border/default` | `color/date-picker/tile/border/default` |
| selected — border | stroke | `color/control/border/selected` | `color/date-picker/border/today` |
| disabled — border | stroke | ~~`color/control/border/disabled-alt1`~~ | `color/date-picker/tile/border/disabled` |
| default — text | fill | `color/text/body/primary` | `color/date-picker/text/primary` |
| selected — text | fill | `color/text/state/accent` | `color/date-picker/text/today` |
| disabled — text | fill | `color/text/state/disabled` | `color/date-picker/text/disabled` |

---

## 허용편차 선언서

없음 — 모든 속성을 datepicker 토큰으로 완전 교체.

---

## HD 목록

없음 — 이전 단계에서 모두 해소됨.

---

## 빌더 지시 요약

1. vars-data.ts의 `date-picker` 블록에 신설 토큰 6개 추가 완료 후 진행
2. use_figma로 Figma Variables(`SW UX GUIDE V2.4`)에 신설 토큰 6개 추가
3. 노드 540:4167 하위 8개 컴포넌트를 `combineAsVariants` → 이름 `DatePicker/Calendar Cell`
4. 노드 540:4209 하위 3개 컴포넌트를 `combineAsVariants` → 이름 `DatePicker/Calendar Tile`, 속성명 `Property 1` → `state`
5. 위 토큰 바인딩 교체 명세 적용
6. combineAsVariants 후 variant 패킹(좌표 재배치 + hug resize) 반드시 수행
7. 생성/변경 node id 전부 node-map.json에 기록
