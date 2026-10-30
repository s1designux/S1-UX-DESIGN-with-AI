---
name: project_service-ui-data-to-intelligence-workspace
description: 서비스별 UI 사양서·맥락 데이터화는 각 intelligence workspace에 업데이트 (DS 가이드 repo 아님)
metadata: 
  node_type: memory
  type: project
  originSessionId: 332f52b8-dbc0-43d4-8e3e-9b2f3ff00266
---

서비스별 **UI 사양서·화면 맥락을 데이터화**해야 할 때는, S1_AI_DESIGN_GUIDE(이 DS 가이드 repo)가 아니라 **각 서비스의 workspace(intelligence)에 내용을 업데이트**하는 것으로 처리한다. (예: s1-moduapp-workspace, s1-service-intelligence)

**Why:** ds-extract(시안→컴포넌트/패턴 추출)는 한때 DS 가이드 repo에 있었으나 커밋 fe872ef 에서 제거되고 moduapp-workspace 로 일원화됐다. 서비스 UI 분석·메타데이터화는 별도 intelligence 워크스페이스 소관이고, DS 가이드 repo 에 중복으로 만들면 안 된다.

**How to apply:** "이 서비스 화면/사양 데이터화해줘" 류 요청은 DS 가이드 repo 에서 스크립트·산출물을 새로 만들지 말고, 해당 서비스 intelligence workspace 를 작업 대상으로 삼는다. 썸네일 컨택트 시트 등 "정리 단계 시각 검수" 주제는 다른 창에서 이미 해결됨 — 재착수 금지.
