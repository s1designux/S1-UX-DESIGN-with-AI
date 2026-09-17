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

---

# 2차 검증 (수정 후) — 델타 재검증

- 검증자: 🤖 component-verifier · 2026-09-17
- 대상 변경: `8ed8d43` (`scripts/lib/legacy-name-map.js` +204/−70 · `scripts/legacy-map-apply.js` · `scripts/legacy-map-selftest.js` · `scripts/legacy-name-resolve.js` · `registry/governance/legacy-name-baseline.json` 신설 · `.claude/agents/component-verifier.md`)
- **판정: FAIL** — F1·F2 는 실제로 고쳐졌다. 그러나 **❌ 2건**이 남는다(하나는 이번 수정이 새로 만든 것).

## A. 표본 10건 회귀 — ✅ 전부 그대로

| 레거시 | 1차 답 | 2차 답 | 회귀 |
|---|---|---|---|
| A:timepicker_input --state selected | Time Picker · State=Focus | 동일 | ✅ |
| A:timepicker_input --state completed | Time Picker · State=Filled | 동일 | ✅ |
| A:datepicker_input --state selected | Date Picker · State=Open | 동일 | ✅ |
| A:select --state selected | Select Box · State=Open | 동일 | ✅ |
| A:Login input --size pc-sm | Input · Size=XSM · Break=PC | 동일 | ✅ |
| A:chip --size mobile | Chip · Size=SM · Break=Mobile | 동일 | ✅ |
| A:timepicker_select | 레거시에만 있음 | 동일 | ✅ |
| B:radiobutton --state pressed | Radio · State=Selected | 동일 | ✅ |
| B:tab --state pressed | Line Tab · State=Selected | 동일 | ✅ |
| B:form_elements | 배치 규칙 | 동일 | ✅ |
| B:menutree | 정본에 대응 없음 | 동일 + «사람이 정한 바는 없습니다» 추가 | ✅ |

## B. 고쳤다는 주장별 판정

| # | 주장 | 판정 | 확인한 것 |
|---|---|---|---|
| **F1** | 파일 id → 정본 세트 이름 | **✅ 고쳐짐** | `A:pc_button → Button (State=Hover · Size=MD)` · `A:radio → Radio` · `A:toggle --state on → Toggle (Pressed=On)`. 전량 126건 재훑기: 정본 실측표에 없는 이름 **0건**, 소문자 파일 id 모양 **0건**(1차 27건) |
| **F2** | 정본에 없는 축 값은 안 내보낸다 | **✅ 고쳐짐** | `A:radio --state disabled-checked` → `partial` + «표에 적힌 "disabledSelected" 가 정본 "Radio" 의 축 값에 없습니다». `A:toggle --state on` 이 **틀린 축(State)이 아니라 정본 축 Pressed** 로 감. 전량 축 질의 338건에서 **낸 축 값 220개 전부 정본 글자 그대로**, 어긋남 0 |
| **F3 ①** | 동결 목록이 실제 부채와 맞나 | **✅ 허수 없음** | 독립 재계산: 실제 부채 33건(고유 30) · **동결됐지만 실제 부채가 아닌 것 0건** · **실제 부채인데 동결 안 된 것 0건**. 검사를 무력화하려고 부풀린 흔적 없음 |
| **F3 ②** | 적대 시험 4종 | **✅** | `legacy:selftest` exit 0, 4종 모두 잡음(자동추출 시험 신설분 포함) |
| **F3 ③** | 새 어긋남을 넣으면 막는가 | **❌ 일부 뚫림** | 아래 §C-1 |
| **F3 ④** | 통과 문구가 범위를 정확히 말하나 | **✅ (숫자 불일치 있음)** | 문구는 «새로 생긴 이름 어긋남 0건 (옛 부채 N건은 동결…조회기가 답으로 쓰지 않습니다)» 로 범위를 정확히 말한다. 다만 **문구는 30건, 파일 `_meta.count` 는 33건** — 같은 것을 두 숫자로 말한다(§C-1 과 같은 원인) |
| **조용 ① partial** | 못 붙이면 partial + 사유 | **⚠️ 구현됐으나 과잉교정 ❌** | 아래 §C-2 |
| **조용 ② ambiguous** | 이름 겹치면 되묻기 | **⚠️ 절반만** | 아래 §C-3 |
| **조용 ③ 메모 분리** | `메모(D-xx)` 표기 | **✅** | `A:timepicker_input --state completed` 의 D-09 설명이 답과 분리돼 `메모(D-09):` 로 붙는다 |
| **절차 4-1** | 지시문 보강 | **✅ (단서 있음)** | 접두사 필수·빈 축은 오류·«대응 없음»도 (c) 가 모두 들어갔다. 다만 §C-3 때문에 «접두사를 붙이면 갈리지 않는다» 는 약속이 실제로는 보장되지 않는다 |

