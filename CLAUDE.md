# ASC - AI Context Document (Design System Harness)

> 이 문서는 Claude가 디자인 시스템을 **수집, 정리, 구조화, 검증**하기 위한 기준입니다.
> 현재 목표는 UI 구현이 아니라 **디자인 시스템을 구축하는 것**입니다.
> 마지막 업데이트: 2026-06-06 (규칙 체계 정리: 두 갈래 분류 원리 상위화·rgba EX02/EX06·R12/R13 폐지·hover 레거시 누락 처리·공통 규칙 허브 신설·중복 정본화(audit-rules.json/CLAUDE.md)·README 요약+링크.)

---

## 하네스: Design System

**목표:** 토큰 검증·HTML 가이드 생성·Figma 동기화·리뷰 관리를 자동화한다.

**트리거:** 토큰 검증, 가이드 페이지 업데이트, Figma 동기화, MD 리뷰 등록 작업 요청 시 `design-system` 스킬을 사용하라. **Figma 컴포넌트를 코드로 옮기는 작업**("Figma ~ 구현/변환/만들어줘")은 `figma-to-code` 스킬을 사용하라. 단순 질문과 직접 편집은 스킬 없이 직접 응답 가능.

**에이전트:** `.claude/agents/` — token-validator · guide-builder · figma-inspector · component-verifier · token-sync

**토큰 값 전파:** 사용자가 **토큰 "값"을 바꾸면**(예: "control-bg-disabled를 gray/100으로", "이 토큰 값 일괄 반영해줘") `token-sync` 에이전트가 연관된 모든 표면(tokens.css·vars-data.ts·install-prompt·semantic 문서·설치기 zip)에 누락 없이 전파한다. 표면 위치는 `npm run tokens:locate -- <token>`으로 결정론적으로 확인. 새 토큰 생성·네이밍·구조 변경은 token-sync 범위 밖(token-validator 소관).

