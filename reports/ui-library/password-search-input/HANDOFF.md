# 인수인계 — Password Field · Search Input (3-build 완료, 4단계 검증 미실행)

- 작성: 2026-09-07 (작업일 2026-09-04, 3일 중단 후 재개용)
- 작업 상태 정본: `reports/ui-library/password-search-input/workflow-state.json`
- 스킬: `ui-library-code` (진입어 "웹 업데이트 해줘")

---

## 한 줄 요약

**만드는 것은 끝났고(3-build), 검증만 안 됐다.** 🤖 검증자를 두 번 띄웠으나 **두 번 다 데스크톱 앱 중단으로 기록 없이 죽었다.** 코드·문서는 그대로 살아 있고 기계검사 9종은 전부 초록이다.

---

## ⛔ 가장 먼저 — 커밋 사고 방지

작업트리에 **다른 세션이 stage 해 둔 변경 9개**가 섞여 있다. `git add -A` 로 커밋하면 **그 세션 작업을 삼킨다.**

```
.claude/docs/actors-reference.md · .gitignore · CLAUDE.md · package.json
reports/repeated-requests.json · scripts/doc-find.js · scripts/doc-find-eval.js
scripts/doc-find-paraphrase.js · scripts/doc-index-build.js
```

→ `npm run docs:find`(로컬 임베딩 문서 검색) 기능으로 보이며 **이 작업과 무관하다.**
**커밋할 때 파일을 명시적으로 골라라.** (관련 기억: `multi-session-shared-worktree-hazard`)

---

## 지금 상태

| 항목 | 값 |
|---|---|
| 단계 | `3-build` 완료 · `4-verification` **미실행** |
| 배포 상태 | `draft` |
| 미커밋 파일 | 104개 (그중 9개는 위 다른 세션 것) |
| 기계검사 9종 | ✅ 전부 종료코드 0 |
| `gate:check` | ❌ **2건** — 아래 참조 |

### gate:check 오류 2건 (둘 다 예상된 것)

| Gate | 내용 | 언제 풀리나 |
|---|---|---|
| **Gate 13** | `build-components.ts` 구조 변경이 검증 기록 없이 stale | 🤖 검증자가 PASS 판정 후 **직접** `--record` 실행하면 해소 (하드룰 H1② — ⭐ 자가인증 금지) |
| **Gate 6c** | 설치기 zip 툴팁·날짜가 소스와 어긋남(릴리스 날짜 09-04 → 09-07, 툴팁에 Search Input 반영 필요) | 검증 통과 후 `npm run installer:build` |

**Gate 13 이 빨간 동안은 커밋이 막힌다**(pre-commit 훅). 정상이다.

---

## 무엇을 만들었나

**Password Field·Search Input 을 별도 컴포넌트로 만들지 않고 승인된 Base Input 의 옵션으로 조립했다**(river D1).

- Password = `type="password"` + 눈 액션. trail `[눈][지우기]` 2px
- Search = `[data-mode="search"]` + 돋보기 액션(항상 표시). trail `[지우기][돋보기]` 4px
- 아이콘 3종(`eye_hide`·`eye_show`·`search`)은 **Figma 원본에서 확보**해 원본 픽셀 대조 통과(오차 0.004~0.007, 임계 0.015)

### 정본 변경 4건 (river 승인 근거 D1~D4 — 검증 대상)

| # | 변경 |
|---|---|
| C1 | `buildSearch` sizes 에 Mobile MD(h48·padL16·**padR0**) 추가 |
| C2 | states 4개(Default/Focus/Filled/Disabled) → **3개**(Default/Filled/Disabled) |
| C3 | hit area PC 28×28 / Mobile 48×48 |
| C4 | `ICON_KEYS.eye_show` 추가 |

상세 스펙 = `2-canon-readiness.md` · 무엇을 했는지 = `3-build.md`

---

## 다음 사람이 할 일

### 1) 🤖 `component-verifier` 로 4-verification (필수 — ⭐ 혼자 판정 금지)

아래 요청문을 **그대로** 쓴다. 정본 구조 변경이라 하드룰 H1② 로 검증 분리가 강제된다.

