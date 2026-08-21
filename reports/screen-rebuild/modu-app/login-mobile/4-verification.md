# MoDU APP 모바일 로그인 — 4단계 독립 검증

🤖 원본대조 검증 에이전트(component-verifier) — **재검증 PASS · 검문소 4 통과**

> 현재 판정은 문서 맨 아래의 `재검증 PASS` 절이다. 아래 최초 FAIL 내용은 발견 사항과 수정 이력을 보존하기 위해 남긴다.

## 최초 검증 판정 요약 (수정 전)

| 검증층 | 결과 | 요약 |
|---|---|---|
| Layer 1 · 결정론 | **FAIL** | 화면·문구·상태·토큰·폰트·출처는 통과했으나 `node-map.json`의 인스턴스 집계와 생성/변경 노드 추적이 실제 현재 결과보다 불완전하다. |
| Layer 2 · 이미지 | **FAIL** | 현재 컴포넌트 크기 차이를 제외해도 로그인 본문의 세로 간격과 CTA 위치가 원본보다 크게 위로 압축되어 있다. |
| Layer 3 · 적대적 | **수정 2건** | 화면 레이아웃 1건(P1), 재개용 노드 기록 1건(P2). |

- ❌(a) 코드/빌드 실수: **2건**
- 🟡(b) 사전 승인 편차: **7종 유지**
- ❓(c) 사용자 판단 필요: **0건**
- BLOCKED: **0건**

따라서 검문소 4는 통과하지 못하며, Phase 3 빌더가 아래 두 항목을 수정한 뒤 다시 독립 검증해야 한다.

## 사용한 기준과 증거

- 원본 기준: `1-inventory.md`, 원본 대표 화면 5장
- 구현 기준: `2-mapping.md`, `3-build.md`, `node-map.json`, `final-scan.json`
- 현재 Figma 독립 재검사: `verifier-live-scan.json`
- 원본 대표 이미지:
  - `/tmp/source-login-initial.png`
  - `/tmp/source-login-keyboard.png`
  - `/tmp/source-login-error.png`
  - `/tmp/source-login-auto.png`
  - `/tmp/source-login-device-c.png`
- 대상 대표 이미지:
  - `/tmp/target-login-initial-final.png`
  - `/tmp/target-login-keyboard-final.png`
  - `/tmp/target-login-error-final.png`
  - `/tmp/target-login-auto-final.png`
  - `/tmp/target-login-device-c-final.png`
- 정본 스냅샷 재확인: Git `b002574`, `build-components.ts`와 생성 모델의 SHA-256이 `2-mapping.md` 기록과 일치한다.

## Layer 1 — 결정론 검사

### 통과 항목

| 항목 | 결과 |
|---|---:|
| Section | `Pattern / Mobile Login / MoDU`, `5800×980`, 직계 화면 13개 순서 일치 |
| 화면 | 13/13, 모두 `360×780` |
| 텍스트 | 173개 검사, 필수 원문 누락 0, 잘못 남은 정본 Footer 문구 0 |
| Input/Button/Modal 상태 | 화면별 main component ID 일치, 비밀번호 아이콘 13/13 On |
| 키보드/팝업 존재 상태 | 키보드 2개, 팝업 5개로 매핑과 일치 |
| 직접 저작 raw SOLID fill/stroke | 0 |
| 폰트 | 173개 전부 Pretendard, 위반 0 |
| 직접 저작 텍스트 스타일 누락 | 0 |
| 고정 100px/HUG 잔재 | 0 |
| 화면 밖 overflow | 0 |
| 로그아웃 화면 혼입 | 없음 |

`verifier-live-scan.json`의 `bad.state` 13행은 디자인 오류가 아니다. 검사식이 숫자 `0/1`과 boolean `false/true`를 strict 비교한 탓에 생긴 검사 코드의 오탐이며, 각 행의 기대값과 실제 개수는 모두 일치한다. 나머지 variant·비밀번호 아이콘 검사는 위반 0이다.

### 인스턴스 출처 전수 재검사

