# UI Library 3단계 빌드 — Password Field · Search Input

- 작업일: 2026-09-04
- 빌더: 🧱 ui-library-builder
- 앞 단계: `2-canon-readiness.md`(공개 계약·C1~C4·아이콘 확보 완료)
- 판정어 없음 — 이 문서는 무엇을 했고 무엇을 확인했는지만 적는다. PASS·승인 판정은 4-verification(component-verifier)·river 몫이다.

## 요약

Password Field·Search Input을 승인된 Base Input의 옵션으로 조립했다(별도 컴포넌트 신설 없음). 정본 `buildSearch`를 river 승인 근거(D1~D4)대로 변경(C1~C4)했고, 웹 원본(`ui-library/src/components/input`)에 password/search 액션을 추가했다. 아이콘 3종(`eye_hide`·`eye_show`·`search`)은 2-canon-readiness에서 이미 확보·검증돼 있어 그대로 배선만 했다.

**manifest 상태는 `verified`로 두었다** — 자동 기술 검증(아래 표)은 전부 통과했지만, 정본 구조 변경(H1②)에 대한 🤖 component-verifier의 별도 검증과 river UX 승인이 아직 없어 `approved`로 스스로 올리지 않았다.

---

## A. 웹 원본 변경 — `ui-library/src/components/input/`

| 파일 | 변경 |
|---|---|
| `input.css` | password 액션(`data-action=password`, `aria-pressed` 로 eye_hide↔eye_show 마스크 전환) · search 액션(`data-action=search`, 항상 표시) 추가. 트레일 간격: 기본(Password [눈][지우기]) 2px, `[data-mode=search]`([지우기][돋보기]) 4px. Search 돋보기만 Disabled 시 `--color-form-control-icon-disabled` 적용(정본 buildSearch Disabled state 만 icon/disabled 사용, Password 눈은 정본이 상태 무관 icon/default 하나만 써서 그대로 둠) |
| `input.js` | `refresh()`에 `isSearch` 분기 추가 — Search는 `editable && value 있음`(초점 무관)일 때만 clear 노출, Base·Password는 기존대로 `focus-within` 필요. `refreshPassword()` 신설 — type 토글마다 `aria-pressed`·`aria-label` 동기화. `dispatchSearch()` — 돋보기 클릭과 Enter keydown(`!event.isComposing`) 둘 다 같은 `s1:input:search` 이벤트(detail:{value}) 발화. destroy에서 새 리스너 전부 해제. 액션이 마크업에 없으면 해당 경로 자체가 생성되지 않음(선택적 인식) |
| `manifest.json` | version 0.1.0→0.2.0, status `approved`→`verified`(사유는 `statusNote` 필드에 기록). `actions` 필드 신설(clear/password/search 계약). `icons`에 eye_hide·eye_show·search 3종 추가. `a11y`에 passwordVisibility·searchExecute 추가. `javascript.events`에 `s1:input:search`+eventDetail 추가. `htmlContract.relations`에 password/search 관계 추가. `htmlContract.breakExamples`에 password·password-mobile·search·search-mobile 4개 추가(기존 flat 패턴 그대로, `breakName` 을 그대로 파일명 접미사로 사용하는 build.mjs 기존 로직 재사용 — 신규 로직 없음). `dependencies.followUpModules` → `[]`(이번 빌드에 포함됨) |
| `input.example.html` / `input.mobile.example.html` | **무변경** — 기존 승인 Base Input 예시는 그대로 유지 |
| `input.password.example.html` · `input.password-mobile.example.html` (신규) | Password 옵션 PC/Mobile 예시 |
| `input.search.example.html` · `input.search-mobile.example.html` (신규) | Search 옵션 PC/Mobile 예시. `type="text"`로 뒀다(브라우저 기본 `type=search` 취소 버튼이 커스텀 clear 아이콘과 겹치는 것을 피함 — 내 판단, 정본에 명시 없음) |
| `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` | `<main>` 안에 password·search 인스턴스 각 1개 추가(두 파일 완전히 동일하게, id 충돌 없음: `consumer-password`·`consumer-search`) |
| `ui-library/scripts/test.mjs` | `id === "input"` 블록에 회귀 검사 추가 — password type 토글·aria-pressed/aria-label 동기화·eye_hide/eye_show 마스크, search 이벤트 발화·Enter(isComposing 제외)·search.svg 마스크·`[data-mode=search]` 스코프·트레일 간격(2px/4px)·예시 파일들의 액션 순서·mobile break 선언 |

