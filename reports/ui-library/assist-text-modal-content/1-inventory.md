# 1-inventory — Assist Button · Text Button · Modal Content

> 시각 정본 = `plugins/figma-vars-installer/src/build-components.ts`.
> 개수는 문서에서 베끼지 않고 정본 코드에서 직접 셌다.

## 대상 축 (정본에서 기계로 추출)

| 컴포넌트 | 정본 빌더 | 축 | 변형 수 |
|---|---|---|---|
| Assist Button | `buildAssistButtonSet` (555~) | State(Default·Hover·Pressed·Disabled) · 크기 축 없음 | 4 |
| Text Button | `buildTextButtonSet` (656~) | Variant(Primary·Secondary) × State 4 | 8 |
| Modal Content | `buildModalContent` (5439~) | Size(MD·LG·XL) × Footer(Single·Dual) | 6 |

## 정본 실측값

**Assist Button** — 높이 32 · 좌우 패딩 `spacing/12` · 최소 폭 60 · 반경 `radius/4` · 글자 `body/14M`.
색: 배경 `color/button/bg/secondary--{default,hover}` 차용 · 테두리 기본 `…/border/secondary--default`,
hover `…/border/assist--hover` · 글자 `…/label/assist--{default,hover}` · Disabled 는 Button 공통 disabled 3종.
Pressed = Hover(코어 Button 규칙). 아이콘 변형 없음(범위 밖).

**Text Button** — 배경·테두리·고정 크기 없음(hug) · 글자 `body/14M` · 패딩 0 · 반경 없음.
Primary `color/text/state/accent` · Secondary `color/text/body/tertiary` · Disabled `color/text/state/disabled`.
Hover·Pressed 는 **색을 바꾸지 않고 밑줄만** 더한다.

**Modal Content** — MD 520×336 · LG 1000×587 · XL 1200×587(정본 고정값) ·
패널 상하 패딩 `spacing/20` · 블록 간격 `spacing/32` · 헤더·본문·푸터 좌우 `spacing/24` ·
푸터 버튼 간격 `spacing/8` · 반경 `radius/8` · 면 `color/surface/raised` · 테두리 `color/modal/panel/border` ·
그림자 `shadow/raised` · 제목 `title/16B` `color/text/title/primary` · 닫기 `close` 24px `color/icon/gray-dark` ·
본문 자리표시 `color/bg/level-2` + `radius/4` + "컨텐츠 영역" `body/14M` `color/text/body/tertiary` ·
푸터 버튼 = 코어 Button XXSM(Single=primary 1개 / Dual=secondary→primary).

## 웹 현황

| 항목 | 상태 |
|---|---|
| `ui-library/src/components/{assist-button,text-button,modal-content}` | 없음 (19개 중 0) |
| `registry/components/*.json` | 없음 — 신설 필요 |
| `assets/js/ui-library-guide.js` `componentConfig` | 없음 |
| `pages/components.html` 섹션 | 없음 |
| `component-page-coverage.json` | 3종 모두 `noSectionNeeded` — `sectionFor` 로 이관 필요 |

## 착수 시점 저장소 상태 (미확인 아님 — 기계 확인)

- 웹 19개 컴포넌트의 `canonicalFingerprint` 가 **전부 stale** 이었다(커밋 28be850 + 다른 세션 미커밋 설치기 변경). 일괄 갱신함(D3).
- `npm run ui:contract` PASS · 갱신 후 `ui:build` · `ui:test` PASS.
