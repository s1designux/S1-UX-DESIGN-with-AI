# MVP-T2 Not-found Variable Name Review

**Date:** 2026-05-18
**Phase:** MVP-T2

---

## 1. 결론

| 항목 | 결과 |
|---|---|
| sync-ready | 18개 |
| matched | 0개 |
| not-found | 18개 |
| 원인 추정 | registry가 가정한 Figma namespace가 실제 존재하지 않음 |

### 원인 상세

registry의 `figmaVariable` 경로는 MVP-T1 단계에서 Figma Variables 이름을 직접 조회하지 않고 **의미 기반 추정**으로 작성된 경로다.
실제 Figma Variables는 아래 구조를 사용하며, registry가 가정한 namespace 4종이 모두 없다.

| registry가 가정한 namespace | 실제 Figma Variables 구조 |
|---|---|
| `color/form-control/bg/*` | `color/bg/*`, `color/surface/*` (Semantic) |
| `color/form-control/border/*` | `color/border/*` (Semantic) |
| `color/form-control/text/*` | `color/text/*` (Semantic) |
| `color/button/bg/*`, `color/button/label/*` | `color/action/primary/*` (Semantic) |
| `color/control/bg/*`, `color/control/border/*` | `color/bg/*`, `color/border/*` (Semantic) |
| `color/text/state/*` | `color/text/*` (Semantic, state 없이 직접 이름 사용) |

실제 Figma Semantic collection에는 **39개** variables가 있고,
`form-control`, `button`, `control`, `text/state` sub-namespace는 존재하지 않는다.

---

## 2. not-found 18개 비교

| registry id | expected figmaVariable | 유사한 실제 Figma Variable 후보 | 유사도 판단 | 추천 조치 |
|---|---|---|---|---|
| `form-control.bg.default` | `color/form-control/bg/default` | `color/bg/default` | medium — scope 다름(form-control→bg), 의미는 유사 | update-candidate |
| `form-control.bg.disabled` | `color/form-control/bg/disabled` | `color/bg/subtle` 또는 `color/bg/muted` | needs-human — disabled bg 후보 2개 중 선택 필요 | needs-human-check |
| `form-control.border.default` | `color/form-control/border/default` | `color/border/default` | **high** — form-control/ prefix만 제거하면 정확히 일치 | update-candidate |
| `form-control.border.selected` | `color/form-control/border/selected` | `color/border/focus` | **high** — selected(form-control context) = focus state | update-candidate |
| `form-control.border.correct` | `color/form-control/border/selected` | `color/border/correct` | **high** — correct state → `color/border/correct` 존재 확인 | update-candidate |
| `form-control.border.disabled` | `color/form-control/border/disabled` | `color/border/subtle` | medium — subtle이 disabled border에 가장 근접 | needs-human-check |
| `form-control.text.default` | `color/form-control/text/default` | `color/text/secondary` | medium — form-control text default = secondary text | update-candidate |
| `form-control.text.placeholder` | `color/form-control/text/placeholder` | `color/text/placeholder` | **high** — form-control/ prefix만 제거하면 정확히 일치 | update-candidate |
| `form-control.text.disabled` | `color/form-control/text/disabled` | `color/text/disabled` | **high** — form-control/ prefix만 제거하면 정확히 일치 | update-candidate |
| `color.text.state.correct` | `color/text/state/accent` | `color/text/correct` | **high** — accent → correct, text/state/ prefix 제거 | update-candidate |
| `button.primary.default.bg` | `color/button/bg/primary--default` | `color/action/primary/default` | **high** — button/bg/primary--default = action/primary/default | update-candidate |
| `button.primary.default.text` | `color/button/label/primary--default` | `color/action/primary/text` | **high** — button/label = action/primary/text | update-candidate |
| `date-picker.cell.selected.bg` | `color/control/bg/selected` | `color/bg/selected` | **high** — control/ prefix만 제거하면 정확히 일치 | update-candidate |
| `date-picker.cell.today.border` | `color/control/border/selected` | `color/border/focus` | medium — today = focus ring 유사, 또는 `color/border/emphasis` 후보 | needs-human-check |
| `date-picker.cell.selected.text` | `color/text/state/accent-alt` | 후보 없음 | **no-candidate** — accent-alt에 해당하는 Figma Variable 없음 | needs-human-check |
| `date-picker.cell.today.text` | `color/text/state/accent` | `color/text/correct` 또는 `color/icon/accent` | needs-human — today text = accent(파란색?) 의미 불명확 | needs-human-check |
| `date-picker.cell.other-month.text` | `color/text/state/disabled` | `color/text/disabled` | **high** — text/state/ prefix만 제거하면 정확히 일치 | update-candidate |
| `date-picker.cell.default.bg` | `color/control/bg/selected-alt` | `color/bg/subtle` 또는 `color/bg/muted` | needs-human — selected-alt에 해당하는 후보 불명확 | needs-human-check |

