# screen-rebuild 트리거·드라이런 테스트

## 실행해야 하는 요청

1. “이 예전 모바일 로그인 화면을 현재 컴포넌트로 다시 만들어줘.”
2. “레거시 회원가입 플로우를 최신 정본으로 Figma에 재현해줘.”
3. “어제 하던 screen-rebuild를 이어서 진행해줘.”
4. “매핑까지 끝난 로그인 화면 빌드를 재개해줘.”
5. “기존 서비스 화면의 컴포넌트를 최신 것으로 교체해줘.”
6. “재생성한 화면이 원본과 같은지 다시 검증해줘.”
7. “이 화면 묶음을 공통 패턴으로 등록할 수 있는지 확인해줘.”
8. “Claude에서 조사한 모바일 화면을 Codex에서 이어서 만들어줘.”
9. “화면 재생성 품질은 유지하면서 시간과 토큰을 줄여줘.”
10. “13개 화면 중 대표 상태만 먼저 검증하고 나머지를 일괄 생성해줘.”

## 실행하면 안 되는 요청

1. “Button에 새로운 사이즈를 추가하고 설치기를 갱신해줘.” → `component-guide-sync`
2. “Figma Button을 React 코드로 구현해줘.” → `figma-to-code`/design-to-code
3. “새로운 공용 Date Range Picker 컴포넌트를 Figma에 만들어줘.” → `figma-library-build`
4. “현재 웹페이지를 Figma로 캡처해줘.” → code-to-Figma 캡처 흐름
5. “컴포넌트 사이트의 Input 설명만 고쳐줘.” → 사이트 편집 흐름
6. “토큰 값을 Figma Variables와 동기화해줘.” → 토큰 동기화 흐름
7. “이 Figma 화면을 캡처해서 보여줘.” → 읽기 전용 Figma 확인
8. “첨부 이미지의 배경을 지워줘.” → 이미지 편집 흐름

## 정상 교대 드라이런

1. Claude가 원본 세트를 읽고 `1-inventory.md`를 저장한다.
2. 오케스트레이터가 `workflow-state.json`을 `awaiting-user`, `lastCompletedCheckpoint=1`로 갱신한다.
3. Codex가 상태 파일을 먼저 읽고 검문소 1의 사용자 승인 여부만 확인한다.
4. 승인돼 있으면 2단계로 진행하고, 승인 기록이 없으면 1단계를 반복하지 않고 확인만 요청한다.

## 오류 드라이런

1. 과거 `4-verification.md`가 PASS지만 후속 provenance 스캔에서 외부 인스턴스가 발견된다.
2. 검증자는 이전 PASS를 유지하지 않고 `superseded`를 권고한다.
3. 오케스트레이터가 `currentPhase=3-build`, `lastCompletedCheckpoint=2`로 되돌린다.
4. 다음 Claude/Codex 실행자는 잘못된 targetNodeId를 완료본으로 사용하지 않고 로컬 정본으로 다시 빌드한다.

## Fast-safe 정상 드라이런

1. 8개 화면에서 base·editing/keyboard·error·overlay 대표를 1개씩 고른다.
2. Inventory와 Mapping에 미확인·HD가 0이면 근거를 상태 파일에 남기고 자동 통과한다.
3. 대표 4개 pilot만 빌드하고 독립 검증한다.
4. PASS 뒤 나머지 4개를 같은 manifest·screen-spec으로 생성한다.
5. 최종 결정론 검사는 8개 전체, 이미지 대조는 대표 4개와 실패 화면에 실행한다.

## Fast-safe 품질 방어 드라이런

1. pilot Input 외곽은 320px이지만 내부 field가 200px이다.
2. verifier는 outer width만 보고 통과하지 않고 내부 field 검사로 FAIL한다.
3. 나머지 화면은 생성하지 않는다.
4. manifest와 공통 생성 규칙을 고친 뒤 pilot만 재실행한다.

## Figma 실행 실패 드라이런

1. 역할 에이전트의 첫 가벼운 Figma 읽기가 정상 완료되지 않는다.
2. 같은 호출을 반복하지 않고 오케스트레이터 operator로 고정한다.
3. screen-rebuilder는 실행 코드를 작성하고 component-verifier는 별도 판정을 유지한다.
