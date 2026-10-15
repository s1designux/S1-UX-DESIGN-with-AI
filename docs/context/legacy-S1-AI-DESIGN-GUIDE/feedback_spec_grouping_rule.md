---
name: feedback_spec_grouping_rule
description: "컴포넌트 스펙/세트 그룹핑 규칙 — 모디파이어 조합을 상위 그룹, 사이즈를 그 안에서 나열"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2c4b6d19-424c-4233-ad3e-12e019b55c01
---

역방향 Figma 컴포넌트 스펙/세트를 묶을 때 **그룹핑 순서 규칙**:

**모디파이어(부가 속성: 라벨·안내메시지·아이콘·variant 등)의 조합을 상위 그룹(밴드/소제목)으로 묶고, 그 안에서 사이즈(+플랫폼)별로 나열한다.** 사이즈를 바깥 축으로 두고 그 안에서 모디파이어가 번갈아 나오게 하면 안 됨(사용자: "정신없다").

**예 — Input (2026-06-11 확정):**
```
라벨 없음                ← 그룹(밴드)
  XSMALL / SMALL / MEDIUM / MEDIUM·Mobile  ← 사이즈 행 × State 열
라벨 없음 · 안내메시지     ← 그룹
  (사이즈 행 …)
라벨 있음                ← 그룹
  (사이즈 행 …)
라벨 있음 · 안내메시지     ← 그룹
  (사이즈 행 …)
```
즉 같은 모디파이어 구성의 사이즈들이 한 덩어리로 모인다. (이전엔 "XSMALL·라벨없음, XSMALL·라벨있음, SMALL·…" 식으로 사이즈별 라벨 교차 → 폐기.)

**How to apply (모든 컴포넌트 공통):** buildGroupedSpec 에서 `platforms[]` 를 모디파이어 조합 그룹으로 두고(예: 그룹명 "라벨 없음"), `rowLabels` 를 사이즈로 둔다. 사이즈 소제목이 없으면 `sizes:[""]`(빈 소제목은 renderGrouped 가 생략). variant 가 주 축인 컴포넌트(Button=Primary/Secondary/Blue-Line)는 variant 를 행으로 두는 기존 방식 유지.

**검증 단계:** ① [[feedback_visual_verification]] 원본 캡쳐 대조 시 그룹 순서도 함께 확인 ② 빌드 후 생성 스펙을 보고 "같은 사이즈가 모디파이어별로 흩어지지 않았는지" 점검. audit-bindings 는 바인딩/플랫폼-grouped 여부만 자동검사하고, 그룹 순서는 이 문서 규칙+시각 대조로 지킨다.

**Why:** 2026-06-11 사용자 지적 — Input 이 사이즈별로 라벨 유무가 번갈아 나와 정신없음. "룰로 저장하고 검증 단계 추가" 지시.

관련: [[project_reverse_figma_v3]] · [[feedback_visual_verification]]
