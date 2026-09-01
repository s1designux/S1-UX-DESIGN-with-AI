# 7. river 실사용 지적 2건 — 처리 결과

- work-id: `select-dropdown-filter-chip`
- 담당: 🧱 ui-library-builder
- 범위: filter-chip 스코프만. dropdown 코어·select 는 손대지 않음.

---

## ① 필터칩 폭 < 140px → 드롭다운 폭을 칩 폭에 맞춤

### 원인
`dropdown.css`의 `[data-s1-component="dropdown"] { min-width: 140px; max-width: 320px; width: max-content; }`는
공통 규칙이라 select·filter-chip이 함께 쓴다. select 트리거는 자체 `min-width:140px`가 있어 항상 140 이상이지만,
filter-chip 트리거는 정본상 `primaryAxisSizingMode=AUTO`(내용만큼 줄어듦)라 실측 80·86·98px처럼 140보다 좁아지고,
그 상태에서 목록이 `min-width:140px` 바닥값 때문에 트리거보다 옆으로 삐져나왔다.

### 처리
CSS만으로는 "트리거 폭 < 140이면 정확히 트리거 폭으로 고정, 그 외엔 320까지 내용대로 확장"이라는 두 갈래 조건을
표현할 수 없어(고정값이 아니라 매 인스턴스의 실제 렌더 폭에 달려 있음), **filter-chip 스코프의 JavaScript**에서
열릴 때 트리거 실측 폭을 재고, 140보다 좁을 때만 그 인스턴스의 dropdown 루트에 인라인 `min-width`/`max-width`를
그 폭으로 못박는 방식으로 구현했다. dropdown.css의 공통 규칙(140~320 클램프)은 전혀 건드리지 않았고, select가
쓰는 dropdown 인스턴스에는 이 스크립트가 관여하지 않는다(초기화 대상이 filter-chip 트리거 하나이므로).

**변경 파일:** `ui-library/src/components/filter-chip/filter-chip.js`
- 22~38행: `NARROW_TRIGGER_THRESHOLD_PX = 140` 상수 + `syncPanelWidthToTrigger(trigger, dropdownRoot)` 추가
  - 트리거 `getBoundingClientRect().width` < 140 → dropdownRoot에 인라인 `min-width`/`max-width`를 그 값으로 설정
  - 그 외 → 인라인 스타일 제거(=dropdown.css 기존 140~320 클램프로 복귀)
- `open()` 안, `aria-expanded` 세팅 전에 `syncPanelWidthToTrigger(trigger, dropdownRoot)` 호출 1줄 추가

dropdown.css·select.css·select.js·dropdown.js는 수정하지 않았다(`git diff --stat` 로 확인 — 두 컴포넌트 소스 무변경).

### 실측 검증 (실제 렌더, source 직접 로드)

`npm run ui:build`가 아래 "검사 출력"에 적은 사전 이슈로 막혀 있어 `dist`를 새로 못 만든다. 그래서 `dist` 대신
**실제 source 파일**(`ui-library/src/components/filter-chip/filter-chip.js` 등)을 그대로 로드하는 검증용 페이지를
새로 만들어 렌더로 확인했다(기존 `matrix-fixture.html`·`ui-library-guide.js`·`ui-review.html`은 지시대로 손대지 않음).

- 검증 페이지: `reports/ui-library/select-dropdown-filter-chip/verify-chip-width-fix.html`
- 임시 스테이징(더미 파일 아님 — 실제 src를 그대로 복사해 dist와 동일한 co-location 구조로만 배치. 원본 src·dist는 무변경):
  `reports/ui-library/select-dropdown-filter-chip/verify-src/` (filter-chip.js·dropdown.js·각 css·chevron.svg = src에서 그대로 복사)
- 서버: `http://localhost:4173`(기존 구동 중인 서버 그대로 사용)
- 스크린샷: `reports/ui-library/select-dropdown-filter-chip/screens/7-river-feedback-2-narrow-chip-widths.png`

**측정값(트리거 실폭 px = 드롭다운 실폭 px, `getBoundingClientRect()`):**

