# 4. Verification — Base Input · Button pilot

> Date: 2026-08-26
> Release: `@s1/ui 0.1.0`
> Promotion verdict: **APPROVED** — 실제 렌더·자동 검사·river UX 승인 완료, 위험도 기반 독립 검증 생략 승인

## 현재 판정

- 제작자 기술 검사: **PASS**
- 수정 후 실제 브라우저 재검증: **PASS** — PC/Mobile × Light/Dark, 390px, 동작, 전체/개별 설치 동일성 확인
- 별도 검증: **WAIVED BY RIVER** — 단순 코어 변경에 대한 중복 렌더 검증 생략
- UI library status: `approved`
- 다음 단계: 승인된 Input·Button을 사용해 다음 코어 또는 패턴 작업 진행

## 독립 검증 중 발견되어 수정한 항목

1. Button 검수 화면에서 PC와 Mobile 허용 크기가 섞여 있던 문제
2. 전체 묶음과 개별 설치 fixture의 DOM이 달라 직접 비교할 수 없던 문제
3. Input read-only 테두리가 Registry와 달랐던 문제
4. Disabled label·message·control이 같은 의미 토큰으로 뭉쳐 있던 문제
5. Focused control text가 selected 텍스트 토큰을 쓰지 않던 문제
6. Error·Correct·Read-only 상태에서 키보드 초점 테두리가 상태색에 묻히던 문제
7. Pretendard 의존성이 전체·개별 소비자에 동일하게 선언되지 않던 문제
8. Mobile Button 제목이 실제 LG 48px와 다르게 표시되던 문제

현재 코드 대조에서 알려진 결함은 없으며, 새 변경의 실제 픽셀·키보드 사용성 검증은 남아 있다.

## 실제 브라우저 검사 결과

| 항목 | 결과 |
|---|---|
| Base Input 인스턴스 | 30개 렌더 |
| Button 인스턴스 | 48개 렌더 |
| PC Input | XXSM 28px · XSM 34px · MD 44px |
| Mobile Input | MD 48px |
| PC Button | XXSM 28px · XSM 34px · MD 44px |
| Mobile Button | LG 48px |
| 키보드 초점 | Button 2px outline + 2px offset, Input Error·Correct·Read-only 모두 selected border로 식별 |
| 다크 버튼 초점 토큰 | `#3070D8` — Button 다크 파란색 계열과 통일 |
| 390×844 반응형 | 가로 넘침 0, Input·Button 48px 유지 |
| 콘솔 경고·오류 | 0건 |

### 2026-08-26 검수본 04 실제 렌더 재검증

- PC Light/Dark의 Input 상태 7종과 PC XXSM 28px·XSM 34px·MD 44px을 확인했다.
- Mobile Light/Dark의 Input은 48px 높이를 유지했다.
- Input Editing remove는 PC 28×28px, Mobile 48×48px 누르는 영역과 24×24px 아이콘 틀을 유지했다.
- remove Hover는 해당 누르는 영역에만 `rgb(250, 250, 250)` 배경과 4px radius가 적용됐다.
- remove 실행 후 값이 비워지고 액션이 숨겨지며 Input 초점이 유지되는 것을 확인했다.
- Button은 PC XXSM 56×28px·XSM 64×34px·MD 80×44px, Mobile LG 80×48px으로 렌더됐다.
- 모든 Button 라벨의 가로·세로 중심 오차는 최대 0.01px 이하였다.
- 390×844에서 가로 넘침은 0px이고, Mobile Input의 48px 높이와 remove 48px 탭 영역이 유지됐다.
- 전체 묶음 설치와 개별 CSS 설치는 초기 렌더·입력 후·삭제 후의 크기와 computed style이 모두 같았다.
- 검수 화면과 두 설치 fixture의 콘솔 경고·오류는 0건이었다.

이 결과는 실제 배포본의 브라우저 렌더 PASS다. 별도 `component-verifier`는 서버 정상화 후에도 자체 브라우저 제어 백엔드가 연결되지 않아 같은 화면을 중복 실측하지 못했다. river는 정본 대조·실제 렌더·자동 검사·UX 승인이 완료된 이번 단순 코어 변경에서 별도 검증을 생략하고 승격하는 것을 승인했다.

### 2026-08-26 Input Editing remove·메시지 선택형 재검수

