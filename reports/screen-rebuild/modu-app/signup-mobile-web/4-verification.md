# Mobile Signup Web — 4. Verification

> **최신 판정: NAVBAR PATTERN FIX PASS — 2026-08-31 독립 재검증.** 신규 341px Web+Keyboard 정본을 키보드 화면 6장에 반영한 변경, 레거시 3장 대조, 전체 회귀 검사가 모두 통과했다. 기존 FULL PASS와 promoted pattern registration은 유지된다. 아래 판정은 수정 이력이며 이 최신 판정을 대체하지 않는다.

## Fast-safe PILOT 독립 검증 — 2026-08-26

> 검증자: 🕵️ `component-verifier` (빌더와 분리)  
> 범위: PILOT 4장만 — `1858:1782`, `1858:1783`, `1858:1784`, `1858:1785`  
> 판정: **FAIL** — 전체 11장 PASS 또는 전체 생성 승인으로 해석하지 않는다.

### 대조 기준

- source: `aLxh458o9BRXklRFM3YYzk`
  - 약관 `2449:31028`
  - 비밀번호 편집 `2449:31218`
  - 가입 회원 모달 `10580:19015`
  - 기존 아이디 바텀시트 `2449:31168`
- target: `cysG5U1udpQqVagYY1hWHW`, Section `1744:1782`
- 명세: `screen-spec.json`, `canonical-manifest.json`, `2-mapping.md`
- 허용편차: AD-1~AD-6만 인정

### 통과한 항목

- 필수 문구 exact 누락: 0건(4장).
- 화면 저작 노드 raw SOLID fill/stroke: 0건.
- 화면 저작 텍스트 Pretendard + TextStyle 누락: 0건.
- provenance: 4장 합계 위반 0건. 코어 인스턴스는 local, remote 인스턴스는 허용 아이콘 키만 사용.
- Mobile Header main variant는 4장 모두 local `Type=Standard / No Title`; nested StatusBar main variant는 local `Platform=Web`.
- 모달 배경과 약관 기본 화면의 overlay 제외 구조 대조: 103노드 대 103노드, 필드 차이 0건.
- snapshot before→after: `added=681 removed=0 changed=4 violations=0`.
- snapshot layout-fix before→after: `added=0 removed=0 changed=6 violations=0`.

### ❌ (a) 코드 실수 — 차단

1. **Web StatusBar 실측 높이 붕괴 — PILOT 4장 공통**
   - nested StatusBar instance는 main variant가 `Platform=Web`이어도 실제 크기가 `360×27`이다.
   - 정본 계약은 `360×77`이다.
   - 대상 이미지에서 원본에 보이는 `m.s1.co.kr` 주소창이 사라지고 얇은 회색 선만 남으며, Header 내부에 빈 공간이 생긴다.

2. **비밀번호 편집 화면 overflow와 가림** (`1858:1783`)
   - `Content`는 `clipsContent=true`, 높이 240인데 `Password Confirm Input`은 `y=222, h=72`라 아래 54px가 잘린다.
   - 대상 이미지에서 페이지 제목의 `해 주세요`가 잘리고, 확인 입력과 helper/CTA가 겹쳐 원본보다 더 가려진다.
   - fast-safe의 `overflow=0` 조건을 충족하지 못한다.

3. **약관 계열 authored content overflow** (`1858:1782`, `1858:1784`)
   - `Agreement Label` 높이 20이 `Agreement Row / All` 높이 18을 2px 초과한 채 clip된다.
   - `Agreement Row / Age` 하단이 `Agreements` 높이를 3px 초과한 채 clip된다.
   - 모달 배경은 기본 화면과 동일하지만, 동일한 overflow 결함도 그대로 복제됐다.

4. **가입 회원 모달 닫기 버튼 위치·겹침** (`1858:1784`)
   - 명세 anchor는 close `y=265`, 실제는 `y=302`다.
   - 대상 이미지에서 닫기 X가 제목 끝과 겹친다. 원본은 제목/본문과 분리된 우측 상단 위치다.

5. **가입 회원 모달 이미지 대조 불일치 — 허용편차 밖** (`1858:1784`)
   - source는 안내 2줄을 중앙 정렬 본문으로 표시한다.
   - target은 첫 줄을 좌측 굵은 제목, 둘째 줄을 좌측 본문으로 분리한다.
   - AD-1~AD-3은 앱바 제목 제거·색 토큰 수렴·비표준 글자 크기 수렴만 허용하며, 모달 정보 구조와 정렬 변경은 허용하지 않는다.

