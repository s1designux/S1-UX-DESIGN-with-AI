# 에스원(S1) 디자인 문법 — 다른 AI에게 주는 한 장

> 이 글을 그대로 붙여넣으세요. 값은 이 글에 없습니다. **아래 저장소에서 직접 읽어야 합니다.**

---

## 0. 당신이 해야 할 일

에스원(S1) 디자인시스템 기준으로 화면·컴포넌트를 만듭니다.
**값을 기억에서 꺼내 쓰지 말고, 아래 파일을 실제로 읽고 그 값만 씁니다.**

---

## 1. 값은 여기 있습니다 (먼저 읽으세요)

공개 저장소 — `https://github.com/s1designux/S-1-UX-DESIGN-AI-GUIDELINE`

파일을 직접 읽는 도구(Claude Code·Cursor·Copilot 등)라면:

```bash
git clone https://github.com/s1designux/S-1-UX-DESIGN-AI-GUIDELINE.git
```

파일을 못 읽는 대화형 AI라면 아래 주소를 그대로 가져가 읽습니다
(`https://raw.githubusercontent.com/s1designux/S-1-UX-DESIGN-AI-GUIDELINE/main/` + 경로).

| 무엇이 필요할 때 | 읽을 파일 |
|---|---|
| **전체 개요 한 벌** (색 역할·타이포·컴포넌트 설명·Do/Don't) | `design/DESIGN.core.md` |
| **색·간격·반경·글자 크기 실제 값** (라이트/다크 전부) | `assets/css/tokens.css` |
| **버튼·인풋 등 상태별 색 별칭** | `assets/css/component-tokens.css` |
| **글자 유틸 클래스** (`.typo-*`) | `assets/css/typography.css` |
| **바로 쓰는 컴포넌트 CSS/JS** | `ui-library/dist/components/<이름>.css` · `.js` |
| **붙여넣을 마크업 예시** | `ui-library/dist/examples/<이름>.html` |
| **컴포넌트 치수·구조 사실** | `registry/components/component-facts.json` |
| **PC 동작 계약** (클릭·포커스·키보드) | `registry/components/component-behavior.pc.json` |
| **아이콘** | `ui-library/dist/assets/icons/` |

컴포넌트 목록(현재 배포본): assist-button · bottom-sheet · bottom-sheet-option · button · checkbox · chip · date-picker · dropdown · filter-chip · gnb · gnb-sub-menu · gnb-sub-menu-item · input · mobile-bottom-nav · mobile-header · modal · modal-content · multi-toggle · pagination · radio · select · tab · table · text-button · textarea · time-picker · toggle

---

## 2. 문법 — 지켜야 할 규칙

### 색
- **색은 값이 아니라 역할로 씁니다.** 팔레트 HEX(`#0072CE` 등)를 화면에 직접 쓰지 않습니다.
- 반드시 역할 토큰(Semantic)을 거칩니다 — `color-bg`(배경) · `color-surface`(그 위에 올라오는 카드·모달) · `color-text`(제목/본문/상태 3트랙) · `color-form-control`(입력 부품) · `color-control-border`(체크박스·라디오·토글 테두리) · `color-icon` · `color-overlay`.
- 예외는 딱 하나 — 딤/오버레이(`color-overlay`)만 rgba 를 허용합니다.
- 파란색은 **지금 눌러야 할 것·선택된 것·포커스**에만 씁니다. 빨강은 경고·오류에만. 화면 대부분은 중립 회색입니다.
- 브랜드색(CI·로고 색)은 UI 요소 색으로 쓰지 않습니다.
- **다크는 스텝 방향이 반대입니다.** 라이트는 숫자가 낮을수록 밝지만, 다크는 낮은 숫자(0·50·100)가 가장 어둡고 높은 숫자(700·800·900)가 가장 밝습니다. 라이트 감각으로 고르면 어두운 배경에 어두운 글자가 올라갑니다.
- 명도 대비는 WCAG AA 가 최소 기준입니다.

### 글자
- 폰트는 **Pretendard** 하나입니다.
- 크기는 10 · 12 · 14 · 16 · 18 · 20 · 24 · 32 만 씁니다. 본문 기본 14, 보조·캡션 12, 제목 16 이상.
- 굵기는 Regular 400 · Medium 500 · Bold 700 만. 행간 기본 130%.
- **강조는 굵기로, 색은 역할 토큰으로** 줍니다.
- 이름은 줄이지 않습니다 — `font-weight-medium` ○, `fw-md` ✕.

### 간격 (묶음 문법)
- **한 묶음 안**(라벨과 입력칸처럼 한 덩어리로 읽혀야 하는 것들) — `8`
- **묶음과 묶음 사이**(다른 덩어리임이 보여야 하는 간격) — `24`
- **한 줄 안에서 부품끼리 나란히** — `12`
- 간격은 항상 간격 토큰(`spacing-*`)에서 고릅니다. 임의 px 금지.

### 라벨
- 라벨은 입력 부품 **안에 들어 있지 않습니다.** 부품 **위에 별도 글자로** 올려 조합합니다.
- 라벨 글자: 14 Medium, 본문색. 부품과의 거리는 위 "한 묶음 안"(8)을 따릅니다.

### 컴포넌트
- **새로 만들지 않습니다.** `ui-library/dist` 배포본을 그대로 씁니다 — `examples/` 의 마크업을 복사해 쓰고, 해당 컴포넌트의 CSS/JS를 불러옵니다.
- 마크업은 `data-s1-component` 속성 방식입니다. `.s1-btn` 같은 클래스 방식은 옛 것이라 쓰지 않습니다.
- 배포본에 없는 것만 `design/DESIGN.core.md` 를 읽고 만듭니다.
- 이미 정의된 변형(variant)·크기를 먼저 찾아 재사용합니다. 임의 크기·임의 상태를 만들지 않습니다.

### 동작
- PC 동작은 `component-behavior.pc.json` 에서 **`status: verified` 인 규칙만** 구현합니다.
- `not-defined` 인 상태·키보드·포커스·접근성 동작은 **추측해서 만들지 않습니다.**
- 현재 검증 범위는 PC 입니다. 모바일 규칙으로 늘려 해석하지 않습니다.

---

## 3. 하지 말 것

- HEX·rgb 직접 사용 (예외: 오버레이)
- 토큰에 없는 크기·간격·반경·글자 크기 새로 만들기
- `--button-*`·`--chip-*` 같은 옛 별칭 토큰 쓰기 → 배포본이 쓰는 이름(`--color-button-bg-primary--default` 등)이 기준
- 다크모드를 생각하지 않고 색 정하기
- 값이 없을 때 "보통 이렇게 한다"로 채우기

---

## 4. 막히면

값이나 규칙을 못 찾으면 **임의로 채우지 말고**, 어떤 항목이 비어 있는지 그대로 말하고 물어보세요.

---

*저장소는 원본에서 매일 한국시간 03:15 자동 동기화됩니다.*
