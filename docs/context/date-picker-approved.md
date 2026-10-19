---
name: date-picker-approved
description: Date Picker 웹 배포본이 2026-09-04 approved 로 승격됐고, 기존 Figma 설치본은 재설치해야 SM 달력이 보인다
metadata:
  type: project
---

Date Picker UI 라이브러리 배포본은 2026-09-04 river UX 승인으로 `uiLibraryStatus=approved` 가 됐다(가이드 사이트·검수 화면 모두 실제 dist 소비). 같은 날 정본에 **작은(SM) 달력**이 신설돼 웹도 따라갔다 — 입력창이 xsm·xxsm 이면 267px 달력, md 면 356px 달력이 열린다(고르는 값이 따로 없다).

**Why:** 승인 여부와 "왜 화면에 안 보이나"를 다시 파헤치지 않기 위해.

**How to apply:** river 가 "Figma 에서 작은 달력이 안 보인다"고 하면 버그가 아니라 **재설치 문제**다 — 설치기는 캔버스에 Calendar 세트가 이미 있으면 건너뛰므로, 세트를 지우고 다시 설치해야 SM 이 나온다. 남은 부채는 워크플로 상태 파일의 B11·B12(라이브러리 전반 자간·줄높이). 관련: [[multi-session-shared-worktree-hazard]] · [[verification-visual-gap]] 성격의 지적이 이 작업에서만 8회째였다.
