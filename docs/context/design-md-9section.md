---
name: design-md-9section
description: DESIGN.md(AI 소비용)가 awesome-design-md 9섹션 구조로 확장됨 — 서술을 어디서 편집하는지
metadata: 
  node_type: memory
  type: project
---

DESIGN.core.md(AI 소비용 단일 컨텍스트, 포털 install-prompt.html "AI 프롬프트" 탭 → `s1-design-ai-context.md` 다운로드)가 2026-07-21 **awesome-design-md/Stitch 9섹션** 구조로 확장됨(토큰 사전+상태표뿐이던 것 → 사용 맥락 포함).

**서술(prose)을 편집하는 곳 (md 는 손편집 금지 — Gate 24 가 차단):**
- **전역 섹션**(§1 비주얼테마·§2 색상역할·§3 타이포·§5 레이아웃·§6 엘리베이션·§7 Do/Don't·§8 반응형·§9 Agent가이드) → `registry/governance/design-narrative.json`
- **컴포넌트별 서술**(언제 쓰나·구성 anatomy·Do/Don't·접근성) → 각 `registry/components/*.json` 의 `usage`·`anatomy`·`doDont`·`a11y` 필드(17개 전부 채워짐)
- 값(HEX·px)은 넣지 않음 — 값 단일 출처는 tokens.css(생성기 frontmatter)

편집 후 `npm run design:md:write` → `npm run tokens:sync-prompt`(포털 반영). 생성기 `scripts/gen-design-md.js` 가 섹션 빌더로 렌더. PROFILES 는 이제 `design.manifest.json` 에서 파생(상수 중복 제거). §6 그림자 토큰(--shadow-*)은 미정의라 백로그(현재 표면 위계+z-index 로 서술만). [[claudemd-token-efficiency]]