**워크플로우 스킬:** `figma-to-code` — Figma 컴포넌트를 코드로 옮기는 5단계 검문소 워크플로우(재고조사 → 수치추출 → 구현 → 자가대조 → 다크모드). 상세: 아래 "🪜 Figma → 코드 5단계 워크플로우" 섹션.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-04-29 | 초기 하네스 구성 | 전체 | revfactory/harness 기반 신규 구축 |
| 2026-04-30 | 토큰 파일 전수 검수 후 CLAUDE.md 동기화 | Foundation·Semantic·Component | tokens.css·MD 파일과 불일치 항목 수정 |
| 2026-06-11 | control-bg-disabled 값 정정(gray/50→gray/100) + token-sync 에이전트 신설 | assets/css/tokens.css·plugins/figma-vars-installer/src/vars-data.ts·pages/install-prompt.html·assets/downloads/s1-design-system-installer.zip·.claude/agents/token-sync.md·scripts/token-sync-locate.js·package.json | 사용자 지적: `--color-control-bg-disabled` Light가 gray/50로 잘못 들어감 → gray/100 정정(Dark gray-dark/300 유지). tokens.css·vars-data 동시 수정 후 sync-prompt·installer:build 재생성, components-new는 tokens.css link로 자동 상속. **재발 방지:** 토큰 값 전파 전용 `token-sync` 에이전트 + `tokens:locate`(표면 위치 결정론적 탐색) 신설 — 향후 토큰 값 수정 시 연관 표면 일괄 동기화 자동화. |
| 2026-05-11 | MVP3.3 Portal IA 재편 | assets/js/main.js·pages/registry-health.html·pages/button-harness.html | System 그룹 분리, Button 탭 구조 추가 |
| 2026-05-11 | MVP3.3 Button Components 통합 | pages/components.html·registry/components/button.json·assets/js/main.js | Button Harness 메뉴 제거, ACTION 컬럼 추가, registry 사이즈 정합 |
| 2026-05-12 | MVP3.4 Button Figma MCP 비교 | reports/mvp3-4-button-figma-mcp-comparison.md | 토큰 불일치 7건·이중 CSS 구조 문서화, Figma nodeId 미등록 확인 |
| 2026-05-12 | MVP3.4.1 Button Sync 자동화 | scripts/sync/button-sync-check.js·package.json·.github/workflows | 37개 정합성 검사, 일일 09:30 KST 자동 실행 |
| 2026-05-12 | MVP3.5 Source Guard MVP | scripts/guard/·reports/source-guard-*.md | 외부 서비스 프로젝트 디자인시스템 준수 여부 검사기 |
| 2026-05-12 | MVP3.6 Source Guard Fix Suggestions | scripts/guard/suggest-fixes.js·token-suggestion.js·fix-suggestion-rules.js·patch-writer.js | HEX→semantic token 역매핑 + 수정 후보 생성기 |
| 2026-05-12 | MVP3.7 Source Guard Apply Mode | scripts/guard/apply-fixes.js·apply-rules.js·patch-utils.js·backup-utils.js | high-confidence 자동 적용, dry-run/apply 분기, backup 생성 |
| 2026-05-12 | MVP3.8 Source Guard CI Dry-run | .github/workflows/source-guard-dry-run.yml | GitHub Actions 자동 검수: daily 09:30 KST + PR trigger + artifact 업로드 |
| 2026-05-12 | Pre-MVP4 Input 분류 | reports/pre-mvp4-input-classification.md·registry/components/input.json·registry/figma/figma-map.json | Figma MCP 8 nodes 분석, Base Input·Slots·Pattern·Picker 분류, 토큰 Gap 분석, HD 8개 |
| 2026-05-12 | MVP4.1 Input Related Composed Fields | pages/components.html·registry/components/input.json·README.md·CLAUDE.md·reports/mvp4-1-input-patterns.md | Search Input·Password Field·Input with Unit을 Components>Input 하단 Related Composed Fields로 정리 |
| 2026-05-12 | MVP4.2 Input Composed Fields Slot Correction | pages/components.html·registry/components/input.json·README.md·CLAUDE.md·reports/mvp4-2-input-composed-fields.md | Search Input prefixIcon 구조 정정 → suffixActionGroup 구조 반영. 2-state 프리뷰 추가. |
| 2026-05-12 | MVP4.2 Revision — Related Composed Fields Interactive | pages/components.html·registry/components/input.json·CLAUDE.md·reports/mvp4-2-input-composed-fields.md | 정적 is-preview → 실제 인터랙션. Figma MCP 아이콘 노드 확인. setupRelatedComposedFields() 추가. |
| 2026-05-12 | MVP4.3-A DatePicker Component Candidate | registry/components/date-picker.json·registry/components/index.json·pages/components.html·CLAUDE.md·README.md·reports/mvp4-3-a-date-picker.md | DatePicker를 별도 컴포넌트 후보로 등록. Figma node 6443:4655 조회 시도(MCP invalid — 미확인). Interactive preview 구현. |
| 2026-05-12 | MVP4.3-A Revision — DatePicker Figma 6456:4033 + uvis 참고 | pages/components.html·registry/components/date-picker.json·reports/mvp4-3-a-date-picker.md | Figma node 6456:4033(Section 2), 540:3794(datepicker_input), 540:3836(mobile bottomsheet) 조회. uvis amobe_datepicker.js 분석 및 재사용/교체 분리. YY.MM.DD 형식·44×44px day cell·30px inner circle·키보드 네비게이션 반영. |
| 2026-05-18 | MVP4-token Input 토큰 레이어 확정 | assets/css/tokens.css·pages/components.html·assets/css/components/input.css·tokens/semantic.md·tokens/component-tokens-extracted.md·registry/components/input.json·registry/components/index.json | --color-form-control-* semantic 레이어 추가. --color-text-state-* helper/correct/error 토큰 추가. --input-* 2-layer 구조(→form-control→semantic) 확정. 삭제: hover-bg/border·focus-bg·error-bg(HD-2/3/8). input.css 생성. |
| 2026-05-18 | Checkbox·Radio·Toggle 토큰 정합 | assets/css/tokens.css·pages/components.html·registry/components/index.json | 누락 토큰 추가(--checkbox-disabled-check-icon·--radio-disabled-dot). 불일치 수정(--radio-disabled-border·--toggle-off-bg·--toggle-disabled-bg tokens.css→components.html 기준). hover CSS 규칙 추가. harnessStatus: implemented. |
| 2026-05-18 | MVP4.4 color-control-border Semantic 분리 | assets/css/tokens.css·pages/components.html·tokens/semantic.md·tokens/component-tokens-extracted.md | --color-control-border-{default/hover/selected/disabled} 신설 (Foundation 직접 참조). Checkbox·Radio border 토큰을 --color-border-*/--color-action-primary-*에서 분리. Dark candidate 적용. |
| 2026-05-18 | MVP-T1 Figma CSS Token Mapping Registry | registry/tokens/figma-css-token-map.json·token-aliases.json·deprecated-tokens.json·registry/index.json·registry/figma/figma-map.json·README.md·CLAUDE.md·reports/mvp-t1-token-mapping.md | Figma MCP 확인 Variables와 CSS 토큰의 의미 기반 매핑표 생성. complete→filled·success→correct(HD-4 확정)·selected→focus alias 확정. placeholder gray/500 확정. form-control-text-default var(--color-text-secondary) 확정. |
| 2026-05-18 | MVP-T2 Figma Token Sync Plugin 구조 | plugins/figma-token-sync/**·package.json·README.md·CLAUDE.md·reports/mvp-t2-token-sync.md | TypeScript 플러그인 4-모듈 구조 생성. esbuild 번들 환경. SyncClassification 분류 로직. FIGMA_SEMANTIC_COLLECTION_ID 미확정으로 전체 preview-only. syncStableTokens() 의도적 throw. |
| 2026-05-18 | MVP-L1 Legacy UX Guide 2.4 Token Audit 단계 수립 | scripts/figma/match-figma-variable-metadata.mjs·package.json·README.md·CLAUDE.md·registry/figma/snapshots/ | --source/--profile CLI 옵션 추가. ux-guide-2.4 legacy audit 모드 신설. darkmode-test snapshot 격리. figma:audit 스크립트 추가. |
| 2026-05-18 | MVP-L3 Canonical Token Architecture Draft | registry/tokens/canonical-token-draft.json·reports/mvp-l3-canonical-token-architecture-draft.md·CLAUDE.md | Foundation/Semantic/Component 3-레이어 canonical 구조 정리. 61개 semantic·124개 component 토큰 전수 문서화. 8개 ND 항목 도출. ND-1(gray-dark-450 미정의 버그)·ND-2(dark border rgba) 고우선순위 확인. |
| 2026-05-18 | MVP-L4 Canonical Token Review & Promotion Plan | registry/tokens/canonical-token-promotion-plan.json·reports/mvp-l4-canonical-token-review.md·CLAUDE.md | 42개 promote-candidate / 8개 hold / 7개 needsDecision 분류. ND-NAMING-01(correct vs success 충돌) 발견. token-aliases.json 내부 모순 발견. 8개 component registry JSON 생성 준비 완료(Claude 승인 후 실행). |
| 2026-05-18 | ND-2 Dark Border rgba → Foundation Dark Scale | assets/css/tokens.css·registry/tokens/semantic.colors.json·registry/tokens/canonical-token-draft.json·CLAUDE.md | 5개 dark border rgba 값을 Foundation gray-dark 스케일로 교체. subtle→200, default→300, disabled→200, strong→500, emphasis→700. semantic.colors.json 상태 candidate→stable. rgba 예외 border 항목 제거. |
| 2026-05-18 | ND-5 Chip Line/Solid Split | assets/css/tokens.css·tokens/component-tokens-extracted.md·registry/tokens/canonical-token-draft.json | --chip-* 17개 unified 토큰 삭제 → --chip-line-* 17개 + --chip-solid-* 17개 분리. component-tokens-extracted.md hover/icon/close-icon 행 추가. component token 총계 123→140. |
| 2026-05-19 | MVP-C0 D001~D003 반영 | assets/css/tokens.css·pages/components.html·registry/tokens/component-token-coverage.json | readonly 토큰 신설(D001)·dropdown-list-bg surface-raised 통일(D002)·components.html tokens.css 링크 전환 + 인라인 semantic 제거(D003) |
| 2026-05-19 | MVP-L5 Canonical Token v0.1 Promotion Plan (재작성) | registry/tokens/canonical-token-promotion-plan.json·reports/mvp-l5-canonical-token-promotion-plan.md | L1~L4.5 통합. HD-L4.5-A/B/C 반영. promote-candidate 44그룹/hold 11/alias-only 3/deprecated-alias 6/remove 5/future 2 분류. chip line/solid 분리·readonly 신설·ND-7 미결 포함. 7개 Human Decision 도출. |
| 2026-05-19 | ND-7 Semantic Colors Registry 동기화 | registry/tokens/semantic.colors.json·canonical-token-promotion-plan.json·reports/mvp-l5-canonical-token-promotion-plan.md | controlBorder·formControl·textState 3개 카테고리 신규. text·border 각 1개 추가. 총 19개 등록(43→62개). CSS 변경 없음. |
| 2026-05-19 | decision-003 Component Registry JSON 업데이트 | registry/components/checkbox·radio·toggle·dropdown·select·nav·pagination·table.json | checkbox(10)·radio(8)·toggle(4)·dropdown(17) 토큰 채움. select·nav·pagination·table 미정의 상태 기록. |
| 2026-05-19 | MVP-C0 Component Token Coverage Pilot | registry/tokens/component-token-coverage.json·reports/mvp-c0-component-token-coverage-pilot.md | 7개 컴포넌트 토큰 커버리지 분석, missing 5건·deprecated 2건·needs-decision 4건 도출. Textarea 미구현 확인. components.html vs tokens.css 불일치(dark border·placeholder·dropdown-list-bg) 발견. |
| 2026-05-19 | MVP-L4.5 Token Coverage Review (F0+C0 합산) | reports/mvp-l4-5-token-coverage-review.md·registry/tokens/canonical-token-draft.json·legacy-token-usage-map.json·component-token-coverage.json | F0+C0 합산 분류. form-control semantic-confirm·button component-alias·accent-alt rename·title/primary value-mismatch·dedup 5건·rescan-needed 3건. canonical-token-draft notes 보정. |
| 2026-05-19 | Textarea 컴포넌트 registry 생성 | registry/components/textarea.json·registry/components/index.json | HD-6 확정 기반. Inputbox_large → Textarea 별도 컴포넌트. --input-* semantic alias 재사용 여부 pending. plannedTokens 10개 정의. |
| 2026-05-19 | Pattern 페이지 설계 | pages/patterns.html | Search+Table·Tree+Detail·Dashboard·Settings 4개 패턴. 각 패턴별 레이아웃 다이어그램·컴포넌트 구성·토큰·사용 규칙 탭 구조. Coming Soon 플레이스홀더 교체. |
| 2026-05-19 | Legacy 가이드 작성 | pages/legacy.html | confirmed 44건·needs-review 44건 매핑 테이블. 마이그레이션 단계·Source Guard 사용법·체크리스트 포함. MVP-L1 완료 전 상태 노출. Coming Soon 플레이스홀더 교체. |
| 2026-05-19 | MVP-F0 Figma Variable Usage Audit | registry/figma/snapshots/figma-variable-usage.ux-guide-2.4.json·registry/tokens/legacy-token-usage-map.json·reports/mvp-f0-figma-variable-usage-audit.md | MCP를 통해 접근 가능한 컴포넌트 노드의 variable usage 스캔. semantic/component/deprecated 후보 분류. 8개 노드 스캔, 63개 unique variable 사용 확인, 7개 needs-review·3개 invalid-node(6443:4408/6443:4655/6443:4606) 도출. |
| 2026-05-19 | MVP-F1 Figma Variable Usage Export 자동화 | plugins/figma-token-sync/src/code.ts·types.ts·ui.html·registry/figma/figma-usage-targets.json·scripts/figma/check-figma-usage.mjs·apply-figma-usage.mjs·package.json | ACCESS-01 자동화. target 설정 파일 분리. export-variable-usage 핸들러. check(7항목)·apply(legacy-map+plan+report) 스크립트. figma:usage:check/apply npm 명령어. |
| 2026-05-19 | MVP-C1 Chip 컴포넌트 구현 | registry/components/chip.json·registry/components/index.json·pages/components.html | chip.json unified→line/solid split 재작성(17토큰×2). hover·icon·close-icon variant CSS 추가. 매트릭스 Selecting→Hover 전환. Token Details 탭(34행) 추가. harnessStatus: implemented. |
| 2026-05-20 | Table 컴포넌트 토큰 정합 | registry/components/table.json·assets/css/tokens.css·tokens/semantic.md·tokens/component-tokens-extracted.md·registry/tokens/semantic.colors.json | Figma MCP pc_table_header(540:4940)·pc_table_body(540:4851) 직접 조회. color-data semantic 카테고리 신설(--color-data-state-hover=blue-50). 토큰 수정 3건(header-bg→bg-default, header-text→text-secondary, header-border→border-subtle). 신규 1건(--table-header-hover-bg). --table-row-hover-bg=blue-50(#E2F1FF)로 교체. HD-Table-1(dark)/HD-Table-2(selected≠hover) 2건 도출. |
| 2026-05-20 | --color-bg-home Quality Gate 해소 | scripts/gate-check.js | B안: hexAllowlist 추가. inline comment HEX false positive 수정(codeOnly 처리). |
| 2026-05-20 | Textarea Token Details 구현 + figmaNodeId 등록 | pages/components.html·registry/components/textarea.json | Token Details 탭 15개 토큰 전체 문서화. --input-* 공유 확정(--textarea-* 불필요). figmaNodeId: 641:4060 (Mobile Inputbox_large). tokenStatus→stable, harnessStatus→implemented. |
| 2026-05-20 | MVP-L2 Legacy Token Classification v1.1 | reports/mvp-l2-legacy-token-classification.md | 115건 전량 분류 완료. alias-only 74건·future-component-token 18건·hold-missing-usage 18건·hold-duplicate 2건·deprecated-alias 2건·promote-candidate 1건. hold-needs-review 15건 Figma snapshot VariableID(1:3=white, 1:11=light-gray, 2:26=blue-400, 1:28=gray-500) 분석으로 전량 해소. |
| 2026-05-20 | MVP-L2 v1.2 — Group A~F 결정 반영 | reports/mvp-l2-legacy-token-classification.md·assets/css/tokens.css·registry/components/nav.json·table.json·registry/tokens/semantic.colors.json·tokens/semantic.md·tokens/component-tokens-extracted.md | alias-only 79건·no-canonical-needed 13건·hold-missing-usage 0건 최종 확정. --color-control-bg-hover·--nav-item-indicator-default·--table-border-light/strong 신규 구현. CSS cascade override 한글 주석 추가(control-border·nav 섹션). |
| 2026-05-20 | 레이아웃 정합 — 신규 컴포넌트 코드블록 표준화 | pages/components.html | DatePicker·Table·TimePicker·Pagination 4개 섹션. HTML→CSS→Token Details 탭 순서 통일. DatePicker Token Candidates 플레인텍스트 → code-block(HTML·CSS·Token Details 탭) 전환. DatePicker s1-dp-states(Trigger·Size·Interactive) preview-area 래핑. Pagination Status 컬럼 제거 → 표준 4컬럼 헤더 적용. |
| 2026-05-20 | DatePicker PC Calendar 구현 (Figma 540:4216) | pages/components.html | Figma 540:4216 기준. 패널 CSS: width=356px, py=20px, px=24px, border=--color-border-strong, radius=4px. Day cell: mobile circle(day-inner span) 제거 → 44×44px 직사각형 border:1px transparent. is-today=파란테두리, is-selected=파란배경. Static PC Calendar Panel 프리뷰 신규 추가(2026.05 May · 15일 선택 · 20일 오늘). Interactive Preview min-height=420px. |
| 2026-05-26 | Navigation + Dropdown Core 컴포넌트 등록 | registry/components/index.json·pages/components.html | nav(priority 13)·dropdown(priority 14) index.json 등록. "Navigation" 카테고리 신설. Nav Item States Matrix + Token Details 탭(10토큰) 구현. .s1-nav/.s1-nav-item/.s1-nav-divider CSS 추가. 클릭 시 active 전환 JS 핸들러. 뱃지 7→13 업데이트. |
| 2026-05-26 | DatePicker·TimePicker HD 해소 및 harness 완성 | pages/components.html·registry/components/date-picker.json·time-picker.json·assets/icons/ic_calendar.svg·assets/js/icons-data.js | HD-9(weekStart=0 일요일). HD-7(is-other-month 클릭 허용 → 월 이동). HD-3(ic_calendar.svg 등록). HD-Time-1(ic_시계 통일). HD-Time-4(Mobile Bottom Sheet 구현). DatePicker·TimePicker Dark Mode Preview 추가. |
| 2026-05-27 | Button Secondary 다크모드 확정 + Dark 시각검증 | assets/css/tokens.css·pages/components.html·registry/components/button.json·checkbox.json·radio.json·toggle.json | Button Secondary dark: fill=gray-dark-400(bg-elevated)·stroke=gray-dark-500(border-strong)·hover=gray-dark-300(bg-muted) Figma 796:20068 검수 일치. CSS cascade 차단 해소(button-secondary inline :root 차단 → [data-theme="dark"] 블록 추가). Button·Checkbox·Radio·Toggle darkModeStatus: pending/candidate → stable 전환. |
| 2026-05-27 | 컴포넌트 harness 레이아웃 개선 + Table Sizes 비교 뷰 추가 | pages/components.html·registry/components/table.json | Action 열 padding-right 32px로 시각 분리. 상태 열 minmax(Xpx, 1fr) 전환으로 우측 공간 완전 활용. 버튼 좌측정렬 복원. Input/Textarea 오버플로우 해소(minmax(200px,1fr)). DatePicker·TimePicker 입력 hover = Select hover 통일(--dropdown-trigger-hover-bg/border). TimePicker Select형 드롭다운 border color 수정(--dropdown-list-border). Select·DatePicker·TimePicker 드롭다운 gap 8px 통일(top: calc(100% + 8px)). Table md/sm Sizes 비교 블록 신규 추가(행높이 md=44px/sm=38px 나란히 비교). table.json harnessStatus skeleton→implemented, v0.3.0→v0.4.0. |
| 2026-05-28 | Line Tab 컴포넌트 harness 구현 + 자동 감사 체계 정립 | pages/components.html·registry/components/tab.json·assets/css/tokens.css·registry/components/index.json·scripts/harness-audit.js·.claude/agents/guide-builder.md·reports/repeated-requests.json | Figma 540:6032 기준. --color-navigation-* semantic 5개 신설(Light gray-600/gray-200/action-primary + Dark candidate). --tab-* component 5개. Navigation 카테고리 신설. Line Tab nav 버튼·Sizes 비교·States Matrix(PC MD/SM/Mobile × Unselected/Selected/Hover)·HTML·CSS·Token Details 탭 구현. 인터랙션 JS setupTabStrip(). harness-audit SIZE_RULES에 tab 추가(tab-html). 감사 결과 10/10 PASS. guide-builder.md RULE-1 표 갱신. 반복 요청 추적 파일 신설(repeated-requests.json 5패턴). |
| 2026-06-05 | Figma → 코드 5단계 검문소 워크플로우 신설 | .claude/skills/figma-to-code/SKILL.md·.claude/agents/component-verifier.md·.claude/agents/figma-inspector.md·.claude/agents/guide-builder.md·CLAUDE.md·reports/figma-to-code/README.md | 단계형 워크플로우(재고조사→수치추출→구현→자가대조→다크모드) + 검문소 STOP 신설. 만드는 자(guide-builder) ≠ 검증하는 자(component-verifier 신규) 분리. figma-inspector에 1·2단계 추출 모드 추가(기존 Gate 2 보존). 절대규칙 4개(추측 금지·아이콘 원본 강제·막히면 보고·목록 책임). 산출물 reports/figma-to-code/{component}/. 기존 6 Gate(사후)와 5단계(사전 검문소) 층위 분리. |
| 2026-06-05 | TimePicker Select harness md/sm 완성 (figma-to-code 첫 적용) | pages/components.html·assets/css/tokens.css·registry/components/time-picker.json·scripts/harness-audit.js·.claude/agents/guide-builder.md·reports/figma-to-code/time-picker-select/* | Figma timepicker_select 540:3636(라이트 전용) 실측. sm(h28) 신규 추가 + md 수치 정정(min-w 60→78·라벨 14→16px·값 ls 0). HD-TPS-1: --color-form-control-border-disabled #E9E9E9→#D9D9D9(Light, 공유). HD-TPS-2: 손그림 chevron→원본 ic_화살표,더보기(563:3158) 벡터. harness-audit SIZE_RULES tp-select 등록(12/12 PASS). component-verifier 4단계 대조 ❌0. 사용자 "데이트피커"라 했으나 원본=타임피커 셀렉트로 확인·정정. |
| 2026-06-06 | GNB 컴포넌트 구현 (figma-to-code) | pages/components.html·assets/css/tokens.css·assets/js/icons-data.js·registry/components/{gnb,index}.json·scripts/harness-audit.js·.claude/agents/guide-builder.md·reports/figma-to-code/gnb/* | Figma pc_gnb(540:5942)·slots_menu(540:6069)·slot_utility 실측. 메뉴 슬롯 9(size 3×state 3) + GNB 바 6(size 3×align 2, viewport는 반응형 통합). 신규 semantic 2개(--color-navigation-label-default-alt=black·--color-navigation-icon=#353535) + --gnb-* 7. 아이콘 3종 원본(ic_인터넷 재사용·ic_계정/ic_메뉴 MCP 원본으로 icons-data 빈 svg 채움). 4단계 검증 ❌0(xsm 바 패딩 좌우반전 pl20/pr24 (a)수정). harness-audit gnb 등록(13/13). HD-GNB-1(로고색)·다크 active 대비 개선안 미결. |
| 2026-06-06 | 규칙 체계 정리 (흩어진 규칙 정본화 + 두 갈래 분류 원리) | CLAUDE.md·README.md·.claude/agents/{token-validator,component-verifier,figma-inspector}.md·.claude/skills/figma-to-code/SKILL.md·registry/governance/{audit-rules,token-exceptions}.json | **최상위 원리:** Figma DS 2.4 = 정답지 아닌 참고 출발점. 불일치는 (a)코드실수→수정/(b)사전등록 개선→유지+개선목록/(c)애매→사용자확인(임의 (b) 금지). **rgba:** EX02·EX06 삭제·R12/R13 제거 → EX03(overlay)만. **hover:** 코드 hover가 Figma 누락이면 위반 아님(개선목록). **중복 정본화:** 기계규칙=audit-rules.json·사람규칙=CLAUDE.md(§🤖 공통 규칙 허브)·README는 요약+링크. **죽은 규칙:** §🎯 완료항목 이력 안내(물리삭제는 사용자 확인). Source Guard=유지(활성). |
| 2026-06-08 | figma-vars-installer Hybrid 패턴 재설계 (Foundation 이름분리·Semantic만 모드) | plugins/figma-vars-installer/src/{vars-data,code}.ts·assets/downloads/s1-design-system-installer.zip·scripts/installer-coverage-check.js | **표준 디자인 시스템 패턴** (Material 3·Apple HIG·IBM Carbon·Atlassian 동일) 적용. Foundation 컬렉션 단일 Default 모드 + light/dark 팔레트 별도 변수(gray/N · gray-dark/N). Semantic 컬렉션만 Light/Dark 2-mode (Dark는 -dark 변수 alias 참조). 이유: Foundation은 raw 색이라 모드 부여 무의미. CSS tokens.css의 --color-X-N / --color-X-dark-N 와 1:1 정합. installer-coverage-check.js 'DARK_FOLDED' 카테고리 폐기·Foundation Color 검증 208/208 PASS. Figma 디자이너 모드 토글 시 컴포넌트 자동 다크 전환 유지. |
| 2026-06-08 | figma-token-sync Import 기능에 Hybrid 패턴 적용 (모드 선택 UI) | plugins/figma-token-sync/src/sync/{importTokens,types}.ts·plugins/figma-token-sync/src/{code,ui.html}.ts | Import 기능은 모든 신규 컬렉션을 LIGHT/DARK 2-mode로 강제 생성했음 → Foundation 성격 컬렉션 import 시 잘못된 구조. `CollectionMode` 타입 신설("single"=Foundation 단일 Default / "light-dark"=Semantic 2-mode). applyImport(tokens, name, mode) 시그니처 확장 (기본 light-dark, 기존 호출자 호환). UI에 라디오 버튼 2개 추가 (Semantic 기본 선택). PluginMessage.importCollectionMode 페이로드 전달. 보호된 이름(semantic·Foundation) 차단 로직 유지. |
| 2026-06-09 | figma-vars-installer Prune 추가 (옛 역할기반 잔재 정리) | plugins/figma-vars-installer/src/{code.ts,ui.html}·assets/downloads/s1-design-system-installer.zip | 사용자 지적: 재설치해도 옛 plugin 이 만든 역할기반 변수(color/bg·surface·action·status 등)가 "Semantic Color V2" 컬렉션에 잔존. 원인=설치기가 add/overwrite만 하고 삭제 안 하는 정책. `pruneCollection()` 신설 — 플러그인 소유 컬렉션(Foundation·Semantic Color·Semantic Number)에서 현재 데이터셋에 없는 변수 제거. **유지 변수는 get-or-create 로 같은 Variable 객체 재사용 → 바인딩 보존**, 삭제 잔재에 걸린 연결만 끊김(사용자 승인). `done` 메시지에 removedCount 노출. 정책 변경: "삭제 안 함" → "플러그인 소유 컬렉션 한정 prune". | 사용자 요청(추천안+바인딩 보존 조건) |
| 2026-06-12 | 설치기 산출물 직접 검증 + 죽은 스코프 분기 제거 + Gate 6b(빌드 신선도) 신설 | plugins/figma-vars-installer/src/code.ts·assets/downloads/s1-design-system-installer.zip·scripts/{installer-freshness-check,gate-check}.js·package.json | 사용자 지적: "system installer도 봤니?" — Gate 6(coverage)만 보고 OK라 했지 빌드 산출물을 직접 안 봄. **직접 검사 결과:** ①**zip이 stale**(vars-data보다 오래됨 — 음성테스트로 mtime 갱신 후 installer:build 누락) → 재빌드. ②설치기 스코프 함수 `numberScopes()`에 `sizing/icon`→WIDTH_HEIGHT **죽은 분기**(폐지 토큰 참조) → 제거(line 188 `sizing/`가 Foundation sizing/N을 이미 WIDTH_HEIGHT로 커버 확인). **정상 확인:** Foundation sizing/N=WIDTH_HEIGHT, border-width=STROKE_FLOAT, radius=CORNER_RADIUS, font/line 스코프 정상, 폐지 토큰 빌드 번들 0건. **구조 갭 발견·차단:** Gate 6은 *소스* vars-data↔tokens.css만 봐 **빌드 zip이 stale해도 통과**(방금 stale의 원인). **Gate 6b 신설**(installer-freshness-check): 커밋 zip 의 code.js(esbuild가 vars-data 토큰 inline)에 정본 488개 토큰 키가 다 있는지 검사 → 빌드 누락 시 stale 탐지. 음성테스트(sizing/999 추가→zip 미빌드→stale 적발) 통과. gate:check 편입. 전 게이트 PASS. |
| 2026-06-12 | 전 number 차원 페이지 동기화 — foundation.html 4차원 표시 신설 + Gate 9 일반화 | pages/foundation.html·scripts/{gen-foundation-number,number-page-check,token-reconcile}.js·package.json | 사용자 지적: "색상뿐 아니라 sizing·spacing 등 추가/삭제 항목이 tokens.css·HTML 메뉴·설치기 모두 동기화돼야. 지금 제대로 반영됐는지 확인." **실측 감사:** 데이터 파이프라인(vars-data→tokens.css→install-prompt→zip)은 전 number 토큰 100% 일치(Gate 6+3 강제). **갭:** foundation.html이 font-size·line-height·opacity·breakpoint를 토큰으로 미표시(데이터엔 존재), 페이지 값-게이트가 sizing만 커버. **결정(사용자):** 전부 반영. **실행:** ①`gen-foundation-sizing`→`gen-foundation-number`로 일반화(5종 GEN 블록: SIZING·FONT_SIZES·LINE_HEIGHTS·OPACITIES·BREAKPOINTS, `npm run number:gen`) ②foundation.html에 Font Scale·Opacity·Breakpoint 섹션+칩+렌더 신설(정본 자동생성) ③Gate 9 일반화 — (A)number 5종 정본 일치 (B)vars-data 전 number 토큰(F 75·S 34)의 페이지 노출 검사(신규 추가 시 미반영 탐지) (C)폐지 토큰 재유입 0건. reconcile 3단계=number:gen. **음성테스트:** 임시 opacity/10 추가→(A)생성기·(B)페이지노출 동시 FAIL 확인 후 원복. 전 게이트 PASS. |
| 2026-06-12 | 컴포넌트별 사이징 Semantic 전면 폐지 → Foundation --sizing-N 직접 참조 (+생성기·Gate 9) | plugins/figma-vars-installer/src/vars-data.ts·assets/css/tokens.css·pages/{install-prompt,foundation,semantic,components,components-new,patterns,button-harness,ai-snippets,guide-md,legacy}.html·assets/css/components/{input,button}.css·registry/components/{button,chip,select,table,time-picker}.json·registry/tokens/semantic.sizing.json·scripts/{gen-foundation-sizing,number-page-check,gate-check,token-reconcile,installer-coverage-check}.js·package.json·설치기 zip | 사용자 지적: "파운데이션에 사이징 추가·시맨틱서 컴포넌트별 사이즈 삭제 결정했는데 검수 게이트 추가에도 foundation/semantic 메뉴에 미반영." **원인:** ①결정이 절반만 실행(Foundation sizing/N 추가만 됨, semantic 컴포넌트 사이징 미삭제) ②foundation.html에 Sizing 섹션 자체가 없음 ③semantic.html Sizing 표는 GEN 마커 밖 수기라 stale ④Gate 7은 색상값만 봐 number/sizing 사각지대. **결정(사용자):** 전부 삭제→Foundation 직접 참조 + 생성기·게이트 자동화. **실행:** 폐지된 27개 컴포넌트 사이징 토큰(button-height·chip-height·table-row-height·form-control-height·dropdown-item-height·icon·button-min-width)을 vars-data·tokens.css·install-prompt에서 제거. 전 표면 99건 참조를 값 보존(1:1 Foundation step)으로 var(--sizing-N) 직접 참조 마이그레이션(CSS·HTML·registry JSON·doc 페이지). foundation.html Sizing 섹션 신설(GEN:FOUNDATION-SIZING, `npm run sizing:gen` 정본=vars-data FOUNDATION_NUMBER). semantic.html Sizing 표→Foundation 이관 안내로 교체. semantic.sizing.json status→deprecated(옛→Foundation 매핑맵). **Gate 9 신설**(number-page-check): (A)foundation Sizing 블록=정본 일치 (B)폐지 토큰 재유입 0건 — gate:check·reconcile(5단계로 확장) 편입. 시각 변화 0(값 보존). 전 게이트 PASS. **잔여(역사적):** legacy-token-usage-map·canonical-token-draft·sw-v2.4.tokens.css·token-exceptions는 dated 스냅샷이라 보존(보고). |
| 2026-06-12 | Semantic Tokens 페이지 정본 연동 (A: 자동 생성기 + B: 완전성 게이트) | scripts/gen-semantic-page.js·pages/semantic.html·package.json(page:gen)·scripts/token-reconcile.js·scripts/token-sync-monitor.js·scripts/gate-check.js·scripts/token-value-consistency-check.js | 사용자 지적: Semantic Tokens 메뉴 내용이 Variables(tokens.css·설치기·프롬프트)와 상이·미연동. **원인:** semantic.html은 어떤 생성기에도 연결 안 된 수기 페이지였고, 2026-06-08 역할기반→컴포넌트폴더 전환을 못 따라가 죽은 역할기반 모델(~57 stale)·정본 88토큰 누락 표시. 기존 게이트는 교집합 "값"만 봐 PASS로 샘(완전성 사각지대). **A:** `gen-semantic-page.js` 신설 — vars-data SEMANTIC_COLOR(정본)→semantic.html `SEMANTIC_PAGE`(컴포넌트 폴더 15그룹·171토큰) 자동 생성. hex는 tokens.css resolver 재사용, 역할은 경로서 결정론적 파생(추측 0). 페이지를 GEN 마커+데이터주도 렌더로 전환. reconcile 2/4 단계 편입(tokens:gen 직후, page:gen). 사용자 결정="Variables 1:1 미러"(역할기반 복원 안 함). **B:** token-sync-monitor에 집합 완전성 검사 추가 — semantic.html 토큰집합 ≠ SEMANTIC_COLOR 정본이면 누락/잉여 ERROR(Gate 7·gate-check·PostToolUse 훅 강제). 음성테스트 누락1·잉여1 검출 확인. Check B 비교 24→170건. 멱등·전 게이트 PASS. |
| 2026-06-08 | `coolgray-dark` → `visual-gray-dark` 통일 (페어 명명 일관성) | assets/css/tokens.css·plugins/figma-vars-installer/src/vars-data.ts·tokens/foundation.md·CLAUDE.md·registry/tokens/{foundation.colors,canonical-token-draft,canonical-token-promotion-plan,sw-v2.4.tokens}.{json,css}·scripts/{gate-check,sync-install-prompt,installer-coverage-check,guard/load-registry}.js·data/figma-tokens/{*.json,*.js}·pages/foundation.html·assets/downloads/s1-design-system-installer.zip | 사용자 지적: 다른 팔레트는 모두 `{name} + {name}-dark` 페어인데 `visual-gray`만 `coolgray-dark`라는 다른 이름과 짝지어져 일관성 깨짐. visual-gray와 coolgray-dark가 사실상 같은 cool gray 계열의 light/dark 페어임 확인(visual-gray/500=#1B1D1F, coolgray-dark/50=#12141A — 인접 톤). 17 파일 80건 sed 일괄 치환. CSS·HTML 사용처 0건이라 안전. CLAUDE.md 표 통합 (Visual Gray 한 줄로). Gate Check / 빌드 / install-prompt sync 모두 PASS. |
| 2026-06-15 | Time Picker → components-new 이관 (컴포넌트 메뉴 정합) | pages/components-new.html | 사용자 지적: 컴포넌트(components.html)엔 있고 컴포넌트뉴(components-new.html)엔 없는 항목 확인 → **Time Picker 하나**(섹션 ID 1:1 대조). **원인:** 이전 이관 때 CSS(.s1-timepicker-*·.s1-tp-*)·인터랙티브 JS(setupTimePicker·mobile bottom sheet)·token resolver 는 이미 옮겨졌으나 **HTML 섹션과 nav 버튼만 누락**. **실행:** ①comp-nav 에 Time Picker 버튼 추가(form 카테고리, Date Picker 뒤) ②`<section id="time-picker">` 추가(Input형 4-state·Select형 md/sm·Mobile Bottom Sheet·Token Details — 기존 element ID 1:1 일치) ③hash 라우팅 valid 배열에 time-picker + date-picker(기존 누락 버그) 추가. **결과:** components.html(14)↔components-new(14) 섹션 완전 정합. harness:audit time-picker(input형·select형) 신규 인식·13 pass·0 error. 전 게이트 PASS. **확인된 구조:** TimePicker 드롭다운은 Figma 에 "Time Picker Dropdown"(build-components.ts `buildTimePickerDropdown`, Type=24h/12h)으로 **별도 컴포넌트**로 정의돼 있으나, **값은 Basic Dropdown 의 `color/dropdown/*` Variables 를 재사용**하는 것이 정본(역방향 생성기·zip·Gate 8 누락 0 확인). |
| 2026-06-17 | Button loading 상태 완전 삭제 (레거시 보존 없이 제거) | scripts/sync/button-sync-check.js·assets/css/components/button.css·CLAUDE.md | 사용자 확정: Button 에 loading 상태 없음 → 레거시로도 남기지 말고 삭제. **button-sync-check:** CANONICAL figmaStates·harnessColumns·staticColumns 에서 `loading` 제거 + button.json "loading" 상태 기대 검사 삭제 + is-loading/sw-button--loading CSS 검사 삭제. **button.css(폐기 sw-button):** `.sw-button--loading`·`::after`·`@keyframes sw-btn-spin` skeleton 블록 삭제. loading 잔존 0건. sync:button 3 issues→해소(남은 1 issue=README ghost·1 warn=button.css HEX 은 loading 무관 기존 건·별도). 전 게이트 PASS. |
| 2026-06-17 | 구 components.html 을 legacyFiles 격리(검수 제외) + 검수기 정본(components-new) 재지정 | registry/tokens/deprecated-tokens.json·scripts/{doc-token-ref-check,number-page-check,harness-audit,token-sync-locate,sync/button-sync-check}.js·pages/components-new.html·CLAUDE.md | 사용자 요청: 레거시 파일(components.html)은 보존하되 검색/검수에 안 나오게, 어제 만든 레거시 저장소에 등록. **격리:** `deprecated-tokens.json` `legacyFiles` 에 `pages/components.html` 추가(legacy-skip 정본). **검수기 정리:** ①Gate 10(doc-token-ref) 하드코딩 `EXCLUDE_PAGES` → `isLegacyFile()` 기반 일반화(legacyFiles 등록만 하면 자동 제외) ②number-page-check REUSE_TARGETS 를 `isLegacyFile` 필터 ③**harness-audit·button-sync-check·token-sync-locate 의 대상 = 구 components.html → 정본 components-new.html 재지정**(검수가 죽은 페이지가 아닌 라이브 페이지를 보도록). **정본 재지정으로 드러난 실제 갭 수정:** components-new chip 코드탭에 sm/mobile 사이즈 분기·CSS 탭 누락(구 페이지엔 있었음) → 보강(harness-audit 13 pass). **검색:** SITE_NAV/site-map/검색인덱스의 components.html 참조는 이미 전 단계(메뉴 삭제)에서 제거됨. **파일 보존:** components.html 파일 자체는 삭제 안 함(폐기 예정·직접 URL 접근 가능). **기존 별건(플래그):** sync:button 이 components-new 기준에서 button.json "loading" 상태 미정의 3건 보고 — 페이지 repoint 무관한 레지스트리 차원 기존 갭(별도 결정). 전 게이트 PASS·harness 13/13. |
| 2026-06-16 | site-base 를 Variables 검수에서 제외 (사이트 전용 분리) | scripts/{token-sync-monitor,gate-check,token-reconcile}.js·CLAUDE.md | 사용자 지적: site-base 는 사이트 전용인데 컴포넌트(Variables) 검수에 계속 site-base 역할 토큰이 검출돼 혼란. **결정:** site-base 구조·역할 토큰을 Variables 정본으로 끌어오던 Gate 7 의 layer 2(site-base sourcing) 제거 → **Variables 정본 = vars-data 단일**(Foundation+SEMANTIC_COLOR, bg/surface 포함). site-base 전용 역할 토큰(text/border/icon-role/action/status)은 사이트가 @import 로 그대로 쓰되 **Variables 검수엔 검출 안 됨**. token-sync-monitor `P.siteBase`·layer2 제거(정본 385 토큰 vars-data), gate-check·reconcile 주석 정정. **Gate 10(doc-token-ref)은 유지** — site-base 를 문서 참조 유효성 검증의 silent def-source 로만 사용(검출/surface 아님)해 false positive 방지. 다크모드·사이트 렌더 영향 0(site-base 파일·@import 그대로). 전 게이트 PASS. |
| 2026-06-16 | bg/surface semantic 토큰 편입 + Filter Chip 복구 + reconcile install-prompt 권위검증·--check 결정화 | plugins/figma-vars-installer/src/vars-data.ts·assets/css/tokens.css·pages/{components-new,semantic,install-prompt}.html·assets/downloads/s1-design-system-installer.zip·scripts/{token-reconcile,sync-install-prompt}.js | **(1) Filter Chip 복구:** components-new 에 Filter Chip CSS·JS 는 있었으나 HTML 섹션·nav 누락 → 정본 `buildFilterChip`(Line/Solid×Label only/With title×5상태) 기준 섹션 추가. 솔리드 보더 미정의 alias(currentColor 폴백 버그)·라벨/화살표가 일반 역할토큰(text-secondary·icon-default) 참조하던 것 → 정본 chip Variable 로 재바인딩. 드롭다운 선택옵션 hover 미적용(특이도 동률) → `.is-selected:hover` 규칙 추가(중립 gray/50 재사용·사용자 결정). **(2) bg/surface 편입(사용자 요청):** 원래 사용자가 Figma "semantic" 컬렉션에 만든 `surface/*`(16) 가 2026-06-08 컴포넌트폴더 전환 때 누락된 것 확인. 그중 **역할 배경 토큰 `color/bg/*`(default·subtle·muted·elevated·selected) + `color/surface/*`(default·raised) 7개를 vars-data SEMANTIC_COLOR 에 추가** — 값=site-base.css 실측 그대로(추측 0). 시멘틱 토큰으로 Figma·설치기·semantic.html 에 노출. site-base.css 사본은 포털 폴백으로 유지(Gate7 이 vars-data 우선·값일치 강제). 제외: `--color-bg-home`(#F5F6FB raw·사용처0), `surface/status/*`(값 미해석·Domain 미결#5). **(3) 재발방지:** install-prompt 동기화가 reconcile 후에도 stale 했던 근본원인 = ①값 모니터(Gate7)가 install-prompt 에 완전성(누락)검사 없음(semantic.html 만 `complete`) → 누락 못 봄 ②`sync-install-prompt --check` 가 mtime 기반 "업데이트 HH:MM" 스탬프를 비교에 포함 → 빌드가 mtime 건드리면 내용 같아도 비결정적 실패. **수정:** token-reconcile 자기검증에 `sync-install-prompt --check`(#code-full·#code-ai 둘 다) 편입(불일치 시 reconcile exit1) + --check 가 업데이트 스탬프도 정규화(토큰 내용 드리프트만 검출). 음성테스트: 토큰값 훼손→exit1 검출, build 후 결정적 exit0 확인. 전 게이트 PASS·harness 13/13. |
| 2026-06-15 | Time Picker Dropdown 정본 동기화 + 2026-06-12 미커밋 작업 마감 | pages/components-new.html·CLAUDE.md | 사용자 지적: "피그마엔 timepicker dropdown 별도 정의·basic dropdown 값 사용인데 variables/설치파일 정리가 안 됐다, 전에 하다 말았나?" **진단:** 2026-06-12 figma-to-code 5단계(`reports/figma-to-code/time-picker-dropdown/*` 1·2·4·5, 검증 PASS)로 역방향 생성기 `buildTimePickerDropdown`·vars-data·zip 까지 **완성·검증됐으나 커밋·문서화 미수행**(HEAD 에 함수 0건). Variables/설치기 자체는 정상(`color/dropdown/*`+`color/text/state/accent` 전부 존재, Gate 8 누락 0, zip code.js 5건 임베드) — **재사용이 의도된 설계**. 진짜 미완 = ①미커밋 ②changelog 없음 ③**HTML 가이드 드리프트**. **실행(A):** components-new.html 의 `.s1-tp-col-item`·`.s1-tp-select-dropdown-item` 토큰을 정본 dropdown-option 으로 교체 — default→`--color-dropdown-option-label-default`, hover→`--dropdown-option-hover-bg`(중복 dark override 2블록 제거), selected 테두리→`--color-dropdown-option-border-selected`·텍스트→`--dropdown-option-selected-text`. **시각 변화:** default/selected-border 값 동일(무변화), **dark selected 텍스트 #3070D8→#4285E8**(blue-dark/350, 정본 정정), hover dark gray-dark/200→/300(Basic Dropdown 과 통일). **실행(B):** 직전 행의 부정확한 "일반 semantic 직접 참조=잠재 일관성 항목" 서술을 "정본=dropdown 재사용, HTML 이 드리프트였음"으로 정정 + 본 행 추가. 전 게이트 PASS. |
| 2026-06-15 | Variables 그룹명 변경 data→table·data/state→table/cell | plugins/figma-vars-installer/src/{vars-data,build-components}.ts·assets/css/tokens.css·assets/css/component-tokens.css·pages/{semantic,install-prompt,components-new,ai-snippets,guide-md}.html·registry/components/table.json·registry/tokens/semantic.colors.json·scripts/gen-semantic-tokens.js·assets/js/registry-data-bundle.js·설치기 zip | 사용자 요청: data Variables 그룹명을 table로, data/state 를 table/cell 로 변경하고 연관 전 표면 반영. **정본(vars-data) 6키 rename:** `color/data/border/{light,strong}`→`color/table/border/*`, `color/data/header/bg`→`color/table/header/bg`, `color/data/state/{default,hover,selected}`→`color/table/cell/*` (값 100% 보존). 충돌 0(기존 `color/table/`·`--color-table-*` 없음 확인). **소비처:** build-components.ts buildTableCell 4행. **레지스트리:** table.json figmaVariable 6건, semantic.colors.json `dataState`→`tableCell` 카테고리+cssVar `--color-data-state-hover`→`--color-table-cell-hover`. **자동 재생성:** tokens:gen(tokens.css 171)·page:gen(semantic.html 15그룹/171)·sync-prompt(install-prompt)·installer:build(zip color/table 14·color/data 0)·build:bundle. **주석/문서:** component-tokens.css·components-new·gen-semantic-tokens.js·ai-snippets/guide-md 네임스페이스줄. **보존(레거시 스냅샷·dated):** figma-variable-metadata.*·legacy-*.json·mvp 리포트·token-sync samples — data 이름 유지(보고). **nav 카테고리 정리(사용자 확인):** 레거시 "Data" 카테고리는 Table·Pagination을 묶던 vestigial 라벨 → 제거. **Table은 신규 "Table" 카테고리**, **Pagination은 "Navigation"으로 재배치**(Pagination=내비게이션 컨트롤). 반영: components-new category-nav 탭·comp-nav data-category(+Pagination 버튼 GNB 뒤로 이동)·index.json groups(`data`→`table`)·table.json category(`data`→`table`)·pagination.json category(`data`→`navigation`)·registry-data-bundle 재생성. **미처리(별개):** ai-snippets/guide-md 의 `color/data/table/*` 상세행은 옛/신 정본 어느쪽도 아닌 기존 stale 문서라 별도 정리 필요. 전 게이트 PASS(Gate 7 정본 일치·Gate 8 키 누락 0·Harness 13 pass). |
| 2026-06-15 | ai-snippets/guide-md Table 문서 정정 + Gate 10(문서 토큰 참조 드리프트) 신설 | pages/{ai-snippets,guide-md}.html·scripts/{doc-token-ref-check,gate-check}.js·registry/tokens/deprecated-tokens.json·package.json·CLAUDE.md | 사용자 지적: 직전 rename의 미처리 stale 문서도 정리하고 **게이트에 넣어 자동 유지**되게. **정정:** ai-snippets/guide-md 의 "8. Table" 섹션 — Figma 경로 `color/data/table/*`→`color/table/*`, 값도 정본(component-tokens.css)과 일치하게(`--table-header-bg` bg-subtle→**bg-default**, header-text tertiary→**secondary**, header-border→`--table-border-light`, cell-border→`--table-border-light`, `--table-border-light/strong` 행 추가). **Gate 10 신설**(`doc-token-ref-check.js`·`npm run docs:tokencheck`): 활성 `pages/*.html`(components.html 폐기 제외) 검사 — **Check B(차단):** `deprecated-tokens.json.renamedGroups`(신설, seed `color/data/`→`color/table/`·`color/data/state/`→`color/table/cell/`·`--color-data-`→`--color-table-`) 잔재 0 강제 → **토큰 rename 시 옛 이름 쥔 문서 자동 적발**. **Check A(경고):** `--color-*` 참조가 canonical(tokens.css∪site-base.css∪component-tokens.css∪페이지-로컬)에 존재하는지 — 미정의 21건은 기존 드리프트(도메인·제안·폐기 토큰)라 경고만(비차단). gate:check 편입. 음성테스트(옛 경로 주입→Check B 적발) 통과. **재발방지 원리:** 향후 토큰 rename 시 renamedGroups 에 {from,to} 한 줄 추가하면 게이트가 전 문서 잔재를 자동 차단. **남은 경고:** Check A 21건(--color-domain-status-*·bg-active·action-danger 등)은 별도 정리 대상. |
| 2026-06-16 | 레거시 격리 구조 신설 + Check A 드리프트 정리 (활성↔레거시 분리) | assets/css/legacy-tokens.css(신규)·tokens/legacy/deprecated-reference.md(신규)·scripts/lib/legacy-skip.js(신규)·assets/css/component-tokens.css·pages/{ai-snippets,guide-md,semantic,registry-explorer,harness-overview,policy}.html·registry/tokens/deprecated-tokens.json·scripts/doc-token-ref-check.js·CLAUDE.md | 사용자 지적: 레거시 잔재가 검수에 계속 표출됨 → **활성 정본과 레거시를 파일 분리**해 레거시는 검사조차 안 되게. **레거시 격리 아키텍처:** ①`assets/css/legacy-tokens.css`(미로드 격리 — component-tokens.css 의 죽은 `--button-ghost-*` 6개 이동, var() 실사용 0건) ②`tokens/legacy/deprecated-reference.md`(폐기 variant 문서 아카이브 — ai-snippets/guide-md 에서 뺀 ghost·danger 표/CSS 보관) ③`scripts/lib/legacy-skip.js`(공용 필터 — deprecated-tokens.json 의 deprecatedTokens cssVariable[와일드카드 `--button-ghost-*` 등]·legacyFiles 를 읽어 폐기토큰명·레거시파일 판정) ④deprecated-tokens.json 에 `legacyFiles` 추가. **게이트 연동:** Gate 10 Check A 가 `isDeprecatedToken()` 으로 폐기 토큰 자동 제외 → **신규 폐기 시 deprecated-tokens.json 등록만 하면 전 검사에서 자동으로 빠짐.** **Check A 드리프트 정리(21→1):** A 도메인 status 토큰(`--color-domain-status-*`) — ai-snippets "7-2 서비스·도메인 상태"·"9 Status Card"·guide-md Status Card 섹션 삭제. C `--color-bg-active/deepest` 제안토큰 mention 삭제. D `--color-blue-gray-0`(레거시·visual-gray 가 정본) mention 삭제. E `--color-gray`(registry-explorer JS 주석 오탐) 주석 수정. border-focus→`--color-form-control-border-selected` 정정. surface-overlay·action-danger(danger 폐기) mention 삭제. ghost·danger variant 활성문서 0건. **보존:** semantic `--color-{text,border,icon}-danger`(활성 에러색)·primary/secondary/blue-line. **남은 1건:** `--color-icon-disabled`(legacy.html) = B 아이콘 rename(icon-muted→icon-disabled) 보류 결정 대기분. 전 게이트 PASS(1 warning). |

---

# 🎯 현재 프로젝트 단계

## 완료된 단계

* ✅ Foundation Token — Primitive 색상 팔레트 (Light + Dark) 정의 완료
* ✅ Dark Primitive — `gray-dark` (0–900), `blue-dark` (50–500) 추가 완료
* ✅ Semantic Token — 8개 카테고리 Light/Dark 값 전체 정의 완료 (`tokens/semantic.md`)
* ✅ Component Token — 9개 그룹 추출 및 Semantic 참조 구조 정의 완료 (`tokens/component-tokens-extracted.md`)
* ✅ Button variants — primary / secondary / blue-line 토큰 완료 (Danger 삭제, ghost deprecated 확정)
* ✅ Button blue-line variant — tokens.css + component.tokens.json 추가 완료 (2026-05-11)
* ✅ 가이드 HTML — foundation / semantic / components / guide-md / md-review 페이지 완료
* ✅ MVP3.3 Portal IA 재편 — System 그룹 분리, Button 페이지 6탭 구조 전환 완료 (2026-05-11)
* ✅ MVP3.4 Button Figma MCP 비교 — 토큰 불일치 7건 + 이중 CSS 구조 문서화 완료 (2026-05-12)
* ✅ MVP3.4.1 Button Sync 자동화 — 37개 정합성 검사 스크립트 + GitHub Actions 일일 자동화 완료 (2026-05-12)
* ✅ MVP3.5 Source Guard MVP — 외부 서비스 프로젝트 6종 위반 탐지 + 리포트 생성 완료 (2026-05-12)
* ✅ MVP3.6 Source Guard Fix Suggestions — HEX→semantic token 역매핑 엔진 + before/after 수정 후보 + patch diff 생성 완료 (2026-05-12)
* ✅ MVP3.7 Source Guard Apply Mode — high-confidence 자동 적용 + dry-run/apply 분기 + backup + apply log 완료 (2026-05-12)
* ✅ MVP3.8 Source Guard CI Dry-run — GitHub Actions 자동 검수 파이프라인 구축 완료 (2026-05-12)
* ✅ Pre-MVP4 Input 분류 — Figma MCP 8 nodes 분석, Base Input/Slots/Pattern/Picker 분류, 토큰 Gap 17개, HD 8개 도출 (2026-05-12)
* ✅ MVP4.3-A DatePicker Component Candidate — 별도 컴포넌트 후보 등록, Figma node 6443:4655 시도, Interactive preview 구현 완료 (2026-05-12)
* ✅ MVP-C1 Chip 컴포넌트 구현 — chip.json line/solid split 재작성. hover·icon·close-icon variant CSS + 매트릭스. Token Details 탭 34개 토큰 전체 문서화. harnessStatus: implemented (2026-05-19)

## 미결 사항 (다음 우선순위)

> **정리(2026-06-06):** 아래 ✅완료 항목(1·4·7·8·10·15)은 상단 **「변경 이력」 표**에 이미 반영된 **완료 이력**이다. 본 목록에서는 ✅ 스텁으로만 유지하며, **활성 미결은 2·3·5·6·9·11·12·13·14**다. (완료 항목 본문의 물리 삭제는 사용자 확인 후 일괄 진행 — 이관 후보)

```
1. Button 토큰 불일치 수정 ✅ 2026-05-12 완료
   결정 내용:
   - focus-ring 삭제: 디자인시스템 기준 없음. --button-*-focus-ring 3개 토큰 제거, .is-focus outline CSS 제거.
   - s1-btn 공식화: sw-button(button.css)은 deprecated. s1-btn(components.html)이 공식 CSS 시스템.
   - --color-border-disabled: semantic.md Light/Dark 섹션에 문서화 완료.
   이미 적용된 토큰 수정: primary-disabled-bg, blue-line-hover-border, blue-line-default-text, disabled-border 계열.

2. Figma Button nodeId 등록
   - registry/figma/figma-map.json 의 Button componentSetKey / figmaNodeId 모두 빈 문자열
   - Figma URL (node-id 포함) 제공 시 즉시 등록 가능

3. Dark Mode 버튼·컨트롤 색상 확정
   - --color-text-disabled dark 값: 현재 #35363F → #55575F 조정 검토 중
   - blue-line variant dark mode 시각 검증 미완료 (darkModeStatus: pending)
   - toggle tokens 불일치: MD는 var(--color-text-placeholder), CSS는 var(--color-border-default)

4. Chip 토큰 구조 정합 → ✅ 2026-05-19 완료
   - line/solid split 확정. chip.json·components.html 반영. hover·icon·close-icon variant 구현.

5. Semantic Token Figma 반영 (Figma 파일 직접 수정 필요)
   - 오타 수정: color/status-card/text/*--defualt → --default (3건)
   - surface/status/* → Domain Token 이동 여부 확정

6. Dark border 4 토큰 확정
   - --color-border-subtle/default/strong/emphasis dark 값 candidate 상태
   - resolved HEX 또는 foundation dark scale 참조 확정 필요 (Human decision)

7. Input 토큰 Human Decision → ✅ 2026-05-12 전체 결정 완료
   HD-1: --color-form-control-* Semantic 유지, --input-*은 Component alias
   HD-2: hover 상태 삭제 (Figma 미정의)
   HD-3: complete = 별도 bg/border 없음. default와 동일. text 차이로 구분
   HD-4: correct로 통일
   HD-5: --select-disabled-border → Select registry로 이동
   HD-6: Inputbox_large → Textarea 컴포넌트로 편입
   HD-7: Label 색상 → --color-text-primary 연결
   HD-8: --input-error-bg 불필요 (default와 동일)
   상세: reports/pre-mvp4-input-classification.md

8. MVP4 Input 구현 → ✅ 2026-05-18 토큰 레이어 완료
   - tokens/semantic.md: color-form-control-* + color-text-state-* 추가 완료
   - tokens/component-tokens-extracted.md: --input-* 2-layer 구조 반영 완료
   - assets/css/tokens.css: form-control semantic 레이어 + 정정된 --input-* 완료
   - assets/css/components/input.css: 신규 생성 완료
   - pages/components.html: 하네스 + 인라인 CSS 동기화 완료
   미완: darkModeStatus pending (--input-* dark 시각 검증 필요)
9. DatePicker component candidate Human Decisions (MVP4.3-A)
   - HD-1: Figma node 6443:4655 componentSetKey 확인 (MCP invalid — Figma 직접 확인 필요)
   - HD-2: 공식 컴포넌트명 확정 (DatePicker vs DayPicker)
   - HD-3: calendar icon Figma 노드명 확정 (현재 candidate SVG)
   - HD-4: Mobile 인터랙션 확정 (bottom sheet vs inline vs popover)
   - HD-5: DatePicker 전용 token candidate → stable 전환 여부 결정
   상세: reports/mvp4-3-a-date-picker.md
10. Textarea 컴포넌트 registry 생성 → ✅ 2026-05-20 완료
    - registry/components/textarea.json: tokenStatus→stable, harnessStatus→implemented, figmaNodeId→641:4060
    - Token Details 탭 15개 --input-* 토큰 문서화 완료 (--textarea-* 별도 불필요)
    - PC 버전 figmaNodeId 미확인 (Figma 직접 확인 필요)
11. TimePicker component candidate 정리 (figmaNodeId: 6443:4606)
12. Pattern 페이지 설계 (search-table, tree-detail)
13. Legacy 가이드 작성
14. MVP-L1 UX Guide 2.4 Variables export → npm run figma:audit 실행
    - Figma에서 실제 S1 UX 디자인가이드 2.4 파일 열기
    - SW Token Sync 플러그인 → Export Variables → Download JSON
    - registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json으로 저장
    - npm run figma:audit 실행 → reports/mvp-l1-legacy-token-audit.md 생성
15. MVP-L2 Legacy Token Classification → ✅ 2026-05-20 완료
    - 115건 전량 분류: alias-only 74·future-component-token 18·hold-missing-usage 18·기타 5건
    - hold-needs-review 15건 Figma snapshot VariableID 분석으로 전량 해소
    - hold-missing-usage 18건 (버튼 hover border x2·control hover bg·dropdown option hover border 포함) — 신규 canonical 신설 여부 Human Decision 필요
    - 상세: reports/mvp-l2-legacy-token-classification.md
```

---

# 🧠 Claude의 역할 (핵심)

Claude는 다음 역할만 수행한다:

✔ Figma 변수 및 스타일 분석
✔ Token 구조 정리 및 재설계
✔ Semantic Token 설계
✔ Component Token 설계
✔ 상태값 구조 정의
✔ Core / Domain / Legacy 분류
✔ 다크모드 확장성 검토
✔ 문서화 및 HTML 가이드 구조 제안

❌ UI 디자인 생성 금지
❌ React / Vue 코드 생성 금지
❌ 임의 컴포넌트 설계 금지

---

# 🎨 디자인 시스템 구조

디자인 시스템은 아래 레이어로 구성된다:

```
1. Foundation Token (Primitive)
2. Semantic Token
3. Component Token
4. Pattern
5. Legacy
```

---

# 🎨 Foundation Token 규칙

## 이 프로젝트 공식 token layer 용어

```
Foundation Token   (기본 팔레트 — gray/blue/red scale 등)
       ↓
Semantic Token     (역할 기반 — bg/text/border/action 등)
       ↓
Component Token    (컴포넌트 별칭 — --input-* / --button-* 등)
```

| 기존/일반 용어 | 이 프로젝트 공식 용어 |
|---|---|
| Primitive | **Foundation** |
| Base Palette | **Foundation** |
| Raw Color | **Foundation** |
| Semantic | Semantic |
| Component Alias | Component |

> **Foundation은 Primitive가 아니다.** 이 프로젝트에서 기본 팔레트 계층은 항상 "Foundation"으로 부른다.
> `Primitive`, `Base`, `Raw` 등의 용어는 다른 디자인시스템에서의 동의어이며, 이 프로젝트에서는 사용하지 않는다.

## 색상

* HEX 직접 사용 금지
* CSS 변수만 사용

```css
--color-gray-900
--color-blue-400
--color-gray-dark-900
--color-blue-dark-300
```

**예외 — rgba 허용 범위 (1가지만)**

| 토큰 카테고리 | 모드 | 허용 이유 |
|---|---|---|
| `color-overlay` | Light·Dark 공통 | alpha 채널 포함 값은 Foundation Primitive alias 불가 |

> ~~`color-border-*` Dark 예외~~ — 2026-05-18 ND-2 해소. Dark border는 Foundation gray-dark 스케일로 교체됨.

위 경우 외 rgba 직접 사용은 금지한다.

---

## 전체 색상 계열 (tokens.css 기준)

| 계열 | Light 변수 접두사 | Dark 변수 접두사 | 스텝 범위 |
|---|---|---|---|
| Gray | `--color-gray-{step}` | `--color-gray-dark-{step}` | 0 ~ 900 |
| Blue | `--color-blue-{step}` | `--color-blue-dark-{step}` | 50 ~ 500 |
| Red | `--color-red-{step}` | `--color-red-dark-{step}` | 50 ~ 500 |
| Orange | `--color-orange-{step}` | `--color-orange-dark-{step}` | 50 ~ 500 |
| Yellow | `--color-yellow-{step}` | `--color-yellow-dark-{step}` | 50 ~ 500 |
| Green | `--color-green-{step}` | `--color-green-dark-{step}` | 50 ~ 500 |
| Skyblue | `--color-skyblue-{step}` | `--color-skyblue-dark-{step}` | 50 ~ 500 |
| Purple | `--color-purple-{step}` | `--color-purple-dark-{step}` | 50 ~ 500 |
| Brown | `--color-brown-{step}` | `--color-brown-dark-{step}` | 50 ~ 500 |
| Visual Gray | `--color-visual-gray-{step}` | `--color-visual-gray-dark-{step}` | 50 ~ 500 |
| Base | `--color-base-white` / `--color-base-black` | — | — |
| Brand | `--color-brand-blue` / `-red` / `-gray` / `-ci` | — | — |
| Status Dark | `--color-status-dark-red` / `-green` / `-yellow` | — | alias |

> **스텝 간격**: 모든 계열 50 단위 (50·100·150·200·250·300·350·400·450·500). Gray만 예외: 0·50·100·200·300·400·500·600·700·800·900.

---

## Dark Primitive 스텝 방향 (핵심 규칙)

| 그룹 | 스텝 방향 | 역할 요약 |
|---|---|---|
| `gray-dark` | 0(어두움) → 900(밝음) | 배경(0~400) · 텍스트(700~900) |
| `blue-dark` | 50(어두움) → 500(밝음) | 선택배경(50~100) · 버튼(300) · 링크(400) |
| `status-dark` | red / green / yellow | 피드백 상태 전용 (각 계열 350 step alias) |

---

## 타이포그래피

* 정의된 토큰만 사용
* 임의 값 금지

```css
/* Font Size (10 ~ 32 — 38 없음) */
--font-size-10 / -12 / -14 / -16 / -18 / -20 / -24 / -32

