# Semantic Token 정의서

> 기준: CLAUDE.md · SW UX GUIDE V2.4
> 원본: Figma `semantic` Variable Collection
> 업데이트: 2026-04-29

> **📋 참고 문서** — 이 파일은 인간 가독 참고 문서입니다.  
> 기준 데이터는 `registry/tokens/` JSON 파일입니다. 충돌 시 **registry가 우선**합니다.  
> 이 파일 수정 시 반드시 `assets/css/tokens.css`와 동기화해야 합니다.

---

## 구조 개요

```
color-bg        → 페이지·레이아웃 배경
color-surface   → 컴포넌트 표면 배경 (카드, 모달, 패널)
color-text      → 텍스트 색상
color-border    → 테두리·구분선
color-icon      → 아이콘
color-action    → 인터랙션 액션 (버튼 등 컴포넌트가 참조)
color-status    → UI 피드백 상태 (성공·에러·경고·정보)
color-data      → 데이터 그리드/테이블 전용 상태 (행 hover 등)
color-overlay   → 딤·오버레이
```

> **`color-surface` 안내**
> `color-bg`가 페이지/화면 전체 배경이라면, `color-surface`는 그 위에 올라오는 컴포넌트(카드·패널·모달)의 표면 배경입니다.
> 라이트 모드에서는 둘 다 흰색이라 구분이 어렵지만, 다크 모드에서 레이어 깊이가 명확하게 분리됩니다.

---

## 📌 Dark Foundation 참조 (미확정 — Foundation 등록 대기)

> 아래 값은 Dark Mode 설계안 기반 임시 참조표입니다.
> Figma Foundation에 해당 Foundation가 추가·승인된 후 `var()` 참조로 전환해야 합니다.
> **확정 전까지 이 표의 HEX를 직접 토큰 값으로 사용하지 않습니다.**

> #### ⚠️ Dark Foundation 스텝 방향 규칙
> Dark 팔레트는 Light와 스텝 의미가 반대다.
> **낮은 스텝(0·50·100) = 더 어두운 색(배경), 높은 스텝(700·800·900) = 더 밝은 색(텍스트).**
> 상세 근거 및 체크리스트 → `tokens/foundation.md` 참조

| Dark Foundation | Hex | 비고 |
|----------------|-----|------|
| gray-dark/0 | #0D0E12 | 최심부 (관제 화면 배경) |
| gray-dark/50 | #131418 | 페이지 기본 배경 |
| gray-dark/100 | #1C1D23 | 카드·패널 |
| gray-dark/200 | #24252C | 인풋·섹션 |
| gray-dark/300 | #2E2F38 | 구분선·테이블 헤더 |
| gray-dark/400 | #35363F | 툴바·elevated |
| gray-dark/500 | #3E4049 | hover·active |
| gray-dark/600 | #55575F | placeholder 텍스트 |
| gray-dark/700 | #8A8C96 | 3차 텍스트 (AA 5.0:1) |
| gray-dark/800 | #B8BABF | 보조 텍스트 |
| gray-dark/900 | #ECEDF0 | 주요 텍스트 |
| blue-dark/50 | #0C1D38 | 선택 배경 |
| blue-dark/100 | #112B55 | 선택 행 |
| blue-dark/150 | #1A3D72 | hover accent |
| blue-dark/200 | #214EA0 | pressed |
| blue-dark/250 | #2A65C8 | primary hover |
| blue-dark/300 | #3070D8 | 버튼 기본 |
| blue-dark/350 | #4285E8 | primary accent / focus ring |
| blue-dark/400 | #6FA5F8 | 링크 텍스트 |
| blue-dark/450 | #96BEF9 | soft |
| blue-dark/500 | #C0D8FC | tint |
| status-dark/red | #F06070 | 에러 (dark) |
| status-dark/green | #3FBE7E | 성공 (dark) |
| status-dark/yellow | #E8C048 | 경고 (dark) |

---

## 1. color-bg — 페이지·섹션 배경

**역할**: 페이지 전체, 레이아웃 섹션, 화면 최하위 배경에 사용.
컴포넌트 표면(카드·패널)에는 `color-surface` 사용 권장.

