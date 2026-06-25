# 4단계 검증 — Line Tab (§C 라이브러리 빌드 검증)

> 검증자: 🤖 원본대조 검증 에이전트(component-verifier) — figma-library-builder와 분리된 컨텍스트.
> 대상(빌드결과): `Line Tab` 508:6863 (Core 페이지, 394×522, 9 variant) · fileKey `cysG5U1udpQqVagYY1hWHW`
> 기준(원본 정답): `tab` 540:6032 (9 variant) · fileKey `yE5UCFEbmXJBlYJWB24Lz2` (**V2.4 파일 — cross-file 직접 재측정**)
> 검증일: 2026-06-24 (이전 BLOCKED 해소: 원본이 다른 파일에 존재함을 사용자가 제공)

---

## 검증 방식 — 빌더 메모 불신, 원본 직접 재측정

1-inventory.md / 2-plan.md 표는 참고만 하고, **원본 540:6032의 9 variant를 use_figma로 직접 재서** 빌드 508과 대조했다. 기준 = "내가 재측정한 원본". 양쪽 파일에 동일 스크립트로 deep-read 실행.

variant 매핑: **MD/PC↔pc-md · SM/PC↔pc-sm · SM/Mobile↔mobile**.

---

## cross-file variant별 숫자 diff (원본 540 재측정 vs 빌드 508)

### 공통 치수·타이포·색 (전 9 variant)

| 항목 | 원본(재측정) | 빌드 508 | 판정 |
|---|---|---|---|
| 전체높이 mobile/pc-md/pc-sm | 32 / 44 / 42 | 32 / 44 / 42 | ✅ |
| 텍스트컨테이너 h (Mobile/PC) | 30 / 40 | 30 / 40 | ✅ |
| 글자 크기 MD/SM/Mobile | 20 / 16 / 16 | 20 / 16 / 16 | ✅ |
| 굵기 unsel=Medium · sel/hover/pressed=Bold | 일치 | 일치 | ✅ |
| 텍스트스타일 16M·16B·20R·20B | 일치 | 일치 | ✅ |
| 좌우 padding PC/Mobile | [4,24] / [4,16] (inline lg/sm) | [4,24] / [4,16] | ✅ |
| min-width | sizing/80 (bound) | sizing/80 (bound) | ✅ |
| root layout / 절대좌표 자식 | VERTICAL / 0 | VERTICAL / 0 | ✅ |

### 글자색 토큰 (PC≠Mobile 미선택 확인)

| variant | 원본 토큰 | 빌드 토큰 | 판정 |
|---|---|---|---|
| PC unselected | text/title/secondary #353535 | text/title/secondary #353535 | ✅ |
| Mobile unselected | navigation/label/default #555555 | navigation/label/default #555555 | ✅ |
| selected/hover/pressed | navigation/label/selected #1d6ceb | navigation/label/selected #1d6ceb | ✅ |

### 인디케이터(밑줄) — 색토큰·두께

| variant | 원본 인디케이터 | 빌드 인디케이터 | 판정 |
|---|---|---|---|
| unselected/hover/pressed (회색1px) | indicator/default #d9d9d9 1px (+흰1px) | indicator/default #d9d9d9 1px (+흰1px) | ✅ 색·두께 일치 |
| selected (파랑2px) | indicator/selected #1d6ceb 2px | indicator/selected #1d6ceb 2px | ✅ 색·두께 일치 |
| mobile pressed = 회색(파랑 아님) | indicator/default | indicator/default | ✅ |

### 9번 — 모바일 3번째 상태 = Pressed

원본 540:6057... mobile 3축 = unselected/pressed/selected. 빌드 508:6857 State property = **Pressed** ✅ (Hover 아님).

---

## ❗ cross-file 에서 새로 발견한 구조/토큰 차이 (이전 BLOCKED 검증에선 원본 부재로 못 봤던 것)

### 차이 1 — 인디케이터 "흰색 spacer line" 토큰: base/white vs navigation/background  → ❓(c)

흰색 spacer(보이지 않는, 흰 배경 위 흰 1px)의 바인딩 토큰이 갈린다:

| 빌드 variant | 빌드 흰선 토큰 | 매핑 원본 | 원본 흰선 토큰 | 일치? |
|---|---|---|---|---|
| SM/Unsel·Hover/PC | base/white | pc-sm unsel·hover | **base/white** | ✅ |
| MD/Unsel·Hover/PC | base/white | pc-md unsel·hover | **navigation/background** | ❌ 토큰 다름 |
| SM/Unsel·Pressed/Mobile | base/white | mobile unsel·pressed | **navigation/background** | ❌ 토큰 다름 |

