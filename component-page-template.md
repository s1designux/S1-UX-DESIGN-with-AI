# 컴포넌트 소개 화면 기준 틀 (Component Page Template)

> 이 문서는 컴포넌트 가이드 사이트(`components.html`)에 새 컴포넌트를 추가할 때
> **반드시 먼저 읽어야 하는 고정 기준**이다. 추측 금지. 여기 적힌 순서·클래스·GUI 규칙을 그대로 따른다.

---

## 0-A. 먼저 — 두 갈래 중 어느 틀인가 (2026-08-31 river 확정)

| 갈래 | 대상 | 틀 | 화면을 만드는 주체 |
|---|---|---|---|
| **A. 승인 배포본 틀** | UI 라이브러리에서 `status: approved` 로 승격된 컴포넌트 | **§A** | `assets/js/ui-library-guide.js` 가 실제 `ui-library/dist` 를 읽어 생성. `components.html` 에는 빈 mount 만 둔다 |
| **B. 손관리 틀(레거시)** | 아직 UI 라이브러리로 정리되지 않은 컴포넌트 | §1~§6 | 사람이 `components.html` 에 직접 작성 |

**신규 작업의 기본은 A다.** 컴포넌트를 UI 라이브러리로 정리했으면(=`ui-library-code` 워크플로우 6-promotion 완료) 반드시 A로 옮긴다. B는 아직 정리 못 한 컴포넌트를 위한 과도기 틀이며, 새로 B를 늘리지 않는다.

- A의 기준 원본(golden sample): **Input `#input` · Button `#button` · Checkbox `#checkbox` · Radio `#radio`**
- B의 기준 원본: **Line Tab `#tab`** (Button 은 A로 이관 완료 — 옛 `state-size-matrix` 를 따라하지 말 것)

---

## 0. 핵심 원칙 — 틀은 고정, 내용은 유연 (두 갈래 공통)

| 고정 (절대 바꾸지 않음) | 유연 (컴포넌트 특성에 맞게 조정) |
|---|---|
| 섹션 내부 블록의 **순서** | variant(종류)의 개수와 이름 |
| 클래스명·DOM 구조·그리드 규칙 | 상태(state)의 종류·개수 |
| 카테고리 분류 체계 | 사이즈 행의 개수 |
| 코드탭 구성과 순서 | sub-type 그룹 유무 (예: Input의 Search/Password) |
| 헤더·뱃지·라벨의 GUI 스타일 | 미리보기 안의 실제 컴포넌트 마크업 |

새 컴포넌트가 기존과 "조금 달라야" 하는 부분은 전부 **유연** 열 안에서만 달라진다.
**고정 열은 어떤 경우에도 동일**하다. 이게 통일감의 근거다.

---

## §A. 승인 배포본 컴포넌트 안내 틀 (river 확정 틀)

> **이 틀은 고정이다.** 컴포넌트마다 달라지는 것은 상태 이름·축 이름·예시 내용뿐이고, **블록의 종류와 순서는 항상 같다.**
> 기계 검사: `ui-library/scripts/test.mjs` 가 mount 형태·dist 링크·"실제 동작이 문서보다 앞" 을 검사한다.
> 표출 선언: `registry/governance/component-presentation-policy.json` 의 `_meta.uiLibraryGuideLayout`.

### A-1. `components.html` 에 두는 것 — mount 와 내비뿐

```html
<!-- Approved {Name} guide: ui-library-guide.js renders from ui-library/dist -->
<section class="comp-section" id="{id}" data-cov-states="…"></section>
```
- 손으로 쓴 미리보기 마크업을 **남기지 않는다**(빈 `<section>` 이어야 한다).
- `data-cov-*` 커버리지 속성은 유지한다(Gate 19·32 가 읽는다).
- `comp-nav` 버튼의 `disabled` 를 해제한다.
- `registry/governance/component-presentation-policy.json` 의 해당 컴포넌트에 `"managedBy": "ui-library-guide"` 를 붙인다 — 정적 파서로는 JS 렌더 결과를 볼 수 없으므로 Gate 23 이 거짓 통과 대신 **미계측**으로 정직 보고한다. 대신 **Action 영역 존재를 실제 렌더로 확인**한다.

