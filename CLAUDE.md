# ASC - AI Context Document (Design System Harness)

> 이 문서는 Claude가 디자인 시스템을 **수집, 정리, 구조화, 검증**하기 위한 기준입니다.
> 현재 목표는 UI 구현이 아니라 **디자인 시스템을 구축하는 것**입니다.
> 마지막 업데이트: 2026-08-12 (토큰 효율화 중간 정리 — Gate 한눈표를 gates-reference 로 이관, 중복 재기술 포인터화. 규칙 유실 0.)

**이 문서에 남는 것 = 「계획 단계에 필요한 것」과 「매 보고에 필요한 것」뿐이다.** 작업 영역별 상세 규칙은
`.claude/rules/*.md` 에 있고 **그 영역 파일을 열 때 자동으로 로드**된다(각 규칙 파일 frontmatter 의 `paths` 가 배선).
루트를 다시 불리지 않는다 — **Gate 37(Doc Budget)** 이 크기·참조·이력 행수를 기계로 막는다.

---

## 🧭 라우팅 — 하려는 일 → 진입점

| 하려는 일 | 진입점 (스킬/에이전트) |
|---|---|
| 토큰 **값** 1건 변경 ("이 토큰 gray/100 으로") | 🤖 `token-sync` → 정본 1곳 수정 후 `npm run tokens:reconcile` (표면 위치는 `npm run tokens:locate -- <token>`) |
| 토큰 **구조·네이밍** 검증·설계 | 🤖 `token-validator` (`design-system` 스킬) — **새 토큰 생성·네이밍·구조 변경은 token-sync 범위 밖** |
| 가이드 페이지 생성·업데이트 | 🤖 `guide-builder` (`design-system` 스킬) |
| 컴포넌트 정본 → 모델·설치기 자동 동기화 | 🧭 `component-guide-sync` — 생성=`guide-builder`, 검증=`component-verifier` (사이트는 손관리·자동 덮어쓰기 금지) |
| Figma 원본 조회·비교 | 🤖 `figma-inspector` (읽기 절차 = `.claude/docs/figma-mcp-read.md`) |
| **Figma 컴포넌트 → 코드** ("Figma ~ 구현/변환해줘") | 🪜 `figma-to-code` 스킬 (5단계 검문소) |
| **레거시 화면 → Figma 재현** ("이 화면 그대로 만들어줘") | 🪞 `screen-rebuild` 스킬 — 빌드=`screen-rebuilder`, 검증=`component-verifier` |
| **Figma 라이브러리 컴포넌트/변형세트 빌드·편집** ("Figma에 ~ 만들어줘", "variant 세트로 묶어줘") | 🏗️ `figma-library-build` 스킬 — 빌드=`figma-library-builder`, 검증=`component-verifier`, ⭐는 흐름만 (**하드룰 H1**) |
| 설치기 생성기(`build-components.ts`) 수정 | ⭐ 또는 코드 에이전트가 빌드, 검증은 🤖 `component-verifier` 분리 (**하드룰 H1②**·Gate 13) |
| 구현 결과 원본 대조 검수 | 🤖 `component-verifier` |
| 저장소 **정본 사실** 확인(레이아웃·값·이름) | 📖 `source-reader` (**하드룰 H5** — ⭐ 자기 훑기 금지) |
| 컴포넌트 재사용·분류 판단 | `.claude/rules/components.md` 확인 후 진행 |
| 대시보드 갱신·Figma 플러그인 재등록 | `.claude/docs/ops-procedures.md` |
| 다음 작업 계획 | `.claude/docs/project-status.md` (완료 단계·미결 우선순위) |

**에이전트 정본:** `.claude/agents/` — token-validator · guide-builder · figma-inspector · component-verifier · token-sync · screen-rebuilder(🪞) · figma-library-builder(🏗️) · source-reader(📖). 상세 이름표는 `.claude/docs/actors-reference.md`.

**단순 질문**과 **단일 노드 좌표/이름 1건 같은 순수 기계적 미세 편집**은 스킬 없이 직접 응답 가능(구조 변경은 위임).

---

# 🧠 Claude의 역할 (핵심)

Claude는 다음 역할만 수행한다:

✔ Figma 변수 및 스타일 분석 · ✔ Token 구조 정리 및 재설계 · ✔ Semantic Token 설계 · ✔ Component Token 설계
✔ 상태값 구조 정의 · ✔ Core / Domain / Legacy 분류 · ✔ 다크모드 확장성 검토 · ✔ 문서화 및 HTML 가이드 구조 제안

❌ UI 디자인 생성 금지
❌ React / Vue 코드 생성 금지
❌ 임의 컴포넌트 설계 금지

---

# 🏛️ 정본과 우선순위 (가장 먼저 읽을 것)

