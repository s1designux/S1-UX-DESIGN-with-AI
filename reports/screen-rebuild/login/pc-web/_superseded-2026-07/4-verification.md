# screen-rebuild 4단계 — 3층 검증: PC 웹 로그인 화면

- **검증 주체:** 🤖 원본대조 검증 에이전트 (component-verifier) — 빌더(screen-rebuilder)와 분리된 컨텍스트
- **원본:** 261:13153 "웹_로그인 화면"
- **재현(검증 대상):** 268:369 "웹_로그인 화면" (Patterns PC 80:16697 · Section 268:368 "로그인 (PC Web)")
- **파일 key:** cysG5U1udpQqVagYY1hWHW
- **기준 문서:** 1-inventory.md (전수표 21요소) · 2-mapping.md (허용편차 5건) · node-map.json
- **읽은 도구:** use_figma 트리 스캔(73노드) + boundVariables 스캔 + getMainComponentAsync 프로비넌스 + get_screenshot 시각대조

---

## Layer 1 — 기계(결정론) 검증 결과

### 1) 텍스트 정확 일치 — ✅ 전건 일치
재현 프레임의 모든 TEXT 노드 characters를 원본 전수표 verbatim과 대조:

| 요소 | 원본 verbatim | 재현 characters | 판정 |
|------|--------------|-----------------|------|
| GNB 서비스명 | `통근버스 운영 시스템` | `[서비스명]` | 🟡 허용편차1(브랜딩) |
| 언어 | `한국어` | `한국어` | ✅ |
| 중앙 로고 | (SAMSUNG 이미지) | `[서비스 로고]` | 🟡 허용편차1(브랜딩) |
| 아이디 placeholder | `아이디를 입력해 주세요.` | `아이디를 입력해 주세요.` | ✅ |
| 비밀번호 placeholder | `비밀번호를 입력해 주세요.` | `비밀번호를 입력해 주세요.` | ✅ |
| 체크박스 | `아이디 저장` | `아이디 저장` | ✅ |
| 버튼 | `로그인` | `로그인` | ✅ |
| 링크1 | `아이디 찾기` | `아이디 찾기` | ✅ |
| 링크2 | `비밀번호 찾기` | `비밀번호 찾기` (노드명 `비밀번호 초기화`이나 렌더 verbatim 일치) | ✅ |
| 약관1 | `이용약관` | `이용약관` | ✅ |
| 약관2 | `개인정보 처리방침` | `개인정보 처리방침` | ✅ |
| 약관3 | `위치기반 서비스 이용약관` | `위치기반 서비스 이용약관` | ✅ |
| 사업자정보 | `(주)에스원   사업자등록번호 208-81-13302    대표이사 정해린    04511 서울특별시 중구 세종대로 7길 25 에스원 빌딩` | 동일 (다중 공백 포함 일치) | ✅ |
| 카피라이트 | `© S-1 Corp. All Rights Reserved.` | `© S-1 Corp. All Rights Reserved.` | ✅ |

→ **1글자 불일치 0건.** 브랜딩 제네릭화 2건만 허용편차1로 정상 제외.

### 2) fills/strokes Variable 바인딩 — ✅ raw 0건 (화면 저작 노드)
화면 저작 프레임/텍스트/장식 23노드 boundVariables 스캔:
- 루트 268:369 fill = `color/navigation/background` ✅
- 중앙 로고·하단 링크 ×2·약관 ×3·사업자·카피 텍스트 = 전부 `color/text/body/tertiary` ✅
- 링크 구분선·푸터 구분선 ×2 = `color/icon/gray-light` ✅
- 푸터 269:5722 fill = `color/navigation/background`, stroke = `color/line/gray/subtle` ✅
- 헤더/본문/카드 컨테이너 프레임 = fill 없음(투명) — raw 아님 ✅

→ **화면 저작 raw fill/stroke 0건.** web tab bar(268:5646) 브라우저 크롬 목업은 허용편차4로 검사 제외. 인스턴스 내부 색은 컴포넌트 소관(검사 범위 밖).

### 3) 인스턴스 프로비넌스 — ✅ 외부/레거시 라이브러리 instance 0건
교체 가능한 6개 instance의 mainComponent 출처:

| instance | mainComponent set | state/props | remote | 판정 |
|----------|------------------|-------------|--------|------|
| web tab bar 268:5646 | `web tab bar` | Property 1=1920 | true | ✅ 정본 세트 |
| login_GNB 268:5647 | `login_GNB` | state=ver1 | true | ✅ 정본 세트 |
| 아이디 입력 269:4559 | `input` | platform=pc-md, **state=default**, option=off | true | ✅ |
| 비번 입력 269:4560 | `input` | platform=pc-md, **state=default**, option=icon_1 | true | ✅ |
| 체크박스 269:4561 | `checkbox` | size=pc, **state=default**, label=on | true | ✅ |
| 로그인 버튼 269:4562 | `button` | variant=primary, size=medium, **state=disabled**, icon=off | true | ✅ |
| eye-off 아이콘 I269:4560;1980:48706 | (V2.2 ic_비밀번호미표시) | Property 1=Solid | true | ✅ 원본 아이콘 |
| globe 아이콘 (GNB 언어) | (V2.2 아이콘) Component 80 | Property 1=Line | true | ✅ 원본 아이콘 |

- `remote: true`는 **이 파일이 참조하는 발행 라이브러리(V3.0 정본)** 의 컴포넌트로, 원본 화면도 동일 세트를 사용했다(input/checkbox/button/login_GNB/web tab bar 세트 동일). 외부·레거시 라이브러리 instance 아님.
- 입력·체크박스·버튼·GNB·tab bar·eye-off·globe 모두 임의 제작이 아닌 **정본 세트의 INSTANCE**임을 확인. 임의 제작 적발 0건.

### 4) variant/상태 — ✅ 원본 일치
- 로그인 버튼 269:4562 = **state=disabled** ✅ (원본도 disabled — 허용편차2로 사용자 확정)
- 입력 ×2 = **state=default** (empty placeholder) ✅
- 체크박스 269:4561 = **state=default, 체크마크 vector 없음(unchecked)** ✅
- 비번 입력 = option=icon_1 (eye-off) ✅

### 5) figma-use 잔재 — ✅ 0건
- 루트 268:369 = **VERTICAL auto-layout**, 1920×1080 ✅ (createFrame 100px 고정 함정 없음)
- 헤더 268:5645 = sizeH=**FILL** / sizeV=**HUG** ✅
- 본문 269:4553 = sizeH=FILL / sizeV=FILL / **layoutGrow=1** (세로 grow) / CENTER·CENTER ✅
- 푸터 269:5722 = sizeH=**FILL** / sizeV=**HUG** ✅
- 카드 269:4555 = 460 고정폭 / HUG height ✅, 입력·버튼 내부 sizeH=FILL ✅
- 미성장 spacer·고정 100px·hug 누락 없음.

### 6) 원본 요소 누락 — ✅ 0건 (21요소 전수 대조)
| 전수표 # | 요소 | 재현 노드 | 판정 |
|---|------|----------|------|
| 1 | 크롬 탭바 | 268:5646 | ✅ |
| 2 | GNB 바 | 268:5647 | ✅ |
| 3 | GNB 로고 | I268:5647;8177:208696 (visible=false, 브랜딩 제거) | 🟡 허용편차1 |
| 4 | GNB 서비스명 | I268:5647;8177:208697 `[서비스명]` | 🟡 허용편차1 |
| 5 | 언어 선택 | slot_utility + 한국어 | ✅ |
| 6 | 중앙 로고 | 269:4554 `[서비스 로고]` | 🟡 허용편차1 |
| 7 | 아이디 입력 | 269:4559 | ✅ |
| 8 | 비밀번호 입력 | 269:4560 (+eye-off) | ✅ |
| 9 | 체크박스 | 269:4561 | ✅ |
| 10 | 로그인 버튼 | 269:4562 (disabled) | ✅ |
| 11 | 아이디 찾기 | 269:4565 | ✅ |
| 12 | 구분선(링크) | 269:4566 (1×12) | ✅ |
| 13 | 비밀번호 찾기 | 269:4567 | ✅ |
| 14 | 푸터 바 | 269:5722 | ✅ |
| 15 | 약관1 이용약관 | 269:5725 | ✅ |
| 16 | 약관2 개인정보 처리방침 | 269:5727 | ✅ |
| 17 | 약관3 위치기반… | 269:5729 | ✅ |
| 18 | 푸터 구분선 ×2 | 269:5726 / 269:5728 (1×8) | ✅ |
| 19 | 사업자 정보 | 269:5730 | ✅ |
| 20 | 카피라이트 | 269:5731 | ✅ |
| 21 | 푸터 S1 로고 | 269:5732 (C/IMG/Logo/S1_g 벡터) | ✅ |

