# MVP-F0 — Figma Variable Usage Audit

> Generated: 2026-05-19
> File: `https://www.figma.com/design/yE5UCFEbmXJBlYJWB24Lz2/`
> fileKey: `yE5UCFEbmXJBlYJWB24Lz2`
> Method: Figma MCP (`get_metadata`, `get_variable_defs`, `get_design_context`, `search_design_system`)
> Status: partial — MCP 접근 범위 내 spot-scan
> Outputs:
> - `registry/figma/snapshots/figma-variable-usage.ux-guide-2.4.json`
> - `registry/tokens/legacy-token-usage-map.json`
> - `reports/mvp-f0-figma-variable-usage-audit.md` (this file)

---

## 1. 수집 방법 및 한계

### 1.1 사용한 MCP 도구

| 도구 | 용도 | 비고 |
|------|------|------|
| `whoami` | 인증 확인 | s1designux@gmail.com, s1design 팀 expert 권한 |
| `get_metadata(fileKey)` | top-level pages 목록 | "Cover" 페이지 1개만 반환됨 |
| `get_metadata(fileKey, nodeId)` | 노드 트리 XML | 일부 노드만 접근 가능 |
| `get_variable_defs(nodeId)` | 노드 단위 사용 variable + resolved value 목록 | 핵심 도구 |
| `get_design_context(nodeId)` | 노드 코드(React+Tailwind) + variable 위치 | inferredRole 추정 |
| `search_design_system(query)` | 라이브러리 component 검색 | componentKey만 반환, nodeId 직접 추출 불가 |

### 1.2 핵심 한계

**A. property-level binding은 직접 가져올 수 없다**
MCP `get_variable_defs`는 노드에 사용된 variable의 이름과 resolved value만 반환한다. 어떤 fill/stroke/text/effect에 bound되었는지의 1:1 매핑은 직접 노출하지 않는다. 본 audit에서는 `get_design_context`의 Tailwind class 위치(`bg-[var(...)]`, `border-[var(...)]`, `text-[color:var(...)]`)로 inferredRole을 역추적했다.

**B. file 전체 스캔 불가**
`get_metadata(fileKey)`가 top-level page로 "Cover" 1개만 반환했다. UX Guide 2.4의 실제 컴포넌트 페이지(Component, Style Guide 등)는 별도 page일 가능성이 높으나, MCP는 page 목록을 enumerate하지 않는다. 이미 알려진 nodeId 집합으로만 spot-access 가능.

**C. 일부 known nodeId는 invalid 응답**
`6443:4408` (Login input), `6443:4655` (DatePicker), `6443:4606` (TimePicker) 노드는 MCP가 invalid node 오류를 반환한다. 노드가 이동/삭제되었거나 권한 경계 문제로 추정된다.

**D. mode별 값 비교 불가**
MCP는 현재 활성 mode의 resolved value만 반환한다. light/dark 비교는 이 audit으로 수행할 수 없다.

### 1.3 MCP 접근 결과 요약

| 상태 | 노드 수 | 노드 |
|------|--------|------|
| accessible | 8 | 540:3794, 540:4501, 540:4502, 540:3836, 6456:4033, 540:7663, 540:7368, 540:7665 |
| failed (invalid node) | 3 | 6443:4408, 6443:4655, 6443:4606 |

---

## 2. 분석된 컴포넌트/노드 요약

| nodeId | nodeName | type | variables 사용 수 |
|--------|----------|------|------------------|
| 540:3794 | datepicker_input / form-control | componentSet | 24 |
| 540:4501 | button-primary (PC) | component | 9 |
| 540:4502 | button-primary label (text node) | text | 2 |
| 540:3836 | datepicker_mobile bottomsheet | frame | 36 |
| 6456:4033 | DatePicker Section 2 (composite) | frame | 53 |
| 540:7663 | Style Guide root frame (palette) | frame | 48 |
| 540:7368 | Typography style frame | frame | 11 |
| 540:7665 | Style Guide child node | node | 2 |