**정본은 3벌이다.** Figma 구조상 병합할 수 없다(Variables·Text Styles·Components = 다른 개체·다른 설치 API).

| 정본 | 무엇의 정본인가 |
|---|---|
| `plugins/figma-vars-installer/src/vars-data.ts` | 토큰 **값**(Foundation·Semantic·number·shadow) |
| `plugins/figma-vars-installer/src/textstyles-data.ts` | **텍스트 스타일** |
| `plugins/figma-vars-installer/src/build-components.ts` | **컴포넌트**가 어떤 토큰·크기를 쓰나 |

**기계가독 정본 목록 = `registry/governance/canon-manifest.json`** (파생 표면·재생성 명령·담당 게이트까지 선언. **Gate 36** 이 선언↔실제 배선을 양방향 대조한다).

**파생 표면**(= 정본에서 내려오는 것): 웹 가이드 `pages/*.html` · `registry/**` · 컴포넌트 미리보기 · `design/DESIGN*.md` · `reports/**` · `assets/css/tokens.css` · `assets/css/typography.css`.

### 세 가지 원칙

1. **값이 어긋나면 저울질 없이 파생을 고친다** — 파생 값은 증거가 아니다 (전문: 하드룰 H6).
2. **정본에 새 항목을 ⭐ 가 임의로 만들지 않는다** — 근거가 없으면 `needs-decision` 으로 올린다 (전문: 하드룰 H6② · Gate 34).
3. **정본을 고쳤으면 `npm run tokens:reconcile` 한 번**으로 파생 전체가 재생성된다. **파생 손편집 금지.** 자동 연동 경로가 없는 곳을 발견하면 손으로 메우지 말고 **연동을 만든다.**

> registry 의 **메타 정보**(설명·상태·거버넌스·Figma 노드 매핑·사용맥락·접근성)는 정본에 대응물이 없으므로 **그 부분은 registry 가 기준**이다. `registry/components/*.json` 의 **값 필드는 손편집 사본이라 믿지 않는다**(알려진 stale 78건).
> 레거시 판단은 항상 `registry/governance/deprecated.json` 단일정본부터 — **Gate 21** 이 좀비 active 등록을 차단한다.

**Registry 폴더 지도:** `registry/index.json`(진입점) · `tokens/`(토큰 파생 데이터) · `components/`(Core Component 사양 = **메타의 정본**) · `figma/`(Figma 노드 매핑) · `governance/`(버전·검증규칙·deprecated·마이그레이션·정본 선언) · `ai/`(AI 스니펫·리뷰 프롬프트) · `reports/`(검수 결과물 MD).

**상태값 (status / darkStatus):**

| 값 | 의미 |
|----|------|
| `stable` | 확정 완료, 그대로 사용 |
| `candidate` | 미확정 — **사용자 승인 필요**(등록처는 재설계 대기, `BACKLOG.md` 참조) |
| `planned` | 작성 예정 |
| `deprecated` | 삭제 확정, 사용 금지 |

---

# 🎨 토큰 레이어 용어 (이 프로젝트 공식)

```
Foundation Token   (기본 팔레트 — gray/blue/red scale 등)
       ↓
Semantic Token     (역할 기반 — bg/text/border/action 등)
       ↓
Component Token    (컴포넌트 별칭 — --input-* / --button-* 등)
       ↓
Pattern → Legacy
```

| 기존/일반 용어 | 이 프로젝트 공식 용어 |
|---|---|
| Primitive / Base Palette / Raw Color | **Foundation** |
| Semantic | Semantic |
| Component Alias | Component |

> **Foundation은 Primitive가 아니다.** 이 프로젝트에서 기본 팔레트 계층은 항상 "Foundation"으로 부른다.
> `Primitive`, `Base`, `Raw` 등의 용어는 다른 디자인시스템에서의 동의어이며, 이 프로젝트에서는 사용하지 않는다.

**색상은 예외 없이 Semantic 경유** — HEX 직접 사용 금지(예외: `color-overlay` 만 rgba 허용). 크기·간격·반경 상세, Dark 스텝 방향, 카테고리 목록, 네이밍 규칙은 **`.claude/rules/tokens.md`**(토큰 파일 편집 시 자동 로드).

---

# 🚫 Figma 원본 기준 준수 (임의 생성/값 변경 방지)

**Figma DS 2.4(SW UX GUIDE V2.4)는 "정답지"가 아니라 "유일한 참고 출발점"이다.** (모든 검증 규칙의 상위 원리)

- DS 2.4는 레거시이며 개선이 필요한 자료다. 무엇을 개선할지 보기 위한 참고용이지, 그대로 베껴야 할 정본이 아니다.
- 따라서 **"코드가 Figma와 다르면 코드 오류"라고 자동 판정하는 것을 금지한다.**

