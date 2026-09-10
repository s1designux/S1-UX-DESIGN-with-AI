# 4-verification — GNB Sub Menu · GNB Sub Menu Item (시나리오 F, 1회차 전수)

검증자: 🤖 component-verifier · 2026-09-09 · 델타 아님(전수)
정본: `plugins/figma-vars-installer/src/build-components.ts` `buildGNBSubMenuItem`(3697) · `buildGNBSubMenu`(3737) · 기준 원본 주석(3655~3693)

## 0. 기계검사 재실행 (종료코드만 확인 · 위조 방지)

| 명령 | 종료코드 |
|---|---|
| `ui:contract` · `ui:build:check` · `ui:test:check` · `ui:icons` · `ui:icons:origin` · `ui:guide:render` · `ui:state` | 전부 **0** |

선행 조건 충족 → 검증 진행. Gate 34·`design:md:check` 1건은 호출자 선언대로 대상 밖.

## 1. 변형 전수 — ✅

Item 6조합 전수 실측(브라우저 computed style, `http://127.0.0.1:4173/pages/ui-review.html`):

| Depth | State | color | font-weight | letter-spacing | 정본 |
|---|---|---|---|---|---|
| 1depth | Default | `rgb(53,53,53)` #353535 = gray/800 | 700 | normal(0) | `submenu/label/default` · title/16B ✅ |
| 1depth | Hover | `rgb(29,108,235)` blue/400 | 700 | normal | `label/selected` ✅ |
| 1depth | Selected | `rgb(29,108,235)` | 700 | normal | ✅ |
| 2depth | Default | `rgb(85,85,85)` #555555 = gray/600 | 500 | -0.32px(-0.02em) | `label/default` · title/16M ✅ |
| 2depth | Hover | `rgb(29,108,235)` | 500 | -0.32px | ✅ |
| 2depth | Selected | `rgb(29,108,235)` | 500 | -0.32px | ✅ |

패널 Depth 2변형(1depth·2depth)만 존재 ✅. 더도 덜도 없음.
`textstyles-data.ts:47-48` title/16B(Bold·16·130%·LS 0) / title/16M(Medium·16·130%·LS -2%) ↔ `typography.css` `.typo-title-16b/.typo-title-16m` ↔ 실측 line-height 20.8px(=16×1.3) 전부 일치.

## 2. Depth 축 뒤집힘 — ✅

- Item: 1depth=제목(Bold) · 2depth=항목(Medium) — CSS `gnb-sub-menu-item.css` 1depth 오버라이드로 구현 ✅
- 패널: 1depth 컬럼 = `2depth,2depth,2depth`(항목만 3) · 2depth 컬럼 = `1depth,2depth,2depth,2depth,2depth`(제목1+항목4) — 4패널 × 4컬럼 전수 DOM 확인 ✅ 정본 3800~3812 그대로.

## 3. Item 수치·색 — ✅

들여쓰기 `padding:0px` ✅ · 배경 `rgba(0,0,0,0)` ✅ · 아이콘(SVG) 0개 ✅ · `display:inline-flex`(hug) ✅.

## 4. 패널 수치 — ✅ (실측)

| 항목 | 정본 | 실측 |
|---|---|---|
| 2depth padding | 위32/아래64/좌우24 | `32px 24px 64px` ✅ |
| 1depth padding | 상하좌우 24 | `24px` ✅ |
| 컬럼 수 | 4 | 4 ✅ |
| 컬럼 사이 | 80 | `gap:80px` ✅ |
| 컬럼 안 세로 | 24 | `gap:24px` ✅ |
| 하단선 | 1px `line/gray/subtle` | `::before` height `1px`, bg `rgb(233,233,233)`(=gray/100) / dark `rgb(46,47,56)` ✅ |
| 그림자 | `shadow/dropdown` | `rgba(0,0,0,0.15) 0 4px 8px 0` ✅ |
| 배경 | `navigation/bg` | `rgb(255,255,255)` / dark `rgb(28,29,35)` ✅ |

## 5. 가운데 정렬 — ✅ (직접 실측, 빌더 주장 재검증)

`pages/ui-review.html` 4패널 전부 좌우 여백 **완전 대칭**:

| 패널 | 폭 | 좌 | 우 |
|---|---|---|---|
| 2depth Light | 1326 | 369.69 | 369.69 |
| 1depth Light | 1326 | 427.75 | 427.75 |
| 2depth Dark | 1326 | 369.69 | 369.69 |
| 1depth Dark | 1326 | 427.75 | 427.75 |

빈 소비자(폭 다름)에서도 417.5 / 417.5 대칭 ✅.
빌더가 보고한 349.69 는 **뷰포트가 달라 생긴 값 차이**이고, 판정 기준인 **대칭성**은 성립한다.
`[data-s1-part="columns"]` 에 `flex:1`·`width:100%` 없음(hug 유지) ✅ — 정본 주석 3814 의 2026-09-08 실패 재발 없음.

캡처: `reports/ui-library/gnb-sub-menu/screens/review-panel.png`(육안으로도 대칭)

## 6. 컬럼 기본 내용 — ✅

4패널 전부 `sel:[1,0,0,0]` — 첫 컬럼에만 selected 1개, 나머지 컬럼 0개.
2depth 는 제목 다음 **첫 2depth 항목**이 selected(정본 3803 `ci===0?"Selected"`) ✅.

## 7. 하단선 그리는 방식 — ✅ (GNB 실패 재발 없음)

`border-bottom` 미사용, `::before`(`position:absolute; bottom:0; height:1px`) 겹침 레이어.
높이 산식 검증 — 2depth: 5줄×20.8 + 4×24 + (32+64) = **296** ↔ 실측 **295.98** / 1depth: 3×20.8 + 2×24 + 48 = **158.4** ↔ 실측 **158.39**. **1px 깎임 0** ✅

## 8. 토큰 경유 — ✅

`dist/components/gnb-sub-menu.css`·`gnb-sub-menu-item.css` HEX·rgba 직접값 **0건**(정규식 전수).
새 토큰·새 색 **0건** — 쓰인 토큰 전부 기존 정본: `navigation/bg`·`navigation/label/default`·`navigation/label/selected`·`navigation/submenu/label/default`·`line/gray/subtle`·`shadow/dropdown`·`spacing/24·32·64·80`·`border-width/default`·`font-size/16`·`font-weight/medium·bold`·`line-height/130`·`letter-spacing/tight·normal`.
아이콘 **0건** ✅ (`icons: []`, DOM SVG 0)

