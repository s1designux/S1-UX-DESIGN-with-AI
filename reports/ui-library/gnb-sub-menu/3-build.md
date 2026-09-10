# 3-build — GNB Sub Menu · GNB Sub Menu Item

작성 2026-09-09 · 🧱 ui-library-builder

## 1. 만든 파일

### 원본 (`ui-library/src`)

| 파일 | 비고 |
|---|---|
| `components/gnb-sub-menu-item/gnb-sub-menu-item.css` | 신설 |
| `components/gnb-sub-menu-item/gnb-sub-menu-item.js` | 신설 — `jsRequired:false`, `runtime:null` 3줄 |
| `components/gnb-sub-menu-item/gnb-sub-menu-item.example.html` | 신설 |
| `components/gnb-sub-menu-item/manifest.json` | 신설 — `canonicalFingerprint` = `57e3bc10…` |
| `components/gnb-sub-menu/gnb-sub-menu.css` | 신설 |
| `components/gnb-sub-menu/gnb-sub-menu.js` | 신설 — `jsRequired:false`, `runtime:null` 3줄 |
| `components/gnb-sub-menu/gnb-sub-menu.example.html` | 신설 — 2depth 4컬럼 기본형 |
| `components/gnb-sub-menu/manifest.json` | 신설 — `canonicalFingerprint` = `bd0cf518…`, `dependencies.coreComponents: ["gnb-sub-menu-item"]` |

아이콘 신설 0건(두 컴포넌트 모두 글자만 쓴다).

## 2. 배선 체크리스트 (`wiring-and-traps.md §1` 그대로)

- [x] §1-2 생성 경로 3곳 — `ui-library/scripts/build.mjs` · `test.mjs` 의 `componentIds` 에 `gnb-sub-menu-item`·`gnb-sub-menu` 추가(gnb 뒤). `ui-library/package.json` `exports` 에 각 3줄(모듈·css·html) 추가.
- [x] §1-3 소비자 — `empty-consumer.html`·`empty-consumer-individual.html` 양쪽에 동일한 2depth 4컬럼 패널을 `<main>` 끝(gnb 다음)에 추가. `individual` 쪽엔 `<link>` 2개·`import` 2개를 추가로 얹었다(로딩 방법만 다름). `<main>` 정규화 대조(`ui:test`)가 PASS.
- [x] `assets/js/ui-library-guide.js` — `componentConfig` 에 두 항목 추가, `gnbSubMenuItemMarkup/StateMatrix`·`gnbSubMenuColumnMarkup`·`gnbSubMenuMarkup/StateMatrix` 함수 신설(gnbStateMatrix 선례를 따름), `stateMatrix(id)` 분기 2줄, `guideComponents` 배열에 추가.
- [x] `pages/components.html` — `comp-nav` 에 버튼 2개(“GNB Sub Menu”·“GNB Sub Menu Item”) `disabled` 없이 추가, 빈 mount `<section>` 2개 + `<!-- Approved … guide: … -->` 마커, `data-cov-depth`·`data-cov-state` 부여, JS `valid` 배열에 두 id 추가. 인라인 마크업 0건(§A-1 그대로).
- [x] `registry/governance/component-presentation-policy.json` — 두 항목에 `"managedBy": "ui-library-guide"` 포함해 신설.
- [x] `registry/governance/ui-library-migration.json` — 레코드 2건 추가(`uiLibraryStatus: draft`, evidence는 이 work-id 보고서 4종).
- [x] `registry/governance/component-page-coverage.json` — `sectionFor` 에 `"GNB Sub Menu Item"→"gnb-sub-menu-item"`, `"GNB Sub Menu"→"gnb-sub-menu"` 추가하고, 같은 이름이 있던 `noSectionNeeded` 두 항목을 제거(이제 자기 섹션이 생겼으므로).
- [x] Gate 30 대상 표면(등록 커버리지) — `registry/index.json` components 맵, `registry/governance/update-management.json`(origin=A, 선례 assist-button/text-button/modal-content 와 같은 자리·문구 패턴)에도 추가. `registry/components/index.json` 은 2단계에서 이미 등재돼 있었다.
- [x] `pages/ui-review.html` — 건드리지 않음(guide-builder 소관, 지시대로).

## 3. 정본과 다르게 간 곳과 이유

- **없음 (의도적 이탈 0건).** 축·수치·토큰·색·구조 전부 정본(`build-components.ts` 3655~3838)과 `1-inventory.md`·`2-canon-readiness.md`를 그대로 따랐다.
- 웹 반응형 처리(폭 1920 고정 → full-width)는 지시받은 대로의 의도적 플랫폼 차이이며, 부모 `gnb`와 같은 처리다(정본 주석에도 이미 기록돼 있음).
- **DOM 해석 결정 1건**: 정본은 컬럼 안 제목·항목을 형제로 나열하지만(그릇 안 flat 5개), registry a11y가 "<ul>/<li>" 목록 구조를 요구한다. 이를 위해 컬럼 = `<ul data-s1-part="column">`, 각 항목/제목 = `<li>` 하나에 `gnb-sub-menu-item` 인스턴스 하나로 감쌌다(1depth는 `<span>`, 2depth는 `<a>`). 시각 간격(24)은 그대로 유지되고 시맨틱만 목록으로 정리한 것이라 정본 이탈이 아니라고 판단했다.

## 4. 실측값 (구현 CSS 기준, 정본과 대조 완료)

| 항목 | 값 | 근거 |
|---|---|---|
| Item 1depth | 16 Bold(`title/16B`) · `color/navigation/submenu/label/default` | build-components.ts:3697 |
| Item 2depth | 16 Medium(`title/16M`) · `color/navigation/label/default` | 〃 |
| Item Hover·Selected(둘 다) | `color/navigation/label/selected` | 〃 |
| 패널 여백 2depth | 위 `spacing/32` · 아래 `spacing/64` · 좌우 최소 `spacing/24` | build-components.ts:3737 |
| 패널 여백 1depth | 상하좌우 `spacing/24` | 〃 |
| 컬럼 사이 간격 | `spacing/80` | 〃 (river 렌더 비교 확정값) |
| 컬럼 안 항목 간격 | `spacing/24` | 〃 |
| 하단선 | 1px `color/line/gray/subtle`, `::before` 겹침 레이어(gnb.css 방식) | 〃 |
| 그림자 | `shadow/dropdown`(기존 재사용) | 〃 |
| 컬럼 정렬 | 부모 `justify-content:center`, 컬럼 묶음은 hug(늘리지 않음) | 〃 3814 |

렌더 스크린샷으로 확인: 정적 파일(`ui-library/dist` CSS만 물린 페이지)에서 4컬럼 묶음이 좌우 대칭으로 가운데 정렬됨을 눈으로 확인했고(좌우 여백 근사 대칭), 라이트·다크 양쪽에서 제목(Bold)·항목(Medium) 굵기 차이와 Selected(파란색) 표시가 뚜렷하게 읽혔다.

## 5. 캡처 경로 (로컬, 세션 종료 후 사라짐 — 재현하려면 `npm run shot`)

- `/tmp/gnb-sub-menu-shots/gnb-sub-menu.png` — 배선 확인용(candidate 상태라 "승인 배포본을 불러오지 못했습니다" 오류 화면, 정상 동작)
- `/tmp/gnb-sub-menu-shots/gnb-sub-menu-2.png`, `gnb-sub-menu-item.png`, `gnb-sub-menu-item-full.png` — 임시로 manifest status 를 `verified`로 올려 렌더만 확인한 스크린샷(확인 후 즉시 `candidate`로 되돌리고 재빌드함 — src·registry에는 verified가 남아있지 않다)
- `/tmp/gnb-sub-menu-shots/static.png`, `static-dark.png` — `ui-library/dist` CSS만 물린 정적 페이지로 컬럼 간격·가운데 정렬·라이트/다크 대비 확인

## 6. 확인 못 한 범위

