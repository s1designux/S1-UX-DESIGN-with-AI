# 6. Promotion — Base Input · Button

- 승격일: 2026-08-26
- 승인자: river
- 배포 버전: `@s1/ui 0.1.0`
- 결과: **APPROVED**

## 승인 범위

- Base Input: PC XXSM·XSM·MD, Mobile MD, 상태 7종, 선택형 안내 메시지, Editing remove 동작
- Button: Primary·Secondary·Blue Line, PC XXSM·XSM·MD, Mobile LG와 native 상태
- 전체 bundle과 개별 설치 HTML·CSS·JavaScript

Password Field·Search Input과 패턴은 포함하지 않는다.

## 승격 근거

- 코드 정본·Registry·UI source·dist 정합 PASS
- PC/Mobile × Light/Dark와 390px 실제 렌더 PASS
- Input remove 크기·Hover·삭제·초점 복귀 PASS
- Button 최소 너비·라벨 중앙·상태 PASS
- 전체 bundle과 개별 설치 동일성 PASS
- 자동 build·test·contract·icon 검사 PASS
- river UI·UX 승인 완료

별도 AI의 중복 실제 렌더 검증은 이번 단순 코어 변경에서 위험도 기반으로 생략했다. 정본 충돌, 복합 flow·접근성 동작, 검사 실패·차단이 있는 후속 변경에는 별도 검증을 다시 요구한다.

## 디자인가이드 게시

- 게시 화면: `pages/components.html#input`, `pages/components.html#button`
- 화면은 `ui-library/dist/s1-ui.css`와 `s1-ui.js`를 직접 사용한다.
- HTML·CSS·JavaScript 탭은 승인된 dist example과 component 파일을 그대로 읽는다.
- 기존 Input·Button 설명 마크업은 제거해 사이트 안에 두 번째 구현이 남지 않게 했다.
- PC·Mobile, Light·Dark, Input remove와 Button 크기·중앙 정렬을 실제 브라우저로 재확인했다.