## 9. 접근성 — ❌ **F-1** (그 외 ✅)

✅ 확인된 것
- `<ul data-s1-part="column">` / `<li>` 구조 — 4패널 × 4컬럼 전부 `UL` ✅
- 2depth 는 `<a href>` 62개, 1depth 는 `<span>` 14개 — **1depth 에 `<a>`·`<button>` 0개** ✅
- 포커스 가둠 없음 · 방향키 핸들러 없음 · JS 런타임 자체가 없음(`runtime = null`) ✅
- 패널 `role` 없음(펼침 영역, 팝업 아님) ✅

### ❌ F-1 — `aria-current="page"` 가 1depth `<span>`(카테고리 제목)에 붙는다

- 실측: 문서 안 `span[aria-current="page"]` **2건** — `<span data-s1-component="gnb-sub-menu-item" data-depth="1depth" aria-current="page">카테고리 제목</span>` (`#gnb-sub-menu-item-review-matrix` Light·Dark)
- 발생처: `pages/ui-review.html:1753-1757` · `assets/js/ui-library-guide.js:1947-1954` — 두 곳 다 `state==="selected"` 면 depth 무관하게 `aria-current="page"` 를 붙인다.
- 배포 계약과 정면으로 어긋난다:
  - `ui-library/src/components/gnb-sub-menu-item/manifest.json` htmlContract.relations — "현재 위치인 **2depth 항목에만** `aria-current="page"` 를 host 가 정적으로 설정한다."
  - 같은 파일 `a11y.ariaStateSync` — "현재 위치인 **2depth 항목에** host 가 …"
  - `registry/components/gnb-sub-menu-item.json` a11y — "1depth(카테고리 제목)가 링크가 아니면 …목록의 제목 글자로 둔다", "현재 위치인 **항목**에 aria-current"
- 의미상으로도 틀렸다 — 링크가 아닌 카테고리 제목을 낭독기에 "현재 페이지"로 알린다.
- 뿌리: **정본에는 `Depth=1depth, State=Selected` 변형이 실재하는데**(build-components.ts:3702~3714), 웹 계약에는 그 변형을 나타낼 **계약상 합법적인 수단이 없다**. CSS 는 `:hover` / `[data-force-state="hover"]` / `[aria-current="page"]` 3개만 갖는다. 데모가 그 빈자리를 계약 위반 속성으로 메웠다.
- 판정: **❌(a)** — 정본↔파생 불일치이므로 저울질 없이 파생을 고친다(H6). 고치는 방향은 둘 중 하나이며 **둘 다 파생 수정**이라 구현자 재량이다: ①1depth Selected 를 나타낼 문서화된 수단을 계약에 추가(예: `[data-state="selected"]`)하고 데모를 그것으로 바꾼다, ②1depth Selected 를 웹 배포 범위에서 제외한다고 계약·안내에 명시한다. **검증자는 고르지 않는다.**
- `dist/examples/gnb-sub-menu-item.html`·`gnb-sub-menu.html` 자체는 2depth 에만 aria-current 를 붙여 **정상**이다 — 위반은 검수·안내 화면 두 곳에 한정된다.

## 10. 여닫는 동작 제외 판단 — ✅

정본 직접 확인: `build-components.ts` 전체에서 GNB Sub Menu 관련 코드는 6462(그룹 이름)·6522(`"GNB Sub Menu": ["GNB Sub Menu Item"]` 재사용 선언)·6695~6696(빌드 등록)·3694~3830(빌더)뿐. **트리거 노드도, 여닫는 상태 축도, aria/interaction 정의도 없다** — 2-canon-readiness §A 의 사실 주장은 참이다.
부모 `gnb` manifest `jsRequired=false` ✅ 정합. (`modal-content` 는 `jsRequired=true` 라 "껍데기만" 이라는 결은 같아도 런타임 유무 선례로는 `gnb` 쪽이 정확하다 — 결론에는 영향 없음.)
정본에 없는 동작을 지어내지 않고, 여닫는 쪽이 지킬 계약(`aria-expanded`·`aria-controls`·`hidden`·Esc·포커스 복귀·가두지 않기)을 registry a11y 에 남긴 처리 ✅.

## 11. 의존 관계 — ✅ (선례 범위 안)

- `gnb-sub-menu/manifest.json` `dependencies.coreComponents: ["gnb-sub-menu-item"]` ✅ · `dependencies.css` 에 `components/gnb-sub-menu-item.css` 명시 ✅
- `ui-library/scripts/test.mjs:463` 이 이 선언을 강제 ✅ · `dist/manifest.json` 컴포넌트 배열에서 `gnb-sub-menu-item` 이 `gnb-sub-menu` **앞**에 위치 ✅
- 개별 설치 실행 확인: `http://127.0.0.1:4173/ui-library/verification/empty-consumer-individual.html` — `gnb-sub-menu-item.css` → `gnb-sub-menu.css` 순으로 **둘 다 200**, 렌더 정상.
- 다만 CSS 자동 주입(`@import`)은 없고, 부품 CSS 를 빠뜨리면 오류 없이 조용히 무너진다. 이는 **이미 검증 통과한 `select`→`dropdown`·`filter-chip`→`dropdown` 과 동일한 기존 방식**이고 `ui:contract` 가 통과하므로 이 작업의 결함으로 보지 않는다. (시스템 차원 관찰로만 남김)

## 12. 빈 HTML 소비 · 전체묶음 ↔ 개별설치 동일성 — ✅

- `<main>` 안 DOM 문자열 **완전 동일**(스크립트 대조 `identical: True`, gnb-sub-menu 출현 21/21)
- 두 페이지 모두 실제 렌더 정상 · 실측 동일: 좌 417.5 / 우 417.5 · gap 80 · padding `32px 24px 64px` · 높이 295.98 · 1depth 색 `rgb(53,53,53)` fw 700
- 네트워크 전수 200(개별 설치 페이지 CSS·JS 51건) · 이 두 페이지에서 발생한 콘솔 오류 0건
  (버퍼에 남은 오류 6건은 앞서 잘못 연 `ui-library/src/verification/…`(상대경로가 다른 템플릿 사본)과 components.html 의 candidate 안내 경로에서 온 것 — §2 함정 T3 계열의 도구 잔상)

