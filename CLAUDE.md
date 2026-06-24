# ASC - AI Context Document (Design System Harness)

> 이 문서는 Claude가 디자인 시스템을 **수집, 정리, 구조화, 검증**하기 위한 기준입니다.
> 현재 목표는 UI 구현이 아니라 **디자인 시스템을 구축하는 것**입니다.
> 마지막 업데이트: 2026-06-06 (규칙 체계 정리: 두 갈래 분류 원리 상위화·rgba EX02/EX06·R12/R13 폐지·hover 레거시 누락 처리·공통 규칙 허브 신설·중복 정본화(audit-rules.json/CLAUDE.md)·README 요약+링크.)

---

## 하네스: Design System

**목표:** 토큰 검증·HTML 가이드 생성·Figma 동기화·리뷰 관리를 자동화한다.

**트리거:** 토큰 검증, 가이드 페이지 업데이트, Figma 동기화, MD 리뷰 등록 작업 요청 시 `design-system` 스킬을 사용하라. **Figma 컴포넌트를 코드로 옮기는 작업**("Figma ~ 구현/변환/만들어줘")은 `figma-to-code` 스킬을 사용하라. **레거시 시안의 화면/플로우를 최신 정본 컴포넌트로 Figma에 그대로 재현하는 작업**("이 레거시 화면/플로우 그대로 만들어줘/재현/옮겨줘")은 `screen-rebuild` 스킬을 사용하라. **Figma 디자인 시스템 라이브러리의 컴포넌트/변형세트 "정의" 자체를 빌드·편집하는 작업**("Figma에 ~ 컴포넌트 만들어/추가해줘", "~를 변형세트(variant set)로 묶어/세트화해줘", "variant 추가", "Shell/아이콘 컴포넌트 빌드/수정")은 `figma-library-build` 스킬을 사용하라 — 빌드는 figma-library-builder(🏗️), 검증은 component-verifier(🤖)가 **분리** 수행하고 총괄(⭐)은 흐름만 관리한다(⭐ 단독 빌드+검증 금지·§⚖️ 운영 원칙). 단순 질문과 **단일 노드 좌표/이름 1건 같은 순수 기계적 미세 편집**은 스킬 없이 직접 응답 가능(구조 변경은 위임).

**에이전트:** `.claude/agents/` — token-validator · guide-builder · figma-inspector · component-verifier · token-sync · screen-rebuilder(🪞 레거시 화면 빌드 전용, screen-rebuild 스킬 3단계) · figma-library-builder(🏗️ 라이브러리 컴포넌트/변형세트 빌드 전용, figma-library-build 스킬 3단계)

**토큰 값 전파:** 사용자가 **토큰 "값"을 바꾸면**(예: "control-bg-disabled를 gray/100으로", "이 토큰 값 일괄 반영해줘") `token-sync` 에이전트가 연관된 모든 표면(tokens.css·vars-data.ts·install-prompt·semantic 문서·설치기 zip)에 누락 없이 전파한다. 표면 위치는 `npm run tokens:locate -- <token>`으로 결정론적으로 확인. 새 토큰 생성·네이밍·구조 변경은 token-sync 범위 밖(token-validator 소관).

**워크플로우 스킬:** `figma-to-code` — Figma 컴포넌트를 코드로 옮기는 5단계 검문소 워크플로우(재고조사 → 수치추출 → 구현 → 자가대조 → 다크모드). 상세: 아래 "🪜 Figma → 코드 5단계 워크플로우" 섹션. · `screen-rebuild` — 레거시 시안 화면/플로우를 최신 정본 컴포넌트로 Figma에 동일 재현하는 4단계 검문소 워크플로우(원본 재고조사 → 매핑·허용편차 → 빌드 → 3층 검증). figma-to-code의 역방향(레거시 화면→V3.0 Figma). 상세: `.claude/skills/screen-rebuild/SKILL.md`. · `figma-library-build` — 코드/디자인 의도를 Figma **라이브러리 컴포넌트/변형세트 "정의" 자체**로 빌드·편집하는 4단계 검문소 워크플로우(원본/의도+라이브러리 현황 재고조사🔍 → 매핑·빌드계획🎩 → **빌드 위임**🏗️ figma-library-builder → **검증 분리**🤖 component-verifier: variant 전수·**패킹 붕괴**·토큰 바인딩·순환참조·렌더). ⭐ 단독 빌드+검증 금지. screen-rebuild(화면 인스턴스 조립)와 구분. 상세: `.claude/skills/figma-library-build/SKILL.md`.

**변경 이력 (작성 규칙):** 본 표에는 **최근 건만 한 줄**(날짜·무엇을·한 줄 사유)로 남긴다. 상세 경위는 **git commit 메시지**와 **`reports/changelog-archive.md`**(전체 보존본, 세션 미로드)에 둔다. 새 항목은 한 줄로 추가하고, 표가 길어지면 오래된 행을 아카이브로 옮긴다. (이력으로 컨텍스트가 무거워지지 않게 — 2026-06-17 정책 확정)

