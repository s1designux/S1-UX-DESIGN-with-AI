# PC 로그인 — 4단계 독립 검증

## Pilot (1 · 4a1) — 2026-10-02 · component-verifier

- 기준: `intent.md`(river 승인 2026-10-02) + `2-mapping.md` · 오류 표현 `registry/patterns/mobile-login/content-rules.md`. baseline intent-spec — 레거시 수치·부품 대조 없음(문구만).
- 대상: 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 80:16697 · Section 2703:2 → `PC/LOGIN/1 · 최초 진입`(2703:3) · `PC/LOGIN/4a1 · 계정 불일치 오류`(2706:49)
- 검증자가 직접 실행: use_figma 읽기 전용 스캔 4회(provenance·폰트·저작노드 채움·텍스트·variant·레이아웃 실측, 숨은 인스턴스 자식 포함) + 박스 3배 렌더. 빌더 선행 스캔 결과는 참고만 하고 재사용하지 않음.

### 판정: **PASS (pilot)** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 0 · BLOCKED 0
별도: 정본 부품 결함 1건(needs-core-update, 기존에 알려진 것) · 데스크톱 미확인 1건(NOT_VERIFIED). 둘 다 화면 빌드 실수가 아니며 일괄 생성을 막지 않는다.

### Layer 1 — 결정론

| 항목 | 1 (2703:3) | 4a1 (2706:49) | 판정 |
|---|---|---|---|
| provenance (INSTANCE / 위반) | 10 / 0 — 로컬: LoginGNB·CI·Input×2·Checkbox·Button·Footer, 허용키: globe `dee16df7`·eye_hide `d4e9eb5b`×2 | 10 / 0 (동일 구성) | ✅ |
| 폰트 (TEXT / 비-Pretendard / 스타일 없음, 숨은 자식 포함) | 11 / 0 / 0 | 12 / 0 / 0 | ✅ |
| 저작 노드 채움 | 화면 `color/bg/level-0` 바인딩, 투명 컨테이너 fills=[], 라벨 `color/control/label/default`, stroke 0 | 동일 | ✅ |
| 섹션 바탕 | `color/bg/level-3` 바인딩 · 자식 순서 1 → 4a1 | | ✅ |
| 아이디 칸 | Size=MD · State=Default · Message=Off · Break=PC · Password Icon=false | State=Error · Message=Off · `s1design` | ✅ |
| 비밀번호 칸 | State=Default · Message=Off · Password Icon=true | State=Error · Message=On · `••••••••` · 문구 A | ✅ |
| 버튼 | Primary · MD · PC · **Disabled** · `로그인` | **Default** · `로그인` | ✅ |
| 체크박스 | State=Default (18×18) | State=Default | ✅ |
| 텍스트 verbatim | `아이디를 입력해 주세요.` · `비밀번호를 입력해 주세요.` · `아이디 저장` · `로그인` · GNB/Footer 정본 기본값 | 문구 A = `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)` 글자 단위 일치 | ✅ |
| 오류 표현 규칙 | — | 두 칸 모두 Error · 문구는 비밀번호 칸 아래 1회 · 상자 위 빨간 박스 없음 | ✅ |
| 폭 300·FILL | LoginBox 300 FIXED/HUG · Input·field 300 FILL · 버튼 300 FILL | 동일 + 안내 문구 300 FILL/HUG(2줄 32) | ✅ |
| 위 패딩 123 | Body pad-top 123 · LoginBox y=123 · Body 908 = 1080−56−116 (grow) | 동일 | ✅ |
| 간격 | CI(30)→48→칸, 칸 사이 8, 칸→8→저장 줄, 저장 줄→24→버튼, 박스–글자 8 | 동일 (Fields 134 = 44+8+82) | ✅ |
| CI 가운데 | x 110.625 (= (300−78.75)/2) | 동일 | ✅ |
| figma-use 잔재 (화면 저작 노드) | 고정 100 없음 · hug 누락 없음 · spacer 는 의도된 FIXED 높이 | 동일 | ✅ |
| 넣지 말 것 | WebTabBar·찾기/회원가입·창틀 0건 | 0건 | ✅ |

**`아이디 저장` 글자 근거** — 인정. `registry/components/checkbox.json` anatomy「라벨(선택) — 본문 14 Medium, 간격 8」(메타 정본) + `ui-library/src/components/checkbox/checkbox.css:61-67`(color `--color-control-label-default`, 14 · medium · line-height 130 · tight) + `textstyles-data.ts:63` body/14M(14 · Medium · 130% · −2%) 수치 일치 + `vars-data.ts:572` 토큰 실재. needs-decision 대상 아님.

### Layer 2 — 렌더 대조 (선언서 대비)

- 빌더 선캡처 `shots/PC-LOGIN-1.png`·`shots/PC-LOGIN-4a1.png`(1024×576) + 검증자 박스 3배 렌더로 대조.
- 맨 위 줄 → 가운데 300 상자(CI · 두 칸 · 아이디 저장 · 버튼) → 맨 아래 띠, 선언서 뼈대와 일치. 글자 잘림·겹침 없음. 4a1 두 줄 문구 접힘 없음, 두 칸 붉은 테두리, 버튼 활성 파랑. 1 버튼 비활성 회색.
- 폰트 정체성은 렌더로 판정하지 않음(데이터 스캔으로 대체 — 위 표).

### 별도 항목 (화면 판정 불산입)

1. **needs-core-update — 정본 Input 의 `trail` 유령 100×100.** 아이디 칸(Password Icon=false)에서 눈 아이콘이 숨으면 trail 이 100×100 으로 남아 field 내용 폭을 잡아먹는다(아이디 글자 칸 174 vs 비밀번호 246). 정본 변형 `Size=MD, State=Default, Message=Off, Break=PC` 자체가 trail 100×100 이며, `reports/figma-library-build/input-show-message-preview/4-verification.md` O1 로 이미 알려진 특성. 이 화면 문구는 모두 들어가 시각 영향 없음. 고치면 7장 모두 자동 반영되므로 일괄 생성을 막지 않는다.
2. **NOT_VERIFIED — `아이디 저장` 글자 상자 높이.** 노드 높이 14(body/14M 기준 18.2 기대). MCP 에 Pretendard 가 없어 줄높이 재계산이 안 된 흔적. MCP 렌더에서는 체크박스와 세로 정렬이 맞음. 데스크톱(Pretendard 설치) 에서 줄 정렬 1회 눈 확인 필요 — 어긋나면 ❌(a) 로 재분류.

