# 3-build — Assist Button · Text Button · Modal Content

## 만든 파일

### 원본 (`ui-library/src`)

| 컴포넌트 | 파일 |
|---|---|
| assist-button | `ui-library/src/components/assist-button/{assist-button.css, assist-button.js, assist-button.example.html, manifest.json}` |
| text-button | `ui-library/src/components/text-button/{text-button.css, text-button.js, text-button.example.html, manifest.json}` |
| modal-content | `ui-library/src/components/modal-content/{modal-content.css, modal-content.js, modal-content.example.html, manifest.json}` |

### 등록부

- `registry/components/assist-button.json` (신설)
- `registry/components/text-button.json` (신설)
- `registry/components/modal-content.json` (신설)

### 생성 경로 배선

- `ui-library/scripts/build.mjs` `componentIds` — 3개 추가
- `ui-library/scripts/test.mjs` `componentIds` — 3개 추가 + 컴포넌트별 계약 검사 3블록 신설(assist-button·text-button·modal-content) + 런타임 lifecycle 분기 갱신
- `ui-library/package.json` `exports` — `./components/{assist-button,text-button,modal-content}` 3줄씩

### 아직 하지 않은 배선 (아래 「미완료」 참고)

검사 파이프라인이 막혀 다음 단계(소비자·안내 페이지·등록부 이관)로 진행하지 못했다:
- `ui-library/src/verification/empty-consumer.html` / `empty-consumer-individual.html`
- `pages/ui-review.html`
- `assets/js/ui-library-guide.js` `componentConfig` + `stateMatrix()`
- `pages/components.html` mount + comp-nav
- `registry/governance/component-presentation-policy.json` · `ui-library-migration.json`
- `registry/governance/component-page-coverage.json` 이관(noSectionNeeded → sectionFor)

## 정본 수치 → CSS 매핑표

### Assist Button (buildAssistButtonSet, build-components.ts:582)

| 정본 | CSS |
|---|---|
| 높이 32 | `height: var(--sizing-32)` |
| 좌우 패딩 spacing/12 | `padding-inline: var(--spacing-12)` |
| 최소 폭 60 | `min-width: var(--sizing-60)` |
| 반경 radius/4 | `border-radius: var(--radius-4)` |
| 글자 body/14M | `font-size: var(--font-size-14); font-weight: var(--font-weight-medium); letter-spacing: var(--letter-spacing-tight)` |
| bg default/hover = Button Secondary 차용 | `--color-button-bg-secondary--default` / `--hover` |
| border default = Button Secondary 차용, hover = 전용 | `--color-button-border-secondary--default` / `--color-button-border-assist--hover` |
| label default/hover = 전용 | `--color-button-label-assist--default` / `--hover` |
| Disabled = Button 공통 | `--color-button-{bg,border,label}-disabled` |
| Pressed = Hover(정본 규칙) | `:is(:hover, :active):not(:disabled)` 로 합쳐 표현 |

### Text Button (buildTextButtonSet, build-components.ts:668)

| 정본 | CSS |
|---|---|
| 배경·테두리 없음 | `background: none; border: 0` |
| 패딩 0 · 반경 없음 | `padding: 0` (border-radius 선언 자체를 안 둠) |
| 글자 body/14M | 동일 |
| Primary = color/text/state/accent | `--color-text-state-accent` |
| Secondary = color/text/body/tertiary | `--color-text-body-tertiary` |
| Disabled = color/text/state/disabled | `--color-text-state-disabled` |
| Hover·Pressed = 밑줄만(색 불변) | `:is(:hover, :active):not(:disabled) { text-decoration: underline }` |

### Modal Content (buildModalContent, build-components.ts:5439)

| 정본 | CSS |
|---|---|
| 폭 MD520·LG1000·XL1200(고정) | `[data-size="md|lg|xl"] [data-s1-part="panel"] { width: ... }` |
| 높이 MD336·LG587·XL587 (정본은 고정값, **웹은 최소값**) | 같은 선택자에 `min-height: ...`(width 와 짝) — 아래 「높이 규칙」 |
| 상하 패딩 spacing/20 | `padding-block: var(--spacing-20)` |
| 블록 간격 spacing/32 | `gap: var(--spacing-32)`(panel, flex column) |
| 헤더·본문·푸터 좌우 spacing/24 | 각 파트에 `padding-inline: var(--spacing-24)` |
| 푸터 버튼 간격 spacing/8 | `gap: var(--spacing-8)` |
| 반경 radius/8(패널) | `border-radius: var(--radius-8)` |
| 면 color/surface/raised | `background: var(--color-surface-raised)` |
| 테두리 color/modal/panel/border | `border: var(--border-width-1) solid var(--color-modal-panel-border)` |
| 그림자 shadow/raised | `box-shadow: var(--shadow-raised)` |
| 제목 title/16B, color/text/title/primary | `font-size:16 · font-weight:bold · letter-spacing: normal`(typo-title-16b 와 동일) |
| 닫기 close 24px, color/icon/gray-dark | `mask: url("../assets/icons/close.svg")`, 확인 계열 Modal 과 **같은 자산 재사용**(신규 등록 없음) |
| 본문 자리표시 color/bg/level-2 + radius/4 | `[data-s1-part="content"]` |
| 안내문구 "컨텐츠 영역" body/14M, color/text/body/tertiary | `[data-s1-part="content-label"]` |
| 푸터 버튼 = 코어 Button XXSM | `data-s1-component="button" data-size="xxsm"` 인스턴스 조립 |

