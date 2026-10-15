---
name: feedback-token-truth-source-and-drift-gate
description: 토큰 사실 판단은 vars-data(값)+build-components(컴포넌트 사용)만 정본. registry 설명 데이터는 stale 가능 — Gate 20 drift 게이트가 기계로 추적
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7f8b8ff5-8456-47cc-b4c3-7cd86bcf1a53
---

토큰이 "어디서 쓰이나/무슨 값인가"를 판단할 때 **정본은 단 둘**: `plugins/figma-vars-installer/src/vars-data.ts`(토큰 값) + `build-components.ts`(컴포넌트 실사용). `registry/tokens/component.tokens.json`·`registry/components/*.json`·가이드 페이지의 토큰표는 **설명용(descriptive)이라 drift(stale) 가능** — 사실 근거로 쓰지 말 것.

**Why:** registry/components/table.json 이 figmaVariable 엔 정본(color/table/cell/*)을 적고 value 엔 옛 color/bg|surface/* 를 가리켜, grep 한 나(AI)를 반복 오도함(2026-06-30 table-row 사태). 실제 테이블은 color/table/cell/* 사용. registry 컴포넌트 설명층 전반이 옛 토큰 모델 잔재(154~209건).

**How to apply:** ①토큰 사실은 vars-data/build-components 먼저 확인. ②registry 설명데이터는 drift 가능성 전제. ③**Gate 20 (token-drift-check.js)** 가 기계로 강제: 기준=build-components mock 실사용 토큰, registry 가 "컴포넌트 안 쓰는 토큰" 언급 시 차단(baseline ratchet — 알려진 backlog는 경고·개수, 새 stale 추가만 ❌차단). baseline=registry/governance/registry-drift-baseline.json, 줄면 `node scripts/token-drift-check.js --update-baseline`. ④registry 컴포넌트 파일은 가이드 렌더·게이트가 읽어서 삭제 못 함(격리 X) — 내용만 점진 정정. [[feedback_variables_source_of_truth]] [[project_component-leaf-key-validation]]
