# 레거시 대응 검수판 — 다음 작업 인계서

> **새 세션은 이 파일 하나만 읽으면 이어서 할 수 있다.** 앞 대화를 몰라도 된다.
> 작성 2026-09-04 · 기준 커밋 `bd32673` · **2026-09-07 갱신:** ③ 4건의 계획서 = `PLAN-canon-additions.md` (river 결정 12개 대기). D-06 은 실측으로 확정됨.

---

## 이게 무슨 작업인가

레거시 디자인 가이드 두 벌(**A** = SW UX GUIDE V2.4 · **B** = S-1 Component Set)을 지금 정본으로 옮길 때,
**이름이 안 맞아 자동으로 못 붙이는 23건**을 river 가 하나씩 결정하는 작업이다.

- 결정하는 화면(검수판) = 아티팩트 <https://claude.ai/code/artifact/1d9843c0-fd38-48d5-9605-6ce8400e61a5>
- 결정 결과 정본 = **`reports/legacy-crosswalk-board/crosswalk.json`** (저장소)
- 검수판 원본 = `board.template.html` + `screens/**` → `npm run board:build` 로 조립(`board.html` 은 git 제외)

### 쓰는 명령

| 명령 | 하는 일 |
|---|---|
| `npm run board:refresh` | 정본 화면 다시 캡처 + 사실표 갱신 + 조립 |
| `npm run board:build` | 다시 찍지 않고 조립만 |
| `npm run board:check` | Gate 47 — 검수판이 정본보다 낡았는지 |
| `npm run board:facts` | 정본 사실표(`canon-facts.json`)만 다시 뽑기 |

**게시는 스크립트가 못 한다.** `board.html` 을 만든 뒤 Claude 가 Artifact 도구로 **같은 URL 에** 다시 올린다.
검수판에서 river 가 고른 답은 아티팩트 자체 저장소(`collection "decisions"`)에 있다 — Artifact `read_db` 로 읽는다.

---

## 지금까지 (전부 커밋됨)

| 커밋 | 내용 |
|---|---|
| `661d812` | 검수판 자동 재캡처 + Gate 47 신선도 검사 신설 |
| `d9341e5` | 검수판 그림을 파일로 분리(재캡처마다 5MB 쌓이던 것 해소) |
| `0d8afe7` | **정본의 화면 축(PC/Mobile)을 빠뜨려 틀린 전제였던 카드 10장 교정** + 정본 사실표 자동 삽입 |
| `20318fe` | river 결정 23건 전부 대응표에 기록 |
| `bd32673` | D-05·D-11 정본 확인 완료 · D-09 층 맞춰 재구성 |
| 2026-09-07 | ③ 4건 레거시 실측(🤖 figma-inspector) + 계획서 `PLAN-canon-additions.md` · **D-06 확정**(pc-sm 34 = 정본 XSM 34) |

---

## ▶ 다음에 할 일 — ③ 정본 보강 4건 **시공** (결정 끝남)

**2026-09-08: 결정 12건이 전부 닫혔다.** river 가 결정 화면에서 3건을 직접 고르고 9건은 추천안으로 확정했다.
시공 사양 = `PLAN-canon-additions.md` 의 「✅ 확정된 12건」 표와 그 아래 각 건의 '이렇게 만들게요'.
결정 화면 = <https://claude.ai/code/artifact/b76d3281-5e63-453a-894b-dabc971a1bd4> (답 원본은 그 아티팩트의 `collection "decisions"`).

river 가 고른 3건:
- **보조 버튼 다크 글자색 = `#8A8C96`** (일반 버튼 `#B8BABF` 보다 한 단계 옅게 — 라이트와 같은 위계)
- **모바일 상단바 = `Home / Title + 1 Icon` 1종 추가** (⭐ 해석 확인됨: 없앤 둘 = 아이콘 2개 버전 + 앱바)
- **하위메뉴 2단 글자색 = `#555555`** (색표에 있는 값 — 새 색 만들지 않음. 레거시 `#646464` 는 채택 안 함)

### ✅ 승인 확보됨 (2026-09-08) · ⛔ 남은 차단 요인 하나

**river 승인 발화(2026-09-08T00:58Z, 세션 기록에 실재 — 게이트 검색으로 4개 문구 전부 확인함):**

> 보조 버튼 다크 글자색은 한 단계 옅은 #8A8C96 으로, 모바일 상단바는 홈+타이틀+아이콘 1개 한 종류 추가로, 하위메뉴 2단 글자는 #555555 로 승인합니다. 나머지 9건은 추천안대로 진행하세요.

Gate 34 승인 기록에 쓸 인용 조각(그대로 복사해 쓸 것 — 셋 다 실재 확인됨):

| 대상 | `--quote` 에 넣을 조각 |
|---|---|
| 보조 버튼 토큰 6개 | `보조 버튼 다크 글자색은 한 단계 옅은 #8A8C96 으로` |
| Mobile Header 유형 1종 | `모바일 상단바는 홈+타이틀+아이콘 1개 한 종류 추가로` |
| GNB Sub Menu 세트 2개 | `하위메뉴 2단 글자는 #555555 로 승인합니다` |
| Text Button 세트 · Modal Size 축 | `나머지 9건은 추천안대로 진행하세요` |

