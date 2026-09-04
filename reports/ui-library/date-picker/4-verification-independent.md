# 4-verification (독립) — date-picker · time-picker 모바일 휠 시트

- 검증 주체: 🤖 component-verifier (시나리오 F) — 구현자와 분리
- 검증일: 2026-09-03
- 대상: `ui-library/src/components/date-picker/*`, `ui-library/src/components/time-picker/*`(휠 시트), `ui-library/dist`, `pages/ui-review.html`, `pages/components.html`
- 기준: `plugins/figma-vars-installer/src/build-components.ts`(시각 정본) · `vars-data.ts`(토큰 값) · `registry/components/date-picker.json`(메타) · `registry/governance/ui-library-code-contract.json`
- 3-build 의 자기보고는 근거로 쓰지 않고 검증 대상으로만 다뤘다.

## 전체 판정

**FAIL** — ❌(a) 4건 · ❓(c) 4건. 3-build 로 반환 후 재검증 필요.

---

## ❌ (a) 코드 실수 — 수정 대상 4건

### F-1. 트리거 달력 아이콘 크기가 정본과 다르다 (전 사이즈 20px 고정)

- 정본: `build-components.ts:1256` `const fcIconPx = (h) => (h <= 28 ? 20 : 24);` → `:3698` 에서 트리거 아이콘 크기로 사용.
  즉 XXSM(28)=**20**, XSM(34)·MD PC(44)·MD Mobile(48)=**24**.
- 웹: `ui-library/src/components/date-picker/date-picker.css:44-50` 이 `--sizing-20` 을 사이즈 구분 없이 고정.
- 실측(`ui-library/verification/empty-consumer.html`, 같은 화면 같은 행):
  `date-picker` 아이콘 **20×20** · `time-picker` 아이콘 **24×24** · `select` 아이콘 **24×24** (트리거 높이는 셋 다 44).
- 승인된 형제 코어는 정본대로 배선돼 있다 — `time-picker.css:72-74`, `select.css:51-53` 모두 `xxsm=20 / xsm·md=24`.
- 경위: `1-inventory.md` 미확인 목록에 **"`fcIconPx()` 의 실제 반환값 — 정의부 미확인"** 이 그대로 남아 있었고, 그 미확인 값을 확인하지 않은 채 20 으로 채웠다(추측 금지 위반).

### F-2. 검수 화면(`pages/ui-review.html`)의 Mobile 표본이 시트를 열지 못한다 (죽은 컨트롤)

- `pages/ui-review.html:1536-1553` `datePickerMarkup()` 은 `breakName` 과 무관하게 **`panel` 만** 만들고 `sheet`/`sheet-panel`/`calendar-wrap` 을 만들지 않는다.
- `date-picker.js:315-316` `const container = brk === "mobile" ? sheetCalendar : panelCalendar; if (!container) return null;` → Mobile 인스턴스는 **init 이 null 로 끝난다.**
- 실측(브라우저, `ui-review.html#date-picker`): live 인스턴스 4개 중 Mobile 2개는 `hasSheet:false`, 트리거 클릭 후 `aria-expanded="false"`, 렌더된 날짜 칸 `0`.
- 그런데 같은 칸 안내문은 "트리거를 누르면 하단 시트가 열립니다(M7). 배경 클릭·닫기·Esc로 닫힙니다."(`:1594`) 라고 적혀 있다 — river 가 5-human-review 에서 눌러보면 아무 일도 일어나지 않는다.
- 정상 마크업은 이미 `ui-library/src/components/date-picker/date-picker.mobile.example.html` 에 있다(검수 화면만 이를 쓰지 않는다).

### F-3. 모바일 시트가 열려도 포커스가 시트 안으로 이동하지 않는다 (선언 위반)

- 선언: `manifest.json` `a11y.focus` — "Mobile 시트는 열리면 **시트 안으로**, 닫히면 트리거로 복귀".
- 구현: `date-picker.js:354-359` `openSheet()` 는 `lastFocused` 저장 · `hidden=false` · `body.overflow` 잠금 · Esc 리스너만 하고 **포커스 이동이 없다.**
- 실측(`verify-behavior.png`): 시트 열림 직후 `sheetFocus: "BODY"` (트리거·시트 어느 쪽도 아님).
- 같은 작업에서 만든 형제 구현은 제대로 돼 있다 — `time-picker.js:400` 이 첫 포커스 대상으로 이동시키고 `:376-384` 가 Tab 순환(포커스 가둠)까지 구현한다. date-picker 시트에는 Tab 가둠도 없다.
- 부작용: 시트가 열린 상태에서 Tab 을 누르면 시트 뒤 배경 요소로 포커스가 빠져나간다.

### F-4. `destroy()` 가 시트 리스너를 제거하지 못한다 (참조 불일치)

```js
// date-picker.js:525-526  (등록)
sheetClose?.addEventListener("click", () => close());
sheetBackdrop?.addEventListener("click", () => close());
// date-picker.js:551-552  (해제)
sheetClose?.removeEventListener("click", close);
sheetBackdrop?.removeEventListener("click", close);
```
익명 화살표로 등록하고 `close` 로 제거하므로 **함수 참조가 달라 제거되지 않는다.** `apply` 는 `handleApplyClick` 로 올바르게 등록/해제돼 있어(`:527`, `:553`) 두 줄만 어긋난 실수다. (런타임 재현은 트리거 리스너가 먼저 해제돼 시트를 다시 열 수 없어 실패했다 — 코드 레벨로 판정.)

---

## ❓ (c) 애매 — river/오케스트레이터 확인 필요 4건

### C-1. 기록되지 않은 세 번째 정본 이탈 — 일요일 빨강 · 토요일 파랑

- 시각 정본: `buildCalendar:3600` 요일 헤더 7칸 전부 `date-picker/text/primary`, `buildCalendarCell:3325-3331` Standard 전 상태의 숫자색 `text/secondary`(오늘·선택·비활성 제외). **주말 색 구분이 없다.**
- 웹: `date-picker.css:194-195, 251-254` 가 일요일 `text/sunday`(red/300), 토요일 `text/saturday`(blue/400) 를 칠한다.
- 토큰 자체는 정본에 존재한다(`vars-data.ts:644-645`) — 새 토큰 신설은 아니다(그 점은 PASS).
- 문제는 **선언 위치**다. 같은 성격의 M5(`cell/bg/selected-hover`, 값은 있으나 빌더 미배선)는 `notInCanon` 에 명시했는데, 주말 색은 `2-canon-readiness.md:12` D3 근거문 한 줄에만 언급되고 `manifest.notInCanon` 에도 CU 목록에도 없다. **정본 이탈은 2건이 아니라 3건이다.**
- 판단 요청: CU-3 으로 등록할지, 아니면 웹에서 뺄지.

### C-2. 6주짜리 달에서 패널 아래 여백(20px)이 사라진다

- 정본 패널은 **352 고정**(`buildCalendar:3521 PANEL_H`)에 상하 패딩 20 → 내부 가용 312. 정본 데모는 2025.01(5주)뿐이라 6주 사례가 없다.
- 웹도 `date-picker.css:87` 로 352 를 고정했는데, 런타임은 6주 달을 만든다(`date-picker.js:59-63`).
- 실측(2026-08, 6주): 캘린더 콘텐츠 `scrollHeight 332` > 박스 `310`, 날짜 그리드 하단 `476px` vs 패널 하단 테두리 `475.5px` → 마지막 주가 패널 테두리에 닿는다(`verify-pc-states.png` 좌측 첫 칸).
- 6주 달은 흔하다(2026년만 5·8·10·11월 등). 정본에 규정이 없는 구간이라 (c)로 올린다 — 352 고정 유지 / 6주일 때 396(=352+44) / 높이 auto 중 선택이 필요하다.

### C-3. 아직 draft 인데 안내 페이지에서 기존 문서를 지우고 메뉴를 열었다

- `pages/components.html`: 손편집 Date Picker 섹션 **420줄 삭제** 후 빈 `<section>` 으로 교체하고, nav 버튼의 `disabled` 를 **제거**했다.
- 상태는 `draft` 라 가이드 렌더러가 붉은 오류만 띄운다 — 실측: "Date Picker 승인 배포본을 불러오지 못했습니다: date-picker 배포 상태가 verified 또는 approved가 아닙니다."(`verify-guide-datepicker.png`)
- 즉 지금 사이트에서 Date Picker 메뉴를 누르면 **문서가 사라지고 빨간 오류만 보인다.** 선례인 time-picker 는 승인(6-promotion, 커밋 3d8045e) 시점에 전환했다.
- 판단 요청: 승인 전까지 nav 를 다시 `disabled` 로 둘지(권장), 아니면 이대로 둘지.

### C-4. `data-cov-type="standard,range,single"` 의 `single` 은 정본에 없는 값

- 정본 Calendar Cell 의 Type 축은 `Standard | Range` 두 값뿐(`buildCalendarCell:3367-3383`).
- 커버리지 계측기는 "선언된 값"만 대조하므로 Gate 19 는 통과하지만(pairs=49 verified=49), 정본에 없는 축 값을 선언한 상태다. `standard,range` 만 남기는 게 맞는지 확인 필요.

---

## ✅ PASS — 항목별 근거

### 1. 정본 정확 대조 (기하·토큰)

| 항목 | 정본 | 웹 실측 | 판정 |
|---|---|---|---|
| 트리거 높이 | 28/34/44/48 (3679-3684) | 동일(css:32-35) · MD 실측 44 | ✅ |
| 트리거 패딩·radius·min-width | 16/8 · 4 · 180 (3691-3699) | 실측 16/8 · 4px · 180 | ✅ |
| 트리거 상태 색 | bg/border/text = form-control default·selected·disabled (3673-3678) | css:15-77 동일 매핑 | ✅ |
| 패널 | 356×352, pad 20/24, radius 4, shadow/dropdown (3521-3541) | 실측 356×352, `20px 24px`, 4px, `rgba(0,0,0,.15) 0 4px 8px` | ✅ |
| 화면별 gap | Date 16 · Year/Month 20 (3608·3639·3655) | css:113-115 동일 | ✅ |
| 헤더 | 308×32, chevron 16 (3544-3548) | 실측 308×32, 16px | ✅ |
| 날짜 칸 | outer 44×44 · inner 30×30 radius-full · stroke 1 (3336-3364) | 실측 44×44 / 30×30 / `9999px` | ✅ |
| Range 밴드 | h30 top7 · Start x22 w22 · End x0 w22 · Mid 풀폭 (3373-3387) | 실측 `height 30 / top 7 / start left22 / end right22 / mid 0-0` | ✅ |
| Range 색 | Start=bg/today+border/today+text/today · End=bg/selected+border/today+text/selected(Bold) · Mid=bg/range | 다크 실측: start inner `#1C1D23`(gray-dark/100) · end inner `#3070D8`(blue-dark/300)·`font-weight 700` · 밴드 `#112B55`(blue-dark/100) | ✅ |
| 연/월 타일 | 88×56 radius 4 · 16 Medium · 4행×3열 gap 12 (3411-3423, 3636-3660) | 실측 88×56 / 4px / 16px / 4×3 / gap 12 | ✅ |
| 시트 | 360폭 · 상하 20 · 섹션 gap 32 · 헤더 20 · 캘린더 24 · 상단 radius 8 · surface/raised (3753-3833) | css:345-395 동일 (폭은 C 참조 — 아래 6항) | ✅ |
| 시트 적용 버튼 | Button Primary LG 인스턴스 재사용(3805-3824) | 예제·검수 모두 `data-s1-component="button" data-variant="primary" data-size="lg"` 조립 | ✅ |
| variant·size·state 누락 | Default/Filled/Open/Disabled × XXSM/XSM/MD(PC)+MD(Mobile) · Date/Year/Month | manifest·CSS·검수 표본 모두 존재, 누락 0 | ✅ |

- **HEX 직접 사용 0건** — `date-picker.css`·`time-picker.css` 에 `#`/`rgb(`/`hsl(` 0건, 색은 전부 `var(--color-…)`.
- **새 색 토큰 0건** — 사용된 색 변수 전부 `tokens.css`(정본 파생)에 이미 존재.

### 2. 배포 동일성

- `source ↔ dist`: date-picker·time-picker 의 css/js 4파일 `diff` 차이 0.
- **빌드 결정론**: `npm run ui:build` 2회 연속 실행 후 `dist` 전체 해시 동일.
- **빈 HTML 소비**: `empty-consumer.html` ↔ `empty-consumer-individual.html` 의 `<main>` DOM 정규화 비교 **완전 동일**(11,444자).
- **전체 묶음 ↔ 개별 설치 렌더**: 두 소비자 페이지 스크린샷 **바이트 단위 동일**(`verify-consumer-bundle.png` / `verify-consumer-individual.png`, sha1 `af138a3d…` 일치).
- `pages/ui-review.html` 은 `ui-library/dist` 의 tokens·typography·s1-ui.css 만 로드하고, date-picker 컴포넌트 CSS 를 손으로 다시 쓰지 않는다(검수 레이아웃용 `.review-*` 규칙만 존재).

### 3. 동작·접근성 (실측 `verify-behavior.png`)

| 항목 | 결과 |
|---|---|
| ARIA 역할 | panel `role=dialog` · grid `role=grid` · 주 `role=row` 6 · 칸 `role=gridcell` 42 · `aria-selected` 동기화 · 비활성 `aria-disabled` | ✅ |
| 트리거 | `aria-haspopup=dialog` · `aria-expanded` 동기화 | ✅ |
| Esc (PC 격자 안) | 패널 닫힘 + **트리거로 포커스 복귀** | ✅ |
| Esc (모바일 시트) | 시트 닫힘 + 트리거 복귀 + `body.overflow` 원복(빈값) | ✅ |
| PageUp/PageDown | 달 이동 확인(8월↔9월) | ✅ |
| 화살표 이동 | ArrowRight(08-17→08-18)·ArrowDown(08-17→08-24) 확인 | ⚠️ 부분 — 아래 미검증 참조 |
| 재초기화 | destroy 후 `init` 다시 성공 | ✅ |
| 배경 스크롤 잠금 | 열 때 `hidden`, 닫을 때 해제 | ✅ |

### 4. 기간 선택(D4·D6)

- **D4(역순 입력)**: 시작 17일 → 10일 클릭 시 값이 `26.08.10 - ` 로 바뀌어 **새 시작일**이 됐다(자동 뒤집기 없음). 이어 20일 클릭 → `26.08.10 - 26.08.20` 확정 후 닫힘. `date-picker.js:413-427` 과 일치. ✅
- **D6(hover 미리보기)**: 시작일만 고른 상태의 미리보기 밴드가 `--color-date-picker-cell-bg-range` **하나만** 사용(`css:218-228`, 다크 실측 `#112B55`). 새 색 0건. ✅

### 5. 지문 갱신 19건의 근거

주장: "커밋 dc5ac98 의 변경이 컴포넌트 시각 빌더 밖이다."
직접 확인 결과 **사실이다** — `git show dc5ac98 -- build-components.ts` 는 `1 file changed, 6 insertions(+), 1 deletion(-)` 이고 hunk 는 `@@ -5719 buildOrderFor` · `@@ -5840 buildAllComponents` 두 곳뿐이다(취소 신호 파라미터·루프 가드). 3319~4060 의 date/calendar 빌더에는 손이 닿지 않았다. → 지문 재계산은 **타당**, 기존 승인 컴포넌트의 검증을 무효화하지 않는다. ✅

### 6. 오케스트레이터 직접 수정 3건 적대적 재검토

| 수정 | 판정 | 근거 |
|---|---|---|
| 정적 타일 표본의 무조건 `disabled` 제거 · 칸 `minmax(380px)` · 자리확보 정적 한정 | ✅ 타당 | 연/월 표본이 전부 비활성으로 보이던 것이 해소됨(`verify-review-datepicker.png`). 남는 190px 빈칸은 `.review-overlay-slot` 공통 규칙(`:194`)으로 select·filter-chip·time-picker 도 같이 쓰는 기존 관례 |
| 시트 폭 `360px` 고정 → `width:100%; max-width:360px` | ✅ 타당 | 정본 `SHEET_W=360`(3752)은 Figma 모바일 프레임의 화면 폭이다. 실측: 뷰포트 375 → 패널 8~368(정확히 360, 중앙) · 뷰포트 320 → 패널 0~320, 캘린더 6~314, **가로 넘침 0**(`documentElement.scrollWidth=320`). 360 고정이면 320 기기에서 40px 잘렸다. 다만 356px 미만에서는 캘린더 좌우 24 패딩이 눌린다(넘침 대신 패딩을 희생 — 합리적 절충) |
| `data-cov-type` 에 `standard` 추가 · `data-cov-content="timeonly,datetime"` 추가 · baseline 동결 해제 | ✅ 대체로 타당 (`single` 만 C-4) | 가이드 렌더러가 실제로 TimeOnly·DateTime 휠 시트를 그린다(`assets/js/ui-library-guide.js:1553-1690`). 실기 렌더로 DateTime 시트 확인 — 헤더 "시작 일시"+닫기, 날짜/시간 Line Tab, 4열(오전오후·시·:·분), 상하 fade, 풀폭 "적용". 정본 `buildTimePickerMobileBottomSheet` 구조와 일치 |

### 7. 검사기

| 검사기 | 결과 |
|---|---|
| `npm run ui:build` | ✅ 110 files · 2회 동일(결정론) |
| `npm run ui:test` | ✅ |
| `npm run ui:icons` | ✅ icons=13 errors=0 (check·edge_set 경고는 기존 부채) |
| `npm run gate:check` | ❌ 5 error — **전부 Gate 34 `uistate:date-picker.*`** = 선언된 블로커 B5(river 승인 문장 대기). 그 외 error 0, warning 14 는 기존 부채 |

