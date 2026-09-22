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

---
---

# 4-verification (정본) — **5차 재검증** (축 축소 + 수치 전면 재정렬)

- 검증자: 🤖 component-verifier (시나리오 D — 설치기 생성기 구조 변경) · 일자: 2026-09-21
- 대상: `plugins/figma-vars-installer/src/build-components.ts` `buildListRow`(1245-1405) · `registry/components/list-row.json`
- 범위: **전수 재검증**(승계 없음). 근거 — 축이 3개→2개로 줄고(56칸→28칸) 수치가 전부 갈렸다. §검증 입력 계약 ②의 승계 금지 조건 (i)「정본 지문이 달라졌다」에 해당한다.
- 판정 근거: 코드 정독 + `buildBottomSheetOption` 원문 대조 + git diff 헝크 전수 + 결정론 게이트 5종 실행 + **구조 프로브 실측(28칸 전수)**
- 한계: **Figma 실물 캔버스 렌더는 5차에도 미검증**(figma-local ConnectionRefused · figma MCP 미인증). 행 높이 68 은 프로브 실측 부품 크기에서 결정론적으로 도출한 값이다.
- ⚠️ **절차 이탈 1건(검증 대상의 결함 아님):** 이번 spawn 에는 §검증 입력 계약 ①이 요구하는 **기계검사 표가 첨부되지 않았다.** 원칙대로면 HOLD 반환이지만 1~4차 내내 검증자가 직접 돌려 온 관행을 이어 이번에도 검증자가 5종을 실행했다. 다음 회차부터는 호출자가 표를 붙여 주기 바란다.

## 5-0. 결정론 게이트 — **5/5 초록**

| 게이트 | 결과 |
|---|---|
| `npm run installer:check` (tsc --noEmit) | ✅ exit 0 |
| `npm run components:keycheck` | ✅ exit 0 · 누락 0 (color 167/184 · number 16/79) |
| `npm run components:anatomy` | ✅ exit 0 · **`생성 실패` 0건** (grep 확인) |
| `npm run components:iconpolicy` | ✅ exit 0 · 위반 0 |
| `npm run components:facts` (**Gate 9e**) | ✅ exit 0 · 정본 일치 |

## 5-0-1. 구조 프로브 실측 (28칸 전수)

```
variants: 28          ← Density 축 소멸 확인 (56 → 28)
Type=Nav,    State=×4  :: FRAME:text(min44)[TEXT TEXT] | FRAME:trail[FRAME:chevron]
Type=Value,  State=×4  :: FRAME:text(min44)[TEXT TEXT] | FRAME:trail[TEXT FRAME:chevron]
Type=Read,   State=×4  :: FRAME:text(min44)[TEXT TEXT]
Type=Pick,   State=×4  :: INSTANCE:control(18x18) | FRAME:text(min44)[TEXT TEXT]
Type=Agree,  State=×4  :: INSTANCE:control(18x18) | FRAME:text(min44)[TEXT TEXT] | FRAME:trail[FRAME:chevron]
Type=Switch, State=×4  :: FRAME:text(min44)[TEXT TEXT] | FRAME:trail[INSTANCE:toggle(40x20)]
Type=Thumb,  State=×4  :: FRAME:thumbnail(40x40) | FRAME:text(min44)[TEXT TEXT]

root  bound: {paddingLeft:spacing/20, paddingRight:spacing/20, paddingTop:spacing/12,
              paddingBottom:spacing/12, itemSpacing:spacing/12}
text  bound: {itemSpacing:spacing/2}          props: {minHeight:"44"}   ← ★ 바인딩 아님(원시 숫자)
thumb bound: {width:sizing/40, height:sizing/40, *Radius:radius/4}
control INSTANCE 8/8 · toggle INSTANCE 4/4 · 폴백 warn 0건
```

---

## ① 근거가 실제로 맞나 — ✅ **PASS** (6/6 실재)

`buildBottomSheetOption`(`build-components.ts:5439-5578`) 원문과 한 줄씩 대조했다.

| 자리 | 코드 | 주장 근거 | 선례 원문 | 판정 |
|---|---|---|---|---|
| 좌우 여백 20 / 20 | `:1279-1280` `spacing/20` ×2 | buildBottomSheetOption | `:5456` `paddingLeft=20; paddingRight=20`(선택행) · `:5541` 동일(List 행) | ✅ |
| 위아래 여백 12 | `:1281-1282` `spacing/12` ×2 | 같은 곳 List 행 | `:5541` `paddingTop = 12; paddingBottom = 12` | ✅ |
| 왼쪽 요소↔글 12 | `:1283` `itemSpacing spacing/12` | 같은 곳 `left.itemSpacing` | `:5520` `left.itemSpacing = 12` | ✅ |
| 제목↔설명 2 | `:1330` `spacing/2` | 같은 곳 `col.itemSpacing` | `:5524` `col.itemSpacing = 2` | ✅ |
| 오른쪽 칸 내부 8 | `:1350` `spacing/8` | 같은 곳 **선택행** itemSpacing | `:5457` `comp.itemSpacing = 8` | ✅ |
| 그림 40 | `:1311-1314` `sizing/40` | 같은 곳 아바타 40 | `:5512` `av.resize(40, 40)` | ✅ |
| 화살표 24 | `:1375` `makeIconInstance(..., 24, ...)` | 같은 곳 chevron 24 | `:5548` `makeIconInstance("chevron", …, 24, CHEVRON_RIGHT_SVG)` | ✅ |

**틀린 근거는 없다.** 주석 `:1253` 이 여섯 값을 통째로 "List 행"에 귀속시킨 표기는 엄밀히는 절반만 맞지만(오른쪽 칸 8 은 **선택행**), 바로 그 자리의 주석 `:1349` 가 "선례 buildBottomSheetOption **선택행**의 itemSpacing 8" 로 정확히 적어 두었으므로 오도하지 않는다.

- 🟡 참고(판정 아님): 선례 List 행은 `primaryAxisAlignItems="SPACE_BETWEEN"`(`:5539`)으로 좌우를 벌리고 itemSpacing 을 쓰지 않는다. `buildListRow` 는 root `itemSpacing spacing/12` + `text.layoutGrow=1` 로 같은 결과를 만드는데, 이 경우 **글↔오른쪽 칸 간격도 12** 가 된다(선례에는 대응하는 값이 없다). 같은 토큰을 재사용한 것이라 "마음대로 정한 값"은 아니지만, 계약 `geometry.provenance` 는 12 를 "왼쪽 요소↔글"로만 적어 두어 절반만 설명한다.

## ② 남은 '마음대로 정한 값' — ❌ **FAIL (a) 2건**

### ❌ (a-1) `text.minHeight = 44` 가 **토큰 바인딩이 아니라 원시 숫자**다

```ts
// build-components.ts:1331-1332
// 글 자리 최소 44 — 제목만 있는 줄도 설명이 붙은 줄과 같은 높이로 선다(sizing/44).
text.minHeight = 44;
```

- 주석은 `(sizing/44)`, 계약 `minTextHeight`·`tokens.sizing` 도 `sizing/44` 라고 선언한다. **그러나 코드는 변수를 걸지 않는다.**
- 같은 함수의 바로 위가 **올바른 방식의 본보기**다 — `:1312-1314` `box.setBoundVariable("width", numv("sizing/40"))`. 같은 부품 안에서 한 자리는 바인딩, 한 자리는 원시 숫자다.
- **기계 증거:** `component-facts.json` 의 `List Row.tokenBindings` 에 `sizing/40` 은 있고 **`sizing/44` 는 없다**(빌더 실행 산출물). 프로브 실측도 `text` 의 `boundVariables` 가 `{itemSpacing: spacing/2}` 뿐이고 `minHeight` 는 `props` 쪽 `"44"` 다.
- **웹 배포본은 이미 토큰으로 간다** — `ui-library/src/components/list-row/list-row.css:94` `min-height: var(--sizing-44);`. 즉 **정본만 토큰을 안 타고, 파생이 더 옳게 돼 있다.**
- `sizing/44` 는 `vars-data.ts:381` 에 실재하므로 신설이 필요 없다. (수정은 구현자 소관 — `setBoundVariable("minHeight", numv("sizing/44"))`. mock 이 이 필드를 못 받으면 `sizing/40` 처럼 원시 세팅 후 바인딩하는 같은 패턴을 쓰면 된다.)

### ❌ (a-2) 화살표 폴백 SVG 의 `stroke-width="1.4"` — 정본 상수는 `1.5`

```ts
// build-components.ts:1248-1249
const chevRight = (c: string) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="${c}" stroke-width="1.4" …/></svg>`;
```

- 저장소에 **같은 크기(24)·같은 path(`M9 6L15 12L9 18`) 의 정본 상수가 이미 있다** — `build-components.ts:5398` `CHEVRON_RIGHT_SVG` … `stroke-width="1.5"`. 선례 `buildBottomSheetOption`(`:5548`)은 그 상수를 그대로 쓴다.
- `1.4` 는 `:2039-2040` `chevDown`/`chevUp` 에 선례가 있지만 그쪽은 **16×16** 이다. 24 짜리 오른쪽 화살표를 1.4 로 그린 곳은 여기뿐이다.
- 아이콘/이미지 원본은 CLAUDE.md §정확 대조 항목(두갈래 적용 금지·항상 엄격)이므로 ❌(a) 로 둔다. 다만 **영향 범위는 아이콘 라이브러리 import 실패 폴백 경로뿐**이고(정상 경로는 `makeIconInstance` 가 라이브러리 인스턴스를 붙이고 `rebindIconColor` 로 색을 다시 건다), `components:iconpolicy` 는 초록이다. **이 델타에서 새로 들어온 줄은 아니며 1~4차에서도 지적되지 않았다** — 이번에 "모든 숫자를 훑으라"는 지시로 처음 걸렸다. 고치는 방법은 `CHEVRON_RIGHT_SVG` 재사용 한 줄이다.

### 나머지 숫자 — 전수 훑기 결과 설명됨

| 숫자 | 자리 | 설명 |
|---|---|---|
| `ROW_W = 360` | `:1246` | 선례 `buildBottomSheetOption:5440` `const ROW_W = 360` 동일. 계약 `geometry.width` 가 "캔버스 편의상 360" 으로 선언 ✅ |
| `resize(ROW_W, 1)` 의 `1` | `:1272` | 직후 `counterAxisSizingMode="AUTO"` 가 덮는 자리표시자. 선례 `fillPanel:3209` 의 `100` 과 같은 용법 ✅ |
| 18 · `cornerRadius 2` · `strokeWeight 1` | `:1300-1303` | Checkbox **폴백** 도형 — `buildCheckbox:1090-1097` 과 동일(2차 PASS 유지, 실측에서 폴백 0회) ✅ |
| 40×20 · `radius 10` · 노브 16 · `x=22,y=2` | `:1366-1372` | Toggle **폴백** 도형 — `buildToggle:1205-1212` 와 동일 ✅ |
| 16 / 14 (글자 크기) | `:1333-1334`·`:1353` | `title/16M`·`body/14R` 텍스트 스타일 인자와 짝 ✅ |
| `cellW 380 · cellH 88 · rowLabelW 96` | `:1398` | **부품이 아니라 스펙 진열판** 수치. `cellW 380` 은 선례 `buildBottomSheetOption:5573` 과 동일, `cellH 88` 은 행 높이 68 + 여유. 🟡 유일하게 선례 없는 진열 수치지만 컴포넌트 산출물에 들어가지 않는다 |

## ③ 토큰 레벨 매칭 — ⚠️ **부분 PASS** (색·여백·반경·타이포 ✅ / 크기 1건 ❌ = ②-a-1)

| 갈래 | 실측 | 판정 |
|---|---|---|
| 색 | 배경(`:1284`)·썸네일(`:1315`)·글자(`:1333-1334`,`:1353`)·아이콘(`:1375`)·폴백 도형 전부 `boundPaint(scv(maps, …))`. **하드코딩 hex 0건**(`chevRight("#000")` 은 폴백 SVG 인자이며 `rebindIconColor` 로 즉시 재바인딩 — iconpolicy 초록) | ✅ |
| 여백 | `spacing/20`·`spacing/12`·`spacing/8`·`spacing/2` — 전부 `setBoundVariable` (프로브 실측) | ✅ |
| 반경 | `radius/4` — `bindRadius`(`:1316`) | ✅ |
| 크기 | `sizing/40` ✅ 바인딩 / **`sizing/44` ❌ 미바인딩**(원시 44) / `sizing/24` 는 코드에서 사라짐 | ❌ |
| 텍스트 스타일 | `title/16M`·`body/14R` — `textstyles-data.ts:48,60` 실재 | ✅ |
| 토큰 실재 | `spacing/2`(:321)·`spacing/8`(:324)·`spacing/12`(:326)·`spacing/20`(:329)·`radius/4`(:346)·`sizing/40`·`sizing/44`(:381) 전부 `vars-data.ts` 실재 · `keycheck` 누락 0 | ✅ |

## ④ 구조 매칭 (registry ↔ 코드) — ❌ **FAIL (a) 1건**

일치하는 것(전부 대조 완료):

| 계약 필드 | 값 | 코드/실측 |
|---|---|---|
| `variantAxis.property` | `["Type","State"]` | `comp.name = \`Type=${t}, State=${st}\``(`:1270`) ✅ · 프로브 28칸 ✅ |
| `variantAxis.values` | Type 7 · State 4 · `absentCombinations: []` | 7×4=28 실측 ✅ |
| `slotMap` 7유형 | nav/value=화살표24 · read=없음 · pick=체크18 · agree=체크18+화살표24 · switch=토글40×20 · thumb=그림40 | 프로브 트리와 **7/7 일치** ✅ (체크 18 = `buildCheckbox:1090`, 토글 40×20 = `buildToggle:1201`) |
| `anatomy` | 왼쪽 칸(체크18·그림40) · 가운데 글(최소 44) · 오른쪽 칸 | facts `anatomy = ["control","text","thumbnail","trail"]` ✅ |
| `tokens.spacing` | `20·12·8·2` | facts `tokenBindings` 의 spacing 과 **정확히 4/4 일치** ✅ |
| `tokens.radius` / `typography` | `radius/4` / `title/16M`·`body/14R` | ✅ |
| `geometry.height` · `sizeAxis` | "12 + 44 = 68, 일곱 유형 같다" | ⑤ 도출값과 일치 ✅ |
| `webDistribution.note` | "28칸(7 × 4)" | ✅ |
| **Compact 흔적** | 계약·코드·웹 소스 모두 "Density 축은 없다"는 **정정 기록**만 남고 실제 축·분기·수치는 0건 | ✅ |

