# D-09(time-picker) · D-19(form) 정본 현황 — 판독 사실만

> 📖 source-reader 판독. 판정·개선안 없음. 확인 방법: 아래 각 표에 A(렌더)/B(추적) 명시.

## 확인 방법 요약
- **B(추적)**: `plugins/figma-vars-installer/src/build-components.ts` 의 컴포넌트 생성 함수(`buildTimePicker` 등)를 끝까지 읽어 상태·변형 구조를 재구성. 이 파일은 Figma 노드를 만드는 TS 코드이므로 "소스"이자 "생성 로직" — 실제 렌더가 아니라 로직 추적.
- **B(추적, 웹)**: `ui-library/src/components/time-picker/time-picker.css` + `time-picker.js` 전체를 읽어 상태 클래스·속성 셀렉터 대조.
- 실제 브라우저 렌더 스크린샷(A)은 이번 판독에서 뜨지 않았음 — 아래 "미확인"에 명시.

## 판독 대상
- `plugins/figma-vars-installer/src/build-components.ts` (2710-2930행, 4832-4980행대, 7159-7161행)
- `registry/components/time-picker.json`
- `ui-library/src/components/time-picker/{time-picker.css,time-picker.js,manifest.json}`
- `pages/components.html` (1156-1217행, 2518행, 4162-4215행)
- `assets/js/ui-library-guide.js` (146행, 2355-2560행대, 2934행, 3173행, 3188행, 3319행)
- `registry/governance/legacy-component-map.json` (2436-2530행, 3155-3170행, 3733-3800행대 decisions)
- `reports/legacy-crosswalk-board/{crosswalk.json,board-manifest.json,board.html,board.template.html}`
- `registry/components/index.json` (30-45행)

---

## (1) 시간 선택(time-picker) 정본 현황

### 1-A. 정본(build-components.ts)에 존재하는 컴포넌트/세트

| 세트 | 빌드 함수 | 출처(파일:줄) |
|---|---|---|
| Time Picker (트리거) | `buildTimePicker` | build-components.ts:2711 |
| Time Picker Dropdown (패널) | `buildTimePickerDropdown` | build-components.ts:2844 |
| Time Picker Cell (칸) | `buildTimePickerCell` | build-components.ts:2804 |
| Time Picker Mobile Bottom Sheet (휠 바텀시트) | `buildTimePickerMobileBottomSheet` | build-components.ts:4836 |

레지스트리 등록 순서(설치기 노출 순): `"Time Picker"`, `"Time Picker Dropdown"`, `"Time Picker Mobile Bottom Sheet"` — build-components.ts:7159-7161. (Time Picker Cell 은 Dropdown 이 내부에서 호출해 별도 세트로 만듦, build-components.ts:6948 주석.)

### 1-B. 변형 축·값 (층별)

**Time Picker(트리거)** — build-components.ts:2711-2779
| 축 | 값 | 출처 |
|---|---|---|
| Size×Break | XXSM/PC(h28,font12) · XSM/PC(h34,font14) · MD/PC(h44,font14) · MD/Mobile(h48,font14) | :2723-2727 |
| State | Default, Hover, Focus, Filled, Disabled (5개) | :2713-2719 |
| Type | 24h, 12h | :2730-2733 |
| 조합 총 개수 | 4 sizes × 5 states × 2 types = 40 컴포넌트 | :2735-2769 루프 구조로 확인 |

**Time Picker Cell(칸)** — build-components.ts:2804-2833
| 축 | 값 | 출처 |
|---|---|---|
| State | Default, Hover, Selected (3개) | :2807-2811 |
| 크기 | 44×32 고정(TPC_W/TPC_H) | :2803 |

**Time Picker Dropdown(패널)** — build-components.ts:2844- (2단계 컬럼 조립, Cell 인스턴스 재사용)
| 축 | 값 | 출처 |
|---|---|---|
| Type | 24h(시·분 2컬럼) / 12h(오전오후·시·분 3컬럼) | :2834, :2838 |
| 패널 폭 | 24h=121 / 12h=194 (고정) | :2839-2840 |

**Time Picker Mobile Bottom Sheet(휠)** — build-components.ts:4836-
| 축 | 값 | 출처 |
|---|---|---|
| Content | TimeOnly("시간 선택") / DateTime("시작 일시") | :4833, :4952(buildVariant content 매개변수) |
| 시트 폭 | 360 | :4838 |
| 휠 열 | ampm(56) / hour(40) / colon(8) / minute(40) | :4862 |