## 13. 다중 인스턴스 · 중복 id — ✅

검수 화면 실측: 부품 **76**개(1depth span 14 + 2depth a 62) · 패널 **4**개 · 문서 전체 중복 `id` **0개**.
패널 `aria-label` 도 "하위 메뉴 표본 83~86" 로 번호를 붙여 겹치지 않음 ✅ (§2 T5 회피)

## 14. 안내 화면 — ✅

- 마커 `<!-- Approved GNB Sub Menu guide: … -->` · `<!-- Approved GNB Sub Menu Item guide: … -->` 존재(`pages/components.html:2118·2121`) ✅
- 빈 mount `<section class="comp-section" id="gnb-sub-menu" data-cov-depth="1depth,2depth">` / item 은 `data-cov-state="default,hover,selected"` 추가 ✅
- `comp-nav` 버튼 2개, `disabled` 해제됨(실측 `disabled:false`) ✅
- 실제 렌더: 두 섹션 모두 "GNB Sub Menu (Item) 승인 배포본을 불러오지 못했습니다: … 배포 상태가 verified 또는 approved가 아닙니다." — **candidate 상태의 정상 동작** ✅ (같은 페이지의 `gnb` 섹션은 26KB 정상 렌더 → 이 작업이 다른 섹션을 깨뜨리지 않았다)
- hover 칸: `ui-library-guide.js:1949` `state==="hover" → data-force-state="hover"` ✅ (렌더가 candidate 로 막혀 DOM 실물 확인은 불가 — 코드 경로로 확인)
- `guideComponents` 배열(2952)·`stateMatrix` 분기(2589-2590)·`componentConfig`(134·140) 배선 ✅

## 15. registry 신설분 — ✅

정본 대조 결과 **틀린 서술 0건**:
- item variants Depth/State 축·note(Bold 16 title/16B · Medium 16 title/16M · Hover=Selected 동색) ✅
- item tokens 3행(1depth Default=submenu/label/default · 2depth Default=label/default · Hover·Selected=label/selected) ✅
- panel Depth 뜻 뒤집힘 서술 ✅ · sizing(32/64/24·24·컬럼4·gap80·item24·border1) ✅ · tokens 7행 ✅
- `_meta` 상태 전부 `stable`/`implemented`, `a11yStatus: stable` — 배포 가능 조건 충족 ✅
- `component-presentation-policy.json` 두 항목에 `"managedBy": "ui-library-guide"` 존재 ✅ (Gate 23 회피)

## 16. 부수 변경 영향 — ✅

`git diff` 전수: **다른 컴포넌트의 실제 CSS·JS 변경 0건**.
- `dist/s1-ui.css` +94/-0 · `s1-ui.js` +2/-0 · `s1-ui.auto.js` +2/-0 — **삭제 줄 0, 순수 추가**
- `dist/components/` 아래 다른 컴포넌트 파일은 하나도 수정되지 않음(git status 확인)
- `build.mjs`·`test.mjs` 변경은 `componentIds` 배열에 2개 추가 + gnb-sub-menu 전용 계약 검사 블록 추가뿐(다른 컴포넌트 검사문 무변경)
- `registry/index.json`·`component-page-coverage.json`·`update-management.json`·`ui-library-migration.json`·`presentation-policy.json` 변경분 전부 gnb-sub-menu 범위(그 외는 JSON 쉼표·배열 재작성뿐)

## 17. 다크에서 읽히는가 — ✅ 구현 결함 아님 (값 기록만)

다크 실측(bg `rgb(28,29,35)`):

| 대상 | 색 | 대비 |
|---|---|---|
| 1depth Default | `rgb(236,237,240)` (gray-dark/900) | 14.36:1 |
| 2depth Default | `rgb(85,87,95)` (gray-dark/600) | **2.33:1** |
| Selected | `rgb(48,112,216)` (blue-dark/300) | **3.55:1** |

`vars-data.ts:622·625·631` — `navigation/label/default {dark: "gray-dark/600"}` · `label/selected {dark:"blue-dark/300"}` · `submenu/label/default {dark:"gray-dark/900"}`.
`tokens.css:771·774·775` 파생값이 정본과 일치하고, 웹은 그 토큰을 그대로 참조한다 → **구현은 정본 충실. 결함 아님.**
낮은 대비는 **정본 토큰 값의 성질**이며(이미 verified 된 `gnb` 메뉴 라벨도 같은 토큰을 쓴다) 값을 바꾸는 것은 정본 변경이라 **별건**이다. 이 검증에서 판정하지 않고 사실만 남긴다.

---

## 요약

**FAIL 1 · HOLD 0 · BLOCKED 0**

- ❌ F-1 — 1depth 카테고리 제목(`<span>`)에 `aria-current="page"` 가 붙어 배포 계약(manifest htmlContract·a11y, registry a11y)과 어긋난다. 뿌리는 정본의 `Depth=1depth × State=Selected` 변형을 나타낼 계약상 수단이 웹에 없다는 것. 발생처 `pages/ui-review.html:1753-1757` · `assets/js/ui-library-guide.js:1947-1954`.

권장 `workflowStatus`: `in-progress` (4-verification **FAIL**) · `uiLibraryStatus`: `draft` 유지
권장 `nextAction`: F-1 을 ui-library-builder 로 수정 → 델타 재검증(직전 보고서 + 변경 파일 지문 첨부)

### 이번에 검증하지 못한 범위
- Figma 캔버스 실물(V3.0 TEST 파일)과의 대조 — 상태 파일이 `not-consulted` 로 선언했고 아이콘 0건이라 범위 밖
- 실제 마우스 `:hover` 물리 입력 — `data-force-state="hover"` 로 같은 CSS 규칙을 통과시켜 확인(선택자 목록이 동일)
- Mobile 뷰포트 — 두 컴포넌트 모두 PC 전용 선언

---

# 2회차 — F-1 델타 재검증 (2026-09-09)

검증자: 🤖 component-verifier · **델타 재검증**(전수 아님) · 직전 보고서 = 이 파일 1회차 절

## 0. 기계검사 재실행 (종료코드만 · 위조 방지)

