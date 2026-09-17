# D-09 · D-19 레거시 원본 실측 (판정 없음 — 값과 구조만)

> 조사: 🤖 figma-inspector · 2026-09-17 · MCP `get_metadata` + `get_design_context` + `get_screenshot` 직접 조회.
> 추정 없음. 못 읽은 항목은 "미확인"으로 표기.
> 스크린샷: `reports/legacy-crosswalk-board/screens/d09/`, `screens/d19/`

---

## D-09 — 시간 선택 (파일 A `yE5UCFEbmXJBlYJWB24Lz2`)

### 1) timepicker_input_component — 540:3469 (84×164)

한 자리 숫자 셀(트리거 안에 들어가는 최소 부품). 변형축 **state**: default · hover · selected.

| state | bg | border | 글자색 | 그 외 |
|---|---|---|---|---|
| default | white (`--color/dropdown/option/bg/default`) | white (`--color/dropdown/option/border/default`) | `#757575` (`--color/dropdown/option/label/default`) | 44×32, radius 4 |
| hover | `#f5f5f5` (`--color/dropdown/option/bg/hover`) | `#f5f5f5` (`--color/dropdown/option/border/hover`) | `#757575` (`--color/dropdown/option/label/hover`) | 동일 크기 |
| selected | white (`--color/dropdown/option/bg/selected`) | `#1d6ceb` (`--color/dropdown/option/border/selected`) | `#1d6ceb` (`--color/dropdown/option/label/selected`) | 테두리가 파란색으로 강조되는 것 외 배경은 흰색 그대로 |

`editing`·`completed`·`edit-completed` 이름의 상태는 **이 세트에 없음**. 있는 상태는 default·hover·selected 3개뿐.

### 2) timepicker_select_number — 540:3476 (186×199)

`timepicker_select_dropdown`(아래 3번) 안에서 실제로 쓰이는 목록 한 줄 부품. 변형축 **size**(md·sm) × **state**(default·hover·selected) = 6개.

| state | bg | border | 글자색 | md 높이/글자 | sm 높이/글자 |
|---|---|---|---|---|---|
| default | white | 없음(테두리 클래스 자체가 안 붙음) | `#757575` | 44px · 16px | 34px · 14px |
| hover | `#f5f5f5` | `#f5f5f5` (`--color/gray/50`) | `#757575` | 44px · 16px | 34px · 14px |
| selected | white | 없음 | `#1d6ceb` | 44px · 16px | 34px · 14px |

selected 상태에서 배경은 흰색 그대로이고 **글자색만 파란색**으로 바뀐다(테두리 강조 없음) — 540:3469 셀과 다른 점.
`editing`·`completed` 이름의 상태는 이 세트에도 없음.

### 3) timepicker_select_dropdown — 540:3489 (245×371)

트리거 없이 **펼친 목록판 자체**만 있는 세트. 변형축은 **size**(md·sm) 1개뿐 — state 축 없음.

- md: 폭 78px, 목록 위쪽 padding 12px, 그림자 `0px 4px 8px rgba(0,0,0,0.15)`, 테두리 `#d9d9d9` 1px, 배경 흰색(`--color/dropdown/list/bg`), radius 4.
- sm: 폭 67px, 위쪽 padding 8px, 나머지 동일.
- 목록 안 첫 줄(`00`)만 `hover` 배경(`#f5f5f5`)이 정적으로 칠해져 있고 나머지(`01`~`05`)는 전부 `default`. 즉 "펼친 상태에서 첫 항목이 하이라이트된 스냅샷"이며, 이 하이라이트에 `selected`라는 이름이 붙어 있지 않다 — 노드명 그대로 `timepicker_select_number` 인스턴스이고 state override 값이 `hover`다.
- 계층: **트리거 없이 목록 패널만** 있는 독립 세트 (트리거+목록이 한 덩어리가 아님).

### 4) pc_timepicker_input_dropdown — 540:3506 (379×415)

**시/분(24h) 또는 오전오후/시/분(12h) 세 컬럼이 나란히 든 펼침 패널** 전체. 변형축 **type**: 24h · 12h.

