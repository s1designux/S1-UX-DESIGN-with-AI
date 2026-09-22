# setupLightDarkModes 기본 모드 수정 — 독립 검증

- 검증자: 🤖 component-verifier (시나리오 D — 설치기 런타임 코드 구조 변경)
- 대상: `plugins/figma-vars-installer/src/code.ts:782-803` (`setupLightDarkModes`)
- 일자: 2026-09-22
- 성격: 구현하지 않음. 판정만.

## 기계검사 (재실행, 종료코드만 확인)

| 검사 | 종료코드 | 비고 |
|---|---|---|
| `npm run installer:check` | 0 | 실체는 `tsc --noEmit` 뿐 — 이 수정의 거동을 전혀 증명하지 않는다 |
| `npx tsc --noEmit -p plugins/figma-vars-installer/tsconfig.json` | 0 | |
| `node scripts/installer-freshness-check.js` | 0 | **토큰 키·Foundation 색값만 비교한다. 코드 로직 변경은 보지 않는다 → 아래 ❌-3 을 초록으로 통과시킨다** |

## 항목별 판정

### 1. 값 뒤섞임이 정말 없나 — 부분 PASS / 잔여 ❌

`setupLightDarkModes` 호출부는 2곳뿐이다(`code.ts:970` installSemantic, `code.ts:1036` installShadow). 다른 호출부 없음(grep 전수).

- **Semantic Color**: `code.ts:976-982` 가 `SEMANTIC_COLOR` 전 키에 대해 `setValueForMode(sLightId…)` · `(sDarkId…)` 를 매번 쓴다. 이어 `code.ts:986` `pruneCollection(scc, scColorKeys, "COLOR")` 가 데이터셋 밖 COLOR 변수를 **삭제**한다. `resolveColorRef` 는 alias 가 없어도 던지지 않고 마젠타로 떨어진다(`code.ts:848-851`) → 루프 중단으로 반쪽 상태가 될 경로 없음. **COLOR 범위 한정 PASS.**
- **Semantic Shadow**: `code.ts:1059-1085` 가 모든 대상 변수에 두 모드를 다시 쓰고, `pruneCollection` 을 COLOR·FLOAT 양쪽에 돌린다(`1088-1089`). **PASS.**
- **❌-1 (잔여):** Semantic Color 컬렉션의 **비-COLOR 변수는 다시 쓰이지도, 제거되지도 않는다.** prune 이 `resolvedType` 단위라 `"COLOR"` 만 훑는다(`code.ts:986`, 함수는 `code.ts:746-760`). 사용자가 그 컬렉션에 FLOAT/STRING/BOOLEAN 변수를 손으로 넣어 두었다면, 이름 맞바꿈이 그 변수의 라이트/다크를 그대로 뒤집는다. 발생 확률은 낮지만 "전부 다시 쓴다"는 전제는 **참이 아니다**.

### 2. 모드 중복·삭제 사고 — ❌

- `["Light","Dark"]`: rename 없음. PASS.
- `["Dark","Light"]`: `other`=Light → Dark 로, `first`=Dark → Light 로. 이름만 맞바꿈. **종전 코드에 없던 새 거동**이며 아래 ❌-2 의 진원지.
- `["LIGHT","DARK"]`(대문자): 상수는 `vars-data.ts:44-45` 의 `"Light"/"Dark"` 이고 비교는 대소문자 구분이다. `other` 없음 → first 를 Light 로 개명, `Dark` 는 `addMode` 로 신설, 기존 `DARK` 는 `extras` 로 **제거**. 종전과 동일(회귀 아님).
- `["Mode 1","Light","Dark"]`: `other`(Light)를 Dark 로 개명하려 시도 → **컬렉션에 이미 "Dark" 가 있다.** Figma 가 중복 모드 이름을 거부하면 `code.ts:790` 의 `catch{ /* skip */ }` 가 삼키고, 이어 `code.ts:792` 의 개명도 (이미 "Light" 가 있으므로) 같이 삼켜진다 → **함수는 아무 것도 못 바꾸고도 성공한 것처럼 id 를 반환한다.** 기본 모드는 여전히 "Mode 1" 이고 섹션은 계속 검다. 거부하지 않는다면 "Dark" 두 개가 생기고, `ensureMode` 가 먼저 걸린 쪽(개명된 ex-Light)을 darkId 로 잡아 **원래 Dark 모드가 `extras` 로 삭제**된다.
- **❌-2-a:** 두 `renameMode` 는 이 수정의 **유일한 동작**인데 둘 다 `try{}catch{ skip }` 으로 삼켜진다. 끝에 `collection.modes[0].name === LIGHT_MODE` 를 재확인하는 사후 검사가 없어, **실패해도 성공으로 보고된다.** 삼킴은 종전 코드에 없던 신설이다(종전 `code.ts` 의 개명은 맨몸 호출이라 실패가 드러났다).