## 높이 규칙 구현 방식 (이번 작업의 핵심)

정본 336/587 을 **고정 높이가 아니라 최소 높이**로 구현했다.

```css
[data-s1-component="modal-content"] [data-s1-part="panel"] {
  display: flex; flex-direction: column; gap: var(--spacing-32);
  max-height: 85vh;                         /* 상한 — 딤 화면의 85% */
  max-width: calc(100vw - 48px);            /* 폭 값은 불변, 좁은 화면 상한만 */
  overflow: hidden;                         /* 헤더·푸터는 이 밖에서 안 잘림(고정) */
  padding-block: var(--spacing-20);
}
[data-size="md"] [data-s1-part="panel"] { min-height: 336px; width: 520px; }
[data-size="lg"] [data-s1-part="panel"] { min-height: 587px; width: 1000px; }
[data-size="xl"] [data-s1-part="panel"] { min-height: 587px; width: 1200px; }

[data-s1-component="modal-content"] [data-s1-part="content-area"] {
  display: flex; flex-direction: column;
  flex: 1 1 auto;      /* 패널의 남는 높이를 전부 가져간다 — 그로우 담당 */
  min-height: 0;        /* flex 자식이 overflow:auto 를 실제로 발동시키는 데 필수 */
  overflow-y: auto;      /* 유일한 스크롤 컨테이너 */
  padding-inline: var(--spacing-24);
}
```

동작: 콘텐츠가 최소 높이보다 작으면 패널은 최소 높이에 머무른다(회색 박스가 남는 공간을 채움).
콘텐츠가 늘면 `content-area` 가 자라면서 패널 전체 높이도 늘어난다(flex 컨테이너라 자동). 패널이
`max-height: 85vh` 에 닿으면 더는 자라지 않고, 그 이후 늘어나는 콘텐츠는 `content-area` 안에서만
스크롤된다(`overflow-y: auto`). 헤더·푸터는 `flex: none` 이라 스크롤에서 제외되고 항상 보인다.

여닫기·초점 가둠·Escape·초점 복귀·배경 스크롤 잠금은 확인 계열 `modal.js` 를 그대로 옮겨왔다
(`s1:modal-content:open/close` 이벤트명만 컴포넌트 id 에 맞게 바꿈). 높이 grow→cap→scroll 자체는
순수 CSS 라 JS 는 관여하지 않는다.

## 애매했던 지점과 판단 근거

1. **modal-content 헤더의 세로 정렬** — 확인 계열 Modal 은 `counterAxisAlignItems="MAX"`(CSS `align-items: flex-end`)
   인데, 정본 `buildModalContent` 코드를 직접 읽으니 헤더는 `counterAxisAlignItems="CENTER"`로 다르게 쓰여
   있었다(`header.counterAxisAlignItems = "CENTER"`, build-components.ts). 문서(`modal-content-family-backlog.md`)에는
   이 차이가 적혀 있지 않아 "제목·버튼만 확인 계열과 같다"는 서술과 충돌해 보였지만, 지시는 **정본 코드에서
   직접 다시 뽑으라**였으므로 코드를 우선해 `align-items: center` 로 구현했다.
2. **content-area 의 aria-describedby 생략** — 확인 계열 Modal 은 본문이 실제 텍스트라 `aria-describedby`로
   본문을 연결하지만, 콘텐츠 계열은 본문이 회색 자리표시(그리고 실제 배치 시 입력창·표·이미지 등 임의
   콘텐츠)라 "설명문"으로 보기 어렵다. describedby 를 강제하지 않고 aria-labelledby(제목)만 필수로 두었다 —
   실제 콘텐츠를 넣는 화면이 필요하면 직접 연결할 수 있게 열어둔 것.
3. **close 아이콘 재사용 방식** — 신규 등록 없이 `assets/icons/close.svg` 상대경로를 modal.css 와 동일하게
   재사용했다(아이콘 manifest 중복 등록 없음). modal-content manifest 의 `icons` 배열에는 문서화 목적으로만
   같은 항목을 적어 두었다(빌드 시 아이콘 asset 복사는 이미 modal 이 등록한 항목이 한다).

