---
name: site-base-cleanup-verdicts
description: site-base.css 49토큰 중 ④판단필요 23개에 대한 river님 전량 판정 (2026-07-28) — 치환/삭제/하향 확정
metadata: 
  node_type: memory
  type: project
  modified: 2026-07-28T08:08:27.579Z
---

> ⛔ **실행 보류 — river님이 "이 정리는 안 하기로" 결정 (2026-07-28).** 아래 판정 내용은 기록으로 보존하되, **대기 작업으로 다시 올리지 말 것.** 파일(`assets/css/site-base.css`)은 미변경 상태로 둔다. 다시 하기로 뒤집히면 이 줄을 지운다.

**site-base.css 정리 판정 (river님, 2026-07-28).** 원칙: 역할→컴포넌트 기반 전환 유지, 역할급 신설 금지, 치환이 기본·승격은 예외.

- **A. 낡은 값 11개 → 정본 치환**: bg-subtle→bg-level-2 · bg-muted→bg-level-3 · text-tertiary→text-body-tertiary · text-caption→text-state-caption · text-correct→text-state-correct · text-readonly→form-control-text-read-only · border-subtle→line-gray-subtle · border-default→form-control-border-default · icon-default→icon-gray · icon-accent→icon-blue · (icon-inverse는 B와 겹침→삭제로 처리)
- **B. 사용 0건 4개 → 삭제**: bg-elevated · border-white · icon-inverse · status-info
- **C. 버그 3개**: surface-raised=site-base 선언 삭제(정본과 동명·다크만 다름, 페이지별 다크 갈림 원인) · status-success=삭제(L파랑/D초록 계열모순, 사용0) · **text-state-error=site-base 소속 확정(정본에 없음, 2026-07-28 확인) → `--color-text-state-caution`으로 치환 후 삭제** (2026-06-23 결정 #3 통합이 이미 후계 지정, tokens/semantic.md:125·175)
- **D. 컴포넌트 토큰으로 하향 6개**: bg-selected · border-strong · border-emphasis · action-primary-subtle · border-disabled · action-primary-pressed(→Button pressed 상태로. Button만 pressed 보유)

미판정으로 남은 것: ①중복 18개(치환 대응표 확보됨) · ②승격 후보 7개(status 계열·hover·navigation-icon·text-link — "승격은 예외" 원칙하 별도 결정 대기) · ③포털 전용 1개(bg-home). 관련: [[multi-session-shared-worktree-hazard]] — 실행 시 세션 조율 필수. 조사 원본은 2026-07-28 세션 보고(site-base 채굴 조사).
