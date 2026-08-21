# 4단계 검증 — `TEMP/Input — Show message Preview` (시나리오 C)

- 검증 주체: 🤖 `component-verifier` (빌더 `figma-library-builder` 와 분리된 컨텍스트)
- 검증일: 2026-08-21
- 기준 문서: `2-plan.md`(계획서) · `1-inventory.md`(원본 실측) · `node-map.json`(빌더 산출물)
- 대상: 파일 `cysG5U1udpQqVagYY1hWHW` / 페이지 `Core`(`5:5706`) / 세트 `1664:7013` · 보드 `1665:7013`
- 무변경 대상: 기존 Input 세트 `1654:42409`

## 최종 판정: ❌ **FAIL** — ❌(a) 1건

| 갈래 | 건수 |
|---|---|
| ❌(a) 빌드 실수 | **1** |
| 🟡(b) 계획서 허용편차 (선언대로 확인) | 3 |
| ❓(c) 애매(사용자 확인) | 0 |
| 🔒 BLOCKED | 0 |

> ❌(a) 1건 = 판정 기준상 FAIL. 다만 원인은 **auto-layout 속성 1개 누락**이며 수정은 4줄(필드 프레임 4개)이다. 그 외 필수 항목 전부 PASS.

---

## ❌(a) 빌드 실수 — 1건

### A1. `field` 프레임의 `strokesIncludedInLayout` 이 정본과 반대 (canon `true` / TEMP `false`) — 입력 텍스트가 정본보다 1px 왼쪽, 폭 2px 넓음

| 항목 | 정본 `1654:42409` MD/Mobile | TEMP `1664:7013` | delta |
|---|---|---|---|
| `field` `strokesIncludedInLayout` | **true** | **false** | 불일치 |
| `field` w / h | 200 / 48 | 200 / 48 | 0 |
| `strokeWeight` / `strokeAlign` | 1 / INSIDE | 1 / INSIDE | 0 |
| padding (T/R/B/L) | 0/12/0/16 | 0/12/0/16 | 0 |
| 입력 TEXT 폭 | **70** | **72** | **+2** |
| 입력 TEXT 좌측 inset (field 기준, 절대좌표 실측) | **17** | **16** | **−1** |
| 입력 TEXT 우측 inset | 113 | 112 | −1 |
| 입력 TEXT 상단 inset | 15 | 15 | 0 |

- **결정론 산식으로 원인 확정:** `strokesIncludedInLayout=true` → content = 200 − 1(좌 stroke) − 16 − 12 − 1(우 stroke) − 100(trail) = **70**. `false` → 200 − 16 − 12 − 100 = **72**. 실측값과 정확히 일치.
- **재현 범위:** TEMP `field` 4개 전부(`1663:7014`·`1663:16944`·`1663:16951`·`1663:16957`) `false`. 정본은 확인한 MD/Mobile field 전부 `true`.
- **대조 블록 3쌍 절대좌표 실측 모두 동일 delta** (cmp-1/2/3 각각 textInsetLeft −1 · textW +2).
- **Password Icon=true 상태에도 전파:** TEMP 입력 148 vs 정본 146.
- **시각 영향:** placeholder 글리프가 정본보다 1px 왼쪽에서 시작. 보드 1:1 렌더에서는 육안 식별 불가 수준이나, **절대좌표 실측으로 확정된 실제 차이**(§시각 매칭 2대 원리 — 숫자·프레임이 같아도 내용물 위치가 다르면 불일치).
- **허용편차 선언서에 미명시** → (b) 처리 불가.
- **빌더 관찰 #1 의 진단은 사실과 다름:** 빌더는 "계산상 72가 맞고 정본 쪽이 2px 작다"고 보고했으나, 정본의 70 은 `strokesIncludedInLayout=true` 에 의한 **정상값**이고 72 는 TEMP 가 그 플래그를 복제하지 않아 생긴 값이다. 정본이 틀린 것이 아니다.
- **미리보기 목적상 치명적인 이유:** 이 세트는 "정본 반영 전 미리보기"다. 이 상태로 정본에 승격하면 나머지 112 variant 와 auto-layout 플래그가 불일치하는 구조가 들어간다.

**되돌릴 항목(빌더 소관, 구현은 검증기가 하지 않음):**
1. `1663:7014` · `1663:16944` · `1663:16951` · `1663:16957` → `strokesIncludedInLayout = true` (설정 후 입력 TEXT 폭이 자동으로 70 이 되는지 재측정)
2. (부수·시각영향 0, 구조 동일성용) `trail` 프레임 `1663:7016` · `1663:16946` · `1663:16953` · `1663:16959` 도 정본은 `true`, TEMP 는 `false`. trail 에는 stroke 가 없어 레이아웃 영향은 0 이지만 정본 복제 정확성 차원에서 함께 맞출 것.

---

## 🟡(b) 계획서 허용편차 — 3건 (선언대로 확인, 통과)

| # | 허용편차 | 실측 확인 |
|---|---|---|
| 1 | 세트 이름 접두사 `TEMP/` | name = `TEMP/Input — Show message Preview` ✅ 선언대로 |
| 2 | `Size`·`Break` 축 미포함 | 속성축 = `State`×`Label` 뿐, Size/Break 없음 ✅ 선언대로 |
| 3 | 래퍼/보드/`trail` `fills = []` | 래퍼 4개·trail 4개·보드·row 전부 `fills.length = 0`, raw hex 0건 ✅ 선언대로 |

## ❓(c) 애매 — 0건 / 🔒 BLOCKED — 0건

MCP 연결 정상, 모든 필수 스캔 실제 실행됨. `MCP 미제공` 항목 없음.

---

## 필수 검증 항목 결과표

