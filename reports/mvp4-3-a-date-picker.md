# MVP4.3-A — DatePicker Component Candidate

**Status:** Draft
**Date:** 2026-05-12

---

## Scope

DatePicker를 Input의 state/variant로 포함하지 않고 별도 컴포넌트 후보로 정리한다.
Figma MCP로 실제 구조를 확인하고, interactive preview를 구현한다.

---

## Step 1 — Figma Inspection

- 조회 파일: `yE5UCFEbmXJBlYJWB24Lz2` (SW UX GUIDE V2.4)
- 조회 노드: `6443:4655` (input.json relatedComponents.datepicker-input에서 확인)
- MCP 결과: **get_design_context 호출 시 `invalid node ID` 오류 발생**
  - 오류 내용: "The node ID provided was invalid. Please ensure the node ID was extracted correctly from the URL."
  - 가능한 원인: frame-in-component-set / 아카이브된 프레임 / 파일 내 직접 접근 불가 구조
  - 대응: Figma URL 직접 접근 또는 Plugin을 통해 재확인 필요

### Figma에서 확인된 사항 (input.json 기준)
- Node ID: `6443:4655` — input.json relatedComponents에 `"datepicker-input": "Picker 계열. MVP5 이후 구현. figmaNodeId: 6443:4655"` 명시
- 관련 섹션: Section 2 (6443:5451) — Base Input과 동일 섹션으로 추정
- 별도 figma-map.json 매핑: 신규 추가됨 (`datePicker` 키)

### figma-unconfirmed 항목 목록
| 항목 | 상태 | 비고 |
|---|---|---|
| componentSetKey | figma-unconfirmed | MCP 접근 불가 |
| trigger height / padding | figma-unconfirmed | Base Input 값 추정 사용 |
| calendar icon Figma 노드명 | figma-unconfirmed | candidate SVG 사용 중 |
| calendar panel 구조 | figma-unconfirmed | 일반 datepicker 패턴으로 추정 구현 |
| day grid 상태 시각 | figma-unconfirmed | token candidate 사용 |
| PC / Mobile 차이 | figma-unconfirmed | PC popover만 구현 |

---

## Step 2 — Existing File Audit

- 기존 DatePicker 관련 파일: 없음 (find 검색 결과: 해당 없음)
- input.json `relatedComponents`에 `"datepicker-input"` 항목만 존재
- input.json `separateComponentCandidates`에 `"DatePicker"` 명시됨
- 재사용 가능 구조: `s1-input-wrap`, `s1-input-field`, `s1-input-action-btn` (Base Input CSS)

---

## DatePicker Standard

**Base:** Input trigger (s1-input-wrap + s1-input-field)

**Composition:**
- Input trigger (`s1-input-wrap` + `s1-input-field`)
- suffixIcon: calendar (`s1-input-action-btn`)
- calendarPanel (`.s1-date-picker__panel`, absolute, hidden by default)
- calendarHeader: prevMonth | YYYY.MM | nextMonth
- weekdayRow: 일 월 화 수 목 금 토
- dayGrid: 6×7 (42 cells)

**Trigger States:** default / focus / filled / disabled / error / opened

**Day Cell States:** default / hover / today / selected / disabled-date / other-month

**PC:** popover panel (absolute positioned below trigger)
**Mobile:** pending — figma-unconfirmed (bottom sheet 가능성)

---

## Token Policy

| 토큰 | 출처 | 상태 |
|---|---|---|
| --input-default-bg | Base Input 재사용 | stable |
| --input-default-border | Base Input 재사용 | stable |
| --input-focus-border | Base Input 재사용 | stable |
| --input-disabled-bg | Base Input 재사용 | stable |
| --input-error-border | Base Input 재사용 | stable |
| --input-placeholder-text | Base Input 재사용 | stable |
| --date-picker-panel-bg | candidate: var(--color-surface-default) | candidate |
| --date-picker-panel-border | candidate: var(--color-border-default) | candidate |
| --date-picker-cell-selected-bg | candidate: var(--color-action-primary-default) | candidate |
| --date-picker-cell-today-border | candidate: var(--color-border-focus) | candidate |
| --date-picker-cell-today-text | candidate: var(--color-border-focus) | candidate |
| --date-picker-cell-disabled-text | candidate: var(--color-text-disabled) | candidate |
| --date-picker-cell-hover-bg | candidate: var(--color-bg-subtle) | candidate |
| --date-picker-icon-color | candidate: var(--color-icon-default) | candidate |
| panel shadow | rgba(0,0,0,0.10) — shadow 전용 허용 1회 | candidate |

---

## CSS Classes

