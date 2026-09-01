# Mobile Signup Web — 2. Mapping

## Baseline

- `legacy`: 웹 원본 9장 (`aLxh458o9BRXklRFM3YYzk`, section `32443:31901`)
- `intent-spec`: 외부 본인인증 플레이스홀더와 앱 원본 가입회원 팝업의 웹 추가
- `existing-nodes`: 이미 빌드된 placeholder `1744:1783`은 보존하고 Section `1744:1782`에 신규 화면을 추가한다.
- 타깃: `cysG5U1udpQqVagYY1hWHW`, `Patterns Mobile(준비중)`, Section `1744:1782`

## 최종 화면 구조

모든 화면은 360×780이다. 캔버스 1행은 기본 흐름, 2행은 분기 묶음이며 Section 자식 순서도 아래 순서를 따른다.

| 구분 | 이름 | source | archetype | 처리 |
|---|---|---|---|---|
| 기본 | `MWEB/SIGNUP/1 · 약관 전체 동의` | `2449:31028` | base | 신규 빌드 |
| 기본 | `MWEB/SIGNUP/2 · 외부 본인인증 (플레이스홀더)` | intent-spec | other | 기존 `1744:1783` 보존 |
| 기본 | `MWEB/SIGNUP/3 · 아이디 입력 중 (키보드)` | `2449:31151` | editing | 신규 빌드 |
| 기본 | `MWEB/SIGNUP/4 · 비밀번호 입력 중 (키보드)` | `2449:31218` | editing | 신규 빌드 |
| 기본 | `MWEB/SIGNUP/5 · 이메일 입력 중 (키보드)` | `2449:31418` | editing | 신규 빌드 |
| 기본 | `MWEB/SIGNUP/6 · 앱 설치 안내` | `2449:31009` | base | 신규 빌드 |
| 분기 | `MWEB/SIGNUP/1a1 · 회원 약관 상세` | `2449:31402` | base | 신규 빌드 |
| 분기 | `MWEB/SIGNUP/2a1 · 가입 회원 안내 (모달)` | app `10580:19015` + intent | overlay | 신규 빌드 |
| 분기 | `MWEB/SIGNUP/2b1 · 기존 아이디 선택 (바텀시트)` | `2449:31168` | overlay | 신규 빌드 |
| 분기 | `MWEB/SIGNUP/4a1 · 비밀번호 조건 안내 (다이얼로그)` | `2449:31278` | overlay | 신규 빌드 |
| 분기 | `MWEB/SIGNUP/5a1 · 이메일 도메인 선택 (바텀시트)` | `2449:31435` | overlay | 신규 빌드 |

## 공통 셸 매핑

| 요소 | 분류 | 정본 |
|---|---|---|
| 제목 없는 앱바 | 정본 인스턴스 | Mobile Header `1760:7247`, `Type=Standard / No Title, Platform=Web` `1898:12288` |
| 웹 상단 크롬 | 정본 인스턴스 | StatusBar `1654:37420`, `Platform=Web` `1654:37388` |
| 웹 하단 크롬 | 정본 인스턴스 | NavBar `1654:37800`, `Platform=Web` `1654:37492` |
| 키보드 화면 하단 | 정본 인스턴스 | NavBar `Platform=Web+Keyboard` `1654:37651`; URL 바·키보드·하단 내비를 별도 제작하지 않음 |
| 화면 배경 | 토큰 프레임 | Semantic surface/background variable |
| 구분선 | 토큰 프레임 | 1px Semantic border variable 바인딩 |

구 set `1545:*`는 기존 로그인 결과의 레거시 참조로 보존한다. 신규 화면은 현재 Core > Platform의 `1654:*`만 사용한다.

## 콘텐츠 컴포넌트 매핑

