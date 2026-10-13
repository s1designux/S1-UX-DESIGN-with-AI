# 3-build — React판 개발자 검수 후속 수정 (0.23.0)

작성: ui-library-builder · 상태 판정(PASS·approved)은 이 문서가 하지 않는다 — 별도 검증자 몫.

## 무엇을 어디서 고쳤나 (생성기 — dist 손편집 없음)

| 영역 | 파일 | 내용 |
|---|---|---|
| 생성 엔진 | `ui-library/scripts/react-gen.mjs` | 승인 예제 → React(forwardRef · "use client" · 슬롯 이름 나누기 · 목록 정규화 · 형태별 마크업) |
| 부품별 선언 | `ui-library/scripts/react-spec*.mjs` · `react-api.mjs` | 부품마다 받는 prop · 코드 조각 · 이벤트 상세 타입 (마크업은 예제에서만 옴) |
| 도우미 | `ui-library/scripts/react-kit.mjs` → `platform/react/kit.js` | ref 합치기 · 동작 스크립트 붙이기 · 열림/값 맞추기 · 목록 항목 한 모양 |
| 타입·설명서 | `react-docs.mjs` · `react-readme.mjs` | index.d.ts(인덱스 시그니처 없음) · README(예시는 전부 빌드·서버 렌더 검증) |
| 웹 런타임(추가만) | `src/components/{input,dropdown,filter-chip,select,time-picker}` | 입력 지우기 기본 setter · 드롭다운/필터칩/시간 setValue · data-value/data-name/data-placeholder · 시간 시트 듣기 누수 |
| 묶음·검사기 | `scripts/build-ui-package-zip.js` · `src/tools/s1-ui-lint.mjs` | React 묶음에 s1-ui.base.css · 시작하기 안내 · lint 가 묶음 폴더 자신을 건너뜀 |
| 검수기 | `scripts/publisher-audit/react.mjs` + `react-harness/*` | 시나리오 21 → 40, 타입 시험 5 → 11줄, README 예시 빌드·서버 렌더·눌러 보기, lint 시험 |
| 전달본 시험 | `ui-library/scripts/react-parity-check.mjs` · `test.mjs` | 54벌 마크업 대조(변형별) · 열림·값·선택 배선 대역 시험 |

## 실행 명령

```
npm run ui:bump:minor            # 0.22.0 → 0.23.0 (+ ui:build + 전달본 지문 기록)
npm run ui:build && npm run ui:zip
npm run ui:contract ui:version ui:build:check ui:test:check ui:icons ui:icons:origin ui:guide:render ui:zip:check
npm run rn:parity ui:react ui:runtime ui:behavior gate:check
npm run audit:publisher:web
npm run audit:publisher:react -- --env <환경폴더>        # 진짜 React 19 · Vite 8 · TS 6
```

## 알려 둘 것

- `onChange` 는 종전 그대로(고르는 부품은 CustomEvent) 두고 값만 주는 `onValueChange` 를 새로 더했다 — 하위 호환 때문.
- 목록 항목의 `disabled` 는 정본에 비활성 모양이 있는 부품(멀티 토글 · 시트 줄)에서만 적용한다(정본에 없는 상태를 만들지 않는다).
- GNB 에 menus 를 안 주면 종전처럼 예제의 id(`gnb-sub-menu-a-service` …)를 가리킨다(곁에 `S1GnbSubMenu id=…` 를 두는 옛 조합법 유지).
- Next.js 는 설치하지 않아 실제 빌드는 못 돌렸다 — "use client" 표시만 정적으로 확인.
