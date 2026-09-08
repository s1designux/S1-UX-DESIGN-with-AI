# 7. 설치기 제자리 갱신(upsertSet) 독립 검증 — 시나리오 (D)

- 검증자: 🤖 component-verifier (독립 · 구현 금지)
- 대상: `plugins/figma-vars-installer/src/build-components.ts` **워킹트리**(4회차에 새로 읽음 — 줄번호는 3회차와 다르다)
- 기준선: `git show HEAD:` — 검증자 직접 대조로 진위 확인(`md5 be5470815e9df8cb12247e8f90fdaa4e` = `scratchpad/base-src/build-components.ts`)

| 회차 | 판정 | 요지 |
|---|---|---|
| 1회차 | FAIL | 제거된 fresh 노드 접근(치명) 외 |
| 2회차 | FAIL | description 이식 · 개명 시 조용한 연결 파괴 · anchor 밴드 오염 |
| 3회차 | FAIL | 포기 시 동명 세트 2개 · 옛 떠있는 라벨 잔류 · `set.x` 상대좌표 |
| 4회차 | FAIL | ❌(a) 3건 — **"갱신 시 옛 시트는 이미 옳다"는 전제가 코드와 다르다.** 3회차 ❌ 3건은 전부 해소됨 |
| 5회차 | HOLD | 4회차 ❌ 3건 **전부 해소 ✅**. ❌(a) 0건. 그러나 ❓(c) 2건 — `adoptInto` 의 Figma 런타임 결과(자식 전면 교체 · AUTO 프레임 resize)가 코드 판독으로 결론나지 않는다. **갱신 경로 실행 여전히 0회** |
| **6회차** | **HOLD** | 5회차 ⚠️1·⚠️2·⚠️3 **전부 해소 ✅** · ❓c2(AUTO 프레임 resize) **코드로 소멸 ✅** · 표식(pluginData) 전환 **설계상 안전 ✅**(모호하면 멈춤). ❌(a) 0건. 그러나 ❓c1(인스턴스 오버라이드 보존) **여전히 미관측** — 실물 실행이 있었으나 그 항목만 관측 창이 닫혔다 |

> **범위 한계(4회차에도 동일):** **갱신 경로는 여전히 실행 0회.** mock 의 `currentPage.findAll` 이 배열을 돌려주지 않아 `existing` 이 늘 비고 `refreshing` 이 참이 되지 않는다. 아래는 **코드 판독** 범위다.

## 기계검사 (검증자 재실행 · 종료코드만 확인)

| 검사 | 결과 |
|---|---|
| `npm run installer:check` | exit 0 |
| `compare.js bak` / `compare.js now` | exit 0 / exit 0 · `digest-bak.json` ≡ `digest-now.json` (md5 `f2c86fb1…`) |
| 기준선 진위 | `base-src` md5 = `git show HEAD:` md5 ✅ |

---

## 3회차 ❌ 3건 — 전부 해소 ✅

| 3회차 ❌ | 이번 처리 | 판정 |
|---|---|---|
| ❌1 포기 경로가 동명 세트를 하나 더 만든다 | 포기 시 `combineAsVariants` 를 부르지 않고, 이번에 그린 `comps` 를 스스로 제거한 뒤 `throw` → 컴포넌트별 catch 가 `failed` 로 집계. 기존 세트 무변경 | ✅ 해소 (동명 세트 2개 경로 없음) |
| ❌2 옛 떠있는 라벨·밴드 잔류 | 갱신 경로가 **아무것도 지우지 않고 아무것도 그리지 않는다** → 새 라벨이 생기지 않으므로 잔류·중복 자체가 없음 | ✅ 해소 |
| ❌3 `set.x = OX` 가 섹션 자식에서 상대좌표 | 대입을 `if (!SPEC_SUPPRESSED)` 로 건너뜀 (`decorateSetGrouped`·`buildInput` 둘 다) | ✅ 해소 |
| ⚠️1 `degraded` 재사용이 경고를 설치 실패로 승격 | `REFRESH_NOTES`/`degraded` 사용 삭제, 실제로 갱신되지 않았으므로 `failed` 로 보고 — 의미가 맞다 | ✅ 해소 |

`grep anchor` 0건 · 재귀 삭제 코드 0건도 재확인했다.

---

## ❌1 (a·치명) 갱신이 **세트 안 variant 격자를 (0,0) 으로 무너뜨린다** — "아무것도 움직이지 않는다"가 성립하지 않는다

`adoptInto` 4) 는 조건 없이 실행된다:

```ts
// 4) 세트 안에서의 자리(variant 격자 좌표)는 새로 계산된 값을 따른다.
try { old.x = fresh.x; old.y = fresh.y; } catch (e) { /* skip */ }
```

`buildInput` 은 **fresh 컴포넌트에 좌표를 한 번도 주지 않는다**(`comps` 생성 구간 전체에서 `.x=`/`.y=` 대입은 `hoverBg` 뿐 — 직접 확인). `figma.createComponent()` 는 (0,0) 에 만들어지므로 **fresh 56개는 전부 (0,0)** 이다.

- 종전 코드에서 이 대입이 무해했던 이유는 **직후 `decorateSetGrouped → floatingEmit.cell` 이 56칸을 격자 좌표로 다시 놓았기 때문**이다(3회차 ⑥ 에 그렇게 기록했다). 이번 설계가 바로 그 재배치를 껐다.
- 결과: 갱신 1회로 기존 56개 variant 가 전부 세트 안 같은 자리에 겹친다. 세트는 그 경계로 줄어들고, **캔버스에 떠 있는 옛 그룹라벨·밴드·헤더는 옛 좌표에 그대로** 있으므로 라벨과 내용이 완전히 어긋난다.
- `SPEC_SUPPRESSED` 는 `decorateSetGrouped`·`buildGroupedSpec`·`buildInput` 의 `set.x` 만 막고 **`adoptInto` 의 좌표 대입은 막지 않는다.** 갱신 뒤 격자를 되돌리는 패스는 어디에도 없다(레이아웃 패스·`wrapCategoryInSection` 은 최상위 노드를 통째 이동시킬 뿐 세트 자식을 만지지 않는다).

## ❌2 (a) 설계의 근거 전제가 코드와 다르다 — **Light 스펙 시트의 칸은 인스턴스가 아니다**

⭐ 의 근거: "스펙 시트의 칸은 variant 의 **인스턴스**라 원본을 갈아끼우면 저절로 바뀐다."

코드는 두 갈래다.

| 시트 | emit | 칸의 실체 |
|---|---|---|
| Dark (`buildGroupedSpec`) | `frameEmit.cell` = `comp.createInstance()` | 인스턴스 ✅ 전제 성립 |
| **Light** (`decorateSetGrouped`) | `floatingEmit.cell` = **`comp.x = x; comp.y = y`** | **variant 원본 자신** — 인스턴스가 아니다 ❌ |

즉 Light 스펙 시트는 "세트 자신을 격자로 배치하고 그 위에 캔버스 라벨을 띄운 것"이다. 그래서 ①전제가 절반만 맞고 ②그 절반이 ❌1 의 원인이다. **이 설계의 근거 문장(주석 `SPEC_SUPPRESSED` 선언부)은 사실과 다르므로 주석도 함께 고쳐야 한다.**

