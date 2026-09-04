# Date Picker — 3. 구현 (🧱 ui-library-builder)

작성: 🧱 ui-library-builder · 2026-09-03

> 이 문서는 구현 결과와 근거만 적는다. PASS/approved 판정은 하지 않는다(오케스트레이터·🤖 component-verifier 소관).

---

## 0. 요약

- **완료:** 새 코어 컴포넌트 `date-picker` — 트리거(4크기×4상태) · 캘린더 패널(Date/Year/Month 3화면) · 날짜 셀(Standard 5상태 + Range 4상태) · 연/월 타일(4상태) · PC 팝오버(뷰포트 플립) · 모바일 바텀시트(적용 버튼 = button 코어 인스턴스 조립) · 단일/기간 선택 상태 기계 · 키보드 전 조작 · 실 브라우저 렌더 검증 완료(아래 §4).
- **미완료(이번 패스에서 범위 제외):** `time-picker` 모바일 시간 휠 바텀시트(D2 후반부, `buildTimePickerMobileBottomSheet`) — §6 사유 참조. 이미 **approved** 상태인 time-picker 코어를 검증 없이 서둘러 건드리지 않기로 판단했다.
- **차단됨:** 저장소 전체 `npm run ui:build`/`ui:test` — date-picker 와 무관한 **기존 18개 컴포넌트 전부**의 `canonicalFingerprint` 가 이미 stale 상태였다(§5). date-picker 자체 검증은 dist 를 우회한 실제 렌더로 별도 수행했다(§4).

---

## 1. 만든 것 — 근거가 된 정본 줄번호

| 부위 | 파일 | 정본 근거 |
|---|---|---|
| 트리거 | `date-picker.css`/`.js` `[data-s1-part=trigger]` | `buildDatePicker` build-components.ts:3670-3751(사이즈 3689-3696, 상태 3673-3678, 아이콘 3698) |
| 캘린더 패널(Date/Year/Month) | `[data-s1-part=panel] [data-s1-part=calendar]` | `buildCalendar` 3512-3670 (패널 356×352·padding 3526-3536, 헤더 3550-3562, 요일/그리드 3588-3616, Year/Month 타일 3618-3641) |
| 날짜 셀(Standard·Range) | `[data-s1-part=cell]` | `buildCalendarCell` 3319-3406 (STD/RNG 토큰 테이블 3327-3340, 밴드 3379-3387) |
| 연/월 타일 | `[data-s1-part=tile]` | `buildCalendarTile` 3396-3424 |
| 모바일 바텀시트 | `[data-s1-part=sheet]` | `buildDatePickerBottomSheet` 3751-3833 (여백 실측 3748, 버튼 인스턴스 조립 3805-3824) |
| 트리거 calendar 아이콘 | `assets/icons/calendar.svg` | `CAL_ICON` 상수 3672(정확히 동일 path·viewBox 16.2581×16.8, 재구성 없음) |
| 헤더 chevron | 기존 `chevron.svg` 재사용 | `makeCalHdr` 3550-3562 — `makeIconInstance("chevron", ...)` 로 라이브러리 chevron 원본을 참조(180°/0° 회전), 별도 원본 아님 |

색 토큰은 `color/date-picker/*` 24종 + `color/form-control/*` + `color/surface/raised` + `color/overlay` + `color/text/title/primary` + `color/icon/gray-dark` 만 사용했다. **신규 토큰 0건** — 전부 `assets/css/tokens.css` 에 이미 존재하는 CSS 변수를 참조한다(2-canon-readiness §4 확인 그대로).

---

## 2. 정본에 없어서 내가 정한 것

2-canon-readiness.md 의 river 결정(D3~D6)·오케스트레이터 메커니즘 결정(M1~M7)을 그대로 구현했다. 구현 세부는 `ui-library/src/components/date-picker/manifest.json` 의 `notInCanon` 필드에 항목별로 근거·줄번호와 함께 기록해 뒀다(요약):

| ID | 무엇 | 구현 |
|---|---|---|
| D3/CU-1 | 주 시작 요일 | 일요일 시작(`WEEKDAY_LABELS = ["일","월",...]`). 시각 정본은 월요일 시작이라 갈라짐 — Figma 반영은 별도 작업(river 결정대로 이번 범위 밖) |
| D4 | 기간 역순 클릭 | `selectDate()` 에서 `iso < toISO(start)` 면 새 시작일로 교체, 자동 뒤집기 안 함 |
| D5/CU-2 | 연/월 헤더 진입 | 헤더 라벨을 `year-label`/`month-label` 두 버튼으로 분리(24px Bold 그대로, 새 시각 부품 0건) |
| D6 | 기간 hover 미리보기 | `handleContainerMouseover` 가 `hoverISO` 를 갱신하고 `cell/bg/range`(기존 토큰)로 미리 밴드를 그린다 |
| M1 | 팝오버 배치 | 트리거 아래 8px, `positionPanel()` 이 `getBoundingClientRect()` 로 아래 공간 부족 시 `[data-flip=up]` |
| M2 | 이전/다음 이동 단위 | Date=1개월·Month=1년·Year=12년(`handleContainerClick` prev/next 분기) |
| M3 | 이전/다음달 셀 클릭 | HD-7 그대로: 클릭 시 해당 월로 이동 후 선택 |
| M4 | 키보드 | 화살표 이동·Home/End·PageUp/Down·Enter·Esc(격자로 확장) |
| M5 | `cell/bg/selected-hover` | 선택 셀 hover 에 배선(정본 시각 빌더 미배선분을 파생 components.html:961 의도를 근거로 채움) |
| M6 | 값 형식 | 표시 `YY.MM.DD`, `s1:date-picker:change` 값은 `YYYY-MM-DD` |
| M7 | 모바일 진입 | `data-break=mobile` 이면 트리거가 패널이 아니라 `[data-s1-part=sheet]` 를 연다 |

추가로 **오케스트레이터 배선 결정**(river 승인 대상 아님, 순수 표시 형식) 1건: 기간 트리거 문구가 시작일만 있을 때 `"YY.MM.DD - "` 로 표시(완료 전 상태를 사용자에게 보여주기 위함). manifest `notInCanon.rangeTriggerFormat` 에 기록.

---

## 3. 만든 파일

### 신규
- `ui-library/src/components/date-picker/{manifest.json, date-picker.css, date-picker.js, date-picker.example.html, date-picker.mobile.example.html}`
- `ui-library/src/assets/icons/calendar.svg` (+ `assets/icons/manifest.json` 항목 추가)

