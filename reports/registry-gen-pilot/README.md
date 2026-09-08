# registry 토큰층 재생성기 — 시범판(보관)

> 2026-09-08 보관. 2026-07-15 임시보관(stash)에만 있던 미추적 파일을 꺼내 저장소에 남긴다.
> **실행 경로에 배선하지 않았다** — `scripts/` 가 아니라 여기 둔다.

## 무엇인가
`gen-registry-tokens.js` (171줄) — `registry/components/*.json` 의 **토큰층(A)** 을 정본에서 다시 만들면
어떻게 바뀌는지 **diff 로만 보여주는 시험판**이다. 쓰기 함수가 없어 registry 를 고치지 않는다.

- A1 (semantic→foundation) 정본 = `assets/css/tokens.css`
- A2 (컴포넌트 슬롯→토큰) 정본 = `build-components.ts` (mock 실행)
- 건드리지 않는 메타 필드(C/B): `_meta`·`notes`·`description`·`stateNotes`·`sizing`·`typography`·`governance`·`figma`·`tokenStatus`·`darkModeStatus` — 라인 단위 치환이라 구조적으로 불변
- C 필드가 1줄이라도 바뀌면 CRITICAL 표시 후 종료코드 2

## 왜 남기나
`registry/components/*.json` 의 값 필드는 손편집 사본이라 **알려진 stale 78건**이 있다(CLAUDE.md).
그 부채를 "정본에서 다시 생성"으로 갚는 방향의 첫 시도가 이 파일이다.

## 되살릴 때 확인할 것 (미확인)
- 지금도 동작하는지 **실행해 보지 않았다.** 7월 이후 `tokens.css`·`registry/components/input.json`·
  `build-components.ts` 구조가 바뀌었으므로 그대로 돌아간다고 가정하지 말 것.
- 대상이 `input.json` 하나로 좁혀진 파일럿이다. 전면 적용 전에 범위 설계가 필요하다.
