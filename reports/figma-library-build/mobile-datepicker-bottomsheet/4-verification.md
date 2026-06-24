# 4단계 검증 결과 — Mobile Date Picker/Bottom Sheet (§C 라이브러리 빌드 검증)

---

## 3차 검증 — 6 variant 재구성본 (2026-06-24)

**검증자:** 🤖 원본대조 검증 에이전트 (component-verifier) — 빌더와 분리된 독립 검증  
**대상 세트:** 523:7771 (`mobile_datepicker_bottomsheet`, type×state 2축 6 variant)  
**Variant IDs:** 516:4324 · 522:4537 · 516:7447 · 523:4680 · 516:7498 · 523:4738

### 대조 요약

| 항목 | 결과 |
|------|------|
| variant 전수 (6종) | ✅ 6/6 모두 존재 |
| 변형세트 패킹 | ✅ 정상 (780×1850px, 3행×2열, 붕괴 없음) |
| 인스턴스/detach 검사 | ✅ 전원 INSTANCE, detach 0 |
| raw hex 바인딩 스캔 | ✅ EXACT=0 (미바인딩 raw hex 없음) |
| 최상위 fill 토큰 | ✅ `color/date-picker/bg/panel` (VariableID:8:1088) |
| topLeft/topRight radius 바인딩 | ✅ `radius/modal/md` (VariableID:8:1196) |
| 타이틀 텍스트 색 | ✅ `color/text/title/primary` (VariableID:8:1127) |
| 텍스트 스타일 | ✅ `S:46f6df226b7078240376de6530ae592e02a48416` (title/20B) |
| Calendar State 정합 | ✅ date→State=Date / year→State=Year / month→State=Month |
| Calendar 컴포넌트 세트 | ✅ 부모=508:12181 (Calendar COMPONENT_SET), 계획서와 일치 |
| 타이틀 텍스트 정합 | ✅ date→날짜 선택 / year→연도 선택 / month→월 선택 |
| 닫기 아이콘 출처 | ✅ V2.2 remote 인스턴스 (key 2a1abbd3597b536e34fd9523fb61eade3afe9934) |
| 버튼 컴포넌트 | ✅ 508:7042 (Size=LG, Primary, Mobile) 로컬 인스턴스 |
| 버튼 라벨 | ✅ "적용" (전 6개 variant) |
| Line Tab (date_time 3개) | ✅ Selected(날짜 508:6860)/Unselected(시간 508:6854) 모두 로컬 인스턴스 |
| 순환참조 | ✅ 0건 |
| 렌더 시각 확인 | ✅ 6개 variant 전수 (§렌더 상세 참조) |

### 인스턴스 출처(provenance) 키 기반 검사

| 인스턴스 | 소스 컴포넌트 | remote | key | 판정 |
|---------|-------------|--------|-----|------|
| Calendar (state=date) | 508:11964 State=Date | false (로컬) | 84a7e0dc… | LOCAL_OK ✅ |
| Calendar (state=year) | 508:12101 State=Year | false (로컬) | 3a771f1c… | LOCAL_OK ✅ |
| Calendar (state=month) | 508:12141 State=Month | false (로컬) | 790f1a80… | LOCAL_OK ✅ |
| Button (전 6 variant) | 508:7042 LG/Primary/Mobile | false (로컬) | 8bb78cf6… | LOCAL_OK ✅ |
| Line Tab Selected (date_time) | 508:6860 SM/Selected/Mobile | false (로컬) | 9ccf6f92… | LOCAL_OK ✅ |
| Line Tab Unselected (date_time) | 508:6854 SM/Unselected/Mobile | false (로컬) | b0174f25… | LOCAL_OK ✅ |
| ic_닫기 (전 6 variant) | 516:4316 Property 1=Line | **true (V2.2 remote)** | **2a1abbd3597b536e34fd9523fb61eade3afe9934** | ✅ 계획서 명시 키 일치 |

- 외부 라이브러리 위반(remote=true & 허용목록 미등록 & 비아이콘) = **0건** ✅
- ic_닫기 key 2a1abbd3…는 계획서에 명시된 허용 키. 사용자 이전 세션에서 "허용·유지" 확정.

### 토큰 바인딩 스캔

바텀시트 **직접 생성** 노드만 스캔 (인스턴스 내부 제외):