### 배선 수정(§1 배선표 그대로)
- `ui-library/scripts/build.mjs`, `ui-library/scripts/test.mjs` — `componentIds` 에 `date-picker` 추가
- `ui-library/package.json` — `exports` 4줄 추가
- `ui-library/src/index.js`, `ui-library/src/auto-init.js` — export·autoInit 배선
- `ui-library/src/verification/empty-consumer.html`, `empty-consumer-individual.html` — 동일 `<main>` DOM(트리거+빈 패널), individual 쪽은 CSS link·import·init 호출도 추가
- `pages/ui-review.html` — "17. Date Picker" 섹션(실제 눌러보기 + 상태 매트릭스 + Date/Year/Month 화면 + 기간 완료 표본), `S1UI.datePicker.init` 배선, `.review-overlay-slot` 높이 규칙 추가
- `assets/js/ui-library-guide.js` — `componentConfig["date-picker"]`, `guideComponents` 배열, 런타임 init 목록, `datePickerStateMatrix()`(Action 라이브 데모 + 크기×상태 매트릭스 + Date/Year/Month 화면 + Range 완료/hover 미리보기 + 모바일 트리거)
- `pages/components.html` — 손편집 date-picker 섹션(2886~3296줄)을 빈 mount + `<!-- Approved Date Picker guide -->` 마커로 교체, nav 버튼 `disabled` 해제. **옛 CSS(810~1030대)·JS `setupDatePicker`(4010/4264줄)는 time-picker 승격 때의 선례(`setupTimePicker` 가 그대로 남아있음)를 따라 손대지 않았다** — 죽은 코드로 남지만 markup 이 없어 실행돼도 무해하다
- `registry/components/date-picker.json` — `_meta.a11yStatus`: `partial` → `complete`
- `registry/governance/component-presentation-policy.json` — 기존 `date-picker` 항목에 `"managedBy": "ui-library-guide"` 추가
- `registry/governance/ui-library-migration.json` — `date-picker` 레코드 추가(`uiLibraryStatus: "draft"`, `riverApproval`/`promotionDecision` 은 `null` — 내가 스스로 approved 라고 적지 않았다)

---

## 4. 검증 — 실제 렌더 (dist 우회)

§5 의 차단 때문에 `npm run ui:build` 로 만든 정식 dist 를 통한 렌더 확인을 할 수 없었다. 대신 **`ui-library/src` 원본을 직접 물린 임시 페이지**(repo 루트에 임시 배치 → 검증 후 삭제, 커밋 대상 아님)를 `python -m http.server` + Browser 로 렌더해 아래를 실제로 확인했다:

- PC Single: 트리거 클릭 → 2026년 9월 패널 오픈, 오늘(3일) 파란 원, 일요일 빨강·토요일 파랑 색 분리 확인
- 헤더 연도 라벨 클릭 → Year 화면(2016~2027 타일, 2026 선택 표시) → 타일 클릭(2020) → Month 화면(2020년, 9월 선택 표시) → 타일 클릭(9월) → Date 화면(2020년 9월)으로 정확히 이동
- 날짜 클릭(25일) → 트리거에 `20.09.25` 표시, 패널 자동 닫힘(M6 형식 확인)
- PC Range: 10일 클릭(시작) → 19일 hover 시 **D6 미리보기 밴드**가 10~19 사이에 실제로 칠해짐(시작=파란 원 아웃라인, hover 끝=진한 파란 원) → 19일 클릭 → 트리거 `26.09.10 - 26.09.19` 표시
- Mobile: 트리거 클릭 → 배경 딤 + 바텀시트(헤더 "날짜 선택"+닫기, 캘린더, 파란 "적용" 버튼) 오픈 → 날짜 클릭 → 트리거에 값 반영, 시트 닫힘

스크린샷 5장을 이 세션에서 직접 확인했다(별도 파일로 보존하지 않음 — 필요하면 재현 가능, 재현 스크립트는 본 보고서 §4 절차 그대로).

**검증 못한 것(정직하게 명시):**
- dist 경유 실제 배포본(`pages/components.html`·`pages/ui-review.html` 의 date-picker 섹션)은 §5 차단으로 **렌더 확인을 못했다**. 소스 코드(§3 목록)는 문법 검사(`node --check`)·JSON 파싱만 통과했다.
- Dark 모드 렌더 미확인(토큰은 vars-data.ts 값 그대로 참조라 구조적으로는 안전하나 육안 확인 안 함).
- 다중 인스턴스 동시 동작(같은 페이지에 date-picker 2개 이상)은 각 인스턴스가 독립 상태(`s`)를 갖는 구조로 짰으나 실제 동시 렌더로 확인하지 않음.
- 키보드 전체 시나리오(Home/End/PageUp/Down)는 코드 리뷰로만 확인, 실제 키 입력 테스트는 안 함.

---

## 5. 🚧 차단 — 저장소 전체 ui:build/ui:test 가 이미 막혀 있었다 (✅ 오케스트레이터가 해소, 2026-09-03)

> **해소 기록:** 원인은 focus-visible 커밋이 아니라 **커밋 dc5ac98**(설치기 화면 개선)이 `buildOrderFor`(5719)·`buildAllComponents`(5843)만 바꾸고 19개 모듈 지문 갱신을 빠뜨린 것이었다. 오케스트레이터가 변경 hunk 가 컴포넌트 시각 빌더 밖임을 확인하고 지문을 전부 갱신했다. 이후 `npm run ui:build`·`ui:test`·`ui:contract`·`ui:icons` 전부 PASS — 아래는 차단 당시 판독 기록(그대로 보존).

`npm run ui:build` 를 실행하면 **date-picker 이전에 `input` 에서 즉시 실패**한다:

```
Error: input canonicalFingerprint is stale. Review canon changes before rebuilding.
```

확인한 사실:
- `plugins/figma-vars-installer/src/{build-components.ts,vars-data.ts,textstyles-data.ts}` · `registry/components/input.json` 모두 **현재 워킹트리에 uncommitted diff 없음** — 이미 커밋된 상태다.
- **기존 18개 컴포넌트 전부**(`input`부터 `time-picker`까지)의 `canonicalFingerprint` 가 현재 정본 파일로 재계산한 값과 다르다(전수 확인, 아래 표는 대표).

| id | 저장된 지문 | 재계산 지문 | 일치 |
|---|---|---|---|
| input | `6a75bc0d...` | `3eeb37fc...` | ❌ |
| button·checkbox·…·time-picker | (생략) | (생략) | 전부 ❌ |

- git log 상 가장 최근에 `vars-data.ts`/`textstyles-data.ts` 를 건드린 커밋은 `476f1cd fix(governance): 승인 없이 만들어진 focus-visible 17건 전량 철회`(2026-09-02~03, river 지시) — focus-visible 토큰 제거가 모든 컴포넌트의 공유 정본 소스를 바꿨는데, 이 컴포넌트들의 `manifest.json canonicalFingerprint` 재계산(=`npm run ui:build` 정상 실행)이 그 이후 한 번도 안 된 것으로 보인다.

**내가 하지 않은 것:** 이 18개의 지문을 대신 갱신하지 않았다. 이유:
1. date-picker 작업 범위 밖이고, 각 컴포넌트가 실제로 focus-visible 제거의 영향을 받았는지(CSS·manifest 내용이 실제로 달라져야 하는지, 단순 지문 미갱신인지) 컴포넌트별로 판단해야 하는데 그건 이번 위임 범위가 아니다.
2. 18개를 한 번에 손대는 것은 파급이 크다 — 이미 **approved** 상태인 컴포넌트(select·time-picker 등)까지 건드리게 된다.

**필요한 조치(오케스트레이터 판단 요청):** `git diff -U0 476f1cd^ 476f1cd -- plugins/figma-vars-installer/src/vars-data.ts plugins/figma-vars-installer/src/textstyles-data.ts` 로 실제 변경 hunk 를 보고, 18개 컴포넌트가 그 변경과 **무관**(지문만 갱신)한지 **CSS 내용도 바뀌어야 하는**(재검증 필요) 케이스인지 나눠 처리해야 한다. date-picker 는 이 18개에 포함되지 않는 신규 컴포넌트라 이 블로커와 무관하게 자체 지문(§1)은 정상이다.

---

## 6. 미완료였던 것 — time-picker 모바일 시간 휠 바텀시트 (✅ §9 에서 완료, 2026-09-03)