- Figma 캔버스 실물 설치 확인 — 1-inventory.md §G에 이미 기록된 미확인 사항 그대로(시각 정본은 코드라 이 작업을 막지 않음).
- 실제 aria-expanded/aria-controls 로 여는 host 화면 통합 — 정본·계약에 따라 이 배포본 범위 밖(2-canon-readiness §A).
- 원본(Figma A `gnb list` 540:6398/540:6423) 대조 — component-verifier 몫. 이 보고서 작성자는 build-components.ts 코드 정본만 근거로 삼았다(⭐ 자가인증 아님, 코드 직접 판독).
- `registry/components/gnb-sub-menu-item.json`·`gnb-sub-menu.json` 자체의 내용 타당성은 2단계(orchestrator)에서 이미 만든 것을 그대로 신뢰해 사용했다 — 이번 3단계에서 내용을 다시 검증하지 않았다.

## 7. 검사기 명령별 종료코드

| 명령 | 종료코드 | 비고 |
|---|---|---|
| `npm run ui:contract` | 0 | PASS |
| `npm run ui:icons` | 0 | PASS(기존 부채 경고 2건, 내 컴포넌트와 무관) |
| `npm run ui:icons:origin` | 0 | PASS(기존 부채 경고 2건, 내 컴포넌트와 무관) |
| `npm run ui:build` | 0 | PASS · 199 files |
| `npm run ui:test` | 0 | PASS |
| `npm run components:facts:check` | 0 | PASS |
| `npm run components:guide-model:write` | 0 | 48개 재생성(내 신설 2건 포함) |
| `npm run components:guide-model:check` | 0 | PASS |
| `npm run design:md:check` | **1** | `component-behavior-check`·`design-md-drift-check` 는 PASS. `design-md-agent-contract-check` 의 "PC 사이트에 없는 Modal 행동이 임의 생성됨"은 **이 작업 이전부터 있던 기존 실패**임을 `git stash`로 대조 확인(내 변경과 무관) |
| `npm run gate:check` | **1** | 3 error · 14 warning. 신규 error 3건은 전부 **Gate 34**(`uistate:gnb-sub-menu-item.default/hover/selected` 승인 대기) — assist-button·text-button·modal-content 선례와 동일하게 river 승인 인용 절차가 필요해 ⭐ 스스로 승인하지 않고 남겨둔다. warning 14건은 전부 기존 부채(multi-toggle/filter-chip 분류 미정, modal 미검증, 토큰 drift baseline, pipeline-status 맵 낡음, dark divergence, icon origin baseline 등)로 이번 작업과 무관함을 확인했다 |

## 8. 남겨둔 것 (orchestrator/river 몫)

- Gate 34 승인: `node scripts/canon-addition-check.js --approve --by river --reason "..." --quote "<river 실제 발화>"` — 세션 기록에 river 가 실제로 한 말(예: workflow-state.json 의 "GNB·Nav → GNB 하위메뉴 2종 → 개발자 배포 탭 공개" 승인 발화)을 인용해야 통과한다.
- `manifest.json` status 승격(candidate→verified→approved)은 🤖 component-verifier 원본대조와 river UX 승인 이후의 일이다. 지금은 `candidate`로 정직하게 남겨뒀다.

---

# 2회차 — F-1 수정 (2026-09-09)

component-verifier 1회차 전수 검증 FAIL 1건(`4-verification.md` F-1) 수정. 오케스트레이터가 지정한 방향(① 안)을 그대로 따랐다.

## 1. 무엇이 문제였나

1depth(카테고리 제목·`<span>`, 링크 아님)가 Selected 일 때, 검수·안내 화면 두 곳이 depth 를 안 보고 `state==="selected"` 면 무조건 `aria-current="page"` 를 붙였다. `<span>` 은 링크가 아니라 "현재 페이지" 개념이 성립하지 않는데도 화면 낭독기에 그렇게 알린 것 — 그리고 그 자체가 `manifest.json` htmlContract·a11y 서술과도 어긋났다. 뿌리는 정본에 있는 `Depth=1depth × State=Selected` 변형(build-components.ts:3702~3714)을 웹 계약이 표현할 합법적 수단을 아예 갖고 있지 않았던 것.

## 2. 고른 수단과 이름

**`data-state="selected"`** — 시각 전용, ARIA 없음. 저장소 안에 이미 같은 이름의 선례가 있다(`pages/ui-review.html` 테이블 선택 행, `assets/js/ui-library-guide.js` date-picker range 밴드 — 새 어휘를 만들지 않고 기존 관례를 따름).

- **2depth(항목·`<a href>`)**: 그대로 `aria-current="page"` — 현재 위치이자 시각을 겸한다. 바꾸지 않았다.
- **1depth(카테고리 제목·`<span>`)**: `aria-current` 를 쓰지 않고 `data-state="selected"` 로 Selected 를 낸다.
- **상태 이름은 늘리지 않았다** — `default`·`hover`·`selected` 그대로. `data-state="selected"` 는 이미 있는 `selected` 상태를 1depth 에서 표현하는 **수단**이지 새 상태가 아니다.

## 3. 고친 파일

| 파일 | 무엇을 바꿨나 |
|---|---|
| `ui-library/src/components/gnb-sub-menu-item/gnb-sub-menu-item.css` | 색상 선택자에 `[data-depth="1depth"][data-state="selected"]` 추가(공개 계약 확장) |
| `ui-library/src/components/gnb-sub-menu-item/gnb-sub-menu-item.example.html` | 1depth 예시에 `data-state="selected"` 시연 추가 |
| `ui-library/src/components/gnb-sub-menu-item/manifest.json` | `states.selected` 서술을 depth 별로 분리, `htmlContract.relations`에 1depth 규칙 추가, `cssContract.documentedDataStates`에 `[data-depth="1depth"][data-state="selected"]` 추가, `a11y.ariaStateSync` 재서술, `canonicalFingerprint` 재계산(registry 변경 반영) |
| `registry/components/gnb-sub-menu-item.json` | `a11y` 배열에 1depth aria-current 미사용 · data-state 사용 규칙 추가 |
| `pages/ui-review.html` | `gnbSubMenuItemMarkup()` — depth 별 분기(1depth→data-state, 2depth→aria-current) · 22번 섹션 설명문 정정 · `renderGnbSubMenuItemPanel()`의 라벨을 depth 별로 분리("Selected · data-state" vs "Selected · aria-current", 종전엔 depth 무관 "Selected · aria-current" 하드코딩이라 그 자체가 오표기였다) |
| `assets/js/ui-library-guide.js` | `gnbSubMenuItemMarkup()` — 동일 depth 분기(안내 화면의 `gnbSubMenuItemStateMatrix()` 라벨은 원래 "Selected"로 depth 무관 중립 표현이라 손대지 않음) |

`ui-library/dist/**`는 손편집하지 않았다 — `npm run ui:build`로 재생성.

## 4. 렌더 확인

`http://127.0.0.1:4173/pages/ui-review.html` (http-server, 정적 dist 소비) 을 헤드리스 스크린샷(`npm run shot`, `--window-size=1280,9000`)으로 캡처해 22번 "GNB Sub Menu Item" 섹션을 직접 육안 확인했다 — Light·Dark 패널 모두 "1Depth — 카테고리 제목 (Bold) · Selected · data-state" 칸의 "카테고리 제목" 글자가 파란색(`color/navigation/label/selected`)으로 보인다. 라벨도 2depth 칸("Selected · aria-current")과 갈려서 표시된다.

DOM 실측(같은 페이지, JS로 직접 질의):
- `span[data-s1-component="gnb-sub-menu-item"][data-depth="1depth"]` 총 14개 중 `aria-current` 보유 **0개**, `data-state="selected"` 보유 **2개**(Light·Dark 각 1개, 검수 매트릭스의 Selected 칸).
- 문서 전체에서 `<span>` 태그가 `aria-current="page"`를 가진 경우 **0건**(전체 `[aria-current="page"]` 24건은 전부 2depth `<a>`).

## 5. Gate 34 — 새 항목 유무

`npm run gate:check` 실행 결과 error 3건이 그대로 남아 있다: `uistate:gnb-sub-menu-item.default` · `.hover` · `.selected` 승인 대기.

