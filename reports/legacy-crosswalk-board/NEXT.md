# 레거시 대응 검수판 — 다음 작업 인계서

> **새 세션은 이 파일 하나만 읽으면 이어서 할 수 있다.** 앞 대화를 몰라도 된다.
> 작성 2026-09-04 · 기준 커밋 `bd32673`

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

---

## ▶ 다음에 할 일 — ③ 정본 보강 4건

river 지시(2026-09-04): **"①확인만 하면 되는 것 → ②D-09 카드 다시 짜기 → ③정본 보강 4건(건별 계획 확인 후)"**
①②는 끝났다. **③부터 시작한다.**

> ⚠️ **네 건 모두 정본(`build-components.ts`)에 없던 것을 만드는 일이다.**
> 하드룰 H6② — ⭐ 가 정본에 새 항목을 임의로 만들지 않는다. **건별로 "이렇게 만들게요"를 river 에게 보이고 승인받은 뒤** 착수한다.
> 승인은 `node scripts/canon-addition-check.js --approve --by river --reason "…" --quote "<river 실제 발화 그대로>"` 로 기록하고 **Gate 34** 가 집행한다.
> `--quote` 는 세션기록의 사람 발화에 실재해야 통과한다. 아래 각 건의 「river 원문」을 그대로 쓸 수 있다.

### D-13 — 보조 버튼 · 텍스트 버튼을 정본에 추가

- **river 원문:** `정본에 추가하는 작업 추후 진행해야함`
- **레거시:** `pc_assist_button` · `pc_text_button` · `m_subbutton`
- **정본 현재:** Button variants = `primary` · `secondary` · `blue-line` (`build-components.ts` 상단 VARIANTS). 대응 없음.
- **정해야 할 것:** 새 variant 이름 · 각 상태(default/hover/pressed/disabled)의 색 토큰 · 크기 축을 기존 그대로 쓸지.
- **주의:** 색은 반드시 Semantic 경유(HEX 금지). 정본에 토큰이 없으면 만들지 말고 needs-decision.

### D-15 — 모달에 크기 축 추가

- **river 원문:** `크기는 지금도 있어야 함 — 정본 보강 대상`
- **레거시:** A PC 모달 `sm` · `md` · `lg` · `xl` 4크기 + 용도별 모달(삭제·입력취소 등)
- **정본 현재:** `buildModalShell`(`build-components.ts:4629`) — 변형축은 `Break=PC|Mobile, Footer=…` 뿐이고 **크기 축 없음**. 폭은 코드에 리터럴(PC 360 · Mobile 300).
  배포본 매니페스트도 `sizeAxis: "정본에 크기 축이 없다 — Break(PC·Mobile)가 패널 폭과 밀도를 결정한다"` 라고 선언한다.
- **정해야 할 것:** 크기 이름(레거시 sm/md/lg/xl 을 그대로 쓸지) · 각 크기의 폭 · Break 축과 어떻게 겹치는지.
- **주의:** 지금 Break 축이 폭을 정하고 있으므로 **축이 둘로 늘어난다.** 배포본 매니페스트 선언문도 함께 고쳐야 한다.

### D-17 — 모바일 상단바 '홈 + 타이틀 + 아이콘' 유형 (⚠️ 애매)

- **river 원문:** `아이콘 두개있는 버전과 앱바는 사용하지않음.  그런데 다시보니 홈+타이틀+아이콘 유형이 누락됨. 제작후 삭제된 두개유형은 홈+타이틀+아이콘 유형으로 변경하면됨`
- **정본 현재:** `MOBILE_HEADER_TYPES`(`build-components.ts:3059`) 6종 —
  `Home / Title` · `Home / Title + Subtitle + 1 Icon` · `Standard / Title` · `Standard / Title + Close` · `Standard / No Title` · `Standard / No Title + Close`
- **확인된 이력:** `build-components.ts:3053` 주석 — **2026-08-25 river: "Home / Title + 2 Icons" 는 실제로 쓰지 않는 기준이라 삭제.** (삭제 기록은 **이 한 종류뿐**)
- **⚠️ 먼저 river 에게 확인할 것 (추측 금지):**
  1. river 는 **"삭제된 두 개 유형"** 이라고 했는데 코드에는 **삭제 기록이 한 종류뿐**이다. 나머지 하나가 무엇인지 확인해야 한다.
  2. 필요한 것이 `Home / Title + 1 Icon`(부제 없음)인지, 기존 `Home / Title + Subtitle + 1 Icon` 을 고치라는 것인지 확인해야 한다.
- **주의:** 이건 **2026-08-25 결정을 뒤집는 방향**일 수 있다. 확인 없이 손대지 말 것.

### D-18 — GNB 하위메뉴 깊이 축 추가

- **river 원문:** `하위메뉴 깊이에 대한 내용도 추가 필요`
- **레거시:** A `gnb list`(메뉴 목록) · B `gnb` 의 `1depth/2depth` 축
- **정본 현재:** `buildGNB`(`build-components.ts:3256`) — GNB 바 변형은 `Align=…, Size=…`, 자식 세트 `GNB Menu` 변형은 `Size=…, State=…`. **깊이 축 없음.**
  메뉴 자리는 Figma 슬롯("Menus")으로 개수 조절만 된다(river 지시 2026-09-03).
- **정해야 할 것:** 깊이를 GNB Menu 의 변형축으로 넣을지, 별도 컴포넌트(하위메뉴 패널)로 만들지 · 2depth 의 모양·색.
- **주의:** GNB 는 웹 배포본(dist)에 없다 — Figma 정본·설치기만 있다.

---

## 그 밖에 열려 있는 것 (③ 과 별개)

| | 상태 |
|---|---|
| **D-05** 바텀시트 | 정본·설치기엔 4종 다 있음(확인 완료). **웹 배포본(dist)에는 범용 시트·항목이 없다** → 웹으로도 만들지 river 결정 대기 |
| **D-09** 시간 선택 | 층 맞춰 재구성 완료. 트리거의 `selected`·`completed` 대응 + 정본에 없는 **셀렉트형 트리거** 처리 → river 결정 대기 |
| **D-11** 달력 부품 | 칸·타일·연월 화면 다 있음(확인 완료). **화살표만** 정본은 헤더 안 아이콘, 레거시는 별도 컴포넌트 → 별도 컴포넌트로 만들지 river 결정 대기 |
| **D-19** 폼 묶음 | river: `패턴으로 볼지 컴포넌트로 볼지 모호해서 논의 필요` — 미결 |
| **D-06** 로그인 pc-sm | river 가 **높이로 매칭하라**는 규칙을 줬다. **레거시 pc-sm 의 실제 높이를 Figma 원본에서 아직 안 읽었다** → 읽어야 확정 |

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