## 두 갈래 분류 (레거시 ↔ 정본 불일치 처리)

> ⚠️ **적용 범위:** 이 분류는 **레거시(DS 2.4) ↔ 정본** 사이에만 쓴다. **정본 ↔ 파생 사이 적용 금지** — 파생 불일치는 저울질 없이 파생을 고친다(하드룰 H6).

- **(a) 코드 실수** (색 오연결·variant 누락 등) → **코드를 고친다.**
- **(b) 사전 등록된 개선** (Figma 레거시의 누락/구식을 코드가 개선) → **코드를 유지하고 "Figma 개선 필요 목록"에 적재.** 이미 합의된 개선(예: **hover** — 레거시에 자주 누락)은 (b)로 사전 등록한다.
- **(c) 애매** → (b)로 빼지 말고 **사용자에게 확인한다. 검사기가 임의 판정하지 않는다.** **애매한 것을 (b)로 처리하면 버그 면죄부가 되므로 금지.**

| 갈래 | 대상(예) | 처리 |
|------|---------|------|
| **두갈래 분류** ((a)/(b)/(c)) | 색상값·크기·두께·타이포 등 — 레거시가 틀렸을 수 있는 값 | 위 (a)/(b)/(c) |
| **정확 대조** (두갈래 제외, 항상 엄격) | variant 구성·아이콘 원본·토큰 참조 구조 — 원본을 베껴야 하는 것 | 불일치 시 무조건 ❌ ((b)/(c) 적용 금지) |

새로운 속성이 나오면 **"레거시가 틀렸을 수 있는 값인가, 원본을 베껴야 하는 것인가"** 로 갈래를 판단한다.
이 원리를 `token-validator`·`component-verifier`·`figma-inspector` 등 **검증 규칙 전반**에 적용한다. "Figma 불일치 = FAIL"로 단정하지 않는다.

## 원본 값 절대 보존 · 토큰 생성 조건

- 색상 HEX·수치 값(폰트 크기·간격·반경)은 **원본 그대로** — 반올림·변환 금지. Semantic 참조 구조도 Figma 원본 연결 그대로 유지.
- "더 나은 값"·"표준 값"·"일반적인 관례"를 이유로 무단 수정 금지.
- 새 토큰은 **①Figma 원본에서 존재 확인됨 ②아직 추출·정의되지 않음** 두 조건을 모두 만족할 때만 생성한다. 미충족 시 생성하지 않고 사용자에게 확인을 요청한다(+ 정본 신설은 하드룰 H6②·Gate 34).
- 변환 규칙: `color/button/primary/bg--default` → `--button-primary-default-bg`. (`/` → `-` · 공백 제거 · 소문자 · `--` 접두사)

> 두 갈래 분류는 *이미 발견된 차이*를 다루는 것이지, **추측으로 새 값을 만들 허가가 아니다.**

---

# 🤖 AI 작업 원칙 — 공통 규칙 허브 (정본)

> **이 섹션이 "공통 규칙"의 정본이다.** 모든 작업에 공통 적용된다.
> 작업별(전용) 규칙은 각 작업 문서에만 둔다 → figma-to-code: `.claude/skills/figma-to-code/SKILL.md` · 레이아웃 틀: `component-page-template.md` · 토큰 거버넌스(R01~R11): `registry/governance/audit-rules.json`.

Claude는 "구현"이 아니라 "구조"를 만든다.

1. 토큰 없이 스타일링 금지
2. **추측 금지** (검증 후 판단) — 모든 수치는 실제로 읽은 값만 사용
3. 기존 구조·토큰·컴포넌트 **우선 탐색·재사용** (임의 생성 금지)
4. 임의 생성 금지
5. **파일 편집은 허가 없이 즉시 진행** (사용자 명시 지시)
6. 파괴적 작업(파일 삭제, 구조 전면 변경)만 사전 확인
7. **막히면 보고** — 값·에셋을 못 얻으면 임의로 채우지 말고 어떤 항목인지 사용자에게 알린다
8. **두 갈래 분류** — 코드↔Figma 불일치를 자동 "코드 오류"로 보지 않는다 (§🚫 상위 원리)
9. **검증 역할 분리** — 만드는 자 ≠ 검증하는 자 (구현=guide-builder, 4단계 대조=component-verifier)
10. **단계/검문소 승인 대기** — 검문소 통과 전 다음 단계로 넘어가지 않는다
11. **색상은 Semantic 경유**·HEX 직접 금지 (열거 규칙 R01~R11은 `audit-rules.json` 정본 참조)
12. 완료 시 **Orchestrator Summary** 형식 보고

## ⛔ 금지사항

> 기계가 검사하는 열거 규칙의 **정본은 `registry/governance/audit-rules.json`(R01~R11)** 이다. 아래는 사람용 요약이며, 충돌 시 audit-rules.json이 우선한다.