## ❌3 (a) orphans 그물이 **정본 변경 3종을 못 잡는다** → 시트가 조용히 낡거나 결손된다

"이름이 하나라도 다르면 갱신을 포기하므로 시트는 이미 옳다"는 보증은 `orphans = 기존 ∖ 정본` 이 잡는 변경에만 해당한다. 다음은 `orphans=[]` 로 통과해 **갱신이 진행되는데 시트는 안 고쳐진다**:

1. **variant 추가**(사이즈·상태·Message 축 값 추가). 기존은 전부 짝이 있으므로 통과 → 새 variant 는 `prev.appendChild(fresh)` 로 붙지만 **시트에는 칸도 열/행 헤더도 생기지 않고**, 그 노드는 (0,0) 에 놓여 다른 variant 와 겹친다.
2. **표시 문구 변경** — 시트의 행 라벨은 variant 이름이 아니라 `buildInput` 의 `groups[].name`("기본"·"안내메시지")과 `opts.title` 에서 나온다. 이 문구를 정본에서 바꿔도 orphans 는 0 이고 옛 라벨이 그대로 남는다.
3. **시트 기하 변경** — `cellW`·`cellH`·`rowLabelW`·`offsetX`(=`INPUT_SHEET_X`) 를 바꿔도 갱신 경로는 반영하지 않는다.

`colHeaders`(=State) 와 platform/size 는 variant 이름의 일부라 그물에 걸린다 ✅ — 걸리지 않는 것은 위 3종이다.

---

## 판정 요청 항목별 답

**② `SPEC_SUPPRESSED` 수명** — **현재 목록(`REFRESH_IN_PLACE = {"Input"}`)에서는 정확하다.** 컴포넌트마다 `run` 직전 false, `upsertSet` 이 adopt 할 때만 true. 예외로 빠져나가도 다음 컴포넌트가 `run` 전에 다시 false 로 만든다. `buildInput` 은 중첩 세트를 만들지 않는다(직접 확인). 다만 **목록을 넓히는 순간 깨지는 구조** ⚠️:
- 스킵 경로가 `setSpecSuppressed(false)` **앞에서** `continue` 한다 — 지금은 무해(스킵은 빌드를 안 함)하나 상태가 반복문 사이로 샌다.
- 중첩 빌드(부모가 자식 세트를 만드는 경우)에서 **자식이 adopt 하면 그 시점부터 부모의 시트 그리기까지 꺼진다.** 되돌리는 지점이 없다.
- `LAST_ADOPTED` 도 전역 1개다 — 중첩 `upsertSet` 은 부모의 맵을 지워 부모의 `adoptedNode()` 가 죽은 참조를 돌려준다(1회차 치명 결함의 재발 경로).

**③ 조기 반환 `opts.originY`** — 호출부 계약("반환=최하단 Y")과는 **어긋나지만**(최하단이 아니라 최상단을 돌려준다) 현 호출부에서는 무해하다: `buildInput` 은 두 값의 max 를 그대로 반환하고, 루프는 갱신일 때 `regionBottom(name) ?? res.bottomY` 를 쓴다. **`catY` 전진의 겹침 위험은 낮다** — 갱신 실행에서 나머지 컴포넌트는 전부 skip 이고, 갱신은 새 노드를 그리지 않는다. ⚠️ 단 `regionBottom` 은 `topNodes`(페이지 최상위 자식)만 훑으므로 **Input 이 SECTION 안에 있으면 null** → `catY = catY + 140` 로 거의 전진하지 않는다(무해하지만 의도와 다름).

**④ throw 경로 정리** — **충분하다** ✅. `buildInput` 이 이번 실행에 만드는 노드는 전부 `comps` 의 자손이다(field·lead·trail·action·hoverBg·아이콘 인스턴스·텍스트 모두 `appendChild` 로 붙는다 — 페이지에 남는 별도 노드 없음). `for (const c of comps) c.remove()` 로 함께 사라진다. 바깥 catch 의 id 스냅샷 정리는 **footprint 이름을 가진 최상위 노드**만 지우므로 fresh comps(`Size=…` 이름)와 겹치지 않는다 — 이중 삭제·충돌 없음 ✅. 예외 문구가 UI 로 흐르는 경로(`failed` → `componentFailed`)도 정상.
⚠️ 부작용 1건(river 인지 필요): `failed` 는 `componentProblems` 에 합산돼 **`updateFlow` 에서는 설치 전체가 예외로 끝나고**(`code.ts:1044`) 완료 도장도 찍히지 않는다. 개명이 있는 한 검수 탭이 "최신 가이드가 아닙니다"로 남는다. 3회차의 `degraded` 오용보다 **의미는 정확**하지만(그 컴포넌트는 실제로 갱신되지 않았다) 결과는 같다.

**⑤ 갱신 시 시트가 옳게 남는가** — **아니다.** ❌1·❌2·❌3 이 그 답이다. `cellAt` 이 넘긴 노드로 Light 는 `comp.x/y` 대입(원본 이동), Dark 만 `createInstance()`. 그리고 `createInstance` 는 **옛 설치 때** 옛 variant 노드로 만들어졌고 그 노드는 adopt 로 살아남으므로 **Dark 시트의 칸 내용은 실제로 따라 바뀐다** ✅ — 전제가 성립하는 곳은 거기까지다.

**⑥ 목록 밖 48개 세트 무변경** — ✅ 성립. 신규 설치 경로는 `SPEC_SUPPRESSED=false`·`REFRESH_TARGETS` 미포함이라 종전과 동일 코드를 탄다. digest 도 byte-identical. **단 digest 에 좌표는 없다** — 좌표 무변경은 코드 판독(진입 조건이 `refreshing`)으로만 확인했다.

**나머지 ⚠️ (유지)**
- `ensureComponentProperty` 가 이름만 보고 **타입·기본값 표류를 검사하지 않는다**(2·3회차 유지).
- 갱신인데도 `added.push(name)` + `created += 56` — 완료 화면이 "Component Set 추가: Input(variant 56개)"로 거짓 보고한다(3회차 ⚠️3 유지).
- `figma.variables.getVariableById` 동기 API 단독 사용(dynamic-page 전환 시 바인딩이 조용히 사라질 수 있음).

---

## 남은 것 (FAIL 사유)

1. **❌1** `adoptInto` 의 `old.x/old.y = fresh.x/y` 가 갱신 시 variant 격자를 (0,0) 으로 무너뜨린다. 갱신에서는 좌표를 옮기지 않거나, 시트를 안 그리더라도 **격자 배치만은 다시 적용**해야 한다 — 어느 쪽을 택할지는 구현자 판단.
2. **❌2** 설계 근거("칸은 인스턴스")가 Light 시트에는 성립하지 않는다. 근거 주석과 설계를 함께 고쳐야 한다.
3. **❌3** variant 추가·표시 문구 변경·시트 기하 변경은 orphans 그물에 안 걸려 시트가 조용히 낡거나 결손된다. 이 3종에서는 갱신을 포기하거나 시트를 다시 그려야 한다.
4. **갱신 경로 실행 0회** — 위를 고친 뒤 **Figma 사본 파일에서 실제 1회 설치**해 ①variant key 동일성 ②인스턴스 연결 유지 ③세트·시트·라벨의 실제 배치를 관측해야 한다. 코드 판독은 여기까지가 한계다.