| # | 항목 | 결과 | 근거(실측) |
|---|---|---|---|
| 1 | 구조·속성 전수 | ✅ PASS | 아래 §1 |
| 2 | 핵심 요구사항 실동작 (`setProperties` 실제 토글) | ✅ PASS | 아래 §2 |
| 3 | 패킹 정상 | ✅ PASS | 아래 §3 |
| 4 | 토큰 바인딩 (스캔+역매핑 실제 실행) | ✅ PASS | 아래 §4 |
| 5 | 폰트 (데이터 스캔) | ✅ PASS | 아래 §5 |
| 6 | 정본 무변경 증명 | ✅ PASS | 아래 §6 |
| 7 | 위치·격리·publish | ✅ PASS | 아래 §7 |
| 8 | 기존 대조 동일성 | ❌ **FAIL** | 입력 TEXT inset/폭 1~2px 불일치 → **A1**. 그 외 전 항목 일치 |
| 9 | 렌더 시각 대조 | ✅ PASS | 아래 §9 |
| 10 | 빌더 위임 관찰 2건 판정 | 판정 완료 | 아래 §10 |

---

### §1 구조·속성 전수 (정확 대조)

세트 `1664:7013` · COMPONENT_SET · parent = PAGE `Core`(`5:5706`) · description `정본 반영 전 미리보기 · 배포 금지` · 4 variants.

`componentPropertyDefinitions` 실측 — 계획서 외 속성 추가 **0건**:

| 키 | 종류 | default | 옵션 |
|---|---|---|---|
| `Show message#1664:0` | BOOLEAN | **false** | — |
| `Password Icon#1664:5` | BOOLEAN | false | — |
| `State` | VARIANT | Default | Default · Error |
| `Label` | VARIANT | Off | Off · On |

variant 4개 이름·조합 전수:

| variant | id | 레이어 | `안내 메세지` visible 바인딩 | `eye` visible 바인딩 |
|---|---|---|---|---|
| `State=Default, Label=Off` | 1663:7013 | field, 안내 메세지 | `Show message#1664:0` ✅ | `Password Icon#1664:5` ✅ |
| `State=Default, Label=On` | 1663:16943 | 라벨, field, 안내 메세지 | ✅ | ✅ |
| `State=Error, Label=Off` | 1663:16950 | field, 안내 메세지 | ✅ | ✅ |
| `State=Error, Label=On` | 1663:16956 | 라벨, field, 안내 메세지 | ✅ | ✅ |

- `안내 메세지` TEXT: **4/4 variant 전부 존재 + visible=false + propRef 바인딩** ✅ (요구사항 핵심)
- `eye` INSTANCE: **4/4 variant 전부 propRef 바인딩** ✅ · 계획서 외 레이어·variant 추가 0건
- 순환참조: 세트 내부 INSTANCE 는 `eye`(main `338:4`, 외부 아이콘) 4개뿐 — 형제 variant 인스턴스 **0건** ✅

### §2 핵심 요구사항 실동작 — 임시 인스턴스 `setProperties` 실제 토글 (읽기 계산 아님)

임시 인스턴스 `1673:7165` 생성 → 8조합 토글 실측 → **삭제 완료**(§삭제 확인 참조).

| State | Label | Show message | 인스턴스 높이 | 보이는 자식 | 메시지 visible | 높이=보이는자식합+gap | field 테두리 | 메시지 색 |
|---|---|---|---|---|---|---|---|---|
| Default | Off | **false** | **48** | field | false | ✅ true | #D9D9D9 (8:1057) | 8:1121 |
| Default | Off | **true** | **70** | field, 안내 메세지 | true | ✅ true | #D9D9D9 (8:1057) | 8:1121 |
| Default | On | **false** | **72** | 라벨, field | false | ✅ true | #D9D9D9 (8:1057) | 8:1121 |
| Default | On | **true** | **94** | 라벨, field, 안내 메세지 | true | ✅ true | #D9D9D9 (8:1057) | 8:1121 |
| **Error** | Off | **false** | **48** | field | **false** | ✅ true | **#FF4554 (8:1059)** | 8:1122 |
| Error | Off | **true** | **70** | field, 안내 메세지 | true | ✅ true | #FF4554 (8:1059) | 8:1122 |
| Error | On | **false** | **72** | 라벨, field | false | ✅ true | #FF4554 (8:1059) | 8:1122 |
| Error | On | **true** | **94** | 라벨, field, 안내 메세지 | true | ✅ true | #FF4554 (8:1059) | 8:1122 |

판정:
- **요구 높이 4개 전부 일치** — Label=Off 48/70 · Label=On 72/94 ✅ (계획서·정본 실측치와 동일)
- **6px itemSpacing 여백 완전 소멸 확인** — `show=false` 에서 `heightEqualsVisibleSum = true` 이고 `instH === fieldBottom`(48 / 72). 숨은 메시지의 높이(16)도 gap(6)도 남지 않음 ✅
- **라벨 있음·없음 양쪽 동일 동작** ✅ (Off 48↔70 / On 72↔94, 차이 정확히 22 = 6+16)
- **State=Error, Show message=False**: 테두리만 error(`#FF4554`, `VariableID:8:1059`), 배경은 default(`#FFFFFF`, 8:1052), **메시지 미표시** ✅
- **메시지 텍스트 override 편집 가능** ✅ — `안내 메세지` → `아이디를 다시 확인해 주세요` 로 실제 override 성공, 메시지 폭 55→134 hug, 텍스트 스타일 `S:688caf7c…` · 폰트 Pretendard Regular 유지. `Show message` false→true 재토글 후에도 **override 문자열 보존**(`survivesToggle` 확인), 높이 70→48→70 정상 복귀.
- **Password Icon 부수 확인**: 양쪽 Label 에서 eye visible 전환 정상(24×24, trail 100×100→24×24 hug).

**임시 인스턴스 삭제 확인:** 생성 후 페이지 최상위 17→18, `remove()` 후 **17 로 복귀**, `getNodeByIdAsync('1673:7165')` → **null**. 잔존 노드 0건. ✅

