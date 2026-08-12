# (A) Figma→코드 4단계 자가대조 · 5단계 다크모드 — 상세 절차

> `component-verifier` 전용 참조. 2026-08-12 에이전트 본문에서 이관(문장 원문 유지 — spawn 상시 로드 비용 절감).
> 공통 원칙(두갈래·정확대조·시각 매칭 2대 원리·판정 기준)은 `.claude/agents/component-verifier.md` 본문이 정본.

## 역할

`reports/figma-to-code/{component}/`의 **1단계 재고조사표**와 **2단계 수치추출표**를 유일한 기준으로 삼아,
구현 결과물(`pages/components.html` harness + `registry/components/{component}.json`)을 항목별로 대조한다.
불일치를 ❌ 목록으로 정리해 돌려준다.

## 대조 항목 (4단계)

| 항목 | 기준 | 분류 | 판정 |
|------|------|------|------|
| **variant 개수** | 1단계 목록 전수 | **정확 대조** (두갈래 제외) | 목록의 모든 variant가 harness에 존재해야 PASS. 누락 1개라도 **무조건 ❌** ((b)/(c) 금지) |
| **아이콘 출처** | 1단계 목록 | **정확 대조** (두갈래 제외) | MCP 원본 에셋(SVG/localhost) 사용. 새로 그렸거나 외부 패키지면 **무조건 ❌** ((b)/(c) 금지) |
| **토큰 참조 구조** | Gate 1 규칙 | **정확 대조** (두갈래 제외) | 색상은 Semantic 경유. Foundation 직접 참조면 **무조건 ❌** |
| **색상값** | 2단계 매핑표 | 두갈래 분류 | Component 토큰이 Semantic 경유, resolved 값이 표와 일치. 불일치 시 (a)/(b)/(c)로 분류 |
| **크기·두께** | 2단계 수치표 | 두갈래 분류 | 높이·인디케이터·border-width 등 수치가 표와 일치. 불일치 시 (a)/(b)/(c)로 분류 |
| **타이포** | 2단계 수치표 | 두갈래 분류 | font-size·weight·line-height·letter-spacing 일치. 불일치 시 (a)/(b)/(c)로 분류 |

## 시각·레이아웃 대조 (필수 — CSS 값 대조만으로 불충분)

> ⚠️ **CSS 선언값이 표와 일치해도 렌더 레이아웃은 다를 수 있다.** (예: 아이콘에 24px 박스가 빠져 min-width를 못 채우면 화살표가 가운데 뜸.) 값 대조만으로 통과시키지 말고 **반드시 렌더를 실측**한다. (시각 매칭 2대 원리는 에이전트 본문 참조 — 숫자 일치 ≠ 시각 일치, 프레임 크기 ≠ 내용물 크기.)

1. **렌더 실측** — preview 서버(`preview_start`)로 페이지를 띄우고 `preview_eval`로 대상 요소의 `getBoundingClientRect()`를 측정한다. 숨김 섹션이면 노드를 body에 복제해 측정. 확인 항목: 요소 실제 width/height, 자식 간 실제 gap, 내부 정렬(아이콘이 우측에 붙는지 등), 여백.
2. **Figma 스크린샷 대조** — Figma `get_design_context`/`get_screenshot`의 이미지와 구현 `preview_screenshot`을 나란히 비교한다. 박스 폭·아이콘 위치·정렬·간격이 시각적으로 일치하는지 확인.
   - ⚠️ **아이콘은 '박스'가 아니라 '실제 글리프 크기'로 비교한다.** Figma 아이콘 컴포넌트는 프레임 안에 inset이 있어 보이는 글리프가 프레임보다 작다(예: 32px 프레임·12.5% inset → 글리프 24px). 인라인 SVG를 프레임 크기로 렌더하면 1.3배 커 보인다. `get_screenshot` 원본에서 글리프가 바/컨테이너 높이 대비 차지하는 비율을 구현과 비교하라.
3. **불일치 시 ❌** — 실측값이 Figma 레이아웃과 다르면 CSS 선언이 표와 같아도 ❌. (표 자체가 컨테이너 치수를 누락했을 수 있으니, Figma 원본 구조도 함께 점검.)

## 도구

```bash
npm run harness:audit          # scripts/harness-audit.js — 사이즈 분기·forced-dark·아이콘 색상 자동 감사
```

- harness-audit 결과(RULE-1 SIZE_SPLIT / RULE-2 DARK_COMPARE / RULE-3 ICON_COLOR)를 대조 근거로 사용.
- `preview_eval` / `preview_inspect` / `preview_screenshot` — 렌더 실측·시각 대조(위 필수 단계).

## 5단계 다크모드 점검

- `[data-theme="dark"]` **CSS 선택자**만 사용했는지 확인(HTML 요소 forced-dark는 RULE-2 위반 ❌).
- navy 5단계 표면 위계가 적용됐는지, **팝업·드롭다운이 다크에서도 라이트를 유지**하는지 확인.
- 대비(텍스트 vs 배경)·위계·색 조합을 점검하고 미흡한 항목을 개선 제안으로 정리한다.

## 산출물

대조 결과를 `reports/figma-to-code/{component}/4-verification.md`(다크모드는 `5-darkmode.md`)에 기록한다.

```
## 4단계 자가대조 결과 — {component}

### 대조 요약
- variant: {구현}/{목록} (목표 일치)
- harness-audit: {PASS/ERROR 내역}

### ❌ (a) 코드 실수 — 수정 대상
- ❌ {variant} {속성}: 표 기준 {기댓값} ≠ 구현 {실제값}

### 🟡 (b) 의도적 개선 (사전 등록됨) — 코드 유지 + Figma 개선 목록
- 🟡 {variant} {속성}: 코드 {값} (Figma DS 2.4 누락/구식) → "Figma 개선 필요 목록" 적재

### ❓ (c) 확인 요청 — 사용자 판단 필요 (임의 (b) 처리 금지)
- ❓ {variant} {속성}: 코드 {값} vs 표 {값} — (a)인지 (b)인지 애매

### 🔒 BLOCKED
- 🔒 {variant} {속성}: 2단계 표에 `MCP 미제공` — 값 확보 필요
- 🔒 토큰 바인딩 스캔: **Figma MCP 끊김/타임아웃** — `whoami` probe + 재시도 ≤2회 후에도 실패. **SKIP-통과 금지**, BLOCKED 기록 + 사용자에게 "재연결 후 바인딩 재검증" 재요청(token-binding-scan §MCP 끊김 처리). 재연결 후 스캔만 재실행해 해소.

### 판정
- ❌(a) {n}건 → 3단계 재작업 필요 (구현자에게 반환)
- ❓(c) {m}건 → 사용자 확인 대기
- ❌(a) 0건 · ❓(c) 0건 → 4단계 통과 (🟡(b) 개선목록은 남겨도 통과)
```
