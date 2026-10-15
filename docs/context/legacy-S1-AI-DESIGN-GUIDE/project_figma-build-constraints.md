---
name: project-figma-build-constraints
description: "use_figma 빌드 시 폰트·인스턴스 자식 제약 — Pretendard 로드불가→Noto Sans KR, 인스턴스 자식 좌표 잠김"
metadata: 
  node_type: memory
  type: project
  originSessionId: 473337a4-9af1-44dd-8539-ffcf8edb25b8
---

V3.0 Figma 파일(〔따로 보관: 피그마파일-2〕, SW-UX-GUIDE-V3.0-TEST)에 `use_figma`로 패턴/화면을 조립할 때의 비자명 제약:

- **Pretendard 폰트는 MCP 컨텍스트에서 로드 불가** (`loadFontAsync` 실패: "font family Pretendard does not exist"). 그래서 `characters` 입력은 **Noto Sans KR**(Regular/Medium/Bold 로드 가능)로 한다. **단 텍스트는 노토로 끝내지 말고 V2.4 Figma 텍스트 스타일(Pretendard)을 바인딩한다(2026-06-18 확정):** 글자를 Noto로 입력 → `await node.setTextStyleIdAsync(스타일id)`로 `title/*`·`body/*` 입힘. **MCP가 Pretendard를 못 불러와도 바인딩은 성공**(`hasMissingFont:true`, 클라우드는 대체 글리프로 렌더하지만 한글 보임 / Pretendard 설치된 데스크톱에선 정상 렌더). id는 `getLocalTextStylesAsync()` 이름→id 맵. 매핑 Bold→`title/*B`·Medium→`body/*M`·Regular→`body/*R`. **텍스트 스타일은 크기를 강제하고 바인딩 후 fontSize 재지정은 미설치 폰트라 throw** → 비표준 크기(13 등)는 가까운 토큰 크기(12/14)로 수렴. **인스턴스 내부 텍스트에도 `setTextStyleIdAsync` 적용 가능**(검증됨). 기존 패턴(데이터테이블 PC 86·회원가입 모바일 37)도 이 방식으로 노토→Pretendard 스타일 일괄 소급 완료(2026-06-18). 상세 [[feedback_pattern-text-uses-figma-textstyle]].
- **인스턴스 자식의 geometry override 금지**: 인스턴스 안 RECTANGLE/TEXT의 `x`/width 변경 시 `set_x: This property cannot be overridden in an instance`. 단 **`visible` 토글은 허용**.
- **인스턴스 자식 제약 정리(2026-06-19 로그인 패턴 확정):** ①**자식 텍스트 `characters` override = 허용**(GNB 서비스명·브라우저 탭 제목을 `[서비스명]`으로 정상 변경됨). ②**자식 노드 *추가/삽입* = 차단**(`insertChild: New parent is an instance`) — 그래서 인스턴스 안 로고를 `[서비스 로고]` 텍스트 플레이스홀더로 *바꾸려* 했으나 삽입 불가 → **로고는 `visible=false`로 숨김만** 처리(브랜딩 제거 충족). 인스턴스 내부에 placeholder를 새로 넣어야 하면 detach 또는 정본 컴포넌트에 INSTANCE_SWAP 슬롯 추가가 필요(라이브러리 작업·에스컬레이트).
- 그래서 Table Cell 인스턴스를 셀로 쓸 때: 인스턴스 resize는 가능(셀 bg fill은 따라옴, Variable 바인딩 유지) → 내부 border RECTANGLE·TEXT는 `visible=false`로 숨김 → 행 구분선은 **행 프레임의 row-level bottom border**(strokeBottomWeight)로, 텍스트는 Noto 오버레이로 그림.
- 셀/체크박스 등 컴포넌트 인스턴스는 **색 Variable 바인딩이 자동 유지**되므로 fill 재바인딩 불필요. 직접 만든 프레임(pagination·select·border)만 `setBoundVariableForPaint`로 수동 바인딩.
- **오버레이 구조 = 인스턴스를 감싸지 말 것.** Noto 오버레이 텍스트는 **인스턴스를 감싸는 1:1 래퍼 프레임이 아니라** 컨테이너(행·그룹·footer)의 **`layoutPositioning="ABSOLUTE"` 형제 레이어**로 인스턴스 위에 띄운다. 단일 인스턴스 래퍼를 만들면 인스턴스를 바로 선택·스왑 못 하고 2단 중첩이 생겨 사용자가 싫어함(2026-06-18 지적). 그룹 컨테이너(여러 인스턴스 묶음)는 허용. → 인스턴스는 항상 컨테이너의 직접 자식.
- 페이지 컨텍스트는 호출마다 리셋 → 매 `use_figma`마다 `setCurrentPageAsync(Patterns 80:16697)` 선행.

데이터 테이블 패턴(Row States+Footer, md+sm)은 Patterns 페이지 섹션 169:76에 빌드됨. 관련 [[project_reverse_figma_v3]] · [[feedback_visual_verification]].

**중복 컴포넌트 세트 주의(2026-06-18):** 설치기 재실행으로 파일에 **옛(106:xxxx·127:xxxx)·새(173:xxxx) 세트가 중복**(같은 위치 겹침) — 예: Table Cell `173:6900`(정본)+`106:6390`(옛), Button `173:4668`+`127:9847`. **정본 = 173:xxxx**(최신 install). 패턴 빌드 시 173 세트를 참조할 것. 데이터 테이블 패턴은 셀=`173:6900`·체크박스=`173:4983`·Pagination=`173:8330`·Select Box=`173:6316`로 재지정 완료. **옛 중복 세트(Table Cell 106:6390·Button 127:9847) 정리 완료(2026-06-18 삭제됨)** — Patterns Mobile 의 옛 Button 인스턴스 5개를 정본 `173:4668`로 재지정 후 두 세트 `remove()`, Core 세트 25→23·중복 0 확인. 이제 전 컴포넌트 단일 세트. 인스턴스 재지정은 `instance.swapComponent(이름일치 새variant)` + 오버라이드(내부 visible=false·resize) 복원으로 안전(같은 코드 생성이라 구조 동일). 삭제 안전 절차: 컴포넌트의 `.instances`로 전 문서 참조 스캔 → 참조 0 확인 → `set.remove()`(참조 있으면 정본 재지정 먼저).
