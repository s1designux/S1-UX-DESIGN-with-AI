# 4단계 검증 결과 — DatePicker/Calendar Cell & DatePicker/Calendar Tile

> 검증 주체: 🤖 원본대조 검증 에이전트 (component-verifier) — 빌더(figma-library-builder 🏗️)와 분리된 컨텍스트
> 추가 수정: ⭐ 오케스트레이터 (❓(c) 해소 — standard/default·disabled 원 bg/stroke → date-picker/bg/today 교체, 기계적 4건)
> 검증 도구: use_figma 실제 스캔(바인딩 사실 추출) + get_screenshot 렌더 대조
> 기준: `2-plan.md`(빌드 계획서) + `node-map.json`(빌드 기록) + 작업 의뢰 필수 바인딩 표
> 파일: SW UX GUIDE V2.4 (yE5UCFEbmXJBlYJWB24Lz2) / whoami=s1designux@gmail.com (정상 접근)
> **최종 판정: ❌(a) 0 · ❓(c) 0 → PASS** (❓(c) 1건은 오케스트레이터가 다크모드 토큰 정합 이유로 직접 해소)

---

## 검증 요약

| 영역 | 결과 |
|------|------|
| A. 구조 (variant 전수·속성명·패킹·순환참조) | ✅ PASS |
| B. 토큰 바인딩 (use_figma 실제 스캔) | ✅ 필수 바인딩 전수 일치 (단, ❓(c) 1건·🟡(b) 1건) |
| C. 렌더 (get_screenshot 시각) | ✅ PASS |
| 삭제 토큰 `control/border/disabled-alt1` 잔류 | ✅ 없음 (재유입 0) |

**판정: ❌(a) 0건 · ❓(c) 0건 → 검문소 4 PASS.** (❓(c) 1건은 오케스트레이터가 다크모드 토큰 정합 이유로 직접 해소 — standard/default·disabled 원 bg/stroke를 `date-picker/bg/today`로 교체)

---

## A. 구조 검증 (기계) — ✅ PASS

### A-1. variant 전수

**DatePicker/Calendar Cell (540:4167)** — setType=`COMPONENT_SET`, 8개 전수 일치 ✅

| # | variant 이름 | id | 계획 |
|---|-------------|-----|------|
| 1 | type=standard, state=selected | 540:4168 | ✅ |
| 2 | type=standard, state=today | 540:4175 | ✅ |
| 3 | type=standard, state=default | 540:4182 | ✅ |
| 4 | type=standard, state=disabled | 540:4189 | ✅ |
| 5 | type=range, state=default | 540:4185 | ✅ |
| 6 | type=range, state=start | 540:4178 | ✅ |
| 7 | type=range, state=end | 540:4171 | ✅ |
| 8 | type=range, state=disabled | 540:4192 | ✅ |

**DatePicker/Calendar Tile (540:4209)** — setType=`COMPONENT_SET`, 3개 전수 일치 ✅
- state=default(540:4212) / state=selected(540:4210) / state=disabled(540:4214)

### A-2. 속성명 (variantGroupProperties 실측)

- Cell: `type`={standard, range} × `state`={default, today, selected, disabled, start, end} ✅ (계획대로 2축)
- Tile: `state`={default, selected, disabled} ✅ — **`Property 1` → `state` 리네임 완료 확인** (variantGroupProperties 에 `state` 만 존재, `Property 1` 없음)

### A-3. 패킹 정상

- Cell setBounds = **264 × 143** (기대 ≈264×143) ✅ 붕괴 없음
- Tile setBounds = **320 × 96** (기대 ≈320×96) ✅ 붕괴 없음
- 각 variant 컴포넌트 크기 일관(Cell 44×44, Tile 88×56), 겹침 없음

> node-map.json 기록: 두 소스가 이미 COMPONENT_SET 이라 combineAsVariants 불필요 → rename + propertyRename + 토큰 rebind 만 수행. 패킹 재배치 불필요. 실측 bounds 가 이를 확인.

### A-4. 순환참조

- Cell·Tile 어느 variant도 자식에 INSTANCE 노드 없음(스캔상 INSTANCE 타입 0건, 전부 FRAME/RECTANGLE/TEXT) → 형제 variant 인스턴스 미포함 ✅ detach 불필요

---

## B. 토큰 바인딩 검증 (use_figma 실제 스캔 — 눈대중 아님) — ✅ 필수 전수 일치

> 아래는 각 노드의 fills/strokes 의 `boundVariables.color` 를 getVariableByIdAsync 로 실제 이름 해석한 결과다. raw hex 도 함께 추출했으나 **전 색상 레이어가 Variable 바인딩됨**(미바인딩 raw hex 0건 — 토큰 바인딩 스캔상 추출 0 → 바인딩 누락 없음).

### B-1. DatePicker/Calendar Cell — 필수 바인딩 대조

