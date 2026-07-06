# Time Picker Mobile Bottom Sheet — 2단계 매핑·빌드 계획 (plan)

> figma-library-build 2단계. 담당 🎩 ⭐(오케스트레이터). 빌드는 이 계획서를 근거로 🏗️ figma-library-builder 가 실행한다(⭐ 직접 빌드 금지).
> 원본(1단계): `reports/figma-library-build/time-picker-mobile/1-inventory.md`
> 빌드 대상: 파일 `cysG5U1udpQqVagYY1hWHW`(SW-UX-GUIDE-V3.0-TEST), 페이지 `5:5706`("Core")

---

## 0. 블로커 해소 확인 (1단계 needs-decision #6)

1단계에서 "빌드 파일에 컴포넌트 세트가 없다"고 기록됐던 블로커는 **재확인 결과 해소됨**.
`get_metadata`로 Core 페이지(`5:5706`)를 직접 조회한 결과 아래가 모두 실존:

| 재사용 대상 | 섹션/세트 | 라이브 노드 | 좌표 |
|---|---|---|---|
| Time Picker 계열 섹션 | "Time Picker" | `912:39987` | x=21244, y=0, w=2144, h=2858 |
| ㄴ Time Picker Cell | frame | `912:38639` (Light) / `912:39300`(Spec Dark) | y=2644 |
| ㄴ Time Picker Dropdown | frame | `912:38960`(Light) / `912:38968`(Spec Dark) | y=1936 |
| ㄴ Time Picker(스펙시트) | frame | `912:39619` | y=140 |
| 닫기 아이콘 | Library instance key | `2a1abbd3597b536e34fd9523fb61eade3afe9934` | (기존 Bottom Sheet·Date Picker Mobile Bottom Sheet 재사용과 동일 key) |
| Button (Primary·LG·Mobile·Default) | "Actions" 섹션 내 Button 세트 | 섹션 `911:32013`(Actions) 하위 | 빌드 시 이름매칭으로 재탐색(`Variant=Primary`,`Size=LG`,`State=Default`) — 기존 buildBottomSheet 패턴과 동일 |
| Line Tab (Mobile·SM, h32/font16) | "Line Tab" 세트 | 섹션 `911:31419` | 빌드 시 이름매칭(`Size=SM`,`Break=Mobile`) |
| 참고 선례 | "Date Picker Mobile Bottom Sheet" | frame `912:38482`(Light)/`912:38484`(Spec Dark) | Date Picker 섹션(`912:38632`) 내 y=3298 |
| 참고 선례 | "Bottom Sheet" | 섹션 `912:41085` | x=8840, y=3722, w=2744, h=1215 |

**결론:** 재사용 대상 전부 라이브로 확인됨. 좌표·인스턴스 확보 완료 → 3단계(빌드) 진행 가능.

---

## 1. 사용자 결정 반영 (검문소 2 확인 완료)

| HD | 결정 |
|----|------|
| 휠 위·아래 칸 흐림 처리 | **원본처럼 흰색(계열) 그라데이션으로 재현.** 단, 다크모드에서 순백 그라데이션은 시트 배경(어두운 표면)과 부딪혀 뜬 것처럼 보이므로, **그라데이션 색 = 시트 표면색과 동일 계열**로 라이트/다크 각각 정의(아래 3-4절 신규 토큰). |
| 탭 선택 라벨 굵기 | **지금처럼 Medium 유지.** 기존 "Line Tab" 공용 부품(다른 화면에서도 사용 중)은 변경하지 않음. 원본은 Bold였으나 이번 빌드에서는 정정하지 않고 현재 스타일 그대로 사용(원본과의 굵기 편차는 🟡(b) 허용편차로 기록). |

---

## 2. 구조·variant 설계

**신규 컴포넌트 세트명:** `Time Picker Mobile Bottom Sheet` (선례 `Date Picker Mobile Bottom Sheet`와 동일 네이밍 계열)