| 클래스 | 역할 |
|---|---|
| `.s1-date-picker` | wrapper (position: relative) |
| `.s1-date-picker__panel` | calendar popup panel |
| `.s1-date-picker__header` | month navigation row |
| `.s1-date-picker__nav-btn` | prev/next month buttons |
| `.s1-date-picker__month-label` | YYYY.MM 표시 |
| `.s1-date-picker__weekdays` | 요일 헤더 row |
| `.s1-date-picker__weekday` | 요일 셀 |
| `.s1-date-picker__grid` | 날짜 grid (7 columns) |
| `.s1-date-picker__day` | 날짜 버튼 |
| `.is-other-month` | 이전/다음 달 날짜 (dimmed) |
| `.is-today` | 오늘 날짜 (border highlight) |
| `.is-selected` | 선택된 날짜 (filled bg) |

## data Attributes (JS hook)

| attribute | 역할 |
|---|---|
| `data-date-picker` | picker 컨테이너 식별자 |
| `data-date-picker-input` | trigger input |
| `data-date-picker-toggle` | calendar icon button |
| `data-date-picker-panel` | calendar panel |
| `data-date-grid` | day grid 컨테이너 |
| `data-current-month` | YYYY.MM label |
| `data-prev-month` | 이전 달 버튼 |
| `data-next-month` | 다음 달 버튼 |

---

## Created / Updated

| 파일 | 내용 |
|---|---|
| `registry/components/date-picker.json` | 신규 생성 — 컴포넌트 사양, token candidate, HD 목록 |
| `registry/components/index.json` | DatePicker candidate 항목 추가 (priority: 8) |
| `registry/figma/figma-map.json` | `datePicker` 항목 추가 (figma-unconfirmed 상태) |
| `pages/components.html` | DatePicker 섹션 추가 — CSS + Trigger States HTML + Interactive Preview + Token Candidates + JS |
| `CLAUDE.md` | MVP4.3-A Rules 섹션 추가, 변경 이력 추가, 완료 단계 추가, 미결 사항 업데이트 |
| `README.md` | MVP4.3-A 섹션 추가 |
| `reports/mvp4-3-a-date-picker.md` | 본 보고서 신규 생성 |

---

## Human Decisions Needed

- [ ] **HD-1**: Figma node 6443:4655 componentSetKey 확인 (MCP invalid — Figma 직접 확인 필요)
- [ ] **HD-2**: DatePicker vs DayPicker — 공식 컴포넌트명 확정
- [ ] **HD-3**: calendar icon Figma 노드명 확정 (현재 candidate inline SVG)
- [ ] **HD-4**: Mobile 인터랙션 확정 (bottom sheet vs inline vs popover)
- [ ] **HD-5**: DatePicker 전용 token candidate → stable 전환 여부 결정
- [ ] **HD-6**: disabled-date 기준 확정 (어떤 날짜를 비활성으로 처리할지)
- [ ] **HD-7**: other-month date 클릭 허용 여부 (현재 disabled)
- [ ] **HD-8**: 일/토 요일 색상 토큰 별도 생성 여부 (현재 --color-status-error / --color-border-focus 재사용)

---

## Next Recommended Steps

1. Figma node 6443:4655 URL 직접 접근 또는 Figma Plugin으로 componentSetKey 확인
2. TimePicker component candidate 정리 (figmaNodeId: 6443:4606)
3. Textarea component candidate 정리
4. HD-2 결정 후 registry id/label 업데이트
5. DatePicker token candidate → stable 전환 검토 (HD-5)
6. Dark mode 시각 검증 후 darkModeStatus: pending → stable 전환

---

## MVP4.3-A Revision — Figma 6456:4033 + uvis 참고 (2026-05-12)

### Figma 조회 결과

**Section 2 (6456:4033)** — 성공

| 노드 | ID | 내용 |
|---|---|---|
| Section 2 | 6456:4033 | datepicker_input + mobile_datepicker_bottomsheet 포함 |
| datepicker_input frame | 540:3794 | Trigger input 컴포넌트 (플랫폼×상태 매트릭스) |
| mobile_datepicker_bottomsheet | 540:3836 | Mobile 캘린더 패널 (type=default, state=default) |
| CalendarArrow prev | 540:4200 | 24×24px 이전 달 화살표 |
| CalendarArrow next | 540:4203 | 24×24px 다음 달 화살표 |
| ic_날짜/근태,달력 | 221:3835 | 달력 아이콘 (24×24px) |

#### Trigger (540:3794) 확인값

