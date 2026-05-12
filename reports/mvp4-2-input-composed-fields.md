# MVP4.2 — Input Composed Fields Slot Correction

**Status:** Complete  
**Date:** 2026-05-12

---

## 배경

MVP4.1에서 Related Composed Fields를 등록했으나, Search Input의 slot 구조가 Figma 기준과 다르게 구현되었습니다.

**오류 내용:** Search Input에서 검색 아이콘을 왼쪽 `prefixIcon`으로 배치 → Figma 기준 위반

---

## 정정 내용

### Search Input

| 항목 | MVP4.1 (잘못됨) | MVP4.2 (정정) |
|---|---|---|
| 검색 아이콘 위치 | 왼쪽 prefixIcon | 오른쪽 suffixActionGroup |
| 슬롯 구조 | `prefix-icon:search` + `suffix-action:clear` | `suffixActionGroup: clearAction + searchAction` |
| 상태 프리뷰 | 1개 (아이콘 left, clear right) | 2개 — Empty / Filled |

**Empty 상태:** `[ placeholder text          🔍 ]`  
**Filled 상태:** `[ SW 디자인시스템    ✕  🔍 ]`

- searchAction: 항상 오른쪽 끝 고정
- clearAction: 값이 있을 때만 표시, searchAction 왼쪽

### Password Field

| 항목 | MVP4.1 | MVP4.2 |
|---|---|---|
| 슬롯 구조 | `suffix-action:visibility-toggle` (1개) | `suffixActionGroup: visibilityToggle + clearAction` |
| 상태 프리뷰 | 1개 (숨김 상태만) | 2개 — Hidden / Visible |

**Hidden 상태:** `[ ••••••••    👁  ✕ ]`  
**Visible 상태:** `[ mypassword  🙈  ✕ ]`

- visibilityToggle: 항상 표시. 숨김 = eye 아이콘, 표시 = eye-off 아이콘
- clearAction: 값이 있을 때만 표시, visibilityToggle 오른쪽

### Input with Unit

변경 없음. `suffixText: unitLabel` 구조 유지.

---

## 슬롯 구조 정의 (확정)

### suffixActionGroup

두 개 이상의 액션 버튼을 묶는 flex row 컨테이너.

```
.s1-suffix-action-group {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
```

각 버튼: `.s1-input-action-btn` (28×28px)

### suffixText

단위 텍스트 레이블 (버튼 아님).

```
.s1-input-unit {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 0 8px 0 4px;
  white-space: nowrap;
}
```

---

## 변경 파일

| 파일 | 변경 내용 |
|---|---|
| `pages/components.html` | CSS: `.s1-suffix-action-group`, `.related-composed-meta`, `.related-composed-preview-label`, `.related-composed-states` 추가. HTML: 3개 카드 전면 재작성 (suffixActionGroup 구조 + 2-state 프리뷰) |
| `registry/components/input.json` | `relatedComposedFields[].slots[]` → `slotStructure{}` 객체로 전면 교체. visibility / condition / position 속성 추가. |
| `README.md` | MVP4.2 섹션 추가 |
| `CLAUDE.md` | 변경 이력 추가 + Input Composed Field Slot Rules 추가 |
| `reports/mvp4-2-input-composed-fields.md` | 이 문서 |

---

## Validation Checklist

- [x] Search Input: 검색 아이콘이 오른쪽 suffixActionGroup에 위치
- [x] Search Input: Empty 상태 — searchAction만 표시
- [x] Search Input: Filled 상태 — clearAction (left) + searchAction (right)
- [x] Password Field: Hidden 상태 — visibilityToggle (eye) + clearAction
- [x] Password Field: Visible 상태 — visibilityToggle (eye-off) + clearAction
- [x] Input with Unit: suffixText 구조 유지
- [x] `.s1-suffix-action-group` CSS 클래스 추가됨
- [x] `.related-composed-meta` CSS 클래스 추가됨 (슬롯 구조 표시용)
- [x] `.related-composed-preview-label` CSS 클래스 추가됨
- [x] registry `slotStructure` 객체 형식으로 교체됨
- [x] prefixIcon slot 참조 제거됨 (Search Input)
- [x] CLAUDE.md Slot Rules 추가됨
- [x] README.md MVP4.2 섹션 추가됨