/* Font Weight */
--font-weight-regular: 400
--font-weight-medium:  500
--font-weight-bold:    700

/* Line Height */
--line-height-130: 1.3
```

---

## 스페이싱

* Foundation primitive spacing: `--spacing-2` ~ `--spacing-128`
* Semantic spacing 토큰 (역할 기반): `--spacing-padding-block-*`, `--spacing-section-*`, `--spacing-stack-*`, `--spacing-cluster-*`, `--spacing-label-gap-*`
* 임의 px 금지 — 위 토큰만 사용

---

## Sizing / Radius

* Sizing: `--sizing-form-control-height-*`, `--sizing-button-height-*`, `--sizing-chip-height-*`, `--sizing-table-row-height-*`, `--sizing-icon-*`
* Radius primitive: `--radius-0` ~ `--radius-full` (0·2·4·6·8·10·12·16·20·full)
* Radius semantic: `--radius-control-xs/sm`, `--radius-button-md`, `--radius-card-md`, `--radius-modal-md`
* Border Width: `--border-width-default(1px)`, `--border-width-strong(2px)`
* 임의 값 금지

---

# 🧩 Semantic Token 설계 기준

Semantic Token은 "역할 기반"으로 정의한다.

## 카테고리

```
color-bg        → 페이지·레이아웃 배경
color-surface   → 컴포넌트 표면 배경 (카드·패널·모달)
color-text      → 텍스트 색상
color-border    → 테두리·구분선
color-icon      → 아이콘
color-action    → 인터랙션 액션 (컴포넌트가 참조)
color-status    → UI 피드백 상태 (성공·에러·경고·정보)
color-overlay   → 딤·오버레이
```

> `color-surface`는 `color-bg` 위에 올라오는 컴포넌트 표면 배경.
> Light에서는 둘 다 흰색이나, Dark에서 레이어 깊이가 시각적으로 분리됨.

## 주요 확정값

```css
--color-status-success: #1D6CEB   /* Light — blue 계열, 현재 서비스 기준 */
--color-status-success: #3FBE7E   /* Dark — green-dark/350 */
--color-text-primary:   #202020   /* Off-black — 확정값 */
```

## 예시

```css
--color-bg-default
--color-bg-subtle
--color-surface-default
--color-surface-raised
--color-text-primary
--color-text-secondary
--color-text-disabled
--color-border-default
--color-border-focus
--color-action-primary-default
--color-action-primary-hover
--color-status-success
--color-status-error
```

---

# 🧱 Component Token 설계 기준

Component Token의 참조 기준은 속성 유형에 따라 다르다.

## 색상 (color) — Semantic 경유 필수

Light/Dark 테마 전환이 Semantic 레이어에서 이루어지므로, 색상은 반드시 Semantic을 거쳐야 한다.
Foundation을 직접 참조하면 테마 전환 시 올바른 값을 얻을 수 없다.

```css
--button-primary-default-bg: var(--color-action-primary-default);
--button-primary-hover-bg:   var(--color-action-primary-hover);
--input-focus-border:        var(--color-border-focus);
--table-row-selected-bg:     var(--color-bg-selected);
```

## 크기·간격·반경 (sizing / spacing / radius) — 규칙 구분

| 경우 | 참조 방식 | 이유 |
|---|---|---|
| 여러 컴포넌트가 같은 값을 공유 | Semantic 경유 | 한 곳 수정으로 전체 적용 |
| 컴포넌트 전용 값 (다른 곳에서 쓰지 않음) | Foundation 직접 참조 가능 | Semantic 중간 레이어가 추가하는 가치 없음 |

```css
/* 공유 값 → Semantic 경유 */
--button-height-md: var(--sizing-button-height-md);

