---
name: composition-rules-canon
description: 묶음 규칙 정본 신설 — 빌더 작업은 worktree-field-group 에서 합치기 대기 중 (2026-09-18)
metadata:
  type: project
---

라벨·간격처럼 "부품을 붙이는 규칙"은 `registry/governance/composition-rules.json`(policyCanon)이 정본이다. river 승인 2026-09-18. 빌더는 이 파일을 읽기만 하고 자기 값을 갖지 않는다.

값 넷은 모두 `candidate` — 묶음 안 8 · 묶음 사이 24 · 한 줄 안 12 · 라벨 typo-body-14m. 빌더로 화면을 만들어 보고 확정하기로 했다.

**Why:** 정본에 자리가 없으면 빌더가 자기 값을 갖게 되고, 그러면 정본과 어긋난다. 화면 폭·헤더 높이 같은 서비스별 수치는 여기 넣지 않는다(패턴 소관).

**How to apply:** 간격·라벨 값을 바꿀 땐 이 정본 한 곳만 고친다. 2026-09-18 main 에 합쳐졌다. 관련: [[worktree-per-session]] · [[multi-session-shared-worktree-hazard]] · [[pattern-builder-progress]]
