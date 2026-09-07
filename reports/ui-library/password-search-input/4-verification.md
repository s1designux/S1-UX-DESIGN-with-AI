# UI Library 4단계 검증 — Password Field · Search Input

- 검증일: 2026-09-07
- 검증자: 🤖 component-verifier (실제 spawn · 배경 실행)
- 범위: 시나리오 F + 정본 구조 변경 검증(하드룰 H1②)
- 앞 단계: `3-build.md`

## 판정: **FAIL** — ❌(a) 2건 · ❓(c) 2건 · BLOCKED 0건

**Gate 13 기록 미실행** — FAIL 이므로 `installer-build-verify-check.js --record` 를 돌리지 않았다(정상 절차).

### 선행 확인
기계검사 7종 재실행 전부 종료코드 0(위조 없음). `workflow-state.json` 의 `canonicalInputs` sha256 6건 = 현재 파일 해시 일치(빌더가 경고한 드리프트는 이미 해소돼 있었음). 델타 승계 없이 전수 검증.

---

## ❌ (a) 결함 2건

### A1 — 안내 페이지에서 `Password Field`·`Search Input` 제목이 앞 블록에 붙는다 (시각)
빌더 자백 6번의 실체. 자백은 "Mobile 여백이 좁다"였으나 실측은 **0px**이고 PC 도 절반이 깨져 있다.

| 화면 | 블록 | 앞 요소와의 간격 |
|---|---|---|
| PC | Password Field | **0px** |
| PC | Search Input | 24px (정상) |
| Mobile | Password Field | **0px** |
| Mobile | Search Input | **0px** |

원인:
- `assets/css/ui-library-guide.css:133` — `.uilg-variant-block + .uilg-separator { margin-block: var(--spacing-24) }` 는 구분선 앞이 variant-block 일 때만 여백을 준다. 기본은 `margin: 0`.
- `assets/js/ui-library-guide.js:762` 의 첫 구분선 앞은 `stateSection()` 이 만든 `.uilg-demo-group` 이라 규칙에 안 걸림 → margin 0.
- `assets/js/ui-library-guide.js:770-774`(`mobileContent`) 는 구분선을 안 넣는데(§A-5 준수) 블록 자체에도 margin 이 없다.

결과: "Password Field" 가 Base Input 상태표의 캡션 줄에 얹혀 **앞 표의 라벨처럼 읽힌다.** `ui:guide:render` 포함 기계검사 9종이 전부 초록인 채였다.
확인: `http://127.0.0.1:4173/pages/components.html#input` · `…?platform=mobile#input`

### A2 — `registry/components/input.json` password-field 의 `"position": "left"`
`relatedComposedFields[password-field].anatomy.slots[visibilityToggle].position = "left"`. 실제·정본 모두 **오른쪽 트레일**([눈][지우기])이다. 이번에 `candidate → stable` 로 승격하면서 이 줄만 옛 값으로 남았다.

---

## ❓ (c) river 결정 필요 2건 — (b)로 처리하지 않는다

### C1 — manifest `status: verified` 가 river 승인된 Base Input 을 배포에서 빼버렸다
빌더는 "ZIP 19→18"만 자백했으나 파급이 더 넓다. 인과 확인: `ui-library/scripts/platform.mjs:712` · `scripts/build-ui-package-zip.js:58` 이 `status === "approved"` 로 거른다.

| 표면 | 결과 |
|---|---|
| `ui-library/dist/platform/react/input.jsx` | **삭제됨** |
| `ui-library/dist/platform/vue/Input.vue` | **삭제됨** |
| `dist/platform/manifest.json` | 18종 · input 없음 |
| 개발자 ZIP | 19→18종 |
| `pages/components.html` Input 뱃지 | "승인 완료" → "검수 준비" |

다른 선택지(`candidate`)는 Input 섹션 전체를 에러 화면으로 만든다 — **두 선택지 모두 승인된 코어를 훼손**한다.

### C2 — Figma 정본 Search 액션에 hover 면이 없는데 웹에는 있다
`buildInput.wrapSuffixAction`(`build-components.ts:927-945`)은 hit area 안에 `bg/hover` 바인딩 사각형(visible=false)을 넣지만, 새 `buildSearch.wrapAction`(`:1279-1292`)에는 없다. 웹 `input.css` 의 `@media (hover:hover)` 는 search·clear·password 모두에 hover 배경을 준다.
2-canon-readiness C3 는 "Base Input 규칙 그대로"라고만 적어 hover 면이 범위 안인지 밖인지 갈린다 → (c).

---

## ✅ PASS 항목

### A. 정본 구조 C1~C4 (H1②) — diff 전량 정독
| 항목 | 결과 |
|---|---|
| C1 Mobile MD | `{ size:"MD", brk:"Mobile", h:48, padL:16, padR:0 }` ✅ buildInput 과 동일 |
| C2 상태 3개 | Default·Filled·Disabled, Focus·`makeCaret` 제거, Filled 이 trail(clear+search, spacing 4) ✅ |
| C3 hit area | `actionHitSize = brk==="Mobile" ? 48 : 28` ✅ |
| C4 `ICON_KEYS.eye_show` | allowed-remote-keys / 2-canon-readiness 값과 일치 ✅ |
| 파생 재생성 | guide-model 새 이름 12개 · 구 이름 0건 ✅ |
| Gate 34 | `tracked=617 added=0`, baseline 미수정 확인. 단 Gate 34 는 상태 축소를 안 잡으므로 **C2 근거는 수동 diff** ✅ |

