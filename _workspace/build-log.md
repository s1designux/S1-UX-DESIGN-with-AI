# Guide Builder 작업 로그

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
