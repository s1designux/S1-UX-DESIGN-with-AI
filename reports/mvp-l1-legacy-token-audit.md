# MVP-L1 — UX Guide 2.4 Legacy Token Audit

**Date:** 2026-05-18
**Source:** SW UX GUIDE V2.4
**Metadata:** figma-plugin-api
**Phase:** MVP-L1

---

## 1. 목적

S1 UX 디자인가이드 2.4의 현재 Figma Variables를 legacy source snapshot으로 수집하고,
향후 code registry 기반 canonical token 체계로 이전하기 위한 분석을 수행한다.

> **token layer 기준 (이 프로젝트 공식):**
> Foundation Token → Semantic Token → Component Token

---

## 2. 기준 파일

| source | role | path |
|---|---|---|
| UX Guide 2.4 | legacy source snapshot | registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json |
| Darkmode Test | experimental reference only | registry/figma/snapshots/figma-variable-metadata.darkmode-test.json |

**중요:** UX Guide 2.4는 canonical source가 아니라 legacy source snapshot이다.
Code Registry가 최종 source of truth다.

---

## 3. Variables 요약

| 항목 | 개수 |
|---|---:|
| collections | 2 |
| variables (전체) | 419 |
| COLOR variables | 271 |
| Foundation Token COLOR | 133 |
| Semantic Token COLOR | 138 |
| FLOAT / STRING / BOOLEAN | 148 |

> ⚠️ **정정 (MVP-L2):** 초기 MVP-L1 audit에서 Foundation COLOR를 0으로 보고한 것은 오류였습니다.
> classifier가 `collectionName === "Primitive"`로 판별했으나 실제 컬렉션 이름은 "Foundation"이었습니다.
> MVP-L2 재분류 결과: Foundation 133개 / Semantic 138개.
> 상세: `reports/mvp-l2-foundation-reclassification.md`

### Collections

| collectionName | modes | variable 수 |
|---|---|---:|
| `semantic` | LIGHT | 227 |
| `Foundation` | LIGHT / DARK | 192 |

---

## 4. 그룹 분류 (Semantic Token COLOR)

| group | variable 수 |
|---|---:|
| form-control / input | 42 |
| text | 36 |
| button | 21 |
| background / surface | 20 |
| border | 12 |
| status / state | 3 |
| other | 3 |
| overlay / shadow | 1 |

> Foundation Token COLOR 133개는 기본 팔레트이며 Semantic 그룹 집계에서 제외됩니다.
> Foundation 재분류 상세: `reports/mvp-l2-foundation-reclassification.md`

---

## 5. Semantic Variables 상세 + canonical 후보

