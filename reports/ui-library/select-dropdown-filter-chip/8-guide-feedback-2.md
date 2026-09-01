# 8 — river 피드백 2차 · 필터칩 Action 영역을 Button·Chip 과 같은 틀로

- work-id: `select-dropdown-filter-chip`
- 담당: 🤖 guide-builder (구현 전담 · 합격 판정 없음)
- 날짜: 2026-09-01
- 대상 지적 1건: **"버튼처럼 필터칩도 액션에 사이즈별, 유형별 모습이 함께 보이도록"**

---

## 1. 착수 시 실제 상태 — 전달받은 전제와 달랐던 점

전달받은 전제는 "`pages/components.html` 의 Filter Chip 에 Action 영역이 아예 없다(`uilg-action` 0건)" 였다.
실측 결과는 다르다.

| 확인 항목 | 실제 |
|---|---|
| Action 영역 래퍼 클래스 | Button·Chip·Select·Dropdown 모두 **`comp-action-top`** 이다. `uilg-action` 이라는 클래스는 이 프로젝트에 없다(`uilg-control-action`·`uilg-input-action` 은 Checkbox/Radio·Input 전용 하위 래퍼). → **0건 grep 은 존재하지 않는 클래스를 찾은 결과**이며, "Action 영역 없음"의 근거가 되지 못한다. |
| Filter Chip Action 영역 | `assets/js/ui-library-guide.js` 의 `filterChipStateMatrix()` 안에 **이미 작성되어 있었다**(작업트리 미커밋 상태, `git show HEAD` 에는 없음). 축도 요청과 같은 **열=크기 · 행=variant** 였다. |
| 다만 | **한 번도 실제로 렌더되어 눈으로 확인된 적이 없었고, 그 상태에서 시각 결함이 1건 있었다**(§2). |

`pages/components.html` 은 손대지 않았다. 이 페이지의 Filter Chip 구간은 빈 `<section id="filter-chip">` 이고
내용은 전적으로 `assets/js/ui-library-guide.js` 가 `ui-library/dist` 를 소비해 생성한다.

---

## 2. 고친 것 — 1곳

**파일: `/Users/designgroup_02/S1-UX-DESIGN-with-AI/assets/js/ui-library-guide.js` : 781–783줄**
(`filterChipStateMatrix()` → `actionSection()` 의 행 라벨)

- 증상: Action 행 라벨이 화면에 **"Line / Line / Solid / Solid"** 로만 보였다. 유형을 구분하는
  "제목 있음 / 제목 없음" 이 **보이지 않는다.** river 가 요구한 "유형별 모습이 함께 보이도록" 이 실제로는 성립하지 않았다.
- 원인: 유형 보조 라벨을 `<span class="uilg-size-dim">` 으로 넣었는데,
  `pages/components.html` 428–430줄의 페이지 규칙
  `.comp-state-matrix .matrix-row-label span { display: none; }` (2026-07-06 사용자 요청 — 상태 매트릭스
  행 라벨에는 사이즈 이름만 노출) 에 걸려 **span 이 통째로 숨겨진다.**
- 조치: span 을 없애고 행 라벨을 **한 줄 글자**로 바꿨다. CSS 는 손대지 않았다(그 규칙은 그대로 유효).

```
- `<div class="matrix-row-label">${vLabel}<span class="uilg-size-dim">${titleLabel}</span></div>`
+ `<div class="matrix-row-label">${vLabel} · ${titleLabel}</div>`
```

이 1줄(+ 이유를 적은 주석 2줄)이 이번 작업에서 내가 고친 **전부**다.

- `pages/components.html` — 수정 없음
- `ui-library/dist/**` · `ui-library/src/**` — 수정 없음 (`needs-rebuild` 사유 없음)
- `build-components.ts` · `workflow-state.json` · 컴포넌트 상태값(`verified`) — 수정 없음

---

## 3. 어떤 축으로 배치되었나 (실측 DOM)

세 컴포넌트의 Action 영역을 같은 방법으로 읽어 대조했다.

