# PC 로그인 — 3단계 빌드 기록 (pilot 2장)

- 빌더: screen-rebuilder · 2026-10-02 · baseline `intent-spec` (신규 생성만 — 기존 노드 수정 없음 → 스냅샷 대상 아님. 페이지 80:16697 은 착수 시 자식 0개)
- 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 80:16697 · 새 Section `Pattern / PC Login` = **2703:2** (0,0 · 8440×2560 · 바탕 `color/bg/level-3` 바인딩)
- 빌드 코드: `build-code.js` (공통 뼈대 함수 1벌 + `SCREENS` 데이터 7장분. 다음 회차는 `RUN` 만 바꿔 실행)

## 만든 화면

| 코드 | 이름 | id | 좌표 | 스크린샷 |
|---|---|---|---|---|
| 1 | PC/LOGIN/1 · 최초 진입 | 2703:3 | 80,100 | shots/PC-LOGIN-1.png |
| 4a1 | PC/LOGIN/4a1 · 계정 불일치 오류 | 2706:49 | 80,1380 | shots/PC-LOGIN-4a1.png |

구조(두 화면 공통): 화면 VERTICAL 1920×1080 FIXED·clip·`color/bg/level-0` → LoginGNB(FILL) → Body(FILL/FILL, 위 패딩 123, 가운데) → LoginBox(300 FIXED/HUG) [CI → 간격 48 → Fields(간격 8: Input ID · Input Password) → 간격 8 → SaveId(Checkbox + 글자, 간격 8) → 간격 24 → Button(FILL)] → Footer(FILL).
실측: Input·field 300 FILL, 4a1 안내 문구 300×32 FILL/HUG(두 줄), 버튼 300×44, Body 908, 투명 컨테이너 fills=[].

## 근거를 찾아 채운 값

- `아이디 저장` 글자: 스타일 `body/14M`, 색 `color/control/label/default`. 근거 = `registry/components/checkbox.json` anatomy「라벨(선택) — 본문 14 Medium, 간격 8」 + `ui-library/src/components/checkbox/checkbox.css:61-67`(color `--color-control-label-default`, 14·medium) + 정본 `vars-data.ts:572`.

## 실행 중 일

- 4a1 첫 실행이 안내 문구 크기 설정에서 멈춤(스타일 복귀 뒤 Pretendard 미로드라 textAutoResize 변경 불가). 크기 설정을 스타일 복귀 *전*으로 옮겨(`overrideText(..., before)`) 재실행. 같은 이름 화면을 먼저 지우는 코드라 부분 생성물은 정리됨(섹션 자식 2개 확인).

## 기계 스캔 (빌더 선행 실행 — 검증자 재실행 면제 아님)

| 스캔 | 1 (2703:3) | 4a1 (2706:49) |
|---|---|---|
| provenance: INSTANCE 수 / 외부 위반 | 10 / 0 | 10 / 0 |
| 화면 저작 노드 raw SOLID(미바인딩) | 0 (저작 노드 9) | 0 (저작 노드 9) |
| TEXT 비-Pretendard / textStyleId 없음 | 0 / 0 (TEXT 11) | 0 / 0 (TEXT 12) |
| 섹션 바탕 | 변수 바인딩 | — |

provenance 내역: 로컬(remote=false) = LoginGNB·CI(에스원/Blue)·Input×2·Checkbox·Button·Footer. 허용키 아이콘 = ic_인터넷(globe)·ic_비밀번호미표시(eye_hide ×2 — 아이디 칸 것은 Password Icon=false 로 숨김).

verbatim(화면 표시 글자):
- 1: `아이디를 입력해 주세요.`(body/14R) · `비밀번호를 입력해 주세요.`(body/14R) · `아이디 저장`(body/14M) · `로그인`(body/14M)
- 4a1: `s1design` · `••••••••` · `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)`(body/12R) · `아이디 저장` · `로그인`
- 정본 기본값 유지: `[서비스명]` · `한국어` · Footer 문구(대표이사 정해린)

## 관찰 (판정 아님)

- `아이디 저장` 글자 높이가 MCP 상 14 로 잡힘(이 환경에 Pretendard 가 없어 줄높이 계산이 다를 수 있음). 데스크톱 렌더 확인 필요.

## 권장 상태 전환 (오케스트레이터가 반영)

- `targetFigma.sectionId` = `2703:2`, `artifacts.build` = `3-build.md`, `screens` += 1(2703:3)·4a1(2706:49)
- `nextAction` = component-verifier 로 pilot(1·4a1) 검증 → PASS 시 `RUN=["2","3","4","4a2","4a3"]`
- `evidence.baseline` = `["intent-spec"]` 유지 (스냅샷 해당 없음 — 신규 생성)

---

