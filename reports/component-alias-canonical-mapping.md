# 컴포넌트 별칭 ↔ 정본 토큰 대조 (2026-07-31 조사)

**생성일:** 2026-07-31  
**상태:** 조사 완료 · 조치 미착수  
**입력:** `registry/components/*.json` 18개 · `assets/css/tokens.css` · `assets/css/site-base.css` · `plugins/figma-vars-installer/src/build-components.ts`  
**관련:** `BACKLOG.md` — 「포털 사이트 정본 정합 (중단 — 우선순위 낮음)」

---

## ⚠️ 먼저 읽을 것 — 이 조사에서 한 번 오판이 있었다

조사 중간에 **"정본에 없는 토큰 29건을 새로 만들어야 한다"**고 보고했으나 **틀렸다. 신설 필요는 0건이다.**

원인은 **이름 문자열만 대조하고 값 배선을 안 본 것**이다. `--chip-line-default-icon` 이라는 이름이 `tokens.css` 에 없으니 "정본에 없다"고 판정했는데, 그 값은 이미 정본 `--color-chip-line-label-default` 를 가리키고 있었다.

확인된 사실:

- `vars-data.ts` SEMANTIC_COLOR **171종** = `tokens.css` Semantic **171종** (차집합 양쪽 0)
- 설치기는 이 171개로 전 컴포넌트를 그린다. 부품 전용 토큰을 만들지 않고 **기존 토큰을 재사용**한다
  - dropdown 트리거 → `color/form-control/{bg,border,text,icon}/*` (`build-components.ts:1263~1267`)
  - toggle knob → `color/control/indicator/selected` · `indicator/disabled` (`:747`)
  - gnb 밑줄 → `color/navigation/indicator/selected` (`:2500`)
  - navigation 테두리 → `color/line/gray/subtle` (`:2742`)
  - Line Tab 라벨·인디케이터 → `color/navigation/label/*` · `indicator/*` (`:1511·1524`)
  - chip 아이콘 → registry 가 이미 `color/chip/{v}/label/{state}` 참조 (`chip.json:80~85·106~111`)

**이 문서를 읽는 사람·AI 에게:** 아래 표에서 "정본에 대응이 없다"는 것은 **이름이 다르다**는 뜻이지 값이 없다는 뜻이 아니다. 조치는 토큰 신설이 아니라 **이름 배선**이다.

---

## 이 문서의 범위

조사는 7회에 걸쳐 진행됐고, 그중 **재개 시 직접 쓰이는 표 3개만** 남겼다. site-base.css 49종 전량 HEX·소비처 3갈래 분류·페이지별 구획 판정 등은 site-base 폐지가 보류라 제외했다 — 필요해지면 같은 방식으로 다시 뽑는다(전부 결정론적 파싱이라 같은 결과가 나온다).

---

## 표 1 — registry 별칭 중 이름이 `tokens.css` 에 없는 것 (127종)

**판정 기준**

| 유형 | 뜻 |
|---|---|
| **M** | 값의 `var()` 대상이 `tokens.css` 에 있음 → 이름만 정본 밖 |
| **B** | 값의 `var()` 대상이 `tokens.css` 엔 없고 `site-base.css` 에 있음 → 이름·값 둘 다 정본 밖 |
| **X** | 값이 `var()` 형태가 아님 (리터럴) |

