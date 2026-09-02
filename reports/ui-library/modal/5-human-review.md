# 5-human-review — Modal

- 작업: modal · 날짜: 2026-09-02 · 검수자: river
- 대상: `pages/components.html` → Overlay → **Modal**(PC·Mobile) · `pages/ui-review.html` 검수본 12번(Light·Dark × PC·Mobile 4벌)
- 배포본: `ui-library/dist` v0.1.0 (안내 화면·검수 화면·개발 코드가 모두 같은 dist 소비)

## river 확인 항목

| # | 질문 | 결과 |
|---|---|---|
| 1 | 푸터 버튼이 승인된 Button 배포본 재활용인가 | ✅ 확인 — 모달 CSS 에 버튼 규칙 0줄, 코어 조립만 |
| 2 | 닫기 아이콘이 라이브러리 원본인가 | ❌ 아니었음 → **지적 반영해 V2.2 실물 벡터로 교체**(4-verification §K). 재발 방지 3겹 신설 승인 |
| 3 | 개발 코드가 PC 화면엔 PC, 모바일 화면엔 모바일만 표출되는가 | ✅ 확인 — HTML 은 플랫폼별로 갈림(PC=닫기 있음·xxsm / Mobile=닫기 없음·lg). **CSS·JS 는 배포 파일이 한 벌이라 공용으로 유지**하기로 river 확정 |

## 결과

**승인 (river, 2026-09-02).** "이대로 유지하면 돼. 모달은 승인처리할게."

CSS·JS 공용 표출은 이번 결정으로 확정이며, 갈라 보여주려면 배포 파일 자체를 플랫폼별로 나눠야 해 13개 컴포넌트 전체에 영향이 가는 별도 결정 사항으로 남긴다(이번 범위 밖).
