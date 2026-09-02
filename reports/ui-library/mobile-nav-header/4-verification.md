# 4-verification — Mobile Bottom Nav · Mobile Header (시나리오 F 독립 검증)

- 작업: `mobile-nav-header` · 검증자: 🤖 `component-verifier`(시나리오 F) · 날짜: 2026-09-02
- 규격: `.claude/skills/ui-library-code/references/verify-F.md` · 함정목록 `references/wiring-and-traps.md §2`
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts` `buildMobileBottomNav`(:2983) · `buildMobileHeaderVariant`(:3093) · `buildMobileHeader`(:3184)
- 검증자는 **아무 파일도 고치지 않았다.** `workflow-state.json` 도 수정하지 않았다. 이 보고서와 `screens/4v-*.png` 증거만 추가했다.

## 검문소 결과

> **FAIL 3건 · HOLD 2건 · BLOCKED 0건 → 검문소 미통과.**
> 권고 `workflowStatus: blocked` · `uiLibraryStatus: draft`(candidate 유지) · `lastCompletedCheckpoint: 3` 유지 ·
> `nextAction`: FAIL 3건을 `ui-library-builder` 가 고친 뒤 **4-verification 재실행**. 5-human-review 로 넘기지 않는다
> (FAIL 2건은 river 가 화면에서 바로 보게 되는 시각 결함이다).

---

## 0. 판정 요약표

| # | 항목 | 판정 | 한 줄 근거 |
|---|---|---|---|
| 1 | 정본↔상태파일 지문 대조 | **PASS** | `canonicalInputs` 7건 전부 현재 파일 sha256 과 일치 · `ui:state` PASS |
| 2 | manifest canonicalFingerprint 실산출 | **PASS** | 두 부품 재계산값이 선언값과 동일(40d88e15… / 8d2bea4c…) |
| 3 | variant·state·size 전수 대조 | **PASS** | 하단탭 state 2종 · 헤더 Type 6종 1:1 · 정본에 없는 축 신설 0건 |
| 4 | StatusBar·Platform 축 제외(D5)의 정당성 | **PASS** | river 결정 + `notInCanon` 선언 + 사유 기록 (단 선언 누락 1건 → §관찰 O-1) |
| 5 | 하단탭 '바' 제외(D1)의 정당성 | **PASS** | 정본 주석 :2982 + registry anatomy 둘 다 "바는 컴포넌트 아님" |
| 6 | source→dist 재생성 결정론 · 손편집 없음 | **PASS** | `ui:build` 재실행 후 `diff -r` 차이 0 |
| 7 | 토큰 배선 (하드코딩 hex 0건) | **PASS** | 부품 CSS 의 hex/rgb/hsl **0건** · 참조 변수 32종 전부 정의됨 |
| 8 | Light·Dark 토큰 전환 | **PASS** | 12개 색 토큰 전부 다크에서 다른 값으로 실측 전환 |
| 9 | 렌더 기하 대조 (하단탭) | **PASS** | 60×60 · gap 4 · 아이콘 32 · 라벨 12/500/15.6/0 실측 일치 |
| 10 | 렌더 기하 대조 (헤더 6종) | **PASS** | 360×56 · 여백 12/6 · 좌 20/16 · gap 8/0 · 타이포 4종 실측 일치 |
| 11 | 아이콘 hit area·frame·glyph 독립 실측 | **FAIL** | **F-1** `mobileHeaderArrowDown` 글리프 잉크가 잘려 원본과 다르다 |
| 12 | 아이콘 회전 방향 대조 | **FAIL** | **F-2** 정본은 아래(↓), 웹은 위(↑) — 부호 규약 반대로 옮겼다 |
| 13 | 아이콘 원본 색·레이어 대조 | **FAIL** | **F-3** 알림 신규 점이 빨강이 아니라 회색 — accent 자산이 dist 에 없다(404) |
| 14 | 아이콘 source↔dist 동일성 | **PASS** | 등록 5종 바이트 동일 · `ui:icons` errors=0 |
| 15 | 알림 아이콘 대조 경계(결합형 1건) 타당성 | **부분 PASS** | 픽셀 대조 경계는 타당(도형 바이트 동일 증명) / **등록 경계는 부당 → F-3** |
| 16 | 키보드·포커스 | **PASS** | 3개 버튼 전부 `:focus-visible` 매치 · outline 2px rgb(29,108,235) offset 2px |
| 17 | ARIA·접근성 이름 | **PASS** | `role=tab`+`aria-selected` · aria-label 3종 · 아이콘 전부 `aria-hidden` |
| 18 | 터치 영역 44×44 | **PASS** | ±21px 히트테스트 7/7 버튼 적중 · ±23px 전부 비적중 = 정확히 44 |
| 19 | 오류 연결 · reduced motion | **PASS(해당없음)** | 정본에 Error·모션 없음 · CSS 에 transition/animation 0건 |
| 20 | jsRequired=false 선언의 사실성 | **PASS** | `runtime:null`·`init` 미존재 · auto-init 미등록 · 동적 삽입 4개 정상 |
| 21 | 다중 인스턴스 · 동적 재삽입 · 제거 | **PASS** | 로드 후 삽입 4칸 각각 60×60 · 선택 1칸만 파랑 · 중복 id 0 · 제거 후 잔여 0 |
| 22 | 빈 HTML 소비(전체묶음) | **PASS** | `empty-consumer.html` 렌더 정상 · 런타임 부재 단정 통과 |
| 23 | 빈 HTML 소비(개별설치) | **PASS** | 두 부품 CSS `<link>` 등재 · `<main>` DOM 완전 동일 |
| 24 | 전체묶음 ↔ 개별설치 동일성 | **PASS** | 계산스타일·기하 전항목 동일 + **픽셀 diff 0바이트**(2쌍) |
| 25 | 빈 소비자 화면에서 하단탭 표출 방식(B1 해소) | **HOLD** | **H-1** 바가 없어 탭 칸이 세로로 쌓인다 — "배포본만으로 제대로 보인다"를 이 부품은 증명 못함 |
| 26 | 배포 예제(`examples/mobile-bottom-nav.html`) 자체 유효성 | **HOLD** | **H-1** `role=tab` 이 `tablist` 없이 홀로 배포된다 |
| 27 | 안내 페이지가 실제 dist 만 소비 | **PASS** | `components.html`·`ui-review.html` 모두 dist 3파일만 · 부품 selector 재구현 0건 |
| 28 | 안내 페이지 실제 렌더 (Action 영역 존재) | **PASS** | 승격 후 모습을 읽기전용 오버레이로 미리 렌더 — 2섹션 모두 Action 표출 |
| 29 | 코드탭 생성 출처 | **PASS** | `ui-library-guide.js:119` 가 `dist/examples/{id}.html` 을 fetch |
| 30 | 등록부·거버넌스 배선 | **PASS** | a11yStatus=implemented · migration 2건 · `managedBy:ui-library-guide` |
| 31 | presentation-policy 선언 ↔ 실제 화면 | **HOLD** | **H-2** 헤더 정책 note 는 "상태 매트릭스도 목업 위"라는데 실제는 평면 목록 |
| 32 | `ui:contract` · `ui:test` · `ui:icons` · 아이콘 원본 게이트 | **PASS** | 전부 errors=0 (재실행 실측) |
| 33 | `gate:check` 전체 | **미확인(외부 실패)** | 현재 **4 error** — 전부 Gate 6c 설치기 zip 카드날짜, 이 작업 범위 밖 |
| 34 | Gate 44 안내화면 렌더 검사가 이 2종을 덮는가 | **미계측** | `ui-guide-render-check.js:134` 가 candidate 를 제외 — 승격 후 재실행 필요 |
| 35 | 폰트 정체성(Pretendard) | **PASS(조건부)** | 부품 CSS 는 family 미지정(호스트 소유) · 소비 화면 3곳 모두 Pretendard 선언 |
| 36 | Figma V3.0 캔버스 대조 | **미확인** | 상태파일이 `source: not-consulted`(코드 정본으로 충분) 로 선언 — 규격상 참고 대상 아님 |

---

## 1. ❌ FAIL — 반드시 고칠 것 (전부 (a) 코드 실수)

> 세 건 모두 **정본↔파생** 관계다. 두갈래 분류를 적용하지 않는다(하드룰 H6) — 파생을 고친다.

### F-1. `mobileHeaderArrowDown` 글리프가 잘려 원본보다 작게 그려진다

**무엇:** 웹 자산 `mobile-header-arrow-down.svg` 의 안쪽 `<svg data-s1-part="glyph">` 뷰포트가 **획(stroke) 좌표 기준**이 아니라 **경로(path) 좌표 기준**으로 잡혀 있다. 중심 정렬 획의 바깥 절반이 중첩 `<svg>` 뷰포트에 잘린다.

**독립 실측(48px 프레임, 24 좌표계 환산):**

| 대상 | 잉크 경계상자 | 잉크 총량 | 프레임전체 평균오차 | 글리프영역 평균오차 |
|---|---|---|---|---|
| Figma 원본 `assets/icons/ic_화살표더보기_solid.png` | (9.50, 7.00) **6.00 × 10.00** | 50.4 | — | — |
| 현재 웹 자산(2겹 구조) | (10.00, 7.50) **5.00 × 9.00** | 43.8 (**−13%**) | 0.00372 | **0.02484** |
| 잘림 없는 대조본(같은 도형을 바깥 24 viewBox 에 직접) | (9.50, 7.00) **6.00 × 10.00** | 52.5 | **0.00089** | — |
| 대조군 `home`(채움 도형) | 원본과 동일 | 비율 1.003 | 0.00169 | 0.00337 |

- 잘림 없는 대조본이 오차 **0.00089** 로 4.2배 좋아진다 = 원인이 뷰포트 잘림임이 실증된다.
- **왜 게이트가 통과했나:** `ui-library-icon-origin-check.js` 는 **24 프레임 전체 평균**으로 판정한다(임계 0.015). 이 글리프는 프레임의 약 3% 만 차지해 13% 잉크 손실이 0.00372 로 희석됐다. **글리프 영역만 재면 0.02484 로 임계를 넘는다.**
- manifest `geometry.glyph = (10.375, 7.75) 4.25×8.5` 도 **획을 포함한 잉크 경계가 아니라 경로 경계**다 — 획 기반 글리프에는 성립하지 않는 선언이다.

**근거:** `ui-library/src/assets/icons/mobile-header-arrow-down.svg` (안쪽 `<svg x="10.375" y="7.75" width="4.25" height="8.5" viewBox="0 0 4.25 8.5">` 안에 `stroke` 폭 1 의 경로) · 실측 스크립트 결과 위 표 · `reports/ui-library/mobile-nav-header/screens/4v-icon-arrow-vs-origin.png`

**분류:** ❌(a). 채움 전용 4종(home·back·close·notification)은 같은 문제가 없다(전부 정확 일치) — 획 기반 글리프에만 2겹 구조 규칙이 맞지 않는다.

### F-2. 아래화살표가 **위쪽(↑)** 으로 그려진다 — 정본은 아래(↓)

**무엇:** 정본은 `makeRequiredIconInstance("mobileHeaderArrowDown", iconDark, 24, undefined, -90)` 으로 인스턴스 `rotation = -90` 을 준다. **Figma `rotation` 은 반시계 양수**이므로 −90 = 시계 90° → 오른쪽 쉐브론(`>`)이 **아래(`v`)** 를 향한다. 웹 CSS 는 같은 숫자를 그대로 `transform: rotate(-90deg)` 로 옮겼는데 **CSS 는 시계 양수**라 −90 = 반시계 90° → **위(`^`)** 를 향한다. 부호 규약이 반대다.

**실측:** 계산 transform = `matrix(0, -1, 1, 0, 0, 0)`(반시계 90°). 렌더 결과가 `^` 로 확인된다.

**정본·문서와의 모순 3중:**
- 아이콘 id 가 `mobileHeaderArrowDown`
- 정본 상태파일: "헤더에서는 −90° 회전해 **아래 방향**"(`workflow-state.json` iconNodes.mobileHeaderArrowDown.note)
- 부품 CSS 주석: "서브타이틀 옆 **아래화살표** — 원본은 −90° 회전해 **아래 방향으로 쓴다**"(`mobile-header.css:102`)

즉 **선언은 전부 '아래', 실제 렌더는 '위'** 다. 숫자가 같아도 시각이 다른 전형적인 사례(시각 매칭 2대 원리 ①).

**근거:** `ui-library/src/components/mobile-header/mobile-header.css:110` (`transform: rotate(-90deg)`) · `screens/4v-matrix-light.png`·`4v-matrix-dark.png`(홈 타이틀 옆 `^`) · `screens/4v-zoom-notification-arrow.png`(×8 확대) · `screens/4v-ui-review-14-15.png`(실제 검수 화면에서도 `^`)

**분류:** ❌(a).

### F-3. 알림 아이콘의 '신규' 점이 **빨강이 아니라 회색** 으로 배포된다

**무엇:** 정본은 본체 `color/icon/gray-dark` + 신규 점 `color/icon/red` **2색**이다(`build-components.ts:3173` `accentVar = scv(maps,"color/icon/red")`). 웹은 `::after` 두 번째 마스크로 2색을 만드는데, 그 마스크가 가리키는 **`mobile-header-notification-accent.svg` 가 dist 에 존재하지 않는다(HTTP 404).** 마스크 이미지 로드 실패 → `::after` 가 전부 마스크아웃 → 아래 본체색(회색)이 그대로 보인다.

**원인(확정):** `ui-library/scripts/build.mjs:41·73·132` 는 **`assets/icons/manifest.json` 의 `icons` 배열에 등록된 자산만** dist 로 복사한다. 빌더가 accent 를 "비등록 보조 자산"으로 두었기 때문에(3-build.md §G) 복사 대상에서 빠졌다.

**증명(3단 비교 · `screens/4v-notification-accent-404.png`):**

| 조건 | 결과 |
|---|---|
| src 자산(파일 존재) + 같은 2겹 규칙 | **빨간 점** — Figma 원본과 일치 |
| dist 자산(accent 404) = 실제 배포본 | **회색 점** — 정본 불일치 |
| Figma 원본 PNG | 빨간 점 |

- 즉 **2겹 마스크 기법 자체는 정상**이다. 결함은 오직 "자산이 dist 에 없다" 한 가지이므로 수정 방향이 분명하다.
- `ls ui-library/dist/assets/icons/` 에 `mobile-header-notification-accent.svg` 없음 / `curl` 404 확인.
- 보조 증거: `registry/governance/ui-library-migration.json` 의 mobile-header `dependencies` 에는 이 파일이 **의존물로 선언돼 있다** — 장부는 필요하다고 말하는데 빌드가 내보내지 않는다.
- 실제 소비 화면에서도 재현: `pages/ui-review.html` 15번 섹션(`screens/4v-ui-review-14-15.png`)에서 회색 점. 같은 화면 본문은 "알림 아이콘은 2색(본체 gray-dark + 신규 점 red)이라 CSS 마스크 2겹으로 표현합니다"라고 쓰여 있어 **화면이 자기 설명을 배반한다.**

**왜 모든 게이트가 통과했나(사각지대):**
- `ui:icons`·아이콘 원본 게이트는 **등록된 아이콘만** 검사한다 → 비등록 자산은 검사 대상 밖.
- `ui-library/scripts/test.mjs:362` 도 `iconManifest.icons` 순회뿐 → **부품 CSS 의 `url(...)` 이 dist 에서 실제로 해석되는지 검사하는 장치가 없다.**
- 빈 소비자 화면·코드탭 예제에는 알림 유형(`home-title-subtitle`)이 없어 눈으로도 안 걸렸다.

**분류:** ❌(a).

**§ 빌더가 올린 경계 질문에 대한 판정 (3-build.md §G):**
- **픽셀 대조를 결합형 1건으로 한 것 = 타당(PASS).** accent 의 경로 `d` 값이 등록 자산 `mobile-header-notification.svg` 의 **두 번째 경로와 바이트 단위로 동일**하고 glyph 프레임 속성(`x/y/width/height/viewBox`)도 완전히 동일함을 결정론적으로 확인했다. 부분 도형을 따로 픽셀 대조할 이유가 없다.
- **점 레이어를 '등록'에서 뺀 것 = 부당(FAIL).** 이 저장소에서 **등록(icon manifest)이 곧 배포 통로이자 게이트 적용 범위**다. 등록에서 빼면 자산이 dist 에 안 실리고, 어떤 검사기도 그 사실을 못 본다. "대조 방식"과 "등록 여부"는 분리해서 결정해야 했다.

---

## 2. ❓ HOLD — 확인 필요 ((c) 애매 · 검증자가 임의 판정하지 않음)

### H-1. "혼자서는 완성될 수 없는 부품"을 배포 표면에서 어떻게 보여줄지

정본이 "4탭 바는 컴포넌트가 아니다"(`build-components.ts:2982`)라고 선언한 것 자체는 맞고, B1 해소(인라인 style 제거·`role="tablist"` 유지)의 **정본 충실성은 PASS** 다. `role=tablist` 를 남긴 것도 ARIA 상 `role=tab` 의 유효 조건이라 옳다. 다만 두 가지 부작용이 남는데, 어느 쪽을 기준으로 삼을지는 계약 소유자 판단이 필요하다.

1. **빈 소비자 화면**(`ui-library/verification/empty-consumer.html:149-158`): 바 레이아웃이 없어 탭 칸 2개가 **세로로 쌓여** 그려진다(`screens/4v-empty-consumer-bundle.png`). 이 화면의 목적("소비자는 CSS 를 한 줄도 안 써도 배포본만으로 제대로 보인다")을 **이 부품에 대해서는 증명하지 못한다.** 그런데 검사기(`test.mjs:374`)가 이 화면의 인라인 style 을 금지하므로 화면 안에서 해결할 방법이 없다.
2. **배포 예제**(`ui-library/dist/examples/mobile-bottom-nav.html`): `role="tab"` 버튼 1개만 들어 있어 **그대로 복사하면 tablist 없는 홀로된 `role=tab`** 이 된다(무효 ARIA). registry a11y 는 "탭 목록은 role=tablist·각 항목 role=tab 으로 표시"를 요구하는데 배포 예제는 그 요구를 스스로 만족하지 못한다.

**선택지(river/오케스트레이터 판단):**
- **(A)** 지금 그대로 둔다 — 대신 빈 소비자 화면과 예제에 "이 부품은 화면이 `role=tablist` 컨테이너로 조립한다"를 **문서로만** 명시. 배포 예제는 조립 없는 조각으로 인정.
- **(B)** 예제·빈 소비자 화면에 **꾸미기 없는 `<nav role="tablist">` 래퍼만** 포함(레이아웃·배경은 여전히 화면 소유). 인라인 style 금지 규칙과 충돌하지 않는다.
- **(C)** 바 레이아웃을 **선택 부품(optional part)** 으로 배포본에 정식 편입 — 정본 선언을 바꾸는 일이므로 Gate 34 승인 사항.

**안 정하면:** 현재대로 (A) 이며, 배포 예제를 복사한 개발자가 무효 ARIA 를 만들 수 있다.

### H-2. 헤더 안내 화면의 표출 방식 선언과 실제 화면이 다르다

`registry/governance/component-presentation-policy.json` 의 `components.mobile-header.note` 는 **"Action·상태 매트릭스 모두 360×780 모바일 목업 위에서 보여준다(D6)"** 라고 선언한다. 실제 구현은 Action 만 목업 위에 올리고, Type 6종 상태 매트릭스는 **평면 목록**(`ui-library-guide.js:1402` `uilg-mobile-header-list`)이다(`screens/4v-guide-mobile-header.png`).

- river 결정 D6 원문은 "안내 화면에서 실제 360×780 모바일 목업 위에 올려 보여준다"까지이고, "상태 매트릭스도"는 정책 note 에서 추가된 말이다.
- 실제 구현(평면 목록)은 부품 표본 격리 규칙(`data-guide-sample="part"`)과 더 잘 맞는다 — 목업 크롬 위에 6종을 올리면 표본에 부품 아닌 것이 섞일 위험이 커진다.
- 그래서 **정책 note 를 화면에 맞게 고칠 일**인지 **화면을 note 에 맞게 고칠 일**인지 검증자가 정할 수 없다. registry 는 메타의 기준이지만, 이 note 는 river 결정문을 확장한 것이라 확장분의 권한이 불분명하다.

**선택지:** **(A)** 정책 note 를 실제 화면대로 정정("Action 은 목업, 상태 매트릭스는 목록") / **(B)** 상태 매트릭스도 목업 위로 옮긴다. **안 정하면** 선언과 화면이 계속 어긋난 채로 남는다.

---

## 3. 상세 근거

### 3-1. 지문·결정론 (항목 1·2·6)

```
canonicalInputs 7건 → 전부 MATCH (build-components.ts / vars-data.ts / textstyles-data.ts /
  ui-library-code-contract.json / registry mobile-bottom-nav·mobile-header / icons manifest)
