# Footer · CI · LoginGNB — 정본 판독 사실표

판독자: source-reader. 읽기 전용. 방법 = **B(추적)**: 렌더/스크린샷은 하지 않았다(Figma 캔버스 산출물이라 저장소엔 코드만 있음). 정본 코드 + 호출 헬퍼 + 토큰 정의를 끝까지 읽었다.
약칭: `BC` = `plugins/figma-vars-installer/src/build-components.ts` · `VD` = `plugins/figma-vars-installer/src/vars-data.ts` · `TS` = `plugins/figma-vars-installer/src/textstyles-data.ts` · `TK` = `assets/css/tokens.css` · `TY` = `assets/css/typography.css`.

판독 범위: BC 360-400, 950-1100(헬퍼), 1790-1900, 3640-3645, 6405-6535(Footer), 6784-6833(LoginGNB), 6943-7031(CI). 안 읽음: BC 나머지 전부(무관 컴포넌트), `component-guide-model.json`(10.6MB, 금지 대상 — 이름 grep 만).

---
## 0. 공통 헬퍼 (세 컴포넌트가 다 씀)

| 항목 | 사실 | 출처 |
|---|---|---|
| 텍스트 노드 생성 | `makeBoundText(chars, fontSize, style, colorVar)` — 폰트 family `Pretendard Variable`, 텍스트 스타일 키 = `textStyleKey(size, style)`; 스타일이 있으면 `setTextStyleIdAsync` 로 바인딩(없으면 raw 유지), fill = 변수 바인딩 | BC:973-988, TS:20 |
| 키 규칙 | Bold→`title/{size}B`, Medium→`body/{size}M`, Regular→`body/{size}R` (13→14, 9→10 보정 등) | BC:136-146 |
| 라이트 모드 | `setLightMode` — **COMPONENT 마스터에는 모드를 안 건다**(return), 세트/스펙 프레임에만 건다 | BC:362-378 |
| 다크 | variant 없음. **다크는 스펙 시트의 "Spec Dark" 사본 프레임에 `semanticDarkModeId` 를 걸어 보여줄 뿐**(별도 variant/컴포넌트 아님). 값은 Semantic 토큰의 dark 컬럼이 결정 | BC:1076-1082, BC:6531 |
| 아이콘 색 재바인딩 | `rebindIconColor` — 보이는 fill/stroke 를 변수로 교체(마스크 제외) | BC:1849-1858 |
| 아이콘 인스턴스 | `makeIconInstance(role, colorVar, size, fallbackSvg)` — `ICON_KEYS[role]` 라이브러리 컴포넌트 import, 크기가 다르면 `resize(size,size)`, 실패 시 SVG 폴백 | BC:1862-1891 |

---
## 1. Footer (`buildFooter`, BC:6429-6535)

### 1-1. Variant
| 속성 | 값 | 출처 |
|---|---|---|
| 세트 이름 | `Footer` | BC:6518 |
| Variant 속성 | **`Platform`** = `PC` · `Mobile` (variant 이름 `Platform=PC`, `Platform=Mobile`) | BC:6435, 6485; registry/components/component-facts.json:286-292 |
| 다른 축 | 없음. 상태(hover 등) 없음 | BC:6429-6535 |

