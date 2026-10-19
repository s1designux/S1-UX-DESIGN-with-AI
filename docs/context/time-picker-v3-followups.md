---
name: time-picker-v3-followups
description: "time-picker V3.0 정합 후속 backlog — calendar 이관 완료(2026-07-09), 남은 3건 + date-picker V3.0 이행"
metadata: 
  node_type: memory
  type: project
---

time-picker V3.0 정합(커밋 a49fd6c) + calendar 이관(커밋 1b60de3) 완료. 아래는 남은 backlog — 방치 금지.

## ✅ 완료 (2026-07-09)
- **calendar 이관 (time-picker → date-picker)** — 커밋 1b60de3. positive resolve로 확정: 540:4216이 V2.4 소스에서 살아있고 Figma 실제 이름이 `pc_datepicker_calendar`(timepicker 아님 — registry 키가 오염이었음). date-picker.json에 `figmaCalendarNodeId: 540:4216` 등록(note "figma-unconfirmed 2026-05-12 → RESOLVED 2026-07-09, V3.0 promotion pending"), time-picker.json에서 `pc_timepicker_calendar` 제거. **이 항목은 더 이상 backlog 아님.**

## 남은 backlog
1. **[구조] 공유 드롭다운(958:26319) 재배치 검토** — time-picker 하위(`timepicker_select_dropdown`·`pc_timepicker_input_dropdown`)로 등록됐으나 V3.0에서 공유 세트로 병합됨. select·필터칩 등도 참조하므로 공유 컴포넌트로 자기 자리가 따로 있어야 함.
2. **[harness] 웹 하네스 DateTime 프리뷰 없음** — components-new.html time-picker 모바일은 TimeOnly만 인터랙티브 구현. DateTime 변형은 설치기(build-components.ts)엔 있으나 웹 가이드엔 미리보기 없음.
3. **[optical-QA] 설치기 DateTime 변형 렌더 픽셀 대조 미확인** — `buildTimePickerMobileBottomSheet` DateTime 변형(958:27393)이 Figma와 픽셀 일치하는지 미확인. 구조 존재만 확인됨. component-verifier 렌더 대조 필요.
4. **[신규·큰건] date-picker 전체 V2.4 → V3.0 이행** — date-picker는 통째 V2.4(input 540:3794, bottomsheet 540:3836, calendar 540:4216). calendar note에 "V3.0 promotion pending" 표식 있음 — 전체 이행 시 함께 승격. blast radius 큼, "설계부터" 별도 세션.

## 스타일 stale 1건 (다음 세션 정리 후보)
- update-management.json 의 **time-picker note(line 40)에 "pc_timepicker_calendar(540:4216)는 date-picker 이관 대기(다음 세션 1순위)"** 문구가 남아있음 — 이관 완료됐으므로 **이제 stale**. 이 파일이 외부 세션 M 상태라 이번엔 안 건드렸음. 다음에 정리.

## 반복 패턴 (이 프로젝트 공통)
"실물(코드·Figma) 최신, 메타(registry 라벨·노드·설명) 뒤처짐"이 계속 나옴. **대응 원칙: 정황('인접 대역 형제')으로 등록 금지, positive resolve 확인 후 등록.** 이번 calendar 건에서 그 덕에 오염된 키 이름(timepicker→datepicker)까지 잡음. 관련: [[multi-session-shared-worktree-hazard]].
