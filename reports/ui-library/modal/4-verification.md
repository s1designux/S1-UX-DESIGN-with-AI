# 4-verification — Modal

- 작업: modal · 날짜: 2026-09-02 · 검증: ⭐ 총괄 (별도 검증 에이전트 미투입 — **자가인증 구간을 아래 E 에 명시**)
- 소비 대상: **실제 `ui-library/dist`** (안내 화면·검수 화면·빈 소비자 모두 같은 파일)

## A. 정본 수치 실측 대조 (실제 렌더 computed style)

| 항목 | 정본 | 실측 | 판정 |
|---|---|---|---|
| 패널 폭 PC | 360 | 360px | ✅ |
| 패널 폭 Mobile | 300 | 300px | ✅ |
| 패널 상하 여백 | 20 | `20px 0px` (PC) | ✅ |
| 패널 블록 간격 | PC 32 / Mobile 30 | 32px / 30px | ✅ |
| 내용 블록 간격 | PC 32 / Mobile 24 | 32px / 24px | ✅ |
| 헤더·본문·푸터 좌우 | PC 24 | 24px | ✅ |
| 제목 | PC 16 Bold / Mobile 18 Bold | 16px/700 · 18px/700 | ✅ |
| 본문 | PC 14 Regular / Mobile 16 Regular | 14px/400 · 16px/400 | ✅ |
| 푸터 정렬 | PC 우측 | `flex-end` | ✅ |
| 닫기 아이콘 | 24px · `color/icon/gray-dark` | 24×24 · `rgb(53,53,53)` = gray-800 | ✅ |
| 라운드·테두리·그림자 | radius/8 · 1px modal/panel/border · shadow/raised | 8px · 1px `rgb(217,217,217)` · 2겹 | ✅ |
| 딤 | `color/overlay` | `rgba(0,0,0,0.5)` | ✅ |

## B. 다크 (실제 렌더 computed)

| 항목 | 실측 | 정본 대응 |
|---|---|---|
| 패널 배경 | `rgb(28,29,35)` | `surface/raised` dark = gray-dark/100 ✅ |
| 테두리 | `rgb(62,64,73)` | `modal/panel/border` dark = gray-dark/500 ✅ |
| 그림자 | 검정 2겹 | `shadow/raised` dark ✅ |
| 딤 | `rgba(0,0,0,0.75)` | `color/overlay` dark ✅ |
| 제목·본문 | `rgb(236,237,240)` | text/title·body primary dark ✅ |

## C. 동작·접근성 (실제 브라우저)

| 항목 | 결과 |
|---|---|
| 열기 | `hidden` 해제 · 배경 스크롤 잠금 · 초점이 패널 안으로 · `s1:modal:open` ✅ |
| 팝업 표시 | `role=dialog` · `aria-modal=true` · `aria-labelledby` 가 실제 제목 id 로 연결됨 ✅ |
| 초점 가둠 | 마지막→Tab→첫, 첫→Shift+Tab→마지막 양방향 순환 ✅ |
| 초점이 밖으로 샜을 때 | `focusin`·`focusout` 핸들러가 패널로 되돌림 ✅ (아래 D 참조) |
| Esc | 닫힘 · `reason="escape"` ✅ |
| 닫기(X) | 닫힘 · `reason="close-button"` ✅ |
| 닫은 뒤 | 열기 전 초점 자리로 복귀 · 배경 스크롤 원복 ✅ |
| 중복 id | 0건 ✅ |
| 콘솔 오류 | 0건 ✅ |

## D. 검증 도구 한계 (거짓 실패 1건 — 구현 문제 아님)

브라우저 창이 시스템 초점을 갖지 못하는 자동화 환경이라 `document.hasFocus() === false` 였고, **브라우저가 focus 계열 이벤트를 아예 쏘지 않았다.** 그래서 "초점 되돌리기"가 처음엔 실패로 보였다.
`element.focus()` 는 정상 동작(activeElement 는 바뀜)했고, `focusin`·`focusout` 을 직접 발생시켜 핸들러 경로를 확인하니 **양쪽 모두 패널로 되돌렸다**. Tab 키 경로(키보드로 새어 나가는 실제 위험)는 합성 키 이벤트로 정상 확인됐다.

## E. 자가인증 구간 (⭐ 가 혼자 판단한 곳)

- 정본 대조는 **코드 정본(`build-components.ts`)만** 썼고 Figma V3.0 실물은 조회하지 않았다.
- **Figma 원본 대조(component-verifier 독립 검증)는 하지 않았다.** `update-management.json` 이 modal 을 "빌드 직후 — 독립 검증 대기(verify=none)" 로 기록하고 있어, 그 항목은 그대로 두고 `registry/components/modal.json` 의 `codeStatus` 도 완료 표시로 올리지 않았다(웹 배포본 상태는 `webDistribution`·`ui-library-migration.json` 이 따로 가진다).
- UX 판단(문구·흐름·우선순위)은 5-human-review 에서 river 가 본다.

## F. 배포 동일성

| 항목 | 결과 |
|---|---|
| 전체 묶음(`s1-ui.css/js`) ↔ 개별 설치(`components/modal.*`) | 빈 소비자 2개 스크린샷 **sha256 완전 일치** ✅ |
| 안내 화면 ↔ 실제 dist | 안내 페이지가 `dist/components/modal.manifest.json`·`examples/modal.html` 을 직접 읽어 렌더 ✅ |
| PC·Mobile 예제 분리 | `examples/modal.html` · `examples/modal.mobile.html` 생성 ✅ |

