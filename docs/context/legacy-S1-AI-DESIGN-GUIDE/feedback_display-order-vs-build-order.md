---
name: display-order-vs-build-order
description: "컴포넌트 표시(나열) 순서와 빌드(생성) 순서는 분리 — 나열은 메인→요소, 빌드는 요소 먼저"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a217e523-aef5-4d8a-8e41-71fcd133c348
---

설치기/Figma 생성기(`build-components.ts`)·프리뷰(`render.js`)에서 컴포넌트 순서는 **두 가지를 분리**한다.

- **표시(나열) 순서** = `COMPONENT_CATEGORIES_GRID` 의 `members` 배열 = **메인 컴포넌트 → 그 안을 구성하는 요소 컴포넌트** 순. 예: Select Box → Dropdown → Dropdown List.
- **빌드(생성) 순서** = 의존성 순서 = **요소 컴포넌트 먼저**. 부모가 자식을 인스턴스로 부착(BUILT_COMPS 조회)하므로 자식이 먼저 생성돼야 한다.

**Why:** 사용자(비개발자 UX 디자이너)가 명시한 영구 규칙. "요소부터 만든다"는 건 컴포넌트를 **만들 때** 필요한 명령이지, 다 만들어진 컴포넌트를 **나열할 때** 지킬 룰이 아니다. 나열은 항상 메인이 먼저다. 이전에 빌드 의존성 때문에 members 를 재배열했더니(Dropdown List/Dropdown 을 Select Box 앞으로) 나열 순서가 깨져 지적받음.

**How to apply:** `members` 는 항상 표시 순서로만 유지. 부모↔자식 부착 관계는 `BUILD_DEPENDENCIES[부모]=[자식…]` 에 선언 → `buildOrderFor` 위상정렬이 빌드 순서를 잡고, `buildAllComponents` 의 layout 패스가 카테고리 내부를 members 순서로 세로 재배치, `render.js` 는 categorySets 를 members 순서로 sort. 이 규칙(루프·BUILD_DEPENDENCIES) 변경은 build-components.ts 구조 변경이라 🤖 [[component-leaf-key-validation]] 류 게이트 + component-verifier 검증(Gate 13) 필수. 정본: CLAUDE.md "📐 표시(나열) 순서 ≠ 빌드(생성) 순서 규칙". 관련 [[components-new-replaces-components]] · [[reference_pagination-component]].
