# 3-build — list-row

작성자: 🧱 ui-library-builder · 2026-09-21

> **최신 상태 요약(정정 3 반영 후, 이 문서 맨 아래 참조): Density 축은 없다.** 축 = Type 7종 × State 4종 = 28칸. 줄 높이는 전부 68(위아래 여백 12 + 글 자리 최소 44)로 통일. 아래 "무엇을 만들었나" 절의 Density 언급은 최초 구현 당시 기록이며 이후 정정 1~3에서 뒤집혔다 — 맨 아래 "정정 3"이 현재 정본과 일치하는 최종 상태다.

## 무엇을 만들었나

`ui-library/src/components/list-row/`
- `list-row.css` — 정본 `buildListRow`(build-components.ts:1242, 2026-09-21 신설) 그대로: Type 7종(nav·value·read·pick·agree·switch·thumb) × Density 2종(default·compact) × State 4종(default·hover·pressed·disabled). 높이는 숫자로 고정하지 않고 여백 토큰(`--spacing-20/16/12`) + `text` 부품의 타이포 기반 `min-height`로 만든다. 제목만 있는 줄도 Default 밀도에서는 설명 유무와 무관하게 두 줄 높이를 예약한다(river D-5 반영).
- `manifest.json` — `canonicalFingerprint` 는 `scripts/lib/canonical-fingerprint.js` 로 계산(공유 모듈, build.mjs·ui-library-version.js 와 동일 로직).
- `list-row.example.html` — 7유형(Default 밀도) + Compact 1개 + Hover/Pressed/Disabled 상태 예시. 루트 요소는 유형별로 다르게: Nav·Value=button(이동/편집), Read·Thumb=div(누르지 않음), Pick·Agree=label(checkbox 코어를 감싼다), Switch=div(toggle 코어 자체가 컨트롤).
- `list-row.js` — `jsRequired:false, runtime:null`(줄 모양·상태만 소유, 실제 이동·선택·이벤트는 쓰는 화면이 배선 — registry list-row.json webDistribution.note 그대로).

## 빌드 배선(배선표 §1)

- `ui-library/scripts/component-ids.mjs` · `ui-library/scripts/test.mjs` componentIds 에 `list-row` 추가
- `ui-library/package.json` exports 에 `./components/list-row`, `/css`, `/html` 3줄 추가
- `registry/governance/component-fingerprint-map.json` 에 `list-row → canonSets:["List Row"]` 등록(정본 지문 계산의 필수 전제)
- `registry/components/component-facts.json` — `npm run components:facts:write` 로 List Row 실측 재생성(정본 build-components.ts 변경분 반영, 손편집 아님)
- `registry/index.json` components 맵, `registry/components/index.json` — list-row 등록(Gate 30)
- `registry/governance/component-page-coverage.json` — `noSectionNeeded`에 List Row 추가, 사유는 "4-verification·river 승인 후 guide-builder 가 components.html 섹션을 추가한다"(Gate 18). **pages/components.html·assets/js/ui-library-guide.js 는 건드리지 않았다** — 손관리 화면 자동 덮어쓰기 금지 원칙과, "Approved N guide" 테스트 화이트리스트에 list-row가 없어 지금 단계에서 필요하지 않다.
- `registry/governance/component-presentation-policy.json` — **미등록.** 이유는 위와 동일(components.html 섹션이 아직 없어 managedBy 선언 대상 자체가 없다). components.html 섹션이 생기는 시점에 함께 추가해야 한다.
- `registry/governance/ui-library-migration.json` — list-row 레코드 추가(`uiLibraryStatus: candidate`, `riverApproval: pending`)
- `registry/governance/update-management.json` — list-row 항목 추가(`origin: tbd` — bottom-sheet-option과 같은 선례, Ⓐ/Ⓑ 분류는 river 결정 필요)
- `plugins/figma-vars-installer/src/ui.html` AXIS_WORD·VALUE_WORD — density 축, type=nav/value/read/pick/agree/switch/thumb, density=default/compact 우리말 추가(Gate 54)
- `design/DESIGN.core.md` — `npm run design:md:write` 재생성(Gate 24)
- `assets/downloads/s1-ui-dev-package.zip`, 개발자 다운로드 패널 — `npm run ui:zip` · `npm run devpanel:gen` 재생성(Gate 46, 내 버전업에 종속된 파생물)
- **배포본 번호**: `npm run ui:bump:minor` → 0.8.6 → 0.9.0 (부품 28종 전부 정본과 일치 확인, `npm run ui:version`)