**⛔ 남은 차단 요인 — 같은 작업트리를 다른 세션이 쓰는 중.**
`build-components.ts`(09:14 수정) · `pattern-data.ts` · `pages/components.html` · `registry/components/{select,dropdown,filter-chip,input}.json` 등 **미커밋 95개**가 남아 있고,
그 세션은 09:50 에도 파일을 쓰고 있었다(살아 있음 — 유령 작업 아님). `gate:check` 는 그 작업 때문에 error 50건으로 실패 중이다(Gate 13·19 등).

기억된 정본 지침 그대로 따른다: **같은 파일을 동시에 고치지 않는다. 그 세션이 커밋할 때까지 편집 대기.**
(2026-07-13 재발 기록 — 개별 `git add` 로도 못 막았다. index 가 세션 간 공유라 커밋 순간 남의 파일이 딸려 간다.)
**커밋은 반드시 경로 지정형으로:** `git commit -- <path1> <path2> …`

### 시공 순서 (다른 세션이 커밋한 직후 실행)

1. 정본 편집 → 새 이름이 생기면 Gate 34 가 잡는다 → 위 표의 조각으로 건별 승인 기록
   `node scripts/canon-addition-check.js --approve --by river --reason "…" --quote "<위 표의 조각>"`
2. 새 토큰 6개(`vars-data.ts`, 보조 버튼 bg·border·label 의 default/hover) → `npm run tokens:reconcile`
   · **2단 글자 토큰은 신설하지 않는다**(⑩ 확정 — 기존 `color/navigation/label/default` 재사용)
3. `build-components.ts` — Assist variant · Text Button 세트 · Modal Size 축 · 상단바 1종 · GNB Sub Menu 2세트
4. 🤖 `component-verifier` 실제 spawn → Gate 13 기록 (⭐ 자가검증 금지)
5. `components:facts:write` · `guide-model:write` · `installer:build` → Figma 설치 후 렌더 대조
6. `npm run board:refresh` → Gate 전체 통과 후 커밋

## 그 밖에 열려 있는 것 (③ 과 별개)

| | 상태 |
|---|---|
| **D-05** 바텀시트 | 정본·설치기엔 4종 다 있음(확인 완료). **웹 배포본(dist)에는 범용 시트·항목이 없다** → 웹으로도 만들지 river 결정 대기 |
| **D-09** 시간 선택 | 층 맞춰 재구성 완료. 트리거의 `selected`·`completed` 대응 + 정본에 없는 **셀렉트형 트리거** 처리 → river 결정 대기 |
| **D-11** 달력 부품 | 칸·타일·연월 화면 다 있음(확인 완료). **화살표만** 정본은 헤더 안 아이콘, 레거시는 별도 컴포넌트 → 별도 컴포넌트로 만들지 river 결정 대기 |
| **D-19** 폼 묶음 | river: `패턴으로 볼지 컴포넌트로 볼지 모호해서 논의 필요` — 미결 |
| **D-13·15·17·18** | 결정 끝남(2026-09-08) — 위 ③ 참조. 남은 것은 승인 인용문과 작업트리 정리뿐 |

---

## 믿지 말 것 · 아직 확인 안 한 것

- **D-09 의 층 대응표**는 ⭐ 가 레거시 **화면과 변형 축 이름**을 보고 정리한 것이다. Figma 원본의 구조 데이터까지 읽어 확인하지 않았다.
- **레거시(Figma A·B)의 실제 수치**는 이 작업에서 거의 읽지 않았다. 검수판에 박힌 레거시 그림은 캡처이고, 치수는 변형 축 이름뿐이다.
- 이 검수판은 **정본 쪽 사실을 세 번 틀렸다**(바텀시트 2회 · 화면 축 1회). 카드 본문의 서술보다 **카드에 박힌 「지금 정본」 사실표**(기계가 뽑은 것)를 믿을 것.
- `crosswalk.json` 의 `quote` 는 river 의 말 그대로이고, `note`·`확인` 은 ⭐ 가 옮긴 것이다. 둘을 구분할 것.

## 이 작업에서 두 번 반복된 실수 (같은 실수 금지)

1. **정본을 평면으로 요약하다 축을 잃는다** — 크기 목록만 보고 화면 축(PC/Mobile)을 빠뜨려 10장이 틀렸다.
   → 이제 `npm run board:facts` 가 뽑는 사실표를 쓴다. **사람이 요약해서 카드에 적지 말 것.**
   (반복 패턴 `canon-axis-flattened-in-summary`)
2. **"정본에 없다"를 확인 없이 단정한다** — 바텀시트가 정본에 4종이나 있는데 "없다"고 두 번 적었다.
   → 없다고 쓰기 전에 `build-components.ts` 의 빌더 함수와 설치기 등록 목록(파일 끝 부근)을 **직접 grep** 할 것.
