---
name: skip-builder-preview
description: 빌더 프리뷰 대신 Figma에 직접 그려서 확인 — 빌더 출력이 부정확해 불편
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0b449eb5-013d-4775-b01d-f7937dbfeb89
---

빌더(component-preview/빌더 렌더링)로 결과를 보여주지 않는다. 부정확하고 오히려 불편하다.

**Why:** 빌더 프리뷰가 실제 Figma 렌더와 달라 신뢰할 수 없음.

**How to apply:** 컴포넌트·토큰 결과를 시각적으로 확인해야 할 때는 빌더 프리뷰를 거치지 않고 바로 `use_figma`로 Figma 캔버스에 직접 그려서 `get_screenshot`으로 확인한다.
