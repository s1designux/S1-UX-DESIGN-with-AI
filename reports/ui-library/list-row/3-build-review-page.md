# 3-build · 검수 화면 연결 (list-row)

- 작업자: 🤖 guide-builder
- 일자: 2026-09-21
- 대상 파일: `pages/ui-review.html` (이 파일 1개만 수정)

## 붙인 것

1. **검수 섹션 26번** — `<section class="review-section" data-component-id="list-row">` + 제목 + `review-note` + `<div class="review-matrix" id="list-row-review-matrix">`.
   기존 섹션과 같은 방식으로 자바스크립트(`renderListRowPanel`)가 matrix 를 채운다.
   승인/대기 분류는 페이지가 `ui-library-migration.json` 을 직접 읽어 정한다(list-row = `candidate` → 검수 대기 탭).
2. **매트릭스 56칸 전수** — Type 7(nav·value·read·pick·agree·switch·thumb) × Density 2(default·compact) × State 4(default·hover·pressed·disabled).
   Light·Dark 두 패널 × 56칸 = 112줄. 크기·Break 축은 manifest 에 없어 만들지 않았다(`controlThemes` 사용 — bottom-sheet-option 선례).
3. **루트 요소는 manifest `htmlContract.typeStructure` 그대로** — nav·value=`button`, read·thumb=`div`, pick·agree=`label`, switch=`div`.
   상태는 manifest `states` 표기대로 documented `data-state` 로 보이고, Disabled 는 button 루트에 native `disabled`, 그 밖의 루트에 `aria-disabled="true"` 를 함께 단다.
4. **체크·토글은 승인된 코어 배포본을 그대로 조립** — checkbox 는 control 만(코어 자신의 label 없음), toggle 은 `role="switch"` 코어 그대로. 둘 다 이 화면의 `title` 을 `aria-labelledby` 로 가리켜 이름을 얻는다. 내부 복제 없음.
5. **배치 전용 CSS 3줄** — 매트릭스 1열(Light·Dark 를 위아래로), 칸 `auto-fit minmax(320px)`, 표본 상자 `max-width:360px`. 색·크기·간격·높이는 전부 dist(`s1-ui.css`)가 그린다.

설명문(`review-note`)에는 요청한 네 가지를 담았다 — 높이를 숫자로 고정하지 않는다(여백 토큰 + 글 자리) · Density 는 목록이 정한다(같은 목록 안에서 한 줄/두 줄 높이가 같다) · 구분선은 목록이 긋는다 · 초점 표시는 브라우저 기본에 맡긴다(정본에 focus 변형 없음).

## 하지 않은 것
- `pages/components.html` 미수정 · `ui-library/dist` 미수정 · `workflow-state.json` 미수정 · 자기 결과 승인 없음.

## 검사기 결과
| 검사기 | 결과 |
|---|---|
| 🔎 `npm run ui:guide:render` | ✅ PASS (컴포넌트 27종 × PC·Mobile 실제 렌더 대조) |
| 🔎 `npm run ui:liveness` (Gate 53) | ✅ PASS — 검수 화면 표본 380/380 이 화면 자신의 손으로 깨어남 |
| 🔎 `npm run ui:contract` | ✅ PASS (errors=0) |
| 🔎 `npm run harness:audit` | 이 작업과 무관(대상은 `components.html`) · 기존 경고 그대로 |
| 🔎 `npm run gate:check` | 화면 관련 게이트는 초록. 남은 error 66건은 전부 이 작업 밖의 기존 항목(설치기 다크 사본·설치기 zip 재빌드·`build-components.ts` 검증기록·guide model 드리프트)이며 `ui-review.html` 관련 error 는 0건 |

## 실제 렌더 확인 (http, 1400×1000)
- 라이트·다크 두 패널 모두 56칸이 그려지고 중복 id 0건(112줄 전수 측정).
- 화살표(mask 아이콘)·토글·썸네일·비활성 흐림·Hover/Pressed 배경이 모두 표출됨.

## 검증자에게 넘기는 관찰 (판정하지 않음)
줄 높이를 유형별로 재 보니 **같은 Density 안에서도 유형에 따라 값이 갈린다**(라이트 패널 실측, px):

| Density | nav / value / agree | read / pick / switch | thumb |
|---|---|---|---|
| default | 73 | 73 | 80 |
| compact | 48 | 44.8 | 72 |

