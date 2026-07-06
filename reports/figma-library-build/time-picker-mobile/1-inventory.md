# Time Picker Mobile Bottom Sheet — 1단계 재고조사 (inventory)

> figma-library-build 1단계. **읽기·기록만** (빌드/구현 금지).
> 원본: 파일 `yE5UCFEbmXJBlYJWB24Lz2` (SW UX GUIDE V2.4), 프레임 `540:3729` `mobile_timepicker_bottomsheet` (924×610).
> 빌드 대상 파일: `cysG5U1udpQqVagYY1hWHW` (V3.0-TEST).
> 조사 방식: MCP `get_metadata`→`get_design_context`+`get_variable_defs` (원본 2 variant 전수) + 생성기 `build-components.ts` 정독(재사용 대상).

---

## 0. 원본 구성 (variant 2개)

| # | variant | Figma nodeId | 크기 | 설명 |
|---|---------|-------------|------|------|
| 1 | `Property 1=default` = **"시간 선택"** | `540:3760` | 360×448 | 헤더(제목+X) + 시간 휠(오전오후·시·분) + 적용 버튼 |
| 2 | `Property 1=date_time` = **"시작 일시"** | `540:3730` | 360×512 | 헤더 + **날짜/시간 2탭** + 같은 시간 휠 + 적용 버튼 |

> variant 축 이름 = `Property 1` (원본), 값 = `default` / `date_time`.

---

## 1. 부분별 전수표 (치수·색토큰 — MCP 실측)

### 1-1. 시트 컨테이너 (공통)

| 속성 | 값 | 바인딩 Variable |
|------|----|----|
| bg | #ffffff | `surface/neutral/bg/base` |
| width | 360px (고정) | — |
| 상단 radius | **8px (하드코딩)** | ⚠️ Variable 미바인딩 (아래 needs-decision) |
| 하단 radius | 0 | — |
| py(상하 패딩) | 20 | `spacing/padding/block/md` |
| 내부 세로 gap | 32 (헤더블록 ↔ 적용버튼) | `spacing/section/lg` |
| overflow | clip | — |

### 1-2. 헤더 (공통) — nodeId 540:3762(v1) / 540:3732(v2)

| 요소 | 값 | 바인딩 Variable |
|------|----|----|
| 행 | 좌우 space-between, px 20 (`spacing/padding/inline/md`) | — |
| 제목 텍스트 | v1 "시간 선택" / v2 "시작 일시" | — |
| 제목 스타일 | Pretendard Bold 20, lh 1.3 (스타일 `title/20B`) | 색 `color/text/title/primary` = #000000 |
| 닫기 아이콘 | `ic_닫기` 24×24, 스트로크 #353535 | 색 `color/icon/gray-dark` = #353535 · **아이콘 정본 노드 89:4927** |

### 1-3. 탭바 (variant 2 = date_time 만) — nodeId 540:3735

| 요소 | 값 | 바인딩 Variable |
|------|----|----|
| 탭 행 | px 24 (`spacing/padding/inline/lg`), 탭 2개 각 flex-1 | — |
| 탭 최소폭 | 80 | `sizing/80` |
| 탭 내부 높이 | 30 | `sizing/30` |
| 탭 내부 패딩 | px 16 (`spacing/padding/inline/sm`), py 4 (`spacing/4`) | — |
| 탭 bg | #ffffff | `color/navigation/background` |
| **날짜(비선택)** 라벨 | "날짜" Pretendard **Medium** 16 (스타일 `title/16M`) | 색 `color/navigation/label/default` = #555555 |
| 날짜 밑줄 | 1px 흰선(spacer, `navigation/background`) + 1px 회색선 | `color/navigation/indicator/default` = #d9d9d9 |
| **시간(선택)** 라벨 | "시간" Pretendard **Bold** 16 (스타일 `title/16B`) | 색 `color/navigation/label/selected` = #1d6ceb |
| 시간 밑줄 | 2px, 파랑 1px×2 | `color/navigation/indicator/selected` = #1d6ceb |

### 1-4. 시간 휠 (공통) — nodeId 540:3765(v1) / 540:3738(v2)

