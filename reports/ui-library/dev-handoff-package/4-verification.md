# 4-verification — 개발자·퍼블리셔 전달 계층 독립 검증

> work-id: `dev-handoff-package` · 2026-09-04 · 🤖 component-verifier (시나리오 F)
> 검증자는 파일을 고치지 않았다. `workflow-state.json` 도 수정하지 않았다.
> **판정: ❌ FAIL** — 차단 결함 2건(C++ 전달본 컴파일 불가 · 검사기 핵심 규칙 무력화), 그 외 3건.

---

## 0. 판정 요약

| # | 항목 | 판정 | 한 줄 |
|---|---|---|---|
| 1 | 껍데기 ≡ 배포본 마크업 | ✅ PASS | 브라우저 DOM 대조 29/29 일치 (재빌드 후 기준) |
| 2 | 값 변환 정확성 | ❌ FAIL | 값 자체는 1926건 전부 정확 · **C++ 파일이 컴파일되지 않는다(83 errors)** |
| 3 | 허용목록 누수 | ✅ PASS | 19종 × 13필드 전수 일치, 누락·초과 0 |
| 4 | 검사기가 규칙을 지어내는가 | ❌ FAIL | `S1-REIMPL` 은 어느 근거 파일에도 없는 자작 판정 기준 (H6②) |
| 5 | 검사기 적대 시험 | ❌ FAIL | R02(직접 색) 규칙이 평범한 HTML에서 무력화된다 |
| 6 | Gate 46 이 무는가 | ⚠️ HOLD | 선언한 낡음 3경로는 전부 물었다 · **ZIP 내용 변조는 못 문다** |
| 7 | 손편집 흔적 | ✅ PASS | `ui:build:check` exit 0 |
| 8 | 정본 신설 | ✅ PASS | Gate 34 추적 617항목 added=0 |
| 9 | 네이티브 한계 서술 | ✅ PASS | 화면·README 모두 "컴포넌트는 각자 구현" 명시 |

---

## 0-1. 선행 조건 (검증 입력 계약) — 미이행 2건, 진행 근거

| 계약 | 상태 | 조치 |
|---|---|---|
| ① 기계검사 표 | **미제공** | `3-build.md` §9 를 호출자의 주장으로 간주하고 **직접 재실행해 종료코드만** 확인했다(아래). 다음부터는 표 또는 `machine-checks.json` 을 함께 넘겨야 한다. |
| ② 렌더 선캡처 | **미제공** | 이번 작업은 시각 변경이 없어 판정에 영향 없음. 대신 항목 1을 **직접 헤드리스 크롬으로 실측**했다. |
| ③ 델타 재검증 | 해당 없음 (초회 검증) | — |

**기계검사 재실행 결과 (위조 방지용 종료코드 확인):**

| 명령 | exit |
|---|---|
| `ui:contract` · `ui:build:check` · `ui:test:check` · `ui:icons` · `ui:icons:origin` · `ui:guide:render` · `ui:zip:check` · `devpanel:check` · `platform:tokens:check` | 전부 **0** |
| `ui:state` | 0 (경로 인자 필요 — 인자 없이 부르면 1) |

> **검증 도중 구현이 바뀌었다.** 호출자가 브라우저 실측으로 결함 5건을 고쳐 `dist` 를 재빌드했다(`3-build.md` §10). **옛 dist 기준으로 낸 항목 1 판정은 폐기하고 현재 dist 로 다시 검증했다.** 항목 2~9 는 재빌드와 무관한 영역이라 그대로 유효하다.

---

## 1. 껍데기 ≡ 배포본 마크업 — ✅ PASS

**방법(test.mjs 를 믿지 않는 독립 경로):** 헤드리스 크롬에 각 예제 HTML 과 각 껍데기 MARKUP 을 `DOMParser` 로 넣고, 브라우저 자신이 만든 DOM 의 `outerHTML` 을 비교했다. 구현의 정규식 로직과 완전히 독립된 파서다.

| 검사 | 결과 |
|---|---|
| 예제에서 브라우저가 찾은 `[data-s1-component={id}]` ≡ 껍데기 MARKUP | **29/29 일치** |
| React MARKUP ≡ Vue MARKUP | 29/29 일치 |
| MARKUP 이 최상위 요소 **정확히 1개** | 29/29 |
| MARKUP 루트가 실제로 그 컴포넌트 루트 | 29/29 |
| 감지한 variant·size 속성이 허용목록 값을 담고 있나 | 전부 일치 |
| 다른 속성이 같은 허용목록 값을 갖는 **모호성** | **0건** — 값 충돌로 엉뚱한 속성을 고른 사례 없음 |

PC 19 + Mobile 10 = 29건. 예제 파일 29개 중 껍데기가 안 쓰는 고아 파일 0건.

### 1-1. `extractInstance()` 적대 시험 — ⚠️ 잠재 결함 1건

합성 입력 13종으로 도려내기를 직접 때렸다.

| 입력 | 결과 |
|---|---|
| 같은 태그 중첩 · 자기닫힘 루트 · 속성값 안 `>` · 주석 안 `</div>` · 래퍼 안 인스턴스 · 인스턴스 2개(첫 것) · void `<input>` · 홑따옴표 속성 · 앞의 미아 닫는태그 | ✅ 정확 |
| `<li>`·`<p>`·`<td>` 끝태그 생략 · `<script>` 안 `<` (문서 최상위) | ⚠️ **throw** — 빌드가 선다(안전 실패) |

**❌ 그러나 안전하지 않은 경우가 있다.** 끝태그를 생략한 요소가 **래퍼 안에 있는 인스턴스** 안에 들어가면, 조용히 **틀린 마크업을 반환한다**:

```
입력 : <div class="wrap"><div data-s1-component="x"><p>a</div><div data-s1-component="y">OTHER COMPONENT</div></div>
반환 : <div data-s1-component="x"><p>a</div><div data-s1-component="y">OTHER COMPONENT</div></div>
```

**옆 컴포넌트를 통째로 삼켰다.** 그리고 §10 이 안전망으로 내세운 `assertSingleRoot()` 는 이것을 **잡지 못한다** — 같은 깊이 계산을 쓰기 때문에 roots=1 로 세어 통과시킨다(재현 확인).

- 근거: `ui-library/scripts/platform.mjs:362-381`(extractInstance) · `:384-395`(assertSingleRoot)
- **현재 영향 없음** — 지금 예제 19종에는 끝태그 생략이 없고, 항목 1 브라우저 대조가 29/29 통과했다. 앞으로 `<li>`·`<p>`·`<td>` 를 쓰는 예제(목록형 dropdown·table 등)가 들어오면 그때 터진다.
- 권고: 깊이 세기 대신 실제 HTML 파서를 쓰거나, 최소한 끝태그 생략 가능 요소(`p li td th tr tbody option dt dd`)를 만나면 **throw** 하도록 막을 것.

---

## 2. 값 변환 정확성 — ❌ FAIL

**방법:** `assets/css/tokens.css` 를 직접 파싱해 `var()` 참조를 **내가 만든 리졸버로 끝까지 풀고**, 생성물과 대조했다(표본 15개가 아니라 **전수**).

| 대조 | 건수 | 결과 |
|---|---|---|
| `tokens.json` 라이트 값 ≡ 내 리졸버 | 477 | ✅ 전건 일치 |
| `tokens.json` 다크 값 ≡ 내 리졸버 | 477 (다크 분기 166) | ✅ 전건 일치 |
| 미해결 `var()` 잔존 | — | 0건 |
| CSS 변수 중 미수출 | — | 0건 |
| Kotlin·Swift·C++ ≡ tokens.css (색·다크색·크기·수치·raw) | **1926** | ❌ **1건 불일치** |

색 형식은 실제로 hex6 547건 + rgba 2건뿐이었다. 요청받은 3자리 단축 hex·8자리 hex 는 현재 코퍼스에 없어, 대신 **변환 함수 자체를 읽어 정합성을 확인**했다(`platform.mjs:63-81`): hex3/4 → 자리 복제, hex6 → `0xFF`+RGB, hex8 → **알파를 앞으로 옮김**(`digits.slice(6,8)+digits.slice(0,6)`), rgba → 알파를 맨 앞. **자리 이동 로직은 정확하다.**

### ❌ FAIL-2A — C++ 전달본이 컴파일되지 않는다 (83 errors)

```
$ c++ -std=c++17 -fsyntax-only ui-library/dist/platform/cpp/s1_tokens.h
83 errors
```

| 오류 | 건수 | 근거 |
|---|---|---|
| `invalid digit 'f' in decimal/octal constant` | **82** | `constexpr float S1_BORDER_WIDTH_1 = 1f;` — `1f` 는 **C++ 문법이 아니다**(Kotlin 문법). `1.0f` 여야 한다. |
| `redefinition of 'S1_COLOR_ICON_GRAY_DARK'` | 1 | 아래 2B |

- 근본 원인: `ui-library/scripts/platform.mjs:287` 과 `:289` 가 Kotlin 용 리터럴 형식 `${numericOf(...)}f` 를 C++ 에 그대로 재사용한다. 소수점이 있는 값(`1.3f`)만 우연히 유효하고, **정수 값 전부(크기 77 + 수치 10 중 82건)가 깨진다.**
- Kotlin(`1f`)·Swift(`CGFloat = 1`)는 각 언어 문법상 정상이다. **C++ 만 깨졌다.**
- **개발자가 내려받는 ZIP 안의 헤더도 동일하게 깨져 있다**(`assets/downloads/s1-ui-dev-package.zip` 내 `s1-ui/platform/cpp/s1_tokens.h` — dist 와 byte 동일, 83 errors 재현). README §2 는 이 파일을 C++ 시작 파일로 안내한다.

**재현:**
```bash
cd /tmp && cp <repo>/ui-library/dist/platform/cpp/s1_tokens.h .
printf '#include "s1_tokens.h"\nint main(){return 0;}\n' > t.cpp
c++ -std=c++17 -fsyntax-only -ferror-limit=0 t.cpp
```

