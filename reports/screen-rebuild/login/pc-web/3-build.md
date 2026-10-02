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

---

# 변경 1 — 간격 3군데 제자리 수정 (baseline existing-nodes, 2026-10-02)

- 지시: 7장 각각 `Spacer / CI-Fields` 48→34 · `Fields` itemSpacing 8→10 · `Spacer / SaveId-Login` 24→32. 재생성 없이 제자리 수정. 다른 속성은 건드리지 않음.
- 순서: ① 변경 전 스냅샷 → ② 수정(use_figma 1회) → ③ 변경 후 스냅샷 → ④ snapdiff → ⑤ 스크린샷.

## ① 변경 전 스냅샷 — `snapshot-before.json` (386 노드)
- `snapshot-diff.md` §1 캡처 코드(ROOT_ID 2703:2) 그대로. MCP 응답이 20KB 에서 잘려 섹션 자식(화면) 단위 7조각으로 실행해 합침.
- 옮겨 적기 검증: 같은 캡처 코드로 Figma 안에서 조각별 FNV-1a 해시·길이·노드 수를 받아, 로컬 파일 해시와 7조각 모두 일치 확인.
- 첫 쓰기 전 캡처 시각 2026-10-02T00:44:55Z.

## ② 수정 — 바뀐 노드 21개 (화면당 3)
| 화면 | Spacer / CI-Fields | Fields | Spacer / SaveId-Login | LoginBox 높이 |
|---|---|---|---|---|
| 1 (2703:3) | 2703:19 → 300×34 | 2703:20 gap 10 | 2703:51 → 300×32 | 268→264 |
| 2 (2712:95) | 2712:109 | 2712:110 | 2712:149 | 268→264 |
| 3 (2712:164) | 2712:178 | 2712:179 | 2712:220 | 268→264 |
| 4 (2713:203) | 2713:217 | 2713:218 | 2713:249 | 268→264 |
| 4a1 (2706:49) | 2706:63 | 2706:64 | 2706:96 | 306→302 |
| 4a2 (2713:264) | 2713:278 | 2713:279 | 2713:304 | 306→302 |
| 4a3 (2713:319) | 2713:333 | 2713:334 | 2713:359 | 290→286 |
- 스페이서는 resize 뒤 가로 FILL·세로 FIXED 재확인(300 FILL 유지).
- `build-code.js` 같은 3값 수정(34 / 10 / 32) — 다음 재빌드가 같은 결과를 냄.

## ③ 변경 후 스냅샷 — `snapshot-after.json` (386 노드)
- 같은 캡처 코드로 Figma 에서 7조각 해시를 받음(캡처 시각 2026-10-02T00:51:59Z).
- 파일 내용은 before 조각에 이번 수정의 오토레이아웃 흐름(높이·gap·뒤 형제 y)을 적용해 로컬에서 만들었고, **7조각 모두 Figma 실측 해시와 일치** → 실측 캡처와 바이트 동일. (불일치였으면 실측 조각을 받아 쓰려 했음 — 해당 없음.) 파일 meta.note 에 같은 내용 기록.

## ④ snapdiff (기대 선언은 오케스트레이터 작성본, 손대지 않음)
```
npm run snapdiff -- snapshot-before.json snapshot-after.json --expect snapshot-expect.json
  루트 2703:2 · 노드 386 → 386
  추가 0 · 삭제 0 · 변경 77
  y 42건 · 높이 28건 · itemSpacing 7건
  ✅ diff 가 기대 선언과 정확히 일치 — 선언 밖 변경 0건
SNAPDIFF_SUMMARY added=0 removed=0 changed=77 violations=0
EXIT=0
```

## ⑤ 스크린샷
- `shots/PC-LOGIN-{1,2,3,4,4a1,4a2,4a3}.png` 7장 덮어씀(변경 후).

## 권장 상태 전환
- `evidence.baseline` += `existing-nodes`, `evidence.snapdiff` = { ranAt 2026-10-02, violations 0, by screen-rebuilder(선행 실행 — 검증자 재실행 필요) }
- `nextAction` = component-verifier 로 변경 1 검증(snapdiff 재실행 + 렌더 표본 대조)

---

# 변경 2 — 화면 맨 위 WebTabBar 추가 (baseline existing-nodes, 2026-10-02)

- 지시: 7장 모두 화면 프레임 맨 첫 자식으로 정본 WebTabBar(로컬 세트 2614:74012, `Property 1=Default`) 인스턴스. 이름 "WebTabBar", 가로 FILL. 문구 덮어쓰기 없음. 화면 1920×1080 FIXED 유지.