- **원본 자체가 비일관**: pc-sm은 `color/base/white`, mobile+pc-md는 `color/navigation/background`를 흰선에 사용. 둘 다 resolved=#ffffff.
- 빌드는 9 variant 전부 `color/base/white`로 **통일**(빌더 정규화).
- 두갈래 판단: "토큰 참조 구조"는 원래 정확 대조(엄격 ❌) 대상이나, **(1) 원본이 자기모순 상태라 "정답 토큰"이 하나가 아님 (2) 대상이 흰 배경 위 흰 1px = 렌더에 절대 안 보이는 spacer (3) 빌드가 더 일관됨**. → **(a) 단정 불가, (b) 면죄도 부적절 → ❓(c) 확인 요청.**
- 사용자 선택지: (A) 원본 다수(navigation/background)에 맞춰 mobile·MD 흰선을 navigation/background로 / (B) 빌드처럼 base/white로 전 variant 통일(권장 — spacer는 base/white가 의미상 맞고 더 일관) / (C) 비가시 spacer라 무시.

### 차이 2 — 인디케이터 프레임 구조: 단일 2px rect vs 2×1px rect (pc-sm) → 🟡(b)/시각동일

- 원본 **pc-sm/selected**: 인디케이터 프레임 1개에 **단일 2px 사각형**(indicator/selected).
- 원본 **pc-sm/unsel·hover**: **2개의 분리된 프레임**(흰 1px 프레임 + 회색 1px 프레임).
- 빌드 SM/PC: 모든 상태가 **1프레임 + 2×1px rect**(흰1+색1, selected는 파랑1+파랑1=2px).
- 원본 mobile·pc-md는 이미 빌드와 같은 "1프레임 2rect" 구조.
- **총 두께·색·렌더 시각 100% 동일**(selected=파랑2px, 그외=회색1px). 빌더가 9 variant를 한 구조로 정규화한 것. 구조 노드 트리만 다르고 **측정 가능한 모든 시각 수치 일치**. → 시각 결과물 기준 문제 없음. 구조 통일은 합리적 개선 → **🟡(b)** (인디케이터 노드 구조 정규화). resolved 두께/색 diff = 0.

> 이 두 항목은 모두 **resolved 색·두께·치수가 동일**하다. 1px·한 자리 수치 차이는 0건. 토큰 "이름" 차이(차이1)만 ❓(c)로 올린다.

---

## 기계(결정론) 검증 (빌드측 508)

### variant 전수 — ✅ PASS
9/9 존재. 축 = Size{SM,MD} × State{Unselected,Hover,Selected,Pressed} × Break{PC,Mobile}. Mobile 3번째=Pressed 확인.

### 토큰 바인딩 스캔 — ❓(c) 1건 (set-wrapper #ffffff)

빌드 set 전 노드 deep-scan. 미바인딩 raw hex = **1건**: COMPONENT_SET 노드 508:6863 자신의 fill `#ffffff`(bound:null). 9 variant 컴포넌트·전 하위 rect/text는 **전부 Variable 바인딩됨**(미바인딩 0).

| hex | 노드·속성 | 허용편차 명시 | DS 조회 (figma-binding-lookup) | 판정 |
|---|---|---|---|---|
| #ffffff | 508:6863 COMPONENT_SET 래퍼 fill | 미명시 | EXACT = color/surface/default·raised | ❓(c) |