| 역할 | 정본 세트·상태 | 주요 override |
|---|---|---|
| 체크박스 | Checkbox `1654:39847`, `State=Checked` `1654:39838` | 4개 모두 checked |
| 일반 입력 | Input `1654:42409`, Mobile MD, Empty/Filled/Editing + Label/Message 상태 | `field > 입력/텍스트/lead > 텍스트`, `라벨`, `안내 메세지` |
| 비밀번호 입력 | Input Mobile MD + `Password Icon=On` | 위와 동일, eye icon은 정본 내부 사용 |
| 버튼 | Button `1654:39663`, Mobile LG Primary/Secondary enabled/disabled | `버튼`; 화면 폭에 맞게 resize 후 내부 FILL 확인 |
| 이메일 도메인 trigger | Select Box `1654:44485`, Mobile MD Default/Filled | `trigger > 선택` |
| 바텀시트 | Bottom Sheet `1654:49290`, Single/Dual | title, options, footer button |
| 바텀시트 옵션 | Bottom Sheet Option `1654:49152`, Text Default/Selected | `항목` |
| 모바일 모달 | 검증된 local Mobile Modal `1546:17971`, Single `1610:6729`, Dual `1611:6731` | title/message/footer 버튼; long message HEIGHT/HUG |
| 아이콘 | 허용 V2.2 remote | Back `7190e284…`, Close `2a1abbd…/54469d54…`, Check `5ab251e0…`, More `e1ac97aa…` |

## 확정 문구 반영

| 화면 | 원본 | 빌드 정본 |
|---|---|---|
| 비밀번호 입력 | `영문, 숫자, 특수문자를 조합하여 8자 이상 입력해 주세요.` | `영문, 숫자, 특수문자를 조합하여 8~15자로 입력해 주세요.` |
| 비밀번호 조건 | `• 숫자 3자 이상 연속 사용(예 : 123, abc) 불가` | `• 3자 이상 연속된 숫자·문자 사용(예: 123, abc) 불가` |
| 이메일 입력·가려진 배경 | `직접입력` | `직접 입력` |
| 이메일 입력·가려진 배경 | `입력하신 이메일로 비밀번호를 찾을 수 있습니다.` | 삭제 |
| 약관 | 3개 모두 `(필수)` | 유지 |

가입회원 모달의 정확한 문구는 앱 원본을 따른다: `이미 회원으로 가입되어 있습니다.\n아이디 : abcdefg`, 닫기 X, `취소`, `확인`.

## 색·타이포 매핑

- 화면 루트 배경 → `color/bg/level-0` (2026-08-31 river 교정). `color/bg/level-1`은 화면 배경에 사용하지 않는다. NavBar 정본 내부 키보드 깊이 표현과 외부 인증 placeholder의 작은 action 표면은 이번 교정 대상이 아니다.
- 화면 제목 → `color/text/title/primary`
- 입력 라벨·본문값 → `color/text/body/secondary`
- 설명·헬퍼·안내·불릿 → `color/text/body/tertiary`
- placeholder → `color/text/state/placeholder`
- disabled → `color/text/state/disabled`
- accent/link → `color/text/state/accent`
- error → `color/text/state/caution`
- 앱 아이콘 placeholder → `color/bg/level-3`, 80×80, radius 20; 내부 라벨 → `color/text/body/tertiary`
- 모든 화면 저작 색은 Variable 바인딩, 모든 화면 저작 텍스트는 Pretendard 정본 TextStyle 바인딩.

## Fast-safe pilot

- base: `MWEB/SIGNUP/1 · 약관 전체 동의`
- editing: `MWEB/SIGNUP/4 · 비밀번호 입력 중 (키보드)`
- overlay/modal: `MWEB/SIGNUP/2a1 · 가입 회원 안내 (모달)`
- overlay/bottom-sheet + 위험 variant: `MWEB/SIGNUP/2b1 · 기존 아이디 선택 (바텀시트)`
- error archetype은 원본 11장에 없음.

