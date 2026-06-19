---
name: screen-rebuild
description: "레거시 시안의 화면/플로우를 최신 정본(V3.0) 컴포넌트로 Figma에 '원본과 동일하게' 재현하는 4단계 검문소 워크플로우. (1) '이 레거시 화면/플로우를 최신 컴포넌트로 그대로 만들어줘/재현/옮겨줘', (2) MoDU·서비스 시안 1:1 재구성, (3) 반복되는 셸(휴대폰 크롬·앱바 등)을 컴포넌트화해 여러 화면에 인스턴스로 재사용할 때, (4) 레거시 raw 색을 토큰(Variable)으로 입혀 옮길 때 사용. figma-to-code(컴포넌트→코드)와 반대 방향: 레거시 화면→V3.0 Figma 재현. 각 단계는 검문소를 통과하기 전 다음 단계로 넘어가지 못한다."
---

# 레거시 화면 → V3.0 컴포넌트 재현 4단계 검문소 워크플로우

레거시 시안의 한 화면(또는 플로우 전체)을 **누락·추측 없이, 원본과 동일하게** 최신 정본 컴포넌트로 Figma에 다시 그리는 **단계형 워크플로우**다.
각 단계는 **검문소(STOP)** 를 가지며, 통과 전에는 다음 단계로 넘어갈 수 없다.

> **figma-to-code 와의 차이:** figma-to-code = Figma 컴포넌트 → 코드(HTML/registry). 이 스킬 = **레거시 Figma 화면/플로우 → V3.0 Figma 재현**(Figma→Figma).
> 6개 Gate를 **대체하지 않는다.** 이 워크플로우는 진행 중 사전 검문소이고, Gate는 완료 직전 사후 검문이다.

---

## 왜 이 스킬이 필요한가 (실패에서 역산)

이전에 화면이 원본과 *전혀* 다르게 나온 근본 원인은 두 가지였다:
1. **원본을 안 읽고 내용을 지어냄** (약관 문구·체크상태·CTA를 임의 생성).
2. **혼자 자가인증** — 읽기·빌드·"같다" 판정을 한 주체가 다 함.

이 스킬은 그 두 실패를 **구조로 강제 차단**한다: 읽기/빌드/검증을 분리하고(만드는 자 ≠ 검증하는 자), 검증을 최대한 기계로 떨어뜨린다.

---

## 핵심 구조 — 만드는 자 ≠ 검증하는 자

| 역할 | 담당 | 단계 | 이모지 |
|------|------|------|--------|
| **원본 읽기** | `figma-inspector` (실제 spawn) | 1 재고조사 | 🔍 |
| **매핑** (분류·결정) | 오케스트레이터 | 2 매핑 | 🎩 |
| **빌드** | `screen-rebuilder` (실제 spawn) | 3 빌드 | 🪞 |
| **검증** | `component-verifier` (실제 spawn) | 4 검증 | 🕵️ |

> **빌더는 4단계 검증을 직접 하지 않는다.** 반드시 별도 컨텍스트의 `component-verifier`가 수행한다.
> "비슷합니다"라는 빌더의 주관 판정은 검증으로 인정하지 않는다.

---

## 산출물 저장 위치

```
reports/screen-rebuild/{service}/{flow}/
├── 1-inventory.md         # 원본 요소 전수표 (텍스트 verbatim·색·크기·상태·아이콘)
├── 2-mapping.md           # 요소→[인스턴스/토큰프레임/공유크롬/플레이스홀더] + 허용편차 선언서 + HD 목록
├── 4-verification.md      # 3층 검증 결과 (❌ 목록)
└── node-map.json          # 생성한 Figma 노드 id 기록 (재검증·재개용)
```

`{service}` = 서비스명(예: `modu-app`), `{flow}` = 플로우명(예: `signup-under14`).

---

## 🎯 배치 규약 (확정)

- **서비스 1:1 충실 재현** → 해당 **서비스 페이지**(예: `modu app`). 한 플로우는 **Section 1개**로 감싸고, 화면들을 가로로 이어 붙인다.
- **여러 서비스에서 공통화된 패턴**만 `Patterns`(공통) 페이지로 승격한다.
- **반복 셸**(휴대폰 크롬·앱바 등)은 **컴포넌트 세트 1개**로 만들어 모든 화면이 인스턴스로 참조한다. 화면마다 새로 그리지 않는다.

> 현재 파일럿(회원가입·만14세) 약관동의는 `Patterns`에 있으나, 위 규약상 `modu app` 페이지가 정위치다. 다음 빌드 시 이동한다.

---

## 절대 규칙 (모든 단계 공통)

