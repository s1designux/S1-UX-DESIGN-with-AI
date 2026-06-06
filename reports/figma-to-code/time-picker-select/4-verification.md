# 4단계 자가대조 결과 — TimePicker Select (timepicker_select 540:3636)

> figma-to-code 4단계 산출물. **검증 전용 — 구현 없음.** 기준: 1-inventory.md · 2-extraction.md.
> 대조 일자: 2026-06-05. 도구: harness:audit + grep + tokens.css resolved 대조.

## 대조 요약

- variant: 6/6 (md·sm × default·focus·disabled) — States matrix 3 state + Sizes md/sm 블록으로 전수 표현. 일치.
- harness-audit: 🔴 0 / 🟡 0 / ✅ 12 PASS.
  - `[SIZE_SPLIT] [time-picker (select형)]` PASS (md (h44) / sm (h28))
  - `[ICON_COLOR] [form-control-icon-default]` PASS · `[ICON_COLOR] [disabled-icon-color]` PASS
  - `[DARK_COMPARE]` 인라인 forced-dark 없음 PASS
- 손그림 chevron(`M1 1l4 4 4-4`) 잔존: 0건. 원본 벡터(`M0.707107 0.707107L4.95711 4.95711L0.707107 9.20711`)로 전수 교체 확인.

## 항목별 판정

### 1. variant 개수 — ✅ PASS
1단계 6개(size 2 × state 3) 전부 harness에 존재.
- States matrix: default(5706) / focus(5719) / disabled(5732)
- Sizes 비교 블록: md(5753) / sm `--group--sm`(5766)

### 2. 색상값 (resolved 대조) — ✅ PASS
모든 Component 토큰이 form-control semantic을 경유하고 resolved 값이 Figma 원본과 일치.

| 속성 | 표 기준 resolved | 구현 토큰 → resolved | 판정 |
|---|---|---|---|
| 박스 bg default | #FFFFFF | form-control-bg-default → base-white #FFFFFF | ✅ |
| 박스 bg disabled | #F5F5F5 | form-control-bg-disabled → gray-50 #F5F5F5 | ✅ |
| border default | #D9D9D9 | form-control-border-default → control-border-default → gray-200 #D9D9D9 | ✅ |
| border focus | #1D6CEB | form-control-border-selected → blue-400 #1D6CEB | ✅ |
| **border disabled (HD-TPS-1)** | **#D9D9D9** | form-control-border-disabled → **control-border-default → gray-200 #D9D9D9** | ✅ (E9E9E9→D9D9D9 변경 반영) |
| 값 텍스트 | #353535 | form-control-text-default → gray-800 #353535 | ✅ |
| 값 텍스트 disabled | #C4C4C4 | form-control-text-disabled → gray-300 #C4C4C4 | ✅ |
| 라벨 | #353535 | form-control-label-default → gray-800 #353535 | ✅ |
| 라벨 disabled | #C4C4C4 | form-control-label-disabled → gray-300 #C4C4C4 | ✅ |
| 화살표 default | #353535 | form-control-icon-default → gray-800 #353535 | ✅ |
| 화살표 disabled | #C4C4C4 | .is-disabled inherit → form-control-text-disabled #C4C4C4 | ✅ |

> tokens.css L437: `--color-form-control-border-disabled: var(--color-control-border-default)` — HD-TPS-1 반영 주석 포함 확인.

### 3. 크기·두께 — ✅ PASS

| 속성 | 표 (md/sm) | 구현 토큰 → resolved | 판정 |
|---|---|---|---|
| 박스 height | 44 / 28 | height-md=spacing-44 / height-xxs=spacing-28 | ✅ |
| radius | 4 / 4 | radius-control-sm=radius-4 | ✅ |
| border-width | 1 / 1 | border-width-default=border-width-1 | ✅ |
| padding md | 8/8/8/16 | block-xxs(8) inline-xxs(8) block-xxs(8) inline-sm(16) | ✅ |
| padding sm | 4/4/4/12 | spacing-4 ×3 / inline-xs(12) | ✅ |
| min-width | 78 / 0 | raw 78px / min-width:0 | ✅ |
| gap 값↔화살표 | 10 / 10 | raw 10px (공통) | ✅ |
| gap 박스↔라벨(unit) | 8 / 4 | 8px / --sm spacing-4(4) | ✅ |
| gap 그룹(cluster) | 16 / 12 | cluster-sm(16) / cluster-xs(12) | ✅ |