### A-2. 섹션 내부 순서 (고정)

```
div.uilg
├─ ① header.uilg-header              제목 + 한 줄 설명 + 뱃지
├─ ② section.uilg-demo.preview-area  "실제 동작과 상태"   ← 항상 문서보다 먼저
│      ├─ div.uilg-demo-head          소제목 + 승인 범위 한 줄 + "같은 dist 사용" 문구
│      └─ div.platform-section(-pc / -mobile) > div.preview-area
│           ├─ div.comp-action-top    ★ Action
│           └─ div.comp-state-matrix  ★ 상태 매트릭스
├─ ③ section  "개발 코드"             제목 + 코드 탭(HTML·CSS·JavaScript) + 복사
├─ ④ section.uilg-rules "구현 시 꼭 지킬 것"
└─ ⑤ details.uilg-usage-details "상세 사용 가이드"  (접힘)
```

**순서를 바꾸지 않는다.** 사람이 먼저 보는 것은 설명이 아니라 **실제로 움직이는 물건**이다.

### A-3. ① 헤더

- 제목(컴포넌트명) + 한 줄 설명 + 뱃지 `Approved` · `Core` · `v{version}` · `실제 dist 사용`.
- **제목·설명 아래에 구분선을 두지 않는다**(river 확정 2026-08-31). 간격만 둔다.

### A-4. ② Action — "실제로 눌러보는 자리"

- 라벨은 `ACTION`(`.matrix-col-header-action`), 위치는 상태 매트릭스 **바로 위**.
- 여기에는 **그 컴포넌트를 실제로 쓰는 모습**을 놓는다. 상태 나열이 아니다.
  - 여러 개를 함께 쓰는 컴포넌트(Checkbox·Radio 등): **묶음 예시**를 놓는다 — `fieldset` + 그룹 이름 + 항목 2~3개 + 한 줄 설명(river 확정 2026-08-31).
  - 크기 축이 있는 컴포넌트(Input·Button 등): 대표 크기의 라이브 인스턴스를 놓는다.
- 그룹 이름(legend)과 첫 항목 사이 **12px**.
- **Action 아래 구분선은 1개다.** `.comp-action-top` 이 자체 `border-bottom` 을 그리므로 그 뒤에 `<hr>` 을 또 넣지 않는다.

### A-5. ② 상태 매트릭스

- **열 = 정본 상태 전수.** 설치기 정본(`build-components.ts`)에 있는 상태를 하나도 빼지 않는다.
- **행 = 그 컴포넌트의 두 번째 축.** 예: 라벨 없음/있음(Checkbox·Radio), 메시지 없음/있음(Input), variant(Button).
- 정본에 없는 상태를 만들지 않는다. 정본에 마우스오버가 있으나 실제로 올릴 수 없는 칸은 **검수 전용 `data-force-state`** 로 표시한다(제품 동작 API 아님).
- 상태 칸은 `.comp-state-cell` + `is-preview`(클릭 막음), Action 칸만 실제로 동작한다.
- **Mobile 화면 규칙 (river 확정 2026-09-02) — "축이 하나면 축으로 세우지 않는다":**
  - 크기가 **한 가지뿐이면 크기 라벨(LG·SM·MD)과 크기별 블록 분리를 만들지 않는다.** 대신 그 자리에 유형(Primary·Secondary·Blue Line / Line·Solid / 제목 유무)을 넣어 **한 표에서 함께** 보이게 하고, 유형 사이 가로선(`<hr>`)도 두지 않는다. 「Disabled 공통」 같은 크기 비교용 꼬리표도 함께 뺀다.
  - 크기·플랫폼 축이 아예 없는 컴포넌트(Checkbox·Radio·Toggle·Dropdown)에 **"정본에 플랫폼·크기 축이 없어 PC와 같습니다" 류의 안내문을 두지 않는다.** 화면이 이미 같아 보이므로 정보 가치가 없고, PC 에 없는 문단이 하나 더 들어가 **제목↔Action 간격이 PC 와 달라진다.**
  - **Mobile preview-area 는 PC 와 같은 구조로 시작한다** — 선행 안내 문단 금지. 플랫폼별로 꼭 필요한 설명은 Action 상자 **안쪽**에 둔다(PC 와 같은 자리).
  - 한 플랫폼만 보이는 화면에서 **숨겨진 형제 섹션 때문에 생기는 웃여백을 없앤다** — `.view-mobile .platform-section-pc + .platform-section-mobile { margin-top: 0 }`(`pages/components.html`). 이걸 빼면 Mobile 만 24px 더 벌어진다.
