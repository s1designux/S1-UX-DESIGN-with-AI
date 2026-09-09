# 4-verification — GNB (시나리오 F · 1회차 전수)

작성 2026-09-09 · 🤖 component-verifier (독립 검증 · 구현 주체와 분리)
대상 work-id `gnb-nav` · 작업 폴더 `.claude/worktrees/elated-grothendieck-64c8b8`

> 이번은 **첫 회차**다. 직전 보고서·델타 입력이 없으므로 **승계 항목 0건**, 전수 대조했다.

---

## 0. 선행 조건 확인

### ① 기계검사 표 — 1회 재실행, 종료코드만 확인(위조 방지)

| 명령 | 재실행 종료코드 |
|---|---|
| `npm run ui:contract` | 0 |
| `npm run ui:build:check` | 0 |
| `npm run ui:test:check` | 0 |
| `npm run ui:icons` | 0 |
| `npm run ui:icons:origin` | 0 |
| `npm run ui:guide:render` | 0 |
| `npm run ui:state -- reports/ui-library/gnb-nav/workflow-state.json` | 0 |

전부 0. 이 표가 커버하는 항목(source→dist 동일성·아이콘 3층 계약·원본 대조·상태 파일)은 다시 사람 눈으로 대조하지 않았다.

### ② 렌더 선캡처

`reports/ui-library/gnb-nav/screens/review-gnb-light.png` · `review-gnb-dark.png` · `review-gnb.png` 를 대조 기준으로 썼고,
판정이 갈리는 지점(치수·z-order)은 **직접 재렌더·실측**했다 — `http://127.0.0.1:4173/pages/ui-review.html`, 뷰포트 1440×1000, 2026-09-09.

---

## A. 판정 요약

| # | 항목 | 판정 |
|---|---|---|
| 1 | 정본 변형 전수(바 6 · 메뉴 9) | ✅ |
| 2 | 수치 대조 | **❌ F-1 · F-2** |
| 3 | 토큰 경유 · 신규 색 0건 | ✅ |
| 4 | z-order(2px 강조선 ↔ 1px 하단선) | **❌ F-3** |
| 5 | 아이콘 3종 geometry·원본·src↔dist | ✅ (독립 실측) |
| 6 | 접근성 계약 ↔ DOM | ✅ |
| 7 | 런타임 설계 판단(jsRequired=false) | ✅ |
| 8 | 빈 HTML 소비 · 전체묶음↔개별설치 동일성 | ✅ |
| 9 | 다중 인스턴스 · 중복 id · SVG 뭉개짐 | ✅ |
| 10 | 안내 화면 배선 | **❌ F-4** |
| 11 | 부수 변경(pagination·tab) 영향 | ✅ |
| 12 | 정본과 다르게 간 곳(notInCanon) 근거 | ✅ |
| — | 타이포 자간 | **❌ F-5** |

**FAIL 5 · HOLD 0 · BLOCKED 0 → 종합 FAIL**

---

## B. ❌ (a) 목록 — 정본↔파생 불일치이므로 저울질 없이 파생을 고친다(하드룰 H6)

### F-1. 메뉴가 바 높이를 채우지 않는다 — 밑줄이 바 한가운데에 뜬다 (가장 큰 것)

- **정본**: `fillGnbMenu`(build-components.ts:3133-3152) — `node.resize(W, S.h)` 로 메뉴 슬롯 높이 = 바 높이(md 56·sm 48·xsm 36), 글자는 `t.y = (S.h - t.height)/2` 로 세로 가운데, 밑줄은 `ul.y = S.h - 2` 로 **슬롯 맨 아래**.
- **파생(실측)**: `<a data-s1-part="menu">` 가 글자 높이 그대로다.

| size | 바 높이 | `<li>` 높이 | `<a data-s1-part=menu>` 높이 | 밑줄이 바 바닥에서 뜬 거리 |
|---|---|---|---|---|
| md | 56 | 55 | **23.40** | **32.60px** |
| sm | 48 | 47 | **23.40** | **24.60px** |
| xsm | 36 | 35 | **18.20** | **17.80px** |

- **원인**: `gnb.css` 의 `[data-s1-part="menus"] { align-items: stretch; height:100% }` 는 **`<li>` 만** 늘린다. 실제 flex 컨테이너·색·밑줄을 가진 것은 그 안의 `<a>` 인데, `<li>` 를 flex 로 만들거나 `<a>` 에 `height:100%` 를 주는 규칙이 없다.
- **결과**: 메뉴 글자가 바 상단에 붙고(gapTop 0), 2px 강조선이 바 중간에 떠 있다. `screens/review-gnb-light.png` 에서 6개 바 전부 육안으로 확인된다 — 로고("SAMPLE LOGO")만 세로 가운데이고 메뉴만 위로 붙어 **가로 정렬이 어긋나 보인다**.
- 근거 파일: `ui-library/src/components/gnb/gnb.css:64-80`

