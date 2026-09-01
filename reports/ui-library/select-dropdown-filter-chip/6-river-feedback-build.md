# 6 — river 피드백 3건 반영 빌드 보고

work-id: `select-dropdown-filter-chip` · 담당: 🧱 ui-library-builder · 날짜: 2026-09-01

river 가 5-human-review 단계에서 직접 지시한 수정 3건만 반영했다. 범위 밖 정리는 하지 않았다.

---

## ① 드롭다운 목록 최소 폭 = 140px

- `ui-library/src/components/dropdown/dropdown.css:5-18` — `[data-s1-component="dropdown"]` 루트에 `min-width: 140px` 추가(기존에는 폭 규칙 자체가 없었다).
- 값은 토큰이 아니라 리터럴 px 다. 근거: 정본 `build-components.ts` 자신도 트리거·패널·옵션 행을 `resize(140, …)` 리터럴로 만들며(1482·1589·1644·1652·1730·1764행), 이 폭에 대응하는 sizing 토큰이 vars-data.ts 에 없다(140 근처 토큰 없음, 직접 확인).
- 부수효과: dropdown 모듈은 select·filter-chip 이 공유하는 코어라서, select 의 패널에도 같은 min-width 가 적용된다. select 트리거는 `width:100%`(컨테이너에 맞춤)라 지금까지 문제가 없었고 손대지 않았다 — 요청 범위 밖.

## ② 최대 폭 = 320px · 초과 시 줄바꿈(말줄임 아님)

- `dropdown.css` 루트에 `max-width: 320px` 추가(①과 같은 근거로 리터럴 px).
- `[data-s1-part="option-label"]`(dropdown.css:90-96): `overflow:hidden; text-overflow:ellipsis; white-space:nowrap` → `min-width:0; overflow-wrap:break-word; white-space:normal` 로 교체. `min-width:0` 은 flex item 기본값(auto)이 줄바꿈을 막는 것을 해제하기 위해 필요했다(안 넣으면 부모가 좁아져도 줄바꿈이 안 걸림).
- 옵션 행 높이: `height` → `min-height` 로 전환(xxsm/xsm/md 3곳, dropdown.css:21-33). 한 줄일 때는 정본 그대로 28/34/44px 를 유지하고(문자열 계산상 padding 포함해도 임계값 아래), 줄바꿈되면 이 값을 바닥으로 행이 늘어난다.
- 세로 padding: `[data-s1-part="option"]` 에 `padding-block: var(--spacing-4)` 추가(기존엔 가로 padding 만 있었다). 한 줄일 때는 `min-height` 가 더 커서 시각적으로 기존과 동일하고, 줄바꿈되면 위·아래 여백이 생겨 글자가 행 테두리에 붙지 않는다.
- 「전체 선택」 줄 확인(river 지시): `[data-select-all="true"]` 의 `height: calc(sizing - border-width-1)` 도 `min-height` 로 전환했다(dropdown.css:36-44). "전체 선택"은 고정 짧은 문자열이라 실사용에서 줄바꿈되지 않음을 확인했고, min-height 전환 자체가 "줄바꿈돼도 바닥값 규칙이 안 깨지는" 구조를 만든다.

## ③ 필터칩 SM 의 목록 크기: XXSM → XSM (SM→xsm · MD→xsm)

**정본**
- `plugins/figma-vars-installer/src/build-components.ts:2273` — `const chipToDd: Record<string, string> = { SM: "XXSM", MD: "XSM" }` → `{ SM: "XSM", MD: "XSM" }`. 매핑 값 한 줄만 바꿨다(새 build 함수·variant 스펙 추가 없음).

**웹(파생) — 매핑이 박혀 있던 4곳**
- `ui-library/src/components/filter-chip/filter-chip.example.html:8` — 내부 dropdown `data-size="xxsm"` → `"xsm"`.
- `ui-library/src/components/filter-chip/manifest.json` — `notInCanon.panelSizeSameAsSelect`(76행)와 `htmlContract.panel`(103행) 서술의 "SM→xxsm·MD→xsm" → "SM→xsm·MD→xsm".
- `ui-library/src/components/filter-chip/filter-chip.css:3` — 상단 주석 매핑 문구 갱신.
- `assets/js/ui-library-guide.js:634` — `filterChipPanelSize = { sm: "xxsm", md: "xsm" }` → `{ sm: "xsm", md: "xsm" }`.
- `pages/ui-review.html:925-927` — 동일 상수·주석 갱신.
- `reports/ui-library/select-dropdown-filter-chip/matrix-fixture.html:68-69` — `chipPanelSize` 함수를 `sm` 도 `"xsm"` 반환하도록 수정.
- `ui-library/scripts/test.mjs:195-197` — 기술 검사기가 예전 매핑(SM→XXSM)을 정답으로 assert 하고 있어서 새 매핑(SM→XSM)을 검사하도록 갱신(안 고치면 `ui:test` 가 올바른 변경을 오탐 FAIL 시킴).

