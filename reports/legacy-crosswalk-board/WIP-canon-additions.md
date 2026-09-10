# 정본 보강 시공 기록 (2026-09-08)

> 승인·사양 정본 = `PLAN-canon-additions.md` · 인계 = `HANDOFF-next-session.md`
> 결정 원본 = <https://claude.ai/code/artifact/b76d3281-5e63-453a-894b-dabc971a1bd4>
> **이 파일은 "지금 정본이 무엇인가"만 적는다.** 폐기된 중간안은 남기지 않는다(그것이 앞서 두 번 오독을 낳았다).

## 만든 것 — 신규 컴포넌트 5 · 신규 색 4 · 기존 세트 변경 1

| 무엇 | 축 | 근거 원본 |
|---|---|---|
| `Assist Button` | State 4 · **크기 축 없음**(60×32) · 배경·기본테두리는 secondary 토큰 차용 | A `pc_assist_button` 540:4650 |
| `Text Button` | Variant 2 × State 4 | A `pc_text_button` 540:4705 |
| `Modal Content` | Size(MD·LG·XL) × Footer 2 | A `pc_modal` 540:5815 |
| `GNB Sub Menu` | **Type 3**(regular · compact-1 · compact-2) — 2026-09-09 개편(당초 Depth 2) | A `gnb list` 540:6398 (변형 `regular` 540:6423 · `compact-1` 540:6399 · `compact-2` 540:6407) |
| `GNB Sub Menu Item` | Depth 2 × State 3 | 〃 |
| `Mobile Header` | `Home / Title + 1 Icon` 1종 추가(6→7) | A `mobile_header` 540:6112 |

**신규 색 4** — `color/button/border/assist--hover` · `label/assist--default` · `label/assist--hover` + `color/navigation/submenu/label/default`.
> ⚠️ 한때 보조 버튼 색을 **6개 한 벌**로 만들었다가 river 결정으로 **3개로 줄였다.** 원본(540:4651)은 배경(기본·hover)과
> 테두리(기본)를 **secondary 토큰에서 그대로 빌려 쓰고** 전용 이름은 3개뿐이다. 지운 3개는 secondary 와 값이 완전히
> 같았으므로 **보이는 색은 한 톨도 안 바뀐다.** ("원본은 3개"를 알린 뒤 river 가 원본 충실을 선택)

**Gate 34 승인 10건 기록 완료**(색 4 + 컴포넌트 5 + 슬롯 속성 `Columns` 1) — 정본에 실재하는 항목만 남긴다. 인용문은 전부 river 실제 발화이며 세션기록에 실재한다.

## river 결정 (전부 반영됨)

| 무엇 | 결정 |
|---|---|
| 보조 버튼 다크 글자색 | `#8A8C96` — 일반 버튼(`#B8BABF`)보다 한 단계 옅게 |
| 보조 버튼 전용 색 개수 | **3개** — 원본이 쓰는 것만. 배경·기본 테두리는 secondary 차용 |
| 보조 버튼 구조 | **Button variant 아님. 별도 컴포넌트** — "한사이즈밖에 없고 버튼에 섞이면 안돼" |
| 모바일 상단바 | `Home / Title + 1 Icon` 1종 추가 |
| 하위메뉴 기준 원본 | **A** (B 는 폐기) — "A로 가" |
| 하위메뉴 2단 글자색 | `#555555`(색표에 있는 값) — 새 색 만들지 않음 |
| 하위메뉴 컬럼 사이 간격 | **80** — 원본 72 는 정본 64·80 의 등거리라 렌더 비교 후 확정 |
| 하위메뉴 목록 줄 간격 | **regular 24 · compact-2 20** — 각 유형의 A 실측 그대로. ⚠️ 2026-09-08 에는 "두 깊이 한 리듬"으로 24 통일이었으나, 그때는 정본에 compact 변형 자체가 없었다. 2026-09-09 river 가 원본 compact-1·compact-2 를 정본에 넣기로 하면서 유형별 원본값으로 갈음됐다(river 결정: 줄간격 20 — 원본 그대로) |
| 콘텐츠 모달 닫기(X) | **확인 계열과 같은 부품**(`close`) — 그림은 동일, 부품만 통일 |
| 크기 단어 `xl` | 어휘에 추가 승인 — "xl 그대로 가" |
| 확인 계열 모달 | **크기 축 없음** — PC 360 · Mobile 300(river 발화 "확인계열은 360으로만") |
| 콘텐츠 계열 모달 | **MD 이상**(MD 520×336 · LG 1000×587 · XL 1200×587), 본문은 회색 박스 + "컨텐츠 영역" |
| 콘텐츠 계열 제목·푸터 버튼 | **확인 계열과 같게** — 제목 16B · 버튼 XXSM h28 |

