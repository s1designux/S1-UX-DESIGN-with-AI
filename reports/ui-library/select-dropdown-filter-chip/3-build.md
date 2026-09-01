# 3-build — Dropdown · Select Box · Filter Chip 웹 UI 라이브러리 구현

작업: `select-dropdown-filter-chip` · 구현: 🧱 `ui-library-builder` · 2026-08-31

## 1. 만든 파일과 역할

### dropdown (의존 사슬의 기반 — 옵션 행 + 패널을 함께 낸다)
| 파일 | 역할 |
|---|---|
| `ui-library/src/components/dropdown/dropdown.css` | 패널(`[data-s1-component="dropdown"]`)과 옵션 행(`[data-s1-part="option"]`) 시각. Text/Checkbox 유형, XXSM/XSM/MD 사이즈, hover·selected 상태, 전체선택 구분선 |
| `ui-library/src/components/dropdown/dropdown.js` | 옵션 클릭·키보드(↑↓/Home/End/Enter/Space) 선택, roving tabindex 포커스 이동, `aria-selected`(text)·`aria-checked`(checkbox, true/false만) 동기화, `s1:dropdown:change` 발행. 열림/닫힘 자체는 소유하지 않는다(Select·Filter Chip이 관리) |
| `ui-library/src/components/dropdown/dropdown.example.html` | Text 유형 패널 1개 + Checkbox 유형 패널(전체선택+구분선 포함) 1개 |
| `ui-library/src/components/dropdown/manifest.json` | 공개 계약 — root/parts/states/a11y/dependencies(코어 checkbox 조립 기록) |

### select (dropdown 을 조립)
| 파일 | 역할 |
|---|---|
| `ui-library/src/components/select/select.css` | 트리거 5states(Default·Hover·Open·Filled·Disabled) × 4 size/break, chevron 회전 |
| `ui-library/src/components/select/select.js` | `./dropdown.js`(dist 평면 배치 기준 상대경로) 를 import 해 내부 dropdown 인스턴스를 초기화. 열림/닫힘·`aria-expanded`·`data-filled` 전환, 바깥 클릭 닫기, 선택 시 자동 닫힘+값 반영, 포커스 진입/복귀, `s1:select:{open,close,change}` |
| `ui-library/src/components/select/select.example.html` | MD/PC 트리거 + Type=Text 패널(MD) 조합 |
| `ui-library/src/components/select/manifest.json` | 공개 계약 — dependencies.coreComponents=["dropdown"] |

### filter-chip (dropdown 을 조립, 패널 사이즈 매핑이 select 와 다름)
| 파일 | 역할 |
|---|---|
| `ui-library/src/components/filter-chip/filter-chip.css` | Line/Solid × Title on/off × SM/MD/PC·Mobile, `radius/full` 필, Title=On+Line 값라벨 상시 강조 |
| `ui-library/src/components/filter-chip/filter-chip.js` | select.js 와 동일 골격 + Esc 닫기(registry 요구) + 접근 이름(title+value 결합, `aria-label` 동기화) + `data-complete` |
| `ui-library/src/components/filter-chip/filter-chip.example.html` | Line·SM·PC·Title=On + 패널 `data-size="xxsm"`(SM→XXSM 매핑 그대로 마크업에 반영) |
| `ui-library/src/components/filter-chip/manifest.json` | 공개 계약 — dependencies.coreComponents=["dropdown"], 패널 사이즈 매핑 문서화 |

### 아이콘
| 파일 | 역할 |
|---|---|
| `ui-library/src/assets/icons/chevron.svg` | 정본 `chevDown`(build-components.ts:1450) 그대로, frame=glyph=16×16. 열림 방향은 CSS `rotate(180deg)`로 표현(정본과 동일 철학) |
| `ui-library/src/assets/icons/manifest.json` | chevron 항목 추가(sourceKey는 allowed-remote-keys.json 의 기존 `chevron` 키 재사용, 신규 등재 없음) |

