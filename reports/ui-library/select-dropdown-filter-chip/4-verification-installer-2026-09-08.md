# 🤖 원본대조 검증 에이전트(component-verifier) — 시나리오 D 판정 보고서

- 대상: `plugins/figma-vars-installer/src/build-components.ts` 구조 변경 (드롭다운 옵션 말줄임) + 부수 `scripts/lib/figma-build-mock.js`
- 근거 규칙: 하드룰 H1② · Gate 13
- 검증일: 2026-09-08 · 검증자: 🤖 component-verifier (빌드 주체 ⭐ 와 분리)
- **결론: ✅ PASS** — ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 · 🟡(개선/범위 밖) 3건

---

## 0. 기계검사 재실행 (위조 방지 — 종료코드만 확인)

| 명령 | 종료코드 | 요약 |
|---|---|---|
| `npm run installer:check` (tsc) | 0 | 타입 오류 0 |
| `npm run components:keycheck` | 0 | scv 키 누락 0 (color 150/172 · number 8/79) |
| `npm run components:anatomy` | 0 | 8개 규칙 충족 |
| `npm run components:iconpolicy` | 0 | 위반 0 |

---

## 1. (A) 정본 충실성 — 「행 폭을 채우고 한 줄로 말줄임」이 실제로 성립하는가

대상: `build-components.ts` fillRow, 1653–1658행.

| 확인 항목 | 결과 | 근거 |
|---|---|---|
| 4속성 조합의 의미 | ✅ | `layoutGrow=1`(행 주축 잔여폭 흡수) + `textAutoResize="HEIGHT"`(폭은 레이아웃이, 높이는 내용이) + `maxLines=1` + `textTruncation="ENDING"`(1줄 넘으면 … ) = 「폭 채움 + 한 줄 말줄임」. 조합에 모순 없음 |
| 속성 설정 **순서** | ✅(주의 1건) | `maxLines`·`textTruncation` 은 `textAutoResize="HEIGHT"` **뒤에** 설정됐다 — 이 순서가 맞다(auto-width 텍스트에 maxLines 를 걸면 Figma 가 거부한다). 다만 `layoutGrow` 만 `textAutoResize` **앞에** 있다 → 아래 🟡-1 |
| 옵션 행이 고정 폭인가 | ✅ | `host.primaryAxisSizingMode="FIXED"` + `host.resize(140, rowH)` (1610·1612행). 폭이 hug 면 말줄임이 영원히 안 걸리는데, 그 함정에 빠지지 않았다 |
| 체크박스가 찌그러지지 않는가 | ✅ | 체크박스는 INSTANCE(고정 18px) 또는 `box.resize(18,18)` 프레임이고 `layoutGrow` 를 받지 않는다. auto-layout 에서 grow 는 **한 자식이 잔여 공간만** 가져가므로 형제를 압축하지 않는다. 폭 산수: 140 − padding(12+12) = 116 → 체크박스 18 + gap 8 = 26 → 라벨 90px (양수). Text 유형은 itemSpacing 0 → 라벨 116px |
| 구분선(Checkbox+All) 유형 | ✅ | 내용 행은 `row` 프레임에 fillRow 가 적용되고 `layoutAlign="STRETCH"` 로 comp 폭 140 을 그대로 받는다. 폭 계산 동일 |
| 패널(Dropdown) 안에서 폭 축소 시 | ✅ | 패널은 `resize(140, 4*sz.h+8)` 에 padding 4 → 줄은 132px 로 STRETCH. grow 라벨이 흡수하므로 삐져나감 없음(종전 hug 텍스트보다 오히려 안전) |
| 27개 라벨 노드 전수 적용 | ✅ | 지문 대조에서 신·구 행이 **정확히 10개씩** 교체(중복 제거 후 distinct = 3사이즈{12/14/14} × {옵션×3상태 + 전체선택×2} = 10). 빠진 variant 0 |
| 웹 결과와 같은가 | ✅ | 웹은 `min-width:0 + overflow:hidden + text-overflow:ellipsis + white-space:nowrap`(dropdown.css 100–104행). 정본의 4속성과 시각 결과 동치. 체크박스 보호도 웹 `flex:0 0 auto` ↔ 정본 grow 미부여로 대응 |

