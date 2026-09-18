# 8. 시스템 경비 — 레거시 판독표 (modu-app)

> 원본: Figma 페이지 `1765:20272` · 읽은 날 2026-09-18
> 기계 판독 원자료: `raw/08-security.json`. 이 표는 그 자료를 사람이 보게 편 것이고, **해석·규칙은 여기에 쓰지 않는다.**

## 요약

| 항목 | 값 |
|---|---|
| 캔버스 위 노드 | 52개 |
| 화면으로 볼 것(360폭·400높이 이상) | 35개 |
| 쓰인 부품 종류 | 34종 |

## 화면 목록

| # | 화면 이름 | 크기 | 쓰인 부품 | 노드 |
|---|---|---|---|---|
| 1 | 8.1 경비해제_1 경비중 | 360x1049 | m_chips×4, More×2, m_StatusBar, refresh, security, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `1878:25465` |
| 2 | 8.1 경비해제_1 경비중 | 360x1049 | m_chips×4, More×2, m_StatusBar, refresh, security, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `17816:22850` |
| 3 | 8.1 경비해제_5 출입문 설정 없음 | 360x1049 | m_chips×4, More×2, m_StatusBar, refresh, security, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `9405:45637` |
| 4 | 8.1 경비해제_4 경비 구역 모두 접음 | 360x942 | m_chips×4, More×3, m_StatusBar, refresh, security, release, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `1878:26357` |
| 5 | 8.1 경비해제_3 경비 구역 2개 | 360x1183 | m_chips×4, More×3, m_StatusBar, refresh, security, release, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `1878:26546` |
| 6 | 8.1 경비해제_2 해제중 | 360x1049 | m_chips×4, More×2, m_StatusBar, refresh, release, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `1878:26671` |
| 7 | 8.6 경비해제 이력_1 메인 | 360x1240 | menu_arrow_right×10, m_bar×10, m_chips×5, m_StatusBar, More, mail sms, download, building control, home, under security, dome camera, menu(hamburger), phone_navi | `1943:23272` |
| 8 | 8.6 경비해제 이력_3 검색 | 360x780 | m_chips×5, menu_arrow_right×5, m_bar×5, m_button×4, calendar×2, m_StatusBar, More, building control, mail sms, download, home, under security, dome camera, menu(hamburger), phone_navi, close, m_combobox | `1943:23429` |
| 9 | 8.1 경비해제_6 Case 별 경비 구역 표시 | 3588x1610 | More×17, caution 2×8, release×7, security×6, refresh×6, house×4, tools×2, close×2 | `30023:37985` |
| 10 | 8.1 경비해제_6 Case 별 경비 구역 표시 | 1501x1170 | More×8, caution 2×7, release×4, security×3, house×3, close×2, tools×2 | `20883:14272` |
| 11 | 8.7 긴급연락처_1 메인 | 360x965 | m_bar×5, m_chips×5, phone_navi, m_subbutton, m_StatusBar, More | `15598:14744` |
| 12 | 8.7 긴급연락처_1 메인 | 360x965 | m_chips×5, list×4, phone_navi, m_subbutton, m_StatusBar, More | `15652:27312` |
| 13 | 8.7 긴급연락처_1 메인 | 360x1027 | m_chips×5, list×2, phone_navi, m_checkbox, m_bar, m_subbutton, m_StatusBar, More | `15671:35097` |
| 14 | 8.7 긴급연락처_1 메인 | 360x1496 | m_subbutton×18, m_chips×5, plus×3, tabel_bar×3, m_StatusBar, More, phone_navi | `15671:35328` |
| 15 | 5.2 긴급연락처_2 긴급연락처 변경(전) | 360x1199 | m_Input box×6, m_StatusBar, appbar_sub, m_button, phone_navi, plus | `15598:14808` |
| 16 | 5.2 긴급연락처_2 긴급연락처 변경(전) | 360x780 | m_Input box×2, m_StatusBar, appbar_sub, m_button, phone_navi, plus | `15652:27382` |
| 17 | 5.2 긴급연락처_3 긴급연락처 변경(후) | 360x1505 | m_Input box×8, m_StatusBar, appbar_sub, phone_navi, m_button | `15598:14846` |
| 18 | 5.2 긴급연락처_3 긴급연락처 변경(후) | 360x780 | m_Input box×2, m_StatusBar, appbar_sub, phone_navi, m_button | `15652:27420` |
| 19 | dialog | 360x732 | close×2, m_button×2 | `15598:19568` |
| 20 | 4.1 권한_ 3 마스터 관리자 | 360x780 | list×4, m_StatusBar, appbar_sub, m_combobox, m_button, phone_navi | `15671:34773` |
| 21 | 8.1 경비/해제_출동 전 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `30023:38582` |
| 22 | 8.1 서비스 지원 요청_바텀시트 | 360x780 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi, close, m_button | `30023:38696` |
| 23 | 8.1 경비/해제_출동 중 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `30023:38835` |
| 24 | 8.1 경비/해제_출동 중 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `23719:24757` |
| 25 | 8.1 경비/해제_출동 전 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `30023:38950` |
| 26 | 8.1 경비/해제_펼침상태_출동 중 | 360x1183 | m_chips×4, More×2, refresh×2, m_StatusBar, release, caution 2, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `30023:39064` |
| 27 | 8.1 경비/해제_펼침상태_출동 중 | 360x1183 | m_chips×4, More×3, refresh×2, m_StatusBar, house, caution 2, release, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `30023:39220` |
| 28 | 8.5 순찰보고서_1 메인 | 360x1076 | m_chips×4, m_StatusBar, More, home, under security, dome camera, menu(hamburger), phone_navi | `23702:19844` |
| 29 | 8.5 순찰보고서_2 메인(없음) | 360x780 | m_chips×4, m_StatusBar, More, home, under security, dome camera, menu(hamburger), phone_navi | `23702:19890` |
| 30 | 8.2 미권한_4 마스터 관리자 미계약 | 360x780 | m_StatusBar, m_subbutton, m_button, home, under security, dome camera, menu(hamburger), phone_navi | `28473:45582` |
| 31 | 8.2 미권한_2 시스템 경비 권한 없음 | 360x780 | m_StatusBar, m_subbutton, home, under security, dome camera, menu(hamburger), phone_navi | `28473:45626` |
| 32 | 8.2 미권한_3 시스템 경비 미개시 | 360x780 | m_StatusBar, m_subbutton, home, under security, dome camera, menu(hamburger), phone_navi | `28473:45676` |
| 33 | 8.1 경비/해제_출동 전 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `26512:76768` |
| 34 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, m_StatusBar, push new, refresh, security, release, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `26518:99675` |
| 35 | 8.5 순찰보고서_1 메인 | 360x927.272705078125 | m_chips×4, m_StatusBar, More, home, under security, dome camera, menu(hamburger), phone_navi | `30866:41810` |

## 이 페이지에서 많이 쓰인 부품

| 부품 | 횟수 |
|---|---|
| m_chips | 98 |
| More | 79 |
| m_StatusBar | 32 |
| phone_navi | 32 |
| tools | 26 |
| m_subbutton | 26 |
| refresh | 25 |
| release | 24 |
| caution 2 | 24 |
| security | 23 |
| home | 23 |
| under security | 23 |
| dome camera | 23 |
| menu(hamburger) | 23 |
| m_bar | 21 |
| m_Input box | 18 |
| setting | 16 |
| menu_arrow_right | 16 |
| default | 15 |
| m_button | 13 |
| list | 10 |
| close | 9 |
| house | 8 |
| plus | 5 |
| appbar_sub | 5 |
| tabel_bar | 3 |
| mail sms | 2 |
| download | 2 |
| building control | 2 |
| calendar | 2 |