| CSS Variable | Figma 원본 | Light Hex | Light Foundation | Dark Hex | Dark Foundation |
|---|---|---|---|---|---|
| `--color-bg-default` | surface/neutral/bg/base-alt | `#FAFAFA` | color/gray/0 | `#131418` | gray-dark/50 |
| `--color-bg-subtle` | surface/neutral/bg/subtle | `#F5F5F5` | color/gray/50 | `#24252C` | gray-dark/200 |
| `--color-bg-muted` | surface/neutral/bg/strong | `#E9E9E9` | color/gray/100 | `#2E2F38` | gray-dark/300 |
| `--color-bg-elevated` | surface/neutral/bg/support | `#E9E9E9` | color/gray/100 | `#35363F` | gray-dark/400 |
| `--color-bg-home` | surface/base-background/home | `#F5F6FB` | — (Foundation 미등록) | `#131418` | gray-dark/50 |

> ⚠️ `--color-bg-active`, `--color-bg-deepest`, `--color-bg-selected` 3종은 Figma 원본 미확인 상태로 `tokens/review/pending-review.md` 항목 1에서 검토 중입니다.
> `--color-bg-home`의 Light Foundation(`#F5F6FB`)는 기존 팔레트 미등록 값으로 `tokens/review/pending-review.md` 항목 2에서 검토 중입니다.

---

## 2. color-surface — 컴포넌트 표면 배경

**역할**: `color-bg` 위에 올라오는 컴포넌트의 배경. 카드, 패널, 모달, 드롭다운.
라이트에서는 `color-bg`와 동일한 흰색이나, **다크에서 레이어 깊이가 시각적으로 분리됨**.

| CSS Variable | Figma 원본 | 역할 | Light Hex | Light Foundation | Dark Hex | Dark Foundation |
|---|---|---|---|---|---|---|
| `--color-surface-default` | surface/neutral/bg/base | 카드·패널·인풋 기본 표면 | `#FFFFFF` | color/base/white | `#1C1D23` | gray-dark/100 |
| `--color-surface-raised` | surface/base-background/default | 모달·드롭다운·플로팅 표면 | `#FFFFFF` | color/base/white | `#35363F` | gray-dark/400 |

---

## 3. color-text — 텍스트

| CSS Variable | Figma 원본 | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 |
|---|---|---|---|---|---|---|
| `--color-text-primary` | color/text/title/primary | `#202020` | color/gray/900 | `#ECEDF0` | gray-dark/900 | 제목·주요 본문 |
| `--color-text-secondary` | color/text/title/secondary, body/primary | `#353535` | color/gray/800 | `#B8BABF` | gray-dark/800 | 서브타이틀·일반 본문 |
| `--color-text-tertiary` | color/text/title/tertiary, body/secondary | `#555555` | color/gray/600 | `#8A8C96` | gray-dark/700 | 보조 텍스트 |
| `--color-text-caption` | color/text/body/tertiary | `#757575` | color/gray/500 | `#8A8C96` | gray-dark/700 | 캡션·힌트 |
| `--color-text-placeholder` | color/text/state/placeholder | `#757575` | color/gray/500 | `#55575F` | gray-dark/600 | 플레이스홀더 공통 색상 |
| `--color-text-helper` | color/text/state/helper | `#9D9D9D` | color/gray/400 | `#55575F` | gray-dark/600 | 도움말 텍스트 |
| `--color-text-link` | color/text/state/accent | `#1D6CEB` | color/blue/400 | `#6FA5F8` | blue-dark/400 | 링크·액센트 |
| `--color-text-correct` | color/text/state/correct | `#1D6CEB` | color/blue/400 | `#6FA5F8` | blue-dark/400 | 올바른 입력 피드백 |
| `--color-text-danger` | color/text/state/caution | `#FF4554` | color/red/300 | `#F06070` | status-dark/red | 에러·위험 메시지 |
| `--color-text-disabled` | color/text/state/disabled | `#C4C4C4` | color/gray/300 | `#35363F` | gray-dark/400 | 비활성 텍스트 |
| `--color-text-inverse` | color/text/state/accent-alt | `#FFFFFF` | color/base/white | `#FFFFFF` | color/base/white | 색상 배경 위 텍스트 |