### 🟡-1 (개선 권고, 차단 아님) — `layoutGrow` 를 `textAutoResize` 뒤로 옮기는 편이 안전하다
1654–1655행이 `layoutGrow=1` → `textAutoResize="HEIGHT"` 순서다. Figma 는 auto-width(WIDTH_AND_HEIGHT) 텍스트에 폭 관련 설정을 걸면 까다롭게 군다.
**차단하지 않는 이유:** 같은 파일 996행(`textNode.layoutGrow = 1;` 을 auto-width 텍스트에 걸고 appendChild)이 이미 실제 캔버스에서 동작하는 것으로 확인된 선례다(Password Field river 승인 2026-09-07). 즉 이 순서가 실패한다는 근거가 없다. 다만 새 코드는 `textAutoResize` 를 먼저 두면 선례에 의존하지 않아도 된다.
**한계 명시:** 시나리오 D 는 코드 레벨 검증이다 — **실제 Figma 캔버스에 설치해 육안으로 확인하지 않았다.** 순서 위험은 코드 논리로만 판단했다.

---

## 2. (B) 회귀 — 드롭다운 밖이 바뀌지 않았는가

`scripts/lib/installer-fingerprint.js` 로 **HEAD vs 현재 작업트리** 지문을 실제로 생성해 비교했다.

| 지표 | HEAD | 현재 | 판정 |
|---|---|---|---|
| 노드 수 | 4,809 | 4,809 | 동일 — 노드 신설·삭제 0 |
| 컴포넌트 세트 수 | 46 | 46 | 동일 |
| 세트 이름 목록 | — | — | **완전 일치** |
| 토큰(변수+텍스트스타일) | 489 | 489 | **차이 0건** — 새 토큰·값 변경 없음 |
| 시각 사양 행 | 1,885 | 1,885 | 총량 동일 |
| **바뀐 행** | **HEAD 전용 10 / 현재 전용 10** | | 아래 |

바뀐 10행은 **전부** TEXT 노드이고, 전부 `characters=옵션` 또는 `characters=전체 선택` + `fills=color/dropdown/option/label/{default,hover,selected}` 다. 즉 **Dropdown List 의 옵션 글자뿐**이다.

```
- (HEAD) TEXT | characters=옵션;fills=color/dropdown/option/label/default;…;fontSize=12
+ (현재) TEXT | characters=옵션;fills=color/dropdown/option/label/default;…;fontSize=12;
              layoutGrow=1;maxLines=1;textAutoResize=HEIGHT;textTruncation=ENDING
```

- **Time Picker Dropdown 회귀 없음** — Time Picker 는 `buildTimePickerCell`(2531행, `color/…/opt/*` 토큰)로 별도 노드를 그리며 fillRow 를 타지 않는다. 지문 diff 에도 등장하지 않았다.
- **Select Box / Filter Chip / Dropdown 패널** — 인스턴스로 Dropdown List 를 참조할 뿐 자체 사양 행은 변하지 않았다.
- `buildFilterChip`·`buildDropdownList` 의 주석 추가는 지문에 영향 0(설계상 주석은 지문에서 제외).

---

## 3. (C) 검사기 약화 여부 — PROP_CLASS 등록이 검사를 무르게 만들었나

**약화 아님. 코드 독해 + 실측 양쪽으로 확인했다.**

1. **분류 값의 실제 효과:** `installer-fingerprint.js` 의 `specRows()` 는
   `PROP_CLASS[p] === 'VISUAL' || PROP_CLASS[p] === 'LAYOUT'` 으로 거른다.
   → **VISUAL 과 LAYOUT 은 완전히 동등하게 지문에 들어간다.** 둘 중 무엇을 골라도 엄격도 차이가 없다.
   지문에서 빠지는 것은 `IGNORED`(x·y)와 미등록(=예외로 빌드 중단)뿐이다. 이번 등록은 **포함 쪽**이다.
2. **실측 확인(한 형태만 시험하지 않기):** 위 (B) 의 지문 diff 결과에 `maxLines=1`·`textTruncation=ENDING` 이 **실제로 행에 찍혀 있다.** 등록이 속성을 숨긴 게 아니라 감시 대상에 넣었음이 데이터로 증명된다. 만약 `IGNORED` 로 등록했다면 이 행들은 HEAD 와 동일하게 나왔을 것이고, 그것이 곧 약화였다.
3. **분류 라벨의 타당성:** 말줄임·최대 줄 수는 화면에 보이는 글자 자체를 바꾸므로 VISUAL 이 맞다. 같은 파일의 선례 `textAutoResize`(역시 크기 거동이지만 VISUAL)와도 일관된다. LAYOUT 으로 옮겨도 결과는 동일하므로 재분류 요구 없음.
4. **미등록이었다면:** `fingerprint()` 가 "빌더가 처음 보는 시각 속성" 예외로 **중단**한다(약화가 아니라 차단). 등록은 그 차단을 해제한 것이지 검사 항목을 줄인 것이 아니다.