**variant 축:** `Content` = `TimeOnly`(원본 `Property 1=default`, "시간 선택") / `DateTime`(원본 `Property 1=date_time`, "시작 일시")
> 원본의 `Property 1`은 Figma 기본 축 이름(의미 없음) → 두 값의 실제 의미(시간만 vs 날짜+시간)를 담아 `Content`로 명명.

**결정 이유(신규 세트 vs Bottom Sheet 확장):** 기존 "Bottom Sheet" 세트는 `Footer` 축(None/Single/Dual)으로 본문이 "옵션 리스트"인 것을 전제로 함. Time Picker의 본문은 시간 휠(+탭)로 구조가 근본적으로 다름 → 선례 "Date Picker Mobile Bottom Sheet"(캘린더 본문)와 동일하게 **별도 세트로 신규 생성**.

**공통 뼈대 (buildDatePickerBottomSheet·buildBottomSheet 패턴 그대로 재사용):**
```
comp (VERTICAL, w=360 FIXED, h=AUTO, py 20, gap 32)
├─ header (HORIZONTAL, space-between, px 20)
│   ├─ title (Bold 20 / title/20B) — TimeOnly="시간 선택" / DateTime="시작 일시"
│   └─ close icon (24, library instance key 2a1abbd3597b536e34fd9523fb61eade3afe9934)
├─ [DateTime 전용] tabRow (HORIZONTAL, px 24, gap 0, 각 flex-1/FILL)
│   ├─ Line Tab instance(Mobile/SM) "날짜" — State=Unselected
│   └─ Line Tab instance(Mobile/SM) "시간" — State=Selected
├─ wheelWrap (신규 조립 — 아래 3절)
└─ actionWrap (HORIZONTAL, px 20)
    └─ Button instance(Primary·LG·Mobile·Default) "적용" FILL width
```
- 시트 배경·상단 radius·클리핑: 기존 패턴과 동일 — `color/surface/raised`(라이트=base/white, 다크=gray-dark/100), topLeftRadius/topRightRadius → `radius/modal/md`(라이브 변수 `8:1196`) 바인딩.
- 세트 외부(변형 컨테이너) 배경 = `color/bg/level-3`(기존 Bottom Sheet·Date Picker Mobile Bottom Sheet와 동일 — 흰 시트가 흰 섹션에 묻히지 않게).

---

## 3. 휠(wheelWrap) — 신규 조립 (Time Picker Cell 재사용 안 함)

1단계 결론 유지: 모바일 휠(32px accent 텍스트 + 흐림 마스크)과 기존 "Time Picker Cell"(PC 드롭다운용, 14px + bg 하이라이트)은 시각 원리가 달라 재사용 부적합 → 신규 조립.

```
wheelWrap (HORIZONTAL, items-center, px 24, py 40, gap 36)
├─ ampmCol (VERTICAL, gap 32) — "오전"/"오후" 2행, 텍스트 color/text/state/accent
├─ hourCol (VERTICAL, gap 32, text-right) — 3행(예: 7·8·9), color/text/state/accent
├─ colonCol (VERTICAL, gap 40) — ":" × 3행, 각 35h×10w, color/text/state/accent
└─ minuteCol (VERTICAL, gap 32) — 3행(예: 59·00·01), color/text/state/accent
```
- 휠 텍스트: Pretendard Regular 32(원본 raw — named 텍스트 스타일 없음. `setTextStyleIdAsync` 대상 스타일이 없으므로 `loadFontAsync` 로 Pretendard 직접 적용 후 유지. 단, 이 PC에서 Pretendard 로드 불가 시 임시 Noto 입력 후 **가장 가까운 body 계열 텍스트 스타일로 재바인딩 대신, 폰트 훅 규정에 따라 `figma-font-temp` 마커 남기고 이후 재검증**).
- 각 컬럼 3행은 전부 동일색(`color/text/state/accent`) — 원본과 동일(위/아래가 "다른 색"이 아니라 마스크로 흐려 보이는 것).

### 3-1. 흐림 마스크 (신규 토큰 필요 — 사용자 결정 반영: 그라데이션 방식)