npm run ui:state -- reports/ui-library/mobile-nav-header/workflow-state.json → ✅ PASS
manifest 지문 재계산: mobile-bottom-nav 40d88e15f0bb… = 선언값 / mobile-header 8d2bea4c0ccb… = 선언값
npm run ui:build 재실행 후 diff -r (재생성 전 사본 ↔ 재생성 후) → 차이 0 "NO DRIFT"
src/components/{id}/{id}.css == dist/components/{id}.css → true (두 부품)
s1-ui.css 의 component 구간 == 개별 CSS(아이콘 경로 재작성 후) → true (두 부품)
```

`3-build.md §B` 가 적은 지문(`9c152fe7…`·`47bb563d…`)은 **현재값과 다르다**(등록부 수정 뒤 재산출된 것으로 보인다). manifest·dist 가 서로 일치하고 재계산도 맞으므로 실물에는 문제가 없으나, **3-build 보고서의 그 수치는 낡았다**(문서 정정 대상).

### 3-2. variant·state·size 전수 대조 (항목 3~5)

| 정본 | 배포본 | 판정 |
|---|---|---|
| `state=unselected` / `state=selected` | `aria-selected="false"` / `"true"` | ✅ 1:1 |
| hover·disabled 없음 | 만들지 않음 | ✅ D2 준수 |
| 60×60 고정, 크기 축 없음 | `sizes: []` | ✅ |
| `Type=Home / Title` … 6종 | `home-title` … 6종 (`canonicalVariantMap`) | ✅ 1:1 |
| `Platform=[App, Web]` | 제외 (`notInCanon.platform`) | ✅ D5 (§O-1 참조) |
| StatusBar 27/77, root 99/149 | 제외 (`notInCanon.statusBar`) | ✅ D5 |
| 삭제된 `Home / Title + 2 Icons` | 만들지 않음 | ✅ |

**D5 제외 판정 근거:** ①river 가 결정자 자격으로 2026-09-02 승인 ②부품 manifest `notInCanon` 에 사유가 기계가독으로 선언됨 ③사유가 실질적으로 타당하다(상태바·주소창은 OS·브라우저 소유라 웹 코드로 내보내면 가짜 크롬이 된다) ④Type 축은 온전히 보존됐다. 따라서 "정본에 있는데 파생에서 뺐다"가 **미신고 누락이 아니라 신고된 범위 축소**다.

**D1 제외 판정 근거:** 정본 주석(`build-components.ts:2982` "4탭 '바'는 설치기에서 만들지 않음 — Tab Item 세트만")과 registry `anatomy` 의 `{"part":"바(bar)","role":"컴포넌트가 아님 …"}` 이 **독립적으로 같은 말**을 한다. 부작용은 H-1 로 분리했다.

### 3-3. 실제 렌더 실측 — PC·Mobile × Light·Dark

렌더 방법: 저장소 루트를 로컬 HTTP(127.0.0.1)로 서비스하고, **실제 dist** (`dist/assets/css/tokens.css` + `typography.css` + `s1-ui.css`)만 물린 정적 매트릭스를 헤드리스 크롬으로 렌더 → `getBoundingClientRect` + `getComputedStyle` 전항목 수집(함정 T1·T2·T4 회피). 다크는 `data-theme="dark"`.
증거: `screens/4v-matrix-light.png` · `screens/4v-matrix-dark.png`

**하단 탭 (Light / Dark)**

| 정본 | 실측 | 판정 |
|---|---|---|
| 60×60 FIXED, VERTICAL, 가운데 정렬 | 60×60, `column`, `center`/`center` | ✅ |
| `itemSpacing 4` | `gap: 4px` (아이콘 하단 36.2 → 라벨 상단 40.2) | ✅ |
| `fills = []` (배경 투명) | `rgba(0,0,0,0)` | ✅ |
| 아이콘 32 | 32×32 | ✅ |
| unselected 아이콘 `color/icon/gray` | `rgb(85,87,95)` = 토큰 프로브 동일 / 다크 `rgb(138,140,150)` | ✅ |
| selected 아이콘 `color/icon/blue` | `rgb(29,108,235)` / 다크 `rgb(48,112,216)` | ✅ |
| 라벨 12 Medium (body/12M = 130% · 0%) | `12px / 500 / 15.6px / normal` | ✅ |
| unselected 라벨 `navigation/label/default` | `rgb(85,85,85)` / 다크 `rgb(85,87,95)` | ✅ |
| selected 라벨 `navigation/label/selected` | `rgb(29,108,235)` / 다크 `rgb(48,112,216)` | ✅ |

**헤더 6종 (Light / Dark)**

| 정본 | 실측 | 판정 |
|---|---|---|
| AppBar 360×56 | 6종 모두 360×56 | ✅ |
| 여백 상하 12 (`Home / Title + Subtitle + 1 Icon` 만 6) | `12px` 5종 · `home-title-subtitle` 만 `6px` | ✅ |
| 좌 여백 Home 20 / Standard 16, 우 16 | `padding: 12px 16px 12px 20px` (home) · `… 16px` (standard) | ✅ |
| `itemSpacing 8`(Standard) / 미설정=0(Home) | `gap: 8px` / `normal`(=0) | ✅ |
| 배경 `color/bg/home`(Home) | `rgb(245,246,251)` / 다크 `rgb(12,29,56)` | ✅ |
| 배경 `color/bg/level-0`(Standard) | `rgb(255,255,255)` / 다크 `rgb(13,14,18)` | ✅ |
| Standard 제목 18 Medium `title/18M`(130% · −2%) 중앙 | `18px / 500 / 23.4px / −0.36px`, `text-align:center` | ✅ |
| Home 제목 18 Bold `title/18B`(130% · 0%) 좌측 | `18px / 700 / 23.4px / normal`, `left` | ✅ |
| 서브타이틀 14 Regular `body/14R`(130% · −2%), `text/body/tertiary` | `14px / 400 / 18.2px / −0.28px`, `rgb(117,117,117)` / 다크 `rgb(138,140,150)` | ✅ |
| 제목 색 `text/title/primary` | `rgb(0,0,0)` / 다크 `rgb(236,237,240)` | ✅ |
| 2줄 스택 gap 2, 제목행 gap 4 | 제목행 하단 229.9 → 서브 상단 231.9 (=2) · 제목 우단 86.375 → 화살표 90.375 (=4) | ✅ |
| 액션 슬롯 32×32, 아이콘 24 | back·close·notification 32×32 · 아이콘 24×24 | ✅ |
| 아이콘 색 `color/icon/gray-dark` | `rgb(53,53,53)` / 다크 `rgb(184,186,191)` | ✅ |
| 알림 accent `color/icon/red` | **회색으로 렌더 → F-3** | ❌ |
| 화살표 24, −90° | 24×24 / 회전 방향 반대 → **F-2** · 글리프 잘림 → **F-1** | ❌ |

토큰 프로브 12종 전부 Light↔Dark 값이 다르게 해석됨(다크 대응 실재 확인).

### 3-4. 아이콘 독립 실측 — 틀(frame)·도형(glyph)·source↔dist

각 자산을 192px 로 래스터화해 잉크 경계상자를 **직접 측정**하고, 같은 좌표계로 환산한 Figma 원본 내보내기와 대조했다(빌더 선언값을 신뢰하지 않고 재측정).

| id | manifest 선언 glyph | 웹 자산 실측 잉크 | Figma 원본 실측 잉크 | source==dist | 판정 |
|---|---|---|---|---|---|
| `home` | (3, 3.9983) 18×16.0034 | (3, 4.000) 18×16.000 | (3, 4) 18×16 | ✅ | ✅ |
| `mobileHeaderBack` | (3, 4.2137) 18×15.5726 | (3, 4.188) 18×15.625 | (3, 4) 18×16 | ✅ | ✅ (48px 양자화 범위) |
| `mobileHeaderClose` | (4, 4) 16×16 | (4, 4) 16×16 | (4, 4) 16×16 | ✅ | ✅ |
| `mobileHeaderNotification` | (3, 3.0024) 18×17.9953 | (3, 3.000) 18×18.000 | (3, 3) 18×18 | ✅ | ✅ (도형) / ❌ (색 = F-3) |
| `mobileHeaderArrowDown` | (10.375, 7.75) 4.25×8.5 | **(10.375, 7.75) 4.25×8.5** | **(9.5, 7) 6×10** | ✅ | ❌ **F-1** |

- **hit area·frame·glyph 를 서로 대신하지 않았다:** hit area 는 히트테스트(±21 적중 / ±23 비적중 = 44×44), frame 은 SVG 바깥 24×24 및 슬롯 32×32, glyph 는 위 잉크 실측으로 각각 따로 측정했다.
- 등록 5종의 `sourceKey` 가 정본 `ICON_KEYS`(`build-components.ts:1180-1184`)와 **완전 일치**(정확 대조 항목 — 두갈래 미적용).
- `npm run ui:icons` → `UIICON_SUMMARY icons=11 errors=0`(적대 테스트 통과) · `ui-library-icon-origin-check.js` → `icons=9 errors=0 warnings=2`. 경고 2건(`check`·`edge_set`)은 이 작업 소유가 아닌 기존 부채.
- 5종의 `svgSha256` 이 `reports/ui-library/icon-origin-verification.json` 기록값 및 manifest `webAssetFingerprint` 와 일치 = 3-build 이후 자산이 바뀌지 않았다.

### 3-5. 접근성·행동 (항목 16~21)

```
포커스: nav/back/close 각각 focus({focusVisible:true}) → matches(":focus-visible")=true,
        outline "2px solid rgb(29,108,235)", outline-offset "2px"  (= --border-width-2 · --color-form-control-border-selected · --spacing-2)
