---
name: worktree-per-session
description: "동시 작업은 세션마다 별도 작업 폴더 — river 진입어 '별도 폴더에서 해줘', 합치기는 npm run wt:merge (2026-09-09 A안)"
metadata: 
  node_type: memory
  type: project
  modified: 2026-09-28T00:00:00.000Z
---

river 결정 2026-09-09(A안): 여러 작업을 동시에 할 때 **세션 하나 = 작업 폴더 하나**로 간다.
river 진입어는 **"별도 폴더에서 해줘"** 였고, **2026-09-28 부터는 진입어 없이 기본값**이다 —
river 지시: "앞으로 고치는 작업은 알아서 별도 폴더에서 해줘". 파일을 고치는 작업은 내가 알아서 별도
폴더에서 시작한다(묻는 말·확인만 하는 대화는 본 폴더 그대로). 그 세션은 `.claude/worktrees/<이름>` 에서 자기 브랜치로 일하고,
끝나면 스스로 `npm run wt:merge` 로 main 에 합친다. river 가 할 일은 진입어 한마디와 평소의 OK 뿐.

**2026-09-28 에 실제로 터진 일:** 본 폴더에서 작업하다 `git add` 해 둔 내 파일이, 동시에 돌던
다른 세션의 커밋에 통째로 딸려 들어갔다(그쪽은 --no-verify 로 커밋). 내용은 살았지만 커밋 이름이
엉뚱해져 이력이 어긋났다. 기본값을 바꾼 계기다.

**Why:** 한 폴더를 여러 세션이 쓰면 index·생성물이 하나뿐이라 나중 쓰기가 앞 기록을 조용히 삼킨다
([[multi-session-shared-worktree-hazard]]). 브랜치만으로는 부족하고 폴더까지 갈라야 끊긴다.

**How to apply:** 운영 전문은 `.claude/docs/worktree-workflow.md`. 요점만:
- 착수는 `npm run wt:setup`(SessionStart 훅 자동) — 본 폴더의 node_modules·문서색인·로컬파일·기억을 잇는다
- 일감은 파일 단위로 나눈다. 같은 정본을 두 세션에 주지 않는다
- 매 작업 부딪히던 장부는 낱장이다 — 반복요청은 `npm run rr -- add`(손편집 금지), Gate 13 기록은 해시 이름 파일
- Figma 설치기 **실물 설치 확인만** 본 폴더에서(Figma 가 본 폴더 플러그인을 문다)
- 시험 중 실제로 터진 함정: 작업 폴더의 `node_modules` symlink 가 커밋되면 본 폴더의 실제 폴더가 치환돼
  사라진다(npm·git 이 ELOOP 로 조용히 실패). `.gitignore` 는 슬래시 없이 `node_modules`, Gate 48 이 차단한다
