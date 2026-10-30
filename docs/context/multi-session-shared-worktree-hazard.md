---
name: multi-session-shared-worktree-hazard
description: "여러 세션이 같은 폴더를 공유하면 커밋·기록이 서로를 삼킨다 (2026-09-08 재발, 세션 정리로 대응)"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-09-08T13:51:55.881Z
---

여러 Claude 세션이 `(이 프로젝트 폴더)` 한 폴더를 동시에 쓰면 서로의 작업을 삼킨다. 2026-09-08 실제 재발 3종:
- 내가 기록한 Gate 34 승인 10건이 다른 세션의 파일 쓰기에 통째로 사라짐(성공 메시지는 떴는데 파일에 없음)
- 정본 검증 기록(`reports/installer-build/build-verification.json`)이 다른 세션에 의해 `--by orchestrator --change mechanical` 로 덮여 Gate 13 이 잘못 통과 상태가 됨 — 🤖 component-verifier 가 잡아서 되돌림
- 내가 정리하려던 114개 변경 중 대부분을 다른 세션이 먼저 커밋

**Why:** 같은 워크트리에 index 와 생성물 파일이 하나뿐이라, 두 세션의 쓰기가 last-write-wins 로 충돌한다. 게이트 통과 여부까지 조용히 뒤집히므로 "검사기가 통과했다"도 믿을 수 없게 된다.

**How to apply:** 저장소 정리·커밋 작업 전에 `mcp__ccd_session_mgmt__list_sessions` 로 같은 `cwd` 세션이 여럿인지 먼저 본다. 여럿이면 river 에게 알리고 정리 승인을 받아 `archive_session` 으로 닫는다(2026-09-08 river 승인으로 "웹 업데이트" 세션 archive). 파일에 쓴 뒤에는 성공 메시지를 믿지 말고 **다시 읽어 확인**한다. 관련: [[delegate-cheap-human-checks]] · **2026-09-09 구조적 해결: [[worktree-per-session]]** (세션마다 별도 작업 폴더 · 장부 낱장화 · Gate 48)

**보관(archive)에는 함정이 하나 있다 (2026-09-18 확인):** 세션을 보관하면 그 세션의 **작업 폴더까지 정리하는 것이 기본**이다. 같은 폴더에서 다른 세션이 아직 일하고 있으면 그 작업본이 같이 사라질 수 있으니, **그 폴더를 쓰는 세션이 나 하나뿐인지 먼저 확인**하고 보관한다. 지금 도는 세션들의 실제 폴더는 목록의 `cwd` 가 아니라 프로세스의 현재 폴더로 확인해야 정확하다 — 세션이 폴더를 옮겨도 목록은 처음 폴더를 그대로 보여준다.