* HEX 직접 사용 금지 (예외: `color-overlay`만 rgba 허용 = EX03)
* Foundation 직접 참조 남용 금지 · 의미 없는 이름 금지
* Legacy를 신규 기준처럼 사용 금지 · 서비스 UI를 강제 통합 금지
* 다크모드 고려 없는 토큰 확정 금지
* Danger 버튼 variant 재추가 금지 (삭제 확정)

---

# 🎛️ Main Orchestrator 운영 모델

Claude는 **Main Orchestrator**다. 사용자는 **목표 수준 의도**만 준다 — 메커니즘(px·줄바꿈·토큰 배선·Figma 실측값 등)을 직접 지시하거나 줄 단위로 검수하지 않는다. 사소한 것까지 사용자가 신경 쓰는 상황은 **증상**이며, 그 책임은 오케스트레이터(나)에게 있다.

**작동 모델 — "계획 1회 확인 후 자율 실행":**

1. **계획 1회 확인 (plan-gate):** 목표 수준 요청은 착수 전 **"이렇게 할게요"**(핵심 수치·구조·영향 범위 요약, + 진짜 결정/애매 (c)케이스가 있으면 모아서 질문)를 **한 번** 제시하고 OK를 받는다.
2. **OK 후 자율 실행:** 모든 **메커니즘 결정**은 내가 Figma/정본 기준으로 정한다. 중간 디테일은 **사용자에게 올리지 않는다.**
3. **검증은 내가** (사용자가 QA 아님): 검사기(🔎) + **사각지대**(시각=렌더 확인, 구조·원본충실성=🤖 실제 spawn). 사소한 실수가 사용자에게 새기 전에 잡는다.
4. **검수는 결과로:** 완료 보고 = **렌더 스크린샷 + Orchestrator Summary**.
5. **올라오는 건 진짜 결정만** — 주관적 제품 선택·애매 케이스. 모아서, 드물게, "결정해주세요" 형태로.

**예외(plan-gate 생략, 즉시 실행):** 사용자가 이미 정밀 지시를 한 경우(=이미 계획됨)·오타/카피 같은 사소 작업·대화형 질문.

**작업 모양별 하이브리드:** 작은·순차·강결합 → ⭐ 내가 직접 / 무거운 탐색·병렬·광범위 → 🤖 작업 에이전트 위임(내 컨텍스트 보존) / 위험한 것의 검증 → 🤖 원본대조 검증 에이전트 분리.

## 🎭 Actor 출처 표식 — 요약

> 상세 이름표·표시 규칙 전문은 **`.claude/docs/actors-reference.md`** 참조.

| 이모지 | 카테고리 | 실체 |
|--------|---------|------|
| ⭐ | 총괄 에이전트(나) | 메인 루프 — 계획·구현·조율 |
| 🤖 | 작업 에이전트 | 서브에이전트(LLM 판단/창작) — **실제 Task spawn 시만** |
| 🔎 | 검사기 | `scripts/*.js` 결정론적 자동 검사(기계) |
| 🚧 / 🔄 | 훅(자동 발동) | 🚧 커밋 검문소 · 🔄 토큰편집 동기화기 |

**핵심 규칙:** **내가 직접 한 일=⭐, 실제 spawn한 작업 에이전트만 🤖**(자기 일에 🤖 붙이면 거짓). 보고가 전부 ⭐면 혼자 self-certify, 🤖/렌더샷 보이면 독립 검증 실제 실행됨. 이모지는 **"독립 검증이 실제로 돌았는지"를 사용자가 한눈에 확인하는 대시보드**다.

## ⚖️ 운영 원칙 — 실제 검증 분리 (self-certify 금지 조건)

> **판단 기준은 작업의 "크기"가 아니라 "게이트가 그 실패를 실제로 커버하는가"다.**
<!-- 2026-06-17 보정 근거: 가벼운 작업에서도 시각·구조 미스가 전 게이트를 통과해버린 사례 반복 — TimePicker 세트 구조 미스(사용자가 잡음)·12h 오전/오후 글자 세로쪼개짐(렌더 확인서 잡음). 둘 다 게이트·harness ✅인데 틀렸음. -->

검사기(🔎)·훅(🚧🔄)은 **기계적 실패만** 결정론적으로 잡는다. 아래는 **사각지대**라 작아도 별도 검증한다:

| 실패 유형 | 검사기 | 작아도 해야 할 검증 |
|---|---|---|
| 토큰 누락·HEX·정합성·키 | ✅ 잡음 | 검사기로 충분 |
| **시각 깨짐** (렌더·레이아웃·줄바꿈) | ❌ 못 잡음 | **HTML/CSS 변경 시 실제 렌더 확인 의무** (headless Chrome 스크린샷 / Figma get_screenshot 대조) |
| **구조·의미 오류** (원본 충실성·"이렇게 만드는 게 맞나") | ❌ 못 잡음 | 무거우면 **🤖 `component-verifier` 실제 spawn** 적대적 대조. Figma 읽기 핵심이면 **🤖 `figma-inspector`** 분리 |
| **폰트 정체성** (use_figma 캔버스 텍스트 — Noto 잔존 등) | ❌ 못 잡음(캔버스는 파일 아님) | **데이터 스캔 필수·렌더 판정 금지**(MCP 렌더는 Pretendard 미설치라 구분 불가). `figma-font-scan.md`로 전 TEXT 노드 fontName 스캔→비-Pretendard 0건. 정본 `registry/governance/figma-font-policy.json` |
| **정본 오독** (⭐가 소스 훑고 짐작) | ❌ 못 잡음(사람/기계 게이트 밖) | **읽기를 📖 `source-reader` 에 위임**(하드룰 H5). ⭐ 자기 훑기로 레이아웃/구조/값 단정 금지 |

규칙:
- **UI/HTML/CSS를 건드렸으면 크기 불문 렌더 1회 확인.** "검사기·div개수 통과"로 시각 검증을 대체하지 않는다. (헤드리스 Chrome `--headless=new --screenshot=… "file://…#섹션"` → 스크린샷 Read 로 육안 대조)
- **구조 변경·Figma→코드·역방향 생성기 수정**은 self-certify하지 않고 검증 분리(🤖).
- **순수 기계적 수정**(토큰 값 1건·오타·문서 카피)은 검사기로 충분 — 렌더/에이전트 생략 가능.
- **검증 안 한 부분은 보고에 ⭐ 자가인증으로 명시**한다(사용자가 어디를 의심할지 보이게).

### 🚫 하드룰 5개 (H1·H2·H3·H5·H6 — 어떤 경우에도 루트에서 빼지 않는다)

> 2026-08-12 재편(사용자 승인): 구 H4(생성기 코드 검증 분리)는 **H1의 ②**로, 구 H7(정본 신설 금지)은 **H6의 ②**로 통합. 번호 H4·H7은 결번 은퇴 — 과거 기록의 H4·H7 표기는 각각 H1②·H6②를 뜻한다. 금지 내용·예외·집행 장치 무변경.