**정본 재생성** — build-components.ts(공유 정본 파일)를 고치면 그 파일을 canonicalSources 로 참조하는 **9개 컴포넌트 manifest 전부**의 `canonicalFingerprint` 가 stale 해진다(이 파일 하나가 input/button/checkbox/radio/toggle/chip/dropdown/select/filter-chip 전부의 canonical source). `ui-library/scripts/build.mjs` 가 해시 불일치를 감지해 빌드를 막았고, 9개 manifest 전부의 fingerprint 를 재계산해 갱신했다(9개 모두 스크립트로 재계산 값 대조 후 반영, 손으로 값을 만들지 않음).
추가로 canon 변경이 파생 문서에 영향을 줘 아래를 정본 재생성 스크립트로 갱신했다(손편집 아님):
- `npm run components:facts:write` → `registry/components/component-facts.json`
- `npm run design:md:write` → `design/DESIGN.core.md`(드리프트 0)
- `npm run components:guide-model:write` → `registry/components/component-guide-model.json`

## 320px 을 표현한 방식과 근거

새 토큰을 만들지 않았다. 정본에 320px 에 대응하는 sizing 토큰이 없고(vars-data.ts 전수 확인, 140 근처 포함 없음), 기존 sizing 토큰 조합(예: 280+40)으로 320 을 만드는 것도 "조합"이 아니라 사실상 새 규칙을 만드는 것과 같아서 river 지시("불가하면 needs-decision")에 따라 **리터럴 px(140px/320px)** 로 두었다. 근거는 정본 자신이 이 폭 값을 애초에 토큰이 아니라 `resize(140, …)` 리터럴로 쓰고 있다는 점 — 140 을 그대로 따르는 이상 320 도 같은 성격(리터럴)으로 두는 것이 정본과 어긋나지 않는다고 판단했다. **needs-decision은 아니고, 판단 근거를 여기 명시한다.** river 가 별도 토큰화를 원하면 알려달라.

---

## 검사 6종 실제 출력

### `npm run ui:contract`
```
[UI Library Contract] PASS · policy=candidate · stable-enforcement=pending
UI_CONTRACT_SUMMARY status=candidate errors=0 gate=gate:check-partial
```

### `npm run ui:icons`
```
✅ 아이콘 검사기 적대 테스트 통과(틀/도형 혼동 탐지)
✅ 모든 웹 아이콘의 frame·glyph 계약과 source/dist가 일치
UIICON_SUMMARY icons=3 errors=0
```

### `npm run ui:build`
```
UI library build generated: 50 files.
```
(첫 실행은 canonicalFingerprint stale 로 실패 → 9개 manifest 재계산 반영 후 재실행해 통과)

### `npm run ui:test`
```
UI library technical checks completed (normal mode). Actual render and UX judgment remain separate; independent review follows the risk-based contract.
```
(첫 실행은 옛 매핑을 assert 하던 `test.mjs` 검사문 때문에 1건 FAIL → 검사문을 새 매핑으로 갱신 후 재실행해 통과)

### `node scripts/component-behavior-check.js`
```
🔎 PC Component Behavior 계약 검사
  ✅ PC 20개 계약이 UI 라이브러리 JavaScript/마크업 근거와 연결됨
```

### `npm run gate:check`
```
Gate Check FAILED — 1 error(s), 17 warning(s) · 게이트 46개 · ✅ 75건
```
남은 오류 1건:
```
🔎 [Gate 13] 설치기빌드검증 검사기 (Installer Build Verify)
  ❌ build-components.ts 가 마지막 검증 이후 변경됨(검증 기록 stale) — 재검증 필요.
     구조 변경은 ⭐ 단독 금지 → 🤖 component-verifier 로 검증 후 --record.
     순수 기계적 수정이면 --by orchestrator --change mechanical 로 자가인증(git 가시).
```
경고 17건은 전부 이번 작업과 무관한 기존 항목(Gate 4/10/16/17/20/28/29/30/32 — harness-audit 미색인, orphan token, dark divergence 등)이며 손대지 않았다.

---

## 미확인 · needs-decision