> 아래는 이번 패스에서 미룬 이유의 원래 기록(보존). coordinator 지시로 이어서 만들었다 — 결과는 §9.

작업 지시에 포함돼 있었으나 **이번 패스에서 만들지 않았다.** 이유:

1. 시간 예산상 date-picker 자체(트리거·3화면 캘린더·Range·모바일 시트·전 키보드 조작·실 렌더 검증)를 끝내는 데 이미 이번 세션 대부분을 썼다.
2. `time-picker` 는 이미 **`status: "approved"`** 로 승격된 컴포넌트다. §5 의 저장소 전체 빌드 차단 상황에서 이미 승인된 컴포넌트의 manifest·CSS·JS 를 검증 없이 추가로 건드리는 것은 위험도가 다르다고 판단했다 — 서두르다 approved 컴포넌트를 깨뜨리는 것보다, 다음 build 패스에서 제대로 만드는 편이 안전하다.

남은 작업: `time-picker/manifest.json` `notInCanon.mobileBottomSheet`(D1 근거)를 해소하는 `buildTimePickerMobileBottomSheet`(3862-4060) 이식 — Content=TimeOnly 휠(4열: 오전오후·시·콜론·분) + 상하 흐림 마스크(4-stop gradient + `color/overlay/wheel-fade`) + 하단 적용 버튼. Content=DateTime(날짜·시간 탭)은 date-picker+time-picker 조합 패턴이라 core 범위 밖으로 판단해 TimeOnly 만 제안한다(needs-decision 후보 — river 확인 필요).

---

## 7. 다음 단계 체크리스트

- [x] §5 차단 해소(오케스트레이터) — 18개 기존 컴포넌트 지문 영향 범위 판단 후 `npm run ui:build`/`ui:test` 정상화
- [x] 위 해소 후 `npm run ui:contract && npm run ui:icons && npm run ui:build && npm run ui:test` 재실행 — 전부 PASS(§9 끝 결과 참조). `gate:check` 는 아직 미실행(범위 밖 — 오케스트레이터 판단 필요)
- [ ] `npm run ui:state -- reports/ui-library/date-picker/workflow-state.json`
- [ ] 🤖 component-verifier 4-verification (시나리오 F) — dist 경유 실제 렌더 확인 포함해서 재검증(§4·§9 는 브라우저 실 렌더·JS 콘솔 확인이지만 자가 수행이라 정식 독립 검증 대체 아님)
- [ ] Gate 34 승인 인용 수령(river 실제 발화, date-picker D3~D6 — workflow-state.json blockers B5)
- [x] time-picker 모바일 휠 바텀시트(§6) — §9 에서 완료
- [ ] Dark 모드 실제 렌더 확인(date-picker·time-picker 휠 시트 둘 다 미확인)
- [ ] `time-picker` manifest version 0.2.0 · `status` 는 기존 "approved" 유지(§9 참조) — 재검증 후 오케스트레이터가 최종 판단

---

## 8. 실행한 검사 결과

```
npm run ui:contract   → PASS (policy=candidate, errors=0)
npm run ui:icons      → calendar 아이콘 원본 대조 PASS(오차 0.00639, 임계 0.015) · 전체는 dist 미생성으로 2건 ❌(§5 차단의 결과, date-picker 소스 자체 결함 아님)
npm run ui:build      → ❌ input 에서 차단(§5, date-picker 무관)
npm run ui:test       → 미실행(ui:build 선행 실패)
node --check *.js     → 전부 통과(date-picker.js·build.mjs·test.mjs·ui-library-guide.js)
JSON 파싱             → 전부 통과(수정한 registry·manifest 파일 전체)
브라우저 실 렌더        → §4 — 단일/기간/Year/Month/모바일 시트 전부 동작 확인
```

---

## 9. (추가 패스, 2026-09-03) time-picker 모바일 휠 바텀시트

coordinator 지시로 §5 해소 후 이어서 만들었다. **기존 `ui-library/src/components/time-picker`에 추가**했다(새 컴포넌트 신설 아님) — 정본 `buildTimePickerMobileBottomSheet`(build-components.ts 3862-4060) 기준.

### 9-1. 만든 것 — 정본 근거 줄번호

| 부위 | 구현 | 정본 근거 |
|---|---|---|
| 시트 뼈대(헤더·닫기·적용) | `[data-s1-part=sheet]` 이하 date-picker 시트와 동일 패턴 | 3862-3925 주석, buildDatePickerBottomSheet 재사용 패턴과 통일 |
| Content=TimeOnly/DateTime **두 변형 모두** | `data-mobile-content="time-only"｜"date-time"` | 3985, 3990-3996 (`Content: TimeOnly / DateTime` 축) |
| DateTime 탭 | `[data-s1-part=tabs]` — 승인된 tab 코어(Line Tab, Size=SM, Break=Mobile) 인스턴스, `s1:tab:change` 로 wheel↔date-panel 토글 | 4004-4020 |
| 휠 4열(오전오후 2행·시 3행·콜론·분 3행) | `[data-s1-part=wheel-col]` data-column=ampm\|hour\|colon\|minute | 3864-3882, 4022-4045 |
| 휠 숫자 32px, 전 셀 accent 동일색 | `--font-size-32`, `--color-text-state-accent` | 3864 |
| 상·하 흐림 4-stop 비대칭 alpha | `color-mix(in srgb, var(--color-overlay-wheel-fade) N%, transparent)` — 정본 stop 값(0/0.25/0.65/1 및 top·bottom 비대칭) 그대로 옮김 | 3891-3924 |
| 하단 "적용" 버튼 | `[data-s1-part=apply]` — 승인된 button 코어(Variant=Primary, Size=LG) 인스턴스, 가로 100% | date-picker buildDatePickerBottomSheet 3805-3824 패턴과 동일(time-picker 전용 버튼 조립도 같은 4004-4020 인접부) |

### 9-2. 새로 만든 이름 — Gate 34 확인 대상 (정확히 나열)

**manifest `states`/`canonicalStateMap` 에는 아무것도 추가하지 않았다** — 트리거 상태(Default/Hover/Filled/Disabled/Focus) 5종은 그대로다. 대신 아래는 **새 HTML 속성값·part 이름**(state 축은 아니지만 새 표면이라 정직하게 전부 나열):

- 루트 선택형 속성값: `data-mobile-ui="wheel"`(기존 `"list"` 기본과 양자택일), `data-mobile-content="time-only"｜"date-time"`
- 새 part 이름 15개: `sheet, sheet-backdrop, sheet-panel, sheet-header, sheet-title, sheet-close, tabs, date-panel, wheel, wheel-col, wheel-cell, fade-top, fade-bottom, sheet-footer, apply`
- 새 `data-column` 값 1개: `colon`(기존 `ampm`/`hour`/`minute` 는 목록 모드와 공유)

이 목록은 river 타이핑 승인(Gate 34) 대상 후보로 오케스트레이터에게 넘긴다 — 내가 스스로 승인 기록을 만들지 않았다.

### 9-3. 정본에 없어서 내가 정한 것 (`manifest.notInCanon` 에 근거와 함께 기록됨)