/* 전용 값 → Foundation 직접 참조 */
--modal-border-radius: var(--radius-8);
--chip-height-sm: var(--spacing-28);
```

> **색상은 예외 없이 Semantic 경유.** 크기·간격·반경만 위 규칙 적용.

## 네이밍 규칙

```
--{component}-{variant}-{state}-{property}
```

## 예시

```css
--button-primary-default-bg
--button-primary-hover-bg
--button-primary-pressed-bg
--button-primary-disabled-bg

--button-secondary-default-border
--button-ghost-hover-bg

--input-default-border
--input-focus-border
--input-error-border

--table-row-hover-bg
--table-row-selected-bg
```

---

# 🎛️ 컴포넌트 관리 기준

모든 컴포넌트를 통합하지 않는다.

## 분류 기준

### 1. Core Component

* 공통 UI
* 버튼, 인풋, 셀렉트, 팝업, 바텀시트 등

**CSS 토큰 추출 완료 variants**: `primary` / `secondary` / `blue-line`
> `ghost`: tokens.css에 legacy 보존. CSS 구현 없음 (deprecated 확정 2026-05-11)
> `danger`: 삭제 확정 (2026-04-29). 공식 V2.4 token 없음. 재추가 금지.

### 2. Domain Component

* 서비스 특화 UI
* 관제 / 영상 / 운영관리 등

### 3. Pattern

* 반복 구조
* search-table, tree-detail, dashboard 등

### 4. Legacy

* 기존 서비스 유지용
* 신규 사용 제한

---

## 운영 원칙

* Core는 통일
* Domain은 허용
* Pattern으로 재사용
* Legacy는 분리 관리

---

## 🔁 Core Component Reuse Rule (2026-05-20 확정)

모듈·패턴을 만들기 전에 component registry에서 기존 코어 컴포넌트를 먼저 확인한다.

### 원칙

1. **새로 만들기 전에 확인** — Button, Checkbox, Radio, Toggle, Input, Select, Textarea, Chip 등 이미 정의된 컴포넌트는 새로 만들지 않는다.
2. **모듈의 역할은 조합** — 모듈은 코어 컴포넌트의 배치·조합·상태 연결을 담당한다.
3. **시각 스타일 override 금지** — 코어 컴포넌트의 시각 스타일, 상태 스타일, 토큰을 모듈에서 재정의하지 않는다.
4. **없는 상태는 기록** — 필요한 상태·variant가 코어에 없으면 `needs-core-update` 또는 `decision-required`로 기록한다. 임의 구현 금지.
5. **dependency 명시 의무** — 모듈 registry JSON에 사용한 코어 컴포넌트를 `dependencies.coreComponents`로 명시한다.
6. **중복 발견 시 수정** — 모듈 안에서 임의로 만든 유사 컴포넌트가 발견되면 중복 구현으로 보고 코어로 교체한다.

### 확정 사례

| 모듈 | 사용 코어 컴포넌트 | 비고 |
|------|-----------------|------|
| Table selection | Checkbox (`s1-checkbox`) | header indeterminate 포함, `is-indeterminate` CSS 코어에 추가됨 |
| Filter group | Checkbox / Radio / Chip | 예정 |
| Form row | Input / Select / Textarea | 예정 |
| Action area | Button | 예정 |
| Toggle setting row | Toggle | 예정 |

### 금지 패턴

```css
/* 금지 — Table이 Checkbox를 재정의하는 class */
.s1-table-checkbox { accent-color: ...; }
```

```html
<!-- 금지 — 모듈 전용 체크박스 -->
<input type="checkbox" class="s1-table-checkbox">

