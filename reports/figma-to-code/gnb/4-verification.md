# 4단계 자가대조 결과 — GNB

> figma-to-code 4단계. component-verifier(검증 전용). 1·2단계 표를 유일 기준으로 항목별 대조 + 렌더 실측.
> 구현 금지 — 목록만 반환.

## 대조 요약

- variant: 구현 15(메뉴 슬롯 9 + 바 6) / 확정 목록 15 — **일치**
  - (1단계 원목록 21 = 슬롯 9 + 바 12. 바 viewport 3변형은 사전 등록된 반응형 통합으로 6개로 축소 — (b) 사전 확정. ❌ 아님.)
- harness-audit: ✅ 13 pass / 0 error / 0 warn (GNB menu slot SIZE_SPLIT md/sm/xsm 분기 확인)
- 렌더 실측: preview_eval로 슬롯 3사이즈 + 바 3사이즈 × 2정렬 + 유틸 아이콘 박스/렌더 측정 완료
- 토큰 참조 구조: --gnb-* 7종 전부 Semantic 경유, raw HEX 0건, Foundation 직접참조 0건

---

## 정확 대조 (두갈래 제외 · 항상 엄격)

### variant 구성 — PASS
- 메뉴 슬롯 9: md/sm/xsm × default/hover/selected 전수 존재 (matrix + 토큰 색상 확인). `slotCount` 렌더 확인.
- 바 6: md/sm/xsm × center-between/start 전수 존재 (HTML `.s1-gnb--{size}.s1-gnb--{align}` 6조합 확인).
- center-between = justify space-between(3분할, 슬롯 gap 0) / start = flex-start + 유틸 margin-left auto(우측). 렌더 실측 일치.

### 아이콘 원본 — PASS
- ic_인터넷(globe): viewBox 0 0 18 18, line variant, currentColor. 2-extraction이 "icons-data.js 재사용(line, currentColor)" 사전 승인 → 허용. 렌더 path 존재.
- ic_계정/사용자/ID: viewBox 0 0 24 21.5816, 2 path, currentColor — 2-extraction 사양과 정확 일치. icons-data.js(id ic_계정사용자ID line) + 인라인 HTML 동일. 렌더 path 존재.
- ic_메뉴: viewBox 0 0 24 16.9274, 3 bar path, currentColor — 2-extraction 사양과 정확 일치. icons-data.js(id ic_메뉴 line) + 인라인 HTML 동일. 렌더 path 존재.
- 외부 패키지(font-awesome/material 등) 0건, 손그림 0건.

### 토큰 참조 구조 — PASS
- --gnb-bg → --color-navigation-bg, --gnb-border → --color-border-subtle, --gnb-menu-label-default → --color-navigation-label-default-alt, --gnb-menu-label-active → --color-navigation-label-selected, --gnb-menu-underline-active → --color-navigation-indicator-selected, --gnb-logo-text → --color-text-primary, --gnb-icon → --color-navigation-icon. 전부 Semantic 경유.
- 신규 semantic 2종(--color-navigation-label-default-alt → --color-base-black, --color-navigation-icon → --color-gray-800)은 Semantic 레이어에서 Foundation 참조 — 규칙상 정상.
- GNB CSS 블록(1488–1582) raw HEX 0건. Component 레이어 Foundation 직접참조 0건.

---

## 색상값 (두갈래 분류 · 렌더 resolved 실측)

| 역할 | 표 기준 | 구현 resolved | 판정 |
|------|---------|--------------|------|
| 바 배경 | #FFFFFF | #FFFFFF | PASS |
| 바 하단 라인 | #E9E9E9 (border-subtle) | rgb(233,233,233)=#E9E9E9 | PASS |
| 메뉴 라벨 default | #000000 | rgb(0,0,0)=#000000 | PASS |
| 메뉴 라벨 hover·selected | #1D6CEB | rgb(29,108,235)=#1D6CEB | PASS |
| 메뉴 밑줄 hover·selected | #1D6CEB | #1D6CEB | PASS |
| 유틸 아이콘 | #353535 (navigation-icon, HD-GNB-2 승인) | rgb(53,53,53)=#353535 | PASS |
| 로고 텍스트 | #000000(Figma) / #202020(code text-primary) | rgb(32,32,32)=#202020 | 🟡(b) — 아래 |

