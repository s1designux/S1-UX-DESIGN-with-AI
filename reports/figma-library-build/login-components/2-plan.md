# 2-plan.md — 로그인 화면 로컬 컴포넌트 4종 빌드 계획

파일: `cysG5U1udpQqVagYY1hWHW` (V3.0 TEST). 배치 페이지: **Core** (5:5706). 소스 화면: 268:368 (Patterns PC, 읽기 전용).
목표: 로그인 화면의 외부 라이브러리 인스턴스를 대체할 **로컬(remote=false) 컴포넌트**를 만든다. 외부 인스턴스 clone 금지 — 스펙만 읽어 새로 저작.

## 허용편차 선언서 (검증기는 이 차이를 빼고 대조 — 두갈래 (b))
1. **폰트**: Pretendard Variable 미로드 시 Noto Sans KR 오버레이 후 setTextStyleIdAsync로 V2.4 텍스트스타일 바인딩(기존 규약).
2. **셸 크롬 아이콘 raster 허용**: web tab bar 의 탭/뒤로/앞으로/새로고침/창버튼/favicon/탭close 는 DS 아이콘이 아닌 브라우저 크롬 → 원본 에셋을 **로컬 임베드**(download_assets→로컬). vector-allow 예외(CLAUDE.md 셸 크롬). 단 **외부 라이브러리 인스턴스 참조는 0** 이어야 함(이미지/벡터로 임베드, remote 인스턴스 금지).
3. **로고 raster**: Samsung_30(중앙)·Samsung+bus(GNB 좌측) 는 벡터 path 없음 → 이미지 에셋 임베드.
4. **눈 아이콘**: 레거시는 외부 raster(68:5651) 사용했으나 **정식 V2.2 아이콘으로 교체**(개선). hide=`ic_비밀번호미표시` set `8edfaab1a0948b9b94313715df867d5ffa7a85c9`, show=`ic_비밀번호표시` set `a731c93510d9200b940c62bee5eceba47e822923`.

## 빌드 대상

### A. Shell/LoginGNB (신규 컴포넌트, 단일 — variant 없음)
- 프레임 1920×56. bg = `color/navigation/background`. 하단 보더 1px = `color/line/gray/subtle`(border-width/default).
- 레이아웃: auto-layout ROW, space-between, center, padding L/R 320(spacing/320 — 없으면 320 고정 FIXED), T/B 12.
- **좌측**: 로고(Samsung+bus, 소스 I268:5647;8177:208695, h24, 이미지 임베드) + 서비스명 텍스트 `[서비스명]` (16px Bold, `color/text/title/primary`), gap 11.
- **우측 언어선택**: globe 아이콘(V2.2 key `dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2`, 24×24, 32×32 center wrap, 색 `color/icon/gray-dark`) + 텍스트 `한국어`(14px Medium, `color/icon/gray-dark`=#353535). gap 8(spacing/cluster/xxs), pr 8.

### B. Shell/WebTabBar (신규 컴포넌트, 단일)
- 1920×101. 소스 268:5646 시각 충실 재현. 크롬 회색 토큰 스냅: 탭줄 bg #dcdcdc, 주소바 bg #fff, 주소입력 pill bg #ebebeb(radius 20), 하단선 1px #ebebeb.
- 탭(224×38): 탭모양 + favicon 16(이미지) + 라벨 `[서비스명]`(Noto 12 Regular black) + 탭close(이미지). window controls(69×10 이미지). 뒤로/앞으로/새로고침 24×24(이미지, 앞으로=뒤로 rotate180). **전부 로컬 이미지 임베드(외부 인스턴스 금지).**

### C. C/IMG/Logo/Samsung_30 (신규 컴포넌트, 단일)
- 134.348×30. 소스 280:330 = 이미지 에셋. download_assets→upload_assets→이미지 fill 한 로컬 컴포넌트. (로컬에 동일 Samsung 로고 컴포넌트가 이미 있으면 그것 사용 — 먼저 findAll 로 확인.)

### D. Login Input (신규 컴포넌트 세트 — 로그인에 필요한 상태만)
- 460×44(`sizing/form-control/height/md`). bg `color/form-control/bg/default`, 보더 1px `color/form-control/border/default`, radius `radius/control/sm`(4). pl 16, pr 12, py 8. placeholder 14R `color/form-control/text/placeholder`.
- **variant 축**: `Field={Id, Password}, State={Default, Editing, Filled, Error}, Reveal={Hide, Show}` (Reveal 은 Field=Password 에서만 의미 — Id 는 Reveal=Hide 고정/단일로). Break=PC 고정.
  - **Id**: 우측 아이콘 없음. placeholder 예: `아이디를 입력해 주세요.`
  - **Password**: 우측 24×24 눈 아이콘. Reveal=Hide → `ic_비밀번호미표시`(8edfaab1, 마스킹 dot 표시), Reveal=Show → `ic_비밀번호표시`(a731c935, 평문). placeholder `비밀번호를 입력해 주세요.`
  - State: Default(placeholder)·Editing(caret)·Filled(값)·Error(보더 `color/form-control/border/error` + 메시지는 별도 — 입력칸 보더색만). Editing 시 caret(blue/400) 포함(Gate 11 anatomy 규칙 — Input/Search/TextArea caret 필수).
- variant 과다 방지: 로그인에 실제 필요한 조합만(예: Id×{Default,Editing,Filled,Error} + Password×{Default,Editing,Filled,Error}×{Hide,Show}). 불필요한 Id×Reveal=Show 는 만들지 않음.

## 배치
- Core 페이지 기존 노드 우측 빈 공간(findAll 로 rightmost x 찾아 +200 이후)에 세로로. 겹침 회피.
- combineAsVariants(Login Input) 후 **variant 패킹**(좌표 재배치 + 세트 hug resize) — 폭 붕괴 방지.

## 검증 위임 사항(빌더는 판정 금지)
- 빌드 후 node-map.json 에 생성 노드 id·variant·remap 기록.
- needs-decision: 로고 에셋 download 실패 / 눈 아이콘 leaf variant key 확정불가 / 토큰 Variable 부재 시.
- **leaf 아이콘 key 기록**: 눈 아이콘 set 에서 실제 import 한 variant(Line 등)의 **leaf component key 를 반환** → ICON_KEYS·allowed-remote-keys.json 등록용.
