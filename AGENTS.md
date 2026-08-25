# 프로젝트 하네스 포인터

## 하네스: 컴포넌트 정본 → 모델·설치기 자동 동기화

**목표:** 컴포넌트 시각 기준은 `build-components.ts` 한 곳에서 관리하고 모델과 설치기는 생성 결과를 사용한다. 메인 사이트 `pages/components.html`은 기존 손관리 화면을 보존하며 자동 생성 대상에서 제외한다.

**트리거:** 컴포넌트 기준·variant·사이즈 변경, 설치기 동기화·재실행·업데이트·수정·보완 요청에는 `.claude/skills/component-guide-sync/SKILL.md`를 사용한다. 사이트 변경은 별도 요청과 실제 화면 검증이 있을 때만 수행한다.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|---|---|---|---|
| 2026-08-11 | 컴포넌트 모델·설치기 동기화 하네스 포인터 추가 | component-guide-sync | 사이트는 손관리 화면으로 보존하고 자동 덮어쓰기를 차단 |

## 하네스: 레거시 화면 → 현재 컴포넌트 패턴 재생성

**목표:** 레거시 Figma 화면을 현재 로컬 정본 컴포넌트로 다시 조립하고, Claude와 Codex가 같은 파일 기반 진행 상태를 사용해 어느 쪽에서도 안전하게 이어서 작업한다.

**트리거:** 예전 화면을 현재 컴포넌트로 변환·재현·재생성하거나, 이전 screen-rebuild 결과를 재실행·업데이트·수정·보완할 때 `.claude/skills/screen-rebuild/SKILL.md`를 정본 워크플로우로 사용한다. 시작할 때 대상 폴더의 `workflow-state.json`을 먼저 읽고, 세션 대화 기억보다 저장된 상태와 Figma 노드 ID를 우선한다.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|---|---|---|---|
| 2026-08-20 | Claude↔Codex 공용 재개 규칙과 모바일 로그인 원본 등록 | screen-rebuild | 두 도구를 오가며 같은 단계부터 이어서 작업하기 위해 |
| 2026-08-20 | Fast-safe 대표 상태 선검증·단일 Figma operator·compact trace 규칙 추가 | screen-rebuild | 최종 전수검사 품질을 유지하면서 다화면 작업의 대기·재작업·토큰 사용을 줄이기 위해 |

## 완성 패턴 문서 읽기 규칙

**목표:** 제작 중인 리빌드 기록과 완성된 패턴의 사용 기준을 분리한다. 일반적인 패턴 사용·구현은 “왜 이 흐름이어야 하는가”를 먼저 읽고, 과거 빌드 이력은 결함 추적·재빌드 때만 읽는다.

**기본 읽기 순서:**

1. `registry/patterns/index.json`에서 패턴을 찾는다.
2. 해당 항목의 `documentation.entry`만 먼저 읽는다.
3. 작업에 필요한 경우에만 flow·states·content 문서를 선택해서 읽는다.
4. Figma 수정, 결함 추적, 재빌드가 필요한 경우에만 `evidence.buildHistory`의 `workflow-state.json`과 단계별 기록을 읽는다.

전체 `node-map.json`, trace, 과거 스크린샷을 기본 컨텍스트로 읽지 않는다. 패턴 승격 시 문서 생성 규칙은 `.claude/skills/screen-rebuild/references/pattern-documentation.md`를 따른다.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|---|---|---|---|
| 2026-08-24 | 제작 기록과 완성 패턴 사용 문서 분리 | pattern registry · screen-rebuild | 다른 AI가 과거 실행 로그보다 현재 흐름의 목적과 이유를 먼저 이해하도록 하기 위해 |

## 하네스: 정본 → 웹 UI 라이브러리 → 디자인가이드·패턴

**목표:** 정본 컴포넌트를 배포 가능한 HTML·CSS·JavaScript 모듈로 만들고, 디자인가이드 검수 화면과 퍼블리셔·개발자 배포본이 같은 코드를 사용하게 한다. 다른 PC·Claude·Codex에서도 저장소의 진행 상태를 기준으로 이어서 작업한다.

**트리거:** UI 라이브러리 제작·재개·모듈화·배포, 컴포넌트 웹 원본 코드, 디자인가이드 실제 동작 검수, 패턴 코드화 요청에는 `.claude/skills/ui-library-code/SKILL.md`를 사용한다. 시작할 때 `reports/ui-library/{work-id}/workflow-state.json`을 먼저 읽고 `npm run ui:state -- <경로>`로 검사한다. 대화 기억보다 저장된 목표·결정·현재 단계·다음 행동을 우선한다.

**핵심 경계:** 규칙 정본은 `registry/governance/ui-library-code-contract.json`, 웹 원본은 `ui-library/src`, `ui-library/dist`와 디자인가이드 화면은 파생 소비자다. 미등록 코어·variant·flow를 패턴 안에서 임시 생성하지 않는다.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|---|---|---|---|
| 2026-08-24 | Claude↔Codex 공용 UI 라이브러리 재개 하네스와 Input·Button 파일럿 상태 등록 | ui-library-code | 다른 PC·AI에서도 river의 목표와 현재 단계부터 안전하게 이어가기 위해 |
