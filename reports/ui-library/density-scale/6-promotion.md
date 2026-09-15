# 6-promotion — 밀도(density) 승인·이행

- 날짜: 2026-09-15 · river 승인 기준으로 승격 · 배포본 **0.5.7**

## river 승인

> **"맞아, 바텀시트는 따로 올려줘"** (2026-09-15)

앞선 결정 3건(`5-human-review.md`)의 발화를 그대로 보여드리고 받은 확인이다. 독립 검증자가 PASS 에 달았던 조건 — "세 문장이 실제 river 발화인지 확인받을 것" — 이 이것으로 닫혔다.

## 이행 결과

| 항목 | 값 |
|---|---|
| 배포본 | `ui-library/dist` **0.5.7** · 밀도 규칙 132줄 · 컴포넌트 10종 |
| 정책 정본 | `registry/governance/density-policy.json` — `fallbackDirection` · `mobileSubstitutes` 신설(river 인용 포함) |
| 생성기 | `ui-library/scripts/density.mjs` |
| 검사기 | `scripts/density-policy-check.js` (`npm run ui:density`) |
| 문서 | `design/DESIGN.core.md` §8 (← `registry/governance/design-narrative.json`) |
| 이행 장부 | `registry/governance/ui-library-migration.json` — `density-scale` 레코드 추가 |
| 별도 작업 | `BACKLOG.md` §🔴 0-b 바텀시트 부품화 |

## 근거

- 기술 검증: `reports/ui-library/density-scale/4-verification.md`
- 독립 검증: 🤖 `component-verifier` 시나리오 F **PASS** (5회차 · 2026-09-15). 누적 결함 8건 전부 해소 — 고친 것 6건, river 결정으로 닫힌 것 2건.
- 사람 검수: `reports/ui-library/density-scale/5-human-review.md`

## 고친 것 6건 (독립 검증이 잡아낸 순서대로)

1. 선택자 목록을 쉼표로 나누다 `:is(…)` 묶음을 반토막 내 괄호가 안 맞는 규칙 37줄이 실렸다 — 날짜 선택이 좁게·모바일에서 20px 로 찌그러졌다.
2. 컴포넌트가 자기 `data-break` 를 달고 있으면 밀도 규칙이 빗나가 높이가 붕괴했다 — 배포되는 예시 마크업 6종이 그 상태였다.
3. 표가 넓게에서 38 로 내려앉았다 — 기본값이라 크기 규칙이 없는 것을 "없다"로 읽고 한 단계 아래를 깔았다.
4. 날짜 선택이 감싸기의 화면 선언을 안 읽어, 모바일에서 높이는 48 인데 PC 팝업이 열렸다.
5. 감싸기 안에서 크기만 직접 줬을 때 칩·필터칩·입력이 붕괴했고, 모바일 감싸기만 준 입력은 아이콘 터치 영역이 PC 크기(28)로 남았다.
6. 5 로 터치 영역이 48 로 커지면서 PC hover 칠이 되살아났다 — river 가 2026-09-07 에 없애라고 한 그림이었다.

## 범위 고지

밀도는 **한 줄에 나란히 놓이는 컨트롤 10종**만 묶는다. 상단 바·탭·모달·달력은 자기 눈금을 쓰므로 대상이 아니다(`density-policy.json` `outOfScope`).

크기 단어(md·xsm·xxsm)는 바꾸지 않았다 — 밀도는 그 위를 가리는 층이고, 크기를 직접 준 자리가 언제나 이긴다.

## 미검증으로 남은 것

React·Vue·Swift·Kotlin·C++ 이식본에 밀도가 반영됐는지, zip·다운로드 화면 내용은 이번 검증 범위 밖이다.
