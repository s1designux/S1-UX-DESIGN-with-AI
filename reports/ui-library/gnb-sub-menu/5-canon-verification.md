# 5 — 정본 검증 (시나리오 D · 하드룰 H1② · Gate 13)

검증 2026-09-09 · 🤖 component-verifier (독립 검증 · 구현 없음)
대상 = `plugins/figma-vars-installer/src/build-components.ts` `buildGNBSubMenu` 재작성 (Depth 축 → Type 축)
판정 기준 = 🤖 figma-inspector `figma-compact-read.md` 실측 + `figma-shots/` 원본 스크린샷 직접 대조
분류 = §두 갈래 분류 (레거시 DS 2.4 ↔ 정본)

## 0. 기계검사 (내가 재실행해 종료코드 확인)

| 검사 | 결과 |
|---|---|
| `npx tsc --noEmit -p plugins/figma-vars-installer/tsconfig.json` | exit 0 · 출력 0줄 ✅ |
| `npm run installer:check` | exit 0 ✅ |
| `npm run components:keycheck` | 누락 0 ✅ (color 154/176 · number 14/79) |
| `npm run components:anatomy` | 8개 규칙 충족 ✅ |
| `npm run components:iconpolicy` | 위반 0 ✅ |
| `dist/code.js` 재생성 | `Type=` 3변형·TYPE_SPEC 반영 확인 ✅ (dist:4420~) |

## 1. 원본 3변형 재현 대조

원본 높이 산식으로 실측을 교차검증했다(항목 1줄 = 16px × 1.3 ≈ 21):

| 변형 | 산식 | 원본 높이 | 일치 |
|---|---|---|---|
| regular | 32 + (제목21 + 항목5×21 + 간격5×24 = 246) + 64 | **342** | ✅ 산식 일치 → 원본 최장 열 = 제목 + **항목 5개**, 열 안 간격 24 |
| compact-2 | 24 + (항목2×21 + 간격1×20 = 62) + 24 | **110** | ✅ 산식 일치 → 열 안 간격 **20** 이 아니면 110 이 안 나온다(24면 114) |
| compact-1 | 24 + 21 + 24 | 67(보고서) / 69(산식) | 2px 차 — 판독 오차 범위, 코드 결정 사항 아님 |

| 항목 | 원본 | 코드 (`build-components.ts:3769~3782`) | 판정 |
|---|---|---|---|
| 폭 1920 (3변형 공통) | 1920 | `PANEL_W = 1920` :3747 | ✅ |
| regular 상/하 패딩 | 32 / 64 | `spacing/32` · `spacing/64` | ✅ |
| compact-1·2 상/하 패딩 | 24 / 24 | `spacing/24` 양쪽 | ✅ |
| 열 사이 72 | 72 | `spacing/80` (river 2026-09-08 렌더비교 확정) | ✅ (b) 사전 등록 |
| compact-2 묶음 5개 · 항목 2,2,2,2,1 | 스크린샷 일치 | `groups:5, perGroup:[2,2,2,2,1]` | ✅ |
| compact-2 열 안 20 | 20 | `spacing/20` | ⚠️ **C-1** (아래) |
| compact-1 항목 6개 한 줄 | 스크린샷 일치 | `groups:6, perGroup:[1×6]` + 슬롯 HORIZONTAL | ✅ |
| 제목 유무 | regular 만 있음 | `withTitle: true / false / false` | ✅ |
| compact-1·2 강조 = 마지막 항목 | 스크린샷 일치 | `selected:[5,0]` · `[4,0]` | ✅ |
| **regular 묶음별 항목 수** | **5, 3, 4, 5** (스크린샷) | `perGroup:[4,4,4,4]` | ❌ **A-1** |
| **regular 강조 항목 자리** | **4번째 열의 4번째 항목("단말기정보")** | `selected:[0,0]` (첫 열 첫 항목) | ❌ **A-2** |