---

## 4. color-border — 테두리·구분선

> 다크모드 border는 고정 hex 대신 rgba를 사용합니다. 배경 명도에 무관하게 일정한 레이어 깊이를 표현할 수 있습니다.

| CSS Variable | Figma 원본 | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 |
|---|---|---|---|---|---|---|
| `--color-border-subtle` | color/line/gray/subtle | `#E9E9E9` | color/gray/100 | `rgba(255,255,255,0.04)` | — (rgba) | 미세 구분선 |
| `--color-border-default` | color/line/gray/default | `#D9D9D9` | color/gray/200 | `rgba(255,255,255,0.07)` | — (rgba) | 기본 테두리 |
| `--color-border-disabled` | color/button/border/disabled | `#D9D9D9` | color/gray/200 | `rgba(255,255,255,0.07)` | — (rgba) | 비활성(disabled) 컴포넌트 테두리 |
| `--color-border-strong` | — (Figma 확인 필요) | `#C4C4C4` | color/gray/300 | `rgba(255,255,255,0.12)` | — (rgba) | 강조 테두리 |
| `--color-border-emphasis` | color/line/gray/strong | `#353535` | color/gray/800 | `rgba(255,255,255,0.20)` | — (rgba) | 헤비 구분선·선택 강조선 |
| `--color-border-focus` | color/line/blue | `#1D6CEB` | color/blue/400 | `#4285E8` | blue-dark/350 | 포커스 링 (접근성 필수) |
| `--color-border-white` | color/line/white | `#FFFFFF` | color/base/white | `#FFFFFF` | color/base/white | 흰 배경 위 구분선 |
| `--color-border-danger` | color/form-control/border/error | `#FF4554` | color/red/300 | `#F06070` | status-dark/red | 에러 인풋 테두리 |
| `--color-border-correct` | color/form-control/border/correct | `#1D6CEB` | color/blue/400 | `#4285E8` | blue-dark/350 | 올바른 입력 피드백 테두리 |

---

## 4-B. color-control-border — 컨트롤 컴포넌트 전용 테두리

> `color-border-*`(디바이더·구분선)와 완전 독립 그룹. Checkbox, Radio 등 인터랙티브 컨트롤의 박스/원 테두리에만 사용.
> Foundation Foundation를 직접 참조하므로 다크 값을 별도로 튜닝할 수 있다.
> Dark 값은 **candidate** 상태 — 화면 검증 후 확정 예정.

| CSS Variable | Light Foundation | Light Hex | Dark Foundation | Dark Hex | 용도 |
|---|---|---|---|---|---|
| `--color-control-border-default` | color/gray/200 | `#D9D9D9` | color/gray-dark/500 | `#3E4049` (candidate) | 기본 상태 테두리 |
| `--color-control-border-hover` | color/blue/400 | `#1D6CEB` | color/blue-dark/300 | `#3B82F6` (candidate) | hover 강조 테두리 |
| `--color-control-border-selected` | color/blue/400 | `#1D6CEB` | color/blue-dark/300 | `#3B82F6` (candidate) | checked/selected 테두리 |
| `--color-control-border-disabled` | color/gray/300 | `#C4C4C4` | color/gray-dark/300 | `#2E2F38` (candidate) | disabled 상태 테두리 |
| `--color-control-bg-hover` | --color-bg-subtle | `#F5F5F5` | --color-bg-subtle (dark) | `#26272F` (candidate) | hover 시 control 배경 — Figma: color/control/bg/hover |

---

## 5. color-icon — 아이콘