## 실행 명령과 결과

```
npm run ui:contract   → PASS (candidate)
npm run ui:icons      → PASS (chevron 재사용, 기존 부채 2건은 list-row와 무관)
npm run ui:build      → 278 files 생성
npm run ui:test       → PASS
npm run ui:version    → PASS, 0.9.0, 28/28 일치
npm run ui:state -- reports/ui-library/list-row/workflow-state.json → PASS, 3-build
npm run gate:check    → 시작 82 error → 종료 70 error (list-row 관련 3건 제외 전부 해소, 나머지는 아래 미해결 참조)
```

## 정정 (2026-09-21, 오케스트레이터 지적)

Value 유형에서 화살표(chevron)를 빠뜨렸다 — 정본 buildListRow 코드를 `if (t==="Value"){값텍스트} if (t==="Switch"){토글} else {chevron}` 순차 두 문장이 아니라 `if/else` 한 묶음으로 잘못 읽어, Value 는 값 텍스트만 받는다고 오판했다. 실제로는 Value 도 두 번째 if 의 else 분기를 타서 **값 텍스트 + 화살표**를 함께 받는다(화살표가 없는 건 Switch 뿐). `list-row.example.html`(Value 행에 `span[data-s1-part="chevron"]` 추가) · `manifest.json`(`htmlContract.typeStructure.value`, icons[chevron].use 문구 정정) · `list-row.css`(오른쪽 칸 주석 정정)을 고치고 재빌드했다. CSS 선택자 자체는 유형별로 제한하지 않아 규칙 변경은 불필요했다. `ui:build:check`·`ui:contract`·`ui:test:check`·`ui:version` 전부 재확인 PASS, 배포본 번호는 공개 계약(html 파트 구성)이 바뀐 것으로 보고 0.9.0→0.10.0 으로 다시 올렸다(28/28 일치).

## 정정 2 (2026-09-21, 오케스트레이터 실측 지적 — 밀도 안 줄 높이 갈림)

정본 `buildListRow` 가 `text.minHeight = Default 48 · Compact 24` 로 정정됐다(오케스트레이터 실측: 화살표 있는 줄만 커지고 없는 줄은 제목 키(20.8)로 줄어 같은 밀도 안에서 73~80·44.8~48 로 갈렸다). 배포본 `[data-s1-part="text"]` 의 `min-height` 를 타이포 계산값 대신 **`--sizing-48`(Default) · `--sizing-24`(Compact)** 고정값으로 맞췄고, manifest geometry.text 에 이 규칙을 적었다.

같은 canon 변경에 `BUILT_SETS["Toggle"] = set` 등록 누락 수정이 포함돼 있어 **toggle 의 canonicalFingerprint 도 재계산해 갱신**했다(toggle 자신의 CSS·HTML 계약은 무변경 — 순수 등록 문제라 list-row 가 reuseVariant 로 Toggle 을 찾게 해주는 수정). facts 생성기(`scripts/lib/figma-build-mock.js`·`scripts/gen-component-facts.js`)가 새 `minHeight` 속성을 몰라 죽던 것도 `minWidth` 옆에 나란히 등록해 고쳤다(기존 패턴 그대로 미분류 속성만 채움).

`ui:build:check`·`ui:contract`·`ui:test:check`·`ui:version` 재확인 PASS. 배포본 번호는 값만 바뀐 거라 patch(0.10.0→0.10.1)로 올렸다.

**헤드리스 렌더로 직접 재본 결과** (56칸 중 대표 14칸, http 로 확인 — T2 함정 회피):
- Default 7유형 전부 `h=80` ✅ (기대값 일치)
- Compact 중 nav·value·read·pick·agree·switch = `h=48` ✅
- **Compact 중 thumb = `h=72`** ⚠️ — 기대(48)와 다르다