| Property | Value |
|---|---|
| platform | mobile / pc-md / pc-xsm / pc-xxsm |
| state | default / selected / completed / disabled |
| state=selected 의미 | trigger 열림/포커스 상태 (open) |
| state=completed 의미 | 날짜 선택 완료 (filled) |
| mobile height | 48px (--sizing/form-control/height/lg) |
| pc-md height | 44px (--sizing/form-control/height/md) |
| pc-xsm height | 34px (--sizing/form-control/height/xs) |
| pc-xxsm height | 28px (--sizing/form-control/height/xxs) |
| default border | --color/form-control/border/default (#d9d9d9) |
| selected border | --color/form-control/border/selected (#1d6ceb) |
| disabled bg | --color/form-control/bg/disabled (#f5f5f5) |
| placeholder text | --color/form-control/text/placeholder (#757575) |
| completed text | --color/form-control/text/default (#353535) |
| disabled text | --color/form-control/text/disabled (#c4c4c4) |
| date format | YY.MM.DD (예: 25.12.30, 2자리 연도) |
| calendar icon | ic_날짜/근태,달력 node 221:3835, 24×24px |

#### Mobile Bottom Sheet (540:3836) 확인값

| Item | Value |
|---|---|
| panel bg | --surface/neutral/bg/base (white) |
| panel width | 360px |
| panel padding-y | 20px (--spacing/padding/block/md) |
| panel border-radius (top) | 8px |
| header font | 20B (20px Bold) — "날짜 선택" title |
| month label font | 24B (24px Bold) |
| weekday font | 16M (16px Medium, --color/text/body/primary #353535) |
| weekday order | 월 화 수 목 금 토 일 (weekStart=1, 월요일 시작) |
| day font | 16M (16px Medium) |
| outer cell | 44×44px |
| inner circle | 30×30px, border-radius: radius-full (50%) |
| selected bg | --color/control/bg/selected (#1d6ceb) |
| selected text | --color/text/state/accent-alt (white) |
| today bg | --color/control/bg/selected-alt (white) |
| today border | --color/control/border/selected (#1d6ceb) |
| today text | --color/text/state/accent (#1d6ceb) |
| other-month text | --color/text/state/disabled (#c4c4c4) |
| "적용" button | mobile_button, h48, --color/button/bg/primary--default (#1d6ceb) |

#### figma-unconfirmed 항목 (Revision 후)

| 항목 | 상태 | 비고 |
|---|---|---|
| componentSetKey | figma-unconfirmed | Plugin 직접 접근 필요 |
| PC calendar popup panel | figma-unconfirmed | Section 2에 PC popup 노드 없음. mobile bottomsheet 구조 참고 추정. |
| PC weekday 시작 요일 | figma-unconfirmed | mobile=月요일 시작 확인. PC popup 미확인 → HD-9 |
| calendar icon SVG 원본 | figma-unconfirmed | node 221:3835 asset 미등록 → HD-3 |
| error state | figma-unconfirmed | datepicker_input에 error state 없음 |

---

### uvis 퍼블리싱 참고

**참고 파일:**
- `pc/dist/assets/js/amobe_datepicker.js` — Custom DatePicker 초기화 모듈
- `pc/dist/resources/css/datepicker.css` — bootstrap-datepicker CSS (교체 대상)

#### 재사용 항목

| 항목 | 재사용 근거 |
|---|---|
| 날짜 형식 `yy.mm.dd` | Figma "25.12.30" 와 일치 확인 — 동일 적용 |
| `normalizeDateInputValue` 로직 | 4자리/2자리 연도 정규화 — 향후 Range picker 구현 시 참고 |
| weekStart: 0 (일요일 시작) | PC figma-unconfirmed 동안 amobe 기준 유지 (HD-9 결정 대기) |
| todayHighlight: true | today 강조 — 구현 반영 |
| autoclose: true | 선택 후 자동 닫기 — 구현 반영 |
| Range datepicker 로직 | Range 구현 단계(MVP4 이후)에서 참고 |

#### 교체 항목

| 교체 전 (uvis) | 교체 후 (디자인시스템 기준) | 이유 |
|---|---|---|
| bootstrap-datepicker CSS | s1-date-picker__* CSS 시스템 | raw HEX + non-token 스타일 제거 |
| jQuery 의존성 | Vanilla JS setupDatePicker | 디자인시스템 Vanilla JS 원칙 |
| table 기반 grid (20×20px cell) | CSS grid 44×44px 컨테이너 + 30×30px inner circle | Figma 확인값 적용 |
| linear-gradient today 스타일 | border+text accent (token 기반) | Figma today=selected-alt 구조 |
| raw HEX (#006dcc, #0088cc 등) | --color-action-primary-default 등 CSS token | 디자인시스템 규칙 |
| `.icon-calendar` CSS class | `s1-input-action-btn` class + ic_날짜/근태,달력 | 디자인시스템 구조 |

---

### Figma vs uvis 비교

| 항목 | Figma (확인) | uvis 기존 | 결정 |
|---|---|---|---|
| 날짜 형식 | YY.MM.DD (2자리) | yy.mm.dd (동일) | Figma 기준 YY.MM.DD |
| 트리거 height (PC-MD) | 44px | 34px (input-wrap.date 참고값) | Figma 기준 44px |
| 달력 아이콘 | 24×24px (node 221:3835) | `.icon-calendar` (PNG) | Figma 기준 inline SVG (candidate) |
| day cell 크기 | 44×44px + 30×30px circle | 20×20px (bootstrap table) | Figma 기준 44+30 구조 |
| today 스타일 | border+text blue (#1d6ceb), white bg | linear-gradient yellow | Figma 기준 |
| selected 스타일 | filled circle #1d6ceb, white text | filled blue gradient | Figma 기준 |
| 패널 컨테이너 (mobile) | bottom sheet (360px, 확인) | bootstrap dropdown | Figma 기준 mobile bottomsheet |
| 패널 컨테이너 (PC) | figma-unconfirmed | bootstrap dropdown popover | PC popup figma-unconfirmed → HD |
| weekday 시작 (mobile) | 월요일 (weekStart=1, 확인) | 일요일 (weekStart=0) | HD-9: PC 결정 후 반영 |

---

### 구현 업데이트

#### CSS 변경 (pages/components.html)
- `s1-date-picker__day`: 44×44px 컨테이너, padding 5px
- `.day-inner`: 30×30px, border-radius 50%, inner circle 신규 추가
- `.is-today`: border+text accent (#1d6ceb) — Figma selected-alt 구조 반영
- `.is-selected`: filled blue circle — Figma selected 구조 반영
- `.is-other-month`: text-disabled (#c4c4c4) — Figma disabled text 확인값 반영
- `s1-date-picker__weekday`: 44×44px cell, 14px Medium
- `s1-date-picker__weekday.is-sunday/.is-saturday`: 요일 색상 class 추가
- `s1-date-picker__panel` min-width: 308px (Figma mobile grid 308px 참고)
- `s1-date-picker__header` height: 32px (Figma 확인)
- `s1-date-picker__nav-btn`: 24×24px (Figma CalendarArrow 24×24 확인)

#### HTML 변경 (pages/components.html)
- Trigger States에 `selected(=open)` 상태 추가 (Figma property 반영)
- `completed(=filled)` 상태: value "26.05.12" (YY.MM.DD 형식)
- placeholder "날짜를 선택하세요" (Figma 확인값 적용)
- Size Variants 섹션 추가 (PC-MD/XSM/XXSM/Mobile 4종)
- `.s1-date-picker__day > .day-inner` 구조 반영
- `[data-weekdays]` 컨테이너 추가 (JS 렌더링)
- Token Candidates 섹션: Figma variable 이름과 대응값 상세 기록

#### JS 변경 (pages/components.html)
- `formatDate`: YYYY → YY 2자리 연도 출력 (Figma YY.MM.DD 확인)
- `makeDay`: `.day-inner` span 생성 로직 추가 (44+30 구조)
- `renderWeekdays`: WEEK_START 기반 동적 요일 헤더 렌더링
- `renderGrid`: WEEK_START 기반 leading cells 계산 (일요일 기본, HD-9 대기)
- `openPanel`: renderWeekdays() + 첫 활성 셀 focus
- 키보드 네비게이션: ArrowKey(날짜 이동), Enter/Space(선택), ESC(닫기)
- click handler: 클릭 후 is-selected 상태 즉시 갱신

---

### 미결 항목 (Revision 후)

- [ ] **HD-1**: componentSetKey 확인 (Figma Plugin 직접 접근)
- [ ] **HD-2**: 공식 컴포넌트명 확정 — DatePicker vs DayPicker
- [ ] **HD-3**: ic_날짜/근태,달력 (221:3835) SVG 추출 → assets 등록
- [ ] **HD-4**: Mobile Bottom Sheet 구현 (540:3836 구조 확인 완료, 구현 시작 가능)
- [ ] **HD-5**: Token candidate → stable 전환 검토
- [ ] **HD-6**: disabled-date 기준 확정
- [ ] **HD-7**: other-month date 클릭 허용 여부
- [ ] **HD-8**: 일/토 색상 토큰 별도 생성 여부
- [ ] **HD-9**: PC weekday 시작 요일 확정 (mobile=月 확인, PC popup figma-unconfirmed)
- [ ] **HD-10**: YY.MM.DD vs YYYY.MM.DD — 서비스 DB/API 연동 형식 확정
