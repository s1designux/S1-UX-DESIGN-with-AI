---
name: ui-library-code
description: "정본 컴포넌트를 배포 가능한 HTML·CSS·JavaScript UI 라이브러리로 만들고, 디자인가이드 안내 페이지·실제 배포본 검수와 river UX 승인까지 이어가는 파일 기반 워크플로우. **river 확정 대표 진입어: '웹 업데이트 해줘'** (2026-08-31). 컴포넌트 이름이 함께 오면 그 컴포넌트, 없으면 무엇을 업데이트할지 되묻는다. 같은 뜻의 다른 표현: '{컴포넌트} 웹으로 만들어줘' · '~ 배포본 만들어줘' · '~ 코드로 정리해줘' · '~ 안내 페이지 만들어줘' · 컴포넌트 이름과 함께 '~ 진행해줘' · 'UI 라이브러리 작업 이어서'. UI 라이브러리 제작·재개·수정·모듈화·패턴 코드화, dist 연동, 컴포넌트 안내 페이지 등재·수정 요청에 사용한다. Figma 쪽 작업(figma-to-code·screen-rebuild·figma-library-build)과 구분: 이 스킬은 '실제 배포되는 웹 코드'를 만든다."
---

# UI Library Code Workflow

정본에서 웹 UI 원본 코드를 만들고 실제 배포본을 검수하는 단일 워크플로우다. Claude와 Codex 모두 이 파일을 사용한다. `.claude`는 저장 위치일 뿐 Claude 전용 사본이 아니다.

## 가장 먼저 읽을 것

1. 대상 `reports/ui-library/{work-id}/workflow-state.json`
2. `registry/governance/ui-library-code-contract.json`
3. `references/wiring-and-traps.md` — **착수 5분 점검 · dist 연동 배선표 · 검증 함정 목록**
4. 상태 파일의 `nextAction`, `blockers`, 현재 단계 입력 파일만

대화 기억보다 저장소 상태를 우선한다. 과거 보고서 전체를 기본 컨텍스트로 읽지 않는다.

## 단일 정본 경계

- 규칙: `registry/governance/ui-library-code-contract.json`
- 시각·토큰: 상태 파일 `canonicalInputs`가 가리키는 정본
- 의미·행동·접근성: `registry/components/*.json`
- 작업 진행: `reports/ui-library/{work-id}/workflow-state.json`
- 실제 웹 원본: `ui-library/src/**`
- 배포 결과: `ui-library/dist/**` — 손편집 금지
- 검수 소비자: `pages/ui-review.html` — 실제 dist만 사용
- 이행 장부: `registry/governance/ui-library-migration.json`

규칙을 이 스킬에 복사해 새 정본을 만들지 않는다. 계약과 스킬이 다르면 계약을 우선하고 스킬의 진행 절차를 고친다.

## 역할 분리

| 역할 | 담당 | 책임 |
|---|---|---|
| 저장소 사실 판독 | `source-reader` | 현재 코드·배선·정본 사실만 판독 |
| Figma 시각 참고 판독 | `figma-inspector` | 정본만으로 시각 이해가 어려울 때 상태 파일의 현재 V3.0 참고 화면 확인 |
| 토큰 매핑 검증 | `token-validator` | 정본 토큰 경유와 신규 후보 판정 |
| UI 원본 구현 | `ui-library-builder` | `ui-library/src`와 build pipeline 구현 |
| 검수 화면 연결 | `guide-builder` | 실제 dist를 쓰는 `pages/ui-review.html` 연결 |
| 기술 검증 | 오케스트레이터 또는 `component-verifier` 시나리오 F | 정본·렌더·동작·배포 동일성 판정. 위험 조건에서는 별도 검증자 필수 |
| 총괄 | 오케스트레이터 | 계획, 검문소, 상태 파일 갱신, river 보고 |

