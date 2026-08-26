# 4. Verification — Base Input · Button pilot

> Date: 2026-08-26
> Candidate: `@s1/ui 0.1.0-candidate.1`  
> Formal independent verdict: **BLOCKED** — 코드·생성본은 PASS, 실제 브라우저 렌더 연결이 없어 최종 픽셀 검증 보류

## 현재 판정

- 제작자 기술 검사: **PASS**
- 이전 버전 실제 브라우저 사전검사: **PASS**
- 독립 검증자의 수정 후 최종 판정: **BLOCKED** — 코드·생성본 PASS, 실제 브라우저 렌더 미검증
- UI library status: `candidate` 유지
- 다음 단계: river가 새 검수본을 확인하고, 브라우저 연결 후 독립 시나리오 F의 실제 렌더를 다시 실행

## 독립 검증 중 발견되어 수정한 항목

1. Button 검수 화면에서 PC와 Mobile 허용 크기가 섞여 있던 문제
2. 전체 묶음과 개별 설치 fixture의 DOM이 달라 직접 비교할 수 없던 문제
3. Input read-only 테두리가 Registry와 달랐던 문제
4. Disabled label·message·control이 같은 의미 토큰으로 뭉쳐 있던 문제
5. Focused control text가 selected 텍스트 토큰을 쓰지 않던 문제
6. Error·Correct·Read-only 상태에서 키보드 초점 테두리가 상태색에 묻히던 문제
7. Pretendard 의존성이 전체·개별 소비자에 동일하게 선언되지 않던 문제
8. Mobile Button 제목이 실제 LG 48px와 다르게 표시되던 문제

현재 코드 대조에서 알려진 결함은 없으며, 새 변경의 실제 픽셀·키보드 사용성 검증은 남아 있다.

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

### 2026-08-26 Input Editing remove·메시지 선택형 재검수

- 코드 정본의 Editing `remove` 액션이 기존 Base Input 웹 파일럿에서 누락된 것을 확인했다.
- 동일한 허용 아이콘 키를 웹 asset manifest에 연결하고, UI source에서 dist 전체·개별 설치 파일로 함께 생성한다.
- 값이 있고 Input 또는 remove action에 초점이 있을 때만 노출하며, 실행 후 값 삭제·`input` event·Input focus 복귀·`s1:input:clear`를 제공한다.
- PC hit area 28×28px, Mobile 48×48px, XXSM 아이콘 20px·그 외 24px 계약을 적용했다.
- 아이콘 프레임을 글리프로 오인해 16px 원형을 24px까지 확대한 오류를 수정했다. 정본대로 기본 24px 프레임 안 16px 글리프, XXSM은 20px 프레임 안 약 13.33px 글리프를 유지한다.
- 실제 검수본 `2026-08-26 · 03` 렌더에서 PC MD=action 28px/frame 24px/glyph 16px, PC XXSM=28px/20px/약 13.33px, Mobile MD=48px/24px/16px을 확인했다.
- 실제 Mobile clear 실행 후 value empty·action hidden·Input focus 복귀를 확인했다.
- 안내 메시지는 선택형으로 바꾸어, 있는 예시와 element·`aria-describedby`를 함께 생략한 예시를 동일 검수 화면에 제공한다.
- 코드·fixture 동작은 독립 PASS했다. 실제 Light/Dark·PC/Mobile 렌더는 검증자 브라우저 미연결로 **BLOCKED**다.

### 2026-08-26 suffix action Hover 배경 보완

- Input field 전체 Hover는 기존 HD-2 결정대로 만들지 않는다.
- remove·비밀번호 표시처럼 오른쪽에 놓이는 각 suffix action은 별도 Hover 상태를 가진다.
- Hover 가능한 PC 포인터에서 현재 가리키는 action의 hit area에만 `color/form-control/bg/hover` 배경과 4px radius를 적용한다.
- Mobile 터치 환경에는 Hover 상태를 강제로 남기지 않는다.
- Figma 정본에는 `Password Action Hover`·`Clear Action Hover` Boolean 속성으로 같은 상태를 확인할 수 있게 기록했다.

### 2026-08-26 Button XXSM 너비 변경·모바일 라벨 재검수

river 승인에 따라 XXSM 최소 너비를 기존 Figma V3.0 참고값 64px보다 최신인 56px 정본으로 변경하고 웹 원본에 동기화했다.

| Size | Figma | 실제 dist 렌더 | 라벨 중심 |
|---|---:|---:|---:|
| PC XXSM | 56×28px (river 승인 정본) | 재검수 대기 | 재검수 대기 |
| PC XSM | 64×34px | 64×34px | 가로 0.01px 이하 · 세로 0px |
| PC MD | 80×44px | 80×44px | 가로 0.01px 이하 · 세로 0px |
| Mobile LG | 80×48px | 80×48px | 가로 0px · 세로 0.01px 이하 |

- 모든 size selector가 자기 최소 너비 토큰을 직접 선언하도록 변경했다.
- Mobile LG label 자체에 가로·세로 중앙 정렬 계약을 추가했다.
- Registry의 최소 너비를 size별 80·64·56·80px으로 기록했다.
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
- `npm run ui:icons` — 전체 웹 아이콘 frame·glyph·source/dist 일치, 과거 오류 형태 적대 테스트 PASS
- `npm run ui:contract`
- `npm run components:buildverify`
- `npm run components:guide-model:check`
- `npm run components:variantcov`
- `npm run components:sizenaming` — 위반 0, 기존 GNB Menu 미계측 경고 1건
- `npm run layout:check`
- `npm run tokens:darkdiv`
- Gate 43 UI 아이콘 크기 검사 PASS
- `git diff --check`

전체 `npm run gate:check`는 Gate 43을 포함한 이번 변경 검사에는 통과했지만, 별도 Mobile Header 작업이 포함된 `build-components.ts`의 실제 렌더 재검증 기록이 아직 없어 Gate 13에서 실패했다. 이 실패는 아이콘 geometry 검사 실패가 아니며, 실제 렌더 검증 없이 기록을 갱신하지 않는다.

전체 `gate:check`에서 처음 발견된 이번 작업 관련 오류 2건은 수정했다.

- `pages/ui-review.html`을 독립 검수 화면으로 레이아웃 정책에 등록
- Button 다크 focus token을 Button 계열 `blue-dark/300`으로 통일

기존 프로젝트 경고(미분류 컴포넌트, 오래된 Registry 정보, 시스템 맵 등)는 이 파일럿의 PASS로 간주하지 않으며 별도 부채로 남긴다.

## 아직 검증되지 않은 범위

- 수정 후 `component-verifier`의 시나리오 F 최종 독립 판정
- river의 실제 화면 UI·UX 승인
- Password Field와 Search Input의 suffix action 동작 — 다음 모듈 단계 범위
