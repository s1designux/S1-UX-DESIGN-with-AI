# shadow 토큰 인프라 신설 — 별건 백로그 (루트 A 시험에서 발견)

> **상태: 미착수.** 그림자 인프라가 갖춰지면 Modal·Bottom Sheet·Dropdown 계열에 한 세트로 얹는다.
> 발견 경위: 루트 A 신규 편입 시험(첫 대상 = V2.4 modal_small "삭제") §6 1단계에서, 다크 모달 그림자 토큰을 vars-data에 넣으려다 발견.
> 최종 갱신: **2026-07-29** — 토큰 1종 → **3종**으로 확대, 라이트 값 정정, rgba 예외 항목 사실 정정.

---

## 정정 이력 (2026-07-29)

이 문서의 옛 "확정된 값" 절이 실측·결정과 어긋나 **교체**했다.

| 옛 기록 | 정정 | 사유 |
|---|---|---|
| `light: none` (라이트 모달은 그림자 없음 — Figma 실측 확정) | `--shadow-raised` light = **`0 4px 6px -2px rgba(0,0,0,0.06), 0 12px 20px -4px rgba(0,0,0,0.10)`** (2겹) | 기존 실측(`P8YvnCdGkQLDNVQhW74ZZW` / `8177:264277`, 딤만 있고 패널 그림자 0)은 **사실이다**. 다만 그 상태가 **의도가 아니라 미적용(누락)** 으로 판정됐다. (사용자 결정 2026-07-29) · 같은 날 2차 결정으로 라이트를 1겹(`0 4px 16px rgba(0,0,0,0.15)`)에서 **2겹으로 재교체** — 사유는 아래 "설계 근거"의 Figma 겹 수 제약. |
| 토큰 **1종**(`shadow/raised`)만 상정 | 토큰 **3종** — `shadow/raised` · `shadow/raised-up` · `shadow/dropdown` | Modal 외에 **Dropdown·Bottom Sheet도 그림자 누락 상태**임이 확인됐다. 한 토큰으로는 방향(y 부호)·표면 크기(blur)가 다른 세 계열을 덮을 수 없다. |
| 6표면 표 #3 — "R07 때문에 그림자 rgba 가 Gate 3 error" | **사실이 아님.** 아래 6표면 표 #3 참조 | `gate-check.js`는 rgba를 검사하지 않는다(실측). 성격이 "게이트 차단 해소"에서 **"문서상 근거 확보"** 로 바뀐다. |

> "배경" 절과 "손볼 6표면" 절의 나머지 항목은 그대로 유효하므로 유지한다.

---

## 배경

다크 모달 그림자를 정본에 넣으려다, **그림자는 기존 토큰 2종과 근본적으로 다른 종류**임이 드러났다.

| 기존 토큰 종류 | 값 형태 | 정본 객체 |
|---|---|---|
| Semantic Color | Foundation **색 alias**(예 `"gray/900"`) 또는 rgba | `SEMANTIC_COLOR: Record<string, SemanticColorEntry>` |
| Semantic Number | **문자열 alias/숫자**(예 `"radius/8"`, `8`) | `SEMANTIC_NUMBER: Record<string, string \| number>` |
| **Shadow (신규)** | **raw box-shadow 문자열**(모드별·2겹·rgba·spread 포함) | **없음 — 신설 필요** |

그림자는 색 alias도 숫자도 아니라, `gen-semantic-tokens.js`가 값을 `var(--color-…)`로 감싸는 기존 처리로는 다룰 수 없다. 즉 **토큰 1개 추가가 아니라 인프라(6표면) 신설** 작업이다.

---

## 확정 토큰 3종

| 토큰 | CSS 변수 | light | dark |
|---|---|---|---|
| `shadow/raised` | `--shadow-raised` | `0 4px 6px -2px rgba(0,0,0,0.06), 0 12px 20px -4px rgba(0,0,0,0.10)` | `0 8px 8px -4px rgba(0,0,0,1), 0 20px 24px -4px rgba(0,0,0,1)` |
| `shadow/raised-up` | `--shadow-raised-up` | `0 -4px 16px rgba(0,0,0,0.15)` | **미정** |
| `shadow/dropdown` | `--shadow-dropdown` | `0 4px 8px 0 rgba(0,0,0,0.15)` | **미정** |

### 적용 대상

| 토큰 | 적용 컴포넌트 |
|---|---|
| `--shadow-raised` | **Modal** |
| `--shadow-raised-up` | **Bottom Sheet** (하단에서 올라오는 표면이라 y 부호 반전) |
| `--shadow-dropdown` | **Dropdown** · **Calendar** · **Time Picker Dropdown** |