---

## Next Recommended Steps

1. Browser에서 Related Composed Fields 카드 시각 확인.
2. Textarea 컴포넌트 registry 생성 (`registry/components/textarea.json`).
3. MVP4 Input tokens CSS 정의 (semantic.md → tokens.css → components.html harness).

---

## MVP4.2 Revision — Interactive Preview Update

### Figma 조회 결과
- 조회 파일: `yE5UCFEbmXJBlYJWB24Lz2` (SW UX GUIDE V2.4)
- 조회 노드: 6452:5955
- 노드 이름: Section 3
- 노드 타입: SECTION
- 하위 인스턴스: Login input × 4개 (6452:5907, 6452:5908, 6452:5877, 6452:5891)
- Search Input 확인: yes (6452:5907 = Empty, 6452:5908 = Filled)
- Password Field 확인: yes (6452:5891 = Hidden/password, 6452:5877 = Hidden+Filled)
- Input with Unit 확인: no (Section 3에 별도 노드 미발견)

### Figma 토큰 정보
- Background token: `var(--color/form-control/bg/default, white)`
- Border token: `var(--color/form-control/border/default, #d9d9d9)`
- Height (pc-sm): `var(--sizing/form-control/height/xs, 34px)`
- Radius: `var(--radius/control/sm, 4px)`
- Padding inline: `var(--spacing/padding/inline/xs, 12px)` (left), `var(--spacing/padding/inline/xxs, 8px)` (right)

### Basic Input 재사용 확인
- Shell class: `.s1-input-wrap` + `.s1-input-field`
- Height token: --sizing/form-control/height/md (44px, pc-medium 기준)
- Border token: `var(--input-default-border)` → `var(--color-border-default)`
- Radius token: `var(--radius-control-sm)` = 4px
- Background token: `var(--input-default-bg)` → `var(--color-surface-default)`

### 아이콘 현황
| 아이콘 | Figma 노드명 | Figma 노드 ID | 로컬 asset | 상태 |
|---|---|---|---|---|
| 검색 | ic_찾기/조회 | 6452:5930 | 없음 | candidate (임시 SVG) |
| 삭제 | remove | 882:4061 | 없음 | candidate (임시 SVG) |
| 비밀번호 숨김 | ic_비밀번호미표시 | 135:6692 | 없음 | candidate (임시 SVG) |
| 비밀번호 표시 | (Figma 노드명 미확인) | — | 없음 | candidate (임시 SVG) |

### 인터랙션 구현
- [x] Search Input: 입력 시 clear 버튼 표시 (`hidden` attribute 제어)
- [x] Search Input: clear 버튼 클릭 시 값 삭제 + input focus 유지
- [x] Search Input: focus 시 `.is-focus` 클래스 토글
- [x] Password Field: visibility toggle (password ↔ text 전환)
- [x] Password Field: clear 버튼 동작
- [x] Password Field: `aria-label` / `aria-pressed` 상태 동기화
- [x] Password Field: `[data-icon-hidden]` / `[data-icon-visible]` 아이콘 전환
- [x] Password Field: focus 시 `.is-focus` 클래스 토글
- [x] Input with Unit: 실제 입력 가능 (정적 is-preview 제거)
- [x] `setupRelatedComposedFields(document)` 초기화 함수 추가
- [x] `data-related-field` attribute 기반 스코프 격리

### CSS 보정
- `.s1-input-action-btn` cursor: default → pointer 변경
- `.s1-input-action-btn:hover` 배경 hover 효과 추가
- `[data-related-field] .input-clear-btn[hidden]` display:none 보정 추가
- `[data-related-field] .input-clear-btn` display:flex 보정 추가

### 미결 항목
- [ ] Figma `ic_비밀번호표시` (visible 상태) 노드명 확정 후 iconStatus stable 전환
- [ ] 로컬 SVG asset 등록 여부 결정 (assets/icons/ 등)
- [ ] PC/Mobile 차이 확인 (Mobile에서 composed fields 표시 기준 — Figma 미조회)
- [ ] Search icon (searchAction): 단순 어포던스 vs 클릭 이벤트 트리거 역할 Figma 기준 확정
- [ ] Input with Unit: Figma Section 3 외 별도 노드 확인 필요
