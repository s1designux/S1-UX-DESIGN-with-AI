# 2-canon-readiness — 제작 전 정본 준비

- 작업: `time-picker` · 날짜 2026-09-02 · 담당 ⭐ 오케스트레이터

## A. 공개 계약 (구현자가 지켜야 할 것)

| 항목 | 확정값 |
|---|---|
| 루트 selector | `[data-s1-component="time-picker"]` |
| 크기 축 | `data-size="xxsm|xsm|md"` + `data-break="mobile"` (Select 와 같은 규칙) |
| 유형 축 | `data-type="24h|12h"` |
| 상태 | 기본·hover·focus(열림)·입력됨(filled)·비활성 — 정본 5종 그대로 |
| 부품 | `trigger` · `value` · `icon` · `panel` · `column` · `divider` · `confirm` |
| 이벤트 | `s1:time-picker:open` · `close` · `change` (Select 의 `s1:select:*` 규칙과 동일) |
| 공개 API | `init(root)` → `{ open, openPanel, closePanel, destroy }` · `destroy(root)` · `runtime` |
| 의존 | Dropdown 토큰 재사용(칸·패널). 컴포넌트 의존은 두지 않음 — Time Picker 는 자체 열 구조라 Dropdown 모듈을 품지 않는다 |

## B. 접근성 계약 (D4 — pending → stable)

registry 가 이미 선언한 방향(트리거 접근 이름 + `aria-expanded` + listbox)을 이미 승인된 **Select** 와 같은 규격으로 확정한다.

| 항목 | 확정 |
|---|---|
| 트리거 | `<button type="button">`, `aria-haspopup="listbox"`, `aria-expanded`, 접근 가능한 이름 필수(`aria-label` 또는 연결된 label) |
| 열 | 열마다 `role="listbox"` + 접근 이름(시/분/오전오후), 칸은 `role="option"` + `aria-selected` |
| 키보드 | 트리거에서 Enter·Space·↓ 로 열기, Esc 로 닫고 트리거로 포커스 복귀, ↑↓ 로 같은 열 이동, ←→ 로 열 이동, Enter 로 선택, Tab 으로 확인 버튼 도달 |
| 포커스 | 열림 시 현재 값(없으면 첫 칸)으로 포커스 이동, 닫힘 시 트리거 복귀 |
| 비활성 | `disabled` 트리거는 열리지 않는다 |

→ `registry/components/time-picker.json` 의 `a11yStatus` 를 `stable` 로 올리고 `a11y` 항목을 위 표로 구체화한다.

## C. 정본에 없어 river 가 정한 것

| 번호 | 무엇 | 결정 |
|---|---|---|
| D1 | 모바일 휠 바텀시트 | 이번 범위 밖. 모바일도 같은 목록 드롭다운, 트리거 48px 제공 |
| D2 | 분 목록 간격 | 기본 1분 단위(00~59), 소비자가 조절 가능하게 공개 설정 |

## D. 검문소

- `needs-decision` **0건** — 정본에 없던 2건은 river 가 결정(D1·D2)
- 새 토큰 신설 **0건** — 정본 신설 승인 절차(Gate 34) 해당 없음
- 착수 차단 요인이던 `a11yStatus=pending` 은 B 로 해소 예정(3-build 착수 전 반영)

✅ 통과 — 3-build 진행 가능
