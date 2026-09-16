# 3-build — bottom-sheet · bottom-sheet-option 구현 기록

작성 = 🧱 ui-library-builder · 2026-09-15 · 사양서 = `3-build-spec.md`

자기 결과를 PASS 로 판정하지 않는다. 아래는 실행 결과와 대조표일 뿐이며, 승인·검증은 오케스트레이터·component-verifier 소관이다.

---

## 1. 만든·고친 파일

### 신규
- `ui-library/src/components/bottom-sheet-option/bottom-sheet-option.css`
- `ui-library/src/components/bottom-sheet-option/bottom-sheet-option.js` (jsRequired:false 스텁)
- `ui-library/src/components/bottom-sheet-option/bottom-sheet-option.example.html`
- `ui-library/src/components/bottom-sheet-option/manifest.json`
- `ui-library/src/components/bottom-sheet/bottom-sheet.css`
- `ui-library/src/components/bottom-sheet/bottom-sheet.js`
- `ui-library/src/components/bottom-sheet/bottom-sheet.example.html`
- `ui-library/src/components/bottom-sheet/manifest.json`
- `reports/ui-library/bottom-sheet/screens/{before,after}-{date-picker,time-picker}.png` + 같은 폴더의 `fixture-*.html`(재현용 원본)

### 수정
- `ui-library/src/assets/icons/manifest.json` — `lock` 항목의 `webAssetFingerprint` 를 채웠다(오케스트레이터가 자산·항목은 이미 등록했으나 이 필드가 빈 문자열이라 `ui:build` 가 "stale" 로 막았다. sha256 해시 계산만 했고 자산·다른 필드는 손대지 않았다).
- `ui-library/scripts/component-ids.mjs` — `componentIds` 끝에 `"bottom-sheet-option", "bottom-sheet"` 추가(순서: option 먼저).
- `ui-library/scripts/test.mjs` — 같은 배열 갱신 + jsRequired 일반 검사 목록에 두 id 추가 + §C-1 계약 검사 블록 2개 신설.
- `ui-library/package.json` — `exports` 에 6줄(두 컴포넌트 × 3).
- `ui-library/src/verification/empty-consumer.html` / `empty-consumer-individual.html` — 시트 1개(트리거+바텀시트+옵션 2줄) 추가, `<main>` 내용이 두 파일에서 문자 그대로 동일하도록 유지. individual 쪽엔 CSS `<link>` 2줄·JS `import` 2줄도 추가.
- `ui-library/src/components/date-picker/date-picker.css` — 시트 6종 규칙(`sheet`·`sheet-backdrop`·`sheet-panel`·`sheet-header`·`sheet-title`·`sheet-close`) 삭제, `--s1-bottom-sheet-gap`(32)·`--s1-bottom-sheet-shadow`(none) 결합 블록으로 교체. `calendar-wrap`·`calendar`·`sheet-footer`·`apply` 는 그대로 둠.
- `ui-library/src/components/date-picker/date-picker.mobile.example.html` — 시트 루트에 `data-s1-component="bottom-sheet"`·`data-break="mobile"`·`data-footer="single"` 추가.
- `ui-library/src/components/date-picker/manifest.json` — `dependencies.css`/`coreComponents` 에 bottom-sheet 추가 + 노트.
- `ui-library/src/components/time-picker/time-picker.css` — 같은 6종 삭제 + 결합 블록(time-picker 도 32/none).
- `ui-library/src/components/time-picker/time-picker.mobile.example.html` — 시트 2곳(Time Only·DateTime) 모두 같은 속성 추가.
- `ui-library/src/components/time-picker/manifest.json` — 같은 의존성 갱신.

### 건드리지 않음(사양서 E 그대로)
`ui-library/dist/**` · `pages/*.html` · `assets/js/ui-library-guide.js` · `registry/components/*.json` · `reports/ui-library/bottom-sheet/workflow-state.json` — 전부 손대지 않았다.

