# 8. React 생성기(react.mjs) 변경 독립 검증 — GNB Sub Menu 가변 칼럼

- 검증자: component-verifier (시나리오 F 부분 — React 전달본 생성기)
- 일시: 2026-10-02
- 대상: `ui-library/scripts/react.mjs` 작업트리 변경(+129/−8, HEAD 83617760 대비)
- 판정: **PASS**

## 1. 기계검사 (ui:build 재실행 후)

| 명령 | 종료코드 | 요약 |
|---|---|---|
| `npm run ui:build` | 0 | 308 files generated |
| `npm run ui:react` | 0 | React 31개 · 45벌 승인 마크업 일치, 목록·슬롯·폼·자식·id 통로 열림 |
| `npm run ui:test:check` | 0 | technical checks completed |
| `npm run ui:build:check` | 0 | 308 files checked |
| `npm run ui:contract` | 0 | PASS · errors=0 |

재빌드 전후 `dist/platform/react` 는 바이트 동일(재빌드가 새 차이를 만들지 않음).

## 2. 회귀 — 생성기 변경 전후 출력 비교

방법: `git show HEAD:ui-library/scripts/react.mjs` 를 스크래치에 꺼내, 스크래치에 만든 `ui-library` 사본(src·scripts·verification·dist·package.json·release-log.json 복사, 저장소의 registry·assets·scripts·node_modules 는 심볼릭 링크)의 `scripts/react.mjs` 만 HEAD 판으로 바꾼 뒤 `node scripts/build.mjs` 실행. 그 결과 `dist` 전체를 작업트리 `ui-library/dist` 와 `diff -rq` 로 비교. 원본 파일은 건드리지 않음.

결과: **dist 전체(308 파일)에서 다른 파일은 `platform/react/gnb-sub-menu.jsx` 1개뿐.** 다른 React 컴포넌트·index.d.ts·README·contract.json·vue 출력 모두 바이트 동일.

## 3. 실제 렌더 (esbuild + ui:react 와 같은 React 대역, 실제 runtime.js 사용)

- (a) prop 없음 → 4칼럼(항목 4·2·3·4, 마지막 항목 `aria-current="page"` "단말기정보") — 승인 예제 regular 인스턴스와 일치(ui:react 의 구조 대조도 통과).
- (b) `columns` 3칼럼 · 항목 1·3·0 → 칼럼 3개, 항목 정확히 1·3·0개, 제목 A/B/C, 객체 항목 `{content, attrs}` 의 `aria-current` 가 해당 `<a>` 에만 붙음. 항목 0개 칼럼은 제목만.
- (c) 1depth 제목 = `<span data-depth="1depth">`, 2depth 항목 = `<a data-depth="2depth" href="#">` — 모든 경우 확인.

## 4. 오접힘 위험 — isVariable 참이 되는 묶음 전수

방법: 변경된 react.mjs 사본에 내부 함수 export 만 덧붙여, `dist/examples/*.html` 46개 전체 트리의 모든 노드에서 `repeatGroups` → `isVariable` 계산(반복 묶음 26개 조사).

결과: 참 4건 — **전부 gnb-sub-menu 인스턴스**(gnb-sub-menu.html 의 regular·compact-2, gnb.html 안에 함께 놓인 gnb-sub-menu regular·compact-2). 다른 컴포넌트에는 없음. gnb.jsx 는 gnb 첫 인스턴스(nav)만 쓰므로 영향 없음(회귀 비교에서 동일 확인). `shape()` 는 `signature()` 와 "이름표 없는 연속 형제의 개수"만 다르게 보므로, 묶음 병합이 새로 생기는 경우 = isVariable 참인 경우와 같다 → 다른 컴포넌트의 묶음 구성은 바뀌지 않았다.

## 참고 (판정 영향 없음)

- 생성된 gnb-sub-menu.jsx 가 `list` 를 import 하지만 쓰지 않는다(미사용 import, 동작 영향 없음).
- 칼럼에 `items` 를 빼면 예제 첫 칼럼의 자리표시 항목 4개("하위 메뉴")가 그려진다 — 다른 목록 prop 과 같은 "안 주면 예제" 규칙. 빈 칼럼을 원하면 `items: []` 를 줘야 한다.
- React 전달본은 regular 1벌만 낸다(compact-1·compact-2 는 React 로 나오지 않음) — 이번 변경 전부터의 범위, 이번 검증 대상 아님.

## 검증하지 못한 범위

- 실제 React/react-dom 런타임(저장소에 미설치) — ui:react 와 같은 대역으로 렌더. 실제 React 의 key 경고·hydration 은 미확인.
- 브라우저 픽셀 렌더 — 마크업이 승인 예제와 같으므로 생략.