## G. 자동 검사

| 검사기 | 결과 |
|---|---|
| 🔎 `ui:contract` | PASS |
| 🔎 `ui:icons` | PASS · icons=5 errors=0 (close 신설 포함) |
| 🔎 `ui:build` | PASS · 84 files |
| 🔎 `ui:test` | PASS (Modal 전용 계약 검사 신설 — 적대 테스트로 실제 검출 확인) |
| 🔎 `components:behavior:check` | PASS · PC 20개 |
| 🚧 `gate:check` | **PASSED** · 게이트 46개 · ✅76건 · error 0 · warning 13(기존) |

## H. 검증 중 찾아 고친 것

| # | 무엇 | 처리 |
|---|---|---|
| 1 | 안내 화면 안에 둔 모달 위로 상단 고정바가 올라옴 | "모달은 화면(body) 바로 아래" 규칙을 계약·등록부에 명시하고 안내·검수 화면이 body 로 옮기게 함 |
| 2 | 초점이 아무 요소도 아닌 곳으로 빠지면 되돌리지 못함 | `focusout` 보강 + Tab 처리에 "패널 밖이면 방향에 맞는 끝으로" 추가 |
| 3 | 좁은 칸에서 패널이 눌려 360/300 보다 작아짐 | 패널에 `flex: none`(정본 고정 폭). 검사기에도 고정 폭 규칙 추가 |
| 4 | 검수 화면 2열에서 PC 패널이 칸 밖으로 넘침 | 검수 화면 모달 구간만 1열로(페이지 CSS) |

## I. 범위 밖에서 함께 정리한 것

`component-behavior.pc.json` 의 **Multi Toggle·Text Area 근거 6건**이 이미 지워진 `pages/components.html` 인라인 JS 를 가리켜 게이트가 실패하고 있었다(내 작업 이전 상태). Modal 과 같은 방식으로 근거를 배포본 원본(`ui-library/src/components/*/*.js`)으로 옮겨 해소했다.

## J. 결론

**FAIL 0 · HOLD 0 · BLOCKED 0.** 5-human-review 로 넘어간다.

---

## K. 닫기 아이콘 원본 교체 (river 지적 2026-09-02 · 추가 검증)

river 가 "아이콘이 라이브러리를 쓴 것인지" 물어 재확인한 결과, **틀렸다.** `close.svg` 는 라이브러리 원본이 아니라 설치기의 **import 실패용 폴백 도형**(`CLOSE_ICON_SVG`, build-components.ts:1305)이었다. 허용목록에 `close` 키가 있다는 사실을 "원본 사용"으로 잘못 읽은 것이 원인이다.

| | 원본 | 교체 전(폴백) | 교체 후 |
|---|---|---|---|
| 도형 | 24 프레임 안 (4,4) 16×16 **채움(fill)** | 6~18 **선(stroke) 1.5** | 원본 그대로 |
| 잉크 범위(24 기준) | 4~20 | 6~18 | 4~20 |
| 원본 대조 평균 알파 오차 | — | **0.03466** | **0.00349** |

- 원본 출처: Figma 아이콘 라이브러리 V2.2 `ic_닫기` 97:79 → `Property 1=Line` **97:77** 실물 벡터 내보내기(river 가 데스크톱 앱에서 파일 열어줌).
- 증거: `screens/icon-close-compare.png`(교체 전 · 어긋남) · `screens/icon-close-after.png`(교체 후 · 완전 일치).
- 교체 후 `gate:check` **PASSED**, `ui:icons` error 0.

### 같은 사고를 다시 안 내기 위해 만든 것 (river 승인 2026-09-02 · 3겹)

| 층 | 무엇 | 파일 |
|---|---|---|
| ① 원본 선언 의무화 | 아이콘 manifest 에 `sourceExport`(라이브러리 내보내기 경로) 필수. 없으면 실패 | `ui-library/src/assets/icons/manifest.json` |
| ② 기계 대조 | 웹 SVG 를 원본 내보내기 크기로 래스터화해 **알파맵 픽셀 대조**. 임계 0.015 초과 시 실패. 기록은 지문과 함께 남기고 게이트는 기록 신선도만 확인해 느려지지 않음 | `scripts/ui-library-icon-origin-check.js` · `reports/ui-library/icon-origin-verification.json` |
| ③ 폴백 유래 차단 | 폴백 상수에 `// icon-fallback-not-canon` 표식. 웹 자산이 그 도형에서 왔는데 원본 대조가 실패하면 **어느 상수에서 왔는지 지목**해 실패 | `build-components.ts:1303·1306` |

**임계값 보정 근거(실측):** chevron 0.00089 · remove 0.0051 · close(교체 후) 0.00349 = 원본 그대로. close(폴백) 0.03466 = 근사치. 두 무리가 7배 벌어져 0.015 로 가른다.

**기존 부채 2건**(`registry/governance/icon-origin-baseline.json`): `check`(웹 16 프레임 ↔ 원본 24 프레임 대응 미선언) · `edge_set`(쉐브론 2개 겹친 componentSet 이라 단일 내보내기와 1:1 대응 안 됨). 경고로만 두고 신규·변경 아이콘은 면제하지 않는다. **`check` 는 Checkbox·Table 이 함께 쓰므로 해소할 때 두 화면을 같이 봐야 한다.**
