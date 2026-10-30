---
name: project-moved-to-intranet
description: "'이 Mac 은 스냅샷' 기록은 2026-09-08 반증됨 — 이 폴더가 유일한 작업처이고 GitHub 원격과 동기화된다 (내부망 사본은 중단)"
metadata:
  type: project
---

2026-08-05 에 "이 Mac 의 `(이 프로젝트 폴더)` 는 2026-08-03 스냅샷이고 정본은 회사 내부망" 이라고 기록했으나, **2026-09-08 확인 결과 그 기록은 낡았다.**

반증 근거(그때 '이 Mac 에 없다'고 적었던 것들이 전부 있다):
- `registry/governance/canon-manifest.json` 존재
- `.claude/settings.json` 에 PreToolUse 훅 배선됨
- 2026-08-04 이후 이 폴더에서 커밋 108건
- 원격 `https://github.com/s1designux/S1-UX-DESIGN-with-AI.git` 과 동기화됨(2026-09-08 39커밋 push, 이후 미푸시 0)

**Why:** 내부망 이관은 실제로 있었으나 이후 이 폴더에서 작업이 재개돼 앞섰다. 낡은 기록을 근거로 "여기 결과는 못 믿는다"고 말하면 river 를 잘못 안내한다.

**How to apply:** 이 폴더를 정상 작업처로 다룬다. 배포·백업 경로는 GitHub 원격이다([[github-guideline-repo-distribution]]). 내부망 사본은 **더 이상 돌리지 않는다**(river 확인 2026-09-08) — 갈라짐 걱정 없이 이 폴더만 본다. 관련: [[multi-session-shared-worktree-hazard]]