## B. 정본 변경 — `plugins/figma-vars-installer/src/build-components.ts`

**구조 변경이므로 기록하지 않았다.** 아래는 변경 hunk 범위이며, 🤖 component-verifier가 대조할 자리다.

```
git diff -U0 plugins/figma-vars-installer/src/build-components.ts | grep '^@@'
@@ -1125,0 +1126 @@   ICON_KEYS 에 eye_show 키 1줄 추가 (C4)
@@ -1263,0 +1265,2 @@  ~ @@ -1330,2 +1346,2 @@   buildSearch 함수 전체 재작성 (C1~C3)
```

| # | C1~C4 반영 내용 |
|---|---|
| C1 | `sizes` 배열에 `{ size:"MD", brk:"Mobile", h:48, padL:16, padR:0 }` 행 추가 |
| C2 | `states` 4개(Default/Focus/Filled/Disabled) → 3개(Default/Filled/Disabled). Focus 행·caret 제거. Filled 상태가 이제 trail(clear+search)을 낸다(예전엔 Focus 전용) |
| C3 | `wrapAction()` 로컬 헬퍼 신설 — PC 28×28 / Mobile 48×48 hit area로 아이콘을 감쌈(buildInput의 `wrapSuffixAction`과 같은 크기 규칙, hover BOOLEAN 프로퍼티는 추가하지 않음 — registry `suffixAction.hover` 계약이 이미 "각 suffix action의 독립 hit area"로 일반화돼 있어 웹 쪽 generic hover CSS로 충분하다고 판단) |
| C4 | `ICON_KEYS.eye_show` 추가(웹 Password 옵션 표시 중 아이콘) |
| 부수 | `cellAt`/spec 레이아웃을 `SpecOpts`+`decorateSetFlat`에서 `GroupedSpecOpts`+`decorateSetGrouped`(buildInput과 동일 패턴)로 교체 — PC 3사이즈 × Mobile 1사이즈 플랫폼 그룹을 표현하기 위함 |

**컴파일·설치기 빌드는 통과시켰다**(내 몫): `npm run installer:check`(tsc --noEmit) 통과, `npm run installer:build` 통과(esbuild 번들·ui.html 43종 스탬프 정상), `npm run tokens:reconcile` 완료.

## C. registry 변경

| 파일 | 변경 |
|---|---|
| `registry/components/input.json` | `relatedComposedFields`의 search-input·password-field 두 항목 `status: candidate`→`stable`, `states` 값을 실제 웹 계약으로 정정(search: `["default","filled","disabled"]`), `iconNote`를 실제 등록 상태로 정정, D1~D4 인용을 포함한 `webContract` 서브필드 신설 |
| `registry/components/component-behavior.pc.json` | Input 항목의 `source.sourceEvidence`를 죽은 `pages/components.html` 함수 문자열(`setupSearchInputField`·`setupPasswordFieldInput`)에서 실제 `ui-library/src/components/input/input.js`의 문자열로 교체, `source.sourceFile` 신설. `events`·`focus`·`accessibility`에 password/search 항목 추가. `components:behavior:check` 통과(근거 문자열 실재 확인됨) |
| `registry/governance/ui-library-migration.json` | `password-field`·`search-input` 레코드 신설. `kind: "core-component"`, `base: "input"`, `uiLibraryStatus: "draft"`(river 지시대로 — 검증·승인 전) |
| `registry/figma/allowed-remote-keys.json` | `source` 주석의 "installer 아이콘 16키"를 "17키"로 정정(eye_show 추가 반영). 이 파일 수정으로 fingerprint가 바뀌어 `ui-library/src/assets/icons/manifest.json`의 `sourceRegistryFingerprint`도 같이 갱신했다 |

