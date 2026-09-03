# 6-promotion — Time Picker 승격

- 작업: `time-picker` · 2026-09-03
- river 승인: **"타임피커 승인" (2026-09-03)**

## 승격 처리

| 자리 | 무엇 |
|---|---|
| `ui-library/src/components/time-picker/manifest.json` | `status: verified → approved` |
| `registry/governance/ui-library-migration.json` | `time-picker` 레코드 등재 (19번째) — 정본 이탈 3건을 근거와 함께 명시 |
| `registry/components/time-picker.json` | `_meta.uiLibraryStatus: approved` |
| `pages/components.html` | `comp-nav` 버튼 활성 (3-build 에서 처리) · 빈 mount + 마커 |
| `pages/ui-review.html` | `16. Time Picker` 검수 섹션 |

## 배포되는 것

- 트리거: 크기 4조합(XXSM 28 · XSM 34 · MD 44 PC / MD 48 Mobile) × 상태 5종(Default·Hover·Focus·Filled·Disabled)
- 패널: 유형 2종(24h 2열 · 12h 3열) × 상태 4종(시 Hover · 시 Selected · 분 Hover · 분 Selected)
- 목록 칸: 3변형(Default·Hover·Selected)
- 동작: 열기·닫기(Esc·바깥 클릭)·화살표 키 이동·확인 눌러야 값 적용·`s1:time-picker:open|close|change`
- 설치: 전체 묶음 `s1-ui.js`/`s1-ui.css` · 개별 `components/time-picker.*` — 두 경로 DOM 완전 일치 확인

## 정본에서 벗어난 것 3건 (전부 river 근거 있음)

| 무엇 | 근거 | 기록처 |
|---|---|---|
| 모바일 휠 바텀시트 미구현 | river D1 (2026-09-02) — Date Picker 작업에서 함께 만든다 | Gate 19 baseline `knownGaps[time-picker.content]` |
| 트리거 최소 폭 150 고정 | river 지시 (2026-09-03) — 좁고 Filled 에서 줄어듦. Select 선례 | manifest `notInCanon.widthFixed` |
| 패널이 트리거보다 좁아지지 않음 (24h 열 44→58.5) | river D6 (2026-09-03) — "24시간만 인풋에 맞춰줘 12시간제는 현재 유지" | manifest `notInCanon.panelWidthFollowsTrigger` |

## 검증 이력

| 회차 | 판정 | 찾은 것 |
|---|---|---|
| 1 | ❌ FAIL | 8건 — 「확인」 버튼 무동작(정적 칸 `data-value` 누락) · 정본 치수 5건 · 존재하지 않는 토큰 · 과대 선언 |
| 2 | ✅ PASS | 8건 전수 해소 확인 + 기존 PASS 범위 재검증 · 신규 0건 |
| 3 | ❌→해소 | 1건 — registry `sizing.minWidth 78px` 이 정본 어디에도 없음 (river 지적의 뿌리) |
| 4 | ❌→해소 | 1건 — 코드 결함 0. ⭐ 의 서술 오류("글자가 구분선을 뚫는다")를 3곳 정정 |

## 검사 결과

| 검사 | 결과 |
|---|---|
| `ui:contract` · `ui:build` · `ui:test` · `ui:guide:render` · `ui:icons` | ✅ 전부 통과 |
| `css:varcheck` (Gate 45, 이번에 신설) | ✅ 배포본 CSS 미정의 참조 0건 |
| `variant-coverage-check` (Gate 19) | ✅ newGaps 0 (휠 바텀시트는 river 승인 동결) |
| `ui:state` | ✅ PASS |

## 남은 것 (승격과 무관 · 별도 처리)

- `pages/components.html` 의 레거시 죽은 코드 `.s1-timepicker-*` CSS · `setupTimePicker` JS — 마크업이 없어 no-op 이나 `components-archive.html` 과 `scripts/harness-audit.js` 가 참조 중이라 분리
- 안내 화면 공용 CSS 의 미정의 변수 참조 6건 — Gate 45 baseline 동결, 별도 작업으로 분리
- 「패널 상태 — 오전·오후」 표가 자기 칸보다 16px 넓다 — `overflow-x:auto` 가 흡수해 잘림·스크롤바 없음. 원인은 12h 패널 194px 이며 폭 변경과 무관(4회차 통제 실험으로 확인)
- 모바일에서 시간 선택 두 개를 나란히 두면 둘째 12h 패널이 360 경계에 닿음 — 정본에 경계 회피가 없어 만들지 않았다. 필요해지면 river 결정 사항

## 이 작업에서 남길 교훈

**배포본은 처음부터 정상이었고, 잡힌 결함 상당수는 안내·검수 화면의 표본 조립이었다.**
「확인 버튼 무동작」은 빈 HTML 소비에서는 멀쩡했고 두 화면에서만 죽어 있었다 — 계약이 "정적 마크업으로 채워도 된다"만 적고 **무엇이 필수인지**를 안 적은 것이 뿌리다. 계약에 명시하고 런타임 폴백을 넣었다.

또 하나 — **river 가 잡은 3건은 검사기도 독립 검증도 통과한 상태에서 나왔다.** 「정본대로인데 쓰기 불편한 것」은 사람만 잡는다.