**신규 Foundation alias 토큰 2건** (허용 카테고리 `color-overlay`, rgba 허용):

| 신규 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `color/overlay/wheel-fade` | `base/white` 계열, alpha 0→0.7→0.9 그라데이션 | `gray-dark/100` 계열(=시트 표면 다크값과 동일 베이스), alpha 0→0.7→0.9 | 휠 위·아래 흐림 마스크. 색 자체는 **시트 표면색과 동일 베이스**로 둬서 다크모드에서 흰 그라데이션이 뜨는 문제를 방지(라이트=시트도 흰색이라 결과적으로 원본과 동일, 다크=시트와 자연스럽게 이어짐). |

- 오버레이 2장(위/아래), 각 `wheelWrap` 위·아래에 절대배치, 폭=wheelWrap 전체, 높이는 원본 비율 유지.
- **needs-decision 아님** — `color-overlay` 카테고리는 CLAUDE.md에서 이미 rgba 허용 예외로 지정된 카테고리이므로 신규 alias 추가는 정책 위반이 아님. 값(라이트=흰색·다크=시트표면 기준)은 위 표로 확정.
- 빌드 후 `token-binding-scan`에서 이 2개 신규 변수는 "신규 생성 변수"로 별도 표기(기존 vars-data.ts에는 없음 → **빌드 후 vars-data.ts에도 추가 반영 필요**, 아래 5절).

---

## 4. 색상 바인딩 사전 조회표 (전량)

| 원본 값 | 노드·속성 | DS 조회 결과 | 빌드 지시 |
|---|---|---|---|
| #ffffff | 시트 bg | `color/surface/raised` ✅ (기존 Bottom Sheet·Date Picker Mobile BS와 통일 — 원본의 `surface/neutral/bg/base`는 V2.4 레거시명, V3.0 정본은 surface/raised) | 바인딩 필수 |
| #000000 | 제목 텍스트 | `color/text/title/primary` ✅ | 바인딩 필수 |
| #353535 | 닫기 아이콘 | `color/icon/gray-dark` ✅ | 바인딩 필수(라이브러리 인스턴스 재사용) |
| #1d6ceb | 휠 텍스트(전 행) | `color/text/state/accent` ✅ | 바인딩 필수 |
| #1d6ceb | 적용 버튼 bg/border | `color/button/bg/primary--default` / `color/button/border/primary--default` ✅ | Button 인스턴스 재사용(별도 바인딩 불필요) |
| #ffffff | 적용 버튼 라벨 | `color/button/label/primary--default` ✅ | Button 인스턴스 재사용 |
| #555555 | 탭(날짜) 라벨 | `color/navigation/label/default` ✅ | Line Tab 인스턴스 재사용 |
| #1d6ceb | 탭(시간) 라벨 | `color/navigation/label/selected` ✅ | Line Tab 인스턴스 재사용 |
| #d9d9d9 | 탭(날짜) 밑줄 | `color/navigation/indicator/default` ✅ | Line Tab 인스턴스 재사용 |
| #1d6ceb | 탭(시간) 밑줄 | `color/navigation/indicator/selected` ✅ | Line Tab 인스턴스 재사용 |
| #ffffff | 탭 행 bg | `color/navigation/bg` ✅ (2026-06-23 Gate 15로 `background`→`bg` 개명됨 — 이름 반드시 `bg` 사용) | Line Tab 셋 자체가 배경 없음(투명) — 탭 행 컨테이너에 필요 시 바인딩 |
| rgba(255,255,255,0→0.7→0.9) | 휠 흐림 그라데이션(2장) | **없음 → 신규 토큰**(위 3-1절 `color/overlay/wheel-fade`) | 신규 Variable 생성 후 바인딩 |

**등가물 없음 항목 = 1건**(그라데이션) — 사용자 결정으로 신규 토큰 생성 확정(3-1절). 나머지 전량 기존 토큰 등가물 확인됨 → 예외 없이 바인딩 필수.

---

