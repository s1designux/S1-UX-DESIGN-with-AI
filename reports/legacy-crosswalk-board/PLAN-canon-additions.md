# 정본 보강 4건 — 시공 사양 (결정 12건 확정 · river 승인 완료 2026-09-08)

> 작성 2026-09-07 · 인계서 `NEXT.md` ③ 단계. **네 건 모두 정본(`build-components.ts`·`vars-data.ts`)에 없던 것을 새로 만드는 일**이라
> 하드룰 H6② 에 따라 **건별로 river 승인을 받은 뒤** 착수한다. **승인은 2026-09-08 확보됐다** — 인용 조각은 `NEXT.md` 「승인 확보됨」 표에 있고 네 문구 모두 세션 기록에 실재함을 확인했다.
>
> **결정 화면(2026-09-08 게시):** <https://claude.ai/code/artifact/b76d3281-5e63-453a-894b-dabc971a1bd4> — 막혀 있는 3건(③ 보조 버튼 다크 글자색 · ⑦ 상단바 해석 확인 · ⑩ 하위메뉴 2단 글자색)을
> 표본으로 비교해 고르는 검수판. river 가 고른 답은 그 아티팩트 저장소 `collection "decisions"` 의 `d13`·`d17`·`d18` 문서에 남는다 —
> Artifact `read_db` 로 읽는다(`d17` 은 B 를 고르면 `memo` 필드에 사유가 함께 들어온다). 나머지 9건은 추천안대로 진행.
>
> 레거시 수치는 2026-09-07 🤖 `figma-inspector` 가 Figma MCP 로 실측한 값이다(A = SW UX GUIDE V2.4 `yE5UCFEbmXJBlYJWB24Lz2` · B = S-1 Component Set `vHg5UOMMYI77RHH6vVVppu`).
> 정본 현재 상태는 ⭐ 가 `build-components.ts`·`vars-data.ts` 를 직접 grep 한 것이다(단일 값·이름 조회 — H5 예외).
> **레거시 hex → Foundation 이름 대응은 `vars-data.ts` FOUNDATION 표에서 같은 hex 를 찾은 것이며, 없는 hex 는 "없음"으로 적고 추측하지 않았다.**