### 3. 재설치 멱등성 — PASS

`["Light","Dark"]` 에서 `first.name === LIGHT_MODE` → 개명 블록 진입 안 함. `ensureMode` 는 기존 id 반환, `extras` 공집합. 모드 구조 무변경. (값은 매 설치 다시 쓰이지만 같은 값이므로 결과 동일.)

### 4. 이 수정이 증상을 실제로 없애나 — ❌ (가장 큰 것)

**❌-2-b — 이름 맞바꿈은 모드 ID 의 뜻을 바꾸는데, 화면에 박힌 모드 고정은 ID 로 저장돼 있다.**

river 실측 상태(modes[0] 이 다크값, 별도 모드 `8:1` 에 고정된 StatusBar 가 흰색)에 이 코드를 태우면:

1. `8:1`(현재 Light) → 이름 `Dark` 로 개명
2. `modes[0]`(현재 Dark) → 이름 `Light` 로 개명
3. `lightId = modes[0]`, `darkId = 8:1` 로 잡히고, 모든 Semantic Color 변수가 그 ID 기준으로 재기록 → **`8:1` 에 다크값이 들어간다**
4. `8:1` 을 박아 둔 노드는 전부 **다크로 뒤집힌다**

`8:1` 을 박은 것이 무엇인가: `build-components.ts:333-338` `setLightMode` 가 컴포넌트 **세트**(진열면)에 박고, `build-components.ts:269-282` `setShadowMode` 가 그림자 컬렉션 모드를 박는다. 그리고 **재설치는 이미 있는 세트를 다시 만들지 않고 보존한다** — `build-components.ts:7615-7625` 의 `existing.has(name) → skipped.push(name); continue`. 즉 **보존된 세트·스펙 시트의 옛 고정 ID 를 되박는 패스가 설치 어디에도 없다**(`code.ts` 전체에 `setExplicitVariableModeForCollection` 호출 0건). 손으로 만든 화면·패턴이 박아 둔 고정도 마찬가지다.

→ 섹션은 흰색으로 풀리지만, **모드를 명시적으로 박아 둔 모든 노드가 대신 검게 된다.** 증상이 사라지는 게 아니라 자리를 옮긴다. 완전한 수정이라면 개명 **전에** 그 컬렉션에 고정이 걸린 노드를 훑어 "무슨 이름을 박고 있었는지"로 기록하고, 개명 **후에** 이름 기준으로 되박아야 한다.

**❌-3 — 고쳐도 배포본에 없다.** `plugins/figma-vars-installer/dist/code.js:20415-20431` 에 여전히 종전 코드(`first.name !== LIGHT_MODE && first.name !== DARK_MODE`)가 들어 있고, `assets/downloads/s1-ux-design-guide-installer.zip` 안의 `code.js` 에도 새 로직 문자열이 0건이다. 시각: src 14:02 / dist 13:54 / zip 13:55. 지금 상태로 설치하면 **이 수정은 실행되지 않는다.**