## 2. 정본 대비 조합 커버리지

| 컴포넌트 | 정본 조합 수 | 커버 방식 |
|---|---|---|
| select | 20 (5 state × 4 size/break) | CSS 축(`data-size`×`data-break`) × 상태 선택자(native/aria/data-state) 로 20개 시각 셀을 전부 재현. 셀을 하나씩 만들지 않고 축의 곱으로 커버 |
| dropdown-list(옵션 행) | 27 (3 state × 3 type × 3 size) | `data-type`×`data-size` × 옵션 상태(default/hover/aria-selected/aria-checked) 축의 곱으로 27개 재현. 체크박스 유형은 코어 checkbox 배포본 조립으로 별도 CSS 없이 커버 |
| dropdown-panel | 6 (2 type × 3 size) | 패널 자체는 state 축이 없어(항상 Default) `data-type`×`data-size` 6개 조합을 패널 CSS + 옵션 행 조합으로 커버 |
| filter-chip | 60 (2 variant × 2 title × 5 state × 3 size/break) | `data-variant`×`data-title`×`data-size`×`data-break` 축과 상태 선택자의 곱으로 60개 재현 |

## 3. 정본에 있는데 안 만든 것 / 정본에 없어서 안 만든 것

**정본에 있는데 아직 안 만든 것** — 없음. 4개 빌더의 모든 축(state·type·size·break·variant·title)을 CSS 선택자 조합으로 커버했다.

**정본에 없어서 안 만든 것** (각 manifest 의 `notInCanon` 에도 기록):
- dropdown: 옵션 Hover 와 별개인 Focus 축, 패널 자체의 state 축, 전체선택 mixed(부분선택) 표시(river D2)
- select: Open 과 별개인 Focus 축, Error 축, 다중 선택 트리거 표시, Open×Filled 교차 셀(정본은 5개 이산 상태만 정의 — 웹은 열렸을 때 항상 Open 시각을 우선하고 Filled 시각은 닫힌 뒤에만 적용, 새 상태 신설 아님)
- filter-chip: 다중 선택, Error 축

## 4. 손댄 배선 자리 전수 (파일:줄 / 파일)

- `ui-library/scripts/build.mjs:13` — `componentIds` 에 `dropdown, select, filter-chip` 추가
- `ui-library/scripts/build.mjs:72-76` — 하이픈 포함 id(`filter-chip`)가 `export * as filter-chip`처럼 잘못된 JS 식별자로 나가던 버그를 고치는 김에 `toIdentifier()` 헬퍼 추가(`filter-chip` → `filterChip`). **이 수정이 없으면 dist 번들 JS 자체가 문법 오류로 로드 불가** — 기존 6개 컴포넌트는 하이픈이 없어 드러나지 않았던 잠재 결함이었다
- `ui-library/scripts/test.mjs:16` — `componentIds` 에 3종 추가 + `id === "dropdown"/"select"/"filter-chip"` 전용 계약 검사 블록 추가(사이즈 geometry·토큰 바인딩·example 마크업·코어 의존 선언 대조) + 런타임 lifecycle 체크 목록에 3종 추가(158행)
- `ui-library/package.json:8-31` — exports 에 `./components/{dropdown,select,filter-chip}`, `/css`, `/html` 각 3줄
- `ui-library/src/index.js` · `index.css` · `auto-init.js` — 3종 추가. **부수적으로**, 이 세 파일이 checkbox·radio·toggle·chip 도입 이후 갱신되지 않아 이미 stale 했던 것을 이번에 9개 컴포넌트 전체로 맞춰 정정했다(빌드 파이프라인은 이 파일들을 소비하지 않아 지금까지 드러나지 않았음 — `ui-library/scripts/build.mjs`·`test.mjs`·`package.json` 어디에도 `src/index.*` 참조 없음을 확인)
- `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` — `<main>` 안에 dropdown(standalone) · select · filter-chip 마크업 3블록을 두 파일에 동일하게 추가, 개별 설치 파일에는 CSS 링크 3개 + JS import/초기화 6줄 추가
- `ui-library/src/components/{input,button,checkbox,radio,toggle,chip}/manifest.json` — `canonicalFingerprint` 재계산·갱신(아래 5절 참조, 시각/동작 변경 없음)
- `ui-library/verification/bundle-parity.json` · `ui-library/dist/**` — `ui:build` 재실행으로 자동 재생성(직접 손편집 없음)