- 24h: 시 컬럼(0~10 스크롤, `flex-1`) + 분 컬럼(00~09, `flex-1`) 2컬럼, 세로 구분선(`#e9e9e9` 1px) 1개, 전체 min-width 121px.
- 12h: 오전/오후 컬럼(고정 48px) + 시 컬럼(48px) + 분 컬럼(48px) 3컬럼, 구분선 2개, 전체 194px.
- 하단 공통: 구분선 + "확인" 텍스트 버튼(`pc_text_button`, `component/button/label/14M`, 색 `--color/text/state/disabled #c4c4c4` — 항상 비활성 색으로 박제돼 있음. 실제 활성/비활성 토글은 이 정적 스냅샷에서 확인 불가).
- 안에 든 낱개 셀은 `timepicker_input_component`(2번)를 그대로 재사용(항상 default 상태) — 자체 state 축 없음.
- 계층: **트리거+목록이 한 덩어리**가 아니라 **목록 패널만** (트리거인 `timepicker_input`(6번)과는 별도 노드).

### 5) timepicker_select — 540:3636 (692×313) — 별종

**시/분을 각각 화살표 달린 셀렉트 박스로 표현한 트리거**(레거시가 "셀렉형"이라 부른 것). 변형축 **size**(md·sm) × **state**(default·editing·disabled) = 6개.

| state | bg | border | 글자색 | 화살표 아이콘 | 화살표 회전 |
|---|---|---|---|---|---|
| default | white (`--color/form-control/bg/default`) | `#d9d9d9` (`--color/form-control/border/default`) | `#353535` (`--color/form-control/text/default`) | 기본 아이콘(검정) | 90도(▼ 방향, 시 쪽만) |
| editing | white | `#1d6ceb` (`--color/form-control/border/selected`) | `#353535` (변화 없음) | hover 톤 아이콘으로 교체 | 시 쪽 화살표만 **-90도**(▲로 뒤집힘, 펼침 표시). 분 쪽은 90도 그대로 |
| disabled | `#f5f5f5` (`--color/form-control/bg/disabled`) | `#d9d9d9` (`--color/form-control/border/disabled`) | `#c4c4c4` (`--color/form-control/text/disabled`) | disabled 톤 아이콘 | 90도 |

- md: 높이 44px, 글자 16px, min-width 78px.
- sm: 높이 28~34px(코드상 h-28 표기지만 metadata 실측 28/44 — 아래 참고), 글자 14px.
- **caret/커서 표시 없음** — 텍스트 입력 필드가 아니라 "숫자+화살표" 버튼형 셀렉트라 입력 캐럿 개념 자체가 없다.
- "시" 필드와 "분" 필드가 **각각 독립된 화살표 트리거**로 나뉘어 있다(레거시 카드 설명과 일치).
- `selected`·`completed`·`edit-completed` 이름의 상태는 이 세트에 없음 — 있는 이름은 default·editing·disabled뿐.
- 계층: **트리거만**(시 트리거 + 분 트리거 2개가 나란한 조합), 펼친 목록은 이 세트에 없음 — 목록은 3)·4)가 별도로 맡는다.

### 6) timepicker_input — 540:3690 (1175×694)

**단일 텍스트 입력형 트리거**("시간을 선택하세요" placeholder + 알람 아이콘). 변형축 **platform**(mobile·pc-md·pc-xsm·pc-xxsm) × **state**(default·completed·selected·disabled) = 16개.

실측(state=default 기준, 대표로 pc-md 540:3691 / selected 540:3709 / completed 540:3697 확인):

| state | bg | border | 글자 내용 | 글자색 |
|---|---|---|---|---|
| default | white | `#d9d9d9`(`--color/form-control/border/default`) | "시간을 선택하세요" (placeholder 문구 그대로) | `#757575`(`--color/form-control/text/placeholder`) |
| selected | white(배경 불변) | `#1d6ceb`(`--color/form-control/border/selected`) | "시간을 선택하세요" (동일 문구) | `#757575`(placeholder 색 그대로 — default와 글자색 동일) |
| completed | white | `#d9d9d9`(default와 동일 — completed 전용 테두리 색 없음) | **"시간을 선택하세요"**(실제 선택된 시간 값이 아니라 placeholder 문구 그대로 박혀 있음) | `#353535`(`--color/form-control/text/default` — default/selected보다 진한 본문색으로 바뀜) |

