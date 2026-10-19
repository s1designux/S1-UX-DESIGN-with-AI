---
name: claudemd-token-efficiency
description: river님은 CLAUDE.md 등 항상-로드 문서의 토큰 소비에 민감 — 규칙은 얇은 라우터로 유지하고 참조/집행되는 것은 밖으로
metadata: 
  node_type: memory
  type: feedback
---

river님은 CLAUDE.md가 매 턴·매 서브에이전트마다 로드돼 토큰을 많이 쓰는 것을 비효율로 본다. 규칙을 새로 추가할 때 아래 3분류로 판단해 CLAUDE.md 본문을 얇게 유지한다.

**분류 원칙:**
- **항상 필요한 판단 규칙**(하드룰·색상=Semantic 경유·트리거→스킬 매핑) → CLAUDE.md 본문 유지
- **가끔 참조하는 사전**(Gate 상세·Actor 이름표·이력·토큰 값 표) → `.claude/docs/*.md` 또는 기존 정본(tokens/foundation.md·semantic.md 등)으로 빼고 본문은 포인터
- **기계가 강제하는 것**(Gate 검사 로직) → 훅이 강제하므로 본문에서 최소화 가능. "문서화"가 아니라 "집행"이 규칙을 지키게 한다.

**Why:** 항상-로드 비용은 서브에이전트 수만큼 곱해진다. 참조성 내용이 본문에 쌓이면 비용뿐 아니라 정말 중요한 규칙이 묻혀 정확도도 떨어진다.

**How to apply:** 규칙 추가 시 "이게 매 작업에 필요한가, 특정 작업에만인가, 기계가 이미 강제하나"를 먼저 물어 자리를 정한다. 문서를 옮길 땐 항상 ①git 스냅샷 ②byte 보존 검증(옮긴 내용이 정본에 verbatim 존재) ③gate:check 통과 ④하드룰 개수 불변 확인. 정본에 있을 줄 알고 옮기다 status-dark처럼 실제로 없는 항목을 놓치지 않도록 항목별 대조. 2026-07-07 다이어트로 121,835→69,665 byte(약 43%↓) 달성. 참조 문서는 `.gitignore`에 `!.claude/docs/` 예외를 둬야 추적됨(과거 유실 원인).
