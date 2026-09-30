# 3-build — 원본·배포·정본 구현 (2026-09-29)

## 정본(설치기)
- `buildExpandableCard` 신설 — State=Collapsed|Expanded, 폭 328, 여백 16/16/20/20, 간격 10, 반경 radius/10, 테두리 border-width/1 + line/default, 펼침칸 bg/level-2, 화살표는 라이브러리 chevron 인스턴스(닫힘 아래·열림 위).
- `buildDivider` 신설 — Axis=X|Y × Weight=Default|Strong, 색 line/default · line/strong, 세로 높이 14.
- 묶음: `List` 에 Expandable Card 추가, `Common` 신설(Divider). 배치 행 끝에 Common 추가.
- 설치기 재생성 — 부품 52종.

## 장부
- `registry/components/{expandable-card,divider}.json` 신설 + 두 index 등록.
- `component-fingerprint-map.json` · `component-page-coverage.json` · `update-management.json` 반영.
- 검수 사전(`ui.html` AXIS_WORD·VALUE_WORD)에 방향·두께·접힘·펼침 우리말 추가 — Gate 54 통과.

## 웹 배포본
- `ui-library/src/components/{expandable-card,divider}` 원본 코드 + dist 0.13.17.
- `side-nav`·`data-tag` 원본 코드는 만들었으나 `component-ids.mjs`·exports·검수 소비자에서 제외(정본 보류).

## 보류 사유
사이드바·뱃지는 2-canon-readiness 의 needs-decision 3건이 정해지기 전에는 정본에 넣지 않는다.