## Gate 13 기록

❌(a) 3건이 남았으므로 `installer-build-verify-check.js --record` **기록하지 않았다.**

---

<details>
<summary>3회차 보고 원문 (보존)</summary>

# 7. 설치기 제자리 갱신(upsertSet) 독립 검증 — 시나리오 (D)

- 검증자: 🤖 component-verifier (독립 · 구현 금지)
- 대상: `plugins/figma-vars-installer/src/build-components.ts` 워킹트리
- **3회차 기준선: `git show HEAD:` (HEAD=`88fa03b`, 그 앞 `28be850` 이 정본 보강 4건을 커밋)** — 2회차 기준선(index)과 다르다. 2회차 보고의 줄번호는 전부 무효.
- 기준선 진위: 검증자가 직접 대조 — `git show HEAD:…build-components.ts | md5` = `be5470815e9df8cb12247e8f90fdaa4e` = `scratchpad/base-src/build-components.ts` md5. `base-src` 의 나머지 10개 파일도 HEAD 와 md5 동일. `upsertSet` 0건 ✅
- **3회차 판정: FAIL** — ❌(a) 3건 / ⚠️ 4건. (1·2회차 지적은 **전부 해소**됐고, 이번 ❌ 3건은 **anchor 삭제·안전장치 추가가 새로 만든 것**이다.)

> **범위 한계(3회차에도 동일):** **갱신 경로는 여전히 한 번도 실행되지 않았다.** mock 의 `currentPage.findAll` 은 배열이 아니라 스텁을 돌려주므로(`scripts/lib/figma-build-mock.js:233`) `existing` 이 항상 비고 → `refreshing` 이 참이 되는 일이 없다. 아래 판정은 **코드 판독** 범위이며, ❌3 은 **Figma 실행 관측이 있어야 확정**된다(사유는 해당 항목에 명시).

---

## 회차별 지적 ↔ 처리

| 회차 | 지적 | 이번 처리 | 3회차 판정 |
|---|---|---|---|
| 1회차 ❌1 | 제거된 fresh 노드 접근(치명) | `comps` 제자리 치환 + `adoptedNode()` + `cells[].comp` 재지정 — 새 HEAD 위에 **재적용됨** | ✅ 해소 |
| 1회차 ⚠️2-a | 숫자 Variable 바인딩이 리터럴로 죽음(H2) | `adoptInto` 2-b 재바인딩 재적용 | ✅ 해소 |
| 1회차 ⚠️2-b | `explicitVariableModes` 대입 무효 | ADOPT_PROPS 제외 + `setExplicitVariableModeForCollection` 재적용 | ✅ 해소 |
| 1회차 ❌6 | 스펙 시트 중복 | 갱신 시 `page.findAll` 재귀 삭제 재적용 | ✅ 프레임분 해소 (라벨분은 ❌2 로 승계) |
| 2회차 ❌A | `description`·`documentationLinks` 이식이 사람이 쓴 설명을 지움 | **ADOPT_PROPS 에서 제거** + 금지 사유 주석 | ✅ 해소 — 목록 전수 재확인, 두 항목 0건 |
| 2회차 ❌5 | anchor 복원이 섹션 y밴드를 넓혀 이웃을 흡수 | **anchor 복원 코드 통째 삭제**(`grep anchor` 0건) | ✅ 세트 자신은 해소 — 단, **떠있는 라벨이 옛 좌표에 남아 같은 사고를 재현**(❌2) |
| 2회차 ⚠️ | variant 개명 시 보호가 조용히 0 | `orphans` 안전장치 + `REFRESH_NOTES` → `degraded` 보고 | ⚠️ 논리는 옳으나 **포기 경로가 세트를 중복 생성**(❌1) |
| 2회차 ⚠️4 | `ensureComponentProperty` 타입/기본값 표류 미검사 | 미수정 | ⚠️ 유지 |

**재적용 누락 점검:** `git diff HEAD` 3개 훅(헬퍼 블록 · `buildInput` · `buildAllComponents` 2곳) 184줄 추가 / 7줄 삭제. 1·2회차가 요구한 수정 8건이 모두 실물로 존재함을 개별 확인했다. **누락 0건.**

---

## ❌1 (a) 신규 — 갱신을 포기하면 **"Input" 세트가 2개**로 남는다 (종전 동작과 비동치)

`upsertSet` 의 포기 경로는 `figma.combineAsVariants(comps, …)` 로 **새 세트를 만든다.** 그런데 갱신 대상일 때 `buildAllComponents` 는 세트 자신을 삭제하지 않는다(설계상 당연 — 갱신할 대상이니까):

```ts
const dead = new Set(footprint(name).filter((f) => f !== name));   // ← 세트 이름 제외
```

즉 **옛 세트가 캔버스에 그대로 남은 채 같은 이름의 새 세트가 하나 더 생긴다.** 이후 어디에도 동명 세트를 정리하는 패스가 없다(`removeByNames` 는 이 경로에서 호출되지 않고, 2단계 relocate·wrap 은 삭제를 하지 않는다).

- 주석·설계 설명의 **"종전대로 새로 만든다"는 성립하지 않는다.** 종전(스킵)은 세트가 1개였고, 종전(신규 생성)은 `removeByNames` 로 옛 것을 지운 뒤 1개를 만들었다. 이 경로만 **2개**를 남긴다.
- 파급 ①: 라이브러리에 같은 이름 컴포넌트 세트가 2개 게시된다(디자이너가 어느 쪽을 집을지 모른다).
- 파급 ②: 다음 설치의 `findSetByName` 은 `findAll[0]` 을 집으므로 **어느 쪽이 갱신될지 비결정적**이다. 새 세트를 집으면 옛 세트(=실제 인스턴스가 물린 쪽)는 영원히 방치된다.
- 파급 ③: 옛 세트는 **직전 설치 좌표**에, 새 세트·스펙 시트는 **이번 catY** 에 놓인다. 둘 다 `footprint` 이름이라 `wrapCategoryInSection` 의 seedBox 가 두 좌표를 모두 삼켜 y밴드가 벌어지고 **이웃 카테고리 노드를 흡수한다** — 2회차 ❌5 와 같은 사고가 이 경로로 되살아난다.
- **발생 확률이 낮지 않다.** orphans 는 개명뿐 아니라 **variant 삭제**로도 1 이상이 된다. 이번 세션 자신이 `State=Editing → Focus` 개명을 했다 — 즉 이 경로는 "예외"가 아니라 정본을 손댈 때마다 밟게 되는 길이다.

## ❌2 (a) 신규 — 옛 "떠있는 라벨·밴드"가 지워지지 않아, anchor 삭제가 옮긴 세트와 **따로 논다**

갱신 경로가 지우는 것은 `Input — Spec Light/Dark` **프레임뿐**이다. `decorateSetGrouped → floatingEmit` 이 만드는 그룹라벨(TEXT)·밴드(RECTANGLE)는 footprint 이름이 아니라 삭제 대상에 들지 않는다(2회차 ⚠️6 의 남은 절반).

