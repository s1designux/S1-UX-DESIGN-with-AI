# 3-build — 밀도(density)

## 만든 것

| 파일 | 무엇 |
|---|---|
| `registry/governance/density-policy.json` | 정본 — 밀도 단어·높이·대상 컴포넌트·대상 아닌 것 |
| `ui-library/scripts/density.mjs` | 생성기 — 컴포넌트 CSS 의 크기 규칙을 선택자만 바꿔 복사 |
| `ui-library/scripts/build.mjs` | 컴포넌트 CSS 뒤에 밀도 CSS 를 붙인다(전체 묶음·개별 설치 동일) |
| `scripts/density-policy-check.js` | 검사기 — `npm run ui:density` |
| `registry/governance/design-narrative.json` | 문서 §8 에 "어느 밀도를 쓰나" |

## 어떻게 만드나 — 값을 짓지 않는다

컴포넌트 CSS 안에 이미 있는 크기 규칙을 **선언은 그대로 두고 선택자만 바꿔** 복사한다.

```
[data-s1-component="button"][data-size="xsm"] { height: var(--sizing-34); … }
        ↓
[data-s1-density="normal"] [data-s1-component="button"]:not([data-size]) { height: var(--sizing-34); … }
```

값을 옮겨 적지 않으므로 밀도와 크기가 갈라질 수 없다. `:not([data-size])` 때문에 크기를 직접 준
자리는 언제나 이긴다.

"어느 크기가 어느 밀도인가"는 **컴포넌트 자기 CSS 의 실제 높이**에서 읽는다. `component-facts.json`
의 geometry 를 쓰지 않은 이유 — 컴포넌트마다 실측 대상이 다르다. 드롭다운은 facts 에 목록 패널
높이(120·144·184)만 있고 한 줄 높이(28·34·44)는 CSS 에만 있다. 표는 정본에 md(44)가 있지만 웹
배포본은 sm(38)·xsm(34)만 구현했다. 실제로 그려지는 높이를 기준으로 삼아야 줄이 맞는다.

모바일 크기는 `manifest.breaks` 가 정본이다 — 버튼 `lg` 처럼 선택자에 `[data-break]` 를 안 붙이고
크기 단어만으로 구분하는 컴포넌트가 있다.

## 읽어낸 표

| 컴포넌트 | 넓게(44) | 보통(34) | 좁게(28) | 모바일 |
|---|---|---|---|---|
| button | md | xsm | xxsm | lg |
| input · select · date-picker · time-picker | md | xsm | xxsm | md |
| dropdown | md | xsm | xxsm | — |
| chip | *md(34)* | md | sm | sm |
| filter-chip | *md(34)* | md | sm | md |
| table | *sm(38)* | xsm | *xsm(34)* | — |
| multi-toggle | md | sm | *sm(34)* | — |

*기울임* = 그 밀도에 맞는 크기가 없어 가장 가까운 크기로 대신한 자리. 검사기가 경고로 알린다.
