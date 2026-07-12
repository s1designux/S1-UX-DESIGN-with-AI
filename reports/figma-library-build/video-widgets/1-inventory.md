# figma-library-build · 영상(Video) 위젯 — 1단계 재고조사 (읽기 전용)

- **대상 파일**: SW UX GUIDE V3.0 TEST (현재 활성 파일)
- **조사 방식**: figma-local 읽기 MCP(`get_metadata` 문서 루트 덤프 + `get_variable_defs`)로 프로그램 파싱. `use_figma`(쓰기/실행)는 이 세션에서 미제공이라 사용 못 함 → 컴포넌트 **componentKey**(published key)는 읽기 툴로 조회 불가 = `미확인`(단, 같은 파일 내 빌드는 node id 인스턴싱으로 충분).
- **빌드 금지 준수**: 어떤 노드도 생성·수정하지 않음.

## 페이지(캔버스) 목록
| id | 이름 | 비고 |
|----|------|------|
| 0:2 | Internal Only Canvas | hidden |
| 80:16696 | ---공통--- | 구분자 |
| 5:5706 | **Core** | 핵심 컴포넌트 라이브러리 위치 |
| 80:16697 | Patterns PC (준비중) | |
| 173:2431 | Patterns Mobile(준비중) | |
| 302:19291 | test | 레거시 변수 사본 |
| 261:12116 | sample | 레거시 변수 사본 |
| 80:16698 | --- service --- | 구분자 |
| 80:16699 | modu app (준비중) | |
| **16:1170** | **Video (준비중)** | **빌드 타깃 — 현재 비어있음(w=0,h=0,자식 0)** |
| 80:16700 | Mobility (준비중) | |
| 80:17419 | Building Management (준비중) | |

---

## A. 토큰 Variable 존재 확인

**변수 컬렉션(variable-set) — 현행 vs 레거시**
- **현행(V2, 바인딩 대상)**: `Foundation V2`(id 8:709) · `Semantic Color V2`(id 8:963) · `Semantic Number V2`(id 8:1135). 요청 토큰의 `8:xxx` id 가 여기 속함.
- 레거시(중복 사본, 무시 권장): `Foundation`(4:109)·`semantic`(4:111)·`foundation`(4:115)·`semantic`(4:156), 그리고 test/sample 페이지 로컬 사본(261:*, 319:*, 324:*).

**네이밍 컨벤션**
- Foundation primitive 색/수치: **접두사 없음** — `gray-dark/100`, `blue-dark/350`, `radius/8`.
- Semantic 토큰: **`color/…` 접두사** — `color/text/…`, `color/icon/…`, `color/line/…`.

| 요청한 이름 | 실제 파일 표기 | 존재 | 컬렉션 | variable id(현행) |
|------------|---------------|------|--------|-------------------|
| gray-dark/100 | `gray-dark/100` | ✅ | Foundation V2 | 8:729 |
| gray-dark/300 | `gray-dark/300` | ✅ | Foundation V2 | 8:731 |
| gray-dark/50 | `gray-dark/50` | ✅ | Foundation V2 | 8:728 |
| line/gray/subtle | `color/line/gray/subtle` | ✅ | Semantic Color V2 | 8:1076 |
| line/gray/default | `color/line/gray/default` | ❌ **없음** | — | — |
| line/gray/strong | `color/line/gray/strong` | ❌ **없음** | — | — |
| text/title/primary | `color/text/title/primary` | ✅ | Semantic Color V2 | 8:1127 |
| text/body/primary | `color/text/body/primary` | ✅ | Semantic Color V2 | 8:1116 |
| text/body/secondary | `color/text/body/secondary` | ✅ | Semantic Color V2 | 8:1117 |
| text/body/tertiary | `color/text/body/tertiary` | ✅ | Semantic Color V2 | 8:1118 |
| icon/gray | `color/icon/gray` | ✅ | Semantic Color V2 | 8:1068 |
| icon/gray-dark | `color/icon/gray-dark` | ✅ | Semantic Color V2 | 8:1069 |
| blue-dark/350 | `blue-dark/350` | ✅ | Foundation V2 | 8:754 |
| green-dark/350 | `green-dark/350` | ✅ | Foundation V2 | 8:834 |
| red-dark/350 | `red-dark/350` | ✅ | Foundation V2 | 8:774 |
| radius/8 | `radius/8` | ✅ | Foundation V2 | 8:943 |

**line(구분선) 관련 실제 보유 토큰**: `color/line/gray/subtle`, `color/line/blue` — **이 2개뿐**. `default`/`strong` 단계 없음.
**radius 보유**: `radius/0·2·4·6·8·10·12·16·20·full` + semantic alias `radius/button·card·control·modal`.

> ⚠️ 두 갈래(정확 대조 대상): 위 "요청 이름" 중 semantic 것은 요청서가 `color/` 접두사를 뺀 축약형으로 표기됨 — 실제 바인딩 시 반드시 `color/…` 전체 경로로 참조해야 함.

---

## B. 아이콘 라이브러리

- **네이밍 컨벤션**: `ic_한글이름` (예 `ic_새로고침`, `ic_닫기`, `ic_홈`). 각 아이콘은 **컴포넌트 세트**(variant 축 `Property 1=Line/Color/Solid` 또는 `Type=…`)로 구성.
- 파일 전체 아이콘 세트 16종만 존재(전용 아이콘 페이지 아님, 소량).

| 요청 아이콘 | 파일 내 존재 | 노드 | 비고 |
|------------|-------------|------|------|
| ic_새로고침 (새로고침) | ✅ 있음 | 세트 155:11312 / 변형 `Property 1=Line`=155:11313, `Color`=155:11314, `Solid`=155:11315 | Widget Header 용 확보 |
| ic_다운로드 | ❌ **없음** | — | 파일에 없음 |
| ic_더하기 (plus/add) | ❌ **없음** | — | 파일에 없음 |

