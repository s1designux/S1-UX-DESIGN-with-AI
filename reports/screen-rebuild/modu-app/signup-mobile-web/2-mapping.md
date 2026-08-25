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
| 제목 없는 앱바 | 정본 인스턴스 | Mobile Header `1760:7247`, `Type=Standard / No Title` `1760:7217` |
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

- 화면 제목 → `color/text/title/primary`
- 입력 라벨·본문값 → `color/text/body/secondary`
- 설명·헬퍼·안내·불릿 → `color/text/body/tertiary`
- placeholder → `color/text/state/placeholder`
- disabled → `color/text/state/disabled`
- accent/link → `color/text/state/accent`
- error → `color/text/state/caution`
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

## 결정 필요 (HD)

### HD-1 — Bottom Sheet Option `Type=Text, State=Disabled`

기존 아이디 목록 마지막 행 `s1secom4(이미 사용중인 아이디)`는 단순 텍스트형 비활성 옵션이다. 현재 로컬 정본에는 `Text Default/Selected`와 `List Default/Disabled`만 있고 `Text Disabled`가 없다. `List Disabled`는 360×65와 아바타·서브텍스트 구조라 원본 대체가 불가능하다.

- 권장: Bottom Sheet Option 정본에 `Type=Text, State=Disabled` 1종을 figma-library-build로 신설한 뒤 screen-rebuild 재개.
- 대안: 원본과 다른 `List Disabled` 사용(비추천).

이 결정 전에는 pilot 중 `2b1` 빌드를 시작하지 않는다.