- **variant 블록 사이 구분선(`<hr class="uilg-separator">`) 간격은 24px 다** (`.uilg-variant-block + .uilg-separator { margin-block: var(--spacing-24); }`, `assets/css/ui-library-guide.css`). 8px 로 두면 다른 블록 간격(24px)보다 눈에 띄게 좁아 보인다(river 지적 2026-08-31, Chip Line/Solid 에서 발견). **이 값은 공유 CSS 규칙 1곳에서 정하므로 새 컴포넌트가 같은 클래스를 쓰면 자동으로 상속된다** — 컴포넌트마다 다시 정하지 않는다.

### A-6. ③ 개발 코드

- 제목은 `개발 코드` 하나. **설명 문장을 붙이지 않는다**(river 확정 2026-08-31 — 컴포넌트마다 같은 문장이 반복돼 소음이었다).
- 제목과 코드 박스 사이 **16px**.
- **플랫폼 축이 있는 컴포넌트는 보고 있는 화면의 마크업만 보여준다** (river 확정 2026-09-02) — Mobile 화면에서 PC 마크업을 복사하는 사고를 막는다. 배포본이 `manifest.htmlContract.breakExamples` 로 플랫폼별 예제를 선언한다. 코드 위 안내 문구는 두지 않는다(river 결정 2026-09-02 — 화면 이름으로 이미 알 수 있어 불필요).
- 탭 순서 고정: **HTML → CSS → JavaScript**. 내용은 실제 `ui-library/dist` 에서 읽어온다(손으로 쓴 예시 금지).

### A-7. ④⑤ 문서

- `구현 시 꼭 지킬 것` = `registry/components/{id}.json` 의 `anatomy`·`doDont.dont`·`a11y` 에서 생성.
  - **필수/선택 부품 판별은 `part` 이름의 `(선택)` 표시로 한다.** `role` 문장 안의 낱말로 판별하지 않는다.
- `상세 사용 가이드`(접힘) = `usage.whenToUse`·`whenNotToUse`·`doDont.do`.
- 이 두 블록은 **항상 실제 동작 다음**에 온다.

### A-8. 자가 점검 (A 갈래)