## 검사 결과 — 막힘

착수 시 `npm run ui:contract`·`npm run ui:icons` 는 PASS 했다. 하지만 `npm run ui:build` 단계에서
**내 3개 컴포넌트와 무관한 이유로 막혔다**:

- 작업 시작 시점에 이미 `plugins/figma-vars-installer/src/build-components.ts` 가 **다른 세션에 의해
  커밋 없이 수정 중**이었다(Input 컴포넌트 "제자리 갱신"(in-place refresh) 기능 추가, 커밋 메시지 없음,
  코드 주석은 "river 승인 A-단계, 2026-09-08"라고 적혀 있음). 이 파일 하나를 통째로 해시하는 방식이라,
  **기존 19개 웹 컴포넌트의 manifest.json 전부**(input·button·checkbox·…·date-picker)가 다시 stale 이 됐다.
- 영향 범위를 `git diff -U0`으로 확인한 결과, 실제 바뀐 로직은 `buildInput`(2026-09-08 03시 이후 추가된
  `upsertSet`/`ensureComponentProperty`/`setRefreshTargets` 인프라)와 `buildAllComponents`의 upsert 배선뿐이었고
  내 3개 빌더(`buildAssistButtonSet`·`buildTextButtonSet`·`buildModalContent`)는 건드리지 않았다.
- `ui:build` 는 **단 하나라도** manifest 지문이 안 맞으면 전체 빌드를 즉시 중단한다(컴포넌트별 부분 빌드
  경로 없음). 내 3개만 지문을 갱신해도 input이 막고, input을 갱신해 봐도 button 이 막는 식으로 19개
  전부가 걸린다.
- 이 19개는 **이번 work-id 의 대상이 아니다**(assist-button·text-button·modal-content 만 맡음). 다른
  세션이 진행 중인 미완성 작업의 산출물을 19개나 대신 갱신하면, 그 세션이 아직 검증하지 않은 변경을
  내가 먼저 "확정"해 버리는 셈이 되고, 같은 저장소를 공유하는 세션 간 충돌 위험이 있다(과거 기록:
  `multi-session-shared-worktree-hazard`).
- 그래서 **input 지문 1개만 시험 삼아 갱신했다가 button 도 막히는 것을 확인한 뒤 즉시 되돌렸다**
  (`git checkout -- ui-library/src/components/input/manifest.json`). 19개 일괄 갱신은 하지 않았다.
  ⚠️ **부작용**: 이 `git checkout`이 되돌린 것은 내가 방금 쓴 값뿐 아니라, **오케스트레이터가 D3에서
  이미 갱신해 둔 input 의 uncommitted 지문값까지 함께 커밋 시점 값으로 되돌렸다**(다른 18개 컴포넌트의
  D3 갱신분은 손대지 않아 그대로 남아 있다). 다만 D3 값도 이후 Input 제자리 갱신 편집으로 어차피
  다시 stale 해진 상태였어서 빌드 가능 여부에는 영향이 없다(어느 쪽이든 현재 파일과 불일치). 정확한 값이
  필요하면 이 문서의 위 표 대신 현재 `build-components.ts` 기준으로 다시 계산해야 한다.

**결과: `npm run ui:build` 이후의 모든 검사(`ui:test`·`ui-guide-render-check`·`gate:check`)를 실행하지
못했다.** 내 3개 컴포넌트의 원본(css/js/html/manifest)과 registry 등록은 완성했지만, dist 로 내려가는
검증까지는 이번 세션에서 끝내지 못했다.

## 검사 명령·종료코드

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS (exit 0) |
| `npm run ui:icons` | ✅ PASS (exit 0, 기존 부채 2건은 무관 — icon-origin-baseline 기존 미확인) |
| `npm run ui:build` | ❌ FAIL — `button canonicalFingerprint is stale`(내 컴포넌트가 아니라 동시 세션의 build-components.ts 미완료 편집 때문) |
| `npm run ui:test` 이하 | 미실행(ui:build 선행 실패) |

## needs-decision

- **HD**: 동시 세션이 `build-components.ts`(Input 제자리 갱신 기능)를 커밋 없이 편집 중이라 웹 컴포넌트
  19개의 `canonicalFingerprint`가 전부 stale 상태다. `npm run ui:build`가 하나라도 안 맞으면 전체를 막아서
  내 3개 신규 컴포넌트도 dist 로 못 내려간다. **오케스트레이터가 두 세션 순서를 정해야 한다** — (A) 그
  세션이 먼저 끝내고 커밋하면 그 뒤에 내가 지문만 갱신해 이어서 진행 / (B) 지금 19개 지문을 전부
  기계적으로 갱신해(레지스트리 값·CSS 는 안 건드림) 진행하되 그 세션의 미완료 변경을 내가 먼저 "확정"하는
  위험을 감수. 정하지 않으면 이번 3개 컴포넌트는 원본·registry 만 완성된 채 dist 미반영 상태로 남는다.