- 코드 정본의 Editing `remove` 액션이 기존 Base Input 웹 파일럿에서 누락된 것을 확인했다.
- 동일한 허용 아이콘 키를 웹 asset manifest에 연결하고, UI source에서 dist 전체·개별 설치 파일로 함께 생성한다.
- 값이 있고 Input 또는 remove action에 초점이 있을 때만 노출하며, 실행 후 값 삭제·`input` event·Input focus 복귀·`s1:input:clear`를 제공한다.
- PC hit area 28×28px, Mobile 48×48px, XXSM 아이콘 20px·그 외 24px 계약을 적용했다.
- 아이콘 프레임을 글리프로 오인해 16px 원형을 24px까지 확대한 오류를 수정했다. 정본대로 기본 24px 프레임 안 16px 글리프, XXSM은 20px 프레임 안 약 13.33px 글리프를 유지한다.
- 실제 검수본 `2026-08-26 · 03` 렌더에서 PC MD=action 28px/frame 24px/glyph 16px, PC XXSM=28px/20px/약 13.33px, Mobile MD=48px/24px/16px을 확인했다.
- 실제 Mobile clear 실행 후 value empty·action hidden·Input focus 복귀를 확인했다.
- 안내 메시지는 선택형으로 바꾸어, 있는 예시와 element·`aria-describedby`를 함께 생략한 예시를 동일 검수 화면에 제공한다.
- 코드·fixture 동작은 독립 PASS했다. 실제 Light/Dark·PC/Mobile 렌더는 검증자 브라우저 미연결로 **BLOCKED**다.

### 2026-08-26 suffix action Hover 배경 보완

- Input field 전체 Hover는 기존 HD-2 결정대로 만들지 않는다.
- remove·비밀번호 표시처럼 오른쪽에 놓이는 각 suffix action은 별도 Hover 상태를 가진다.
- Hover 가능한 PC 포인터에서 현재 가리키는 action의 hit area에만 `color/form-control/bg/hover` 배경과 4px radius를 적용한다.
- Mobile 터치 환경에는 Hover 상태를 강제로 남기지 않는다.
- Figma 정본에는 `Password Action Hover`·`Clear Action Hover` Boolean 속성으로 같은 상태를 확인할 수 있게 기록했다.

### 2026-08-26 Button XXSM 너비 변경·모바일 라벨 재검수

river 승인에 따라 XXSM 최소 너비를 기존 Figma V3.0 참고값 64px보다 최신인 56px 정본으로 변경하고 웹 원본에 동기화했다.

| Size | Figma | 실제 dist 렌더 | 라벨 중심 |
|---|---:|---:|---:|
| PC XXSM | 56×28px (river 승인 정본) | 56×28px | 가로 0px · 세로 0px |
| PC XSM | 64×34px | 64×34px | 가로 0.01px 이하 · 세로 0px |
| PC MD | 80×44px | 80×44px | 가로 0.01px 이하 · 세로 0px |
| Mobile LG | 80×48px | 80×48px | 가로 0px · 세로 0.01px 이하 |

- 모든 size selector가 자기 최소 너비 토큰을 직접 선언하도록 변경했다.
- Mobile LG label 자체에 가로·세로 중앙 정렬 계약을 추가했다.
- Registry의 최소 너비를 size별 80·64·56·80px으로 기록했다.
- 검수 화면은 동일한 `버튼` 라벨로 크기 차이를 비교하고 각 최소 너비를 함께 표시한다.
- 긴 라벨은 Figma처럼 좌우 padding을 보존하며 최소 너비보다 늘어날 수 있다.

스크린샷:

- `reports/ui-library/input-button-pilot/ui-review-pc.png`
- `reports/ui-library/input-button-pilot/ui-review-mobile.png`

## 설치 방식 동일성

빈 소비자에서 아래 두 방식을 실제 렌더 비교했다.

- 전체 묶음: `dist/s1-ui.css` + `dist/s1-ui.js`
- 개별 설치: `dist/components/input.css` + `dist/components/button.css`

결과:

- DOM 동일
- Input field computed style 동일
- Input control computed style 동일
- Button computed style 동일
- 양쪽 콘솔 경고·오류 0건
- 실제 입력 글자: Pretendard · 14px · Regular · 18.2px line-height

## 자동 검문소

PASS:

- `npm run ui:state -- --state reports/ui-library/input-button-pilot/workflow-state.json` (정본 지문 갱신 전후 재실행 대상)
- `npm run ui:build -- --check`
- `npm run ui:test -- --check`
- `npm run ui:icons` — 전체 웹 아이콘 frame·glyph·source/dist 일치, 과거 오류 형태 적대 테스트 PASS
- `npm run ui:contract`
- `npm run components:buildverify`
- `npm run components:guide-model:check`
- `npm run components:variantcov`
- `npm run components:sizenaming` — 위반 0, 기존 GNB Menu 미계측 경고 1건
- `npm run layout:check`
- `npm run tokens:darkdiv`
- Gate 43 UI 아이콘 크기 검사 PASS
- `git diff --check`

전체 `npm run gate:check`는 Gate 43을 포함한 이번 변경 검사에는 통과했지만, 별도 Mobile Header 작업이 포함된 `build-components.ts`의 실제 렌더 재검증 기록이 아직 없어 Gate 13에서 실패했다. 이 실패는 아이콘 geometry 검사 실패가 아니며, 실제 렌더 검증 없이 기록을 갱신하지 않는다.

전체 `gate:check`에서 처음 발견된 이번 작업 관련 오류 2건은 수정했다.

- `pages/ui-review.html`을 독립 검수 화면으로 레이아웃 정책에 등록
- Button 다크 focus token을 Button 계열 `blue-dark/300`으로 통일

기존 프로젝트 경고(미분류 컴포넌트, 오래된 Registry 정보, 시스템 맵 등)는 이 파일럿의 PASS로 간주하지 않으며 별도 부채로 남긴다.

## 이번 승인에 포함되지 않은 범위

- Password Field와 Search Input의 suffix action 동작 — 다음 모듈 단계 범위

---

## 2026-09-04 재검증 — focus-visible 제거본 델타 (🤖 component-verifier 시나리오 F)

> 판정: **FAIL** — ❌(a) 2건 · ❓(c) 2건 · BLOCKED 0건
> 범위: 계약 `scopeRule`(2026-09-03 river 승인)에 따른 **델타 재검증**. 기준 커밋 `109100a`(2026-09-02), 직전 PASS = 2026-08-26 검수본 04.
> 입력: 기계검사 9종 종료코드 표 + 렌더 선캡처 2장(`screens/review-pending-2026-09-04-*.png`, http 렌더).

### 통과한 항목

| 항목 | 판정 | 확인 방법 |
|---|---|---|
| focus-visible 철회가 전량인가 | **PASS** | `src`·`dist`·`registry`·`pages`·`plugins`·번들 전 표면 잔존 0건. 삭제 토큰 2개도 0건 |
| Button 3종 키보드 초점 | **PASS** | Light·Dark 6조합 전부 UA 기본 링(`outline: auto 1px`) + `:focus-visible` 매칭 true |
| Input 지우기(suffix) 버튼 초점 | **PASS** | Light `auto 1px rgb(229,151,0)` · Dark `auto 1px rgb(153,200,255)`, field `overflow: visible` 로 잘림 없음 |
| Button registry 문서 정합 | **PASS** | a11y·guide.accessibility·focusVisible 블록·figmaProperties 잔존 0건 |
| 정본 지문 갱신 판단(D25) | **PASS** | 지문 6/6 바이트 일치 · hunk 최소 시작 1659 vs 빌더 281~1073 · behavior Input·Button 동일 · contract 변경은 절차 조항뿐 (검증자가 명령을 직접 재실행) |

### F-1 ❌(a) — Input 텍스트 필드의 키보드 초점이 error·correct·read-only 에서 보이지 않는다

`input.css:43` 의 `outline: 0` 이 브라우저 기본 링을 없애는데, 그 자리를 메우던 규칙이 이번 철회에서 **함께 삭제**됐다.

```
/* 삭제된 규칙 — 최초 커밋 3997f18 부터 있었고 476f1cd 에서 제거됨 */
[data-s1-component="input"]:has([data-s1-part="control"]:focus-visible) [data-s1-part="field"] {
  border-color: var(--color-form-control-border-selected);
}
```

이 규칙은 승인 없이 만들어진 focus 토큰이 아니라 **정본 Selected 토큰**을 쓴다. 같은 블록에서 지운 `action:focus-visible`(삭제된 `--color-form-control-action-border-focus` 사용)과 성격이 다르다. 남아 있는 `:focus-within`(154행)은 error·correct·read-only 규칙(163·172·181행)보다 앞에 있어 뒤 규칙에 밀린다.

