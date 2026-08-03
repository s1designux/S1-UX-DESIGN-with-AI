# 인수인계 — 정본 단일화 (2026-08-03 갱신)

> **먼저 읽을 것:** `CLAUDE.md` §⚖️ 운영 원칙(하드룰 **7개**) · 이 문서
> 정본 목록의 기계가독 정의는 이제 **`registry/governance/canon-manifest.json`** 에 있다(Gate 36 이 집행).

---

## 1. 지금 상태

**main 에 Phase 0~3 병합 완료 · `npm run gate:check` PASSED(39개, 경고 8) · 작업트리 클린.**

최근 커밋 (새→옛):

| 커밋 | 내용 |
|---|---|
| `453b620` | **Gate 34 확장** — 컴포넌트 세트 이름도 임의 신설 금지 대상(486→528항목) |
| `d48305d` | **문서 모순 제거** — 「registry JSON 우선」 잔재 5곳을 H6·canon-manifest 로 일원화 |
| `b5f314a` | **canon-manifest.json + Gate 36** — 정본 목록의 정본 |
| `3261a0d` | **환경 의존 3건 봉합** + 루트 색인 누락 9개 등재(Gate 30 확장) |

---

## 2. 이번 세션에 확정된 것

### 정본/파생 판정 (실측 완료)

| 파일 | 판정 |
|---|---|
| `vars-data.ts` | **값 정본** (Figma Variables) |
| `textstyles-data.ts` | **값 정본** (Figma Text Styles — Variables 와 별개 API 라 병합 불가) |
| `build-components.ts` | **값 정본** (Figma Components) |
| `registry/governance/*.json` | **정책 정본**(게이트 판정 기준) 21개 |
| `registry/components/*.json` | **메타의 정본 · 값의 파생** — 값 필드는 손편집 사본(알려진 stale 78건) |
| `design.manifest.json` · `scripts/guard/index.js` · `scripts/lib/load-vars-data.js` | **파생/스크립트** (대시보드 휴리스틱이 정본으로 오분류했던 것) |

### 통합 방식 (파일 병합이 아니라 수렴)

정본 3벌은 Figma 구조상 못 합친다. 대신:
- **선언 1곳** — `canon-manifest.json`(정본·파생 표면·재생성 명령·담당 게이트)
- **집행** — Gate 36(선언↔배선 대조) · Gate 34(임의 신설 차단) · 나머지 37개(값 일치)
- **사용자 UX** — 재생성 `tokens:reconcile` 하나 · 검증 `gate:check` 하나 · 현황 대시보드 하나

---

## 3. 남은 작업 (계획 Phase 4~6 — 착수 전)

계획 원문: `C:\Users\S1SECOM\.claude\plans\cozy-wondering-kite.md`

### Phase 4 — `component-facts.json` 생성기 + Gate 9e (비파괴)
`registry/components/*.json` 의 **값 이중 기재**를 해소하는 핵심 단계.
- `scripts/gen-component-facts.js` 신설 — `scripts/lib/figma-build-mock.js` 의 `runBuild()` 로
  build-components 를 mock 실행해 컴포넌트별 variant 축·상태·사이즈·실제 바인딩 토큰을 추출
  → `registry/components/component-facts.json`(단일 생성 파일, G9c 패턴 재사용)
- `npm run components:facts[:check]` + **Gate 9e**(재생성 대조) + `tokens:reconcile` 편입
  (편입하면 우산 단계가 11개가 되므로 **canon-manifest 의 build-components surfaces 에 등재 필요** —
  안 하면 Gate 36 이 "미선언 단계"로 차단한다. 이게 설계 의도대로 작동하는 것.)
- 검증: 🤖 `component-verifier` 실제 spawn(추출 충실성은 ⭐ 자가검증 금지 대상)

### Phase 5 — 값 소비자 이관 (비파괴)
`gen-design-md.js`(§4 표 입력 — 이질 shape 정규화 층 `:130-209` 삭제 가능) ·
`build-registry-bundle.js` · `component-renderer.js` · `core-component-harness.js` ·
`guard/load-registry.js` → facts 참조로. `sync:button` 은 Gate 9e 가 대체하므로 은퇴 후보.
DESIGN.md §4 값이 별칭→semantic 으로 바뀌는 것은 H6 상 정상(원래 그래야 했던 상태).
웹 렌더 1회 확인 의무(하드룰 H5).

### Phase 6 — 파괴 단계 (**river 확인 후**)
- 20개 registry JSON 에서 중복 값 필드 삭제(`variants` 축·`tokens`·`sizing`·`summary`).
  **유지**: `_meta`·`usage`·`anatomy`·`doDont`·`a11y`·`figma`·`governance`·`dependencies`·
  `origin`·`humanDecisions`. 삭제 직전 필드별 소비자 grep 재감사 필수.