---

## 크기·타이포 (두갈래 분류 · 렌더 실측)

### 메뉴 슬롯
| 속성 | 표(md/sm/xsm) | 실측(md/sm/xsm) | 판정 |
|------|---------------|------------------|------|
| 높이 | 56/48/36 | 56/48/36 | PASS |
| min-width | 116 | 116/116/116 | PASS |
| 내부 px/py | 16·12 / 12 / 12 (py12) | pad 12/16, 12/12, 12/12 | PASS |
| 밑줄 | 2px | 2px(전 사이즈) | PASS |
| 라벨 폰트 | 18(-0.36)/18(-0.36)/14(0) | 18px ls-0.36 / 18px ls-0.36 / 14px ls normal(0) | PASS |
| weight | Medium 500 | 500 | PASS |

### GNB 바
| 속성 | 표(md/sm/xsm) | 실측 | 판정 |
|------|---------------|------|------|
| 바 높이 | 56/48/36 | 56/48/36 | PASS |
| 하단 border | 1px | 1px | PASS |
| 좌/우 패딩 | pl24 / pr20 | 24 / 20 (md·sm·xsm 공통) | PASS(아래 ❓ 참조) |
| 로고 폰트 | Bold 20 / lh1.3 | 20px / 700 | PASS |
| start gap | 로고↔메뉴 64 · 메뉴 24 | 64 / 24 (실측) | PASS |
| 유틸 박스 | md/sm 40 · xsm 32 | 40/40/32 | PASS |
| 유틸 아이콘 | md/sm 32 · xsm 24 | 32/32/24 | PASS |
| 유틸 gap | 8 | 8 | PASS |

---

## ❌ (a) 코드 실수 — 수정 대상

- 없음 (0건)

---

## 🟡 (b) 의도적 개선 / 사전 등록 — 코드 유지 + 목록 적재