6. **AD-6 바텀시트 정본 레이아웃 훼손** (`1858:1785`)
   - local `Footer=Dual` instance 사용과 Text Selected/Default/Disabled 상태 자체는 맞다.
   - 그러나 정본 main 크기 `360×378`을 instance에서 `360×498`로 변경했고, content `itemSpacing`을 override했으며, 정본 footer를 `visible=false`로 숨겼다.
   - 이어 화면 root sibling Button 2개로 footer를 다시 만들었다. AD-6이 허용한 것은 정본 외곽 유지 + 설명문/추가 옵션 sibling 확장이지, 정본 footer 제거·대체가 아니다.
   - 캡처는 유사해 보여도 정본 외곽/상태/레이아웃을 유지한다는 적대 검증 조건을 통과하지 못한다.

7. **바텀시트 배경 이미지 대조 불일치** (`1858:1785`)
   - source에는 Web 주소창과 전체 `아이디를 입력해 주세요` 제목이 보인다.
   - target은 공통 Header 높이 결함으로 주소창이 사라지고 배경 제목도 잘린다.

### 🟡 (b) 의도된 편차

- AD-1~AD-3에 따른 No Title 사용, Semantic Variable 수렴, Pretendard TextStyle 수렴은 확인했다.
- AD-6의 설명문 sibling 추가 자체는 유지 가능하다. 단, footer 숨김·외부 대체와 정본 높이/간격 override는 AD-6 범위가 아니다.

### ❓ (c) 애매

- 0건. 현재 FAIL 항목은 명세·정본 계약·원본 이미지로 판정 가능하다.

### PILOT 검문소 결론

**FAIL.** 위 ❌(a)를 수정한 뒤 PILOT 4장만 다시 빌드·독립 검증한다. 이 검문소가 PASS하기 전 나머지 화면 일괄 생성으로 넘어가지 않는다.

---

## Fast-safe PILOT Fix2 v2 독립 재검증 — 2026-08-31

> 검증자: 🕵️ `component-verifier` (빌더 자체검사와 분리)  
> 범위: PILOT 4장만 — `1858:1782`, `1858:1783`, `1858:1784`, `1858:1785`  
> 판정: **PASS** — ❌(a) 0 · ❓(c) 0. 전체 11장 PASS 또는 전체 생성 완료로 확대 해석하지 않는다.

### 독립 실행 근거

- 최신 `screen-spec.json`, `canonical-manifest.json`, `2-mapping.md`, `3-build.md`, `node-map.json`, `scan-summary.json`과 Fix2 v2 before/expect/after를 읽었다.
- Figma target `cysG5U1udpQqVagYY1hWHW`의 네 root를 Plugin API로 직접 read-only 전수 검사했다. 빌더의 PASS 집계는 판정 근거로 재사용하지 않았다.
- source `aLxh458o9BRXklRFM3YYzk`의 약관 `2449:31028`, 비밀번호 `2449:31218`, 바텀시트 `2449:31168`, 앱 모달 `10580:19015`를 직접 다시 캡처해 live target 캡처와 대조했다.
- 허용 remote key는 `registry/figma/allowed-remote-keys.json` 23키를 실제 key로 대조했다.

### Layer 1 — 결정론 검사

| 검사 | 독립 실측 결과 |
|---|---|
| 화면·노드 | 화면 4 · visible node 681 · visible text 133 |
| 필수 문구 | exact 누락 0 |
| visible instance | 60 = local 37 + 허용 remote icon 23 |
| provenance | 위반 0 |
| 화면 저작 raw SOLID fill/stroke | 0 |
| Pretendard·TextStyle | 위반 0 |
| layout·비의도 clip/overflow | 위반 0 |

#### Mobile Header ×4

- 부모 main은 모두 local `1898:12288`, `Type=Standard / No Title, Platform=Web`, `360×149`다.
- nested StatusBar는 모두 local main `1654:37388`, `360×77`, `y=0`이다.
- AppBar는 모두 `360×56`, `y=93`이다. nested StatusBar 직접 변형 흔적은 없다.

#### 약관 기본·모달 배경

- 약관 root `1858:1782`에서 authored clip/overflow 0이다.
- 모달 root `1858:1784`에서 `Overlay Dim`, `Mobile Modal`, `Modal Close`를 제외한 배경을 경로·타입·이름·문구·좌표·크기·Variable·TextStyle·instance main/variant로 평탄화했다.
- 기본과 모달 배경은 각각 103개이며 field diff **0**이다.

#### 비밀번호 입력 `1858:1783`

- Content는 screen `y=149`, `360×294`, `clipsContent=false`다.
- 확인 Input은 screen `x=20, y=371, 320×72`; source처럼 label만 노출되고 field는 위 레이어에 가려진다.
- CTA는 local disabled Primary `x=20, y=392, 320×48`이며 keyboard 시작점 `y=440`에서 정확히 끝난다.
- root layer order는 Header → Content → NavBar(Web+Keyboard) → CTA다. CTA가 확인 field 위, keyboard 표면 위에 놓이고 키보드는 `y=440`부터 보인다. 의도 밖 clip은 0이다.
- 문구는 `비밀번호 확인`, `입력해 주세요`, `확인`을 포함해 명세와 exact 일치한다.

