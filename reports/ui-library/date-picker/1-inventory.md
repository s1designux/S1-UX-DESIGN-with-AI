# Date Picker — 1. 전수 재고조사 (판독 결과)

> 📖 이 문서는 `source-reader` 판독 결과다. 판단·제안 없음, 읽은 사실만. 확인 방법(A=실제 렌더 / B=CSS+JS 전체 추적)을 각 항목에 명시.

## 판독 대상
- `plugins/figma-vars-installer/src/build-components.ts` (6203줄) — 3300~4060 구간
- `plugins/figma-vars-installer/src/vars-data.ts` — 479~660 구간(date-picker·overlay·bg·surface 그룹) + Foundation 팔레트(51~150 구간)
- `registry/components/date-picker.json` (246줄, 전체)
- `registry/components/component-guide-model.json` — date-picker/calendar 항목(310~340줄 부근)
- `pages/components.html` — date-picker 관련 222개 매치 전수(스타일 810~1030대, 마크업 2887~3298, JS 4419~4680, nav 1861)
- `ui-library/src/` — components 목록, index.js, auto-init.js, component-token-map.json, assets/icons, time-picker·select 매니페스트/CSS/JS
- `registry/governance/ui-library-migration.json`, `assets/js/ui-library-guide.js`, `pages/ui-review.html`

## 판독 범위 메모
`build-components.ts` 는 3300~4060 구간(6개 빌더 + lazy-build 헬퍼)만 정독했다. 그 외 5900줄은 훑지 않았다(관련 없음 — 함수 경계로 좁힘). `vars-data.ts` 는 grep 으로 `date-picker`·`wheel-fade`·참조된 Foundation 키만 좁혀 읽었다. `pages/components.html`(수천 줄)은 grep 으로 `date-picker` 매치 222건 전수를 확인했고, 주변 CSS/JS 컨텍스트를 sed 로 펼쳐 읽었다 — 전체 통독은 하지 않았다.

---

## A. 시각 정본 — `build-components.ts` 6개 빌더

### 확인 방법
**B(추적)** — 렌더하지 않았다. 6개 함수 전체(3311~4060줄)를 정독하고 combineAsVariants·appendChild·setLightMode 호출 순서로 최종 구조를 재구성했다. Figma MCP 렌더 확인은 하지 않음(파일 미인증 — 시스템 알림).

### A-1. `buildCalendarCell` (3319~3406)
| 항목 | 내용 | 출처 |
|---|---|---|
| outer 크기 | 44×44, HORIZONTAL auto-layout, CENTER/CENTER, clipsContent=true | 3358~3364 |
| Type=Standard axis | State: Default, Hover, Today, Selected, Disabled (5) | 3366~3372 |
| Type=Range axis | State: Default, Start, End, Disabled (4 — 비대칭, Hover 없음) | 3373~3384 |
| inner 원 | 30×30, radius/full, strokeWeight 1(INSIDE), 숫자 텍스트 16px Medium, layer명 "num" | 3336~3344 |
| Standard 토큰 [bg, border, text] | Default=[cell/bg/today, cell/bg/today, text/secondary] · Hover=[cell/bg/hover, cell/bg/hover, text/secondary] · Today=[cell/bg/today, cell/border/today, text/today] · Selected=[cell/bg/selected, cell/border/today, text/selected] · Disabled=[cell/bg/today, cell/bg/today, text/disabled] | 3327~3333 |
| Range 토큰 [bandX, bandW, bg, border, text] | Default=[0,44, cell/bg/range, cell/bg/range, text/secondary] · Start=[22,22, cell/bg/today, cell/border/today, text/today] · End=[0,22, cell/bg/selected, cell/border/today, text/selected] · Disabled=[0,44, cell/bg/range, cell/bg/range, text/disabled] | 3335~3340 |
| Range 밴드 구조 | Rectangle "band", h30, absolute, y=7((44-30)/2), fill=cell/bg/range 고정(모든 state 동일), x/w 는 위 표 | 3379~3387 |
| bold 텍스트 | Standard:Selected 및 Range:End 만 bold(makeInner 4번째 인자 `state==="Selected"` / `state==="End"`) | 3345, 3371, 3384 |
| V2.4 원본 노드 | calendar_cell(540:4167), fileKey yE5UCFEbmXJBlYJWB24Lz2 | 3313 |
| 특기사항(주석) | Hover 는 Standard 에만 추가, selected/range 는 회색 hover 로 덮지 않음(전용 selected-hover 토큰 필요 — BACKLOG ③); 셀 마스터에 모드 핀 안 함 | 3320~3325, 3401 |

**Type=Range 질문 답**: 정확히 4개 variant = `Range:Default`(밴드 44px 풀폭, blue/50 계열) · `Range:Start`(밴드 우측 절반만, 원은 today 톤) · `Range:End`(밴드 좌측 절반만, 원은 selected 톤) · `Range:Disabled`(밴드 풀폭, 텍스트만 disabled). Hover 상태 없음(비대칭 = Standard 5개 vs Range 4개).

