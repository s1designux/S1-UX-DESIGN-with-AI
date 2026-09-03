# 4-verification — Time Picker 웹 배포본 독립 검증 (시나리오 F)

- 대상: `time-picker` · 계약 `registry/governance/ui-library-code-contract.json` v0.1.2 (candidate)
- 검증자: 🤖 `component-verifier` (빌드 주체와 분리)
- 1회차 ❌ FAIL(8건) → 2회차 ✅ PASS → 3회차 ❌ FAIL 1건(registry 폭) → **4회차(좁은 범위) ❌ FAIL 1건(문구·코드 무변경)** · 전부 2026-09-03
- 절차: `verify-F.md` + `wiring-and-traps.md` §2. 렌더·실측은 전부 **http**(임시 로컬 서버 + headless Chrome). `file://` 는 T1·T2 로 쓰지 않았다. 임시 하네스 3개(`_tpv*.html`)는 캡처 후 전부 삭제했다 — 저장소 파일 무수정.

---

# 4회차 판정 (좁은 범위): ❌ **FAIL — ❌(a) 1건 (문구 · 코드 변경 불필요)**

지시한 5개 범위만 봤다. **코드(`min-width:100%`)와 그 기하 결과는 전부 ✅ PASS 다.** 유일한 ❌ 는 river 결정을 뒷받침한다며 정본 이탈 기록에 적어 둔 **실측 서술이 사실과 다르다**는 것이다.

| 권장 | 값 |
|---|---|
| 조치 | 문구 3곳 정정 → `manifest.json notInCanon.panelWidthFollowsTrigger` · `workflow-state.json decisions[D6].decision` · `3-build.md` 5회차 「왜 24h 만인가」 표. 정정 후 `npm run ui:build` 1회(dist manifest 동기화) |
| `checkpointLog[4].status` | 그 3곳 정정 전까지 `passed` 로 올리지 말 것 |
| `workflowStatus` / `uiLibraryStatus` | `in-progress` / `draft` 유지 |
| 배포본 동작·모양 | **이상 없음** — 이 결함은 런타임·화면에 영향이 없다 |

## 4-0. 실측 요약 (내가 직접 잰 값 — 오케스트레이터 수치 재현 검사)

열린 패널 실측(dist CSS + dist JS 를 빈 소비자에서 직접 물림, PC MD 기준).

| 항목 | 24시간제 | 오전·오후(12h) | 정본 | 판정 |
|---|---|---|---|---|
| 트리거 폭 | **150** | **150** | 150 | ✅ |
| 패널 폭 | **150** (= 트리거) | **194** (유지) | 121 / 194 | 24h 는 river 승인 이탈 · 12h 는 정본 그대로 |
| 열 폭 | **58.5 × 2** | **48 × 3** | 44 / 48 | 24h 만 변화(선언과 일치) |
| 열 사이 구분선 | 1px · x=74.5(패널 정중앙) | 1px × 2 · x=64 / 129 | 1px | ✅ |
| 목록 높이 | **192** | **192** | 192(TPD_COLS_H) | ✅ |
| 위여백 | 12(패널 몫) | 12 | 12 | ✅ |
| 확인 줄 높이 | 41 | 41 | 41 | ✅ |
| 확인 줄 구분선 | `calc(100% - 16px)` = **134** | **178** | panelW−16 | ✅ 공식 유지 |
| 패널 총높이 | 245 (12+192+41) | 245 | — | ✅ 두 유형 동일 |
| 트리거↔패널 간격 | **4** | **4** | itemSpacing 4 | ✅ |
| 테두리·그림자 | `inset 0 0 0 1px #D9D9D9` + `0 4px 8px rgba(0,0,0,.15)` **1겹** | 동일 | strokeAlign INSIDE | ✅ |
| 칸 높이 | 32 | 32 | 32(TPC_H) | ✅ |
| 글자 넘침 | 0 (필요 40.69 < 칸 58.5) | 0 (필요 48.2 vs 칸 48 → **+0.2**, 잘림 없음) | — | ✅ |

**오케스트레이터가 잰 값 중 재현된 것:** 24h 150/150·58.5×2·넘침0 · 12h 150/194/48×3·넘침0 · "오전" 글자폭 **24.2px 정확 일치** · 칸 여백 24 · 필요폭 48.2 · 정본 칸 48(한계치) · 150 일 때 칸 **33.33px**.
**재현되지 않은 값:** "소비자 300px 지정 시 트리거 202.7 = 패널 202.7" → 4-C 참조.

## 4-A. ❌(a) — 정본 이탈 기록의 실측 서술이 틀렸다 (12h 를 150 으로 줄였을 때의 결과)

기록된 문장(3곳에 같은 취지):

- `manifest.json:115` `notInCanon.panelWidthFollowsTrigger` — “150 이면 칸이 33px 로 줄어 **글자가 구분선을 뚫는다**”
- `workflow-state.json` `decisions[D6].decision` — 같은 문장
- `3-build.md` 5회차 표 — “패널을 150 으로 줄였을 때 칸 폭 33px → **글자가 15px 씩 넘침**”

**통제 실험으로 직접 확인했다**(12h 패널에만 `width:150px !important` 를 얹고 실측, 실험용 style 은 메모리상에서만 넣었다 삭제):

| 측정 | 값 |
|---|---|
| 열 폭 | 33.33px (선언대로) |
| "오전" 글자 폭 | 24.2px |
| 칸(cell) 폭 | 33.33px · `scrollWidth 33 = clientWidth 33` → **잘림 없음·스크롤바 없음** |
| 글자 오른쪽 끝 | x=52.77 · 그 열의 오른쪽 끝 x=57.33 → **글자는 열 안에 있다** |
| 글자와 구분선 사이 | 4.56(칸 여백 잔량) + 8(열 간격) = **약 12.6px 남는다** |

즉 실제로 일어나는 일은 **좌우 여백이 12px → 4.56px 로 줄어드는 것**이지, 글자가 넘치거나 구분선을 뚫는 것이 아니다. 글자는 칸 밖으로도 나가지 않는다(24.2 < 33.33).

- **판정 근거:** 이것은 두갈래 (b) 개선도, (c) 애매도 아니다. **정본 이탈을 정당화하려고 기록에 적은 “실측”이 실측과 다르다.** 정본 이탈 기록은 나중에 이 이탈을 되짚을 유일한 근거라, 틀린 사실이 박히면 다음 사람이 잘못된 전제 위에서 판단한다. `manifest.notInCanon` 은 배포본(`dist/components/time-picker.manifest.json`)에도 그대로 실려 나간다.
- **river 결정 자체는 흔들리지 않는다.** 결정을 떠받치는 숫자(24.2 + 24 = 48.2 vs 정본 칸 48 = 이미 한계치, 150 이면 칸이 33px)는 **전부 정확했다.** 여백이 12 → 4.6 으로 3분의 1 이하가 되는 것만으로도 12h 를 줄이지 않을 이유는 충분하다. 고칠 것은 **결론 문장 한 줄**이다.
- **권고 문구(예시):** “150 이면 칸이 33.33px 로 줄어 칸 좌우 여백이 12px → 4.6px 로 무너진다(글자 자체는 24.2px 라 잘리지는 않는다).”

## 4-B. 정본 이탈 기록의 나머지 — 충분한가 → 🟡 3건 (❌ 아님)