### 🟡-2 (구조적 관찰, 차단 아님)
Gate 13 은 `build-components.ts` **한 파일의 sha256** 만 기록·대조한다(`installer-build-verify-check.js` 33·39행). 즉 이번 `figma-build-mock.js` 변경은 **Gate 13 의 해시 보호 밖**이다. 이번엔 이 보고서가 대신 검증했지만, 검사기 자체를 손대는 변경은 구조상 독립 검증이 자동으로 요구되지 않는다는 점을 기록해 둔다.

---

## 4. (D) 웹 ↔ 정본 정합 · 「리터럴 140」 논리 검토

**정본 주석의 논리는 성립한다.** 실측으로 확인했다.

| 주장 | 검증 | 판정 |
|---|---|---|
| "정본은 트리거도 목록도 140 으로 만든다" | 셀렉트 트리거 `trigger.resize(140, sc.h)` (1492행) · 드롭다운 패널 `resize(140, 4*sz.h+8)` (1764행) · 옵션 행 `resize(140, rowH)` (1612행) | ✅ 사실 |
| 그래서 140 은 규칙 ③(목록=트리거 폭)에 부합 | 셀렉트 경로에서 140 = 140 으로 성립. 하한 100 에도 저촉 없음(140 ≥ 100) | ✅ 성립 |
| 필터칩 경로는? | 칩은 `primaryAxisSizingMode="AUTO"`(hug)라 캔버스 폭이 80.3~114.5px 로 제각각 → 140 과 같을 수 없다. **이 점은 두 번째 ※ 와 `buildFilterChip` 위 주석이 명시적으로 인정**하고 있다("Figma 컴포넌트가 고정 폭이라 캔버스로 표현할 수 없다") | ✅ 자기모순 없음 |
| 웹 CSS 와 모순되는가 | `dropdown.css` `min-width:100px` + 소비자 `width:100%` ↔ 정본 고정 140. 140 은 하한을 만족하는 한 값이므로 **모순 아님**. 말줄임은 양쪽 다 존재 | ✅ 정합 |

정확히 말하면 첫 번째 ※ 는 "**셀렉트** 트리거도 목록도 140" 이라고 써야 완전하다(칩은 해당 없음). 다만 바로 아래 문장이 칩 경우를 따로 다루므로 오독 위험은 낮다 → 🟡-3 로만 남긴다.

### ❌(범위 밖 · Gate 13 미차단) — 웹 파일에 폐기된 숫자 140 이 남아 있다
`ui-library/src/components/dropdown/dropdown.css` **95행**:

```
/* river 결정 2026-09-07: 폭(=트리거 폭, 최소 140)을 넘는 긴 옵션은 … */
```

D27 이 하한을 **140 → 100** 으로 바꿨고 같은 파일 13·25행은 이미 100 으로 갱신돼 있다. 95행만 옛 숫자 그대로다 — **같은 파일 안에서 두 숫자가 충돌**한다.
이번 검증 대상(정본 4건)이 아니므로 **PASS 판정과 Gate 13 기록을 막지 않는다.** 다만 D27 웹 작업의 잔여 오류이므로 별도로 고쳐야 한다. 고치는 것은 검증자 소관이 아니라 구현자 소관이다.

참고로 `registry/components/dropdown.json` 의 `figmaCanonNote` 도 "GUI 로 보이는 항목(옵션 글자 말줄임·**폭 값**)만 정본에 반영" 이라고 쓰는데, 실제로 정본에 반영된 것은 말줄임뿐이고 폭 값(140)은 그대로다. 문구만 정리하면 된다.

---

## 5. (E) ⭐ 가 정본에 없는 것을 만들어 넣었는가

`workflow-state.json` 의 D22~D27 원문과 한 줄씩 대조했다.