### A-2. `buildCalendarTile` (3396~3424)
| 항목 | 내용 | 출처 |
|---|---|---|
| 크기 | 88×56, cornerRadius 4, strokeWeight 1(INSIDE), clipsContent=true | 3411~3416 |
| axis | State: Default, Hover, Selected, Disabled (4, 단일축) | 3406, 3409 |
| 토큰 [bg,border,text,sampleLabel] | Default=[tile/bg/default, tile/border/default, text/primary, "2022"] · Hover=[tile/bg/hover, tile/border/default, text/primary, "2023"] · Selected=[tile/bg/selected, cell/border/today, text/today, "2025"] · Disabled=[tile/bg/disabled, tile/border/disabled, text/disabled, "2021"] | 3399~3404 |
| 텍스트 | 16px Medium, layer명 "label" | 3418 |
| V2.4 원본 노드 | calendar_tile(540:4209) | 3312 |
| 특기 주석 | Hover bg = Secondary 버튼 hover foundation 과 동일(gray/50·gray-dark/200) → tile/bg/hover 신규(사용자 결정 2026-06-25) | 3400 |

### A-3. `buildCalendar` (3512~3670) — State=Date/Year/Month
| 항목 | 내용 | 출처 |
|---|---|---|
| 패널 크기 | 356×352(PANEL_W/PANEL_H), padding 24(좌우)/20(상하), cornerRadius 4, itemSpacing 0 | 3526~3536 |
| 패널 토큰 | fill=panel/bg, stroke=panel/border(1, INSIDE), effects=shadowEffects("shadow/dropdown") | 3532~3540 |
| 내부 content 프레임 | VERTICAL AUTO×AUTO, counterAxisAlignItems CENTER, itemSpacing=상태별 다름(Date=16, Year/Month=20) | 3541~3546, 3577, 3617, 3634 |
| 헤더(공용 makeCalHdr) | HORIZONTAL 308×32, SPACE_BETWEEN/CENTER; 좌: chevron 180° 회전(date-picker/icon/default) · 중앙: 라벨 24px Bold(date-picker/text/primary) · 우: chevron 0°(date-picker/icon/default) | 3550~3562 |
| chevron SVG | 16×16 viewBox, path `M10 12L6 8l4-4`(좌, 180° 회전 적용) / `M6 4l4 4-4 4`(우) — 인라인 문자열 | 3521~3522 |
| 요일/타일 셀 폭 | CW = 308/7 = 44 (콘텐츠폭÷7) | 3523 |
| State=Date 그리드 | weekdays row: "월화수목금토일"(월요일 시작) 각 44×44, text/primary 16px Medium; 5주×7일 grid, 셀은 Calendar Cell 인스턴스(Standard variant), 데모 데이터: 2025.01, other-month=Standard:Disabled 매핑, today=10일, selected=17일, disabled=25일 | 3588~3616 |
| State=Year | 헤더 라벨 "2025", 4행×3열 타일 그리드(연도 2021~2032), 각 행 itemSpacing 12, Calendar Tile 인스턴스(disabled 배열로 일부 비활성: 2021·2022·2023·2030·2031·2032) | 3618~3631 |
| State=Month | 헤더 라벨 "2025", 4행×3열 타일 그리드("1월"~"12월"), 전부 비활성 아님 | 3633~3641 |
| 요일 헤더 유무 | Date 화면에만 있음(weekdays row). Year/Month 는 요일 헤더 없음 | 3591~3600 vs 3618~3641 |
| 연/월 화면 칸 = Calendar Tile인가 | **예**, `calTileInstance` 로 State=Date/Year 화면의 4×3 그리드를 채움(makeYMTile → calTileInstance) | 3560~3562(makeYMTile), 3618~3641 |
| combineAsVariants | [dateComp, yearComp, monthComp] → set.name="Calendar", axis 이름은 컴포넌트명 "State=Date/Year/Month" | 3644~3646 |
| V2.4 원본 노드 | 540:4216(pc_datepicker_calendar) | 3510(윗줄 주석), registry date-picker.json figmaCalendarNodeId 동일 |
| 특기 주석 | Date Picker Open 상태가 이 세트의 State=Date 인스턴스를 부착(anatomy gate: "calendar-panel" raw 프레임 금지) | 3511 |

