# Input 트레일링 아이콘 정렬 보정 검증 — component-verifier

검증 대상: Input 세트(330:24272, 112 variant) field 정렬을 트레일링 클러스터로 통일.
파일: cysG5U1udpQqVagYY1hWHW / 페이지 Core (5:5706). 검증자: 🤖 component-verifier (빌더와 분리).
Figma 인증 사용자: s1designux@gmail.com (삼성에스원).
이전 검증(HOLD, Editing+Password ON × 중앙 부유 ❓(c)) → 본 보정으로 해소 여부 독립 재검증.

## 빌더 변경 요약 (검증 대상)
- Editing(16): field SPACE_BETWEEN → MIN. [텍스트+caret] = lead 프레임(grow1, FILL) 좌측, 트레일링 [eye, remove] 순.
- 비-Editing(Default/Filled/Error/Correct/Read/Disabled): field MIN, 텍스트 grow1(FILL) 좌측 + eye 우측.
- 생성기 build-components.ts buildInput 동일 반영.

## 1. 구조 전수 스캔 (use_figma, 사실 추출) — 정확 대조

| 점검 | 결과 |
|------|------|
| 세트 total / 상태 | 112 (Default·Filled·Editing·Error·Correct·Read·Disabled 각 16) |
| Editing field align | MIN (전 Editing) ✅ (이전 SPACE_BETWEEN 제거 확인) |
| Editing 자식 순서 | [lead, eye, remove] (눈 먼저, × 나중) ✅ |
| lead grow/sizing | grow=1, sizingH=FILL ✅ (좌측 채움) |
| 비-Editing field align | MIN ✅ |
| 비-Editing 텍스트 grow | grow=1, FILL ✅ (Default/Filled/Error/Correct/Read/Disabled 전부) |
| eye 기본 visible | false, grow=0, FIXED 24px (전 112) ✅ |

## 2. ON 렌더 실측 + 스크린샷 (임시 인스턴스 → screenshot → 제거)

MD-PC 3종 임시 인스턴스에 `setProperties({'Password Icon#371:0': true})` 적용 후 가시 자식 x/w 실측:

| variant | 가시 자식 (x, w) | 판정 |
|---------|-----------------|------|
| Editing-ON | lead(16,124) → eye(140,24) → remove(164,24) | ✅ [눈][×] 우측 인접, 눈이 × 왼쪽. 중앙 부유 해소 |
| Default-ON | 입력(16,148) → eye(164,24) | ✅ 텍스트 좌측 채움, 눈 우측 고정 |
| Filled-ON  | 텍스트(16,148) → eye(164,24) | ✅ 텍스트 좌측 채움, 눈 우측 고정 |

스크린샷 육안 대조: Editing(파란테두리) = "텍스트 |" 좌측, 눈+× 우측 인접 클러스터(겹침·중앙부유 없음). Default/Filled = 눈 단독 우측. 사용자 요구(눈 ON 시 [눈][×] 우측 인접) 충족. ✅
임시 인스턴스 3개 전량 제거, leftover 0 확인. ✅

## 3. 회귀 (OFF 무영향) — 정확 대조
eye 전 112 variant 기본 visible=false·grow=0 → 오토레이아웃이 숨김 자식 미점유. OFF 시 Default/Filled/Editing 모두 눈 공간 없이 기존과 동일. (이전 검증에서 OFF 렌더 동일 확인분 유지.) ✅

## 4. 토큰 바인딩 보존 — 정확 대조
전 field 노드 fills/strokes 미바인딩 raw hex 스캔 = **0건**. 정렬만 변경, fill/border 바인딩 미손상. ✅

## 5. Provenance (키 기반, getMainComponentAsync 실제 출력) — 정확 대조

| inst | mainComponent | key | remote | count | 판정 |
|------|---------------|-----|--------|-------|------|
| eye | Property 1=Line | d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7 | true | 112 | ICON_OK (allowed-remote-keys eye_hide 일치) |
| remove | Property 1=line | 24b2df622d341e0af21cd4b23b4a7d23b97a5ea7 | true | 16 | ICON_OK (allowed-remote-keys remove 일치) |

외부 라이브러리 유입 0. EXTERNAL_VIOLATION 0. ✅

## 6. Gate 13 (생성기 §D) 결정론 게이트

| 게이트 | 결과 |
|--------|------|
| installer:check (tsc) | ✅ PASS |
| components:keycheck | ✅ 누락 0 (color 130/177, number 6/103) |
| components:anatomy | ✅ 5규칙 충족 |
| components:iconpolicy | ✅ 위반 0 (eye·remove makeIconInstance 경로) |

git diff build-components.ts: buildInput 에 (a) field.primaryAxisAlignItems="MIN" 전 variant (b) Editing = lead(텍스트+caret) grow1 FILL, clearIcon 을 eye append 뒤에 append (c) 비-Editing 텍스트 grow1. Figma 결과와 일치.

기록: `installer-build-verify-check.js --record --by component-verifier --verdict pass --change structural` → ✅ sha256:f60d0fca569e…

## 판정
- ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 → **PASS. 이전 HOLD 해소.** Gate 13 pass 기록 완료.

> ⚠️ 검증 범위 밖: 같은 diff 의 다른 컴포넌트(WebTabBar 등) 미검증. Figma 캔버스 전체 패킹 붕괴 육안은 코드 레벨 범위 밖(코드상 위험만 점검 — 발견 0).
