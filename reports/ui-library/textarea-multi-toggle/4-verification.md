# 4-verification — Textarea · Multi Toggle

- 날짜: 2026-09-02 · 판정: **PASS** (FAIL 0 · HOLD 0 · BLOCKED 0)
- 수행: ⭐ 오케스트레이터 (구현=🧱 ui-library-builder, 안내 배선=🤖 guide-builder — 만든 자 ≠ 검증한 자)
- 검증 대상: 실제 `ui-library/dist` (손편집 없음, 생성물)

## 0. 함정 확인 먼저

| 함정 | 이번에 걸렸나 | 처리 |
|---|---|---|
| T2 `file://` ES module | 미해당 | 전 검증을 http(4173)로 수행 |
| **T3 브라우저 캐시** | **걸림 (2회)** | 검사 브라우저가 옛 `s1-ui.css`(151 rules)를 붙잡아 "스타일 미적용"으로 오인될 뻔했다. 호스트 전환(`127.0.0.1`↔`localhost`) + link href bust 로 갱신(193 rules) 후 재측정 |
| T4 앵커 빈 화면 | 걸림 | 창 높이 2200 으로 캡처 |
| **T5 중복 id** | **걸림 (검증 지그 자체)** | 상태 매트릭스가 Light·Dark 두 벌에 같은 id 를 써 9건 중복 → 지그를 theme 별 고유 id 로 수정. 최종 중복 **0건** |
| T6 Gate 23 미계측 | 해당 | `managedBy: ui-library-guide` 라 정적 파서가 못 본다 → Action 영역 실재를 **실제 렌더로 직접 확인**(스크린샷 2장) |

## 1. 정본 실측 대조 — 실제 렌더 computed style

### Textarea (Light·Dark 각 5상태 / Mobile 4상태)

| 항목 | 정본 | 실측 | 판정 |
|---|---|---|---|
| min-height | 80 | `80px` | ✅ |
| padding | 12/12/10/10 | `12px 12px 10px 10px` | ✅ |
| radius | 4 | `4px` | ✅ |
| border | 1 | `1px` | ✅ |
| font-size | 14 | `14px` | ✅ |
| resize | (정책 확정 D2) | `vertical` | ✅ |

상태별 색 (Light) — default `#FFFFFF`/`#D9D9D9`/`#353535` · filled 동일 · disabled `#F5F5F5`/`#E9E9E9`/`#C4C4C4` · readonly `#F5F5F5`/**border=default `#D9D9D9`**/`#757575` → 정본 매핑 그대로 ✅
Dark — default `#1C1D23`/`#3E4049` · disabled `#24252C`/`#24252C` · readonly `#24252C`/`#3E4049` → 라이트와 다른 값으로 실제 전환 ✅
Focus — Light·Dark 양쪽에서 파란 테두리 + 키보드 포커스 링 확인(스크린샷 2장) ✅

### Multi Toggle

| 항목 | 정본 MD / SM | 실측 MD / SM | 판정 |
|---|---|---|---|
| 높이 | 44 / 34 | `44px` / `34px` | ✅ |
| 최소너비 | 64 / 56 | `64px` / `56px` | ✅ |
| 좌우 padding | 12 / 8 | `12px` / `8px` | ✅ |
| 글자 | 14 Medium | `14px` / `500` | ✅ |
| 모서리 | first 좌4·우0 / middle 0 / last 우4 | 동일 | ✅ |
| 셀 보더·폭 | 인접선 1개로 보이되 셀 폭은 고정 | 모든 셀 외곽 보더 유지 + 인접 보더를 1px 겹침 | ✅ |
| 선택 색 | button/primary | `#1D6CEB` bg=border, 라벨 흰색 | ✅ |
| 비선택 색 | button/secondary | `#FFFFFF` / `#D9D9D9` / `#353535` | ✅ |
| 비활성 색 | button/disabled | `#F5F5F5` / `#D9D9D9` / `#C4C4C4` | ✅ |
| Dark 선택 | blue-dark/300 | `#3070D8` | ✅ |