### A-4. `buildDatePicker` (3670~3751)
| 항목 | 내용 | 출처 |
|---|---|---|
| 트리거 구조 | HORIZONTAL, SPACE_BETWEEN/CENTER, paddingLeft 16·paddingRight 8·top/bottom 0, cornerRadius 4, fill=form-control/bg/*, stroke=form-control/border/*(1, INSIDE) | 3689~3696 |
| trigger 텍스트/아이콘 | 텍스트(placeholder/값) + calendar 아이콘 인스턴스(fcIconPx(sc.h,0) 크기) | 3697~3699 |
| calendar 아이콘 SVG | 16×16(viewBox 0 0 16.2581 16.8), path 시작 `M0 1.08387V16.2581C0 16.5615...`(달력 프레임+격자 dots 3개) | 3672 |
| Size × Break axis | XXSM/PC h28 font12 · XSM/PC h34 font14 · MD/PC h44 font14 · MD/Mobile h48 font14 (4 sizes) | 3679~3684 |
| State axis | Default(placeholder "YY.MM.DD", text/placeholder) · Filled(값 "26.06.17", text/default) · Open(값 유지, text/selected, bg/border=selected) · Disabled(placeholder, text/disabled, icon/disabled) | 3673~3678 |
| variant 총수 | 4 sizes × 4 states = 16 variant, 이름 `Size=X, State=Y, Break=Z` | 3703, 3708 |
| Open 캘린더 부착 방식 | `if (st.open && sc.brk === "PC")` 일 때만 — BUILT_COMPS["Calendar:Date"] 를 createInstance 해 `comp.appendChild(calInst)`. 트리거 프레임 아래 **같은 부모 컴포넌트의 VERTICAL 자식**으로 addChild(offset/absolute 아님, auto-layout 세로 흐름, itemSpacing=8) | 3691("comp.itemSpacing = 8"), 3712~3725 |
| 오프셋/정렬 | 별도 x/y 오프셋 지정 없음 — 부모 comp.layoutMode="VERTICAL"(3690)의 itemSpacing 8 이 트리거-캘린더 간격을 결정. absolute positioning 코드 없음(주석에 "부착"이라 표현했지만 auto-layout stacking) | 3690~3691, 3712~3725 |
| **Mobile Open** | 코드상 `sc.brk === "PC"` 조건 때문에 **Mobile 캘린더는 부착 안 됨**(Open 트리거만 있고 패널 없음) — 별도 buildDatePickerBottomSheet 가 담당한다는 주석 | 3707("모바일은 #7 별도 바텀시트 컴포넌트로 처리"), 3713 |
| V2.4 원본 노드 | 540:3794(input), 540:4216(PC calendar) | 3306 |
| 미결 HD(코드 주석) | componentSetKey 미확정 · 모바일 인터랙션(bottom sheet vs inline) 미정 → 모바일 패널은 생성하지 않음 | 3308 |

### A-5. `buildDatePickerBottomSheet` (3751~3833)
| 항목 | 내용 | 출처 |
|---|---|---|
| 시트 폭 | 360px, VERTICAL, primaryAxisSizingMode AUTO, itemSpacing 32(섹션간), paddingTop/Bottom 20 | 3757~3763 |
| 배경 | color/surface/raised (라이트=base/white, 다크=gray-dark/100) — 캘린더 패널과 동일색으로 통일(2026-07-06 정정 이력: 이전엔 color/bg/level-0 오참조로 캘린더보다 어두웠음) | 3768, 3746~3750 |
| 라운드 | topLeft/topRight 8, bottomLeft/Right 0 | 3770 |
| 헤더 | HORIZONTAL, SPACE_BETWEEN/CENTER, 좌우패딩 20; 제목 "날짜 선택" 20px Bold(color/text/title/primary) + 닫기(close) 아이콘 24px(color/icon/gray-dark) | 3775~3783 |
| 닫기 아이콘 | `CLOSE_ICON_SVG`(전역 상수, 이 구간엔 정의부 없음 — 별도 정의 파일 위치 미확인) — V2.2 close(ic_닫기 89:4927, plain-X) 라이브러리 인스턴스라고 주석에 명시 | 3782, 3746 |
| 캘린더 본문 | calWrap(좌우패딩 24) 안에 `BUILT_COMPS["Calendar:Date"]` 인스턴스 재사용, strokes/effects 제거(시트 안에서 보더 이중으로 안 보이게) | 3785~3803 |
| 하단 버튼 | Button primary LG Default 인스턴스, 라벨 "적용", layoutSizingHorizontal=FILL(가로만 풀폭, 세로는 48px 유지 — STRETCH 안 씀) | 3805~3824 |
| 세트 외부 배경 | decorateSetFlat 이후 `set.fills` 를 color/bg/level-3 로 덮어씀(시트가 흰 섹션 배경에 안 묻히게) | 3829~3833 |
| V2.4 원본 노드 | 540:3836(mobile bottomsheet) | 3745 |
| 실측 여백(주석) | 시트 세로패딩 20·헤더 좌우 20·캘린더 래퍼 좌우 24·섹션간 gap 32·상단 라운드 8 | 3748 |

### A-6. `buildTimePickerMobileBottomSheet` (3862~4060+)
> **참고 정보로만 판독** — date-picker work-id 와 이름은 붙었으나 실제로는 **Time Picker** 전용 빌더다(Content=TimeOnly/DateTime, 시간 휠). Date Picker 자체 기능 아님.

| 항목 | 내용 | 출처 |
|---|---|---|
| axis | Content: TimeOnly("시간 선택") / DateTime("시작 일시") — 2 variant | 3985, 3990~3996 |
| 시트 폭 | 360px, 동일 헤더 구조(제목+닫기), 시트 배경/라운드 buildDatePickerBottomSheet 와 동일 패턴 | 3987~3995 |
| DateTime 전용 | 날짜/시간 탭(Line Tab Mobile/SM 인스턴스 재사용, "날짜"/"시간" 라벨) | 4004~4020 |
| 시간 휠 | 4열(ampm 2행 / hour 3행 / colon 3행 / minute 3행), 32px Regular 텍스트, 전 셀 color/text/state/accent | 3864~3882, 4022~4045 |
| 흐림 마스크 | FADE_H=110, 4-stop gradient alpha(마스크) + color/overlay/wheel-fade(솔리드 표면색) 2겹 구조 | 3891~3924, 4046~4055 |
| V2.4 원본 노드 | 920:9267 | 3860 |
| Date Picker 와의 관계 | 없음 — 코드 어디에도 Date/Calendar 참조 없음(별개 컴포넌트) | 3862~4060 전체 |

---

## B. 토큰 실제 값 — `vars-data.ts`

### 확인 방법
**B(추적)** — grep 으로 date-picker/overlay 그룹 좁힌 뒤 정독, semantic 값이 참조하는 Foundation 팔레트 키를 재차 grep 해 HEX 확인.

### `color/date-picker/*` 전 항목 (출처: 626~655줄)
| 토큰 | Light (semantic ref → HEX) | Dark (semantic ref → HEX) |
|---|---|---|
| panel/bg | base/white → #FFFFFF | gray-dark/100 → #1C1D23 |
| panel/border | gray/200 → #D9D9D9 | gray-dark/500 → #3E4049 |
| cell/bg/hover | gray/50 → #F5F5F5 | gray-dark/200 → #24252C |
| cell/bg/today | base/white → #FFFFFF | gray-dark/100 → #1C1D23 |
| cell/bg/selected | blue/400 → #1D6CEB | blue-dark/300 → #3070D8 |
| cell/bg/selected-hover | blue/500 → #2747B9 | blue-dark/250 → #2A65C8 |
| cell/bg/range | blue/50 → #E2F1FF | blue-dark/100 → #112B55 |
| cell/border/today | blue/400 → #1D6CEB | blue-dark/300 → #3070D8 |
| icon/default | gray/900 → #202020 | gray-dark/900 → #ECEDF0 |
| icon/hover | gray/800 → #353535 | gray-dark/800 → #B8BABF |
| icon/disabled | gray/300 → #C4C4C4 | gray-dark/500 → #3E4049 |
| text/primary | gray/900 → #202020 | gray-dark/900 → #ECEDF0 |
| text/secondary | gray/800 → #353535 | gray-dark/800 → #B8BABF |
| text/disabled | gray/300 → #C4C4C4 | gray-dark/500 → #3E4049 |
| text/other-month | gray/300 → #C4C4C4 | gray-dark/400 → #35363F |
| text/sunday | red/300 → #FF4554 | red-dark/350 → #F06070 |
| text/saturday | blue/400 → #1D6CEB | blue-dark/300 → #3070D8 |
| text/today | blue/400 → #1D6CEB | blue-dark/300 → #3070D8 |
| text/selected | base/white → #FFFFFF | base/white → #FFFFFF |
| tile/bg/default | base/white → #FFFFFF | gray-dark/100 → #1C1D23 |
| tile/bg/hover | gray/50 → #F5F5F5 | gray-dark/200 → #24252C |
| tile/bg/selected | base/white → #FFFFFF | gray-dark/100 → #1C1D23 |
| tile/bg/disabled | gray/100 → #E9E9E9 | gray-dark/200 → #24252C |
| tile/border/default | gray/200 → #D9D9D9 | gray-dark/500 → #3E4049 |
| tile/border/disabled | gray/100 → #E9E9E9 | gray-dark/300 → #2E2F38 |

**중요 사실**: `cell/bg/selected-hover`(633줄)는 vars-data.ts 에 **값이 정의돼 있으나**, `build-components.ts` 의 `buildCalendarCell`(A-1) 코드에는 **참조되지 않는다**(grep 결과 3323줄 주석에서만 언급, 실제 STD/RNG 매핑 테이블에 등장 안 함). 즉 정본 시각 빌더는 이 토큰을 아직 안 쓴다.

### `color/overlay/wheel-fade`
| Light | Dark |
|---|---|
| base/white → #FFFFFF | gray-dark/100 → #1C1D23 |

(Time Picker Mobile Bottom Sheet 전용 — Date Picker 와 무관, 출처 620줄)

---

## C. 컴포넌트 메타 정본 — `registry/components/date-picker.json`

### 확인 방법: A(파일 직접 읽음, 246줄 전체)

| 필드 | 내용 |
|---|---|
| `_meta.status` | `in-progress` |
| `_meta.tokenStatus` | `stable` |
| `_meta.codeStatus` | `implemented` |
| `_meta.darkModeStatus` | `stable` |
| **`_meta.a11yStatus`** | **`"partial"`** (필드 존재, 값 = partial — "완료" 아님) |
| `_meta.harnessStatus` | `implemented` |
| `usage` | whenToUse 2줄(날짜 단일/기간 선택, 트리거=Base Input), whenNotToUse 2줄(시간만=TimePicker, 자유텍스트=Input) |
| `anatomy` | 3파트: 트리거 필드(Base Input 재사용) · 캘린더 패널(월 네비+그리드) · 날짜 셀(default/hover/today/selected/other-month/disabled) |
| `doDont` | do 2줄(트리거는 Input 재사용, 상태 토큰으로 구분) / dont 2줄(raw 색 금지, PC 레이아웃 Figma 미확인 단정 금지 — **이 dont 항목 자체가 이미 2026-07-09 RESOLVED 로 갱신 안 됨, 아래 참고**) |
| `a11y` | 2줄: 키보드 이동+aria-selected, aria-disabled |
| `states` | trigger: default/selected(=open)/completed(=filled)/disabled/error(figma-unconfirmed); dayCell: default/hover/today/selected/other-month/disabled-date |
| `platformSupport` | pc: sizes[md/xsm/xxsm], panel="popover — figma-unconfirmed"(**주의: figma.status/note 필드는 이미 RESOLVED 라 이 문구는 갱신 지연**); mobile: sizes[mobile h48], panel="bottom-sheet(540:3836 확인)" |
| `dateFormat` | figmaConfirmed="YY.MM.DD", humanDecision HD-10(서비스 YYYY.MM.DD 변환 필요) |
| `cellGeometry` | figmaSource=540:3836, outerCell 44×44, innerCircle 30×30(radius-full), padding 5px, note="PC popover cell geometry figma-unconfirmed — mobile 동일 구조 적용 추정" |
| `humanDecisions` | HD-1~HD-10 **전부 "확정/결정/보류"로 닫혀 있음** — 열린(미해결) 항목 없음. 요약: HD-2 이름 확정 / HD-5 토큰 stable / HD-9 weekStart=일요일 / HD-10 형식 / HD-8 별도 토큰 불생성(서비스 override) / HD-4 mobile bottom sheet 채택 / HD-1 보류(라이브러리 publish 단계 재검토) / HD-3 calendar 아이콘 등록 완료 / HD-6 disabled 날짜는 data 속성 주입 / HD-7 이전/다음달 클릭 항상 허용+해당월 이동 |
| `notBaseInputState` / `notRelatedComposedField` / `separateComponentCandidate` | 전부 `true` |
| `figma.status` | `"partial"`, note 에 "RESOLVED 2026-07-09: PC calendar = 540:4216 ... 5 states: default_button/default/year select/month select/year range select" — **build-components.ts 실제 구현(A-3)의 axis(Date/Year/Month 3개)와 registry note 의 "5 states" 서술이 불일치**(registry note 는 옛 조사 메모, 실제 빌더는 3-variant State axis) |
| `guide` | sampleLabel="날짜", samplePlaceholder="YY.MM.DD", sampleValue="26.08.11", sampleDates 7개, webTag="button", interactionPattern="calendar-grid", mobileDependency="Date Picker Mobile Bottom Sheet" |

**calendar/calendar-cell/calendar-tile 별도 registry 파일 존재 여부**: `ls registry/components | grep -i calend` 결과 **없음** — Calendar/Calendar Cell/Calendar Tile 은 date-picker.json 안에 흡수 서술돼 있을 뿐, 독립 registry JSON 파일이 없다(미확인 아님 — 부재를 확인함).

---

## D. 기존 웹 자산 — 있는 것과 없는 것

### 확인 방법
`ui-library/src/components/` 디렉토리 목록(A, 직접 나열) + grep(B) + `pages/components.html` 은 CSS(inline `<style>` 810~1030줄대)와 JS(inline `<script>` `setupDatePicker` 4419~4680줄) 를 전체 추적해 정적 마크업인지 dist 소비인지 확인.

| 확인 항목 | 결과 | 출처 |
|---|---|---|
| `ui-library/src/components/` 에 date-picker/calendar 모듈 | **없음** — 디렉토리 목록에 date-picker 없음(button/checkbox/chip/dropdown/filter-chip/input/mobile-bottom-nav/mobile-header/modal/multi-toggle/pagination/radio/select/tab/table/textarea/time-picker/toggle 만 존재) | `ls ui-library/src/components/` |
| `ui-library/src/index.js`·`auto-init.js`·`component-token-map.json` 에 date-picker | **없음**(grep 매치 0건) | 직접 grep 실행 결과 |
| `ui-library/src/assets/` 아이콘 | calendar 아이콘 **없음**. 존재하는 아이콘: chevron.svg, close.svg, clock.svg, check.svg, remove.svg, mobile-header-arrow-down.svg, mobile-header-back.svg, mobile-header-close.svg, mobile-header-notification(-accent).svg, mobile-nav-home.svg, pagination-edge.svg + manifest.json | `ls ui-library/src/assets/icons/` |
| calendar 아이콘 어딘가에 있는가 | **있음, 단 프로젝트 루트 쪽**: `assets/icons/ic_calendar.svg` (ui-library 밖, 구 assets 폴더) — ui-library 자산으로는 미이관 | find 결과 |
| **`pages/components.html` 의 date-picker 섹션 성격** | **중요 — 예상과 다름.** date-picker 섹션이 **이미 존재한다**(마크업 2887~3298줄대). 단, Select·Time Picker 등 "승격 완료" 컴포넌트들처럼 `ui-library-guide.js renders from ui-library/dist` 주석 패턴이 **없다**. 대신 `.s1-date-picker__*` CSS 가 `<style>` 블록에 **직접 인라인**돼 있고(810~1030줄대), 인터랙션은 페이지 자체 `<script>` 안의 `function setupDatePicker(root)`(4419~4673줄, `root.querySelectorAll('[data-date-picker]')` 로 DOM 초기화)가 담당한다. **`ui-library/dist` 를 fetch 하는 코드 경로 없음**(grep 결과 `<head>` 의 `../ui-library/dist/{tokens.css, typography.css, s1-ui.css}` 3개 전역 스타일시트만 로드하고, 컴포넌트 전용 dist 소비 주석은 Checkbox·Radio·Toggle·Multi Toggle·Input·Chip·Filter Chip·Button·Textarea·Select·Dropdown·Modal·Table·Mobile Bottom Nav·Mobile Header·**Time Picker**에만 있고 date-picker 에는 없음) → **손편집 정적 마크업 + 페이지 전용 인라인 JS**로 판정(B, CSS+JS 전체 추적). | CSS 810~1030대, `<script>` 4419~4680대, dist 소비 주석 grep 결과(1904~3298줄대 비교) |
| nav 버튼 disabled 여부 | **disabled 맞음**: `<button class="comp-nav-btn" data-category="form" data-platforms="pc mobile" onclick="showSection('date-picker', this)" disabled>Date Picker</button>` | components.html:1861 |
| section 자체 존재 | 존재(`id="date-picker"`, `data-cov-states="default,filled,open,disabled,date,year,month,hover,today,selected,start,end"`, `data-cov-type="standard,range"`) + 별도 `id="date-picker-bottom-sheet"` 섹션도 존재(3671줄) | 2887, 3671 |
| `pages/ui-review.html` 등재 | grep 매치 **0건** — 등재 안 됨 | 직접 grep 실행 결과 |
| `assets/js/ui-library-guide.js` `guideComponents` 배열 | grep 매치 **0건** — 없음 | 직접 grep 실행 결과 |
| `registry/governance/ui-library-migration.json` | grep 매치 **0건** — 레코드 없음 | 직접 grep 실행 결과 |
| `registry/components/component-guide-model.json` | **있음** — order 28, category "Date Picker", name "Date Picker", `visibility: "public"`, `sectionId: "date-picker"`. 바로 다음 order 29 는 name "Calendar", `visibility: "internal"`, `sectionId: null`, reason: "요소 — Date Picker 안 캘린더 패널" | component-guide-model.json:310~340 부근 |

**정리**: date-picker는 "아예 없는 컴포넌트"가 아니라 **components.html 안에 이미 방대한 정적 프리뷰(스펙시트+인터랙션 데모)가 손으로 만들어져 있고, 그러나 ui-library/src(dist 소비 가능한 모듈) 로는 아직 한 줄도 이관되지 않은 상태**다. nav 는 의도적으로 잠겨있다(disabled). 이는 river 결정 로그 어디에도 "승인" 기록이 없다 — component-guide-model.json 은 `visibility: public`인데 nav 는 `disabled` 라는 점도 상태 불일치로 보임(판단 아님, 관측 사실).

---

## E. 참고 — 최근 승인 사례 `time-picker` / `select`

### 확인 방법: A(파일 직접 읽음)

### `time-picker/manifest.json` 필수 필드 스키마 (approved 컴포넌트 실제 예시)
| 최상위 키 | 필수 여부(전 파일에 존재) | 내용 |
|---|---|---|
| `id`, `version`, `status` | 필수 | status="approved" |
| `canonicalFingerprint` | 필수 | 정본 소스 해시 |
| `canonicalSources` | 필수 | build-components.ts·vars-data.ts·textstyles-data.ts·registry/components/*.json 4개 경로 명시 |
| `rootSelector` | 필수 | `[data-s1-component="time-picker"]` |
| `variants`, `sizes`, `types`, `breaks` | 필수 | 축 열거 |
| `geometry` | 필수 | 사이즈별 height/fontSize/icon/padding, panel(width/columnsHeight/padding/shadow/ownership 등 세부 소유 구조 서술), cell, footer, `source`(정본 함수+줄번호 인용), `minWidth` |
| `states` | 필수 | CSS selector 매핑(native/aria/data-attr 혼합, 상태별 selector 문자열) |
| `canonicalStateMap` | 필수 | 정본 State 이름 → 웹 상태 매핑 |
| `notInCanon` | 필수 | 정본에 없어 웹이 임의 결정한 항목 전부(river 지시 인용 포함) — **정본 부재 시 반드시 이 필드에 근거를 남긴다는 선례** |
| `parts` | 필수 | 컴포넌트 파츠 배열 |
| `htmlContract` | 필수 | root/requiredAttributes/optionalAttributes/requiredParts/trigger/panel(각 part 의 실제 HTML 구조)/relations(ARIA)/grouping/source/distribution/breakExamples |
| `cssContract` | 필수 | entry/rootScope/nativeStates/ariaStates/documentedDataStates/customization |
| `contentSlots` | 필수 | 슬롯별 required 여부 |
| `dependencies` | 필수 | font/css/coreComponents(+coreComponentsNote) |
| `icons` | 필수 | id/sourceKey/asset/use/accessibleNamePolicy |
| `a11y` | 필수 | nativeSemantics/accessibleName/keyboard/focus/ariaStateSync/errorRelation/reducedMotion — 각 `{status, value|reason}` 구조 |
| `jsRequired`, `javascript` | 필수 | runtime 경로/reason/options/events/eventDetail/methods/lifecycle/controlMode/progressiveEnhancementNote |

파일 구성: `manifest.json` + `{name}.css` + `{name}.js` + `{name}.example.html` + `{name}.mobile.example.html` (5개 파일, time-picker 기준 225/278줄 css/js).

### `select` 드롭다운 패널·키보드 계약 요약
- `panel`: `div[data-s1-part=panel]` 안에 **dropdown 코어 인스턴스**(`div[data-s1-component=dropdown][data-type=text]`)를 조립 — select 자체는 목록 렌더링을 소유하지 않고 dropdown 모듈에 위임.
- 키보드: trigger(Enter/Space toggle) → 전체 root(Escape 닫고 트리거로 포커스 복귀) → panel 안은 dropdown 모듈의 ArrowUp/Down·Home/End·Enter/Space.
- ARIA: trigger `aria-haspopup=listbox` + `aria-expanded` 동기화, panel 안 role=listbox/option + aria-selected 는 dropdown 모듈이 관리.
- `notInCanon`(time-picker 파일에서 확인된 실제 사례, select 도 유사 구조 사용): 정본에 규정이 없는 값은 river 개별 지시를 인용해 필드로 남기고, "선례"를 언급해 다른 컴포넌트가 같은 처리를 따르게 한다(예: 최소폭 150px 를 Select 선례로 Time Picker 가 따름).
- 코드 규모: `select.js` 113줄, `select.css` 110줄 — dropdown 코어에 위임하는 구조라 자체 코드는 얇음.

---

## 정본에 없는 것 목록 (river 결정 필요 후보 — 규칙을 지어내지 않고 나열만)

1. **PC 캘린더 패널의 붙는 방식** — `buildDatePicker`(A-4)는 트리거 아래 auto-layout 세로 스택으로만 캘린더를 붙인다(오프셋/absolute 코드 없음). 실제 웹에서 팝오버가 트리거 기준 절대 위치(offset, viewport 충돌 시 위로 뒤집기 등)로 뜰지에 대한 규정이 정본에 없다. `date-picker.json` 의 `platformSupport.pc.panel` 도 "popover — figma-unconfirmed" 로 스스로 미확인 표시.
2. **PC Range(기간 선택) 트리거·인터랙션 규칙** — Calendar Cell 은 Range variant(A-1)를 갖지만, `buildDatePicker`/`buildCalendar` 어디에도 "Range 모드로 진입하는 트리거", "시작일만 고른 상태의 중간 표시", "두 번째 클릭으로 종료일 확정" 같은 동작 정의가 없다. Range 는 정적 variant 표본일 뿐 상호작용 상태 기계가 없음.
3. **이전달/다음달(other-month) 셀 클릭 동작** — registry HD-7 에 "클릭 허용 + 해당 월로 이동"이라는 **문서 결정**은 있으나(C), 이를 구현하는 코드(빌더·CSS·JS)는 이번 판독 범위(build-components.ts 3300~4060) 안에 없다 — components.html 의 `setupDatePicker` 자체 구현에는 있을 수 있으나 이는 정본이 아니라 손편집 파생.
4. **연/월 화면 전환 조건** — 월 라벨을 클릭하면 Year/Month 화면으로 가는지, 별도 버튼이 있는지에 대한 빌더 코드상 트리거가 없다(`buildCalendar` 는 3개 State 를 정적 variant 로만 만들 뿐 전환 트리거 UI 요소가 없음).
5. **모바일 PC 겸용 트리거의 Open 시 동작** — A-4 에서 Mobile Break 는 Open state 트리거만 만들고 캘린더/바텀시트를 붙이지 않는다(코드가 `sc.brk === "PC"` 로 명시적으로 배제). 모바일에서 실제로 무엇이 열리는지는 별도 `buildDatePickerBottomSheet`(A-5, Mobile 전용 세트)로 완전히 분리돼 있어 "Date Picker" 세트 자체는 모바일 완결 상태를 갖지 않는다.
6. **키보드 이동 규칙(그리드 내 화살표 이동, Tab 순서, Range 시작/종료 선택 키)** — registry `a11y`(C)는 "키보드 이동 가능해야 한다"는 원칙만 있고, Time Picker/Select(E)처럼 구체적 키맵(ArrowUp/Down/Left/Right 의미, Home/End, Escape 동작)이 date-picker.json 에는 없다.
7. **`cell/bg/selected-hover` 토큰의 실제 적용 위치** — vars-data.ts 에 값은 있으나(B) build-components.ts 시각 빌더에는 배선 안 됨. components.html CSS 에는 `--color-date-picker-cell-bg-selected-hover` 참조가 있음(components.html:961) — **정본(빌더)과 파생(components.html 손편집 CSS)이 이미 갈라져 있다**는 사실 자체가 다음 단계에서 다뤄야 할 항목.
8. **Range 모드의 Hover 상태** — A-1 주석이 "회색 hover 로 덮지 않는다"고 명시하지만 그 대안(무엇을 hover 로 쓸지)은 "BACKLOG ③"로 미룬 채 미결.
9. **weekStart 가 PC 에도 동일 적용되는지의 최종 확인** — registry HD-9 는 "확정: weekStart=0(일요일), PC popover 동일"이라 적었지만, `buildCalendar`(A-3) 실제 코드의 요일 헤더는 `["월","화","수","목","금","토","일"]`로 **월요일 시작**이다 — **HD-9 문서 서술과 실제 빌더 코드가 불일치**(판단 아님, 관측된 불일치 사실).
10. **날짜 형식의 4자리 연도 서비스 변환 로직** — HD-10 이 "확정"이라 적었으나 구체 변환 규칙(YY↔YYYY 매핑 로직)은 어디에도 코드/문서로 없음.
11. **Mobile bottom sheet 의 트리거 부착/오프셋 규칙** — A-5 는 바텀시트 컴포넌트 자체 구조만 정의하고, 어떤 트리거 클릭이 이 시트를 여는지(모바일 Date Picker Open state 트리거와의 연결)는 코드에 없음(위 5번과 연관).

---

## 미확인 목록
- `CLOSE_ICON_SVG` 상수의 실제 SVG path 정의 위치 — build-components.ts 3300~4060 구간 밖(전역 상수로 추정, 이번 판독 범위 밖이라 값 미확인).
- `shadowEffects("shadow/dropdown")` 의 실제 수치(blur/offset/opacity) — vars-data.ts 의 shadow 그룹을 이번 판독에서 열지 않음.
- `fcIconPx()` 함수의 실제 반환값(트리거 아이콘 크기 계산식) — 정의부 미확인(build-components.ts 다른 구간).
- Figma MCP 인증 미완료로 Figma 원본(540:3794/4216/3836) 대조 렌더는 이번 판독에서 수행 못함 — 코드 주석상의 "원본 확인" 서술만 신뢰했다(코드 자체 실측 아님).
- `pages/components.html` 의 `setupDatePicker` JS(4419~4680줄) 내부 로직(Range 선택 처리, disabled-dates 파싱, 키보드 이동 등) 세부 — 이번 판독은 존재/부착 방식(정적 vs dist)만 확인했고 함수 내부 알고리즘 전수는 읽지 않음(질문 범위 밖으로 판단, 필요시 재요청).
- `registry/components/date-picker.json` 의 `figma.componentSetKey` 가 빈 문자열인 이유(다른 컴포넌트와 비교 안 함) — 단순 관측만, 원인 미확인.