| 명령 | 종료코드 |
|---|---|
| `ui:contract` | 0 |
| `ui:build:check` | 0 |
| `ui:test:check` | 0 |
| `ui:icons` | 0 |
| `ui:icons:origin` | 0 |
| `ui:guide:render` | 0 |
| `ui:state -- reports/ui-library/gnb-sub-menu/workflow-state.json` | 0 |

> `ui:state` 는 호출자 표에 빠져 있었다. 인자 없이 부르면 `❌ workflow-state.json 경로가 필요합니다.` 로 exit 1 이므로 **경로를 붙여** 재실행했고 PASS(`단계 3-build`). 회귀 아님.
> Gate 34 `uistate:gnb-sub-menu-item.default/hover/selected` 3건은 호출자 선언대로 대상 밖(1회차 build 부터 있던 승인 대기).

## 1. F-1 이 실제로 닫혔나 — ✅

검수 화면(`http://127.0.0.1:4173/pages/ui-review.html`) 실측:

| 조합 | 개수 |
|---|---|
| `1depth \| state=- \| aria-current=- \| SPAN` | 12 |
| `1depth \| state=selected \| aria-current=- \| SPAN` | 2 |
| `2depth \| state=- \| aria-current=- \| A` | 56 |
| `2depth \| state=- \| aria-current=page \| A` | 6 |
| 합계 | **76** |

- `span[aria-current]` **0개** ✅ (1회차 위반 2건 → 0)
- `[aria-current]` 중 `<a>` 가 아닌 것 **0개** ✅
- 안내 화면(`pages/components.html`) `span[aria-current]` **0개** ✅ — 다만 두 섹션은 `status: candidate` 라 여전히 "배포 상태가 verified 또는 approved가 아닙니다" 안내만 뜨고 DOM 실물이 없다. 따라서 **코드 경로**(`assets/js/ui-library-guide.js:1955-1957` depth 분기)로 확인했다(1회차와 같은 한계).
- `dist/examples/gnb-sub-menu-item.html` ↔ src example **byte 동일**, `<span>` 에 `data-state="selected"`, `<a>` 에 `aria-current="page"` ✅

## 2. 1depth Selected 가 실제로 보이는가 — ✅ (실측)

| 테마 | 조합 | computed color | 정본 토큰 |
|---|---|---|---|
| Light | 1depth Selected | `rgb(29,108,235)` | `--color-navigation-label-selected` = `#1D6CEB` ✅ 동일 |
| Dark | 1depth Selected | `rgb(48,112,216)` | 다크 파생 `blue-dark/300` ✅ |

`text-decoration-line: none` · `background: rgba(0,0,0,0)` · `padding: 0px` · `display: inline-flex` — 1회차 값 그대로(밑줄·배경 신설 0) ✅
캡처 육안: `reports/ui-library/gnb-sub-menu/screens/review-item.png` — Light·Dark 두 패널 모두 "1Depth — 카테고리 제목 (Bold) · Selected · data-state" 칸의 글자가 파랑 ✅

## 3. 2depth 는 그대로인가 — ✅

`aria-current="page"` 로 표시 유지(6건, 전부 `<a>`). 6변형 실측이 1회차 표와 **완전 동일**:

| Depth | State | Light | Dark |
|---|---|---|---|
| 1depth | Default | `rgb(53,53,53)` fw700 LS normal | `rgb(236,237,240)` |
| 1depth | Hover(`data-force-state`) | `rgb(29,108,235)` | `rgb(48,112,216)` |
| 1depth | Selected(`data-state`) | `rgb(29,108,235)` | `rgb(48,112,216)` |
| 2depth | Default | `rgb(85,85,85)` fw500 LS -0.32px | `rgb(85,87,95)` |
| 2depth | Hover | `rgb(29,108,235)` | `rgb(48,112,216)` |
| 2depth | Selected(`aria-current`) | `rgb(29,108,235)` | `rgb(48,112,216)` |

line-height 20.8px · font-size 16px · Pretendard ✅

## 4. 서술 ↔ 코드 일치 — ✅ (1회차 FAIL 의 뿌리라 엄격 대조)

| 서술 위치 | 서술 | 코드 실물 | 판정 |
|---|---|---|---|
| manifest `htmlContract.relations[2]` | "현재 위치인 **2depth 항목에만** `aria-current="page"`" | 실측 aria-current 6건 전부 2depth `<a>` | ✅ |
| manifest `htmlContract.relations[3]` (신설) | "1depth 에는 aria-current 를 붙이지 않는다 … `data-state="selected"` 를 정적으로 설정 — 시각 전용" | 1depth aria-current 0건, `data-state="selected"` 2건, JS/HTML 모두 정적 문자열 · 런타임 없음 | ✅ |
| manifest `states.selected` | depth 별로 수단이 갈린다고 서술 | CSS 선택자 그룹과 정확히 일치 | ✅ |
| manifest `cssContract.documentedDataStates` | `[data-depth]`, `[data-depth="1depth"][data-state="selected"]` | CSS 실제 선택자와 일치 ✅ (`[data-force-state="hover"]` 미등재는 `gnb`·`tab` 선례와 동일한 기존 관례 — 신규 이탈 아님) | ✅ |
| manifest `a11y.ariaStateSync` | 2depth=aria-current / 1depth=data-state(ARIA 없음) | 일치 | ✅ |
| `registry/components/gnb-sub-menu-item.json` a11y (4번째 항목 신설) | 동일 내용 | 일치 | ✅ |
| `pages/ui-review.html` 22번 섹션 설명문 · 칸 라벨 | "2depth 는 aria-current, 1depth 는 data-state" · 라벨 `Selected · data-state` / `Selected · aria-current` | 캡처·DOM 모두 일치 (1회차의 depth 무관 "Selected · aria-current" 하드코딩 오표기 해소) | ✅ |

`src/manifest.json` ↔ `dist/…manifest.json` 차이는 `sourceFingerprint` 1줄뿐(빌드 산출) ✅

## 5. `data-state` 이름이 저장소 관례와 맞는가 — ✅ (c 아님)

`dist/s1-ui.css` 전수: `input`(`data-state="correct"`), `table`(`row`/`cell` 의 `hover`·**`selected`**), `date-picker`(`selected`·`today`·`range-*`·`disabled`) 가 이미 같은 어법을 쓴다. **`data-state="selected"` 는 신조어가 아니라 기존 관례** — (c) 로 올릴 사유 없음.

