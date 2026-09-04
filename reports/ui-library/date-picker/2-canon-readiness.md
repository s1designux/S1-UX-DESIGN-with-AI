# 2-canon-readiness — Date Picker

작성: ⭐ 오케스트레이터 · 2026-09-03
입력: `1-inventory.md`(📖 source-reader 판독) · `registry/components/date-picker.json` · `build-components.ts` 6개 빌더 · `vars-data.ts` color/date-picker/* 24종

---

## 1. river 결정 4건 (2026-09-03 · 선택지 응답)

| ID | 무엇 | river 결정 | 근거·영향 |
|---|---|---|---|
| D3 | 주 시작 요일 | **일요일 시작** | 메타 정본(`date-picker.json` HD-9 "weekStart=0(일요일), PC popover 동일")과 일치. 시각 정본 `buildCalendar`(3591~3600)의 요일 헤더는 월요일 시작이라 **Figma 정본과 갈라진다 → CU-1 로 등록**. 토큰 `text/sunday`·`text/saturday` 가 이미 정본에 존재해 일/토 색 구분을 지원한다. |
| D4 | 기간 역순 입력 | **그 날짜로 다시 시작** | 시작일보다 앞선 날짜를 두 번째로 누르면 그 날짜가 새 시작일이 되고 종료일을 다시 고른다. 자동 뒤집기 안 함. |
| D5 | 연/월 화면 진입 | **연도·월 버튼을 따로 둘 다** | 정본 헤더는 `[‹] [라벨 24px Bold] [›]` 단일 라벨이라 진입점이 없다 → **CU-2 로 등록**. 아래 §3 최소 신설 원칙 적용. |
| D6 | 기간 미리보기 hover | **보여줌** | 시작일만 고른 상태에서 커서까지 `cell/bg/range`(정본 기존 토큰) 밴드를 미리 칠한다. 새 색 토큰 0건. 정본 주석의 BACKLOG ③(Range hover 미결)을 웹 쪽에서 이 방식으로 해소한다. |

**river 실제 발화 인용(승인 기록용 대기):** 선택지 클릭은 Gate 34 가 사람 발화로 인정하지 않는다(`origin.kind=human` 타이핑만 인정). 따라서 **6-promotion 직전에 river 에게 승인 문장 1줄 타이핑을 요청**한다. 그 전까지 D3~D6 는 "river 선택 기록은 있으나 Gate 34 승인 인용은 미수령" 상태로 둔다.

---

## 2. 오케스트레이터 메커니즘 결정 7건 (river 에게 올리지 않음)

정본에 규정이 없으나 **제품 선택이 아니라 배선 방식**인 항목. 근거는 이미 승인된 select·time-picker 계약의 재사용이다.

| ID | 항목 | 결정 | 근거 |
|---|---|---|---|
| M1 | PC 패널이 뜨는 방식 | 트리거 바로 아래 8px 간격 팝오버, 화면 아래가 모자라면 위로 뒤집는다 | 정본 `buildDatePicker`(3690~3691)의 세로 스택 itemSpacing=8 을 그대로 웹 오프셋으로 옮김. 뒤집기는 이미 승인된 select 팝오버 계약과 동일 |
| M2 | 이전/다음 달 이동 | 헤더 좌우 chevron 클릭. Year 화면에서는 12년 단위, Month 화면에서는 1년 단위 이동 | 정본 헤더가 세 화면 공용(`makeCalHdr` 3550~3562)이라 화면별 의미만 배선 |
| M3 | 지난달·다음달 날짜 칸 | 표시하고 클릭 허용, 클릭 시 그 달로 이동 | 메타 정본 HD-7 결정 그대로. 색은 정본 토큰 `text/other-month` |
| M4 | 키보드 | Tab 진입 → 화살표로 날짜 이동 · Home/End 주 시작·끝 · PageUp/Down 달 이동 · Enter 선택 · Esc 닫고 트리거로 복귀 | 승인된 select·time-picker 의 목록 키맵을 격자로 확장. 새 시각 상태를 만들지 않는다 |
| M5 | `cell/bg/selected-hover` | 선택된 날짜에 마우스를 올렸을 때 색으로 사용 | 토큰 정본(vars-data.ts:632)에 값이 있으나 시각 빌더에 미배선. 파생인 `components.html:961` 이 이미 이 용도로 쓰고 있어 의도가 확인된다 |
| M6 | 날짜 형식 | 표시는 정본 트리거 그대로 `YY.MM.DD`, 값 입출력은 `YYYY-MM-DD`(ISO) | 정본 트리거 텍스트(3673~3676) 유지. 4자리 변환 규칙이 없어 가장 표준적인 값 형식만 공개 |
| M7 | 모바일 | 트리거를 누르면 PC 팝오버가 아니라 바텀시트가 열린다 | 정본이 Mobile Open 에 캘린더를 붙이지 않고(3713 `sc.brk === "PC"`) 별도 `buildDatePickerBottomSheet` 로 분리해 둔 구조 그대로 |

---

## 3. 정본 이탈(core-update) 2건 — 기록하고 진행

Figma 시각 정본을 이번 작업에서 고치지 않는다. 웹을 river 결정대로 만들고, Figma 정본 반영은 별도 작업으로 등록한다. 이유: 시각 정본 수정은 하드룰 H1② 대상(설치기 구조 변경 → 🤖 검증 분리 + 전 컴포넌트 재설치)이라 "웹 업데이트" 범위를 넘는다.

| ID | 이탈 | 웹 | Figma 정본 | 후속 |
|---|---|---|---|---|
| CU-1 | 주 시작 요일 | 일요일 | 월요일(`buildCalendar` 3591) | `buildCalendar` 요일 배열·데모 그리드 오프셋 수정 필요 |
| CU-2 | 연/월 진입 버튼 | 헤더 라벨을 `연도`·`월` 두 개의 누를 수 있는 라벨로 분리 | 단일 라벨 1개 | `makeCalHdr` 라벨 분리 |

**CU-2 의 최소 신설 원칙:** 새 버튼 시각 디자인을 만들지 않는다. 정본 헤더 라벨의 글자 크기·두께·색(24px Bold, `date-picker/text/primary`)을 그대로 쓰고 라벨만 "2025년" / "1월" 둘로 쪼개 각각 누를 수 있게 한다. hover 는 정본 기존 토큰 `date-picker/icon/hover` 계열의 텍스트 대응색을 쓰고 새 토큰을 만들지 않는다. 이는 river 선택("버튼을 따로 둘 다")을 만족하면서 정본에 없는 시각 부품 신설을 0으로 유지하려는 판단이며, **5-human-review 에서 river 가 실제 화면을 보고 되돌릴 수 있는 항목**이다.

---

## 4. 새 토큰 신설 — 0건

`color/date-picker/*` 24종 + `color/form-control/*` + `color/surface/raised` + `color/overlay/wheel-fade` + `color/text/*` 로 전부 충당된다. 신설 후보 없음.

---

## 5. 접근성 계약

- `date-picker.json` `a11yStatus="partial"` → 이번 작업에서 키맵(M4)·역할·라벨을 채워 `complete` 로 올린다.
- 역할: 트리거 `button[aria-haspopup="dialog"][aria-expanded]`, 패널 `role="dialog"` + `role="grid"` 격자, 날짜 칸 `role="gridcell"` + `aria-selected`, 비활성 `aria-disabled`.
- 모바일 바텀시트: `role="dialog"[aria-modal="true"]`, 포커스 가둠, Esc·닫기·배경 클릭으로 닫힘.

---

## 6. 검문소 판정

| 조건 | 결과 |
|---|---|
| needs-decision 0건 | ✅ D3~D6 river 결정 완료 |
| 새 토큰 신설 | ✅ 0건 |
| 정본 이탈 | ⚠️ 2건(CU-1·CU-2) — 근거와 후속 작업으로 기록, 진행 |
| Gate 34 승인 인용 | ⏳ 미수령 — 6-promotion 전 river 타이핑 1줄 필요 |
| a11yStatus | 진행 중(3-build 에서 complete 로) |

**판정: ✅ 통과 — 3-build 진행 가능.** 단 Gate 34 인용은 승격 전 반드시 받는다.
