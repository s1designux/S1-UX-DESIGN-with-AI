# 4단계 — 독립 검증 (🤖 component-verifier, 2026-09-08)

**대상:** Input 상태 이름 `Editing` → `Focus` 개명 (정본 Figma + 저장소 정본 + 파생).
**빌드 경로:** 원래 계획(A: 변형 값 이름만 개명)은 실행되지 않았고, **river 가 설치기를 다시 깔아** Core 페이지가 통째로 재생성됐다.
**검증자는 고치지 않았다** — 아래는 대조 결과만이다.

## 0. 검증 입력 계약 상태

| 항목 | 상태 |
|---|---|
| 기계검사 표(machine-checks) 선행 제출 | **없음** — 호출자가 명령·종료코드 표를 넘기지 않았다 |
| 조치 | 규정상 HOLD 사유지만, 항목 (5)가 "검사기를 직접 실행해 근거를 남겨라"를 명시했으므로 **판정에 필요한 검사기만** 실행하고 나머지(`gate:check`·`ui:test` 등)는 돌리지 않았다. 그 항목들은 **미확인**이다 |
| 렌더 선캡처 | 없음 — 검증자가 직접 캡처했다(경로는 아래) |
| 델타 재검증 | 해당 없음(직전 검증 보고서 없음) — 전수 검증 |

---

## 1. Figma 정본 ↔ 저장소 정본 대조 — ✅ PASS

**확인 방법:** `use_figma` 읽기 전용 스캔(Core 페이지 `5:5706` → `COMPONENT_SET` 중 이름 `Input`).

| 항목 | 저장소 정본 (`registry/components/component-facts.json`) | Figma 실측 | 판정 |
|---|---|---|---|
| 세트 노드 | — | **`2410:13831`** (key `44d14d83c8b9e7650355fbd9ed5beb0f38c42e3d`, remote=false) | — |
| 위치 | — | Core `5:5706` → SECTION `Form Control` `2410:15491` | — |
| Size | XXSM · XSM · MD | XXSM · XSM · MD | ✅ 일치 |
| State | Default · Filled · **Focus** · Error · Correct · Read-Only · Disabled | Default · Filled · **Focus** · Error · Correct · Read-Only · Disabled | ✅ 일치 |
| Message | Off · On | Off · On | ✅ 일치 |
| Break | PC · Mobile | PC · Mobile | ✅ 일치 |
| variant 수 | 56 | **56** | ✅ 일치 |
| 비-variant 속성 | — | `Password Icon#2410:26` · `Password Action Hover#2410:83` · `Clear Action Hover#2410:140` (BOOLEAN 3종 보존) | ✅ |

- **`Editing` 문자열 잔존:** 세트 서브트리 전체 이름 스캔 결과 **0건**(`deepEditingNodeCount = 0`). variant 이름 56개에도 0건.
- **Gate 11 부품(caret·remove):** `State=Focus` variant **8개 전부** `caret` ✅ · `remove` ✅.
  (`2410:13036` / `13060` / `13259` / `13283` / `13482` / `13506` / `13699` / `13721`)
- **패킹·렌더:** 세트 1726×958, 붕괴 없음. 스크린샷 `reports/figma-library-build/input-state-focus/screens/core-input-set-2410-13831.png`
  — 7 상태 열 × 8 행이 정상 격자로 배치되고, Focus 열은 파란 테두리 + 캐럿 + 지우기(×) 아이콘이 보인다.

> ⚠️ 참고(❓(c)-1로 별도 기재): **세트 key 가 바뀌었다** — 옛 `1f898e5259…`(세트 `2386:52176`) → 새 `44d14d83…`. 옛 세트 `2386:52176` 은 파일에서 **삭제됐다**(`getNodeByIdAsync` → MISSING).

---

## 2. 🔴 기존 시안이 깨졌는가 — **깨지지 않았다. 다만 정본과 어긋나 있다.**

**확인 방법:** 페이지 `173:2431`(Patterns Mobile) 전 INSTANCE 555개에 `getMainComponentAsync()` 실행 → 마스터 세트별 집계.

