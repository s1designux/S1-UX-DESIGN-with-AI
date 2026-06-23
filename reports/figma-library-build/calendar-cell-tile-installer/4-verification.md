# 4단계 검증 (Gate 13 §D) — Calendar Cell/Tile 설치기 컴포넌트화

> 검증 주체: 🤖 원본대조 검증 에이전트(component-verifier). 빌드자(figma-library-builder)와 분리 컨텍스트.
> 기준: `2-plan.md` + `node-map.json` + V2.4 원본(540:4167 cell / 540:4209 tile, fileKey yE5UCFEbmXJBlYJWB24Lz2) + `git diff build-components.ts`.
> 한계 명시: **Figma 캔버스 실제 렌더(설치기 실행 결과)는 사용자만 실행. 코드 레벨 위험만 지적, 육안 렌더 미검증.**

## 1. 셀↔키 정합 (정확 대조) — ✅ PASS

| 소비처 참조 | 등록 키 (getOrBuild) | 일치 |
|---|---|---|
| `dayKindToCellKey` → `Standard:Default/Today/Selected/Disabled` | `variants["Standard:..."]` → `BUILT_COMPS["CalendarCell:Standard:..."]` | ✅ |
| `calCellInstance(calCell, key, day)` 는 `cell.variants[key]` 직접 사용 (BUILT_COMPS 미경유) | variants 객체 키와 동일 | ✅ |
| `calTileInstance(calTile, state, label)` 는 `tile.variants[state]` (Default/Selected/Disabled) | variants 키 동일 | ✅ |
| 레이아웃 runner `cellAt` → `variants[\`Standard:${stdStates[c]}\`]`/`variants[\`Range:${rngStates[c]}\`]` | 동일 키 | ✅ |

- **빈칸 유발 불일치 0.** 소비처(buildCalendar·buildCalendarPanel)는 `BUILT_COMPS` 가 아니라 `getOrBuild` 가 돌려준 `variants` 객체를 직접 받아 사용하므로 키 오타로 인한 null 인스턴스 위험 자체가 낮다. `calCellInstance`/`calTileInstance` 에 폴백(`?? variants["Standard:Default"]`/`["Default"]`)도 존재.
- `dayKindToCellKey`: today→Today, selected→Selected, disabled/other→Disabled, normal→Default. 8 Range variant 는 day 그리드에서 미사용(레이아웃 스펙 전용) — 의도대로.

## 2. 빌드 순서 / lazy / 재배치 — ✅ PASS

- Form members 순서: `…Calendar, Date Picker, Calendar Cell, Calendar Tile…`. **Calendar 가 Cell/Tile 보다 먼저 실행** → `getOrBuildCalendarCell/Tile` 가 세트를 1회 빌드(`_calCell`/`_calTile` 캐시). 이후 Date Picker(Panel)·Cell/Tile 레이아웃 runner 는 모두 캐시 반환.
- 레이아웃 runner(`buildCalendarCellLayout`/`TileLayout`)는 `set.x/y` 만 재지정 + decorate/spec → **중복 세트 빌드 0**(`getOrBuild` 가 캐시 우선).
- `isDepSet` 분기: Calendar Cell/Tile 은 `existing.has` 와 무관하게 항상 layout runner 실행 → 옛 위치 부유 방지. 타당.

### ✅ 재설치 시 기존 인스턴스 무결성 — 이전 ❓(c) HOLD 해소 (재검증 2026-06-23)

이전 검증의 (c) 위험(재설치 시 옛 Cell/Tile 세트 제거 → skip 된 Calendar/Date Picker 인스턴스 detach)을 빌더가 수정. 재검증 결과 **위험 제거 확인:**