`skipInvisibleInstanceChildren=false`로 현재 Section 아래 인스턴스 **145개**를 다시 읽었다. 아래 18개 그룹이 전체이며, 로컬 정본 112개와 허용 V2.2 아이콘 33개다. 허용목록 밖 외부 인스턴스는 0개다.

| 분류 | main component | key | remote | 수량 | 화면에서의 이름 |
|---|---|---|---:|---:|---|
| LOCAL_OK | `Platform=App` (StatusBar) | `a6f7dac38fb328c3b97c8c4c2e856bd24b31a4c4` | false | 13 | StatusBar / App |
| LOCAL_OK | `Brand=에스원, Color=Blue` | `d000d48997b715fa5c2a8bf043b27b942058356d` | false | 13 | CI / 에스원 / Blue |
| LOCAL_OK | Input Default | `38de0bafe796f912a7d9267ae0cc0dcd3a510ebd` | false | 3 | Input / ID, Input / Password |
| ICON_OK | eye hide | `d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7` | true | 26 | eye |
| LOCAL_OK | Button Primary Disabled | `bf514880dbf7f960b52e1cad07e5519be8daf515` | false | 1 | Button / 로그인 |
| LOCAL_OK | Button Secondary Default | `43b177677a107c56656bb707d1ca95a18f2a4243` | false | 11 | 휴대전화번호/휴대폰 번호 로그인 |
| LOCAL_OK | Footer Mobile | `9901c54de3ddf904f64b034faa516e81590930ee` | false | 11 | Footer / Mobile |
| LOCAL_OK | `Platform=App` (NavBar) | `eb3dad08fe34d26106de3efb5f66ffe3907dbb02` | false | 13 | NavBar / App |
| LOCAL_OK | Input Editing | `f86696df3e362e6a94b8b412a37b0f6a7438252e` | false | 2 | Input / ID, Input / Password |
| ICON_OK | remove | `24b2df622d341e0af21cd4b23b4a7d23b97a5ea7` | true | 2 | remove |
| LOCAL_OK | Button Primary Default | `870b6ded0e4d99aaddb13ff60c91374b26024127` | false | 12 | Button / 로그인 |
| LOCAL_OK | Input Filled | `97ce124ddbaab64b7a34f1c5506614a68847ad6f` | false | 18 | Input / ID, Input / Password |
| LOCAL_OK | Input Error | `4228c1de465823b1999ecf24f517932fbc6fa9e2` | false | 3 | Input / ID, Input / Password |
| LOCAL_OK | Modal Dual | `d7dd50fbcb3bc6bd8272047fc1833e00545728b1` | false | 2 | Login Notice, Device Registration |
| ICON_OK | close | `2a1abbd3597b536e34fd9523fb61eade3afe9934` | true | 5 | close |
| LOCAL_OK | Button XXSM Secondary | `44ea0c4139da9abb690538b5aa3b74002a11f7d7` | false | 2 | secondary |
| LOCAL_OK | Button XXSM Primary | `b06acb2d725f8de39b8a43a0928904fdcb1b9d67` | false | 5 | primary |
| LOCAL_OK | Modal Single | `9eb8a56f6b5118f2efcd3e6a8a71f485f37c2f32` | false | 3 | Login Notice |

그룹별 표본 노드 ID와 실제 이름은 `verifier-live-scan.json`에 보존했다.

### Footer 274×52 판정

**오류가 아니다.** 현재 11개 Footer 인스턴스는 모두 `274×52`, main component는 `315×52`다. 하지만 정본 `buildFooter()`의 Mobile 변형은 가로·세로 모두 `AUTO`인 HUG 구조이고, 생성 모델도 고정 width를 선언하지 않는다. 원본 문구로 정확히 교체하면서 링크 행이 짧아져 인스턴스 폭이 `315→274`로 다시 계산된 것이다.

- 구조: `VERTICAL / AUTO / AUTO` 유지
- 문구: `이용약관 / 개인정보처리방침 / 영상정보처리방침` 정확 일치
- 높이: 정본 52 유지
- 배치: 화면 중앙, 잘림 없음