pilot PASS 후 나머지 6장 신규 화면을 같은 manifest/spec으로 일괄 생성한다. placeholder 1장은 기존 결과를 재사용한다.

## 허용편차 선언서

1. 원본의 숨겨진 앱바 제목은 새 정본 `Standard / No Title`을 사용해 텍스트 노드 자체를 두지 않는다.
2. 비표준 글자 크기는 가장 가까운 Pretendard 정본 TextStyle로 수렴한다.
3. 원본 raw 색은 동일 역할의 Semantic Variable로 수렴한다.
4. 외부 본인인증 화면은 river 승인 intent-spec의 placeholder 표현을 그대로 유지한다.
5. 약관 상세는 현재 Figma 캡처에 존재하는 제1조·제2조까지만 재현하며 제3조 이후를 지어내지 않는다.
6. 기존 아이디 바텀시트는 화면 아래에 붙여 Dual 정본의 360×378·content gap 24·보이는 header와 Footer Dual을 유지한다. 설명문이 옵션 앞에 필요한 원본 구조는 정본 내부 목록만 숨기고, 설명문과 정본 옵션 4개를 header와 footer 사이의 별도 확장 프레임으로 조합한다. 정본 header와 footer를 숨기거나 대체하지 않는다(2026-08-31 river 승인 원칙과 정본 실측 반영).
7. 비밀번호 입력 원본은 확인 Input의 라벨만 노출하고 field는 CTA가 47px, OS 키보드가 3px 가리는 상태다. target도 정본 Input·Button을 유지한 채 이 레이어 순서와 의도적 가림을 재현한다. 버튼은 정본 규격 320×48로 수렴한다(2026-08-31 원본 실측).
8. Mobile Header는 `Type 6종 × Platform App/Web` 정본으로 보완했다. 모바일 웹 화면은 부모 Header에서 `Platform=Web` 변형을 선택하며 내부 StatusBar를 직접 교체하거나 늘리지 않는다. App 6종은 기존 ID와 99px 높이를 보존하고 Web 6종은 주소창을 포함한 149px 높이를 사용한다(2026-08-31 독립 검증·Gate PASS).
9. Pattern Section `1744:1782` 자체는 fill 없이 투명하게 유지한다. 각 360×780 화면 루트가 `color/bg/level-0` 배경을 소유한다.
10. `2b1`·`4a1`·`5a1`의 레이어는 기본 콘텐츠 → Dim → NavBar → Bottom Sheet/Modal 순서다. NavBar는 Dim에 가려지지 않고 overlay panel보다 뒤에 있어야 한다. 기본 화면과의 콘텐츠 동일성은 child index를 제외해 비교하고, stacking은 별도 invariant로 검사한다.

## 결정 필요 (HD) — 해소

### HD-1 — Bottom Sheet Option `Type=Text, State=Disabled` ✅ 해소

기존 아이디 목록 마지막 행 `s1secom4(이미 사용중인 아이디)`는 단순 텍스트형 비활성 옵션이다. 현재 로컬 정본에는 `Text Default/Selected`와 `List Default/Disabled`만 있고 `Text Disabled`가 없다. `List Disabled`는 360×65와 아바타·서브텍스트 구조라 원본 대체가 불가능하다.

- 권장: Bottom Sheet Option 정본에 `Type=Text, State=Disabled` 1종을 figma-library-build로 신설한 뒤 screen-rebuild 재개.
- 대안: 원본과 다른 `List Disabled` 사용(비추천).

2026-08-26 river 승인 후 정본·설치기·Figma에 추가했다.

- Figma 정본 variant: `1839:1782`
- 세트: Bottom Sheet Option `1654:49152` (8→9종)
- 구조: 360×48, 아이콘 없음, `color/text/state/disabled`
- 독립 검증: ❌ 0 · ❓ 0 · Gate 13 갱신 후 전체 Gate PASS

따라서 pilot의 `2b1` 빌드 blocker는 해소됐다.