빌더는 자기 산출물을 단독 승인하지 않는다. 오케스트레이터가 자동 검사·실제 렌더·river 승인 근거를 모아 판정하며, 계약의 위험 조건에서는 별도 검증자를 추가한다. 역할 에이전트는 자기 산출물만 작성하며 `workflow-state.json`은 오케스트레이터만 수정한다.

## 단계와 검문소

### 0-governance — 작업 기준 준비

- 계약 버전과 상태를 확인한다.
- river의 목표·금지 원칙을 상태 파일 `intent`에 기록한다.
- 대상과 현재 정본 파일의 지문을 기록한다.

**통과:** 계약·가이드·체크리스트가 존재하고 `npm run ui:contract`가 통과한다.

### 1-inventory — 전수 재고조사

- 대상 컴포넌트별 코드 시각 정본, Registry, 사이트 후보, CSS, JavaScript, 코드 예시, 배포 가능 여부를 확인한다.
- 시각 정본은 `build-components.ts`다. Figma V3.0은 필요할 때만 사람이 보기 쉬운 참고로 사용하며 inventory 필수 조건이 아니다.
- 레거시 Figma 화면을 비교 근거로 끌어오지 않는다.
- 기존 화면에서 동작한다고 배포 정본으로 간주하지 않는다.
- 대상 variant·size·state와 미결정 flow를 목록화한다.

**검문소:** 목록 누락 0건. 모르는 항목은 `미확인`으로 남기며 추측하지 않는다.

### 2-canon-readiness — 제작 전 정본 준비

- 공개 root·part·state·event·접근성 계약을 Registry에서 확정한다.
- 정본에 없는 컴포넌트·variant·토큰·flow가 필요하면 `needs-decision` 또는 `needs-core-update`로 멈춘다.
- 이미지로 알 수 없는 동작은 제작 전에 river에게 질문한다.

**검문소:** `needs-decision` 0건, 정본 신설은 river 승인 기록 존재.

### 3-build — 원본·배포·검수 소비자 구현

- `ui-library-builder`가 `ui-library/src`와 생성 경로를 구현한다. **배선 자리는 `references/wiring-and-traps.md` §1 배선표를 따른다** — 빌드 스크립트·검사기·설치 경로·소비자·등록부 중 하나만 빠져도 조용히 연결이 안 된다.
- 아이콘은 manifest에 hit area와 분리된 frame·glyph geometry를 기록하고 `npm run ui:icons`를 통과시킨다.
- 전체 묶음과 개별 모듈은 같은 source에서 생성한다.
- `guide-builder`가 검수 화면을 실제 dist 소비자로 연결한다.
- 디자인가이드 안내 페이지 레이아웃은 **`component-page-template.md` §A(승인 배포본 틀)** 를 따른다. 기계가독 선언은 `registry/governance/component-presentation-policy.json` 의 `_meta.uiLibraryGuideLayout`. 틀은 고정이고 상태·축·예시 내용만 컴포넌트별로 달라진다.
- 패턴은 승인된 코어를 조립하며 코어 내부를 복제하지 않는다.

**금지:** 사이트 인라인 코드를 원본으로 복사, dist 손편집, 패턴 안 임시 코어 생성, 구현자의 자가 PASS.

### 4-verification — 기술 검증

**검증 전에 `references/wiring-and-traps.md` §2 함정 목록을 읽는다** — `file://` 마스크 아이콘 미표시·브라우저 캐시·앵커 빈 화면·중복 id 는 도구 문제이지 구현 문제가 아니다. "안 보인다"를 구현 오류로 단정하지 않는다.

오케스트레이터가 실제 배포본으로 다음을 검증한다. 계약의 위험 조건에 해당하면 `component-verifier`가 `references/verify-F.md`를 읽고 같은 범위를 별도로 재검증한다.