**이번 수정이 만든 새 항목이 아니다.** 확인 방법 — 내 변경분(`ui-library/src/components/gnb-sub-menu-item`·`registry/components/gnb-sub-menu-item.json`·`pages/ui-review.html`·`assets/js/ui-library-guide.js`·`ui-library/dist`)을 `git stash`로 걷어낸 뒤 `node scripts/canon-addition-check.js`만 단독 실행하면 `정본 신설 0건`으로 통과한다(gnb-sub-menu-item manifest 자체가 사라지므로 uistate 항목도 함께 사라짐). 즉 이 3건은 1회차 build 산출물(`states: {default, hover, selected}`)이 처음부터 안고 있던 미승인 상태이고, 나는 상태 이름 3개를 그대로 뒀을 뿐 늘리지 않았다 — `3-build.md` 1회차 §7·§8에 이미 같은 사실이 기록돼 있다. `data-state="selected"`는 **속성(수단)**이지 canon-addition-check.js 가 추적하는 상태 **이름**이 아니라 이 3건 목록에 새로 얹히지도 않았다.
승인은 river 실제 발화 인용이 필요해 이번에도 ⭐/🧱 가 스스로 처리하지 않고 orchestrator/river 몫으로 남긴다.

## 6. 검사기 종료코드

| 명령 | 종료코드 |
|---|---|
| `npm run ui:contract` | 0 |
| `npm run ui:icons` | 0 (기존 부채 경고 2건, 무관) |
| `npm run ui:icons:origin` | 0 (기존 부채 경고 2건, 무관) |
| `npm run ui:build` | 0 · 199 files |
| `npm run ui:test` | 0 |
| `npm run components:facts:check` | 0 |
| `npm run components:guide-model:check` | 0 (48개 정본 일치) |
| `npm run components:behavior:check` | 0 (PC 20개 계약 연결) |
| `npm run gate:check` | 1 — error 8건 · warning 14건. **신규 error 3건은 여전히 Gate 34 uistate 승인 대기뿐**(§5, 1회차부터 있던 것). 나머지 error 5건(Gate 24 DESIGN.md drift·Gate 46 zip/devpanel 낡음)은 `npm run ui:build`가 dist 를 갱신할 때마다 항상 뒤따르는 재생성 필요 신호이고 이 컴포넌트 고유 결함이 아니다(river/orchestrator 가 최종 배포 직전 `design:md:write`·`ui:zip`·`devpanel:gen` 일괄 실행할 몫) |

## 7. 확인 못 한 범위

- Figma 캔버스 실물 대조 — 1회차와 동일하게 범위 밖(시각 정본은 코드).
- `design:md:write`·`ui:zip`·`devpanel:gen` 재생성 — 이번 F-1 수정 자체와 무관한 배포 마무리 단계라 실행하지 않았다(Gate 24·46 error 잔존은 그래서다).
- 델타 재검증 — component-verifier 몫.

---

# 3회차 — 한 화면 조립 + 여닫는 동작 구현 (2026-09-09)

river 지시로 범위 확장(D4·D5, workflow-state.json). 이전 2회차 PASS 는 여닫는 동작이 없던 배포본 기준이라 superseded.

## 1. 여닫는 동작 — 트리거·유예값·폴백

**트리거는 `gnb` 가 갖는다(D5).** 패널(`gnb-sub-menu`)은 그대로 수동형(jsRequired=false) — 어느 메뉴에 어느 패널이 걸리는지는 상단바가 안다. 연결은 `aria-controls="<패널 id>"` 하나뿐이다. `gnb.js` 를 새로 작성했다(`jsRequired: false → true`).

- **여는 시점**: hover-capable 기기는 메뉴·패널에 `mouseenter` 즉시. Tab 으로 메뉴에 들어가면(`focusin`) 즉시. 한 번에 하나만 열리고, 다른 트리거로 옮기면 이전 패널은 유예 없이 즉시 닫힌다(깜빡임 없이 전환).
- **닫는 시점(유예)**: 메뉴·패널 양쪽 모두에서 `mouseleave` 시 **150ms** 뒤 닫는다. 근거: river 지시("여는 건 즉시, 닫는 건 ~150ms")를 그대로 따랐다 — 바와 패널 사이 좁은 틈을 마우스가 지날 때 사람이 실수로 살짝 벗어났다 돌아오는 정도를 흡수하는 값이다. 실제 브라우저에서 `mouseenter`(패널) 로 타이머를 취소하는 것을 확인했다(§4).
- **Esc**: 열린 패널이 있고 초점이 그 트리거·패널 안에 있으면 닫고 초점을 트리거로 되돌린다. **포커스는 가두지 않는다** — Tab 은 항상 자연스럽게 다음 요소로 넘어간다.
- **바깥 클릭/탭**: `pointerdown` 이 트리거·패널 밖이면 열린 패널을 전부 닫는다(select·date-picker 와 같은 기존 안전망 관례).
- **마우스 없는 기기 폴백**: `matchMedia('(hover: hover)')` 를 **매 이벤트마다 다시** 확인한다(캐시하지 않음 — 하이브리드 기기가 세션 중 마우스를 붙였다 떼도 맞게 반응). 거짓이면 클릭으로 토글한다(`preventDefault`). hover 가 되는 기기는 클릭을 가로채지 않고 링크 기본 동작 그대로 둔다.
- **애니메이션 0건** — 정본에 없다.

### 재오픈 방지(구현 세부)

Esc 로 닫을 때 `trigger.focus()` 를 호출하는데, 이게 `focusin` 을 다시 일으켜 즉시 재오픈되는 문제가 있었다(자체 발견·자체 수정 — 별도 회차 아님). `suppressFocusOpenFor` 플래그로 그 한 번만 건너뛰고, `focus()` 가 이벤트를 못 낼 수도 있어(이미 active 인 경우) 다음 tick 에 플래그를 정리한다.

## 2. 의존 관계 — 강제 아님

`gnb` manifest `dependencies.coreComponents` 는 그대로 `[]` 다(강제 아님). 대신 `optionalCoreComponents: ["gnb-sub-menu"]` + 설명 필드를 신설했다 — 기존 `coreComponents`(select→dropdown 같은 필수 의존)와 의미가 달라 같은 필드에 넣지 않았다. `gnb.js` 는 `aria-controls` 를 가진 메뉴가 하나도 없으면 `init()` 이 아무 것도 하지 않고 조용히 끝난다(§4 실측) — 하위메뉴 없이 상단바만 쓰는 화면도 그대로 동작한다.

## 3. 고친 파일