### 1-C. 트리거 상태 값과 시각 차이(토큰 이름)

| 상태 | 배경 | 테두리 | 텍스트색 | 아이콘 | 출처 |
|---|---|---|---|---|---|
| Default | `bg/default` | `border/default` | `text/placeholder` | `icon/default` | :2713 |
| Hover | `bg/hover` | `border/default` | `text/placeholder` | `icon/hover` | :2714 |
| Focus | `bg/default` | `border/selected` | `text/placeholder` | `icon/selected` | :2715 |
| Filled | `bg/default` | `border/default` | `text/default` | `icon/default` | :2716 |
| Disabled | `bg/disabled` | `border/disabled` | `text/disabled` | `icon/disabled` | :2717 |

(전부 `color/form-control/*` 접두, semantic 재사용 — registry/components/time-picker.json "notes" 1번째 항목과 일치)

**주의**: `registry/components/time-picker.json` 의 `"states"` 필드(파일 내 "states": ["default","focus","filled","disabled"])는 **Hover 를 누락**하고 있다 — 정본 build-components.ts 에는 Hover 상태가 있음(위 표). registry 값 필드는 이 프로젝트 규칙상 "손편집 사본이라 믿지 않는다"(CLAUDE.md 명시) 범주에 해당하는 불일치 사례.

### 1-D. "값이 채워진 상태" — 별도 상태인가, default/focus 안에서 내용만 다른가

**별도 상태로 존재한다.** 확인 방법 B(추적), 두 층에서 확인:

1. **Figma 정본(build-components.ts)**: `states` 배열에 `"Filled"` 가 `"Default"`/`"Focus"`와 별개 항목으로 있고, 배경/테두리/텍스트색 토큰 조합이 Default 와 다르다(위 1-C 표 참조. Filled 는 text 색만 `text/default`로 바뀌고 나머지는 Default 와 같음 — 완전히 다른 팔레트는 아니지만 **별도 variant 이름**을 가진 독립 셀). 출처: build-components.ts:2716.
2. **웹 배포본(ui-library/src/components/time-picker/time-picker.css)**: `[data-s1-part="trigger"][data-filled="true"]` 라는 **전용 속성 셀렉터**가 존재하고(117-121행), `:hover` 규칙에서도 `:not([data-filled="true"])` 로 명시 제외한다(94-97행). `[aria-expanded="true"]`(Focus/열림) 규칙과도 별개 블록(123-129행)이다. 즉 웹 쪽도 Filled 를 Default/Focus 와 구분되는 독립 상태 플래그로 다룬다.

### 1-E. 웹 배포본(ui-library) 상태·옵션이 Figma 정본과 같은가

| 항목 | Figma 정본 | 웹 배포본 | 출처 |
|---|---|---|---|
| 트리거 상태 5종(Default/Hover/Focus/Filled/Disabled) | 있음 | 있음(`:hover`, `[data-filled]`, `[aria-expanded]`, `:disabled` 로 대응) | build-components.ts:2713-2719 / time-picker.css:94-133 |
| Type(24h/12h) | 있음 | 있음 (`data-type="12h"|"24h"`) | build-components.ts:2730 / time-picker.js:39,134 |
| Size(xxsm/xsm/md) × Break(pc/mobile) | 있음 | 있음(`[data-size]`,`[data-break]`) | build-components.ts:2723 / time-picker.css:31-63 / manifest.json (sizes:["xxsm","xsm","md"], breaks.pc/mobile) |
| Mobile Bottom Sheet(휠) | 있음(TimeOnly/DateTime) | `data-mobile-ui="wheel"` 로 안내 페이지 샘플에 존재(assets/js/ui-library-guide.js:2413,2458) — ui-library/src 쪽 wheel 전용 파일은 이번 판독 범위에서 별도 확인 못함(아래 미확인) |

두 층은 **일치**한다(트리거·타입·사이즈 축 기준). Mobile Bottom Sheet 의 ui-library/src 구현 파일 존재 여부는 미확인(아래 참조).

### 1-F. `pages/components.html` 의 "TimePicker Select"(시·분 화살표 필드) — 지금도 화면에 있는가

**없다 (죽은 코드로 파일에만 남아 있음).** 확인 방법 B(추적):

