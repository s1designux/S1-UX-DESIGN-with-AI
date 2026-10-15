---
name: login-is-a-pattern
description: "로그인 화면은 패턴 쪽 '통합화면'이 정본 — 컴포넌트로 임의 조립해 만들지 말 것 (river 2026-10-12)"
metadata:
  node_type: memory
  type: feedback
  modified: 2026-10-12T07:14:37.264Z
---

로그인 화면은 패턴 쪽에 river 가 만들어 둔 **통합화면**이 있다. 컴포넌트를 마음대로 조립해서 로그인 화면을 새로 만들면 안 된다.

**Why:** 웹판 퍼블리셔 검수(2026-10-12)에서 퍼블리셔 역할 에이전트에게 "로그인 화면을 부품으로 만들어 봐"라는 과제를 줬다. river 가 이를 지적했다 — 패턴이 이미 있는 화면을 부품으로 다시 짜면 정본이 둘이 된다.

**How to apply:** 시험 과제·예시·검수 시나리오에 로그인처럼 패턴이 이미 있는 화면이 나오면, 먼저 패턴 쪽에 그 화면이 있는지 찾아 그것을 쓴다. 부품 조립 시험은 패턴이 없는 화면으로만 짠다. 관련: [[legacy-service-patterns-separate]], [[pattern-builder-progress]].