**HOLD-1 — 진단의 전제가 아직 실측되지 않았다.** 제시된 REST 증거는 *해석된 색*과 *고정된 모드 ID* 뿐이고, 그 컬렉션의 **모드 이름과 순서, `defaultModeId`** 는 없다. 두 갈래가 남는다: (i) `modes[0]` 의 이름이 `"Dark"` → 맞바꿈 분기 발동 → ❌-2-b 발생. (ii) `modes[0]` 이름이 이미 `"Light"` 인데 그 안에 다크값이 들어가 있는 상태 → **새 코드는 조건문에 걸려 아무 일도 하지 않는다**(무효 수정). 어느 쪽인지 정하지 않고 통과시킬 수 없다. 해당 컬렉션의 `modes[].name` 순서와 `defaultModeId` 를 확보해야 한다.

**HOLD-2 — `modes[0]` 이 기본 모드라는 근거가 코드 안에서 갈린다.** 타입 정의에 `readonly defaultModeId: string` 이 별도로 있고(`@figma/plugin-typings` `VariableCollection`), **이 저장소의 검수 엔진은 미고정 노드의 해석 기준으로 `modes[0]` 이 아니라 `defaultModeId` 를 쓴다**(`audit-engine.ts:450`, `:1475`, `:3256-3257`, `:3282`). 이 수정만 `modes[0]` 을 기본 모드로 단정한다. 두 전제가 어긋나는 경우(예: 기본 모드 제거 후 승격)에는 수정이 빗나간다. 기준을 `defaultModeId` 로 통일할지는 판정자가 정할 일이 아니다 — (c) 로 올린다.

### 5. 부수 피해 — 조건부 PASS

- Foundation·Semantic Number 는 `setupSingleMode`(`code.ts:875-887`)를 쓰며 이번 diff 와 무관. 영향 없음. **PASS.**
- Semantic Shadow 는 같은 함수를 타므로 ❌-1 을 제외한 모든 결함을 **똑같이** 공유한다. 특히 `setShadowMode` 가 박아 둔 그림자 모드 고정이 ❌-2-b 로 같이 뒤집힌다.
- 컴포넌트만 설치하는 경로(`code.ts:1104-1109` `loadExistingSemantic`)는 이 함수를 부르지 않는다 — 이름으로 모드를 찾을 뿐이라 안전하되, **그 경로에서는 수정이 적용되지 않는다**(설계상 범위 밖, 결함 아님).

## 제시된 순수 함수 시험과 실제 API 가 어긋나는 지점

1. **고정(pin)은 컬렉션이 아니라 노드에 산다.** 모드 배열만 흉내 낸 시험은 ❌-2-b 를 구조적으로 못 잡는다. "첫 모드=Light, lightId≠darkId" 는 참이지만 그것이 화면이 옳다는 뜻은 아니다.
2. **중복 모드 이름에 대한 Figma 의 거부 여부를 가정했다.** 거부한다면 `["Mode 1","Light","Dark"]` 에서 두 개명이 모두 조용히 실패하고 함수는 성공을 반환한다(❌-2-a). 시험은 예외를 던지지 않으니 이 분기를 재현하지 못한다.
3. **`defaultModeId` 를 검증하지 않았다.** 시험은 `modes[0]` 을 기본으로 정의해 놓고 그 정의를 되돌려 받은 것이다 — 순환이다(HOLD-2).
4. `addMode` 가 끝에 붙는다는 가정은 타입 정의와 일치한다. 이 점은 어긋나지 않는다.

## 판정

**FAIL — ❌ 3건(값 재기록 범위 ❌-1 · 개명 실패 묵살 ❌-2-a · 고정된 노드 전부 반전 ❌-2-b, 그리고 배포본 미반영 ❌-3), HOLD 2건(실측 모드 이름·순서 미확인, `modes[0]` vs `defaultModeId` 기준 미결). 이 수정은 섹션 배경은 풀지만 명시적으로 모드를 박은 노드를 대신 뒤집으므로, 되박기 패스 없이는 배포 불가.**

---