| 날짜 | 변경 내용 (한 줄) |
|------|------------------|
| 2026-06-24 | **Select Box Open 드롭다운 누락 수정 + "표시 순서 ≠ 빌드 순서" 영구 규칙화** — Select Box Open 에 드롭다운 패널이 안 붙던 원인=빌드 순서(Select Box 가 Dropdown 보다 먼저 빌드돼 BUILT_COMPS 비어 부착 실패). 1차로 members 재배열했으나 그러면 나열 순서가 깨짐 → 사용자 지적("나열은 메인→요소, 빌드만 요소 먼저"). `BUILD_DEPENDENCIES`+`buildOrderFor` 위상정렬로 빌드는 요소 먼저, members 는 표시(메인→요소) 순서 고정, `buildAllComponents` layout 패스가 카테고리 내부를 members 순서로 재배치, `render.js` 는 members 정렬. Form Control 표시=Input·Search·Text Area·Select Box·Dropdown·Dropdown List, Select Box 옵션 0→32. 🤖 component-verifier 구조검증 PASS(❌0)·전 게이트(1~15)+zip 재빌드 통과 |
| 2026-06-23 | **Gate 15 토큰네이밍 검사기 신설**(+ Gate 14 Footer 문서화) — 기준이 산문으로만 있고 토큰 **이름**을 검사하는 게이트 부재로 레거시명·우회 별칭이 정본 유입(navigation/background·icon/brand-ci·고아 table/border/emphasis). 산문→기계 정본 `registry/governance/naming-rules.json`(bg·brand-in-semantic 금지·kebab) + `token-naming-check.js`로 커밋 차단. 동시에 기준 정합: navigation/background→**bg**·table/border/light→**default**·emphasis 삭제·icon/brand-ci 별칭 제거+빌더 Foundation `brand/ci` 직바인딩(BuildMaps.foundationColor 신설). semantic.md 그룹A 23종 제거·그룹B 개명. 🤖 component-verifier 구조검증 통과·전 게이트(1~15) 통과 |
| 2026-06-19 | **CLAUDE.md 다이어트**(토큰 절감) — 완료된 휴면 MVP 상세 규칙(Portal/Harness·Source Guard·Input·Token Mapping/Sync/Legacy) 4개를 `.claude/docs/*-rules.md`로 분리하고 본문엔 "작업 트리거→참조 문서" 포인터 표만 유지. 미결목록은 완료 스텁 제거·활성 9건만. 112k→86k자(~6.5천 토큰↓/매 세션). 규칙 손실 0(활성 전부 유지·포인터로 즉시 로드). 전 게이트 통과 |
| 2026-06-19 | 설치기 **라이트 스펙 프레임 미생성**(buildSpec·buildGroupedSpec·TPD States) — 원본 세트가 곧 Light 기준이라 중복 → 컴포넌트당 [원본(Light) + Spec Dark]만. Dark는 원본 우측(offsetX+W+80)으로 밀착해 빈 라이트 컬럼 제거(공간 절약, 사용자 결정). footprint에 "Spec Light" 유지→재설치 시 옛 라이트 자동 정리. Core 페이지 기존 라이트 스펙 21개 수동 삭제 완료. tsc·전 게이트 통과 |
| 2026-06-19 | 설치기 스펙 레이아웃 정리 — 스펙 행을 **상단정렬+적응높이**(라벨↔컴포넌트 밀착·빈공간 제거, renderFlat/renderGrouped)·DatePicker 열폭 380(Open 캘린더 356 침범 방지)·**GNB 바 세로 1열 나열+폭 1920**. 상위 배치(Shell 좌측·열 간격·1920 프레이밍)는 사용자가 Figma 수동 배치→위치 읽어 생성기에 저장 예정(saved-layout). 빌드·키체크·전 게이트 통과(렌더는 사용자 재실행 확인) |
| 2026-06-19 | 설치기 출력 **대메뉴 섹션화**(Actions·Selection·Table·Navigation·Shell 좌측 세로 + **Form 우측 별도 컬럼**, components.html 5분류 기준) + **Shell 신설**: Shell/StatusBar(App·Web, 원본 벡터/토큰 충실 재현)·Shell/NavBar(App·Web, 원본=카톡사진 → DS 아이콘 벡터로 신규 제작). 섹션은 y밴드로 떠있는 그룹라벨까지 흡수(배경 가림 수정), Form 섹션은 통째 우측 이동(절대위치 보정). ui.html 컴포넌트 목록 갱신·전 항목 기본 언체크·"계속 추가 중" 행 날짜 {{BUILD_DATE}} 자동스탬프. tsc·keycheck·전 게이트 통과. ⭐자가인증(렌더는 사용자 플러그인 실행 확인) |
| 2026-06-19 | 설치기 아이콘을 **V2.2 라이브러리 컴포넌트 인스턴스**로 전환(importComponentByKeyAsync) — remove·search·clock·calendar·menu·account·**check(ic_확인 ✓ 97:167)·chevron(419:69, 방향=회전: 우0·상90·좌180·하270)** = 셀렉트·페이지네이션·캘린더·칩·체크박스 포함. 공용 `makeIconInstance`/`ICON_KEYS`(회전 시 center 오토레이아웃 래핑·rebindIconColor는 숨김채움 보존). **Gate 12 아이콘인스턴스 검사기** 신설(벡터 직삽입 차단·allow 마커 필수). GNB 언어=지구본(ic_인터넷 35:3317). 전 아이콘 렌더 육안 검증. 벡터 유지(마커): 페이지네이션 Edge(처음/마지막=쉐브론+바, V2.2 미존재)·휴대폰 셸 크롬(DS 아이콘 아님) |
| 2026-06-19 | 설치기 Input·Search Input·**Text Area** **입력 커서(caret)** + Input·Search **selected 삭제(close) 아이콘** 누락 수정(텍스트에리어는 커서만·삭제 아이콘 제외) + **Gate 11 부품해부 검사기** 신설 — 토큰만 보던 게이트들의 **구조 사각지대**(하위 요소 드롭)를 recording mock figma 로 상태별 필수(require)/금지(forbid) 하위 요소 manifest 대조해 커밋 차단. 회귀 시뮬레이션 적발 검증(16건 ❌→원복 ✅). caret=blue/400(border/selected) 세로선·close=**V2.2 remove(line) 라이브러리 컴포넌트 인스턴스**(importComponentByKeyAsync, key 24b2df…·게시 확인·벡터 직삽입 아님, 색은 form-control/icon/default 재바인딩) 우측 |
| 2026-06-19 | control-border-disabled = gray/200 으로 변경(다크 gray-dark/300 유지)·미사용 disabled-alt1/alt2 삭제 + Toggle 빌더 disabled knob 색 정정(indicator/selected→/disabled — 다크모드 흰색 knob 버그). vars-data 정본 1곳 + semantic.colors.json 수정 후 tokens:gen·page:gen·sync-prompt·installer:build 재생성, 전 게이트(1·3·4·7·8·9·10)+keycheck 통과 |
| 2026-06-18 | `figma-library-build` 스킬 + 🏗️ `figma-library-builder` 에이전트 신설 — Figma **라이브러리 컴포넌트/변형세트 "정의" 자체** 빌드·편집을 ⭐ 단독 인라인에서 **위임 강제 4단계 검문소**로 전환(재고조사🔍→계획🎩→빌드🏗️→검증🤖). component-verifier에 §(C) 라이브러리 빌드 검증(variant 전수·**패킹 붕괴**·토큰 바인딩·순환참조·렌더) 추가. §⚖️ 운영원칙에 **하드룰**: 구조 변경 = ⭐ 단독 빌드+검증 금지(빌드자≠검증자). (Shell 변형세트화에서 ⭐ 혼자 빌드+자가검증→패킹 10100px 붕괴·정렬·세트화 누락이 사용자에게 새어나간 반복 실패를 구조로 차단) |
| 2026-06-18 | 설치기 컴포넌트 3종 신설 — **Pagination**(Arrow 3+Number 3)·**GNB**(메뉴슬롯 9+바 6, PC only)·**Date Picker**(트리거 form-control 4×4 + Open=PC 캘린더 패널). components-new 정본 대비 누락분. 신규 vars-data 키 0(기존 semantic 재사용)·build-components.ts 빌더+stack+footprint·ui.html 목록 갱신·zip 재빌드. 🤖 component-verifier 적대적 대조로 ❌5건(DatePicker day색 날조·평일 text/secondary·GNB util xsm 32/18·placeholder YY.MM.DD) 적발·수정, 전 게이트(1·3·4·6·7·8·9·10)+keycheck 통과. 미결: DatePicker HD(componentSetKey·모바일 인터랙션)·(b)Pagination number 다크 Foundation직참 개선=Figma개선목록 |
| 2026-06-18 | `screen-rebuild` 스킬 신설 — 레거시 시안 화면/플로우를 V3.0 정본 컴포넌트로 Figma에 동일 재현하는 4단계 검문소 워크플로우(원본 재고조사🔍 → 매핑·허용편차선언 → 빌드(figma-use 프리플라이트) → 3층 검증🕵️: 기계(텍스트정확일치·fills Variable바인딩·variant=원본상태·인스턴스여부·고정100/spacer잔재0·누락0)+이미지대조+적대적). 만드는자≠검증자 강제·색은항상토큰·컴포넌트만교체·원본아이콘강제·이미지폴백. 배치규약: 서비스충실재현=서비스페이지, 공통화패턴만 Patterns. (회원가입·만14세 약관동의 파일럿 계기 — 원본 안읽고 지어냄+자가인증 실패를 구조로 차단) |
| 2026-06-17 | 🎭 Actor 출처 표식(이모지·이름) 확정 — ⭐총괄/🤖작업에이전트/🔎검사기/🚧커밋검문소·🔄토큰편집동기화기. 이모지=카테고리·이름=대상+역할(예: 토큰값일치 검사기). CLAUDE.md 범례+규칙+**운영원칙 보정**(크기 아닌 "게이트 사각지대" 기준: UI/CSS 변경=렌더 확인 의무·구조변경=🕵️ 실제 spawn). gate-check·harness-audit에 🛡️, 훅에 ⚙️, agent.md 자기 이모지. **렌더 확인서 12h 오전/오후 세로쪼개짐 버그 적발·수정**(white-space:nowrap·12h폭 200px) — 게이트 ✅였으나 시각 깨짐. **+ Main Orchestrator 작동모델 개정: "계획 1회 확인 후 자율 실행"** — 사용자는 목표만, 메커니즘(px·토큰·실측값)은 내가 결정·검증, 검수는 렌더결과로, 진짜 결정만 escalate |
| 2026-06-17 | TimePicker Dropdown 세트 구조 정정 — Time Picker Cell(State=Default/Hover/Selected) 컴포넌트화 후 인스턴스로 패널 조립 + 12h/24h 별도 States 스펙(시·분 Hover/Selected, 분선택=확인활성) 신설(생성기 build-components.ts+하네스 components-new). 드롭다운 width=121px(Figma 24h 최소) |
| 2026-06-17 | ds-extract 제거(중복·배치오류) — 시안 코퍼스 추출은 **별도 생태계(s1-service-intelligence 허브 + s1-moduapp-workspace 등 서비스별 워크스페이스)에 이미 존재**(ui-reader·pattern-finder·ds-mapper·pattern-librarian 에이전트+공유 카탈로그+스크린 분석). DS가이드는 빌드/출력측이라 코퍼스 분석을 둘 곳이 아님 → scripts/ds-extract·corpus-targets·skill·reports·ds:* 스크립트 제거. 시안 분석은 s1-moduapp-workspace에서 진행. (contact-sheet 시각검토 아이디어는 워크스페이스로 이관 후보) |
| 2026-06-17 | Figma MCP 읽기 규칙(단계적 탐색: 선택영역/페이지 리스트업) §🔎 신설 + 변경 이력 슬림화·아카이브 분리 |
| 2026-06-17 | Button loading 상태 완전 삭제 (레거시 보존 없이 제거) |
| 2026-06-17 | 구 components.html legacyFiles 격리(검수 제외) + 검수기 정본 components-new 재지정 |
| 2026-06-16 | site-base 를 Variables 검수에서 제외 (사이트 전용 분리) |
| 2026-06-16 | bg/surface semantic 토큰 편입 + Filter Chip 복구 + reconcile install-prompt 결정화 |
| 2026-06-16 | 레거시 격리 구조 신설(legacy-tokens.css·legacy-skip.js) + Check A 드리프트 정리 |

