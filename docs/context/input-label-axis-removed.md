---
name: input-label-axis-removed
description: Input 에서 Label 축을 뺀 건 결정 완료 — 라벨은 화면에서 별도 글자로 조합한다 (다시 묻지 말 것)
metadata: 
  node_type: memory
  type: project
  modified: 2026-09-08T02:04:50.751Z
---

Input 컴포넌트에서 **Label 축을 제거하는 것은 river 가 이미 결정했고 정본에 반영이 끝났다** (2026-09-08 이전).
현재 정본 Input 의 축은 `Size × State × Message × Break` 4개뿐이다.

**"라벨을 뺀다" = Input 부품에서 뺀다는 뜻이지, 화면에서 글자를 없앤다는 뜻이 아니다.**
라벨은 화면에서 **별도 텍스트로 따로 배치**한다. 문구·스타일·색·간격은 원본에서 그대로 가져온다.

근거 (전부 저장소에 있음):
- `plugins/figma-vars-installer/src/build-components.ts:904` — "핵심 매트릭스: Size × State × Message × Break. Label은 Input Slots 패턴에서 조합한다."
- `plugins/figma-vars-installer/src/build-components.ts:1063` — "Label은 Input의 variant가 아니며 Input Slots 패턴에서 별도로 조합한다."
- `plugins/figma-vars-installer/src/pattern-data.ts:405~409` — 라벨을 화면의 글자로 따로 놓는 처리 방식과 그 이유
- `registry/components/input.json:14,20` — "Label/Helper combo = Input Slots pattern"

**"Input Slots"는 Figma 라이브러리 부품이 아니다** — 라이브러리를 검색해도 안 나온다(2026-09-08 확인).
"라벨·헬퍼를 Input 바깥에 조합하는 방식"에 붙은 이름일 뿐이다. 부품을 찾으러 가지 말 것.

**Why:** 2026-09-08 세션에서 ⭐ 가 이 결정을 모른 채 "갈아끼우면 '비밀번호' 글자가 사라진다"며
river 에게 선택지로 물었다. river 응답: "라벨은 빼기로 했어. 기억 안나?" — 이미 정해진 것을
결정 사항으로 되물은 것이고, 답은 저장소에 이미 적혀 있었다.

**How to apply:** Input 과 라벨이 얽힌 판단을 하기 전에 위 4곳을 먼저 읽는다.
특히 옛 시안(레거시 Label 축이 있던 세대)을 현재 정본으로 옮길 때, 라벨 있는 인스턴스는
"글자가 사라지는 문제"가 아니라 "별도 텍스트로 옮기는 정해진 절차"로 다룬다.
관련: [[input-state-editing-to-focus]]
