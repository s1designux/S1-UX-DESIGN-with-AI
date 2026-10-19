---
name: project_moduapp-workspace-is-wiki
description: s1-moduapp-workspace는 모두앱 이해용 위키 — 컴포넌트/토큰 세트는 여기서 관리 안 함(디자인시스템 repo 정본)
metadata: 
  node_type: memory
  type: project
  originSessionId: 06c2efa5-d800-4334-8ab6-99af2b77a054
---

`s1-moduapp-workspace`의 용도는 **모두앱 위키**다: 과제 설명·타겟·UI 사양 이해 데이터 등 "모두앱을 이해하기 위한 자료"를 모으는 곳. **컴포넌트 세트·토큰 같은 디자인시스템 자산은 여기서 만들거나 관리하지 않는다** — 그건 디자인시스템 가이드 repo(S1_AI_DESIGN_GUIDE) 정본 소관.

**Why:** 사용자가 명시(2026-06-18). 이전 세션이 이 워크스페이스에 컴포넌트 역할 기준표(component-role-map.json)·토큰 역할 기준표(token-role-map.json)·레이아웃 패턴 카탈로그·"기준표 검토" HTML 페이지를 만들어뒀는데, 사용자가 요청한 적 없고 위키 용도와 안 맞아 전부 제거함(패턴 개념 + standards.html + 두 role-map 사본). DS 자산을 위키에 사본으로 두면 출처 이중화(싱크 드리프트) 위험.

**How to apply:** 모두앱 관련 요청이 오면 "모두앱 이해 자료(과제·타겟·UI 사양·화면 분석·권한 매트릭스·서비스맵)"인지 "디자인시스템 자산(컴포넌트/토큰/패턴)"인지 먼저 가른다. 후자는 이 워크스페이스에 만들지 말고 DS repo로 보낸다. ds-mapper가 매핑할 때도 DS repo registry를 정본으로 참조(위키에 사본 두지 않음). [[project_service-ui-data-to-intelligence-workspace]] 의 모두앱 구체화 버전.