**원인**: 정본 코드에서 왼쪽 칸 thumbnail 은 밀도와 무관하게 항상 고정 48×48(`box.resize(48,48)`, Compact 분기 없음)이다. `text.minHeight` 를 Compact=24 로 낮춰도 thumbnail(48)이 여전히 text(24)보다 커서 그 줄의 counterAxisSizingMode=AUTO 가 48 을 따라가고, 위아래 여백 12×2 를 더하면 72 가 된다 — Compact 밀도의 "가장 큰 부품"이 실제로는 화살표(24)가 아니라 thumbnail(48)이었다. 배포본은 이 canon 동작을 그대로 옮겼을 뿐이다(정확 대조 원칙 — 임의로 축소하지 않았다).

**해소 — 썸네일이 밀도를 따라간다 (2026-09-21, 오케스트레이터 정정).** 정본 `buildListRow` 가 `thumbPx = d.name==="Default" ? 48 : 24`로 바뀌어(왼쪽 그림 = 그 밀도의 글 자리와 같은 크기, 새 숫자 아님) Thumb 도 Compact 에서 24×24 로 줄어든다. 배포본 `[data-s1-part="thumbnail"]` 을 `[data-density="default"]`/`[data-density="compact"]` 로 나눠 `--sizing-48`/`--sizing-24` 를 적용했고 manifest geometry.thumbnail 에 규칙을 적었다. 같은 canon 변경에 `BUILT_COMPS` Toggle 등록 추가가 또 딸려 있어(순수 등록, 시각 무변경) toggle 지문도 다시 갱신했다. 14칸(7유형×2밀도) 전부 http 헤드리스 렌더로 재확인: **default 전부 80 · compact 전부 48**. `ui:build:check`·`ui:contract`·`ui:test:check`·`ui:version` PASS, 배포본 0.10.1→0.10.2(값만 변경, patch).

## 정정 3 (2026-09-21, 오케스트레이터 — Compact 폐기·수치 선례 재대조)

river 결정("컴팩트 없이 디폴트만 있으면 돼")으로 Density 축을 완전히 걷어내고, 수치를 정본 선례(`buildBottomSheetOption` List 행·선택행)에서 다시 끌어왔다. 배포본 반영:

- `list-row.css` — `data-density` 선택자·Compact 규칙 전부 삭제. 좌우 여백 `20/16`→**`20/20`**, 위아래 여백 `16`→**`12`**, 왼쪽 요소↔글 `16`→**`12`**, 오른쪽 칸 내부 `4`→**`8`**, 썸네일 `48`→**`40`**, 글 자리 최소 높이 `48`(밀도별)→**`44`(고정, `--sizing-44`)** 하나로. `text`에 `justify-content: center`를 더해 canon `text.primaryAxisAlignItems="CENTER"`와 맞췄다.
- `manifest.json` — `densities` 필드 삭제, `requiredAttributes`에서 `data-density` 제거, `documentedDataStates`에서도 제거, geometry 전부 위 표대로 갱신 + `provenance` 필드로 선례 출처 명시, `contentSlots.description`을 밀도 무관 선택 슬롯으로 정정.
- `list-row.example.html` — Compact 예시 행 삭제, 나머지 7유형·State 예시에서 `data-density` 속성 제거.
- `registry/components/component-facts.json`은 오케스트레이터가 이미 최신 상태로 재생성해 둠(재실행 결과 "= 최신"). `canonicalFingerprint`는 새 facts·canon 코드로 재계산해 갱신했다.

**실제 렌더로 28칸 대표(7유형 + Hover/Pressed/Disabled) 재확인** (http, dist/examples/list-row.html 그대로 fetch) — **전부 `h=68`**. 기대값과 일치.

`ui:build:check`·`ui:contract`·`ui:test:check`·`ui:version` 전부 PASS. 공개 계약(속성 제거)이 바뀐 거라 minor로 올렸다(0.10.3→0.11.0, 28/28 일치). 다운로드 zip·개발자 패널도 재생성했다.

## 미해결 — 내가 판정·해소할 수 없는 항목