### ❌ (a-3) `tokens.sizing` 이 코드와 어긋난다 — Compact 잔재 1건 + 허위 바인딩 1건

```json
// registry/components/list-row.json:142-146
"sizing": ["sizing/44", "sizing/40", "sizing/24"]
```

- **`sizing/24`** — 코드 어디에도 없다(`grep 'sizing/24' build-components.ts` → buildListRow 0건). Compact 썸네일 24 를 걷어내면서 **계약에서만 남은 잔재**다. 유일하게 살아남은 Compact 흔적이다.
- **`sizing/44`** — 선언돼 있으나 코드는 원시 숫자(②-a-1). 계약이 "이 토큰을 쓴다"고 말하는데 빌더 산출물에는 그 바인딩이 없다.
- **기계 증거:** 빌더 실행 산출물 `component-facts.json` 의 `List Row.tokenBindings` 에 크기 토큰은 **`sizing/40` 하나뿐**이다. 선언 3개 : 실측 1개.
- 1차 §6(`tokens.line`)·3차 ⑤(`anatomy` 썸네일 48)와 **같은 잣대**다 — 선언이 코드와 어긋나면 ❌(a).
- 방향(참고): `sizing/24` 는 빼고, `sizing/44` 는 ②-a-1 을 고쳐 실제 바인딩으로 만들면 선언 3→2 로 실측과 맞는다.

## ⑤ 높이 12 + 44 + 12 = 68 — ✅ **PASS** (일곱 유형 전부 성립 · 도출값)

행 높이 = `padY×2 + max(자식 높이)`. 자식 높이는 프로브 실측:

| 자식 | 높이 | 44 이하? |
|---|---|---|
| `text` (min 44, 내용 41 = `title/16M` 16×130% 20.8 + `spacing/2` 2 + `body/14R` 14×130% 18.2) | **44** | = |
| `control` (Checkbox 인스턴스) | 18 | ✅ |
| `toggle` (Toggle 인스턴스) | 20 | ✅ |
| `trail` (hug — 최대 자식 = 화살표 24) | 24 | ✅ |
| `thumbnail` | 40 | ✅ |

→ 모든 유형에서 `max(자식) = 44`(text) 이므로 **12 + 44 + 12 = 68**, 28칸 전부 동일. `counterAxisSizingMode="AUTO"`(`:1274`)로 숫자 고정도 없다. `resize()` → sizing mode 순서도 4차 PASS 그대로 유지(`:1272-1274`, 선례 `buildTimePickerDropdown`/`fillPanel:3209-3211`).
- 교차 확인: 웹 소스 `list-row.css:16-24` 도 `padding: var(--spacing-12) var(--spacing-20)` + `min-height: var(--sizing-44)` 로 같은 68 을 만든다.
- ⚠️ mock 은 레이아웃을 계산하지 않는다 — 68 은 **실측 부품 크기에서 결정론적으로 도출한 값**이며 Figma 캔버스 육안 확인은 아니다.

## ⑥ 기존 코드 훼손 없음 — ✅ **PASS**

`git diff -U0` 헝크 **16개 전부가 `buildListRow` 함수 내부(1246-1405)** 다. 함수 밖 변경 0건.

- 다른 빌더·`COMPONENT_CATEGORIES_GRID`(:7169) · `BUILD_DEPENDENCIES`(:7215) · runners(:7472) 는 **무변경**.
- `BUILT_SETS["List Row"] = set;` 이 이번에 삭제됐다. **소비처 0건**(`grep` 으로 `getBuiltSet("List Row")`·`BUILT_SETS["List Row"]` 전수 확인) → 깨지는 곳 없다. 3차에서 `BUILT_SETS["Toggle"]` 을 뺀 것과 같은 방향(변형 캐시 `BUILT_COMPS` 만 등록)이라 일관적이다.
- `BUILT_COMPS` 키가 `ListRow:<Type>:<Density>:<State>` → `ListRow:<Type>:<State>` 로 바뀌었다. **옛 키 참조처 0건**(`grep 'ListRow:'` → 정의 1곳뿐).
- 결정론 게이트 5/5 초록이 이 무변경을 뒷받침한다(facts 해시 일치 = 다른 컴포넌트 산출물 무변동).

---

## 5차 항목별 판정 요약

| # | 항목 | 판정 |
|---|---|---|
| ① | 근거가 실제로 맞나 (7/7 선례 대조) | ✅ **PASS** — 틀린 근거 0건 (🟡 글↔오른쪽 칸 12 는 계약 설명이 절반) |
| ② | 마음대로 정한 값 | ❌ **FAIL (a) 2건** — `minHeight=44` 원시 숫자(선언은 sizing/44) · 화살표 폴백 `stroke-width 1.4`(정본 상수는 1.5) |
| ③ | 토큰 레벨 매칭 | ⚠️ 색·여백·반경·타이포 ✅ / 크기 `sizing/44` 미바인딩 ❌(=②-a-1) · 사용 토큰 전부 정본 실재 ✅ |
| ④ | 구조 매칭 (variantAxis·slotMap·anatomy·tokens·geometry) | ❌ **FAIL (a) 1건** — `tokens.sizing` 에 `sizing/24`(미사용 Compact 잔재)·`sizing/44`(미바인딩). 나머지 전 필드 코드와 일치, Compact 흔적 그 한 자리뿐 |
| ⑤ | 높이 68 · 일곱 유형 동일 | ✅ **PASS** (프로브 실측 부품 크기에서 도출 · 웹 배포본과 교차 확인) |
| ⑥ | 기존 코드 훼손 없음 | ✅ **PASS** — 헝크 16개 전부 함수 내부, 삭제된 키 소비처 0건 |
| 0 | 결정론 게이트 | ✅ **5/5 초록** |

- ❌(a): **3건** (②-a-1 · ②-a-2 · ④-a-3) · ❓(c): 0건 · 🟡(b): 3건 · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): **없음** — 지문 변경으로 전수 재검증
- 미검증(정직 표기): **Figma 실물 캔버스 렌더** — MCP 연결 불가로 5차 내내 불가. 행 높이 68 은 도출값이다.
- 절차 이탈: 호출자가 기계검사 표를 첨부하지 않아 검증자가 대행 실행(§5차 머리말)

## 5차 한 줄 판정

**fail** — 셋 다 한 줄짜리 수정이다: `minHeight` 를 `sizing/44` 로 바인딩 · 화살표 폴백을 `CHEVRON_RIGHT_SVG` 로 교체 · 계약 `tokens.sizing` 에서 `sizing/24` 제거. 축 축소(28칸)와 수치 재정렬의 **근거 자체는 전부 실재해 PASS** 다.

---
---

# 4-verification (정본) — **6차 재검증** (5차 ❌ 3건 델타)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-21
- 입력: 5차 보고서 + **호출자 기계검사 표**(§검증 입력 계약 ① 충족 — 이번 회차부터 첨부됨) + 5차 이후 변경분
- 범위: **델타 재검증** — 5차 ❌ 3건 + 그 수정이 닿은 범위만.
  - **이번에 재확인하지 않음(5차 PASS 승계):** ① 근거 7/7 선례 대조 · ⑤ 높이 68 산식 · ⑥ 헝크 범위 원칙. 근거: 해당 코드·수치가 델타에 없고 검사 규칙도 강화되지 않았다. (단 ⑤·⑥은 아래 6-4 에서 **부수 피해 여부만** 다시 봤다.)
- 한계: **Figma 실물 캔버스 렌더는 6차에도 미검증**(figma-local ConnectionRefused · figma MCP 미인증).

## 6-0. 결정론 게이트 — 검증자 재실행 **5/5 exit 0**

호출자 표의 4건을 재실행해 종료코드만 확인(위조 방지)했고, **표에 빠져 있던 `components:iconpolicy` 를 추가로 실행**했다 — 이번 수정이 아이콘 호출부를 건드렸기 때문이다.

| 게이트 | 호출자 표 | 검증자 재실행 |
|---|---|---|
| `installer:check` | ✅ | ✅ exit 0 |
| `components:keycheck` | ✅ | ✅ exit 0 |
| `components:anatomy` | ✅ | ✅ exit 0 · `실패` 0건 |
| `components:facts` (Gate 9e) | ✅ | ✅ exit 0 |
| `components:iconpolicy` | **표에 없음** | ✅ exit 0 · 위반 0 |

## 6-1. ① `minHeight` 토큰 바인딩 — ✅ **PASS** (5차 ❌ 해소)

```ts
// build-components.ts:1329-1330
text.minHeight = 44;
try { text.setBoundVariable("minHeight", numv("sizing/44")); } catch (e) { /* 구버전 API */ }
```

- **구조 프로브 실측:** `text` 노드의 `boundVariables` 가 `{itemSpacing: "spacing/2", minHeight: "sizing/44"}` — 5차에 없던 `minHeight` 바인딩이 실제로 걸린다.
- **기계 증거:** `component-facts.json` `List Row.tokenBindings` 에 **`sizing/44` 가 들어왔다**. 현재 크기 토큰 = `sizing/40` · `sizing/44` 2개로, 계약 `tokens.sizing` 선언과 **2:2 정확히 일치**한다.
- 원시 `text.minHeight = 44` 를 남겨 둔 것은 이중 안전장치다 — 바인딩이 거부돼도 높이 44 는 유지된다.
- 🟡 (판정 아님) `catch` 가 조용하다. 구버전 API 에서 바인딩이 통째로 빠져도 로그가 없다. 다만 **이 경우에도 동작은 5차 이전과 같아 열화가 아니고**, Gate 9e 가 facts 에서 `sizing/44` 소실을 잡아낸다(바인딩이 빠지면 facts 가 달라져 exit 1). 감시 장치가 이미 있으므로 ❌ 로 올리지 않는다.

## 6-2. ② 화살표 폴백 SVG — ✅ **PASS** (5차 ❌ 해소)

```ts
// build-components.ts:1374
// 폴백 SVG 도 정본 상수를 그대로 쓴다(사본을 만들지 않는다 — 선 굵기 같은 값이 갈리지 않게).
trail.appendChild(await makeIconInstance("chevron", scv(maps, iconKey(st)), 24, CHEVRON_RIGHT_SVG, 0, { wrap: false }));
```

- 지역 헬퍼 `chevRight` 가 **완전히 삭제**됐다(`grep 'chevRight'` → 0건). 24 짜리 오른쪽 화살표의 `stroke-width` 갈림(1.4 vs 1.5)이 원인부터 사라졌다.
- 이제 선례 `buildBottomSheetOption:5547` 과 **같은 상수**(`:5397` `CHEVRON_RIGHT_SVG`, `stroke-width 1.5`)를 쓴다. 남은 `1.4` 2건(`:2038-2039`)은 16×16 chevUp/chevDown 으로 이 부품과 무관하다.
- **선언 순서 위험 없음(실증):** `CHEVRON_RIGHT_SVG`(`:5397`)가 사용처(`:1374`)보다 아래에 있지만 `buildListRow` 는 모듈 평가 시점이 아니라 runner 호출 시점에 실행되므로 TDZ 에 걸리지 않는다 — **구조 프로브에서 28칸이 정상 생성되고 chevron 노드가 붙는 것으로 실증**됐다(tsc·iconpolicy 도 초록).
- `makeIconInstance` 의 나머지 인자(크기 24 · 회전 0 · `{wrap:false}`)는 무변경이라 정상 경로(라이브러리 인스턴스 + `rebindIconColor`)도 그대로다. 폴백 warn 0건.

## 6-3. ③ 계약 `tokens.sizing` — ✅ **PASS** (5차 ❌ 해소)

```json
"sizing": ["sizing/44", "sizing/40"],
"_sizingNote": "화살표 24 는 아이콘 인스턴스 크기 인자라 Number 변수 바인딩 대상이 아니다(선례 Bottom Sheet Option 과 같은 방식)."
```

