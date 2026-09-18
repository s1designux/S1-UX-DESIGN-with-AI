# 7. 홈 — 레거시 판독표 (modu-app)

> 원본: Figma 페이지 `268:10736` · 읽은 날 2026-09-18
> 기계 판독 원자료: `raw/07-home.json`. 이 표는 그 자료를 사람이 보게 편 것이고, **해석·규칙은 여기에 쓰지 않는다.**

## 요약

| 항목 | 값 |
|---|---|
| 캔버스 위 노드 | 167개 |
| 화면으로 볼 것(360폭·400높이 이상) | 65개 |
| 쓰인 부품 종류 | 28종 |

## 화면 목록

| # | 화면 이름 | 크기 | 쓰인 부품 | 노드 |
|---|---|---|---|---|
| 1 | 7.1 홈_14 경비구역 즐겨찾기 | 360x780 | menu(hamburger)×3, m_StatusBar, appbar_sub, m_button, phone_navi | `3188:49880` |
| 2 | 7.1 홈_15 경비구역 즐겨찾기(숨김) | 361x916 | menu(hamburger)×6, m_StatusBar, appbar_sub, m_button, phone_navi | `3188:49915` |
| 3 | 7.1 홈_1 경비 구역 여러개 | 360x1975.0001220703125 | menu_arrow_right×9, More×3, close×2, m_StatusBar, push new, refresh, security, release, tools, caution 2, setting, home, under security, dome camera, menu(hamburger), phone_navi | `23065:17941` |
| 4 | 7.1 홈_1 경비 구역 여러개 | 360x780 | More×2, m_StatusBar, push new, refresh, security, setting, close, home, under security, dome camera, menu(hamburger), phone_navi, Component 42 | `24999:10735` |
| 5 | 7.1 홈_1 경비 구역 여러개 | 360x1052 | More×3, menu_arrow_right×3, m_StatusBar, push new, refresh, security, release, tools, caution 2, close, setting, home, under security, dome camera, menu(hamburger), phone_navi | `17839:6511` |
| 6 | 7.1 홈_1 경비 구역 여러개 | 360x1052 | More×4, menu_arrow_right×3, m_StatusBar, push new, refresh, security, release, tools, caution 2, close, setting, home, under security, dome camera, menu(hamburger), phone_navi | `17839:6864` |
| 7 | 7.1 홈_1 경비 구역 여러개 | 360x1052 | More×4, menu_arrow_right×3, m_chips×2, m_StatusBar, push new, refresh, security, release, tools, caution 2, close, setting, home, under security, dome camera, menu(hamburger), phone_navi | `17839:7227` |
| 8 | 7.1 홈_2 경비 구역 1개 | 360x2168.000244140625 | menu_arrow_right×9, More×3, m_StatusBar, push new, refresh, security, setting, close, home, under security, dome camera, menu(hamburger), phone_navi | `17858:3258` |
| 9 | 7.1 홈_2 경비 구역 1개 | 360x1106.0001220703125 | More×3, menu_arrow_right×3, m_StatusBar, push new, refresh, security, release, setting, home, under security, dome camera, menu(hamburger), phone_navi | `17857:7736` |
| 10 | 7.1 홈_10 알림 노출 | 360x780 | More×3, menu_arrow_right×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `3188:50651` |
| 11 | 7.1 홈_13 이벤트혜택 없음 | 360x1057 | More×2, menu_arrow_right×2, m_StatusBar, push, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `3188:50778` |
| 12 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1083 | More×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `3188:50894` |
| 13 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1083 | More×2, m_subbutton×2, m_StatusBar, push new, refresh, security, setting, close, home, under security, dome camera, menu(hamburger), phone_navi | `18403:27098` |
| 14 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1083 | More×2, m_subbutton×2, m_StatusBar, push new, refresh, security, setting, close, home, under security, dome camera, menu(hamburger), phone_navi | `18403:27287` |
| 15 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1425 | close×4, More×2, m_subbutton×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `18406:4227` |
| 16 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1425 | close×4, More×2, m_subbutton×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `18406:4438` |
| 17 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1273 | More×2, m_subbutton×2, close×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `18410:6320` |
| 18 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1083 | More×2, m_subbutton×2, m_StatusBar, push new, refresh, security, setting, close, home, under security, dome camera, menu(hamburger), phone_navi | `18403:27468` |
| 19 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, m_StatusBar, push new, refresh, security, release, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `3188:50988` |
| 20 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, m_StatusBar, push new, refresh, security, release, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `17945:3498` |
| 21 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, close×2, m_StatusBar, push new, refresh, security, release, setting, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `17945:5026` |
| 22 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, m_StatusBar, push new, refresh, security, release, Component 43, Component 42, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `17976:3314` |
| 23 | 경비구역에 표시되는 경우 | 360x780 | More×5, m_subbutton×2, m_StatusBar, push new, refresh, security, release, Component 42, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `17976:4204` |
| 24 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, m_StatusBar, push new, refresh, security, release, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `17945:5301` |
| 25 | 7.1 홈_5 영상 서비스 미계약 | 360x780 | More×5, m_subbutton×2, close×2, m_StatusBar, push new, refresh, security, release, setting, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi | `17945:4481` |
| 26 | 7.1 홈_6 시스템경비 서비스 미계약 | 360x780 | menu_arrow_right×6, More×2, m_StatusBar, push new, close, home, under security, dome camera, menu(hamburger), phone_navi | `3208:54273` |
| 27 | 7.1 홈_7 보유 권한 없음 | 360x780 | More×2, m_StatusBar, push new, home, under security, dome camera, menu(hamburger), phone_navi | `3188:51131` |
| 28 | 7.1 홈_12 경비 구역 미지정 | 360x780 | More×2, m_StatusBar, push new, refresh, home, under security, dome camera, menu(hamburger), phone_navi | `3188:51203` |
| 29 | 7.1 홈_8 영상 권한 없음 | 360x780 | More×3, setting×2, m_StatusBar, push new, refresh, security, home, under security, dome camera, menu(hamburger), phone_navi | `3188:51277` |
| 30 | 7.1 홈_4 계약 서비스 없음 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi | `3284:51617` |
| 31 | 7.1 홈_4 계약 서비스 없음 | 360x780 | m_StatusBar, More, push new, close, home, under security, dome camera, menu(hamburger), phone_navi | `17945:3674` |
| 32 | 7.1 홈_4 계약 서비스 없음 | 360x780 | Icon_etc×2, m_StatusBar, More, push new, close, home, under security, dome camera, menu(hamburger), phone_navi, Icon_Network-Security | `17974:4177` |
| 33 | 7.1 홈_4 계약 서비스 없음 | 360x780 | m_StatusBar, More, push new, close, home, under security, dome camera, menu(hamburger), phone_navi | `17974:4035` |
| 34 | 7.1 홈_4 계약 서비스 없음 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi, Component 43, Component 42 | `17976:3633` |
| 35 | 배너 위에 표시되는 경우 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi, Component 42 | `17976:4392` |
| 36 | 7.1 홈_4 계약 서비스 없음 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi, Component 43, Component 42 | `17976:3802` |
| 37 | 배경이 흰색인 경우 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi, Component 42 | `17976:4495` |
| 38 | 7.1 홈_4 계약 서비스 없음 | 360x780 | Component 43×4, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi | `17976:2544` |
| 39 | 7.1 홈_4 계약 서비스 없음 | 360x780 | Component 42×8, Component 43×3, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi | `17976:2749` |
| 40 | 7.1 홈_4 계약 서비스 없음 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi | `17972:3980` |
| 41 | 7.1 홈_4 계약 서비스 없음 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi | `17945:3953` |
| 42 | 7. 홈_카드/열쇠지원 버튼 수정 | 360x680 | menu_arrow_right×3, More×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `17865:15773` |
| 43 | 7. 홈_카드/열쇠지원 버튼 수정 | 360x722 | menu_arrow_right×3, More×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `17865:15902` |
| 44 | 8.1 경비/해제_출동 전 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `21738:17515` |
| 45 | 8.1 서비스 지원 요청_바텀시트 | 360x780 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi, close, m_button | `21738:17629` |
| 46 | 8.1 경비/해제_출동 중 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `21738:17768` |
| 47 | 8.1 경비/해제_출동 전 | 360x1183 | m_chips×4, More×3, tools×2, m_StatusBar, refresh, security, release, caution 2, setting, default, home, under security, dome camera, menu(hamburger), phone_navi | `21738:17883` |
| 48 | 8.1 경비/해제_펼침상태_출동 중 | 360x1183 | m_chips×4, More×2, refresh×2, m_StatusBar, release, caution 2, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `21738:17997` |
| 49 | 8.1 경비/해제_펼침상태_출동 중 | 360x1183 | m_chips×4, More×3, refresh×2, m_StatusBar, house, caution 2, release, setting, tools, default, home, under security, dome camera, menu(hamburger), phone_navi | `21738:18153` |
| 50 | MoDU App 홈 - 추천·혜택 배너 가이드 | 1597x1080 | — | `22186:25269` |
| 51 | 7.1 홈_11 알림 노출 case | 360x780 | — | `23076:33095` |
| 52 | 7.1 홈_11 알림 노출 case | 360x780 | — | `23661:18700` |
| 53 | 7.1 홈_10 알림 노출 | 360x780 | More×3, m_subbutton×2, menu_arrow_right×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `23661:19776` |
| 54 | 7.1 홈_9 최근 본 영상 내역 없음 | 360x1083 | More×2, m_subbutton×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `23661:19914` |
| 55 | 7.1 홈_8 영상 권한 없음 | 360x780 | More×3, m_subbutton×2, setting×2, m_StatusBar, push new, refresh, security, home, under security, dome camera, menu(hamburger), phone_navi | `23661:20018` |
| 56 | 7.1 홈_1 경비 구역 여러개 | 360x2203.000244140625 | menu_arrow_right×12, More×3, close×2, m_StatusBar, push new, refresh, security, release, tools, caution 2, setting, home, under security, dome camera, menu(hamburger), phone_navi, Component 42 | `23661:20553` |
| 57 | 홈화면에 표시되는 경우 | 360x780 | More×5, refresh×2, m_StatusBar, push new, security, release, setting, close, menu_arrow_right, home, under security, dome camera, menu(hamburger), phone_navi, Component 42 | `23670:25126` |
| 58 | 배너 위에 표시되는 경우 | 360x780 | close×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi, Component 42 | `23670:25342` |
| 59 | 배경이 흰색인 경우 | 360x780 | close×2, Component 42×2, m_StatusBar, More, push new, home, under security, dome camera, menu(hamburger), phone_navi | `23670:25434` |
| 60 | 7.1 홈_1 경비 구역 여러개 | 360x2023.0001220703125 | menu_arrow_right×9, More×3, m_StatusBar, push new, refresh, security, release, tools, caution 2, close, setting, home, under security, dome camera, menu(hamburger), phone_navi | `23719:25752` |
| 61 | 7.1 홈_1 경비 구역 여러개 | 320x2023 | menu_arrow_right×9, More×3, m_StatusBar, push new, refresh, security, release, tools, caution 2, close, setting, home, under security, dome camera, menu(hamburger), phone_navi | `26514:98973` |
| 62 | 7.1 홈_1 경비 구역 여러개 | 360x2023.0001220703125 | menu_arrow_right×9, More×3, m_StatusBar, push new, refresh, security, release, tools, caution 2, close, setting, home, under security, dome camera, menu(hamburger), phone_navi | `26514:99321` |
| 63 | 7.1 홈_2 경비 구역 1개 | 360x1996.0001220703125 | menu_arrow_right×9, More×2, m_StatusBar, push new, refresh, security, setting, home, under security, dome camera, menu(hamburger), phone_navi | `23719:25991` |
| 64 | 7.1 홈_3 Case 별 경비 구역 표시 | 1481x1170 | More×9, caution 2×6, release×5, house×3, security×2, tools×2, close×2 | `23719:26219` |
| 65 | 지인추천배너 | 2963x1000 | — | `23708:25016` |

## 이 페이지에서 많이 쓰인 부품

| 부품 | 횟수 |
|---|---|
| More | 161 |
| menu_arrow_right | 104 |
| close | 95 |
| menu(hamburger) | 69 |
| m_StatusBar | 62 |
| phone_navi | 62 |
| home | 60 |
| under security | 60 |
| dome camera | 60 |
| push new | 53 |
| refresh | 47 |
| setting | 45 |
| security | 43 |
| m_subbutton | 32 |
| release | 29 |
| Component 42 | 26 |
| m_chips | 26 |
| tools | 20 |
| caution 2 | 20 |
| Component 43 | 10 |
| default | 6 |
| house | 4 |
| m_button | 3 |
| appbar_sub | 2 |
| Icon_etc | 2 |
| push | 1 |
| Icon_Network-Security | 1 |
| m_button variation | 1 |