# 2차 검증 — 이름 맞바꿈 철회 후 "안 박힌 면에 Light 를 박는" 방식

- 일자: 2026-09-22 (같은 날, 1차 FAIL 후 재제출)
- 변경 범위: `plugins/figma-vars-installer/src/build-components.ts` **+13줄 / -0줄**. `code.ts` diff 0줄(1차 지적 대상 전량 철회 확인 — `git diff plugins/figma-vars-installer/src/code.ts` 무출력, `dist/code.js:20425-20429` 도 종전 코드로 복귀).
- 한계 고지: Figma MCP 인증 불가로 **실물 확인은 하지 않았다.** 아래는 코드·타입 정의 추적과 기계검사 결과다.

## 기계검사 (재실행, 종료코드만 확인)

| 검사 | 종료코드 |
|---|---|
| `npm run installer:check` | 0 |
| `npm run components:anatomy` | 0 |
| `npm run components:facts` | 0 |
| `npm run components:keycheck` | 0 |
| `npm run components:iconpolicy` | 0 |
| `node scripts/installer-freshness-check.js` | 0 |

## 1차 ❌ 4건의 처리

| 1차 지적 | 상태 |
|---|---|
| ❌-2-b 고정된 노드 전부 반전 | **해소** — 이름·순서를 건드리는 코드가 사라졌다. 새 코드는 모드 ID 의 뜻을 바꾸지 않고, **비어 있던 자리에 고정을 추가만** 한다 |
| ❌-2-a 개명 실패 묵살 | **해소** — 개명 자체가 없다 |
| ❌-1 비-COLOR 변수 뒤섞임 | **해소** — 값 재기록 순서에 의존하지 않는다 |
| ❌-3 배포본 미반영 | **해소** — `dist/code.js:8392` `setMode(page, maps, maps.semanticLightModeId)` · `:8919` `setMode(section, SPEC_MAPS, SPEC_MAPS.semanticLightModeId)`, zip 안 `code.js` 에도 2건 모두 존재. src·dist·zip 모두 14:05 |

## 확인 요청 항목별 판정

### 1. 기존 파일의 다른 고정을 건드리지 않는지 — PASS

- **구조상 건드릴 수 없다.** 두 호출 모두 `setExplicitVariableModeForCollection` 의 **추가**이고, 대상은 `figma.currentPage` 와 `SectionNode` 뿐이다(`build-components.ts:7343`, `:7970-7974`).
- **조상 고정은 후손 고정을 이기지 못한다.** 다크 스펙 프레임은 자기 자신에 Dark 를 박는다 — `buildGroupedSpec` `:705 setMode(frame, maps, modeId)`(`:693 modeId = maps.semanticDarkModeId`), `buildSpec` `:1033`, Calendar Cell 다크 프레임 `:6197`, Bottom Sheet 다크 사본 `:5747 setMode(comp, maps, maps.semanticDarkModeId)`. 다크 칸 안의 라벨·셀은 `frameEmit(frame, maps, modeId …)` 로 그 프레임의 **자식**으로 만들어지므로 다크를 상속한다. **"어두운 스펙 칸은 영향받지 않는다"는 판단은 맞다.**
- 고정을 걷어내는 두 경로 모두 페이지·섹션에 닿지 않는다 — `unpinInstalledMasters` 는 `COMPONENT_SET` 의 `COMPONENT` 자식만 대상으로 하고(`:229-243`), `clearMode`(`:252-262`)는 다크 스펙 안 인스턴스용이다.
- 부품 Light 고정(`setLightMode` `:333-338`, 세트에만)은 그대로 남고, 그 위에 같은 값의 조상 고정이 하나 더 생길 뿐이라 결과가 바뀌지 않는다.
- **방향성 논증(이게 핵심이다):** 이 고정은 미고정 노드의 해석을 «컬렉션 기본 모드» → «Light» 로만 바꾼다. 기본 모드가 이미 Light 인 정상 파일에서는 **결과가 완전히 동일**하다. 즉 이 수정이 무언가를 바꿀 수 있는 유일한 방향은 Dark→Light 다.