## 6. 상태를 늘리지 않았나 — ✅

manifest `states` 는 여전히 `default`·`hover`·`selected` **3개**. `canonicalStateMap` 도 3행 그대로. `data-state="selected"` 는 기존 `selected` 를 1depth 에서 표현하는 **수단**이지 새 상태 이름이 아니다 — Gate 34 `uistate:` 목록도 3건 그대로(늘지 않음) ✅

## 7. 회귀 — ✅

| 항목 | 1회차 | 2회차 실측 |
|---|---|---|
| 부품 개수 | 76 | **76** ✅ |
| 패널 개수 | 4 | **4** ✅ |
| 중복 `id` | 0 | **0** ✅ |
| 2depth 패널 padding / 높이 | `32px 24px 64px` / 295.98 | 동일 ✅ |
| 1depth 패널 padding / 높이 | `24px` / 158.39 | 동일 ✅ |
| 컬럼 gap / 컬럼 수 | 80px / 4 | 동일 ✅ |
| 패널 좌우 여백 | 대칭 | 57 / 57 **대칭** ✅ |
| 컬럼 selected 분포 | `[1,0,0,0]` | 캡처 확인 동일 ✅ |
| 안내 화면 `gnb` 섹션 | 정상 렌더 | 26,195자 정상 ✅ (안 깨짐) |

캡처: `screens/review-item.png` · `screens/review-panel.png`

## 8. 신규 색·토큰·아이콘 0건 — ✅

- `gnb-sub-menu-item.css`·`gnb-sub-menu.css`(src·dist 4파일) HEX·`rgba()` **0건**
- 새 선택자가 쓰는 색은 **이미 쓰던** `--color-navigation-label-selected` 하나뿐 — 새 토큰 0건 (`tokens.css:552` light / `:774` dark 정의 확인)
- 아이콘 **0건**(SVG DOM 0)
- `assets/css/ui-library-guide.css` 추가분(`.uilg-gnb-submenu-item-cell`)은 `--spacing-8` 만 쓰며 색 0건

## 9. 선택자 누수 — ✅ (핵심 확인)

새 선택자는 `[data-s1-component="gnb-sub-menu-item"][data-depth="1depth"][data-state="selected"]` 로 **루트 스코프 안**에 있다.
검수 화면에서 `[data-state="selected"]` 이면서 이 컴포넌트가 **아닌** 요소 **60개**(전부 table `TD[data-s1-part="cell"]`) 실측 — computed color `rgb(53,53,53)`(원래 값) 유지, 파랑 오염 **0건** ✅
번들 전수에서 스코프 없는 `[data-state=...]` 최상위 선택자 **0건** ✅

---

## 2회차 요약

**FAIL 0 · HOLD 0 · BLOCKED 0** → **PASS**

F-1 은 ① 안으로 실제로 닫혔다. 서술 6곳이 코드와 일치하고, 상태 이름은 늘지 않았으며, 새 선택자는 스코프를 벗어나지 않는다. 회귀 0.

권장 `workflowStatus`: `4-verification` **PASS** → 다음 단계(river UX 승인 / 배포 마무리)
권장 `uiLibraryStatus`: `draft` → **`verified`** (승인 전 단계). 단, 아래 잔여 조건은 이 검증 밖이다.

### 이번에 재확인하지 않고 1회차 PASS 를 승계한 항목 (호출자 선언 범위)
가운데 정렬 실측(§5) · 하단선 1px 겹침 레이어(§7) · 패널 여백/컬럼 간격/항목 간격(§4) · 컬럼 기본 내용(§6) · Depth 뒤집힘(§2) · 여닫는 동작 제외 판단(§10) · 의존 관계(§11) · 두 소비자 `<main>` DOM 동일성과 개별 설치(§12) · 부수 피해(§16) · 다크 대비 판정(§17) · 아이콘 0건.
→ 승계 금지 3조건 해당 없음: 정본 지문 불변 · 검사 규칙 추가·강화 없음 · 변경 파일 목록/지문 제공됨.
(§7 회귀 표에서 §4·§5·§6 의 일부 수치는 그래도 재실측해 동일함을 확인했다.)

### 이번에도 검증하지 못한 범위
- Figma 캔버스 실물 대조 — 시각 정본이 코드이고 아이콘 0건이라 범위 밖
- 실제 마우스 `:hover` 물리 입력 — `data-force-state="hover"` 로 같은 CSS 규칙을 통과시켜 확인
- Mobile 뷰포트 — 두 컴포넌트 모두 PC 전용 선언
- 안내 화면(`pages/components.html`) 의 **DOM 실물** — `candidate` 상태라 렌더가 막혀 코드 경로로만 확인
- Gate 24(DESIGN.md drift) · Gate 46(zip/devpanel 낡음) · Gate 34(uistate 승인) — 호출자가 대상 밖으로 선언

---

# 3회차 — 한 화면 조립 + 여닫는 동작 (델타 재검증, 2026-09-09)

검증자: 🤖 component-verifier (시나리오 F) · 기준선: HEAD=b667a15 `git diff HEAD` + 미추적 파일 전량
이전 2회차 PASS 중 **「여닫는 동작 제외 판단」은 superseded**(river D4 가 D2 를 뒤집음) — 승계하지 않고 새 기준으로 판정했다.

## 0. 기계검사 선행 (§검증 입력 계약 ①) — 재실행 종료코드만 확인

| 명령 | 종료코드 |
|---|---|
| `npm run ui:contract` | 0 |
| `npm run ui:build:check` | 0 |
| `npm run ui:test:check` | 0 |
| `npm run ui:icons` | 0 |
| `npm run ui:icons:origin` | 0 |
| `npm run ui:guide:render` | 0 |

Gate 34 3건(`uistate:gnb-sub-menu-item.default/hover/selected`)은 호출자 선언대로 대상 밖.

## 1. river 가 고른 동작 4가지 — ✅ 4/4

`http://localhost:4173/pages/ui-review.html` 실제 페이지에서 DOM 이벤트를 직접 일으켜 확인(조립 예시 4개 인스턴스 · 트리거 8개).

