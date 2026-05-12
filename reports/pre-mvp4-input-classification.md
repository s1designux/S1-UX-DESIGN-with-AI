# Pre-MVP4 — Input Component Audit & Classification

**Date:** 2026-05-12  
**Status:** ✅ Complete  
**Source:** Figma SW UX GUIDE V2.4 · Section 2 · node-id: 6443:5451  
**Method:** Figma MCP `get_design_context` (8 nodes queried)

---

## 1. Figma Section 구조 개요

Section 2 (6443:5451) 하위 7개 Frame을 분석한 결과:

| Frame | Figma 이름 | nodeId | 역할 분류 |
|---|---|---|---|
| 1 | `input+btn` | 6443:4033 | Pattern — Input + Button 복합 레이아웃 |
| 2 | `Inputbox_large` | 6443:4072 | Pattern — Multi-line (Textarea) |
| 3 | `mobile_input field with helper text` | 6443:4105 | Slot — Mobile, Label + Helper 조합 |
| 4 | `pc_input field with helper text` | 6443:4203 | Slot — PC 3 sizes, Label + Helper 조합 |
| 5 | `Login input` | 6443:4408 | **Base Input** — 순수 input field |
| 6 | `timepicker_input` | 6443:4606 | Picker — 시간 선택 input |
| 7 | `datepicker_input` | 6443:4655 | Picker — 날짜 선택 input |

---

## 2. 분류 결과

### 2-1. Base Input

**Figma 내부명:** `Login input` (6443:4408)  
**설명:** Label/Helper 없는 순수 입력 필드. 모든 Input 조합의 원자 단위.

#### 플랫폼 × 사이즈

| 플랫폼 | 높이 | 사이즈 명칭 | Figma 토큰 |
|---|---|---|---|
| Mobile | 48px | mobile | `--sizing/form-control/height/lg` |
| PC | 44px | medium (md) | `--sizing/form-control/height/md` |
| PC | 34px | xsmall (sm) | (토큰 미확인, 픽셀값 34px) |
| PC | 28px | xxsmall (xsm) | (토큰 미확인, 픽셀값 28px) |

#### 상태 (States)

| Figma 상태 | 설명 | 현 registry 매핑 |
|---|---|---|
| `default` | 입력 전, placeholder 표시 | ✅ default |
| `selected` | 포커스/입력 중, 텍스트 커서 표시, 파란 테두리 | ⚠️ focus (이름 불일치) |
| `complete` | 입력 완료, 내용 표시 | ❌ 누락 |
| `error` | 유효성 오류, 빨간 테두리 | ✅ error |
| `success` | 유효성 성공 | ⚠️ correct (이름 불일치) |
| `disabled` | 비활성, 배경색 변경 | ✅ disabled |
| `hover` | 미정의 (Figma에 별도 상태 없음) | ⚠️ registry만 존재 |

#### 아이콘 슬롯

| 슬롯 | 설명 |
|---|---|
| `icon=off` | 아이콘 없음 (기본) |
| `icon=1` | 우측 아이콘 1개 (예: 비밀번호 숨김/표시) |
| `icon=2+` | 우측 아이콘 2개 이상 |

#### 타입 (Input Type)

| 타입 | 설명 |
|---|---|
| `normal` | 일반 텍스트 입력 |
| `password` | 비밀번호 (icon=1: 숨김/표시 토글) |

#### 대표 Figma NodeId

| 조합 | NodeId |
|---|---|
| PC medium · default · icon=off | 6443:4433 |
| PC medium · default · icon=1 (pw) | 6443:4435 |
| PC medium · selected · icon=off | 6443:4542 |
| PC medium · error · icon=off | 6443:4507 |
| PC medium · disabled · icon=off | 6443:4479 |
| Mobile · default · icon=off | 6443:4443 |

---

### 2-2. Input Slots (조합 컴포넌트)

**Figma 이름:** `pc_input field with helper text` (6443:4203) + `mobile_input field with helper text` (6443:4105)  
**설명:** Base Input + Label + Helper text 조합. 폼에서 실제 사용되는 단위.

