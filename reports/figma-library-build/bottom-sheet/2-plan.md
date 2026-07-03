# Bottom Sheet — 2단계 빌드 계획 (figma-library-build)

> 🎩 ⭐ 오케스트레이터 작성. 빌드는 3단계 🏗️ figma-library-builder 에 위임.
> 기준: `1-inventory.md`(소스 실측) + 사용자 결정(레거시 5종 전부 · 기존 라이브러리 파일에 빌드 · 전용 토큰층 신설 안 함).
> 소스(레거시): `yE5UCFEbmXJBlYJWB24Lz2` 옵션 540:5862 / 컨테이너 540:5903.
> **빌드 대상 파일(확정): `cysG5U1udpQqVagYY1hWHW` (SW-UX-GUIDE-V3.0-TEST)** — 기존 Button·Checkbox·Radio 가 있는 라이브러리 파일(사용자 확정 2026-07-03).
> **토큰 사용 원칙(사용자 지시): `bg/*` 는 배경에만. 전경 요소(아바타 원 등)는 `icon/*` 계열 색을 쓴다.**

---

## 빌드 대상 (2개 변형세트)

### 세트 1 — Bottom Sheet Option (옵션 행)
- **variant 속성축:** `Type` = {Text, Checkbox, Radio, List} · `State` = {Default, Selected, Disabled}
- **variant 8개(소스 8변형과 1:1):**
  | Type | State | 구성 | 소스 |
  |------|-------|------|------|
  | Text | Default | 라벨만 (body/16M, text/body/primary) | 540:5863 |
  | Text | Selected | 라벨(text/state/accent) + 우측 ✓(icon/blue 24) | 540:5893 |
  | Checkbox | Default | [Checkbox off 인스턴스] + 라벨, gap8 | 540:5881 |
  | Checkbox | Selected | [Checkbox on 인스턴스] + 라벨 | 540:5887 |
  | Radio | Default | [Radio off 인스턴스] + 라벨, gap8 | 540:5884 |
  | Radio | Selected | [Radio on 인스턴스] + 라벨 | 540:5890 |
  | List | Default | [아바타40] + (타이틀 16M / 서브 14R) ↔ chevron(24) | 540:5865 |
  | List | Disabled | [아바타40] + (타이틀 / 서브) ↔ lock(24) | 540:5873 |
- **공통:** width 360 고정, 선택행 h48(패딩 20/8), List 행 hug(패딩 20/12, 타이틀↔서브 gap2), justify-between(우측 아이콘 있을 때).
- **체크박스/라디오는 raw 재현 금지 → 라이브러리 Checkbox/Radio 컴포넌트를 인스턴스로 부착**(레거시 토큰 의미 역전 회피). off/on = 각 컴포넌트의 해당 variant.

### 세트 2 — Bottom Sheet (컨테이너)
- **variant 속성축:** `Footer` = {None, Single, Dual}
- **variant 3개:**
  | Footer | 크기 | 푸터 | 소스 |
  |--------|------|------|------|
  | None | 360×302 | 없음 | 540:5904 |
  | Single | 360×378 | Button primary 1개 풀와이드(flex-1, h48) | 540:5914 |
  | Dual | 360×378 | Button secondary + primary, gap8, 각 flex-1 h48 | 540:5926 |
- **공통 구조:** 시트 표면 bg/level-0, 상단 radius(modal/md=8), overflow-clip.
  - 헤더: 패딩 px20, justify-between — 제목("헤더 타이틀" title/20B, text/title/primary) ↔ close 아이콘(24, icon/gray-dark)
  - 헤더↔리스트 gap 24(section/md)
  - 리스트: **Bottom Sheet Option(Text) 인스턴스 3~4개** 세로 스택(1개 selected 예시)
  - 리스트↔푸터 gap 48(section/xxl)
  - 푸터: 패딩 px20, (dual) gap8 — **Button 인스턴스 재사용**
- **드래그 핸들·딤 스크림: 세트에 미포함**(레거시 소스에 없음 — 딤은 사용처에서 color/overlay 로 적용). *개선여지 (b): 추후 핸들 추가 검토.*