### ❌ FAIL-2B — C++ 상수 이름 충돌 (값이 조용히 갈린다)

`s1_tokens.h` 에 같은 이름이 **두 번** 정의된다:

```
217: constexpr std::uint32_t S1_COLOR_ICON_GRAY_DARK = 0xFF353535u; // --color-icon-gray-dark = #353535
508: constexpr std::uint32_t S1_COLOR_ICON_GRAY_DARK = 0xFF8A8C96u; // --color-icon-gray  = #8A8C96
```

토큰 `--color-icon-gray-dark`(라이트 값)와 `--color-icon-gray` 의 **다크 값**이 같은 이름으로 떨어진다 — 다크 접미사 `_DARK`(`platform.mjs:283`)에 충돌 방어가 없다.

- Kotlin·Swift 는 `Colors` / `ColorsDark` 로 **객체가 갈려 있어 안전**하다. C++ 은 평평한 네임스페이스라 그대로 충돌한다.
- 이름만 봐서는 `S1_COLOR_ICON_GRAY_DARK` 가 둘 중 무엇인지 알 수 없다 — 컴파일 오류를 고쳐도 **이름 규칙 자체가 모호**하다.
- `3-build.md` §4 의 "이름 충돌 방어 (`--a-b` ↔ `--a--b`)" 테스트는 이 종류(라이트 이름 ↔ 다크 접미 이름)를 보지 않는다. **지금 실재하는 충돌을 통과시켰다.**

> 값 자체는 1926건 중 이 1건을 빼고 전부 정확했다. 결함은 **값이 아니라 언어별 방출 코드**에 있다.

---

## 3. 허용목록 누수 — ✅ PASS

`platform/contract.json` 19종을 각 `dist/components/*.manifest.json` 과 전수 대조했다(필드 13종: variants·sizes·states·parts·breaks·status·rootSelector·root·requiredAttributes·requiredParts·canonicalFingerprint·sourceFingerprint·jsRequired).

- **불일치 0건.**
- 계약에 있으나 승인되지 않은 컴포넌트: 0
- 승인됐으나 계약에 빠진 컴포넌트: 0 (`dist/manifest.json` approved 19 ≡ 계약 19)

허용목록이 조용히 늘어난 흔적은 없다.

---

## 4. 검사기가 판정 기준을 지어내는가 — ❌ FAIL (H6②)

근거 배선을 하나씩 추적했다.

| 검사 | 판정 근거 | 적법? |
|---|---|---|
| hex(R02) · rgba(R07) | `tools/lint-rules.json` ← `audit-rules.json` 발췌 | ✅ |
| `S1-TOKEN` (없는 토큰) | `platform/tokens.json` 이름 집합 | ✅ |
| `S1-COMPONENT`·`S1-VARIANT`·`S1-CONTRACT` | `platform/contract.json` | ✅ |
| **`S1-REIMPL` (재구현 의심)** | **없음 — 코드 안에 하드코딩** | ❌ |

`ui-library/src/tools/s1-ui-lint.mjs:113-118`:

```js
const hints = [
  [/class\s*=\s*["'][^"']*\b(btn|button)[-_][a-z0-9]/i, "button"],
  [/class\s*=\s*["'][^"']*\b(modal|dialog)[-_][a-z0-9]/i, "modal"],
  [/class\s*=\s*["'][^"']*\b(chip|tag)[-_][a-z0-9]/i, "chip"],
  [/class\s*=\s*["'][^"']*\b(dropdown|select)[-_][a-z0-9]/i, "select 또는 dropdown"]
];
```

- 이 클래스명 목록은 `audit-rules.json`(R01~R11) · `contract.json` · `tokens.json` **어디에도 없다.** 구현자가 만든 새 판정 기준이다.
- 이 작업 자신의 river 승인 원칙과 정면으로 어긋난다 — `workflow-state.json` intent: *"검사기는 새 판정 기준을 만들지 않는다. manifest·audit-rules.json·tokens.css 에 이미 있는 것만 근거로 쓴다 (하드룰 H6②)."*
- 오탐 확인: 무관한 프로젝트의 `class="btn-group"` · `class="modal-link"` 만으로 경고 2건이 뜬다.
- 정상참작: severity 는 **warning** 이고 파일 주석에 의도가 밝혀져 있다(`:110`). 그래도 **근거 없는 기준을 ⭐ 가 만들어 빈자리를 메운 것**이므로 (b) 개선으로 넘기지 않는다.
- 조치: 삭제하거나, river 승인을 받아 `audit-rules.json` 에 정식 규칙으로 올린 뒤 `lint-rules.json` 발췌 경로로 내려보낼 것.

> Gate 34 는 이것을 못 잡는다 — 토큰·컴포넌트·속성·상태 **이름**만 추적하고 "검사기 규칙"은 시야 밖이다.

---

## 5. 검사기 적대 시험 — ❌ FAIL (거짓 음성)

스크래치 폴더에 위반 파일을 직접 만들어 배포본 검사기를 돌렸다.

### 정상 동작 확인 (거짓 음성 아님)

| 케이스 | 결과 |
|---|---|
| 없는 컴포넌트 이름 · 미승인 variant · 필수 속성 누락 | ✅ 정확히 지목 |
| **여러 줄에 걸친 태그** | ✅ 정확히 지목 (`<div\n data-s1-component=…\n data-variant="nope2">`) |
| 주석 안 색 코드(`<!-- #abcdef -->`, `/* rgba() */`) | ✅ 무시 |
| 없는 토큰 `var(--color-does-not-exist)` | ✅ 지목 |
| SVG `fill="#fff"` (단독 파일) | ✅ 지목 |
| 올바른 `--color-overlay` 사용 | ✅ 통과 |

### ❌ 거짓 음성 — R02(직접 색)가 평범한 HTML 에서 무력화된다

`s1-ui-lint.mjs:58` 은 hex 앞 **120자** 안에 특정 문자열이 있으면 그 hex 를 건너뛴다:

```js
if (/\bid=|\bhref=|url\(#|xlink:href|#[0-9a-fA-F]{3,8}["']?\s*[;,)]?\s*\/>/.test(context)) continue;
```

`context` 는 **그 요소가 아니라 앞 120자 전체**라, 무관한 곳의 `id=`·`href=` 가 뒤따르는 색을 통째로 사면한다.

| 파일 | 내용 | 잡히나 |
|---|---|---|
| `<div style="color:#123456">` 단독 | 위반 | ✅ 1건 |
| `a{color:#123456}` (CSS) | 위반 | ✅ 1건 |
| `<a href="/x">l</a>` **다음 줄** `<div style="color:#123456">` | 위반 | ❌ **0건** |
| `<div id="q">x</div>` **다음 줄** `<div style="color:#123456">` | 위반 | ❌ **0건** |
| `<div data-id="x">` 다음 줄의 색 | 위반 | ❌ **0건** |

같은 구멍이 EX03 예외에도 있다(`:57`, `:64`) — 정당한 `--color-overlay` 사용 한 번이 **뒤따르는 120자 안의 모든 hex·rgba 를 사면**한다:

```css
.a{background:var(--color-overlay)}
.b{color:#123456}          /* ← 검출 0건 */
```

**종합 시험:** 위반 4건(hex)을 심은 현실적인 HTML 파일 1개에서 **R02 검출 0건**. 다른 규칙 9건은 정확히 잡았다.

이것은 이 작업의 선언 목표("임의 컬러·컴포넌트 제작을 검사기로 차단한다")의 **절반이 실동작하지 않는다**는 뜻이고, README §3("직접 적은 색 … 찾아 줍니다")은 지키지 못할 약속이 된다.

**재현:**
```bash
mkdir -p /tmp/lint/src && cp -R ui-library/dist /tmp/lint/pkg
printf '<a href="/x">l</a>\n<div style="color:#123456">v</div>\n' > /tmp/lint/src/a.html
cd /tmp/lint && node pkg/tools/s1-ui-lint.mjs src   # → 오류 0
```

권고: `context` 를 앞 120자가 아니라 **그 hex 가 실제로 속한 태그/선언 블록**으로 좁힐 것. `id=`·`href=` 는 hex 와 같은 속성 안일 때만 예외로 인정할 것.

### ⚠️ 거짓 양성 (경미)

| 케이스 | 결과 |
|---|---|
| `<div style="content:'rgba(' ">` (문자열, 색 아님) | R07 오탐 |
| `rgb(1,2,3)` | R07 로 보고 — R07 원문은 `rgba()` 만 말한다(경미한 범위 확장) |
| `class="btn-group"` 등 무관 코드 | S1-REIMPL 경고 2건 (항목 4) |

---

## 6. Gate 46 이 실제로 무는가 — ⚠️ HOLD

세 경로를 각각 낡게 만들어 직접 확인하고 전부 원복했다(잔여 변경 0 — `git diff` 로 확인).

| 경로 | 조작 | 결과 |
|---|---|---|
| 배포 ZIP 없음 | zip 파일 이동 | ✅ **차단** (zip:1) |
| 다운로드 화면 낡음 | `install-prompt.html` 안 숫자 손편집 | ✅ **차단** (panel:1) |
| 값 전달본 낡음 | `tokens.css` 색 1개 변경 후 미재빌드 | ✅ **차단** (tokens:1) |
| ZIP 지문 손상 | `stamp.json` 지문 변조 | ✅ 차단 (gate:check FAILED 확인) |
| **ZIP 내용 변조** | zip 뒤에 바이트 추가 | ❌ **통과** (zip:0 panel:0 tokens:0) |

**구멍:** `assets/downloads/s1-ui-dev-package.stamp.json` 은 `distFingerprint`·`readmeFingerprint`, 즉 **원재료(dist)의 지문만** 기록하고 **ZIP 파일 자신의 해시는 기록하지 않는다**(`scripts/build-ui-package-zip.js:131-148`). 따라서 검사기는 "dist 가 스탬프 이후 변했나"만 본다.