| 동작 | 실측 | 판정 |
|---|---|---|
| 초기 상태 | `aria-expanded="false"` 8/8 · 패널 `hidden=true`·`display:none` 8/8 | ✅ |
| 마우스 올림 | `mouseenter` → `aria-expanded="true"` · `hidden=false` · `display:flex` (즉시) | ✅ |
| 밖으로 나감 | `mouseleave` → 유예 뒤 `false`/`hidden=true` | ✅ |
| Tab 진입 | `focusin` → `true`/`hidden=false` | ✅ |
| Esc | `false`/`hidden=true` + `document.activeElement === trigger`(A:「서비스」) | ✅ |

## 2. 깜빡임 · 닫힘 유예 — ✅

- 바 → 패널 이동 재현(트리거 `mouseleave` 직후 패널 `mouseenter`, 200ms 대기): 계속 열림 유지 — **깜빡임 없음**.
- 유예 값: `ui-library/src/components/gnb/gnb.js:10` `const CLOSE_DELAY_MS = 150;` — **빌더 주장 150ms 와 코드 일치**. `dist/components/gnb.js` 는 src 와 바이트 동일(`diff` 무출력).
- ⚠️ 브라우저 탭이 백그라운드라 `setTimeout` 이 ~1s 로 클램프돼 **경과시간 실측으로는 150ms 를 확정하지 못했다**(120ms 요청이 실제 ~1000ms). 유예의 *존재*와 취소 동작은 실측, *값*은 코드 판독으로 확정.

## 3. 여러 메뉴 사이 전환 · 동시 열림 — ✅

- 같은 바 안에서 「서비스」→「통계」: 앞 패널 즉시 닫힘 + 뒤 패널 즉시 열림(유예 없음). 한 바 안에서 동시 열림 0건.
- 중복 id **0건**(`pages/ui-review.html` 전체 id 스캔). ⭐ 가 임시 페이지에서 본 동시 열림은 실제 화면에 없다.
- 참고: 서로 다른 GNB 인스턴스 2개에 합성 `mouseenter` 만 주면 둘이 동시에 열려 있을 수 있으나, 트리거에 `mouseleave` 를 함께 주면(=실제 마우스가 반드시 내는 이벤트) 앞 바가 닫힌다(실측). **합성 이벤트 아티팩트이며 결함 아님.** 실제 화면의 GNB 는 1개다.

## 4. 닫힘이 접근성 트리에서도 빠지는가 — ✅

`panel.hidden === true` + `getComputedStyle(panel).display === "none"` 실측. `gnb-sub-menu.css` 의 `[data-s1-component="gnb-sub-menu"][hidden]{display:none}` 이 같은 selector 의 `display:flex` 를 덮는 함정을 막고 있다(select·date-picker 선례와 동일). 눈에만 안 보이는 상태 아님.

## 5. 초점 가둠 없음 — ✅

`gnb.js` 에 Tab 을 가로채는 코드가 없다(`keydown` 핸들러는 `Escape` 외 전부 즉시 return). 패널 내 tabbable 4개 뒤로 Tab 이 자연스럽게 빠져나가며, 초점이 트리거·패널 밖으로 나가면 `focusin` 이 패널을 닫는다.

## 6. hover 없는 기기 폴백 — ✅ (방법 한정)

`window.matchMedia` 를 `matches:false` 로 갈아끼운 뒤 실측 — `hoverCapable()` 이 **이벤트마다 다시 읽으므로**(캐시 없음) 이 방법이 실제 폴백 경로와 같은 분기를 탄다.

| 상황 | 실측 |
|---|---|
| hover:none + `mouseenter` | 안 열림(`false`) — 의도대로 |
| hover:none + 1차 click | 열림 + `defaultPrevented=true`(링크 이동 안 함) |
| hover:none + 2차 click | 닫힘(토글) |
| hover:hover + click | `defaultPrevented=false` — **평범한 링크 그대로** |

"아예 못 여는 상태" 아님. (실제 터치 디바이스 에뮬레이션은 미실행 — 코드 분기가 동일해 대체함.)

## 7. 서술 ↔ 코드 일치 — ❌ **FAIL 1건** (4곳)

일치 확인된 것: `component-behavior.pc.json` GNB(`jsRequired=true`·`events:["s1:gnb:open","s1:gnb:close"]`·keyboard·focus·`accessibility.expanded`·runtimeNote 전부 코드와 일치) · `gnb.json`·`gnb-sub-menu.json` 의 `a11y`/`webDistribution`(둘 다 candidate + supersedes 명시) · `gnb` manifest 의 `javascript`/`a11y`/`htmlContract.relations`/`cssContract.ariaStates`/`dependencies.optionalCoreComponents` · src↔dist manifest 동일(`sourceFingerprint` 1줄 차이뿐) · `DESIGN.core.md` 재생성분 · `pages/ui-review.html` 21·23 머리말(「눌러도 닫히지 않는 것이 정상」 삭제 확인, 「여는 GNB 가 실제로 열고 닫습니다」로 교체됨) ✅

**❌(a) V3-1 — 안내 사이트(components.html) 쪽 서술 4곳이 아직 "배포본에 여닫는 동작이 없다 / host 화면이 갖는다" 고 말한다.** 1회차 FAIL 의 뿌리와 같은 종류이고, 이번 회차에 새로 쓰인 문구도 포함된다.

| # | 위치 | 현재 문구(요지) | 코드 사실 |
|---|---|---|---|
| a | `assets/js/ui-library-guide.js:142` `componentConfig["gnb-sub-menu"].description` | "여닫는 동작은 이 패널을 **쓰는 화면**이 갖습니다" | 화면이 아니라 **gnb(배포본 컴포넌트)** 가 갖는다(D5) |
| b | `assets/js/ui-library-guide.js:143` 같은 항목 `approvedScope` | "JavaScript 불필요(펼쳐진 모양만 배포, **여닫기는 host 화면 소유**)" | 패널 자신은 JS 없음은 맞으나, 여닫기는 배포본(gnb.js)이 한다 |
| c | `assets/js/ui-library-guide.js:2070` `gnbSubMenuStateMatrix()` 안내문 | "**여닫는 동작은 정본에 없어 이 배포본은 펼쳐진 모양만 냅니다** — 트리거·닫기 동작은 화면이 갖습니다" | 배포본이 실제로 여닫는다(river D4) |
| d | `ui-library/src/components/gnb-sub-menu/gnb-sub-menu.example.html:1-3` → **dist/examples/gnb-sub-menu.html 에 그대로 실림** | "여닫는 동작은 정본에 없어 이 예시에 포함하지 않는다 … **열고 닫는 것은 그 화면이 갖는다**" | 같음. 이 주석은 안내 화면 코드뷰어로 사용자에게 노출된다 |

