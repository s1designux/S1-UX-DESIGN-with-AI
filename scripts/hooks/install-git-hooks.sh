#!/usr/bin/env bash
# 버전 관리되는 git 훅(scripts/hooks/)을 .git/hooks/ 에 설치한다.
# git 훅은 저장소에 커밋되지 않으므로, clone/새 환경에서 1회 설치 필요.
# package.json "prepare"가 npm install 시 이 스크립트를 자동 실행하므로 보통 수동 입력 불필요.
#   (수동 실행: bash scripts/hooks/install-git-hooks.sh)

# git 저장소가 아니거나(.git 없음) git 미설치 환경(예: tarball 설치)에서는 조용히 통과 — npm install 실패 방지.
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" || ! -d "$ROOT/.git" ]]; then
  echo "ℹ️  git 저장소 아님 — pre-commit 훅 설치 건너뜀(정상)."
  exit 0
fi

cp "$ROOT/scripts/hooks/pre-commit" "$ROOT/.git/hooks/pre-commit"
chmod +x "$ROOT/.git/hooks/pre-commit"
echo "✅ pre-commit 훅 설치 완료 → .git/hooks/pre-commit"
