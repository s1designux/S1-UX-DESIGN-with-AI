---
name: board-refresh-silent
description: 레거시 대응 검수판 갱신(board:refresh + 같은 링크 재게시)은 조용히 하고 river 보고에서 뺀다 (2026-10-02)
metadata:
  node_type: memory
  type: feedback
  modified: 2026-10-02T06:30:16.565Z
---

배포본이 바뀌어 Gate 47 이 검수판 낡음을 잡으면 `npm run board:refresh` 후 같은 아티팩트 링크로 재게시까지 하되, **채팅 보고에는 언급하지 않는다.** 커밋 메시지 기록은 유지해도 된다.

**Why:** river 가 "레거시 대응 검수판은 왜 보여주는거야?" → "조용히 처리하고 보고에서 빼줘" (2026-10-02). 버전 번호·그림만 바뀌는 기계적 갱신이라 결정할 것이 없다.

**How to apply:** 재게시 전 내용 대조(이미지 제외 diff)는 계속 한다. 대조에서 버전 문자열 외 내용 변화가 보이거나 재게시가 실패하면 그때만 한 줄로 알린다. 관련: [[silent-execution-mode]]
