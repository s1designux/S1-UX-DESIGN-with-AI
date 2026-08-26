# Mobile Header — 4. Independent Verification (v3.5)

> 🤖 `component-verifier` · 2026-08-26 · **독립 검증 PASS, 구현/수정 없음**

## v3.5 최종 판정

| 검증 대상 | 판정 | 핵심 근거 |
|---|---|---|
| Light 정본 구조 | **PASS** | 별도 Light 프레임 삭제, 실제 세트 `1760:7247`을 Light 2행 보드로 사용 |
| Dark 스펙 구조 | **PASS** | 세트 복제가 아닌 기존 Variant 연결 인스턴스 6개, Light 아래 80px |
| 컴포넌트 무결성 | **PASS** | 세트 key와 Variant ID 6개 유지, 상태표시줄 상속 유지 |
| 정본·Registry | **PASS** | `cellLabelAt` 재생성 규칙, Registry 0.4.0, node-map v3.5 일치 |
| 생성·검문 | **PASS** | reconcile·guide model·variant coverage·size naming·harness 통과 |

- Light 컴포넌트 세트: `1760:7247`, 1816×336, Light 모드 `8:1`.
- 삭제된 중복 Light 프레임: `1790:7354`.
- Dark 인스턴스 보드: `1791:7535`, 1816×336, Dark 모드 `8:2`, 직접 연결 인스턴스 6개.
- 배치: Home 2종 y=76, Standard 4종 y=213, 보드 간격 80px.
- 최종 스크린샷: `shots/mobile-header-set-light-v35.png`, `shots/mobile-header-spec-dark-v35.png`.

Gate 13 기록: `component-verifier` · structural · PASS · `sha256:cb50972e0107…`.

---

## 과거 기록 — v3.4 독립 검증 (v3.5 구조로 대체됨)

> 🤖 `component-verifier` · 2026-08-26 · **증거 기반 독립 검증, 구현/수정 없음**
> 대상: Figma 세트 `Mobile Header` 1760:7247 + Spec Light 1790:7354 + Spec Dark 1791:7535 (file `cysG5U1udpQqVagYY1hWHW`, page Core 5:5706)

## 최종 판정

| 검증 대상 | 판정 | 핵심 근거 |
|---|---|---|
| Figma 라이브러리 | **PASS** | Home Dark=`blue-dark/50`, Standard=`bg-level-0`, 상태바 6개 투명 상속 |
| 스펙 구성 | **PASS** | Light/Dark 각각 Home 2개 + Standard 4개, Dark는 Light 아래 80px |
| 컴포넌트 무결성 | **PASS** | 세트 키 유지, variant 6개 유지, 스펙 instance 12개 정상 연결 |
| 정본·설치기 동기화 | **PASS** | `build-components.ts`, Registry, 생성 모델 동기화 및 검사 통과 |
| 예전 시안 정리 | **PASS** | `Mobile Header / Preview` 1760:7248 삭제 확인 |

## v3.4 확인 근거

- `color/bg/home`의 Dark 모드는 `blue-dark/50`에 연결했고 Light 모드는 기존 값을 유지했다.
- Standard 4종의 루트와 AppBar는 모두 `color/bg/level-0`에 연결했다.
- 6개 StatusBar는 별도 채움이 없어 각 헤더 배경을 그대로 이어받는다.
- Light와 Dark 스펙은 각각 2행이며, Standard 4종은 한 행에 연속 배치했다.
- Dark 스펙은 Light 스펙 바로 아래에 80px 간격으로 배치했다.
- 삭제 대상 Preview는 존재하지 않으며, 현재 컴포넌트 세트 6종과 스펙 인스턴스 연결은 유지된다.
- 최종 스크린샷: `shots/mobile-header-spec-light-v34.png`, `shots/mobile-header-spec-dark-v34.png`, `shots/mobile-header-set-v34.png`.
- 독립 검증 결론: **Mobile Header v3.4 PASS**.

## 남은 참고 사항

- 기존 기록의 행 라벨 11/12px 판단과 서브타이틀 여백 원본 재측정은 이번 요청 범위 밖의 참고 항목으로 남긴다.
- 아래 v3.1 FAIL 기록은 당시 결함 추적 이력이며, v3.4 최종 판정으로 대체되었다.

---

## 과거 기록 — v3.1 기준 독립 검증 (현재 판정으로 대체됨)

