# Gate 정의 · 실행 순서 (참조 문서)

> CLAUDE.md 본문에서 분리한 **참조 전용** 문서다. Gate 상세 정의와 실행 순서 전문을 담는다.
> 본문에는 Gate 번호·이름 요약표와 이 파일 포인터만 둔다. **Gate 작업(신설/수정/디버깅) 시 이 파일을 먼저 Read** 한다.
> 정본 강제는 `npm run gate:check`(= `scripts/gate-check.js`)가 수행하므로, 이 정의문을 매 세션 로드할 필요는 없다.

---

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

### Gate 14: Verified Content / 원본대조 문구 (2026-06-22 신설 footer · 2026-06-25 일반화)
**파일:** `scripts/content-verbatim-check.js` (`npm run content:check`)
**트리거:** 검증된 고정 문구(법인정보·약관·브랜드 등) 관련 파일 / 항상(gate:check 포함)
**역할:** **풋터에 국한하지 않고** 모든 '검증된 고정 문구'가 정해진 위치(`appearsIn`)에 원본 그대로 들어갔는지 강제. 정본 = `registry/content/*.json`(각 파일이 하나의 '검증된 콘텐츠 블록' — `appearsIn`·`verbatim`(또는 풋터 호환 `links`/`companyInfo`/`copyright`)·`forbiddenFragments`). 임의 작성/날조 텍스트(대표이사·주소 등) 재유입을 커밋 단계 차단.
**확장:** 새 검증 문구는 **검사기 추가 없이** `registry/content/` 에 json 한 개만 더하면 자동 검사. (풋터 전용에서 일반화한 이유 = 컴포넌트/표면마다 검사기가 늘어나는 것을 막기 위함 — 2026-06-25 사용자 결정.)
**도입 사유:** 법인·법적·브랜드 텍스트는 검증된 원본만 써야 하는데(임의 작성 금지), 이를 강제하는 장치가 없었음 → 정본 대조 게이트로 날조 차단. 풋터 전용으로 신설했으나 원리(원본 대조)가 모든 고정 문구에 적용돼야 해 일반화.

### Gate 15: Token Naming Convention (2026-06-23 신설)
**파일:** `scripts/token-naming-check.js` (`npm run tokens:namingcheck`)
**트리거:** `vars-data.ts` 변경 / 항상(gate:check 포함)
**자동 스크립트:** `npm run tokens:namingcheck` · `npm run gate:check` (Gate 15 섹션)
**역할:** vars-data.ts 의 토큰 **이름**(Figma 변수 경로)이 **`registry/governance/naming-rules.json`** 의 네이밍 규칙을 지키는지 기계 판정. 기존 14개 게이트는 토큰의 **값·구조·존재**만 검사하고 **이름**은 사각지대였음.
**방법:** vars-data 의 `color/…`(Semantic Color)·숫자 Semantic 키를 추출해 규칙 적용 — ①`no-background-segment`(배경은 `background`아닌 `bg`) ②`no-brand-in-semantic`(`color/*`에 brand 별칭 금지, 브랜드는 Foundation 직바인딩) ③`kebab-case-segment`(세그먼트 kebab, 상태구분자 `--` 허용). 위반 시 커밋 차단. 새 규칙은 `naming-rules.json` 의 `rules` 에 한 줄 추가.
**도입 사유:** 2026-06-23 사용자가 "기준 세워놨는데 왜 안 지켜지나, 토큰을 마음대로 만들지 마라"고 지적. 진단: 네이밍 기준이 CLAUDE.md **산문**으로만 있고 이름을 검사하는 게이트 부재 → 레거시 일괄수입(`navigation/background` — 45개 `-bg` 관례 위반)·빌더 우회 별칭(`color/icon/brand-ci` — 브랜드는 Foundation 소관)·고아 토큰(`table/border/emphasis` 미사용)이 정본에 무사통과. 산문 기준을 **기계 정본(naming-rules.json)** 으로 옮기고 커밋 단계 강제. 도입 즉시 navigation/background→bg·table/border/light→default·icon/brand-ci 제거로 위반 0 달성, 적발력 검증(위반 주입→차단) 완료.

