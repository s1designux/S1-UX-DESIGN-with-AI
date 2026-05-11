# MVP3.1 Core Component Harness Review

> 완료일: 2026-05-11
> Phase: MVP3.1 — Core Component Harness Registry 연결

## Status

Complete (MVP3.1 — registry entry point 구성, Button harness 구현)

## Scope

Core Component Harness shell의 registry 기반 관리 구조 구축.
Theme / Platform / Component Tabs를 registry에서 읽을 수 있도록 entry point 설계.

---

## Current Harness Location

- 파일: `pages/components.html`
- Preview Theme: Light / Dark (setTheme 함수 — 인라인 JS)
- Platform: All / PC / Mobile (setPlatform 함수 — 인라인 JS)
- Components: Button · Checkbox · Radio · Toggle · Chip · FilterChip · Input · Select
- 현재 상태: 하드코딩 UI, inline CSS/JS

---

## Updated Registry

| 파일 | 변경 내용 |
|------|----------|
| `registry/components/index.json` | **신규 생성** — harness entry point. supportedThemes/Platforms + 7개 컴포넌트 목록 |
| `registry/components/button.json` | **업데이트** — summary, platformSupport, themeSupport, sizing, tokens map, pendingVariants 추가 |
| `registry/components/select.json` | **신규 생성** — skeleton 등록 (하네스에 Select tab 존재) |
| `registry/index.json` | **업데이트** — componentIndex path 추가, version 0.3.0, phase mvp3 |

---

## Added Files

| 파일 | 역할 |
|------|------|
| `assets/js/core-component-harness.js` | registry/components/index.json 로드, Theme/Platform/Tab 렌더링, skeleton 상태 처리 |
| `assets/js/button-harness.js` | Button 전용 registry/token 로드, status/token 렌더링, theme/platform toggle |
| `pages/button-harness.html` | Button 전용 Harness 페이지 (8개 섹션) |
| `assets/css/components/button.css` | sw-button 네이밍 Button CSS (V2.4 component token 기반) |

---

## Findings

- `registry/components/index.json`이 harness의 entry point 역할을 하도록 구성됨.
- Button metadata(summary, platformSupport, sizing, tokens map)가 현재 UI를 반영함: Core · 3 variants · PC 3 sizes · Mobile 1 size.
- Theme/Platform 컨트롤 함수가 `data-theme` / `data-platform` / CSS 클래스 방식으로 표준화됨.
- non-Button 컴포넌트는 skeleton으로 registry 등록됨.
- `core-component-harness.js`의 `initCoreComponentHarness()`를 통해 registry 기반 tab 렌더링 가능.

---

## Hardcoded Areas (변경 없음, 유지)

- `pages/components.html` — Theme toggle, Platform toggle, Component tabs, Button/Checkbox/Radio/Toggle/Chip/Input/Select 하드코딩 유지
- 이유: 기존 UI를 대규모로 리디자인하지 않는 원칙 준수

---

## Warnings

- `pages/components.html`의 Component tabs는 아직 하드코딩 상태. registry 기반 전환은 추후 단계.
- Select token policy 미결정: Dropdown Trigger tokens vs Input tokens 공유 여부.
- Chip/FilterChip registry 통합 vs 분리 여부 미결정 (chip.json의 notes에 기록됨).
- Figma componentSetKey 전 컴포넌트 미완료.

---

## Component Status 요약

| Component | tokenStatus | codeStatus | darkMode | harnessStatus |
|-----------|------------|------------|----------|---------------|
| Button | stable | in-progress | candidate | implemented |
| Checkbox | stable | not-started | pending | skeleton |
| Radio | stable | not-started | pending | skeleton |
| Toggle | stable | not-started | pending | skeleton |
| Chip | stable | not-started | pending | skeleton |
| Input | stable | not-started | pending | skeleton |
| Select | pending | not-started | pending | skeleton |

---

## Next Review

1. Button visual/state matrix Figma 비교 검수.
2. `pages/components.html` Component tabs를 registry 기반으로 점진 전환.
3. Checkbox 또는 Input implementation 시작.
4. Source Guard 연동: registry-driven component tab 검수.
5. Figma componentSetKey 채우기 (MCP/Plugin 연동).
