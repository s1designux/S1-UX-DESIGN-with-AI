# Checkbox — 1단계 재고조사 (Inventory)

- **Figma 파일:** `Tnihi6lixRR47N4RSAwUbF` (-에스원- GUI)
- **컴포넌트 세트 노드:** `1459:16409` (Checkbox), 186×50, 박스 18×18
- **현재 Figma 파일 모드:** Dark (variable_defs가 다크값 반환)
- **목적:** 시범 재구성 — Variables 정본(`control/*`) 직접 참조 + Figma 컴포넌트 세트 직접 대조

## Variant 목록 (총 5개)

| # | Figma 이름 | nodeId | 코드 state | bg (Variable) | border (Variable) | check icon (Variable) |
|---|-----------|--------|-----------|---------------|-------------------|----------------------|
| 1 | Default | 1459:16410 | unchecked(default) | `control/bg/default` | `control/border/default` | — |
| 2 | **Variant5** | 1514:13308 | **hover** ※확정 | `control/bg/hover` | `control/border/default` | — |
| 3 | Checked | 1459:16414 | checked | `control/bg/selected` | `control/border/selected` | `control/indicator/selected` |
| 4 | Disabled | 1459:16422 | disabled(unchecked) | `control/bg/disabled` | `control/border/disabled` | — |
| 5 | Dis+Checked | 1459:16426 | disabled+checked | `control/bg/disabled` | `control/border/disabled` | `control/indicator/disabled` |

> **Variant5 = hover 확정:** SVG 실측 — fill `#24252C`(=control/bg/hover), stroke `#3E4049`(=control/border/default). default 대비 **bg만** 변하고 border는 default 유지. (`control/border/hover` Variable 없음)

## 아이콘 / 형상

- 각 variant는 Figma에서 **평면 SVG**로 export됨 (분리된 체크마크 노드 없음 — 박스+체크가 한 SVG).
- **체크마크 path (원본):** `M4 9.41675L7.19502 13.1667L14.125 5.66675`, `stroke-width="1.5"`, `stroke-linejoin="round"`
- **박스 형상:** viewBox 18×18, rect inset 0.5 → 1px 테두리, 내부 17×17, `rx="1.5"`
- MCP가 분리 체크마크 SVG를 주지 않음 → 위 path를 그대로 사용(원본 강제, 규칙 2 충족).

## 현 구현 대비 발견 (3단계 반영 대상)

| 항목 | Figma 원본 | 현재 components.html | 분류 |
|------|-----------|---------------------|------|
| **hover 상태** | Variant5 존재(bg=control/bg/hover) | **누락** — `--checkbox-hover-border` 정의됐으나 미사용, hover-bg 토큰·`:hover` 규칙 없음 | ❌ 누락 → 추가 |
| default/checked/disabled/dis+checked | control/* 바인딩 | control/* 직접 참조(미커밋 diff) — **일치** | ✅ |
| 박스 radius | rx 1.5 | 2px | 🟡 경미(두갈래 — 값 차이) |
| 체크마크 | 위 path, sw 1.5 | ds-chk-icon SVG (path 대조 필요) | 4단계 확인 |

총 **5 variant** — 사용자 확인 요청.
