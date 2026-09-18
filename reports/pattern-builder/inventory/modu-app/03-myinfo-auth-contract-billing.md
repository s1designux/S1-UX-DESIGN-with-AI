# 3~6. 내 정보, 권한, 계약, 청구/입금 — 레거시 판독표 (modu-app)

> 원본: Figma 페이지 `10928:13547` · 읽은 날 2026-09-18
> 기계 판독 원자료: `raw/03-myinfo-auth-contract-billing.json`. 이 표는 그 자료를 사람이 보게 편 것이고, **해석·규칙은 여기에 쓰지 않는다.**

## 요약

| 항목 | 값 |
|---|---|
| 캔버스 위 노드 | 197개 |
| 화면으로 볼 것(360폭·400높이 이상) | 132개 |
| 쓰인 부품 종류 | 41종 |

## 화면 목록

| # | 화면 이름 | 크기 | 쓰인 부품 | 노드 |
|---|---|---|---|---|
| 1 | 3.1 내 정보_1 메인 | 360x800 | m_Input box×3, m_subbutton×2, m_StatusBar, appbar_sub, m_email_input, m_button, phone_navi | `10928:13548` |
| 2 | 3.1 내 정보_4 긴급연락처 외 사람이 휴대전화번호 변경 시 | 360x780 | m_Input box×3, m_subbutton×2, m_button×2, m_StatusBar, appbar_sub, m_email_input, phone_navi, close | `10928:13570` |
| 3 | 3.1 내 정보_2 휴대전화번호 변경 | 360x780 | m_Input box×3, m_subbutton×2, m_StatusBar, appbar_sub, m_email_input, keyboard | `10928:13600` |
| 4 | 2.2 비밀번호 변경_2 비밀번호 변경 | 360x780 | pw off×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:13617` |
| 5 | 2.3 회원 탈퇴_1 비밀번호 입력 및 동의 | 360x780 | m_StatusBar, appbar_sub, pw off, m_checkbox, m_button, phone_navi | `10928:13642` |
| 6 | 2.3 회원 탈퇴_1 비밀번호 입력 및 동의 | 360x780 | m_StatusBar, appbar_sub, pw off, m_checkbox, m_button, phone_navi | `14533:12974` |
| 7 | 2.3 회원 탈퇴_1 비밀번호 입력 및 동의_수정 | 360x780 | m_StatusBar, appbar_sub, pw off, m_checkbox, m_button, phone_navi | `14533:12828` |
| 8 | 4.2 권한 신청_2 계약 검색(계약번호) | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_Input box, m_button, phone_navi | `10928:13675` |
| 9 | 4.2 권한 신청_3 계약 검색 조건 선택 | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_Input box, m_button, phone_navi, close, ok | `10928:13692` |
| 10 | 4.2 권한 신청_계약번호를 모르시나요 팝업 | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_Input box, m_button, phone_navi, m_button variation | `24276:21975` |
| 11 | 4.2 권한 신청_8 권한 신청 완료 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `10928:13721` |
| 12 | 2.3 회원 탈퇴_2 탈퇴 완료 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `10928:13743` |
| 13 | 4.2 권한 신청_4 검색어 입력(마스터 관리자 이름, 휴대전화번호) | 360x780 | m_Input box×2, m_StatusBar, appbar_sub, m_combobox, m_btn_full, keyboard | `10928:13772` |
| 14 | 4.2 권한 신청_5 검색어 입력(계약번호) | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_Input box, m_btn_full, keyboard | `10928:13787` |
| 15 | 4.2 권한 신청_1 계약 검색(마스터 관리자 이름, 휴대전화번호) | 360x780 | m_Input box×2, m_StatusBar, appbar_sub, m_combobox, m_button, phone_navi | `10928:13802` |
| 16 | 4.3 관리자 초대_4 관리자 초대 목록 | 360x780 | list×4, m_button×3, menu_arrow_down×2, m_StatusBar, appbar_sub, icon/combobox_arrow, m_checkbox, phone_navi | `10928:13819` |
| 17 | 4.3 관리자 초대_10 알림톡 전송 안내(거절) | 360x780 | list×4, m_button×3, menu_arrow_down×2, m_StatusBar, appbar_sub, icon/combobox_arrow, m_checkbox, phone_navi, close | `10928:13855` |
| 18 | 4.3 관리자 초대_9 알림톡 전송 안내(승인) | 360x780 | list×4, m_button×3, menu_arrow_down×2, m_StatusBar, appbar_sub, icon/combobox_arrow, m_checkbox, phone_navi, close | `10928:13897` |
| 19 | dialog | 360x732 | close, m_button | `24301:22984` |
| 20 | 4.3 관리자 초대_8 권한 선택 완료 | 360x780 | list×4, m_button×2, menu_arrow_down×2, m_StatusBar, appbar_sub, icon/combobox_arrow, m_checkbox, phone_navi | `10928:13939` |
| 21 | 4.3 관리자 초대_1 가입 멤버 없음 | 360x780 | m_StatusBar, appbar_sub, icon/combobox_arrow, m_button, phone_navi | `10928:13974` |
| 22 | 4.3 관리자 초대_2 계약 정보 | 360x780 | m_bar×3, m_StatusBar, appbar_sub, icon/combobox_arrow, m_button, bad, phone_navi, close, ok | `10928:14006` |
| 23 | 6.1 청구입금_4 납입 상세 내역 | 360x922 | m_bar×4, m_button, phone_navi, m_StatusBar, appbar_sub, menu_arrow_right, close, ok | `24652:35110` |
| 24 | 6.1 청구입금_4 납입 상세 내역 | 360x922 | m_button, phone_navi, m_StatusBar, appbar_sub, menu_arrow_right, m_bar | `24652:35202` |
| 25 | 4.3 관리자 초대_3 관리자 초대 방법 선택 | 360x780 | m_StatusBar, appbar_sub, icon/combobox_arrow, m_button, bad, phone_navi, close | `10928:14049` |
| 26 | 4.4 관리자 현황_2 관리자 있음 | 360x780 | list×5, m_StatusBar, appbar_sub, filter, m_checkbox, m_button, phone_navi | `10928:14112` |
| 27 | 4.4 관리자 현황_1 관리자 없음 | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_button, phone_navi | `10928:14132` |
| 28 | 4.4 관리자 현황_6 서비스 해지 | 360x780 | m_checkbox×4, menu_arrow_right×3, m_bar×3, list×2, m_StatusBar, appbar_sub, filter, m_button, phone_navi | `10928:14157` |
| 29 | 4.4 관리자 현황_9 정렬, 필터링 적용 | 360x780 | list×2, m_StatusBar, appbar_sub, filter, m_checkbox, m_button, phone_navi | `10928:14221` |
| 30 | 4.4 관리자 현황_7 정렬 | 360x780 | list×5, m_button×2, m_StatusBar, appbar_sub, filter, m_checkbox, phone_navi, close | `10928:14238` |
| 31 | 4.4 관리자 현황_7 정렬 | 360x780 | list×5, m_button×2, m_StatusBar, appbar_sub, filter, m_checkbox, phone_navi, close | `24400:27248` |
| 32 | 4.4 관리자 현황_8 필터링 | 360x780 | m_checkbox×7, list×5, m_button×2, m_StatusBar, appbar_sub, filter, phone_navi, close | `10928:14288` |
| 33 | 4.4 관리자 현황_8 필터링 | 360x780 | m_checkbox×7, list×5, m_button×2, m_StatusBar, appbar_sub, filter, phone_navi, close | `24400:27293` |
| 34 | 4.4 관리자 현황_4 삭제할 관리자(권한) 선택 | 360x780 | list×5, m_StatusBar, appbar_sub, filter, m_checkbox, m_button, phone_navi | `10928:14341` |
| 35 | 4.4 관리자 현황_5 알림톡 전송 안내(삭제) | 360x780 | list×5, m_button×2, m_StatusBar, appbar_sub, filter, m_checkbox, phone_navi, close | `10928:14361` |
| 36 | 3.1 내 정보_5 긴급연락처 반영중(인증 비활성화) | 360x780 | m_Input box×3, m_subbutton×2, m_StatusBar, appbar_sub, m_email_input, m_button, phone_navi | `10928:14389` |
| 37 | 3.1 내 정보_3 긴급연락처 내 사람이 휴대전화번호 변경 시 | 360x780 | m_Input box×3, m_subbutton×2, m_button×2, m_StatusBar, appbar_sub, m_email_input, phone_navi, close | `10928:14409` |
| 38 | 3.1 내 정보_6 긴급연락처 반영 후(인증 활성화) | 360x780 | m_Input box×3, m_subbutton×2, m_StatusBar, appbar_sub, m_email_input, m_button, phone_navi | `10928:14442` |
| 39 | 4.2 권한 신청_7 검색 결과 없음 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `10928:14462` |
| 40 | 4.2 권한 신청_7 검색 결과 없음 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `24276:22151` |
| 41 | 4.1 권한_ 2 일반 관리자 | 360x780 | m_StatusBar, appbar_sub, m_combobox, document, under security, card, dome camera, cloud server, phone_navi | `10928:14485` |
| 42 | 4.1 권한_ 2 일반 관리자 | 360x780 | m_StatusBar, appbar_sub, m_combobox, document, under security, card, dome camera, cloud server, phone_navi | `24279:22213` |
| 43 | 4.1 권한_ 2 일반 관리자 | 360x780 | m_StatusBar, appbar_sub, m_combobox, document, under security, card, dome camera, cloud server, m_button, phone_navi | `15598:14268` |
| 44 | 4.1 권한_ 2 일반 관리자 | 360x780 | m_StatusBar, appbar_sub, m_combobox, document, under security, card, dome camera, cloud server, m_button, phone_navi | `24279:22330` |
| 45 | 4.1 권한_ 2 일반 관리자 | 360x780 | m_StatusBar, appbar_sub, document, under security, card, dome camera, cloud server, phone_navi | `15618:6934` |
| 46 | 4.2 권한 신청_11 다른 계약처 권한 신청 | 360x780 | m_bar×3, m_StatusBar, appbar_sub, m_combobox, document, under security, card, dome camera, cloud server, phone_navi, close, plus, ok | `10928:14522` |
| 47 | 4.1 권한_ 3 마스터 관리자 | 360x780 | m_list×2, m_StatusBar, appbar_sub, m_combobox, m_button, phone_navi | `10928:14579` |
| 48 | 4.1 권한_ 3 마스터 관리자 | 360x780 | m_button×2, m_list×2, m_StatusBar, appbar_sub, m_combobox, phone_navi | `15598:14307` |
| 49 | 4.1 권한_ 3 마스터 관리자 | 360x858 | list×4, m_button×3, menu_arrow_down×2, m_StatusBar, appbar_sub, m_checkbox, phone_navi | `15618:7044` |
| 50 | 4.1 권한_ 3 마스터 관리자 | 360x780 | m_StatusBar, appbar_sub, m_button, m_subbutton, phone_navi | `15618:11108` |
| 51 | 4.1 권한_ 3 마스터 관리자 | 360x780 | m_StatusBar, appbar_sub, menu_arrow_right, m_button, phone_navi | `15618:18326` |
| 52 | 4.1 권한_ 3 마스터 관리자 | 360x858 | list×4, menu_arrow_down×2, m_StatusBar, appbar_sub, m_subbutton, m_checkbox, m_button, phone_navi | `15618:10805` |
| 53 | 4.1 권한_ 3 마스터 관리자 | 360x780 | list×4, m_StatusBar, appbar_sub, m_combobox, m_button, phone_navi | `15618:6781` |
| 54 | 4.4 관리자 현황_3 권한 변경 | 360x780 | m_checkbox×5, m_radiobutton×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:14603` |
| 55 | 4.3 관리자 초대_6 권한 선택(마스터 관리자) | 360x780 | m_radiobutton×2, m_StatusBar, appbar_sub, m_checkbox, m_button, phone_navi | `10928:14653` |
| 56 | 4.3 관리자 초대_6 권한 선택(마스터 관리자) | 360x780 | m_radiobutton×2, m_StatusBar, appbar_sub, m_checkbox, m_button, phone_navi | `24304:22912` |
| 57 | 4.3 관리자 초대_5 관리자 초대 목록(더보기) | 360x1309 | list×10, m_button×3, menu_arrow_down×2, m_StatusBar, appbar_sub, icon/combobox_arrow, m_checkbox, More, phone_navi | `10928:14678` |
| 58 | 2.2 비밀번호 변경_1 비밀번호 확인 | 360x780 | m_StatusBar, appbar_sub, pw off, m_button, phone_navi | `10928:14726` |
| 59 | 4.1 권한_ 1 권한 없음 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `10928:14744` |
| 60 | 4.2 권한 신청_9 권한 신청 내역 | 360x780 | m_StatusBar, appbar_sub, icon/combobox_arrow, m_button, phone_navi | `10928:14759` |
| 61 | 4.2 권한 신청_10 권한 신청 취소 | 360x780 | m_StatusBar, appbar_sub, icon/combobox_arrow, m_button, phone_navi, dialog | `10928:14786` |
| 62 | dialog | 360x732 | — | `24301:22914` |
| 63 | 4.2 권한 신청_6 검색 결과 있음 | 360x780 | m_checkbox×4, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:14814` |
| 64 | 5.3 우편물 주소_1 메인 | 360x780 | m_chips×6, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button | `10928:14915` |
| 65 | 5.4 종합안심플랜_1 메인 | 360x2019 | m_chips×6, m_StatusBar, appbar_sub, m_combobox, menu_arrow_right, phone_navi | `10928:14940` |
| 66 | 5.4 종합안심플랜_2 메인(없음) | 360x780 | m_chips×6, m_StatusBar, appbar_sub, m_combobox, phone_navi | `10928:15045` |
| 67 | 6.2 세금계산서_1 메인 | 360x1154 | m_chips×4, m_bar×2, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button | `10928:15145` |
| 68 | 6.2 세금계산서_5 메인(수신담당자 없음) | 360x1206 | m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button | `10928:15209` |
| 69 | 6.2 세금계산서_4 메인(개인 고객) | 360x780 | m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi | `10928:15305` |
| 70 | 6.1 청구입금_2 메인(0원) | 360x955 | menu_arrow_right×5, m_bar×5, m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi | `10928:15333` |
| 71 | 6.1 청구입금_1 메인 | 360x955 | menu_arrow_right×5, m_bar×5, m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi, More | `10928:15398` |
| 72 | 6.1 청구입금_3 메인(없음) | 360x780 | m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi | `10928:15466` |
| 73 | 5.1 기본 정보_1 메인 | 360x870 | m_chips×5, m_subbutton×2, m_StatusBar, appbar_sub, m_combobox, phone_navi | `10928:15493` |
| 74 | 5.1 기본 정보_2 계약정보 변경 이력 | 360x916 | m_StatusBar, appbar_sub, phone_navi | `10928:15550` |
| 75 | 5.1 기본 정보_3 계약정보 변경 이력(없음) | 360x780 | m_StatusBar, appbar_sub, phone_navi | `10928:15610` |
| 76 | 5.1 기본 정보_4 계약처 정보 변경(전) | 360x1100 | m_Input box×5, m_button×2, m_StatusBar, appbar_sub, phone_navi | `10928:15632` |
| 77 | 5.1 기본 정보_5 계약처 정보 변경(후) | 360x1169 | m_Input box×5, m_button×2, m_StatusBar, appbar_sub, phone_navi | `10928:15666` |
| 78 | 5.3 우편물 주소_2 주소 변경(전) | 360x874 | m_Input box×4, m_button×2, m_StatusBar, appbar_sub, phone_navi | `10928:15703` |
| 79 | 5.3 우편물 주소_3 주소 변경(후) | 360x1015 | m_Input box×4, m_button×2, m_StatusBar, appbar_sub, phone_navi | `10928:15734` |
| 80 | 6.3 현금영수증_1 메인 | 360x1058 | m_bar×6, m_chips×4, m_StatusBar, appbar_sub, phone_navi, menu_arrow_right, m_combobox | `10928:15854` |
| 81 | 6.3 현금영수증_3 메인(정보 없음) | 360x812 | m_chips×4, m_StatusBar, appbar_sub, menu_arrow_right, phone_navi, m_combobox | `10928:15939` |
| 82 | 6.3 현금영수증_2 메인(유의사항 펼침) | 360x1406 | m_bar×6, m_chips×4, m_StatusBar, appbar_sub, phone_navi, menu_arrow_right, m_combobox | `10928:15979` |
| 83 | 6.3 현금영수증_4 메인(사업자 고객) | 360x780 | m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi | `10928:16071` |
| 84 | 6.4 납입방법 변경_1 메인 | 360x780 | m_chips×4, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button | `10928:16102` |
| 85 | 6.4 납입방법 변경_2 지로 변경(전) | 360x1020 | m_Input box×3, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16138` |
| 86 | 6.4 납입방법 변경_3 지로 변경(후) | 360x1145 | m_Input box×3, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16188` |
| 87 | 6.4 납입방법 변경_4 자동이체 사업자 고객 변경(전) | 360x1390 | m_Input box×4, icon/combobox_arrow×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16241` |
| 88 | 6.4 납입방법 변경_5 자동이체 사업자 고객 변경(후) | 360x1647 | m_Input box×4, icon/combobox_arrow×2, m_StatusBar, appbar_sub, m_email_input, m_button, phone_navi | `10928:16324` |
| 89 | 6.4 납입방법 변경_6 자동이체 개인 고객 변경(전) | 360x1390 | m_Input box×4, icon/combobox_arrow×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16413` |
| 90 | 6.4 납입방법 변경_7 자동이체 개인 고객 변경(후) | 360x1703 | m_Input box×5, icon/combobox_arrow×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16489` |
| 91 | 6.4 납입방법 변경_8 신용카드(기본) | 360x1202 | icon/combobox_arrow×4, m_Input box×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16578` |
| 92 | 6.4 납입방법 변경_8 신용카드 변경(후) | 360x1443 | icon/combobox_arrow×4, m_Input box×2, m_StatusBar, appbar_sub, m_button, phone_navi, m_email_input | `10928:16666` |
| 93 | 6.4 납입방법 변경_8 신용카드(이메일) | 360x1318 | icon/combobox_arrow×4, m_Input box×2, m_StatusBar, appbar_sub, m_email_input, m_button, phone_navi | `10928:16760` |
| 94 | 6.4 납입방법 변경_8 신용카드(우편) | 360x1374 | icon/combobox_arrow×4, m_Input box×3, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:16849` |
| 95 | 6.2 세금계산서_2 수신담당자 변경 | 360x796 | m_StatusBar, appbar_sub, m_button, phone_navi, m_Input box, m_email_input, plus, tabel_bar | `10928:16947` |
| 96 | 6.2 세금계산서_3 수신담당자 변경(2명) | 360x1017 | m_Input box×2, m_email_input×2, m_StatusBar, appbar_sub, m_button, phone_navi, tabel_bar | `10928:16975` |
| 97 | 5.5 부가서비스_1 메인 | 360x780 | m_chips×7, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button, m_subbutton | `10928:17008` |
| 98 | 5.5 부가서비스_2 메인(변경정보 반영중) | 360x780 | m_chips×7, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button, m_subbutton, caution 2 | `10928:17040` |
| 99 | 5.5 부가서비스_3 메인(없음) | 360x780 | m_chips×7, m_StatusBar, appbar_sub, m_combobox, phone_navi, m_button | `10928:17075` |
| 100 | 5.5 부가서비스_4 신청내역 | 360x980 | menu_arrow_right×10, m_bar×10, m_StatusBar, appbar_sub, phone_navi | `10928:17107` |
| 101 | 5.5 부가서비스_5 신청내역(없음) | 360x780 | m_StatusBar, appbar_sub, phone_navi | `10928:17244` |
| 102 | 5.5 부가서비스_7 해지 신청 | 360x1065 | m_checkbox×3, m_Input box×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:17264` |
| 103 | 5.5 부가서비스_9 신규 신청(정보 입력) | 360x878 | m_Input box×3, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:17309` |
| 104 | 5.5 부가서비스_6 신청내역 확인 | 360x934 | m_StatusBar, appbar_sub, m_button, phone_navi | `10928:17401` |
| 105 | 4.3 관리자 초대_7 권한 선택(일반 관리자) | 360x780 | m_checkbox×5, m_radiobutton×2, m_StatusBar, appbar_sub, m_button, phone_navi | `10928:17441` |
| 106 | 6.1 청구입금_5 권한 없음 | 360x780 | m_StatusBar, appbar_sub, m_subbutton, phone_navi | `10928:17488` |
| 107 | 6.1 청구입금_5 권한 없음 | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_subbutton, phone_navi | `32035:52417` |
| 108 | 6.1 청구입금_6 서비스 미계약 | 360x780 | m_StatusBar, appbar_sub, m_subbutton, m_button, phone_navi | `10928:17521` |
| 109 | 6.1 청구입금_6 서비스 미계약 | 360x780 | m_StatusBar, appbar_sub, m_combobox, m_subbutton, m_button, phone_navi | `32035:52450` |
| 110 | 5.5 부가서비스_8 신규 신청(상품 선택) | 360x1946 | m_checkbox×14, m_StatusBar, appbar_sub, m_button, phone_navi | `22627:21347` |
| 111 | 10.1 카드관리_1 메인(구세대) | 360x1038 | menu_arrow_right×10, m_bar×10, m_StatusBar, appbar_sub, m_combobox, phone_navi | `21522:24172` |
| 112 | 4.3 관리자 초대_7 권한 선택(일반 관리자) | 360x780 | m_checkbox×5, m_radiobutton×2, m_StatusBar, appbar_sub, m_button, phone_navi | `24401:24584` |
| 113 | 4.3 관리자 초대_6 권한 선택(마스터 관리자) | 360x780 | m_radiobutton×2, m_button×2, m_StatusBar, appbar_sub, m_checkbox, phone_navi, close | `24414:32071` |
| 114 | 4.4 관리자 현황_3 권한 변경 | 360x780 | m_checkbox×5, m_radiobutton×2, m_button×2, m_StatusBar, appbar_sub, phone_navi, close | `24414:32104` |
| 115 | 5.1 기본 정보_1 메인 | 360x870 | m_chips×5, m_subbutton×2, m_StatusBar, appbar_sub, m_combobox, phone_navi | `24582:29471` |
| 116 | 5.5 부가서비스_8 신규 신청(상품 선택) | 360x1328 | m_checkbox×8, m_StatusBar, appbar_sub, m_button, phone_navi | `24652:27537` |
| 117 | 5.5 부가서비스_8 신규 신청(상품 선택) | 360x1704 | m_checkbox×12, m_StatusBar, appbar_sub, m_button, phone_navi | `24652:27599` |
| 118 | 6.1 청구입금_4 납입 상세 내역 | 360x922 | m_button, phone_navi, m_StatusBar, appbar_sub, menu_arrow_right, m_bar | `24652:35364` |
| 119 | 6.4 납입방법 변경_4 자동이체 사업자 고객 변경(전) | 360x870 | m_bar×3, icon/combobox_arrow×2, m_Input box×2, close, ok | `24664:48125` |
| 120 | 6.4 납입방법 변경_4 자동이체 사업자 고객 변경(전) | 360x870 | m_bar×3, icon/combobox_arrow×2, m_Input box×2, close, ok | `24664:48206` |
| 121 | 6.4 납입방법 변경_4 자동이체 사업자 고객 변경(전) | 360x870 | icon/combobox_arrow×4, m_bar×3, close, ok | `24669:50742` |
| 122 | 6.4 납입방법 변경_4 자동이체 사업자 고객 변경(전) | 360x870 | icon/combobox_arrow×4, m_bar×3, close, ok | `24669:50824` |
| 123 | 6.4 납입방법 변경_4 자동이체 사업자 고객 변경(전) | 360x870 | icon/combobox_arrow×4, m_bar×3, close, ok | `24669:50906` |
| 124 | 카카오톡 초대링크 이미지_800*800 | 800x800 | More×4, nav×3, close×2, card box×2, id, push new, menu_arrow_right, card registration, ic_작업목록확인 | `25277:35942` |
| 125 | 카카오톡 초대링크 이미지_800*800 | 800x800 | More×4, nav×3, close×2, card box×2, id, push new, menu_arrow_right, card registration, ic_작업목록확인 | `25282:41206` |
| 126 | 카카오톡 초대링크 이미지_800*800 | 800x800 | — | `25282:40042` |
| 127 | 카카오톡 초대링크 복사_1200*630 | 1200x630 | More×4, nav×3, close×2, card box×2, id, push new, menu_arrow_right, card registration, ic_작업목록확인 | `25277:36013` |
| 128 | 카카오톡 초대링크 복사_1200*630 | 1200x630 | More×4, nav×3, close×2, card box×2, id, push new, menu_arrow_right, card registration, ic_작업목록확인 | `25282:41277` |
| 129 | 카카오톡 초대링크 복사_1200*630 | 1200x630 | — | `25282:40255` |
| 130 | _?댁뼱_1 | 1005x2730 | — | `25282:39689` |
| 131 | 01_1242*2208 | 1242x2208 | — | `25282:41200` |
| 132 | 11.8 미권한_2 계약 없는 마스터 관리자 | 360x781 | m_StatusBar, appbar_sub, m_combobox, m_subbutton, m_button, phone_navi | `32035:52331` |

## 이 페이지에서 많이 쓰인 부품

| 부품 | 횟수 |
|---|---|
| m_button | 118 |
| m_StatusBar | 117 |
| appbar_sub | 117 |
| phone_navi | 114 |
| m_checkbox | 98 |
| m_chips | 93 |
| m_Input box | 88 |
| list | 77 |
| m_bar | 74 |
| menu_arrow_right | 53 |
| icon/combobox_arrow | 51 |
| close | 42 |
| More | 42 |
| m_combobox | 38 |
| nav | 30 |
| m_subbutton | 25 |
| card box | 20 |
| menu_arrow_down | 14 |
| m_radiobutton | 14 |
| m_email_input | 12 |
| id | 10 |
| push new | 10 |
| card registration | 10 |
| ic_작업목록확인 | 10 |
| ok | 9 |
| filter | 9 |
| pw off | 6 |
| document | 6 |
| under security | 6 |
| card | 6 |