> **⚠️ 검증자를 `run_in_background: true` 로 띄운 뒤 블로킹 대기 도구를 걸지 말 것.**
> 지난번 두 번 다 그렇게 하다가 앱 중단으로 검증자까지 함께 죽었다. 턴을 끝내고 완료 알림으로 받아라.

<details>
<summary>검증 요청문 전문 (펼쳐서 복사)</summary>

```
UI library `password-search-input` 의 4-verification 이다. 시나리오 F + 정본 구조 변경 검증(하드룰 H1②) 두 몫을 한 번에 한다.
먼저 `.claude/skills/ui-library-code/references/verify-F.md` 와 `references/wiring-and-traps.md` §2 를 읽어라.

## 입력 (이 순서로)
1. `reports/ui-library/password-search-input/3-build.md` — 🧱 빌더 보고서. §E 검사 종료코드 표와 §F 실측·스크린샷이 선캡처다. §"내가 확신 못 하는 것" 6건은 네가 판정할 목록이다.
2. `reports/ui-library/password-search-input/2-canon-readiness.md` — 스펙(공개 계약·C1~C4). 이것과 다르면 빌더 결함이다.
3. `reports/ui-library/password-search-input/workflow-state.json` — river 결정 D1~D5(인용 포함).
4. 코드 델타: `git diff HEAD -- plugins/figma-vars-installer/src/build-components.ts ui-library/src/components/input scripts/component-anatomy-check.js registry/components/input.json registry/components/component-behavior.pc.json registry/figma/allowed-remote-keys.json ui-library/scripts/test.mjs pages/components.html pages/ui-review.html assets/js/ui-library-guide.js`

## 범위
전부 신규다(Password 옵션·Search 모드). 단 Base Input 은 2026-09-04 river 승인 코어이고 같은 `input.css`/`input.js` 를 공유하므로, 델타가 건드린 공유 경로(`refresh()` 분기·`init` 리스너·destroy·clear·초점 테두리·Tab 커서 끝·마우스 위치 유지·500ms 포인터 판정·disabled 스킵)의 회귀는 반드시 본다. 건드리지 않은 영역(크기·최소너비·아이콘 geometry·hover)은 diff 가 닿지 않았음을 확인한 뒤 승계한다.

## 판정할 것
A. 정본 구조 C1~C4 (H1②) — C1 Mobile MD(h48·padL16·padR0) · C2 states 3개(Focus·caret 제거, Filled 가 [clear][search] trail) · C3 hit area PC28/Mobile48 · C4 ICON_KEYS.eye_show. 빌더가 "부수"로 spec 레이아웃을 decorateSetGrouped 로 바꾼 것이 시각·구조에 영향 없는지. 승인 범위 밖 신설 0건인지(Gate 34 무반응을 근거로 쓰되 diff 로도 확인).
   → PASS 면 네가 직접 `node scripts/installer-build-verify-check.js --record --by component-verifier --verdict pass --change structural --notes "<대조 요약>"` 실행. FAIL 이면 기록하지 마라.
B. 웹 계약 정합 — root/parts/actions 순서·간격(Password 2px·Search 4px)·상태 3개·Mobile 48×48·`s1:input:search`(Enter+클릭, IME 제외)·password type 토글·aria-pressed/aria-label·초점 복귀·Search clear 는 초점 무관 노출. 전체묶음↔개별설치 동일성·다중 인스턴스·destroy/재init·T5(중복 id).
C. 실제 렌더 — `http://127.0.0.1:4173/pages/ui-review.html`(1b·1c) 과 `pages/components.html#input` 을 http 로 열어 PC·Mobile × Light·Dark 에서 눈 감김/뜬눈·돋보기가 실제로 그려지는지, 아이콘이 칸 끝에서 Base Input 지우기와 같은 규칙(PC 14px·Mobile 12px)인지 실측. 빌더가 dark 캡처를 실패했으니 Dark 는 반드시 네가 본다.
D. 빌더의 6가지 자가판단(3-build.md 마지막 절) — 각각 (a)결함/(b)정당/(c)river 결정 필요로 판정:
   1. manifest status approved→verified, version 0.1.0→0.2.0 — 그 결과 개발자 ZIP 에서 input 이 빠졌다(19→18종). 옳은 상태 표현인가.
   2. Search `type="text"`(브라우저 `type=search` 미사용).
   3. Search action 에 Figma hover BOOLEAN 미추가.
   4. `scripts/component-anatomy-check.js` 판정 기준을 빌더가 직접 고친 것(State=Focus→Filled, caret 요구 제거) — 기계적 재조준인지 검사 약화인지 적대적으로. (`reports/repeated-requests.json` 의 `self-invented-criteria`·`check-strengthened-without-updating-target` 참조)
   5. migration 장부 신규 레코드의 `lastVerified: null`.
   6. Mobile 에서 Password/Search 블록 사이 여백이 좁다는 자백 — 시각으로 판정.
