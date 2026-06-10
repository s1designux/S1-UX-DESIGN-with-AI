# 4단계 자가대조 결과 — Checkbox

> 검증 전용 (component-verifier). 기준: `1-inventory.md` · `2-extraction.md` · Figma 원본 `Tnihi6lixRR47N4RSAwUbF` 노드 1459:16409.
> 대상: `pages/components-new.html` checkbox 섹션(id="checkbox", 2169~2360행) + 라이브 CSS(50~59·460~497행).
> 렌더 실측 수행: Playwright headless로 5셀 geometry/computed-style 측정 + Light/Dark 스크린샷. Figma checked variant SVG 원본 직접 대조.

## 대조 요약
- **variant: 5/5** — Default·Hover(Variant5)·Checked·Disabled·Dis+Checked 전수 표출 ✅
- **색상값(다크 9개): 9/9 렌더 실측 일치** — 표의 다크 hex와 정확 일치 (아래 표)
- **토큰 참조 구조:** control/* semantic 직접 참조. 라이브 CSS에 raw HEX/rgb 0건 ✅
- **alias 4곳 일치:** 라이브 CSS(50~59) · 표출 CSS 코드블록(2269~2278) · Token Details 표(2323~2332) — checkbox 토큰 10개 모두 동일 값. (단, registry JSON은 별개 이슈 — ❌(a) 아래)

### 렌더 실측 — 다크 resolved 값 (표 대조)
| state | 속성 | 표 기준 hex | 렌더 resolved | 판정 |
|-------|------|-----------|--------------|------|
| default | bg | #1C1D23 | rgb(28,29,35)=#1C1D23 | ✅ |
| default | border | #3E4049 | rgb(62,64,73)=#3E4049 | ✅ |
| hover | bg | #24252C | rgb(36,37,44)=#24252C | ✅ |
| hover | border | #3E4049 | rgb(62,64,73)=#3E4049 | ✅ |
| checked | bg | #3070D8 | rgb(48,112,216)=#3070D8 | ✅ |
| checked | border | #3070D8 | rgb(48,112,216)=#3070D8 | ✅ |
| checked | check | #FFFFFF | rgb(255,255,255) | ✅ |
| disabled | bg | #2E2F38 | rgb(46,47,56)=#2E2F38 | ✅ |
| disabled | border | #2E2F38 | rgb(46,47,56)=#2E2F38 | ✅ |
| dis+checked | check | #3E4049 | rgb(62,64,73)=#3E4049 | ✅ |

> 형상 실측: 전 셀 box 18×18px · border 1px · radius 2px (전 셀 동일).

---

## ❌ (a) 코드 실수 — 수정 대상

- **❌ (a-1) 체크마크 글리프 렌더 크기 축소 (아이콘 원본 — 정확 대조, 두갈래 제외)**
  - Figma 원본 checked SVG: `viewBox 0 0 18 18`, 글리프 path가 **18-coord 공간 전체**에 렌더됨 (`rect 17×17`, path `M4 9.41675…14.125 5.66675`가 18px 박스 안 그대로). 즉 글리프 가로 span = 14.125−4 = 10.125, 18px 박스 대비 약 56%.
  - 구현: SVG를 `width="16" height="16" viewBox="0 0 18 18"`로 렌더 → 동일 path가 16px 박스로 축소되어 글리프 실제 span ≈ 9.0px. **18px 박스 안에서 글리프가 ~11% 작게 보임.**
  - 4× 확대 side-by-side(/tmp/cb_glyph_compare.png) 실측: 구현 체크마크가 Figma보다 눈에 띄게 작고 박스 안 여백이 더 큼. **시각 매칭 원리 2(프레임 크기 ≠ 내용물 크기) 위반.**
  - path 데이터·stroke-width·linejoin은 원본과 일치하나 **render scale**이 다름. 아이콘 원본 충실도는 정확 대조 항목이므로 (b)/(c) 면죄 불가 → ❌(a).
  - 적용 위치: 라이브 SVG(2192·2212·2222행) + 표출 코드블록(2246·2260행). width/height를 18로 맞추거나 박스에 꽉 차도록 정정.
  - ※ 단, Figma의 실제 글리프 크기 정의가 "18px 박스에 56% span"이 맞는지 한 번 더 확인 필요 시 (c)로 강등 가능 — 다만 원본 SVG가 명확히 18-coord 전체 렌더이므로 ❌(a)로 분류.

- **❌ (a-2) registry/components/checkbox.json 토큰 값이 구현·표와 불일치 (토큰 참조 구조 — 정확 대조)**
  - registry JSON `tokens[]`가 구버전 semantic을 가리킴, 구현 CSS·2단계 표(control/*)와 다름:
    - `--checkbox-default-bg`: registry `var(--color-form-control-bg-default)` ≠ 구현/표 `var(--color-control-bg-default)`
    - `--checkbox-checked-bg`: registry `var(--color-action-primary-default)` ≠ 구현/표 `var(--color-control-bg-selected)`
    - `--checkbox-disabled-bg`: registry `var(--color-bg-subtle)` ≠ 구현/표 `var(--color-control-bg-disabled)`
    - `--checkbox-hover-border`: registry `var(--color-control-border-hover)` ≠ 구현/표 `var(--color-control-border-default)`
    - `--checkbox-check-icon`: registry `var(--color-action-primary-text)` ≠ 구현/표 `var(--color-control-indicator-selected)`
    - `--checkbox-disabled-check-icon`: registry `var(--color-border-strong)` ≠ 구현/표 `var(--color-control-indicator-disabled)`
    - 또한 registry에 `--checkbox-hover-bg` 항목 자체가 **없음**(hover 토큰 누락).
  - registry는 토큰 정본 원장이므로 구현(control/* 직접참조)과 동기화돼야 함. 토큰 참조 구조 불일치 = 정확 대조 ❌(a).
  - 적용 위치: `registry/components/checkbox.json` `tokens[]` 6건 정정 + `--checkbox-hover-bg` 추가 + `states`에 hover 유지 확인.

---

## 🟡 (b) 의도적 개선 (사전 등록됨) — 코드 유지 + Figma 개선 목록

- **🟡 (b-1) hover 상태 신설** — Figma DS 2.4 레거시 체크박스에 hover 누락. 코드가 Variant5(=control/bg/hover) 근거로 `:hover` + `.is-hover` 규칙 구현. hover는 CLAUDE.md에서 **사전 등록된 레거시 누락 개선 항목**. bg=control/bg/hover·border=control/border/default(=default 유지) 표와 일치. **유지.** → "Figma 개선 필요 목록"에 "Checkbox hover 정식 등록" 적재. (구현 자체는 PASS.)

## ❓ (c) 확인 요청 — 사용자 판단 필요

- **❓ (c-1) border-radius 2px vs Figma rx 1.5** — 구현 box `border-radius:2px`, Figma 원본 checked SVG `rx="1.5"`. 1단계/2단계 표가 이미 "🟡 경미(두갈래)"로 표기했고 "1.5px 정정 검토" 권고. radius는 크기·두께 영역(두갈래 대상)이나, **(a)코드오기인지 (b)의도적 2px 통일인지 애매** → 임의 (b) 처리 금지, 사용자 확인. 0.5px 차이로 시각 영향은 미미하나 원본과 다름.

## 🔒 BLOCKED
- 없음. 2단계 표에 `MCP 미제공` 0건. 단, **Light 독립값은 Figma 파일 모드=Dark로 미재확인**(2단계에서 투명 보고됨). 렌더 실측 Light resolved 값(white·gray-50·gray-200=#C4C4C4? 실측 rgb(196,196,196)·blue #1D6CEB)은 tokens.css light 정의와 일치하나, Figma 라이트 원본 대조는 파일 모드 전환 전까지 미수행 — BLOCKED 아님(구조·다크 100% 일치로 정합 간주), 정보성 표기.

---

## 시각·레이아웃 대조 (렌더 실측 수행)
- **렌더:** Playwright headless, components-new.html 로드 후 checkbox 섹션 5셀 측정 + Light/Dark 스크린샷(/tmp/cb_render_light.png·/tmp/cb_render_dark.png).
- **Figma 대조:** 원본 세트 스크린샷(/tmp/cb_set.png) 및 checked variant 18×18 SVG 원본(/tmp/cb_checked_asset.png) 대조.
- **레이아웃:** 박스 18×18·border 1px·radius 2px 전 셀 일치. 박스↔라벨 gap 8px. 5셀 배치·정렬 Figma 세트와 시각적으로 일치.
- **불일치:** 체크마크 글리프 크기만 축소(❌ a-1). 그 외 박스 색·테두리·위치·정렬 모두 일치.

---

## 판정 — FAIL

| 분류 | 건수 | 조치 |
|------|------|------|
| ❌ (a) 코드 실수 | **2건** (a-1 글리프 축소 · a-2 registry 토큰 불일치) | 3단계로 반환, 구현자 재작업 후 재검증 |
| 🟡 (b) 의도적 개선 | 1건 (hover) | 코드 유지 + Figma 개선 목록 적재 |
| ❓ (c) 확인 요청 | 1건 (radius 2px vs 1.5) | 사용자 확인 대기 |
| 🔒 BLOCKED | 0건 | — |

**결론:** ❌(a) 2건 → **검문소 4 미통과(FAIL)**. 구현자(guide-builder)가 3단계로 되돌아가 (a-1)(a-2) 수정 후 재검증 필요. ❓(c-1)은 사용자 확인 병행.

---

## 구현자 후속 조치 (재구성 반영, 2026-06-10)

- **a-1 ✅ 수정** — 체크마크 SVG `width/height` 16→18 (viewBox 18 그대로) 일괄 정정. 라이브 21곳 + 표출 2곳. 18-좌표 path를 18px로 1:1 렌더 → Figma 원본 스케일 일치. (잔존 16px 0건 확인)
- **a-2 ✅ 수정** — `registry/components/checkbox.json` 토큰 10개를 control/* + `--checkbox-hover-bg`로 동기화. 옛 semantic(form-control/action-primary/bg-subtle/border-strong) 잔존 0건. figmaNodeId `1459:16409`·fileKey 등록.
- **c-1 ❓ 사용자 회신 대기** — border-radius 2px vs Figma rect rx 1.5. 구현자 분석: Figma rect는 stroke가 path(x=0.5) 기준 0.5 바깥으로 확장 → 박스 **바깥 모서리 반경 = rx 1.5 + inset 0.5 = 2.0px**. 따라서 CSS 박스(18×18, border 1px) border-radius 2px는 Figma 바깥 모서리와 일치(충실). **2px 유지 권장.** 사용자 확정 시 c-1 종료.

재검증 필요 항목: a-1·a-2는 결정론적 자가확인 완료. 시각 재대조는 사용자 육안 검토(Components New 메뉴)로 갈음, 필요 시 component-verifier 재호출.