| # | 무엇 | 근거 |
|---|---|---|
| ✅ | `manifest.geometry.panel.widthByType` · `columnWidth` 가 실제와 일치 | 선언 “24h 121 + min-width:100% → 기본 150, 열 58.5 / 12h 194, 열 48” = 실측과 정확히 같다 |
| ✅ | `notInCanon` 에 river 발화 원문 인용 + 정본 대비 차이(29px 좁음 / 44px 넓음) 기록 | 150−121=29 · 194−150=44 — 산술 일치 |
| ✅ | `registry/components/time-picker.json` · `component-presentation-policy.json` | 패널·열 폭 필드가 **아예 없다** → 어긋날 곳이 없다. 3회차 ❌ 였던 `sizing.minWidth` 는 150 으로 정정 확인 |
| ✅ | dist 반영 | `dist/components/time-picker.css:124` · `dist/s1-ui.css`(time-picker 블록) 모두 `min-width:100%` · `width:121/194` 그대로 |
| 🟡 R-11 | **`3-build.md:128` 이 아직 “✅ 121/194 · 192 · **44/48** · gap 4 · 구분선 **105**/178” 로 남아 있다.** 4회차 재검사 표라 당시엔 맞았지만 지금은 24h 가 150 · 58.5 · 134 다. 같은 파일 뒤쪽 5회차 절이 정정하고 있으나 **앞 표에 “5회차에서 바뀜” 표시가 없다** | 낡은 값을 기준선으로 삼는 사고(2026-08-24 `scan-summary` 사례)의 씨앗이라 표시 권고 |
| 🟡 R-12 | **Select 선례 인용은 “방향”에만 타당하고 “같은 규칙”은 아니다.** ①인용 위치 `select.css:105` 는 **주석 줄**이다 — 실제 규칙은 **`select.css:96`** (`panel { width:100% }`). ②Select 규칙은 “패널 = 트리거 폭”(width:100%)이고 Time Picker 는 “패널 ≥ 트리거 폭”(min-width:100%)이다. **12h 가 트리거보다 44px 넓은 상태는 Select 규칙에서는 나올 수 없다** — 인용한 river 2차 지시(“좁아 보이거나 **어긋나 보이면** 안 된다”)로만 보면 오히려 걸리는 모양이다. 2026-09-03 지시(“12시간제는 현재 유지”)가 더 구체적·나중이라 **결정은 유효**하지만, `3-build.md:238` 의 “새 규칙을 만든 것이 아니라 기존 하우스 규칙을 적용했다”는 **정확하지 않다** — 하우스 규칙의 완화판이다 | H6② 관점에서 “규칙을 새로 만들지 않았다”는 주장은 특히 정확해야 한다 |
| 🟡 R-10(재확인) | `pages/components.html` 레거시 죽은 코드 그대로. `:1161` `min-width:78px` + `:1275-1280` 주석 “24h min-w/w = 121px” · `min-width:121px;width:121px`. 마크업 0건이라 무해하지만(`class="s1-timepicker` 0건), **이제 저장소에서 “패널 121 고정”을 말하는 유일한 잔재**다 | 3회차 R-10 미처리 |
| 🟡 R-1(재확인) | `manifest.status` 가 이번 회차 검증 **전에** 이미 `verified` 로 배포되고 있다(`dist/components/time-picker.manifest.json`). 3-build 5회차는 스스로 “아직 독립 검증을 받지 않았다”고 적어 두었다 — **선언과 배포가 어긋난 기간이 또 생겼다** | 2회차 R-1 과 같은 패턴 |

## 4-C. 소비자가 트리거를 넓혔을 때 · 좁은 칸 → ✅ PASS (수치 1건은 재현 불가)

| 상황 | 트리거 | 패널 | 열 | 판정 |
|---|---|---|---|---|
| 컴포넌트 루트에 `width:300px` | **300** | **300** | 133.5 × 2 | ✅ 목록이 따라간다 |
| 바깥 컨테이너만 `width:300px`(루트 손 안 댐) | **150** | **150** | 58.5 | ✅ 어긋남 없음. 루트가 `inline-flex` 라 컨테이너만 넓혀서는 안 넓어진다 — Select 도 동일 구조 |
| 컨테이너 120px | 150(넘침 +30) | **150** | 58.5 | ✅ **패널이 트리거와 함께 넘친다**(어긋남 0) |
| 컨테이너 80px | 150(넘침 +70) | **150** | 58.5 | ✅ 동일 |
| 12h · 컨테이너 120px | 150 | 194 | 48 | ✅ 12h 는 의도대로 194 유지 |

- **모든 경우에 `패널 폭 = max(트리거 폭, 정본 고정폭)` 이 정확히 성립한다.** “목록이 입력칸보다 좁아 보이는” 경우는 0건이었다.
- 🟡 **재현 불가:** 오케스트레이터가 보고한 “소비자 300px 지정 시 트리거 **202.7** = 패널 202.7”은 어떤 조합으로도 나오지 않았다(루트 300 → 300/300, 컨테이너만 300 → 150/150). **결론(패널이 트리거를 따라간다)은 유효**하지만 그 숫자는 근거로 인용하지 말 것.
- 🟡 3회차 R-9 와 같은 계약 공백은 그대로다 — 150 보다 좁은 칸이 필요한 소비자에게 승인된 탈출구가 문서에 없다(Select 도 동일).

## 4-D. Mobile 360 재확인 → ✅ 이번 변경으로 나빠지지 않았다

360px 폭 · 좌우 16 패딩(내용 328) 기준 실측.

| 상황 | 결과 |
|---|---|
| 24h 1개 | 트리거 16→166 · 패널 16→**166** (3회차엔 121 이라 16→137). 오른쪽 여유 **194px** ✅ |
| 12h 1개 | 패널 16→**210** ✅ |
| 24h + 12h 나란히 | 첫 패널 16→166 · 둘째 트리거 166→316 · **둘째 패널 166→360.00** |
| 문서 가로 넘침 | 없음 |

- **3회차가 기록한 “12h 패널 오른쪽이 정확히 360 에 닿는다”는 그대로 성립한다.** 패널은 `position:absolute` 라 **앞 요소의 패널 폭이 뒤 요소의 배치에 영향을 주지 않는다** — 24h 가 121→150 으로 넓어져도 둘째 트리거 시작점(166)·둘째 패널 오른쪽(360)은 **1px 도 움직이지 않았다.** 경계 위험도는 3회차와 동일하며 **이번 변경 때문에 나빠진 것이 아니다.**
- 24h 쪽은 오히려 여유가 남는다(166 ≪ 360). 패널 flip 로직 부재는 3회차와 같은 미결로 남는다.

## 4-E. 안내·검수 화면 표 넘침 → ✅ 늘지 않았다

1440px 뷰포트에서 두 화면의 time-picker 영역 전 요소를 훑어 `scrollWidth > clientWidth` 인 곳만 뽑았다.

| 화면 | 넘치는 곳 | 값 | 3회차 대비 |
|---|---|---|---|
| 안내 화면 | 「패널 상태 — 오전·오후(12시간제)」 표 1개 | need **1004** / avail **988** = **+16** | **동일**(3회차 R-9 와 같은 값) |
| 안내 화면 | 그 표의 열린 칸 4개 · 미리보기 4개 | 칸 223/207 · 미리보기 **194/150** | 12h 패널 194 가 원인 — **변화 없음** |
| 안내 화면 | 「패널 상태 — 24시간제」 표 | **넘침 0** | 이전에도 0(121<150), 지금은 150=150 으로 **딱 맞음** |
| 검수 화면 | `review-static` 12h 블록들 194/150 | 44 | **변화 없음** |
| 두 화면 | **문서 가로 넘침 0 · 잘림 0 · 스크롤바 0** | | ✅ |

24h 패널이 넓어지면서 **새로 생긴 넘침은 0건**이다(24h 미리보기 칸은 트리거 폭 150 슬롯이라 150 패널이 정확히 들어맞는다).

**스크린샷 (4회차)**

| 파일 | 내용 |
|---|---|
| `screens/4v4-guide-pc-light.png` | 안내 화면 PC Light — Action · 상태 5×3 · 패널 상태 24h/12h 두 표. 24h 패널 좌우 끝이 트리거와 정확히 맞고, 12h 만 오른쪽으로 44 더 나간다 |
| `screens/4v4-review-light.png` | 검수 화면 전체 — PC·Mobile 열린 패널이 트리거 폭과 일치 |

## 4-F. 결정론 검사 · dist 무결성 → ✅ 전부 통과

| 검사 | 결과 |
|---|---|
| `npm run ui:build` 재실행 | dist **바이트 동일**(s1-ui.css·time-picker.css·manifest 해시 3개 전부 불변) — 손편집 0 |
| `npm run ui:contract` | PASS · errors=0 |
| `npm run ui:test` | PASS |
| `npm run ui:guide:render` | PASS(18종 × PC·Mobile) |
| `npm run ui:icons` | icons=12 · errors=0 |
| `canonicalFingerprint` 재계산 | 선언값 `82993362…d9bd0` 과 **일치** |
| `test.mjs` 변경분 | `variant-label` 색을 하드코딩 → semantic 토큰으로 **강화**한 것(2회차 F-5 후속). 검사 약화 없음 |

## 4-G. 이번 회차에 검증하지 않은 것 (정직 표기)

- 지시대로 **2·3회차 PASS 범위는 다시 보지 않았다** — 키보드·`init`/`destroy`·`data-value` 폴백·패널 상태 표출·아이콘·토큰·묶음↔개별 동일성. (다만 dist 재생성 동일성과 검사기 전체는 다시 돌렸다.)
- **다크 렌더 재확인 없음.** 이번 변경은 폭 1줄이라 색 경로에 닿지 않는다고 판단했다 — 2회차 다크 PASS 를 그대로 인정한다.
- Figma 캔버스 대조 없음(MCP 미인증. 이 작업의 시각 정본은 코드).
- 실제 마우스 hover·스크린리더·실기기 터치 없음.
- **어떤 파일도 고치지 않았고 `workflow-state.json` 도 건드리지 않았다.** 임시 하네스 3개는 모두 삭제했다(`git status` 로 신규 파일 없음 확인).

---
---

# (이력) 3회차 판정 (좁은 범위): ❌ **FAIL — ❌(a) 1건 (경미·1줄)**

