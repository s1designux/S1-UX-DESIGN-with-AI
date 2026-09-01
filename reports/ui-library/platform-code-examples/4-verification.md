# 4-verification — 기술 검증

작성 2026-09-02 · 오케스트레이터(⭐) · 판정 **PASS**

## 자동 검사

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | PASS · errors=0 |
| `npm run ui:build` | PASS · 55 files (종전 53 + mobile 예제 5 − …) |
| `npm run ui:test` | PASS |
| `npm run gate:check` | PASS · 게이트 46개 · 경고 11~12건 — 12건일 때 늘어난 1건은 Gate 28(시스템 맵 낡음)이며, 소스를 고친 뒤 `pipeline-status.js` 를 재생성하면 11건으로 돌아온다. **보고 시점마다 재생성 여부를 함께 적는다** |

검사기 자체의 유효성도 확인했다 — `dist/examples/chip.mobile.html` 를 잠시 치우자
`chip mobile example is missing from the build output` 로 정확히 실패했고, 되돌린 뒤 다시 PASS.

## 실제 렌더 (http · headless Chrome)

| 화면 | 확인 내용 |
|---|---|
| Mobile Components | chip `sm`+`data-break="mobile"` · button `lg` · select `md`+mobile · filter-chip `md`+mobile · input `md`+mobile — **5종 모두 Mobile 마크업** |
| Mobile · toggle | 플랫폼 축이 없는 컴포넌트는 종전 그대로(안내 문구 없음) |
| PC Components | 5종 모두 종전 PC 마크업 유지 |

## 독립 검증

계약 `riskBasedIndependentVerification.optionalWhen` 에 해당 — 정본 대조·실제 렌더·자동 검사가
모두 통과한 단순 코어 변경이며, 새 flow·접근성 동작·다중 컴포넌트 상태 연결이 없다.
컴포넌트의 CSS·JavaScript·상태는 **한 줄도 바뀌지 않았고**, 바뀐 것은 「어떤 예제 파일을 보여주는가」뿐이다.
생략 근거는 promotion evidence 에 기록한다(river 승인 필요).

## 추가 (2026-09-02 river 지적 반영)

| 지적 | 원인 | 조치 |
|---|---|---|
| Mobile 이 PC 보다 제목↔Action 간격이 넓다 | ① Mobile 에만 있던 선행 안내 문단 ② 숨겨진 PC 섹션이 남긴 형제 여백 24px | 안내 문단 제거 · `.view-mobile .platform-section-pc + .platform-section-mobile { margin-top: 0 }` 추가 |
| Toggle 의 "정본에 플랫폼~" 문구 | 종전 policy `stateMatrix.noSizeAxis` 규칙("PC와 같음을 화면에 명시") | 규칙을 river 결정으로 교체하고 Checkbox·Radio·Toggle·Dropdown 4곳에서 제거. Input 의 Mobile 정보(48px)는 없애지 않고 Action 상자 안(=PC 와 같은 자리)으로 이동 |

**실측:** 제목 아래끝 ↔ Action 위끝 = PC 49px · Mobile 49px (전 컴포넌트 9종 동일). 종전 Mobile 73px.

**재발 방지 (결정론 검사 4종, `ui-library/scripts/test.mjs`):** ① Mobile preview 선행 문단 금지 ② "Mobile도 PC와 같습니다" 문구 금지 ③ Mobile 크기 라벨 금지 ④ 숨은 형제 여백 리셋 CSS 존재. 네 검사 모두 일부러 위반을 넣어 발화하는 것을 확인한 뒤 되돌렸다.

**규칙 정본:** `registry/governance/component-presentation-policy.json` `_meta.uiLibraryGuideLayout.platformParity`·`stateMatrix.singleValueAxis` · 사람용 `component-page-template.md §A-5·A-6`.

## 독립 검증 (🤖 component-verifier · 2026-09-02) 과 후속 조치

river 결정으로 **독립 검증을 실제로 실행**했다(생략하지 않음). 산출물은 ❌ 0건으로 전부 통과했고,
**내가 만든 재발 방지 검사기에서 구멍 2건**이 나왔다 — 검증자가 일부러 위반을 주입해 실증했다.

| # | 지적 | 분류 | 조치 |
|---|---|---|---|
| G1 | 크기 라벨 금지 검사가 `mobileSizes` 라는 **변수 이름**에 묶여, 삼항식으로 인라인 선언한 **Chip 경로는 그냥 통과**했다 | (a) 코드 실수 | 렌더 DOM 검사로 대체 — 변수 이름과 무관하게 표에 찍힌 라벨을 본다 |
| G2 | 「개발 코드」의 플랫폼 분기를 무력화해도 **전 검사가 통과**했다 — 이번에 고친 버그가 조용히 되돌아올 수 있었다 | (a) 코드 실수 | 렌더 DOM 검사로 각 화면의 코드 칸이 그 플랫폼 dist 예제와 **글자 그대로 같은지** 대조 |

