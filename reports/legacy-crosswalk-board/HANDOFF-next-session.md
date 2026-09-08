# 새 세션 인계 — 정본 보강 4건 (2026-09-08)

> **이 파일 하나만 읽으면 이어서 할 수 있다.** 앞 대화를 몰라도 된다.
> 전체 사양 = `PLAN-canon-additions.md` · 진행 기록 = `WIP-canon-additions.md`

## 상태 한 줄

**정본 시공은 끝났다. 커밋만 안 됐다.** `gate:check` 는 **Gate 13(독립 검증) 하나만** 빨강이다.
미커밋 파일은 전부 이 작업 것이다(`git status` 로 확인).

## 만든 것 (전부 river 승인 · Gate 34 기록 **10건**)

| 무엇 | 결과 |
|---|---|
| 색 **4개** | 보조 버튼 전용 3(`border/assist--hover`·`label/assist--{default,hover}`) + 하위메뉴 제목 1 |
| 신규 컴포넌트 **5개** | Assist Button · Text Button · Modal Content · GNB Sub Menu · GNB Sub Menu Item |
| `Assist Button` | **별도 세트** · 크기 1종(60×32) · State 4 |
| `Text Button` | Variant 2 × State 4 = 8 |
| `Modal Content` **신규** | 콘텐츠 계열 · Size(MD 520×336·LG 1000×587·XL 1200×587) × Footer 2 = 6변형 |
| `Modal`(확인 계열) | **크기 축 없음** — PC 360 · Mobile 300(Break 축은 그대로). 한때 크기 축을 붙였다가 river 지시로 철회 |
| `Mobile Header` | `Home / Title + 1 Icon` 추가 → 7종 |
| `GNB Sub Menu` · `GNB Sub Menu Item` | **A 기준**(아래) · 2변형 + 6변형 |

## ⚠️ 마지막 변경 — GNB 하위메뉴를 A 기준으로 갈아엎었다 (river "A로 가")

처음엔 **B**(`vHg5UOMMYI77RHH6vVVppu` 5:10245)로 만들었는데, river 가 **A**(`yE5UCFEbmXJBlYJWB24Lz2` 540:6398, 변형 `regular` 540:6423)를 짚어
"서브메뉴 아이템 폰트 두께·크기 맞는지 봐줄래" → 달랐고 → **"A로 가"** 로 확정.

| | B (버림) | **A (지금 정본)** |
|---|---|---|
| 1단(카테고리 제목) | Regular 16 | **Bold 16 = `title/16B`** #353535 |
| 2단(항목) | Regular 14 | **Medium 16 = `title/16M`** #555 |
| 들여쓰기 | 8px | **없음** |
| 세로 간격 | 17 | **24 = `spacing/24`** (정확히 일치) |
| 컬럼 사이 | 101·89 | **72 → `spacing/80`** |
| 패널 여백 | 26/35 · 60 · 좌우 218 | **위 32 / 아래 64**(regular) · **상하 24**(compact) · 좌우는 **가운데 정렬** |
| 구분선 | 상단 #DCDCDC | **하단 1px `line/gray/subtle`** |
| 그림자 | 0 2px 15/30px | `shadow/dropdown` 재사용 |

`Depth` 축의 뜻도 바뀌었다 — **Item**: 1depth=카테고리 제목(Bold) · 2depth=항목(Medium) / **패널**: 1depth=항목만 · 2depth=제목+항목.

## 다음에 할 일 (순서대로)

1. **🤖 `component-verifier` 실제 spawn** — `build-components.ts` 구조 변경 전건. 이게 Gate 13 을 푸는 유일한 길이다.
   - **작업트리를 멈춘 상태로** 돌려라. 앞 검증은 도중에 대상이 두 번 바뀌어 판정을 못 했다.
   - 특히 **`Assist Button` 과 A 기준 GNB 2세트는 한 번도 검증되지 않았다.**
   - 통과하면 검증자가 직접 `node scripts/installer-build-verify-check.js --record --by component-verifier --change structural`
2. `npm run gate:check` 초록 확인 → **경로 지정 커밋** `git commit -- <paths…>`
   (같은 폴더를 다른 세션이 쓴다. `git add` 후 커밋하면 남의 파일이 딸려 간다 — 2026-07-13 실제 사고)
3. `npm run board:refresh` 후 검수판 아티팩트 재게시(스크립트는 게시 못 함)

## river 결정 — 전부 닫힘

**크기 단어 `xl` 추가 = 승인됨.** river 2026-09-08 **"xl 그대로 가"**.
`registry/governance/size-naming-policy.json` 의 `allowedSizeWords` 가 5개→6개(xxsm·xsm·sm·md·lg·**xl**)가 됐다.
모달 XL(1200) 이 이 단어를 쓴다. 되돌릴 이유 없음.

## 믿지 말 것

- A 실측은 ⭐ 가 Figma MCP 로 **직접** 읽었다(540:6423·540:6458). 🤖 를 거치지 않았다.
- 새 컴포넌트 5개는 **Figma 캔버스에 실제로 설치해 본 적이 없다.** 설치기 zip 에는 들어가 있다(확인함).
- 웹 배포본(dist)에는 새 컴포넌트 5개가 **없다.** 전부 "정본만 신설, 웹은 별도 작업"으로 분류했다.

## river 가 준 새 규칙 (기억에 저장됨)

**신규 컴포넌트는 끝까지 혼자 만들지 말고 중간에 보여주고 확인받는다** — 사이트에 올리거나 설치기로 Figma 에서 테스트하게.
(`~/.claude/projects/…/memory/new-component-needs-midway-confirm.md`)