지시한 범위만 봤다. 2회차 PASS 범위(패널 geometry·구분선·`inset` 그림자·키보드·`init`/`destroy`·`data-value` 폴백·패널 상태 표출·아이콘·토큰)는 재검증하지 않았다.

| 권장 | 값 |
|---|---|
| 조치 | `registry/components/time-picker.json` `sizing.minWidth` 1줄 수정 후 재확인(grep 1회) |
| `checkpointLog[4].status` | 그 1줄 반영 전까지 `passed` 로 올리지 말 것 |
| 배포본 동작 | **이상 없음** — 이 결함은 런타임에 영향이 없다 |

## 3-A. `min-width: 78px → 150px` 정본 부합 판정 → ✅ **정본 부합**

- 정본 `build-components.ts:2359` `trigger.resize(150, sc.h)` 가 **크기 루프 안**에 있어 XXSM·XSM·MD(PC)·MD(Mobile) **4조합 전부 150** 이다. 웹이 모든 크기에 같은 최소 폭을 주는 것과 일치한다.
- 선례 대조: Select 정본은 `build-components.ts:1430` `trigger.resize(140, …)` 이고 `select.css:23` 이 `min-width:140px` + `width:100%` 로 쓴다(river 지시 2026-09-01). **같은 방식에 각자의 정본 숫자를 넣은 것**이라 관행이 일관된다.
- 실측: 안내 화면 PC 5상태 × 3크기 × 2유형 **전부 150px**, Filled 에서도 150 유지(개별 소비자에서 Filled 전후 `150 → 150`). river 지시 R-2·R-3 해소 확인.

## 3-B. ❌(a) — registry `sizing.minWidth: "78px"` 가 그대로다

**결함이다.** 근거:

- **78 은 정본 어디에도 없다.** time-picker 빌더 3개 전 범위(2320~2640)에 `78` 없음. `1-inventory.md` 에도 없음.
- `registry/components/*.json` **18개 중 `sizing.minWidth` 필드를 가진 것은 time-picker 하나뿐**이다 — 하우스 관행도 아니다.
- 실제 출처는 `pages/components.html:1161`(`.s1-timepicker-wrap`)·`:1226`(`.s1-timepicker-select-field`, 주석 "Figma md min-width")의 **레거시 손관리 CSS** 로 보인다.
- CLAUDE.md **H6**: 정본과 파생이 다르면 저울질 없이 파생을 고친다. 정본은 150 으로 명확하므로 river 결정 사항이 아니다.
- 지금 상태는 같은 값을 두 파생이 서로 다르게 말한다 — manifest `geometry.minWidth: "150px"` ↔ registry `"78px"`.

**파급 범위는 좁다(정직 표기).** `gen-component-facts.js` 는 Figma 노드 props 를 읽지 registry `sizing` 을 읽지 않고, `component-guide-model.json` 의 time-picker 영역에도 `78` 이 없다 → **생성 표면으로 퍼지지 않는다. 런타임 영향 0.**
그럼에도 ❌ 로 올리는 이유: **1회차 CSS 가 바로 이 필드를 근거로 78 을 썼다.** 남겨 두면 다음 작업이 같은 값을 다시 길어 올린다.

→ 조치: `sizing.minWidth` 를 `"150px (정본 trigger.resize(150))"` 로 고치거나, 정본에 근거가 없는 필드이므로 삭제한다.

## 3-C. 기본값 변경의 파급 — ⭐ 가 확인하지 않은 부분 (실측)

컨테이너 폭을 바꿔 가며 dist 를 직접 소비해 쟀다.

| 컨테이너 | 트리거 폭 | 넘침 | 높이 | 줄바꿈 | 글자 잘림 | 아이콘 | 값↔아이콘 겹침 |
|---|---|---|---|---|---|---|---|
| 320 / 240 / 200 / 160px | 150 | 없음 | 44 | 없음 | 없음 | 24 온전 | 없음 |
| 120px | 150 | **+31px** | 44 | 없음 | 없음 | 24 온전 | 없음 |
| 80px | 150 | **+71px** | 44 | 없음 | 없음 | 24 온전 | 없음 |

실제 레이아웃 형태로도 확인했다.

| 상황 | 결과 |
|---|---|
| CSS grid 3열 균등 360px | 트랙이 150 으로 강제되어 **grid scrollWidth 466 > 컨테이너 362** (가로 blowout). 이웃 겹침은 없음(트랙이 벌어짐) |
| `table-layout:fixed` · td 100px | 표 폭은 안 늘어나고(307=307) 트리거가 **옆 칸을 48.5px 침범** |
| **Select 선례 동일 조건**(120px 칸) | 트리거 140 · **넘침 19px** — 같은 성질 |

**판정: 새로 생긴 결함 유형이 아니다.** 이미 river 가 승인해 배포 중인 Select 의 동작과 같은 종류이고(150 vs 140, 10px 차이), 좁은 칸에서 넘치는 것은 `min-width` 방식의 내재적 성질이다. ❌ 로 올리지 않는다.

- 🟡 **다만 계약에 구멍이 있다.** manifest `cssContract.customization` 은 "공개 selector 의 구조를 override 하지 않는다"이고 `notInCanon.widthFixed` 는 **"더 넓게"만** 열어 준다. 150 미만 칸이 필요한 소비자에게 **승인된 탈출구가 문서상 없다.** Select 도 같은 공백이라 하우스 차원 문서 보완 사항이다(예: "더 좁게 써야 하면 `min-width` 재정의 허용" 명시).

## 3-D. Mobile break(48px) · 360px 화면 → ✅ 적절

| 항목 | 실측 |
|---|---|
| 화면 360 · 좌우 16 패딩 → 슬롯 328 | 트리거 **150** (슬롯의 46%) · 높이 **48** · 넘침 없음 |
| 패널 폭 | 24h **121** · 12h **194** — 둘 다 화면 안 |
| 문서 가로 넘침 | **없음** |

- 🟡 한 가지: 트리거가 넓어지면서 **inline 으로 두 개를 나란히 두면 두 번째 12h 패널의 오른쪽이 정확히 360 에 닿는다**(150+150=300 → 두 번째 시작 166 + 패널 194 = 360). 패널은 `left:0` 고정이고 화면 경계 회피(flip)가 없어, 조금만 더 오른쪽이면 잘린다. 78 이던 때는 288 에서 끝나 여유가 있었다. 패널 위치 로직은 이번에 안 건드렸고 2회차 PASS 범위지만, **이 변경이 경계 충돌에 더 가까워지게 만든 것은 사실**이라 기록한다.

## 3-E. 빈 HTML 소비 · 두 소비자 동일성 · dist → ✅ 이상 없음

| 항목 | 결과 |
|---|---|
| 묶음 ↔ 개별 `<main>` DOM | **완전 일치** (9,889자, 폭 변경으로 깨지지 않음) |
| 개별 설치 동작 | 트리거 150 → 시·분 선택 → 확인 → `change={value:"09:30",…}` · `data-filled` · **Filled 후에도 150** |
| dist 재생성 | `ui:build` 재실행 → 작업트리 dist **바이트 동일** |
| dist 반영 | `dist/components/time-picker.css:32` · `dist/s1-ui.css` 모두 `min-width: 150px` |
| 검사기 | `ui:contract` errors=0 · `ui:test` PASS · `ui:guide:render` PASS(18종) · Gate 19 newGaps=0 |

## 3-F. `${liveRow}` 오치환의 인접 컴포넌트 회귀 → ✅ **없음** (독립 확인)

정적·런타임 양쪽으로 봤다.

- **정적**: `assets/js/ui-library-guide.js` 의 변경 hunk는 5개뿐이고 전부 time-picker 전용이다 — `@@ -108,0 +109,9 @@`(componentConfig 추가) · `@@ -1471,0 +1481,156 @@`(time-picker 함수 추가) · `@@ -1487,0 +1653 @@`(dispatch 1줄 추가) · `@@ -1688 +1854 @@`·`@@ -1778 +1944 @@`(각각 기존 목록에 `"time-picker"` 만 추가). **Select 의 `actionSection`(766~775)·Multi Toggle(1206~)을 건드린 hunk 가 없다** — `liveRow` 가 원형 그대로 살아 있다.
- **런타임**: Select·Filter Chip·Multi Toggle·Dropdown 4개 섹션을 실제로 띄워 확인.

| 섹션 | Action 행 라벨 | 실물 인스턴스 | 코드탭 | 매트릭스 넘침 |
|---|---|---|---|---|
| Select | `Select` · `Disabled공통` (원형) | 28 | 3종 정상 | 0 |
| Filter Chip | Line/Solid × 제목 유무 4행 + Disabled | 75 | 정상 | 0 |
| Multi Toggle | `Multi Toggle` | 10 | 정상 | 0 |
| Dropdown | 글자/체크박스/전체선택 3행 | 54 | 정상 | 0 |

