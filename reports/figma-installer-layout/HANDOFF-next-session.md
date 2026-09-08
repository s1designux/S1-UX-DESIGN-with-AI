# 인계 — Figma 설치기 배치·정리 결함 2건

> 작성 2026-09-08. 원 세션(「Figma 설치기 배치·정리 결함」)은 **river 결정 2건을 기다리다 종료**됐다.
> 코드 변경은 **0건**이다. 조사 결과만 아래에 남긴다. 이 문서 전체를 읽고 이어받으면 된다.

## ⬇️ 붙여넣기용 프롬프트

````text
S1-UX-DESIGN-with-AI 저장소. Figma 설치기(plugins/figma-vars-installer)의 배치·정리 결함 2건을 이어받는다.
먼저 reports/figma-installer-layout/HANDOFF-next-session.md 전체를 읽어라. 착수 전 river 결정 2건이 필요하다.
````

## 1️⃣ river 결정 대기 2건 (착수 전 필수)

| # | 무엇을 정해야 하나 | 선택지 | 안 정하면 |
|---|---|---|---|
| D-1 | 두 결함을 함께 고칠지 | (A) 2건 동시 진행 (B) 결함 1만 먼저 | 착수 못 함 |
| D-2 | 2026-09-08 설치 때 부품 3개가 실패한 **화면상 실패 사유 문구**를 river가 알려줄 수 있나 | (A) 알려준다 → 원인 확정 가능 (B) 모른다 → 일부러 실패시켜 재현만, **원인은 미확정으로 남김** | (B)로 진행 |

## 2️⃣ 결함 1 — 달력 부품 설명 시트가 설치할 때마다 쌓인다 (재현됨)

- `build-components.ts:6737` `isDepSet`(Calendar Cell·Calendar Tile) 두 부품만 **이미 있어도 매번 다시 만든다.**
- 옛 산출물을 지우는 `removeByNames`(`:6641`)는 함수 진입 시 캡처한 **페이지 최상위 노드만** 훑는다. 첫 설치 뒤 시트는 SECTION 안으로 들어가 최상위에 없다 → 안 지워지고 겹쳐 쌓인다. 실측 2벌씩. river가 "컴포넌트가 다 중복돼 엉망"이라고 본 것이 이것.
- **예외는 유지가 맞다**(조사 완료): 달력 패널이 쓰는 부속품이라, 재설치 때 빠진 크기(SM)를 채우려고 2026-09-04 SM 신설 때 일부러 넣은 장치다. 한계는 `:3975` 주석에 이미 적혀 있다.
- → 고칠 곳은 **"옛 것 지우기"의 범위**뿐이다. 페이지 전체(재귀)로 넓힌다.

## 3️⃣ 결함 2 — 부품 1개 설치 실패가 페이지 배치 전체를 무너뜨린다 (기전 확인 · 인과 미확정)

- `:6718` 부근 layout 패스가 각 멤버의 담당 구역을 **맨 위 -Infinity · 맨 아래 +Infinity** 로 잡고, 대상이 그 카테고리가 아니라 **페이지의 모든 최상위 노드**다. `wrapCategoryInSection`(`:7025`)도 "y밴드에 든 모든 노드"를 섹션에 담는다.
- 구성이 어긋나면 한 멤버 구역이 남의 부품을 삼키고 그 덩치만큼 다음 멤버가 밀린다. 실측: Navigation 섹션 84,178px, 그 안에 Form Control 소속 Input·Search Input·Text Area가 들어가 있었다. 3개(GNB Sub Menu·GNB Sub Menu Item·Assist Button)가 정상 설치되자 최대 6,244px로 복귀.
- **원인 가설(미확정):** 셋 다 2026-09-08 신규 부품이고 같은 커밋에 새 색 4개가 함께 들어갔다 → 새 색을 설치 안 한 상태에서 부품만 설치했을 가능성. D-2 답이 있어야 확정된다.
- → 고칠 방향: 배치·섹션 담기가 **"화면상 y 위치로 짐작"하는 방식을 버리고 "이번 실행에서 내가 만든 노드"로 소유권을 확정**한다. 실패가 나도 남의 부품을 삼키지 못하게.

## 4️⃣ 지켜야 할 것

- `build-components.ts` 구조 변경 = **하드룰 H1②**. 빌드는 직접 가능하나 검증은 🤖 `component-verifier` 실제 spawn 필수 → 통과 후 `node scripts/installer-build-verify-check.js --record --by component-verifier --change structural --note "..."` 로 Gate 13 기록. 그전엔 커밋이 훅에 막힌다.
- **회귀 대조:** HEAD 소스를 사본 디렉터리에 두고 같은 Figma mock으로 양쪽을 돌려 좌표·크기 포함 전 노드를 대조한다(`scripts/lib/figma-build-mock.js` 의 `runBuild` + esbuild 번들). ⚠️ **이 mock은 `createSection`을 만들지 않는다**(`:7032`·`:6992`가 mock에서 no-op) — 즉 **결함 2가 사는 그 단계는 대조 범위 밖**이다. "mock 통과 = 배치 안전"이라고 말하지 말 것.
- 실물 확인은 사람만 가능하다. **원본이 아니라 사본 파일**에서 river에게 부탁한다.
- 같은 파일에서 **"설치기 제자리 갱신(upsertSet)"** 작업이 설계 결함으로 보류돼 있다(부품 속을 통째로 갈아끼워 인스턴스 오버라이드가 지워짐 — 실측). 경위는 `reports/figma-library-build/input-state-focus/7-installer-upsert-verification.md`, 코드는 같은 폴더 `upsert-in-place.patch`. 착수 시 `git status` 로 먼저 확인.

## 5️⃣ 원 세션이 계획했던 흐름 (참고)

🔧 두 곳 수정 → 🔎 좌표·섹션까지 재현하는 검증판으로 「일부러 실패시킨 설치」 대조 → 🔎 변경 전 코드와 전 노드 회귀 대조 → 🤖 component-verifier 독립 검증 → 🚧 Gate 기록·커밋 → 🙋 river 실물 확인(사본 파일)
