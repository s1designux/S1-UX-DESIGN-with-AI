# PC Login 상태 목록

현재 패턴은 7개 대표 화면으로 구성된다. 화면은 모두 1920×1080 이고, 위에서부터 WebTabBar(창틀) → LoginGNB(맨 위 줄) → 본문(위 여백 123, 가운데에 `PC Login Box`) → Footer(PC) 순이다.

프레임 이름 체계는 `registry/governance/screen-naming-policy.json` 을 따른다. 화면을 가리키는 고정 식별자는 이름이 아니라 **Figma 노드 ID** 다.

## 기본 흐름

| 프레임 이름 | 아이디 칸 | 비밀번호 칸 | 로그인 버튼 | Figma |
|---|---|---|---|---|
| `PC/LOGIN/1 · 최초 진입` | Default · 안내 문구 | Default · 안내 문구 | Disabled | `2703:3` |
| `PC/LOGIN/2 · 아이디 입력 중` | Focus · `s1desig` | Default · 안내 문구 | Disabled | `2712:95` |
| `PC/LOGIN/3 · 비밀번호 입력 중` | Filled · `s1design` | Focus · `••••••••` | Default | `2712:164` |
| `PC/LOGIN/4 · 입력 완료·로그인 활성` | Filled · `s1design` | Filled · `••••••••` | Default | `2713:203` |

## 분기 — `4`(로그인 실행 · 서버 판정)에서 갈라진다

| 프레임 이름 | 아이디 칸 | 비밀번호 칸 | 로그인 버튼 | Figma |
|---|---|---|---|---|
| `PC/LOGIN/4a1 · 계정 불일치 오류` | Error · Message Off · `s1design` | Error · Message On · 문구 A | Default | `2706:49` |
| `PC/LOGIN/4a2 · 5회 실패 잠금` | Error · Message Off · `s1design` | Error · Message On · 문구 B | Default | `2713:264` |
| `PC/LOGIN/4a3 · 사용 중지된 계정` | Error · Message Off · `s1design` | Error · Message On · 문구 C | Default | `2713:319` |

문구 A·B·C 는 `copy.md`. 보조 링크 슬롯 `Links` 는 7장 모두 부품 기본 내용(회원가입 · 아이디 찾기 · 비밀번호 찾기) 그대로다.

## 패턴 전용 부품

| 이름 | 무엇 | Figma |
|---|---|---|
| `PC Login Box` | CI(에스원/Blue) → 34 → 입력칸 2개(사이 10, Input MD·PC, 폭 300) → 32 → 로그인 버튼(Primary MD PC) → 16 → 슬롯 `Links` | COMPONENT `2730:528` · Section `2730:527` |

디자인가이드 정본(설치기 컴포넌트 목록)에는 넣지 않은 **패턴 전용** 부품이다(river 결정 2026-10-02). 설치기 패턴 탭은 이 부품을 패턴 섹션 안에 먼저 만든 뒤 화면을 그린다.

## 제거된 상태

| 상태 | 제거 이유 | 제거 시점 |
|---|---|---|
| 아이디 저장 줄(체크박스 + 글자) | 보조 링크(회원가입·아이디 찾기·비밀번호 찾기)로 대체 | 2026-10-02 (intent 변경 3) |

## 패턴 범위 밖

- 비밀번호 보기/숨기기 화면 — 정본 Input 에 보기/숨기기 상태 축이 없다
- 언어 목록 펼친 화면 — LoginGNB 에 펼친 상태가 없다
- 약관 팝업 — 레거시 규격(500×700 · 확인 버튼 없음)이 정본 Modal 과 맞지 않다
- 회원가입 · 아이디/비밀번호 찾기 상세 흐름