| 파일 | 무엇을 바꿨나 |
|---|---|
| `ui-library/src/components/gnb/gnb.js` | 신규 작성 — 트리거+패널 관리 런타임(§1) |
| `ui-library/src/components/gnb/gnb.example.html` | 상단바+패널 2개(서비스=2depth, 통계=1depth) 조립 예시로 교체. `aria-controls`/`aria-expanded`/`id`/`hidden` 배선 |
| `ui-library/src/components/gnb/manifest.json` | `jsRequired: false→true`, `javascript` 블록 재작성(runtime·events·eventDetail·methods·interactionModel), `a11y.keyboard/focus/ariaStateSync` 갱신, `htmlContract.relations`·`cssContract.ariaStates` 추가, `dependencies.optionalCoreComponents` 신설, `notInCanon.subMenuOpenClose` 신설(D4 인용), `status: verified→candidate`(자가 검증 아님), `canonicalFingerprint` 재계산 |
| `ui-library/src/components/gnb-sub-menu/gnb-sub-menu.css` | `[data-s1-component="gnb-sub-menu"][hidden]{display:none}` 추가 — 같은 selector 의 `display:flex` 가 UA `[hidden]` 규칙을 덮어써 버리는 함정 방어(select.css·date-picker.css 선례와 동일 패턴). 이게 없으면 `hidden` 을 줘도 화면에서 안 사라진다 |
| `ui-library/src/components/gnb-sub-menu/manifest.json` | `status: verified→candidate`, `notInCanon.openClose`·`a11y.*`·`htmlContract.relations`·`cssContract.documentedDataStates`(`[hidden]` 추가) 서술을 "host 화면"에서 "gnb(구체적으로)"로 정정, `canonicalFingerprint` 재계산 |
| `registry/components/gnb.json` | `a11y` 배열에 aria-controls/aria-expanded/hover-유예/Esc/폴백/hidden 규칙 3항목 추가, `webDistribution`(status→candidate, runtime→components/gnb.js, note·supersedes 갱신) |
| `registry/components/gnb-sub-menu.json` | `a11y` 4항목 재서술(gnb 가 실제 소유자임을 명시), `webDistribution`(status→candidate, note·supersedes 갱신) |
| `registry/components/component-behavior.pc.json` | `GNB` 항목 — `sourceEvidence`(jsRequired=true·runtime 3줄로 갱신), `events`(`s1:gnb:open/close`), `keyboard`·`focus`·`accessibility.expanded`(신설)·`runtimeNote` 재작성. `status` 는 그대로 `verified`(이 필드는 "문서 근거가 코드와 일치"만 뜻한다 — component-behavior-check.js 는 `verified`/`static` 만 허용) |
| `ui-library/scripts/test.mjs` | `gnb-sub-menu` 블록에 `[hidden]{display:none}` 존재 검사 추가. `id==="gnb"` 신규 블록(jsRequired=true·coreComponents 에 gnb-sub-menu 강제 포함 금지·조립 예시 aria-controls 존재·패널 hidden 초기값 검사). jsRequired=true 모듈 lifecycle 검사 목록에 `gnb` 추가 |
| `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` | 기존 단독 GNB 바를 조립 예시(바+패널 2개, wrapping `<div>`)로 교체(기존 단독 GNB Sub Menu 4컬럼 데모는 그대로 유지). 소비자 스크립트의 "gnb 는 런타임 없어야 한다" 단언을 제거하고 "런타임 있어야 한다" 단언으로 교체(individual 쪽은 `import { init as initGnb }` + `initGnb(root)` 호출 추가) |
| `pages/ui-review.html` | `gnbAssembledMarkup()` 신설(21·23 양쪽에서 재사용, 자리마다 새로 만듦 — `uniqueId` 로 매번 고유 id). 21번 GNB 섹션에 "조립 예시" 그룹 추가(기존 바 6종·메뉴 9종 매트릭스는 유지). 23번 GNB Sub Menu 섹션에도 같은 조립 예시 + "펼쳐진 채 고정된 정적 표본 2종"으로 문구 정정. 21·23 머리말 문구를 실제 동작에 맞게 수정(23번의 "눌러도 닫히지 않는 것이 정상" 문구 삭제). init 스크립트에 `S1UI.gnb.init()` 호출 추가(모든 gnb 인스턴스 — aria-controls 없는 것은 안전하게 no-op). CSS `.uilg-gnb-assembled(-wrap)` 배치 전용 규칙 추가 |
| `assets/js/ui-library-guide.js` | `gnbAssembledMarkup()` 신설(ui-review.html 과 별도 사본 — 기존 컴포넌트별 함수 중복 관례 그대로). `gnbStateMatrix()` 에 "조립 예시" preview-area 를 맨 앞에 추가(기존 바/메뉴/유틸 매트릭스는 그대로 유지). `componentConfig.gnb.description/approvedScope` 문구 갱신. `mountGuide()` 런타임 초기화에 `id==="gnb"` 분기 추가(모든 gnb 인스턴스 init — .is-preview 구분 불필요, 조립 예시만 실제로 열림) |
| `assets/css/ui-library-guide.css` | `.uilg-gnb-assembled(-wrap)` 배치 전용 규칙 추가(색·크기 없음 — 레이아웃만) |
| `ui-library/src/components/tab/manifest.json` · `pagination/manifest.json` | **부수 영향** — 둘 다 `canonicalSources` 에 `registry/components/component-behavior.pc.json` 을 포함하는데, 그 파일의 GNB 항목을 고치면서 두 컴포넌트의 `canonicalFingerprint` 가 함께 stale 해졌다(내용은 안 바뀜 — 파일 해시만 변함). `ui:build` 가 stale 지문을 error 로 막아 재계산했다. tab·pagination 자신의 시각·행동·registry 서술은 손대지 않았다 |

`ui-library/dist/**` 는 손편집하지 않았다 — `npm run ui:build` 로 재생성.

## 4. DOM 으로 확인한 결과 (river 요청대로 실제 이벤트를 일으켜 확인)

`http://127.0.0.1:4173/pages/ui-review.html` 21·23 번 섹션의 조립 예시(각 4개 인스턴스, Light·Dark × 21·23)에서 직접 확인:

| 확인 항목 | 방법 | 결과 |
|---|---|---|
| 초기 상태 | 로드 직후 | `aria-expanded="false"` 8건, 패널 `hidden`=true·`display:none` 8건 |
| Hover 열림 | `mouseenter` 디스패치 | `aria-expanded="true"`, `hidden=false`, `display:flex` — 즉시 |
| Hover 닫힘(유예) | `mouseleave` 후 60ms(아직 열림) → 150ms 더(닫힘) | 60ms 시점 열림 유지, 210ms 시점 `hidden=true`·`display:none` — **유예 확인** |
| 바→패널 이동 시 깜빡임 없음 | mouseleave(트리거) 직후 즉시 mouseenter(패널), 200ms 대기 | 계속 열림 유지 — **깜빡임 없음 확인** |
| 트리거 전환 | 열린 상태에서 다른 트리거로 mouseenter | 이전 패널 즉시 닫힘, 새 패널 즉시 열림(유예 없음) |
| Tab 진입 | `focusin` 디스패치(실제 `.focus()` + `focusin` 이벤트 — 헤드리스 환경은 window 미포커스 시 `.focus()` 단독으로는 focusin 이 안 났다, 알려진 헤드리스 한계) | 열림 확인 |
| Esc 닫힘 + 초점 복귀 | 트리거에 포커스 있는 상태에서 트리거 위 `keydown Escape` 디스패치 | `aria-expanded="false"`, `hidden=true`, `document.activeElement===trigger` — **초점 복귀 확인** |
| 바깥 포인터다운 | `document.body` 에 `pointerdown` | 열린 패널 닫힘 확인 |
| `[hidden]` 이 실제로 안 보이게 하는지 | `getComputedStyle(panel).display` | 열림 `flex` / 닫힘 `none` — **T9류 함정 없음 확인** |

캡처: `reports/ui-library/gnb-sub-menu/screens/assembled-open-3rd.png`(정적 페이지에 dist CSS 만 물려 육안 확인 — 바 아래 "서비스" 패널이 2컬럼으로 펼쳐지고 "개요"가 파란 글자로 선택 표시됨. `pages/ui-review.html` 은 `file://` ES module 제약(T2) + 앵커 스크롤 함정(T4) 때문에 정적 캡처가 어려워, 별도 정적 페이지로 시각 확인하고 실제 상호작용은 위 표처럼 DOM 이벤트로 확인했다).

## 5. Gate 34 — 새 항목 유무

`npm run gate:check` 결과 Gate 34 error 는 여전히 **3건**(`uistate:gnb-sub-menu-item.default/hover/selected`) — 1회차부터 있던 것 그대로다. `data-state`·`aria-expanded`·이벤트 이름(`s1:gnb:open/close`)은 canon-addition-check.js 가 추적하는 "정본 상태 이름"이 아니라(속성·이벤트) 새로 얹히지 않았다. `states` 필드(default/hover/selected)도 그대로 3개.

## 6. 검사기 종료코드

| 명령 | 종료코드 | 비고 |
|---|---|---|
| `npm run ui:contract` | 0 | |
| `npm run ui:build` | 0 | 199 files(부수 영향으로 tab·pagination 지문 재계산 포함, §3) |
| `npm run ui:test` | 0 | 신규 gnb 검사 블록 포함 |
| `npm run ui:icons` | 0 | 기존 부채 경고 2건, 무관 |
| `npm run ui:icons:origin` | 0 | 기존 부채 경고 2건, 무관 |
| `npm run components:facts:check` | 0 | |
| `npm run components:guide-model:check` | 0 | 48개 일치 |
| `node scripts/component-behavior-check.js` | 0 | PC 20개 계약 연결 |
| `npm run design:md:check` | 0 | `design:md:write` 로 DESIGN.core.md 재생성 후 통과. Agent Contract 검사의 "PC 사이트에 없는 Modal 행동" 1건은 이 작업 이전부터 있던 실패(호출자 선언대로 대상 밖) |
| `npm run gate:check` | 1 | error 13 · warning 14. **Gate 34 는 3건 그대로(신규 0)**(§5). 나머지 error 는 Gate 46(zip·devpanel 재생성 필요 — dist 를 고칠 때마다 뒤따르는 배포 마무리 단계, 2회차와 같은 이유로 실행하지 않음)·Gate 47(검수판 화면이 이번 dist 변경보다 낡음 — `board:refresh` 는 별도 배포 마무리 단계). warning 은 전부 기존 부채(multi-toggle/filter-chip 분류 미정, modal 미검증, 토큰 drift baseline, pipeline-status 낡음, dark divergence baseline, Gate 32 GNB Menu 미계측 등) |