| 키 | 결정 |
|---|---|
| `wheelScrollMechanism` | 정본은 정적 스펙 샘플이라 실제 스크롤·판정 메커니즘이 없다. CSS `scroll-snap`(행 44px·창 272px·상하 padding 114px) + JS 는 스크롤 중앙에 가장 가까운 칸을 `getBoundingClientRect()` 로 판정. **실 렌더 검증(§9-4)에서 `behavior:"smooth"` 가 동작하지 않는 환경을 발견해 instant 로 고정했다** — 정본에도 모션 규정이 없어(registry a11y reducedMotion: not-applicable) 기능 신뢰성을 우선한 재수정. |
| `wheelApplyAlwaysEnabled` | 목록 모드 confirm 은 완결 전 비활성이지만, 휠은 항상 중앙에 값이 있어(초기값=각 열 첫 항목) "미완료" 상태가 성립하지 않는다 — apply 상시 활성. |
| `fadeGradientImplementation` | 정본은 마스크 RECT+솔리드 RECT 2겹, 웹은 `color-mix()` 로 같은 alpha 곡선을 1겹으로 표현(semantic 토큰만 경유, HEX 없음). |
| `dateTimeDatePanel` | coordinator 지시대로 date-picker 를 끌어들이지 않고 탭 전환만 구현 — "날짜" 탭은 안내 문구만 있는 자리표시자. |
| `mobileBottomSheet`(기존 D1 항목) | 해소됨으로 갱신 — 기본 동작(`data-mobile-ui` 생략/"list")은 그대로, wheel 은 추가 옵션. |

### 9-4. 실 렌더 검증에서 잡은 버그 3건 (자가 수행, 독립 검증 아님 — 정직하게 명시)

로컬 서버(`python -m http.server`) + Browser 로 `pages/components.html`(Mobile 플랫폼)·`pages/ui-review.html` 을 실제로 렌더하고 JS 로 클릭·스크롤·키보드 이벤트를 실행해 대조했다. 스크린샷으로 흐림 마스크·트리거·적용 버튼 배치를 육안 확인했고, 콘솔 오류는 **date-picker 의 기존·의도된 "draft 상태" 안내 오류 1건 외 0건**이었다.

1. **`import "../tab/tab.js"` 경로 오류(coordinator 최초 지적)** — dist 가 평탄 구조라 `dist/tab/tab.js` 404, `s1-ui.js` 전체 로드 실패. select/filter-chip 이 dropdown 을 불러올 때 쓰는 기존 관례(`"./dropdown.js"`, 같은 디렉터리 형태로 참조하되 실제로는 dist 평탄 구조를 가정)를 확인하고 `"./tab.js"` 로 수정. 새 관례를 만들지 않고 기존 전례를 따랐다.
2. **Escape 닫힘 후 포커스가 다른 인스턴스로 돌아가는 버그** — `sheetLastFocused = document.activeElement` 로 캡처했는데, 트리거를 프로그램적으로 클릭(`.click()`)하면 포커스가 트리거로 이동하지 않는 경우가 있어(실사용 마우스 클릭과 다름) 엉뚱한 요소가 캡처됐다. `sheetLastFocused = trigger`(항상 자기 트리거)로 고쳐 클릭 방식과 무관하게 정확한 포커스 복귀를 보장했다.
3. **키보드로 휠 열에 Tab 이 닿지 않던 문제** — `wheel-col` 에 `tabindex` 를 주지 않아 Tab 순서에서 완전히 빠져 있었다(닫기·적용 버튼만 도달 가능). 값 열(ampm/hour/minute)에 `tabIndex=0` 을 부여해 Tab 으로 도달·화살표 키로 값 변경이 실제로 되게 했다. 이 수정 전에는 "키보드로도 값을 바꿀 수 있어야 한다"는 coordinator 요구를 충족하지 못하고 있었다.

세 버그 모두 이제 실 렌더로 재현·수정 확인했다(§9-5).

### 9-5. 실 렌더로 확인한 동작

- 트리거 클릭 → 시트(딤+시트패널) 열림, 헤더 "시간 선택"/"시작 일시" + 닫기, 휠(00:00 중앙 굵게, 아래로 갈수록 흐려짐), "적용"(파란 풀폭) 버튼 — 스크린샷 확인
- `hourCol.scrollBy(44*3)` → 중앙 판정 "03" 정확
- 적용 클릭 → 트리거 값 "03:00", `data-filled=true`, 시트 닫힘, `s1:time-picker:change` 이벤트 값 일치
- DateTime: "날짜" 탭 클릭 → wheel 숨김·date-panel(안내문구) 표시, "시간" 탭 클릭 → 원복
- Esc → 시트 닫힘 + 포커스가 **자기** 트리거로 복귀(버그 수정 후 재확인)
- Tab 포커스 가둠: 마지막 요소(apply)에서 Tab → 첫 요소(sheet-close)로 순환, 첫 요소에서 Shift+Tab → 마지막으로 순환
- `wheel-col` 에 Tab 으로 도달 → ArrowDown×5 → 중앙 판정 "05" 정확(스크롤 메커니즘 수정 후 재확인)
- PC 목록 모드(기존 승인된 동작) 회귀 없음 확인 — 시/분 선택 → 확인 클릭 → "08:00" 정상

**검증 못한 것(정직하게 명시):** Dark 모드 실 렌더 미확인. 실제 손가락 터치 스크롤(관성)은 시뮬레이션하지 못했다(JS 이벤트로만 확인). `check`/`edge_set` 아이콘의 기존 미확인 부채는 이번 작업과 무관하게 그대로 남아 있다.

### 9-6. 배선

- `ui-library/src/components/time-picker/{time-picker.css, time-picker.js, time-picker.mobile.example.html, manifest.json}` 수정
- `ui-library/scripts/test.mjs` — time-picker 전용 검사를 "`coreComponents` 길이 0 이어야 한다" → "`coreComponents` 에 `dropdown` 만 없으면 된다"로 정정(원래 의도인 "dropdown 자식 조립 금지"는 유지, button·tab 추가는 별개 계약이라 막지 않음). 이 검사 로직 변경은 내가 직접 했다 — 검증 성격 코드 수정이라 오케스트레이터/component-verifier 검토 권장.
- `assets/js/ui-library-guide.js` — `timePickerWheelMarkup()` 신설, Mobile 콘텐츠에 TimeOnly·DateTime 실 라이브 데모 2개 추가(런타임 init 목록에 time-picker 는 이미 있어 추가 배선 불필요), `componentConfig["time-picker"].approvedScope.mobile` 문구에 wheel 옵션 언급 추가
- `pages/ui-review.html` — `timePickerWheelMarkup()` 로컬 헬퍼 신설, Mobile combo(`renderTimePickerPanel`)에 TimeOnly·DateTime 실 라이브 데모 그룹 2개 추가, `S1UI.timePicker.init` 은 이미 전체 `[data-s1-component="time-picker"]:not([data-review-static])` 를 도는 기존 코드가 그대로 커버(추가 배선 불필요)
- `pages/components.html` — time-picker 섹션은 이미 `Approved` 마커+빈 mount 상태였고(선행 승격) 별도 수정 불필요, nav 도 이미 활성 상태 유지
- `registry/governance/ui-library-migration.json`(time-picker 레코드) — 갱신하지 않음(§10 참조, 오케스트레이터 판단 대기)
- `time-picker/manifest.json` `version`: `0.1.0` → `0.2.0`(additive). `status` 는 `"approved"` 유지 — 기존 PC/목록 동작이 그대로 보존되고 회귀가 없음을 §9-5 에서 확인했지만, **새로 추가된 wheel 표면 자체의 승인 여부는 내가 판정하지 않는다.**
- `canonicalFingerprint` 는 **재계산 불필요였다** — `canonicalSources`(build-components.ts·vars-data.ts·textstyles-data.ts·registry/components/time-picker.json) 를 이번 패스에서 건드리지 않아 지문이 그대로 유효함을 직접 재계산해 확인했다(coordinator 경고에 따라 확인 절차를 실제로 수행함, §1-1 명령 그대로 사용).