### 설계 근거

- **겹 수는 테마가 아니라 표면 위계를 나타낸다.** Modal(`raised`)은 **라이트·다크 모두 2겹**, Bottom Sheet(`raised-up`)와 Dropdown 계열(`dropdown`)은 **양쪽 1겹**이다. 같은 토큰의 라이트/다크가 겹 수까지 달라지는 일은 없다.
- **라이트와 다크의 겹 수를 맞춘 이유 — Figma 제약.** Figma 는 그림자 **겹 수를 변수 모드로 바꿀 수 없다**(겹 수는 구조다). 겹 수가 같아야 겹당 속성(색·offset·blur·spread)을 변수에 바인딩해 모드 전환을 표현할 수 있다. 라이트를 1겹으로 두면 다크 2겹을 표현할 방법이 "라이트에 투명한 빈 겹을 하나 두는 것"뿐이라 낭비가 생긴다. (2026-07-29 2차 결정 — 라이트를 1겹에서 2겹으로 재교체한 근거.)
- **테마 차이는 겹 수가 아니라 alpha 와 기하다.** Modal 라이트는 alpha `.06` / `.10`, 다크는 alpha `1.0` — 어두운 배경에서 층위를 확보하려면 훨씬 강한 값이 필요하다.
- **1겹 토큰(`raised-up`·`dropdown`)의 라이트는 alpha `.15` 공통**이고 blur 만 **표면 크기로 갈린다** — 큰 표면 `16` / 작은 패널 `8`. (이 `.15` 공통 규칙은 **Modal 에는 적용되지 않는다** — Modal 은 위 2겹 체계를 따른다.)
- **y 부호는 표면이 나오는 방향을 따른다.** 위에서 내려오는 표면은 `+`, 아래에서 올라오는 표면(`raised-up`)은 `−`.
- **네이밍은 `color/surface/raised` 와 짝.** `shadow/*` 는 `tokens/foundation.md` 계통도에 예약된 네임스페이스다.
- **소속:** **Core** — 모달 셸(Core)이 쓰고 Popup·바텀시트·드롭다운 등 여러 오버레이가 공유하는 elevation primitive. (영상 서비스 다크 사용이 많은 건 "사용 패턴"이지 "소유"가 아님 → Core 보관·서비스 참조.)

---

## 다크값 출처 (`--shadow-raised` dark)

- **정본:** `0 8px 8px -4px rgba(0,0,0,1), 0 20px 24px -4px rgba(0,0,0,1)`
- **실측 노드 2건에서 동일 값 확인:**

| 파일 | 노드 | 판독 방법 | 시점 |
|---|---|---|---|
| `Tnihi6lixRR47N4RSAwUbF` | `2550:5197` (Popup_widget) | `node.effects[]` 직접 판독 | 최초 실측 |
| `Tnihi6lixRR47N4RSAwUbF` | `3119:16863` (Popup_widget) | `node.effects[]` 직접 판독 | **2026-07-29 재확인** |

- 2겹 DROP_SHADOW (both visible·NORMAL·effectStyleId=null):

  | 겹 | offset(x,y) | blur(radius) | spread | color·alpha |
  |---|---|---|---|---|
  | A | 0, 8 | 8 | −4 | rgba(0,0,0, **1.0**) |
  | B | 0, 20 | 24 | −4 | rgba(0,0,0, **1.0**) |

- ⚠️ **익스포터 주의:** `get_design_context` 는 이 값을 `drop-shadow-[0px_20px_12px_black, 0px_8px_4px_black]` 로 **손실 근사**한다. CSS `drop-shadow` 필터엔 spread 파라미터가 없어 익스포터가 뭉갠 것이다.
  - **2026-07-29 재확인 결과:** 손실은 무작위가 아니라 **규칙적이다** — **blur 가 정확히 1/2 로 축소되고(24→12, 8→4) spread 가 소실된다(−4→0).**
  - **위 실측값(blur 8/24 · spread −4)이 정본.** box-shadow(웹)는 spread 를 지원하므로 실측값을 써야 정확하다.

---

## 손볼 6표면 (§6 1단계에서 진단한 표 그대로)

