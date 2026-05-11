# SW Design System Guide

**SW UX GUIDE V2.4** 기반 디자인시스템 가이드 사이트입니다.  
디자이너와 개발자가 함께 사용하는 Foundation Token, Component, Pattern 문서를 제공합니다.

---

## 사이트 구조

```
/
├── index.html                  # Overview (홈)
├── pages/
│   ├── foundation.html         # Foundation Tokens (색상 팔레트, 타이포그래피)
│   ├── semantic.html           # Semantic Tokens (Coming Soon)
│   ├── components.html         # Components (Coming Soon)
│   ├── patterns.html           # Patterns (Coming Soon)
│   ├── policy.html             # Policy (토큰 사용 원칙, 다크모드 정책)
│   ├── legacy.html             # Legacy Guide (Coming Soon)
│   └── ai-snippets.html        # AI Snippets (Claude/ChatGPT/Figma MCP 프롬프트)
├── assets/
│   ├── css/style.css           # 공용 스타일시트
│   └── js/main.js              # 공용 JavaScript (사이드바, 탭, 복사 기능)
├── data/
│   ├── foundation-tokens.json  # Foundation 토큰 정규 데이터
│   ├── ai-snippets.json        # AI 스니펫 10종 데이터
│   └── site-map.json           # 사이트 네비게이션 구조
└── tokens/
    ├── design-tokens.md        # 토큰 전체 문서 (MD)
    ├── token-map.json          # CSS 변수 매핑
    └── raw-figma-tokens.json   # Figma 원본 토큰
```

---

## 실행 방법

별도 서버 불필요. 브라우저에서 `index.html`을 직접 열면 됩니다.

```bash
# macOS
open index.html

# 또는 VS Code Live Server 확장 사용
```

> **주의:** `ai-snippets.html`은 `fetch()`로 JSON을 로드하므로 `file://` 프로토콜에서 열면 CORS 오류가 발생할 수 있습니다. 이 경우 VS Code Live Server 또는 `python3 -m http.server`를 사용하세요. 오류 시 자동으로 인라인 데이터를 사용하는 fallback이 동작합니다.

---

## 현재 완료 현황

| 페이지 | 상태 | 내용 |
|--------|------|------|
| Overview | ✅ 완료 | 전체 소개, 통계, 로드맵 |
| Foundation Tokens | ✅ 완료 | 색상 107개, Semantic 27개, 타이포 |
| AI Snippets | ✅ 완료 | 10종 프롬프트 |
| Policy | 🔄 작성 중 | 6개 정책 섹션 |
| Semantic Tokens | 📅 예정 | — |
| Components | 📅 예정 | — |
| Patterns | 📅 예정 | — |
| Legacy Guide | 📅 예정 | — |

---

## MVP3.3 Portal IA 변경 이력 (2026-05-11)

### 네비게이션 재편

운영/시스템 메뉴를 사용자 대면 메뉴와 분리하는 구조로 개편했습니다.

| 변경 전 | 변경 후 | 비고 |
|---------|---------|------|
| Registry 그룹 | System 그룹 | 그룹 리네임 |
| Registry Health | System Status | 항목 리네임 |
| Button Harness (Registry 하위) | Button (Design System 하위) | 이동 + 리네임 |

### Button 페이지 탭 구조

`pages/button-harness.html`에 6개 탭이 추가됐습니다:
- **Preview** — Variant Matrix + Special States
- **Usage** — Variant 선택 기준 + Do/Don't
- **Code** — HTML/CSS 코드
- **Figma** — Figma 매핑
- **Review** — 검토 노트 + Registry Status
- **Token Details** — 토큰 목록 + Accessibility

---

## MVP3.3 Button Components Integration (2026-05-11)

MVP3.3 consolidates Button guidance under Components > Button.

Key decisions:
- Components > Button (`pages/components.html`) is the single user-facing entry point for Button.
- Existing Components and component guide content are prioritized for user-facing standards.
- Registry data is aligned to the existing component standard, not the other way around.
- Button Harness is no longer exposed as a separate main menu item.
- Component Registry and Component Tokens remain in the System group only.
- The Button matrix includes an ACTION column before DEFAULT.
- ACTION is used for real interaction testing (disabled toggle, loading toggle, click counter).
- DEFAULT is a static preview state only (`.is-preview` class).

Registry data is still used internally to render and validate the Button guide after alignment.

---

## 토큰 업데이트 방법

### 1. Figma에서 토큰 변경 시

1. `data/foundation-tokens.json` 업데이트
2. `src/styles/theme.css` CSS 변수 추가/수정
3. `tokens/token-map.json` 매핑 업데이트
4. `tokens/design-tokens.md` 문서 업데이트
5. (필요 시) `tailwind.config.js` 추가

### 2. 네이밍 규칙

- Figma 변수명 → CSS 변수명: `/` → `-`, 공백 → `-`, `&` 제거, 대문자 → 소문자
- 예: `color/action/Primary` → `--color-action-primary`

### 3. AI 스니펫 추가 시

`data/ai-snippets.json`에 항목 추가 후 `pages/ai-snippets.html`의 `SNIPPETS_INLINE` 배열도 동기화하세요.

---

## 파일 참조 관계

```
Figma Variables
    ↓
tokens/raw-figma-tokens.json    ← Figma MCP 추출 원본
    ↓
data/foundation-tokens.json     ← 정규화된 토큰 데이터 (pages의 인라인 JS 참조)
    ↓
src/styles/theme.css            ← CSS Custom Properties 선언
    ↓
tokens/token-map.json           ← CSS 변수 → 역할 매핑
src/styles/theme.js             ← JS 토큰 객체
tailwind.config.js              ← Tailwind CSS 클래스 연결
```