## 2. ❌ (a) 코드 실수

**A-1 — regular 의 묶음별 항목 수가 원본과 다르다.** `build-components.ts:3773` `perGroup: [4, 4, 4, 4]`.
원본(`figma-shots/regular_540-6423.png`)은 열마다 5, 3, 4, 5 개다. 그 결과 패널 높이가
32+201+64 = **297** 로, 원본 **342** 와 45px 어긋난다(위 산식표). 같은 커밋에서 compact-2 는
2,2,2,2,1 까지 정확히 베꼈으므로 판정 잣대가 변형마다 다르다.
※ 이 값은 이번 diff 가 만든 것이 아니라 2026-09-08 부터 있던 값이다(회귀 아님). 다만 "원본 3변형이
정확히 재현되는가"가 이번 판정 기준이므로 ❌ 로 올린다.

**A-2 — regular 의 Selected 표본이 원본 자리와 다르다.** `:3775` `selected: [0, 0]`.
원본은 세 변형 모두 **마지막 항목**("단말기정보")이 `color/text/state/accent` 로 강조돼 있다
(`figma-compact-read.md:79` · regular 스크린샷에서 4번째 열 4번째 항목). compact-1·compact-2 는
이 규칙대로 마지막 항목을 잡았는데 regular 만 첫 열 첫 항목이다. river 승인 기록을 찾지 못했다
(`1-inventory.md:64` 는 ⭐ 서술이고 `WIP-canon-additions.md` 의 river 결정표에 이 항목이 없다).

**A-3 — TYPE_SPEC 필드 주석이 코드와 반대다.** `:3765`
`groups: number;  // 항목 묶음(열) 개수 — compact-1 은 열 없이 한 줄이라 1`
실제 compact-1 은 `groups: 6` 이다. 이 작업 계열이 스스로 지목한 반복 실패 모양
("주석·문서만 고치고 코드를 안 고치거나 그 반대", `WIP-canon-additions.md`)에 정확히 해당한다.

**A-4 — 패널의 Depth 축 설명이 남아 있다.** `:3693~3694`
`Depth 축의 뜻: … 패널의 1depth = 항목 목록만 · 2depth = 제목 + 항목 목록(A regular).`
패널에는 더 이상 Depth 축이 없다(Item 에만 남는다). 문장의 뒤쪽 절이 스테일이다.

## 3. ❓ (c) 애매 — river 확인 필요

**C-1 — compact-2 열 안 20 은 river 의 2026-09-08 결정을 뒤집는 것으로 보인다.**
그 결정의 대상이 "원본에 없던 근사 변형"이었다는 ⭐ 의 서술(`:3757~3759`)과 기록이 어긋난다.
기록 원문 — `reports/legacy-crosswalk-board/WIP-canon-additions.md:36, 69`:

  「하위메뉴 목록 줄 간격 | **24** — A `regular` 값. `compact` 판의 20 대신 두 깊이를 한 리듬으로 통일」
  「하위메뉴 목록 줄 간격 | compact 판 20 | 24 | river 결정 — 두 깊이 한 리듬」  ← §(b) 사전 등록 표에 있음

즉 river 가 비교해 물리친 그 20 이 **바로 지금 되살린 compact-2 의 열 안 20** 이다. 대상이 다르다고
보기 어렵다. 다만 그때는 정본에 실제 compact 변형이 없었고, 이번 river 지시가 "원본 그대로 넣되"
이므로 종전 결정이 갈음됐다고 볼 여지도 있다. **어느 쪽인지는 검사기가 정할 수 없다 — river 판정 필요.**

판정에 도움이 될 사실 하나: 원본 compact-2 높이 110 은 열 안 간격이 **20 일 때만** 나온다(24 면 114).
"원본 그대로"를 택하면 20, "두 깊이 한 리듬"을 택하면 24 + 높이 114 를 받아들이는 것이다.
어느 쪽으로 정해도 `WIP-canon-additions.md:36,69` 의 서술을 함께 고쳐야 한다(지금은 정본과 어긋남).