| # | 파일:줄 | 별칭 이름 | 값 | 값 대상 위치 | 유형 |
|---|---|---|---|---|---|
| 1 | `checkbox.json:56` | `--checkbox-default-bg` | `var(--color-control-bg-default)` | tokens.css | M |
| 2 | `checkbox.json:57` | `--checkbox-hover-bg` | `var(--color-control-bg-hover)` | tokens.css | M |
| 3 | `checkbox.json:58` | `--checkbox-checked-bg` | `var(--color-control-bg-selected)` | tokens.css | M |
| 4 | `checkbox.json:59` | `--checkbox-disabled-bg` | `var(--color-control-bg-disabled)` | tokens.css | M |
| 5 | `checkbox.json:60` | `--checkbox-default-border` | `var(--color-control-border-default)` | tokens.css | M |
| 6 | `checkbox.json:61` | `--checkbox-hover-border` | `var(--color-control-border-default)` | tokens.css | M |
| 7 | `checkbox.json:62` | `--checkbox-checked-border` | `var(--color-control-border-selected)` | tokens.css | M |
| 8 | `checkbox.json:63` | `--checkbox-disabled-border` | `var(--color-control-border-disabled)` | tokens.css | M |
| 9 | `checkbox.json:64` | `--checkbox-check-icon` | `var(--color-control-indicator-selected)` | tokens.css | M |
| 10 | `checkbox.json:65` | `--checkbox-disabled-check-icon` | `var(--color-control-indicator-disabled)` | tokens.css | M |
| 11 | `chip.json:69` | `--chip-line-default-bg` | `var(--color-chip-line-bg-default)` | tokens.css | M |
| 12 | `chip.json:70` | `--chip-line-hover-bg` | `var(--color-chip-line-bg-hover)` | tokens.css | M |
| 13 | `chip.json:71` | `--chip-line-selected-bg` | `var(--color-chip-line-bg-selected)` | tokens.css | M |
| 14 | `chip.json:72` | `--chip-line-disabled-bg` | `var(--color-chip-line-bg-disabled)` | tokens.css | M |
| 15 | `chip.json:73` | `--chip-line-default-border` | `var(--color-chip-line-border-default)` | tokens.css | M |
| 16 | `chip.json:74` | `--chip-line-hover-border` | `var(--color-chip-line-border-default)` | tokens.css | M |
| 17 | `chip.json:75` | `--chip-line-selected-border` | `var(--color-chip-line-border-selected)` | tokens.css | M |
| 18 | `chip.json:76` | `--chip-line-disabled-border` | `var(--color-chip-line-border-disabled)` | tokens.css | M |
| 19 | `chip.json:77` | `--chip-line-default-text` | `var(--color-chip-line-label-default)` | tokens.css | M |
| 20 | `chip.json:78` | `--chip-line-selected-text` | `var(--color-chip-line-label-selected)` | tokens.css | M |
| 21 | `chip.json:79` | `--chip-line-disabled-text` | `var(--color-chip-line-label-disabled)` | tokens.css | M |
| 22 | `chip.json:80` | `--chip-line-default-icon` | `var(--color-chip-line-label-default)` | tokens.css | M |
| 23 | `chip.json:81` | `--chip-line-selected-icon` | `var(--color-chip-line-label-selected)` | tokens.css | M |
| 24 | `chip.json:82` | `--chip-line-disabled-icon` | `var(--color-chip-line-label-disabled)` | tokens.css | M |
| 25 | `chip.json:83` | `--chip-line-default-close-icon` | `var(--color-chip-line-label-default)` | tokens.css | M |
| 26 | `chip.json:84` | `--chip-line-hover-close-icon` | `var(--color-chip-line-label-default)` | tokens.css | M |
| 27 | `chip.json:85` | `--chip-line-selected-close-icon` | `var(--color-chip-line-label-selected)` | tokens.css | M |
| 28 | `chip.json:95` | `--chip-solid-default-bg` | `var(--color-chip-solid-bg-default)` | tokens.css | M |
| 29 | `chip.json:96` | `--chip-solid-hover-bg` | `var(--color-chip-solid-bg-hover)` | tokens.css | M |
| 30 | `chip.json:97` | `--chip-solid-selected-bg` | `var(--color-chip-solid-bg-selected)` | tokens.css | M |
| 31 | `chip.json:98` | `--chip-solid-disabled-bg` | `var(--color-chip-solid-bg-disabled)` | tokens.css | M |
| 32 | `chip.json:99` | `--chip-solid-default-border` | `var(--color-chip-solid-border-default)` | tokens.css | M |
| 33 | `chip.json:100` | `--chip-solid-hover-border` | `var(--color-chip-solid-bg-hover)` | tokens.css | M |
| 34 | `chip.json:101` | `--chip-solid-selected-border` | `var(--color-chip-solid-border-selected)` | tokens.css | M |
| 35 | `chip.json:102` | `--chip-solid-disabled-border` | `var(--color-chip-solid-border-disabled)` | tokens.css | M |
| 36 | `chip.json:103` | `--chip-solid-default-text` | `var(--color-chip-solid-label-default)` | tokens.css | M |
| 37 | `chip.json:104` | `--chip-solid-selected-text` | `var(--color-chip-solid-label-selected)` | tokens.css | M |
| 38 | `chip.json:105` | `--chip-solid-disabled-text` | `var(--color-chip-solid-label-disabled)` | tokens.css | M |
| 39 | `chip.json:106` | `--chip-solid-default-icon` | `var(--color-chip-solid-label-default)` | tokens.css | M |
| 40 | `chip.json:107` | `--chip-solid-selected-icon` | `var(--color-chip-solid-label-selected)` | tokens.css | M |
| 41 | `chip.json:108` | `--chip-solid-disabled-icon` | `var(--color-chip-solid-label-disabled)` | tokens.css | M |
| 42 | `chip.json:109` | `--chip-solid-default-close-icon` | `var(--color-chip-solid-label-default)` | tokens.css | M |
| 43 | `chip.json:110` | `--chip-solid-hover-close-icon` | `var(--color-chip-solid-label-default)` | tokens.css | M |
| 44 | `chip.json:111` | `--chip-solid-selected-close-icon` | `var(--color-chip-solid-label-selected)` | tokens.css | M |
| 45 | `dropdown.json:63` | `--dropdown-trigger-default-bg` | `var(--color-surface-default)` | site-base.css | B |
| 46 | `dropdown.json:64` | `--dropdown-trigger-hover-bg` | `var(--color-bg-subtle)` | site-base.css | B |
| 47 | `dropdown.json:65` | `--dropdown-trigger-open-bg` | `var(--color-bg-subtle)` | site-base.css | B |
| 48 | `dropdown.json:66` | `--dropdown-trigger-disabled-bg` | `var(--color-bg-subtle)` | site-base.css | B |
| 49 | `dropdown.json:67` | `--dropdown-trigger-default-border` | `var(--color-form-control-border-default)` | tokens.css | M |
| 50 | `dropdown.json:68` | `--dropdown-trigger-hover-border` | `var(--color-border-strong)` | site-base.css | B |
| 51 | `dropdown.json:69` | `--dropdown-trigger-open-border` | `var(--color-border-focus)` | site-base.css | B |
| 52 | `dropdown.json:70` | `--dropdown-trigger-disabled-border` | `var(--color-border-subtle)` | site-base.css | B |
| 53 | `dropdown.json:71` | `--dropdown-trigger-default-text` | `var(--color-text-secondary)` | site-base.css | B |
| 54 | `dropdown.json:72` | `--dropdown-trigger-disabled-text` | `var(--color-text-disabled)` | site-base.css | B |
| 55 | `dropdown.json:73` | `--dropdown-trigger-placeholder-text` | `var(--color-text-placeholder)` | site-base.css | B |
| 56 | `dropdown.json:74` | `--dropdown-trigger-selected-text` | `var(--color-text-primary)` | site-base.css | B |
| 57 | `dropdown.json:75` | `--dropdown-list-bg` | `var(--color-surface-raised)` | tokens.css | M |
| 58 | `dropdown.json:76` | `--dropdown-list-border` | `var(--color-border-default)` | site-base.css | B |
| 59 | `dropdown.json:77` | `--dropdown-option-hover-bg` | `var(--color-bg-subtle)` | site-base.css | B |
| 60 | `dropdown.json:78` | `--dropdown-option-selected-bg` | `transparent` | — (var 아님) | X |
| 61 | `dropdown.json:79` | `--dropdown-option-selected-text` | `var(--color-action-primary-default)` | site-base.css | B |
| 62 | `gnb.json:100` | `--gnb-bg` | `var(--color-navigation-bg)` | tokens.css | M |
| 63 | `gnb.json:108` | `--gnb-border` | `var(--color-border-subtle)` | site-base.css | B |
| 64 | `gnb.json:116` | `--gnb-menu-label-default` | `var(--color-navigation-label-default-alt)` | tokens.css | M |
| 65 | `gnb.json:124` | `--gnb-menu-label-active` | `var(--color-navigation-label-selected)` | tokens.css | M |
| 66 | `gnb.json:132` | `--gnb-menu-underline-active` | `var(--color-navigation-indicator-selected)` | tokens.css | M |
| 67 | `gnb.json:140` | `--gnb-logo-text` | `var(--color-text-primary)` | site-base.css | B |
| 68 | `gnb.json:148` | `--gnb-icon` | `var(--color-navigation-icon)` | site-base.css | B |
| 69 | `gnb.json:166` | `--color-navigation-icon` | `var(--color-gray-800)` | tokens.css | M |
| 70 | `nav.json:61` | `--nav-bg` | `var(--color-surface-default)` | site-base.css | B |
| 71 | `nav.json:62` | `--nav-item-hover-bg` | `var(--color-bg-subtle)` | site-base.css | B |
| 72 | `nav.json:63` | `--nav-item-active-bg` | `var(--color-action-primary-subtle)` | site-base.css | B |
| 73 | `nav.json:64` | `--nav-item-default-text` | `var(--color-text-tertiary)` | site-base.css | B |
| 74 | `nav.json:65` | `--nav-item-active-text` | `var(--color-action-primary-default)` | site-base.css | B |
| 75 | `nav.json:66` | `--nav-item-default-icon` | `var(--color-icon-default)` | site-base.css | B |
| 76 | `nav.json:67` | `--nav-item-active-icon` | `var(--color-action-primary-default)` | site-base.css | B |
| 77 | `nav.json:68` | `--nav-item-indicator` | `var(--color-action-primary-default)` | site-base.css | B |
| 78 | `nav.json:69` | `--nav-item-indicator-default` | `var(--color-border-subtle)` | site-base.css | B |
| 79 | `nav.json:70` | `--nav-divider` | `var(--color-border-subtle)` | site-base.css | B |
| 80 | `pagination.json:73` | `--pagination-control-bg` | `var(--color-surface-default)` | site-base.css | B |
| 81 | `pagination.json:81` | `--pagination-control-border` | `var(--color-pagination-control-border-default)` | tokens.css | M |
| 82 | `pagination.json:89` | `--pagination-control-hover-bg` | `var(--color-bg-subtle)` | site-base.css | B |
| 83 | `pagination.json:97` | `--pagination-number-text` | `var(--color-gray-400)` | tokens.css | M |
| 84 | `pagination.json:105` | `--pagination-number-text-selected` | `var(--color-text-secondary)` | site-base.css | B |
| 85 | `radio.json:55` | `--radio-default-bg` | `var(--color-control-bg-default)` | tokens.css | M |
| 86 | `radio.json:56` | `--radio-hover-bg` | `var(--color-control-bg-hover)` | tokens.css | M |
| 87 | `radio.json:57` | `--radio-disabled-bg` | `var(--color-control-bg-disabled)` | tokens.css | M |
| 88 | `radio.json:58` | `--radio-default-border` | `var(--color-control-border-default)` | tokens.css | M |
| 89 | `radio.json:59` | `--radio-hover-border` | `var(--color-control-border-default)` | tokens.css | M |
| 90 | `radio.json:60` | `--radio-selected-border` | `var(--color-control-border-selected)` | tokens.css | M |
| 91 | `radio.json:61` | `--radio-disabled-border` | `var(--color-control-border-disabled)` | tokens.css | M |
| 92 | `radio.json:62` | `--radio-selected-dot` | `var(--color-control-indicator-selected-alt)` | tokens.css | M |
| 93 | `radio.json:63` | `--radio-disabled-dot` | `var(--color-control-indicator-disabled)` | tokens.css | M |
| 94 | `tab.json:75` | `--tab-bg` | `var(--color-navigation-bg)` | tokens.css | M |
| 95 | `tab.json:83` | `--tab-label-default` | `var(--color-navigation-label-default)` | tokens.css | M |
| 96 | `tab.json:91` | `--tab-label-selected` | `var(--color-navigation-label-selected)` | tokens.css | M |
| 97 | `tab.json:99` | `--tab-indicator-default` | `var(--color-navigation-indicator-default)` | tokens.css | M |
| 98 | `tab.json:107` | `--tab-indicator-selected` | `var(--color-navigation-indicator-selected)` | tokens.css | M |
| 99 | `table.json:104` | `--table-header-bg` | `var(--color-bg-default)` | site-base.css | B |
| 100 | `table.json:112` | `--table-header-text` | `var(--color-text-secondary)` | site-base.css | B |
| 101 | `table.json:120` | `--table-border-light` | `var(--color-border-subtle)` | site-base.css | B |
| 102 | `table.json:128` | `--table-border-strong` | `var(--color-border-emphasis)` | site-base.css | B |
| 103 | `table.json:136` | `--table-header-border` | `var(--table-border-light)` | 없음: --table-border-light | B |
| 104 | `table.json:144` | `--table-row-default-bg` | `var(--color-table-cell-default)` | tokens.css | M |
| 105 | `table.json:152` | `--table-row-hover-bg` | `var(--color-table-cell-hover)` | tokens.css | M |
| 106 | `table.json:160` | `--table-row-selected-bg` | `var(--color-table-cell-selected)` | tokens.css | M |
| 107 | `table.json:168` | `--table-cell-border` | `var(--table-border-light)` | 없음: --table-border-light | B |
| 108 | `table.json:176` | `--table-cell-text` | `var(--color-text-body-primary)` | tokens.css | M |
| 109 | `textarea.json:66` | `--input-default-bg` | `var(--color-form-control-bg-default)` | tokens.css | M |
| 110 | `textarea.json:67` | `--input-disabled-bg` | `var(--color-form-control-bg-disabled)` | tokens.css | M |
| 111 | `textarea.json:68` | `--input-readonly-bg` | `var(--color-form-control-bg-disabled)` | tokens.css | M |
| 112 | `textarea.json:69` | `--input-default-border` | `var(--color-form-control-border-default)` | tokens.css | M |
| 113 | `textarea.json:70` | `--input-focus-border` | `var(--color-form-control-border-selected)` | tokens.css | M |
| 114 | `textarea.json:71` | `--input-error-border` | `var(--color-form-control-border-error)` | tokens.css | M |
| 115 | `textarea.json:72` | `--input-correct-border` | `var(--color-form-control-border-correct)` | tokens.css | M |
| 116 | `textarea.json:73` | `--input-disabled-border` | `var(--color-form-control-border-disabled)` | tokens.css | M |
| 117 | `textarea.json:74` | `--input-readonly-border` | `var(--color-form-control-border-disabled)` | tokens.css | M |
| 118 | `textarea.json:75` | `--input-placeholder-text` | `var(--color-form-control-text-placeholder)` | tokens.css | M |
| 119 | `textarea.json:76` | `--input-disabled-text` | `var(--color-form-control-text-disabled)` | tokens.css | M |
| 120 | `textarea.json:77` | `--input-readonly-text` | `var(--color-text-readonly)` | site-base.css | B |
| 121 | `textarea.json:78` | `--input-helper-text` | `var(--color-text-state-caption)` | tokens.css | M |
| 122 | `textarea.json:79` | `--input-error-text` | `var(--color-text-state-error)` | site-base.css | B |
| 123 | `textarea.json:80` | `--input-correct-text` | `var(--color-text-state-correct)` | tokens.css | M |
| 124 | `toggle.json:54` | `--toggle-on-bg` | `var(--color-control-bg-selected)` | tokens.css | M |
| 125 | `toggle.json:55` | `--toggle-off-bg` | `var(--color-control-indicator-unselected)` | tokens.css | M |
| 126 | `toggle.json:56` | `--toggle-disabled-bg` | `var(--color-control-bg-disabled)` | tokens.css | M |
| 127 | `toggle.json:57` | `--toggle-knob` | `var(--color-control-indicator-selected)` | tokens.css | M |