`liveRows is not defined` 로 통째 렌더 실패했던 흔적은 없다.

## 3-G. 안내 화면 Action 2줄 분리(R-1) → ✅

Action 행이 `24시간제` / `오전·오후` / `Disabled공통` 3줄이고 각 줄 3크기 전부 실물 인스턴스다(폭 전부 150). 렌더 확인: `screens/4v3-guide-action-150.png` — Default·Hover·Filled·Disabled·Focus 가 **모두 같은 폭**으로 정렬되어 river 지적(Filled 에서 칸이 줄어듦)이 눈으로도 해소됐다.

## 3-H. 🟡 이번에 새로 찾은 것 (범위 밖 · 2회차에서 내가 놓친 것 포함)

| # | 무엇 | 근거 |
|---|---|---|
| R-9 | **「패널 상태 — 오전·오후(12시간제)」 표가 자기 그리드 셀보다 16px 넓다**(1440px 뷰포트에서 need 1004 / avail 988). **2회차 F-7 을 검증하면서 내가 표 넘침을 재지 않아 놓쳤다.** — **원인은 150 이 아니다**: 페이지에서 `min-width` 를 78 로 임시 되돌리는 통제 실험을 했더니 오히려 **1024 로 더 넓어졌다**(194px 12h 패널이 원인). 시각 피해는 없다 — 마지막 열 패널이 셀 밖으로 15.5px 나오지만 `preview-area`(`overflow-x:auto`, scrollWidth 1052 < width 1054)가 흡수해 **잘림·스크롤바 없음** | 라이브 실측 + 통제 실험 |
| R-10 | `pages/components.html` 에 **레거시 Time Picker 죽은 코드가 남았다** — CSS `.s1-timepicker-*`(1158줄~, `.s1-timepicker-select-*` 포함)과 JS `setupTimePicker`(4921줄~). 마크업이 제거돼 `querySelectorAll` 이 빈 결과라 no-op 이고 **콘솔 오류 0** 이지만, **`78px` 숫자의 출처**(1161·1226줄)이자 정본에 없는 「TimePicker Select」(D3 로 만들지 않기로 한 형태)의 잔재다 | 1회차 B4(정적 마크업 717줄 제거)의 뒷정리 누락 |

## 3-I. 이번 회차에 검증하지 않은 것 (정직 표기)

- 지시대로 **2회차 PASS 범위는 다시 보지 않았다**(패널 geometry·구분선·inset 그림자·키보드·init/destroy·data-value 폴백·패널 상태 표출·아이콘·토큰). 다만 `min-width` 는 트리거에만 적용되고 패널 폭은 `data-type` 고정값이라 상호 간섭이 없음을 실측으로 확인했다(패널 121/194 불변).
- Figma 캔버스 대조 없음(MCP 미인증, 이 작업의 시각 정본은 코드).
- 실제 마우스 hover·스크린리더·실기기 터치 없음.
- **파일을 고치지 않았고 `workflow-state.json` 도 건드리지 않았다.** 임시 캡처 하네스와 실험용 `<style>` 은 모두 제거했다(파일 무수정, 메모리상 실험).

---
---

# (이력) 2회차 판정: ✅ PASS

❌(a) **0건** · ❓(c) 0건 · BLOCKED 0건 · 🟡 기록 7건.

| 권장 | 값 |
|---|---|
| `workflowStatus` | `in-progress` |
| `uiLibraryStatus` | `verified` (river UX 승인 대기) |
| `checkpointLog[4].status` | `passed` |
| `nextAction` | 5-human-review — river 검수 |

> 지시대로 **1회차에 PASS 였던 범위도 전부 다시 봤다.** `time-picker.js` init 과 `time-picker.css` 구조가 바뀌었으므로 키보드·다중 인스턴스·init/destroy·빈 HTML 소비·묶음↔개별 동일성·dist 재생성·지문을 재실측했다(§2-B). 오케스트레이터가 보고한 수치는 **하나도 그대로 받아들이지 않고 전부 다시 쟀다.**

---

## 2-A. 지적 8건 재검증 — 전부 해소

| # | 1회차 지적 | 2회차 실측 | 판정 |
|---|---|---|---|
| F-1 | 「확인」이 두 화면에서 무반응 | 안내 화면 라이브 인스턴스 + 검수 화면 **4패널 전부**(Light·Dark × PC·Mobile)에서 `change={value:"09:30",hour:"09",minute:"30",ampm:null,type:"24h"}` · 트리거 `09:30` · `data-filled="true"` · `aria-expanded="false"` · 패널 닫힘 · **포커스 트리거 복귀** · 옆 인스턴스 무간섭 | ✅ |
| F-2 | 테두리·그림자를 `columns`/`footer` 가 나눠 가져 치수 어긋남 | 아래 §2-A-1 별도 판정 | ✅ |
| F-3 | 확인 줄 구분선이 패널 폭 전체 | 아래 §2-A-2 별도 판정 | ✅ |
| F-4 | 트리거↔패널 간격 8px | 실측 **4px** (정본 `build-components.ts:2363` `itemSpacing = 4`) | ✅ |
| F-5 | 실재하지 않는 토큰 참조 + 검사 약화 | 아래 §2-A-3 별도 판정 | ✅ |
| F-6 | `destroy`→`init` 후 `aria-expanded` 어긋남 | dist 모듈 직접 호출: 열린 채 `destroy` → `init` → `aria-expanded="false"` · 패널 숨김 · 트리거 테두리 `rgb(217,217,217)`(기본, 파란 열림 테두리 아님) | ✅ |
| F-7 | 패널 상태 과대 선언 | 아래 §2-A-4 별도 판정 | ✅ |
| F-8 | Focus 칸이 정본에 없는 문구 | Focus 칸 3개(XXSM·XSM·MD) 전부 트리거 `"시간 선택"` · 색 `rgb(117,117,117)`(placeholder) · 패널은 `24h / 시 Selected / 확인 disabled` = 정본 `BUILT_COMPS["TPD:focus-default"]` 와 동일 | ✅ |

### 2-A-1. F-2 — `box-shadow: inset` 이 정본 `strokeAlign="INSIDE"` 의 옳은 대응인가 (독립 판정)

오케스트레이터의 근거를 그대로 받아들이지 않고 **정본 산술로 직접 검증했다.**

정본 `fillPanel`(`build-components.ts:2519-2531`)에서 패널 폭은 121, `strokeWeight=1`·`strokeAlign="INSIDE"` 이고, `colsFrame` 은 `resize(panelW=121, 192)` + `layoutAlign="STRETCH"` 다.
그 안에서 `paddingLeft/Right=8`, `itemSpacing=8`(자식 3개 → 간격 2칸=16), 구분선 1 이므로

```
열 폭 = (121 − 16 − 16 − 1) / 2 = 44   ← 정본이 따로 선언한 TPC_W 와 정확히 일치
```

**정본 자신의 산술이 "INSIDE stroke 는 내용 폭을 깎지 않는다"를 증명한다.** stroke 가 2px 를 먹었다면 43.5 가 되어 `TPC_W = 44` 선언과 모순된다.
CSS `border` 는 border-box 에서 내용 폭을 깎지만 `box-shadow: inset` 은 레이아웃에 영향을 주지 않고 안쪽에 겹쳐 그린다 → **동작이 정확히 대응한다.** 판정: 정본 부합.

실측(안내 화면 열린 패널, Light):

| 항목 | 정본 | 1회차 | **2회차** |
|---|---|---|---|
| 패널 폭 (24h / 12h) | 121 / 194 | 121 / 194 | **121 / 194** ✅ |
| 패널 위여백 | 12 (`TPD_PAD_TOP`) | 12 안에 목록 포함 | **12 (목록 바깥)** ✅ |
| 목록 높이 | 192 (`TPD_COLS_H`) | 179 ❌ | **192** ✅ |
| 열 폭 24h / 12h | 44 (`TPC_W`) / 48 | 43 / 47.33 ❌ | **44 / 48** ✅ |
| 열·구분선 높이 | 192 | 179 ❌ | **192 / 192** ✅ |
| 셀 높이 | 32 (`TPC_H`) | 32 | **32** ✅ |
| 그림자 | 패널 1겹 | columns+footer 2겹 ❌ | **패널 1겹**, columns·footer `none` ✅ |
| 패널 총높이 | 12+192+1+푸터 | 235 | **246** (12+192+42) ✅ |

- `columns` 는 `height:192` + `padding:0 8px` 만 갖는다(실측 `colsPad "0px 8px"` · `borderTop 0px` · `boxShadow none`) — 정본 `colsFrame` 과 동일.
- 패널 `overflow:hidden` + `radius 4` = 정본 `clipsContent=true` + `cornerRadius=4` ✅. 60칸 목록에서 마지막 칸 `59` 까지 열 내부 스크롤로 도달하고 패널 안에 정상 표시됨(clip 회귀 없음).
- 🟡 정직한 단서: Figma 는 프레임 stroke 를 자식 **위에** 그리고 CSS `inset` 그림자는 자식 **아래**에 그린다. 다만 열은 좌우 8px 안쪽이고 위 12·아래 푸터 패딩이 있어 **어떤 내용도 그 1px 링에 닿지 않으므로 관측 가능한 차이가 없다.** 렌더에서 링이 4면 모두 보이는 것도 확인했다.

