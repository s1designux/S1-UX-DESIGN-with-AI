# 3-build · 검수 화면 연결 + 안내 화면 mount (login-gnb · footer · ci)

- 작업자: 🤖 guide-builder
- 일자: 2026-10-02
- 배포본: ui-library dist 0.19.0 (세 부품 모두 status candidate → 검수 화면 「검수 대기」, 안내 화면 뱃지 「검증 대기」)

## 바꾼 파일

| 파일 | 내용 |
|---|---|
| `pages/ui-review.html` | 검수 섹션 27 Login GNB · 28 Footer · 29 CI 추가(Light·Dark 두 패널). 배치 전용 CSS 몇 줄. 표본 마크업은 **dist `examples/{id}.html` 을 fetch 해 요소를 자리마다 복제**한다 — 회사 정본 문구(풋터)와 에스원 로고 path 를 페이지에 사본으로 두지 않는다. 예시를 못 읽으면 세 칸만 안내문으로 비우고 다른 섹션은 계속 그린다 |
| `assets/js/ui-library-guide.js` | `componentConfig` 3건 · `loginGnbStateMatrix` · `footerStateMatrix` · `ciStateMatrix` · `stateMatrix(id, html)` 분기(세 부품만 dist 예제 HTML 을 받아 복제) · footer 견본 링크 `href="#"` 튕김 방지 · `guideComponents` 에 3건 추가 |
| `assets/css/ui-library-guide.css` | 배치 전용 5규칙(`.uilg-bar-cell` · `.uilg-wide-frame` 1920 · `.uilg-footer-mobile-box` 360 · `.uilg-ci-action` · `.comp-state-cell.uilg-ci-stage` bg/level-2) |
| `pages/components.html` | §A mount 3개 + `data-cov-platform="pc,mobile"`(footer) · `data-cov-brand="에스원,삼성"` `data-cov-color="white,blue,dark"`(ci) · login-gnb 는 축이 없어 선언 없음(Gate 19 요구 없음). Footer 내비 `data-platforms` 를 `pc` → `pc mobile` 로(정본에 Mobile 변형이 있음). **세 내비 버튼 `disabled` 유지**(6-promotion river 승인 후 해제) — 막는 게이트 없음 |
| `data/component-element-stubs.json` | 옛 토큰표 3건(login-gnb·ci·footer) 제거 + `_exposeNote` 에 이관 사유 1줄 → `npm run stubs:gen` 으로 GEN:COMPONENT-STUBS 구간 재생성(손편집 아님, Gate 9d 통과). 옛 섹션 id 가 같은 id 의 새 mount 와 겹치지 않게 하려면 이 경로뿐이었다 |

수정하지 않음: `ui-library/src`·`dist` · `registry/components/*.json` · `workflow-state.json`.

## 검수 화면 구성

- **Login GNB** — 단일 변형. 「검수 칸 폭」(반응형, 좌우 여백 최소 24) + 「실제 1920 폭」(틀 1920px, 칸 안 가로 스크롤 — 좌우 320 정본 그대로 실측).
- **Footer** — PC: 칸 폭 + 1920 폭. Mobile: 360 상자 안. 각 패널 Light·Dark.
- **CI** — 브랜드 2 × 색 3 = 6칸 전수, 칸 바탕 bg/level-2(= 정본 진열면 gray/50). 이 페이지에 어두운 바탕 표본 관례가 없어 **White 는 Dark 패널에서 확인**하도록 설명문·패널 머리줄에 적었다.

## 실제 렌더 확인 (http, 캐시 없는 서버)

- `pages/ui-review.html`: 페이지 전체 중복 id **0** (384개). 표본 수 login-gnb 4 · footer 6 · ci 12. 세 섹션 상태 `candidate` → 「검수 대기」 탭.
  - Login GNB 높이 56. 1920 틀 안 바·풋터 좌우 패딩 320px.
  - CI: 에스원 78.75×30, 삼성 134×36. 에스원 색 Light white `#FFF` · blue `rgb(0,64,151)` · dark `rgb(85,87,95)` / Dark 에서 dark 만 `rgb(138,140,150)` 로 바뀜. 삼성 이미지 3종 로드.
- `pages/components.html`: 중복 id 0, 옛 토큰표 pane 잔존 0. 세 섹션 모두 헤더 뱃지 `검증 대기|Core|v0.1.0|실제 dist 사용`, Action 상자 2개(PC·Mobile), 코드탭·규칙 블록 생성. Gate 23 은 세 부품을 **미계측**으로 보고 — Action 존재는 위 렌더로 직접 확인했다.
- 스크린샷: `screens/review-pc-light.png` · `review-pc-dark.png` (1440 폭) · `review-mobile-light.png` · `review-mobile-dark.png` (375 폭 — headless 크롬 최소 폭 때문에 375px iframe 으로 감싸 찍음. 브라우저에서 375 실측 시 가로 넘침 0).

## 검사기 결과

| 명령 | 종료코드 |
|---|---|
| `npm run ui:guide:render` | 0 (32종 × PC·Mobile) |
| `npm run ui:liveness` | 0 (안내 107/107 · 검수 370/370 — 세 부품은 런타임 없음) |
| `npm run ui:contract` | 0 |
| `npm run ui:test` | 0 |
| `npm run components:variantcov` | 0 (74/74, 신규 공백 0 — ci.brand·ci.color·footer.platform 해소) |
| `npm run components:presentation` | 0 (세 부품 미계측 — 렌더로 대체 확인) |
| `npm run gate:check` | 0 (경고 31, error 0) |

## 검증자에게 넘기는 관찰 (판정하지 않음)

1. **Footer PC 를 아주 좁은 칸(약 300px)에 넣으면** 링크 줄이 줄바꿈 금지라 내용이 칸을 넘고, 오른쪽 로고가 회사 정보 글자에 붙어 잘려 보인다(모바일 폭 검수 화면에서 관찰). PC 변형을 모바일 폭에 둔 비계약 상황이며 dist CSS 에는 내용–로고 사이 최소 간격 선언이 없다.
2. **CI Samsung Dark 는 Dark 패널 바탕에서 거의 안 보인다**(이미지가 어두운 글자). 정본에 다크 전용 변형이 없다는 선언과 일치하나 river 가 볼 지점이다. 에스원 White 는 Light 바탕에서 흐리다(위에 적은 대로).
3. Gate 34(uistate 승인 기록)는 이번 gate:check 에서 error 로 나오지 않았다 — 기록 여부는 조율자 확인 사항.
