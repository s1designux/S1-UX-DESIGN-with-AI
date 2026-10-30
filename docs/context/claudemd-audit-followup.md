---
name: claudemd-audit-followup
description: "CLAUDE.md를 \"신호>잡음·집행>문서화\" 기준으로 진단 중 — 내일 이어서 개선 후보 도출·정리"
metadata: 
  node_type: memory
  type: project
---

2026-07-07 세션에서 CLAUDE.md 다이어트(121,835→70,721 byte, 약 43%↓) 후, "탄탄하게 많이 적기 ≠ 성능"이라는 관점으로 현재 파일을 진단하다 중단. **내일 이어서** 진단 마무리 + 개선 후보 도출.

**진단 기준(river님과 합의):** ①집행>문서화(훅·Gate가 강제하는 건 산문으로 안 적음) ②구체>모호 ③중요한 것에 신호 가중치(하드룰 강조) ④모순/중복 없음 ⑤항상-로드 최소화(참조는 밖으로).

**이미 실측한 진단 결과:**
- 크기 70,721 byte. **모호 표현("적절히/신중/가능하면" 등) 0건 — 이 프로젝트의 강점**(구체적으로 씀).
- **최대 문제: `# 🎛️ Main Orchestrator & Gate Check 구조` 섹션이 24,196 byte(전체의 1/3)** — 신호 가중치 불균형. 내부: Main Orchestrator 역할·Actor 요약·Gate 요약표·Hooks·자가점검·Orchestrator Summary 형식·반복요청 추적·금지 행동·ACCESS-01. 상당수가 프로세스/메타라 참조 후보.
- `ASC` 헤더 섹션 9,543 byte(하네스 소개), `파일 구조` 5,471 byte도 큰 편.
- `Gate NN` 산문 언급 22건, `npm run` 명령 언급 다수 = 기계가 이미 강제하는 것의 문서 중복 후보.
- 날짜태그 '확정' 규칙 19건 = 누적 이력형(규칙에 provenance 날짜가 붙어 노이즈).

**How to apply(내일 할 일):** ①24k Main Orchestrator 섹션에서 참조로 뺄 것 분류(ACCESS-01·반복요청 추적 상세·Orchestrator Summary 예시 등 후보) ②Gate 산문 언급 중 순수 중복 제거 ③파일 구조 섹션 슬림화 검토. 항상 [[claudemd-token-efficiency]] 절차 준수: git 스냅샷→byte 보존 검증→gate:check→하드룰 5개 불변. 실행 전 river님께 "이렇게 뺄게요" 1회 확인.
