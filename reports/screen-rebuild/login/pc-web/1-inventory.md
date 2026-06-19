# screen-rebuild 1단계 — 원본 재고조사: PC 웹 로그인 첫화면

- **파일:** SW-UX-GUIDE-V3.0-TEST (key: `cysG5U1udpQqVagYY1hWHW`)
- **원본 화면 노드:** `261:13153` "웹_로그인 화면"
- **읽은 도구:** get_metadata(261:13153) → get_screenshot(전체) → get_design_context + get_variable_defs(헤더 261:13155 / 로그인카드 261:13158 / 푸터 262:14385)
- **빌드 금지 — 본 단계는 읽기/조사 전용**

---

## 0. 전체 프레임 · 레이아웃 좌표

| 항목 | 값 | 비고 |
|------|----|------|
| 전체 프레임 | **1920 × 1080** ✅ (표준 충족) | id 261:13153 |
| 헤더 묶음 Frame 2087336350 | x=0 y=0 **1920 × 157** | tab bar(101) + GNB(56) |
| └ web tab bar | x=0 y=0 1920 × 101 | 크롬 탭/주소창 chrome (목업) |
| └ login_GNB | x=0 y=101 1920 × 56 | SAMSUNG 통근버스 운영 시스템 + 한국어 |
| 중앙 SAMSUNG 로고 | x=893 y=244 **134.35 × 30** | id 261:13154, 화면 중앙(1920/2=960, 로고 중심 ≈960) |
| **로그인 카드 컨테이너** Frame 2087335399 | **x=730 y=324 460 × 232** | 중앙정렬: 730 = (1920−460)/2 ✅, 폭 460 고정 |
| └ 입력+체크+버튼 Frame 2087336271 | x=0 y=0 460 × 190 | gap 24 (입력그룹↔버튼) |
| └ 하단 링크 Frame 2085674014 | x=70 y=214 320 × 18 | 카드 폭 460 안에서 320 가운데 정렬 |
| 푸터 login_Footer (표시되는 것) | **x=0 y=960 1920 × 120** | id 262:14385, 화면 하단 고정 |
| 푸터 login_Footer (스트레이) | x=0 **y=6576** 1920 × 120 | id 261:13171, **프레임 밖(1080 초과)** — 표시 안 됨, §미확인 참조 |

레이아웃: 헤더(상단 고정) / 중앙 로고+카드(세로 중앙 부근) / 푸터(하단 고정). 본문 영역 흰 배경.

---

## 1. 전수표

> 텍스트는 get_design_context 코드 문자열 verbatim. 색은 get_variable_defs raw hex.

