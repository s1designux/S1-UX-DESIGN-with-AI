# PC 로그인 — 2단계 매핑 (baseline intent-spec)

> 기준: `intent.md`(river 승인 2026-10-02). 부품 정보: `0-intent-sources.md` §D. 레거시 부품·인스턴스는 **쓰지 않는다**(문구만 인용).

## 배치

- 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 80:16697(빈 페이지) · Section `Pattern / PC Login`, 섹션 바탕 `color/bg/level-3`(모바일 로그인과 같은 규칙)
- 화면 1920×1080 FIXED, 바탕 `color/bg/level-0`, clip. 섹션 안 좌표: 기본 흐름 1·2·3·4 를 첫 줄(y=100)에 x=80 부터 간격 200, 분기 4a1·4a2·4a3 을 둘째 줄(y=1380)에 같은 간격.
- Section 자식 순서 = 1, 2, 3, 4, 4a1, 4a2, 4a3.

## 화면 뼈대 (모든 화면 동일 — 공통 코드 1벌로)

| # | 요소 | 분류 | 정본 | 값 |
|---|---|---|---|---|
| 1 | 화면 프레임 | 토큰 프레임 | — | VERTICAL 오토레이아웃, 1920×1080 FIXED, fill `color/bg/level-0` |
| 2 | 맨 위 줄 | 정본 인스턴스 | LoginGNB (2614:73971) | FILL 가로, 문구 기본값(`[서비스명]`·`한국어`) 그대로 |
| 3 | 본문 | 토큰 프레임 | — | VERTICAL, FILL 가로·세로 grow 1, 가로 가운데, 위 패딩 123, 투명 |
| 4 | 상자 | 토큰 프레임 | — | VERTICAL, 폭 300 FIXED, 높이 HUG, 투명 |
| 5 | CI | 정본 인스턴스 | CI Brand=에스원 Color=Blue | 상자 안 가운데 정렬, 아래 간격 48 |
| 6 | 아이디 칸 | 정본 인스턴스 | Input Size=MD Break=PC | FILL(폭 300), 안쪽 field 도 FILL. placeholder `아이디를 입력해 주세요.` |
| 7 | 비밀번호 칸 | 정본 인스턴스 | Input Size=MD Break=PC, Password Icon=true | 6 과의 간격 8. placeholder `비밀번호를 입력해 주세요.` |
| 8 | 아이디 저장 줄 | 토큰 프레임 | Checkbox State=Default + 텍스트 | HORIZONTAL, 위 8 · 아래 24, 박스–글자 간격 8, 글자 `아이디 저장`. 글자 스타일·색은 정본 Checkbox 라벨 규정(registry/components 의 checkbox 메타·가이드)을 따른다 — 근거를 못 찾으면 needs-decision |
| 9 | 로그인 버튼 | 정본 인스턴스 | Button Variant=Primary Size=MD Break=PC | FILL(폭 300), 문구 `로그인` |
| 10 | 맨 아래 띠 | 정본 인스턴스 | Footer Platform=PC (2614:74065) | FILL 가로, 문구 정본 그대로 |

넣지 않는 것: WebTabBar, 찾기 링크, 언어 펼침, 약관 팝업, 비밀번호 보기/숨기기.

## 화면별 차이 (screen-spec)

| 이름 | 아이디 Input | 비밀번호 Input | 버튼 State |
|---|---|---|---|
| `PC/LOGIN/1 · 최초 진입` | Default · placeholder | Default · placeholder | Disabled |
| `PC/LOGIN/2 · 아이디 입력 중` | Focus · `s1desig` | Default · placeholder | Disabled |
| `PC/LOGIN/3 · 비밀번호 입력 중` | Filled · `s1design` | Focus · `••••••••` | Default |
| `PC/LOGIN/4 · 입력 완료·로그인 활성` | Filled · `s1design` | Filled · `••••••••` | Default |
| `PC/LOGIN/4a1 · 계정 불일치 오류` | Error Message=Off · `s1design` | Error Message=On · `••••••••` · 문구 A | Default |
| `PC/LOGIN/4a2 · 5회 실패 잠금` | Error Message=Off · `s1design` | Error Message=On · `••••••••` · 문구 B | Default |
| `PC/LOGIN/4a3 · 사용 중지된 계정` | Error Message=Off · `s1design` | Error Message=On · `••••••••` · 문구 C | Default |

- 문구 A: `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)`
- 문구 B: `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(최대 5분)`
- 문구 C: `사용이 중지된 계정입니다. 관리자에게 문의해 주세요.`
- 문구 텍스트는 부품의 안내 문구 자리를 덮어쓴다. 두 줄 문구가 접히지 않게 문구 자리는 FILL 가로·HUG 세로.
- 입력값 문자는 모바일 로그인 패턴과 같은 값을 쓴다(`s1design`·`••••••••`).

## 허용편차 선언서

- 없음(intent-spec — 레거시 수치 대조 안 함). 칸·버튼 높이는 정본 MD(44) 그대로다.

## HD 목록

- 0건 (river 결정 완료 2026-10-02). 빌드 중 근거 없는 값이 나오면 needs-decision 으로 반환.
