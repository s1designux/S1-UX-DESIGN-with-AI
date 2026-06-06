---
name: figma-to-code
description: "Figma 컴포넌트를 코드(components.html harness + registry JSON)로 변환·검수하는 5단계 검문소 워크플로우. (1) 'Figma 컴포넌트 구현해줘', 'Figma에서 ~ 만들어줘', '컴포넌트 변환해줘' 요청 시, (2) 컴포넌트 세트(사이즈 × state)를 빠짐없이 옮겨야 할 때, (3) Figma 원본 수치를 추출해 토큰으로 매핑할 때, (4) 구현 결과를 원본과 대조 검수할 때, (5) 다크모드 표면 위계를 설계할 때 사용. 각 단계는 검문소를 통과하기 전 다음 단계로 넘어가지 못한다."
---

# Figma → 코드 5단계 검문소 워크플로우

Figma 원본 컴포넌트를 누락·추측 없이 코드로 옮기기 위한 **단계형 워크플로우**다.
각 단계는 **검문소(STOP)** 를 가지며, 검문소를 통과하기 전에는 다음 단계로 넘어갈 수 없다.

> 이 워크플로우는 기존 `design-system` 스킬·6개 Gate를 **대체하지 않는다.**
> 5단계는 **작업 진행을 막는 사전 검문소**이고, Gate 1~6은 **완료 직전 사후 검문**이다.
> 두 층은 함께 작동한다. (관계 정의: CLAUDE.md "Figma → 코드 5단계 워크플로우" 섹션)

---

## 핵심 구조 — 만드는 자 ≠ 검증하는 자

| 역할 | 담당 에이전트 | 단계 |
|------|-------------|------|
| **추출자** (읽기) | `figma-inspector` | 1 재고조사 · 2 수치추출 |
| **검증자** (매핑) | `token-validator` | 2 매핑 검증 |
| **구현자** (만들기) | `guide-builder` | 3 구현 · 5 다크모드 구현 |
| **검증자** (대조) | `component-verifier` | 4 자가대조 · 5 다크모드 점검 |

> **4단계 대조는 구현자(guide-builder)가 하지 않는다.**
> 반드시 별도 검증 전용 에이전트 `component-verifier`가 수행한다.
> 자기 작업을 자기가 검사해 관대해지는 것을 막기 위함이다.

---

## 산출물 저장 위치

모든 단계 표·결과는 컴포넌트별 폴더에 저장한다.

```
reports/figma-to-code/{component}/
├── 1-inventory.md      # 1단계 재고조사표 (variant 목록 + 아이콘)
├── 2-extraction.md     # 2단계 수치추출표 (Primitive→Semantic→Component 매핑)
├── 4-verification.md   # 4단계 대조 결과 (❌ 목록)
└── 5-darkmode.md       # 5단계 다크모드 설계·점검 (해당 시)
```

`{component}`는 `registry/components/index.json`의 컴포넌트 id를 따른다.

---

## 절대 규칙 (모든 단계 공통)

1. **추측 금지** — 모든 수치(색상·크기·두께·타이포)는 Figma MCP에서 **실제로 읽은 값만** 사용한다. "일반적인 관례"·"더 나은 값"으로 원본을 바꾸지 않는다.
2. **아이콘 원본 강제** — MCP가 주는 SVG/localhost 에셋 주소를 **그대로** 사용한다. 코드로 아이콘을 새로 그리거나 외부 아이콘 패키지를 추가하지 않는다.
3. **막히면 보고** — MCP에서 값·에셋을 못 받으면 임의로 채우지 말고 **어떤 항목인지** 사용자에게 알린다. 표에는 `MCP 미제공`으로 표기한다.
4. **목록 책임** — 1단계에서 확정한 variant 목록은 끝까지 지키고 4단계에서 **반드시 항목별 대조**한다.

---

## 1단계 — 재고조사 (Inventory)

**담당:** `figma-inspector` · **구현 금지, 목록만.**

컴포넌트 세트의 모든 variant(사이즈 × state)와 사용 아이콘을 표로 나열한다.

```
| # | 사이즈 | state | Figma nodeId | 아이콘 | 비고 |
|---|--------|-------|--------------|--------|------|
| 1 | pc-md  | unselected | 540:6039 | — | |
| 2 | pc-md  | selected   | 540:6051 | — | |
...
```

- Figma MCP `get_metadata` / `get_design_context`로 컴포넌트 세트 구조를 읽는다.
- 사용된 아이콘은 노드명·에셋 출처를 함께 기록한다.
- 결과를 `reports/figma-to-code/{component}/1-inventory.md`에 저장한다.

### 🚦 검문소 1 — 사용자 확인 (STOP)

> **총 variant 개수를 명시하고 여기서 멈춰 사용자 확인을 받는다.**
> 사용자가 목록을 승인하기 전에는 2단계로 넘어가지 않는다.

---

## 2단계 — 수치 추출 (Extraction)

**담당:** `figma-inspector`(추출) + `token-validator`(매핑 검증)

1단계 목록의 **각 variant**에 대해 색상값·크기·두께·타이포를 MCP에서 읽어 표로 만들고,
`Foundation(Primitive) → Semantic → Component` 3단계로 매핑한다.

```
| variant | 속성 | Figma 원본값 | Foundation | Semantic | Component |
|---------|------|------------|-----------|----------|-----------|
| pc-md/selected | label color | #1D6CEB | --color-blue-400 | --color-navigation-label-selected | --tab-label-selected |
| pc-md/selected | indicator h | 4px | — | — | (sizing) |
...
```

