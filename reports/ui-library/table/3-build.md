# 3-build — Table (원본 작성분, 배선 전)

- 날짜: 2026-09-02 · 작성: ⭐ 총괄 직접 (검증은 4단계에서 분리)
- 범위: **`ui-library/src/components/table/` 신규 4파일만.** 배선(build.mjs·test.mjs·package.json)·dist·안내 페이지는 **아직 손대지 않았다** — 다른 세션이 pagination 을 정리하는 중이라 공유 파일 충돌을 피했다(SEQ-1).

## 만든 것

| 파일 | 내용 |
|---|---|
| `table.css` | 셀 높이 md 44 / sm 38, 글자 좌측 16, 셀 하단 1px, 표 외곽 상단 2px·하단 1px(strong), 선택 컬럼 48px, 상태 3종 |
| `table.js` | 전체선택·행선택 연동. 정본 행동 장부(`component-behavior.pc.json > Table`)의 두 규칙 그대로. `s1:table:selectionchange` 이벤트, `init`/`destroy` |
| `table.example.html` | 표준 마크업 — `th scope="col"`, 체크박스는 코어 재사용, 체크박스마다 이름(aria-label) |
| `manifest.json` | 공개 API·상태 맵·정본 지문(`3ba27d91…`)·접근성 계약(HD-4 A안 그대로) |

## 결정 반영

- HD-1 A → 정렬 아이콘·`aria-sort` 없음.
- HD-2 → 표만 소유. 페이지네이션·보기 셀렉트는 **승인된 배포본을 안내 페이지 시연 영역에서 조립**한다(모듈 안에 다시 구현하지 않음). 설명·코드 영역은 Table 소스만.
- HD-3 B → `data-align="center"` 공개 옵션 추가. 기본은 정본과 같은 왼쪽 정렬. 정본 반영은 NCU-1 로 분리.
- HD-4 A → `th scope` · 체크박스 이름 · 탭/스페이스 기본 조작. 방향키 격자 이동 없음.

## 렌더 확인 (⭐ 1회)

`screens/state-matrix.png` — md·sm × Light·Dark, 각 표에 hover 표기 행과 selected 표기 행 포함.

| 확인 항목 | 결과 |
|---|---|
| md 44 / sm 38 높이 차 | 보임 |
| 헤더 배경·글자(회색 계열) | 정본 토큰대로 |
| hover 회색 / selected 파랑 | 라이트·다크 모두 보임 |
| 표 위 2px · 아래 1px 진한 선 | 보임 |
| 체크 표시(✔) 미표시 | **도구 문제** — `file://` 에서 마스크 아이콘 미표시(함정 T1). 선택된 상자는 파랑으로 채워짐 |
| sm 글자 크기 | md 와 동일(14). **HD-5 결정 전까지 의도적으로 미적용** |

## 남은 일

1. HD-5(작은 표 글자 크기) 결정.
2. pagination 배포본 확정 후 배선 5자리 + dist 생성 + 안내/검수 화면 연결.
3. 4-verification (실제 dist 로 전수·키보드·다중 인스턴스·빈 HTML 소비).
