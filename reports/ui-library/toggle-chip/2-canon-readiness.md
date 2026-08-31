# 2-canon-readiness — 제작 전 정본 준비

작성: ⭐ 오케스트레이터 · 2026-08-31

## 공개 계약 확정

### Toggle
- root: `button[data-s1-component="toggle"][role="switch"][aria-checked]` — 루트가 곧 정본 트랙이다.
- part: `knob` (필수). 라벨 부품은 정본에 없어 접근 이름은 `aria-label`·`aria-labelledby`.
- 상태: `off` / `on`([aria-checked="true"]) / `disabled` / `disabled+on` / `focus-visible`(정본 밖·접근성 사유).
- 이벤트: `s1:toggle:change`. 런타임 필요(native checked 가 없는 role=switch 라 aria-checked 를 런타임이 소유).

### Chip
- root: `button[data-s1-component="chip"][data-variant][data-size][data-break][aria-pressed]`.
- part: `label` (필수).
- 상태: `default` / `hover`(hover 가능 기기 한정, 미선택일 때만) / `selected` / `disabled` / `focus-visible`.
- 크기: 정본 3조합만. `data-size="md"` + `data-break="mobile"` 는 정의하지 않는다.
- 이벤트: `s1:chip:change`.

## 접근성 계약 (river 승인 2026-08-31)

Registry 가 이미 선언한 방식을 그대로 확정했다 — 새로 만든 규칙이 아니다.
- Toggle: `guide.accessibility` = role switch · Space · aria-checked/aria-label → 그대로 채택, `a11yStatus: pending → stable`.
- Chip: `guide.accessibility` = role button · Enter/Space · aria-pressed → 그대로 채택, `a11yStatus` 필드 신설(stable).

## 정본에 없어 만들지 않은 것 (manifest `notInCanon` 에 기록)

| 항목 | 근거 |
|---|---|
| Toggle Hover | buildToggle 에 Hover 변형 없음 |
| Toggle 모션(노브 이동 애니메이션) | 정본에 모션 선언 없음 — 임의로 넣지 않았다 |
| Chip Complete | buildChip 에 없음 + chip.json stateNotes 가 "Filter chip 전용, Selection chip 에는 없음" 이라고 선언 |
| Chip 아이콘·닫기(X) | buildChip 은 라벨만 그린다. 허용목록 밖 SVG 를 임의 확정하지 않는다 → **HD-1** |
| Chip Selected+Hover | 정본에 셀 없음. `--color-chip-solid-bg-selected-hover` 토큰이 있어도 쓰지 않았다 |
| Mobile MD | 정본에 조합 없음 |
| focus-visible (양쪽) | 정본에 focus 변형 없음. 키보드 접근성상 필수라 **새 토큰 없이** 기존 선택 테두리 토큰만 썼다(Input·Checkbox 선례) |

## 검문소

- `needs-decision` 0건. 정본 신설 0건(새 토큰·새 컴포넌트·새 variant 없음).
- registry 메타 2건 변경은 river 승인 기록 있음(a11yStatus).