- variant 이름 재배열(`Size, State, Break`) → **(b) 정당** (Break 축 신설에 필수·buildInput 관례·하위 참조 전수 재생성)
- `decorateSetFlat` → `decorateSetGrouped` → **(b) 정당** (선례 16건, spec 폭 752→576 축소, 좌표 충돌 없음)
- ⚠️ **한계**: Figma 캔버스 실제 렌더 육안은 코드 레벨 밖 — 미검증

### B. 웹 계약 (브라우저 실측)
액션 순서(Password `[password][clear]` · Search `[clear][search]`) · 간격(2px/4px) · hit area(PC28/Mobile48) · 아이콘 위치가 Base Input 지우기와 동일 규칙 · `s1:input:search`(Enter 1 + 클릭 1, IME Enter 0) · password 토글 전부(type·aria-pressed·aria-label·mask·초점 복귀) · Search clear 초점 무관 노출 · Password/Base clear 는 focus-within 유지(**회귀 없음**) · destroy/재init 중복 리스너 0 · 중복 id 0 · 콘솔 오류 0 — **전부 ✅**

### C. 실제 렌더 — PC·Mobile × Light·Dark 4벌 직접 확인(빌더가 실패한 Dark 포함)
눈 감김/뜬눈·돋보기·지우기가 네 조합 모두 실제로 그려짐(마스크 404 회색 아님). Disabled 돋보기만 `rgb(196,196,196)`, 활성 `rgb(53,53,53)` — 정본과 일치. Password 눈은 상태 무관 `icon/default` — 정본과 일치.

### D. 빌더 자가판단 6건 판정
| # | 항목 | 판정 |
|---|---|---|
| 1 | status verified → ZIP 18종 | **(c)** = C1 |
| 2 | Search `type="text"` | **(b) 정당** — 정본에 `type=search` 요구 없음, 접근성 손실 없음. 단 예시 파일은 `type` 을 생략했는데 보고서·manifest 는 `type="text"` 라 적음 → 문구만 정정 |
| 3 | Search 액션 hover 미추가 | **(c)** = C2 |
| 4 | `component-anatomy-check.js` 기준 수정 | **(b) 정당 · 검사 약화 아님** — `State=Filled` 정규식이 새 4 variant 전부 매칭(커버리지 3→4 증가), 빠진 `caret` 은 Search 에서 사라진 요소, "매칭 0건 = ❌" 부패 감지 장치 유지 |
| 5 | `lastVerified: null` | **(b) 정당** — 계약이 키 존재만 요구, 미검증 상태를 정직하게 표현 |
| 6 | Mobile 블록 여백 | **(a) 결함** = A1 (자백보다 심함) |

### E. 문서↔코드
`component-behavior.pc.json` 근거 문자열 5개 전부 실재 ✅ · `input.json` search 항목 ✅ (password 항목만 A2) · `manifest.json` actions/icons/breakExamples/relations ✅ · `allowed-remote-keys.json` 주석 외 키 값 변경 **0건** ✅ · 죽은 코드 제거 잔재 0건, Date Picker 재사용분 8건 보존 ✅

---

## 다음 조치
1. **A1 수정** — 안내 페이지 블록 분리. ⚠️ `ui-library-guide.css:133` 은 다른 컴포넌트 공유 → Input 전용으로 좁힐지 규칙을 확장할지 판단 필요.
2. **A2 수정** — `input.json` password-field `position` 정정.
3. **C1·C2 river 결정** 후 반영.
4. 재검증은 **델타**로 충분(A1·A2 수정분 + C1·C2 결정 반영분).

## 이번에 확인하지 못한 범위
- Figma 캔버스에 실제로 그려진 Search Input 세트의 육안 배치(코드 레벨만)
- 다중 인스턴스·전체묶음↔개별설치 파리티 세부는 `ui:test:check` 종료코드로 갈음

---
---

# 4단계 검증 — 2회차 (델타 재검증)

- 검증일: 2026-09-07
- 검증자: 🤖 component-verifier (실제 spawn · 배경 실행)
- 1회차(위)는 `SUPERSEDED` — river 피드백 반영으로 정본 빌더가 다시 바뀌었다(wiring-and-traps §3).

## 판정: **HOLD** — ❌(a) **0건** · ❓(c) 1건 · BLOCKED 0건
**Gate 13 은 PASS 로 기록 완료**(`--by component-verifier --verdict pass --change structural`). `gate:check` 가 FAILED 1 error → **PASSED 0 error** 로 전환됐다.

## A. river 결정 5건 — 전부 PASS