---

## 2. 정본 수치 ↔ 구현 값 대조표

### bottom-sheet

| 항목 | 정본(1-inventory §2) | 구현 |
|---|---|---|
| 변형축 | Footer: None·Single·Dual | `data-footer="none\|single\|dual"` |
| root padding | 위 20 / 좌우 0 / 아래 None=40·Single·Dual=20 | `padding-block: --spacing-20`(기본) + `[data-footer=none] { padding-bottom: --spacing-40 }` |
| root itemSpacing | 48 | `--s1-bottom-sheet-gap` 기본값 `--spacing-48` |
| content itemSpacing | 24 | `sheet-content { gap: --spacing-24 }` |
| 반경 | 위 8 / 아래 0 | `border-top-{left,right}-radius: --radius-8` |
| 배경 | color/surface/raised | `--color-surface-raised` |
| 그림자 | shadow/raised-up | `--s1-bottom-sheet-shadow` 기본값 `--shadow-raised-up` |
| header/footer 좌우 | 20 | `padding-inline: --spacing-20` 각각 |
| footer itemSpacing | 8 | `sheet-footer { gap: --spacing-8 }` |
| footer 버튼 | FILL | `flex:1 1 0; width:100%` |
| title | title/20B, color/text/title/primary | font-size 20·bold·line-height130·`--color-text-title-primary` |
| close | 24, color/icon/gray-dark | 24×24 mask, `--color-icon-gray-dark` |

### bottom-sheet-option

| 항목 | 정본(1-inventory §3) | 구현 |
|---|---|---|
| Text·Checkbox·Radio 크기 | 360×48 고정 | `height:48px` |
| padding | 좌우 20 / 위아래 8 | `padding-inline:20 / padding-block:8` |
| List 크기 | 360×hug | `height` 미지정(내용만큼) |
| List padding | 좌우 20 / 위아래 12 | `padding-inline:20 / padding-block:12` |
| 배경 | color/surface/raised, State 분기 없음 | 루트 공통 1개 규칙, selected 전용 배경 규칙 0개(test.mjs 가 검사) |
| 라벨 | body/16M, color/text/body/primary | font 16·medium·line-height130·letter-spacing tight |
| Text:Selected 라벨 | color/text/state/accent | `--color-text-state-accent` |
| Text:Disabled 라벨 | color/text/state/disabled | `--color-text-state-disabled` |
| check 아이콘 | 24, color/icon/blue | 24×24 mask, `--color-icon-blue` |
| avatar | 40×40, radius-full, color/icon/gray-light | 그대로 |
| account 아이콘 | 24, color/icon/white | `::after` 24×24 mask |
| chevron | 24, color/icon/gray-dark, 오른쪽 방향 | 24×24 mask, **회전 없음**(아래 §3 판단 근거) |
| lock | 24, color/icon/gray | 24×24 mask, `--color-icon-gray` |
| 9칸 | Text×3 · Checkbox×2 · Radio×2 · List×2 | example.html 9칸 전부 포함, absent 3칸 미포함(test.mjs 가 검사) |

### date-picker·time-picker 이관 결합값

| 속성 | 독립 Bottom Sheet 기본 | date-picker/time-picker 가 주는 값 |
|---|---|---|
| `--s1-bottom-sheet-gap` | `--spacing-48` | `--spacing-32`(정본 buildDatePickerBottomSheet·buildTimePickerMobileBottomSheet itemSpacing) |
| `--s1-bottom-sheet-shadow` | `--shadow-raised-up` | `none`(정본에 effects 없음) |

---

## 3. chevron 방향 판단 근거 (사양서 §B-3 ⚠️)