> 🤖 `component-verifier` · 2026-08-26 · **검증만 함, 구현/수정 없음**
> 대상: Figma 세트 `Mobile Header` 1760:7247 + Spec Light 1790:7354 + Spec Dark 1791:7535 (file `cysG5U1udpQqVagYY1hWHW`, page Core 5:5706)
> 기준: `1-inventory.md`(V2.4 540:6112 실측) · `2-plan-v2.md` · river 결정 8건(오케스트레이터 지시서) · `node-map.json` v3.1
> 원본 재실측: V2.4 파일 `yE5UCFEbmXJBlYJWB24Lz2` 를 직접 읽어 대조함(스크린샷 + 노드 데이터 양쪽).

## ⛔ 이전 판정(v1) 무효 선언

`4-verification-v1-INVALID.md` (2026-08-25 PASS) 는 **무효**다. 결함 2건(원본 알림×2 를 알림+닫기로 만든 것 · Back/Close 아이콘 gray-light/gray-dark 오연결)을 통과시켰다. 이번 판정은 그 문서를 참조하지 않고 처음부터 다시 대조했다.

## 판정

| 시나리오 | 판정 | 근거 |
|---|---|---|
| **C · Figma 라이브러리** | **FAIL** | ❌(a) 4건 · ❓(c) 4건 |
| **D · `build-components.ts`** | **FAIL** | ❌(a) 2건 (아이콘 색·크기, 상태바 투명화 누락) — Gate 13 검증 기록 **하지 않음** |
| 스캔 3종(바인딩·폰트·provenance) | PASS | 아래 수치 표 |

---

## 1. 토큰 바인딩 스캔 (use_figma 사실 추출 + figma-binding-lookup 역매핑)

- 스캔 노드: `1760:7247` + `1790:7354` + `1791:7535` · **총 노드 614** · **미바인딩 0건** · **고유 hex 0종**

| hex | 노드·속성 | 역매핑 | 허용편차 명시? | 판정 |
|-----|-----------|--------|---------------|------|
| (없음) | — | 역매핑 대상 없음 (EXACT 0 · APPROX 0) | — | ✅ PASS |

> 도구 동작 sanity 확인(스캔 결과가 비어서 "안 돌린 것"과 구분): `node scripts/figma-binding-lookup.js '#353535' '#F5F6FB'` → EXACT 2건(`color/button/label/secondary--default`, **`color/bg/home`**) · exit 2. 스크립트·정본 조회 경로 정상.

## 2. 폰트 스캔 (데이터 · 렌더 판정 아님)

| 항목 | 값 |
|---|---|
| textCount | **71** |
| 비-Pretendard(offenderCount) | **0** |
| histogram | Pretendard Medium 60 · Bold 8 · Regular 3 |
| verdict | ✅ PASS |

## 3. Provenance (INSTANCE 출처 — 키 기준)

| 인스턴스 | mainComponent | remote | key | 판정 |
|---|---|---|---|---|
| StatusBar ×6 | `StatusBar / Platform=App` | **false**(로컬) | a9450c5f… | ✅ |
| Back ×4 | `ic_이전 / Property 1=Solid` | true | 7190e284… | ✅ 허용목록 등재 |
| Close ×2 | `ic_닫기 / Property 1=Solid` | true | 54469d54… | ✅ 허용목록 등재 |
| Notification ×1 | `ic_알림(신규) / Property 1=Line` | true | 13cf1b58… | ✅ 허용목록 등재 |
| Menu Arrow Down ×1 | `ic_화살표, 더보기, 다음장 / Property 1=solid` | true | 6babc3f4… | ✅ 등재 / ❓(c) **원본과 다른 아이콘** (§❓C-1) |

`node scripts/icon-key-consistency-check.js` → ✅ installer=16 · allowed=23 · missing 0 · mismatch 0.

## 4. variant 전수 · 속성 · 패킹

- 6종 전부 존재, `Type` 축 문자열 6개 모두 지시서와 **정확히 일치**. 삭제 대상 `Home / Title + 2 Icons` 부재 확인 ✅
- 세트 bounds 820×417, variant 6개 360×99 2열 3행 정렬 — 붕괴 없음 ✅
- 순환 참조 0 (variant 안에 형제 variant 인스턴스 없음) ✅
- 인스턴스 무결성: 페이지 전수 스캔 **18개** 전부 6 variant 로 정상 연결, detach·깨짐 0 ✅
- ❌ variant **나열 순서**는 §❌A-4 참조.

## 5. 렌더 대조 (원본 vs 빌드)

