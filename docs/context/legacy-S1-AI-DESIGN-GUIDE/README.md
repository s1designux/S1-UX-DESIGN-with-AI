# legacy-S1-AI-DESIGN-GUIDE

예전 폴더 이름(S1-AI-DESIGN-GUIDE) 시절 기록. 현재와 다를 수 있음.

2026-06~07 무렵 Claude 메모리에서 옮겨 온 사본입니다(원본은 그대로 둠). 지금 규칙과 부딪히면 지금 것이 맞습니다.

- `feedback_apply-installer-and-live-v3.md` — 컴포넌트 변경 시 설치기 반영 + 현재 V3.0 Figma 노드도 직접 수정해 재설치 없이 바로 보이게
- `feedback_display-order-vs-build-order.md` — 컴포넌트 표시(나열) 순서와 빌드(생성) 순서는 분리 — 나열은 메인→요소, 빌드는 요소 먼저
- `feedback_figma-canvas-font-consistency.md` — use_figma 캔버스 텍스트는 Pretendard 정본 필수, 라벨 override 후 텍스트스타일 재바인딩, 폰트는 렌더 아닌 데이터로 검증, 3층 방어
- `feedback_figma-nodes-must-bind-variables.md` — use_figma로 그리는 모든 Figma 노드 색은 Variable 바인딩 필수, 하드코딩 hex 금지 — 검토/스펙 프레임도 예외 없음, PreToolUse 훅이 기계 차단
- `feedback_generated-page-static-text-drift.md` — 자동 생성 페이지의 GEN 마커 밖 손편집 텍스트(날짜·변경이력)는 토큰 변경 후 stale 됨 — 생성기가 자동 스탬프하게 만들 것
- `feedback_installer-icons-as-library-instances.md` — 설치기 아이콘은 벡터 직삽입이 아니라 V2.2 라이브러리 컴포넌트 인스턴스로 넣어야 함
- `feedback_installer_system_naming.md` — 설치기 산출물은 s1-design-system-installer 이름으로만 — vars installer가 system installer로 통합됨
- `feedback_no-external-library-components.md` — Figma 빌드 시 외부 라이브러리 컴포넌트 절대 금지 — 레거시 원본 인스턴스 clone 금지, 정본=로컬 remote:false
- `feedback_no-fabricated-content.md` — 법인·법적·브랜드 콘텐츠(회사명·대표이사·주소·사업자번호·카피라이트·링크)는 임의 작성 절대 금지 — 검증된 원본에서만
- `feedback_pattern-text-uses-figma-textstyle.md` — 패턴 텍스트는 노토 오버레이가 아니라 V2.4 Figma 텍스트 스타일(Pretendard) 바인딩으로 — 글자는 노토로 타이핑하고 스타일만 입힘
- `feedback_platform-dark-placement.md` — 설치기 Platform 컴포넌트 다크 스펙 배치 — 좁은 건 라이트 우측, 넓은 건 아래
- `feedback_skip-builder-preview.md` — 빌더 프리뷰 대신 Figma에 직접 그려서 확인 — 빌더 출력이 부정확해 불편
- `feedback_spec_grouping_rule.md` — 컴포넌트 스펙/세트 그룹핑 규칙 — 모디파이어 조합을 상위 그룹, 사이즈를 그 안에서 나열
- `feedback_token-naming-governance.md` — 토큰 이름은 기준에 맞게 일관되게, 레거시 원본명 그대로 수입 금지, Gate 15가 기계 강제
- `feedback_token-role-must-match-element.md` — 토큰은 이름에 맞는 요소 역할에만 써야 — 글자엔 글자토큰(text/label), 값 일치만 보던 게이트 사각지대를 Gate 22가 차단
- `feedback_token-truth-source-and-drift-gate.md` — 토큰 사실 판단은 vars-data(값)+build-components(컴포넌트 사용)만 정본. registry 설명 데이터는 stale 가능 — Gate 20 drift 게이트가 기계로 추적
- `feedback_token_value_autosync.md` — 토큰 값 수정 시 연관 모든 표면 자동 동기화 — token-sync 에이전트 사용
- `feedback_variables_source_of_truth.md` — 역방향(코드→Figma) 작업의 바인딩 정본은 Variables(vars-data.ts), tokens.css는 레거시·오류라 쓰지 말 것
- `feedback_visual_verification.md` — 컴포넌트 생성 시 메타데이터 수치만 보지 말고 원본 캡쳐 이미지로 구조를 대조 검수할 것
- `project_bg-depth-scale.md` — 배경 토큰 = bg/level-0~3 깊이 스케일. surface 드롭, 컴포넌트는 자기 배경 보유
- `project_component-leaf-key-validation.md` — build-components.ts 빌더가 동적 조합하는 scv 키가 vars-data 정본에 다 있는지 검증하는 법 (audit-bindings 사각지대)
- `project_components-new-replaces-components.md` — components-new.html이 components.html을 대체하는 Variables 정본 페이지 — 구 페이지는 폐기 예정
- `project_core-page-section-layout.md` — V3.0 TEST 파일 Core 페이지(5:5706)는 섹션들이 가로로 나란히 배치 — 섹션 리사이즈 시 이웃 침범 주의
- `project_external-library-migration-backlog.md` — V3.0 Figma 외부 라이브러리→로컬 이관 현황 + provenance 예방 시스템 위치 + 남은 backlog
- `project_figma-build-constraints.md` — use_figma 빌드 시 폰트·인스턴스 자식 제약 — Pretendard 로드불가→Noto Sans KR, 인스턴스 자식 좌표 잠김
- `project_foundation-number-page-generated.md` — foundation.html의 number 섹션(sizing·font-size·line-height·opacity·breakpoint)은 자동 생성, Gate 9가 전 number 토큰 페이지 노출 강제
- `project_moduapp-workspace-is-wiki.md` — s1-moduapp-workspace는 모두앱 이해용 위키 — 컴포넌트/토큰 세트는 여기서 관리 안 함(디자인시스템 repo 정본)
- `project_pc-pattern-placement.md` — PC 패턴 배치 위치 — V3.0 파일 Patterns 페이지(80:16697)에 정리
- `project_reverse_figma_v3.md` — 역방향(코드/registry→Figma) 컴포넌트 세트 생성 작업 — V3.0 타깃 파일·플러그인 확장 방향
- `project_semantic-page-generated.md` — pages/semantic.html은 vars-data에서 자동 생성됨 — 손편집 금지, page:gen으로 재생성
- `project_service-ui-data-to-intelligence-workspace.md` — 서비스별 UI 사양서·맥락 데이터화는 각 intelligence workspace에 업데이트 (DS 가이드 repo 아님)
- `project_three-checkers-and-gui-audit-merge.md` — river의 검수기 3종 지형(GUI검수/개발화면검수/Source Guard)과 GUI검수기를 설치기에 병합하는 결정
- `project_token-binding-scan.md` — Figma 컴포넌트 미바인딩 raw hex를 use_figma로 사실 추출 + figma-binding-lookup.js로 역매핑 기계 판정하는 검증 절차
- `project_update-management-page.md` — 업데이트 관리 페이지 — 컴포넌트/패턴 진행상태·표면별 반영일 관리 + origin 분류가 재발방지 게이트 입력
- `reference_pagination-component.md` — Pagination 컴포넌트 구성(Arrow/Number/Edge) + 테이블 footer는 이 인스턴스로 조립, next/last는 180° 회전
- `reference_table-border-tokens.md` — 테이블 보더 — 외곽=strong #353535(구 emphasis 통합·삭제), 헤더밑줄=셀선=default light #E9E9E9
