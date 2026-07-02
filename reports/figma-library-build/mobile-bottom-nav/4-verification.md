# 4-verification.md — Mobile Bottom Nav (component-verifier §(C))

> 검증자: 🤖 component-verifier (빌더와 분리). 기준: 1-inventory.md · 2-plan.md · vars-data.ts · V2.4 원본 540:6025 · node-map-v3.json.
> 대상: 세트 `Mobile Bottom Nav` 723:6 (176×92), variant 722:12/722:17, 바 723:8 (360×60), 주석 724:22/724:23. fileKey cysG5U1udpQqVagYY1hWHW.

## 대조 요약
- variant: 2/2 (unselected 722:12 · selected 722:17) — 전수 ✅
- 패킹: 세트 176×92, variant relX 16/100 (겹침 0, 붕괴 0) ✅
- 토큰 바인딩 스캔: 미바인딩 raw hex **0건** ✅
- 폰트 스캔: TEXT 8개, 비-Pretendard **0건** ✅ (전부 Pretendard, 텍스트 스타일 바인딩됨)
- 인스턴스 출처(provenance): 아래 표

### 인스턴스 출처 스캔 (getMainComponentAsync — 실측)
| cls | inst 이름 | mainComponent | key | remote | count |
|-----|-----------|---------------|-----|--------|-------|
| ic_홈 아이콘 | ic_홈 | Property 1=Solid | 6bf422c9…ed4e | true | 6 |
| 바 인스턴스 | Mobile Bottom Nav | state=selected | bdbebf03… (로컬) | false | 1 |
| 바 인스턴스 | Mobile Bottom Nav | state=unselected | 3d56d22c… (로컬) | false | 3 |

