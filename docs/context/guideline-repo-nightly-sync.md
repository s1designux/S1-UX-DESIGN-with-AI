---
name: guideline-repo-nightly-sync
description: 공개 가이드 저장소는 별도 repo에서 매일 밤 원본을 당겨가며, 검사 실패 시 조용히 멈춘다
metadata:
  type: project
---

배포용 공개 저장소 `s1designux/S-1-UX-DESIGN-AI-GUIDELINE` 는 이 프로젝트가 푸시하는 곳이 아니라, **그쪽 repo의 GitHub Actions가 매일 03:15 KST 에 원본(raw.githubusercontent)에서 파일을 당겨가는** 구조다. 당긴 뒤 `npm test`(component-behavior-check)가 실패하면 커밋하지 않고 끝나므로, **실패해도 아무 알림 없이 조용히 낡은 상태로 멈춘다** (2026-09-01~09-13 13일 연속 실패 사례).

**Why:** 이쪽 저장소에는 그 repo로 보내는 스크립트도 워크플로도 없어서, 로컬만 보면 "자동 업데이트 중"인지 알 길이 없다.

**How to apply:** 가이드 배포 상태를 물으면 `gh run list --repo s1designux/S-1-UX-DESIGN-AI-GUIDELINE` 로 최근 실행 성패를 먼저 본다. 원본에서 `component-behavior.pc.json` 의 `source.sourceFile` 이 새 경로를 가리키게 되면 그쪽 sync 목록도 따라가야 한다(2026-09-14 에 추적 방식으로 고침). 갱신 이력은 그 repo의 `CHANGELOG.md`·`SOURCE.json.syncedAt`. 관련: [[github-guideline-repo-distribution]]