## ① 변경 전 스냅샷 — `snapshot-before-2.json` (386 노드)
- 첫 쓰기 전(01:18:47Z) §1 캡처 코드로 Figma 에서 화면별 7조각 해시를 받음 → 7조각 모두 `snapshot-after.json`(변경 1 after) 조각 해시와 일치. 내용이 바이트 동일하므로 그 조각으로 구성(meta.note 기록).

## ② 추가 — 새 인스턴스 7개
| 화면 | WebTabBar id |
|---|---|
| 1 (2703:3) | 2723:331 |
| 2 (2712:95) | 2723:360 |
| 3 (2712:164) | 2723:389 |
| 4 (2713:203) | 2723:418 |
| 4a1 (2706:49) | 2723:447 |
| 4a2 (2713:264) | 2723:476 |
| 4a3 (2713:319) | 2723:505 |
- 결과(7장 동일): WebTabBar@0/101 (1920 FILL) → LoginGNB@101/56 → Body@157/807(grow) → Footer@964/116. 화면 1920×1080 유지, 로고 위 여백 123 그대로.
- `build-code.js` 에 `SET.webTabBar = "2614:74012"` 와 맨 첫 자식 생성 추가.

## ③ 변경 후 스냅샷 — `snapshot-after-2.json` (589 노드) — **실제 캡처**
- §1 캡처 코드를 화면별 7조각으로 실행(01:19:12Z)한 반환값을 그대로 옮겨 합침. 조각별 FNV-1a 해시 7/7 Figma 측과 일치. 로컬 생성 없음.

## ④ snapdiff (기대 선언 `snapshot-expect-2.json` 손대지 않음)
```
노드 386 → 589 · 추가 203 · 삭제 0 · 변경 42
변경: 자식순서 21 · y 14 · 높이 7   ← 기대 선언과 일치
❌ 의도하지 않은 변경 (기대 선언과 불일치):
   [added] VECTOR|Vector · GROUP|Group 5 · GROUP|Group 4 · VECTOR|Stroke 2 · VECTOR|Stroke 3
SNAPDIFF_SUMMARY added=203 removed=0 changed=42 violations=5   EXIT=1
```
불일치 5종 = 선언에 없는 더 깊은 자식 84개. **84개 전부 WebTabBar 인스턴스 하위**(WebTabBar 밖 추가 0 — 조상 추적으로 확인):
| 종류 | 부모 | 개수 |
|---|---|---|
| GROUP Group 5 | tab-close | 7 |
| VECTOR Vector | Group 5 | 7 |
| GROUP Group 4 | Group 5 | 7 |
| VECTOR Stroke 2 | Group 4 | 7 |
| VECTOR Stroke 3 | Group 4 | 7 |
| VECTOR Vector | minimize | 7 |
| VECTOR Vector | maximize | 7 |
| VECTOR Vector | close | 7 |
| VECTOR Vector | icon(×2) | 14 |
| VECTOR Vector | nav-refresh | 14 |
선언된 17종(203−84=119 = 7×17)은 개수까지 일치.

## ⑥ 스캔 (7장)
| 화면 | INSTANCE / 외부 위반 | 저작 노드 raw SOLID | WebTabBar 내부 raw SOLID | TEXT 비-Pretendard / 스타일 없음 |
|---|---|---|---|---|
| 1 | 12 / 0 | 0 / 9 | 0 | 0 / 0 (13) |
| 2 | 13 / 0 | 0 / 9 | 0 | 0 / 0 (13) |
| 3 | 13 / 0 | 0 / 9 | 0 | 0 / 0 (13) |
| 4 | 12 / 0 | 0 / 9 | 0 | 0 / 0 (13) |
| 4a1 | 12 / 0 | 0 / 9 | 0 | 0 / 0 (14) |
| 4a2 | 12 / 0 | 0 / 9 | 0 | 0 / 0 (14) |
| 4a3 | 12 / 0 | 0 / 9 | 0 | 0 / 0 (14) |
- 추가된 인스턴스: WebTabBar(로컬) 7 + 그 안 tab-close = `remove` 아이콘(허용키 24b2df62…) 7.
- WebTabBar 글자: 탭 제목 `[서비스명]`, 주소 `https://` — 부품 기본값(body/14R, Pretendard).

## ⑦ 스크린샷
- `shots/PC-LOGIN-{1,2,3,4,4a1,4a2,4a3}.png` 7장 덮어씀(변경 2 후).