- **Gate 13 (설치기빌드검증) — 내가 판정하지 않는다.** `build-components.ts` 매핑 값 한 줄 변경이라 하드룰 H1② 예외("토큰 값 1건/오타" 급의 순수 기계적 수정)에 해당한다고 판단하지만, 그 판정과 `--record --by orchestrator --change mechanical`(또는 component-verifier 재검증) 실행은 ⭐ 오케스트레이터/river 의 몫이지 🧱 ui-library-builder 인 내가 스스로 self-certify 할 항목이 아니다. 다음 명령 후보만 남긴다:
  ```
  node scripts/installer-build-verify-check.js --record --by orchestrator --change mechanical --notes "filter-chip SM→XSM 매핑 값 1줄 (river 2026-09-01)"
  ```
- **`registry/governance/ui-library-migration.json:185`** (`reverifyTrigger`, filter-chip 항목) — 이 파일이 바로 "패널 크기 매핑(SM→xxsm·MD→xsm) 변경 시 재검증"이라고 스스로 명시한 트리거 조건인데, 이번에 그 조건이 실제로 발동했다. `lastVerified`·`riverApproval`·`promotionDecision` 필드는 검증 이력을 기록하는 자리라 내가 손으로 고치면 self-certify 가 되므로 건드리지 않았다 — component-verifier 재검증 후 갱신돼야 한다.
- **select.css** — dropdown 모듈의 min/max-width 변경이 select 패널에도 전파되지만(공유 코어), select 트리거 폭·레이아웃 자체는 이번 지시 범위 밖이라 손대지 않았다. 실제 화면에서 select 드롭다운이 이상하게 보이는지는 렌더 확인이 필요하다(**나는 시각 렌더 검증을 하지 않았다** — component-verifier 또는 river 검수 몫).
- 렌더 스크린샷 대조는 이번 작업에서 수행하지 않았다(CSS/HTML/JS 코드 변경만 진행) — CLAUDE.md 규칙상 "UI/HTML/CSS 변경 시 렌더 1회 확인 의무"가 있으니, 다음 단계(component-verifier 또는 orchestrator)에서 실제 렌더 스크린샷 대조가 필요하다.

---

## 변경 파일 목록(river 지시 3건 관련만)

| 파일 | 변경 |
|---|---|
| `plugins/figma-vars-installer/src/build-components.ts:2273` | 정본 chipToDd 매핑 SM: XXSM→XSM |
| `ui-library/src/components/dropdown/dropdown.css` | min/max-width, height→min-height, option padding-block, option-label wrap |
| `ui-library/src/components/dropdown/manifest.json` | geometry/notInCanon/cssContract 서술 갱신 + canonicalFingerprint 재계산 |
| `ui-library/src/components/filter-chip/filter-chip.example.html` | 내부 dropdown data-size xxsm→xsm |
| `ui-library/src/components/filter-chip/manifest.json` | 매핑 서술 갱신 + canonicalFingerprint 재계산 |
| `ui-library/src/components/filter-chip/filter-chip.css` | 상단 주석 매핑 갱신 |
| `ui-library/src/components/{input,button,checkbox,radio,toggle,chip,select}/manifest.json` | canonicalFingerprint 만 재계산(빌드 통과용, 내용 변경 없음) |
| `assets/js/ui-library-guide.js` | filterChipPanelSize 매핑 |
| `pages/ui-review.html` | filterChipPanelSize 매핑 |
| `reports/ui-library/select-dropdown-filter-chip/matrix-fixture.html` | chipPanelSize 함수 |
| `ui-library/scripts/test.mjs` | 기술 검사기의 매핑 assertion 갱신 |
| `registry/components/component-facts.json` / `design/DESIGN.core.md` / `registry/components/component-guide-model.json` | 정본 재생성 스크립트로 자동 갱신(손편집 아님) |
| `ui-library/dist/**` | `npm run ui:build` 재생성 산출물(손편집 아님) |

---

## 재수정(2차) — ⭐ 실측 지적 2건 반영 (2026-09-01)

⭐ 가 실제 렌더로 확인해 지적한 2건만 고쳤다. ③(SM→XSM)은 이미 정상 반영된 것으로 확인돼 손대지 않았다.

### ❌1 · 셀렉트박스 본체(트리거)에 최소 폭 140 누락

- `ui-library/src/components/select/select.css` — `[data-s1-component="select"] [data-s1-part="trigger"]` 에 `min-width: 140px` 추가.
- **필터칩 트리거에는 걸지 않았다** — 정본 filter-chip 은 `primaryAxisSizingMode = "AUTO"`(내용에 맞춰 줄어듦)라 여기 140을 걸면 정본과 갈라진다. `filter-chip.css` 는 이번에 손대지 않았다.

**실측(matrix-fixture, 실제 dist, 브라우저 computed style)**
- select 트리거(xxsm/xsm 등 6개 샘플): `width = 140px`, `computed min-width = 140px` — 전부 확인.