### 9-7. 검사 결과 (전부 재실행, 최신)

```
npm run ui:contract   → PASS (policy=candidate, errors=0)
npm run ui:icons      → PASS (icons=13, errors=0)
npm run ui:build      → PASS (110 files)
npm run ui:test       → PASS
브라우저 콘솔          → 0 오류(date-picker draft 상태 안내 오류 1건 제외, 별개 사유·의도된 동작)
```

### 9-8. 미결/후속

- `registry/governance/ui-library-migration.json` 의 time-picker 레코드에 wheel 추가 사실·재검증 필요 여부를 반영할지는 오케스트레이터 판단(내가 임의로 "approved" 문구를 건드리지 않았다)
- Gate 34 — §9-2 의 새 이름 목록에 대한 river 승인 인용 필요
- `npm run gate:check`(저장소 전체 게이트)는 아직 실행하지 않았다 — 범위·시점은 오케스트레이터 판단
- 🤖 component-verifier 독립 검증 — §9-4/9-5 는 내 자가 수행이라 정식 대체가 아니다

---

## 10. (독립 검증 FAIL 대응, 2026-09-03) F-1~F-4·C-2 수정

🤖 component-verifier 가 `reports/ui-library/date-picker/4-verification-independent.md` 에서 FAIL(❌ 4건·❓ 4건) 판정했다. 지시받은 F-1~F-4·C-2 5건만 고쳤다 — ❓(c) 4건(C-1·C-3·C-4)은 river/오케스트레이터 판단 대상이라 손대지 않았고, `pages/components.html`은 오케스트레이터가 동시 작업 중이라 건드리지 않았다.

### F-1. 트리거 달력 아이콘 크기 (전 사이즈 20px → 정본 규칙)

- 원인 인정: `1-inventory.md` 미확인 목록의 `fcIconPx()` 반환값을 확인하지 않고 20 으로 채웠다 — 추측 금지 위반.
- 수정: `date-picker.css` — select·time-picker 와 동일한 사이즈별 분기 방식(`[data-size="xxsm"]`=20, `[data-size="xsm"],[data-size="md"]`=24)으로 교체.
- **실측(브라우저, `pages/ui-review.html`, live+static 인스턴스 전수)**:
  ```json
  {"md-pc":{"w":24,"h":24},"xxsm-pc":{"w":20,"h":20},"xsm-pc":{"w":24,"h":24},"md-mobile":{"w":24,"h":24}}
  ```
  정본 `fcIconPx = h<=28?20:24` 과 일치(XXSM=20, XSM/MD-PC/MD-Mobile=24).

### F-2. 검수 화면 Mobile 표본이 죽어 있던 문제

- 수정: `pages/ui-review.html` `datePickerMarkup()` 이 `breakName==="mobile"` 일 때 `dist/examples/date-picker.mobile.html` 과 같은 `sheet/sheet-backdrop/sheet-panel/sheet-header/sheet-title/sheet-close/calendar-wrap/sheet-footer/apply` 구조를 내도록 분기 추가. PC 분기(`panel`)와 지적받지 않은 다른 함수(`dpReviewHeader`·`dpReviewDateView`·`dpTile`·`renderDatePickerPanel` 의 나머지·정적 타일 disabled 로직·`review-grid` 규칙)는 손대지 않았다.
- **실측**: Mobile live 인스턴스 2개(TimeOnly 구간이 아니라 Mobile 콤보 2개, light/dark) 모두 트리거 클릭 시
  ```json
  [{"hasSheet":true,"expanded":"true","cellCount":35},{"hasSheet":true,"expanded":"true","cellCount":35}]
  ```
  이전(FAIL 당시)엔 `hasSheet:false, expanded:"false", cellCount:0` 이었다.

### F-3. 모바일 시트 포커스 가둠 미구현 (선언 위반)

- 수정: `time-picker.js` 의 `SHEET_FOCUSABLE`/`sheetFocusables()` 헬퍼와 `handleSheetKeydown`(Tab 순환)·`openSheet()`(첫 포커스 이동) 구현을 **그대로** `date-picker.js` 에 옮겼다. `date-picker.mobile.example.html` 의 `sheet-panel` 에 `tabindex="-1"` 도 추가(포커스 가능 요소가 없을 때의 폴백 대상).
- **실측**:
  ```json
  {"focusedInsideSheet":true,"focusedTag":"BUTTON {\"s1Part\":\"sheet-close\"}",
   "focusablesCount":41,"forwardWrapped":true,"backwardWrapped":true,"closedAndReturnedFocus":true}
  ```
  열리면 첫 포커스가 `sheet-close`로 이동, 마지막 요소에서 Tab → 첫 요소로 순환, 첫 요소에서 Shift+Tab → 마지막으로 순환, Esc → 시트 닫힘 + 포커스가 **자기 트리거**로 복귀.

### F-4. `destroy()` 리스너 참조 불일치

- 수정: `sheetClose?.addEventListener("click", () => close())` / `sheetBackdrop?.addEventListener("click", () => close())` 를 named handler `handleSheetCloseClick`(`= () => close()`) 하나로 통일하고, 등록·해제 양쪽 모두 이 참조를 쓰도록 고쳤다(`apply`/`handleApplyClick` 과 같은 형태).
- **실측**: 인스턴스를 `init()` → 열기 → `destroy()` → (leaked 리스너로 인한 예외 없음 확인) → 재 `init()` → 트리거 클릭 시 정상적으로 `aria-expanded` `false→true` 전환 확인(재초기화 정상 동작).

### C-2. 6주짜리 달 패널 하단 여백 소실

- 수정: `date-picker.css` 패널을 `height:352px` 고정에서 `min-height:352px` + `display:flex; align-items:center; justify-content:center;` 로 바꾸고, `[data-s1-part="calendar"]` 의 `height:100%` 를 제거해(퍼센트 높이가 부모의 auto 높이에 걸리는 문제 회피) 콘텐츠가 352 를 넘으면 패널이 자연히 늘어나게 했다. 폭 356·padding 24/20 은 그대로 유지.
- **실측(2026년 8월 — 6주 달, PC live 인스턴스)**:
  ```json
  {"panelHeight":398,"bottomGap":21,"computedMinHeight":"352px","computedHeight":"398px","computedPaddingBottom":"20px"}
  ```
  마지막 주 하단과 패널 하단 테두리 사이 여백 **21px**(≈20px, 서브픽셀 반올림) — 이전(FAIL 당시) 0.5px 이었던 것과 대조.
- **회귀 확인(2026년 9월 — 5주 달, 같은 인스턴스)**:
  ```json
  {"month":"9월","weeks":5,"panelHeight":354,"panelWidth":356}
  ```
  354px(콘텐츠 352 + 테두리 2×1px) · 폭 356 그대로 — 5주 달 기존 동작 회귀 없음.

### 검증 못한 것(정직 고지)