## 4. ✅ 통과 확인 — 지적 항목별

| 요청 점검 | 결과 |
|---|---|
| ①72→`spacing/80` | river 2026-09-08 확정 그대로 승계 ✅ |
| ②compact-2 20 | ❓ C-1 로 올림 (임의 (b) 처리 안 함) |
| ③종전 `Depth=1depth` 제거 | ✅ 타당 — 원본 어느 변형과도 대응하지 않던 근사치(항목만·4컬럼·간격 24)였고, 원본 축 이름(`type=compact-1/-2/regular`)을 그대로 채용했다. 새 이름 창작 0건 |
| ④슬롯 `Columns` | ✅ `makeSlot` 호출이 `for (const type…)` 루프 안(`:3826`)이라 **세 유형 전부**에 슬롯이 걸린다. 이름 유지 → 새 승인 항목 0건 |
| ⑤Selected 자리 | compact-1·2 ✅ / regular ❌ A-2 |
| 토큰 경유(생짜 숫자) | ✅ `col.itemSpacing` 은 숫자 대입 후 `setBoundVariable`(`:3816~3817`), 슬롯 itemSpacing 도 `num(spec.groupGap)` 로 직접 바인딩(`:3832`). 2026-09-08 에 걸린 "생짜 80" 재발 없음. 미바인딩은 `comp.itemSpacing = 0`(단일 슬롯이라 무의미)·compact-1 열의 0(자식 1개)뿐 |
| 새 토큰·새 색 | ✅ 0건. `spacing/20` 은 기존 토큰 — `vars-data.ts:329 "spacing/20": 20`. 32/24/64/80 도 전부 기존(:330,332,338,339) |
| `layoutGrow` | ✅ 함수 전체에 `layoutGrow` 대입 없음. 주석과 코드 일치 |
| 다른 빌더 무영향 | ✅ `GNB_SUBMENU_DEPTHS` 는 Item 빌더(:3710)와 Item 스펙시트(:3737,3738)에서 그대로 사용 — Depth×State 6변형 무변경. `COMPONENT_CATEGORIES`(:6489) · `DEPENDENCIES`(:6549) · 빌더 등록표(:6722,6723) 전부 `GNB Sub Menu` 유지 |
| 스펙 시트 | ✅ `rowLabels = GNB_SUBMENU_TYPES`(:3847) 3행, `cellAt(r,_c)=comps[r]` 가 같은 순서로 채워진다(`comps.push` 가 `GNB_SUBMENU_TYPES` 루프 순서). 셀 매핑 어긋남 0. ⚠️ 후속: `cellH: 320` 은 지금 297 을 담지만 A-1 을 고쳐 342 가 되면 넘친다 |

## 5. 후속(이 검증 대상 밖 · 파생 표면)

- `pages/ui-review.html:1855` 주석 "정본 buildGNBSubMenu(build-components.ts:3737). Depth 2변형" — 축 이름·줄번호 둘 다 스테일.
- `registry/governance/ui-library-migration.json:728` `reverifyTrigger` 가 "Depth·컬럼 구조" 로 서술 — Type 축으로 갱신 필요.
- (파생이므로 H6 에 따라 정본에 맞춰 고친다. 저울질 대상 아님.)

## 6. 캔버스 미검증 범위

코드 레벨 검증이다. Figma 캔버스 실제 렌더(가운데 정렬·variant 패킹 육안, compact-1 의 6개 단일항목 프레임이
한 줄로 붙는 모양)는 **육안 미검증** — 코드상 위험만 지적했다.

---

## 요약

