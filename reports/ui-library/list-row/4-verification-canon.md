# 4-verification (정본) — Gate 13 독립 검증 · buildListRow

- 검증자: 🤖 component-verifier (시나리오 D — 설치기 생성기 구조 변경)
- 일자: 2026-09-21
- 대상: `plugins/figma-vars-installer/src/build-components.ts` · `buildListRow`(1242-1366) + 등록 3자리
- 계약 정본: `registry/components/list-row.json`
- 판정 근거: 코드 정독 + git diff + 결정론 게이트 4종 실행 + **빌더 실행 구조 프로브**(esbuild 번들 + findOne 구현 mock)
- 한계: **Figma 실물 캔버스 렌더는 미검증**(MCP figma-local 연결 거부·figma 플러그인 미인증). 코드 레벨 위험만 지적.

---

## 0. 결정론 게이트 (검증자 실행, 전부 exit 0)

| 게이트 | 결과 |
|---|---|
| `npm run installer:check` (tsc --noEmit) | ✅ exit 0 |
| `npm run components:keycheck` | ✅ 누락 0 (color 167/184 · number 16/79) |
| `npm run components:anatomy` | ✅ 8개 규칙 충족 |
| `npm run components:iconpolicy` | ✅ 위반 0 |

## 0-1. 구조 프로브 실측 (List Row 세트 56칸 전수)

빌더를 실제 실행해(page.findOne 구현 mock) 기록한 노드 트리:

```
variants: 56
[Nav/Default/Default]    FRAME:text | TEXT | TEXT | FRAME:trail | INSTANCE:chevron
[Value/Default/Default]  FRAME:text | TEXT | TEXT | FRAME:trail | TEXT | INSTANCE:chevron
[Read/Default/Default]   FRAME:text | TEXT | TEXT
[Pick/Default/Default]   INSTANCE:control(of State=Default) | FRAME:text | TEXT | TEXT
[Agree/Default/Default]  INSTANCE:control(of State=Default) | FRAME:text | TEXT | TEXT | FRAME:trail | INSTANCE:chevron
[Switch/Default/Default] FRAME:text | TEXT | TEXT | FRAME:trail | INSTANCE:toggle(of Pressed=On, State=Default)
[Thumb/Default/Default]  FRAME:thumbnail | FRAME:text | TEXT | TEXT
[Switch/Compact/Disabled] … INSTANCE:toggle(of Pressed=On, State=Disabled)
[Pick/Compact/Disabled]   INSTANCE:control(of State=Disabled) …

comp bound:  {paddingLeft:spacing/20, paddingRight:spacing/16, paddingTop:spacing/16,
              paddingBottom:spacing/16, itemSpacing:spacing/16}
text bound:  {itemSpacing:spacing/2}
thumb bound: {width:sizing/48, height:sizing/48, *Radius:radius/4}

toggle inst 8/8 · control inst 16/16 · chevron 24/24
```

---

## 1. 축이 계약과 같은가 — ✅ PASS

- `build-components.ts:1250-1252` types 7 × densities 2 × states 4 → 실측 **56칸**. 계약 `variantAxis.values`(list-row.json:66-70)와 전부 일치, `absentCombinations: []` 와도 부합.
- variant 이름: `build-components.ts:1259` `` comp.name = `Type=${t}, Density=${d.name}, State=${st}` `` — 기존 관례(`Pressed=Off, State=Default` 1204 / `Size=…, State=…, Break=…` 2429)와 동일한 `Key=Value, ` 표기. 속성 순서도 계약 `property: ["Type","Density","State"]` 와 같다.
- Density 의미: `Default`=제목+설명·여백 16, `Compact`=제목만·여백 12 (1248-1249) = 계약 `sizeAxis` 주석과 일치.
- `figma.propertyMap` 소문자 표기는 다수 관례(bottom-sheet-option·date-picker·modal·multi-toggle)와 같다 — 문제 없음.

## 2. 높이를 숫자로 고정하지 않았는가 — ❌ **FAIL (a) · 이번 검증의 최대 위험**

`counterAxisSizingMode = "AUTO"` 자체는 있다. 그러나 **설정 순서가 이 저장소가 명시한 순서와 반대**다.

```ts
// build-components.ts:1262-1265
comp.primaryAxisSizingMode = "FIXED";   // 폭 360 고정
comp.counterAxisSizingMode = "AUTO";    // ★ 높이는 여백+글이 정한다(숫자 고정 없음)
comp.resize(ROW_W, 1);
```

저장소가 이미 기록해 둔 규칙(같은 파일):

```ts
// build-components.ts:3174-3176
node.resize(panelW, 100);              // 폭 고정 (resize 후 sizing 모드 설정)
node.primaryAxisSizingMode = "AUTO";   // 높이 hug
node.counterAxisSizingMode = "FIXED";  // 폭 = panelW 고정
```

- 오토레이아웃 프레임에 `resize()` 를 부르면 **양 축 sizing mode 가 FIXED 로 덮인다.** 그래서 3174 의 선례는 resize 를 먼저 하고 모드를 나중에 건다 — 주석이 그 이유를 못박아 두었다.
- `buildListRow` 는 모드를 먼저 걸고 `resize(ROW_W, 1)` 을 나중에 부른다. 이대로면 **높이가 hug 가 아니라 1px FIXED 로 고정**되고, river 결정("간격을 패딩 토큰으로 적용하면 자연스럽게 전체 하이트가 잡히는 거지")이 그대로 무효가 된다. 56칸 전부가 대상이다.
- 같은 함수 안에서 **자식들은 순서를 맞게 썼다** — `thumbnail`(1296-1299: resize → 바인딩 → appendChild → `layoutSizing*` FIXED)·`text`(1313-1314: appendChild 뒤 `layoutSizingHorizontal="FILL"`)·`trail`(1345: appendChild 뒤 `"HUG"`). **컴포넌트 자신만 순서가 뒤집혔다.**
- 이 실패는 어떤 게이트도 못 잡는다: tsc·keycheck·anatomy·iconpolicy 전부 통과하고, mock 프로브도 sizing mode 재계산을 흉내내지 못한다.
- 여백 자체는 정상이다 — `paddingTop/Bottom` 은 `numv("spacing/16"|"spacing/12")` **변수 바인딩**이고 raw 숫자가 아니다(실측 bound 목록 참조).
- 고치지 않는다(검증 전용). 방향만 적으면 3174 와 같은 순서로 뒤집으면 된다.

> ⚠️ Figma 실물 렌더로 1px 붕괴를 **직접 보지는 못했다**(MCP 연결 불가). 그러나 저장소 자신이 남긴 순서 규칙을 어긴 것은 코드로 확정된다.

## 3. 토큰 경유 — ✅ PASS