- `sizing/24` 제거 확인 — 계약·코드·facts 어디에도 없다. **Compact 잔재 0건**(계약에 남은 Compact 언급은 `variantAxis.note` 의 "두지 않는다"는 정정 기록뿐이며 축·분기·수치가 아니다).
- 선언 2개 : facts 실측 2개(`sizing/44`·`sizing/40`) **정확히 일치**.
- `_sizingNote` 의 주장도 사실이다 — `:1374` 와 선례 `:5547` 모두 24 를 `makeIconInstance` 의 크기 인자로 넘기고 Variable 을 걸지 않는다. 같은 방식이 맞다.

## 6-4. 부수 피해 — ✅ **없음**

| 확인 대상 | 결과 |
|---|---|
| 헝크 범위 | `git diff -U0` 16개 헝크 **전부 `buildListRow`(1246-1405) 내부**. 함수 밖 변경 0건 |
| 다른 컴포넌트의 facts | `component-facts.json` diff 가 **`_meta.sourceHash` + `List Row` 항목뿐**. 다른 컴포넌트 0줄 변동 |
| 폴백 경로 | Checkbox 18 / Toggle 40×20 폴백 도형 코드 무변경(2차 PASS 유지) · 프로브에서 폴백 warn **0건**, 인스턴스 `control 8/8 · toggle 4/4` |
| 축·구조 | 프로브 28칸 · `Type × State` · anatomy `control/text/thumbnail/trail` — 5차와 동일 |
| 높이 산식 | 자식 최대 높이 무변동(text 44 · thumbnail 40 · trail 24 · control 18 · toggle 20) → **68 유지**. 호출자의 배포본 http 실측(28칸 + 제목만 7칸 전부 68.0)과도 일치 |
| 아이콘 정책 | `iconpolicy` 위반 0 — 상수 교체가 정책을 깨지 않았다 |

---

## 6차 항목별 판정 요약

| # | 5차 | 6차 |
|---|---|---|
| ① `minHeight` 토큰 바인딩 | ❌ (a) | ✅ **PASS** — 프로브 `bound.minHeight = sizing/44` · facts 에 반영 |
| ② 화살표 폴백 SVG 정본 상수 | ❌ (a) | ✅ **PASS** — 지역 사본 삭제, 선 굵기 갈림 소멸 |
| ③ 계약 `tokens.sizing` | ❌ (a) | ✅ **PASS** — `sizing/24` 제거, 선언 2 : 실측 2 |
| 부수 피해 | — | ✅ **없음** |
| 결정론 게이트 | 5/5 | ✅ **5/5 exit 0**(iconpolicy 포함, 검증자 재실행) |

- ❌(a): **0건** · ❓(c): 0건 · 🟡(b): 1건(조용한 catch — Gate 9e 가 감시) · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 5차 ① 근거 7/7 대조 · ⑤ 높이 산식(부수 피해 관점으로만 재확인)
- 미검증(정직 표기): **Figma 실물 캔버스 렌더** — 1~6차 내내 MCP 연결 불가. 행 높이 68 은 ①프로브 실측 부품 크기에서 도출 ②웹 배포본 http 렌더로 교차 확인했으나 Figma 캔버스 육안 확인은 아니다.

## 6차 한 줄 판정 — **최종**

**pass** — Gate 13 검증 기록을 실행해도 된다. 조건 없음(5차의 커밋 전 선행조치도 이미 `components:facts` 초록으로 해소).

---
---

# 4-verification (정본) — **7차 재검증** (Hover 축 제거 델타)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-21
- 입력: 6차 보고서(pass) + **호출자 기계검사 표**(§검증 입력 계약 ① 충족) + 선캡처 렌더(`screens/matrix-pc-light.png`·`matrix-pc-dark.png`) + 6차 이후 변경분(`git diff`)
- 범위: **델타 재검증** — 축 축소(State 4→3)가 닿은 범위 + 호출자 지정 7항목.
  - **이번에 재확인하지 않음(6차 PASS 승계):** `minHeight`→`sizing/44` 바인딩 · 화살표 폴백 `CHEVRON_RIGHT_SVG` · `tokens.sizing` 2:2 정합 · 수치 선례 7/7 대조. 근거: 정본 diff 7줄이 전부 `states`/`bgKey` 두 곳이고 해당 코드의 지문이 동일하며, 검사 규칙도 강화되지 않았다.
- 한계: **Figma 실물 캔버스 렌더는 7차에도 미검증**(figma-local ConnectionRefused · figma MCP 미인증).

## 7-0. 결정론 게이트 — 검증자 재실행

호출자 표 5건을 재실행해 종료코드만 확인했고, **축 축소가 건드리는 게이트 4건을 추가로 실행**했다.

| 게이트 | 호출자 표 | 검증자 재실행 |
|---|---|---|
| `installer:check` / `components:keycheck` / `components:anatomy` / `components:iconpolicy` / `components:facts` | ✅ ×5 | ✅ exit 0 ×5 |
| `ui:build:check` · `ui:contract` · `ui:test:check` | 표에 없음 | ✅ exit 0 ×3 |
| **Gate 34 (정본신설승인)** | 표에 없음 | ⚠️ **경고 1건** — `uistate:list-row.hover` 미축소 (7-4 참조) |
| `gate:check` 전체 | 표에 없음 | ❌ error 1건 = **Gate 13 자신**(이 검증 기록 대기). 그 외 error 0 |

## 7-1. ① Hover 흔적 — ✅ **PASS**

| 표면 | 확인 |
|---|---|
| 정본 `states` | `build-components.ts:1256` `["Default","Pressed","Disabled"]` |
| 정본 `bgKey` | `:1258` 3항 연산자 → Pressed 단일 분기. `Hover` 문자열 분기 0건 |
| 변형 이름 | `:1266` `Type=${t}, State=${st}` — mock 실행 결과 축 `State:["Default","Pressed","Disabled"]` |
| spec 표 | `:1395` `colHeaders: states` — 열이 자동으로 3열. 하드코딩 라벨 없음 |
| 주석 | `:1254-1255` 의 "Hover" 는 **없다는 사실의 설명문**이라 잔재가 아니다 |
| 계약·facts·배포본 | `list-row.json` State 3 · `figma.propertyMap.state` 3 · `component-facts` 축 3 · manifest `states`/`canonicalStateMap`/`nativeStates` 에서 hover·`:hover` 0건 · `list-row.css` `:hover`·`@media (hover:hover)` **0건** · example `data-state="hover"` 0건 · `platform/contract.json` states 3 |

남은 `data-state="hover"` 전수는 **Table 컴포넌트**(다른 부품)뿐이다.

## 7-2. ② 눌림 배경 = `color/bg/level-1` — ✅ **PASS** / `level-2` 완전 소멸 — ❌ **FAIL(a)**

```ts
// build-components.ts:1258
const bgKey = (st: string) => (st === "Pressed" ? "color/bg/level-1" : "color/bg/level-0");
```

- 눌림 배경은 정확히 `color/bg/level-1` 이다 — **PASS**. 배포본도 같다(`list-row.css:53,57` `var(--color-bg-level-1)`, 빌더 실측 `rgb(250,250,250)`).
- **그러나 `color/bg/level-2` 는 이 부품에서 사라지지 않았다.** 썸네일 자리 채움으로 그대로 살아 있다:

```ts
// build-components.ts:1311  (Thumb 유형의 그림 자리)
box.fills = [boundPaint(scv(maps, "color/bg/level-2"))];
```

기계 증거: `component-facts.json` 의 `List Row.tokenBindings` 에 **`color/bg/level-2` 가 그대로 있다**(mock 실행 산출물 = 정본이 실제로 바인딩한다는 뜻). facts diff 도 `sourceHash` + State 축 2줄뿐이라 이 바인딩은 건드려지지 않았다.

**❌(a)-1 — 계약이 정본보다 적게 선언한다.** `registry/components/list-row.json:124-127` 의 `tokens.bg` 가 `["color/bg/level-0","color/bg/level-1"]` 로 줄어 `level-2` 를 뺐다. 상태 배경으로서의 `level-2` 는 사라진 게 맞지만 **부품이 바인딩하는 토큰 목록에서는 빠지면 안 된다**(썸네일이 쓴다). 파생(계약)이 정본을 못 따라간 것이므로 저울질 없이 계약을 고친다(H6).

**❌(a)-2 — 배포본 주석이 사실과 다르다.**

```css
/* ui-library/src/components/list-row/list-row.css:4  (dist/components/list-row.css:4 동일) */
   한 단계(bg/level-1)를 그대로 쓴다. bg/level-2 는 이 부품에서 더는 쓰지 않는다.
```

같은 파일 `:68` 이 `background: var(--color-bg-level-2);` 로 썸네일을 그린다. 배포되는 산출물 안에 **거짓 진술**이 남았다.

## 7-3. ③ 정본·계약·배포본 3자 정합 — ⚠️ 상태·칸수 PASS / 모바일 표기 🟡

| 항목 | 정본 | 계약(registry) | 배포본 |
|---|---|---|---|
| 상태 3종 | ✅ `:1256` | ✅ State 3 · propertyMap 3 | ✅ manifest states 3 · contract states 3 |
| 21칸 | ✅ mock 축 7×3 | ✅ `figma.note` "21칸(7 × 3)" | ✅ css 머리말 "21칸" · 검수 패널 "21칸" |
| 모바일 전용 | ✅ 주석 `:1254` | ✅ `_meta.platform`·`platformSupport{pc:false}` | 🟡 **필드 없음** — `states.pressed` 산문에만 적혔다 |

🟡 배포본 manifest 에 플랫폼 필드가 없는 것은 이 저장소 전반의 관례다(`mobile-header` 도 산문 1줄뿐). 기계가 읽을 자리가 없으므로 ❌ 로 올리지 않고, 필드 신설은 river 결정 사항으로 남긴다.

## 7-4. ④ 축 축소로 생긴 죽은 코드·끊긴 참조 — ⚠️ 코드 PASS / 장부 2건 ❌(a)

- `BUILT_COMPS` 키 `ListRow:<Type>:<State>`(`:1390`) — **형태 무변경**. 외부 참조 0건(`grep 'ListRow:'` → 정의 1곳뿐).
- `BUILT_SETS["List Row"]` 없음(3차에 제거) · `BUILD_DEPENDENCIES`(`:7215`) · `COMPONENT_CATEGORIES_GRID`(`:7169`) · runner(`:7472`) **무변경**.
- `cellAt`·`colHeaders`·`rowLabels` 가 전부 `types`/`states` 배열에서 파생돼 하드코딩 잔재 없음.
- `ui-library/scripts/test.mjs` 의 `componentIds` 에 `list-row` 그대로 등록.

**❌(a)-3 — 이행 장부가 두 축이나 낡았다.**

```
registry/governance/ui-library-migration.json  (List Row 레코드)
  "reverifyTrigger": "정본 buildListRow Type×Density×State 구성·geometry·…"
  "promotionDecision": "… 56칸(Type 7 × Density 2 × State 4) 전부 구현 … Density 는 data-density 를 …"
```

`uiLibraryStatus: "candidate"` 인 **현재 상태 기록**이다(옛 결정의 보존본이 아니다). Density 는 5차에, State 4 는 이번에 사라졌는데 둘 다 반영되지 않아 56칸·2축·`data-density` 사용 규칙이 살아 있는 것처럼 읽힌다.

**❌(a)-4 — Gate 34 가 직접 경고하는 미완 절차.**

```
⚠️  Gate 34: 정본에서 사라진 항목 1건 — 의도한 삭제면 --update-baseline 으로 축소하세요: uistate:list-row.hover
```

`registry/governance/canon-additions-baseline.json` 에 `uistate:list-row.hover`(items:618 · approvals:1376)가 남아 있다. 이 baseline 은 과거 기록이 아니라 **살아 있는 허용목록**이다(`canon-addition-check.js:168-173` — 여기 있는 항목은 승인 확인 없이 통과한다). 지금 상태로는 누군가 hover 를 다시 붙여도 Gate 34 가 새 승인을 요구하지 않는다. 게이트가 지정한 절차(`--update-baseline`, 축소 전용)가 아직 실행되지 않았다.

## 7-5. ⑤ 높이 68 — ✅ **PASS**(도출 + 실측 교차)

- mock 산출 geometry: `when:"all"` 하나 — 루트가 유형·상태와 무관하게 `counterAxisSizingMode:"AUTO"` · padding 상하 `spacing/12` 로 **동일**하다. 높이를 가르는 분기가 없다.
- 자식 최대 높이 무변동(text 44 · thumbnail 40 · trail 24 · control 18 · toggle 20) → 12+44+12 = **68**.
- 호출자 선캡처 http 실측 **21칸 + 제목만 7칸 = 28칸 전부 68.0**.
- 선캡처 육안 대조(`matrix-pc-light.png`): 3열 × 7행 21칸 전부 같은 줄 높이, 제목만 줄 7칸도 같은 높이. 깨짐·줄바꿈·밀림 없음.
- 🟡 (판정 아님) 눌림 배경 `#FAFAFA` 가 기본 `#FFF` 와 거의 구분되지 않아 선캡처에서는 눌림 열이 기본 열과 같아 보인다. **river 지시("pressed의 배경을 hover배경값으로 교체")대로의 결과**라 결함이 아니며, 빌더의 computed-style 실측으로 값 자체는 확인됐다.

## 7-6. ⑥ `component-facts` tokenBindings — ✅ **PASS**(단, 호출자 기대가 틀렸다)