## 5. 숫자값

| 값 | 용도 | 처리 |
|---|---|---|
| 상단 radius 8 | 시트 모서리 | `radius/modal/md`(라이브 var `8:1196`) 바인딩 — 기존 Bottom Sheet·Date Picker Mobile BS와 동일 방식 |
| py 20 / gap 32(헤더↔버튼) / px 20(헤더·버튼) / px 24(탭·휠) | 패딩·간격 | raw 숫자(기존 패턴 전부 raw — Foundation number 별도 바인딩 안 함, 코드 관례 그대로) |
| 휠 내부 gap 32/36/40, 콜론 셀 35×10 | 휠 세부 | raw 숫자 |
| 탭 높이 30 | 탭 행 | Line Tab Mobile/SM(h32)로 대체 — 2px 차이는 허용편차 🟡(b) (기존 표준 사이즈 재사용이 우선) |

→ needs-decision 없음(전부 기존 관례로 처리 가능, 신규 Foundation number 불필요).

---

## 6. 허용편차 선언서

```
허용편차 #1: [tabRow 라벨] Line Tab Selected 상태 글자 굵기 — 원본 Bold, 재사용 부품은 Medium.
  사유: 공용 Line Tab 부품 변경 시 타 화면 영향 → 사용자 결정(2026-07-06)으로 현 상태 유지.
  빌더 지시: raw 유지(Line Tab 인스턴스 그대로 사용, 별도 override 금지).

허용편차 #2: [tabRow 높이] 30px(원본) vs Line Tab Mobile/SM 32px(재사용 표준 사이즈).
  사유: 표준 사이즈 컴포넌트 재사용 우선(2px 차이는 시각적으로 무의미).
  빌더 지시: Line Tab 표준 그대로 사용, 리사이즈 금지.
```

---

## 7. 배치 계획

- **섹션:** 기존 "Time Picker" 섹션(`912:39987`, x=21244,y=0,w=2144,h=2858)을 **아래로 확장**(현재 마지막 콘텐츠 하단 y≈2794, 여유 부족) — 높이를 약 3620까지 늘려 새 프레임을 하단에 배치. 폭은 기존 2144 그대로(라이트+다크 프레임 나열에 충분).
- **신규 프레임:** "Time Picker Mobile Bottom Sheet"(Light, x=64) + "Time Picker Mobile Bottom Sheet — Spec Dark"(Dark, 우측) — 기존 Date Picker Mobile Bottom Sheet 배치 관례(라이트 옆에 다크, gap 유지) 그대로.
- **정확한 픽셀 좌표·패킹**은 🏗️ 빌더가 실제 빌드 시 겹침 확인 후 확정(스킬 원칙: 배치 좌표는 ⭐가 방향만 정하고 세부는 빌더가 계산).

---

## 8. 신규 토큰 반영 후속 작업 (빌드 완료 후)

빌드에서 `color/overlay/wheel-fade`(라이트/다크)가 새로 생성되므로, 완료 후 다음에 반영 필요(별도 커밋/단계):
- `vars-data.ts` FOUNDATION_COLOR 또는 SEMANTIC_COLOR에 동일 값 추가 (설치기 정합용, Gate 6/7/8 대상)
- `registry/tokens/semantic.colors.json` 반영
- 이 항목은 4단계 검증 후 별도로 처리(component-verifier가 "신규 토큰 vars-data 미반영"을 needs-decision 아닌 후속 작업으로 보고하도록 안내).

---

## 9. 3단계(빌드) 위임 지시 요약

`figma-library-builder`에게 넘길 것: 이 문서 + `1-inventory.md` + 아래 라이브 노드 id 목록(0절) + 신규 토큰 값(3-1절). 빌더는 combineAsVariants 후 2-variant 패킹, 순환참조 없음(재사용은 전부 인스턴스), 토큰 바인딩(색 전량 Variable, 그라데이션 2건만 신규 Variable), 폰트 Pretendard(휠 텍스트 포함) 확인 후 `node-map.json` 기록.