**FAIL(❌ a) 4 · HOLD(❓ c) 1 · BLOCKED 0**
판정 = **FAIL + HOLD** — A-1·A-2(원본 재현) 수정과 C-1(river 판정) 이 끝나야 Gate 13 기록 대상이 된다.
A-3·A-4 는 주석 1~2줄 수정.

---

# 2회차 — 델타 재검증 (2026-09-09 · 🤖 component-verifier)

델타 입력 = 1회차 보고서 + ⭐ 수정 내역(A-1·A-2·A-3·A-4·cellH·C-1 갈음 서술).
승계 = 1회차 ✅ 중 「72→spacing/80 매핑 · Depth=1depth 제거 타당성 · 새 토큰/색 0건 · 스펙시트 셀 매핑 순서」
— **이번에 재확인하지 않음**(정본 지문 동일·규칙 추가 없음).

## 0. 기계검사 (내가 재실행 · 종료코드만 확인)

| 검사 | exit |
|---|---|
| `npx tsc --noEmit -p plugins/figma-vars-installer/tsconfig.json` | 0 ✅ |
| `npm run installer:check` | 0 ✅ |
| `npm run components:keycheck` | 0 ✅ |
| `npm run components:anatomy` | 0 ✅ |
| `npm run components:iconpolicy` | 0 ✅ |
| `dist/code.js` 에 `[5, 3, 4, 5]` 반영 | 있음 ✅ |

## 1. A-1 / A-2 — 원본 스크린샷 직접 재계수 ✅ 해소

`figma-shots/regular_540-6423.png` 을 내가 직접 읽어 열별로 세었다.

| 열 | 제목 | 항목 | 수 |
|---|---|---|---|
| 1 | 실시간모니터링 | 운행실적 / 탑승자 현황 / 차량정보관리 ×3 | **5** |
| 2 | 운행현황 | 운행실적 / 탑승자 현황 / 차량정보관리 | **3** |
| 3 | 차량관리그룹 | 운행실적 / 탑승자 현황 / 차량정보관리 ×2 | **4** |
| 4 | 설정 | 운행실적 / 탑승자 현황 / 차량정보관리 / **단말기정보(파랑)** / 차량정보관리 | **5** |

→ `perGroup: [5, 3, 4, 5]` ✅ · 파란 강조 = 4번째 열의 **4번째** 항목 → `selected: [3, 3]` ✅ (0-base 일치).
높이 산식 재검증: 최장 열 = 제목+항목 5 = 텍스트 6줄 × 21 = 126, 간격 5×24 = 120 → 246. 32+246+64 = **342** = 원본 높이 ✅.

**A-2 보강 — compact 두 유형도 스크린샷 재계수 ✅**
- compact-1(540:6399): 한 줄 6항목, 마지막 `단말기정보` 파랑 → `groups:6 · perGroup:[1×6] · selected:[5,0]` ✅
- compact-2(540:6407): 5묶음 2·2·2·2·**1**, 마지막 묶음의 1개가 파랑 → `perGroup:[2,2,2,2,1] · selected:[4,0]` ✅

## 2. A-3 · A-4 · cellH · spacing/20 ✅ 해소

| 점검 | 현재 코드 | 판정 |
|---|---|---|
| A-3 `groups` 주석 | `// 항목 묶음 개수. compact-1 은 항목 하나짜리 묶음 6개가 한 줄로 늘어선다` | ✅ 코드(`groups:6`)와 일치 |
| A-4 패널 Depth 축 주석 | `Depth 축은 **Item 에만** 있다 … 패널의 축은 Depth 가 아니라 Type 이다` | ✅ 해소 |
| `cellH` | **380** ≥ 최장 342 (여유 38) | ✅ |
| compact-2 열 안 | `innerGap: "spacing/20"` | ✅ river 확정값 그대로 |
| regular 열 안 | `innerGap: "spacing/24"` | ✅ |

## 3. 회귀 ✅ 없음

