# 2-canon-readiness — 제작 전 정본 준비

작성 2026-08-31

## 발견한 정본·Registry 충돌과 처리

| # | 무엇 | 처리 | 근거 |
|---|---|---|---|
| C1 | Registry 가 체크박스 **부분선택(indeterminate)** 을 전제하는데 정본에 변형이 없다 | **정본에 없는 것을 만들지 않는다.** Registry 의 부분선택 문구를 정리 | river 결정 2026-08-31 (D1). 정본 신설은 승인 사항(H6②) |
| C2 | `guide.webTag = "button"` 인데 계약은 native HTML 우선 | Registry 를 `input` 으로 교정 | 계약 `html.rules[0]` |
| C3 | `a11yStatus = pending` — 계약상 approved 배포 불가 | 두 컴포넌트의 접근성 계약을 확정해 Registry 에 기록하고 `stable` 로 갱신 | 계약 `knownBlockers[3]` |
| C4 | 정본에 **focus 변형이 없다** | 새 토큰을 만들지 않고 기존 `color/control/border/selected` 로 2px 외곽선. manifest `notInCanon` 에 명시 | Input 파일럿 `actionStates.focusVisible` 선례 (D3) |
| C5 | 체크박스 정본에는 라벨이 없고 라디오에는 있다 | 두 컴포넌트 모두 **라벨 없음이 기본, 라벨은 선택 부품**. 라디오 정본의 라벨 규칙(14 Medium · 간격 8 · 비활성 색)을 체크박스에도 동일 적용 | river 결정 2026-08-31 (D2). 라디오 정본 Label=Off/On 축과 일치 |
| C6 | 파일럿 승인 이후 `build-components.ts` 가 바뀌어 Input·Button 지문 만료 | 변경 범위를 전수 확인(Mobile Header App/Web 축 신설 · Bottom Sheet Option Text/Disabled 추가)한 결과 Input·Button·Checkbox·Radio 빌더 무변경 → 이전 검증을 superseded 하지 않고 지문만 갱신 | `git diff -U0` hunk 2984~3181 · 4167~4262 (D4) |

## 공개 API 확정

| | Checkbox | Radio |
|---|---|---|
| root | `div[data-s1-component="checkbox"]` | `div[data-s1-component="radio"]` |
| control | `input[type=checkbox][data-s1-part=control]` | `input[type=radio][data-s1-part=control]` |
| 공개 part | `control` · `label`(선택) | `control` · `label`(선택) |
| variant · size | 정본에 축이 없어 만들지 않는다 (`sizes: []`) | 동일 |
| 상태 | native `:checked` · `:disabled` · `:hover` · `:focus-visible` | 동일 |
| 이벤트 | 없음 (native `change` 사용) | 없음 |
| JavaScript | 불필요 (`jsRequired: false`) | 불필요 |
| 그룹 | `fieldset`·`legend` (코어는 개별 컨트롤만 소유) | `fieldset`·`legend` + `name` 공유, 화살표 이동은 브라우저 제공 |

## 검문소

- `needs-decision` **0건** — C1·C5 는 river 승인 기록으로 해소, 나머지는 계약·선례로 해소.
- 정본 신설 **0건** — 새 토큰·새 variant·새 상태를 만들지 않았다.
- `npm run ui:contract` PASS.
