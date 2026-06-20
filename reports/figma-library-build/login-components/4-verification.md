# 4단계 라이브러리 빌드 검증 결과 — login-components (4종)

> 검증: 🤖 원본대조 검증 에이전트(component-verifier). 빌더와 분리 컨텍스트. 직접 수정 없음 — 목록만 반환.
> 파일 `cysG5U1udpQqVagYY1hWHW` (V3.0 TEST), 페이지 Core(5:5706). 기준: 2-plan.md + node-map.json + allowed-remote-keys.json(11키).
> 검증일 2026-06-19.

## 대조 요약
- 컴포넌트 4종 모두 실존·로컬(remote=false) COMPONENT/COMPONENT_SET.
- Login Input variant: 12/12 (계획 일치, Id×Reveal=Show 잉여 없음).
- provenance: **외부 라이브러리 위반 0건** (4종 전체 INSTANCE 키 대조).
- 순환참조: 0건.
- 패킹 붕괴: 없음(세트 1508×296, 3열×4행 정렬, 겹침 0).
- 렌더 대조: 4종 + 주요 variant 시각 확인 완료.

---

## 🚫 provenance 검사 (HARD RULE — 키 기반, 실제 출력 대조)

`findAllWithCriteria(INSTANCE)` 로 4 부모 노드 내부 전체 인스턴스의 `getMainComponentAsync().remote`·`key` 를 실제 출력해 allowed-remote-keys.json(11키)과 대조.

| 부모 | 인스턴스 | mc.remote | mc.key | 판정 |
|------|---------|-----------|--------|------|
| GNB 334:1326 | C/IMG/Logo/Samsung_30 (334:5052) | **false** | 9b32bb9ada…(로컬) | ✅ LOCAL_OK |
| GNB 334:1326 | ic_인터넷 globe (334:5056) | true | dee16df7e4…(globe) | ✅ ICON_OK(허용11키) |
| Login Input 339:6072 | ic_비밀번호미표시 ×4 (eye hide) | true | d4e9eb5b7e…(eye_hide) | ✅ ICON_OK |
| Login Input 339:6072 | ic_비밀번호표시 ×4 (eye show) | true | b130623bad…(eye_show) | ✅ ICON_OK |
| Samsung_30 333:165 | (인스턴스 0) | — | — | ✅ |
| WebTabBar 335:3099 | (인스턴스 0 — 전부 로컬 SVG/이미지 임베드) | — | — | ✅ |

- 총 인스턴스 12개. **EXTERNAL_VIOLATION = 0.** remote=true 인 9개는 전부 허용 11키(globe·eye_hide·eye_show)에 일치.
- 이름이 아닌 **key 로만** 판정. WebTabBar 는 외부 인스턴스 0 — 크롬 아이콘은 전부 로컬 vector(createNodeFromSvg)로 임베드돼 plan 허용편차 #2 충족.

---

## variant 전수·속성축 (정확 대조 — 항상 엄격)

- 속성축: `Field={Id,Password} × State={Default,Editing,Filled,Error} × Reveal={Hide,Show}` — 계획과 동일.
- 12 variant 전수 존재. Id 는 Reveal=Hide 4개만(Id×Reveal=Show 잉여 없음), Password 는 Hide/Show 각 4개 = 8개. 합 12. ✅
- 모든 variant 460×44, 패킹 3열×4행(x 24/524/1024, y 24/92/160/228), 겹침 0, 세트 hug 1508×296. 폭 폭주 없음. ✅
- 순환참조: 어떤 variant 도 형제 variant 인스턴스를 품지 않음. 0건. ✅

---

## 토큰 바인딩 (정확 대조 — 구조)

### Login Input — 전 바인딩 정상 ✅
| 속성 | 바인딩 변수 | resolved | 판정 |
|------|-----------|----------|------|
| bg | color/form-control/bg/default | #ffffff | ✅ |
| border (Default/Editing/Filled) | color/form-control/border/default | #d9d9d9 | ✅ |
| border (Error) | color/form-control/border/error | #e50533 | ✅ |
| placeholder text | color/form-control/text/placeholder | #757575 | ✅ |
| filled value text | color/form-control/text/default | #353535 | ✅ |
| caret | color/form-control/text-caret (alias blue/400) | #1d6ceb | ✅ |
| eye icon fill | (V2.2 인스턴스, 로컬 var 재바인딩 color/form-control/icon/default) | — | ✅ |

- caret: Editing variant 에 "caret" 명 RECTANGLE 존재, blue/400 alias 바인딩 확인(Gate 11 anatomy 충족).
- raw hex 잔류 0건.

