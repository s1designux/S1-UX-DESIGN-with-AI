# 위젯 06. 이상 이벤트 리스트 — 재고조사

- 노드: 1965:16608 / 크기: 2902×1600
- 파일: 영상출입 통합관제 최종(KOR)_v0.0.6
- 스크린샷 관찰: 이상 이벤트를 **세로 리스트**로 쌓아 보여주는 관제 위젯. 헤더(제목+액션) → 탭(전체/영상/출입 + 필터 Chip) → 필터바(유형 Select + 검색 Input) → **이벤트 카드 리스트(세로 반복)** + 우측 스크롤바 구조. 같은 위젯의 **2가지 세로 사이즈 변형(1×3 / 1×5)** 이 나란히 놓여 있고, 리스트 각 카드의 텍스트·썸네일 자리는 모두 회색 placeholder 사각형(더미)이다. 별도로 필터용 Dropdown 펼침 상태가 캔버스 옆에 hidden으로 떨어져 있다.

> **읽기 방법 표기:** 색은 get_variable_defs로 바인딩된 Variable 이름을 우선 기록(정본). Tailwind 코드의 `#RRGGBB`(예: fallback `#202020`, `#757575`)는 라이트-테마 fallback이라 실제 다크 렌더값과 다를 수 있어 참고로만 병기. 텍스트는 get_design_context 원문 verbatim.

---

## 사이즈 변형 2종 (한 위젯의 세로 반응형 변형)

| 변형 | 노드 | 크기(px) | 내용 구성 |
|------|------|---------|----------|
| 1×3 | 1965:16615 (`Dashboard_Widget_007_2`) | 311×571 | 헤더(제목+아이콘 3종) + 탭바 + 필터바 + 이벤트 카드 리스트(7행, 각 77h) + 스크롤 |
| 1×5 | 1965:16747 (`Dashboard_Widget_007_2`) | 311×957 | 헤더(제목+`실시간 업데이트` 텍스트) + 탭바 + 필터바 + 이벤트 카드 리스트(7행, 각 77h) + 스크롤 |

> 두 변형의 **차이는 (1)높이(571 vs 957)와 (2)헤더 우측** 뿐: 1×3은 아이콘 3종(다운로드/화면확대/사용환경설정), 1×5는 `실시간 업데이트` 텍스트. 탭·필터·카드 구조는 동일.
> 캔버스에는 각 변형 위에 `1x3` `1x5` 와 `전체 이벤트 Tab` 라는 **주석 라벨 프레임**(문서용 태그, 컴포넌트 아님 — 위젯01의 `[1x1 size widget]` 태그와 동일 성격)이 붙어 있다.

---

## 요소 트리 (verbatim)

### A. Title container (최상단 배너 — 위젯01과 동일)
노드 1965:16609 (2902×166), 텍스트 1965:16610 `위젯 06. 이상 이벤트 리스트`. **위젯01의 Title container와 동일 구조**(문서용 대제목 배너).