(b)-우회 2단계 잠금: 조건1(허용편차 스코프 명시) 미충족 + 조건2(DS EXACT 존재) → 정상이면 ❌(a). **단 비산출 에디터 크롬(컨테이너) + 파일 전역 컨벤션(모든 건강한 세트 래퍼가 동일 미바인딩 #ffffff)** 충돌로 (b) 임의면죄 금지·❓(c)로 escalate. 이전 검증과 동일 항목·동일 판정.

### 순환참조 — ✅ PASS
508:6863 하위 INSTANCE 0개 → 형제 variant 자기참조 0.

### 패킹 — ✅ PASS
세트 394×522, 3×3 정상 그리드(붕괴 없음). 렌더 정상.

### 기존 인스턴스 무결성 (datepicker 6개) — ✅ PASS

| inst | main | mainName | h | remote | key |
|---|---|---|---|---|---|
| 522:4545 | 508:6860 | Selected/Mobile | 32 | false | 9ccf6f… |
| 522:4548 | 508:6854 | Unselected/Mobile | 32 | false | b0174f… |
| 523:4688 | 508:6860 | Selected/Mobile | 32 | false | 9ccf6f… |
| 523:4691 | 508:6854 | Unselected/Mobile | 32 | false | b0174f… |
| 523:4746 | 508:6860 | Selected/Mobile | 32 | false | 9ccf6f… |
| 523:4749 | 508:6854 | Unselected/Mobile | 32 | false | b0174f… |

6개 전부 올바른 main 바인딩 + h=32(올바른 모바일) + remote:false(로컬).

### provenance (키 기반) — ✅ PASS
빌드 세트 내부 INSTANCE 0(대상 없음). 9 variant 전부 로컬 COMPONENT. datepicker 인스턴스 6개 remote:false. 외부 라이브러리 유입 0.

### 세트 래퍼 #ffffff 원본 대조 (이전 (c) 항목) — 원본도 동일
원본 set 540:6032 fill = **null**(fill 없음). 빌드 set 508:6863 fill = #ffffff(미바인딩). 즉 set 래퍼 배경은 원본엔 아예 없고 빌드엔 흰색 추가됨. 둘 다 비산출 크롬이라 렌더 무영향이나, "원본과 같은가"로는 **원본은 fill 없음** → 빌드의 set fill은 원본에 없는 추가물. (c)로 유지: (A) set fill 제거(원본처럼 fill 없음) / (B) color/surface/default 바인딩 / (C) 컨벤션 유지+스캔예외.

---

## 렌더 시각 대조 — ✅ (1px 회색 vs 2px 파랑, 글자색·굵기)
원본 540:6032 · 빌드 508:6863 get_screenshot 양쪽 비교: 미선택=회색글자(Mobile)/회색글자(PC)+얇은 회색1px 밑줄 / hover·pressed=파랑굵은글자+얇은 회색1px 밑줄 / selected=파랑굵은글자+굵은 파랑2px 밑줄. MD 행 글자가 SM보다 큼(20 vs 16). 1px회색 vs 2px파랑 구분 명확. 빌드↔원본 각 상태 시각 일치(행 순서만 파일별 상이, 상태별 렌더 동일).

---

## 두갈래 정리

### ❌(a) 빌드 실수 (수정 대상)
- **없음.** resolved 색·치수·두께·타이포·variant·바인딩(set 래퍼 제외) 전 항목이 재측정 원본과 일치. 1px/한 자리 차이 0건.

### 🟡(b) 사전등록/합리적 개선 (코드 유지)
- 인디케이터 프레임 구조 정규화(원본 pc-sm의 분리 프레임/단일2px rect → 9 variant 1프레임 2rect 통일). 시각·두께·색 동일.
- 폰트 폴백(Noto→setTextStyleId V2.4 Pretendard 재바인딩): 4 텍스트 textStyleId 정상.

### ❓(c) 확인 요청 (사용자 판단)
- (c-1) 흰색 spacer line 토큰 base/white vs navigation/background — 원본 자기모순(pc-sm=base/white, mobile·pc-md=navigation/background), 빌드는 base/white 통일. 비가시 spacer. (§차이1)
- (c-2) set-wrapper #ffffff (508:6863) — DS EXACT(surface/default)이나 비산출 크롬·파일 전역 컨벤션. **원본 set은 fill 자체가 없음** → 빌드가 추가한 fill. (A 제거 / B 바인딩 / C 예외)

### 🔒 BLOCKED
- **없음.** 원본 540:6032 재측정 완료로 이전 BLOCKED 해소.

---

## 판정 — ✅ PASS (❓(c) 2건은 비가시 크롬/spacer라 escalate, 차단 아님)

| 항목 | 결과 |
|---|---|
| ❌(a) 빌드 실수 | 0건 |
| 🟡(b) 합리적 개선 | 2건 (구조 정규화·폰트 폴백) |
| ❓(c) 확인 요청 | 2건 (흰 spacer 토큰 · set-wrapper fill — 둘 다 비가시) |
| 🔒 BLOCKED | 0건 (원본 재측정 완료) |

**최종: PASS.** 직접 재측정한 원본 540:6032와 빌드 508:6863을 9 variant 전수 cross-file 대조한 결과, **렌더에 보이는 모든 색·치수·두께·타이포·variant 구성·토큰 바인딩이 1px/한 자리 오차 없이 일치**한다. ❌(a)=0. 남은 ❓(c) 2건은 (1) 흰 배경 위 흰 1px spacer의 토큰 이름 (2) 비산출 set 컨테이너 fill 로, **둘 다 어떤 인스턴스에도 렌더되지 않는 비가시 항목**이라 검문소 통과를 막지 않는다(원본도 비일관/fill없음이라 "원본 충실" 기준으로 빌드가 틀렸다 단정 불가). 사용자가 (c-1)(c-2) 처리 방침만 정하면 완결.

---

## 후속 조치 (⭐ 총괄, cross-file 검증 PASS 후)
- **c-2 해소** — set-wrapper #ffffff fill을 **제거**(fills=[])해 원본 set 540:6032(fill 없음)와 일치시킴. 단일 속성 제거(hex 없음)=순수 기계적 미세편집(⭐ 직접 + 렌더 1회 확인). 렌더: 인스턴스 영향 0(세트 래퍼는 비렌더). mutated: 508:6863.
- **c-1 유지** — 흰 spacer line = `color/base/white` 9개 통일. 원본은 자기모순(일부 base/white·일부 navigation/background)이라 단일 정답 없음. 흰 배경 위 흰 1px = 비가시 → 통일 유지(개선).
- **최종 판정: ✅ PASS** (❌(a) 0 · ❓(c) 0 — 둘 다 처리/확정).
