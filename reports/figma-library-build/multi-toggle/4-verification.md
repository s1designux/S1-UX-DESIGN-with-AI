# 4단계 검증 결과 — Multi Toggle

**검증자:** 🤖 component-verifier (figma-library-build §(C))
**최초 검증일:** 2026-06-25
**재검증일:** 2026-06-25 (보더 원복 + 조립예시 6개 재생성 후)
**대상 세트:** `587:8029` (Multi Toggle, 파일 `cysG5U1udpQqVagYY1hWHW` / 페이지 `302:19291`)
**계획서:** `reports/figma-library-build/multi-toggle/2-plan.md`
**원본:** 파일 `yE5UCFEbmXJWB24Lz2` 노드 `540:4733`

---

## 검증 요약 (재검증 최종)

| 항목 | 결과 | 비고 |
|------|------|------|
| variant 전수 (32개) | ✅ | 4 position × 4 state × 2 size = 32, 누락/중복 없음 |
| variant 이름 형식 | ✅ | `position=X, state=Y, size=Z` 정규 형식 |
| 패킹 bounds | ✅ | 정상 범위 내, 붕괴 없음 |
| 토큰 바인딩 (raw hex 0건) | ✅ | 전 fill/stroke/text 색 Variable 바인딩 완료 |
| 토큰 경로 정확성 | ✅ | 12종 Variable ID → 계획서 매핑과 1:1 일치 |
| 폰트 일관성 | ✅ | 전 32개 TEXT 노드: Pretendard, 비-Pretendard 0건 |
| 텍스트 스타일 바인딩 | ✅ | 전 노드 `S:0b8aad8ca7e2cfac03033ed19607a4d2fb76aa2a` (body/14M) |
| 순환참조 | ✅ | 없음 |
| **보더 원복 (middle-left strokeRight=0)** | **✅** | 8개 전수 실측 — strokeRight=0 확인 |
| **보더 원복 (middle-right strokeLeft=0)** | **✅** | 8개 전수 실측 — strokeLeft=0 확인 |
| **조립 렌더 — 파란 셀과 닿는 면 이중선 없음** | **✅** | 6개 예시 전수 렌더 대조 |
| **조립 렌더 — 나머지 경계 1px 회색선** | **✅** | 6개 예시 모두 정상 |

**최종 판정: PASS — ❌(a) 0건 · ❓(c) 0건**

---

## 재검증 상세 — 보더 원복

### 올바른 기준 (사용자 확정)

멀티토글 position = **선택된 파란 셀 기준 상대 위치**. 선택 셀과 닿는 면엔 회색 보더가 없어야 정상이다(파란 셀이 그 경계 책임 / 회색+파랑 이중선 방지).

- **middle-left** = 오른쪽에 선택 셀이 붙음 → **strokeRight=0이 정상**
- **middle-right** = 왼쪽에 선택 셀이 붙음 → **strokeLeft=0이 정상**

### 실측 결과 (use_figma 실제 조회)

**middle-left 8개:**

| 노드 ID | 이름 | T | B | L | R | 판정 |
|---------|------|---|---|---|---|------|
| 587:2 | middle-left, default, md | 1 | 1 | 1 | **0** | ✅ |
| 587:4 | middle-left, hover, md | 1 | 1 | 1 | **0** | ✅ |
| 587:6 | middle-left, selected, md | 1 | 1 | 1 | **0** | ✅ |
| 587:8 | middle-left, disabled, md | 1 | 1 | 1 | **0** | ✅ |
| 587:10 | middle-left, default, sm | 1 | 1 | 1 | **0** | ✅ |
| 587:12 | middle-left, hover, sm | 1 | 1 | 1 | **0** | ✅ |
| 587:14 | middle-left, selected, sm | 1 | 1 | 1 | **0** | ✅ |
| 587:16 | middle-left, disabled, sm | 1 | 1 | 1 | **0** | ✅ |

**middle-right 8개:**