E. 문서↔코드 — `registry/components/input.json` relatedComposedFields(stable)·`component-behavior.pc.json`·`input/manifest.json`·검수 화면 안내 문구가 실제 동작과 일치하는지. `allowed-remote-keys.json` 은 주석 외 키 값 변경 0건인지.

## 금지
직접 고치지 마라(Gate 13 기록 1건만 예외). "안 보인다"는 T1·T2·T3 배제 후 판정. 델타 밖 전수 재검 금지.

## 산출
항목별 FAIL/HOLD/BLOCKED/PASS + 확인 방법(명령·URL·파일:줄). 응답으로 돌려라.
```

</details>

### 2) 통과하면 → 5-human-review (river 검수)

검수 화면: `http://127.0.0.1:4173/pages/ui-review.html` → 「이번에 볼 것」 탭의 **1b. Password Field · 1c. Search Input**
(서버가 없으면 `python3 -m http.server 4173 --bind 127.0.0.1` 을 저장소 루트에서)

river 가 볼 것: 눈 아이콘으로 표시/숨김 전환 · 값 입력 후 Enter 또는 돋보기 클릭으로 검색 실행 · 지우기 · PC/Mobile × Light/Dark 비교

### 3) 승인 후 → 6-promotion

- `registry/governance/ui-library-migration.json` 의 `password-field`·`search-input` → `approved`
- `input/manifest.json` status 를 river·검증자 판정대로 정리(D-1 항목)
- `npm run installer:build` · `npm run ui:zip` · `npm run devpanel:gen` (Gate 6c·46 해소)
- 커밋 — **위 ⛔ 다른 세션 stage 목록을 제외하고** 파일 명시

---

## river 결정 (이미 받아둔 것 — 다시 묻지 말 것)

| ID | 결정 | river 발화 |
|---|---|---|
| D1 | Search 는 Base Input 베이스, 아이콘만 다르게 | "왜 서치는 인풋을 베이스로 만들지 않은거지? 베이스로 해서 표출되는 아이콘 사양만 좀 다르면되는데" |
| D2 | 검색 실행 = Enter + 돋보기 클릭 둘 다 | "Enter 키 + 돋보기 클릭 둘 다" |
| D3 | Search 모바일도 만든다 | "모바일도 만든다" |
| D4 | Search 상태 3개 | "서치 인풋은 디폴트(검색아이콘), 값 다 쓰여진것(삭제,검색아이콘), 비활성화만 있으면됨" |
| D5 | 아이콘은 Figma 원본에서(폴백 금지) | "Figma 연결을 살려주신다" → 이후 Figma 링크 제공, 확보 완료 |

**자동완성 목록·Error/Correct/Read-only 는 만들지 않는다**(정본에 없음 / D4 로 제외).

---

## 앞선 세션에서 배운 것 (같은 실수 반복 방지)

1. **긴 서브에이전트에 블로킹 대기를 걸지 마라** — 앱 중단 한 번에 에이전트까지 죽는다. 배경으로 띄우고 턴을 끝내라.
2. **되돌릴 때는 "이 줄이 어느 토큰을 쓰나"로 가른다** — 2026-09-02 focus 철회가 정본 토큰을 쓰던 정당한 규칙까지 지웠고, 기계검사 9종이 전부 초록인 채 결함이 배포됐다. 잡은 건 🤖 검증자뿐이었다.
3. **river 가 말하지 않은 예외를 슬쩍 넣지 마라** — 지난 회차에 "읽기전용은 커서 안 옮김" 예외를 내가 만들었고 검증자가 H1②/H6② 로 잡았다. (`self-invented-criteria` 4회째)
