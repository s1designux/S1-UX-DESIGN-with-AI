# 1단계 재고조사 — Dropdown (Select)

- **Figma 파일:** `에스원 GUI` (Tnihi6lixRR47N4RSAwUbF) — ⚠️ 기존 V2.4와 다른 신규 파일
- **루트 노드:** `1459:17980` (Frame "Dropdown")
- **변형 축:** Size(XXSM/XSM/MD) × State(Default/Hover/Filled/Disabled) × Open(Off/On) × Break(PC/Mobile)
- **총 variant 개수: 20개**

## variant 목록 (Figma 원본 이름 그대로)

| # | Size | State | Open | Break | nodeId | W×H | 비고 |
|---|------|-------|------|-------|--------|-----|------|
| 1 | XXSM | Default | Off | PC | 1459:17981 | 150×28 | |
| 2 | XSM | Default | Off | PC | 1459:18004 | 150×34 | |
| 3 | MD | Default | Off | PC | 1459:18027 | 150×44 | |
| 4 | MD | Default | Off | Mobile | 1459:18050 | 150×48 | |
| 5 | XXSM | Hover | Off | PC | 1459:18073 | 150×28 | |
| 6 | XSM | Hover | Off | PC | 1459:18096 | 150×34 | |
| 7 | MD | Hover | Off | PC | 1459:18119 | 150×44 | |
| 8 | MD | Hover | Off | Mobile | 1459:18142 | 150×48 | |
| 9 | XXSM | Default | **On** | PC | 1459:18165 | 150×260 | 펼침(리스트) |
| 10 | XSM | Default | **On** | PC | 1459:18188 | 150×266 | 펼침(리스트) |
| 11 | MD | Default | **On** | PC | 1459:18211 | 150×276 | 펼침(리스트) |
| 12 | MD | Default | **On** | Mobile | 1459:18234 | 150×280 | 펼침(리스트) |
| 13 | XXSM | Filled | Off | Mobile | 1459:18257 | 150×28 | ⚠️ Mobile인데 XXSM(라벨 특이) |
| 14 | XSM | Filled | Off | PC | 1459:18280 | 150×34 | |
| 15 | MD | Filled | Off | PC | 1459:18303 | 150×44 | |
| 16 | MD | Filled | Off | Mobile | 1459:18326 | 150×48 | |
| 17 | XXSM | Disabled | Off | Mobile | 1459:18349 | 150×28 | ⚠️ Mobile인데 XXSM(라벨 특이) |
| 18 | XSM | Disabled | Off | PC | 1459:18372 | 150×34 | |
| 19 | MD | Disabled | Off | PC | 1459:18395 | 150×44 | |
| 20 | MD | Disabled | Off | Mobile | 1459:18418 | 150×48 | |

## 사용 아이콘

| 아이콘 | 위치 | 노드/에셋 | 상태 |
|--------|------|----------|------|
| chevron (▾/▴) | trigger 우측 | 2단계 get_design_context로 노드명·SVG 확인 예정 | 미확정 |

> Open=On(펼침) 시 chevron은 위 방향(▴)으로 추정 — 2단계 확인.

## 옵션 리스트 구조 (Open=On)

스크린샷 기준 리스트 항목 상태: **Hover · Selected(파란 텍스트) · Option(기본)** 3종 확인.
→ 기존 `dropdown.json` optionStates(`default·hover·selected`)와 일치.

## ⚠️ 확인 필요 사항 (검문소 1에서 사용자 확인)

1. **명칭 불일치** — 사용자는 "인풋 마이그레이션"이라 하셨으나, 링크된 노드는 **Dropdown(Select)** 컴포넌트 세트임. 마이그레이션 대상이 Dropdown이 맞는지 확인 필요.
2. **신규 Figma 파일** — 이 소스(`에스원 GUI`)는 기존 작업 기준이던 `SW UX GUIDE V2.4`와 다른 파일임. 기준 소스를 이 파일로 교체하는지 확인 필요.
3. **기존 harness 존재** — 이미 `select`(Select·Dropdown) harness + `dropdown.json` 토큰 소스가 구현되어 있음. 이번 작업이 (a) 기존 Select harness 갱신인지 (b) 신규 컴포넌트인지 확인 필요.
4. **펼친 리스트 패널이 어둡게 보임** — 트리거는 라이트인데 Open 리스트만 navy. 기존 컨벤션("드롭다운은 다크에서도 라이트 유지")과 충돌 가능. 2단계에서 실제 HEX 확인 예정.
5. **semantic-dropdown 구조 준수** — 사용자 지시대로 `--dropdown-*` 토큰(semantic 경유) 재사용. 신규 토큰 임의 생성 금지.
