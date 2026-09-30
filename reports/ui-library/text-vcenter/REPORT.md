# 한글 세로 보정 — 웹에서 위로 떠 보이는 글자 1px 내림

- 작업일: 2026-09-30 · 배포본 0.14.5 → **0.14.6** (패치)
- 갈래: 이미 승인된 컴포넌트의 후속 수정 — 0-governance~2-canon-readiness 해당 없음(3-build·4-verification 만). `workflow-state.json` 없음(선례 popover-clipping-fix).
- 진입: river 결정 2026-09-30 A안 — 웹에서 글자가 위로 떠 보이는 곳만 글자를 정확히 1 CSS px 내린다. 정본 수치는 하나도 바꾸지 않는다.

## 1. 증상과 원인
Chrome 2배 화면 실측(`reports/text-vcenter/index.html`)에서 12px+줄높이 130% 와 16px 이상 한글이 부품 안에서 Figma 원본보다 위에 놓였다.
브라우저가 글자 기준선을 1px 단위로 놓으면서 반올림이 위쪽으로 쏠리는 것이 원인이다(부품 크기·패딩 오류가 아님).

## 2. 고친 방법 (웹 CSS 만 — 정본·토큰·부품 크기 불변)
- 글자가 별도 요소(span/h1/a)에 있는 곳: 그 요소에 `position: relative; top: 1px`(소수·transform 사용 안 함).
- 글자가 flex 컨테이너(버튼·링크)에 **직접** 들어 있는 곳(gnb menu, tab): 위 안쪽 여백 `padding-top: 2px` — 내용 상자가 위에서 2px 줄어 가운데가 정확히 1px 내려간다. 상자 높이(border-box 고정)·밑줄(`::after` 절대배치)은 그대로.
- 각 자리 위에 이유 주석을 달았다.

## 3. 건드린 파일
| 파일 | 변경 |
|---|---|
| `ui-library/src/components/button/button.css` | xxsm label · lg label(기존 lg label 규칙 안 — test.mjs 의 "lg label 가운데 정렬 계약" 정규식이 그 규칙을 찾는다) |
| `date-picker/date-picker.css` · `time-picker/time-picker.css` | xxsm value |
| `bottom-sheet-option/bottom-sheet-option.css` | 직계 label |
| `gnb/gnb.css` | md·sm menu `padding-top: 2px` (xsm 제외) |
| `mobile-header/mobile-header.css` | `standard-*` title |
| `tab/tab.css` | md·sm(PC) · sm(모바일) `padding-top: 2px` (xsm 제외) |
| `gnb-sub-menu-item/gnb-sub-menu-item.css` | 2depth 항목 링크 |
| `ui-library/scripts/css-model.mjs` · `ui-library/scripts/density.mjs` | 플랫폼 누수 차단(아래 3-1) |
| `ui-library/dist/**` · `release-log.json` · 전달본 ZIP · 다운로드 화면 · 검수판 사실표 | 생성 명령으로 재생성(손편집 없음) |

컴포넌트 manifest 의 `canonicalFingerprint` 는 바뀌지 않았다(정본 무변경).

## 3-1. 플랫폼 누수 차단 (총괄 지적 2026-09-30)
처음 구현은 웹 밖으로 샜다 — 탭 `padding-top: 2px` 가 `S1TabSpec.kt` 에 `paddingTop = 2f` 로, 버튼 `position/top` 이 `coverage.json` 의 「안 읽은 선언」 4건(density 사본)으로 들어갔다.
이 1px 은 브라우저 픽셀 반올림 보정이라 Android·iOS·React·Vue 스펙에 들어가면 안 된다(river A안 「웹에만」).

- **표식**: 「한글 세로 보정」 주석이 바로 앞에 붙은 규칙 하나는 플랫폼 CSS 모델에서 뺀다.
  `css-model.mjs parseStylesheet` 가 주석을 지우기 전에 `@web-only` 를 붙여 두고 그 규칙을 건너뛴다.
- **밀도 사본**: 배포 CSS 는 `density.mjs` 가 규칙을 복사해 `[data-s1-density=…]`·`[data-s1-break="mobile"]` 사본을 만드는데, 복사본은 주석이 없어 표식을 잃었다.
  `topLevelRules` 가 표식을 읽고 사본 앞에 같은 표식을 붙이게 했다(웹 동작은 그대로 — 밀도 안에서도 1px 내려간다).
- **버튼 lg**: 기존 lg label 규칙(가운데 정렬 계약)은 원형 그대로 두고, 보정은 그 뒤 별도 규칙으로 분리.
- **결과**: `diff ui-library/dist/platform` 에서 스펙 값 변화 0 — 남은 변경은 버전 문자열(0.14.5→0.14.6)과 sourceFingerprint 뿐. kotlin·swift·cpp·react·vue·coverage.json 모두 확인(다른 부품의 position/top 도 새지 않음).
- 웹 측정은 누수 차단 전후 동일(288 항목 중 차이 0).