- 색: 세트 배경(1266) · 썸네일(1294) · 제목/설명/값 글자(1310-1311, 1332) · 아이콘(1341) 전부 `boundPaint(scv(maps, …))`. **하드코딩 hex 0건.**
  - `chevRight("#000")`(1246)의 `#000` 은 `makeIconInstance` 의 **라이브러리 import 실패 폴백 SVG** 인자이고, 두 경로(1747 / 1766) 모두 `rebindIconColor(node, colorVar)` 로 즉시 재바인딩된다. iconpolicy 게이트 ✅ 와 일치. 위반 아님.
- 여백·크기·반경: `spacing/20·16·12·4·2` · `sizing/48` · `radius/4` 전부 `requireVar(maps.foundationNumber, …)` → `setBoundVariable`/`bindRadius`. 실측 bound 목록에서 확인.
- 텍스트 스타일: 제목 `title/16M`(1310) · 설명 `body/14R`(1311) · 값 `body/14R`(1332) — 정본 키 바인딩.
- 사용 키 전수가 `vars-data.ts` 정본에 존재(개별 grep + keycheck 누락 0).
- 다크: `setLightMode(comp, maps)`(1350)는 `build-components.ts:333-338` 에서 **type==="COMPONENT" 이면 즉시 return** 하는 no-op 이다. 2026-09-21 "마스터에 모드 고정을 박지 않는다" 결정에 대한 회귀가 아니다.

## 4. 코어 재사용 — ✅ PASS (경로 추적 완료) · 🟡 개선 3건

**핵심 질문(Toggle 을 찾을 수 있는가)의 답: 찾는다.** 근거:

1. `BUILT_SETS["Toggle"]` 은 **등록되지 않는다** — `buildToggle`(1218-1221)에 등록 줄이 없다. reuseVariant 대상 6종(Checkbox 1110 · Dropdown List 2265 · StatusBar 6404 · GNB Sub Menu Item 4197 · Calendar Nav Arrow 4700) 중 **Toggle 만 빠져 있다.**
2. 그래도 `getBuiltSet`(136-138)이 **캔버스 폴백**을 갖는다 — `figma.currentPage.findOne(n => n.type==="COMPONENT_SET" && n.name==="Toggle")`. Toggle 세트는 `combineAsVariants(comps, figma.currentPage)`(1218)로 **현재 페이지에 놓이므로** findOne 사정거리 안이다. 재설치 skip 경로에서도 기존 세트가 같은 페이지에 남아 있어 동일하게 잡힌다(7553-7564 skip 분기는 세트를 지우지 않는다).
3. 빌드 순서도 보장된다 — `COMPONENT_CATEGORIES_GRID` 에서 `Selection`(Toggle 포함, 7133)이 `List`(7139)보다 앞이다. `BUILD_DEPENDENCIES["List Row"] = ["Checkbox","Toggle"]`(7185)은 같은 카테고리 의존만 정렬하므로 순서 보장이 아니라 문서용이라는 주석도 정확하다.
4. **실측**: 프로브에서 `INSTANCE:toggle(of Pressed=On, State=Default/Disabled)` **8/8**, `INSTANCE:control(of State=Default/Disabled)` **16/16**. 내부 복제 0 — 계약 `doDont.dont` "체크·토글 코어 내부를 복제하지 않는다" 준수.

다만 **선례와 다른 점 3가지**(전부 현재 도달 가능한 경로에서는 동작함 → 🟡):

- 🟡 **(4-a) `matches` 인자 형식만 다르다.** 1334 는 `["Pressed=On, State=${tgState}"]` 통짜 문자열. 나머지 5개 호출부는 속성별로 쪼갠 조각 배열(`["Size=MD","State=…"]` 2337 · `["Depth=…","State=…"]` 4215). `includes()` 대조라 **속성 순서·구분자에 의존**한다. 현재 `buildToggle` 이 짓는 이름과 정확히 같아 매칭되지만(실측 8/8), 조각 배열로 바꾸면 이 의존이 사라진다.
- 🟡 **(4-b) `BUILT_SETS["Toggle"]` 미등록**(위 1번). 한 줄이면 폴백 의존이 없어진다.
- 🟡 **(4-c) reuse 실패 시 `else` 가 없다.** 1286-1290 / 1335-1340 은 `if (chk)` / `if (tg)` 만 있고 실패 처리가 없다 → **조용한 빈자리**. 특히 Switch 는 `if (t==="Switch") {…} else { 화살표 }` 구조라, 토글을 못 찾으면 화살표조차 안 붙어 `trail` 이 완전히 빈 프레임이 된다. 열화 보고(7773-7812)는 `if (failed.length)` 일 때만 돌아 이 공백을 **원리적으로 못 잡는다.** 선례 `buildDropdownList`(2182-2205)는 같은 자리에 `console.warn` + 정본 동일 토큰 fallback 도형을 둔다 — 2026-08-14 "체크박스 18개가 통째로 가짜"를 겪고 만든 방어다. 현재 설치기는 선택 설치가 없어(전체 설치만) 도달 불가 경로이므로 ❌ 가 아니라 🟡 로 둔다.

## 5. 기존 코드를 깨뜨리지 않았는가 — ✅ PASS

`git diff --stat` = **144 insertions(+), 0 deletions**. 헝크 4개 전부 순수 삽입:

| 헝크 | 위치 | 내용 |
|---|---|---|
| `@@ -1232,4 +1232,144 @@` | buildToggle 직후 | `buildListRow` 본문 |
| `@@ -6996,4 +7136,6 @@` | GRID | `{ name: "List", members: ["List Row"] }` |
| `@@ -7041,4 +7183,5 @@` | BUILD_DEPENDENCIES | `"List Row": ["Checkbox","Toggle"]` |
| `@@ -7297,4 +7440,5 @@` | runners | `"List Row": (oy) => buildListRow(maps, oy)` |

기존 함수·배열 본문 변경 흔적 없음. `BUILT_COMPS` 키(`ListRow:…`)·`BUILT_SETS["List Row"]` 도 기존 키와 충돌하지 않는다. registry 등재도 확인(`registry/index.json:78`, `registry/components/index.json:392`).

## 6. 계약과 어긋나는 구석

### ❌ FAIL (a) — `tokens.line` 이 어디에도 쓰이지 않는다

`registry/components/list-row.json:86` 이 `"line": ["color/line/gray/subtle"]` 를 선언한다. 그러나

- 정본 `buildListRow` 는 **line 계열 토큰을 한 번도 쓰지 않는다**(구분선 노드 자체가 없다).
- 웹 소스 `ui-library/src/components/list-row/list-row.css` 도 이 토큰을 쓰지 않는다.
- 같은 계약의 anatomy(`list-row.json:34`)가 **"구분선 … 줄이 소유하지 않고 목록이 긋는다"** 라고 못박는다.