| # | 요소 | 텍스트(verbatim) | 색(raw hex) | 크기(W×H, font px/lh) | 상태 | 아이콘(노드/이름) | 구조/계층 | 읽은 방법 |
|---|------|------------------|-------------|----------------------|------|------------------|----------|----------|
| 1 | 크롬 탭바(목업) | 탭 라벨 `삼성 통근버스 운영 시스템` | bg `#dcdcdc` / 주소창 bg `#ebebeb` | 1920 × 101 | — (장식) | favicon_16, icon/tab/close, previous(261:12136), refresh(261:12177) | web tab bar 261:12227 (chrome 탭+주소창+하단라인) | get_design_context 261:13155 |
| 2 | GNB 바 | — | bg `color/navigation/background` `#ffffff`, 하단선 `color/line/gray/subtle` `#e9e9e9` | 1920 × 56, padding x=320(`spacing/320`) y=12(`spacing/12`) | default | — | login_GNB 261:13157, 좌:브랜드 / 우:유틸 양끝 정렬 | get_design_context 261:13155 |
| 3 | GNB SAMSUNG 로고 | (이미지) | — | 103 × 23 | — | C/IMG/Logo/Samsung (261:12430) | 브랜드 묶음 C/IMG/Logo/Samung+bus 내 | get_design_context 261:13155 |
| 4 | GNB 서비스명 | `통근버스 운영 시스템` | `color/text/title/primary` `#000000` | 16px / lh 1.0(`leading-none`), Pretendard Bold | — | — | 로고 우측 11px gap | get_design_context 261:13155 |
| 5 | 언어 선택 | `한국어` | 텍스트 `#353535`(`Font/Input`/Gray800) | 14px / lh 1.3, Pretendard Medium | default(type=korea+text) | ic_인터넷/globe (261:12347, Component 80) 24px | slot_utility 우측, 아이콘+텍스트, pr 8 | get_design_context 261:13155 |
| 6 | 중앙 SAMSUNG 로고 | (이미지) | — | 134.35 × 30 | — | C/IMG/Logo/Samsung_30 (261:13154) | 카드 위 중앙, y=244 | get_metadata + 전체 스크린샷 |
| 7 | 아이디 입력 | placeholder `아이디를 입력해 주세요.` | bg `color/form-control/bg/default` `#ffffff`, border `color/form-control/border/default` `#d9d9d9`, placeholder `color/form-control/text/placeholder` `#757575` | 460 × 44(`sizing/form-control/height/md`), 14px/lh1.3 Pretendard Regular, radius `radius/control/sm` 4, border-width 1, pl 16 pr 12 py 8 | empty/default | (없음) | input 261:13162, 카드 1행 | get_design_context 261:13158 |
| 8 | 비밀번호 입력 | placeholder `비밀번호를 입력해 주세요.` | bg `#ffffff`, border `#d9d9d9`, placeholder `#757575` | 460 × 44, 14px/lh1.3 Regular, radius 4, pl16 pr12 py8, justify-between | empty/default | **ic_비밀번호미표시** (I261:13163;1980:48706 / 원본 68:5651) 24px, eye-off 토글 | input 261:13163, 아이디 아래 gap 8 | get_design_context 261:13158 |
| 9 | 아이디 저장 체크박스 | `아이디 저장` | box bg `color/control/bg/default` `#ffffff`, box border `color/control/border/default` `#d9d9d9`, 라벨 `color/control/label/default` `#353535` | box 18 × 18(`sizing/18`), radius `radius/control/xs` 2; 라벨 12px/lh1.3 Regular | unchecked/default | (없음) | checkbox 261:13164, 박스+라벨 gap 8, 비번 아래 gap 8 | get_design_context 261:13158 |
| 10 | 로그인 버튼 | `로그인` | bg `color/button/bg/disabled` `#f5f5f5`, border `color/button/border/disabled` `#d9d9d9`, 라벨 `color/button/label/disabled` `#c4c4c4` | 460 × 44(`sizing/button/height/md`), 라벨 14px/lh1.3 Pretendard Medium, radius `radius/4` 4, min-w 90, px16 py12 | **disabled** (입력 전 상태) | (없음) | button 261:13165, 입력그룹과 gap 24 | get_design_context 261:13158 |
| 11 | 아이디 찾기 링크 | `아이디 찾기` | `color/text/body/tertiary` `#757575` | 14px/lh1.3 Pretendard Regular, center | default | (없음) | m_login_bottom 261:13167, 좌측 텍스트 | get_design_context 261:13158 |
| 12 | 구분선(링크 사이) | (장식 1px) | `color/icon/gray-light` `#c4c4c4` | 1 × 12 | — | (없음, Rectangle 261:13169) | 링크 사이 gap 11 | get_design_context 261:13158 |
| 13 | 비밀번호 찾기 링크 | `비밀번호 찾기` | `#757575` | 14px/lh1.3 Regular, center | default | (없음) | m_login_bottom 우측 텍스트 (노드명 `비밀번호 초기화`이나 표시 텍스트=`비밀번호 찾기`) | get_design_context 261:13158 |
| 14 | 푸터 바 | — | bg `color/navigation/background` `#ffffff`, 상단선 `color/line/gray/subtle` `#e9e9e9` | 1920 × 120, px 320 py 28(`spacing/28`), 양끝 정렬 | — | — | login_Footer 262:14385 | get_design_context 262:14385 |
| 15 | 약관 링크 1 | `이용약관` | `color/text/body/tertiary` `#757575` | 10px/lh1.3 Pretendard Regular, ls 0.2 | default | — | Frame 274 262:14387, gap 5 | get_design_context 262:14385 |
| 16 | 약관 링크 2 | `개인정보 처리방침` | `#757575` | 10px/lh1.4 **Pretendard Medium** (body/10M) | default | — | 구분선 사이 | get_design_context 262:14385 |
| 17 | 약관 링크 3 | `위치기반 서비스 이용약관` | `#757575` | 10px/lh1.3 Pretendard Regular | default | — | — | get_design_context 262:14385 |
| 18 | 푸터 구분선 ×2 | (장식 1px) | `color/icon/gray-light` `#c4c4c4` | 1 × 8 | — | — | 약관 링크 사이 (262:14389, 262:14408) | get_design_context 262:14385 |
| 19 | 사업자 정보 | `(주)에스원   사업자등록번호 208-81-13302    대표이사 정해린    04511 서울특별시 중구 세종대로 7길 25 에스원 빌딩` | `#757575` | 10px/lh1.3 Regular, ls0.2, w 505 | — | — | 262:14391 | get_design_context 262:14385 |
| 20 | 카피라이트 | `© S-1 Corp. All Rights Reserved.` | `#757575` | 10px/lh1.3 Regular, ls0.2, w 155 | — | — | 262:14392 | get_design_context 262:14385 |
| 21 | 푸터 S1 로고 | (이미지) | — | 41.53 × 16 | — | C/IMG/Logo/S1_g (262:14393) | 푸터 우측 | get_design_context 262:14385 |