| CSS Variable | Figma 원본 | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 |
|---|---|---|---|---|---|---|
| `--color-icon-default` | color/icon/gray | `#757575` | color/gray/500 | `#8A8C96` | gray-dark/700 | 기본 아이콘 |
| `--color-icon-muted` | color/icon/gray-light | `#C4C4C4` | color/gray/300 | `#35363F` | gray-dark/400 | 비강조·보조 아이콘 |
| `--color-icon-emphasis` | color/icon/gray-dark | `#353535` | color/gray/800 | `#B8BABF` | gray-dark/800 | 강조 아이콘 |
| `--color-icon-accent` | color/icon/blue | `#1D6CEB` | color/blue/400 | `#6FA5F8` | blue-dark/400 | 액션·링크 아이콘 |
| `--color-icon-inverse` | color/icon/white | `#FFFFFF` | color/base/white | `#FFFFFF` | color/base/white | 색상 배경 위 아이콘 |
| `--color-icon-danger` | color/icon/red | `#FF4554` | color/red/300 | `#F06070` | status-dark/red | 에러·위험 아이콘 |

---

## 6. color-action — 인터랙션 액션

> 컴포넌트 Token이 이 레이어를 `var()`로 참조합니다. 직접 스타일에 사용하지 않습니다.

| CSS Variable | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 |
|---|---|---|---|---|---|
| `--color-action-primary-default` | `#1D6CEB` | color/blue/400 | `#3070D8` | blue-dark/300 | Primary CTA 기본 |
| `--color-action-primary-hover` | `#2158C8` | color/blue/450 | `#2A65C8` | blue-dark/250 | Primary hover |
| `--color-action-primary-pressed` | `#2747B9` | color/blue/500 | `#214EA0` | blue-dark/200 | Primary pressed |
| `--color-action-primary-text` | `#FFFFFF` | color/base/white | `#FFFFFF` | color/base/white | Primary 버튼 라벨 |
| `--color-action-primary-subtle` | `#E2F1FF` | color/blue/50 | `#112B55` | blue-dark/100 | 선택·강조 배경 |

---

## 7. color-status — 상태 색상

### 7-1. UI 피드백 상태 (폼 검증·알림)

> 서비스 확정값 기준. success는 현재 서비스에서 blue 계열을 사용 중이며 이를 기준으로 정의.

| CSS Variable | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 |
|---|---|---|---|---|---|
| `--color-status-success` | `#1D6CEB` | color/blue/400 | `#4285E8` | blue-dark/350 | 성공·완료·올바름 |
| `--color-status-error` | `#E50533` | color/red/400 | `#F06070` | status-dark/red | 에러·실패 |
| `--color-status-warning` | `#DBA400` | color/yellow/400 | `#E8C048` | status-dark/yellow | 경고 |
| `--color-status-info` | `#757575` | color/gray/500 | `#8A8C96` | gray-dark/700 | 정보 |

### 7-2. 서비스·도메인 상태 (관제 시스템 장치 상태)

> ⚠️ 이 섹션의 `color-domain-status-*` 토큰 8종은 `tokens/review/pending-review.md` 항목 4에서 **Domain Token 레이어 이동** 검토 중입니다.
> 다크 값 미정의 상태이며, 승인 후 `tokens/domain/status.md`로 분리됩니다.

---

## 8. color-overlay — 오버레이·딤

> rgba 직접 사용 허용 — alpha 채널이 포함된 값은 Foundation Foundation로 alias 불가.