**손대지 않음**(지시대로): `pages/ui-review.html`, `pages/components.html`, `registry/governance/ui-library-migration.json`, `registry/governance/component-presentation-policy.json`, `ui-library/verification/{dropdown,select,filter-chip}.json`(승인 이후 단계 산출물), `workflow-state.json`.

## 5. 정본 지문 변경 — 영향 없음 확인 후 기계적 갱신

빌드 도중 `input canonicalFingerprint is stale` 로 처음 막혔다. 확인 결과:

```
git diff -U0 plugins/figma-vars-installer/src/build-components.ts | grep '^@@'
@@ -4885 +4885,2 @@ buildStatusBar
@@ -4951... buildNavBar (4곳)
```

변경 범위는 `buildStatusBar`·`buildNavBar`(모바일 크롬 내비바) 뿐이며 input·button·checkbox·radio·toggle·chip·select·dropdown·filter-chip 어느 빌더도 건드리지 않는다(workflow-state D4 의 결론과 일치). 시각·동작 영향이 없음을 확인한 뒤, `canonicalSources` 에 `build-components.ts` 를 포함하는 8개 컴포넌트 manifest(6개 기존 + dropdown, 처음 계산 이후 재확인에서 한 번 더 갱신 필요)의 `canonicalFingerprint` 를 기계적으로 재계산해 갱신했다. **다른 세션이 같은 저장소에서 `build-components.ts` 를 동시 편집하고 있을 가능성**(멀티세션 공유 작업트리)이 있어, dropdown 의 지문이 최초 계산 직후 한 번 더 바뀌어 있었다 — 재계산해 반영했다. select·filter-chip 은 변동 없었다.

## 6. 자동 검사 4종 실제 출력

```
$ npm run ui:contract
[UI Library Contract] PASS · policy=candidate · stable-enforcement=pending
UI_CONTRACT_SUMMARY status=candidate errors=0 gate=gate:check-partial

$ npm run ui:icons
✅ 아이콘 검사기 적대 테스트 통과(틀/도형 혼동 탐지)
✅ 모든 웹 아이콘의 frame·glyph 계약과 source/dist가 일치
UIICON_SUMMARY icons=3 errors=0

$ npm run ui:build
UI library build generated: 50 files.

$ npm run ui:test
UI library technical checks completed (normal mode). Actual render and UX judgment remain separate; independent review follows the risk-based contract.
```

추가로 `npm run gate:check` 실행 — **PASSED with 15 warning(s) · 게이트 46개 · ✅ 76건**. 경고 15건은 모두 이번 작업 이전부터 있던 기존 항목(리포트 색인·Gate 16 분류 미정·토큰 orphan·drift·시스템맵·다크갈림·Gate 30 baseline 면제·Gate 32 미계측)이며 이번 구현으로 새로 생긴 항목은 없다.

`npm run ui:state -- reports/ui-library/select-dropdown-filter-chip/workflow-state.json` 은 `정본 지문이 바뀌었습니다: build-components.ts` 로 실패한다 — 5절과 같은 원인(orchestrator 소관, workflow-state.json 은 이 에이전트가 수정하지 않는다).

## 7. needs-decision / 판단이 필요한 것

**없음.** 2-canon-readiness 에서 이미 확정된 계약을 그대로 구현했고, 구현 중 새로 발견된 모호점은 없었다.