| 정본 주석의 서술 | 근거 | 판정 |
|---|---|---|
| ① 최소 100px / ② 트리거<100 → 100 / ③ 트리거≥100 → 트리거 폭 | **D27 river 원문 그대로** | ✅ |
| "river 원문:" 뒤의 인용 | D27 quote 와 대조 — 앞머리 "다시 최종으로 정리할게." 생략, 불릿 `-` → `/` 표기만 다르고 **문장은 축자 일치** | ✅ |
| ④ 최대 폭 상한 없음 | D23 결정 "③ max-width:320px 상한 폐기" | ✅ |
| ⑤ 폭 넘는 글자는 말줄임 | D22 river 원문 "글이 넘어가는 경우 줄임말(...)표시되도록 수정" | ✅ |
| "마우스 올림은 웹 전용" | D25 river 원문 + D25 limitation(런타임 필요) | ✅ |
| 리터럴 140 유지 | 값 변경 **0** — 새 숫자를 만들어 넣지 않았다 | ✅ |
| 새 토큰·variant·컴포넌트 | 지문 토큰 diff 0건 · 세트 이름 동일 · 노드 수 동일 | ✅ 신설 0 |

**임의 생성 없음.** 특히 river 가 정하지 않은 폭 값을 정본에 새로 써넣지 않고 리터럴 140 을 유지한 것은 H6② 에 맞는 처리다.

### 🟡-3 (표기 개선 권고, 차단 아님)
1650–1651행이 `river 결정 2026-09-07:` 뒤에 따옴표로 한 문장을 넣는데, 그 문장은 **D22 와 D25 두 결정을 합쳐 다시 쓴 요약**이지 river 가 그대로 말한 한 문장이 아니다.
**차단하지 않는 이유:** ①두 조각 모두 실재하는 river 결정이고 ②바로 위 블록은 축자 인용에 `river 원문:` 이라는 다른 표찰을 쓰고 있어, `river 결정:` 은 "결정의 내용"이라는 구분된 표기로 읽힌다. 지어낸 결정이 아니므로 (a) 가 아니며, 버그를 덮는 성격도 없다.
**권고:** `D22·D25 결정` 처럼 결정 id 를 달거나 따옴표를 풀면 이 저장소가 과거에 한 번 지운 「확인되지 않은 river 인용」(D23 changed 항목) 문제가 재발할 여지가 사라진다.

---

## 6. 부수 확인 — D27 이 걱정했던 「남의 변경 동반 인증」 위험

D27 `pending` 은 "다른 세션이 같은 파일을 미커밋 편집 중(입력칸 Editing→Focus)이라 지금 손대면 Gate 13 해시에 남의 변경까지 함께 인증된다" 고 보류했다.
현재 `git diff plugins/figma-vars-installer/src/build-components.ts` 는 **드롭다운/필터칩 관련 3 hunk 뿐**이고 입력칸 변경은 HEAD(860603a)에 이미 커밋돼 있다. → **위험 해소됨. 이번 Gate 13 기록은 이 3 hunk 만 인증한다.**

---

## 7. 판정

| 갈래 | 건수 | 내용 |
|---|---|---|
| ❌(a) 코드 실수 (검증 대상 범위) | **0** | — |
| ❓(c) 애매 — 사용자 확인 필요 | **0** | — |
| BLOCKED | **0** | — |
| 🟡 개선 권고 | 3 | 🟡-1 속성 순서 · 🟡-2 mock 은 Gate 13 밖 · 🟡-3 인용 표기 |
| ❌ 범위 밖(별건 수정 필요) | 1 | `dropdown.css:95` 의 폐기된 "최소 140" |

**✅ PASS** — Gate 13 검증 기록 갱신 대상.

### 검증하지 않은 것 (정직 고지)
- **실제 Figma 캔버스 렌더를 보지 않았다.** 설치기를 Figma 에 실행해 옵션 글자가 실제로 … 로 잘리는지, 체크박스가 눌리지 않는지는 **육안 미검증**이다. 코드·지문 레벨에서만 판정했다(시나리오 D 의 구조적 한계).
- `ui-library` 웹 배포본 자체의 동작(시나리오 F)은 이번 범위가 아니다 — D25 에서 river 가 독립 검증을 생략하기로 한 부분이다. 위 (D) 의 dropdown.css 지적은 파일을 읽어 발견한 것이지 렌더로 확인한 것이 아니다.