> 위 이전(2026-04-29 ~ 2026-06-15)의 전체 상세 이력 72건: **`reports/changelog-archive.md`** 참조.

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

> **정리(2026-06-19):** 완료 항목(구 1·4·7·8·10·15)은 「변경 이력」 표·git 히스토리·각 reports에 보존돼 본 목록에서 제거했다. 아래는 **활성 미결만** 남긴 것이다.

```
1. Figma Button nodeId 등록
   - registry/figma/figma-map.json 의 Button componentSetKey / figmaNodeId 모두 빈 문자열
   - Figma URL (node-id 포함) 제공 시 즉시 등록 가능

2. Dark Mode 버튼·컨트롤 색상 확정
   - --color-text-disabled dark 값: 현재 #35363F → #55575F 조정 검토 중
   - blue-line variant dark mode 시각 검증 미완료 (darkModeStatus: pending)
   - toggle tokens 불일치: MD는 var(--color-text-placeholder), CSS는 var(--color-border-default)

3. Semantic Token Figma 반영 (Figma 파일 직접 수정 필요)
   - 오타 수정: color/status-card/text/*--defualt → --default (3건)
   - surface/status/* → Domain Token 이동 여부 확정

4. Dark border 4 토큰 확정
   - --color-border-subtle/default/strong/emphasis dark 값 candidate 상태
   - resolved HEX 또는 foundation dark scale 참조 확정 필요 (Human decision)

5. DatePicker component candidate Human Decisions (MVP4.3-A)
   - HD-1: Figma node 6443:4655 componentSetKey 확인 (MCP invalid — Figma 직접 확인 필요)
   - HD-2: 공식 컴포넌트명 확정 (DatePicker vs DayPicker)
   - HD-3: calendar icon Figma 노드명 확정 (현재 candidate SVG)
   - HD-4: Mobile 인터랙션 확정 (bottom sheet vs inline vs popover)
   - HD-5: DatePicker 전용 token candidate → stable 전환 여부 결정
   상세: reports/mvp4-3-a-date-picker.md
6. TimePicker component candidate 정리 (figmaNodeId: 6443:4606)
7. Pattern 페이지 설계 (search-table, tree-detail)
8. Legacy 가이드 작성
9. MVP-L1 UX Guide 2.4 Variables export → npm run figma:audit 실행
   - Figma에서 실제 S1 UX 디자인가이드 2.4 파일 열기
   - SW Token Sync 플러그인 → Export Variables → Download JSON
   - registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json으로 저장
   - npm run figma:audit 실행 → reports/mvp-l1-legacy-token-audit.md 생성
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

## 📐 표시(나열) 순서 ≠ 빌드(생성) 순서 규칙 (2026-06-24 확정 · 영구)

설치기/Figma 생성기(`build-components.ts`)와 프리뷰(`render.js`)에서 컴포넌트를 다룰 때 **두 순서를 분리**한다.

| 구분 | 순서 기준 | 원칙 |
|------|----------|------|
| **표시(나열) 순서** | `COMPONENT_CATEGORIES_GRID` 의 `members` 배열 | **메인 컴포넌트 → 그 안을 구성하는 요소 컴포넌트** 순 (예: Select Box → Dropdown → Dropdown List) |
| **빌드(생성) 순서** | `BUILD_DEPENDENCIES` 위상정렬(`buildOrderFor`) | **요소 컴포넌트 먼저** — 부모가 자식을 인스턴스로 부착하므로(예: Select Box Open 이 Dropdown 을 `BUILT_COMPS` 에서 가져다 붙임) 자식이 먼저 빌드돼야 함 |

- `members` 는 **항상 표시 순서**로만 유지한다. 빌드 의존성 때문에 members 를 재배열하지 않는다(그렇게 하면 나열 순서가 깨진다 — 이번 회귀의 원인).
- 부모↔자식 부착 관계가 새로 생기면 `BUILD_DEPENDENCIES[부모] = [자식…]` 에 한 줄 추가한다. 빌드는 `buildOrderFor` 가 요소를 먼저 생성하고, `buildAllComponents` 의 layout 패스가 카테고리 내부를 members(표시) 순서로 세로 재배치한다. 프리뷰는 `render.js` 가 categorySets 를 members 순서로 정렬한다.
- 이 규칙 변경(루프·BUILD_DEPENDENCIES)은 `build-components.ts` 구조 변경 → ⭐ 단독 자가검증 금지, 🤖 component-verifier 검증(Gate 13) 필수.

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


# 🗂️ 아카이브된 휴면 규칙 (작업 트리거 시 해당 문서 참조)

> 아래는 **이미 완료된 서브시스템의 상세 규칙**이다. 매 세션 컨텍스트를 가볍게 유지하려고 CLAUDE.md에서 분리했다.
> 해당 작업을 시작할 때 **반드시 그 문서를 먼저 Read** 해서 규칙을 따른다. (정본은 각 문서 + 거기 명시된 registry/SKILL)

| 작업 트리거 | 참조 문서 |
|------------|----------|
| Portal 페이지 렌더링·Core Harness·Button/Dark Border 토큰 편집 | `.claude/docs/portal-harness-rules.md` (MVP2/MVP3) |
| Source Guard (외부 서비스 토큰 검수/수정/CI) | `.claude/docs/source-guard-rules.md` (MVP3.5~3.8) |
| Input·Search·Password·Unit·DatePicker 컴포넌트 편집 | `.claude/docs/input-component-rules.md` (MVP4.x) |
| Figma Variable 매핑·Token Sync 플러그인·Legacy 토큰 감사 | `.claude/docs/token-mapping-sync-rules.md` (MVP-T1/T2/L1) |

> MVP0 Registry 운영 기준(바로 위)은 활성 참조라 본문 유지. 토큰 열거 규칙 정본=`registry/governance/audit-rules.json`, 워크플로우 상세 정본=각 `.claude/skills/*/SKILL.md`.

# 🔎 Figma MCP 읽기 규칙 (단계적 탐색 — 2026-06-17 확정)

> Figma MCP로 원본을 읽을 때의 **공통 탐색 절차**다. 큰 영역을 한 번에 `get_design_context`로 호출하면 응답이 잘리므로, **항상 메타데이터로 먼저 좁히고 → 사용자가 고른 노드만 깊이 들어간다.** 아래 5단계 워크플로우의 1·2단계(재고조사·수치추출)에 선행하는 읽기 규율이며, 추측 금지(§🤖 공통 규칙 허브)의 실행 절차다.

## 진입 분기 — 무엇이 선택돼 있는가

| 상황 | 진입 절차 |
|------|----------|
| **단일 컴포넌트 등 작은 선택** | 1단계 생략 가능 — 바로 `get_design_context` + `get_variable_defs` 호출 |
| **화면·프레임 등 큰 선택** | **A. 선택 영역 탐색** 절차 |
| **선택 없이 페이지만 보는 중** | **B. 페이지 리스트업** 절차 |

## A. 선택 영역 탐색 (큰 프레임/화면)

1. 현재 선택 영역에 **`get_metadata`** 를 호출한다 (절대 `get_design_context`를 먼저 호출하지 않는다 — 응답 잘림 방지).
2. 구성 노드를 아래 표로 정리해 보여준다:
   ```
   | 번호 | 노드 ID | 이름 | 타입 |
   ```
3. 표 아래에 **"어떤 노드부터 작업할까요?"** 라고 묻고, 사용자가 번호나 이름으로 고를 때까지 **반드시 대기**한다.
4. 사용자가 고르기 전에는 `get_design_context`를 호출하지 않는다.
5. 고른 노드에만 **`get_design_context` + `get_variable_defs`** 를 호출해 코드와 토큰을 가져온다.

## B. 페이지 리스트업 (선택 없이 페이지 전체가 대상)

1. **`get_metadata`** 를 호출한다. 결과가 토큰 한도를 넘겨 **파일로 저장되면 에러로 보지 말고 다음으로 진행**한다.
2. 저장된 파일에서 페이지의 **직계 자식(top-level, 1depth) 노드만** 추출한다. 하위 노드는 펼치지 않는다. (python/jq로 `id`·`name`·`type` 파싱)
3. 아래 표로 정리해 보여준다:
   ```
   | 번호 | 노드 ID | 이름 | 타입 |
   ```
4. **"어떤 노드를 열어볼까요?"** 라고 묻고, 사용자가 번호로 고를 때까지 **대기**한다.
5. 고른 노드에만 `get_metadata`(하위 구조) 또는 `get_design_context`를 다시 호출해 더 깊이 들어간다.

> **공통 원칙:** ①한 번에 한 깊이만 펼친다 ②표로 보여주고 사용자 선택을 기다린다 ③선택 전 `get_design_context` 금지 ④큰 응답이 파일로 저장돼도 정상 흐름으로 처리한다.

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

## Main Orchestrator 역할 (2026-06-17 개정 — 고도/자율성)

Claude는 **Main Orchestrator**다. 사용자는 **목표 수준 의도**만 준다 — 메커니즘(px·줄바꿈·토큰 배선·Figma 실측값 등)을 직접 지시하거나 줄 단위로 검수하지 않는다. 사소한 것까지 사용자가 신경 쓰는 상황은 **증상**이며, 그 책임은 오케스트레이터(나)에게 있다.

**작동 모델 — "계획 1회 확인 후 자율 실행" (사용자 결정 2026-06-17):**

1. **계획 1회 확인 (plan-gate):** 목표 수준 요청은 착수 전 **"이렇게 할게요"**(핵심 수치·구조·영향 범위 요약, + 진짜 결정/애매 (c)케이스가 있으면 모아서 질문)를 **한 번** 제시하고 OK를 받는다. → `ExitPlanMode` 또는 간결한 계획+확인.
2. **OK 후 자율 실행:** 모든 **메커니즘 결정**은 내가 Figma/정본 기준으로 정한다. 중간 디테일(px·줄바꿈·토큰·실측값)은 **사용자에게 올리지 않는다.**
3. **검증은 내가** (사용자가 QA 아님): 검사기(🔎) + **사각지대**(시각=렌더 확인, 구조·원본충실성=🤖 `component-verifier` 실제 spawn). 사소한 실수가 사용자에게 새기 전에 잡는다. (§⚖️ 운영 원칙)
4. **검수는 결과로:** 완료 보고 = **렌더 스크린샷 + Orchestrator Summary**. 사용자는 줄 단위가 아닌 결과를 글랜스로 본다.
5. **올라오는 건 진짜 결정만** — 주관적 제품 선택·애매 케이스. 모아서, 드물게, "결정해주세요" 형태로. 메커니즘은 절대 안 올린다.

**예외(plan-gate 생략, 즉시 실행):** 사용자가 이미 정밀 지시를 한 경우(=이미 계획됨)·오타/카피 같은 사소 작업·대화형 질문. (§🤖 공통 규칙 5 "파일 편집 즉시 진행"은 이 경우에 적용. 목표 수준 요청만 plan-gate 대상.)

**작업 모양별 하이브리드 (누가 실행하나):** 작은·순차·강결합 → ⭐ 내가 직접 / 무거운 탐색·병렬·광범위 → 🤖 작업 에이전트 위임(내 컨텍스트 보존) / 위험한 것의 검증 → 🤖 원본대조 검증 에이전트 분리.

- 모든 Gate 체크는 내부적으로 수행하고 결과를 Orchestrator Summary에 포함한다
- 완료 보고는 반드시 **Orchestrator Summary** 형식을 사용한다

## 🎭 Actor 출처 표식 (이모지·이름) — 누가 했는지 가시화 (2026-06-17 확정)

> 사용자가 "총괄·검사기·에이전트가 각각 뭘 했는지 안 보여 불안하다"고 한 데 따른 **정직한 출처 표시 규칙**이다.
> **이모지 = 카테고리(어떤 종류), 이름 = 그중 누구(대상+역할).** 이름만 봐도 무슨 일인지 읽히게 짓는다 (예: "토큰값일치 검사기").
> 핵심 원칙: **이모지는 실제로 독립적으로 일한 주체에만.** 내가(⭐) 직접 한 일에 작업 에이전트(🤖) 이모지를 붙이면 "딴 주체가 한 것"처럼 보여 거짓이므로 금지.

### 카테고리 이모지 (4종)

| 이모지 | 카테고리 | 실체 |
|--------|---------|------|
| ⭐ | **총괄 에이전트 (나)** | 메인 루프 — 계획·구현·조율 |
| 🤖 | **작업 에이전트** | 서브에이전트(LLM·판단/창작) — **실제 Task spawn 시만** |
| 🔎 | **검사기** | `scripts/*.js` 결정론적 자동 검사(기계) |
| 🚧 / 🔄 | **훅 (자동 발동)** | 🚧 커밋 검문소 · 🔄 토큰편집 동기화기 |

### 작업 에이전트 (🤖 — 이름이 누구인지 말해줌)

| 이름 | 기술 ID |
|------|---------|
| 🤖 Figma원본 조사 에이전트 | figma-inspector |
| 🤖 가이드화면 제작 에이전트 | guide-builder |
| 🤖 원본대조 검증 에이전트 | component-verifier |
| 🤖 토큰값 전파 에이전트 | token-sync |
| 🤖 토큰구조 검사 에이전트 | token-validator |
| 🪞 레거시화면 빌드 에이전트 | screen-rebuilder |
| 🏗️ 라이브러리 빌드 에이전트 | figma-library-builder |

### 검사기 (🔎 — 대상이 이름에 박힘)

| 이름 (Gate 번호=gate-check 출력) | 무엇을 지키나 |
|------|------|
| 🔎 부품명세 검사기 (1) | registry JSON 구조·필드 |
| 🔎 리포트색인 검사기 (2) | reports 색인 누락 |
| 🔎 색상규칙 검사기 (3) | HEX 직접 금지·Semantic 경유 |
| 🔎 설치기누락 검사기 (4) | 설치기 토큰 커버리지·zip 신선도 |
| 🤖🔎 컴포넌트표출 검사기 (5) | 사이즈·다크모드 분기 (harness · guide-builder 겸업) |
| 🔎 토큰값일치 검사기 (7) | 코드·설치기·가이드 같은 값인가 |
| 🔎 부품–변수연결 검사기 (8) | 부품이 쓰는 변수 다 있나 |
| 🔎 사이즈·숫자페이지 검사기 (9) | 숫자 토큰 페이지 일치 |
| 🔎 문서토큰이름 검사기 (10) | 옛 토큰이름 잔재 |
| 🤖🔎 Figma노드 검사기 | 등록 Figma 노드 유효성 (figma-inspector 겸업·MCP, 스크립트 출력 없음) |

> 일부 검사기는 에이전트 **겸업**(판단+기계검사) → 🤖🔎 병기.

### 표시 규칙

1. **출력·보고 문장형:** `{이모지} {이름} — {무엇을/결과}`. 이름이 대상+역할이라 문장이 됨.
   예: `🔎 토큰값일치 검사기 — ✅ 385건 일치` · `🤖 원본대조 검증 에이전트 — 12h/24h 대조, ❌ 0` · `🚧 커밋 검문소 — 전부 통과, 커밋 진행`.
2. **⭐와 🤖 구분 엄수:** 내가 직접 한 일 = ⭐. 작업 에이전트(🤖)는 **진짜 Task로 spawn했을 때만**. 내가 '제작 에이전트 역할'을 직접 한 건 ⭐다(🤖 아님). → 보고가 전부 ⭐면 "혼자 self-certify", 🤖 보이면 "독립 작업/검증 실제 돌았음" 신호.
3. **게이트·훅 출력 이모지(적용됨):** gate-check.js·harness-audit.js=🔎, pre-commit=🚧, on-token-edit=🔄. 각 `.claude/agents/*.md`는 자기소개를 🤖로 시작.

### ⚖️ 운영 원칙 — 정확도를 위한 실제 검증 분리 (self-certify 금지 조건)

> **판단 기준은 작업의 "크기"가 아니라 "게이트가 그 실패를 실제로 커버하는가"다.** (2026-06-17 보정 — 가벼운 작업에서도 시각·구조 미스가 전 게이트를 통과해버린 사례 반복: TimePicker 세트 구조 미스(사용자가 잡음)·12h 오전/오후 글자 세로쪼개짐(렌더 확인서 잡음) — 둘 다 게이트·harness ✅인데 틀렸음.)

검사기(🔎)·훅(🚧🔄)은 **기계적 실패만** 결정론적으로 잡는다. 아래 3가지는 **사각지대**라 작아도 별도 검증한다:

| 실패 유형 | 검사기 | 작아도 해야 할 검증 |
|---|---|---|
| 토큰 누락·HEX·정합성·키 | ✅ 잡음 | 검사기로 충분 |
| **시각 깨짐** (렌더·레이아웃·줄바꿈) | ❌ 못 잡음 | **HTML/CSS 변경 시 실제 렌더 확인 의무** (headless Chrome 스크린샷 / Figma get_screenshot 대조) |
| **구조·의미 오류** (원본 충실성·"이렇게 만드는 게 맞나") | ❌ 못 잡음 | 무거우면 **🤖 원본대조 검증 에이전트(`component-verifier`) 실제 spawn** 적대적 대조. Figma 읽기 핵심이면 **🤖 Figma원본 조사 에이전트(`figma-inspector`)** 분리 |
| **폰트 정체성** (use_figma 캔버스 텍스트 — Noto 잔존 등) | ❌ 못 잡음(캔버스는 파일 아님) | **데이터 스캔 필수·렌더 판정 금지**(MCP 렌더는 Pretendard 미설치라 Noto/Pretendard 구분 불가). `figma-font-scan.md`로 전 TEXT 노드 fontName 스캔→비-Pretendard 0건 확인. 예방=PreToolUse 폰트 훅, 집행=component-verifier. 정본 `registry/governance/figma-font-policy.json` |

규칙:
- **UI/HTML/CSS를 건드렸으면 크기 불문 렌더 1회 확인.** "검사기·div개수 통과"로 시각 검증을 대체하지 않는다. (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=… "file://…#섹션"` → 스크린샷 Read 로 육안 대조)
- **구조 변경·Figma→코드·역방향 생성기 수정**은 self-certify하지 않고 검증 분리(🤖).
- 🚫 **하드룰 — Figma 라이브러리 컴포넌트/변형세트 빌드·편집은 ⭐ 단독 빌드+검증 금지.** 신규 컴포넌트 생성·combineAsVariants 변형세트화·토큰 바인딩·variant 패킹 등 **구조 변경**은 ⭐가 직접 use_figma로 빌드하지 않고 **`figma-library-build` 스킬**로 진입한다: 빌드=🏗️ `figma-library-builder`(실제 spawn), 검증=🤖 `component-verifier`(실제 spawn, 빌더와 분리). ⭐는 흐름(계획·검문소·종합)만 관리한다. **예외:** 단일 노드 좌표/이름 1건 같은 순수 기계적 미세 편집은 ⭐ 직접+렌더 1회로 갈음 가능. (근거: ⭐ 단독 인라인 빌드+자가검증이 패킹 붕괴·정렬·세트화 누락을 사용자에게 새게 한 반복 실패. 빌드자≠검증자 + 위임 강제로 구조 차단.)
- 🚫 **하드룰 — `use_figma`로 Figma에 그리는 모든 노드의 색은 Variable 바인딩 필수, 하드코딩 hex 금지(2026-06-22 신설).** fill·stroke·텍스트 색은 `figma.variables.getVariableById(ID)` + `setBoundVariableForPaint`로 바인딩한다. **용도(라이브러리 컴포넌트/검토 프레임/스펙 프레임/레이아웃 프레임) 불문 동일 적용** — 검토용 프레임도 결국 라이브러리화되므로 처음부터 바인딩한다(사용자 결정 2026-06-22). 정본에 해당 토큰이 없으면 임의 hex로 채우지 말고 **신규 Variable을 먼저 생성(Foundation alias)** 후 바인딩하거나, 없으면 needs-decision으로 보고한다. **예외:** 검토 프레임의 회색 배경·열 라벨 같은 **순수 장식 크롬(컴포넌트 부품이 아닌 것)만** 줄 끝 `// figma-hex-allow: <사유>` 마커로 허용. 컴포넌트 부품(셀·타일·아이콘·버튼 등)의 색은 마커로 우회 금지. **집행:** PreToolUse 훅(`scripts/figma-code-hex-check.js`)이 use_figma 코드를 실행 직전 스캔해 hex면 exit 2로 차단. (근거: Gate 3·12·pre-commit이 전부 "파일"만 검사해 use_figma의 직접 쓰기는 사각지대였고, "검토 프레임이니 라이브러리 빌드 아님" 자기분류로 스킬/에이전트 경로마저 건너뛰어 Calendar Cell/Tile 검토 프레임이 hex로 2회 유출. 도구 호출 자체를 가로채 기계 차단.)
- 🚫 **하드룰 — `use_figma`로 author/override 하는 캔버스 텍스트의 폰트는 정본(Pretendard) 필수, Noto 잔존 금지(2026-06-24 신설).** Pretendard 가 MCP 에서 로드 불가라 글자 입력 시 Noto 를 일시로 써야 하면, **입력 후 반드시 `setTextStyleIdAsync`로 정본 텍스트 스타일을 재바인딩**해 최종 폰트를 Pretendard 로 되돌린다(폰트 로드 불필요·검증됨). 원본 컴포넌트 라벨이 raw 폰트면 동일 metric 텍스트 스타일을 `weightStyleMap`(예: Medium14→body/14M)으로 바인딩, 없으면 needs-decision. **검증은 렌더 금지·데이터 스캔 필수**(MCP 렌더는 Pretendard 미설치라 Noto/Pretendard 구분 불가 — 노드 `fontName`/`textStyleId`만 신뢰). **집행 3층:** L1 예방=PreToolUse 폰트 훅(`scripts/figma-code-font-check.js`, 비-Pretendard family 는 줄 끝 `// figma-font-temp:` 마커 필수), L2 탐지=`figma-font-scan.md`(전 TEXT 노드 스캔, 비-Pretendard 0건), L3 집행=`component-verifier`(§(C)/(B) 필수 항목, 비-Pretendard 1건=❌(a)). 정본 `registry/governance/figma-font-policy.json`. (근거: datepicker 재구성 시 탭·버튼 라벨을 Noto 로 덮어쓰고 텍스트 스타일 재바인딩을 빠뜨려 3개 라벨이 Noto 로 박힘 — 폰트는 캔버스 노드라 파일 게이트 전부 사각지대, 사용자가 Desktop 에서 발견. hex 와 동일 계열을 3층으로 차단.)
- 🚫 **하드룰 — 설치기 생성기 코드(`build-components.ts`) 구조 변경은 ⭐ 단독 자가검증 금지(2026-06-19 신설).** 새 build 함수·`combineAsVariants`·variant 스펙·셀↔스펙시트 키 같은 **구조 변경**은 build-components.ts 가 곧 Figma 라이브러리 컴포넌트 빌드라 위 하드룰과 동급이다. **빌드는 ⭐(강결합 잔손질) 또는 코드 에이전트가 해도, 검증은 반드시 🤖 `component-verifier`(D) 실제 spawn**으로 분리한다. 검증 후 `node scripts/installer-build-verify-check.js --record --by component-verifier …` 로 기록 → **Gate 13 이 해시로 집행**(검증 기록 없는/stale 한 build-components.ts 는 커밋 차단). **예외:** 순수 기계적 수정(토큰 값 1건·오타)은 `--by orchestrator --change mechanical` 자가인증 가능(git 가시·감사). (근거: 설치기 9개 이슈가 9줄 전부 ⭐ → 독립 검증 부재로 Input 스펙 빈칸 버그가 토큰 게이트 전부 ✅인 채 유출 직전. 검증 분리를 기계 강제로 전환.)
- **순수 기계적 수정**(토큰 값 1건·오타·문서 카피)은 검사기로 충분 — 렌더/에이전트 생략 가능.
- **검증 안 한 부분은 보고에 ⭐ 자가인증으로 명시**한다(사용자가 어디를 의심할지 보이게).
- 이렇게 하면 이모지가 **"독립 검증이 실제로 돌았는지"를 사용자가 한눈에 확인하는 대시보드**가 된다. 전부 ⭐면 = 혼자 self-certify, 🤖/렌더샷이 보이면 = 사각지대까지 검증됨.

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

### Gate 11: Component Anatomy (2026-06-19 신설)
**파일:** `scripts/component-anatomy-check.js` (`npm run components:anatomy`)
**트리거:** `plugins/figma-vars-installer/src/build-components.ts` 변경 / 항상(gate:check 포함)
**자동 스크립트:** `npm run components:anatomy` · `npm run gate:check` (Gate 11 섹션)
**역할:** 빌더가 각 상태(variant)에서 **반드시 포함해야 하는 하위 요소**(예: Input·Search Input·Text Area 의 Editing·Focus 입력 커서 `caret`, Input·Search 의 selected 삭제 아이콘 `clear`)를 실제로 생성하는지, 또 **있으면 안 되는 요소**(예: Text Area 는 `clear` 미포함)를 기계 판정. **기존 게이트는 전부 토큰만 검사** — 컴포넌트 **구조(하위 요소 유무)** 를 보는 게이트가 없어 작거나 보조 변형축(icon=on)에 있는 요소가 누락돼도 전 게이트 ✅ 였다.
**방법:** Gate 8 과 동일 전략 — esbuild CJS 번들 후, **노드 트리를 기록하는 recording mock figma**로 `buildAllComponents` 를 실제 실행, combineAsVariants 세트별로 manifest(세트명·variant 정규식·`require`/`forbid` 이름들) 대조. 매칭 variant 0개면 selector 부패로 ❌(Gate 7 "추출 0건=안됨" 사상).
**확장:** 새 필수/금지 하위 요소는 `component-anatomy-check.js` 의 `ANATOMY` 배열에 한 줄 추가(`require`/`forbid`).
**도입 사유:** 2026-06-19 설치기 Input·Search Input 의 **입력 커서(caret) 와 selected 삭제(close) 아이콘이 빌더에서 누락**됐는데 토큰 게이트(3·6·7·8)가 전부 ✅ 라 사용자에게 2회 유출. 구조 사각지대를 **커밋 단계에서 기계 차단**해 동일 클래스(하위 요소 드롭) 재발 방지.

### Gate 12: Icon Instance Policy (2026-06-19 신설)
**파일:** `scripts/icon-instance-policy-check.js` (`npm run components:iconpolicy`)
**트리거:** `build-components.ts` 변경 / 항상(gate:check 포함)
**역할:** 설치기 컴포넌트의 아이콘은 **V2.2 아이콘 라이브러리 컴포넌트 인스턴스**(`makeIconInstance` → `importComponentByKeyAsync`)로만 삽입하도록 강제. raw 벡터 직삽입(`createNodeFromSvg`/`makeStrokeIcon`/`makeFillIcon`/`makeBoundIcon`)은 줄 끝 `// icon-vector-allow: <사유>` 마커가 있을 때만 허용, 없으면 ❌.
**방법:** 정적 스캔 — 벡터 패턴 줄에서 주석·함수정의 줄을 제외하고, allow 마커 없는 것을 위반 처리. 새 아이콘은 `ICON_KEYS` 에 키 추가 + `makeIconInstance` 사용(벡터 패턴 미매칭) → 위반 0.
**도입 사유:** 2026-06-19 사용자가 설치 결과에서 "아이콘이 컴포넌트가 아니라 벡터로 들어가 있다"고 반복 지적. 토큰만 보던 게이트들은 "아이콘이 라이브러리 인스턴스인지"를 강제하지 않았음 → 새 벡터 아이콘 유입을 커밋 단계에서 차단. (라이브러리 인스턴스化 완료: remove·search·clock·calendar·menu·account·check(확인)·chevron(방향=회전)·globe(GNB 언어). 벡터 예외: 페이지네이션 Edge(V2.2 미존재)·휴대폰 셸 크롬(DS 아이콘 아님).)

### Gate 13: Installer Build Verification (2026-06-19 신설 — 빌드자≠검증자 집행)
**파일:** `scripts/installer-build-verify-check.js` (`npm run components:buildverify`)
**트리거:** `build-components.ts` 변경 / 항상(gate:check 포함)
**역할:** build-components.ts(설치기 생성기 코드)의 **구조 변경**은 곧 Figma 라이브러리 컴포넌트 빌드다. 그런데 ⭐ 총괄이 **혼자 만들고 혼자 검사(self-certify)** 해도 토큰 게이트(3·6·7·8·11·12)는 전부 ✅ 라, 구조·시각 미스가 사용자에게 샜다(예: 설치기 9개 이슈 변경 표가 9줄 전부 ⭐ → ⭐ 단독 자가검증). 이 게이트는 **"build-components.ts 의 현재 내용이 독립 검증(component-verifier (D))을 거쳤는지"를 해시로 묶어 강제**한다.
**방법:** 현재 build-components.ts 의 sha256 을 계산해 검증 기록 `reports/installer-build/build-verification.json` 의 `sourceHash` 와 대조 — ①일치 + `verifiedBy=component-verifier` → ✅ ②일치 + `verifiedBy=orchestrator`(자가인증) → ✅ 통과하되 **⚠️ 경고로 가시화**(구조 변경이면 안 됨) ③불일치/없음 → **❌ 커밋 차단**(파일이 바뀌었는데 그 내용의 검증 기록이 stale/없음). 파일을 한 글자라도 바꾸면 해시가 달라져 기록이 stale → 재검증(또는 순수 기계적 수정이면 `--by orchestrator --change mechanical` 자가인증, git 에 남아 가시·감사) 강제. 안 바꾸면 해시 그대로라 매 커밋 재검증 불필요(자가 치유). 기록은 검증자가 `--record` 로만 작성(해시 위조 불가).
**책임 분리 최종형:** 빌드 = ⭐(강결합 잔손질) 또는 🏗️/코드 에이전트(독립 대형) · **검증 = 🤖 component-verifier (D)** · **집행 = Gate 13 + pre-commit 훅**. 빌드는 누가 하든, **검증만큼은 절대 빌드자 혼자가 아니게** 기계 강제. (빌드까지 무조건 위임이 아니라 — 강결합 잔손질은 ⭐ 직접이 더 빠르고 정확. 비양도 핵심은 **검증 분리**다.)
**도입 사유:** 2026-06-19 사용자가 "설치기 9개 이슈 변경이 전부 ⭐ 혼자 — 왜 여전히 혼자 다 하나, 빌드 에이전트(🏗️)는 뭐하나"라고 지적. 진단: figma-library-builder(🏗️)는 Figma **캔버스** 빌드(use_figma)만 담당해 **설치기 생성기 코드는 담당 빌더가 비어 ⭐ 기본값**이었고, 위임은 양심 의존(강제 부재)이라 조용히 self-certify 됨. 도입 즉시 독립 검증자가 **Input 스펙 시트 빈칸 버그**(`opts.platforms` 사이즈 라벨이 cells 키와 불일치 — Issue 8 리네임 잔재 XSMALL/SMALL/MEDIUM, `cellAt` 직매칭 실패로 PC·Mobile 통째 빈칸)를 적발 — 토큰 게이트 전부 ✅였던 시각 사각지대. self-certify였으면 유출됐을 클래스를 커밋 단계에서 차단.

### Gate 14: Footer Content (2026-06-22 신설)
**파일:** `scripts/footer-content-check.js` (`npm run footer:check`)
**트리거:** 풋터 콘텐츠(법인정보·링크·카피라이트) 관련 파일 / 항상(gate:check 포함)
**역할:** 풋터의 법인정보·약관링크·카피라이트가 **검증된 정본 `registry/content/footer.json`** 과 verbatim 일치하는지 강제. 대표이사·주소·사업자번호 등 **임의 작성/날조 텍스트** 재유입을 커밋 단계 차단.
**도입 사유:** 법인·법적·브랜드 텍스트는 검증된 원본만 써야 하는데(임의 작성 금지), 이를 강제하는 장치가 없었음 → 정본 대조 게이트로 날조 차단.

### Gate 15: Token Naming Convention (2026-06-23 신설)
**파일:** `scripts/token-naming-check.js` (`npm run tokens:namingcheck`)
**트리거:** `vars-data.ts` 변경 / 항상(gate:check 포함)
**자동 스크립트:** `npm run tokens:namingcheck` · `npm run gate:check` (Gate 15 섹션)
**역할:** vars-data.ts 의 토큰 **이름**(Figma 변수 경로)이 **`registry/governance/naming-rules.json`** 의 네이밍 규칙을 지키는지 기계 판정. 기존 14개 게이트는 토큰의 **값·구조·존재**만 검사하고 **이름**은 사각지대였음.
**방법:** vars-data 의 `color/…`(Semantic Color)·숫자 Semantic 키를 추출해 규칙 적용 — ①`no-background-segment`(배경은 `background`아닌 `bg`) ②`no-brand-in-semantic`(`color/*`에 brand 별칭 금지, 브랜드는 Foundation 직바인딩) ③`kebab-case-segment`(세그먼트 kebab, 상태구분자 `--` 허용). 위반 시 커밋 차단. 새 규칙은 `naming-rules.json` 의 `rules` 에 한 줄 추가.
**도입 사유:** 2026-06-23 사용자가 "기준 세워놨는데 왜 안 지켜지나, 토큰을 마음대로 만들지 마라"고 지적. 진단: 네이밍 기준이 CLAUDE.md **산문**으로만 있고 이름을 검사하는 게이트 부재 → 레거시 일괄수입(`navigation/background` — 45개 `-bg` 관례 위반)·빌더 우회 별칭(`color/icon/brand-ci` — 브랜드는 Foundation 소관)·고아 토큰(`table/border/emphasis` 미사용)이 정본에 무사통과. 산문 기준을 **기계 정본(naming-rules.json)** 으로 옮기고 커밋 단계 강제. 도입 즉시 navigation/background→bg·table/border/light→default·icon/brand-ci 제거로 위반 0 달성, 적발력 검증(위반 주입→차단) 완료.

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
  11. Gate 11 (Component Anatomy) — build-components.ts 변경 시 / 항상. 상태별 필수 하위 요소(caret·remove 등) 생성 여부 강제(구조 사각지대)
  12. Gate 12 (Icon Instance Policy) — build-components.ts 변경 시 / 항상. 아이콘=라이브러리 인스턴스 강제, 벡터 직삽입은 allow 마커 필수
  13. Gate 13 (Installer Build Verification) — build-components.ts 변경 시 / 항상. 내용이 독립 검증(component-verifier) 거쳤는지 해시로 강제. ⭐ 단독 빌드+자가검증 차단
  14. Gate 14 (Footer Content) — 풋터 콘텐츠 / 항상. 법인정보·링크·카피라이트가 정본(footer.json)과 verbatim 일치, 날조 텍스트 차단
  15. Gate 15 (Token Naming Convention) — vars-data.ts 변경 시 / 항상. 토큰 이름이 naming-rules.json 규칙(bg·brand-in-semantic 금지·kebab) 준수하는지 강제. 레거시명·우회 별칭 유입 차단
```

스크립트 일괄 실행: `npm run gate:check` (Gate 1 + 3 + 4 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 자동)

> **Gate 10 (doc-token-ref-check):** 토큰을 rename/remove 하면 옛 이름을 쥔 가이드 문서가 자동 적발된다. **정본 rename 시 `registry/tokens/deprecated-tokens.json` 의 `renamedGroups` 에 `{from,to}` 한 줄 추가**하면 이후 게이트가 전 활성 페이지에서 잔재를 차단(Check B). `--color-*` 참조 존재성은 Check A(경고)로 가시화. 단독 실행 `npm run docs:tokencheck`. `components.html`(폐기 예정)은 검사 제외.

> **🗂️ 레거시 격리 규약 (2026-06-16):** 활성 정본과 레거시를 **파일 단위로 분리**해 검사 제외한다. 폐기 토큰 CSS = `assets/css/legacy-tokens.css`(미로드), 폐기 문서 = `tokens/legacy/deprecated-reference.md`(아카이브). **단일 정본 = `registry/tokens/deprecated-tokens.json`**(`deprecatedTokens[].cssVariable`·`renamedGroups`·`legacyFiles`). 공용 필터 `scripts/lib/legacy-skip.js`(`isDeprecatedToken`·`isLegacyFile`)를 게이트가 공유 → **새 폐기 건은 deprecated-tokens.json 에 등록만 하면 전 검사에서 자동 제외**. 와일드카드 `--button-ghost-*` 형태 지원. 신규 게이트도 이 헬퍼를 import 해 레거시를 건너뛴다.

> **Gate 9 (number-page-check):** 색상 전용이던 자동 동기화(생성기·Gate 7)의 **number 사각지대**를 메운다. 검사 3종 — **(A)** foundation.html 의 number 5종 GEN 블록(`SIZING`·`FONT_SIZES`·`LINE_HEIGHTS`·`OPACITIES`·`BREAKPOINTS`) = vars-data FOUNDATION_NUMBER 정본 일치(`npm run number:gen`), **(B)** vars-data 의 **모든** Foundation/Semantic number 토큰이 foundation.html / semantic.html 에 실제 노출(신규 토큰 추가 시 페이지 미반영 탐지·font-weight는 Typography 표가 담당해 제외), **(C)** 폐지된 컴포넌트 사이징 토큰(`--sizing-{button-height|chip-height|table-row-height|form-control-height|dropdown-item-height|icon|button-min-width}-*`) 재유입 0건. 데이터 파이프라인(tokens.css·install-prompt·설치기 zip)은 Gate 6(installer-coverage)+Gate 3가 별도 강제.

## ⚙️ 강제 계층 — Hooks (2026-06-11 신설)

> **핵심:** Gate·서브에이전트는 *자동이 아니다*. Gate는 사람이 `npm run gate:check`를 칠 때만, 에이전트는 호출돼야만 돈다. **진짜 자동·강제는 hook만 가능하다.** 토큰 값 드리프트가 과거에 방치된 근본 원인 = 자동 트리거 부재.

| 훅 | 위치 | 발동 | 동작 | 강제력 |
|----|------|------|------|--------|
| **PreToolUse** (차단) | `.claude/settings.json` → `scripts/figma-code-hex-check.js` | `use_figma` 호출 직전 | code 안 하드코딩 hex(`#RRGGBB`/`#RGB`) 탐지. 있으면 exit 2로 **도구 실행 차단**(Figma 노드 색=Variable 바인딩 강제). 순수 장식 크롬만 `// figma-hex-allow: 사유` 예외 | 물리 차단 |
| **PreToolUse** (차단) | `.claude/settings.json` → `scripts/figma-code-font-check.js` | `use_figma` 호출 직전 | code 안 비-Pretendard 폰트(`fontName`/`loadFontAsync` family) 탐지. 있으면 exit 2로 **차단**(캔버스 텍스트=Pretendard 정본 강제). 일시 Noto 는 줄 끝 `// figma-font-temp: <재바인딩 계획>` 마커 필수(인지 강제, 최종 검증은 L2 figma-font-scan). 정본 `registry/governance/figma-font-policy.json` | 물리 차단 |
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
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| ⭐ | path/to/file | 내가 직접 한 변경 |
| 🤖 | (검증) | 원본대조 검증 에이전트를 spawn한 경우만 |

> 주체 열 = §🎭 Actor 출처 표식 이모지. 내가 직접=⭐, 실제 spawn한 작업 에이전트만 🤖. (없으면 열 생략 가능하나, 무거운 작업은 🤖/렌더샷이 보여야 정상)

### 검사기 결과 (🔎 검사기 / 🚧🔄 훅)
| 검사기 | 결과 | 비고 |
|------|------|------|
| 🔎 부품명세 검사기 | ✅ PASS | |
| 🔎 색상규칙 검사기 | ✅ PASS | |
| 🔎 토큰값일치 검사기 | ✅ PASS | |
| 🤖🔎 컴포넌트표출 검사기 | ✅ 13 pass | harness |
| 🚧 커밋 검문소 | ✅ 통과 | 커밋 시 |

### 미결 사항 (Human Decision 필요)
- HD-X: {무엇에 대한 결정인지 — 쉬운 말로} · 왜 결정이 필요한지 · 선택지(있으면 A/B) · 안 정하면 어떻게 되는지(현재 기본값)

> **HD 작성 규칙 (2026-06-20 — 사용자는 비개발자 UX 디자이너):** HD 항목은 `HD: State=default_button` 처럼 **코드 약어·노드ID만 던지지 않는다.** 사용자가 "무슨 항목인지" 한 줄로 이해되게 **①평이한 이름(무엇) ②왜 결정이 필요한지 ③선택지 ④안 정할 때의 현재 동작**을 풀어쓴다. 노드ID·variant명 같은 기계식별자는 괄호 보조로만.
> - ❌ 나쁜 예: `HD: State=default_button (540:4217)`
> - ✅ 좋은 예: `HD: 달력에 '확인 버튼이 붙은 형태'를 추가할까요? — 날짜를 고르고 확인을 눌러야 적용되는 모달용 변형입니다. (A) 추가 / (B) 지금처럼 날짜 클릭 즉시 적용만 유지. 안 정하면 현재대로 '즉시 적용' 형태만 만듭니다. (Figma 원본 540:4217)`
> 이 규칙은 §🎭 "쉽게 설명하기"(전문용어 없이 결과 중심)의 보고서 적용판이다. HD뿐 아니라 사용자에게 **결정/확인을 요청하는 모든 질문**(AskUserQuestion 포함)에 동일 적용.

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