### 1-2. Platform=PC
| 항목 | 값 | 출처 |
|---|---|---|
| 프레임 크기 | **1920×116** FIXED/FIXED | BC:6437-6439 |
| 레이아웃 | HORIZONTAL, primary=SPACE_BETWEEN, counter=CENTER | BC:6436, 6440-6441 |
| 패딩 | L=320, R=320 (raw), T=B=**Foundation `spacing/28`**(=28px) 변수 바인딩 | BC:6442-6446; VD:331 |
| 배경 | `color/navigation/bg` | BC:6447 |
| 테두리 | stroke `color/line/default`, INSIDE, **상단 1px만**(하·좌·우 0) | BC:6448-6450 |
| 모서리 | 설정 없음(0) | BC:6434-6450 |
| 자식 순서 | ① `content-left`(세로 블록) ② `C/IMG/Logo/S1_g`(로고) — SPACE_BETWEEN 으로 좌/우 끝 | BC:6473, 6479 |
| content-left | VERTICAL, hug/hug, fills 없음, itemSpacing **4**(raw) | BC:6453-6456 |
| content-left 자식 ① `links` | HORIZONTAL hug, itemSpacing **12**(raw), fills 없음 | BC:6459-6461 |
| links 안 | 텍스트 3개 + 사이 구분선 2개: `이용약관` / `개인정보 처리방침` / `위치기반 서비스 이용약관` | BC:6431, 6462-6469; registry/content/footer.json:8 |
| 링크 텍스트 | 10px Regular → 스타일 `body/10R`(10px, 행간 140%, 자간 +2%), 색 `color/text/body/tertiary` | BC:6463; TS:68 |
| 구분선(sep) | Rectangle **1×8**, fill `color/icon/gray-light`(PC) | BC:6465-6467 |
| content-left 자식 ② | 텍스트 `(주)에스원   사업자등록번호 208-81-13302    대표이사 정해린    04511 서울특별시 중구 세종대로 7길 25 에스원 빌딩` (공백 연속 보존: "(주)에스원" 뒤 3칸, "208-81-13302" 뒤 4칸, "정해린" 뒤 4칸), 10px Regular=`body/10R`, `color/text/body/tertiary` | BC:6471; registry/content/footer.json:10 |
| content-left 자식 ③ | 텍스트 `© S-1 Corp. All Rights Reserved.` 10px Regular=`body/10R`, `color/text/body/tertiary` | BC:6472; footer.json:11 |
| 로고 | `figma.createNodeFromSvg(S1_LOGO_SVG)`, 이름 `C/IMG/Logo/S1_g`, **42×16**(SVG 너비/높이 그대로), 색 `rebindIconColor(color/icon/gray)` | BC:6476-6479 |
| 로고 주석 vs 실제 | 주석은 "#757575 = gray/500" 이라 쓰지만 **바인딩은 `color/icon/gray`** (Light=`gray-dark/600`=#55575F, Dark=`gray-dark/700`=#8A8C96). 주석과 값이 다르다 — 정본은 바인딩(코드)이다 | BC:6478; VD:616, 103-104 |
| 로고 숨은 흰 fill | `createNodeFromSvg` 가 만드는 프레임에 `visible:false` 흰 fill 이 남음(렌더 영향 0). Footer·CI 공통 | reports/figma-library-build/ci-size-fix/verification.md:119 |

### 1-3. Platform=Mobile
| 항목 | 값 | 출처 |
|---|---|---|
| 프레임 크기 | **폭·높이 모두 hug(AUTO)** — 고정 크기 없음(링크·카피 폭에 맞춰 결정). 사양서 표기상 높이/폭 숫자 **미확인(hug)** | BC:6488 |
| 레이아웃 | VERTICAL, primary=MIN, counter=MIN(좌측 정렬) | BC:6488-6489 |
| 배경/테두리 | **없음**(`fills=[]`, stroke 설정 없음) | BC:6490 |
| 패딩 | L=16, R=16, T=8, B=8 (raw) | BC:6493 |
| itemSpacing | **Foundation `spacing/4`** 바인딩(4px) | BC:6491-6492; VD:322 |
| 자식 순서 | ① `links` 행 ② 카피라이트 텍스트 (**회사정보 줄 없음**) | BC:6508-6511 |
| links 행 | HORIZONTAL hug, itemSpacing **8**(raw), primary/counter=CENTER | BC:6496-6499 |
| 링크 텍스트 | **12px** Regular → `body/12R`(12px, 130%, 자간 0), `color/text/body/tertiary`; 문구 3개 PC와 동일 | BC:6501; TS:66 |
| 구분선(sep) | Rectangle **1×10**, fill **`color/line/default`** (PC는 `icon/gray-light` 라 토큰이 다름) | BC:6503-6506 |
| 카피라이트 | `© S-1 Corp. All Rights Reserved.` 12px Regular=`body/12R`, `color/text/body/tertiary`; `layoutAlign=STRETCH` + `textAlignHorizontal=CENTER` (컨테이너=링크행 폭에 맞춰 가운데) | BC:6510-6512 |
| 모바일 로고 | **없음** | BC:6484-6514 |

### 1-4. 스펙/배치 (웹 구현과 무관, 참고)
스펙 시트 행 라벨 PC/Mobile, 좌측정렬, cellW 1960, cellH 120 — BC:6524-6529.

### 1-5. Footer 에서 쓰는 토큰 → 정의
(§6 표 참조)

---
## 2. LoginGNB (`buildLoginGNB`, BC:6786-6833)

| 항목 | 값 | 출처 |
|---|---|---|
| Variant | **없음**(단일 컴포넌트, 세트 이름 `LoginGNB`, 컴포넌트 이름 `LoginGNB`). 축 `not-defined` | BC:6789, 6821-6822; component-facts.json:218 |
| 크기 | **1920×56** FIXED/FIXED | BC:6787, 6790-6791 |
| 레이아웃 | HORIZONTAL, primary=SPACE_BETWEEN, counter=CENTER | BC:6790-6791 |
| 패딩 | L=320, R=320, T=12, B=12 (전부 raw) | BC:6792 |
| 배경 | `color/navigation/bg` | BC:6793 |
| 테두리 | stroke `color/line/default`, INSIDE, **하단 1px만** | BC:6794-6796 |
| 모서리 | 설정 없음 | BC:6788-6796 |
| 자식 순서 | ① `service-group`(좌) ② `language-group`(우) | BC:6803, 6813 |
| service-group | HORIZONTAL hug/hug, counter=CENTER, itemSpacing 11, fills 없음. **자식은 서비스명 텍스트 하나뿐**(삼성 로고는 2026-06-24 제거 — 사용자 결정, 코드 주석) | BC:6799-6806 |
| 서비스명 | 텍스트 `[서비스명]` **16px Bold → `title/16B`**(16px, 130%, 자간 0), 색 `color/text/title/primary`, 노드명 `service-name` | BC:6805-6806; TS:47 |
| language-group | HORIZONTAL hug/hug, counter=CENTER, itemSpacing **8**, fills 없음 | BC:6809-6814 |
| language 자식 순서 | ① 지구본 아이콘 ② 텍스트 `한국어` | BC:6816-6818 |
| 지구본 | `makeIconInstance("globe", color/icon/gray-dark, **24**, GNB_UTIL_SVGS.lang)`, 노드명 `globe-icon`. ICON_KEYS.globe = key `dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2` = Figma V2.2 `ic_인터넷` 35:3317. 라이브러리 컴포넌트 자연 크기 24(=아이콘 manifest의 frame 24×24, 글리프 18×18 이 (3,3))이라 resize 는 사실상 무동작 — **인스턴스 자연 크기는 manifest 기록 기준이며 Figma 에서 직접 못 읽음(미확인)** | BC:6815-6816, 1800, 1862-1868; ui-library/src/assets/icons/manifest.json:431-455 |
| 지구본 폴백 SVG | `GNB_UTIL_SVGS.lang` — 24×24 viewBox 0 0 18 18 단일 path, fill currentColor(→ 색 바인딩) | BC:3640-3642 |
| 언어 텍스트 | `한국어` **14px Medium → `body/14M`**(14px, 130%, 자간 −2%), 색 **`color/icon/gray-dark`**(텍스트인데 아이콘 토큰 사용), 노드명 `language-label` | BC:6817-6818; TS:63 |
| 영어 variant | 없음 (`한국어` 고정) | BC:6817 |
| 스펙 시트 | 라벨 없음, cellW 1960, cellH 80 | BC:6824-6827 |
| 과거 Figma 구조 메모 | 노드 334:1326 (`Shell/LoginGNB`), 당시엔 Samsung_30 로고 + 서비스명 · 현재 코드는 로고 제거 | reports/figma-library-build/login-components/node-map.json:22-45 (역사 기록, 정본은 BC) |

---
## 3. CI (`buildCI`, BC:6970-7031)

### 3-1. Variant
| 속성 | 값 | 출처 |
|---|---|---|
| 세트 이름 | `CI` | BC:7024 |
| 속성 | **`Brand`** = `에스원` · `삼성`; **`Color`** = `White` · `Blue` · `Dark` → variant 이름 `Brand=에스원, Color=White` 등 **6개** | BC:6997, 7011; component-facts.json:177-186 |
| 배치 | 가로 간격 CI_COL=158, 세로 CI_ROW=60 (스펙용 위치, 구현 무관) | BC:6986, 6999, 7013 |
| 세트 배경 | Foundation `gray/50`(#F5F5F5) 바인딩 — White 로고 가시성용(세트 진열면) | BC:7027; VD:66 |

### 3-2. Brand=에스원 (3개)
| 항목 | 값 | 출처 |
|---|---|---|
| 컴포넌트 크기 | **78.75×30**, fills 없음(투명) | BC:6989, 6998 |
| 로고 | `createNodeFromSvg(S1_LOGO_SVG)` 에서 `width="42" height="16"` 만 `78.75×30` 으로 치환(viewBox `0 0 42 16` 유지 → 비율 2.625 보존, 1.875배 확대). 노드명 `logo` | BC:6990-6993, 7000-7001, 6965-6969 |
| 로고 크기 비고 | 원본 CI ≈77.86×30 인데 비율 보존 위해 78.75×30 채택(river 2026-08-21) | BC:6965-6969 |
| Color=White | 로고 색 `color/icon/white` (Light/Dark 모두 `base/white` #FFFFFF) | BC:6973; VD:620, 51 |
| Color=Blue | 로고 색 **Foundation `brand/ci`**(#004097) 직접 바인딩 — Semantic 아님(별칭 `color/icon/brand-ci` 제거됨) | BC:6971, 6974; VD:62 |
| Color=Dark | 로고 색 `color/icon/gray` | BC:6975 |
| 모드 | Foundation `brand/ci` 는 모드 불변 단색 | VD:62 |

### 3-3. Brand=삼성 (3개)
| 항목 | 값 | 출처 |
|---|---|---|
| 컴포넌트 크기 | **134×36**, fills 없음 | BC:7012 |
| 구조 | 자식 Rectangle 134×36 하나, 이름 `Samsung_Orig_Wordmark_{WHITE|BLUE|DARK}_RGB`, **fill = IMAGE (scaleMode FILL, imageHash)** | BC:7014-7017 |
| imageHash White | `5ef070ce43a101a072964c656c0e666fe81e4f78` | BC:6978 |
| imageHash Blue | `8de26dc1976bd0a64ea5b7207b6bf6d9e0396053` | BC:6979 |
| imageHash Dark | `100a4d3fdd0a5a9304c8251792f2d96089ac458a` | BC:6980 |
| 이미지 출처 | V3.0 TEST 파일 내장 해시(타 파일 미지원). **저장소에는 삼성 로고 원본(svg/png)이 없다**(§5) | BC:6963 |
| 크기 | Brand별 각자 크기(에스원 78.75×30, 삼성 134×36). 스케일 규칙: 에스원=SVG 비례 확대(viewBox 고정), 삼성=고정 134×36 이미지 FILL | BC:6964-6969 |
| 별도 컴포넌트 | `C/IMG/Logo/Samsung_30`(134×30, key `9b32bb9ada9e84cdd18550f641389874858fa6ee`, 노드 333:165) 는 CI 세트와 **별개** 컴포넌트. 폴백 사각형은 Foundation `brand/ci` fill, 모서리 2 | BC:1816-1843, 6943-6959 |

### 3-4. CI 는 상태·다크 variant 없음
다크 전용 variant 없음. 색은 위 토큰이 모드에 따라 결정(White/Blue 는 모드 불변, Dark(`icon/gray`)만 다크에서 바뀜).

---
## 4. S1_LOGO_SVG 전문 (BC:6427)

```
<svg width="42" height="16" viewBox="0 0 42 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.6826 14.3262H41.5254V16H30.6992V10.2461H32.6826V14.3262ZM10.1426 15.9902H8.32129V7.07812H7.39258C7.30419 11.1554 5.68825 13.0125 3.70117 13.0127C1.65723 13.0127 0 11.0554 0 6.73047C0 2.41216 1.65721 0.448242 3.70117 0.448242C5.52602 0.448409 7.03869 2.01912 7.34277 5.42676H8.32129V0.172852H10.1426V15.9902ZM12.9111 15.9902H11.084V0.173828H12.9111V15.9902ZM28.084 15.2305H15.084V13.5811H28.084V15.2305ZM41.2891 0.182617V13.0557H39.46V11.2832H36.459V9.64453H39.46V0.182617H41.2891ZM38.8672 8.87891H35.3379V12.1885H33.3799V8.87891H29.7305V7.3291H38.8672V8.87891ZM22.6143 2.46875C22.6143 4.89881 24.005 8.20501 27.7148 9.30078V11.0654C27.6961 11.063 23.8792 10.5615 21.583 6.69531C19.2775 10.5711 15.4512 11.0654 15.4512 11.0654V9.30078C19.1607 8.21325 20.5518 4.89883 20.5518 2.46875V0.551758H22.6143V2.46875ZM3.70215 2.41211C2.66837 2.41211 1.83011 3.41277 1.83008 6.7334C1.83008 10.0732 2.66835 11.0557 3.70215 11.0557C4.73624 11.0556 5.57422 10.0731 5.57422 6.7334C5.57418 3.41295 4.73622 2.41222 3.70215 2.41211ZM34.3525 0C36.6151 0 38.4492 1.17983 38.4492 3.41797C38.449 5.69092 36.615 6.83496 34.3525 6.83496C32.0903 6.83485 30.2561 5.69081 30.2559 3.41797C30.2559 1.17994 32.0901 0 34.3525 0ZM34.3486 1.57227C33.1672 1.57227 32.2091 2.36269 32.209 3.44043C32.209 4.51861 33.1671 5.30859 34.3486 5.30859C35.5303 5.3084 36.4883 4.51026 36.4883 3.44043C36.4882 2.35834 35.5302 1.57246 34.3486 1.57227Z" fill="#757575"/></svg>
```
단일 path, 원본 fill `#757575`(색은 항상 토큰으로 교체됨). 원본 Figma 출처 `C/IMG/Logo/S1_g` 391:17346 (BC:6426).

---
## 5. 에셋 · 아이콘 재사용

| 항목 | 사실 | 출처 |
|---|---|---|
| 저장소 내 삼성 로고 파일 | **없음.** `find`(node_modules·.claude/worktrees 제외, 이름에 samsung/logo/wordmark/s1_g)에 걸린 것은 `assets/img/logo-s1-ux-design-guide.svg`, `assets/img/logo-s1-ux-guide.svg`(가이드 사이트 자체 로고 — 정본 CI 와 무관) 뿐. 삼성 이미지는 Figma 내장 해시만 존재 → **웹용 삼성 워드마크 이미지는 신규 확보 필요(미확인: 어디서 export 할지)** | find 결과 |
| S1 로고 svg 파일 | 정본은 BC:6427 문자열 **한 곳뿐**, 별도 .svg 파일 없음 | grep S1_LOGO_SVG |
| 지구본 아이콘 | **이미 ui-library 에 있음**: `ui-library/src/assets/icons/globe.svg`(24×24, 내부 18×18 글리프 (3,3)), manifest id `globe`, symbolId `s1-icon-globe`, sourceKey `dee16df7…`(=BC ICON_KEYS.globe 와 동일) | ui-library/src/assets/icons/manifest.json:431-455 |
| GNB 의 재사용 방식 | 지구본을 CSS mask 로 표시(`mask: url("../assets/icons/globe.svg") center/contain`), 배경색 `var(--color-icon-gray-dark)`, 크기 `var(--sizing-32)`(GNB 는 32px) | ui-library/src/components/gnb/gnb.css:207-215 |
| GNB 언어 텍스트 | `font-size 14, weight medium, line-height 130%, letter-spacing tight(−0.02em)`, 색 `var(--color-text-body-primary)`, gap `spacing-4`, padding-right `spacing-8` | gnb.css:171-190 |
| LoginGNB ↔ GNB 차이(사실) | LoginGNB 지구본 **24px**·언어 텍스트 색 `icon/gray-dark`·아이콘-글자 간격 **8**; GNB 웹 CSS 는 지구본 **32px**·텍스트색 `text/body/primary`·간격 spacing-4 — 값이 다르므로 단순 재사용 시 크기·색·간격을 LoginGNB 값으로 재지정해야 함(판단 아님, 값 비교) | BC:6809-6818 vs gnb.css:171-215 |
| 웹 사이트 마스크 아이콘 | 스크린샷은 file:// 에선 마스크 아이콘 안 그려짐 → http 로 확인(메모리 항목, 미재검증) | MEMORY |

---
## 6. 토큰 해소표 (정본 VD → tokens.css)

모두 `VD` 의 SEMANTIC_COLOR 항목. Foundation 값은 VD 51-106, tokens.css 에 같은 값 존재 확인.

| 토큰 경로 | Light | Dark | CSS 변수 (TK) | 쓰는 곳 |
|---|---|---|---|---|
| `color/navigation/bg` (VD:633) | base/white #FFFFFF | gray-dark/100 #1C1D23 | `--color-navigation-bg` (TK:553 / 다크 TK:795) | Footer PC 배경, LoginGNB 배경 |
| `color/line/default` (VD:626) | gray/100 #E9E9E9 | gray-dark/400 #35363F | `--color-line-default` (TK:549 / 다크 TK:791) | Footer PC 상단선, LoginGNB 하단선, Footer Mobile sep |
| `color/text/body/tertiary` (VD:759) | gray/500 #757575 | gray-dark/700 #8A8C96 | `--color-text-body-tertiary` (TK:637 / 다크 TK:879) | Footer 모든 텍스트 |
| `color/icon/gray-light` (VD:618) | gray/300 #C4C4C4 | gray-dark/400 #35363F | `--color-icon-gray-light` (TK:543 / 다크 TK:785) | Footer PC sep |
| `color/icon/gray` (VD:616) | gray-dark/600 #55575F | gray-dark/700 #8A8C96 | `--color-icon-gray` (TK:541 / 다크 TK:783) | Footer 로고, CI Dark |
| `color/icon/gray-dark` (VD:617) | gray/800 #353535 | gray-dark/800 #B8BABF | `--color-icon-gray-dark` (TK:542 / 다크 TK:784) | LoginGNB 지구본·"한국어" |
| `color/text/title/primary` (VD:767) | base/black #000000 | gray-dark/900 #ECEDF0 | `--color-text-title-primary` (TK:645 / 다크 TK:887) | LoginGNB 서비스명 |
| `color/icon/white` (VD:620) | base/white #FFFFFF | base/white #FFFFFF | `--color-icon-white` (TK:545 / 다크 TK:786) | CI 에스원 White |
| Foundation `brand/ci` (VD:62) | #004097 (모드 불변) | 동일 | `--color-brand-ci` (TK:12, "UI 직접 사용 금지" 주석) | CI 에스원 Blue |
| Foundation `gray/50` (VD:66) | #F5F5F5 | — | `--color-gray-50` (TK:23) | CI 세트 진열 배경(컴포넌트 아님) |
| Foundation `spacing/28` (VD:331) | 28 | — | `--spacing-28` (TK:281) | Footer PC 상하 패딩 |
| Foundation `spacing/4` (VD:322) | 4 | — | `--spacing-4` (TK:272) | Footer Mobile itemSpacing |

(다크 TK 줄은 `[data-theme="dark"]` 블록 TK:660~; 다크 줄번호 중 783-786 은 직접 열람, 나머지는 grep 결과 줄.)

### 텍스트 스타일 → typography.css 클래스
| 스타일 (TS) | 값 | CSS 클래스 (TY) |
|---|---|---|
| `body/10R` (TS:68) | 10px, 행간 140%, 자간 +2% | `.typo-body-10r` (TY:131-) |
| `body/12R` (TS:66) | 12px, 130%, 자간 0 | `.typo-body-12r` (TY:119-) |
| `body/14M` (TS:63) | 14px, 130%, 자간 −2% | `.typo-body-14m` (TY:101-) |
| `title/16B` (TS:47) | 16px, Bold, 130%, 자간 0 | `.typo-title-16b` (TY:51-) |

폰트 패밀리: `Pretendard Variable` (TS:20).

---
## 7. 레지스트리 · 안내 페이지 · 기존 웹 구현

| 질문 | 답 | 출처 |
|---|---|---|
| `registry/components/` 에 Footer/CI/LoginGNB 전용 json | **없음.** (`ls | grep foot/ci/login` → gnb*.json 만) → 따라서 **status / a11yStatus / uiLibraryStatus / Figma nodeId 필드는 이 세 부품에 존재하지 않음 = 미확인(없음)** | ls registry/components |
| 대신 존재하는 기록 | `component-facts.json`(CI :176, LoginGNB :217, Footer :286: variantAxes·geometry·anatomy·tokenBindings) · `component-behavior.pc.json`(CI :654, Footer :667, LoginGNB :680: status=`static`, events none, keyboard/focus not-applicable, a11y: CI="provide meaningful alternative text when the logo conveys identity", Footer·LoginGNB="not-defined") · `component-guide-model.json`(이름 :35,:46,:68, 읽기 금지 파일) | 각 파일:줄 |
| facts 의 Footer anatomy/바인딩 | anatomy `C/IMG/Logo/S1_g, content-left, links`; tokenBindings 에 `color/icon/gray-light` 있고 **`color/icon/gray`(로고) 는 빠져 있음**(로고 색 바인딩이 facts 에 안 잡힘 — facts 는 파생이라 증거 아님, 정본은 BC:6478) | component-facts.json:321-333 |
| `component-presentation-policy.json` | 세 부품 항목 **없음**(footer 는 모달의 Footer 축 얘기뿐) | grep |
| `ui-library-migration.json` | 세 부품 항목 **없음**(등록 id 목록: input … gnb … list-row 등) | ui-library-migration.json id 목록 |
| `component-page-coverage.json` | CI·LoginGNB·Footer 는 **`noSectionNeeded`** — 사유 "Platform/Shell — 제외(사용자 결정 2026-06-30 A)" | component-page-coverage.json:55-70 |
| `registry/patterns/index.json` | 로그인 패턴이 `CI`·`Footer`(앱: StatusBar,NavBar,CI,Footer,…) 와 `WebTabBar, LoginGNB, Footer, CI`(PC) 를 coreComponents 로 의존 | registry/patterns/index.json:26-33, 235-243 |
| pages/components.html 섹션 | `id="login-gnb"`(:2633) `id="ci"`(:2686) `id="footer"`(:2738) **토큰 표만 있는 낡은 섹션**(렌더 부품 없음; CI 표는 `--color-brand-blue` #0072CE 등 현 정본과 다른 값, Footer 표도 `--color-bg-default` 등 현 정본 바인딩과 다름 — 파생 불일치, 정본 아님) | pages/components.html:2633-2790 |
| components.html 내비 | 버튼 **있으나 `disabled`**: CI Logo(:1833, platforms=pc mobile) · Footer(:1834, platforms=**pc**) · Login GNB(:1835, platforms=pc) | components.html:1833-1835 |
| 기존 웹 구현(ui-library/assets/css/pages) | `ui-library/src/components/` 에 footer·login-gnb·ci **디렉터리 없음**(목록: assist-button … time-picker, toggle). 클래스 `s1-footer`/`s1-login`/`s1-ci` grep 결과 없음(매치는 components.html/archive/ pipeline-status/update-management/registry-data-bundle 의 섹션·이름 언급뿐) | ls, grep |
| Figma 노드 ID | Footer PC 컴포넌트 `S1_g` 인스턴스 1654:38237(과거 실측), CI 세트 1545:6723(과거 실측), 로그인 패턴 section 1562:2(`registry/patterns/index.json:24`); Footer 원본 `login_Footer` 269:5722(footer.json:5), `C/IMG/Logo/S1_g` 391:17346(BC:6426), `Samsung_30` 333:165, LoginGNB(구) 334:1326. **세 세트의 현재 정본 nodeId 는 레지스트리에 기록 없음 = 미확인** | reports/figma-library-build/ci-size-fix/verification.md:6,21; node-map.json |

---
## 8. 미확인 / 주의
- 세 부품 모두 registry 컴포넌트 메타(status/a11yStatus/uiLibraryStatus/figma nodeId) 없음 → 신규 작성 필요 시 정본 신설 승인 사안(하드룰 H6②)일 수 있음. 판정은 하지 않음.
- Footer PC 고정 높이 116 vs 내용(28+28 패딩 + 3줄 hug) — 내용 높이는 Figma 렌더 미측정(**미확인**). 코드상 counter=CENTER, 고정 116.
- LoginGNB 지구본 실제 인스턴스 크기(24 vs 라이브러리 원본 크기) Figma 직접 미확인 — manifest 기록만 24×24.
- Footer 로고 색: 코드 주석(#757575)과 실제 바인딩(`icon/gray` Light #55575F)이 다르다.
- 삼성 워드마크 이미지 원본(웹용)은 저장소 부재.
- Mobile Footer 폭: hug 이므로 웹에서 360 같은 폭을 쓸지는 정본에 없음. 정본 geometry 는 Mobile 에서 `sep` 1×10 만 기록(component-facts.json:312-319).
- 렌더 확인(A) 미수행 — 레이아웃 서술은 코드 추적(B) 기준.
