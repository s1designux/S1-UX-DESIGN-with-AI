# 2-canon-readiness — 밀도(density)

## 정본에 무엇을 새로 만드나

**아무것도 만들지 않는다.** 밀도는 새 크기·새 토큰·새 variant 를 만들지 않고, 이미 있는 크기 규칙을
다른 이름으로 고를 수 있게 가리는 층이다.

- 새 토큰 0건 · 새 크기 값 0건 · 새 variant 0건 → Gate 34(정본 신설 승인) 대상 아님(추적 651항목 불변).
- `size-naming-policy.json` 을 고치지 않는다. "같은 크기 단어가 컴포넌트마다 다른 높이를 뜻하는 것"은
  2026-09-08 에 이미 정상으로 선언된 규칙이다. 밀도는 그 사실을 쓰는 사람이 몰라도 되게 가린다.

## 새로 생기는 공개 API

| 무엇 | 값 | 어디에 |
|---|---|---|
| `data-s1-density` | `wide`(넓게 44) · `normal`(보통 34) · `narrow`(좁게 28) | 화면을 감싸는 요소 |
| `data-s1-break` | `pc` · `mobile` | 화면을 감싸는 요소 |

계약(`ui-library-code-contract.json`)의 `publicApi` 는 root·parts·variants·sizes·states·events 를 다룬다.
밀도는 **컴포넌트 바깥(조상)** 에 붙는 첫 속성이라 계약에 없던 자리다 — river 승인 2026-09-14
("넓게·보통·좁게로 하고, 배포본이 읽게 하는 데까지 가줘") 로 착수했고, stable 승격 때 계약에 명시한다.

## 결정이 필요했던 것

| 물음 | 정한 것 | 근거 |
|---|---|---|
| 밀도 단어 | 넓게·보통·좁게 | river 2026-09-14 |
| 그 밀도에 맞는 크기가 없으면 | 가장 가까운 **아래** 크기 | 위로 올리면 그 줄만 커져 줄이 어긋난다 (오케스트레이터 판단 — river 확인 대기) |
| 선언이 없으면 | 지금과 같다(컴포넌트가 `data-size` 를 직접 받는다) | 기존 화면을 조용히 바꾸지 않기 위해 |
| 크기를 직접 준 자리 | 언제나 이긴다 | 밀도 규칙에 `:not([data-size])` |

## 대상과 대상 아닌 것

대상 10종 — button · input · select · chip · filter-chip · table · multi-toggle · dropdown · date-picker · time-picker.
한 줄에 나란히 놓이는 컨트롤이다.

대상 아님 — tab(44·42·40) · gnb(56·48·36) · modal(폭 축) · modal-content(520·1000·1200) · calendar(56·40).
자기 눈금을 쓰므로 지금처럼 `data-size` 를 직접 받는다. 정본 `density-policy.json` 의 `outOfScope`.
