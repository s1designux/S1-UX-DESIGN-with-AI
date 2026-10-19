---
name: project_reverse_figma_v3
description: 역방향(코드/registry→Figma) 컴포넌트 세트 생성 작업 — V3.0 타깃 파일·플러그인 확장 방향
metadata: 
  node_type: memory
  type: project
  originSessionId: 2c4b6d19-424c-4233-ad3e-12e019b55c01
---

코드/registry를 정본으로 Figma에 컴포넌트 세트를 자동 생성하는 **역방향** 작업을 시작함(기존 figma-to-code의 반대). 2026-06-10 착수.

**타깃 파일:** SW-UX-GUIDE V3.0 TEST (신규 빈 파일) — https://www.figma.com/design/〔따로 보관: 피그마파일-2〕/SW-UX-GUIDE-V3.0-TEST . V2.4와 분리된 깨끗한 파일이라 충돌 없음.

**확정 방향:**
- 정본 = `registry/components/*.json`(구조) + Variables(색·수치 바인딩 소스). "Variables 기준"이라 했으나 구조 정본은 registry임.
- 쓰기 메커니즘 = `figma-vars-installer` 플러그인을 **2단계로 확장**(같은 플러그인에서 Phase1 Variables 설치 → Phase2 컴포넌트 세트 생성+바인딩). 별도 플러그인 X — 같은 세션이라 Variable 객체 직접 참조 가능.
- 파일럿 = Button 먼저. 16개(primary×4size×4state) 검증 후 48개로 확장 권장.
- 기존 figma-to-code(단방향)는 역방향 미지원 — 역방향 5단계 표준 신설 제안함(매니페스트→바인딩맵→생성→역대조→다크모드).
- 기하·레이아웃 정본 = 코드(components.html harness CSS), Figma 2.4는 레거시 참고(두 갈래 원리).

**Why:** 프로젝트의 핵심 자산이 Figma→코드만 다뤄왔고, 역방향 capability(figma.createComponent/combineAsVariants 호출)가 전무했음.

**네이밍 컨벤션 (확정):** 에스원 GUI 참고 파일(fileKey 〔따로 보관: 피그마파일-1〕, node 1459:16264) 따름. Button 속성 4개 = Size(xxsmall/xsmall/medium/large)·State(Default/Hover/Pressed/Disabled)·Variant(Primary/Secondary/Blue-Line)·Break(PC/Mobile). Break로 PC/Mobile 분리 → medium=PC44·large=Mobile48 (기존 valueMap의 medium/mobile 둘다 Large 충돌 해소). pressed=hover(components.html:316).

**텍스트 스타일 (구현 완료):** V2.4(fileKey 〔따로 보관: 피그마파일-3〕) Text styles 패널 이미지를 데이터화 → 19개(title 8·body 9·caption·helper), Pretendard. lh 130%(size10만 140%). 자간: title18M/16M·body18M/16M/16R/14M/14R=-2%, body10M/10R=+2%, 나머지 0%. MCP는 V2.4가 Cover 페이지만 접근돼 전수 추출 불가 → 이미지 데이터화 방식 채택.

**Button 완성 (2026-06-10):** primary 16 → **48-variant**(Primary/Secondary/Blue-Line × 4size × 4state). `variantSlots(variant,state)` 일반화, 슬롯 전부 vars-data 실재 확인. 함수명 buildButtonPrimarySet→buildButtonSet. 스펙 프레임 = 플랫폼→사이즈→variant 3행, Light/Dark 2벌. min-width: medium/large=80, xsmall/xxsmall=64. 각 컴포넌트 Appearance에 Semantic Color V2 모드 명시 연결(setExplicitVariableModeForCollection).

**구현 (2026-06-10 완료):** figma-vars-installer 확장. 신규 textstyles-data.ts·install-textstyles.ts·build-components.ts, code.ts/ui.html 수정. UI 체크박스 2개(Text Styles / Button 컴포넌트). installer:check·installer:build PASS. **4단계 역대조는 사용자가 V3.0에서 플러그인 실행해야 가능**(Figma API는 직접 실행 불가). 계획서: reports/code-to-figma/button/PLAN.md.

**플러그인 재편 (2026-06-10):** figma-vars-installer를 단순 Variables 설치기 → **선택형 통합 설치기**로 재구성. manifest 이름 "에스원 디자인시스템 설치"(id는 유지 sw-design-system-vars-installer). UI 체크박스 4개(Foundation·Semantic·Text Styles·Component Set 생성) + 각 최신 업데이트 일자 표시. **의존성 자동연결:** 선택 안 한 의존 항목(Semantic←Foundation, Component←Foundation·Semantic·TextStyles)은 `loadExistingVarMap`/`loadExistingSemantic`로 파일의 기존 설치분을 불러와 연결, 없으면 명확한 오류로 중단. code.ts는 installFoundation/installSemantic 함수로 분리. 빌드: installer:check·installer:build PASS.

**전 컴포넌트 확장 (2026-06-11 진행중):** 사용자가 V3.0 내 참고 노드 14개 제공(16:1317~16:4570, 평면 이미지라 매트릭스만·구조는 코드). 검수 없이 순차 진행 지시(다 끝낸 뒤 일괄 검수). 멀티 컴포넌트 오케스트레이터 `buildAllComponents`(Button 상단 + 나머지 세로 스택). 바인딩=Variables 슬롯만([[feedback_variables_source_of_truth]]). **완료·빌드PASS: Button(48)·Checkbox·Radio·Toggle·Chip·Filter Chip·Input·Search·Textarea·Select·Dropdown List·Line Tab·Table Cell·Time Picker·Time Picker Dropdown — 14종(빌더 함수) 전부 buildAllComponents 등록 완료(2026-06-12).** 빌더는 build-components.ts에 함수로 추가하고 buildAllComponents builders+names 배열에 등록하는 패턴. **Filter Chip**: 4그룹(Variant Line/Solid × Title 없음/있음) × 5상태(Default/Hover/Selected=드롭다운펼침/Complete/Disabled), grouped spec. **Time Picker**: Input형 트리거(form-control, PC XXSM/XSM/MD·Mobile MD × 5상태) grouped + **Time Picker Dropdown** 별도(시·분 컬럼+확인 푸터, Type=24h/12h). 정본=components.html harness. 검수: tsc+audit-bindings+installer:build PASS. 사용자 V3.0 플러그인 실행 후 일괄 시각검수 예정([[feedback_visual_verification]]).

관련: [[feedback_file_edit_style]]
