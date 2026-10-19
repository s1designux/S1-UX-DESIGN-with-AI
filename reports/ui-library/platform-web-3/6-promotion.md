# 6-promotion — platform-web-3 (footer · ci · login-gnb) (2026-10-19)

## 승인
- river 2026-10-19: "세 부품 모두 승인할게, 합쳐줘"
- 근거: 독립 검증 `4-verification-F.md` (FAIL 0 · HOLD 0)
- 삼성 로고는 Figma PNG 그대로 둔다(공식 SVG 교체는 river 보류).

## 버전
ui-library 0.19.3 → 0.19.4

## 반영 파일
- `ui-library/src/components/{footer,ci,login-gnb}/manifest.json` status approved (dist 재생성)
- `registry/governance/ui-library-migration.json` 세 항목 approved · `registry/components/{footer,ci,login-gnb}.json` webDistribution.status approved
- `pages/components.html` 메뉴 버튼 3개(CI Logo · Footer · Login GNB) disabled 해제 (#앵커 열기 목록에는 이미 있음)
- 재생성: ui:bump · design:md:write · components:guide-model:write · ui:zip · devpanel:gen · board:refresh(정본 사실표) · install-prompt/platform-updates(ui:bump 연동)
- React(ci·footer·login-gnb .jsx) · Vue(Ci·Footer·LoginGnb .vue) 전달본 신규 포함
- 곁수정: `ui-library/scripts/react-parity-check.mjs` — React 쪽 속성 이름도 소문자로 맞춰 비교(SVG viewBox 대소문자만 달라 승격 후 거짓 실패). 예제 쪽은 이미 소문자였음.

## 종료 코드
ui:contract 0 · ui:test 0 · ui:build:check 0 · ui:test:check 0 · ui:version 0 · ui:guide:render 0 · ui:liveness 0 · harness:audit 0 · gate:check 0 (경고 33)

## 렌더
`screens/promotion-components.png` — http 로 열어 메뉴 버튼 3개 활성, Footer 섹션 표시 확인(CI·Login GNB 는 ui:guide:render 로 확인).