| CSS Variable | Figma 원본 | Light | Dark |
|---|---|---|---|
| `--color-overlay` | color/overlay | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.75)` |

---

## 9. Spacing · Sizing · Radius 토큰

> Figma `semantic` 컬렉션에 포함되어 있으나, 이는 Foundation Foundation를 역할 기반으로 매핑한 **Semantic Spacing** 토큰입니다.
> Foundation의 `spacing/4`, `spacing/8` 등을 참조하므로 구조는 올바릅니다.

### 9-1. Spacing

| CSS Variable | 역할 | 값 | Foundation 참조 |
|---|---|---|---|
| `--spacing-padding-block-xxs` | 블록 패딩 최소 | 8px | spacing/8 |
| `--spacing-padding-block-xs` | 블록 패딩 소 | 12px | spacing/12 |
| `--spacing-padding-block-sm` | 블록 패딩 중소 | 16px | spacing/16 |
| `--spacing-padding-block-md` | 블록 패딩 중 | 20px | spacing/20 |
| `--spacing-padding-block-lg` | 블록 패딩 대 | 24px | spacing/24 |
| `--spacing-padding-inline-xxs` | 인라인 패딩 최소 | 8px | spacing/8 |
| `--spacing-padding-inline-xs` | 인라인 패딩 소 | 12px | spacing/12 |
| `--spacing-padding-inline-sm` | 인라인 패딩 중소 | 16px | spacing/16 |
| `--spacing-padding-inline-md` | 인라인 패딩 중 | 20px | spacing/20 |
| `--spacing-padding-inline-lg` | 인라인 패딩 대 | 24px | spacing/24 |
| `--spacing-section-xs` | 섹션 간격 최소 | 16px | spacing/16 |
| `--spacing-section-sm` | 섹션 간격 소 | 20px | spacing/20 |
| `--spacing-section-md` | 섹션 간격 중 | 24px | spacing/24 |
| `--spacing-section-lg` | 섹션 간격 대 | 32px | spacing/32 |
| `--spacing-section-xl` | 섹션 간격 특대 | 40px | spacing/40 |
| `--spacing-section-xxl` | 섹션 간격 최대 | 48px | spacing/48 |
| `--spacing-stack-xs` | 수직 스택 소 | 12px | spacing/12 |
| `--spacing-stack-sm` | 수직 스택 중소 | 16px | spacing/16 |
| `--spacing-stack-md` | 수직 스택 중 | 20px | spacing/20 |
| `--spacing-stack-lg` | 수직 스택 대 | 24px | spacing/24 |
| `--spacing-cluster-xxs` | 인라인 그룹 최소 | 8px | spacing/8 |
| `--spacing-cluster-xs` | 인라인 그룹 소 | 12px | spacing/12 |
| `--spacing-cluster-sm` | 인라인 그룹 중소 | 16px | spacing/16 |
| `--spacing-cluster-md` | 인라인 그룹 중 | 20px | spacing/20 |
| `--spacing-label-gap-inline-sm` | 레이블 인라인 간격 소 | 8px | spacing/8 |
| `--spacing-label-gap-inline-md` | 레이블 인라인 간격 중 | 12px | spacing/12 |
| `--spacing-label-gap-inline-lg` | 레이블 인라인 간격 대 | 16px | spacing/16 |
| `--spacing-label-gap-block-sm` | 레이블 블록 간격 소 | 4px | spacing/4 |
| `--spacing-label-gap-block-md` | 레이블 블록 간격 중 | 8px | spacing/8 |

### 9-2. Sizing

| CSS Variable | 역할 | 값 |
|---|---|---|
| `--sizing-form-control-height-xxs` | 인풋 높이 최소 | 28px |
| `--sizing-form-control-height-xs` | 인풋 높이 소 | 34px |
| `--sizing-form-control-height-md` | 인풋 높이 중 | 44px |
| `--sizing-form-control-height-lg` | 인풋 높이 대 | 48px |
| `--sizing-form-control-dataview-height-sm` | 데이터뷰 인풋 소 | 28px |
| `--sizing-form-control-dataview-height-md` | 데이터뷰 인풋 중 | 32px |
| `--sizing-button-height-xs` | 버튼 높이 최소 | 34px |
| `--sizing-button-height-sm` | 버튼 높이 소 | 40px |
| `--sizing-button-height-md` | 버튼 높이 중 | 44px |
| `--sizing-button-height-lg` | 버튼 높이 대 | 48px |
| `--sizing-button-min-width` | 버튼 최소 너비 | 80px |
| `--sizing-chip-height-sm` | 칩 높이 소 | 28px |
| `--sizing-chip-height-md` | 칩 높이 중 | 30px |
| `--sizing-chip-height-lg` | 칩 높이 대 | 34px |
| `--sizing-table-row-height-xs` | 테이블 행 높이 최소 | 34px |
| `--sizing-table-row-height-sm` | 테이블 행 높이 소 | 38px |
| `--sizing-table-row-height-md` | 테이블 행 높이 중 | 44px |
| `--sizing-icon-10` | 아이콘 10 | 10px |
| `--sizing-icon-16` | 아이콘 16 | 16px |
| `--sizing-icon-18` | 아이콘 18 | 18px |
| `--sizing-icon-20` | 아이콘 20 | 20px |
| `--sizing-icon-24` | 아이콘 24 | 24px |
| `--sizing-icon-28` | 아이콘 28 | 28px |
| `--sizing-icon-32` | 아이콘 32 | 32px |

### 9-3. Radius · Border Width

| CSS Variable | 역할 | 값 |
|---|---|---|
| `--radius-control-xs` | 컨트롤 radius 최소 | 2px |
| `--radius-control-sm` | 컨트롤 radius 소 | 4px |
| `--radius-button-md` | 버튼 radius | 4px |
| `--radius-card-md` | 카드 radius | 10px |
| `--radius-modal-md` | 모달 radius | 8px |
| `--border-width-default` | 기본 선 두께 | 1px |
| `--border-width-strong` | 강조 선 두께 | 2px |

---

## 10. CSS 구현 참조

```css
/* ── Light (기본) ── */
:root {
  /* color-bg */
  --color-bg-default:    #FAFAFA;
  --color-bg-subtle:     #F5F5F5;
  --color-bg-muted:      #E9E9E9;
  --color-bg-elevated:   #E9E9E9;
  --color-bg-home:       #F5F6FB;

  /* color-surface */
  --color-surface-default: #FFFFFF;
  --color-surface-raised:  #FFFFFF;

  /* color-text */
  --color-text-primary:     #202020;
  --color-text-secondary:   #353535;
  --color-text-tertiary:    #555555;
  --color-text-caption:     #757575;
  --color-text-placeholder: #757575;
  --color-text-helper:      #9D9D9D;
  --color-text-link:        #1D6CEB;
  --color-text-correct:     #1D6CEB;
  --color-text-danger:      #FF4554;
  --color-text-disabled:    #C4C4C4;
  --color-text-inverse:     #FFFFFF;

  /* color-border */
  --color-border-subtle:    #E9E9E9;
  --color-border-default:   #D9D9D9;
  --color-border-disabled:  #D9D9D9;
  --color-border-strong:    #C4C4C4;
  --color-border-emphasis:  #353535;
  --color-border-focus:     #1D6CEB;
  --color-border-white:     #FFFFFF;
  --color-border-danger:    #FF4554;
  --color-border-correct:   #1D6CEB;

  /* color-icon */
  --color-icon-default:  #757575;
  --color-icon-muted:    #C4C4C4;
  --color-icon-emphasis: #353535;
  --color-icon-accent:   #1D6CEB;
  --color-icon-inverse:  #FFFFFF;
  --color-icon-danger:   #FF4554;

  /* color-action */
  --color-action-primary-default: #1D6CEB;
  --color-action-primary-hover:   #2158C8;
  --color-action-primary-pressed: #2747B9;
  --color-action-primary-text:    #FFFFFF;
  --color-action-primary-subtle:  #E2F1FF;

  /* color-status */
  --color-status-success: #1D6CEB;
  --color-status-error:   #E50533;
  --color-status-warning: #DBA400;
  --color-status-info:    #757575;

  /* color-form-control */
  --color-form-control-bg-default:          var(--color-surface-default);  /* #FFFFFF */
  --color-form-control-bg-disabled:         var(--color-bg-subtle);        /* #F5F5F5 */
  --color-form-control-border-default:      var(--color-control-border-default);   /* #D9D9D9 — checkbox·radio와 동일 foundation */
  --color-form-control-border-selected:     var(--color-border-focus);     /* #1D6CEB */
  --color-form-control-border-error:        var(--color-status-error);     /* #E50533 */
  --color-form-control-border-correct:      var(--color-border-focus);     /* #1D6CEB */
  --color-form-control-border-disabled:     var(--color-border-subtle);    /* #F0F0F0 */
  --color-form-control-text-default:        var(--color-text-secondary);   /* #353535 */
  --color-form-control-text-placeholder:    var(--color-text-placeholder);  /* #757575 */
  --color-form-control-text-disabled:       var(--color-text-disabled);    /* #BDBDBD */
  --color-form-control-label-default:       var(--color-text-secondary);   /* #353535 — TimePicker select "시"/"분" 라벨 */
  --color-form-control-label-disabled:      var(--color-text-disabled);    /* #BDBDBD */

  /* color-text-state */
  --color-text-state-helper:  var(--color-text-secondary);  /* #353535 */
  --color-text-state-correct: #1D6CEB;  /* Figma confirmed: --color/text/state/correct = blue-400 */
  --color-text-state-error:   var(--color-status-error);    /* #E50533 */

  /* color-control-border (컨트롤 컴포넌트 전용 — Foundation 직접 참조) */
  --color-control-border-default:  var(--color-gray-200);  /* #D9D9D9 */
  --color-control-border-hover:    var(--color-blue-400);  /* #1D6CEB */
  --color-control-border-selected: var(--color-blue-400);  /* #1D6CEB */
  --color-control-border-disabled: var(--color-gray-300);  /* #C4C4C4 */

  /* color-data (데이터 그리드/테이블 전용 — Figma: color/data/state/*) */
  --color-data-state-hover: var(--color-blue-50);  /* #E2F1FF — 행 hover 배경 */

  /* color-overlay */
  --color-overlay: rgba(0, 0, 0, 0.5);
}