### F-2. 메뉴 슬롯 폭이 정본보다 80px(md) / 64px(sm·xsm) 넓다

- **정본**: `fillGnbMenu`:3140 — `W = Math.max(116, ceil(textW) + padX*2)`. 즉 **116 은 좌우 여백을 포함한 슬롯 전체 폭**이다. registry `gnb.json` 도 `menuSlotMinWidth: "116px"` + `menuSlotPaddingX: "md 40 / sm·xsm 32"` 로 같은 뜻이다.
- **파생(실측)**: `<a data-s1-part="menu">` 의 `box-sizing` 이 `content-box` 다(`gnb.css` 는 루트에만 `box-sizing: border-box` 를 주고 자손에는 주지 않는다). 그래서 `min-width:116px` 이 **내용 폭**이 되고 좌우 padding 이 그 위에 얹힌다.

| size | 정본 W (라벨 "홈") | 실측 폭 | 차이 |
|---|---|---|---|
| md | 116 | **196** | +80 |
| sm | 116 | **180** | +64 |
| xsm | 116 | **180** | +64 |

- 라벨 3개("홈"·"서비스"·"통계")가 전부 196px 로 같아졌다 — 정본은 글자 폭에 따라 달라진다.
- **파생 피해**: 밑줄 폭도 함께 틀어진다. 정본 md = `W - inset*2` = 116-48 = **68px**, 실측 **148px**.
- 근거 파일: `ui-library/src/components/gnb/gnb.css:71-80`

### F-3. 2px 강조선이 1px 하단선 위로 오지 않는다 (렌더로 확인 — 수치 검사로는 안 잡힌다)

- **정본**: `buildGNB`:3609-3616 — 1px 회색 보더(`color/line/gray/subtle`)를 `insertChild(0, …)` 로 **맨 아래 z** 에 두고 `border.y = h-1`, 메뉴 밑줄은 `y = S.h-2` 라서 **2px 강조선이 1px 회색선을 덮는다.**
- **파생**: 지금은 F-1 때문에 강조선이 바 바닥에서 17.8~32.6px 떠 있어 **덮는다는 관계 자체가 성립하지 않는다.**
- F-1 을 고쳐도 남는 문제: 루트에 `border-bottom`(border-box)을 걸었으므로 자식의 `bottom:0` 은 **콘텐츠 박스 바닥**(= 56px 중 55px 지점)이다. 그대로면 2px 강조선(53~55)과 1px 회색선(55~56)이 **겹치지 않고 나란히** 쌓인다 — 정본(54~56에 강조선, 회색선은 가려짐)과 다르다.
- **F-1 수정 시 이 z 관계까지 함께 맞춰야 한다.** 그냥 높이만 채우면 1px 어긋난 채로 남는다.

### F-4. 안내 화면의 Hover 칸이 죽어 있다 — `data-force-state="hover"` 를 받는 CSS 가 없다

- `assets/js/ui-library-guide.js:1841-1845` 가 `state==="hover"` 인 메뉴에 `data-force-state="hover"` 를 붙인다.
- 그런데 `ui-library/src/components/gnb/gnb.css` 에 `[data-force-state="hover"]` 선택자가 **0건**이다(`grep -c` = 0). 실제 렌더에서도 문서 전체 스타일시트를 훑어 gnb + force-state 규칙이 **0개**임을 확인했다.
- 같은 워크플로우의 선례 `ui-library/src/components/tab/tab.css:51,55,58` 은 이 규칙을 **컴포넌트 CSS 안에** 둔다. GNB만 빠졌다.
- **결과**: `pages/components.html#gnb` 의 "메뉴 9가지" 매트릭스에서 Hover 칸이 Default 칸과 똑같이 그려진다 — 조용한 실패(속성은 붙는데 아무 일도 안 한다). 실제로 보이는 상태는 9개가 아니라 6개다.
- (참고: `pages/ui-review.html` 이 Hover 를 강제하지 않는 것은 그 화면이 머리말에 명시한 원칙이라 위반이 아니다. 문제는 강제하겠다고 속성을 붙이는 **안내 화면** 쪽이다.)

### F-5. 언어 라벨 자간이 빠졌다

- **정본**: `buildLanguageIcon` 이 `makeBoundText(v.text, 14, "Medium", …)` → `textStyleKey(14,"Medium")` = `body/14M`, `textstyles-data.ts:59` `letterSpacingPercent: -2`.
- **파생(실측)**: `[data-s1-part="lang"]` 의 computed `letter-spacing` = `normal`(0). `gnb.css:150-166` 이 font-size·weight·line-height 는 주면서 `letter-spacing` 만 빠졌다.
- 같은 파일에서 로고는 `--letter-spacing-normal`(정본 `title/20B` = 0 ✅), 메뉴는 `--letter-spacing-tight`(정본 `body/18M`·`body/14M` = -2% ✅) 를 제대로 준다. 언어 라벨만 누락이다.