따라서 `2-mapping.md`의 `315×52`는 기본 문구가 들어간 설치본 관찰값이지 고정 계약값으로 해석하면 안 된다. 이번 `274×52`는 정본 HUG 동작과 원문 보존이 함께 만든 🟡(b) 편차로 통과한다.

### ❌ (a)-2 · node-map 추적 정보 불완전 — P2

현재 라이브 전수검사는 인스턴스 145개, 허용 remote 아이콘 33개를 확인했다. 반면 `node-map.json`과 `final-scan.json`은 각각 132개/remote 20개로 기록되어 있다. 이전 스캔이 보이지 않는 인스턴스 자식을 건너뛰어 비밀번호 eye 인스턴스 13개를 집계하지 못한 차이다. 위반 출처는 없지만, 재개 기준 파일과 실제 현재 결과가 일치하지 않는다.

또한 `node-map.json`의 `authoredNodeIds`는 직접 만든 프레임·텍스트만 담고, 빌드 중 생성한 CI/Input/Button 등 루트 인스턴스 ID와 대부분의 인스턴스 텍스트 override ID를 개별 기록하지 않았다. `knownMutations.secondaryButtonLayerName.nodeIds`도 `null`이다. 이는 “모든 생성/변경 노드 ID를 반환·기록” 규칙을 충족하지 못한다.

정확한 수정:

1. `skipInvisibleInstanceChildren=false` 기준 provenance를 다시 저장해 `checkedCount=145`, `remoteCount=33`, 위반 0을 기록한다.
2. 화면별로 빌더가 생성한 루트 INSTANCE ID를 별도 배열로 전수 기록한다.
3. Input/Button/Modal/Footer의 변경된 TEXT ID와 마지막 레이어명 변경 ID를 전수 기록하고 `null`을 제거한다.
4. 현재 화면을 다시 읽어 존재하지 않는 ID가 0인지 확인한 뒤 `node-map.json`과 최종 스캔 집계를 함께 갱신한다.

## Layer 2 — 원본 이미지 대조

### 🟡 (b) 유지한 승인 편차

- Input/Button 높이 `50→48`
- StatusBar 약 `27.33→27`
- NavBar `48→45`
- ~~CI `78×30→42×16`~~ · ⚠️ **2026-08-21 철회** → `spec-change-2026-08-21.md` (정본 78.75×30)
- Modal `300px` 레거시 패널 → 현재 정본 `360px` 셸과 XXSM 버튼
- raw 색 → semantic Variable
- 실제 OS 키 배열 → 키보드 플레이스홀더

현재 StatusBar의 아이콘 배치, CI 크기, Button 글자 굵기, Modal 폭·정렬·높이, Footer의 저작권 행은 현재 정본 컴포넌트를 사용한 결과로 위 허용편차 범위에서 유지한다.

### ❌ (a)-1 · 로그인 본문 세로 간격 축소 — P1

빌더가 `LoginBody`의 여러 자식 사이를 공통 `10px` 간격으로 조립해, 레거시 화면의 구간별 여백을 보존하지 못했다. 컴포넌트 높이 변경은 한 요소당 2px뿐이지만 CTA 위치는 33~69px 위로 이동했다.

| 대표 화면 | 원본 | 현재 결과 | 차이 |
|---|---:|---:|---:|
| 최초 진입 · 로그인 버튼 상단 | y=330 | y=297 | **-33px** |
| 최초 진입 · 휴대전화 로그인 상단 | y=442 | y=385 | **-57px** |
| 오류 화면 · 로그인 버튼 상단 | y=368 | y=335 | **-33px** |
| 키보드 입력 A · 로그인 버튼 상단 | y=330 | y=261 | **-69px** |

초기 화면의 입력 상단은 원본 y=188, 현재 y=181로 7px 차이에 그치지만, 비밀번호→로그인과 보조 링크→휴대전화 로그인 사이의 서로 다른 원본 여백이 모두 10px 중심으로 수렴하면서 아래 요소일수록 오차가 누적된다. 키보드 화면은 플레이스홀더 시작 y=439가 승인 매핑과 맞지만, 그 위 로그인 폼이 과도하게 올라가 큰 빈 영역이 생긴다.

영향 화면:

- 일반/오류/기본 화면: `1562:3`, `1562:6`, `1562:7`, `1562:8`, `1562:14`, `1562:15`
- 팝업 배경 화면: `1562:9`~`1562:13`
- 키보드 화면: `1562:4`, `1562:5`
- 합계: **13/13**

정확한 수정:

1. `LoginBody`의 단일 `itemSpacing=10`에 의존하지 말고 원본 구간별 spacer 또는 중첩 Auto Layout으로 간격을 분리한다.
2. 현재 컴포넌트 높이 48은 유지하되, 대표 기준으로 일반 화면은 ID 입력 y≈188, 비밀번호 y≈248, 로그인 CTA y≈330, 휴대전화 로그인 y≈442에 맞춘다.
3. 오류 화면은 오류 문구 하단과 로그인 CTA 사이의 원본 여백을 복원해 CTA 상단 y≈368에 맞춘다.
4. 키보드 화면은 승인된 플레이스홀더 y=439를 유지하면서 폼을 원본 위치로 내려 로그인 CTA 상단 y≈330에 맞춘다.
5. 자동로그인·신규기기 Modal 자체는 현재 정본 위치/크기를 유지하고, 딤 아래 로그인 배경만 같은 기준으로 수정한다.

## 재검증 범위

수정 후 다음을 모두 다시 확인해야 한다.

1. 13개 화면의 문구·Input/Button/Modal 상태·비밀번호 아이콘
2. 직접 저작 raw 색 0, Pretendard 173개 이상, 출처 위반 0
3. 원본/대상 대표 5쌍의 세로 위치와 간격 재대조
4. 전체 Section에서 13개 화면 배치·잘림·overflow 0
5. `node-map.json`의 생성/변경 ID 존재 여부와 라이브 provenance 집계 일치

검문소 4 통과 조건은 위 ❌(a) 2건이 모두 0이 되는 것이다.

---

## 재검증 PASS (2026-08-20 · 수정 후)

🤖 원본대조 검증 에이전트(component-verifier) — **PASS**

### 현재 판정

| 검증층 | 결과 | 근거 |
|---|---|---|
| Layer 1 · 결정론 | **PASS** | 화면 13개, 필수 문구·상태·토큰·폰트·출처·추적 기록 위반 0 |
| Layer 2 · 이미지 | **PASS** | 원본/대상 대표 화면 5쌍에서 입력 폭·세로 간격·키보드 링크·모달 줄바꿈을 재대조 |
| Layer 3 · 적대적 | **PASS** | ❌(a) 0, ❓(c) 0, BLOCKED 0 |

- ❌(a) 코드/빌드 실수: **0건**
- 🟡(b) 사전 승인 편차: **7종 유지**
- ❓(c) 사용자 판단 필요: **0건**
- BLOCKED: **0건**

따라서 로그인 관련 13개 화면은 **검문소 4를 통과**한다. 정본 아이콘이 부족해 범위에서 제외한 로그아웃 확인 화면 1개는 이 판정에 포함하지 않는다.

### 수정 이력과 재검증 범위

최초 FAIL의 두 항목을 수정한 뒤 새 독립 컨텍스트에서 다시 검사했다.

1. **P1 · 세로 간격:** 13개 화면의 구간별 간격을 복원했다. ID 입력 y=188, 일반·키보드 로그인 y=330, 오류 화면 3개의 로그인 y=368, 키보드 y=439로 일치한다.
2. **P1 · 긴 모달 본문:** 신규기기 A·C 본문은 가로 채움, 기록 폭 310px, 자동 높이이며 잘림·화면 밖 넘침이 0이다.
3. **P2 · 추적 기록:** 보이지 않는 인스턴스 자식까지 포함한 현재 인스턴스 145개를 화면별로 전수 기록했다.
4. **재검증에서 추가 발견·수정:** Input 바깥 인스턴스만 320px이고 내부 `field`가 200px로 남았던 26건을 모두 320px/FILL로 교정했다. 키보드 화면 2개에서 빠진 `회원가입 / 아이디 찾기 / 비밀번호 찾기`도 y=398에 복원했다.

