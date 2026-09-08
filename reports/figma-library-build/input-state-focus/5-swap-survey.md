# 5단계 — 갈아끼우기 사전조사 (읽기 전용, 아무것도 고치지 않음)

**조사자:** 🤖 figma-inspector (2026-09-08)
**목적:** river 결정("로그인·회원가입 시안의 Input 인스턴스 30개를 현재 정본 세트로 갈아끼우기") 착수 전 1:1 대응 가능 여부 확인.
**판정·제안 없음** — 사실과 근거만 기록한다.

**파일:** `cysG5U1udpQqVagYY1hWHW` · **페이지:** `173:2431` (Patterns Mobile)
**읽기 방법:** `get_metadata`로 구조를 좁히고(section→frame→instance), 대표 유형별로만 `get_design_context`(코드+렌더)를 깊이 읽었다. 일부 항목은 같은 날짜에 이미 돌았던 🤖 `component-verifier`의 `use_figma` 읽기 전용 스캔 결과(`4-verification.md`, `node-map.json`)를 인용했다 — 그 부분은 출처를 명시했고, 이번 세션에서 MCP로 재확인하지 않았다(MCP `get_metadata`/`get_design_context`는 componentProperties·axis 목록을 직접 노출하지 않는다).

---

## 0. 총 개수 확인

| 섹션 | 프레임 수 | Input 인스턴스 수 | 근거 |
|---|---|---|---|
| `Pattern / App Login` (`1562:2`) | 10 | **20** | 본 세션 `get_metadata(1562:2)` 전수 나열 |
| `Pattern / Mobile Web Signup` (`1744:1782`) | 12 | **10** | 본 세션 `get_metadata(1744:1782)` 전수 나열 (`Domain Select`는 Select 컴포넌트라 제외) |
| **합계** | — | **30** | river 지시 수치와 일치, 🤖 `component-verifier` 4-verification.md §2 실측(555개 INSTANCE 전수 스캔)과도 일치 |

---

## 1. 30개 전수 목록

### 1-A. `Pattern / App Login` (섹션 `1562:2`) — 참조 마스터 **`1546:10988`** (`Input`, 112 variant, 축에 `Label` 있음 — 출처: `4-verification.md` §2, 이번 세션 재확인 안 함)

