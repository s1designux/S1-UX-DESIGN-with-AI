# UI 라이브러리 작업 기록

UI 라이브러리 작업을 다른 PC·Claude·Codex에서 이어갈 때 사용하는 공용 기록이다.

## 재개 순서

1. 대상 폴더의 `workflow-state.json`을 읽는다.
2. `npm run ui:state -- <상태 파일>`을 실행한다.
3. `nextAction`과 현재 단계 산출물만 읽는다.
4. `.claude/skills/ui-library-code/SKILL.md`의 해당 단계부터 진행한다.

현재 파일럿: `input-button-pilot/workflow-state.json`

`reports`는 작업 진행과 근거를 기록한다. 실제 웹 원본은 `ui-library/src`, 배포 결과는 `ui-library/dist`에 둔다.