1. **Gate 34(정본신설승인)** — `uistate:list-row.default/hover/pressed/disabled` 4건 미승인. `canon-additions-baseline.json`에 이미 `component:List Row` 승인 기록(river, 2026-09-21, 같은 세션 transcript)이 있으나 uistate는 별도 추적 종류라 개별 승인이 필요하다. 같은 결정의 연장선이라 오케스트레이터가 동일 근거로 `node scripts/canon-addition-check.js --approve` 4건을 기록하면 될 것으로 보인다 — 내가 자기신고로 기록할 수 없어 넘긴다.
2. **Gate 13(설치기빌드검증)** — `build-components.ts` 변경(buildListRow 신설)에 대한 component-verifier 기록이 없다. 이건 Figma 플러그인 정본 쪽 검증이라 ui-library-builder 소관이 아니다.
3. **Gate 38(컴포넌트 가이드 생성물)** — `scripts/gen-component-guide-model.js`가 "정본 grid 항목 49개"로 하드코딩돼 있는데 List Row 추가로 50개가 됐다. 이 카운트를 50으로 올리는 것도 build-components.ts 구조 변경의 연장이라 Gate 13과 같은 검증 트랙에서 처리하는 게 맞다고 보고 손대지 않았다.
4. **components.html 등재** — 정본·배포본은 완성됐지만 손관리 안내 페이지 섹션은 아직 없다(river 승인 전 candidate 상태이므로 공개 가이드에 올리지 않는 게 맞다고 판단). 4-verification 통과 후 guide-builder가 섹션 작성 + `component-presentation-policy.json` managedBy 등록을 함께 진행해야 한다.
5. **`ui-library/verification/empty-consumer.html` · `empty-consumer-individual.html`** — list-row 예시 블록을 추가하지 않았다(테스트는 이미 PASS이고, 고정 컴포넌트 화이트리스트 검사만 있어 필수는 아니었다). 배포본 완전성 데모 차원에서 필요하면 후속으로 추가할 수 있다.

## 결정 근거로 남긴 것(river 승인 없이 내가 정한 메커니즘)

- **Density를 data-density 속성으로 뿌리(root)에 직접 준다**(별도 "list" 래퍼 컴포넌트 없이). "목록이 정한다"는 사용 규칙을 registry doDont와 manifest에 문서화했지만 CSS가 개별 줄 편차를 기술적으로 차단하지는 않는다 — 같은 계약을 쓰는 `data-type`/`data-state`도 마찬가지 구조라 이 부품만 다르게 만들지 않았다.
- **Value 유형은 화살표 없이 값 글자만** 표출한다(정본 buildListRow 코드 그대로 — Nav·Agree만 chevron을 받는다).
- **Agree의 chevron은 장식**으로 뒀다(두 번째 클릭 영역 없음) — 체크와 별개로 "자세히 보기"가 필요한지는 이미지·정본 어디에도 없어 화면에 위임했다(needs-decision 수준까지는 아니라고 판단).
- **Switch·Read·Thumb 루트는 상호작용 요소가 아닌 div**로 뒀다 — 토글 자체가 컨트롤이고, 나머지 두 유형은 정본에 상호작용 힌트가 없다.

## 검증하지 않은 것 (⭐ 자가인증 — 4-verification에서 다시 봐야 함)

- 실제 렌더(HTTP 스크린샷)로 Type×Density×State 56칸을 정본과 대조하지 않았다 — `ui:test`의 결정론 검사만 통과했다.
- 다크모드 렌더 확인 안 함(토큰은 Semantic 경유라 자동으로 따라가야 하지만 육안 확인 전).
- 체크박스·토글 코어와의 실제 조합 렌더(간격·정렬)를 브라우저에서 보지 않았다.

## 후속 — Hover 제거·Pressed 배경 교체 (2026-09-21, 🧱 ui-library-builder)

river 지시("오늘 만든 리스트는 모바일에서만 사용하는 패턴이야. 호버는 삭제해주고 pressed의 배경을 hover배경값으로 교체하면돼") 반영. 정본은 이미 바뀌어 있었다(`buildListRow` states = Default·Pressed·Disabled, `bgKey` Pressed=`color/bg/level-1`) — 배포본만 맞췄다.