---

## 3. 실제 Figma Variables 이름 샘플

### Semantic Collection (매칭 대상)

| actual Figma Variable name | collection | type | 관련 registry 후보 |
|---|---|---|---|
| `color/bg/default` | Semantic | COLOR | form-control.bg.default 후보 |
| `color/bg/subtle` | Semantic | COLOR | form-control.bg.disabled / date-picker.cell.default.bg 후보 |
| `color/bg/muted` | Semantic | COLOR | form-control.bg.disabled 후보 |
| `color/bg/elevated` | Semantic | COLOR | — |
| `color/bg/home` | Semantic | COLOR | — |
| `color/bg/selected` | Semantic | COLOR | date-picker.cell.selected.bg 후보 |
| `color/surface/default` | Semantic | COLOR | — |
| `color/surface/raised` | Semantic | COLOR | — |
| `color/text/primary` | Semantic | COLOR | — |
| `color/text/secondary` | Semantic | COLOR | form-control.text.default 후보 |
| `color/text/tertiary` | Semantic | COLOR | — |
| `color/text/caption` | Semantic | COLOR | — |
| `color/text/placeholder` | Semantic | COLOR | **form-control.text.placeholder 후보 (high)** |
| `color/text/helper` | Semantic | COLOR | — |
| `color/text/link` | Semantic | COLOR | — |
| `color/text/correct` | Semantic | COLOR | **color.text.state.correct 후보 (high)** |
| `color/text/danger` | Semantic | COLOR | — |
| `color/text/disabled` | Semantic | COLOR | **form-control.text.disabled / date-picker.cell.other-month.text 후보 (high)** |
| `color/text/inverse` | Semantic | COLOR | — |
| `color/border/subtle` | Semantic | COLOR | form-control.border.disabled 후보 |
| `color/border/default` | Semantic | COLOR | **form-control.border.default 후보 (high)** |
| `color/border/strong` | Semantic | COLOR | — |
| `color/border/emphasis` | Semantic | COLOR | date-picker.cell.today.border 후보 |
| `color/border/focus` | Semantic | COLOR | **form-control.border.selected 후보 (high)** |
| `color/border/white` | Semantic | COLOR | — |
| `color/border/danger` | Semantic | COLOR | — |
| `color/border/correct` | Semantic | COLOR | **form-control.border.correct 후보 (high)** |
| `color/icon/default` | Semantic | COLOR | — |
| `color/icon/muted` | Semantic | COLOR | — |
| `color/icon/emphasis` | Semantic | COLOR | — |
| `color/icon/accent` | Semantic | COLOR | date-picker.cell.today.text 후보(불확실) |
| `color/icon/inverse` | Semantic | COLOR | — |
| `color/icon/danger` | Semantic | COLOR | — |
| `color/action/primary/default` | Semantic | COLOR | **button.primary.default.bg 후보 (high)** |
| `color/action/primary/hover` | Semantic | COLOR | — |
| `color/action/primary/pressed` | Semantic | COLOR | — |
| `color/action/primary/text` | Semantic | COLOR | **button.primary.default.text 후보 (high)** |
| `color/action/primary/subtle` | Semantic | COLOR | — |
| `color/overlay` | Semantic | COLOR | — |

### Primitive Collection (참고)

107개 color primitives (gray/0~900, blue/50~500, red/50~500 등). 매칭 대상 아님.

---

## 4. 추천 mapping 보정안

### High confidence — 사람이 확인 후 바로 적용 가능