### 실측 건수 (인계 문서 "17곳"·저장소 기록 "12건" 둘 다 틀림)

| 시안 | Input 인스턴스 수 | 그중 `State=Editing` | 가리키는 마스터 세트 |
|---|---|---|---|
| `Pattern / App Login` (login-mobile, SECTION `1562:2`) | **20** | **2** (`1564:109`, `1564:185`) | `Input` **`1546:10988`** (112 variant, 축에 `Label` 있음) |
| `Pattern / Mobile Web Signup` (signup, SECTION `1744:1782`) | **10** | **6** (`1989:550`, `1858:18032`, `1989:18940`, `1858:18433`, `1996:7`, `1996:19305`) | `Input` **`1654:42409`** (112 variant, 축에 `Label` 있음) |
| **합계** | **30** | **8** | — |

### 세 가지 확인 결과

1. **컴포넌트 연결 — 살아있다.** 페이지 전체 인스턴스 555개 중 `mainComponent` 가 null 인 것 **0건**. detach 된 Input 인스턴스 0건.
2. **State 속성값 — 여전히 `Editing` 으로 읽힌다.** 8개 인스턴스의 `componentProperties.State.value === "Editing"`.
   마스터 세트 두 개(`1546:10988`·`1654:42409`)의 State 축 값이 `Default·Filled·**Editing**·Error·Correct·Read-Only·Disabled` 이고 **`Label` 축이 남아 있는 구버전**이기 때문이다.
3. **렌더 — 정상.** `1564:109`(320×48) · `1989:550`(320×70) 캡처 확인:
   `screens/legacy-login-editing-1564-109.png` · `screens/legacy-signup-editing-1989-550.png`
   — 파란 테두리·캐럿·지우기(×) 아이콘·안내문구가 정상 표시된다.

### 구분해서 보고 (river 요구사항)

- **"깨진 것" 아님** — 끊긴 인스턴스 0, 렌더 깨짐 0.
- **"정본과 어긋난 것" 맞음** — 시안 30개는 현재 정본 세트(`2410:13831`, 축 4개·56 variant)가 아니라 **구버전 세트(축 5개·112 variant·State=Editing)** 를 쓰고 있다. 이번 개명은 이 시안들에 **아무 영향을 주지 않았다**(3단계 ⭐ 발견이 사실로 확인됨).
- **추가 발견(❓(c)-2):** 두 구버전 세트는 **캔버스 어디에도 없다.** 부모 체인이 자기 자신 하나뿐이다(페이지 없음) — Figma 가 인스턴스 때문에 붙잡고 있는 **고아(삭제된) 마스터**다. 언제 고아가 됐는지는 **미확인**(이번 재설치 이전 세대일 가능성이 높다 — 아래 3항 근거).
- **고치지 않았다.**

---

## 3. 설치기 재실행의 부수 영향 — 새로 끊긴 것 0건 (영향은 Core 페이지 안)

**확인 방법:** "이상치가 있나"가 아니라 **"무엇이 어느 세대를 가리키나"** 로 봤다. 파일의 **12개 페이지 중 11개**를 전수 순회하며 모든 INSTANCE 의 마스터가 ①원격 ②캔버스에 붙어있음 ③고아(삭제됨) 중 무엇인지 집계했다.

| 페이지 | INSTANCE | 끊김 | 고아 마스터 세대 |
|---|---|---|---|
| Core `5:5706` | (정본 소유 페이지) | — | 세트 44개 전부 `2410:*` 신세대, 중복 이름 0 |
| Patterns Mobile `173:2431` | 555 | 0 | `1546:*` · `1654:*` (Input 30건 포함) |
| Patterns PC `80:16697` | 173 | 0 | `330:*` · `333~335:*` |
| S-1 S/W UX Pattern `2381:44746` | 124 | 0 | `2378:*` (82건) |
| modu app `80:16699` | 158 | 0 | `956:*` · `2378:*` |
| Video `16:1170` | 495 | 0 | `956:*` · `958:*` |
| Mobility `80:16700` | 906 | 0 | `1337:*` · `2368:*` · `2370:*` |
| sample `261:12116` | 143 | 0 | 없음 |
| ---공통--- · test · Building Management | 0 | 0 | 없음 |
| `--- service ---` `80:16698` | **미확인** (구분선 페이지, 미순회) | — | — |

