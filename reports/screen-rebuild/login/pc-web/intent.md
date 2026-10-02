# PC 로그인 패턴 — 의도 선언서 (baseline = intent-spec)

> 상태: **river 승인 2026-10-02** — 「응 7장으로 진행하고 문구는 레거시 그대로 둬.」
> 정답지: ① 개발화면 검수 포털 로그인 화면 `~/dev-screen-qa/mvp0/auth.py` `로그인화면()`·CSS (river 지시 2026-09-28·30 반영본)
> ② 오류 상태 규칙 = `registry/patterns/mobile-login/content-rules.md` (같은 종류 패턴의 규칙)
> ③ 상태 목록 참고 = 통근버스 레거시 PC 로그인 (`0-intent-sources.md` C) — 문구만 verbatim 인용, 수치·부품은 쓰지 않는다
> 옛 결과(섹션 268:368, 외부 라이브러리)는 이미 삭제되어 페이지가 비어 있다. 이번은 새로 만든다.

## 배치

- 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 `Patterns PC`(80:16697) · 새 Section `Pattern / PC Login`
- 화면 1920×1080, 바탕 `color/bg/level-0`. 화면은 흐름 코드 순서로 가로 배치.

## 화면 공통 뼈대 (포털 그대로)

| 자리 | 정본 부품 | 값 |
|---|---|---|
| 맨 위 줄 | LoginGNB (2614:73971) | `[서비스명]` · 한국어 |
| 브라우저 창틀 | WebTabBar (2614:74012) | **넣는다**(변경 2 — 처음엔 포털처럼 뺐다가 river 지시로 넣음) |
| 가운데 상자 | 프레임 | 폭 300, 위 여백 123 (river 지시 2026-09-28) |
| CI | CI Brand=에스원 Color=Blue | 상자 맨 위 가운데, 아래 34 (변경 1) |
| 아이디 칸 | Input Size=MD Break=PC | 폭 300(FILL), placeholder `아이디를 입력해 주세요.` |
| 비밀번호 칸 | Input Size=MD Break=PC, Password Icon=on | 칸 사이 10 (변경 1), placeholder `비밀번호를 입력해 주세요.` |
| 아이디 저장 | Checkbox + 글자 `아이디 저장` | 위 8 · 아래 32 (변경 1) |
| 로그인 버튼 | Button Variant=Primary Size=MD Break=PC | 폭 300(FILL), `로그인` |
| 찾기 링크 | — | **두지 않는다**(포털 river 확정 2026-09-28) |
| 맨 아래 띠 | Footer Platform=PC (2614:74065) | 정본 그대로 |

## 화면 목록 (7장)

| 이름 | 상태 | 아이디 칸 | 비밀번호 칸 | 버튼 |
|---|---|---|---|---|
| `PC/LOGIN/1 · 최초 진입` | 빈칸 | Default | Default | Disabled |
| `PC/LOGIN/2 · 아이디 입력 중` | 아이디 편집 | Focus `s1desig` | Default | Disabled |
| `PC/LOGIN/3 · 비밀번호 입력 중` | 비밀번호 편집 | Filled `s1design` | Focus `••••••••` | Default |
| `PC/LOGIN/4 · 입력 완료·로그인 활성` | 제출 직전 | Filled `s1design` | Filled `••••••••` | Default |
| `PC/LOGIN/4a1 · 계정 불일치 오류` | 서버 판정 실패 1~4회 | Error `s1design` | Error + 문구 A | Default |
| `PC/LOGIN/4a2 · 5회 실패 잠금` | 5회 실패 | Error `s1design` | Error + 문구 B | Default |
| `PC/LOGIN/4a3 · 사용 중지된 계정` | 막힌 계정 | Error `s1design` | Error + 문구 C | Default |

- 문구 A (모바일 로그인과 같은 문장): `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)`
- 문구 B (레거시 verbatim): `아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(최대 5분)` — river 확정 2026-10-02(레거시 그대로)
- 문구 C (포털 verbatim): `사용이 중지된 계정입니다. 관리자에게 문의해 주세요.`
- 오류 표시 방식: 두 칸 모두 오류 테두리, 문구는 비밀번호 칸 아래 한 번 (mobile-login content-rules). 포털의 '상자 위 빨간 박스'는 패턴에서는 쓰지 않는다.

## 넣지 않는 것 (패턴 범위 밖)

- 비밀번호 보기/숨기기 화면 — 정본 Input 에 보기/숨기기 상태 축이 없다(아이콘 켜기만 있음).
- 언어 목록 펼친 화면 — LoginGNB 에 펼친 상태가 없다.
- 약관 팝업 — 포털 화면에 없고, 레거시 규격(500×700·확인 버튼 없음)이 정본 Modal 과 맞지 않다.
- 회원가입·아이디/비밀번호 찾기 흐름.

## 변경 1 — 간격 (river 2026-10-02)

- 지시: 「창틀은 빼고 간격만 기준대로 바꿔줘」
- 기준 자료: Figma `fIHTlq3ZAZXhHZGNnADD21` 2445:13768 (고객 계정 UX Guide) — 대조 `ref/compare.md`·`ref/compare.html`
- 로고→아이디 칸 48→34 · 칸 사이 8→10 · 아이디 저장→버튼 24→32. 기준에는 아이디 저장이 없어 '마지막 입력 요소→버튼 32'로 적용하고, 비밀번호 칸→아이디 저장 8 은 유지한다.
- 바꾸지 않는 것: 브라우저 창틀(넣지 않음) · 입력칸/버튼 크기 300×44(PC 정본 MD) · 맨 위 줄→로고 123

## 변경 2 — 브라우저 창틀 넣기 (river 2026-10-02)

- 지시: 「1920 1080인데 상단 웹프레임이 없어서 이상해보이는구나- 프레임을 그냥 넣자. 디자인가이드에 웹탭바를 쓰면 될듯」
- 7장 모두 맨 위에 정본 WebTabBar(2614:74012, 1920×101) 인스턴스 → 그 아래 LoginGNB → 본문 → Footer. 화면 1920×1080 유지, 본문이 101 줄어든다(맨 위 줄→로고 123 은 그대로).
- 위 '화면 공통 뼈대'의 「브라우저 창틀 — 넣지 않는다」 행은 이 변경으로 대체된다.

## 끝난 뒤

검증 통과 → `registry/patterns/pc-login/` 등록 → 설치기 `pattern-data.ts` 에 캡처본 `PC_LOGIN` 추가.
