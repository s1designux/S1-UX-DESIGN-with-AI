# 3-build-guide — 검수 소비자 배선 (Textarea · Multi Toggle)

- 작업: textarea-multi-toggle · 담당: 🤖 guide-builder · 날짜: 2026-09-02
- 범위: 소비자 3곳(`assets/js/ui-library-guide.js` · `pages/components.html` · `pages/ui-review.html`) + 가이드 전용 CSS
- `ui-library/src`·`dist`·`scripts`·`package.json`·`registry/**` 는 **건드리지 않았다**(다른 세션 작업 중).
- 이 문서는 구현자 자가 기록이다. PASS·승인 판정은 하지 않는다(component-verifier 시나리오 F 소관).

## 1. 바꾼 곳

### `assets/js/ui-library-guide.js`
| 위치 | 변경 |
|---|---|
| `componentConfig` | `textarea` · `multi-toggle` 항목 추가(radio 뒤에 덧붙임) — 기존 승인 컴포넌트 형식 그대로, runtime 은 `S1UI.textarea` · `S1UI.multiToggle` |
| 새 함수 | `textareaMarkup` / `textareaStateMatrix` · `multiToggleMarkup` / `multiToggleStateMatrix` |
| `stateMatrix()` | 두 분기 추가 |
| `mountGuide()` init 목록 | `multi-toggle` 추가(jsRequired:true) · Textarea 는 init 없음(jsRequired:false) |
| `guideComponents` | 두 id 추가 |

- **Textarea 표**: 열 = 정본 상태 5종(Default·Focus·Filled·Disabled·Read-only), 크기 축 없음. 라벨·안내문구·글자수 없음. Action 은 실제로 입력되는 라이브 인스턴스 1개.
- **Multi Toggle 표**: Action = 크기 2종(MD 44 · SM 34) 라이브 인스턴스, 상태 표 = 열 4종 × 행 2크기. 예시는 정본과 같은 **3칸**. PC 전용이라 `platform-section` 한 벌만 둔다(Line Tab 선례와 동일).
- **재현 못 하는 상태**: 기존 기법 그대로 `data-force-state`(검수 전용) 사용 — Textarea `focus`, Multi Toggle `hover`. 새 방식·새 토큰 없음.

### `assets/css/ui-library-guide.css`
- forced state 규칙 2개 추가. **dist 의 `:focus-within` · `:hover` 규칙과 같은 토큰만** 사용(새 값 0건).
- `.uilg-textarea-action { max-width: 480px }` 배치 규칙 1줄.

### `pages/components.html` (덧붙이는 편집만, tab·pagination 미접촉)
| 변경 | 내용 |
|---|---|
| `#textarea` · `#multi-toggle` | 손관리 마크업 전부 제거 → 빈 mount + `<!-- Approved … guide: ui-library-guide.js renders from ui-library/dist -->` 마커. `data-cov-*` 는 그대로 유지 |
| 인라인 CSS 제거 | `.s1-multi-toggle*` 블록 전체 · `.s1-input-wrap--textarea*` 블록 전체 · `.s1-input-wrap.is-readonly textarea` · 공유 선택자에서 textarea 갈래만(`.preview-area textarea`, `.s1-input-field .input-lead textarea`) |
| 인라인 CSS 유지 | `.s1-input-wrap*` 공통 규칙(Date Picker·Time Picker 등이 계속 쓴다) — 회귀 렌더로 확인 |
| 인라인 JS 제거 | Textarea focus/readonly 배선 · `wireMultiToggle()` 과 `mtogTargets` 블록 |
| 내비 | `showSection('textarea')` · `showSection('multi-toggle')` 버튼 `disabled` 해제 |
| 총 삭제량 | 37,896자 |

### `pages/ui-review.html`
- 검수 섹션 **10. Textarea** · **11. Multi Toggle** 추가(기존 9번 다음 번호).
- 렌더 함수 `renderTextareaPanel`(PC·Mobile × Light·Dark 4벌) · `renderMultiTogglePanel`(Light·Dark 2벌, PC 전용).
- Multi Toggle 상태 표본은 `data-review-static` 으로 두고 **init 하지 않는다** — 런타임이 선택 없는 그룹의 첫 칸을 자동 선택해 `Default(선택 없음)` 표본이 사라지기 때문(실제 렌더에서 발견해 고침). 실물 1개만 init.
- 헤더 제목·뱃지(`검수본 2026-09-02 · 08`), 확인 방법 2줄, 포커스 이름표, 런타임 상태 문구 갱신.

## 2. 스크린샷 (`reports/ui-library/textarea-multi-toggle/screens/`)