- 분석된 컴포넌트/노드: **8**
- 사용 확인된 unique variables: **63** (이 audit이 직접 본 것)
- 미사용(확인된) variables 그룹: **1** (orange palette 9 steps, palette display 외 사용 미확인)
- needs-review 항목: **7** (섹션 6 참조)
- MCP 접근 실패 노드: **3**

---

## 3. Variable 사용 현황 (요약)

**사용 빈도 top 10:**

| variableName | value | usageCount | scope |
|--------------|-------|-----------:|-------|
| color/text/state/accent-alt | #ffffff | 5 | text state semantic |
| radius/4 | 4 | 5 | foundation radius |
| color/button/label/primary--default | #ffffff | 4 | button component-alias |
| color/text/title/primary | #000000 | 4 | text semantic |
| border-width/default | 1 | 4 | foundation border-width |
| spacing/padding/inline/sm | 16 | 4 | spacing semantic |
| color/button/bg/primary--default | #1d6ceb | 3 | button component-alias |
| color/button/border/primary--default | #1d6ceb | 3 | button component-alias |
| color/icon/gray-dark | #353535 | 3 | icon semantic |
| color/base/white | #ffffff | 3 | foundation base |

전체 사용 현황은 `registry/figma/snapshots/figma-variable-usage.ux-guide-2.4.json` 의 `variableUsage` 배열 참조.

---

## 4. Semantic 후보 (여러 컴포넌트 공유)

여러 컴포넌트에서 동일 variable이 쓰이면 → semantic 토큰 유지 또는 승격 후보다.

| variable | used in (nodeId) | reason |
|----------|------------------|--------|
| `color/form-control/bg/default` | 540:3794, 6456:4033 | Input + DatePicker trigger 공용. semantic layer 유지 확정. |
| `color/form-control/border/default` | 540:3794, 6456:4033 | 위와 동일. semantic 유지. |
| `color/form-control/border/selected` | 540:3794, 6456:4033 | 위와 동일. `selected` → canonical `focus` alias 적용. |
| `color/form-control/text/placeholder` | 540:3794, 6456:4033 | placeholder 의미가 form-control 외 다른 영역에도 사용될 수 있어 `--color-text-placeholder`로 promote 후보. |
| `color/text/state/accent-alt` | 540:3836, 6456:4033, 540:7663, 540:7665, 540:7368 | 5회 사용 — "text on accent background". 이름 모호하나 의미는 명확. rename + semantic 유지. |
| `color/icon/gray-dark` | 540:3794, 540:3836, 6456:4033 | icon default 색상. semantic layer 유지. |
| `color/icon/gray-light` | 540:3794, 6456:4033 | icon disabled 색상. semantic layer 유지. |
| `color/control/bg/selected` | 540:3836, 6456:4033 | day-cell selected 등 form-control 외 컨트롤. `color/action/primary` 또는 `color/control/bg/selected`로 정리. |
| `color/control/border/selected` | 540:3836, 6456:4033 | 위와 동일. MVP4.4 `--color-control-border-*` 시리즈와 매핑. |
| `surface/neutral/bg/subtle` | 6456:4033, 540:7663, 540:7368 | subtle background. semantic 유지 (`--color-bg-subtle`). |
| `surface/neutral/bg/base` | 540:3836, 6456:4033 | panel surface. `--color-surface-default` 매핑. |
| `radius/4` | 540:3794, 540:4501, 540:3836, 6456:4033, 540:7368 | 5회 — 가장 자주 쓰이는 radius. foundation primitive 유지. |
| `border-width/default` | 540:3794, 540:4501, 540:3836, 6456:4033 | foundation 유지. |
| `spacing/padding/inline/sm` | 540:3794, 540:4501, 540:3836, 6456:4033 | semantic spacing 유지. |
| `color/base/white` | 540:3836, 6456:4033, 540:7663 | foundation. |
| `color/blue/50` | 540:3836, 6456:4033, 540:7663 | DatePicker 범위 fill 배경. foundation 유지하되 `--color-bg-selected-range` 등 semantic 추가 후보. |

