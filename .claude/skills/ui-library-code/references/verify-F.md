# Component Verifier 시나리오 F — UI 라이브러리 패키지 검증

## 입력

1. `workflow-state.json`
2. `registry/governance/ui-library-code-contract.json`
3. 현재 대상의 inventory·canon-readiness·build 기록
4. `ui-library/src`와 생성된 `ui-library/dist`
5. 코드 시각 정본과 Registry 행동·접근성 계약. Figma V3.0은 상태 파일이 필요하다고 선언한 경우에만 참고

입력 중 하나가 없으면 추측하지 않고 BLOCKED 또는 HOLD로 판정한다.

## 0. 선행 조건 — 호출자가 준비해 넘긴다 (2026-09-04)

> 공통 규칙은 `.claude/agents/component-verifier.md` §검증 입력 계약. 여기서는 F 전용 목록만 둔다.

**① 기계검사 표** — 아래가 전부 종료코드 0 이어야 spawn 된다. 표가 없거나 실패가 남아 있으면 검증하지 않고 **HOLD("기계검사 선행 미이행")** 로 반환한다.

| 명령 | 증명하는 것 | 이걸로 대체되는 검증 순서 |
|---|---|---|
| `npm run ui:contract` | 코드 계약 최소 배선 | 1 일부 |
| `npm run ui:build:check` | source→dist 재생성 결과가 작업 트리와 byte 동일(손편집·드리프트 0) | **3** |
| `npm run ui:test:check` | 동작·다중 인스턴스·재초기화 테스트 | **6 일부** |
| `npm run ui:icons` | 아이콘 hit area / SVG frame / glyph 3층 계약 ↔ 실제 SVG 전수 대조 | **11 일부** |
| `npm run ui:icons:origin` | 웹 아이콘이 라이브러리 원본과 같은 모양인가(폴백 SVG 유입 차단) | **11 일부** |
| `npm run ui:guide:render` | 안내 화면을 실제로 그려서 검사 | **9·10 일부** |
| `npm run ui:state` | 상태 파일 정합 | 1 일부 |

검증자는 이 표의 명령을 **1회 재실행해 종료코드만** 확인한다(위조 방지). 통과한 항목을 사람 눈으로 다시 대조하지 않는다.

**② 렌더 선캡처** — PC·Mobile × Light·Dark 스크린샷을 호출자가 미리 찍어 **파일 경로 + 캡처 조건(URL·뷰포트·테마·시각)** 으로 넘긴다. 검증자는 그 이미지로 대조하고, 판정이 갈리는 지점에서만 직접 재캡처·실측한다. 아이콘 글리프·hit area 등 **수치 실측은 여전히 직접** 한다.

**③ 델타 재검증** — 재검증이면 직전 보고서 + 이후 변경 파일 목록·지문을 함께 받는다. 승계 조건·표기 의무는 공통 계약 ②.

## 검증 순서 — 기계가 못 잡는 것에 집중한다

1. 정본 파일과 상태 파일 지문을 대조한다.
2. manifest의 variant·size·state·part·dependency를 정본 전수와 대조한다. **(기계 미커버 — 반드시 사람/AI 대조)**
3. ~~source에서 dist를 재생성하고 손편집·드리프트가 없는지 확인한다.~~ → **`ui:build:check` 종료코드 0 으로 대체.** 실패했을 때만 파고든다.
4. PC·Mobile × Light·Dark를 **호출자가 선캡처한 이미지로** 대조한다(없으면 직접 렌더). 코드 정본의 geometry·token·state와 대조한다. 아이콘은 누르는 영역(hit area)·SVG 틀(frame)·실제 도형(glyph)을 각각 실측하며 서로 대신하지 않는다. V3.0은 선택적 sanity check이며 레거시는 사용하지 않는다.
5. 키보드·포커스·ARIA·오류 연결·reduced motion을 계약과 대조한다.
6. 다중 인스턴스, 반복 init, destroy 후 정리, 동적 재초기화를 검사한다. **`ui:test:check` 가 커버하는 케이스는 재실행 확인으로 갈음하고, 테스트에 없는 시나리오만 직접 확인한다.**
7. 빈 HTML 소비자에서 전체 묶음과 개별 모듈을 각각 실행한다.
8. 두 설치 방식의 DOM·픽셀·동작 결과가 같은지 대조한다.
9. `pages/ui-review.html`이 실제 dist 외 컴포넌트 CSS·JavaScript에 의존하지 않는지 검사한다. **(`ui:guide:render` 미커버 영역만)**
10. 코드탭이 source/example에서 생성됐는지 확인한다. **(동일)**
11. ~~`npm run ui:icons`와 아이콘 source·dist 동일성~~ → **`ui:icons` + `ui:icons:origin` 종료코드 0 으로 대체.** 검사기 적대 테스트는 규칙이 새로 추가·강화됐을 때만 다시 돌린다.

## 반환

- PASS / HOLD / BLOCKED / FAIL
- 정본 정확 대조 결과
- 렌더 행렬과 스크린샷 경로
- 동작·접근성·설치 동일성 결과
- 검증하지 못한 범위 · **델타 재검증이면 "이번에 재확인하지 않고 직전 PASS 를 승계한 항목" 목록**
- 권장 `workflowStatus`, `uiLibraryStatus`, `nextAction`

검증자는 파일을 고치거나 `workflow-state.json`을 수정하지 않는다.
