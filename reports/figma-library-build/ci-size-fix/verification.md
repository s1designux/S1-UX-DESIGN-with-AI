# 검증 기록 — 에스원 CI 로고 크기 정정 (42×16 → 78.75×30)

- 검증자: 🤖 component-verifier (빌드 주체와 분리된 컨텍스트)
- 검증일: 2026-08-21
- 기준 문서: `reports/screen-rebuild/modu-app/login-mobile/spec-change-2026-08-21.md` §에스원 CI 크기 정정 (river님 결정) + `reports/figma-library-build/ci-size-fix/node-map.json`
- 대상: 코드 정본 `plugins/figma-vars-installer/src/build-components.ts` `buildCI` · Figma 파일 `cysG5U1udpQqVagYY1hWHW` 페이지 Core `5:5706` 세트 `1545:6723`
- 판정: **PASS** — ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 · 🟡(b) 1건 + O(정본 개선 후보) 1건 + 후속 권고 2건

---

## (A) 코드 정본 검증 — `buildCI`

| # | 항목 | 실측/증거 | 판정 |
|---|------|-----------|------|
| A1 | 에스원 3 variant 크기 | `const S1_CI_W = 78.75, S1_CI_H = 30;` → `comp.resize(S1_CI_W, S1_CI_H)` (3 variant 공통 루프) | ✅ |
| A1 | 삼성 경로 무변경 | `comp.resize(134, 36)` × 3 · imageHash 3종 동일(5ef070ce…/8de26dc1…/100a4d3f…) · diff 상 삼성 블록 무변경 | ✅ |
| A2 | 비례 확대 방식 | `S1_LOGO_SVG.replace('width="42" height="16"', 'width="78.75" height="30"')` — **viewBox `0 0 42 16` 유지**. 실증(문자열 추출 후 노드 실행): 치환 후 head = `<svg width="78.75" height="30" viewBox="0 0 42 16" …>`, viewBox 불변 확인. 대상 부분문자열 파일 내 **1회만 출현**(오치환 불가) | ✅ |
| A2 | 프레임만 커지는 결함 없음 | Figma 실측: logo 프레임 78.75×30 **및** 내부 Vector 77.8601×30 (= 41.5254×1.875). 벡터가 42×16 으로 남지 않음 | ✅ |
| A2 | 왜곡 0 | 78.75/42 = 1.875 · 30/16 = 1.875 (동일 배율) · 벡터 종횡비 41.5254/16 = 2.5953 → 77.8601/30 = 2.5953 (동일) | ✅ |
| A3 | 공유 상수 오염 없음 | `S1_LOGO_SVG` 선언 줄이 diff 에 없음(무변경). 파일 내 `width="42" height="16"` 2회 = 상수 1 + 치환 인자 1. `createNodeFromSvg(S1_LOGO_SVG)` 1회(Footer) · `createNodeFromSvg(S1_CI_SVG)` 1회(CI) | ✅ |
| A3 | Footer 회귀 없음 | diff hunk 위치가 `buildFooter`(신 4370행대)를 건드리지 않음. Figma 실측 Footer 로고 프레임 `1654:38237` = **42×16**, 내부 Vector 41.5254×16, 색 바인딩 `VariableID:8:1068` 유지. `component-facts.json` Footer 항목 무변경(PC 1920×116 등 동일) | ✅ |
| A4 | 치환 실패 방어선 | `if (S1_CI_SVG === S1_LOGO_SVG) throw new Error(...)`. **실증**: 상수 표기를 `height="16" width="42"`(속성 순서 변경)로 바꾼 사본에 동일 치환 → no-op → 두 문자열 동일 → 조건 참(throw 성립). 컴파일된 설치기 `code.js` 에도 동일 가드 존재 확인 | ✅ |
| A5 | 주석 결정 이력 | 종전 "Brand별 각자 크기 — 사용자 결정 2026-06-23" 보존 + "2026-08-21 river 결정: 42×16 → 78.75×30" 명시 + 1.875배·viewBox 유지·Footer 상수 불변경 사유·삼성 무변경까지 기술. 기준 문서와 일치 | ✅ |
| A- | 타입 검사 | `npm run installer:check`(tsc --noEmit) exit 0 | ✅ |

**변경 범위 봉인(중요):** 현재 `build-components.ts` 에는 이번 CI 변경 외에 이전 세션의 미커밋 구조 변경(Modal Break, BottomSheet 키보드, NavBar 등)이 함께 있다. Gate 13 기록이 **파일 전체 해시**이므로 "이번 기록이 미검증 변경을 함께 승인하는가"를 검산했다:

```
CI 변경만 되돌린 사본의 해시 = sha256:0174fbc1251c498ad7c543f34465c6d3bf4e63069f3eca42797a900096b4f17c
직전 Gate 13 기록 해시       = sha256:0174fbc1251c498ad7c543f34465c6d3bf4e63069f3eca42797a900096b4f17c  (일치)
현재 파일 해시               = sha256:e23d3b889151e7dca1111a52eb2dffbd1146ae673c5a0c410318d5c58058c723
```

→ 직전 검증 기록 이후의 **유일한 델타가 이번 CI 변경**임이 증명됨. 다른 미검증 구조 변경을 끼워 통과시키는 문제 없음.

---

## (B) 파생 표면 검증

| 표면 | 확인 방법 | 결과 | 판정 |
|------|-----------|------|------|
| `registry/components/component-facts.json` | 실제 값 조회 | CI geometry = `{Brand:에스원} 78.75×30` · `{Brand:삼성} 134×36` · sourceHash `e23d3b889151`(현재 정본 해시 앞자리와 일치) | ✅ |
| 동 파일 재생성 정합 | `npm run components:facts:check` | "최신" (재생성 결과와 파일 동일 = 손편집 흔적 0) | ✅ |
| `registry/components/component-guide-model.json` | `npm run components:guide-model:check` | ✅ 정본 일치 (42개). CI variant dimensions 78.75×30 반영 | ✅ |
| 설치기 zip | `ls -la` + `unzip` | `assets/downloads/s1-ux-design-guide-installer.zip` 2026-08-21 **16:44** · 내부 3파일 전부 16:44 스탬프 | ✅ |
| zip 내용 반영 | 압축 해제 후 `code.js` 대조 | `S1_CI_W = 78.75, S1_CI_H = 30` · `S1_LOGO_SVG.replace(...)` · 가드 throw · `resize(134, 36)` 2회 · `createNodeFromSvg(S1_CI_SVG)`/`(S1_LOGO_SVG)` 각 1회 | ✅ |
| zip 신선도 | `npm run installer:freshness` | ✅ vars-data 최신 빌드(토큰 467키 + Foundation 색 일치) | ✅ |
| `pages/components.html` | `git status` | **무변경** (수정 목록에 없음) | ✅ |
| 파생 stale 문구 | `grep "42×16|42x16|78.75" pages/*.html registry/**/*.json design/*.md` | 파생에 남은 옛 `42×16` 표기 **0건** (CI 는 웹 그리드 `gridMembership: excluded` 로 크기 표기 없음) | ✅ |

---

## (C) Figma 라이브러리 결과 검증 (`use_figma` 실측)

### C1. 세트·variant 기하 (세트 `1545:6723`, 450×96, 속성축 `Brand`·`Color`)

| variant | 노드 | 크기 | logo 프레임 | Vector | 판정 |
|---|---|---|---|---|---|
| 에스원/White | `1545:6708` (0,0) | 78.75×30 | `1545:6709` 78.75×30 @0,0 | `1545:6710` **77.8601×30** @0,0 (SCALE/SCALE) | ✅ |
| 에스원/Blue | `1545:6711` (158,0) | 78.75×30 | `1545:6712` 78.75×30 @0,0 | `1545:6713` **77.8601×30** @0,0 (SCALE/SCALE) | ✅ |
| 에스원/Dark | `1545:6714` (316,0) | 78.75×30 | `1545:6715` 78.75×30 @0,0 | `1545:6716` **77.8601×30** @0,0 (SCALE/SCALE) | ✅ |
| 삼성/White | `1545:6717` (0,60) | 134×36 | — | RECT `1545:6718` IMAGE `5ef070ce…` FILL | ✅ 미접촉 |
| 삼성/Blue | `1545:6719` (158,60) | 134×36 | — | RECT `1545:6720` IMAGE `8de26dc1…` FILL | ✅ 미접촉 |
| 삼성/Dark | `1545:6721` (316,60) | 134×36 | — | RECT `1545:6722` IMAGE `100a4d3f…` FILL | ✅ 미접촉 |

- 왜곡 검산: 41.5254 × 1.875 = **77.860125** → 실측 77.8601 일치. 종횡비 2.5953 불변 = **왜곡 0**.
- 세트 bounds 450×96 = (316+134) × (60+36) 정상. 겹침 0(에스원 폭 78.75 < 열간격 158, 행 0/60 분리).
- detach/rename/속성변경/순환참조 0 — 세트 속성축 `Brand`,`Color` 유지, variant 이름 6종 `Prop=Value` 정규형 유지, 세트 내 형제 인스턴스 0(INSTANCE 노드 census 0).
- 타입 census(세트 전체 16노드): COMPONENT_SET 1 · COMPONENT 6 · FRAME 3 · VECTOR 3 · RECTANGLE 3.

### C2. 토큰 바인딩 스캔 (use_figma 사실 추출 + `figma-binding-lookup.js` 역매핑)