`spacing-fix-result.json`과 `modal-wrap-fix-result.json`은 첫 교정 도중 남은 위반을 보여 주는 중간 기록이다. 그 뒤 추가 교정과 전수 재스캔이 수행됐으며, 현재 판정은 아래 최신 산출물을 기준으로 한다.

- `input-helper-fix-result.json`
- `trace-screens-1-7.json`, `trace-screens-8-13.json`
- `node-map.json`, `final-scan.json`
- 최종 대상 이미지 `target-login-*-final2.png` 5장

### Layer 1 — 최종 결정론 결과

| 항목 | 결과 |
|---|---:|
| 화면 | 13/13, 모두 360×780 |
| 현재 보이는 텍스트 | 179개, 필수 원문 누락 0 |
| Input 내부 field | 26/26, 320px + FILL |
| 키보드 보조 링크 | 2/2 화면, 화면당 3개, y=398 |
| 키보드 플레이스홀더 | 2개, y=439 |
| 팝업 | 5개, Single/Dual 상태 일치 |
| 비밀번호 아이콘·Input/Button/Modal 변형 | 위반 0 |
| 직접 저작 raw SOLID fill/stroke | 0 |
| 폰트·텍스트 스타일 | 179개 전부 Pretendard, 위반 0 |
| 화면 밖 overflow | 0 |
| 로그아웃 화면 혼입 | 없음 |

#### 출처 전수검사

`skipInvisibleInstanceChildren=false` 기준 인스턴스는 **145개**다.

| 분류 | 수량 | 판정 |
|---|---:|---|
| 루트 Core 인스턴스 | 105 | 전부 화면별 기록됨 |
| 로컬 정본 인스턴스 | 112 | `remote=false` |
| 원격 아이콘 인스턴스 | 33 | 허용목록 키와 모두 일치 |
| 허용목록 밖 원격 인스턴스 | 0 | 위반 없음 |

허용 원격 키는 실제 사용된 `eye_hide`, `remove`, `close` 3종이며 모두 `registry/figma/allowed-remote-keys.json`에 존재한다.

#### P2 · node-map 완전성

두 trace와 `node-map.json`을 화면별 ID 집합으로 다시 대조했다.

| 기록 종류 | 현재 수량 | trace↔node-map 차이 |
|---|---:|---:|
| authored 노드 | 279 | 0 |
| 루트 인스턴스 | 105 | 0 |
| 전체 인스턴스 | 145 | 0 |
| 현재 보이는 텍스트 | 179 | 0 |
| spacer | 63 | 0 |

- 중복 ID: 0
- 변경 ID 배열의 `null` placeholder: 0
- 마지막 교정의 생성 노드 10개·변경 노드 64개 중 미기록: 0
- 금지 출처·raw 색·폰트·overflow·구조 위반: 0

따라서 최초 P2는 당시 Figma 추적 결과와 일치하도록 해소됐다. 역할이 존재하지 않는 화면의 위치 필드에 쓰인 `null`은 누락된 변경 ID가 아니라 `키보드 없음`, `모달 없음` 같은 명시적 부재 표시다.

### Layer 2 — 최종 이미지 대조

| 대표 화면 | 원본 대비 최종 확인 | 결과 |
|---|---|---|
| 최초 진입 | Input 실제 테두리 320px, placeholder 한 줄, ID y=188, 로그인 y=330, 보조 링크·휴대전화 로그인 위치 복원 | PASS |
| 키보드 입력 A | ID/Password 모두 표시, Input 320px, 로그인 y=330, 보조 링크 y=398, 키보드 y=439 | PASS |
| 계정 오류 | 오류 문구 잘림 없음, 로그인 y=368, 보조 링크 y=436, 휴대전화 로그인 y=479 | PASS |
| 자동 로그인 A | 배경 로그인 폼 위치 복원, 정본 Dual Modal의 제목·본문·버튼 원문 유지 | PASS |
| 신규기기 C | 긴 본문 전체 표시, 강제 줄바꿈 원문 유지, 정본 Modal 안에서 잘림 없음 | PASS |