**판정:**
- **끊긴(mainComponent=null) 인스턴스 파일 전체 0건.**
- 이번 재설치가 지운 세대는 **`2386:*`** 인데, **어느 페이지에서도 `2386:*` 마스터를 참조하는 인스턴스가 발견되지 않았다.** → **이번 재실행이 새로 끊거나 고아로 만든 소비자는 0건이고, 영향은 Core 페이지 안에 머물렀다.**
- 다만 구조적 사실로 드러난 것: **설치기는 재실행할 때마다 Core 페이지의 이전 세트를 지우고 새 id·새 key 로 다시 만든다.** 파일에 남은 고아 마스터 세대가 최소 7개(`330·333~335·956·958·1337·1546·1654·2368·2370·2378`)라는 것이 그 흔적이다. 이번엔 소비자가 없어 무사했을 뿐, **구조 자체가 매 재설치마다 시안을 정본에서 떼어놓는다.** (🟡(b)-1)
- **한계(미확인):** 재설치 **직전** Core 페이지의 전수 스냅샷이 없다. "무엇이 바뀌었나"를 노드 단위로 전후 대조한 것이 아니라, **소비자 쪽에서 역으로** 끊김 0건을 확인한 것이다. Core 페이지 내부의 Input 이외 세트가 이전과 동일한 내용인지는 **이 검증에서 확인하지 않았다.**

---

## 4. 폰트·토큰 스캔

### 폰트 — ✅ PASS (데이터 스캔, 렌더 판정 아님)

`figma-font-scan.md` 절차로 세트 `2410:13831` 의 전 TEXT 노드 `getStyledTextSegments(['fontName'])` 스캔.

| 항목 | 값 |
|---|---|
| textCount | **84** (0 아님 → selector 부패 없음) |
| 비-Pretendard | **0건** |
| textStyleId 바인딩 | 84 / 84 (raw 폰트 0) |

### 토큰 바인딩 — ❌ FAIL (EXACT 1건)

`token-binding-scan.md` 1단계 스캔(스캔 노드 485개) → 2단계 `figma-binding-lookup.js` 역매핑.

| hex | 노드 | prop | 판정 |
|---|---|---|---|
| `#FFFFFF` | `Input` **`2410:13831`** (세트 자기 프레임) | fills | **EXACT — `color/bg/level-0`, `color/surface/raised` 등가물 존재 → ❌(a) 바인딩 필수** |

- 미바인딩 총 **1건**, 고유 hex 1종.
- 출처: `plugins/figma-vars-installer/src/build-components.ts:678` `decorateSetFlat()` 의
  `set.fills = [{ type: "SOLID", color: specPalette(false).bg }]` — Variable 바인딩 없는 raw 흰색.
- **성격:** 이번 개명이 만든 것이 아니라 **설치기가 모든 세트에 공통으로 칠하는 스펙보드 배경**이다(`decorateSetFlat` 호출처 19곳 이상). 그래도 `token-binding-scan.md` 판정 규칙은 "EXACT 1건이라도 있으면 검문소 4 통과 불가"이므로 ❌(a)로 남긴다.
- **(b) 로 빼지 않은 이유:** "순수 장식 크롬" 예외는 `use_figma` 코드의 `// figma-hex-allow:` 마커 제도뿐이고, **설치기 TS 가 칠하는 세트 보드 배경에 대한 성문 예외는 저장소에 없다.** 예외로 인정하려면 문서화된 결정이 먼저 있어야 한다.

---

## 5. 검사기 재조준 — ✅ 정당한 재조준(약화 아님). 단, 한 검사기는 별도 문제로 빨간불.