→ 제외 합의 항목(261:13171 스트레이 푸터 / 261:13161 숨김텍스트)은 재현에서 정상 제외됨(node-map removed.strayHiddenText 269:4558). **누락 0건.**

---

## Layer 2 — 이미지 대조 결과

원본 261:13153 vs 재현 268:369 get_screenshot 나란히 시각 대조:
- 헤더 크롬 목업·GNB 라인·언어 globe = 시각 동일 ✅
- 입력 2필드(placeholder 회색)·eye-off 아이콘·체크박스(빈 박스)·**disabled 회색 버튼**·하단 링크 구분선 = 동일 ✅
- 푸터 약관3·구분선2·사업자정보·카피라이트·에스원 워드마크(우측) = 동일 ✅
- 브랜딩만 `[서비스명]`/`[서비스 로고]` 로 치환 = 허용편차1 ✅

### 시각 차이(허용편차 범위 내)
- **로고+카드 묶음의 세로 위치**: 원본은 카드 상단 y≈324(화면 30% 지점, 로고가 그 위)로 다소 위쪽 배치. 재현은 본문이 CENTER/CENTER auto-layout이라 로고+카드 묶음이 본문 높이(807) 중앙에 정렬됨(카드 더 아래). → **허용편차3(반응형 재구성: 절대좌표→FILL/center)** 에 해당. 로고↔카드 gap(50px)·카드 폭(460)·요소 구성은 동일. (a)코드실수 아님.
- 그 외 색·치수·정렬·간격은 시각 동일.

### 반응형(1440×1000) 대응
- 헤더/푸터 FILL·본문 grow·카드 460 중앙·버튼 FILL 구조가 갖춰져 있어 리사이즈 대응 가능(node-map responsiveVerified 기록과 구조 일치 확인). 별도 write 검증은 검증 단계에서 수행하지 않음(구조 근거로 판정).

---

## Layer 3 — 적대적 분류

### ❌ (a) 코드 실수 — **0건**
색 오바인딩·variant 누락·텍스트 오타·누락 요소·raw 색·임의 제작·외부 라이브러리 instance·figma-use 잔재 — **전 항목 적발 없음.**

### 🟡 (b) 의도된 편차 (허용편차 선언서) — 정상
- 🟡 GNB 서비스명 `[서비스명]` + GNB 로고 hidden + 중앙 로고 `[서비스 로고]` — 허용편차1(브랜딩 제네릭화, 사용자 확정)
- 🟡 로그인 버튼 state=disabled — 허용편차2(사용자 확정)
- 🟡 로고+카드 세로 중앙 정렬(절대좌표→CENTER/CENTER) — 허용편차3(반응형 재구성)
- 🟡 web tab bar raw 색 유지 — 허용편차4(브라우저 크롬 목업)

### ❓ (c) 확인 요청 — **0건**
애매 항목 없음. (node-map의 needsDecision "GNB 로고 placeholder 텍스트 삽입 불가→visible=false 처리"는 빌드 시점 결정사항으로, 결과상 브랜딩 제거가 허용편차1을 충족하므로 검증 ❌ 아님. 단, **GNB 자리에 `[서비스 로고]` 텍스트 placeholder가 들어가지 않고 빈 자리로 남은 점**은 향후 GNB 컴포넌트에 로고 슬롯을 추가할지 여부의 디자인 결정 사항으로 오케스트레이터에 보고만 — 현 화면 충실도에는 영향 없음.)

---

## 종합 판정

| Layer | 결과 |
|-------|------|
| Layer 1 (기계) | ✅ 텍스트 일치·raw 0·프로비넌스 정본·variant 일치·잔재 0·누락 0 |
| Layer 2 (이미지) | ✅ 시각 동일 (차이는 허용편차1·3 범위 내) |
| Layer 3 (적대적) | ❌(a) **0건** · 🟡(b) 4건(전부 선언된 허용편차) · ❓(c) 0건 |

### → **PASS — ❌(a) = 0건.** 4단계 검문소 통과.

보고만(차단 아님): GNB 로고 자리는 브랜딩 제거(hidden)로 처리됐고 `[서비스 로고]` 텍스트 placeholder는 GNB 인스턴스 내부라 삽입 불가했음. 공통 패턴화 시 GNB 정본 컴포넌트에 로고 슬롯(INSTANCE_SWAP/placeholder variant) 추가 여부는 오케스트레이터/디자인 결정 사항.