즉 계약이 자기 자신과 모순되고, 실제 구현과도 다르다. 코드가 맞고 선언이 과잉이다 — 계약에서 빼거나 "목록이 긋는 선(참고)"으로 명시해야 한다. (수정은 구현자 소관.)

### ✅ 알려진 쟁점 — Value 유형의 화살표: **정본은 옳다**

`build-components.ts:1330-1343` — `needsTrail` 에 `Value` 가 포함되고, `t==="Value"` 면 값 텍스트를 넣은 뒤 `else` 분기(Switch 아님)로 **화살표까지 붙인다.** 프로브 실측: `[Value/Default/Default] … FRAME:trail | TEXT | INSTANCE:chevron` — 값 + 화살표 확인. 계약 anatomy 의 "값+화살표"와 일치. **웹 배포본 쪽이 정본과 어긋난 것이며, 배포본을 정본에 맞추는 것이 옳다.**

### ✅ 알려진 쟁점 — Thumb 48 = `sizing/48`: 근거 충분

`build-components.ts:1291-1295` 가 `resize(48,48)` 뒤 `width`/`height` 를 `numv("sizing/48")` 로 바인딩한다(자식이라 순서가 맞다 — §2 와 달리 `layoutSizing*` 를 appendChild 뒤에 건다). `sizing/48` 은 `vars-data.ts` 정본에 실재하고 keycheck 누락 0. 계약 anatomy "그림(썸네일 48)"·`tokens.radius: ["radius/4"]` 와 일치. **지적할 근거 없음.**

### ❓ HOLD (c) — 확인 필요 2건

- **(c-1) Agree 에만 화살표가 붙고 Pick 에는 안 붙는다.** 둘 다 왼쪽 체크박스를 쓰는데 오른쪽이 비대칭이다(실측: Agree=control+chevron, Pick=control만). 계약은 오른쪽 칸 후보를 나열할 뿐(`list-row.json:33`) **유형별 매핑을 선언하지 않아** 의도인지 판정할 수 없다. 동의 줄에서 약관 보기로 들어가는 관용으로 보이지만, 추측으로 (b) 처리하지 않는다. → **계약에 유형별 오른쪽 칸 매핑을 명시**하고 river 확인.
- **(c-2) 폭 `ROW_W = 360` raw 고정.** `primaryAxisSizingMode="FIXED"` + 360(1243, 1264). 계약에는 폭에 대한 선언이 전혀 없다. 목록이 폭을 정하는 부품이라면 인스턴스마다 늘려야 하고, 진열용 기본 폭일 뿐이라면 계약에 그렇게 적어야 한다. → 확인 필요.

---

## 항목별 판정 요약

| # | 항목 | 판정 |
|---|---|---|
| 1 | 축 56칸 · 이름 표기 관례 | ✅ PASS |
| 2 | 높이 숫자 미고정 (hug + spacing 바인딩) | ❌ **FAIL (a)** — sizing mode 설정이 `resize()` 뒤로 가야 하는데 앞에 있다 |
| 3 | 토큰 경유 (색·여백·반경·텍스트 스타일) | ✅ PASS |
| 4 | 코어 재사용 (Checkbox 16 · Toggle 8 실측) | ✅ PASS · 🟡 개선 3건(4-a/4-b/4-c) |
| 5 | 기존 코드 무변경 (144+/0-) | ✅ PASS |
| 6 | 계약 대조 | ❌ **FAIL (a)** `tokens.line` 미사용 · ❓ HOLD (c) 2건 · Value 화살표는 정본 옳음 |
| 0 | 결정론 게이트 4종 | ✅ 전부 exit 0 |

- ❌(a): 2건 · ❓(c): 2건 · 🟡(b): 3건 · BLOCKED: 0건
- 미검증 범위: **Figma 실물 캔버스 렌더**(MCP 연결 불가) — §2 의 높이 붕괴는 코드 규칙 위반으로만 확정, 육안 미확인.

## 한 줄 판정

**fail**

---
---

# 4-verification (정본) — **2차 재검증** (델타)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-21
- 입력: 1차 보고서(위) + 1차 이후 변경분(`build-components.ts` · `registry/components/list-row.json` · `scripts/gen-component-facts.js` · `scripts/lib/figma-build-mock.js`)
- 범위: **델타 재검증** — 1차 ❌/🟡/❓ 항목 + 이번에 새로 들어간 minHeight·계약 보강만 대조했다.
  - **이번에 재확인하지 않음(1차 PASS 승계):** §1 축 56칸·이름 표기 · §3 토큰 경유(색·여백·반경·텍스트 스타일) · §5 기존 코드 무변경. 근거: 해당 코드 블록이 델타에 포함되지 않았고, 1차 이후 검사 규칙이 강화되지 않았다.
- 한계: **Figma 실물 캔버스 렌더는 여전히 미검증**(figma-local ConnectionRefused · figma MCP 미인증). 코드·mock 실행 레벨만.

## 2-0. 결정론 게이트 (검증자 직접 실행)

| 게이트 | 결과 |
|---|---|
| `npm run installer:check` (tsc --noEmit) | ✅ exit 0 — `minHeight` 타입 통과 |
| `npm run components:keycheck` | ✅ exit 0 · 누락 0 (color 167/184 · number 16/79) |
| `npm run components:anatomy` | ⚠️ exit 0 이지만 출력에 **`[installer] 생성 실패 1개: List Row`** (§2-4 참조) |
| `npm run components:iconpolicy` | ✅ exit 0 · 위반 0 |
| `npm run components:facts` (**Gate 9e**) | ❌ **exit 1** — component-facts.json 이 정본과 어긋남 (§2-8) |

## 2-1. resize 순서 역전 — ✅ **PASS** (1차 ❌ 해소)

```ts
// build-components.ts:1273-1276
//    나중에 부르면 양 축이 FIXED 로 덮여 높이가 1px 로 굳는다(선례 3174-3176 과 같은 순서).
comp.resize(ROW_W, 1);
comp.primaryAxisSizingMode = "FIXED";   // 폭 360 고정
comp.counterAxisSizingMode = "AUTO";    // ★ 높이는 여백+글이 정한다
```

선례와 순서가 같다 — `build-components.ts:3204-3206` `node.resize(panelW, 100); // 폭 고정 (resize 후 sizing 모드 설정)` → `primaryAxisSizingMode="AUTO"` → `counterAxisSizingMode="FIXED"`. HORIZONTAL 오토레이아웃에서 primary=폭·counter=높이이므로 `FIXED/AUTO` 조합도 의도(폭 360 고정·높이 hug)와 맞다. 1차 ❌(a) 해소.