유지한 🟡(b) 편차는 `2-mapping.md`에 승인된 Input/Button 높이, StatusBar, NavBar, Footer, CI, 정본 Modal, 토큰·Pretendard·OS 키보드 플레이스홀더다. Footer 274×52는 원문 교체에 따른 정본 HUG 결과라 이전 판정대로 정상이다.

### 최종 결론

최초 P1/P2와 재검증 중 추가로 발견한 Input 내부 폭·키보드 링크 누락은 수정됐다. 그러나 이후 사용자 실기 캡처에서 키보드 프레임의 픽셀 내용이 빈 면으로 확인됐다. 따라서 키보드 항목과 Phase 4의 최종 PASS는 **철회**하며, 입력 A/B 두 화면의 이미지 교체와 재검증 전까지 현재 판정은 **FAIL**이다.

## 사용자 캡처 기반 추가 결함

- 결함: 입력 A/B의 키보드 영역이 360×296 빈 배경으로 표시됨
- 원인: `프레임 존재·위치`를 검사했지만 프레임 내부 픽셀 내용을 원본과 대조하지 않음
- 수정 자산: `assets/android-keyboard-reference.png`
- 재검증 기준: 두 화면에서 실제 키 배열이 보이고, 나머지 11개 화면이 변경되지 않아야 함

## 모바일 Modal 교체 독립 검증 PASS (2026-08-21)

🕵️ `component-verifier`가 수정된 5개 화면의 최종 PNG와 수정 전 대표 PNG를 직접 대조했다.

| 화면 | 정본 변형 | 최종 크기 | 결과 |
|---|---|---:|---|
| `1562:9` | Mobile / Dual | 300×208 | PASS |
| `1562:10` | Mobile / Single | 300×208 | PASS |
| `1562:11` | Mobile / Single | 300×229 | PASS |
| `1562:12` | Mobile / Single | 300×208 | PASS |
| `1562:13` | Mobile / Dual | 300×250 | PASS |

- PC 닫기 아이콘과 작은 XXSM 버튼은 모두 제거됐고 모바일 LG 버튼으로 바뀌었다.
- 360px 딤 영역에서 모달 폭 300px, 좌우 패딩 30px, 중심 오차 0px다.
- 긴 문구 2개를 포함해 잘림·겹침·화면 밖 넘침·폰트 이상은 0건이다.
- 출처 62건은 로컬 52 + 허용 원격 아이콘 10이며 금지 출처 0건이다.
- 직접 저작 노드 70건의 raw SOLID fill/stroke 위반은 0건이다.

판정: ❌(a) 0 · 🟡(b) 0 · ❓(c) 0. **이번 모바일 Modal 교체 범위는 검문소 4 PASS**다. 전체 로그인 플로우는 별도 키보드 교정이 남아 있어 아직 완료 상태로 올리지 않는다.

## 앱+키보드 교체 독립 검증 PASS (2026-08-21)

🕵️ `component-verifier`가 입력 A/B의 최종 PNG와 최신 로컬 NavBar 정본 적용 상태를 독립 검증했다.

| 화면 | 적용 정본 | 위치·크기 | 결과 |
|---|---|---:|---|
| `1562:4` 입력 A | `Platform=App + Keyboard` | y=439, 360×341 | PASS |
| `1562:5` 입력 B | `Platform=App + Keyboard` | y=439, 360×341 | PASS |

- 입력 A의 아이디 포커스와 입력 B의 비밀번호 포커스·마스킹 상태가 유지됐다.
- 키보드와 앱 하단 내비가 모두 보이며 잘림·겹침은 0건이다.
- 나머지 11개 화면의 작업 전후 지문은 모두 동일하다.
- 출처 140건과 직접 작성 노드 172건 검사에서 위반은 0건이다.
- 과거 Android 참고 이미지와 최신 정본의 아이콘·명도 표현 차이는 사용자가 이번 요청에서 최신 `navbar > 앱+키보드` 정본을 최종 기준으로 명시했으므로 의도된 편차로 분류했다.

최종 판정: ❌(a) 0 · 🟡(b) 1 · ❓(c) 0. **검문소 4 PASS**다.
