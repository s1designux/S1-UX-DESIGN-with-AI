# 6 — 델타 재검증 (시나리오 F) — GNB 묶음 웹 배포본

검증자: 🤖 component-verifier · 2026-10-02 · 델타(21c61008..HEAD) · 읽기 전용(이 파일만 작성)
대상: gnb · gnb-sub-menu · gnb-sub-menu-item
기준선: 21c61008(2026-09-10) — 4-verification.md 3회차 · 5-canon-verification.md 3회차 · Gate 13 77518a239c898c35

## 판정: **HOLD** — FAIL(❌a) 0 · HOLD(❓c) 1 · BLOCKED 0

정본 위반·회귀·9/10 수정 2차 퇴행은 0건이다. 남은 것은 사람이 정할 1건(C-1)뿐이다.

---

## 0. 기계검사 재실행 (종료코드만 확인)

| 명령 | 종료코드 |
|---|---|
| ui:contract · ui:version · ui:build:check · ui:test:check · ui:icons · ui:icons:origin · ui:guide:render · ui:runtime · ui:keyboard · ui:liveness · ui:react · ui:zip:check · devpanel:check · platform:tokens:check | 전부 **0** |
| ui:state (workflow-state.json 지정) | 지문 불일치 3건(build-components · vars-data · textstyles)만 — 호출자 선언과 같음. contract 지문은 일치 |

## 1. 델타 범위 — 호출자 목록보다 넓다

`git log 21c61008..HEAD -- ui-library/src/components/gnb*` 실측 결과, 호출자가 적은 것 외에 GNB 를 건드린 커밋이 더 있다.

| 커밋 | GNB 영향 | 이번 판정 |
|---|---|---|
| 26068a3f | 바·패널 하단선 토큰 개명 line/gray/subtle → line/default (값 동일) | 직접 대조 ✅ |
| 9b3ee487 | navigation label/indicator selected·hover 다크 blue-dark/300 → 350 · 다크 로고 한 색은 LNB 전용(gnb 무관) | 직접 대조 ✅ |
| 4cee3864 | navigation/label/default 다크 gray-dark/600 → 800 (하위메뉴 2depth 기본 글자) | 직접 대조 ✅ |
| 4caee453 · 951f334d | 한글 세로 보정 — gnb md·sm 메뉴 padding-top 2px · 2depth 항목 top 1px | 직접 대조 ✅ + C-1 |
| 298832b1 · b5769188 · f8abce9c | gnb 파일은 manifest 버전·지문만, b5769188 은 crosswalk 캡처 PNG 만. 코드 변경 0 | ✅ |
| **992af777 · c1760fbd** (호출자 목록에 없음) | gnb.js Tab 순서 편입 · 역방향(Shift+Tab) 진입 — river 결정 9/15·9/16 | gnb-nav/7-reverse-keyboard 에서 component-verifier 5회차 PASS. 이번엔 스모크만(Tab 진입·Esc 복귀) ✅ |
| df1bd2b6 · ba262e4a · a8b44459 등 | 지문·버전만 | ✅ |

정본 `build-components.ts` 의 GNB 함수 diff(21c61008..HEAD): buildGNB 바 하단선 · buildGNBSubMenu 패널 하단선 토큰 이름 2곳 + 주석 3곳뿐. fillGnbMenu · buildGNBSubMenuItem · buildGNBUtilIcon · buildLanguageIcon 은 **변경 0**. GNB_MENU_SIZE(md 56/sm 48/xsm 36, inset 24/20/20) 그대로. textstyles title/16B·16M 변경 0(title/12B 신설만). Foundation hex 변경 0.

## 2. 정본 geometry·토큰·상태 대조 — ✅

실측 = http://localhost:4173/pages/components.html, 1440×1000, 실제 마우스 이벤트(CDP), Light·Dark 각각.