`GNB_SUBMENU_DEPTHS` 를 쓰는 `buildGNBSubMenuItem`(Depth×State 6변형) 무변경 · 슬롯 `makeSlot` 은 여전히
`for (const type…)` 루프 안이라 3유형 전부에 걸림 · `layoutGrow` 대입 0건(주석만 존재) ·
`itemSpacing` 은 전부 `setBoundVariable` 로 토큰 바인딩(생짜 숫자 잔존 없음) ·
`COMPONENT_CATEGORIES:6493` · `DEPENDENCIES:6553` · 빌더 등록표 `:6726,6727` 전부 유지.

## 4. ❌ (a) — 남은 것 (전부 「서술이 정본과 다름」 · 코드 동작 영향 없음)

**F-1 — `WIP-canon-additions.md:50` 이 갈음 전 값 그대로다.**
`| 컬럼 안 세로 간격 | 24 | \`spacing/24\` |` — 이 표(「A 실측 → 정본 토큰」)는 바로 아래 52행 여백 항목이
regular·compact-1·compact-2 를 모두 적고 있어 **세 유형 공통 표**로 읽힌다. 그런데 줄간격만 24 단일값이라
river 09-09 확정(regular 24 · compact-2 **20**)과 어긋난다. 36·71행은 고쳤는데 이 행이 빠졌다.

**F-2 — `registry/governance/ui-library-migration.json:728` 이 여전히 Depth 축이다.**
`"reverifyTrigger": "정본 buildGNBSubMenu 의 geometry·Depth·컬럼 구조·token·…"` — 1회차 §5 가 지목한 바로 그 줄이고,
⭐ 가 고쳤다고 한 항목인데 **고쳐지지 않았다.** 패널에 Depth 축은 없다(Type 3).

**F-3 — 같은 파일 `:737` 이 반만 고쳐져 자기모순이다.**
`"Type 3변형(regular · compact-1 · compact-2)(1depth=항목 목록만·2depth=제목+항목 목록), 기본 4컬럼(컬럼 사이 spacing/80·컬럼 안 spacing/24)"`
— 앞은 Type 축인데 뒤 괄호는 폐기된 Depth 축 설명이고, 컬럼 수·줄간격도 regular 값만 적어 compact 두 유형을 지운다.

**F-4 — `build-components.ts:3757~3759` 주석이 river 결정을 잘못 기록한다.**
`(종전 "두 깊이를 한 리듬으로 24 통일" 결정은 원본에 없던 근사 변형에 대한 것이라 여기서는 적용하지 않는다)`
— 1회차 C-1 이 「대상이 다르다고 보기 어렵다」로 판정한 서술이 그대로 남았다. 실제 근거는 **river 2026-09-09
"20 — 원본 그대로" 결정에 의한 갈음**이며(`WIP-canon-additions.md:36,71` 은 그렇게 고쳐졌다), 정본 주석만
옛 논리를 유지해 기록끼리 어긋난다. 값(spacing/20)은 맞으므로 **주석 1줄 교체**로 끝난다.

## 5. 확인했으나 이 검증 범위 밖 (판정 유보)

`pages/ui-review.html` — 1회차가 지목한 `:1855` 주석은 ✅ 고쳐졌다(`Type 3변형`, 스테일 줄번호 제거).
다만 같은 파일의 **웹 배포본 서술·마크업**(`:734` "정본 변형 2가지(Depth 2종)" · `:1883~1891` 1Depth/2Depth 칸 ·
`data-depth` 패널 속성)은 아직 Depth 축이다. 이는 Gate 19(웹 반영 미완, 타 세션 진행 중) 소관이라
**NOT_VERIFIED — 판정하지 않는다.** F-2·F-3 은 웹 배포본이 아니라 registry 거버넌스 파일이라 판정 대상에 넣었다.

## 6. 캔버스 미검증 범위

1회차와 동일 — 코드 레벨 검증이다. Figma 캔버스 실제 렌더(가운데 정렬·variant 패킹·regular 342 셀 안착 육안)는
**육안 미검증**.