**합계 127건 — M 88 · B 38 · X 1**

---

## 표 2 — registry 엔트리 ↔ 정본 이름 대조 (미대응 60건)

**판정 기준:** 별칭 이름을 부품·상태·속성으로 분해해, 해당 컴포넌트의 정본 네임스페이스(`dropdown.json`→`--color-dropdown-*` 등)에 같은 상태·속성 조합이 있는지 **문자열로만** 대조. 값은 보지 않았다.

**재개 시 첫 작업이 이 표다.** 각 행에 대해 registry `name` 을 정본 이름으로 바꿀지, `gen-design-md.js` 출력 방식을 바꿀지 정한다.

전체 엔트리 138건 · 대응 있음 78건 · **대응 없음 60건**

| # | 파일:줄 | 별칭 이름 | 상태(판독) | 속성(판독) | 대조한 정본 NS |
|---|---|---|---|---|---|
| 1 | `checkbox.json:58` | `--checkbox-checked-bg` | checked | bg | `--color-control-*` |
| 2 | `checkbox.json:61` | `--checkbox-hover-border` | hover | border | `--color-control-*` |
| 3 | `checkbox.json:62` | `--checkbox-checked-border` | checked | border | `--color-control-*` |
| 4 | `checkbox.json:64` | `--checkbox-check-icon` | checked | icon | `--color-control-*` |
| 5 | `checkbox.json:65` | `--checkbox-disabled-check-icon` | disabled | icon | `--color-control-*` |
| 6 | `chip.json:74` | `--chip-line-hover-border` | hover | border | `--color-chip-*` |
| 7 | `chip.json:80` | `--chip-line-default-icon` | default | icon | `--color-chip-*` |
| 8 | `chip.json:81` | `--chip-line-selected-icon` | selected | icon | `--color-chip-*` |
| 9 | `chip.json:82` | `--chip-line-disabled-icon` | disabled | icon | `--color-chip-*` |
| 10 | `chip.json:83` | `--chip-line-default-close-icon` | default | icon | `--color-chip-*` |
| 11 | `chip.json:84` | `--chip-line-hover-close-icon` | hover | icon | `--color-chip-*` |
| 12 | `chip.json:85` | `--chip-line-selected-close-icon` | selected | icon | `--color-chip-*` |
| 13 | `chip.json:100` | `--chip-solid-hover-border` | hover | border | `--color-chip-*` |
| 14 | `chip.json:106` | `--chip-solid-default-icon` | default | icon | `--color-chip-*` |
| 15 | `chip.json:107` | `--chip-solid-selected-icon` | selected | icon | `--color-chip-*` |
| 16 | `chip.json:108` | `--chip-solid-disabled-icon` | disabled | icon | `--color-chip-*` |
| 17 | `chip.json:109` | `--chip-solid-default-close-icon` | default | icon | `--color-chip-*` |
| 18 | `chip.json:110` | `--chip-solid-hover-close-icon` | hover | icon | `--color-chip-*` |
| 19 | `chip.json:111` | `--chip-solid-selected-close-icon` | selected | icon | `--color-chip-*` |
| 20 | `dropdown.json:65` | `--dropdown-trigger-open-bg` | open | bg | `--color-dropdown-*` |
| 21 | `dropdown.json:66` | `--dropdown-trigger-disabled-bg` | disabled | bg | `--color-dropdown-*` |
| 22 | `dropdown.json:67` | `--dropdown-trigger-default-border` | default | border | `--color-dropdown-*` |
| 23 | `dropdown.json:68` | `--dropdown-trigger-hover-border` | hover | border | `--color-dropdown-*` |
| 24 | `dropdown.json:69` | `--dropdown-trigger-open-border` | open | border | `--color-dropdown-*` |
| 25 | `dropdown.json:70` | `--dropdown-trigger-disabled-border` | disabled | border | `--color-dropdown-*` |
| 26 | `dropdown.json:71` | `--dropdown-trigger-default-text` | default | text | `--color-dropdown-*` |
| 27 | `dropdown.json:72` | `--dropdown-trigger-disabled-text` | disabled | text | `--color-dropdown-*` |
| 28 | `dropdown.json:73` | `--dropdown-trigger-placeholder-text` | empty | text | `--color-dropdown-*` |
| 29 | `dropdown.json:74` | `--dropdown-trigger-selected-text` | filled | text | `--color-dropdown-*` |
| 30 | `dropdown.json:79` | `--dropdown-option-selected-text` | selected | text | `--color-dropdown-*` |
| 31 | `gnb.json:108` | `--gnb-border` | — | border | `--color-navigation-*` |
| 32 | `gnb.json:124` | `--gnb-menu-label-active` | active | label | `--color-navigation-*` |
| 33 | `gnb.json:132` | `--gnb-menu-underline-active` | active | — | `--color-navigation-*` |
| 34 | `gnb.json:140` | `--gnb-logo-text` | — | text | `--color-navigation-*` |
| 35 | `gnb.json:148` | `--gnb-icon` | — | icon | `--color-navigation-*` |
| 36 | `gnb.json:166` | `--color-navigation-icon` | — | icon | `--color-navigation-*` |
| 37 | `nav.json:62` | `--nav-item-hover-bg` | hover | bg | `--color-navigation-*` |
| 38 | `nav.json:63` | `--nav-item-active-bg` | active | bg | `--color-navigation-*` |
| 39 | `nav.json:65` | `--nav-item-active-text` | active | label | `--color-navigation-*` |
| 40 | `nav.json:66` | `--nav-item-default-icon` | default | icon | `--color-navigation-*` |
| 41 | `nav.json:67` | `--nav-item-active-icon` | active | icon | `--color-navigation-*` |
| 42 | `nav.json:68` | `--nav-item-indicator` | active | indicator | `--color-navigation-*` |
| 43 | `nav.json:70` | `--nav-divider` | — | border | `--color-navigation-*` |
| 44 | `pagination.json:97` | `--pagination-number-text` | — | text | `--color-pagination-*` |
| 45 | `pagination.json:105` | `--pagination-number-text-selected` | selected | text | `--color-pagination-*` |
| 46 | `radio.json:59` | `--radio-hover-border` | hover | border | `--color-control-*` |
| 47 | `table.json:112` | `--table-header-text` | — | text | `--color-table-*` |
| 48 | `table.json:144` | `--table-row-default-bg` | default | bg | `--color-table-*` |
| 49 | `table.json:152` | `--table-row-hover-bg` | hover | bg | `--color-table-*` |
| 50 | `table.json:160` | `--table-row-selected-bg` | selected | bg | `--color-table-*` |
| 51 | `table.json:176` | `--table-cell-text` | — | text | `--color-table-*` |
| 52 | `textarea.json:68` | `--input-readonly-bg` | read-only | bg | `--color-form-control-*` |
| 53 | `textarea.json:70` | `--input-focus-border` | focus | border | `--color-form-control-*` |
| 54 | `textarea.json:74` | `--input-readonly-border` | read-only | border | `--color-form-control-*` |
| 55 | `textarea.json:77` | `--input-readonly-text` | read-only | label | `--color-form-control-*` |
| 56 | `textarea.json:79` | `--input-error-text` | error | text | `--color-form-control-*` |
| 57 | `textarea.json:80` | `--input-correct-text` | correct | text | `--color-form-control-*` |
| 58 | `toggle.json:54` | `--toggle-on-bg` | on | bg | `--color-control-*` |
| 59 | `toggle.json:55` | `--toggle-off-bg` | off | bg | `--color-control-*` |
| 60 | `toggle.json:57` | `--toggle-knob` | knob | — | `--color-control-*` |