CSSOM: :focus-visible 규칙 2건이 dist CSS 안에 실제 존재 확인
탭 순서: 문서 순서 그대로 nav → back → close (임의 tabindex 없음)
접근성 이름: 하단탭 = 라벨 텍스트("홈") · back "이전" · close "닫기" · notification "알림"
아이콘: 전부 aria-hidden="true" (장식)
44×44 터치: 7개 액션 버튼 × (±21 전부 BUTTON 적중 / ±23 전부 비적중) → 정확히 44×44, 인접 요소와 겹침 없음
::before 실측: content:"" · position:absolute · inset −6px 4방향 (32+12=44)
런타임: jsRequired=false · runtime=null · init 미존재(undefined) · auto-init.js 미등록
다중/동적: 로드 후 4칸 동적 삽입 → 전부 60×60, 2번째만 파랑, 중복 id 0건, innerHTML="" 후 잔여 노드 0
모션: dist CSS 에 transition/animation/@keyframes 0건 → reduced-motion "not-applicable" 선언과 일치
```

`role=tab` 의 tablist 컨테이너 요구는 H-1 로 분리했다(선언은 있으나 배포 예제가 스스로 만족하지 못함).

### 3-6. 설치 동일성 (항목 22~24)

```
<main> DOM: empty-consumer.html ↔ empty-consumer-individual.html  → diff 없음
개별 소비본에 두 부품 CSS <link> 등재 (empty-consumer-individual.html:25·26)
계산스타일·기하 전항목(root+모든 part, 8케이스, Light·Dark): 전체묶음 == 개별설치 → true
픽셀 diff: empty-consumer 전체페이지 2000×4800 → 다른 바이트 0 / 28,800,000
픽셀 diff: 8케이스 매트릭스 840×1120 → 다른 바이트 0 / 2,822,400
package.json exports 6줄 · index.js/s1-ui.js/s1-ui.auto.js export 2건 확인
```

### 3-7. 안내 페이지 (항목 27~29)

- `pages/components.html:9-12` · `pages/ui-review.html:7-10` — 의존은 Pretendard CDN + **dist 3파일뿐**. 컴포넌트 CSS/JS 를 별도로 물지 않는다.
- `assets/css/ui-library-guide.css` 안의 부품 selector 언급은 2줄뿐이며(`:572`·`:597`) 모두 **폭 지정**(`width:100%` / `max-width:360px`)이다 — 색·여백·타이포 재구현 0건. 다만 §O-3 참조.
- 코드탭: `ui-library-guide.js:119` `new URL("../../ui-library/dist/examples/{id}.html")` → **source example 에서 생성된 dist 예제**를 fetch. ✅
- 안내 화면 실제 렌더: dist manifest 의 두 부품 `status` 를 **읽기전용 오버레이 서버에서만** `verified` 로 바꿔 내려보내 승격 후 모습을 미리 확인했다(**저장소 파일 무수정**). 두 섹션 모두 Action 영역·상태 매트릭스·코드탭이 정상 표출된다 → 함정 T6("미계측을 통과로 보지 않는다") 대응 완료. 증거 `screens/4v-guide-bottom-nav.png` · `screens/4v-guide-mobile-header.png`
- 현재(승격 전) `pages/components.html` 이 "승인 배포본을 불러오지 못했습니다"를 표출하는 것은 `ui-library-guide.js:1576` 의 의도된 상태 게이트다 — **결함 아님**(확인함).

---

## 4. 관찰 사항 (판정 아님 · 고치면 좋은 것)

- **O-1. `notInCanon` 선언이 D5 범위를 다 못 담는다.** StatusBar·Platform 은 선언돼 있으나, 정본이 함께 갖는 **root 세로 컨테이너(`itemSpacing 16` = 상태바↔AppBar 간격, root fill, 360×99/149)** 는 언급이 없다. 범위 축소를 기계가독으로 완결하려면 이 항목도 `notInCanon` 에 적는 것이 맞다.
- **O-2. 안내 화면 목업이 정본 간격을 반영하지 않는다.** 정본은 상태바와 AppBar 사이 16px 간격에 root 배경색이 보이는데, 목업은 상태바 띠에 헤더가 바로 붙어 있다(`screens/4v-guide-mobile-header.png`). 목업은 D6 로 "안내 화면 전용 크롬"이라 선언돼 계약 위반은 아니지만, 5-human-review 에서 river 가 볼 지점이다.
- **O-3. 안내 화면 CSS 가 부품 공개 selector 에 `max-width` 를 건다.** `ui-library-guide.css:597`. manifest `cssContract.customization` 은 "공개 selector 의 구조를 override 하지 않는다"고 하므로, 래퍼 쪽에 폭을 주는 편이 계약에 더 맞다. 값 자체는 정본 360 과 같아 시각 피해는 없다.
- **O-4. `standard-no-title` 의 빈 제목 자리 높이가 24 다**(`mobile-header.css:56`). 정본 grow 프레임은 32 다. 내용이 없고 root 높이가 56 고정이라 **렌더 결과는 동일**함을 실측으로 확인했다(6종 모두 360×56). 값만 정본과 다르다.
- **O-5. 안내 화면 `componentConfig` 의 `runtime` 항목이 죽은 배선이다.** `ui-library-guide.js:102·108` 이 `S1UI.mobileBottomNav`/`mobileHeader` 를 넣지만 `init` 호출은 명시적 id 목록으로 제한돼(`:1626`) 이 둘을 포함하지 않는다. 지금은 무해하지만 목록이 늘 때 `TypeError` 위험이 있다.
- **O-6. registry note 의 줄번호가 낡았다.** `registry/components/mobile-bottom-nav.json` `_meta.notes` 가 `build-components.ts:2604`·`components.html:6279` 를 인용하는데 현재 정본 주석은 `:2982` 이고 그 손관리 섹션은 3-build 에서 삭제됐다.
- **O-7. `3-build.md §B` 의 지문 2건이 현재값과 다르다**(§3-1). 문서 정정 대상.
- **O-8. 게이트 사각지대 2건 — 검사기 보강 권고.**
  ① **부품 CSS 의 `url(...)` 자산이 dist 에서 실제로 해석되는지 검사하는 장치가 없다**(F-3 의 통과 경로). `test.mjs` 에 "CSS 가 참조하는 모든 자산이 dist 에 존재" 검사를 넣으면 결정론적으로 막힌다.
  ② **아이콘 원본 대조가 프레임 전체 평균만 본다**(F-1 의 통과 경로). **글리프 경계상자 내부 평균**을 함께 판정하거나, 획 기반 글리프의 잉크 경계를 선언·대조하도록 규칙을 보강해야 한다.

---

## 5. 검사기 실제 실행 결과 (재실행 실측)

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ `UI_CONTRACT_SUMMARY status=candidate errors=0` |
| `npm run ui:build` | ✅ 103 files · 재생성 후 dist 차이 0 |
| `npm run ui:test` | ✅ 통과 |
| `npm run ui:icons` | ✅ `icons=11 errors=0` (적대 테스트 통과 · warnings 2 = 기존 부채) |
| `node scripts/ui-library-icon-origin-check.js` | ✅ `icons=9 errors=0 warnings=2 threshold=0.015` (단 F-1 은 이 판정 방식의 사각지대) |
| `npm run ui:state -- …/workflow-state.json` | ✅ PASS |
| `npm run components:guide-model:check` | ✅ 정본 일치 (43개) |
| `npm run components:behavior:check` | ✅ PC 20개 계약 연결 |
| `npm run components:facts:check` | ✅ 최신 |
| `npm run design:md:check` | ⚠️ DESIGN.md 드리프트 없음 / **Agent Contract 1건 실패 = Modal 항목**(`design-md-agent-contract-check.js:64`) — 이 작업 diff 에 Modal 없음, 범위 밖 |
| `node scripts/ui-guide-render-check.js` | ✅ 15종 통과 — **이 2종은 candidate 라 제외됨**(`:134`), 승격 후 재실행 필요 |
| `npm run gate:check` | ❌ **4 error / 13 warning** — 전부 **Gate 6c 설치기 zip 카드날짜**(`installer:build` 필요). 이 작업 범위 밖이지만 커밋 훅이 막으므로 승격 전 해소 필요 |

> ⚠️ `workflow-state.json` 의 `gateSnapshot` 은 "gate:check PASSED · 오류 0"이라고 적혀 있으나 **검증 시점에는 사실이 아니다**(Gate 6c 4건). 스냅샷 이후 다른 세션이 정본을 건드린 결과로 보인다.

---

## 6. 검증하지 못한 범위 (통과로 쓰지 않음 · 미확인)

| 항목 | 왜 미확인인가 |
|---|---|
| Figma V3.0 캔버스 시각 대조 | 상태파일이 두 컴포넌트를 `source: "not-consulted"`(코드 정본으로 충분)로 선언했고 verify-F 는 V3.0 을 "상태 파일이 필요하다고 선언한 경우에만" 참고하라고 규정한다. **아이콘 5종은 Figma 원본 내보내기 PNG 로 실제 대조했다.** |
| Gate 44(안내화면 렌더 검사)의 이 2종 커버리지 | 검사기가 candidate 를 제외한다. **승격(6-promotion)에서 status 가 올라간 뒤 반드시 재실행.** 또한 이 검사기는 렌더 DOM ↔ dist CSS 를 대조하므로 **F-1·F-2·F-3 같은 "Figma 원본과의 차이"는 원래 잡지 못한다**(대조 축이 다르다). |
| Gate 19 커버리지(`data-cov-type`·`data-cov-platform`) | B3 `promotionTaskSpec` 이 이미 실측해 둔 승격 전 할 일. `pages/components.html:2880` 의 `data-cov-type` 이 슬러그(`home-title` 등)이고 정본 표기(`Home / Title` 등)와 다르다는 점, Platform 축 면제를 `variant-coverage-baseline.json` 에 등재해야 한다는 점 모두 이번 검증 범위 밖(6-promotion·river 확인). |
| Gate 6c(설치기 zip) 실패의 원인 추적 | 이 작업 소유가 아니다. 실패 항목이 Foundation·Semantic·Text Styles 카드 날짜여서 이 작업이 건드리지 않은 표면임을 확인하는 데서 멈췄다. |
| 실제 모바일 기기·터치·스크린리더 검증 | 헤드리스 브라우저 실측(히트테스트·ARIA 속성·포커스)까지만 했다. 실제 보조기기 낭독 결과는 미확인. |
| 사람의 UX 판단(목업 여백·정보량 등) | 5-human-review(river) 소관. O-2 를 그 자리에 올려 둔다. |

---

## 7. 권장 상태 전환

```json
{
  "workflowStatus": "blocked",
  "uiLibraryStatus": "draft",
  "lastCompletedCheckpoint": 3,
  "checkpointLog[4]": { "status": "failed", "by": "component-verifier (시나리오 F)" },
  "nextAction": "F-1(화살표 글리프 잘림)·F-2(회전 방향 반대)·F-3(알림 accent 자산 dist 누락)을 ui-library-builder 가 고치고, H-1·H-2 를 river 에게 올린 뒤 4-verification 재실행. 재검증 시 아이콘 글리프영역 오차와 dist 자산 404 를 함께 재측정한다."
}
```

신규 blocker 권고(오케스트레이터가 등재):

| id | severity | what |
|---|---|---|
| B4 | error | `mobileHeaderArrowDown` 웹 자산의 획이 중첩 `<svg>` 뷰포트에 잘려 원본보다 작게 그려진다(글리프영역 오차 0.02484 > 0.015) |
| B5 | error | 헤더 아래화살표가 CSS `rotate(-90deg)` 로 **위쪽**을 향한다 — Figma 회전 부호 규약이 반대다 |
| B6 | error | `mobile-header-notification-accent.svg` 가 dist 에 없어(404) 알림 신규 점이 빨강이 아니라 회색으로 배포된다 |
| B7 | question | (H-1) tablist 없이 배포되는 `role=tab` 예제·세로로 쌓이는 빈 소비자 화면 — 선택지 A/B/C |
| B8 | question | (H-2) presentation-policy 헤더 note 와 실제 상태 매트릭스 표출 방식 불일치 — 선택지 A/B |
