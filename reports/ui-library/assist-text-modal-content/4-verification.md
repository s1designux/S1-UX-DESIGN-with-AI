# 4-verification — 시나리오 F 독립 검증 (🤖 component-verifier)

- 검증일: 2026-09-08
- 대상: `assist-button` · `text-button` · `modal-content` (웹 배포본 + 안내/검수 화면)
- 정본: `plugins/figma-vars-installer/src/build-components.ts`
  - `buildAssistButtonSet` 582–630 · `buildTextButtonSet` 668–712 · `buildModalContent` 5499–5620
- 판정: **FAIL** (❌(a) 1건 · ❓(c) 2건) — 나머지 항목 전부 PASS
- 구현 보고서(3-build.md)는 근거로 쓰지 않았다. 정본 코드를 직접 판독했다.

---

## 0. 기계검사 재실행 (위조 방지 · 종료코드만 확인)

| 명령 | 종료코드 |
|---|---|
| `npm run ui:contract` | 0 |
| `npm run ui:build:check` | 0 ← **호출자 표에 없던 항목. dist 손편집·드리프트 0 을 증명** |
| `npm run ui:test:check` | 0 |
| `npm run ui:icons` | 0 |
| `npm run ui:icons:origin` | 0 |
| `npm run ui:guide:render` | 0 |
| `npm run ui:runtime` | 0 (cases=22 · failed=0) |
| `npm run ui:state -- reports/.../workflow-state.json` | ❌ 정본 지문 변경 — 아래 §5-3 참조 |

---

## 1. 정본 전수 대조 — variant / state / size

### 1-1. Assist Button (정본 4변형)
`ASSIST_BUTTON_STATES = ["Default","Hover","Pressed","Disabled"]` · 크기축 없음 · variant축 없음.

| 항목 | 정본 | 웹 실측 | 판정 |
|---|---|---|---|
| 상태 수 | 4 | 안내화면 셀 4개(PC 4 · Mobile 4) | ✅ |
| 높이 | 32 (`comp.resize(60,32)`) | `height 32px`, 실측 32.0 | ✅ |
| 좌우 패딩 | `spacing/12` | `padding-inline 12px` | ✅ |
| 최소 폭 | 60 (`minWidth=60`) | `min-width 60px` | ✅ |
| 반경 | `radius/4` | `border-radius 4px` | ✅ |
| 타이포 | 14 Medium `body/14M`(130% · -2%) | 14px / 500 / `line-height 18.2px` / `letter-spacing -0.28px` | ✅ |
| Default 색 | bg `secondary--default` · border `secondary--default` · label `assist--default` | `#FFFFFF` / `#D9D9D9` / `#757575` | ✅ |
| Hover/Pressed 색 | bg `secondary--hover` · border `assist--hover` · label `assist--hover` | **실제 :hover 실측** `#F5F5F5` / `#D9D9D9` / `#757575` | ✅ |
| Disabled | 공통 disabled 3토큰 | `#F5F5F5` / `#D9D9D9` / `#C4C4C4` | ✅ |
| Dark | `gray-dark/100` · `gray-dark/500` · `gray-dark/700` | `#1C1D23` / `#3E4049` / `#8A8C96` | ✅ (호출자 실측 재확인) |

`Pressed = Hover` 를 CSS `:is(:hover,:active):not(:disabled)` 로 표현 — 정본 규칙과 일치.

### 1-2. Text Button (정본 8변형 = Variant 2 × State 4)

| 항목 | 정본 | 웹 실측 | 판정 |
|---|---|---|---|
| 변형 수 | 8 | 안내화면 셀 8개(PC 8 · Mobile 8) | ✅ |
| Primary 색 | `color/text/state/accent` | `#1D6CEB` | ✅ |
| Secondary 색 | `color/text/body/tertiary` | `#757575` | ✅ |
| Disabled 색 | `color/text/state/disabled` | `#C4C4C4` | ✅ |
| Hover/Pressed | 색 불변 + 밑줄만 | 8칸 실측: hover·pressed 만 `underline`, 색 동일 | ✅ |
| 배경·테두리·패딩·반경 | 전부 없음(hug) | `background rgba(0,0,0,0)` · `border 0` · `padding 0` · `radius 0` | ✅ |
| 타이포 | 14 Medium `body/14M` | 14 / 500 / 18.2px / -0.28px | ✅ |

### 1-3. Modal Content (정본 6변형 = Size 3 × Footer 2)

`MODAL_CONTENT_GEO` MD 520×336 · LG 1000×587 · XL 1200×587.

| 항목 | 정본 | 웹(dist 계산값 · components.html) | 판정 |
|---|---|---|---|
| 변형 수 | 6 | 6 | ✅ |
| 폭 | 520 / 1000 / 1200 | CSS `width` 520 / 1000 / 1200 | ✅ |
| 높이 | 336 / 587 / 587 (**최소값**, river 결정 ③) | `min-height` 336 / 587 / 587 + `max-height:85vh` | ✅ |
| 상하 패딩 | `spacing/20` | `padding-block 20px` | ✅ |
| 섹션 간격 | `itemSpacing 32` (`spacing/32`) | `gap 32px` | ✅ |
| 헤더·본문·푸터 좌우 | `spacing/24` | 3곳 모두 `padding-inline 24px` | ✅ |
| 푸터 버튼 간격 | `itemSpacing 8` | `gap 8px` · `justify-content flex-end` | ✅ |
| 제목 | 16 Bold `title/16B` `text/title/primary` | 16px / 700 / ls normal / `#000000` | ✅ |
| 닫기 | `close` 라이브러리 부품 24px `icon/gray-dark` | 24×24 · mask `dist/assets/icons/close.svg` · `#353535` | ✅ (신규 아이콘 등록 0) |
| 푸터 버튼 | 코어 Button XXSM(h28), Dual=취소→확인 | `data-size="xxsm"` 실측 h28.0, 순서 secondary→primary | ✅ |
| 패널 면·테두리·반경·그림자 | `surface/raised` · `modal/panel/border` · `radius/8` · `shadow/raised` | `#FFFFFF` / `#D9D9D9` / 8px / 정본 shadow 문자열 동일 | ✅ |
| 본문 | `bg/level-2` 박스 + `radius/4` + "컨텐츠 영역" `text/body/tertiary` | `#F5F5F5` / 4px / "컨텐츠 영역" / `#757575` | ✅ (라이트) · ❓ 다크 §4-2 |
| 딤 | `color/overlay` | `var(--color-overlay)` = rgba(0,0,0,.5) / .75 | ✅ |

