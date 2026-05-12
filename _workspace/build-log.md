# Guide Builder 작업 로그

## 2026-05-11 — components.html non-Button preview 영역 ACTION matrix 전환

### 변경 대상
- `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/pages/components.html`

### 변경 내용
1. **신규 CSS 추가** (`.token-variant-label` 직후, line 469~493):
   - `.comp-state-matrix` (grid 컨테이너), `.comp-row-label`, `.comp-state-cell`, `.comp-action-cell`
   - `@media (max-width:1024px)` reduced column-gap
2. **Checkbox** (id="checkbox"): `chk-label-toggle` + `checkbox-grid` 8셀 그리드 → `comp-state-matrix` ACTION + 5상태(Default/Checked/Indeterminate/Disabled/Dis+Checked)
   - ACTION cell: `#chk-action-target` + 4 mini toggles (Check, Indet, Disabled, Label)
3. **Radio** (id="radio"): `state-strip` 4셀 → `comp-state-matrix` ACTION + 4상태
   - ACTION cell: `#radio-action-target` + 2 mini toggles (Select, Disabled)
4. **Toggle** (id="toggle"): `state-strip` 4셀 → `comp-state-matrix` ACTION + 4상태(Off/On/Disabled Off/Disabled On)
   - ACTION cell: `#toggle-action-target` + 2 mini toggles (Toggle, Disabled)
5. **Chip** (id="chip"): 4개의 분리된 variant-block을 **1개의 통합 variant-block**으로 병합
   - 행별 레이블 column 추가: Chip Line / Chip Solid / Filter Label only / Filter With title
   - 각 행: row-label + ACTION(2 toggles) + 3 정적 상태(Default/Selected/Disabled)
   - ACTION IDs: `#chip-line-action`, `#chip-solid-action`, `#filter-chip-action`, `#filter-chip-title-action`
6. **Input** (id="input"): 4개 variant-block 모두 변환
   - Sizes: ACTION(Medium live with clear-btn) + Small + XSmall
   - States · Medium: ACTION + 5상태(Complete/Error/Correct/Disabled/Focus)
   - States · Small: ACTION + 5상태 (동일)
   - States · XSmall: ACTION + 5상태 (동일)
7. **Select** (id="select"): `state-strip` 4셀 → `comp-state-matrix` ACTION + 4상태
   - ACTION cell: `#select-action-target` + 2 mini toggles (Open, Disabled)
8. **JS 추가** (`setupButtonActionTests()` 호출 직후):
   - `setupCompActionTests()` — 각 컴포넌트별 ACTION 토글 핸들러 등록
   - Checkbox 4 handlers, Radio 2, Toggle 2, Chip Line 2, Chip Solid 2, Filter 2, Filter+Title 2, Select 2

### 보존 항목
- Button 섹션(`id="button"`) — 수정 없음
- 각 컴포넌트 `.code-block` (HTML/CSS 코드 뷰어) — 그대로 유지
- `.state-strip` CSS rule — 기존 위치(line 252) 유지 (현재 미사용이지만 영향 없음)
- `.checkbox-grid`, `.chk-label-toggle` CSS — 유지 (HTML markup만 제거)

### 검증
- `state-strip` HTML markup 0건 (CSS rule 1건만 남음): grep 결과 line 252만 매치
- `<section class="comp-section">` 7개, `</section>` 7개 — 균형 일치
- `<div class="variant-block">` 13개 (Button 4 + Checkbox 1 + Radio 1 + Toggle 1 + Chip 1 + Input 4 + Select 1)
- ACTION 데이터 속성 58건 (data-comp-action, data-chk-*, data-radio-*, data-toggle-*, data-chip-*, data-filter-*, data-select-*)
- 파일 라인 수: 2,136 → 2,309 줄

---

## 2026-05-06 — guide-md.html 에 design-principles.md 탭 패널 추가

### 변경 대상
- `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/pages/guide-md.html`

### 변경 내용
- component 패널(`<div class="guide-panel" id="tab-component">`) 닫는 `</div>` 직후에 신규 패널 삽입
  - 새 패널 id: `tab-design-principles`
  - 새 `<pre>` id: `code-design-principles` (10,779 chars HTML escaped)
  - 복사 버튼 id: `copy-design-principles` (`onclick="copyMd('design-principles')"`)
  - meta: "디자인 원칙 정의서 · 434줄"
  - footer: `<div class="line-count">434 lines</div>`
- 원본 `docs/design-principles.md` (433 lines, 마지막 newline 포함 시 434) 전체를 `html.escape(quote=True)` 처리 후 삽입
  - `<` → `&lt;` 1건, `>` → `&gt;` 32건 escape 확인
  - `<pre>` 블록 내부에 raw `<`, `>` 0건 — escape 누락 없음

### 검증
- 탭 버튼은 기존에 `data-tab="design-principles"` 로 추가되어 있어 추가 작업 불필요
- `copyMd(id)` 함수는 id 기반(`code-{id}`, `copy-{id}`)으로 동작 → `design-principles` id를 그대로 처리. JS 수정 불필요
- 파일 라인 수: 1,206 → 1,652 줄로 증가
- 패널 구조: tab-component(1181) → tab-design-principles(1184~1632) 정상 삽입
