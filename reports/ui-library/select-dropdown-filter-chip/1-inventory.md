# 1-inventory — Select Box · Dropdown · Filter Chip 전수 재고조사

- 작업: `select-dropdown-filter-chip`
- 판독: 📖 `source-reader` (2026-08-31) · 읽기 전용
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- Figma V3.0: 조회하지 않음 (코드 정본만으로 상태·수치·토큰이 모두 확정됨 — inventory 필수 조건 아님)

## A. 정본 전수 (build-components.ts)

### Select Box — `buildSelect` (1448–1553)
| 항목 | 값 | 출처 |
|---|---|---|
| State | Default · Hover · Open · Filled · Disabled (5) | 1452–1458 |
| Size×Break | XXSM/PC(h28,f12) · XSM/PC(h34,f14) · MD/PC(h44,f14) · MD/Mobile(h48,f14) (4) | 1459–1464 |
| 전수 | **20** | 1466 |
| 구조 | HORIZONTAL · SPACE_BETWEEN · padding L16/R8 · radius 4 · border 1(INSIDE) | 1471–1477 |
| 아이콘 | chevron · `fcIconPx(h,0)` → XXSM 20px, 나머지 24px | 1310, 1481 |
| 토큰 | `color/form-control/bg/{default,hover,selected,disabled}` · `border/{default,selected,disabled}` · `text/{placeholder,selected,disabled}` · `icon/{default,disabled}` | 1453–1457 |
| 결합 | Open 이면 `Dropdown:{size}:Default` 인스턴스를 자식으로 부착(사이즈 그대로, 없으면 MD 폴백) | 1484–1503 |
| **정본에 없는 것** | Focus 별도 축(Open 이 겸함) · Error 축 · 다중선택 | 1452–1458 |

### Dropdown List (옵션 행) — `buildDropdownList` (1554–1697)
| 항목 | 값 | 출처 |
|---|---|---|
| State | Default · Hover · Selected (3) | 1556–1562 |
| Type | Text · Checkbox · Checkbox+All (3) | 1564–1568 |
| Size | XXSM(h28,f12) · XSM(h34,f14) · MD(h44,f14) (3) | 1570–1574 |
| 전수 | **27** | 1626–1652 |
| 구조 | HORIZONTAL · padding L12/R12 · itemSpacing 체크박스 8 / 글자 0 | 1576–1583 |
| 체크박스 | 코어 `Checkbox` 컴포넌트 인스턴스 재사용(`reuseVariant`), 폴백 18px | 1588–1620 |
| Checkbox+All | 내용행 + 1px 구분선(`color/dropdown/list/border`) 세로 스택 | 1633–1645 |
| 토큰 | `color/dropdown/option/bg/{default,hover}` · `option/label/{default,hover,selected}` · `list/border` | 1556–1562, 1645 |
| 주의 | **Selected 배경 = default 재사용** — 강조는 글자색만 | 1561–1562 |
| **정본에 없는 것** | Hover 와 별개인 Focus | 1554 주석 |

### Dropdown (패널) — `buildDropdown` (1698–1791)
| 항목 | 값 | 출처 |
|---|---|---|
| Type | Text(4행) · Checkbox(4행) (2) | 1706–1709 |
| Size | XXSM · XSM · MD (3) | 1700–1704 |
| 전수 | **6** (State 축 없음 — 항상 `State=Default`) | 1716–1717 |
| 구조 | VERTICAL · padding T4/B4 · radius 4 · border 1(OUTSIDE) · `clipsContent=false` · `shadow/dropdown` | 1720–1728 |
| 행 | `Dropdown List` 인스턴스 4개 `layoutAlign=STRETCH` · 못 찾으면 skip(가짜 렌더 방지) | 1731–1765 |
| 토큰 | `color/dropdown/list/bg` · `list/border` · `shadow/dropdown` | 1720–1723 |
| **정본에 없는 것** | 패널 자체의 state 축 — 상태는 내부 행이 담당 | 1716 |

