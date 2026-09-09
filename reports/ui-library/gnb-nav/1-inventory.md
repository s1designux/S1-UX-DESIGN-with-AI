# 1-inventory — GNB · Nav 전수 재고조사

작성 2026-09-09 · ⭐ 오케스트레이터 · 근거 = 정본 `plugins/figma-vars-installer/src/build-components.ts` 직접 판독

---

## A. 결론 먼저

| 대상 | 정본 | 웹 배포(dist) | 판정 |
|---|---|---|---|
| **gnb** | 있음 — `buildGNB`(3515) + `fillGnbMenu`(3133) + `buildGNBUtilIcon`(3155) + `buildLanguageIcon` | 없음 | **제작 대상** |
| **nav** | **없음** — `buildNavBar`(5818) 는 Android OS 크롬이고, registry `nav.json` 은 스켈레톤 | 없음 | **needs-decision (B1)** |

「미배포 12종」 목록은 낡았다. `ui-library/scripts/build.mjs` 의 `componentIds` 22개와 `ui-library/dist/components/` 66개 파일(22 × css·js·manifest)을 대조한 결과 **실제로 빠진 것은 gnb·nav 둘뿐**이다.
이미 dist 에 있는 10종: textarea · tab · multi-toggle · pagination · table · date-picker · time-picker · modal · mobile-bottom-nav · mobile-header.

---

## B. GNB — 정본 축 전수

### B-1. 세트 2개

정본 `buildGNB` 는 **두 개의 컴포넌트 세트**를 만든다.

| 세트 이름 | 축 | 변형 수 |
|---|---|---|
| `GNB` (바) | Align(Center-Between · Start) × Size(md · sm · xsm) | **6** |
| `GNB Menu` (메뉴 슬롯 1개) | Size(md · sm · xsm) × State(Default · Hover · Selected) | **9** |

바는 `GNB Menu` 인스턴스 3개를 슬롯("Menus")에 담는다. 첫 칸 Selected, 나머지 Default.

### B-2. 크기 (`GNB_MENU_SIZE` 3060줄 · `barH` 3535줄)

| Size | 바 높이 | 메뉴 높이 | 글자 | 메뉴 좌우 여백 | 밑줄 inset | 바 padding L/R |
|---|---|---|---|---|---|---|
| md | 56 | 56 | 18 Medium | 40 | 24 | 24 / 20 |
| sm | 48 | 48 | 18 Medium | 32 | 20 | 24 / 20 |
| xsm | 36 | 36 | 14 Medium | 32 | 20 | 20 / 24 |

- 메뉴 칸 폭 = `max(116, 글자폭 + 좌우여백×2)`
- 바 폭 = 1920 고정(정본 표현). 웹은 full-width 반응형으로 낸다 — registry `gnb.json` 이 "viewport(1280/1440/1920)는 full-width 반응형으로 통합" 이라 선언한다.
- 바 하단 1px 선 = `color/line/gray/subtle`. **z-order 주의** — 메뉴의 2px 강조선이 이 1px 선 위로 와야 한다(정본이 `insertChild(0, …)` 로 보더를 맨 아래에 둔다).

### B-3. 색 토큰 (전부 기존 · 신규 0건)

| 자리 | 토큰 |
|---|---|
| 바 배경 | `color/navigation/bg` |
| 로고 글자 | `color/text/title/primary` (20 Bold) |
| 메뉴 글자 · Default | `color/navigation/label/default-alt` |
| 메뉴 글자 · Hover / Selected | `color/navigation/label/selected` |
| 메뉴 밑줄 2px · Hover / Selected | `color/navigation/indicator/selected` |
| 메뉴 밑줄 · Default | 없음(투명) |
| 바 하단선 | `color/line/gray/subtle` |
| 유틸 아이콘 | `color/icon/gray-dark` |
| 언어 라벨 글자 | `color/text/body/primary` (14 Medium) |

**Hover 와 Selected 는 정본에서 시각이 같다**(`fillGnbMenu` 의 `active = state !== "Default"`). 웹에서도 같게 낸다.

### B-4. 유틸 영역

`GNB Utility Icon` 세트 — 레거시 1980:53435 의 5변형.

| language | menu | user | 라벨 |
|---|---|---|---|
| on | on | on | 언어·계정·메뉴 |
| on | off | on | 언어·계정 |
| on | off | off | 언어 |
| off | on | on | 계정·메뉴 |
| off | off | on | 계정 |

