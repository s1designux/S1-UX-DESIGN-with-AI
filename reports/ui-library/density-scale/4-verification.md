# 4-verification — 밀도(density)

## 기계 검사

| 명령 | 결과 |
|---|---|
| `npm run ui:density` | ✅ 밀도 3단계가 컴포넌트 10종에서 배포본과 일치 (규칙 80줄) · 경고 4건 = 대체 크기 안내 |
| `npm run ui:build` | ✅ 260 파일 |
| `npm run ui:contract` | ✅ |
| `npm run ui:test` | ✅ |
| `npm run ui:runtime` | ✅ 22/22 |
| `npm run design:md:check` | ✅ 드리프트 없음 (Modal 행동 계약 1건은 이 작업 전부터 실패하던 항목) |
| `npm run gate:check` | ✅ 오류 0 · 경고 17 — 착수 전과 같다 |

## 브라우저 실측 — 한 줄에 놓았을 때 높이

| 선언 | 버튼 | 입력창 | 칩 |
|---|---|---|---|
| `data-s1-density="wide"` | 44 | 44 | 34 * |
| `data-s1-density="normal"` | 34 | 34 | 34 |
| `data-s1-density="narrow"` | 28 | 28 | 28 |
| `data-s1-break="mobile"` | 48 | 48 | — |

\* 칩은 44 크기가 없어 가장 가까운 34 로 대신한다(검사기가 경고로 알린다).

**예외가 이기는지** — `narrow` 안에서 `data-size="md"` 를 직접 준 버튼은 44, 안 준 버튼은 28.
크기를 직접 준 자리가 밀도를 이긴다. ✅

## 남은 것

- 독립 검증(`component-verifier` 시나리오 F) — 시각·원본 충실성은 별도 검증자 몫.
- river UX 검수(5-human-review) — 특히 "그 밀도에 맞는 크기가 없을 때 아래로 내린다"가 쓸 만한지.