## 7. 확인 못 한 범위

- Figma 캔버스 실물 대조 — 시각 정본은 코드이고 아이콘 0건이라 범위 밖(1·2회차와 동일).
- `pages/components.html` 의 조립 예시 **실제 렌더** — `gnb` manifest `status` 를 `candidate` 로 두었으므로(자가 검증 아님) 이 화면은 여전히 "승인 배포본을 불러오지 못했습니다" 안내만 뜬다(정상 동작, 1·2회차와 같은 패턴). `assets/js/ui-library-guide.js` 의 `gnbAssembledMarkup()`·`mountGuide` 배선은 코드 경로로만 확인했다 — status 가 verified/approved 로 오른 뒤 실제 DOM 으로 재확인 필요.
- 실제 물리 마우스·키보드 입력(트랙패드 hover, 진짜 Tab 키) — 헤드리스 환경 한계로 JS 로 이벤트를 일으켜 확인했다(§4). 물리 입력 자체는 river 몫으로 남는다.
- `npm run ui:zip`·`npm run devpanel:gen`·`npm run board:refresh` — 이번 작업과 무관한 배포 마무리 단계라 실행하지 않았다(Gate 46·47 error 잔존은 그래서다, 2회차와 같은 판단).
- Mobile 뷰포트 — GNB·GNB Sub Menu 둘 다 PC 전용 선언 그대로.

---

# 4회차 — 패널 변형 축 개편: Depth → Type(regular · compact-1 · compact-2) (2026-09-09)

정본이 바뀌었다(river 지시 2026-09-09, 레거시 A `gnb list` 540:6398 콤팩트 두 종 편입). 패널(`gnb-sub-menu`)의
변형 축이 `Depth`(1depth·2depth) 에서 **`Type`(regular·compact-1·compact-2)** 로 개편됐다. `gnb-sub-menu-item`
(항목 하나)의 `Depth` 축은 그대로다 — 이번 회차는 **패널 축만** 건드렸다. `build-components.ts`(TYPE_SPEC 표)는
읽기만 했고 고치지 않았다(동시에 다른 에이전트가 검증 중이라 지시대로 손대지 않음).

## 1. 축 개편으로 고친 파일

| 파일 | 무엇을 바꿨나 |
|---|---|
| `ui-library/src/components/gnb-sub-menu/gnb-sub-menu.css` | `[data-depth="2depth"]`(패딩 32/64) → `[data-type="regular"]`. `[data-depth="1depth"]`(패딩 24) → `[data-type="compact-1"], [data-type="compact-2"]`. `[data-type="compact-2"] [data-s1-part="column"]` 에 `gap: var(--spacing-20)` 신설(원본 실측 20 — regular·compact-1 은 24 그대로) |
| `ui-library/src/components/gnb-sub-menu/gnb-sub-menu.example.html` | 세 유형 전수로 교체 — regular(4묶음 5·3·4·5, 제목 있음, selected=4번째 묶음 4번째 항목) · compact-1(6묶음×1개, 제목 없음, selected=마지막) · compact-2(5묶음 2·2·2·2·1, 제목 없음, selected=마지막 묶음) |
| `ui-library/src/components/gnb-sub-menu/manifest.json` | `canonicalStateMap`(Type=regular/compact-1/compact-2) · `notInCanon.columnCount`(유형별 기본 묶음 수) · `htmlContract.root`(`[data-type]`) · `htmlContract.relations`(묶음 구성·Selected 위치를 유형별로 재서술) · `cssContract.documentedDataStates`(`[data-type]`) · `contentSlots.column` 재서술 · `canonicalFingerprint` 재계산 |
| `ui-library/src/components/gnb/gnb.example.html` | 조립 예시의 "서비스" 패널 `data-depth="2depth"`→`data-type="regular"`, "통계" 패널 `data-depth="1depth"`→`data-type="compact-1"`(1컬럼 3항목 구조를 컬럼 3개×1항목으로 재구성 — compact-1 실제 스펙에 맞춤) |
| `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` | 동일 조립 예시 축 갱신 + 기존 "펼쳐진 채 고정된" 단독 패널 데모(옛 2depth 4컬럼 근사치, 열마다 5개 균등)를 **세 유형 전수**(regular·compact-1·compact-2, gnb-sub-menu.example.html 과 동일 마크업)로 교체. `<main>` 안 DOM 완전 동일 확인(python 대조, 21028자 일치) |
| `assets/js/ui-library-guide.js` | `gnbAssembledMarkup()` 의 servicePanel/statsPanel 을 data-type 로 전환. `gnbSubMenuColumnMarkup`·`gnbSubMenuMarkup`·`gnbSubMenuStateMatrix` 를 `GNB_SUBMENU_TYPE_SPEC`(regular/compact-1/compact-2, build-components.ts TYPE_SPEC 표를 그대로 옮김) 기반으로 재작성 — 유형별 묶음 수·항목 수·Selected 위치를 실제 정본값으로 생성. `componentConfig["gnb-sub-menu"]` description/approvedScope 문구 갱신 |
| `pages/ui-review.html` | 같은 두 지점(조립 예시·전수 매트릭스)을 동일하게 갱신. `GNB_SUBMENU_TYPE_SPEC` 상수를 페이지 스크립트에도 복제(선례대로 컴포넌트별 함수 중복 관례). 23번 섹션 안내문·`renderGnbSubMenuPanel` 설명문을 Type 3종 기준으로 재작성 |
| `pages/components.html` | `#gnb-sub-menu` 섹션의 `data-cov-depth="1depth,2depth"` → `data-cov-type="regular,compact-1,compact-2"`(Gate 19 해소 — 정본 축 이름이 `type` 이므로 선언도 그 이름을 써야 대조된다). `#gnb-sub-menu-item` 섹션은 그대로(`data-cov-depth` 유지 — Item 은 축 불변) |
| `registry/components/gnb-sub-menu.json` | `_meta.description`·`anatomy`·`doDont`·`variants`(axis: Depth→Type)·`sizing`(유형별 3행으로 재구성 — padding·columnCount·itemsPerColumn·columnGap·itemGap·selectedAt)·`tokens`(`spacing/20` 항목 추가, 나머지 property 설명을 유형 이름으로 정정) 갱신 |
| `registry/governance/ui-library-migration.json` | `gnb-sub-menu` 레코드의 `note`(옛 "(1depth=항목 목록만·2depth=제목+항목 목록)" 잔존 괄호 제거, 유형별 실측값으로 재서술) · `reverifyTrigger`("Depth"→"Type") |
| `registry/governance/component-presentation-policy.json` | `components["gnb-sub-menu"].extraAxes`(`depth`→`type`, 값 3개) · `changeFromCurrent`·`note` 갱신 |
| `ui-library/scripts/test.mjs` | `gnb-sub-menu` 블록에 `--spacing-20` 토큰 사용 검사, 세 `data-type` 전수 데모 검사, 패널 루트에 옛 `data-depth` 축이 안 남았는지 검사(정규식 `data-s1-component="gnb-sub-menu"\s+data-depth=`) 3건 신설 |

## 2. `data-depth` → `data-type` 이행 방법

패널 루트(`[data-s1-component="gnb-sub-menu"]`)의 축 속성만 이름·값을 바꿨다 — `gnb-sub-menu-item`(항목)의
`data-depth="1depth"/"2depth"` 는 완전히 별개 축이라 모든 파일에서 그대로 남겨뒀다(패널 안 `<li>` 마다 항목의
depth 는 여전히 필요하다). 검색으로 두 축이 안 섞였는지 확인했다 — `data-s1-component="gnb-sub-menu"` 바로
뒤에 오는 속성만 `data-depth` 에서 `data-type` 으로 바뀌었는지 grep 대조(§4).