## D. 소비자·등록부

| 파일 | 변경 |
|---|---|
| `pages/components.html` | `setupSearchInputField`·`setupPasswordFieldInput` 함수 + 호출부(`setupRelatedComposedFields`) 제거(대상 마크업 0건이던 죽은 코드). CSS는 `.related-composed-*`·`.s1-input-unit`·`.s1-input-action-btn`·`.s1-suffix-action-group`·`[data-related-field]` 만 제거했고, **같은 블록에 섞여 있던 `.input-clear-btn`/`.s1-input-remove`(Date Picker 등 다른 legacy 화면이 재사용)·`.s1-input-wrap.is-disabled .s1-input-icon`·`.s1-input-field:has([aria-label="달력 열기"])`(Date Picker 전용)는 남겼다** — grep으로 다른 사용처를 먼저 확인한 뒤 제거 범위를 좁혔다. `input` 섹션 mount는 이미 빈 mount 상태였고 손대지 않았다(Password/Search는 같은 섹션 안 하위 블록으로 렌더됨). Gate 11 anatomy check용 `scripts/component-anatomy-check.js`의 Search Input 규칙도 함께 정정(아래 E 참고) |
| `pages/ui-review.html` | "1b. Password Field"·"1c. Search Input" 섹션 신설(PC·Mobile × Light·Dark, 각 섹션 자체 생성 함수로 렌더 — 마크업 문자열 재사용 없음, T5 함정 대응). 헤더 뱃지·안내 문구·footer 텍스트에서 "다음 단계" 문구 제거. `s1:input:search` 리스너 추가해 실행 결과를 화면에 표시 |
| `assets/js/ui-library-guide.js` | `passwordMarkup`·`searchMarkup` 생성 함수 신설(기존 `inputId` 카운터 공유 — id 충돌 없음). `inputStateMatrix()`에 Password Field·Search Input 하위 블록 추가(PC는 `<hr>`로 구분, **Mobile은 구분선 없이** — component-page-template.md §A-5 "크기 한 가지면 유형 사이 가로선 금지" 규칙 때문에 `ui-guide-render-check.js`가 실제로 이 위반을 잡았고 수정함). `s1:input:search` 리스너로 Action 영역에 결과 표시. `componentConfig.input.approvedScope`에 Password/Search 요약 추가 |
| `registry/governance/component-presentation-policy.json` | **변경 없음** — `input` 항목에 이미 `subComponents: ["search","password"]`와 `managedBy: "ui-library-guide"`가 선언돼 있었다(확인만 함) |

## E. 지문·검사

정본(build-components.ts)·registry(input.json)·component-behavior.pc.json이 바뀌면서 아래 파급이 있었다 — **wiring-and-traps.md §3 절차대로 영향 범위를 먼저 확인**했다.

- `input` 매니페스트: canonicalFingerprint 재계산(정상 — 내가 만든 변경)
- **collateral(무관 파급)**: build-components.ts는 파일 전체가 canonicalSources라서, 내용을 손대지 않은 나머지 18개 컴포넌트도 파일 해시가 바뀌어 지문이 stale해졌다. 전부 지문만 재계산했다(내용 재검증은 하지 않음 — wiring-and-traps §3 "무관" 케이스). `component-behavior.pc.json` 편집으로 tab·pagination도 추가로 한 번 더 재계산됐다(그 파일도 이 둘의 canonicalSources라서).
  - **⚠️ `reports/ui-library/password-search-input/workflow-state.json`의 `canonicalInputs`(component-visual·current-behavior-ledger 항목의 sha256, allowed-icons 항목의 sha256)도 이 파급 때문에 실제로는 달라져 있다. 나는 그 파일을 수정하지 않았다 — 다음 단계(4-verification 또는 orchestrator)가 `npm run ui:state`로 확인 후 갱신해야 한다.**