| | 래퍼 | 열(헤더) | 행(라벨) | variant 블록 간격 |
|---|---|---|---|---|
| **Button** | `comp-action-top` | XXSM 56×28 · XSM 64×34 · MD 80×44 | Primary / Secondary / Blue Line / Disabled | `.uilg-separator` 24px / 24px |
| **Chip** | `comp-action-top` | SM 28px · MD 34px | Line / Solid / Disabled | 24px / 24px |
| **Filter Chip (이번)** | `comp-action-top` | SM 28px · MD 34px (Mobile: MD 30px) | Line · 제목 있음 / Line · 제목 없음 / Solid · 제목 있음 / Solid · 제목 없음 / Disabled | 24px / 24px |

- **열 = 크기**, **행 = 유형(+Disabled)** — Button·Chip 과 동일한 축이다(D6 선례와 같음).
- 필터칩만 유형 축이 `variant(Line·Solid) × 제목 유무` 2겹이라 **행을 그 조합 4줄로 편다.** 열은 그대로 크기다.
- 간격은 공유 규칙 `.uilg-variant-block` + `.uilg-separator` 의 **24px** 을 그대로 쓴다(컴포넌트 전용 값 신설 없음).
- 크기 표기는 Action 열 헤더에만 있다(별도 SIZES 블록 없음) — Button·Chip 과 동일.

---

## 4. 확인 방법 — 승인 게이트를 우회하지 않았다

`pages/components.html` 은 `manifest.status !== "approved"` 면 안내 문구만 띄운다.
`filter-chip` 은 현재 `verified` 이므로 그 페이지에서는 **계약대로** 아래처럼 보인다(오류 아님).

> Filter Chip 승인 배포본을 불러오지 못했습니다: filter-chip 배포 상태가 approved가 아닙니다.
> → `screens/8-fc-components-now.png`

상태값을 바꾸지 않고 확인하기 위해, **가이드 생성기 자체를 실행 시점에 그대로 소비하는 대조용 페이지**를 만들었다.

- `reports/ui-library/select-dropdown-filter-chip/make-guide-probe.js`
  → `assets/js/ui-library-guide.js` 를 **그대로 읽어** 상대경로만 맞추고 자동 마운트 블록만 떼어 `stateMatrix` 를 export.
  (승인 검사 코드는 손대지 않는다. `mountGuide` 를 호출하지 않을 뿐이다.)
- `reports/ui-library/select-dropdown-filter-chip/guide-action-probe.html`
  → 실제 `ui-library/dist` (CSS·JS) + `assets/css/ui-library-guide.css` + **`pages/components.html` 의 인라인 `<style>` 을 fetch 해서 그대로 주입**한다. 마크업·CSS 손사본이 0이다.

재현:

```
node reports/ui-library/select-dropdown-filter-chip/make-guide-probe.js
http://localhost:4173/reports/ui-library/select-dropdown-filter-chip/guide-action-probe.html?only=filter-chip
   (파라미터: only=button|chip|filter-chip · view=mobile · open=1 → 첫 칩 자동 열기)
```

> 파생 `guide-matrix.probe.mjs` 는 가이드 소스의 전체 사본이라 **검증 후 삭제**했다(저장소에 사본을 남기지 않는다).
> 다시 볼 때 위 생성기를 한 번 돌리면 된다.

---

## 5. 스크린샷 · 육안 대조 결과

전부 `http://localhost:4173` · `npm run shot` 으로 찍었다(`file://` 미사용, raw chrome 미사용).
저장 위치: `/Users/designgroup_02/S1-UX-DESIGN-with-AI/reports/ui-library/select-dropdown-filter-chip/screens/`

