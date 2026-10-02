# PC Login Box — 4단계 검증 (figma-library-build · 시나리오 C)

- 검증자: component-verifier · 2026-10-02 · 빌더(figma-library-builder)와 분리된 맥락
- 기준: `2-plan.md`(river 결정 2026-10-02) · `node-map.json` · 기준 자료 `fIHTlq3ZAZXhHZGNnADD21` 2456:28419(검증자가 직접 실측)
- 대상: 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 80:16697 · Section 2730:527 · COMPONENT `PC Login Box` 2730:528
- 직접 실행: use_figma 읽기 스캔(구조·속성·출처·raw 채움·폰트) · 기준 파일 실측 · 임시 인스턴스 생성→확인→삭제 · Section 2703:2 해시 대조

## 판정: **PASS** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 1 · BLOCKED 0

## 구조·간격 (계획서 대조)

| 항목 | 계획 | 실측 | 판정 |
|---|---|---|---|
| 종류·이름 | COMPONENT `PC Login Box`, 변형 없음 | COMPONENT 2730:528 · 변형 축 없음 · description 있음 | ✅ |
| 루트 | VERTICAL · 폭 300 FIXED · 높이 HUG · 가로 가운데 · 채움 없음 | VERTICAL · 300×272 · counter FIXED · primary AUTO · CENTER · fills 0 · 패딩 0 | ✅ |
| CI | 에스원/Blue · 가운데 | 로컬 CI 2614:73962 `Brand=에스원, Color=Blue` · x 110.625 | ✅ |
| CI→칸 | 34 | Spacer 300×34 FILL/FIXED | ✅ |
| Fields | VERTICAL · gap 10 · FILL | VERTICAL · gap 10 · 300×98 FILL/HUG | ✅ |
| 아이디 칸 | Input MD/PC/Default · PwIcon off · field FILL · `아이디를 입력해 주세요.` | 그대로 · field 300 FILL | ✅ |
| 비밀번호 칸 | 같음 · PwIcon on · `비밀번호를 입력해 주세요.` | 그대로 · field 300 FILL | ✅ |
| 칸→버튼 | 32 | Spacer 300×32 | ✅ |
| 로그인 버튼 | Primary/MD/PC/Disabled · FILL · `로그인` | 로컬 Button 2614:76987 · 300×44 FILL | ✅ |
| 버튼→링크 | 16 | Spacer 300×16 | ✅ |
| 아이디 저장 줄 | 없음 | 없음 | ✅ |
| 슬롯 `Links` | HORIZONTAL · 가로 가운데 · FILL/HUG | 노드 type **SLOT** 2730:565 · HORIZONTAL · CENTER/CENTER · gap 12 · 300×18 FILL/HUG · `componentPropertyReferences.slotContentId = Links#2730:0` | ✅ |
| 슬롯 기본 내용 | `회원가입` · 구분선 · `아이디 찾기` · 구분선 · `비밀번호 찾기` | Text Button(로컬 2614:77203, Secondary/Default) ×3 + RECT 1×12 ×2, 순서 일치 | ✅ |

