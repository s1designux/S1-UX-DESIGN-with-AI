# PC 웹 로그인 — 의도 선언서 근거 수집 (읽기 전용)

읽은 방법: 전부 **data(Figma REST /v1/files/:key/nodes, 2026-10-02 판독)**. 이미지 판독 없음. 대상 파일 V3.0 TEST(`cysG5U1udpQqVagYY1hWHW`, lastModified 2026-10-01T23:53Z) · 레거시 통근버스(`ET7lj2id4VAHQ5JeDX0EZ2`, profiles/*/profile.json 의 figmaFileKey).

## A) 대상 페이지 80:16697 'Patterns PC (준비중)'
| 항목 | 값 |
|---|---|
| 최상위 자식 | **0개 (빈 페이지)** |
| 섹션 268:368 '로그인 (PC Web)' · 프레임 268:369 | **존재하지 않음** (REST nodes → null). 옛 결과는 이미 지워진 상태 |
| 빈 자리 | 페이지 전체가 비어 있음 → 점유 bbox 없음, 어디든 가능(원점 부근 권장) |
| 참고 | `workflow-state.json` 의 source 261:13153, targetFigma.sectionId 268:368 도 현재 파일에 없음 |

## B) 노드 2601:21357 '웹_로그인 화면' — **미확인 (찾을 수 없음)**
- REST(V3.0 TEST 파일): 2601:21357 · 261:13153 모두 null. 파일 전 페이지 depth3 이름 검색에서도 '웹_로그인' 없음.
- 데스크톱 연결(figma-local get_metadata 2601:21357): "No node could be found" (열려 있는 문서에 없음).
- 레거시 파일(ET7lj…)·aLxh458… 에도 없음.
- 결론: 이 노드는 다른 파일이거나(개발화면 검수 포털 시안 파일), 삭제/이동됨. **정확한 fileKey 또는 링크가 필요** → river 에게 요청. 추측 구조 작성 안 함.
- 대체 근거(이미 저장소에 있는 옛 판독): `1-inventory.md`(261:13153 에서 읽은 전수표) — 단, 원본 노드가 지금은 없어 재검증 불가.
- 같은 V3.0 파일의 모바일 로그인 선례: `S-1 S/W UX Pattern` 페이지 섹션 2528:78650 'Pattern / App Login'(APP/LOGIN/1~4c3, 오류 4a1·모달 4b1 등) — 구조·상태 구성 참고용.

## C) 레거시 PC 로그인 상태 화면 (파일 ET7lj2id4VAHQ5JeDX0EZ2, 전부 1920×1080, data)
### 공통 구조(첫 화면 1500:118835, 좌표는 프레임 기준)
| 요소 | 값(인스턴스/크기/문구) |
|---|---|
| 브라우저 탭 | Rect browser_tab 0,0 1920×88 (목업) |
| GNB | W/TOP-MENU/GNB_account 0,88 1920×56, 흰 배경, 하단선 #e9e9e9. 로고 C/IMG/Logo/Samung+bus(170×24, x=320) + 텍스트 **"통근버스"**(Bold16 #000), 우측 W/DROPDOWN/Header/language(def) 85×20 = 아이콘+**"한국어"**(#353535 14)+combobox_arrow(down) |
| 숨은 요소 | popup_message 1920×52 (visible=false, 내용 없음) |
| 중앙 로고 | C/IMG/Logo/Samsung_30 134×30 @893,244 |
| 입력 묶음 | 460×108 @730,324. 아이디 C/INPUT-FIELD/input 460×50 (fill #fff, stroke #d9d9d9) · 비밀번호 C/INPUT-FIELD/password 460×50 @y+58 · 좌우 패딩 20 |
| 플레이스홀더 | **"아이디를 입력해 주세요."** / **"비밀번호를 입력해 주세요."** (#757575, 14) |
| 숨은 텍스트 | "03:00"(타이머)·"06:30 (평균도착 06:32)" — 모두 visible=false, 오조작 잔재 → **무시** |
| 로그인 버튼 | C/BTN/basic_L (solid/disable) 460×50 @730,472, 문구 **"로그인"**, 비활성 fill #f5f5f5 stroke #d9d9d9 글자 #555555 |
| 하단 링크 | 320×14 @800,538, 가운데 237폭: **"회원가입" | "아이디 찾기" | "비밀번호 찾기"** (#757575 14, 구분선 1×12 #d9d9d9, 간격 11~12) |
| 푸터 | W/Footer 1920×121 @959: 링크 "이용약관 | 개인정보 처리방침 | 위치기반 서비스 이용약관", "(주)에스원 사업자등록번호 208-81-13302 대표이사 남궁범 04511 서울특별시 중구 세종대로 7길 25 에스원 빌딩", "© S-1 Corp. All Rights Reserved.", S1 로고 (#757575) |
| **아이디 저장 체크박스** | **레거시 8장 모두 없음** (체크박스 노드 0개) |
| 버튼↔링크 간격 | 링크는 버튼 아래 16(522→538). 오류 상태에서 입력 묶음 뒤 오류문구가 붙고 버튼·링크가 아래로 밀림 |

### 상태별 변화(차이만)
| 노드 | 이름 | 바뀐 요소 | 보이는 텍스트 verbatim |
|---|---|---|---|
| 1500:118835 | 웹_로그인 화면 | 기준(둘 다 def, 버튼 disable) | 위 공통 |
| 1500:120837 | 로그인 버튼 활성화 | 아이디 input=complete, 비번 input=complete, 버튼 Property2=default → fill **#1d6ceb**, 글자 #fff, stroke 없음 | 아이디 "abcdef134", 비번 "***************", 비번칸 우측에 눈 아이콘(pw off)+삭제(Remove) 아이콘 |
| 1500:120860 | 비밀번호 커서 활성화 | 비번 input=sel, stroke **#1d6ceb**, 커서 1×16 #1d6ceb, 버튼 disable. (전체 20px 아래로 이동: 흰 Frame 280 360×190 겹침 잔재) | 플레이스홀더 유지 |
| 1500:120884 | 비밀번호 숨김 | 비번 input=typing, stroke #1d6ceb, 눈 아이콘 **pw off(숨김)**, Remove 아이콘 노출, 버튼 disable | "***************" |
| 1500:120907 | 비밀번호 숨김 해제 | 눈 아이콘 **pw on(보임)** | **"sample287!"** |
| 1500:120930 | 유효하지 않은 아이디/비밀번호 입력 시 | 아이디 input=error_com·비번 input=error_typing, 둘 다 stroke **#ff4555**, 오류문구 노출(빨강 #ff4555, 246×36 @730,440), 버튼 disable이 아래(y516)로 밀림, 링크 y582 | **"아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(1/5)"** · 입력값 "ffffffgi"/"***************" |
| 1500:120954 | 잘못된 비밀번호 1~4회 | 120930과 동일 구조(문구 (1/5) 형태, 횟수 숫자만 변동 추정 — 원본엔 (1/5)만 있음) | 위와 동일 |
| 1500:120978 | 5회 이상 | 문구 꼬리만 변경 | **"아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(최대 5분)"** (잠금 안내 팝업/별도 화면 없음) |
| 1500:120620 | 언어 변경 콤보박스 | GNB dropdown Property1=**open** 85×104: 헤더(arrow up) + Dropdown_S 85×76(흰, stroke #d9d9d9), 항목 "한국어"(sel+hov, fill #fafafa, 글자 #1d6ceb) / "English"(def, #757575), 항목 높이 38 | "한국어", "English" |
| 1500:120643 | 위치기반 서비스 이용약관 팝업 | 500×700 @710,190 흰 팝업(이미지 상단 500×28), 닫기 X(close, 24×24 우상단), 본문 스크롤 영역. **하단 확인 버튼 없음(X만)**. 뒤 화면 노출 "게스트 로그인"(m_subbutton 77×14 @921,662, #757575) 이 이 화면에만 보임 | 제목 **"회원 약관 동의"**(Bold 20), "제 1조(목적)", 첫 줄 "본 약관은 '주식회사 에스원(이하 "회사")'에서 운영하는 '에스원 인터넷 홈페이지 www.s1.co.kr …", "제 2조(약관효력 및 변경)" |
- 오류 시 **문구는 입력칸 아래 빨강 2줄 텍스트**이며 입력칸 하단 helper 슬롯과는 별개 배치(두 입력칸 아래 공통 1개). 입력칸별 개별 메시지 없음.
- 타이머 "03:00"/"06:30…" 은 모든 화면에서 숨김(visible=false) — 로그인과 무관한 복제 잔재.

## D) V3.0 TEST 로컬 정본 COMPONENT_SET (Core 페이지 5:5706, 전부 이 파일 안 → remote=false)
| set id | 이름 | variant 축 = 값 | 변형수 | 로그인 용도·메모 |
|---|---|---|---|---|
| 2614:79536 | **Input** | Size=XXSM/XSM/MD · **State=Default/Filled/Focus/Error/Correct/Read-Only/Disabled** · **Message=Off/On** · Break=PC/Mobile · BOOLEAN: Password Icon, Password Action Hover, Clear Action Hover | 56 | PC MD=44px 높이(레거시 50). **Type=Password 축 없음**(눈 아이콘은 Password Icon boolean+eye-icon). **Error+Message=On 있음**: 입력칸 field(stroke #ff4554)+ 아래 TEXT "안내 메세지"(12, #ff4554, gap 6) = helper 슬롯은 TEXT 오버라이드. field pad 12(좌우), 텍스트 14 |
| 2614:77248 | **Checkbox** | State=Default/Hover/Checked/Disabled/Dis+Checked | 5 | 18×18 박스만, **라벨 텍스트 없음**(라벨은 조합 측) |
| 2614:76987 | **Button** | Size=MD/XSM/XXSM/LG · State=Default/Hover/Pressed/Disabled · Variant=Primary/Secondary/Blue-Line · Break=PC/Mobile | 48 | PC=MD(80×44)/XSM/XXSM, **LG는 Mobile만(높이48)**. PC에 높이50 없음 → 레거시 basic_L(50)과 차이. Primary Disabled: fill #f5f5f5 stroke #d9d9d9 글자 #c4c4c4. 기본 문구 "버튼" |
| 2614:77203 | Text Button | Variant=Primary/Secondary · State=Default/Hover/Pressed/Disabled | 8 | 하단 링크용 후보. 문구 "텍스트버튼" 14 Medium, Secondary #757575 |
| 2614:73971 | **LoginGNB** | Property 1=Default (축 1개) | 1 | 1920×56 pad 320/12, 하단선 #e9e9e9. service-name(TEXT "[서비스명]" Bold16) + language-group(globe-icon + "한국어" Medium14 #353535). 콤보 오픈 상태 변형 없음 |
| 2614:74012 | WebTabBar | Property 1=Default | 1 | 1920×101 브라우저 탭+주소창 목업(탭 "[서비스명]") |
| 2614:73962 | **CI** | Brand=에스원/삼성 · Color=White/Blue/Dark | 6 | 삼성 134×36, 에스원 79×30. (레거시 중앙 로고 134×30 → 가장 가까운 것 삼성/Blue) |
| 2614:74065 | **Footer** (login_Footer 아님, 이름은 Footer) | Platform=PC/Mobile | 2 | PC 1920×116 pad 320/28, 링크 3개+주소 문구(대표이사 **정해린**, 레거시는 남궁범)+© 문구+S1 로고. 텍스트 10px |
| 2614:74109 | Language Icon | Language=English/Korean | 2 | 언어 표시 아이콘 |
| 2614:78007 | **Dropdown** | Size=XXSM/XSM/MD · Type=Text/Checkbox · State=Default · SLOT Options | 6 | 언어 콤보 펼침 후보 |
| 2614:77771 | Dropdown List | Size=XXSM/XSM/MD · Type=Text/Checkbox/Checkbox+All · State=Default/Hover/Selected | 27 | 목록 항목(선택=#1d6ceb 글자 대응 여부는 미확인) |
| 2614:80956 | Select Box | Size · State=Default/Hover/Open/Filled/Disabled · Break | 20 | |
| 2614:87684 | **Modal** | Break=PC/Mobile · Footer=Single/Dual · SLOT Content | 4 | PC 360×194, header(제목 Bold16 + close 아이콘) + Content 슬롯 + footer 버튼(XXSM). 약관 팝업(500×700 스크롤·확인버튼 없음)과 크기·구조 불일치 → 슬롯 확장 필요/needs-decision |
| 2614:87832 | Modal Content | Size=MD/LG/XL · Footer=Single/Dual · SLOT Content | 6 | 큰 팝업 후보 |
- GNB 계열 별도: GNB(2614:74494, 6변형)·GNB Menu·GNB Utility Icon·Language Icon 등은 로그인에 불필요(LoginGNB 사용).

## 레거시 ↔ 정본 차이 요약(결정 후보)
1. 아이디 저장 체크박스: 레거시에 없음, 요구 기준(B 시안)에는 있음 → B 시안 위치 확인 필요.
2. 버튼 높이 50(레거시) vs PC Button MD 44 · Input PC MD 44(레거시 50) → 정본 따를지.
3. 오류 문구: 입력칸 아래 공통 빨간 문구 — 정본 Input Message=On 은 칸별 helper 1줄.
4. 5회 이상은 문구 꼬리(최대 5분)만 다름, 잠금 별도 화면 없음.
5. 약관 팝업: 정본 Modal 크기와 다름, 확인 버튼 없음(X만).
6. 푸터 대표이사 이름이 레거시와 정본이 다름(정본 우선).