- [ ] `components.html` 의 해당 섹션이 **빈 mount** 이고 손관리 마크업이 남아 있지 않다
- [ ] `comp-nav` 버튼 `disabled` 해제, presentation policy 에 `managedBy: ui-library-guide`
- [ ] 블록 순서가 A-2 와 동일 (실제 동작 → 개발 코드 → 문서)
- [ ] 헤더 아래 구분선 없음 · Action 아래 구분선 1개
- [ ] Action 에 실제로 눌러지는 예시가 있다(상태 나열이 아니다)
- [ ] 상태 열이 정본 상태 전수와 일치
- [ ] variant 블록이 2개 이상이면 그 사이 구분선 간격이 24px 다(공유 CSS `.uilg-variant-block + .uilg-separator` 값을 임의로 좁히지 않았다)
- [ ] 개발 코드에 설명문 없음 · 제목과 박스 사이 16px · 탭 HTML→CSS→JavaScript
- [ ] **실제 렌더로 확인**했다 — 페이지 전체 중복 `id` 0개, 콘솔 오류 0건, Light·Dark 모두 읽힌다
- [ ] 같은 마크업 문자열을 PC·Mobile 두 곳에 붙여넣지 않았다(`id`·라디오 `name` 이 겹쳐 선택이 조용히 풀린다)
- [ ] **Mobile 화면이 PC 와 같은 자리에서 시작한다** — 제목↔Action 간격이 PC 와 같고(실측 동일), Mobile 에만 있는 선행 안내문이 없다
- [ ] Mobile 에 크기 라벨·크기별 블록 분리가 없다(크기가 한 가지일 때)
- [ ] 「개발 코드」가 **보고 있는 화면의 플랫폼 마크업**이다(Mobile 화면에 PC 마크업 금지)
- [ ] 요약에 **자기 크기도 자식 부품 크기도 숫자로 적지 않는다** — 조립 사실만("목록은 Dropdown 배포본을 조립")
- [ ] `npm run ui:guide:render` 통과 — 위 세 가지를 **실제 렌더 DOM** 으로 재확인한다(소스 문자열 검사만 믿지 않는다)

---

## §B. 손관리 틀 (레거시 — 아직 UI 라이브러리로 정리되지 않은 컴포넌트)

> 아래 §1~§6 은 **B 갈래 전용**이다. 승인 배포본 컴포넌트에는 적용하지 않는다(§A 를 따른다).

## 1. 페이지 셸 (네비게이션)

새 컴포넌트는 **두 군데**에 등록한다.

### 1-1. 카테고리 필터 (변경 없음)
```
All · Actions · Selection · Form · Data · Navigation
```

### 1-2. 컴포넌트 탭 (`comp-nav`) — 새 버튼 1개 추가
```html
<button class="comp-nav-btn" data-category="{카테고리}" onclick="showSection('{id}', this)">{표시명}</button>
```
- `data-category`는 아래 분류표 중 하나여야 한다.
- 같은 카테고리끼리 인접하도록 위치시킨다.

### 1-3. 카테고리 분류표
| 카테고리 | 소속 컴포넌트(기존) |
|---|---|
| `actions` | Button |
| `selection` | Checkbox, Radio, Toggle, Chip·FilterChip |
| `form` | Input, Select, Textarea, Date Picker, Time Picker |
| `data` | Table, Pagination |
| `navigation` | Line Tab, GNB |

새 컴포넌트는 성격에 맞는 기존 카테고리에 넣는다. 새 카테고리 신설은 임의로 하지 않는다.

---

## 2. 섹션 구조 (고정 순서)

각 컴포넌트는 `<section class="comp-section" id="{id}">` 하나. 내부 블록 순서는 **항상** 다음과 같다.

```
section.comp-section#{id}
├─ ① div.comp-section-header          ← 제목 + 뱃지
├─ ② div.variant-block  (1개 이상, 종류마다 반복)
│     ├─ div.variant-label            ← 종류 이름 (대문자)
│     ├─ div.preview-area             ← 미리보기 (PC/Mobile)
│     │    ├─ div.platform-section.platform-section-pc
│     │    │    ├─ div.platform-header  (dot + "PC")
│     │    │    └─ div.comp-state-matrix   ← §3 그리드
│     │    └─ div.platform-section.platform-section-mobile  (모바일 있을 때만)
│     │         ├─ div.platform-header  (dot + "Mobile")
│     │         └─ div.comp-state-matrix
│     └─ ③ div.code-block             ← §4 코드탭
└─ (필요 시 §5 variant-group 으로 sub-type 묶음)
```

