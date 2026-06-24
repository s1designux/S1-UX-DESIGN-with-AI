# Semantic Token 정의서

> 기준: CLAUDE.md · SW UX GUIDE V2.4
> 원본: Figma `semantic` Variable Collection
> 업데이트: 2026-06-23 — Variables(vars-data.ts) 기준 정합:
> - **그룹 A 23종 제거** (Variables 미존재 generic): color-action·color-status·generic color-border·bg-home·control/form-control-border-hover.
> - **그룹 B 개명** (이름만 바뀐 것): text→title/body/state · icon 역할명→색상명 · color-data→color-table. text-readonly 폐지(form-control 전용), text-danger·text-state-error→text-state-caution 통합(결정 #2·#3).
> - 끊긴 참조는 전부 실제 Variables Foundation 값으로 재연결. §10 하드코딩 CSS 덤프는 정본(tokens.css) 포인터로 교체(드리프트원 제거).
> - **네이밍 기준 교정(2026-06-23):** 레거시 수입 잔재를 기준에 맞춤 — `navigation/background`→`navigation/bg`(45개 -bg 관례 통일) · `table/border/light`→`table/border/default` · `table/border/emphasis` 제거(고아·미사용) · `icon/brand-ci` 별칭 제거 예정(빌더 Foundation 직참조로 전환).

> **📋 참고 문서** — 이 파일은 인간 가독 참고 문서입니다.  
> 기준 데이터는 `registry/tokens/` JSON 파일입니다. 충돌 시 **registry가 우선**합니다.  
> 이 파일 수정 시 반드시 `assets/css/tokens.css`와 동기화해야 합니다.

---

## 구조 개요

```
color-bg        → 페이지·레이아웃 배경
color-surface   → 컴포넌트 표면 배경 (카드, 모달, 패널)
color-text      → 텍스트 색상 (title·body·state 3트랙)
color-icon      → 아이콘 (색상명)
color-table     → 테이블·데이터 그리드 전용 (구 color-data)
color-overlay   → 딤·오버레이
```

> **🧹 2026-06-23 정리** — 아래 generic 그룹은 현재 Variables(vars-data.ts)에 존재하지 않아 제거했다(그룹 A 23종):
> - `color-action-*`(버튼은 `color-button-*`로 직접 정의) · `color-status-*`(피드백은 `color-text-state-*`·`color-status-card-*`로 분산)
> - generic `color-border-*`(테두리는 `color-line-*` 및 컴포넌트별 `*-border-*`로 분산) · `bg-home`·`control-border-hover`·`form-control-border-hover`
> 이 토큰들을 참조하던 살아있는 행은 실제 Variables가 쓰는 Foundation 값으로 재연결했다.

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
| `--color-bg-selected` | — (Figma 원본 미확인) | `#E2F1FF` | color/blue/50 | `#112B55` | blue-dark/100 |

> `--color-bg-selected` — HD-Table-2 확정(2026-05-20): 선택 행 = blue-50(L) / blue-dark-100(D), hover(gray-50)와 시각 구분 확정.
> ~~`--color-bg-active`·`--color-bg-deepest`·`--color-bg-home`~~ — Variables 미존재로 제거(2026-06-23, 그룹 A).

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

> Variables는 텍스트를 **제목(title)·본문(body)·상태(state)** 3개 트랙으로 나눈다.
> title·body는 primary·secondary 값이 같고 **tertiary에서만 갈린다**(title=gray/600, body=gray/500).

| CSS Variable | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 |
|---|---|---|---|---|---|
| `--color-text-title-primary` | `#202020` | color/gray/900 | `#ECEDF0` | gray-dark/900 | 제목 주요 |
| `--color-text-title-secondary` | `#353535` | color/gray/800 | `#B8BABF` | gray-dark/800 | 제목 보조 |
| `--color-text-title-tertiary` | `#555555` | color/gray/600 | `#8A8C96` | gray-dark/700 | 제목 3차 |
| `--color-text-body-primary` | `#202020` | color/gray/900 | `#ECEDF0` | gray-dark/900 | 본문 주요 |
| `--color-text-body-secondary` | `#353535` | color/gray/800 | `#B8BABF` | gray-dark/800 | 본문 보조 |
| `--color-text-body-tertiary` | `#757575` | color/gray/500 | `#8A8C96` | gray-dark/700 | 본문 3차·캡션 |
| `--color-text-state-accent` | `#1D6CEB` | color/blue/400 | `#3070D8` | blue-dark/300 | 링크·액센트 |
| `--color-text-state-accent-alt` | `#FFFFFF` | color/base/white | `#FFFFFF` | color/base/white | 색상 배경 위 텍스트 |
| `--color-text-state-caption` | `#757575` | color/gray/500 | `#B8BABF` | gray-dark/800 | 캡션 |
| `--color-text-state-caution` | `#FF4554` | color/red/300 | `#F06070` | red-dark/350 | 에러·주의 (구 `text-danger`·`text-state-error` 통합) |
| `--color-text-state-correct` | `#1D6CEB` | color/blue/400 | `#3070D8` | blue-dark/300 | 올바른 입력 |
| `--color-text-state-disabled` | `#C4C4C4` | color/gray/300 | `#35363F` | gray-dark/400 | 비활성 |
| `--color-text-state-helper` | `#9D9D9D` | color/gray/400 | `#55575F` | gray-dark/600 | 도움말 |
| `--color-text-state-placeholder` | `#757575` | color/gray/500 | `#8A8C96` | gray-dark/700 | 플레이스홀더 |

> 🧹 **구 단순명 → 새 이름 매핑(2026-06-23, 그룹 B):** `text-primary`→`title-primary`(/`body-primary`) · `text-secondary`→`title/body-secondary` · `text-tertiary`→`title-tertiary` · `text-caption`→`body-tertiary` · `text-placeholder`→`state-placeholder` · `text-helper`→`state-helper` · `text-link`→`state-accent` · `text-correct`→`state-correct` · `text-disabled`→`state-disabled` · `text-inverse`→`state-accent-alt` · `text-danger`·`text-state-error`→**`state-caution` 통합** · ~~`text-readonly`~~ 폐지 → `--color-form-control-text-read-only` 전용(§4-A).

---

## 4. color-border — (제거됨, 2026-06-23)

> ~~generic `--color-border-*` 9종(subtle·default·disabled·strong·emphasis·focus·white·danger·correct)~~ 은 현재 Variables에 존재하지 않아 제거했다(그룹 A).
> 테두리·구분선 역할은 다음으로 분산되어 있다:
> - **구분선/라인** → `--color-line-*` (gray-default·gray-strong·gray-subtle·blue·white)
> - **컴포넌트 테두리** → `--color-button-border-*` · `--color-control-border-*` · `--color-form-control-border-*` · `--color-table-border-*` · `--color-date-picker-border-*`
> - **포커스/선택** → `--color-form-control-border-selected`(= blue-400)

---

## 4-A. color-form-control — 폼 컨트롤 전용 (Input·Select·Textarea·DatePicker·TimePicker 공용)

> 입력 필드 군의 배경·테두리·텍스트·라벨·아이콘 공용 토큰. Component Token(`--input-*`, `--dropdown-*` 등)이 이 레이어를 참조한다.
> MVP4-token(2026-05-18) 신설. ND-7(2026-05-19) registry 등록.
> Dark 값이 별도 override 없는 항목은 참조 Semantic의 Dark 값을 상속한다.

| CSS Variable | Light 참조 | Light Hex | Dark 참조 | Dark Hex | 용도 |
|---|---|---|---|---|---|
| `--color-form-control-bg-default` | `--color-surface-default` | `#FFFFFF` | `--color-gray-dark-50` (override) | `#131418` | 입력 필드 기본 배경 |
| `--color-form-control-bg-hover` | `--color-surface-default` | `#FFFFFF` | `--color-bg-muted` (override) | `#2E2F38` | hover 시 배경 (light에선 default와 동일) |
| `--color-form-control-bg-disabled` | `--color-bg-subtle` | `#F5F5F5` | `--color-surface-default` (override) | `#1C1D23` | 비활성 배경 |
| `--color-form-control-border-default` | `--color-control-border-default` | `#D9D9D9` | `--color-gray-dark-500` | `#3E4049` | 기본 테두리 |
| `--color-form-control-border-selected` | `--color-blue-400` | `#1D6CEB` | `--color-blue-dark-350` | `#4285E8` | 포커스·선택 상태 테두리 |
| `--color-form-control-border-error` | `--color-red-400` | `#E50533` | `--color-red-dark-350` | `#F06070` | 오류 상태 테두리 |
| `--color-form-control-border-correct` | `--color-blue-400` | `#1D6CEB` | `--color-blue-dark-350` | `#4285E8` | correct 상태 테두리 (HD-4: focus와 동일) |
| `--color-form-control-border-disabled` | `--color-gray-100` | `#E9E9E9` | `--color-gray-dark-200` | `#24252C` | 비활성 테두리 |
| `--color-form-control-text-default` | `--color-gray-800` | `#353535` | `--color-gray-dark-800` | `#B8BABF` | 입력된 텍스트 (gray/800) |
| `--color-form-control-text-placeholder` | `--color-gray-500` | `#757575` | `--color-gray-dark-600` | `#55575F` | 플레이스홀더 |
| `--color-form-control-text-disabled` | `--color-gray-300` | `#C4C4C4` | `--color-gray-dark-600` | `#55575F` | 비활성 텍스트 |
| `--color-form-control-label-default` | `--color-gray-800` | `#353535` | `--color-gray-dark-800` | `#B8BABF` | TimePicker "시/분" 등 form-control 라벨 |
| `--color-form-control-label-disabled` | `--color-gray-300` | `#C4C4C4` | `--color-gray-dark-600` | `#55575F` | 비활성 라벨 |
| `--color-form-control-icon-default` | `--color-gray-800` | `#353535` | `--color-gray-dark-700` (override) | `#8A8C96` | form-control 기본 아이콘 |

---

## 4-A-1. 폼 필드 도움말 텍스트 — color-text-state 사용

> 입력 필드 하단 도움말 텍스트는 §3의 **state 트랙**을 그대로 사용한다(별도 토큰 없음):
> - 중립 도움말 → `--color-text-state-helper` (gray/400)
> - 올바름 → `--color-text-state-correct` (blue/400)
> - **오류·주의 → `--color-text-state-caution`** (red/300) — 구 `--color-text-state-error`를 caution으로 **통합**(2026-06-23, 결정 #3).

---

## 4-B. color-control-border — 컨트롤 컴포넌트 전용 테두리

> `color-line-*`(디바이더·구분선)와 완전 독립 그룹. Checkbox, Radio 등 인터랙티브 컨트롤의 박스/원 테두리에만 사용.
> Foundation Foundation를 직접 참조하므로 다크 값을 별도로 튜닝할 수 있다.
> Dark 값은 **candidate** 상태 — 화면 검증 후 확정 예정.

| CSS Variable | Light Foundation | Light Hex | Dark Foundation | Dark Hex | 용도 |
|---|---|---|---|---|---|
| `--color-control-border-default` | color/gray/200 | `#D9D9D9` | color/gray-dark/500 | `#3E4049` (candidate) | 기본 상태 테두리 |
| `--color-control-border-selected` | color/blue/400 | `#1D6CEB` | color/blue-dark/300 | `#3B82F6` (candidate) | checked/selected 테두리 |
| `--color-control-border-disabled` | color/gray/300 | `#C4C4C4` | color/gray-dark/300 | `#2E2F38` (candidate) | disabled 상태 테두리 |
| `--color-control-bg-hover` | --color-bg-subtle | `#F5F5F5` | --color-bg-subtle (dark) | `#26272F` (candidate) | hover 시 control 배경 — Figma: color/control/bg/hover |

---

## 5. color-icon — 아이콘

> Variables는 아이콘을 **색상명**으로 정의한다(역할명 아님). 옛 역할명은 괄호로 병기.

| CSS Variable | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 용도 (구 역할명) |
|---|---|---|---|---|---|
| `--color-icon-gray` | `#757575` | color/gray/500 | `#8A8C96` | gray-dark/700 | 기본 아이콘 (구 `-default`) |
| `--color-icon-gray-light` | `#C4C4C4` | color/gray/300 | `#35363F` | gray-dark/400 | 보조 아이콘 (구 `-muted`) |
| `--color-icon-gray-dark` | `#353535` | color/gray/800 | `#B8BABF` | gray-dark/800 | 강조 아이콘 (구 `-emphasis`) |
| `--color-icon-blue` | `#1D6CEB` | color/blue/400 | `#3070D8` | blue-dark/300 | 액션·링크 아이콘 (구 `-accent`) |
| `--color-icon-white` | `#FFFFFF` | color/base/white | `#FFFFFF` | color/base/white | 색상 배경 위 아이콘 (구 `-inverse`) |
| `--color-icon-red` | `#FF4554` | color/red/300 | `#F06070` | red-dark/350 | 에러·위험 아이콘 (구 `-danger`) |

> ~~`--color-icon-brand-ci`~~ 제거(2026-06-23) — CI 로고색은 Foundation `brand/ci`를 빌더가 **직접 바인딩**한다(빌더 우회용 Semantic 별칭 폐지).
> 🤔 **참고:** 색상명 방식(icon-blue)은 역할 기반 명명 원칙과는 거리가 있다. 현 Variables 기준으로 문서를 맞췄으며, 역할명 복원은 별도 결정 사항.

---

## 6. color-action — (제거됨, 2026-06-23)

> ~~`--color-action-primary-default`·`-hover`·`-pressed`·`-text`·`-subtle`~~ generic action 레이어는 현재 Variables에 존재하지 않아 제거했다(그룹 A).
> Primary CTA 색은 버튼 컴포넌트 토큰이 **직접** 정의한다 → `--color-button-bg-primary--default`(= blue-400 #1D6CEB) · `--color-button-bg-primary--hover`(= blue-500). 라벨은 `--color-button-label-primary--default`(= base/white).
> 선택·강조 배경(구 `action-primary-subtle`)은 `--color-bg-selected`(= blue-50).

---

## 7. color-status — 상태 색상

### 7-1. UI 피드백 상태 — (제거됨, 2026-06-23)

> ~~`--color-status-success`·`-error`·`-warning`·`-info`~~ generic status 레이어는 현재 Variables에 존재하지 않아 제거했다(그룹 A). 피드백 색은 다음으로 분산되어 있다:
> - 오류 텍스트/테두리 → `--color-text-state-caution`(= red-300) · `--color-form-control-border-error`(= red-400)
> - 올바름 → `--color-text-state-correct`(= blue-400) · `--color-form-control-border-correct`(= blue-400)
> - 상태 카드 텍스트 → `--color-status-card-text-*`
>
> 참고: 라이트 성공색은 과거 blue(#1D6CEB) 기준이었다(현 서비스 관행). 별도 success 토큰이 필요해지면 신설 검토.

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

## 8-2. color-table — 테이블·데이터 그리드 전용

**역할**: 테이블/데이터 그리드의 셀 상태 배경·헤더·구분선. **구 `color-data-*` → `color-table-*` 개명**(2026-06-23, 그룹 B).

| CSS Variable | Light Hex | Light Foundation | Dark Hex | Dark Foundation | 구 이름 |
|---|---|---|---|---|---|
| `--color-table-cell-default` | `#FFFFFF` | color/base/white | `#1C1D23` | gray-dark/100 | data-state-default |
| `--color-table-cell-hover` | `#F5F5F5` | color/gray/50 | `#24252C` | gray-dark/200 | data-state-hover |
| `--color-table-cell-selected` | `#C8E4FF` | color/blue/100 | `#112B55` | blue-dark/100 | data-state-selected |
| `--color-table-header-bg` | `#F5F5F5` | color/gray/50 | `#24252C` | gray-dark/200 | data-header-bg |
| `--color-table-border-default` | `#E9E9E9` | color/gray/100 | `#2E2F38` | gray-dark/300 | data-border-light → **default** (2026-06-23) |
| `--color-table-border-strong` | `#C4C4C4` | color/gray/300 | `#35363F` | gray-dark/400 | data-border-strong |

> HD-Table-2(2026-06-09): selected ≠ hover. Light hover=blue-50 / selected=blue-100. Dark hover=gray-dark-200(회색) / selected=blue-dark-100(파랑)으로 구분.
> 🧹 **보더 2단계로 정리(2026-06-23):** 셀선=`border-default`(gray-100) · 헤더 언더라인=`border-strong`(gray-300). 레거시가 셀선을 `light`로 수입한 것을 기준명 `default`로 교정. ~~`border-emphasis`~~(gray-800)는 **어떤 컴포넌트도 안 쓰던 고아 토큰**이라 제거(애초 기준=default/strong 2단계).

---

## 8-3. color-navigation — 네비게이션·라인탭 전용

> 라인탭(Line Tab)·GNB/LNB의 배경·라벨·indicator 전용. Component Token(`--tab-*`·`--nav-*`)이 이 레이어를 참조한다.
> 2026-05-28 Line Tab 컴포넌트 신설 시 등재 (Figma 540:6032).
> Dark 값은 candidate — Figma dark 시각 검증 후 확정 예정.

| CSS Variable | Light 참조 | Light Hex | Dark 참조 | Dark Hex | 용도 |
|---|---|---|---|---|---|
| `--color-navigation-bg` | `--color-surface-default` | `#FFFFFF` | `--color-surface-default` (상속) | `#1C1D23` | 라인탭 컨테이너 배경 (레거시 `background`→기준 `bg` 교정 2026-06-23) |
| `--color-navigation-label-default` | `--color-gray-600` | `#555555` | `--color-gray-dark-600` | `#55575F` (candidate) | 미선택 라벨 텍스트 |
| `--color-navigation-label-selected` | `--color-blue-400` | `#1D6CEB` | `--color-blue-dark-300` | `#3070D8` (candidate) | 선택 라벨 텍스트 |
| `--color-navigation-indicator-default` | `--color-gray-200` | `#D9D9D9` | `--color-gray-dark-300` | `#2E2F38` (candidate) | 탭 하단 구분선 |
| `--color-navigation-indicator-selected` | `--color-blue-400` | `#1D6CEB` | `--color-blue-dark-300` | `#3070D8` (candidate) | 선택 탭 하단 indicator |

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

> ⚠️ **하드코딩 CSS 덤프 제거(2026-06-23).** 손으로 유지하던 3번째 사본이라 값이 정본과 반복적으로 어긋났다(드리프트 원인).
>
> **실제 구현 CSS의 단일 정본은 자동 생성물이다:**
> - `assets/css/tokens.css` — `npm run tokens:gen` 으로 `vars-data.ts` 에서 생성 (Light/Dark 전체, Variables 정본)
> - `pages/install-prompt.html` — 다운로드용 인라인 CSS (tokens.css 와 동기화)
>
> 위 §1~§8-3 표는 **역할·매핑 설명용**이며, 색상 값의 단일 정본은 `vars-data.ts → tokens.css` 다. (Gate 7 토큰값일치 검사기가 두 표면 일치를 강제)