### 이번에 확인하지 않은 것
- 나머지 5장(2 · 3 · 4 · 4a2 · 4a3) — 아직 없음. 일괄 생성 후 Layer 1 전체 재실행 필요(pilot PASS 승계 금지).
- 다크 모드 렌더.

### 권장 상태 전환
- `currentPhase` 4-verify pilot PASS → `nextAction` = `RUN=["2","3","4","4a2","4a3"]` 일괄 생성 → 7장 전체 재검증.
- `artifacts.verification` = `4-verification.md`.

---

## 전체 7장 — 2026-10-02 · component-verifier

- 대상: Section 2703:2 의 7장 — 1(2703:3) · 2(2712:95) · 3(2712:164) · 4(2713:203) · 4a1(2706:49) · 4a2(2713:264) · 4a3(2713:319)
- pilot PASS 를 넘겨 쓰지 않았다. 7장 모두 Layer 1 을 다시 직접 실행했다(use_figma 읽기 전용, 숨은 인스턴스 자식 포함). 새로 만든 5장은 Layer 2 렌더 대조도 했다(LoginBox 2배 렌더).

### 판정: **PASS** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 0 · BLOCKED 0
pilot 의 별도 항목 2건은 그대로 이어진다: needs-core-update 1건(Input trail 100×100) · NOT_VERIFIED 1건(`아이디 저장` 글자 높이 14). 7장 모두 같은 값이고, 화면 빌드 실수가 아니다.

### Layer 1 — 결정론 (7장 전부)

| 화면 | 인스턴스 / 위반 | TEXT / 비-Pretendard / 스타일 없음 | 저작 노드 raw | 아이디 칸 | 비밀번호 칸 | 버튼 | 상자 높이 |
|---|---|---|---|---|---|---|---|
| 1 | 10 / 0 | 11 / 0 / 0 | 0 | Default · placeholder | Default · placeholder | Disabled | 268 |
| 2 | 11 / 0 (+remove 허용키) | 11 / 0 / 0 | 0 | **Focus** · `s1desig` | Default · placeholder | Disabled | 268 |
| 3 | 11 / 0 (+remove 허용키) | 11 / 0 / 0 | 0 | Filled · `s1design` | **Focus** · `••••••••` | Default | 268 |
| 4 | 10 / 0 | 11 / 0 / 0 | 0 | Filled · `s1design` | Filled · `••••••••` | Default | 268 |
| 4a1 | 10 / 0 | 12 / 0 / 0 | 0 | Error · Msg Off · `s1design` | Error · Msg On · 문구 A | Default | 306 |
| 4a2 | 10 / 0 | 12 / 0 / 0 | 0 | Error · Msg Off · `s1design` | Error · Msg On · 문구 B | Default | 306 |
| 4a3 | 10 / 0 | 12 / 0 / 0 | 0 | Error · Msg Off · `s1design` | Error · Msg On · 문구 C | Default | 290 |

- **부품 출처:** 로컬은 LoginGNB·CI(에스원/Blue)·Input×2·Checkbox(Default)·Button(Primary/MD/PC)·Footer(PC)이다. 허용 키 아이콘은 globe `dee16df7`·eye_hide `d4e9eb5b`×2이고, 2·3 은 Focus 부품에 들어 있는 remove `24b2df62` 가 더 있다(부품 소속). 위반은 0건이다.
- **글자 그대로인지:** 문구 B `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(최대 5분)`, 문구 C `사용이 중지된 계정입니다. 관리자에게 문의해 주세요.` 모두 글자 단위로 일치한다. 문구 B 는 2줄(300×32), 문구 C 는 1줄(300×16)이며 안내 문구는 FILL/HUG 로 잡혀 있다. 안내 문구 색은 `color/text/state/caution`, 스타일은 body/12R 이다.
- **크기·간격 (7장 같음):** 화면 1920×1080, VERTICAL, clip, 바탕 `color/bg/level-0`. Body 908 · 위 패딩 123 · grow 1. LoginBox 300 FIXED/HUG · y 123. 칸·field·버튼 300 FILL. 간격은 CI 아래 48 · 칸 사이 8 · 체크 줄 위 8 · 아래 24 로 같다.
- **배치:** 첫 줄 y=100 에 1·2·3·4 가 x 80/2200/4320/6440, 둘째 줄 y=1380 에 4a1·4a2·4a3 이 x 80/2200/4320. 섹션 자식 순서는 1,2,3,4,4a1,4a2,4a3 로 2-mapping 과 일치한다.
- **넣지 말 것:** WebTabBar·찾기/회원가입·창틀이 7장 모두 0건이다.
- **오류 표시 규칙 (4a1~4a3):** 두 칸 모두 Error 이고, 문구는 비밀번호 칸 아래 1번만 나온다.

### Layer 2 — 렌더 대조 (새 5장)
- 2: 아이디 칸이 파란 포커스 테두리에 커서와 지우기 아이콘을 보인다. 비밀번호는 placeholder, 버튼은 회색 비활성이다.
- 3: 아이디 칸은 입력값이 들어간 회색 테두리, 비밀번호 칸은 포커스(커서·눈·지우기) 상태이고, 버튼은 파랑 활성이다.
- 4: 두 칸 모두 입력값이 있고 버튼은 활성이다.
- 4a2: 두 칸 모두 붉은 테두리이고, 2줄 문구가 접히지 않았다.
- 4a3: 두 칸 모두 붉은 테두리이고, 1줄 문구다.
- 잘림·겹침이 없고 의도 선언서 뼈대와 일치한다. 폰트는 렌더로 판정하지 않았다(데이터 스캔 결과로 대신함).

### 이번에 확인하지 않은 것
- 다크 모드 렌더.
- 데스크톱(Pretendard 설치)에서 `아이디 저장` 글자 정렬 — NOT_VERIFIED 로 이어진다.
- 1·4a1 의 Layer 2 는 pilot 렌더를 그대로 썼다(이번에 다시 렌더하지 않음). Layer 1 은 다시 실행해서 값이 같았다.

