---
name: token-naming-governance
description: "토큰 이름은 기준에 맞게 일관되게, 레거시 원본명 그대로 수입 금지, Gate 15가 기계 강제"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d69c3e89-93c3-4b82-b633-04d8b5e1b74a
---

토큰(Figma 변수 경로) **이름**은 정해진 기준에 맞춰 일관되게 만들어야 한다. 임의 생성·레거시 원본명 그대로 수입 금지.

**Why:** 기준이 CLAUDE.md 산문으로만 있고 토큰 "이름"을 검사하는 게이트가 없어서, 레거시 일괄수입(`navigation/background` — 45개 `-bg` 관례 위반)·빌더 우회 별칭(`color/icon/brand-ci` — 브랜드는 Foundation에 있어야 함)·고아 토큰(`table/border/emphasis` 미사용)이 정본(vars-data.ts)에 유입됐다. 사용자가 "기준 세워놨는데 왜 안 지켜지나, 마음대로 만들지 마라"고 강하게 지적(2026-06-23).

**How to apply:**
- 새 토큰/리네임 시 **이름**도 기준 검사 대상. 정본=`registry/governance/naming-rules.json`(기계 규칙: background→bg·color/*에 brand 별칭 금지·kebab-case). 검사기=`scripts/token-naming-check.js` = **Gate 15**(gate:check·pre-commit 편입, 위반 시 커밋 차단). 새 규칙은 naming-rules.json에 한 줄 추가.
- 레거시에서 값을 가져와도 **이름은 우리 기준으로 정규화**(예: 셀선 보더 `light`→`default`). border 어휘는 line 토큰(subtle/default/strong)과 통일.
- 브랜드색은 Foundation(`brand/ci`·`brand/blue`)에 두고, 빌더가 Foundation 색을 못 읽어 Semantic 별칭을 만드는 우회 금지 — 빌더에 Foundation 바인딩을 추가(`BuildMaps.foundationColor`)해 직접 바인딩. [[variables_source_of_truth]]
- build-components.ts 구조 변경은 self-cert 금지 → [[show_agent_gate_flow]] 처럼 component-verifier 독립 검증(Gate 13). 미커밋 대형 리팩터(세트명 카테고리 접두사 등)가 섞여 있으면 부분수정 말고 HEAD 리셋 후 내 변경만 재적용.