---

## 검증하지 못한 범위 (정직 고지)

1. **화살표/Home/End 전 키 조합의 포커스 이동** — 헤드리스 크롬에서 `requestAnimationFrame` 이 거의 발화하지 않는다(실측: rAF 요청 7회 중 **콜백 1회만 실행**). `date-picker.js:492` 의 포커스 복귀가 rAF 안에 있어 키 시퀀스를 연속 재현할 수 없었다. 단발 검증으로 ArrowRight·ArrowDown 은 정상 확인. **ArrowLeft·ArrowUp·Home·End·달 경계 넘김의 포커스 이동은 미검증** — 실제 브라우저에서 사람이 한 번 눌러보는 확인이 필요하다.
   - 관련 개선 제안(차단 아님): 형제 `time-picker.js:226` 은 동기 `focus()` 를 쓴다. rAF 의존은 백그라운드 탭·프레임 미생성 환경에서 포커스가 유실된다.
2. **실제 터치 기기**에서의 시트 스와이프·관성 스크롤(휠 시트 포함).
3. **Figma V3.0 캔버스 대조** — MCP 인증 미완. 상태 파일이 `requiredForInventory:false` 로 선언해 필수는 아니지만, 시각 원본 대조는 코드 정본으로만 했다.
4. **스크린리더 실제 낭독** — 역할·상태 속성만 확인했고 낭독 결과는 확인하지 않았다.
5. **다중 인스턴스 동시 열림 시 상호 간섭** — 순차 개폐만 확인(검수 화면 live 4개), 두 개를 동시에 연 상태의 바깥 클릭·Esc 우선순위는 미검증.
6. 그 밖의 관찰(차단 아님): ① 연 타일 `Disabled` 상태가 런타임에서 절대 나오지 않는다(`date-picker.js:313` `ctx = {}` 라 `ctx.yearDisabled` 가 항상 `undefined`) ② 팝오버를 열면 포커스가 "첫 활성 셀"=지난달 날짜로 간다(선언대로지만 선택일/오늘이 자연스럽다) ③ 시트 backdrop(`--color-overlay`)은 정본 컴포넌트에 없는 웹 추가인데 선언이 없다(모달·time-picker 선례와 동일해 무해).

---

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **blocked**
- `uiLibraryStatus`: **draft** 유지 (candidate 승격 보류)
- `lastCompletedCheckpoint`: 3 유지 (4 미통과)
- `nextAction`: ❌ 4건(F-1~F-4)을 🧱 ui-library-builder 가 수정 → 재검증. ❓ 4건(C-1~C-4)은 오케스트레이터가 판단하거나 river 에게 모아서 질문. 그 다음 5-human-review 와 Gate 34 승인 문장을 요청한다.

## 스크린샷

| 파일 | 내용 |
|---|---|
| `reports/ui-library/date-picker/screens/verify-review-datepicker.png` | 검수 화면 date-picker 구간(상단) |
| `reports/ui-library/date-picker/screens/verify-pc-states.png` | PC 라이트/다크 × 6주 달·기간 hover·Year·Month |
| `reports/ui-library/date-picker/screens/verify-behavior.png` | 키보드·포커스·Esc·시트·destroy 실측 결과 |
| `reports/ui-library/date-picker/screens/verify-consumer-bundle.png` / `verify-consumer-individual.png` | 전체 묶음 ↔ 개별 설치 (바이트 동일) |
| `reports/ui-library/date-picker/screens/verify-guide-datepicker.png` | 안내 페이지의 draft 오류 표시(C-3) |

> 모바일 시트·휠 시트는 헤드리스 캡처가 `position:fixed` 레이아웃을 실제와 다르게 그려(패널이 우측으로 밀림) 파일로 남기지 않았다. 대신 실제 브라우저 뷰포트 375·320 에서 `getBoundingClientRect()` 실측 + 브라우저 스크린샷으로 확인했다(위 6항).

---

# 재검증(2차) — 2026-09-03

- 검증 주체: 🤖 component-verifier (시나리오 F) — 구현자와 분리. 위 1차 판정은 그대로 보존한다.
- 범위: (A) 수정 5건 실측 확인 · (B) 오케스트레이터 수정 2건 타당성 · (C) 회귀 · (D) CU-3 기록 정합.
- 3-build §10 의 자기보고는 근거로 쓰지 않고 **검증 대상**으로만 다뤘다.
- 렌더는 전부 http(`127.0.0.1:4173`). Browser pane 이 hidden 이라 뷰포트가 0×0 으로 잡히는 문제는 `resize_window(1280×900)` 로 해소하고 실측했다(측정값은 전부 이 뷰포트 기준).

## 전체 판정

**FAIL** — 지시받은 수정 5건(F-1~F-4·C-2)은 **전부 PASS**지만, 그 수정이 만든 **새 결함 3건(❌ R-1~R-3)** 이 있다.
그중 **R-1 은 검수 화면 전체를 못 쓰게 만드는 차단급**이다(river 가 5-human-review 를 할 수 없다).

---

## (A) 지시받은 수정 5건 — 전부 PASS

| 항목 | 판정 | 실측 근거 |
|---|---|---|
| **F-1** 트리거 아이콘 크기 | ✅ PASS | 정본 `build-components.ts:1256` `fcIconPx=(h)=>h<=28?20:24`. 검수 화면 전 인스턴스(52개) 실측: `xxsm(trigH28)=20×20`(8개) · `xsm(34)=24×24`(8개) · `md-pc(44)=24×24`(24개) · `md-mobile(48)=24×24`(12개). CSS 는 `date-picker.css:51-53`, select·time-picker 와 동일 분기. 글리프도 실물 확인(`verify2-icon-sizes-and-sheet.png`) — mask `contain`, 상자=글리프. |
| **F-2** 검수 화면 Mobile 표본 | ✅ PASS (기능) | `pages/ui-review.html:1546-1560` 이 mobile 분기에서 sheet 전체 구조를 생성. Mobile live 2개(light·dark) 실측: `hasSheet:true · aria-expanded "true" · 날짜칸 35개`. 안내문("누르면 하단 시트가 열립니다")과 실제 동작 일치. **단 부작용 R-1·R-3 발생(아래).** |
| **F-3** 시트 포커스 | ✅ PASS | `date-picker.js:369-392`. 실측: 열림 직후 포커스 `sheet-close`(시트 안) · 마지막 요소에서 Tab→첫 요소, 첫 요소에서 Shift+Tab→마지막(둘 다 `preventDefault` 확인, focusable 41개) · Esc→시트 닫힘 + **자기 트리거로 복귀** + `body.overflow` 원복. manifest `a11y.focus` 선언과 일치(문구는 승인된 time-picker 와 동일 표현). |
| **F-4** destroy | ✅ PASS | 등록(`:542-552`)↔해제(`:571-580`) **1:1 전수 대조** — trigger click · container click/keydown/mouseover/mouseleave · sheetClose/sheetBackdrop(`handleSheetCloseClick` 동일 참조) · apply · document pointerdown(capture) · document keydown(capture) · MutationObserver `disconnect()`. 런타임: init→열기→닫기→destroy→**트리거 클릭 무반응**→재 init→정상 열림. open 이벤트 총 2회/close 1회로 **중복 발화 0**. destroy 후 backdrop·닫기·Esc 전부 무반응(= 익명 리스너 누수 없음). |
| **C-2** 6주 달 | ✅ PASS (회귀 없음) | 같은 PC live 인스턴스 실측 — 2026-08(6주): 패널 356×**398**, 마지막 주 아래 여백 **21px**, 콘텐츠 잘림 없음. 2026-07·2026-09(5주): 356×354, 위/아래 여백 21/21 대칭, 잘림 없음. 스크린샷 `screens/verify2-panel-6week.png`(6주 Light·Dark, 5주 Light). **단 바깥 높이 값 자체는 R-2 참조.** |

## ❌ (a) 새로 발견된 결함 3건 — 이번 수정이 만든 것

### R-1. 검수 화면이 통째로 덮여 못 쓴다 (차단급 · F-2 수정의 부작용)

- F-2 로 추가된 mobile 분기는 `state==="open"` 인 **정적 표본**에도 `hidden` 없는 `sheet` 를 낸다(`pages/ui-review.html:1547`).
- `date-picker.css` 의 시트는 `position:fixed; inset:0; z-index:1000` 이라, 정적 표본이 **화면 전체를 덮는 오버레이**가 된다.
- 실측(새로고침 직후, 조작 전): 열린 시트 **4개**(Mobile Light/Dark × "Open · 패널 열림" + "Range · Open"), 각각 `1280×900 fixed z-1000`. `document.elementFromPoint(200,300)` → `date-picker sheet-backdrop`(`pointer-events:auto`).
- 즉 **페이지 맨 위 Base Input 구간부터 전부 어둡게 덮이고 클릭도 막힌다.** 스크린샷 `screens/verify2-review-overlay-block.png`.
- 승인된 선례는 이 형태를 쓰지 않는다 — time-picker 휠 시트는 검수 화면에서 항상 `hidden` 이고 "실제로 눌러보기" live 표본으로만 보여준다(`ui-review.html:1411`).

### R-2. 5주 달 패널 바깥 높이가 정본 352 → 354 가 됐다 (C-2 수정의 부작용)

- 정본: `buildCalendar` `PANEL_W=356, PANEL_H=352`, padding 20/24, `strokeWeight 1 · strokeAlign INSIDE` → **바깥 352, 내용 시작점은 가장자리에서 20**(선이 padding 안쪽에 겹쳐 그려진다).
- 웹: `min-height:352px` + `box-sizing:border-box` + `border 1px` + `padding 20` → 내용 312 가 들어가면 **바깥 354, 내용 시작점 21**.
- 실측: 5주(2026-07·09) 패널 `354.0`(내용 312 = 헤더 32 + gap 16 + view 264), 6주 `398`. 1차 검증 때는 `height:352` 고정이라 바깥은 352 였지만 내용이 2px 잘리고 있었다.
- 즉 **둘 다 정본과 어긋난다**(이전=내용 잘림, 지금=바깥 +2px). 가로도 같은 구조로 어긋나 있다(캘린더 308 이 내용상자 306 밖으로 1px씩 번짐) — 이건 1차 때부터 있던 것으로 이번 회귀가 아니다.
- 정본 수치(바깥 352 · 내용 312 · 시작점 20)를 동시에 만족하는 배선이 존재하므로 "불가피한 절충"이 아니다. 값 판단·배선은 구현자 소관.

### R-3. 검수 화면 시트에 접근 가능한 이름이 없다 (F-2 수정 마크업)

- 선언: manifest `a11y.accessibleName` = "sheet 는 aria-labelledby(sheet-title)". 배포 예제(`date-picker.mobile.example.html:8`)는 이 선언대로다.
- 검수 화면이 새로 만든 시트(`ui-review.html:1548`)는 `role="dialog" aria-modal="true" tabindex="-1"` 만 있고 **`aria-labelledby` 가 없다**. 실측: sheet-panel 전수 `aria-labelledby = null`.
- (중복 id 를 피하려 id 를 뺀 것으로 보인다 — 실제로 페이지 전체 중복 id 는 0건이었다. 인스턴스별 고유 id 를 붙이면 둘 다 만족한다.)

## (B) 오케스트레이터 수정 2건 — 둘 다 ✅ 타당

| 수정 | 판정 | 근거 |
|---|---|---|
| nav 버튼 다시 `disabled` | ✅ 타당 | `pages/components.html:1861` `disabled` 확인. 실제 렌더(`screens/verify2-guide-nav-disabled.png`): Date Picker 칩이 CI Logo·Footer·GNB·Login GNB 와 같은 회색 비활성으로 보이고, 페이지는 기본 Button 섹션을 정상 표시 — 1차 때의 빨간 오류 화면이 사라졌다. 승격 시 해제하면 된다. |
| `data-cov-type` = `standard,range` | ✅ 타당 | 정본 Calendar Cell Type 축 = `Standard`·`Range` 뿐(`build-components.ts:3421·3428`), `single` 은 정본에 없다. Gate 19 실행 결과 `pairs=49 verified=49 newGaps=0` PASS. |

## (C) 회귀 확인

