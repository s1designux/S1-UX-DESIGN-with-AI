# Time Picker Mobile Bottom Sheet — 4단계 검증 (component-verifier 🤖 독립)

> figma-library-build §(C) 라이브러리 빌드 검증. 빌더(figma-library-builder)와 분리된 독립 검증 — 빌더 자체보고를 신뢰하지 않고 use_figma/get_screenshot 으로 전량 재확인.
> 대상: 세트 `920:9267` "Time Picker Mobile Bottom Sheet" (TimeOnly `918:6250` / DateTime `919:9264`), Spec Dark `922:6262`, 신규 토큰 `color/overlay/wheel-fade`(916:2).
> 파일 `cysG5U1udpQqVagYY1hWHW`, 페이지 `5:5706`(Core). MCP probe(whoami) OK.

## 대조 요약
| # | 항목 | 결과 |
|---|------|------|
| 1 | variant 전수·속성 | ✅ TimeOnly/DateTime 2개, 축=Content. 제목 "시간 선택"/"시작 일시" 원본 대응 |
| 2 | 패킹 | ✅ 세트 880×608, variant x=40/480, 붕괴 없음 |
| 3 | 토큰 바인딩 (SOLID) | ✅ 미바인딩 raw hex 0건 (60노드 스캔) |
| 4 | 폰트 스캔 | ❌/❓ 휠 22셀 Noto Sans KR·boundStyle=(none) — 아래 F-1 |
| 5 | 순환참조 | ✅ 0건 |
| 6 | 원본 구조 대조 | ✅ 헤더/탭/4컬럼 휠(11셀)/버튼 일치 |
| 7 | 허용편차 | ✅ #1 탭 Medium 유지·#2 탭 32px 표준 확인 |
| 8 | 신규 토큰 wheel-fade | ✅ Light=base/white·Dark=gray-dark/100 alias, 다크 흰색 누출 없음 |
| 9 | 렌더 대조 | ✅ fade 효과(위/아래 흐림) 라이트·다크 정상 |
| 10 | 배치 | ✅ 기존 콘텐츠와 겹침 없음(신규 y=2858, Cell bottom=2794) |

## 상세 근거

### 토큰 바인딩 스캔 (use_figma 사실 추출 + 변수명 대조)
- 스캔 노드 920:9267 · 총 60노드 · 미바인딩 SOLID 0건 · 고유 raw hex 0종.
- 바인딩 변수명 = 계획(2-plan 4절) 정확 일치:
  - 시트 fill `color/surface/raised`(820:190) / 제목 `color/text/title/primary` / 닫기 Vector `color/icon/gray-dark`
  - 휠 11셀 전부 `color/text/state/accent`(8:1119) / fade-fill 2장 `color/overlay/wheel-fade`(916:2)
  - 적용버튼 `button/bg·border·label/primary--default` / 탭 `navigation/label·indicator/default·selected` / 세트배경 `color/bg/level-3`
- **fade 흰 그라디언트 = isMask=true RECTANGLE 4장(919:6255/6258/9285/9288)** — 표시색이 아닌 구조적 alpha 마스크. 표시색은 하위 SOLID fade-fill(wheel-fade 바인딩). → hex 규칙 대상 아님, EXACT 0건.

| hex | 노드·속성 | 역매핑 | 판정 |
|-----|-----------|--------|------|
| (없음) | — | 전량 Variable 바인딩 | ✅ 통과 |

### 폰트 스캔 (데이터, 렌더 금지)
- 세트 텍스트 28개 · 비-Pretendard **22개** · verdict=**FAIL**.
- Pretendard(스타일 바인딩): 제목 title/20B(2), 탭 라벨 body/16M(2), 적용 body/16M(2). ✅
- **Noto Sans KR Regular, boundStyle=(none): 휠 셀 22개(variant당 11: 오전·오후·7·8·9·:·:·:·59·00·01).**

### 인스턴스 출처(provenance) 검사
| 인스턴스 | remote | key | 판정 |
|---------|--------|-----|------|
| close | true | 2a1abbd…9934 | ✅ 허용목록 `close` |
| apply-button | false(로컬) | Button 세트 | ✅ |
| Line Tab ×2 | false(로컬) | Line Tab 세트 | ✅ |
- 자기 세트 참조(selfRef) 0 → 순환참조 없음.

### 렌더 (get_screenshot)
- TimeOnly/DateTime(라이트): 중앙행 진한 accent, 위·아래행 흰색으로 흐려짐 ✅. 탭 "시간" selected(파랑 밑줄) ✅.
- Spec Dark: 시트 어두운 표면, 위·아래행이 **흰색이 아니라 어두운 표면색으로 자연스럽게 흐려짐**(흰 오버레이 뜸 없음) ✅.
- (폰트는 Pretendard 미설치라 대체글리프로 렌더됨 — 정책상 렌더로 폰트 판정 안 함, 데이터 스캔으로 확인.)

---

## ❌(a) 코드/빌드 실수
- (없음)

## ❓(c) 확인 요청 — 사용자 판단 필요

