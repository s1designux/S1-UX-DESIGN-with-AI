# Radio · Toggle 마이그레이션 (Components New)

**출처(정본):** `plugins/figma-vars-installer/src/build-components.ts` — `buildRadio`·`buildToggle`.
설치기가 Figma Variables(color/control/*)로 만드는 컴포넌트 세트 정의 = 신규 Variables 정본 스펙.
(legacy Figma 직접 노드 대신 이 정본 스펙을 기준으로 함 — 사용자 지시 2026-06-11)

## Radio (buildRadio) — control/* 직접 참조
| state | bg | border | dot |
|-------|----|--------|-----|
| Default | control/bg/default | control/border/default | — |
| Hover | control/bg/hover | control/border/default | — |
| Selected | control/bg/default | control/border/selected | control/indicator/selected-alt |
| Disabled | control/bg/disabled | control/border/disabled | — |
| Dis+Selected | control/bg/disabled | control/border/disabled | control/indicator/disabled |
- 형상: circle 18×18(radius 50%), border 1px, dot 10×10. label 14px, control/label/{default,disabled}.
- 이전 오류 정정: default-bg가 form-control→control, hover-border가 control-border-hover(미정의)→default, selected-dot가 action-primary→indicator/selected-alt, disabled-dot가 border-strong→indicator/disabled.

## Toggle (buildToggle) — control/* 직접 참조
| 슬롯 | 토큰 |
|------|------|
| On track | control/bg/selected |
| Off track | control/indicator/unselected |
| Disabled track | control/bg/disabled |
| knob (all) | control/indicator/selected |
- 형상: track 40×20(radius 999), knob 16×16, on x=22 / off x=2.
- 이전 GAP 해소: off-bg가 text-placeholder→indicator/unselected, disabled-bg가 bg-muted→control/bg/disabled.

## 반영 위치
- pages/components-new.html : :root alias, 라이브 CSS(hover 규칙·label), 섹션 HTML(5/4 state 매트릭스), 코드블록·Token Details, nav 버튼, initFromHash.
- registry/components/{radio,toggle}.json : 토큰 control/* 동기화.