| 항목 | 판정 | 근거 |
|---|---|---|
| 기하·토큰 | ✅ (R-2 제외) | 트리거 4크기 높이 28/34/44/48 · 패널 폭 356 · 캘린더 308 · Range 밴드 h30/top7 재확인 |
| HEX 0 · 새 토큰 0 | ✅ | `date-picker.css`·`time-picker.css` 에 `#`/`rgb(`/`hsl(` 0건. 사용 CSS 변수 69종 전부 `tokens.css`/`typography.css` 에 정의 존재. `npm run css:varcheck` = 참조 917건 전부 정의에 닿음(동결 6건은 기존 부채) |
| D4 역순 입력 | ✅ | 17일 → 10일 클릭 시 `26.09.10 - `(새 시작일, 자동 뒤집기 없음) → 20일 클릭 시 `26.09.10 - 26.09.20` 확정 후 닫힘 |
| D6 미리보기 | ✅ | 시작일만 고른 상태 hover → 밴드 4칸(start/mid/mid/end), `::before` 실측 `rgb(226,241,255)` = `--color-date-picker-cell-bg-range`(#E2F1FF) 하나만, `height 30px · top 7px` |
| PC 팝오버 동작 | ✅ | `aria-haspopup=dialog` · `role=dialog` · `role=grid` · row 5 · gridcell 35 · `aria-selected` 전 칸 동기화 · 열 때 첫 활성 셀 포커스 · Esc 닫힘+트리거 복귀 · 바깥 pointerdown 닫힘 |
| 스크롤 잠금 | ✅ | 시트 열림 `hidden` → Esc·닫기 후 `""` 원복 (destroy 중 예외는 C-5) |
| source ↔ dist | ✅ | date-picker/time-picker 의 css·js 4파일 + mobile 예제 + `calendar.svg` `diff` 차이 0 |
| 전체묶음 ↔ 개별설치 | ✅ | 두 소비자 페이지 full-page 스크린샷 **sha1 동일**(`2496dbc7…`) |
| 검수 화면의 dist 의존 | ✅ | `ui-review.html` 인라인 CSS 의 date-picker 규칙은 레이아웃 2줄(`:191`,`:193`)뿐, 컴포넌트 CSS 재작성 없음 |
| **time-picker 모바일 휠 시트** | ✅ 회귀 없음 | 검수 화면 "승인 완료(참고)" 탭에서 실측 — TimeOnly `hour24/colon/minute60`, DateTime `ampm2/hour12/colon/minute60`+탭 2개, 시트 패널 **360×448**, 열면 포커스 `sheet-close`, Esc 닫힘+트리거 복귀+스크롤 해제 |
| 콘솔·네트워크 | ✅ | 현재 로드의 네트워크 요청 전부 200/304, 404 0건 |

## ❓ (c) 판단이 필요한 것 2건

### C-5. 열린 상태로 `destroy()` 하면 시트가 열린 채 남고 스크롤 잠금이 풀리지 않는다

- 실측: init→열기(`body.overflow="hidden"`)→`destroy()` → 시트 `hidden=false` 유지, `body.overflow` 계속 `"hidden"`, 배경 클릭·닫기·Esc 는 이미 해제돼 **되돌릴 방법이 없다**.
- 계약(`ui-library-code-contract.json:231` "destroy는 등록한 이벤트·observer·timer를 해제해야 한다")은 만족한다 — 스크롤 잠금 원복은 어디에도 선언돼 있지 않다.
- 다만 승인된 형제는 다르다: `time-picker.js` 의 `destroy()` 는 **첫 줄에서 `close({returnFocus:false})`** 를 부른다. date-picker 에는 그 한 줄이 없다.
- 계약 문구를 넓힐지(= 결함) / 선언 없는 차이로 둘지 판단이 필요하다. 검증자가 임의로 기준을 만들지 않는다.

### C-6. 이번에 만든 time-picker 휠 시트가 river 검수 대상 밖에 놓여 있다

- 검수 화면 탭은 "이번에 볼 것 **1개**"(= date-picker)와 "승인 완료(참고) **16개**"로 갈린다. 이번 작업에서 새로 만든 **time-picker 모바일 휠 시트는 '승인 완료(참고)' 쪽**에 들어가 있어 기본 화면에서 보이지 않는다.
- time-picker 자체는 승인(approved)됐지만 **휠 시트는 이번 라운드 신규**다. 이대로면 river 가 새 부분을 보지 못한 채 승인이 끝난다. 노출 위치 조정 여부는 오케스트레이터 판단 사항.

## (D) CU-3(일요일 빨강·토요일 파랑) 기록 정합 — ✅ 기록은 사실과 일치

- `workflow-state.json` `coreUpdates` CU-3 · `blockers` B7(`needs-river`) 존재 확인.
- 기록 내용 검증: 정본 `buildCalendar` 요일 헤더 7칸은 전부 `dp("text/primary")`(3644-3650), 파일 전체에 `sunday`/`saturday` 참조 **0건**. 토큰은 `vars-data.ts:644-645` 에 실재(신설 아님). → 기록이 맞다. 유지/철회 판정은 river 몫.
- **river 결정에 도움될 추가 사실 1건:** 손관리 안내 페이지에 남아 있는 주석 `pages/components.html:881` — "설치기 정본: 전 요일 = date-picker/text/primary (gray/900). **주말 특별색 없음(사용자 결정 D — 경비업)**". 과거에 주말 색을 쓰지 않기로 한 결정이 기록돼 있다. (판정하지 않고 사실만 올린다.)
- C-3·C-4 는 위 (B) 로 해소됨을 확인했다.

## BLOCKED — 값·도구를 확보하지 못해 판정 불가

1. **빌드 결정론·`npm run ui:test` 재확인 불가.** 지금 `npm run ui:build` 는 `input canonicalFingerprint is stale` 로 즉시 실패한다. 원인은 이 작업이 아니다 — 워킹트리의 `build-components.ts` 가 **또 바뀌었다**(상태 파일 기록 `6253ecac…` → 현재 `db6d2283…`, `+62/-9`). 변경 hunk 는 전부 GNB 구간(2809~3311)이고, **date-picker 정본 구간(`buildCalendarCell`~`buildTimePickerMobileBottomSheet`)은 HEAD 와 바이트 동일**(sha256 `4cecb4df…` 일치)이라 위 기하 대조는 유효하다. 다만 dist 재생성·결정론·`ui:test` 는 지문 정리 전에는 확인할 수 없다.
2. **`npm run gate:check` = 7 error** (1차 때는 5). 선언된 블로커 B5(`uistate:date-picker.*` 5건) 외에 **2건이 늘었다**: ① Gate 13 "build-components.ts 가 마지막 검증 이후 변경됨(검증 기록 stale)" ② Gate 34 `componentprop:Logo`. 둘 다 위 GNB 변경(다른 세션 작업)에서 나온 것으로 보이며 date-picker 승격 전에 정리돼야 한다.
3. Figma V3.0 캔버스 대조(MCP 인증 미완) · 실제 터치 기기 · 스크린리더 낭독 — 1차와 동일하게 미검증.
4. 화살표/Home/End 전 조합의 포커스 이동 — 이번 라운드에서도 재현하지 않았다(1차 미검증 항목 그대로).
5. **다크 모드에서의 F-1~F-4 재확인**: 아이콘 크기(dark 인스턴스 포함 전수)·시트 열림(dark live)·6주 패널(dark)은 확인했으나, destroy·Tab 순환은 Light 에서만 확인했다.

## 스크린샷 (2차)

| 파일 | 내용 |
|---|---|
| `screens/verify2-review-overlay-block.png` | R-1 — 검수 화면 전체가 정적 시트 오버레이에 덮인 상태 |
| `screens/verify2-panel-6week.png` | C-2 — 6주(2026-08) Light·Dark + 5주(2026-09) 패널 |
| `screens/verify2-icon-sizes-and-sheet.png` | F-1 4크기 아이콘 실물 + F-2/F-3 모바일 시트 렌더 |
| `screens/verify2-guide-nav-disabled.png` | (B) 안내 페이지 Date Picker 메뉴 비활성 상태 |

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **blocked**
- `uiLibraryStatus`: **draft** 유지
- `lastCompletedCheckpoint`: **3 유지** (4 미통과)
- `nextAction`: ❌ R-1(차단급)·R-2·R-3 수정 → 3차 재검증. ❓ C-5·C-6 은 오케스트레이터 판단. 그와 별개로 **build-components.ts 지문 정리(Gate 13·Gate 34 Logo)** 가 선행돼야 `ui:build`/`ui:test`/gate 가 다시 돌아간다. 그 다음 5-human-review 와 Gate 34 승인 인용을 요청한다.

---

# 재검증(3차) — 2026-09-03

- 검증 주체: 🤖 component-verifier (시나리오 F) — 구현자와 분리. 위 1차·2차 판정은 그대로 보존한다.
- 범위: (A) 수정 4건(R-1·R-2·R-3·C-5) 실측 확인 + **그 수정이 건드린 코드 경로의 이웃** · (B) 회귀 전수 · (C) 저장소 상태 재확인.
- 3-build §11 의 자기보고는 근거로 쓰지 않고 **검증 대상**으로만 다뤘다.
- 렌더는 전부 http(`127.0.0.1:4173`). 뷰포트 1280×900. Browser pane 이 hidden 이라 `computer{screenshot}` 이 빈 화면을 주는 문제는 `node scripts/render-shot.js` 로 우회했다.

## 전체 판정

**FAIL** — 지시받은 수정 4건은 **전부 PASS**이고 회귀도 없다. 그러나 **같은 라운드의 형제 표면에 같은 결함이 남아 있다**: ❌(a) 2건(V-1·V-2). 둘 다 date-picker 자체의 코드가 아니라 **이번 라운드에 함께 만든 안내·검수 표면**이며, R-3·F-2 수정이 date-picker 쪽에서 멈춘 자리다.

---

## (A) 수정 4건 — 전부 PASS

| 항목 | 판정 | 실측 근거 |
|---|---|---|
| **R-1** 검수 화면 오버레이 차단 | ✅ PASS | 새로고침 직후 조작 전: 열린 정적 시트 4개 전부 `position:relative`(`.is-review-inline`), 지면 안에 눕혀 렌더. `elementFromPoint` 7개 지점 전부 정상 콘텐츠(H1/SECTION/LI/HEADER/MAIN). **페이지의 상호작용 요소 1,645개 중 정적 시트 4개와 겹치는 것 0개**(사각형 교차 전수). 18개 컴포넌트 36개 표본 스크롤 후 중심 hit-test **차단 0건**. 정적 표본의 죽은 컨트롤은 tab 순서 밖(`sheet-close`·`apply`·cell 35개 `tabindex=-1`, prev/next/year/month 는 `disabled`) — 정적 시트 안 초점 가능 요소 **0개**. |
| **R-1 라이브 회귀** | ✅ PASS | "실제로 눌러보기" 모바일 인스턴스는 여전히 **진짜 오버레이** — `position:fixed`, 1280×900 전면, `is-review-inline` 없음, 중앙 hit-test 가 시트 내부(`sheet-header`), 날짜칸 35개, 열 때 포커스 `sheet-close`, `body.overflow=hidden`, Esc → 닫힘 + 트리거 복귀 + overflow 원복. |
| **R-2** 패널 박스모델 | ✅ PASS | 라이브 PC 인스턴스 실측 — 5주(2026-09·10·11·12·2027-02·03): **바깥 352 · 내용 312 · 위 20 · 아래 20 · 좌 24 · 우 24**, 6주(2027-01): 396(=352+44), 아래 여백 20 유지, 잘림 0. `border: 0px none`(레이아웃 미관여), 테두리는 `box-shadow: inset 0 0 0 1px`. **그림자 소실·상쇄 없음** — 계산값 `rgb(217,217,217) 0 0 0 1px inset, rgba(0,0,0,.15) 0 4px 8px` 두 층 동시 존재(#D9D9D9 = gray/200 = `date-picker/panel/border` 정본값). Year·Month 화면도 동일(352/312/20·20, gap 20, 타일 88×56 r4 16px Medium, grid gap 12, 12칸). **덤으로 2차 때 지적된 가로 1px 번짐도 해소** — 캘린더 308 = 내용상자 308(356−24×2). |
| **R-2 다크** | ✅ PASS | `data-theme="dark"` 구간 실측: 테두리 `rgb(62,64,73)`=#3E4049=gray-dark/500(정본), 패널 bg #1C1D23 대비 보임. 그림자 층 유지, 기하 동일(352/312/20). 실제 렌더 `verify3-static-sheet-dark.png`. |
| **R-3** 시트 접근 가능한 이름 | ✅ PASS | 검수 화면 sheet-panel **12개 전부** `aria-labelledby` 보유, 가리키는 id 전부 같은 패널 안에 실재(orphan 0). **문서 전체 226개 id 중 중복 0건.** id 발급기를 modal 과 공유하지만 접두사가 갈려 충돌 불가(`date-picker-sheet-title-15~20·35~40` ↔ `review-modal-title-747~751`) — 실측으로도 중복 0. |
| **C-5** 열린 채 destroy | ✅ PASS | dist 모듈 직접 로드 실측: 열림(`body.overflow=hidden`) → `destroy()` → **시트 닫힘·`aria-expanded=false`·`body.overflow=""`**. destroy 후 트리거 클릭 무반응(리스너 잔존 0). 재 `init()` → 정상 열림(칸 35), Esc 닫힘·overflow 원복. 소스 대조: 등록 11건 ↔ 해제 11건 + `disconnect()` **1:1**, `destroy()` 첫 줄 `close({returnFocus:false})` — 승인된 `time-picker.js:451-452` 와 동일 형태(새 기준을 만들지 않았다). |

## (B) 회귀 — 전부 PASS

| 항목 | 판정 | 근거 |
|---|---|---|
| 트리거 기하·아이콘 | ✅ | 검수 화면 52개 전수: `xxsm h28/icon 20×20`(8) · `xsm h34/24×24`(8) · `md-pc h44/24×24`(24) · `md-mobile h48/24×24`(12). 패딩 16/8 · radius 4 · min-width 180 전부 동일(정본 3691-3699 · `fcIconPx` 1256). |
| 날짜칸·기간 밴드 | ✅ | 칸 outer 44×44 / inner 30×30 `radius 9999px` / border 1px. 밴드 `height 30 · top 7`, start/mid/end 5칸 전부 `#E2F1FF`(= `cell/bg/range`) 한 색. |
| HEX 0 · 새 토큰 0 | ✅ | `date-picker.css`·`time-picker.css` 에 `#`/`rgb(`/`hsl(` **0건**. `npm run css:varcheck` = 참조 917건 전부 정의에 닿음, newGaps 0(동결 6건은 기존 부채). |
| D4 역순 입력 | ✅ | 17 클릭 → `26.09.17 -` / 10 클릭 → **`26.09.10 -`**(새 시작일, 자동 뒤집기 없음) / 20 클릭 → `26.09.10 - 26.09.20` 확정 후 닫힘. |
| D6 미리보기 | ✅ | 시작일만 고른 상태 hover → 밴드 5칸(start·mid×3·end), 색 1종, h30/top7. |
| D5 연·월 진입 | ✅ | 헤더 `year-label`·`month-label` 각각 클릭 → Year·Month 화면 전환, 타일 선택 시 되돌아옴. |
| PC 팝오버 위치·뒤집기 | ✅ | 아래 여유 있을 때 `data-flip` 없음 · 트리거 아래 **gap 8**. 트리거를 화면 하단(top 810/vh 900)으로 밀면 `data-flip="up"` + 트리거 위 **gap 8**. 바깥 `pointerdown` → 닫힘. |
| 키보드·ARIA·Esc·포커스 복귀 | ✅ (일부 보류) | 열림 시 `role=dialog`·`role=grid`·row 5·gridcell 35·`aria-selected` 35/35·`aria-haspopup=dialog`. `ArrowLeft/Right/Up/Down·Home·End·PageUp/PageDown` **전부 `preventDefault` 처리**, PageDown/Up 로 달 이동, 09-30에서 ArrowRight → 10월, 09-01에서 ArrowLeft → 이전 달로 넘어감. Enter → `26.09.15` 선택·닫힘·**트리거 포커스 복귀**. Esc(격자 안) → 닫힘 + 트리거 복귀. ※ 화살표 이동 뒤 **초점이 어느 칸에 앉는지**는 이번에도 미검증(아래 참조). |
| 모바일 시트 | ✅ | 라이브: fixed 전면·포커스 진입·Esc 닫힘·복귀·스크롤 잠금 해제. 정적 표본: 지면 안 356×488, 상단 radius 8, `padding-block 20`, `gap 32`, `surface/raised`(light #FFF · dark #1C1D23), 적용 버튼 존재. |
| **time-picker 목록 모드·휠 시트** | ✅ 회귀 없음 | 목록 모드 PC·Mobile 정상 개폐. 휠 시트(승인완료 탭에서 실측): 패널 **360×448**, `hour 24 · colon · minute 60`, 열림 포커스 `sheet-close`, `body.overflow=hidden`, Esc → 닫힘 + **트리거 복귀** + overflow 원복. ※ 접근 가능한 이름은 V-1 참조. |
| source ↔ dist | ✅ | date-picker·time-picker 의 css·js 4파일 + 예제 2개 `diff` 차이 0. |
| 빌드 결정론 | ✅ | `npm run ui:build` 실행 전 dist 해시 = 1회차 = 2회차 **모두 동일**(`3187b773…`) — 손편집·드리프트 0, 재생성해도 같은 결과, 110 files. |
| 전체묶음 ↔ 개별설치 | ✅ | `<main>` 정규화 DOM **완전 동일**(10,230자). 두 소비자 페이지 full-page 렌더 **sha1 동일**(`155f9b4f…`). |
| 빈 HTML 소비 | ✅ | 두 소비자 페이지 모두 date-picker 1개 포함, 404 0건. |
| 검수 화면의 dist 의존 | ✅ | R-1 이 추가한 규칙은 `inset:auto; position:relative;` **레이아웃 2줄뿐**이고, 승인된 `[data-s1-component="modal"].is-review-inline` 과 같은 방식·같은 클래스명이다. 컴포넌트 시각 CSS 재작성 없음. |
| 콘솔·네트워크 | ✅ | 새 로드 기준 실패 리소스 0건, 오류 배너 0. (콘솔 버퍼에 남은 `s1-ui.js` 404 는 **내가 검증 중 `ui:build` 를 돌려 dist 를 재생성하던 순간**의 것으로, curl 재확인 결과 전부 200.) |
| 검사기 | ✅ | `ui:contract` PASS(errors=0) · `ui:build` PASS(110 files) · `ui:test` PASS · `ui:icons` PASS(icons=13 errors=0). |

## ❌ (a) 새로 발견 2건 — 이번 수정이 **멈춘 자리**

### V-1. time-picker 휠 시트 대화상자에 접근 가능한 이름이 없다 (R-3 수정이 date-picker 에서 멈춤)

- 배포 예제는 선언대로다 — `ui-library/src/components/time-picker/time-picker.mobile.example.html:25,53` 과 dist 예제 모두 `aria-labelledby="time-picker-wheel-title-…"` 를 갖고 있다.
- 그런데 **같은 컴포넌트의 검수·안내 화면 마크업은 그 속성이 없다**: `pages/ui-review.html:1420` · `assets/js/ui-library-guide.js:1580` 둘 다 `role="dialog" aria-modal="true" tabindex="-1"` 만 낸다.
- 실측: 검수 화면 time-picker sheet-panel **4개 전부** `aria-labelledby=null`. **안내 페이지(`pages/components.html` → Time Picker)에서도 2개 전부 null** — time-picker 는 이미 approved 라 **오늘 실제로 배포돼 있는 상태**다.
- R-3 과 완전히 같은 결함이고, 이번 라운드에 함께 만든 휠 시트(D2)에서 발생했다. R-3 수정은 date-picker 마크업만 고쳤다.
- 참고로 time-picker manifest 의 `a11y.accessibleName` 은 트리거·컬럼만 말하고 **이번에 추가된 시트 대화상자를 아직 언급하지 않는다** — 선언도 함께 현행화가 필요하다. 어느 쪽으로 맞출지(양쪽에 `aria-labelledby` 추가 / 선언에 "시트는 이름 불필요"를 명시)는 구현자·river 몫이며, 검증자가 정하지 않는다. 다만 **같은 컴포넌트의 배포본과 검수·안내본이 서로 다른 지금 상태는 어느 해석으로도 성립하지 않는다.**

### V-2. 안내 페이지 렌더러의 모바일 date-picker 표본이 시트를 못 연다 (F-2 수정이 검수 화면에서 멈춤)

- `assets/js/ui-library-guide.js:1795 datePickerMarkup()` 은 `breakName` 을 **분기에 쓰지 않는다**(래퍼 속성으로만 사용) — 모바일이어도 `data-s1-part="panel"` 만 만들고 `sheet`/`sheet-panel`/`calendar-wrap` 을 만들지 않는다. 실측: 함수 본문에 `data-s1-part="sheet"` **0건**.
- `date-picker.js:315` 는 `brk === "mobile"` 일 때 sheet 안 캘린더를 찾지 못하면 `init` 을 `null` 로 끝낸다 → **모바일 표본은 눌러도 아무 일이 없다.**
- 그런데 같은 블록의 안내문은 "모바일 트리거 — **누르면 바텀시트가 열립니다(M7)**"(`:1864`)이고, 그 아래 표본 2개(단일·기간)는 `isPreview` 없이 **라이브로 렌더된다**(`:1868`).
- 이것은 1차 F-2 와 **완전히 같은 결함**이 `pages/ui-review.html` 이 아니라 안내 페이지 렌더러에 남아 있는 것이다. F-2 수정은 검수 화면만 고쳤다.
- 지금은 date-picker 가 draft 라 안내 메뉴가 `disabled` 이고(확인함: 안내 페이지의 date-picker 인스턴스 0개) **사용자에게 보이지 않는다** — 즉 잠복 상태다. 그러나 **승격(6-promotion) 시 nav 를 여는 순간 그대로 배포된다.** 승격 전 반드시 처리돼야 한다.
- (draft 라 렌더 판정이 불가능해 **코드 경로와 호출부로 확인**했다. 안내 페이지 렌더러는 `date-picker 배포 상태가 verified 또는 approved가 아닙니다` 로 그리기를 거부한다.)

## (C) 저장소 상태 — 오케스트레이터 안내 재확인

| 주장 | 내 확인 | 결과 |
|---|---|---|
| date-picker 정본 구간이 HEAD 와 바이트 동일 | `buildCalendarCell` ~ `buildCalendarCellLayout` 직전을 현재본(3372–4622)·HEAD(3319–4570)에서 각각 잘라 sha256 대조 → **`8483a27f5556f1a7…` 일치** | ✅ 사실 (해시값이 안내문의 `57b7fbe0…` 과 다른 건 자르는 경계가 달라서다 — 동일성 결론은 같다) |
| 변경 hunk 는 전부 GNB 구간 | `git diff -U0` hunk 8개 전부 2809~3315(= `GNB_UTIL_SVGS`·`fillGnbMenu`·`buildGNB`) | ✅ 사실 |
| 줄번호 +53 이동 | `buildCalendarCell` 3319 → **3372** | ✅ 사실 |
| 지문 갱신 후 `ui:build`·`ui:test` PASS | 직접 실행 — build 110 files, test PASS, 2회 재생성 해시 동일 | ✅ 사실 |
| gate 7 error 중 5건 = B5, 2건 = 다른 세션 GNB | `--verbose` 실측: `uistate:date-picker.{default,disabled,filled,hover,open}` 5건 + `componentprop:Logo` + Gate 13(build-components 검증기록 stale) | ✅ 사실 — **date-picker 결함으로 판정하지 않음** |

## 이월된 미결(이번에 새로 판정하지 않음)

- **B5** Gate 34 `uistate:date-picker.*` 5건 — river 타이핑 승인 대기.
- **B7 / CU-3** 일요일 빨강·토요일 파랑 — river 결정 대기(2차에서 사실관계 확인 완료).
- **C-6** 이번에 만든 time-picker 휠 시트가 검수 화면 "승인 완료(참고)" 탭에 있어 기본 화면에서 안 보인다 — 오케스트레이터가 `ui-library-migration.json` 에 `pendingAddition` 으로 기록했음을 확인. **V-1 이 바로 이 시트에서 나왔다는 점이 C-6 의 위험을 실증한다**(새로 만든 부분이 검수 시야 밖에 있으면 결함도 시야 밖에 있다).

## 검증하지 못한 범위 (정직 고지)

1. **화살표/Home/End 이동 뒤 초점이 앉는 칸** — `date-picker.js:492` 의 `focus()` 가 `requestAnimationFrame` 안에 있고, Browser pane 이 hidden 이라 rAF 가 발화하지 않는다(1·2차와 같은 한계). 키가 **처리되는 것**(`preventDefault`)과 **달 이동·선택·Esc 복귀**는 이번에 전수 확인했다. 사람이 실제 브라우저에서 한 번 눌러보는 확인이 남는다.
2. **실제 터치 기기**의 시트 스와이프·휠 관성 스크롤.
3. **스크린리더 실제 낭독** — 역할·이름 속성만 봤다.
4. **Figma V3.0 캔버스 대조** — MCP 인증 미완(상태 파일이 `requiredForInventory:false` 로 선언).
5. **안내 페이지의 date-picker 실렌더** — draft 라 렌더러가 그리기를 거부한다. V-2 는 코드 경로로만 판정했고, 승격 후 실렌더 재확인이 필요하다.
6. **여러 인스턴스 동시 열림** 시 바깥클릭·Esc 우선순위 — 순차 개폐만 확인.

## 스크린샷 (3차)

| 파일 | 내용 |
|---|---|
| `screens/verify3-review-top-clean.png` | R-1 — 검수 화면 최상단이 덮이지 않음(2차 `verify2-review-overlay-block.png` 와 대비) |
| `screens/verify3-dp-section.png` | 검수 화면 Date Picker 구간 진입부(PC·Mobile 칸) |
| `screens/verify3-open-panel-and-sheet.png` | R-2 — 열린 패널 실물(테두리 + dropdown 그림자 동시 표시), Year·Month 화면 |
| `screens/verify3-static-sheet-light.png` / `verify3-static-sheet-dark.png` | R-1 — 정적 "Open" 시트가 지면 안에 눕혀 열린 모습으로 보임(라이트·다크) |

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **blocked**
- `uiLibraryStatus`: **draft** 유지
- `lastCompletedCheckpoint`: **3 유지** (4 미통과)
- `nextAction`: ❌ V-1(이미 배포돼 있음 — 우선) · V-2(승격 전 필수) 수정 → 해당 부분만 4차 확인. 그와 별개로 date-picker 자체(소스·dist·검수 화면)는 이번 라운드로 **깨끗하다**.

---

# 재검증(4차 · 최종) — 2026-09-03

- 검증 주체: 🤖 component-verifier (시나리오 F) — 구현자와 분리. 1·2·3차 판정은 그대로 보존한다.
- 범위(지시대로 좁힘): (A) V-1·V-2 수정 확인 · (B) 이번에 건드린 3파일의 회귀 · (C) 형제 표면 전수 훑기 주장 검증. **3차에서 PASS 난 date-picker 본체 전수 대조는 반복하지 않았다.**
- 3-build §12 의 자기보고는 근거로 쓰지 않고 **검증 대상**으로만 다뤘다.
- 렌더는 전부 http(`127.0.0.1:4173`), 뷰포트 1280×900.

## 전체 판정

**FAIL** — 지시받은 수정 **V-1·V-2 는 둘 다 PASS**이고, 지시한 회귀 범위에서 **회귀 0건**이다. 그러나 이번에 만진 `time-picker` 휠 시트에서 **❌(a) 2건이 새로 나왔다**(W-1·W-2). 둘 다 **date-picker 본체가 아니라 이미 배포된 time-picker 휠 시트** 쪽이며, 3차 V-1 과 같은 계열(선언·정본과 구현이 어긋난 자리)이다.

---

## (A) 수정 2건 — 둘 다 PASS

### V-1. time-picker 휠 시트 접근 가능한 이름 — ✅ PASS

| 확인 대상 | 실측 | 결과 |
|---|---|---|
| **실제 배포 화면** `pages/components.html?platform=mobile#time-picker` | sheet-panel 2개 전부 `aria-labelledby` 보유 → `guide-time-picker-wheel-title-1`("시간 선택")·`-2`("시작 일시"), 가리키는 id 가 **같은 패널 안에 실재**. 문서 전체 id 365개 중 **중복 0**. | ✅ |
| 검수 화면 `pages/ui-review.html` | sheet-panel **16개**(date-picker 12 + time-picker 4) 전부 `aria-labelledby` 보유, **깨진 참조 0**. 문서 전체 id 230개 중 **중복 0**, 문서 전역 orphan **0**. | ✅ |
| 배포 예제(dist·src) | `date-picker.mobile.example.html` 1건 · `time-picker.mobile.example.html` 2건 — 이미 보유(3차 확인 그대로). | ✅ |
| 동작 회귀(배포 화면 실측) | 트리거 클릭 → 시트 열림(`position:fixed`, 패널 **360** 폭), 포커스 시트 안(`sheet-close`), `body.overflow=hidden` → **적용** 클릭 시 값 `00:00` 반영·닫힘 / **Esc** → 닫힘 + **트리거 포커스 복귀** + overflow 원복. 휠 열 `hour 24 · colon · minute 60`. | ✅ |
| manifest `a11y.accessibleName` 선언 ↔ 구현 | 선언: "…wheel 모드(data-mobile-ui=wheel): sheet-panel 은 aria-labelledby 로 sheet-title 을 가리킨다" — **구현과 일치**. | ✅ |
| **새 상태 이름이 늘지 않았는가** | `npm run canon:check` = `tracked=614 added=6`. 6건 내역: `uistate:date-picker.{default,disabled,filled,hover,open}` **5건(= 선언된 블로커 B5, river 타이핑 승인 대기)** + `componentprop:Tabs` **1건**. 검사기 소스 확인 결과 `componentprop:*` 는 `build-components.ts` 를 훑어 만든다(`canon-addition-check.js:119,124`) → **다른 세션의 GNB 편집** 소관(3차의 `componentprop:Logo` 가 `Tabs` 로 바뀌고 `Menu` 가 사라진 것도 같은 이유). `uistate:*` 는 `registry/components/*.json` 의 states 에서 나오며 `registry/components/time-picker.json` 은 이번에 **수정되지 않았다**(git status). → **manifest 수정이 Gate 34 대상 항목을 1건도 늘리지 않았다.** | ✅ |

### V-2. 안내 페이지 렌더러의 모바일 date-picker 표본 — ✅ PASS

**구현자가 쓴 검증 방식에 대한 내 판단:** 3-build §12 는 "`datePickerMarkup` 이 의존하는 순수 문자열 함수들을 그대로 추출해 Node 에서 직접 실행"했다. 이 방법은 **문법·분기 로직은 보여주지만 두 가지를 증명하지 못한다** — ① 추출한 사본이 실제 파일과 같다는 보장이 없고(복사 시점의 스냅샷) ② 그 마크업이 **실제 dist 런타임(`date-picker.js init()`)에 물려 동작하는지**는 전혀 건드리지 않는다. V-2 의 원래 결함이 바로 "init 이 null 로 끝나 눌러도 아무 일이 없다"였으므로, **문자열이 맞는지가 아니라 런타임이 붙는지가 판정 대상**이다. 따라서 재사용하지 않고 아래 방법으로 교차 확인했다.

**내 교차 확인 방법(독립):** 실제 `pages/components.html` 을 그대로 가져와 `<head>` 에 `fetch` 후킹 한 줄만 넣어 **`date-picker.manifest.json` 의 status 만 `approved` 로 보이게** 한 iframe 을 띄웠다. 즉 **승격 직후의 안내 페이지를 그대로 재현**한 것이고, 렌더러·마크업·CSS·dist 런타임은 전부 저장소의 진짜 파일이다(사본·추출 없음).

| 항목 | 실측 | 결과 |
|---|---|---|
| 렌더 거부 해제 후 실제 그려짐 | date-picker 인스턴스 **28개** 생성, 섹션 문구 정상 | ✅ |
| **모바일 표본이 sheet 를 만드는가** | mobile 2개(단일·기간) 전부 `sheet` **있음** / `panel` **없음** / `calendar-wrap` **있음** / `aria-labelledby` 보유 | ✅ |
| PC 경로 회귀 | pc 26개 전부 `panel` 있음 · `sheet` 없음 | ✅ |
| **실제로 눌러서 열리는가**(1차 F-2 의 실패 지점) | 두 인스턴스 모두 클릭 → `aria-expanded=true`, `sheet.hidden=false`, `position:fixed inset:0`, **날짜칸 35개**, `적용` 버튼 존재, `body.overflow=hidden` → **Esc 로 닫히고 overflow 원복** | ✅ |
| id 고유성 | 문서 전체 **중복 0**. sheet-title id 4개(`guide-date-picker-sheet-title-27·28`, `guide-time-picker-wheel-title-1·2`) — date-picker 와 time-picker 가 **각자 다른 카운터**를 써서 접두사·번호 모두 충돌 불가 | ✅ |
| 화면을 덮지 않는가(R-1 계열 회귀) | 기본 상태에서 sheet 2개 전부 `hidden` · 화면 전역 격자 hit-test **차단 0점** · 폭 400 초과 보이는 `position:fixed` 요소 **0개** | ✅ |

**`.is-preview` 선례 주장 검증 — 사실이다(단, 단서 있음).**
`assets/css/ui-library-guide.css` 의 `.uilg [data-s1-component="modal"].is-preview { inset:auto; padding; position:relative }` 는 **HEAD(커밋본)에 이미 존재**한다(`git show HEAD:` 로 확인). `pages/ui-review.html` 의 `[data-s1-component="modal"].is-review-inline` 도 HEAD 에 존재한다. → "새 클래스를 만들지 않고 기존 선례를 재사용했다"는 주장은 **참**이다.
단서: modal 은 루트 자체가 오버레이라 `.is-preview` 가 루트에 걸리지만, date-picker 는 오버레이가 자식(`sheet`)이라 이번 규칙은 `.is-preview [data-s1-part="sheet"]` 형태다. 방식은 같고 새 클래스도 없으니 문제는 아니다. **다만 아래 O-3 참조 — 이 규칙은 현재 걸리는 대상이 하나도 없다.**

---

## (B) 회귀 — 지시 범위 전부 PASS

| 대상 | 실측 | 결과 |
|---|---|---|
| **검수 화면 date-picker** 정적 시트 | 정적 "Open" 표본 4개 전부 `position:relative`(`is-review-inline`), 폭 356 으로 **지면 안에 누움**. 나머지 8개는 `hidden`. 화면 격자 hit-test **차단 0점**, 보이는 대형 fixed 요소 **0개** | ✅ |
| 검수 화면 라이브 모바일 시트 | **진짜 오버레이** — `fixed`, 1280×900, 패널 360, 포커스 시트 안(`sheet-close`), `body.overflow=hidden` → Esc 닫힘 + overflow 원복 | ✅ |
| 검수 화면 라이브 PC 패널 **352/312/20** | 실측 **바깥 높이 352 · 내용 높이 312**(패딩 위 20 / 아래 20) · 바깥 폭 356 · 내용 폭 **308 = 캘린더 308** · 좌우 패딩 24 · `border: 0px none` · 그림자 2층 `inset 0 0 0 1px rgb(217,217,217)` + `rgba(0,0,0,.15) 0 4px 8px` 동시 존재 | ✅ (R-2 유지) |
| 검수 화면 id | 총 230개 · **중복 0** · orphan **0** | ✅ (R-3 유지) |
| **안내 페이지 time-picker 목록 모드·휠 시트** | approved 배포 화면에서 정상 개폐·적용·Esc·포커스 복귀(위 V-1 표) | ✅ (수치 1건은 W-2) |
| **다른 컴포넌트 섹션이 안 깨졌나** (guide.js 는 전 컴포넌트 공용) | 8개 섹션 실제 렌더 확인 — input 33 · button 64 · select 56 · modal 12 · table 40 · tab 4 · dropdown 114 인스턴스 정상 생성, **JS 오류 0건**. date-picker 만 선언된 draft 거부 문구(정상). 렌더 스크린샷으로 Select·Time Picker 육안 확인 | ✅ |
| `npm run ui:guide:render` | **PASS** — 18종 × PC·Mobile 실제 렌더 대조 | ✅ |
| `npm run ui:contract` | PASS · errors=0 | ✅ |
| `npm run ui:icons` | PASS · icons=13 errors=0 | ✅ |
| **source ↔ dist** | `date-picker`·`time-picker` 의 css·js **diff 차이 0**. manifest 도 동기 — `a11y.accessibleName` 문자열 일치, 지문·버전 일치(time-picker 0.2.0) → **V-1 의 manifest 수정이 dist 까지 반영돼 있다** | ✅ |

---

## ❌ (a) 새로 발견 2건 — 둘 다 time-picker 휠 시트(이미 배포됨)

### W-1. manifest 가 선언한 시트 포커스 위치와 구현이 다르다

- 선언(`ui-library/src/components/time-picker/manifest.json` `a11y.focus`): "**wheel 시트가 열리면 첫 wheel-col 로 포커스 이동**, 닫히면 트리거로 복귀".
- 구현(`ui-library/src/components/time-picker/time-picker.js:399-400`): `sheetFocusables(sheetPanel)[0]` 를 잡아 포커스한다. DOM 순서상 첫 초점 대상은 헤더의 **`sheet-close`** 다(`wheel-col` 은 `tabIndex=0` 이지만 헤더보다 뒤에 있다 — `:291`).
- **실측 4곳 전부 `sheet-close`**: 검수 화면 4개 인스턴스(TimeOnly 448·DateTime 512) + 배포된 안내 화면 — 어느 곳에서도 `wheel-col` 로 가지 않는다.
- 이 `a11y.focus` 문장은 이번 작업에서 **새로 추가된 줄**이다(`git diff` 의 `+` 행). 3차 V-1 이 지적한 것과 **같은 계열**(선언이 구현을 따라가지 못함)이고, 구현자가 **바로 그 a11y 블록을 손보면서** 옆 항목을 맞추지 않았다.
- 어느 쪽으로 맞출지(선언을 "시트 안 첫 초점 대상"으로 고칠지 / 구현을 wheel-col 로 옮길지)는 검증자가 정하지 않는다. **다만 지금 상태는 어느 해석으로도 성립하지 않는다** — date-picker 의 같은 항목은 "시트 안으로"라고 써서 구현과 맞는다.

### W-2. 시트 제목의 줄높이가 정본에 없고, 그래서 **검수 화면과 배포 화면이 서로 다르게 보인다**

- 정본: `build-components.ts:4042` 가 `makeBoundText(titleText, 20, "Bold", …)` → 텍스트 스타일 **title/20B = 20px · lineHeight 130%(=26px)**(`textstyles-data.ts:41`).
- 배포 CSS(`dist/components/time-picker.css:267-272`, `date-picker.css` 동일)는 `color·font-family·font-size·font-weight` 만 선언하고 **`line-height`·`letter-spacing` 을 선언하지 않는다.** 그래서 줄높이가 **호스트 페이지에서 상속**된다.
- 실측 결과 같은 dist 컴포넌트가 화면마다 다르게 렌더된다:

| 화면 | 상속된 line-height | sheet-title 높이 | **시트 패널 높이(TimeOnly)** |
|---|---|---|---|
| 검수 화면 `ui-review.html` | `normal` | 24px | **448** (=20+24+32+272+32+48+20) |
| **배포된 안내 화면** `components.html` | **32px**(페이지 기본 1.6 상속) | 32px | **456** |
| 정본 title/20B | 26px(130%) | 26px | 450 |

- 즉 **river 가 검수 화면에서 본 것(448)과 사용자가 배포 화면에서 보는 것(456)이 다르고, 둘 다 정본(450)과 다르다.** date-picker 의 sheet-title 도 같은 규칙이라 승격 시 같은 증상이 그대로 따라간다(iframe 재현에서 안내 화면 line-height **32px** 확인).
- 정본↔파생 문제이므로 두갈래 저울질 대상이 아니다(하드룰 H6) — 파생(dist CSS)이 정본 줄높이를 표현해야 한다. 승인된 형제 `modal.css:51-56` 은 실제로 `line-height: var(--line-height-130)` 을 선언한다 — **라이브러리 안에 올바른 선례가 이미 있고 이번 작업이 그것을 따르지 않았다.**
- **범위 판단은 오케스트레이터 몫:** 같은 누락이 이번 작업 밖에도 있다(`line-height` 선언 0건인 dist CSS = dropdown·filter-chip·multi-toggle·pagination·select·tab·table·toggle·date-picker·time-picker). 나는 **이번 작업이 만든 두 시트 제목에서 실제 렌더 차이를 실측했다**는 사실만 ❌ 로 올리고, 라이브러리 전반의 정리 여부는 판정하지 않는다.

---

## ❓/ℹ️ 판정하지 않고 사실만 올리는 것 3건

- **O-1 (이번 작업 아님·기존 부채).** 안내 페이지 전역에 **깨진 `aria-labelledby` 18건** — `assets/js/ui-library-guide.js:2018` 이 `aria-labelledby="${id}-code-title"` 를 내는데 그 id 를 **어디서도 만들지 않는다**. `git show HEAD:` 로 확인한 결과 **커밋본에 이미 있던 것**이라 이번 라운드와 무관하다. 검수 화면에는 없다(orphan 0). 별건으로 올린다.
- **O-2 (뒷정리).** 저장소 루트에 구현자가 남긴 임시 파일 2개가 추적되지 않은 채 있다 — `tmp-dp-check.html`, `tmp-dp-check2.html`(후자는 `data-s1-component="date-picker"` 를 포함해 내 전수 훑기에 걸렸다). 커밋 전에 지워야 한다.
- **O-3 (관찰).** V-2 가 추가한 `assets/css/ui-library-guide.css:551` 규칙 `.uilg [data-s1-component="date-picker"].is-preview [data-s1-part="sheet"]` 은 **현재 걸리는 대상이 0개**다 — 안내 페이지의 date-picker 모바일 표본 2개는 전부 라이브(`isPreview:false`)이고, 정적 미리보기는 PC(=`panel`)뿐이다. 방어적으로 둔 것이라 해롭지 않지만, **V-2 의 "인라인화" 부분은 어떤 표본으로도 실증되지 않았다**(동작 복구 부분은 위에서 실증됨).

---

## (C) 형제 표면 전수 훑기 — 구현자 주장 검증 결과 **주장은 사실**

구현자는 "지시받은 4곳 + 확장 확인, 추가 발견 0건"이라고 보고했다. 훑는 방법(파일별 grep · 함수 정의 grep)이 **마크업 생성 자리를 놓칠 수 있는 방식**이라 내 방식으로 다시 훑었다.

| 내 훑기 | 결과 |
|---|---|
| 저장소 전역 `data-s1-part="sheet-panel"` (node_modules·.git 제외) | 15개 파일 — 소스는 `assets/js/ui-library-guide.js` · `pages/ui-review.html` · `src/components/{date,time}-picker/*.mobile.example.html` **4곳뿐**, 나머지는 전부 `dist/**`(빌드 산출물) |
| 저장소 전역 **`role="dialog" aria-modal="true"` 인데 `aria-labelledby` 가 없는 줄**(dist 제외, html·js 전수) | **0건** — 같은 유형의 잔존 결함 없음 |
| 저장소 전역 `data-s1-component="date-picker"`/`"time-picker"` (dist 제외) | 위 4곳 + 소비자 검증 페이지 + `auto-init.js`(배선만) + 보고서 md + **`tmp-dp-check2.html`(O-2)** |
| `empty-consumer*.html` 주장("mobile 인스턴스 자체가 없다") | 직접 확인 — 두 파일 모두 `data-break="pc"` 인스턴스만, `data-s1-part="sheet"` **0건**. **주장 사실** |
| `pages/components.html` 손관리 레거시 구간이 5번째 자리인가 | `ds-fc-sheet*` 는 filter-chip 용이고 date-picker 시트가 아니다 — 이 버그 유형의 대상 아님 |

→ **추가 발견 0건 주장은 내 훑기로도 재현된다.** 단 `tmp-dp-check2.html` 은 구현자 표에 없다(임시 파일이라 결함은 아니고 O-2 뒷정리 항목).

---

## (D) 저장소 상태 — 판정 대상 아님, 사실만 기록

- `npm run ui:build` **실패** — `input canonicalFingerprint is stale`. 직접 재계산해 보니 **date-picker·time-picker·input 3개 모두 stale** 이고, 원인은 셋이 공유하는 `canonicalSources` 의 `build-components.ts` 가 다른 세션 편집으로 계속 바뀌기 때문이다. **이 작업의 결함이 아니다.** `ui:test` 는 선행 실패로 미실행.
- 그럼에도 **현재 디스크의 dist 는 최신 소스와 동기**임을 확인했다(css·js diff 0, manifest a11y·지문·버전 일치) — 즉 내가 렌더로 검증한 화면은 이번 수정이 반영된 dist 다.
- `npm run canon:check` = added 6 (uistate:date-picker.* 5 = **B5**, componentprop:Tabs 1 = **다른 세션 GNB**) · removed 1(componentprop:Menu, GNB).

## 검증하지 못한 범위 (정직 고지)

1. **안내 페이지에서의 date-picker 포커스 이동·Tab 가둠** — 시뮬레이션 iframe 안에서는 `element.focus()` 자체가 듣지 않아(트리거에 직접 focus 를 걸어도 activeElement 가 바뀌지 않음) 측정 불가. 같은 dist 런타임을 **검수 화면(최상위 문서)에서는 실측 PASS** 했으므로 코드 경로는 같지만, 승격 후 실제 안내 페이지에서 한 번 더 봐야 한다.
2. **화살표/Home/End 이동 뒤 초점이 앉는 칸** — 1~3차와 동일한 한계(rAF 미발화). 미검증 유지.
3. 실제 터치 기기 · 스크린리더 실낭독 · Figma V3.0 캔버스 대조(MCP 인증 미완) — 1~3차와 동일하게 미검증.
4. **빌드 결정론·`ui:test`** — 위 (D) 사유로 이번 라운드에서 재확인 불가(3차에서는 PASS 했다).
5. W-2 의 **다크 모드·다른 크기에서의 실측**은 하지 않았다(Light·TimeOnly·DateTime 만).
6. date-picker 본체 전수 대조는 **지시대로 반복하지 않았다** — 3차 PASS 를 신뢰한 것이 아니라, 이번에 바뀐 3파일이 그 결론을 흔들지 않는지만(위 (B)) 확인했다.

## 스크린샷 (4차)

| 파일 | 내용 |
|---|---|
| `screens/verify4-review-top-clean.png` | 검수 화면 최상단 — 오버레이에 덮이지 않음(R-1 회귀 없음) |
| `screens/verify4-guide-timepicker-mobile.png` | 배포된 안내 화면 Time Picker(Approved v0.2.0) 정상 렌더 · Date Picker 메뉴는 비활성 |
| `screens/verify4-guide-select-regression.png` | 공용 렌더러(guide.js) 수정 후 다른 컴포넌트(Select) 정상 |
| `screens/verify4-review-datepicker-section.png` | 검수 화면(진입부) |

## 5단계·6단계로 넘겨도 되는가 — 명확한 의견

- **5-human-review(river 검수): 넘겨도 된다.** date-picker 본체는 3차에 이어 이번에도 깨끗하고, V-1·V-2 가 해소돼 검수 화면·배포 화면 모두 정상 동작한다. W-1·W-2 는 date-picker 의 모양·동작을 바꾸지 않으므로 river 가 지금 화면을 보고 판단하는 데 지장이 없다.
- **6-promotion(승격): 아직 안 된다.** ① W-1·W-2 미해소 ② W-2 는 **river 가 검수 화면에서 볼 시트 높이(448)와 승격 후 안내 화면에서 보일 높이(456)가 다르다**는 뜻이라, 고치지 않으면 "검수한 것과 배포된 것이 다르다"가 된다 ③ 선언된 블로커 **B5**(Gate 34 `uistate:date-picker.*` 5건 river 타이핑 승인)·**B7/CU-3**(주말 색) 미결 ④ O-2 임시 파일 정리.

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **blocked**
- `uiLibraryStatus`: **draft** 유지
- `lastCompletedCheckpoint`: **3 유지** (4 미통과)
- `nextAction`: V-1·V-2 는 종결. ❌ **W-1**(manifest a11y.focus ↔ 구현) · **W-2**(시트 제목 줄높이 누락으로 검수 화면 ≠ 배포 화면) 를 정리한 뒤 **그 두 항목만** 재확인하면 된다. 그와 별개로 5-human-review 는 지금 진행 가능하고, 승격은 B5 승인 인용·B7 결정·O-2 정리까지 함께 마쳐야 한다.

---

# 재검증(5차) — 2026-09-03

- 검증 주체: 🤖 component-verifier (시나리오 F) — 구현자와 분리. 1~4차 판정은 그대로 보존한다.
- 범위(지시대로 좁힘): (A) W-1 · (B) W-2 와 4차 미검증분(다크·크기·date-picker 시트) · (C) 이번에 바뀐 것의 회귀 · (D) 저장소 상태 확인. **1~4차에서 PASS 난 date-picker 본체 전수 대조는 반복하지 않았다.**
- **구현자 자기보고 없음** — `3-build.md` 에 §13 이 없다. 이번 라운드는 **코드와 실제 렌더만** 근거로 판정했다.
- 렌더는 전부 http. 측정은 두 가지 독립 경로로 각각 수행해 서로 대조했다:
  ① 저장소 실제 파일을 http 로 띄우고 대상 HTML 응답에만 측정 스크립트를 끼워 넣은 헤드리스 크롬(사본·iframe 없음, 최상위 문서),
  ② 별도 실브라우저(127.0.0.1:4173)에서 직접 클릭 후 측정. **두 경로의 수치가 전부 일치**한다.

## 전체 판정

**FAIL** — 지시받은 **W-1·W-2 는 둘 다 PASS**이고 지시한 회귀 범위에서 **회귀 0건**이다. 그러나 W-2 가 고친 것은 **시트 제목 한 자리뿐**이고, **같은 시트의 휠 숫자(`wheel-cell`)에 똑같은 상속 누락이 남아 있어 W-2 의 증상 자체가 아직 살아 있다** — 검수 화면과 배포 안내 화면에서 **같은 dist 가 실제로 다르게 렌더된다**(❌ X-1). 이 부분은 이번 작업이 새로 쓴 코드다(HEAD 에 `wheel-cell` 규칙이 없다).

---

## (A) W-1 — 선언↔구현 일치 · ✅ PASS

| 확인 | 실측 | 결과 |
|---|---|---|
| 선언(`src/components/time-picker/manifest.json` `a11y.focus`) | "wheel 시트가 열리면 **시트 안(첫 포커스 가능 요소인 sheet-close)** 으로 포커스 이동, 닫히면 트리거로 복귀" | — |
| 구현(`time-picker.js:399-400`) | `sheetFocusables(sheetPanel)[0]` → DOM 첫 초점 대상 | — |
| **실측 포커스 위치** | 검수 화면 4개 인스턴스 + 배포 안내 화면 2개 인스턴스, **6곳 전부 `sheet-close`**. 실브라우저 재확인도 `sheet-close` | ✅ 선언과 일치 |
| date-picker 시트와 모순 없는가 | `date-picker/manifest.json` `a11y.focus` = "Mobile 시트는 열리면 **시트 안으로**" · 실측도 `sheet-close`. **두 manifest 가 같은 것을 말한다** | ✅ |
| 승인된 형제 선례 | `modal/manifest.json` `a11y.focus` = "열릴 때 **패널 안 첫 초점 요소**로 이동" · `modal.js:55` = `(list[0]||panel).focus()`. **문장·구현 모두 같은 계약** | ✅ |
| **새 상태 이름이 늘지 않았는가** | `npm run canon:check` = `tracked=617 added=5 removed=1`. added 5건은 전부 `uistate:date-picker.{default,disabled,filled,hover,open}` = **선언된 블로커 B5**. 4차에 있던 `componentprop:Tabs` 는 사라졌다(다른 세션이 baseline 갱신). **manifest 수정이 Gate 34 대상을 1건도 늘리지 않았다** | ✅ |

**선언을 구현에 맞춘 방향이 타당한가 — 타당하다.** 근거 셋: ① 정본 `buildTimePickerMobileBottomSheet` 는 Figma 스펙시트라 **초기 포커스 위치 규정 자체가 없다**(휠 열을 먼저 보내라는 정본 문구 없음) ② 같은 저장소의 **승인된 형제 modal 이 이미 "패널 안 첫 초점 요소"** 로 선언·구현돼 있어 새 규칙을 만든 것이 아니라 기존 계약을 따른 것이다 ③ date-picker 시트도 같은 동작이라 두 컴포넌트가 갈라지지 않는다. 정본에 없는 규정을 ⭐ 가 새로 만드는 쪽(H6②)이 아니라, 이미 있는 선례에 맞춘 쪽이므로 문제 없다.

## (B) W-2 — 시트 제목 줄높이 · ✅ PASS (지시 범위 한정)

정본: `build-components.ts` 가 제목을 `makeBoundText(titleText, 20, "Bold", …)` → `title/20B` = **20px · 130% · letterSpacing 0**(`textstyles-data.ts:41`) → 줄높이 **26px**. 웹 토큰 `--line-height-130: 1.3` · `--letter-spacing-normal: 0em`(`assets/css/tokens.css:345,383`) — **정본과 일치**.

| 화면 | 테마 | 제목 line-height | 제목 높이 | TimeOnly 패널 | DateTime 패널 |
|---|---|---|---|---|---|
| 검수 `ui-review.html` | Light | **26px** | 26 | **450** | **514** |
| 검수 `ui-review.html` | **Dark** | **26px** | 26 | **450** | **514** |
| 배포 안내 `components.html?platform=mobile` | Light | **26px** | 26 | **450** | **514** |
| 정본 계산값 | — | 26px | 26 | **450** | — |

- 450 산식 재검산: 패딩위 20 + 헤더(제목 26) + 간격 32 + 휠 272 + 간격 32 + 액션 48 + 패딩아래 20 = **450**. 4차의 448 은 제목이 24 로 눌렸던 값, 456 은 32 로 늘어났던 값 — **둘 다 사라지고 정본값 450 으로 수렴**했다.
- **오케스트레이터 실측(양쪽 450/514, 제목 26px)을 독립 경로 2가지로 재현했다.**
- **다크 모드**(4차 미검증분): 검수 화면 dark 패널에서 450/514·26px — Light 와 동일. 색은 제목 `rgb(236,237,240)` · 패널 `rgb(28,29,35)` 로 테마 반전 정상.
- **date-picker 모바일 시트 제목도 같은가**(4차 미검증분): 검수 화면 date-picker 시트 12개(Light 6 · Dark 6) 전부 제목 line-height **26px**, 시트 패널 높이 **490**(라이브 폭 360 / 정적 인라인 폭 356) — Light·Dark 동일. ✅
- **다른 크기**(4차 미검증분): 시트 제목은 크기 축이 없다(모바일 시트 단일). 대신 크기 축이 있는 트리거를 정본과 대조했다 — 아래 (C) 표 참조, XXSM 28/12px · XSM 34/14px · MD 44/14px · Mobile MD 48/14px 로 정본 `buildDatePicker` sizes 표와 **완전 일치**.
- source ↔ dist: `time-picker.css`·`date-picker.css` 모두 **diff 0** — 이 수정이 dist 까지 반영됐다.

## ❌ (a) X-1 — W-2 를 제목만 고쳐서, **같은 시트의 휠이 여전히 화면마다 다르다**

지시대로 "letter-spacing 등 다른 폰트 속성이 호스트에서 상속되는 자리"를 두 컴포넌트 CSS 에서 훑었고, **잠복이 아니라 이미 발현된 것**을 찾았다.

**적대 테스트(호스트에 `line-height:3.7`·`letter-spacing:4px` 강제 후 계산값 변화 추적)** 결과 — 두 컴포넌트에서 상속이 새는 부품:

| 컴포넌트 | 부품 | 새는 속성 | 이번 작업이 쓴 코드인가 |
|---|---|---|---|
| time-picker | **`wheel-cell`** | line-height · letter-spacing | **예**(HEAD 에 규칙 없음 — 이번 신규) |
| time-picker | `date-panel-note` | line-height · letter-spacing | **예**(HEAD 에 없음) |
| date-picker | `weekday` | line-height · letter-spacing | **예**(컴포넌트 전체가 신규) |
| time-picker | `cell`(PC 목록) | line-height · letter-spacing | 아니오 — HEAD 에 이미 있던 승인본 |

**그중 `wheel-cell` 은 가정이 아니라 지금 실제로 갈라져 있다.** 같은 `ui-library/dist` 를 쓰는 두 실제 화면에서:

| | 검수 화면 `ui-review.html` | **배포 안내 화면 `components.html`** |
|---|---|---|
| 호스트 body line-height | `normal` | **1.6 (=22.4px)** |
| 시트 제목 line-height | 26px | 26px ✅(W-2 수정분) |
| **휠 숫자 칸 높이 `wheel-cell`** | **44.00px** | **51.20px** |
| 휠 열 `scrollHeight` | **1284** | **1457** |
| 초기 `scrollTop` | 0 | 4 |
| 시트 패널 높이 | 450 | 450 |

- 기전: `wheel-cell` 은 `flex: 0 0 44px` 만 두고 `line-height` 를 선언하지 않는다(`time-picker.css:342-353`). flex 항목의 `min-height:auto` 때문에 **호스트가 물려준 줄높이(32px×1.6=51.2)가 44 를 밀어내** 칸 높이가 커진다. 휠 열 높이는 272 로 고정이라 **패널 높이(450)는 같은데 그 안의 칸 간격만 16% 커진다** — 4차가 지적한 "같은 배포본이 화면마다 다르게 보인다"와 **정확히 같은 증상**이고, W-2 는 이것을 제목 한 줄에서만 없앤 셈이다.
- 정본 대조: 휠 숫자는 `title/32R` = 32px · 130% → 줄상자 **41.6px** 이 정본이다(`makeWheelCol` 이 `makeBoundText(lb, 32, "Regular", …)`). 웹은 검수 화면 44 · 배포 화면 51.2 로 **어느 쪽도 정본을 표현하지 않는다.** 정본↔파생 문제이므로 두갈래 저울질 대상이 아니다(하드룰 H6) — 파생이 정본을 표현해야 한다.
- 실사용 영향: 휠은 `scroll-snap-align: center` 로 칸에 붙는다. 칸 pitch 가 호스트마다 달라지면 **스냅 위치·가운데 정렬·초기 스크롤(0 vs 4)이 화면마다 달라진다.** river 가 검수 화면에서 보는 휠과 배포 화면에 나가는 휠이 같은 물건이 아니다.
- **범위 판단은 오케스트레이터 몫이다.** 같은 상속 누락은 이미 승인·배포된 형제에도 있다 — 전 컴포넌트 적대 테스트 결과 `select`·`dropdown`·`filter-chip` 의 `option-label`, `table` 의 `header-cell`·`cell` 도 동일하게 샌다(반면 button·input·modal·chip·checkbox·radio·textarea·multi-toggle·tab·mobile-header·mobile-bottom-nav 는 새지 않는다). 나는 **이번 작업이 새로 쓴 부품에서 실제 렌더 차이를 실측했다**는 사실만 ❌ 로 올리고, 라이브러리 전반 정리 여부는 판정하지 않는다.
- `weekday`·`date-panel-note` 는 같은 누락이지만 **현재 호스트(line-height 1.6)에서는 기하 차이가 없다** — date-picker 요일칸·날짜칸은 44px 고정이고 1.6×14=22.4 가 44 를 넘지 못한다(검수 화면에 1.6 을 강제해 확인: 패널 352·요일 44·시트 490 불변). 지금 당장 갈라지지는 않으나 **같은 유형의 잠복**이므로 X-1 과 함께 정리하는 것이 맞다.

## (C) 회귀 — 지시 범위 전부 PASS

| 대상 | 실측 | 결과 |
|---|---|---|
| **date-picker PC 패널 352/312/20** | 바깥 **352** · 내용(`calendar`) 높이 **312** · 패딩 위/아래 **20/20** · 좌우 **24/24** · 바깥 폭 **356** · 내용 폭 **308** · `border: 0px none` · 그림자 2층 `inset 0 0 0 1px rgb(217,217,217)` + `rgba(0,0,0,.15) 0 4px 8px` | ✅ 4차값과 동일 |
| **date-picker 모바일 시트** | 라이브 490×360(`position:fixed`) · 정적 인라인 표본 490×356(`position:relative`) · Light·Dark 동일 | ✅ |
| **date-picker 트리거 4종** | PC XXSM h28/fs12 · PC XSM h34/fs14 · PC MD h44/fs14 · Mobile MD h48/fs14 (radius 4) — 정본 `buildDatePicker` sizes 표(28/12·34/14·44/14·48/14)와 **일치** | ✅ |
| **time-picker 목록 모드** | 패널 높이 247.2 · 폭 24h=**150**(트리거 폭 추종) · 12h=**194**(정본 고정) — manifest `panelWidthFollowsTrigger` 선언과 일치. 호스트 줄높이를 3.7 로 흔들어도 **247.2 불변** | ✅ |
| **time-picker 휠 시트 동작** | 열림(fixed·패널 360) → 포커스 `sheet-close` → `body.overflow=hidden` → Esc 로 닫힘·overflow 원복. 검수·배포 양쪽 | ✅ |
| 시트 접근 이름(V-1 회귀) | 검수 16개·배포 2개 시트 패널 전부 `aria-labelledby` 보유, 가리키는 id 실재 | ✅ |
| `npm run ui:contract` | **PASS** · errors=0 | ✅ |
| `npm run ui:icons` | **PASS** · icons=13 errors=0 (경고 2건은 기존 부채 baseline) | ✅ |
| `npm run ui:build` | **PASS** · 110 files (4차의 stale 실패 해소) | ✅ |
| `npm run ui:test` | **PASS** | ✅ |
| `npm run ui:guide:render` | **PASS** — 18종 × PC·Mobile 실제 렌더 대조 | ✅ |
| `npm run canon:check` | tracked=617 **added=5**(전부 B5) removed=1(componentprop:Menu — 다른 세션 GNB) | ✅ 이번 수정발 증가 0 |
| **source ↔ dist** | `date-picker`·`time-picker` 의 css·js **diff 0**, manifest 의 `a11y`·`version`·`status` 일치(time-picker 0.2.0 approved / date-picker 0.1.0 draft) | ✅ |
| 배포 안내 화면 육안 | Time Picker Approved v0.2.0 정상 · Date Picker 메뉴 비활성(draft) 유지 · 휠 시트 열림 정상 | ✅ |

> ⚠️ 측정 순서 고지: **위 렌더 실측은 전부 `ui:build` 를 돌리기 전에 끝냈고**, 그때 이미 dist 가 26px 를 내고 있었다. 즉 내가 잰 화면은 빌드로 방금 만들어진 것이 아니라 **이미 디스크에 있던 배포본**이다.

## (D) 저장소 상태 — 판정 대상 아님, 사실만 기록

- **정본 지문 정정은 타당하다(재확인 완료).** date-picker 관련 빌더를 **함수 단위로 잘라 현재본 ↔ HEAD sha256 대조** 한 결과 **6개 전부 바이트 동일**: `buildCalendarCell`(4287B) · `buildCalendarTile`(1702B) · `buildCalendar`(8717B) · `buildDatePicker`(5049B) · `buildDatePickerBottomSheet`(6279B) · `buildTimePickerMobileBottomSheet`(11743B). 오케스트레이터 목록에 없던 **의존 헬퍼 2개**(`buildCalendarCellLayout` 3458B · `getOrBuildCalendarCell` 798B)도 추가로 대조했고 역시 동일하다. → 다른 세션의 Dropdown·LineTab·ModalShell·MultiToggle·GNB 편집은 이 작업 범위를 건드리지 않았다. `fingerprintRefreshes` 마지막 항목의 정정은 **사실이며 앞선 넓은 구간 대조보다 정확하다.**
- **O-2 뒷정리는 절반만 됐다.** 저장소 루트의 `tmp-dp-check.html`·`tmp-dp-check2.html` 은 **삭제 확인**(존재하지 않음). 그러나 **`pages/` 안에 새 임시 파일 3개가 추적되지 않은 채 남아 있다** — `pages/_canonshot_tmp.html`(332KB) · `pages/_w2_components_tmp.html`(331KB) · `pages/_w2_review_tmp.html`(114KB). 안내·검수 화면을 통째로 복사한 W-2 측정용 하네스로 보인다. **커밋 전에 지워야 한다(O-2b).**
- `uistate:date-picker.*` 5건 = **B5**, river 승인 문장 대기. `componentprop:Logo`·`Tabs`·Gate 13 stale 은 다른 세션 소관(이번 `canon:check` 에서는 `Tabs` 가 이미 빠졌다).

## 검증하지 못한 범위 (정직 고지)

1. **구현자 자기보고(3-build §13)가 없어 "무엇을 의도했는지"와 대조하지 못했다.** 코드·렌더만으로 판정했으므로, 구현자가 X-1 을 알고도 범위 밖으로 뒀는지 몰라서 뒀는지는 알 수 없다.
2. **화살표/Home/End 이동 뒤 초점이 앉는 칸** — 1~4차와 동일한 한계(rAF 미발화). 미검증 유지.
3. 실제 터치 기기 · 스크린리더 실낭독 · Figma V3.0 캔버스 대조(MCP 인증 미완) — 1~4차와 동일하게 미검증.
4. **승격 후 실제 안내 화면에서의 date-picker 포커스·Tab 가둠** — date-picker 가 draft 라 안내 화면에 그려지지 않는다. 검수 화면(최상위 문서)에서는 실측 PASS. 4차의 고지를 그대로 유지한다.
5. date-picker 본체 전수 대조는 **지시대로 반복하지 않았다** — 이번에 바뀐 CSS 2줄·manifest 서술이 1~4차 결론을 흔들지 않는지만 (C) 로 확인했다.
6. X-1 의 **라이브러리 전반 범위**(select·dropdown·filter-chip·table 의 같은 누락)는 실측으로 존재만 확인했고, 그것들이 화면 간에 실제로 갈라지는지는 **like-for-like 표본이 없어 재지 않았다.**

## 스크린샷 (5차)

| 파일 | 내용 |
|---|---|
| `screens/verify5-guide-timepicker-mobile.png` | 배포 안내 화면 Time Picker(Approved v0.2.0) 정상 · Date Picker 메뉴 비활성 유지 |
| `screens/verify5-review-top.png` | 검수 화면 최상단 — 오버레이에 덮이지 않음(R-1 회귀 없음) |

> 휠 시트를 연 상태는 파일로 남기지 못했다(스크린샷 도구가 클릭을 못 한다). 대신 **실브라우저에서 직접 열어 육안 확인**했고(제목·휠·적용 버튼 정상), 그 자리에서 잰 수치가 위 X-1 표의 44 / 51.20 · 1284 / 1457 이다.

## 5단계·6단계로 넘겨도 되는가 — 명확한 의견

- **5-human-review(river 검수): 넘겨도 된다.** date-picker 본체는 1~4차에 이어 이번에도 깨끗하고, W-1·W-2 가 해소돼 검수 화면과 배포 화면의 **시트 높이가 450/514 로 같아졌다.** X-1 은 휠 칸 간격 차이라 river 가 date-picker 의 모양·동작을 판단하는 데 지장이 없다.
- **6-promotion(승격): 아직 안 된다. 남은 조건이 river 승인 문장 하나뿐이 아니다.** 승격 전 필요한 것:
  1. ❌ **X-1** — `wheel-cell` 에 정본 줄높이(`title/32R` = 130%)와 letter-spacing 을 선언해, 검수 화면과 배포 화면의 휠이 같아지게 한다. 함께 새는 `date-panel-note`·`weekday` 도 같이 정리한다. **4차가 W-2 를 승격 차단 사유로 든 근거("검수한 것과 배포된 것이 다르다")가 이 부품에서 그대로 살아 있다.**
  2. **B5** — Gate 34 `uistate:date-picker.*` 5건, river 가 승인 문장을 직접 타이핑해야 한다.
  3. **B7/CU-3** — 주말 색의 Figma 정본 반영(후속 작업으로 분리 가능).
  4. **O-2b** — `pages/` 의 임시 파일 3개 삭제.

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **blocked**
- `uiLibraryStatus`: **draft** 유지
- `lastCompletedCheckpoint`: **3 유지** (4 미통과)
- `nextAction`: W-1·W-2 는 **종결**. ❌ **X-1**(휠 숫자 칸의 줄높이·자간 상속 — 검수 44 / 배포 51.2)을 정리한 뒤 **그 항목과 시트 기하만** 재확인하면 된다. 5-human-review 는 지금 진행 가능하고, 승격은 X-1·B5·O-2b 까지 마쳐야 한다.

---

# 재검증(6차 · 최종 회귀) — 2026-09-03

- 검증 주체: 🤖 component-verifier (시나리오 F) — 구현자와 분리. 1~5차 판정은 그대로 보존한다.
- 범위(지시대로 좁힘): (A) X-1 해소 · (B) 이번 CSS 수정 11곳의 회귀 · (C) 자동 검사·배포 동일성 · (D) 확인만. **1~5차에서 PASS 난 항목의 전수 재대조는 하지 않았다.**
- **구현자 자기보고 없음**(빌더 정지). 이번에도 **코드·정본·실제 렌더만** 근거로 판정했다.
- 측정 방법: 저장소 실제 파일을 http(127.0.0.1)로 서빙하고, **대상 HTML 응답에만** 측정 스크립트를 끼워 넣은 헤드리스 크롬(사본·iframe 없음, 최상위 문서). 사본을 만들지 않았으므로 이번 라운드에서 **저장소에 임시 파일을 만들지 않았다**(측정 스크립트는 저장소 밖 임시 폴더에 두고 끝나고 지웠다). 산출물로 남긴 것은 스크린샷 2장뿐이다.

## 전체 판정

**FAIL** — 지시받은 **X-1 은 완전히 해소**됐고(검수·배포 두 화면이 휠 칸 44·pitch 44·scrollHeight 1284·scrollTop 0·스냅 결과까지 동일), **기하 회귀는 0건**이다. 그러나 이번 수정이 **줄높이는 맞게, 자간은 틀리게** 박았다 — `letter-spacing` 을 6개 규칙에 `normal`(0)로 못 박았는데 **그 자리들의 정본 텍스트 스타일은 -2%** 다(❌ Y-1). 정본↔파생 불일치라 저울질 대상이 아니다(H6).

---

## (A) X-1 해소 — ✅ PASS

같은 `ui-library/dist` 를 쓰는 두 실제 화면에서 휠을 열고 잰 값이다.

| 항목 | 검수 `ui-review.html` | 배포 안내 `components.html?platform=mobile` | 5차 값 | 정본 |
|---|---|---|---|---|
| 호스트 body line-height | `normal` | **1.6(=22.4px)** | 동일 | — |
| 휠 숫자 칸 높이 `wheel-cell` | **44.00** | **44.00** | 44 vs **51.20** | 44(`makeWheelCol` 칸) |
| 칸 pitch(연속 칸 간격) | **44.00** | **44.00** | — | 44 |
| `wheel-cell` line-height | **41.6px** | **41.6px** | — | `title/32R` 32×130% = **41.6** |
| 휠 열 `scrollHeight` | **1284** | **1284** | 1284 vs **1457** | — |
| 초기 `scrollTop` | **0** | **0** | 0 vs **4** | — |
| 시트 패널(TimeOnly / DateTime) | **450 / 514** | **450 / 514** | 동일 | 450 |
| 시트 제목 line-height | 26px | 26px | 동일 | `title/20B` 20×130% |

- **scroll-snap 정렬도 두 화면이 같다.** 두 화면 각각에서 `scrollTop=213`(칸 배수가 아닌 값)을 준 뒤 스냅 결과를 재니 **양쪽 모두 220(=5×44)로 붙고 중앙 칸이 "05", 중앙 오차 0px**. 5차가 지적한 "화면마다 스냅 위치가 다르다"가 사라졌다.
- **적대 테스트로 원인 자체가 막혔는지 확인했다.** 호스트에 `line-height:3.7 · letter-spacing:4px` 를 강제해도 휠 칸은 **44/44/1284 불변**(5차에는 이 조건에서 밀렸다). 상속이 실제로 차단됐다.
- **5차가 같은 유형으로 지목한 두 자리도 명시됐다.** `time-picker` `date-panel-note`·`date-picker` `weekday` 모두 `line-height:var(--line-height-130)` 보유(`weekday` 실측 **20.8px** = 16×1.3). 규칙 파서로 두 CSS 전체를 훑어 **`font-size` 를 선언하고 `line-height` 가 없는 규칙**을 다시 세니 **date-picker 트리거 3줄만 남았다**(아래 ℹ️ Y-2).
- 오케스트레이터 실측치(휠 44.00 · 41.6px · 1284 · 시트 450 · 날짜 숫자 20.8px)는 **전부 독립 재현됐다.**

## ❌ (a) Y-1 — 줄높이는 맞췄는데 **자간을 정본과 다르게 못 박았다**(6곳)

이번 수정은 `line-height` 와 함께 `letter-spacing` 도 선언했다. 주석의 근거는 **"정본 텍스트 스타일은 전부 130%/기본 자간"** 인데, 앞부분(130%)은 맞고 **뒷부분은 사실이 아니다** — `textstyles-data.ts` 20종 중 **8종이 letterSpacingPercent = -2**(body/14R·14M·16R·16M·18M·title/16M·18M), 2종이 +2(body/10*)다.

정본 매핑은 기계적으로 정해져 있다: `makeBoundText(chars, size, weight)` → `textStyleKey()`(build-components.ts:54-64) → Bold=`title/{size}B`, 그 외=`body/{size}{M|R}`(32 Regular만 `title/32R`).

| # | 파일·부품 | 웹이 선언한 자간 | 정본 텍스트 스타일 | 정본 자간 | 판정 |
|---|---|---|---|---|---|
| 1 | date-picker `weekday` (16 Medium) | `normal`(0) | `body/16M` | **-2%** | ❌ |
| 2 | date-picker `cell-num` (16 Medium) | `normal` | `body/16M` | **-2%** | ❌ |
| 3 | date-picker `tile` (16 Medium) | `normal` | `body/16M` | **-2%** | ❌ |
| 4 | time-picker 트리거 `xsm` (14 Regular) | `normal` | `body/14R` | **-2%** | ❌ |
| 5 | time-picker 트리거 `md` (14 Regular) | `normal` | `body/14R` | **-2%** | ❌ |
| 6 | time-picker 목록 `cell` (14 Regular) | `normal` | `body/14R` | **-2%** | ❌ |
| — | date-picker `year-label`·`month-label`(24 Bold) · 두 컴포넌트 `sheet-title`(20 Bold) · `wheel-cell`(32 Regular) · time-picker 트리거 `xxsm`(12) | `normal` | title/24B·title/20B·title/32R·body/12R | 0% | ✅ 맞다 |
| — | time-picker `confirm`(14 Medium) | `tight` | `body/14M` | -2% | ✅ 맞다 |

- **정본↔파생 문제라 두 갈래(a/b/c) 저울질 대상이 아니다**(H6 — 파생을 고친다). 레거시 DS 2.4 와의 차이가 아니라, 저장소 정본 텍스트 스타일과 웹 CSS의 차이다.
- **승인된 형제들은 이미 정본대로 갈라 쓰고 있다.** `button.css` 는 14·16px 에 `tight`, 12px 에 `normal`(33·41·49·57행). `input.css` 도 라벨 14M=tight(15행), 12px 필드=normal(104·116행), XSM 14px 컨트롤=tight(127행). `checkbox`·`radio`·`textarea`·`table`·`modal`·`chip`·`mobile-header` 모두 같은 방식이다. **이번 두 컴포넌트만 14·16px 을 `normal` 로 쓴다.**
- **실측 영향(같은 페이지에서 -0.02em 을 강제해 비교):** 타일 라벨 "2021" 36.08 → **34.81px**(-1.27) · 트리거 값 "YY.MM.DD" 67.44 → **65.20px**(-2.24) · 날짜 숫자 19.48 → 18.86 · 요일 13.83 → 13.52. **컨테이너(타일 88 · 트리거 180 · 칸 44)는 그대로**라 고치더라도 기하는 깨지지 않는다.
- **왜 화면에서 안 드러났나:** 두 실제 호스트의 상속값이 마침 0이라, 이번에 못 박기 전에도 렌더 결과는 같았다. 즉 **화면 간 차이는 없고 정본과의 차이만 있다** — 이번 수정이 그 차이를 CSS 에 고정시켰다.
- 조치(구현자 몫): 위 6개 규칙의 `--letter-spacing-normal` → `--letter-spacing-tight`. 주석의 "전부 130%/기본 자간" 문장도 사실과 다르므로 함께 고친다.

## ℹ️ Y-2 — date-picker 트리거 3줄은 아직 미선언(같은 유형, 현재 무해)

`date-picker.css:32-34`(XXSM·XSM·MD 트리거)만 `font-size` 를 선언하고 `line-height`·`letter-spacing` 이 없다. 형제인 time-picker 트리거는 이번에 선언됐는데 date-picker 는 빠졌다.

- **현재 렌더 영향 없음(확인함).** `<button>` 은 브라우저 기본 스타일의 `font` 축약이 `line-height:normal` 을, 같은 규칙이 `letter-spacing:normal` 을 다시 깔아 **호스트 값을 물려받지 않는다.** 빈 소비자 페이지에서 호스트를 `line-height:3.7 / letter-spacing:4px` 로 흔들어도 트리거 높이 28/34/44/48 · 값 글자 폭 67.44px 모두 불변이었다. 글리프 세로 위치도 불변(줄상자가 커져도 flex 중앙정렬이라 baseline 오프셋은 `(ascent-descent)/2` 로 고정 — 실측 `valCenterOffset = 0`).
- 다만 **정본 자간은 XSM·MD·Mobile MD 가 `body/14R` = -2%** 이므로, 지금 렌더되는 0% 는 Y-1 과 같은 어긋남이다(형제 `input`·`select` 트리거는 tight). Y-1 을 고칠 때 이 3줄도 함께 정리하면 된다.

## ℹ️ Y-3 — 시트 푸터는 아직 호스트 줄높이를 탄다(임계 3.0 이상, 실제 호스트 무해)

`sheet-footer` 는 `font-size` 가 없는 컨테이너라 규칙 스캔에 안 걸리는데, 내부 strut 이 호스트 줄높이를 받는다.

| 호스트 line-height | date-picker 시트 | time-picker 시트(TimeOnly) |
|---|---|---|
| `normal` | 490 | 450 |
| **1.6**(배포 안내 화면 실제값) | **490** | **450** |
| 3.7(적대값) | 501.19(footer 48 → 59.19) | 461.19 |

두 실제 호스트(검수 `normal` · 배포 `1.6`)에서는 **정본값 그대로**라 지금 갈라지지 않는다. 호스트가 3.0 이상을 줄 때만 밀린다 — 잠복 부채로 기록만 한다(판정 대상 아님).

## (B) 회귀 — 이번 수정이 기하를 바꾸지 않았다 · ✅ 전부 PASS

date-picker 인스턴스 **52개**(검수 화면 전수, Light·Dark · PC·Mobile · 4크기 · 4상태 · single/range · 정적/라이브)를 서명별로 묶어 실측했다.

| 대상 | 실측 | 정본 | 결과 |
|---|---|---|---|
| 트리거 4크기 | XXSM 28/12px · XSM 34/14px · MD 44/14px · Mobile MD 48/14px | `buildDatePicker` sizes 표(28/12·34/14·44/14·48/14) | ✅ |
| PC 패널 | 바깥 **356×352** · 내용 `calendar` **308×312** · 패딩 위아래 **20**, 좌우 **24** | 356×352 / 312 / 20·24 | ✅ |
| 헤더 행 | **308×32** | 308×32 | ✅ |
| 날짜 칸 / 안쪽 원 | **44×44 / 30×30** | 44×44 / 30×30 | ✅ |
| 요일 칸 | **44×44**, line-height **20.8px** | 44 / 16×130% | ✅ |
| 연·월 타일 | **88×56** | 88×56 | ✅ |
| 기간 밴드(::before) | 높이 **30** · `top 7` · start `left 22 / right 0` | h30·top7·x22 | ✅ |
| 6주 달 | 2027년 1·5·10월에서 42칸/6행 · 패널 **396** · 내용 **356**(=312+44 한 줄) | 한 줄만큼 늘어남 | ✅ |
| 모바일 시트 | 라이브 360×490 · 정적 356×490 · **Light·Dark 동일** | 490 | ✅ |
| Light ↔ Dark | 위 모든 수치가 **테마와 무관하게 동일** | — | ✅ |
| time-picker 목록 패널 | 150×**247.19** (5차 247.2 와 동일) | — | ✅ |
| time-picker 트리거 3크기 | PC 28/12px(LH 15.6) · 34/14px(18.2) · 44/14px(18.2) · Mobile 48/14px · Light·Dark 동일 | 130% | ✅ |
| **줄바꿈·잘림** | 요일 헤더·연월 라벨·타일 라벨·트리거 값·날짜 숫자 전수 검사 — `scrollWidth > clientWidth` **0건**, 2줄로 접힌 요소 **0건** | — | ✅ |
| 육안(스크린샷) | 검수 화면 Date Picker 절 정상(일=빨강·토=파랑, 팝오버·모바일 시트·「적용」 버튼) · 배포 안내 화면 휠 시트 정상, **Date Picker 메뉴는 여전히 비활성(draft)** | — | ✅ |

## (C) 자동 검사 · 배포 동일성 — ✅ 전부 PASS

| 검사 | 결과 |
|---|---|
| `npm run ui:contract` | **PASS** · errors=0 · policy=candidate |
| `npm run ui:icons` | **PASS** · icons=13 errors=0 (경고 2건은 기존 부채 baseline) |
| `npm run ui:build` | **PASS** · 110 files |
| `npm run ui:test` | **PASS** |
| `npm run ui:guide:render` | **PASS** · 18종 × PC·Mobile |
| `npm run components:variantcov`(Gate 19) | **PASS** · pairs=49 verified=49 newGaps=0 |
| `npm run canon:check` | tracked=617 **added=5**(전부 B5) removed=1(componentprop:Menu — 다른 세션) · **이번 수정발 증가 0** |
| source ↔ dist | `date-picker.css/js` · `time-picker.css/js` **바이트 동일**, manifest 도 `sourceFingerprint` 한 줄 외 동일(date-picker 0.1.0 draft / time-picker 0.2.0 approved) |
| **전체묶음 ↔ 개별설치** | `empty-consumer.html`(번들)과 `empty-consumer-individual.html`(개별 import)을 각각 렌더 — 트리거 180×44 · 패널 356×352 · 내용 308×312 · 칸 44×44/30×30 · 요일 44×44 · 줄높이 20.8px · time-picker 패널 150×247.19 **완전 일치** |

> 측정 순서 고지: 렌더 실측 중 일부는 `ui:build` 실행 **뒤**에 했다. 다만 빌드 전후로 `dist` 의 date-picker·time-picker 파일 내용이 바뀌지 않았음을 해시로 확인했고(빌드가 만든 변경 없음), 5차와 달리 이번엔 빌드가 이미 최신 상태였다.

## (D) 확인만 한 것 (판정 대상 아님)

- **임시 파일 5개 삭제 확인.** 루트 `tmp-dp-check.html`·`tmp-dp-check2.html`, `pages/_canonshot_tmp.html`·`_w2_components_tmp.html`·`_w2_review_tmp.html` **모두 존재하지 않는다**(O-2·O-2b 종결). 저장소에 새로 생긴 추적되지 않은 파일은 이번 작업 산출물(date-picker 소스·dist·보고서)과 다른 세션의 `legacy-component-map.json` 뿐이다.
- `gate:check` 의 `uistate:date-picker.*` **5건 = B5**(river 타이핑 승인 대기). `componentprop:Logo`·`Tabs`·Gate 13 stale 은 다른 세션 소관 — 판정하지 않았다.
- `build-components.ts` 는 다른 세션이 계속 편집 중. 이번엔 함수 단위 재대조를 **하지 않았다**(5차에서 6개 빌더 + 헬퍼 2개 바이트 동일 확인, 지시상 반복 제외).
- **B11(라이브러리 전반 폰트 상속 부채 — select·dropdown·filter-chip·table)은 범위 밖**으로 두었고 판정하지 않았다. 다만 Y-1 이 밝힌 자간 규칙(14·16px = -2%)은 그 컴포넌트들에는 **이미 올바르게 적용돼 있다** — 이번 두 컴포넌트만 예외다.

## 검증하지 못한 범위 (정직 고지)

1. **구현자 자기보고가 없어** "무엇을 의도했는지"와 대조하지 못했다. 자간을 일부러 0으로 뒀는지, 정본을 안 보고 뭉뚱그렸는지는 알 수 없다(주석 문구로 보아 후자로 읽힌다).
2. **화살표/Home/End 이동 뒤 초점이 앉는 칸** — 1~5차와 같은 한계(rAF 미발화). 미검증.
3. 실제 터치 기기 · 스크린리더 실낭독 · **Figma V3.0 캔버스 대조(MCP 인증 미완)** — 1~5차와 동일하게 미검증.
4. **승격 후 안내 화면에서의 date-picker 렌더·포커스** — draft 라 아직 그려지지 않는다. 승격 시 그 화면(호스트 line-height 1.6)에서 재확인이 필요하다. 다만 이번에 **호스트 1.6 을 강제한 상태에서 date-picker 기하가 불변**임을 확인했으므로 위험은 낮다.
5. date-picker 본체 전수 대조(색·토큰·상태 전이·D4/D6 동작)는 **지시대로 반복하지 않았다** — 1~4차 결론을 그대로 승계한다.
6. Y-1 을 고쳤을 때의 렌더 결과는 **강제 주입으로 폭만 재봤을 뿐**, 실제 수정본을 렌더한 것은 아니다.

## 스크린샷 (6차)

| 파일 | 내용 |
|---|---|
| `screens/verify6-review-datepicker.png` | 검수 화면 Date Picker 절 — 트리거 4상태·팝오버 달력·모바일 시트(일 빨강/토 파랑, 「적용」). 다른 절은 화면 밖이라 측정 스크립트로 숨기고 찍었다(대상 절은 원본 그대로). |
| `screens/verify6-guide-timepicker-wheel.png` | 배포 안내 화면(모바일)에서 **휠 시트를 실제로 열어** 찍은 모습 — 숫자 간격 정상, Date Picker 메뉴 비활성 유지 |

## 5단계·6단계

- **5-human-review(river 검수): 넘겨도 된다.** X-1 이 해소돼 검수 화면과 배포 화면의 휠이 이제 같은 물건이다. Y-1 은 글자 폭 1~2px 수준이라 river 의 모양·동작 판단을 방해하지 않는다.
- **6-promotion(승격): 남은 조건이 river 승인 문장 하나뿐이 아니다.** 승격 전 필요한 것:
  1. ❌ **Y-1** — 6개 규칙의 자간을 정본(`-2%` = `--letter-spacing-tight`)에 맞춘다. 주석의 "기본 자간" 문장도 정정. (같이 정리 권장: ℹ️ Y-2 트리거 3줄)
  2. **B5** — Gate 34 `uistate:date-picker.*` 5건, river 가 승인 문장을 직접 타이핑해야 한다.
  3. **B7/CU-3** — 주말 색의 Figma 정본 반영(후속 작업으로 분리 가능).

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **blocked**
- `uiLibraryStatus`: **draft** 유지
- `lastCompletedCheckpoint`: **3 유지** (4 미통과)
- `nextAction`: **X-1 은 종결**(B6 해소). ❌ **Y-1**(정본 -2% 자리 6곳에 자간 0을 못 박음)만 고치고, **그 6곳의 글자 폭·컨테이너와 시트/패널 기하만** 재확인하면 된다. 5-human-review 는 지금 진행 가능.

---

# 재검증(7차) — 자간·줄높이 한정 · 🤖 component-verifier(시나리오 F)

- 일시: 2026-09-03
- 범위: **오케스트레이터가 직접 고친 Y-1(자간)·Y-2(트리거 3줄)와 그 기하 파급만.** 1~6차 PASS 항목은 지시대로 전수 재대조하지 않았다.
- 구현자 보고서 **없음**(빌더 정지). 코드·정본·실측만으로 판정했다.
- 대조 기준(내가 직접 유도): `plugins/figma-vars-installer/src/textstyles-data.ts` 20종 표 + `build-components.ts` 의 `makeBoundText` 인자 → `textStyleKey()`(54행) 매핑.

## 판정 요약

| 구분 | 결과 |
|---|---|
| **전체** | **✅ PASS** — ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 |
| (A) Y-1·Y-2 정본 대조 | ✅ 바뀐 자리 **전부** 정본과 일치 (보고 기술 부정확 1건은 코드 결함 아님) |
| (B) 회귀 | ✅ 줄바꿈·잘림 0건 · 기하 전량 불변 · 검수↔배포 값 동일 · Light·Dark 동일 |
| (C) 자동 검사 | ✅ 전부 PASS · 이번 수정발 canon 증가 0 |

---

## (A) Y-1·Y-2 — 정본 매핑을 다시 유도해 대조

### A-0. 정본 표 재확인 (내가 직접 읽음)

`textstyles-data.ts` 20종 중 **`letterSpacingPercent = -2` 는 7종**입니다 — `title/18M`·`title/16M`·`body/18M`·`body/16M`·`body/16R`·`body/14M`·`body/14R`.
`body/10M`·`10R` 만 `+2`·140%, 나머지 11종은 `0`·130%.
> ℹ️ `workflow-state.json` 의 `orchestratorFixes` 메모는 "8종"이라 적었습니다. 실제는 **7종**입니다(지시문에 나열된 7개가 맞습니다). 값 판정에는 영향 없음.

### A-1. 부품 → 정본 스타일 유도

`makeBoundText(chars, size, weight, color)` 에 `requiredStyleKey` 를 넘기면 그 스타일로 강제되지만, **date-picker·time-picker 빌더 6종은 `requiredStyleKey` 를 한 번도 쓰지 않습니다**(전체 파일에서 그 인자를 쓰는 곳은 Mobile Header 4곳뿐 — 3171·3192·3197·3202행). 따라서 전부 `textStyleKey(size, weight)` 규칙을 그대로 탑니다: **Bold→`title/*`, Medium·Regular→`body/*`**.

| 웹 규칙 | 정본 호출 (build-components.ts) | → 스타일 | 정본 자간 / 줄높이 | 웹 선언 | 판정 |
|---|---|---|---|---|---|
| tp 트리거 `xxsm` | `("시간 선택", 12, "Regular")` 2381 | `body/12R` | **0** / 130 | normal / 130 | ✅ |
| tp 트리거 `xsm`·`md`(+Mobile) | `(…, 14, "Regular")` 2382-2384 | `body/14R` | **-2** / 130 | tight / 130 | ✅ |
| tp 목록 `cell` | `("00", 14, "Regular")` buildTimePickerCell | `body/14R` | **-2** / 130 | tight / 130 | ✅ |
| tp `confirm`("확인") | `("확인", 14, "Medium")` buildTimePickerDropdown 푸터 | `body/14M` | **-2** / 130 | tight / 130 | ✅ |
| tp `sheet-title` | `("시간 선택", 20, "Bold")` 4400대 | `title/20B` | **0** / 130 | normal / 130 | ✅ |
| tp `wheel-cell` | `(lb, 32, "Regular")` 3963 | `title/32R`(특례 분기) | **0** / 130 | normal / 130 | ✅ |
| dp 트리거 `xxsm` | `(st.txt, 12, "Regular")` 3784 | `body/12R` | **0** / 130 | normal / 130 | ✅ **Y-2** |
| dp 트리거 `xsm`·`md`(+Mobile) | `(st.txt, 14, "Regular")` 3784 | `body/14R` | **-2** / 130 | tight / 130 | ✅ **Y-2** |
| dp `weekday` | `(ch, 16, "Medium")` buildCalendar 3683 | `body/16M` | **-2** / 130 | tight / 130 | ✅ |
| dp `cell-num` | `("1", 16, "Medium")` buildCalendarCell 3434 | `body/16M` | **-2** / 130 | tight / 130 | ✅ |
| dp `tile` | `(label, 16, "Medium")` buildCalendarTile 3504 | `body/16M` | **-2** / 130 | tight / 130 | ✅ |
| dp `year-label`·`month-label` | `(label, 24, "Bold")` makeCalHdr 3646 | `title/24B` | **0** / 130 | normal / 130 | ✅ |
| dp `sheet-title` | `("날짜 선택", 20, "Bold")` 3868 | `title/20B` | **0** / 130 | normal / 130 | ✅ |

**"14 Medium 이 `body/14M`(-2%)인가 `title/14M`(0%)인가" 갈림 판정** — 해당하는 자리는 time-picker 의 `confirm`("확인") 한 곳입니다. `textStyleKey(14,"Medium")` 은 `letter==="B"` 가 아니면 무조건 `body/` 를 붙이므로 **`body/14M`(-2%)** 이 맞습니다. `title/14M`(0%)은 `requiredStyleKey` 로만 도달 가능한데 이 두 컴포넌트는 쓰지 않습니다. **오케스트레이터의 tight 적용이 맞습니다.**

### A-2. 지적된 두 자리

- **`date-panel-note`(6차 Y-1 표에 없던 자리)** — 정본에 **대응물이 없습니다.** `buildTimePickerMobileBottomSheet` 의 DateTime 변형은 날짜/시간 탭(Line Tab Mobile/SM 인스턴스)까지만 만들고, "날짜 선택 화면은 Date Picker 코어가 별도로 제공합니다"라는 문구는 **웹 전용 안내 문자열**입니다. 따라서 정본 스타일 1:1 대응이 아니라 "14px 계열 = -2%" 규칙의 유추 적용이며, 그 유추는 타당합니다(14M·14R 둘 다 -2% 라 굵기와 무관하게 결론이 같음). **판정 ✅**, 다만 아래 ℹ️ Z-3 참조.
- **`grid[data-tile-grid]`** — ❗**이 규칙에는 타이포 선언이 아예 없습니다.** `date-picker.css:319` 는 `display:flex; flex-direction:column; gap:…` 뿐이고 글자는 자식 `tile` 이 갖습니다(그쪽은 tight ✅). 즉 "tight 로 정정한 자리" 목록에 이 규칙이 들어간 것은 **보고 기술이 부정확**한 것이며, 고칠 것도 고쳐진 것도 없습니다. **코드 결함 아님 → ❌ 아님.** (Z-1 로 기록)

### A-3. "font-size 는 있는데 줄높이·자간이 없는 자리" 전수

두 CSS 를 파서로 훑어 `font-size` 를 선언한 **규칙 16개**(date-picker 8 · time-picker 8)를 뽑았습니다. **16개 전부 `line-height` 와 `letter-spacing` 을 함께 갖고 있습니다 — 누락 0곳.** ✅

ℹ️ 남은 미선언은 `font-weight` 4곳(dp 트리거 3규칙 · tp `date-panel-note`)입니다. 실측값은 검수·배포 두 화면 모두 400 으로 같고, 정본도 그 자리가 Regular 라 현재 문제는 없습니다. **자간 판정에는 영향 없음**(14M·14R 모두 -2%).

---

## (B) 회귀 — 자간이 글자 폭을 바꾼다

계측 방법: 로컬 http 서버로 실제 페이지를 띄우고(파일 URL 은 ES 모듈이 안 돌아 사용 불가) 헤드리스 크롬 DOM 에서 **모든 `[data-s1-part]` 의 computed `letter-spacing`·`line-height`·`font-size`·`font-weight` 와 실제 사각형**을 수집했습니다. 배포 안내 화면은 date-picker 가 아직 `draft` 라 그려지지 않으므로 **서버 응답에서 manifest 의 `status` 만 메모리상 `approved` 로 바꿔** 진짜 렌더러 + 진짜 dist 로 구동했습니다(저장소 파일 무변경).

### B-1. 줄바꿈·잘림 — **0건**

| 대상 | 결과 |
|---|---|
| 요일 헤더 7칸(일~토) | 각 44×44 유지 · 넘침 0 |
| 연·월 라벨(`2025년`·`1월`) | 80.94×31.19 / 32×31.19 · 넘침 0 |
| 타일 라벨(`2021`·`12월`) | 88×56 칸 안 · 넘침 0 |
| 트리거 값(`YY.MM.DD`·`26.01.17`·**`26.01.17 - 26.01.22`**) | 최대 110.88px, 180px 트리거 안 · 넘침 0 |
| 「적용」(320×48)·「확인」(23.64×18.19) | 넘침 0 |
| `date-panel-note` | 넘침 0 |
| **전체 자동 검사** | `scrollWidth − clientWidth > 1` 인 말단 텍스트 **0건**, 말줄임 발생 **0건** (검수·배포·PC·Mobile 4개 런 전부) |

### B-2. 기하 — 전량 불변, 검수 화면 = 배포 안내 화면

| 항목 | 검수(ui-review) | 배포 안내(components) | 기대 | 판정 |
|---|---|---|---|---|
| dp 트리거 4크기 | 180×28 / 34 / 44 / 48 | 180×28 / 34 / 44 / 48 | 28·34·44·48 | ✅ |
| dp 패널 | 356×352 | 356×352 | 356×352 | ✅ |
| dp 달력 내용 | 308×312 | 308×312 | 308×312 | ✅ |
| dp 헤더 | 308×32 | 308×32 | 308×32 | ✅ |
| dp 칸 / 원 | 44×44 / 30×30 | 44×44 / 30×30 | 44×44 / 30×30 | ✅ |
| dp 타일 | 88×56 | 88×56 | 88×56 | ✅ |
| dp 기간 밴드(range) | 셀 44×44 유지 · 밴드 렌더 정상(스크린샷) | 동일 | — | ✅ |
| dp 모바일 시트 | 높이 **490** (폭은 컨테이너 356) | 높이 **490** (폭 360) | 490 | ✅ |
| tp 트리거 3크기+Mobile | 150×28 / 34 / 44 / 48 | 동일 | — | ✅ |
| tp 목록 패널 | 150×247.19 · 194×247.19 · 셀 h32 | 동일 | — | ✅ |
| tp 휠 시트 | **450**(TimeOnly) · **514**(DateTime) | **450** · **514** | 450 / 514 | ✅ |
| tp 휠 칸 | **44** (48×44 · 64×44) · 창 360×272 | 동일 | 44 | ✅ |
| Light ↔ Dark | 위 전 항목이 테마와 무관하게 동일 | 동일 | — | ✅ |

### B-3. 자간·줄높이 값 — 검수 ↔ 배포 완전 일치 (W-2·X-1 계약)

| 부품 | 양쪽 공통 실측 | 정본 환산 |
|---|---|---|
| dp 트리거 12 / 14 | `normal`·15.6px / **-0.28px**·18.2px | 12×0 / 14×-0.02 · 130% |
| dp 요일·날짜 숫자·타일 | **-0.32px**·20.8px | 16×-0.02 · 130% |
| dp 연·월 라벨 | `normal`·31.2px | 24×0 · 130% |
| dp·tp 시트 제목 | `normal`·26px | 20×0 · 130% |
| tp 목록 셀·확인·트리거 14 | **-0.28px**·18.2px | 14×-0.02 · 130% |
| tp 휠 숫자 | `normal`·41.6px | 32×0 · 130% |
| tp `date-panel-note` | **-0.28px**·18.2px | 14×-0.02 · 130% |

### B-4. 적대 테스트 — 호스트가 타이포를 흔들어도 버티는가

`body` 에 `letter-spacing:3px` + `line-height:3.7` 을 걸고(우선순위 조작 없이 상속만) 다시 측정했습니다.

- **선언된 자리 전부 방어 성공** — 날짜 숫자 -0.32/20.8 · 요일 -0.32/20.8 · 타일 -0.32/20.8 · 트리거 -0.28/18.2 · 연월 라벨 normal/31.2 · 시트 제목 normal/26 **모두 불변**.
- **기하도 불변** — 패널 356×352 · 달력 308×312 · 칸 44×44 · 타일 88×56 · 요일 44×44 · 휠 창 360×272.
- ℹ️ **단 한 곳이 흔들렸습니다 → Z-3.**

### B-5. 육안

| 파일 | 내용 |
|---|---|
| `screens/verify7-review-datepicker-full.png` | 검수 화면 Date Picker 절 전체 — 트리거 4상태 × 3크기, 팝오버 달력, Year/Month 타일 화면, **기간 선택 완료(17~22일) 밴드**, 모바일 시트+「적용」. 일=빨강·토=파랑. 줄바꿈·겹침·잘림 없음 |
| `screens/verify7-review-timepicker.png` | 검수 화면 Time Picker 절 — 트리거 3크기 × 상태 5종, 24시간제 2열·12시간제 3열 패널, 「확인」 푸터. 잘림 없음 |

---

## (C) 자동 검사 · 배포 동일성

| 검사 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS · errors=0 · policy=candidate |
| `npm run ui:icons` | ✅ PASS · icons=13 errors=0 (경고 2건은 baseline 등록된 기존 부채) |
| `npm run ui:build` | ✅ PASS · 110 files · **재빌드해도 dist 무변경**(해시 동일) → 결정론 확인 |
| `npm run ui:test` | ✅ PASS |
| `npm run ui:guide:render` | ✅ PASS · 18종 × PC·Mobile (date-picker 는 draft 라 대상 밖) |
| `npm run components:variantcov` (Gate 19) | ✅ PASS · pairs=49 verified=49 newGaps=0 |
| `npm run canon:check` (Gate 34) | tracked=**617** added=**5** — **전부 `uistate:date-picker.*` = B5**. removed=1 `componentprop:Menu`(다른 세션 GNB 작업). **이번 자간 수정으로 늘어난 항목 0** (자간·줄높이는 CSS 속성이라 Gate 34 추적 대상이 아님) |
| source ↔ dist | `date-picker.css/js`·`time-picker.css/js` **sha256 완전 동일** |
| 전체묶음 ↔ 개별설치 | 두 컴포넌트의 CSS 규칙 125개를 `s1-ui.css` 와 문자열 대조 — **자간·줄높이 포함 전부 일치**. 다른 것은 아이콘 mask 경로 `../assets/icons/…` → `./assets/icons/…` 재작성 **5건뿐**(빌드가 의도적으로 하는 경로 보정) |

---

## 관찰 사항 (❌ 아님 — 판정에 반영하지 않음)

### Z-1 · 보고 기술 부정확 (코드는 정상)
`grid[data-tile-grid]` 는 자간을 "정정한 자리"가 아닙니다 — 그 규칙에는 타이포 선언이 없습니다. 글자는 `tile` 이 갖고 그쪽은 맞습니다. `orchestratorFixes` 의 "-2% 8종"도 실제로는 **7종**입니다. 둘 다 서술 오류이며 코드는 정확합니다.

### Z-2 · 6차 보고서의 사실 오류를 정정합니다 (범위 밖 · B11 재정의 필요)
6차 보고서는 *"Y-1 이 밝힌 자간 규칙(14·16px = -2%)은 그 컴포넌트들에는 이미 올바르게 적용돼 있다 — 이번 두 컴포넌트만 예외다"* 라고 적었습니다. **사실이 아닙니다.** 소스와 실제 렌더 양쪽으로 확인했습니다.

| 컴포넌트 | `letter-spacing` 선언 수 | 실측 계산값 | 정본 | 상태 |
|---|---|---|---|---|
| select (트리거·옵션 14/12) | **0개** | `normal` | 14 → -2% | ❌ 어긋남 |
| dropdown (옵션 14/12) | **0개** | `normal` | 14 → -2% | ❌ 어긋남 |
| filter-chip (트리거 14M) | **0개** | `normal` | -2% | ❌ 어긋남 |
| multi-toggle (셀 14M) | **0개** | `normal` | -2% | ❌ 어긋남 |
| tab (라벨 16M/18M/14M) | **0개** | `normal`·줄높이도 `normal` | 16M → -2%·130% | ❌ 어긋남 |
| pagination | **0개** | — | — | 미판정 |
| table (헤더·셀) | 1개 | 14px 에 -0.28px ✅ / **12px(xsm)에도 -0.24px** | 12 → **0%** | ❌ 반대 방향으로 어긋남 |
| modal | 2개 | 18B·16B·12M 전부 `normal` | 0% | ✅ 맞음 |
| button · input | — | 크기별로 갈라 씀 | — | ✅ 맞음 |

전부 **이미 승인·배포된 컴포넌트**이고 이번 작업이 만든 것이 아니므로 date-picker 판정에는 넣지 않았습니다. 다만 **B11 을 "줄높이 상속 부채"가 아니라 "자간 + 줄높이 부채"로 다시 정의**해야 하며, 특히 `tab` 은 이번 작업의 DateTime 휠 시트 안에서 실제로 쓰이고 있습니다(정본 Line Tab Mobile/SM 라벨 = 16 Medium → `body/16M` -2%·130%, 웹은 `normal`/`normal`).

### Z-3 · 마지막 상속 구멍 — `sheet-footer` (두 컴포넌트 공통, 현재 화면에는 영향 없음)
적대 테스트에서 **`[data-s1-part="sheet-footer"]` 만** 48px → 59.19px 로 자랐고, 그 여파로 모바일 시트 높이가 date-picker 490→501.19, time-picker 450→461.19 / 514→525.19 로 변했습니다. 원인은 footer 가 `line-height` 를 선언하지 않는 블록이라 인라인 스트럿이 호스트 줄높이를 상속하기 때문입니다(16px × 3.7 = 59.2 > 버튼 48).

- **현재 두 화면에서는 문제가 없습니다** — 검수(줄높이 normal)·배포 안내(1.6) 모두 footer 48px 로 같습니다. 호스트 줄높이가 **3.0(=48px) 이상**일 때만 나타납니다.
- 값이 정본과 어긋난 것도 아니고 화면 간 차이도 없으므로 ❌ 로 올리지 않았습니다. 다만 W-2 가 세운 "배포본 기하는 호스트에 좌우되지 않는다"는 계약을 완전히 닫으려면 이곳이 마지막 구멍입니다. `sheet-footer` 에 `line-height: var(--line-height-130)` 을 넣거나 `display:flex` 로 스트럿을 없애면 끝납니다. **승격을 막지는 않습니다.**

---

## 검증하지 못한 범위 (정직 고지)

1. **구현자 보고서가 없어** 의도 대조를 하지 못했습니다(오케스트레이터가 직접 수정, 빌더 정지).
2. **키보드 이동 뒤 초점이 앉는 칸** — 1~6차와 같은 한계(rAF 미발화). 이번에도 미검증.
3. **실제 터치 기기 · 스크린리더 실낭독 · Figma V3.0 캔버스 대조** — Figma MCP 인증 미완(`plugin:figma:figma` 미승인). 1~6차와 동일하게 미검증.
4. **date-picker 본체 전수 대조**(색·토큰·상태 전이·D4/D6 동작·접근성)는 **지시대로 반복하지 않았습니다** — 1~4차 결론을 승계합니다.
5. `build-components.ts` 함수 단위 재대조는 하지 않았습니다(5차에서 6개 빌더 바이트 동일 확인 · 다른 세션이 계속 편집 중). 이번엔 **읽기만** 했고, 읽은 구간(`makeBoundText`·`textStyleKey`·6개 빌더의 텍스트 호출)은 지금 파일 기준입니다.
6. `font-weight` 미선언 4곳에 대한 적대 테스트(호스트가 `font-weight` 를 바꾸는 경우)는 하지 않았습니다.
7. `pagination` 의 자간은 Z-2 표에서 실측 표본을 못 잡아 **미판정**으로 남겼습니다.

## 임시 파일

계측 스크립트·중간 JSON·스크린샷 원본은 전부 **저장소 밖 스크래치패드**에서 만들고 실행했습니다. 저장소에 추가한 파일은 이 보고서에 인용된 스크린샷 2장(`screens/verify7-*.png`)뿐이며, `git status` 의 추적되지 않은 파일 목록은 검증 시작 전과 **동일**합니다(임시 파일 0건).

---

## 5단계·6단계 — 남은 조건

- **5-human-review(river 검수): 진행 가능.** 검수 화면과 배포 화면이 자간·줄높이·기하 전 항목에서 같은 물건입니다.
- **6-promotion(승격): river 승인 문장(B5) 외에 남은 필수 조건은 없습니다.**
  1. **B5 — Gate 34 `uistate:date-picker.*` 5건.** river 가 승인 문장을 직접 타이핑해야 `gate:check` 가 통과합니다. **이것이 유일한 차단 조건입니다.**
  2. 승격 작업 자체에 포함되는 것(조건이 아니라 절차): manifest `status` `draft`→`approved`, `pages/components.html` 의 Date Picker 메뉴 `disabled` 해제, `ui:guide:render` 대상 18→19종 재실행.
  3. **차단하지 않는 후속 작업**: CU-1(주 시작 요일)·CU-2(연/월 버튼)·CU-3/B7(주말 색)의 Figma 정본 반영 · Z-2(B11 자간 부채, 별도 작업) · Z-3(`sheet-footer` 줄높이 굳히기, 권고).
- **B6(Y-1·Y-2 수정분 독립 확인) 은 이번 7차로 해소됩니다.**

## 권장 상태 전환 (검증자는 상태 파일을 직접 고치지 않는다)

- `workflowStatus`: **in-progress** (blocked 해제 — 남은 차단은 river 승인 문장뿐)
- `uiLibraryStatus`: **draft** 유지 (승격 전)
- `lastCompletedCheckpoint`: **4** (4-verification 통과)
- `blockers`: **B6 해소(제거)**. B5 유지. B8·B11 유지(B11 은 Z-2 대로 "자간+줄높이"로 재정의 권고)
- `nextAction`: **5-human-review 진행 → river 승인 문장 확보(B5) → 6-promotion.**
