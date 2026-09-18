# Pattern Rules — 패턴 제작의 바탕 규칙

이 폴더는 **어떤 패턴을 만들든 공통으로 지키는 규칙**의 자리다.
패턴 하나하나의 규칙(`registry/patterns/<pattern-id>/`)보다 위에 있고, 그 아래로 내려간다.

```
registry/patterns/rules/     ← 여기: 모든 패턴 공통 바탕
registry/patterns/<id>/      ← 패턴 한 개의 규칙 (README·flow·states·copy·content-rules)
registry/patterns/builder/   ← 빌더가 읽는 패턴 목록(catalog.json)
```

## 다섯 갈래

| 파일 | 답하는 질문 |
|---|---|
| `screen-skeleton.md` | 화면 한 장은 위에서 아래로 어떤 칸으로 나뉘는가? |
| `composition.md` | 어떤 부품을 어디에 쓰는가? 무엇은 화면에 직접 놓지 않는가? |
| `states.md` | 한 화면이 가질 수 있는 상태는 무엇무엇인가? |
| `content.md` | 문구·오류 안내·접근성에서 무엇을 지키는가? |
| `naming.md` | 패턴과 화면의 이름을 어떻게 짓는가? |

## 채우는 규칙 (중요)

**규칙은 지어내지 않는다.** 각 항목은 아래 셋 중 하나의 근거가 있을 때만 채운다.

1. 레거시 판독 — `reports/pattern-builder/inventory/<service>/` 에 모은 실제 화면에서 **반복으로 관찰된 것**
2. 기존 정본 — 토큰·부품·거버넌스 문서에 이미 확정된 것(출처를 적는다)
3. river 결정 — 발화를 그대로 인용해 적는다

근거가 없으면 그 항목은 `미작성`으로 둔다. 빈칸은 흠이 아니라, 아직 근거가 없다는 정직한 표시다.

## 상태 표시

각 항목 앞에 다음을 붙인다.

- `확정` — 근거 있고 river 확인됨
- `관찰` — 레거시에서 반복 관찰됨, 아직 river 확인 전
- `미작성` — 근거 없음