### §3 패킹

| variant | x | y | w | h |
|---|---|---|---|---|
| Default/Off | 40 | 40 | 200 | 48 |
| Default/On | 40 | 128 | 200 | 72 |
| Error/Off | 280 | 40 | 200 | 48 |
| Error/On | 280 | 128 | 200 | 72 |

세트 bounds **520 × 240** = (280+200+40) × (128+72+40) — padding 40 · gap 40 정합. 열 x구간 40–240 / 280–480, 행 y구간 40–88 / 128–200 → **variant 겹침 0건 · 폭 붕괴 0건** ✅

### §4 토큰 바인딩 스캔 (use_figma 사실 추출 + `figma-binding-lookup.js` 역매핑)

- 스캔 노드: `1664:7013` + `1665:7013` · 총 노드 **106** · SOLID paint **73건** · **미바인딩 0건** · 고유 hex **0종**

| hex | 노드·속성 | 역매핑 | 허용편차 명시? | 판정 |
|-----|-----------|--------|---------------|------|
| — | (미바인딩 raw hex 없음) | — | — | ✅ 위반 0건 |

> 스캔 유효성: 노드 106개·SOLID paint 73건이 실제로 순회됨(추출 0건 ≠ 스캔 미실행). 셀렉터 부패 아님.
>
> **도구 생존 확인(positive control):** `node scripts/figma-binding-lookup.js '#D9D9D9' '#FF4554' '#757575' '#353535' '#FFFFFF'` → EXACT 5건·exit 2 로 정상 적발. 즉 "미바인딩 0건"은 스크립트가 죽어서 나온 빈 결과가 아니다. (이 5개 값은 **이미 Variable 에 바인딩된 paint 의 해석값**이며 위반 항목이 아니다.)

계획서 §색상 조회표 ↔ 실제 바인딩 대조 (전 항목 일치):

| 용도 | 계획서 Variable ID | 실제 바인딩 | 이름(실측) | Light 해석값 | 판정 |
|---|---|---|---|---|---|
| field 배경 | 8:1052 | `VariableID:8:1052` | color/form-control/bg/default | #FFFFFF | ✅ |
| 테두리 Default | **8:1057** | `VariableID:8:1057` | color/form-control/border/default | #D9D9D9 | ✅ |
| 테두리 Error | **8:1059** | `VariableID:8:1059` | color/form-control/border/error | #FF4554 | ✅ |
| 라벨 글자 | 8:1061 | `VariableID:8:1061` | color/form-control/label/default | #353535 | ✅ |
| 입력 placeholder | 8:1065 | `VariableID:8:1065` | color/form-control/text/placeholder | #757575 | ✅ |
| 입력 default(Error) | 8:1063 | `VariableID:8:1063` | color/form-control/text/default | #353535 | ✅ |
| 안내메시지 기본 | **8:1121** | `VariableID:8:1121` | color/text/state/caption | #757575 | ✅ |
| 안내메시지 오류 | **8:1122** | `VariableID:8:1122` | color/text/state/caution | #FF4554 | ✅ |
| 보드 캡션 | 8:1121 | `VariableID:8:1121` | color/text/state/caption | #757575 | ✅ |

전 Variable `remote=false`(로컬 `Semantic Color V2`) · Light/Dark 2모드 alias 정상.

**아이콘 provenance (키 기반 — 이름 기반 판정 금지):**

| 인스턴스 | main key | remote | 허용목록 대조 | 판정 |
|---|---|---|---|---|
| `eye` ×16 (세트 4 + 보드 파생 12) | `d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7` | true | `allowed-remote-keys.json` → **`eye_hide`** 일치 | ✅ 허용 |
| TEMP variant 인스턴스 ×9 | 로컬 키 | false | 로컬 | ✅ |
| 정본 Input 인스턴스 ×3 | 로컬 키 | false | 로컬 | ✅ |

총 INSTANCE 28개 · 허용목록 밖 remote 키 **0건** · detach **0건** · 손그림 아이콘 **0건**.

### §5 폰트 스캔 (데이터 스캔 — 렌더 판정 아님)

- 스캔 노드: `1664:7013` + `1665:7013` · `textCount` = **41** (0 아님 → NOT_VERIFIED 아님)
- `offenderCount` = **0** · offenders = `[]`
- fontName 집계: `Pretendard Regular` 36 · `Pretendard Medium` 5 → **비-Pretendard 0건** ✅
- `textStyleId` 바인딩 집계 (`boundStyle = (none)` 0건):

| 텍스트 스타일 | ID | 건수 | 정본 대조 |
|---|---|---|---|
| body/14R | `S:35d6b9f345…` | 16 | ✅ 계획서 지정 `S:35d6b9f34501f327f4672b8393023695d2f36c5d,` 일치 |
| body/12R | `S:688caf7c5d…` | 20 | ✅ `S:688caf7c5d281ba8b15ce89feda98adccca04d54,` 일치 |
| body/14M | `S:0b8aad8ca7…` | 5 | ✅ `S:0b8aad8ca7e2cfac03033ed19607a4d2fb76aa2a,` 일치 |

일시 폰트(Noto) 잔존 0건 · 스타일 미바인딩 raw 폰트 0건.

### §6 정본 무변경 증명

