# 세션 하나 = 작업 폴더 하나 (별도 작업 폴더 운영)

> **왜:** 여러 세션이 같은 폴더를 쓰면 index·생성물이 하나뿐이라 나중 쓰기가 앞 기록을 조용히 삼킨다.
> 2026-09-08 실제 3종: Gate 34 승인 10건 소실 · Gate 13 검증 기록 덮어씀(잘못 통과) · 남의 변경을 삼킨 커밋.
> **river 결정 2026-09-09(A안):** 기본을 별도 폴더로 두고, 매번 걸리던 장부는 낱장으로 쪼갠다.
> 관련 기억: `multi-session-shared-worktree-hazard`.

---

## 1. river 가 하는 것 (전부)

| 언제 | 무엇 |
|---|---|
| 새 세션을 열 때 | **"별도 폴더에서 해줘"** 한마디 (또는 터미널에서 `claude --worktree <이름>`) |
| 일이 끝났을 때 | 평소처럼 **OK** — 합치기는 그 세션이 스스로 한다 |
| 일감을 나눌 때 | 세션마다 **다른 컴포넌트/다른 파일**. 같은 정본을 두 세션에 주지 않는다 |

끝난 세션을 며칠 방치하지 않는다 — 묵을수록 부딪힐 확률이 오른다.

## 2. ⭐ 가 하는 것

**착수 시** — 별도 폴더 세션이면 `npm run wt:setup` 이 세션 시작 훅(SessionStart)으로 자동 실행돼
본 폴더에만 있는 것(node_modules · 문서 색인 캐시 · `.env` 류 · 기억 memory)을 잇는다. 수동 실행도 같은 명령.

**작업 중** — 이 폴더 안에서만 편집·커밋한다. 커밋마다 pre-commit 검문소가 돈다(git 훅은 본 저장소 것을 공유).

**끝났을 때(river OK 후)** — `npm run wt:merge` 하나로 끝난다. 안에서 일어나는 일:

1. 이 폴더·본 폴더 둘 다 커밋 안 된 변경이 없는지 확인
2. 본 폴더 main 을 원격과 맞춤(fast-forward 만)
3. **main 을 이 브랜치에 먼저 들여옴** — 부딪히면 여기서 멈추고 파일별 처리 힌트를 낸다
4. 본 폴더 main 을 이 브랜치로 fast-forward (main 은 항상 앞으로만)
5. 본 폴더에서 반복요청 낱장 접기 + 검사기 전체 — 실패하면 **main 을 합치기 전으로 되돌린다**
5b. 본 폴더에서 **Figma 플러그인(설치기 dist·zip) 재생성** — 이 경로는 `.gitignore` 대상이라 합쳐도 따라오지 않는다. 별도 폴더 방식 이전에는 모두가 본 폴더에서 빌드해 저절로 갱신됐다. 여기서 다시 지어야 **river 가 원래 등록해 둔 플러그인이 바로 새 것을 읽는다**(2026-09-09 신설 — 정본을 네 번 고쳤는데 플러그인이 오전 판 그대로였던 사고). 실패해도 되돌리지 않고 경고만 낸다
6. origin/main push (`--no-push` 로 생략, `--dry-run` 으로 예행)

## 3. 부딪혔을 때 (3단계에서 멈춤)

`wt:merge` 가 파일마다 힌트를 붙여 낸다. 원칙 2줄:

- **자동 생성 파일은 손으로 풀지 않는다** — main 쪽을 받은 뒤 재생성 명령 한 번(`ui:build` · `installer:build` · `tokens:reconcile` · `design:md:write` 등)
- **정본·손관리 파일만 사람이 읽고 푼다**

풀었으면 `git add -A && git commit` (검문소 통과해야 커밋) → 다시 `npm run wt:merge`. 포기는 `git merge --abort`.

## 4. 낱장 장부 (합칠 때 사람이 고를 것을 0으로)

매 작업마다 건드려 **반드시 부딪히던** 장부 2개를 세션별 파일로 쪼갰다.

| 장부 | 구조 | 쓰는 법 |
|---|---|---|
| 반복 요청 | `reports/repeated-requests/` — `patterns/<id>.json`(정본) + `inbox/<브랜치>.jsonl`(낱장) | `npm run rr -- add --id <id> --summary "…" [--label "…"]` · 조회 `rr -- list` · 접기 `rr -- fold`(wt:merge 가 자동) |
| Gate 13 검증 | `reports/installer-build/verifications/<해시앞16자>.json` | 기존과 동일 `--record` (파일명이 해시라 세션마다 다른 파일) |

`CLAUDE.md` 변경 이력은 그대로 둔다 — 최근 1행만 남기는 규칙(Gate 37)이라 합칠 때 최신 1줄만 살리면 끝난다.

**Gate 48** 이 옛 단일 파일의 부활과 낱장 형식 오류를 차단한다.

## 5. 별도 폴더에서 안 되는 것 하나

**Figma 설치기 실제 설치 확인**은 본 폴더에서 한다 — Figma Desktop 이 본 폴더의 플러그인 매니페스트를 물고 있다.
빌드·검사는 별도 폴더에서 되고, 실물 설치 확인만 합친 뒤 본 폴더에서(`ops-procedures.md` ACCESS-01).

## 6. 실측 메모 (2026-09-09 · Claude Code 2.1.263)

- 별도 폴더 위치: 저장소 안 `.claude/worktrees/<이름>/`, 브랜치 `worktree-<이름>`
- 세션 기록 폴더가 갈린다: `~/.claude/projects/<본폴더-slug>--claude-worktrees-<이름>/`
  → **Gate 34**(river 발화 대조)가 본 폴더만 보면 별도 폴더 세션의 승인을 못 찾는다. `scripts/lib/worktree.js` 의
  `transcriptDirs()` 가 두 곳을 모두 읽도록 배선됨. 기억(memory)은 `wt:setup` 이 symlink 로 잇는다.
- git 훅은 본 저장소 `.git/hooks` 공유 → 검문소는 별도 폴더에서도 돈다
- `node_modules` 는 복사되지 않는다 → `wt:setup` 이 symlink (npm install 불필요)
