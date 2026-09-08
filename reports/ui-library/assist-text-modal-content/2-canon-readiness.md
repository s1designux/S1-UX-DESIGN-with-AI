# 2-canon-readiness — 제작 전 정본 준비

## needs-decision 0건

| 확인 항목 | 결과 |
|---|---|
| 새 색·새 토큰 필요 여부 | **0건.** 세 컴포넌트가 쓰는 토큰은 전부 정본에 이미 있다(신규 4색은 커밋 28be850 에서 이미 정본화·river 승인). |
| 정본에 없는 상태·축을 웹이 만들어야 하나 | 없음. 축은 정본 그대로(4 / 8 / 6). |
| 이미지로 알 수 없는 동작 | 콘텐츠 모달 높이 규칙 — `reports/modal-content-family-backlog.md` 가 정본으로 이미 선언함. |
| river 결정 필요분 | 착수 전 2건 질의·확답 완료(D1 별도 컴포넌트 2개 · D2 회색 자리표시). |

## 웹만의 표출 규칙 (정본에 대응이 없는 것 = 정본 신설이 아님)

- **콘텐츠 모달 높이**: 정본의 336/587 은 **최소 높이**다. 콘텐츠가 늘면 커지고, 딤 화면 높이의 85% 에서 멈춘 뒤 본문(`content-area`) 안에서 스크롤한다. Figma 마스터는 높이를 하나만 가질 수 있어 실측 고정값이 들어갔을 뿐이며, 이 동작을 구현하는 것이 웹의 몫이다(`modal-content-family-backlog.md` 「높이 규칙」).
- **closed 상태**: 확인 계열 Modal 과 같은 처리(플랫폼 표준 표출 상태 `[hidden]`).
- Assist·Text Button 의 `:focus-visible` 표시는 기존 Button 과 같은 초점 토큰을 그대로 쓴다(새 토큰 0).

## 접근성 계약

- Assist Button · Text Button: 네이티브 `<button type="button">`. 상태는 `:hover`·`:active`·`[disabled]` 로 표현하고 별도 data 상태를 만들지 않는다.
- Modal Content: 확인 계열 Modal 과 같은 계약(`role=dialog`·`aria-modal`·초점 가둠·Escape·초점 복귀·배경 스크롤 잠금) + 본문 스크롤 영역은 키보드로 스크롤 가능해야 한다.