## C. ❌ 남은 결함

### C-1 ❌ 래칫이 이름 겹치는 세트에서 새 어긋남을 통과시킨다

동결 키가 `출처:세트이름::표이름::레거시값` 이라 **노드 id 가 빠져 있다.** 같은 파일에 같은 이름의 세트가 둘이면 키가 겹친다.

- 실제로 겹치고 있다: `B:dialog::sizeMap::md|lg|xl` 이 두 줄에서 나와 **items 33개 = 고유 키 30개**(그래서 문구 30 · 파일 33).
- 적대 시험(임시 사본, 실제 파일 무수정):
  - **시험 A** — 동결 목록에 없는 새 키(`A:pc_button sizeMap huge→GIGANTIC`) → ❌ 로 **막았다** (exit 1) ✅
  - **시험 C** — 같은 이름 줄을 하나 더 만들어 **이미 동결된 키와 같은 키**로 새 어긋남(`A:radio stateMap disabled-checked → 아무도모르는없는값ZZZ`) → **✅ 통과, exit 0** ❌ 막지 못함
- 지금 이름이 겹치는 실제 짝: `B:dialog`×2 · `B:tab`×2 · `B:table`×2 · `A:mobile_bottomsheet`×2.
- **완화 요소:** F2 가 살아 있어 조회기는 그 값을 답으로 내지 않고 `partial` 로 답한다. 잘못된 이름이 새어 나가지는 않으나, **래칫이 «새로 생긴 것 0건» 이라고 말할 때 그 말이 참이 아닐 수 있다.**

### C-2 ❌ 결정이 있는 세트에서 표에 있는 값을 «결정된 바 없습니다» 라고 답한다 (이번 수정이 만든 것)

`resolve()` 는 결정(`machine.axisMap`)이 있으면 **그 결정만 보고, 같은 줄의 `stateMap`/`sizeMap`/`variantMap` 은 보지 않는다.**
그 결과 표에 canon 으로 이어지는 값이 멀쩡히 있는데도 «결정된 바 없습니다» 라고 답한다.

```
A:chip --state default   → Chip  ⚠ State=default — 이 값이 무엇에 해당하는지 결정된 바 없습니다   (근거 D-01)
   실제 표: A:chip stateMap {"default":"default", ...} · 정본 Chip.State 에 Default 실재
A:select --state default → Select Box ⚠ 결정된 바 없습니다  (표: default→default · 정본에 Default 실재)
A:mobile_button --state pressed → Button ⚠ 결정된 바 없습니다 (표: pressed→pressed · 정본에 Pressed 실재)
```

- 규모: **114건 · 34개 레거시 세트** (`A:chip`·`A:select`·`A:datepicker_input`·`A:timepicker_input`·`A:tab`·`B:radiobutton` 등 **이번 표본 세트 대부분 포함**). 표값조차 정본에 없어 «결정 전» 이 정당한 것은 5건뿐이다.
- 1차 때와 비교: 옛 코드는 같은 경우 **조용히 빈 축 + «붙음»** 이었다. 즉 **조용한 거짓 → 시끄러운 거짓**으로 바뀌었을 뿐 답은 여전히 틀렸다.
- 왜 나쁜가: `legacy-map-apply.js` 는 결정의 axisMap 을 **표 안에 써 넣는 것**이 일인데(표가 결정의 상위집합), 조회기가 그 표를 안 읽는다. 보강된 원칙 4-1 이 «축이 비면 (c)로 올려라» 이므로, 이 상태로는 **이미 답이 정해진 114건이 river 에게 결정 요청으로 올라간다.**