초점 전→후 계산 스타일 실측:

| 상태 | 테마 | 변화 | 판정 |
|---|---|---|---|
| Default · Filled | Light·Dark | 테두리 D9D9D9→1D6CEB / 3E4049→4285E8 | ✅ 보인다 |
| Error | Light | 테두리·배경 변화 없음, 글자색만 미세 | ❌ |
| Error | **Dark** | **계산된 차이 0** | ❌ |
| Correct | Light·Dark | 이미 파랑 → 변화 없음 | ❌ |
| Read-only | Light·Dark | **계산된 차이 0** | ❌ |

이 상태들에서 남는 단서는 텍스트 캐럿뿐이고, 캐럿은 초점 표시로 인정하지 않는다. **이번 델타가 만든 회귀다.**
고치는 방향은 (A) `outline: 0` 제거 / (B) 삭제된 selected-border 규칙 복원 두 갈래이며, **어느 쪽인지는 제품·정본 판단이라 검증자가 정하지 않는다 → HD-A.**

### F-2 ❌(a) — 문서 3곳이 코드와 다른 말을 한다

| 표면 | 적힌 말 | 실제 |
|---|---|---|
| `input/manifest.json` a11y.focus | "브라우저 기본 포커스 표시를 그대로 쓴다" | 텍스트 필드는 `outline: 0` 으로 기본 표시가 막혀 있다 |
| `pages/ui-review.html:442` | "초점 표시는 브라우저 기본 표시를 그대로 씁니다(별도 파란 테두리를 만들지 않습니다)" | Default 상태에서는 실제로 파란 테두리(정본 Selected)가 나타난다 |

F-1 의 방향(HD-A)이 정해져야 문구도 정해지므로 F-1 과 함께 고친다.

### 알려진 불일치 — 패키지 상태(HD-B)

`ui-library/src/components/{input,button}/manifest.json` 의 `status` 는 `approved` 인데 `ui-library-migration.json` 은 `draft` 다. 검증자가 파급 범위를 사실로 확인했다 — `platform.mjs:712` · `runtime-check.mjs:92` · `test.mjs:540,577` · `scripts/build-ui-package-zip.js:58`.
동시에 **현재 상태의 결과**도 사실로 확인됐다: `dist/platform/contract.json` 승인 목록과 `assets/downloads/s1-ui-dev-package.stamp.json` 의 `components` 앞 두 항목이 `input`·`button` 이다 — **river 승인이 superseded 된 코드가 "승인됨"으로 개발자에게 배포되고 있다.** 이 불일치를 잡는 기계검사는 없다(`test.mjs:577` 은 contract↔build 만 대조하고 장부를 보지 않는다). → **HD-B.**

### 승계한 범위 (이번에 안 봄)

크기·최소너비 · 라벨 정렬 · remove 아이콘 geometry · hover 배경 · clear 동작 · 메시지 선택형 · 전체↔개별 설치 동일성 · 다중 인스턴스·init/destroy · 아이콘 원본 동일성. 근거: `git diff 109100a` 상 두 CSS 의 변경이 focus 규칙 삭제 3블록뿐이고 정본 지문이 동일하다.

### 검증하지 못한 것

실제 키보드 Tab 순서를 눈으로 따라가는 조작(검증자 브라우저 패널이 백지를 반환) — `:focus-visible` 매칭과 계산 스타일 실측으로 대체했다.

### 무관한 기존 실패

`npm run design:md:check` → 1 ("PC 사이트에 없는 Modal 행동이 임의 생성됨"). `git stash` 로 워킹트리를 치우고 HEAD 에서 돌려도 같은 실패다. Modal 은 다른 세션 작업이며 이번 델타와 무관하다.

---

## 2026-09-04 2차 재검증 — river 결정(B안) 반영분 (🤖 component-verifier)

> 판정: **FAIL** — ❌(a) 2건 · ❓(c) 1건. river 요구 3가지 중 ①테두리 ③disabled 스킵은 PASS, ②커서 값 끝이 FAIL.