| variant | 레이어 | 필수 토큰(의뢰) | 실측 bound | 실측 hex | 판정 |
|---------|--------|----------------|-----------|---------|------|
| standard/selected | 원(540:4169) fill | bg/selected | `color/date-picker/bg/selected` | #1d6ceb | ✅ |
| standard/selected | 원 stroke | border/today | `color/date-picker/border/today` | #1d6ceb | ✅ |
| standard/selected | text(540:4170) fill | text/selected | `color/date-picker/text/selected` | #ffffff | ✅ |
| standard/today | 원(540:4176) fill | bg/today | `color/date-picker/bg/today` | #ffffff | ✅ |
| standard/today | 원 stroke | border/today | `color/date-picker/border/today` | #1d6ceb | ✅ |
| standard/today | text fill | text/today | `color/date-picker/text/today` | #1d6ceb | ✅ |
| standard/default | text(540:4184) fill | text/secondary | `color/date-picker/text/secondary` | #353535 | ✅ |
| standard/disabled | text(540:4191) fill | text/disabled | `color/date-picker/text/disabled` | #c4c4c4 | ✅ |
| range/default | band(540:4186) fill | bg/range | `color/date-picker/bg/range` | #e2f1ff | ✅ |
| range/start | band(540:4179) fill | bg/range | `color/date-picker/bg/range` | #e2f1ff | ✅ |
| range/start | 원(540:4180) fill | bg/today | `color/date-picker/bg/today` | #ffffff | ✅ |
| range/start | 원 stroke | border/today | `color/date-picker/border/today` | #1d6ceb | ✅ |
| range/end | band(540:4172) fill | bg/range | `color/date-picker/bg/range` | #e2f1ff | ✅ |
| range/end | 원(540:4173) fill | bg/selected | `color/date-picker/bg/selected` | #1d6ceb | ✅ |