- selected와 default의 유일한 차이는 **테두리 색**(파랑 vs 회색), 배경·글자·아이콘은 동일.
- completed와 default의 차이는 **글자색만**(진한 회색 vs 옅은 회색) — 테두리는 그대로 `#d9d9d9`. **캐럿(커서) 표시 없음.**
- 플랫폼별 높이: mobile 48 · pc-md 44 · pc-xsm 34 · pc-xxsm 28 (폭은 4개 다 190px 고정 스와치, 실제 사용 시 가변 추정 — 이 프레임 자체에서 폭 가변 여부는 확인 불가).
- disabled 상태는 이번 조사에서 design_context로 직접 열어보지 않음(스크린샷상 회색 톤으로 보이나 hex 값 미확인) → **미확인**.
- 계층: **트리거만**(펼침 목록 없음) — 목록(3·4번)과 완전히 분리된 별도 세트.

### 시간 선택 세트 간 계층 요약

```
timepicker_input (6)          ─ 텍스트 입력형 트리거만
timepicker_select (5)         ─ 화살표 셀렉트형 트리거만 (시·분 2개 조합, 별종)
pc_timepicker_input_dropdown (4) ─ 트리거 없는 펼침 목록 패널 (24h/12h)
timepicker_select_dropdown (3)   ─ 트리거 없는 펼침 목록 패널 (md/sm, 열 1개)
timepicker_select_number (2)     ─ 목록 안 낱개 줄 부품 (3·4가 재사용)
timepicker_input_component (1)   ─ 목록 안 낱개 숫자 셀 부품 (4가 재사용)
```

트리거 3종(1·5·6 각각 다른 모양) + 목록 패널 2종(3·4) + 부품 2종(1·2)이 전부 **별개 노드**로 존재하고, "트리거+펼친 목록이 하나의 인스턴스"로 합쳐진 세트는 이 6개 중에 없다.

스크린샷: `screens/d09/540-3469_*.png` · `540-3476_*.png` · `540-3489_*.png` · `540-3506_*.png` · `540-3636_*.png` · `540-3690_*.png`

---

## D-19 — 폼 묶음 (파일 B `vHg5UOMMYI77RHH6vVVppu`)

### form_elements — 78:5977 (1732×858, 변형 16개)

변형축 6개(get_metadata 실측): **option**(default·editing·edit-completed·disabled·off) × **button**(on·off) × **combo box**(off·single combo·double combo) × **radio button**(on·off) × **calendar**(on·off) × **text box**(on·off). 16개 조합 전부가 이 여섯 축의 부분집합 조합이며, 축이 전부 직교하지 않고 조합마다 다른 자식이 켜진다(아래 표).

| # | option | button | combo box | radio | calendar | text box | 실제로 담긴 것 |
|---|---|---|---|---|---|---|---|
| 78:5976 | default | off | off | off | off | off | 라벨 + Input box(placeholder) |
| 78:7123 | off | off | off | off | off | on | 라벨 + 텍스트박스(80px 높이, placeholder 이미지) |
| 78:5975 | default | on | off | off | off | off | 라벨 + Input box (button=on이지만 이 조합의 실제 코드 디프 미확인 — 78:5976과 동일 자식일 가능성, 재확인 필요) |
| 78:5970 | edit-completed | on | off | off | off | off | 미확인(코드 미조회) |
| 78:5973 | editing | off | off | off | off | off | 미확인(코드 미조회, 라벨+Input box로 추정되나 실측 아님) |
| 78:5972 | editing | on | off | off | off | off | 미확인 |
| 78:5969 | edit-completed | off | off | off | off | off | 미확인 |
| 78:5967 | disabled | off | off | off | off | off | 미확인 |
| 78:5968 | disabled | on | off | off | off | off | 미확인 |
| 78:5974 | default | off | single combo | off | off | off | 미확인(닫힌 콤보로 추정, 실측 아님) |
| 78:5971 | off | off | double combo | off | off | off | 미확인 |
| 78:5965 | editing | off | single combo | off | off | off | 라벨 + **펼쳐진 콤보박스**(입력창+화살표+옵션 3줄 드롭다운) — 이 조합만 세로 160.5px로 커짐 |
| 78:5964 | edit-completed | off | single combo | off | off | off | 미확인 |
| 78:5963 | disabled | off | single combo | off | off | off | 미확인 |
| 78:5962 | off | off | off | on | off | off | 라벨 + 라디오 버튼 2개("선택1"/"선택2") |
| 78:5960 | off | off | off | off | on | off | 라벨 + 달력 입력창 2개(기간, "~"로 연결) |

**16개 중 6개만 실제로 get_design_context 로 코드/색을 확인했다** (78:5976·78:7123·78:5965·78:5962·78:5960 + form_label 78:5137). 나머지 10개(editing 단독·edit-completed·disabled·button=on 조합·combo 닫힌 상태·double combo)는 이번 조사에서 **미확인** — 이름과 좌표만 metadata로 확인됨. 두 갈래 분류 이전에, 판정에 필요한 나머지 조합의 실측이 더 필요하면 추가 조사 요청 바람.