| 발견 | 내용 |
|---|---|
| **F-3 ❌(a)** | 새로 넣은 `pointerFocus` 플래그가 **꺼지지 않고 남는 경로**가 있다. 초점을 못 받는 자리(안내 문구·여백)를 누르면 `focusin`·`focusout` 이 안 일어나 플래그가 `true` 로 굳고, 다음 Tab 진입이 "마우스 진입"으로 오인돼 커서가 값 끝으로 가지 않는다. 검수 화면에서 실제 재현됨(`[0,3]`). |
| **F-4 ❌(a)** | 읽기전용은 커서가 값 끝으로 가지 않는데(코드가 `!control.readOnly` 로 제외), 문서 4곳이 "읽기전용에서도 같다"고 말한다. |
| **F-5 ❓(c)** | 읽기전용 예외는 river 가 말한 적 없다(H6②). 코드에서 예외를 뺄지, 문서에 예외를 적을지. |
| PASS | 초점 테두리 Light `rgb(29,108,235)`·Dark `rgb(66,133,232)` 4상태 전부 · disabled tab 스킵 · 마우스 클릭 위치 보존 · correct 한계 그대로(몰래 처리 없음) · clear 동작·destroy·재init·다중 인스턴스 무회귀 · pagination·tab 은 지문 한 줄만 변경 · Gate 34 무반응 |
| NOT_VERIFIED | 마우스 드래그 선택 보존(검증자 측정 실패) |

### 조치 (⭐, 2026-09-04)

- **F-3**: 플래그를 상태로 들고 있지 않게 고쳤다. `pointerdown` 표식이 **다음 task 에서 스스로 사라진다**(`setTimeout(...,0)`). `pointerdown → focusin` 은 같은 task 안에서 이어지므로 마우스 판정은 그대로 유지되고, 초점이 안 옮겨지는 클릭은 표식을 남기지 않는다. `destroy()` 에서 타이머도 해제한다.
- **F-4·F-5**: **river 가 말하지 않은 읽기전용 예외를 코드에서 제거**했다(H6② — 근거 없이 만든 예외였다). 문서 4곳은 그대로 두고 코드를 문서·river 발화에 맞췄다.

### 조치 후 ⭐ 실제 렌더 실측 (`http://127.0.0.1:4173/pages/_tmp/caret-test.html`)

| 확인 | 결과 |
|---|---|
| F-3 재현 경로(안내 문구 클릭 → 다른 곳 → Tab) | 일반 `[6,6]`·테두리 `rgb(29,108,235)` — **해소** |
| 오류 칸 Tab | `[5,5]` · `rgb(29,108,235)` |
| **읽기전용 칸 Tab** | `[5,5]` · `rgb(29,108,235)` — **해소** |
| 비활성 칸 | Tab 순서에서 건너뜀(읽기전용 → 끝 버튼) |
| 마우스 클릭 | `[1,1]` 누른 자리 유지 |
| **마우스 드래그 선택** | `[1,6]` 유지 — 검증자 NOT_VERIFIED 항목 해소 |

기계검사 9종 종료코드 0. `gate:check` error 2건은 Gate 46(개발자 전달본)뿐이며 다른 세션 소관이다.

---

## 2026-09-04 3·4차 재검증 — **PASS** (🤖 component-verifier)

### 3차 — 타이머 방식 (PASS, 한계 1건 남김)

F-3(굳는 플래그)·F-4(읽기전용 예외) 조치가 적대 테스트 5종을 통과했다. 다만 검증자가 **터치 위험**을 남겼다 —
타이머로 표식을 지우면 "손을 뗀 뒤 초점을 주는" 모바일에서 그 탭이 키보드로 오인돼 **글 중간을 눌러도 커서가 값 끝으로 튄다.**

### ⭐ 조치 — 판정 방식을 시각 비교로 교체

표식을 상태로 들고 있지 않고, **직전 포인터 조작이 방금이었는지를 같은 시계의 `event.timeStamp` 로 비교**한다.
`pointerdown` 과 `pointerup` 둘 다 시각을 갱신한다(모바일은 손을 뗀 뒤 초점이 온다). 타이머가 사라져 `clearTimeout` 도 없어졌다.

세 가지가 구조적으로 해소된다 — ①표식이 굳는 경로가 없다 ②초점이 다른 task 에서 와도 500ms 안이면 포인터로 본다 ③화면이 숨겨져 타이머가 밀리는 환경에서도 판정이 흔들리지 않는다.

### 4차 판정: **PASS** — ❌ 0 · ❓ 0 · BLOCKED 0

