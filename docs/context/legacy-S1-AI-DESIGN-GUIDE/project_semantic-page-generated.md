---
name: project_semantic-page-generated
description: "pages/semantic.html은 vars-data에서 자동 생성됨 — 손편집 금지, page:gen으로 재생성"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9ea94a5f-2c0b-4b5e-a61d-e0142c2e33ac
---

`pages/semantic.html`의 Color 섹션(`SEMANTIC_PAGE` 데이터)은 2026-06-12부터 **정본 vars-data SEMANTIC_COLOR에서 자동 생성**된다. 수동 편집 금지.

**Why:** 이전엔 수기 페이지라 [[feedback_variables_source_of_truth]] 전환(2026-06-08 역할기반→컴포넌트폴더)을 못 따라가 정본과 통째로 어긋났다. 사용자 결정 = "Variables 1:1 미러".

**2026-06-16 업데이트 — 역할기반 부분 복원:** "역할기반 복원 안 함" 전제는 더 이상 전면 적용 아님. 사용자 요청으로 `color/bg/*`(default·subtle·muted·elevated·selected) + `color/surface/*`(default·raised) 7개를 vars-data SEMANTIC_COLOR에 **추가**(시멘틱 토큰으로도 사용 가능하게). 값=site-base.css 실측 그대로. site-base.css 사본은 포털 폴백으로 **유지**(이중 정의지만 Gate7이 vars-data 우선·값일치 강제). `--color-bg-home`(#F5F6FB raw·사용처0)은 제외. text/border/icon/action/status 나머지 역할토큰은 여전히 site-base.css 전용. (CLAUDE.md Gate7 주석 "역할기반=site-base, vars-data엔 없음"은 bg/surface 한정 outdated.)

**How to apply:**
- 토큰 추가/변경 후 `npm run page:gen` (또는 `npm run tokens:reconcile` 2/4단계가 자동 실행).
- 생성기 = `scripts/gen-semantic-page.js`. GEN 마커 `/* >>> GEN:SEMANTIC-PAGE >>> */ … <<< */` 사이만 교체. hex는 tokens.css resolver 재사용 → tokens:gen이 먼저 돌아야 함.
- 역할(role) 설명은 경로서 결정론적 파생(추측 금지). 그룹 설명은 `GROUP_DESC` 맵.
- **완전성 게이트(B):** `token-sync-monitor.js`가 semantic.html 토큰집합 == SEMANTIC_COLOR 정본인지 검사(누락/잉여 = Gate 7 ERROR). Gate 7은 gate-check가 monitor()로 실행. 페이지에 토큰을 손으로 빼거나 더하면 `npm run gate:check`·PostToolUse 훅이 잡는다.
- semantic.html은 [[project_components-new-replaces-components]]와 달리 폐기 아님 — 생성 대상으로 유지.