### 권장 상태 전환
- `currentPhase` = 4-verify PASS(7장) · `lastCompletedCheckpoint` = 4 · `artifacts.verification` = `4-verification.md`
- `nextAction` = 5단계 패턴 등록(`registry/patterns/pc-login/`). 그 전에 `아이디 저장` 데스크톱 눈 확인 1번을 권장한다.

---

## 변경 1 — 간격 3군데 델타 재검증 · 2026-10-02 · component-verifier

- 지시: river 「창틀은 빼고 간격만 기준대로 바꿔줘」. `intent.md` 변경 1 절과 `2-mapping.md` 에 따라 바꾼 것은 세 가지다: 로고→칸 48→34, 칸 사이 8→10, 아이디 저장→버튼 24→32. 비번칸→아이디 저장 8 과 창틀·크기는 바꾸지 않는다.
- baseline 은 existing-nodes 를 추가했다. 증거는 `snapshot-before.json` / `snapshot-after.json` / `snapshot-expect.json`(오케스트레이터 작성) 세 파일이다.

### 판정: **PASS** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 0 · BLOCKED 0

### after 스냅샷이 증거로 충분한지 판단
- 빌더는 before 에 기대 변경을 적용해 after 를 로컬에서 만들었다. 그 뒤 Figma 쪽 조각 해시와 같은지 확인했다고 적었다. 이 경우 해시를 비교한 사람이 빌더 자신이므로, 그 기록만으로는 독립 증거가 아니라고 봤다.
- 그래서 검증자가 직접 다시 확인했다. 실제 캔버스에서 같은 캡처 코드(`snapshot-diff.md` §1)를 다시 돌리고, 노드 id 정렬 → 화면별로 묶음 → FNV-1a 해시 순서로 직접 계산했다. 같은 방식으로 로컬 `snapshot-after.json` 의 해시도 계산했다.
  - 결과: 8묶음(루트 1 + 화면 7), 노드 386개가 모두 일치했다 (1 `fa0f0b9e`·2 `a83aa788`·3 `85c16965`·4 `c0988be`·4a1 `ca43f25c`·4a2 `cb86f43f`·4a3 `4efbc0b1`·루트 `70a1f7c5`). 캡처 시각은 2026-10-02T00:55Z.
  - 결론: after 파일은 현재 캔버스와 내용이 같다. 증거로 인정한다.
- before 는 지나간 상태라 다시 뜰 수 없다. 대신 직전 「전체 7장」 검증에서 직접 잰 값과 맞춰 봤다. 간격 48/8/24, 상자 높이 268·306·290 이 before 와 같으므로 before 도 믿을 만하다고 판단했다.

### snapdiff (검증자 재실행)
```
npm run snapdiff -- snapshot-before.json snapshot-after.json --expect snapshot-expect.json
노드 386 → 386 · 추가 0 · 삭제 0 · 변경 77 (y 42 · 높이 28 · itemSpacing 7)
✅ diff 가 기대 선언과 정확히 일치 — 선언 밖 변경 0건   EXIT=0
```

### 실제 캔버스 값 직접 확인 (21개 노드 + 연동 값)

| 화면 | CI-Fields 스페이서 | Fields 간격 / 높이 | Fields-SaveId | SaveId-Login 스페이서 | LoginBox |
|---|---|---|---|---|---|
| 1 | 2703:19 300×34 FILL/FIXED | 2703:20 10 / 98 | 8 | 2703:51 300×32 FILL/FIXED | 300×264 · y 123 |
| 2 | 2712:109 34 | 2712:110 10 / 98 | 8 | 2712:149 32 | 264 |
| 3 | 2712:178 34 | 2712:179 10 / 98 | 8 | 2712:220 32 | 264 |
| 4 | 2713:217 34 | 2713:218 10 / 98 | 8 | 2713:249 32 | 264 |
| 4a1 | 2706:63 34 | 2706:64 10 / 136 | 8 | 2706:96 32 | 302 |
| 4a2 | 2713:278 34 | 2713:279 10 / 136 | 8 | 2713:304 32 | 302 |
| 4a3 | 2713:333 34 | 2713:334 10 / 120 | 8 | 2713:359 32 | 286 |

- 21개 노드 모두 34 / 10 / 32 이고, 스페이서는 300 FILL · 세로 FIXED 를 유지한다. 바꾸지 않기로 한 8 과 위 패딩 123 도 그대로다.

### 간단 재스캔 (7장)
- **부품 출처:** 인스턴스는 화면당 10~11개, 위반 0건이다(로컬 정본 + 허용 키 globe·eye_hide·remove).
- **폰트:** TEXT 는 화면당 11~12개, 비-Pretendard 0건이다.
- **raw 색:** after 스냅샷 386개 노드에서 raw hex 0건, 비-Pretendard TEXT 0건이다. 변수 바인딩은 diff 로 보면 `f` 변경이 0건이다.

### 렌더 대조 (1 · 4a1 · 4a3)
- 1·4a1 상자 2배 렌더와 4a3 전체 화면을 봤다. 로고→칸 간격이 줄었고, 칸 사이와 버튼 위 간격은 넓어졌다. 잘림·겹침이 없고 창틀도 없다. 4a1 의 2줄 문구와 4a3 의 1줄 문구는 정상이다.

### 직전 PASS 를 그대로 이어받은 범위 (이번에 다시 확인하지 않음)
- 텍스트 그대로인지, variant/상태, 글자 근거, 섹션 배치는 직전 「전체 7장」 PASS 를 그대로 이어받았다. 근거는 diff 에서 `tx`·`ts`·`fn`·`f`·`i`·`x` 변경이 0건이고 추가·삭제도 0건이라는 점이다.
- 2·3·4·4a2 의 렌더는 이번에 보지 않았다(diff 상 y·높이 변경만 있음).
- 다크 모드와 데스크톱의 `아이디 저장` 정렬은 여전히 NOT_VERIFIED 다. Input `trail` 100×100 은 needs-core-update 로 그대로 남는다.

