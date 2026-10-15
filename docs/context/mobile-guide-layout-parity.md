---
name: mobile-guide-layout-parity
description: "컴포넌트 가이드 Mobile 화면은 PC와 같은 자리에서 시작하고, 값이 하나뿐인 축은 축으로 세우지 않는다 (river 확정 2026-09-01)"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-09-01T08:09:09.661Z
---

컴포넌트 안내 화면(Mobile)을 만들 때 river가 반복해서 지적한 것 4가지:

1. **값이 하나뿐인 축은 축으로 세우지 않는다** — Mobile 크기가 1종이면 크기 라벨(LG·SM·MD)·크기별 블록 분리·「공통」 꼬리표를 만들지 말고, 그 자리에 유형(Primary/Secondary/Blue Line, Line/Solid, 제목 유무)을 넣어 한 표에서 함께 보이게 한다. 유형 사이 가로선도 없앤다.
2. **Mobile은 PC와 같은 구조로 시작한다** — Mobile에만 있는 선행 안내 문단 금지("정본에 플랫폼·크기 축이 없어 PC와 같습니다" 류는 정보 가치도 없다). 제목↔Action 간격이 PC와 같아야 한다.
3. **숨겨진 형제 섹션의 웃여백**을 지운다 — 한 플랫폼만 보이는 화면에서 `.platform-section + .platform-section` 의 24px가 Mobile에만 남는다.
4. **개발 코드는 보고 있는 화면의 플랫폼 마크업만** — Mobile 화면에 PC 마크업이 나오면 퍼블리셔가 그대로 복사한다.

**Why:** river는 화면을 결과로 검수한다. PC와 Mobile을 나란히 놓았을 때 "왜 여기만 벌어졌지"가 보이면 그건 내가 잡았어야 할 실수다. 축이 하나인데 축으로 세우면 정작 함께 봐야 할 유형이 흩어진다.

**How to apply:** 새 컴포넌트 안내 화면을 만들거나 고칠 때 정본을 먼저 본다 — 사람용 `component-page-template.md §A-5·A-6`, 기계가독 `registry/governance/component-presentation-policy.json` 의 `_meta.uiLibraryGuideLayout.platformParity`·`stateMatrix.singleValueAxis`. 네 항목 모두 `ui-library/scripts/test.mjs` 가 소스에서 결정론으로 막는다(2026-09-01 배선, 역검사로 4건 모두 발화 확인). 관련: [[claudemd-token-efficiency]]