| 항목 | 결과 |
|---|---|
| 500ms 경계 실측(busy-wait 로 실경과 고정) | 480ms=포인터 · 520ms=키보드 — 설계대로 정확 |
| `pointercancel` 후 Tab · 값 없는 칸 · 원래 F-3 경로 | 전부 정상 |
| Tab 전수 순회 | 일반 `[6,6]` · 오류 `[5,5]` · 정상확인 `[5,5]` · 읽기전용 `[5,5]` · 비활성 건너뜀 · 빈칸 `[0,0]`, 테두리 전부 `rgb(29,108,235)` |
| `pointerup` 추가 무해성 | 드래그 선택 `[2,6]` 유지 · 값 중간 클릭 `[3,3]` — 오히려 길게 누른 탭을 살림 |
| **모바일 탭 흉내**(pointerdown/up touch → 다른 task 에서 초점) | `[1,1]` 유지 — 3차 타이머 방식에서는 `[6,6]` 으로 튀던 경로 |
| 인스턴스 격리 · destroy 리스너 3종 해제 · 재init · 지우기 버튼 조건 | 전부 정상 |
| river 실제 검수화면 | 값 중간 클릭 `[2,2]` · 읽기전용 Tab `[10,10]` · disabled 건너뜀 |
| 문서 4곳 ↔ 코드 | 일치 |

### 남은 오판 경로 1건 (❌ 아님 · 기록)

입력 상자 **안쪽 가장자리**를 눌러 초점이 안 잡힌 상태에서 **0.5초 안에** Tab 을 누르면, 그 칸 커서가 값 끝으로 가지 않는다.
피해는 커서 위치 하나뿐이고 **0.5초 뒤 저절로 낫는다**(2차의 무한 지속 플래그와 성질이 다르다). 창을 없애면 모바일 탭이 깨지므로 창은 유지한다.
검증자가 제안한 개선(표식 대상을 control·label 로 좁히기)은 **선택 개선**으로 남긴다 — 다른 브라우저가 field 여백 클릭으로 초점을 넘길 경우 더 나쁜 실패(클릭인데 커서가 끝으로)가 될 수 있어 지금은 넣지 않았다.

### ⭐ 자가인증 1건 (검증자 PASS 이후 추가)

`registry/components/component-behavior.pc.json` 의 `Input.focus.caret` 에 "500ms 안의 초점은 포인터로 본다 — 이 값을 바꾸려면 모바일 탭을 다시 검증하라"는 단서 한 줄을 덧붙였다(검증자 권고 7번). **문서 한 줄이며 코드·동작 무변경**이다. 이 파일이 pagination·tab 의 canonicalSources 라 두 컴포넌트 지문이 함께 갱신됐다(내용 무변경).

### 🚩 실제 기기에서 아직 확인 못 한 것 — 휴대폰·태블릿

휴대폰·태블릿은 **실제 기기에서 확인하지 못했다.** 확인할 점은 **글자 중간을 눌렀을 때 커서가 누른 자리에 서는지**(끝으로 튀면 안 된다)다.
PC 에서는 마우스·키보드 모두 정상 동작을 확인했고 휴대폰도 코드상 같은 방식으로 처리되지만, 두 이유로 "해소"라고 쓰지 않는다.

1. 이 세션과 검증자 세션 모두 **모바일 에뮬레이션을 켜면 클릭 도구가 30초 타임아웃**해 실제 탭을 재현할 수 없었다(도구 한계).
2. 판정이 `event.timeStamp` 의 기준시각이 브라우저 안에서 일관되다는 전제 위에 있다. 최신 Safari·Chrome 은 같은 시계를 쓰지만 **iOS Safari 에서 직접 확인하지는 않았다.** 만약 다르면 항상 "마우스"로 판정돼 **Tab 을 해도 커서가 끝으로 가지 않는다.**

**아이폰(Safari)·안드로이드(Chrome) 중 한 대에서 30초만 눌러 보면 두 가지가 함께 판정된다.**

---

## 2026-09-04 river 실기기 검수 결과 (안드로이드 · 삼성 인터넷 · 폰 라이트모드)

로컬 서버를 LAN 에 열어(`192.168.68.105:4174`) river 가 실제 폰에서 확인했다.

### 해소 — 터치 잔여 위험 (4차 회차의 NOT_VERIFIED)

> river: "커서가 누른 자리에 잘 서네"

**글자 중간을 눌렀을 때 커서가 누른 자리에 선다.** 4차 검증이 실기기 미확인으로 남겼던 항목이 해소됐다.
`event.timeStamp` 기준시각 일관성 전제도 함께 확인된 셈이다(어긋났다면 항상 '마우스'로 판정돼 이 동작이 안 나온다).