> ## ⚠️ 이 문서는 **착수 전 계획서**다 — 시공 결과와 다른 곳이 있다
>
> 아래 **네 곳**은 시공 중 river 결정으로 **바뀌었다.** 지금 정본이 무엇인지는 **`WIP-canon-additions.md`** 를 보라.
>
> | 계획서 | 실제 정본 | 왜 |
> |---|---|---|
> | 보조 버튼 = Button 의 variant (48→64) | **`Assist Button` 별도 세트**(크기 1종 60×32) | "한사이즈밖에 없고 버튼에 섞이면 안돼. 별도 컴포넌트야" |
> | `Modal` 에 Size 축 추가(4→10변형) | **철회.** `Modal` 은 360 단일 · 새 세트 **`Modal Content`**(MD·LG·XL) | 4크기는 콘텐츠 계열 것이었다 — "확인계열은 360으로만" |
> | GNB 하위메뉴 = B 기준(1단 `body/16M` · 2단 14px `#646464`) | **A 기준**(1단 Bold16 `title/16B` · 2단 Medium16 `title/16M` #555) | "A로 가" |
> | 보조 버튼 새 토큰 6개 | **3개** — 배경·기본테두리는 secondary 차용 | 원본이 그렇게 돼 있다 |
>
> 그 밖에 결정 ①(보조 버튼 높이 32→XSM 34)도 별도 세트가 되면서 **레거시 32 를 그대로** 쓴다.

---

## ✅ 확정된 12건 (2026-09-08)

river 가 결정 화면에서 3건을 직접 고르고, 나머지 9건은 추천안으로 확정했다. 결정 화면 = <https://claude.ai/code/artifact/b76d3281-5e63-453a-894b-dabc971a1bd4>
(고른 답 원본은 그 아티팩트 저장소 `collection "decisions"` 의 `d13`·`d17`·`d18`).

| # | 무엇 | 확정 | 어떻게 정해졌나 |
|---|---|---|---|
| 1 | 보조 버튼 높이 | 기존 크기 축 그대로, 레거시 32 는 XSM(34) 로 | 추천안 |
| 2 | 보조 버튼 아이콘 | 이번엔 넣지 않음(별건) | 추천안 |
| **3** | **보조 버튼 다크 글자색** | **#8A8C96 — 일반 버튼보다 한 단계 옅게** | **river 직접 선택** |
| 4 | 모바일 서브버튼 | 이번엔 PC 텍스트 버튼만(별건) | 추천안 |
| 5 | 모달 크기 이름 | SM · MD · LG · XL | 추천안 |
| 6 | 모달 LG·XL 높이 | 네 크기 모두 내용 따라(hug) | 추천안 |
| **7** | **상단바 해석** | **맞음 — `Home / Title + 1 Icon` 1종 추가** | **river 직접 선택** |
| 8 | 그 아이콘 | 알림(종) 1개 | 추천안 |
| 9 | GNB 구조 | 바에 축 추가하지 않고 별도 패널 세트 | 추천안 |
| **10** | **하위메뉴 2단 글자색** | **#555555 (색표 gray/600) — 새 색 만들지 않음** | **river 직접 선택** |
| 11 | 2단 굵기 | Medium | 추천안 |
| 12 | A 파일 3단 구성 | 넣지 않음(B 의 1단/2단으로 통일) | 추천안 |

> 아래 각 건의 「결정해 주세요」 항목은 **이 표로 전부 닫혔다.** 값·구조는 그대로 시공 사양으로 읽으면 된다.
> 단 **⑩ 확정에 따라 D-18 의 2단 글자 토큰은 새로 만들지 않는다** — 색표에 이미 있는 상단 메뉴 글자 토큰(`color/navigation/label/default`, 라이트 gray/600)을 그대로 쓴다.

---

## D-13 보조 버튼 · 텍스트 버튼

### 레거시 실측 (🤖 figma-inspector)

**A `pc_assist_button` (540:4650)** — 변형 9개: variants=default/icon_lead/icon_trail × state=default/hover/disabled

| 항목 | 레거시 값 | 정본 대응 |
|---|---|---|
| 높이 | 32 | **정본에 32 없음** (PC 28·34·44) |
| 좌우 패딩 | 12 (아이콘 앞일 때 좌 8/우 12) | spacing/8·spacing/16 만 정본 크기표에 있음 |
| 최소 폭 | 60 | XSM minWidth 64 |
| 반경 | 4 | radius/button/md = radius/4 ✅ |
| 폰트 | 14 Medium | body/14M ✅ |
| 아이콘 | 16px, 앞/뒤 변형 | **정본 Button 에 아이콘 축 없음** |
| default | 배경 white · 테두리 #d9d9d9 · 글자 **#757575** | base/white · gray/200 · **gray/500** |
| hover | 배경 white + 검정 5% 오버레이(토큰 없음) · 테두리 #d9d9d9 · 글자 #757575 | 오버레이 결과 ≈ #F2F2F2 — 정본에 없음. 가장 가까운 gray/50(#F5F5F5) = secondary hover 와 동일 |
| disabled | #f5f5f5 · #d9d9d9 · #c4c4c4 | 정본 공통 disabled 토큰 그대로 ✅ |

→ **보조 버튼은 정본 Secondary 와 배경·테두리가 같고 글자색만 다르다**(Secondary 글자 gray/800 → 보조 gray/500).

**A `pc_text_button` (540:4705)** — 변형 6개: variant=primary/secondary × state=default/hover/disabled. 배경·테두리·패딩 없음, 14 Medium.

| variant | default | hover | disabled |
|---|---|---|---|
| primary | #1d6ceb = `color/text/state/accent` ✅ | 같은 색 + **밑줄** | #c4c4c4 = `color/text/state/disabled` ✅ |
| secondary | #757575 = `color/text/body/tertiary` ✅ | 같은 색 + **밑줄** | `color/text/state/disabled` ✅ |

→ **텍스트 버튼 색은 전부 기존 정본 텍스트 토큰으로 표현된다 — 새 색 토큰 0건.**

**B `m_subbutton` (1744:8493)** — 모바일, 변형 6개: type=Big(Black)/Big(Gray)/Small × disabled. 글자 + 오른쪽 화살표(›) 아이콘. Big 24px 높이·14px, Small 16px 높이·12px. 색은 raw hex(#000·#7f7f7f·#bfbfbf) — **Foundation 에 같은 hex 없음**(가까운 것: base/black·gray/500 #757575·gray/300 #c4c4c4).

### 이렇게 만들게요

**① 보조 버튼 = Button 세트에 variant `Assist` 추가** (primary·secondary·blue-line → 4종). 크기·상태 축은 기존 그대로(MD·XSM·XXSM·LG × Default·Hover·Pressed·Disabled) → 변형 48 → 64.
- ~~새 토큰 6개~~ → **시공 결과 3개**(`border/assist--hover` · `label/assist--default` · `label/assist--hover`).
  원본은 배경(기본·hover)과 테두리(기본)를 secondary 토큰에서 빌려 쓴다 — river 가 "원본은 3개"를 듣고 원본 충실을 선택.
  아래 값 선언은 그대로 유효하다(지운 3개가 secondary 와 값이 완전히 같아 **보이는 색은 안 바뀐다**).
  - 라이트 값 = 레거시 그대로: bg white / gray/50 · border gray/200 / gray/200 · label gray/500 / gray/500.
  - **다크 값은 레거시에 없다** → Secondary 의 다크 규칙을 그대로 따르는 안: bg gray-dark/100 / gray-dark/200 · border gray-dark/500 / gray-dark/500 · label = `text/body/tertiary` 다크와 같은 gray-dark/700. (제안이며 승인 사항)
- Pressed = Hover (정본 Button 규칙).

**② 텍스트 버튼 = 새 컴포넌트 세트 `Text Button`** (Button 과 구조가 달라 — 배경·테두리·높이·최소폭 없음 — 같은 세트에 못 넣는다).
- 축: `Variant=Primary|Secondary` × `State=Default|Hover|Pressed|Disabled` (PC, 14 Medium). Hover·Pressed = 밑줄(색 동일).
- 색은 기존 토큰 재사용(accent · body/tertiary · state/disabled) — **새 토큰 0건**. 새로 생기는 이름은 세트명 "Text Button" 뿐.

### 결정 항목 (D-13) — 위 확정표에서 전부 닫힘

1. **보조 버튼 높이** — 레거시 32 는 정본에 없다. (A, 추천) 기존 크기 축 그대로 쓰고 32 는 가장 가까운 XSM(34) 로 본다 — D-06 에서 주신 "높이 매칭, 없으면 가장 가까운 높이" 규칙 그대로 / (B) 32 높이를 새 크기로 추가(모든 variant 에 크기 1개가 늘어남). 안 정하면 A.
2. **보조 버튼 아이콘(앞/뒤)** — 정본 Button 은 아이콘이 없다. (A, 추천) 이번엔 색·variant 만 추가하고 아이콘은 별건으로 미룬다 / (B) Button 세트 전체에 아이콘 자리를 추가(48→64 변형 전부 영향, 별도 설계 필요). 안 정하면 A.
3. **보조 버튼 다크 색** — 위 ① 의 제안(Secondary 다크 규칙 따라감)으로 갈까요? 안 정하면 다크 값을 못 만들어 착수 불가.
4. **모바일 서브버튼(m_subbutton, 글자+화살표)** — (A, 추천) 이번 Text Button 은 PC 만 만들고 모바일은 별건으로 미룬다(레거시 색이 정본에 없어 색 매핑 결정이 따로 필요) / (B) 지금 같이 만든다 — 그러면 Black→`text/title/primary`, Gray→`text/body/tertiary`, disabled→`text/state/disabled`, 화살표=정본 chevron 아이콘으로 매핑하는 것까지 승인 필요. 안 정하면 A.

---

## D-15 모달 크기 축

### 레거시 실측 (🤖 figma-inspector) — A `pc_modal` (540:5815), 축 `size`

| size | 폭 | 높이 | 안쪽(패딩·헤더·버튼·폰트) |
|---|---|---|---|
| sm | **360** | 내용 따라(hug, 실측 241) | 상하 20 · 좌우 24 · 버튼 h34 · 헤더 18B / 버튼 14M |
| md | **520** | 내용 따라(hug, 실측 336) | **전부 동일** |
| lg | **1000** | **587 고정** | 전부 동일 |
| xl | **1200** | **587 고정** | 전부 동일 |

→ **네 크기는 폭만 다르고 안쪽 밀도는 같다.** 정본 PC 모달(폭 360 · 상하 20 · hug) = 레거시 sm 과 같다.
A `modal_small`(6706:4218, 알림창 5종)은 폰트 16B/14R·버튼 28 인 **별도 규격**이라 이 건 범위 밖(D-05 계열과 함께 별건).

### 이렇게 만들게요

- `buildModalShell` 에 **`Size` 축 추가**. PC = `SM 360 · MD 520 · LG 1000 · XL 1200`, Mobile = `SM(300)` 하나만(모바일 화면폭에서 MD 이상은 성립 안 함). 변형 4 → 10 (PC 4×Footer 2 + Mobile 1×Footer 2).
- 폭 리터럴(360/300)을 크기표로 옮긴다. 안쪽 패딩·간격·버튼·폰트는 **손대지 않는다**(레거시도 동일이므로). 기존 PC 변형은 이름만 `Size=SM` 이 붙고 모양은 1px 도 안 움직인다.
- 파생 정리: `registry/components/modal.json` sizeAxis 문구 · `ui-library/src/components/modal/manifest.json` notInCanon.sizeAxis 선언 삭제 → 웹 배포본(dist) 모달에 크기 클래스 추가는 **`웹 업데이트 해줘` 후속**으로 넘긴다(이번 범위 = Figma 정본·설치기).

### 결정 항목 (D-15) — 위 확정표에서 전부 닫힘

5. **크기 이름** — (A, 추천) 레거시 그대로 SM·MD·LG·XL / (B) 다른 이름. 안 정하면 A.
6. **LG·XL 높이** — 레거시는 587 고정, 정본은 내용 따라 늘어남(hug). (A, 추천) 네 크기 모두 지금처럼 내용 따라 — 본문 슬롯에 무엇을 넣든 잘리지 않음 / (B) 레거시처럼 LG·XL 만 587 고정. 안 정하면 A.

---

## D-17 모바일 상단바 — '홈 + 타이틀 + 아이콘' 유형

### 레거시 실측 (🤖 figma-inspector) — A `mobile_header` (540:6112) 변형 5개 원본 이름

| 원본 이름 | 구성 | 정본 |
|---|---|---|
| `Home titel + alt titel` | 홈 배경 + 타이틀 18B, 아이콘 0 | = `Home / Title` |
| `Home title_icon 2` | 홈 배경 + 타이틀 18B + **알림 아이콘 2개** | 2026-08-25 river 지시로 **삭제** |
| `Home title_sub title_icon 1` | 홈 배경 + 타이틀 18B + 펼침 화살표 + 서브타이틀 14 + 알림 아이콘 1개 | = `Home / Title + Subtitle + 1 Icon` |
| `standard_title` · `standard_title + close btn` | 뒤로가기 + 타이틀 (+닫기) | = `Standard / …` |

B `appbar_main`(42:3100)·`appbar_sub`(42:1974) = 로고/햄버거형 PC 앱바 12+4 변형 — river: 사용 안 함.

→ **"홈 배경 + 타이틀 + 아이콘 1개(서브타이틀 없음)" 은 레거시 A·B 어디에도 없다.** 신설이면 기존 것을 옮기는 게 아니라 **새 조합**이다.

### river 원문 해석 (확인 필요)

> "아이콘 두개있는 버전과 앱바는 사용하지않음. 그런데 다시보니 홈+타이틀+아이콘 유형이 누락됨. 제작후 삭제된 두개유형은 홈+타이틀+아이콘 유형으로 변경하면됨"

⭐ 해석: "삭제된 두 개 유형" = **①아이콘 2개 버전(정본에서 삭제됨) ②앱바(B, 정본에 만든 적 없음)**. 이 둘을 대신해 **`Home / Title + 1 Icon` 1종을 새로 추가**하라는 뜻으로 읽었다. (정본 코드의 삭제 기록은 ① 한 종류뿐이며, ② 는 처음부터 정본에 없었으므로 "삭제" 가 아니라 "미채택"이다.)

### 이렇게 만들게요

- `MOBILE_HEADER_TYPES` 에 **`Home / Title + 1 Icon`** 추가 (순서: `Home / Title` 바로 다음). App·Web 두 플랫폼 → 변형 12 → 14.
- 구성 = `Home / Title` 과 동일(홈 배경 `color/bg/home` · 타이틀 18B · 좌 20/우 16 · 상하 12) + 오른쪽에 **알림 아이콘 자리 1개**(32px, `Home / Title + Subtitle + 1 Icon` 과 같은 알림 아이콘·빨간 점 = `color/icon/red`). **펼침 화살표·서브타이틀 없음.**
- 새 토큰 0건 · 새 아이콘 0건(기존 등록 키 재사용). 파생: guide model·facts 재생성, 웹 배포본 mobile-header 매니페스트에 유형 1개 추가는 `웹 업데이트` 후속.

### 결정 항목 (D-17) — 위 확정표에서 전부 닫힘

7. **위 해석이 맞나요?** — "삭제된 두 개 유형" 이 ①아이콘 2개 버전 ②앱바 를 뜻하고, 그 자리를 `Home / Title + 1 Icon` 하나로 채우면 되는지. 다른 뜻이면 알려주세요. 안 정하면 착수 불가(2026-08-25 결정과 맞물려 추측 금지).
8. **아이콘 종류** — (A, 추천) 알림(종) 아이콘, 서브타이틀 유형과 동일 / (B) 다른 아이콘. 안 정하면 A.

---

## D-18 GNB 하위메뉴 깊이

### 레거시 실측 (🤖 figma-inspector)

**B `gnb` (5:10245)** — 축 `sub menu` = off / 1depth / 2depth (같은 세트의 형제 변형)

| sub menu | 높이 | 모양 |
|---|---|---|
| off | 57 | 바만 |
| 1depth | 326 | 바 아래 **흰 패널**(그림자 0 2px 15px 15%) · 상위메뉴별 세로 목록 · 항목 16px #353535(=gray/800), 선택 #1d6ceb(=blue/400) |
| 2depth | 373 | 같은 패널 · 일부 항목 아래 **한 단 더 들여쓴 자식** 14px **#646464 (Foundation 에 없음)** · 그림자 0 2px 30px 15% |

**A `gnb list` (540:6398)** — 축 `type` = compact-1(67, 한 줄) / compact-2(110, 두 줄) / regular(342, **상위 카테고리 제목 16B #353535 + 하위 5개 16M #555(=gray/600)**). 깊이 이름은 없지만 regular 가 사실상 1depth 제목 + 2depth 목록.

hover 는 A·B 모두 변형에 없음(미확인). 패널 테두리 유무 미확인(그림자만 확인).

**정본 현재:** `buildGNB` = GNB 바(Align × Size md/sm/xsm, 메뉴 자리는 슬롯 "Menus") + `GNB Menu`(Size × State Default/Hover/Selected). 하위메뉴 패널 없음. 토큰 `color/navigation/*` = bg · indicator(default/hover/selected) · label(default gray/600 · default-alt gray/700 · hover · selected blue/400). 그림자 정본 `shadow/dropdown` = 0 4px 8px 15%.

### 이렇게 만들게요 (제안 — 구조 선택이 필요)

- **새 세트 `GNB Sub Menu`(바 아래 펼침 패널)** 를 따로 만든다. GNB 바 변형(6개)에 축을 붙여 18개로 불리지 않고, 화면에서 바 아래에 인스턴스로 놓는다(river 2026-09-03 "슬롯으로 개수 조절" 방식과 같은 결).
  - 축: `Depth=1depth|2depth`. 폭 1920(바와 동일), 배경 `color/navigation/bg`, 그림자는 기존 `shadow/dropdown` 재사용, 테두리 없음(미확인이라 안 그림).
  - 안 = 컬럼 슬롯("Columns"): 기본 4컬럼, 컬럼마다 항목 인스턴스를 넣고 빼서 개수 조절.
- **새 세트 `GNB Sub Menu Item`**: `Depth=1|2` × `State=Default|Hover|Selected`.
  - 1depth 항목 = 16 Medium(`body/16M`) · 글자 = **새 토큰 `color/navigation/submenu/label/default`(gray/800)** · Selected = 기존 `label/selected`(blue/400) · Hover = Selected 색(레거시 없음 → 정본 GNB Menu 와 같은 (b) 사전등록 개선).
  - 2depth 자식 = 14px · 글자 #646464 는 정본 Foundation 에 없음 → 결정 필요(아래 10).

### 결정 항목 (D-18) — 위 확정표에서 전부 닫힘

9. **구조** — (A, 추천) 위처럼 패널을 별도 세트로 / (B) GNB 바 자체에 `Sub Menu=Off|1depth|2depth` 축을 넣어 바 변형을 6→18 로. 안 정하면 A.
10. **2depth 자식 글자색** — 레거시 #646464 는 Foundation 에 없다. (A, 추천) 가장 가까운 gray/600(#555, A 파일 하위메뉴 색과 동일) / (B) gray/500(#757575) / (C) 새 Foundation 값 #646464 신설(다크 짝도 정해야 함). 안 정하면 착수 불가(색 추측 금지).
11. **2depth 굵기** — 레거시에서 14px 만 확인, 굵기 미확인. (A, 추천) 1depth 와 같은 Medium(`body/14M`) / (B) Regular(`body/14R`). 안 정하면 A.
12. **A 파일의 3단(compact-1/compact-2/regular) 모양** 도 정본에 넣을까요? (A, 추천) 아니오 — B 의 1depth/2depth 로 통일 / (B) regular(카테고리 제목 + 목록)를 3번째 Depth 값으로 추가. 안 정하면 A.

---

## 공통 — 착수 후 흐름 (승인되면 자동)

1. river 발화를 `--quote` 로 승인 기록(Gate 34) → 2. `vars-data.ts`(토큰) → `npm run tokens:reconcile` → 3. `build-components.ts` 빌더 수정 → 4. 🤖 `component-verifier` 독립 검증(Gate 13 기록, ⭐ 자가검증 금지) → 5. `npm run components:facts:write`·`guide-model:write`·`installer:build` → 6. Figma 설치 후 렌더 대조 → 7. `npm run board:refresh` 로 검수판 갱신 → 8. Gate 전체 통과 후 커밋.
