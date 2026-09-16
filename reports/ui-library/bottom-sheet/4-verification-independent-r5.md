# 시나리오 F 독립 검증 — 5회차 (최소 델타)

작업 `bottom-sheet` · 2026-09-15 · 배포본 **0.6.7** (4회차는 0.6.6)
검증 주체: 🤖 component-verifier (독립 spawn) · 구현 금지 · 직접 수정 0건

## 판정

**PASS** — ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건. 🟡 기록 정리 1건(아래 §4).

---

## 0. 검증 입력 계약 점검

**① 기계검사 선행** — 표 있음. 재실행해 종료코드만 확인(위조 방지).

| 명령 | 재실행 결과 |
|---|---|
| `ui:build:check` | exit 0 (`UI library build checked: 270 files.`) |
| `ui:test` | exit 0 |
| `ui:icons` | exit 0 |
| `ui:icons:origin` | exit 0 |
| `ui:guide:render` | exit 0 |
| `ui:version` | exit 0 · 배포본 0.6.7 |
| `ui:density` | exit 0 |
| `ui:state` | exit 0 — **단, 인자 필요**. `npm run ui:state` 만으로는 exit 1(`workflow-state.json 경로가 필요합니다`). `node scripts/ui-library-state-check.js reports/ui-library/bottom-sheet/workflow-state.json` 로 exit 0 확인. 다음 회차 표에는 경로를 붙여 적을 것 |
| `gate:check` | exit 1 · **error 5건 전부 Gate 34 uistate**(bottom-sheet.open/closed · bottom-sheet-option.default/selected/disabled) — 호출자 주장과 일치. **이번 델타가 새로 만든 게이트 오류 0건** |

**② 델타 재검증 — 승계 가능 여부 확인.**

정본 지문 4개가 4회차와 **동일**:

| 파일 | sha256 (앞8…뒤8) |
|---|---|
| build-components.ts | `5ffeb42d…cad5019a` |
| vars-data.ts | `14c5df38…09433bc0` |
| textstyles-data.ts | `dc0db42d…cb9d51d3` |
| ui-library-code-contract.json | `2e13ba2e…c9ca0c27` |

`git status plugins/ scripts/ registry/governance/ui-library-code-contract.json` 빈 출력. `scripts/` 미변경 = 검사 규칙 추가·강화 없음.

**델타 범위를 기계로 확정했다.** 4회차 보고서 작성 시각(15:12) 이후 수정된 소스 파일은 정확히 3개뿐:

```
ui-library/src/components/button/manifest.json   15:12:54
ui-library/package.json                          15:12:55
ui-library/release-log.json
```

`ui-library/src/**` 의 CSS·JS·예시·아이콘, `ui-library/scripts/**`(kotlin-compose.mjs 는 15:03 = 4회차 델타) 전부 **미변경**. dist 는 이 소스들의 결정론적 산출물이고 `build:check` 가 exit 0 이므로, dist 의 CSS·JS·예시·아이콘 내용이 4회차와 같다는 호출자 주장은 **입력 동일 + 빌드 결정론**으로 성립한다.

**③ 렌더 선캡처** — 이번에도 없음. 다만 이번 델타는 **렌더에 영향을 주는 변경이 0건**(CSS·JS 미변경)이므로 재캡처 없이 판정 가능하다. 렌더 판정은 4회차 결과를 승계한다(§4).

---

## 1. `button/manifest.json` 선언 ↔ 실제 CSS 선택자 — ✅

manifest `notInCanon.mobileHover` 가 적은 선택자:

```
@media (hover: hover) 안의
:hover:not(:disabled):not([data-size="lg"]):is([data-size], :not([data-s1-break="mobile"] *))
```

실제 CSS(글자 그대로 대조, 공백·따옴표·순서 포함):

| 파일 | 줄 | 일치 |
|---|---|---|
| `ui-library/src/components/button/button.css` | 92 (primary) · 112 (secondary) · 132 (blue-line) | ✅ 3/3 |
| `ui-library/dist/components/button.css` | 92 · 112 · 132 | ✅ 3/3 |
| `ui-library/dist/s1-ui.css` (번들) | 518 · 538 · 558 | ✅ 3/3 |
| `ui-library/dist/platform/kotlin/coverage.json` (display-rule 항목) | — | ✅ 선택자 원문 동일 |

세 변형 모두 `[data-s1-component="button"][data-variant="…"]` 접두 뒤가 선언문과 **글자 그대로 동일**하다. manifest 는 접두를 뺀 한정자 사슬만 인용하지만 "…안의" 로 문맥을 밝히고 있어 오독 소지 없음.

**source ↔ dist manifest 문자열 byte 동일** 확인(두 파일의 `notInCanon.mobileHover` 값 완전 일치).

**근거 문장 사실 확인** — `registry/governance/density-policy.json`:
- `componentFacts.button = "Button"` ✅
- `mobileHeight = 48` ✅ (최상위 값 · 칩 계열만 30 예외)
- `_mobileHeightNote`: `data-s1-break="mobile" 만 주면 된다` ✅ (manifest 의 "감싸개만 주면 된다" 는 정확한 뜻풀이)
- river 승인 2026-09-14 발화 `_why` 에 실재 ✅

4회차 ❌(a)-1 은 **닫혔다.**

## 2. `ui:build:check` — ✅ exit 0

## 3. CSS·런타임·포트 산출물 무변경 주장 — ✅

| 확인 | 결과 |
|---|---|
| `S1ButtonSpec.kt` | `git diff HEAD` **빈 출력** = HEAD 와 byte 동일 (4회차와 같은 상태) |
| `coverage.json` | HEAD 대비 diff 는 `unreadDisplayRules 25→34` + 버튼 hover display-rule 항목뿐 = 4회차가 이미 판정한 그 내용. 이번 델타가 더한 변화 0 |
| `s1-ui.css` · `s1-ui.js` | 버전 문자열 `0.6.7` **0회 등장** — 버전 bump 가 CSS·JS 본문을 건드리지 않았음 |
| 소스 입력 | CSS·JS·예시·아이콘 소스 파일 4회차 이후 미수정(§0②) |

호출자의 "문구와 버전만 바뀐다" 주장은 **성립**한다.

## 4. 이번에 재확인하지 않은 것 (4회차까지 승계)

승계 3조건(지문 동일 · 규칙 미강화 · 변경목록 확보) 충족으로 아래는 **재검증하지 않았다.**

- 바텀시트 본체·옵션의 렌더·상태·토큰 대조 (1~3회차)
- 버튼 hover/누름 실제 포인터 판정 및 선택자 집계 (3·4회차 실측)
- 안드로이드 누름 표시 복구 (4회차 ❌(a)-1)
- 아이콘 원본 대조·포트 커버리지 전수 (4회차)

## 🟡 기록 정리 1건 (통과를 막지 않음)

`reports/ui-library/bottom-sheet/workflow-state.json` 의 다음 단계 문구가 `component-verifier 4회차` 로 멈춰 있다. 5회차가 끝났으므로 갱신 권장 — 검증자는 상태 파일을 고치지 않는다.

## §13 수치 정정 확인 — ✅

`4-verification.md` 500줄의 정정문(lg 60/hover 0/누름 54 · md 22/16 · xsm 6/6 · xxsm 42/42)은 3회차 보고서 54~57줄 실측표와 **일치**한다. ⭐ 의 옛 수치(lg 44/md 18/xsm 16/xxsm 32) 를 재인용하지 말라는 경고도 함께 적혀 있다.

## 권장 상태 전환

`4-verification` → **5-human-review** (river 재검수 · Gate 34 uistate 5건 승인 발화 확보).
