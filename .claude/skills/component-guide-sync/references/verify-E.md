# (E) Component Guide Sync 검증 — 상세 절차

> `component-verifier` 전용 참조. 2026-08-12 에이전트 본문에서 이관(문장 원문 유지).

⚠️ **`component-guide-model.json`(10.6MB)은 Read 금지** — 대조는 `npm run components:guide-model:check`(byte 대조)로만 한다. 특정 컴포넌트 확인이 필요하면 Grep 으로 해당 키만 본다.

`build-components.ts` → `component-guide-model.json` → 메인 사이트 DOM·개발용 코드 → 설치기의 경계를 독립 대조한다. 정본 scene graph의 variant·기하·Hug/Fixed/Stretch·textStyleId·토큰 바인딩이 모델과 사이트에서 손실되지 않았는지 확인하고, Registry 행동 메타가 실제 ARIA·클릭·키보드 동작으로 구현됐는지 검사한다. 생성기 `--check`가 작업 트리와 byte 단위로 일치해야 하며, 정본 grid 42개는 공개·내부·제외 중 정확히 하나로 분류돼야 한다. 직접 수정하지 않고 불일치 목록만 반환한다. 이전 검증 결과가 있으면 읽되 현재 정본·현재 생성 결과를 다시 실행해 판정한다.