| # | 손볼 곳 | 무엇을 | 진단 증상(🔴) |
|---|---|---|---|
| 1 | `plugins/figma-vars-installer/src/vars-data.ts` 구조 | shadow 전용 객체 신설 — 예 `SEMANTIC_SHADOW: Record<string, {light: string; dark: string}>` | SEMANTIC_NUMBER(string\|number)에 {light,dark} 넣으면 **tsc TS2322** |
| 2 | `scripts/gen-semantic-tokens.js` | shadow 분기 추가 — 값을 **aliasToCss 없이 raw 그대로** `--shadow-*: <값>;` 로 Light/Dark 출력 | gen은 `SEMANTIC_COLOR`만 읽고 모든 값을 `var(--color-{값})`로 감쌈 → `none`·그림자 문자열 뭉개짐. SEMANTIC_NUMBER는 아예 안 읽음 |
| 3 | `registry/governance/token-exceptions.json` | shadow rgba 예외를 **EX03와 같은 형식**으로 등록 (`rule`·`scope`·`description`·`approvedAt`·`approvedBy`). 등록 이유: **"게이트가 차단하지는 않으나, rgba 사용에 승인 기록을 남기기 위함."** | **🔵 차단 아님 — 문서상 근거 확보.** (2026-07-29 실측 정정) |
| 4 | `scripts/installer-coverage-check.js` | `shadow-` 접두사 매핑 추가 | 접두사 맵에 spacing-/radius-는 있으나 **shadow- 없음** → 커버리지에서 튐 |
| 5 | `scripts/token-naming-check.js` | `NUM_NS`(또는 별도)에 `shadow` 네임스페이스 추가 | `NUM_NS`에 shadow 없음 → `--shadow-*` 미인식 네임스페이스로 걸림 |
| 6 | tsc 타입 정합 | 위 1로 해소 | — |