- 🚫 **[H1] 빌드/검증 분리 — 구조를 만든 자가 스스로 검증하지 않는다.** ①**Figma 라이브러리 컴포넌트/변형세트 빌드·편집**(신규 생성·combineAsVariants·토큰 바인딩·variant 패킹)은 ⭐ 직접 use_figma 빌드 금지 — **`figma-library-build` 스킬**로 진입(빌드=🏗️ `figma-library-builder`, 검증=🤖 `component-verifier`, 둘 다 실제 spawn·⭐는 흐름만). ②**설치기 생성기 `build-components.ts` 구조 변경**(새 build 함수·variant 스펙·셀↔스펙시트 키)은 빌드는 ⭐/코드 에이전트 가능하되 검증은 반드시 🤖 `component-verifier`(D) 실제 spawn → `node scripts/installer-build-verify-check.js --record --by component-verifier …` 기록, **Gate 13 이 해시로 집행**. **예외:** 단일 노드 좌표/이름 1건 미세 편집=⭐ 직접+렌더 1회 · 토큰 값 1건/오타=`--by orchestrator --change mechanical` 자가인증(git 감사).
<!-- H1 (근거 ①: ⭐ 단독 인라인 빌드+자가검증이 패킹 붕괴·정렬·세트화 누락을 사용자에게 새게 한 반복 실패. 빌드자≠검증자 + 위임 강제로 구조 차단.) (근거 ②=구 H4, 2026-06-19: 설치기 9개 이슈가 9줄 전부 ⭐ → 독립 검증 부재로 Input 스펙 빈칸 버그가 토큰 게이트 전부 ✅인 채 유출 직전. 검증 분리를 기계 강제로 전환.) -->
- 🚫 **[H2] `use_figma`로 그리는 모든 노드의 색은 Variable 바인딩 — 하드코딩 hex 금지(2026-06-22).** 용도(라이브러리/검토/스펙/레이아웃 프레임) 불문 — 검토 프레임도 결국 라이브러리화되므로 처음부터 바인딩(사용자 결정). 정본에 토큰이 없으면 임의 hex 대신 **Foundation alias Variable 신설(승인)** 또는 needs-decision. **예외:** 컴포넌트 부품(셀·타일·아이콘·버튼 등)이 아닌 **순수 장식 크롬만** 줄 끝 `// figma-hex-allow: <사유>`. **집행:** PreToolUse 훅(`scripts/figma-code-hex-check.js`)이 실행 직전 exit 2 차단.
<!-- H2 (근거: Gate 3·12·pre-commit이 전부 "파일"만 검사해 use_figma의 직접 쓰기는 사각지대였고, "검토 프레임이니 라이브러리 빌드 아님" 자기분류로 스킬/에이전트 경로마저 건너뛰어 Calendar Cell/Tile 검토 프레임이 hex로 2회 유출. 도구 호출 자체를 가로채 기계 차단.) -->
- 🚫 **[H3] `use_figma` 캔버스 텍스트의 최종 폰트는 정본(Pretendard) — Noto 잔존 금지(2026-06-24).** 일시 Noto 로 입력했으면 **반드시 `setTextStyleIdAsync`로 정본 텍스트 스타일 재바인딩**(폰트 로드 불필요·검증됨). raw 폰트 라벨은 동일 metric 스타일을 `weightStyleMap`(예: Medium14→body/14M)으로 바인딩, 없으면 needs-decision. **검증은 렌더 금지·데이터 스캔 필수**(MCP 렌더는 Pretendard 미설치라 구분 불가 — 노드 `fontName`/`textStyleId`만 신뢰). **집행 3층:** PreToolUse 폰트 훅(`scripts/figma-code-font-check.js`, 일시 폰트는 줄 끝 `// figma-font-temp:` 마커 필수) · `figma-font-scan.md` 전 TEXT 노드 스캔(비-Pretendard 0건) · `component-verifier`(§(C)/(B), 비-Pretendard 1건=❌(a)). 정본 `registry/governance/figma-font-policy.json`.
<!-- H3 (근거: datepicker 재구성 시 탭·버튼 라벨을 Noto 로 덮어쓰고 텍스트 스타일 재바인딩을 빠뜨려 3개 라벨이 Noto 로 박힘 — 폰트는 캔버스 노드라 파일 게이트 전부 사각지대, 사용자가 Desktop 에서 발견. hex 와 동일 계열을 3층으로 차단.) -->
- 🚫 **[H5] 정본 '읽기'도 ⭐ 훑기+짐작 금지 — 📖 `source-reader` 위임(2026-07-06).** 판단에 필요한 **정본 사실**(레이아웃/표출 구조·값·이름)은 ⭐가 소스를 훑어 단정하지 않는다. source-reader 는 ①소스 순서로 렌더 추측 금지 ②레이아웃/표출 주장은 **실제 렌더 또는 CSS+JS 전체 추적** + 확인 방법 명시 ③`파일:줄` 인용 ④모르면 `미확인`. ⭐는 그 검증된 사실 위에서만 행동한다. **예외:** 단일 값·이름 1건 조회, 방금 자기가 편집해 상태가 확실한 파일.
<!-- H5 (근거: ⭐가 components Button 표출을 JS 재배치·CSS·렌더 미확인·**소스 순서만 보고** "Action이 상태 옆 열"이라 단정→실제는 별도 상단 스트립. "만드는 자≠검증하는 자"를 '읽는 자'로 확장. figma-inspector=Figma 원본 / component-verifier=구현 정확성 / source-reader=저장소 정본 사실로 3분.) -->
- 🚫 **[H6] 정본 거버넌스 — 파생은 증거가 아니고, 정본 신설은 승인 사항이다(2026-08-03).** ①**정본**(`vars-data.ts`·`textstyles-data.ts`·`build-components.ts` — 기계가독 목록 `registry/governance/canon-manifest.json`, **Gate 36**)과 **파생 표면**(`pages/*.html`·`registry/**`·미리보기·`design/DESIGN*.md`·`reports/**`)이 다르면 **저울질 없이 파생을 고친다.** 파생 값은 증거가 아니다. **"파생이 A 인데 정본은 B 다, 어느 쪽이 맞나?"는 성립하지 않는 질문이며 그 형태로 묻는 것 자체가 규칙 위반** — 성립하는 질문은 **"정본을 A 로 바꿀까요?"** 뿐이고, 파생 수정을 비용·부작용처럼 서술하지 않는다. §「두 갈래 분류」는 레거시(DS 2.4)↔정본에만 적용, 정본↔파생에는 금지. ②⭐는 정본에 새 항목(토큰·텍스트 스타일·컴포넌트·variant·**판정 기준·규칙 자체**)을 임의로 만들지 않는다 — **"근거가 없을 때 내가 규칙을 만들어 빈자리를 메우는 것"이 금지의 핵심.** 근거 없으면 `needs-decision`, 사용자 승인 시 추가(**Gate 34 집행** — 승인은 `node scripts/canon-addition-check.js --approve --by river --reason "..."`). 추가 시에도 파생 손편집 금지 — 정본 1곳 수정 후 자동 연동(`tokens:reconcile` 등), 연동이 없으면 연동을 만든다.
<!-- H6 (근거 ①, 2026-08-03: ⭐가 "웹 24 vs 정본 16 중 어느 쪽?"·"탭 굵기 Bold/Medium 중 어느 쪽?"을 반복해 묻고 "웹이 20px 이라 바뀝니다"를 비용처럼 서술해 사용자가 세 번 교정 — 정본↔파생 판정 우선순위 부재.) (근거 ②=구 H7, 2026-08-03: 사용자가 "정본에 13·9px 스타일 추가"를 명시 거부했는데 ⭐가 "스케일 안이면 신설"이라는 자기 규칙을 만들어 body/20M 신설 — 32개 게이트 전부 "정본→파생 일치"만 봐서 정본에 줄이 늘어나는 것을 보는 게이트가 0개였다.) -->

