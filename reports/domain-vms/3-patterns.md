# Stage 3 — 패턴/도메인 빈도 랭킹 (승격 확정)

- 입력: `2-mapping.md` + 11위젯 인벤토리. 승격 기준 = **2개 이상 위젯 반복**.
- 판정: 반복 골격 → 반복도 높고 core에 없으면 **도메인 컴포넌트**, core 조합이면 **패턴**.

## 도메인 컴포넌트 후보 — 반복도 랭킹

| 순위 | 컴포넌트 | 반복(위젯 수) | 위젯 | 이번 라운드 |
|---|---|---|---|---|
| 1 | Widget Header | 11 | 01~11 | ✅ |
| 1 | Widget Shell(+사이즈변형) | 11 | 01~11 | ✅ |
| 3 | Summary Metric Block(요약 지표) | 4 | 02·03·05·10 | ✅ |
| 3 | Alert 토스트 | 4 | 01·02·03·04 | backlog(공통 승격 검토) |
| 5 | List Card Row | 3 | 06·07·08 | ✅ |
| 6 | Segment Gauge | 2 | 04·10 | ✅ |
| 6 | 방문/등록 유형 3종 블록 | 2 | 02·03 | backlog |
| 6 | 그래프(꺾은선/막대) | 2 | 03·05 | backlog(색 판독 필요) |
| — | 영상 타일 그리드 | 1 | 09 | backlog(video signature, 단일이나 중요) |
| — | 메모 항목 / 기기 타일 / 점수 게이지 / 지표 아이콘 타일 | 1 | 11 / 01 / 10 / 10 | backlog |

> 승격 기준(2+) 충족: Widget Header·Shell·Summary Metric·Alert·List Card Row·Gauge·유형3·그래프. 이번 라운드 = 이 중 5개(Alert·유형3·그래프 제외).
> 단일(1) 이지만 영상 타일 그리드는 **영상 서비스의 시그니처**라 backlog 상단 우선.

## 패턴 후보 (core 조합 — 새 컴포넌트 아님)

| 패턴 | 조합 | 반복 | 위젯 |
|---|---|---|---|
| 필터바 | Select + Search | 4 | 05·06·07·08 |
| 리스트 필터 스택 | Tab + Chip + 필터바 + 리스트 | 2 | 06·08 |
| 위젯 그리드(대시보드 레이아웃) | Widget Shell × N (사이즈 변형 조합) | 11 | 전 위젯 대시보드 |

> 패턴은 이번 라운드 도메인 컴포넌트 등록 후, 그 위에서 조합으로 등록(Stage 4 후반 or 다음 라운드).

## 이번 라운드 확정 (5 도메인 컴포넌트)
Video/Widget Header · Video/Widget Shell · Video/List Card Row · Video/Segment Gauge · Video/Summary Metric Block