default 는 thumb(썸네일 48)만 예외이고 나머지는 73 으로 같다. compact 는 **화살표(24)를 가진 줄이 48, 없는 줄이 44.8** 로 갈린다 — 글 자리 min-height(20.8)보다 화살표·썸네일이 커서 그것이 높이를 정하기 때문이다. 정본·manifest 는 "높이를 숫자로 고정하지 않는다"까지만 말하고 이 갈림에 대한 선언이 없어, 의도인지 아닌지는 이 에이전트가 판정하지 않고 시나리오 F(component-verifier)와 river 판단으로 넘긴다.

~~또 하나: **Disabled 인 줄 안의 체크·토글 코어는 그대로 살아 있다**(누를 수 있다). ... needs-decision 후보.~~

## 덧붙임 (2026-09-21 · 조율자 판정 반영)
관찰 2번은 needs-decision 이 아니라 **마크업이 채울 자리**로 판정됐다(코어의 `disabled` 는 코어 자신의 공개 API 이며, 계약이 금지한 것은 코어의 내부 구조·스타일을 덮어쓰는 것이다). 그에 따라 `data-state="disabled"` 인 줄에서는 안쪽 checkbox 의 `input` 과 toggle 의 `button` 에도 native `disabled` 를 함께 준다. 루트가 button 인 nav·value 는 그대로 native `disabled`, div·label 유형은 `aria-disabled` + 안쪽 코어 `disabled` 조합이다.

실제 렌더 확인(http, 라이트·다크 두 패널): 비활성 줄 28칸 안의 코어 12개 전부 `disabled`, 비활성이 아닌 줄의 코어 36개는 그대로 살아 있음(잘못 꺼진 것 0). 비활성 코어를 눌러도 `aria-checked`·`checked` 가 바뀌지 않고, 흐리게 보인다(토글 트랙 #C4C4C4 → #E9E9E9, 체크 바탕 흰색 → #E9E9E9, 커서 `not-allowed`). 설명문에도 "줄이 비활성이면 그 안의 체크·토글도 함께 비활성"을 한 줄 넣었다.

재검사: `ui:guide:render` ✅ · `ui:liveness` ✅ (검수 화면 380/380) · `ui:contract` ✅.

관찰 1번(높이 갈림)은 조율자가 정본·배포본 쪽에서 고치는 중이라 이 화면은 손대지 않았다 — 배포본이 갱신되면 검수 화면이 그대로 따라온다.

## 덧붙임 (2026-09-21 · 모바일 전용 계약으로 축 재편)
river 지시("오늘 만든 리스트는 모바일에서만 사용하는 패턴이야. 호버는 삭제해주고 pressed의 배경을 hover배경값으로 교체하면돼")에 맞춰 검수 화면의 축을 **Type 7 × State 3(Default·Pressed·Disabled) = 21칸**으로 다시 짰다. Hover 칸과 Density(Compact) 칸을 걷어냈고, 마크업에서 `data-density` 속성과 "Compact 는 설명 줄이 없다" 분기도 함께 사라졌다 — 이제 일곱 유형 모두 제목 + 설명 한 벌만 그린다. 눌림 배경은 Hover 가 쓰던 한 단계 밝은 배경(`--color-bg-level-1`)이다. 이 화면은 여전히 시각·동작 코드를 갖지 않고 `ui-library/dist` 를 그대로 소비한다(색·간격·높이는 전부 `s1-ui.css` 가 그린다).

설명문(review-note)도 새 계약대로 고쳤다: ①**모바일에서만 쓰는 줄**이라 Hover 가 없다 ②높이를 숫자로 고정하지 않고 여백 토큰(12)과 글 자리 최소 높이(44)가 68을 만든다 ③줄 사이 구분선은 목록을 그리는 화면이 긋는다 ④키보드 초점 표시는 브라우저 기본에 맡긴다. 비활성 줄 안의 체크·토글을 함께 끄는 앞선 처리는 그대로 유지했다.

실제 렌더 확인(http://localhost, 1400×1000, 라이트·다크 두 패널): 패널마다 **21칸**, 상태 3종, `data-density` 잔존 0건, **줄 높이는 일곱 유형 전부 68 한 값**(이전 보고의 "높이 갈림" 관찰은 배포본 수정으로 해소됨). 눌림 배경은 라이트 `#FAFAFA`(level-1), 다크 `rgb(19,20,24)`(level-1)로 Default 대비 한 단계만 밝다. 배포본에도 `:hover` 규칙과 `bg/level-2` 눌림 배경이 남아 있지 않음을 확인했다(`ui-library/dist/components/list-row.css`, `s1-ui.css`).

재검사: `ui:guide:render` ✅ (27종 × PC·Mobile) · `ui:liveness` ✅ (검수 화면 370/370) · `ui:contract` ✅ (errors=0). 합격 판정은 하지 않는다 — 시나리오 F(component-verifier)로 넘긴다.
