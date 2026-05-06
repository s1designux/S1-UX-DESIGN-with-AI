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
