---
name: feedback_figma-nodes-must-bind-variables
description: "use_figma로 그리는 모든 Figma 노드 색은 Variable 바인딩 필수, 하드코딩 hex 금지 — 검토/스펙 프레임도 예외 없음, PreToolUse 훅이 기계 차단"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 11316f5c-85d2-47c0-96d6-1f879a31c95e
---

`use_figma`로 Figma에 그리는 **모든 노드의 색(fill·stroke·텍스트)은 Variable 바인딩**이어야 한다. 하드코딩 hex(`#RRGGBB`) 금지. **용도 불문** — 라이브러리 컴포넌트뿐 아니라 검토용 프레임·스펙 프레임·레이아웃 프레임도 동일.

**Why:** 검토용 프레임도 결국 라이브러리화되므로 처음부터 바인딩해야 한다(사용자 결정 2026-06-22). 기존 방어막(Gate 3·12·pre-commit)은 전부 "파일"만 검사하는데 use_figma는 파일을 거치지 않고 Figma에 직접 써서 사각지대였다. 게다가 "검토 프레임이니 라이브러리 빌드 아님"이라고 자기분류하면 figma-library-build 스킬/에이전트 경로마저 건너뛴다. 그 결과 Calendar Cell/Tile 검토 프레임이 hex로 2회 유출됐다.

**How to apply:**
- fill/stroke: `const v=figma.variables.getVariableById(ID); n.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',v)]`
- 정본에 토큰이 없으면 임의 hex 금지 → 신규 Variable을 Foundation alias로 먼저 생성(`createVariable`+`setValueForMode`) 후 바인딩. 그래도 모호하면 needs-decision 보고.
- 다크 프레임은 `setExplicitVariableModeForCollection(collectionId, darkModeId)`로 Dark 모드 강제.
- **예외:** 검토 프레임의 회색 배경·열 라벨 같은 순수 장식 크롬(컴포넌트 부품 아님)만 줄 끝 `// figma-hex-allow: <사유>` 마커. 셀·타일·아이콘·버튼 등 부품 색은 마커 우회 금지.
- **집행(기계 강제):** PreToolUse 훅이 `scripts/figma-code-hex-check.js`로 use_figma 코드를 실행 직전 스캔 → hex면 exit 2로 차단. `.claude/settings.json` PreToolUse(matcher `use_figma`)에 등록됨. CLAUDE.md §⚖️ 하드룰 + ⚙️ Hooks 표에 정본화.
- V2.4↔V3.0은 라이브러리 공유 안 됨(`importComponentByKeyAsync` 실패) → V3.0에 그릴 땐 V3.0 로컬 Variable(Foundation V2 `8:709`·Semantic Color V2 `8:963`)을 쓴다.

관련: [[feedback_variables_source_of_truth]] · [[feedback_visual_verification]] · [[project_reverse_figma_v3]] · [[feedback_show_agent_gate_flow]]