| 케이스 | 트리거 폭 | 드롭다운 폭 | 일치 |
|---|---|---|---|
| 80px 강제 | 80.0 | 80.0 | ✅ |
| 86px 강제 | 86.0 | 86.0 | ✅ |
| 98px 강제 | 98.0 | 98.0 | ✅ |
| 정본대로 자연폭(제목+값, 예상과 달리 이 케이스도 72.2px로 140 미만이었음) | 72.2 | 72.2 | ✅ |

**140 이상일 때 기존 규칙 유지 확인**(같은 페이지에서 JS로 임시 인스턴스 2개 추가해 측정, 파일에는 반영 안 함 — 콘솔 확인용):

| 케이스 | 트리거 폭 | 드롭다운 폭 | 기대 | 결과 |
|---|---|---|---|---|
| 트리거 144.8px · 짧은 옵션 | 144.8 | 140 | 140 하한 유지 | ✅ |
| 트리거 144.8px · 매우 긴 옵션 | 144.8 | 320 | 320 상한 + 줄바꿈 | ✅ |

**셀렉트박스 영향 확인:** select.css·select.js·dropdown.css·dropdown.js `git diff` 무변경. select는 `filter-chip.js`가
전혀 초기화하지 않으므로(각자 자기 컴포넌트만 `querySelector`) 구조적으로 영향 경로가 없다. 검증 페이지에도 select
샘플 1개를 나란히 띄워 눈으로 대조했다(스크린샷 참고) — 정상.

---

## ② 필터칩 예시 기본값 ↔ 목록 항목 불일치

### 내 담당 범위(filter-chip.example.html · manifest.json) 확인 결과: **이미 일치, 수정 불필요**

`ui-library/src/components/filter-chip/filter-chip.example.html`을 직접 읽었다.

```html
<span data-s1-part="value">최신순</span>
...
<div data-s1-part="option" ... data-value="latest"><span data-s1-part="option-label">최신순</span></div>
<div data-s1-part="option" ... data-value="popular"><span data-s1-part="option-label">인기순</span></div>
<div data-s1-part="option" ... data-value="past"><span data-s1-part="option-label">과거순</span></div>
```

칩에 보이는 값 "최신순"이 목록 3항목 중 첫 번째(`data-value="latest"`, `aria-selected="true"`)와 정확히 같다.
`manifest.json`의 서술 예시(`'정렬, 최신순'`, 107·168행)도 이 example.html 값과 일치한다. **코드 변경 없음.**

### 인수인계 — 실제 불일치가 남아 있는 곳 (guide-builder 담당, 이번에 손대지 않음)

river가 본 화면은 아마 아래 위치일 가능성이 높다. **디자인가이드 검수 화면(`pages/ui-review.html`)의 필터칩 패널이
공용 `dropdownMarkup()`을 기본값 그대로 호출**해서, 칩 값(정렬 문구)과 목록 내용(지역 문구)이 서로 다른 도메인이 됐다.

| 파일 | 행 | 현재 내용 | 문제 |
|---|---|---|---|
| `pages/ui-review.html` | 933 | `const valueText = complete ? "인기순" : "최신순";` | 칩 값은 정렬 문구 |
| `pages/ui-review.html` | 944 | `${dropdownMarkup({ type: "text", size: filterChipPanelSize[size], ariaLabel: "정렬" })}` | `rows`를 안 넘겨 dropdownMarkup 기본값(818~822행 서울/부산/제주)을 그대로 씀 |
| `pages/ui-review.html` | 818~822 | `{ label: "서울", ... } { label: "부산", ... } { label: "제주", ... }` | 공용 dropdownMarkup의 기본 rows(지역 문구) — filter-chip 호출부가 이 기본값을 오버라이드하지 않음 |

**결과:** ui-review.html의 필터칩 패널을 열면 칩엔 "최신순/인기순"이 보이는데 목록엔 "서울/부산/제주"가 뜬다 — river가
말한 불일치의 실제 발생 지점으로 추정된다.

대조로, 같은 종류 호출부인 `assets/js/ui-library-guide.js`(649~651행)와
`reports/ui-library/select-dropdown-filter-chip/matrix-fixture.html`(76·79행)은 **이미 자체적으로 rows를
최신순/인기순/과거순으로 넘겨 일치**시켜 두었다 — 이 두 파일은 문제 없음, 고칠 필요 없음.

