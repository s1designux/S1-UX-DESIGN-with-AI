# Pattern Registry

이 폴더는 검증과 승격을 마친 패턴의 **현재 사용 기준**을 제공한다. 제작 과정은 `reports/screen-rebuild/`에 보존하고, 일반적인 디자인·구현 작업에서는 이 폴더의 문서를 우선한다.

## AI 기본 읽기 순서

1. `index.json`에서 패턴 ID와 상태를 찾는다.
2. `documentation.entry`만 먼저 읽는다.
3. 작업에 따라 flow·states·content 문서를 선택해서 읽는다.
4. 결함 추적이나 재설계가 필요한 경우에만 `evidence.buildHistory`를 읽는다.

## 문서 역할

| 문서 | 답하는 질문 |
|---|---|
| `README.md` | 이 패턴은 언제, 왜 사용하는가? |
| `flow.md` | 어떤 조건에서 상태가 바뀌며 왜 그렇게 흐르는가? |
| `states.md` | 어떤 화면 상태가 존재하고 각각 무엇을 표현하는가? |
| `content-rules.md` | 문구·오류·보안·접근성에서 무엇을 지켜야 하는가? |

## 정본 우선순위

1. 패턴의 현재 행동·사용 규칙: `registry/patterns/{pattern-id}/`
2. 패턴 등록 상태·문서 경로: `registry/patterns/index.json`
3. 컴포넌트 시각·variant: 로컬 Core 정본과 컴포넌트 Registry
4. 제작·검증 이력: `reports/screen-rebuild/`

과거 제작 기록이 현재 패턴 문서와 다르면 현재 패턴 문서를 우선하고, 차이의 이유는 패턴 문서의 변경 근거에서 확인한다.