- 시각 순서 = language → user(계정) → menu. 항목 간격 8.
- GNB 바가 쓰는 것은 **all-on 변형 1개**(`GNBUtil:full`).
- 계정·메뉴 아이콘 = 32×32 박스 안 24 글리프 가운데 정렬.
- 언어 = `Language Icon` 세트(English · Korean) 인스턴스. 지구본 32×32 박스(24 글리프) + 간격 4 + 라벨 14 Medium + 우측 여백 8.

### B-5. 아이콘 3개 — 웹에 아직 없다

| id | Figma key | 정본 주석 | ui-library 자산 |
|---|---|---|---|
| `globe` | `dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2` | 인터넷(지구본) 35:3317 | **없음** |
| `account` | `a423e2e05cfff2f93062d6a83d6f3bdf79ca9647` | 계정/사용자 86:58 | **없음** |
| `menu` | `5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787` | 메뉴(햄버거) 97:227 | **없음** |

셋 다 `registry/figma/allowed-remote-keys.json` 허용목록에 등재돼 있다 — 임의 SVG 금지 대상이 아니다.
`GNB_UTIL_SVGS`(3067~3069줄)의 인라인 SVG 는 **설치기 폴백**이다(주석: "원본 글리프(components.html)"). 원본이 아니므로 그대로 웹 자산으로 쓰지 않는다 — `search` 아이콘 선례(2026-09-04, figma-local 로 실물 벡터 확보)를 따른다.

### B-6. 웹 배선 — 현재 상태

| 자리 | 현재 |
|---|---|
| `ui-library/src/components/gnb/` | 없음 |
| `ui-library/scripts/build.mjs` `componentIds` | gnb 없음 |
| `ui-library/scripts/test.mjs` `componentIds` | gnb 없음 |
| `ui-library/package.json` `exports` | gnb 없음 |
| `pages/ui-review.html` | GNB 섹션 없음 |
| `assets/js/ui-library-guide.js` `componentConfig` | gnb 없음 |
| `pages/components.html` `#gnb` | **손관리 인라인 harness 가 이미 있다**(2113~2440줄). 배포본 틀로 갈아끼워야 한다 |
| `registry/components/gnb.json` | 있음 — **`a11yStatus: "pending"`** |
| `registry/governance/component-presentation-policy.json` | gnb 에 `managedBy: ui-library-guide` 없음 |
| `registry/governance/ui-library-migration.json` | gnb 레코드 없음 |

### B-7. 미확인

- `pages/components.html` 의 기존 `#gnb` 인라인 harness 가 정본과 얼마나 어긋나 있는지 — 이 작업은 정본에서 새로 만들므로 대조하지 않는다(기존 화면을 배포 정본으로 삼지 않는다).
- Figma V3.0 실물 노드(6440:4032)의 렌더 — 아이콘 벡터 확보 외에는 참고하지 않았다.

---

## C. Nav — 왜 만들 수 없나

| 근거 | 내용 |
|---|---|
| 정본 카테고리 | `build-components.ts:6461` — `NavBar` 는 **Platform** 묶음(StatusBar · CI · LoginGNB · WebTabBar · Footer)이다. Navigation 묶음(6462)에는 없다 |
| 정본 내용 | `buildNavBar`(5818~5872) 는 Android OS 내비게이션 바 + 키보드 결합형 4변형(App · Web · App+Keyboard · Web+Keyboard). 앱 UI 가 아니라 OS 크롬이다 |
| registry | `nav.json` = 사이드바 내비게이션 서술. `codeStatus: not-started` · `harnessStatus: skeleton` · `figmaNodeId: ""` · `componentSetKey: ""` |
| registry 토큰 | `--color-surface-default` · `--color-bg-subtle` · `--color-action-primary-subtle` — 정본에 없는 이름이다 |
| 사이트 | `pages/components.html#nav-bar` = 토큰 4개 표만 있는 Element 스텁 |
| 탐색 | `Side Nav` · `Sidebar` · `LNB` · `nav-item` grep 0건 |

→ **B1 needs-decision.** 사이드바 내비게이션을 만들려면 정본 신설(Gate 34 river 승인)이 필요하고, Platform/NavBar 를 내보내려면 다른 Platform 크롬과의 형평 문제가 생긴다.