---

## 색상 바인딩 사전 조회표 (raw hex → DS 토큰, vars-data 실조회)

| raw hex | 노드·속성 | DS 조회 결과 | 빌드 지시 |
|---------|----------|-------------|----------|
| #ffffff | 시트/행 표면 fill | `color/bg/level-0`(base/white) ✅ | 토큰 바인딩 필수 |
| #353535 | 라벨·타이틀·아이콘 | `color/text/body/primary` · `color/icon/gray-dark` ✅ | 바인딩 필수 |
| #555555 | 서브 텍스트 | `color/text/body/secondary` ✅ | 바인딩 필수 |
| #000000 | 헤더 제목 | `color/text/title/primary` ✅ | 바인딩 필수 |
| #1d6ceb | selected 라벨·✓·컨트롤 | `color/text/state/accent` · `color/icon/blue` (컨트롤은 컴포넌트 재사용) ✅ | 바인딩 필수 |
| #e9e9e9 | 아바타 원 (**전경 요소**) | `color/icon/gray-light`(gray/300 #C4C4C4) — 아바타 원 fill. 아바타 안 사람 글리프=`color/icon/white` | **icon 계열 바인딩**(bg 아님) |
| 버튼/체크박스/라디오 색 | — | **컴포넌트 재사용으로 해결**(직접 색 안 그림) | Button·Checkbox·Radio 인스턴스 |
| 딤(사용처) | — | `color/overlay` ✅ | (세트엔 미포함) |

**→ 신규 토큰 0개.** 시트/행 표면(#fff)=`bg/level-0`. **아바타 원 등 전경 요소는 bg 토큰 금지 → icon 계열 사용**(사용자 지시 2026-07-03: "bg는 배경에만, 아바타류는 icon 색상"). 임의 hex 잔류 금지.

## 재사용 인스턴스 / 아이콘
- **컴포넌트 인스턴스(빌드 파일 내 노드로 부착):** Checkbox(off/on) · Radio(off/on) · Button(Mobile/LG, primary·secondary). → 빌더가 대상 파일에서 이름으로 찾아 인스턴스화(registry key 비어있음).
- **아이콘(ICON_KEYS importComponentByKeyAsync):** close ✅ · chevron ✅ · check ✅ · account(아바타) ✅ · **lock ❌ 미등록**.
  - **lock 처리:** ic_잠김(소스 154:7802) 이 ICON_KEYS 에 없음 → 빌더가 대상 파일에서 lock 아이콘 컴포넌트를 이름으로 찾아 인스턴스화. 못 찾으면 needs-decision(임의 벡터 금지).

## 네이밍 / 배치
- 세트명: `Bottom Sheet Option`, `Bottom Sheet` (기존 컨벤션 — 공백 표기, variant `속성=값`).
- 배치: 대상 파일에서 빌더가 metadata 로 빈 영역 확인(기존 mobile 계열 datepicker bottomsheet 인근 겹치지 않는 밴드). 좌표는 빌드 시 확정.

## 폰트
- 모든 텍스트 Pretendard. 인스턴스 라벨 override 시 Noto 일시 입력→`setTextStyleIdAsync` 재바인딩(body/16M·14R·title/20B). 비-Pretendard 잔존 금지.

## 결정 필요(HD) — 검문소 2
- 표면색 매핑(#fff→bg/level-0, #e9e9e9→bg/level-3), 아바타 행 포함, 컨트롤 재사용, radius 바인딩, 핸들/딤 미포함 = **⭐가 정함(위 반영).**
- **남은 운영 확인(사용자):** ① 빌드 대상 파일 = cysG5U1udpQqVagYY1hWHW(V3.0 라이브러리) 맞는지 + **빌드 직전 Figma 데스크톱에서 열어두기** ② use_figma 프록시(HTTPS_PROXY) 준비.
- **빌드 시 확정(빌더):** Checkbox/Radio/Button/lock 노드 id(대상 파일에서 이름으로 탐색), 배치 좌표. 못 찾으면 needs-decision.
