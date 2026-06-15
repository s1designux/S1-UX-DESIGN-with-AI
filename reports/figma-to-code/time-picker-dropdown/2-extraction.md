# TimePicker Dropdown — 2단계 수치추출 (Extraction)

값 출처: `get_design_context(1459:18526)` + `get_variable_defs(1459:18597)` + `get_metadata(1459:18597)`.
hex는 다크 해상값(참고용). **바인딩은 변수명 기준** — 전부 vars-data 정본에 존재 확인(신규 토큰 0).

## 패널 (panel)

| 속성 | Figma 원본값 | 토큰(변수명) | 빌더 적용 |
|------|------------|------------|----------|
| 너비 | 186 | — (sizing) | `PANEL_W = 186` |
| 배경 | list/bg | `color/dropdown/list/bg` | ✓ |
| 테두리 | 1px list/border | `color/dropdown/list/border` + `border-width/1` | ✓ |
| 모서리 | 4 | `radius/4` | cornerRadius 4 |
| 상단 패딩 | 12 | — | paddingTop 12 |
| 컬럼 영역 | 186×190 clip | — | cols 186×190, clipsContent |

## 컬럼·행

| 속성 | Figma | 빌더 |
|------|-------|------|
| 컬럼 수(24h) | 2 (Hour·Minute) | 2 |
| 컬럼 폭 | 93 each (구분선·패딩 없음) | 93 |
| 행 높이 | 30 | 40 → **30** |
| 표시 행 수 | 7 (210px, 190 clip) | 5 → **7** |
| 컬럼 사이 구분선 | **없음** | sep(1px) → **제거** |

## 아이템 (Time Base 77×30)

| 속성 | Figma 원본값 | 토큰 | 빌더 |
|------|------------|------|------|
| 폭×높이 | 77×30 | — | 행(93) 안 77 가운데, 8px 거터 |
| 내부 패딩 | px 12 | — | paddingL/R 12 |
| 모서리 | 4 | `radius/4` | 4 |
| 텍스트 | 14px Pretendard **Regular**, center, tracking -0.28px, lh 1.3 | `Body/Body-14R` | 14 Regular |
| default 라벨 | label/default | `color/dropdown/option/label/default` | (현재 text/body/secondary → 교체) |
| selected 테두리 | 1px border/selected | `color/dropdown/option/border/selected` | (현재 line/blue → 교체) |
| selected 라벨 | label/selected | `color/dropdown/option/label/selected` | (현재 text/state/accent → 교체) |
| selected weight | **Regular** | — | (현재 Bold → Regular) |
| hover bg | bg/hover | `color/dropdown/option/bg/hover` | (아이템 상태) |
| hover 라벨 | label/hover | `color/dropdown/option/label/hover` | (아이템 상태) |

## 푸터 (Option 186×40)

| 속성 | Figma | 토큰 | 빌더 |
|------|-------|------|------|
| 높이 | 40 | — | 45 → **40** |
| 텍스트 | "확인" 우측정렬 | `color/text/state/accent` | ✓(우측정렬 MAX 유지) |
| 폰트 | 14 (Body-14M 추정) | `Body/Body-14M` | 14 Medium |
| 좌우 패딩 | 16 | — | 16 |

## 검문소 2 — 빈칸 점검
- `MCP 미제공` 항목: **없음.** 모든 값 실측·토큰 정본 존재.
- 단 푸터 폰트 weight(14R vs 14M)는 var_defs에 둘 다 존재 → Medium 채택(현행 유지). 사소.
