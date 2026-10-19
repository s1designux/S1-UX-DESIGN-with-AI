---
name: project-bg-depth-scale
description: "배경 토큰 = bg/level-0~3 깊이 스케일. surface 드롭, 컴포넌트는 자기 배경 보유"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7f8b8ff5-8456-47cc-b4c3-7cd86bcf1a53
---

배경 토큰 구조(2026-06-30 재구성, river 결정·커밋 8782b99):
- `color/bg/level-0` 흰 #FFFFFF / dark gray-dark/0 #0D0E12 (기본/가장 얕음)
- `color/bg/level-1` #FAFAFA / gray-dark/50
- `color/bg/level-2` #F5F5F5 / gray-dark/100
- `color/bg/level-3` #E9E9E9 / gray-dark/200 (가장 깊음)
- **삭제됨**: color/bg/{default,subtle,muted,selected}, color/surface/{default,raised}.

원리: bg = 화면/레이아웃 **깊이 스케일**(라이트=올라갈수록 어둠, 다크=올라갈수록 밝음, 단조). **surface 드롭** — 카드·셸·모달은 자기 컴포넌트 배경 보유(control/bg·form-control/bg·table/cell 등), 떠있음은 보더/그림자로. bg/selected→테이블은 color/table/cell/selected 사용.

**Why:** "상황 따라 흰/회색 바탕 둘 다, 역할(default)·우선순위(primary) 아닌 깊이로." surface는 실사용 1단계뿐+고아라 드롭. 다크 흰페이지=gd0(가장어둠), 카드=별 토큰.

**How to apply:** build-components 재바인딩 시 surface/default→bg/level-0(다크 gd100→gd0), subtle→level-2, muted→level-3 (라이트색 보존). **다크 시각 변화 있음**(셸/카드 gd100→gd0). 포털(site-base.css)은 자체 bg/surface 정의라 절연 — 안 건드림. 컴포넌트가 아닌 레이아웃 토큰(level-1 등 미사용)은 intentional-unused-tokens.json 등재. [[feedback_token-truth-source-and-drift-gate]] [[feedback_variables_source_of_truth]]
