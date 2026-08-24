# 완성 패턴 문서화

이 문서는 Phase 4를 통과한 화면이 Phase 5에서 공통 패턴으로 승격될 때만 읽는다.

## 목적

제작 기록은 “어떻게 만들었는가”를 보존하고, 완성 패턴 문서는 “왜 이 흐름이어야 하며 어떻게 사용해야 하는가”를 제공한다. 두 문서를 한곳에 합치지 않는다.

## 저장 위치

`registry/patterns/{pattern-id}/`에 다음 문서를 만든다.

| 파일 | 필수 내용 |
|---|---|
| `README.md` | 목적, 사용 시점, 해결하는 문제, 필수 규칙, 변경 가능 범위 |
| `flow.md` | 진입·성공 조건, 상태 전이, 분기, 각 흐름의 이유, 사용하지 않는 흐름 |
| `states.md` | 대표 상태, 상태별 목적과 표현, 제거·제외 상태 |
| `copy.md` | 상태별 현재 문구. 문구가 패턴의 중요한 정본일 때만 추가 |
| `content-rules.md` | 문구, 오류, 보안, 접근성, 컴포넌트 사용 규칙 |

패턴에 해당 주제가 없으면 빈 문서를 만들지 말고 `README.md`에 합친다.

## 내용 추출 순서

1. 최신 사용자 결정과 사양 변경 기록
2. `workflow-state.json`의 현재 화면 범위와 등록 상태
3. `2-mapping.md`의 유지 규칙과 허용편차
4. `4-verification.md`의 최종 통과 항목
5. `5-registration.md`의 승격 근거

과거 기록과 최신 결정이 충돌하면 최신 결정을 적용하고 제작 기록은 수정하지 않은 채 이력으로 연결한다. 확인되지 않은 상태 전이는 만들지 않는다.

## Registry 연결

`registry/patterns/index.json`의 패턴 항목에 다음 경로를 기록한다.

```json
"documentation": {
  "entry": "registry/patterns/{pattern-id}/README.md",
  "flow": "registry/patterns/{pattern-id}/flow.md",
  "states": "registry/patterns/{pattern-id}/states.md",
  "copy": "registry/patterns/{pattern-id}/copy.md",
  "contentRules": "registry/patterns/{pattern-id}/content-rules.md"
},
"evidence": {
  "buildHistory": "reports/screen-rebuild/{service}/{flow}/"
}
```

## AI 읽기 비용 규칙

- 일반적인 사용·구현은 `documentation.entry`만 먼저 읽는다.
- 흐름 변경은 `flow`, 화면 상태 변경은 `states`, 현재 문구 확인은 `copy`, 문구 원칙·접근성 변경은 `contentRules`만 추가로 읽는다.
- `buildHistory`, `node-map.json`, trace는 결함 추적·재빌드 때만 읽는다.
- 노드 ID와 실행 로그를 완성 패턴 설명의 중심으로 삼지 않는다.

## 완료 조건

- 현재 패턴 화면 범위와 문서의 상태 목록이 일치한다.
- 각 핵심 분기에는 동작뿐 아니라 이유가 있다.
- 반드시 유지할 규칙과 서비스별 변경 가능 범위가 분리돼 있다.
- 제작 기록 경로와 검증 근거가 연결돼 있다.
- Registry의 문서 경로가 실제 파일과 일치한다.
