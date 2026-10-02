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