**제안(인수인계, 실행하지 않음):** `pages/ui-review.html`의 `filterChipMarkup()` → `dropdownMarkup()` 호출부(944행)에
`rows: [{ label: "최신순", value: "latest", selected: true }, { label: "인기순", value: "popular" }, { label: "과거순", value: "past" }]`
같은 필터칩 전용 rows를 넘기도록 고치면 된다(guide-builder 소관).

---

## 검사 출력

```
$ npm run ui:contract
[UI Library Contract] PASS · policy=candidate · stable-enforcement=pending
UI_CONTRACT_SUMMARY status=candidate errors=0 gate=gate:check-partial

$ npm run ui:icons
✅ 아이콘 검사기 적대 테스트 통과(틀/도형 혼동 탐지)
✅ 모든 웹 아이콘의 frame·glyph 계약과 source/dist가 일치
UIICON_SUMMARY icons=3 errors=0

$ npm run ui:build
Error: input canonicalFingerprint is stale. Review canon changes before rebuilding.
    at createOutputs (ui-library/scripts/build.mjs:57:13)

$ npm run ui:test
UI library technical checks found 1 issue(s):
- build freshness: Error: input canonicalFingerprint is stale. Review canon changes before rebuilding.

$ node scripts/component-behavior-check.js
🔎 PC Component Behavior 계약 검사
  ✅ PC 20개 계약이 UI 라이브러리 JavaScript/마크업 근거와 연결됨
```

## 미확인 · 블로커 (⭐ 자가인증 아님 — 정직하게 명시)

- **`npm run ui:build` / `npm run ui:test`가 이번 작업과 무관하게 실패한다.** 원인은 `input` 컴포넌트부터 시작해
  **9개 컴포넌트 전부**의 `manifest.json`이 선언한 `canonicalFingerprint`가 현재 작업 트리의
  `plugins/figma-vars-installer/src/build-components.ts`(커밋 안 된 변경분, workflow-state.json D4가 이미
  "buildNavBar 3줄, 이 작업의 5개 빌더와 무관"이라고 검토·기록한 그 diff)와 더 이상 맞지 않아서다.
  - `git stash`로 작업 트리를 마지막 커밋 상태로 되돌리면 `input` 포함 전 컴포넌트 fingerprint가 OK로 확인됨(재현 확인 완료) → **이번 filter-chip.js 수정이 만든 문제가 아니다.**
  - `select`·`dropdown`·`filter-chip`의 fingerprint도 같은 이유로 stale이지만, `input`이 먼저 걸려 루프가 거기서 멈춘다(9개 다 stale).
  - 이 3개 컴포넌트 manifest만 fingerprint를 갱신해도 `input`이 먼저 막혀 `ui:build`는 여전히 실패한다. 나머지 6개는 이번 작업 범위 밖(river 지시 "위 2건 외 개선·정리 금지")이라 손대지 않았다.
  - 그래서 **정식 `dist` 재생성 없이** 검증했다 — 위 실측은 실제 source 파일(빌드 전) 렌더 기준이다. `dist`에 최종 반영하려면 이 fingerprint 이슈를 먼저 해소해야 한다(누구 담당인지는 orchestrator 판단 필요 — 계약 충돌은 아니고 이전 세션이 정본을 건드린 뒤 fingerprint 갱신을 안 남긴 상태로 보인다).
- `gate:check`은 river 안내대로 Gate 13 error만 남는 게 알려진 상태라 이번엔 별도로 안 돌렸다(요청 범위 밖).
- ②의 인수인계 표는 river가 실제로 본 화면이 `ui-review.html`이라는 **추정**이다 — 직접 "이 화면에서 봤다"는 확인은 못 받았다. 다른 화면에서 봤다면 알려주면 다시 찾겠다.

## 다음 단계 제안

- `ui-review.html:944`의 필터칩 `dropdownMarkup()` 호출에 rows 오버라이드 추가 — guide-builder 소관.
- `input` 포함 9개 컴포넌트 manifest의 `canonicalFingerprint` 갱신 필요(범위 밖, orchestrator 판단 요청).