| 결정 | 판정 | 확인 방법 |
|---|---|---|
| D7 Mobile hover 제거 | ✅ | CSSOM 전수 열거 — action hover 규칙 딱 1개. 모바일 액션 33개 중 적격 **0**, PC 36개 중 34 유지. **PC 과잉 삭제 없음** |
| D8 아이콘 간격 | ✅ | 직접 재실측 — 글리프 간격 **12px** · hit **48×48** · 칸 간격 0 · **겹침 0** · 오른쪽 글리프 field 안쪽 12px. PC 무변경 |
| ↳ 지우기 숨김 시 복귀 | ✅ | 값 입력→삭제 실제 구동 — center → flex-end → **center 복귀** |
| D9 안내메시지 | ✅ | 문구만 변경. `git show HEAD` 대조로 `message` 가 **원래부터 optional** 임을 확인 |
| D10 배포 기준 유지 | ✅ | `platform.mjs`·`build-ui-package-zip.js` **diff 0바이트** |
| D11 Search hover 면 | ✅ | Base Input `wrapSuffixAction` 과 **동일 사양**. 세 호출부 인자 전부 정확 |

추가: `GroupedSpecOpts.cellAt` 인자 순서 일치, 4행×3열=12셀 = 컴포넌트 12개 → 스펙시트 빈칸 없음.

## B. 1회차 FAIL 2건

### A1 — Input 은 PASS · Input 밖 파급은 ❓(c)
| 화면 | 블록 | 이전 | 현재 |
|---|---|---|---|
| PC | Password Field | 0px | **49px**(24+선1+24) |
| PC | Search Input | 24px | 49px |
| Mobile | Password Field | 0px | **24px** |
| Mobile | Search Input | 0px | **24px** |

**⭐ 의 부작용 스캔이 놓친 것** — ⭐ 는 "인접쌍 20건, 이상치 0"을 보고했으나 그건 *이상치*를 본 것이지 *무엇이 바뀌었나*가 아니다. 검증자가 새 규칙 2개를 일시 무력화해 before/after 를 직접 대조한 결과: **매치 9개 중 8개의 여백이 바뀌었고 그중 5개가 Input 밖.**

| 섹션 | 블록 | 이전 | 현재 |
|---|---|---|---|
| date-picker | 캘린더 — Year / Month / 기간 hover 미리보기 | 0px | 24px |
| time-picker | 모바일 휠 바텀시트 — 시간만 / 시작 일시 | 0px | 24px |

버그일 가능성은 낮다(같은 증상·같은 값). 다만 **river 승인이 끝난 화면**이 바뀐 사실이 보고되지 않았고, 1회차 검증자가 남긴 갈림길에서 ⭐ 가 혼자 확장을 택했다 → **(b) 아님, (c)** = HD-5.

### A2 — 오탐 판정이 옳다. **NOT-A-DEFECT 확정** ✅
독립 검토 근거 4가지: ① 슬롯이 속한 그룹 설명이 이미 "오른쪽 액션 버튼 그룹" ② 형제 표기가 전부 그룹 기준 ③ `clearAction.description` 이 "visibilityToggle 오른쪽"이라 못박음 ④ **`slots[].position` 을 읽는 소비 코드 0건**(전수 grep) — 재표기가 아무것도 깨뜨리지 않음.

## C. 실제 렌더
모바일 hover 회색 면 **안 나옴**(적격 0) / PC **나옴**(34개). 아이콘 간격 12px, 칸 밖 삐져나옴·테두리 접촉 없음. 제목 독립 블록으로 읽힘. Dark 재계측 — 간격·hit·여백 light 와 동일, `--color-form-control-bg-hover` 정상 해석. `ui-review.html` 외부 의존 = dist 3 + 폰트뿐, 중복 id 0, 콘솔 오류 0.

## D. 파생 전파 — PASS
dist 3곳 byte 동일(`ui:build:check` exit 0) · 설치기 번들 · 개발자 ZIP · devpanel · 지문 19종 · registry 파생 전부 정합. **mtime 전수 조사 — 손 수정 2건(input.css 09:22 · guide css 09:40)뿐, dist·ZIP 직접 수정 흔적 0.**

## 승계한 항목 (mtime 으로 무변경 확인 후)
정본 C1~C4 · decorateSetGrouped·variant 재배열 (b)판정 · 웹 계약 동작 전반(password 토글·검색 이벤트·clear 규칙·destroy) · 아이콘 원본 대조 4벌 · 공유 경로 회귀 · 빌더 자가판단 2·4·5 · 다중 인스턴스/파리티 · 소비자 페이지 배선

## 확인하지 못한 범위
- Figma 캔버스 실제 육안 배치(코드 레벨만 — 웹 렌더는 12px 확인)
- 실제 마우스 hover 스크린샷(패널 미렌더 — CSSOM 전수로 대체)
- Dark 픽셀 캡처(헤드리스 테마 주입 불가 — 계산값 대조로 대체, 델타에 색 변경 0건)

## 범위 밖 관찰
`npm run design:md:check` 세 번째 하위 검사 exit 1 — "PC 사이트에 없는 Modal 행동이 임의 생성됨". Input 과 무관하고 `gate:check` 배선에 없다. 3-build 에서도 같은 항목이 기존 실패로 기록돼 있다.