| 노드 ID | 이름 | T | B | L | R | 판정 |
|---------|------|---|---|---|---|------|
| 587:18 | middle-right, default, md | 1 | 1 | **0** | 1 | ✅ |
| 587:20 | middle-right, hover, md | 1 | 1 | **0** | 1 | ✅ |
| 587:22 | middle-right, selected, md | 1 | 1 | **0** | 1 | ✅ |
| 587:24 | middle-right, disabled, md | 1 | 1 | **0** | 1 | ✅ |
| 587:26 | middle-right, default, sm | 1 | 1 | **0** | 1 | ✅ |
| 587:28 | middle-right, hover, sm | 1 | 1 | **0** | 1 | ✅ |
| 587:30 | middle-right, selected, sm | 1 | 1 | **0** | 1 | ✅ |
| 587:32 | middle-right, disabled, sm | 1 | 1 | **0** | 1 | ✅ |

**참고 — first/last (불변 확인):**

| position | T | B | L | R |
|----------|---|---|---|---|
| first (8개) | 1 | 1 | 1 | 0 |
| last (8개) | 1 | 1 | 0 | 1 |

모든 16개 셀이 올바른 기준과 일치한다.

---

## 재검증 상세 — 조립 렌더 (get_screenshot 6개 전수)

### 판정 기준
파란 선택 셀과 닿는 면 = 회색선 없음(이중선 방지). 나머지 경계 = 1px 회색선 있음.

### md 3개 (192×44)

| 노드 | 선택 위치 | 파란 셀 닿는 면 이중선 | 나머지 경계 선 | 판정 |
|------|----------|---------------------|-------------|------|
| 596:6397 | left (파랑이 첫 번째) | 오른쪽 면: 이중선 없음 ✅ | 파랑↔중간, 중간↔마지막 경계 1px ✅ | ✅ |
| 596:6404 | center (파랑이 가운데) | 좌우 양쪽 면: 이중선 없음 ✅ | first↔파랑, 파랑↔last 경계 1px ✅ | ✅ |
| 596:6411 | right (파랑이 마지막) | 왼쪽 면: 이중선 없음 ✅ | 첫번째↔중간, 중간↔파랑 경계 1px ✅ | ✅ |

### sm 3개 (168×34)

| 노드 | 선택 위치 | 파란 셀 닿는 면 이중선 | 나머지 경계 선 | 판정 |
|------|----------|---------------------|-------------|------|
| 596:8900 | left | 이중선 없음 ✅ | 경계선 명확 ✅ | ✅ |
| 596:8907 | center | 이중선 없음 ✅ | 경계선 명확 ✅ | ✅ |
| 596:8914 | right | 이중선 없음 ✅ | 경계선 명확 ✅ | ✅ |

**6/6 정상 렌더 확인.**

---

## 회귀 확인 — 색 바인딩 / 폰트

| 확인 항목 | 대표 노드 | 결과 |
|----------|----------|------|
| fill Variable 바인딩 | 586:6(first/selected), 587:2(middle-left/default), 587:18(middle-right/default) | raw hex 0건, 전부 바인딩 ✅ |
| stroke Variable 바인딩 | 동일 3종 | raw hex 0건, 전부 바인딩 ✅ |
| 폰트 family | 동일 3종 TEXT 자식 | Pretendard 14px — 전부 ✅ |

---

## 토큰 바인딩 스캔 결과

### raw hex 추출 결과

**미바인딩 raw hex: 0건** — 전 SOLID fill/stroke가 Variable에 바인딩됨.

| hex 값 | 계획서 원본 역할 | DS 조회 결과 | 실제 빌드 처리 |
|--------|----------------|-------------|--------------|
| #FFFFFF | default/hover bg | EXACT: color/button/bg/secondary--default | ✅ VariableID:8:971로 바인딩됨 |
| #F5F5F5 | disabled bg | EXACT: color/button/bg/disabled | ✅ VariableID:8:968로 바인딩됨 |
| #D9D9D9 | border(default/hover/disabled) | EXACT: color/button/border/secondary--default | ✅ VariableID:8:980로 바인딩됨 |
| #757575 | text(default/hover) | EXACT: color/button/label/secondary--default | ✅ VariableID:8:989로 바인딩됨 |
| #C4C4C4 | disabled text | EXACT: color/button/label/disabled | ✅ VariableID:8:986으로 바인딩됨 |
| #1D6CEB | selected bg/border | EXACT: color/button/bg/primary--default | ✅ VariableID:8:969로 바인딩됨 |

**결론: raw hex 잔류 0건. 토큰 바인딩 완전.**