**F-1 [폰트] 휠 32px 텍스트 22셀이 Noto Sans KR·텍스트스타일 미바인딩(boundStyle=(none)).**
- figma-font-scan.md 이진 규칙상 verdict=**FAIL**(비-Pretendard 1건이라도 ❌). 2-plan 6절 허용편차 선언서에 폰트 항목 **미명시**(선언은 #1 탭굵기·#2 탭높이 2건뿐) → (b) 임의 처리 불가.
- 근본 원인 2가지가 겹침: ①이 PC에 Pretendard 미설치(로드 불가) ②휠은 Regular 32인데 대응 텍스트 스타일 부재(title/32B는 Bold) → `setTextStyleIdAsync` 재바인딩 대상이 없음. figma-font-scan.md는 "매칭 스타일 없으면 needs-decision"으로 규정.
- 빌더는 `figma-font-temp` 마커로 임시입력했다고 자체보고했으나, **마커는 실행 완료된 use_figma 코드(ephemeral)라 독립 확인 불가.** 확인 가능한 최종 데이터는 "raw Noto·스타일 미바인딩"으로, 다음 편집 시 재파손 위험.
- 결정 필요: (A) Pretendard 설치 환경에서 재입력 + 휠용 텍스트 스타일(예: `body/32` Regular) 신규 생성 후 바인딩 (B) 임시 인지 상태로 두고 후속 재검증 예약. **안 정하면 휠 폰트가 정본(Pretendard) 미보장 상태로 남음.**

**F-2 [구조·경미] 휠 gap 구조 = 4컬럼 평탄·gap36.**
- node-map allowedDeviations #3에 "원본은 ampm↔group 36 / group 내부 32 중첩, 빌드는 평탄 4컬럼(4px 차)"로 자체선언. 2-plan 6절 정식 선언서에는 없으나 **2-plan 3절 본문이 평탄 4컬럼 구조를 명시적으로 설계**(검문소2 승인)했으므로 계획 준수. 렌더상 정렬 자연스러움. → 경미, 계획 근거 있음. 사용자 인지만 요청.

## 🟡(b) 허용편차 (계획서 선언 확인)
- #1 탭 Selected 라벨 = Pretendard **Medium**(body/16M) 확인 — 원본 Bold 아님, 2-plan 6절 #1 선언대로 ✅.
- #2 탭 = Line Tab Mobile/SM 표준(리사이즈 없음) — 2-plan 6절 #2 선언대로 ✅.

## 후속(빌더 범위 밖, 별도 처리)
- 신규 토큰 `color/overlay/wheel-fade` 를 `vars-data.ts`·`semantic.colors.json`에 반영(2-plan 8절). 미반영 시 Gate 6/7 대상.

---

## 판정 (최종, 2026-07-07)
- ❌(a) 0건 · 🟡(b) 3건(허용편차 #1·#2 + F-1 아래 확정) · F-2 계획 근거 있음(인지) · BLOCKED 0건.
- **PASS (F-1 보류 항목 명시)** — 사용자 확인: MCP 폰트 환경이 재시도 후에도 Pretendard 미인식(`listAvailableFontsAsync` 0건) 확인됨(2026-07-07 재시도 결과, 원인=Figma 데스크톱 앱이 새 폰트 미인식 추정). **사용자 결정: 지금은 임시 상태(Noto + figma-font-temp 마커)로 완료 처리, 폰트만 나중에 별도로 교체.**
- **잔여 작업(미결, 별도 처리 예정):** 휠 텍스트 22칸(TimeOnly 11 + DateTime 11) 폰트를 Pretendard Regular 32(신규 텍스트 스타일 필요)로 교체 — Figma 데스크톱 앱이 새로 설치된 Pretendard를 인식하게 된 후(재시작 등) 재시도. 재시도 시 폰트 스캔만 재실행하면 됨(다른 항목은 이미 전부 ✅로 안정).

---

## 재검증 (사용자 지적 2건 수정 후, 2026-07-07, component-verifier 🤖 독립)

> 빌더 자체보고 불신·get_screenshot 실제 렌더 + use_figma 데이터 스캔으로 전량 재확인. 원본 대조 기준: `yE5UCFEbmXJBlYJWB24Lz2` 540:3760(시간 선택)·540:3730(시작 일시).

### 1. 오전/오후 세로 정렬 — ✅ 해결
- 원본(540:3760/540:3730)·빌드(918:6250/919:9264) 렌더 나란히 대조: **"오전"이 맨 위(흐린) 숫자줄, "오후"가 가운데(선택강조) 숫자줄과 동일 높이로 정렬**됨. TimeOnly·DateTime 둘 다 일치.
- 구조 확인: `ampmCol`(918:9262/919:9269) 3슬롯(59×190) = [오전 / 오후 / `ampm-slot-empty`(2×42, 자식0·fill없음)]. 하단 슬롯 비움으로 오전=top·오후=mid 정렬 유지 — 원본과 동일 배치.

### 2. 흐림 대비 — ✅ 해결
- Light(918:6250/919:9264)·Dark(922:6262) 모두 **가운데 줄 또렷(진한 accent), 바로 위/아래 줄 강하게 흐려짐**. 원본 수준의 고대비 재현. Dark는 위/아래 줄이 어두운 표면색으로 자연 흐림(흰 누출 없음).

### 3. 회귀 확인 — ✅ 이상 없음 (use_figma 데이터 스캔)
- 패킹: 세트 880×608 유지(x=64,y=2858), variant TimeOnly 360×462·DateTime 360×528 — bounds 붕괴 없음.
- 토큰 바인딩: 세트 전 노드 raw hex **0건**(신규 3슬롯 구조·빈 슬롯 프레임·마스크에 raw hex 유입 없음).
- 순환참조: selfRef **0건**.

### 4. 폰트 상태 불변 — ✅ 확인 (건드리지 않음)
- 텍스트 28개 · Pretendard 6 · **Noto Sans KR 22** — F-1 보류 상태 그대로. 이번 수정이 휠 폰트를 건드리지 않음(의도대로).

### 재검증 판정
- ❌(a) 0건 · ❓(c) 0건 · 🟡(b) 신규 0건. 정렬·대비 2건 모두 실제 해결됨(렌더 대조 확인). 회귀 없음. F-1(폰트)은 기존 보류 그대로 유지.

---

## 재검증 #2 — fade 그라디언트 "세다" 2차 지적 수정 후 (2026-07-07, component-verifier 🤖 독립)

> 빌더 자체보고 불신. use_figma 로 4개 마스크 gradientStops·gradientTransform 직접 재조회 + 좌표 계산으로 반전 매핑 수학 검증 + get_screenshot 원본 대조.

### 1. 실제 gradientStops (use_figma 직접 읽기 — 빌더 보고와 일치 확인)
| 마스크 노드 | 부모 | stops (pos:alpha) | 빌더보고 일치 |
|-------------|------|-------------------|--------------|
| 919:6255 / 919:9285 (fade-top) | fade-top | 0:0.9 · 0.25:0.9 · 0.65:0.7 · 1:0.0 | ✅ 일치 |
| 919:6258 / 919:9288 (fade-bottom) | fade-bottom | 0:0.0 · 0.35:0.7 · 0.75:0.9 · 1:0.9 | ✅ 일치 |
- 4장 전부 `gradientTransform = [[0,1,0],[-1,0,1]]` → 위치 t = y (pos0=상단 모서리, pos1=하단 모서리). isMask=true, 360×110.

### 2. 반전 매핑 수학 검증 — ✅ 정확
- **컨테이너 배치 확인**(use_figma): wheelWrap 안에서 fade-top y=0~110(중앙선 위/시트 바깥쪽=상단), fade-bottom y=176~286(중앙선 아래/시트 바깥쪽=하단). 중앙 선택줄은 두 밴드 사이(~y143).
- **아래 마스크(fade-bottom, t=y)**: t=0=상단=중앙쪽=0.0(투명) → t=1=하단=시트바깥=0.9(최대). 원본 곡선(중앙0→바깥: 0, 0.35→0.7, 0.75→0.9, →0.9)과 **숫자·방향 EXACT 동일**. ✅
- **위 마스크(fade-top, t=y)**: t=0=상단=시트바깥=0.9(최대) → t=1=하단=중앙쪽=0.0(투명). 원본을 거리 반전(d=1−t)해 좌표 환산 시 t=0→0.9, t=0.25→0.9, t=0.65→0.7, t=1.0→0.0 이어야 함 → 빌드값 `[{0:0.9},{0.25:0.9},{0.65:0.7},{1:0.0}]` 과 **네 점 모두 정확히 일치**. 반전 매핑 수학적으로 **완전 정확**(작업지시 예상 계산과도 동일). ✅

### 3. 렌더 대조 (get_screenshot, 원본 540:3760/540:3730 대비)
- TimeOnly(918:6250)·DateTime(919:9264) 라이트: 가운데줄 진한 파랑, 위/아래줄(오전 7:59 / 9:01) 흐리게 — **원본과 거의 동일 수준으로 읽힘**. 이전 "세다"(과도한 흰 오버레이) 느낌 **해소**. 오히려 흐린 줄이 원본보다 아주 약간 더 또렷(과교정 방향이 아니라 안전측), 시각 매칭 양호.
- Dark(922:6262): 위/아래줄이 어두운 표면색으로 자연 흐림, 흰 누출 없음. ✅

### 4. 회귀 (use_figma 데이터 스캔)
- 패킹 세트 880×608 · variant TimeOnly 360×462 / DateTime 360×528 붕괴 없음. raw hex **0건**(74노드). selfRef **0**. 폰트 텍스트 28개 중 Noto 22 = F-1 보류 그대로(이번 수정 미영향).

### 재검증 #2 판정
- ❌(a) 0건 · ❓(c) 0건 · 🟡(b) 신규 0건. **위 마스크 반전 매핑 수학적으로 정확**(4점 EXACT), 아래 마스크 원본 EXACT, 렌더상 "세다" 해소. 회귀 없음. F-1(폰트) 기존 보류 유지.