> ※ 스크린샷에는 푸터 우측 로고가 `에스원`(텍스트형 워드마크)으로 보임 — 이미지 에셋(S1_g)이며 모양은 §미확인-3 참조.

---

## 2. 항목 요약 (지시 명시 요청분)

### 입력 필드 (2개)
1. **아이디** — placeholder `아이디를 입력해 주세요.` (no 아이콘)
2. **비밀번호** — placeholder `비밀번호를 입력해 주세요.` + eye-off 토글 아이콘(ic_비밀번호미표시, 비밀번호 숨김 상태)
- 둘 다 460 × 44, radius 4, border `#d9d9d9`, bg white, placeholder `#757575`. 세로 gap 8.

### 버튼 (1개)
- **로그인** — 텍스트 `로그인`, 460 × 44 폭 100%, radius 4. **현재 상태 = disabled** (bg `#f5f5f5`, border `#d9d9d9`, label `#c4c4c4`). variant: 입력 전 비활성 버튼(정본 button 컴포넌트의 disabled 상태).

### 체크박스 / 링크
- 체크박스 1개: `아이디 저장` (unchecked). ※ "자동로그인"·"아이디 저장(remember)"은 `아이디 저장` 단일만 존재. 자동로그인 없음.
- 하단 링크 2개: `아이디 찾기` | `비밀번호 찾기` (구분선 사이). **회원가입 링크 없음.**

### 로고 / 브랜드 / 배경
- GNB: SAMSUNG 로고(103×23) + `통근버스 운영 시스템`(16px Bold).
- 중앙: SAMSUNG 로고(134.35×30), 카드 위.
- 푸터: S1(에스원) 워드마크 로고(41.53×16).
- **배경:** 본문 흰색(별도 배경 이미지 없음). 탭바만 회색 chrome 목업. 배경 이미지 요소 없음.

### 1440×1000 최소해상도 대응 영향 (고정폭/여백 요소)
- **GNB/푸터 좌우 padding = 320px 고정** (`spacing/320`). 1440 폭에서 좌우 320×2=640 → 본문 800. 1440에서도 카드(460 중앙)는 안전하나, GNB 브랜드/유틸이 320 인셋이라 1440에서 양끝 여백이 커 보일 수 있음(좌우 320 그대로면 콘텐츠 폭 800).
- **로그인 카드 = 460px 고정폭**, 화면 중앙(left = (vw−460)/2) 정렬 — 가변 폭 아님. 1440에서도 460 유지, 좌우 여백만 변동.
- 높이: 화면 1080 기준 푸터 y=960(하단 120). 1000 높이 대응 시 푸터 위치/중앙 카드 세로 위치 재계산 필요(현재 카드 y=324 고정).

---

## 3. 토큰(Variable) 사용 현황 — screen-rebuild 2단계 매핑용 사전수집