등록된 `chevron.svg` 실제 path: `M10.375 7.75L14.625 12L10.375 16.25` — (10.375,7.75)→(14.625,12)→(10.375,16.25), `>` 모양으로 **오른쪽**을 가리킨다. 정본 List 도 오른쪽 화살표를 쓴다. 자산이 이미 오른쪽이므로 **회전을 걸지 않았다.** CSS 주석에 이 근거를 남겼다. (참고: 같은 자산의 `icons/manifest.json` geometryEvidence 는 "아래(닫힘) 방향" 이라고 적어놨지만, 그건 그 문서가 "위/아래 회전 철학"을 설명하려던 서술이고 실제 path 좌표는 오른쪽이다 — 좌표를 직접 읽어 판단했다.)

---

## 4. 검사기 실행 결과

```
npm run ui:contract   → PASS (status=candidate, errors=0)
npm run ui:icons      → 처음 실행 2 errors(icons manifest ↔ dist 불일치, lock dist 없음) — ui:build 후 재실행 시 errors=0
npm run ui:build      → "UI library build generated: 269 files." (성공)
npm run ui:test       → 처음 실행 2 issues(platform/tokens.json 이 --s1-bottom-sheet-gap·--s1-bottom-sheet-shadow 를 못 찾음)
                          → manifest cssContract 에 customProperties 필드 추가 후 재실행 → 전부 PASS
npm run ui:state -- reports/ui-library/bottom-sheet/workflow-state.json → PASS
npm run gate:check     → FAILED, error 16 · warning 18 (아래 §5 참고 — 대부분 이 작업과 무관한 기존 부채, 이 작업이 새로 낸 error 는 Gate 34·Gate 16 뿐)
```

---

## 5. gate:check 에서 이 작업이 새로 낸 항목 (내가 고칠 수 없는 것)

- **Gate 34(정본신설승인)** — `uistate:bottom-sheet.open` · `uistate:bottom-sheet.closed` · `uistate:bottom-sheet-option.default/selected/disabled` 5건이 "승인 없는 신설"로 잡힌다. 이 게이트는 river 의 **실제 발화 인용**을 요구한다(`--quote`, 하드룰 H6②) — 빌더가 자기신고로 통과시킬 수 없는 구조다. `workflow-state.json` 의 river 인용("모바일에서는 드롭다운 대신 바텀시트를 제공해")을 근거로 오케스트레이터가 `node scripts/canon-addition-check.js --approve --by river --reason "..." --quote "..."` 를 실행해야 한다.
- **Gate 16(컴포넌트 분류)** — `bottom-sheet`·`bottom-sheet-option` 이 Ⓐ/Ⓑ 미분류(tbd)로 뜬다. 분류 판단은 `.claude/rules/components.md` 기준 오케스트레이터 소관이라 빌더가 임의로 정하지 않았다.
- **Gate 46·47·50(개발자 전달본·검수판·배포본 번호)** — ZIP·다운로드 화면·검수판·버전 장부가 전부 이번 변경 이전 상태로 낡아 있다고 뜬다. `npm run ui:zip`·`devpanel:gen`·`board:refresh`·`ui:bump` 는 3-build 범위가 아니라 승격/배포 단계의 몫으로 보고 실행하지 않았다 — 사양서 §F 가 요구하는 산출물이 아니고, 버전 번호(`ui:bump`)는 한 work-id 안에서 여러 컴포넌트가 섞일 수 있어 오케스트레이터가 작업 마무리 시점에 한 번 매기는 편이 안전하다고 판단했다.
- **Gate 40(화면 재현 근거) 1건** — 재현 근거 미비로 기록만 됐고 차단은 아니다. `screen-rebuild:evidence` 상세는 보지 않았다(이 work-id 범위 밖으로 보인다).

나머지(Gate 10·13·17·20·28·29·30·32 경고)는 이 작업 전부터 있던 기존 드리프트로, 실행 로그에 그대로 적었을 뿐 내가 건드린 흔적은 없다(각 경고 문구에 "기존 부채"라고 검사기가 스스로 표시한다).

---

## 6. D-6 이관 전후 렌더 대조