## GNB 하위메뉴 — A 실측 → 정본 토큰

| 항목 | A 실측 | 정본 |
|---|---|---|
| 카테고리 제목(1단) | Bold 16 `title/16B` #353535 | `navigation/submenu/label/default` |
| 항목(2단) | Medium 16 `title/16M` #555 | `navigation/label/default` |
| 들여쓰기 | 없음 | 없음 |
| 컬럼(묶음) 안 세로 간격 | regular 24 · compact-2 **20** | `spacing/24` · `spacing/20` (유형별 원본값 — 2026-09-09 river 갈음) |
| 컬럼 사이 간격 | 72 | `spacing/80` (river 확정) |
| 패널 여백 | regular 위32/아래64 · compact-1·compact-2 상하24 | `spacing/32`·`spacing/64`·`spacing/24` |
| 좌우 | `justify-center` | 가운데 정렬(값이 아니라 규칙) |
| 하단선 | 1px `line/gray/subtle` | 같은 토큰 |
| 그림자 | 0 4px 4px 15% | `shadow/dropdown` 재사용 |

축 — **Item**: `Depth` 1depth=카테고리 제목(Bold) · 2depth=항목(Medium).
**패널**: `Type` regular=제목+항목(4열 5·3·4·5) · compact-1=항목 6개 한 줄 · compact-2=묶음 5개, 묶음마다 항목 2개까지(2·2·2·2·1).
(2026-09-09 개편 — 당초 패널도 `Depth` 1depth/2depth 였으나 1depth 가 원본의 어느 콤팩트와도 맞지 않는 근사치였다.)

## 레거시와 일부러 다르게 간 것 (§두 갈래 분류 (b))

| 무엇 | 레거시 | 정본 | 근거 |
|---|---|---|---|
| 콘텐츠 모달 제목 | 18B | **16B** | river 지시 "타이틀도 확인계열에 따르면 돼" |
| 콘텐츠 모달 푸터 버튼 | h34 | **XXSM h28** | 〃 |
| 하위메뉴 컬럼 간격 | 72 | **80** | river 렌더 비교 후 확정 |
| 하위메뉴 Hover | 없음 | 선택색과 같게 | GNB Menu 선례(사전 등록된 개선) |
| 보조·텍스트 버튼 Pressed | 없음 | = Hover | 코어 Button 정본 규칙 |
| 콘텐츠 모달 닫기 부품 | 상단바와 같은 부품 | `close`(확인 계열과 같음) | river 결정 — 두 모달 계열이 같은 부품을 가리키게 |
| 하위메뉴 목록 줄 간격 | compact 판 20 | ~~24~~ → **유형별 원본값(regular 24 · compact-2 20)** | river 결정 2026-09-08 "두 깊이 한 리듬"(24) → **2026-09-09 갈음**. 당시엔 정본에 compact 변형이 없어 근사 변형 하나에만 걸린 결정이었고, river 가 원본 compact-1·compact-2 를 정본에 넣기로 하며 "20 — 원본 그대로"를 골랐다 |

## 검증 이력 (🤖 component-verifier)

**10회 실행.** 잡힌 ❌(a) 누계 **17건** — 전부 수정됨. 10회차 PASS 로 Gate 13 기록 완료.
주요한 것: 하위메뉴 패널이 가운데가 아니라 좌측에 붙던 것 · 모달 파생 2곳 거짓 서술 ·
폐기된 B 출처 잔존 · 컬럼 간격이 토큰 아닌 생짜 숫자 · 콘텐츠 모달 세로 간격 근거 없이 20(→32) ·
주석이 코드와 반대(제목·버튼).

**반복된 실패 모양 2가지 — 다음 사람이 같은 걸 밟지 않도록:**
1. **주석·문서만 고치고 코드를 안 고치거나, 그 반대.** 이번 작업에서만 3번 났다.
2. **기준 원본이 바뀌었는데 옛 수치 서술이 다른 파일에 남는다.** B→A 교체 때 4개 파일에 잔재가 남았다.

## 안내 화면의 손박이 목록 (웹 작업 때 필요)

`assets/js/ui-library-guide.js` 에 컴포넌트별 variant 목록과 `approvedScope` 문구가 손으로 박혀 있다.
여기를 안 고치면 **Gate 19 는 통과하는데 화면에는 안 나온다**(속성 선언만 보고 DOM 은 안 본다).
사후 검문은 `node scripts/ui-guide-render-check.js`.

## 아직 안 한 것

- 새 컴포넌트 5개를 **Figma 캔버스에 실제 설치해 본 적 없다.** 설치기 zip 에는 들어가 있다.
- 웹 배포본(dist)·안내 페이지에 새 컴포넌트 5개가 **없다.** 전부 "정본만 신설, 웹은 별도 작업"으로 분류했다.