- 스캔 노드: `1545:6723` · 총 노드 16 · SOLID 미바인딩(가시) **0건** · SOLID 미바인딩(비가시) 3건 · 고유 hex 1종

| hex | 노드·속성 | 가시성 | 역매핑 | 허용편차 명시? | 판정 |
|-----|-----------|--------|--------|----------------|------|
| #FFFFFF | `logo` 프레임 `1545:6709`·`1545:6712`·`1545:6715` fills[0] | **visible:false** | EXACT `color/bg/level-0`, `color/surface/raised` | 미명시 | 🟡(b) 기존 특성 유지 + **O** (아래 (D) 판정 근거) |

보존 확인(바인딩 유지):

| 노드 | 속성 | Variable | 해석색 | 판정 |
|---|---|---|---|---|
| `1545:6710` Vector | fills[0] | `VariableID:8:1072` (White) | #FFFFFF | ✅ 보존 |
| `1545:6713` Vector | fills[0] | `VariableID:8:715` (Blue) | #004097 | ✅ 보존 |
| `1545:6716` Vector | fills[0] | `VariableID:8:1068` (Dark) | #55575F | ✅ 보존 |
| `1545:6723` 세트 | fills[0] | `VariableID:8:717` (gray/50) | #F5F5F5 | ✅ 보존 |

- **신규 미바인딩 raw hex 0건** (node-map `newHexIntroduced: 0` 과 일치).

### C3. 폰트 정체성 스캔 (데이터 스캔 — 렌더 판정 금지)

- 대상 `1545:6723` 전수 순회 결과 **TEXT 노드 0개**. selector 부패가 아님을 같은 순회의 타입 census(COMPONENT 6·FRAME 3·VECTOR 3·RECTANGLE 3·COMPONENT_SET 1 = 16 노드 전량 관측)로 확인 — CI 세트는 구조상 텍스트를 포함하지 않는 벡터/이미지 로고 세트다. 비-Pretendard 0건, 이번 작업이 생성한 TEXT 0건.

### C4. 인스턴스 provenance + 자동 반영 (로그인 11개, 페이지 `173:2431`)

| 확인 항목 | 실측(11/11 동일) | 판정 |
|---|---|---|
| 크기 | 78.75 × 30 | ✅ |
| 위치 | x 120.625 · y 30 | ✅ |
| LogoSlot 중앙정렬 검산 | 부모 `LogoSlot` 320×90, HORIZONTAL, primary/counter = CENTER → (320−78.75)/2 = **120.625** · (90−30)/2 = **30** 일치 | ✅ |
| main component | `1545:6711` (Brand=에스원, Color=Blue) · **remote=false(로컬)** · key `d000d489…` | ✅ provenance 하드룰 통과 |
| 인스턴스 override | `overriddenFields: ["name"]` **뿐** — width/height/size override **0건** (정본을 따라온 것) | ✅ |
| 내부 벡터 | `I…;1545:6713` 77.8601×30 | ✅ |
| 대상 노드 | `1564:28`·`1564:106`·`1564:177`·`1566:350`·`1566:422`·`1566:508`·`1566:592`·`1566:676`·`1567:677`·`1567:763`·`1567:834` (11/11 확인) | ✅ |

### C5. 렌더 대조 (육안)

- CI 세트 `1545:6723` (scale 3): 에스원 3종이 78.75×30 프레임에 꽉 차게, 세로 눌림·가로 늘어남 없이 렌더. 흰/파랑/회색 3색 정상. 삼성 3종 134×36 이미지 그대로.
- 로그인 LogoSlot `1564:27` (320×90 실측 캡처): 로고 중앙, 상하 30px 여백 균등, 잘림 0.
- 로그인 전체 섹션 `1562:2` (4920×980, 11화면): 11화면 모두 동일 크기·위치의 로고, 상단 여백 자연스러움. 눌림/잘림/겹침 0.

---

## (D) 빌더 위임 1건 — `logo` 프레임의 visible:false 미바인딩 흰 fill 3건

**판정: 🟡(b) 이번 작업의 결함 아님(기존 특성) + O 정본 개선 후보.** 근거(추정 아님, 실측):

1. **코드 증거** — `buildCI` 는 logo 프레임의 `fills` 를 한 번도 설정하지 않는다(설정하는 것은 `comp.fills = []` 즉 컴포넌트 쪽). 즉 이 fill 은 `figma.createNodeFromSvg()` 가 만드는 프레임 기본값이며, 이번 변경(width/height 치환)과 인과관계가 없다.
2. **미접촉 대조군 증거** — 이번 작업이 손대지 않은 **Footer** 의 동일 경로 산출물 `C/IMG/Logo/S1_g` (`1654:38237`, 42×16) 도 `fills[0] = SOLID #FFFFFF, visible:false, boundVar:null` **동일 artifact** 를 갖고 있다. 라이브러리 전역의 SVG 프레임 특성이며 이번 변경의 회귀가 아니다.
3. **렌더 영향 0** — `visible:false` 이므로 그려지지 않는다. 표준 스캔 스크립트(`token-binding-scan.md` 1단계)도 `paint.visible === false` 를 제외하므로 **기계 판정상 미바인딩 0건**이다(위 표는 그보다 엄격하게 비가시까지 뒤진 결과).