---

## 2회차 요약

**FAIL(❌ a) 4 · HOLD(❓ c) 0 · BLOCKED 0**
1회차 FAIL 4(A-1~A-4)·HOLD 1(C-1) 은 **전부 해소** ✅. 남은 4건은 전부 **서술·주석이 정본과 다른 것**이고
코드 동작에는 영향이 없다(F-1 문서 1행 · F-2/F-3 registry 2행 · F-4 주석 1줄).

---

# 3회차 — 델타 재검증 (2026-09-09 · 🤖 component-verifier)

델타 입력 = 2회차 보고서(F-1~F-4) + ⭐ 수정 4곳 + `git diff`.
**승계(이번에 재확인하지 않음)** — 2회차 ✅ 중 「원본 스크린샷 실측 대조(열별 항목 수·강조 자리·높이 342) ·
토큰 바인딩 · 카테고리/의존/등록표 · 스펙시트 셀 매핑 · 새 토큰 0건」. 근거: 정본 지문 동일 · 검사 규칙 추가 없음.

## 0. 기계검사 (내가 재실행 · 종료코드만 확인)

| 검사 | exit |
|---|---|
| `npx tsc --noEmit -p plugins/figma-vars-installer/tsconfig.json` | 0 ✅ |
| `dist/code.js` 에 `[5, 3, 4, 5]` · `spacing/20` 반영 | 둘 다 있음 ✅ |

## 1. F-1 ✅ 해소 — `WIP-canon-additions.md:50`

`| 컬럼(묶음) 안 세로 간격 | regular 24 · compact-2 **20** | \`spacing/24\` · \`spacing/20\` (유형별 원본값 — 2026-09-09 river 갈음) |`
→ 유형별 값으로 갈렸고 표 아래 축 서술(78~80행)도 Item=Depth / 패널=Type 로 분리됐다.
정본 주석이 인용한 **36·50·71행 줄번호도 실제와 일치**함을 직접 확인했다(스테일 인용 아님).

## 2. F-2 ✅ 해소 — `ui-library-migration.json` reverifyTrigger

현재: `"정본 buildGNBSubMenu 의 geometry·Type·컬럼 구조·token·HTML part·CSS selector 변경"` — Depth → **Type**.
「컬럼 구조」는 폐기된 Depth 축 서술이 아니라 재검증 트리거 목록의 한 항목이며 슬롯 이름(`Columns`)과도 일치하므로 유지 타당 ✅.
`gnb-sub-menu-item` 쪽 `Depth/State` 는 **정상**(Item 세트의 실재 축, 건드리면 안 되는 것) ✅.

## 3. F-3 ✅ 해소 — 같은 파일 note

Type 3유형이 **셋 다** 서술되고(regular 묶음4·5·3·4·5 / compact-1 묶음6 한 줄 / compact-2 묶음5·2·2·2·2·1),
뒤에 `1depth=…·2depth=…` 잔존 없음 — 자기모순 소거 ✅.
「여닫기 host 화면 소유」 → 「여닫는 동작은 상단바 **gnb** 가 갖는다(jsRequired=false, gnb.js)」로 교체됐고,
**실제 `ui-library/src/components/gnb/gnb.js` 를 열어 확인**했다: `aria-expanded`/`aria-controls` 짝짓기(18~19행)·
`panel.hidden` 개폐(51·65·83행)·`Escape` 닫기(120행)를 gnb 가 소유 ✅. 서술이 코드와 일치한다.

## 4. F-4 ✅ 해소 — `build-components.ts` TYPE_SPEC 위 주석