#### 가입 회원 안내 모달 `1858:1784`

- local Mobile Modal Dual main `1611:6731`, `x=30, y=286, 300×208`을 유지한다.
- visible message는 `이미 회원으로 가입되어 있습니다.\n아이디 : abcdefg` 두 줄 exact, width 260, `HEIGHT`, 중앙 정렬, Pretendard TextStyle이다. 기존 title 노드는 hidden이다.
- 허용 close sibling `1858:18218`은 `x=282, y=265, 24×24`다.
- canonical footer의 `취소`·`확인` 문구와 local 버튼을 유지한다.

#### 기존 아이디 Bottom Sheet `1858:1785`

- local Dual main `1654:49266`, `x=0, y=402, 360×378`이다.
- canonical content gap 24, header visible, 내부 list hidden, canonical footer visible(`screen y=712`, `360×48`)이다.
- extension `1930:581`은 `x=0, y=456, 360×256`; 설명문 뒤 local Option 4개가 screen `y=520/568/616/664`, 각 `360×48`로 이어진다.
- option 상태/main은 Selected `1654:49099`, Default `1654:49097`, Default `1654:49097`, Disabled `1839:1782`다.
- canonical footer label은 `새 아이디 사용`·`아이디 선택` exact다.
- 이전 replacement button `1858:18481`, `1858:18483`은 존재하지 않는다.

### Snapshot diff

```text
snapshot-fix2-before-v2.json  690 nodes
snapshot-fix2-after-v2.json   690 nodes
added 169 · removed 169 · changed 21 · violations 0
```

`npm run snapdiff -- snapshot-fix2-before-v2.json snapshot-fix2-after-v2.json --expect snapshot-fix2-expect-v2.json`을 독립 실행했고 exit 0, 선언 밖 변경 0을 확인했다.

### Layer 2 — source ↔ live target 이미지 대조

- 약관: 문구·체크 상태·행 순서·설명·CTA가 원본과 일치하며 Web Header 정본과 토큰/타이포 수렴만 AD-1~3 범위다.
- 비밀번호: 원본의 확인 label-only, CTA가 field를 가리는 상태, keyboard 시작 순서를 재현했다. 버튼 320×48 수렴은 AD-7 범위다.
- 모달: 원본의 중앙 정렬 2줄 안내와 Dual CTA를 재현했다. 모바일 앱 원본을 모바일 웹 배경에 조합한 차이는 사전 명세 범위다.
- 바텀시트: title→description→Selected/Default/Default/Disabled→Dual footer 순서를 재현했다. canonical 360×378과 sibling extension 조합은 AD-6 범위다.

### 🟡 (b) 의도된 편차

- AD-1~AD-3: No Title 정본 사용, Semantic Variable 수렴, Pretendard TextStyle 수렴.
- AD-6: Bottom Sheet canonical 외곽·header/footer를 유지한 채 내부 list만 숨기고 설명문+전체 local option 목록을 sibling extension으로 조합.
- AD-7: 비밀번호 확인 field를 CTA와 keyboard가 의도적으로 가리는 원본 상태 유지, CTA를 정본 320×48로 수렴.

### 증거 관리 메모

- `canonical-manifest.json`의 component ID·크기·내부 계약은 live 실측과 일치했다.
- 다만 manifest `basis`의 `buildComponentsSha256`과 `componentGuideModelSha256`은 현재 파일 해시보다 이전 값이다. 이번 판정은 캐시를 신뢰하지 않고 Figma 정본과 허용 key를 직접 재측정했으므로 화면 PASS에는 영향이 없다. 후속 전체 빌드에서 manifest를 캐시로 재사용하기 전 basis 해시는 최신 값으로 갱신해야 한다.

### ❌ (a) 코드 실수

- 0건.

### ❓ (c) 애매

- 0건.

### PILOT 검문소 결론

**PASS.** Fix2 v2 파일럿 4장은 검문소 4를 통과했다. 이 결과는 나머지 화면의 일괄 생성으로 진행할 수 있다는 의미이며, 아직 생성·검증하지 않은 전체 11장 PASS를 뜻하지 않는다.

---

## 전체 11장 최종 독립 검증 — 2026-08-31

> 검증자: 🕵️ `component-verifier` (빌더 자체검사와 분리)  
> 범위: Section `1744:1782`의 10개 회원가입 화면 + 보존 placeholder 1장  
> 판정: **FULL FAIL** — ❌(a) 3 · ❓(c) 0. 수정·재검증 전 full build 완료 또는 pattern registration으로 진행하지 않는다.

### 독립 실행 근거