#### 슬롯 구조

```
[Label]            ← 선택적, 14M 체중
[Base Input]       ← 필수
[Helper text]      ← 선택적, 12px
```

#### 사이즈별 구성 (PC)

| 사이즈 | Input 높이 | Label | Helper |
|---|---|---|---|
| medium | 44px | ✅ | ✅ |
| xsmall | 34px | ✅ | ✅ |
| xxsmall | 28px | ✅ | ✅ |

#### 사이즈별 구성 (Mobile)

| 사이즈 | Input 높이 | Label | Helper |
|---|---|---|---|
| (단일) | 48px | ✅ | ✅ |

#### 추가 상태

Base Input 상태 전부 + `success` (PC slot에서 확인)

---

### 2-3. Patterns (Input 기반 복합 레이아웃)

#### A. Input + Button

| 항목 | 값 |
|---|---|
| Figma 이름 | `input+btn` |
| NodeId | 6443:4033 |
| 레이아웃 | Input(234px) + Gap(6px) + Button(80px) = 320px 총 너비 |
| 플랫폼 | Mobile 전용 (h=48px) |
| 버튼 종류 | Secondary button (라벨) |
| 상태 | default, complete, disabled, selected, error, helper, success |
| 용도 | 검색 입력 + 버튼 액션, 주소 입력 + 찾기 등 |

#### B. Large Inputbox (Multi-line / Textarea)

| 항목 | 값 |
|---|---|
| Figma 이름 | `Inputbox_large` / 내부명: `Inputbox_multiline_long` |
| NodeId | 6443:4072 |
| 크기 | 320px 너비 × 120px 콘텐츠 높이 |
| 상태 | default, disabled, selected, complete_long |
| 플랫폼 | (플랫폼 구분 없음, 360px 고정 컨테이너) |
| 구조 | Label(14M) + multi-line input area |
| 특이사항 | Figma 원본에 placeholder 오타 ("placehorder") |

---

### 2-4. Picker Inputs

두 picker 모두 Base Input과 동일한 border/bg 토큰을 사용하되, **우측 아이콘 고정 + 제한된 상태** 조합.

#### A. Time Picker Input

| 항목 | 값 |
|---|---|
| Figma 이름 | `timepicker_input` |
| NodeId | 6443:4606 (frame) / 6443:4607 (default) |
| 우측 아이콘 | ic_알람 (alarm icon, 24×24) |
| Placeholder | "시간을 선택하세요" |
| 너비 | 190px |

#### B. Date Picker Input

| 항목 | 값 |
|---|---|
| Figma 이름 | `datepicker_input` |
| NodeId | 6443:4655 (frame) / 6443:4656 (default) |
| 우측 아이콘 | ic_날짜/근태,달력 (calendar icon, 24×24) |
| Placeholder | "날짜를 선택하세요" |
| 너비 | 190px |

#### Picker 공통

| 항목 | 내용 |
|---|---|
| 플랫폼 × 사이즈 | pc-md(44) / pc-xsm(34) / pc-xxsm(28) / mobile(48) |
| 상태 | default, completed, selected, disabled |
| **error/success 없음** | 날짜·시간 입력은 유효성 오류 상태 미정의 |
| 사이즈 토큰 | 기본 input과 동일 (`--sizing/form-control/height/md` 등) |

---

## 3. Figma 확인 토큰 전체 목록

MCP `get_design_context` 응답에서 직접 추출한 토큰 (fallback 값 포함).

### 색상 토큰 (form-control 네임스페이스)

