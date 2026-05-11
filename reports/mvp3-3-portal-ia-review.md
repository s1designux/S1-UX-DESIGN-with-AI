# MVP3.3 Portal IA Review

**날짜:** 2026-05-11  
**작업:** Portal Information Architecture 재편 — 사용자 대면 메뉴 / System 운영 메뉴 분리

---

## MVP3.3 Portal IA Inspection

### 변경 전 SITE_NAV 구조

| 그룹 | 항목 | 비고 |
|------|------|------|
| 개요 | Overview, 토큰 설치 프롬프트 | |
| Foundation | Foundation Tokens, Semantic Tokens | |
| Design System | Components, Icons, Patterns, Policy, Legacy Guide | |
| Registry | Registry Health, Foundation (Registry), Semantic (Registry), Component Tokens (Registry), Component Registry, Button Harness | 운영/시스템 성격 혼재 |
| AI 워크플로우 | AI Snippets, Guide MD, MD 리뷰 | |

**문제점:**
- Registry 그룹에 사용자 대면(Button Harness)과 운영(Registry Health, Token registries)이 혼재
- "Button Harness"가 Registry 하위로 분류되어 Design System 탐색 흐름에서 이탈
- "Registry Health" 명칭이 운영 의미를 불분명하게 전달

---

### 변경 후 SITE_NAV 구조

| 그룹 | 항목 | 변경 내용 |
|------|------|-----------|
| 개요 | Overview, 토큰 설치 프롬프트 | 유지 |
| Foundation | Foundation Tokens, Semantic Tokens | 유지 |
| Design System | Components, **Button**, Icons, Patterns, Policy, Legacy Guide | Button 추가 (from Registry) |
| AI 워크플로우 | AI Snippets, Guide MD, MD 리뷰 | 유지 |
| **System** *(신규)* | **System Status**, Foundation Registry, Semantic Registry, Component Tokens, Component Registry | "Registry" → "System" 그룹 리네임, "Registry Health" → "System Status" |

---

## 적용된 변경 사항

### 1. `assets/js/main.js` — SITE_NAV 재편
- `Registry` 그룹 → `System` 그룹으로 리네임
- `Registry Health` 항목 → `System Status` 텍스트 변경
- `Button Harness` → Design System 그룹 이동, 텍스트 `Button` 으로 변경
- Registry 항목 레이블 단순화: `Foundation (Registry)` → `Foundation Registry` 등

### 2. `pages/registry-health.html` — 페이지 제목 변경
- `<title>`: `Registry Health — SW Design System` → `System Status — SW Design System`
- `<h1>`: `Registry Health` → `System Status`

### 3. `pages/button-harness.html` — 탭 구조 추가
6개 탭으로 재구성:
- **Preview**: Variant Matrix (Primary/Secondary/Blue-line) + Special States + Theme/Platform controls
- **Usage**: Variant 선택 기준 카드 + Do/Don't 가이드 (신규 콘텐츠)
- **Code**: HTML/CSS 코드 뷰 (기존)
- **Figma**: Figma Mapping (기존)
- **Review**: Review Notes + Registry Status 패널 (기존)
- **Token Details**: Token Usage + Accessibility Notes (기존)

---

## 검증 체크리스트

| # | 항목 | 결과 |
|---|------|------|
| 1 | SITE_NAV System 그룹 존재 | ✅ |
| 2 | Registry Health → System Status 리네임 | ✅ |
| 3 | Button이 Design System 그룹에 위치 | ✅ |
| 4 | 기존 registry 항목 레이블 단순화 | ✅ |
| 5 | button-harness.html 탭 6개 구성 | ✅ |
| 6 | Usage 탭 — Variant 카드 4개 (Primary/Secondary/Blue-line/Ghost) | ✅ |
| 7 | Usage 탭 — Do/Don't 섹션 | ✅ |
| 8 | registry-health.html title + h1 변경 | ✅ |
| 9 | 기존 Preview 기능 유지 (Theme/Platform 전환) | ✅ |
| 10 | 기존 Code/Figma/Token Details 콘텐츠 탭 내 유지 | ✅ |

---

## 미결 사항

| 항목 | 상태 | 비고 |
|------|------|------|
| Ghost variant CSS 미정의 | pending | button.css에 .sw-button--ghost 미구현 |
| Audit Rules 뷰어 페이지 | 미착수 | registry/governance/audit-rules.json 표시용 |
| Token Exceptions 뷰어 페이지 | 미착수 | registry/governance/token-exceptions.json 표시용 |
| index.html Overview 카드 갱신 | 미착수 | SITE_NAV 변경에 따른 섹션 카드 동기화 |

---

## 파일 변경 요약

| 파일 | 변경 유형 |
|------|-----------|
| `assets/js/main.js` | SITE_NAV 재구성 (System 그룹, Button 이동, 리네임) |
| `pages/registry-health.html` | title + h1 "System Status" 변경 |
| `pages/button-harness.html` | 6탭 구조 + Usage 탭 신규 콘텐츠 추가 |
| `reports/mvp3-3-portal-ia-review.md` | 본 문서 (신규) |
