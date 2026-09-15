# 3-build(가이드) 사양서 — 검수·안내 화면 연결

작업 `bottom-sheet` · 2026-09-15 · 대상 = `guide-builder`
**전제:** `ui-library/src` 구현과 `ui-library/dist` 생성은 이미 끝나 있다. 이 문서는 **화면을 실제 dist 에 연결**하는 일만 다룬다.

---

## 0. 절대 규칙

- **화면은 실제 `ui-library/dist` 를 소비한다.** CSS·마크업을 손으로 베껴 화면에 심으면 검증이 무의미하다.
- `ui-library/src` · `ui-library/dist` · `registry/**` · `workflow-state.json` 은 건드리지 않는다.
- 안내 페이지 레이아웃은 **`component-page-template.md §A(승인 배포본 틀)`** 를 따른다. 틀은 고정이고 상태·축·예시 내용만 다르다.

---

## 1. 대상 컴포넌트

| id | 이름 | 변형 | 상태 |
|---|---|---|---|
| `bottom-sheet` | Bottom Sheet | Footer `none` · `single` · `dual` | 닫힘/열림(런타임) |
| `bottom-sheet-option` | Bottom Sheet Option | Type `text`·`checkbox`·`radio`·`list` | `default`·`selected`·`disabled` — **실재 9칸만** |

**없는 칸 3개를 화면에 만들지 않는다:** `checkbox:disabled` · `radio:disabled` · `list:selected`.

둘 다 **모바일 전용**이다 — `data-platforms="mobile"`.

---

## 2. `assets/js/ui-library-guide.js`

### 2-1. `componentConfig` 항목 2개

```js
"bottom-sheet": {
  title: "Bottom Sheet",
  description: "모바일에서 화면 아래에서 올라오는 시트입니다. 어두운 배경 위에 제목·닫기·본문·버튼 순으로 뜹니다. 모바일에서 드롭다운 대신 쓰는 자리입니다.",
  approvedScope: "푸터 3종(없음 · 버튼 1개 · 버튼 2개) · 폭은 화면 폭(최대 360) · 높이는 내용만큼 · 크기 축 없음 · 모바일 전용 · Esc 닫기 · 딤 눌러 닫기 · 초점 가둠",
  runtime: S1UI.bottomSheet
},
"bottom-sheet-option": {
  title: "Bottom Sheet Option",
  description: "바텀시트 안에 놓이는 한 줄입니다. 단독으로 쓰지 않고 시트 본문에 넣어 씁니다.",
  approvedScope: "유형 4종(글자 · 체크박스 · 라디오 · 목록) × 상태 3종 중 정본에 실재하는 9칸 · 글자·체크박스·라디오 줄은 높이 48 고정 · 목록 줄은 내용만큼 · 크기 축 없음 · JavaScript 불필요",
  runtime: null
}
```

`S1UI.bottomSheet` 이름은 실제 dist 번들이 내보내는 이름과 맞춰야 한다 — `ui-library/dist/s1-ui.js` 를 열어 확인하고 쓴다(추측 금지).

### 2-2. `stateMatrix()` 분기

`stateMatrix(id)` 에 두 줄을 더하고, 아래 두 함수를 만든다.

**`bottomSheetStateMatrix()`** — modal 을 본뜬다(`modalStateMatrix`).
- **Action 칸**: 실제로 열리는 시트. "시트 열기" 버튼(`data-s1-component="button"` `data-size="lg"`) + 진짜 시트 마크업(`hidden`). 안내 문구: "눌러서 열어 보세요. Esc 키로 닫히고, **어두운 배경을 눌러도 닫힙니다.** Tab 키는 시트 안에서만 돕니다. 닫으면 열기 전 자리로 초점이 돌아옵니다."
- **상태 칸**: 푸터 3종(`none`·`single`·`dual`)을 지면에 눕혀 보이는 정적 표본(`is-preview`). 모달 검수 칸과 같은 방식.
- 시트 본문에는 `bottom-sheet-option` Type=Text 4줄(2번째 Selected)을 넣는다 — **정본 기본 채움 그대로**.
- 진짜 시트는 계약대로 `document.body` 바로 아래로 옮겨 붙인 뒤 `init` 한다(modal 배선과 같다). **미리보기 칸(`is-preview`)은 `init` 하지 않는다** — 배경 스크롤이 잠긴 채 남는다(modal-content 주석의 같은 사고).
- 푸터 버튼에 `data-sheet-close` 를 달아 닫기를 배선하되, **`data-s1-part="sheet-close"` 는 건너뛴다**(런타임이 이미 배선한다 — modal 배선의 같은 규칙).
- 한 페이지에 시트가 여럿 생기므로 **`sheet-title` 의 `id` 를 자리마다 새로 만든다**(카운터). 같은 문자열 재사용 금지(함정 T5).