| # | 프레임 id · 이름 | 인스턴스 id | 인스턴스 이름 | 크기(W×H) | 화면상 상태(관찰) | Label 표시 |
|---|---|---|---|---|---|---|
| 1 | `1562:3` APP/LOGIN/1 최초진입 | `1564:31` | Input / ID | 320×48 | 빈 값, placeholder "아이디를 입력해 주세요." | **Off** |
| 2 | 〃 | `1564:36` | Input / Password | 320×48 | 빈 값, placeholder "비밀번호를 입력해 주세요." | **Off** |
| 3 | `1562:4` APP/LOGIN/2 아이디입력중(키보드) | `1564:109` | Input / ID | 320×48 | 선택(포커스) 상태 — 🤖 스캔에서 `State=Editing` 확인, 캡처 `screens/legacy-login-editing-1564-109.png`(기존 파일, 이번 세션 재사용) | **Off** |
| 4 | 〃 | `1564:127` | Input / Password | 320×48 | 미확인(빈 값 추정, 직접 열지 않음) | 미확인(구조상 Off 추정 — 직접 열지 않음) |
| 5 | `1562:5` APP/LOGIN/3 비밀번호입력중(키보드) | `1564:180` | Input / ID | 320×48 | 미확인(직접 열지 않음) | 미확인 |
| 6 | 〃 | `1564:185` | Input / Password | 320×48 | 선택(포커스) 상태 — 🤖 스캔에서 `State=Editing` 확인 | **Off**(구조 동일 계열로 추정 — 직접 열지 않음, 아래 근거 참조) |
| 7 | `1562:14` APP/LOGIN/4 입력완료·로그인활성 | `1567:766` | Input / ID | 320×48 | 값 채움 "s1design" — 본 세션 `get_design_context` 확인 | **Off**(본 세션 확인) |
| 8 | 〃 | `1567:771` | Input / Password | 320×48 | 미확인(직접 열지 않음) | 미확인 |
| 9 | `1562:8` APP/LOGIN/4a1 계정불일치오류 | `1566:353` | Input / ID | 320×48 | 미확인 | 미확인 |
| 10 | 〃 | `1566:358` | Input / Password | 320×86 | 오류 상태, 메시지 On "아이디 또는 비밀번호가 없거나 잘못 입력되었습니다. / 확인 후 다시 로그인 해주세요. (1/5)" — 본 세션 확인 | **Off**(본 세션 확인) |
| 11 | `1562:9` APP/LOGIN/4b1 자동로그인질문(모달) | `1566:425` | Input / ID | 320×48 | 미확인 | 미확인 |
| 12 | 〃 | `1566:430` | Input / Password | 320×48 | 미확인 | 미확인 |
| 13 | `1562:10` APP/LOGIN/4b2 자동로그인완료(모달) | `1566:511` | Input / ID | 320×48 | 미확인 | 미확인 |
| 14 | 〃 | `1566:516` | Input / Password | 320×48 | 미확인 | 미확인 |
| 15 | `1562:11` APP/LOGIN/4c1 본인인증안내(모달) | `1566:595` | Input / ID | 320×48 | 미확인 | 미확인 |
| 16 | 〃 | `1566:600` | Input / Password | 320×48 | 미확인 | 미확인 |
| 17 | `1562:12` APP/LOGIN/4c2 기기인증완료(모달) | `1566:679` | Input / ID | 320×48 | 미확인 | 미확인 |
| 18 | 〃 | `1566:684` | Input / Password | 320×48 | 미확인 | 미확인 |
| 19 | `1562:13` APP/LOGIN/4c3 기기등록안내(모달) | `1567:680` | Input / ID | 320×48 | 미확인 | 미확인 |
| 20 | 〃 | `1567:685` | Input / Password | 320×48 | 미확인 | 미확인 |

> **Label 축 관찰 근거:** #1·#2·#3·#7·#10을 본 세션에서 직접 `get_design_context`로 열어봤다 — 5건 모두 필드 위에 별도 Label 텍스트 행이 없다(placeholder-in-field 또는 값-in-field 구조만 있음). 나머지 15건은 이름·크기(모두 48px 표준 높이, `#10` 오류 케이스만 86px)로 볼 때 같은 두 컴포넌트(Input/ID, Input/Password)의 반복이라 구조가 같을 가능성이 높지만, **개별로 열어보지 않았으므로 Label 값은 "미확인"으로 남긴다.** (river 요청 "판정하지 마라"에 따라 축소 확인을 근거로 단정하지 않음)

### 1-B. `Pattern / Mobile Web Signup` (섹션 `1744:1782`) — 참조 마스터 **`1654:42409`** (`Input`, 112 variant, 축에 `Label` 있음 — 출처: `4-verification.md` §2)