### 권장 상태 전환
- `evidence.snapdiff` = { ranAt 2026-10-02, violations 0, by component-verifier(재실행), afterVerifiedBy: 검증자 실측 해시 8묶음 일치 }
- `lastCompletedCheckpoint` = 4 유지 · `nextAction` = 5단계 패턴 등록

---

## 변경 2 — 맨 위 WebTabBar 추가 · 델타 재검증 · 2026-10-02 · component-verifier

- 지시: river 「프레임을 그냥 넣자. 디자인가이드에 웹탭바를 쓰면 될듯」. 근거는 `intent.md` 「변경 2」 절이다. 증거 파일은 `snapshot-before-2.json` · `snapshot-after-2.json` · `snapshot-expect-2.json`(오케스트레이터 작성)이다.

### 판정: **FAIL (문서 1건)** — ❌(a) 1 · ❓(c) 0 · 🟡(b) 0 · BLOCKED 0
- Figma 캔버스 쪽 ❌ 는 0건이다. 7장 모두 의도 선언서대로다.
- ❌(a)-1 **`2-mapping.md` 가 변경 2 를 반영하지 않았다.** 26행에 아직 「넣지 않는 것: WebTabBar」가 있고, 뼈대 표에 WebTabBar 행이 없으며, Body 높이·순서도 옛 값이다. 2단계 매핑표는 검증의 1차 기준표다. 이 상태로 두면 다음 재검증이 캔버스를 위반으로 오판하게 된다. 오케스트레이터가 매핑표를 갱신해야 한다. 캔버스 수정은 필요 없다.

### snapdiff (검증자 재실행) — 기대 선언과 불일치 5종, 판정 결과 허용
```
노드 386 → 589 · 추가 203 · 삭제 0 · 변경 42 (자식순서 21 · y 14 · 높이 7)
❌ [added] VECTOR|Vector · GROUP|Group 5 · GROUP|Group 4 · VECTOR|Stroke 2 · VECTOR|Stroke 3 — 기대 선언에 없음
SNAPDIFF_SUMMARY added=203 removed=0 changed=42 violations=5  (EXIT 1)
```
- **불일치 5종이 모두 WebTabBar 안의 노드인지 직접 확인했다.** 추가 노드 203개 각각의 조상을 따라 올라가 봤다. **203개 모두 새 WebTabBar 인스턴스 7개 중 하나의 하위다(WebTabBar 밖에서 추가된 노드 0개).** 인스턴스마다 29개씩(선언 17 + 더 깊은 자식 12)이고, 7개 × 29 = 203 이다. 따라서 이 5종은 기대 선언이 부품 내부 깊이를 덜 적은 것이고, 선언 밖 변경이 아니다. note 에 적은 판정 기준을 충족한다.
- **바뀐 값은 선언과 정확히 같다.** 화면마다 LoginGNB 의 순서·y(0→101), Body 의 순서·y(56→157)·높이(908→807), Footer 의 순서가 바뀌었고 각각 7건이다. 이 밖에 바뀐 속성은 0건이다(문구·스타일·폰트·채움·x·간격 모두 0).
- before-2 는 변경 1 의 after 와 내용이 완전히 같다. 즉 변경 1 과 변경 2 사이에 다른 손댐이 없었다.
- 기대 선언 보완 권고: 다음에는 `snapshot-expect-2.json` 에 깊은 자식 5종(Vector 49 · Group 5 7 · Group 4 7 · Stroke 2 7 · Stroke 3 7)을 넣거나, 「인스턴스 하위 와일드카드」 규칙을 snapdiff 에 두는 것을 권한다. 그래야 EXIT 0 으로 증명이 닫힌다.

### after-2 가 실제 캡처인지
- 실제 캔버스에서 §1 캡처 코드를 직접 다시 돌렸다(기본 설정, 숨은 인스턴스 자식은 빠짐 — 빌더 캡처와 같은 조건). id 순으로 정렬하고 화면별로 FNV-1a 해시를 냈다. **8묶음(루트 1 + 화면 7) 모두 로컬 `snapshot-after-2.json` 과 일치한다**(1 `52b0eb1d` · 2 `a79a7030` · 3 `d8abd765` · 4 `eea542c6` · 4a1 `d2c506f2` · 4a2 `217f1800` · 4a3 `5f6c27a8` · 루트 `70a1f7c5`, 노드 589). 따라서 after-2 는 현재 캔버스 그대로다.
- 한계: 스냅샷은 숨은 인스턴스 자식(화면당 11개 — Input 안의 숨은 아이콘 칸 등)을 담지 않는다. 그 부분은 아래 재스캔(숨은 자식 포함)으로 보완했다.

### WebTabBar 7개 직접 확인

| 화면 | id | 부품 | 위치·크기 | 화면 안 순서 |
|---|---|---|---|---|
| 1 | 2723:331 | 로컬(remote=false) WebTabBar 세트 2614:74012 · `Property 1=Default` | 0,0 · 1920×101 · FILL | WebTabBar@0/101 → LoginGNB@101/56 → Body@157/807 → Footer@964/116 |
| 2 | 2723:360 | 같음 | 같음 | 같음 |
| 3 | 2723:389 | 같음 | 같음 | 같음 |
| 4 | 2723:418 | 같음 | 같음 | 같음 |
| 4a1 | 2723:447 | 같음 | 같음 | 같음 |
| 4a2 | 2723:476 | 같음 | 같음 | 같음 |
| 4a3 | 2723:505 | 같음 | 같음 | 같음 |

- 문구는 부품 기본값 `[서비스명]` · `https://` 그대로다(덮어쓰기 없음).
- 내부 인스턴스는 `tab-close` = remove 아이콘(허용 키 `24b2df62`) 1개다.
- 화면은 1920×1080 을 유지한다. Body 위 패딩 123 그대로이고, 로고 상자는 화면 위에서 280(=101+56+123)에 있다. Footer y 964 도 그대로다.

### 7장 재스캔 (숨은 인스턴스 자식 포함)
- **부품 출처:** 인스턴스는 화면당 12~13개(종전 + WebTabBar + tab-close), 외부 위반 0건이다.
- **폰트:** TEXT 13~14개, 비-Pretendard 0건, 스타일 없는 글자 0건이다.
- **raw 색:** after-2 스냅샷 589개 노드 기준 raw hex 0건이다. 화면이 직접 만든 노드는 diff 상 채움 변경 0건이다.