**방법 기록(정직하게)** — `npm run shot`(render-shot.js) 을 `--window-size=400,860` 처럼 뷰포트 폭이 작을 때 썼더니 실제 페이지 레이아웃(360 폭 패널이 중앙정렬돼야 함)과 다르게 패널이 화면 오른쪽으로 밀려 잘리는 산출물이 나왔다 — Browser pane 으로 직접 열어 `getComputedStyle` 로 확인한 결과 **CSS 자체는 정상**(패널 360, 중앙 정렬)이었고, 이 render-shot.js 호출 방식만의 문제였다(작은 window-size 에서 실제 렌더 뷰포트가 요청과 다르게 고정되는 것으로 보인다 — 원인은 더 파지 않았다). 그래서 뷰포트 500×900 으로 재요청해 정상 렌더를 받았다. **이 트랩은 `wiring-and-traps.md` 에 없는 새 발견**이라 오케스트레이터가 문서에 반영할지 판단이 필요하다.

**정적 CSS-only 픽스처**(JS 없이 `hidden` 만 뺀 순수 마크업 + dist CSS 링크, T4 트랩 해법)로 date-picker·time-picker 각각 Mobile·Light 1장씩, 이관 전/후 총 4장을 `reports/ui-library/bottom-sheet/screens/` 에 남겼다.

| 파일 | 무엇 |
|---|---|
| `before-date-picker.png` / `after-date-picker.png` | date-picker 모바일 시트, 이관 전/후 |
| `before-time-picker.png` / `after-time-picker.png` | time-picker 모바일 시트(Time Only), 이관 전/후 |
| `fixture-before-*.html` / `fixture-after-*.html` | 위 스크린샷을 만든 정적 픽스처 원본(재현 가능하도록 보존) |

**육안 대조 결과** — 두 컴포넌트 모두 전/후 픽셀 위치·크기·색·둥근 모서리·타이포가 **동일하게 보인다.** 패널 폭 360·중앙정렬·위 모서리만 둥근 8px·간격 32·그림자 없음·제목/닫기 위치까지 일치.

**검증 못 한 범위(정직하게 명시)**
- **Dark 모드**는 캡처하지 않았다 — 이번 이관이 건드린 CSS 는 모두 기존 semantic 토큰 var() 참조만 옮긴 것이라 다크 값 자체는 토큰 시스템이 이미 담당하고, 구조·선택자는 안 바뀌었다는 판단으로 생략했다. 필요하면 같은 픽스처에 `data-theme="dark"` 만 추가해 다시 찍을 수 있다.
- **PC** 는 대상이 아니다(정본에 PC 시트가 없다 — bottom-sheet 자체가 모바일 전용).
- **실제 열기/닫기 동작**(date-picker.js·time-picker.js 가 여전히 자체 소유)은 정적 픽스처라 확인하지 않았다 — CSS 이관만 대조했다.
- **`pages/ui-review.html`** 은 범위 밖이라 고치지 않았는데, 그 페이지는 date-picker·time-picker 시트 마크업에 `data-s1-component="bottom-sheet"` 가 없다(줄 2061·2211, 정적 문자열·템플릿 둘 다) — **이번 CSS 이관 이후 그 페이지의 모바일 시트 미리보기는 스타일이 빠진 채로 보일 것**이다. 오케스트레이터·guide-builder 가 다음 단계에서 그 두 자리도 같이 고쳐야 렌더가 유지된다.

---

## 7. 막힌 것 · 판단이 필요한 것

- **needs-decision 없음** — HD-1(잠금 아이콘)은 오케스트레이터가 이미 해소해 9칸 전부 구현했다.
- 위 §5·§6 의 Gate 34/16/46/47/50 미해결과 `pages/ui-review.html` 시트 마크업 미반영은 **needs-decision 이 아니라 다음 단계(오케스트레이터·guide-builder)로 넘기는 후속 작업**이다 — 임의로 처리하지 않고 그대로 보고한다.