### ① 헤더
```html
<div class="comp-section-header">
  <h2 class="comp-section-title">{컴포넌트명}</h2>
  <span class="comp-badge comp-badge-blue">{대표 분류}</span>   <!-- 예: Core -->
  <span class="comp-badge">{N} variants</span>
  <span class="comp-badge">PC {n}sizes · Mobile {m}size</span>
</div>
```
- GUI 고정: `display:flex; gap:10px; margin-bottom:20px; padding-bottom:14px; border-bottom:2px solid #f3f4f6`
- 제목: `font-size:18px; font-weight:700; color:#111827`
- 뱃지: 첫 번째만 `comp-badge-blue`(분류), 나머지는 기본 `comp-badge`(개수·사이즈 요약). 뱃지 **개수·문구는 유연**.

### ② variant 블록
- `variant-label`: 대문자, `font-size:11px; font-weight:700; letter-spacing:0.08em; color:#9ca3af; margin-bottom:10px`
- variant가 1개뿐이어도 이 구조를 유지한다(라벨은 컴포넌트 성격에 맞게).
- `preview-area`: `border:1px solid #e5e7eb; border-radius:12px; padding:24px 32px; isolation:isolate`
- 모바일 표현이 없는 컴포넌트는 `platform-section-mobile`을 생략(PC만). 있으면 PC 다음에 둔다.
  - 두 플랫폼 사이 간격은 `.platform-section + .platform-section { margin-top:24px }`로 자동.

---

## 3. comp-state-matrix (가장 중요한 고정 그리드)

미리보기의 핵심. **세로=사이즈, 가로=[Size][Action][상태들]**.
**표준은 `comp-state-matrix`** 다. 옛 `state-size-matrix` 는 따라하지 않는다.

```css
.comp-state-matrix{
  display:grid;
  column-gap:10px; row-gap:14px; align-items:start;
  /* grid-template-columns 는 컴포넌트별로 인라인 지정한다.
     예) grid-template-columns: 88px minmax(180px,auto) repeat({상태수}, auto); */
}
```
- 1번째 열 = **Size 라벨**, 2번째 열 = **Action(라이브 동작)**, 그 뒤 = 상태 미리보기.
- 열 수·헤더 개수는 **그 컴포넌트의 상태 수에 맞춘다**(유연). 패턴 자체는 고정.
- 셀 배치는 자연 그리드 흐름, 또는 셀마다 인라인 `grid-column`/`grid-row` 지정(컴포넌트별).

### 헤더 행 (그리드 첫 줄)
```html
<div class="matrix-col-header-action">Size</div>     <!-- 1열: Size (강조) -->
<div class="matrix-col-header-action">Action</div>   <!-- 2열: Action (강조) -->
<div class="matrix-col-header">Default</div>  <!-- 상태명: 컴포넌트마다 다름(유연) -->
<div class="matrix-col-header">Hover</div>
<div class="matrix-col-header">Selected</div>
```
- `matrix-col-header-action` = Size·Action 헤더(강조). 나머지 상태 헤더 = `matrix-col-header`(회색).

### 사이즈 행 (사이즈마다 반복)
```html
<div class="comp-state-cell">md<br><span>h56 · 18px</span></div>   <!-- Size 라벨 + 보조수치 -->
<div class="comp-action-cell" data-comp-action="{id}-md">
   {라이브 동작하는 실제 컴포넌트}
</div>
<div class="comp-state-cell">{상태1 미리보기 .is-preview}</div>
<div class="comp-state-cell">{상태2 미리보기 .is-preview}</div>
<div class="comp-state-cell">{상태3 미리보기 .is-preview}</div>
```
- Size 라벨 보조수치(`<span>`): 사이즈 높이·폰트 등 `h56 · 18px` 형식.
- Action 열은 **실제로 클릭/입력되는 라이브 인스턴스**(`.comp-action-cell` + `data-comp-action`), 상태 열은 **고정 미리보기**(`.comp-state-cell` 안에 `.is-preview`, `pointer-events:none`).
- 행 순서: 큰 사이즈 → 작은 사이즈.
- 행 레이블 방식(Chip·Input 등 가로=상태, 세로=variant)은 `.comp-row-label` 사용 가능.