### F-6 — 모바일 지우기 아이콘이 안쪽으로 밀려 있었다 (river 제보)

> river: "인풋 내 삭제 아이콘이 좀 왼쪽으로 가있어"

**웹 구현 오류가 아니라 정본이 지정한 값이었다.** 📖 `source-reader` 판독:

| | 필드 오른쪽 안쪽 여백 | 누르는 영역 | 아이콘 | 아이콘 오른쪽 끝 ~ 칸 끝 |
|---|---|---|---|---|
| PC MD | 12px | 28×28 | 24px | 12 + (28−24)/2 = **14px** |
| Mobile MD | 12px | 48×48 | 24px | 12 + (48−24)/2 = **24px** |

`build-components.ts:917-920`(sizes 표) · `:986`(hit size) · `:924-939`(`wrapSuffixAction`).
모바일은 손가락용으로 누르는 영역을 48×48 로 키운 결과(HD-UILIB-02, river 2026-08-25) 아이콘이 저절로 10px 안쪽으로 밀린 것이다.

라이트만의 문제가 아니었다 — 실측상 Mobile Light·Dark 가 동일하게 25px, PC Light·Dark 가 동일하게 15px 였다(검수 화면에서 실제 초점 상태로 측정). river 도 재확인 후 "다시 보니 모바일 다크에도 …좀 안쪽으로 이동되어있네" 로 정정했다.

**조치 (river 지시):**

> river: "아 터치영역때문에 그렇구나. 그럼 모바일에서는 인풋 내부 우측 패딩을 0px로 하면 딱 맞춰진다."

정본 `build-components.ts:922` 의 Mobile MD `padR: 12 → 0`, 웹 `input.css` 의 mobile md `padding-inline: 16px 0`.

| | 아이콘 ~ 칸 끝 | 누르는 영역 ~ 칸 끝 |
|---|---|---|
| 모바일 (전) | 25px | 13px |
| **모바일 (후)** | **12px** | **0px** |
| PC (무변경) | 14px | 12px |

**부작용 1건 (기록):** 지우기 버튼이 없는 모바일 입력칸은 글자가 오른쪽 테두리까지 닿는다(전 12px 여유). 값이 길 때만 드러난다. river 에게 보고했다.

### F-7 — "눌렀는데도 지우기 버튼이 안 보였다" → 결함 아님

폰용 진단 화면(`pages/_tmp/phone-check.html`)을 만들어 river 가 실기기에서 상태를 찍었다.

| 칸 | 런타임 | 커서 | 버튼 hidden | 화면 크기 | 칸 끝 거리 |
|---|---|---|---|---|---|
| 라이트 · 모바일 | O | **X** | true | 0×0 | — |
| 다크 · 모바일 | O | **O** | **false** | **48×48** | **1px** |

**커서가 들어간 칸에서는 버튼이 정상 노출된다**(삼성 인터넷 · Android 10). 안 보이던 것은 커서가 없는 칸을 본 경우로,
"값이 있고 커서가 있을 때만 노출"(HD-UILIB-06, river 2026-08-26) 규칙대로다. river 재확인: "이제는 잘되고있어".
칸 끝 거리 1px 은 위 F-6 수정이 실기기에도 반영됐다는 확인이기도 하다.

### ⭐ 자가인증 범위 (독립 검증 이후 추가된 변경)

F-6 조치는 🤖 component-verifier 4차 PASS **이후**에 들어간 변경이다. 독립 검증을 다시 돌리지 않았고, 근거는 다음과 같다.

- 변경은 정본 sizes 표의 **한 값**(`padR` 12→0)과 그 파생 CSS 한 줄뿐이다. 새 build 함수·variant 스펙·셀↔스펙시트 키 변경 없음 → 하드룰 H1② 의 기계적 수정 예외에 해당. Gate 13 에 `--by orchestrator --change mechanical` 로 기록했다.
- ⭐ 실제 렌더로 전후를 실측했고(아이콘 25→12px · 누르는 영역 0px · PC 무변경 14/12px), river 가 실기기에서 결과를 확인했다.
- 기계검사 9종 종료코드 0, `npm run gate:check` **PASSED**(게이트 50개 · 오류 0).

이 범위는 river 화면 검수(5-human-review)에서 함께 판정한다.