| # | 프레임 id · 이름 | 인스턴스 id | 인스턴스 이름 | 크기(W×H) | 화면상 상태(관찰, 본 세션 전수 확인) | Label 표시 |
|---|---|---|---|---|---|---|
| 21 | `1989:356` SIGNUP/3 아이디입력중(키보드) | `1989:550` | ID Input | 320×70 | 선택 상태, 값 "s1design", 지우기(x) 아이콘, 메시지 On "영어 소문자, 숫자를 조합하여 4~12자 입력해 주세요." | **Off** |
| 22 | `1858:1783` SIGNUP/4 비밀번호입력중(키보드) | `1858:18032` | Password Input | 320×94 | 선택 상태(빈 값), 메시지 On "영문, 숫자, 특수문자를 조합하여 8~15자로 입력해 주세요." | **On — 텍스트 "비밀번호"** (스크린샷 확인, 아래 §3) |
| 23 | 〃 | `1858:18061` | Password Confirm Input | 320×72 | 기본 상태, placeholder "입력해 주세요" | **On — 텍스트 "비밀번호 확인"** (스크린샷 확인, 아래 §3) |
| 24 | `1989:357` SIGNUP/5 이메일입력중(키보드) | `1989:18940` | Local Part Input | 140×48 | 선택 상태, 값 "텍스트" | **Off** |
| 25 | 〃 | `1989:18961` | Domain Input | 320×48 | 기본 상태, placeholder "도메인을 입력해 주세요." | **Off** |
| 26 | `1858:1785` SIGNUP/2b1 기존아이디선택(바텀시트) | `1858:18433` | ID Input | 320×70 | `#21`과 동일 구조(선택, "s1design", 메시지 동일) | **Off** |
| 27 | `1996:2` SIGNUP/4a1 비밀번호조건안내(다이얼로그) | `1996:7` | Password Input | 320×94 | `#22`와 동일 구조 | **On — 텍스트 "비밀번호"** |
| 28 | 〃 | `1996:8` | Password Confirm Input | 320×72 | `#23`과 동일 구조 | **On — 텍스트 "비밀번호 확인"** |
| 29 | `1996:19300` SIGNUP/5a1 이메일도메인선택(바텀시트) | `1996:19305` | Local Part Input | 140×48 | `#24`와 동일 구조 | **Off** |
| 30 | 〃 | `1996:19308` | Domain Input | 320×48 | `#25`와 동일 구조 | **Off** |

> 30개 전부 본 세션에서 `get_design_context`로 직접 열어 확인했다(회원가입 쪽은 축소 없이 전수).
> 제외 항목(30개에 안 셈): `1989:18954` `Domain Select`, `1996:19307` `Domain Select` — 이름·구조상 Select 컴포넌트 인스턴스라 river 30건 정의(및 🤖 검증자 555개 INSTANCE 스캔 결과 30건)와 일치시키기 위해 제외했다. **판정은 아니다 — 두 인스턴스가 실제로 어떤 마스터를 참조하는지는 이번에 확인하지 않았다(미확인).**

---

## 2. Label 값 분포

| 구간 | Label=On | Label=Off | 미확인 |
|---|---|---|---|
| App Login (20개) | 0(확인분 기준) | 5(직접 확인) | 15 |
| Mobile Web Signup (10개, 전수 확인) | **4** | **6** | 0 |
| **합계(확인된 것만)** | **4** | **11** | **15** |