- 최신 `screen-spec.json`, `canonical-manifest.json`, `2-mapping.md`, `3-build.md`, `node-map.json`, `scan-summary.json`, full snapshot 3종과 11개 compact trace를 읽었다.
- trace 11개의 SHA-256을 직접 다시 계산했고 `node-map.json` 기록과 모두 일치했다.
- target `cysG5U1udpQqVagYY1hWHW` Section `1744:1782`와 source `aLxh458o9BRXklRFM3YYzk`의 대응 root를 Figma Plugin API로 직접 read-only 측정했다. 빌더의 provisional PASS를 판정 근거로 재사용하지 않았다.
- 신규 6장과 기존 파일럿 대표 화면의 source/target 캡처를 직접 대조했다.

### 통과한 결정론 검사

| 검사 | 독립 실측 결과 |
|---|---|
| Section·화면 배열 | Section `2520×1880`; child 11; 명세 순서·이름·좌표 일치; root 모두 `360×780` |
| visible node/text | 1741 / 363 |
| visible instance | 119 = local 78 + 허용 remote icon 41 |
| exact/forbidden copy | 위반 0 |
| authored raw SOLID fill/stroke | 0 |
| Pretendard·TextStyle | 위반 0 |
| provenance | 위반 0 |
| layout·overflow·비의도 clip | 위반 0 |

- 10개 비-placeholder 화면의 부모 Mobile Header는 local Web 정본이다. 일반 화면은 main `1898:12288`, 약관 상세는 close 포함 main `1898:12349`; 모두 `360×149`, nested StatusBar main `1654:37388` local `360×77`, AppBar `y=93`, `360×56`이다.
- overlay 배경 fingerprint 4쌍은 overlay 노드 제외 후 모두 exact다: 약관 103/103 diff 0, 아이디 213/213 diff 0, 비밀번호 228/228 diff 0, 이메일 232/232 diff 0.
- 비밀번호 조건 Modal은 local Single main `1610:6729`, `300×293` HUG, 제목·4줄 불릿·Primary footer 상태가 맞다.
- 이메일 도메인 Bottom Sheet는 local None main `1654:49225`, `360×302`; naver Selected, kakao/gmail/nate/직접 입력 Default가 모두 local이다. 앞 네 option의 source 대비 `y +2`만 AD-6이며 마지막 직접 입력은 source와 같은 y다.

### Full snapshot diff

```text
snapshot-full-before.json          690 nodes
snapshot-full-after-final-v3.json 1742 nodes
added 1052 · removed 0 · changed 3 · violations 0
```

`npm run snapdiff -- snapshot-full-before.json snapshot-full-after-final-v3.json --expect snapshot-full-expect.json`을 독립 실행했고 exit 0이었다. changed 3은 보존 파일럿 root `1858:1783`, `1858:1784`, `1858:1785`의 선언된 child order뿐이다.

### ❌ (a) 코드 실수 — 차단

1. **앱 설치 환영 문구의 의미 색상이 바뀜** (`1989:358`)
   - source `2449:31021`의 `홍길동님, 환영합니다!`는 accent blue `#1d6ceb`이고, mapping도 accent/link → `color/text/state/accent`로 정했다.
   - target `1989:19036`은 `color/text/title/primary`에 바인딩되어 검정으로 보인다.
   - AD-2는 같은 역할의 Semantic Variable 수렴만 허용하므로 accent를 title primary로 바꾼 것은 허용편차가 아니다.

2. **앱 아이콘 placeholder의 크기·형태·색상 불일치** (`1989:358`)
   - source `2449:31018`은 `80×80`, radius 20, `#d9d9d9` 회색 placeholder이고 label도 회색이다.
   - target `1989:19034`는 `60×60`, radius 12, `color/bg/level-0` 흰색이며 label은 primary 검정이다.
   - source의 gray placeholder 역할을 유지하지 않았고, 크기·radius 변경을 허용하는 deviation도 없다.

3. **비밀번호 조건 Modal 닫기 버튼이 카드 밖에 배치됨** (`1996:2`)
   - source card `2449:31309`는 `x=30, y=213, 300×306`, close `2449:31313`은 `x=282, y=237, 24×24`로 카드 안쪽 상단에 있다.
   - target Modal `1996:12`는 `x=30, y=220, 300×293`, close `1996:22`는 `x=282, y=199, 24×24`로 카드 시작점보다 21px 위에 떠 있다.
   - source 구성과 정본 modal 시각 구조를 모두 벗어나며 AD-1~3으로 설명되지 않는다.

### 🟡 (b) 의도된 편차

- AD-1~AD-3: Web No Title Header, 역할이 같은 Semantic Variable, Pretendard 정본 TextStyle 수렴.
- AD-4: 외부 본인인증 placeholder `1744:1783` 보존.
- AD-5: 약관 상세는 제1조·제2조까지만 재현.
- AD-6: 두 Bottom Sheet의 정본 외곽·상태 유지 및 승인된 sibling 조합. 이메일 도메인의 앞 네 option `y +2`만 인정.
- AD-7: 비밀번호 편집 화면의 label-only 확인 필드와 CTA/keyboard 가림 순서 유지.