## 4. 수정 전후 실측 (lift: 양수 = 위로 뜸, CSS px)
| 부품 | 수정 전 | 수정 후 | 목표 |
|---|---|---|---|
| button xxsm label (PC·모바일) | +1.50 | +0.50 | +0.50 ✅ |
| date-picker xxsm value (PC·모바일) | +1.50 | +0.50 | +0.50 ✅ |
| time-picker xxsm value (PC·모바일) | +1.50 | +0.50 | +0.50 ✅ |
| button lg label (PC·모바일) | +0.75 | −0.25 | −0.25 ✅ |
| bottom-sheet-option label | +0.75 | −0.25 | −0.25 ✅ |
| gnb menu md | +0.75 | −0.25 | −0.25 ✅ |
| gnb menu sm | +0.75 | −0.25 | −0.25 ✅ |
| mobile-header title | +0.75 | −0.25 | −0.25 ✅ |
| tab md (PC) | +0.50 | −0.50 | −0.50 ✅ |
| tab sm (PC) | +0.75 | −0.25 | −0.25 ✅ |
| tab sm (모바일) | +0.75 | −0.25 | −0.25 ✅ |
| gnb-sub-menu 2depth 링크 | +1.25 | +0.25 | +0.25 ✅ |

대상 아닌 부품(button md·xsm, 14px 전부, tab xsm, gnb xsm, input·table·chip·dropdown·select·list-row 등)은 전후 값이 **동일**함을 같은 스크립트로 확인했다. 부품 상자 높이(h) 전후 동일.

## 5. 검사기
| 검사 | 종료코드 |
|---|---|
| ui:contract · ui:version · ui:build:check · ui:test:check · ui:icons · ui:icons:origin · ui:guide:render | 0 · 0 · 0 · 0 · 0 · 0 · 0 |
| gate:check | 0 (경고 26 — 기존 부채) |

(3-1 이후 전량 재실행 결과 — 위 표 전부 종료코드 0, gate:check 0.)

- 첫 test:check 실패: 버튼 lg 규칙을 xxsm 과 묶었더니 계약 정규식이 어긋났다 → 규칙을 분리해 해소.
- Gate 는 ZIP·다운로드 화면·검수판 사실표 재생성(`ui:zip` · `devpanel:gen` · `board:refresh`) 후 통과. 헤드리스 크롬 잔류로 한 번 시간 초과 → 정리 후 통과(기존 도구 문제).

## 6. 확인 못 한 것 · 목록 밖에서 보인 것
- mobile-header `home-*` 변형(18B 좌측 정렬)은 배포 예시에 표본이 없어 측정하지 않았고 **보정하지 않았다**(subtitle 2줄 스택과의 간격 문제). 같은 조건이면 떠 있을 가능성.
- gnb-sub-menu-item 1depth(16B 제목 글자)는 대상 밖이라 두었다 → 같은 목록의 2depth 링크만 1px 내려가 제목과 1px 어긋난다(간격 24 안이라 시각 영향 작음).
- 실제 화면 캡처·육안 대조는 하지 않았다(측정 스크립트 수치만). 독립 검증은 별도.

## 7. 후속 — 탭 보정 되돌림 (0.14.6 → 0.14.7)

- 진입: river 「Figma 쪽도 같은지 확인해줘」 → 🤖 figma-inspector 실측 → river 「탭만 되돌려줘」.
- 원인: Figma 탭은 글자를 **밑줄 2px 을 뺀 윗공간의 가운데**에 둔다 — 탭 전체 상자로 보면 1px 위가 설계다
  (Line Tab SM PC 선택 2614:76279 위 13.0/아래 15.0 · MD 2614:76291 13.0/15.0 · 모바일 SM 2614:76315 8.0/10.0).
  보정 전 웹(0.5~0.75 위)이 이미 Figma 와 0.5px 안쪽이었고, 0.14.6 의 1px 내림이 오히려 1.25~1.5px 어긋나게 했다.
- 조치: `ui-library/src/components/tab/tab.css` 의 보정 규칙 1개 삭제. 다른 부품의 보정은 그대로.
- 실측(Chrome 2배, 탭 전체 상자 기준, 양수=위): tab md +0.5 · sm +0.75 · 모바일 sm +0.75 — 0.14.5 와 동일. 탭 외 전 항목 0.14.6 과 동일.
- 플랫폼 스펙 값 변화 0(버전 문자열·지문만).

### Figma ↔ 웹(0.14.7) 대조 (전체 상자 기준, 양수=위)

| 부품 | Figma | 웹 |
|---|---|---|
| 버튼·날짜 선택칸 xxsm | +0.25 | +0.5 |
| 버튼 lg | 0 | −0.25 |
| 상단 메뉴 md·sm | 0 | −0.25 |
| 모바일 머리글 | 0 | −0.25 |
| 바텀시트 항목 | +0.25 | −0.25 |
| 탭 md(선택) / sm / 모바일 sm | +1.0 / +1.0 / +1.0 | +0.5 / +0.75 / +0.75 |

시간 선택칸은 Figma 에 한글 표본이 없어 숫자로만, 하위 메뉴 2depth 는 상자 기준이 달라 대조 불가.
Figma 텍스트 세로 자르기 설정값은 여전히 미확인(REST 필드 없음 · use_figma 호출 한도).