- diff 는 `_meta.sourceHash` + `State` 축에서 `"Hover"` 1줄 제거 **뿐**. tokenBindings 21개는 한 줄도 변하지 않았다.
- 호출자 요청은 "level-2 가 빠지고" 였으나 **빠지지 않는 것이 정답**이다 — 썸네일이 실제로 바인딩하기 때문이다(7-2). facts 는 mock 실행 산출물이라 정본을 그대로 비춘 것이고, 어긋난 쪽은 facts 가 아니라 **계약의 `tokens.bg`** 다.
- 다른 컴포넌트 항목 0줄 변동.

## 7-7. ⑦ 기존 코드 훼손 — ✅ **PASS**

- 정본 diff 는 **7줄, 헝크 1개**(`:1254-1258`). `buildListRow` 안이고 그것도 `states`/`bgKey` 두 곳뿐. 다른 함수·러너·카테고리 무변경.
- 🟡 **이월 지적(이번 델타가 만든 것이 아님)** — 함수 머리말 `build-components.ts:1240-1241` 이 아직 제거된 축을 설명한다: "Density 는 목록이 정한다 … Default(제목+설명·여백 16) / Compact(제목만·여백 12)". 계약의 "촘촘 밀도는 두지 않는다" 와 정면으로 어긋난다. 5차 축소 때 함께 지웠어야 했고 4~6차가 못 잡았다. 정본 파일 안의 거짓 설명이므로 이번에 함께 정리할 것을 권고한다.
- 🟡 오타 — `pages/ui-review.html` List Row 설명문 "한 벌만 **쓴니다**" → "씁니다".

---

## 7차 항목별 판정 요약

| # | 항목 | 판정 |
|---|---|---|
| ① | Hover 흔적(이름·bgKey·주석·spec 표·전 표면) | ✅ **PASS** |
| ② | 눌림 배경 = `color/bg/level-1` | ✅ **PASS** |
| ② | `color/bg/level-2` 완전 소멸 | ❌ **FAIL (a) 2건** — 썸네일이 여전히 쓴다. 계약 `tokens.bg` 누락 · css 주석 거짓 진술 |
| ③ | 정본·계약·배포본 3자 정합(상태 3·21칸·모바일) | ✅ PASS (🟡 배포본 플랫폼 필드 없음 — 관례) |
| ④ | 죽은 코드·끊긴 참조 | 코드 ✅ PASS / ❌ **FAIL (a) 2건** — 이행 장부 56칸·Density 잔존 · Gate 34 baseline 미축소 |
| ⑤ | 높이 68 (21칸 + 제목만 7칸) | ✅ **PASS** |
| ⑥ | facts tokenBindings | ✅ **PASS** (호출자 기대와 반대가 정답) |
| ⑦ | 기존 코드 훼손 | ✅ **PASS** (🟡 이월: 머리말 Density 설명 · 오타) |
| 0 | 결정론 게이트 | ✅ 9/9 exit 0 · Gate 34 ⚠️ 1 · gate:check error 는 Gate 13 자신뿐 |

- ❌(a): **4건** · ❓(c): 0건 · 🟡(b): 4건 · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 6차 ①`minHeight` 바인딩 · ②화살표 폴백 상수 · ③`tokens.sizing` · 5차 수치 선례 7/7
- 미검증(정직 표기): **Figma 실물 캔버스 렌더** — 1~7차 내내 MCP 연결 불가

## 7차 한 줄 판정

**fail** — 축 축소 자체(Hover 제거·눌림 배경 level-1·21칸)는 정본부터 배포본까지 **전 표면 일치로 PASS** 다. 막는 것은 `level-2` 를 "완전히 없앴다"고 적은 두 곳(계약 `tokens.bg`·css 주석)과 따라오지 않은 장부 두 곳(이행 기록·Gate 34 baseline)뿐이며, 넷 다 한 줄짜리 정리다. Gate 13 검증 기록은 아직 실행하면 안 된다.

---
---

# 4-verification (정본) — **8차 재검증** (7차 ❌ 4건 델타)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-21
- 입력: 7차 보고서 + **호출자 기계검사 표 10건**(§검증 입력 계약 ① 충족) + 7차 이후 변경분
- 범위: **델타 재검증** — 7차 ❌ 4건 + 🟡 이월 2건 + 그 수정이 닿은 표면만.
  - **이번에 재확인하지 않음(7차 PASS 승계):** ① Hover 흔적 전수 · ② 눌림 배경 `bg/level-1` · ⑤ 높이 68(21+7칸) · ⑥ facts tokenBindings 내용 · ⑦ 정본 헝크 범위. 근거: 8차 변경이 **주석·JSON 서술·baseline 축소뿐**이라 스타일 값·축·기하가 한 줄도 바뀌지 않았고(아래 8-5 로 실증), 검사 규칙도 강화되지 않았다. 7차 선캡처(`screens/matrix-*.png`)를 그대로 유효한 근거로 쓴다.
- 한계: **Figma 실물 캔버스 렌더는 8차에도 미검증**(MCP 연결 불가 — 1~8차 동일).

## 8-0. 결정론 게이트 — 검증자 재실행 **10/10**

| 게이트 | 호출자 표 | 검증자 재실행 |
|---|---|---|
| `installer:check`·`components:keycheck`·`components:anatomy`·`components:iconpolicy`·`components:facts` | ✅ ×5 | ✅ exit 0 ×5 |
| `ui:build:check`·`ui:contract`·`ui:test:check`·`ui:version` | ✅ ×4 | ✅ exit 0 ×4 |
| **Gate 34** | ✅ 경고 0 | ✅ `정본 신설 0건 — 추적 661항목 전부 동결 목록과 일치` |
| `gate:check` 전체 | 표에 없음 | ❌ **error 1건 = Gate 13 자신**(이 검증 기록 대기). 경고 21→**20**(Gate 34 경고 소멸). 그 외 error 0 |

## 8-1. ❌(a)-1 계약 `tokens.bg` 복원 — ✅ **PASS**

```json
"bg": ["color/bg/level-0", "color/bg/level-1", "color/bg/level-2"],
"_bgNote": "level-0 기본 · level-1 눌림 · level-2 는 썸네일 자리 채움. Hover 는 없다(모바일 전용)."
```

- 계약 3개 : `component-facts.json` 실측 bg 바인딩 3개(`level-0`·`level-1`·`level-2`) **정확히 일치**.
- `_bgNote` 의 주장도 코드와 맞다 — `build-components.ts:1258`(상태 배경 level-0/1)·`:1311`(썸네일 level-2). **상태 배경으로서의 level-2 는 없고, 썸네일로서의 level-2 는 있다**는 구분이 정확히 서술됐다.

## 8-2. ❌(a)-2 배포본 주석의 거짓 — ✅ **PASS**

```css
/* list-row.css:4 (src·dist·번들 s1-ui.css:4297 전부 동일)
   … bg/level-2 는 썸네일 자리 채움에만 쓴다(배경 상태값으로는 쓰지 않는다). */
```

- 같은 파일 `:68` 의 `background: var(--color-bg-level-2)`(thumbnail)와 이제 일치한다.
- **세 벌 모두 갱신 확인** — `src/components/list-row/list-row.css` · `dist/components/list-row.css` · 합본 `dist/s1-ui.css`. 합본에서 누락되는 흔한 실수가 없다.
- `"더는 쓰지 않는다"` 문구 전수 검색 → **저장소 전체 0건**.

## 8-3. ❌(a)-3 이행 장부 — ✅ **PASS**

- `reverifyTrigger` : `Type×Density×State` → **`Type×State`**.
- `promotionDecision` : 56칸 → **21칸(Type 7 × State 3)**, 모바일 전용·Hover 없음·눌림 `bg/level-1`·밀도 축 없음·높이 68·수치 선례 출처까지 명시. **`data-density` 사용 규칙 문장 삭제 확인**(전수 검색 0건).
- 이 레코드의 모든 사실 주장을 코드·계약과 대조했고 **틀린 것 0건**이다(21칸·State 3·level-1·68·선례 6종·자체 결정 44 하나 — 전부 실재).

## 8-4. ❌(a)-4 Gate 34 baseline 축소 — ✅ **PASS**

| 확인 | 결과 |
|---|---|
| `items` 에서 제거 | ✅ `uistate:list-row.hover` 없음. 남은 것은 `default`·`pressed`·`disabled` 3종 |
| `approvals` 에 기록 보존 | ✅ 남아 있음 — **올바르다.** `items` 는 살아 있는 허용목록, `approvals` 는 승인 이력이라 이력을 지우면 과거 근거가 사라진다 |
| 과잉 축소 여부 | ✅ 없음 — `count 661 = items 661` 로 선언·실제 일치, 다른 컴포넌트 항목 손실 0 |
| 재도입 차단 | ✅ 이제 hover 를 되붙이면 Gate 34 가 **미승인 신설**로 잡는다(7차 지적의 핵심이 해소) |

## 8-5. 새로 어긋난 곳 — ✅ **없음**

| 확인 대상 | 결과 |
|---|---|
| 정본 diff | 헝크 1개(`:1250-1258`) — 주석 2줄 추가 + `states`·`bgKey`. **실행 코드는 7차와 동일** |
| facts | diff 가 `sourceHash` + `"Hover"` 1줄 제거뿐. tokenBindings 21개·geometry·anatomy 무변동 |
| 계약 ↔ facts | State 3:3 · bg 3:3 · sizing 2:2 · propertyMap 3 · 21칸 — 전부 일치 |
| 배포본 manifest ↔ 정본 | states 3 · canonicalStateMap 3 · `nativeStates` 에 `:hover` 없음 · variants 7 |
| `platform/contract.json` | states `[default, pressed, disabled]` · variants 7 · `canonicalFingerprint` 가 컴포넌트 manifest 와 **동일**(지문 어긋남 없음) |
| 버전 | 번들 `0.12.1`, 컴포넌트 manifest `0.3.0` — **정상.** 8차는 주석만 바꿔 공개 계약(variant·state·part·속성)이 그대로라 컴포넌트 판을 올릴 이유가 없고, `ui:version` 이 28종 정본 일치로 초록이다 |
| 검수판 | `pages/ui-review.html` "21칸" 4곳 · 오타 `쓴니다` **0건** |
| 렌더 | 스타일 **값** 변경 0(주석뿐) → 7차 선캡처 21+7칸 68.0 이 그대로 유효. `ui:build:check`(278 files)·`ui:contract`(errors=0)·`ui:test:check` 로 번들 동등성 확인 |

## 8-6. 🟡 이월 건 — 1건은 해소, **1건은 보고와 달리 미해소**

- ✅ `pages/ui-review.html` 오타 `쓴니다` → 해소(0건).
- ⚠️ **정본 머리말의 Density 설명은 지워지지 않았다.** 호출자는 "Density 설명 잔재를 지웠고"라고 보고했으나, `git diff` 상 **추가 2줄뿐이고 삭제는 0줄**이다. 그 결과 같은 주석 블록이 자기모순에 빠졌다:

```ts
// build-components.ts:1240-1241   ← 남아 있는 옛 설명
//   ▸ Density 는 **목록이 정한다** — … Default(제목+설명·여백 16) / Compact(제목만·여백 12) 를 목록 단위로 고른다
// build-components.ts:1252        ← 이번에 추가된 정정
//   ▸ 밀도 축은 두지 않는다 — 한 벌만 쓴다
```

  판정은 **7차와 같은 🟡 로 유지한다** — 주석이라 동작·파생·기계검사에 영향이 0 이고, 7차에 🟡 로 매긴 것을 사후에 ❌ 로 올리는 것은 판정 기준을 뒤에서 강화하는 것이라 하지 않는다. 다만 **"지웠다"는 보고는 사실과 다르므로** 기록에 남긴다. `:1240-1241` 두 줄 삭제 = 한 번의 편집이다.

---

## 8차 항목별 판정 요약

| # | 7차 | 8차 |
|---|---|---|
| ❌(a)-1 계약 `tokens.bg` 에 level-2 복원 | ❌ | ✅ **PASS** — 계약 3 : facts 3 일치, `_bgNote` 서술도 정확 |
| ❌(a)-2 배포본 주석 거짓 | ❌ | ✅ **PASS** — src·dist·합본 세 벌 모두 정정, 거짓 문구 0건 |
| ❌(a)-3 이행 장부 56칸·Density | ❌ | ✅ **PASS** — 21칸·Type×State 로 갱신, `data-density` 문장 삭제, 사실 오류 0건 |
| ❌(a)-4 Gate 34 baseline | ❌ | ✅ **PASS** — `items` 축소·`approvals` 이력 보존·경고 0·과잉 축소 없음 |
| 새 어긋남(계약↔정본↔manifest↔facts↔장부↔지문) | — | ✅ **없음** |
| 🟡 오타 | 🟡 | ✅ 해소 |
| 🟡 정본 머리말 Density 설명 | 🟡 | 🟡 **미해소**(보고와 불일치 — 두 줄 삭제 남음) |
| 결정론 게이트 | 9/9 + 경고 1 | ✅ **10/10 exit 0 · Gate 34 경고 0** |

- ❌(a): **0건** · ❓(c): 0건 · 🟡(b): 1건 · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 7차 ①Hover 전수 · ②눌림 배경 · ⑤높이 68 · ⑥facts 내용 · ⑦헝크 범위 (근거: 8차 변경에 실행 코드·스타일 값이 없음 — 8-5 로 실증)
- 미검증(정직 표기): **Figma 실물 캔버스 렌더** — 1~8차 내내 MCP 연결 불가. 높이 68 은 도출 + 웹 배포본 http 실측 교차.