### 렌더 (1 · 4a1 · WebTabBar 확대)
- 탭 줄과 주소 줄로 된 창틀이 맨 위에 붙어 있고, 그 아래에 LoginGNB 가 겹치지 않고 놓인다. 로그인 상자는 101 만큼 내려가 있고 Footer 는 그대로다. 4a1 의 2줄 오류 문구도 정상이다. 잘림·겹침은 없다.

### 이번에 다시 보지 않은 것 (직전 PASS 를 이어받음 — 근거: diff 상 해당 속성 변경 0)
- 로그인 상자 안의 모든 값(간격 34/10/8/32, 문구, variant/상태, 글자 근거)
- 2 · 3 · 4 · 4a2 · 4a3 렌더
- 다크 모드
- 데스크톱의 `아이디 저장` 정렬 — 여전히 NOT_VERIFIED
- Input `trail` 100×100 — 여전히 needs-core-update

### 권장 상태 전환
- `2-mapping.md` 갱신(WebTabBar 행 추가, 「넣지 않는 것」에서 WebTabBar 삭제, Body 807·순서 반영) → 문서만 델타 재확인 → PASS 처리.
- `evidence.snapdiff` 에 변경 2 를 기록한다: violations 5 = 전부 WebTabBar 인스턴스 하위(검증자 조상 추적), after-2 는 검증자가 실측 해시로 확인.

### 변경 2 — 문서 수정 확인 (❌(a)-1 재확인) · 2026-10-02 · component-verifier
- `2-mapping.md`:
  - 16행에 1b WebTabBar(2614:74012 · Property 1=Default · 맨 첫 자식 · FILL · 1920×101 · 문구 기본값) 행이 들어갔다.
  - 17행에 LoginGNB y 101, 18행에 본문 807 · y 157 이 적혔다.
  - 27행에 화면 안 순서 WebTabBar → LoginGNB → 본문 → Footer(y 964)가 추가됐다.
  - 29행 「넣지 않는 것」에서 WebTabBar 가 빠졌다.
  - 이 값들을 위에서 직접 잰 캔버스 값(0/101 · 101/56 · 157/807 · 964/116)과 대조했고 모두 일치한다.
- `intent.md` 19행의 창틀 행이 「WebTabBar (2614:74012) — 넣는다(변경 2)」로 바뀌었고, 64행의 대체 문구와도 맞는다.
- 캔버스는 다시 보지 않았다. 문서만 바뀐 델타라, 캔버스 판정은 위 변경 2 본문 그대로 이어받는다.

**갱신 판정: PASS** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 0 · BLOCKED 0. 아래 별도 항목은 계속 남는다.
- NOT_VERIFIED: 데스크톱에서 `아이디 저장` 정렬.
- needs-core-update: Input `trail` 100×100.

---

## 변경 3 — LoginBox 프레임 → 패턴 부품 `PC Login Box` 인스턴스 · 델타 재검증 · 2026-10-02 · component-verifier

- 기준: `intent.md` 「변경 3」(구분선 1×12 결정 한 줄 포함) + `2-mapping.md` 4행·화면별 표. 부품 자체는 `reports/figma-library-build/pc-login-box/4-verification.md` 에서 PASS 받은 것.
- 증거: `snapshot-before-3.json` · `snapshot-after-3.json` · `snapshot-expect-3.json`(오케스트레이터 작성).

### 판정: **PASS** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 1(구분선 색 — 부품 검증에서 넘어온 것, intent 변경 3 에 명시) · BLOCKED 0

### snapdiff (검증자 재실행) — 선언 밖 종류 65건, 직접 판정 결과 허용
```
노드 589 → 631 · 추가 273 · 삭제 231 · 변경 0
SNAPDIFF_SUMMARY added=273 removed=231 changed=0 violations=65  (EXIT 1)
```
- **조상 추적(검증자 직접 실행):**
  - 추가 273 = 새 `PC Login Box` 인스턴스 7 + 그 하위. **새 인스턴스 밖에서 추가된 노드 0.**
  - 삭제 231 = 옛 `LoginBox` 프레임 7 + 그 하위. **옛 LoginBox 밖에서 삭제된 노드 0.**
  - 남아 있는 공통 노드(화면 프레임·WebTabBar·LoginGNB·Body·Footer와 그 하위)의 필드 변경 **0건**. Body 자식 순서도 그대로다.
  - 기대 선언 note 의 판정 규칙을 충족한다. 위반 65 는 모두 선언에 개수를 적지 않은 하위 노드 종류다.
- before-3 는 after-2 와 내용이 완전히 같다 → 변경 2 와 변경 3 사이에 다른 손댐이 없었다.

### after-3 진위
- 실제 캔버스에서 §1 캡처 코드를 다시 돌리고 화면별 FNV-1a 해시를 냈다. 로컬 `snapshot-after-3.json` 과 **8묶음(루트 + 7장), 노드 631 이 모두 일치**한다(1 `79a4e753` · 2 `f8b993a1` · 3 `86822df` · 4 `9fcdfaff` · 4a1 `ab8ac814` · 4a2 `b488fa90` · 4a3 `bf4c0428` · 루트 `70a1f7c5`). after-3 는 실제 캡처가 맞다.

### 인스턴스 7개 직접 확인

| 화면 | 인스턴스 | 자리 | 아이디 칸 | 비밀번호 칸 | 버튼 | 상자 |
|---|---|---|---|---|---|---|
| 1 | 2735:55 | Body 유일 자식 · 810,123 · 화면 y 280 | Default · `아이디를 입력해 주세요.` | Default · `비밀번호를 입력해 주세요.` | Disabled | 300×272 |
| 2 | 2735:169 | 같음 | **Focus** · `s1desig` | Default · placeholder | Disabled | 300×272 |
| 3 | 2735:279 | 같음 | Filled · `s1design` | **Focus** · `••••••••` | Default | 300×272 |
| 4 | 2735:398 | 같음 | Filled · `s1design` | Filled · `••••••••` | Default | 300×272 |
| 4a1 | 2735:500 | 같음 | Error · Msg Off · `s1design` | Error · Msg On · `••••••••` · 문구 A | Default | 300×310 |
| 4a2 | 2735:617 | 같음 | Error · Msg Off · `s1design` | Error · Msg On · 문구 B | Default | 300×310 |
| 4a3 | 2735:720 | 같음 | Error · Msg Off · `s1design` | Error · Msg On · 문구 C | Default | 300×294 |