### 2-A-2. F-3 — 확인 줄 구분선

정본(`build-components.ts:2540-2547`)은 `paddingLeft/Right=8` 짜리 1px 높이 wrapper 안에 `panelW−16` 길이의 선을 둔다.
웹은 투명 `border-top: 1px` 으로 그 1px 행 높이를 유지하고, 선은 `linear-gradient` 를 `background-origin: border-box` · `50% 0` · `calc(100% - 16px) 1px` 로 그린다.

실측: `backgroundSize "calc(100% - 16px) 1px"` · `backgroundOrigin "border-box"` · `backgroundPosition "50% 0px"` · `borderTop "1px rgba(0,0,0,0)"` → **정본과 같은 위치·같은 길이·같은 1px 행**. 렌더에서도 선이 패널 폭 전체가 아니라 안쪽에만 그어진다(Light·Dark 스크린샷). ✅

### 2-A-3. F-5 — 토큰 교정과 검사 강도 (독립 판정)

- **토큰 실재 확인**: 실제 렌더에서 `--color-text-title-primary` = Light **`#000000`**(`base/black`) · Dark **`#ECEDF0`**(`gray-dark/900`). 1회차의 빈 문자열과 달리 실값이 나온다(`assets/css/tokens.css:621, 839`).
- **선언이 실제로 먹는다**: 모든 `.variant-label` 이 두 테마에서 **토큰값 그대로** 계산된다(고유 색 1개). 1회차처럼 상속으로 떨어지지 않는다.
- **검사가 실질 보증을 회복했는가 → 예.** `test.mjs:434` 정규식에 적대 입력을 넣어 확인했다(메모리상, 파일 미수정):

| 변조 | 검사 결과 |
|---|---|
| 하드코딩 `#111827` 로 되돌림 | ✅ 차단 |
| 없는 토큰 `--color-text-default` | ✅ 차단 |
| 다른 토큰 `--color-text-body-secondary` | ✅ 차단 |
| `font-size: 16px → 13px` | ✅ 차단 |
| `font-weight: 700 → 400` | ✅ 차단 |

  1회차와 결정적으로 다른 점: **못박은 토큰이 실제로 값을 갖는다.** 따라서 색 보증이 형식이 아니라 실효다.
- **다른 승인 컴포넌트 회귀 없음**: `.variant-label` 을 함께 쓰는 다른 섹션(chip·filter-chip 등)을 Light·Dark 양쪽에서 표본 확인 — 전부 같은 토큰값, 양쪽 모두 읽힌다. `ui:guide:render`(18종 × PC·Mobile 실렌더 대조)도 통과.
- 🟡 기록: Light 제목색이 원래 하드코딩 `#111827` → 이제 `#000000` 으로 **실제로 바뀐다**(하드코딩을 벗어나는 이상 불가피). 가독성 회귀는 없고 정본 title 토큰을 쓰는 쪽이 맞다고 본다. 다만 "색이 변하지 않았다"가 아니라 "정본 토큰 값으로 바뀌었다"가 사실이다.

### 2-A-4. F-7 — `data-cov-states` 선언이 실제 표출과 일치하는가 (재판정)

실측: 안내 화면에서 **보이는 열린 패널 11개**의 상태를 전수 판독했다.

| 유형 | 표출된 정본 State | 확인 버튼 |
|---|---|---|
| 24h | 시 Hover · 시 Selected · 분 Hover · 분 Selected | 비활성·비활성·비활성·**활성** |
| 12h | 시 Hover · 시 Selected · 분 Hover · 분 Selected | 비활성·비활성·비활성·**활성** |
| 24h (Focus 칸 3개) | 시 Selected | 비활성 |

정본 `tpdStates`(`build-components.ts:2578-2583`)의 confirm 플래그 `false,false,false,true` 와 **정확히 일치**한다. 12h 의 `오전` 고정 선택도 정본 `ampm: type==="12h" ? 0 : undefined` 와 일치.
표 제목도 「패널 상태 — 24시간제 / 오전·오후(12시간제)」로 정본 세트 이름을 쓰고 열 머리에 `확인 비활성/활성`을 함께 적었다.
「목록 칸 상태」는 정본 **Time Picker Cell 세트 3변형**(Default·Hover·Selected)만 `Cell` 한 줄로 줄였다 — 정본 변형 수와 표출 수가 1:1.

→ `data-cov-states="default,hover,focus,filled,disabled,selected,시 hover,시 selected,분 hover,분 selected"` 는 이제 **선언 = 실제 표출**이다. 과대 선언 해소. ✅

---

## 2-B. 1회차 PASS 범위 재검증 (구조가 바뀌었으므로 전부 다시 쟀다)

| 항목 | 2회차 재실측 | 판정 |
|---|---|---|
| dist 재생성 | `ui:build` 재실행 → 작업트리 dist **바이트 동일**(손편집 0) | ✅ |
| 정본 지문 | manifest `canonicalFingerprint` 재계산 = 선언값 일치 · `workflow-state.json` `canonicalInputs` sha256 **5건 전부 일치** | ✅ |
| 검사기 | `ui:contract` errors=0 · `ui:test` PASS · `ui:guide:render` PASS(18종) · `ui:icons` icons=12 errors=0 · `icon-origin` clock **0.00988** < 0.015 · Gate 19 newGaps=**0** | ✅ |
| 키보드 전 경로 | 트리거 ArrowDown 열기 → 첫 칸 포커스 · ArrowDown 이동 · Enter 선택 · **ArrowRight 로 minute 열 이동** · Enter 선택 → 확인 활성 · **Esc 닫고 트리거 복귀** · 확인 클릭 → `change={value:"01:01",…}` | ✅ |
| init 멱등 | `init` 두 번 호출 시 같은 api 반환 | ✅ |
| destroy 정리 | destroy 후 트리거 클릭 무반응(리스너·MutationObserver 해제) | ✅ |
| 재 init | 칸 중복 생성 없음(24/60 유지) · 재열기 정상 | ✅ |
| 다중 인스턴스 | 한 인스턴스 확정이 옆 인스턴스에 영향 없음(`시간 선택` 유지) | ✅ |
| 빈 HTML 소비(묶음) | 24/60칸 · `09:30` · `data-filled` · 닫힘 · 포커스 복귀 | ✅ |
| 빈 HTML 소비(개별) | 동일 결과 + geometry 동일(패널 121×246 · gap 4 · 목록 192 · 열 44 · 그림자 1겹) · 트리거 44 · 아이콘 24×24 · mask → `dist/assets/icons/clock.svg` | ✅ |
| 묶음↔개별 DOM 동일성 | 두 소비자 `<main>` innerHTML **완전 일치**(9,889자) | ✅ |
| **런타임 폴백 신규 검증** | `data-value` 가 **전혀 없는** 정적 칸으로 새 인스턴스를 만들어 `init` → 보이는 글자로 `data-value` 백필(`07/08/05/25`) → 확인 → `change={value:"08:25",…}` | ✅ |
| 계약 문서화 | manifest `htmlContract.panel` 과 `relations` 에 「정적으로 채울 땐 cell 에 `data-value` 를 준다」 명시됨 — 1회차에 지적한 계약 공백 메워짐 | ✅ |
| 트리거 5상태 × 3크기 | 28/34/44 · 12/14px · 10·6 / 12·8 / 16·8 · 아이콘 20/24 · radius 4 · Hover `#FAFAFA` · 열림 테두리 `#1D6CEB` · Filled 본문 `#353535` · Disabled 3색 — 전부 정본 일치. Mobile MD 48px × 2유형 × 5상태도 확인 | ✅ |
| 렌더 위생 | 문서 전체 중복 `id` **0건** · 콘솔 오류 **0건** · mask `url()` 404 없음 | ✅ |
| 검수 화면 dist 소비 | `ui-review.html` 은 dist CSS 3개만 로드, 페이지 CSS 는 배치 슬롯만 건드림 · 안내 화면 「개발 코드」 3탭은 dist 의 example/css/js 를 실제 fetch | ✅ |
| 셀 줄바꿈 | `오전`/`오후` 각각 한 줄 (Light·Dark 렌더) — 1회차 근거(정본 자동폭 텍스트는 줄바꿈 없음) 유지 | ✅ |

**스크린샷 (2회차)**