---

## 표 3 — registry → site-base 참조 48건 + 정본 후보

**판정 기준:** 값의 `var()` 대상이 `site-base.css` 정의 49종 중 하나인 엔트리. 그 값을 Foundation 까지 환원한 라이트·다크 HEX 가 **둘 다 같은** 정본 토큰을 찾아 분류.

| 유형 | 뜻 |
|---|---|
| **SAME-NS** | 같은 컴포넌트 네임스페이스 안에 값이 일치하는 정본이 있음 |
| **OTHER-NS** | 다른 네임스페이스에만 있음 |
| **NONE** | 값이 일치하는 정본이 없음 (셋 다 다크값만 갈림) |

**48건 — SAME-NS 25 · OTHER-NS 20 · NONE 3**

| # | 파일:줄 | 별칭 | 값 | state/prop | 라이트/다크 | 유형 | 같은 NS 후보 (없으면 타 NS 수) |
|---|---|---|---|---|---|---|---|
| 1 | `dropdown.json:63` | `--dropdown-trigger-default-bg` | `var(--color-surface-default)` | default/background | #FFFFFF/#1C1D23 | SAME-NS | `--color-dropdown-list-bg`, `--color-dropdown-option-bg-default` |
| 2 | `dropdown.json:64` | `--dropdown-trigger-hover-bg` | `var(--color-bg-subtle)` | hover/background | #F5F5F5/#24252C | SAME-NS | `--color-dropdown-option-bg-hover` |
| 3 | `dropdown.json:65` | `--dropdown-trigger-open-bg` | `var(--color-bg-subtle)` | open/background | #F5F5F5/#24252C | SAME-NS | `--color-dropdown-option-bg-hover` |
| 4 | `dropdown.json:66` | `--dropdown-trigger-disabled-bg` | `var(--color-bg-subtle)` | disabled/background | #F5F5F5/#24252C | SAME-NS | `--color-dropdown-option-bg-hover` |
| 5 | `dropdown.json:68` | `--dropdown-trigger-hover-border` | `var(--color-border-strong)` | hover/border | #C4C4C4/#3E4049 | OTHER-NS | 타 NS 5개 |
| 6 | `dropdown.json:69` | `--dropdown-trigger-open-border` | `var(--color-border-focus)` | open/border | #1D6CEB/#4285E8 | SAME-NS | `--color-dropdown-option-label-selected` |
| 7 | `dropdown.json:70` | `--dropdown-trigger-disabled-border` | `var(--color-border-subtle)` | disabled/border | #E9E9E9/#24252C | OTHER-NS | 타 NS 4개 |
| 8 | `dropdown.json:71` | `--dropdown-trigger-default-text` | `var(--color-text-secondary)` | default/text | #353535/#B8BABF | SAME-NS | `--color-dropdown-option-label-default` |
| 9 | `dropdown.json:72` | `--dropdown-trigger-disabled-text` | `var(--color-text-disabled)` | disabled/text | #C4C4C4/#35363F | OTHER-NS | 타 NS 6개 |
| 10 | `dropdown.json:73` | `--dropdown-trigger-placeholder-text` | `var(--color-text-placeholder)` | empty/text | #757575/#55575F | OTHER-NS | 타 NS 1개 |
| 11 | `dropdown.json:74` | `--dropdown-trigger-selected-text` | `var(--color-text-primary)` | filled/text | #202020/#ECEDF0 | SAME-NS | `--color-dropdown-option-label-hover` |
| 12 | `dropdown.json:75` | `--dropdown-list-bg` | `var(--color-surface-raised)` | all/background | #FFFFFF/#35363F | NONE | — |
| 13 | `dropdown.json:76` | `--dropdown-list-border` | `var(--color-border-default)` | all/border | #D9D9D9/#2E2F38 | OTHER-NS | 타 NS 3개 |
| 14 | `dropdown.json:77` | `--dropdown-option-hover-bg` | `var(--color-bg-subtle)` | hover/background | #F5F5F5/#24252C | SAME-NS | `--color-dropdown-option-bg-hover` |
| 15 | `dropdown.json:79` | `--dropdown-option-selected-text` | `var(--color-action-primary-default)` | selected/text | #1D6CEB/#3070D8 | OTHER-NS | 타 NS 23개 |
| 16 | `gnb.json:100` | `--gnb-bg` | `var(--color-navigation-bg)` | —/— | #FFFFFF/#1C1D23 | SAME-NS | `--color-navigation-bg` |
| 17 | `gnb.json:108` | `--gnb-border` | `var(--color-border-subtle)` | —/— | #E9E9E9/#24252C | OTHER-NS | 타 NS 4개 |
| 18 | `gnb.json:140` | `--gnb-logo-text` | `var(--color-text-primary)` | —/— | #202020/#ECEDF0 | OTHER-NS | 타 NS 6개 |
| 19 | `gnb.json:148` | `--gnb-icon` | `var(--color-navigation-icon)` | —/— | #353535/#8A8C96 | OTHER-NS | 타 NS 3개 |
| 20 | `nav.json:61` | `--nav-bg` | `var(--color-surface-default)` | all/bg | #FFFFFF/#1C1D23 | SAME-NS | `--color-navigation-bg` |
| 21 | `nav.json:62` | `--nav-item-hover-bg` | `var(--color-bg-subtle)` | hover/bg | #F5F5F5/#24252C | OTHER-NS | 타 NS 12개 |
| 22 | `nav.json:63` | `--nav-item-active-bg` | `var(--color-action-primary-subtle)` | active/bg | #E2F1FF/#112B55 | OTHER-NS | 타 NS 3개 |
| 23 | `nav.json:64` | `--nav-item-default-text` | `var(--color-text-tertiary)` | default/color | #555555/#8A8C96 | OTHER-NS | 타 NS 1개 |
| 24 | `nav.json:65` | `--nav-item-active-text` | `var(--color-action-primary-default)` | active/color | #1D6CEB/#3070D8 | SAME-NS | `--color-navigation-indicator-hover`, `--color-navigation-indicator-selected`, `--color-navigation-label-hover`, `--color-navigation-label-selected` |
| 25 | `nav.json:66` | `--nav-item-default-icon` | `var(--color-icon-default)` | default/icon | #757575/#8A8C96 | OTHER-NS | 타 NS 4개 |
| 26 | `nav.json:67` | `--nav-item-active-icon` | `var(--color-action-primary-default)` | active/icon | #1D6CEB/#3070D8 | SAME-NS | `--color-navigation-indicator-hover`, `--color-navigation-indicator-selected`, `--color-navigation-label-hover`, `--color-navigation-label-selected` |
| 27 | `nav.json:68` | `--nav-item-indicator` | `var(--color-action-primary-default)` | active/indicator | #1D6CEB/#3070D8 | SAME-NS | `--color-navigation-indicator-hover`, `--color-navigation-indicator-selected`, `--color-navigation-label-hover`, `--color-navigation-label-selected` |
| 28 | `nav.json:69` | `--nav-item-indicator-default` | `var(--color-border-subtle)` | default/indicator | #E9E9E9/#24252C | OTHER-NS | 타 NS 4개 |
| 29 | `nav.json:70` | `--nav-divider` | `var(--color-border-subtle)` | all/border | #E9E9E9/#24252C | OTHER-NS | 타 NS 4개 |
| 30 | `pagination.json:73` | `--pagination-control-bg` | `var(--color-surface-default)` | —/— | #FFFFFF/#1C1D23 | SAME-NS | `--color-pagination-control-bg-default` |
| 31 | `pagination.json:89` | `--pagination-control-hover-bg` | `var(--color-bg-subtle)` | —/— | #F5F5F5/#24252C | SAME-NS | `--color-pagination-control-bg-hover` |
| 32 | `pagination.json:105` | `--pagination-number-text-selected` | `var(--color-text-secondary)` | —/— | #353535/#B8BABF | SAME-NS | `--color-pagination-control-icon-default`, `--color-pagination-control-icon-hover`, `--color-pagination-control-icon-selected`, `--color-pagination-number-selected` |
| 33 | `tab.json:75` | `--tab-bg` | `var(--color-navigation-bg)` | —/— | #FFFFFF/#1C1D23 | SAME-NS | `--color-navigation-bg` |
| 34 | `table.json:104` | `--table-header-bg` | `var(--color-bg-default)` | —/— | #FAFAFA/#131418 | OTHER-NS | 타 NS 1개 |
| 35 | `table.json:112` | `--table-header-text` | `var(--color-text-secondary)` | —/— | #353535/#B8BABF | OTHER-NS | 타 NS 16개 |
| 36 | `table.json:120` | `--table-border-light` | `var(--color-border-subtle)` | —/— | #E9E9E9/#24252C | OTHER-NS | 타 NS 4개 |
| 37 | `table.json:128` | `--table-border-strong` | `var(--color-border-emphasis)` | —/— | #353535/#8A8C96 | SAME-NS | `--color-table-border-strong` |
| 38 | `textarea.json:77` | `--input-readonly-text` | `var(--color-text-readonly)` | readonly/color | #757575/#3E4049 | NONE | — |
| 39 | `textarea.json:79` | `--input-error-text` | `var(--color-text-state-error)` | error/helper | #E50533/#F06070 | NONE | — |
| 40 | `time-picker.json:94` | `--color-form-control-bg-default` | `var(--color-surface-default)` | —/— | #FFFFFF/#1C1D23 | SAME-NS | `--color-form-control-bg-default` |
| 41 | `time-picker.json:103` | `--color-form-control-bg-disabled` | `var(--color-bg-subtle)` | —/— | #F5F5F5/#24252C | SAME-NS | `--color-form-control-bg-disabled` |
| 42 | `time-picker.json:121` | `--color-form-control-border-selected` | `var(--color-border-focus)` | —/— | #1D6CEB/#4285E8 | SAME-NS | `--color-form-control-border-correct`, `--color-form-control-border-selected`, `--color-form-control-text-cursor` |
| 43 | `time-picker.json:130` | `--color-form-control-border-disabled` | `var(--color-border-subtle)` | —/— | #E9E9E9/#24252C | SAME-NS | `--color-form-control-border-disabled` |
| 44 | `time-picker.json:139` | `--color-form-control-text-placeholder` | `var(--color-text-placeholder)` | —/— | #757575/#55575F | SAME-NS | `--color-form-control-text-placeholder` |
| 45 | `time-picker.json:148` | `--color-form-control-text-default` | `var(--color-text-secondary)` | —/— | #353535/#B8BABF | SAME-NS | `--color-form-control-label-default`, `--color-form-control-text-default` |
| 46 | `time-picker.json:157` | `--color-form-control-text-disabled` | `var(--color-text-disabled)` | —/— | #C4C4C4/#35363F | OTHER-NS | 타 NS 6개 |
| 47 | `time-picker.json:166` | `--color-form-control-label-default` | `var(--color-text-secondary)` | —/— | #353535/#B8BABF | SAME-NS | `--color-form-control-label-default`, `--color-form-control-text-default` |
| 48 | `time-picker.json:175` | `--color-form-control-label-disabled` | `var(--color-text-disabled)` | —/— | #C4C4C4/#35363F | OTHER-NS | 타 NS 6개 |

---

## 재현 방법

세 표 모두 `registry/components/*.json` · `assets/css/tokens.css` · `assets/css/site-base.css` 를 파싱해 만든 결정론적 결과다. 정본이 바뀌면 이 표는 낡는다 — **이 문서를 정본으로 쓰지 말고**, 조치 직전에 다시 뽑아 대조할 것.

## 미확인 (이번 조사에서 보지 않음)

- `pages/*.html` 139건 각각의 정본 대응 여부
- `assets/css/style.css` 하드코딩 69색의 정본 대응 여부
- `pages/components-new.html` 인라인 `style=` 538건의 선택자 소속 (HTML 속성이라 선택자 없음 — 판정 불가)
- 표 2의 60건 중 "명명 관례 차이"와 "부품 개념 차이"의 정확한 구분 (이름 대조만 함)