| 파일 | 내용 |
|---|---|
| `review-textarea.png` | 검수 화면 10번 — PC·Mobile × Light·Dark, 상태 5종 + 실물 |
| `review-multi-toggle.png` | 검수 화면 11번 — Light·Dark, MD·SM × 상태 4종 + 실물 |
| `review-textarea-multi-toggle.png` | 두 섹션 이어서 본 전체 |
| `guide-textarea.png` · `guide-multi-toggle.png` | 안내 화면 — **막힘 상태 기록**(아래 §4) |
| `regression-date-picker.png` | 인라인 CSS 정리 회귀 확인 — Date Picker 정상 |

캡처는 전부 `npm run shot`(매번 새 프로필) + **http** 로 했다(T2·T3 회피). 앵커 캡처가 빈 화면으로 나오는 T4 를 만나 긴 창(1400×11700) 1장을 찍고 구간을 잘라 썼다.

## 3. 검사 결과

| 검사 | 결과 |
|---|---|
| `npm run ui:guide:render` | ✅ 통과 — 단, 대상은 approved·verified **11종**이라 이번 두 컴포넌트는 아직 검사 범위 밖 |
| 검수 화면 중복 id | ✅ 0개 (실제 렌더에서 `[id]` 전수 확인) |
| 안내 화면 중복 id | ✅ 0개 |
| 검수 화면 콘솔 오류 | ✅ 내 페이지 발 0건 (모듈 끝까지 실행 = `data-review-mounted="1"`, 푸터에 Textarea·Multi Toggle 런타임 id 표시) |
| 안내 화면 콘솔 오류 | ⚠️ 2건 — 둘 다 §4 의 상태 게이트 오류 |
| Multi Toggle 선택 무결성 | ✅ 정적 표본 16개 중 선택 있는 칸만 1개씩, 실물 2개만 init |
| Light·Dark 가독 | ✅ 검수 화면 스크린샷으로 확인 |
| 회귀 | ✅ Date Picker(공유 `.s1-input-wrap` 사용) 정상 렌더 |

## 4. 막힌 것 — 안내 화면이 아직 렌더되지 않는다 (needs-decision)

`ui-library/dist` 의 두 컴포넌트 `status` 가 **`candidate`** 다. `ui-library-guide.js` 는 `approved`·`verified` 가 아니면 mount 를 거부하므로, 안내 화면(`pages/components.html`)의 두 섹션은 지금 다음 문구만 보인다:

> Textarea 승인 배포본을 불러오지 못했습니다: textarea 배포 상태가 verified 또는 approved가 아닙니다.

- 배선 자체는 정상이다 — 내비 버튼이 열리고, mount 가 실행돼 manifest·registry 를 읽은 뒤 **상태 검사에서만** 멈춘다.
- 같은 시기 다른 세션의 `tab`·`pagination` 은 빌드 단계에서 이미 `verified` 로 올라가 있다(계약: `verified` = 기술 검증 통과, river 승인 대기).
- 승격은 `ui-library/src/components/*/manifest.json` + 재빌드가 필요한데, 그 경로는 이번 지시에서 **내 손대기 금지 범위**이고 판정도 구현자가 스스로 할 일이 아니다.
- → 오케스트레이터/`ui-library-builder`가 `candidate → verified` 를 처리한 뒤 `npm run ui:build` 를 다시 돌리면 안내 화면 두 섹션이 그대로 그려진다. 그 시점에 `npm run ui:guide:render` 대상도 13종으로 늘어 ①개발 코드 == dist 예제 대조가 실제로 걸린다.
- 검수 화면(`pages/ui-review.html`)은 상태 게이트가 없어 **지금도 실제 dist 로 정상 렌더된다**(스크린샷 참조).

### 정직하게 남기는 관찰 2건 (내 작업 아님)
- 브라우저 콘솔에 `'../dist/s1-ui.js' does not provide an export named 'textarea'` 오류가 남아 있는데, 출처는 `ui-library/src/verification/empty-consumer.html` 이다(내 페이지 3곳 어디도 그 경로를 쓰지 않는다). 그 파일의 상대경로는 `ui-library/src/dist/…` 로 풀려 실제 dist 를 가리키지 않는다 — 소비자 검증 파일 담당이 확인할 사항.
- `registry/components/pagination.json` 은 다른 세션 편집 중이라 JSON 이 깨져 있다. 지시대로 손대지 않았고 `gate:check` 는 그 때문에 error 가 난다.

## 5. 자가인증 여부
이 문서는 구현자 기록이다. **PASS·승인 판정은 하지 않았다.** 최종 판정은 `component-verifier` 시나리오 F 소관이며, 위 §4 가 해소되기 전에는 안내 화면 항목을 검증할 수 없다.