**2026-09-02 river 피드백 보정:** 기존 웹 구현은 오른쪽 칸을 선택할 때 왼쪽의 보더를 없애 실제 폭이 1px 줄어들었다. 이제 모든 셀이 같은 외곽 폭을 유지하고 인접 보더만 1px 겹쳐, 선택 위치와 상관없이 칸 폭이 변하지 않는다.

## 2. 동작 검증 (실제 dist · 빈 소비자)

| 항목 | 결과 |
|---|---|
| 클릭 선택 이동 | ✅ `aria-checked` 이동, roving tabindex `0/-1/-1` 재배치 |
| 화살표 키 이동 | ✅ ArrowLeft 로 이동 + 포커스 이동 + 선택 동시 변경 |
| Home 키 | ✅ 첫 칸으로 |
| 비활성 칸 | ✅ `tabIndex = -1`, 화살표 이동에서 제외, 클릭 무반응 |
| 이벤트 | ✅ `s1:multi-toggle:change` 4회, detail `{index, value}` 정확 |
| destroy / 재init | ✅ destroy 후 클릭 무반응 → init 후 정상 복귀 |
| Textarea 런타임 | ✅ 불필요(`jsRequired:false`) — CSS·네이티브 속성만으로 5상태 성립 |
| 콘솔 오류 | ✅ 0건 (빈 소비자 · 안내 페이지 양쪽) |
| 중복 id | ✅ 0건 (안내 페이지 실제 렌더 전수) |

## 3. 배포 동일성

| 항목 | 결과 |
|---|---|
| 전체 묶음 vs 개별 설치 | ✅ 스크린샷 sha256 **완전 일치** (`003b8f55…`) |
| 빈 HTML 소비 | ✅ 두 소비자 모두 자동 초기화까지 동작 |
| 디자인가이드 = 실제 dist | ✅ 안내 페이지가 `ui-library/dist` 를 소비하며 "실제 dist 사용" 배지 표시 |

## 4. 자동 검사

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS |
| `npm run ui:icons` | ✅ PASS |
| `npm run ui:build` | ✅ PASS · 73 files |
| `npm run ui:test` | ⚠️ 이번 두 컴포넌트 계약 검사는 PASS. **tab(mobile) 개발 코드 불일치 1건 FAIL — 다른 세션이 동시 진행 중인 Line Tab 작업의 미완성분**(이 작업 범위 밖) |
| `npm run components:facts:check` | ✅ PASS |
| `npm run gate:check` | ⚠️ error 2건 — 모두 `registry/components/pagination.json` **JSON 파싱 실패**. 다른 세션이 편집 중이라 깨져 있으며 이 작업이 만든 파일이 아니다(git diff 확인) |

## 5. 이번 작업에서 고친 것

| # | 발견 | 처리 |
|---|---|---|
| 1 | 안내 페이지가 배포 상태 `candidate` 라 mount 거부 | 기술 검증 통과 후 manifest `status` 를 `verified` 로 승격하고 재빌드 |
| 2 | 안내 페이지가 "선택 가능한 요소: helper 텍스트"를 안내 — **이번 배포본에 없는 부품** | registry `textarea.json` anatomy 에서 helper 행 제거, 접근성 문장을 "정본에 추가된 뒤 연결"로 교정. river 결정 D1 과 화면이 일치하게 됨 |
| 3 | Multi Toggle 정적 상태 표본을 init 하면 런타임이 첫 칸을 자동 선택해 `Default(선택 없음)` 표본이 사라짐 | 정적 표본은 `data-review-static` 으로 분리, 실물만 init (guide-builder 수정) |

## 6. 검증하지 않은 것 (정직하게)

- **독립 검증자(`component-verifier`) 별도 spawn 은 하지 않았다.** 계약의 위험 조건 판단과 river 결정이 필요하다 — Multi Toggle 은 JavaScript 런타임이 있어 Checkbox·Radio 보다 위험이 한 단계 높다(Toggle·Chip 때와 같은 상황).
- Figma 원본 노드(587:8029)와의 시각 대조는 하지 않았다 — 이 작업의 시각 정본은 저장소 코드다.
- hover 상태는 마우스를 올릴 수 없어 **강제 표시**로 확인했다(기존 컴포넌트와 같은 기법). 실제 마우스 hover 는 검증하지 않았다.