1. **추측 금지 + 이미지 폴백** — 데이터로 못 읽은 값은 지어내지 말고 **`get_screenshot`(원본 이미지)로 다시 읽어** 끝까지 원본과 동일하게 재현한다. 그래도 불명확하면 표에 `미확인`으로 표기하고 보고한다.
2. **색은 항상 토큰** — 시각만 베끼고 색을 raw로 두지 않는다. fills를 **연결된 Variable(아이콘 라이브러리 V2.2 foundation/semantic)에 바인딩**한다. raw hex 잔류 = 검증 ❌.
3. **컴포넌트만 교체 — 임의 생성 금지** — 정본에 있는 것은 **절대 새로 만들지 않고** 인스턴스로만 올린다. 정본에 없는 컴포넌트/상태가 필요하면 `needs-core-update`로 기록·에스컬레이트한다(임의 제작 금지 — Core 재사용 규칙).
3-1. 🚫 **외부 라이브러리 절대 금지 + 레거시 인스턴스 clone 금지 (HARD RULE, 2026-06-19 실패로 신설).** 인스턴스는 **오직 이 파일 로컬 정본 COMPONENT_SET(`mainComponent.remote === false`)** 또는 **V2.2 아이콘 라이브러리(key `yE5UCFEbmXJBlYJWB24Lz2`·`ic_`)** 에서만 만든다. 그 외 모든 외부 라이브러리(`remote === true` & 아이콘 key 아님)는 **금지**.
   - **레거시 원본 화면(1단계 조사 대상)은 "스펙 읽기 전용"이다.** 원본의 인스턴스를 `clone()` 하거나 `getMainComponentAsync()`로 그 mainComponent를 재사용해 새 인스턴스를 만드는 것을 **금지한다** — 레거시 화면은 외부/타 라이브러리(예: UVIS시스템·관계사용)로 만들어졌을 수 있어 외부 참조가 그대로 전파된다. (← 2026-06-19 PC 로그인에서 19개 인스턴스 전부 외부 UVIS 라이브러리가 새어든 실패의 근본 원인.)
   - 빌드 시작 전 **로컬 정본 세트를 먼저 찾아라**: `figma.root.findAll(n => n.type==="COMPONENT_SET" && !n.remote)` (또는 components-new 페이지). 필요한 컴포넌트의 로컬 세트 id·variant를 확정한 뒤, **그 로컬 세트에서 `.defaultVariant`/해당 variant로 인스턴스 생성**.
   - 로컬 정본 세트가 **없는** 컴포넌트(예: base Input 미설치)는 임의로 외부 것을 끌어오지 말고 **`needs-core-update`로 에스컬레이트**(figma-library-build로 먼저 로컬 설치).
   - 인스턴스 생성 직후 `await inst.getMainComponentAsync()` 의 `remote`가 `false`(아이콘은 허용 key)인지 **반드시 확인**. `remote===true`(비-아이콘)면 즉시 중단·보고.
4. **원본 아이콘 강제** — 아이콘은 손으로 그리지 않는다. **V2.2 아이콘 라이브러리(key `yE5UCFEbmXJBlYJWB24Lz2`)에서** `importComponentByKeyAsync`로 가져온다. 레거시 원본의 아이콘 인스턴스를 clone 금지(외부 라이브러리일 수 있음 — `ic_` 이름이어도 key가 V2.2가 아니면 금지). 라이브러리에 없으면 보고·에스컬레이트(가짜 도형 금지).
5. **자가인증 금지** — 빌드와 검증을 분리한다(🎩 빌드 / 🕵️ component-verifier 검증). 빌더가 직접 통과 판정하지 않는다.
6. **막히면 보고** — 값·에셋·아이콘을 못 얻으면 임의로 채우지 말고 어떤 항목인지 사용자에게 알린다.

---

## 1단계 — 원본 재고조사 (Inventory)

**담당:** 🔍 `figma-inspector` (실제 spawn) · **빌드 금지, 읽기만.**

원본 화면 노드의 **모든 요소**를 전수로 표에 옮긴다.

```
| # | 요소 | 텍스트(verbatim) | 색(raw) | 크기 | 상태 | 아이콘(노드/key) | 구조/계층 | 읽은 방법 |
|---|------|-----------------|---------|------|------|-----------------|----------|----------|
| 1 | 제목 | 서비스 약관에\n동의해 주세요 | #202020 | 22/30 | — | — | appbar 아래 | data |
| 2 | 전체동의 체크 | 전체 동의하기 | #2563EB | 18 | checked | — | row | data |
| 3 | … | … | … | … | … | … | … | 이미지 |
```