---

# 🔎 Figma MCP 읽기 · 🪜 Figma → 코드 5단계

**Figma MCP 읽기 3원칙:** ①큰 영역은 `get_design_context` 를 먼저 부르지 않고 **`get_metadata` 로 좁힌다**(응답 잘림 방지) ②구성 노드를 **표로 보여주고 사용자 선택을 기다린다** ③선택된 노드에만 깊이 들어간다(한 번에 한 깊이). **A/B 절차 전문은 `.claude/docs/figma-mcp-read.md`** — 각 Figma 스킬·`figma-inspector` 가 원본을 읽기 전에 따른다.

**Figma → 코드 5단계 정본은 `figma-to-code` 스킬**(`.claude/skills/figma-to-code/SKILL.md`). 5단계(재고조사→수치추출→구현→자가대조→다크모드)·검문소(STOP)·**만드는 자≠검증하는 자**(구현=guide-builder / 4단계 대조=component-verifier)·절대규칙 전문은 스킬에 있다.

> **Gate 와의 관계(층위 분리):** 5단계는 작업 **진행 중** 사전 검문소, Gate(`npm run gate:check`)는 완료 **직전** 사후 검문 — 층위가 달라 충돌하지 않는다. 5단계 완료 후 Gate(특히 Gate 1 Registry·Gate 5 UI)를 실행하고 Orchestrator Summary에 함께 보고한다. Harness Audit(`npm run harness:audit`)은 Gate 5 사후 검문이자 4단계 component-verifier의 대조 도구로도 쓰인다.

---

# 🚦 Gate — 커밋 검문소

**Gate 1~38 한눈표·정의·판정 로직·단독 실행 명령 전문 = `.claude/docs/gates-reference.md`** (Gate 작업 시 그 파일을 먼저 Read). 강제는 `npm run gate:check` 가 수행한다 — **Claude 가 정의문을 외워 지키는 게 아니다.** 성공 시 요약 1줄, 상세는 `--verbose`.
**예외(gate:check 미배선·수동):** Gate 2(Figma nodeId 유효성) · Gate 5 UI 부분(Harness 부분은 `npm run harness:audit` 단독).

## ⚙️ 강제 계층 — Hooks

> **핵심:** Gate·서브에이전트는 *자동이 아니다*. **진짜 자동·강제는 hook만 가능하다.** (전파=token-sync · 판정=Gate · 강제=hooks)

| 훅 (전부 차단형) | 위치 | 발동 → 동작 |
|----|------|------|
| **PreToolUse** hex | `.claude/settings.json` → `scripts/figma-code-hex-check.js` | `use_figma` 직전 — 하드코딩 hex 면 exit 2 차단 (장식 크롬만 `// figma-hex-allow: 사유`) |
| **PreToolUse** 폰트 | `.claude/settings.json` → `scripts/figma-code-font-check.js` | `use_figma` 직전 — 비-Pretendard 면 차단 (일시 Noto 는 `// figma-font-temp:` 마커) |
| **pre-commit** | `.git/hooks/pre-commit` (정본 `scripts/hooks/pre-commit`) | `git commit` 시 `npm run gate:check`, error 면 커밋 차단 |

- **재설치:** `npm install` 시 자동(`prepare`). 실패 시 Git Bash 에서 `bash scripts/hooks/install-git-hooks.sh` 1회.
<!-- 이식성 봉합(2026-08-03): 종전 배선이 전역 설정에만 있어 컴퓨터를 옮기자 훅이 통째로 사라져 있었고 차단장치가 꺼진 것을 아무도 몰랐다. 또 종전 배선은 `jq -r '.tool_input.code' | node …` 로 jq+파이프(셸)에 의존해 jq 없는 환경에서는 등록해도 안 걸렸다 → `scripts/lib/hook-input.js` 가 훅 JSON 을 직접 파싱해 외부 의존 0. matcher 는 도구 이름 변형(mcp__figma__* 등)을 모두 잡도록 `use_figma` 부분매칭. 우회: `git commit --no-verify`(비권장 — 드리프트가 저장소에 유입됨). 검증 완료(2026-06-11): vars-data 값을 일부러 어긋나게 하면 pre-commit 이 exit 1 로 커밋을 막는 것을 확인. -->