- `pages/components.html:2518` 의 `<section id="time-picker" ...></section>` 는 **빈 태그**이고, 바로 위 주석(:2517) `"Approved Time Picker guide: ui-library-guide.js renders from ui-library/dist"` — 실제 내용은 런타임에 `assets/js/ui-library-guide.js` 가 채운다.
- `assets/js/ui-library-guide.js` 의 time-picker 렌더 함수(2413·2421·2458행)는 `data-s1-component="time-picker"` 트리거+`data-mobile-ui="wheel"` 바텀시트만 만든다. "시·분 화살표 필드"(Select 형)를 만드는 코드는 없다.
- `pages/components.html` 안에 손관리 CSS(`.s1-timepicker-select-*`, 1156-1217행)와 JS(`data-tp-select-group` 바인딩 로직, 4162-4215행)가 **파일에는 남아있지만**, 그 셀렉터가 걸리는 HTML 마크업(`class="s1-timepicker-select-*"` 또는 `data-tp-select-group` 속성을 가진 엘리먼트)이 파일 전체에 **단 한 곳도 없다** (grep 결과 0건). 즉 CSS/JS 코드는 있으나 이를 사용하는 마크업이 없어 화면에 그려지지 않는다.

**정본/배포본에는 없는 게 맞는가**: 맞다. build-components.ts 의 4개 Time Picker 계열 세트(1-A) 중 "Select"(시·분 개별 화살표 스핀 필드) 형태는 없다. `registry/components/time-picker.json` 의 `variants.input.state` 에도 `filled`/`focus`/`default`/`disabled` 뿐, Select 형 트리거는 없다.

---

## (2) 폼 묶음(form) 정본 현황

### 2-A. `form` 이라는 컴포넌트가 있는가

**없다.** 근거:
- `plugins/figma-vars-installer/src/build-components.ts` 전체에서 `form`을 컴포넌트 세트로 빌드하는 함수 없음(grep 결과 "Time Picker" 관련만 매칭, `buildForm` 류 함수 부재 — grep으로 "form" 단독 함수명 없음 확인).
- `registry/components/` 폴더에 `form.json` 파일 없음(폴더 리스트에 없음).
- `ui-library/src/components/` 아래 `form` 이름의 컴포넌트 디렉터리 없음(find 결과 0건).
- `registry/components/index.json` 30-45행의 `"form"` 은 **카테고리 id**(label: "Form")이지 컴포넌트가 아니다 — Input·Select 등 개별 컴포넌트들의 `"category": "form"` 분류값으로 쓰인다(index.json:145,155,170,185,199,239 각 컴포넌트 항목의 category 필드).

### 2-B. 라벨+입력을 줄로 묶는 것을 지금은 무엇으로 하고 있나

이번 판독 범위(위 판독 대상 파일들)에서 `form-row`/`form-field`/`.form-group` 류의 전용 클래스나 레이아웃 유틸을 **찾지 못했다**(`pages/components.html`, `assets/css/*.css` 대상 grep 0건 — 단, ui-library 전체 CSS 파일을 개별 컴포넌트 단위로 전수 조사하지는 않음, 아래 미확인 참조). `time-picker.json`/`date-picker` 등 개별 컴포넌트 JSON 의 `anatomy`/`usage` 필드에도 "폼 묶음" 레이아웃 규칙은 없음(time-picker.json anatomy 필드는 "트리거/필드"·"드롭다운 패널"만, 위 1번 인용 참조).

### 2-C. `registry/**` 에 form 관련 패턴 선언이 있는가

`registry/components/index.json` 의 카테고리 목록에 `"form"` id 가 있고(30-45행 부근), 폼 성격 컴포넌트(Input, Select, Checkbox 등)가 이 카테고리로 분류돼 있을 뿐, **"form" 자체를 패턴으로 선언한 별도 registry 파일은 없다**(`registry/patterns/` 같은 폴더 자체가 존재하지 않음 — 이번 판독에서 `registry/` 하위 폴더 목록 확인, form 전용 패턴 파일 미발견).

### 2-D. D-03 선례(input+button = 패턴) — 어디에 어떤 형태로 기록돼 있나, form 도 같은 방식이면 어디에 무엇을 적나

**기록 위치**: `reports/legacy-crosswalk-board/crosswalk.json` 의 `items` 배열, `id: "D-03"` 항목(42-52행 부근).

```
"id": "D-03", "분류": "대응 확정", "kind": "mapping",
"무엇": "입력창+버튼 조합", "컴포넌트": "input",
"레거시": "A 입력창+버튼 결합 컴포넌트",
"정본": "컴포넌트 아님 — input + button 을 나란히 놓는 패턴",
"quote": "input + button 조합 — 컴포넌트가 아니라 패턴",
"by": "river", "date": "2026-09-04"
```

