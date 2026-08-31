# 4-verification — 기술 검증

검증자: ⭐ 오케스트레이터 (자가인증 — 독립 검증 미실행, 사유는 아래) · 2026-08-31

## 자동 검사

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS · errors=0 |
| `npm run ui:icons` | ✅ PASS · icons=2 · errors=0 |
| `npm run ui:build` | ✅ PASS · 37 files |
| `npm run ui:test` | ✅ PASS |
| `components:facts:check` · `guide-model:check` · `design:md:check` · `behavior:check` | ✅ 전부 PASS |
| `npm run gate:check` | ❌ 4 error — **전부 Gate 6c(설치기 zip 카드 날짜)** · 이번 작업과 무관(아래) |

### Gate 6c 4건은 이번 작업의 결과가 아니다

세션 시작 시점 git status 에 `assets/downloads/s1-ux-design-guide-installer.zip` 이 이미 수정 상태였다.
카드 날짜는 `vars-data.ts`·`textstyles-data.ts` 의 변경 이력에서 재계산되는데 이번 작업은 두 파일을 건드리지 않았다.
zip 값(2026-08-31)이 재계산값(08-26/08-21)보다 **앞서 있다** = 누군가 설치기를 먼저 다시 빌드해 둔 상태다. 해소는 `npm run installer:build` 담당 작업의 몫이다.

## 실제 렌더 (http · headless Chrome)

`file://` 함정을 피해 전부 `http://127.0.0.1:4173` 로 렌더했다.

| 확인 | 결과 | 근거 |
|---|---|---|
| 정본 상태 전수 × Light·Dark | ✅ Toggle 4칸 × 2테마, Chip 2variant × 3크기 × 4상태 × 2테마 = 48칸 육안 대조 | `screens/state-matrix-light-dark.png` |
| 가이드 화면(Toggle) | ✅ mount·Action·순서·코드탭 | `screens/guide-toggle.png` |
| 가이드 화면(Chip) | ✅ 크기는 Action 에만, variant 블록 2개 | `screens/guide-chip.png` |
| 빈 HTML 소비(전체 묶음) | ✅ | `screens/empty-consumer.png` |
| **전체 묶음 = 개별 설치 동일성** | ✅ 두 소비자 스크린샷의 sha256 **완전 일치** | `screens/empty-consumer-individual.png` |
| river 검수 화면 | ✅ Toggle 12개·Chip 50개 인스턴스 렌더, 로드 오류 0 | `screens/review-toggle-chip.png` |

## 실제 동작 (브라우저 실행 확인)

| 확인 | 결과 |
|---|---|
| 토글 클릭 → `aria-checked` true↔false | ✅ |
| 비활성 토글 클릭 → 상태 불변 | ✅ |
| 칩 클릭 → `aria-pressed` true↔false | ✅ |
| 계산된 트랙 크기 | ✅ 40px × 20px · radius 9999px (정본 일치) |
| 키보드 초점 이동·focus 표시 | ✅ |
| 다크 전환 시 토큰 실제 변화 | ✅ Solid 칩 배경 `#F5F5F5` → `#2E2F38` |
| 페이지 전체 중복 `id` | ✅ 0개 (components.html · ui-review.html 양쪽) |
| 콘솔 오류 | ✅ 0건 |
| Gate 23 미계측 보완 — Action 영역 실재 | ✅ 두 섹션 모두 실제 렌더에서 확인(정적 파서가 못 보는 자리) |

## 독립 검증(component-verifier) 미실행 — 사유

계약의 위험 조건(정본 충돌 · 복합 flow · 검사 실패)에 해당하지 않는다. 정본 상태를 그대로 옮긴 단일 컨트롤 2종이고,
새 토큰·새 variant 신설이 0건이며, 신설한 결정론 검사가 정본 이탈(크기·토큰·금지 조합)을 실제로 잡도록 배선돼 있다.
다만 **런타임(JavaScript)이 있는 컴포넌트**라는 점에서 Checkbox·Radio 보다 위험이 한 단계 높다 → **river 결정 사항(HD-2)**.

## 아직 검증하지 않은 것 (정직 표기)

- 실제 보조기기(화면낭독기) 음성 출력은 확인하지 않았다. ARIA 속성 결선까지만 확인했다.
- 실제 손가락 터치 기기에서의 hover 미발생은 `@media (hover: hover)` 규칙으로만 보장했고 기기 실측은 하지 않았다.