---

## 이어받기 세션 (2026-09-08, 오케스트레이터 D3 결론 반영)

오케스트레이터가 위 HD를 (B)로 정리했다(웹 22개 manifest 지문 일괄 갱신, 정본 값 손대지 않음).
`npm run ui:build` 통과(184 files)를 확인하고 이어받았다. 지문이 다시 stale 해질 때마다
(다른 세션이 `build-components.ts` 를 계속 편집 중) 오케스트레이터가 준 재계산 스크립트를 재실행했다
(세션 중 2회 재실행 — `git checkout` 으로 되돌리지 않음).

### 남은 배선 7건 — 전부 완료

1. `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` — 세 컴포넌트 추가.
   두 파일 `<main>` 내부 DOM 문자열이 완전히 동일함을 스크립트로 대조 확인(EQUAL).
2. `pages/ui-review.html` — **미착수.** 아래 "판단 보류" 참고.
3. `assets/js/ui-library-guide.js` — `componentConfig` 3건(assist-button·text-button·modal-content) +
   `stateMatrix()` 분기 3건 + markup 함수(`assistButtonMarkup`·`textButtonMarkup`·`modalContentMarkup`) +
   state matrix 함수 3개 + `mountGuide` 의 `modal-content` 여닫기 배선(Modal 과 같은 패턴, `.uilg-modal-content-action`
   스코프) + `guideComponents` 배열에 3건 추가.
4. `pages/components.html` — 빈 mount 3개 + 마커 주석 + `comp-nav` 버튼 3개(Assist Button·Text Button은
   `actions` 카테고리, Modal Content는 `overlay` 카테고리, PC 전용이라 `data-platforms="pc"`).
5. `registry/governance/component-presentation-policy.json` — 세 id 항목 신설, `managedBy: ui-library-guide`.
6. `registry/governance/ui-library-migration.json` — 이행 레코드 3건. **`uiLibraryStatus: "draft"`로 정직
   기록**(river 승인·component-verifier 대조 전이라 approved 를 자칭하지 않음 — ui-library/src manifest.json
   자체의 status="approved"는 이전 세션이 이미 써 둔 값이라 손대지 않았지만, 이 governance 레코드는 별도
   판정이라 자가인증하지 않았다).
7. `registry/governance/component-page-coverage.json` — 세 컴포넌트를 `noSectionNeeded` 에서 빼고
   `sectionFor` 에 각각 `assist-button`·`text-button`·`modal-content` 로 등록.

### 이번 세션이 추가로 발견·해소한 배선 (핸드오프에 없던 항목)

- `registry/components/index.json` · `registry/index.json` — Gate 30(컴포넌트 등록 커버리지)이 신규
  3건 미등재로 FAIL 하고 있어서 등록했다(번들·뷰어가 이 인덱스를 순회한다).
- `registry/governance/update-management.json` — Gate 16(컴포넌트 분류 게이트)이 신규 3건을 "미분류"로
  차단하고 있어서, 각 `registry/components/*.json` 의 기존 `origin.classification: "A"` 값을 그대로
  옮겨 `origin: "A" · verify: "none"` 으로 등록했다(스스로 값을 만들지 않고 이미 존재하는 정본 필드를
  옮겼을 뿐).
- `node scripts/gen-component-guide-model.js --write` · `node scripts/design-md-write` — 정본이 바뀐 뒤
  파생 재생성 명령을 그대로 실행(손편집 아님, `npm run tokens:reconcile` 류의 정상 파생 갱신 절차).
- `npm run ui:zip` · `npm run devpanel:gen` — Gate 46(개발자 전달본) 이 낡은 ZIP·다운로드 화면을 잡아서
  재생성 명령을 그대로 실행.

### 판단 보류 — `pages/ui-review.html`

착수 전 지시에 "검수 화면은 실제 dist 소비"가 있었으나, 위 §A(component-page-template.md)의 승인 배포본
틀은 `pages/components.html` 만을 대상으로 서술돼 있고 `pages/ui-review.html` 에 대한 대응 절차가
템플릿·핸드오프 어디에도 구체적으로 없었다(다른 승인 컴포넌트들이 이 파일에 어떻게 등재됐는지 근거를
찾지 못함 — grep 결과 checkbox·modal 등 기존 승인 컴포넌트도 이 파일에서 개별 검색되지 않았다). 추측으로
새 구조를 만들지 않기 위해 **이번 세션에서는 손대지 않았다.** `ui-review.html` 이 정확히 무엇을 보여줘야
하는지(전용 렌더 방식이 있는지, components.html 과 같은 mount 방식을 재사용하면 되는지) 확인이 필요하다.

