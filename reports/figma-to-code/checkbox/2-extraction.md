# Checkbox — 2단계 수치 추출 (Extraction)

Figma `color/control/*` Variable = CSS `--color-control-*` (이름 1:1). 색상은 control semantic 직접 참조(컨트롤 전용 레이어).

## 색상 매핑 — Figma 실측 → Variables 정본

| variant | 속성 | Figma 다크 hex | Variable | CSS 토큰 | tokens.css 다크 대조 |
|---------|------|---------------|----------|---------|---------------------|
| default | bg | `#1C1D23` | control/bg/default | `--color-control-bg-default` | gray-dark-100=#1C1D23 ✅ |
| default | border | `#3E4049` | control/border/default | `--color-control-border-default` | gray-dark-500=#3E4049 ✅ |
| hover(Variant5) | bg | `#24252C` | control/bg/hover | `--color-control-bg-hover` | gray-dark-200=#24252C ✅ |
| hover | border | `#3E4049` | control/border/default | `--color-control-border-default` | ✅ (border=default) |
| checked | bg | `#3070D8` | control/bg/selected | `--color-control-bg-selected` | blue-dark-300=#3070D8 ✅ |
| checked | border | `#3070D8` | control/border/selected | `--color-control-border-selected` | blue-dark-300=#3070D8 ✅ |
| checked | check | `#FFFFFF` | control/indicator/selected | `--color-control-indicator-selected` | base-white=#FFFFFF ✅ |
| disabled | bg | `#2E2F38` | control/bg/disabled | `--color-control-bg-disabled` | gray-dark-300=#2E2F38 ✅ |
| disabled | border | `#2E2F38` | control/border/disabled | `--color-control-border-disabled` | gray-dark-300=#2E2F38 ✅ |
| dis+checked | check | `#3E4049` | control/indicator/disabled | `--color-control-indicator-disabled` | gray-dark-500=#3E4049 ✅ |

> **다크 9개 값 전부 tokens.css와 정확 일치.** tokens.css `--color-control-*`가 이 Figma 원본 정본.
> **Light 값:** variable_defs가 다크모드만 반환(파일 현재 모드=Dark). tokens.css light 값(base-white·gray-50·gray-200·gray-300·blue-400)을 사용 — 구조·다크 100% 일치로 정합 확인. Figma 라이트 독립 재확인은 파일 모드 전환 필요(미수행, 투명 보고).

## 라벨 색상

| state | CSS 토큰 | Variable 근거 |
|-------|---------|--------------|
| default | `--color-control-label-default` | control/label/default (gray-800 / gray-dark-800) |
| disabled | `--color-control-label-disabled` | control/label/disabled (gray-300 / gray-dark-600) |

## 크기·형상 (sizing — Foundation 직접 가능)

| 속성 | 값 | 비고 |
|------|----|----|
| box w/h | 18×18px | Figma 18×18 |
| border width | 1px | rect inset 0.5 |
| border radius | rx 1.5 (Figma) | 현재 코드 2px → 1.5px로 정정 검토(🟡 두갈래) |
| check path | `M4 9.41675L7.19502 13.1667L14.125 5.66675` | 원본 그대로 |
| check stroke | width 1.5, linejoin round, color=indicator 토큰 | |
| label font-size | 14px | 현행 유지 |
| gap (box↔label) | 8px | 현행 유지 |

## 신규 토큰 후보

- `--checkbox-hover-bg: var(--color-control-bg-hover)` — **신규** (현재 누락, Figma Variant5 근거)
- 그 외 alias는 현행 `--checkbox-*` 유지(control/* 참조). 신규 Foundation/Semantic 토큰 없음.

## 검문소 2 — 빈칸 없음 ✅ (`MCP 미제공` 0건). 3단계 진행 가능.