---

## 5. Component Token 후보 (특정 컴포넌트 전용)

특정 컴포넌트만 사용하면 → component token 또는 component-alias 후보다.

| variable | component | reason |
|----------|-----------|--------|
| `color/button/bg/primary--default` | 540:4501, 540:3836, 6456:4033 (button instances) | button-only. `--button-primary-default-bg` (component-alias) 유지. |
| `color/button/border/primary--default` | 위와 동일 | `--button-primary-default-border` 유지. |
| `color/button/label/primary--default` | 위와 동일 | `--button-primary-default-text` 유지. |
| `color/navigation/background` | 6456:4033 | DatePicker month/year nav 탭에서만 사용. navigation component-alias로 분리 또는 surface로 통합 결정 필요. |
| `color/navigation/label/default` | 6456:4033 | 위와 동일. |
| `color/navigation/label/selected` | 6456:4033 | 위와 동일. |
| `color/navigation/indicator/default` | 6456:4033 | 위와 동일. |
| `color/navigation/indicator/selected` | 6456:4033 | 위와 동일. |
| `sizing/form-control/height/*` (md/lg/xs/xxs) | 540:3794, 6456:4033 | form-control 전용 sizing. 유지. |
| `sizing/button/height/md` | 540:4501 | button 전용 sizing. 유지. |
| `radius/control/sm` | 540:3794 | form-control 전용 (실제 값 = radius/4). 검토 필요. |
| `sizing/30`, `sizing/44`, `sizing/56`, `sizing/80` | 540:3836, 6456:4033 | DatePicker day-cell, nav 등 specific 사이즈. canonical 매핑 미정. |

---

## 6. 미사용 / Deprecated 후보