### ❓ (c) 애매

- 0건. 세 결함은 source 실측, mapping, 허용편차로 판정 가능하다.

### FULL 검문소 결론

**FAIL.** 구조·정본·출처·스냅샷 검사는 통과했지만 위 시각 결함 3건이 남아 있다. 세 항목을 수정한 뒤 영향 화면과 full snapshot을 다시 독립 검증해야 하며, 그 전에는 전체 빌드 완료 또는 패턴 등록을 승인하지 않는다.

---

## FIX3 전체 11장 최종 독립 재검증 — 2026-08-31

> 검증자: 🕵️ `component-verifier` (빌더 자체검사와 분리)  
> 범위: 직전 FULL FAIL 영향 노드 5개 + Section `1744:1782` 전체 11장 회귀 검사  
> 판정: **FULL PASS** — ❌(a) 0 · ❓(c) 0. 전체 빌드 완료 및 pattern registration 진행을 승인한다.

### FIX3 영향 노드 — source ↔ live target 재측정

| 항목 | source | target | 판정 |
|---|---|---|---|
| 앱 아이콘 | `2449:31018` · `x140 y269 80×80 r20` · gray `#d9d9d9` | `1989:19034` · `x140 y269 80×80 r20` · `color/bg/level-3` (`VariableID:687:17887`) | PASS |
| 아이콘 라벨 | `2449:31019` · `x150 y300` · gray | `1989:19035` · `x150 y300` · `color/text/body/tertiary` (`VariableID:8:1118`) | PASS |
| 환영 문구 | `2449:31021` · `y373` · accent blue `#1d6ceb` | `1989:19036` · `y373` · `color/text/state/accent` (`VariableID:8:1119`) | PASS |
| 비밀번호 Modal | source card `2449:31309`의 close inset `252,24` | Modal `1996:12`은 `x30 y220 300×293` 불변; close `1996:22`는 `x282 y244 24×24`, inset `252,24` | PASS |

- target의 세 paint는 모두 raw 교체가 아니라 역할이 같은 local Semantic Variable에 바인딩되어 있다.
- Modal은 local Single main `1610:6729`, close는 허용 remote key `54469d54…`를 유지한다.
- FIX3 두 대표 캡처에서 앱 placeholder/강조 문구와 Modal 내부 close 배치를 다시 눈으로 확인했다.

### FIX3 snapshot diff

```text
snapshot-fix3-before.json  5 nodes
snapshot-fix3-after.json   5 nodes
added 0 · removed 0 · changed 11 · violations 0
```

`npm run snapdiff -- snapshot-fix3-before.json snapshot-fix3-after.json --expect snapshot-fix3-expect.json`을 독립 실행했고 exit 0이었다. 변경 11건은 아이콘 x/y/size/radius/fill, 라벨 x/y/fill, welcome fill, close y로 기대 선언과 exact 일치했다.

### 전체 11장 회귀 검사

- Section `2520×1880`, child 11, 이름·순서·좌표, 모든 root `360×780` 유지.
- live 재귀 전수 집계: visible node 1741, TEXT 363, INSTANCE 119 = local 78 + 허용 remote icon 41; provenance 위반 0.
- 10개 Web Header는 local main `1898:12288` 또는 close형 `1898:12349`, `360×149`; nested StatusBar는 모두 local `1654:37388`, `360×77`; AppBar는 `y93`, `360×56`이다.
- 직전 독립 PASS 이후 snapshot에 선언된 변경은 FIX3 영향 노드 5개의 11개 속성뿐이며 text/state/field/font/layout/overflow 변경은 없다. 최신 full trace의 8개 위반 범주도 모두 0이고 SHA-256 `db2e964f…ba4c5d`는 `node-map.json`과 직접 재계산 값이 일치했다.
- overlay 배경 fingerprint 4쌍을 live에서 다시 평탄화 대조했고 모두 field diff 0이다: `1↔2a1`, `3↔2b1`, `4↔4a1`, `5↔5a1`.
- canonical manifest basis 해시는 현재 정본 3종과 모두 일치한다: build-components `28f3f60c…`, guide model `e58b0275…`, allowed remote keys `5b3a99e1…`.

### 🟡 (b) 의도된 편차

- 기존 승인 AD-1~AD-7만 유지됐다. FIX3에서 새 허용편차를 추가하지 않았다.
- 앱 설치 gray raw 색은 같은 역할의 `color/bg/level-3`, `color/text/body/tertiary`로 수렴해 AD-2 범위다.
- source Modal의 절대 y 차이는 target canonical Modal y220을 유지하면서 close의 카드 내부 inset `252,24`를 보존한 정본 수렴이다.

### ❌ (a) 코드 실수

- 0건.

### ❓ (c) 애매

- 0건.

### FULL 검문소 결론

