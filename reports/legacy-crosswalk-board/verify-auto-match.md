# 레거시 ↔ 정본 이름 자동 붙이기 — 독립 검증

- 검증자: 🤖 component-verifier (빌드자와 분리)
- 일자: 2026-09-17
- 대상: `scripts/legacy-name-resolve.js` (+ `scripts/lib/legacy-name-map.js`)
- 정본 대조처: `registry/components/component-facts.json` 의 `variantAxes` ·
  `plugins/figma-vars-installer/src/build-components.ts` · `reports/legacy-crosswalk-board/crosswalk.json`
- 판정: **FAIL** — 표본 10건은 전부 통과했으나, 조회기의 **자동추출 경로**에서 정본에 없는 이름 27건이 나온다.

## 1. 표본 대조 (요청 10건 + 시간선택 completed 추가 1건)

| # | 레거시 이름 | 물음 | 조회기 답 | 근거 | 정본 독립 확인 | 판정 |
|---|---|---|---|---|---|---|
| 1 | A:timepicker_input | --state selected | Time Picker · State=**Focus** | D-09 | `Time Picker.State = Default·Hover·**Focus**·Filled·Disabled` — Open 축값 자체가 없음 | ✅ |
| 2 | A:timepicker_input | --state completed | Time Picker · State=**Filled** | D-09 | 같은 축에 Filled 실재 | ✅ |
| 3 | A:datepicker_input | --state selected | Date Picker · State=**Open** | D-10 | `Date Picker.State = Default·Filled·**Open**·Disabled` | ✅ |
| 4 | A:select | --state selected | Select Box · State=**Open** | D-07 | `Select Box.State = Default·Hover·**Open**·Filled·Disabled` | ✅ |
| 5 | A:Login input | --size pc-sm | Input · Size=**XSM** · Break=**PC** | D-06 | 정본 실측 높이 PC XXSM 28 · **XSM 34** · MD 44 / Mobile MD 48. 결정 note 의 «pc-sm 34» 와 높이가 정확히 일치 | ✅ |
| 6 | A:chip | --size mobile | Chip · Size=**SM** · Break=**Mobile** | D-01 | `Chip.Size = SM·MD`, `Break = PC·Mobile`. SM/Mobile 조합 실측(높이 30) 존재 | ✅ |
| 7 | A:timepicker_select | — | **레거시에만 있음** | D-09 | 정본에 시·분 화살표 스테퍼 없음 — Time Picker(트리거)·Time Picker Dropdown(목록 패널)·Time Picker Cell(칸)·Time Picker Mobile Bottom Sheet 뿐. build-components.ts 에도 스테퍼 빌드 없음 | ✅ |
| 8 | B:radiobutton | --state pressed | Radio · State=**Selected** | D-22 | `Radio.State = Default·Hover·**Selected**·Disabled·Dis+Selected` | ✅ |
| 9 | B:tab | --state pressed | Line Tab · State=**Selected** | D-16 | `Line Tab.State = Unselected·Hover·**Selected**` | ✅ |
| 10 | B:form_elements | — | **배치 규칙(부품 아님)** · Input·Select Box·Radio·Date Picker·Text Area | D-19 | 5개 세트 모두 정본 실측표에 실재. 정본·registry·ui-library 에 form 컴포넌트 없음 | ✅ |
| 11 | B:menutree | — | **정본에 대응 없음** | 자동추출표 | 정본에 트리/사이드바 메뉴 세트 없음(GNB Sub Menu 는 상단바 아래 메가메뉴 패널, 접기·펼치기 트리가 아님). **단 근거가 river 결정이 아님** → ❓(c) | ✅ 사실 / ❓ 근거 |

**표본 ❌(a) = 0건.**

## 2. 결정 원문 대조 (절차 3단계)