| 파일 | 내용 |
|---|---|
| `screens/4v2-guide-pc-light.png` | 안내 화면 PC Light — Action · 상태 5×크기 3 · **패널 상태 4종 표** |
| `screens/4v2-guide-pc-dark.png` | 안내 화면 PC Dark — 동일 범위 |
| `screens/4v2-review-dark.png` | 검수 화면 — 24h·12h 패널 상태 4종 + PC·Mobile Dark |

1회차 스크린샷(`4v-*.png`)은 수정 전 상태로 남겨 둔다.

---

## 2-C. 🟡 기록 — 결함은 아니나 남겨 둘 것

| # | 무엇 | 근거·권고 |
|---|---|---|
| R-1 | manifest `status: "verified"` 를 **독립 검증 전에** 박아 두었다. 1회차 FAIL 기간 내내 `dist/components/time-picker.manifest.json` 이 "기술 검증 통과"라고 배포되고 있었다. 지금은 값이 사실이 되었으나 **순서가 거꾸로였다** | 권고: 빌더는 `candidate` 로 쓰고, `verified` 전환은 이 보고서의 PASS 뒤에 한다. 다른 17개 컴포넌트는 전부 `approved` |
| R-2 | `ui-library-migration.json` 에 time-picker 레코드 없음(grep 0건) | 6-promotion 으로 미룬 것은 수용. **승격 전 필수**(배선표 §1-4) — 잊히면 안 된다 |
| R-3 | `component-presentation-policy.json` 의 time-picker 가 `"platform": "pc"` 인데 안내 화면은 Mobile 섹션을 그리고 manifest 는 mobile break 를 선언. `subComponents: ["input","select"]` 도 manifest `coreComponents: []` 와 어긋남 | 1회차에서 지적했고 미처리. 값은 명확(pc+mobile)하므로 river 결정 사항 아님 |
| R-4 | `destroy()` 만 하고 `init` 하지 않으면 열린 패널이 **리스너 없이 열린 채** 남는다(Esc·바깥클릭으로 못 닫음). `init` 이 정규화하므로 F-6 은 해소됐지만 destroy 단독 경로는 그대로 | 계약 `requiredLifecycle` 은 리스너 해제만 요구하므로 ❌ 아님. `destroy` 가 닫고 나가면 더 안전 |
| R-5 | 정적으로 미리 채운 열에 선택 칸이 없으면 그 열에 `tabIndex=0` 진입점이 안 생긴다(런타임 생성 경로는 첫 칸에 0을 준다) | 패널은 닫힌 상태에서만 그러하고, `open()` 의 `focusInitial()` 이 모든 열을 정규화하므로 관측되지 않음 |
| R-6 | 안내·검수 화면 라이브 인스턴스는 여전히 정적 4칸 표본이라 `data-minute-step` 과 river 결정 D2(기본 1분·조절 가능)가 화면에서 실증되지 않는다 | 배포본에서는 24/60 으로 정상 동작 확인. 검수 문구·예제로 보완 여지 |
| R-7 | Light `.variant-label` 색이 `#111827` → `#000000` 으로 실제 변경(전 승인 컴포넌트 공통) | 하드코딩 탈출의 불가피한 결과이며 정본 title 토큰 사용이 옳다고 본다. 가독성 회귀 없음 |
| R-8 | `npm run gate:check` = 3 error — 전부 **설치기 zip 카드 날짜**(`installer:build` 필요)로 time-picker 와 무관 | Gate 19 는 newGaps=0 으로 통과 |

## 2-D. 검증하지 못한 범위 (정직 표기)

- **Figma V3.0 캔버스 대조 없음.** 상태 파일이 시각 정본을 코드로 선언했고(`figmaSources.source: not-consulted`), Figma MCP 는 이 세션에서 인증되지 않아 접근 자체가 불가능하다.
- **실제 마우스 hover 미검증.** 두 화면 모두 `data-force-state="hover"` 흉내이며, 강제 규칙이 dist 와 같은 토큰을 쓰는지만 코드로 확인했다.
- **스크린리더 실주행 없음.** ARIA·포커스는 DOM 실측으로만 확인했다.
- **모바일 실기기 터치 없음.** 뷰포트 전환 렌더로만 봤다.
- 지시대로 **어떤 파일도 고치지 않았고 `workflow-state.json` 도 건드리지 않았다.** 임시 캡처 하네스 1개를 만들었다가 삭제했다.

---
---

# (이력) 1회차 검증 — ❌ FAIL 8건

- 대상: `time-picker` · 계약 `registry/governance/ui-library-code-contract.json` v0.1.2 (candidate)
- 검증자: 🤖 `component-verifier` (빌드 주체와 분리) · 2026-09-03
- 절차: `.claude/skills/ui-library-code/references/verify-F.md` 11단계 + `wiring-and-traps.md` §2 함정 회피
- 렌더는 전부 **http**(`localhost:4173`)로 수행했다. `file://`·`#앵커` 캡처는 T2·T4 로 빈 화면이 나와 iframe 하네스로 우회했다(하네스는 캡처 후 삭제).

## 판정: ❌ **FAIL**

❌(a) 8건 · 🟡 기록 6건 · ❓(c) 0건 · BLOCKED 0건.
그중 **F-1 은 river 검수(5단계)를 진행할 수 없게 만드는 기능 파손**이다.

| 권장 | 값 |
|---|---|
| `workflowStatus` | `in-progress` |
| `uiLibraryStatus` | `draft` (승격 불가) |
| `checkpointLog[4].status` | `failed` |
| `nextAction` | 3-build 로 되돌아가 F-1~F-8 수정 후 재검증 |

---

## ❌ (a) 코드 실수 — 수정 대상

### F-1 「확인」 버튼이 안내 화면·검수 화면 양쪽에서 **아무 일도 하지 않는다** 🔴 최우선

두 화면 모두 "**확인**을 눌러야 값이 남습니다"라고 문구로 약속해 놓고 실제로는 값이 남지 않는다.

- **재현**(실측): `http://localhost:4173/pages/ui-review.html` → 16. Time Picker → 「실제로 눌러보기」 트리거 클릭 → 시·분 칸 클릭 → 확인 클릭.
  결과: `s1:time-picker:change` = `null` · 트리거 문구 `"시간 선택"` 그대로 · `aria-expanded` 여전히 `"true"`(패널 안 닫힘).
  `pages/components.html#time-picker` 의 Action 영역도 동일.
- **원인**: 런타임은 자기가 만든 칸에만 `data-value` 를 넣는다(`time-picker.js:79`). 두 화면은 칸을 **정적 마크업으로 미리 채우면서 `data-value` 를 빼먹었다.**
  - `assets/js/ui-library-guide.js:1493-1495` — `timePickerCell()` 이 `data-s1-part`·`role`·`aria-selected` 만 출력
  - `pages/ui-review.html:1327-1331` — `timePickerColumn()` 동일
  - `time-picker.js:104-106` `formatValue()` 가 `selectedCell(...).dataset.value` → `undefined` → `null` 반환 → `handleConfirmClick`(`:206-208`)이 조용히 early return
- **배포본 자체는 정상**이다. `ui-library/verification/empty-consumer.html` 에서는 24/60칸 생성 · 확인 → `09:30` · `data-filled=true` · 패널 닫힘 · 포커스 트리거 복귀 · change 이벤트 `{value:"09:30",hour:"09",minute:"30",ampm:null,type:"24h"}` 모두 통과했다.
- 따라서 고칠 곳은 **두 화면의 마크업**(칸에 `data-value` 부여)이거나, 계약이 "정적 마크업 허용"을 유지한다면 런타임이 `textContent` 로 폴백하도록 하는 것이다. **manifest `htmlContract` 가 "정적 마크업으로 미리 채워도 된다"고 허용하면서 `data-value` 가 필수라는 사실을 어디에도 적지 않은 것**이 이 사고의 계약상 뿌리다.

### F-2 패널 테두리·그림자를 패널이 아니라 **안쪽 `columns`·`footer`** 에 걸어 치수가 정본과 어긋난다

`time-picker.css:115-130`(columns) · `:180-190`(footer) 가 테두리·그림자·모서리를 나눠 가진다. 정본은 **패널 한 프레임**이 테두리(INSIDE 1px)·radius·그림자를 가지고, 그 안에 `cols`(192) → 구분선 → 푸터를 넣는다(`build-components.ts:2519-2531` `fillPanel`).

| 항목 | 정본 | 실측(웹) | 차이 |
|---|---|---|---|
| 목록 영역 높이 | 192 (`TPD_COLS_H`, 패널 `paddingTop:12` 은 **그 위에 따로**) | **179** (`columns` 192 안에 패딩 12 + 테두리 1 이 포함) | −13 |
| 24h 열 폭 | 44 (`TPC_W`) | **43** | −1 |
| 12h 열 폭 | 48 | **47.33** | −0.67 |
| 그림자 | 패널 1겹 | **columns·footer 2겹** | 중복 |