| 속성 | 토큰 경로 | 바인딩 |
|-----|---------|--------|
| COMPONENT fill (6개) | `color/date-picker/bg/panel` | ✅ |
| topLeftRadius (6개) | `radius/modal/md` | ✅ |
| topRightRadius (6개) | `radius/modal/md` | ✅ |
| bottomLeft/Right radius | 0 (fixed int) | 🟡(b) radius=0 토큰 불필요 |
| 타이틀 TEXT fill (6개) | `color/text/title/primary` | ✅ |
| header/calendar-area/button-area fills | [] (fill 없음) | ✅ transparent |

**미바인딩 raw hex: 0건. figma-binding-lookup.js EXACT 판정 대상 없음.**

### 렌더 스크린샷 (6 variant 전수)

| variant | 크기 | 타이틀 | 탭 | 달력 | 버튼 |
|---------|------|-------|---|-----|-----|
| default, date (516:4324) | 360×501px | "날짜 선택" ✅ | 없음 ✅ | 7열 완전 ✅ | "적용" ✅ |
| date_time, date (522:4537) | 360×590px | "날짜 선택" ✅ | 날짜Selected/시간Unselected ✅ | 7열 완전 ✅ | "적용" ✅ |
| default, year (516:7447) | 360×501px | "연도 선택" ✅ | 없음 ✅ | 3×4 연도 그리드 ✅ | "적용" ✅ |
| date_time, year (523:4680) | 360×590px | "연도 선택" ✅ | 날짜Selected/시간Unselected ✅ | 3×4 연도 그리드 ✅ | "적용" ✅ |
| default, month (516:7498) | 360×501px | "월 선택" ✅ | 없음 ✅ | 3×4 월 그리드 ✅ | "적용" ✅ |
| date_time, month (523:4738) | 360×590px | "월 선택" ✅ | 날짜Selected/시간Unselected ✅ | 3×4 월 그리드 ✅ | "적용" ✅ |

### 허용 편차 🟡(b)

1. **폰트 폴백** — MCP 환경 Pretendard 로드 불가 → Noto Sans KR 폴백 (빌드 제약, 사전 등록)
2. **Calendar 내부 소관** — Calendar 컴포넌트(508:12181) 자체의 외곽 보더·날짜셀 색 등 = 재사용 컴포넌트 소관, 바텀시트 검증 범위 밖
3. **radius bottomLeft/Right=0** — fixed int 0은 토큰 불필요 (radius/0 토큰은 정본 미정의)

### ❌(a) 코드 실수 — **0건**

### ❓(c) 확인 요청 — **0건**

### 3차 판정: **PASS**

> ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 → 검문소 4 통과.
> 🟡(b) 3건은 사전 등록된 허용 편차 — 코드 유지.

---


> 검증 주체: 🤖 component-verifier (빌더 figma-library-builder 와 분리 컨텍스트)
> 대상: 컴포넌트 세트 485:7896 (V3.0 cysG5U1udpQqVagYY1hWHW · Core 페이지)
> 기준: node-map.json + 검증 지시 inline plan + provenance-scan.md(키 기반) + allowed-remote-keys.json

---

## 2차 검증 결과 (재검증 — 빌더 rework 후)

❌(a) 수: **0건**
🟡(b) 수: 1건 (허용편차 — Pretendard→Noto fallback)
❓(c) 수: 1건 (사용자 미확정 — ic_닫기 키, 단 사용자 "허용·유지" 의사 표명됨)

| 항목 | 결과 | 세부 |
|------|------|------|
| raw fill 잔류 | ✅ | 두 variant 전체 노드 순회 — 미바인딩 흰색 fill **0건**. 이전 7건(Header/Calendar Area/Button Area/Tab Bar) 모두 fills=[] 제거 또는 바인딩 상속. 현재 모든 흰색 fill은 Variable 바인딩(color/date-picker/bg/panel·bg/today·text/selected·button/label/primary--default) |
| 달력 클리핑 해소 | ✅ | Calendar Area padding 24→**0** (두 variant), Calendar 인스턴스 FILL(360px). 렌더: 7열(월~일)·‹ › 월 내비게이터·전 날짜 클리핑 없이 완전 표시 |
| 버튼 라벨 | ✅ | 두 Button 인스턴스 characters="적용" (node name 은 "버튼" 유지=라이브러리 부품명, 표시 텍스트는 적용). 텍스트스타일 S:886ca7…(button label) 유지 |
| 텍스트 스타일 | ✅ | "날짜 선택" 타이틀 2노드 textStyleId=S:46f6df…(title/20B) 바인딩됨 |
| 컨테이너 fill 바인딩 | ✅ | 두 variant 최상위 = color/date-picker/bg/panel (8:1088). radius topLeft/topRight=radius/modal/md, bottom=0 |
| 패킹 정상 | ✅ | 세트 780×592. v1(0,0,360×530)·v2(420,0,360×592). 겹침·붕괴 없음 |
| 순환참조 | ✅ | 세트 자기 variant 인스턴스 0건 (circular=[]) |