- **D-09** — `quote2` = «셀렉티드는 시간 입력 드롭다운 또는 바텀시트가 나오는 상태고 컴플리트는 값 채워진 상태야 / (화살표 두 칸형) 옛 형태로 기록하고 만들지 않음» (river, 2026-09-17).
  기계 칸 `selected→Focus · completed→Filled` + `legacyOnly: timepicker_select` 와 **뜻이 같다.**
  river 가 말한 「열린 상태」를 정본 축값 Focus 로 옮긴 것은 ⭐ 의 해석이나, Time Picker 축에 Open 이 없어 후보가 Focus 뿐이고 근거(build-components.ts:1159-1160,1232 · time-picker.css:109)가 카드에 적혀 있다. 해석 타당.
- **D-19** — `quote2` = «배치 규칙(패턴)으로 분류» (river, 2026-09-17). 기계 칸 `kind: pattern` 과 **뜻이 같다.**
- 주의: D-09·D-19 의 첫 `quote` 는 결정이 아니라 **질문·요청문**이다(«…다시확인해서 검수할수있게 해줘», «…모호해서 논의 필요»). 결정은 `quote2`/`date2` 칸에 있다. `quote` 만 읽으면 근거 없는 매핑으로 오해하게 된다.

## 3. ❌(a) — 조회기 결함 (표본 밖, 전량 훑기에서 발견)

`--all` 126건 중 **붙음 88건 = 결정근거 61 + 자동추출근거 27**.
자동추출 경로(`confidence:"high"` + 결정 없음)는 정본 세트 이름 대신 **registry 파일 id** 를 답으로 낸다.

| 항목 | 내용 |
|---|---|
| **F1 · 정본에 없는 세트 이름 27건** | `button · checkbox · gnb · input · mobile-bottom-nav · modal · multi-toggle · pagination · radio · table · toggle` — 모두 `component-facts.json` 에 없는 이름. 예) `A:pc_button → button`(정본 `Button`), `A:radio → radio`(정본 `Radio`). 같은 정본 컴포넌트가 결정 경로에서는 `Radio`(B:radiobutton), 자동추출 경로에서는 `radio`(A:radio) 로 **두 이름**이 나온다. |
| **F2 · 정본에 없는 축 값** | `A:radio --state disabled-checked → State=disabledSelected` (정본 `Radio.State` 는 `Dis+Selected` — 대소문자 무시해도 없는 값) · `A:toggle --state on → State=on` (정본 `Toggle` 에 `State=on` 없음. `Pressed:[Off,On]` 과 `State:[Default,Disabled]` 로 **축 자체가 다름**) · `A:pc_button → State=hover · Size=md` (정본 `Hover` · `MD`). Figma 변형 값은 대소문자를 구분하므로 그대로 쓰면 어긋난다. |
| **F3 · Gate 52 구멍** | Gate 52 = `legacy-map-apply.js --check` 로 **결정(machine 칸) ↔ 표** 만 대조한다. 자동추출 경로는 검사 범위 밖이라 F1·F2 를 통과시키고, 통과 문구는 «정본에 없는 이름도 없습니다» 로 **범위보다 넓게** 단언한다(실행 exit 0 확인). 적대 시험 3종도 결정 경로만 찌른다. |

근거: `scripts/lib/legacy-name-map.js` 의 `validateMachine()` 은 `machine` 블록만 검사하고,
같은 파일 `resolve()` 의 자동추출 분기는 `hit.canonComponent` / `hit.stateMap` 값을 **검사 없이 그대로** 내보낸다.
이는 그 파일 머리말의 «③ 에 없는 정본 이름은 오류다(하드룰 H6②)» 와 정면으로 어긋난다.

## 4. ❓(c) — 사용자 확인 필요

- **C1 · `confidence:"none"` 을 «정본에 대응 없음» 이라고 단정해도 되나.** `B:menutree` 를 포함해 34건이 river 결정 없이 ⭐ 자동추출만으로 «정본에 대응 없음» 으로 답한다(`notes: []`). 표의 규칙은 `confidence:"decide"` 만 자동 대조에서 뺀다. 지시문 4-1 은 «결정 전이면 스스로 정하지 않는다» 이므로, 결정 없는 `none` 을 «정본에 대응 없음»(확정) 으로 낼지 «결정 전» 으로 낼지 결정이 필요하다. 참고: menutree 는 정본 실측표·build-components.ts 기준으로는 실제로 대응이 없다(`registry/components/nav.json` 은 `codeStatus: not-started` 로 정본 세트가 아님).