<!-- 올바른 사용 — 코어 컴포넌트 배치 -->
<td class="s1-table-td--selection">
  <label class="s1-checkbox" aria-label="행 선택">
    <div class="s1-checkbox-box">…</div>
  </label>
</td>
```

### 모듈 편집 시 체크리스트

```
□ component registry에서 재사용 가능한 코어 컴포넌트 확인
□ 모듈 전용 class로 코어 컴포넌트를 재정의하지 않았는지 확인
□ registry JSON에 dependencies.coreComponents 명시
□ 필요한 상태가 코어에 없으면 needs-core-update 기록
```

---

# 🌗 Light / Dark Theme 기준

변수명은 유지하고 값만 변경한다.

```css
:root {
  --color-bg-default: #FAFAFA;
}

[data-theme="dark"] {
  --color-bg-default: #131418;
}
```

## 반드시 고려할 상태

```
default
hover
pressed
focus
selected
disabled
error
```

---

# 📁 파일 구조

## 토큰 정의 파일

| 파일 | 역할 | 상태 |
|---|---|---|
| `tokens/semantic.md` | Semantic Token 정의 (Light/Dark) | ✅ 완료 |
| `tokens/component-tokens-extracted.md` | Component Token 정의 (9개 그룹) | ✅ 완료 |
| `tokens/foundation.md` | Foundation Primitive 정의 + Dark 스텝 방향 규칙 | ✅ 완료 |
| `tokens/token-map.json` | 전체 토큰 매핑 JSON | 작성 예정 |

## HTML 가이드 페이지

| 파일 | 역할 | 상태 |
|---|---|---|
| `pages/foundation.html` | Foundation 색상·타이포·간격 | ✅ 완료 |
| `pages/semantic.html` | Semantic Token 테이블 | ✅ 완료 |
| `pages/components.html` | Component 인터랙션 상태 미리보기 | ✅ 완료 |
| `pages/guide-md.html` | MD 원본 코드스니펫 (복사용) | ✅ 완료 |
| `pages/md-review.html` | 수정 제안·결정 대기·Figma 체크리스트 | ✅ 완료 |
| `pages/patterns.html` | Pattern 가이드 | 예정 |
| `pages/legacy.html` | Legacy 마이그레이션 가이드 | 예정 |
| `pages/policy.html` | 토큰 사용 정책 | 작성 중 |

## 네비게이션 관리

| 파일 | 역할 |
|---|---|
| `assets/js/main.js` | 사이드바 네비게이션 렌더링 (SITE_NAV 배열) |
| `data/site-map.json` | 페이지 메타데이터 |

> 새 페이지 추가 시 `main.js`의 `SITE_NAV` 배열과 `site-map.json` 모두 업데이트 필요.

## MVP3.3 Portal IA 규칙 (2026-05-11 확정)

### SITE_NAV 그룹 구조

SITE_NAV는 사용자 대면 그룹과 System 운영 그룹으로 분리한다.

**사용자 대면 그룹** (디자이너·개발자 탐색용):
- `개요`: Overview, 토큰 설치 프롬프트
- `Foundation`: Foundation Tokens, Semantic Tokens
- `Design System`: Components, Button, Icons, Patterns, Policy, Legacy Guide
- `AI 워크플로우`: AI Snippets, Guide MD, MD 리뷰

**System 그룹** (운영·검증용, 사이드바 하단):
- System Status (구: Registry Health)
- Foundation Registry, Semantic Registry, Component Tokens, Component Registry

### 규칙

1. **System 그룹 격리** — 레지스트리 뷰어·거버넌스·상태 대시보드는 System 그룹에만 배치한다. 사용자 대면 그룹에 혼재 금지.
2. **Button 위치** — Button 컴포넌트 페이지는 Design System 그룹에 위치한다. Registry/System에 두지 않는다.
3. **리네임 규칙** — "Registry Health"는 항상 "System Status"로 표시한다. 코드(id, 파일명)는 유지, 텍스트만 변경.
4. **컴포넌트 상세 페이지 탭 구조** — 컴포넌트 harness 페이지는 Preview / Usage / Code / Figma / Review / Token Details 탭을 기본 구조로 사용한다.

## Current Button Standard (MVP3.4.2 — 2026-05-12 확정)

Button을 편집하거나 검토할 때 아래 기준을 단일 참조점으로 사용한다.

1. **공식 variants** — primary / secondary / blue-line. ghost는 공식 variant가 아니다. danger는 삭제됨.
2. **Figma states** — default / hover / pressed / disabled
3. **Harness columns** — action / default / hover / pressed / disabled
4. **action ≠ Figma state** — action은 Figma 디자인 상태가 아니다. HTML harness의 실제 인터랙션 테스트 컬럼이다.
5. **default = static preview** — default 컬럼 버튼에는 `.is-preview`를 적용한다.
6. **Size** — PC: medium(h44) / xsmall(h34) / xxsmall(h28), Mobile: mobile(h48)
7. **CSS class** — s1-btn-lg=medium, 무수식어=xsmall, s1-btn-sm=xxsmall, s1-btn-mobile=mobile. **s1-btn이 공식 CSS 시스템. sw-button(button.css)은 deprecated.**
8. **Token policy** — 색상은 반드시 Semantic 경유. raw HEX 금지. Foundation 직접 참조 금지.
9. **focus-ring 없음** — 디자인시스템 기준 미정의. --button-*-focus-ring 토큰 없음. is-focus outline CSS 없음.
10. **Sync** — Button 기준 변경 시 registry / HTML / md / reports를 함께 수정. `npm run sync:button`으로 정합성 검사.
11. **불일치 발견 시** — 임의 결정 금지. `reports/button-sync-check.md`에 기록 후 사용자 확인.

## MVP3.3 Button Components Integration 규칙 (2026-05-11 확정)

Button 페이지 편집 시:

1. **단일 진입점** — Components > Button (`pages/components.html`)이 Button의 유일한 사용자-facing 진입점이다.
2. **기존 문서 우선** — 기존 `components.html` + 기존 컴포넌트 가이드 내용이 우선 기준이다. registry와 충돌하면 기존 문서 기준으로 registry를 수정한다.
3. **Button Harness 메뉴 제거** — `pages/button-harness.html`은 별도 메인 메뉴로 노출하지 않는다.
4. **Registry/System 메뉴** — Component Registry, Component Tokens는 별도 사용자-facing 메뉴로 노출하지 않는다.
5. **ACTION 컬럼** — Button matrix에서 DEFAULT 앞에 ACTION 컬럼을 배치한다.
6. **ACTION = 인터랙션 전용** — ACTION 셀만 실제 클릭/disabled 테스트가 가능하다.
7. **DEFAULT = 정적 프리뷰** — DEFAULT 셀 버튼에는 `.is-preview`를 적용한다 (pointer-events: none).
8. **공식 variants** — primary / secondary / blue-line만 공식 노출. ghost는 노출 금지.
9. **Size 명칭** — PC: medium(h44) / xsmall(h34) / xxsmall(h28), Mobile: mobile(h48).
10. **Class naming** — `s1-btn` 기반 (s1-btn-lg=medium, 무수식어=xsmall, s1-btn-sm=xxsmall, s1-btn-mobile=mobile).
11. **변경 기록** — `reports/mvp3-3-button-components-integration.md`에 기록한다.

---

# 🔗 파일 연동 규칙 (변경 시 자동 동기화 필수)

파일을 수정할 때는 아래 연동 관계를 확인하고 **연관 파일을 함께 수정한다.**
사용자가 개별 파일만 언급해도, 연동 파일에 미치는 영향을 즉시 반영한다.
별도 요청 없이 자동 적용한다.

## 연동 관계 맵

### `tokens/semantic.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Semantic 섹션 값·구조 반영 |
| `pages/semantic.html` | 토큰 테이블 표시 업데이트 |
| `pages/guide-md.html` | MD 스니펫 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `tokens/component-tokens-extracted.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Component 섹션 값·구조 반영 |
| `pages/components.html` | 컴포넌트 미리보기 업데이트 |
| `pages/guide-md.html` | MD 스니펫 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `tokens/foundation.md` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/css/tokens.css` | Foundation 섹션 값·구조 반영 |
| `pages/foundation.html` | 색상·타이포 팔레트 업데이트 |
| `pages/guide-md.html` | MD 스니펫 업데이트 |
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 |

### `assets/css/tokens.css` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `pages/install-prompt.html` | `<pre id="code-full">` 인라인 CSS 동기화 (다운로드 원본) |

### `assets/js/main.js` (SITE_NAV) 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `index.html` | 개요 섹션 카드 목록 동기화 |
| `data/site-map.json` | 페이지 메타데이터 동기화 |

### 새 페이지 (`pages/*.html`) 추가 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/js/main.js` | SITE_NAV 배열에 항목 추가 |
| `data/site-map.json` | 페이지 메타데이터 추가 |
| `index.html` | 해당 섹션 카드 추가 |

### `assets/js/icons-data.js` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `pages/icons.html` | 아이콘 렌더링 동기화 |

### `pages/md-review.html` (결정 확정 항목) 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `tokens/semantic.md` 또는 `tokens/component-tokens-extracted.md` | 확정된 항목 즉시 반영 |
| `assets/css/tokens.css` | 확정된 토큰 값 즉시 반영 |

## 동기화 원칙

1. **단방향 금지** — 한 파일만 수정하고 연동 파일을 방치하지 않는다
2. **누락 없이 전파** — 연동 관계 맵의 모든 대상을 확인 후 수정한다
3. **install-prompt 인라인 CSS 최우선** — `tokens.css` 변경 시 항상 함께 수정한다
4. **요청 없이 자동 적용** — 사용자가 별도로 지시하지 않아도 연동 파일을 자동 수정한다

---

# 🤖 AI 작업 원칙 — 공통 규칙 허브 (정본)

> **이 섹션이 "공통 규칙"의 정본이다.** 모든 작업(figma-to-code·layout-builder·토큰 검증 등)에 공통 적용된다.
> 작업별(전용) 규칙은 각 작업 문서에만 둔다 → figma-to-code: `.claude/skills/figma-to-code/SKILL.md` · 레이아웃 틀: `component-page-template.md` · 토큰 거버넌스(R01~R11): `registry/governance/audit-rules.json`.

Claude는 "구현"이 아니라 "구조"를 만든다.

## 반드시 지킬 것 (공통)

1. 토큰 없이 스타일링 금지
2. **추측 금지** (검증 후 판단) — 모든 수치는 실제로 읽은 값만 사용
3. 기존 구조·토큰·컴포넌트 **우선 탐색·재사용** (임의 생성 금지)
4. 임의 생성 금지
5. **파일 편집은 허가 없이 즉시 진행** (사용자 명시 지시)
6. 파괴적 작업(파일 삭제, 구조 전면 변경)만 사전 확인
7. **막히면 보고** — 값·에셋을 못 얻으면 임의로 채우지 말고 어떤 항목인지 사용자에게 알린다
8. **두 갈래 분류** — 코드↔Figma 불일치를 자동 "코드 오류"로 보지 않는다: (a) 코드 실수→수정 / (b) 사전 등록된 개선→유지+개선목록 / (c) 애매→사용자 확인 (§🚫 상위 원리)
9. **검증 역할 분리** — 만드는 자 ≠ 검증하는 자 (구현=guide-builder, 4단계 대조=component-verifier)
10. **단계/검문소 승인 대기** — 검문소 통과 전 다음 단계로 넘어가지 않는다
11. **색상은 Semantic 경유**·HEX 직접 금지 (열거 규칙 R01~R11은 `audit-rules.json` 정본 참조)
12. 완료 시 **Orchestrator Summary** 형식 보고

---

# 📋 작업 프로세스

## 토큰·구조 변경 전 필수 확인

토큰 이름·값·구조를 생성하거나 수정하기 전 반드시 확인:

```
1. tokens/component-tokens-extracted.md — 기추출 Component Token
2. tokens/semantic.md — Semantic Token 정의
3. Figma MCP (get_variable_defs, get_design_context) — 원본 직접 조회
```

위 확인 없이 새 토큰 이름이나 값을 생성하는 것은 금지한다.

## 큰 변경 시 사전 알림 양식

구조적 변경(새 카테고리 추가, 기존 토큰 삭제 등)에 한해:

```
📋 변경 계획

🔍 현재 상태:
🎯 목표:
📁 변경 대상:
🧩 토큰 영향 범위:
🌗 다크모드 영향 범위:
⚠️ 삭제/비호환 여부:
```

---

# 🧪 검증 기준

1. 토큰 구조 일관성 유지
2. Semantic 역할 명확성
3. Component Token → Semantic 참조 여부 (Foundation 직접 참조 금지)
4. 상태값 누락 여부
5. Dark Mode 확장 가능성
6. Core / Domain / Legacy 구분
7. 신규에서 Legacy 사용 유도 금지
8. kebab-case 네이밍 준수
9. CSS 클래스 약어 금지 (전체 단어 사용 원칙)

---

# 🏷️ CSS 클래스 네이밍 원칙

가이드 HTML 내 CSS 클래스는 약어 없이 의미 중심으로 작성한다.

## 허용 접두사

| 접두사 | 의미 | 사용 범위 |
|---|---|---|
| `typo-` | Typography | foundation.html 타이포 섹션 |
| `token-` | Token | semantic.html 토큰 테이블 |
| `border-width-` | Border Width | foundation.html 테두리 두께 섹션 |
| `color-` | Color | 색상 팔레트 |
| `spacing-` | Spacing | 간격 섹션 |
| `radius-` | Radius | 모서리 반경 섹션 |
| `palette-` / `pal-` | Palette | 색상 팔레트 그룹 |
| `platform-` | Platform | components.html PC/Mobile 구분 |

## 금지 약어

| 금지 | 대체 | 이유 |
|---|---|---|
| `tok-` | `token-` | `token-`과 혼재 금지 |
| `type-` | `typo-` | HTML `type` 속성과 혼동 |
| `bw-` | `border-width-` | 의미 불명확 |
| `fw-` | `weight-` | font-weight 약자 불명확 |
| `cat-` | `category-` | 의미 불명확 |
| `cnt-` | `count-` | 의미 불명확 |

---

# ⛔ 금지사항

> 기계가 검사하는 열거 규칙의 **정본은 `registry/governance/audit-rules.json`(R01~R11)** 이다. 아래는 사람용 요약이며, 충돌 시 audit-rules.json이 우선한다.

* HEX 직접 사용 금지 (예외: `color-overlay`만 rgba 허용 = EX03. ~~border rgba 예외(EX02)~~ 폐지 — ND-2(2026-05-18) 및 EX02/EX06·R12/R13 제거 2026-06-06)
* Foundation 직접 참조 남용 금지
* 의미 없는 이름 금지
* Legacy를 신규 기준처럼 사용 금지
* 서비스 UI를 강제 통합 금지
* 다크모드 고려 없는 토큰 확정 금지
* Danger 버튼 variant 재추가 금지 (삭제 확정)

---

# 🚫 Figma 원본 기준 준수 (임의 생성/값 변경 방지)

## 핵심 원칙

**Figma DS 2.4(SW UX GUIDE V2.4)는 "정답지"가 아니라 "유일한 참고 출발점"이다.** (모든 검증 규칙의 상위 원리)

- DS 2.4는 레거시이며 개선이 필요한 자료다. 무엇을 개선할지 보기 위한 참고용이지, 그대로 베껴야 할 정본이 아니다.
- 따라서 **"코드가 Figma와 다르면 코드 오류"라고 자동 판정하는 것을 금지한다.**

### 두 갈래 분류 (불일치 처리의 상위 원칙)

코드와 Figma가 다를 때는 반드시 분류한다:

- **(a) 코드 실수** (색 오연결·variant 누락 등) → **코드를 고친다.**
- **(b) 사전 등록된 개선** (Figma 레거시의 누락/구식을 코드가 개선) → **코드를 유지하고 "Figma 개선 필요 목록"에 적재.**
- **(c) 애매** → (b)로 빼지 말고 **사용자에게 확인한다.** 검사기가 임의 판정하지 않는다. **애매한 것을 (b)로 처리하면 버그 면죄부가 되므로 금지.**
- 이미 합의된 개선(예: **hover** — 레거시에 자주 누락)은 **(b)로 사전 등록**한다.

### 두 갈래 분류의 적용 범위 (정확 대조와 구분)

두 갈래 분류는 **레거시가 잘못 정의했을 수 있는 값(색·크기·두께·타이포 등)** 에만 적용한다.
**원본을 그대로 가져와야 하는 것(variant 구성·아이콘 원본·토큰 참조 구조)** 은 두 갈래에서 제외하고 **항상 엄격하게 ❌ 처리한다(개선 핑계 금지).**
새로운 속성이 나오면 **"레거시가 틀렸을 수 있는 값인가, 원본을 베껴야 하는 것인가"** 로 갈래를 판단한다.

| 갈래 | 대상(예) | 처리 |
|------|---------|------|
| **두갈래 분류** ((a)/(b)/(c)) | 색상값·크기·두께·타이포 등 — 레거시가 틀렸을 수 있는 값 | 불일치 시 (a)코드실수→수정 / (b)사전등록 개선→유지+목록 / (c)애매→확인 |
| **정확 대조** (두갈래 제외, 항상 엄격) | variant 구성·아이콘 원본·토큰 참조 구조 — 원본을 베껴야 하는 것 | 불일치 시 무조건 ❌ ((b)/(c) 적용 금지) |

이 원리를 `token-validator`·`component-verifier`·`figma-inspector` 등 **검증 규칙 전반**에 적용한다. "Figma 불일치 = FAIL"로 단정하지 않는다.

> 단, 아래 "임의 생성/값 변경 방지"는 그대로 유지한다. 두 갈래 분류는 *이미 발견된 차이*를 다루는 것이지, 추측으로 새 값을 만들 허가가 아니다.

Claude는 토큰 이름·값·구조를 임의로 생성하거나 추측하지 않는다.
"일반적인 관례"나 "더 나은 값"을 이유로 **원본 값을 무단으로 잘못 읽거나 반올림·변환하는 것**은 금지한다.

---

## 원본 값 절대 보존

- 색상 HEX 값: 원본 그대로 사용 (반올림·변환 금지)
- 수치 값(폰트 크기·간격·반경): 원본 숫자 그대로 사용
- Semantic 참조 구조: Figma 원본 연결 구조 그대로 유지
- "더 나은 값"·"표준 값"을 이유로 무단 수정 금지

