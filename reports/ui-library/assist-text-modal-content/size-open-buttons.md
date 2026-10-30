# Modal Content — 크기별 열기 버튼 (2026-10-12)

river 요청: "모달의 경우 사이즈별로 볼 수 있어야해"

## 변경 (안내·검수 화면만 — ui-library/src·dist 무변경)

| 파일 | 변경 |
|---|---|
| `assets/js/ui-library-guide.js` `modalContentStateMatrix()` | Action 영역의 단일 "콘텐츠 모달 열기"(LG) → 크기마다 1개씩 `MD 열기 (520)` · `LG 열기 (1000)` · `XL 열기 (1200)`. 각 버튼은 자기 모달(dual footer)과 한 묶음 `.uilg-modal-content-action` 안에 있어 기존 배선(약 3740행, 묶음마다 root·trigger 짝)이 그대로 3개를 각각 배선. 제목 id 는 `modalContentMarkup` 카운터로 고유. 안내 문구에 크기 고르기 추가 |
| `assets/css/ui-library-guide.css` | `.uilg-modal-content-actions` (flex·wrap·gap `--spacing-8`) 추가 |
| `pages/ui-review.html` 20. Modal Content | 「실제로 열어보기」가 MD 하나만 열던 것 → 같은 방식으로 MD·LG·XL 3개(테마 칸 2개 × 3 = 6개). 버튼·모달을 `.review-modal-content-opener` 로 묶어 기존 `root.parentElement` 짝찾기가 자기 버튼을 잡음. 설명 문구 갱신 |
| 확인 계열 `modal` | 정본에 크기 축 없음(PC 360 · Mobile 300) — 손대지 않음 |

## 실측 (http://127.0.0.1:8731, 뷰포트 1440×900, 브라우저에서 실제 클릭)

### components.html — Modal Content
| 버튼 | 열린 크기 | 패널 폭×높이 | left | 동시 열림 | 초점 패널 안 | 닫기 방법 | 닫힘 | 초점 복귀 | 스크롤 잠금→해제 |
|---|---|---|---|---|---|---|---|---|---|
| MD 열기 (520) | md | 520×336 | 460 | 1 | ✅ | Esc | ✅ | ✅ | hidden→visible |
| LG 열기 (1000) | lg | 1000×587 | 220 | 1 | ✅ | X 버튼 | ✅ | ✅ | hidden→visible |
| XL 열기 (1200) | xl | 1200×587 | 120 | 1 | ✅ | 푸터 확인 | ✅ | ✅ | hidden→visible |

중복 id 0건 · body 바로 아래 modal-content 루트 3개(md/lg/xl, dual) · aria-labelledby 각각 `guide-modal-content-title-1/2/3`.

### ui-review.html — 20. Modal Content
라이트·다크 각 MD/LG/XL = 6개 버튼 모두: 폭 520/1000/1200, 열린 모달 테마 = 칸 테마, 동시 열림 1, Esc 닫힘, 초점 복귀 ✅. 중복 id 0건.

## 검사기 (exit code)
| 명령 | exit |
|---|---|
| npm run ui:guide:render | 0 |
| npm run ui:liveness | 0 |
| npm run ui:contract | 0 |
| npm run ui:test | 0 |
| npm run components:presentation | 0 |
| npm run gate:check | 0 (PASSED, 경고 31 — 기존) |

## 스크린샷 (http 렌더, 브라우저 창 캡처)
- `reports/ui-library/assist-text-modal-content/screens/size-open-buttons-guide.jpg` — 안내 화면 Action 3버튼
- `reports/ui-library/assist-text-modal-content/screens/size-open-buttons-guide-xl-open.jpg` — XL 열림
- `reports/ui-library/assist-text-modal-content/screens/size-open-buttons-review.jpg` — 검수 화면 라이트/다크 3버튼

참고: `npm run shot` 은 components.html 해시로 섹션을 고르지 못해(첫 섹션 Button 이 찍힘) 브라우저 창 캡처로 대체.

## 미검증
- 독립 검증(component-verifier) 미실행 — ⭐ 자가 확인.