anchor 를 삭제하면서 이 결함의 성격이 바뀌었다:

- 종전(2회차 코드): 세트가 옛 좌표로 복귀 → 옛 라벨과 대체로 같은 자리 → "겹쳐 보임".
- 지금: 세트·새 라벨은 **이번 catY** 로 가고 **옛 라벨·밴드는 직전 설치 좌표에 그대로 남는다.** 그 노드들은 이제 다른 카테고리의 y밴드에 걸리므로, `wrapCategoryInSection` 이 **엉뚱한 섹션으로 빨아들인다.**

anchor 삭제로 없애려던 사고(밴드 오염)를 세트가 아닌 **라벨이 그대로 일으킨다.** 갱신을 반복할수록 유령 라벨이 누적된다. 삭제 경로가 이름으로만 동작해서 생긴 구조적 구멍이고(설치기 자신이 `code.ts:1258~1263` 에서 "이름 기반 삭제로는 이 장식을 원리적으로 못 찾는다 → 섹션 통삭제가 유일한 완전 경로"라고 적어 두었다), 갱신은 그 유일한 완전 경로를 쓸 수 없는 경로다.

## ❌3 (a·관측 필요) 신규 — `set.x = OX` 는 **섹션 자식이면 상대좌표**다

`decorateSetGrouped`(`:491`)와 `buildInput`(`:1353`)이 `set.x = OX(4200); set.y = originY` 를 **무조건** 건다. 종전 스킵 경로는 좌표를 아예 건드리지 않았으므로 이 대입은 갱신에서 처음 실행된다.

정상 설치를 마친 파일에서 세트는 **카테고리 SECTION 의 자식**이다 — 설치기 자신이 그 전제 위에 재설치 로직을 짰다(`code.ts:1258~1263`, "섹션을 통째로 지우는 것이 유일한 완전 경로"). 그리고 `wrapCategoryInSection` 이 `appendChild` 직후 `n.x += bx - after.x` 로 절대위치를 보정하는 것은 **재부모화가 좌표계를 바꾼다는 증거**다.

따라서 갱신이 섹션 안의 세트에 걸리면 `set.x = 4200` 은 **section.x + 4200** 이 되어, 이번에 최상위로 새로 그려진 스펙 시트·라벨과 멀리 떨어진다. 게다가 레이아웃 패스와 `wrapCategoryInSection` 은 모두 `children.filter(type !== "SECTION")` 로 **섹션 자식을 보지 않기 때문에** 이 어긋남은 뒤에서 교정되지 않고, 섹션 재사용 시 섹션 자체가 이동·리사이즈되며 안의 세트를 다시 끌고 다닌다.

- **NOT_VERIFIED:** 현재 실파일 Input 노드의 실제 부모는 이번 회차에 읽지 않았다. 2회차는 "x=14032 ≠ SECTION_PAD 64 → 최상위"라고 추정했으나 **이 추정은 근거가 약하다** — Input 만 유일하게 `INPUT_SHEET_X=4200` 에서 빌드되므로 "섹션 자식이면 64" 라는 전제가 Input 에는 성립하지 않고, MCP 가 절대좌표를 돌려줬다면 14032 ≈ (섹션 x) + 4200 과도 정확히 들어맞는다. 어느 쪽인지는 **부모를 직접 읽어야** 판정된다.
- 판정: 코드 전제가 "정상 설치 파일 = 섹션 자식"이므로 결함으로 본다. 다만 확정은 **실행 1회 관측**을 조건으로 한다.

---

## 판정 요청 항목 별 답

**② orphans 판정 논리** — 계산 자체는 **옳다.** `byName` = 기존 세트의 COMPONENT 자식 이름, `freshNames` = 이번 정본이 만든 이름, `orphans` = 기존 ∖ 정본. 정본에 variant 가 **추가만** 된 경우 기존은 전부 짝이 있어 `orphans=[]` → 갱신이 계속되고 새 variant 는 `prev.appendChild` 로 붙는다 ✅. 축(property key) 개명도 variant 이름이 통째로 바뀌므로 이 그물에 걸려, 2회차가 지적한 "빈 세트 → 세트 소멸" 최악 경로는 막힌다 ✅. **비동치인 것은 판정이 아니라 포기 이후의 뒷정리다(❌1).**

**③ `degraded.push({name, missing})` 형식** — 타입은 `{ name: string; missing: string[] }` 과 **일치**하고 `code.ts:1040` → `ui.html:993` 소비 경로도 그대로 흐른다(`esc()` 적용) ✅. 그러나 **의미와 부작용이 맞지 않는다(⚠️1):**
- `ui.html:1001` 은 이 항목을 **"부품이 빠진 채 만들어짐"** 으로 렌더한다 — 개명 때문에 세트를 새로 만들었다는 사실과 다른 말이다. 문장 전체가 `d.missing` 자리에 들어가 `Input(Input: variant 이름이 달라 … 불완전)` 로 보인다.
- `code.ts:1044` 은 `updateFlow` 에서 `degraded>0` 이면 **설치 전체를 예외로 실패시킨다.** 또 `componentProblems===0` 이라야 완료 도장을 찍으므로, 개명이 있는 한 검수 탭이 "최신 가이드가 아닙니다"로 남는다. 경고 채널로 `degraded` 를 빌려 쓴 결과 **경고가 실패로 승격**됐다 — 의도된 것인지 river 확인이 필요하다.

**④ anchor 삭제의 새 문제** — ❌2(옛 라벨이 옛 좌표에 잔류)·❌3(섹션 상대좌표)이 그것이다. 스펙 시트 재귀 삭제와의 상호작용 자체는 무해하다(`dead` = Input 스펙 2종뿐, 이름 충돌 없음) ✅.

**⑤ 목록 밖 48개 세트 무변경** — ✅ **성립**(신규 설치 경로 한정). 검증자가 직접 재실행: `node scratchpad/compare.js bak` / `now` 각각 종료코드 0, 49개 세트 기록, `digest-bak.json` ↔ `digest-now.json` **byte-identical**(md5 `f2c86fb1…`, Input 56 variant 포함). 단 digest 는 세트/variant 이름·props·자식 이름만 담는다 — **좌표·스펙 프레임·라벨은 이 증거에 포함되지 않는다.**

**⑥ 그 밖 — 검사했고 문제 없던 것**(오탐 방지 기록)
- `adoptInto` 4) 의 `old.x = fresh.x` 는 **무해하다.** fresh 는 combineAsVariants 를 안 거쳐 좌표가 전부 (0,0) 이지만, 직후 `decorateSetGrouped → floatingEmit.cell` 이 56칸 전부(PC 3사이즈+Mobile 1 × 2그룹 × 7상태 = 56)를 격자 좌표로 다시 놓는다. 변형 격자가 무너지지 않는다 ✅
- `LAST_ADOPTED` 는 `upsertSet` 진입 시 항상 초기화되어 2회차가 지적한 잔류 오염이 없다 ✅
- 갱신 경로에서 `ensureComponentProperty` 가 기존 키(`Password Icon#…`)를 돌려주고, 자식 `componentPropertyReferences` 는 그 키로 다시 배선된다 ✅
- `REFRESH_NOTES` 는 매 실행 시작에 비워진다 ✅
- 기계검사: `npm run installer:check` 종료코드 **0**(검증자 재실행)

