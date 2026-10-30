---
name: feedback-no-fabricated-content
description: 법인·법적·브랜드 콘텐츠(회사명·대표이사·주소·사업자번호·카피라이트·링크)는 임의 작성 절대 금지 — 검증된 원본에서만
metadata: 
  node_type: memory
  type: feedback
  originSessionId: fd44bfbb-2b02-4bcf-b9d9-d9afc5060851
---

사용자가 강하게 지적(2026-06-22): 풋터에 **검증 안 된 임의 법인정보**가 들어가 있었다 — "대표이사 김일환", "삼일대로 343", 링크 "고객지원", "Copyright © S1 Corp. All rights reserved." — 전부 날조값. 실제(원본 login_Footer)는 대표이사 **정해린**, 사업자등록번호 208-81-13302, 04511 서울특별시 중구 세종대로 7길 25 에스원 빌딩, "© S-1 Corp. All Rights Reserved.", 링크 "위치기반 서비스 이용약관".

**Why:** 컴포넌트를 처음 만들 때(65540db) placeholder 자리를 "그럴듯한 가짜 값"으로 채웠고, 기존 게이트는 토큰·구조만 봐서 텍스트 내용 날조를 못 잡았다. 법인/법적 정보는 한 글자만 틀려도 심각한 오류다.

**How to apply:**
- **법인명·대표이사·주소·사업자번호·카피라이트·약관 링크명 등 사실/법적 콘텐츠는 절대 추측·임의 작성 금지.** 반드시 검증된 원본(Figma 원본 컴포넌트·고객 제공 자료)에서 verbatim 으로 가져온다. 못 찾으면 지어내지 말고 사용자에게 묻는다.
- 풋터 콘텐츠 정본 = `registry/content/footer.json` (출처 login_Footer). 변경 시 원본 재확인 후 정본 + `build-components.ts`(buildFooter) 동시 갱신.
- 재발 방지 = **Gate 14 (`scripts/footer-content-check.js`, `npm run footer:contentcheck`)** — 생성기 풋터 문구가 정본과 verbatim 일치하는지 + 폐기 날조값(forbiddenFragments) 재유입 0 인지 커밋 단계에서 기계 차단. gate:check 에 포함. 관련 [[feedback_no-external-library-components]](키 기반 기계 강제와 같은 사상).
- 일반 원칙: 새 컴포넌트에 사실성 텍스트가 필요하면 placeholder 라도 "가짜 사실값"(가짜 이름/주소/번호) 금지 — 명백한 더미("[서비스명]" 같은 토큰) 또는 검증된 실제값만.