이 항목의 `"분류"` 값은 `"대응 확정"`(river 확인·기록됨)이다. **같은 방식으로 form 을 처리한다면**, 같은 파일(`crosswalk.json`)의 `items` 배열에 `"id": "D-19"`, `"분류": "대응 확정"`, `"정본": "컴포넌트 아님 — ..."` 형태로 river 의 quote·date 를 채워 넣는 자리다.

**단, D-19 는 아직 그 상태가 아니다.** 같은 `crosswalk.json` 안 D-19 항목(현재 실제 값):
```
"id": "D-19", "분류": "아직 미결", "kind": "open",
"무엇": "폼 묶음(form)", "컴포넌트": "-",
"레거시": "B form_elements", "정본": "미정",
"quote": "패턴으로 볼지 컴포넌트로 볼지 모호해서 논의 필요",
"by": "river", "date": "2026-09-04",
"note": "river: 패턴으로 볼지 컴포넌트로 볼지 모호해서 논의 필요. 아직 결정되지 않았다."
```

즉 D-19 는 river 본인이 이미 "모호해서 논의 필요"라고 자기 quote 로 남긴, **열려 있는** 항목이다.

### 참고: D-09(time-picker)도 같은 board 파일에 미결 상태로 있음

```
"id": "D-09", "분류": "아직 미결", "kind": "open",
"무엇": "시간 선택의 selected · editing", "컴포넌트": "time-picker",
"레거시": "A 시간 선택 7세트 — 최하위 드롭다운까지 한 세트",
"정본": "Time Picker(트리거) · Time Picker Dropdown(목록 패널) · Time Picker Cell(칸) · Time Picker Mobile Bottom Sheet — 층이 나뉘어 있음",
"확인": "⭐ 2026-09-04 레거시 6세트의 화면·변형축과 정본 층 구조를 대조해 카드를 다시 짰다. 레거시 timepicker_select(셀렉트형 트리거)는 정본에 대응이 없다.",
"남은것": "①트리거의 selected·completed 가 정본의 무엇인지 ②셀렉트형 트리거를 정본에 넣을지 — river 결정 대기."
```

이 항목이 이미 "레거시 timepicker_select 는 정본에 대응이 없다"를 명시하고 있어, 1-F 판독 결과(TimePicker Select 는 죽은 코드)와 일치한다.

**참고 — `board.html`/`board.template.html` 과의 불일치**: `reports/legacy-crosswalk-board/board.html:583` 및 `board.template.html:539` 는 D-03 배지를 `"미결정"`으로 표시하고 있다. 이는 `crosswalk.json`(D-03 = "대응 확정")과 다른 값이다 — board.html/template 이 crosswalk.json 갱신 이후 재생성되지 않았을 가능성이 있으나, 이번 판독은 사실만 확인했고 원인은 미확인.

---

## 미확인

- **실제 브라우저 렌더(A)**: 이번 판독은 전부 B(소스/CSS/JS 추적)로 확인했고, `pages/components.html` 의 time-picker 섹션·Mobile Bottom Sheet 를 headless 스크린샷으로 뜨지 않았다. 시각적 최종 배치(예: Focus 시 드롭다운이 트리거 바로 아래 붙는지, 겹치는지)는 코드 구조(컴포넌트를 VERTICAL 레이아웃으로 감싸 트리거+드롭다운을 붙임, build-components.ts:2760 부근 주석)로만 추정 가능하고 렌더 확인은 안 했다.
- **ui-library/src 쪽 Mobile Bottom Sheet(휠) 전용 구현 파일**: `time-picker.example.html`/`time-picker.mobile.example.html`/`time-picker.js`/`time-picker.css` 4개 파일 존재는 확인했으나, 휠 바텀시트 마크업이 이 파일들 중 어디에 얼마나 구현돼 있는지(예: fade 마스크·4열 구조가 CSS/JS에 실제로 있는지)는 이번 판독에서 라인 단위로 확인하지 않았다.
- **`assets/css/*.css` 외 ui-library 전체 CSS 파일**의 form-row 류 유틸 존재 여부: `pages/components.html`·`assets/css/*.css`만 grep 했고, `ui-library/src/components/**/*.css` 전 파일을 "form row/field" 키워드로 전수 조사하지는 않았다.
- **board.html과 crosswalk.json의 불일치 원인**: 어느 쪽이 최신인지, 재생성 스크립트가 있는지는 확인하지 않았다.
