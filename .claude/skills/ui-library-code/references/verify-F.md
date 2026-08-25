# Component Verifier 시나리오 F — UI 라이브러리 패키지 검증

## 입력

1. `workflow-state.json`
2. `registry/governance/ui-library-code-contract.json`
3. 현재 대상의 inventory·canon-readiness·build 기록
4. `ui-library/src`와 생성된 `ui-library/dist`
5. 코드 시각 정본과 Registry 행동·접근성 계약. Figma V3.0은 상태 파일이 필요하다고 선언한 경우에만 참고

입력 중 하나가 없으면 추측하지 않고 BLOCKED 또는 HOLD로 판정한다.

## 검증 순서

1. 정본 파일과 상태 파일 지문을 대조한다.
2. manifest의 variant·size·state·part·dependency를 정본 전수와 대조한다.
3. source에서 dist를 재생성하고 손편집·드리프트가 없는지 확인한다.
4. PC·Mobile × Light·Dark를 실제 렌더해 코드 정본의 geometry·token·state와 대조한다. V3.0은 선택적 sanity check이며 레거시는 사용하지 않는다.
5. 키보드·포커스·ARIA·오류 연결·reduced motion을 계약과 대조한다.
6. 다중 인스턴스, 반복 init, destroy 후 정리, 동적 재초기화를 검사한다.
7. 빈 HTML 소비자에서 전체 묶음과 개별 모듈을 각각 실행한다.
8. 두 설치 방식의 DOM·픽셀·동작 결과가 같은지 대조한다.
9. `pages/ui-review.html`이 실제 dist 외 컴포넌트 CSS·JavaScript에 의존하지 않는지 검사한다.
10. 코드탭이 source/example에서 생성됐는지 확인한다.

## 반환

- PASS / HOLD / BLOCKED / FAIL
- 정본 정확 대조 결과
- 렌더 행렬과 스크린샷 경로
- 동작·접근성·설치 동일성 결과
- 검증하지 못한 범위
- 권장 `workflowStatus`, `uiLibraryStatus`, `nextAction`

검증자는 파일을 고치거나 `workflow-state.json`을 수정하지 않는다.