### Gate 16: Component Origin Verification (2026-06-25 신설 — 탭 사태 재발 방지)
**파일:** `scripts/component-origin-gate-check.js` (`npm run origin:check`)
**트리거:** `registry/governance/update-management.json`·`registry/components|patterns/*.json` 변경 / 항상(gate:check 포함)
**역할:** 「업데이트 관리」의 **origin 분류**(Ⓐ 정리완료 / Ⓑ 원본틀 필요 / tbd)를 기준으로, **Ⓑ인데 "완료 표시(codeStatus=implemented/done)"이면서 원본 대조 안 됨(verify=none)** 인 컴포넌트를 커밋 단계 차단. registry 신규 컴포넌트가 분류표에 **미등록(미분류 escape)** 이어도 차단. 정본 = `registry/governance/update-management.json`(생성기 `gen-update-management.js` → `pages/update-management.html` System 메뉴와 동일 데이터).
**설계(마비 방지 계단식):** ❌차단 = 미분류 escape · 잘못된 origin/verify · **Ⓑ+완료표시+verify=none**(탭 클래스). ⚠️경고(차단 안 함) = Ⓑ+verify=legacy(옛 방식, 새 방식 재검증 권장)·Ⓑ+harness구현+verify=none·tbd 미정. → **미완성 Ⓑ 백로그(skeleton/not-started)는 통과**해 병렬 작업 마비 방지, **새로 만들거나 '완료'로 바꾸는 순간** 원본 대조 강제.
**한계(v1):** verify=new 가 이후 빌드 변경으로 stale 되는 것은 아직 해시로 잡지 않음(Gate 13 식 잠금은 후속). Ⓑ 컴포넌트를 다시 손대면 verify 수동 갱신.
**도입 사유:** 2026-06-24~25 사용자가 준 원본(`tab` 540:6032)과 빌드가 선두께·높이·글자가 다른데 전 게이트 ✅로 통과(검증 절차 신설 6/18 이전 제작·원본 대조 부재). 진단: ①빌드/검증을 분리해도 **검증자가 원본이 아니라 빌더 계획/메모와 대조**했고 ②그 절차를 **건너뛸 수 있었으며** ③**Figma 실물↔정본 대조 게이트가 0개**였음. origin 분류를 기계 입력으로 삼아 "Ⓑ인데 미검증 출고"를 커밋 차단. 적대적 테스트(Ⓑ+완료+none 주입→차단) 통과.

### Gate 17: Orphan Token (2026-06-30 신설)
**파일:** `scripts/orphan-token-check.js` (`npm run tokens:orphans`)
**트리거:** vars-data·build-components·registry/components|patterns·웹CSS 변경 / 항상(gate:check 포함)
**역할:** "이 semantic color 토큰이 실제로 어디서든 쓰이나?"를 **전 표면 결정론 검사**(빌더 mock + 웹CSS + registry spec). orphan = 셋 다 안 씀. 의도보존분(`registry/governance/intentional-unused-tokens.json`, 사유 포함)은 면제. 예상밖 orphan·stale allow = 경고(비차단).
**도입 사유:** "이 토큰 어디서 쓰나"를 손 grep으로 단정하다 사각지대로 오판(거짓 단정)이 반복돼, 기계가 답하도록 게이트화(사용자 지적). 레거시 토큰 누적도 가시화.

### Gate 18: Component Page Coverage (2026-06-30 신설 — 설치기↔HTML 연동)
**파일:** `scripts/component-page-coverage-check.js` (`npm run components:pagecheck`)
**트리거:** `build-components.ts`·`pages/components-new.html`·`registry/governance/component-page-coverage.json` 변경 / 항상(gate:check 포함)
**역할:** **설치기 = 기준.** 설치기 `COMPONENT_CATEGORIES_GRID`(정본)의 모든 컴포넌트를 esbuild+require로 추출해, components-new.html의 섹션/comp-nav와 대조. 각 컴포넌트는 `component-page-coverage.json`의 `sectionFor`(HTML 섹션 있어야) 또는 `noSectionNeeded`(Platform shell·요소 컴포넌트 등, 사유)로 분류돼야 함.
**판정:** ❌차단 = 미분류(설치기 신규 컴포넌트가 둘 다 없음)·섹션누락(sectionFor가 가리키는 id·nav 부재). ⚠️경고 = 고아 섹션·stale config. → 설치기에 컴포넌트 추가 시 HTML 반영을 강제, "HTML에 빠진 컴포넌트"를 손으로 안 찾게.
**도입 사유:** 토큰 값 정합(Gate 6·7·8·10)은 촘촘했으나 **"설치기 컴포넌트 ↔ HTML 페이지 커버리지" 대조 장치가 0개**라 Multi Toggle·Dropdown 누락이 손으로 발견됨. 손작업을 기계로 승격(사용자 요청). 적대적 테스트(매핑 제거→미분류 차단) 통과.