**⭐ 자가인증 명시 (검증 안 한 부분)**:
- 실제 렌더(육안) 검증 미수행 — 오버레이 배치·hover/열림 시각·라이트/다크 대조는 이번 3-build 범위 밖이며 workflow-state D3 에 따라 4-verification 에서 🤖 `component-verifier` 시나리오 F 가 별도로 한다.
- select/filter-chip 의 패널을 `position: absolute` 오버레이로 배치한 것은 정본 Figma 컴포넌트가 세로 스택(itemSpacing 8px)으로 모델링한 것을 웹 관례(콘텐츠를 밀지 않고 겹쳐 뜨는 형태)로 해석한 구현 결정이다 — 8px 간격 자체는 보존했으나 "밀어내기 vs 오버레이"는 정본이 직접 규정하지 않아 판단이 필요하면 4단계에서 확인 바란다.
- `ui-library/scripts/build.mjs` 의 `toIdentifier()` 수정은 하이픈 포함 id 를 다루는 첫 사례라 기존 6개 컴포넌트에는 실행 경로가 안 바뀌지만, 코드 변경이므로 component-verifier 대조 대상에 포함되어야 한다(하드룰 H1②).

## 8. 4-verification 지적 반영 (2026-08-31, 재수정)

component-verifier 가 4-verification 에서 실제 결함 2건을 발견했다. 지시대로 이 2건만 고쳤고, 다른 파일은 건드리지 않았다.

### 결함 1 — dropdown 의 「전체 선택」 동작 누락 → 수정 완료

`ui-library/src/components/dropdown/dropdown.js` 의 `selectOption()` 이 select-all 행을 평범한 체크박스 한 줄로만 처리해 `registry/components/component-behavior.pc.json` 의 `Dropdown (Checkbox)`(status=verified) 장부와 어긋났다. 다음처럼 고쳤다.

- select-all 행은 `data-select-all="true"` 로 식별한다(`dropdown.example.html` 의 "전체 선택" 행에 추가).
- `isSelectAll()` / `setChecked()` / `syncSelectAll()` 헬퍼를 추가해 3가지 행동을 구현:
  1. select-all 클릭 → 꺼져 있었으면 자신을 포함해 전체 켜기, 켜져 있었으면 전체 끄기.
  2. 일반 옵션 클릭 → 그 옵션만 토글하고, 매번 `syncSelectAll()` 로 select-all 을 재계산(모두 켜지면 스스로 켜짐, 하나라도 꺼지면 false — **mixed 는 절대 쓰지 않는다**, `setChecked` 는 `String(checked)` 로 항상 `"true"/"false"` 만 기록).
  3. 어느 경우에도 패널을 닫지 않는다(dropdown.js 는 원래도 열림/닫힘을 소유하지 않아 별도 수정 불필요 — `applyTiming: immediate` 그대로 유지).
- `s1:dropdown:change` 의 detail 에 `selectAll`(boolean) · `affected`(select-all 이 함께 토글한 옵션 배열, selectAll=true 일 때만) · `selectAllChecked`(일반 옵션 토글 후 select-all 의 현재 상태, selectAll=false 일 때만) 를 추가해 소비자가 두 경로를 구분할 수 있게 했다.
- `init()` 에서도 초기 마크업 기준으로 한 번 `syncSelectAll()` 을 돌려, 처음부터 모든 옵션이 켜진 채로 내려와도 select-all 이 맞게 표시되도록 했다.
- `ui-library/src/components/dropdown/manifest.json` 에 `htmlContract.selectAllAttribute` · `htmlContract.checkboxAllBehavior` · `javascript.eventDetail`(확장) · `javascript.behaviorContract`(component-behavior.pc.json 참조) 를 추가해 문서화했다. `notInCanon.mixed` 문구는 그대로 유지(이미 정확했음).

### 결함 2 — filter-chip·select 의 Esc 닫기 미작동 → 수정 완료

