# React판 개발자 검수 후속 수정 — 계획서

작성 2026-10-13 · 근거 `reports/publisher-audit/react/scorecard.html` · `reports/publisher-audit/react/result.json` · 검수기 `npm run audit:publisher:react -- --env <dir>`

## river 결정 (원문 그대로)
- `응 고쳐줘` → React판 성적표의 고장·불편 전부. Vue판은 이번 범위 밖(별도 결정).

## 원칙
- **데이터로 그리는 부품**: 견본 글자를 박지 않는다. 메뉴·목록·본문·버튼 글자는 props(목록) 또는 children 으로 받는다. 목록 모양은 부품 전체에서 하나로 통일한다 — `{ value, label, disabled?, ... }`.
- **React 관례**: 값은 `value`/`defaultValue`/`onChange`(제어·비제어), 열림은 `open`/`defaultOpen`/`onOpenChange`, 이벤트 이름은 React 대소문자(onBeforeChange). 기존 이름은 당분간 함께 받는다(하위호환).
- **ref·className·style**: 루트 DOM 으로 전달, 내부 배선과 합친다.
- **Next.js**: 훅 쓰는 파일에 "use client".
- **폼**: `name` 을 주면 폼 전송에 값이 실린다.
- 정본 값(색·크기·표기) 변경 금지. dist 손편집 금지. 웹 런타임 동작은 바꾸지 않는다(필요하면 React 쪽에서 감싼다).

## 고칠 것
| # | 항목 | 완료 조건 |
|---|---|---|
| R1 | 메뉴·목록 고정 글자(LNB·GNB·GNB 하위메뉴·DataTag·BottomSheet 본문·Modal 버튼 2개·Table 등) | 전부 props/children 으로 넣을 수 있고 견본 글자가 남지 않음 |
| R2 | Select·정렬 칩·Dropdown 등 목록 값이 모두 같아짐 | 목록 항목마다 고유 value, onChange 가 고른 값 |
| R3 | ListRow 스위치형·값 표시형 깨짐, button 안 button 경고 | 웹 예시와 같은 마크업·모양 |
| R4 | Modal·ModalContent 열기 없음, BottomSheet onOpen 0회 | 세 창 모두 open/defaultOpen/onOpenChange, 이벤트 정확히 1회 |
| R5 | DatePicker·TimePicker 값 넣기/읽기 없음 | value/defaultValue/onChange, 값 바뀌면 화면도 바뀜 |
| R6 | Pagination 쪽 알림 없음, 전체 쪽수 고정 | page/defaultPage/totalPages/onPageChange |
| R7 | Input 지우기(X) 시 onChange 없음 | X 누르면 onChange('') |
| R8 | Textarea 처음 값 넣으면 앱 멈춤, 그리기만 해도 오류 | 오류 0 |
| R9 | TimePicker 모바일 StrictMode 이중 반응 | 한 번만 반응 |
| R10 | ref 주면 동작 꺼짐 | ref 전달 + 동작 유지 |
| R11 | 폼 전송에 Select·Date·Time 값 빠짐, 스위치·칩·멀티토글 빠짐 | name 주면 실림 |
| R12 | README: 패키지 이름·경로 틀림, 다크 모드·글꼴·바탕 스타일·칩 묶음·시트 고르기·이벤트 값 안내 없음, 22/32종 | 웹판과 같은 내용 + React 사용법, 예시 그대로 붙여 빌드 성공 |
| R13 | 타입: S1_VERSION 없음, 아무 속성이나 받음, 이벤트 any | strict 통과, 오타 잡힘(data-*·aria-* 만 열어둠) |
| R14 | "use client" 없음 | 훅 쓰는 파일 전부 |
| R15 | 이름 섞임(breakName 에 PC/모바일과 비밀번호/검색 혼재, 이벤트 대소문자) | 분리·통일, 옛 이름 함께 받음 |
| R16 | 묶음 lint 가 자기 파일에서 17,081건, 진짜 문제 못 잡음 | 묶음 파일 제외, 오탐 0 |
| R17 | 웹판 수정(base.css 등)이 React 묶음에 빠짐 | 묶음에 포함 |

## 검증
- 🔎 `npm run audit:publisher:react -- --env <dir>` 고장 0, 위 항목 해당 불편 0
- 🔎 계약·빌드·테스트·ui:react·ui:runtime·rn:parity·gate:check
- 🤖 component-verifier 별도 spawn