- Gate 20 baseline 78→0 근접 갱신 후 "0-베이스 재유입 차단기"로 용도 전환(폐기하지 않음)
- 옛 zip(`assets/downloads/s1-design-system-installer.zip`) 삭제 +
  `installer-freshness-check.js:5` docstring 의 옛 파일명 정정

### 그 밖에 남은 것 (이전 세션 인수인계에서 이어짐)
- **(a)** `textStyleKey()` 조용한 치환 3줄 삭제 · `makeBoundText` 정본 밖 요청 시 throw ·
  정본 밖 요청 4계열 10곳 정리(표 sm→14 · 크롬 목업→12 · PC 라인탭→18 · 상태바 배지→10).
  ※ 이전 컴퓨터에 있던 패치 파일은 이 컴퓨터에 없다 — 위 내용대로 다시 하면 된다.
- **(b)** 표(Table) xsm 복원 — 행 34 · 글자 12(`body/12R`, 헤더 `body/12M`). 정본 4면 + 표출.
  ※ Gate 34 는 컴포넌트 **이름**만 추적하므로 크기 축 추가는 승인 불필요(variant 축은 추적 밖).
- **(c)** 모든 컴포넌트 텍스트를 스타일 이름 직접 지정으로 — `makeBoundText(chars, "title/14M", color)` 52곳.
  그러면 `textStyleKey()` 추측 매핑이 사라진다. 버튼이 이미 본보기(`SIZE_CONFIG.textStyle`).
- **(d)** 미리보기를 정본에 묶기 — `render.js` 가 `textstyles-data` 참조 0건(6개 손복제) ·
  `fontSize` 가 스타일보다 우선 · 행간 1.3 하드코딩 · 자간 미적용. `:39-46` 에 정본 로더 있음.
- **(e)** 웹 컴포넌트 CSS 가 raw px 54곳 — (c) 가 끝나면 정본에서 생성 가능
- **(f)** river 재설치 후 캔버스 육안 확인 · 날짜 탭 달력 표출 · 기하 측정 스크립트 · Phase 5/6 도메인

---

## 4. 별건 3건 — 2026-08-03 처리 완료 (`5bd591a`)

1. **`--no-verify` 무마찰 허용 — 이 컴퓨터에는 해당 없음.** `.claude/settings.local.json` 자체가
   없어 그 permission 도 없다(이전 컴퓨터의 문제였다). 조치 불필요.
2. **PreToolUse 훅 — "이름이 안 맞을 수 있다"가 아니라 아예 없었다.** 전역 설정에 hooks 섹션이
   없어 hex·폰트 차단(H2·H3)이 **완전히 꺼진 상태**였다. 봉합:
   배선을 프로젝트 `.claude/settings.json`(커밋됨, .gitignore 예외)으로 옮겨 컴퓨터 이동에도
   따라가게 하고, 종전의 `jq | node` 파이프 의존을 `scripts/lib/hook-input.js`(훅 JSON 직접 파싱)로
   제거했다. matcher 는 도구 이름 변형을 다 잡도록 `use_figma` 부분매칭. 시험 3종 통과.
   ※ **다음 Figma 작업 때 실제 발동을 한 번 확인**하면 좋다(설정 유효성·스크립트 동작은 검증됨).
3. **CLAUDE.md 다이어트 완료** — 90,355 → 84,905 byte. 오래된 이력 6행을 아카이브로 이관
   (유실 0 기계 검증), 하드룰 7개·게이트 표 불변.

---

## 5. 이번 세션에서 배운 것

- **"환경 의존"이 게이트를 통째로 무력화할 수 있다.** 판정 로직은 멀쩡한데 OS·셸이 달라
  18건이 거짓 실패했고, 그 상태로는 어떤 커밋도 불가능했다(= 게이트가 있으나 마나).
  이후 검사기를 만들 때 외부 명령(`unzip`·`tar`·`/bin/sh`)에 기대지 않는다.
- **적대 테스트는 실제로 구멍을 찾는다.** Gate 34 확장 때 `--extend-tracking` 재실행 우회로를
  테스트가 발견했다(코드만 읽을 때는 안 보였다). "차단되는지 확인"이 아니라 "우회로를 찾는" 자세.
- **선언과 집행을 붙여두면 같은 사고가 재발하지 않는다.** typo:gen 누락은 사람이 알아채야
  했던 종류의 사고인데, 이제 Gate 36 이 "우산이 도는데 목록에 없는 단계"로 잡는다.
