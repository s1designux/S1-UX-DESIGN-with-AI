---
name: component-guide-sync
description: "컴포넌트 정본(build-components.ts)의 크기·variant·상태·토큰·레이아웃 변경을 설치기와 메인 사이트 UI 라이브러리에 자동 반영한다. '컴포넌트 기준 추가/수정', '정본에서 사이트까지 동기화', 'UI 라이브러리 업데이트', '재실행·업데이트·수정·보완' 요청에 반드시 사용한다. 생성된 pages/components.html 영역을 직접 편집하는 작업에는 사용하지 말고 정본 또는 Registry 메타를 수정한 뒤 이 흐름으로 재생성한다."
---

# Component Guide Sync

컴포넌트의 시각 값은 `plugins/figma-vars-installer/src/build-components.ts` 한 곳에서 관리하고,
설치기와 메인 사이트는 결정론적 생성 결과만 소비하게 하는 오케스트레이션 스킬이다.

## 역할 분리

| 단계 | 담당 | 책임 |
|---|---|---|
| 정본 사실 판독 | `source-reader` | 기존 variant·값·생성 경로 확인 |
| 생성기·메타 구현 | `guide-builder` | 정본/Registry 메타 수정과 생성기 실행 |
| 구조 변경 검증 | `component-verifier` | 정본→guide model→사이트 DOM→설치기 대조 |
| 총괄 | 오케스트레이터 | 계획 확인, 역할 분리, Gate 결과 종합 |

만드는 자와 검증하는 자를 분리한다. `build-components.ts` 구조 변경은 Gate 13 기록이 필요하다.

## 입력의 정본 경계

- 시각 구조·수치·variant·토큰·타이포: `build-components.ts`
- 설명·사용 맥락·접근성·웹 태그·동작 유형·예시 문구: `registry/components/*.json`
- `component-guide-model.json`, `component-facts.json`, `pages/components.html`의 생성 구간,
  DESIGN 문서와 설치기 zip은 파생 결과다.
- 파생 결과에서 값을 고치지 않는다. 정본 또는 메타를 고친 뒤 재생성한다.

## 실행 흐름

### 0. 컨텍스트 확인

1. `git status --short`로 기존 변경을 확인한다.
2. 대상 정본·메타·생성 결과의 diff를 각각 보관한다.
3. 이전 생성 결과가 있으면 `--check`로 드리프트 여부를 먼저 확인한다.
4. 사용자가 일부 기준만 수정하면 대상 컴포넌트만 판독하되, 생성·검증은 전체 집합으로 수행한다.

### 1. 정본 수정

1. `source-reader`가 기존 정의와 영향을 받는 variant를 확인한다.
2. 시각 값은 `build-components.ts`만 수정한다.
3. 설명·접근성·웹 동작에 새 의미가 생긴 경우에만 Registry 메타를 수정한다.
4. 새 사이즈처럼 기존 동작 패턴을 그대로 쓰는 변경은 웹 ID·CSS·검사 목록을 추가하지 않는다.

### 2. 자동 생성

`npm run tokens:reconcile` 한 번으로 다음 순서를 실행한다.

1. component facts
2. component guide model
3. 메인 사이트 UI 라이브러리
4. DESIGN·다운로드 안내
5. 설치기

생성기 단독 점검은 아래 명령을 사용한다.

```bash
npm run components:guide-model:check
npm run components:guide-site:check
```

### 3. 구현자 점검

- 정본 variant 전수가 guide model에 있는지 확인한다.
- 공개 컴포넌트가 사이트에 있고, 내부·제외 항목은 이유와 함께 분류됐는지 확인한다.
- 생성 결과에 시각 수치의 손사본이 남지 않았는지 확인한다.
- 인터랙션은 크기별 ID 목록이 아니라 컴포넌트 root 자동 탐색을 쓰는지 확인한다.

### 4. 독립 검증

`component-verifier`가 다음 경계를 교차 대조한다.

- 정본 scene graph ↔ guide model
- guide model ↔ 사이트 DOM·코드 예시
- Registry 행동 메타 ↔ 실제 키보드·ARIA 동작
- 정본 grid 42개 ↔ 공개·내부·제외 분류
- 생성기 `--check` ↔ 작업 트리 파일

HTML 변경은 Light/Dark와 PC/Mobile 실제 렌더를 확인한다. 렌더 도구 부재를 PASS로 처리하지 않는다.

### 5. 완료 검문

```bash
npm run components:guide-model:check
npm run components:guide-site:check
npm run components:variantcov
npm run components:sizenaming
npm run harness:audit
npm run gate:check
```

`build-components.ts` 구조 변경이면 독립 검증 후 Gate 13 기록을 갱신한다.

## 실패 처리

- 생성 결과 드리프트: 파생 파일을 고치지 말고 writer 입력과 생성기를 수정한다.
- 정본에는 있으나 사이트에 없음: guide model 추출 또는 공개 분류 오류로 처리한다.
- 동작 메타 없음: 임의 동작을 만들지 않고 `needs-decision`으로 보고한다.
- 렌더 실패: 한 번 재시도하고 다시 실패하면 완료하지 않는다.
- 기존 사용자 변경과 충돌: 해당 파일을 덮어쓰지 않고 diff와 충돌 지점을 보고한다.

## 테스트 시나리오

### 정상

"Line Tab에 새로운 size를 추가해줘" → 정본 한 곳 수정 → reconcile → guide model·사이트·설치기 자동 갱신 → 새 size의 클릭·키보드 동작과 Gate 통과.

### 오류

생성된 Line Tab HTML에서 새 size 한 줄을 손으로 삭제 → `components:guide-site:check` 실패 → 정본/생성기에서 복구하기 전 완료 금지.

## 트리거 검증

다음 표현은 이 스킬을 사용한다.

- 컴포넌트 정본에 사이즈 추가
- 정본에서 설치기와 사이트까지 동기화
- UI 라이브러리 자동 갱신
- 컴포넌트 variant 수정 후 재실행
- 이전 컴포넌트 안내 결과 보완

다음 표현에는 사용하지 않는다.

- 사이트 소개 문구 오타 수정
- 독립적인 마케팅 페이지 제작
- 토큰 값 한 건만 변경
- Figma 화면을 코드로 구현
- 컴포넌트와 무관한 Registry 조회