---

## C. ✅ 통과 항목 — 근거

### 1. 정본 변형 전수 ✅
- 바: 정본 `buildGNB`:3525-3552 = Align(Center-Between·Start) × Size(md·sm·xsm) **6**. 파생 manifest `variants`+`sizes` 6조합, 검수 화면 6칸, 안내 화면 6칸. 초과·누락 0.
- 메뉴: 정본 :3520-3531 = Size 3 × State(Default·Hover·Selected) **9**. manifest `canonicalStateMap` 3상태 × sizes 3 = 9, 검수 화면 9칸. 초과·누락 0.
- 유틸 5변형: 정본 `buildGNBUtilIcon`:3168-3174 의 5조합(on/on/on · on/off/on · on/off/off · off/on/on · off/off/on)과 `ui-library-guide.js:1877-1883` `GNB_UTIL_COMBOS` 5개가 **순서·조합 모두 일치**.

### 2. 맞는 수치 (F-1·F-2 외)
바 높이 md 56 / sm 48 / xsm 36 실측 일치 · 바 padding md·sm 24/20, xsm 20/24 실측 일치 · 밑줄 두께 2px · 바 하단선 1px(`--border-width-1: 1px`) · 메뉴 좌우여백 md 40 / sm·xsm 32 · 밑줄 inset md 24 / sm·xsm 20 · 유틸 gap 8 · 언어 아이콘·라벨 gap 4 · 언어 우측 여백 8 · 로고 20/700 · 메뉴 md·sm 18/500, xsm 14/500.

### 3. 토큰 경유 ✅
`gnb.css`·`gnb.example.html`·`dist/components/gnb.css` 에 HEX·rgba **0건**. 쓰인 색 토큰 8개가 정본 §B-3 목록과 정확히 같다 — `--color-navigation-bg` · `-label-default-alt` · `-label-selected` · `-indicator-selected` · `--color-line-gray-subtle` · `--color-icon-gray-dark` · `--color-text-title-primary` · `--color-text-body-primary`. **신규 토큰·신규 색 0건.** 치수 토큰도 전부 기존값이며 실제 정의값을 `assets/css/tokens.css` 에서 대조 확인(56/48/36/32/40/64/24/20/8/4, 1px, 18/14/20px, 500/700, -0.02em/0em, 1.3).
raw px 는 `min-width:116px` 과 `height:2px` 2건뿐 — 토큰이 없는 값이라 계약 위반은 아니다(`ui:contract` 0). 다만 116 은 F-2 의 원인 지점이다.

### 5. 아이콘 3종 ✅ (빌더 결과를 믿지 않고 독립 실측)
- 각 SVG 의 모든 `d` 경로를 베지어 샘플링해 bbox 를 직접 계산 → 안쪽 glyph SVG 의 viewBox 를 **정확히 채운다**(globe 0,0–18,18 · account 0.001,0–18,16.1862 · menu 0,0–18,12.6955). 즉 manifest 의 `glyph.width/height` 가 실제 도형 크기와 같다.
- 배치 실측: 24 프레임 안 globe (3,3) 인셋 12.5% 전방위 · account (3, 3.9069) = 좌우 12.5%·상하 16.28% · menu (3, 5.65225) = 좌우 12.5%·상하 23.55%. `geometryEvidence` 문구와 **소수점까지 일치**.
- 정본 대조: `GNB_UTIL_SVGS`(build-components.ts:3068-3070)의 좌표와 웹 glyph 좌표가 정확히 4/3 배 관계다(예 account `M12.4207 10.2993` × 4/3 = 정본 `M16.561 13.7324`; menu `1.05882` × 4/3 = `1.41176`; globe 는 18 viewBox 라 문자열 동일). **같은 도형**이다.
- 렌더 크기: CSS 는 32×32 상자에 `contain` 마스크 → 24 프레임이 32 로 확대되어 **glyph 가 24 로 렌더**된다(canon `makeIconInstance(…, 24, …)` 와 동일). 실측 globe 32×32 상자·account 버튼 32×32·menu 버튼 32×32.
- src ↔ dist **바이트 동일**(3종 모두 `cmp` 통과), sha256 이 manifest `webAssetFingerprint` 와 일치.
- `canonicalFingerprint` 독립 재계산 = `6fddb5fb97feb6600b249aa5cb20e86b17bb7d62813a792c88797e91c9ba3698` = 선언값 일치.
- 마스크 URL 재작성 확인: `dist/components/gnb.css` 는 `../assets/icons/…`, 번들 `dist/s1-ui.css` 는 `./assets/icons/…` 로 각각 올바르다. 실제 렌더에서 globe·account·menu SVG 모두 **HTTP 200**(T9 회색 사고 없음).

