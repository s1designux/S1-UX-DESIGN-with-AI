# Screen Rebuild 작업 현황

이 폴더는 완성된 패턴의 사용법이 아니라 **레거시 화면을 정본 컴포넌트로 재구성한 제작 과정과 검증 근거**를 보존한다.

완성된 패턴을 사용하거나 구현하려는 AI는 이 폴더를 먼저 읽지 않는다. 먼저 `registry/patterns/index.json`에서 패턴을 찾고, 등록된 `documentation.entry` 문서를 읽는다.

## AI 읽기 순서

### 패턴을 사용하거나 구현할 때

1. `registry/patterns/index.json`
2. 해당 패턴의 `documentation.entry`
3. 필요한 경우에만 flow·states·content 문서

### 리빌드 작업을 재개하거나 결함을 추적할 때

1. 대상 폴더의 `workflow-state.json`
2. `nextAction`·`blockers`
3. 현재 단계에 필요한 문서 1~2개
4. 문제가 있는 화면의 `node-map.json`·trace 일부

전체 `node-map.json`, trace, 과거 스크린샷은 기본 컨텍스트로 읽지 않는다.

## 플로우 현황

| 서비스 | 플로우 | 상태 | 완성 패턴 | 작업 기록 |
|---|---|---|---|---|
| MoDU App | 모바일 로그인 | 완료 | `mobile-login` | `modu-app/login-mobile/` |
| Login | PC Web 로그인 | 대체됨·재빌드 필요 | 미등록 | `login/pc-web/` |

## 문서 수명주기

| 단계 | 기본 문서 | 목적 |
|---|---|---|
| 제작 중 | `reports/screen-rebuild/{service}/{flow}/` | 무엇을 어떻게 만들고 검증했는지 기록 |
| 패턴 승격 후 | `registry/patterns/{pattern-id}/` | 왜 이 흐름이어야 하는지와 사용 규칙 제공 |
| 결함·재설계 | 완성 패턴 문서 → 관련 제작 기록 | 현재 규칙을 먼저 확인한 뒤 과거 근거를 선택 조회 |