정본(registry `gnb-sub-menu.json` a11y·manifest)은 전부 "gnb 가 갖는다" 로 맞게 적혀 있다 — **파생(안내 사이트 문구)만 어긋났으므로 저울질 없이 파생을 고친다(H6).**
현재 `gnb-sub-menu` 는 `candidate` 라 그 섹션이 "승인 배포본을 불러오지 못했습니다"만 띄우므로 a·c 는 **아직 화면에 안 보이는 잠복 상태**다 — status 가 오르는 순간 그대로 노출된다. d 는 지금도 dist 산출물에 들어 있다.

## 8. 회귀 — ✅ 0건

`pages/ui-review.html` 실측 · `ui-library/dist/s1-ui.css` diff 는 **삭제줄 0**(순수 추가 — 기존 gnb.css 한 줄도 안 바뀜).

| 항목 | 실측 |
|---|---|
| 바 6변형 | center-between/md·sm·xsm + start/md·sm·xsm 전부 존재(34개 인스턴스) |
| 바 높이 | md 56 · sm 48 · xsm 36 |
| 패널 여백 | 2depth 상32/하64/좌24 · 1depth 상24/하24/좌24 |
| 컬럼 간격 / 항목 간격 | 80px / 24px |
| 가운데 정렬 | 좌 350 = 우 350 (좌우 대칭) |
| 6변형 색·굵기·자간 | 1depth 700/normal/#353535·선택 #1D6CEB · 2depth 500/-0.32px/#555555·선택 #1D6CEB |
| 중복 id | 0건 |
| 패널 위치 | 바 바로 아래 gap 0 · 폭 = 바 폭(1326=1326) |

렌더 육안 대조(실제 dist CSS+JS, 라이트/다크, 실제로 열린 상태): `reports/ui-library/gnb-sub-menu/screens/verify3-assembled-open.png` — 2depth(제목+항목 2컬럼)·1depth(항목만) 양쪽 정상, 컬럼 묶음 가운데, 선택 항목 파란색.

## 9. 의존 관계 — ✅

- `aria-controls` 없는 메뉴(「홈」)에는 click 핸들러가 붙지 않는다(핸들러는 pair 트리거에만 바인딩) — 그냥 링크로 남는다.
- 패널 없는 GNB 바에 `init()` 호출: 예외 없이 `{destroy}` 만 가진 no-op api 반환(실측). document 리스너도 등록 전에 early-return 한다 — 34개 인스턴스 중 pair 를 가진 4개만 리스너를 건다.
- `dependencies.coreComponents` 는 `[]` 유지, `optionalCoreComponents` 로 분리 — 강제 의존 아님. ✅

## 10. init/destroy · 다중 인스턴스 · 재초기화 — ✅

| 항목 | 실측 |
|---|---|
| 중복 init | `init(root)` 2회 → 같은 api 객체(멱등) |
| destroy 후 | hover 해도 안 열림(`false`) |
| 재초기화 | 다시 `init` → 정상 열림, 새 api 객체 |
| 34개 공존 | 서로 간섭 없음(pair 없는 인스턴스는 no-op) |
| api 표면 | `openPairs`·`openMenu`·`closeMenu`·`destroy` (manifest `methods`/`lifecycle` 서술과 일치) |

## 11. 상태를 늘렸나 — ✅ 안 늘었다

`gnb` states = `{default, hover, selected}` — HEAD 와 **동일**. `gnb-sub-menu` `{}` · `gnb-sub-menu-item` 3개 그대로. `aria-expanded` 는 `cssContract.ariaStates` 에만 들어갔고 선언 상태(`states`)로 승격되지 않았다. Gate 34 신규 0건.

## 12. 신규 색·토큰·아이콘·애니메이션 — ✅ 0건

`dist/s1-ui.css` 추가분에 hex·rgb() 리터럴 0건, `animation`/`transition`/`@keyframes` 0건, 새 `--토큰` 정의 0건. 색은 전부 기존 semantic 변수(`--color-navigation-*`) 참조. 아이콘 추가 0건(`ui:icons:origin` 0).

## 13. 전역 리스너 누수 — ✅ (가장 위험하다던 지점, 실측 결과 안전)

`document` 에 capture 로 `focusin`·`keydown`·`pointerdown` 3개를 건다.

| 시나리오 | 실측 |
|---|---|
| 열린 패널에서 Esc | `defaultPrevented=true` (자기 것만 소비) |
| **패널 밖 요소에서 Esc** | `defaultPrevented=false` — **modal·dropdown·select·date-picker 의 Esc 를 가로채지 않음** |
| `pointerdown` | `preventDefault` 호출 없음 — 다른 컴포넌트 클릭 정상 |
| `focusin` | 자기 pair 만 닫음, 다른 컴포넌트 상태 미변경 |
| 리스너 해제 | `destroy()` 가 3개 전부 `removeEventListener`(capture 플래그 동일) |

`handleKeydown` 은 `pairFor(target)` 이 없거나 닫혀 있으면 **즉시 return** 하므로 가로채기 조건이 좁다.
🟡 참고(결함 아님·미래 리스크): 열린 패널 **안에** Esc 를 쓰는 다른 컴포넌트를 넣으면 capture 단계라 gnb 가 Esc 를 먼저 먹는다. 현재 패널 계약상 내용물은 링크뿐이라 발생하지 않는다.

## 14. 부수 변경(tab·pagination) — ✅ 지문만

`git diff` 상 두 컴포넌트에서 바뀐 줄은 `canonicalFingerprint` 1줄씩뿐. `.css`·`.js`·`.example.html`·registry 서술 변경 0건. dist 도 manifest 4줄만.

## 3회차 요약

**FAIL 1 · HOLD 0 · BLOCKED 0** → **FAIL**

