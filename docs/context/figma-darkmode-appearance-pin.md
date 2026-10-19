---
name: figma-darkmode-appearance-pin
description: Figma 다크모드 검증 시 인스턴스의 explicit appearance 모드 핀 주의 (컬렉션 토글만으론 안 뒤집힘)
metadata: 
  node_type: memory
  type: feedback
---

Figma에서 컴포넌트가 다크모드로 안 바뀌는 걸 봤을 때 **"core에 다크모드가 없다"고 단정하지 말 것.** SW UX GUIDE V3.0 TEST의 core 컴포넌트(Table·Select·Chip·Search 등)는 **다크모드가 이미 연결돼 있고 Figma "Appearance"로 전환 가능**하다.

**함정:** 인스턴스/컴포넌트에 `explicitVariableModes: Light` (Appearance 패널의 모드 핀)가 걸려 있으면, 부모 프레임·페이지의 컬렉션 모드를 Dark로 토글해도 **그 핀이 이겨서 라이트로 렌더**된다. 그래서 "컬렉션 모드 토글 → 스크린샷"만으로 다크 검증하면 핀 걸린 인스턴스가 라이트로 보여 **오진**하게 된다.

**Why:** river가 "core 컴포넌트에 다크모드 다 돼있어, appearance로 바꿀 수 있음"이라고 정정. 2026-07-11 video 템플릿 검증에서 component-verifier가 컬렉션만 토글해 Table/Select가 라이트로 나온 걸 "core 다크 부재"로 잘못 보고 → 실제는 인스턴스 appearance 핀 문제.

**How to apply:** 다크 렌더 검증 시 ① 대상 노드의 `explicitVariableModes` 를 먼저 확인 ② 핀이 있으면 그걸 Dark 로 설정하거나 clear 해서 상속받게 한 뒤 스크린샷 ③ 컬렉션 모드 토글 결과가 라이트여도 "core 다크 부재"로 단정 금지. 관련 [[video-domain-progress]].