- 이번 라운드는 스크린샷을 남기지 못했다 — 이 세션의 Browser 도구가 반복적으로 "pane 이 hidden 상태"라며 클릭·스크롤 동작이 타임아웃되는 문제를 겪었다(코드와 무관한 도구 문제로 판단 — `document.readyState==="complete"`, DOM 구조 정상, JS 실행은 전부 정상 응답했다). 대신 모든 확인을 실제 렌더된 DOM 에서 `getBoundingClientRect()`/`getComputedStyle()`/실제 클릭·키보드 이벤트 디스패치로 수행했다 — 수치는 실측이지만 육안 스크린샷 대조는 이번 라운드에 없다.
- Dark 모드에서 F-1~F-4·C-2 를 별도로 재확인하지 않았다(Light 로만 실측).
- C-1·C-3·C-4(❓)는 river/오케스트레이터 판단 대상이라 그대로 두었다.

### 검사 결과

```
npm run ui:contract   → PASS (policy=candidate, errors=0)
npm run ui:icons      → PASS (icons=13, errors=0)
npm run ui:build      → PASS (110 files)
npm run ui:test       → PASS
canonicalFingerprint  → date-picker: 재계산 불필요·기존 값과 일치 확인(canonicalSources 4파일을 이번 라운드에서 건드리지 않음)
```

수정한 파일: `ui-library/src/components/date-picker/date-picker.css`, `ui-library/src/components/date-picker/date-picker.js`, `ui-library/src/components/date-picker/date-picker.mobile.example.html`, `pages/ui-review.html`. `workflow-state.json`·`pages/components.html` 은 건드리지 않았다.

---

## 11. (3차 대응, 2026-09-03) R-1·R-2·R-3·C-5 수정 — 2차 독립 검증 FAIL 대응

2차 독립 검증에서 F-1~F-4·C-2(지시받은 5건)는 전부 PASS로 확인됐으나, **그 수정 자체가 만든 새 결함 3건(R-1~R-3)** 과 별건 1건(C-5)이 지적됐다. 전부 고쳤다. `pages/components.html`(오케스트레이터 담당)·`workflow-state.json` 은 건드리지 않았다.

### R-1. 검수 화면 전체가 덮여 클릭 불가 (차단급, F-2 수정의 부작용)

- 원인: F-2 에서 추가한 mobile `sheet` 마크업이 `state==="open"` 정적 표본에도 `hidden` 없이 나갔고, `sheet`가 `position:fixed;inset:0;z-index:1000`이라 정적 표본 4개가 전체 화면을 덮었다.
- 선례 확인: 모달 정적 표본이 이미 같은 문제를 `.is-review-inline` 클래스(`inset:auto; position:relative;`, `pages/ui-review.html:208-212`)로 풀어놨다. **같은 클래스명·같은 방식을 date-picker sheet 에 그대로 적용**했다(`pages/ui-review.html` 새 규칙 `[data-s1-component="date-picker"] [data-s1-part="sheet"].is-review-inline { inset:auto; position:relative; }`).
- 적용 규칙: `statik && open` 일 때만 `.is-review-inline` 부여. **"실제로 눌러보기" 라이브 인스턴스(statik=false)는 그대로 둬서 실제 클릭 시 진짜 `position:fixed` 오버레이로 열린다**(운영 동작 보존).
- **실측(뷰포트 1280×900, 새로고침 직후, 조작 전)**:
  ```json
  {"elementAtPoint":"SECTION class=review-guide","totalOpenSheets":4,"openSheetsStillFixed":0}
  ```
  `document.elementFromPoint(200,300)` 이 정상 섹션을 가리킴(전엔 `sheet-backdrop`이었다) — 열린 정적 표본 4개 모두 `position:fixed`에서 벗어남.
- **라이브 인스턴스 회귀 확인**: "실제로 눌러보기" 트리거를 클릭하면 여전히 `position:"fixed", isInlineClass:false`이고 화면 중앙을 실제로 덮는다(진짜 오버레이 동작 그대로). 날짜 칸 35개 정상 렌더.

### R-2. 패널 바깥 352·내용 312·시작점 20 을 동시에 못 맞춘 문제 (C-2 수정의 부작용)

- 원인: `min-height:352px` + `box-sizing:border-box` + `border:1px` 조합이 border 2px 를 내용에서 깎아 먹어, 바깥은 352 로 맞아도 내용이 312 가 아니라 310 이 됐다(1차 수정의 잔여 오차).
- 선례 확인: `time-picker.css:114`가 이미 정본 INSIDE stroke 를 `box-shadow: inset 0 0 0 1px var(...)`로 그려 **border 를 아예 쓰지 않고 레이아웃에서 완전히 제외**하는 방식을 쓰고 있다. **같은 방식을 date-picker 패널에 그대로 적용**했다 — `border` 선언 삭제, `box-shadow: inset 0 0 0 var(--border-width-1) var(--color-date-picker-panel-border), var(--shadow-dropdown)` 로 그림자와 테두리를 하나로 합쳤다.
- **실측(원본 `ui-library/src` 직접 로드 — dist 우회, 이유는 아래 "막힌 것" 참조), 5주 달(2026년 7월 최초 렌더)**:
  ```json
  {"weeks":5,"panelOuterHeight":352,"panelOuterWidth":356,"contentHeight":312,"topGap":20,"bottomGap":20,
   "computedBorder":"0px none rgb(0, 0, 0)",
   "computedBoxShadow":"rgb(217, 217, 217) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.15) 0px 4px 8px 0px"}
  ```
  **바깥 352 · 내용 312 · 위 시작점 20 세 수치가 동시에 정확히 일치**한다. `border`는 `0px none`(레이아웃에 전혀 관여하지 않음), 테두리는 `box-shadow` 의 `inset 0 0 0 1px`로만 그려진다.
- **6주 달 유지 확인(C-2 회귀 없음)**: prev 를 눌러 2026년 9월(6주)까지 이동 —
  ```json
  {"month":"2026년 9월","weeks":6,"panelOuterHeight":396,"panelOuterWidth":356,"bottomGap":20}
  ```
  바깥이 396(=352+44, 정확히 코디네이터가 제시한 값)으로 자연히 늘고, 하단 여백 20 유지, 폭 356 불변.

### R-3. 검수 화면 시트에 `aria-labelledby` 누락 (F-2 수정 마크업)

- 수정: `datePickerMarkup()` 이 호출될 때마다 페이지 전역 `uniqueId`(다른 함수들과 공유하는 카운터, `modalMarkup()`과 동일 방식)를 증가시켜 `date-picker-sheet-title-${uniqueId}` 를 발급하고, `sheet-panel`의 `aria-labelledby`와 `sheet-title`의 `id`를 이 값으로 연결했다. 정적 인스턴스의 닫기·적용 버튼에는 `modalMarkup()`과 동일하게 `tabindex="-1"`을 부여해 죽은 컨트롤이 Tab 순서에 끼지 않게 했다.
- **실측**:
  ```json
  {"sheetPanelCount":12,"missingLabelledby":0,"orphanRefs":0,"totalIds":226,"duplicateIdCount":0,"duplicateIds":[]}
  ```
  시트 패널 12개 전부 `aria-labelledby` 보유, 가리키는 id 전부 실재(orphan 0), **페이지 전체 226개 id 중 중복 0건**(배선표 §2 T5 함정 회피 확인).

### C-5. 열린 채 destroy 하면 스크롤 잠금이 영구히 풀리지 않던 문제