## 8차 한 줄 판정 — **최종**

**pass** — Gate 13 검증 기록을 실행해도 된다. 남은 것은 판정을 막지 않는 🟡 한 건(`build-components.ts:1240-1241` 옛 Density 설명 두 줄 삭제)뿐이며, 호출자 보고가 이 건만 사실과 달랐다는 점을 기록에 남긴다.

---
---

# 4-verification (정본) — **9차 재검증** (Thumb 자리 → Figma 슬롯)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-22
- 입력: 8차 보고서(pass) + **호출자 기계검사 표 10건**(§검증 입력 계약 ① 충족) + 8차 이후 변경분(git diff)
- 범위: **델타 재검증** — 이번 변경(`makeSlot` 도입 + 계약 `slots[]` + 배포본 채움 자리)이 닿은 표면만.
  - **이번에 재확인하지 않음(8차 PASS 승계):** Hover 흔적 전수 · 눌림 배경 `bg/level-1` · facts tokenBindings 내용 · Gate 34 baseline 의 hover 축소. 근거: 이번 diff 가 정본 1헝크(Thumb 분기)·계약 `slots[]` 신설·배포본 thumbnail 규칙에 한정되고, 상태·축·색 토큰은 한 줄도 바뀌지 않았다(9-6 으로 실증). 검사 규칙 강화도 없었다.
- 한계: **Figma 실물 캔버스는 9차에도 미검증**(MCP 연결 불가 — 1~9차 동일). 슬롯의 캔버스 거동(속성 등록·인스턴스에서 넣고 빼기)은 코드·선례 대조로만 판정했다.

## 9-0. 결정론 게이트 — 검증자 재실행 **10/10 exit 0**

`installer:check` · `components:keycheck` · `components:anatomy` · `components:iconpolicy` · `components:facts` · `ui:build:check` · `ui:contract` · `ui:test:check` · `ui:version` · `canon:check` — 호출자 표와 동일하게 **전부 exit 0**. (위조 방지 재실행이며 내용 재판정은 하지 않았다.)

## 9-1. 슬롯이 실제로 생성되는가 — ✅ **PASS**

`build-components.ts:1317-1322`

- **선례와 같은 방식이다.** 호출 형태(`await makeSlot(comp, 이름, 설명, [기본내용], [], {레이아웃})`)가 Options(`:2405`)·Tabs(`:2574`)·Menus(`:4080`)·Columns(`:4333`)·Content(`:5810`)·Items(`:7120`)와 동일하고, **variant 를 합치기(`combineAsVariants`) 전에 칸마다 호출**하는 것도 전 선례와 같다.
- 슬롯 속성 등록은 `makeSlot` 내부(`:3589-3593`)가 `componentPropertyDefinitions` 를 전후 비교해 **새 SLOT 이 안 생기면 예외를 던진다** — 조용한 실패 경로가 없다.
- **자리 순서 보존 확인:** 슬롯은 `text`·`trail` 을 붙이기 **전에** `comp` 에 붙으므로 왼쪽 칸 자리가 그대로다(`makeSlot` 이 `(layout.parent ?? comp).appendChild(slot)` — `:3584`).
- **Thumb 3칸에만 생긴다** — 호출이 `else if (t === "Thumb")` 분기 안이라 21칸 중 Type=Thumb × State 3 에만 달린다. 이름이 세 칸 모두 `그림` 으로 같아 **State 를 바꿔도 같은 속성으로 이어진다**(Figma 는 이름으로 잇는다). Type 을 바꾸면 사라지는데, 그림이 없는 유형이므로 맞다.
- 🟡 선례와 다른 점 하나: 다른 슬롯은 `preferredValues` 에 컴포넌트 세트 키를 넘겨 스왑 후보를 좁히는데 여기는 `[]` 다. 무엇이든 넣는 자리라 타당하나, 후보 추천이 없다는 뜻이다.

## 9-2. 자리표시 치수·토큰 — ✅ **PASS**

`:1310-1315` — `resize(40,40)` 후 `width`/`height` ← `sizing/40` 바인딩 · `fills` ← `color/bg/level-2` 바인딩 · `bindRadius(radius/4)`. **이전과 한 글자도 다르지 않다**(git diff 상 이 5줄은 무변동, 바뀐 것은 `name` 과 감싸기뿐).
- `layoutSizingHorizontal/Vertical = "FIXED"` 가 **슬롯에 붙인 뒤** 걸린다(`:1323-1324`) — 오토레이아웃 부모 안에서만 유효한 API 라 순서가 맞다.
- 하드코딩 hex 0건(H2 준수) · 폰트 건드림 0건(H3 무관).

## 9-3. 줄 높이 68 — ✅ **PASS** (실측)

- **도출:** 슬롯이 `primaryAxisSizingMode/counterAxisSizingMode = AUTO` · padding 0 · itemSpacing 0 이라 자리표시 40 을 그대로 감싼다. 칸의 세로 최대 자식은 여전히 `text`(minHeight 44) → 12 + 44 + 12 = **68**. 슬롯이 높이를 밀어 올리지 않는다.
- **실측(배포본 http, 전수):** `reports/ui-library/list-row/matrix-fixture.html` 의 **28칸(21칸 + 제목만 7칸) 전부 정확히 68.0** (min=68.0 max=68.0, 벗어난 칸 0). Thumb 3칸 모두 자리표시 40.0×40.0 · `rgb(245,245,245)`(= bg/level-2) · radius 4px.
- 🟡 (b) 구조 관찰: Figma 슬롯이 AUTO 라 **40 보다 큰 것을 넣으면 68 이 깨진다** — 이를 막는 것은 계약 문장(`rule`)뿐이고 기하가 막지 않는다. 웹은 `--sizing-40` 고정 + `overflow:hidden` 으로 강제된다. 정본도 슬롯을 `sizing/40` FIXED 로 묶으면 규칙이 기하로 내려온다(권고, 이번 판정에는 반영 안 함).

## 9-4. 계약 ↔ 정본 ↔ 배포본 manifest ↔ facts 4면 — ✅ **PASS**

| 표면 | 슬롯 이름 | 적용 범위 | 결과 |
|---|---|---|---|
| 정본 `build-components.ts:1317` | `그림` (안쪽 `자리표시`) | Thumb 분기 | 기준 |
| facts `component-facts.json` List Row | `slots: ["그림"]` · `anatomy` 에 `그림` | — | ✅ 일치 |
| 계약 `registry/components/list-row.json:214-224` | `name/figmaProperty = 그림` · `webPart = thumbnail` · `appliesTo = [thumb]` | ✅ 일치 |
| 배포본 `list-row.manifest.json` | `contentSlots.thumbnail` 이 `makeSlot("그림")` 을 명시 · `typeStructure.thumb` 에 슬롯 표기 | ✅ 일치 |

- facts `anatomy` 에서 `thumbnail` 이 빠지고 `그림` 이 들어온 것은 **옳다** — 자리표시는 이제 루트 직계가 아니라 슬롯 안이고, 파생 생성기(`gen-component-facts.js:144`)가 SLOT 이름을 집는다. 선례 슬롯들과 같은 모양이다.
- 옛 이름 `thumbnail` 이 남은 곳은 **웹 부품 이름**(`ui-review.html:2529`·계약 `webPart`·배포본 CSS)뿐이며, 이는 바뀌지 않아야 할 웹 계약이다. 정본 쪽 잔재 0건.
- 🟡 (b) 사각지대: 새 `slots[]` 필드를 대조하는 결정론 검사기가 **없다**. 지금은 사람(이 검증)만 본다 — facts `slots` 와 계약 `slots[].figmaProperty` 를 맞대는 검사를 붙이면 다음부터 기계가 잡는다.

## 9-5. Gate 34 — ✅ **PASS**

- `canon-additions-baseline.json`: `count 662 = items 662`(중복 0), `componentprop:그림` 1건만 늘었다. 다른 항목 손실 0.
- 승인 기록의 인용을 **세션 기록에서 직접 확인**: `"사진이 들어갈 자리는 슬롯으로 교체해줄래?"` 가 `origin.kind = human` 인 사람 발화로 실재하고, 그 타임스탬프(`2026-09-21T07:37:44.101Z`)가 `approvals[].evidence.at` 과 **정확히 일치**한다. 자기신고가 아니다.
- `canon:check` exit 0.
- ℹ️ 같은 발화의 뒷문장(`또 슬롯으로 교체할만한게 뭐가 있을지도 검토해줘`)은 이번 변경 범위 밖이다 — 미이행 여부는 내 판정 대상이 아니며 호출자 몫으로 남긴다.

## 9-6. 기존 코드 훼손 — ✅ **PASS**

- `build-components.ts` diff = **헝크 1개(`:1305-1324`, Thumb 분기)뿐.** 다른 유형(Nav·Value·Read·Pick·Agree·Switch)·다른 컴포넌트 함수·`makeSlot` 본체 모두 무변동.
- facts diff = `sourceHash` + List Row 의 `anatomy`·`slots` 뿐. 다른 컴포넌트 0줄.
- 계약 diff = anatomy 문구 1줄 · `slotMap.thumb.left` 1줄 · `slots[]` 신설. 축·상태·토큰 무변동.
- 배포본 diff = list-row CSS/manifest/example + 버전 파생(0.12.1→0.12.2)뿐. 다른 컴포넌트 CSS 0건.
- 🟡 작업트리에 **이번 변경과 무관한 수정 1건**이 섞여 있다: `reports/pattern-builder/profiles/app-modu/imported/4-3-관리자-초대_…json` 의 `_meta.link` 1줄(패턴 빌더 작업 잔여). 그대로 커밋하면 이번 커밋에 딸려 들어간다.

## 9-7. ❌ **(a) 1건 — 배포본이 적어 둔 동작이 실제와 다르다(실측)**

`ui-library/src/components/list-row/list-row.css:78-84` (= `dist/components/list-row.css` · 합본 `dist/s1-ui.css` 동일)

```css
[data-s1-component="list-row"] [data-s1-part="thumbnail"] > img,
[data-s1-component="list-row"] [data-s1-part="thumbnail"] > svg {
  object-fit: cover;  /* ← svg 에는 효력이 없다 */
}
```

`list-row.manifest.json` `contentSlots.thumbnail` 과 CSS 머리말은 **채우면 "40 각 안에서 잘려 채워진다(object-fit: cover)"** 라고 단정하고, 그 대상에 `svg` 를 명시적으로 넣었다. 실측 결과:

| 넣은 것 | 실제 | 문서 주장과 |
|---|---|---|
| `<img>` 100×20 | **40×40 으로 잘려 채워짐** | ✅ 맞음 |
| 인라인 `<svg>` viewBox 100×20 | **40×8 로 줄어 여백이 생김**(letterbox) | ❌ 다름 |

`object-fit` 은 대체요소(img·video)에만 듣고 인라인 `svg` 에는 듣지 않는다 — 인라인 svg 는 `preserveAspectRatio` 기본값(meet)으로 **잘리지 않고 축소**된다. 예시 파일의 svg 가 정사각(40×40)이라 눈으로는 드러나지 않았을 뿐이며, 계약을 따르는 소비자가 정사각이 아닌 아이콘 svg 를 넣으면 문서와 다른 결과를 본다.

**판정 근거:** 7차 ❌(a)-2 에서 "파일이 실제로 하는 일과 다른 주석"을 ❌(a) 로 매겼다. 같은 종류이므로 같게 매긴다(사후 기준 완화 금지). 고치는 방법은 한 줄 — `> svg` 를 object-fit 규칙에서 빼고 `preserveAspectRatio="xMidYMid slice"` 를 안내하거나, 문서에서 svg 를 잘림 대상에서 제외한다.

## 9-8. ❓ **(c) 1건 — Figma 에서 그림을 넣으면 자리표시가 남는가**

슬롯의 기본 내용이 `자리표시` 프레임이고, 슬롯 레이아웃은 HORIZONTAL·AUTO·itemSpacing 0 이다. 소비자가 자리표시를 **지우지 않고** 그림을 넣으면 왼쪽 칸이 `자리표시 + 그림` 두 개가 되어 폭 80 이 된다. 선례 슬롯들은 설명에 "**넣고 빼서**"라고 적어 빼는 것을 명시했지만, 이번 설명은 "그 안에 놓거나 비워 둔다"라 **자리표시를 빼야 한다는 말이 없다.**

한편 배포본 계약은 "채우면 회색 바탕이 사라진다"(`:empty` 규칙)고 적어, 웹은 자동으로 사라지고 Figma 는 손으로 빼야 하는 **양쪽 거동 차이**가 생긴다.

MCP 가 끊겨 실제 캔버스에서 슬롯이 기본 내용을 어떻게 다루는지 확인할 수 없으므로 **임의로 (b) 로 빼지 않고 (c) 로 올린다.** 확인할 것: Figma 슬롯에 내용을 넣을 때 기본 내용이 자동으로 밀려나는가, 아니면 설명에 "자리표시를 빼고 넣는다"를 넣어야 하는가.

## 9차 항목별 판정 요약

