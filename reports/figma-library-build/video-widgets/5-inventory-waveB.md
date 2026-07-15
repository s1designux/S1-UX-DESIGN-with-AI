# 영상 도메인 위젯 — 웨이브 B 원본 재고조사 (읽기 전용)

- 원본 파일: `Tnihi6lixRR47N4RSAwUbF` (영상출입 통합관제 최종 v0.0.6), 캔버스 `1181:12496`
- 방법: `get_metadata`(구조) → 핵심 노드만 `get_design_context` + `get_variable_defs`. 색은 Variable 이름 정본으로 기록.
- 판독일: 2026-07-12. **추측 없음 — MCP에서 실제로 읽은 값만.** 미확인 항목은 맨 아래 목록.

> ⚠️ 공통 관찰: 리스트/타일의 콘텐츠 대부분이 **스켈레톤 플레이스홀더 막대**(`gray-dark/300` 채운 rounded-rectangle)로 그려져 있다. 실제 텍스트가 박힌 곳은 카테고리 라벨·이상상태 라벨·메모 항목·이벤트 메타행뿐. 스켈레톤 막대는 콘텐츠 자리표시이므로 빌드 시 실제 텍스트/토큰으로 대체 대상.

---

## 위젯01 — 기기 설치 현황 `1965:14552`

3개 사이즈 변형: `기기 설치 현황2x1`(630×185, id 1965:14565) · `W1x1`(311×185, 1965:14607) · `기기 설치 현황2x2`(630×378, 1965:14634). 각 변형 상단에 `Widget Header` 인스턴스(웨이브 A 공유 부품).

### 부품 A — 기기 카테고리 타일 (아이콘+수량 집계 타일)

2x1 변형 안 `이상기기`(1965:14567, 598×111, auto-layout row) = 카메라/서버/컨트롤러/리더 4개 타일 + 세로 구분선(`Line`, 0폭 hairline).

타일 1개 구조 (예: 카메라 `1965:14568`, 125.5×111):
```
카메라 (flex-col, justify-between, padding 10, radius 4)
├ Frame(row, justify-between)
│  ├ Title+total (flex-col, gap 4)
│  │  ├ Title (row, gap 4): [ic_박스카메라 16×16 hidden] + 라벨"카메라"
│  │  └ 스켈레톤막대 h16 (gray-dark/300)   ← 수량/집계 자리
│  └ 스켈레톤막대 40×20 (gray-dark/300)     ← total 뱃지 자리
└ 스켈레톤막대 105.5×40 (gray-dark/300)      ← 하단 값 블록
```