| 항목 | 빌드 전 기대 | 실측(빌드 후) | 판정 |
|---|---|---|---|
| 세트 id·name | `1654:42409` `Input` | 동일 | ✅ |
| variant 수 | 112 | **112** | ✅ |
| 속성 키(6) | `Password Icon#1654:226`·Size·State·Label·Message·Break | **동일 6키, 키 suffix `#1654:226` 그대로** | ✅ |
| 속성 옵션 | Size 3 · State 7 · Label 2 · Message 2 · Break 2 | 동일 | ✅ |
| bounds | x64 y140 1726×1674 | **동일** | ✅ |
| 부모 | SECTION `Form Control` `1654:44721` | 동일 | ✅ |
| variant 내부 레이어 | MD/Mobile 8종 전수 확인 | field/입력·텍스트/trail/eye/안내 메세지 id·값 전부 원형 유지 | ✅ |
| eye 소스 노드 `1654:42015` | INSTANCE 유지 | **INSTANCE**, main `338:4`, propRef `Password Icon#1654:226` 유지, 부모 trail 자식수 1 | ✅ **detach 안 됨** |
| 순환참조 | 0 | 0 | ✅ |

**기존 인스턴스 무결성 — 전 페이지 실스캔:**

| 페이지 | 총 INSTANCE | 정본 Input 인스턴스 | orphan(main null) | 속성 읽기 오류 |
|---|---|---|---|---|
| Core | 2,807 | **115** | 0 | 0 |
| modu app | 151 | 0 | 0 | 0 |
| Mobility | 932 | 0 | 0 | 0 |
| Video | 342 | 0 | 0 | 0 |
| Patterns Mobile | 283 | 0 | 0 | 0 |
| Patterns PC | 182 | 0 | 0 | 0 |
| sample | 150 | 0 | 0 | 0 |
| ---공통--- | 0 | 0 | 0 | 0 |
| **합계** | **4,847** | **115** | **0** | **0** |

- 정본 Input 인스턴스 115 = 스펙시트 112 + TEMP 대조 블록 3. 전부 6개 속성 키 정상 해석.
- **깨진 인스턴스·remap 필요 인스턴스 0건.**
- ⚠️ 범위 한계: 이 파일 안에 정본 Input 인스턴스는 Core 페이지에만 존재한다. 과제에서 언급된 "로그인 화면" 인스턴스는 이 파일에서 발견되지 않았다(다른 파일 또는 다른 컴포넌트 사용). **다른 파일의 인스턴스는 미검증**.

### §7 위치·격리·publish

- 세트 `1664:7013` x13968 y5645 520×240 · 보드 `1665:7013` x14688 y5645 812×858 — **둘 다 parent = PAGE `Core`, 어떤 SECTION 안에도 없음** ✅
- 페이지 최상위 17개 전수 bounds 교차 검사 → **겹침 0건** ✅
- 기존 최하단 y = **5245**(Bottom Sheet 섹션) · 신규 y = 5645 → **여유 400px** ✅
- 보드 x = set.x + set.width + 200 = 13968+520+200 = **14688** 계획서 일치 ✅
- publish: `importComponentSetByKeyAsync('6a176c…')` → `not found` 예외 = **미배포** ✅ (probe 전후 페이지 자식수 17 불변 — probe 로 인한 노드 삽입 없음)

### §8 기존 대조 동일성 (정본 MD/Mobile ↔ TEMP)

| 항목 | 정본 | TEMP | 판정 |
|---|---|---|---|
| 높이 (Label Off/On × msg off/on) | 48 / 70 / 72 / 94 | 48 / 70 / 72 / 94 | ✅ 완전 일치 |
| 테두리색 Default / Error | 8:1057 / 8:1059 | 8:1057 / 8:1059 | ✅ |
| 배경색 | 8:1052 | 8:1052 | ✅ |
| 라벨 글자색 | 8:1061 | 8:1061 | ✅ |
| 입력 글자색 (Default/Error) | 8:1065 / 8:1063 | 8:1065 / 8:1063 | ✅ |
| 메시지 글자색 (Default/Error) | 8:1121 / 8:1122 | 8:1121 / 8:1122 | ✅ |
| 폰트·텍스트 스타일 | 14M / 14R / 12R | 동일 3종 | ✅ |
| radius | 4 | 4 | ✅ |
| strokeWeight / align | 1 / INSIDE | 1 / INSIDE | ✅ |
| padding | 0/12/0/16 | 0/12/0/16 | ✅ |
| 래퍼 itemSpacing | 6 | 6 | ✅ |
| field itemSpacing | 0 | 0 | ✅ |
| trail itemSpacing | 2 | 2 | ✅ |
| 메시지↔field 간격 (절대좌표) | 6 | 6 | ✅ |
| 메시지 좌측 정렬 (인스턴스 기준) | 0 | 0 | ✅ |
| 레이어 이름 (Default/Error 입력 TEXT) | `입력` / `텍스트` | `입력` / `텍스트` | ✅ |
| **`field.strokesIncludedInLayout`** | **true** | **false** | ❌ **A1** |
| **입력 TEXT 폭 / 좌측 inset** | **70 / 17** | **72 / 16** | ❌ **A1** |

### §9 렌더 시각 대조

- 세트 `1664:7013` 렌더(520×240): 2×2 그리드 정상, 잘림·겹침 0, Default 회색 테두리 / Error 적색 테두리 정상, `Show message` default false 상태에서 **메시지 잔여 여백 0**(빈 줄 공백 없음), Label=On 만 `라벨` 표시. ✅
- 보드 `1665:7013` 렌더(812×858): 6조합 전부 캡션과 실제 표출 일치 — 1·2·4·5(false)는 메시지 영역 자체가 없고 3·6(true)만 메시지 표시. 대조 블록에서 정본↔TEMP 높이·테두리·글자 육안 동일. 잘림·겹침 0. ✅
- 시각 매칭 2대 원리 적용: 프레임(200×48 동일)과 내용물(입력 TEXT 70↔72 / inset 17↔16)을 **따로 측정** → 프레임은 일치, 내용물은 불일치 = **A1**. 1:1 렌더에서는 1px 차라 육안 식별 불가하므로 렌더가 아니라 절대좌표 실측으로 판정했다.

### §10 빌더 위임 관찰 2건 판정

