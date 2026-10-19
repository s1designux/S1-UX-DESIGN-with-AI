---
name: pattern-builder-progress
description: "패턴 빌더 진행 — 모두앱 레거시 547화면 판독 완료·전용 폴더로 분리, 최신 가이드용 패턴 규칙은 아직 0"
metadata:
  type: project
---

river 목표(2026-09-18): 회사 부품·토큰·디자인 문법으로 유형별 패턴을 조합하는 빌더. 1차 범위 HTML/CSS. 작업 폴더 `.claude/worktrees/pattern-builder`(브랜치 worktree-pattern-builder). 빌더는 독립 사이트 `builder/`.

구조(river 결정 2026-09-18): 공통 패턴 규칙은 억지로 만들지 않는다. **묶음 하나 = 매체 + 서비스**(`reports/pattern-builder/profiles/<매체>-<서비스>/`, 매체는 app·mweb·pcweb·console). 묶음마다 다섯 갈래를 따로 익히고, 화면 만들 때 묶음을 먼저 고른다. 공통은 서로 다른 묶음 셋에서 같은 규칙이 반복될 때만 승격한다.

로컬 모델 자리(🖥️ qwen3-embedding:0.6b): `npm run pattern:similar -- <service> --cluster` 로 닮은 화면 묶음 후보를 만든다(1084장→210묶음, 32초, 클라우드 토큰 0). `--similar "<질문>"` 로 비슷한 화면 찾기. 판정에는 쓰지 않는다. 캡처 판독용 `qwen2.5vl:7b` 도 로컬에 있다.

묶음 4개(2026-09-18): `app-modu`(모두앱 1084) · `pcweb-bus`(통근버스 탑승자 웹 800) · `app-bus`(통근버스 탑승자 앱 633) · `pcweb-busadmin`(통근버스 관리자 112). 같은 서비스도 매체가 다르면 묶음이 다르다. 묶음마다 일곱 갈래(screen-types·**screen-recipes**·skeleton·composition·states·content·naming).

**조립법(screen-recipes)** 이 빌더가 실제로 쓸 자료다 — 화면을 「쌓이는 칸의 차례」(상태바 → 머리 → 목록 → 하단탭바)로 바꾸고 그 유형에서 실제 쓴 부품을 붙였다. `npm run pattern:structure` 로 뽑는다. 갈래 이름만으로는 조립이 안 된다(river 지적 2026-09-18). 네 묶음 모두 채움: 모두앱 40가지 · 통근버스 앱 30 · 웹 9 · 관리자 5(사실상 「머리 → 본문」 한 가지).

서비스별 특이점 예: 통근버스는 부품 이름이 매체로 갈려 있다(C/ 공용·W/ 웹·M/ 모바일), 앱 높이 812(모두앱 780), 바텀시트를 많이 쓴다(43↔6), 빈 상태가 거의 없다(8↔87), 관리자 화면은 112장 중 105장이 팝업·입력 폼.

상태(2026-09-18):
- 모두앱 GUI 10개 페이지 전량 판독 — **화면 1084개·부품 155종**(2026-09-18 열쇠로 재판독, 그 전 547은 일부만 읽힌 것 — [[figma-rest-key-beats-desktop]]).
- 모두앱 규칙 5갈래와 목록 줄·목록 화면 시안은 묶음 **`profiles/app-modu`** 에 있다(legacy). 정본과 분리 — [[legacy-service-patterns-separate]]
- 목록 줄 수치는 원본 실측 확정(줄 74+구분선1, 여백 위아래18/좌20/우16, 제목16M·설명14R, 줄간격 100%).
  **정본 부품으로 등록하지 않는다.**
- **최신 가이드용 공통 규칙은 일부러 비워 뒀다.** 서로 다른 묶음 셋에서 같은 규칙이 반복될 때만 승격한다.

다음 방향(river 2026-09-23): **빌더와 연결하지 않는다.** 서비스 맥락 파악을 먼저 계속한다 — river 가 서비스별 주요 프로젝트 Figma 파일을 차례로 준다. 인계서는 `reports/pattern-builder/HANDOFF.md`(커밋 0af0fe5).

**Why:** 다음 세션이 모두앱 자료를 정본 근거로 착각하지 않게.

**How to apply:** 최신 가이드 패턴을 만들 때는 레거시 판독을 근거로 쓰지 말 것. Figma 읽기 함정은 [[figma-section-read-blindspot]], 렌더 확인은 [[shot-masks-need-http]]. 이 작업 폴더를 다른 세션과 함께 쓰는 중이라 커밋이 섞일 수 있다 — [[multi-session-shared-worktree-hazard]]