## 3. 세 유형 실측값 (정본 build-components.ts TYPE_SPEC 을 그대로 코드에 옮김 — 재정의 없음)

| Type | 상/하 패딩 | 묶음 수 | 묶음별 항목 수 | 묶음 사이 | 묶음 안 | 제목 | Selected 자리 |
|---|---|---|---|---|---|---|---|
| `regular` | spacing/32 · spacing/64 | 4 | 5 · 3 · 4 · 5 | spacing/80 | spacing/24 | 있음(1depth Bold) | 4번째 묶음의 4번째 항목 |
| `compact-1` | spacing/24 · spacing/24 | 6 | 1 · 1 · 1 · 1 · 1 · 1 | spacing/80 | — (묶음당 1개) | 없음 | 마지막(6번째) 묶음 |
| `compact-2` | spacing/24 · spacing/24 | 5 | 2 · 2 · 2 · 2 · 1 | spacing/80 | spacing/20 | 없음 | 마지막 묶음의 1개 |

세 유형 공통: 폭 1920(웹은 full-width 반응형) · 좌우 최소 24 + 묶음 전체 가운데 정렬(`justify-content:center`, 묶음은 hug) ·
배경 `color/navigation/bg` · 하단선 1px `color/line/gray/subtle`(`::before` 겹침 레이어) · 그림자 `shadow/dropdown`.
새 색·새 토큰 0건 — `spacing/20` 은 기존 토큰(`vars-data.ts:329`), 32/24/64/80 도 전부 기존.

## 4. 옛 서술 grep 결과 (river 지시 — 두 번 FAIL 난 실패 모양 재발 방지)

`ui-library/src`·`pages`·`assets/js`·`registry` 전체를 `data-s1-component="gnb-sub-menu"` 뒤에 옛 `data-depth` 가
남았는지, "Depth 2변형"·"1depth=항목 목록만" 류 문구가 패널 서술에 남았는지 grep 했다.

- `grep -rn 'gnb-sub-menu"\]\[data-depth\|gnb-sub-menu" data-depth\|data-cov-depth="1depth,2depth"' pages assets registry ui-library/src ui-library/dist` → 남은 것 1건, `pages/components.html:2122` 의 `#gnb-sub-menu-item` 섹션 — **이건 맞다**(Item 자신의 축, 안 바뀜).
- `grep -n 'Depth.*2변형\|Depth 2종\|Depth 2가지' pages/ui-review.html assets/js/ui-library-guide.js pages/components.html` → 남은 것 1건, `pages/ui-review.html:1845` 의 `gnb-sub-menu-item` 6변형(Depth 2종 × State 3종) 설명 — **이것도 맞다**(Item 섹션).
- 패널(`gnb-sub-menu`) 쪽 "Depth"·"1depth=항목 목록만"·"2depth=제목+항목" 잔존 문구는 0건.
- `ui-library/dist/**`(손편집 금지 대상)는 `ui:build` 로 재생성해 자동 반영 — `dist/examples/gnb-sub-menu.html` 에 `data-type="regular"/"compact-1"/"compact-2"` 3개 전부 확인.

## 5. 렌더 확인

`http://127.0.0.1:4173`(기존 미리보기 서버, 죽어있지 않았음)에서 `npm run shot`(`--full-page`, `--force-device-scale-factor=2`
내장)으로 `pages/ui-review.html` 을 캡처해 23번 섹션을 육안 대조했다. `--full-page` 가 요청한 window-size 를 그대로
쓰는 걸 확인해(3000 요청 시 이미지도 3000 스케일) 26000 으로 넉넉히 잡아 캡처했다. 캡처: `/tmp/gnb-sub-menu-type-shots/crop1.png`.

확인된 것 — Light·Dark 둘 다:
- **regular**: 4묶음이 각각 5·3·4·5개로 **다르게** 보인다(2번째 묶음만 3줄로 짧다). 4번째 묶음의 4번째 줄(마지막에서 두 번째)이 파란 글자.
- **compact-1**: 항목 6개가 **한 줄**로 가로 나열되고 마지막 항목만 파란 글자.
- **compact-2**: 5묶음이 각각 **2줄**(마지막 묶음만 1줄)로 보이고, 마지막 묶음의 1줄이 파란 글자.
- 세 유형 모두 묶음 묶음이 **가운데로 모임**(좌우 대칭).
- 21번 GNB 조립 예시("서비스"=regular, "통계"=compact-1)도 같은 화면에서 확인.

## 6. Gate 19 · Gate 34 상태

- **Gate 19 — 해소.** 이전엔 `data-cov-depth="1depth,2depth"` 가 정본 축 이름(`type`)과 안 맞아 `gnb-sub-menu.type` 이
  "미선언"으로 막혀 있었다. `data-cov-type="regular,compact-1,compact-2"` 로 바꾼 뒤 `npm run components:variantcov` 재실행 →
  `VARCOV_SUMMARY pairs=57 verified=57 baselined=0 newGaps=0 resolved=0`, `npm run gate:check` 출력에서 Gate 19 줄 자체가 사라짐(PASS, 침묵).
- **Gate 34 — 신규 0건, 그대로 3건.** `uistate:gnb-sub-menu-item.default/hover/selected` 만 남아 있다(1회차부터 있던 river 승인 대기,
  이번 회차가 만든 것 아님 — `states` 필드·`data-type` 값은 canon-addition-check.js 가 추적하는 "정본 상태 이름" 목록이 아니다).

## 7. 검사기 종료코드 (4회차 전량 재실행)

| 명령 | 종료코드 | 비고 |
|---|---|---|
| `npm run ui:contract` | 0 | |
| `npm run ui:icons` | 0 | 기존 부채 경고 2건(checkbox·edge_set), 무관 |
| `npm run ui:icons:origin` | 0 | 〃 |
| `npm run ui:build` | 0 | 199 files. **부수 영향**: `build-components.ts` 전체 해시가 이번 정본 개편(3회차 이전부터 있던 GNB 영역 변경)으로 바뀌어 이 파일을 `canonicalSources` 에 포함하는 **24개 컴포넌트 전부**(gnb-sub-menu 자신 포함)가 stale 판정됐다(디자인상 파일 단위 해시라 개편 위치와 무관하게 전체가 흔들린다). `git diff -U0 build-components.ts` 로 변경 hunk 가 `buildGNB` 주석·`buildGNBSubMenu` 안에만 있음을 확인(§3 절차대로 "무관" 판단) 후 24개 전부 `canonicalFingerprint` 만 재계산했다(내용은 안 바꿈 — 해시만). `build-components.ts` 자체는 읽기만 했다 |
| `npm run ui:test` | 0 | 신설 3건(spacing-20·세 유형 데모·data-depth 잔존 금지) 포함 |
| `npm run components:facts:check` | 0 | 최초 드리프트 감지(exit 1) → `components:facts:write` 로 재생성 후 0 |
| `npm run components:guide-model:check` | 0 | 48개 정본 일치 |
| `npm run components:behavior:check` | 0 | PC 20개 계약 연결 |
| `npm run design:md:check` | 1 | `design-md-drift-check`(DESIGN.core.md) 는 `design:md:write` 재생성 후 0. `design-md-agent-contract-check`("PC 사이트에 없는 Modal 행동")는 Modal 전용 검사(스크립트 확인 — GNB 무관)라 그대로 실패, 1~3회차와 동일 사전 존재 실패 |
| `npm run gate:check` | 1 | error 59 · warning 14. **Gate 19 는 목록에서 사라짐(PASS) · Gate 34 는 3건 그대로(신규 0)**(§6). 나머지 error 대부분은 build-components.ts 전체 해시 변경의 파급으로 `ui:zip`·`devpanel:gen`·`board:refresh`(Gate 46·47) 재생성 대상이 24개 컴포넌트로 늘어난 것 — 이번 회차와 무관한 배포 마무리 단계라 실행하지 않았다(2·3회차와 같은 판단). Gate 13(`build-components.ts` 검증 기록 없음)은 동시 진행 중인 component-verifier 몫(지시대로 그 파일을 고치지 않았다) |

## 8. 확인 못 한 범위

