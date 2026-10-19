---
name: feedback_visual_verification
description: 컴포넌트 생성 시 메타데이터 수치만 보지 말고 원본 캡쳐 이미지로 구조를 대조 검수할 것
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2c4b6d19-424c-4233-ad3e-12e019b55c01
---

역방향(코드→Figma) 컴포넌트를 만들 때 **get_metadata 수치(변형 이름·크기)만으로 만들지 말 것.** 반드시 **원본 노드를 get_screenshot 으로 캡쳐해 시각 구조를 대조**한 뒤 빌드한다.

**How to apply (컴포넌트마다 필수):**
1. 빌드 전 — 원본 컴포넌트 프레임 + 핵심 변형 몇 개를 `get_screenshot`(curl→Read 로 실제 확인). 보이는 구성요소를 전부 열거: 라벨·필드·메시지·아이콘·드롭다운 패널·하단 툴바·옵션 리스트 등.
2. 빌더가 그 구성요소를 **빠짐없이** 재현하는지 항목 대조. 수치(높이·패딩)만 맞추고 구조(패널/라벨/메시지/툴바)를 빠뜨리면 안 됨.
3. 빌드 후 — 가능하면 생성 결과도 캡쳐해 원본과 나란히 비교(사용자 검수 포함).

**Why:** 2026-06-11 수치-기반으로만 만들어 원본과 다른 사양 다수 발생 — Text Area Helper=On(원본은 필드 하단 카운터+아이콘 툴바인데 "도움말 텍스트"를 잘못 붙임), Input(원본은 Label 위+Message 아래 변형 있는데 누락), Select Open(원본은 드롭다운 옵션 패널인데 트리거 하이라이트만). 사용자 지시: "수치적으로만 비교하지 말고 캡쳐 이미지로 비교해서 원본과 동일하게 표출되는지 검수하는 과정을 추가." 평면 이미지 참고 노드라도 get_screenshot 으로 렌더는 볼 수 있음([[feedback_variables_source_of_truth]] 의 매트릭스-only 와 보완).

관련: [[project_reverse_figma_v3]]