| registry id | 기존 figmaVariable | 추천 figmaVariable | 판단 |
|---|---|---|---|
| `form-control.border.default` | `color/form-control/border/default` | `color/border/default` | update-candidate |
| `form-control.border.selected` | `color/form-control/border/selected` | `color/border/focus` | update-candidate |
| `form-control.border.correct` | `color/form-control/border/selected` | `color/border/correct` | update-candidate |
| `form-control.text.placeholder` | `color/form-control/text/placeholder` | `color/text/placeholder` | update-candidate |
| `form-control.text.disabled` | `color/form-control/text/disabled` | `color/text/disabled` | update-candidate |
| `color.text.state.correct` | `color/text/state/accent` | `color/text/correct` | update-candidate |
| `button.primary.default.bg` | `color/button/bg/primary--default` | `color/action/primary/default` | update-candidate |
| `button.primary.default.text` | `color/button/label/primary--default` | `color/action/primary/text` | update-candidate |
| `date-picker.cell.selected.bg` | `color/control/bg/selected` | `color/bg/selected` | update-candidate |
| `date-picker.cell.other-month.text` | `color/text/state/disabled` | `color/text/disabled` | update-candidate |

**total: 10개 update-candidate**

### Medium confidence — 사람이 확인 필요

| registry id | 기존 figmaVariable | 추천 figmaVariable | 판단 |
|---|---|---|---|
| `form-control.bg.default` | `color/form-control/bg/default` | `color/bg/default` | needs-human-check |
| `form-control.text.default` | `color/form-control/text/default` | `color/text/secondary` | needs-human-check |

**비고:** `form-control.bg.default`는 흰색 배경이 맞다면 Primitive `color/base/white`가 더 정확할 수 있다. Figma에서 직접 확인 필요.

### Human decision 필요

| registry id | 기존 figmaVariable | 후보 | 판단 |
|---|---|---|---|
| `form-control.bg.disabled` | `color/form-control/bg/disabled` | `color/bg/subtle` 또는 `color/bg/muted` | needs-human-check |
| `form-control.border.disabled` | `color/form-control/border/disabled` | `color/border/subtle` 또는 `color/border/default` | needs-human-check |
| `date-picker.cell.today.border` | `color/control/border/selected` | `color/border/focus` 또는 `color/border/emphasis` | needs-human-check |
| `date-picker.cell.today.text` | `color/text/state/accent` | `color/text/correct` 또는 `color/icon/accent` | needs-human-check |
| `date-picker.cell.selected.text` | `color/text/state/accent-alt` | 후보 없음 | no-candidate |
| `date-picker.cell.default.bg` | `color/control/bg/selected-alt` | `color/bg/subtle` 또는 `color/bg/muted` | needs-human-check |

---

## 5. 구조적 발견 요약

| 패턴 | registry 가정 | 실제 Figma 구조 | 보정 방향 |
|---|---|---|---|
| Form control bg | `color/form-control/bg/*` | `color/bg/*` (Semantic) | `form-control/` prefix 제거 |
| Form control border | `color/form-control/border/*` | `color/border/*` (Semantic) | `form-control/` prefix 제거 |
| Form control text | `color/form-control/text/*` | `color/text/*` (Semantic) | `form-control/` prefix 제거 |
| Button | `color/button/bg/*`, `color/button/label/*` | `color/action/primary/*` | button → action/primary 매핑 |
| Control (date-picker) | `color/control/bg/*`, `color/control/border/*` | `color/bg/*`, `color/border/*` | `control/` prefix 제거 |
| Text state | `color/text/state/*` | `color/text/*` (직접 이름 사용) | `state/` segment 제거 |

---

## 6. 다음 액션

1. **High confidence 10개 확인** — 위 추천 mapping 검토 후 동의하면 `figma-css-token-map.json` 보정
2. **Human decision 6개 Figma 직접 확인** — Figma Variables 패널에서 실제 값 비교 (특히 disabled bg/border, date-picker accent 계열)
3. **`date-picker.cell.selected.text`** — `color/text/state/accent-alt`에 해당하는 Figma Variable이 없음. Figma에서 DatePicker selected cell text color variable 직접 확인 필요
4. **확정된 항목만 `figma-css-token-map.json`의 `figmaVariable` 보정**
5. **보정 후 `npm run figma:match` 재실행** → matched 수 확인