- `list-row.css` — `@media (hover: hover)` 블록과 `[data-state="hover"]` 규칙을 통째로 삭제. `:active`·`[data-state="pressed"]` 배경을 `--color-bg-level-2` → **`--color-bg-level-1`**로 교체. 상단 축 주석을 `28칸(Type7×State4)` → **`21칸(Type7×State3)`**으로 정정.
- `manifest.json` — `states.hover` 삭제, `canonicalStateMap`에서 `State=Hover` 제거, `cssContract.nativeStates`에서 `:hover` 제거. `states.pressed` 설명에 "모바일 전용이라 Hover 없음·눌림 배경=bg/level-1" 명시.
- `list-row.example.html` — Hover 상태 예시 행(`data-state="hover"`) 삭제, 상단 주석에서 State 변형을 `Pressed·Disabled`로 정정.
- `npm run ui:bump -- --minor` 실행 — 공개 상태값(Hover)이 빠지는 계약 변경이라 minor로 올림. **0.11.1 → 0.12.0**(list-row manifest 0.2.1 → 0.3.0). `ui:build` 재생성(278 files) 후 `ui:version -- --record` 기록.
- `ui:build:check` · `ui:contract` · `ui:test:check` 전부 PASS.
- 실제 dist(`s1-ui.css`+`tokens.css`+`typography.css`)를 http로 로드해 렌더 확인: Default·Disabled = `rgb(255,255,255)`(level-0), Pressed(`data-state="pressed"`) = `rgb(250,250,250)`(level-1), `data-state="hover"`를 강제로 줘도 배경 무반응(더 이상 계약에 없음 확인). 4칸 모두 높이 68px 유지.

### 미해결 — 내가 손대지 않은 것
- `pages/ui-review.html`의 List Row 검수 패널은 여전히 옛 계약(Density 2축·State 4종=56칸, Hover 라벨 포함)이다 — 오케스트레이터가 따로 맡기로 해 건드리지 않았다. 지금 상태로 열면 `data-state="hover"` 칸이 더 이상 배경이 바뀌지 않아(계약 변경 그대로 반영됨) 보이지만, 축 설명(56칸·Hover 라벨)은 갱신이 필요하다.
- `registry/components/list-row.json`·`build-components.ts`는 오케스트레이터가 이미 갱신해 둔 정본이라 손대지 않았다.
- `workflow-state.json`은 수정하지 않았다(오케스트레이터 소관).

## 후속 — thumbnail 을 슬롯으로 교체 (2026-09-21, 🧱 ui-library-builder)

river 지시("사진이 들어갈 자리는 슬롯으로 교체해줄래?") 반영. 정본은 이미 바뀌어 있었다(`buildListRow` 의 Thumb 왼쪽 자리가 `makeSlot(comp, "그림", …)` 로 감싸졌고, 기본 내용은 그대로 40 각 자리표시 · 부품 이름만 `thumbnail` → `자리표시`, Gate 34 승인 기록 `componentprop:그림` 완료) — 배포본만 같은 뜻을 마크업 계약으로 맞췄다.