---

## 인스턴스 출처(provenance) — 키 기반 (HARD RULE)

allowed-remote-keys.json 대조. 두 variant 하위 전체 INSTANCE 순회.

| instName | mcName | remote | key | 판정 |
|----------|--------|--------|-----|------|
| ic_닫기 (×2 헤더) | Property 1=Line | true | 2a1abbd3597b536e34fd9523fb61eade3afe9934 | 허용목록 미등록 → ❓(c) (이름 ic_*=아이콘, (a) 단정 금지) |
| chevron (Calendar 내부 ×4) | Property 1=line | true | e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581 | ICON_OK ✅ (허용목록 chevron) |
| Calendar (×2) | State=Date | false | d566f249… | LOCAL_OK ✅ |
| Calendar Cell (×다수) | Type=Standard, State=* | false | 57c8c9…/d18153…/c706f5…/34c390… | LOCAL_OK ✅ |
| Button (×2) | Size=LG,…,Primary,Mobile | false | 2a4fea26… | LOCAL_OK ✅ |
| Tab 날짜 | Size=SM,Selected,Mobile | false | 9bf3f2cc… | LOCAL_OK ✅ |
| Tab 시간 | Size=SM,Unselected,Mobile | false | 3efe2c24… | LOCAL_OK ✅ |

- 외부 라이브러리 위반(remote=true & 미등록 & 비-아이콘) = **0건**.
- ic_닫기 만 remote=true & 미등록. ic_* 아이콘 → (c). 사용자 "허용·유지" 확정(node-map 🔧5). 정식 V2.2 면 build-components.ts ICON_KEYS + allowed-remote-keys.json 에 `close: 2a1abbd3…` 추가 권장(향후 ICON_OK).

---

## 렌더 검증 (get_screenshot 시각 대조)

### ✅ Type=Default (484:4727)
- 헤더 "날짜 선택" + 우측 닫기(X) — 정상.
- 달력 7열(월~일) 완전 표시, ‹ › 월 내비게이터 양쪽 표시, 클리핑 0.
- 하단 primary 버튼 "적용" full-width 정상.

### ✅ Type=Date_time (484:7742)
- 헤더 동일 정상.
- 탭바: 날짜(Selected 파란 언더라인) / 시간(Unselected) — V2.4 구조 일치.
- 달력 완전 표시, "적용" 버튼 정상.

---

## 🟡(b) 허용편차 (사전 등록·코드 유지)
1. 폰트 폴백 — 편집 시 Noto Sans KR 일시 오버레이 후 text style 재바인딩으로 Pretendard 렌더 복원(node-map fontFallback). 타이틀 title/20B·버튼 button label 텍스트스타일 정상 바인딩. Figma 빌드 제약(MEMORY 등록).

## ❓(c) 확인 요청
1. ic_닫기(key 2a1abbd3…) — remote=true·allowed-remote-keys.json 미등록. 사용자 "허용·유지" 의사 표명됨. 정식 V2.2 아이콘이면 키 등록 시 향후 자동 ICON_OK 처리. 색은 color/text/title/primary 바인딩 정상.

---

## 판정

| 결과 | 조건 | 현재 |
|------|------|------|
| **PASS** | ❌(a) = 0 | **❌(a) 0건** → 검문소 4 통과 |

### 이전 1차 ❌(a) 8건 → 전부 해소
- ❌(a) 1~7 raw #ffffff fill 7건: 미바인딩 흰색 fill 전체 0건 확인 ✅
- ❌(a) 8 달력 클리핑: padding 0·Calendar FILL·렌더 7열 완전 표시 ✅

### ✅ 통과 항목
- variant 전수·속성·패킹·순환참조·컨테이너 fill 바인딩·radius 바인딩·raw fill 0·달력 클리핑 해소·버튼 라벨 적용·타이틀 텍스트스타일·외부라이브러리 위반 0.

> 본 검증은 직접 수정하지 않음. ❌(a) 0건으로 검문소 4 PASS. ❓(c) 1건(ic_닫기 키 등록)은 사용자가 "허용·유지" 확정한 사항으로 통과 차단 아님.