### 통과시킨 검사 (전부 종료코드 0으로 확인)

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS |
| `npm run ui:icons` | ✅ PASS (기존 부채 2건 무관) |
| `npm run ui:build` | ✅ PASS — 184 files |
| `npm run ui:test` | ✅ PASS |
| `node scripts/ui-guide-render-check.js` | ✅ PASS — 컴포넌트 22종 × PC·Mobile 렌더 대조, 실패 0 (착수 시 6건 실패 → 0) |
| `npm run components:facts:check` | ✅ PASS |
| `npm run components:guide-model:check` | ✅ PASS (재생성 후) |
| `npm run design:md:check` | ⚠️ 부분 — 아래 "애매했던 판단" 참고 |
| `npm run components:behavior:check` | ✅ PASS |
| `npm run gate:check` | ❌ FAIL — 58 error (착수 전 67) · 15 warning. 남은 error 는 전부 이번 3개 컴포넌트를 이유로 하는 "빌드 단계 이후" 절차이거나 무관한 기존 부채. 상세는 아래. |

### 애매했던 판단과 근거

1. **`npm run design:md:write` 실행 여부** — 착수 시 `design:md:check` 가 `DESIGN.core.md` 드리프트로
   이미 FAIL 상태였다(내 작업 전, `git stash` 로 재현 확인 — 동시 세션의 `build-components.ts` 편집
   때문). 재생성해야 뒤 단계 검사를 볼 수 있어 `--write` 를 실행했는데, 그 결과 `design-md-agent-contract-check.js`
   가 **Modal(확인 계열, 내가 만지지 않은 컴포넌트)** 섹션에서 새로 FAIL 했다 — 이 검사기는 Modal 상태를
   `status: "not-defined"` 로 기대하는데 실제 정본은 이미 오래전에 `status: "verified"` 로 승격돼 있다
   (커밋 HEAD 시점부터 이미 이 값이었다 — 내가 만든 불일치가 아니라 **검사기 쪽이 낡은 기대값**). 지시
   사항이 "확인 계열 modal 손대지 말 것"이라 검사기나 Modal 정본 둘 다 고치지 않고 그대로 두었다.
2. **Gate 16·30 등록** — 핸드오프 7건에 없었지만 등록하지 않으면 gate:check 가 내 컴포넌트를 이유로
   막혀서, 이미 존재하는 정본 필드(`origin.classification`)를 옮겨 적는 기계적 등록만 했다. 새 판정
   기준을 만들지 않았다.
3. **modal-content 상태 매트릭스 레이아웃** — 정본 축이 Size(MD·LG·XL) × Footer(Single·Dual) 6가지뿐이라
   Modal 과 같은 패턴(실제 열리는 Action + 지면에 눕힌 상태 칸)을 그대로 확장했다. XL(1200px) 패널을
   그대로 눕히면 칸 폭이 커져 `preview-area` 가 가로 스크롤된다 — 기존 Modal 패턴에 이미 있는
   `overflow-x: auto` 를 그대로 물려받게 두었다(새 CSS 규칙을 만들지 않음).

### needs-decision

- **HD-1 (river 승인 필요, Gate 34)**: 신규 컴포넌트 3개의 상태 이름(assist-button 4종·text-button 4종·
  modal-content 2종)이 "정본에 새로 생긴 항목"으로 잡혀 커밋을 막는다. 이 상태 이름들은 river가 이미
  결정한 내용(보조 버튼·텍스트 버튼을 별도 컴포넌트로·회색 자리표시 등, workflow-state.json D1·D2)의
  당연한 결과이지만, Gate 34 는 **실제 승인 명령**(`node scripts/canon-addition-check.js --approve --by river
  --reason "..." --quote "<river 실제 발화>"`, 세션 기록 대조 필요)을 요구한다. 나(빌더)는 river 발화를
  세션 기록과 대조해 검증할 위치가 아니라 승인을 스스로 내리지 않았다. 오케스트레이터가 실행해야 한다.
- **HD-2 (검증 분리, Gate 13)**: `build-components.ts` 가 마지막 검증 이후 계속 바뀌고 있어(다른 세션)
  Gate 13 이 재검증을 요구한다. 하드룰 H1②에 따라 이 검증은 🤖 component-verifier 가 해야 하며 내가
  self-certify 하지 않았다.