- 결과: ZIP 이 손상·변조·교체돼도 dist 만 그대로면 통과한다. `3-build.md` §5 의 "배포 ZIP 이 현재 dist 에서 나왔나"는 실제로 증명되지 않는다.
- 개발자가 실제로 내려받는 **바로 그 산출물**이라 영향이 작지 않다.
- 권고: 스탬프에 `zipSha256` 을 넣고 `--check` 에서 대조할 것.

낡음(staleness) 방어라는 선언 범위 안에서는 정상 작동하므로 FAIL 이 아니라 HOLD 로 둔다 — 범위를 넓힐지는 결정 사항이다.

---

## 7. 손편집 흔적 — ✅ PASS

`npm run ui:build:check` **exit 0** (검증 시작 시점, 그리고 내 조작 원복 후 재실행 모두). `ui-library/dist/**` 는 전부 생성물이며 source 에서 재생성한 결과와 byte 동일하다. 검증자가 직접 전수 재스캔하지 않고 이 종료코드로 갈음했다(계약 ①).

---

## 8. 정본 신설 여부 — ✅ PASS

`node scripts/canon-addition-check.js` → **exit 0**, `tracked=617 added=0 removed=0`.
(color 381 · component 43 · componentprop 8 · number 85 · shadow 3 · textstyle 20 · uistate 77)

토큰·컴포넌트·variant·속성·상태를 새로 만들지 않았다. `canon-additions-baseline.json` 은 이 작업에서 수정되지 않았다(변경 목록에 없음) — 즉 `added=0` 은 기준선을 느슨하게 해서 얻은 값이 아니다.

> 단, **Gate 34 의 시야 밖에서 판정 기준 1건이 신설됐다** — 항목 4의 `S1-REIMPL`. 이것이 H6② 위반이며, 승인 근거는 없다.

---

## 9. 네이티브 한계 서술의 정직성 — ✅ PASS

숨기지 않았다. 오히려 여러 곳에서 반복해 말한다.

| 위치 | 문구 |
|---|---|
| 다운로드 화면 안내 | "웹 계열은 컴포넌트를 그대로 쓰고, **네이티브는 색·크기 값과 동작 명세를 씁니다**" |
| 화면 Kotlin/Swift/C++ 카드 | "**색·크기 값만**" · "**자가 검사기 없음 — 값 대조까지만**" |
| README §2 표 | kotlin·swift·cpp = "토큰(색·크기) 값만 제공 / 자가 검사 **해당 없음**" |
| README §2 본문 | "Kotlin·Swift·C++: **컴포넌트는 각자 구현해야 합니다.** … 값을 눈으로 보고 옮겨 적지 마세요." |

`workflow-state.json` 의 river 승인 원칙("네이티브는 … 한계를 숨기지 않는다")과 일치한다.

⚠️ 다만 README §3 의 검사기 설명("**직접 적은 색** … 찾아 줍니다")은 항목 5 때문에 **현재 사실이 아니다.** 한계 서술의 정직성 문제라기보다 항목 5 결함의 파급이다.

---

## 10. 이번에 검증하지 못한 범위 (정직 표기)

| 범위 | 왜 |
|---|---|
| 키보드·포커스·ARIA·오류 연결·reduced motion (verify-F 5) | 이번 작업은 시각·동작 변경이 없고 `ui:test:check` exit 0 로 갈음(계약 ①). 직접 재확인하지 않았다. |
| 다중 인스턴스·반복 init·destroy 정리 (verify-F 6) | 동일 — `ui:test:check` 로 갈음. React·Vue 껍데기를 **실제 프레임워크 런타임에서 마운트/언마운트해 보지는 않았다**(JSX·SFC 빌드 도구 필요). 마크업 동일성만 증명됐다. |
| 아이콘 hit area·frame·glyph 실측 (verify-F 11) | `ui:icons`·`ui:icons:origin` exit 0 로 갈음. 이번 변경과 무관. |
| 안내 화면 PC·Mobile × Light·Dark 렌더 (verify-F 4) | 선캡처 미제공. 시각 변경 없는 작업이라 판정에 영향 없다고 보았다. **개발자 패널 자체의 다크모드 렌더는 확인하지 않았다.** |
| C++ 산출물의 실제 프레임워크 통합 | HD-CPP-1 이 미해결(Qt·MFC 미정). 문법 컴파일까지만 확인했다. |

---

## 11. 권장 상태

| 항목 | 권고 |
|---|---|
| `workflowStatus` | `in-progress` (4-verification **반려**) |
| `uiLibraryStatus` | `draft` 유지 — **승격 불가** |
| `nextAction` | 3-build 로 되돌아가 아래 ❌ 3건 수정 후 재검증 요청 |

### 구현자에게 돌려주는 목록

| # | 심각도 | 무엇을 | 어디 |
|---|---|---|---|
| ❌1 | **차단** | C++ 정수 리터럴 `1f` → `1.0f` (82건) | `ui-library/scripts/platform.mjs:287,289` |
| ❌2 | **차단** | C++ `_DARK` 접미사 충돌 방어 (`S1_COLOR_ICON_GRAY_DARK` 중복 정의) | `ui-library/scripts/platform.mjs:283` |
| ❌3 | **차단** | R02·EX03 의 120자 앞맥락 예외를 태그/선언 단위로 좁힐 것 | `ui-library/src/tools/s1-ui-lint.mjs:57,58,64` |
| ❌4 | 높음 | `S1-REIMPL` 삭제 또는 river 승인 후 `audit-rules.json` 정식 등재 | `ui-library/src/tools/s1-ui-lint.mjs:110-125` |
| ⚠️5 | 중간 | `assertSingleRoot` 가 못 잡는 끝태그 생략 삼킴 — 파서 교체 또는 해당 태그에서 throw | `ui-library/scripts/platform.mjs:362-395` |
| ⚠️6 | 중간 | 스탬프에 `zipSha256` 추가해 ZIP 자신을 대조 | `scripts/build-ui-package-zip.js:131-148` |
| ⚠️7 | 낮음 | `3-build.md` §4 "이름 충돌 방어" 테스트가 라이트↔다크 이름 충돌을 못 본다 | `ui-library/scripts/test.mjs` |
| ⚠️8 | 낮음 | README §3 검사기 설명이 실제 능력을 넘어선다(❌3 수정 후 해소) | ZIP 내 README |

> **가장 아픈 교훈:** 값은 1926건 전부 맞았는데 **그 값을 담은 파일이 컴파일되지 않았다.** 존재 검사(`platform:tokens:check` — "토큰이 파일에 다 있나")는 통과했다. 생성한 코드는 **그 언어의 컴파일러로 한 번 돌려 봐야** 한다.

---
---

# 4-verification (2차) — 수정분 재검증

> 2026-09-04 · 🤖 component-verifier · 델타 재검증
> **판정: ❌ FAIL** — 1차 지적 6건은 **전부 실제로 고쳐졌다.** 그러나 같은 종류의 **새 차단 결함 1건**을 찾았다: **Vue 컴포넌트 19종이 전부 컴파일되지 않는다.**

## 2-0. 재검증 요약

| # | 1차 지적 | 재검증 결과 |
|---|---|---|
| ❌1 | C++ float 리터럴 `1f` | ✅ **해소** — 직접 컴파일 확인 |
| ❌2 | C++ 이름 충돌 | ✅ **해소** — namespace 분리 확인 |
| ❌3 | R02 무력화 (거짓 음성) | ✅ **해소** — 옛 거짓 음성 8종 전부 검출 |
| ❌4 | S1-REIMPL 자작 어휘 (H6②) | ✅ **해소** — contract.json 유래로 전환 |
| ⚠️5 | extractInstance 끝태그 생략 삼킴 | ✅ **해소** — 5종 전부 빌드 정지 |
| ⚠️6 | ZIP 변조 미검출 | ✅ **해소** — 변조 5종 전부 차단 |
| ⭐ | (덤) variant 속성 하드코딩 | ✅ 확인 — `data-type`·`data-mode`·`data-footer` 검출 |
| 🆕 | **Vue SFC 19종 컴파일 불가** | ❌ **신규 차단 결함** |
| 🆕 | 새 거짓 양성 3종 | ⚠️ 경미 |

기계검사 재실행: `ui:contract`·`ui:build:check`·`ui:test:check`·`ui:icons`·`ui:icons:origin`·`ui:guide:render`·`ui:zip:check`·`devpanel:check`·`platform:tokens:check` **전부 exit 0** · Gate 34 `added=0`.

---

## 2-1. ① C++ float 리터럴 — ✅ PASS (직접 컴파일)

구현자 결과를 믿지 않고 직접 돌렸다.

```
$ c++ -std=c++17 -Wall -Wextra -fsyntax-only -ferror-limit=0 t.cpp
(오류 0 · 경고 0)
$ for std in c++11 c++20 → 각각 error 0
```

1차의 83 errors → **0**. `constexpr float S1_BORDER_WIDTH_1 = 1.0f;` 로 바뀐 것을 확인했다.

### 값이 살아남았는지 — 컴파일 후 **실행**해서 확인

문법 통과만으로는 부족하므로, 헤더의 **모든 상수를 출력하는 프로그램을 만들어 실행**하고 그 출력을 내 CSS 리졸버 결과와 대조했다.

| 항목 | 결과 |
|---|---|
| 실행해 출력한 상수 | **642개** (라이트 색 384 · 다크 색 165 · float 87 · 문자열 6) |
| `assets/css/tokens.css` 독립 해석과 대조 | **불일치 0건** |
| 다크 상수 커버리지 | 기대 165 ≡ 실제 165 (누락 0 · 초과 0) |

> 1차에서 `platform:tokens:check` 는 통과했는데 파일은 안 열렸다. 이번엔 **컴파일 → 실행 → 값 대조**까지 했다.

Kotlin·Swift 회귀 없음: 1284건 재대조 **불일치 0**.