| legacy Figma Variable | collection | modes | canonical 후보 | confidence |
|---|---|---|---|---|
| `surface/status/main/primary` | semantic | LIGHT | button.primary.default.bg / button.primary.default.text / button.primary.hover.bg / button.primary.pressed.bg / button.primary.disabled.bg | low |
| `surface/status/sub/primary` | semantic | LIGHT | button.primary.default.bg / button.primary.default.text / button.primary.hover.bg / button.primary.pressed.bg / button.primary.disabled.bg | low |
| `surface/status/main/secondary` | semantic | LIGHT | form-control.text.label / button.secondary.default.bg / button.secondary.default.border | low |
| `surface/status/sub/secondary` | semantic | LIGHT | form-control.text.label / button.secondary.default.bg / button.secondary.default.border | low |
| `surface/status/main/tertiary` | semantic | LIGHT | — | no-candidate |
| `surface/status/sub/tertiary` | semantic | LIGHT | — | no-candidate |
| `surface/status/state/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `surface/status/state/error` | semantic | LIGHT | form-control.border.error / color.text.state.error / input.error.border / input.error.text | low |
| `color/control/bg/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/control/bg/default-alt` | semantic | LIGHT | — | no-candidate |
| `color/control/bg/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/control/bg/selected` | semantic | LIGHT | date-picker.cell.selected.bg | high |
| `color/control/bg/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/control/border/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/control/border/default-alt` | semantic | LIGHT | — | no-candidate |
| `color/control/border/selected` | semantic | LIGHT | date-picker.cell.today.border | high |
| `color/control/border/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/control/border/disabled-alt2` | semantic | LIGHT | — | no-candidate |
| `color/control/text/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/control/text/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/control/indicator/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/control/indicator/selected-alt` | semantic | LIGHT | — | no-candidate |
| `color/control/indicator/unselected` | semantic | LIGHT | — | no-candidate |
| `color/control/indicator/unselected-alt` | semantic | LIGHT | — | no-candidate |
| `color/control/indicator/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/text/title/primary` | semantic | LIGHT | button.primary.default.bg / button.primary.default.text / button.primary.hover.bg / button.primary.pressed.bg / button.primary.disabled.bg | low |
| `color/text/title/secondary` | semantic | LIGHT | form-control.text.label | high |
| `color/text/title/tertiary` | semantic | LIGHT | — | no-candidate |
| `color/text/body/primary` | semantic | LIGHT | button.primary.default.bg / button.primary.default.text / button.primary.hover.bg / button.primary.pressed.bg / button.primary.disabled.bg | low |
| `color/text/body/secondary` | semantic | LIGHT | form-control.text.label / button.secondary.default.bg / button.secondary.default.border | low |
| `color/text/body/tertiary` | semantic | LIGHT | — | no-candidate |
| `color/text/state/accent` | semantic | LIGHT | color.text.state.correct | high |
| `color/text/state/correct` | semantic | LIGHT | form-control.border.correct / color.text.state.correct / input.success.border / input.correct.text | low |
| `color/text/state/caution` | semantic | LIGHT | — | no-candidate |
| `color/text/state/caption` | semantic | LIGHT | — | no-candidate |
| `color/text/state/placehoder` | semantic | LIGHT | — | no-candidate |
| `color/text/state/helper` | semantic | LIGHT | color.text.state.helper | high |
| `color/text/state/disabled` | semantic | LIGHT | date-picker.cell.other-month.text | high |
| `color/form-control/label/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/form-control/label/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/button/bg/primary--default` | semantic | LIGHT | button.primary.default.bg | high |
| `color/button/bg/primary--hover` | semantic | LIGHT | button.primary.hover.bg | high |
| `color/button/bg/secondary--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/bg/secondary--default` | semantic | LIGHT | button.secondary.default.bg | high |
| `color/button/bg/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/button/border/primary--default` | semantic | LIGHT | button.primary.default.border | high |
| `color/button/border/primary--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/border/secondary--default` | semantic | LIGHT | button.secondary.default.border | high |
| `color/button/border/secondary--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/border/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/button/label/primary--default` | semantic | LIGHT | button.primary.default.text | high |
| `color/button/label/primary--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/label/secondary--default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/button/label/secondary--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/label/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/button/bg/assist--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/bg/assist--default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/button/border/assist--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/border/assist--default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/button/label/assist--hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/button/label/assist--default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/form-control/text/default` | semantic | LIGHT | form-control.text.default | high |
| `color/form-control/text/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/form-control/text/disabled` | semantic | LIGHT | form-control.text.disabled | high |
| `color/form-control/text/placeholder` | semantic | LIGHT | form-control.text.placeholder | high |
| `color/form-control/bg/default` | semantic | LIGHT | form-control.bg.default | high |
| `color/form-control/bg/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/form-control/bg/disabled` | semantic | LIGHT | form-control.bg.disabled | high |
| `color/form-control/border/default` | semantic | LIGHT | form-control.border.default | high |
| `color/form-control/border/selected` | semantic | LIGHT | form-control.border.selected | high |
| `color/form-control/border/disabled` | semantic | LIGHT | form-control.border.disabled | high |
| `color/form-control/border/correct` | semantic | LIGHT | form-control.border.correct / color.text.state.correct / input.success.border / input.correct.text | low |
| `color/form-control/border/error` | semantic | LIGHT | form-control.border.error | high |
| `color/dropdown/option/bg/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/dropdown/option/bg/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/dropdown/option/bg/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/dropdown/option/bg/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/dropdown/option/label/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/dropdown/option/label/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/dropdown/option/label/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/dropdown/option/label/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/text/state/accent-alt` | semantic | LIGHT | date-picker.cell.selected.text | high |
| `color/dropdown/list/bg` | semantic | LIGHT | form-control.bg.default / form-control.bg.disabled / input.default.bg / input.disabled.bg / button.primary.default.bg / button.primary.hover.bg / button.primary.pressed.bg / button.primary.disabled.bg / button.secondary.default.bg / date-picker.cell.selected.bg / date-picker.cell.default.bg | low |
| `color/dropdown/list/border` | semantic | LIGHT | form-control.border.default / form-control.border.selected / form-control.border.error / form-control.border.correct / form-control.border.disabled / input.default.border / input.focus.border / input.error.border / input.success.border / input.disabled.border / button.secondary.default.border / button.blue-line.default.border / date-picker.cell.today.border | low |
| `color/chip/solid/bg/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/chip/solid/bg/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/chip/solid/bg/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/chip/solid/border/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/chip/solid/border/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/chip/solid/border/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/chip/line/bg/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/chip/line/bg/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/chip/line/bg/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/chip/line/border/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/chip/line/border/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/chip/line/border/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/chip/solid/label/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/chip/solid/label/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/chip/solid/label/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/chip/line/label/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/chip/line/label/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/chip/line/label/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/control/bg/selected-alt` | semantic | LIGHT | date-picker.cell.default.bg | high |
| `color/control/label/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/control/label/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/data/border/strong` | semantic | LIGHT | — | no-candidate |
| `color/data/state/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/data/state/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/data/border/light` | semantic | LIGHT | — | no-candidate |
| `color/pagination/control/bg/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/pagination/control/bg/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/pagination/control/border/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/pagination/control/border/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/pagination/control/border/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/pagination/control/bg/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/control/text/unselected` | semantic | LIGHT | — | no-candidate |
| `color/overlay` | semantic | LIGHT | — | no-candidate |
| `color/navigation/label/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/navigation/label/default-alt` | semantic | LIGHT | — | no-candidate |
| `color/navigation/label/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/navigation/label/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/navigation/background` | semantic | LIGHT | — | no-candidate |
| `color/navigation/indicator/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/navigation/indicator/default-alt` | semantic | LIGHT | — | no-candidate |
| `color/navigation/indicator/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/navigation/indicator/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/dropdown/option/border/default` | semantic | LIGHT | form-control.bg.default / form-control.border.default / form-control.text.default / input.default.bg / input.default.border / button.primary.default.bg / button.primary.default.text / button.secondary.default.bg / button.secondary.default.border / button.blue-line.default.border / button.blue-line.default.text | low |
| `color/dropdown/option/border/hover` | semantic | LIGHT | button.primary.hover.bg | medium |
| `color/dropdown/option/border/selected` | semantic | LIGHT | form-control.border.selected / date-picker.cell.selected.bg / date-picker.cell.selected.text | low |
| `color/control/border/disabled-alt1` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/primary--defualt` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/primary--sub` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/secondary--defualt` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/secondary--sub` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/tertiary--defualt` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/tertiary--sub` | semantic | LIGHT | — | no-candidate |
| `color/status-card/text/disabled` | semantic | LIGHT | form-control.bg.disabled / form-control.border.disabled / form-control.text.disabled / input.disabled.bg / input.disabled.border / input.disabled.text / button.primary.disabled.bg | low |
| `color/status-card/text/error` | semantic | LIGHT | form-control.border.error / color.text.state.error / input.error.border / input.error.text | low |

---

## 6. Migration Status 요약

| migrationStatus | 수 |
|---|---:|
| foundation-candidate | 133 |
| needs-review | 115 |
| mapped | 23 |

---

## 7. 다음 단계

1. **MVP-L2**: `reports/mvp-l2-foundation-reclassification.md` 검토 후 Foundation 재분류 확정
2. 사람이 `needs-review` 항목 검수
3. canonical registry에 없는 token 후보 도출 (dropdown, chip, navigation, pagination)
4. Figma Variable rename/restructure는 별도 단계에서 계획
5. write는 하지 않음