- 🟡 **주석의 줄 번호가 이미 어긋난다.** `build-components.ts:1274` 가 가리키는 "선례 3174-3176" 은 buildListRow 가 173줄을 밀어 넣은 뒤 **`makeCol`(3172-3175)** 을 가리키는데, 그 코드는 정반대 순서(`primaryAxisSizingMode`·`counterAxisSizingMode` → `col.resize(44, TPD_COLS_H)`)다. 진짜 선례는 **3204-3206**. 다음에 이 주석을 읽는 사람이 반대 순서를 선례로 베낄 수 있다. (수정은 구현자 소관 — 줄 번호를 3204-3206 으로 고치거나 함수명으로 인용.)

## 2-2. 계약이 선언한 구분선 토큰 — ✅ **PASS** (1차 ❌ 해소)

`registry/components/list-row.json:160` 에서 `tokens.line` 이 사라지고 대신
`"_note": "구분선(color/line/gray/subtle)은 줄이 아니라 목록이 긋는다 — 이 부품의 토큰 목록에 넣지 않는다."` 로 바뀌었다.
`grep 'line/gray/subtle'` 결과 계약의 이 주석 한 줄뿐 — 코드·CSS 어디에도 없다. 선언↔코드가 일치하고, 같은 계약의 anatomy(`list-row.json:34` "줄이 소유하지 않고 목록이 긋는다")와도 모순이 없다.

## 2-3. reuseVariant 인자 표기 — ✅ **PASS** (1차 🟡 해소)

`build-components.ts:1352` `await reuseVariant("Toggle", \`Toggle:On:${tgState}\`, ["Pressed=On", \`State=${tgState}\`])` — 나머지 5개 호출부(2337·4215 등)와 같은 **조각 배열**. `reuseVariant`(131-146)의 `matches.every((m) => c.name.includes(m))` 대조에서 구분자·속성 순서 의존이 사라졌다.

## 2-4. `BUILT_SETS["Toggle"]` 등록 — ❌ **FAIL (a)** · "다른 곳을 깨뜨리지 않는지" = **깨뜨린다**

```ts
// build-components.ts:1222
BUILT_SETS["Toggle"] = set;   // List Row 등이 reuseVariant 로 집어 쓴다(캔버스 폴백에 기대지 않는다)
```

실제 Figma 런타임에서는 무해하다(진짜 `ComponentSetNode.children` 은 `createInstance` 를 갖는다). 그러나 **결정론 검사 하네스를 깬다** — 검증자가 실행해 재현했다:

```
$ npm run components:anatomy
[installer] "List Row" 생성 실패 — 이번 시도 산출물만 정리하고 계속합니다: tg.createInstance is not a function
[installer] 생성 실패 1개: List Row
  ✅ 8개 규칙 전부 충족 …            ← exit 0. 게이트는 이 실패를 판정에 넣지 않는다.
```

**원인 격리(직접 실증):** 이 한 줄만 임시로 제거하고 같은 명령을 돌리면 실패가 사라지고 List Row 가 정상 생성된다(폴백 경로로).
- 등록 **전**: `getBuiltSet("Toggle")` → `BUILT_SETS` 비어 있음 → 캔버스 `findOne` → mock 에서 null → `reuseVariant` null → §2-5 폴백 도형 → **성공**.
- 등록 **후**: 세트를 찾으므로 `set.children.find(...)` 가 mock 의 raw child 를 반환 → 그 객체에 `createInstance` 가 없어 **throw** → List Row 가 통째로 빌드에서 빠진다.

결과: **`components:anatomy` 에서 List Row 가 아예 검사 대상에서 사라졌는데 게이트는 초록이다.** 1차에서 🟡 로 둔 것을 고치려다 검사 사각지대를 하나 만들었다.

**선례는 세트가 아니라 변형 등록이다** — `buildCheckbox`(`build-components.ts:1109-1110`)는
`states.forEach((s, i) => { BUILT_COMPS[\`Checkbox:${s.name}\`] = comps[i]; });` 로 **변형별 BUILT_COMPS** 를 먼저 등록하고 그 다음 줄에서 세트를 등록한다. 그래서 `reuseVariant` 가 `BUILT_COMPS` 캐시에서 바로 끝나고 `set.children` 을 훑지 않는다 — 실제로 이번 실행에서 Checkbox 재사용은 8칸 전부 폴백 없이 성공했다(`[List Row] Checkbox …` warn 0건). `buildToggle` 은 세트만 등록하고 변형은 등록하지 않아 선례의 절반만 따랐다. (수정은 구현자 소관 — 방향만 적으면 Checkbox 와 같이 `BUILT_COMPS["Toggle:Pressed=On,State=…"]` 류를 함께 등록하면 실제 Figma·mock 양쪽에서 모두 인스턴스 경로를 탄다.)

## 2-5. reuse 실패 시 임시 도형 — ✅ **PASS**

정본 치수·토큰과 **정확히 일치**한다.

| 폴백 | 정본 | 대조 |
|---|---|---|
| Checkbox `build-components.ts:1288-1296` — 18×18 · `cornerRadius 2` · `strokeWeight 1` · `strokeAlign "INSIDE"` · `control/bg/default\|disabled` · `control/border/default\|disabled` | `buildCheckbox` 1081-1089 + states 1061/1064 | ✅ 전부 동일 (Default·Disabled 는 체크 아이콘 없는 상태라 아이콘 누락도 정합) |
| Toggle `build-components.ts:1357-1365` — 트랙 40×20 · `cornerRadius 10` · `control/bg/selected`(비활성 `control/bg/disabled`) · 노브 16 · `x=22, y=2` · `control/indicator/selected`(비활성 `control/indicator/disabled`) | `buildToggle` 1197-1214 (`trackKey`·`knobKey`·`knob.x = on ? 22 : 2`) | ✅ 전부 동일 (On 위치) |

두 폴백 모두 `appendChild` **뒤에** `layoutSizing*` 를 걸어 순서 규칙을 지켰고, `console.warn` 이 조용한 빈자리를 막는다. `setLightMode` 를 걸지 않은 것도 "마스터에 모드를 박지 않는다"(2026-09-21)와 맞다.

## 2-6. 글 자리 최소 높이 `minHeight` — ❌ **FAIL (a)** (③ 불성립)

```ts
// build-components.ts:1320-1322
//   맞춘다(Default=썸네일 48 · Compact=화살표 24). 새 숫자를 만들지 않고 이미 있는 값을 쓴다.
text.minHeight = d.name === "Default" ? 48 : 24;
```

**①값이 그 밀도의 최대 부품과 같은가 — Default ✅ / Compact ❌.**
그 밀도에 실제로 들어가는 부품 높이(코드 실측):

