# MoDU 모바일 로그인 리빌드 기록

이 폴더는 `mobile-login` 패턴의 **제작 이력과 검증 증거**다. 패턴의 현재 목적·흐름·사용 규칙을 찾는 경우에는 아래 완성 문서를 먼저 읽는다.

- 패턴 개요: `registry/patterns/mobile-login/README.md`
- 흐름과 이유: `registry/patterns/mobile-login/flow.md`
- 상태 목록: `registry/patterns/mobile-login/states.md`
- 콘텐츠·접근성 규칙: `registry/patterns/mobile-login/content-rules.md`

## 이 폴더를 읽어야 하는 경우

- Figma 화면을 수정하거나 재빌드할 때
- 과거 결정이 내려진 근거를 확인할 때
- 검증 실패나 회귀의 원인을 추적할 때
- 현재 정본과 과거 리빌드 결과의 차이를 조사할 때

작업을 재개할 때는 `workflow-state.json`을 먼저 읽는다. 큰 `node-map.json`과 trace 파일은 필요한 화면 ID만 검색한다.

## 최신 범위

- 현재 패턴 화면: 10개 (기본 흐름 4 + 분기 6)
- 프레임 이름: `APP/LOGIN/{흐름코드} · {상태명}` — 규칙 정본 `registry/governance/screen-naming-policy.json`
- 삭제된 상태: 아이디 미입력, 비밀번호 미입력, 인증 후 재로그인(구 `1562:15`)
- 별도 범위: 로그아웃 확인
- Figma Section: `1562:2` (윗줄 기본 흐름 · 아랫줄 분기)
- 패턴 상태: `promoted`

기존 13화면 시점의 보고서는 당시 제작·검증 증거로 보존한다. **최신 사양 변경은 `spec-change-2026-08-25-frame-naming.md`가 우선한다.** 레거시 프레임 이름(`2.1 로그인_…`)이 나오는 파일은 전부 그 이전 시점의 증거다.