- componentKey(published key)는 읽기 툴로 조회 불가 = **미확인**. 단 **같은 파일 내 빌드**라 `importComponentByKeyAsync` 불필요 — 세트 노드 155:11312에서 `Property 1=Line`(155:11313) 변형을 직접 인스턴스하면 됨.
- 존재하는 다른 아이콘: ic_계정/사용자/ID · ic_날짜/근태,달력 · ic_닫기 · ic_마지막장 · ic_메뉴 · ic_비밀번호미표시 · ic_시간,시계 · ic_이전 · ic_인터넷 · ic_잠김 · ic_찾기/조회 · ic_홈 · ic_화살표,더보기(+다음장) · ic_확인.

---

## C. Core 컴포넌트 현황 (페이지 Core 5:5706)

각 컴포넌트 = 라이브러리 컴포넌트 세트 1개 + `— Spec Dark` 동반 프레임 1개. 대표 목록:

| 컴포넌트 | 세트 node id | 컴포넌트 | 세트 node id |
|----------|-------------|----------|-------------|
| Button | 956:19163 | Checkbox | 956:19347 |
| Radio | 956:19401 | Toggle | 956:19456 |
| Multi Toggle | 956:19674 | Chip | 956:19932 |
| Line Tab | 956:18573 | Line Tab Set | 956:18684 |
| Dropdown | 956:19844 | Dropdown List | 956:19755 |
| Input | 958:21619 | Search Input | 958:23398 |
| Text Area | 958:23503 | Select Box | 958:23707 |
| Pagination | 956:18940 | Table | 958:27891 |
| Calendar | 958:24196 | Date Picker | 958:25013 |
| Time Picker | 958:26994 | Filter Chip | 958:29196 |
| Bottom Sheet | 958:28550 | Mobile Bottom Nav | 956:18518 |
| GNB / NavBar / Footer / StatusBar 등 셸 | (Navigation 섹션) | | |

- **componentKey**: 미확인(읽기 툴 한계). 같은 파일 빌드라 node id 인스턴싱으로 충분.
- 배치: Core 페이지는 **Section**으로 묶임 — Platform, Navigation, Line Tab, Pagination, Actions, Selection, Dropdown, Chip, Form Control, Date Picker, Time Picker, Table, Bottom Sheet, Filter Chip (좌→우 x 밴드).

---

## D. 네이밍 / 구조 컨벤션

- **컴포넌트 세트 이름**: **슬래시 폴더 없이 평문** — "Button", "Chip", "Line Tab", "Select Box", "Input". (Core 레벨에 `폴더/이름` 슬래시 그룹핑은 안 씀. 슬래시는 아이콘 `ic_…/…` 세부명에만 등장.)
- **variant 속성 축**: PascalCase 속성명 + `=값`, 콤마 구분. 실측 예:
  - Button: `Size=MD, State=Default, Variant=Primary, Break=PC`
  - Chip: `Size=SM, State=Default, Variant=Line, Break=PC`
  - Line Tab: `Size=SM, State=Unselected, Break=PC`
  - Select Box: `Size=XXSM, State=Default, Break=PC`
  - Input: `Size=XXSM, State=Default, Label=Off, Message=Off, Break=PC`
  - Checkbox: `State=Default` (단순형)
  - 공통 축 후보: `Size`(MD/SM/XXSM) · `State`(Default/Hover/Pressed/Selected/Unselected/Open/Checked) · `Variant` · `Break`(PC)
- **`Video/…` 슬래시 네이밍 판단**: Core 는 평문이라 슬래시 폴더 관례와 **불일치**. 다만 도메인 컴포넌트를 `Video/` 폴더로 묶는 건 Figma 표준 그룹핑이라 허용 가능 — **이건 (c) 애매/결정 필요**. variant 축 스타일(PascalCase `Size=…, State=…, Break=PC`)은 반드시 기존 컨벤션을 따를 것.

---

## E. 배치 위치 (Video 페이지 16:1170)

- 현재 상태: **비어있음**(w=0, h=0, 자식 0) — 확인됨.
- 캔버스는 **독립 좌표 공간**이라 **0,0 부터 시작 가능**.
- Core 페이지 관례: Section(x=0,y=0 부터 좌→우 밴드) 안에 컴포넌트 프레임을 **x≈64, y≈140** 부터 배치.
- **제안 기준 좌표**: Video 캔버스에 Section "Video Widgets"를 **x=0, y=0** 로 만들고, 그 안에서 5개 세트를 **x=64, y=140** 부터 세로/가로 밴드로 배치(Core 관례 동일). 빈 캔버스라 겹침 위험 없음.

---

## 빌드 블로커 / 결정 필요 요약
1. **누락 토큰(정확 대조 ❌)**: `color/line/gray/default`, `color/line/gray/strong` — 없음. 구분선은 현재 `color/line/gray/subtle`(+`color/line/blue`)만 사용 가능. divider 3종이 서로 다른 강도를 요구하면 **신규 Variable 생성(Foundation alias) 또는 subtle 로 통일**을 결정해야 함.
2. **누락 아이콘**: `ic_다운로드`, `ic_더하기` 없음. 해당 아이콘을 쓰는 컴포넌트가 있으면 빌드 전 아이콘 확보/결정 필요. (Widget Header 의 `ic_새로고침`은 확보됨.)
3. **componentKey 미확인**: 읽기 툴 한계. 같은 파일 빌드면 node id 인스턴싱으로 우회 가능.
4. **`Video/` 슬래시 네이밍**: Core 평문 관례와 다름 — 도메인 폴더로 허용할지 결정.
