# MVP2 Portal Registry Review

> 완료일: 2026-05-11
> Phase: MVP2 — Registry 기반 Portal 렌더링 전환

## Status

Complete

## Scope

기존 하드코딩 HTML 포털에 registry 기반 렌더링 레이어를 추가한다.  
기존 파일은 삭제하지 않고, registry 기반 신규 페이지와 공존시킨다.

---

## Added

### JS 모듈 (4종)

| 파일 | 크기 | 역할 |
|------|------|------|
| `assets/js/registry-loader.js` | 2.6KB | `loadJson`, `loadRegistryIndex`, `loadRegistryResource`, `loadAllComponents`, `renderError` |
| `assets/js/token-renderer.js` | 6.3KB | `renderFoundationColors`, `renderSemanticColors`, `renderComponentTokens`, `createColorChip` |
| `assets/js/component-renderer.js` | 4.5KB | `renderComponentList`, `renderComponentDetail`, `renderComponentStatusBadge` |
| `assets/js/registry-health.js` | 8.7KB | `renderRegistryHealth` — 전체 Registry 상태 집계·렌더링 |

### HTML 페이지 (5종)

| 파일 | 소스 데이터 | 역할 |
|------|------------|------|
| `pages/registry-health.html` | 전체 registry | 토큰수·컴포넌트수·Governance 상태·Pending 요약 |
| `pages/foundation-tokens.html` | `foundation.colors.json` | Foundation 색상 팔레트 그리드 |
| `pages/semantic-tokens.html` | `semantic.colors.json` | Semantic 토큰 Light/Dark 비교 테이블 |
| `pages/component-tokens.html` | `component.tokens.json` | Component 토큰 variant별 목록 |
| `pages/component-registry.html` | `registry/components/*.json` | 컴포넌트 tokenStatus/codeStatus/darkModeStatus 현황 카드 |

### 네비게이션 업데이트

- `assets/js/main.js` SITE_NAV — Registry 그룹 5개 항목 추가
- `data/site-map.json` — Registry 그룹 메타데이터 추가
- `README.md` — MVP2 섹션 추가
- `CLAUDE.md` — MVP2 Portal Registry Rendering 규칙 섹션 추가

---

## Findings

- Portal이 registry JSON을 source of truth로 읽을 수 있는 레이어가 구성됨.
- Foundation/Semantic/Component 토큰을 registry에서 렌더링할 수 있음.
- Component 상태(tokenStatus/codeStatus/darkModeStatus)를 registry/components에서 렌더링할 수 있음.
- Registry Health 페이지가 Migration 진행 상태를 정량적으로 요약함.
- `REGISTRY_BASE` 자동 감지(`/pages/` 경로 여부)로 pages/와 root 양쪽에서 동일 loader 사용 가능.
- color-chip 렌더링: HEX/rgba/var() 모두 CSS 직접 할당으로 처리. tokens.css 로드 전제로 var() 참조도 시각화됨.

---

## Warnings

- **로컬 서버 필수** — `fetch()`를 사용하므로 `file://` 프로토콜에서 CORS 오류 발생. `python3 -m http.server` 또는 VS Code Live Server 필요.
- **Legacy 하드코딩 유지** — `foundation.html`, `semantic.html`, `components.html` 기존 하드코딩 콘텐츠가 아직 남아있음. 신규 registry 페이지와 병존.
- **Figma componentSetKey 미완료** — 전 컴포넌트(10종) componentSetKey가 빈 문자열 상태.
- **색상 chip var() 미해석** — registry-health.js 내 color chip은 없음. token-renderer 사용 페이지에서는 tokens.css 로드 전제로 var() 칩이 CSS로 자동 해석됨.
- **foundation.colors.json의 statusDarkAlias / alias 타입 항목** — value가 `var()` 형태인 항목은 chip 색상이 토큰값으로 표시됨 (정상 동작).

---

## 파일 구조 (변경 후)

```
assets/js/
  registry-loader.js     ← NEW: registry fetch 유틸
  token-renderer.js      ← NEW: token 렌더링
  component-renderer.js  ← NEW: component 상태 렌더링
  registry-health.js     ← NEW: health 집계 렌더링
  main.js                ← 수정: SITE_NAV Registry 그룹 추가

pages/
  registry-health.html      ← NEW
  foundation-tokens.html    ← NEW (registry 기반)
  semantic-tokens.html      ← NEW (registry 기반)
  component-tokens.html     ← NEW (registry 기반)
  component-registry.html   ← NEW (registry 기반)
  foundation.html           ← 기존 유지 (legacy)
  semantic.html             ← 기존 유지 (legacy)
  components.html           ← 기존 유지 (legacy)
  [... 기타 기존 페이지 유지]
```

---

## Next Review

1. **Button 구현 검증** — registry/components/button.json 기준으로 s1vaas 구현체 token/a11y/darkmode 검증.
2. **Search/Filter 추가** — token 페이지에 cssVar 검색·필터 기능 추가.
3. **Copy-to-clipboard** — token 이름·CSS 변수 클릭 복사 (token-renderer.js에 bindCopyTokens 구현됨, UI 개선 여지 있음).
4. **Source Guard 연동** — raw HEX 직접 사용 탐지, 미등록 토큰 이름 탐지 자동화.
5. **Foundation Spacing/Radius/Typography 페이지 확장** — foundation-tokens.html에 색상 외 spacing/radius/typography 렌더링 추가.
6. **candidate 토큰 승인** — md-review.html에서 pending 항목 검토 후 stable 전환.
