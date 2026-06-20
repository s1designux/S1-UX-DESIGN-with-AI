# Input Password Icon (눈 boolean) 검증 — component-verifier

검증 대상: Input 세트(330:24272, 112 variant)에 추가된 `Password Icon#371:0` BOOLEAN + 각 variant `field>eye` 눈 아이콘.
파일: cysG5U1udpQqVagYY1hWHW / 페이지 Core (5:5706). 검증자: 🤖 component-verifier (빌더와 분리).
Figma 인증 사용자: s1designux@gmail.com (삼성에스원).

## 1. 바인딩 전수 (112 variant) — 정확 대조

use_figma 로 112 variant 전수 스캔 (눈대중 아님, 사실 추출):

| 점검 | 결과 |
|------|------|
| 세트 변수 정의 | `Password Icon#371:0` BOOLEAN, default=false ✅ |
| `field>eye` 존재 | 112/112 (미스 0) ✅ |
| 레이어명 `eye` 통일 | 112/112 (다른 이름 0) ✅ |
| eye 중복(>1) | 0 ✅ |
| `visible` → `Password Icon#371:0` 바인딩 | 112/112 (미바인딩 0) ✅ |
| 기본 visible=false | 112/112 (true 0) ✅ |

→ 바인딩 전수 PASS.

## 2. Provenance (키 기반) — 정확 대조

전 eye 인스턴스 getMainComponentAsync() 실제 출력:

| inst name | mainComponent.name | key | remote | count | 판정 |
|-----------|--------------------|-----|--------|-------|------|
| eye | Property 1=Line | d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7 | true | 112 | ICON_OK (allowed-remote-keys.json eye_hide 일치) |

→ 외부 라이브러리 유입 0. 허용목록 eye_hide 키와 정확 일치. PASS.

## 3. OFF 무영향 (렌더 실측 + 스크린샷)

field 는 FIXED 200px, eye 는 x=164 (200−padR12−24), 기본 visible=false.
- Default OFF: "입력" placeholder 만, 눈/여분 공간 없음 — 기존 Input 과 동일.
- Editing OFF: "텍스트"+caret 좌, ×(remove) 우측 정렬 — 기존 Editing 과 동일.

→ OFF 시 기존 모습 그대로. PASS (Default·Editing 둘 다).

## 4. ON 렌더 (임시 인스턴스 setProperties true → screenshot → 제거)

임시 인스턴스 4개 생성·촬영·전량 제거(leftover 0) 완료.

- **Default ON**: 텍스트 layoutGrow=1 로 좌측 채우고 eye(164→188) 우측. 텍스트 우단 164 = eye 좌단, 겹침 없음. 정상. ✅
- **Editing ON** ⚠️: field 가 SPACE_BETWEEN 3자식(lead x16–58, remove x99–123, eye x164–188). remove 와 eye 가 기하학적으로 겹치지는 않으나(41px 간격), SPACE_BETWEEN 분배로 **× 삭제 아이콘이 중앙에 붕 떠 보임**(우측 클러스터가 아님). 스크린샷에서 "텍스트 | (×) 〔눈〕" 으로 × 가 가운데 분리. 빌더가 지적한 위험이 실제로 시각 결함으로 나타남.

## 분류 결과

### ❓ (c) 확인 요청 — 사용자 판단 필요
- ❓ **Editing(selected) + Password Icon ON 시 × 삭제 아이콘이 중앙 부유**: field SPACE_BETWEEN 에 eye 가 3번째 자식으로 들어가 remove(×)가 좌우 분배로 중앙에 뜸. 의도된 우측 클러스터(×+눈 인접)가 아님.
  - (a)코드실수로 단정하지 않는 이유: Editing+Password 동시 사용이 실제 제품 시나리오인지, 그렇다면 ×와 눈을 어떻게 배치할지(둘 다 우측 인접 / Editing 에선 눈 숨김 등)는 **디자인 결정** 영역. 생성기 코드(build-components.ts)도 Figma 와 동일하게 [lead, remove, eye] SPACE_BETWEEN 으로 충실 재현 → 코드–Figma 드리프트는 아님.
  - 사용자 결정 옵션: (i) Editing 상태에서는 eye 숨김(Password 와 clear 동시 노출 금지) (ii) field 우측에 trailing 클러스터(오토레이아웃 HUG)로 ×+눈 묶기 (iii) 현 상태 허용.

### ✅ PASS 항목
- 바인딩 전수(112/112)·provenance(eye_hide 키 112/112)·OFF 무영향(Default·Editing)·Default ON 렌더.

## 5. Gate 13 (생성기 §D) 결정론 게이트

| 게이트 | 결과 |
|--------|------|
| installer:check (tsc) | ✅ PASS |
| components:keycheck | ✅ 누락 0 (color 128/177, number 6/103) |
| components:anatomy | ✅ 5규칙 충족 (단, ANATOMY 에 eye 규칙 없음 — 신규 요소 미커버 사각지대, 아래 주의) |
| components:iconpolicy | ✅ 위반 0 (eye 는 makeIconInstance 경로) |

코드 대조: build-components.ts buildInput 에 (a) 비-Editing 텍스트 layoutGrow=1 (b) 전 variant field 우측 eye(makeIconInstance("eye", ...), name="eye", visible=false) (c) set.addComponentProperty("Password Icon", BOOLEAN, false) + 전 comps field>eye visible 바인딩 (d) ICON_KEYS.eye=d4e9eb5b… 추가. Figma 결과와 일치.

> ⚠️ **게이트 사각지대 지적**: Gate 11(anatomy)의 ANATOMY 배열에 Input 의 eye 필수 규칙이 없어, 향후 eye 누락이 생겨도 anatomy 게이트는 ✅ 로 통과한다. 이번엔 use_figma 전수 스캔으로 직접 112/112 확인했으나, 회귀 방지를 위해 ANATOMY 에 `{ set:"Input", variant:/Password Icon 관련/, require:["eye"] }` 류 규칙 추가를 권고(빌더/총괄 판단). 단, eye 는 전 variant 공통이므로 variant 정규식이 아닌 "전 variant require" 형태가 필요 — 현 매니페스트 구조 확장 필요.

> ⚠️ **검증 범위 밖**: 같은 diff 에 포함된 Pagination Edge 의 V2.2 세트(edge_set) 전환·신규 Calendar 컴포넌트 세트는 이번 작업 지시(Password Icon)의 범위가 아니라 미검증. Figma 캔버스 실제 패킹 붕괴 육안은 코드 레벨 범위 밖(코드상 위험만 점검).

## 판정

- ❌(a) 0건
- ❓(c) 1건 (Editing+Password ON × 중앙 부유) → **HOLD, 사용자 확인 필요**
- BLOCKED 0건

❓(c) 1건이 있으므로 **Gate 13 pass 기록을 하지 않는다** (목록만 반환). Editing+Password 배치 결정 후 재검증.