### 2. 재설치 멱등성 — PASS

- 같은 컬렉션에 같은 모드 ID 를 다시 박는 것은 덮어쓰기 no-op 다. 모드를 만들거나 지우지 않는다.
- **보존된 섹션에도 매번 다시 박힌다** — 고정 코드가 `section.name = title` 바로 뒤(`:7970-7974`), 즉 신규 생성 경로와 기존 재사용 경로가 합류한 지점에 있다. 그리고 `wrapCategoryInSection` 은 카테고리 루프의 끝에서 **부품이 전부 skipped 여도 호출된다**(`:7757-7759` — skip 판정은 그 안쪽 멤버 루프 `:7615-7625`). 1차에서 문제가 됐던 "보존된 것은 갱신되지 않는다" 함정을 이번엔 피했다.
- mock 실행(`components:facts`)에서는 `SPEC_MAPS` 가 null 이라 섹션 고정을 건너뛰고(`:7972`), 페이지 고정은 `setMode` 내부 `try/catch`(`:167-176`)가 삼킨다. **`component-facts.json` 의 diff 가 `sourceHash` 한 줄뿐인 것이 이를 실측으로 뒷받침한다** — 부품 사실은 한 글자도 바뀌지 않았다.

### 3. 증상을 실제로 없애나 — PASS (조건 1개는 아래 ❗)

추적: `maps.semanticLightModeId` 는 `code.ts:970` → `setupLightDarkModes` → `ensureMode(collection, "Light")`(`code.ts:794`)로 **이름으로** 잡힌 모드다. 그리고 `installSemantic`(`code.ts:976-982`)이 매 설치마다 그 모드에 라이트 데이터셋을 다시 쓴다. 따라서 Semantic 을 포함한 설치 후에는 **"Light" 라는 이름의 모드가 반드시 라이트 값을 담고 있고**, 페이지·섹션이 그 모드에 고정되므로 흰 면이 나온다. 파일의 기본 모드가 Dark 든 아니든 무관하다.

**이것이 1차 HOLD-1 을 해소한다.** 실측 상태가 (i) `modes[0]`=“Dark” 든 (ii) `modes[0]`=“Light”인데 값이 다크든, 어느 쪽이어도 결과가 같다 — (ii)는 값 재기록이 덮어 고친다. 더 이상 모드 이름·순서를 알 필요가 없다.

**❗-1 (좁은 경로, ❌ 아님):** 컴포넌트만 설치할 때는 `loadExistingSemantic`(`code.ts:1104-1106`)이 쓰이고 값 재기록이 없다. 그 함수는 "Light" 라는 이름의 모드가 **없으면** `scc.modes[0].modeId` 로 떨어진다 — 그 파일에서 `modes[0]` 이 다크값을 담고 있으면 **페이지·섹션이 다크 모드에 고정된다.** 즉 증상을 고정으로 못 박는다. 이번 수정이 만든 결함은 아니고(그 fallback 은 원래 있었다) 발생 조건도 좁지만, 이 고정 때문에 결과가 «상속»에서 «고착»으로 바뀌므로 무게가 늘었다. 그 자리에서 Light 를 못 찾으면 고정을 아예 하지 않는 편이 안전하다 — 판단은 구현자 몫.

### 4. HOLD-2(`modes[0]` vs `defaultModeId`) — 해소 (범위 한정)

새 코드는 `modes[0]` 도 `defaultModeId` 도 읽지 않는다. 쓰는 것은 **이름으로 찾은 모드 ID** 하나뿐이라 두 전제 중 어느 쪽에도 기대지 않는다. **이 수정 범위에서는 해소.**
다만 되돌아간 `setupLightDarkModes`(`code.ts:785`)에는 `modes[0]` = 기본 모드라는 가정이 그대로 남아 있다. 이제 이 증상의 원인이 아니고 개명 조건도 좁아(`"Light"` 도 `"Dark"` 도 아닐 때만) 위험도가 낮으므로 **잔존 항목으로만 기록**한다. 저장소의 검수 엔진은 같은 판단에 `defaultModeId` 를 쓴다(`audit-engine.ts:450·1475·3256·3282`) — 기준을 언젠가 한쪽으로 맞출 일이다.