> **레거시 (Button 전용):** `state-size-matrix` + `matrix-cell`/`matrix-row-label`/`action-cell data-action-test`. **신규 컴포넌트에 쓰지 않는다.**

---

## 4. 코드 블록 (variant 블록마다 1개)

```html
<div class="code-block">
  <div class="code-tabs">
    <button class="code-tab active" onclick="switchTab(this,'{id}-pc')">PC · HTML</button>
    <button class="code-tab" onclick="switchTab(this,'{id}-mo')">Mobile · HTML</button>
    <button class="code-tab" onclick="switchTab(this,'{id}-css')">CSS Token</button>
    <button class="code-tab" onclick="switchTab(this,'{id}-tokens')">Token Details</button>
    <button class="code-copy-btn">Copy</button>
  </div>
  <div class="code-pane active" id="{id}-pc"><pre>…</pre></div>
  <div class="code-pane" id="{id}-mo"><pre>…</pre></div>
  <div class="code-pane" id="{id}-css"><pre>…</pre></div>
  <div class="code-pane" id="{id}-tokens"><table class="token-detail-table">…</table></div>
</div>
```
- 탭 순서 고정: **PC·HTML → Mobile·HTML → CSS Token → Token Details**.
- 모바일이 없는 컴포넌트는 Mobile·HTML 탭 생략 가능(나머지 순서는 유지).
- 일부 컴포넌트는 JavaScript 탭을 추가할 수 있음 — 추가 시 CSS 앞이 아니라 HTML 다음에 둔다.
- `code-pane`의 `id`는 `code-tab`의 `switchTab` 두 번째 인자와 정확히 일치해야 함.

---

## 5. sub-type 묶음 (variant-group) — 필요할 때만

한 컴포넌트가 성격이 갈리는 하위 종류를 가질 때(예: Input → Search/Password, Time Picker → Input형/Select형/Mobile) 사용.
```html
<div class="variant-group">
  <h3 class="variant-group-title">{하위 종류명}</h3>
  <p class="variant-group-desc">{한 줄 설명, <code>토큰</code> 인라인 가능}</p>
  …(그 안에 variant-block / matrix / code-block 동일 구조 반복)…
</div>
```
- `variant-group`: `margin-top:32px; padding-top:24px; border-top:2px solid #e5e7eb`로 시각적으로 구분.
- 단순한 컴포넌트는 이 묶음 없이 §2 구조만으로 끝낸다.

---

## 6. 빌드 후 자가 점검 체크리스트 (B 갈래)

새 컴포넌트 섹션을 만든 뒤 **스스로** 확인한다. 하나라도 어긋나면 수정 후 재확인.

- [ ] `comp-nav`에 버튼 추가 + 올바른 `data-category` 부여
- [ ] 섹션 블록 순서가 §2와 동일 (헤더 → variant-block → code-block)
- [ ] 헤더에 제목 + 뱃지(분류/개수/사이즈) 존재
- [ ] 미리보기가 `comp-state-matrix` 그리드 사용 (자체 레이아웃 만들지 않음)
- [ ] 그리드 1·2열 = 라벨·Action, 상태 헤더 개수 = `repeat()` 수와 일치
- [ ] Action 셀은 라이브 인스턴스(`.comp-action-cell` + `data-comp-action`), 상태 셀은 `.comp-state-cell` + `.is-preview`(pointer-events:none)
- [ ] 사이즈 행 순서 = 큰 것 → 작은 것, 보조수치(`h.. · px..`) 표기
- [ ] 코드탭 순서 = PC·HTML → Mobile·HTML → CSS → Token, `id` 매칭 정확
- [ ] 새로 정의한 색/간격/폰트 없음 — 기존 클래스·토큰만 재사용
- [ ] **유연 항목(variant·상태·사이즈 수)만 달라졌고, 고정 항목은 전부 동일**한가
