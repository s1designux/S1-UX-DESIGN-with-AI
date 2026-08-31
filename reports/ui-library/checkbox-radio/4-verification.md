# 4-verification — 기술 검증

작성 2026-08-31 · 판정 ⭐ 오케스트레이터

## 자동 검사

| 검사 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS · policy=candidate |
| `npm run ui:icons` | ✅ PASS · 아이콘 2종 frame/glyph 계약 + 적대 자체 테스트 |
| `npm run ui:build` | ✅ PASS · 29 files |
| `npm run ui:test` | ✅ PASS |
| `npm run gate:check` | ✅ PASS · 게이트 46개 · error 0 · 기존 경고 15(이번 작업과 무관) |
| `components:facts:check` · `guide-model:check` · `design:md:check` · `behavior:check` | ✅ 전부 PASS |

## 새로 배선한 결정론 검사 (적대 테스트로 실제 작동 확인)

`ui-library/scripts/test.mjs` 에 Checkbox·Radio 계약 검사를 추가했다. 검사가 **실제로 실패를 잡는지** 일부러 정본과 어긋나게 바꿔 확인했다.

| 일부러 넣은 오류 | 검사 결과 |
|---|---|
| 라디오 Selected 배경을 `bg/selected` 로 바꿈(정본은 `bg/default` 유지) | ❌ `radio selected state must keep the canonical default background` — 잡힘 |
| 체크박스 상자를 18px → 20px 로 바꿈 | ❌ `checkbox control does not use the canonical 18px control box` — 잡힘 |
| (원복 후) | ✅ PASS |

검사 항목: 18px 상자·원 · `appearance:none` · hover 를 hover 가능 기기로 제한 · hover 가 선택 색을 덮지 않음 · disabled 토큰 배선 · `:disabled:checked` 존재 · `:focus-visible` 존재 · 라벨 간격 8 · native 요소 사용 · 런타임 없음 · 정본 상태 매핑 존재 · 체크 아이콘이 등록된 정본 아이콘 사용 · 체크 16px · 점 10px · 점 토큰 배선.

## 실제 렌더 검증 (검사기 사각지대)

실제 `ui-library/dist` CSS 를 소비하는 정적 상태 매트릭스를 headless Chrome 으로 렌더해 육안 대조했다.
**범위: 정본 5상태 × 라벨 유무 × Light·Dark = 32칸 전수.**

`screens/state-matrix-light-dark.png`

| 대조 항목 | 결과 |
|---|---|
| Checkbox Default / Checked / Disabled / Disabled+Checked | ✅ 정본 색·상자·체크표시 일치 |
| Radio Default / Selected / Disabled / Disabled+Selected | ✅ Selected 가 배경을 바꾸지 않고 테두리·점만 바뀌는 정본 특성 재현 |
| Dark | ✅ 별도 CSS 사본 없이 같은 Semantic 토큰의 모드 변화로 처리됨 |
| 라벨 있음/없음 | ✅ 라벨 없으면 상자만, 있으면 간격 8로 붙음. 비활성 라벨 색 적용 |
| 빈 HTML 소비 | ✅ `screens/empty-consumer.png` — 전체 묶음 소비자에서 정상 렌더 |

## 검증 중 발견한 도구 사각지대 (기록)

`npm run shot` 은 기본이 `file://` 인데, **CSS `mask` 로 그리는 아이콘은 `file://` 에서 렌더되지 않는다**(브라우저 보안 제한). 처음 캡처에서 체크 표시가 안 보여 구현 오류로 오인할 뻔했고, 격리 실험으로 이미 승인된 Input 의 `remove` 아이콘도 똑같이 안 나오는 것을 확인해 **도구 한계**로 판정했다. `http://` 로 다시 렌더하니 둘 다 정상이다(`screens/icon-mask-check.png`).

→ **아이콘이 mask 로 그려지는 컴포넌트의 렌더 검증은 반드시 http 로 해야 한다.**

## 검문소

FAIL 0 · HOLD 0 · BLOCKED 0.

## 독립 검증 생략 사유

계약의 위험 조건(정본 충돌 · 복합 flow · 검사 실패)에 해당하지 않는다. 정본 상태를 그대로 옮긴 단일 컨트롤이고 런타임이 없으며, 새로 추가한 결정론 검사가 적대 테스트에서 실제로 실패를 잡는 것을 확인했다. river 가 별도 검증을 원하면 `component-verifier` 시나리오 F 로 같은 범위를 재검증할 수 있다.
