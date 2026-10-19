---
name: token-binding-scan
description: Figma 컴포넌트 미바인딩 raw hex를 use_figma로 사실 추출 + figma-binding-lookup.js로 역매핑 기계 판정하는 검증 절차
metadata: 
  node_type: memory
  type: project
  originSessionId: 09793bc0-20b0-450e-bc57-231fc5249279
---

figma-library-build / screen-rebuild 검증에서 **토큰 바인딩을 눈대중·카테고리 판단으로 통과시키는 것을 기계로 차단**하는 절차. 2026-06-19 WebTabBar(335:3099) 실패(검증기가 "브라우저 크롬이니 DS 색 아님" 한 줄로 #ffffff=color/surface/default, #353535=color/icon/gray-dark를 (b) 허용편차로 통과)에서 신설.

**2단계 구성:**
1. **use_figma 바인딩 스캔** — 노드 하위 SOLID fill·stroke 중 `boundVariables` 없는 raw hex를 사실 추출(LLM 판단 0). 스크립트: `.claude/skills/figma-library-build/references/token-binding-scan.md`
2. **역매핑 결정론 판정** — `node scripts/figma-binding-lookup.js --stdin` (npm: `components:bindinglookup`). vars-data.ts(FOUNDATION_COLOR·SEMANTIC_COLOR light) 정본 파싱 후 hex→토큰. EXACT(정확 일치 존재)=exit 2, APPROX(근사만)=exit 0.

**판정:** EXACT+허용편차 미명시 → ❌(a) 바인딩 필수 / EXACT+plan에 [노드명+속성유형] 명시 → 🟡(b) / APPROX → ❓(c) 사용자. 카테고리("크롬이니까")만으로 (b) 불가. 결과 표가 4-verification.md에 없으면 검문소 HOLD.

**한계:** pre-commit hook처럼 완전 자동 트리거는 아님(대화 중 에이전트가 실행). 단 결과는 100% 객관적 — "못 보고 지나침"은 막지만 "정당한 예외인지"는 여전히 사람 결정. 정규식 주의: SEMANTIC_COLOR가 SEMANTIC_COLOR_COLLECTION에 매칭되지 않게 `(?![_A-Z])` 사용.

관련: [[variables_source_of_truth]] [[no-external-library-components]] [[external-library-migration-backlog]]