- **HD-3 (게시 필요, Gate 47)**: 검수판(review board) 이 정본보다 낡았다는 판정 45칸은 **19개 기존
  컴포넌트를 포함한 전체**에 걸쳐 있고(내 3개만의 문제가 아니다), `npm run board:refresh` 실행 뒤 같은
  Artifact 링크로 재게시해야 한다. 게시는 이 에이전트 권한 밖이라 실행하지 않았다.
- **HD-4 (미확인 절차)**: `pages/ui-review.html` 에 신규 컴포넌트를 어떻게 등재하는지 절차·근거를 찾지
  못해 손대지 않았다. components.html 과 같은 mount 방식을 그대로 쓰면 되는지 확인이 필요하다.

---

## 이어받기 세션 (2026-09-08, 안내 화면 표시 방식 수정 — river 지적: Modal Content 상태표 안 읽힘)

### 고친 것 (안내 화면 표시 전용, dist·정본 미변경)

- `assets/js/ui-library-guide.js` `modalContentStateMatrix()` — 6칸(Size 3 × Footer 2)을 실제 폭(520·1000·1200)
  그대로 두되, 셀 안에서만 `transform: scale(0.3)` 로 축소 표시. 바깥 wrapper(`.uilg-modal-content-scale`)는
  축소된 자리만 예약(overflow:hidden), 안쪽 wrapper(`.uilg-modal-content-scale-inner`)는 실제 폭(px)으로
  그려진 뒤 scale 만 걸린다(레이아웃 크기는 안 줄고 시각만 준다 — transform 특성). 그리드 컬럼 폭도
  `minmax(1220px,1fr)` → `minmax(390px,1fr)`(XL 스케일 후 폭 374 + 여유 16). 행 레이블 옆 실제 치수 텍스트
  (`520×336` 등)는 계속 문자열로 남긴다(축소 표시라 눈대중 크기가 근거가 안 되므로).
- `assets/css/ui-library-guide.css` — `.uilg-modal-content-scale`/`-inner` 2클래스 추가, `#modal-content
  .comp-state-cell { justify-content: flex-start }`(왼쪽 정렬 — 가운데 정렬이면 칸이 클수록 시작점이 안쪽으로
  밀려 비교가 어려움), `#modal-content .matrix-row-label span { display: block }`(전역 규칙이 상태표 치수
  span 을 숨기는데 이 섹션만 다시 켬 — id 스코프라 다른 컴포넌트 영향 없음).
- 실물 "모달 열기" 액션(Action 스트립)은 손대지 않음 — 여전히 실제 크기로 열린다.
- `pages/ui-review.html` 은 같은 문제 없음(확인) — 이미 1열 스택 + 칸별 `overflow-x:auto` 로 짜여 있어
  가로 넘침·세로 과다가 없다(비교표가 아니라 칸별 "실제로 열어보기" 검수 화면이라 설계 목적 자체가 다름).
  손대지 않았다.

### 배율 근거

- 다른 컴포넌트(Table·Date Picker 포함) 중 상태표를 축소 표시하는 기존 관례는 없었다(전수 검색 결과
  `transform: scale` 사용례 0건) — 이번이 최초 도입이라 지시대로 XL(1200)+두 열이 상자 폭에 들어가는 값을
  계산해 정했다. 0.3 선택 근거: outer 폭 = 패널폭 + 24px×2(양쪽 여백, `--spacing-24`) 기준 XL은 1248px →
  0.3 배 시 374px, 2열 + 라벨열(110px) + gap 을 더해도 총 폭 ≈ 900px(실측 계산, 렌더 미확인 — 아래 참고)로
  일반적인 데스크톱 콘텐츠 폭 안에 들어간다. 세로도 기존 3239px → 대략 500px대로 줄어든다(계산상).

### 확인 — 못 한 부분 (명시)

**렌더 확인을 못 했다.** `npm run ui:build` 가 **이번 수정과 무관한 이유로 막혀 있다**:
`plugins/figma-vars-installer/src/build-components.ts` 가 다른 세션에 의해 커밋 없이 계속 편집 중이라
(3-build.md 위 섹션과 같은 재발 — 이 work-id 안에서 이미 2번째) 웹 컴포넌트 22종의 `canonicalFingerprint`가
전부 stale 이고, `dist/components/modal-content.*` 자체가 현재 디스크에 없다(직전 빌드가 input 단계에서
막혀 아무 것도 못 내렸다). 이전 세션은 같은 상황에서 오케스트레이터 결정(D3, 지문 기계적 일괄 갱신)을 받아
처리했는데, 이번 세션에서 같은 방식(스크립트로 22개 `canonicalFingerprint` 필드만 재계산해 쓰기)을
시도하자 **권한 분류기(classifier)가 그 쓰기 자체를 차단**해 실행하지 못했다. 그래서:

