---
name: feedback_token-role-must-match-element
description: "토큰은 이름에 맞는 요소 역할에만 써야 — 글자엔 글자토큰(text/label), 값 일치만 보던 게이트 사각지대를 Gate 22가 차단"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e4c501a5-0da8-460d-9f3f-ffdfd7dd9acc
---

토큰은 **이름에 맞는 요소 역할에만** 적용돼야 한다. 글자(TEXT)엔 글자 역할 토큰(`text/*`·`label/*`·`number/*`)만, 테두리엔 `border/*`. 글자색에 `border/*`·`bg/*`·`surface/*`를 쓰면 오연결(버그).

**Why:** Input 안내메시지 글자색이 `form-control/border/error`·`border/correct`(테두리 토큰)에 연결돼 있었는데, 기존 게이트는 전부 "설치기·HTML·문서의 값이 서로 **일치**하나"만 봐서 **셋이 똑같이 틀리면 ✅** 통과했다. "이 토큰이 이 요소 역할에 맞나"를 보는 검사가 없어 오연결이 동기화로 조용히 퍼짐. river 지적: "토큰명에 맞는 요소에만 적용됐는지 검수 필요."

**How to apply:** `Gate 22 (token-role-check.js, npm run tokens:rolecheck)` 가 build-components.ts 를 mock 실행해 TEXT 노드 fill 토큰의 역할을 대조·차단한다. 예외(글자에 icon색 맞춤 등)는 `TEXT_TOKEN_ALLOW` 에 (글자·토큰·사유) 등록. 후속 확장 슬롯 = stroke 는 border/* 만. 값 일치 게이트(6·7·8·10·21)와 **다른 축**(역할 정합)이므로 병행. [[feedback_verify-primary-source-with-citation]] [[feedback_token-naming-governance]]