### B. Header area (위젯 헤더 — 두 변형이 구조 공유)
노드: 1×3=1965:16616 / 1×5=1965:16748. (위젯01 `Widget Header`와 **유사 구조**이나 여기선 로컬 `Header area` 프레임 — 동일 마스터 인스턴스 여부는 미확인)

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 위젯 타이틀 | `이상 이벤트 현황` | `color/text/title/primary` = #ecedf0 (코드 fallback #202020) | Title/16B (Pretendard Bold 16, lh1.3) | default | — | 두 변형 공통. **캔버스 대제목(`이상 이벤트 리스트`)과 위젯 내부 타이틀(`이상 이벤트 현황`)이 다름**(관찰) |
| 헤더 액션(1×3만) | — | icon `color/icon/gray-dark` = #b8babf(추정 — 아이콘 기본색) | 각 16×16, gap 8 | default | `ic_다운로드`(28:18492) / `ic_화면확대`(28:2524) / `ic_사용환경설정`(28:19235) 라이브러리 인스턴스 | 1×3 헤더 우측 3-아이콘 액션 |
| 갱신 표시(1×5만) | `실시간 업데이트` | `color/text/body/tertiary` (코드 fallback #757575) | Supporting/Caption-12R (Pretendard Regular 12) | default | — | 1×5 헤더 우측 텍스트(아이콘 대신) |
| 구분선 | — | line (이미지 SVG, `imgLine7`) | 폭 279, h0 | — | — | 헤더 하단 divider (위젯01과 동일 방식) |

### C. 탭바 (Tab 3종 + 필터 Chip) — 두 변형 공통
노드: 1×3=1965:16624 / 1×5=1965:16754. Tab 3개 + 우측 Chip.

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| Tab1 라벨 | `전체` | `color/navigation/label/selected` = #3070d8 | Body/10M (Pretendard Medium 10, lh1.4, ls0.2) | selected | — | 하단 인디케이터 `color/navigation/indicator/selected` #3070d8, border-bottom 2px |
| Tab1 뱃지 | (`999+` hidden) | bg `blue-dark/200` = #214ea0 | 18×17, rounded-full, px6 py2 | selected | — | 카운트 뱃지 자리(텍스트 hidden — 실제 숫자 미표시) |
| Tab2 라벨 | `영상` | `color/navigation/label/default` = #55575f | Body/10M | default | — | border-bottom 1px `indicator/default` #2e2f38 |
| Tab2 뱃지 | (`690` hidden) | bg `gray-dark/600` = #55575f | 18×17 rounded-full | default | — | 텍스트 hidden |
| Tab3 라벨 | `출입` | `color/navigation/label/default` = #55575f | Body/10M | default | — | |
| Tab3 뱃지 | (`600` hidden) | bg `gray-dark/600` = #55575f | 18×17 rounded-full | default | — | 텍스트 hidden |
| 필터 Chip | `중복 제외 OFF` | 라벨 `color/chip/line/label/disabled` = #55575f, bg `color/chip/line/bg/disabled` = #24252c, border `color/chip/line/border/disabled` = #24252c | 라인 chip, px6 py2, rounded-full | disabled | — | 우측 토글형 Chip(관찰), 현재 disabled/OFF 상태 |

### D. 필터바 (유형 Select + 검색 Input) — 두 변형 공통
노드: 1×3=1965:16648 / 1×5=1965:16778. 가로 배치 gap6.

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| Dropdown(숨김) | — | — | 85×28 | hidden | — | Select Box 뒤에 hidden 인스턴스 1개 존재 |
| Select Box | `전체 유형`(placeholder) | 텍스트 `color/form-control/text/placeholder` = #55575f, bg `color/form-control/bg/default` = #1c1d23, border `color/form-control/border/default` = #3e4049 | 124×28, h28, rounded-4, pl12 pr8 | default(placeholder) | `ic_화살표, 더보기`(77:778) 20×20 rotate90 | 유형 필터 셀렉트 |
| Search Input | `검색`(placeholder) | 텍스트 `form-control/text/placeholder` = #55575f, bg `form-control/bg/default` #1c1d23, border `form-control/border/default` #3e4049 | flex(149×28), h28, rounded-4 | default(placeholder) | `ic_찾기/조회`(1183:12766) 20×20 | 검색 인풋 |

### E. 이벤트 카드 리스트 — 핵심 반복 단위 (두 변형 공통, 7행)
리스트 컨테이너: 1×3=1965:16652 (279×419) / 1×5=1965:16782 (279×805). 각 카드 = `Button` 프레임(279×77), 카드 사이 divider.
예시 카드 노드 1965:16654 (1×3 첫 카드).

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 카드 컨테이너 | — | — | 279×77, px20 py12, gap10 | default | — | `Button` 프레임 — 클릭 가능한 이벤트 카드처럼 보임(관찰) |
| 배지 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | 30×17 | placeholder | — | 상단행 좌측 작은 라벨/뱃지 자리 |
| 제목 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | flex(101)×16 | placeholder | — | 상단행 우측 제목 자리 |
| 본문줄1 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | 135×13 | placeholder | — | 둘째 줄 |
| 본문줄2 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | 135×13 | placeholder | — | 셋째 줄 |
| 썸네일 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | 94×53, rounded-4 | placeholder | — | 우측 이미지 자리. 노드명 `Image (침입 감지)` — 이벤트 썸네일(관찰) |
| 카드 divider | — | `Rectangle 240654738` (line) | 243×1 | — | — | 카드 사이 구분선, 좌우 20 인셋 |

- 카드는 [텍스트 블록(뱃지+제목+본문2줄) + 우측 썸네일] 구성. 모든 텍스트·썸네일이 `gray-dark/300` placeholder(실제 이벤트명·시각·이미지 없음).
- 1×3·1×5 모두 metadata상 카드 7개(`Button`) 정의. 컨테이너 높이만 다름(419 vs 805) → 1×5가 더 많은 카드를 스크롤 없이 노출.

### F. 스크롤바 — 두 변형 공통
노드 1×3=1965:16718 / 1×5=1965:16847. 8px 폭 track, thumb `Rectangle 240654010/011` 4×36 rounded. (위젯 내부 세로 스크롤 표시)

### G. 필터 Dropdown 펼침(hidden 오버레이 — 본체 밖 별도)
노드 1965:16720 (114×180, hidden). Select Box(유형/상태 필터)의 **펼쳐진 상태**를 문서용으로 옆에 떼어 놓은 것(관찰).

| 요소 | 텍스트(원문, verbatim) | 상태 | 관찰 메모 |
|------|------|------|------|
| Dropdown 헤더 | `전체 상태` | default | ic_화살표,더보기 16×16 동반 |
| Option 1 | `전체 상태` | 표시 | 40h 옵션 |
| Option (hidden) | `임직원` | hidden | 미표시 |
| Option 2 | `조치 전` | 표시 | |
| Option 3 | `조치 완료` | 표시 | |
| Option (hidden) | `Option` | hidden | 더미 라벨 |
| 스크롤 | — | — | 8px track, thumb 4×36 |

---

## 반복/구조 관찰

1. **세로 사이즈 변형 2종**(1×3 / 1×5)이 한 컴포넌트의 세로 반응형 변형. 탭·필터·카드 구조는 동일하고 **높이와 헤더 우측(아이콘 3종 vs `실시간 업데이트` 텍스트)만 차이**.
2. **이벤트 카드(`Button` 279×77)가 핵심 세로 반복 단위**. 카드 = [뱃지 placeholder + 제목 placeholder + 본문 2줄 placeholder + 우측 썸네일(94×53)]. 카드 사이 divider(243×1). 리스트/테이블처럼 보임(관찰).
3. **탭 반복 구조**: Tab = [라벨(10M) + 카운트 뱃지(18×17 rounded-full)]. 선택 탭만 라벨·인디케이터·뱃지색이 selected(파랑 계열), 나머지는 default(회색). 뱃지 텍스트(`999+`/`690`/`600`)는 모두 hidden.
4. **필터 3요소**: 토글형 Chip(`중복 제외 OFF`, disabled) + 유형 Select(`전체 유형`) + 검색 Input(`검색`). Select 펼침 상태는 별도 hidden Dropdown으로 문서화.
5. **영역 구분**: ①Title container(2902 대제목 배너) ②헤더(제목+액션/갱신+divider) ③탭바 ④필터바 ⑤카드 리스트+스크롤. 위젯01과 동일한 배너+헤더+divider 프레이밍.
6. **placeholder 일관**: 카드의 모든 텍스트·썸네일 자리가 `gray-dark/300`(#2e2f38) 회색 사각형(더미). 뱃지 카운트 텍스트도 hidden. 실제 이벤트 데이터·이미지·건수는 이 시안에 없음.
7. **아이콘 처리**: 표시 아이콘은 헤더(1×3)의 다운로드/화면확대/사용환경설정 3종, 필터의 화살표·검색 아이콘. 모두 라이브러리 인스턴스.

---

## 미확인 항목

- **헤더 액션 아이콘 3종의 실제 바인딩 색**: get_design_context는 아이콘 SVG만 반환하고 색 Variable을 명시하지 않음. 위젯 변수집합의 `color/icon/gray-dark`(#b8babf)로 **추정**했으나 노드별 바인딩 verbatim 미확인.
- **카드 placeholder의 실제 콘텐츠**: 뱃지(30×17)·제목(101×16)·본문 2줄(135×13)·썸네일(94×53)이 각각 무슨 텍스트/이미지인지 시안에 없음(더미) → 미확인. 노드명 `Image (침입 감지)`로 보아 썸네일이 이벤트 스냅샷 이미지로 **추정**되나 verbatim 콘텐츠 없음.
- **탭 카운트 실제 값**: `999+`/`690`/`600` 뱃지 텍스트가 모두 hidden=true → 실제 표시 수치 없음 → 미확인.
- **1×3과 1×5의 카드 개수 차이 의도**: 두 변형 모두 metadata상 `Button` 7개 정의. 실제 노출 개수(스크롤 전 보이는 수)는 컨테이너 높이(419 vs 805)로 달라지나, 데이터 로딩 시 행 수 정책은 시안상 미명시 → 미확인.
- **body/tertiary·icon 색의 다크 실제값**: 코드 fallback(#757575 등)은 라이트 테마값. Variable 이름은 확인됐으나 1×5 `실시간 업데이트`의 다크 최종 렌더값은 노드 재확인 필요.
- **Chip `중복 제외 OFF`의 ON 상태**: 현재 disabled/OFF만 존재. 켜진 상태 variant는 시안에 없음 → 미확인.