**PASS.** FIX3 영향 범위와 전체 11장 회귀 검사가 모두 통과했다. 회원가입 모바일 웹 패턴은 full build 완료로 판정하며 다음 단계인 pattern registration으로 진행해도 된다.

---

## 배경 토큰 교정 전체 독립 재검증 — 2026-08-31

> 검증자: 🕵️ `component-verifier` (제작자 자체 집계와 분리)  
> 범위: Section `1744:1782` 전체 11장, 배경 토큰 변경과 전체 회귀  
> 판정: **BG TOKEN FIX PASS** — ❌(a) 0 · ❓(c) 0. 기존 pattern registration 승인을 유지한다.

### 화면 루트와 level-1 잔여 사용 — live 전수 측정

- 아래 11개 화면 root의 첫 fill은 모두 `color/bg/level-0` (`VariableID:687:17884`)에 바인딩되어 있다.
  - `1858:1782`, `1744:1783`, `1989:356`, `1858:1783`, `1989:357`, `1989:358`
  - `1989:359`, `1858:1784`, `1858:1785`, `1996:2`, `1996:19300`
- `color/bg/level-1` (`VariableID:687:17885`) 잔여는 정확히 8개다.
  - 화면 저작 노드 2개: placeholder action `1744:1787`, `1744:1789`
  - 정본 NavBar 내부 keyboard 6개: 화면 `1989:356`, `1858:1783`, `1989:357`, `1858:1785`, `1996:2`, `1996:19300`의 nested `1654:37652`
- 이 8개 외 화면 root 또는 authored node의 level-1 hit는 0이다. 유지 대상 8개는 mapping에 선언된 action/keyboard 깊이 표현이므로 교정 대상이 아니다.

### Snapshot diff

```text
snapshot-bg-level-fix-before.json  1742 nodes
snapshot-bg-level-fix-after.json   1742 nodes
added 0 · removed 0 · changed 11 · violations 0
```

`npm run snapdiff -- snapshot-bg-level-fix-before.json snapshot-bg-level-fix-after.json --expect snapshot-bg-level-fix-expect.json`을 독립 실행했고 exit 0이었다. 변경 11건은 위 화면 root 11개의 fill binding `level-1 → level-0`뿐이며 geometry·order·text·component state 변경은 없다.

### 전체 11장 회귀 검사

- live 재귀 전수 집계는 visible node 1741, TEXT 363, INSTANCE 119로 이전 FULL PASS와 동일하다.
- 화면 저작 raw paint, Pretendard/TextStyle, provenance, 화면 밖 overflow, 비의도 clip 위반을 직접 재검사해 모두 0을 확인했다.
- text/state/field는 snapshot상 변경 0이며 이전 독립 FULL PASS 명세와 동일하다. 최신 full trace에서도 8개 위반 범주가 모두 0이다.
- trace `trace-bg-level-fix-full.json`의 SHA-256 `801469c2…edb23`은 `node-map.json`·`scan-summary.json` 기록과 직접 재계산 값이 일치한다.
- 실제 background pair 4쌍을 overlay top-level만 제외하고 live 평탄화 대조했다.
  - `1858:1782 ↔ 1858:1784`: 103/103, diff 0
  - `1989:356 ↔ 1858:1785`: 205/205, diff 0
  - `1858:1783 ↔ 1996:2`: 228/228, diff 0
  - `1989:357 ↔ 1996:19300`: 216/216, diff 0
- 대표 base/overlay 캡처를 직접 확인했고 흰 화면 배경, dim, modal, keyboard 표면의 시각 회귀가 없다.

### 🟡 (b) 의도된 유지

- placeholder action 2개와 정본 keyboard 내부 6개의 `level-1`은 화면 루트 배경이 아니라 작은 action/깊이 표면이다. mapping 선언대로 유지했다.
- 이번 교정은 새 허용편차를 추가하지 않고 화면 배경 역할만 `level-0`으로 바로잡았다.

### ❌ (a) 코드 실수

- 0건.

### ❓ (c) 애매

- 0건.

### BG TOKEN FIX 검문소 결론

**PASS.** 교정 범위는 화면 root fill binding 11건으로 정확히 제한됐고 전체 11장 회귀가 없다. 기존 FULL PASS와 pattern registration은 계속 유효하다.

---

## Section 투명화 · NavBar stacking 독립 재검증 — 2026-08-31

> 검증자: 🕵️ `component-verifier` (제작자 자체 집계와 분리)  
> 범위: Section `1744:1782`, overlay `1858:1785`·`1996:2`·`1996:19300`, 전체 11장 회귀  
> 판정: **SECTION/NAVBAR FIX PASS** — ❌(a) 0 · ❓(c) 0. promoted pattern registration을 유지한다.

### Section과 11개 화면 root