| 밀도 | text 내용 높이 | control(체크) | thumbnail | trail(화살표/토글/값) | **최대 부품** | minHeight |
|---|---|---|---|---|---|---|
| Default (padY 16) | 20.8+2+18.2 = **41** | 18 | **48** | 24 / 20 | 48 (썸네일) | 48 ✅ |
| Compact (padY 12) | **20.8** | 18 | **48** | 24 / 20 | **48 (썸네일)** | 24 ❌ |

(글 높이는 `textstyles-data.ts:48` `title/16M` lineHeight 130% = 20.8 · `:60` `body/14R` 130% = 18.2 로 계산. 둘 다 minHeight 보다 작아 minHeight 가 높이를 지배한다.)
Thumb 의 썸네일은 **밀도와 무관하게 48 고정**이다(`build-components.ts:1305-1309` — `d` 를 보지 않는다). 그러므로 Compact 에서 "가장 큰 부품"은 화살표 24 가 아니라 썸네일 48 이고, 주석·계약이 적은 근거가 사실과 다르다.

**②AUTO 와 충돌하는가 — ✅ 충돌 없음.** `text` 는 `layoutMode="VERTICAL"` 을 먼저 걸고 나서 `minHeight` 를 세팅하므로 오토레이아웃 컨텍스트가 성립하고(순서 안전), hug 높이와 min 높이는 `max()` 로 합쳐진다. `installer:check`(tsc) exit 0 로 타입도 확인.

**③56칸 전부에서 같은 밀도끼리 높이가 같은가 — ❌ 아니다.** 행 높이 = `padY×2 + max(자식 높이)`:

| 칸 | 계산 | 높이 |
|---|---|---|
| Default × 7유형 (Nav·Value·Read·Pick·Agree·Switch·Thumb) | 16×2 + 48 | **80** — 28칸 전부 같다 ✅ |
| Compact × 6유형 (Nav·Value·Read·Pick·Agree·Switch) | 12×2 + 24 | **48** |
| **Compact × Thumb (4칸)** | 12×2 + **48** | **72** ❌ |

`absentCombinations: []`(`list-row.json:73`) 이므로 Thumb/Compact 4칸은 실재한다. 즉 **"같은 목록 안에서 줄 높이가 갈리면 안 된다"(river 2026-09-21)는 규칙이 Compact 목록에서 그대로 깨진다** — 그림 줄만 24px 더 높다. minHeight 를 넣은 목적 자체가 이 4칸에서 달성되지 않는다.

고치지 않는다(검증 전용). 성립하는 선택지는 두 갈래이고 **어느 쪽인지는 river 결정 사항**이다 — (A) Compact 의 최소 높이를 썸네일과 같은 48 로 올린다(그러면 Compact 가 Default 와 같은 높이가 되어 밀도 축의 의미가 옅어진다) / (B) Compact 에서는 썸네일을 24 로 줄이거나 Thumb×Compact 를 `absentCombinations` 로 뺀다. **⚠️ mock 은 레이아웃을 계산하지 않아 이 높이는 실측이 아니라 코드에서 결정론적으로 도출한 값이다** — Figma 실물에서 재확인해야 한다.

## 2-7. 계약 보강 — ✅ **PASS** (1차 ❓ 2건 모두 해소)

- **(c-1) Agree 만 화살표 → 해소.** `list-row.json:75-101` `variantAxis.slotMap` 이 7유형의 왼쪽·오른쪽 칸을 전부 선언한다. **코드와 7/7 일치** — `needsTrail = Nav|Value|Agree|Switch`(`build-components.ts:1333`) · 왼쪽은 `Pick|Agree`=체크, `Thumb`=그림(1283·1304). `slotMapNote`(:102)의 근거도 저장소에서 확인된다 — `reports/pattern-builder/inventory/modu-app/patterns-found.md:22` "약관·동의 | 18 | …" 로 **18장이 실재**하고, `02-1-2-회원가입-로그인.md:20,66` 의 약관 동의 화면이 `m_checkbox×4, More×2, icon/arrow` 구성이다. 추측이 아니라 판독 근거다.
  - 🟡 참고: 정본 계약이 레거시 서비스(모두앱) 판독을 근거로 인용한다. 수치가 아니라 칸 배치라 2026-09-18 분리 규칙("그 수치를 정본 근거로 쓰지 않는다")에 직접 걸리지는 않지만, 같은 문장에 river 결정 근거를 함께 적어 두는 편이 안전하다.
- **(c-2) ROW_W 360 raw → 해소.** `list-row.json:207-210` `geometry.width` = "부품 자체는 폭을 정하지 않는다(웹은 100%). Figma 정본은 캔버스 편의상 360 으로 그린다." · `geometry.height` = "숫자로 고정하지 않는다 — 위아래 여백 토큰 + 글 자리 최소 높이가 만든다." 코드의 `ROW_W=360` + `primaryAxisSizingMode="FIXED"` 는 이 선언과 모순되지 않는다(인스턴스는 목록이 늘린다).
- `minTextHeight`(:103) 선언은 코드 값 48/24 와 일치한다. 다만 그 문장의 근거("Compact 24 — 화살표와 같게")가 §2-6 의 결함을 그대로 물려받았다 — 코드를 고치면 이 문장도 같이 고쳐야 한다.

## 2-8. **새로 발견** — Gate 9e(component-facts) 가 지금 빨간불 — ❌ **FAIL (a)**

```
$ npm run components:facts     → exit 1
  ❌ component-facts.json 이 정본(build-components.ts)과 어긋남 — 손편집이거나 재생성 누락.
```

재생성본과 커밋 상태를 대조한 차이(검증자가 임시 생성 후 원상복구):

| 필드 | 파일 | 재생성 |
|---|---|---|
| `_meta.sourceHash` | `f48a98cf427d` | `3431b062f206` |
| `List Row.tokenBindings` | — | `+color/control/bg/selected` · `+color/control/indicator/disabled` · `+color/control/indicator/selected` |

즉 **커밋된 facts 는 이번 수정 이전 소스로 만든 것**이라 Gate 9e 가 커밋을 막는다(`scripts/gate-check.js:399-406`). `npm run components:facts:write` 재생성이 필요하다.

- 🟡 다만 재생성하면 **Toggle 폴백 도형의 토큰 3개가 List Row 의 토큰으로 정본 facts 에 박힌다**(mock 에서는 §2-4 때문에 Toggle 인스턴스 경로를 못 타므로). 계약 `list-row.json` 의 `tokens` 에는 `control/*` 가 없어 선언과 생성물이 어긋난다. §2-4 를 `BUILT_COMPS` 등록으로 고치면 이 부작용도 같이 사라진다 — **facts 재생성보다 §2-4 수정이 먼저**다.
- 🟡 `scripts/gen-component-facts.js:63` 에 `minHeight` 를 GEOMETRY_PROPS 로 추가했지만, `geometryProfiles` 는 `target:"root"` 만 기록해 **정작 `text` 자식의 minHeight 는 facts 에 남지 않는다**(생성물 확인). 의도한 기록이라면 목적을 달성하지 못했다.

