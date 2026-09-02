# 2-canon-readiness — Textarea · Multi Toggle

- 날짜: 2026-09-02 · 판정: **통과** (needs-decision 0건)
- 신규 토큰: **0건** — Textarea = `color/form-control/*`, Multi Toggle = `color/button/*` 재사용

## A. 착수 차단 요인 해소

| # | 항목 | 결과 |
|---|---|---|
| 1 | textarea a11yStatus = pending | registry `a11y` 배열이 이미 계약을 선언하고 있어 **그 선언을 그대로 확정**(stable). 새 규칙 신설 아님 |
| 2 | multi-toggle a11yStatus = pending | 좌동 — registry 선언(radiogroup·화살표 이동·disabled 포커스 제외)을 그대로 확정 |
| 3 | Textarea 안내문구 | river 결정 D1 — **이번 범위 밖**. 정본에 먼저 추가 후 다음 차례 |
| 4 | Textarea resize 정책 | river 결정 D2 — **세로만**(`resize: vertical`) |

## B. Textarea 공개 계약

| 항목 | 확정 |
|---|---|
| root | `div[data-s1-component="textarea"]` |
| 필수 attribute | `data-break`(pc·mobile — 값은 같고 예시 구분용) |
| 필수 부품 | `control` (`<textarea>`) |
| 선택 부품 | 없음 |
| 상태 | default · focus(`:focus-within`) · filled(값 존재, 강제 시각 상태 없음) · disabled(`control[disabled]`) · readonly(`control[readonly]`) |
| 이벤트·런타임 | **없음** — `jsRequired:false`, `runtime:null` (파일은 배선 규칙상 존재) |
| 접근성 | 이름 = 외부 `<label for>` 또는 `aria-label`(필수) · 키보드 = 네이티브 텍스트 편집 · 포커스 = 네이티브, 정본 Focus 상태와 시각 일치 |

### 정본에 없어 만들지 않은 것 (`notInCanon` 에 기록)

| 항목 | 사유 |
|---|---|
| 라벨 부품 | 정본 `buildTextarea` 가 라벨을 그리지 않는다. 접근 이름은 서비스가 외부 라벨로 연결한다 |
| 안내문구(helper)·오류/성공 상태 | 정본 주석 "1차는 필드 상태만"(:1396). river 결정 D1 |
| 글자수 카운터 | 정본에 없음 |
| 크기 축(sm/md/lg) | 정본에 State 축만 있음 |
| hover 상태 | registry stateNotes 가 "삭제(HD-2) · Figma 미정의"로 선언 |

### 매체 차이 (선언하고 진행)

| 항목 | 정본 | 웹 |
|---|---|---|
| 폭 | 240 고정(Figma 프레임 폭) | 컨테이너 폭 100% · 최소 240 |
| 높이 | 80 고정 | 최소 80 + 세로 확장 허용(D2) |

## C. Multi Toggle 공개 계약

| 항목 | 확정 |
|---|---|
| root | `div[data-s1-component="multi-toggle"]` · `role="radiogroup"` |
| 필수 attribute | `data-size`(md·sm) · 접근 이름(`aria-label` 또는 `aria-labelledby`) |
| 필수 부품 | `cell` 2개 이상 (`role="radio"`, `aria-checked`) |
| 위치 규칙 | 첫 칸 = first · 마지막 칸 = last · 선택 칸 기준 좌측 middle-left / 우측 middle-right (정본 `cellSpec` 규칙 그대로) |
| 상태 | default · hover(`@media (hover:hover)`) · selected(`aria-checked="true"`) · disabled(`[aria-disabled="true"]` 또는 `disabled`) |
| 이벤트·런타임 | `jsRequired:true` · `s1:multi-toggle:change` · `init/destroy` · 좌우(위아래) 화살표 이동 + roving tabindex |
| 접근성 | registry 선언 그대로 — radiogroup / radio / aria-checked · 화살표 키 이동 · disabled 칸 포커스 제외 |

### 칸 수 (D3 보정)

정본 조합형 세트는 **3칸 고정**이고, registry `usage` 는 **2~4개**를 권장 범위로 선언한다.
웹 CSS 는 위치 규칙으로 동작하므로 2~4칸 모두 그려지며, **안내 페이지·예시·상태 검증은 정본과 같은 3칸**으로 문서화한다. 5칸 이상은 registry 가 "Select 를 쓰라"고 선언하므로 지원 범위로 표기하지 않는다.

### 정본에 없어 만들지 않은 것

| 항목 | 사유 |
|---|---|
| focus 변형 | 정본 state 목록에 없음. 키보드 접근성 표시는 **기존 선택 테두리 토큰**만 사용(Chip 선례) — 새 토큰 0건 |
| 모바일 전용 크기 | 정본은 md/sm 뿐. PC 전용 컴포넌트로 유지(사이트 내비 `data-platforms="pc"`) |
| 자체 색 토큰 | 정본이 button 토큰만 쓴다. `--color-control-*` 을 쓰지 않는다(registry 가 기록한 사이트 Token Details 탭 드리프트는 별건) |

## D. 검문소 판정

- needs-decision: **0건**
- needs-core-update: 1건(Textarea 안내문구 — 정본 추가 필요, 이번 범위 밖으로 분리)
- 신규 토큰 승인 필요: 없음
- → **3-build 진입 가능**