### 5-1. `scripts/component-anatomy-check.js:39` (Gate 11) — ✅ 정당

**근거 1 — 지금 실제로 잡는다.** 계측 실행 결과(정규식 매칭 variant 열거):

```
[PROBE] Input / State=Focus :: matched=8
    - Size=XXSM, State=Focus, Message=Off, Break=PC
    - Size=XXSM, State=Focus, Message=On, Break=PC
    - Size=XSM,  State=Focus, Message=Off, Break=PC
    - Size=XSM,  State=Focus, Message=On, Break=PC
    - Size=MD,   State=Focus, Message=Off, Break=PC
    - Size=MD,   State=Focus, Message=On, Break=PC
    - Size=MD,   State=Focus, Message=Off, Break=Mobile
    - Size=MD,   State=Focus, Message=On, Break=Mobile
```
(다른 7개 규칙도 각각 4·1·4·4·12·4·3개를 잡는다 — 0개 매칭 규칙 없음)
`node scripts/component-anatomy-check.js` → `✅ 8개 규칙 전부 충족`, exit 0.

**근거 2 — 물어야 할 때 문다(변이 시험).** `build-components.ts` 사본에서 `caret.name = "caret"` → `"caret_BROKEN"` 으로 바꾸고 같은 검사기를 돌리자:

```
❌ [Input / State=Focus] variant "Size=XXSM, State=Focus, Message=Off, Break=PC" 에 누락: caret
…8건 + Text Area 1건 = 9건 —  exit 1
```
→ 검사가 죽지 않았다. **한 형태(통과)만 보지 않고 실패 형태까지 시험했다.**

### 5-2. `scripts/design-md-agent-contract-check.js:38` — ✅ 재조준 자체는 대칭(약화 아님), ❓(c)-3 별건 실패

- 기대 문자열이 `- "Editing"` → `- "Focus"` 로 바뀌었고, `design/DESIGN.core.md` 의 Input builder 목록도 `Focus` 로 재생성돼 **이 항목은 통과**한다(실패 목록에 Input 없음).
- **변이 시험:** DESIGN.core.md 사본에서 Input **builder 목록에서만** `- "Focus"` 를 지우고 돌렸으나 **여전히 통과**했다. 이유는 같은 Input 섹션의 `variantAxes.State` 에도 `- "Focus"` 가 있어서다.
  → **다만 이건 이번 변경이 만든 구멍이 아니다.** HEAD 의 DESIGN.core.md 에서도 `variantAxes.State` 에 `- "Editing"` 이 함께 있었으므로 **개명 전후 강도가 정확히 동일**하다. 재조준은 대칭이다. (선존 느슨함 = 🟡(b)-2)
- **❓(c)-3:** 이 검사기는 **지금 exit 1 이다** — `❌ PC 사이트에 없는 Modal 행동이 임의 생성됨`. HEAD 버전(검사기·문서 둘 다 HEAD)로 재현해도 **동일하게 실패**하므로 **이번 작업과 무관한 선존 실패**지만, 이 상태로는 `design:md:check` 가 빨간불이다.

---

## 6. 저장소 파생 표면 잔존 스캔

`*.ts *.js *.json *.html *.md *.css` 전수 grep(아카이브·reports 제외):

| 파일 | 잔존 | 판정 |
|---|---|---|
| `plugins/figma-vars-installer/src/build-components.ts` · `pattern-data.ts` | 0 | ✅ |
| `registry/components/input.json` | 0 (`:64` a11y·`:213` `"state": "Focus"` 개명 확인) | ✅ |
| `registry/components/component-facts.json` · `component-guide-model.json` · `design/DESIGN.core.md` | 0 | ✅ |
| `ui-library/src|dist .../input.manifest.json` `canonicalStateMap` | `"Focus": "focus"` (값 `focus` 불변) | ✅ |
| `assets/css/ui-library-guide.css` · `assets/js/ui-library-guide.js` | `data-force-state="focus"` (HD-1 river (A) 반영) | ✅ |
| `pages/components.html` · `pages/ui-review.html` · `scripts/gate-check.js` · `.claude/docs/gates-reference.md` | 0 (주석·문구만 변경, 검사 로직 무변경 — diff 확인) | ✅ |
| **`assets/js/registry-data-bundle.js`** | **2건 (`:11608` a11y 문장, `:11780` `"state": "Editing"`)** | **❌(a)-1** |