- **확정적으로 Label=On인 인스턴스는 4개, 전부 Mobile Web Signup 쪽이다:** `1858:18032`·`1996:7`(둘 다 "비밀번호") · `1858:18061`·`1996:8`(둘 다 "비밀번호 확인").
- App Login 20개 중 15개는 이번 조사에서 열어보지 않아 **미확인**으로 남는다. 열어본 5개(#1·#2·#3·#7·#10 — base/빈값·filled/값채움·editing/포커스·error/메시지 4가지 서로 다른 상태 유형)는 전부 Label=Off였다. 이것으로 나머지 15개도 Off라고 **단정하지 않는다** — river 요청("판정·제안 금지")에 따름.

---

## 3. Label=On 인스턴스의 실제 렌더 확인 (river 요청 #3)

| 인스턴스 | 스크린샷 | 확인된 텍스트(verbatim) |
|---|---|---|
| `1858:18032` (Password Input, SIGNUP/4) | `reports/figma-library-build/input-state-focus/screens/1858-18032-password.png` | **비밀번호** |
| `1858:18061` (Password Confirm Input, SIGNUP/4) | `reports/figma-library-build/input-state-focus/screens/1858-18061-password-confirm.png` | **비밀번호 확인** |
| `1996:7` (Password Input, SIGNUP/4a1 다이얼로그) | 별도 캡처 안 함 — `get_design_context` 코드 결과가 `1858:18032`와 텍스트·구조 100% 동일(같은 텍스트 노드명·같은 라벨 문구) | **비밀번호**(코드 대조로 확인, 스크린샷 미확보) |
| `1996:8` (Password Confirm Input, SIGNUP/4a1 다이얼로그) | 별도 캡처 안 함 — `get_design_context` 코드 결과가 `1858:18061`과 동일 | **비밀번호 확인**(코드 대조로 확인, 스크린샷 미확보) |

라벨은 필드 **위쪽**에 별도 텍스트 행으로 렌더된다(예: "비밀번호" 텍스트 + 그 아래 입력 필드 + 그 아래 안내문구). 새 정본 세트(§4)에는 이 텍스트 행 자체가 컴포넌트 구조에 없다.

---

## 4. 옛 세트 종류

이번 세션에서 두 인스턴스 그룹이 서로 다른(그러나 축 구성은 같은 계열로 보이는) 마스터 두 개를 가리킨다는 것을 `get_metadata`/`get_design_context`로 재확인했다(마스터 자체의 내부 variant 목록은 이번 세션에서 열지 않았다 — 인스턴스 쪽 정보만 확인). 마스터의 정확한 axis·value 목록은 같은 날 돌았던 🤖 `component-verifier`의 `4-verification.md`·`node-map.json`을 인용한다(출처 표시, 이번 세션 재확인 아님).

| 마스터 id | 이름 | remote | variant 수 | 쓰는 화면 | propKeys(축) | State 값 목록 | 출처 |
|---|---|---|---|---|---|---|---|
| `1546:10988` | Input | 미확인(값 자체를 이번에 열지 않음) | 112 | App Login 20개 전부 | 미확인(값 자체는 안 열었음) — `4-verification.md`는 "112 variant, 축에 Label 있음"만 명시 | 미확인 | `4-verification.md` §2 |
| `1654:42409` | Input | 미확인 | 112 | Mobile Web Signup 10개 전부 | 〃 | 미확인 | `4-verification.md` §2 |
| (참고) `2407:82` | Input | **true**(다른 파일 — `[에스원] GUI(공유용)` 공유 라이브러리, 원격) | 112 | 이 파일의 30개와는 무관(별개 파일의 별개 마스터) — 다만 같은 세대(Label 축 보유)라 축 구성 참고용으로 인용 | `Size` · `State` · `icon` · `Lable`(원문 오탈자 그대로) · `Message` · `Break` | `Default`·`Read-Only`·`Filled`·`Editing`·`Error`·`Correct`·`Disabled`(7) | `node-map.json` (`keyResolvedSet_REJECTED`) |
| (참고) `2386:52176` | Input | false, **이미 삭제됨**(이번 정본 재설치로 소거) | 56 | 이 30개와 무관 — Label 축 없는 중간 세대 | `Size`·`State`·`Message`·`Break`(+ BOOLEAN 3종) | `Default`·`Filled`·`Editing`·`Error`·`Correct`·`Read-Only`·`Disabled`(7) | `node-map.json` (`localSetMatchingPlan`) |

**중요:** `1546:10988`·`1654:42409` 둘 다 **캔버스 어디에도 없는 고아(삭제된) 마스터**다 — `4-verification.md` §2가 이미 확인했다("부모 체인이 자기 자신 하나뿐"). 즉 시안이 참조하는 옛 세트는 Figma UI에서 찾아 열어볼 수 없고, 인스턴스에 남은 override 값으로만 존재를 추정할 수 있다. **`Lable`/`Label` 축의 정확한 값 목록(예: On/Off인지 다른 이름인지)은 이번에도, 이전 검증에서도 직접 읽힌 적이 없다 — 미확인.**

---

## 5. 대응표 (옛 조합 → 새 조합)

**새 정본 세트 `2410:13831`** (본 세션 `get_metadata` 재확인): 위치 Core `5:5706` → SECTION `Form Control`. 축 4개, 56 variant.

| 축 | 값 |
|---|---|
| Size | XXSM · XSM · MD |
| State | Default · Filled · Focus · Error · Correct · Read-Only · Disabled (7) |
| Message | Off · On |
| Break | PC · Mobile |
| **Label** | **축 자체가 없음** |

### 대응 시도

| 옛 조합(추정 표기) | 새 조합 대응 | 근거/비고 |
|---|---|---|
| Size=MEDIUM(또는 유사) | Size=MD | 이름 유사성 추정일 뿐 — **폭·수치로 검증하지 않았다. 미확인** |
| Size=SMALL | Size=XSM | 〃 |
| Size=XSMALL | Size=XXSM | 〃 |
| State=Default/Filled/Error/Correct/Read-Only/Disabled | 이름 그대로 대응(신·구 공통 존재) | `2386:52176`(중간 세대) 단계에서 이미 이 6개는 그대로였다 |
| State=Editing | State=Focus | 같은 날 별도 작업으로 이미 개명 확인됨(`4-verification.md` §1: "Editing 문자열 잔존 0건", §5-1 정규식 매칭) |
| Message=Off/On | Message=Off/On | 이름 그대로 |
| Break=PC/Mobile | Break=PC/Mobile | 이름 그대로(단, 30개 인스턴스가 실제 PC/Mobile 중 어느 쪽 variant였는지는 이번에 개별 확인 안 함 — 전부 모바일 화면(360폭)이므로 Break=Mobile일 가능성이 높으나 **판정하지 않음**) |
| **Label=On** (4건: `1858:18032`·`1858:18061`·`1996:7`·`1996:8`) | **대응 없음** | 새 세트에 Label 축 자체가 없다. 그대로 인스턴스를 교체하면 라벨 텍스트("비밀번호"/"비밀번호 확인")가 사라진다 — river 우려사항이 사실로 확인됨 |
| Label=Off (26건, 그중 확인된 것 11건 + 미확인 15건) | Size×State×Message×Break 조합으로 그대로 대응 가능(구조상) | Label 텍스트가 애초에 없으므로 축 제거의 영향을 받지 않음. 다만 옛 세트의 정확한 axis 값(§4 미확인)이 새 세트 값과 1:1로 맞는지는 **개별 검증 안 됨** |

---

## 미확인 목록 (요약)

- App Login 20개 중 15개(#4·5·6·8·9·11~20)의 Label 값 — 열어보지 않음
- `1546:10988`·`1654:42409` 두 마스터 자체의 propKeys·전체 value 목록(둘 다 삭제된 고아라 직접 열 방법이 없었음 — 인스턴스 쪽 override만 확인 가능)
- 30개 인스턴스 각각의 Size/State/Message/Break 정확한 property 값(MCP `get_metadata`/`get_design_context`가 componentProperties를 노출하지 않음 — 렌더·구조로 상태를 추정했을 뿐 variant 속성값 자체를 읽은 것은 아님)
- `1989:18954`·`1996:19307`(Domain Select) 두 인스턴스가 실제로 어떤 마스터를 참조하는지
- 30개 인스턴스의 Break 축 실측값(PC/Mobile 중 무엇인지)
- Size 축 이름 대응(XSMALL↔XXSM 등)이 실제로 동일한 폭/스타일인지

## 참고(인용, 이번 세션 재확인 아님)

- `reports/figma-library-build/input-state-focus/4-verification.md` §1~2 (🤖 component-verifier, 2026-09-08, `use_figma` 읽기 전용 스캔)
- `reports/figma-library-build/input-state-focus/node-map.json` (🏗️ figma-library-builder, 2026-09-08, blocked-no-writes 상태)
