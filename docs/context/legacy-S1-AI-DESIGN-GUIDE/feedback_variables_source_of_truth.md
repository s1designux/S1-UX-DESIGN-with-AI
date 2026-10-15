---
name: feedback_variables_source_of_truth
description: "역방향(코드→Figma) 작업의 바인딩 정본은 Variables(vars-data.ts), tokens.css는 레거시·오류라 쓰지 말 것"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2c4b6d19-424c-4233-ad3e-12e019b55c01
---

역방향 컴포넌트 생성에서 **색·바인딩의 유일한 정본은 Figma Variables = `plugins/figma-vars-installer/src/vars-data.ts`** 다. `assets/css/tokens.css`(및 components.html의 `--checkbox-*`/`--radio-*` 같은 컴포넌트 토큰, `--color-action/bg/border/*` 역할 토큰)는 **레거시이며 잘못된 정보**라 바인딩 결정에 사용 금지.

**How to apply:** 각 컴포넌트는 vars-data에 존재하는 **자기 네임스페이스 슬롯**에 직접 바인딩한다 — checkbox/radio/toggle→`color/control/*`, input/select/textarea→`color/form-control/*`, chip/filter-chip→`color/chip/*`, dropdown→`color/dropdown/*`, date/time-picker→`color/date-picker/*`, table→`color/data/*`, nav/tab/gnb→`color/navigation/*`, pagination→`color/pagination/*`. 슬롯 이름(bg/border/indicator/label/text + 상태)으로 상태를 매칭하고, Figma 참고 노드(평면 이미지라 매트릭스·시각만 제공)로 변형 구성을 확인한다.

**Why:** tokens.css를 추적하면 vars-data에 없는 역할 토큰(action/bg/border/text-placeholder)으로 빠져 "변수 없음" 막힘이 생긴다 — 이는 잘못된 출처를 본 것. 사용자가 명시적으로 "tokens.css 지우고 variables 최신 데이터 기준" 지시(2026-06-11). 참고 노드가 평면 이미지인 건 구조가 아니라 매트릭스 확인용.

**자동 검수 (2026-06-11 신설, 반복 위반으로 사용자 지시):** `scripts/audit-bindings.js` (`npm run installer:audit`, installer:build 가 빌드 전 강제 실행 → 위반 시 빌드 중단). 두 규칙: ① build-components.ts 의 모든 color/number 슬롯 네임스페이스가 vars-data 정본에 실재 + tokens.css 토큰(--color-/--input-/--button-… , "tokens.css") 직접참조 0. ② **comp.name 에 Break= 를 쓰는(플랫폼 구분) 빌더는 반드시 그룹형 스펙(buildGroupedSpec/decorateSetGrouped) 사용** — 평면 쓰면 PC/Mobile 이 한 줄에 섞이므로 위반(Button 스펙 레이아웃 기준). 새 컴포넌트 추가 시 이 audit 통과가 완료 조건. tokens.css 파일 자체는 HTML 사이트가 쓰므로 삭제 안 함(생성 파이프라인은 더 이상 미참조).

관련: [[project_reverse_figma_v3]]