---

## 2차 항목별 판정 요약

| # | 항목 | 1차 | 2차 |
|---|---|---|---|
| 1 | resize 순서 (선례 3204-3206 과 동일) | ❌ (a) | ✅ **PASS** (🟡 주석 줄번호 3174-3176 은 이제 반대 순서 코드를 가리킴) |
| 2 | `tokens.line` 선언↔코드 | ❌ (a) | ✅ **PASS** |
| 3 | reuseVariant 조각 배열 | 🟡 | ✅ **PASS** |
| 4 | `BUILT_SETS["Toggle"]` 등록 | 🟡 | ❌ **FAIL (a)** — `components:anatomy` 에서 List Row 가 throw 로 통째 누락(게이트는 초록). 선례는 `BUILT_COMPS` 변형 등록 |
| 5 | reuse 실패 폴백 도형 = 정본 치수·토큰 | 🟡 | ✅ **PASS** |
| 6 | `minHeight` 48/24 | (신규) | ❌ **FAIL (a)** — Compact 의 최대 부품은 썸네일 48 이라 Thumb/Compact 4칸이 72 vs 48 로 갈린다 (②충돌 없음·①Default 만 옳음) |
| 7 | 계약 보강 (slotMap·slotMapNote·minTextHeight·geometry) | ❓ (c) 2건 | ✅ **PASS** — (c-1)(c-2) 모두 해소, slotMap 코드와 7/7 일치, 18장 근거 실재 |
| 8 | Gate 9e component-facts | (신규) | ❌ **FAIL (a)** — 재생성 누락, 지금 exit 1 |
| 0 | 결정론 게이트 | 4/4 ✅ | installer:check·keycheck·iconpolicy ✅ / anatomy 는 exit 0 이나 List Row 생성 실패 / **facts exit 1** |

- ❌(a): **3건**(§2-4 · §2-6 · §2-8) · ❓(c): 0건 · 🟡(b): 4건 · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 1차 §1 축·§3 토큰 경유·§5 무변경
- 미검증: **Figma 실물 캔버스 렌더**(MCP 연결 불가) — §2-6 의 행 높이는 코드 도출값이며 육안·실측 미확인

## 2차 한 줄 판정

**fail**

---
---

# 4-verification (정본) — **3차 재검증** (델타)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-21
- 입력: 2차 보고서(위) + 2차 이후 변경분(`build-components.ts` · `registry/components/list-row.json`)
- 범위: **델타 재검증** — 2차 ❌ 3건 + 🟡 주석 + 계약 갱신분만.
  - **이번에 재확인하지 않음(승계):** 1차 §1 축 56칸·§3 토큰 경유·§5 무변경 / 2차 §2-1 resize 순서·§2-2 `tokens.line`·§2-3 조각 배열·§2-5 폴백 도형·§2-7 slotMap↔코드 7/7. 근거: 해당 코드가 델타에 없고 검사 규칙도 강화되지 않았다.
- 한계: **Figma 실물 캔버스 렌더 여전히 미검증**(figma-local ConnectionRefused). 아래 높이는 구조 프로브 실측값 + 결정론적 도출.

## 3-0. 결정론 게이트 — **5/5 초록**

| 게이트 | 결과 |
|---|---|
| `npm run installer:check` | ✅ exit 0 |
| `npm run components:keycheck` | ✅ exit 0 · 누락 0 (`sizing/24` 포함) |
| `npm run components:anatomy` | ✅ exit 0 · **`생성 실패` 0건** — List Row 가 검사 대상으로 복귀 |
| `npm run components:iconpolicy` | ✅ exit 0 |
| `npm run components:facts` (**Gate 9e**) | ✅ exit 0 · 정본 일치 |

## 3-1. ① Toggle 변형 등록 — ✅ **PASS** (2차 ❌ 해소) · 캐시키 일치 확인

```ts
// build-components.ts:1220-1222
// List Row 등이 reuseVariant 로 집어 쓴다 — 선례 buildCheckbox 와 같이 **변형**을 등록한다
//   (세트를 BUILT_SETS 에 넣으면 재사용 경로가 set.children 을 훑다가 하네스에서 깨진다).
cells.forEach(({ comp, row, col }) => { BUILT_COMPS[`Toggle:${press[col]}:${sts[row]}`] = comp; });
```

- `BUILT_SETS["Toggle"]` 줄은 사라졌다(`grep` 0건).
- **캐시키 대조 — 맞다.** `press = ["Off","On"]`(1188) · `sts = ["Default","Disabled"]`(1189), `cells.push({comp,row,col})` 에서 **row=상태 인덱스 · col=Pressed 인덱스**(1193-1195, 1215)이므로 생성되는 키는 `Toggle:Off:Default` · `Toggle:On:Default` · `Toggle:Off:Disabled` · `Toggle:On:Disabled` 4개. `buildListRow:1355` 의 캐시키 `` `Toggle:On:${tgState}` ``(tgState ∈ Default·Disabled)와 **정확히 일치**하고, 축이 뒤바뀐 곳도 없다(키 순서 `<Pressed>:<State>` 가 `comp.name = \`Pressed=${p}, State=${st}\`` 와 같은 순서).
- **실측(구조 프로브, 56칸 전수):** `toggle INSTANCE=8 · fallbackFRAME=0` / `control INSTANCE=16 · fallbackFRAME=0`. 두 mock(`components:anatomy` · `components:facts`) 모두에서 **폴백 warn 0건**. 2차에서 throw 로 통째 누락되던 것이 인스턴스 경로로 복귀했다.

## 3-2. ② 밀도 따라가는 썸네일 — ✅ **PASS** (2차 ❌ 해소)

```ts
// build-components.ts:1307-1313
const thumbPx = d.name === "Default" ? 48 : 24;
box.resize(thumbPx, thumbPx);
box.setBoundVariable("width",  numv(`sizing/${thumbPx}`));
box.setBoundVariable("height", numv(`sizing/${thumbPx}`));
```

- **`sizing/24` 는 정본에 실재한다** — `plugins/figma-vars-installer/src/vars-data.ts:380` `"sizing/24": 24`. `components:keycheck` 누락 0 으로도 확인. 새 값을 만들지 않았다.
- **구조 프로브 실측(56칸):** `Thumb/Default → thumbnail 48x48` ×4 · `Thumb/Compact → thumbnail 24x24` ×4 · `text.minHeight` = Default **48** ×28 · Compact **24** ×28.
- **행 높이 재계산** (`padY×2 + max(자식 높이)`, 글 내용 높이는 `title/16M` 20.8 · `body/14R` 18.2 로 둘 다 minHeight 미만):