- **`removeStaleSet` 완전 제거** — grep 결과 참조 0건. 옛 세트 강제 제거 경로 자체가 사라짐.
- **`getOrBuildCalendarCell/Tile` 가 ①캐시(`_calCell`) → ②`getBuiltSet("Calendar Cell")` 로 캔버스 기존 세트 탐색·재사용 → ③없을 때만 신규 빌드 순.** 재사용 분기는 **옛 세트를 제거하지 않고 보존**하므로 skip 된 Calendar/Date Picker 인스턴스가 가리키던 세트가 그대로 유지된다. detach 발생 경로 없음.
- **재사용 시 variants 복원 정합 확인:** `reconstructCalCellVariants` 는 자식 컴포넌트 이름에서 `Type`/`State` 를 정규식 `(?:^|, )${prop}=([^,]+)` 으로 파싱해 key `${Type}:${State}`(예 `Standard:Default`, `Range:Start`)를 만든다. 이는 `buildCalendarCell` 의 등록 key 와 **정확히 일치**. Tile 은 `State` 만 파싱해 key=State 값(`Default`/`Selected`/`Disabled`) — `buildCalendarTile` 과 일치. combineAsVariants 가 부여하는 노드명(`Type=Standard, State=Default` / `State=Default`)과 파서가 정합하므로 재사용·신규 두 경로가 동일 key 셋을 생성 → 소비처(`calCellInstance`/`cellAt`/`calTileInstance`)에서 null 인스턴스 위험 없음.
- **재사용 가드 견고:** `existing && !existing.removed && existing.children.some(c => c.type==="COMPONENT")`. 비었거나 손상된 세트는 재사용 거부 → 신규 빌드 폴백.
- **풀설치(빈 캔버스) 회귀 0:** `getBuiltSet` → `findOne` null → 신규 빌드(종전과 동일 경로). keycheck/anatomy 게이트가 빈 캔버스 mock 으로 이 경로를 실제 실행해 통과(color 키 133개 수집, anatomy 5규칙).
- **layout runner 무수정:** 시그니처 `(maps, originY) => {set, bottomY}` 동일. `getOrBuild` 만 교체됐고 호출부 변화 없음.

**한계 (코드 추론):** 재사용 분기(`getBuiltSet` 가 non-null 반환)는 mock 이 빈 캔버스라 게이트에서 실측되지 않음 — 위 정합은 코드 레벨 추론. 실제 재설치 라이브 렌더(같은 캔버스 2회 실행 후 skip 된 인스턴스가 보존된 세트를 정상 참조하는지)는 **사용자만 실행 가능.**

## 3. 토큰 바인딩 (V2.4 원본 대조) — ✅ PASS · raw hex 0

V2.4 변수 정의를 실제 조회(get_variable_defs)해 코드 바인딩과 대조. 전부 `color/date-picker/*` 토큰, raw hex 0.

| 요소·속성 | 코드 토큰 | vars-data resolved (light) | V2.4 원본 실측 | 일치 |
|---|---|---|---|---|
| Cell Std Selected 텍스트 | `text/selected` | #FFFFFF | #ffffff | ✅ |
| Cell Std Selected fill | `bg/selected` | #1D6CEB | #1d6ceb | ✅ |
| Cell Std Selected stroke | `border/today` | #1D6CEB | #1d6ceb | ✅ |
| Cell Std Today stroke | `border/today` | #1D6CEB | #1d6ceb | ✅ |
| Cell Std Default/Today fill | `bg/today` | #FFFFFF | #ffffff | ✅ |
| Cell text/secondary | `text/secondary` | #353535 | #353535 | ✅ |
| Cell text/disabled | `text/disabled` | #C4C4C4 | #c4c4c4 | ✅ |
| Cell Range band/fill | `bg/range` | #E2F1FF | #e2f1ff | ✅ |
| Cell text/today | `text/today` | #1D6CEB | #1d6ceb | ✅ |
| Tile Default text | `text/primary` | #202020 | #202020 | ✅ |
| Tile Default bg | `tile/bg/default` | #FFFFFF | #ffffff | ✅ |
| Tile Default border | `tile/border/default` | #D9D9D9 (gray/200) | #d9d9d9 | ✅ |
| Tile Selected bg | `tile/bg/selected` | #FFFFFF | #ffffff | ✅ |
| Tile Selected border | `border/today` | #1D6CEB | #1d6ceb | ✅ |
| Tile Disabled bg | `tile/bg/disabled` | #E9E9E9 (gray/100) | #e9e9e9 | ✅ |
| Tile Disabled border | `tile/border/disabled` | #E9E9E9 (gray/100) | #e9e9e9 | ✅ |
| Tile/Cell Disabled text | `text/disabled` | #C4C4C4 | #c4c4c4 | ✅ |