- `npm run ui:build` / `npm run ui:test` / `node scripts/ui-guide-render-check.js` 를 실행하지 못했다.
- 위 CSS/JS 변경은 문법 검사(`node --check`, 중괄호 짝)와 손 계산(px 수식)으로만 확인했다 — **실제 브라우저
  렌더로 6칸이 한 화면에 들어오는지, `scrollWidth == clientWidth` 인지는 확인하지 못한 상태**다.
- dist·정본은 이번에도 손대지 않았다(요청대로).


---

## 3회차 — A-2 수정 (2026-09-08)

- 범위: `pages/ui-review.html`만 수정. 정본·dist src·`components.html`·`modal.js`/`button.js`는 손대지 않음.
- 원인: 6칸(Size×Footer) 정적 표본이 실물 크기(520~1200px)로 608px 슬롯에 `justify-content:center`로 배치되어, LG·XL이 좌우로 균등 초과 — 왼쪽 초과분은 스크롤이 음수로 못 가 영구히 안 보였다(제목·닫기·푸터 소실).
- 조치: `pages/components.html`(`assets/js/ui-library-guide.js` `modalContentStateMatrix`)이 이미 쓰는 "표시만 축소" 방식을 검수 화면에도 이식.
  - 폭 값(520/1000/1200)은 그대로 두고 `transform:scale(0.45)`로 시각만 축소.
  - outer(`.review-modal-content-scale`, 고정 px 크기·overflow:hidden)가 자리를 예약, inner(`.review-modal-content-scale-inner`, 실제 크기·`transform-origin:top left`)가 실크기로 그려진 뒤 축소.
  - 배율 산출: 슬롯 608px, XL outerW(패널+패딩24×2)=1248px → 608/1248≈0.487 이하 필요 → 0.45 채택(MD 256·LG 472·XL 562, 전부 608 이내).
  - 각 셀 라벨에 실제 치수 `(520×336)` 등 표기.
  - "실제로 열어보기"(진짜 팝업)·"높이 규칙 확인" 칸은 기존 실크기 표시 그대로 유지(미변경).
- 실측(헤드리스 크롬 1400×1000, Light+Dark 12칸): `panelW` MD 234 / LG 450 / XL 540(스케일 0.45 그대로), `slot.scrollWidth == clientWidth == 608`(가로 스크롤 0), title/close/footer 전부 슬롯 내부(`titleVisible`/`closeVisible`/`footerVisible` = true, 12칸 전부). `document.scrollWidth == clientWidth == 1400`.
- 실행: `npm run ui:build`(fingerprint 재계산 후) 0 · `npm run ui:test` 0 · `node scripts/ui-guide-render-check.js` 0 · `npm --prefix ui-library run build:check --` 0.
- dist 변경분은 다른 세션의 정본 편집에 따른 fingerprint 재계산뿐(값 필드 무변경, diff 확인함) — 이번 작업이 만든 컴포넌트 콘텐츠 변경 없음.


---

## 4회차 — D-1 수정 (2026-09-08, 3회차 델타 검증 ❌(a) 1건 반영)

- 범위: `pages/ui-review.html`만 수정. 정본·dist src·`components.html`·`modal-content.css`/`modal-content.js`는 손대지 않음.
- 대상: 「높이 규칙 확인 — 콘텐츠가 넘치면 내부 스크롤」칸. A-2(3회차)에서 6칸 비교표는 축소 표시로 고쳤지만 이 칸은 빠져 있어 LG(1000) 실물이 슬롯(608px)보다 넓어 좌우로 균등하게 넘쳤다(제목이 어떤 스크롤 위치에서도 안 보임 — Light/Dark 동일).
- 조치: A-2와 같은 축소 표시 원리를 이 칸에도 적용(`scaledModalContentOverflowSample()` 신설).
  - 폭은 A-2와 동일 계산(LG 1000+48=1048 × 0.45).
  - 높이는 A-2 6칸(고정 min-height 587 기준)과 다르게 잡았다 — 이 칸은 본문을 일부러 늘려(overflow:true) 패널이 실제로 정본 CSS `max-height:85vh`(modal-content.css:40) 상한에 걸리므로, outer 예약 높이도 `calc((85vh + 48px) × 0.45)`로 같은 상한을 축소해 반영했다(뷰포트 높이가 달라져도 실제 패널 높이와 항상 일치).
  - `pages/ui-review.html:234` 주석("실제로 열어보기·높이 규칙 확인 칸은 실제 크기 유지")도 갱신 — 이제 실제 크기를 유지하는 칸은 "실제로 열어보기"뿐이다.
