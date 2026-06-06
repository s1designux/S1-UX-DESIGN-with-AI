# 2단계 수치 추출 — TimePicker Select (timepicker_select 540:3636)

> figma-to-code 2단계 산출물. Figma MCP `get_variable_defs`(540:3636) + `get_design_context`(md/default 540:3637, sm/default 540:3644, md/editing 540:3651, md/disabled 540:3665) 실측.
> 추정값 없음. 색상 매핑은 token-validator 교차 검증(Foundation resolved 값 대조) 완료.

## 색상 (Primitive → Semantic → Component)

| variant/state | 속성 | Figma 원본값 | Component 토큰 (CSS) | Semantic | Foundation | resolved | 검증 |
|---|---|---|---|---|---|---|---|
| 공통 | 박스 bg (default/focus) | `color/form-control/bg/default` #FFFFFF | `--color-form-control-bg-default` | `--color-surface-default` | `--color-base-white` | #FFFFFF | ✅ 일치 |
| disabled | 박스 bg | `color/form-control/bg/disabled` #F5F5F5 | `--color-form-control-bg-disabled` | `--color-bg-subtle` | `--color-gray-50` | #F5F5F5 | ✅ 일치 |
| default | 박스 border | `color/form-control/border/default` #D9D9D9 | `--color-form-control-border-default` | `--color-control-border-default` | `--color-gray-200` | #D9D9D9 | ✅ 일치 |
| focus (editing) | 활성 박스 border | `color/form-control/border/selected` #1D6CEB | `--color-form-control-border-selected` | `--color-border-focus` | `--color-blue-400` | #1D6CEB | ✅ 일치 |
| disabled | 박스 border | `color/form-control/border/disabled` #D9D9D9 | `--color-form-control-border-disabled` | `--color-border-subtle` | `--color-gray-100` | **#E9E9E9** | ❌ **불일치 (HD-TPS-1)** |
| default/focus | 값 텍스트 "00" | `color/form-control/text/default` #353535 | `--color-form-control-text-default` | `--color-text-secondary` | `--color-gray-800` | #353535 | ✅ 일치 |
| disabled | 값 텍스트 | `color/form-control/text/disabled` #C4C4C4 | `--color-form-control-text-disabled` | `--color-text-disabled` | `--color-gray-300` | #C4C4C4 | ✅ 일치 |
| default/focus | 라벨 시/분 | `color/form-control/label/default` #353535 | `--color-form-control-label-default` | `--color-text-secondary` | `--color-gray-800` | #353535 | ✅ 일치 |
| disabled | 라벨 시/분 | `color/form-control/label/disabled` #C4C4C4 | `--color-form-control-label-disabled` | `--color-text-disabled` | `--color-gray-300` | #C4C4C4 | ✅ 일치 |
| default/focus | 화살표 아이콘 | `color/icon/gray-dark` #353535 | `--color-form-control-icon-default` | (→ `--color-gray-800`) | `--color-gray-800` | #353535 | ✅ 값 일치 |
| disabled | 화살표 아이콘 | `color/icon/gray-light` #C4C4C4 | `--color-form-control-text-disabled` | `--color-text-disabled` | `--color-gray-300` | #C4C4C4 | ✅ 값 일치 |

> **focus(editing)**: 활성(열린) 박스만 border #1D6CEB + 화살표 위로 뒤집힘(`rotate(180deg)`). 나머지 박스는 default 유지. 텍스트·라벨 색상은 default와 동일.

## 크기·간격·반경 (md / sm)

| 속성 | md (Figma) | sm (Figma) | 토큰 |
|---|---|---|---|
| 박스 height | 44px | 28px | md `--sizing-form-control-height-md` / sm `--sizing-form-control-height-xxs` |
| radius | 4px (전 모서리) | 4px | `--radius-control-sm` |
| border-width | 1px | 1px | `--border-width-default` |
| padding-left | 16px | 12px | md `--spacing-padding-inline-sm` / sm `--spacing-padding-inline-xs` |
| padding-right | 8px | 4px | md `--spacing-padding-inline-xxs` / sm `--spacing-4` |
| padding-block | 8px | 4px | md `--spacing-padding-block-xxs` / sm `--spacing-4` |
| min-width | 78px | (없음) | raw 78px (md만) |
| gap 값↔화살표 | 10px | 10px | raw 10px |
| gap 박스↔라벨(unit) | 8px | 4px | md raw 8px / sm `--spacing-4` |
| gap 시그룹↔분그룹(cluster) | 16px | 12px | md `--spacing-cluster-sm` / sm `--spacing-cluster-xs` |
| 화살표 아이콘 크기 | 24px | 24px | raw 24px |