- 실측 방법: 열린 패널에서 `getBoundingClientRect()` — `columns 121×192 · padding 12px 8px 0 · border-top 1px · box-sizing border-box` → 열 높이 179, 열 폭 43.
- **manifest 가 스스로 모순된다**: `manifest.json` geometry.panel 이 `columnsHeight: "192px"` 와 `paddingTop: "--spacing-12"` 를 **따로** 선언해 놓고, CSS 는 192 안에 패딩을 넣었다.
- CSS 주석(`:162-163`)의 "컬럼 폭 48" 도 실제로는 47.33 이라 근거가 틀렸다 — 같은 원인이다.

### F-3 확인 줄 위 구분선이 **패널 폭 전체**로 그어진다 (정본은 좌우 8px 안쪽)

- 정본 `build-components.ts:2540-2547`: `fdivWrap` 에 `paddingLeft/Right = 8`, 선 자체는 `panelW - 16`.
- 웹 `time-picker.css:188-190`: `[data-s1-part="columns"] + [data-s1-part="footer"] { border-top: … }` → 실측 **121px 전체**. 정본 기대값 105px.

### F-4 트리거와 패널 사이 간격 8px (정본 4px)

- 정본 `build-components.ts:2363` — Time Picker 컴포넌트 `itemSpacing = 4`.
- 웹 `time-picker.css:103` — `margin-top: var(--spacing-8)` → 실측 8px.
- **Select 에서 그대로 옮겨온 값으로 보인다.** Select 는 정본이 실제로 8 이다(`build-components.ts:1434` `comp.itemSpacing = 8`) — 그래서 Select 는 맞고 Time Picker 만 틀렸다.

### F-5 `.variant-label` 을 **존재하지 않는 토큰**으로 바꿨다 — 지시받은 (c) 항목 판정

3-build §5 는 하드코딩 `#111827` 을 `var(--color-text-default)` 로 바꾸고 "R01(HEX 금지)과도 일치"라고 적었다. **그 토큰은 정본에도 파생에도 없다.**

- 실측: 실제 렌더에서 `getComputedStyle(document.documentElement).getPropertyValue('--color-text-default')` = **빈 문자열**.
  `grep -rn -- "--color-text-default" assets/css/` → **0건**. 정본 계열은 `--color-text-title-primary`(light `base/black` · dark `gray-dark-900`) · `--color-text-body-primary` 뿐이다(`assets/css/tokens.css:611-622, 829-840`).
- 따라서 `color` 선언은 무효가 되어 **부모 색을 상속**한다. 실측 상속값 — Light `rgb(53,53,53)` · Dark `rgb(236,237,240)`. 다크에서 글자가 보이는 것은 **선언이 맞아서가 아니라 상속이 우연히 맞아떨어진 것**이다.
- **검사가 약해졌는가 → 예, 실질적으로 약해졌다.** `ui-library/scripts/test.mjs:434` 는 이제 그 없는 토큰을 정규식으로 못박는다. 크기(16px)·굵기(700) 보증은 그대로지만 **색 보증은 사라졌다** — 아무 색도 확정하지 않는 선언을 검사가 확정하고 있다. 검사가 "지금 상태"를 통과시키도록 맞춰졌다.
- **다른 승인 컴포넌트 회귀**: `.variant-label` 은 `pages/components.html` 의 15개 이상 블록(Dropdown·Calendar·Tab·Pagination 등)이 함께 쓴다. Light 에서 제목색이 `#111827` → `#353535` 로 **선언 없이 조용히 바뀌었다.** 읽히기는 하나 의도된 변경이 아니다.
- 조치: 실존 토큰(`--color-text-title-primary` 권장)으로 바꾸고 test.mjs 정규식도 그 토큰으로 되돌린다. CLAUDE.md 「새 토큰은 정본 확인 + 미정의 시 생성 금지」에 따라 새 토큰 신설은 승인 사항이다.

### F-6 `destroy()` 후 `init()` 하면 `aria-expanded` 가 패널과 어긋난다

- 실측(empty-consumer, dist 모듈 직접 호출): 패널이 열린 상태로 `destroy(root)` → `aria-expanded="true"` · 패널 보임 그대로 남는다. 이어서 `init(root)` → `panel.hidden = true`(`time-picker.js:93`)는 되지만 **`aria-expanded` 는 손대지 않아** `aria-expanded="true"` + 패널 숨김 상태가 된다.
- 눈에도 보인다: `time-picker.css:85-88` 이 열림(=정본 Focus) 테두리를 `[aria-expanded="true"]` 로 걸고 있어, **닫힌 트리거가 파란 선택 테두리로 그려진다.**
- 조치: `init` 이 `aria-expanded` 를 무조건 `"false"` 로 정규화하거나, `destroy` 가 닫고 나가야 한다.

### F-7 안내 화면 「목록 칸 상태」의 정본 대표성 — 지시받은 (b) 항목 판정: **과대 선언**

`pages/components.html:3297` 이 `data-cov-states="…,시 hover,시 selected,분 hover,분 selected"` 를 선언한다. Gate 19 는 정적 파서라 **선언만 보고 실제 표출은 못 본다.**

- 실측: 안내 화면에서 열려 있는 패널 **6개 전부가 같은 한 가지 상태**다 — 시=09 선택 · 분=30 선택 · 확인 활성. 정본 이름으로는 `분 Selected` 하나뿐이다.
- 정본 `Time Picker Dropdown` 은 Type 2 × State 4 = **8변형**이고 그중 3상태(`시 Hover` · `시 Selected`(분 미선택) · `분 Hover`)와 **확인 버튼의 disabled 표시는 화면 어디에도 없다.** 정본은 4상태 중 3개가 확인 disabled 다(`build-components.ts:2578-2583`).
- 「목록 칸 상태」 블록은 정본 **Time Picker Cell 세트(Default·Hover·Selected 3변형)** 를 시("09")·분("30") 두 표본으로 두 줄 보여준 것이다. 셀 자체는 시·분 구분이 없는 **같은 3변형**이라 6칸은 3변형의 중복 표시다.
- 따라서 `assets/js/ui-library-guide.js:1573-1575` 주석의 "정본 이름 그대로 시·분 두 줄로 보인다"는 **부정확하다** — 정본의 그 이름들은 *패널* 상태이지 *칸* 상태가 아니다.
- 조치(둘 중 하나): ①패널 상태 4종(최소한 확인 disabled 인 상태 1개 포함)을 실제로 표출하고 선언을 유지하거나, ②선언을 실제 표출 범위로 줄이고 주석을 고친다. 선언만 남기는 것은 Gate 19 를 통과시키되 사실이 아니다.

### F-8 Focus 칸이 정본에 없는 문구를 보인다

정본 Focus 변형은 `txt: "시간 선택"` · `tc: text/placeholder`(`build-components.ts:2333`). 웹 안내·검수 화면은 Focus 칸에 **"09:30" 을 placeholder 회색으로** 그린다(실측: `color rgb(85,87,95)` = placeholder, 문구는 값). 스크린샷에서 Filled 행의 진한 "09:30" 과 나란히 놓여 "값인데 흐린 글자"로 보인다.
- 조치: 문구를 `시간 선택` 으로 되돌리거나(정본), 값 표시가 의도라면 `data-filled` 를 함께 주어야 한다.

---

## ✅ 통과 항목 (근거 포함)

### P-1 셀 `white-space: nowrap` — 지시받은 (a) 항목 판정: **정본 부합, 유지**

근거 없이 "그럴듯해서" 통과시키지 않았다. 정본 코드로 확인했다.

- `makeBoundText`(`build-components.ts:566-581`)는 `figma.createText()` 로 만들고 `textAutoResize` 를 **한 번도 바꾸지 않는다** → Figma 기본값 `WIDTH_AND_HEIGHT`(자동 폭).
- `buildTimePickerCell`(`:2405-2436`)은 텍스트 자식에 `layoutAlign="STRETCH"` 도 `layoutGrow` 도 주지 않는다 → 텍스트가 부모 폭에 묶이지 않는다.
- Figma 에서 **자동 폭 텍스트 노드는 줄바꿈하지 않는다.** 고정폭 부모 안에서 넘칠 뿐이다.
- 렌더 확인: Light·Dark 양쪽에서 `오전`·`오후` 가 각각 한 줄로 그려진다(스크린샷 2건).
→ 정본과 같은 동작이다. **단 CSS 주석의 근거 수치("컬럼 폭 48")는 F-2 로 틀렸으니 주석만 고칠 것.**

### P-2 정본 variant·state·size 전수 (실측)
5상태(Default·Hover·Focus·Filled·Disabled) × PC 3크기 + Mobile MD × Type 2종이 안내·검수 화면과 배포본에 모두 있다. 실측 높이 28/34/44/48 · 글자 12/14 · 좌우여백 10·6 / 12·8 / 16·8 · 아이콘 20/24 · radius 4 — 전부 정본 일치. Hover bg·열림 파란 테두리·Filled 본문색·Disabled 3색 모두 정본 토큰으로 갈린다. **정본에 없는 것을 만들지 않았다**(옛 TimePicker Select 미제작 — D3 준수, 셀 테두리 되살리지 않음).