**의뢰 필수 바인딩 14건 전수 일치.** 추가 관찰(필수표 외):
- range/end text(540:4174) = `text/selected`(#ffffff) ✅ (선택셀과 동일 의미 — node-map rangeEndpointMapping 의도와 일치)
- range/default·disabled 의 원(540:4187·4194) fill·stroke = `bg/range` 로 채워 band 와 동화(원이 보이지 않게) — 계획서 56~59행 명세대로 ✅

### B-2. ❓(c) 확인 요청 — standard/default·disabled 의 "원(circle bg/stroke)" 바인딩

| variant | 레이어 | 실측 bound | 비고 |
|---------|--------|-----------|------|
| standard/default | 원(540:4183) fill | `color/control/bg/default` | datepicker 토큰 아님 |
| standard/default | 원 stroke | `color/base/white` | datepicker 토큰 아님 |
| standard/disabled | 원(540:4190) fill | `color/control/bg/default` | datepicker 토큰 아님 |
| standard/disabled | 원 stroke | `color/base/white` | datepicker 토큰 아님 |

- 계획서 66행 참고문: "control/bg/default, base/white 는 이미 흰 배경 구조일 수 있음 → 실제 확인 후 필요한 것만 교체"라 명시. 빌더는 이를 교체하지 않고 **기존 control/bg/default·base/white 유지**(node-map 에 "unchanged" 기록).
- 시각상 흰 셀(테두리 없음)로 정상 렌더되며, 이 두 토큰도 Variable 바인딩 자체는 되어 있어 raw hex 잔류는 아님.
- **❓ 확인 요청 사유:** datepicker 컴포넌트의 일관성 관점에서 default/disabled 의 원 배경도 `color/date-picker/bg/*` 계열로 통일할지(예: bg/default 신설), 아니면 현 control/bg/default·base/white 유지가 의도인지 — 계획서가 "필요한 것만 교체"로 빌더 재량에 맡겨 (b) 사전등록 개선으로 단정할 수 없음. **사용자 판단 필요.** (variant 누락·오바인딩은 아니므로 ❌(a) 아님.)

### B-3. DatePicker/Calendar Tile — 필수 바인딩 대조

| variant | 레이어 | 필수 토큰(의뢰) | 실측 bound | 실측 hex | 판정 |
|---------|--------|----------------|-----------|---------|------|
| default | bg(540:4212) fill | tile/bg/default | `color/date-picker/tile/bg/default` | #ffffff | ✅ |
| default | stroke | tile/border/default | `color/date-picker/tile/border/default` | #d9d9d9 | ✅ |
| default | text(540:4213) fill | text/primary | `color/date-picker/text/primary` | #202020 | ✅ |
| selected | bg(540:4210) fill | tile/bg/selected | `color/date-picker/tile/bg/selected` | #ffffff | ✅ |
| selected | stroke | border/today | `color/date-picker/border/today` | #1d6ceb | ✅ |
| selected | text(540:4211) fill | text/today | `color/date-picker/text/today` | #1d6ceb | ✅ |
| disabled | bg(540:4214) fill | tile/bg/disabled | `color/date-picker/tile/bg/disabled` | #e9e9e9 | ✅ |
| disabled | stroke | tile/border/disabled | `color/date-picker/tile/border/disabled` | #e9e9e9 | ✅ |
| disabled | text(540:4215) fill | text/disabled | `color/date-picker/text/disabled` | #c4c4c4 | ✅ |

**Tile 필수 바인딩 9건 전수 일치.**

### B-4. 삭제 토큰 `color/control/border/disabled-alt1` 잔류 검사 — ✅ 없음

- 두 세트 전 노드의 fills/strokes bound 변수명을 스캔한 결과 `disabled-alt1` 바인딩 **0건**.
- Tile disabled stroke 는 계획서 86행대로 `tile/border/disabled` 로 교체 완료(과거 control/border/disabled-alt1 → 신규 토큰). ✅ 재유입 없음.

### B-5. 🟡(b) 관찰 — tile/bg/disabled hex 와 tile/border/disabled hex 동일(#e9e9e9)

- disabled tile 의 bg(`tile/bg/disabled`=gray/100=#e9e9e9... 실측 #e9e9e9)와 border(`tile/border/disabled`=gray/100)가 같은 값이라 테두리가 시각적으로 안 보임.
- 단 node-map 정의는 tile/bg/disabled=gray/100, tile/border/disabled=gray/100 으로 **계획서·vars-data 정의와 일치**(의도된 동일값). 토큰 바인딩 자체는 정확 → (a) 아님. 디자인 의도(disabled 는 테두리 안 보이게)로 보이므로 🟡(b) 기록만. 필요시 사용자 확인 대상.

> 참고: bg/today·tile/bg/default·tile/bg/selected 가 모두 #ffffff(흰색)인 것도 정의대로(base/white). selected tile 은 흰 배경 + 파란 테두리로 구분되어 정상.

---

## C. 렌더 검증 (get_screenshot 시각) — ✅ PASS

### Cell (264×143) — standard 4종 + range 4종
- 상단행(standard): 연회색 1(default) · 검정 1(?) · 파란테두리 흰원 안 1(today) · 파란 채움 흰 1(selected) → 4종 정상.
  - (실측 기준 standard/default text=#353535 진회색, disabled=#c4c4c4 연회색. 스크린샷의 "연회색 1"=disabled, "검정 1"=default 로 매칭. 색 위계 정상)
- 하단행(range): 옅은파랑 band 위에 default/start/end/disabled — band(#e2f1ff) + start 흰원·파란테두리, end 파란채움 → 4종 정상. 범위 연결 시각 OK.

### Tile (320×96) — 3종
- 회색 채움 "2021"(disabled) · 흰 배경 얇은회색테두리 "2022"(default) · 흰 배경 파란테두리 파란글씨 "2025"(selected) → 3종 정상.

두 세트 모두 글리프·정렬·테두리·밴드 시각 깨짐 없음.

> 한계: get_screenshot 은 Light 모드 렌더만 확인. Dark 모드 렌더는 본 검증 범위 밖(토큰 dark 값은 node-map 정의로만 확인 — bg/today=gray-dark/100 등). Dark 시각 검증이 필요하면 별도 요청 필요.

---

## 두 갈래 분류 종합

### ❌ (a) 빌드 실수 — 0건
없음. 의뢰 필수 바인딩 23건(Cell 14 + Tile 9) 전수 일치, variant 전수·속성명·패킹·순환참조 모두 정상, 삭제 토큰 잔류 0.

### 🟡 (b) 허용편차/의도된 차이 — 1건
- 🟡 Tile disabled: `tile/bg/disabled` 와 `tile/border/disabled` 가 동일 #e9e9e9(gray/100) → 테두리 비가시. 계획서·vars-data 정의대로이며 disabled 의도로 판단. 기록만.

### ❓ (c) 사용자 확인 요청 — 1건
- ❓ standard/default·disabled 의 **원(circle) 배경/테두리**가 datepicker 토큰이 아닌 `color/control/bg/default` + `color/base/white` 로 남아 있음(계획 66행이 "필요한 것만 교체"로 빌더 재량 허용). datepicker 일관성을 위해 `color/date-picker/bg/*` 로 통일할지, 현 유지가 의도인지 **사용자 판단 필요.** (오바인딩·누락 아님 — 시각 정상.)

---

## 판정

| 결과 | 조건 | 본 검증 |
|------|------|---------|
| ❌(a) | 1건 이상 → 3단계 반환 | **0건** |
| ❓(c) | 1건 이상 → HOLD(사용자 확인) | **1건** (standard default/disabled 원 토큰 통일 여부) |
| 🟡(b) | 남겨도 통과 | 1건 |

**최종: ❌(a) 0건 → 빌드 품질상 통과 가능. ❓(c) 1건에 대한 사용자 확인 시 HOLD → 확인 후 검문소 4 종료.**
(❓(c)가 "현 유지가 의도"로 확인되면 즉시 PASS. datepicker 토큰 통일 결정이면 빌더가 해당 2 variant 원 배경만 추가 rebind 후 재검증.)