| 속성 | 값 | Variable |
|------|-----|----------|
| 타일 크기 | 125.5×111 (2x1) / 137.5×144 (2x2) | 실측 |
| padding | 10 | — |
| radius | 4 | `radius/4` |
| 라벨 텍스트 | 14px Medium, Pretendard | 스타일 `Body/14M` |
| 라벨 색 | — | `color/text/body/primary` (dark #ecedf0) |
| 스켈레톤 막대 색 | — | `gray-dark/300` (#2e2f38) |
| 카테고리 아이콘 | 16×16, **hidden=true** | 인스턴스: ic_박스카메라·ic_인터넷·ic_출입관리·ic_얼굴인증 |
| 세로 구분선 | 0폭 hairline | `color/line/gray/*` (metadata상 Line 노드) |

> 카테고리 아이콘 4종은 라이브러리 인스턴스지만 이 시안에서 전부 `hidden=true`. key 미노출(이름만: `ic_박스카메라`/`ic_인터넷`/`ic_출입관리`/`ic_얼굴인증`).

### 부품 B — 이상상태 리스트 행 (2x2 변형 하단)

2x2 카테고리 타일 하단 `카메라`(1965:14647) = `gray-dark/50`(#131418) 배경 카드, 세로 List 행 3개 + 구분선.

List 행 1개(1965:14648, padding 10, radius 4, row, justify-between):
- 좌: 상태 라벨 텍스트 **12px Medium** (`Body/12M`)
- 우: 스켈레톤 막대 16×16 (`gray-dark/300`) ← 수량 자리

| 속성 | 값 | Variable |
|------|-----|----------|
| 카드 배경 | — | `gray-dark/50` (#131418) |
| 카드 gap / padding | 6 / 10 | `spacing/2`,`spacing/4` 계열 |
| 라벨(활성) 색 | — | `color/text/body/primary` (#ecedf0) |
| 라벨(비활성 예: 통신오류) 색 | — | `color/text/body/tertiary` (#8a8c96) |
| 행간 구분선 | hairline img | `color/line/gray/subtle` (#2e2f38) |
| 라벨 스타일 | 12px Medium | `Body/12M` |

### 부품 C — Alert 토스트 `1965:14559` (395×38)

```
Alert (row, padding 16/10, radius 6, border 1)
└ content (row, gap 10, items-center)
   ├ Frame (row, gap 4): [ic_주의(원형) 16×16] + title 텍스트
   └ ic_닫기 16×16
```

| 속성 | 값 | Variable |
|------|-----|----------|
| 컨테이너 배경 | #fcd0d5 | `red-dark/500` |
| 테두리 | 1px #f48890 | `red-dark/400` |
| radius | 6 | (literal 6) |
| padding | 16 / 10 | — |
| 메시지 텍스트 | "일시적 오류가 발생하였습니다. 다시 시도해 주세요." 14px Regular | `Body/14R` |
| 메시지 색 | #8a2a3e | `red-dark/200` |
| 좌측 아이콘 | ic_주의(원형) 16×16 | 인스턴스 node `28:18735` (설명: 주의/경고/warning) |
| 우측 닫기 | ic_닫기 16×16 | 인스턴스 node `28:18270` (닫기/close) |

> ⚠️ **관찰(단정 아님):** Alert만 `red-dark/*` 스케일이 **밝은-외형 값**으로 해석됨(연분홍 배경 #fcd0d5 + 진한 적색 텍스트 #8a2a3e). 다크 대시보드(다른 위젯은 gray-dark/50 어두운 배경)와 명도 방향이 반대다. 메모리의 "Figma 다크 appearance 핀 함정" 가능성 — 빌드 전 라이트/다크 어느 쪽 토큰이 정본인지 사용자 확인 권장. Variable 이름은 위 표대로 충실 기록.

---

## 위젯07 — 개인별 출입 이력 검색 `1965:16849`

2개 사이즈: `_1`(311×378, 1965:16852) · `_1`(630×378, 1965:16874). 상단 Widget Header 인스턴스.

### 모듈 — 필터 + 검색결과 행 (`1965:16854`)

```
Frame2087328223 (flex-col, gap 10)
├ Frame(row, gap 6): [Select Box 91×28] + [Search Input flex 182×28]
├ 텍스트 "총" (12px Regular)
└ 결과 리스트(gray-dark/50 배경, radius 4)
   ├ Button 행(padding 20/12, row gap 10)
   │  ├ Avatar 32×32 [hidden=true]  (initial 텍스트 "문")
   │  └ Container(flex-col gap 4): 스켈레톤 16h + 스켈레톤 13h  ← 2줄 자리
   ├ 구분선(padding-x 10, 1px)
   └ Button 행(동일 구조)
```

| 속성 | 값 | Variable |
|------|-----|----------|
| Select Box | 91×28, 코어 인스턴스 (`I…;1027:35847`) | bg `color/form-control/bg/default`(#1c1d23), border `color/form-control/border/default`(#3e4049), text `color/form-control/text/default`(#b8babf), 라벨"전체" 12R, caret `ic_화살표,더보기` node `77:778` 20×20 |
| Search Input | flex×28, 코어 인스턴스 (`Input Base 1027:36032`) | 동일 form-control 토큰, placeholder `color/form-control/text/placeholder`(#55575f), icon `ic_찾기/조회` node `1183:12766` 20×20 |
| 높이 | 28 | `sizing/form-control-height/xxs` |
| "총" 라벨 색 | — | `gray-dark/800` (#b8babf) |
| 결과 카드 배경 | — | `gray-dark/50` (#131418) |
| 행 구분선 | 1px | `color/line/gray/default` (#2e2f38) — code fallback #d9d9d9(light) |
| Avatar (숨김) | 32×32, 이니셜 텍스트 | 기존 List Card Row Avatar와 대조 대상 |
| 결과 2줄 | 스켈레톤 16h + 13h | `gray-dark/300` |

> 관찰: Select Box·Search Input은 **코어 form-control 컴포넌트와 동일**해 보임(토큰·사이즈 일치). Avatar 행은 숨김 상태라 렌더 안 됨 — List Card Row Avatar 재사용 후보.

---

## 위젯08 — 이벤트 처리 현황 `1965:16905`

2개 사이즈: `1x3`(311×571, 1965:16908) · `1x5`(311×957, 1965:17008). 필터 스택 = Tab → Chip → Search+Button → 리스트.

### 부품 — Tab (`1965:16910` 스트립, Tab 1개 `1965:16911`)

4개 Tab(각 69.75×30). Tab = **raw 프레임**(코어 인스턴스 아님)이나 navigation 토큰 사용.
```
Tab (row, px 4, 하단 border 2px)
└ Text Area (row, gap 4): 라벨 텍스트 + count 뱃지(pill 18×17)
```
| 속성 | 값 | Variable |
|------|-----|----------|
| Tab 배경 | — | `color/navigation/background` (#1c1d23) |
| 선택 하단 인디케이터 | 2px | `color/navigation/indicator/selected` (#3070d8), `border-width/2` |
| 미선택 인디케이터 | — | `color/navigation/indicator/default` (#2e2f38) |
| 라벨(선택) 색 | — | `color/navigation/label/selected` (#3070d8) |
| 라벨(미선택) 색 | — | `color/navigation/label/default` (#55575f) |
| 라벨 스타일 | 10px Medium | `Body/10M` |
| count 뱃지 | pill 18×17, px6 py2 | 배경 `blue-dark/200` (#214ea0); 숫자 텍스트 hidden=true |

### 부품 — Chip 스트립 (`1965:16939`)

Chip 인스턴스 4개(각 45×28). 코어 Chip(line variant).
| 속성 | Variable |
|------|----------|
| 높이 28 | `sizing/chip-height/sm` |
| 배경 | `color/chip/line/bg/default` (#1c1d23) |
| 테두리 | `color/chip/line/border/default` (#3e4049) |
| 라벨 색 | `color/chip/line/label/default` (#8a8c96) |

### 부품 — Search + Button (`1965:16944`)

`[Search Input flex×28]` + `[Button "추가" 58×28]`, gap 6.
| 부품 | 값 | Variable |
|------|-----|----------|
| Search Input | 코어 인스턴스 (`Input Base 1027:36032`), placeholder"검색어 입력" | form-control 토큰(위 위젯07과 동일), icon `ic_찾기/조회` `1183:12766` 20×20 |
| Button | 코어 Primary (`Button Base 1027:34048`) 58×28, 라벨"추가" 12M | bg `color/button/bg/primary--default`(#3070d8), border `color/button/border/primary--default`(#3070d8), label `color/button/label/primary--default`(#ffffff), radius `radius/4` |

### 부품 — 이벤트 리스트 행 (`1965:16949` 등, 279×77)

```
Button 행 (padding 20좌/16우/12, radius 없음)
└ Container (flex-col gap 6)
   ├ 상단(flex-col gap 4)
   │  ├ row: 스켈레톤 30×17 + 점(ellipse 2×2) + 스켈레톤 flex×16   ← 상태뱃지+제목 자리
   │  └ 스켈레톤 13h                                              ← 부제 자리
   └ 메타 Container(row, gap 4, h13): 상태라벨 + 구분선 + 담당/부서/일시
```
마지막 행(1965:16989)만 실제 메타 텍스트:
| 메타 요소 | 텍스트 | 스타일 | 색 Variable |
|-----------|--------|--------|-------------|
| 상태 라벨 | "조치완료" | 10px Medium `Body/10M` | `blue-dark/400` (#6fa5f8) |
| 세로 구분선 | 10px line | — | `color/line/gray/*` |
| 담당 | "김메모" | 10px Regular `Body/10R` | `color/text/body/tertiary` (#8a8c96) |
| 부서 | "기술개발팀" | 10R | `color/text/body/tertiary` |
| 일시 | "YY.MM.DD HH:MM" | 10R | `color/text/body/tertiary` |
| 구분 점(dot) | ellipse 2×2 | — | (img asset) |
| 행 구분선 | 1px `Line` | — | `color/line/gray/default` (#2e2f38) |
| 우측 스크롤바 | 8폭 track, 4폭 thumb | — | `color/scroll/bg` (#55575f) |

> 관찰: Tab은 core navigation 토큰을 쓰나 인스턴스가 아닌 raw 프레임 — 코어 Tab 컴포넌트 재사용 후보(단정 아님). Chip·Search·Button은 코어 인스턴스로 확인됨.

---

## 위젯11 — 메모 `1965:17492`

2개 사이즈: `Widget_메모`(311×185, 1965:17503) · `(311×378, 1965:17524)`. 상단 Widget Header 인스턴스. Scroll container 안에 Content(메모 항목 목록) + FAB + 스크롤바.

### 부품 — 메모 항목 (`1965:17517`, 279×52; 스켈레톤형은 51h)

```
Message item (flex-col, gap 2, padding 12/10, radius 6)
├ Message text (12px Regular)
└ Message time (10px Regular)
```
대부분 항목은 스켈레톤(제목막대 255×16 + 시간막대 255×13, `gray-dark/300`). 실제 텍스트 항목:
| 요소 | 텍스트 | 스타일 | 색 Variable |
|------|--------|--------|-------------|
| 제목 | "냉방기 점검 요청 접수" | 12px Regular `Body/12R` | `color/text/title/primary` (#ecedf0) |
| 시간 | "5/19 18:40" | 10px Regular `Body/10R` | `color/text/body/secondary` (#b8babf) |
| 항목 padding | 12/10 | — | — |
| radius | 6 | (literal) |
| 항목간 구분선 | 267×1px | — | `color/line/gray/subtle` (#2e2f38) |

### 부품 — 플로팅 추가버튼 FAB (`1965:17520`, 34×34)

```
Button container (원형, padding 7)
└ ic_더하기 20×20
```
| 속성 | 값 | Variable |
|------|-----|----------|
| 크기 | 34×34 (원형, radius 9999) | 실측 |
| padding | 7 | — |
| 배경 | #3070d8(dark) / code fallback #1d6ceb | `color/button/bg/primary--default` |
| 아이콘 | ic_더하기 20×20 | 인스턴스 node `28:18280` (더하기/plus/add) |

---

## 아이콘 인벤토리 (라이브러리 인스턴스)

| 아이콘 | node id | 크기 | 사용처 | 상태 |
|--------|---------|------|--------|------|
| ic_주의(원형) | 28:18735 | 16 | 위젯01 Alert 좌 | 표시 |
| ic_닫기 | 28:18270 | 16 | 위젯01 Alert 우 | 표시 |
| ic_박스카메라 | (이름만) | 16 | 위젯01 카메라 타일 | **hidden** |
| ic_인터넷 | (이름만) | 16 | 위젯01 서버 타일 | **hidden** |
| ic_출입관리 | (이름만) | 16 | 위젯01 컨트롤러 타일 | **hidden** |
| ic_얼굴인증 | (이름만) | 16 | 위젯01 리더 타일 | **hidden** |
| ic_화살표,더보기 | 77:778 | 20 | 위젯07 Select caret | 표시 |
| ic_찾기/조회 | 1183:12766 | 20 | 위젯07·08 Search | 표시 |
| ic_더하기 | 28:18280 | 20 | 위젯11 FAB | 표시 |

---

## 미확인 / raw / 확인 필요 목록

1. **카테고리 아이콘 4종 key 미노출** — ic_박스카메라·ic_인터넷·ic_출입관리·ic_얼굴인증은 이름만 확인, componentKey 미노출(hidden 상태라 design_context에 노출 안 됨). 빌드 시 라이브러리에서 이름으로 재조회 필요.
2. **Alert 밝은-외형 값** — `red-dark/500`(#fcd0d5)/`red-dark/400`(#f48890)/`red-dark/200`(#8a2a3e)가 다크 대시보드 안에서 라이트-외형으로 해석됨. 라이트/다크 정본 방향 사용자 확인 필요(HD 후보).
3. **Tab count 숫자·뱃지 텍스트 hidden** — 위젯08 Tab의 count(18/10/5/2)와 badge 텍스트가 전부 hidden=true. 실제 노출 규칙(카운트 표시 on/off) 미확인.
4. **세로 구분선 색** — 위젯01 타일 구분선·위젯08 메타 구분선의 정확한 Variable은 line node라 design_context 미노출. `color/line/gray/*` 계열로 추정되나 정확 토큰 미확정.
5. **스켈레톤 vs 실콘텐츠** — 리스트/타일 값 대부분이 `gray-dark/300` 스켈레톤 막대. 실제 데이터 텍스트 스타일은 메타행/라벨로만 확인 가능(제목 줄의 실제 스타일은 일부 미확인).
6. **Divider(hidden) 노드** — 위젯01 2x2에 `Divider`(hidden=true) 노드들 존재, 용도 미확인.