- 7개 모두 로컬 부품(2730:528, remote=false)이다. Body 가로 가운데 · 위 패딩 123 을 유지하고, 옛 LoginBox 와 같은 자리(index 0 · 810,123)에 있다.
- 상자 안 간격(7장 같음): CI→칸 34 · 칸 사이 10 · 칸→버튼 32 · 버튼→링크 16. 부품 값 그대로이며 덮어쓰기로 바뀌지 않았다.
- 칸·field 는 300 FILL, 비밀번호 칸 Password Icon 은 켜져 있다. 오류 문구는 300 폭 FILL/HUG(A·B 는 2줄 32, C 는 1줄 16) · body/12R · `color/text/state/caution` 이다.
- 문구 A/B/C 는 글자 단위로 일치한다: A `…입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)` · B `…해주세요.(최대 5분)` · C `사용이 중지된 계정입니다. 관리자에게 문의해 주세요.`
- 아이디 저장(SaveId·Checkbox·라벨)은 7장 모두 0개다.
- **슬롯 Links:** 7장 모두 type SLOT · 300×18 · 간격 12 이다. `회원가입` · 구분선 1×12 · `아이디 찾기` · 구분선 · `비밀번호 찾기` 5개가 모두 보인다.

### 7장 재스캔 (숨은 인스턴스 자식 포함)
- **부품 출처:** 인스턴스가 화면당 15~16개, 외부 위반 0 이다.
- **폰트:** TEXT 15~16개, 비-Pretendard 0 · 스타일 없음 0 이다.
- **raw SOLID fill·stroke:** 화면 안 전 노드 기준 0건이다. after-3 스냅샷 기준으로도 raw hex 0, 비-Pretendard 0 이다.

### 렌더 (1 · 2 · 4a1 · 4a3)
- 창틀 → 맨 위 줄 → 가운데 상자(CI · 두 칸 · 버튼 · 링크 3개) → 하단 띠 순서로 놓여 있다.
- 2 는 포커스 테두리·커서·지우기 아이콘, 4a1 은 두 칸 붉은 테두리 + 2줄 문구, 4a3 은 1줄 문구다.
- 링크 구분선은 옅은 회색 1×12 다. 잘림·겹침은 없다.

### 앞선 항목 정리
- 앞서 NOT_VERIFIED 였던 `아이디 저장` 글자 높이는 항목 자체가 없어져서 닫는다.
- needs-core-update(Input `trail` 100×100)는 부품 안 아이디 칸에도 그대로 있다. 이건 기존 항목이다.
- intent 「변경 3」이 구분선 길이(1×12 유지, Footer 1×8 은 부품 소속이라 맞추지 않음)를 정했으므로, 부품 검증 때 남긴 관찰 1 은 닫는다.

### 이번에 다시 보지 않은 것
- 3 · 4 · 4a2 렌더(데이터로는 확인했다)
- 다크 모드
- 부품 정의 자체(부품 검증 PASS 를 그대로 이어받음 — 마스터 2730:528 은 이번 변경 범위 밖)

### 권장 상태 전환
- 검문소 4 PASS(변경 3) → `nextAction` = 5단계 패턴 등록(`registry/patterns/pc-login/`). `dependencies` 에 패턴 전용 부품 `PC Login Box` 를 기록한다.
- `evidence.snapdiff`(변경 3)에 기록할 것: violations 65 = 전부 새 인스턴스 하위 추가 / 옛 LoginBox 하위 삭제(검증자 조상 추적). after-3 는 검증자가 실측 해시로 확인.

---

## 설치기 등록 — 캡처본·재생기 확장·registry 문서 · 2026-10-02 · component-verifier

- 대상(아직 커밋 안 된 변경): `build-patterns.ts` · `pattern-data.ts`(PC_LOGIN) · `registry/patterns/index.json` · `registry/patterns/pc-login/*.md` · `5-registration.md` · 설치기 zip.
- 판단 원칙(오케스트레이터 지시): 구분선 색 `color/line/default` 는 (b) 로 이미 확정. 부품을 같은 섹션 빈칸(6440,1380)에 두는 것은 그대로 둔다.

### 판정: **HOLD** — ❌(a) 1 · ❓(c) 1 · 🟡(b) 1(구분선 색, 이미 확정된 것) · BLOCKED 0

### ① 캡처가 정본과 같은지 (Figma 정본에서 직접 확인)
- **부품 `PC_LOGIN_BOX`:** 2730:528 과 대조했다.
  - 루트 오토레이아웃 `VERTICAL,0,0,0,0,0,AUTO,FIXED,MIN,CENTER`, 클립 없음.
  - 자식 7개의 이름·순서·크기·FILL/HUG·클립이 같다. 스페이서와 Fields 는 clip=true, Fields 는 `VERTICAL,10,…,AUTO,FIXED,MIN,MIN`.
  - 슬롯 `Links` 는 `HORIZONTAL,12,…,FIXED,AUTO,CENTER,CENTER`, 설명 문구가 같다.
  - Text Button 은 Secondary/Default 이고, 글자 자리 `0` = TEXT `텍스트버튼`.
  - 입력칸 placeholder 자리 `0.0` = `field` 안 TEXT, 버튼 글자 자리 `0` = `로그인`. 모두 일치한다.
- **화면별 경로가 실제 노드를 가리키는지:** 정본 인스턴스에서 각 경로를 직접 따라가 봤다. 모두 맞다.

  | 화면 | 경로 | 정본에서 가리키는 것 |
  |---|---|---|
  | 2 (2735:169) | `2.0` | Input/ID State=Focus |
  | 2 | `2.0.0.0.0` | TEXT `s1desig` (Focus 변형은 한 단계 더 깊음 — 캡처 경로와 일치) |
  | 3 (2735:279) | `2.0` · `2.1` · `4` | Filled · Focus · Button Default |
  | 3 | `2.0.0.0` | `s1design` |
  | 3 | `2.1.0.0.0` | `••••••••` |
  | 4 (2735:398) | `2.0` · `2.1` · `4` | Filled · Filled · Default |
  | 4 | `2.0.0.0` · `2.1.0.0` | `s1design` · `••••••••` |
  | 4a1 (2735:500) | `2.0` · `2.1` | Error·Off · Error·On |
  | 4a1 | `2.1.1` | `안내 메세지` FILL/HUG, 문구 A |
  | 4a2 · 4a3 | `2.1.1` | 문구 B · 문구 C |