`registry-data-bundle.js` 는 `scripts/build-registry-bundle.js` 가 `registry/**` 에서 생성하는 **파생**인데, 원본(`registry/components/input.json`)은 `Focus` 인 반면 번들은 `Editing` 이다. git 상 **이 파일은 이번에 아예 수정되지 않았다**(재생성 누락).

---

## 7. 그 밖의 게이트 상태 (판정 근거로 실행한 것만)

| 검사 | 결과 |
|---|---|
| `node scripts/canon-addition-check.js` (Gate 34) | ✅ 정본 신설 0건 (tracked 617 · added 0 · removed 0). 동결목록 `canon-additions-baseline.json` 은 이번에 **수정되지 않았고**, Input 상태는 원래부터 소문자 `uistate:input.focus` 로 등록돼 있었다 → 개명이 신설을 만들지 않은 게 맞다 |
| `node scripts/installer-build-verify-check.js` (Gate 13) | ❌ 검증 기록 stale. **이번 검증에 ❌(a)가 있으므로 `--record` 하지 않았다** |
| `npm run gate:check` · `ui:build:check` · `ui:test` | **미확인** — 호출자가 기계검사 표를 주지 않았고, 검증자가 대신 돌리지 않았다 |

---

## 판정

**FAIL — 검문소 4 통과 불가.** ❌(a) 2건 · ❓(c) 3건.

| # | 분류 | 내용 |
|---|---|---|
| ❌(a)-1 | 파생 미재생성 | `assets/js/registry-data-bundle.js` 에 `Editing` 2건 잔존(원본 input.json 은 Focus). 게다가 `build:bundle` 이 `tokens:reconcile`·`gate:check` 어디에도 배선돼 있지 않다 — 자동 연동이 없는 파생 |
| ❌(a)-2 | 미바인딩 색 | Input 세트 `2410:13831` 자기 fill `#FFFFFF` 미바인딩(EXACT=`color/bg/level-0`). 출처 `build-components.ts:678 decorateSetFlat` — 모든 세트 공통·선존·이번 개명 무관 |
| ❓(c)-1 | 세트 key 변경 | `1f898e5259…` → `44d14d83…`, 옛 세트 `2386:52176` 삭제. 저장소 허용목록엔 Input key 가 없어 당장 깨지는 곳은 없으나, 이 파일을 라이브러리로 쓰는 **외부 파일** 영향은 확인 못 함 |
| ❓(c)-2 | 고아 마스터 | 시안 30개가 캔버스에 없는 삭제된 마스터(`1546:10988`·`1654:42409`)를 참조 중. 렌더 정상이나 관리 불가 상태. 정본 정렬(시안 재바인딩)을 할지 말지는 river 결정 사항 |
| ❓(c)-3 | 선존 게이트 실패 | `design-md-agent-contract-check` 가 Modal 항목으로 exit 1 (HEAD 에서도 동일 재현) |
| 🟡(b)-1 | 개선 적재 | 설치기 재실행이 매번 Core 세트를 지우고 새 id/key 로 다시 만든다 → 시안이 세대마다 고아 마스터에 남는다(파일 내 고아 세대 최소 7개) |
| 🟡(b)-2 | 개선 적재 | `design-md-agent-contract-check` 의 Input 상태 검사는 섹션 전체를 보므로 builder 목록만 빠져도 통과한다(선존·이번 변경과 무관) |

**미확인으로 남긴 것:** `--- service ---` 페이지 순회 · 재설치 직전 Core 페이지 전수 스냅샷 대조 · `gate:check`/`ui:test` · 이 파일을 참조하는 외부 Figma 파일.
