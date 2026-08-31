# 6-promotion — 승인·이행

작성 2026-08-31

## 상태 승격

| | 이전 | 이후 |
|---|---|---|
| `ui-library/src/components/checkbox/manifest.json` `status` | candidate | **approved** |
| `ui-library/src/components/radio/manifest.json` `status` | candidate | **approved** |
| `registry/governance/ui-library-migration.json` | (없음) | `uiLibraryStatus: approved` 2건 |

## 디자인가이드 등재 — river 지시 이행

`pages/components.html` 의 손관리 Checkbox·Radio 마크업(184줄 + 103줄)을 **삭제**하고, Input·Button 과 같은 **실제 dist 소비 mount** 로 교체했다. `data-cov-*` 커버리지 속성은 그대로 유지했다.

```
<!-- Approved Checkbox guide: ui-library-guide.js renders from ui-library/dist -->
<section class="comp-section" id="checkbox" data-cov-states="..."></section>
```

내비게이션의 Checkbox·Radio 버튼 `disabled` 를 해제했다.

`assets/js/ui-library-guide.js` 에 `controlStateMatrix(kind)` 를 추가해 Input·Button 과 동일한 구조로 그린다.

| 영역 | 내용 |
|---|---|
| Action | 실제로 눌러보는 묶음 예시(검수 화면의 "여러 개를 함께 쓸 때") + 한 줄 설명 |
| 상태 | 열 = 정본 5상태(Default·Hover·Checked/Selected·Disabled·Dis+…), 행 = 라벨 없음 / 라벨 있음 |
| 개발 코드 | 실제 dist 의 HTML·CSS·JavaScript |
| 문서 | 구현 규칙 · 상세 사용 가이드 (실제 동작 뒤) |

Hover 는 정본에 마우스 상태가 있으나 실제 마우스를 못 올리는 칸이므로, Button 과 같은 방식으로 검수 전용 `data-force-state="hover"` 를 쓴다(제품 동작 API 아님).

Mobile 탭에서도 같은 내용을 보여주고 "정본에 플랫폼·크기 축이 없어 PC와 같습니다" 를 명시했다.

## 실제 렌더에서 잡아 고친 결함 2건

| # | 증상 | 원인 | 조치 |
|---|---|---|---|
| P1 | Radio 의 SELECTED·DIS+SELECTED 칸과 Action 묶음이 **아무것도 선택 안 된 상태**로 보임 | PC·Mobile 두 섹션에 **같은 마크업 문자열**을 넣어 `id` 와 radio `name` 이 페이지 안에서 중복 → 같은 name 은 하나만 선택될 수 있어 먼저 그려진 PC 쪽 선택이 풀림 | PC·Mobile 마크업을 각각 생성해 `id`·`name` 을 분리. 페이지 전체 중복 id **0개** 확인 |
| P2 | Radio 의 `원(circle)` 이 **선택 가능한 요소**로 분류됨 | 가이드가 선택 부품을 `role` 문장에 "선택" 이 들어있는지로 판별했는데, registry 규약은 **`part` 이름에 `(선택)`** 을 붙이는 것이다 | `part.includes("(선택)")` 로 교정. **Input 도 함께 바로잡혔다** — 전에는 `suffix 액션 그룹(선택)`·`helper 텍스트(선택)` 이 필수 요소로 잘못 나왔다 |

## 검사 배선

- `ui-library/scripts/test.mjs` — 가이드 마커에 `Approved Checkbox guide`·`Approved Radio guide` 추가, mount 가 손관리 마크업을 다시 갖지 않는지 검사.
- `registry/governance/component-presentation-policy.json` — checkbox·radio 를 `managedBy: ui-library-guide` 로 표시. Input·Button 과 같은 처리이며, 정적 HTML 파서로는 JS 렌더 결과를 볼 수 없으므로 **거짓 통과 대신 미계측으로 정직 보고**된다. Action 영역 존재는 실제 렌더로 확인했다(아래).

## river 지적으로 고친 배치 2건 (2026-08-31)

| # | 지적 | 원인 | 조치 |
|---|---|---|---|
| P3 | 그룹 라벨(`받을 알림`·`알림 받기`)이 첫 항목에 너무 붙음 | `fieldset` 을 grid 로 두었지만 `legend` 는 grid 항목이 아니어서 `gap` 이 적용되지 않았다 | legend 에 `margin-bottom: var(--spacing-12)` — 실측 12px 확인 |
| P4 | Action 아래 구분선이 2개 | `.comp-action-top` 이 이미 `border-bottom` 을 그리는데 그 뒤에 `<hr class="uilg-separator">` 를 또 넣었다 | hr 제거. Input·Button 은 원래 1개였고 이 중복은 Checkbox·Radio 에만 있었다 |