- 정본 variant·state·size 전수
- PC·Mobile × Light·Dark 실제 렌더와 코드 정본 geometry·token·state 대조. V3.0은 필요할 때만 시각 sanity check
- 키보드·포커스·ARIA·다중 인스턴스·init/destroy
- 빈 HTML 소비, 전체 묶음과 개별 설치 동일성
- 디자인가이드와 실제 dist 동일성
- 아이콘 hit area·frame·glyph 독립 실측과 source·dist 동일성

**검문소:** FAIL 0, HOLD 0, BLOCKED 0. 별도 검증을 생략한 경우 river 결정·구현자 실제 렌더 PASS·생략 사유가 promotion evidence에 있어야 한다. 실패하면 3-build로 되돌리고 이전 PASS는 `superseded` 처리한다.

### 5-human-review — river UX 검수

기술 검증을 통과한 실제 디자인가이드 화면을 제공한다. river는 코드 줄이 아니라 UI·UX, 사용 흐름, 오류 회복, 정보와 행동 우선순위를 검수한다.

**검문소:** 대상 버전·날짜·결과가 `evidence.riverApproval`에 기록돼야 한다.

### 6-promotion — 승인·이행

- 컴포넌트 상태와 migration 장부를 갱신한다.
- 승인된 배포본과 코드 예시를 공개한다.
- 계약 stable 조건을 모두 충족한 경우에만 정책 승격을 제안한다.

**완료:** `uiLibraryStatus=approved`, 상태 검사·계약 검사·배포 검사가 모두 통과한다.

## 재개와 충돌 처리

상세 필드는 `references/cross-agent-handoff.md`를 따른다.

- 시작할 때 `npm run ui:state -- <workflow-state.json>`을 실행한다.
- `in-progress`면 소유자·시작 시각·실제 변경을 확인하고 덮어쓰지 않는다.
- `awaiting-user`면 기존 결정 기록을 찾고, 없을 때만 그 결정 하나를 묻는다.
- 정본 지문이 달라졌으면 영향을 조사하기 전 이전 검증을 재사용하지 않는다(절차 = `references/wiring-and-traps.md` §3).
- 상태와 산출물이 어긋나면 더 이른 단계로 되돌리고 `handoff.summary`에 이유를 남긴다.
- Claude와 Codex의 판단이 다르면 두 근거를 보존하고 `awaiting-user`로 전환한다.

## 시작 명령 예시

```text
/ui-library-code input-button-pilot 재개
```

## river 의 진입어 (확정 2026-08-31)

> ### 「**웹 업데이트 해줘**」

river 가 이 말을 쓰면 **이 워크플로우다.** 다른 해석(사이트 문구 수정·배포 등)으로 넘기지 않는다.

| 어떻게 오나 | 어떻게 받나 |
|---|---|
| 컴포넌트 이름이 함께 (“토글 웹 업데이트 해줘”) | 그 컴포넌트로 0-governance 부터 시작 |
| 이름 없이 (“웹 업데이트 해줘”) | 진행 중인 `reports/ui-library/*/workflow-state.json` 을 먼저 확인한다. 미완료 작업이 있으면 그것을 이어서 재개하고, 없으면 **“어떤 컴포넌트를 할까요?”** 한 번만 묻는다 |
| 화면을 고쳐달라 (“체크박스 가이드 ~ 고쳐줘”) | 완료된 작업의 후속 수정 — 해당 work-id 로 들어가 고치고 보고서에 기록 |

같은 뜻의 다른 표현도 전부 이 워크플로우로 받는다:
“{컴포넌트} 웹으로 만들어줘” · “~ 배포본 만들어줘” · “~ 코드로 정리해줘” · “~ 안내 페이지 만들어줘” · 컴포넌트 이름과 함께 “~ 진행해줘” · “UI 라이브러리 작업 이어서” · “{work-id} 재개”

Figma 쪽 작업과 헷갈리지 않게: **“웹”**이 들어가면 이 스킬(실제 배포되는 웹 코드), **“Figma에”**가 들어가면 Figma 스킬이다.