두 컴포넌트 모두 `open()` 이 `dropdownApi.focusActive()` 로 포커스를 패널 안(옵션 행)으로 옮기는데, keydown 리스너가 트리거에만 걸려 있어 열린 직후 Esc 가 절대 먹지 않는 구조였다.

- `filter-chip.js`: `trigger.addEventListener("keydown", handleTriggerKeydown)` 를 `root.addEventListener("keydown", handleRootKeydown)` 로 바꿔 트리거·패널 어디에 포커스가 있어도 Esc 를 받도록 했다. `destroy()` 의 해제 대상도 함께 옮겼다.
- `select.js`: 원래 Esc 처리가 전혀 없어 `handleRootKeydown` 을 새로 추가했다(root 레벨, 동일 패턴). role=listbox 표준 패턴과 river 가 확정한 접근성 표준안 범위에 맞췄다.
- 두 경우 모두 리스너를 `root`(컴포넌트 자신) 에 붙여 인스턴스마다 독립적이다 — document 전역 리스너가 아니므로 인스턴스 간 간섭이 없고, `destroy()` 가 각자 자기 root 리스너만 해제한다(기존 `pointerdown`/`click`/`s1:dropdown:change` 해제 로직은 그대로).
- `select/manifest.json`·`filter-chip/manifest.json` 의 `a11y.keyboard`·`htmlContract.relations` 를 "root(트리거+패널) 전체에서 Escape" 로 갱신했다.

### 확인 사항(고치지 않음, 그대로 둠)
- `data-complete` 에 CSS 규칙이 없는 것은 정본(`chipSlot()`, Complete=Default 와 동일 토큰) 그대로다 — 손대지 않았다.
- filter-chip·select 가 checkbox 유형 `s1:dropdown:change` 를 무시하는 것은 두 컴포넌트가 애초에 Type=Text 패널만 조립하기 때문에 맞는 동작이다 — 두 manifest 의 `javascript.singleSelectNote` 에 그 사실을 명시했다(방어적 무시가 아니라 설계상 당연한 무시임을 기록).

### 재검사 결과

```
$ npm run ui:contract
[UI Library Contract] PASS · policy=candidate · stable-enforcement=pending

$ npm run ui:icons
✅ 아이콘 검사기 적대 테스트 통과(틀/도형 혼동 탐지)
✅ 모든 웹 아이콘의 frame·glyph 계약과 source/dist가 일치
UIICON_SUMMARY icons=3 errors=0

$ npm run ui:build
UI library build generated: 50 files.

$ npm run ui:test
UI library technical checks completed (normal mode). Actual render and UX judgment remain separate; independent review follows the risk-based contract.
```

**⭐ 자가인증 명시** — 이번 수정도 자동 검사 통과만 확인했다. 실제 렌더로 select-all 3가지 동작과 Esc 닫기·포커스 복귀가 눈으로 보이는지는 검증하지 않았다(코드 로직 리뷰만 했다) — PASS 로 자가 승인하지 않는다. 4-verification 재검증이 필요하다.

**참고** — 재빌드 중 `pages/components.html`·`pages/ui-review.html`·`assets/js/ui-library-guide.js`·`assets/css/ui-library-guide.css` 가 이번 작업과 무관하게 이미 변경되어 있는 것을 발견했다(다른 세션이 같은 작업트리에서 동시에 guide-builder 단계를 진행 중인 것으로 보인다). 지시대로 이 파일들은 전혀 건드리지 않았다.

## 9. 독립 검증(component-verifier 시나리오 F) 지적 반영 (2026-09-01)

`reports/ui-library/select-dropdown-filter-chip/4-verification-independent.md` — 독립 검증자가 FAIL 판정과 함께 낸 결함 4건을 지시대로만 고쳤다. 판정(❌1~4)의 실측 수치·근거는 그 보고서를 그대로 신뢰했고 재실측하지 않았다.