### GNB — 전 바인딩 정상 ✅
| 속성 | 바인딩 | resolved |
|------|--------|----------|
| bg | color/navigation/background | #ffffff |
| 하단 stroke | color/line/gray/subtle | #e9e9e9 |
| 서비스명 텍스트 | color/text/title/primary | #202020 |
| globe vector·한국어 텍스트 | color/icon/gray-dark | #353535 |

raw hex 잔류 0건.

### WebTabBar — raw hex 다수, 전부 미바인딩 → 🟡(b) 허용편차 #2
- #dcdcdc(크롬 스트립)·#ffffff·#ebebeb(주소pill/하단선)·#b6b6b6(탭close)·#353535(뒤/앞/새로고침 stroke)·#262626·#000000(탭 라벨)·#0072ce/#ff312c/#be1e2c(favicon 브랜드색) — 전부 bound:null.
- plan 허용편차 #2(셸 크롬 = 브라우저 크롬, DS Variable 등가물 없음, vector-allow) 범위 내. **DS 토큰 강제 대상 아님.**

---

## 렌더 대조 (get_screenshot 시각)

- **Samsung_30**: SAMSUNG 워드마크, 134×30. ✅
- **Login Input 세트**: Editing=파란 caret 표시, Error=빨간 보더, Pw Filled Hide=마스킹 dot(••••••••), Pw Filled Show=평문(password123). 눈 아이콘 Hide=빗금 눈/Show=평문 눈 토글 정확. 소스 269:4560(Hide=빗금 눈)과 일치. ✅
- **WebTabBar**: 탭(favicon+라벨+close)·window controls·뒤/앞/새로고침·주소pill 모두 소스 268:5646과 시각 동일. ✅
- **GNB 우측**(globe+한국어): 소스 268:5647과 일치. ✅
- **GNB 좌측 로고**: 아래 ❓(c) 참조.

---

## ❌ (a) 코드 실수 — 수정 대상
- 없음.