- Section `1744:1782`은 `Pattern / Mobile Web Signup`, `2520×1880`, `fills.length=0`으로 투명하다.
- Section의 11개 직접 자식은 기존 ID·이름·위치·`360×780` 크기와 다음 순서를 그대로 유지한다.
  - `1858:1782`, `1744:1783`, `1989:356`, `1858:1783`, `1989:357`, `1989:358`
  - `1989:359`, `1858:1784`, `1858:1785`, `1996:2`, `1996:19300`
- 11개 root의 첫 fill은 모두 `color/bg/level-0` (`VariableID:687:17884`)이다.

### Overlay 직접 자식 순서 — live exact

세 root는 모두 `layoutMode=NONE`이며 직접 자식의 geometry·fill·text·main component·component properties를 유지했다.

| 화면 | back → front 직접 자식 ID |
|---|---|
| `1858:1785` 2b1 | `1858:18221`, `1858:18431`, `1858:18447`, `1858:18449` Dim, `1858:18282` NavBar, `1858:18450` Bottom Sheet, `1930:581` Extension |
| `1996:2` 4a1 | `1996:3`, `1996:4`, `1996:10`, `1996:11` Dim, `1996:9` NavBar, `1996:12` Modal, `1996:22` Close |
| `1996:19300` 5a1 | `1996:19301`, `1996:19303`, `1996:19309`, `1996:19310` Dim, `1996:19302` NavBar, `1996:19311` Bottom Sheet, `1996:19330` Option |

- 세 화면 모두 invariant `Dim index 3 < NavBar index 4 < Panel index 5`를 정확히 만족한다.
- Extension·Close·추가 Option은 각각 index 6으로 Panel 위에 유지된다.

### Snapshot diff

```text
snapshot-section-navbar-fix-before.json  1742 nodes
snapshot-section-navbar-fix-after.json   1742 nodes
added 0 · removed 0 · changed 12 · violations 0
```

`npm run snapdiff -- snapshot-section-navbar-fix-before.json snapshot-section-navbar-fix-after.json --expect snapshot-section-navbar-fix-expect.json`을 독립 실행했고 exit 0이었다. 변경은 Section fill 제거 1건과 세 root의 direct child index 11건뿐이다. geometry·text·state·component properties·screen root fill 변경은 0이다.

### 전체 회귀와 콘텐츠 동일성

- live 전수 집계는 visible node 1741, TEXT 363, INSTANCE 119 = local 78 + 허용 remote 41로 이전 PASS와 동일하다.
- authored raw paint, Pretendard/TextStyle, provenance, 화면 밖 overflow, 비의도 clip 위반은 모두 0이다. snapshot상 text/state/field 변경도 0이다.
- 보호된 `level-1`은 placeholder action `1744:1787`·`1744:1789`와 nested keyboard 6개, 정확히 8개다. 이외 authored/root hit는 0이다.
- child index를 제외한 order-insensitive 콘텐츠 fingerprint를 live에서 독립 재계산했다.
  - `1989:356 ↔ 1858:1785`: 205/205, diff 0
  - `1858:1783 ↔ 1996:2`: 228/228, diff 0
  - `1989:357 ↔ 1996:19300`: 216/216, diff 0
- trace `trace-section-navbar-fix-full.json`의 SHA-256 `4e5ead56…bd1457`은 `node-map.json`·`scan-summary.json` 기록과 직접 재계산 값이 일치한다.
- overview와 overlay 3장 캡처를 직접 확인했다. NavBar는 Dim에 가려지지 않으며 Bottom Sheet/Modal은 NavBar보다 앞에 렌더링된다.

### 🟡 (b) 의도된 편차

- AD-8에 따라 overlay stacking을 콘텐츠 동일성 검사와 분리했다. NavBar를 Dim 앞, Panel 뒤에 둔 순서가 의도된 교정이다.
- Section은 화면 표면이 아니므로 fill 없이 유지하고, 실제 배경은 각 `360×780` 화면 root가 소유한다.

### ❌ (a) 코드 실수

- 0건.

### ❓ (c) 애매

- 0건.

### SECTION/NAVBAR FIX 검문소 결론

**PASS.** Section 투명화와 세 overlay stacking 교정은 AD-8 및 snapshot 선언과 exact 일치하며 콘텐츠·정본·토큰 회귀가 없다. 기존 FULL PASS와 promoted pattern registration은 계속 유효하다.

---

## NavBar Web+Keyboard 패턴 반영 독립 재검증 — 2026-08-31

> 검증자: 🕵️ `component-verifier` (빌더와 분리, Figma read-only)  
> 범위: base `1989:356`·`1858:1783`·`1989:357`, overlay `1858:1785`·`1996:2`·`1996:19300`, Section `1744:1782`  
> 판정: **NAVBAR PATTERN FIX PASS** — ❌(a) 0 · ❓(c) 0. promoted registration을 유지한다.

### 신규 canonical NavBar와 6개 instance