- **on-selected 흰 텍스트**: 별도 `text/on-selected` 토큰 없이 `text/selected`(light+dark 모두 base/white)가 그 역할 — node-map 기록과 일치, V2.4(#ffffff)와 일치. 타당.
- **cell selected stroke = border/today**: V2.4 변수셋에 `border/today` 존재(#1d6ceb) — 코드 일치.
- **tile selected border = border/today**: V2.4 실측 #1d6ceb — 코드 일치 (plan 의 "V2.4 확인" 미결을 정확히 해소).
- **tile default text = text/primary**: V2.4 실측 #202020 — 코드 일치.
- 셀 마스터에 `setLightMode` 미적용(주석 확인) → 인스턴스가 부모 패널/스펙 모드 상속. `buildCalendar` 는 `setLightMode(dateComp)` 를 인스턴스 append 후 부모에 적용 → 다크모드 상속 정상(TimePicker Cell 패턴 동일).

## 4. combineAsVariants / variant 전수 (정확 대조) — ✅ PASS

- Cell 8 변형: Standard{Default,Today,Selected,Disabled} + Range{Default,Start,End,Disabled} — 정확, 중복 0. variant 명 `Type=Standard, State=…`/`Type=Range, State=…` 정규화됨.
- Tile 3 변형: State={Default,Selected,Disabled} — 정확, 중복 0. variant 명 `State=…`.
- 두 세트 모두 `combineAsVariants(comps, currentPage)` 1회 호출, 이름 부여 정상. 순환 참조 없음(셀/타일은 형제 인스턴스 미포함).

## 5. 결정론 게이트 (도구 실제 실행) — ✅ 전부 PASS

| 게이트 | 결과 |
|---|---|
| `installer:check` (tsc --noEmit) | ✅ PASS (출력 없음=에러 0) |
| `components:keycheck` | ✅ PASS — color req 133/supply 183, number 6/103, 누락 0 |
| `components:anatomy` | ✅ PASS — 5규칙 충족 |
| `components:iconpolicy` | ✅ PASS — 위반 0 |

## 6. needs-decision (builder 제기) 의견 — other-month → Standard:Disabled

- V2.4 calendar_cell(540:4167)에 별도 Other variant 가 없음을 변수셋·스크린샷으로 확인. 전월/익월 날짜를 `Standard:Disabled`(텍스트 disabled 회색)로 매핑한 것은 **임의 생성 없이 기존 variant 재사용**이라는 점에서 타당. 단 의미상 "비활성(클릭 불가)"과 "다른 달(클릭하면 이동)"은 다르므로, 추후 정본에 Other state 신설 시 `dayKindToCellKey` 의 other 분기만 교체하면 됨(현 구조가 그 확장을 허용). **현 단계는 (b) 사전 등록된 절충으로 수용**, 정본 variant 추가는 별도 결정.

## 판정 (재검증 2026-06-23)

- ❌(a) 코드 실수: **0건**
- ❓(c) 확인 요청: **0건** — 이전 (c) 재설치 인스턴스 무결성은 §2 수정으로 해소(removeStaleSet 제거 + 기존 세트 재사용).
- 🔒 BLOCKED: 0건
- 🟡(b): other-month=Standard:Disabled 매핑(수용)

**결론: PASS** — 구조·셀↔키 정합·토큰 바인딩·variant 전수·결정론 게이트 4종이 전부 PASS이고, 이전 HOLD 사유(재설치 detach 위험)가 코드 수정으로 제거됨. **Gate 13 기록 갱신:** `installer-build-verify-check.js --record --by component-verifier --verdict pass --change structural` (sha256:bcb324f06eb0…).

**검증 한계:** 재사용 분기 라이브 렌더(같은 캔버스 2회 설치)와 설치기 캔버스 패킹 육안은 사용자만 실행 가능 — 코드 레벨 검증임을 명시.