**⚠️ 나머지**
- ⚠️2 `ensureComponentProperty` 는 이름만 보고 **타입·기본값 표류를 검사하지 않는다**(2회차에서 유지).
- ⚠️3 갱신인데도 `added.push(name)` + `created += 56` 이라 완료 화면이 "Component Set 추가: Input(variant 56개)" 로 **거짓 보고**한다. `skipped` 에도 안 잡힌다.
- ⚠️4 `figma.variables.getVariableById` 동기 API 단독 사용(2회차 유지) — 지금 매니페스트에서는 동작하나 dynamic-page 전환 시 try/catch 가 삼켜 바인딩만 조용히 사라진다.
- ⚠️ 배포 산출물: `dist/code.js`(19:56)와 다운로드 zip 에 **FAIL 상태 코드가 이미 빌드돼 있다**(`orphans` 포함, `documentationLinks`·anchor 없음 — 즉 현재 소스와 동일).

---

## 남은 것 (FAIL 사유)

1. **❌1** 포기 경로가 옛 세트를 남긴 채 동명 세트를 하나 더 만든다 → 중복 세트 + 밴드 오염 재발. 포기하려면 **세트를 지우고(=종전 신규 생성과 동치로) 만들거나**, 아예 **그 컴포넌트를 건너뛰어(skipped)** 종전 스킵과 동치로 두어야 한다 — 어느 쪽을 택할지는 구현자·river 판단.
2. **❌2** 옛 떠있는 라벨·밴드가 지워지지 않아 옛 좌표에 잔류 → 이웃 섹션 오염·누적.
3. **❌3** `set.x = OX` 가 섹션 자식에서 상대좌표로 작동할 위험 (실행 1회 관측으로 확정 필요, 현재 실파일 부모는 NOT_VERIFIED).
4. **⚠️1** `degraded` 재사용이 경고를 **설치 실패**로 승격 + UI 문구 불일치 — river 확인 사항.
5. **갱신 경로 실행 검증 0회** — 위를 고친 뒤 **Figma 사본 파일에서 실제 1회 설치**해 ①variant key 동일성 ②인스턴스 연결 유지 ③세트·스펙 시트·라벨의 실제 배치를 관측해야 한다. 코드 판독은 여기까지가 한계다.

## Gate 13 기록

❌(a) 3건이 남았으므로 `installer-build-verify-check.js --record` **기록하지 않았다.**

</details>

---

# 5회차 (2026-09-08) — 판정 **HOLD** (❌(a) 0건 · ❓(c) 2건)

- 대상: 워킹트리 `plugins/figma-vars-installer/src/build-components.ts` (새로 읽음 · `git diff HEAD` 305줄 전량 정독)
- 기준선 진위: `git show HEAD:` sha1 `30afa22b…` = `scratchpad/base-src/build-components.ts` sha1 **일치** ✅
- **범위 한계 (4회차와 동일): 갱신 경로 실행 0회.** mock 의 `currentPage.findAll` 이 배열이 아니라 스텁을 돌려주므로 `existing` 이 늘 비고 `refreshing` 이 참이 되지 않는다(mock `scripts/lib/figma-build-mock.js:233`). 아래는 전부 **코드 판독** 범위다.

## 기계검사 (검증자 재실행 · 종료코드만 확인)

| 검사 | 결과 |
|---|---|
| `npm run installer:check` | exit 0 |
| `compare.js bak` / `compare.js now` | exit 0 / exit 0 · 49세트 · **차이 0** |
| 기준선 진위 | sha1 동일 ✅ |

> digest 는 `x`/`y` 를 IGNORED 로 빼고(`PROP_CLASS`), `width`/`height` 도 `props` 가 아닌 `geometry` 라 담기지 않는다. **좌표·크기 회귀는 이 대조로 잡히지 않는다**(4회차 지적 유지).

## 4회차 ❌ 3건 — 전부 해소 ✅

| 4회차 ❌ | 이번 처리 | 판정 |
|---|---|---|
| ❌1 `adoptInto` 의 `old.x/old.y = fresh.x/y` 로 격자가 (0,0) 붕괴 | 대입 삭제. 4) 는 주석만 남고 `fresh.remove()` 뿐. `SPEC_SUPPRESSED` 로 `decorateSetGrouped`(`set.x/y` + `set.resize` + `floatingEmit.cell` 재배치)와 `buildGroupedSpec` 이 조기 반환, `buildInput` 의 `set.x = OX` 도 가드됨 → **갱신 시 세트·56 variant 좌표를 아무도 건드리지 않는다** | ✅ 해소 |
| ❌3① variant 추가가 그물 통과 | `orphans`(캔버스에만) + `added2`(정본에만) **양방향 집합 비교**, 하나라도 있으면 캔버스 무변경 + 이번에 그린 `comps` 자체 제거 후 `throw`. 문구가 양쪽을 구분해 보고하고 [재설치] 시 연결이 끊긴다는 점까지 알림 | ✅ 해소 |
| ❌2 근거 주석이 사실과 다름 | `SPEC_SUPPRESSED` 선언부 재작성 — Dark=`frameEmit.cell`(인스턴스, 자동 반영) / Light=`floatingEmit.cell`(**variant 원본 자신을 격자에 놓은 것**) 로 정정됨. 코드와 일치 확인 ✅. 커버 못 하는 한계(표시 문구·칸 크기)와 목록 확대 시 재검토 3가지도 명시 | ✅ 해소(단 ⚠️1 참조) |

## 판정 항목별 답

**② 좌표 대입을 지운 결과가 옳은가 — ✅ (조건부)**
`floatingEmit.cell` 이 `comp.x/comp.y` 를 직접 쓰는 구조라 **"Light 시트의 배치 = 세트 내부 variant 격자"** 가 맞다. 갱신 경로에서 `decorateSetGrouped`/`buildGroupedSpec`/`set.x = OX` 가 전부 꺼지므로 기존 56 variant 는 원래 격자에 그대로 있고 `set.resize` 도 호출되지 않는다(세트에 오토레이아웃은 없다).
**단 전제가 하나 있다 — variant 자신의 크기가 그대로여야 한다.** `adoptInto` 는 `old.resize(fresh.width, fresh.height)` 로 크기를 바꾸는데 격자 간격(`cellW=224`, 행 높이 = 행 내 최대 높이+16)은 갱신되지 않는다. Input variant 는 `primaryAxisSizingMode/counterAxisSizingMode = AUTO`(HUG/HUG)라 **여백·폰트·자식 구조를 바꾸면 높이가 바뀐다** → 아래 행과 겹칠 수 있다. 이 경우는 현재 주석의 한계 목록("표시 문구·칸 크기")에 **없다** → ⚠️2.

**③ 양방향 안전장치가 과한가 — ❌ 과하지 않다 ✅**
variant 이름은 `states[].name` · `sizes[].size/brk` · `messages` 만으로 만들어진다(`Size=…, State=…, Message=…, Break=…`). 색 토큰·패딩·`itemSpacing`·아이콘/자식 구조를 바꿔도 이름 집합은 그대로라 **갱신이 계속 수행된다** — 원래 목적(연결 유지한 채 정본 수정 반영)을 여전히 수행한다. 트립하는 경우는 축 개명·축 증감뿐이고 그건 사람이 뜻을 정해야 하는 변경이 맞다.