- Figma 캔버스 실물 대조 — 시각 정본은 코드, 아이콘 0건, 범위 밖(1~3회차와 동일).
- `build-components.ts` 자체의 정본 값(TYPE_SPEC 5·3·4·5 등)이 원본과 맞는지 — 이번 회차는 그 값을 **읽어서 웹에 그대로 옮기기만** 했다. 값 자체의 원본 충실성은 `5-canon-verification.md`(🤖 component-verifier)가 이미 검증했고, 지금 코드에 반영된 값이 그 보고서의 A-1·A-2 수정 반영본과 같음을 확인했다(perGroup [5,3,4,5]·selected [3,3] 등, build-components.ts 직접 판독).
- `pages/components.html` 조립 예시 실제 렌더 — `gnb`·`gnb-sub-menu` manifest `status` 가 여전히 `candidate` 라 이 손관리 화면은 "승인 배포본을 불러오지 못했습니다" 안내만 뜬다(정상, 1~3회차와 동일 패턴). `data-cov-type` 배선은 코드·Gate 19 대조로만 확인, DOM 렌더는 미확인.
- `npm run ui:zip`·`npm run devpanel:gen`·`npm run board:refresh` — 배포 마무리 단계, 실행하지 않음(§7).
- Mobile 뷰포트 — GNB·GNB Sub Menu 둘 다 PC 전용 선언 그대로, 무변경.
- `assets/downloads/s1-ux-design-guide-installer.zip` 가 이번 세션 중 바이트가 바뀐 채 발견됐다 — 내가 실행한 명령 중 이 파일을 직접 건드리는 것은 없었다(grep 대조 확인). 동시 진행 중인 다른 세션(build-components.ts 검증 에이전트)의 부수 효과로 추정되나 **미확인**.

---

## 9. 5회차 — 조립 액션 재구성 (river 지시 2026-09-09 "GNB는 액션 구성을 다시하자")

### "SM" 해석
river 지시 원문 "start형 gnb SM + 레귤러/콤팩트1/콤팩트2"의 "SM"을 **GNB 바 크기 축(`data-size="sm"`)**으로,
"start형"을 **GNB 바 정렬 축(`data-variant="start"`)**으로 읽었다 — 이 컴포넌트의 축이 크기(md·sm·xsm) ×
정렬(center-between·start) 두 개뿐이라 다른 해석 여지가 없다. river 가 다른 뜻이면 값만 바꾸면 된다.

### 무엇이 문제였나 → 무엇으로 바꿨나
기존 조립 예시는 한 상단바 안에서 "서비스"(regular)·"통계"(compact-1)가 **다른 유형**을 열었다 — river 가
"이러면 안되지"로 짚은 지점. 이제는 **하단메뉴 유형에 맞춰 조립 액션을 3벌**로 낸다:

| 벌 | 상단바 | "서비스"·"통계" 둘 다 여는 유형 |
|---|---|---|
| 1 | Start · SM | regular |
| 2 | Start · SM | compact-1 |
| 3 | Start · SM | compact-2 |

한 벌 안에서는 하위메뉴를 가진 메뉴 전부가 같은 유형을 연다 — 이 규칙을 `registry/components/gnb.json` ·
`registry/components/gnb-sub-menu.json` 의 `doDont.dont` 에 새로 넣었다(이전엔 없던 규칙).

### 화면 순서
`assets/js/ui-library-guide.js` 의 "gnb" 섹션 안 블록 순서는 이미 ①조립 → ②GNB 바/메뉴/유틸 설명 순이었고
(코드를 직접 읽어 확인 — 짐작하지 않았다), 별도 "gnb-sub-menu" 섹션(③하위메뉴 설명)이 `pages/components.html`
에서 그 뒤에 온다. 순서 자체는 바꿀 게 없었고, **각 블록의 안내문(`uilg-demo-note`)에 "조립 액션 3벌" ·
"GNB 설명" · "하위메뉴 설명"이라는 이름표를 붙여 이 순서를 명시적으로 드러냈다.** `pages/components.html`
섹션 배치(`<section id="gnb">` → `<section id="gnb-sub-menu">` → `<section id="gnb-sub-menu-item">`)는 이미
①②③ 순서였으므로 손대지 않았다(river 지시대로 "최소만 정확히").

### 고친 파일
- `ui-library/src/components/gnb/gnb.example.html` — 조립 예시를 유형 섞임 없는 3벌로 다시 썼다(regular·
  compact-1·compact-2, 전부 Start·SM). 패널 id 는 벌마다 접두사(a/b/c)로 구분.
- `ui-library/src/components/gnb/manifest.json` — `gnb.json` 편집으로 바뀐 `canonicalFingerprint` 재계산(내용 변경 없음, 해시만).
- `ui-library/src/components/gnb-sub-menu/manifest.json` — 위와 같은 이유로 `gnb-sub-menu.json` 대상 재계산.
- `assets/js/ui-library-guide.js` — `gnbAssembledMarkup()`을 3벌 생성 함수로 재작성(`GNB_ASSEMBLED_TYPE_CONTENT` ·
  `gnbAssembledUnitMarkup` 신설). 안내문 3곳에 "조립 액션"·"GNB 설명"·"하위메뉴 설명" 이름표 추가.
- `assets/css/ui-library-guide.css` — `.uilg-gnb-assembled-item`(벌 사이 여백 전용, 새 시각 규칙 0건).
- `registry/components/gnb.json` · `registry/components/gnb-sub-menu.json` — doDont 에 "한 GNB 안에서는 모든
  메뉴가 같은 유형의 하위메뉴 판을 연다" 규칙 추가.
- `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` — 이 두 파일에 있던
  유일한 "조립" 블록도 서비스·통계가 다른 유형(regular/compact-1)을 열고 있어 같은 유형(regular)으로 통일,
  바 크기·정렬도 Start·SM 으로 맞췄다. 두 파일의 `<main>` 은 여전히 바이트 단위로 동일함을 `diff` 로 확인.
- `ui-library/scripts/test.mjs` — gnb 기술 검사가 예전 고정 id(`gnb-sub-menu-service`/`-stats` 리터럴)만 찾던 걸,
  나브 블록마다 aria-controls 대상 패널의 `data-type`이 전부 같은지 + regular·compact-1·compact-2 세 유형이
  전수 등장하는지로 재작성했다 — 유형 섞임이 생기면 이제 `ui:test`가 직접 잡는다.

### 함정 §2 T5(id 중복) 확인
- `dist/examples/gnb.html`(3벌)을 실제 브라우저에 주입 + `s1-ui.js`의 `gnb.init()`을 세 나브 전부에 실행한 뒤
  `document.querySelectorAll('[id]')` 전수 스캔 — **총 19개 id, 중복 0개**(콘솔 스크립트 실행, 결과 그대로 기록).
- `empty-consumer.html`도 같은 방식으로 **총 12개 id, 중복 0개**.

### 단일 열림 확인
`dist/examples/gnb.html`을 브라우저에 실제로 로드해 세 벌 각각의 "서비스" 메뉴에 `mouseenter`를 보내고 그 순간
`hidden`이 아닌 패널을 전수 스캔했다 — 벌마다 **그 벌 자신의 서비스 패널 하나만** 열렸다(다른 두 벌·다른
메뉴로 새지 않음). `mouseleave` 후 유예 시간이 지나면 세 벌 다 닫힘(재확인). 원시 결과:

```
벌1 hover "서비스" → 열린 패널 = [gnb-sub-menu-a-service] (그 외 열린 것은 id 없는 정적 유형쇼케이스 3개, 항상 열려있는 별개 요소)
벌2 hover "서비스" → 열린 패널 = [gnb-sub-menu-b-service]
벌3 hover "서비스" → 열린 패널 = [gnb-sub-menu-c-service]
mouseleave 400ms 후 → 열린 패널 0개
```

### 캡처
- `reports/ui-library/gnb-sub-menu/screens/5th-assembled-3units.png` — empty-consumer.html(단일 조립, 정적).
- `reports/ui-library/gnb-sub-menu/screens/5th-assembled-3units-open.png` — 3벌 전부를 각자 "서비스" 열어
  나란히 캡처. 위부터 regular(2열·제목 있음) · compact-1(한 줄) · compact-2(2열·제목 없음)이 서로 다른
  모양이면서도 **각 벌 내부는 한 유형으로 일관**됨을 한눈에 볼 수 있다.