- `get_metadata`로 구조를 먼저 좁히고(§Figma MCP 읽기 규칙), 고른 노드만 `get_design_context`/`get_variable_defs`로 깊이 읽는다.
- **텍스트는 한 글자도 바꾸지 않고 verbatim**으로 기록한다(지어내기 금지가 여기서 갈린다).
- 데이터로 못 읽은 요소는 **`get_screenshot`로 이미지를 떠서** 보고 채우고, "읽은 방법" 칸에 `이미지`로 표기한다.
- 결과를 `1-inventory.md`에 저장한다.

### 🚦 검문소 1 — 요소 전수 + 사용자 확인 (STOP)

> **총 요소 개수를 명시하고 멈춘다.** `미확인` 항목이 있으면 함께 보고. 사용자 확인 전 2단계로 가지 않는다.

---

## 2단계 — 매핑 & 허용편차 선언 (Mapping)

**담당:** 🎩 오케스트레이터 (매핑·결정만 — 빌드는 🪞 screen-rebuilder)

1단계 각 요소를 아래 4부류로 분류하고, 색·아이콘을 토큰/라이브러리에 매핑한다.

```
| 요소 | 분류 | 정본 세트/variant·상태 | 색 매핑(raw→토큰) | confidence | 아이콘(라이브러리 key) | 비고 |
|------|------|----------------------|------------------|-----------|----------------------|------|
| 전체동의 체크 | 정본 인스턴스 | Checkbox / State=Checked | #2563EB→action-primary | high | — | |
| (필수) 텍스트 | 토큰 프레임 | — | #2563EB→action-primary | high | — | 컴포넌트화 전 |
| 휴대폰 크롬 | 공유 크롬 컴포넌트 | (신규 세트 1개) | — | — | 라이브러리 아이콘 | 1회 제작 후 인스턴스 |
| 안드로이드 내비 | 플레이스홀더 | — | — | — | — | 기기 OS, DS 아님 |
```

**분류 기준 (2단계 경량화):**
- **정본 인스턴스** — 정본 데이터에 컴포넌트화돼 있음 → 인스턴스 + 올바른 variant/상태.
- **토큰 프레임** — 아직 컴포넌트화 안 됨 → 프레임에 **토큰 바인딩 색**만 입힘.
- **공유 크롬 컴포넌트** — 화면마다 반복되는 셸 → **컴포넌트 세트 1개**로 만들어 인스턴스.
- **플레이스홀더** — 순수 기기 크롬(상태바·OS 내비 등 우리 DS 아님).

**필수 산출물 2가지:**
- **허용편차 선언서** — 의도된 차이(예: raw색→토큰값 스냅, 기기 크롬=플레이스홀더, **비표준 글자크기→가장 가까운 토큰 크기(12/14 등) 수렴**). 검증기는 이 목록을 **빼고** 대조한다(두갈래 (b)). (**폰트는 더 이상 편차가 아니다** — Pretendard 텍스트 스타일 바인딩이 정본. 아래 3단계 텍스트 규칙 참조.)
- **결정 필요(HD) 목록** — ① 색 역매핑이 **모호**(여러 토큰이 한 색 공유)하면 자동 단정 금지·에스컬레이트(needs-review) ② 정본에 **없는 컴포넌트/상태**(needs-core-update) ③ 라이브러리에 **없는 아이콘**.

- 색 역매핑은 `foundation/semantic` Variable 값과 대조해 의미 기반으로 한다. confidence: exact 1개 = `high`, 공유 다수 = `needs-review`(HD).
- 결과를 `2-mapping.md`에 저장한다.

### 🚦 검문소 2 — 매핑 1회 확인 (STOP)

> **모호 색매핑·needs-core-update·없는 아이콘(HD 목록)을 모아 사용자에게 1회 확인**받는다. 메커니즘(분류·token 배선)은 내가 정하되, 진짜 결정만 올린다. HD 미해결 항목이 있으면 3단계로 가지 않는다.

---

## 3단계 — 빌드 (Build)

**담당:** 🪞 `screen-rebuilder` (실제 spawn · `use_figma`)

매핑표대로 Figma에 재현한다. **아래 figma-use 프리플라이트를 반드시 지킨다.**

### ⚙️ figma-use 프리플라이트 체크리스트 (오늘 겪은 함정 = 규칙화)