**④ 남은 ⚠️ 들의 현재 심각도**

| ⚠️ | 심각도 | 근거 |
|---|---|---|
| `regionBottom` 이 SECTION 안이면 null | **중(상향)** | 재설치 시 Input 은 이미 섹션 자식이라 `topNodes`(페이지 직계)에 없다 → 갱신 경로에서 `regionBottom("Input")` 은 **항상 null** → `catY = 직전값 + 140`. 지금은 같은 카테고리의 나머지가 전부 skip 이라 무해하지만, **같은 실행에서 Form Control 에 신규 컴포넌트가 하나라도 생기면**(다른 세션의 assist-button·modal-content 가 그렇다) 그 컴포넌트가 잘못된 Y 에 놓인다 |
| 조기 반환값 계약(`return opts.originY`) | 저 | `bottomY` 가 전진하지 않는 것은 위 `catY` 로만 흘러가고, 그 자리는 이미 `refreshing` 분기가 처리 |
| `failed` 가 설치 전체를 예외로 끝냄 | **저(해소에 가까움)** | `code.ts:1044` 의 throw 는 `options.updateFlow` 일 때만이다. updateFlow 는 **새 페이지**에 설치하므로 `existing` 이 비고 `setRefreshTargets(...filter(existing.has))` 가 빈 집합 → 갱신·포기가 아예 일어나지 않는다. 같은 페이지 [설치](updateFlow=false)에서는 `failed` 1건이 도장(stamp)만 막고 설치는 계속된다 |

## ❓(c) — 사용자/실행 확인이 필요한 것 (HOLD 사유)

**❓c1. `adoptInto` 가 자식을 전면 교체하면 기존 시안 인스턴스의 오버라이드가 어떻게 되는가.**
1) 에서 `old` 의 자식을 **전부 제거**하고 3) 에서 새 노드를 붙인다 → 자식 노드 id 가 전부 새것이다. Figma 인스턴스 오버라이드(placeholder/안내메시지 텍스트 수정, 아이콘 스왑, 하위 레이어 표시 토글)는 **메인 컴포넌트의 하위 노드 id 를 키로** 보관된다. 그렇다면 갱신 후 시안의 Input 인스턴스는 연결(variant key)은 살아도 **하위 오버라이드가 초기값("입력"/"텍스트"/"안내 메세지")으로 되돌아갈 수 있다.** 이는 이 기능의 목적("연결 유지한 채 반영") 자체를 절반 무효화한다. 정본에 근거가 없고 저장소 안에서 결론이 나지 않으므로 **추측하지 않는다** — 사본 파일 1회 실행으로만 확정된다. (컴포넌트 속성 기반인 `Password Icon` 등은 속성 id 가 보존되므로 살아남을 것으로 보이나 이 역시 미관측.)

**❓c2. AUTO(HUG) 프레임에 `old.resize()` 를 부르는 것.**
정본 경로는 Input variant 에 `resize` 를 **한 번도 부르지 않는다**(HUG/HUG). 갱신 경로만 부른다. 게다가 호출 시점이 **자식을 다 뺀 빈 상태**다(1) 제거 → 2) resize → 3) 자식 append). Figma UI 에서 오토레이아웃 프레임의 변을 끌면 HUG→FIXED 로 바뀌는데, Plugin API `resize()` 도 같은지는 이 저장소의 `@figma/plugin-typings`(`plugin-api.d.ts:6299-6312`) 에 **적혀 있지 않다**. 
- 안 바뀐다면: 자식이 붙으면서 다시 hug → **무의미한 호출**(무해).
- 바뀐다면: **56 variant 전부가 고정 크기로 못박힌다** — 갱신 직후 스크린샷으로는 구분되지 않고, 이후 긴 안내메시지 오버라이드가 자라지 않는다.
어느 쪽인지 판독으로 정할 수 없으므로 (c). *(구현자 참고: 값 복사 → `resize` → **사이징 모드 2개를 다시 대입** 순으로 바꾸거나, `fresh.layoutMode` 가 있고 사이징이 AUTO 면 `resize` 를 건너뛰면 이 물음 자체가 사라진다. 검증자는 고치지 않는다.)*

## ⚠️ 새로 적을 것

- **⚠️1** `SPEC_SUPPRESSED` 주석의 *"라벨은 variant 이름에서 나오는데"* 는 **부정확**하다. `colHeaders`(상태명)만 variant 이름과 같은 출처이고, `rowLabels`("기본"/"안내메시지"), 사이즈 헤더("MD·M"), `title` 은 **별도 표시 문자열**이다. 바로 다음 문단의 한계 항목이 같은 사례를 정확히 적어 두어 실질 공백은 없으나, 두 문장이 서로 반대로 읽힌다 → 한 줄 정정 권고.
- **⚠️2** 한계 목록에 **"variant 자신의 크기가 바뀌는 정본 수정(여백·폰트·자식 추가)은 격자 행 간격이 그대로라 아래 행과 겹칠 수 있다"** 가 빠졌다(위 ② 참조). 색만 바꾸는 수정은 무해.
- **⚠️3** 양방향 가드가 `added2` 를 throw 로 막으므로, 그 아래 `else { prev.appendChild(fresh) }`(정본에 새로 생긴 variant 처리)는 **도달 불가 코드**다. 읽는 사람이 "추가가 지원된다"고 오해할 여지 → 삭제하거나 도달 불가임을 명시 권고.
- **⚠️4**(4회차 유지) 갱신인데도 `created += 56` · `added.push("Input")` → 완료 화면이 "추가"로 거짓 보고. `skipped` 에도 안 잡힘.
- **⚠️5**(유지) `ensureComponentProperty` 는 이름만 보고 타입·기본값 표류를 검사하지 않는다.

## ⑤ 목록 밖 48개 세트 무변경

✅ 성립(**신규 설치 경로 한정**). 검증자 재실행: `compare.js bak`/`now` 각 exit 0, 49세트, 차이 0. 단 위 주의대로 digest 에 좌표·크기·스펙 프레임·떠있는 라벨은 없다. 갱신 경로는 mock 이 못 타므로 이 증거의 사정권 밖이다.

## Gate 13 기록

❓(c) 2건이 남아 **HOLD** — `installer-build-verify-check.js --record` **기록하지 않았다.**
해소 경로: ①❓c2 를 코드로 없애거나(무해함이 자명해지게) ②**사본 Figma 파일에서 [설치] 1회 실행**해 (a) variant key 동일 (b) 시안 인스턴스의 텍스트 오버라이드 보존 여부 (c) 56칸 격자 좌표·크기 (d) 스펙 시트 잔류 상태를 관측 → 그 관측 결과로 6회차 판정.

---

# 6회차 (2026-09-08) — 판정 **HOLD** (❌(a) 0건 · ❓(c) 1건)