**높이 규칙(river 결정 ③) 실동작 검증** — 안내/검수 화면의 과다콘텐츠 표본에서 패널 높이 850px(= `max-height:85vh` @vh1000)에서 멈추고 `content-area` 가 `scrollHeight 900 / clientHeight 692` 로 내부 스크롤 전환, 헤더·푸터 모두 표시 유지. ✅

---

## 2. 접근성·동작 (빈 HTML 소비자 `empty-consumer.html` 실측)

| 항목 | 결과 |
|---|---|
| `role=dialog` · `aria-modal=true` · `aria-labelledby`→title id 해석 | ✅ |
| 열림 시 초점 진입(닫기 버튼) | ✅ |
| Tab 마지막→처음, Shift+Tab 처음→마지막(초점 가둠) | ✅ |
| Escape 닫힘 | ✅ |
| 닫은 뒤 초점 복귀(여는 버튼) | ✅ |
| 배경 스크롤 잠금 · 해제 | ✅ |
| 딤 클릭으로 닫히지 않음 | ✅ (확인 계열 `modal.js` 와 동일 계약 — 회귀 아님) |
| 닫기 버튼 동작 | ✅ |
| 다중 인스턴스 2개 동시 열기 · 잠금 카운트 | ✅ (1개 닫아도 `hidden` 유지, 마지막에 복원) |
| 반복 init → 같은 인스턴스 반환 | ✅ |
| destroy 후 재init → 새 인스턴스 | ✅ |
| assist-button / text-button `jsRequired=false` (런타임 없이 동작) | ✅ |
| 포커스 표시 | 브라우저 기본(정본에 focus 표현 없음) — 코어 Button 과 같은 방침, manifest 에 선언됨 ✅ |

## 3. 설치 방식 동일성

`empty-consumer.html`(전체 묶음) ↔ `empty-consumer-individual.html`(개별 설치) 실측 비교:
- assist-button 73.28×32 / 색 4종 동일, text-button 59.10×18.20 / 색 동일
- modal-content `outerHTML` 문자 단위 동일, 패널 520×336 · gap 32 · pad 20 · radius 8 · 색 동일, 닫기 24×24 · 같은 mask URL
- 개별 설치 시 `modal-content` 가 `components/button.css` 의존을 manifest 에 선언 ✅

## 4. 안내 화면 ↔ dist

- `pages/ui-review.html` 은 `../ui-library/dist/{tokens,typography,s1-ui}.css` + `dist/s1-ui.js` 만 소비 ✅
- 안내 화면 전용 CSS는 배치·눕히기·축소표시뿐이며 색·크기·간격을 재선언하지 않는다 ✅
- `data-force-state` 미리보기 CSS는 dist 와 **같은 토큰**만 쓴다(`ui-library-guide.css:373-385`) — 기존 button/chip 등과 같은 확립된 방식 ✅
- 코드탭 3종(HTML/CSS/JS)이 dist example·source 에서 생성됨 ✅
- `pages/components.html` 크기 비교표: CSS 폭 520/1000/1200 을 유지한 채 `transform:scale(0.3)` 표시 → 렌더 156/300/360 (정확히 0.3배, 비율 보존) ✅
- 실물 팝업(안내 화면): vw1400 에서 LG 1000×587 로 열림, Esc 닫힘, 초점 복귀 ✅

---

## ❌ (a) 코드 실수 — 1건

**A-1. 검수 화면(`pages/ui-review.html`)에서 Modal Content LG·XL 이 560px 로 찌그러진다.**

- 실측(vw=1400, 캡처 조건과 동일): `md 520 · md 520 · lg 560 · lg 560 · xl 560 · xl 560`
- 원인: 추가된 검수 전용 CSS(`pages/ui-review.html:220-226`)가 슬롯에 `overflow-x:auto` 만 주고, `[data-s1-part="panel"]` 이 flex 항목이라 `flex-shrink:1` 로 **넘치는 대신 줄어든다.** 그래서 가로 스크롤이 생기지 않고 폭만 잘못 표시된다(호출자의 "가로 넘침 없음 = 정상" 판단은 이 축소 때문에 성립한 것이다).
- 영향: river 가 이 화면에서 **크기 3종을 구분할 수 없다.** LG·XL 이 화면상 완전히 동일하고, 둘 다 정본 폭이 아니다. 캡처본 `screens/review-full.png` 에서도 6칸이 모두 같은 폭으로 보인다.
- 안내 화면(`components.html`)은 정상이므로 **검수 화면만의 결함**이다.
- 수정은 구현자 소관(검증자는 고치지 않는다).

## ❓ (c) 애매 — river 확인 필요 2건