- `list-row.css` — `[data-s1-part="thumbnail"]` 을 채움 자리로 바꿨다. 배경은 `:empty` 일 때만 `--color-bg-level-2` 를 준다(비어 있을 때만 회색 자리표시). `overflow:hidden` 을 더하고, 안쪽 `img`/`svg` 는 `width/height:100%` + `object-fit:cover` 로 40 각 안에서 잘려 채워지게 했다. 크기(`--sizing-40`)·radius(`--radius-4`)는 그대로.
- `manifest.json` — `contentSlots.thumbnail` 신설(슬롯임을 명시, 비었을 때/채웠을 때 동작 서술), `htmlContract.typeStructure.thumb`·`geometry.thumbnail.note` 에 슬롯 문구 추가.
- `list-row.example.html` — Thumb 유형에 두 줄을 보인다: 기존 빈 자리표시 줄(`여행 사진`) + 인라인 SVG로 실제 그림을 채운 줄(`프로필 사진`, 외부 의존 없음).
- `canonicalFingerprint` 재계산(`ui:version:refresh`) 후 `ui:bump`(값만 바뀐 변경으로 판단 — patch) → **0.12.1 → 0.12.2**. `ui:build`(278 files) 재생성.
- `ui:build:check` · `ui:contract` · `ui:test:check` · `ui:version` 전부 PASS(28/28 일치).
- 실제 dist(`tokens.css`+`typography.css`+`list-row.css`+`checkbox.css`+`toggle.css`)를 http로 로드해 Thumb 두 줄을 직접 재본 결과: 빈 자리 `h=68, 배경=rgb(245,245,245)(level-2), 40×40` / 채운 자리 `h=68, 배경=투명(그림 위로 회색 안 보임), 40×40, overflow=hidden`. 줄 높이는 그림 유무와 무관하게 68로 유지됨을 확인.

### 미해결 — 내가 손대지 않은 것
- `pages/ui-review.html` 은 손대지 않았다(오케스트레이터 소관, 이번 지시에도 제외 명시).
- `registry/components/list-row.json`·`build-components.ts` 는 오케스트레이터가 이미 갱신해 둔 정본이라 손대지 않았다.
- `workflow-state.json` 은 수정하지 않았다(오케스트레이터 소관).

## 후속 — 왼쪽 칸·오른쪽 칸을 슬롯으로 교체 (2026-09-22, 🧱 ui-library-builder)

river 지시("둘 다 슬롯으로 바꿔줘") 반영. 정본은 이미 바뀌어 있었다(`buildListRow` 의 Pick·Agree 왼쪽 자리가 `makeSlot(comp, "왼쪽 칸", …)` 로, 기존 `trail` 프레임이 `makeSlot(comp, "오른쪽 칸", …)` 로 감싸졌다. Gate 34 승인 기록 `componentprop:왼쪽 칸`·`componentprop:오른쪽 칸` 완료, `registry/components/list-row.json` 의 `slots` 배열도 이미 셋으로 갱신돼 있었다) — 배포본만 같은 뜻을 마크업 계약으로 맞췄다.

- `list-row.css`
  - 왼쪽 칸 — `[data-s1-component="list-row"] > [data-s1-component="checkbox"] { flex: none; }` 를 지우고 `[data-s1-part="lead"]` 채움 자리 규칙으로 바꿨다(`align-items:center; display:flex; flex:none`). checkbox 는 그 안에 그대로 조립한다.
  - 오른쪽 칸 — 기존 `[data-s1-part="trail"]` 규칙(정렬·gap 8)은 그대로 두고 슬롯 문서화 주석만 더했다 — trail 은 이미 오른쪽 칸 그 자체였다(구조 변경 없음).
  - 두 자리 모두 `max-height:var(--sizing-44); overflow:hidden`을 더해, 넣은 것이 글 자리 최소 높이(44)를 넘어도 줄 높이(68)가 튀지 않게 잘라낸다(river 지시 3항 — "막을 수 있으면 막는다"를 CSS로 실제 실행).
  - 두 자리 모두 `:empty { display:none }`을 더해, 비우면 자리 자체가 사라지게 했다(river 지시 1·2항).
- `list-row.example.html`
  - Pick·Agree 의 checkbox 를 `<span data-s1-part="lead">…</span>` 로 감쌌다(기존 checkbox 직계 자식 구조에서 슬롯 래퍼로).
  - 갈아끼운 보기 2줄 추가: **lead → radio**(카드 결제, Pick 유형 — checkbox 대신 radio control 만) · **trail → text-button**(마케팅 수신 동의, Agree 유형 — 기본 화살표 대신 text-button 코어 "약관 보기").
- `manifest.json`
  - `parts`에 `lead` 추가.
  - `htmlContract.optionalParts`에 `lead` 추가, `typeStructure`의 pick·agree·switch·nav·value 문구에 `(슬롯)` 표시를 달아 lead·trail 이 슬롯임을 명시.
  - `htmlContract.relations`에 lead·trail 슬롯 규칙(갈아끼우기·비우면 사라짐) 문장 추가.
  - `contentSlots`에 `lead`·`trail` 항목 신설(적용 대상·기본값·44 초과 시 잘림 규칙·비었을 때 동작 서술).