## 타이포

| 텍스트 | md (Figma) | sm (Figma) |
|---|---|---|
| 값 "00" | Pretendard Regular **14px** / lh 1.3 / **ls 0** | Pretendard Regular **14px** / lh 1.3 / **ls -0.28px** (-2%) |
| 라벨 시/분 | Pretendard Regular **16px** / lh 1.3 / ls 0 | Pretendard Regular **14px** / lh 1.3 / ls 0 |

## 아이콘 (원본 강제 — 규칙 2)

| 역할 | Figma 노드 | MCP 제공 형태 | 프로젝트 자산 | 상태 |
|---|---|---|---|---|
| 셀렉트 화살표 | `ic_화살표, 더보기` (563:3158) | **`image/svg+xml` 벡터** (2장: Fill1 빈 path + Stroke2 chevron) | `icons-data.js` 항목 `svg:""` 비어 있음 | ✅ **원본 확보 (아래)** |

**원본 벡터 (MCP 에셋 fetch, content-type image/svg+xml):**
- Fill 1: 빈 path (무시)
- Stroke 2 (실제 화살표): `M0.707107 0.707107L4.95711 4.95711L0.707107 9.20711`, viewBox `0 0 5.66421 9.91421`, stroke `currentColor`(원본 var(--stroke-0,#353535)), `stroke-linecap="square"`, stroke-width 기본 1
- 형태: 우향 chevron `>`. 셀렉트에선 90° 회전 → 아래(`v`). focus(열림) 시 -90° → 위(`^`).
- → 구현 시 이 원본 path를 인라인 SVG로 사용(currentColor 테마 호환). 규칙 2 충족.

---

## 기존 harness 대비 차이 (md는 이미 구현됨 — 완성 대상)

현재 `components.html`의 TimePicker Select 섹션(라인 5657~)은 **md 단일 사이즈**만 구현. Figma 대비 다음 불일치:

| # | 항목 | 현재 코드 | Figma 원본 | 조치 |
|---|---|---|---|---|
| D1 | sm 사이즈 | 없음 | h28 size variant 존재 | **sm 신규 추가** |
| D2 | min-width | 60px | 78px (md) | 78px로 수정 |
| D3 | 라벨 font-size | 14px (전 사이즈) | md 16px / sm 14px | md 16px 분기 |
| D4 | 값 letter-spacing | -0.02em(=-0.28px) 전 사이즈 | md 0 / sm -0.28px | md ls 0 분기 |
| D5 | 화살표 아이콘 | 손으로 그린 인라인 SVG `M1 1l4 4 4-4` | `ic_화살표,더보기` 원본 | needs-decision (아래) |
| D6 | unit gap | 8px(전 사이즈) | md 8px / sm 4px | sm 4px 분기 |
| D7 | group gap | 16px(전 사이즈) | md 16px / sm 12px | sm 12px 분기 |
| D8 | padding | md 기준 고정 | md 16/8/8 · sm 12/4/4 | sm 분기 |

## 🚦 검문소 2 — 결정 필요 항목 (3단계 진입 전)

수치 빈칸(`MCP 미제공`)은 **없음**. 단, 3단계 구현 전 **2건의 결정**이 필요하다.

### HD-TPS-1 — disabled border 토큰 불일치 (공유 토큰)
- Figma `border/disabled` = **#D9D9D9**, 코드 `--color-form-control-border-disabled` → `--color-border-subtle` → gray-100 = **#E9E9E9**.
- 이 토큰은 Input·Select·DatePicker·TimePicker 공유 semantic. 단독 변경 시 전 폼컨트롤에 파급.
- 선택지: (A) Figma 기준으로 `--color-form-control-border-disabled`를 `--color-control-border-default`(gray-200 #D9D9D9)로 변경 — 전 폼컨트롤 영향 / (B) 현행 유지(#E9E9E9) — Figma와 의도적 차이로 기록 / (C) 보류.

### HD-TPS-2 — 화살표 아이콘 원본 미확보 (규칙 2)
- Figma 원본 `ic_화살표,더보기`는 MCP가 만료형 raster URL로만 제공(클린 벡터 아님). `icons-data.js` 항목은 `svg: ""` 비어 있음.
- 선택지: (A) 현 harness의 인라인 chevron SVG 유지(currentColor 테마 호환, 단 규칙 2 deviation) / (B) MCP raster `<img>` 사용(7일 만료 — 가이드 부적합) / (C) 원본 벡터 SVG를 확보해 `icons-data.js`에 채운 뒤 사용(정석, 소스 필요).