## 2-2. ② C++ 이름 충돌 — ✅ PASS

`namespace dark { … }` 분리를 확인했다(`s1_tokens.h:400-566`).

| 검사 | 결과 |
|---|---|
| 라이트 스코프 중복 이름 | 477개 중 **0건** |
| `dark` 스코프 중복 이름 | 165개 중 **0건** |
| 1차 충돌 `S1_COLOR_ICON_GRAY_DARK` | `s1::tokens::S1_COLOR_ICON_GRAY_DARK`(라이트) ↔ `s1::tokens::dark::S1_COLOR_ICON_GRAY`(다크) 로 **분리** |

이름 모호성도 함께 해소됐다 — 접미사가 아니라 네임스페이스라 어느 쪽인지 자명하다.

## 2-3. ③ R02 무력화 — ✅ PASS (거짓 음성 0)

1차에서 만든 위반 파일을 그대로 다시 돌렸다.

**옛 거짓 음성 — 전부 검출로 전환:**

| 케이스 | 1차 | 2차 |
|---|---|---|
| 앞줄 `href=` + 다음 줄 `color:#123456` | ❌ 0건 | ✅ 1건 |
| 앞줄 `id=` + 다음 줄 색 | ❌ 0건 | ✅ 1건 |
| 앞줄 `data-id=` + 다음 줄 색 | ❌ 0건 | ✅ 1건 |
| `--color-overlay` 다음 줄의 hex (EX03 누수) | ❌ 0건 | ✅ 1건 |
| `--color-overlay` 와 **같은 규칙 안** 다른 선언의 hex | ❌ 0건 | ✅ 1건 |
| overlay 와 여러 줄 떨어진 hex | ❌ 0건 | ✅ 1건 |
| rgba EX03 누수 | ❌ 0건 | ✅ 1건 |
| 여러 줄에 걸친 태그 안의 색 | — | ✅ 1건 |

**정당한 사용 — 오검출 없음:** `href="#cafe"` · `id="beef"` · `for="abc123"` · `url(#dad)` · `xlink:href="#face"` · 정상 `var(--color-overlay)` · 주석 안 색 → 전부 **0건**.
**참조와 위반이 한 태그에 같이 있을 때**(`<a href="#cafe" style="color:#123456">`) → 위반만 정확히 1건.
`.color-overlay-wrapper{color:#123456}` (선택자 이름에 overlay) → 정확히 검출(선택자 이름이 면죄부가 되지 않는다).

### ⚠️ 새로 생긴 거짓 양성 3종 (경미)

`enclosingAttribute()` 가 `lastIndexOf("<")` ~ `indexOf(">")` 로 태그 범위를 잡고 **따옴표 있는 속성만** 파싱하기 때문에, 아래 3가지 모양에서 **정당한 참조를 색으로 오인**한다(값이 hex 모양일 때만).

| 모양 | 예 | 결과 |
|---|---|---|
| 앞선 속성값에 `>` | `<a title="a > b" href="#cafe">` | ❌ 오검출 |
| 따옴표 없는 속성 | `<a href=#cafe>` | ❌ 오검출 |
| 속성값에 `<` | `<a data-x="<b>" href="#cafe">` | ❌ 오검출 |

- 근거: `ui-library/src/tools/s1-ui-lint.mjs:55-70`(`enclosingAttribute`)
- 조건이 겹쳐야 터진다(참조 속성 + 값이 hex 모양 `#cafe`·`#beef`·`#face` 등 + 위 3모양 중 하나). 흔하지는 않다.
- **방향은 안전한 쪽이다** — 1차는 위반을 놓쳤고(위험), 지금은 결백한 것을 지적한다(성가심). 다만 검사기는 exit 1 이라 개발자 빌드를 세울 수 있다.
- 권고(비차단): 다중 줄·따옴표 없는 속성까지 다루는 태그 파서를 쓰거나, 참조 속성 판정에 실패하면 **경고로 낮출 것**.

### 판단 확인 — `fill="#ff0000"` 을 잡는 것은 **맞다**

구현자가 물은 건: `fill` 은 참조가 아니라 **색을 담는 표현 속성**이므로 R02(HEX 직접 사용 금지) 대상이 맞다. 반대로 `fill="url(#dad)"` 는 참조라 건너뛰는 것도 확인했다. **판단 정확하다.**

### ⚠️ 그대로 남은 경미 2건 (1차와 동일, 비차단)
- `<div style="content:'rgba('">` 처럼 **문자열 안의 `rgba(`** → 오검출.
- `rgb(1,2,3)` 을 R07 로 보고 — R07 원문은 `rgba()` 만 말한다(경미한 범위 확장).

## 2-4. ④ S1-REIMPL — ✅ PASS (H6② 해소)

`btn`·`dialog`·`tag` 하드코딩 목록이 **삭제**됐고, 이제 `contract.components[].id` 만 어휘로 쓴다(`s1-ui-lint.mjs`). 판정 근거가 전부 선언된 출처(contract·tokens·lint-rules)에서 온다.

- 확인: `class="btn-group"` → 더 이상 경고 없음(`btn` 은 컴포넌트 id 가 아니다). `class="button-primary"` → 경고 1건(정당).
- 배포본의 승인 예제(`examples/button.html`) → **오류 0 · 경고 0**.
- 남는 관찰(비차단): "클래스명이 컴포넌트 id 와 겹치면 재구현 의심"이라는 **규칙 자체**는 여전히 `audit-rules.json` 밖의 관례다. 다만 어휘가 계약 유래이고 severity 가 warning 이라 H6② 위반으로는 보지 않는다. `class="data-table"`·`class="tab-cell"` 같은 흔한 이름에 경고가 붙는 소음은 있다(경고이므로 빌드는 안 선다).

## 2-5. ⑤ extractInstance 끝태그 생략 — ✅ PASS

1차에서 **조용히 옆 컴포넌트를 삼켰던** 입력들을 그대로 다시 넣었다.

| 입력 | 1차 | 2차 |
|---|---|---|
| 래퍼 안 `<p>` 미닫힘 → 옆 컴포넌트 삼킴 | ❌ 조용히 틀린 마크업 | ✅ **THROW** |
| 래퍼 안 `<li>`·`<p>`·`<tr>`·`<option>` 미닫힘 | ❌/⚠️ | ✅ **THROW** (여는/닫는 개수를 알려 준다) |

**과차단 없음** — 정상 모양은 전부 그대로 동작한다: 균형 잡힌 `<li>`·`<td>`, 같은 태그 중첩, void `<input>`, 속성값 안 `>`, 주석 안 `</div>`, 래퍼 안 인스턴스(bottom-nav 모양) → **7/7 정확 추출**.

## 2-6. ⑥ ZIP 변조 — ✅ PASS

| 조작 | 결과 |
|---|---|
| 1바이트 덧붙임 | ✅ 차단 |
| 뒤 100바이트 잘라냄 | ✅ 차단 |
| **다른 정상 ZIP 으로 통째 교체** | ✅ 차단 |
| ZIP 삭제 | ✅ 차단 |
| 옛 형식 stamp(`zipFingerprint` 없음) | ✅ 차단 |

나머지 두 경로 회귀 없음: 다운로드 화면 손편집 → 차단 · 정본 토큰 변경 후 미재빌드 → 차단. 조작은 전부 원복했고 작업 트리에 잔여 0.

## 2-7. ⭐ (덤) variant 속성 계약화 — ✅ 확인

`contract.json` 에 `variantAttribute`·`sizeAttribute` 가 실렸고, 검사기가 거기서 읽는다.

- **19종 커버리지:** variant 가 2개 이상인 컴포넌트 6종(button·chip·dropdown·filter-chip·modal·mobile-header·date-picker) 전부 속성 선언됨. 누락 0.
- **실제 검출 확인:** `data-type="BOGUS"`(dropdown) · `data-mode="BOGUS"`(date-picker) · `data-footer="BOGUS"`(modal) · `data-variant="BOGUS"`(chip·filter-chip) → **5/5 검출**.
- **교차 검증:** contract 의 `variantAttribute`/`sizeAttribute` 가 React 껍데기가 독립적으로 감지한 값과 19종 전부 일치하고, 선언된 속성이 승인 예제 루트에 실재하며 그 값이 허용목록 안이다.

## 2-8. 항목 1 재대조 (dist 재빌드분) — ✅ PASS

현재 dist 로 브라우저 DOM 대조를 다시 돌렸다. **29/29 일치**(예제에서 브라우저가 찾은 요소 ≡ 껍데기 MARKUP · React ≡ Vue · 루트 1개 · variant/size 속성 모호성 0). 마크업은 변하지 않았다.

`contract.json` ↔ manifest 19종 × 13필드 재대조 **불일치 0** · 승인/계약 집합 정확히 일치.

---

## 2-9. 🆕 ❌ 신규 차단 결함 — Vue 컴포넌트 19종이 **전부 컴파일되지 않는다**

미검증으로 남겼던 "React·Vue 실제 런타임 마운트"를 이번에 실제로 했다. React 는 통과했고, **Vue 는 19종 전부 컴파일 단계에서 실패한다.**

```
$ node -e '@vue/compiler-sfc 로 dist/platform/vue/*.vue 전수 컴파일'
vue 3.5.42 | compiler-sfc 3.5.42
SFC files: 19 | compiled: 0 | FAILED: 19
ERROR: [@vue/compiler-sfc] `defineProps()` in <script setup> cannot reference
       locally declared variables because it will be hoisted outside of the setup() function.
```

**원인** — `defineProps()` 는 컴파일 타임 매크로라 인자가 `setup()` **밖으로 끌어올려진다.** 그런데 생성물은 같은 `<script setup>` 안에서 선언한 const 를 그 안에서 참조한다:

```js
// dist/platform/vue/Button.vue:12-15
const DEFAULT_BREAK = "pc";
const BREAKS   = ["pc","mobile"];
const VARIANTS = ["primary","secondary","blue-line"];
const SIZES    = ["md","xsm","xxsm","lg"];

// :20-23  ← 여기서 위 4개를 참조 → 하드 컴파일 오류
const props = defineProps({
  variant:   { type: String, validator: (value) => VARIANTS.length === 0 || VARIANTS.includes(value) },
  size:      { type: String, validator: (value) => SIZES.length === 0 || SIZES.includes(value) },
  breakName: { type: String, default: DEFAULT_BREAK, validator: (value) => BREAKS.includes(value) },
```

- **생성기 위치:** `ui-library/scripts/platform.mjs:600-603`(선언) · `:608-611`(참조)
- **최소 재현/수정 형태 확인:** 같은 구조를 최소 SFC 로 만들면 실패하고, 리터럴을 `defineProps()` 안에 **인라인**하면 컴파일된다. (또는 별도 일반 `<script>` 블록으로 옮긴다 — 오류 메시지가 안내하는 방법.)
- Vue 3.2 이후 문서화된 **하드 제약**이며 특정 버전 이슈가 아니다.

**왜 아무 검사도 못 잡았나:** `test.mjs` 는 `.vue` 파일에서 MARKUPS 를 **문자열로 뽑아** React 것과 비교한다 — Vue 컴파일러를 한 번도 부르지 않는다. C++ 의 `1f` 와 **똑같은 종류의 실패**다: 생성한 코드를 그 언어의 도구에 넣어 보지 않았다.

**재현:**
```bash
mkdir -p /tmp/v && cd /tmp/v && npm i vue @vue/compiler-sfc
cp -R <repo>/ui-library/dist .
node -e 'const{parse,compileScript}=require("@vue/compiler-sfc");const fs=require("fs");
for(const f of fs.readdirSync("dist/platform/vue").filter(x=>x.endsWith(".vue"))){
  try{compileScript(parse(fs.readFileSync("dist/platform/vue/"+f,"utf8"),{filename:f}).descriptor,{id:f});console.log("OK",f);}
  catch(e){console.log("FAIL",f,e.message.split("\n")[0]);}}'
```

---

## 2-10. React 실제 런타임 마운트 — ✅ PASS (1차 미검증 항목 해소)

React 18 + esbuild 로 껍데기 19종을 **실제로 마운트**해 브라우저에서 검사했다.

| 검사 | 결과 |
|---|---|
| 19종 × 전 break = **29건 마운트** | 전부 성공(예외 0) |
| 마운트된 DOM ≡ `innerHTML + init()` 직접 경로의 DOM | **29/29 완전 일치** (init 이 만든 런타임 속성까지 포함) |
| host 가 `display: contents` 인가 | 29/29 그렇다 (레이아웃에 끼어들지 않음) |
| `unmount()` 예외 | 0건 |
| unmount 후 host 비워짐 | 29/29 |

**관찰(비차단):** 껍데기는 `import { useEffect, useRef } from "react"` 만 하고 `React` 기본 import 가 없어 **automatic JSX runtime(React 17+)** 이 필요하다. classic 런타임으로 빌드하면 `React is not defined` 로 전부 실패한다(내가 확인). 최신 도구의 기본값이라 정상이지만, README 의 "JSX 빌드 도구가 필요합니다" 에 **automatic runtime 필요**를 한 줄 덧붙이는 편이 친절하다.

---

## 2-11. 이번에도 검증하지 못한 범위

| 범위 | 왜 |
|---|---|
| Vue **런타임** 동작(마운트·unmount·emit) | **컴파일이 안 돼서 도달하지 못했다.** 2-9 수정 후 재검증 필요. |
| 키보드·포커스·ARIA·reduced motion | `ui:test:check` exit 0 로 갈음. 직접 재확인하지 않았다(1차와 동일). |
| 아이콘 hit area·frame·glyph 실측 | `ui:icons`·`ui:icons:origin` exit 0 로 갈음. 이번 변경과 무관. |
| 개발자 패널 PC·Mobile × Light·Dark 렌더 | 선캡처 미제공. 시각 변경 없는 작업이라 판정에 영향 없다고 보았다. |
| C++ 의 실제 프레임워크 통합 | HD-CPP-1 미해결. 문법 컴파일 + 값 실행까지만 확인. |

## 2-12. 권장 상태 (2차)

| 항목 | 권고 |
|---|---|
| `workflowStatus` | `in-progress` (4-verification **반려**) |
| `uiLibraryStatus` | `draft` 유지 — 승격 불가 |
| `nextAction` | Vue `defineProps` 결함 1건 수정 후 재검증. 나머지는 전부 통과했으므로 **3차는 Vue 컴파일·런타임 + 회귀 확인으로 좁혀도 된다.** |

| # | 심각도 | 무엇을 | 어디 |
|---|---|---|---|
| ❌1 | **차단** | `defineProps()` 안의 리터럴을 인라인(또는 별도 `<script>` 로 분리) | `ui-library/scripts/platform.mjs:600-611` |
| ⚠️2 | 중간 | 생성 코드를 **그 언어의 컴파일러로 검사**하는 단계를 빌드/게이트에 넣을 것 (C++ `-fsyntax-only` · `@vue/compiler-sfc` · JSX 번들). 지금은 두 번 다 검증에서야 발견됐다. | `ui-library/scripts/test.mjs` |
| ⚠️3 | 낮음 | `enclosingAttribute` 거짓 양성 3종(`>`/`<` in attr · 따옴표 없는 속성) | `s1-ui-lint.mjs:55-70` |
| ⚠️4 | 낮음 | README 에 React automatic JSX runtime 필요 명시 | ZIP 내 README |
| ⚠️5 | 낮음 | 문자열 안 `rgba(` 오검출 · `rgb()` 를 R07 로 보고 | `s1-ui-lint.mjs` checkColors |

> **2차 교훈(1차와 같은 문장):** 값·마크업·지문은 전부 맞는데, **그 값을 담은 파일이 열리지 않았다.** C++ 을 고치는 동안 Vue 가 같은 이유로 깨져 있었다. 검사기가 파일을 *문자열로* 읽는 한 이 종류는 계속 빠져나간다 — **그 언어의 도구에 넣어 보는 단계**가 있어야 한다.

---
---

# 4-verification (3차) — Vue 수정 + 컴파일 검사기 검증

> 2026-09-04 · 🤖 component-verifier · 범위: Vue · 신설 컴파일 검사 3종 · 회귀
> **판정: ❌ FAIL** — Vue **컴파일**은 19/19 해소됐으나, 런타임에서 **Vue 껍데기가 prop 을 하나도 반영하지 않는다**(19종 전부). 컴파일 검사만으로는 볼 수 없는 층이다.

## 3-0. 요약

| # | 항목 | 판정 |
|---|---|---|
| 1a | Vue SFC 19종 컴파일 | ✅ **PASS** (19/19) |
| 1b | Vue 런타임 마운트·정리 | ✅ PASS (29/29) |
| 1c | **Vue prop 반영 (variant·size·parts·attrs)** | ❌ **FAIL — 전부 무시된다** |
| 2a | 컴파일 검사 — C++ | ✅ PASS (실패 2종 검출) |
| 2b | 컴파일 검사 — Vue | ✅ PASS (실패 3종 검출) |
| 2c | 컴파일 검사 — React | ⚠️ 약함 (문법만 — 깨진 import·미정의 변수 통과) |
| 2d | 도구 없을 때 조용한 통과 | ⚠️ `ui:test` 는 알리지만 **`gate:check` 는 PASSED 로만 보인다** |
| 3 | 1·2차 수정 6건 회귀 | ✅ 전부 유지 |
| 4 | `enclosingAttribute` 거짓 양성 3종 | ✅ 그대로(합의대로 비차단) |

기계검사 전부 exit 0 · `gate:check` PASSED(게이트 49 · 경고 13) · Gate 34 `added=0`.

---

## 3-1. Vue SFC 컴파일 — ✅ PASS (19/19)

`@vue/compiler-sfc` **3.5.42** 로 `parse()` + `compileScript()` 전수 실행:

```
SFC: 19  compiled: 19  FAILED: 0      (2차: 0/19)
```

`defineProps()` 안이 리터럴로 인라인된 것을 확인했다(`Button.vue:29-31`).

### 인라인이 만든 새 위험 — **드리프트 0 확인**

허용목록이 상수와 매크로 두 곳에 생겼으므로, 값이 갈라지는지 19종 전수 대조했다.

| 대조 | 결과 |
|---|---|
| `defineProps` 인라인 리터럴 ≡ `contract.json` 의 variants·sizes | ✅ 19/19 일치 |
| 인라인 `breakName` 허용목록 ≡ 파일의 `MARKUPS` 키 | ✅ 19/19 |
| 인라인 `default` ≡ `DEFAULT_BREAK` 상수 | ✅ 19/19 |
| `defineProps` 안에 식별자 참조가 남았나 | ✅ 0건 |

허용목록이 빈 컴포넌트는 `validator: (value) => true` 로 떨어진다 — React 껍데기의 `allowed.length === 0` 조기 반환과 같은 의미라 정합하다.

### ⚠️ 저위험 — 죽은 상수 57개

`VARIANTS`·`SIZES`·`BREAKS` 는 이제 **선언만 되고 어디서도 쓰이지 않는다**(19종 × 3 = 57). 실제로 쓰이는 것은 `DEFAULT_BREAK`(마운트)·`VARIANT_ATTRIBUTE`·`SIZE_ATTRIBUTE`(watchEffect) 뿐이다.

> 구현 보고의 "상수 선언 자체는 남겨 뒀다(watchEffect·마운트에서 쓴다)" 는 이 셋에는 해당하지 않는다.

소비자 프로젝트의 `no-unused-vars` 린트를 건드릴 수 있다. 비차단.

## 3-2. Vue 런타임 마운트 — ✅ PASS (29/29)

Vue 3.5.42 + esbuild-plugin-vue3 로 실제 브라우저에서 마운트했다(React 와 같은 수준).