### Gate 19: Variant/State Coverage (2026-06-30 신설 — Level 2)
**파일:** `scripts/variant-coverage-check.js` (`npm run components:variantcov`)
**트리거:** `build-components.ts`·`pages/components-new.html`·`component-page-coverage.json` 변경 / 항상(gate:check 포함)
**역할:** Gate 18(섹션 존재)의 다음 층 — **각 HTML 섹션이 설치기 변형의 상태(State 축)를 다 보여주나**. 정본 = 설치기 변형(esbuild+recording mock 으로 실측)의 `State=` 값. 섹션이 `data-cov-states="default,hover,…"` 로 **자기 커버리지를 선언(opt-in)** 하면 설치기 State ⊆ 선언 인지 대조. 상태 정본이 요소 컴포넌트에 있는 예외(Multi Toggle→Multi Toggle Element, Dropdown→Dropdown List)는 `stateSource` 매핑.
**판정:** ❌차단 = 선언 섹션인데 설치기 State 누락. ℹ️경고 = **미계측 섹션(data-cov-states 미선언)** — 차단 아님, **갯수 명시**.
**★ 예방 원리(겉핥기·거짓 단정 차단):** 검사기가 **"몇 섹션 검증·몇 섹션 미계측"을 스스로 선언**한다. 옵트인 안 한 섹션은 '미계측'으로 정직 보고돼, 나도 기계도 "다 됐다"는 **거짓 완전성을 구조적으로 못 만든다**(Gate 17 '추출 0건=안됨' 사상의 확장). 계측은 섹션마다 점진 확대.

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
  10. Gate 10 (Doc Token Reference Drift) — 가이드/레퍼런스 HTML(ai-snippets·guide-md 등) 토큰 참조 / 항상. Check B(rename denylist 잔재)=차단 · Check A(미정의 --color-* 참조)=경고 · Check C(폐기·삭제 토큰이 활성 페이지 재유입 + Token Details 값칸 '(none)/미정의' 유령행)=차단 — 삭제한 사양(예: --button-*-focus-ring)이 문서 사본에서 되살아나는 것 방지
  11. Gate 11 (Component Anatomy) — build-components.ts 변경 시 / 항상. 상태별 필수 하위 요소(caret·remove 등) 생성 여부 강제(구조 사각지대)
  12. Gate 12 (Icon Instance Policy) — build-components.ts 변경 시 / 항상. 아이콘=라이브러리 인스턴스 강제, 벡터 직삽입은 allow 마커 필수
  13. Gate 13 (Installer Build Verification) — build-components.ts 변경 시 / 항상. 내용이 독립 검증(component-verifier) 거쳤는지 해시로 강제. ⭐ 단독 빌드+자가검증 차단
  14. Gate 14 (Verified Content / 원본대조 문구) — 검증된 고정 문구 / 항상. 법인정보·약관·브랜드 등이 정본(registry/content/*.json)과 verbatim 일치, 날조 텍스트 차단 (풋터 포함 일반화)
  15. Gate 15 (Token Naming Convention) — vars-data.ts 변경 시 / 항상. 토큰 이름이 naming-rules.json 규칙(bg·brand-in-semantic 금지·kebab) 준수하는지 강제. 레거시명·우회 별칭 유입 차단
  16. Gate 16 (Component Origin Verification) — update-management.json·registry/components|patterns 변경 시 / 항상. Ⓑ(원본틀 필요)인데 완료표시+원본대조 0(verify=none)이면 차단·미분류 escape 차단. 미완성 Ⓑ 백로그는 통과(마비 방지). 탭 사태 재발 방지
  17. Gate 17 (Orphan Token) — vars-data·build-components·registry/components|patterns·웹CSS 변경 시 / 항상. 빌더(mock)+웹CSS+registry spec 전 표면에서 안 쓰이는 semantic color 토큰(orphan)을 결정론 검사해 레거시 누적 가시화. 의도보존분=`registry/governance/intentional-unused-tokens.json` 면제, 예상밖 orphan·stale allow=경고(비차단). "이 토큰 어디서 쓰나"를 손 grep 아닌 기계가 답(거짓 단정 차단). 단독 `npm run tokens:orphans`
  18. Gate 18 (Component Page Coverage) — build-components.ts·components-new.html·component-page-coverage.json 변경 시 / 항상. **설치기(COMPONENT_CATEGORIES_GRID 정본)에 있는 컴포넌트가 HTML components 페이지에도 다 있나**를 기계 대조. 미분류(새 컴포넌트가 sectionFor/noSectionNeeded 둘 다 없음)·섹션누락=차단(설치기=기준 강제), 고아섹션·stale config=경고. 정본=`registry/governance/component-page-coverage.json`. "HTML에 빠진 컴포넌트"를 손으로 안 찾고 기계가 답(Multi Toggle·Dropdown 드리프트 재발 차단). 단독 `npm run components:pagecheck`
  19. Gate 19 (Variant/State Coverage) — build-components.ts·components-new.html·component-page-coverage.json 변경 시 / 항상. Gate 18 다음 층: **각 HTML 섹션이 설치기 변형의 상태(State)를 다 보여주나**. 섹션이 `data-cov-states` 로 옵트인하면 설치기 State 축(mock 실측) ⊆ 선언 대조(누락=차단), 미선언은 **미계측으로 정직 보고(거짓 완전성 차단)**. stateSource 로 요소 컴포넌트 상태원(Multi Toggle Element·Dropdown List) 매핑. 단독 `npm run components:variantcov`
  20. Gate 20 (Registry Token Drift) — registry 비정본(component.tokens·components/*.json)이 최신 컴포넌트(build-components) 밖 토큰을 언급하면 baseline ratchet 으로 추적(새 stale=차단·알려진=경고). **레거시 격리 파일은 `legacy-skip` 로 스킵**(2026-07-02 교정). 단독 `npm run token-drift-check`
  21. Gate 21 (Registry Active/Legacy Consistency) — build-components.ts 변경과 무관·항상. **index.json 에 active 포인터로 등록된 파일이 레거시 격리(deprecated-tokens.json legacyFiles)와 모순되면 차단**(은퇴 파일이 active 로 남아 사람·AI 오도 방지 — component.tokens.json 좀비 등록 사태 재발 차단). dangling active 포인터=경고. 은퇴 처리=`_`접두 표식+legacyFiles. 단독 `node scripts/registry-active-legacy-check.js`
  22. Gate 22 (Page Layout Policy) — pages/*.html·page-layout-policy.json 변경 시 / 항상. **페이지가 공통 레이아웃 틀(헤더가 사이드바 LNB 에 붙음)과 폭 정책(wide/readable)을 지키는지** 정본(`registry/governance/page-layout-policy.json`)과 기계 대조. ❌차단 = 미분류 페이지(escape)·틀 이탈(헤더가 main 밖/앞=LNB 미부착)·wide 인데 폭 제한 상속·wide 인데 헤더만 안 넓힘(헤더↔컨텐츠 폭 불일치)·readable 인데 임의 전폭·retired 페이지 nav/검색 부활. ⚠️경고 = stale config. 폭 위반은 `npm run layout:check -- --fix` 자동 교정(틀/미분류/부활은 수동). "헤더 안 붙음·wide 드리프트"를 ⭐ 눈 대신 기계가 판정(self-certify 사각지대 차단). 단독 `npm run layout:check`
  23. Gate 23 (Component Presentation Policy) — pages/components-new.html·component-presentation-policy.json 변경 시 / 항상. **각 PC 컴포넌트 섹션이 표출 레이아웃 규칙(컴포넌트별 개별 규칙)을 지키는지** 정본(`registry/governance/component-presentation-policy.json`)과 **실제 렌더 DOM**(헤드리스 크롬 --dump-dom, JS 재배치 후) 기준으로 대조. 소스 순서가 아니라 렌더 결과로 판정(§⚖️ 정본 오독 차단). ❌차단 = Action(인터랙티브) 없음·별도 사이즈/라벨 블록 금지 위반(action-only/in-action-state-area/merged-section)·정본 섹션 부재. ℹ️미계측(정직 보고, 비차단) = 세트 Action 여부·사이즈 양성확인·상태 세로·hover 유지·정보보완(거짓 완전성 차단). 상태 '값' 완전성은 Gate 19 담당. 크롬 없으면 SKIP(exit 0, 3회 재시도). 단독 `npm run components:presentation`
```

스크립트 일괄 실행: `npm run gate:check` (Gate 1 + 3 + 4 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20 + 21 + 22 + 23 자동)

> **Gate 10 (doc-token-ref-check):** 토큰을 rename/remove 하면 옛 이름을 쥔 가이드 문서가 자동 적발된다. **정본 rename 시 `registry/tokens/deprecated-tokens.json` 의 `renamedGroups` 에 `{from,to}` 한 줄 추가**하면 이후 게이트가 전 활성 페이지에서 잔재를 차단(Check B). `--color-*` 참조 존재성은 Check A(경고)로 가시화. **정본 삭제 시 `deprecated-tokens.json` 의 `deprecatedTokens` 에 `{cssVariable}` 한 줄 추가**하면 Check C 가 그 폐기 토큰(컴포넌트 토큰 `--button-*`·`--input-*` 포함, 와일드카드)이 활성 페이지에 **재유입되는 것을 차단**한다(예: 삭제한 `--button-*-focus-ring` 이 Token Details 에 되살아남 방지). 또 Token Details 값 칸이 `(none)`·`미정의` 로 **존재하지 않는 토큰을 문서화하면 차단**(없는 토큰은 행 삭제 — 이 유령행이 레거시 재유입 통로였음, 2026-07-03 신설). 단독 실행 `npm run docs:tokencheck`. `components.html`(폐기 예정)은 검사 제외.

> **🗂️ 레거시 격리 규약 (2026-06-16):** 활성 정본과 레거시를 **파일 단위로 분리**해 검사 제외한다. 폐기 토큰 CSS = `assets/css/legacy-tokens.css`(미로드), 폐기 문서 = `tokens/legacy/deprecated-reference.md`(아카이브). **단일 정본 = `registry/tokens/deprecated-tokens.json`**(`deprecatedTokens[].cssVariable`·`renamedGroups`·`legacyFiles`). 공용 필터 `scripts/lib/legacy-skip.js`(`isDeprecatedToken`·`isLegacyFile`)를 게이트가 공유 → **새 폐기 건은 deprecated-tokens.json 에 등록만 하면 전 검사에서 자동 제외**. 와일드카드 `--button-ghost-*` 형태 지원. 신규 게이트도 이 헬퍼를 import 해 레거시를 건너뛴다.

> **Gate 9 (number-page-check):** 색상 전용이던 자동 동기화(생성기·Gate 7)의 **number 사각지대**를 메운다. 검사 3종 — **(A)** foundation.html 의 number 5종 GEN 블록(`SIZING`·`FONT_SIZES`·`LINE_HEIGHTS`·`OPACITIES`·`BREAKPOINTS`) = vars-data FOUNDATION_NUMBER 정본 일치(`npm run number:gen`), **(B)** vars-data 의 **모든** Foundation/Semantic number 토큰이 foundation.html / semantic.html 에 실제 노출(신규 토큰 추가 시 페이지 미반영 탐지·font-weight는 Typography 표가 담당해 제외), **(C)** 폐지된 컴포넌트 사이징 토큰(`--sizing-{button-height|chip-height|table-row-height|form-control-height|dropdown-item-height|icon|button-min-width}-*`) 재유입 0건. 데이터 파이프라인(tokens.css·install-prompt·설치기 zip)은 Gate 6(installer-coverage)+Gate 3가 별도 강제.