- [ ] 컨테이너는 `figma.createAutoLayout()` 사용 — `createFrame`은 **높이 고정 100px**라 hug 안 됨. 부득이 쓰면 `primaryAxisSizingMode/counterAxisSizingMode='AUTO'`로 **높이 hug** 명시.
- [ ] **`layoutMode`를 먼저** 설정하고 **그 다음** `layoutSizingHorizontal/Vertical='FILL'/'HUG'` — 순서 반대면 리셋된다. FILL은 **부모 auto-layout에 append한 뒤** 설정.
- [ ] **spacer는 `layoutGrow=1`을 마지막에** — 뒤에 `resize()`로 덮으면 grow가 취소된다.
- [ ] `node.query()` **셀렉터에 한글 금지**(파서 깨짐) → JS `find`/`findAll` 사용.
- [ ] `primaryAxisAlignItems`는 `MIN|MAX|CENTER|SPACE_BETWEEN`만(SPACE_AROUND 없음). `counterAxisSizingMode`는 `FIXED|AUTO`만(FILL 아님).
- [ ] **텍스트는 V2.4 Figma 텍스트 스타일(Pretendard)을 바인딩한다. 노토로 끝내지 말 것.** 글자(`characters`)는 로드 가능한 **Noto Sans KR**로 먼저 입력 → `await node.setTextStyleIdAsync(스타일id)`로 알맞은 스타일(`title/*`·`body/*`)을 입힌다. MCP가 Pretendard를 렌더용으로 못 불러와도 **바인딩은 성공**하며(`hasMissingFont:true`지만 Pretendard 설치된 데스크톱에선 정상 렌더), 파일엔 올바른 DS 스타일이 박힌다. 스타일id는 `figma.getLocalTextStylesAsync()`로 이름→id 맵을 만들어 찾는다. 매핑: 굵기 Bold→`title/*B`·Medium→`body/*M`·Regular→`body/*R`, 크기는 가장 가까운 토큰 크기. **주의:** 텍스트 스타일은 크기를 그 스타일 값으로 강제하고, 바인딩 후 `fontSize` 재지정은 미설치(Pretendard) 폰트라 불가하므로 비표준 크기(예: 13)는 가장 가까운 토큰 크기(12/14)로 수렴된다(허용편차로 선언). 인스턴스 내부 텍스트에도 `setTextStyleIdAsync`는 적용 가능(검증됨).
- [ ] 색 fills는 **Variable 바인딩**(`setBoundVariableForPaint` — 새 paint 반환값 재대입). raw hex 금지.
- [ ] 반복 셸은 **컴포넌트 세트로 만든 뒤 인스턴스**. 화면마다 복제 금지.
- [ ] 🚫 **인스턴스는 로컬 정본 세트(remote=false)에서만 생성.** 레거시 원본 화면의 인스턴스를 `clone()`/mainComponent 재사용으로 끌어오지 말 것(외부 라이브러리 전파 — 절대규칙 3-1). 아이콘은 V2.2(key `yE5UCFEbmXJBlYJWB24Lz2`)에서 `importComponentByKeyAsync`.
- [ ] **빌드 종료 전 자가 프로비넌스 스캔(필수):** `루트.findAll(n=>n.type==="INSTANCE")` 전부에 대해 `await getMainComponentAsync()` → `remote===false`(로컬) 또는 V2.2 아이콘 key인지 확인. 하나라도 그 외 외부 `remote===true`면 **완료 보고 금지** — 어떤 노드가 어느 외부 라이브러리인지 보고하고 로컬로 교체하거나 needs-core-update.
- [ ] **모든 생성/변경 node id를 return.**
- [ ] 증분 빌드(≤10 ops/call), 단계별 스크린샷 검증. **재시도 시 깨진 부분은 지우고 새로**(누적 금지).

- 빌드 결과 node id를 `node-map.json`에 기록한다.

> **빌더는 4단계 검증을 직접 하지 않는다.** 빌드 완료 후 🕵️ component-verifier에게 넘긴다.

---

## 4단계 — 3층 검증 (Verify)

**담당:** 🕵️ `component-verifier` (실제 spawn, 빌더와 분리)

원본(1단계 표 + 원본 스크린샷)과 재현 결과를 **3층**으로 대조한다.