> 추가 확인 포인트: 2겹 콤마 문자열 자체는 gen 정규식 `[^"]+` 캡처엔 안 깨지나(따옴표 안), 한 줄 `{light,dark}` 전제·트레일링 콤마·aliasToCss 뭉갬 때문에 결국 raw 통과 분기(#2) 없이는 처리 불가.

### #3 상세 — rgba 예외의 성격이 바뀐 이유 (2026-07-29 실측)

옛 기재는 *"R07: rgba는 EX03(overlay)에만 허용 → 그림자 rgba가 Gate 3 error"* 였다. **사실이 아니다.**

| 실측 항목 | 결과 |
|---|---|
| `scripts/gate-check.js` 의 Gate 3 | **rgba 를 검사하지 않는다.** 검사 대상은 `assets/css/tokens.css` **한 파일**이고, 정규식은 raw HEX 만 본다. `gate-check.js` 전문에 `rgba` 문자열 **0건**. |
| `R07` (`registry/governance/audit-rules.json`) | **선언만 있고 이를 집행하는 스크립트가 저장소에 없다.** |
| rgba 를 실제로 보는 유일한 코드 | `scripts/guard/check-colors.js` — severity 는 **warning** 이고, 대상은 **외부 서비스 코드**다. `pages/*.html` 이나 `tokens.css` 를 검사하지 않는다. |

→ 따라서 #3 은 **"게이트 차단 해소"가 아니라 "문서상 근거 확보"** 다. 등록 자체는 그대로 하되, 착수 순서상 blocking 이 아니다.

---

## 관련 발견 (2026-07-29 실측)

### (a) 폐기된 `--shadow-200` 의 값이 `--shadow-dropdown` 라이트 값과 같다

| 항목 | 내용 |
|---|---|
| 위치 | `scripts/gen-foundation-tokens.js:20`, `scripts/gen-foundation-tokens.js:277` |
| 값 | `0 4px 8px 0 rgba(0, 0, 0, 0.15)` (공백 정규화 시 `0 4px 8px 0 rgba(0,0,0,0.15)`) |
| 폐기 사유(주석 원문) | 2026-07-08 — *"마커 안에서 삭제 (생성기 관할 — vars-data에 없고 저장소 참조 0건, 2026-07-08 고아 확정)"* / *"생성 후: 완전히 삭제됨"* |

**이 값이 `--shadow-dropdown` 의 라이트 값과 동일하다.** 즉 **토큰만 지워지고 값은 하드코딩으로 남아 있었다.** `--shadow-dropdown` 도입은 그때 끊긴 배선을 다시 잇는 일이다.

### (b) `--date-picker-panel-shadow` 값 드리프트

| 표면 | 파일:줄 | 값 |
|---|---|---|
| registry 컴포넌트 사양 | `registry/components/date-picker.json:111` | candidate `0 4px 16px rgba(0,0,0,0.10)` |
| Figma↔CSS 매핑 | `registry/tokens/figma-css-token-map.json:1229-1234` | candidate `0 4px 16px rgba(0,0,0,0.10)` |
| 페이지 번들 데이터 | `assets/js/registry-data-bundle.js:5456` | candidate `0 4px 16px rgba(0,0,0,0.10)` |
| **실제 CSS** | `pages/components-new.html:916` | **`0 4px 8px rgba(0,0,0,0.15)`** |
| **실제 설치기(Figma)** | `plugins/figma-vars-installer/src/build-components.ts:2944` (Calendar) | **`0 4px 8px 0 rgba(0,0,0,0.15)`** |

- candidate 3곳이 서로는 일치하나, **실제 구현 2곳과 blur(16↔8)·alpha(0.10↔0.15) 둘 다 다르다.**
- **`--date-picker-panel-shadow` 라는 CSS 변수는 어느 CSS 파일에도 정의돼 있지 않다.** 3곳 전부 문서/데이터 언급뿐이다.
- **`--shadow-dropdown` 도입 시 이 candidate 3곳을 정리해야 한다.**

### (c) 갱신이 필요한 "라이트 그림자 없음" 기록 3곳

라이트 모달 그림자 없음이 **누락으로 판정**됐으므로(2026-07-29), 아래 3곳이 낡은 기록이 된다.

| # | 위치 | 현재 기재 |
|---|---|---|
| 1 | `reports/shadow-token-infra-backlog.md` (이 문서) | ✅ **이번에 정정 완료** |
| 2 | `registry/components/modal.json:120`, `:133` | `"panel": "… border 없음 · shadow 없음(라이트)"` / `"shadow-dark": "shadow/raised — 미신설 … 라이트는 그림자 없음."` |
| 3 | `plugins/figma-vars-installer/src/build-components.ts:3748` (주석) | `// 라이트: 테두리 없음·그림자 없음(Figma effects 실측 확정). 다크 그림자(shadow/raised)는 별건 백로그.` |

> 2·3은 이 백로그 착수 시 함께 갱신한다. (이번 작업 범위 밖 — 이 문서만 수정)

### (d) Time Picker 선행 결정과의 정합 ✅

`registry/components/time-picker.json:60`:

> *"드롭다운 패널에 전용 shadow 토큰을 가정하지 않는다(dropdown semantic 재사용)."*

**`--shadow-dropdown` 공용 토큰이 이 결정과 일치한다.** Time Picker Dropdown 전용 토큰을 새로 만들지 않고 공용 토큰을 참조하는 방향이므로, 선행 결정을 뒤집지 않는다.

---

## 미정 항목

| # | 항목 | 현재 상태 |
|---|---|---|
| 1 | `--shadow-raised-up` **다크값** | 미정 |
| 2 | `--shadow-dropdown` **다크값** | 미정 |
| 3 | **Modal 다크에 보더**(`color/line/gray/subtle`) 추가 여부 | 미정 |
| 4 | **Select Box 열린 목록** — 현행 `0 4px 16px rgba(0,0,0,0.10)` 을 `--shadow-dropdown` 으로 흡수할지, 별도로 둘지 | 미정 |
| 5 | **Filter Chip 시트** — 현행 `0 -4px 16px var(--color-overlay)` 를 `--shadow-raised-up` 으로 흡수할지 | 미정 |
| 6 | **바텀시트 안에 들어간 패널의 그림자 제거 규칙**을 코드(`build-components.ts:3212` 하드코딩)에서 문서 규칙으로 올릴지 | 미정 |

---

## 다음 (인프라 착수 시)

1. 위 6표면을 **한 세트로** 배선(빌드=vars-data/gen, 검증=커버리지·네이밍). #3(rgba 예외)은 blocking 이 아니므로 순서 자유.
2. **토큰 3종**을 tokens.css 에 생성 확인 → install-prompt 동기화.
   - `--shadow-raised` Light/Dark(2겹)
   - `--shadow-raised-up` Light (Dark 는 미정 — 확정 전까지 Light 값 유지 또는 미출력, 결정 필요)
   - `--shadow-dropdown` Light (Dark 는 미정 — 동일)
3. 적용:
   - Modal 셸 → `box-shadow: var(--shadow-raised)` (**라이트에도 적용** — 옛 계획과 달라진 지점)
   - Bottom Sheet → `box-shadow: var(--shadow-raised-up)`
   - Dropdown · Calendar · Time Picker Dropdown → `box-shadow: var(--shadow-dropdown)`
4. 값 정합: 위 실측값과 tokens.css 해석 표면 일치 확인.
5. 정리: 관련 발견 (b) candidate 3곳, (c) 낡은 기록 2곳 갱신.