| # | 빌더 관찰 | 판정 | 근거 |
|---|---|---|---|
| ① | 입력 TEXT 폭 72 vs 정본 70 — "계산상 72가 맞고 정본이 2px 작다" | ❌ **(a)** = **A1** | 원인은 정본 오류가 아니라 TEMP 의 `strokesIncludedInLayout=false`. 정본 70 이 정상. 절대좌표 실측으로 1px 왼쪽 이동 확인. 허용편차 미명시 |
| ② | `trail` 100×100 보고값 | **소견 없음 (정본과 동일)** | 정본 trail 도 100×100(hug·가시 자식 0). eye visible 시 양쪽 모두 24×24 로 hug(실측). 빌드 실수 아님 |

---

## 정본측 개선 필요 목록 (TEMP 결함 아님 · 정본 승격 시 검토)

- **O1. `trail` 의 유령 100×100 이 field 내용폭을 잠식** — eye 가 숨은 상태에서도 trail 은 마지막 hug 크기 100×100 을 유지하고 그 100px 이 field 레이아웃에 그대로 계상된다. 결과적으로 입력 TEXT 가용폭이 약 170 이 아니라 **70(정본)/72(TEMP)** 다. `field.clipsContent = true` + 높이 FIXED 48 이므로, 입력 텍스트를 긴 문장으로 override 하면 70px 폭에서 줄바꿈되어 잘린다. **정본에 이미 존재하는 특성**이며 TEMP 는 이를 충실히 복제했으므로 미리보기로서는 올바르다. 근거: 실측 속성(trail 100 계상 · 입력 FILL 72 · clipsContent true) + eye 표시 시 입력폭 72→148 전환 실측. ⚠️ 긴 텍스트 override 실제 잘림은 **미검증**(계획 범위 밖) — 속성으로부터의 도출이다.

## 참고 — 빌더 self-check 수치 대비

| 항목 | node-map 보고 | 검증기 실측 | 비고 |
|---|---|---|---|
| textNodesScanned | 41 | **41** | 일치 |
| nonPretendardCount | 0 | **0** | 일치 |
| unboundRawColorCount | 0 | **0** | 일치 |
| solidPaintsScanned | 30 | 73 | 순회 설정 차이(양쪽 다 위반 0) — 결함 아님 |
| nodesScanned | 120 | 106 | `skipInvisibleInstanceChildren` 설정 차이 — 결함 아님 |
| 정본 variantCount / propCount | 112 / 6 | **112 / 6** | 일치 |
| 측정 높이 4종 | 48/70/72/94 | **48/70/72/94** | 일치 (읽기값이 아니라 실제 토글로 재현) |

## 저장소 파일 무변경 확인

`git status --porcelain` 기준, 이번 작업의 신규 항목은 **`?? reports/figma-library-build/input-show-message-preview/` 하나뿐**이다.

| 대상 | 상태 | 판정 |
|---|---|---|
| `plugins/figma-vars-installer/src/build-components.ts` | 세션 시작 시점에 이미 `M` · mtime 13:33 | 이번 작업 무관 ✅ |
| `registry/**` | 이미 `M` · mtime 13:34 / 08:14 | 이번 작업 무관 ✅ |
| `assets/downloads/s1-ux-design-guide-installer.zip` | 이미 `M` · mtime 13:34 | 이번 작업 무관 ✅ |
| `pages/components.html` | 미변경 · mtime **08-18** | ✅ |
| 이번 작업 산출물 | `node-map.json` mtime 15:03 (빌드 시각) + 본 파일 | ✅ |

→ **이번 작업의 저장소 쓰기 = `reports/figma-library-build/input-show-message-preview/` 뿐.** 정본·설치기·사이트 무변경 확인.

## 재검증 요청 범위 (빌더 수정 후)

A1 수정 후 다음만 재실행하면 된다 — 전체 재빌드 불필요:
1. `field` 4개 `strokesIncludedInLayout = true` 반영
2. 입력 TEXT 폭 4개 = **70** · field 기준 좌측 inset = **17** 재측정
3. 인스턴스 높이 4종(48/70/72/94) 불변 확인 + 세트 bounds 520×240 불변 확인
4. 대조 블록 cmp-1/2/3 delta 전부 0 확인

---
---

# rev2 재검증 (A1 수정 후) — 2026-08-21

- 검증 주체: 🤖 `component-verifier` (동일 검증자, 빌더와 분리 유지)
- 범위: **rev1 §재검증 요청 범위 ①~④ + 조율자 추가 지시 ⑤~⑧만**. 전체 재검증 아님.
- 빌더 수정 내역(주장): `strokesIncludedInLayout` false→true 8건 (`field` ×4 `1663:7014`/`1663:16944`/`1663:16951`/`1663:16957`, `trail` ×4 `1663:7016`/`1663:16946`/`1663:16953`/`1663:16959`), 그 외 무변경. rev1 관찰① 오진 철회.

## 최종 판정: ✅ **PASS — 검문소 4 통과**

| 갈래 | rev1 | rev2 |
|---|---|---|
| ❌(a) 빌드 실수 | 1 | **0** |
| ❓(c) 애매(사용자 확인) | 0 | **0** |
| 🔒 BLOCKED | 0 | **0** |
| 🟡(b) 허용편차/정본 동일 특성 | 3 | 3 + O2(신규 판정, 정본 동일) |
| 📝 기록 정정 요청(판정 무관) | — | 1 (node-map self-check 수치) |

> **❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 → 검문소 4 통과.** A1 은 해소됐고 회귀 0건이다.

## 재검증 항목 결과표