- 대상: 워킹트리(6회차에 새로 읽음 — 줄번호는 5회차와 다르다). 기준선 `git show HEAD:` = `scratchpad/base-src/build-components.ts` (md5 `be5470815e9df8cb12247e8f90fdaa4e`, 검증자 직접 재대조 ✅)
- **이번 회차의 결정적 차이: 갱신 경로가 실물에서 1회 실행됐다**(5회차까지 실행 0회). 다만 그 실행에서 ❓c1 만 관측 창이 닫혔다.

## 기계검사 (검증자 재실행 · 종료코드만 확인)

| 검사 | 결과 |
|---|---|
| `npm run installer:check` (tsc --noEmit) | exit 0 |
| `compare-geo.js bak` / `now` | exit 0 / exit 0 · 각 5,058 노드 |
| `diff geo-bak.txt geo-now.txt` (이름+x,y,w,h) | **exit 0 — 차이 0** |
| 기준선 진위 | `base-src` md5 = `git show HEAD:` md5 ✅ |

## ① 5회차 지적 ↔ 이번 처리

| 5회차 | 이번 처리 | 판정 |
|---|---|---|
| ❓c2 AUTO(HUG) 프레임에 `resize` | `adoptInto` 가 `primaryAxisSizingMode`/`counterAxisSizingMode` 중 하나라도 `"AUTO"` 면 `resize` 를 부르지 않는다 | ✅ **물음 자체가 소멸.** Input 56 variant 는 VERTICAL·AUTO/AUTO 라 호출 0회. 판정 순서도 옳다 — `auto` 는 ADOPT_PROPS 복사 **뒤** 의 `old` 를 읽으므로 fresh 의 사이징 의도를 본다. FIXED variant 는 종전대로 `resize` (동작 무변경) |
| ⚠️1 "라벨이 variant 이름에서 나온다"가 부정확 | "열 머리글(상태명)만" 으로 정정, 행 라벨·사이즈 머리글·제목은 한계 ①로 이동 | ✅ 해소 |
| ⚠️2 variant 자신의 크기 변화 누락 | 한계 ③ 으로 명시 | ✅ 해소 |
| ⚠️3 도달 불가 `else { prev.appendChild(fresh) }` | 삭제 + "양방향 검사를 통과했으므로 짝 없는 fresh 는 없다" 주석 | ✅ 해소 |
| 5회차 ✅ 항목(1~4회차 지적 전부) | 재적용 누락 없음 — `adoptedNode()`/`cells[].comp` 재지정 · ADOPT_PROPS 에 `description`·`documentationLinks` **0건** · `explicitVariableModes` 는 API 로 이관 · 숫자 Variable 재바인딩(2-b) · `grep anchor` 0건 · `set.x` 가드 · 포기 시 동명 세트 미생성 — 전수 재확인 | ✅ 재적용 누락 0 |

## ② 표식(pluginData) 방식 — **설계상 안전** ✅ (다만 주석 1줄이 사실과 다르다)

| 물음 | 답 |
|---|---|
| `stampCanonSet` 호출 위치가 **갱신·신규 양쪽**을 덮는가 | ✅ 덮는다. 갱신도 신규도 같은 `run()` 을 통과하고, 도장은 `run()` **성공 직후 1곳**(`build-components.ts:7013`)뿐이다 |
| **실패(throw)** 한 컴포넌트에 안 찍히는가 | ✅ 안 찍힌다. throw 는 `run()` 을 빠져나가 `catch` 로 가므로 `stampCanonSet` 에 도달하지 않는다. `ambiguous` 포기·양방향 불일치 포기 둘 다 동일 |
| 표식이 **안 붙는 경로**가 남는가 | ✅ 남는다(설계상 무해). (i) **스킵된 세트** — `existing.has(name) && !refreshing` 은 `continue` 가 도장보다 앞이라 46개는 재설치 때 도장이 안 찍힌다. (ii) **부모가 만든 자식 세트**(`GNB Menu`·`Time Picker Cell`·`Calendar Cell`/`Tile` 의 부모 생성분) — 도장은 `res.set` 하나에만 찍힌다 |
| 그때 다음 설치에서 **이름 폴백**으로 떨어지는가 | ✅ 떨어진다. 그래서 `findCanonSet` 의 이관 분기가 예외가 아니라 **정상 경로**다 |
| 그때 `ambiguous` 로 **안전하게 멈추는가** | ✅ 멈춘다. 표식 ≥2 · 이름 ≥2 어느 쪽이든 `"ambiguous"` → `upsertSet` 이 이번에 그린 `comps` 만 지우고 throw. 기존 세트는 손대지 않는다 |

> ⚠️ **주석 정정 필요(사실 오류).** `build-components.ts:7011` 의 *"49개 세트 전부에 적용된다(호출 지점이 여기 한 곳뿐이라서)"* 는 **전체 삭제 후 재설치 때만** 참이다. 평상시 [설치]에서는 스킵된 세트에 도장이 안 찍히므로 "전부"가 아니다. 기능은 안전하지만(위 표) 다음 사람이 "도장은 다 있다"를 전제로 코드를 고칠 위험이 있다 — 5회차 ⚠️1 과 같은 종류의 결함이다.

## ③ 이관 분기(`byName.length === 1` 에 도장)가 **잘못된 세트를 굳히는가**

- **같은 페이지 안에서는 위험 증가 없음 ✅.** 그 분기는 그 페이지에 그 이름 세트가 **정확히 1개**일 때만 돈다 — 옛 이름 기반 코드가 고르던 것과 같은 노드이고, 그 상황에서는 다른 후보가 존재하지 않는다. 2개 이상이면 도장을 찍지 않고 `ambiguous` 로 멈춘다(실물 사고의 정확한 반대). 복제된 세트는 pluginData 도 함께 복제되므로 표식 ≥2 → 역시 멈춘다.
- **남는 사각지대(신설 아님·전 구간 공통): 페이지 경계.** `findCanonSet`·`existing` 모두 `figma.currentPage` 만 본다. 정본 세트가 다른 페이지에 있고 현재 페이지에 동명 잔재가 1개면 **잔재에 도장이 굳는다.** 다만 설치기 전체가 원래 `currentPage` 기준이므로 이 변경이 만든 위험은 아니다. (관측 아님 — 코드 판독)
- **미세 위험 1건:** `findCanonSet` 은 `findAll` 이 던지면 `null` 을 반환해 **새 세트를 만든다.** `existing`(이름)이 "있다"고 말한 뒤라서, 이때만 동명 세트 2개가 새로 생긴다. 같은 API 가 직전에 성공했으므로 현실성은 매우 낮다(⚠️).

## ④ `ambiguous` throw 가 사용자에게 보이는가 — ✅ 전 구간 확인

`upsertSet` throw → 컴포넌트별 `catch` → `failed.push({name, reason})` → 루프 **계속**(다른 46개 정상 설치) → `code.ts:1038 componentFailed` → `ui.html:998-999` 완료 화면에 **`생성 실패: Input`** 과 **`사유: Input — 제자리 갱신 불가 …`** 원문이 그대로 출력된다. 문구도 사람이 읽고 행동할 수 있는 형태다("쓰지 않는 세트를 지운 뒤 다시 설치하세요 — 기존 세트는 손대지 않았습니다").
⚠️ 단 5회차에 적은 대로 `updateFlow`(검수 탭의 가이드 갱신) 경로에서는 `failed` 1건이 설치 전체를 예외로 끝낸다(`code.ts:1044`). 그 경로는 새 페이지에 설치해 `existing` 이 비므로 갱신·포기가 아예 일어나지 않는다 — 현재 목록에서는 도달 불가.