| 검사 | 결과 |
|---|---|
| 19종 × 전 break = **29건 마운트** | 전부 성공(예외 0) |
| 마운트 DOM ≡ `innerHTML + init()` 직접 경로 | **29/29 완전 일치** |
| host 가 `display: contents` | 29/29 |
| `app.unmount()` 예외 | 0건 |
| unmount 후 host 정리 | 29/29 (주석 노드 제외) |

## 3-3. ❌ Vue 껍데기가 prop 을 하나도 반영하지 않는다 (19종 전부)

**2차에서 "컴파일이 안 돼 도달하지 못했다"고 남긴 층에 이번에 도달했더니, 여기서 걸렸다.**

React 와 Vue 에 **같은 유효한 prop** 을 주고 결과 DOM 을 비교했다.

| 껍데기 | 입력 | 결과 DOM |
|---|---|---|
| **React** | `variant="secondary" size="xsm" parts={{label:"저장"}}` | `data-variant=secondary` · `data-size=xsm` · 라벨 `"저장"` ✅ |
| **Vue** | 같은 값 | `data-variant=primary` · `data-size=md` · 라벨 `"확인"` ❌ |
| **Vue** | `size="xsm" attrs={{"data-testid":"x"}}` | `data-size=md` · `data-testid=null` ❌ |

**Vue 는 승인 예제에 박혀 있던 기본값만 그리고, 개발자가 준 값을 전부 버린다.** 오류도 경고도 없다.

**원인** — `watchEffect` 가 첫 실행에서 즉시 죽는다:

```js
// dist/platform/vue/Button.vue:56-59  (생성기: ui-library/scripts/platform.mjs:622,641,644)
let root = null;                       // :622  — ref 가 아니라 평범한 변수
onMounted(mount);                      // :641  — 여기서 root 에 값이 들어간다
watchEffect(() => {
  if (!root) return;                   // :645  ← setup 단계 즉시 실행 시 root 는 null
  if (props.variant !== undefined && VARIANT_ATTRIBUTE) root.setAttribute(...);
  ...
});
```

`watchEffect` 는 setup 중 **즉시 한 번** 실행된다. 그 시점에 `root` 는 아직 `null` 이라 **`props` 를 읽기 전에 return** 한다 → 반응형 의존성이 **하나도 등록되지 않는다** → 이후 `onMounted` 에서 `root` 가 채워져도 `root` 는 `ref` 가 아니므로 **effect 는 두 번 다시 실행되지 않는다.** 영구히 죽은 effect다.

- **왜 3-2 의 29/29 는 통과했나:** 나는 `breakName` 만 주고 마운트했다. `breakName` 은 `mount()` 안에서 직접 쓰이므로 죽은 effect 와 무관하다. **실제 사용 모양(variant·size·parts 전달)에서만 드러난다.**
- **왜 새 컴파일 검사가 못 잡나:** 컴파일은 통과한다. 이건 문법이 아니라 **반응성 배선** 문제다.
- **심각도: 차단.** Vue 개발자가 `<S1Button variant="secondary">` 를 쓰면 **조용히 primary 버튼**을 받는다. 2차의 컴파일 실패는 시끄럽게 실패했지만 이것은 **조용히 틀린다** — 더 나쁜 실패 모양이다.
- 수정 방향(참고): `root` 를 `ref` 로 만들거나, effect 안에서 조기 반환 **전에** props 를 읽어 의존성을 등록하거나, 속성 적용을 `onMounted` + `watch(props, …)` 로 옮긴다.

**재현:**
```js
createApp({render:()=>h(Button,{variant:"secondary",size:"xsm",parts:{label:"저장"}})}).mount(host);
await nextTick();
host.firstElementChild.firstElementChild.getAttribute("data-variant"); // → "primary" (기대: "secondary")
```

### ⚠️ 곁가지 — variant 강제력이 React 와 다르다

| 껍데기 | 승인 안 된 `variant="BOGUS"` |
|---|---|
| React | **예외를 던진다** (production·development 모두) |
| Vue | 던지지 않음 · development 경고 1건 · **production 은 경고조차 없다** |

Vue 의 `validator` 는 개발 빌드 전용 경고이므로 배포 빌드에서는 아무 신호가 없다. 3-build 보고 §3 의 "Vue 는 validator 로 거른다" 는 **production 에서 성립하지 않는다**(거르지도 알리지도 않는다). 3-3 수정 시 함께 정리할 것을 권한다.

---

## 3-4. 신설 컴파일 검사 3종 — 적대 검증

검사기를 **실제로 깨뜨려** 무는지 봤다(모두 원복함).

### ① C++ — ✅ 강함

| 주입 | 결과 |
|---|---|
| `= 1.0f` → `= 1f` (2차 결함 복원) | ✅ 검출 |
| 상수 이름 중복 정의 | ✅ 검출 |

### ② Vue — ✅ 강함

| 주입 | 결과 |
|---|---|
| `defineProps` 안에서 `VARIANTS` 참조 복원 (2차 결함) | ✅ 검출 — 원문 오류 메시지까지 표시 |
| `<template>` 에 닫히지 않은 요소 | ✅ 검출 (`Element is missing end tag`) |
| `</template>` 삭제 | ✅ 검출 |

`parse()` 의 `errors[]` 를 확인하기 때문에 **script 뿐 아니라 template 오류도** 잡는다.

### ③ React — ⚠️ 문법만 본다

`esbuild.transform` 은 **모듈을 해석하지 않는다.** 격리 실험으로 확인:

| 입력 | `transform` |
|---|---|
| 진짜 JSX 문법 오류 | ✅ 잡음 |
| **존재하지 않는 파일 import** (`from "./NOPE.js"`) | ❌ **통과** |
| **정의되지 않은 변수 사용** | ❌ **통과** |

`ui:test` 전체로 돌렸을 때 "깨진 import" 는 **끝까지 잡히지 않았다**(전 검사 통과). "미정의 변수" 는 잡혔지만 그건 React 검사가 아니라 **빌드 신선도 검사**가 문 것이다 — 내가 dist 만 고쳤기 때문이다.

> **핵심:** 신선도 검사는 *생성기가 옳고 dist 만 어긋났을 때*만 지켜 준다. **생성기 자체가 잘못된 import 를 뿜으면** dist 는 신선하고 일관돼서, 남는 방어선은 React 문법 검사뿐인데 그건 import 를 보지 않는다. 우리가 두 번 맞은 실패(C++ `1f`·Vue `defineProps`)는 마침 문법 오류라 잡혔을 뿐이다.
>
> 권고: React 도 `transform` 대신 **`esbuild.build`(bundle:true)** 로 한 번 묶어 볼 것. 그러면 import 해석까지 검증된다. (내가 이번 검증에서 실제로 그렇게 번들해 19종을 마운트했고, 성공했다.)

### ④ 도구가 없을 때 — ⚠️ `gate:check` 에서는 보이지 않는다

| 상황 | `ui:test` 출력 | 종료코드 |
|---|---|---|
| `@vue/compiler-sfc` 제거 | `[platform compile check] 건너뜀: Vue SFC (@vue/compiler-sfc 없음) — 이 항목은 이번 실행에서 검증되지 않았습니다.` | 0 |
| `c++` 없음(실패 stub) | `건너뜀: C++ (컴파일러 없음)` | 0 |

**`ui:test` 단독으로는 약속대로 알린다 ✅.** 그러나 같은 상태에서:

```
$ npm run gate:check          # @vue/compiler-sfc 없는 상태
Gate Check PASSED with 13 warning(s) · 게이트 49개 · ✅ 79건
```

**건너뛴 사실이 한 글자도 나오지 않는다.** 게이트는 `ui:test:check` 의 종료코드만 보므로, devDependency 가 빠진 환경에서는 이 구조적 방어선이 **게이트 관점에서 조용히 사라진다.**

- 완화 요인: 둘 다 `package.json` devDependency 라 `npm ci` 하면 설치된다. C++ 컴파일러만 환경 의존이다.
- 권고: devDependency 로 선언된 두 도구(esbuild·@vue/compiler-sfc)의 부재는 **skip 이 아니라 failure** 로 볼 것. 또는 gate:check 가 skip 문구를 경고로 승격해 표면화할 것.

---

## 3-5. 회귀 — ✅ 1·2차 수정 6건 전부 유지

| 항목 | 재확인 방법 | 결과 |
|---|---|---|
| C++ 컴파일 | `c++ -std=c++17 -Wall -Wextra` 직접 | **오류 0** |
| C++ 값 정확성 | 상수 **642개를 컴파일·실행해 출력** → `tokens.css` 독립 해석과 대조 | **불일치 0** |
| C++ 이름 충돌 | 라이트/다크 스코프별 중복 | 0건 |
| R02 검출 | 1차 위반 파일 배터리 재실행 | 잡아야 할 8종 **8/8 검출** · 잡으면 안 되는 7종 **0건** |
| extractInstance | 삼킴 입력 3종 / 정상 3종 | **차단 3/3 · 통과 3/3** |
| ZIP 변조 | 덧붙임·절단·삭제·옛 stamp | **4/4 차단**, 재생성 후 정상 |
| 껍데기 ↔ 배포본 | 브라우저 DOM 대조 | **29/29 일치** |

Kotlin·Swift 회귀 없음(2차에서 1284건 대조, 이번 라운드 변경 없음).

## 3-6. `enclosingAttribute` 거짓 양성 3종 — ✅ 재확인 (합의대로 유지)

`<a title="a > b" href="#cafe">` · `<a href=#cafe>` · `<a data-x="<b>" href="#cafe">` → 그대로 오검출된다. **방향이 안전한 쪽**(놓침이 아니라 성가심)이라는 판단에 변함 없다. 정당한 참조 7종은 여전히 오검출 0.

---

## 3-7. 이번에도 검증하지 못한 범위

