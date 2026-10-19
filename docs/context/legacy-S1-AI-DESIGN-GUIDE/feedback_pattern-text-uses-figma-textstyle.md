---
name: feedback-pattern-text-uses-figma-textstyle
description: 패턴 텍스트는 노토 오버레이가 아니라 V2.4 Figma 텍스트 스타일(Pretendard) 바인딩으로 — 글자는 노토로 타이핑하고 스타일만 입힘
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f0c3d16f-45d0-49f1-a80e-4c2c32f81a6f
---

use_figma(MCP)로 패턴/화면을 만들 때 텍스트는 **노토산스로 끝내지 말고, 설치기가 파일에 만들어 둔 V2.4 텍스트 스타일(`title/*`·`body/*`, Pretendard)을 바인딩**한다.

**Why:** 2026-06-18 river 지시 — 패턴 글자가 노토로 나오는 걸 Pretendard 디자인시스템 스타일로 바꾸고 싶다. MCP 환경은 Pretendard 폰트를 렌더용으로 못 불러오지만(`does not exist`), **텍스트 스타일 바인딩은 폰트 로드 없이도 성공**함을 실파일에서 검증함.

**How to apply (검증된 레시피):**
1. 글자(`characters`)는 로드 가능한 **Noto Sans KR**로 먼저 입력한다(한글 입력용 임시 폰트).
2. `await textNode.setTextStyleIdAsync(스타일id)` 로 알맞은 텍스트 스타일을 바인딩한다. → `fontName`이 Pretendard로 바뀌고 size·line-height·letter-spacing이 스타일 값으로 들어감. `hasMissingFont:true`(MCP 클라우드는 대체 글리프로 렌더하지만 한글은 보임). **Pretendard 설치된 데스크톱에서 열면 정상 렌더.**
3. 스타일 id는 `figma.getLocalTextStylesAsync()`로 이름→id 맵을 만들어 찾는다(예: `body/14R`, `title/16B`).
4. 색은 기존대로 Variable 바인딩.
- 매핑: 굵기 Bold→`*B`, Medium→`*M`, Regular→`*R`. 크기 숫자 일치. Bold/큰 글자=`title/*`, 본문=`body/*`. (title/body 겹치는 값은 동일하므로 의미로 선택)
- 정본 빌더 `build-components.ts`도 동일하게 `setTextStyleIdAsync` 사용. 관련 [[project_figma-build-constraints]].