### Variable ID → 토큰 경로 역매핑 (계획서 대조)

| Variable ID | 실제 이름 | 계획서 기대 | 판정 |
|-------------|---------|-----------|------|
| VariableID:8:971 | color/button/bg/secondary--default | bg/secondary--default | ✅ |
| VariableID:8:972 | color/button/bg/secondary--hover | bg/secondary--hover | ✅ |
| VariableID:8:969 | color/button/bg/primary--default | bg/primary--default | ✅ |
| VariableID:8:968 | color/button/bg/disabled | bg/disabled | ✅ |
| VariableID:8:980 | color/button/border/secondary--default | border/secondary--default | ✅ |
| VariableID:8:981 | color/button/border/secondary--hover | border/secondary--hover | ✅ |
| VariableID:8:978 | color/button/border/primary--default | border/primary--default | ✅ |
| VariableID:8:977 | color/button/border/disabled | border/disabled | ✅ |
| VariableID:8:989 | color/button/label/secondary--default | label/secondary--default | ✅ |
| VariableID:8:990 | color/button/label/secondary--hover | label/secondary--hover | ✅ |
| VariableID:8:987 | color/button/label/primary--default | label/primary--default | ✅ |
| VariableID:8:986 | color/button/label/disabled | label/disabled | ✅ |

**12종 전부 계획서 매핑과 1:1 일치.**

---

## 폰트 일관성 스캔 결과

| 항목 | 결과 |
|------|------|
| 스캔 대상 TEXT 노드 수 | 32개 (세트 내 variant당 1개) |
| 비-Pretendard family 건수 | **0건** |
| uniqueFamilies | `["Pretendard"]` |
| 텍스트 스타일 바인딩 | 전 32개 노드: `S:0b8aad8ca7e2cfac03033ed19607a4d2fb76aa2a` (body/14M) |

**비-Pretendard 0건 → 폰트 일관성 PASS.**

---

## ❌ (a) 코드 실수 — 수정 대상

없음.

---

## 🟡 (b) 의도적 개선

없음.

---

## ❓ (c) 확인 요청

없음.

---

## 🔒 BLOCKED

없음.

---

## variant 전수 대조표

| position | state | size | 노드 ID | T | B | L | R | 판정 |
|----------|-------|------|---------|---|---|---|---|------|
| first | default | md | 586:2 | 1 | 1 | 1 | 0 | ✅ |
| first | hover | md | 586:4 | 1 | 1 | 1 | 0 | ✅ |
| first | selected | md | 586:6 | 1 | 1 | 1 | 0 | ✅ |
| first | disabled | md | 586:8 | 1 | 1 | 1 | 0 | ✅ |
| first | default | sm | 586:10 | 1 | 1 | 1 | 0 | ✅ |
| first | hover | sm | 586:12 | 1 | 1 | 1 | 0 | ✅ |
| first | selected | sm | 586:14 | 1 | 1 | 1 | 0 | ✅ |
| first | disabled | sm | 586:16 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | default | md | 587:2 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | hover | md | 587:4 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | selected | md | 587:6 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | disabled | md | 587:8 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | default | sm | 587:10 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | hover | sm | 587:12 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | selected | sm | 587:14 | 1 | 1 | 1 | 0 | ✅ |
| middle-left | disabled | sm | 587:16 | 1 | 1 | 1 | 0 | ✅ |
| middle-right | default | md | 587:18 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | hover | md | 587:20 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | selected | md | 587:22 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | disabled | md | 587:24 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | default | sm | 587:26 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | hover | sm | 587:28 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | selected | sm | 587:30 | 1 | 1 | 0 | 1 | ✅ |
| middle-right | disabled | sm | 587:32 | 1 | 1 | 0 | 1 | ✅ |
| last | default | md | 587:34 | 1 | 1 | 0 | 1 | ✅ |
| last | hover | md | 587:36 | 1 | 1 | 0 | 1 | ✅ |
| last | selected | md | 587:38 | 1 | 1 | 0 | 1 | ✅ |
| last | disabled | md | 587:40 | 1 | 1 | 0 | 1 | ✅ |
| last | default | sm | 587:42 | 1 | 1 | 0 | 1 | ✅ |
| last | hover | sm | 587:44 | 1 | 1 | 0 | 1 | ✅ |
| last | selected | sm | 587:46 | 1 | 1 | 0 | 1 | ✅ |
| last | disabled | sm | 587:48 | 1 | 1 | 0 | 1 | ✅ |