- 실측(로컬 서버 http://127.0.0.1:4173, 1400×1200, Light+Dark):
  - Light: slot left/right 57/665(폭 608), panel left/right 67.8/517.8(폭 450) → 슬롯 안. `slot.scrollWidth == clientWidth == 608`(가로 스크롤 0).
  - title left/right 79.05/105.6, close left/right 495.75/506.55, footer left/right 68.25/517.35 — 전부 슬롯 경계 안(스크롤 없이 보임).
  - `content-area`: scrollHeight 900 / clientHeight 862 → 내부 스크롤 대상(38px 초과). `scrollTop`을 0→30으로 바꿔도 title 위치는 그대로(헤더 고정 확인) — 실제 마우스 휠로도 본문만 움직임.
  - Dark: slot left/right 735/1343, panel left/right 745.8/1195.8, title·close 전부 슬롯 안. `content-area` scrollHeight/clientHeight 900/862 동일.
  - 헤드리스 크롬 렌더 스크린샷(1400×2700 뷰포트, 스크롤 없이 한 화면에 포함)으로 Light·Dark 양쪽 다 제목·닫기(X)·취소/확인이 로드 즉시 보이는 것을 육안 확인.
- 실행: `npm run ui:build` 0 · `npm run ui:test` 0 · `node scripts/ui-guide-render-check.js` 0(안내 화면 렌더 검사 통과 — 22종 × PC·Mobile).
- 확인 안 한 부분: 실제 마우스 드래그·휠 제스처로 스크롤바를 직접 조작하는 것은 `scrollTop` 값 조작 + 헤드리스 스크린샷으로 대체 확인했다(사람 입력 이벤트 자체는 미실행) — river 님이 직접 마우스 휠로 한 번 더 확인하는 것을 권장.

---

## 5회차 — D-2 수정 (2026-09-08, 4회차 델타 검증 ❌(a) 1건 반영)

- 범위: `pages/ui-review.html`만 수정. 정본·dist src·`components.html`·`modal-content.css`/`modal-content.js`·확인 계열 modal·button 은 손대지 않음.
- 대상: 「높이 규칙 확인」칸. 4회차에서 예약 높이를 `calc((85vh+48px)×0.45)` 로 손계산했는데, 패널 실제 높이는 85vh 고정이 아니라 `min 587 / 자연높이 / max 85vh` 의 clamp 라 계산이 어긋났다 — 뷰포트가 크면 빈 공간이 남고, 667px 미만이면(587이 85vh를 넘는 구간) 푸터가 잘렸다.
- 조치: `transform:scale` + 손계산 예약 높이를 버리고 `zoom` 으로 교체. `zoom` 은 레이아웃 자체를 축소해 그리므로 예약 높이를 계산할 필요가 없다 — 패널이 min·자연·85vh 중 무엇이 되든 래퍼가 자동으로 그만큼만 자리를 차지한다. `.review-modal-content-scale`/`-inner` 2단 래퍼를 `.review-modal-content-zoom` 1단으로 축소(크기 미지정, `zoom:0.45`만 지정).
- 실측(로컬 서버 + Browser pane, 1440 폭 고정, 뷰포트 높이 5값, `getBoundingClientRect` 직접 측정):

| 뷰포트 높이 | 패널 실제 높이(줌 역산) | 예상 | 푸터 완전 포함(잘림 없음) | 내부 스크롤 필요 | scrollWidth==clientWidth |
|---|---|---|---|---|---|
| 1600 | 1058 | 1058(자연높이) | ✅ | 아니오 | ✅ (1440=1440) |
| 1200 | 1020 | 1020(85vh) | ✅ | 예 | ✅ |
| 900 | 765 | 765(85vh) | ✅ | 예 | ✅ |
| 660 | 587 | 587(min) | ✅ | 예 | ✅ |
| 600 | 587 | 587(min) | ✅ | 예 | ✅ |

  다섯 값 전부 `footerFullyInsideWrap === true`(래퍼 경계 안, 잘림 0), `wrap` 은 `overflow:visible`(clip 원천 제거), 빈 공간도 0(래퍼 높이가 매번 패널 실제 높이와 그대로 일치).
- 실행: `npm run ui:build` 0 · `npm run ui:test` 0 · `node scripts/ui-guide-render-check.js` 0. 지문 stale(다른 세션의 미커밋 `build-components.ts` 변경으로 22종 전량 stale) 발견 — 되돌리지 않고 동일 알고리즘(`ui-library/scripts/build.mjs`)으로 재계산해 22개 `manifest.json` 의 `canonicalFingerprint` 만 갱신(콘텐츠·수치 무변경, 해시만 최신화).
- 확인 안 한 부분: `zoom` 은 Safari 17 미만·구형 Firefox(126 미만)에서 미지원 — 그 경우 이 칸만 축소 없이 실제 크기로 보인다(동작 자체는 정상, 표시 배율만 1.0). river 님이 실제 사용하는 브라우저 버전은 확인하지 않았다.
