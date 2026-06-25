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