### 검사기 종료코드 (5회차)

| 명령 | 종료코드 | 비고 |
|---|---|---|
| `npm run ui:contract` | 0 | |
| `npm run ui:build` | 0 → 199 files. 최초 1회 `gnb canonicalFingerprint is stale` 로 실패 — `gnb.json`을 고쳐 해시가 바뀐 게 원인, manifest 재계산 후 0 |
| `npm run ui:test` | 0 | gnb 기술 검사 신규 로직(유형 섞임 감지·3유형 전수) 포함 재작성 후 통과 |
| `npm run ui:guide:render` | 0 | 컴포넌트 23종 × PC·Mobile |
| `npm run components:facts:check` | 0 | |
| `npm run components:guide-model:check` | 0 | 48개 정본 일치 |
| `npm run components:behavior:check` | 0 | PC 20개 계약 연결 |
| `npm run design:md:write` | 0 | `gnb.json`/`gnb-sub-menu.json` doDont 변경분 반영, DESIGN.core.md 갱신 |
| `npm run board:refresh -- D-18` | 0 | canon-facts.json 25종 갱신, D-18(gnb) 카드 재촬영 |
| `npm run ui:zip` | 0 | |
| `npm run devpanel:gen` | 0 | |
| `npm run installer:build` | 0 | 날짜 드리프트(2026-09-09→10) 해소 |
| `npm run gate:check` | 1 → **error 3건, 전부 Gate 34(uistate:gnb-sub-menu-item.default/hover/selected) — 신규 0건, 1회차부터 있던 river 승인 대기 그대로.** Gate 19 는 여전히 목록에 없음(PASS). 재구성 전(스태시로 되돌려 확인) 대비 새로 생겼던 Gate 6c·24·46·47 error 는 각각 installer:build·design:md:write·ui:zip+devpanel:gen·board:refresh 로 전부 해소했다 |

### 확인 못 한 범위
- `pages/components.html`의 "gnb"·"gnb-sub-menu" 섹션 실제 렌더 — manifest `status`가 여전히 `candidate`라
  이 화면은 "승인 배포본을 불러오지 못했습니다" 안내만 뜬다(1~4회차와 동일한 사전 조건, 이번 회차가 만든 것
  아님). 그래서 브라우저 검증은 `dist/examples/gnb.html`을 직접 주입하는 방식(런타임은 실제 배포본 `s1-ui.js`
  그대로 사용)으로 했다 — 시각·동작은 배포본과 같지만, "components.html 화면 자체"의 렌더는 river 승인 이후
  다시 확인이 필요하다.
- Figma 캔버스 실물 대조 — 이번 회차는 값·구조를 바꾸지 않고 조립 구성만 바꿨으므로 범위 밖(1~4회차와 동일).
- Mobile 뷰포트 — GNB·GNB Sub Menu 둘 다 PC 전용, 무변경.

---

## 6회차 — start 정렬 바 `[data-s1-part="leading"]` 래퍼 누락 수정

### 어디에 빠져 있었나
- `ui-library/src/components/gnb/gnb.example.html` — start·sm 3벌(레귤러/콤팩트1/콤팩트2) 전부, 로고+메뉴가 `<nav>`
  직계 자식으로 나열되고 `leading` 래퍼가 없었다.
- `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` — 조립 표본 1벌, 동일 누락
  (두 파일은 `<main>` 안 DOM이 완전히 같아야 하므로 같은 자리에 같은 모양으로 존재).
- `assets/js/ui-library-guide.js`의 `gnbAssembledUnitMarkup()`(안내 페이지 "조립 표본" 3벌 렌더 함수) — 같은
  누락. 단, 같은 파일의 `gnbMarkup()`(정렬·크기 매트릭스용 단일 바 렌더 함수)은 이미 `leading` 래퍼를 정확히
  넣고 있었다 — 매트릭스는 안전했고 "조립 표본" 쪽만 새었다.

### 왜 생겼나
5회차에서 조립 예시를 "레귤러/콤팩트1/콤팩트2" 3벌로 다시 쓰면서, 이미 있던 `gnbMarkup()`(매트릭스용)을
템플릿으로 베끼지 않고 조립 표본 4곳(example.html·두 verification 픽스처·guide.js 신규 함수)을 손으로 새로
작성했다 — 그 과정에서 `leading` 래퍼(정본 `build-components.ts:3593-3600`, manifest `htmlContract.relations`)가
전부 빠졌다. `ui:test`는 그때 "3유형 전수·단일 유형 일관성"만 검사했고 `leading` 래퍼 유무는 검사하지 않아 통과됐다.

### 고친 파일
- `ui-library/src/components/gnb/gnb.example.html`
- `ui-library/src/verification/empty-consumer.html`
- `ui-library/src/verification/empty-consumer-individual.html`
- `assets/js/ui-library-guide.js` (`gnbAssembledUnitMarkup`)
- `ui-library/scripts/test.mjs` — 재발 방지 검사 추가(아래)

### 로고↔메뉴 간격 실측값
빌드된 `ui-library/verification/empty-consumer.html`을 실제 브라우저에 로드해 `getBoundingClientRect()`로 쟀다.
- start 바: 로고 오른쪽 끝 → 첫 메뉴 왼쪽 끝 = **64px** (수정 전 재현 시도에서는 겹침/음수, 즉 0 취급).
- 안내 페이지 매트릭스용 `gnbMarkup()` 경로(이미 정상이던 곳)는 이번에도 변경하지 않았고, 영향 없음을 확인.
- center-between 바는 이 리포에 leading 래퍼 자체가 없는 축이라 영향권 밖 — 별도 실측 불필요.
- 정본 대조: `plugins/figma-vars-installer/src/build-components.ts:3593-3600`을 직접 읽어 확인 — start 정렬은
  `leading` 프레임(로고+메뉴, `itemSpacing = 64`)에 유틸이 `margin-left:auto`로 붙는 구조이고, center-between처럼
  로고·메뉴·유틸 3분할을 쓰지 않는다. 웹 계약(`gnb.css` 69번째 줄 `[data-s1-part="leading"] { gap: var(--spacing-64) }`)과 일치.

### 새로 넣은 검사
`ui-library/scripts/test.mjs`의 `id === "gnb"` 검사 블록에 추가: `data-variant="start"`인 모든 `<nav>` 블록에서
로고+메뉴가 `<div data-s1-part="leading">…</div>` 안에 들어있는지 정규식으로 확인하고, 없으면 실패시킨다
(메시지: "복붙 그대로면 로고↔메뉴 간격이 0이 된다"). `npm run ui:test`가 이제 이 누락을 잡는다.

### 검사기 종료코드 (6회차)

| 명령 | 종료코드 | 비고 |
|---|---|---|
| `npm run ui:contract` | 0 | |
| `npm run ui:build` | 0 → 199 files |
| `npm run ui:test` | 0 | 신규 leading 래퍼 검사 포함, 통과 |
| `npm run ui:guide:render` | 0 | 컴포넌트 23종 × PC·Mobile |
| `npm run ui:zip` | 0 | 배포 ZIP 재생성(Gate 46 해소) |
| `npm run board:refresh` | 0 | 27칸 재촬영(Gate 47 해소) |
| `npm run gate:check` | 1 → **error 3건, 전부 Gate 34(uistate:gnb-sub-menu-item.default/hover/selected) — river 승인 대기, 신규 0건.** 이전에 있던 Gate 46·47 error는 이번 회차 재생성으로 해소. |

### 확인 못 한 범위
- `pages/components.html`의 gnb 섹션 자체 렌더는 여전히 manifest `status=candidate`라 "승인 배포본 없음" 안내만
  뜬다(river 승인 전까지 5회차와 동일한 제약) — 이번 수정은 `ui-library/verification/empty-consumer.html`(배포본
  런타임 그대로 주입) 기준으로 실측했다.
- Figma 캔버스 실물 대조는 범위 밖(값·구조 변경 0건, 누락 래퍼만 복원).
- Mobile 뷰포트는 GNB가 PC 전용이라 무관.