| # | 항목 | 결과 | 실측 |
|---|---|---|---|
| 1 | `field`·`trail` 8개 `strokesIncludedInLayout = true` 실제 적용 | ✅ PASS | 8/8 `true` |
| 2 | 입력 TEXT 폭 = 70 · 좌측 inset = 17 | ✅ PASS | 4/4 variant 폭 **70** · inset **17** |
| 3 | 인스턴스 높이 48/70/72/94 불변 · 세트 520×240 불변 | ✅ PASS | 실제 토글 4/4 일치 · bounds **520×240** |
| 4 | 대조 블록 cmp-1/2/3 delta 전부 0 | ✅ PASS | 8지표 × 3행 **전부 0** |
| 5 | 회귀 없음 (배선·바인딩·폰트) | ✅ PASS | 배선 4/4 · 미바인딩 **0** · 비-Pretendard **0** |
| 6 | 정본 무변경 재확인 | ✅ PASS | 112 variant · 6키 · bounds 동일 · eye detach 0 |
| 7 | `Password Icon` true→false 후 trail 24 잔존 — TEMP 고유 결함인가 | ✅ 판정 완료 → **🟡(b)/O2 (정본 동일 특성)** | 정본 인스턴스에서 **완전 동일 재현** |
| 8 | 빌더 "120→106" 설명이 사실인가 | ⚠️ **설명 미확인(재현 불가)** / **구조 손실은 없음(독립 확인)** | 아래 §8 |

---

### §rev2-1 `strokesIncludedInLayout` 적용 확인 (8/8)

| 노드 | 종류 | rev1 | rev2 | 부수 속성 |
|---|---|---|---|---|
| `1663:7014` | field | false | **true** | 200×48 · stroke 1 INSIDE · pad 0/12/0/16 · radius 4 · fill 8:1052 · stroke 8:1057 |
| `1663:16944` | field | false | **true** | 동일 · stroke 8:1057 |
| `1663:16951` | field | false | **true** | 동일 · stroke 8:1059 |
| `1663:16957` | field | false | **true** | 동일 · stroke 8:1059 |
| `1663:7016` | trail | false | **true** | 100×100 · itemSpacing 2 · fills 0 |
| `1663:16946` | trail | false | **true** | 동일 |
| `1663:16953` | trail | false | **true** | 동일 |
| `1663:16959` | trail | false | **true** | 동일 |

부수 속성(폭·stroke·padding·radius·itemSpacing·토큰 바인딩) **전부 rev1 과 동일** — 플래그 외 변경 흔적 없음. 정본 대조: 정본 `1654:42013`·`1654:42201` 도 `true`(불변) → **정본과 플래그 일치 달성**.

### §rev2-2 입력 TEXT 폭·inset 재측정 (절대좌표)

| variant | 입력 레이어 | 폭 (rev1→rev2) | 좌측 inset | 우측 inset | 상단 inset | 정본 기대 |
|---|---|---|---|---|---|---|
| State=Default, Label=Off | `입력` | 72 → **70** | **17** | 113 | 15 | 70 / 17 / 113 / 15 ✅ |
| State=Default, Label=On | `입력` | 72 → **70** | **17** | 113 | 15 | ✅ |
| State=Error, Label=Off | `텍스트` | 72 → **70** | **17** | 113 | 15 | ✅ |
| State=Error, Label=On | `텍스트` | 72 → **70** | **17** | 113 | 15 | ✅ |

토큰·스타일 유지 확인: 입력 fill Default `8:1065` / Error `8:1063` · style `S:35d6b9f345…` · font `Pretendard Regular` (4/4 불변).

### §rev2-3 높이·bounds 불변 (실제 `setProperties` 토글)

임시 인스턴스 `1684:7074` 생성 → 토글 실측 → 삭제.

| Label | Show message | 기대 | 실측 | 판정 | 입력폭 | inset |
|---|---|---|---|---|---|---|
| Off | false | 48 | **48** | ✅ | 70 | 17 |
| Off | true | 70 | **70** | ✅ | 70 | 17 |
| On | false | 72 | **72** | ✅ | 70 | 17 |
| On | true | 94 | **94** | ✅ | 70 | 17 |

- Error 스폿: `State=Error, Label=Off, show=false` → 높이 **48**, 테두리 `VariableID:8:1059`, 메시지 미표시 ✅ (rev1 결과 유지)
- 세트 bounds **520×240** 불변 · variant 좌표 (40,40)/(40,128)/(280,40)/(280,128) 불변 · variant 크기 200×48 / 200×72 불변 ✅
- 속성 정의 불변: `Show message#1664:0` BOOLEAN false · `Password Icon#1664:5` BOOLEAN false · State{Default,Error} · Label{Off,On} — 4개, 추가 0 ✅

### §rev2-4 대조 블록 delta (정본 ↔ TEMP)

| 행 | instH | instW | textW | insetL | insetR | insetT | msgGap | msgInsetL |
|---|---|---|---|---|---|---|---|---|
| cmp-1 (Error, msg on) | **0** | 0 | **0** | **0** | 0 | 0 | **0** | 0 |
| cmp-2 (Error, msg off) | **0** | 0 | **0** | **0** | 0 | 0 | — | — |
| cmp-3 (Default, msg off) | **0** | 0 | **0** | **0** | 0 | 0 | — | — |

양쪽 절대값도 동일: 정본·TEMP 모두 `SIL=true` · textW 70 · insetL 17 · insetR 113 · insetT 15 · msgGap 6 · msgInsetL 0.
→ **rev1 의 textW +2 / insetL −1 완전 소멸.** 기존 대조 동일성(rev1 항목 8) FAIL → **PASS 전환**.

### §rev2-5 회귀 검사

**배선 (4/4 유지):**

| variant | `안내 메세지` propRef | `eye` propRef |
|---|---|---|
| State=Default, Label=Off | `Show message#1664:0` ✅ | `Password Icon#1664:5` ✅ |
| State=Default, Label=On | ✅ | ✅ |
| State=Error, Label=Off | ✅ | ✅ |
| State=Error, Label=On | ✅ | ✅ |

**토큰 바인딩 스캔 (2회 · 방식 달리해 교차 확인):**