여닫는 동작 자체는 river 가 고른 4가지가 전부 실제로 동작하고(§1), 깜빡임·단일열림·접근성 트리 제거·초점 비가둠·폴백·전역 리스너 안전성까지 실측으로 확인됐다(§2~§6·§13). 회귀 0건(§8), 상태·색·토큰·아이콘·애니메이션 신규 0건(§11·§12).

막는 것은 하나뿐이다 — **안내 사이트 문구 4곳이 아직 "배포본에 여닫는 동작이 없다"고 말한다(§7 V3-1)**. 그중 하나는 이미 `dist/examples/gnb-sub-menu.html` 에 실려 나갔다. 1회차 FAIL 과 같은 종류(서술↔코드 어긋남)라 관대하게 넘기지 않는다.

권장 조치: 위 4곳을 「여닫는 동작은 GNB(gnb.js)가 갖는다 · 패널 자신은 JS 없음」으로 정정 → `npm run ui:build` 재생성 → 재검증(그 4곳 + `ui:build:check`만 보는 델타).
권장 `workflowStatus`: `4-verification` **FAIL** → `3-build` 로 반환. `uiLibraryStatus` 는 `draft` 유지.

### 이번에 재확인하지 않고 승계한 항목 (호출자 선언 범위)
`gnb-sub-menu-item` 6변형 세부 판정(§2회차) · 하단선 1px 겹침 레이어 · 컬럼 기본 내용 · Depth 뒤집힘 · 두 소비자 개별 설치 경로 · 다크 대비 판정 · 아이콘 0건.
→ **이번에 재확인하지 않음.** 승계 금지 3조건 해당 없음(정본 지문 불변 · 검사 규칙 추가 없음 · 변경 목록 제공됨). 단 §8 회귀표에서 수치 일부는 재실측했다.

### 이번에도 검증하지 못한 범위
- 닫힘 유예 **150ms 의 시간 실측** — 백그라운드 탭 타이머 클램프로 불가, 코드 판독으로 대체(§2)
- 실제 물리 마우스 hover·물리 Tab/Esc 키 — 합성 이벤트로 확인(river 몫)
- 실제 터치 기기 — `matchMedia` 치환으로 같은 분기 확인(§6)
- `pages/components.html` 의 GNB·GNB Sub Menu **DOM 실물** — `candidate` 라 렌더가 막힘("승인 배포본을 불러오지 못했습니다" 확인). `gnb-sub-menu-item` 섹션만 실물 렌더 확인
- Figma 캔버스 대조 · Mobile 뷰포트 — 범위 밖(PC 전용·시각 정본이 코드)
- Gate 34 3건 · Gate 46·47 — 호출자가 대상 밖으로 선언

---

## 3회차 FAIL 처리 — ⭐ 오케스트레이터 (2026-09-09, 검증 이후 변경)

3회차 유일한 실패 **V3-1(서술 ↔ 코드 어긋남 4곳)** 을 고쳤다. 전부 **안내 문구뿐이고 동작 코드는 손대지 않았다.**

| 위치 | 고친 내용 |
|---|---|
| `assets/js/ui-library-guide.js` `componentConfig["gnb-sub-menu"].description` | "여닫는 동작은 이 패널을 쓰는 화면이 갖습니다" → "여닫는 동작은 상단바(GNB)가 갖습니다 — 메뉴에 마우스를 올리면 이 패널이 펼쳐집니다" |
| 같은 파일 `approvedScope` | "JavaScript 불필요(펼쳐진 모양만 배포, 여닫기는 host 화면 소유)" → "이 패널 자체는 JavaScript 가 없다(여닫기는 GNB 가 한다 — 메뉴의 aria-controls 로 이 패널을 가리킨다)" |
| 같은 파일 `gnbSubMenuStateMatrix()` 안내문 | "여닫는 동작은 정본에 없어 이 배포본은 펼쳐진 모양만 냅니다" → "여닫는 동작은 상단바(GNB)가 갖습니다 — 마우스를 올리거나 Tab 으로 들어가면 펼쳐지고, 벗어나거나 Esc 를 누르면 닫힙니다" |
| `ui-library/src/components/gnb-sub-menu/gnb-sub-menu.example.html` (→ `dist/examples/` 에 실린다) | "여닫는 동작은 정본에 없어 이 예시에 포함하지 않는다 … 열고 닫는 것은 그 화면이 갖는다" → "이 패널만 떼어 놓은 예시라 여닫는 코드가 없다. 여닫는 동작은 상단바(GNB)가 갖는다 … 조립 예시는 gnb 쪽 example 에 있다" |

검증자가 짚지 않았지만 **같은 이유로 낡은 주석 2곳**도 함께 고쳤다 — `ui-library-guide.js:2042` 와 `pages/ui-review.html:1854` 의 "여닫는 동작은 정본에 없어 배포본에 넣지 않았다(2-canon-readiness §A)". 지금은 변형 전수를 보는 매트릭스라 트리거를 만들지 않을 뿐이라고 고쳤다.

**⚠️ 이 변경은 🤖 component-verifier 의 3회차 판정 이후에 이뤄졌다. ⭐ 자가인증이다.**
계약 `verification.riskBasedIndependentVerification` 의 "순수 기계적 수정(문서 카피)은 검사기로 충분" 에 해당한다 — 동작 코드·CSS·마크업 구조는 한 줄도 바뀌지 않았고 안내 문장만 바뀌었다.

| 확인 | 결과 |
|---|---|
| 낡은 문구 잔존 | `여닫기는 host` · `펼쳐진 모양만 배포` · `이 패널을 쓰는 화면이 갖` · `열고 닫는 것은 그 화면이 갖` 전수 grep — **0건** |
| 남아 있는 "펼쳐진 모양만" 표현 | manifest·registry 의 "이 컴포넌트 자신은 펼쳐진 모양만 낸다(jsRequired=false)" 는 **사실 그대로**라 유지 |
| 기계검사 6종 | 전부 종료코드 0 (`ui:contract`·`ui:build:check`·`ui:test:check`·`ui:icons`·`ui:icons:origin`·`ui:guide:render`) |
| dist 재생성 | `ui:build` 로 `dist/examples/gnb-sub-menu.html` 갱신 확인 |

**확인 못 한 것:** 이 문구 수정 뒤 독립 검증을 다시 돌리지 않았다.

### 최종: FAIL 0 · HOLD 0 · BLOCKED 0
