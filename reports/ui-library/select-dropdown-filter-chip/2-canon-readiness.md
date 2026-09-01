# 2-canon-readiness — 제작 전 정본 준비

작업: `select-dropdown-filter-chip` · 2026-08-31 · ⭐ orchestrator

## 착수 차단 요인 해소
| 항목 | 착수 전 | 결정 | 결과 |
|---|---|---|---|
| `select.json` a11yStatus | pending | river 승인 (적힌 표준안 그대로 확정) | **stable** |
| `dropdown.json` a11yStatus | pending | 〃 | **stable** |
| `filter-chip.json` a11yStatus | pending | 〃 | **stable** |
| `dropdown.json` 「전체 선택」 mixed 표시 | needs-decision | river 결정: 정본대로 켜짐/꺼짐만 | a11y 문구 확정 교체 |

→ **needs-decision 0건 · needs-core-update 0건 · 새 토큰 신설 0건.**

## 모듈 경계 (⭐ 메커니즘 결정)
- 배포 모듈은 **3개**: `select` · `dropdown` · `filter-chip`.
- 정본의 `Dropdown List`(옵션 행 27조합)는 **별도 모듈이 아니라 `dropdown` 모듈의 part** 다. 근거: registry 정본이 `dropdown.json` 하나로 패널(`states.panel`)과 옵션 행(`optionStates`)을 함께 선언한다.
- 체크박스 유형 옵션 행은 **승인 완료된 코어 `checkbox` 배포본을 dependency 로 조립**한다(계약 composition.module). 코어 내부 DOM 을 복제하지 않는다.
- `select` 와 `filter-chip` 은 `dropdown` 을 dependency 로 조립한다. 사슬: `filter-chip`/`select` → `dropdown` → `checkbox`.

## 공개 API 계약 (확정)

### dropdown
| 항목 | 확정 |
|---|---|
| root | `[data-s1-component="dropdown"]` (패널) |
| 축 | `data-type` = `text` \| `checkbox` · `data-size` = `xxsm` \| `xsm` \| `md` |
| parts | `option` · `option-label` · `option-check` · `divider`(전체선택 구분선) |
| 옵션 role | text 유형: 패널 `role=listbox`, 행 `role=option` + `aria-selected` / checkbox 유형: 행 `role=checkbox` + `aria-checked`(true·false 만) |
| 상태 | default·hover(native `:hover`)·selected(`aria-selected` / `aria-checked`) |
| 키보드 | ↑↓ 이동 · Home/End · Enter/Space 선택 (role=listbox 표준 패턴 = river 확정 범위) |
| 이벤트 | `s1:dropdown:change` |
| 정본에 없어 만들지 않음 | hover 와 별개인 focus 상태, 패널 자체 state 축, mixed 표시 |

### select
| 항목 | 확정 |
|---|---|
| root | `[data-s1-component="select"]` |
| parts | `trigger` · `value` · `icon` · `panel`(dropdown 인스턴스) |
| 축 | `data-size` = `xxsm` \| `xsm` \| `md` · `data-break` = `pc` \| `mobile` (MD/Mobile 만 h48) |
| 상태 매핑 | Default→기본 · Hover→`:hover` · **Open→`aria-expanded="true"`** · **Filled→`data-filled="true"`**(ARIA 대응물 없어 documented data-state) · Disabled→`disabled` |
| a11y | 트리거 `aria-haspopup="listbox"`·`aria-expanded`, 선택값 `aria-selected` |
| 이벤트 | `s1:select:change` · `s1:select:open` · `s1:select:close` |
| 정본에 없어 만들지 않음 | Focus 별도 축(Open 이 겸함) · Error 축 · 다중선택 |

### filter-chip
| 항목 | 확정 |
|---|---|
| root | `[data-s1-component="filter-chip"]` |
| parts | `trigger` · `title`(선택) · `value` · `icon` · `panel` |
| 축 | `data-variant` = `line` \| `solid` · `data-size` = `sm` \| `md` · `data-break` = `pc` \| `mobile` · `data-title` = `on` \| `off` |
| 상태 매핑 | Default→기본 · Hover→`:hover` · **Selected(=열림)→`aria-expanded="true"`** · **Complete(=값 확정·닫힘)→`data-complete="true"`** · Disabled→`disabled` |
| a11y | 트리거 `aria-haspopup="listbox"`·`aria-expanded` · 접근 이름 = 제목+값 결합("정렬, 최신순") · **Esc 로 닫기**(registry 요구) |
| 이벤트 | `s1:filter-chip:change` · `s1:filter-chip:open` · `s1:filter-chip:close` |
| 패널 사이즈 매핑 | **SM→xxsm · MD→xsm** (Select 와 다름 — 정본 2264–2288 그대로) |
| 정본에 없어 만들지 않음 | 다중 선택 · Error 상태 |

## 공통
- 아이콘 `chevron` 신규 등재 필요 — 정본 remote key `e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581`(419:69), 인라인 정본 SVG는 `build-components.ts:1450-1451`. 크기는 Select=XXSM 20px·나머지 24px, Filter Chip=20px 고정(2252). 방향은 회전(닫힘 아래·열림 위).
- 크기 어휘는 `size-naming-policy.json` 허용 단어(`xxsm`·`xsm`·`sm`·`md`·`lg`)만 사용.
- 바깥 클릭으로 닫기 · 열림 시 패널 포커스 진입 · 닫힘 시 트리거로 포커스 복귀는 세 모듈 공통 행동 계약.
- `shadow/dropdown` 은 정본에서 light==dark 동일값 — 다크에서 그림자가 안 바뀌는 것은 정본 그대로이며 구현 오류가 아니다.

## 검문소 판정
`needs-decision` 0건 · 정본 신설 0건(a11yStatus 확정은 registry 메타의 상태 전환이며 신규 항목 신설이 아님, river 승인 기록 있음) → **PASS · 3-build 진행**