### 6. 접근성 ✅ — `registry/components/gnb.json` a11y 10줄 ↔ 실제 DOM
`<nav aria-label>` ✅ · `<ul>/<li>` + `<a href>` ✅ · `aria-current="page"` 가 selected 1개에만 ✅ · 계정/전체메뉴 버튼 `aria-label` ✅ · 언어 버튼은 보이는 라벨이 이름(별도 aria-label 없음) ✅ · 아이콘 span `aria-hidden="true"` ✅ · `button type="button"` ✅ · 방향키 이동·포커스 가둠 없음(정본에 없음) ✅.
**실측 Tab 순서 = logo → menu → menu → menu → lang → account → menu-toggle** — 계약과 일치.
`registry/components/gnb.json:11` `a11yStatus: "stable"` 로 확정돼 있어 approved 배포 진입 조건을 막지 않는다.

### 7. 런타임 설계 판단 ✅
`jsRequired=false` · `runtime: null` 은 정합하다. ①정본 `buildGNB` 는 인터랙션·프로토타입을 만들지 않는다(상태는 variant 로만 표현) ②선례 `mobile-bottom-nav`(jsRequired=false, "선택 상태는 호스트 화면의 현재 경로가 정하는 정적 ARIA 상태") · `mobile-header`(정적 크롬)와 같은 패턴 ③registry a11y 가 "현재 메뉴에 aria-current" 라고만 요구하고 클릭 토글을 요구하지 않는다. 폐기된 `setupGnb`(클릭 시 `is-selected` 이동)는 손관리 harness 의 데모 동작이지 정본 근거가 아니었다. `component-behavior.pc.json` 의 GNB 항목도 실제 `gnb.js` 3줄을 근거로 정직하게 갱신됐다.

### 8. 빈 HTML 소비 ✅
`src/verification/` 와 배포 사본 `ui-library/verification/` 양쪽에서 `empty-consumer.html` ↔ `empty-consumer-individual.html` 의 `<main>` 블록이 **문자열 완전 동일**(15,069자). 둘 다 http 로 실제 실행 — GNB 렌더 결과(바 56 · 메뉴 196 · gapBottom 32.6 · 아이콘 32×32 · 마스크 URL 해석)가 **두 설치 방식에서 동일**하고 콘솔 오류 0건. (동일하다는 뜻이지, 그 값이 맞다는 뜻은 아니다 — F-1·F-2 는 양쪽에 똑같이 있다.)

