# UI 라이브러리 Claude ↔ Codex 공용 재개 규칙

## 목적

작업 방향·승인·진행 단계가 대화나 특정 AI에만 남지 않게 저장소 파일을 공용 기억으로 사용한다.

## 상태 파일

경로는 `reports/ui-library/{work-id}/workflow-state.json`이다. 오케스트레이터만 수정한다.

### 두 상태를 섞지 않는다

| 필드 | 의미 |
|---|---|
| `workflowStatus` | 지금 작업을 실행할 수 있는지: ready / in-progress / awaiting-user / blocked / superseded / complete |
| `uiLibraryStatus` | 결과물의 승인 단계: draft / needs-decision / candidate / verified / approved / deprecated |

### 단계

`0-governance → 1-inventory → 2-canon-readiness → 3-build → 4-verification → 5-human-review → 6-promotion → complete`

## 시작할 때

1. 상태 검사기를 실행한다.
2. `intent`, `currentPhase`, `nextAction`, `blockers`를 읽는다.
3. `canonicalInputs`의 파일 존재와 지문 변화를 확인한다.
4. Figma 대조가 필요한 단계면 `figmaSources`의 file key·node ID·충돌 기록을 확인한다.
5. 현재 단계에 필요한 `artifacts`만 읽는다.
6. `ownership.currentActor`가 남아 있으면 실제 파일 변경과 시작 시각을 확인한다.

세션 ID·도구 호출 ID·채팅 URL은 저장하지 않는다. 저장소 경로, Figma file key·node ID, 정본 지문처럼 다른 환경에서도 다시 조회할 수 있는 식별자만 사용한다.

## 단계가 끝날 때

오케스트레이터가 다음을 한 번에 갱신한다.

- `currentPhase`, `workflowStatus`, `uiLibraryStatus`, `lastCompletedCheckpoint`
- `nextAction`, `blockers`, `decisions`
- 새 산출물 경로와 정본 지문
- `ownership`
- `handoff.lastActor`, `handoff.updatedAt`, `handoff.summary`
- 실제 검증·river 승인 근거

## 충돌과 오래된 PASS

- 정본 지문이 변했으면 관련 검증을 `superseded`로 돌린다.
- 상태는 완료인데 필수 산출물이 없으면 더 이른 단계로 되돌린다.
- 서로 다른 구현이나 판단을 최신 파일로 조용히 덮지 않는다. 두 근거를 `decisions`에 남긴다.
- 구현자가 작성한 PASS는 독립 검증으로 인정하지 않는다.
- 검증 도구를 실행할 수 없으면 PASS가 아니라 `blocked`다.

## Git 전달 조건

상태와 산출물이 저장소에 있어도 커밋·공유되지 않으면 다른 PC에는 전달되지 않는다.

1. `npm run ui:handoff -- <workflow-state.json>` — 필수 파일의 Git 추적·커밋 여부 확인
2. 저장소를 원격으로 공유한다면 `git fetch` 후 `npm run ui:handoff:remote -- <workflow-state.json>` — 현재 커밋이 원격 추적 브랜치에 도착했는지 확인

검사가 막히면 다른 PC 전달 완료로 보고하지 않는다. 커밋·푸시는 사용자의 요청 범위와 저장소 운영 방식에 따라 수행한다.