| # | 항목 | 판정 |
|---|---|---|
| 1 | 슬롯 생성·선례 일치·Thumb 3칸 한정 | ✅ PASS (🟡 preferredValues 비어 있음) |
| 2 | 자리표시 40 · sizing/40 · bg/level-2 · radius/4 | ✅ PASS |
| 3 | 줄 높이 68 (28칸 실측 전부 68.0) | ✅ PASS (🟡 슬롯 AUTO 라 기하가 40 을 강제하지 않음) |
| 4 | 계약↔정본↔manifest↔facts 4면 | ✅ PASS (🟡 `slots[]` 전용 검사기 없음) |
| 5 | Gate 34 승인 인용·baseline | ✅ PASS (사람 발화·타임스탬프 일치 확인) |
| 6 | 기존 코드 훼손 | ✅ PASS (🟡 무관한 파일 1건이 작업트리에 섞임) |
| 7 | 슬롯 이름 한글(`그림`) | ✅ **문제 없음** — 아래 참조 |
| — | 배포본 object-fit 서술 | ❌ **(a) 1건** |
| — | Figma 자리표시 잔존 | ❓ **(c) 1건** |
| 0 | 결정론 게이트 | ✅ 10/10 exit 0 |

**7번 판정(슬롯 이름 한글):** 저장소 관례상 **문제로 보지 않는다.** ①정본에서 사람이 읽는 이름은 이미 한글이 기본이다(부품 `자리표시`·`control`·`text` 혼재, 계약·주석 전부 한글). ②Figma 속성 이름은 코드 식별자가 아니라 **디자이너가 패널에서 읽는 라벨**이고, 이 저장소의 1차 독자는 비개발자다. ③영문 선례 6종(Options·Tabs·Menus·Columns·Content·Items)은 모두 2026-09-03~09 에 만들어진 것이라 관례라기보다 그때의 습관이며, 한글 금지 규칙은 어디에도 없다(`audit-rules.json` R04/R11 은 CSS 변수·클래스 대상이라 적용 밖). 다만 **섞여 있는 상태 자체**는 다음에 슬롯을 더 만들 때 매번 되묻게 되므로, river 에게 "슬롯 이름은 한글로 통일한다/영문으로 통일한다"를 한 번 정해 두길 권한다(이번 판정에는 영향 없음).

- ❌(a): **1건** · ❓(c): **1건** · 🟡(b): 4건 · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 8차 Hover 전수 · 눌림 배경 · facts tokenBindings 내용 · baseline hover 축소 (근거: 9-6 diff 범위)
- 미검증(정직 표기): **Figma 실물 캔버스** — 1~9차 내내 MCP 연결 불가. 슬롯 속성 등록은 코드·선례 대조로만 판정.

## 9차 한 줄 판정

**fail** — 슬롯 교체 자체는 정본·계약·facts·배포본 4면이 모두 맞고 줄 높이 68 도 28칸 전수 실측으로 지켜졌다. 막는 것은 배포본이 "svg 도 잘려 채워진다"고 적었으나 실제로는 여백을 두고 줄어든다는 것 한 줄(❌a)과, Figma 에서 그림을 넣을 때 자리표시를 빼야 하는지 확인이 필요하다는 것(❓c) 둘이다. Gate 13 검증 기록은 아직 실행하면 안 된다.

---
---

# 4-verification (정본) — **10차 재검증** (9차 ❌1·❓1 처리분)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-22
- 입력: 9차 보고서 + **호출자 기계검사 표 10건**(§검증 입력 계약 ① 충족) + 9차 이후 변경분
- 범위: **델타 재검증** — 9차 ❌(a)-1(object-fit 서술) · ❓(c)(자리표시 잔존) 두 건과 그 수정이 닿은 표면만.
  - **이번에 재확인하지 않음(9차 PASS 승계):** 슬롯 생성 방식·선례 일치 · 자리표시 치수/토큰 바인딩 · Gate 34 승인 인용 · 정본 훼손 범위. 근거: 정본 diff 가 **슬롯 설명 문자열 1개**만 늘었고 실행 코드·바인딩·기하는 한 줄도 바뀌지 않았다(10-3 실증).
- 한계: **Figma 실물 캔버스는 10차에도 미검증**(MCP 연결 불가 — 1~10차 동일).

## 10-0. 결정론 게이트 — 검증자 재실행 **10/10 exit 0**

10건 전부 exit 0 재확인. `gate:check` 전체는 **error 1건 = Gate 13 자신**(이 검증 기록 대기)뿐이고 나머지 error 0 · 경고 20(기존 부채). 8차·9차와 같은 모양이다.

## 10-1. ① object-fit 서술 — ✅ **PASS** (실측으로 확인)

`ui-library/src/components/list-row/list-row.css:85-99` (= `dist/components/list-row.css:85-99` · 합본 `dist/s1-ui.css:4381-4392` **세 벌 모두 동일**)

- `object-fit: cover` 는 이제 `> img` 에만 있고, `> svg` 는 `display:block; width/height:100%` 만 남았다. **없는 속성을 지어내지 않았다**(내 권고 그대로).
- CSS 머리말·`contentSlots.thumbnail`·`geometry.thumbnail.note` 문구가 전부 "그림(img)은 잘라 채우고, 인라인 svg 는 자기 비율대로 맞춰 들어간다"로 바뀌었다.

**실측(합본 `s1-ui.css` 로 http 렌더 — 배포되는 바로 그 파일):**

| 넣은 것 | 자리 | 내용 | 줄 높이 | 문서 주장과 |
|---|---|---|---|---|
| 비움 | 40.0×40.0 · `rgb(245,245,245)`(bg/level-2) · r4 · overflow hidden | — | **68.0** | ✅ |
| `<img>` 100×20 | 40.0×40.0 · 배경 투명 | 40.0×40.0 `object-fit=cover`(잘려 채움) | **68.0** | ✅ |
| 인라인 `<svg>` viewBox 100×20 | 40.0×40.0 · 배경 투명 | 상자 40.0×40.0 · 그려진 것 40.0×8.0(비율대로 가운데) `object-fit=fill`(=기본값, 규칙 제거됨) | **68.0** | ✅ |

호출자 보고("svg 는 40 각 상자 안에 비율대로, 가운데 띠")와 내 실측이 **정확히 일치**한다. 9차 ❌(a) **해소**.

- **높이 68 재확인:** 규칙 변경이 thumbnail 자식에만 걸려 기하에 영향이 없음을 확인하려고 `matrix-fixture.html` **28칸을 새 합본으로 다시 쟀다 — 전부 68.0**(min=max=68.0, 벗어난 칸 0, Thumb 3칸 40×40·bg/level-2·r4).

## 10-2. ② Figma 자리표시 규칙 — ⚠️ **정본은 PASS · 계약이 따라오지 않음**

**정본 — ✅ 고쳐졌다.** `build-components.ts:1318`

```
"… 기본은 40 각 자리표시이며, **자리표시를 빼고 넣을 것을 그 자리에 넣는다**(둘을 같이 두면
 왼쪽 칸이 둘이 된다). 비워 두면 자리표시만 남는다. 줄 높이(68)는 … 40 보다 큰 것을 넣지 않는다."
```

선례(Options·Menus)의 "넣고 빼서" 화법에 맞고, 9차 (c)가 지적한 "빼라는 말이 없다"가 해소됐다. 파생 `component-guide-model.json` 에도 **새 문장이 3곳 반영**됐다(자동 연동 정상).

**계약은 옛 문장 그대로다 — ❌(a).** `registry/components/list-row.json:220`

```json
"description": "사진·아이콘·아바타가 들어가는 자리. 기본은 40각 자리표시이며, 넣을 것을 그 안에 놓거나 비워 둔다."
```

- 정본은 "**자리표시를 빼고** 그 자리에 넣는다", 계약은 "**그 안에** 놓는다" — 이번 수정이 겨냥한 **바로 그 문장에서 두 표면이 서로 다른 말을 한다.** 계약 문장은 9차 (c)에서 "왼쪽 칸이 둘이 된다"고 지적한 바로 그 오해를 그대로 안내한다.
- 전수 확인: 새 문장은 정본 1곳 + guide-model 3곳에 있고, 옛 문장은 **계약 1곳에만** 남았다. 다른 표면 오염 없음.
- 한 줄 수정이다(계약 `slots[0].description` 을 정본 문장과 같게). 같은 파일의 `anatomy`·`slotMap.thumb.left` 에는 이미 "넣고 빼기"가 들어가 있어, 정작 규칙을 담는 `slots[].description` 만 빠졌다.

## 10-3. 새로 어긋난 곳 — ✅ **없음**

| 확인 대상 | 결과 |
|---|---|
| 정본 diff | 여전히 헝크 1개(Thumb 분기). 9차 대비 **슬롯 설명 문자열만** 달라졌고 `makeSlot` 인자 구조·바인딩·기하·다른 유형 0줄 |
| facts | `slots:["그림"]` · anatomy `그림` 유지. 슬롯 설명은 facts 가 담지 않아 영향 없음 |
| 배포본 CSS 3벌 | src·dist·합본이 **바이트 단위로 같은 규칙**(img 규칙 1 · svg 규칙 1). 합본 누락 없음 |
| manifest src↔dist | `sourceFingerprint` 1줄 외 완전 동일 |
| 버전 | release-log·package·dist manifest **전부 0.12.3** 일치, `ui:version` 28종 초록 |
| 재생성 표면 | 설치기·전달본 zip·`install-prompt.html`·`DESIGN.core.md`·`component-guide-model.json`·crosswalk 장부가 함께 갱신됨 — 손편집 흔적 없이 파생 경로로 생성 |
| 9차 🟡 무관 파일 | `reports/pattern-builder/…json` 1줄 여전히 있음 — 호출자가 커밋에서 제외하겠다고 밝혀 판정에 반영하지 않는다 |

## 10차 항목별 판정 요약

| # | 9차 | 10차 |
|---|---|---|
| ❌(a) 배포본 object-fit 서술 | ❌ | ✅ **PASS** — CSS 3벌 정정 + img/svg/빈자리 3종 실측 일치 |
| ❓(c) Figma 자리표시 잔존 | ❓ | ✅ 정본 규칙 명시로 **해소** |
| 계약 `slots[].description` 동기화 | — | ❌ **(a) 1건** — 정본과 다른 옛 문장 잔존 |
| 높이 68 (28칸 전수 재실측) | ✅ | ✅ **PASS** |
| 새 어긋남·버전·3벌 동기화 | — | ✅ **없음** |
| 결정론 게이트 | 10/10 | ✅ **10/10 exit 0** (gate:check error 는 Gate 13 자신뿐) |

- ❌(a): **1건** · ❓(c): **0건** · 🟡(b): 3건(9차 이월 — preferredValues 없음 · 슬롯 AUTO 라 40 을 기하가 강제 안 함 · `slots[]` 전용 검사기 없음) · BLOCKED: 0건
- 승계(이번에 재확인하지 않음): 9차 슬롯 생성 방식 · 자리표시 치수/토큰 · Gate 34 승인 인용 · 정본 훼손 범위 (근거: 10-3)
- 미검증(정직 표기): **Figma 실물 캔버스** — 1~10차 내내 MCP 연결 불가.

## 10차 한 줄 판정

**fail** — 지적한 두 건은 실측으로 확인될 만큼 제대로 고쳐졌고 남은 것은 **계약 파일의 슬롯 설명 한 문장이 정본을 따라오지 않은 것 하나뿐**이다. 그 한 줄을 정본 문장과 같게 맞추면 4면이 다시 붙고, 그때 Gate 13 기록을 실행해도 된다(지금은 아직 실행하면 안 된다).

---
---

# 4-verification (정본) — **11차 재검증** (10차 ❌ 한 줄 처리분)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-22
- 범위: **델타** — 10차 ❌(a)(계약 `slots[].description`) 1건과 그 수정이 닿은 표면만.
  - **이번에 재확인하지 않음(10차 PASS 승계):** object-fit img/svg 실측 · 28칸 높이 68 · CSS 3벌 동기화 · Gate 34 승인 인용 · 슬롯 생성 방식. 근거: 이번 변경은 **JSON 문자열 1개**뿐이고 CSS·기하·바인딩이 한 줄도 바뀌지 않았다.

## 11-1. 문장 일치 — ✅ **PASS**

`registry/components/list-row.json` `slots[0].description` 이 정본 `build-components.ts:1318` 과 같은 말이 됐다 — "자리표시를 빼고 넣을 것을 그 자리에 넣는다(둘을 같이 두면 왼쪽 칸이 둘이 된다). 비워 두면 자리표시만 남는다." 높이 규칙은 계약 `slots[0].rule` 이 따로 갖고 있어 **합치면 정본 문장과 내용이 같다**(남은 차이는 `40각`/`40 각` 띄어쓰기와 `**` 강조 표시뿐 — 뜻에 영향 없음).

- **옛 문장 전수 검색 → 저장소 0건.** 새 문장은 정본 1 · 계약 1 · guide-model 3 으로 정상 분포.

## 11-2. ❌ **(a) 1건 — 정본이 또 바뀌었는데 배포본 번호가 안 따라갔다**

호출자는 `components:anatomy`·`components:facts`·`ui:contract`·`canon:check` 넷만 다시 돌렸다. **`ui:build:check`·`ui:test:check`·`ui:version` 세 개는 다시 돌리지 않았고, 지금 셋 다 실패한다.**