**`bottomSheetOptionStateMatrix()`** — `gnb-sub-menu-item` 을 본뜬다.
- 가로축 = 상태(Default·Selected·Disabled), 세로축 = 유형(Text·Checkbox·Radio·List).
- **없는 칸 3개는 빈 칸으로 두고 "정본에 없음" 이라고 표시한다.** 만들지 않는다.
- 줄이 시트 폭 안에서 어떻게 보이는지 알 수 있게, 각 칸을 360px 폭 상자 안에 넣는다.

### 2-3. `guideComponents` 배열

`"bottom-sheet"`, `"bottom-sheet-option"` 을 더한다.

### 2-4. 코드탭

코드 예시는 **실제 dist 의 `examples/*.html` 에서 읽어온다.** 손으로 적은 사본을 넣지 않는다(다른 컴포넌트가 하는 방식 그대로).

---

## 3. `pages/components.html`

### 3-1. `comp-nav` 버튼 2개

`overlay` 카테고리, Modal Content 다음 줄에:

```html
<button class="comp-nav-btn" data-category="overlay" data-platforms="mobile" onclick="showSection('bottom-sheet', this)">Bottom Sheet</button>
<button class="comp-nav-btn" data-category="overlay" data-platforms="mobile" onclick="showSection('bottom-sheet-option', this)">Bottom Sheet Option</button>
```

`disabled` 를 붙이지 않는다.

### 3-2. 빈 mount + 마커

Modal Content 섹션 다음에:

```html
<!-- Approved Bottom Sheet guide: ui-library-guide.js renders from ui-library/dist -->
<section class="comp-section" id="bottom-sheet" data-cov-footer="none,single,dual"></section>

<!-- Approved Bottom Sheet Option guide: ui-library-guide.js renders from ui-library/dist -->
<section class="comp-section" id="bottom-sheet-option" data-cov-type="text,checkbox,radio,list" data-cov-states="default,selected,disabled"></section>
```

`data-cov-*` 값은 **Gate 19(variant 커버리지)가 읽는다** — 실제 렌더되는 칸과 맞아야 한다. 없는 칸 3개 때문에 Gate 가 막으면 억지로 만들지 말고 그 사실을 보고한다.

### 3-3. `component-presentation-policy.json`

두 id 에 `"managedBy": "ui-library-guide"` 를 붙인다. **안 붙이면 Gate 23 이 "Action 영역 없음" 으로 막는다**(정적 파서가 JS 렌더를 못 본다).
다만 **미계측은 통과가 아니다**(함정 T6) — Action 영역이 실제로 그려지는지 렌더로 직접 확인하고 그 결과를 보고한다.

---

## 4. `pages/ui-review.html`

기존 23개 섹션 뒤에 2개를 더한다(번호 24·25). 틀은 옆 섹션들과 같다.

```html
<section class="review-section" aria-labelledby="bottom-sheet-review-title" data-component-id="bottom-sheet">
  <div>
    <h2 class="review-section-title" id="bottom-sheet-review-title">24. Bottom Sheet — 아래에서 올라오는 시트</h2>
    <p class="review-note">…</p>
  </div>
  <div class="review-matrix" id="bottom-sheet-review-matrix"></div>
</section>
```

