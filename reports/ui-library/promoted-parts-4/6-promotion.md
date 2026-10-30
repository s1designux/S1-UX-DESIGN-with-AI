# 6-promotion — promoted-parts-4 (2026-10-19)

## 승인
- river 2026-10-02: LNB "LNB 상태를 승인으로 바꾸고, 저장해서 원본 기본 버전(main)에 합친 뒤 올려줘" (D-7) · 나머지 3종 "나머지 3종도 승인으로 바꿔줘" (D-9)
- 근거: 독립 검증(시나리오 F, component-verifier) — 2026-10-02 1차 FAIL(키보드 결함 4) → 수정 · 2026-10-19 전수 재검증 + 델타 3회 — 최종 FAIL 0 · HOLD 0

## 결정
| 번호 | 내용 | 근거 |
|---|---|---|
| D-11 | 뱃지 높이 웹 26 · Figma 27.6 의도적 차이 유지 | river "버튼 내 텍스트가 웹에서 이상하게 나와서 일부러 웹과 피그마를 다르게 제작함." |
| D-12 | 테두리 — CSS border 유지 + 안쪽 여백을 테두리 두께만큼 줄여 정본 위치·크기 일치 | river "응 그렇게 맞춰줘" |
| D-15 | 구분선 data-inset 축 제거 — 들여쓰기는 담는 목록 여백 | river "개발 기준으로 맞는 쪽으로 정해줘" (위임) |

## 반영
| 자리 | 내용 |
|---|---|
| 배포본 | 0.26.0 — LNB·Expandable Card·Data Tag 여백 보정, Divider data-inset 제거(minor), LNB·카드 키보드 결함 수정(0.18.4) |
| 안내 페이지 | `pages/components.html` Data Tag 상태표 Gray 열(12칸), Divider Action 목록 래퍼 여백 |
| 안내 장부 | `component-presentation-policy.json` divider note·extraAxes(tone) · data-tag extraAxes(gray) |
| 전달본 | 배포 묶음 README 의 divider 설명 정정(`scripts/build-ui-package-zip.js`) · zip 재생성 |

## 렌더
`verify-f/consumer-bundle-pc-tall-light.png` · `verify-f/consumer-bundle-pc-tall-dark.png` — 번들 설치와 개별 설치가 Light·Dark 모두 바이트 동일(검증자 실측).
