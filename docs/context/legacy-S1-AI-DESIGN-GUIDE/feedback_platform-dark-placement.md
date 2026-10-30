---
name: feedback-platform-dark-placement
description: "설치기 Platform 컴포넌트 다크 스펙 배치 — 좁은 건 라이트 우측, 넓은 건 아래"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7f8b8ff5-8456-47cc-b4c3-7cd86bcf1a53
---

설치기(`build-components.ts`) Platform 셸 컴포넌트의 **다크 스펙 프레임 배치 규칙** (river 결정 2026-06-25):
- **좁은 것 = 다크를 라이트 우측**: StatusBar · NavBar · CI
- **넓은 것 = 다크를 라이트 아래**: LoginGNB · WebTabBar · Footer

**Why:** river가 Figma 캔버스에서 StatusBar/NavBar 다크를 우측에 두길 원함. 그런데 한 병렬 세션이 `buildStatusBar`/`buildNavBar`에 `opts.darkOffset = { x:0, y:lightBottomY+80 }`(=아래)를 추가해 정반대로 만들고 있었음 → 같은 파일을 두 세션이 반대 방향으로 편집하는 충돌 발생.

**How to apply:** 우측 배치 = `buildSpec`의 기본값(`frame.x = darkOffset?.x ?? (W+80)`). 즉 **그 컴포넌트 빌더에서 `opts.darkOffset` 를 설정하지 않으면 우측**, 설정하면 그 위치(보통 아래). 좁은 Platform 컴포넌트(StatusBar/NavBar/CI)에는 darkOffset 를 넣지 말 것. 이 규칙을 되돌리는(=StatusBar/NavBar에 darkOffset below 재추가) 변경이 보이면 충돌이므로 river에게 확인. build-components.ts 구조 변경이라 검증은 component-verifier 분리(Gate 13). [[project_core-page-section-layout]] [[feedback_parallel-sessions-commit-together]]
