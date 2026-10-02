# 6-promotion — list-row (2026-10-02)

## 승인
- river 2026-10-02: "승인할게, 사이트 메뉴랑 전달본에 넣어줘"
- 근거: 독립 검증(시나리오 F) 전수 + 델타 2회 — 최종 FAIL 0 · HOLD 0 (`4-verification-F.md`)
- 결정 D-6: 동의 줄 화살표 = 약관 열기 버튼 ("약관열기 버튼으로 가야함.")

## 반영
| 자리 | 내용 |
|---|---|
| 배포본 | `manifest.status` approved · dist 0.17.1 (list-row 0.4.0) |
| 이행 장부 | `ui-library-migration.json` list-row approved |
| 안내 페이지 | `pages/components.html#list-row` — Mobile Components › List › Expandable Card 다음 (모바일 전용) |
| 안내 장부 | `component-presentation-policy.json` list-row · `component-page-coverage.json` sectionFor · guide model public |
| 전달본 | HTML/CSS/JS zip · React(`list-row.jsx`) · Vue(`ListRow.vue`) · 개발자 다운로드 패널 |

## 들어가지 않은 것
- Kotlin Compose — 생성기(`ui-library/scripts/kotlin-components.mjs`)가 부품 16종만 손으로 뼈대를 갖는다. 최근 승인 부품(Divider·Expandable Card·Bottom Sheet Option 등)도 같은 상태.
- Swift · C++ — 토큰·버전만 싣는 전달본이라 부품이 없다.

## 렌더
`screens/guide-pc-light.png` · `guide-pc-dark.png` · `guide-mobile-390-light.png` · `guide-mobile-390-dark.png` — 21칸 줄 높이 68, 중복 id 0, 390 폭 페이지 가로 넘침 0.

## 곁수정
- `components.html` initFromHash `valid` 목록에 expandable-card·divider·data-tag 누락 → 추가(#앵커 직접 열기).