## ⑤ 목록 밖 46개 세트 무변경 / 새 결함

- ✅ **좌표·크기까지 포함해 5,058 노드 차이 0**(위 기계검사). 검증자가 `base-src` 진위를 md5 로 직접 확인한 뒤 재실행했다.
- 전역 상태 누수 재점검: `SPEC_SUPPRESSED` 는 컴포넌트마다 `run` 직전 `false`(7:6987), `upsertSet` 만 `true` 로 만든다. 루프 종료 후 `true` 로 남더라도 **외부 진입점이 `buildAllComponents` 하나뿐**이고 그 함수가 시작에서 `false` 로 리셋한다(`code.ts` 가 import 하는 것은 `buildAllComponents`·`COMPONENT_CATEGORIES` 뿐) → 세션 간 누수 없음 ✅. `LAST_ADOPTED`/`REFRESH_TARGETS` 도 `Input` 단독이라 중첩 없음 ✅.
- `ensureComponentProperty`·`adoptedNode`·`upsertSet` 은 `buildInput` 외 사용처 0건 ✅.
- **새 결함 0건.**

## ⑥ 실물 관측 3건 ↔ 코드 일관성

| 관측 | 코드와 일관? |
|---|---|
| ① 껍데기 id 유지 · 자식 id 전부 새것 · 정본 색 변경이 반영 | ✅ `adoptInto` 그대로다 — 1) 기존 자식 전부 `remove()` 2) 껍데기 속성/바인딩 이식 3) fresh 자식을 `appendChild` 로 **이동**. 세트를 다시 만들지 않으므로 껍데기 id 는 유지된다. **설계 의도대로 동작함이 실물로 확인됐다** |
| ② 엉뚱한 세트(잔재 2437)를 갱신 | ✅ 첫-번째-선택으로 설명된다. 그 버전의 `findSetByName` 소스는 지금 남아 있지 않지만(워킹트리·`scratchpad/old-src`·`.bak` 전부 0건), **3회차 보고서 자신이 이미 `findAll[0]` 이라 기록하고 "어느 쪽이 갱신될지 비결정적"이라고 예측**해 두었다(이 보고서 160행). 예측과 실물이 일치한다. **그 경로는 지금 닫혔다** — 동명 2개는 `ambiguous` 로 멈춘다 ✅ |
| ③ 전체 삭제 후 재설치 → 47세트·537 variant 실패 0 · 섹션 최대 6,244 · 섹션 밖 0 | ✅ 신규 설치 경로는 이 변경이 만지지 않는다(mock 5,058 노드 차이 0 이 같은 것을 말한다) |

**단, ② 가 닫힌 것은 "갱신 대상 고르기" 한 곳뿐이다.** 같은 종류의 첫-번째-이름-선택이 `getBuiltSet`(`build-components.ts:68` `findOne(name)`)에 그대로 남아 있다 — 동명 세트가 있는 파일에서 **부모 빌더가 잔재 세트의 variant 를 재사용**할 수 있다. HEAD 에도 있던 것이고 이번 변경 범위 밖이지만, "이름으로 고르기"를 표식으로 바꾼 이유가 그대로 적용되는 자리다(관찰).

## ❓(c) — HOLD 사유 (1건)

**❓c1. `adoptInto` 의 자식 전면 교체가 기존 시안 인스턴스의 오버라이드를 보존하는가 — 여전히 미관측(NOT_VERIFIED).**
실물 실행에서 자식 노드 id 가 전부 새것으로 바뀐 것은 **확인됐다**(관측 ①). 오버라이드는 메인 컴포넌트 하위 노드 id 를 키로 보관되므로 이 사실은 5회차의 우려를 **해소한 것이 아니라 그 전제를 확인**한 쪽이다. 실제 결과(placeholder·안내메시지 텍스트 수정, 아이콘 스왑, 레이어 표시 토글이 초기값으로 되돌아가는지)는 그 사이 전체 재설치로 대상 인스턴스가 사라져 관측되지 않았다. 코드 판독·저장소 근거로는 결론이 나지 않으므로 **추측하지 않는다.**
- 이 기능의 목적이 "연결을 유지한 채 정본 수정을 반영"이라 결과가 갈린다: 보존되면 목적 달성, 초기화되면 **시안의 손입력 문구를 갱신마다 조용히 지우는** 기능이 된다(스크린샷으로 구분되지 않는다).
- 닫는 방법(5분): 사본 파일에서 Input 인스턴스 1개에 placeholder 텍스트를 손으로 바꿔 두고 → 정본에서 색 1개만 바꿔 [설치] 1회 → 그 인스턴스의 문구가 남아 있는지 본다.
- ⚠️ 부수 지적: 결과가 어느 쪽이든 이 항목은 코드의 **한계 목록(①②③)에 없다.** 인스턴스 연속성을 위해 만든 기능에서 가장 큰 한계가 될 수 있는 항목이므로 한계 ④ 로 적어야 한다(구현자 소관).

## ⚠️ 유지·신설

- **⚠️A(신설)** `:7011` 주석 "49개 세트 전부에 적용" 은 재설치 때만 참 — 정정 권고(위 ②).
- **⚠️B(신설)** `getBuiltSet` 의 첫-번째-이름-선택이 남아 있다(위 ⑥).
- **⚠️C(유지·5회차 "중")** `regionBottom` 은 페이지 직계만 훑어 **Input 이 SECTION 안이면 항상 null** → 갱신 경로의 `catY` 가 사실상 전진하지 않는다. 같은 실행에서 Form Control 에 신규 컴포넌트가 하나라도 생기면 잘못된 Y 에 놓인다.
- **⚠️D(유지)** 갱신인데도 `created += 56` · `added.push("Input")` → 완료 화면이 "추가"로 거짓 보고.
- **⚠️E(유지)** `ensureComponentProperty` 는 이름만 보고 타입·기본값 표류를 검사하지 않는다. 더해서 **정본에서 사라진 속성을 지우지 않는다**(갱신 세트에 유령 속성이 남는다).
- **⚠️F(관찰·범위 밖)** `:7068` 부근 layout 패스가 밴드 경계를 `-Infinity/+Infinity` 로 잡고 대상이 페이지 전체 노드다. 오늘 섹션 84,178px 사고는 부품 3개 설치 실패가 원인이었고 3개가 정상 설치되자 복구됐지만(river 관측), **한 컴포넌트의 실패가 레이아웃 전체로 번지는 구조**는 그대로다. 이번 변경 범위 밖 — 별건 처리 권고.

## Gate 13 기록

❓(c) 1건이 남아 **HOLD** — `installer-build-verify-check.js --record` **기록하지 않았다.**
해소 조건: 위 ❓c1 의 5분 관측 1회. 그 결과(보존/초기화)와 한계 목록 ④ 추가만 확인되면 7회차는 그 항목만 보는 **델타 재검증**으로 끝난다 — 이번 회차의 나머지 판정(①~⑥)은 정본 지문이 그대로면 승계 가능하다.
