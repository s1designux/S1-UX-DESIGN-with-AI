---
name: feedback_figma-canvas-font-consistency
description: "use_figma 캔버스 텍스트는 Pretendard 정본 필수, 라벨 override 후 텍스트스타일 재바인딩, 폰트는 렌더 아닌 데이터로 검증, 3층 방어"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: fedc4770-84ad-4807-b553-98496e30bcd8
---

use_figma 로 Figma 캔버스에 author/override 하는 텍스트의 폰트는 **항상 Pretendard 정본**이어야 한다. 인스턴스 라벨(탭·버튼 등)을 override 할 때 Pretendard 가 MCP 에서 로드 불가라 Noto 로 일시 입력하면, **반드시 `setTextStyleIdAsync`로 정본 텍스트 스타일을 재바인딩**해 최종 폰트를 Pretendard 로 되돌려야 한다(폰트 직접 로드 불필요·검증됨). 빠뜨리면 그 라벨만 Noto 로 박힌다.

**Why:** datepicker 재구성 시 탭(날짜·시간)·버튼(적용) 라벨을 Noto 로 덮고 재바인딩을 빠뜨려 3개만 Noto 로 남음 → 토큰 게이트 전부 통과(폰트는 Figma 캔버스 노드라 파일 게이트 1~15·pre-commit 전부 사각지대) → 사용자가 Figma Desktop 에서 폰트 불일치 발견. 처음엔 "렌더 폴백 현상"이라 오판했으나, 데스크톱(Pretendard 설치)에서도 안 맞아 실제 버그로 확인. hex 와 동일 계열 사각지대(use_figma 직접 쓰기).

**How to apply:**
- **폰트는 렌더 아닌 데이터로 검증.** MCP 렌더는 Pretendard 미설치라 Noto/Pretendard 를 둘 다 대체폰트로 그려 구분 불가. 노드 `getStyledTextSegments(['fontName'])`·`textStyleId` 만 신뢰. (레이아웃·시각깨짐=렌더, 폰트정체성=데이터 — 실패모드별 도구 다름)
- **3층 방어:** L1 예방=PreToolUse 훅 `scripts/figma-code-font-check.js`(비-Pretendard family 는 줄 끝 `// figma-font-temp:` 마커 필수, 없으면 exit2 차단) · L2 탐지=`.claude/skills/figma-library-build/references/figma-font-scan.md`(전 TEXT 노드 스캔, 비-Pretendard 0건) · L3 집행=`component-verifier` §(C)/(B) 필수 항목(비-Pretendard 1건=❌(a)).
- 정본 = `registry/governance/figma-font-policy.json`(canonicalFamily·tempAllowedFamilies·marker·weightStyleMap: Medium14→body/14M·Medium16→body/16M·Bold20→title/20B).
- 한계(정직히): 캔버스는 레포에 없어 커밋 시점 게이트 불가 — 세션 중 검증자 스캔이 유일 보증. 사람 수동 편집은 범위 밖.
- 관련: [[feedback_figma-nodes-must-bind-variables]](색 hex 사각지대, 같은 PreToolUse 훅 패턴) · [[feedback_pattern-text-uses-figma-textstyle]](텍스트스타일 바인딩) · [[project_reverse_figma_v3]]