| 범위 | 왜 |
|---|---|
| Vue **이벤트 emit** 동작 | 3-3 때문에 prop 경로가 죽어 있어 emit 까지 의미 있게 보기 어렵다. 3-3 수정 후 함께 볼 것. |
| React·Vue 껍데기의 **prop 변경 후 재렌더**(변경→반영→되돌리기) | 3-3 이 먼저 고쳐져야 한다. React 는 초기 적용만 확인했다. |
| 키보드·포커스·ARIA·reduced motion | `ui:test:check` exit 0 로 갈음(1·2차와 동일). 직접 재확인 안 함. |
| 아이콘 hit area·frame·glyph 실측 | `ui:icons`·`ui:icons:origin` exit 0 로 갈음. 이번 변경과 무관. |
| 개발자 패널 PC·Mobile × Light·Dark 렌더 | 선캡처 미제공. 시각 변경 없음. |
| C++ 실제 프레임워크 통합 | HD-CPP-1 미해결. 문법·값까지만. |
| README·다운로드 화면의 automatic JSX 안내 문구 | 문구 추가는 확인했으나 **화면 렌더로는 보지 않았다**(선캡처 없음). |

## 3-8. 권장 상태 (3차)

| 항목 | 권고 |
|---|---|
| `workflowStatus` | `in-progress` (4-verification **반려**) |
| `uiLibraryStatus` | `draft` 유지 — 승격 불가 |
| `nextAction` | Vue prop 반영 1건 수정 후 재검증. **4차는 Vue prop·emit 런타임 + 회귀로 좁힐 수 있다.** |

| # | 심각도 | 무엇을 | 어디 |
|---|---|---|---|
| ❌1 | **차단** | Vue `watchEffect` 가 죽어 prop 이 반영되지 않는다 — `root` 를 `ref` 로 바꾸거나 의존성을 먼저 등록 | `ui-library/scripts/platform.mjs:622,641,644-645` |
| ⚠️2 | 중간 | React 컴파일 검사를 `transform` → `build(bundle:true)` 로 승격(깨진 import 검출) | `ui-library/scripts/test.mjs` ② |
| ⚠️3 | 중간 | devDependency 부재를 skip 이 아닌 failure 로, 또는 gate 가 skip 을 표면화 | `ui-library/scripts/test.mjs` · `scripts/gate-check.js` |
| ⚠️4 | 낮음 | Vue variant 강제력 부재(production 무신호) — 문서 표현 정정 또는 런타임 검사 추가 | Vue 껍데기 · `3-build.md` §3 |
| ⚠️5 | 낮음 | 죽은 상수 57개(`VARIANTS`·`SIZES`·`BREAKS`) 제거 | `platform.mjs:601-603` |

> **3차 교훈:** 컴파일 검사를 넣은 것은 옳았고 실제로 문다. 다만 **컴파일은 "열리는가"까지만 증명한다.** 이번 결함은 열리고 마운트도 되는데 **입력을 버리는** 층에 있었다 — 그 층은 실제로 prop 을 주고 DOM 을 읽어야만 보인다. 검사 사다리에 한 칸이 더 필요하다: 문자열 → 컴파일 → **동작(실제 값 주입 후 결과 확인)**.

---
---

# 4-verification (4차) — Vue 런타임 + 동작 검사기

> 2026-09-04 · 🤖 component-verifier · 범위: Vue prop·emit 런타임 · `runtime-check.mjs` · React 번들 검사 · 회귀
> **판정: ⚠️ HOLD** — 3차 차단 결함은 **확실히 해소**됐고 신설 검사도 실제로 문다. 남은 것은 차단 1건 급이 아닌 **`breakName` 미반영 1건**과 **검사기 약점 2건**이다.

## 4-0. 요약

| # | 항목 | 판정 |
|---|---|---|
| 1a | Vue prop 초기 반영 | ✅ PASS |
| 1b | **Vue prop 마운트 후 변경 재반영** | ✅ PASS (variant·size·parts·attrs·속성 삭제) |
| 1c | **Vue `breakName` 변경 재반영** | ❌ **FAIL — 반영되지 않는다** (React 는 된다) |
| 1d | Vue emit | ✅ PASS |
| 2a | `runtime-check` 가 3차 버그를 무나 | ✅ PASS (19/19 검출) |
| 2b | 범주별 고장 검출(variant·size·parts) | ✅ PASS (각각 6·5·9건 검출) |
| 2c | **시험값이 무의미한 케이스** | ⚠️ **거짓 음성 실증** (7/18 단언이 공회전) |
| 2d | 도구 없을 때 | ✅ 알린다 (exit 2 · ui:test 가 표면화) |
| 2e | **실패 시 임시파일이 dist 에 남는다** | ⚠️ 연쇄 오진 유발 |
| 2f | React 는 동작 검사 대상이 아님 | ⚠️ 범위 공백 |
| 3 | React 번들 검사 승격 | ✅ PASS (없는 파일·없는 export·없는 컴포넌트) |
| 4 | 1~3차 수정 회귀 | ✅ 전부 유지 |
| 5 | `assertAllowed` 거짓 throw | ✅ **246회 마운트 · 0건** |

기계검사 전부 exit 0 · `gate:check` PASSED · Gate 34 `added=0`.

---

## 4-1. Vue prop 런타임 — 초기·동적 모두 ✅ (3차 차단 결함 해소)

`root` 를 `ref` 로 바꾸고 effect 가 `root.value` 를 먼저 읽는 수정을 확인했다(`Button.vue` watchEffect).

**내 방식으로 다시 측정** — Vue `ref` 로 prop 을 바꿔 가며 DOM 을 읽었다.

| 시점 | Vue | React |
|---|---|---|
| 초기 `variant=primary size=md label=확인` | `primary` · `md` · "확인" ✅ | 동일 ✅ |
| **변경 → `secondary` · `xsm` · "저장" · `data-probe=1`** | `secondary` · `xsm` · "저장" · `probe=1` ✅ | 동일 ✅ |
| **속성 삭제 (`data-probe: null`)** | `probe=null` ✅ | — |

3차의 "prop 을 전부 버린다"는 완전히 해소됐고, **구현자가 확인하지 못했다고 한 "마운트 후 변경" 경로도 정상**이다.

### Vue emit — ✅ PASS

`input` 에 `s1:input:clear` 를 실제 dispatch 했다.

| 껍데기 | 결과 |
|---|---|
| Vue `onClear` | ✅ 수신 — payload `{"v":1}` (= `event.detail`) |
| React `onClear` | ✅ 수신 — payload 는 이벤트 객체(`type=s1:input:clear`) |

> 참고(비결함): 두 껍데기의 **payload 모양이 다르다** — Vue 는 `detail`, React 는 이벤트 자체. 생성기 의도대로지만(`emit(name, event.detail ?? event)`) README 에는 안 적혀 있다.

## 4-2. ❌ `breakName` 은 마운트 후 바뀌어도 반영되지 않는다 (Vue 19종)

| 껍데기 | `breakName: "pc"` → `"mobile"` |
|---|---|
| React | `data-break=mobile` ✅ |
| **Vue** | `data-break=pc`, `size=md` — **그대로** ❌ |

**원인:** Vue 껍데기는 `MARKUPS[props.breakName]` 을 `mount()` 안에서만 읽고, `mount` 는 `onMounted` 로 **한 번만** 실행된다. 19종 어디에도 `watch()` 가 없다(`grep -l "watch(" dist/platform/vue/*.vue` → 0건). React 는 `useEffect(..., [breakName])` 로 명시적으로 재마운트한다(`chip.jsx:45`).

- `breakName` 은 validator·허용목록·`assertAllowed` 까지 갖춘 **정식 prop** 이고 React 는 동적으로 동작하므로, 계약상 동적이어야 한다.
- **영향:** 반응형 화면에서 `:break-name="isMobile ? 'mobile' : 'pc'"` 로 묶은 Vue 앱은 **화면이 바뀌어도 PC 마크업 그대로**다. 오류도 경고도 없다 — 3차와 같은 "조용히 틀림" 계열이지만 범위는 `breakName` 하나로 좁다.
- **신설 `runtime-check` 는 이걸 못 본다** — `buildCases()` 가 `breakName` 을 아예 주지 않아 mobile 마크업이 한 번도 시험되지 않는다.
- 수정 방향: `watch(() => props.breakName, () => { unmount(); mount(); })`.

## 4-3. `runtime-check.mjs` 적대 검증

### ✅ 무는 것 — 실제로 깨뜨려 확인 (전부 원복)

| 주입 | 결과 |
|---|---|
| **3차 버그 복원** (`root` ref → 보통 객체, 의존성 등록 제거) | ✅ `cases=19 failed=19` — 전 컴포넌트 `FAIL mount` |
| `size` 적용만 제거 | ✅ `failed=5` (button·filter-chip·tab·multi-toggle·table) |
| `variant` 적용만 제거 | ✅ `failed=6` (button·chip·dropdown·filter-chip·mobile-header·date-picker) |
| `parts` 적용만 제거 | ✅ `failed=9` |

probe 속성(`data-s1-runtime-probe`)을 **`attrs` 로 주입해 그걸로 요소를 찾는** 설계라, effect 가 죽으면 요소 자체를 못 찾아 `mount` 부터 실패한다. 영리하고, 3차 버그를 확실히 잡는다.

**시험값이 계약을 벗어나지 않는가:** ✅ `variant`·`size` 는 `contract.json` 허용목록의 마지막 값, 텍스트 part 는 `requiredParts` 중 알려진 이름만. 지어낸 값 없음.

### ⚠️ 거짓 음성 — 시험값이 예제 기본값과 같으면 단언이 공회전한다

허용목록의 **마지막 값**을 고르는데, 그 값이 승인 예제에 이미 박혀 있는 값과 같으면 `getAttribute(...) === props.size` 는 **setAttribute 가 한 번도 안 돌아도 통과**한다.

**18개 variant/size 단언 중 7개가 이 상태다:**