- `scripts/component-anatomy-check.js`: Search Input 규칙이 `State=Focus`(존재하지 않게 됨)를 찾다가 Gate 11이 즉시 실패했다. `State=Filled`(정본 C2 변경과 일치)로 정정하고 `caret` 요구를 뺐다(Focus 캐럿도 함께 제거됐으므로) — 판정 기준 신설이 아니라 내가 만든 C2 변경에 맞춘 정정이라 직접 고쳤다. 🤖 component-verifier가 이 정정도 함께 봐 주면 좋겠다.

### 검사 종료코드

| 검사 | 결과 |
|---|---|
| `npm run installer:check` | ✅ 0 |
| `npm run installer:build` | ✅ 0 |
| `npm run tokens:reconcile` | ✅ 0 |
| `npm run ui:contract` | ✅ PASS · policy=candidate |
| `npm run ui:build:check` | ✅ 164 files |
| `npm run ui:test:check` | ✅ (password/search 회귀 포함) |
| `npm run ui:icons` | ✅ errors=0 (경고 2건은 checkbox·edge_set 기존 부채, 무관) |
| `npm run ui:icons:origin` | ✅ errors=0 warnings=2(threshold=0.015) — 위와 동일 기존 부채 |
| `npm run ui:guide:render` | ✅ 컴포넌트 19종 × PC·Mobile |
| `npm run components:facts:check` | ✅ |
| `npm run components:guide-model:check` | ✅ (43개 일치) |
| `npm run components:behavior:check` | ✅ PC 20개 계약 |
| `npm run design:md:check` | ⚠️ Modal 항목만 실패("PC 사이트에 없는 Modal 행동이 임의 생성됨") — 이번 작업과 무관한 기존 실패, 지시대로 통과로 봄 |
| `npm run ui:zip` | ✅ 333KB · 18종 |
| `npm run devpanel:gen` | ✅ 18종 · 툴 6개 |
| `npm run board:refresh` | ✅ (Gate 47 해소용 — 2회 실행, 두 번째는 status verified 반영 후) |
| `npm run gate:check` | **error 1건**(Gate 13 — 정본 구조 변경 stale, 지시대로 검증자 몫 예외) · warning 14건(전부 기존 무관 부채: Gate 10·16·17·20·28·29·30·32·40·47 D-18 1칸) |

## F. 렌더 확인 · 실측