**Layer 1 — 기계(결정론):**
- 텍스트 **정확 일치**(원본 verbatim == 재현, 1글자라도 다르면 ❌)
- **fills Variable 바인딩 — raw면 ❌(a) 차단(BLOCKING · 절대 (c)로 흘리지 말 것).** 화면이 직접 저작한 프레임·텍스트의 SOLID fill은 로컬 Variable(Semantic Color V2/Foundation V2/overlay)에 바인딩돼야 함. (인스턴스 *내부* raw는 컴포넌트 소관 → `needs-core-update`로 분리.)
- 인스턴스 **variant/상태 = 원본 상태**(예: 원본 checked인데 Default면 ❌)
- 교체 가능한 요소가 **정본 세트의 INSTANCE**인가 (아니면 ❌ — 임의 제작 적발)
- **인스턴스 출처(provenance) — ❌(a) 차단 · 가장 흔한 누수:** 정본 V3.0 컴포넌트는 **이 파일 로컬(`mainComponent.remote === false`)** 이다. 모든 INSTANCE의 mainComponent가 **①로컬(remote===false)** 또는 **②V2.2 아이콘 라이브러리(key `yE5UCFEbmXJBlYJWB24Lz2`·`ic_`)** 에서만 와야 한다. **그 외 모든 `remote === true` = 외부 라이브러리 = ❌(a) 차단**(절대 (c) 금지).
  - ⚠️ **`remote === true`를 "이 파일이 참조하는 정본"으로 해석 금지.** (2026-06-19 실패: PC 로그인의 input·button·checkbox·GNB·아이콘 등 **인스턴스 19개 전부가 외부 UVIS시스템(관계사용) 라이브러리 remote:true** 였는데, 검증기가 "remote:true=참조된 V3.0 정본"으로 오판해 통과시킴. 로컬 정본은 `remote:false`로 따로 존재했다.)
  - ⚠️ **이름이 정본스럽다고(`input`·`button`·`checkbox`·`ic_*`) 로컬로 가정 금지.** 외부 라이브러리도 같은 이름을 쓴다. 아이콘도 `ic_` 이름이지만 key가 V2.2가 아니면 ❌.
  - **각 인스턴스의 `mainComponent.remote`·`key`·소속(로컬/외부 라이브러리명)을 실제로 출력해 표로 제시**한다. 하나라도 비-아이콘 remote:true면 그 화면은 **FAIL**.
- **위 두 검사(raw·provenance)는 육안이 아니라 `use_figma` 결정론 스캔으로 수행**한다: `findAll(INSTANCE)`→각 노드 `await getMainComponentAsync()`의 **`remote`(boolean)·`key`·`name`** 을 모두 기록, 각 노드 `fills`의 `boundVariables` 확인. (셸 인스턴스·컴포넌트 내부는 제외하고 화면 저작 노드만.)
- figma-use 잔재 0 (**고정 100px·hug 누락·미성장 spacer 없음**)
- 원본 요소 **누락 0건**

**Layer 2 — 이미지 대조:** 원본 `get_screenshot` vs 재현 `screenshot`를 시각 대조. **허용편차 선언서 항목은 제외.**

**Layer 3 — 적대적:** Layer 1·2 근거로 ❌목록 작성(별도 컨텍스트라 자가편향 없음).

**두갈래 분류로 반환** (CLAUDE.md 공통 규칙):
- ❌ (a) **코드 실수** → 수정 대상
- 🟡 (b) **의도된 편차**(허용편차 선언서) → 유지
- ❓ (c) **애매** → (b)로 빼지 말고 사용자 확인 (버그 면죄부 금지)

결과를 `4-verification.md`에 저장한다.

### 🚦 검문소 4 — ❌(a) 0 · ❓(c) 0 (반복 STOP)

> **❌(a)가 0이 될 때까지 3단계로 되돌려 반복.** **❓(c)가 있으면 사용자 확인 전** 완료 보고하지 않는다. 🟡(b)는 선언서에 남기면 통과.

---

## 플로우 확장 (여러 화면)

플로우 전체를 옮길 때는 1~4단계를 **화면마다** 반복하되:
- **공유 크롬 컴포넌트는 1회만 제작**하고 각 화면이 인스턴스로 재사용한다.
- 화면들은 한 **Section** 안에 가로로 이어 붙인다(배치 규약).
- 첫 화면이 4단계 ❌0을 통과한 뒤 다음 화면으로 넘어간다.

---

## 실행 방법

```
/screen-rebuild {원본 Figma URL/nodeId} {타깃 서비스/플로우}
```

또는 "이 레거시 화면/플로우를 최신 컴포넌트로 그대로 만들어줘"라고 요청하면 발동한다.
항상 1단계부터 시작하며, 각 검문소에서 멈춰 사용자 확인을 받는다. `reports/screen-rebuild/{service}/{flow}/` 표가 있으면 해당 단계부터 재개할 수 있다.

## 완료 보고

4단계 ❌0 통과 후 CLAUDE.md **Orchestrator Summary** 형식으로 보고한다. 주체 이모지(🔍 읽기 / 🎩 빌드 / 🕵️ 검증)로 **독립 검증이 실제로 돌았는지** 보이게 하고, 관련 Gate 결과를 함께 포함한다.