### 4. 타이포 — ✅ PASS

| 속성 | 표 (md/sm) | 구현 | 판정 |
|---|---|---|---|
| 값 font-size | 14 / 14 | 14px | ✅ |
| 값 letter-spacing | 0 / -0.28px | md ls:0 (L1267) / --sm ls:-0.28px (L1300) | ✅ |
| 라벨 font-size | 16 / 14 | 16px (L1289) / --sm 14px (L1302) | ✅ |
| line-height | 1.3 | 1.3 | ✅ |

### 5. 아이콘 출처 — ✅ PASS
- 손그림 `M1 1l4 4 4-4`: **0건**. 전수 제거 확인.
- 원본 벡터 `M0.707107 0.707107L4.95711 4.95711L0.707107 9.20711` viewBox `0 0 5.66421 9.91421`, stroke=currentColor, linecap=square — 전 인스턴스 적용.
- CSS 90° 회전(아래)·focus -90°(위) 회전 규칙 적용. 외부 패키지·신규 작도 없음. 규칙 2 충족.

### 6. 토큰 참조 — ✅ PASS
- 색상 전부 Semantic(form-control) 경유. Foundation 색상 직접 참조·raw HEX: 0건 (markup·CSS 블록·코드패널 모두 스캔).
- disabled 라벨 인라인 `style="color:var(--color-form-control-label-disabled)"`는 semantic 토큰 참조(HEX 아님) — 규칙 위반 아님. CSS `+` 선택자와 중복 적용이나 값 동일, 부작용 없음.

## ❌ 불일치 목록
- 없음.

## 🔒 BLOCKED
- 없음 (`MCP 미제공` 빈칸 0건. HD-TPS-1·HD-TPS-2 모두 결정·반영 완료).

## 판정
- ❌ 0건 · 🔒 0건 → **검문소 4 통과 (PASS).**
- 다음 단계: 5단계 다크모드 점검(form-control-border dark = gray-dark-300 #2E2F38 단일화 확인 — tokens.css L615/617 기반).

---

## ⚠️ 사후 수정 — 시각·레이아웃 누락 (2026-06-05, 사용자 제보)

**누락:** 위 1차 대조는 CSS 값만 비교하고 **렌더링 레이아웃을 측정하지 않았다.** 그 결과 다음을 놓침:
- 화살표 아이콘을 6×10 svg로만 넣어 **24px 아이콘 박스(Figma `size-[24px]`)가 누락**. → 필드 내용폭(57px)이 min-width(78px)를 못 채워, flex-start로 화살표가 가운데 뜨고 **우측에 28.3px 빈공간** 발생. Figma는 24px 아이콘이 폭을 채워 화살표가 우측에 붙음.
- 2-extraction 표에 "화살표 아이콘 크기 24px"는 있었으나, 구현은 chevron svg만 24px 없이 넣었고 검증이 이를 렌더에서 확인하지 않음.

**수정:** `.s1-timepicker-select-arrow`에 `width:24px; height:24px`(중앙 정렬) 추가. preview_eval 실측 재확인:
| 항목 | 수정 전 | 수정 후 | Figma 기대 |
|---|---|---|---|
| 화살표 박스 width | 6px | **24px** | 24px |
| 화살표~필드 우측 여백 | 28.3px | **10.3px** (pad8+α) | ~우측 정렬 |
| gap 값↔화살표박스 | 10px | 10px | 10px |

→ 시각·실측 모두 Figma 일치 확인(스크린샷 대조 완료).

**재발 방지:** component-verifier.md·skill Stage 4에 **렌더 레이아웃 실측(preview_eval bounding box) + Figma 스크린샷 시각 대조** 단계 추가.