`review-note` 에 반드시 담을 것 (river 가 읽는 글이다 — 쉬운 말로):
- 정본 변형 3가지(푸터 없음 · 버튼 1개 · 버튼 2개)를 그대로 옮겼다는 것
- **본문은 빈 자리**이고 화면마다 갈아끼운다는 것. 아래 표본에 들어 있는 4줄은 정본의 기본 채움이다
- 폭은 화면 폭을 따라간다는 것(정본 360 은 모바일 화면 폭)
- **Esc·닫기(X)·어두운 배경 누르기 세 가지로 닫힌다**는 것. 어두운 배경 누르기는 **날짜·시간 선택 시트가 이미 하고 있던 동작**을 그대로 가져온 것이고, 확인 팝업(Modal)은 그렇게 닫히지 않는다는 차이
- 올라오는 애니메이션은 넣지 않았다는 것(정본에 모션 규칙이 없다)
- **모바일 전용**이라는 것
- 날짜 선택·시간 선택 시트가 이제 이 부품을 쓴다는 것, 그리고 **이관 전후 화면이 같은지 확인했다**는 것

Option 섹션(25번) `review-note` 에 담을 것:
- 유형 4가지 × 상태 3가지 중 **정본에 실재하는 9칸만** 있고 3칸은 정본에 없어 만들지 않았다는 것(어느 3칸인지 쉬운 말로)
- **고른 줄에 배경색을 칠하지 않는다**는 것 — 정본이 글자색과 체크 표시로만 구분한다
- 체크박스·라디오는 이미 승인된 배포본을 그대로 넣었다는 것
- 목록 줄은 아바타와 두 줄 글자라 높이가 내용만큼 늘어난다는 것

---

## 5. 확인

```
npm run ui:guide:render
npm run ui:test
npm run gate:check
```

그리고 **실제 렌더로 눈으로 본다**(함정 T2 — `pages/*.html` 은 `file://` 에서 텅 빈 채로 찍힌다. 반드시 http):
- Action 칸의 시트가 실제로 열리고 Esc·딤·닫기(X)로 닫히는가
- 상태 칸 3종이 각각 다르게 보이는가(푸터 없음일 때 아래 여백이 더 넓은가)
- Option 9칸이 보이고 없는 3칸이 안 보이는가
- Light·Dark 양쪽에서 글자가 읽히는가
- **페이지 전체 중복 `id` 0개**(함정 T5 — 라디오만 세지 말 것)
- 콘솔 오류 0건

## 6. 돌려줄 것

`reports/ui-library/bottom-sheet/3-guide.md` 에: 고친 파일 목록 · 검사 결과(종료코드 그대로) · §5 육안 확인 결과 · 막힌 것.
**자기 결과를 PASS 로 판정하지 않는다.**

---

## 7. 추가 — 이미 있는 검수 화면의 시트 마크업 고치기 ⚠️ 먼저 할 것

`ui-library/src` 이관이 끝나면서 시트 껍데기 CSS 가 `date-picker.css`·`time-picker.css` 에서 **빠졌고**, 이제 `bottom-sheet.css` 가 소유한다. 그래서 **`data-s1-component="bottom-sheet"` 가 없는 시트 마크업은 껍데기 스타일이 통째로 빠진다.**

`pages/ui-review.html` 안에 손으로 쓴 시트 마크업 두 자리가 그 상태다:

| 줄 | 무엇 |
|---|---|
| 2061 | `<div data-s1-part="sheet" hidden>` |
| 2211 | `` ? `<div data-s1-part="sheet"${open ? "" : " hidden"}...` `` (템플릿 문자열) |

둘 다 루트에 **`data-s1-component="bottom-sheet"` 와 `data-break="mobile"` `data-footer="single"`** 을 더한다. 안쪽 부품 이름은 하나도 바꾸지 않는다.

207줄의 `[data-s1-component="date-picker"] [data-s1-part="sheet"].is-review-inline` 검수 전용 CSS 는 선택자가 여전히 맞으므로 그대로 둔다.

**고친 뒤 실제 렌더로 확인한다** — date-picker·time-picker 검수 칸의 모바일 시트가 이관 전과 똑같이 보이는가. 이 확인이 이번 작업의 "퇴행 없음" 증거 중 하나다.

## 8. dist 가 내보내는 이름 (확인 완료)

`ui-library/dist/s1-ui.js` 가 `bottomSheet` · `bottomSheetOption` 으로 내보낸다. `componentConfig` 의 `runtime` 은 `S1UI.bottomSheet` 를 쓰고, Option 은 런타임이 없으므로 `null` 로 둔다.
