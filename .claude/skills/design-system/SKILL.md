---
name: design-system
description: "SW Design System Guide 프로젝트 작업 오케스트레이터. 토큰 검증·HTML 가이드 생성·Figma 동기화·MD 리뷰·구현 결과 대조 검증을 자동화한다. (1) '토큰 검증해줘', '참조 오류 찾아줘' 요청 시 token-validator 실행, (2) 'guide-md 동기화', '가이드 페이지 업데이트', '새 페이지 만들어줘' 요청 시 guide-builder 실행, (3) 'Figma랑 비교해줘', 'Figma 동기화', '원본 확인' 요청 시 figma-inspector 실행, (4) '리뷰 등록해줘', '결정 대기 추가' 요청 시 md-review.html 업데이트, (5) '구현 결과 대조해줘', '항목별 검수해줘' 요청 시 component-verifier 실행, (6) 복합 작업·재검증·업데이트 요청 시에도 사용. **단, 'Figma 컴포넌트 구현/변환/만들어줘'처럼 Figma 원본을 코드로 옮기는 작업은 이 스킬이 아니라 figma-to-code 스킬을 사용한다.**"
---

# Design System Orchestrator

SW Design System Guide 프로젝트의 **유지보수·검증·문서화** 작업을 에이전트 팀 또는 서브 에이전트로 라우팅한다.

> **스킬 경계 (2026-06-05 분리 확정)**
>
> | 스킬 | 시점 | 담당 |
> |------|------|------|
> | `figma-to-code` | 작업 **진행 중** (사전 검문소) | Figma 원본 → 코드 5단계 워크플로우 (재고조사·수치추출·구현·자가대조·다크모드) |
> | `design-system` (본 스킬) | 작업 **완료 후/유지보수** | 토큰 검증·가이드 동기화·Figma 비교·리뷰 등록·구현 결과 대조 |
>
> Figma 컴포넌트를 새로 코드로 옮기는 작업은 `figma-to-code`로 라우팅한다. 본 스킬은 그 결과물에 대한 검증·문서 동기화·유지보수를 담당한다.

## Phase 0: 컨텍스트 확인

워크플로우 시작 시 실행 모드를 결정한다:

1. `_workspace/` 존재 + 부분 수정 요청 → **부분 재실행** (해당 에이전트만)
2. `_workspace/` 존재 + 새 입력 → **새 실행** (기존 `_workspace/`를 `_workspace_prev/`로 이동)
3. `_workspace/` 미존재 → **초기 실행**

## Phase 1: 작업 분류 및 라우팅

사용자 요청을 아래 4가지 작업 유형으로 분류한다.

| 요청 패턴 | 담당 에이전트 | 실행 모드 |
|---------|-------------|---------|
| 토큰 검증, 참조 오류, 네이밍 확인 | token-validator | 서브 에이전트 |
| HTML 가이드 생성/업데이트, MD 동기화 | guide-builder | 서브 에이전트 |
| Figma 비교, 원본 확인, 변수 동기화 | figma-inspector | 서브 에이전트 |
| 구현 결과 대조, 항목별 검수, ❌ 목록 | component-verifier | 서브 에이전트 |
| 복합 작업 (검증 + 가이드 + Figma + 대조) | 에이전트 팀 (4명) | 팀 |
| **Figma 컴포넌트 구현/변환** | **→ `figma-to-code` 스킬로 위임** | 별도 워크플로우 |

## Phase 2: 실행

### 서브 에이전트 단독 실행 (단순 작업)

```
Agent(
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "{에이전트 정의 파일 읽기} + {구체적 작업 지시}"
)
```

### 에이전트 팀 실행 (복합 작업)

```
TeamCreate(name: "ds-review", members: [token-validator, guide-builder, figma-inspector, component-verifier])
TaskCreate(tasks: [
  {id: "validate", agent: "token-validator", ...},
  {id: "figma-diff", agent: "figma-inspector", depends_on: []},
  {id: "guide-sync", agent: "guide-builder", depends_on: ["validate"]},
  {id: "diff-verify", agent: "component-verifier", depends_on: ["guide-sync"]}
])
```

> `component-verifier`는 **구현하지 않는다.** 1·2단계 표를 기준으로 결과물을 항목별 대조하고 ❌ 목록만 반환한다. 구현·수정은 `guide-builder`가 담당.

**팀 데이터 전달:** 파일 기반 (`_workspace/`) + 메시지 기반 (진행상황 공유)

## Phase 3: 결과 통합 및 보고

1. 각 에이전트 산출물 수집 (`_workspace/*.md`)
2. 사용자에게 결과 요약 보고
3. md-review.html 등록이 필요한 항목 → 바로 추가하거나 사용자 확인 후 추가

## 에이전트 파일 경로

```
.claude/agents/token-validator.md      — Gate 1 Registry + figma-to-code 2단계 매핑 검증
.claude/agents/guide-builder.md         — Gate 5 UI + harness 구현 (figma-to-code 3·5단계)
.claude/agents/figma-inspector.md       — Gate 2 Figma + figma-to-code 1·2단계 추출
.claude/agents/component-verifier.md   — figma-to-code 4단계 자가대조 (검증 전용)
```

## 파일 구조 참조

```
S1_AI_DESIGN_GUIDE/
├── tokens/
│   ├── semantic.md                  # Semantic Token 기준 파일
│   └── component-tokens-extracted.md # Component Token 기준 파일
├── pages/
│   ├── components.html              # 컴포넌트 인터랙션 미리보기
│   ├── semantic.html                # Semantic 토큰 테이블
│   ├── guide-md.html                # MD 원본 코드스니펫
│   └── md-review.html               # 리뷰·결정·체크리스트
├── assets/js/main.js                # 사이드바 SITE_NAV
├── data/site-map.json               # 페이지 메타데이터
└── CLAUDE.md                        # AI 작업 기준 문서
```

## 에러 핸들링

- 에이전트 실패 시: 1회 재시도 후 실패 내용을 보고서에 기록하고 다음 에이전트 진행
- Figma MCP 불가 시: 파일 기반 토큰 데이터로 분석, 보고서에 "Figma 미확인" 명시
- 파일 없음 시: `_workspace/` 없으면 생성 후 진행

## 테스트 시나리오

### 정상 흐름: 토큰 검증

```
입력: "component-tokens-extracted.md에서 참조 오류 찾아줘"
→ Phase 0: _workspace/ 없음 → 초기 실행
→ Phase 1: token-validator 라우팅
→ Phase 2: 서브 에이전트로 token-validator 실행
→ Phase 3: _workspace/validation-report.md 결과 요약 보고
```

### 에러 흐름: Figma MCP 불가

```
입력: "Figma랑 semantic.md 비교해줘"
→ Phase 2: figma-inspector 실행 → MCP 실패
→ 재시도 → 재실패
→ 보고서에 "Figma MCP 접근 불가, 파일 기반 분석으로 대체" 기록
→ tokens/*.md 내부 일관성 검증으로 전환하여 진행
```
