# PC Login Box — 3단계 빌드 기록 (🏗️ figma-library-builder)

> 빌드만 함. 합격 판정 없음 — 4단계 component-verifier 소관.
> 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 `80:16697` (Patterns PC) · 빌드일 2026-10-02 · 빌드 코드 `build-code.js` (STEP A → B)

## 노드

| 노드 | id | 비고 |
|---|---|---|
| Section `Pattern / PC Login — 부품` | 2730:527 | x0 y-800, 700×640, 바탕 color/bg/level-3 (기존 Section 2703:2 = 0,0 8440×2560 과 안 겹침) |
| COMPONENT `PC Login Box` | 2730:528 | 섹션 안 x200 y120, 300×272, VERTICAL, 폭 FIXED 300·높이 HUG, 가로 가운데, 채움 없음 |
| CI / 에스원 / Blue | 2730:529 | CI 2614:73962 Brand=에스원 Color=Blue |
| Spacer / CI-Fields | 2730:532 | h34 |
| Fields | 2730:533 | VERTICAL gap 10, FILL |
| Input / ID | 2730:534 | Input 2614:79536 Size=MD State=Default Message=Off Break=PC, Password Icon=false, field FILL, `아이디를 입력해 주세요.` |
| Input / Password | 2730:539 | 같음, Password Icon=true, `비밀번호를 입력해 주세요.` |
| Spacer / Fields-Login | 2730:553 | h32 |
| Button / 로그인 | 2730:554 | Button 2614:76987 Variant=Primary Size=MD Break=PC State=Disabled, FILL, `로그인` |
| Spacer / Login-Links | 2730:556 | h16 |
| **SLOT `Links`** | 2730:565 | type=SLOT (createSlot), HORIZONTAL, 가운데/가운데, gap 12, FILL 가로·HUG 세로 (300×18) |
| └ Text Button / 회원가입 | 2730:557 | Text Button 2614:77203 Variant=Secondary State=Default |
| └ Divider | 2730:559 | RECT 1×12, fill = VariableID:8:1076 (아래 needs-decision #1) |
| └ Text Button / 아이디 찾기 | 2730:560 | 〃 |
| └ Divider | 2730:562 | 〃 |
| └ Text Button / 비밀번호 찾기 | 2730:563 | 〃 |

링크 간격 12 = 기준 자료 `fIHTlq3ZAZXhHZGNnADD21` 2456:28419 `m_login_bottom` itemSpacing 실측(HORIZONTAL, 패딩 0, 회원가입 x842 → 구분선 902 → 아이디 찾기 915 → 990 → 1003).

## 점검 (사실 추출만 — 판정 아님)

| # | 항목 | 결과 |
|---|---|---|
| ① | provenance | 인스턴스 7개 전부 로컬 정본 세트(remote=false): CI 2614:73962 · Input 2614:79536 ×2 · Button 2614:76987 · Text Button 2614:77203 ×3 |
| ② | 미바인딩 SOLID fill/stroke (인스턴스 내부 포함 전 노드) | **0건** |
| ③ | 폰트 (TEXT 6개) | 6/6 Pretendard — 칸 2개 Regular·body/14R, 로그인·링크 3개 Medium·body/14M. 비-Pretendard 0건 |
| ④ | componentPropertyDefinitions | `Links#2730:0` type=SLOT, description `로그인 버튼 아래 보조 링크 자리 — 서비스마다 바꿔 끼운다`. 다른 속성 없음 |
| ⑤ | 임시 인스턴스(2730:566) | 슬롯 `Links` type=SLOT 300×18, 기본 내용 5개(링크 3 + 구분선 2) 전부 보임·문구 그대로. 높이 272(마스터와 같음). 확인 후 삭제 완료 |
| ⑥ | 스크린샷 | `shot.png`(부품) · `shot-temp-instance.png`(임시 인스턴스) |

## 구조 변경 메모
- 신규 생성만. 기존 Section 2703:2 의 7장은 건드리지 않음. combineAsVariants·detach·rename 없음.
- 1차 자기수정 없음.
- 미리 알 것: 렌더의 링크 글자 폭(51/67/79)은 기준(48/63/75)보다 넓게 나온다 — MCP 렌더에 Pretendard 가 없어 대체 폰트로 잰 폭일 수 있음(데이터상 폰트는 Pretendard).

## needs-decision
1. **구분선 색** — 기준 #d9d9d9 와 값이 같은 **선(line) 계열 Semantic 토큰이 없다.** 정본 `color/line/default` = gray/100 **#e9e9e9**(다크 gray-dark/300). 이 파일에서는 같은 짝이 옛 이름 `color/line/gray/subtle`(VariableID:8:1076)로 남아 있다. 지시된 선례대로 **임시로 8:1076(#e9e9e9)에 바인딩**해 둠. #d9d9d9 로 해석되는 Semantic 은 전부 부품 전용(control/border/default 8:1017 · navigation/indicator/default 8:1079 · form-control/border/default 8:1057 등). 선택: (A) 정본 line/default 유지(기준보다 한 단계 옅음) / (B) 다른 토큰. 모바일 로그인 레거시 구분선(Patterns Mobile `m_login_bottom`)은 미바인딩 raw 라 선례 근거가 되지 못함.
2. (참고) 파일의 선 토큰 이름이 정본과 다르다 — 정본 `color/line/default` ↔ 파일 `color/line/gray/subtle`. 파생(Figma 변수 이름) 갱신이 안 된 상태로 보임.