| Figma Variable | raw hex / 값 | 쓰인 곳 |
|----------------|-------------|---------|
| color/form-control/bg/default | #ffffff | 입력 bg |
| color/form-control/border/default | #d9d9d9 | 입력 border |
| color/form-control/text/placeholder | #757575 | 입력 placeholder |
| color/control/bg/default | #ffffff | 체크박스 box |
| color/control/border/default | #d9d9d9 | 체크박스 box border |
| color/control/label/default | #353535 | 체크박스 라벨 |
| color/button/bg/disabled | #f5f5f5 | 로그인 버튼 bg(disabled) |
| color/button/border/disabled | #d9d9d9 | 로그인 버튼 border(disabled) |
| color/button/label/disabled | #c4c4c4 | 로그인 버튼 라벨(disabled) |
| color/text/title/primary | #000000 | GNB 서비스명 |
| color/text/body/tertiary | #757575 | 하단 링크 / 푸터 텍스트 |
| color/icon/gray-light | #c4c4c4 | 구분선(링크/푸터) |
| color/icon/gray | #757575 | (헤더/푸터 아이콘) |
| color/icon/gray-dark | #353535 | (헤더 아이콘) |
| color/navigation/background | #ffffff | GNB·푸터 bg |
| color/line/gray/subtle | #e9e9e9 | GNB 하단선·푸터 상단선 |
| sizing/form-control/height/md, sizing/button/height/md | 44 | 입력/버튼 높이 |
| sizing/18 | 18 | 체크박스 |
| sizing/24, sizing/32 | 24, 32 | 아이콘/유틸 |
| radius/control/sm, radius/4 | 4 | 입력/버튼 radius |
| radius/control/xs | 2 | 체크박스 radius |
| border-width/default | 1 | 입력/버튼/체크 border |
| spacing/padding/inline/sm·xs | 16, 12 | 입력 좌우 padding |
| spacing/padding/block/xxs·xs | 8, 12 | 입력/버튼 세로 padding |
| spacing/label/gap/inline/sm | 8 | 체크박스 gap |
| spacing/cluster/xxs | 8(코드상 0 fallback) | 유틸 gap |
| spacing/320 | 320 | GNB·푸터 좌우 padding |
| spacing/12, spacing/28 | 12, 28 | GNB/푸터 세로 padding |

비-Variable raw hex(탭바 chrome 목업, 토큰 미바인딩): `#dcdcdc`(탭 bg), `#ebebeb`(주소창/하단라인), `#b6b6b6`(Icon/tab), `#262626`(Icon/normal). → 2단계에서 토큰 매핑/허용편차 검토 대상.

폰트 스타일(텍스트 스타일 바인딩 대상): `component/control/text/14R`, `component/button/label/14M`, `body/14R`, `title/14M`, `body/10R`, `body/10M`. 전부 Pretendard Variable(개인정보 처리방침=`Pretendard` Medium body/10M, 사업자/카피=Pretendard Variable Regular).

---

## 4. 검문소 — 총 요소 개수 · 미확인 목록

### 총 요소 개수: **21개** (전수표 #1~#21)
- 구조 요소(바/컨테이너) 3: 탭바·GNB·푸터
- 로고 3: GNB SAMSUNG / 중앙 SAMSUNG / 푸터 S1
- 폼 요소 4: 아이디·비밀번호 입력 / 체크박스 / 로그인 버튼
- 텍스트/링크 8: GNB 서비스명·언어·아이디찾기·비밀번호찾기·약관3·사업자정보·카피라이트
- 장식(구분선) 3: 링크 구분선 1 + 푸터 구분선 2

### 미확인 항목 (사용자 확인/추가조사 필요)
1. **푸터 노드 2개 존재** — 표시되는 `login_Footer` 262:14385(y=960, 분해 프레임)와 인스턴스 `login_Footer` 261:13171(y=6576, **프레임 밖 1080 초과 → 화면에 안 보임**). 둘 중 정본/스트레이 여부 = **확인 필요**. (조사 판단: 262:14385가 실제 표시본, 261:13171은 잔재 추정 — 빌드 전 확인 권장)
2. **비밀번호찾기 링크 노드명 불일치** — 노드 이름은 `비밀번호 초기화`이나 렌더 텍스트는 `비밀번호 찾기`. 재현 시 verbatim 텍스트 = `비밀번호 찾기` 사용. (이름은 무시)
3. **푸터 S1 로고 형상** — 에셋 이미지(C/IMG/Logo/S1_g)로 스크린샷상 `에스원` 워드마크로 보임. 정확한 마크 형태/색은 이미지 에셋(미세 형상) — 토큰/벡터 데이터 아님. 재현 시 정본 S1 로고 컴포넌트 사용 여부 확인 필요.
4. **숨김 텍스트** — Frame 2085674013 내 `총 3개의 서비스를 이용하고 계세요`(261:13161, hidden=true) — 화면에 표시 안 됨. 로그인 화면에 불필요한 잔재로 판단, 재현 제외 대상(확인 권장).
5. **로그인 버튼 활성(default) 상태 스펙 없음** — 현재 원본은 disabled 1상태만 정의. 입력 후 활성 버튼 색은 본 화면에 없음 → 정본 button 컴포넌트 default 상태로 보완 필요(2단계에서 결정).
6. **언어 셀렉트 인터랙션** — `한국어` 클릭 시 드롭다운 등 동작 미정의(정적 1상태만). 재현 범위 확인 필요.

빌드는 하지 않았음. 본 보고는 1단계 재고조사 산출물이다.

**저장 경로:** `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/reports/screen-rebuild/login/pc-web/1-inventory.md`