### C-3 ⚠️ ambiguous 가 같은 파일 안 중복은 못 잡는다 — 실제 중복은 전부 같은 파일이다

`resolve()` 의 되묻기 조건은 `if (!source && hits.length > 1)` 이다. **접두사를 주면 검사 자체를 건너뛴다.**

- 적대 시험 D(임시 사본): 같은 `A:radio` 를 서로 다른 정본 부품으로 갈라 놓자 —
  - 접두사 없이 `radio` → ✅ «이름이 겹침» 으로 되물음 (의도대로 동작)
  - 접두사 붙여 `A:radio` → ❌ **조용히 첫 것(Checkbox)** 을 고름. 1차에서 지적한 그 실패 그대로.
- 되묻기 문구도 어긋난다: 둘 다 A 파일인데 «같은 이름이 **A·A** 양쪽에 있고… 어느 **파일**인지 밝혀 주세요» 라고 안내한다. 접두사로는 풀 수 없는 상황을 접두사로 풀라고 말한다.
- 현재 실데이터의 중복 4짝(`B:dialog`·`B:tab`·`B:table`·`A:mobile_bottomsheet`)은 **모두 같은 파일 안** 중복이라, 이 가드가 지금 잡을 수 있는 중복은 **0건**이다. 오늘은 넷 다 같은 정본으로 붙어 답이 갈리지 않으나, 하나라도 갈리면 조용히 틀린다.

## D. 사소한 것 (❌ 아님)

- 자동추출 경로 출력에 `· Button` 같은 줄이 머리글과 겹쳐 한 번 더 찍힌다(보기만 지저분).
- `legacy-name-baseline.json` 의 `_meta.count: 33` 과 게이트 문구 «30건» 이 다르다(C-1 과 같은 원인).

## E. 기계검사 재확인 (종료코드만)

| 명령 | 호출자 주장 | 검증자 재확인 |
|---|---|---|
| `node scripts/legacy-map-apply.js --check` | exit 0 | ✅ exit 0 |
| `node scripts/legacy-map-selftest.js` (`npm run legacy:selftest`) | exit 0 · 4종 | ✅ exit 0 · 4종 |
| `npm run gate:check` | PASS · 56게이트 · 93건 · warning 17 | ✅ PASS · 게이트 56개 · 93건 · warning 17 |

## F. 이번에 재확인하지 않은 것 (직전 PASS 승계)

- 1차 §2 의 **결정 원문 대조**(D-09·D-19 의 `quote2` ↔ 기계 칸 뜻 일치) — `crosswalk.json` 은 이번 커밋에서 바뀌지 않았다. **이번에 재확인하지 않음.**
- 1차 §4 의 **C1(«정본에 대응 없음» 34건의 근거가 river 결정이 아님)** — 여전히 미결(커밋의 HD-1). 답 문구에 «사람이 정한 바는 없습니다» 가 붙고 4-1 이 «(c)로 올려라» 로 보강돼 **위험은 줄었으나 결정 자체는 그대로 열려 있다.**

## G. 고치지 않은 것

지시대로 **어떤 파일도 수정하지 않았다.** 적대 시험은 전부 임시 폴더의 사본(`S1_LEGACY_MAP` 환경변수)으로 했고 저장소 파일은 건드리지 않았다(`git status` 깨끗).

---

# 3차 검증 (2차 ❌ 수정 후) — 델타 재검증

- 검증자: 🤖 component-verifier · 2026-09-17
- 대상 변경: `6349464` (`scripts/lib/legacy-name-map.js` · `scripts/legacy-map-apply.js` · `scripts/legacy-map-selftest.js` · `scripts/legacy-name-resolve.js` · `registry/governance/legacy-name-baseline.json` 재동결)
- **판정: PASS** — 2차의 ❌ 2건(C-1·C-2)과 ⚠️ C-3·D 가 모두 실제로 닫혔다. **❌(a) 0건.**
  남은 것은 ❓(c) 1건(자동추출만으로 «대응 없음» 이라 답하는 34건 — 1차부터 열려 있는 HD-1)과, **호출자 주장 1건의 표현이 사실과 다른 것**(§C).

