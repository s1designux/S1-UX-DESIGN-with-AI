# Claude ↔ Codex 공용 재개 규칙

## 목적

화면 재생성 작업은 여러 세션과 도구를 오갈 수 있다. 대화 기억에 의존하면 단계·결정·Figma 노드가 유실되므로, 저장소 파일을 공용 작업 기록으로 사용한다.

## 단일 정본

- 워크플로우 정본: `.claude/skills/screen-rebuild/SKILL.md`
- 진행 상태: `reports/screen-rebuild/{service}/{flow}/workflow-state.json`
- 단계 근거: 같은 폴더의 `1-inventory.md`, `2-mapping.md`, `node-map.json`, `4-verification.md`
- 다화면 실행 근거: `screen-spec.json`, `canonical-manifest.json`, `scan-summary.json`과 상세 trace 파일
- Codex 진입점: 루트 `AGENTS.md`의 screen-rebuild 포인터
- Claude 진입점: 루트 `CLAUDE.md`의 screen-rebuild 포인터

`.claude`라는 폴더명은 Claude 전용 복제본이라는 뜻이 아니다. 이 프로젝트에서는 기존 워크플로우의 단일 위치이며 Codex도 같은 파일을 읽는다.

## 상태 값

`status`는 다음 값만 사용한다.

| 값 | 의미 |
|---|---|
| `ready` | `nextAction`을 바로 실행 가능 |
| `in-progress` | 한 실행자가 해당 단계를 수행 중 |
| `awaiting-user` | 검문소에서 사용자 확인 대기 |
| `blocked` | 입력·권한·Figma 연결 등 외부 조건 대기 |
| `superseded` | 이전 PASS가 후속 검사로 무효화되어 재작업 필요 |
| `complete` | 5단계 등록 판단까지 통과 |

`currentPhase`는 `1-inventory`, `2-mapping`, `3-build`, `4-verification`, `5-registration`, `complete` 중 하나다. `lastCompletedCheckpoint`는 0~5의 정수다.

## 시작할 때

1. `workflow-state.json`과 실제 파일 존재 여부를 함께 확인한다.
2. 상태가 `in-progress`인데 다른 실행이 끝났는지 알 수 없으면 파일 변경 시각과 산출물을 확인한다. 확인 없이 덮어쓰지 않는다.
3. `awaiting-user`면 사용자의 기존 결정을 찾고, 없으면 해당 결정만 묻는다.
4. `blocked`면 `blockers`를 재확인한다. 같은 원인이 남아 있으면 다른 단계로 우회하지 않는다.
5. 상태보다 산출물이 덜 완성됐으면 더 이른 단계로 되돌리고 이유를 `handoff.summary`에 기록한다.

## 단계가 끝날 때

오케스트레이터가 다음 항목을 한 번에 갱신한다.

- `currentPhase`, `status`, `lastCompletedCheckpoint`, `nextAction`
- 새로 생긴 산출물 경로
- 화면별 `screens[].status`와 생성된 `targetNodeId`
- 미해결 `decisions`, `blockers`
- `handoff.lastActor`, `handoff.updatedAt`, `handoff.summary`

에이전트는 자신의 보고서나 `node-map.json`만 작성하고 `workflow-state.json`은 수정하지 않는다. 여러 작성자가 동시에 상태를 덮는 일을 막기 위해서다.

## 도구별 실행 차이

공통 의미는 유지하되 도구 이름만 각 환경에 맞춘다.

| 목적 | Claude | Codex |
|---|---|---|
| 구조 좁혀 읽기 | Figma metadata | Figma `get_metadata` |
| 원본 화면 확인 | Figma screenshot | Figma `get_screenshot` |
| 상세 수치 읽기 | Figma design context | `figma-design-to-code` 지침을 먼저 읽은 뒤 `get_design_context` |
| Figma 빌드·검사 | `use_figma` | `figma-use` 지침을 먼저 읽은 뒤 `use_figma` |
| 역할 분리 | 정의된 서브에이전트 | 사용 가능한 팀 에이전트에 동일 역할 문서를 전달 |

### Figma operator 선택

세션의 첫 가벼운 Figma 읽기로 실행 창구를 한 번 정한다. 역할 에이전트의 호출이 정상 완료되지 않으면 같은 경로를 반복하지 않고 실행 가능한 오케스트레이터를 operator로 고정한다. operator는 코드 실행과 결과 전달만 담당하며, 빌드 판단은 screen-rebuilder, PASS 판정은 component-verifier가 유지한다.

### compact 전달

- PASS 교대: `workflow-state.json` + 현재 단계 입력 + `scan-summary.json`의 집계·위반·trace count/hash만 읽는다.
- FAIL 교대: 실패 화면과 해당 trace 그룹만 추가로 읽는다.
- 전체 trace는 삭제하지 않되 매 교대마다 전문을 대화로 전달하지 않는다.
- `node-map.json`과 trace에 descendant 전문을 중복 저장하지 않는다.

어느 환경에서도 레거시 인스턴스 clone, 허용되지 않은 외부 라이브러리 사용, 원본 미확인 값 추측은 금지한다.

## 충돌 처리

- 같은 Figma 노드에 서로 다른 결과가 기록되면 최신 값으로 덮지 말고 두 값을 `decisions`에 남겨 재조회한다.
- Claude와 Codex의 판단이 다르면 근거 보고서를 모두 보존하고 `awaiting-user`로 전환한다.
- Figma 접근 실패 시 스크린샷이나 기억으로 빌드 단계를 진행하지 않는다. `blocked`로 기록한다.
- 기존 생성 노드를 다시 만들 때는 `node-map.json`의 대상을 먼저 확인하고, 사용자 승인 없이 이전 결과를 삭제하지 않는다.

## 완료 조건

`complete`는 다음을 모두 만족할 때만 사용한다.

1. 모든 `screens[].status`가 `verified` 또는 명시적으로 승인된 `excluded`
2. `1-inventory.md`, `2-mapping.md`, `3-build.md`, `node-map.json`, `4-verification.md`, `5-registration.md` 존재
3. 검증 결과 ❌(a) 0, ❓(c) 0, BLOCKED 0
4. 패턴 승격 여부와 `registry/patterns/index.json` 상태가 `5-registration.md`와 일치
5. `npm run screen-rebuild:statecheck -- <workflow-state.json>` 통과