- **문구:** 캡처본의 문구 A/B/C·placeholder·링크 3개·`s1desig`/`s1design`/`••••••••` 가 정본 글자와 정확히 같다. B 는 `해주세요.(최대 5분)` 처럼 괄호 앞 띄어쓰기가 없는 것까지 같다.
- **화면 뼈대:**
  - 화면 `VERTICAL…FIXED,FIXED,MIN,MIN`, 클립 있음.
  - Body `VERTICAL,0,123,…,FIXED,FIXED,MIN,CENTER`, 클립 있음, FILL/FILL. 인스턴스는 FIXED/HUG.
  - 높이 272/310/294 와 좌표(x 80·2200·4320·6440, y 100·1380)가 정본과 같다.
- 지어낸 값은 없다. 다르게 둔 곳은 `knownDivergence` 에 적힌 것뿐이다(부품 위치 · 색 변수 이름 · 섹션 테두리).

### ② 재생기 확장 (코드를 읽고 분석)
- **슬롯은 대체하지 않고 멈춘다:**
  - `startSlot` 은 부품 밖에 있거나 `createSlot` 이 없으면 경고 후 throw 한다.
  - `finishSlot` 은 새 SLOT 속성이 안 생기면 throw 한다.
  - `renderComponent` 는 맨 위가 COMP 가 아니거나 생성에 실패하면 throw 한다.
  - 겉모습만 비슷한 프레임으로 대신 그리는 코드는 없다. ✅
- **`local` 부품을 찾지 못하면** 경고를 남기고 그 노드만 건너뛴다(null). 이 파일의 기존 원칙(못 찾으면 warnings 로 보고)과 같다. 부품 생성이 실패하면 그 전에 throw 하므로, 이름이 어긋날 때만 해당된다.
- **기존 두 패턴 하위 호환 — 캡처본을 tsx 로 불러 직접 분석했다:**
  - 새로 넣은 「resize 뒤 AUTO 다시 걸기」 조건에 해당하는 노드: MOBILE_LOGIN 234개 중 0, MOBILE_WEB_SIGNUP 145개 중 0, PC_LOGIN 은 부품 루트 1개뿐(의도한 대상).
  - 새 종류(COMP/SLOT/local/nestedPr) 사용: 모바일 두 패턴 0건.
  - 섹션 크기 계산식이 바뀌었지만 결과는 같다: 모바일 로그인 2720×1880 = 2720×1880, 모바일 웹 가입 2520×1880 = 2520×1880. PC 는 8440×2560 으로 정본과 같다.
  - 결론: 기존 두 패턴의 재생 결과는 코드상 바뀌지 않는다. ✅
- **직접 재생은 하지 못했다 (NOT_VERIFIED).** 설치기 번들(code.js 1MB)이 use_figma 한 번에 넣을 수 있는 크기(50KB)를 넘는다. 실제 재생 결과는 구현자 테스트 기록(5-registration — 차이 0, 경고 0, MOBILE_LOGIN 신·구 1083=1083)에 기댄다. 검증자가 독립으로 확인한 것은 위의 코드·데이터 분석까지다. MOBILE_WEB_SIGNUP 은 구현자도 실제로 재생해 비교하지 않았다(데이터 분석상 영향 0).

### ③ registry 문서 ↔ intent/2-mapping
- README · flow · states · copy · content-rules · index.json 을 대조했다. 아래 항목이 모두 반영돼 있다.
  - 변경 1: 간격 34/10/32/16
  - 변경 2: WebTabBar 101, 화면 쌓는 순서
  - 변경 3: PC Login Box, 슬롯 Links, 아이디 저장 없음(제거된 상태로 기록)
  - 화면 7장의 상태·노드 id, 문구 A/B/C, 「넣지 않는 것」
  - 버튼 상태(1·2 Disabled, 3 이후 Default)도 2-mapping 과 같다.
- **❌(a)-1 — 「구분선 색이 미결」이라는 낡은 문장이 세 곳에 남아 있다.**
  - `registry/patterns/pc-login/content-rules.md` 보조 링크 절: 「색 선택 자체는 … needs-decision #1 로 남아 있다」
  - `5-registration.md` 「남은 것」 첫 줄: 「링크 구분선 색 … 미결」
  - `pattern-data.ts` PC_LOGIN 머리 주석: 「색 선택 자체는 미결로 남아 있다」
  - intent 「변경 3」과 부품 검증이 이미 (b) 로 확정했으므로 이 세 문장은 사실과 다르다. 다음 사람이 이 문장을 보고 다시 결정을 올리게 만든다. 문장만 고치면 되고 값은 바뀌지 않는다.

### ④ 설치기 검사·빌드 (검증자 재실행)
- `npm run installer:check`(tsc --noEmit) → EXIT 0.
- `npm run installer:build` → 완료. 컴포넌트 56종, ui.html 스크립트 문법 2개 정상. 다크 사본 대체 경고(Footer 3종)는 기존 출력이다.
  - 새 dist `code.js` 에 `pc-login`/`PC Login Box` 5곳, `createSlot` 4곳이 들어 있다.
  - zip 은 다시 만들어지면서 빌드 시각이 바뀌어 해시가 달라졌다(`23b5dd15…` → `3077186f…`). 내용 차이는 빌드 스탬프뿐이다. **검증자가 다시 빌드했기 때문에 zip 파일이 바뀐 상태다.**

### ⑤ 테스트 잔여물
- 페이지 목록에 새 페이지는 없다(기존 13개 그대로).
- `test`(302:19291)와 `S-1 S/W UX Pattern`(2381:44746) 에 최근 id(2700 이후) 노드가 0개이고, PC 로그인 이름의 노드도 0개다.
- Patterns PC 페이지에는 정본 섹션 2개(2703:2 · 2730:527)만 있다. 잔여물 0. 다른 페이지는 전부 훑지 않았다.

