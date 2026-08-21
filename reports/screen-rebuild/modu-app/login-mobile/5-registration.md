# 5. 패턴 등록

## 결과

- 상태: `promoted`
- 패턴 ID: `mobile-login`
- 이름: `Mobile Login`
- 등록일: 2026-08-20

## 승격 근거

아이디·비밀번호 입력, 오류, 키보드, 자동 로그인, 신규 기기 인증은 여러 모바일 서비스에서 반복 사용할 수 있는 로그인 구조다. 에스원 로고와 서비스별 문구는 화면별 교체 항목으로 유지하고, 공통 레이아웃과 상태 조합을 패턴으로 등록한다.

이 패턴은 코어 컴포넌트의 시각 스타일을 재정의하지 않는다. 현재 정본 컴포넌트 인스턴스와 토큰을 조합하며, 설치기 결과와 패턴 소스가 달라질 경우에도 정본을 우선한다.

## 코어 컴포넌트 의존성

- StatusBar
- NavBar
- CI
- Footer
- Button
- Input
- Modal

## 검증 근거

- 로그인 화면 13개 독립 재검증 PASS
- 입력창 내부 필드 26/26: 320px 및 FILL
- 키보드 상태 보조 링크 2/2 복원
- 입력 A/B에 NavBar의 `Platform=App + Keyboard` 정본 적용
- 인스턴스 140개: 로컬 112개, 허용 원격 28개
- 문구 누락, raw 색, overflow, 출처 위반: 0
- 상세 결과: `reports/screen-rebuild/modu-app/login-mobile/4-verification.md`

## 범위 메모

로그아웃 확인 화면은 필요한 서비스 아이콘이 정본 허용 목록에 없어 이번 패턴에서 제외했다. 정본 아이콘이 준비되면 별도 변경 절차로 추가한다.

## 등록 위치

- Registry: `registry/patterns/index.json`
- Figma Section: `1562:2` (`Pattern / Mobile Login / MoDU`)
