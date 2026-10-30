---
name: project-core-page-section-layout
description: V3.0 TEST 파일 Core 페이지(5:5706)는 섹션들이 가로로 나란히 배치 — 섹션 리사이즈 시 이웃 침범 주의
metadata: 
  node_type: memory
  type: project
  originSessionId: 7f8b8ff5-8456-47cc-b4c3-7cd86bcf1a53
---

SW-UX-GUIDE-V3.0-TEST(fileKey 〔따로 보관: 피그마파일-2〕) Core 페이지(id 5:5706)는 컴포넌트 카테고리별 SECTION이 **가로로 나란히** 배치돼 있다. 시작 x: Platform 0(폭~2136), Navigation 2256, Line Tab 4672, Pagination 5788, Actions 6916, Selection 8572, Chip 10348, Form Control 12612 … 각 섹션 사이 약 120px gutter.

**Why:** Platform 섹션(552:1658) 안의 컴포넌트를 재배치하며 섹션 폭을 2700으로 키웠더니 옆 Navigation 섹션(x=2256)을 444px 침범 → 사용자에게 "또 겹쳐있다"로 보고됨. 섹션 내부만 보면 안 겹쳐도, **섹션 자체가 이웃 섹션을 침범**하는 게 사각지대.

**How to apply:** use_figma로 SECTION을 resize하기 전/후에 반드시 `page.children`(형제 노드) bbox와 교차 검사한다(`c.x < sb.x2 && c.x2 > sb.x && c.y < sb.y2 && c.y2 > sb.y`). Platform 섹션 폭은 ≤2136 유지(내부 최대 콘텐츠 x2≈2072: LoginGNB/WebTabBar 2008px @ x64). 다크 스펙 프레임 배경=`color/bg/default` 바인딩 + Dark 모드(8:2), 라벨=임시폰트 입력 후 `title/14B`(S:d48d…) 텍스트 스타일 재바인딩 → Pretendard. [[feedback_visual_verification]] [[feedback_figma-canvas-font-consistency]]
