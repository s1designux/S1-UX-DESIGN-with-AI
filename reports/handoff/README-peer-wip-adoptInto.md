# 보류된 작업 — 정본 재설치 구조(adoptInto / REFRESH_TARGETS)

> **누가:** 다른 세션이 2026-09-08 13:16 경 `plugins/figma-vars-installer/src/build-components.ts` 에 넣던 변경.
> **왜 여기 있나:** 그 세션이 커밋하지 않고 멈췄다. 같은 파일에 드롭다운 말줄임 작업(D28)이 함께 있어,
> 그대로 커밋하면 **검증이 끝나지 않은 남의 163줄을 함께 인증**하게 된다(Gate 13 이 실제로 차단했다).
> 그래서 드롭다운 작업만 커밋하고, 이 변경은 패치로 떼어 보존한다. **내용은 한 줄도 버리지 않았다.**

## 무엇을 하려던 변경인가 (패치에서 읽은 것 — 원저자 확인 필요)
`figma.combineAsVariants` 가 항상 새 세트·새 variant 를 만들어, 재설치하면 시안의 인스턴스가
옛 세대(삭제된 마스터)를 가리킨 채 남는 문제를 고치려는 것. 같은 이름의 세트가 이미 있으면
껍데기와 variant 노드를 두고 **자식 내용만 갈아끼우는**(`adoptInto`) 방식으로, 적용 범위는
`REFRESH_TARGETS` 로 좁힌다(주석에 "river 승인 = A-단계" 라고 적혀 있다 — **이 승인 근거는 확인하지 않았다**).

## 되살리는 법
```bash
git apply reports/handoff/peer-wip-adoptInto-2026-09-08.patch
npm run installer:check     # 타입
```
적용 후에는 **Gate 13 이 다시 stale 이 된다** — 정본 구조 변경이므로 하드룰 H1② 에 따라
🤖 `component-verifier` 독립 검증을 거쳐 `installer-build-verify-check.js --record` 로 기록해야 커밋할 수 있다.

## 주의
- 이 패치의 기준점은 커밋 `<드롭다운 말줄임 커밋>` 시점의 `build-components.ts` 다.
  그 뒤 같은 파일이 또 바뀌면 `git apply` 가 실패할 수 있고, 그때는 3-way(`git apply -3`)를 쓰거나 손으로 옮겨야 한다.
- 원저자 세션이 재개하면 이 파일을 먼저 확인하도록 알려야 한다.
