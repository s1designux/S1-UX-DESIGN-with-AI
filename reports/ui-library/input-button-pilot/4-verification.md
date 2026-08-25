# 4. Verification — Base Input · Button pilot

> Date: 2026-08-25  
> Candidate: `@s1/ui 0.1.0-candidate.1`  
> Formal independent verdict: **HOLD** — 수정 후 `component-verifier` 최종 재실행이 작업 공간 에이전트 한도로 중단됨

## 현재 판정

- 제작자 기술 검사: **PASS**
- 실제 브라우저 사전검사: **PASS**
- 독립 검증자의 수정 후 최종 판정: **HOLD**
- UI library status: `candidate` 유지
- 다음 단계: 독립 시나리오 F를 다시 실행해 PASS를 받은 뒤 river의 실제 화면 UX 검수로 이동

## 독립 검증 중 발견되어 수정한 항목

1. Button 검수 화면에서 PC와 Mobile 허용 크기가 섞여 있던 문제
2. 전체 묶음과 개별 설치 fixture의 DOM이 달라 직접 비교할 수 없던 문제
3. Input read-only 테두리가 Registry와 달랐던 문제
4. Disabled label·message·control이 같은 의미 토큰으로 뭉쳐 있던 문제
5. Focused control text가 selected 텍스트 토큰을 쓰지 않던 문제
6. Error·Correct·Read-only 상태에서 키보드 초점 테두리가 상태색에 묻히던 문제
7. Pretendard 의존성이 전체·개별 소비자에 동일하게 선언되지 않던 문제
8. Mobile Button 제목이 실제 LG 48px와 다르게 표시되던 문제

수정 후 독립 검증자의 최종 재실행만 남았으며, 알려진 제품 결함은 현재 없다.

## 실제 브라우저 검사 결과

| 항목 | 결과 |
|---|---|
| Base Input 인스턴스 | 30개 렌더 |
| Button 인스턴스 | 48개 렌더 |
| PC Input | XXSM 28px · XSM 34px · MD 44px |
| Mobile Input | MD 48px |
| PC Button | XXSM 28px · XSM 34px · MD 44px |
| Mobile Button | LG 48px |
| 키보드 초점 | Button 2px outline + 2px offset, Input Error·Correct·Read-only 모두 selected border로 식별 |
| 다크 버튼 초점 토큰 | `#3070D8` — Button 다크 파란색 계열과 통일 |
| 390×844 반응형 | 가로 넘침 0, Input·Button 48px 유지 |
| 콘솔 경고·오류 | 0건 |

### 2026-08-25 Button 너비·모바일 라벨 재검수

river 피드백 후 Figma V3.0 Button `1545:8242`를 다시 읽고 웹 원본을 명시적으로 동기화했다.

| Size | Figma | 실제 dist 렌더 | 라벨 중심 |
|---|---:|---:|---:|
| PC XXSM | 64×28px | 64×28px | 가로 0px · 세로 0px |
| PC XSM | 64×34px | 64×34px | 가로 0.01px 이하 · 세로 0px |
| PC MD | 80×44px | 80×44px | 가로 0.01px 이하 · 세로 0px |
| Mobile LG | 80×48px | 80×48px | 가로 0px · 세로 0.01px 이하 |

- 모든 size selector가 자기 최소 너비 토큰을 직접 선언하도록 변경했다.
- Mobile LG label 자체에 가로·세로 중앙 정렬 계약을 추가했다.
- Registry의 단일 `minWidth=80` 요약을 size별 80·64·64·80px 기록으로 바로잡았다.
- 검수 화면은 동일한 `버튼` 라벨로 크기 차이를 비교하고 각 최소 너비를 함께 표시한다.
- 긴 라벨은 Figma처럼 좌우 padding을 보존하며 최소 너비보다 늘어날 수 있다.

스크린샷:

- `reports/ui-library/input-button-pilot/ui-review-pc.png`
- `reports/ui-library/input-button-pilot/ui-review-mobile.png`

## 설치 방식 동일성

빈 소비자에서 아래 두 방식을 실제 렌더 비교했다.

- 전체 묶음: `dist/s1-ui.css` + `dist/s1-ui.js`
- 개별 설치: `dist/components/input.css` + `dist/components/button.css`

결과:

- DOM 동일
- Input field computed style 동일
- Input control computed style 동일
- Button computed style 동일
- 양쪽 콘솔 경고·오류 0건
- 실제 입력 글자: Pretendard · 14px · Regular · 18.2px line-height

## 자동 검문소

PASS:

- `npm run ui:state -- --state reports/ui-library/input-button-pilot/workflow-state.json` (정본 지문 갱신 전후 재실행 대상)
- `npm run ui:build -- --check`
- `npm run ui:test -- --check`
- `npm run ui:contract`
- `npm run components:buildverify`
- `npm run components:guide-model:check`
- `npm run components:variantcov`
- `npm run components:sizenaming` — 위반 0, 기존 GNB Menu 미계측 경고 1건
- `npm run layout:check`
- `npm run tokens:darkdiv`
- `npm run gate:check` — 45개 게이트 PASS, 기존 경고 14건
- `git diff --check`

전체 `gate:check`에서 처음 발견된 이번 작업 관련 오류 2건은 수정했다.

- `pages/ui-review.html`을 독립 검수 화면으로 레이아웃 정책에 등록
- Button 다크 focus token을 Button 계열 `blue-dark/300`으로 통일

기존 프로젝트 경고(미분류 컴포넌트, 오래된 Registry 정보, 시스템 맵 등)는 이 파일럿의 PASS로 간주하지 않으며 별도 부채로 남긴다.

## 아직 검증되지 않은 범위

- 수정 후 `component-verifier`의 시나리오 F 최종 독립 판정
- river의 실제 화면 UI·UX 승인
- Password Field와 Search Input의 suffix action 동작 — 다음 모듈 단계 범위