```
ui:version   → ❌ 정본이 바뀐 부품 1종에 번호가 안 올라갔습니다 (list-row)
ui:build:check / ui:test:check
             → Error: list-row canonicalFingerprint is stale. Review canon changes before rebuilding.
```

- 원인: 10차 때 정본 슬롯 설명을 고쳐 지문이 바뀌면 `ui:bump` 로 0.12.3 을 냈는데, **11차에서 정본을 또 건드리지는 않았음에도 계약(`list-row.json`)이 `canonicalSources` 에 들어 있어** 부품 지문이 다시 어긋났다. 배포본 `list-row.manifest.json` 의 `canonicalFingerprint` 가 옛 값이다.
- `gate:check` error 가 **1건(Gate 13 자신) → 2건**으로 늘었다(Gate 50 추가). 10차까지 초록이던 게이트가 이번 변경으로 빨개진 것이라 그냥 넘길 수 없다.
- 처리: `ui:version:refresh` → `ui:bump`(문구만 바뀐 patch) → `ui:build` 재생성. 그 뒤 10건 전부 exit 0 이어야 한다.

> §검증 입력 계약 ① 관련 기록: 이번 요청의 기계검사 표는 **10건 중 6건만 재실행된 것**이었고, 빠진 3건이 실제로 빨간 상태였다. 다음부터는 표를 부분 실행으로 채우지 않기를 권한다.

## 11차 판정 요약

| 항목 | 결과 |
|---|---|
| 계약 ↔ 정본 슬롯 설명 일치 | ✅ **PASS** (옛 문장 저장소 0건) |
| 결정론 게이트 10건 | ❌ **7/10** — `ui:build:check`·`ui:test:check`·`ui:version` 실패 |
| `gate:check` | ❌ error 2건 (Gate 13 자신 + **Gate 50 번호 미상승**) |
| 새 어긋남 | 위 지문 건 외 없음 — CSS·기하·facts·Gate 34 무변동 |

- ❌(a): **1건** · ❓(c): 0건 · 🟡(b): 3건(이월) · BLOCKED: 0건
- 미검증: **Figma 실물 캔버스**(1~11차 MCP 연결 불가)

## 11차 한 줄 판정

**fail** — 고치라고 한 문장은 정확히 맞춰졌지만, 그 수정으로 배포본 지문이 다시 어긋나 `ui:build:check`·`ui:test:check`·`ui:version` 셋이 빨갛다. 번호를 올리고 배포본을 다시 만든 뒤 10건이 모두 초록이면 그때 Gate 13 기록을 실행해도 된다(지금은 아직 아니다).

---
---

# 4-verification (정본) — **12차 재검증** (11차 ❌ 지문·번호 처리분)

- 검증자: 🤖 component-verifier (시나리오 D) · 일자: 2026-09-22
- 범위: **델타** — 11차 ❌(a)(배포본 지문 stale · 번호 미상승)와 그 재생성이 닿은 표면.
  - **이번에 재확인하지 않음(승계):** 슬롯 생성 방식·선례 일치 · 자리표시 치수/토큰 · Gate 34 승인 인용 · 정본 훼손 범위. 근거: 12차 변경은 지문 갱신과 배포본 재생성뿐이고 정본·계약 내용은 한 글자도 바뀌지 않았다.

## 12-1. 결정론 게이트 — ✅ **10/10 exit 0**

검증자 재실행 10건 전부 exit 0(11차에 빨갛던 `ui:build:check`·`ui:test:check`·`ui:version` 포함). `gate:check` = **error 1건 = Gate 13 자신**(이 검증 기록 대기) · 경고 20 — 8차·10차와 같은 정상 모양으로 돌아왔다.

## 12-2. 지문·번호 정합 — ✅ **PASS**

| 확인 | 결과 |
|---|---|
| 부품 manifest 지문 src↔dist | `e167ea48…` **동일** |
| 부품 지문 stale 여부 | ✅ 없음(`ui:version` 초록) |
| 번호 3면 | 장부 0.12.3 · `package.json` 0.12.3 · `dist/manifest.json` 0.12.3 **일치** |
| 전달본 지문 | 장부 top == `releases[0].deliveryFingerprint` **일치** |

## 12-3. 내용 재확인 — ✅ **PASS** (재생성본으로 다시 실측)

배포본이 다시 만들어졌으므로 10차에 확인한 것을 **새 합본으로 다시 쟀다.**

- 계약 `slots[0].description` = 정본 `build-components.ts:1318` 과 같은 말(옛 문장 저장소 0건) · facts `slots:["그림"]`·anatomy `그림` 유지.
- CSS 3벌(src·dist·합본) 모두 `> img` 규칙 1개 · `> svg` 규칙 1개 · **svg 쪽 object-fit 0개** — 10차 정정이 재생성 뒤에도 그대로다.
- 실측: 빈 자리 40×40 `rgb(245,245,245)` r4 · 가로로 긴 `img` → 40×40 잘려 채움(fit=cover) · 가로로 긴 `svg` → 상자 40×40 안에 40×8 비율대로(fit=fill). **세 줄 모두 68.0.**
- `matrix-fixture.html` **28칸 전수 재측정 — 전부 68.0**(min=max=68.0, 벗어난 칸 0).

## 12-4. 🟡 기록해 두는 것 — 0.12.3 이 두 벌을 가리킨다

장부 top 지문(`48e352bb…`)과 `releases[0]`(0.12.3) 의 지문(`5ba4561d…`)이 다르다. 10차에 0.12.3 을 낸 뒤 11차에서 정본·계약 문장을 고치고 `ui:version:refresh`(번호 유지)로 맞췄기 때문이며, **같은 번호가 서로 다른 정본 내용 두 벌을 가리키는 상태**다.

**판정을 막지 않는다** — ①`--refresh` 는 도구가 제공하는 정식 경로이고 ②git 이력에서 같은 어긋남이 이미 4회 커밋된 적이 있어(0.7.1·0.6.10·0.7.0) 이 저장소가 허용해 온 상태다. 내가 새 규칙을 만들지 않는다(H6②). 다만 문구만 바뀐 경우 번호를 올릴지 유지할지는 river 가 한 번 정해 두면 다음부터 흔들리지 않는다.

## 12차 판정 요약

| 항목 | 결과 |
|---|---|
| 결정론 게이트 10건 | ✅ **10/10 exit 0** |
| `gate:check` | ✅ error 1건 = Gate 13 자신뿐(경고 20, 기존 부채) |
| 지문·번호 정합(부품·번들·전달본) | ✅ PASS |
| 계약↔정본↔facts↔배포본 4면 | ✅ PASS (옛 문장 0건) |
| 재생성본 실측(img·svg·빈자리 · 28칸 68.0) | ✅ PASS |
| 새 어긋남 | ✅ 없음 |

- ❌(a): **0건** · ❓(c): **0건** · 🟡(b): 4건(이월 3 + 12-4) · BLOCKED: 0건
- 미검증(정직 표기): **Figma 실물 캔버스** — 1~12차 내내 MCP 연결 불가. 슬롯의 캔버스 거동은 코드·선례 대조로만 판정했고, 높이 68 은 도출 + 웹 배포본 28칸 실측 교차로 확인했다.

## 12차 한 줄 판정 — **최종**

**pass** — Gate 13 검증 기록을 실행해도 된다. 남은 🟡 4건은 판정을 막지 않으며, Figma 실물 캔버스 미검증만 정직하게 남는다.

---

# 13차 — 슬롯 2개(왼쪽 칸·오른쪽 칸) + BOOLEAN '설명 보임' + 검사기 mock (델타 재검증)

검증자: 🤖 component-verifier(시나리오 D) · 2026-09-22 · 기준: 12차 pass 이후 변경분만 대조(승계 항목은 그때그때 명시).
기계검사 표 10건은 호출자가 선행 실행(전부 exit 0). 위조 방지로 4건을 직접 재실행해 종료코드만 확인: `components:anatomy`·`components:facts`·`ui:contract`·`canon:check` **전부 exit 0**.

## 13-1. 슬롯 3개 — ✅ PASS

| 슬롯 | 적용 유형(코드) | 호출 | 선례와 같은가 |
|---|---|---|---|
| 왼쪽 칸 | Pick·Agree (`build-components.ts:1284`) | `makeSlot(comp,"왼쪽 칸",…)` `:1307` | ✅ `makeSlot`(3592) 단일 경로 — Options(2430)·Tabs(2599)·Content(5835)·Menus(4105)·Columns(4358)·Items(7145) 과 동일 |
| 그림 | Thumb (`:1318`) | `:1328` | ✅ 12차 승계(변경 없음) |
| 오른쪽 칸 | Nav·Value·Agree·Switch (`needsTrail` `:1358`) | `:1390` | ✅ |

- 내부 간격 8 은 슬롯에 바인딩 — `trail.setBoundVariable("itemSpacing", numv("spacing/8"))` `:1397`. `makeSlot` 이 `itemSpacing ?? 0` 을 먼저 대입하고(3606) 그 뒤 바인딩이 덮으므로 값이 유실되지 않는다. facts `tokenBindings` 에 `spacing/8` 잔존 ✅.
- 기본 내용: 체크 인스턴스/폴백 도형(`:1288~1304`), 화살표·값·토글(`:1362~1388`) — 슬롯 도입 전과 같은 노드. 슬롯 래핑 자체는 padding 0·itemSpacing 0·HUG 라 겉모습 불변 ✅.
- `preferredValues` 는 왼쪽 칸에만 `getBuiltSet("Radio")`, 없으면 빈 배열(`:1310`) — 폴백이 조용히 잘못된 세트를 넣지 않는다 ✅.
- Read 유형은 두 슬롯 모두 없음 ✅ (분기 조건상 도달 불가).

## 13-2. '설명 보임' BOOLEAN — ✅ PASS (높이 포함)

- `set.addComponentProperty("설명 보임","BOOLEAN", true)` `:1415` → 기본값 **true** ✅.
- 21칸 전부 결속: `comps` 는 7유형×3상태=21, 루프 `:1416~1420` 가 각 variant 의 `text` 프레임(`:1337` 이름 고정)에서 `description`(`:1351`)을 찾아 `componentPropertyReferences={visible:…}` 를 건다. `text`·`description` 둘 다 **모든 유형에서 무조건 생성**되므로 결속 누락 경로가 없다 ✅.
- 선례 동형: `buildInput` 의 `Password Icon` `:1647~1656` 과 호출·탐색·결속 형태가 같다 ✅.
- 끄면 높이 68 유지: Figma 쪽은 글 자리 `minHeight=44` + `sizing/44` 바인딩(`:1345~1346`) + 상하 여백 12(`:1279~1280`) → 12+44+12=68 (코드 도출).
  웹 쪽은 **직접 실측**: `matrix-fixture.html` 을 http 로 띄워 `list-row` **31칸 전수 측정 — 68 이 아닌 칸 0건**(설명 없는 '제목만' 7칸 포함). 스타일시트 5벌 로드 확인.
- ⚠️ 정직 표기: `description` 노드에 결속이 실제로 걸렸는지는 **mock 으로는 증명되지 않는다**(mock 의 `findChild/findOne` 은 stub 을 돌려주고 대입을 삼킨다 — `figma-build-mock.js:236`). 또 facts 스키마에 BOOLEAN 속성 칸이 없어(`booleanProps` 0건, Input 의 Password Icon 도 미기록) **어떤 게이트도 이 결속을 검사하지 않는다.** 코드 대조로만 판정했다.

## 13-3. ④ 검사기 mock 수정 — ✅ PASS (검사 약화 아님, 실측으로 확인)

호출자의 주장("빠져 있던 부품이 검사 대상으로 돌아왔다")을 **직접 실행해 대조**했다. 변경 전 스크립트(`git show HEAD`)와 변경 후 스크립트로 각각 `audit()` 을 돌려 생성된 세트 목록을 비교:

- 변경 전: **52 세트** · 변경 후: **53 세트** · 차이는 정확히 **`List Row` 1건 추가뿐**(나머지 52개 이름 전부 동일, diff 1줄).
- 위반 건수는 양쪽 다 0, ANATOMY 8규칙 결과 불변 → **다른 컴포넌트 결과 변화 0** ✅.
- 왜 빠졌었나(재현 확인): 고정 키라 Agree 의 두 번째 `createSlot` 이 첫 키를 덮어써 `makeSlot`(3617)이 던졌고, 그 예외를 빌더 건별 try/catch 가 삼켜 `threw:null` 인 채 List Row 만 사라졌다. **조용한 실패가 맞다.**
- 키 이름은 ANATOMY 판정에 쓰이지 않는다(노드 **이름**만 본다) — 키 형식 변경이 판정 기준을 건드리지 않음 ✅. 생성기 mock(`figma-build-mock.js:171~178`)과 같은 일련번호 방식 ✅.
- 🟡(b) 이월 관찰 — 이번 변경 탓이 아님: 빌더 예외를 삼키고 `threw` 가 경고에 그쳐 **컴포넌트가 통째로 사라져도 Gate 11 이 통과한다.** 세트 개수/목록을 고정 기대치와 대조하는 장치가 없다. 같은 유출이 재발할 수 있다.

## 13-4. 4면 일치(계약↔정본↔facts↔배포본) — ✅ PASS