### P-3 키보드·포커스·ARIA (실제 조작)
트리거 ArrowDown 열기 → 첫 열 첫 칸 포커스 · ArrowUp/Down 같은 열 이동 · ArrowLeft/Right 열 이동 · Enter 선택 · 필수 열이 모두 차야 확인 활성 · **Esc 로 닫고 트리거 포커스 복귀** · 바깥 pointerdown 은 포커스 안 뺏고 닫힘 · `open`/`close`/`change` 이벤트 발화. roving tabindex 로 `role=option` 을 옮겨 다니며 열은 `role=listbox`+`aria-label`(시/분/오전오후)을 갖는다. manifest `a11y`·`htmlContract.relations` 선언대로 동작한다(F-6 제외).

### P-4 다중 인스턴스·init/destroy
`init` 재호출 시 같은 api 반환(중복 배선 없음) · `destroy` 후 클릭 무반응(리스너·MutationObserver 정리) · 재 `init` 시 칸 중복 생성 없음(24/60 유지) · 인스턴스 간 값 간섭 없음. (F-6 만 예외)

### P-5 빈 HTML 소비 · 전체묶음 ↔ 개별설치 동일성
`verification/empty-consumer.html`(autoInit 묶음)과 `verification/empty-consumer-individual.html`(개별 CSS+JS)에서 **같은 결과**: 24/60칸 · 확인 → `09:30` · `data-filled` · 닫힘 · 포커스 복귀. 개별 쪽 트리거 44px · 아이콘 24×24 · mask `dist/assets/icons/clock.svg` 로 해석됨.

### P-6 정본 지문 · dist 재생성
`npm run ui:build` 재실행 → 작업트리 dist 와 **바이트 동일**(손편집 0). manifest `canonicalFingerprint` 재계산 = 선언값 일치. `workflow-state.json` `canonicalInputs` sha256 5건 전부 실제 파일과 일치.

### P-7 안내·검수 화면이 실제 dist 를 쓰는가
`pages/ui-review.html` 은 `dist/assets/css/tokens.css`·`typography.css`·`s1-ui.css` 만 로드하고, 페이지 자체 CSS 는 배치 슬롯(`.review-overlay-slot` 높이)만 건드린다 — 부품 시각 override 없음. 안내 화면 「개발 코드」 3탭은 dist 의 `examples/time-picker.html` · `components/time-picker.css` · `.js` 를 실제로 가져와 그린다(실측). 정적 마크업 717줄 제거는 확인됨(`pages/components.html:3296-3297` 빈 mount + 마커).

### P-8 아이콘 (hit area · frame · glyph 독립 실측)
- **hit area** = 트리거 버튼 전체(28/34/44/48 높이) · **frame** = 24×24 span · **glyph** = SVG 안쪽 `data-s1-part="glyph"` 24×24(실제 잉크는 원 지름 18 + 바늘). 서로 대신 쓰지 않고 각각 쟀다. XXSM 만 frame 20.
- `npm run ui:icons` icons=12 errors=0 · `ui-library-icon-origin-check` clock 오차 **0.00988 < 0.015** · src/dist `clock.svg` **바이트 동일**.
- 🟡 기록: 정본 `buildTimePicker` 안의 폴백 상수 `CLOCK`(`build-components.ts:2327`)은 바늘이 **오른쪽 아래**로, 배포 자산은 **왼쪽 아래**로 향한다. 아이콘 manifest 가 "폴백 상수는 원본이 아니고 원본은 내보낸 PNG"라고 근거와 함께 선언하고 있고 픽셀 대조가 통과하므로 자산 쪽을 정본으로 인정한다. 다만 **정본 코드의 폴백 상수가 원본과 반대 방향인 것은 정본 쪽 부채로 남는다.**

### P-9 렌더 위생
전체 문서 중복 `id` **0건**(T5) · 콘솔 오류 0건 · mask `url()` 404 없음(T9).

### P-10 다크 실제 렌더 (오케스트레이터 미확인 구간)
계산값이 아니라 **실제 스크린샷**으로 봤다. 패널 `#1C1D23` · 테두리 `#3E4049` · 칸 기본 `rgb(184,186,191)` · 선택 `#112B55`/`#4285E8` · 확인 accent `#3070D8` · 아이콘 `#8A8C96`. 글자 전부 읽힌다. 「목록 칸 상태」 제목도 다크에서 읽힌다(단 F-5 — 상속 덕분이지 선언 덕분이 아니다).

**스크린샷**
| 파일 | 내용 |
|---|---|
| `reports/ui-library/time-picker/screens/4v-guide-pc-light.png` | 안내 화면 PC Light — Action + 상태 5×크기 3 + 12h 패널 |
| `reports/ui-library/time-picker/screens/4v-guide-pc-dark.png` | 안내 화면 PC Dark |
| `reports/ui-library/time-picker/screens/4v-guide-pc-dark-cells.png` | 다크 「목록 칸 상태」 + 개발 코드 탭(dist 소비 증거) |
| `reports/ui-library/time-picker/screens/4v-review-pc-light-dark.png` | 검수 화면 PC·Mobile **Light** |
| `reports/ui-library/time-picker/screens/4v-review-dark.png` | 검수 화면 PC·Mobile **Dark** (미확인 구간 해소) |

---

## 🟡 기록 — 결함은 아니나 오케스트레이터가 정리할 것

| # | 무엇 | 근거 |
|---|---|---|
| R-1 | manifest `status: "verified"` 가 **이 검증 전에** 이미 박혀 있다. 다른 17개 컴포넌트는 전부 `approved`, time-picker 만 `verified`. 계약상 `verified` = "기술 검증 통과" 라 자가 선언이다 | `ui-library/src/components/time-picker/manifest.json:4` · 계약 `statusModel` |
| R-2 | `registry/governance/ui-library-migration.json` 에 **time-picker 레코드가 없다**(grep 0건). 배선표 §1-4 필수 항목. 현재 diff 는 toggle·chip 의 river 재확인 기록뿐 | `wiring-and-traps.md §1-4` |
| R-3 | `workflow-state.json` 이 낡았다 — B5 를 열린 blocker 로, nextAction 을 "river 결정 대기"로 두고 있으나 **Gate 19 는 이미 동결돼 newGaps=0** 이다. 세션 기록에서 river 가 AskUserQuestion 으로 "네, Date Picker 때 함께 다시 넣는다"를 실제 선택한 것을 확인했다 → 승인은 실재한다. 상태 파일만 못 따라왔다 | `variant-coverage-check.js` VARCOV_SUMMARY pairs=49 verified=48 baselined=1 newGaps=0 |
| R-4 | 안내·검수 화면의 「실제로 눌러보기」 인스턴스도 정적 4칸 표본을 쓴다 → **`data-minute-step` 과 river 결정 D2(기본 1분·조절 가능)가 화면 어디에서도 실증되지 않는다.** 실측: 라이브 인스턴스 열당 4칸(배포본은 24/60) | 실측 · `ui-library-guide.js:1487-1490` |
| R-5 | `component-presentation-policy.json` 의 time-picker 가 `"platform": "pc"` 인데 안내 화면은 Mobile 섹션을 그리고 manifest 는 mobile break 를 선언한다. `subComponents: ["input","select"]` 도 manifest `coreComponents: []` 와 어긋난다 | 정책 파일 · manifest `dependencies` |
| R-6 | `npm run gate:check` = 3 error — 전부 **설치기 zip 카드 날짜**(`installer:build` 필요)로 time-picker 와 무관. Gate 19 는 통과 | gate:check 출력 |

---

## 검증하지 못한 범위 (정직 표기)

- **Figma V3.0 캔버스 대조는 하지 않았다.** 상태 파일이 `figmaSources.requiredForInventory=false` · `source: not-consulted` 로 선언했고 시각 정본은 코드다. Figma MCP 는 이 세션에서 인증되지 않아 접근 자체가 불가능했다.
- **실제 마우스 hover 는 검증하지 못했다.** 안내·검수 화면 모두 `data-force-state="hover"` 로 흉내 낸 것이고, 강제 규칙이 dist 와 같은 토큰을 쓰는지만 코드로 확인했다(`assets/css/ui-library-guide.css:278-285`).
- **스크린리더 실주행 없음.** ARIA 속성·포커스 이동은 DOM 실측으로만 확인했다.
- **모바일 실기기 터치 없음.** Mobile 은 뷰포트 전환 렌더로만 봤다.
- 지시대로 **어떤 파일도 고치지 않았고 `workflow-state.json` 도 건드리지 않았다.** 임시 캡처 하네스 1개를 만들었다가 삭제했다.