### Filter Chip — `buildFilterChip` (2195–2330)
| 항목 | 값 | 출처 |
|---|---|---|
| Variant | Line · Solid (2) | 2202 |
| Title | Off(라벨만) · On(제목 포함) (2) | 2203–2206 |
| State | Default · Hover · Selected · Complete · Disabled (5) | 2207 |
| Size×Break | SM/PC(h28,f14,padL12/R6) · MD/PC(h34,f14,padL16/R8) · MD/Mobile(h30,f14,padL12/R6) (3) | 2209–2213 |
| 전수 | **60** | 2229–2233 |
| 구조 | HORIZONTAL · itemSpacing 4 · radius `radius/full`(9999) · border 1(INSIDE) | 2237–2242 |
| 아이콘 | chevron 고정 20px(리터럴, `fcIconPx` 미사용) · 열림 위90° / 닫힘 아래270° | 2196–2197, 2252 |
| 토큰 | `color/chip/{line,solid}/bg/{default,hover,selected,disabled}` · `border/{default,selected,disabled}` · `label/{default,selected,disabled}` | 2216–2231 |
| 결합 | Selected(열림)일 때만 Dropdown 부착 · **사이즈 매핑 SM→XXSM / MD→XSM** (Select 와 다름) | 2264–2288 |
| 특이 | 부착한 Dropdown 3번째 행을 `Default` 로 강제 swap(선택행 강조 무효화) | 2289–2296 |
| **정본에 없는 것** | 다중 선택 · Error 상태 | 2207 |

### 의존 사슬 (코드상 실제)
```
Filter Chip / Select Box  →  Dropdown(패널)  →  Dropdown List(옵션 행)  →  Checkbox(코어, 승인 완료)
```

## B. 의미·접근성 정본 (registry/components/)
| 항목 | select.json | dropdown.json | filter-chip.json |
|---|---|---|---|
| tokenStatus | stable | stable | stable |
| darkModeStatus | pending | pending | pending |
| a11yStatus | pending → **stable** (river 확정 2026-08-31) | pending → **stable** | pending → **stable** |
| deprecated | 없음 | 없음 | 없음 |
| 전용 토큰 | 없음 (dropdown-* 재사용) | — | 없음 (chip/* 그대로) |

`registry/governance/deprecated.json` 매치 **0건**.

## C. 토큰 (vars-data.ts)
A 에서 수집한 토큰 전수 grep 대조 — **누락 0건**. 색상 토큰은 모두 `{light, dark}` 양쪽 값 보유. `radius/full=9999`. `shadow/dropdown` 은 light==dark 동일값(정본 주석에 "다크값 미확정" 명시).

→ **새 토큰 신설 0건으로 구현 가능.**

## D. 기존 ui-library 배선 현황 (전부 미착수)
| 자리 | 현재 |
|---|---|
| `ui-library/src/components/` | input·button·checkbox·radio·toggle·chip 6개뿐 — 3종 없음 |
| `ui-library/scripts/build.mjs:13` `componentIds` | 3종 미등록 |
| `ui-library/scripts/test.mjs:16` | 3종 미등록 |
| `ui-library/package.json:26-31` exports | 3종 미등록 |
| `assets/js/ui-library-guide.js:3` `componentConfig` | toggle·chip 만 |
| `pages/ui-review.html:594-602` | 3종 없음 |
| `pages/components.html` 내비 2184·2189·2190 | 버튼 있으나 **disabled** |
| `component-presentation-policy.json` | 3종 블록 있으나 `managedBy: ui-library-guide` 없음 |
| `ui-library-migration.json` | 3종 레코드 없음 |
| `src/verification/empty-consumer*.html` | 3종 없음 |

`references/wiring-and-traps.md` §1 배선표 ↔ 실제 코드 **불일치 없음** (= 착수 전 상태와 정확히 일치).

## E. 기존 손관리 마크업 (`pages/components.html`)
| 컴포넌트 | 줄 범위 | 규모 |
|---|---|---|
| filter-chip | 2458–2828 | 371줄 |
| select | 3586–3834 | 249줄 |
| dropdown | 3835–4072 | 238줄 |
| **합계** | | **858줄** + 인라인 `<style>`(1–2131) 안 `.s1-select-trigger`·`.ds-filter-chip*` 등 |
외부 `assets/css/*.css` 에는 해당 클래스 **0건** — 전량 페이지 내부 손관리.

## 미확인 (정직 표기)
- Figma 노드 실제 조회 — 이번 범위 밖(코드 정본으로 충분). `filter-chip.json` 의 `figmaNodeId: 540:3226` 유효성 미확인.
- `pages/components.html` 손관리 섹션의 **실제 렌더 결과** — 스크린샷 미촬영. 위 서술은 HTML 소스 구조 사실이며 화면 배치를 단정한 것이 아님.
- `component-presentation-policy.json` 의 3종 블록이 방치인지 갱신 예정인지의 의도.

## 검문소 판정
목록 누락 0건 · 모르는 항목은 위 「미확인」으로 명시 · 추측 0건 → **PASS**