| 면 | 왼쪽 칸 | 그림 | 오른쪽 칸 | 설명 보임 |
|---|---|---|---|---|
| 정본 | `:1307` Pick·Agree | `:1328` Thumb | `:1390` Nav·Value·Agree·Switch | `:1415` 21칸·기본 true |
| 계약 `registry/components/list-row.json` | `slots[0]` appliesTo pick·agree · webPart `lead` | `slots[1]` thumb | `slots[2]` nav·value·agree·switch · webPart `trail` | `booleanProps[0]` default true |
| facts | `slots:["그림","오른쪽 칸","왼쪽 칸"]` · anatomy 4 | 〃 | 〃 | **스키마에 칸 없음** |
| 배포본 manifest(src=dist) | `parts:lead` · typeStructure pick·agree | thumbnail | trail(슬롯) 4유형 | `description` 선택 part 로 표현 |

- facts anatomy 에서 `control`·`trail` 이 빠지고 슬롯 이름이 들어온 것은 **슬롯 안으로 한 겹 들어간 결과**로 정합 ✅(facts anatomy 는 루트 직계만 기록).
- `component-facts.json` diff 는 List Row 블록 + sourceHash 뿐 — 다른 컴포넌트 파생 영향 0 ✅.
- 배포본 CSS: `lead`/`trail` 에 `max-height: var(--sizing-44)` + `overflow:hidden` + `:empty{display:none}` ✅. **실측**: lead 를 비우면 `display:none`·폭 0 이 되고 줄 높이는 **68 → 68 그대로** ✅.

## 13-5. ❌(a) — 승인 인용이 river 의 승인 발화가 아니다 (2건)

**(a-1) Gate 34 `componentprop:설명 보임` 의 인용문이 '질문'이다.**
`registry/governance/canon-additions-baseline.json` 의 해당 승인 기록:

```
"quote": "글자도 지금은 한줄인데 두줄로 넣는 경우도 있거든 여기도 슬롯으로 하는게 나을까?"
"evidence.at": "2026-09-22T04:35:46.353Z"
```

이 발화는 세션 기록에 실재하지만(그래서 Gate 34 는 통과한다 — `canon-addition-check.js:231 findHumanQuote` 는 **실재 여부만** 본다) **승인이 아니라 river 가 던진 질문이고, 문면상 오히려 "슬롯으로 할까?" 쪽이다.** 실제 승인 발화는 44초 뒤의 **"A로 넣어줘"(2026-09-22T04:36:30.272Z)** 이며, 그 직전 제시된 선택지 (A)=켜고 끄는 스위치가 맞다(세션 기록 04:35:57 어시스턴트 메시지에서 확인). 즉 **결정 자체는 정당하고, 기록만 엉뚱한 발화를 가리킨다.** H6② 가 막으려는 것이 정확히 이 지점이므로 관대하게 넘기지 않는다.
→ 조치: `--reapprove --item "componentprop:설명 보임" --by river --quote "A로 넣어줘"`.

**(a-2) CSS 주석이 river 가 하지 않은 말을 인용한다(3곳).**
`ui-library/src/components/list-row/list-row.css`(및 동일 내용의 dist·합본):

- `river 2026-09-22 "왼쪽 칸도 슬롯으로 바꿔줘"` (슬롯 주석)
- `river 2026-09-22 "오른쪽 칸도 슬롯으로 바꿔줘"` (trail 주석)
- `river 2026-09-22 "비면 자리가 사라져야"` (`:empty` 주석)

세 문장 모두 세션 기록의 river 발화에 **없다**(전수 대조). 실제 발화는 **"둘 다 슬롯으로 바꿔줘"** 하나뿐이고, 빈 칸 접힘은 river 가 말한 적 없는 구현 판단이다.
→ 조치: 세 인용을 `"둘 다 슬롯으로 바꿔줘"` 로 바로잡거나 인용을 빼고 사실만 적는다. `:empty` 접힘은 인용 대신 근거 없는 판단임을 밝히거나 needs-decision.

두 건 모두 **코드 동작에는 영향이 없다** — 기록·근거의 정확성 문제다.

## 13-6. 기존 코드 훼손 없음 — ✅ PASS

- 슬롯 래핑으로 노드 구성은 한 겹 깊어졌을 뿐, 치수·토큰·기본 내용 불변. 웹 31칸 실측 68 전부 유지.
- 구 CSS `> [data-s1-component="checkbox"]{flex:none}` 는 `[data-s1-part="lead"]{flex:none …}` 으로 **자리를 승계**(체크가 lead 안으로 들어갔으므로 정합) ✅.
- 12차에서 PASS 한 항목 중 **이번에 재확인하지 않은 것**(지문 동일·규칙 추가 없음으로 승계): 지문·번호 정합 3종, img/svg 자리표시 실측, 12-4 🟡 이월 3건.

## 13차 판정 요약

| 항목 | 결과 |
|---|---|
| 1. 슬롯 3개 생성·유형·선례 동형 | ✅ PASS |
| 2. 설명 보임 21칸 결속·기본 true·높이 68 | ✅ PASS (게이트 미보호는 정직 표기) |
| 3. mock 수정이 검사 약화 아님 | ✅ PASS (52 vs 53, 차이 = List Row 뿐) |
| 4. 4면 일치 | ✅ PASS |
| 5. Gate 34 승인 인용 | ❌ **FAIL** — 설명 보임 인용이 승인 발화 아님 |
| 6. 훼손 없음·68 유지(31칸 실측) | ✅ PASS |

- ❌(a): **2건**(13-5) · ❓(c): 0건 · 🟡(b): 1건 신규(13-3 예외 삼킴) + 이월 4건 · BLOCKED: 0건
- 미검증(정직 표기): **Figma 실물 캔버스**(MCP 연결 불가 — 슬롯 거동·BOOLEAN 결속은 코드·선례 대조로만 판정) · BOOLEAN 결속을 검사하는 기계 장치 부재.

## 13차 한 줄 판정 — **fail**

코드는 통과, **승인·인용 기록 2건이 river 의 실제 말과 어긋나** Gate 13 기록을 실행하지 않는다 — 인용 2건을 바로잡고 재검증하면 pass 로 뒤집힌다.

---

# 14차 — 13차 ❌ 2건 정정 확인 + 0.12.5 재생성 (델타 재검증)

검증자: 🤖 component-verifier(시나리오 D) · 2026-09-22 · 범위: 13차 ❌ 2건 + 그 정정이 닿은 범위(캐논 승인 기록 · CSS 주석 · 재생성된 배포본). 나머지는 13차 판정 승계.
기계검사 표 10건 선행(전부 exit 0). 위조 방지 재실행 5건 — `components:anatomy`·`ui:build:check`·`ui:contract`·`canon:check`·`ui:version` **전부 exit 0**.

## 14-1. ① Gate 34 인용 정정 — ✅ PASS (방식도 적절하다)

정정 후 기록(`registry/governance/canon-additions-baseline.json`, `componentprop:설명 보임`):

- `quote` = **"글자도 지금은 한줄인데 두줄로 넣는 경우도 있거든"** — river 실제 발화(04:35:46)의 **서술 부분**이며, 13차에 문제 삼은 `"…슬롯으로 하는게 나을까?"` 라는 **질문 꼬리가 빠졌다.** 더는 "질문을 승인으로 둔갑"시키지 않는다.
- `reason` 이 경위를 스스로 밝힌다 — "river 가 선택지 (A) 스위치를 골랐다(직후 발화 'A로 넣어줘', 8자 미만이라 직전 맥락 발화를 인용)". 읽는 사람이 **진짜 승인 발화와 그 시각을 바로 추적**할 수 있다.
- `reapprovedAt` 2026-09-22T04:46:34 기록 ✅.

**8자 제한이 핑계가 아닌지 직접 확인했다** — `scripts/canon-addition-check.js:234` 에 `if (needle.length < 8) return {ok:false,…}` 가 실재한다. `"A로 넣어줘"` 는 공백 정규화 후 6자라 검사기가 구조적으로 받지 못한다. 회피가 아니라 도구의 한계다.

**판정: 이 방식을 받는다.** 규칙이 요구하는 것은 ①인용이 사람 발화로 실재할 것 ②승인이 있었음을 사람이 확인할 수 있을 것인데, 둘 다 충족하고 **부족분을 감추지 않고 드러내는 형태**다. 내가 새 규칙을 만들지 않는다(H6②).

- 🟡(b) 신규 — 이번 정정 탓이 아니라 도구 한계: 짧은 승인어("A로", "좋아", "그렇게 해")는 8자 제한에 걸려 **가장 명확한 승인일수록 인용으로 쓸 수 없다.** 지금은 `reason` 에 적는 우회가 유일한 길이고, 그 칸은 검사기가 대조하지 않는다. `quoteContext`/`decisionQuote` 같은 칸을 두어 짧은 승인어를 시각과 함께 검증하게 하는 개선을 river 에게 별건으로 올릴 만하다.
- 왼쪽 칸·오른쪽 칸 두 건은 13차에서 이미 `"둘 다 슬롯으로 바꿔줘"`(실재·04:33:50) 로 정합 — 이번에 변경 없음, 재확인만 했다 ✅.

## 14-2. ② 가짜 인용 3건 — ✅ PASS (저장소 전수 0건)

저장소 전수 검색(`node_modules`·`.git` 제외, 이 검증 장부 자신은 제외 — 13차 지적문에 원문이 인용돼 있어서다):

| 없어져야 할 문구 | 잔존 |
|---|---|
| `"왼쪽 칸도 슬롯으로 바꿔줘"` | **0건** |
| `"오른쪽 칸도 슬롯으로 바꿔줘"` | **0건** |
| `"비면 자리가 사라져야"` | **0건** |

- `list-row.css:68`·`:166` → 실제 발화 `river 2026-09-22 "둘 다 슬롯으로 바꿔줘"` 로 교체 ✅.
- `list-row.css:114` → 인용을 없애고 **"river 가 말한 규칙이 아니라 구현 판단 — 빈 자리가 여백으로 남지 않게"** 로 다시 씀 ✅. 내가 요구한 그대로, 근거 없는 판단임을 밝힌다.
- `:177` 의 `(river 2026-09-22)` 는 날짜 표기일 뿐 인용부호가 없다 — 없는 말을 붙이지 않았다 ✅.
- src·dist·합본(`s1-ui.css`) 3벌 동일(파일 비교 결과 차이 0) ✅.

## 14-3. 0.12.5 재생성 — ✅ PASS

- `ui-library/package.json` **0.12.5** · 부품 manifest `sourceFingerprint` 갱신(`f29830fa…`) ✅.
- **`canonicalFingerprint` 은 13차와 동일(`6b8196d3…`)** — 이번 정정이 정본(`build-components.ts`)을 건드리지 않았다는 기계적 증거다. `component-facts.json` 의 `sourceHash` 도 `65c9c606d72d` 그대로 ✅. 정본 무변경 → 13-1·13-2·13-4 의 정본 측 판정은 **지문 동일로 승계**한다.
- src↔dist 부품 manifest 차이는 `sourceFingerprint` 한 줄뿐(빌드가 넣는 값) · CSS 는 완전 동일 ✅.
- **재실측**: 재생성된 `matrix-fixture.html` 을 http 로 띄워 `list-row` **31칸 전수 — 68 아닌 칸 0건**(스타일시트 5벌 로드 확인). lead 를 비우면 `display:none` 이 되고 줄 높이는 **68 → 68** 유지 ✅.

## 14-4. 이번에 재확인하지 않은 것(13차 PASS 승계)

정본 지문 동일 · 검사 규칙 추가 없음 · 변경 범위가 기록/주석/재생성에 한정되므로 아래는 **승계**한다(이번에 다시 재지 않았다):

- 슬롯 3개의 생성·유형 배치·선례 동형(13-1)
- `설명 보임` 21칸 결속·기본 true(13-2 코드 대조분)
- mock 수정이 검사를 약화하지 않음(13-3 · 52 vs 53 실측)
- 4면 일치 표(13-4) — 단 배포본 면은 14-3 에서 재생성본으로 다시 확인했다

## 14차 판정 요약

| 항목 | 결과 |
|---|---|
| ① Gate 34 인용 정정(방식 포함) | ✅ PASS |
| ② 가짜 인용 3건 제거(저장소 전수) | ✅ PASS |
| 0.12.5 재생성·지문·src=dist | ✅ PASS |
| 재실측 31칸 68 · 빈 슬롯 접힘 | ✅ PASS |
| 기계검사(재실행 5건) | ✅ exit 0 |

- ❌(a): **0건** · ❓(c): **0건** · 🟡(b): 6건(이월 4 + 13-3 예외 삼킴 + 14-1 짧은 승인어) · BLOCKED: 0건
- 미검증(정직 표기): **Figma 실물 캔버스**(MCP 연결 불가 — 슬롯 거동·BOOLEAN 결속은 코드·선례 대조로만) · **BOOLEAN 결속을 검사하는 기계 장치 부재**(mock 이 대입을 삼키고 facts 스키마에 칸이 없다).

## 14차 한 줄 판정 — **pass**

13차 ❌ 2건이 모두 실제로 해소됐고 새 어긋남이 없다 — **Gate 13 검증 기록을 실행하고 커밋해도 된다.** 남은 🟡 6건은 판정을 막지 않으며, 그중 2건(빌더 예외 삼킴 · 짧은 승인어 인용 불가)은 별건으로 river 에게 올릴 값이 있다.
