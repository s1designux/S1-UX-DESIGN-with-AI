# DS-Extract 코퍼스 분석

> 1개 페이지 합산 · 임계값 core = (서비스 ≥ 2 AND 빈도 ≥ 3)
> ⚠️ 서비스 1개만 분석 시 breadth 가 전부 1이라 코어 분류 불가 — 파일 더 넣으면 활성화.

## breadth(걸친 서비스 수) 분포

| 서비스 수 | 컴포넌트 종류 |
|---|---|
| 1 | 26 |

## 코어 컴포넌트 후보

| 빈도 | 서비스수 | 이름 | 기존DS | 대표nodeId |
|---|---|---|---|---|

## 서비스 컴포넌트 후보

| 빈도 | 서비스수 | 이름 | 기존DS | 대표nodeId |
|---|---|---|---|---|
| 63 | 1 | m_button | MATCH:button | 2449:31026 |
| 29 | 1 | pw off | NEW? | 2449:31237 |
| 25 | 1 | m_Input box | MATCH:input | 2449:31162 |
| 23 | 1 | m_bar | NEW? | 2449:31041 |
| 20 | 1 | menu_arrow_right | NEW? | 21505:5947 |
| 17 | 1 | close | NEW? | 2449:31191 |
| 15 | 1 | m_checkbox | MATCH:checkbox | 2449:31039 |
| 15 | 1 | Remove | NEW? | 8403:59617 |
| 11 | 1 | S1 logo | NEW? | 8403:60132 |
| 10 | 1 | m_login_bottom | NEW? | 8403:60142 |
| 9 | 1 | m_btn_full | MATCH:button | 2449:31165 |
| 8 | 1 | m_email_input | MATCH:input | 2449:31428 |
| 6 | 1 | More | NEW? | 2449:31047 |
| 5 | 1 | ok | NEW? | 2449:31200 |
| 3 | 1 | title/signup | NEW? | 8403:59321 |
| 3 | 1 | hide | NEW? | 8403:59386 |
| 2 | 1 | m_tab_mid | MATCH:tab | 8403:59486 |
| 2 | 1 | talk | NEW? | 21505:5942 |
| 2 | 1 | helpdesk | NEW? | 21505:5953 |
| 2 | 1 | home | NEW? | 21505:5987 |
| 2 | 1 | under security | NEW? | 21505:5991 |
| 2 | 1 | dome camera | NEW? | 21505:5995 |
| 2 | 1 | menu(hamburger) | NEW? | 21505:5999 |
| 1 | 1 | m_combobox/off/off/off/Default | NEW? | 10587:19808 |
| 1 | 1 | face check | NEW? | 8403:60459 |
| 1 | 1 | fingerprint | NEW? | 10587:19691 |

## 노이즈(시스템 크롬 — 제외)

| 빈도 | 서비스수 | 이름 | 기존DS | 대표nodeId |
|---|---|---|---|---|
| 56 | 1 | m_StatusBar  | NEW? | 8403:59292 |
| 52 | 1 | appbar_sub | NEW? | 2449:31015 |
| 46 | 1 | phone_navi | NEW? | 2449:31167 |
| 29 | 1 | keyboard | NEW? | 2449:31166 |

## 패턴 후보

| 빈도 | 서비스수 | 분류 | 구성 | 대표nodeId |
|---|---|---|---|---|
| 40 | 1 | service-pattern | appbar_sub + m_StatusBar  | 8403:59291 |
| 10 | 1 | service-pattern | m_button + m_login_bottom | 8403:60140 |
| 8 | 1 | service-pattern | keyboard + m_btn_full + phone_navi | 2449:31164 |
| 7 | 1 | service-pattern | Remove + pw off | 8403:60166 |
| 4 | 1 | service-pattern | m_Input box + m_email_input | 8403:59506 |
| 3 | 1 | service-pattern | m_bar + m_bar + m_bar | 2449:31457 |
| 3 | 1 | service-pattern | keyboard + phone_navi | 8403:59387 |
| 2 | 1 | service-pattern | m_Input box + m_Input box | 8403:59487 |
| 2 | 1 | service-pattern | appbar_sub + m_StatusBar  + title/signup | 8403:60359 |
| 1 | 1 | service-pattern | keyboard + m_btn_full | 8403:59325 |
| 1 | 1 | service-pattern | appbar_sub + m_StatusBar  + phone_navi | 10580:19147 |
| 1 | 1 | service-pattern | m_Input box + m_combobox/off/off/off/Default | 10587:19805 |
| 1 | 1 | service-pattern | m_button + m_button | 8403:60160 |