| P5 | `개발 코드` 아래 "화면 예시가 아니라 실제 배포되는 HTML·CSS·JavaScript입니다." 가 컴포넌트마다 반복 | 모든 가이드에 같은 문장을 붙이고 있었다 | 삭제 |
| P6 | 다크로 바꿔도 **컨텐츠 영역 바탕이 라이트로 남아** 제목·설명이 안 읽힘 | `style.css` 의 `body` 배경이 raw hex(`#f3f4f6`) 고정이고 다크 대응이 없었다. 가이드 본문 글자는 다크 토큰(거의 흰색)을 쓰므로 대비가 사라졌다 | `[data-theme="dark"] .page-content` 에 정본 토큰(`--color-bg-level-1`·`--color-text-body-primary`) 적용 |

| P7 | 컴포넌트 제목·설명 아래 구분선이 불필요 | `.uilg-header` 의 `border-bottom` | 삭제(간격은 유지). Input·Button 도 함께 적용된다 |
| P8 | `개발 코드` 제목과 코드 박스가 붙음 | P5 로 설명문을 지우면서 사이 간격이 사라졌다 | `.uilg-title-group + .uilg-code` 에 위 여백 16px |

### P6 에서 한 번 잘못 짚었다가 되돌린 것

처음에는 `body` 와 사이드바·상단 헤더까지 함께 뒤집었는데, 그 두 영역은 라이트 전용 색이 많아 **흰 배경에 흰 글자**가 되어 오히려 더 나빠졌다. 실제 렌더로 확인하고 되돌린 뒤, river 가 지적한 **컨텐츠 영역(`.page-content`)만** 바꾸도록 좁혔다. 사이드바·상단 헤더의 다크 대응은 별도 과제로 남는다(현재 라이트 유지 · 글자 읽힘 정상).

## 최종 확인

| 항목 | 결과 |
|---|---|
| `ui:contract` · `ui:icons` · `ui:build:check` · `ui:test:check` | ✅ PASS |
| `gate:check` (게이트 46개) | ✅ PASS · error 0 |
| 실제 렌더 (http, 새 프로필) | ✅ `screens/guide-checkbox.png` · `screens/guide-radio.png` |
| 페이지 중복 id | ✅ 0개 |
| Action 영역 존재 (checkbox·radio·input·button) | ✅ 4/4 |
| 실제 동작이 문서보다 앞 | ✅ 4/4 |
| 로드 오류 | ✅ 0건 |

## 남은 관찰 (결함 아님)

Hover 칸이 Default 와 거의 같아 보인다. 정본 Hover 는 배경만 `control/bg/hover`(#F5F5F5) 로 바뀌는데 기본 배경이 흰색이라 차이가 원래 작다. 계산값으로 실제 적용을 확인했다(`rgb(245,245,245)` vs `rgb(255,255,255)`). 정본을 그대로 옮긴 결과이므로 임의로 강조하지 않았다.


## 레이아웃 틀 고정 (river 지시 2026-08-31)

> "내가 요청하고있는 컴포넌트 안내 페이지 레이아웃 구조에 대한 내용은 앞으로도 틀에 맞춰 진행할 수 있도록 기억해놔"

이번에 river 가 지정한 구조를 **일회성 수정이 아니라 고정 틀**로 정본에 기록했다.

| 어디에 | 무엇을 |
|---|---|
| `component-page-template.md` **§A** | 사람이 읽는 틀 전문 — 두 갈래(A 승인 배포본 / B 손관리) 구분, 블록 순서, Action·상태 매트릭스·개발 코드·문서 규칙, A 갈래 자가 점검표 |
| `registry/governance/component-presentation-policy.json` `_meta.uiLibraryGuideLayout` | 같은 내용의 기계가독 선언 (Gate 23 정본 파일) |
| `.claude/skills/ui-library-code/SKILL.md` 3-build | 워크플로우에서 §A 로 가는 진입점 한 줄 |

기존 `component-page-template.md` 는 손관리 틀만 다뤘고 golden sample 로 **Checkbox `#checkbox`** 를 지목하고 있었다. 그 Checkbox 를 이번에 배포본 생성 방식으로 바꿨으므로, 그대로 두면 다음 작업자가 폐기된 틀을 따라가게 된다 — 두 갈래로 나누고 golden sample 을 갱신했다.