| 밀도 | 자식 최대 | 행 높이 | 칸 수 |
|---|---|---|---|
| Default (padY 16) | text 48 = thumb 48 > trail 24 > control 18 | **80** | 28칸 전부 동일 ✅ |
| Compact (padY 12) | text 24 = thumb 24 = trail(화살표) 24 > toggle 20 > control 18 | **48** | 28칸 전부 동일 ✅ |

2차에서 72 로 튀던 **Thumb/Compact 4칸이 48 로 합류**했다. "같은 목록 = 같은 높이"가 56칸 전부에서 성립한다.
⚠️ mock 은 레이아웃을 계산하지 않으므로 위 높이는 **실측 부품 크기에서 결정론적으로 도출한 값**이다 — Figma 실물 확인은 여전히 남아 있다.

## 3-3. ③ component-facts 재생성 — ✅ **PASS** (2차 ❌ 해소) · 폴백 토큰 오염 없음

- `npm run components:facts` exit 0 · `_meta.sourceHash` = `7868c57dc1e9` 로 현재 소스와 일치.
- **폴백 토큰이 잘못 박히지 않았다.** `List Row.tokenBindings` 의 `color/control/*` 7개는 **폴백 도형이 아니라 실제 인스턴스에서 온 것**이다 — 근거 ①두 mock 모두 폴백 warn 0건 ②프로브에서 `fallbackFRAME=0` ③mock 의 `createInstance` 가 원본 상태를 복제하므로 Checkbox·Toggle 인스턴스가 자기 토큰을 그대로 들고 온다. 값도 정본과 일치한다(`control/bg/default·disabled·selected` · `border/default·disabled` · `indicator/selected·disabled` — 전부 `buildCheckbox` states / `buildToggle` trackKey·knobKey 그대로, Off 전용 `indicator/unselected` 는 List Row 가 On 만 쓰므로 없는 것이 맞다).
- `List Row.geometry` 2개(Density 별 root) · `anatomy` = `["control","text","thumbnail","trail"]` — 코드와 일치.

## 3-4. ④ 주석의 선례 인용 — 🟡 **여전히 어긋난다(줄번호 → 함수명으로 바꿨지만 함수가 틀렸다)**

```ts
// build-components.ts:1276
//    나중에 부르면 양 축이 FIXED 로 덮여 높이가 1px 로 굳는다(선례 buildDropdown 의 패널 생성부와 같은 순서).
```

`buildDropdown`(`:2324`)의 패널 생성부는 **정반대 순서**다 — `:2347-2348` 에서 `primaryAxisSizingMode="AUTO"` · `counterAxisSizingMode="FIXED"` 를 먼저 걸고, `:2358` 에서 `comp.resize(DD_MIN_W, 4 * sz.h + 8)` 을 나중에 부른다.
`resize 후 sizing 모드 설정` 이라는 이유를 명시한 **진짜 선례는 `buildTimePickerDropdown` 의 `fillPanel`**(`:3204-3206`)이다. 줄 번호 대신 함수명으로 바꾼 취지는 옳지만 가리키는 대상이 틀려서, 이 주석을 믿고 `buildDropdown` 을 열어 본 사람은 반대 순서를 선례로 베끼게 된다. (수정은 구현자 소관 — "buildTimePickerDropdown 의 fillPanel" 로 바꾸면 된다.)

> 참고(판정 아님): 저장소에는 두 순서가 **둘 다 출하 코드로 공존**한다(`buildDropdown`·`makeCol` = 모드→resize / `fillPanel` = resize→모드). buildListRow 는 이유가 문서화된 쪽(`fillPanel`)을 따랐으므로 2차 PASS 를 유지하되, 실제 Figma 런타임에서 어느 쪽이 맞는지는 **MCP 연결 불가로 이번에도 확인하지 못했다.**

## 3-5. 계약 갱신 — ❌ **FAIL (a)** 1건 (선언이 자기 자신과 어긋난다)

갱신된 것은 맞고 코드와도 맞는다:

| 필드 | 값 | 코드 대조 |
|---|---|---|
| `variantAxis.slotMap.thumb.left` | "그림 — Default 48 · Compact 24" | ✅ `:1307` |
| `variantAxis.minTextHeight` | "… Default 48 · Compact 24 … 왼쪽 그림도 같은 크기로 따라간다." | ✅ `:1322` + `:1307` |
| `tokens.sizing` | `["sizing/48","sizing/24"]` | ✅ 둘 다 정본 실재·사용됨 |

그러나 **같은 파일의 `anatomy[0]` 이 갱신되지 않았다:**

```json
// registry/components/list-row.json:26  (anatomy 왼쪽 칸)
"role": "비움 · 체크 코어 인스턴스 · 그림(썸네일 48)."
```

- 같은 계약의 `slotMap.thumb`("Default 48 · Compact 24")와 **자기 모순**이고,
- Thumb/Compact 4칸의 실제 썸네일 24 와도 다르다(프로브 실측).

1차 §6 에서 `tokens.line` 을 같은 이유(선언이 자기 자신·코드와 어긋남)로 ❌(a) 로 잡았으므로 같은 잣대를 적용한다. **한 줄 문서 수정**이면 끝나는 건이다. (수정은 구현자 소관.)
- 🟡 함께 볼 것: `variantAxis.sizeAxis`(:72) "높이는 여백 토큰(Default 위아래 16 · Compact 위아래 12)과 **글 자리**가 정한다" 는 minHeight 도입 전 문장이라 지금은 절반만 맞다 — `geometry.height` 쪽은 "글 자리 **최소 높이**"로 갱신돼 있어 두 문장의 정밀도가 다르다.

---

## 3차 항목별 판정 요약

| # | 항목 | 2차 | 3차 |
|---|---|---|---|
| ① | Toggle 변형 등록 · 캐시키 정합 | ❌ (a) | ✅ **PASS** — 키 4개 생성·`Toggle:On:<State>` 정확히 일치 · 인스턴스 8/8·16/16 실측 |
| ② | 밀도 따라가는 썸네일 (48/24) | ❌ (a) | ✅ **PASS** — `sizing/24` 정본 실재 · Default 28칸 80 · Compact 28칸 48 |
| ③ | component-facts 재생성 | ❌ (a) | ✅ **PASS** — Gate 9e 초록 · 폴백 토큰 오염 0 |
| ④ | 선례 주석 인용 | 🟡 | 🟡 **미해소** — `buildDropdown` 은 반대 순서, 진짜 선례는 `buildTimePickerDropdown`/`fillPanel` |
| ⑤ | 계약 갱신 (slotMap·minTextHeight·tokens) | — | ❌ **FAIL (a)** — `anatomy[0]` "썸네일 48" 만 미갱신(자기 모순) · 🟡 `sizeAxis` 문장 반쪽 |
| 0 | 결정론 게이트 | 1건 exit 1 · 1건 침묵 실패 | ✅ **5/5 초록** |