| variable | reason | recommendation |
|----------|--------|----------------|
| `color/orange/*` (50–500, 9 steps) | palette display frame 540:7663 외 실제 컴포넌트 사용 미확인 | Foundation primitive 유지. 단, 어떤 컴포넌트(예: status warning)에서 사용되는지 plugin export로 추가 검증 필요. |
| `color/control/border/disabled-alt1` | `-alt1` suffix는 legacy variant 표시. 값 #d9d9d9는 `border/default`와 동일 | 통합 검토 — `--color-control-border-disabled`로 단일화. |
| `border-width/100` vs `border-width/default` | 둘 다 1px. button-primary는 default, datepicker mobile/section 2는 100 사용 | 동일 의미인지 확인 후 1개로 통합. |
| `title/16M` vs `Title/16M` | 대소문자만 다른 중복 variable | Figma 정의 정리 — 1개로 통합. |
| `color/text/body/primary` (#353535) | `color/text/title/secondary` (#353535)와 값 동일. 의미 분리 모호 | "body"와 "title" 의미 구분이 코드에 없음. legacy 통합 후보. |
| `color/text/body/tertiary` (#757575) | `color/form-control/text/placeholder` (#757575)와 값 동일 | 의미 충돌. 통합 또는 명확한 의미 분리 필요. |

---

## 7. L4.5로 넘길 이슈

L4.5(Canonical Token Promotion 다음 단계)에서 처리할 인터-레이어 이슈:

| issue | related variable | related component | recommendation |
|-------|------------------|-------------------|----------------|
| **NAMING-01**: Figma `text/state/accent-alt` 이름이 모호. 값(#ffffff)은 white지만 의미는 "text on accent" | `color/text/state/accent-alt` | 540:3836, 6456:4033, 540:7663, 540:7665, 540:7368 | canonical 이름 `--color-text-on-accent` 또는 `--color-text-state-inverse` 검토. |
| **NAMING-02**: `color/text/title/primary` resolved #000000 ≠ canonical `--color-text-primary` (#202020) | `color/text/title/primary` | 540:3836, 6456:4033, 540:7663, 540:7368 | 값 불일치. Figma 값 #202020로 변경 vs 별도 토큰 분리. Human Decision 필요. |
| **DEDUP-01**: `border-width/default` ≡ `border-width/100` | 동일 1px | button + datepicker | Figma에서 1개로 통합. |
| **DEDUP-02**: `radius/4` ≡ `radius/control/sm` | 동일 4px | form-control + button | semantic vs foundation 사용 정책 확정. |
| **DEDUP-03**: `title/16M` ≡ `Title/16M` | 대소문자 중복 | datepicker mobile + section 2 | 1개로 통합. |
| **DEDUP-04**: `color/form-control/bg/disabled` ≡ `color/control/bg/disabled` (둘 다 #f5f5f5) | form-control vs control | datepicker | 의도된 분리인지, legacy 중복인지 확정. |
| **ACCESS-01**: 6443:4408 (Login input), 6443:4655 (DatePicker), 6443:4606 (TimePicker) MCP invalid | — | — | Figma 파일 직접 확인 후 `registry/figma/figma-map.json`에 새 nodeId 재등록. |

---

## 8. Plugin Export 절차 (전체 스캔이 필요한 경우)

본 MCP audit은 partial scan이다. 다음 작업에는 Plugin Export가 필요하다:
- 전체 file의 모든 Variable에 대한 usage count
- 정확한 boundVariables[] property-level 매핑 (fill / stroke / text / effect)
- light/dark mode별 값 비교

**Plugin Export 절차:**

1. Figma에서 `S1 UX 디자인가이드 2.4` 파일 열기 (fileKey `yE5UCFEbmXJBlYJWB24Lz2`)
2. SW Token Sync 플러그인 실행 (`plugins/figma-token-sync/`)
3. "Export Variable Usage" (또는 "Export Variables") 탭 선택
4. Download JSON
5. `registry/figma/snapshots/figma-variable-usage.ux-guide-2.4.json`으로 저장 (덮어쓰기 또는 별도 `.full.json`으로 보관)
6. `npm run figma:audit` 실행 (또는 후속 MVP-F1 스크립트)

> SW Token Sync Plugin에 "Export Variable Usage" 모드가 아직 없다면 MVP-F1에서 추가. 현재는 "Export Variables" (Variables read-only) 모드만 구현됨.

---

## 9. 본 audit 후속 권장 단계

1. **MVP-F1**: SW Token Sync Plugin에 "Export Variable Usage" 모드 추가
   - 모든 node의 `boundVariables[]` 재귀 수집
   - 각 variable에 `usageCount`, `usedInProperties`, `usedInComponents` 첨부
   - Figma 파일 전체 스캔 결과 JSON export
2. **MVP-F2**: 본 audit `legacy-token-usage-map.json`을 source of truth로 활용해 canonical-token-promotion-plan.json의 `needs-review` 항목 7개 (MVP-L4 결과) 해소
3. **MVP-F3**: Figma 직접 수정 작업 (Human이 Figma에서 직접 수행)
   - 위 DEDUP-01~04 중복 정리
   - NAMING-01 / NAMING-02 이름 또는 값 정리
   - 6443:* 노드 재등록

---

## 10. 변경된 파일

| 파일 | 작업 |
|------|------|
| `registry/figma/snapshots/figma-variable-usage.ux-guide-2.4.json` | 신규 생성 — MCP 스캔 결과 + variableUsage 집계 |
| `registry/tokens/legacy-token-usage-map.json` | 신규 생성 — 80개 legacy variable의 canonical 후보·confidence·status 매핑 |
| `reports/mvp-f0-figma-variable-usage-audit.md` | 신규 생성 — 본 보고서 |
| `CLAUDE.md` | 변경 이력 1행 추가 |
