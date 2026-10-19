---
name: headless-chrome-leaks
description: 검사기가 띄우는 헤드리스 크롬은 그룹째 죽여야 한다 — 안 그러면 쌓여서 검사가 시간 초과된다 (2026-09-23 해결)
metadata:
  node_type: memory
  type: project
  modified: 2026-09-23T05:20:00.343Z
---

크롬은 `--screenshot`/`--dump-dom` 을 다 쓰고도 **스스로 종료하지 않는다.** 검사기가 `child.kill('SIGKILL')` 로 죽이면 맨 위 프로세스만 죽고 도우미(GPU·렌더러·네트워크)는 주인을 잃은 채 남는다. 2026-09-23 실측: 며칠치가 쌓여 **프로세스 105개 · 임시 프로필 폴더 866개(324MB)**.

**Why:** 그 잔여물이 자리를 물고 있으면 크롬을 쓰는 검사(Gate 51 키보드순서 등)가 **간헐적으로 시간 초과**해 커밋이 막힌다. 같은 검사가 정리 직후 120초 초과 → 0.9초로 돌아왔다. "검사기가 왜 자꾸 실패하지"의 진짜 원인이 코드가 아니라 이것일 수 있다.

**How to apply:** 크롬을 새로 띄우는 검사기를 만들면 `scripts/lib/chrome-proc.js` 의 `spawnChrome` / `killChromeTree` 를 쓴다(detached 로 띄우고 `process.kill(-pid)` 로 그룹째 종료). 직접 `spawn`+`child.kill` 을 쓰면 같은 누수가 생긴다. 이미 샜다면 `pkill -f "user-data-dir=/var/folders/"` 로 정리 — 이 조건은 사용자가 쓰는 크롬(프로필이 ~/Library 에 있음)을 건드리지 않는다.
