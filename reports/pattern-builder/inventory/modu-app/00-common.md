# 0. 공통 — 레거시 판독표 (modu-app)

> 원본: Figma 페이지 `1878:23794` · 읽은 날 2026-09-18
> 기계 판독 원자료: `raw/00-common.json`. 이 표는 그 자료를 사람이 보게 편 것이고, **해석·규칙은 여기에 쓰지 않는다.**

## 요약

| 항목 | 값 |
|---|---|
| 캔버스 위 노드 | 145개 |
| 화면으로 볼 것(360폭·400높이 이상) | 79개 |
| 쓰인 부품 종류 | 56종 |

## 화면 목록

| # | 화면 이름 | 크기 | 쓰인 부품 | 노드 |
|---|---|---|---|---|
| 1 | 알림함(시스템 경비) | 360x780 | m_StatusBar, appbar_sub, phone_navi | `21564:12153` |
| 2 | 알림함(시스템 경비) | 360x780 | m_StatusBar, appbar_sub, phone_navi | `21564:12388` |
| 3 | 알림_PUSH 알림 설정이 OFF일 경우 | 360x780 | m_StatusBar, icon/arrow, close, m_subbutton, phone_navi | `21564:12316` |
| 4 | 에러 1 | 360x740 | m_StatusBar, m_button, phone_navi | `3140:52022` |
| 5 | 에러 2 | 360x740 | m_StatusBar, m_button, phone_navi | `3140:52031` |
| 6 | 에러 4 | 360x740 | m_StatusBar, m_button, phone_navi | `8102:60003` |
| 7 | 날짜시간 선택 | 360x780 | More×3, m_chips×2, menu_arrow_down×2, phone_navi, m_StatusBar, ok, dome camera trouble, close, m_button | `3140:50553` |
| 8 | 기본 로딩 | 360x780 | m_chips×2, dome camera trouble, m_StatusBar, More, home, under security, dome camera, menu(hamburger), phone_navi | `3140:50396` |
| 9 | 긴 로딩 | 360x780 | m_StatusBar, phone_navi | `8207:59248` |
| 10 | 긴 로딩_서비스 정보 업데이트 중이예요 | 360x780 | m_StatusBar, phone_navi | `13029:22953` |
| 11 | 전체 메뉴 | 360x1938 | menu_arrow_right×24, close×2, under security×2, dome camera×2, m_StatusBar, More, refresh, push new, setting, card, event, healing environment, talk, helpdesk, home, menu(hamburger), phone_navi | `15533:26532` |
| 12 | 아이콘 1 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `2517:43063` |
| 13 | 아이콘 2 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `2517:43119` |
| 14 | 아이콘 3 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `2517:43166` |
| 15 | 아이콘 4 | 360x780 | m_StatusBar, appbar_sub, m_button, phone_navi | `2517:43217` |
| 16 | 아이콘 5 | 360x780 | m_StatusBar, appbar_sub, phone_navi | `2517:43281` |
| 17 | 아이콘 6 | 360x780 | m_StatusBar, appbar_sub, icon/combobox_arrow, m_button, phone_navi | `2517:43369` |
| 18 | 아이콘 모음 | 360x780 | — | `10580:7730` |
| 19 | 다이얼로그2 | 360x780 | m_button×2, m_StatusBar, appbar_sub, icon/combobox_arrow, phone_navi, close | `3140:50975` |
| 20 | 다이얼로그1 | 360x780 | m_button×2, m_StatusBar, appbar_sub, icon/combobox_arrow, phone_navi, close | `3140:51054` |
| 21 | 기본 토스트팝업 | 360x780 | m_chips×2, ok, m_StatusBar, More, home, under security, dome camera, menu(hamburger), phone_navi, etc_vertical, prz, view rotate, camera | `3140:51553` |
| 22 | 실시간 토스트팝업 | 360x780 | m_chips×2, menu_arrow_down×2, m_StatusBar, More, ok, dome camera trouble, etc_vertical, view rotate, pause, play, FF, rewind, home, under security, dome camera, menu(hamburger), phone_navi | `3140:51723` |
| 23 | 추가인증(간편번호) | 360x780 | m_StatusBar, appbar_sub, title/signup, phone_navi | `8466:60490` |
| 24 | 퀵메뉴 | 360x780 | home, under security, dome camera, menu(hamburger), phone_navi | `8814:60364` |
| 25 | 웹뷰 공통 닫기 버튼 | 360x780 | phone_navi, m_StatusBar, icon/arrow, close | `9247:45368` |
| 26 | 긴급공지 1 | 360x780 | close, phone_navi | `10968:38692` |
| 27 | 긴급공지 7 | 360x780 | close, phone_navi | `24741:29047` |
| 28 | 긴급공지 9 | 360x780 | close, phone_navi | `24741:29109` |
| 29 | 긴급공지 8 | 360x780 | close, phone_navi | `24741:29079` |
| 30 | 긴급공지 4 | 360x780 | close, phone_navi | `13689:4516` |
| 31 | 긴급공지 5 | 360x780 | close, phone_navi | `13696:4548` |
| 32 | 긴급공지 6 | 360x780 | close, phone_navi | `13696:14620` |
| 33 | 긴급공지 2 | 360x784 | close, phone_navi | `10968:38709` |
| 34 | 긴급공지 3(UT용) | 360x784 | close, phone_navi | `10968:38725` |
| 35 | 앱 업데이트 1(강제) | 360x732 | m_button | `10968:38821` |
| 36 | 앱 업데이트 2(선택) | 360x732 | close, m_button | `10968:38827` |
| 37 | 9.3 실시간 영상(세로)_2 로딩 | 360x780 | m_chips×2, home, under security, dome camera, menu(hamburger), phone_navi, m_StatusBar, More, dome camera trouble | `11308:10042` |
| 38 | 알림함(영상) | 360x881 | phone_navi, m_StatusBar, icon/arrow, close | `17801:12204` |
| 39 | 알림함(시스템경비) | 360x780 | phone_navi, m_StatusBar, icon/arrow, close | `21505:6629` |
| 40 | 알림함(시스템 경비) | 360x780 | m_StatusBar, icon/arrow, close, m_subbutton, phone_navi | `21564:12446` |
| 41 | 알림함(시스템 경비) | 360x780 | m_StatusBar, icon/arrow, close, phone_navi | `21569:12193` |
| 42 | 에러 5 | 360x740 | m_StatusBar, m_button, phone_navi | `21626:12686` |
| 43 | 계약처 검색_df | 360x779 | m_button, phone_navi, close, m_Input box, ok, m_bar | `28398:43877` |
| 44 | 계약처 검색_MAX | 360x780 | phone_navi, close, m_Input box, ok, m_bar | `28398:45036` |
| 45 | 계약처 검색_키보드 호출 | 360x780 | phone_navi, close, m_Input box, ok, m_bar | `28398:45078` |
| 46 | 계약처 검색_검색 후 | 360x780 | phone_navi, close, m_Input box, ok, m_bar | `28398:45120` |
| 47 | 계약처 검색_검색결과 없음 | 360x780 | phone_navi, close, m_Input box | `28398:45152` |
| 48 | 기기 로그인_서비스 장소 선택 | 360x780 | phone_navi, close, m_Input box, ok, lock, plus | `28398:49550` |
| 49 | 기기 로그인_서비스 장소 선택_검색 결과 | 360x780 | phone_navi, close, m_Input box, ok | `28398:49626` |
| 50 | 기기 로그인_서비스 장소 선택_키패드 | 360x780 | ok×2, lock×2, phone_navi, close, m_Input box, plus | `28398:49670` |
| 51 | 기기 로그인_서비스 장소 선택_키패드 | 360x780 | ok×2, lock×2, phone_navi, close, m_Input box, plus | `28398:49814` |
| 52 | 기기 로그인_서비스 장소 선택_키패드 | 360x780 | phone_navi, close, m_Input box | `28398:49958` |
| 53 | 기기 로그인_서비스 장소 선택(화면 높이 최대) | 360x780 | lock×4, phone_navi, close, m_Input box, ok, plus | `28398:50021` |
| 54 | 기기 로그인_서비스 장소 선택_검색 결과 없음 | 360x780 | phone_navi, close, m_Input box | `28398:50167` |
| 55 | 기기 로그인_서비스 장소 선택(화면 높이 최대)_검색 결과 | 360x780 | lock×4, phone_navi, close, m_Input box, ok, plus | `28398:50197` |
| 56 | 바텀시트(세로) | 360x780 | m_chips×2, phone_navi, m_StatusBar, More, dome camera trouble, etc_vertical, view rotate, close | `28398:50472` |
| 57 | 전체 메뉴 | 360x1938 | menu_arrow_right×28, close×2, under security×2, dome camera×2, card×2, m_StatusBar, More, refresh, push new, setting, event, healing environment, talk, helpdesk, home, menu(hamburger), phone_navi | `30023:31896` |
| 58 | 알림함(시스템경비-서브기기일때) | 360x779 | phone_navi, m_StatusBar, icon/arrow, close | `30803:37439` |
| 59 | 추천혜택(마케팅) 정보 알림 | 360x732 | m_subbutton×2, m_button variation | `30866:45164` |
| 60 | Footer | 360x448 | phone_navi | `18353:12689` |
| 61 | Footer | 360x467 | phone_navi | `18353:12785` |
| 62 | Footer | 360x466 | phone_navi | `18353:12946` |
| 63 | Footer | 360x502 | phone_navi | `18353:13149` |
| 64 | 삼성에스원_06마이페이지_01주문내역_00index | 360x1013 | header, header_1, title_, document, Estimate, under security, calendar, card, employee card, Footer, phone_navi | `18380:13832` |
| 65 | 삼성에스원_06마이페이지_01주문내역_00index | 360x1041 | More×4, header, header_1, title_, Estimate, calendar, employee card, phone_navi | `18380:13985` |
| 66 | 삼성에스원_06마이페이지_01주문내역_00index | 360x1008 | More×4, header, header_1, title_, phone_navi | `18380:14197` |
| 67 | 삼성에스원_06마이페이지_01주문내역_00index | 360x1058 | menu_arrow_right×4, header, header_1, title_, Footer, phone_navi | `18380:14401` |
| 68 | 삼성에스원_06마이페이지_01주문내역_00index | 360x1096 | menu_arrow_right×4, header, header_1, title_, Footer, phone_navi | `18381:5023` |
| 69 | 알림함(시스템 경비) | 360x780 | m_StatusBar, appbar_sub, phone_navi | `3140:52128` |
| 70 | 알림함(시스템 경비) | 360x780 | m_StatusBar, appbar_sub, phone_navi | `16063:5389` |
| 71 | 알림_PUSH 알림 설정이 OFF일 경우 | 360x780 | m_StatusBar, icon/arrow, close, m_subbutton, phone_navi | `1878:25258` |
| 72 | 알림_No Data Case | 360x780 | m_StatusBar, icon/arrow, close, phone_navi | `1878:25271` |
| 73 | 에러 3 | 360x740 | m_StatusBar, phone_navi | `3140:52011` |
| 74 | 전체 메뉴 | 360x1791 | menu_arrow_right×23, m_chips×3, close×2, under security×2, dome camera×2, m_StatusBar, More, refresh, push new, setting, card, event, healing environment, talk, helpdesk, home, menu(hamburger), phone_navi | `4090:54265` |
| 75 | 앱 접근 권한 허용 안내 1(안드로이드) | 360x780 | smartphone, img, ic_전화, camera, contact, m_button, phone_navi | `30871:86020` |
| 76 | 앱 접근 권한 허용 안내 2(iOS) | 360x780 | smartphone, camera, img, contact, m_button, phone_navi | `30871:86075` |
| 77 | 앱 접근 권한 허용 안내 | 360x780 | phone_navi, dual view | `30871:85722` |
| 78 | 앱 접근 권한 허용 안내 1(안드로이드) | 360x780 | smartphone, img, ic_전화, camera, contact, m_button, phone_navi | `30871:85843` |
| 79 | 앱 접근 권한 허용 안내 2(iOS) | 360x780 | smartphone, img, camera, contact, m_button, phone_navi | `30871:85898` |

## 이 페이지에서 많이 쓰인 부품

| 부품 | 횟수 |
|---|---|
| menu_arrow_right | 83 |
| phone_navi | 77 |
| close | 45 |
| m_StatusBar | 38 |
| m_button | 22 |
| More | 22 |
| m_chips | 19 |
| ok | 15 |
| appbar_sub | 13 |
| m_Input box | 13 |
| lock | 13 |
| under security | 12 |
| dome camera | 11 |
| icon/arrow | 9 |
| home | 8 |
| menu(hamburger) | 8 |
| menu_arrow_down | 6 |
| m_subbutton | 5 |
| dome camera trouble | 5 |
| card | 5 |
| camera | 5 |
| plus | 5 |
| header | 5 |
| header_1 | 5 |
| title_ | 5 |
| m_bar | 4 |
| smartphone | 4 |
| img | 4 |
| contact | 4 |
| refresh | 3 |
