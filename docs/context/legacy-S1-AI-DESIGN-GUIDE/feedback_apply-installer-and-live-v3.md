---
name: feedback-apply-installer-and-live-v3
description: 컴포넌트 변경 시 설치기 반영 + 현재 V3.0 Figma 노드도 직접 수정해 재설치 없이 바로 보이게
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 985df123-5be3-4de6-96d3-d801b620f1dc
---

컴포넌트(테이블 등)를 수정할 때마다 **두 곳에 동시 반영**하는 것이 기본 워크플로다(매번 별도 요청 없이):

1. **설치기 = 정본·영속**: `build-components.ts`(필요시 `vars-data.ts`) 수정 → `installer:build`로 zip 재빌드. 재설치 시 그대로 재현되게.
2. **현재 V3.0 Figma 노드 = 즉시 확인**: `use_figma`로 V3.0 TEST 파일(`〔따로 보관: 피그마파일-2〕`)의 **해당 컴포넌트 라이브 노드를 직접 수정**(변수 alias 갱신·노드 fill 재바인딩·라인 추가 등) → `get_screenshot`으로 보여준다. **사용자가 설치기로 다시 깔지 않아도 바로 결과를 본다.**

**Why:** 사용자는 매번 설치기를 재실행해 결과를 확인하는 게 번거롭다. 설치기에만 반영하면 즉시 못 본다. 그래서 소스(영속)와 라이브 캔버스(즉시)를 항상 함께 손본다.

**How to apply:**
- 새 Variable이 필요하면(예: emphasis 토큰) 라이브 파일에도 같은 이름·컬렉션·모드로 변수를 만들어 바인딩(설치기 재실행 시 이름으로 reconcile돼 충돌 없음).
- **라이브 수정 = 생성기 산출물과 동일**해야 한다(둘이 어긋나면 재설치 때 라이브가 덮여 달라짐). 같게 맞춘 뒤 렌더 1회로 확인.
- 색은 항상 Variable 바인딩(하드코딩 hex 금지), 다크는 데이터(변수 alias)로 판정.
- [[feedback_skip-builder-preview]](빌더 프리뷰 부정확 → Figma 직접 그리고 스크린샷)의 실행판. [[feedback_variables_source_of_truth]] · [[project_components-new-replaces-components]].