### ❌2 · 목록이 320까지 안 넓어지고 140에서 바로 줄바꿈되던 문제

- `ui-library/src/components/dropdown/dropdown.css` — 루트에 `width: max-content` 추가(기존 `width` 미지정 → 블록 요소 기본값 `auto` 가 "부모 폭 채우기"로 동작해 내용을 따라 커지지 않던 게 원인). `min-width:140px`/`max-width:320px` 는 그대로 두어 `max-content` 결과를 140~320 사이로 clamp.
- **select 패널은 트리거 폭에 맞추는 기존 동작을 유지하기로 결정.** 근거: ⭐ 지적문 "트리거보다 목록이 좁아 보이거나 어긋나 보이면 안 된다"를 select 에 그대로 적용하면, select 는 트리거 폭이 다양(사용 맥락마다 다름)한데 dropdown 이 내용 기준으로만 커지면 트리거와 어긋나 보일 위험이 filter-chip 보다 크다(filter-chip 은 애초에 트리거·패널 폭이 독립적으로 설계돼 있어 어긋나 보임 자체가 원래 정상 모양). 그래서 `select.css` 에 `[data-s1-component="select"] [data-s1-part="panel"] [data-s1-component="dropdown"] { width: 100%; }` 를 추가해 자식 dropdown 을 다시 트리거 폭에 맞춘다 — dropdown 의 min/max-width(140/320) clamp 는 그대로 유지되므로, ❌1 로 트리거가 항상 140 이상이 된 지금은 패널이 140 밑으로 좁아질 일이 없다. select.css 는 "형태·상태"가 아니라 "배치"만 건드리는 것이라 dropdown.css 소유권을 침범하지 않는다고 판단했다(dropdown.css 주석에도 이 분업을 명시).
- `ui-library/src/components/dropdown/manifest.json` — geometry.panel.widthGrowth 필드로 이 결정과 근거를 서술 추가.

**실측(matrix-fixture, 실제 dist, 브라우저 computed style + 임시 DOM 주입 테스트)**

| 케이스 | 실측 폭 | 줄 높이 | 판정 |
|---|---|---|---|
| 짧은 옵션("짧음") | 140px | 44px(한 줄) | 최소 폭 바닥 확인 |
| 중간 길이 옵션("중간 길이의 옵션 문구입니다") | 181.74px | 44px(한 줄) | 140~320 사이 내용만큼 커짐 확인 |
| 아주 긴 옵션(약 50자) | 320px | 59px(줄바꿈됨) | 320에서 멈추고 줄바꿈(말줄임 아님) 확인 |
| select 열림 패널(xxsm/xsm/md, PC/Mobile 전 조합) | 트리거와 동일(140px, fixture 옵션이 짧아 최소값에서 일치) | — | 트리거와 어긋나지 않음 확인 |
| filter-chip 열림 패널(SM/MD 전 조합) | 140px(트리거 pill 보다 넓게 삐져나옴 — 정본이 원래 그런 모양, 패널이 트리거를 넘어서는 건 필터칩의 정상 동작) | — | 최소 폭 확인 |

방법: `npm run ui:build` 재생성 후 `http://localhost:4173/reports/ui-library/select-dropdown-filter-chip/matrix-fixture.html` 을 브라우저로 열어(`?v=2` 로 캐시 우회) `getBoundingClientRect()`/`getComputedStyle()` 로 직접 측정. `node scripts/render-shot.js`로 전체 페이지 스크린샷도 떠서 육안 대조(Select 패널이 트리거 폭과 정렬됨, Filter Chip 패널이 140 하한을 지킴을 확인).

### 재실행한 검사

- `npm run ui:contract` → PASS
- `npm run ui:build` → 50 files 생성(fingerprint 변경 없음 — CSS 는 canonicalSources 가 아니라 manifest.json 의 canonicalFingerprint 재계산 불필요했음)
- `npm run ui:test` → PASS
- `node scripts/component-behavior-check.js` → PASS(20/20)
- `npm run gate:check` → **1 error, 17 warning**(동일 — Gate 13 하나만 남음, 1차 보고서에 적은 그대로. 오케스트레이터가 처리하기로 해 손대지 않았다.)

### 미확인

- select 패널이 트리거보다 더 넓어지는 경우(트리거가 320px 초과로 매우 넓은 실사용 맥락)는 fixture 에 그런 샘플이 없어 실측하지 못했다 — 이론상 dropdown 이 max-width 320 에서 멈추고 트리거보다 좁아 보일 수 있다. 실사용에서 select 트리거가 320px 를 넘는 사례가 있는지는 확인하지 못했다(needs-decision 은 아니고, 발생하면 다시 보고할 사안으로 남긴다).