**C-1. 다크에서 "회색 자리표시 박스"가 보이지 않는다.**
`color/bg/level-2` 와 `color/surface/raised` 가 다크에서 **둘 다 `gray-dark/100`(#1C1D23)** 이다(`vars-data.ts:481,493`). 따라서 다크 모달에서는 본문 박스와 패널 면이 같은 색이라 박스가 사라지고 "컨텐츠 영역" 글자만 뜬다(캡처 확인). 웹은 정본을 그대로 옮긴 것이라 코드 실수가 아니지만, **river 결정 ②("회색 박스 + 안내문구")가 다크에서 미충족**이다. 웹만 다른 토큰으로 바꾸면 정본과 갈라지므로 정본 결정이 필요하다.

**C-2. 정본 Text Button 의 라벨 문구가 "보조버튼" 이다.**
`build-components.ts:679` 가 Text Button 에도 `makeBoundText("보조버튼", ...)` 를 쓴다(Assist Button 과 같은 글자). 웹 예시는 "텍스트버튼" 으로 냈다. 문구는 컴포넌트 사양이 아니라는 정본 주석이 따로 있어 (b) 로 넘길 수도 있으나, 정본의 복사 실수로 보여 임의 판정하지 않는다.

## 🟡 (b) 사전 등록된 개선 — 0건 추가

정본 주석에 이미 등록된 (b) 항목(hover 배경 근사 D-13 · 제목 16B/버튼 XXSM · close 부품 통일)은 웹이 정본을 따랐으므로 새로 적재할 것이 없다.

---

## 5. 호출자 진술 대비 사실 정정 3건

**5-1. `gate:check` 11 error 의 구성이 다르다.**
실제: **Gate 13 ×1 + Gate 34 ×10.** 호출자가 든 `design:md:agent-contract-check` 의 Modal 항목은 error 목록에 없다.

**5-2. Gate 34 의 10건은 "이번 구현 밖"이 아니다.**
`uistate:assist-button.{default,hover,pressed,disabled}` · `uistate:text-button.{같은 4종}` · `uistate:modal-content.{open,closed}` — **이번 작업이 새로 만든 웹 상태 이름들**이다. 정본 신설 승인(H6② · Gate 34)이 없으면 커밋이 막힌다. river 승인 대기 상태로 보고하는 것은 맞으나, "이번 구현의 결함으로 세지 말 것"이라는 범위 서술은 사실과 다르다.

**5-3. 상태파일 D3 의 영향 조사 근거문이 부정확하다.**
D3 은 "시각·수치에 영향을 주는 변경은 `buildMobileHeader` 뿐"이라 적었으나, 미커밋 diff 는 `buildInput`(1051–1204) 도 바꾼다(`combineAsVariants`→`upsertSet`, `addComponentProperty`→`ensureComponentProperty`, `SPEC_SUPPRESSED`). 다만 그 변경은 **설치기 제자리 갱신 메커니즘**이고 geometry·토큰을 바꾸지 않아 **결론(웹 시각 영향 없음)은 유지**된다. 근거 기술만 보완이 필요하다.
또한 이번 세 빌더(582–712 · 5499–5620)는 미커밋 diff 가 건드리지 않았음을 hunk 로 확인했다 — `ui:state` 실패가 다른 세션 때문이라는 진단은 사실이다.

또한 `scripts/canon-addition-check.js` 의 미커밋 수정은 **검사 범위를 넓히는 강화**(`ensureComponentProperty` 추적 추가)이며 약화가 아니다. 다른 세션 소관.

---

## 6. 이번에 확인하지 못한 범위

- **Figma 캔버스 실물 렌더 대조** — 정본은 코드로만 판독했다. Figma 라이브러리에 실제로 그려진 결과는 이 시나리오(F) 범위 밖이다.
- **22종 전체 회귀의 육안 확인** — 기계검사(`ui:build:check` · `ui:guide:render` · `ui:runtime`)에 위임했고, 육안 표본은 확인 계열 `modal`(PC 360 / Mobile 300 · 회귀 없음)과 `button`(h28/34/44 · 회귀 없음) 2종만 직접 봤다.
- **실제 모바일 기기** — modal-content 는 PC 전용이라 미대상. assist/text button 의 Mobile 섹션은 셀 수(4·8)와 `ui:guide:render` 통과로만 확인했다.
- **Text Button 실제 :hover 픽셀** — dist CSS 규칙과 강제상태 8칸 실측으로 갈음했다(assist-button 은 실제 :hover 로 직접 실측함).

## 7. 권장 상태

- `workflowStatus`: `blocked-on-fix`
- `uiLibraryStatus`: `draft` 유지 (승인 금지)
- `nextAction`: A-1 수정 후 재검증(델타). 동시에 C-1·C-2 를 river 결정으로 올리고, Gate 34 10건 승인을 받는다.

---

# 2회차 — 델타 재검증 (🤖 component-verifier · 2026-09-08)

- 범위: `pages/ui-review.html` 검수 전용 CSS 1블록 추가(`[data-s1-component="modal-content"].is-review-inline [data-s1-part="panel"] { flex-shrink: 0; }`, 230~236행)에 대한 델타만 검증.
- 판정: **FAIL** — A-1 은 **절반만 해소**, 같은 뿌리의 ❌(a) 1건(A-2) 신설.
- 실측 조건: 로컬 서버 `http://127.0.0.1:4173/pages/ui-review.html`(`file://` 아님) · 뷰포트 1400×1000 · Light/Dark 양쪽 · 헤드리스 크롬 캡처 `--window-size=1400,7200`.

## 2-0. 기계검사 재실행 (종료코드만)

| 명령 | 호출자 표 | 21:20 재실행 | 21:31 재실행 |
|---|---|---|---|
| `npm run ui:build` | 0 | 0 | **1** |
| `npm run ui:test` | 0 | 0 | — |
| `node scripts/ui-guide-render-check.js` | 0 | 0 | — |
| `npm run ui:build:check` | (표에 없음) | — | **1** |
| `npm run ui:runtime` | (표에 없음) | 0 (cases=22 · failed=0) | — |

**21:26:43 에 `plugins/figma-vars-installer/src/build-components.ts` 가 다른 세션에 의해 다시 수정되어** 빌드 지문이 어긋났다(`input canonicalFingerprint is stale`). 지문은 canonicalSources **파일 전체 해시**라 무관한 편집에도 전 컴포넌트가 함께 stale 이 된다. 이번 델타(HTML 한 줄)와 무관하며, 커밋 전 재빌드가 필요하다.
정본 diff hunk 위치(469·488·798·815+241·817·1185–1204·6600 이후)를 확인한 결과 **이번 세 빌더의 정본 구간(assist/text button 582–712 · modal content 5531–5620)은 이번 편집에 닿지 않았다** → 1회차 정본 대조 결과는 유효.
`ui-library/dist` 는 src manifest 지문과 일치(예: input `6b7e7b…`) — dist 드리프트 없음.

## 2-1. A-1 — 부분 해소 ✅(폭) / ❌(가시성)

**해소된 부분:** 패널이 정본 폭 그대로 그려진다. vw1400 실측(Light 7칸 · Dark 7칸, 총 14칸):

| 순서 | 정본 크기 | 실측 `getBoundingClientRect().width` | `flex-shrink` |
|---|---|---|---|
| 1 (높이규칙 표본) | LG | **1000** | 0 |
| 2·3 | MD | **520 · 520** | 0 |
| 4·5 | LG | **1000 · 1000** | 0 |
| 6·7 | XL | **1200 · 1200** | 0 |

Dark 7칸 동일(`1000,520,520,1000,1000,1200,1200`). 1회차의 560px 찌그러짐은 사라졌다. 문서 가로 스크롤 없음(`documentElement.scrollWidth == clientWidth == 1400`, vw1024 에서도 1024 == 1024).

## ❌ (a) 코드 실수 — A-2 (신설)

**A-2. LG·XL 패널이 슬롯 양쪽으로 넘쳐, 왼쪽 절반이 스크롤로도 닿지 않는다 — 제목·닫기·푸터 버튼이 전혀 보이지 않는다.**

- 구조 실측: `.review-matrix` 는 vw1400 에서 **2열(658px 658px = Light | Dark)**, 슬롯 `.review-component-slot` 폭 **608px**. 패널의 부모(`.is-review-inline` 루트)는 `display:flex; justify-content:center` 라 패널이 **좌우로 균등하게** 넘친다.
- 잘린 양(실측 `slot.left - panel.left` / `slot.scrollLeft` 최대값):

| 크기 | 패널 폭 | 슬롯 폭 | 왼쪽으로 잘림(스크롤 불가) | 오른쪽 최대 스크롤 |
|---|---|---|---|---|
| MD | 520 | 608 | 0 (여유 44px) | 0 |
| LG | 1000 | 608 | **196px** | 196px |
| XL | 1200 | 608 | **296px** | 296px |

  `scrollLeft` 범위는 `0 … 196`(LG) / `0 … 296`(XL) — **음수로 갈 수 없어 왼쪽 잘린 부분은 영구히 볼 수 없다.** 1회차가 지적한 `overflow-x:auto` 의 한계가 그대로 남아 있다(가운데 정렬 + 넘침은 한 방향만 스크롤된다).
- 화면 결과(캡처 대조): LG·XL 칸에는 **패널 좌우 테두리·둥근 모서리·제목("제목 영역")·닫기 X·푸터 버튼이 하나도 보이지 않고**, 가운데 608px 구간(회색 콘텐츠 박스)만 가로로 꽉 찬 상태로 보인다. Light·Dark 동일.
- **1회차 A-1 의 영향 서술("river 가 크기 3종을 구분할 수 없다")은 아직 해소되지 않았다** — LG(1000)와 XL(1200) 모두 608px 슬롯을 가득 채워 **화면상 여전히 완전히 동일하게 보인다.** 구분 가능한 것은 MD 뿐이다.
- 수정은 구현자 소관(검증자는 고치지 않는다).

## 2-2. 부작용 — 없음 ✅

새 규칙의 실제 적용 범위를 DOM 으로 셌다: 페이지 전체 `[data-s1-part="panel"]` **330개**(modal-content 16 · select 44 · filter-chip 124 · modal 12 · time-picker 76 · date-picker 58) 중 새 규칙이 매칭하는 것은 **14개뿐**이고 전부 modal-content 정적 표본이다.

| 확인 대상 | 실측 | 판정 |
|---|---|---|
| 확인 계열 Modal(`data-s1-component="modal"`) | PC 360×194 · Mobile 300×209 (Light·Dark 각 2) — 1회차와 동일 | ✅ 회귀 0 |
| modal-content 실제 팝업(정적 아님 2개) | `.is-review-inline` 아님 → 규칙 **미적용**(`flex-shrink:1` 유지). 열기 실측 520×336, left 440(중앙), 초점 닫기 버튼, Esc 닫힘 | ✅ |
| Assist Button · Text Button 섹션 | 셀 4 · 8 | ✅ |
| 본문 가로 스크롤 | vw1400 / vw1024 모두 `scrollWidth == clientWidth` | ✅ |
| Dark(`prefers-color-scheme: dark`) | 폭 14칸 Light 와 동일 | ✅ |
| 다른 섹션 22종 | `ui-guide-render-check` 0 + 패널 매칭 수 0건으로 확인 | ✅ |

**참고(결함 아님):** vw1024 에서는 LG·XL 이 둘 다 976px 로 줄어든다 — dist 자체의 `max-width` 반응 규칙이며 검수 CSS 와 무관하고 modal-content 는 PC 전용이다.

## 2-3. 이번에 재확인하지 않음 (1회차 PASS 승계)

정본 대조(§1) · 접근성 동작(§2) · 설치 방식 동일성(§3) · `components.html` 안내 화면(§4) 은 **이번에 재확인하지 않았다.** 근거: 델타가 `pages/ui-review.html` 의 검수 전용 CSS 1블록뿐이고, 정본 diff hunk 가 세 빌더 구간에 닿지 않음을 확인했다. 단 `build-components.ts` 전체 지문은 21:26 편집으로 달라졌으므로, **그 편집이 커밋에 포함되면 세 컴포넌트 재빌드 후 §1 을 다시 돌려야 한다.**

## 2-4. ❓ (c) — 1회차 2건 유지, 재판정하지 않음

C-1(다크에서 회색 자리표시 박스가 안 보임) · C-2(정본 Text Button 라벨 "보조버튼")는 river 결정 대기로 그대로 둔다.

## 2-5. 권장 상태

- `workflowStatus`: `blocked-on-fix` 유지
- `uiLibraryStatus`: `draft` 유지 (승인 금지)
- `nextAction`: A-2 수정(검수 화면에서 LG·XL 패널의 **왼쪽부터** 보이게 하거나, 슬롯을 패널보다 넓게 잡거나, 축소 표시로 3종을 한눈에 구분되게 한다 — 방식은 구현자 판단) 후 다시 델타 재검증. 아울러 다른 세션의 정본 편집이 끝나면 재빌드해 `ui:build`/`ui:build:check` 를 0 으로 되돌린다.

---

# 3회차 — 델타 재검증 (🤖 component-verifier · 2026-09-08)

- 범위: `pages/ui-review.html` 의 Modal Content **정적 표본 6칸 축소 표시**(CSS `.review-modal-content-scale*` 1블록 + JS `scaledModalContentSample` + `sizeFooterCells` 렌더 교체) 델타만. 지시대로 **A-2 만** 본다.
- 판정: **FAIL** — A-2 는 **6칸에서는 해소**, 그러나 **「높이 규칙 확인」 칸에 그대로 남아 있다**(A-2 잔여, 신설 결함 아님).
- 실측 조건: 로컬 서버 `http://127.0.0.1:4173/pages/ui-review.html` · vw 1400×1200 · Light/Dark 12칸 전수 · 헤드리스 캡처 `--window-size=1400,5300`.

## 3-0. 기계검사 재실행 (종료코드만)

| 명령 | 호출자 표 | 재실행 |
|---|---|---|
| `npm run ui:build` | 0 | **0** |
| `npm run ui:test` | 0 | **0** |
| `node scripts/ui-guide-render-check.js` | 0 | **0** |

2회차의 지문 stale(다른 세션의 `build-components.ts` 편집)은 해소돼 `ui:build` 가 0 으로 돌아왔다.

## 3-1. A-2 — 6칸은 해소 ✅

12칸(Light 6 · Dark 6) 전수 실측. 모든 칸에서 제목·닫기(X)·푸터 버튼이 **클립 상자 안에 완전히 들어온다**(경계 밖 0건), 육안 캡처에서도 6칸 모두 테두리·둥근 모서리·제목·X·버튼이 보인다.

| 칸(라벨) | 클립 상자 | 패널 실측 | 라벨 환산(÷0.45) | 제목 | 닫기 | 푸터 버튼 |
|---|---|---|---|---|---|---|
| MD · Single (520×336) | 256×173 | 234×151.2 | 520×336 ✅ | 보임 | 보임 | 확인 |
| MD · Dual | 256×173 | 234×151.2 | 520×336 ✅ | 보임 | 보임 | 취소·확인 |
| LG · Single (1000×587) | 472×286 | 450×264.1 | 1000×587 ✅ | 보임 | 보임 | 확인 |
| LG · Dual | 472×286 | 450×264.2 | 1000×587 ✅ | 보임 | 보임 | 취소·확인 |
| XL · Single (1200×587) | 562×286 | 540×264.2 | 1200×587 ✅ | 보임 | 보임 | 확인 |
| XL · Dual | 562×286 | 540×264.2 | 1200×587 ✅ | 보임 | 보임 | 취소·확인 |

Dark 6칸 동일(패널 폭 234·234·450·450·540·540, 세 요소 전부 클립 안, 패널 배경 `rgb(28,29,35)`).
**LG(450)와 XL(540)이 90px 차이로 화면상 구분된다** — 1회차 A-1 의 "크기 3종을 구분할 수 없다"는 영향이 6칸에서는 해소됐다. 칸에 적힌 치수는 실측 환산값과 정확히 일치해 오해를 만들지 않는다.

## ❌ (a) 코드 실수 — A-2 잔여 (「높이 규칙 확인」 칸)

**호출자의 전제 "「높이 규칙 확인」 칸은 2회차에서 정상 판정"은 사실과 다르다.** 2회차 A-2 의 폭 표 「순서 1 (높이규칙 표본) = LG 1000」이 바로 이 칸이고, 잘림 표에서 **LG = 왼쪽 196px 스크롤 불가**로 판정된 대상이다. 3회차 실측에서 그대로 남아 있다.

| 항목 | Light 실측 | Dark 실측 | 판정 |
|---|---|---|---|
| 슬롯 | left 57 / right 665 (608px) | left 735 / right 1343 | — |
| 패널 | left **-139** / right 861 (1000px) | left 539 / right 1539 | 좌우로 196px 씩 넘침 |
| `scrollLeft` 범위 | 0 … 196 (음수 불가) | 동일 | 왼쪽 196px 영구 접근 불가 |
| 제목 "제목 영역" | left -114 / right **-55** | 564 / 623 (슬롯 시작 735보다 왼쪽) | **어떤 스크롤에서도 안 보임** |
| 닫기 X | 812 … 836 | 1490 … 1514 | 기본 상태 안 보임(오른쪽 171px 스크롤해야 보임) |
| 푸터 취소·확인 | 716…772 / 780…836 | 1394…1450 / 1458…1514 | 기본 상태 안 보임(스크롤 필요) |

캡처 육안: 이 칸은 회색 콘텐츠 박스만 좌우로 꽉 찬 채 보이고 패널 테두리·둥근 모서리·제목·X·버튼이 하나도 보이지 않는다(Light·Dark 동일) — 2회차 A-2 와 같은 그림이다.
이 칸의 목적은 "패널이 85vh 에서 멈추고 **제목·버튼은 그대로 보인다**"를 river 가 눈으로 확인하는 것인데, 정작 제목·버튼이 안 보여 목적을 달성하지 못한다. 수정 방식은 구현자 판단(검증자는 고치지 않는다).

## 3-2. 부작용 — 없음 ✅

| 확인 대상 | 실측 | 판정 |
|---|---|---|
| 새 클래스 적용 범위 | `.review-modal-content-scale` 12개 전부 modal-content 정적 6칸(×2테마), 섹션 밖 매칭 **0** | ✅ |
| 확인 계열 Modal | 승인 완료 탭 열어 실측 → PC 360×194 · Mobile 300×209 (각 Light·Dark 2) — 2회차와 동일 | ✅ 회귀 0 |
| modal-content 실제 팝업 | 열기 실측 520×336 · left 440(중앙) · 초점 닫기 버튼 · Esc 로 닫힘(display none 복귀) | ✅ |
| 「높이 규칙」 칸 실물 크기 유지 | 패널 1000×1020(= 85vh of 1200) — 축소 미적용, 의도대로 | ✅(단 위 A-2 잔여) |
| 본문 가로 스크롤 | `documentElement.scrollWidth == clientWidth == 1400`, body 1400, `.review-panel` 66개 전부 가로 넘침 0 | ✅ |
| 클립 상자가 슬롯을 벗어남 | 12칸 전부 0건 | ✅ |
| Dark | 12칸 중 Dark 6칸 전수 동일 결과 | ✅ |

**관찰(결함 아님):** 축소 칸의 높이는 `MODAL_CONTENT_REVIEW_DIMS` 에 하드코딩된 값(336/587)이고 바깥 상자는 `overflow:hidden` 이다. 현재는 실측 높이와 정확히 일치하지만, 나중에 정본 높이가 바뀌면 **경고 없이 아래가 잘린다**. 지금 판정에는 영향 없다.

## 3-3. 이번에 재확인하지 않음 (직전 PASS 승계)

정본 대조(§1) · 접근성 동작(§2) · 설치 방식 동일성(§3) · `components.html` 안내 화면(§4) · Assist/Text Button 섹션은 **이번에 재확인하지 않았다.** 근거: 델타가 `pages/ui-review.html` 검수 전용 CSS·JS 에 한정되고, `ui:build`·`ui:test`·`ui-guide-render-check` 가 모두 0 이다.

## 3-4. ❓ (c) — 재판정하지 않음

C-1(다크에서 회색 자리표시 박스가 안 보임) · C-2(정본 Text Button 라벨 "보조버튼") 는 river 결정 대기로 그대로 둔다.

## 3-5. 권장 상태

- `workflowStatus`: `blocked-on-fix` 유지
- `uiLibraryStatus`: `draft` 유지 (승인 금지)
- `nextAction`: 「높이 규칙 확인」 칸의 A-2 잔여 수정(슬롯을 패널보다 넓게 잡거나, 왼쪽 정렬로 바꾸거나, 6칸과 같은 축소 표시를 쓰되 세로 스크롤 시연은 유지 — 방식은 구현자 판단) 후 그 칸만 델타 재검증.

---

# 4회차 — 델타 재검증 (🤖 component-verifier · 2026-09-08)

- 범위: `pages/ui-review.html` 의 **「높이 규칙 확인」 칸 1개**만. (`scaledModalContentOverflowSample()` 신설 + 그 칸 렌더 교체, 바깥 예약 높이 `calc((85vh + 48px) * 0.45)`)
- 판정: **FAIL** — 지시받은 3개 확인 항목은 기준 뷰포트에서 전부 ✅, 그러나 **바깥 예약 높이 공식이 실제 패널 높이와 일치하지 않는 구간이 있어** ❌(a) 1건 신설(D-2).
- 실측 조건: `http://127.0.0.1:4173/pages/ui-review.html` · vw1400 × vh **1200 / 900 / 660 / 600 / 1600** · Light·Dark 2칸 전수 · 구현자 숫자는 쓰지 않고 직접 `getBoundingClientRect()` 실측.

## 4-0. 기계검사 재실행 (종료코드만)

| 명령 | 호출자 표 | 재실행 |
|---|---|---|
| `npm run ui:build` | 0 | **0** |
| `npm run ui:test` | 0 | **0** |
| `node scripts/ui-guide-render-check.js` | 0 | **0** |

## 4-1. 지시 항목 ① 제목·닫기·푸터가 스크롤 없이 보이는가 — ✅ (vh1200 기준)

vh1200 · Light/Dark 2칸 전수. 클립 상자(`.review-modal-content-scale`) 472×480.6, 안쪽 실물 1048px 폭을 0.45배.

| 항목 | Light 실측 | Dark 실측 | 클립 안? |
|---|---|---|---|
| 슬롯 | left 57 / right 665 (608) | 735 / 1343 | — |
| 클립 상자 | 57~529 × 2098.1~2578.7 | 735~1207 | — |
| 패널 | left 67.8 / right 517.8 (450 = 1000×0.45) | 745.8 / 1195.8 | ✅ 완전 포함 |
| 제목 "제목 영역" | 79.1~105.6 / top 2119.1 | 757~783.6 | ✅ |
| 닫기 X | 495.8~506.5 | 1173.8~1184.6 | ✅ |
| 푸터 취소·확인 | 452.5~477.8 · 481.3~506.5 / bottom 2558.5 | 1130.6~1155.8 · 1159.3~1184.6 | ✅ |

3회차의 "좌우 196px 넘침·제목 영구 미표시"는 **해소**됐다(패널 left 가 -139 → 67.8 로 슬롯 안으로 들어옴).

## 4-2. 지시 항목 ② 높이 규칙이 실제로 성립하는가 — ✅ (vh1200·900)

| 검사 | vh1200 | vh900 |
|---|---|---|
| 패널 computed height | **1020 = 85vh 정확히** (max-height 1020) | **765 = 85vh** |
| min-height | 587 (상한이 이김) | 587 |
| `content-area` scrollHeight / clientHeight | 900 / 862 → 내부 스크롤 **38px** | 900 / 607 → 내부 스크롤 **293px** |
| `scrollWidth == clientWidth` | 998 == 998 (가로 스크롤 없음) | 998 == 998 |
| 끝까지 스크롤 후 제목·닫기·푸터 좌표 변화 | **0** (2119.1 / 2118.4 / 2545.9 — 스크롤 전후 동일) | — |
| 스크롤 후에도 클립 안 | 제목·닫기·푸터 전부 ✅ | — |

패널이 상한에서 멈추고, 넘치는 콘텐츠는 본문 영역 안에서만 스크롤되며, 스크롤해도 헤더·푸터가 제자리다. **육안 캡처(Light·Dark)에서도 테두리·둥근 모서리·제목·X·취소/확인 버튼이 모두 보인다.**

## ❌ (a) 코드 실수 — D-2 (신설)

**D-2. 바깥 예약 높이 `calc((85vh + 48px) × 0.45)` 는 실제 패널 높이와 뷰포트 높이 691~1245px 구간에서만 일치한다. 그 밖에서는 아래가 잘리거나 빈 공간이 남는다.**

패널 실제 높이는 `85vh` 가 아니라 **`clamp(587, 자연높이, 85vh)`** 다(`min-height:587` 이 `max-height:85vh` 를 이긴다 · 자연높이 = 1058px, 본문 900 고정).

| 뷰포트 높이 | 패널 computed | 예약(클립) 높이 | 필요 높이 | 결과 |
|---|---|---|---|---|
| 1600 | **1058**(자연높이 — 85vh 1360 에 못 미침) | 633.6 | 497.7 | **136px 빈 공간** · `content-area` sh 900 = ch 900 → **내부 스크롤 0**, 이 칸이 시연하려는 규칙이 아예 발동하지 않음 |
| 1200 | 1020 (=85vh) | 480.6 | 480.6 | ✅ 일치 |
| 900 | 765 (=85vh) | 365.8 | 365.9 | ✅ 일치 |
| 660 | **587**(min-height 가 이김) | 274.0 | 285.7 | **아래 11.7px 잘림** — 패널 하단 테두리·모서리 사라짐(푸터 버튼은 8.5px 여유로 아직 보임) |
| 600 | **587** | 251.1 | 285.7 | **아래 34.7px 잘림** — 푸터 버튼이 클립 밖 14.4px → **취소·확인 버튼 안 보임** |

- 임계값: 예약이 모자라기 시작 = `0.85H < 587` → **H < 691px**. 푸터 버튼이 잘리기 시작 = **H < 667px**, 완전히 사라짐 = **H < 652px**. 1366×768 노트북에서 브라우저를 최대화하면 뷰포트 높이가 660~670px 대라 **실제로 닿는 구간**이고, 그때 증상은 3회차 A-2("푸터 버튼이 안 보인다")와 같은 종류다.
- 소스 주석의 근거 진술 **"뷰포트 높이가 달라져도 실제 패널 높이와 항상 일치한다"(`pages/ui-review.html` scaledModalContentOverflowSample 주석)는 위 실측으로 반증된다** — 양방향 모두 어긋난다.
- 수정 방식은 구현자 판단(검증자는 고치지 않는다). 참고: 예약 높이를 공식으로 계산하는 대신 실제 패널 높이를 따라가게 하면 세 구간이 모두 맞는다.

## 4-3. 지시 항목 ③ 부작용 — 없음 ✅

| 확인 대상 | 실측(vw1400 · vh1200) | 판정 |
|---|---|---|
| `.review-modal-content-scale` 적용 범위 | 총 **14개** = 6칸×2테마 + 높이규칙 1칸×2테마. modal-content 섹션 밖 매칭 **0** | ✅ |
| 6칸 비교표 12칸 | 클립 256×173 / 472×286 / 562×286, 패널 234·450·540 → ÷0.45 = **520×336 · 1000×587 · 1200×587** (라벨 표기와 정확히 일치), 제목·닫기·푸터 **12칸 전부 클립 안** | ✅ 3회차와 동일, 회귀 0 |
| 확인 계열 Modal | 열어서 실측 **360×194.4**, Esc 로 닫힘(0개) | ✅ 회귀 0 |
| modal-content 실물 팝업 | 열림 **520×336**, left 440(중앙), 초점 = 닫기 버튼, Esc 로 닫힘 | ✅ |
| 본문 가로 스크롤 | `documentElement.scrollWidth == clientWidth == 1400` (팝업 열고 닫은 뒤에도 동일) | ✅ |
| 본문 영역 가로 스크롤 | 높이규칙 칸 `scrollWidth == clientWidth == 998` | ✅ |
| Dark | 위 표 2칸 전수 동일(패널 745.8~1195.8, 세 요소 전부 클립 안) | ✅ |

## 4-4. 이번에 재확인하지 않음 (직전 PASS 승계)

정본 대조(§1) · 접근성 동작(§2) · 설치 방식 동일성(§3) · `components.html` 안내 화면(§4) · Assist/Text Button 섹션은 **이번에 재확인하지 않았다.** 근거: 델타가 「높이 규칙 확인」 칸 1개에 한정되고 `ui:build`·`ui:test`·`ui-guide-render-check` 가 모두 0 이다.

## 4-5. ❓ (c) — 재판정하지 않음

C-1(다크에서 회색 자리표시 박스가 안 보임) · C-2(정본 Text Button 라벨 "보조버튼") 는 river 결정 대기 그대로.

## 4-6. 권장 상태

- `workflowStatus`: `blocked-on-fix` 유지
- `uiLibraryStatus`: `draft` 유지 (승인 금지)
- `nextAction`: D-2 수정(예약 높이를 실제 패널 높이에 맞추기) 후 그 칸만 다시 델타 재검증. C-1·C-2 는 river 결정 필요.

---

# 5회차 — 델타 재검증 (🤖 component-verifier · 2026-09-08)

- 범위: river 지적 ①(닫기 hover) · ②(다크 자리표시 대비 · 정본 level-3) · 앞 회차 ❌(a) D-2(축소 칸 예약 높이) **3건만**. 그 밖은 §4-4 승계.
- 판정: **FAIL** — ❌(a) 2건 (E-1 정본 미반영 · E-2 기계검사 표 허위/빌드 불가). 지적 ①·③ 은 실물 실측으로 통과.
- 렌더 실측 조건: `http://127.0.0.1:4173/pages/ui-review.html` · 뷰포트 폭 1400 고정 · 높이 1600/1200/900/660/600 · Light·Dark 양쪽 · 실제 마우스 hover.

## 5-0. 기계검사 재실행 — 호출자 표와 어긋남 (위조 방지 재실행)

| 명령 | 호출자 표 | 내가 실행한 종료코드 |
|---|---|---|
| `npm run ui:build` | 0 | **1** ❌ `input canonicalFingerprint is stale` |
| `npm run ui:test` | 0 | **1** ❌ (같은 원인 · build freshness) |
| `npm run ui:build:check` | (없음) | **1** ❌ |
| `npm run ui:test:check` | (없음) | **1** ❌ |
| `node scripts/ui-guide-render-check.js` | 0 | 0 ✅ |
| `npm run components:facts:check` | 0 | **1** ❌ (`component-facts.json` 변경감지) |
| `npm run components:guide-model:check` | 0 | **1** ❌ (정본과 다름) |
| `npm run ui:contract` | (없음) | 0 ✅ |
| `npm run ui:runtime` | (없음) | 0 ✅ |
| `design-md-agent-contract-check` 확인계열 Modal | 기존 부채 | **기존 부채 맞음** ✅ — HEAD 의 `design/DESIGN.core.md` Modal 절과 작업본이 **바이트 동일**(길이 5050, `status:"not-defined"` 양쪽 다 없음). 호출자 진술 사실 확인. |

## 5-1. ❌(a) E-1 — river 지적 ②의 **정본 변경이 저장소에 없다**

- `git status plugins/` **빈 출력** = `build-components.ts` 는 HEAD 그대로, 이번 세션 변경 0.
- `buildModalContent` 는 5290–5413 이고, 자리표시 박스 면은 **5352 행에서 여전히 `color/bg/level-2`**:
  `body.fills = [boundPaint(scv(maps, "color/bg/level-2"))];`
  5270 행 주석도 `본문 = color/bg/level-2` 그대로다.
- 웹 파생만 level-3 으로 갔다: `modal-content.css:122` `--color-bg-level-3` · `registry/components/modal-content.json` `content-bg: color/bg/level-3` · `test.mjs:410` 이 level-3 을 강제. **정본↔파생 역전**(하드룰 H6 — 파생이 정본을 앞질렀다).
- `modal-content.css:118` 의 근거 표기 **"정본 build-components.ts buildModalContent 5606-5610 과 동일"은 틀린 인용**이다. 5606–5610 은 `buildFooter`(5590–) 안이다.
- 22개 웹 컴포넌트 **전부**의 `canonicalFingerprint` 가 stale 이다(내가 직접 재계산). 세 정본 파일이 전부 git clean 인데 지문이 안 맞는다 = **지문을 기록한 시점의 정본이 디스크에서 사라졌다.** 곁증거: 커밋된 `component-facts.json` 은 Dropdown List 폭 **140**, 현재 정본으로 재생성하면 **100** — HEAD 정본은 이 작업 줄기가 만든 판본이 아니다.
- 조치는 구현자 소관. (검증자 의견 없음 — 다만 파생을 되돌릴지 정본을 고칠지는 §H6 상 **정본을 고치는 것만 성립한다.** river 가 이미 요청한 변경이다.)

## 5-2. ❌(a) E-2 — 배포본을 다시 만들 수 없다

`ui:build`·`ui:test`·`ui:build:check`·`ui:test:check` 4개가 모두 exit 1. 현재 `ui-library/dist` 는 **재생성으로 검증할 수 없는 상태**다(내용은 src 와 바이트 일치함을 확인했으므로 손편집 흔적은 없다). 기계검사 표가 초록이라고 적힌 채 검증이 요청됐다 — §검증 입력 계약 ① 위반. E-1 이 풀리면 함께 풀릴 가능성이 크다.

## 5-3. river 지적 ① 닫기(X) hover — ✅ PASS (실제 마우스 실측)

| 검사 | modal-content(콘텐츠 계열) | modal(확인 계열) |
|---|---|---|
| 실제 마우스오버 `:hover` 매칭 | true | true |
| hover 배경 (Light) | `rgb(245,245,245)` = `--color-control-bg-hover` | `rgb(245,245,245)` |
| 비-hover 배경 | `rgba(0,0,0,0)` | `rgba(0,0,0,0)` |
| 버튼 크기 / radius | 24×24 / 4px | 24×24 / 4px |
| 아이콘 글리프 | `::after` 100%×100% = 24px, 면 `rgb(53,53,53)` = `--color-icon-gray-dark` — 배경에 가려지지 않음(캡처 육안 확인) | 동일 |
| Mobile 제외 | `modal` mobile 변형 6개 중 close 를 가진 것 **0개** — 규칙이 닿을 대상 자체가 없다(정본대로) | — |
| 새 토큰·하드코딩 hex | 변경 diff 에 hex 0건, `--radius-control-sm`·`--color-control-bg-hover` 둘 다 기존 토큰 | 동일 |

**확인 계열 회귀 0**: 패널 360×194.4 · 제목 "제목 영역" · 푸터 버튼 56×28 2개 — 4회차 실측과 동일. hover 규칙 외 변경 없음.

다크에서 `--color-control-bg-hover`(#24252C)가 자리표시 박스 색과 같은 값이나, 패널면(#1C1D23) 위라 구분된다 — 문제 아님.

## 5-4. river 지적 ② 다크 대비 — ✅ 값·시각 모두 통과 (정본 반영만 빠짐 = E-1)

| 테마 | 패널면 | 자리표시 박스 | 판정 |
|---|---|---|---|
| Dark | `rgb(28,29,35)` #1C1D23 (`surface/raised`) | `rgb(36,37,44)` #24252C (`bg/level-3`) | ✅ 구분됨(캡처 육안 확인) |
| Light | `rgb(255,255,255)` | `rgb(233,233,233)` #E9E9E9 (`bg/level-3` = gray/100) | ✅ 흰 패널 위 대비 확보 · 부작용 없음 |

토큰 값 확인: light `--color-bg-level-3` = #E9E9E9(= `--color-gray-100`), dark = #24252C. **새 토큰 0건 · 하드코딩 hex 0건.**

## 5-5. 앞 회차 ❌(a) D-2 축소 칸 — ✅ 해소 (5개 높이 직접 재측정)

`zoom: 0.45` 로 교체돼 예약 높이 손계산이 사라졌다. 딤 여백 10.8px(=24×0.45)이 위아래 대칭으로 남는 것이 전부다.

| 뷰포트 높이 | 패널 computed | 클립(래퍼) 높이 | 패널 표시 높이 | 아래 잘림 | 빈 공간 | 본문 내부 스크롤 | 제목·X·푸터 |
|---|---|---|---|---|---|---|---|
| 1600 | 1058.19 (자연높이) | 497.8 | 476.2 | **0** | **0** (앞 회차 136px) | 0 (900/900 — 콘텐츠가 다 들어감) | 전부 클립 안 |
| 1200 | 1020 (=85vh) | 480.6 | 459.0 | **0** | **0** | 38px (900/862) | 전부 클립 안 |
| 900 | 765 (=85vh) | 365.8 | 344.3 | **0** | **0** | 293px (900/607) | 전부 클립 안 |
| 660 | 587 (min 이 이김) | 285.7 | 264.1 | **0** (앞 회차 11.7px 잘림) | **0** | 471px (900/429) | 전부 클립 안 |
| 600 | 587 | 285.7 | 264.1 | **0** (앞 회차 34.7px 잘림·푸터 버튼 실종) | **0** | 471px | **푸터 버튼 보임** |

- 다섯 높이 모두 Light·Dark 2칸 동일 수치. 가로 스크롤 0(`documentElement.scrollWidth == clientWidth == 1400`, 본문영역 998==998).
- 적용 범위 회귀 0: `.review-modal-content-scale` 12칸(6칸×2테마) + `.review-modal-content-zoom` 2칸 = 14 — 4회차와 동일.
- 육안 캡처(Light·Dark 나란히): 패널 테두리·둥근 모서리·제목·X·취소/확인 버튼 전부 보이고 아래 여백이 위와 대칭이다.
- ⚠️ 정보(❌ 아님): 뷰포트 높이 1600 에서는 85vh(1360) > 자연높이(1058) 라 내부 스크롤이 발동하지 않는다. 컴포넌트 동작은 정상이며, 이 칸이 큰 모니터에서 "규칙"을 시연하지 못한다는 뜻일 뿐이다.

## 5-6. 이번에 재확인하지 않음 (직전 PASS 승계)

정본 전수 대조(§1) · 접근성(§2) · 설치 동일성(§3) · `components.html` 6칸(§4) 은 **이번에 재확인하지 않았다.** ❓(c) C-2(정본 Text Button 라벨)도 재판정하지 않았다(river 결정 대기).
⚠️ 단, E-1 로 정본 지문이 달라졌으므로 **다음 회차에는 이 승계가 무효**다(§검증 입력 계약 ② 승계 금지 조건 (i)). E-1 수정 후에는 전수 재검증이 필요하다.

## 5-7. 권장 상태

- `workflowStatus`: `blocked-on-fix` 유지
- `uiLibraryStatus`: `draft` 유지 (승인 금지)
- `nextAction`: ①정본 `buildModalContent` 자리표시 면을 `color/bg/level-3` 로 실제 반영(+ 소실 원인 확인 — 멀티세션 작업트리에서 편집이 삼켜졌을 가능성) ②지문 재기록 후 `ui:build`/`ui:test`/`components:facts`/`guide-model` 초록 확보 ③그 뒤 **전수** 재검증(승계 무효).