- 색상은 반드시 Semantic 경유 매핑(`token-validator` Gate 1 규칙).
- 못 읽은 값은 **`MCP 미제공`** 으로 표기한다. **추정값 절대 금지.**
- 기존 토큰 재사용 여부를 `registry/components/*.json`·`tokens/*.md`에서 먼저 확인한다. 없는 토큰만 신규 후보로 표기.
- 결과를 `reports/figma-to-code/{component}/2-extraction.md`에 저장한다.

### 🚦 검문소 2 — 빈칸 차단 (STOP)

> **표에 빈 칸(`MCP 미제공`)이 하나라도 있으면 3단계로 넘어가지 않는다.**
> 막힌 항목을 사용자에게 보고하고(규칙 3), 값이 확보될 때까지 대기한다.

---

## 3단계 — 구현 (Build)

**담당:** `guide-builder`

1단계 목록의 variant를 **하나도 빠짐없이** 구현한다.

- 원본 구조를 그대로 따른다. **새로 디자인하지 않는다.**
- **2단계 표의 값만** 사용한다. 표에 없는 값을 코드에 쓰지 않는다.
- 아이콘은 1단계에서 확인한 원본 에셋을 그대로 사용한다(규칙 2).
- 구현 대상: `pages/components.html` harness + `registry/components/{component}.json`.
- 연동 파일(`assets/css/tokens.css` 등)은 CLAUDE.md "파일 연동 규칙"에 따라 함께 동기화한다.

> **구현자는 4단계 대조를 직접 하지 않는다.** 구현 완료 후 검증자(component-verifier)에게 넘긴다.

---

## 4단계 — 자가 대조 (Verify)

**담당:** `component-verifier` (검증 전용, 구현자와 분리)

만든 결과를 1·2단계 표와 **항목별로 대조**한다.

대조 항목:
- variant 개수 (1단계 목록 전수)
- 색상값 (2단계 매핑 일치 여부)
- 크기·두께 (2단계 수치 일치 여부)
- 아이콘 출처 (원본 에셋 사용 여부, 규칙 2)
- 토큰 참조 (Semantic 경유 여부)
- **시각·레이아웃 (필수)** — CSS 값 대조만으로 불충분. preview 서버로 렌더를 띄워 `preview_eval` bounding box 실측 + Figma 스크린샷과 시각 대조. 박스 폭·아이콘 위치·정렬·간격이 Figma와 일치하는지 확인. (값이 맞아도 레이아웃이 다를 수 있음 — 예: 아이콘 컨테이너 치수 누락.)

- 도구로 `npm run harness:audit` (`scripts/harness-audit.js`) + `preview_eval`/`preview_screenshot`를 활용한다.
- **분류 구분:** variant 구성·아이콘 원본·토큰 참조 구조 = **정확 대조**(원본을 베껴야 하는 것 — 항상 ❌, 두갈래 제외) / 색상값·크기·두께·타이포 = **두갈래 분류**(레거시가 틀렸을 수 있는 값). 새 속성은 "레거시가 틀렸을 수 있나 / 원본을 베껴야 하나"로 갈래 판단.
- **두갈래 분류 대상의 불일치는 자동으로 코드 오류로 보지 않고 3분류로 반환한다** (CLAUDE.md 공통 규칙):
  - ❌ (a) **코드 실수** → 수정 대상
  - 🟡 (b) **사전 등록된 개선**(Figma DS 2.4 누락/구식을 코드가 개선) → 코드 유지 + "Figma 개선 필요 목록" 적재
  - ❓ (c) **애매** → (b)로 빼지 말고 **확인 요청**으로 사용자에게 올림 (버그 면죄부 방지)
- 결과를 `reports/figma-to-code/{component}/4-verification.md`에 저장한다.

### 🚦 검문소 4 — ❌(a) 0 · ❓(c) 0 (반복 STOP)

> **❌(a)가 0이 될 때까지 3단계(구현)로 되돌려 반복한다.**
> **❓(c)가 있으면 사용자 확인을 받기 전까지** 완료 보고·5단계로 넘어가지 않는다.
> 🟡(b)는 개선 목록만 남기면 통과 가능.

---

## 5단계 — 다크모드 (해당 시)

**담당:** `guide-builder`(구현) + `component-verifier`(점검)

- navy 5단계 표면 위계를 적용한다(Foundation `gray-dark` 스케일).
- **팝업·드롭다운은 다크에서도 라이트를 유지**한다.
- 변수명은 유지하고 값만 바꾼다(`[data-theme="dark"]` CSS 선택자만 사용. HTML 요소 forced-dark 금지 — harness-audit RULE-2).
- 결과를 `reports/figma-to-code/{component}/5-darkmode.md`에 저장한다.

### 🚦 검문소 5 — 개선안 먼저 (STOP)

> **1차안 작성 후, 대비·위계·색 조합을 스스로 점검하고 개선안을 먼저 제안한다.**
> 사용자 확인 없이 1차안을 확정하지 않는다.

---

## 실행 방법

```
/figma-to-code {Figma URL 또는 nodeId} {컴포넌트명}
```

또는 자연어로 "Figma {URL}의 {컴포넌트} 구현해줘"라고 요청하면 이 스킬이 발동한다.

워크플로우는 **항상 1단계부터** 시작하며, 각 검문소에서 멈춰 사용자 확인을 받는다.
이미 1·2단계 표가 있는 경우(`reports/figma-to-code/{component}/`)에는 해당 단계부터 재개할 수 있다.

## 완료 보고

5단계(또는 다크모드 비대상 시 4단계) 완료 후 CLAUDE.md의 **Orchestrator Summary** 형식으로 보고한다.
6개 Gate 결과를 함께 포함한다.