- `ic_홈` 부모 세트 key = `c99f913689cd068deb2a5499154fed423ec9579f` = **task 지정 V2.2 정본 세트키와 일치**. `[에스원]GUI` 동명키(aee8e430…) 아님 확인.
- 아이콘 글리프 fill = Variable 바인딩(unselected `color/icon/gray` #55575f · selected `color/icon/blue` #1d6ceb). 벡터 직삽입 아님(인스턴스).

### 토큰 바인딩 스캔 (use_figma 사실 추출 + 결정론)
- 스캔 노드: 723:6·723:8·724:22·724:23 · 총 노드 34 · 미바인딩 0건 · 고유 hex 0종 → **바인딩 검사 PASS** (역매핑 불필요).
- variant별 실측 바인딩:
  - unselected: 아이콘 `color/icon/gray` ✅ · 라벨 `color/navigation/label/default` ✅
  - selected: 아이콘 `color/icon/blue` ✅ (base/white 아님 — 원본 control/indicator/selected 오참조 (a) 정정 정확 반영) · 라벨 `color/navigation/label/selected` ✅
  - 바 배경: `color/navigation/bg` (#ffffff light) ✅
  - 주석: `color/text/title/primary` ✅

### 폰트 스캔 (데이터 — 렌더 판정 아님)
- textCount 8, offenderCount 0. 전 라벨 Pretendard Medium / body/12M 바인딩, 주석 Pretendard Bold / title/14B 바인딩. **PASS**.

## ❌ (a) 빌드 실수 — 수정 대상
- ❌ **배치(item 8): 빌드 노드가 Navigation 섹션(687:18905)에 실제로 포함되지 않음.** 세트/바/주석(723:6·723:8·724:22·724:23)의 parentChain이 전부 **PAGE `80:16696`(---공통---)** 직속이며, `section.findAll` 로 확인 시 섹션이 이들을 자식으로 갖지 않음(`sectionContains: []`). 섹션 렌더(get_screenshot 687:18905, contentsOnly 기본)에도 하단내비바가 나타나지 않음. 좌표(x2384, y2680~2872)는 섹션 bounding box(x2320~4616, y0~2912) 안이지만 **parenting 되지 않아 섹션 멤버가 아님**.
  - 기대: 2-plan.md item 3 "배치: navigation 섹션 하단" + node-map "All new nodes sit inside the Navigation section."
  - 실제: page 직속 sibling (섹션 이동/관리 시 함께 이동 안 됨).
  - 조치: 4개 노드를 섹션 687:18905 의 자식으로 reparent (`section.appendChild`), 좌표 유지. (구조/시각 손상 없이 소속만 이동.)

## ❓ (c) 확인 요청 — 사용자 판단
- ❓ **아이콘 키 허용목록 미등록.** `ic_홈` Solid 는 정본 V2.2(세트키 c99f913689… 일치)이나 `registry/figma/allowed-remote-keys.json` 에 `home` 키(6bf422c9…)가 없음. provenance 스캔 raw 분류가 EXTERNAL_VIOLATION 로 뜬 이유. 허용목록 정본의 note 규칙대로 **정식 V2.2 아이콘이면 (c)애매 → 사용자 확인 후 allowed-remote-keys.json + build-components.ts ICON_KEYS 에 key 추가**. (빌드 자체는 올바른 컴포넌트 사용 — 이건 레지스트리 갭이지 빌드 실수 아님.)

## node-map 부정확 기록 (검증 참고)
- node-map-v3.json `page: {id:5:5706, name:"Core"}` 이나 실제 빌드 페이지 = `80:16696 "---공통---"`. placement.note "All new nodes sit inside the Navigation section" 은 사실과 다름(위 ❌ 참조). node-map 갱신 필요.

## 통과 항목 (✅)
1. variant 전수 2/2 · 패킹 붕괴 0 ✅
2. 토큰 바인딩(하드코딩 hex 0) ✅ · selected 아이콘 icon/blue ✅
3. 폰트 Pretendard 전수 ✅
4. 아이콘 = V2.2 ic_홈 Solid 정본 인스턴스(세트키 일치) ✅
5. 원본 충실성: 60×60 세로 오토레이아웃, 아이콘 32×32, gap 4, px 8, 중앙정렬, 라벨 "라벨" ✅ (V2.4 540:6025 레이아웃 일치)
6. 순환참조 0 ✅ (세트 variant 는 ic_홈만 포함, 바가 variant 인스턴스 포함=정상)
7. 렌더: unselected 회색/selected 파랑/바 첫탭 파랑+3탭 회색, 원본 레이아웃 동일 ✅

## 판정 (1차)
- ❌(a) 1건 (배치 reparent) → 3단계 반환, 빌더가 섹션에 reparent 후 재검증
- ❓(c) 1건 (아이콘 키 허용목록 등록) → 사용자 확인
- 토큰/폰트/아이콘출처/variant/패킹/렌더 = 전부 PASS

## 재검증 (reparent 수정 후 — 배치 항목 focused, 2026-07-02)
빌더가 4개 노드를 `section.appendChild(687:18905)` 로 reparent. 실측 재확인:
1. **parentChain**: 723:6·723:8·724:22·724:23 전부 `SECTION:687:18905 → PAGE:5:5706` — 섹션을 거침(page 직속 아님) ✅. `sectionContains` = 4/4 ✅.
2. **섹션 렌더**: get_screenshot(687:18905)에 하단내비바(주석 2줄 + 세트 회색/파랑 + 바 첫탭 파랑+3탭 회색)가 섹션 하단 안에 실제 포함돼 렌더됨 ✅.
3. **좌표 유지**: 세트 abs(2384,2680,176×92)·바(2384,2812,360×60)·주석(2384,2648)·(2384,2784) — 1차와 동일, 틀어짐 0 ✅. 섹션 bounds(2320,0,2296×2912) 내부, 기존 콘텐츠(≤y2534) 미겹침.
4. **바인딩 무손상**: unselected 아이콘 color/icon/gray·라벨 label/default / selected 아이콘 color/icon/blue·라벨 label/selected 유지 ✅. 폰트 스캔 비-Pretendard 0 ✅.

## 재검증 (타이틀↔보라배지 겹침 수정 후 — focused, 2026-07-02)
빌더가 세트 상단 여백 82px 확보 + 바 타이틀을 Spec 프레임(731:6479)으로 분리. 실측:
1. **겹침 해소 ✅** — 세트 723:6 176×92→**176×158**(top band 82px, 상단 abs 2680 유지). 세트타이틀 724:22 abs y=2704 = 세트top+24, 변형(rel y=82/abs 2762) 위 빈 밴드에 위치 → 탭 글리프·변형 배지 zone 과 분리. 바타이틀 724:23 rel(24,24) in Spec 프레임 731:6479, 바 723:8 rel(24,82) → **간격 58px**, 인스턴스 배지와 분리. get_screenshot(723:6·731:6479·687:18905 전체) 렌더에서 두 타이틀 모두 콘텐츠 위 독립 라인, 겹침 0.
2. **참고 일관성 ✅** — 두 타이틀 Pretendard Bold 14 / textStyle `title/14B` / fill `color/text/title/primary` / abs x=2408(rel x=88). 참고 Language Icon 타이틀(687:18246 x=88)·GNB Menu·GNB Utility 리듬과 동일.
3. **무손상 ✅** — 변형 722:12/722:17 둘 다 60×60·gap4·pl8(기하 불변). unselected 아이콘 color/icon/gray+라벨 label/default / selected 아이콘 color/icon/blue+라벨 label/selected 유지. 아이콘 인스턴스 key 6bf422c9…(V2.2) 32×32 유지. 폰트 Pretendard. 이전 PASS 그대로.
4. **parentChain ✅** — 723:6·724:22·731:6479 → `SECTION:687:18905→PAGE`. 723:8·724:23 → `FRAME:731:6479→SECTION:687:18905→PAGE`(신설 Spec 프레임 안, 그 프레임은 섹션 안). 5개 전부 섹션 경유.
- 섹션 687:18905 높이 2912→**3084** 자동 확장(더 커진 세트+Spec 프레임 수용, 정상).

## 판정 (최종)
- ❌(a) **0건** — 배치 reparent + 타이틀 겹침 모두 해소, 나머지 항목 무손상 확인.
- ❓(c) 1건 (아이콘 키 allowed-remote-keys.json 등록) → 사용자 확인 (빌드 결함 아님·레지스트리 갭).
- **검문소 4 통과** (❌(a) 0). 🟡(b) 없음. ❓(c)는 사용자 확인 사항으로 완료 보고 시 첨부.

## 재검증 (Dark 스펙 프레임 735:3 신규 — focused, 2026-07-02)
Dark 스펙 프레임 "Mobile Bottom Nav — Spec Dark" 735:3 (408×306, radius 8). 실측:
1. **다크값 해석 ✅** — 프레임에 explicit Dark mode(`VariableCollectionId:8:963`→`8:2`) 적용. get_variable_defs(735:3) 다크 해석: navigation/bg **#1c1d23**(gray-dark/100, 라이트 #ffffff 아님)·icon/gray #8a8c96·label/default #55575f·icon/blue **#3070d8**(blue-dark, selected 아이콘 다크)·label/selected #3070d8·text/title/primary #ecedf0. 전부 다크로 해석됨.
2. **하드코딩 hex 0 ✅** — 미바인딩 raw hex **0건**. 프레임 bg = `color/bg/level-1` Variable 바인딩(resolved #131418, raw 하드코딩 아님). 모든 fill/stroke 바인딩.
3. **폰트 ✅** — TEXT 2개(타이틀) 전부 Pretendard Bold, textStyle `title/14B`. 비-Pretendard 0(Inter 임시입력 흔적 없음, 재바인딩 성공). 데이터 스캔.
4. **참고 일관성 ✅** — radius 8·explicit Dark mode(8:2)·타이틀 rel(24,24) = 참고 687:18249(Language Icon Spec Dark)·687:18638(GNB Spec Dark)와 동일 리듬. 콘텐츠는 세트 723:6 인스턴스 6개(unselected 735:5·selected 735:12·바 탭 735:8975 selected+735:8980/8985/8990 unselected, 전부 mcParent=723:6, remote=false, 새 컴포넌트 아님). *차이 1건(개선)*: 참고 프레임 bg=미바인딩(null), 735:3 bg=`color/bg/level-1` 바인딩 → **더 엄격(하드룰 부합), 불일치 아님**. 빌더 ND-1(color/bg/default 부재로 실존 level-1 사용)=합리적.
5. **배치 ✅** — 735:3 abs(2872,2680) = 라이트 우측(라이트 콘텐츠 우단 max x=2792 대비 80px gap, 미겹침). 섹션 687:18905 자식(parentChain SECTION→PAGE). 참고 "Light | Spec Dark" side-by-side 패턴 준수.

## 판정 (Dark 포함 최종)
- ❌ **0건** — Dark 스펙 다크해석·바인딩·폰트·참고 리듬·배치 전부 PASS. 미해석/하드코딩/Noto/불일치 없음.
- ❓(c) 1건 (아이콘 키 allowed-remote-keys.json 등록) → 사용자 확인, 빌드 결함 아님.
- 🟡(b) 참고 대비 bg 바인딩 강화(개선) — 유지.
- **검문소 4 통과** (❌ 0).
