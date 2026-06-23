# 2-plan.md — Calendar Cell/Tile 설치기 컴포넌트화 + Date Picker 통합

**목표:** 설치기 생성기(`plugins/figma-vars-installer/src/build-components.ts`)에 **Calendar Cell·Calendar Tile** 컴포넌트 세트를 신설하고, **buildCalendar·buildCalendarPanel(Date Picker)** 가 그 인스턴스로 날짜/연월 그리드를 구성하게 리팩터링한다. 출력 순서: **Date Picker 아래에 Calendar Cell → Calendar Tile**.

## V2.4 원본 스펙 (정밀 추출, fileKey yE5UCFEbmXJBlYJWB24Lz2 · 540:4167 cell / 540:4209 tile)

### Calendar Cell — 44×44, axes `Type={Standard,Range}, State`
구조: 44×44 outer(center) > [Range만: Rectangle 밴드] + inner Frame 30×30 cornerRadius 999 > 숫자 텍스트(16, Selected=Bold 흰색, 그 외 Medium).
| Type=Standard | inner fill | inner stroke | 숫자색 |
|---|---|---|---|
| Default | bg/today | bg/today | text/secondary(#353535) |
| Today | bg/today | border/today | text/today(blue) |
| Selected | bg/selected | bg/selected | **흰색(text/on-selected)** |
| Disabled | bg/today | bg/today | text/disabled(#C4C4C4) |

| Type=Range | 밴드(Rectangle) | inner circle | 숫자색 |
|---|---|---|---|
| Default | 44×30 bg/range | 30 bg/range | text/secondary |
| Start | **우측 22×30** bg/range | 30 fill bg/today + stroke border/today | text/today(blue) |
| End | **좌측 22×30** bg/range | 30 fill bg/selected + stroke border/today | 흰색(text/on-selected) |
| Disabled | 44×30 bg/range | 30 bg/range | text/disabled |

### Calendar Tile — 88×56 cornerRadius 4, axis `State={Default,Selected,Disabled}`
구조: 88×56 frame(center) > 라벨 텍스트(16 Medium). **root frame 의 fill/stroke 를 V2.4 에서 추가로 읽을 것**(detail 추출 시 root 누락됨).
| State | bg | border | 텍스트 |
|---|---|---|---|
| Default | tile/bg/default(white) | tile/border/default(gray/200) | text/body/primary(#202020) |
| Selected | tile/bg/selected | (V2.4 확인) | text/today(blue) |
| Disabled | tile/bg/disabled(gray/100) | tile/border/disabled | text/disabled(#C4C4C4) |

## 토큰 매핑 (V2.4 변수 id → 생성기 vars-data date-picker 토큰)
- 6918:2 → `color/date-picker/bg/range` · 6918:3 → `bg/today` · 6918:4 → `bg/selected` · 6918:5 → `border/today`
- 6918:6 → `tile/bg/default` · 6918:7 → `tile/bg/selected` · (disabled/border ids: vars-data에서 `color/date-picker/tile/bg/disabled`·`tile/border/default`·`tile/border/disabled` 사용)
- 텍스트: 6918:6345 → `text/secondary` · 6918:6346 → `text/today`(블루, =selected stroke 텍스트) · 6918:6347 → **흰 텍스트**(vars-data 에 `color/date-picker/text/on-selected` 류 있는지 확인, 없으면 needs-decision) · 6918:6348 → `text/disabled` · 6918:6349 → 타일 기본 `color/text/body/primary`
- **반드시 vars-data.ts 의 실제 date-picker 토큰 이름을 grep 해 정확히 바인딩**(raw hex 금지). 없는 토큰은 needs-decision 로 보고(임의 생성 금지).

## 리팩터링 (소비자가 셀/타일 인스턴스 사용)
1. **buildCalendarCell(maps)** / **buildCalendarTile(maps)**: 위 스펙대로 COMPONENT_SET 생성, `BUILT_SETS["Calendar Cell"]`·`BUILT_SETS["Calendar Tile"]` + 각 variant 를 `BUILT_COMPS["CalendarCell:Standard:Default"]` 등으로 등록. **숫자/라벨 텍스트는 인스턴스에서 override** 하도록 텍스트 레이어 이름 통일(예 `num`/`label`).
2. **buildCalendar** State=Date 의 day 루프: raw `dayCell` 대신 `BUILT_COMPS` 의 Calendar Cell variant 인스턴스 생성 후 숫자 텍스트 override. (other-month 날짜 = Standard/Disabled 로 매핑하거나, 필요하면 Standard 에 Other 상태 추가 — V2.4엔 없으므로 Disabled 매핑 권장, 보고). State=Year/Month 타일 루프: `makeYMTile` 대신 Calendar Tile 인스턴스.
3. **buildCalendarPanel**(Date Picker Open): day 그리드를 동일하게 Calendar Cell 인스턴스로.
4. 기존 `makeYMTile`/raw dayCell 코드는 셀/타일 컴포넌트로 대체(중복 제거).

## 순서 (빌드 vs 레이아웃 분리)
- **빌드 의존성**: Calendar Cell/Tile 은 Calendar·Date Picker 가 인스턴스로 쓰므로 **먼저 빌드**돼야 함. → buildCalendar/buildDatePicker 가 `getOrBuildCalendarCell/Tile`(있으면 캐시 반환, 없으면 빌드) 를 호출하는 **lazy-build** 로 구현.
- **레이아웃 위치**: CATEGORIES Form members 에 **Date Picker 뒤**로 `"Calendar Cell", "Calendar Tile"` 추가(현재: …"Calendar","Date Picker","Time Picker Dropdown"… → …"Calendar","Date Picker","Calendar Cell","Calendar Tile","Time Picker Dropdown"…). 이들의 registry 함수는 **이미 빌드된 세트를 해당 oy 로 재배치 + decorateSetFlat/buildSpec 스펙** 적용.
- 결과: Date Picker 가 셀/타일을 인스턴스로 사용(빌드 선행) + 출력은 Date Picker 아래에 셀/타일.

## 검증/게이트
- `installer:check`(tsc)·`components:keycheck`(신규 동적 키 누락 0)·`components:anatomy`·`components:iconpolicy` 통과.
- 신규 BUILT_COMPS 키가 vars-data 토큰만 참조(keycheck). raw hex 0.
- 합격 판정 금지 → component-verifier(Gate 13 §D) 분리 검증.

## needs-decision 후보
- date-picker 흰 텍스트(on-selected) 토큰 부재 시 / tile selected border 색 V2.4 불명확 시 / other-month 매핑.