- canonical local set `2238:17407`, `Platform=Web + Keyboard` variant `2238:17258`은 `360×341`이다.
- direct children은 `keyboard y=0, 360×296`과 `android-nav y=296, 360×45`뿐이며 `browser-toolbar`는 없다.
- 화면 instance 6개 `1989:399`, `1858:17880`, `1989:18789`, `1858:18282`, `1996:9`, `1996:19302`는 모두:
  - local main `2238:17258` (`remote=false`)
  - `x=0, y=439, 360×341`
  - nested keyboard/android-nav의 y·height·visible이 canonical exact
  - old nested android-nav y override 0, browser-toolbar hit 0
- 다중 캡처에서 하단 아이콘이 안 보인다는 후보를 적대 재검사했다. 6개 모두 `android-nav visible=true, opacity=1, y=296, h=45`이며 base 3/4/5 개별 원본 크기 캡처에서도 아이콘 3개가 보인다. 결함이 아니다.

### Overlay Dim·stacking·Panel 불변

| root | Dim | NavBar | Panel | Panel 위 sibling |
|---|---|---|---|---|
| `1858:1785` | `1858:18449` `0,0,360×735` index 3 | `1858:18282` index 4 | Bottom Sheet `1858:18450` `y402, 360×378` index 5 | Extension `1930:581` index 6 |
| `1996:2` | `1996:11` `0,0,360×735` index 3 | `1996:9` index 4 | Modal `1996:12` `30,220,300×293` index 5 | Close `1996:22` index 6 |
| `1996:19300` | `1996:19310` `0,0,360×735` index 3 | `1996:19302` index 4 | Bottom Sheet `1996:19311` `y394, 360×302` index 5 | fifth Option `1996:19330` index 6 |

- 세 화면 모두 `layoutMode=NONE`, invariant `Dim < NavBar < Panel`을 유지한다.
- 패널 geometry·text·option order/state·footer·extension·close는 기존 승인 AD-6/AD-8에서 변경되지 않았다.

### Compact snapshot diff

```text
base:    16 → 16 · added 0 · removed 0 · changed 9  · violations 0
         main component 3 + y 3 + height 3
overlay: 41 → 41 · added 0 · removed 0 · changed 12 · violations 0
         main component 3 + y 3 + height 6(NavBar 3 + Dim 3)
```

- base: `snapshot-navbarfix-base-before.json` → `snapshot-navbarfix-base-after.json`, expect exact, exit 0.
- overlay: `snapshot-navbarfix-before.json` → `snapshot-navbarfix-overlay-after.json`, expect exact, exit 0.
- 생성·삭제·문구·Panel·extension·option·modal·close·화면 순서 변경은 0이다.

### 전체 결정론 회귀

- Section `1744:1782`은 fill 없는 `2520×1880`, 11개 root 순서·geometry 불변이다. 모든 screen root는 `color/bg/level-0`이다.
- live current count는 visible node 1639, TEXT 357, INSTANCE 119 = local 78 + 허용 remote icon 41이다.
- 이전 1741/363 대비 node 102·TEXT 6 감소는 6개 browser toolbar subtree 제거의 기대 결과다.
- authored raw fill/stroke, Pretendard/TextStyle, provenance, layout, overflow 위반은 모두 0이다.
- 6개 대상 required text 누락 0, forbidden text hit 0, component state 회귀 0이다.
- order-insensitive base↔overlay background fingerprint:
  - `1989:356 ↔ 1858:1785`: 188/188, diff 0
  - `1858:1783 ↔ 1996:2`: 211/211, diff 0
  - `1989:357 ↔ 1996:19300`: 199/199, diff 0

### 레거시 3장 이미지 대조

- legacy `2225:15556`, `2225:15638`, `2225:15711`은 keyboard `y440 h292`, phone-nav `y732 h48`이다.
- target은 canonical keyboard screen `y439 h296`, android-nav `y735 h45`로 하단 구조와 총 화면 높이를 보존한다. 1~3px 차이는 정본 플랫폼 셸 수렴이다.
- 2b1·4a1·5a1 최신 캡처에서 browser-toolbar 제거, keyboard·android-nav 노출, Dim 하단, Panel stacking을 확인했다.

### 🟡 (b) 승인 편차

- AD-6: Bottom Sheet 정본 외곽·footer를 유지한 sibling extension/다섯 번째 option 조합.
- AD-8: NavBar를 Dim 앞, Panel 뒤에 두고 child index와 콘텐츠 동일성을 분리 검증.
- legacy keyboard/phone-nav의 292/48px를 정본 296/45px로 수렴한 차이.

### ❌ (a) 코드 실수

- 0건.

### ❓ (c) 애매

- 0건.

### NAVBAR PATTERN FIX 결론

**PASS.** 신규 NavBar 정본 반영과 6개 화면의 레이아웃·패널·문구·출처 회귀 검사가 통과했다. 기존 promoted registration은 계속 유효하다.
