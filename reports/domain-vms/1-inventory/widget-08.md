# 위젯 08. 이벤트 처리 현황 — 재고조사

- 노드: 1965:16905 / 크기: 2902×1600
- 파일: 영상출입 통합관제 최종(KOR)_v0.0.6
- 스크린샷 관찰: 발생한 이벤트를 탭(전체/조치 전/조치 완료/개인 이력)·카테고리 칩(영상/출입/기기/기타)·검색으로 필터링해 **스크롤 가능한 이벤트 리스트**로 보여주는 관제 대시보드 위젯. 같은 위젯의 **2가지 세로형 사이즈 변형(1×3 / 1×5)** 이 나란히 배치돼 있다. 리스트의 각 행은 회색 placeholder 사각형으로 비어 있고(더미), 한 행(5번째)만 하단 메타 정보가 실제 텍스트로 표시돼 행 구조를 드러낸다.

> **읽기 방법 표기:** 색은 get_variable_defs로 바인딩된 Variable 이름을 우선 기록(정본). Tailwind 코드의 `#RRGGBB`는 라이트-테마 fallback이 아니라 이 파일은 다크 해석값이 대부분(예: form-control/bg/default=#1c1d23). 텍스트는 get_design_context 원문 verbatim.

---

## 사이즈 변형 2종 (한 위젯의 세로 사이즈 변형)

| 변형 | 노드 | 크기(px) | 내용 구성 |
|------|------|---------|----------|
| 1×3 | 1965:16908 (`Widget_이벤트 처리 현황`) | 311×571 | 헤더 + 탭바(4) + 칩(4) + 검색+버튼 + 리스트(샘플 5행, 스크롤) |
| 1×5 | 1965:17008 (`Widget_이벤트 처리 현황`) | 311×957 | 1×3과 **구성·요소 동일**, 위젯 프레임만 더 높고(957) 리스트 컨테이너가 더 김(767) — 실제 채워진 샘플 행은 동일하게 5행 |

> 캔버스에는 각 변형 위/옆에 `[1x3 size widget]`(1965:17102) `[1x5 size widget]`(1965:17104) 와 `1x3`(1965:17106) `1x5`(1965:17108) 라는 **주석 라벨 프레임**(문서용 태그, 컴포넌트 아님)이 붙어 있다.
> **두 변형의 내부 요소 트리는 노드ID만 다를 뿐 완전히 동일** — 아래 트리는 1×3(1965:16908) 기준으로 기록하고, 1×5의 대응 노드는 필요 시 병기.

---

## 요소 트리 (verbatim, 1×3 기준)

### A. Title container (위젯 상단 배너 — 위젯01과 동일 패턴)
노드 1965:16906 (2902×166). 텍스트 1965:16907 = `위젯08. 이벤트 처리 현황` (문서용 대제목 배너).

| 요소 | 텍스트(원문) | 관찰 메모 |
|------|------|------|
| 배너 제목 | `위젯08. 이벤트 처리 현황` | 위젯01의 Title container(2902폭 배너)와 동일 구조 |

### B. Widget Header (공통 — 위젯01과 동일 컴포넌트명 "Widget Header")
인스턴스 노드: 1×3=1965:16909 / 1×5=1965:17009 (마스터 I…;1028:61340)

| 요소 | 텍스트(원문) | 색(Variable / hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 위젯 타이틀 | `이벤트 처리 현황` | `color/text/title/primary` = #ecedf0 | Title/16B (Pretendard Bold 16, lh1.3) | default | — | 위젯 공통 헤더 → core "Widget Header" 후보 |
| 구분선 | — | line (이미지 SVG, imgLine7) | 폭 100%, h0 | — | — | 헤더 하단 divider |

> **위젯01과 차이(관찰)**: 위젯01 헤더는 [타이틀 + 갱신시각(09:00:00) + 새로고침 아이콘]이었으나, 위젯08 헤더 인스턴스는 [타이틀 + divider]만 표시(갱신시각·새로고침 미표시). 같은 "Widget Header" 컴포넌트명이나 다른 마스터/변형(위젯01=1024:33540, 위젯08=1028:61340). 치환 판단은 Stage 2.

### C. Tab bar — 이벤트 상태 탭 (4탭, 신규 요소)
컨테이너 1965:16910 (`Frame 2087328265`, 279×30). 각 Tab = [라벨(Body/10M) + 카운트 뱃지(원형)].

| # | 탭 라벨(원문) | 상태 | 라벨 색(Variable) | 하단 인디케이터 | 카운트 뱃지 | 뱃지 숫자(hidden) | 관찰 메모 |
|---|------|------|------|------|------|------|------|
| 1 | `전체` | selected | `color/navigation/label/selected` = #3070d8 | border-b 2px `color/navigation/indicator/selected` = #3070d8 | 원형 `blue-dark/200` = #214ea0 (18×17) | `18` (hidden=true) | 선택 탭만 파란 강조·파란 뱃지 |
| 2 | `조치 전` | default | `color/navigation/label/default` = #55575f | border-b 1px `color/navigation/indicator/default` = #2e2f38 | 원형 `gray-dark/600` = #55575f | `10` (hidden=true) | |
| 3 | `조치 완료` | default | #55575f | border-b 1px #2e2f38 | 원형 #55575f | `5` (hidden=true) | |
| 4 | `개인 이력` | default | #55575f | border-b 1px #2e2f38 | 원형 #55575f | `2` (hidden=true) | |

- 탭 바 배경 `color/navigation/background` = #1c1d23.
- **모든 카운트 숫자(18/10/5/2)는 hidden=true** → 뱃지 원형만 보이고 숫자는 미표시(관찰).

### D. 카테고리 칩 행 (4칩, line 칩 — 위젯 신규)
컨테이너 1965:16939 (`Frame 2087328573`, 198×28). 칩 인스턴스 4개(마스터 I…;1027:34274).

| 칩 순서 | 텍스트(원문) | 색(Variable) | 크기 | 상태 | 관찰 메모 |
|------|------|------|------|------|------|
| 1 | `영상` | bg `color/chip/line/bg/default`=#1c1d23, border `color/chip/line/border/default`=#3e4049, label `color/chip/line/label/default`=#8a8c96 | h28(`sizing/chip-height/sm`), radius full, px12 py6 | default(line) | Body/12M, 코어 Chip(line) 재사용 후보 |
| 2 | `출입` | 동일 | 동일 | default | |
| 3 | `기기` | 동일 | 동일 | default | |
| 4 | `기타` | 동일 | 동일 | default | |

### E. 검색 입력 + 추가 버튼 (신규 요소)
컨테이너 1965:16944 (`Frame 2087328574`, 279×28). Search Input(1965:16945) + Button(1965:16946).

| 요소 | 텍스트(원문) | 색(Variable) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 검색 입력 | placeholder `검색어 입력` | bg `color/form-control/bg/default`=#1c1d23, border `color/form-control/border/default`=#3e4049, placeholder `color/form-control/text/placeholder`=#55575f | h28(`sizing/form-control-height/xxs`), radius4, flex-1(215w) | default | `ic_찾기/조회` (마스터 1183:12766, 20×20, `color/form-control/icon/default`=#8a8c96) | 코어 Search Input 재사용 후보 |
| 추가 버튼 | `추가` | bg `color/button/bg/primary--default`=#3070d8, border 동일, label `color/button/label/primary--default`=#ffffff (opacity90) | 58×28, radius4 | primary/default | — | Body/12M, 코어 Button(primary) 재사용 후보 |

### F. 이벤트 리스트 (스크롤, 핵심 반복 단위)
컨테이너 1965:16947 (`Frame 2085672994`, 279×381) → 내부 리스트 프레임 1965:16948 (`Frame 2087328444`, 279×408) = **Button 행 5개 + 행간 divider(Line) 5개**.
각 Button 행 노드: 1965:16949 / 16959 / 16969 / 16979 / 16989 (각 279×77). Line divider: 16958 / 16968 / 16978 / 16988 / 17005 (`color/line/gray/subtle`=#2e2f38).

**행 내부 구조 (Container 1965:16950 등, 243×53):**

| 하위 요소 | 정체(관찰) | 색(Variable) | 크기 | 상태 | 관찰 메모 |
|------|------|------|------|------|------|
| 상태 뱃지 placeholder | `Rectangle 240654744` | `gray-dark/300`=#2e2f38 | 30×17 | placeholder | 행 좌상단 작은 회색 칩 자리 |
| 구분 점(dot) | `Ellipse 5652` | (SVG, imgEllipse5652) | 2×2 | — | 뱃지와 제목 사이 구분점 |
| 제목 placeholder | `Rectangle 240654743` | `gray-dark/300`=#2e2f38 | 203×16 (flex) | placeholder | 이벤트 제목 자리 |
| 설명 placeholder | `Rectangle 240654743` | `gray-dark/300`=#2e2f38 | 243×13 | placeholder | 제목 아래 본문 한 줄 |
| 메타 placeholder | `Rectangle 240654743` | `gray-dark/300`=#2e2f38 | 243×13 | placeholder | 하단 메타 줄(4행 중 마지막) |

**5번째 행(1965:16989)만 메타 줄이 실제 텍스트로 표시(verbatim)** — 나머지 4행은 메타가 회색 placeholder. 메타 컨테이너 1965:16997:

| 메타 요소 | 텍스트(원문) | 색(Variable) | 크기/폰트 | 관찰 메모 |
|------|------|------|------|------|
| 처리 상태 | `조치완료` | `blue-dark/400` = #6fa5f8 | Body/10M | 파란 강조 = 상태 라벨(관찰) |
| 구분선 | — | (SVG, imgLine126, 세로선) | 10px | 상태와 작성자 구분 |
| 작성자 | `김메모` | `color/text/body/tertiary` = #757575(코드)/#8a8c96(var) | Body/10R | |
| 구분 점 | — | (SVG) 2×2 | — | |
| 부서 | `기술개발팀` | body/tertiary | Body/10R | |
| 구분 점 | — | (SVG) 2×2 | — | |
| 일시 | `YY.MM.DD HH:MM` | body/tertiary | Body/10R | 날짜 포맷 placeholder 문자열 |

### G. 스크롤바 (신규 요소)
노드 1965:17006 (`scroll`, 8×415). 안에 `Rectangle 240654010`(1965:17007, 4×36, `color/scroll/bg`=#55575f) = 스크롤 thumb. 리스트가 위젯 높이보다 길어 세로 스크롤됨을 나타냄(관찰).

---

## 반복/구조 관찰

1. **사이즈 변형 2종(1×3 / 1×5)이 한 컴포넌트의 세로 사이즈 변형.** 두 변형의 내부 요소 트리는 노드ID만 다르고 완전히 동일 — 1×5는 위젯 프레임·리스트 컨테이너만 더 길고(957/767) 샘플 채움 행 수는 동일(5행). 즉 1×5는 "더 많은 행을 담을 공간"을 나타내는 변형(관찰).
2. **핵심 반복 단위 = 이벤트 리스트 행(Button, 77px)** ×5 + 행간 divider. 행 = [상태뱃지 + 제목] / [설명] / [메타: 처리상태·작성자·부서·일시]. 4행은 placeholder, 5번째 행만 메타를 실제 텍스트로 노출해 구조를 드러냄.
3. **필터 스택(수직 배치)**: ①탭바(상태별 4탭+카운트뱃지) → ②카테고리 칩(4) → ③검색+추가 → ④리스트. 이벤트를 상태·카테고리·검색어로 좁히는 필터 UI 조합.
4. **탭 카운트 전부 hidden**: 탭 뱃지 숫자(18/10/5/2)는 모두 hidden=true라 원형 뱃지만 보임 — 실제 카운트 미표시(관찰).
5. **placeholder 일관**: 리스트 행의 뱃지·제목·설명·메타 자리는 `gray-dark/300`(#2e2f38) 회색 사각형(더미). 위젯01과 동일한 placeholder 색.
6. **코어 컴포넌트 재사용 후보 다수**: Widget Header / Chip(line) / Search Input / Button(primary) / Tab / 스크롤바 — 모두 라이브러리 인스턴스로 배치됨(치환 판단은 Stage 2).

---

## 위젯01과 공유 구조 목록

- **Title container**: 2902폭 상단 배너 + 대제목 텍스트 — 위젯01과 동일 패턴.
- **Widget Header**: 같은 "Widget Header" 컴포넌트명. 단 위젯08 인스턴스는 [타이틀+divider]만, 위젯01은 [타이틀+갱신시각+새로고침 아이콘] — 마스터/변형 다름(위젯01=1024:33540, 위젯08=1028:61340).
- **placeholder 색**: `gray-dark/300` = #2e2f38 회색 사각형 더미 — 위젯01과 동일.
- **텍스트 색 체계**: `color/text/title/primary`(#ecedf0), `color/text/body/tertiary` — 위젯01과 동일 Variable.
- **주석 라벨 프레임**: `[NxN size widget]` 문서용 태그 프레임 — 위젯01과 동일 관례.

---

## 미확인 항목

- **리스트 행의 실제 이벤트 내용**: 4개 행의 상태뱃지·제목·설명이 모두 placeholder라 실제 이벤트 텍스트 없음(5번째 행 메타만 예외적으로 `조치완료·김메모·기술개발팀·YY.MM.DD HH:MM` 표기, 이마저 날짜는 포맷 placeholder) → 미확인.
- **탭 카운트 실제 값**: 뱃지 숫자 18/10/5/2가 전부 hidden → 실제 표시 여부/값 미확인.
- **1×5가 1×3과 다른 점의 의도**: 요소 트리 동일·프레임 높이만 다름 — 더 많은 행 수용 외 추가 요소(예: 더 많은 필터)가 있는지 시안상 없음 → "높이만 다른 변형"으로 관찰되나 실제 콘텐츠 차이는 미확인.
- **상태뱃지 placeholder(30×17)의 실제 상태값**: 리스트 행 좌상단 회색 칩이 어떤 상태 라벨(예: 긴급/처리중 등)인지 시안에 텍스트 없음 → 미확인.
- **body/tertiary 색 최종값**: 코드 fallback #757575(라이트) vs get_variable_defs #8a8c96(다크) 병존 → 노드별 다크 바인딩 최종값 재확인 필요(Variable 이름은 확인됨).