```
input.size  pick="md" == 예제 기본값 "md"      chip.size      "md" == "md"
dropdown.size    "md" == "md"                  select.size    "md" == "md"
time-picker.size "md" == "md"                  date-picker.size "md" == "md"
modal.variant  pick="dual" == 예제 기본값
```

**실증 (같은 고장, 다른 컴포넌트):**

| 주입 | 결과 |
|---|---|
| `Input.vue` 의 `size` 적용만 제거 | ❌ **`failed=0` — 통과한다** |
| `Button.vue` 의 `size` 적용만 제거 (대조군) | ✅ `failed=1` |

즉 컴포넌트 단위로 고장 나면 7개 자리는 못 본다. (전 컴포넌트 동시 고장은 나머지 11개가 잡으므로 게이트는 뜬다.)

권고: 시험값을 **예제의 현재 값과 다른 것**으로 고르거나(허용목록에서 현재 값을 제외하고 선택), 주입 전 baseline 을 읽어 **값이 실제로 바뀌었는지**를 단언할 것.

**커버리지 공백도 적어 둔다:** variant 단언 없음 12종 · size 단언 없음 8종 · parts 단언 없음 10종(계약상 해당 축이 없거나 텍스트 part 가 없어서 — 설계상 정상이지만 "19종 통과"가 곧 "19종 전 축 검증"은 아니다).

### ⚠️ 실패하면 임시파일이 `dist` 에 남는다 → 연쇄 오진

`failed > 0` 일 때 `process.exit(1)` 을 **`try` 안에서** 호출한다. `process.exit()` 는 `finally` 를 실행하지 않으므로 정리 코드가 건너뛰어지고, 다음 두 파일이 `dist` 에 남는다:

```
ui-library/dist/__runtime-check.html   (약 397KB)
ui-library/dist/__runtime-entry.js
```

**실제로 일어나는 연쇄** (재현함):

```
ui:test  → "- __runtime-check.html: unexpected dist file"
gate:check → ❌ Gate 46: 배포 ZIP이 현재 배포본보다 낡았습니다 — `npm run ui:zip` 실행 필요
            Gate Check FAILED
```

진짜 원인(껍데기가 prop 을 안 먹음)은 사라지고 **"ZIP 이 낡았다"는 엉뚱한 안내**만 남는다. 정상 통과 시에는 깨끗하고, `Ctrl-C` 중단 시에도 깨끗하다 — **실패했을 때만** 샌다.
권고: `process.exit` 를 `finally` 밖으로 빼거나 정리 후 종료할 것.

### ✅ 도구가 없을 때 — 조용히 통과하지 않는다

| 상황 | 출력 | exit |
|---|---|---|
| `vue` 모듈 제거 | `RUNTIMECHECK_SUMMARY skipped=vue cases=0 failed=0` + `[runtime check] 건너뜀 — vue 없음. 껍데기가 실제로 prop 을 반영하는지는 이번 실행에서 확인되지 않았습니다.` | 2 |
| `ui:test` 안에서 | `[platform runtime check] … 건너뜀 — vue 없음 …` **표면화됨** ✅ | — |

3차에 지적한 "게이트에서 안 보이던 문제"는 개선됐다.

### ⚠️ React 는 동작 검사 대상이 아니다

`runtime-check` 는 **Vue 만** 마운트한다. 3차 결함이 Vue 였으니 자연스럽지만, React 껍데기가 같은 종류로 조용히 망가지면 잡을 것이 없다. (이번 라운드는 내가 React 도 직접 마운트해 확인했다 — 정상.)

## 4-4. React 번들 검사 승격 — ✅ PASS

`transform` → `build({bundle:true})` 승격이 실제로 문다.

| 주입 | 3차 | 4차 |
|---|---|---|
| 없는 파일 import (`./THIS-DOES-NOT-EXIST.js`) | ❌ 통과 | ✅ **검출** |
| 런타임 모듈에서 없는 named export import | ❌ 통과 | ✅ **검출** |
| `index.js` 가 없는 컴포넌트를 export | — | ✅ **검출** |
| 미정의 전역 심볼 | ❌ 통과 | ❌ 여전히 통과 (번들러는 전역으로 간주 — 린터/타입체커 영역, 저위험) |

> 내 첫 시도는 `button.jsx` 에 import 를 주입하려 했는데 **button 은 JS 런타임이 없어 그 import 자체가 없었다** — 무효 시험이었다. `input.jsx` 로 다시 해서 확인했다.

## 4-5. `assertAllowed` 거짓 throw — ✅ PASS (0건)

19종 전부에 대해 두 껍데기로 실제 마운트했다.

| 시나리오 | 마운트 횟수 | 거짓 throw |
|---|---|---|
| **prop 을 하나도 주지 않음** | 38 (19종 × Vue/React) | **0** |
| **계약의 모든 유효 조합** (variant × size × break) | 208 | **0** |

축이 1개뿐인 컴포넌트, 허용목록이 빈 컴포넌트(`validator: () => true`), variant 없는 컴포넌트 모두 포함해 문제 없다.

### 승인 안 된 값에 대한 강제력 — 양쪽 다 작동, 실패 모양은 다르다

| 껍데기 | `variant="__BOGUS__"` |
|---|---|
| React | 렌더 중 **throw** · **DOM 에 아무것도 안 그림** |
| Vue | `mount()` 는 성공 · watchEffect 에서 **비동기 throw**(errorHandler/unhandled 로 노출, 메시지 동일) · **DOM 은 승인된 기본값 유지**(`data-variant=primary`) |

3차에 지적한 "production 에서 완전 무신호"는 해소됐다(production 빌드에서도 오류가 난다). 다만 **Vue 는 마운트를 막지 않고 안전한 기본값으로 계속 그린다** — "React 와 같게 throw" 는 메시지 기준으로는 맞고, 치명도 기준으로는 다르다. 문서에 한 줄 적어 두길 권한다.

## 4-6. 회귀 — ✅ 1~3차 수정 전부 유지

| 항목 | 결과 |
|---|---|
| C++ 컴파일 (`-Wall -Wextra`) | 오류 0 |
| C++ **상수 642개 컴파일·실행 → tokens.css 대조** | 불일치 0 |
| tokens.json 477개 라이트/다크 독립 해석 | 불일치 0 |
| Vue SFC 19종 컴파일 | 19/19 |
| 껍데기 ↔ 배포본 마크업 (브라우저 DOM) | **29/29** |
| R02 검출 | 잡아야 할 8/8 · 정당한 7종 오검출 0 |
| extractInstance | 삼킴 차단 3/3 · 정상 통과 3/3 |
| ZIP 변조 | 차단 · 원복 후 정상 |

## 4-7. 이번에도 검증하지 못한 범위

| 범위 | 왜 |
|---|---|
| Vue **mobile 마크업 런타임** | 4-2 때문에 `breakName` 전환이 안 돼 mobile 경로를 런타임으로 확인하지 못했다(마크업 문자열 동일성은 확인됨). |
| React 껍데기의 **동작 회귀 자동 감시** | `runtime-check` 범위 밖. 이번엔 내가 수동 확인했으나 상시 감시는 없다. |
| emit **전 종류**(9종 컴포넌트 22개 이벤트) | `input` 1건만 실제 dispatch 했다. 나머지는 배선 코드만 동일 구조임을 확인. |
| 키보드·포커스·ARIA·reduced motion | `ui:test:check` exit 0 로 갈음(1~3차와 동일). 직접 확인 안 함. |
| 아이콘 hit area·frame·glyph 실측 | `ui:icons`·`ui:icons:origin` exit 0 로 갈음. |
| 개발자 패널·README 렌더 (automatic JSX 안내 포함) | 선캡처 미제공. 문구 존재만 확인, **화면으로 안 봄**. |
| C++ 실제 프레임워크 통합 | HD-CPP-1 미해결. |

## 4-8. 권장 상태 (4차)

| 항목 | 권고 |
|---|---|
| `workflowStatus` | `in-progress` — 4-verification **조건부 보류(HOLD)** |
| `uiLibraryStatus` | `draft` 유지 |
| `nextAction` | 아래 ❌1 수정 후 재검증. **5차는 `breakName` 동적 전환 + 검사기 보강 확인으로 좁힐 수 있다.** |

| # | 심각도 | 무엇을 | 어디 |
|---|---|---|---|
| ❌1 | 높음 | Vue 가 `breakName` 변경에 재마운트하지 않는다 — `watch(() => props.breakName, …)` 추가 | `ui-library/scripts/platform.mjs` (Vue `onMounted(mount)` 부근) |
| ⚠️2 | 중간 | `runtime-check` 시험값이 예제 기본값과 같으면 공회전(7/18) — 현재 값과 다른 값을 고르거나 baseline 대비 변화 단언 | `runtime-check.mjs` `buildCases()` |
| ⚠️3 | 중간 | 실패 시 `process.exit(1)` 이 `finally` 를 건너뛰어 dist 에 임시파일 잔류 → Gate 46 오진 | `runtime-check.mjs` (try/finally) |
| ⚠️4 | 낮음 | `runtime-check` 에 `breakName` 케이스 추가(mobile 마크업 미검증) | `runtime-check.mjs` `buildCases()` |
| ⚠️5 | 낮음 | React 도 동작 검사 대상에 포함 | `runtime-check.mjs` |
| ⚠️6 | 낮음 | 문서: Vue/React 의 emit payload 차이, 승인 외 값에 대한 치명도 차이 | README |

> **4차 교훈:** 사다리의 마지막 칸(동작 검사)은 옳게 놓였고 3차 버그를 확실히 잡는다. 다만 **동작 검사도 "무엇을 주고 무엇을 보는지"에 그 정확도가 달려 있다** — 시험값이 이미 화면에 있는 값과 같으면 그 단언은 아무것도 증명하지 않고, 아예 주지 않은 prop(`breakName`)은 그 자리에 구멍으로 남는다. 이번 ❌1 이 정확히 그 구멍에서 나왔다.