| 요소 | 값 | 바인딩 Variable |
|------|----|----|
| 휠 컨테이너 | items-center, px 24 (`spacing/padding/inline/lg`), py 40 (`spacing/40`) | — |
| 3컬럼 행 gap | 36 (`spacing/36`) between 오전오후 ↔ (시:분 그룹) | — |
| 오전/오후 컬럼 | 세로 2행, 행간 gap 32 (`spacing/32`) | 텍스트색 `color/text/state/accent` = #1d6ceb |
| 시 컬럼 (7·8·9) | 세로 3행, 행간 gap 32 (`spacing/32`), text-right | `color/text/state/accent` |
| 콜론 컬럼 (`:`×3) | 세로 3행, 행간 gap 40 (`spacing/40`), 각 셀 35h×10w | `color/text/state/accent` |
| 분 컬럼 (59·00·01) | 세로 3행, 행간 gap 32 (`spacing/32`) | `color/text/state/accent` |
| 시:분 그룹 내부 gap | 32 (하드코딩, Variable 아님) | — |
| 휠 텍스트 스타일 | Pretendard **Regular 32**, lh 1.3 (named 스타일 없음 — raw) | — |
| **위/아래행 "흐림"** | ★ **별도 색 토큰 아님.** 3행 전부 `color/text/state/accent`(#1d6ceb) 동일. 위/아래 흐림은 **흰색 그라디언트 오버레이 2장**(nodeId v1 540:3785/3786, v2 540:3758/3759)이 덮어 만든 마스크 효과 | 오버레이 = `rgba(255,255,255, 0→0.7→0.9)` **하드코딩 rgba, Variable 미바인딩** |

> ★ 핵심: 원본 시간 휠은 "가운데 selected=진한 파랑 / 위아래=연한 파랑" 이 아니라 **모든 셀이 같은 accent 파랑 + 흰 그라디언트 마스크로 위아래를 흐리게** 하는 방식. → 재사용 후보인 Time Picker Cell(State별 다른 색)과 시각 원리가 **다름**(아래 재사용 판정 참조).

### 1-5. 적용 버튼 (공통) — nodeId 540:3784(v1) / 540:3757(v2), name `mobile_button`

| 속성 | 값 | 바인딩 Variable |
|------|----|----|
| 버튼 행 | px 20 (`spacing/padding/inline/md`), 버튼 full-width(flex-1) | — |
| 높이 | 48 | — |
| min-width | 80 | — |
| 패딩 | px 16 (`spacing/padding/inline/sm`), py 16 (`spacing/padding/block/sm`) | — |
| radius | 4 | `radius/4` |
| border | 1px | `border-width/100` · 색 `color/button/border/primary--default` = #1d6ceb |
| bg | #1d6ceb | `color/button/bg/primary--default` |
| 라벨 | "적용" Pretendard Medium 16, ls -0.32 (스타일 `component/button/label/16M`) | 색 `color/button/label/primary--default` = #ffffff |

---

## 2. 색·토큰 요약 (전부 바인딩 Variable 확인됨 · 예외 1건)

색상 12종 모두 Variable 바인딩 확인:
`surface/neutral/bg/base`(#fff) · `color/text/title/primary`(#000) · `color/icon/gray-dark`(#353535) · `color/text/state/accent`(#1d6ceb, 휠) · `color/button/bg/primary--default`·`border/primary--default`(#1d6ceb) · `color/button/label/primary--default`(#fff) · `color/navigation/label/default`(#555) · `label/selected`(#1d6ceb) · `indicator/default`(#d9d9d9) · `indicator/selected`(#1d6ceb) · `navigation/background`(#fff).

**예외(색): 휠 위아래 흐림용 그라디언트 오버레이 = 하드코딩 rgba(흰 0→0.7→0.9). Variable 미바인딩.** → needs-decision.

숫자 토큰: `spacing/padding/block/md`(20)·`section/lg`(32)·`padding/inline/md`(20)·`inline/lg`(24)·`inline/sm`(16)·`padding/block/sm`(16)·`spacing/4`(4)·`spacing/32`·`spacing/36`·`spacing/40` · `sizing/icon/24` · `sizing/30` · `sizing/80` · `radius/4` · `border-width/100`.
**미바인딩 숫자 2건: ① 상단 radius 8px(하드코딩) ② 시:분 그룹 gap 32(하드코딩).** → needs-decision.

---

## 3. 재사용 대상 조사 (V3.0-TEST · 정본 = `build-components.ts`)

> ⚠️ **live 노드 ID 확인 불가 (블로커):** 조사 시점 빌드 파일 `cysG5U1udpQqVagYY1hWHW` 에는 **`cover` 페이지 1개만 존재**하고, 컴포넌트 세트(Bottom Sheet·Time Picker·Line Tab·Button 등)가 **live 노드로 존재하지 않음.** 작업 지시의 노드 ID(Bottom Sheet `868:9184`·Time Picker 섹션 `826:22301`·Core 페이지 `5:5706`)는 모두 `get_metadata` "not found" (이전 빌드의 stale ID — 설치기는 실행할 때마다 ID 재생성). 따라서 재사용 대상의 **구조는 생성기 소스(정본)** 에서 확정하고, live node id/좌표는 **빌드 직전 설치기 재실행 후** 다시 읽어야 함.

| 재사용 후보 | 생성기 정의 | 원본 대응 | 판정 |
|------------|-----------|----------|------|
| **닫기 아이콘** | `makeIconInstance("close", color/icon/gray-dark, 24)` · `ICON_KEYS.close = 2a1abbd…` (= ic_닫기 **89:4927**, plain-X) | 헤더 ic_닫기 89:4927 | ✅ **그대로 재사용** (정본 아이콘 노드 일치) |
| **적용 버튼** | `getReuseComp("Button:primary:LG:Default", …)` (`buildButtonSet` 산출 "Button" 세트, Variant=Primary·Size=LG·State=Default, h48) full-width | mobile_button primary h48 | ✅ **재사용** (색·크기·radius 일치) |
| **날짜/시간 탭** | `buildLineTab` "Line Tab" 세트, Mobile SM(h32/font16), 상태 Unselected/Hover/Selected, navigation 토큰 동일 | 탭바 540:3735 | ⚠️ **재사용 후보(값 편차 1건)** — 원본 선택탭 라벨=**Bold** 16 인데 buildLineTab 라벨은 전 상태 **Medium**. 폰트 굵기 편차 → 두갈래 (b/c) 판단 필요 |
| **바텀시트 크롬** | `buildBottomSheet` "Bottom Sheet" 세트(Footer=None/Single/Dual): 컨테이너 360·topRadius 8·헤더(title Bold20+close24)·footer(Button 인스턴스) | 시트 컨테이너+헤더+적용버튼 | ⚠️ **패턴 재사용(부분)** — 헤더·close·footer 버튼 패턴은 동일. 단 ①컨테이너 bg 토큰이 원본 `surface/neutral/bg/base` vs 빌더 `color/surface/raised` ②본문이 옵션 리스트가 아니라 시간 휠(+탭) ③내부 gap 값 다름(빌더 48 vs 원본 32). → 크롬만 참고하고 본문은 신규 조립할지, Bottom Sheet 를 확장할지 2단계 결정 |
| **시간 휠 셀** | `buildTimePickerCell` "Time Picker Cell" 세트(State=Default/Hover/Selected, `color/dropdown/option/*`, 44×32, bg 하이라이트) · `buildTimePickerDropdown` 패널(PC 121/194폭) | 시간 휠(오전오후·시·분) | ❌ **직접 재사용 부적합** — 원본 모바일 휠은 32px accent 텍스트 + 그라디언트 마스크(위아래 흐림)이고, Time Picker Cell 은 14px + bg 하이라이트(PC 드롭다운용). 시각 원리가 다름 → **모바일 휠 컬럼은 신규 조립** 검토. needs-decision |
| **선행 유사 컴포넌트** | `buildDatePickerBottomSheet` "Date Picker Mobile Bottom Sheet" (빌더 맵에 이미 존재) | — | 📌 **구조·배치 참고 원본** — 같은 계열(모바일 바텀시트) 선례. 2단계에서 이 빌더의 시트 조립·스펙시트 패턴을 준용 |

---

## 4. 배치 기준 (Time Picker Cell 좌표)

- **좌표 확인 불가 (블로커).** 위 3절 사유와 동일 — live 파일에 컴포넌트 세트가 없어 "Time Picker Cell" 노드의 x/y 를 읽을 수 없음.
- 대안(생성기 기준 순서): 빌더 맵 순서상 `Time Picker` → `Time Picker Dropdown` → … 로 배치되고, 신규 `Time Picker Mobile Bottom Sheet` 는 (선례 `Date Picker Mobile Bottom Sheet` 가 `Date Picker` 뒤에 오듯) **Time Picker 계열 뒤에 새 카테고리 멤버로 추가**하면 세로 Y밴드 하단에 자동 배치됨.
- **빌드 직전 필수 선행:** 설치기 재실행(또는 컴포넌트가 담긴 올바른 파일 오픈) → `Time Picker Cell` / `Time Picker` 세트의 live node id·좌표를 `get_metadata` 로 재확인 후 임시 배치 y 확정.

---

## 5. 총 요소수

- **원본 variant: 2개** (default "시간 선택" 540:3760 · date_time "시작 일시" 540:3730).
- variant 1 부분: 시트·헤더(제목·닫기)·휠(오전오후·시·콜론·분 4컬럼 총 11셀)·적용버튼·그라디언트오버레이 2 — 주요 부분 6블록 / 텍스트 노드 13 / 오버레이 2.
- variant 2 = variant 1 + **탭바(탭 2개)**.
- 고유 색 토큰 12 + 예외 rgba 오버레이 1 / 숫자 토큰 15 + 하드코딩 2.

---

## 6. needs-decision (2단계 진행 전 확인 필요)

1. **[값·rgba] 휠 위아래 흐림 처리** — 원본은 모든 셀 `color/text/state/accent` 동일색 + **흰 그라디언트 마스크(하드코딩 rgba)** 로 흐림 연출. `use_figma` 색 하드코딩 금지 하드룰과 충돌. (A) 그라디언트를 `color/overlay/*` 등 alpha Variable 로 바인딩 (B) 마스크 대신 셀별 색 토큰(선택=accent / 비선택=흐린 회색톤) 사용 — 정본에 해당 토큰 유무 확인 필요 (C) 오버레이는 `figma-hex-allow` 장식 크롬 예외로 둘지. → **원본 값(우선)과 하드룰 사이 결정 필요.**
2. **[값] 시간 휠 셀 = 기존 Time Picker Cell 재사용 여부** — 시각 원리가 달라(모바일 32px accent+마스크 vs PC 14px+bg하이라이트) 직접 재사용 부적합. 신규 휠 컬럼 조립이 맞는지, 아니면 Time Picker Cell 에 모바일 variant 를 추가할지.
3. **[값] 탭 선택 라벨 굵기** — 원본 선택탭 = Bold 16, buildLineTab = Medium(전 상태). Line Tab 재사용 시 굵기 편차. (a)코드가 원본과 다르게 Medium 으로 굳은 것 정정 / (b)의도된 개선 / (c)확인 — 판단 필요.
4. **[구조] 상단 radius 8px·시:분 그룹 gap 32** — 원본에서 Variable 미바인딩(하드코딩). 빌드 시 `radius/8`(존재 시)·`spacing/32` 로 바인딩할지 확인.
5. **[구조] Bottom Sheet 확장 vs 신규 컴포넌트** — 기존 "Bottom Sheet" 세트(Footer 축)를 확장할지, 별도 "Time Picker Mobile Bottom Sheet" 신규 세트로 만들지(선례 Date Picker Mobile Bottom Sheet 는 별도). variant 축 설계(Property 1=default/date_time 유지?)와 연결.
6. **[블로커] live 파일 상태** — 빌드 파일에 컴포넌트 세트가 현재 없음(cover 페이지만). 재사용 인스턴스·배치 좌표를 위해 **설치기 재실행 또는 올바른 파일 확인**이 2단계 전 선행되어야 함.