### 5. 새로 어긋난 표면 — 없음

- `registry/components/component-facts.json` diff = `sourceHash` 1줄뿐. 부품 사실·해부 무변경.
- `installer:check`·`anatomy`·`facts`·`keycheck`·`iconpolicy`·`freshness` 전부 0.
- `PageNode` 는 `ExplicitVariableModesMixin` 을 상속하고(`@figma/plugin-typings` `PageNode extends … ExplicitVariableModesMixin`), `SectionNode` 는 `SceneNodeMixin` 경유로 상속한다 — 두 캐스트 모두 실체가 있다.
- 문자열 ID 오버로드는 `@deprecated` 이고 매니페스트에 `"documentAccess": "dynamic-page"` 가 있으면 던지지만, **이 플러그인 매니페스트에는 없다**(`plugins/figma-vars-installer/src/manifest.json`). 정상 동작.
- `setMode` 는 내부에서 예외를 삼키고 `console.warn` 한다(`:167-176`). 그래서 새로 두른 바깥 `try/catch` 는 실행되지 않는 장식이다 — 무해하지만, 고정 실패는 조용한 경고로만 남는다.

## 남는 것 (❌ 아님 · 사람 판단)

**증상은 덮었지만 원인은 그 파일에 남아 있다.** 이 수정은 설치기가 만드는 페이지와 섹션에만 흰 면을 못 박는다. 같은 파일의 **다른 페이지·사용자 화면·패턴 프레임 중 모드를 안 박은 것**은 여전히 컬렉션 기본 모드를 따르므로 검게 보일 수 있다. 근본 해결은 Figma UI 에서 그 컬렉션의 모드 순서를 되돌려 기본을 Light 로 만드는 것인데, **UI 순서 변경이 모드 ID 를 바꾸지 않는다는 점만 확인되면** 기존 고정을 하나도 건드리지 않고 끝난다(코드로 하면 1차에서 잡힌 그 사고가 난다). 이건 사람이 한 번 하면 되는 일이라 river 에게 올릴 항목이다.

## 2차 판정

**PASS — ❌ 0건, HOLD 0건. 1차 ❌ 4건 전부 해소됐고, 고정은 «비어 있던 자리에 추가»뿐이라 기존 고정(부품 Light·다크 스펙 Dark)을 이길 수 없으며, 멱등하고, 값 재기록 덕에 파일의 모드 이름·순서를 몰라도 흰 면이 나온다. 다만 ①컴포넌트만 설치할 때 "Light" 모드를 못 찾으면 다크에 고정될 수 있는 좁은 fallback(`code.ts:1106`)과 ②파일의 기본 모드가 여전히 Dark 라 가이드 페이지 밖은 그대로라는 점은 남는다 — 둘 다 이번 변경이 만든 결함이 아니므로 통과를 막지 않는다. Figma 실물 확인은 하지 않았다(MCP 불가).**

---

# 3차 검증 — "이름으로 못 찾았으면 아예 박지 않는다" 가드 추가

- 일자: 2026-09-22 (2차 PASS 후 잔여 ❗-1 대응분)
- 변경 범위: `code.ts` (+10/-2) · `build-components.ts` (+18/-0). 2차에서 통과시킨 고정 2자리는 그대로 두고 **조건만 앞에 붙었다.**
- 한계 고지: Figma MCP 인증 불가 — 실물 확인 없음. 코드·타입 추적과 기계검사뿐이다.

## 기계검사 (12건 직접 재실행, 종료코드만 확인)