**32/32 일치.**

---

## 최종 판정

| 종류 | 건수 | 내용 |
|------|------|------|
| ❌(a) 코드 실수 | **0건** | — |
| 🟡(b) 개선 | 0건 | — |
| ❓(c) 확인 요청 | 0건 | — |
| 🔒 BLOCKED | 0건 | — |

**→ ❌(a) 0건 · ❓(c) 0건 — 통과.**

---

## 이력

| 검증 회차 | 일시 | 결과 | 비고 |
|----------|------|------|------|
| 1차 | 2026-06-25 | FAIL (❌1) | middle-left strokeRight=0 + last strokeLeft=0 → 3칸 조립 경계선 누락 (기준 잘못 판정) |
| 2차 (재검증) | 2026-06-25 | **PASS** | 올바른 기준 적용: middle-left.R=0 + middle-right.L=0이 정상. 보더 원복 16개 실측 + 조립예시 6개 렌더 대조 통과 |

---

# 4단계 검증 결과 — Multi Toggle v2 (효율 구조)

**검증자:** 🤖 component-verifier (figma-library-build §(C))
**검증일:** 2026-06-25
**대상 세트:** `603:20` (Multi Toggle v2, 파일 `cysG5U1udpQqVagYY1hWHW` / 페이지 `302:19291`)
**계획서:** `reports/figma-library-build/multi-toggle/2-plan-v2.md`

---

## 검증 요약

| 항목 | 결과 | 비고 |
|------|------|------|
| variant 개수 (8개) | ✅ | state(4) × size(2) = 8, 누락/중복 없음 |
| variant 이름 형식 | ✅ | `state=X, size=Y` 정규 형식 |
| position 축 없음 | ✅ | 8개 전부 state/size 축만 |
| 패킹 bounds | ✅ | w=320, h=126 — 붕괴 없음 |
| 토큰 바인딩 raw hex | ✅ | 0건 — 전 fill/stroke/text 색 Variable 바인딩 완료 |
| 토큰 경로 정확성 | ✅ | 12종 경로 계획서 매핑과 1:1 일치 |
| 폰트 일관성 | ✅ | 전 8 TEXT 노드: Pretendard, 비-Pretendard 0건 |
| 보더 구조 — selected 4변 | ✅ | strokeTop/Right/Bottom/Left 전부 1px |
| 보더 구조 — 미선택 왼쪽만 여부 | ❓(c) | 4변 모두 1px — 계획서 "왼쪽만" 규격과 다름(단 조립 덮기 렌더는 시각 정상) |
| 조립예시 틀 속성 (clipsContent, cornerRadius) | ✅ | clipsContent=true, cornerRadius=4, 틀 stroke 바인딩 ✅ |
| 조립 렌더 — 선택 셀 덮기 효과 | ✅ | selected 인접면 회색선 없음, 6개 예시 전수 확인 |
| 조립 렌더 — 나머지 경계 1px | ✅ | 6개 예시 모두 경계선 명확 |
| v1 세트 587:8029 무결성 | ✅ | 변형 32개 보존, 대표 2종 바인딩 raw hex 0건 |

---

## ❌ (a) 코드 실수 — 수정 대상

없음.

---

## 🟡 (b) 의도적 개선

없음.

---

## ❓ (c) 확인 요청 — 사용자 판단 필요

- ❓ **미선택 칸(default·hover·disabled) 보더 방향 — 계획서 "왼쪽만" vs 구현 "4변 모두 1px"**

  계획서(2-plan-v2.md)는 미선택 칸의 보더를 "왼쪽 보더 1px만(strokeLeft=1, top/right/bottom=0)"으로 명시했습니다. 실제 구현은 strokeTopWeight=strokeRightWeight=strokeBottomWeight=strokeLeftWeight=1 (4변 모두 1px)입니다.

  조립 예시 렌더에서는 틀(clipsContent=true)이 상/하/좌우 바깥 테두리를 담당하고, 선택 칸이 -1px 절대위치로 양옆 회색선을 덮으므로 시각 결과는 계획서 의도와 동일하게 보입니다.

  그러나 칸 컴포넌트 단독으로 봤을 때(틀 없이) 4변이 모두 보이는 점이 계획서 규격과 다릅니다. v1은 position별로 각각 3변 보더 구조였습니다.

  **선택지:**
  - (A) 계획서대로 수정: 미선택 = strokeLeft=1, strokeTop/Right/Bottom=0. 칸이 단독으로도 "왼쪽만" 구분선 역할을 명확히 함.
  - (B) 현재 유지: 4변 1px. 조립 시 틀이 바깥을 잘라줘 시각 결과 동일. 변형세트 단순(position 축 없음).

  안 정하면 현재(B) 상태 유지.