## 5. ⚠️ 조용한 실패 (절차 위험 — 고치지 않고 보고만)

| 증상 | 재현 | 왜 위험한가 |
|---|---|---|
| **축 값을 못 붙였는데 «붙음» 이라고 답한다** | `A:chip --state pressed` · `A:chip --state selected_pressed` · `A:select --state 없는값` · `A:Login input --size pc-xxsm` → 전부 `status: matched`, `axes: {}` | 「축을 안 물어봤다」와 「축 값이 결정 전이다」가 **출력에서 구분되지 않는다.** 레거시 chip 의 `pressed`·`selected_pressed` 는 실제로 매핑이 없는데도 «붙음» 으로 보인다. 지시문 4-1 이 요구하는 «결정 전 → (c)» 가 발동하지 못한다. |
| **같은 이름 여러 세트를 조용히 첫 것으로 고른다** | `tab` 은 A:540:6032 · B:1008:10175 · B:1008:10723 세 건. `--source` 없이 물으면 A 것이 나온다 | 이번 표본은 D-16 이 전부 같은 값이라 답이 일치했으나, 값이 갈리는 이름에서는 조용히 틀린다 |
| **note 가 물어본 축과 다른 축을 설명한다** | `A:timepicker_input --state completed` → note 는 «레거시 selected 는 …» | completed 를 물었는데 selected 설명이 붙어 오독을 부른다 |

## 6. 절차 자체 판정 (지시문 4-1 만 읽고 할 수 있었나)

**부분적으로만 가능했다.** 막힌 곳 2가지:

1. **`A:`/`B:` 접두사를 쓰라는 말이 없다.** 4-1 의 예시는 `"<레거시 이름>"` 뿐이라 접두사 없이 묻게 되는데, 같은 이름이 A·B 양쪽에 있는 세트(`tab` 등)에서 조용히 첫 것이 선택된다.
2. **축을 물었는데 답이 비어 와도 알 길이 없다.** 첫 시도에서 zsh 가 `$rest` 를 낱말로 쪼개지 않아 `--state selected` 가 한 덩어리로 전달됐고, 조회기는 오류 없이 `status: matched`, `axes: {}` 를 돌려줬다. 「축을 안 받았다」와 「축이 결정 전이다」가 같은 모양이라, 검증자가 **축 답을 통째로 잃고도 통과로 읽을 뻔했다.** 4-1 에 «축 플래그를 줬는데 `axes` 가 비면 답이 아니라 오류로 본다» 를 명시해야 한다.
3. 4-1 이 적어 둔 답은 5가지(붙음·배치 규칙·레거시에만 있음·정본에 대응 없음·결정 전)인데, 조회기에는 6번째 `unknown`(모름)이 있고, **「세트는 붙었으나 이 축 값은 결정 전」 이라는 답이 아예 없다.** 위 5절의 첫 증상이 여기서 나온다.

## 7. 기계검사

| 명령 | exit | 비고 |
|---|---|---|
| `node scripts/legacy-map-apply.js --check` (Gate 52 본체) | 0 | 결정↔표만 대조 — F1·F2 를 못 잡음 |
| `node scripts/legacy-map-selftest.js` | 0 | 적대 시험 3종, 모두 결정 경로 |

호출자가 §검증 입력 계약 ① 의 기계검사 표를 주지 않았으나, 이번 시나리오는 조회기 자체를 시험하는 일이라 검증자가 위 2건을 직접 실행해 종료코드를 기록했다.

## 8. 고치지 않은 것

지시대로 **어떤 파일도 수정하지 않았다.** F1·F2·F3 의 수정은 조회기/게이트 구현자 소관이다.