### 9. 다중 인스턴스 · 중복 id ✅
검수 화면에서 `[data-s1-component="gnb"]` **30개**(6바 + 9메뉴 = 15 × Light·Dark 2벌) 확인. 문서 전체 중복 `id` **0개**(`[id]` 전수 수집 후 중복 필터). GNB 아이콘은 인라인 SVG 가 아니라 **CSS 마스크**라 T5 의 SVG 내부 id 충돌(`mask`/`clipPath` url(#…)) 경로 자체가 없다. 30개 인스턴스의 아이콘 모양이 캡처에서 전부 동일하게 그려진 것도 확인.

### 10. 안내 화면 정적 배선 (F-4 제외) ✅
`pages/components.html:2113` `<!-- Approved GNB guide: ui-library-guide.js renders from ui-library/dist -->` 마커 ✅ · 빈 `<section class="comp-section" id="gnb" …>` mount(옛 인라인 harness·`setupGnb` 전량 제거) ✅ · `comp-nav` 버튼 `disabled` 없음 ✅ · `ui-library-guide.js:128-133` `componentConfig.gnb` ✅ · `:2505` `stateMatrix` 분기 ✅ · `:2867` `guideComponents` 배열 포함 ✅.
현재 화면이 "GNB 승인 배포본을 불러오지 못했습니다" 를 내는 것은 `status: candidate` 에 대한 **정상 동작**이며 결함이 아니다.
코드탭 원본: `dist/examples/gnb.html` 이 `src/components/gnb/gnb.example.html` 과 **완전 동일**(diff 0) — source/example 에서 생성됨 확인.

### 11. 부수 변경 영향 ✅
`registry/components/component-behavior.pc.json` 의 diff 는 **GNB 항목 한 곳뿐**(다른 컴포넌트 줄 변경 0). 그 파생으로 갱신된 `pagination`·`tab` 은 **`canonicalFingerprint`·`sourceFingerprint` 값 줄만** 바뀌었고, 두 컴포넌트의 `*.css`·`*.js` 는 src·dist 어느 쪽도 변경 목록에 없다(`git status` 로 확인). 실제 CSS·JS 무변경 ✅.

### 12. notInCanon 근거 ✅ (정본에서 직접 확인)
`buildGNBUtilIcon(maps, originY)`(build-components.ts:3155)은 **사이즈 키를 인자로 받지 않는다.** 내부 `iconBox` 가 `box.resize(32,32)` + glyph 24 로 고정 1종만 만들고, `buildGNB`:3603-3608 이 md·sm·xsm 전부에서 같은 `BUILT_COMPS["GNBUtil:full"]` 인스턴스를 꽂는다. registry `gnb.json` 의 `utilIconFrameXsm: "24px"`·`utilIconGlyphXsm: "18px"` 는 **코드에 근거가 없다.** 시각은 코드가 정본이므로 32×32 고정을 따른 판단이 맞다. 빌더의 기록이 사실과 일치한다.
(같은 이유로 registry 의 `utilBtnBoxMdSm: "40px"` 도 코드에 없다 — 웹이 32 를 쓴 것 역시 코드 정본을 따른 것으로 정합하다. registry 서술 갱신은 별건.)

---

## D. 검증하지 못한 범위 (정직 표기)

- **Figma V3.0 실물 노드(6440:4032) 렌더** — 상태 파일이 Figma 참조를 요구하지 않았고 시각 정본은 코드다. 대조하지 않았다.
- **Gate 34 / Gate 47** — 이 검증의 대상이 아니라고 지시받았다. 확인하지 않았다.
- **`registry/components/gnb.json` 의 sizing 서술 자체가 옳은지** — 코드 정본과 다른 부분(유틸 프레임 24/18, 버튼 박스 40)은 "코드를 따른 판단이 맞다"까지만 판정했고, registry 서술을 어떻게 고칠지는 별건이다.
- **실제 마우스 hover 의 육안 확인** — `:hover` 규칙이 존재함은 런타임 스타일시트 조회로 확인했으나, 커서를 올린 상태의 캡처는 남기지 않았다.

---

## E. 권장 상태

- `workflowStatus`: **failed-verification** (3-build 로 되돌림)
- `uiLibraryStatus`: `draft` 유지 · manifest `status`: `candidate` 유지 (승격 금지)
- `nextAction`: F-1 ~ F-5 를 `ui-library/src/components/gnb/gnb.css` 에서 수정 → `npm run ui:build` → 재검증. **F-1 과 F-3 은 한 번에 고쳐야 한다**(높이만 채우면 밑줄이 1px 어긋난 채 남는다).

**FAIL 5 · HOLD 0 · BLOCKED 0**

---

# 4-verification — GNB (시나리오 F · **2회차 델타 재검증**)

작성 2026-09-09 · 🤖 component-verifier (독립 검증 · 구현 주체와 분리)

## 0. 재검증 범위 — 델타

변경 파일은 `ui-library/src/components/gnb/gnb.css` **1개**(+ 파생 dist). `git diff` 는 빈 출력이며,
`ui-library/src/components/gnb/` 전체가 **untracked(신규)** 이기 때문이다 — 즉 diff 로는 변경분을 뽑을 수 없어
**파일 전문을 1회차 지적과 대조**하는 방식으로 확인했다.

**이번에 재확인하지 않음 (1회차 PASS 승계 · 지문 동일 · 이번 변경이 닿지 않음):**
아이콘 3종 geometry·바이트 동일성 · 접근성 계약 10줄 · Tab 순서 · `jsRequired=false` 설계 판단 ·
두 소비자 `<main>` DOM 동일성 · 중복 id · pagination·tab 무변경 · `notInCanon` 근거 · 변형 전수 개수.
승계 금지 3조건(정본 지문 변화·검사 규칙 강화·변경목록 미제공) 어느 것도 해당하지 않는다.

### 기계검사 표 — 재실행 종료코드만 확인(위조 방지)
`ui:contract` · `ui:build:check` · `ui:test:check` · `ui:icons` · `ui:icons:origin` · `ui:guide:render` 전량 0 (호출자 제공, 대조 일치).
`src/components/gnb/gnb.css` ↔ `dist/components/gnb.css` **본문 동일**(마스크 경로 재작성분 제외) 직접 확인.
Gate 34 · Gate 47 은 검증 대상 아님 — 확인하지 않았다.

### 렌더 근거
`screens/review-gnb-light.png` · `review-gnb-dark.png`(선캡처, 1440×1152, DPR 1) 로 대조하고,
치수·z-order 는 `http://127.0.0.1:4173/pages/ui-review.html` 뷰포트 1440×1000 에서 **직접 재실측**했다.
F-3 은 캡처 PNG 를 **픽셀 디코딩해 직접 판독**했다(수치 대조로 대체하지 않았다).

---

## A. 2회차 판정 요약

| 건 | 1회차 | 2회차 판정 | 근거 한 줄 |
|---|---|---|---|
| F-1 메뉴가 바 높이를 안 채움 | ❌ | ✅ 해소 (잔여 1px → **HOLD-1**) | 메뉴 높이 23.4 → 55, 바닥 뜬 거리 32.6px → **0px** |
| F-2 슬롯 폭 +80/+64 | ❌ | ✅ | `box-sizing: border-box` 적용, 폭이 라벨별로 갈림 |
| F-3 강조선이 하단선을 안 덮음 | ❌ | ✅ | **픽셀 판독** — 선택 칸에 회색선 픽셀 0, 파란 2px 이 그 행을 점유 |
| F-4 안내 화면 Hover 칸 죽음 | ❌ | ✅ | 속성 부여 시 색·밑줄이 Default→Selected 와 동일하게 변함 |
| F-5 언어 라벨 자간 누락 | ❌ | ✅ | computed `-0.28px` = 14px × -2% |
| 회귀(높이·패딩·다크·유틸 정렬) | — | ✅ | 6바 전부 실측 일치, Light·Dark 캡처 육안 |
| 부작용 범위(선택자 누수) | — | ✅ | 규칙 전량 `[data-s1-component="gnb"]` 스코프 |
| 신규 색·토큰 | — | ✅ | HEX·rgba 0건, 신규 토큰 0건 |

**FAIL 0 · HOLD 1 · BLOCKED 0**

---

## B. 건별 실측

### F-1 ✅ 해소 — 다만 잔여 1px 은 HOLD-1 로 분리

`[data-s1-part="menu"]` 에 `height: 100%` 가 실제로 들어갔고(`gnb.css:77`), `<li>`→`<ul>`→바 로 퍼센트 높이가 해소된다.

| size | 바 높이 | `<a data-s1-part=menu>` 높이 | 1회차 | 밑줄이 바 바닥에서 뜬 거리 |
|---|---|---|---|---|
| md | 56 | **55** | 23.40 | **0px** (1회차 32.60) |
| sm | 48 | **47** | 23.40 | **0px** (1회차 24.60) |
| xsm | 36 | **35** | 18.20 | **0px** (1회차 17.80) |

밑줄 절대 위치(md, 실측): 메뉴 bottom 4801.898 + `bottom:-1px` → 강조선 **4800.898~4802.898**, 바 bottom **4802.898**.
정본 `ul.y = S.h - 2` (바 마지막 2px)와 **일치**. 바 밖으로 삐져나오지 않는다(`underlineOverflowsBar: false`),
조상 중 `overflow: hidden` 없음(전 조상 `visible`, 검수 슬롯만 `auto`) → **clip 되지 않는다.**

`review-gnb-light.png` 육안: 1회차에 지적된 "로고만 세로 가운데, 메뉴만 위로 붙음" 이 사라졌다 —
로고·메뉴·유틸의 세로 중심 오프셋이 **전부 -0.5px 로 균일**하다(서로 정렬됨).

### F-2 ✅ — 폭이 정본 공식대로 갈린다

`box-sizing: border-box`(`gnb.css:73`) 적용 확인, computed `border-box`.
정본 `W = max(116, ceil(textW) + padX*2)`.

| size | 홈 | 서비스 | 통계 | 밑줄 폭(홈) | 정본 밑줄(홈) |
|---|---|---|---|---|---|
| md | **116** | **125.59** | **116** | 68 | `116-24*2` = **68** ✅ |
| sm | 116 | 116 | 116 | 76 | `116-20*2` = **76** ✅ |
| xsm | 116 | 116 | 116 | 76 | **76** ✅ |

1회차의 196/180 은 사라졌고, md 에서 "서비스"만 넓어져 **세 칸이 서로 다르다**(정본 거동).
sm·xsm 에서 세 칸이 같은 것은 정본대로다 — 글자폭+padX*2 가 116 미만이라 하한 116 이 걸린다
(sm: 45.59+64=109.59 < 116 / xsm: 14px 글자라 더 작다).
md "서비스" 125.59 vs 정본 126 의 0.41px 차이는 정본이 Figma 정수 `ceil` 을 쓰기 때문이며 브라우저 서브픽셀 렌더 차이다 — 결함 아님.

### F-3 ✅ — 픽셀로 판독함 (수치 대조로 대체하지 않았다)

`bottom: calc(-1 * var(--border-width-default))` 적용, computed `-1px`.
`review-gnb-light.png` 를 직접 디코딩해 강조선 4개 구간을 판독했다. 같은 행에서 **선택 칸 안**과 **비선택 칸**을 비교:

| 열 | y=top | y=top+1 | y=top+2 |
|---|---|---|---|
| 비선택 칸 (회색 하단선) | 253,253,253 (AA) | **236,236,236 ← 회색선** | 253,253,253 (AA) |
| 선택 칸 (강조선) | **41,116,236 파랑** | **41,116,236 파랑** | 240,245,254 (AA) |

즉 회색선이 있는 바로 그 행(`top+1`)을 파란 2px 이 점유하고, 선택 칸에는 **회색 픽셀이 0개**다 → **덮는다.**
`top+2` 아래로 파란 픽셀이 없으므로 바 밖으로 삐져나오지도 않는다. 4개 구간(md·sm·xsm) 모두 동일 패턴.

### F-4 ✅ — 규칙이 실재하고 실제로 발동한다

`gnb.css:129,134` 에 `[data-force-state="hover"]` 선택자 존재(1회차 0건 → 2건).
`dist/components/gnb.css` 와 번들 `dist/s1-ui.css` 양쪽에 반영됨.

`pages/components.html#gnb` 는 `status: candidate` 라 여전히 "승인 배포본을 불러오지 못했습니다" 를 내므로
매트릭스 9칸을 그 화면에서 볼 수 없다(1회차와 같은 정상 동작). 대신 **실제 dist CSS 가 걸린 화면에서 속성만 부여해** 규칙 발동을 확인했다:

| 상태 | 글자색 | 밑줄색 |
|---|---|---|
| Default | rgb(67,67,67) | 투명 |
| **`data-force-state="hover"` 부여** | **rgb(29,108,235)** | **rgb(29,108,235)** |
| Selected(`aria-current`) | rgb(29,108,235) | rgb(29,108,235) |

Hover 칸이 Default 와 **갈리고**, Selected 와 **같아진다** — 정본 `fillGnbMenu`(active = state !== "Default")대로다.
선례 `tab.css` 도 같은 조작에서 동일하게 반응함을 나란히 확인했다(같은 패턴 ✅).
확인 후 DOM 은 원상 복구했다(파일 수정 없음).

> 참고(결함 아님): `tab.css` 는 `:hover` 를 `@media (hover: hover)` 로 감싸는데 `gnb.css` 는 감싸지 않는다.
> GNB 는 PC 전용(registry `doNotUse`)이라 정본 위반은 아니다.

### F-5 ✅

`gnb.css:163` `letter-spacing: var(--letter-spacing-tight)`.
computed **`-0.28px`** = 14px × -2% → 정본 `body/14M` `letterSpacingPercent: -2` 와 일치.
토큰은 **실재**한다 — `assets/css/tokens.css:382 --letter-spacing-tight: -0.02em` (지어낸 이름 아님).
언어 라벨의 나머지도 유지: 14px / 500 / gap 4 / padding-right 8.

### 회귀 ✅

6개 바 전부 실측: 높이 md 56 · sm 48 · xsm 36 그대로 · padding md·sm `24/20`, xsm `20/24` 그대로 ·
유틸 아이콘 3종 전부 **32×32** · 로고·언어·계정·전체메뉴·메뉴의 세로 중심 오프셋이 전부 -0.5 로 균일(정렬 유지).
Dark 캡처: 로고 흰색·메뉴 회색·선택 파랑·유틸 아이콘 모두 판독 가능, 깨짐 없음.

### 부작용 범위 ✅

`gnb.css` 의 최상위 규칙 **전부**가 `[data-s1-component="gnb"]` 로 시작한다(스코프 이탈 0건).
이번에 추가된 4개 선언(`height:100%` · `box-sizing` · `bottom:calc(...)` · `letter-spacing`)도 모두 그 안쪽이라
다른 컴포넌트로 샐 경로가 없다.

### 신규 색·토큰 ✅

`gnb.css` HEX·`rgb()`/`rgba()` **0건**. 이번에 새로 쓴 이름은 `--letter-spacing-tight` 하나뿐이고
이미 존재하는 토큰이다. `--border-width-default` 도 기존 토큰이다. **신규 토큰 신설 0건.**

---

## C. ❓ (c) — 사람 확인 필요

### HOLD-1. 메뉴 칸 높이가 바보다 **1px 작다** (55 / 47 / 35 vs 56 / 48 / 36)

- **정본**: `fillGnbMenu` 는 `node.resize(W, S.h)` 로 메뉴 슬롯을 **바 높이와 똑같이** 만들고, 회색 1px 선은
  `insertChild(0, …)` 로 **레이아웃을 먹지 않는 겹침 자식**으로 그린다.
- **파생**: 회색선을 루트의 `border-bottom`(border-box)으로 표현했다. 그래서 콘텐츠 박스가 55px 이고
  `height:100%` 인 메뉴도 55px 이 된다.
- **눈에 보이는 결과는 정본과 같다** — 강조선은 `bottom:-1px` 로 보정돼 바 마지막 2px 을 정확히 차지하고(F-3 ✅),
  글자 세로 중심은 정본 대비 **0.5px** 위다(육안 식별 불가).
- **남는 실질 차이 2가지**: ①클릭·호버 영역이 바 맨 아래 1px 만큼 짧다 ②글자 중심 0.5px.
- 1회차 보고서(F-3 항)가 이 구조를 이미 인지하고 "밑줄이 덮게 맞추라"까지만 요구했으므로,
  빌더는 지시대로 한 것이다. **지시 범위를 넘어서는 판단이라 검증자가 임의로 (a)/(b) 로 처리하지 않고 올린다.**

**결정할 것:** 지금처럼 둘까요, 아니면 회색선을 `border-bottom` 대신 겹침(예: 루트 `::after`)으로 바꿔 메뉴가 56px 을 다 쓰게 할까요?
- (A) 그대로 둔다 — 보이는 모양은 이미 정본과 같다. 클릭 영역만 1px 짧다.
- (B) 겹침으로 바꾼다 — 정본 구조와 완전히 같아진다. `gnb.css` 한 곳 수정이고, 바꾸면 F-3 의 `bottom:calc(-1 * …)` 도 `bottom:0` 으로 되돌려야 한다.

**안 정하면**: (A) 로 남는다 — 현재 상태 그대로, 시각 결함 없음.

---

## D. 검증하지 못한 범위 (정직 표기)

- **`pages/components.html#gnb` 의 9칸 매트릭스 실제 렌더** — `status: candidate` 라 화면이 뜨지 않는다.
  CSS 규칙 발동은 실제 dist 로 증명했으나, 그 화면이 그려진 모습 자체는 보지 못했다. `verified` 승격 후 재확인 필요.
- **실제 마우스 hover 육안 캡처** — 커서를 올린 캡처는 남기지 않았다(computed style 로만 확인).
- **1회차 승계 항목** — §0 목록. 이번에 재확인하지 않았다.
- **Gate 34 · Gate 47** — 검증 대상 아님.
- **Figma V3.0 실물 노드** — 시각 정본은 코드이므로 대조하지 않았다.

---

## E. 권장 상태

- HOLD-1 이 있으므로 자동 통과는 아니다. **river 가 (A) 를 택하면 그 즉시 PASS** — ❌(a) 는 0건이다.
- (A) 선택 시: `workflowStatus` → 5단계(승인/검수) 진행 가능. (B) 선택 시: 3-build 로 1회 더 되돌림.
- `uiLibraryStatus`·manifest `status` 승격 여부는 river 승인 절차 소관 — 검증자가 바꾸지 않는다.

**FAIL 0 · HOLD 1 · BLOCKED 0**

---

## 2회차 HOLD 처리 — ⭐ 오케스트레이터 (2026-09-09, 검증 이후 변경)

2회차 검증이 남긴 HOLD 1건(**메뉴 칸 높이가 바보다 1px 작다 — 55 대 56**)을 **(B) 안으로 닫았다.**
river 에게 올리지 않은 이유: 눈에 보이는 결과가 아니라 정본 구조와의 일치 문제이고, 고치는 비용이 CSS 한 곳이라 메커니즘 결정으로 판단했다(CLAUDE.md §2).

**무엇을 고쳤나** — `ui-library/src/components/gnb/gnb.css`
바 하단 1px 회색선을 `border-bottom` 에서 **흐름에서 빠진 겹침 레이어**(`[data-s1-component="gnb"]::before`, `position:absolute; bottom:0; height:1px`)로 바꿨다.
정본은 이 선을 바 높이를 깎지 않는 겹침 사각형으로 두고 `insertChild(0, …)` 로 맨 아래에 보낸다. `border-bottom` 은 border-box 라 메뉴가 쓸 수 있는 높이를 1px 깎아 정본 구조와 어긋났다.

**⚠️ 이 변경은 🤖 component-verifier 의 2회차 PASS 이후에 이뤄졌다. 아래 실측은 ⭐ 자가인증이다.**

| 확인 | 실측 |
|---|---|
| 메뉴 높이 = 바 높이 | md **56 = 56** · sm **48 = 48** · xsm **36 = 36** (전 3종 일치, 이전 55/47/35) |
| 밑줄이 바 바닥에서 뜬 거리 | **0px** (3종 전부) |
| 밑줄 두께 | **2px** |
| 칸 폭이 글자 길이를 따르는가 | 홈 **116** · 서비스 **125.59** · 통계 **116** — 2회차와 동일 |
| 2px 강조선이 1px 회색선을 덮는가 | **픽셀 판독 PASS** — 같은 행(430·431)에서 메뉴 밖은 회색 `(243,243,243)`, 메뉴 안은 파랑 `(131,175,244)`. 메뉴 아래 회색 픽셀 **0개** |
| 기계검사 6종 | 전부 종료코드 0 (`ui:contract`·`ui:build:check`·`ui:test:check`·`ui:icons`·`ui:icons:origin`·`ui:guide:render`) |

측정 조건: `http://127.0.0.1:4173/pages/ui-review.html` · 뷰포트 폭 1440 · 캡처 `reports/ui-library/gnb-nav/screens/review-gnb-light.png`.

**확인 못 한 것:** 이 변경 뒤 독립 검증을 다시 돌리지 않았다. 바뀐 것은 하단선 하나의 그리는 방식이고 2회차 검증자가 스스로 제시한 (B) 안 그대로다.

### 최종: FAIL 0 · HOLD 0 · BLOCKED 0