→ ❌(a) 로 올리지 않는 이유는 "애매해서"가 아니라 **선재성·무영향이 실측으로 증명**됐기 때문이다. 다만 라이브러리 전역 위생 항목이므로 **O(정본 개선 후보)** 로 남긴다: `buildCI`/`buildFooter` 의 `createNodeFromSvg` 직후 `logo.fills = []` 로 기본 흰 fill 제거(적용 범위가 CI+Footer 전역이므로 별건으로 결정 요청).

---

## (E) Gate

`npm run gate:check` — 게이트 42개 · ✅ 69건 · **error 1 · warning 12**

| 항목 | 내용 | 이번 변경 때문인가 |
|---|---|---|
| ❗ error | Gate 13 설치기빌드검증 — build-components.ts 가 마지막 검증 이후 변경(기록 stale) | **예 — 예상된 것.** 이 검증 통과로 기록 갱신하면 해소 |
| ⚠️ Gate 4 | harness-audit 2026-08-20/21 리포트 미색인 | 아니오(하네스 감사 산출물, 별건) |
| ⚠️ Gate 16 | multi-toggle·filter-chip 분류 tbd, 패턴 login verify=legacy | 아니오(선재) |
| ⚠️ Gate 17/20/28/29/30/32 | 미사용토큰 1·registry stale 78+drift baseline·pipeline-status 낡음·다크갈림 13·baseline 면제 1·GNB Menu 미계측 | 아니오(전부 선재, CI/로고와 무관) |

CI 관련 경고 신규 발생 **0건**. 결정론 게이트 개별 실행:

| 검사기 | 결과 |
|---|---|
| `installer:check` (tsc) | ✅ exit 0 |
| `components:keycheck` | ✅ 누락 0 (color 150/171 · number 8/79) |
| `components:anatomy` | ✅ 7규칙 충족 |
| `components:iconpolicy` | ✅ 위반 0 (벡터 예외 15건 allow 마커) |
| `components:geometry:check` | ✅ 17세트 일치 |
| `components:variantcov` | ✅ 49/49 · 신규공백 0 |
| `components:facts:check` | ✅ 최신 |
| `components:guide-model:check` | ✅ 정본 일치 42개 |
| `installer:freshness` | ✅ 최신 |

### Gate 13 기록

```
node scripts/installer-build-verify-check.js --record --by component-verifier \
  --verdict pass --change structural --notes "..."
```

실행 결과:

```
✅ 검증 기록 갱신 — 🤖 독립 검증 (structural) · sha256:e23d3b889151…
```

재검사: `npm run components:buildverify` → ✅ Gate 13 독립 검증 완료 (🤖 component-verifier · structural · 2026-08-21)
전체 재검사: `npm run gate:check` → **Gate Check PASSED** · error 0 · warning 12(전부 선재) · 게이트 42개 · ✅ 70건

---

## 두갈래 분류 결과

- ❌(a) 코드 실수 / 되돌릴 항목: **0건**
- ❓(c) 사용자 확인 필요: **0건**
- 🔒 BLOCKED: **0건** (MCP 정상, 모든 스캔 실측 수행)
- 🟡(b): 1건 — `logo` 프레임 visible:false 흰 fill(선재·무영향, (D) 참조)
- **O 정본 개선 후보**: 1건 — `createNodeFromSvg` 프레임 기본 흰 fill 제거(CI+Footer 전역, 별건 결정)

## 후속 권고 (이번 판정 범위 밖, 상태 전환 권고)

1. **로그인 재현 허용편차 선언의 superseded 표시** — `reports/screen-rebuild/modu-app/login-mobile/2-mapping.md`(43행·94행)와 `4-verification.md`(119행)에 `CI 78×30 → 42×16` 허용편차가 **철회 표시 없이** 남아 있다. 이력 보존 관례상 원문을 고치지 않는다면 각 줄에 "2026-08-21 철회 → spec-change-2026-08-21.md" 포인터를 달아야 한다. 그대로 두면 다음 재검증자가 78.75×30(정상)을 위반으로 오판한다.
2. **`workflow-state.json` 정합** — 같은 폴더 상태 파일의 `screens` 에 삭제된 화면 `1562:6`·`1562:7` 이 `verified` 로 남아 있고, `artifacts` 에 `spec-change-2026-08-21.md` 가 없다. (이번 CI 작업과 무관한 선재 항목 — 로그인 화면 삭제 작업의 후속.)
