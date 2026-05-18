# MVP-T2 Figma Variable Metadata Report

**Date:** 2026-05-18
**Status:** metadata-collected
**Phase:** MVP-T2

---

## 1. 목적

Figma Variables metadata를 수집하고,
MVP-T1/T2 token mapping registry와 매칭 가능 여부를 점검한다.

---

## 2. 결론

- **실제 write 활성화 여부: 보류**
- metadata 수집 방식: `figma-plugin-api`
- Figma 파일 참조: `S1VaaS — Screen Designs`
- write API 사용 여부: **사용하지 않음**
- PAT 저장 여부: **저장하지 않음**

---

## 3. 수집 결과 요약

| 항목 | 개수 |
|---|---:|
| variable collections | 2 |
| variables (전체) | 146 |
| COLOR variables | 146 |
| FLOAT / STRING / BOOLEAN | 0 |

### Collections

| collectionName | collectionId | modes | variable 수 |
|---|---|---|---:|
| `Primitive` | `VariableCollectionId:87:292` | Light / Dark | 107 |
| `Semantic` | `VariableCollectionId:87:400` | Light / Dark | 39 |

---

## 4. sync-ready 항목 metadata 매칭 결과 (18개)

| id | figmaVariable | collectionName | matchStatus | 비고 |
|---|---|---|---|---|
| `form-control.bg.default` | `color/form-control/bg/default` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.bg.disabled` | `color/form-control/bg/disabled` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.border.default` | `color/form-control/border/default` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.border.selected` | `color/form-control/border/selected` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.border.correct` | `color/form-control/border/selected` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.border.disabled` | `color/form-control/border/disabled` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.text.default` | `color/form-control/text/default` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.text.placeholder` | `color/form-control/text/placeholder` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `form-control.text.disabled` | `color/form-control/text/disabled` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `color.text.state.correct` | `color/text/state/accent` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `button.primary.default.bg` | `color/button/bg/primary--default` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `button.primary.default.text` | `color/button/label/primary--default` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `date-picker.cell.selected.bg` | `color/control/bg/selected` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `date-picker.cell.today.border` | `color/control/border/selected` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `date-picker.cell.selected.text` | `color/text/state/accent-alt` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `date-picker.cell.today.text` | `color/text/state/accent` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `date-picker.cell.other-month.text` | `color/text/state/disabled` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |
| `date-picker.cell.default.bg` | `color/control/bg/selected-alt` | — | ❌ not-found | Figma Variables에 해당 이름 없음. 컬렉션명 또는 이름이 다를 수 있음. |

### 매칭 통계

| matchStatus | 수 |
|---|---:|
| ✅ matched | 0 |
| ⚠️ dedup-required | 0 |
| ⚠️ duplicate-name | 0 |
| ⚠️ mode-missing | 0 |
| ❌ not-found | 18 |
| ❌ type-mismatch | 0 |

---

## 5. 문제/주의 항목

| 항목 | 문제 | 조치 |
|---|---|---|
| form-control.border.selected / form-control.border.correct | 동일 Figma Variable (`color/form-control/border/selected`) 공유 | write 시 dedup 필요 — 1회만 실행 |
| date-picker.cell.today.text / color.text.state.correct | 동일 Figma Variable (`color/text/state/accent`) 공유 | write 시 dedup 필요 — 1회만 실행 |
| form-control.bg.default | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.bg.disabled | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.border.default | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.border.selected | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.border.correct | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.border.disabled | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.text.default | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.text.placeholder | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| form-control.text.disabled | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| color.text.state.correct | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| button.primary.default.bg | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| button.primary.default.text | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| date-picker.cell.selected.bg | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| date-picker.cell.today.border | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| date-picker.cell.selected.text | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| date-picker.cell.today.text | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| date-picker.cell.other-month.text | not-found | Figma에서 Variable 이름 직접 확인 필요 |
| date-picker.cell.default.bg | not-found | Figma에서 Variable 이름 직접 확인 필요 |

---

## 6. 아직 write 보류 사유

- variableId / collectionId / modeId 매칭 결과를 사람이 직접 확인해야 함
- dedup-required 항목 처리 전략 미결
- not-found 항목은 Figma 내 실제 이름 재확인 필요
- write 로직은 별도 승인 후 guarded 방식으로 구현해야 함
- manifest.json의 `permissions`에 `variables:write` 미추가 상태

---

## 7. 다음 단계

1. `registry/figma/figma-variable-metadata.patch.json` 검수
2. matchStatus: matched 항목만 registry에 figma metadata 반영
3. `writeStatus: metadata-required` → `write-ready` 후보 전환
4. dedup-required 항목 처리 전략 결정
5. not-found 항목 Figma 이름 재확인 (Figma Variables 패널)
6. 사람 최종 승인 후 guarded write 구현 검토

---

## 8. 파일 위치

| 파일 | 역할 |
|---|---|
| `registry/figma/figma-variable-metadata.local.json` | raw 수집 결과 (gitignore) |
| `registry/figma/figma-variable-metadata.patch.json` | 매칭 결과 + patch 후보 (검수 후 registry 반영) |
| `registry/figma/figma-variable-metadata.sample.json` | API 응답 구조 샘플 (PAT 없이 구조 파악용) |