- **링크 간격 12·구분선 1×12·버튼→링크 16 이 기준값이라는 빌더 주장을 확인했다.** 기준 자료 2456:28419 `m_login_bottom` 를 직접 실측했다: HORIZONTAL · itemSpacing 12 · 패딩 0 · 구분선 RECT 1×12(#d9d9d9) 2개 · 버튼(0/48)→링크 줄(64) 사이 16. 빌더 주장과 일치한다.

## 슬롯이 진짜인지
- `componentPropertyDefinitions` = `{"Links#2730:0": {type: "SLOT", description: "로그인 버튼 아래 보조 링크 자리 — 서비스마다 바꿔 끼운다"}}`. 다른 속성은 없다. ✅
- **임시 인스턴스(2732:550)를 직접 만들어 확인했다.** 슬롯 노드 type SLOT · 300×18이고, 기본 내용 5개(링크 3 · 구분선 2)가 모두 보이며 문구와 좌표가 마스터와 같다. 인스턴스 속성은 `Links#2730:0` 하나, 크기는 300×272 로 마스터와 같다. 확인 뒤 삭제했고(섹션 자식 = 2730:528 하나), 삭제 후 node 가 없음도 확인했다. ✅

## 결정론 스캔

| 스캔 | 결과 | 판정 |
|---|---|---|
| 부품 출처(숨은 자식 포함, 인스턴스 9) | 로컬 7: CI · Input×2 · Button · Text Button×3 / 허용 키 2: eye_hide `d4e9eb5b`×2(Input 안) / 외부 위반 0 | ✅ |
| raw SOLID fill·stroke(마스터 포함 전 노드) | 0건 | ✅ |
| 폰트(TEXT 6) | 6/6 Pretendard · 비-Pretendard 0 · 스타일 없음 0 (칸 2 = body/14R, 로그인·링크 3 = body/14M) | ✅ |
| 순환 참조 | 자기 인스턴스를 품은 것 없음(변형 없음) | ✅ |
| 네이밍 | `PC Login Box` · 섹션 `Pattern / PC Login — 부품` · 계획 밖 이름 없음 | ✅ |

### 구분선 색 (토큰 바인딩)

| 기준 값 | 노드·속성 | 바인딩 | 정본 조회 | 판정 |
|---|---|---|---|---|
| #d9d9d9 (= gray/200) | Divider ×2 fill | `VariableID:8:1076` (파일 이름 `color/line/gray/subtle`, Light gray/100 · Dark gray-dark/300) | `vars-data.ts` 선(line) 계열 = `color/line/default`(gray/100 #E9E9E9) · blue · strong. gray/200 로 풀리는 선 토큰은 **없다** | 🟡(b) |

- **(b) 근거:** 오케스트레이터가 그렇게 정했다는 말만으로는 근거로 쓰지 않았다. 근거는 이미 등록된 같은 종류 패턴 규칙이다. `registry/patterns/mobile-login/content-rules.md` §보조 링크에 「구분선 … 색은 `color/line/gray/subtle`」이 있고, 이번 바인딩이 바로 그 변수(8:1076)다. 레거시 기준의 #d9d9d9 는 한 단계 진한 값이고, 정본 구분선 의미 토큰을 그대로 쓰는 쪽이 등록된 규칙에 맞는다. 부품 전용 테두리 토큰(control/border 등)으로 바꿔 끼우지 않은 것도 맞는 선택이다.
- Figma 개선 필요 목록에 올릴 것: 레거시 기준 자료 구분선 #d9d9d9 → 정본 `color/line/default`.

## 렌더
- 빌더 선캡처 `shot.png`·`shot-temp-instance.png` + 검증자 임시 인스턴스 2배 렌더로 봤다. 위에서부터 CI → 두 칸 → 회색 비활성 로그인 → 링크 3개와 옅은 구분선이 가운데 정렬로 놓여 있다. 잘림·겹침이 없다.
- 링크 글자 폭(51/67/79)이 기준(48/63/75)보다 넓다. 데이터상 폰트는 Pretendard 이므로 MCP 렌더의 대체 폰트 때문으로 본다. 폰트 판정은 렌더로 하지 않았다.

## 기존 화면 7장이 그대로인지
- Section 2703:2 를 snapshot 캡처 코드로 다시 떠서 화면별 해시를 냈다. **8묶음(루트 + 7장), 노드 589 가 모두 `snapshot-after-2.json` 과 일치한다** → 변경 2 이후 바뀐 것 없음. ✅
- 새 Section 2730:527(0,−800 · 700×640)은 기존 섹션(0,0 · 8440×2560)과 겹치지 않는다.

## 판정 밖 관찰 (건수에 넣지 않음)
1. **구분선 길이가 한 화면에서 섞일 예정.** 화면에 넣으면(screen-rebuild 변경 3) 같은 화면의 Footer 구분선은 1×8 이고 링크 구분선은 1×12 다. mobile-login 규칙에 「한 화면 안에서 서로 다른 굵기·길이의 구분선을 섞지 않는다」가 있다. 다만 PC 의도 선언서가 그 규칙에서 가져온 것은 오류 표현뿐이고, 1×12 는 계획서와 기준 자료 그대로라 지금 부품에서는 위반이 아니다. 변경 3 의 의도 선언서에서 둘 중 무엇을 따를지(기준 1×12 유지 / Footer 와 맞춤) 한 줄 정해 두기를 권한다.
2. **Figma 변수 이름이 정본보다 오래됐다.** 파일 변수 `color/line/gray/subtle`(8:1076)이 정본 `color/line/default` 와 이름만 다르고 값 배선은 같다(gray/100 · gray-dark/300). 이 빌드 전부터 있던 파생 표면 문제(H6 — 파생을 고친다)라 별도 작업으로 다룬다.
3. 정본 Input `trail` 100×100(needs-core-update)은 이 부품의 아이디 칸에도 똑같이 있다. 기존 항목 그대로다.

## 이번에 확인하지 않은 것
- 다크 모드 렌더
- 데스크톱(Pretendard 설치)에서 링크 글자 폭
- 화면 7장 교체(변경 3)는 아직 하지 않았다

## 권장 상태 전환
- 검문소 4 PASS → screen-rebuild 변경 3(7장 `LoginBox` → `PC Login Box` 인스턴스 교체)으로 간다. 그때 before/after 스냅샷과 기대 선언을 미리 둔다.
