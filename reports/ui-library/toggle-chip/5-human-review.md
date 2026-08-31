# 5-human-review — river UX 검수 (대기)

작성: ⭐ 오케스트레이터 · 2026-08-31

## 검수 대상

- 디자인가이드: `pages/components.html` → 상단 Toggle · Chip 버튼
- 검수 전용 화면: `pages/ui-review.html` (검수본 06) — Light·Dark, PC·Mobile 한 화면 비교

두 화면 모두 **실제 배포 파일(`ui-library/dist`)** 을 그대로 씁니다. 화면용으로 따로 그린 코드가 없습니다.

## 봐주실 것

1. 토글을 눌러 켜고 끄는 느낌 — 정본에 애니메이션이 없어 **즉시 전환**됩니다. 이대로 둘지.
2. 칩을 눌러 선택/해제 — Line(외곽선)과 Solid(채움)의 선택 표시가 충분히 구분되는지.
3. Light·Dark 양쪽에서 비활성 칩 글자가 읽히는지.
4. 안내 페이지의 설명 문구(제목 아래 한 줄, 승인 범위 한 줄)가 이해되는지.

## 결정이 필요한 것

- **HD-1. 칩의 아이콘·닫기(X)** — 안내 페이지의 "선택 가능한 요소"에 아이콘과 닫기(X)가 적혀 있는데, 설치기 정본(Figma 컴포넌트를 만드는 원본)의 칩에는 그 부품이 없습니다. 그래서 이번 배포본은 **라벨만** 만들었습니다.
  (A) 지금처럼 라벨 전용으로 두고, 설명에서 아이콘·닫기는 필터 칩 쪽 이야기라고 정리 / (B) 정본에 아이콘·닫기 있는 칩을 추가하고 웹도 따라 만든다.
  안 정하면 지금 상태 유지 — 배포본은 라벨 전용, 설명에는 아이콘·닫기가 "선택 가능한 요소"로 계속 보입니다.
- **HD-2. 독립 검증을 이번에도 생략할지** — 지금까지처럼 제가 만들고 제가 실제 렌더로 확인했습니다. 다만 토글·칩은 앞선 체크박스와 달리 **JavaScript 동작이 있습니다**.
  (A) 이번도 생략(제 검증 + 자동 검사로 승인) / (B) 별도 검증 에이전트를 한 번 더 돌린 뒤 승인.
  안 정하면 (A)로 처리해 approved 로 둡니다.

## 결과

- 상태: **대기 중** — river 확인 후 `workflow-state.json` 의 `evidence.riverApproval` 에 기록합니다.

## river 실사용 피드백 반영 (2026-08-31, 1차)

검수 중 river 가 두 가지를 지적해 즉시 반영했다.

1. **Action 영역에 사이즈·유형을 함께** — Button Action 과 같은 틀(열=크기, 행=variant + Disabled 행)로 교체. 이전에는 크기별로만 묶고 variant 를 섞어 나열해 "유형" 축이 안 보였다.
2. **PC-SM 라벨이 위로 떠 보임** — 실측 결과 `line-height: 130%`(문단용 배수)가 Pretendard 의 ascent:descent 비율을 그대로 배분해 라벨이 위로 치우쳐 보였다. `line-height: normal`(폰트 자체 메트릭)로 교체 — 새 토큰을 만들지 않고 CSS 키워드로 해결했다(라벨 위치는 정본 값이 아니라 웹 구현 기법의 문제라 토큰 범위 밖).

재검증: `npm run ui:build`·`ui:test` PASS, 실제 렌더로 PC SM·MD·Mobile SM × Light·Dark 재확인, 콘솔 오류 0·중복 id 0. 스크린샷 갱신: `screens/guide-chip.png`·`screens/state-matrix-light-dark.png`·`screens/review-toggle-chip.png`.