# 2회차 — 나머지 5장 일괄 생성 (pilot PASS 후, 2026-10-02)

- 입력: component-verifier pilot PASS(❌0 ❓0). 같은 `build-code.js` 를 `RUN=["2","3"]`, `RUN=["4","4a2","4a3"]` 로 두 번 실행. 공통 뼈대 코드 변경 없음.
- 화면 1(2703:3)·4a1(2706:49)은 손대지 않음. 바뀐 것은 섹션 자식 순서뿐(id 그대로, 스캔 결과도 pilot 과 동일).
- Focus 칸 글자 경로 확인: Focus 변형은 `field > lead > 텍스트`(0.0.0) 구조. 코드는 field 안 첫 TEXT 를 찾으므로 0.0.0 이 잡힘. 실측 결과 화면 2 아이디 칸 = `s1desig`, 화면 3 비밀번호 칸 = `••••••••` 로 들어감.

## 화면 7장

| 코드 | 이름 | id | 좌표 | 아이디 / 비밀번호 / 버튼 (실제 variant) |
|---|---|---|---|---|
| 1 | PC/LOGIN/1 · 최초 진입 | 2703:3 | 80,100 | Default / Default / Disabled |
| 2 | PC/LOGIN/2 · 아이디 입력 중 | 2712:95 | 2200,100 | Focus / Default / Disabled |
| 3 | PC/LOGIN/3 · 비밀번호 입력 중 | 2712:164 | 4320,100 | Filled / Focus / Default |
| 4 | PC/LOGIN/4 · 입력 완료·로그인 활성 | 2713:203 | 6440,100 | Filled / Filled / Default |
| 4a1 | PC/LOGIN/4a1 · 계정 불일치 오류 | 2706:49 | 80,1380 | Error·Msg Off / Error·Msg On / Default |
| 4a2 | PC/LOGIN/4a2 · 5회 실패 잠금 | 2713:264 | 2200,1380 | Error·Msg Off / Error·Msg On / Default |
| 4a3 | PC/LOGIN/4a3 · 사용 중지된 계정 | 2713:319 | 4320,1380 | Error·Msg Off / Error·Msg On / Default |

섹션 자식 순서 = 1, 2, 3, 4, 4a1, 4a2, 4a3. 모든 화면 1920×1080.

## 기계 스캔 (7장 전부 · 빌더 선행 실행)

| 화면 | INSTANCE / 외부 위반 | 저작 노드 raw SOLID | TEXT 비-Pretendard / 스타일 없음 | 상자 안 글자 (verbatim) |
|---|---|---|---|---|
| 1 | 10 / 0 | 0 / 9 | 0 / 0 (11) | 아이디를 입력해 주세요. · 비밀번호를 입력해 주세요. · 아이디 저장 · 로그인 |
| 2 | 11 / 0 | 0 / 9 | 0 / 0 (11) | s1desig · 비밀번호를 입력해 주세요. · 아이디 저장 · 로그인 |
| 3 | 11 / 0 | 0 / 9 | 0 / 0 (11) | s1design · •••••••• · 아이디 저장 · 로그인 |
| 4 | 10 / 0 | 0 / 9 | 0 / 0 (11) | s1design · •••••••• · 아이디 저장 · 로그인 |
| 4a1 | 10 / 0 | 0 / 9 | 0 / 0 (12) | s1design · •••••••• · 문구 A · 아이디 저장 · 로그인 |
| 4a2 | 10 / 0 | 0 / 9 | 0 / 0 (12) | s1design · •••••••• · 문구 B · 아이디 저장 · 로그인 |
| 4a3 | 10 / 0 | 0 / 9 | 0 / 0 (12) | s1design · •••••••• · 문구 C · 아이디 저장 · 로그인 |

- Focus 화면(2·3)의 인스턴스가 11개인 이유: 정본 Focus 변형에 지우기 아이콘(clear-action 의 `remove`, 허용키 24b2df62…)이 들어 있음. 부품 그대로이며 화면에서 추가한 것 아님.
- 문구 B 실측 = `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(최대 5분)`. 문구 C 실측 = `사용이 중지된 계정입니다. 관리자에게 문의해 주세요.` (둘 다 body/12R).
- 스크린샷: `shots/PC-LOGIN-{1,2,3,4,4a1,4a2,4a3}.png`.

## 관찰 (판정 아님)
- 4a3 은 문구가 한 줄이라 아래 줄(아이디 저장·버튼)이 4a1·4a2 보다 16px 위에 놓임. 오토레이아웃 HUG 결과이며 의도된 흐름.

## 권장 상태 전환
- `screens` += 2(2712:95)·3(2712:164)·4(2713:203)·4a2(2713:264)·4a3(2713:319)
- `nextAction` = component-verifier 로 7장 전체 Layer 1 재검사 + 새 5장 이미지 대조