---

## 토큰 생성 조건 (엄격 적용)

다음 두 조건을 모두 만족할 때만 새 토큰을 생성한다:

1. Figma 원본에서 해당 토큰 존재 확인됨
2. 아직 추출·정의되지 않은 상태임

조건 미충족 시 토큰을 생성하지 않고 사용자에게 확인을 요청한다.

---

## Figma 원본 네이밍 → CSS 변수 변환 규칙

| Figma 원본 경로 | CSS 변수명 |
|---|---|
| `color/button/primary/bg--default` | `--button-primary-default-bg` |
| `color/text/primary` | `--color-text-primary` |

변환 규칙: `/` → `-` · 공백 제거 · 대문자 → 소문자 · `--` 접두사 추가

---

# 🔍 토큰 수정 제안 워크플로우 (Review → 승인 → 반영)

## 원칙

토큰 유지보수 중 문제 발견 또는 개선이 필요한 경우:
- `pages/md-review.html` — 수정 제안·결정 대기 항목으로 등록
- 사용자 검토 및 승인 후에만 최종 토큰 파일에 반영

## 리뷰 대상 (이런 경우 반드시 제안으로 처리)

| 유형 | 예시 |
|---|---|
| 오타·네이밍 오류 | `placehoder` → `placeholder` |
| Semantic 참조 불일치 | Foundation을 직접 참조하고 있는 Component Token |
| 상태값 누락 | hover는 있으나 focus·disabled 없음 |
| 구조 개선 | 중복 정의된 토큰 통합 제안 |
| 다크모드 대응 누락 | 라이트 값만 있고 다크 값 미정의 |

---

# 📦 산출물 현황

```
tokens/
  semantic.md                    ✅ Light/Dark 전체 정의 완료
  component-tokens-extracted.md  ✅ 9개 그룹 완료 (Danger 제거됨)
  foundation.md                  ✅ 완료 (Dark 스텝 방향 규칙 포함)
  token-map.json                 ⬜ 미작성

pages/
  foundation.html    ✅ Dark Palette 포함
  semantic.html      ✅ Light/Dark 테마 전환
  components.html    ✅ PC/Mobile 플랫폼 전환 포함
  guide-md.html      ✅ MD 원본 코드스니펫 뷰어
  md-review.html     ✅ 리뷰·결정·체크리스트
  policy.html        🚧 작성 중
  patterns.html      ⬜ 미작성
  legacy.html        ⬜ 미작성
```

---

# 📌 핵심 원칙

디자인 시스템의 목표는 UI 통일이 아니다.

목표는:

1. 공통 기준 통일
2. 서비스별 확장 허용
3. 반복 구조 패턴화
4. 레거시 분리 및 점진적 전환
5. 토큰 중심 구조 유지

---

# 🧠 한 줄 정리

👉 디자인 시스템은 "컴포넌트"가 아니라
👉 **토큰 + 구조 + 규칙의 시스템이다**

---

# 🗂️ MVP0 Registry 운영 기준 (추가: 2026-05-11)

## Registry 위치와 역할

```
registry/index.json           ← 모든 Registry 파일의 진입점
registry/tokens/              ← 토큰 기준 데이터 (JSON)
registry/components/          ← Core Component 사양 (JSON)
registry/figma/               ← Figma 노드 매핑
registry/governance/          ← 버전·검증규칙·deprecated·마이그레이션
registry/ai/                  ← AI 스니펫·리뷰 프롬프트
reports/                      ← 검수 결과물 (MD)
```

## Claude가 registry를 사용하는 방법

- 토큰 이름·값을 확인할 때: `registry/tokens/*.json` 우선 참조
- 컴포넌트 사양을 확인할 때: `registry/components/*.json` 참조
- 새 토큰 생성 전: `registry/governance/audit-rules.json` 검증 규칙 확인
- Deprecated 항목: `registry/governance/deprecated.json` 확인 후 재추가 금지

## 상태값 (status / darkStatus)

| 값 | 의미 |
|----|------|
| `stable` | 확정 완료, 그대로 사용 |
| `candidate` | 미확정 — md-review.html 등록 후 사용자 승인 필요 |
| `planned` | 작성 예정 |
| `deprecated` | 삭제 확정, 사용 금지 |

## 기존 MD 파일과의 관계

`tokens/*.md` 파일은 인간 가독 문서로 유지된다.
**기준 데이터는 registry JSON이며, MD는 설명 문서다.**
충돌 시 registry JSON이 우선한다.

---

# 🖥️ MVP2 Portal Registry Rendering 규칙 (추가: 2026-05-11)

포털 페이지 편집 시 반드시 준수한다.

1. **registry 우선** — 하드코딩 토큰 테이블보다 registry 기반 렌더링을 우선한다.
2. **index 먼저** — `registry/index.json`을 먼저 읽고, 그 안의 경로로 각 JSON을 로드한다.
3. **HTML에 값 중복 금지** — token 값을 HTML에 다시 하드코딩하지 않는다.
4. **legacy 보존** — 교체가 검증될 때까지 기존 하드코딩 콘텐츠를 삭제하지 않는다.
5. **Vanilla JS** — 명시적 승인 없이 외부 프레임워크를 도입하지 않는다.
6. **에러 표시** — registry JSON 로드 실패 시 화면에 명확한 오류 메시지를 표시한다.
7. **호환성 유지** — Portal 렌더링은 향후 Figma Plugin, Source Guard 워크플로우와 호환 가능하게 유지한다.

## 신규 JS 모듈 역할

| 파일 | 역할 |
|------|------|
| `assets/js/registry-loader.js` | `loadJson`, `loadRegistryIndex`, `loadRegistryResource`, `loadAllComponents`, `renderError` 제공 |
| `assets/js/token-renderer.js` | `renderFoundationColors`, `renderSemanticColors`, `renderComponentTokens` 제공 |
| `assets/js/component-renderer.js` | `renderComponentList`, `renderComponentDetail`, `renderComponentStatusBadge` 제공 |
| `assets/js/registry-health.js` | `renderRegistryHealth` 제공 |

## fetch 경로 규칙