서버 `http://127.0.0.1:4173` 사용(file:// 미사용).

- `reports/ui-library/password-search-input/screens/ui-review-full-light.png` — ui-review.html 전체, PC·Mobile × Light·Dark 4벌. 눈 아이콘(감김/뜬눈)·돋보기 실제로 그려짐, disabled 시 회색으로 낮아짐 확인.
- `reports/ui-library/password-search-input/screens/components-input-pc-light.png` — components.html Input 섹션(PC). Base Input 아래 Password Field·Search Input 하위 블록이 실제 dist로 렌더됨, 코드탭이 실제 dist 내용을 보여줌.
- `reports/ui-library/password-search-input/screens/components-input-mobile.png` — 같은 섹션 Mobile. 유형 사이 가로선 없음(규칙 준수), 48px hit area 확인.
- `reports/ui-library/password-search-input/screens/components-input-dark.png` — Dark 모드 확인용(참고, `--dark` 플래그가 실제로 인식되지 않아 Light로 찍혔다 — Dark 대조는 ui-review.html 스크린샷으로 대신함).

### 브라우저 실측(javascript_tool로 실제 DOM 조작)

| 항목 | 측정값 |
|---|---|
| Password 토글 클릭 전/후 | `type`: password→text · `aria-pressed`: false→true · `aria-label`: "비밀번호 보기"→"비밀번호 숨기기" · 클릭 후 `document.activeElement === input`: true |
| Search 클릭+Enter | Enter keydown → `s1:input:search` 1회, `isComposing:true`인 Enter → 0회(무시됨), 돋보기 클릭 → 1회. 총 2회 이벤트(정상) |
| Search clear 노출(초점 무관) | 값 입력 후 `input.blur()` → `clearBtn.hidden === false` (Base Input과 다르게 초점 불필요 확인) |
| 트레일 간격 실측(getBoundingClientRect) | Password [눈][지우기] = **2px** · Search [지우기][돋보기] = **4px** — 정본과 일치 |
| 트레일 순서 실측 | Password: `["password","clear"]` · Search: `["clear","search"]` — 정본과 일치 |
| 다중 인스턴스(페이지 내 search 12개) | 인스턴스별 값·clear 표시가 서로 간섭하지 않음(instance 0 값 있음→hidden:false, instance 1 값 없음→hidden:true) |
| Tab vs 포인터 포커스 캐럿(Password 필드) | 키보드 포커스(500ms 이상 경과 후 focus) → 캐럿 끝(8,8) · 포인터다운+setSelectionRange(2)+focus → 캐럿 유지(2,2) — Base Input 규칙이 Password에도 그대로 적용됨 확인 |

## needs-decision

없음. 2-canon-readiness에서 C1~C4·아이콘 조달까지 전부 river 승인 근거로 해소돼 있었다.

## 내가 확신 못 하는 것 (⭐ 자가인증 명시)

- **manifest status를 `verified`로 둔 판단은 내 판단이다.** `candidate`로 두면 `pages/components.html`의 Input 섹션(이미 river 승인된 Base Input 포함)이 통째로 에러 화면으로 바뀌는 걸 확인했고(스크린샷으로 실제 확인), 이를 피하려고 `verified`(statusModel: "기술 검증 통과·river UX 승인 대기")를 택했다. 이 판단이 맞는지는 검증자·river가 봐야 한다.
- **Search `type="text"`(브라우저 기본 `type=search` 미사용)는 정본에 명시가 없는 내 판단**이다(WebKit 기본 취소 버튼과 커스텀 clear 아이콘 중복을 피하려는 목적). 원본이 `type=search` 사용을 요구하는지 확인된 바 없다.
- **Search action에 Figma "Password Action Hover"/"Clear Action Hover" 같은 BOOLEAN 프로퍼티를 추가하지 않았다** — registry의 기존 `suffixAction.hover` 계약이 이미 일반화돼 있다고 판단해서인데, 이 판단이 Gate 13 검증에서 다르게 나올 수 있다.
- Component Anatomy 검사기(`scripts/component-anatomy-check.js`) 정정은 판정 기준 파일을 내가 직접 고친 것이다 — C2 변경에 기계적으로 맞춘 것이라 판단했지만, 판정 기준 자체를 수정한 것이므로 검증자가 다시 봐 주면 좋겠다.
- `ui-library-migration.json`의 새 레코드에 `lastVerified: null`을 넣었다 — 스키마가 요구하는 필드라 값을 채웠는데, null이 허용되는 값인지 확인하지 못했다.
- Mobile에서 Password/Search 하위 블록 사이 시각적 여백이 PC보다 좁아 보인다(가로선을 뺐기 때문 — 규칙 준수 목적). `.comp-action-top`의 48px margin-bottom 외에는 블록 간 여백이 CSS로 명시돼 있지 않다. 기계 검사는 통과했지만 미세한 시각 다듬기가 더 필요할 수 있다.

## 산출물

- 스크린샷: `reports/ui-library/password-search-input/screens/*.png`(위 4개)
- 변경 파일: 위 A~E 표 전체(git status로 확인 가능)