| 파일 | 무엇 | 육안 대조 결과 |
|---|---|---|
| `8-fc-components-now.png` | 지금 components.html 의 Filter Chip | 승인 게이트 안내만 보임 — **계약대로**(오류 아님) |
| `8-probe-all.png` | Button Action(기준 틀) | ACTION 라벨 → 크기 열(치수 병기) → variant 행 → Disabled 행 |
| `8-chip-action-ref.png` | Chip Action(기준 틀) | 위와 동일한 틀. Line/Solid/Disabled |
| `8-fc-action-pc.png` | **수정 전** Filter Chip Action(PC) | 축은 맞지만 행이 "Line/Line/Solid/Solid" 로 **유형 구분 안 보임** ← 결함 |
| `8-fc-action-open.png` | **수정 후** Filter Chip Action(PC) + 첫 칩 열림 | 행이 "Line · 제목 있음 / Line · 제목 없음 / Solid · 제목 있음 / Solid · 제목 없음 / Disabled" 로 읽힘. Button·Chip 과 같은 틀. 첫 칩이 **실제로 열려** 목록(최신순·인기순·과거순)이 떠 있음 |
| `8-fc-action-mobile.png` | 수정 후 Filter Chip Action(Mobile) | MD 30px 1열, 행 축 동일 |

---

## 6. "실제로 눌러서 열리는가" — 8칸 전수 실측

브라우저에서 Action 영역의 살아있는 칩 8칸을 하나씩 눌러 목록을 열고 두 번째 항목(인기순)을 골랐다.

| 칸 | 열림 | 고른 뒤 닫힘 | 칩에 남은 값 | `data-complete` |
|---|---|---|---|---|
| Line/SM/제목 있음 | ✅ | ✅ | 인기순 | true |
| Line/MD/제목 있음 | ✅ | ✅ | 인기순 | true |
| Line/SM/제목 없음 | ✅ | ✅ | 인기순 | true |
| Line/MD/제목 없음 | ✅ | ✅ | 인기순 | true |
| Solid/SM/제목 있음 | ✅ | ✅ | 인기순 | true |
| Solid/MD/제목 있음 | ✅ | ✅ | 인기순 | true |
| Solid/SM/제목 없음 | ✅ | ✅ | 인기순 | true |
| Solid/MD/제목 없음 | ✅ | ✅ | 인기순 | true |

- **8/8 실제 동작.** 정적 강제 상태 아님 — Action 영역 안의 `data-force-state` 개수 = **0**.
- Disabled 행 2칸: `disabled=true`, 눌러도 `aria-expanded=false` 유지(열리지 않음) — 의도대로.
- 목록 항목은 최신순·인기순·과거순 3개로, 칩 값과 같은 집합이다(7단계에서 이미 맞춰진 상태 유지).

---

## 7. 🔎 검사기

| 검사기 | 결과 | 비고 |
|---|---|---|
| 🔎 Harness Audit (`npm run harness:audit`) | **0 errors · 3 warns · 12 pass** | warn 3건은 이번 작업과 무관한 기존 항목 — `btn-pri-pc`·`chip-html`·`ddl-html` 정적 코드탭 pane 부재(해당 컴포넌트들이 dist 렌더로 이관되며 생긴 기존 상태). 이번 변경이 만든 warn 없음 |

---

## 8. 미확인 / 넘기는 것

- **PASS 판정은 하지 않는다.** 이 문서는 구현 보고이며, 합격 여부는 🤖 `component-verifier` 시나리오 F 소관이다.
- **`pages/components.html` 에서의 최종 모습은 미확인이다.** filter-chip 이 `verified` 인 동안 그 페이지는 안내 문구만 띄우므로,
  approved 승격 이후 그 페이지에서 한 번 더 눈으로 봐야 한다. 이번 확인은 **같은 생성기 + 같은 dist + 같은 페이지 CSS** 를 쓴 대조 페이지 기준이다.
- **다크모드 미확인.** 이번 지적 범위 밖이라 손대지 않았고 찍지도 않았다.
- **열린 목록이 아래 행을 덮는 현상**(`8-fc-action-open.png`): Action 영역에서 칩을 열면 패널이 아래 행 위로 겹친다.
  Select 의 Action 영역도 같은 방식이라 **일부러 두었다**(살아있는 영역의 정상 동작). 별도 지시가 있으면 조정 가능 — 임의로 바꾸지 않았다.
- `reports/harness-audit-2026-09-01.{md,json}` 은 감사 실행이 만든 산출물이다(내가 쓴 문서 아님).