- pages/*.html에서 registry 로드: `REGISTRY_BASE = '../'` (자동 감지)
- index.html(root)에서: `REGISTRY_BASE = './'` (자동 감지)
- 경로 예: `../registry/tokens/foundation.colors.json`

---

# 🔲 MVP3 / MVP3.1 Core Component Harness 규칙 (추가: 2026-05-11)

## Core Component Harness 편집 시

1. `registry/components/index.json`을 먼저 읽는다.
2. registry 데이터가 있으면 component tab 목록을 하드코딩하지 않는다.
3. Theme과 Platform 컨트롤은 registry harness config와 일관되게 유지한다.
4. Button이 첫 번째 상세 구현 대상이다.
5. Button 외 컴포넌트는 해당 MVP 구현 단계 전까지 skeleton으로 유지한다.
6. 없는 component token을 임의로 생성하지 않는다.
7. Figma componentSetKey를 모르면 빈 문자열로 둔다.
8. Harness 변경 사항은 `reports/mvp3-core-harness-review.md`에 기록한다.

## Button 편집 시

1. `registry/tokens/component.tokens.json`을 먼저 읽는다.
2. 공식 Button component token만 사용한다.
3. raw HEX를 사용하지 않는다.
4. Foundation color primitive를 직접 참조하지 않는다.
5. 없는 Button token을 임의로 생성하지 않는다.
6. 공식 component token이 없는 variant는 pending으로 표시한다.
7. Light/Dark 지원은 semantic token remapping으로 유지한다.
8. Button 변경 후 button-harness를 업데이트한다.
9. 검토 결과는 `reports/mvp3-button-review.md`에 기록한다.

## Dark Border Token 편집 시

1. opacity-composed dark border 값을 stable로 표시하지 않는다.
2. foundation dark scale 참조 또는 resolved HEX 값을 사용한다.
3. Figma opacity composition은 source metadata로만 보존한다.
4. resolved 값이 승인되기 전까지 candidate 상태를 유지한다.
5. Product UI 컴포넌트에서 raw rgba border 값을 직접 사용하지 않는다.
6. unresolved opacity 기반 border 값은 report에 기록한다.

---

# 🛡️ MVP3.5 Source Guard Rules (추가: 2026-05-12)

## Source Guard 편집 시

1. **디자인시스템 폴더 자체를 검사 대상으로 보지 않는다.** Source Guard는 `--target`으로 전달된 외부 서비스 프로젝트를 검사한다.
2. **registry가 기준 원장이다.** Guard rules와 allowed token 목록은 항상 registry JSON에서 로드한다.
3. **실행 방법:**
   ```bash
   npm run guard -- --target ../service-project
   ```
4. **MVP3.5에서는 자동 수정하지 않는다.** 리포트 생성 후 Human 확인이 선행되어야 서비스 파일을 수정할 수 있다.
5. **리포트 위치:** `reports/source-guard-[target-name].md`
6. **exit code 기준:** error 발견 시 1, warning만이면 0, 이상 없으면 0.

## Guard 검사 항목

| 검사 | 심각도 | 규칙 |
|------|--------|------|
| Raw HEX (#color) | error | R02 |
| rgb() | error | R02 |
| rgba() | warning | EX02/EX03 예외 확인 필요 |
| Foundation color 직접 참조 | warning | R01 |
| Undefined CSS variable | error | — |
| Ghost/Danger button variant | error | R05 |
| Outline/Line button variant | warning | 혼동 가능성 |
| Inline style color | error | — |

## MVP3.8 Source Guard CI Rules

When editing Source Guard CI workflow:

1. **CI에서는 `--apply`를 사용하지 않는다.** CI는 항상 dry-run / report mode만 실행한다.
2. **`--dry-run`은 CI에서 허용된다.** 파일을 수정하지 않기 때문이다.
3. **reports는 artifact로 업로드해야 한다.** `retention-days: 30`.
4. **디자인시스템 repository가 source of truth다.** target은 `--target` 옵션으로 전달한다.
5. **외부 서비스 프로젝트가 CI 환경에 없을 경우** `scripts/guard/__fixtures__/bad-service`를 기본 target으로 사용한다.
6. **CI에서 자동으로 commit/push하지 않는다.** 리포트 생성만 수행한다.
7. **guard step이 실패(error)해도 suggest와 dry-run은 실행된다.** `if: always()` + `continue-on-error: true`로 처리한다.
8. **최종 job 실패 여부는 guard exit code를 따른다.** error가 있으면 CI 실패.

## MVP3.7 Source Guard Apply Mode Rules

When applying Source Guard fixes:

1. **외부 서비스 파일은 `--apply` 옵션이 있을 때만 수정한다.** 없으면 절대 파일을 수정하지 않는다.
2. **`--dry-run`을 먼저 실행해서 적용 예정 내용을 확인한다.**
3. **High-confidence 항목만 자동 적용한다.** Medium 이하는 needs-review로 분류한다.
4. **아래 항목은 절대 자동 적용하지 않는다:**
   - ghost / danger button variant
   - rgba() 값
   - 다의적 색상 (#FFFFFF 등 여러 semantic token이 공유하는 색상)
   - foundation color → semantic 교체 중 후보가 여러 개인 경우
   - inline style → class 구조 변경
   - 새 token 생성
5. **`--apply` 실행 시 수정 전 반드시 backup을 생성한다.** (`reports/apply-backups/`)
6. **apply log는 항상 생성한다.** (`reports/source-guard-apply-log-[target].md`)
7. **파일 치환 안전성:** before 내용이 파일에 정확히 1번 존재할 때만 적용한다. 0번이거나 2번 이상이면 skip.

## MVP3.6 Source Guard Fix Suggestion Rules

When generating Source Guard fix suggestions:

1. **디자인시스템 폴더가 source of truth다.** 외부 서비스 프로젝트는 `--target`으로 전달된다.
2. **MVP3.6에서는 외부 서비스 파일을 직접 수정하지 않는다.** 리포트와 patch 후보만 생성한다.
3. **High confidence 항목만 patch candidate에 포함한다.** 모호한 항목은 Needs Review로 분류한다.
4. **rgba는 자동 치환하지 않는다.** token-exceptions EX02/EX03 해당 여부를 Human이 확인해야 한다.
5. **ghost → secondary/blue-line 교체는 Human decision 필수다.** 자동 수정 금지.
6. **HEX 역매핑 엔진:** foundation.colors.json HEX → semantic.colors.json light value 경로로 역추적한다.
7. **Confidence 기준:**
   - `high`: semantic token 1개 exact match
   - `medium`: foundation token exact match (semantic 없음)
   - `needs-review`: 여러 semantic token이 동일 HEX를 공유
   - `needs-human`: rgba, ghost/danger variant, 구조 변경 필요
   - `unmapped`: 어떤 token도 매핑되지 않음

## Guard 추가 확장 시

- `scripts/guard/check-*.js` 패턴으로 새 검사기를 추가한다.
- 새 검사기는 `index.js`에서 import 후 `allFindings.push(...)` 형태로 연결한다.
- registry에 새 token 카테고리 추가 시 `load-registry.js`의 `knownTokens` 수집 로직을 업데이트한다.

## Input 편집 시 (HD 확정 2026-05-12)

Input 컴포넌트를 편집하거나 토큰을 정의할 때:

1. **Figma Base Input 프레임명은 `Login input`으로 잘못 등록되어 있다.** 이는 Figma 원본의 오류. 디자인시스템 canonical 명칭은 `Input`으로 확정 (2026-05-20). nodeId 6443:4408은 동일하게 유지.
2. **Figma 상태 이름 ≠ registry 상태 이름.** `selected` = `focus`, `success` = `correct`.
3. **토큰 2레이어 구조:** Semantic = `--color-form-control-*`, Component alias = `--input-*` (→ form-control 참조).
4. **`complete` 상태는 별도 bg/border 토큰 없다.** default와 동일한 시각. text 차이로만 구분.
5. **`hover` 상태 토큰 없다.** Figma 미정의, registry에서 삭제됨.
6. **`--select-disabled-border`는 Input에 없다.** Select 컴포넌트로 이동.
7. **Picker (timepicker/datepicker)는 별도 컴포넌트로 취급.** error/correct 상태 없음. MVP5 이후 구현.
8. **Inputbox_large = Textarea 컴포넌트.** Input의 variant가 아님.
9. **Label 색상 = `--color-form-control-text-label` → `var(--color-text-primary)`.**
10. **`--input-error-bg` 없다.** error bg = default bg와 동일 (white), 별도 토큰 불필요.
11. **확정 토큰 목록은 `registry/components/input.json` 참조.**

## Input Related Composed Fields Rules (MVP4.1 — 2026-05-12 확정)

Input 컴포넌트를 편집하거나 구성 필드를 추가할 때:

1. **Search Input, Password Field, Input with Unit은 Components > Input 하단에 위치한다.** 별도 Pattern 페이지로 분리하지 않는다.
2. **Basic Input 설명 최하단 `Related Composed Fields` 섹션에 배치한다.** Base Input의 state/variant 매트릭스에 추가하지 않는다.
3. **이 항목들은 Base Input 공식 상태(state)가 아니다.** `is-search`, `is-password` 등 modifier class로 처리하지 않는다.
4. **드롭다운·리스트·폼·결과 패널을 포함하는 더 큰 흐름은 Pattern/Module로 분리한다.** Search Input + Dropdown + Result List = Search Module Pattern.
5. **DatePicker, TimePicker, Textarea는 별도 Component 후보로 유지한다.** Input 섹션에 혼재하지 않는다.
6. **registry/components/input.json의 `relatedComposedFields` 배열이 기준 원장이다.**

## Input Composed Field Slot Rules (MVP4.2 — 2026-05-12 확정)

Related Composed Fields의 slot 구조를 편집할 때:

1. **Search Input은 prefixIcon 구조가 아니다.** 검색 아이콘은 `suffixActionGroup` 안에 위치한다.
2. **Search Input suffixActionGroup 순서:** `clearAction` (조건부, 왼쪽) → `searchAction` (항상, 오른쪽). clearAction은 값이 있을 때만 나타나며, searchAction의 왼쪽에 위치한다.
3. **Password Field suffixActionGroup 순서:** `visibilityToggle` (항상, 왼쪽) → `clearAction` (조건부, 오른쪽). clearAction은 값이 있을 때만 나타난다.
4. **Input with Unit은 `suffixText: unitLabel` 구조다.** 버튼이 아닌 텍스트 레이블이며 `flex-shrink: 0`.
5. **suffixActionGroup은 flex row 컨테이너다.** gap: 2px. `.s1-suffix-action-group` CSS 클래스 사용.
6. **카드 프리뷰는 단일 interactive 상태로 제공한다.** 정적 2-state(Empty/Filled, Hidden/Visible) 대신 실제 입력 가능한 interactive preview 1개를 사용한다. MVP4.2 Revision에서 전환됨.
7. **registry `slotStructure` 필드가 slot 정의의 기준 원장이다.** 기존 `slots: []` 배열 형식은 MVP4.2에서 `slotStructure` 객체로 교체됨.
8. **Related Composed Fields preview는 실제 interactive다.** 정적 is-preview가 아니라 입력 가능한 실제 input 요소를 사용한다. pointer-events:none / is-preview 클래스 사용 금지.
9. **인터랙션 JS는 `setupRelatedComposedFields()` 함수로 초기화한다.** DOMContentLoaded 직후 또는 script 말미에 `setupRelatedComposedFields(document)` 호출. `setupSearchInputField(root)` + `setupPasswordFieldInput(root)` 두 함수로 구성.
10. **Search Input / Password Field clear 버튼은 `hidden` attribute로 제어한다.** CSS `display:none`이 아닌 HTML `hidden`으로 가시성 관리. `[data-clear-action]` 셀렉터 사용.
11. **Password Field visibility toggle은 `aria-pressed` attribute를 업데이트한다.** 상태 전환 시 aria-label도 함께 변경 ("비밀번호 보기" / "비밀번호 숨기기"). `[data-icon-hidden]` / `[data-icon-visible]` data attribute로 아이콘 전환.
12. **Figma 아이콘 노드명 확인 완료 (2026-05-12).** `ic_찾기/조회` (검색, 6452:5930), `ic_비밀번호미표시` (비밀번호 숨김, 135:6692), `remove` (삭제, 882:4061). eye-off(visible) 아이콘 노드명 미확인 — candidate SVG 사용 중.
13. **`data-related-field` attribute가 각 composed field 컨테이너의 식별자다.** `data-related-field="search-input"` / `"password-field"` / `"input-with-unit"`. JS는 이 attribute로 스코프를 한정한다.

## MVP4.3-A DatePicker Rules (2026-05-12)

DatePicker를 편집하거나 토큰을 정의할 때:

1. **DatePicker는 Base Input의 state/variant가 아니다.** 별도 컴포넌트 후보로 분리한다.
2. **DatePicker는 Related Composed Field로 축소하지 않는다.** calendar panel + day grid가 있어서 별도 컴포넌트다.
3. **Trigger는 Base Input (s1-input-wrap + s1-input-field)을 재사용한다.** 별도 shell을 만들지 않는다.
4. **calendar icon은 suffixIcon (s1-input-action-btn)으로 배치한다.**
5. **panel token은 candidate 상태다.** --date-picker-panel-bg 등 신규 토큰은 임의 확정하지 않는다.
6. **Figma componentSetKey를 임의로 생성하지 않는다.** 빈 문자열로 유지하며 Figma 직접 확인 후 등록한다.
7. **Figma node 6443:4655는 MCP get_design_context 접근 불가 상태다.** invalid node 오류 발생. Figma URL 또는 Plugin 직접 접근으로 재확인 필요.
8. **인터랙션 JS는 `setupDatePicker()` 함수로 초기화한다.** components.html script 말미에 `setupDatePicker(document)` 호출.
9. **panel shadow에 한해 rgba 1회 허용한다.** `box-shadow: 0 4px 16px rgba(0,0,0,0.10)`. 이 외 HEX/rgba 직접 사용 금지.
10. **미결 사항은 reports/mvp4-3-a-date-picker.md에 기록한다.**

## MVP-T1 Token Mapping Rules (2026-05-18)

Token Mapping 파일을 편집하거나 Figma Variable을 참조할 때:

1. **Code registry remains the source of truth.** Figma Variable names and CSS token names do not need to be identical.
2. **Always map tokens by meaning, not by name alone.** Slash-separated Figma paths convert to hyphen-separated CSS vars.
3. **Keep form-control semantic tokens as common standards.** `--color-form-control-*` is the shared semantic layer for Input, Select, DatePicker, and TimePicker.
4. **Component tokens such as `--input-*` are aliases when they reference shared form-control semantics.** Direct-reference only if the component diverges from shared form-control.
5. **Map Figma `complete` to registry/code `filled`.** No separate bg or border token needed — only text changes.
6. **Map Figma `selected` (form-control context) to code `focus`.** `selected` means focused/active state, not chosen item.
7. **Use `correct` as the canonical state name (HD-4).** Figma calls it 'success' — that is a Figma alias only. `--input-correct-border` / `--input-correct-text` are canonical tokens, not deprecated. Do not rename to 'success'.
8. **Do not invent confirmed Figma Variable names without MCP evidence.** Mark uncertain mappings as `pending` or `needs-review`.
9. **Placeholder = gray/500 (#757575) 확정 (2026-05-18).** `--color-text-placeholder` = `var(--color-gray-500)`. Figma 일치. `--color-form-control-text-default` = `var(--color-text-secondary)` (#353535) 확정. tokens.css·semantic.md·input.json 수정 완료.
10. **Record mapping decisions in `reports/mvp-t1-token-mapping.md`.**
11. **Figma Variables confirmed via MCP nodes:** form-control (540:3794), button-primary (540:4501), date-picker-mobile (540:3836). Other Variables are pending.
12. **Token mapping file locations:**
    - `registry/tokens/figma-css-token-map.json` — main mapping table
    - `registry/tokens/token-aliases.json` — state and token alias definitions
    - `registry/tokens/deprecated-tokens.json` — removed/renamed tokens

## MVP-T2 Token Sync Plugin Rules (2026-05-18)

Figma Token Sync Plugin 파일을 편집하거나 플러그인 동작을 수정할 때:

1. **플러그인 진입점은 `plugins/figma-token-sync/src/code.ts`다.** Figma sandbox에서 실행. `figma.showUI(__html__)` + `figma.ui.onmessage` 패턴 사용.
2. **UI는 `src/ui.html`이다.** `parent.postMessage({ pluginMessage: {...} }, "*")`로 code.ts와 통신한다.
3. **레지스트리 JSON은 esbuild 번들 시점에 인라인된다.** 런타임에 파일 접근 없음. `require("../../../../registry/tokens/figma-css-token-map.json")` 상대경로 사용.
4. **`tsc --noEmit`는 타입 체크 전용이다.** 실제 빌드는 `esbuild`로 한다. `npm run plugin:check`(타입체크)와 `npm run plugin:build`(빌드)를 분리한다.
5. **SyncClassification 기준을 엄수한다:** stable + cssVariable + registryToken + figmaVariable 모두 있음 → `sync-ready`, pending + 비-alias → `preview-only`, needs-review → `needs-review`, component-alias 또는 deprecated → `excluded`.
6. **sync-ready 분류는 collection ID 존재 여부와 무관하다.** 분류는 token ref 완전성 기준. collection ID gate는 `syncStableTokens()`에서 별도로 처리한다.
7. **`syncStableTokens()`는 항상 throw한다.** Figma Variables collection ID 미확정 상태에서 실수로 쓰기가 실행되는 것을 방지한다.
8. **component-alias 항목은 excluded로 처리한다.** 같은 figmaVariable을 semantic 항목이 이미 대표하기 때문에 중복 쓰기를 방지한다.
9. **`manifest.json`의 `permissions`는 현재 빈 배열이다.** 실제 Figma Variables 쓰기를 활성화하려면 `"variables:write"`를 추가해야 한다. 이는 Human Decision 후에만 변경한다.
10. **플러그인 빌드 결과물은 `plugins/figma-token-sync/dist/code.js`다.** 이 파일은 gitignore 대상이다.
11. **동기화 활성화 조건 3가지 모두 충족 후에만 쓰기를 활성화한다:** (1) FIGMA_SEMANTIC_COLLECTION_ID 확정, (2) manifest permissions에 variables:write 추가, (3) Dry-run 미리보기 결과 사람이 검토·승인.
12. **플러그인 작업 결과는 `reports/mvp-t2-token-sync.md`에 기록한다.**

## MVP-T2 REST API Metadata Collector Rules (2026-05-18)

`scripts/figma/fetch-figma-variables.mjs` 및 `scripts/figma/match-figma-variable-metadata.mjs`를 편집하거나 실행할 때:

1. **PAT(`FIGMA_TOKEN`)는 환경변수로만 전달한다.** 코드·출력 JSON·리포트 어디에도 저장하지 않는다. `.env` 파일은 `.gitignore` 대상.
2. **fetch script는 Read-only다.** Figma Variables 쓰기 API를 호출하지 않는다. 출력은 `figma-variable-metadata.local.json` 하나뿐.
3. **`figma-variable-metadata.local.json`은 gitignore 대상이다.** PAT 정보가 간접 포함될 수 있으므로 커밋하지 않는다. `.gitignore`에 등록됨.
4. **fetch endpoint는 `GET /v1/files/{fileKey}/variables/local`만 사용한다.** write endpoint(`POST /v1/files/{fileKey}/variables`) 호출 금지.
5. **match script는 `figma-css-token-map.json`을 직접 수정하지 않는다.** 출력은 리포트 MD와 patch 후보 JSON뿐. 레지스트리 자동 반영 금지.
6. **`figma-variable-metadata.patch.json`은 사람이 검토 후 registry에 반영한다.** 자동 적용 금지. 파일 헤더에 "자동 적용 금지" 명시됨.
7. **matchStatus `dedup-required` 항목은 write 시 1회만 실행한다.** 여러 registry 항목이 같은 variableId를 공유하는 경우 중복 쓰기를 방지한다.
8. **`not-found` 항목은 Figma Variables 패널에서 이름을 직접 확인해야 한다.** 임의로 이름을 추측하거나 수정하지 않는다.
9. **실행 명령: `npm run figma:fetch` → `npm run figma:match`.** 순서를 지킨다. match는 local.json이 있어야 실행 가능. REST API가 막혀 있으면 Plugin Export 방식 사용.
10. **`figma-variable-metadata.sample.json`은 API 응답 구조 샘플이다.** 실제 데이터가 아님. 구조 파악 용도로만 사용. PAT 없음.
11. **match script는 `meta.source`가 `"figma-plugin-api"`와 `"figma-rest-api"` 모두 처리한다.** `meta.fileKey`(REST) 또는 `meta.fileName`(Plugin) 중 존재하는 값을 `figmaFileRef`로 사용.

## MVP-T2 Plugin Read Metadata Export Rules (2026-05-18)

Figma Plugin의 Export Variables 기능을 편집하거나 실행할 때:

1. **플러그인 manifest에 `"variables:read"`만 추가한다.** `"variables:write"`는 추가하지 않는다.
2. **`figma.variables.getLocalVariablesAsync()`와 `figma.variables.getLocalVariableCollectionsAsync()`만 사용한다.** write 계열 API(`figma.variables.setVariableValue`, `figma.variables.createVariable` 등) 호출 금지.
3. **Export 결과는 `meta.source: "figma-plugin-api"`, `meta.writeEnabled: false`로 마킹된다.** 이 필드는 변경하지 않는다.
4. **Export 결과 JSON은 `registry/figma/figma-variable-metadata.local.json`에 저장한다.** 파일이 gitignore 대상이므로 커밋하지 않는다.
5. **Download 파일명은 `figma-variable-metadata.local.json`으로 고정한다.** 사용자가 올바른 경로에 저장할 수 있게 안내한다.
6. **export 결과의 구조는 REST API fetch 결과와 동일하다.** `collections` 배열, `variables` 배열, `meta` 객체. match script는 둘 다 처리한다.
7. **Plugin export는 현재 열린 Figma 파일의 Local Variables만 읽는다.** Remote Variables는 읽지 않는다.
8. **export-variables 메시지 처리는 async다.** `figma.ui.onmessage` 내부에서 즉시 return하고 async IIFE로 처리한다.
9. **Export 후 match 실행 순서:** Plugin Export → Download JSON → 저장 → `npm run figma:match`.
10. **REST API Collector는 유지한다.** Figma Variables REST 권한이 향후 확보되면 REST API 방식으로 자동화할 수 있다. 현재는 Plugin Read 방식이 우선.

## MVP-L1 Legacy UX Guide 2.4 Token Audit Rules (2026-05-18)

`scripts/figma/match-figma-variable-metadata.mjs --profile ux-guide-2.4`를 실행하거나, Legacy Token Audit 관련 파일을 편집할 때:

1. **Code Registry가 canonical source of truth다.** UX Guide 2.4 Figma Variables는 레거시 소스 스냅샷일 뿐, 규범적 기준이 아니다. UX Guide 2.4 Variable 이름이 달라도 CSS 토큰을 바꾸지 않는다.
2. **UX Guide 2.4 스냅샷은 `registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json`에 저장한다.** `figma-variable-metadata.local.json` (gitignore)과 구분한다.
3. **darkmode-test 결과는 `snapshots/figma-variable-metadata.darkmode-test.json`에 격리한다.** production registry에 섞지 않는다. "S1VaaS — Screen Designs" 파일 출처 스냅샷임.
4. **`--profile ux-guide-2.4` 모드는 레거시 매핑 분석만 한다.** Figma Variables를 canonical token으로 교체하거나 registry를 자동 수정하지 않는다.
5. **Legacy audit 출력물은 사람이 검토 후 registry에 반영한다.** `registry/tokens/legacy-token-map.json`은 초안이며 자동 적용 금지.
6. **legacy-token-map.json은 UX Guide 2.4 Variable → canonical CSS token의 의미 기반 매핑이다.** 이름 기반 자동 매칭이 아니라 의미·역할·값을 비교한 후 사람이 확정한 매핑만 `status: "confirmed"`로 표시한다.
7. **`suggestCanonical()` 함수는 제안일 뿐이다.** 자동으로 registry에 적용하지 않는다. 제안 confidence가 high여도 사람 검토 없이 확정하지 않는다.
8. **프로파일 종류:** `token-sync`(기본, T2 sync match) / `ux-guide-2.4`(legacy audit) / `darkmode-test`(실험 참조). 프로파일에 따라 소스 파일과 출력 파일이 달라진다.
9. **스냅샷 파일은 git에 커밋한다.** local.json(gitignore)과 달리 snapshots/ 내 파일은 변경 이력을 보존한다. PAT·민감 정보가 포함되지 않음을 확인 후 커밋.
10. **UX Guide 2.4 export 절차:** Figma에서 실제 `S1 UX 디자인가이드 2.4` 파일 열기 → SW Token Sync 플러그인 → Export Variables → Download JSON → `registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json`으로 저장 → `npm run figma:audit` 실행.
11. **mvp-l1-legacy-token-audit.md는 `reports/`에 생성된다.** 그룹별 분류, canonical 추천, no-candidate 항목, 미결 사항을 포함한다.
12. **MVP-L2는 legacy-to-canonical 마이그레이션 맵을 완성하는 단계다.** MVP-L1 결과를 바탕으로 `reports/mvp-l2-legacy-to-canonical-token-map.md`를 작성한다. MVP-L1이 완료되기 전까지 MVP-L2를 시작하지 않는다.

---

# 🪜 Figma → 코드 5단계 워크플로우 (2026-06-05 확정)

Figma 원본 컴포넌트를 **누락·추측 없이** 코드로 옮기기 위한 단계형 워크플로우다.
**진입:** `figma-to-code` 스킬 (`.claude/skills/figma-to-code/SKILL.md`). "Figma {URL/nodeId}의 {컴포넌트} 구현/변환해줘" 요청 시 발동.

## 5단계 + 검문소

각 단계는 **검문소(STOP)** 를 가지며, 통과 전엔 다음 단계로 못 넘어간다.

| 단계 | 담당 에이전트 | 산출물 | 🚦 검문소 |
|------|-------------|--------|----------|
| 1 재고조사 | figma-inspector (추출 모드) | `1-inventory.md` | 총 variant 개수 명시 후 **사용자 확인** |
| 2 수치추출 | figma-inspector + token-validator | `2-extraction.md` | 빈칸(`MCP 미제공`) 있으면 **3단계 금지** |
| 3 구현 | guide-builder | components.html + registry JSON | — |
| 4 자가대조 | **component-verifier** (검증 전용) | `4-verification.md` | **❌ 0** 될 때까지 3단계 반복 |
| 5 다크모드 | guide-builder + component-verifier | `5-darkmode.md` | 1차안 후 **개선안 먼저 제안** |

산출물 위치: `reports/figma-to-code/{component}/`

## 핵심 — 만드는 자 ≠ 검증하는 자

- **구현**은 `guide-builder`, **4단계 대조**는 별도 `component-verifier`가 한다.
- 자기 작업을 자기가 검사해 관대해지는 것을 막기 위함. **구현자는 4단계 대조를 직접 하지 않는다.**
- `component-verifier`는 1·2단계 표를 기준으로 결과물을 항목별 대조하고 ❌ 목록만 반환한다(직접 수정 금지).

## 절대 규칙 (모든 단계)

> 1·3은 **공통 규칙**(정본: §🤖 공통 규칙 허브). 2·4는 **figma-to-code 전용**(정본: `figma-to-code/SKILL.md`). 아래는 이 워크플로우 맥락의 요약.

1. **추측 금지** — 모든 수치는 Figma MCP에서 실제로 읽은 값만 사용. (공통)
2. **아이콘 원본 강제** — MCP 제공 SVG/localhost 에셋을 그대로 사용. 새로 그리거나 외부 패키지 추가 금지. (figma-to-code 전용)
3. **막히면 보고** — MCP에서 값·에셋을 못 받으면 임의로 채우지 말고 어떤 항목인지 사용자에게 알린다(표에 `MCP 미제공` 표기). (공통)
4. **목록 책임** — 1단계 목록은 끝까지 지키고 4단계에서 반드시 대조. (figma-to-code 전용)

## 6 Gate와의 관계 (층위 분리)

| 구분 | 5단계 워크플로우 | 6 Gate |
|------|----------------|--------|
| 시점 | 작업 **진행 중** (사전 검문소) | 작업 **완료 직전** (사후 검문) |
| 작동 | 검문소에서 STOP, 사용자 확인/❌0 대기 | `npm run gate:check` 자동 판정 |
| 관계 | 5단계가 위에 얹힘 | 그대로 유지, 완료 보고에 함께 포함 |

> 두 층은 충돌하지 않는다. 5단계 완료 후 6 Gate(특히 Gate 1 Registry·Gate 5 UI)를 실행하고, Orchestrator Summary에 함께 보고한다.
> Harness Audit(`npm run harness:audit`)은 Gate 5 사후 검문이자, figma-to-code 4단계에서 component-verifier의 대조 도구로도 쓰인다.

---

# 🎛️ Main Orchestrator & Gate Check 구조 (2026-05-20 확정)

## Main Orchestrator 역할

Claude는 단일 **Main Orchestrator**로서 모든 작업 흐름을 직접 조율한다.

- 작업 요청 → 내부 Gate 검사 → 구현 → 완료 보고 (순서 고정)
- 사용자에게 하위 에이전트 호출을 별도 노출하지 않는다
- 모든 Gate 체크는 내부적으로 수행하고 결과를 Orchestrator Summary에 포함한다
- 완료 보고는 반드시 **Orchestrator Summary** 형식을 사용한다

## 5개 Gate 정의

### Gate 1: Registry Gate
**파일:** `.claude/agents/token-validator.md`
**트리거:** 컴포넌트 registry JSON 생성/수정, 토큰 추가/삭제, `tokens/*.md` 변경
**체크 항목:**
- `registry/components/index.json` path → 실제 파일 존재
- Component Token → Semantic 경유 여부 (Foundation 직접 참조 금지)
- 네이밍 규칙 (`--{component}-{variant}-{state}-{property}`)
- 신규 컴포넌트의 `harnessStatus / tokenStatus / darkModeStatus` 필드 존재
**자동 스크립트:** `npm run gate:check` (Gate 1 + Gate 3 포함)

### Gate 2: Figma Gate
**파일:** `.claude/agents/figma-inspector.md`
**트리거:** `registry/*.json`의 `figmaNodeId / componentSetKey / componentKey` 변경, Figma MCP 조회
**체크 항목:**
- 등록된 `figmaNodeId`가 Figma MCP에서 유효한 노드인지 확인
- `componentKey` → Figma 라이브러리 실존 여부
- ACCESS-01: `figma-usage-targets.json`의 stale nodeId 경고
- MCP 접근 실패 시 스냅샷으로 대체, SKIP으로 기록
**주의:** MCP 접근 실패 = SKIP (FAIL 아님). nodeId 미확인 = WARN.

### Gate 3: Quality Gate
**파일:** `scripts/gate-check.js` (Gate 3 섹션)
**트리거:** `assets/css/tokens.css` 변경, 모든 완료 보고 전
**체크 항목:**
- Foundation 이외 구역에 raw HEX 없음
- rgba 허용 예외 (`--color-overlay-*`)만 사용
- `pages/install-prompt.html` 존재 확인
**자동 스크립트:** `npm run gate:check`

### Gate 4: Report Gate
**파일:** `scripts/gate-check.js` (Gate 2 섹션)
**트리거:** `reports/*.md` 추가/수정, 작업 완료 전
**체크 항목:**
- `reports/reports-index.json` vs 실제 `.md` 파일 커버리지
- 미색인 report 파일 탐지
**자동 스크립트:** `npm run reports:sync && npm run reports:check`

### Gate 5: UI Gate + Harness Audit
**파일:** `.claude/agents/guide-builder.md`
**트리거:** `pages/*.html` 추가/수정, SITE_NAV 변경, 컴포넌트 섹션 수정
**자동 스크립트:** `npm run harness:audit` (Harness Audit 전용)
**체크 항목 — UI Gate:**
- 신규 페이지 → `assets/js/main.js` SITE_NAV 등록
- 신규 페이지 → `data/site-map.json` 메타데이터 등록
- HTML 인라인 HEX 색상 없음 (`style="color:#..."` 패턴)
- 금지 약어 미사용 (tok-, type-, bw-, fw-, cat-, cnt-)
**체크 항목 — Harness Audit (`scripts/harness-audit.js`):**
- RULE-1 SIZE_SPLIT: 사이즈 variant 있는 컴포넌트 HTML/CSS 탭 분기 완비 여부
- RULE-2 DARK_COMPARE: HTML 요소에 `data-theme="dark"` attribute 직접 사용 금지
- RULE-3 ICON_COLOR: 유사 역할 아이콘 색상 토큰 일관성 (독립 선택자 기준)

### Gate 6: Installer Coverage Gate (2026-06-02 신설)
**파일:** `scripts/installer-coverage-check.js`
**트리거:** `assets/css/tokens.css` 변경, `plugins/figma-vars-installer/src/vars-data.ts` 변경
**자동 스크립트:** `npm run installer:coverage` 또는 `npm run gate:check` (Gate 4 섹션)
**체크 항목:**
- Foundation Color (Light palette): tokens.css의 모든 `--color-{palette}-{step}`이 vars-data.ts FOUNDATION_COLOR에 존재하는가
- Foundation Number: `--spacing-N`·`--radius-N`·`--border-width-N`·`--font-size-N`·`--font-weight-*`·`--line-height-N`이 FOUNDATION_NUMBER에 존재하는가
- Semantic Color (반영 역할): `--color-{bg|surface|text|border|icon|action|status|overlay}-*`이 SEMANTIC_COLOR에 존재하는가
- Semantic Number: `--spacing-padding-*`·`--sizing-*`·`--radius-{control|button|card|modal}-*`이 SEMANTIC_NUMBER에 존재하는가
- 미반영 역할 보고 (WARN): `--color-{control-bg|control-border|form-control|navigation|data|text-state}-*`는 installer 미반영 — 정책 결정 필요
- Dark palette: `--color-*-dark-*`는 Light 변수의 Dark 모드로 흡수되므로 별도 검사 제외
**도입 사유:** 2026-06-02 사용자가 Figma 플러그인 설치 후 spacing·icon-size 등 누락을 시각적으로 발견. 5개 gate·3개 agent 모두 외부 산출물(installer ZIP)을 검사하지 않음. 커버리지 자동화로 동일 누락 재발 방지.

### Gate 7: Token Sync Monitor (2026-06-11 신설 · 2026-06-12 전 표면 확장)
**파일:** `scripts/token-sync-monitor.js` (`npm run tokens:monitor`)
**트리거:** `tokens.css`·`vars-data.ts`·`semantic.html`·`registry/tokens/semantic.colors.json` 변경 / 항상 (site-base.css 는 사이트 전용·검수 제외)
**자동 스크립트:** `npm run tokens:monitor` · `npm run gate:check` · 드리프트 해소 `npm run tokens:reconcile`
**역할:** 토큰 "값"이 **모든 표면**에서 정본과 일치하는지 한 번에 기계 판정. 컴포넌트를 계속 정리하면서 tokens.css·Variables·화면 토큰표가 어긋나는 것을 잡는다. **검증 최종 주체 = 이 Gate(검사기). 전파 = token-sync 에이전트.**

**정본(Canonical) = vars-data 단일** (2026-06-16 site-base 제외 확정):
- **Foundation + semantic**(color/button·control·text·icon·bg·surface …) = `vars-data.ts` (FOUNDATION_COLOR + SEMANTIC_COLOR). `tokens:gen`이 tokens.css Semantic을 여기서 생성. Variables 검수의 유일한 정본.
- **`assets/css/site-base.css` = 사이트 전용 표면 (Variables 검수 제외).** 역할 토큰(text/border/icon-role/action/status 등 site-base 전용분)은 포털 사이트가 `style.css → @import`로 적용하지만, **Variables(컴포넌트) 검수에는 검출되지 않는다** — 컴포넌트 검수와 사이트 스타일이 섞이는 혼란 방지(사용자 결정). `bg/surface`는 vars-data로 편입돼 정상 감시됨. site-base 값 자체는 Gate 7이 더 이상 감시하지 않으며, 문서 참조 유효성(Gate 10)만 site-base 정의를 silent def-source로 참고(검출 아님).

**비교:** 모든 표면 값을 resolved HEX(Light/Dark)로 정규화해 정본과 대조. 표면별 렌더 토큰 ∩ 정본만 비교(이름 차이 false positive 0). **추출 0건 = ⚠️ "모니터 안 됨"으로 보고(✅ 아님)** — 셀렉터 부패 방지.

**모니터 표면:**
| Tier | 표면 | 심각도 |
|------|------|--------|
| 1 | tokens.css · install-prompt.html · semantic.html · registry/semantic.colors.json · registry/foundation.colors.json | ERROR |
| 2 | tokens/semantic.md | WARN |
| 확장슬롯(미구현) | foundation.html · foundation.md · component-tokens-extracted.md | — |

**한계:** 손유지 표면(semantic.html hex·registry json)은 모니터가 *탐지*만 한다. *재생성*은 `tokens:reconcile`(deterministic: tokens:gen·sync-prompt·installer:build)이 하고, 하드코딩 잔여분은 token-sync 에이전트/수동 수정.
**도입 사유:** 2026-06-11 control-bg-disabled 값 정정 시 vars-data 드리프트·semantic.html stale hex 사각지대 확인 → 값 일치 검사를 Gate로 승격(초판 3표면). 2026-06-12 사용자가 "전 표면 강력 모니터링" 요청 → 정본 2계층화·표면 6종 확장. 도입 시 semantic.html stale hex 10건 + registry icon-inverse dark drift(#FFFFFF→gray-dark-900) 발견·정정.

### Gate 8: Component Key Coverage (2026-06-12 신설)
**파일:** `scripts/component-key-coverage-check.js` (`npm run components:keycheck`)
**트리거:** `plugins/figma-vars-installer/src/build-components.ts` 또는 `vars-data.ts` 변경 / 항상(gate:check 포함)
**자동 스크립트:** `npm run components:keycheck` · `npm run gate:check` (Gate 8 섹션)
**역할:** build-components.ts 빌더가 런타임에 **동적 조합**하는 변수 키(예: `color/chip/${v}/border/${state}`)가 vars-data 정본(SEMANTIC_COLOR·FOUNDATION_COLOR·*_NUMBER)에 **모두 존재**하는지 기계 판정.
**방법:** 정적 추측 불가(키가 동적 조합) → esbuild 로 build-components.ts 를 CJS 번들 후, **mock figma + 키 기록 maps 프록시**로 `buildAllComponents` 를 실제 실행해 요청된 전 키를 수집, vars-data 공급분과 대조.
**범위:** color/number 키(vars-data 공급분)만. 텍스트 스타일은 code.ts 소관(별도).
**도입 사유:** 2026-06-12 `buildFilterChip` solid Hover 가 `color/chip/solid/border/hover`(미정의)를 요청 → Figma 플러그인 실행 중 `requireVar` 가 "변수 누락"으로 **전체 빌드 중단**. `audit-bindings`(네임스페이스 `color/chip/` 만 검사)의 사각지대였음. leaf 키 누락을 **커밋 단계에서 기계 차단**해 동일 크래시 클래스 재발 방지. 정본 Chip·line variant 와 일치하도록 solid Hover 보더를 default 로 정정(토큰 신설 없이 내부 일관성 복원).

## Gate 실행 순서

```
작업 완료 직전:
  1. Gate 1 (Registry)  — 항상
  2. Gate 2 (Figma)     — figmaNodeId 관련 변경 시
  3. Gate 3 (Quality)   — tokens.css 변경 시 / 항상
  4. Gate 4 (Report)    — reports/*.md 추가 시
  5. Gate 5 (UI)        — pages/*.html 변경 시
  6. Gate 6 (Installer Coverage) — tokens.css 또는 vars-data.ts 변경 시 / 항상
  6b. Gate 6b (Installer Build Freshness) — 커밋된 zip 이 vars-data 최신 빌드인지(빌드 누락 stale 탐지) / 항상
  7. Gate 7 (Token Sync Monitor) — 토큰 값(tokens.css·vars-data·semantic.html·registry) 변경 시 / 항상 (site-base.css = 사이트 전용·검수 제외)
  8. Gate 8 (Component Key Coverage) — build-components.ts 또는 vars-data.ts 변경 시 / 항상
  9. Gate 9 (Number/Sizing Page Consistency) — number 토큰(sizing·spacing·radius·border-width·font·opacity·breakpoint)·foundation/semantic 페이지 변경 시 / 항상
  10. Gate 10 (Doc Token Reference Drift) — 가이드/레퍼런스 HTML(ai-snippets·guide-md 등) 토큰 참조 / 항상. Check B(rename denylist 잔재)=차단 · Check A(미정의 --color-* 참조)=경고
```

스크립트 일괄 실행: `npm run gate:check` (Gate 1 + 3 + 4 + 6 + 7 + 8 + 9 + 10 자동)

> **Gate 10 (doc-token-ref-check):** 토큰을 rename/remove 하면 옛 이름을 쥔 가이드 문서가 자동 적발된다. **정본 rename 시 `registry/tokens/deprecated-tokens.json` 의 `renamedGroups` 에 `{from,to}` 한 줄 추가**하면 이후 게이트가 전 활성 페이지에서 잔재를 차단(Check B). `--color-*` 참조 존재성은 Check A(경고)로 가시화. 단독 실행 `npm run docs:tokencheck`. `components.html`(폐기 예정)은 검사 제외.

> **🗂️ 레거시 격리 규약 (2026-06-16):** 활성 정본과 레거시를 **파일 단위로 분리**해 검사 제외한다. 폐기 토큰 CSS = `assets/css/legacy-tokens.css`(미로드), 폐기 문서 = `tokens/legacy/deprecated-reference.md`(아카이브). **단일 정본 = `registry/tokens/deprecated-tokens.json`**(`deprecatedTokens[].cssVariable`·`renamedGroups`·`legacyFiles`). 공용 필터 `scripts/lib/legacy-skip.js`(`isDeprecatedToken`·`isLegacyFile`)를 게이트가 공유 → **새 폐기 건은 deprecated-tokens.json 에 등록만 하면 전 검사에서 자동 제외**. 와일드카드 `--button-ghost-*` 형태 지원. 신규 게이트도 이 헬퍼를 import 해 레거시를 건너뛴다.

> **Gate 9 (number-page-check):** 색상 전용이던 자동 동기화(생성기·Gate 7)의 **number 사각지대**를 메운다. 검사 3종 — **(A)** foundation.html 의 number 5종 GEN 블록(`SIZING`·`FONT_SIZES`·`LINE_HEIGHTS`·`OPACITIES`·`BREAKPOINTS`) = vars-data FOUNDATION_NUMBER 정본 일치(`npm run number:gen`), **(B)** vars-data 의 **모든** Foundation/Semantic number 토큰이 foundation.html / semantic.html 에 실제 노출(신규 토큰 추가 시 페이지 미반영 탐지·font-weight는 Typography 표가 담당해 제외), **(C)** 폐지된 컴포넌트 사이징 토큰(`--sizing-{button-height|chip-height|table-row-height|form-control-height|dropdown-item-height|icon|button-min-width}-*`) 재유입 0건. 데이터 파이프라인(tokens.css·install-prompt·설치기 zip)은 Gate 6(installer-coverage)+Gate 3가 별도 강제.

## ⚙️ 강제 계층 — Hooks (2026-06-11 신설)

> **핵심:** Gate·서브에이전트는 *자동이 아니다*. Gate는 사람이 `npm run gate:check`를 칠 때만, 에이전트는 호출돼야만 돈다. **진짜 자동·강제는 hook만 가능하다.** 토큰 값 드리프트가 과거에 방치된 근본 원인 = 자동 트리거 부재.

| 훅 | 위치 | 발동 | 동작 | 강제력 |
|----|------|------|------|--------|
| **PostToolUse** (알림) | `.claude/settings.json` → `.claude/hooks/on-token-edit.sh` | `tokens.css`·`vars-data.ts` 편집 즉시 | install-prompt 자동 재동기화 + Gate 7 값 검증. 불일치면 exit 2로 모델에 피드백 | 알림(차단 안 함) |
| **pre-commit** (차단) | `.git/hooks/pre-commit` (정본: `scripts/hooks/pre-commit`) | `git commit` 시 | `npm run gate:check` 실행, error면 **커밋 차단**(exit 1) | 물리 차단 |

- **재설치:** git 훅은 커밋되지 않지만, **package.json `prepare` 스크립트가 `npm install` 시 자동 설치**하므로 보통 수동 입력 불필요. (수동 강제: `bash scripts/hooks/install-git-hooks.sh`. git 없는 환경에선 조용히 통과.)
- **우회:** `git commit --no-verify` (비권장 — 드리프트가 저장소에 유입됨).
- **검증 완료:** vars-data 값을 일부러 어긋나게 하면 PostToolUse가 exit 2로 정확한 불일치를 보고하고, pre-commit이 exit 1로 커밋을 막는 것을 확인(2026-06-11).
- **책임 분리 최종형:** 전파=token-sync 에이전트(작업자) · 판정=Gate 7(검사기) · **강제=hooks(집행자)**. 세 층이 모두 있어야 "성실성 의존"이 "기계 강제"가 된다.

## Orchestrator Summary (완료 보고 형식)

작업 완료 시 반드시 아래 형식으로 보고한다. 섹션은 해당 항목이 있을 때만 포함한다.

```
## Orchestrator Summary — {작업명}

### 변경 내용
| 파일 | 변경 내용 |
|------|---------|
| path/to/file | 변경 설명 |

### Gate 결과
| Gate | 결과 | 비고 |
|------|------|------|
| Registry | ✅ PASS | |
| Figma    | ⚠️ WARN | {component} figmaNodeId 미확인 |
| Quality  | ✅ PASS | |
| Report   | ✅ PASS | |
| UI       | ✅ PASS | |

### 미결 사항 (Human Decision 필요)
- HD-X: {내용}

### 🔁 자동화 승격 후보 (반복 3회 도달 시만 표시)
| 패턴 | 횟수 | 추천 규칙 |
|------|------|---------|
| {label} | {count}회 | {automationNote} |

### 다음 단계
- {다음 작업}
```

> **승격 후보 섹션은 count ≥ 3인 패턴이 있을 때만 포함한다. 없으면 섹션 전체 생략.**

## 반복 요청 추적 규칙 (Repeated Request Tracker)

**파일:** `reports/repeated-requests.json`
**승격 기준:** 동일 패턴 3회 이상 → Orchestrator Summary에 승격 후보 보고

### 추적 방법

작업을 완료할 때마다:
1. 사용자의 요청이 `reports/repeated-requests.json`의 기존 패턴과 유사한지 확인
2. 유사한 패턴이 있으면 `count` +1, `occurrences`에 기록
3. 없으면 새 항목으로 추가 (`count: 1`, `promotionStatus: "tracking"`)
4. **count가 3에 도달하면** Orchestrator Summary에 아래 형식으로 보고

### 승격 후보 보고 형식 (Orchestrator Summary에 포함)

```
### 🔁 자동화 승격 후보
| 패턴 ID | 반복 횟수 | 내용 | 추천 규칙 |
|---------|---------|------|---------|
| {id} | {count}회 | {label} | {automationNote} |
```

### 현재 패턴 상태

| 패턴 ID | 횟수 | 상태 | 설명 |
|--------|------|------|------|
| `harness-layout-fix` | 3회 | ✅ promoted | harness-audit RULE-1b 커버 |
| `size-split-missing` | 3회 | ✅ promoted | harness-audit RULE-1 커버 |
| `harnessStatus-not-updated` | 2회 | 🟡 candidate | Gate 1에 추가 검토 필요 |
| `code-tab-order` | 2회 | 🟡 candidate | harness-audit RULE-4 후보 |
| `dropdown-gap-inconsistency` | 2회 | 🟡 candidate | harness-audit RULE 추가 가능 |

> 상세 이력: `reports/repeated-requests.json`

## 금지 행동

- Gate 실패(error)를 숨기고 완료 보고하는 것
- 사용자 승인 없이 gate-check.js를 수정해 체크 항목을 약화하는 것
- Orchestrator Summary 없이 작업 완료를 선언하는 것
- Figma Gate SKIP을 FAIL로 잘못 기록하는 것
- 반복 요청 패턴을 발견하고도 `repeated-requests.json`에 기록하지 않는 것

## ACCESS-01: Figma Plugin 재등록 절차

`npm run figma:usage:check`에서 stale nodeId 경고 3건이 지속되는 경우:

```
1. Figma Desktop 실행 → SW UX 디자인가이드 2.4 파일 열기
2. 메뉴: Plugins > Development > Import plugin from manifest
   경로: {project_root}/plugins/figma-token-sync/manifest.json
3. 플러그인 실행 → UI에서 "Scan from Selection" 탭 선택
4. Figma 캔버스에서 검사할 컴포넌트 프레임 선택
5. Scan 버튼 클릭 → nodeId 확인
6. registry/figma/figma-usage-targets.json targets 배열 업데이트
7. npm run figma:usage:check 재실행 → 경고 해소 확인
```

ACCESS-01 해소 (2026-05-20 MVP-F1 플러그인 스캔 완료):
- `540:3328` — Input (Figma 내 잘못된 명칭 'Login input' — canonical: 'Input')
- `540:3794` — DatePicker (datepicker_input)
- `540:3690` — TimePicker Input (timepicker_input)
- `540:3636` — TimePicker Select
- `540:3489` — TimePicker Select Dropdown
- `540:3506` — TimePicker PC Input Dropdown
- `540:4216` — TimePicker PC Calendar