현재 3759~3761행:
`2026-09-08 river 결정("두 깊이를 한 리듬으로" 24 통일)은 **2026-09-09 river 결정으로 갈음됐다** — 콤팩트를 원본
그대로 넣기로 하면서 줄간격을 "20 — 원본 그대로"로 골랐다. 갈음 기록은 WIP-canon-additions.md (36·50·71행).`
옛 논리(「원본에 없던 근사 변형에 대한 것이라 적용하지 않는다」)는 **저장소 전체에서 0건** ✅.

## 5. 회귀 ✅ 없음 — 코드 로직 무변경

| 점검 | 현재 | 판정 |
|---|---|---|
| `regular.perGroup` / `selected` | `[5,3,4,5]` / `[3,3]` | ✅ |
| `compact-1` / `compact-2` selected | `[5,0]` / `[4,0]` | ✅ |
| `innerGap` | regular `spacing/24` · compact-1 `null` · compact-2 `spacing/20` | ✅ |
| `cellH` | 380 | ✅ |
| 슬롯 3유형 | `makeSlot(comp,"Columns",…)` 이 `for (const type…)` 루프 안(3791→3832) | ✅ |
| `layoutGrow` 대입 | 0건(주석만) | ✅ |
| Item 빌더 | `GNB_SUBMENU_DEPTHS`(3695)·`for (const depth…)`(3710)·rowLabels(3737) 무변경 | ✅ |
| 등록 | 카테고리 6495 · 의존 6555 · 빌더표 6728~6729 유지 | ✅ |

## 6. ❓ (c) — river/⭐ 확인 필요

**C-2 — `reports/legacy-crosswalk-board/crosswalk.json:262`(D-18) 이 패널을 아직 Depth 축으로 적는다.**
`"정본": "GNB Sub Menu(펼침 패널) · GNB Sub Menu Item 세트 신설 — Depth=1|2"` — 패널에 Depth 축은 없다(Type 3).
다만 이 항목은 **river 인용·확인 서명이 붙은 날짜 있는 결정 기록**(2026-09-04/09-08)이라, 고쳐야 할 스테일 서술인지
그대로 두어야 할 사후 기록인지 내가 정할 수 없다. 같은 항목의 `note` 에는 이미 나중 변경("A로 가")이 덧붙은
전례가 있어 **note 추기**가 유력해 보이지만, 장부 관례를 내가 신설하지 않는다(H6②).
→ (b) 로 빼지 않고 **(c) 로 올린다.** 선택지: (A) note 에 「2026-09-09 Type 3 개편으로 갈음」 추기 / (B) 결정 당시
기록이므로 무변경. 안 정하면 현재대로 Depth=1|2 서술이 남는다.

## 7. 범위 밖 · 미검증

- `pages/ui-review.html` 의 웹 배포본 Depth 서술(`:734`·`:1883~1891`·`data-depth`) — 2회차와 동일하게
  Gate 19(타 세션) 소관 **NOT_VERIFIED**.
- 참고(판정 아님): `ui-library/src/components/gnb-sub-menu/manifest.json` 의 htmlContract 가 "묶음 안 간격은
  regular·compact-1 이 24" 라고 적는다. 정본은 compact-1 에 간격을 주지 않는다(`innerGap: null` → itemSpacing 0).
  묶음에 항목이 1개뿐이라 **렌더 차이는 없고** CSS(기본 gap 24 + compact-2 만 20 override)와도 일치하므로
  ❌ 로 세지 않는다. 시나리오 D(생성기 코드) 범위 밖.
- Figma 캔버스 실제 렌더(가운데 정렬·variant 패킹·342 셀 안착 육안) — **육안 미검증**(코드 레벨 검증이다).

---

## 3회차 요약

**FAIL(❌ a) 0 · HOLD(❓ c) 1 · BLOCKED 0**
2회차 F-1~F-4 는 **전부 해소** ✅ 이고 코드 로직은 한 줄도 바뀌지 않았다(tsc exit 0).
남은 1건(C-2)은 결정 장부의 스테일 서술로, 고칠지 말지를 사람이 정해야 해 **(c)** 로 올린다.