- ❌(a): **1건**(⑤, 계약 한 줄) · ❓(c): 0건 · 🟡(b): 2건(④ 주석 · ⑤ sizeAxis 문장) · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 1차 §1·§3·§5 · 2차 §2-1·§2-2·§2-3·§2-5·§2-7
- 미검증: **Figma 실물 캔버스 렌더**(MCP 연결 불가) — 행 높이 80/48 은 프로브 실측 부품 크기에서 도출한 값

## 3차 한 줄 판정

**fail** (남은 것은 `registry/components/list-row.json` anatomy 한 줄 — 코드 쪽 ❌ 는 0건)

---
---

# 4-verification (정본) — **4차 재검증** (문구 델타)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-21
- 범위: 3차 ❌ 1건 + 🟡 2건만. **이번에 재확인하지 않음(승계):** 1~3차의 모든 PASS 항목(축·토큰 경유·resize 순서·폴백 도형·Toggle 캐시키·썸네일 48/24·행 높이·facts 내용). 근거: 코드 델타가 **주석 한 줄뿐**이고 계약은 문구만 바뀌었다.

## 4-1. anatomy 왼쪽 칸 — ✅ **PASS** (3차 ❌ 해소)

`registry/components/list-row.json` anatomy[0] = **"비움 · 체크 코어 인스턴스 · 그림(밀도를 따라간다 — Default 48 · Compact 24)."**
같은 파일 `slotMap.thumb.left`("그림 — Default 48 · Compact 24") · `minTextHeight` · `tokens.sizing`(`sizing/48`·`sizing/24`) 와 **자기 모순 없음**, 코드 `build-components.ts:1307` `const thumbPx = d.name === "Default" ? 48 : 24;` 및 3차 프로브 실측(48×48 ×4 · 24×24 ×4) 과 **일치**.

## 4-2. sizeAxis ↔ geometry.height — ✅ **PASS** (3차 🟡 해소)

- `sizeAxis` = "없음 — 높이는 위아래 여백 토큰(Default 16 · Compact 12)과 글 자리 최소 높이(Default 48 · Compact 24)가 정한다. 같은 밀도끼리는 일곱 유형 모두 같은 높이다(Default 80 · Compact 48)."
- `geometry.height` = "숫자로 고정하지 않는다 — 위아래 여백 토큰 + 글 자리 최소 높이가 만든다."

**어긋나지 않는다.** 두 문장이 같은 산출 규칙(여백 토큰 + 글 자리 최소 높이)을 말하고, sizeAxis 는 그 **결과값**(80/48)을 덧붙였을 뿐 높이를 고정 수치로 선언하지 않는다. 80/48 은 3차 프로브 도출값 및 오케스트레이터의 배포본 http 전수 렌더(default 7유형 80.0 · compact 7유형 48.0, 밝은/어두운 화면 각 56칸)와 일치한다.
> 렌더 실측은 **웹 배포본**이고 Figma 캔버스가 아니다 — Figma 실물 확인은 여전히 남아 있다(MCP 연결 불가).

## 4-3. 선례 주석 — ✅ **PASS** (3차 🟡 해소)

`build-components.ts:1276` → "(선례 buildTimePickerDropdown 의 fillPanel)". `fillPanel` 은 `:3201` 에 실재하고(`buildTimePickerDropdown` `:3171` 내부), `:3209-3211` 이 `node.resize(panelW, 100); // 폭 고정 (resize 후 sizing 모드 설정)` → 모드 설정 순서다. 줄이 밀려도 어긋나지 않는 인용이고, 가리키는 코드의 순서도 맞다.

## 4-4. ⚠️ 커밋 전 **필수 조치 1건** — Gate 9e 가 지금 빨간불

주석 한 줄을 고치면서 소스 해시가 바뀌어 `npm run components:facts` 가 다시 **exit 1** 이다.
재생성본과 현재 파일을 대조한 결과 **차이는 `_meta.sourceHash`(`7868c57dc1e9` → `8f3b89798b51`) 단 한 줄뿐이고, 컴포넌트 데이터는 0 diff** 다(검증자가 임시 생성 후 원상복구해 확인). 즉 검증 대상의 결함이 아니라 파생 표면의 도장 갱신 누락이다.

**→ 커밋 전 `npm run components:facts:write` 1회.** 하지 않으면 pre-commit 훅(Gate 9e)이 커밋을 막는다.

| 게이트 | 결과 |
|---|---|
| `installer:check` · `keycheck` · `anatomy`(생성 실패 0) · `iconpolicy` | ✅ exit 0 |
| `components:facts` (Gate 9e) | ❌ exit 1 — sourceHash 갱신만 필요 |

---

## 최종 판정 요약 (1~4차)

| 항목 | 최종 |
|---|---|
| 축 56칸 · 이름 표기 | ✅ PASS (1차) |
| resize 순서 · 선례 인용 | ✅ PASS (2·4차) |
| 토큰 경유 (하드코딩 hex 0) | ✅ PASS (1차) |
| 코어 재사용 — Toggle 변형 등록·캐시키·인스턴스 8/8·16/16 | ✅ PASS (3차) |
| reuse 실패 폴백 도형 = 정본 치수·토큰 | ✅ PASS (2차) |
| 높이 — minHeight 48/24 · 썸네일 48/24 · 밀도별 균일(80/48) | ✅ PASS (3차) |
| 계약 ↔ 코드 (tokens·slotMap·anatomy·sizeAxis·geometry·minTextHeight) | ✅ PASS (4차) |
| 기존 코드 무변경 | ✅ PASS (1차) |
| 결정론 게이트 | ✅ 4/5 · facts 는 sourceHash 재생성 필요(§4-4) |

- ❌(a): **0건** · ❓(c): 0건 · 🟡(b): 0건 · BLOCKED: 0건
- 미검증(정직 표기): **Figma 실물 캔버스 렌더** — MCP(figma-local ConnectionRefused · figma 미인증)로 4차 내내 불가. 행 높이 80/48 은 ①구조 프로브 실측 부품 크기에서 도출 ②웹 배포본 http 렌더로 교차 확인했으나, **Figma 캔버스에서 직접 본 것은 아니다.**

## 최종 한 줄 판정

**pass** (전제: 커밋 전 `npm run components:facts:write` 1회 — §4-4)