- 🟡 로고 텍스트 색상: 코드 #202020(--color-text-primary) vs Figma #000000(color/base/black). 색상값 두갈래 대상. 작업 브리프에서 "placeholder, 사용자 승인" 사전 확정 → ❌ 아님. **Figma 개선 검토 목록**: GNB 로고를 순black(#000000) 유지할지, DS off-black(#202020)으로 정렬할지 결정. (HD-GNB-1 open)
- 🟡 바 viewport 3변형(1280/1440/1920·데모 px-240): 의도적 미구현, full-width 반응형 1개로 통합. 작업 브리프 사전 확정 (b). variant 12→6 축소는 정확대조 위반 아님 — 반응형 패딩/캔버스 변형이므로 색·크기 두갈래가 아닌 사전 등록 범위 결정.
- 🟡 유틸 아이콘 색상 신규 토큰 --color-navigation-icon(#353535): 기존 --color-icon-default(#757575)와 불일치였으나 Figma color/icon/gray-dark(#353535)에 맞춰 신규 semantic 신설. 작업 브리프 "승인됨" → ❌ 아님. (HD-GNB-2 — registry status open이나 사용자 승인 반영됨)

---

## ❓ (c) 확인 요청 — 사용자 판단 필요

- ❓ 바 좌/우 패딩 xsm: 2-extraction 본문(line 38)에 "xsm 실측 = pl 20 / pr 24"라는 메모가 있으나, 같은 줄 헤더는 "pl 24(lg) / pr 20(md) — 동일"로 적혀 일관되지 않음. 구현은 전 사이즈 pl24/pr20 단일 적용(실측 confirm). 표 자체가 모순이라 (a)로 단정 불가. **xsm 바 패딩이 다른 사이즈와 동일(pl24/pr20)인지, xsm만 pl20/pr24 좌우반전인지 Figma 원본(582:7770 등) 재확인 필요.** (애매하므로 (b) 처리하지 않고 (c)로 올림)

---

## 🔒 BLOCKED

- 없음 (2단계 표에 `MCP 미제공` 0건)

---

## 판정 — HOLD

| 분류 | 건수 |
|------|------|
| ❌(a) 코드 실수 | 0 |
| ❓(c) 확인 요청 | 1 (xsm 바 패딩 좌우반전 여부) |
| 🟡(b) 개선/사전등록 | 3 (로고색·viewport통합·유틸아이콘토큰) |
| 🔒 BLOCKED | 0 |

- ❌(a) 0건 → 3단계 재작업 불필요.
- ❓(c) 1건 → **사용자 확인 대기 (HOLD)**. xsm 바 패딩(전 사이즈 동일 vs xsm 좌우반전)을 Figma 582:7770 원본으로 확정하면 PASS 전환.
- 🟡(b) 3건은 개선목록에 남겨도 통과 무방(코드 유지).

> ❓(c) 1건이 해소되면 즉시 **PASS** — variant·아이콘·토큰구조·색·크기·타이포 전 항목 정확/실측 일치 상태.

---

## 해소 (2026-06-06) — ❓(c) → (a) 수정 → PASS

**재확인:** Figma xsm 바(582:7772) 내부 패딩 = `pl spacing/20(20px) · pr spacing/24(24px)` → **md/sm(pl24/pr20)과 좌우 반전**. 따라서 (c)가 아니라 **(a) 코드 실수**(xsm가 pl24/pr20로 잘못 구현). 2-extraction 표 자기모순도 정정.

**수정:** `.s1-gnb--xsm { padding-left:20px; padding-right:24px; }`(CSS + 코드패널). preview_eval 실측: xsm 바 pl **20** / pr **24** ✓ (md pl24/pr20 ✓).

**최종 판정: PASS** — ❌(a) 0 · ❓(c) 0 · BLOCKED 0. 🟡(b) 3건(로고색·viewport 통합·아이콘 신규토큰)은 개선목록 유지. 검문소 4 통과.

---

## 추가 정정 (2026-06-06) — 유틸 아이콘 글리프 크기 (a)

**누락:** 4단계가 유틸 아이콘 **박스(40px)**·색은 확인했으나 **글리프 렌더 크기를 Figma 스크린샷과 비례 비교하지 않음**. 구현이 SVG를 프레임 크기(md/sm 32px·xsm 24px)로 렌더 → Figma 실제 글리프(프레임 inset 12.5% → md/sm **24px**·xsm **18px**)보다 ~1.33배 큼. 사용자 "아이콘 너무 큼" 제보로 발견.

**근거:** Figma `get_screenshot`(540:5983 md 바) 원본 — 유틸 아이콘이 56px 바 안에서 가늘고 작게(~24px) 표시됨. inset 데이터(globe 12.5%·account/menu 좌우 12.5%)와 일치.

**수정 (a 코드 실수):** `.s1-gnb-util-btn svg` 32px→**24px**, `.s1-gnb--xsm ... svg` 24px→**18px**(CSS+코드패널). gnb.json·2-extraction 글리프 크기 정정. preview_screenshot로 Figma 시각 일치 재확인.

**프로세스 보강:** component-verifier 시각 대조 규칙에 "아이콘은 박스가 아니라 글리프 크기로 비교(프레임 inset 주의)" 추가. repeated-requests `verification-visual-gap` 2회→candidate.

---

## 추가 정정 (2026-06-06) — START 메뉴 인접 + 슬롯 구조

**사용자 제보 + 참고 기준 이미지:** "left align 메뉴 간 간격" — 참고 기준(2슬롯 282×48 연속 = 인접, 밑줄은 내부 콘텐츠 폭).

**대조:** Figma 540:6008(start 메뉴 그룹)은 `gap-[24px]`였고 구현도 이를 반영했으나, **사용자 기준 이미지는 메뉴 슬롯 인접(gap 0)**. DS 2.4 = 참고 출발점 원칙 + 사용자 기준 우선 → gap-24 제거. 또한 슬롯 패딩이 내부 px(16)만 반영돼 있어 외곽+내부(md 40)로 정정, 밑줄을 외곽 px만큼 inset(::after).

**수정:**
- `.s1-gnb--start .s1-gnb-menus { gap:24px }` **제거** → 메뉴 인접(box_gap 실측 0).
- 슬롯 padding md 16→**40**(외곽24+내부16), sm/xsm 12→**32**(외곽20+내부12).
- 밑줄 border-bottom(전폭) → **::after inset**(md 24/sm·xsm 20) = 내부 콘텐츠 폭.
- preview 실측(box_gap 0)·Figma START 오버레이 시각 일치 확인.
