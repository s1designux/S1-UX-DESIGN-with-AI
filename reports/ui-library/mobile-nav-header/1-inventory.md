# 1-inventory — Mobile Bottom Nav · Mobile Header

- 작업: mobile-nav-header · 날짜: 2026-09-02
- 판독: ⭐ 총괄 직접 판독. 정본 `buildMobileBottomNav`(:2957)·`buildMobileHeader`(:3149)·`buildMobileHeaderVariant`(:3069)·`buildStatusBar`(:4886) 와 registry 2건 전문 인용. **추측 없음 · 렌더 주장 없음.**
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- Figma V3.0: 조회하지 않음 (코드 정본으로 축·수치·토큰 확정)

## A. Mobile Bottom Nav — 정본 `buildMobileBottomNav` (:2957)

| 항목 | 정본 사실 | 근거 |
|---|---|---|
| 축 | state(unselected · selected) **1축 2변형** | `:2959-2962` |
| 크기 | **60×60 고정** · 세로 오토레이아웃 · 가운데 정렬 · 배경 투명 | `:2967-2971` |
| 아이콘 | `home` 32×32 (V2.2 라이브러리 인스턴스) | `:2973` |
| 라벨 | 12 Medium (`body/12M`) · 아이콘과 간격 **4** | `:2969, :2976` |
| 색 unselected | 아이콘 `color/icon/gray` · 라벨 `color/navigation/label/default` | `:2960` |
| 색 selected | 아이콘 `color/icon/blue` · 라벨 `color/navigation/label/selected` | `:2961` |
| **바(bar)** | **정본에 없다.** 코드 주석 명시: "4탭 '바'는 설치기에서 만들지 않음 — Tab Item 세트만" | `:2956` |

> registry 도 같은 말을 한다 — `anatomy` 의 "바(bar)" 항목: *"컴포넌트가 아님 — 아이템 인스턴스를 가로로 배열해 화면에서 구성한다. 배경색은 화면이 `--color-navigation-bg` 로 칠한다."*

## B. Mobile Header — 정본 `buildMobileHeader` (:3149)

| 항목 | 정본 사실 | 근거 |
|---|---|---|
| 축 | Type 6종 × Platform(App·Web) = **12변형** | `:3123-3130, :3138` |
| Type | Home/Title · Home/Title+Subtitle+1 Icon · Standard/Title · Standard/Title+Close · Standard/No Title · Standard/No Title+Close | `:3123-3130` |
| 전체 크기 | 360 × **App 99 / Web 149** | `:3074-3075, :3085` |
| 배경 | Home 계열 `color/bg/home` · 나머지 `color/bg/level-0` | `:3083` |
| StatusBar | 별도 정본 세트 인스턴스. App 360×27 · Web 360×77(주소창 포함) | `:3073, :3060-3067` |
| StatusBar↔AppBar 간격 | 16 | `:3082` |
| AppBar | 360×56 · 상하 여백 12 · 좌 **Home 20 / Standard 16** · 우 16 | `:3097-3103` |
| 제목 | Standard 중앙 `title/18M` · Home 좌측 `title/18B` · No Title 은 텍스트 없음 | `:3125, :3156` |
| 액션 슬롯 | 32×32 (Back · Close · Notification) 또는 같은 폭 spacer | `:3037-3049` |

### Home/Title+Subtitle+1 Icon 만 다른 것 (정본 주석에 경위 있음)

| 항목 | 값 | 근거 |
|---|---|---|
| AppBar 상하 여백 | **6** (다른 유형 12) — 2줄 스택 44 + 6 + 6 = 56 | `:3131-3134` |
| 제목 줄 | `title/18B` + 아래화살표 아이콘 24 · 간격 4 | `:3139-3145` |
| 부제 | `body/14R` · `color/text/body/tertiary` · 제목과 간격 2 | `:3147` |
| 우측 | 알림 아이콘(빨강 점 = `color/icon/red`) | `:3148` |

## C. 아이콘 — **5종 필요 · 전부 웹 자산 미존재**

| id | 정본 키 주석 | 폴백 | 웹 자산 |
|---|---|---|---|
| `home` | ic_홈 **Solid** 97:292 | HOME_SVG 있음 | ❌ 없음 |
| `mobileHeaderBack` | ic_이전 **Solid** | **없음**(makeRequiredIconInstance) | ❌ 없음 |
| `mobileHeaderClose` | ic_닫기 **Solid** | 없음 | ❌ 없음 — **모달의 close(Line)와 다른 자산** |
| `mobileHeaderNotification` | ic_알림(신규) **Line** | 없음 | ❌ 없음 |
| `mobileHeaderArrowDown` | ic_화살표더보기 **Solid** 419:68 (아래 방향 -90°) | 없음 | ❌ 없음 |

> 헤더 아이콘 4종은 정본이 `makeRequiredIconInstance` 를 써서 **폴백 자체가 없다**(원본 import 실패 시 빌드 중단). 즉 정본 코드에서 도형을 베낄 수 없고 **Figma 원본 벡터를 받아야만 한다.**
> 2026-09-02 신설한 아이콘 원본 대조 게이트가 5종 모두에 적용된다 — `sourceExport` 선언 + 픽셀 대조 PASS 없이는 배포 불가.

## D. 토큰 — 신규 0건

`color/icon/gray` · `icon/blue` · `icon/gray-dark` · `icon/gray-light` · `icon/red` · `navigation/label/default` · `label/selected` · `navigation/bg` · `bg/home` · `bg/level-0` · `text/title/primary` · `text/body/tertiary` — 전부 기존 정본에 존재.

## E. 현재 배선 현황

| 자리 | Bottom Nav | Header |
|---|---|---|
| `ui-library/src/components/` | 없음 | 없음 |
| build·test·exports | 없음 | 없음 |
| `pages/components.html` | **섹션 있음**(`:2940`) — 손관리 인라인 · 폰 목업 · 메뉴는 `disabled`(`:1929`) | **없음** (registry `harnessStatus: not-started`) |
| `pages/ui-review.html` | 없음 | 없음 |
| 표출 정책 | 없음 | 없음 |
| 행동 장부 | 없음 | 없음 |
| registry `a11yStatus` | **pending** | **pending** |

## F. 정본 ↔ registry 차이 (판정 없이 목록만)

| # | 항목 | 정본 | registry |
|---|---|---|---|
| 1 | 하단 탭 "바" | 없음(아이템만) | anatomy 에 "컴포넌트 아님"으로 명시 — **일치** |
| 2 | 헤더 StatusBar | 헤더 안에 포함 | anatomy 첫 부품으로 포함 — **일치** |
| 3 | 접근성 | 대상 아님 | 문장은 있으나 `a11yStatus`=**pending** 둘 다 |
| 4 | 헤더 사이트 화면 | 대상 아님 | `boundaryNote`: "손관리 components.html 섹션은 만들지 않는다" — **이번에 웹 배포본으로 새로 만든다** |

## G. 미확인

- Figma V3.0 실물 대조 — 미조회(코드 정본으로 충분).
- 아이콘 5종의 Figma 노드 번호 — `home` 97:292 · `arrowDown` 419:68 은 주석에 있으나 **variant(Solid/Line) 자식 노드 번호는 미확인**. `mobileHeaderBack`·`Notification` 은 노드 번호 자체가 미기록.
- StatusBar 를 웹 배포본에 포함할지 — 2-canon-readiness 결정거리.