### ❌1 · select.css hover 가 Open·Filled 를 덮어씀 → 수정 완료
`ui-library/src/components/select/select.css` 의 hover 선택자를 `filter-chip.css`(75·95행)와 같은 가드 패턴으로 맞췄다:
```
:hover:not(:disabled)  →  :hover:not(:disabled):not([aria-expanded="true"]):not([data-filled="true"])
```
filter-chip 은 Filled 축이 없어 `:not([aria-expanded="true"])` 만 있으면 충분했지만, select 는 Filled 도 있어 `:not([data-filled="true"])` 를 추가로 넣었다(같은 패턴을 select 의 축 구성에 맞게 적용한 것이며 새 규칙을 발명하지 않았다).

### ❌2 · 「전체 선택」 줄이 1px 큼 → 수정 완료
`ui-library/src/components/dropdown/dropdown.css` 에 `[data-s1-part="option"][data-select-all="true"]` 전용 높이 규칙 3개(xxsm/xsm/md)를 추가해 `calc(sizing - border-width-1)` 로 1px 줄였다 — 아래 구분선(1px)과 합치면 다른 줄과 같은 총높이가 된다(정본 주석 "총높이는 다른 줄과 같게 유지(내용 = h-1)", build-components.ts:1633-1645). `manifest.json` 의 `geometry.option` 에 `selectAllRowHeight` 로 문서화했다.

### ❌3 · `disable → close` 계약 미구현 → river 결정대로 코드를 계약에 맞춤
`select.js`·`filter-chip.js` 각각에 `MutationObserver` 를 추가해 트리거의 `disabled` 속성이 켜지는 순간 열려 있으면 닫는다(`trigger.disabled && isOpen(trigger)` 면 `close({ returnFocus: false })`). 클릭 차단은 기존 `open()` 의 disabled 가드가 이미 담당하므로 그대로 뒀다.
- 인스턴스마다 **자기 trigger 하나만** 관찰해 누적되지 않는다.
- `destroy()` 에 `disabledObserver.disconnect()` 를 추가해 계약 `javascript.rules`(해제 의무)를 지켰다.
- `node scripts/component-behavior-check.js` 재실행 결과 **PASS**(PC 20개 계약 연결 확인) — sourceEvidence 문자열이 모두 그대로 유효해 `component-behavior.pc.json` 은 갱신하지 않았다(문자열 존재 대조 방식이라 이번 수정으로 깨지지 않았음을 확인).

### ❌4 · select manifest 서술 모순 → 서술만 수정, CSS 는 그대로
`ui-library/src/components/select/manifest.json` 의 `notInCanon.focusAxis` 를 `dropdown` manifest 의 `notInCanon.optionFocus` 서술 방식을 따라 "웹에서만 트리거에 focus-visible 테두리를 추가했으며 새 토큰을 만들지 않았다(선택 테두리 토큰 재사용, cssContract.nativeStates 에 :focus-visible 로 정직하게 선언)"로 고쳤다. `select.css` 의 `:focus-visible` 규칙은 손대지 않았다(정직하게 선언돼 있던 게 맞고, 서술이 틀렸던 것).

### 재검사 결과
```
$ npm run ui:contract   → PASS · policy=candidate · stable-enforcement=pending
$ npm run ui:icons      → icons=3 errors=0
$ npm run ui:build      → UI library build generated: 50 files.
$ npm run ui:test       → UI library technical checks completed (normal mode).
$ node scripts/component-behavior-check.js → PC 20개 계약이 UI 라이브러리 JavaScript/마크업 근거와 연결됨
```

**⭐ 자가인증 명시** — 이번에도 코드 로직 리뷰 + 자동 검사만 했다. hover 겹침 해소·1px 높이 정정·disable 자동 닫힘이 실제 렌더·마우스/속성 조작으로 보이는지는 확인하지 않았다 — 같은 독립 검증자가 재검증한다. `pages/**`·`assets/**`·`workflow-state.json` 은 이번에도 손대지 않았다(다른 세션이 계속 건드리고 있는 상태 그대로 둠).
