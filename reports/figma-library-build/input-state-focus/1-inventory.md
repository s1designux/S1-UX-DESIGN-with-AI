# 1단계 — 재고조사 (인계본 + ⭐ 재실측 2026-09-08)

> 1단계는 이전 세션에서 끝났고, 이 문서는 **⭐ 가 그 목록을 다시 세어 확인한 결과**다.
> 재실측에서 **인계 목록에 없던 3곳(검사기 2 + 가이드 라벨 1)** 이 추가로 나왔다.

## 결정 근거
river 결정 2026-09-08 — 정본(Figma)의 `Editing` 과 웹의 `focus` 가 같은 상태를 다르게 부른다.
둘 다 `focus` 로 통일한다. 감사 기록 `reports/canon-approval-audit-2026-09-07.md` §8 ①A.
웹은 이미 `focus` 이므로 **정본(Figma·설치기) 쪽 이름만** 바꾼다.
경로는 river 가 **A(변형 값 이름만 개명)** 를 선택했다 — 세트를 새로 만들지 않는다.

## Figma 실측 (⭐ get_metadata, 2026-09-08)

| 항목 | 확인값 | 확인 방법 |
|---|---|---|
| 라이브러리 | `[에스원] GUI(공유용)` · componentKey `14386ca6…4b15` | `search_design_system(fileKey=cysG5U…)` — task 지정 key 와 일치 ✅ |
| 파일 | SW UX GUIDE V3.0 TEST `cysG5U1udpQqVagYY1hWHW` | 위 검색이 이 파일 컨텍스트에서 해당 라이브러리를 반환 |
| 페이지 | Core `5:5706` → Section `Form Control` `2386:53768` | get_metadata 조상 추적 |
| **Input 변형세트 node id** | **`2386:52176`** (1726×958) | get_metadata — 이 노드 직하에 variant symbol 56개 |
| 변형 구성 | State 7종 × 8조합(Size×Message×Break) = **56 variant** | Default/Filled/**Editing**/Error/Correct/Read-Only/Disabled 각 8개 |
| **개명 대상 variant** | **State=Editing 8개** | 예: `2386:51365` Size=XXSM,State=Editing,Message=Off,Break=PC |
| 혼동 주의 | `2386:52222` = `Input — Spec Dark` (인스턴스 진열 프레임, 세트 아님) | 조상 추적으로 분리 확인 |

> ⚠️ **미확인:** get_metadata XML 은 COMPONENT_SET 을 `<frame>` 으로 표기해 세트 여부를 타입으로 단정할 수 없다.
> `2386:52176` 이 세트라는 근거는 "직하 자식이 전부 variant 이름(`Size=…, State=…`) 을 가진 symbol 56개"라는 정황이다.
> **3단계 빌더가 `importComponentSetByKeyAsync("14386ca6…")` 로 key→node 를 확정한 뒤 개명한다** (정황이 아니라 key 로 대상 확정).

## 저장소 실측 — 고칠 곳 (⭐ 전수 grep)

### A. 인계 목록대로 확인된 곳 (16)
| 파일 | 건수 | 성격 |
|---|---|---|
| `plugins/figma-vars-installer/src/build-components.ts` | 6 | :910 변형 값 · :982 분기 비교 · :983/995/1020/1114 주석 |
| `plugins/figma-vars-installer/src/pattern-data.ts` | 6 | :165 `type InputState` · :328/338 `input(…)` · :504/521/540 `pr.State` — **이름으로 인스턴스를 찾으므로 필수** |
| `registry/components/input.json` | 2 | :64 서술 · :213 `state` (메타는 registry 가 기준) |
| `ui-library/src/components/input/input.js` | 1 | :9 주석 |
| `ui-library/src/components/input/manifest.json` | 1 | :47 `canonicalStateMap` 의 `"Editing": "focus"` |

> manifest 에는 :177·:265 서술 2건이 더 있다(합계 3). 인계 목록의 "1건"은 대응표 키만 센 것.

### B. 🔴 인계 목록에 없던 곳 — ⭐ 재실측에서 발견 (3)
| 파일 | 성격 | 안 고치면 |
|---|---|---|
| `scripts/component-anatomy-check.js:39` | Gate 11 규칙의 정규식 `State=Editing` | **Gate 11 실패** — "정규식에 매칭되는 variant 0개(selector 부패 의심)". 커밋 차단 |
| `scripts/design-md-agent-contract-check.js:38` | `['Default','Filled','Editing',…]` 기대 목록 | **Gate 24 계열 실패** — DESIGN.core.md 재생성 후 'Focus' 가 되어 기대 불일치 |
| `assets/js/ui-library-guide.js:650` | 안내 페이지 상태표의 표시 라벨 `"Editing"` | 웹 안내 페이지만 옛 이름으로 남음(사람 눈에 보이는 불일치) |

추가로 주석만 있는 곳: `scripts/gate-check.js:414`, `pages/components.html:718-719`, `pages/ui-review.html:473`.

### C. 파생 표면 — 손대지 않고 재생성 (하드룰 H6)
`design/DESIGN.core.md` · `registry/components/component-facts.json` · `registry/components/component-guide-model.json`
· `assets/js/registry-data-bundle.js` · `ui-library/dist/**` · `assets/downloads/*.zip`

### D. 시안 인스턴스 (개명이 따라와야 하는 곳)
| 기록 | State=Editing 기록 건수 |
|---|---|
| `reports/screen-rebuild/modu-app/login-mobile/node-map.json` | 6 (+ variant 매핑 1행 `MD/Editing/…` → `1546:10715`) |
| `reports/screen-rebuild/modu-app/signup-mobile-web/` 스캔 | 6 |

> ⚠️ **미확인:** 인계 문서는 "17곳"이라 했으나 저장소 기록에서 세어지는 건 12건이다.
> 이 보고서들은 **과거 기록이지 살아있는 Figma 가 아니다** — 실제 건수는 4단계에서 Figma 를 직접 세어 확정한다.
> ⭐ 는 17 이든 12 든 단정하지 않는다.