| 방식 | 노드 | SOLID paint | 미바인딩 | 고유 hex |
|---|---|---|---|---|
| 참조문서 방식 (`findAll`, skipInvisible=true) | 127 | 88 | **0** | 0종 |
| **전수 재귀 (skip 플래그 무관, 아이콘 내부 VECTOR 80개까지 포함)** | **236** | **159** | **0** | **0종** |

| hex | 노드·속성 | 역매핑 | 허용편차 명시? | 판정 |
|-----|-----------|--------|---------------|------|
| — | (미바인딩 raw hex 없음 — 전수 159 paint 기준) | — | — | ✅ 위반 0건 |

> 도구 생존 재확인: `node scripts/figma-binding-lookup.js '#D9D9D9' '#FF4554' '#757575'` → EXACT 3건·exit 2 정상 적발. "0건"은 스크립트 사망 결과가 아니다.

**폰트 스캔 (데이터 스캔):** `textCount` **41**(0 아님) · `offenderCount` **0** · `Pretendard Regular` 36 + `Medium` 5 · `boundStyle=(none)` **0건** · 스타일 3종 정본 일치(`S:35d6b9f345…` 16 / `S:688caf7c5d…` 20 / `S:0b8aad8ca7…` 5). rev1 과 완전 동일 = 회귀 0.

**provenance:** INSTANCE **28**개(rev1 동일) · eye ×16 key `d4e9eb5b7e19…` = 허용목록 `eye_hide` ✅ · 나머지 로컬(remote=false) · 허용목록 밖 remote 키 **0**.

**렌더:** 세트 재렌더(520×240) — rev1 과 시각 동일. 2×2 정상, 메시지 잔여 여백 0, Default 회색 / Error 적색 테두리 정상, 잘림·겹침 0. 1px inset 교정은 1:1 렌더에서 육안 식별 불가하므로 §rev2-2 절대좌표로 판정했다.

### §rev2-6 정본 무변경 재확인

| 항목 | rev1 | rev2 | 판정 |
|---|---|---|---|
| variant 수 | 112 | **112** | ✅ |
| 속성 키 | 6키(`Password Icon#1654:226` 포함) | **동일 6키** | ✅ |
| bounds | x64 y140 1726×1674 | **동일** | ✅ |
| 부모 | SECTION `Form Control` `1654:44721` | 동일 | ✅ |
| eye 소스 `1654:42015` | INSTANCE·main 338:4·propRef 유지·부모 자식수 1 | **전부 동일** | ✅ detach 0 |
| MD/Mobile field `SIL` / 입력폭 | true / 70 | **true / 70** | ✅ 정본 미변경 |

### §rev2-7 `Password Icon` 토글 — 정본 직접 재현 (빌더 미확인 1건 판정)

임시 인스턴스 2개 생성(TEMP `1684:7074` · **정본 `1684:7094`** = `Size=MD, State=Default, Label=Off, Message=Off, Break=Mobile`) → 동일 토글 시퀀스 2회 왕복 → 둘 다 삭제.

| 단계 | | trail W×H | eye visible | 입력폭 | insetL | 인스턴스 높이 | 동일? |
|---|---|---|---|---|---|---|---|
| 1. 최초 (PW=false) | 정본 | 100×100 | false | 70 | 17 | 48 | **✅ 동일** |
| | TEMP | 100×100 | false | 70 | 17 | 48 | |
| 2. PW=true | 정본 | **24×24** | true | **146** | 17 | 48 | **✅ 동일** |
| | TEMP | **24×24** | true | **146** | 17 | 48 | |
| 3. 다시 PW=false | 정본 | **24×24 (100 으로 복귀 안 함)** | false | **146** | 17 | 48 | **✅ 동일** |
| | TEMP | **24×24** | false | **146** | 17 | 48 | |
| 4. 2회차 왕복 후 PW=false | 정본 | 24×24 | false | 146 | 17 | 48 | **✅ 동일** |
| | TEMP | 24×24 | false | 146 | 17 | 48 | |

**판정: 🟡(b) — TEMP 고유 결함 아님. 정본과 100% 동일한 기존 특성(O2).**
- 4단계 전부 `identical: true`(trailW·trailH·inputW·insetL·instH 5지표 일치). **정본 인스턴스도 PW 를 되돌리면 trail 이 100 으로 복귀하지 않고 24 로 남고 입력폭도 146 을 유지**한다.
- 원인: `trail` 은 가시 자식 0인 hug auto-layout 프레임이라 Figma 가 "마지막 계산된 hug 크기"를 유지한다(비가역). 인스턴스 레벨 특성이며 컴포넌트 정의(main)의 100×100 은 그대로다.
- **높이는 전 단계 48 불변**(field 가 FIXED 48) — 이번 검증의 핵심 요구사항(높이/여백 거동)에는 영향 없음.
- 미리보기의 임무는 정본 충실 복제이므로 이 거동을 그대로 갖는 것이 **올바르다**. ❌(a) 아님.
- 단, 아래 O1 과 같은 뿌리의 정본측 개선 후보이므로 **O2 로 정본 개선 목록에 적재**한다.

### §rev2-8 빌더 "스캔 노드 120→106" 설명 검증

**설명은 재현되지 않는다.** 동일 대상(`1664:7013` + `1665:7013`)을 3가지 방식으로 실측:

| 방식 | 결과 |
|---|---|
| `findAll`, `skipInvisibleInstanceChildren = true` | **106** (세트 27 + 보드 79) — 호출 시점 열거 캐시 상태에 따라 **127** 로도 측정됨 |
| `findAll`, `skipInvisibleInstanceChildren = false` | **236** |
| **전수 재귀(플래그 무관·id 중복제거)** | **236** ← 진리값 |

