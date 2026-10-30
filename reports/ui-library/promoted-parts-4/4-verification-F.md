# 4-verification-F — promoted-parts-4 (LNB · Expandable Card · Divider · Data Tag)

검증자: 🤖 component-verifier (시나리오 F). 검증자는 파일을 고치지 않았다. 기계검사(ui:state · ui:contract · ui:version · ui:build:check · ui:test:check · ui:icons · ui:icons:origin · ui:guide:render)는 매 회차 재실행 종료코드 0.

## 회차
| 날짜 | 회차 | 결과 | 주요 내용 |
|---|---|---|---|
| 2026-10-02 | 1차 전수 | FAIL | A-1 LNB 준비 중 메뉴가 Enter 로 열림 · A-2 LNB 키보드 Enter 시 포커스 유실 · A-3 펼침 카드 같은 문제 · A-4 LNB manifest 낡은 서술 · HOLD C-1 테두리 1px · C-2 뱃지 높이 · C-3 구분선 data-inset · C-4 접힘 중 aria-expanded |
| 2026-10-02 | 델타 | A-4 잔여 문구 2 | A-1~A-3·C-4 해소, 번들=개별 설치 바이트 동일 |
| 2026-10-19 | 전수(정본 지문 D-13 이후) | FAIL A-5 | C-1 해소(D-12 여백 보정 수치 일치) · A-5 가이드 Data Tag 상태표 Gray 열 누락 |
| 2026-10-19 | 델타 | FAIL A-6·A-7 | A-5 해소 · C-3 반영(D-15) 변형 8칸 정확 일치 · A-6 배포 README data-inset 문구 · A-7 presentation-policy divider note |
| 2026-10-19 | 델타 | A-7 잔여 | A-6 해소 · extraAxes(divider tone · data-tag gray) |
| 2026-10-19 | 델타 | **PASS — FAIL 0 · HOLD 0** | complete 가능 |

## 최종 실측(2026-10-19)
| 항목 | 정본 | 웹 |
|---|---|---|
| 펼침 카드 닫힘/열림 높이 | 163.6 / 324 | 163.58 / 323.95 |
| 펼침 카드 제목 x/y · 화살표 간격 | 20/16 · 16 | 20/16 · 16 |
| LNB MD/LG 내용 폭 | 216 / 256 | 216 / 256 |
| LNB 접힘 내용 · 접기 단추 중심 | 64 · 40 | 64 · 40 |
| 뱃지 가로(12칸) | 8 + 글자 + 8 | 36.74 (글자 시작 8) |
| 뱃지 높이 | 27.6 | 26 (D-11 의도적 차이) |
| 구분선 변형 | Axis×Weight×Tone 8 | 8, data-inset 없음 |

색은 Light·Dark 모두 vars-data 값과 일치. 키보드·ARIA·다중 인스턴스·destroy/re-init 회귀 없음.

## 확인 못 한 범위
Figma 캔버스 실물 대조(MCP 미연결 — 정본 코드 값과 대조) · 실제 화면 낭독기 · Mobile 375 재렌더(폭 의존 변경 없음).