## A. 회귀 — ✅ 전부 그대로 (값 변동 0)

1차 표본 10건 + 2차 F1·F2 항목을 재실행한 결과 **모든 답·축 값·근거가 1·2차와 글자 그대로 같다.**

| 질의 | 답 | 근거 |
|---|---|---|
| A:timepicker_input --state selected / completed | Time Picker · State=Focus / Filled | D-09 |
| A:datepicker_input --state selected | Date Picker · State=Open | D-10 |
| A:select --state selected | Select Box · State=Open | D-07 |
| A:Login input --size pc-sm | Input · Size=XSM · Break=PC | D-06 |
| A:chip --size mobile | Chip · Size=SM · Break=Mobile | D-01 |
| A:timepicker_select | 레거시에만 있음 | D-09 |
| B:radiobutton --state pressed | Radio · State=Selected | D-22 |
| B:tab --state pressed | Line Tab · State=Selected | D-16 |
| B:form_elements | 배치 규칙 · 5세트 | D-19 |
| B:menutree | 정본에 대응 없음 | 자동추출표 |
| A:pc_button --state hover --size medium | Button · State=Hover · Size=MD | 자동추출표 |
| A:radio / A:toggle --state on / --state disabled | Radio / Toggle · Pressed=On / State=Disabled | 자동추출표 |

## B. 고쳤다는 주장별 판정 — 전부 ✅

| # | 주장 | 판정 | 직접 확인한 것 |
|---|---|---|---|
| **C-2** | 결정에 없는 축은 같은 줄의 표를 마저 본다 | **✅ 고쳐짐** | `A:chip --state default → Chip(State=Default)` · `A:select --state default → Select Box(State=Default)` · `A:mobile_button --state pressed → Button(State=Pressed)` · `A:chip --size pc-md → Chip(Size=MD)`. **전수 재계산: 338건 중 붙음 307 · 결정 전 22** — 호출자 숫자와 일치 |
| **C-2 (반대 방향)** | 표에 있다고 아무거나 갖다 붙이지 않는다 | **✅** | 전수에서 **정본에 없는 축 값을 답으로 낸 것 0건**. `A:radio --state disabled-checked` 는 여전히 partial + «표에 적힌 "disabledSelected" 가 정본 "Radio" 의 축 값에 없습니다». 표에 아예 없는 값(`A:chip --state pressed` · `A:select --state 없는값` · `A:Login input --size pc-xxsm`)도 partial 유지 |
| **C-1** | 동결 키에 노드 id · 재동결 33건 | **✅ 고쳐짐** | **2차에서 뚫렸던 시험 C 재실행 → 이번엔 exit 1 로 막았다**(«A:radio stateMap "disabled-checked" → "아무도모르는없는값ZZZ" … 새로 생긴 것»). 동결 목록 재감사: items 33 · **고유 키 33**(2차엔 33/30) · **33/33 전부 노드 id 포함** · **허수 0건** · **미동결 0건** |
| **C-3** | 되묻기가 접두사와 무관 · `--id` 로 고르기 | **✅ 고쳐짐** | 시험 D 재실행: 접두사 없이도, **`A:radio` 처럼 접두사를 붙여도** 조용히 첫 것을 고르지 않고 되묻는다. 안내 문구도 «같은 이름의 세트가 **A 파일 안에 2개** 있고… 노드 id 중 하나를 `--id` 로» 로 정확해졌다. `--id 999:8888 → Checkbox` · `--id 540:3113 → Radio` 로 실제로 갈라 고를 수 있다 |
| **D** | 후보 줄은 되묻기일 때만 · 숫자 통일 | **✅** | 평상시 답(`A:pc_button`)에 `· Button` 중복 줄이 사라졌다. 게이트 문구 «옛 부채 **33**건» 과 파일 `_meta.count: 33` · items 33 · 고유 33 이 **모두 일치** |
| **그물** | 적대 5종 + 회귀 5종 | **✅ 진짜로 잡는다** | 임시 사본에서 `A:chip default` 와 `A:toggle on` 의 답을 일부러 틀리게 만들자 **회귀 시험이 2/5 를 ❌ 로 잡고 exit 1**. 받은 답까지 함께 찍어 준다. 적대 시험에는 2차 지적분(«같은 이름 줄이 하나 더 있을 때 이미 동결된 칸으로 들어오는 새 어긋남»)이 신설돼 있다 |