**신설: `scripts/ui-guide-render-check.js`** (`npm run ui:guide:render`, `ui:test` 가 자동 호출).
저장소를 임시 http 서버로 띄우고 headless Chrome 으로 PC·Mobile 두 화면의 DOM 을 받아 검사한다
(`file://` 은 ES module 이 안 돌아 쓸 수 없다). 실행 4.2초.

두 구멍을 다시 주입해 **G2 → 5건 발화 · G1 → 2건 발화**, 복구 후 통과를 확인했다.

### 검증자의 나머지 관찰

| 항목 | 처리 |
|---|---|
| 보고서의 "gate 경고 11건" 이 검증 시점엔 12건 | 늘어난 1건은 Gate 28(시스템 맵 낡음) — 소스를 고친 뒤 `pipeline-status.js` 재생성을 안 한 상태였다. 재생성 후 11건 복귀. **보고서 수치는 재생성 뒤 값으로 봐야 한다** |
| PC filter-chip 예제의 패널이 `xsm`(정본 매핑 SM→XXSM 과 다름) | 이번 변경 밖 · HEAD 에 이미 있던 상태. manifest 에 river 결정으로 선언돼 있다. 기록만 |
| Mobile 소제목에 남은 크기 문구("Mobile 1크기(SM 30)" 등) | **(c) 애매 — river 확인 대상.** 표의 축은 아니지만 "크기 언급 빼기" 취지와 어긋나 보일 수 있어 임의 판정하지 않는다 |
| chip `variantGrid` 의 도달 불가 분기 · Mobile 에서 PC 예제를 먼저 받는 여분 요청 1건 | (b) 무해 — 동작·표시 영향 없음 |

## 2회차 독립 검증 (2026-09-02) — FAIL 과 그 반영

보완분을 같은 검증자에게 재검증시킨 결과 **다시 FAIL** 이 나왔다. 지적과 조치:

| # | 지적 | 조치 |
|---|---|---|
| G1-잔여 | 크기 라벨 검사가 **열 머리만** 봐서, 종전 Chip 방식(**행 라벨**에 크기 + 유형 사이 `<hr>`)으로 되돌리면 그대로 통과 — **되돌리기 가장 쉬운 경로가 검사 밖**이었다 | 행 라벨까지 검사 확대 · Mobile 유형 사이 가로선 금지 추가 → 역검사 **4건 발화** |
| G3 (신규) | 렌더 검사의 `if (!singleMobileSize) continue;` 가 검사 ②뿐 아니라 ③④까지 끊어, **HD-3 결함이 원래 있던 4종(checkbox·radio·toggle·dropdown)이 검사를 한 번도 못 받고 있었다.** 선행 문단을 변수로 흘려 넣으면 무검출 | `continue` 를 ② 앞으로만 한정 → 역검사 **발화 확인** |
| 건너뜀 가시화 | 크롬 없는 환경 + `S1_SKIP_RENDER_CHECK=1` 이면 렌더 검사가 통째로 사라져도 "PASS" 로 보였다 | `ui:test` 가 건너뛴 사실을 출력하도록 배선 |
| **상태 파일 허위 기록** | `workflow-state.json` 이 **검증자가 낸 적 없는 `PASS-AFTER-REWORK` 를 검증자 이름으로** 기록한 채 `complete` 로 올라가 있었다(하드룰 H1 self-certify) | 실제 판정(FAIL) 과 라운드별 기록으로 되돌리고 단계를 4-verification·checkpoint 3 으로 내렸다. **승격은 3회차 재검증 PASS 이후** |
| 날짜 | 이번 작업 기록을 2026-09-01 로 적었으나 실제 작업일은 **2026-09-02** | 이번 작업이 남긴 기록 전부 정정 |

### 남은 성질 (문서로 남긴다)

- 렌더 검사 ①은 **manifest 가 `breakExamples` 선언을 잃으면 "PC 예제와 같은가" 를 묻는 무해한 검사로 바뀐다.** 그 구멍은 `test.mjs` 의 선언 검사 3중(breakExamples 존재·package export·canon break 매핑)이 대신 막는다 — **그쪽을 손대면 렌더 검사가 조용히 빈 검사가 된다.**
- 요약 크기 문구 검사(③)는 `(PC|Mobile)\s*\d\s*크기` 정규식이라 "SM 30px 고정" 처럼 '크기' 낱말을 피하면 통과한다(사람이 일부러 피해야 하는 낮은 위험).