/* ── Dark ── */
[data-theme="dark"] {
  /* color-bg */
  --color-bg-default:  #131418;
  --color-bg-subtle:   #24252C;
  --color-bg-muted:    #2E2F38;
  --color-bg-elevated: #35363F;
  --color-bg-home:     #131418;

  /* color-surface */
  --color-surface-default: #1C1D23;
  --color-surface-raised:  #35363F;

  /* color-text */
  --color-text-primary:     #ECEDF0;
  --color-text-secondary:   #B8BABF;
  --color-text-tertiary:    #8A8C96;
  --color-text-caption:     #8A8C96;
  --color-text-placeholder: #55575F;
  --color-text-helper:      #55575F;
  --color-text-link:        #6FA5F8;
  --color-text-correct:     #6FA5F8;
  --color-text-danger:      #F06070;
  --color-text-disabled:    #35363F;
  --color-text-inverse:     #FFFFFF;

  /* color-border */
  --color-border-subtle:   rgba(255, 255, 255, 0.04);
  --color-border-default:  rgba(255, 255, 255, 0.07);
  --color-border-disabled: rgba(255, 255, 255, 0.07);
  --color-border-strong:   rgba(255, 255, 255, 0.12);
  --color-border-emphasis: rgba(255, 255, 255, 0.20);
  --color-border-focus:    #4285E8;
  --color-border-white:    #FFFFFF;
  --color-border-danger:   #F06070;
  --color-border-correct:  #4285E8;

  /* color-icon */
  --color-icon-default:  #8A8C96;
  --color-icon-muted:    #35363F;
  --color-icon-emphasis: #B8BABF;
  --color-icon-accent:   #6FA5F8;
  --color-icon-inverse:  #FFFFFF;
  --color-icon-danger:   #F06070;

  /* color-action */
  --color-action-primary-default: #3070D8;
  --color-action-primary-hover:   #2A65C8;
  --color-action-primary-pressed: #214EA0;
  --color-action-primary-text:    #FFFFFF;
  --color-action-primary-subtle:  #112B55;

  /* color-status */
  --color-status-success: #3FBE7E;
  --color-status-error:   #F06070;
  --color-status-warning: #E8C048;
  --color-status-info:    #8A8C96;

  /* color-text-state (dark) */
  --color-text-state-correct: #3D9BF2;  /* blue-dark-400 — Figma dark correct text */

  /* color-control-border (dark — candidate) */
  --color-control-border-default:  var(--color-gray-dark-500);  /* #3E4049 — candidate */
  --color-control-border-hover:    var(--color-blue-dark-300);  /* #3B82F6 — candidate */
  --color-control-border-selected: var(--color-blue-dark-300);  /* #3B82F6 — candidate */
  --color-control-border-disabled: var(--color-gray-dark-300);  /* #2E2F38 — candidate */

  /* color-data (dark — candidate: Figma dark 미확인) */
  --color-data-state-hover: var(--color-blue-dark-100);  /* #112B55 — candidate, HD-Table-1 */

  /* color-overlay */
  --color-overlay: rgba(0, 0, 0, 0.75);
}
```