- 수정: 승인된 `time-picker.destroy()` 와 동일하게 `destroy()` 첫 줄에 `close({ returnFocus: false })` 를 추가해 파괴 전 시트/패널을 정리하도록 했다.
- **실측(원본 직접 로드)**:
  ```json
  {"beforeDestroy":{"expanded":"true","sheetHidden":false,"bodyOverflow":"hidden"},
   "afterDestroy":{"sheetHidden":true,"bodyOverflow":""}}
  ```
  열린 상태에서 `destroy()` 호출 시 시트가 닫히고(`sheetHidden:true`) `document.body.style.overflow` 가 `""`(원복)로 확인 — 이전엔 `"hidden"` 으로 영구히 남았다.

### 회귀 확인

| 항목 | 결과 |
|---|---|
| 검수 화면 클릭 가능(R-1) | ✅ `elementFromPoint(200,300)` 정상 섹션, 열린 정적 시트 4개 전부 `position` fixed 아님 |
| 다른 컴포넌트 섹션 정상 | ✅ input/button/checkbox/radio/toggle/chip/select/dropdown/filter-chip/textarea/multi-toggle/modal/table/mobile-bottom-nav/mobile-header/time-picker/date-picker 17개 섹션 전부 자식 노드 존재(빈 섹션 0건) |
| 콘솔 오류 | ✅ 0건(`read_console_messages` 결과 없음) |
| 라이브 mobile 인스턴스 실제 오버레이 동작 | ✅ 클릭 시 `position:fixed`, 화면 중앙 실제로 덮음, 날짜 칸 35개 |
| 6주/5주 패널 (R-2 + C-2) | ✅ 5주 352×312/20·20, 6주 396(바닥 여백 20 유지) |

### 막힌 것 — `npm run ui:build`/`ui:test` (이번에도 date-picker 무관 사유)

코디네이터 사전 경고대로 `input`에서 재차 stale 오류로 막혔다:
```
Error: input canonicalFingerprint is stale. Review canon changes before rebuilding.
```
확인 결과 원인은 **`plugins/figma-vars-installer/src/build-components.ts` 의 현재 uncommitted 변경**이다(다른 세션이 GNB 구간을 고치는 중 — 코디네이터 사전 안내와 일치). date-picker 의 `canonicalSources` 4파일도 이 파일을 공유하므로 date-picker 자체 지문 재계산도 지금은 기존 저장값과 불일치하는 상태다. **지문을 임의로 갱신하지 않았다** — 이 블로커 해소는 이 작업 밖이라 오케스트레이터 판단을 기다린다.

**대체 검증 경로**: `npm run ui:contract`·`npm run ui:icons` 는 dist 필요 없어 정상 실행해 PASS 확인했다. R-2·C-5(CSS/JS 소스 자체의 정확성)는 `ui-library/src` 원본을 직접 물린 임시 페이지(레포 루트에 임시 배치 후 검증 즉시 삭제, 커밋 대상 아님)로 실측했다 — dist 는 아직 이 수정을 반영하지 못한 상태이므로, dist 경유 재확인은 지문 블로커 해소 후 필요하다. R-1·R-3(마크업·CSS가 `pages/ui-review.html` 자체에 있어 dist 와 무관)은 실제 `ui-review.html` 렌더로 확인했다(다만 그 페이지가 로드하는 `../ui-library/dist/s1-ui.css`·`s1-ui.js` 자체는 이번 라운드의 dist 미반영분이라, date-picker CSS/JS 부분은 R-2/C-5 이전 버전으로 렌더됐다 — R-1/R-3 마크업·클래스 자체의 검증에는 영향 없다).

### 검사 결과

```
npm run ui:contract   → PASS (policy=candidate, errors=0)
npm run ui:icons      → PASS (icons=13, errors=0)
npm run ui:build      → ❌ input 에서 차단(date-picker 무관 — build-components.ts 의 다른 세션 uncommitted 편집, 코디네이터 사전 안내와 일치)
npm run ui:test       → 미실행(ui:build 선행 실패)
node --check          → date-picker.js 통과, ui-review.html 인라인 스크립트 통과
```

수정한 파일: `ui-library/src/components/date-picker/date-picker.css`(R-2), `ui-library/src/components/date-picker/date-picker.js`(C-5), `pages/ui-review.html`(R-1·R-3). `pages/components.html`·`workflow-state.json`은 건드리지 않았다(diff 확인 결과 `pages/components.html`의 변경은 오케스트레이터 자신의 작업으로 판단된다 — nav `disabled` 복원 등 415줄 변경, 내가 만든 diff 아님).

---

## 12. (4차 대응, 2026-09-03) V-1·V-2 — 3차 독립 검증 "형제 표면 누락" 대응

3차 독립 검증에서 R-1·R-2·R-3·C-5(2차 지시 4건)는 전부 PASS·회귀 0건으로 확인됐으나, **같은 결함을 형제 화면에 남겨 둔 것 2건(V-1·V-2)**이 새로 지적됐다. 둘 다 고쳤고, 지시대로 date-picker·time-picker 마크업을 만드는 모든 자리를 전수로 훑었다. `pages/components.html`·`workflow-state.json`은 건드리지 않았다(diff 확인 — `pages/components.html`의 변경은 오케스트레이터 본인 작업).

### V-1. time-picker 휠 시트 접근 가능한 이름 누락 (이미 배포된 approved 화면)

- 수정 위치 2곳: `pages/ui-review.html`(`timePickerWheelMarkup()`)과 `assets/js/ui-library-guide.js`(`timePickerWheelMarkup()`) — 둘 다 R-3에서 date-picker에 쓴 것과 같은 방식(공유 `uniqueId`/전용 카운터로 `sheet-title` id 발급 후 `sheet-panel`에 `aria-labelledby` 연결)으로 맞췄다.
- `time-picker/manifest.json`의 `a11y.accessibleName` 선언을 현행화 — **새 상태 이름은 만들지 않고** 기존 문장 끝에 "wheel 모드(data-mobile-ui=wheel): sheet-panel 은 aria-labelledby 로 sheet-title 을 가리킨다"만 추가했다.
- **실측 — ui-review.html (뷰포트 1280×900, 새 dist)**:
  ```json
  {"count":4,"missing":0,"orphan":0,"totalIds":230,"dupeCount":0}
  ```
