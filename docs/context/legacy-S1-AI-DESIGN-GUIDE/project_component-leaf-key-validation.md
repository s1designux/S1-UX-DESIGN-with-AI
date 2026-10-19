---
name: project_component-leaf-key-validation
description: build-components.ts 빌더가 동적 조합하는 scv 키가 vars-data 정본에 다 있는지 검증하는 법 (audit-bindings 사각지대)
metadata: 
  node_type: memory
  type: project
  originSessionId: 16998546-40ec-42e8-9577-239e1dad7b92
---

`scripts/audit-bindings.js`는 `build-components.ts`의 색 키를 **네임스페이스 수준**(`color/chip/`)으로만 검사한다. 빌더가 `color/chip/${v}/border/${ss.bd}`처럼 **동적 조합하는 개별 leaf 키**(예: `color/chip/solid/border/hover`)가 vars-data SEMANTIC_COLOR에 없으면, audit는 통과하지만 **Figma 플러그인 실행 중 `requireVar`가 "변수 누락" 오류로 전체 빌드를 중단**시킨다.

**검증 = Gate 8 (`npm run components:keycheck`, scripts/component-key-coverage-check.js).** gate:check·pre-commit에 포함. 누락 시 exit 1로 커밋 차단. 직접 돌릴 필요 없이 이 명령이 정답. (내부 동작: esbuild로 build-components.ts를 CJS 번들 → mock figma(만능 auto-stub Proxy)+키 기록 maps 프록시로 `await buildAllComponents(maps)` 실행 → 요청 키 − vars-data `"color/…"`/number 리터럴 = 누락. **반드시 await — async 빌더라 키가 마이크로태스크에 걸쳐 수집됨.**)

**실제 사례(2026-06-12):** `buildFilterChip` solid Hover가 `bd:"hover"`로 `color/chip/solid/border/hover` 요청 → 미정의. 정본 Chip([:650])·FilterChip line variant는 둘 다 Hover→`bd:"default"`였음. solid도 default로 정렬해 해소(토큰 신설 없이 내부 일관성 복원). 토큰 신설은 추측 금지 원칙상 회피. 이 사례가 Gate 8 신설 계기.

관련: [[project_components-new-replaces-components]] (정본 스펙=build-components.ts), [[feedback_token_value_autosync]].