| 명령 | 종료코드 |
|---|---|
| `installer:check` · `components:keycheck` · `components:anatomy` · `components:iconpolicy` · `components:facts` | 0 · 0 · 0 · 0 · 0 |
| `ui:build:check` · `ui:contract` · `ui:test:check` · `ui:version` · `canon:check` | 0 · 0 · 0 · 0 · 0 |
| `node scripts/installer-freshness-check.js` | 0 |
| `npm run gate:check` | **1 — error 1건: Gate 13(설치기빌드검증) "build-components.ts 현재 내용에 대한 검증 기록 없음"** |

Gate 13 은 **이 검증 자체를 요구하는 게이트**다(하드룰 H1②). 나머지 20건은 전부 warning 이고 이 변경과 무관한 기존 부채다(Gate 4 리포트 색인 · Gate 16 분류 미정 · Gate 20 stale · Gate 28 대시보드 낡음 · Gate 29 다크 갈림 등). 아래 판정이 PASS 이므로 검증 기록을 남겨 Gate 13 을 해소한다.

## 확인 요청 항목별 판정

### 1. 조건 분기가 두 자리 모두에 · `!== false` 기본값 해석 — PASS

- **페이지** `build-components.ts:7352` `if (maps.semanticLightModeNamed !== false && maps.semanticLightModeId)`
- **섹션** `:7976` `if (SPEC_MAPS && SPEC_MAPS.semanticLightModeNamed !== false && SPEC_MAPS.semanticLightModeId)`
- 두 자리 모두 걸렸고, 둘 다 `dist/code.js:8391`·`:8919` 와 zip 안 `code.js` 에 그대로 들어갔다(3건 중 나머지 1건은 `dist:20764` 의 인자 전달). src 14:08 / dist·zip 14:09.
- **`!== false` 는 mock 에서 맞다.** `buildAllComponents` 의 호출부는 설치기 1곳(`code.ts:1225`)과 검사기 mock 10곳이다(`scripts/lib/figma-build-mock.js:373` 외). mock 의 `maps`(`figma-build-mock.js:341-351`)에는 새 필드가 없어 `undefined !== false` = true → 종전과 같이 고정을 시도하고, mock 노드는 그 호출을 기록만 한다(`figma-build-mock.js:250-253`). **`component-facts.json` diff 가 `sourceHash` 한 줄뿐인 것이 이를 실측으로 뒷받침한다** — 부품 사실 무변경.
- optional 필드라 `BuildMaps` 를 직접 만드는 기존 호출부는 컴파일도 동작도 그대로다(`installer:check` 0).

### 2. `lightModeNamed` 가 두 경로에서 올바른가 — PASS

- **신규 설치**(`installSemantic` → `code.ts:992` `lightModeNamed: true`): 하드코딩이지만 **참이다.** `sLightId` 는 `setupLightDarkModes` 의 `ensureMode(collection, LIGHT_MODE)`(`code.ts:794`)가 돌려준 값이고, `ensureMode`(`:762-766`)는 이름으로 찾거나 그 이름으로 만든다 — 반환 id 는 반드시 "Light" 라는 이름의 모드다.
- **기존 로드**(`loadExistingSemantic` → `code.ts:1096` `const lightModeNamed = !!light`): 바로 위 `find((m) => m.name === LIGHT_MODE)` 의 결과를 그대로 반영. 첫 모드로 대체된 경우에만 false. ✓
- **기본값 누수 없음:** `runInstall` 의 `let lightModeNamed = true`(`:1150`)가 갱신 없이 쓰이는 경로는 `loadExistingSemantic()` 이 null 을 준 때뿐인데, 그때는 `scc` 가 null 로 남아 컴포넌트 분기가 먼저 던진다(`code.ts:1224` 부근 "Semantic Color V2 가 필요합니다"). **true 인 채로 `buildAllComponents` 에 도달할 수 없다.**

### 3. 2차 판정을 깨지 않는가 — PASS