## C. 호출자 주장 중 표현이 사실과 다른 것 (❌ 아님 · 기록용)

> 「«결정 전» 으로 남는 것이 **동결된 옛 부채뿐**인지 확인하라」 — **아니다. 22건 중 11건은 동결 목록에 없다.**

원인은 하나다: **검사기는 「그 부품이 거느린 정본 세트 전부」에서 값을 찾고, 조회기는 「답으로 고른 한 세트」에서만 찾는다.**

```
A:pc_grid-table_body --state hover
   표 부품 "table" = Table + Table Cell   (Hover 는 Table Cell 의 Variant 축에 있다)
   조회기가 고른 세트 = Table (Size 축뿐) → partial
   검사기 = "Table Cell 에 있으니 부채 아님" → 동결 목록에 없음
```

같은 모양 11건: `A:pc_grid-table_header`·`A:pc_grid-table_body`·`A:pc_embeded-table_body`·`B:table` (Table↔Table Cell) · `A:pagination_number`·`B:page_arrow` (Pagination↔Pagination Cell) · `B:m_combobox_time` (표는 time-picker 인데 D-20 결정이 Select Box 로 보냄).

- **잘못된 답이 새어 나가지는 않는다** — 전부 정직하게 `partial` 이고, 정본에 없는 값을 낸 것은 0건이다. 그래서 ❌(a) 로 올리지 않는다.
- 다만 **게이트의 «부채 0건» 과 조회기의 «결정 전» 이 서로 다른 것을 세고 있다.** 부수적으로, 표의 `canonComponent` 와 결정이 가리키는 세트가 다른 줄이 **15건** 있는데(모달→Modal Content · 콤보→Select Box+Dropdown 등, 대부분 결정이 더 정밀한 정상 경우) 이 어긋남을 보는 검사가 없다.
- 이것은 이번 수정이 만든 것이 아니라 2차에도 같은 11건이 119건 안에 섞여 있던 것이다. **회귀 아님.**

## D. 남은 ❓(c) — 1차부터 열려 있음

- **C1/HD-1** — 자동추출만으로 «정본에 대응 없음» 이라 답하는 34건(`B:menutree` 포함). 답에 «사람이 정한 바는 없습니다» 가 붙고 원칙 4-1 이 «(c)로 올려라» 로 보강돼 위험은 줄었으나, **결정 자체는 여전히 river 대기.** 이번에 재확인하지 않음(변경 없음).

## E. 기계검사 재확인 (종료코드만)

| 명령 | 호출자 주장 | 검증자 재확인 |
|---|---|---|
| `node scripts/legacy-map-apply.js --check` | exit 0 · 옛 부채 33건 동결 | ✅ exit 0 · 문구도 «33건» |
| `node scripts/legacy-map-selftest.js` | exit 0 · 적대 5종 · 회귀 5종 | ✅ exit 0 · 5+5 · **일부러 틀린 사본에선 exit 1** |
| `npm run gate:check` | PASS · 게이트 56개 · 93건 · warning 17 | ✅ 동일 |

## F. 이번에 재확인하지 않은 것 (직전 PASS 승계)

- 1차 §2 **결정 원문 대조**(D-09·D-19 `quote2` ↔ 기계 칸) — `crosswalk.json` 무변경. **이번에 재확인하지 않음.**
- 1차 §1 표본 10건의 **정본 실측표 대조**(축 값이 `component-facts.json` 에 실재하는지) — `component-facts.json` 무변경이고 답도 글자 그대로 같아 승계. 답 자체는 A 에서 재실행해 동일함을 확인했다.

## G. 고치지 않은 것

**어떤 파일도 수정하지 않았다.** 적대 시험 4종(C-1 재현·C-3 재현·회귀 찌르기·전수 재계산)은 전부 임시 폴더 사본 + `S1_LEGACY_MAP` 환경변수로 했고, 저장소는 `git status` 깨끗하다.