| 항목 | 정본 (vars-data.ts) | Light 실측 | Dark 실측 | 판정 |
|---|---|---|---|---|
| GNB 메뉴 Default | label/default-alt gray/700 · gray-dark/700 | #434343 | #8A8C96 | ✅ |
| GNB 메뉴 Hover·Selected 글자·강조선 | label·indicator/selected blue/400 · blue-dark/350 | #1D6CEB | #4285E8 | ✅ |
| 강조선 위치 | ul.y = S.h − 2 (바 안쪽 맨 아래) | bottom 0 · 메뉴 아래 = 바 아래(차 0.00) | 같음 | ✅ |
| 메뉴 높이 = 바 높이 | md 56 · sm 48 · xsm 36 | 56/48/36 (보정 padding 후에도 불변) | 같음 | ✅ |
| 바 하단선 | line/default gray/100 · gray-dark/300, 1px | #E9E9E9 1px | #2E2F38 1px | ✅ |
| 패널 배경 | navigation/bg white · gray-dark/100 | #FFFFFF | #1C1D23 | ✅ |
| 패널 하단선 | line/default | #E9E9E9 | #2E2F38 | ✅ |
| 패널 그림자 | shadow/dropdown | 0 4px 8px 15% | 같음 | ✅ |
| 1depth 제목 | submenu/label/default gray/800 · gray-dark/900, 16 Bold | #353535 700 | #ECEDF0 700 | ✅ |
| 2depth Default | label/default gray/600 · **gray-dark/800** | #555555 500 | **#B8BABF** 500 | ✅ (4cee3864 반영) |
| 2depth Hover·Selected | label/selected | #1D6CEB | #4285E8 | ✅ (9b3ee487 반영) |
| 패널 padding | regular 32/24/64 · compact 24 | 32 24 64 · 24 | 같음 | ✅ |
| 묶음 사이 | spacing/80 | 80px | 80px | ✅ |
| 유형별 묶음·항목 | regular 5·3·4·5(+제목) · compact-1 6 · compact-2 2·2·2·2·1 | 21 · 6 · 9 개 | 같음 | ✅ |
| 상태 축 | gnb Default/Hover/Selected × md/sm/xsm · item 1depth=Default 만 · 2depth 3상태 | 9칸 전부 존재 · 1depth Hover·Selected 칸 "해당 없음" | 같음 | ✅ |

웹 css 에 `--color-line-gray-subtle` 잔존 0건. dist tokens.css 다크 값이 vars-data 정본과 일치.

## 3. 9/10 river 수정 2차 6건 — 지금 화면에 살아 있음 ✅

조립 예시 3벌 × 메뉴 3개 = 9개 트리거 × Light·Dark 실제 마우스로 하나씩 열어 실측.

| # | 수정 | 실측 | 판정 |
|---|---|---|---|
| 1 | 액션 center-between | 3벌 전부 data-variant=center-between · 로고 왼쪽 24 · 유틸 오른쪽 20 · 메뉴 묶음 중앙 | ✅ |
| 2 | 판 자리 미리 비움 | 18회 열고 닫는 동안 액션 칸 높이 변화 0 · 다음 벌 위치 이동 0 · 아이템 높이 변화 0 | ✅ |
| 3 | 액션 칸 회색 배경 | Light #F5F5F5(bg/level-2) · Dark #24252C(bg/level-3) | ✅ |
| 4 | 메뉴 강조선 bottom 0 | 9 트리거 전부 bottom 0, 바 아래와 차 0.00 | ✅ |
| 5 | 공지사항 하위메뉴 | 3벌 모두 공지사항에 aria-controls · compact-2 판 항목 10개 | ✅ |
| 6 | 1depth 상태 없음 | 1depth 는 어디에서도 Default 색 하나 · 항목 화면 Hover·Selected 칸 "해당 없음" | ✅ |

동작: 마우스 올리면 aria-expanded=true·판 보임 → 벗어나면 닫힘(9/9 × 2테마). 판 위쪽 = 바 아래(틈 0). 판 안 묶음 좌우 여백 대칭(차 ≤ 0.02px). 키보드 스모크: 포커스로 열림 → Tab 이 판 첫 링크로 → Esc 로 닫히고 초점이 메뉴로 복귀. 페이지 전체 중복 id 0. 콘솔 오류 0(favicon 404 제외).

## 4. 안내 화면 = 배포본, 개별 모듈 = 묶음 ✅