---

## 🔒 BLOCKED

없음.

---

## 토큰 바인딩 스캔 결과 (use_figma 사실 추출 + figma-binding-lookup 역매핑)

- 스캔 노드: `603:20` (v2 세트) + 조립예시 6개 · 총 노드 17(세트)+7×6(조립) · 미바인딩 **0건** · 고유 hex **0종**

| hex 값 | 노드·속성 | 역매핑 | 허용편차 명시? | 판정 |
|--------|-----------|--------|--------------|------|
| (없음) | — | — | — | ✅ 미바인딩 raw hex 없음 |

**결론: raw hex 잔류 0건. figma-binding-lookup.js 대상 hex 없음(역매핑 대상 없음). 토큰 바인딩 완전.**

---

## 변수 바인딩 경로 검증 (계획서 대조)

| 변형 ID | 변형 이름 | fill Variable | stroke Variable | text Variable | 판정 |
|---------|----------|--------------|----------------|---------------|------|
| 602:20 | state=default, size=md | `color/button/bg/secondary--default` | `color/button/border/secondary--default` | `color/button/label/secondary--default` | ✅ |
| 602:22 | state=hover, size=md | `color/button/bg/secondary--hover` | `color/button/border/secondary--hover` | `color/button/label/secondary--hover` | ✅ |
| 602:24 | state=selected, size=md | `color/button/bg/primary--default` | `color/button/border/primary--default` | `color/button/label/primary--default` | ✅ |
| 602:26 | state=disabled, size=md | `color/button/bg/disabled` | `color/button/border/disabled` | `color/button/label/disabled` | ✅ |
| 602:28 | state=default, size=sm | `color/button/bg/secondary--default` | `color/button/border/secondary--default` | `color/button/label/secondary--default` | ✅ |
| 602:30 | state=hover, size=sm | `color/button/bg/secondary--hover` | `color/button/border/secondary--hover` | `color/button/label/secondary--hover` | ✅ |
| 602:32 | state=selected, size=sm | `color/button/bg/primary--default` | `color/button/border/primary--default` | `color/button/label/primary--default` | ✅ |
| 602:34 | state=disabled, size=sm | `color/button/bg/disabled` | `color/button/border/disabled` | `color/button/label/disabled` | ✅ |

**8/8 변형 전부 계획서 매핑과 일치.**

---

## 폰트 일관성 스캔 결과 (figma-font-scan.md 절차)

| 항목 | 결과 |
|------|------|
| 스캔 세트 | `603:20` (Multi Toggle v2) |
| 스캔 TEXT 노드 수 | 8개 (variant당 1개 "항목" 텍스트) |
| 비-Pretendard family 건수 | **0건** |
| 판정 | ✅ PASS(전 텍스트 Pretendard) |

---

## 보더 구조 상세 (8 variant 전수)

| 변형 ID | 변형 이름 | top | right | bottom | left | align | 계획서 기대 | 판정 |
|---------|----------|-----|-------|--------|------|-------|------------|------|
| 602:20 | default, md | 1 | 1 | 1 | 1 | INSIDE | 미선택=left만 | ❓(c) |
| 602:22 | hover, md | 1 | 1 | 1 | 1 | INSIDE | 미선택=left만 | ❓(c) |
| 602:24 | selected, md | 1 | 1 | 1 | 1 | INSIDE | 4변 1px ✅ | ✅ |
| 602:26 | disabled, md | 1 | 1 | 1 | 1 | INSIDE | 미선택=left만 | ❓(c) |
| 602:28 | default, sm | 1 | 1 | 1 | 1 | INSIDE | 미선택=left만 | ❓(c) |
| 602:30 | hover, sm | 1 | 1 | 1 | 1 | INSIDE | 미선택=left만 | ❓(c) |
| 602:32 | selected, sm | 1 | 1 | 1 | 1 | INSIDE | 4변 1px ✅ | ✅ |
| 602:34 | disabled, sm | 1 | 1 | 1 | 1 | INSIDE | 미선택=left만 | ❓(c) |