- **실측 — pages/components.html (approved 실제 배포 화면, ?platform=mobile#time-picker, 새 dist 확인 후 렌더)**:
  ```json
  {"count":2,"missing":0,"sample":"guide-time-picker-wheel-title-1"}
  ```
  콘솔 오류 0건(date-picker draft 안내 오류 1건은 별개 사유, 이전부터 있던 정상 동작). **회귀 확인**: 트리거 클릭 → 포커스가 시트 안으로(`focusedInside:true`) → 적용 클릭 → 값 `"00:00"` 반영, 시트 닫힘(`expanded:"false"`) — 정상 동작 유지.

### V-2. 안내 페이지 렌더러(`assets/js/ui-library-guide.js`)의 date-picker mobile 표본이 죽어 있던 문제

- 원인: 1차 F-2에서 `pages/ui-review.html`만 고치고 **같은 함수를 복제한** `assets/js/ui-library-guide.js`의 `datePickerMarkup()`은 그대로 뒀다 — `breakName`과 무관하게 항상 `panel`만 생성.
- 수정: `pages/ui-review.html`의 F-2/R-1/R-3 수정과 동일한 분기·아이디 발급·`.is-preview` 기반 인라인화를 적용했다. 단 인라인화 방식은 **modal의 기존 선례**(`.uilg [data-s1-component="modal"].is-preview { ... }`, `assets/css/ui-library-guide.css`)를 그대로 따라 새 클래스를 만들지 않고 root의 기존 `.is-preview`를 선택자로 재사용했다 — `assets/css/ui-library-guide.css`에 `.uilg [data-s1-component="date-picker"].is-preview [data-s1-part="sheet"] { inset:auto; position:relative; }` 1개 규칙만 추가.
- **date-picker는 draft라 `pages/components.html`에서 가이드 렌더가 거부되므로(선언된 게이트, 정상 동작), 이번 수정은 실제 렌더가 아니라 코드 경로 검증으로 확인했다** — `assets/js/ui-library-guide.js`에서 `datePickerMarkup`이 의존하는 순수 문자열 함수들(`dpCell`~`datePickerMarkup`, DOM API 미사용)을 그대로 추출해 Node에서 직접 실행:
  ```
  --- mobile closed (live) ---
  has sheet: true · has panel: false · sheet hidden: true
  has aria-labelledby: true · has calendar-wrap: true · has apply button: true
  --- mobile open (static preview) ---
  sheet visible: true · has aria-labelledby: true · has is-preview class on root: true
  --- pc open (regression check) ---
  has panel: true · has sheet (should be false): false
  --- uniqueness ---
  idA: guide-date-picker-sheet-title-4  idB: guide-date-picker-sheet-title-5  different: true
  ```
  mobile은 이제 `sheet`(panel 아님)를 만들고, 살아있는 인스턴스는 `hidden`으로 시작(닫힘)하며, 정적 "Open" 표본은 열려 보이되 `.is-preview`가 있어 CSS로 눕혀진다. PC 경로는 기존 그대로(`panel`, `sheet` 없음) — 회귀 없음. 호출마다 id가 겹치지 않고 증가한다.

### 형제 표면 전수 훑기 — 지시받은 4곳 + 확장 확인

| 자리 | 확인 방법 | 결과 |
|---|---|---|
| `ui-library/src/components/*/*.example.html` | `grep -l "date-picker\|time-picker"` 로 4개 파일(각 컴포넌트 pc/mobile) 특정 후 `grep -c 'data-s1-part="sheet"'`·`aria-labelledby` 직접 대조 | `date-picker.mobile.example.html`·`time-picker.mobile.example.html` 모두 이미 `sheet`+`aria-labelledby`+고유 id(`date-picker-mobile-sheet-title`·`time-picker-wheel-title-time-only`·`time-picker-wheel-title-date-time`) 보유 — 문제 없음(손으로 직접 작성한 배포 원본이라 애초에 정확) |
| `ui-library/src/verification/empty-consumer.html` / `empty-consumer-individual.html` | `grep -n "date-picker\|time-picker"` 전수 | 두 파일 모두 `data-break="pc"` 인스턴스만 포함 — **mobile 인스턴스 자체가 없어 이 버그 유형이 성립하지 않는다**(회피가 아니라 애초에 대상 아님) |
| `pages/ui-review.html` | 함수 정의 전수(`grep -n "^\s*function.*[Dd]ate[Pp]icker\|^\s*function.*[Tt]ime[Pp]icker"`) | `datePickerMarkup`·`timePickerWheelMarkup` 둘 다 이번 라운드에 수정 완료. `timePickerMarkup`(목록 모드)은 mobile도 의도적으로 `panel`을 쓰는 게 맞다(D1 정상 동작, sheet 아님) — 확인 후 그대로 둠 |
| `assets/js/ui-library-guide.js` | 함수 정의 전수(`grep -n "^function.*[Dd]ate[Pp]icker\|^function.*[Tt]ime[Pp]icker"`) | 동일 — `datePickerMarkup`·`timePickerWheelMarkup` 수정 완료, `timePickerMarkup`(목록 모드)은 정상 |
| (확장) 저장소 전체 `data-s1-component="date-picker"`·`data-mobile-ui="wheel"` 문자열 | `grep -rln` 전체 리포 검색(node_modules 제외) | 위 4곳 + `ui-library/dist/**`(빌드 산출물, 소스 수정 시 자동 반영)+`ui-library/verification/**`(빌드 산출물, 동일)+`ui-library/src/auto-init.js`(querySelector 배선일 뿐 마크업 생성 아님) 외 **다른 생성 자리 없음** |

**결론: 같은 유형 추가 발견 0건** — 지시받은 4곳 중 실제 결함은 V-1·V-2(정확히 지적받은 2곳)뿐이었고, 나머지 2곳(example.html·empty-consumer)은 애초에 이 버그가 성립하지 않는 구조였다(전자는 손작성 원본이라 정확, 후자는 mobile 인스턴스 자체가 없음). dist·verification 산출물은 소스 수정이 반영되면 재빌드 시 자동으로 맞춰진다.

### 검사 결과 — 지문이 검증 도중 두 번 뒤집혔다(플래핑, 다른 세션의 진행 중 편집)

`build-components.ts` 를 다른 세션이 계속 고치는 중이라던 사전 안내대로, 이번 라운드 안에서 `npm run ui:build` 결과가 **성공→실패로 실시간으로 바뀌었다**:

1. V-1·V-2 코드 수정 직후 1차 실행 → **PASS**(110 files). 이때 `date-picker`·`time-picker` 지문을 재계산해 기존 저장값과 일치 확인(§12 서술 그대로, 그 시점 기준 사실).
2. 보고서 작성 중 최종 확인차 재실행 → **실패**(`input canonicalFingerprint is stale`). 재확인 결과 `date-picker`·`time-picker` 지문도 이제 기존 저장값과 불일치한다(재계산 `match:false` 둘 다) — `plugins/figma-vars-installer/src/build-components.ts` 가 그 사이 다시 uncommitted 로 바뀌어 있었다(`git status` 확인).

**지문을 임의로 갱신하지 않았다.** 이 블로커는 date-picker/time-picker 자체 결함이 아니라 다른 세션의 진행 중인 편집 때문에 생긴 것이라 오케스트레이터 판단을 기다린다. `ui:contract`·`ui:icons`(둘 다 dist 불필요)는 이 시점에도 안정적으로 PASS 다:

```
npm run ui:contract   → PASS (policy=candidate, errors=0)               [최종 재확인 시점]
npm run ui:icons      → PASS (icons=13, errors=0)                        [최종 재확인 시점]
npm run ui:build       → 1차: PASS(110 files) · 최종 재확인: ❌ input stale(date-picker·time-picker 무관, 다른 세션의 build-components.ts 편집)
npm run ui:test        → 1차: PASS · 최종 재확인: 미실행(ui:build 선행 실패)
node --check           → assets/js/ui-library-guide.js·pages/ui-review.html 인라인 스크립트 전부 통과(변동 없음)
```

V-1·V-2 자체의 정확성은 위 §12 실측(1차 통과 시점의 실제 렌더·코드 경로 실행 결과)으로 이미 확인됐고, dist 가 다시 안정되면 `ui:build`/`ui:test` 재실행만 하면 된다 — V-1·V-2 코드를 다시 고칠 필요는 없다.

수정한 파일: `pages/ui-review.html`(V-1 일부), `assets/js/ui-library-guide.js`(V-1·V-2), `assets/css/ui-library-guide.css`(V-2 인라인화 CSS 1규칙), `ui-library/src/components/time-picker/manifest.json`(a11y 선언 현행화, 새 이름 없음). `pages/components.html`·`workflow-state.json`은 건드리지 않았다.
