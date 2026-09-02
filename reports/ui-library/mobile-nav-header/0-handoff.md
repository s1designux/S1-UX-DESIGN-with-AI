# 0-handoff — 세션 인계 (Mobile Bottom Nav · Mobile Header)

> **이 작업을 다른 세션에서 이어받는 방법.** 2026-09-02 river 요청으로 여기까지만 진행하고 멈췄다.
> (이 문서의 이전 판 = 3-build 착수 전 인계문은 git 이력에 있다. 지금은 그보다 두 단계 앞이다.)

## 이어받는 명령

```
웹 업데이트 해줘 — mobile-nav-header 재개
```

`ui-library-code` 스킬이 뜨면 **가장 먼저** 이 순서로 읽는다:

1. `reports/ui-library/mobile-nav-header/workflow-state.json` ← 진행 상태·blockers·humanDecisions
2. **`reports/ui-library/mobile-nav-header/4-verification.md`** ← ★ **이게 작업지시서다.** §1 FAIL 3건에 실측 근거·원인·수정 방향까지 다 있다
3. `.claude/skills/ui-library-code/references/wiring-and-traps.md` ← 배선표(§1)·검증 함정(§2)
4. `.claude/skills/ui-library-code/references/verify-F.md` ← 재검증 규격
5. `1-inventory.md` · `2-canon-readiness.md` · `3-build.md` (이 폴더)

```
npm run ui:state -- reports/ui-library/mobile-nav-header/workflow-state.json
```
로 정본 지문이 아직 맞는지 확인하고 시작한다.

---

## 지금 상태 한 줄

**3-build 까지 됐고 4-verification 을 실제로 돌려 FAIL 3건이 나왔다. 그 3건은 전부 아이콘 결함이고 고치는 방법이 확정돼 있다. 고친 뒤 4-verification 을 재실행하면 된다.**

- `currentPhase`: `3-build` · `workflowStatus`: `in-progress` · `uiLibraryStatus`: `draft`
- `lastCompletedCheckpoint`: 3
- 4-verification 판정: **FAIL 3 · HOLD 2 · BLOCKED 0 · PASS 30 · 미확인 3**

## 첫 번째로 할 일 — 아이콘 결함 3건 수정

**범위를 이 3건으로 못박고 시작한다.** (아래 ⚠️ 사고 기록 참조)

| # | 무엇 | 고치는 곳 | 확정된 해법 |
|---|---|---|---|
| **F-2** | 아래화살표가 위(↑)를 향한다 | `ui-library/src/components/mobile-header/mobile-header.css:110` | `rotate(-90deg)` → **`rotate(90deg)`**. Figma rotation 은 반시계 양수, CSS rotate 는 시계 양수라 같은 숫자가 반대 방향이 된다 |
| **F-1** | 화살표 도형이 원본보다 13% 작다 (글리프 상자가 획 바깥 절반을 클리핑) | `ui-library/src/assets/icons/mobile-header-arrow-down.svg` + `assets/icons/manifest.json` | `chevron.svg` 처럼 **바깥 24 viewBox 에 직접** 그린다. 검증자가 실증: 오차 0.00372 → **0.00089**. manifest `geometry.glyph` 선언도 정정(획 기반 글리프에 경로 경계 선언은 성립하지 않음) |
| **F-3** | 알림 뱃지 점이 빨강 아니라 회색 (accent 자산이 dist 에 없어 404) | `ui-library/src/assets/icons/manifest.json` | accent 를 **icon manifest 에 등록**해 `build.mjs` 가 dist 로 복사하게 한다. 원본 대조는 결합형 기준 유지하되 그 경계를 등록 항목에 기계가독으로 선언 |

**F-3 관련 검증자 판정(그대로 따를 것):** 픽셀 대조를 결합형(본체+점) 1건으로 한 것은 **타당**하다(accent 경로 `d` 가 등록 자산의 두 번째 경로와 바이트 동일). 그러나 **등록에서 뺀 것은 부당**하다 — 이 저장소에서 등록이 곧 배포 통로이자 게이트 적용 범위다. **"대조 방식"과 "등록 여부"를 분리**해서 결정한다.

### 수정 후 통과시킬 것

```
node scripts/ui-library-icon-origin-check.js --record   # arrowDown 오차 개선 확인
npm run ui:icons && npm run ui:contract && npm run ui:build && npm run ui:test
ls ui-library/dist/assets/icons/mobile-header-notification-accent.svg   # 존재해야 함
npm run gate:check
```
+ **실제 렌더 육안 확인**: 화살표가 아래(v), 알림 점이 빨강.

### 그 다음

🤖 `component-verifier` 시나리오 F **재실행**(고친 사람 ≠ 검증한 사람). FAIL 0 이 되면 5-human-review 로 river 에게 화면을 올린다.

---

## river 결정 대기 2건 (FAIL 수정에는 지장 없음)

`workflow-state.json` 의 `humanDecisions` 에 정본이 있다.

- **HD-1 — 하단탭 배포 예제를 어떻게 줄까.** 정본이 "4칸 바는 부품이 아니다"(`build-components.ts:2982`)라 바를 뺐고 그 판단은 검증자도 PASS. 부작용: 빈 검수화면에서 탭이 세로로 쌓이고, 배포 예제를 복사하면 `tablist` 없는 홀로된 `role=tab`(무효 ARIA)이 된다.
  (A) 문서로만 안내 / **(B) 꾸미기 없는 `<nav role="tablist">` 래퍼만 예제·검수화면에 포함 ← ⭐ 추천** / (C) 바를 선택 부품으로 정식 편입(Gate 34 승인 사항).
  안 정하면 (A) 로 남고 개발자가 무효 ARIA 를 만들 수 있다.

