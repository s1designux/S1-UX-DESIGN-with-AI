# MVP4.1 — Input Related Composed Fields

**Status:** Complete  
**Date:** 2026-05-12

---

## Revised Decision

Search Input, Password Field, and Input with Unit are **not** treated as full Patterns.  
They are documented as **Related Composed Fields** under Components > Input.

**Reason:**
- They are composed from Base Input slots and simple auxiliary actions.
- They do not represent full user flows or UI modules.
- Larger flows (e.g., Search Input + Dropdown + Result List) should be documented as Patterns/Modules.

---

## Classification

### Base Input에 포함되는 것

| 상태 | 설명 |
|---|---|
| default | 기본 상태 |
| focus | 입력 중 (border 색상 변화) |
| complete (filled) | 값이 입력된 상태. bg/border = default와 동일 |
| error | 유효성 오류. red border + error message |
| correct (success) | 유효성 성공. blue border + correct message |
| disabled | 비활성 |
| readonly | 읽기 전용 (추후 정의) |

| 슬롯 | 설명 |
|---|---|
| label | 입력 필드 위 레이블 |
| placeholder | 빈 상태 안내 텍스트 |
| helper text | 하단 안내 메시지 |
| error message | 오류 시 하단 메시지 |
| prefix icon slot | 왼쪽 아이콘 영역 |
| suffix icon slot | 오른쪽 아이콘 영역 |
| suffix action slot | 오른쪽 액션 버튼 영역 (clear, toggle 등) |

### Components > Input 하단 Related Composed Fields

| ID | 이름 | 구성 | registry status |
|---|---|---|---|
| `search-input` | Search Input | Base Input + search icon + clear action | candidate |
| `password-field` | Password Field | Base Input + visibility toggle | candidate |
| `input-with-unit` | Input with Unit | Base Input + unit label | candidate |

### 별도 Component 후보 (Input에 포함하지 않음)

| 컴포넌트 | 이유 |
|---|---|
| DatePicker | Picker UI 패턴 별도 구현 필요. MVP5 이후. |
| TimePicker | 동일. figmaNodeId: 6443:4606 |
| Textarea | Multi-line input. registry/components/textarea.json 예정. |

### Pattern / Module 후보

| 패턴 | 설명 |
|---|---|
| Login Form | Input × 2 + Button. 별도 Form 패턴. |
| Search Module | Search Input + Dropdown + Result List. |
| Address Search | Input + API 연동 팝업. |
| Date Range Selection | DatePicker × 2 + 선택 UI. |

---

## Updated Files

| 파일 | 변경 내용 |
|---|---|
| `pages/components.html` | Input 섹션 하단에 Related Composed Fields 섹션 추가 (3-card grid) |
| `registry/components/input.json` | `relatedComposedFields` 배열 추가 (기존 내용 보존) |
| `README.md` | MVP4.1 Input Related Composed Fields 섹션 추가 |
| `CLAUDE.md` | Input Related Composed Fields Rules 추가 |

---

## Validation Checklist

- [x] Components > Input 화면 하단에 Related Composed Fields 섹션 추가됨
- [x] Search Input이 Input 하단에 정리됨
- [x] Password Field가 Input 하단에 정리됨
- [x] Input with Unit이 Input 하단에 정리됨
- [x] 세 항목이 Base Input state/variant로 포함되지 않음
- [x] 세 항목이 full Pattern으로 노출되지 않음
- [x] DatePicker / TimePicker / Textarea는 별도 Component 후보로 남음
- [x] README.md 기존 내용 보존 + 신규 섹션 추가됨
- [x] CLAUDE.md 기존 내용 보존 + 신규 규칙 추가됨
- [x] registry/components/input.json 기존 내용 보존 + relatedComposedFields 병합됨
- [x] registry/patterns/ — 기존 파일 없음 (삭제 불필요)

---

## Next Recommended Steps

1. Confirm Input page structure visually in browser.
2. Proceed with DatePicker / TimePicker / Textarea component candidate review.
3. Add Input-related Source Guard checks (composed-field usage validation) later.