---

## 기술 스택

- **HTML/CSS/JS** — 프레임워크 없는 정적 사이트
- **CSS Custom Properties** — 토큰 구현체
- **Tailwind CSS v3** — 프로덕션 코드 유틸리티 (가이드 사이트 자체는 미사용)
- **Figma Variables** — 디자인 토큰 원천

---

## Figma 연결

- 파일: SW-UX-GUIDE V2.4
- 주요 노드: `540:7663` (Foundation Token 정의)
- Figma URL: `https://www.figma.com/design/yE5UCFEbmXJBlYJWB24Lz2/`

---

## Registry 기반 운영 (MVP0 ~)

> 추가일: 2026-05-11 / Phase: MVP0

### 구조 역할 분리

| 폴더 | 역할 | 소비자 |
|------|------|--------|
| `registry/` | **기준 데이터** — 토큰·컴포넌트·Figma 매핑 JSON | Claude, HTML Portal, Figma Plugin (예정) |
| `tokens/*.md` | 인간 가독 문서 (유지) | 디자이너·개발자 참조용 |
| `data/` | HTML Portal 렌더링 전용 데이터 | pages/*.html |
| `reports/` | 검수·리뷰 결과물 | 팀 리뷰 |
| `pages/` | HTML 포털 뷰 | 브라우저 |

### Registry 진입점

```
registry/index.json          ← 전체 구조 인덱스
registry/tokens/
  foundation.colors.json     ← Primitive 팔레트 (원천값)
  semantic.colors.json       ← Semantic Token Light/Dark
  component.tokens.json      ← Component Token (Semantic 참조)
registry/components/
  button.json                ← Button Core Component 사양
registry/figma/figma-map.json
registry/governance/         ← versions / audit-rules / deprecated / migration
registry/ai/                 ← AI 스니펫·리뷰 프롬프트
```

### 토큰 3레이어 원칙

```
Foundation (원천값)
  ↓ Semantic이 참조
Semantic (역할 기반, Light/Dark 전환 지점)
  ↓ Component가 참조
Component (컴포넌트 전용)
```

Component Token 색상은 Foundation을 직접 참조하지 않는다.

---

## MVP2 Registry-based Portal Rendering

> 추가일: 2026-05-11 / Phase: MVP2

MVP2는 HTML 포털을 하드코딩된 문서 중심 구조에서 registry를 읽어 렌더링하는 Design System Portal로 점진 전환한다.

### 추가된 Portal Registry 레이어

```
assets/js/
  registry-loader.js    ← registry JSON 공통 fetch 유틸리티
  token-renderer.js     ← Foundation / Semantic / Component Token 렌더링
  component-renderer.js ← registry/components/*.json 상태 렌더링
  registry-health.js    ← Registry 전체 상태 요약 렌더링
```

### Registry 기반 신규 페이지 (5종)

| 페이지 | 소스 |
|--------|------|
| `pages/registry-health.html` | registry 전체 상태 요약 |
| `pages/foundation-tokens.html` | `registry/tokens/foundation.colors.json` |
| `pages/semantic-tokens.html` | `registry/tokens/semantic.colors.json` |
| `pages/component-tokens.html` | `registry/tokens/component.tokens.json` |
| `pages/component-registry.html` | `registry/components/*.json` |

기존 하드코딩 포털 콘텐츠(foundation.html, semantic.html, components.html)는 마이그레이션 완료 시까지 legacy/fallback으로 유지한다.

> **실행 주의:** Registry 페이지는 `fetch()`로 JSON을 로드하므로 반드시 로컬 서버에서 열어야 합니다.  
> `python3 -m http.server` 또는 VS Code Live Server 사용.

---

## MVP3 / MVP3.1 Core Component Harness

> 추가일: 2026-05-11 / Phase: MVP3

MVP3는 첫 번째 registry 기반 Core Component 구현(Button)을 도입한다.
MVP3.1은 Core Component Harness shell을 registry와 연결한다.

### Harness 컨트롤 구조

- Preview Theme: Light / Dark
- Platform: All / PC / Mobile
- Core component tabs: Button · Checkbox · Radio · Toggle · Chip · FilterChip · Input · Select

### Button 구현

Button은 이번 단계의 첫 번째 상세 구현 대상이다.

```
assets/css/components/button.css  ← sw-button 네이밍, V2.4 component token 기반
pages/button-harness.html         ← Variant × Size × State 미리보기
assets/js/button-harness.js       ← registry 기반 status / token 렌더링
assets/js/core-component-harness.js ← 공통 harness 컨트롤러
registry/components/index.json    ← harness entry point
```

나머지 컴포넌트(Checkbox, Radio, Toggle, Chip, Input, Select)는 skeleton 상태로 등록되어 있다.

### Dark Semantic Border Policy

Dark mode semantic border token은 명시적 resolved 값을 사용해야 한다.
다음 Figma opacity composition은 stable token으로 사용하지 않는다.

| Token | Figma opacity |
|-------|--------------|
| `--color-border-subtle` dark | `#FFFFFF 4%` |
| `--color-border-default` dark | `#FFFFFF 7%` |
| `--color-border-strong` dark | `#FFFFFF 12%` |
| `--color-border-emphasis` dark | `#FFFFFF 20%` |

위 토큰은 현재 `candidate` 상태. 실제 resolved HEX 값이 확정되면 stable로 전환한다.
권장 stable 정의: foundation dark scale 토큰 참조 또는 resolved HEX 값 사용.
Product UI 컴포넌트에서는 raw `rgba()` border 값을 직접 사용하지 않는다.