비고: selected 2개는 계획서와 일치(4변 모두 1). 미선택 6개는 계획서("왼쪽만")와 다르나 조립 렌더 시각은 의도와 동일.

---

## 조립예시 렌더 (get_screenshot 6개 전수)

### 틀(컨테이너 프레임) 속성

| 속성 | 실측값 | 계획서 기대 | 판정 |
|------|--------|-----------|------|
| clipsContent | true | true | ✅ |
| cornerRadius | 4 | radius/control/sm(4) | ✅ |
| 틀 stroke 바인딩 | `color/button/border/secondary--default` | 계획서 일치 | ✅ |
| 틀 stroke 방향 | 4변 1px INSIDE | 바깥 테두리 1px | ✅ |

### 선택 칸 절대위치 (덮기 구현)

| 조립예시 | 선택 칸 x | y | w | h | 덮기(-1px) |
|---------|---------|---|---|---|------------|
| md left-selected (604:20) | -1 | -1 | 66 | 46 | ✅ (66=64+2, 46=44+2) |
| md center-selected (604:27) | 63 | -1 | 66 | 46 | ✅ |
| md right-selected (604:34) | 127 | -1 | 66 | 46 | ✅ |
| sm left-selected (604:41) | -1 | -1 | 58 | 36 | ✅ (58=56+2, 36=34+2) |
| sm center-selected (604:48) | 55 | -1 | 58 | 36 | ✅ |
| sm right-selected (604:55) | 111 | -1 | 58 | 36 | ✅ |

### 시각 렌더 결과

| 조립예시 | 선택 위치 | 선택 인접면 회색선 | 나머지 경계 | 판정 |
|---------|----------|-----------------|-----------|------|
| md / left-selected | 첫 번째 | 없음 ✅ | 1px 명확 ✅ | ✅ |
| md / center-selected | 가운데 | 좌우 모두 없음 ✅ | 1px 명확 ✅ | ✅ |
| md / right-selected | 마지막 | 없음 ✅ | 1px 명확 ✅ | ✅ |
| sm / left-selected | 첫 번째 | 없음 ✅ | 1px 명확 ✅ | ✅ |
| sm / center-selected | 가운데 | 좌우 모두 없음 ✅ | 1px 명확 ✅ | ✅ |
| sm / right-selected | 마지막 | 없음 ✅ | 1px 명확 ✅ | ✅ |

**6/6 정상 렌더 확인.**

---

## v1 세트 무결성 확인

| 항목 | 결과 |
|------|------|
| v1 세트 ID | `587:8029` (Multi Toggle) |
| 변형 수 | **32개** (4 position × 4 state × 2 size) — 보존 ✅ |
| 대표 표본 바인딩 (586:2 first/default/md) | raw hex 0건 ✅ |
| 대표 표본 바인딩 (587:46 last/selected/sm) | raw hex 0건 ✅ |
| v2 빌드로 인한 변경 여부 | 없음 ✅ |

---

## 최종 판정

| 종류 | 건수 | 내용 |
|------|------|------|
| ❌(a) 코드 실수 | **0건** | — |
| 🟡(b) 의도적 개선 | 0건 | — |
| ❓(c) 확인 요청 | **1건** | 미선택 칸 보더 방향(계획서 "왼쪽만" vs 구현 "4변 1px") |
| 🔒 BLOCKED | 0건 | — |

**→ ❌(a) 0건 · ❓(c) 1건 — HOLD. 사용자 확인 대기.**

---

## v2 검증 이력

| 검증 회차 | 일시 | 결과 | 비고 |
|----------|------|------|------|
| 1차 | 2026-06-25 | HOLD (❓1건) | 미선택 칸 보더 "4변 모두 1px" vs 계획서 "왼쪽만" — 조립 덮기 렌더는 시각 정상, 컴포넌트 단독 구조 불일치 |