- 서버가 내보내는 13개 파일(dist s1-ui.css·s1-ui.js·gnb/gnb-sub-menu/gnb-sub-menu-item css·js·examples, tokens.css, components.html, ui-library-guide.js·css)이 이 작업 폴더와 sha256 동일.
- 안내 화면이 실제로 붙는 스타일시트는 dist tokens·typography·s1-ui.css + 안내 껍데기 css 뿐. 컴포넌트 JS 는 dist s1-ui.js 를 import.
- 개별 css(dist/components) = src css 바이트 동일. gnb-sub-menu·item 은 묶음(s1-ui.css) 안에 그대로 포함. gnb 는 아이콘 3개 mask 경로만 `../assets` → `./assets`(묶음 위치 기준 재작성)로 다르고 나머지 동일 — 같은 파일을 가리킨다.
- s1-ui.js 는 components/gnb*.js 를 그대로 re-export.

## 5. ❓ (c) — 사람이 정할 것 1건

**C-1. 하위메뉴 카테고리 제목(1depth)만 한글 세로 보정에서 빠져 있다.**
4caee453 이 2depth 항목 글자만 1px 내렸다(river A안 2026-09-30, 웹 전용). 1depth 제목도 같은 16px·130% 인데 보정 대상에서 빠져, regular 판에서 제목은 원래 자리·항목은 1px 아래로 그려진다(제목→첫 항목 간격이 실제 25, 마지막 항목→아래 여백 63). 그 작업의 보고(reports/ui-library/text-vcenter/REPORT.md:74)도 "대상 밖이라 두었다"고 미결로 남겼다. 정본 수치·토큰 위반은 아니지만, river 가 지금 검수할 화면에 그대로 보이는 차이라 (b)로 넘기지 않는다.
선택지: (A) 제목도 같은 1px 보정 대상에 넣는다 / (B) 지금처럼 항목만 둔다. 안 정하면 (B) 상태로 검수가 진행된다.

## 6. 이번에 재확인하지 않고 승계한 항목

- 묶음 안 항목 간격(regular·compact-1 24 · compact-2 20) 수치 실측 — CSS 무변경(지문: gnb-sub-menu.css diff 는 토큰 이름 1줄)
- 여닫는 동작 세부(150ms 유예·단일 열림·바깥 클릭·hover 없는 기기 클릭 폴백·전역 리스너 누수) — 4-verification 3회차
- Tab 편입·역방향 세부·초점 가둠 없음 — gnb-nav/6·7 (component-verifier PASS)
- init/destroy·다중 인스턴스 — ui:test:check 종료코드 0 으로 갈음
- 아이콘 hit area·frame·glyph — ui:icons·ui:icons:origin 종료코드 0, 아이콘 diff 0

## 7. 검증하지 못한 범위

- Mobile 렌더: GNB 3종은 PC 전용이라 대상 아님.
- Figma 캔버스: 정본 토큰 이름 변경이 설치기 재설치 후 캔버스에 반영됐는지는 이 검증 범위 밖(웹 배포본만).
- Safari·Firefox 렌더(한글 세로 보정 반올림) 미측정.
- 섹션 전체 캡처는 사이트 고정 헤더·사이드바가 겹친 상태로 찍혔다(판정은 계산값으로 했다).

## 8. 권장 상태

- workflowStatus: `awaiting-user` 유지 (C-1 결정 + river 눈 검수)
- uiLibraryStatus: `draft` 유지
- nextAction: C-1 결정 → (A)면 1depth 보정 후 델타 재검증, (B)면 그대로 river 검수. 정본 지문 3개 갱신(ui:state) — GNB 함수 변경은 토큰 이름 2곳뿐임을 근거로.

## 스크린샷 (http://localhost:4173 · 1440 폭 · 2026-10-02 · 실제 마우스 hover 로 연 상태)

/private/tmp/claude-501/-Users-designgroup-02-S1-UX-DESIGN-with-AI/261bb853-686f-4869-a104-7e1775a656c8/scratchpad/verify/
- gnb-open-regular-light.png · gnb-open-regular-dark.png
- gnb-open-compact-1-light.png · gnb-open-compact-1-dark.png
- gnb-open-compact-2-light.png · gnb-open-compact-2-dark.png
- gnb-section-light.png · gnb-section-dark.png
- gnb-sub-menu-section-light.png · gnb-sub-menu-section-dark.png
- gnb-sub-menu-item-section-light.png · gnb-sub-menu-item-section-dark.png
- result.json (실측 원자료)