| Figma 토큰 경로 | CSS 변수명 (변환) | Fallback HEX |
|---|---|---|
| `--color/form-control/bg/default` | `--color-form-control-bg-default` | #FFFFFF |
| `--color/form-control/bg/selected` | `--color-form-control-bg-selected` | #FFFFFF |
| `--color/form-control/bg/disabled` | `--color-form-control-bg-disabled` | #F5F5F5 |
| `--color/form-control/border/default` | `--color-form-control-border-default` | #D9D9D9 |
| `--color/form-control/border/selected` | `--color-form-control-border-selected` | #1D6CEB |
| `--color/form-control/border/error` | `--color-form-control-border-error` | #FF4554 |
| `--color/form-control/border/disabled` | `--color-form-control-border-disabled` | #D9D9D9 |
| `--color/form-control/text/placeholder` | `--color-form-control-text-placeholder` | #757575 |
| `--color/form-control/text/default` | `--color-form-control-text-default` | #353535 |
| `--color/form-control/text/disabled` | `--color-form-control-text-disabled` | #C4C4C4 |
| `--color/text/state/helper` | `--color-text-state-helper` | #757575 |

> ⚠️ **주의:** `--color/text/state/helper`는 Semantic 레이어 토큰이며, form-control 네임스페이스가 아님.  
> Error state에서 bg는 `bg/selected`(white)를 재사용 — 전용 `bg/error` 토큰 없음.

### 크기·간격·반경 토큰

| Figma 토큰 경로 | CSS 변수명 (변환) | Fallback 값 |
|---|---|---|
| `--sizing/form-control/height/md` | `--sizing-form-control-height-md` | 44px |
| `--sizing/form-control/height/lg` | `--sizing-form-control-height-lg` | 48px |
| `--border-width/default` | `--border-width-default` | 1px |
| `--spacing/padding/inline/sm` | `--spacing-padding-inline-sm` | 16px |
| `--spacing/padding/inline/xs` | `--spacing-padding-inline-xs` | 12px |
| `--spacing/padding/inline/xxs` | `--spacing-padding-inline-xxs` | 8px |
| `--spacing/padding/block/xxs` | `--spacing-padding-block-xxs` | 8px |
| `--spacing/padding/block/xs` | `--spacing-padding-block-xs` | 12px |
| `--radius/control/sm` | `--radius-control-sm` | 4px |
| `--spacing/4` | (cursor offset, 미정의) | 4px |

---

## 4. 기존 Registry 비교 및 Gap 분석

### 4-1. 상태값 Gap

| 상태 | Figma | 현 registry | 판정 |
|---|---|---|---|
| default | ✅ | ✅ | 일치 |
| selected (focus) | ✅ selected | ✅ focus | ⚠️ 이름 불일치 |
| complete (입력됨) | ✅ | ❌ 없음 | 누락 |
| error | ✅ | ✅ | 일치 |
| success | ✅ | ⚠️ correct (이름 다름) | ⚠️ 이름 불일치 |
| disabled | ✅ | ✅ | 일치 |
| hover | ❌ Figma에 없음 | ✅ registry에 있음 | ⚠️ registry 과잉 |

### 4-2. 토큰 네이밍 Gap

현 registry는 `--input-{state}-{property}` 규칙, Figma는 `--color/form-control/{property}/{state}` 규칙.