| 항목 | 원본(V2.4) | 빌드(V3.0) | 판정 |
|---|---|---|---|
| Standard 타이틀 정렬 | 중앙 | 중앙(`textAlignHorizontal=CENTER`, 48~312, 중심 180) | ✅ river 결정 3 |
| Back/Close 아이콘 색 | #353535 | `color/icon/gray-dark` | ✅ v1 오류 수정 확인 |
| Home padding | 20/16 | AppBar 12/16/12/20 | ✅ |
| Standard padding | 16/16 | AppBar 12/16/12/16 | ✅ |
| Home 배경 | #F5F6FB | `color/bg/home` | ✅ river 결정 6 |
| 상태바 이음매 | 프레임 전체 한 색 | StatusBar 인스턴스 fills=[] (투명) | ✅ v3.1 |
| 알림 아이콘 개수 | 1개(서브타이틀형) | 1개 | ✅ v1 결함 소멸 확인 |
| 서브타이틀 화살표 | **진한 화살표(#353535)** | **거의 안 보이는 연회색** | ❌ §❌A-1 |
| 다크 Standard 아이콘 대비 | — | 잘 보임(gray-dark 다크값 #B8BABF) | ✅ node-map V3-2 우려는 **재현되지 않음 — 해소** |
| 다크 Home 셀 경계 | — | 경계 소실 | ❓ §❓C-3 |

---

## ❌ (a) — 고쳐야 하는 것

### ❌A-1 · 서브타이틀형 화살표 아이콘 색 오연결 (v1 과 같은 유형의 재발)
- 빌드: `Menu Arrow Down` 1759:7195 내부 `Fill 1`·`Stroke 2` → `color/icon/gray-light` (= gray/300 **#C4C4C4**)
- 원본 재실측: `540:6198` 내부 `Fill 1` fill **hidden**, `Stroke 2` fill hidden + **stroke #353535** → 실제 보이는 색 = **`color/icon/gray-dark`**
- 렌더에서도 원본은 또렷한 화살표, 빌드는 배경에 묻힘. 2-plan-v2 가 검증자에게 넘긴 항목 → **(a) 판정**.
- 조치: Figma 인스턴스 색 재바인딩 + `build-components.ts:3086` `iconLight` → `iconDark`.

### ❌A-2 · 코드의 화살표 아이콘 크기가 원본·Figma 와 다름 (16 vs 24)
- `build-components.ts:3086` `makeRequiredIconInstance("mobileHeaderArrowDown", iconLight, 16, undefined, -90)`
- Figma 실측 24×24 · V2.4 원본 24×24. 코드로 재생성하면 화살표만 작아진다.

### ❌A-3 · v3.1 상태바 투명화가 코드에 반영되지 않음 (V3-1 재발 예약)
- Figma: StatusBar 인스턴스 6개 `fills = []`
- 코드 `mobileHeaderStatusBarInstance()` 는 fills 를 손대지 않음 → 재생성 시 상태바 띠 이음매가 되살아난다.

### ❌A-4 · 세트 variant 나열 순서가 정본(코드)·기록과 어긋남
- Figma 실제 축 순서: `Standard / Title` → `Standard / Title + Close` → **`Home / Title + Subtitle + 1 Icon`** → **`Home / Title`** → `Standard / No Title` → `Standard / No Title + Close` (defaultValue = `Standard / Title`)
- 코드 `MOBILE_HEADER_TYPES`: Home 2종 먼저 (주석에 river 결정 명시)
- `node-map.json` 의 `componentSet.variantAxis.values` 기록(Standard 4종 → Home 2종)도 **실제와 다름** — 빌드 기록 부정확.
- Home 2종이 Standard 사이에 끼어 있는 배치는 어떤 문서도 승인하지 않았다.

### ❌A-5 · 폐기된 'Alt Title' 이름이 스펙 시트에 잔존
- Light `1790:7373` · Dark `1791:7554` 프레임 이름 = `Cell / Home / Title + Alt Title`
- river 결정 5: 'alt' 는 네이밍 체계상 사용 금지. 캡션 텍스트("Home / Title")만 고쳐졌고 프레임 이름은 안 고쳐짐.
- (부수) Home/Title 캡션 노드만 `Caption / …`, 나머지 5개는 `Label / …` — 명명 불일치.

---

## ❓ (c) — river 확인 필요 ((b)로 빼지 않았음)

### ❓C-1 · 화살표가 원본과 **다른 아이콘 컴포넌트**다
- 원본: `ic_menu_arrow_down` (key `e694d942…`, 회전 0)
- 빌드: `ic_화살표, 더보기, 다음장` (key `6babc3f4…`, **-90° 회전**)
- 아이콘 원본은 원칙상 "정확 대조(항상 ❌)" 대상이지만, V2.2 아이콘 라이브러리 표준화를 위한 의도적 대체일 수 있다. 계획서에 대체 선언이 없어 임의 판정하지 않는다.
- (A) 대체 유지 + 계획서에 명시 / (B) 원본 `ic_menu_arrow_down` 키를 허용목록에 추가해 복원.

### ❓C-2 · 스펙 시트 행 라벨 11px 부재
- 기존 시트 관례 Pretendard Medium **11px**, 현재 `body/12M`(12px). 정본에 11px 텍스트 스타일이 없고 ⭐/에이전트가 정본을 임의 신설하는 것은 금지(H6②).
- (A) 11px 스타일을 정본에 신설 / (B) 12M 로 통일하고 기존 시트도 12M 로 맞춤. 안 정하면 시트마다 라벨 크기가 갈린다.

### ❓C-3 · 다크에서 Home 셀 경계 소실 — "비슷"이 아니라 **완전히 같은 값**
- `color/bg/home` 다크 = `gray-dark/50` = **#131418**
- 스펙 시트 배경 `color/bg/level-1` 다크 = `gray-dark/50` = **#131418** (동일)
- `color/bg/home` 의 darkStatus 는 정본에서 **candidate**(모바일 Home 다크 지원 미정).
- (A) 다크값 재선정(예: gray-dark/100) / (B) 토큰은 두고 스펙 시트 셀에 테두리 추가. 안 정하면 다크 시트에서 Home 2종이 계속 안 보인다.

### ❓C-4 · Preview 프레임과 스펙 시트의 순서가 서로 다름
- Preview `1760:7248` = Standard 4종 먼저 → Home 2종. 스펙 시트는 Home 먼저.
- 빌더가 V3-4 로 "지시 범위 밖"이라 남겨둔 항목 — 임의 통과시키지 않고 올린다.

### ❓C-5 · 코드↔Figma 구조 드리프트 (시각은 동일, 재생성 결과가 다름)
- 코드 AppBar `itemSpacing = 8` / Figma gap 0 (양쪽 다 타이틀 중심 180 → 시각 동일)
- 코드는 타이틀을 grow 프레임 안 TEXT 로, Figma 는 TEXT 직접(w=264 CENTER)
- 슬롯 이름: 코드 `Right spacer` / Figma `End Spacer`, No Title 빈칸은 Figma `Flexible Empty Space`
- 코드 AppBar 에 배경 fill 을 칠하지만 Figma AppBar 는 fill 0개(컴포넌트 배경 상속)
- 레이어 이름·구조를 어느 쪽에 맞출지 정본 선언이 없다.

---

## 🟡 (b) — 사전 승인된 편차 (유지)

| 항목 | 근거 |
|---|---|
| `Standard / Title` 우측 빈 슬롯(아이콘 없음) | 허용편차 #1. 원본 `previous`(540:6132) 재실측 = fill **#FFFFFF(`color/base/white`)** 흰 벡터 → 레거시 실수 판단 타당 |
| StatusBar 컴포넌트 내장(360×99) | 허용편차 #2 |
| `Home / Title` 개명·문구 "홈 타이틀"·배경 홈 통일(원본은 흰색) | river 결정 5 |
| Standard 타이틀 중앙정렬 | river 결정 3 |
| 상태바 모드 핀 해제(다크 상속) | river 결정 7 |
| 상태바 텍스트 색이 원본 `body/primary` → V3.0 `body/secondary` | V3.0 정본 StatusBar 재사용 결과 |

---

## 결정론 게이트 (시나리오 D 도구 실행)

| 검사기 | 결과 |
|---|---|
| `npm run installer:check` | ✅ exit 0 |
| `npm run components:keycheck` | ✅ 누락 0 (color 154/174 · number 9/79) |
| `npm run components:anatomy` | ✅ 7개 규칙 충족 |
| `npm run components:iconpolicy` | ✅ 위반 0 |

> ❌(a) 가 남아 있어 `installer-build-verify-check.js --record` 는 **실행하지 않았다**(Gate 13 통과 근거 미발급).

## 한계 (정직 고지)

- Figma 캔버스 실제 렌더의 육안 미세 붕괴는 `get_screenshot` 4장(세트·Light·Dark·원본)으로만 확인했다.
- 바인딩 스캔은 `skipInvisibleInstanceChildren = true`(참조 절차 원문) 기준이라 **숨김 인스턴스 자식**의 raw hex 는 스캔 범위 밖이다.
- 코드 재생성 결과(실제 설치기 실행)는 돌리지 않았다 — 코드 정독 대조까지만.