---

# 📋 Orchestrator Summary (완료 보고 형식)

작업 완료 시 반드시 아래 형식으로 보고한다. 섹션은 해당 항목이 있을 때만 포함한다.

```
## Orchestrator Summary — {작업명}

### 변경 내용
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| ⭐ | path/to/file | 내가 직접 한 변경 |
| 🤖 | (검증) | 원본대조 검증 에이전트를 spawn한 경우만 |

### 검사기 결과 (🔎 검사기 / 🚧🔄 훅)
| 검사기 | 결과 | 비고 |
|------|------|------|
| 🔎 {검사기명} | ✅ PASS | |
| 🚧 커밋 검문소 | ✅ 통과 | 커밋 시 |

### 미결 사항 (Human Decision 필요)
- HD-X: {무엇에 대한 결정인지 — 쉬운 말로} · 왜 결정이 필요한지 · 선택지(A/B) · 안 정하면 어떻게 되는지

### 🔁 자동화 승격 후보 (count ≥ 3 인 패턴이 있을 때만 — 없으면 섹션 전체 생략)
| 패턴 | 횟수 | 추천 규칙 |

### 다음 단계
- {다음 작업}
```

> **HD 작성 규칙 (사용자는 비개발자 UX 디자이너):** HD 항목은 `HD: State=default_button` 처럼 **코드 약어·노드ID만 던지지 않는다.** **①평이한 이름(무엇) ②왜 결정이 필요한지 ③선택지 ④안 정할 때의 현재 동작**을 풀어쓴다. 기계식별자는 괄호 보조로만.
> - ❌ 나쁜 예: `HD: State=default_button (540:4217)`
> - ✅ 좋은 예: `HD: 달력에 '확인 버튼이 붙은 형태'를 추가할까요? — 날짜를 고르고 확인을 눌러야 적용되는 모달용 변형입니다. (A) 추가 / (B) 지금처럼 날짜 클릭 즉시 적용만 유지. 안 정하면 현재대로 '즉시 적용' 형태만 만듭니다. (Figma 원본 540:4217)`
>
> 이 규칙은 **사용자에게 결정/확인을 요청하는 모든 질문**(AskUserQuestion 포함)에 동일 적용한다.

## 반복 요청 추적

**정본 = `reports/repeated-requests.json`** 하나다(파생 사본을 두지 않는다). 작업 완료마다 유사 패턴이면 `count` +1, 없으면 새 항목 추가. **count 가 3에 도달하면** Orchestrator Summary 에 승격 후보로 보고한다.

## 금지 행동

- Gate 실패(error)를 숨기고 완료 보고하는 것
- 사용자 승인 없이 gate-check.js를 수정해 체크 항목을 약화하는 것
- Orchestrator Summary 없이 작업 완료를 선언하는 것
- Figma Gate SKIP을 FAIL로 잘못 기록하는 것
- 반복 요청 패턴을 발견하고도 `reports/repeated-requests.json`에 기록하지 않는 것

---

# 📌 핵심 원칙

디자인 시스템의 목표는 UI 통일이 아니다. 목표는 ①공통 기준 통일 ②서비스별 확장 허용 ③반복 구조 패턴화
④레거시 분리 및 점진적 전환 ⑤토큰 중심 구조 유지다. **Core는 통일 · Domain은 허용 · Pattern으로 재사용 · Legacy는 분리 관리.**

👉 디자인 시스템은 "컴포넌트"가 아니라 **토큰 + 구조 + 규칙의 시스템이다**

---

# 🗂️ 변경 이력

> **최근 1건만 한 줄로 남긴다.** 상세 경위는 **git commit 메시지**와 **`reports/changelog-archive.md`**(전체 보존본, 세션 미로드)에 둔다. **Gate 37 이 3행 초과를 차단**한다.

| 날짜 | 변경 내용 (한 줄) |
|------|------------------|
| 2026-08-12 | **토큰 효율화 중간 정리 — ①검사기 출력 다이어트(gate:check 172줄→요약 1줄, `--verbose` 복원) ②CLAUDE.md 감량 39.8→31.9KB(Gate 한눈표 gates-reference 이관·중복 포인터화) ③하드룰 7→5 재편(사용자 승인 — 구 H4→H1②·구 H7→H6② 통합, 결번 은퇴, 살아있는 참조 일괄 갱신) ④좁혀읽기 원칙 이식 + 대형 생성물 Read 방어선(.claudeignore).** 판정 로직·규칙 의미 무변경. |

> 이전 전체 상세 이력: **`reports/changelog-archive.md`** 참조.