### 실측된 조합의 상세

**baseline (78:5976, default·off·off·off·off·off):**
- 라벨: `flex-1`(가변, 나머지 폭 전부) — 이 조합만 라벨이 고정폭이 아니라 가변.
- 입력창(Input box): 고정 243px, 높이 34px, bg 흰색, border `#dcdcdc` 1px, radius 2px, placeholder 색 `#c4c4c4`, 글자 14px.
- 라벨-입력창 간격: 8px (`gap-[8px]`).
- 전체 프레임: 381×48 (라벨 높이 48이 행 전체 높이를 결정, 입력창은 34px로 안에서 수직 중앙).

**text box=on (78:7123):**
- 라벨 폭 고정 130px, 입력창(텍스트박스) `flex-1`(가변).
- 텍스트박스 높이 80px, 프레임 전체 866×96 (라벨도 96으로 커짐).
- 안의 텍스트는 이미지(placeholder 텍스트를 래스터 이미지로 박아둠 — 실제 텍스트 노드 아님, 미리보기용 스냅샷 추정).

**single combo · editing (78:5965):**
- 라벨 폭 고정 130px.
- 입력창(파란 테두리 `#1d6ceb`, bg 흰색, radius 2px)에 "선택" 텍스트 + 화살표 아이콘.
- 그 아래 펼쳐진 옵션 패널: bg 흰색, border `#dcdcdc`, 옵션 3줄 — "선택 항목 1"(흰 배경, `#646464`) · "선택 항목 2"(회색 배경 `#fafafa`, `#646464` — hover로 보이는 톤) · "선택 항목 3"(흰 배경, 파란 글자 `#1d6ceb` — 선택된 항목으로 보이는 톤).
- 전체 프레임 381×160.5 — 다른 조합보다 세로로 김(펼친 목록 때문).

**radio button=on (78:5962):**
- 라벨-라디오 그룹 간격 **16px**(다른 조합의 8px과 다름).
- 라디오 버튼 2개, 각 버튼 안 아이콘(18×18)+텍스트 간격 6px, 버튼 사이 간격 25px.
- 글자색 `#353535`, 14px.

**calendar=on (78:5960):**
- 라벨 폭 130px, 라벨-달력그룹 간격 8px.
- 달력 입력창 2개(각 `flex-1`, 높이 34px, bg 흰색, border `#dcdcdc`), 사이에 "~" 텍스트(`#646464`, Medium 14px), 두 입력창 간격 4px.
- 각 입력창 안 날짜 텍스트("2022.03.20", `#353535` 14px) + 달력 아이콘.

### form_label — 78:5137 (330×88, 변형 2개)

변형축 **`*`**(단일 boolean 축, 이름이 `*`): `off`(필수 아님) · `on`(필수 표시).
- 둘 다 130×48 크기의 **래스터 이미지**(SVG를 이미지로 export) — 실제 텍스트 레이어가 아니라 통짜 그림. 텍스트 내용·색을 코드로 읽을 수 없음(get_design_context가 이미지 URL만 반환).
- 화면상 차이: `on`은 텍스트 앞에 빨간 `*` 표시, `off`는 표시 없음. 정확한 hex·폰트는 이미지 안에 있어 **미확인**(레이어 트리 상에서 텍스트 노드로 존재하지 않음).

스크린샷: `screens/d19/78-5977_form_elements.png` (16개 변형 전체 배치) · `screens/d19/78-5137_form_label.png` (라벨 on/off 2종)

---

## 미확인 목록 (추측하지 않은 부분)

- D-09: `timepicker_input`(540:3690)의 disabled 상태 hex, mobile/pc-xsm/pc-xxsm 각 플랫폼별 selected·completed hex(설계 패턴상 pc-md와 동일할 가능성이 높으나 개별 확인 안 함), pc_timepicker_input_dropdown 하단 "확인" 버튼의 실제 활성 상태 색(스냅샷은 항상 비활성 색으로 박제).
- D-19: form_elements 16개 중 10개 조합(78:5975·78:5970·78:5973·78:5972·78:5969·78:5967·78:5968·78:5974·78:5971·78:5964·78:5963)의 실제 자식 구성·색·수치 — metadata의 이름과 좌표만 확인, get_design_context 미조회.