세 결론 모두 유지된다. 이 변경은 **고정을 거는 조건을 좁혔을 뿐 거는 대상·값·시점을 바꾸지 않았다.**
- 기존 고정 무영향: 여전히 «비어 있던 자리에 추가»뿐이고, 조상 고정은 후손(다크 스펙의 자기 Dark 고정)을 이기지 못한다.
- 멱등성: 조건은 매 설치 같은 값으로 평가되고, 고정 자리는 그대로 신규·재사용 합류점(`:7976`)이다.
- 증상 제거: 정상 파일에서 `lightModeNamed` 는 항상 true 라 2차와 동일하게 동작한다. false 가 되는 유일한 경우는 애초에 고정하면 안 되던 상황이다.

### 4. 새로 어긋난 표면 — 없음 (연쇄는 설계대로)

- `registry/components/component-facts.json` = `sourceHash` 1줄.
- ui-library 28종 manifest·`contract.json`·`preview.html`·`install-prompt.html`·플랫폼 스탬프의 변경은 **전부 지문/버전 문자열뿐**이다(`0.12.5 → 0.12.6`, `canonicalFingerprint`·`sourceFingerprint`). CSS·JS·토큰 내용은 한 글자도 바뀌지 않았다 — `ui-library/src` 의 변경도 manifest 안 지문뿐이고 `ui-library/dist` 의 비-manifest 변경은 버전 스탬프 파일들이다.
- 이 연쇄는 `build-components.ts` 가 28종의 `canonicalSources` 에 들어 있어서 생기는 **설계된 파급**이다. 일괄 지문 갱신이 정당한지는 "정본 변경이 부품 사실을 바꿨는가" 로 갈리는데, `components:facts`·`components:anatomy` 가 0 이고 facts 내용이 무변경이므로 **이번 건에 한해 정당하다.**

## 남는 것 (❌ 아님 · 이번 변경이 만든 결함 아님)

**❗ 가드는 페이지·섹션만 지킨다.** "Light" 를 이름으로 못 찾는 그 파일에서도 `lightModeId` 는 여전히 `scc.modes[0]` 로 채워져(`code.ts:1095`) `setLightMode`(`build-components.ts:333-338`)가 **컴포넌트 세트에는 그 모드를 그대로 박는다.** 즉 같은 상황에서 세트 진열면은 여전히 검게 고착될 수 있다. 종전과 동일한 거동이라 회귀는 아니지만, 근본적으로는 그 경로에서 설치를 진행하기 전에 사람에게 알리는 편이 맞다 — 구현자·river 판단 사항.

**❗ river 항목(2차에서 넘김):** 파일의 컬렉션 기본 모드가 여전히 Dark 라 가이드 페이지 밖의 미고정 노드는 그대로다. 코드로 건드리지 않기로 접수됨.

## 3차 판정

**PASS — ❌ 0건, HOLD 0건. 가드는 두 자리 모두에 걸렸고, `!== false` 기본값은 mock·기존 호출부에서 종전 거동을 그대로 보존하며(facts 무변경이 실측 증거), `lightModeNamed` 는 두 경로 모두 참값이고 기본값 true 가 잘못 쓰일 경로는 앞선 throw 가 막는다. 2차의 세 결론(기존 고정 무영향·멱등성·증상 제거)은 조건이 좁아졌을 뿐이라 유지된다. 하류 표면 변경은 전부 지문·버전 문자열이며 부품 사실은 무변경이다. Figma 실물 확인은 하지 않았다(MCP 불가).**

---

## 최종 판정 (1~3차 종합)

**PASS — 1차의 이름 맞바꿈(FAIL, ❌ 4건)은 전량 철회됐고, 그 자리를 대신한 "비어 있던 면에 Light 고정 + 이름으로 못 찾으면 고정 안 함" 방식은 기존 고정을 이길 수 없는 구조라 안전하며, 멱등하고, 값 재기록 덕에 파일의 모드 이름·순서를 몰라도 흰 면이 나온다. 잔여 2건(세트 진열면의 같은 fallback · 파일 기본 모드가 Dark 인 상태 자체)은 이번 변경이 만든 결함이 아니므로 통과를 막지 않는다. Figma 실물 미확인.**