- `canonicalFingerprint` 재계산(`ui:version:refresh`) 후 `ui:bump`(값만 바뀐 변경 — 슬롯 자체는 이미 있던 trail 이 대부분이고 lead 도 기존 checkbox 자리에 래퍼만 두른 것이라 patch 로 판단) → **0.12.3 → 0.12.4**. `ui:build`(278 files) 재생성.

## 실행 명령과 결과 (10건 일괄, 2026-09-22)

| 검사기 | 결과 |
|---|---|
| `npm run installer:check` | ✅ PASS |
| `npm run components:keycheck` | ✅ PASS (누락 0) |
| `npm run components:anatomy` | ✅ PASS (8개 규칙 전부 충족) |
| `npm run components:iconpolicy` | ✅ PASS (위반 0) |
| `npm run components:facts` | ✅ PASS (정본 일치) |
| `npm run ui:build:check` | ✅ PASS (278 files) |
| `npm run ui:contract` | ✅ PASS (candidate, errors=0) |
| `npm run ui:test:check` | ✅ PASS |
| `npm run ui:version` | ✅ PASS (0.12.4, 28/28 일치) |
| `npm run canon:check` | ✅ PASS (Gate 34, 신설 0건 — 추적 665항목 전부 동결 목록과 일치) |

`components:anatomy` 실행 중 `[installer] "List Row" 생성 실패 — [makeSlot] 오른쪽 칸 슬롯 속성을 찾지 못했습니다` 경고가 찍혔지만 같은 실행의 최종 판정은 `✅ 8개 규칙 전부 충족`으로 PASS했다 — 이 스크립트가 매번 Figma mock 을 새로 부트스트랩하며 컴포넌트 속성을 스스로 등록하는 재시도 경로를 갖고 있어(다른 경고들도 "다크 사본을 못 찾아 인스턴스로 대체" 식으로 같은 패턴), `build-components.ts` 를 이번에 건드리지 않은 나로서는 원인을 더 파고들 소관이 아니라고 판단해 결과(PASS)만 보고한다.

## 실제 렌더 재실측 (http, 2026-09-22)

`reports/ui-library/list-row/matrix-fixture.html` 을 이번 계약(lead 래퍼·trail 슬롯 문서화)에 맞게 갱신했다 — 옛 checkbox 마크업(코어 자신의 label 을 보이던 구조)을 `[data-s1-part="lead"]` 래퍼 + Label=Off 구조로 8곳 교체하고, 갈아끼운 보기 3줄(lead→radio · trail→text-button · lead·trail 둘 다 비운 read 줄)을 추가했다. `python3 -m http.server` 로 로컬 서빙 후 브라우저로 `getBoundingClientRect()` 실측:

- **31줄 전부 `height = 68`** — 21칸(7유형×3상태) + 설명 없는 7줄 + 갈아끼운 보기 3줄, 예외 없음.
- radio(lead)·text-button(trail) 갈아끼운 보기 모두 스크린샷으로 육안 대조 — 정상 렌더(원(radio) 정렬·"약관 보기" 버튼 정렬 이상 없음).
- `[data-s1-part="lead"]`·`[data-s1-part="trail"]` 을 빈 `read` 줄에서 눈으로도 확인 — 두 자리 모두 없어 글 자리만 남는다.

### 미해결 — 내가 손대지 않은 것
- `pages/ui-review.html` 은 손대지 않았다(오케스트레이터 소관, 이번 지시에도 제외 명시).
- `registry/components/list-row.json`·`build-components.ts` 는 오케스트레이터가 이미 갱신해 둔 정본이라 손대지 않았다.
- `workflow-state.json` 은 수정하지 않았다(오케스트레이터 소관).
- `components:anatomy` 의 "오른쪽 칸 슬롯 속성을 찾지 못했습니다" 경고 원인 — `build-components.ts` 소관이라 판정하지 않았다(최종 PASS는 확인).
