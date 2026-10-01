# 디자인가이드 업데이트 공지 (주간)

동료에게 공유하는 한 장짜리 업데이트 공지. **매주 금요일 오전 9시** 자동 예약 작업이 그 주 변경으로 초안을 만들고,
**새 아티팩트 링크**를 river 에게 준다. 공유는 river 가 확인한 뒤 직접 한다(자동 발송 없음).

## 폴더
| 무엇 | 위치 |
|---|---|
| 공통 틀(글꼴·색·레이아웃·눌러보기 동작) | `shell.html` |
| 만들기 | `python3 build.py issues/<금요일 날짜>` → `issues/<날짜>/notice.html` |
| 매주 호의 원고 | `issues/<날짜>/issue.html` (뼈대: `issues/_example/issue.html`) |
| 그 주에 모은 변경 메모 | `issues/<날짜>/sources.md` |
| 자동 예약 작업이 따르는 지시문 | `WEEKLY-PROMPT.md` |

`notice.html` 은 글꼴까지 넣은 결과물이라 저장소에 올리지 않는다(원고에서 언제든 다시 만든다).

## 원고 규칙
- 부품은 `data-s1-component="…"` 로 쓰면 실제 배포본 CSS 가 자동으로 들어간다. 손으로 흉내 낸 부품 금지.
- 색은 토큰(`var(--color-…)`)만. 본문에 HEX 가 있으면 만들기가 멈춘다.
- 판 하나만 라이트·다크를 바꾸려면 Multi Toggle 에 `data-theme-target="판id"`.
- 글은 쉬운 말로, 사실만. river 발화를 인용할 때는 실제로 한 말 그대로.

## 지난 호 (기록)
| 호 | 기간 | 링크 | 상태 |
|---|---|---|---|
| 0 | 2026.09.29 – 09.30 · LNB·접힘카드·구분선·뱃지 | https://claude.ai/artifact/GjqE8TctDpdiAaZo8Ehdha | 공유됨 (원고: `reports/ui-library/promoted-parts-4/report/`) |