- 즉 숨은 인스턴스 자식 열거로 인한 실제 차이는 **236 ↔ 106 (130개)** 이고, 그 130개의 정체는 eye 아이콘 내부 **GROUP 32 + VECTOR 80 = 112** + 숨은 TEXT/FRAME 잔여다(typeCount 실측). **빌더가 보고한 120 은 106·127·236 어디에도 해당하지 않아 재현 불가**이며, 제시한 사유("숨은 인스턴스 자식 제외")로는 120 이 도출되지 않는다.
- ⚠️ `skipInvisibleInstanceChildren=true` 측정값 자체가 호출 문맥에 따라 106↔127 로 흔들린다. **노드 총개수는 구조 무결성 증거로 쓰기에 부적합**하다.

**구조 손실은 없다(독립 확인).** 총개수 대신 **id 인벤토리**로 판정:

| 대상 | rev2 실측 | rev1 대비 |
|---|---|---|
| 세트 variant 4개 id | `1663:7013` / `1663:16943` / `1663:16950` / `1663:16956` | **동일** |
| variant 내부 레이어 id (label/field/input/trail/eye/msg) | 4×전수 일치(예: 7014/7015/7016/7017/7018) | **동일** |
| `trail` 자식수 | 4/4 = **1**(eye 뿐) | 동일 |
| 보드 직속 자식 | **7** (row ×6 + `기존 ↔ 개선 대조`) id 전부 일치 | 동일 |
| 대조 블록 자식 | **4** (header + cmp-1/2/3) id 전부 일치 | 동일 |
| INSTANCE 총수 | **28** · main key 집계 8종 분포 동일 | 동일 |
| TEXT (전수) | 47 (skip=true 기준 41) | 동일 |
| 전수 SOLID paint / 미바인딩 | 159 / **0** | 위반 0 유지 |

→ **노드 추가·삭제·구조 손실 0건.** 빌더의 "무변경" 주장 자체는 사실이나, 그 근거로 제시한 수치·설명은 틀렸다.

## 📝 기록 정정 요청 (판정에 영향 없음 · 빌더 소관)

`node-map.json` `selfCheck` 의 다음 수치는 재현되지 않으므로 정정 또는 삭제를 요청한다. **빌드 결과물 자체의 결함이 아니므로 ❌(a) 로 계상하지 않는다**(검증 대상은 Figma 자산이며, 자산은 위와 같이 독립 실측으로 완전·정확함이 확인됨).

| 필드 | node-map 값 | 검증기 실측 | 조치 |
|---|---|---|---|
| `selfCheck.nodesScanned` | 120 | 106/127(skip=true, 불안정) · **236(전수)** | 전수값 236 으로 정정하거나 필드 삭제 |
| `selfCheck.hexScan.solidPaintsScanned` | 30 | 88(skip=true) · **159(전수)** | 동일 |
| `observationsForVerifier[0]` (입력폭 72 진단) | "정본이 2px 작다" | 오진 — 원인은 `SIL` 누락 | **철회 완료**(빌더 확인) |

> 누적 소견: 빌더 self-report 수치·진단이 rev1(관찰① 오진)·rev2(노드수 근거) 두 번 부정확했다. **node-map 의 self-check 수치는 검증 근거로 채택하지 않고 항상 독립 실측으로 대체**한다(이번 검증도 그렇게 했다).

## 정본측 개선 목록 (누적 · TEMP 결함 아님)

- **O1**(rev1) `trail` 유령 100×100 이 field 내용폭을 잠식 → 입력 가용폭 70(정본·TEMP 동일). `clipsContent=true` + 높이 FIXED 48 이라 긴 입력 override 시 잘림 우려. 긴 텍스트 실제 잘림은 **미검증**(범위 밖).
- **O2**(rev2 신설) `Password Icon` 을 켠 뒤 다시 끄면 `trail` 이 24×24 로 고정돼 입력 가용폭이 70→146 으로 **비가역 변동**. **정본 인스턴스에서 동일 재현 확인**(§rev2-7). 근본 원인은 O1 과 동일(가시 자식 0인 hug 프레임). 정본 승격 시 `trail` 을 고정폭으로 두거나 아이콘 슬롯 구조를 재설계하면 O1·O2 동시 해소.

## 저장소 파일 무변경 재확인 (rev2)

`git status --porcelain` — 이번 rev2 작업으로 늘어난 항목 **없음**. 신규는 여전히 `?? reports/figma-library-build/input-show-message-preview/` 하나뿐이며, `build-components.ts`·`registry/**`·설치기 zip 은 세션 시작 시점의 기존 `M` 그대로(이번 작업 무관), `pages/components.html` 미변경.

## 임시 검증 인스턴스 삭제 확인 (rev2)

| 인스턴스 | 용도 | 삭제 |
|---|---|---|
| `1684:7074` (TEMP 세트) | 높이 4종 + PW 토글 | ✅ 삭제 |
| `1684:7094` (**정본** `1654:42024`) | PW 토글 정본 재현 | ✅ 삭제 |

페이지 최상위 자식수 17 → 19(생성) → **17(삭제 후 복귀)** · 두 id 모두 `getNodeByIdAsync` → null · 잔존 노드 **0건**.
(rev1 의 `1673:7165` 도 삭제 완료 — 누적 임시 인스턴스 3개 전부 제거, 파일에 검증 잔재 없음.)

## 결론

**rev2 = ✅ PASS · 검문소 4 통과.** ❌(a) 0 · ❓(c) 0 · BLOCKED 0.
A1(`strokesIncludedInLayout`)은 8/8 적용돼 정본과 픽셀 단위로 일치(입력폭 70·inset 17·delta 0)하며, 수정으로 인한 회귀는 배선·바인딩·폰트·렌더·정본 전 영역에서 0건이다. 빌더 미확인 1건은 **정본 동일 특성(🟡(b)/O2)** 으로 판정했다. 남은 지적은 판정에 영향 없는 node-map 수치 정정 1건뿐이다.