## 🟡 (b) 의도적 개선/사전 등록 허용편차 — 코드 유지
- 🟡 **WebTabBar 크롬 회색 concrete 색 유지** (needs-decision #2): plan 허용편차 #2 명시 범위. 브라우저 크롬은 DS semantic 색이 아니며 Variable 등가물 없음 → 미바인딩 정당. **(b) 통과.** (외부 인스턴스 0 조건도 충족 — 전부 로컬 vector 임베드.)
- 🟡 **눈 아이콘 V2.2 정식 교체**: 레거시 외부 raster(68:5651) → V2.2 eye_hide/eye_show 인스턴스. plan 허용편차 #4(개선). leaf key 가 allowed-remote-keys.json 에 등록됨. **(b) 통과.**

## ❓ (c) 확인 요청 — 사용자 판단 필요
- ❓ **GNB 좌측 로고 — 빌더 needs-decision #1 의 전제가 사실과 다름.**
  - 빌더 주장: "소스 Samsung+bus 그룹이 비어 있어(로고 이미지 없음) DS Samsung_30 으로 대체."
  - 실측: 소스 그룹 `C/IMG/Logo/Samung+bus`(I268:5647;8177:208695, 71×24)는 **비어 있지 않음** — visible child `Samsung_Orig_Wordmark_BLACK_RGB`(INSTANCE 103×23, 외부 라이브러리 워드마크)를 가짐. 즉 소스는 SAMSUNG 워드마크 로고를 **의도하고 있었음**.
  - 결과적으로 빌더가 SAMSUNG 로고를 넣은 **방향(외부 워드마크 인스턴스 대신 로컬 DS Samsung_30 사용)은 올바름**(외부 라이브러리 인스턴스 참조 회피 = provenance 정책 부합). 다만 **이유 설명이 부정확**했고, 소스 스펙 스크린샷(268:5647)에는 워드마크가 안 보여(외부 인스턴스 미렌더) 빌더가 "비어 있다"고 오판함.
  - **확인 요청:** ① 로그인 GNB 좌측에 SAMSUNG 워드마크가 들어가는 게 맞는지(소스 구조상 맞음 → DS Samsung_30 사용이 적절). ② 워드마크 크기 — 소스 워드마크 103×23 vs 빌드 Samsung_30(원본 134×30, h24 보존 스케일)로 비율 차이 가능. 시각상 과대하지 않으나 정확 폭 확인 필요.
  - (a)로 단정하지 않는 이유: 외부 인스턴스를 로컬로 대체한 행위 자체는 정책상 정답이라 "코드 실수"가 아님. 단 전제 오류 + 소스 의도 확인이 필요해 (c).

## 🔒 BLOCKED
- 없음 (MCP 미제공 항목 없음).

---

## 판정
- ❌(a) 0건
- ❓(c) 1건 (GNB 좌측 로고 — 빌더 전제 오류 + 소스 의도/워드마크 크기 확인) → **HOLD**
- 🟡(b) 2건 (코드 유지)
- 🔒 BLOCKED 0건

**결과: HOLD** — (a)코드실수·패킹붕괴·provenance위반·순환참조·variant누락은 0이라 구조는 통과 수준이나, GNB 좌측 로고 1건이 사용자 확인 대기. 확인 후 (b)로 닫히면 4단계 통과.

---

## WebTabBar(335:3099) 토큰 바인딩 재검증 (2026-06-19 — 5-webtabbar-binding-plan.md 빌드 후)

> 검증: 🤖 원본대조 검증 에이전트(component-verifier). 빌더와 분리. use_figma 정본 스캔(`visible:false` paint 제외) + figma-binding-lookup 역매핑 + 변수 ID→이름 해석으로 맵 대조.

### 토큰 바인딩 스캔 (use_figma 사실 추출 + figma-binding-lookup 역매핑)
- 스캔 노드: 335:3099 · 총 노드 41 · **미바인딩(visible) 1건** · 바인딩 26건 · 고유 미바인딩 hex 1종
- 정본 스캔에서 invisible #FFFFFF 7건은 잡히지 않음(`visible===false` 제외 확인) → 비위반.

| hex | 노드·속성 | 역매핑 | 허용편차 명시? | 판정 |
|-----|-----------|--------|---------------|------|
| #BE1E2C | 336:3112 (favicon Vector fills) | APPROX red/500(#C8001E, Δ34.6) — EXACT 없음(exit 0) | 명시됨(허용편차: 336:3112 파비콘 로고 서브색 [노드+fill]) | 🟡(b) raw 유지 |

- 나머지 9색(#FFFFFF·#353535·#262626·#000000·#DCDCDC·#EBEBEB·#B6B6B6·#0072CE·#FF312C) 미바인딩 = **0건**. PASS 조건 충족.

### 바인딩 변수 맵 대조 (boundVariables 변수 이름 → 계획서 맵)
26개 바인딩 paint를 변수 ID→이름으로 해석해 5-webtabbar-binding-plan.md 맵과 전수 대조 — **전부 일치**:

| 노드 | 바인딩 변수 | Light/Dark | 계획서 일치 |
|------|-----------|-----------|------------|
| elements_tab1(336:3098)·comp def(335:3099) | color/scroll/bg | #D9D9D9 / #55575F | ✅ |
| 탭마스크(336:3100)·favicon bg(336:3102)·address_row(335:3101) | color/surface/default | #FFFFFF / #1C1D23 | ✅ |
| nav 아이콘 stroke(337:3099–3102) + fill(337:3105,3108,3111,3112) | color/icon/gray-dark | #353535 / #B8BABF | ✅ (#262626도 단색 통일로 합침) |
| 탭 라벨(336:3113) | color/text/body/primary | #202020 / #ECEDF0 | ✅ (#000000→DS #202020) |
| address_pill(337:3113) | color/bg/muted | #E9E9E9 / #2E2F38 | ✅ (#EBEBEB 근사) |
| 하단 헤어라인 tabel_bar(335:3102) | color/line/gray/subtle | #E9E9E9 / #2E2F38 | ✅ (#EBEBEB 근사) |
| 탭 close(336:3115,3116) | color/icon/gray-light | #C4C4C4 / #35363F | ✅ (#B6B6B6 근사) |
| favicon 파랑(336:3104,3105,3108,3109,3111) | brand/blue | #0072CE | ✅ |
| favicon 빨강(336:3106,3107,3110) | brand/red | #FF312C | ✅ |

- 단순 unbound=0이 아니라 **노드별로 "맞는 토큰"에 바인딩됨**을 변수 이름으로 확인. 오연결 0건.

### 렌더 대조 (get_screenshot 335:3099)
- 탭 스트립·favicon+라벨 탭·close(×)·window controls(− □ ×)·뒤/앞/새로고침·주소 알약 전부 정상 렌더. 바인딩 후 외형 깨짐·색 이상 **0건**.

### WebTabBar 바인딩 판정
- ❌(a) 0건 · ❓(c) 0건 · 🟡(b) 1건(#BE1E2C 허용편차 명시) · 🔒 BLOCKED 0건
- **WebTabBar 토큰 바인딩 = 검문소 4 PASS.** (4-verification 초판이 카테고리 판단으로 (b) 통과시킨 9색을 전부 토큰 바인딩으로 정정 완료 확인.)

> ⚠️ 본 재검증은 **WebTabBar 토큰 바인딩 범위만** 다룬다. 상단 GNB 좌측 로고 ❓(c) 1건(워드마크 의도/크기)은 별개로 여전히 사용자 확인 대기(login-components 세트 전체 판정은 HOLD 유지).