- **HD-2 — 헤더 안내화면 상태 매트릭스를 목업 위에 올릴까.** 정책 note 는 "Action·상태 매트릭스 모두 360×780 목업 위"인데 실제는 Action 만 목업, 상태표는 평면 목록.
  **(A) 정책 note 를 실제 화면대로 정정 ← ⭐ 추천** / (B) 상태표도 목업 위로.
  river 원 결정문(D6)은 "목업 위에 올려 보여준다"까지이고 "상태 매트릭스도"는 정책 note 에서 확장된 말이라 확장분의 권한이 불분명하다 — 그래서 검증자가 임의 판정하지 않고 올렸다.

## 6-promotion 으로 미룬 것 (B3)

모바일헤더 안내 페이지 공개 선언(`visibility` internal→public). ⭐ 가 실제로 승격을 시도해 Gate 19 가 요구하는 것을 **실측한 뒤 되돌렸다** — 추측이 아니라 확인된 할 일이다:

1. `registry/governance/component-page-coverage.json`: `noSectionNeeded` 의 `Mobile Header` 제거 + `sectionFor` 에 `"Mobile Header": "mobile-header"` 추가 → `npm run components:guide-model:write`
2. `pages/components.html` 의 `data-cov-type` 을 **정본 표기**(`Home / Title` 등)로 맞춘다 — 검사기는 소문자화만 하고 슬러그 변환을 하지 않아 현재 `home-title` 이 안 맞는다
3. 정본 `Platform=[App,Web]` 축을 웹 배포본이 D5 로 뺀 것을 `registry/governance/variant-coverage-baseline.json` 에 사유와 함께 known gap 으로 등재 (**river 확인 사항**)

*아직 4-verification 을 통과하지 않은 부품에 "정본 변형을 전부 보여준다" 선언을 붙이는 것은 순서가 틀리므로 승격 시점까지 미뤘다.*

---

## ⚠️ 이 세션에서 있었던 사고 — 같은 실수 반복 금지

`ui-library-builder` 에게 F-1~F-3 수정을 맡겼는데, **범위를 벗어나 정본 `build-components.ts` 의 `buildTable` 열 정렬(`COL_ALIGN`)을 바꿨다.** 근거로 "river 결정 2026-09-02, HD-1 A" 를 댔으나 **이 세션의 HD-1 은 하단탭 tablist 래퍼 문제이고 Table 정렬과 무관하다** — 다른 작업(table)의 번호를 혼동한 것으로 보인다. 함께 `registry/figma/allowed-remote-keys.json`·`component-facts.json`·`icon-origin-baseline.json`·`table/workflow-state.json` 등도 건드렸다. **전량 되돌렸다.**

**다음 세션의 대비:**
- 빌더에게 위임할 때 **"이번 범위는 이 3건뿐, 정본 파일은 건드리지 말 것"** 을 명시하고, 끝난 뒤 `git status` 로 **범위 밖 파일이 변경됐는지 반드시 확인**한다.
- 정본(`build-components.ts` 등) 변경은 **하드룰 H1② · Gate 13** 대상이다 — 빌더가 임의로 손대면 안 되고, 손댔으면 `component-verifier` 독립 검증 기록이 필요하다.
- HD 번호는 **작업(work-id)별로 따로 매겨진다.** 다른 작업의 HD 번호를 근거로 쓰지 않는다.

## 커밋·정리 상태

- 앞선 차단 해소는 커밋됨: **`8094b27`** (시계 아이콘 원본 교정 0.049→0.0099 · 빈 검수화면 인라인 style 제거 · 파이프라인 상태 정합)
- 이 인계 시점의 작업트리에는 **4-verification.md + screens/4v-*.png(9장) + 이 문서 + 상태파일**만 남아 있다. 빌더의 미완성 작업은 되돌렸다.
- `npm run gate:check` PASSED (오류 0 · 경고 13 전부 기존 부채) · `ui:test`·`ui:icons` errors=0
- ⚠️ **다른 PC 로 넘길 때는** `npm run ui:handoff -- reports/ui-library/mobile-nav-header/workflow-state.json` 이 요구하는 파일이 전부 커밋돼 있어야 한다.

## 같은 저장소의 다른 미완 작업

`time-picker` 작업이 **3-build 중간**에서 멈춰 있다(다른 계정 세션이 토큰 소진). `reports/ui-library/time-picker/workflow-state.json` 참조. 남은 일: 3-build.md 작성 · `pages/ui-review.html` 검수화면 등재 · `ui-library-migration.json` 등재 · **B4**(안내 섹션이 `guideComponents` 배열에 없어 배포본 게이트를 안 타고 손편집 정적 마크업을 표출 — 미승인 배포본이 승인된 것처럼 보일 수 있음).
시계 아이콘 원본 불일치는 이 세션에서 이미 해소했다.

> **동시 편집 주의:** 두 작업이 `ui-library/src/index.js`·`auto-init.js`·`empty-consumer*.html`·아이콘 manifest 를 공유한다. 한 세션에서 하나씩 진행할 것 (`concurrent-session-shared-worktree` 패턴 3회 도달 — `reports/repeated-requests.json`).
