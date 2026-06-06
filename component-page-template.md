# 컴포넌트 소개 화면 기준 틀 (Component Page Template)

> 이 문서는 컴포넌트 가이드 사이트(`components.html`)에 새 컴포넌트를 추가할 때
> **반드시 먼저 읽어야 하는 고정 기준**이다. 추측 금지. 여기 적힌 순서·클래스·GUI 규칙을 그대로 따른다.
> 기준 원본(golden sample)은 `components.html`의 **Button 섹션(`#button`)**.

---

## 0. 핵심 원칙 — 틀은 고정, 내용은 유연

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
| `navigation` | Line Tab |

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
│     │    │    └─ div.state-size-matrix   ← §3 그리드
│     │    └─ div.platform-section.platform-section-mobile  (모바일 있을 때만)
│     │         ├─ div.platform-header  (dot + "Mobile")
│     │         └─ div.state-size-matrix
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

## 3. state-size-matrix (가장 중요한 고정 그리드)

미리보기의 핵심. **세로=사이즈, 가로=[라벨][Action][상태들]**.

```css
.state-size-matrix{
  display:grid;
  grid-template-columns: 100px 200px repeat({상태수}, minmax(110px,1fr));
  column-gap:10px; row-gap:14px; align-items:start;
}
```
- 1번째 열(100px) = 사이즈 라벨, 2번째 열(200px) = **Action(라이브 동작)**, 그 뒤 `repeat()` = 상태 미리보기.
- `repeat()`의 숫자와 헤더 개수는 **그 컴포넌트의 상태 수에 맞춘다**(유연). 패턴 자체는 고정.

### 헤더 행 (그리드 첫 줄)
```html
<div></div>                                   <!-- 라벨 열: 비움 -->
<div class="matrix-col-header-action">Action</div>   <!-- 초록 #16a34a, 고정 -->
<div class="matrix-col-header">Default</div>  <!-- 상태명: 컴포넌트마다 다름(유연) -->
<div class="matrix-col-header">Hover</div>
<div class="matrix-col-header">Disabled</div>
```
- `matrix-col-header-action`는 항상 초록·"Action". 나머지 상태 헤더는 회색 `#9ca3af`.

### 사이즈 행 (사이즈마다 반복)
```html
<div class="matrix-row-label">medium<span>h44 · px16</span></div>   <!-- 이름 + 보조수치 -->
<div class="matrix-cell action-cell" data-action-cell>
   {라이브 동작하는 실제 컴포넌트} <div class="action-test-controls">…</div>
</div>
<div class="matrix-cell">{상태1 미리보기 .is-preview}</div>
<div class="matrix-cell">{상태2 미리보기 .is-preview}</div>
<div class="matrix-cell">{상태3 미리보기 .is-preview}</div>
```
- 라벨 보조수치(`<span>`): 사이즈 높이·폰트 등 `h44 · px16` 형식.
- Action 열은 **실제로 클릭/입력되는 라이브 인스턴스**(`data-action-test`), 상태 열은 **고정 미리보기**(`.is-preview`, `pointer-events:none`).
- 행 순서: 큰 사이즈 → 작은 사이즈.

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
- 일부 컴포넌트는 JavaScript 탭을 추가할 수 있음(예: Checkbox) — 추가 시 CSS 앞이 아니라 HTML 다음에 둔다.
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

## 6. 빌드 후 자가 점검 체크리스트

새 컴포넌트 섹션을 만든 뒤 **스스로** 확인한다. 하나라도 어긋나면 수정 후 재확인.

- [ ] `comp-nav`에 버튼 추가 + 올바른 `data-category` 부여
- [ ] 섹션 블록 순서가 §2와 동일 (헤더 → variant-block → code-block)
- [ ] 헤더에 제목 + 뱃지(분류/개수/사이즈) 존재
- [ ] 미리보기가 `state-size-matrix` 그리드 사용 (자체 레이아웃 만들지 않음)
- [ ] 그리드 1·2열 = 라벨·Action, 상태 헤더 개수 = `repeat()` 수와 일치
- [ ] Action 헤더는 초록 "Action", Action 셀은 라이브 인스턴스(`data-action-test`)
- [ ] 상태 셀은 `.is-preview` 사용
- [ ] 사이즈 행 순서 = 큰 것 → 작은 것, 보조수치(`h.. · px..`) 표기
- [ ] 코드탭 순서 = PC·HTML → Mobile·HTML → CSS → Token, `id` 매칭 정확
- [ ] 새로 정의한 색/간격/폰트 없음 — 기존 클래스·토큰만 재사용
- [ ] **유연 항목(variant·상태·사이즈 수)만 달라졌고, 고정 항목은 전부 동일**한가