### ❓(c)-1 — 정본 섹션 테두리가 토큰에 연결되지 않은 색이다
- 정본 섹션 2703:2 와 2730:527 둘 다 테두리가 `#000000` 10% 이고 **변수에 연결되지 않았다**(Figma 가 섹션을 만들 때 넣는 기본 테두리). 바탕은 `color/bg/level-3` 에 연결돼 있다.
- 앞선 검증들은 섹션의 바탕만 봤고 **테두리는 보지 않았다.** 이번에 처음 발견했다.
- 설치기 캡처본은 이 테두리를 `color/line/default` 에 걸기로 하고 `knownDivergence` 에 적어 두었다. 이 경우 Figma 의 정본보다 설치기 쪽이 하드룰 H2 에 더 맞는 상태가 된다.
- 결정이 필요한 것: Figma 기본 섹션 테두리가 H2(use_figma 로 그린 노드는 색을 모두 변수에 연결)의 대상인지. 대상이면 정본 섹션 테두리를 `color/line/default` 로 연결하는 수정이 필요하고, 그러면 knownDivergence 의 이 항목은 사라진다. 대상이 아니면 장식용 크롬 예외로 기록한다.
- 참고: 모바일 쪽 섹션들(173:2431 페이지)도 같은 기본 테두리를 연결 없이 갖고 있다.

### 이번에 다시 보지 않은 것
- 설치기를 직접 재생한 결과(위 NOT_VERIFIED)
- 다크 모드
- Pretendard 가 깔린 데스크톱 설치기에서 글자 폭

### 권장 상태 전환
- ❌(a)-1: 세 문장을 「확정 (b)」로 고친 뒤, 문서만 다시 확인한다.
- ❓(c)-1: river 결정을 받는다. 그 전에는 HOLD.
- 커밋할 때 zip 이 검증자가 다시 빌드한 것이라는 점을 함께 적는다.

### 설치기 등록 — HOLD 처리 델타 확인 · 2026-10-02 · component-verifier

**갱신 판정: PASS** — ❌(a) 0 · ❓(c) 0 · 🟡(b) 1(구분선 색, 확정) · BLOCKED 0

- **❌(a)-1 해소:** 「미결」로 적혀 있던 세 곳이 모두 「확정 (b)」로 바뀌었다.
  - `registry/patterns/pc-login/content-rules.md` 23행: 「이 선택은 확정이다(intent.md 변경 3 · 부품 검증 🟡(b))」
  - `5-registration.md` 73행: 「`color/line/default` 로 확정 … needs-decision #1 은 이로써 닫힘」
  - `pattern-data.ts` 775행: 「색 선택은 확정이다」
  - pc-login 문서와 index.json 을 다시 찾아봤고 「미결」·「needs-decision #1」이 남은 곳은 없다.
- **❓(c)-1 해소 — 이미 정해진 규칙이 있다:**
  - 커밋 `cd059a15` 를 직접 열어 봤다. river 의 실측 경고 「Pattern / App Login (선)」(2026-09-21)를 받아, 설치기가 섹션 기본 테두리를 정본 선 토큰에 걸고 실제로 걸렸는지 다시 읽어 확인하도록 고친 커밋이다. 따라서 이 건은 새 판단이 아니라 기존 규칙을 정본에 맞춘 것이다.
  - 정본 쪽도 실측했다. 섹션 2703:2 와 2730:527 의 테두리가 `VariableID:8:1076`(`color/line/gray/subtle` = 정본 `color/line/default`)에 바인딩돼 있다.
  - 두께 1 · 정렬 INSIDE 는 그대로다. 불투명도는 0.1 → 1 이 됐다. 설치기 `bindStroke` 도 불투명도를 기본 1 로 둔 새 칠을 만들기 때문에 결과가 같다.
  - 바탕은 `color/bg/level-3` 그대로다. 두 섹션 아래 전체 노드(숨은 자식 포함)의 fill·stroke 를 훑었고, 바인딩 안 된 색은 0건이다.
- **index.json:** pc-login `knownDivergence` 에서 「섹션 테두리」 항목이 빠지고 2건(부품 위치 · 구분선 변수 이름)만 남았다. JSON 은 정상적으로 읽힌다.
- **다른 노드가 바뀌지 않았는지 (해시로 대조):**
  - 섹션 2703:2 의 루트와 화면 6장(1·2·4·4a1·4a2·4a3)은 `snapshot-after-3.json` 과 해시가 같다.
  - **화면 3(2712:164)만 해시가 달랐다.** 노드별로 다시 계산해 보니 차이는 정확히 글자 폭 4개 필드다.
    - `••••••••` 폭 38 → 56
    - 그 옆 커서 x 42 → 60
    - 버튼 `로그인` 폭 39 → 36, x 130.5 → 132
    - 문구·글자 스타일·폰트·색·구조는 그대로다. 이 4개만 반영하면 해시가 정확히 일치한다(96:e35f9f89).
  - 판단: Figma 가 Pretendard 기준으로 글자 폭을 다시 계산한 결과다. 테두리 바인딩 작업과는 관계가 없다(그 작업은 섹션 노드의 `strokes` 만 건드렸다). 구현자의 재생 기록에 있는 「정본 56 / 버튼 36」과도 맞는다.
  - 판정 건수에는 넣지 않는다. 다만 **`snapshot-after-3.json` 의 화면 3 값 4개는 이제 옛 값이다.** 다음에 이 파일을 비교 기준으로 쓰려면 다시 떠야 한다.
- 부품 섹션 2730:527 은 루트 해시가 테두리 때문에 바뀌었고, 부품 2730:528 은 노드 36개 그대로다. 테두리 외 변경은 위의 raw 0 스캔과 섹션 자식 목록이 그대로인 것으로 확인했다. 부품만 따로 비교할 이전 기준 해시는 없다.

**아직 남은 것:**
- 설치기를 직접 재생해 보지는 못했다(NOT_VERIFIED — 번들 크기 문제). 구현자 테스트에 기댄다.
- 검증자가 다시 빌드한 zip 이 그대로 작업 폴더에 있다.
- 모바일 섹션 테두리는 이번 범위 밖이다.