| 현 registry 토큰 | Figma 대응 | 판정 |
|---|---|---|
| `--input-default-bg` | `--color/form-control/bg/default` (white) | 네임스페이스 불일치 |
| `--input-hover-bg` | (Figma에 없음) | 불필요할 가능성 |
| `--input-focus-bg` | `--color/form-control/bg/selected` (white) | 이름 불일치, 값은 동일 |
| `--input-disabled-bg` | `--color/form-control/bg/disabled` (#f5f5f5) | 이름 불일치, 값 일치 |
| `--input-error-bg` | (별도 토큰 없음, selected bg 재사용) | Figma와 구조 불일치 |
| `--input-default-border` | `--color/form-control/border/default` (#d9d9d9) | 이름 불일치, 값 일치 |
| `--input-hover-border` | (Figma에 없음) | 불필요할 가능성 |
| `--input-focus-border` | `--color/form-control/border/selected` (#1d6ceb) | 이름 불일치, 값 일치 |
| `--input-error-border` | `--color/form-control/border/error` (#ff4554) | 이름 불일치, 값 일치 |
| `--input-correct-border` | (success state 추정) | 이름 불일치 |
| `--input-disabled-border` | `--color/form-control/border/disabled` (#d9d9d9) | 이름 불일치, 값 일치 |
| `--select-disabled-border` | ❓ Select 컴포넌트? Input에 잘못 포함? | 분류 오류 의심 |
| `--input-placeholder-text` | `--color/form-control/text/placeholder` (#757575) | 이름 불일치, 값 일치 |
| `--input-helper-text` | `--color/text/state/helper` (#757575) | 네임스페이스 다름, 값 일치 |
| `--input-error-text` | (Figma에서 미확인) | 확인 필요 |
| `--input-correct-text` | (Figma에서 미확인) | 확인 필요 |
| `--input-disabled-text` | `--color/form-control/text/disabled` (#c4c4c4) | 이름 불일치, 값 일치 |

### 4-3. 누락 토큰 (registry에 없음)

| 토큰 | 역할 | 권장 추가 |
|---|---|---|
| `--input-complete-border` | 입력 완료 상태 테두리 | Figma 확인 필요 |
| `--input-selected-border` | 포커스 상태 테두리 (focus = selected) | = #1D6CEB |
| `--input-default-text` | 입력 내용 텍스트 색상 | = #353535 |
| `--sizing-form-control-height-lg` | Mobile input 높이 | = 48px |

### 4-4. registry 분류 오류 의심

- `--select-disabled-border`: Input registry에 포함되어 있으나 Select 컴포넌트 토큰으로 보임. Human Decision 필요.

---

## 5. Typography

| 역할 | Figma 스타일명 | 폰트 | 크기 | 굵기 | 자간 |
|---|---|---|---|---|---|
| Label | `body/14M` | Pretendard | 14px | 500 (Medium) | -2 (-0.28px) |
| Input text | `component/control/text/14R` | Pretendard | 14px | 400 (Regular) | -2 (-0.28px) |
| Placeholder | `component/control/label/14R` | Pretendard | 14px | 400 (Regular) | 0 |
| Helper text | `helper` | Pretendard | 12px | 400 (Regular) | 0 |

> 주의: Label 색상(`#353535`)은 현재 Figma에서 토큰 미연결 — 로컬 값 사용 중.  
> `--color/text/state/helper` (#757575)는 Semantic Token으로, placeholder 색상과 동일하지만 다른 토큰.

---

## 6. Human Decision 필요 항목

| # | 결정 사항 | 배경 |
|---|---|---|
| HD-1 | **토큰 네이밍 방향** — `--input-*` 유지 vs `--color-form-control-*` 도입 | Figma 원본은 `--color/form-control/` 네임스페이스. 기존 registry는 `--input-*`. |
| HD-2 | **`hover` 상태 존치 여부** — Figma에는 hover state 미정의 | registry에만 있는 hover 토큰을 삭제할지, 관례상 유지할지 결정 필요 |
| HD-3 | **`complete` 상태 토큰 값** — 입력 완료 상태 bg/border 색상 | Figma에서 complete bg/border fallback 값 확인 필요 (별도 MCP 쿼리 또는 디자이너 확인) |
| HD-4 | **`success` vs `correct` 이름 통일** | Figma는 `success`, registry는 `correct`. 어느 쪽으로 통일? |
| HD-5 | **`--select-disabled-border` 분류** — Input registry에 포함된 이유 | Select 컴포넌트 토큰인지, 실제 Input variant인지 확인 필요 |
| HD-6 | **Inputbox_large — 독립 컴포넌트 vs Input 사이즈 variant** | 별도 textarea 컴포넌트로 분리할지, Input의 multiline type으로 취급할지 |
| HD-7 | **Label 색상 토큰화** — `#353535` 직접 사용 중 | `--color/form-control/text/label` 또는 `--color-text-primary`로 참조해야 하는지 |
| HD-8 | **Error state bg 처리** — Figma는 `bg/selected`(white)를 error state에도 재사용 | `--input-error-bg` 토큰 필요 없음? 아니면 별도 white 값 정의? |

---

## 7. Registry 업데이트 권고사항

> ⚠️ 이 항목들은 HD 결정 완료 후 적용. 현 단계에서는 candidate 상태.

### registry/components/input.json 업데이트 방향

```json
{
  "_meta": {
    "figmaNodeId": "6443:4408",
    "figmaFrameId": "6443:4408",
    "codeStatus": "not-started",
    "tokenStatus": "candidate"
  },
  "sizes": {
    "mobile": { "height": "48px", "token": "--sizing-form-control-height-lg" },
    "pc-medium": { "height": "44px", "token": "--sizing-form-control-height-md" },
    "pc-xsmall": { "height": "34px", "token": "(미확인)" },
    "pc-xxsmall": { "height": "28px", "token": "(미확인)" }
  },
  "states": ["default", "selected(focus)", "complete", "error", "success", "disabled"],
  "iconSlots": ["off", "1", "2+"],
  "inputTypes": ["normal", "password"]
}
```

### registry/figma/figma-map.json 업데이트 방향

```json
{
  "id": "input",
  "figmaNodeId": "6443:4408",
  "componentSetKey": "(확인 필요)"
}
```

### 신규 registry 항목 필요

| 컴포넌트 | 권고 파일명 | 분류 |
|---|---|---|
| Inputbox_large (Textarea) | `registry/components/textarea.json` | Core Component |
| Time Picker Input | `registry/components/timepicker-input.json` | Domain Component (Picker) |
| Date Picker Input | `registry/components/datepicker-input.json` | Domain Component (Picker) |
| Input + Button | (Pattern) | Pattern |

---

## 8. 검증 체크리스트

| 항목 | 결과 |
|---|---|
| Figma MCP `get_design_context` 호출 (8 nodes) | ✅ |
| Base Input 분류 및 nodeId 확인 | ✅ 6443:4408 |
| 플랫폼 × 사이즈 매트릭스 확인 | ✅ mobile/pc-md/pc-sm/pc-xsm |
| 상태값 전체 목록 확인 | ✅ (6개 상태 + hover 이슈) |
| 토큰 네이밍 추출 | ✅ (11 color tokens, 9 size/spacing tokens) |
| Registry Gap 분석 | ✅ (17개 토큰 비교) |
| Picker 분리 분류 | ✅ timepicker / datepicker |
| Pattern 분리 분류 | ✅ input+btn / inputbox_large |
| Human Decision 항목 정리 | ✅ 8개 |
| 구현 작업 없음 (분류만) | ✅ |

---

## 9. 즉시 수정 가능 항목 (Human Decision 불필요)

| 파일 | 수정 내용 |
|---|---|
| `registry/figma/figma-map.json` | Input `figmaNodeId`: `""` → `"6443:4408"` |
| `registry/components/input.json` | `updatedAt` 갱신, `figmaNodeId` 추가, sizes 배열 추가 |

---

## Human Decision 결정 결과 (2026-05-12 확정)

| # | 결정 사항 | 결정 내용 |
|---|---|---|
| HD-1 | 토큰 네이밍 | `--color-form-control-*`를 Semantic 레이어로 유지. `--input-*`은 Component alias (→ form-control 참조) |
| HD-2 | hover 상태 존치 | registry에서 삭제. Figma 미정의 상태는 포함하지 않는다 |
| HD-3 | complete 상태 토큰 | 별도 bg/border 토큰 생성 안 함. 박스 시각은 default와 동일. placeholder ↔ input value text 차이로만 구분 |
| HD-4 | success vs correct | `correct`로 통일 |
| HD-5 | `--select-disabled-border` | Select 컴포넌트 registry로 이동. Input에서 제거 |
| HD-6 | Inputbox_large | Textarea 컴포넌트로 편입 (별도 컴포넌트, Input의 variant 아님) |
| HD-7 | Label 색상 | `--color-text-primary`로 연결 (토큰화 확정) |
| HD-8 | Error state bg | `--input-error-bg` 생성 불필요. default bg와 동일 값이므로 별도 토큰 없음 |

---

## 확정 토큰 구조 (HD 결정 반영)

### Layer 1 — Semantic (`--color-form-control-*`)
Input, Select, Textarea, DatePicker, TimePicker가 공유하는 form-control 전용 Semantic 토큰.

```css
--color-form-control-bg-default:       var(--color-surface-default);    /* #FFFFFF */
--color-form-control-bg-disabled:      var(--color-bg-subtle);           /* #F5F5F5 */

--color-form-control-border-default:   var(--color-border-default);      /* #D9D9D9 */
--color-form-control-border-selected:  var(--color-border-focus);        /* #1D6CEB */
--color-form-control-border-error:     var(--color-status-error);        /* #FF4554 */
--color-form-control-border-correct:   var(--color-status-success);      /* correct 상태 */
--color-form-control-border-disabled:  var(--color-border-subtle);       /* #D9D9D9 */

--color-form-control-text-label:       var(--color-text-primary);        /* #353535 — HD-7 */
--color-form-control-text-default:     var(--color-text-primary);        /* #353535 */
--color-form-control-text-placeholder: var(--color-text-secondary);      /* #757575 */
--color-form-control-text-disabled:    var(--color-text-disabled);       /* #C4C4C4 */
```

### Layer 2 — Component Alias (`--input-*`)
`--color-form-control-*`를 참조하는 Input 전용 alias.

```css
/* Background */
--input-default-bg:   var(--color-form-control-bg-default);
--input-disabled-bg:  var(--color-form-control-bg-disabled);
/* HD-2: hover-bg 삭제 / HD-3: focus-bg, complete-bg 불필요 / HD-8: error-bg 불필요 */

/* Border */
--input-default-border:  var(--color-form-control-border-default);
--input-focus-border:    var(--color-form-control-border-selected);
--input-error-border:    var(--color-form-control-border-error);
--input-correct-border:  var(--color-form-control-border-correct);   /* HD-4: correct */
--input-disabled-border: var(--color-form-control-border-disabled);
/* HD-2: hover-border 삭제 */

/* Text */
--input-label-text:        var(--color-form-control-text-label);      /* HD-7 */
--input-placeholder-text:  var(--color-form-control-text-placeholder);
--input-helper-text:       var(--color-text-state-helper);
--input-error-text:        var(--color-status-error);
--input-correct-text:      var(--color-status-success);               /* HD-4: correct */
--input-disabled-text:     var(--color-form-control-text-disabled);
```

**제거된 토큰:** `--input-hover-bg` `--input-hover-border` `--input-focus-bg` `--input-error-bg` `--select-disabled-border`

---

## 다음 단계

1. ✅ HD-1 ~ HD-8 결정 완료
2. `tokens/semantic.md`에 `color-form-control-*` 카테고리 추가
3. `tokens/component-tokens-extracted.md`에 Input `--input-*` alias 추가
4. `assets/css/tokens.css`에 위 두 레이어 CSS 정의 추가
5. MVP4 구현: Base Input HTML/CSS 하네스 작성
6. MVP4 구현: Input Slots (Label + Helper) 조합 구현
7. Picker / Textarea는 MVP5 이후 별도 MVP에서 구현

---

---

## 재검수 결과 (2026-05-12)

추가 MCP 쿼리 (complete·success 상태 PC/Mobile 각각 확인) 후 발견된 수정 항목.

### 수정 1 — correct/success state border 색상 오류

| 항목 | 초기 분류 | 재검수 결과 |
|---|---|---|
| `--color-form-control-border-correct` | `var(--color-status-success)` (초록 추정) | `var(--color-border-focus)` (#1D6CEB, **파란색**) |

Figma에서 success/correct 상태의 border = `--color/form-control/border/selected` (#1D6CEB).  
correct 전용 border 색상 없음. focus 상태와 동일한 파란 테두리.

### 수정 2 — Label 토큰 네임스페이스 오류

| 항목 | 초기 분류 | 재검수 결과 |
|---|---|---|
| Label 색상 토큰 | `--color-form-control-text-label` (제안) | `--color/text/title/secondary` = #353535 |

Figma 원본 Label 색상은 `--color/text/title/secondary` (Semantic, form-control 네임스페이스 밖).  
값은 `--color-text-primary`와 동일하나, 토큰 경로가 다름.

### 신규 발견 — `--color/text/state/correct`

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color/text/state/correct` | #1D6CEB (파란색) | correct 상태 helper text 색상 |

PC success, Mobile success 모두 helper text에 `--color/text/state/correct` 사용 확인.

### PC vs Mobile 플랫폼 차이 (토큰 레벨)

| 속성 | PC | Mobile |
|---|---|---|
| 높이 | `--sizing/form-control/height/md` (44px) | `--sizing/form-control/height/lg` (48px) |
| 상하 패딩 | `--spacing/padding/block/xxs` (8px) | `--spacing/padding/block/xs` (12px) |
| radius | `--radius/control/sm` (토큰) | `4px` (raw — 토큰 미참조) |
| correct 아이콘 슬롯 | pw-hide 아이콘 유지 | remove(X) 버튼 노출 |
| 좌우 패딩 | 동일 (`inline/sm` 16px + `inline/xs` 12px) | 동일 |
| 색상 토큰 | 동일 | 동일 |

> 색상·border 토큰은 PC/Mobile 완전 동일. 차이는 sizing/spacing뿐.  
> Mobile correct 상태에서 아이콘 슬롯 동작이 다름(remove 버튼).

### 확정 토큰 구조 (재검수 반영 최종)

```css
/* Semantic: --color-form-control-* */
--color-form-control-bg-default:       var(--color-surface-default);     /* white */
--color-form-control-bg-disabled:      var(--color-bg-subtle);           /* #F5F5F5 */
--color-form-control-border-default:   var(--color-border-default);      /* #D9D9D9 */
--color-form-control-border-selected:  var(--color-border-focus);        /* #1D6CEB */
--color-form-control-border-error:     var(--color-status-error);        /* #FF4554 */
--color-form-control-border-correct:   var(--color-border-focus);        /* #1D6CEB ← 수정 */
--color-form-control-border-disabled:  var(--color-border-subtle);       /* #D9D9D9 */
--color-form-control-text-default:     var(--color-text-primary);        /* #353535 */
--color-form-control-text-placeholder: var(--color-text-secondary);      /* #757575 */
--color-form-control-text-disabled:    var(--color-text-disabled);       /* #C4C4C4 */

/* Semantic: 별도 경로 (form-control 외부) */
--color-text-title-secondary:          var(--color-text-primary);        /* #353535 — Label */
--color-text-state-correct:            #1D6CEB;                          /* correct 메시지 ← 신규 */
--color-text-state-helper:             var(--color-text-secondary);      /* #757575 — helper */

/* Component alias: --input-* */
--input-default-bg:      var(--color-form-control-bg-default);
--input-disabled-bg:     var(--color-form-control-bg-disabled);
--input-default-border:  var(--color-form-control-border-default);
--input-focus-border:    var(--color-form-control-border-selected);
--input-error-border:    var(--color-form-control-border-error);
--input-correct-border:  var(--color-form-control-border-correct);   /* = focus border */
--input-disabled-border: var(--color-form-control-border-disabled);
--input-placeholder-text: var(--color-form-control-text-placeholder);
--input-helper-text:     var(--color-text-state-helper);
--input-correct-text:    var(--color-text-state-correct);
--input-error-text:      var(--color-status-error);
--input-disabled-text:   var(--color-form-control-text-disabled);
```

*Re-examined 2026-05-12 — additional MCP queries on complete/success states (PC + Mobile)*

---

*Generated for Pre-MVP4 — Input Component Audit & Classification*
