---
name: pc-library-candidates
description: "PC 프로그램용 UI 라이브러리 후보 — C#(WPF)·Java(JavaFX)·Qt(C++), 현업 확인 후 실제 제작 예정 (2026-10-04)"
metadata:
  node_type: memory
  type: project
  modified: 2026-10-04T08:24:10.556Z
---

현재 배포본의 PC 쪽은 C++ 색·크기 값 파일(s1_tokens.h) 하나뿐이다. river 가 PC 대응 후보로 **C#(WPF) · Java(JavaFX) · Qt(C++)** 세 가지를 골랐다(2026-10-04). 개발부서가 실제로 무엇을 쓰는지 확인한 뒤에 진짜로 만들기로 했다.

**Why:** 부서마다 개발 도구가 달라도 모두 대응한다는 것이 UI 라이브러리를 여러 벌 만드는 이유다. PC 쪽만 비어 있었다.

**How to apply:** river 가 PC 라이브러리 이야기를 꺼내면, 먼저 부서별 실제 사용 도구 확인 결과를 묻고 시작한다. 세 도구 모두 컴포넌트 제작이 가능하다(WPF 스타일·컨트롤 템플릿, JavaFX CSS·커스텀 컨트롤, Qt QML·QSS). 토큰 값부터 내보내는 게 쉬운 첫 단계다.
