# SW Design System V2.4 — Design Principles

이 문서는 SW Design System V2.4의 **디자인 원칙**을 정의합니다.

토큰 정의서가 *"무엇이 있는지"*를 다룬다면,
이 문서는 *"어떻게 써야 일관된 결과가 나오는지"*를 다룹니다.

---

## 문서 구성

이 가이드는 영역별 챕터로 구성됩니다.
새로운 원칙이 정의될 때마다 챕터를 추가합니다.

| Chapter | 제목 | 상태 |
|---|---|---|
| 1 | 색상 위계 (Color Hierarchy) | ✅ 작성 완료 |
| 2 | Spacing 위계 | 📝 예정 |
| 3 | Typography 위계 | 📝 예정 |
| 4 | Sizing 위계 | 📝 예정 |
| 5 | Radius / Border 사용 규칙 | 📝 예정 |
| 6 | 인터랙션 상태 (Hover/Focus/Pressed) | 📝 예정 |
| 7 | 모션 / 트랜지션 | 📝 예정 |

각 챕터는 동일한 구조를 따릅니다:
**핵심 원칙 → 토큰 매핑 → 적용 패턴 → 자주 하는 실수 → 체크리스트**

---

## 공통 원칙

모든 챕터가 따르는 디자인 시스템 사용의 대전제입니다.

### 원칙 A. 토큰만 사용한다

- 임의 HEX 색상값 직접 사용 금지
- 정의되지 않은 토큰명 생성 금지
- 단, **rgba overlay**(예: 행 강조의 4% 배경)는 토큰 색상값을 투명도로 변환하여 사용 가능
- 임의 값이 필요하다고 느껴진다면 **토큰 사용이 잘못된 것**. 위계를 다시 검토할 것

### 원칙 B. Component → Semantic → Foundation 계층 준수

- 컴포넌트 토큰은 Semantic을 참조 (Foundation Primitive를 직접 참조하지 않음)
- 색상은 반드시 Semantic 토큰을 경유

### 원칙 C. Light 먼저, Dark는 검증

다크모드부터 만들면 라이트로 옮길 때 위계가 어긋날 가능성이 큽니다.
**가장 정보 밀도가 높은 화면**(테이블·폼)을 기준으로 다크모드를 검증하세요.

---

# Chapter 1. 색상 위계 (Color Hierarchy)

라이트/다크 양쪽 모드에서 정보 위계가 일관되게 유지되도록 색상을 사용하는 규칙입니다.

## 1.1 Surface 색상 위계

화면의 모든 표면은 **4단계 위계** 중 하나에 속합니다.
이 위계가 명확해야 카드·패널·내부 요소의 경계가 살아납니다.

### 4단계 위계

```
1단계. 페이지 배경 (가장 뒤로 들어감)
2단계. 카드 표면
3단계. 카드 내 강조 영역 (아이콘 배경, 메시지 버블 등)
4단계. 카드 내 더 들어간 영역 (input, table header, 보조 영역)
```

### 토큰 매핑

| 단계 | 토큰 | Light 값 | Dark 값 |
|---|---|---|---|
| 1. 페이지 배경 | `--color-bg-default` | gray-0 (#FAFAFA) | gray-dark-50 (#131418) |
| 2. 카드 표면 | `--color-surface-default` | white (#FFFFFF) | gray-dark-100 (#1C1D23) |
| 3. 강조 영역 | `--color-bg-subtle` | gray-50 (#F5F5F5) | gray-dark-200 (#24252C) |
| 4. 더 깊은 영역 | `--color-bg-muted` | gray-100 (#E9E9E9) | gray-dark-300 (#2E2F38) |

### 라이트와 다크의 방향성 차이

| 모드 | 위계 표현 방식 |
|---|---|
| **Light** | 1단계가 살짝 회색 → 2단계 흰색 카드가 떠올라 보임 |
| **Dark** | 1단계가 가장 어두움 → 카드로 들어갈수록 밝아짐 (elevation) |

이 방향성을 지키지 않으면 카드 경계가 무너지고 위계가 사라집니다.

## 1.2 Text 색상 위계

모든 텍스트는 **4단계로 위계화**합니다. 단일 톤으로 처리하면 정보 위계가 사라집니다.

### 텍스트 4단계

| 토큰 | 용도 | Light 값 | Dark 값 |
|---|---|---|---|
| `--color-text-primary` | 카드 제목, KPI 숫자, 강조 텍스트 | gray-900 (#202020) | gray-dark-900 (#ECEDF0) |
| `--color-text-secondary` | 본문, 일반 텍스트 | gray-800 (#353535) | gray-dark-800 (#B8BABF) |
| `--color-text-tertiary` | 라벨, 캡션, 메타 정보 | gray-600 (#555555) | gray-dark-700 (#8A8C96) |
| `--color-text-placeholder` | input placeholder, disabled | gray-400 (#9D9D9D) | gray-dark-600 (#55575F) |

### 보조 텍스트 토큰

| 토큰 | 용도 |
|---|---|
| `--color-text-link` | 링크 텍스트 |
| `--color-text-correct` | 검증 통과 / 정상 |
| `--color-text-danger` | 에러 / 경고 |
| `--color-text-disabled` | 비활성 상태 |
| `--color-text-inverse` | 어두운 배경 위 흰 텍스트 |

## 1.3 Border 색상 사용 규칙

### 핵심 규칙: 다크모드 보더는 반투명 흰색

다크모드에서 검은 배경에 진한 회색 테두리를 쓰면 부자연스럽고 시각 잡음이 됩니다.
**다크모드의 모든 border는 rgba(255,255,255, *opacity*)** 로 정의되어 있습니다.

### 토큰 매핑

| 토큰 | Light | Dark |
|---|---|---|
| `--color-border-subtle` | gray-100 | rgba(255,255,255,0.04) |
| `--color-border-default` | gray-200 | rgba(255,255,255,0.07) |
| `--color-border-strong` | gray-300 | rgba(255,255,255,0.12) |
| `--color-border-emphasis` | gray-800 | rgba(255,255,255,0.20) |

### 사용 가이드

| 토큰 | 사용처 |
|---|---|
| `border-subtle` | 카드 외곽, 카드 내 divider, 테이블 셀 보더 (가장 자주 사용) |
| `border-default` | input, button, dropdown 등 인터랙티브 요소 기본 상태 |
| `border-strong` | input·button hover 상태, 강조가 필요한 보더 |
| `border-emphasis` | 매우 드물게, 강한 분리가 필요할 때만 |

### 다크모드 보더가 약해 보일 때

카드끼리 구분이 안 되어 보이면 보더를 강하게 하지 마세요. 대신:
- 카드 사이 **간격(gap)을 늘리기**
- 페이지 배경(`bg-default`)과의 **대비를 검토**
- 그래도 부족하면 카드를 `surface-raised`(한 단계 더 밝은 톤)로 올리기

## 1.4 Status 색상 사용 패턴

### 패턴 1.4.1 — KPI 카드 / 아이콘 영역

상태 정보를 표현하는 아이콘은 **옅은 배경 + 진한 아이콘** 조합으로 사용합니다.
배경 자체를 강하게 만들면 시선이 분산됩니다.

| 상태 | Light 배경 / 아이콘 | Dark 배경 / 아이콘 |
|---|---|---|
| info | blue-50 / blue-400 | blue-dark-100 / blue-dark-400 |
| success | green-50 / green-400 | green-dark-100 / status-dark-green |
| warning | yellow-50 / yellow-400 | yellow-dark-100 / status-dark-yellow |
| danger | red-50 / red-400 | red-dark-100 / status-dark-red |

### 패턴 1.4.2 — 이벤트 배지 / 라벨

배지는 **3겹 구조(배경 + 보더 + 텍스트)** 로 만들어야 톤이 부드러워집니다.

```
[Light]
warning: bg=yellow-50, border=yellow-100, text=yellow-400
danger:  bg=red-50,    border=red-100,    text=red-400
info:    bg=blue-50,   border=blue-100,   text=blue-400

[Dark]
warning: bg=yellow-dark-100, border=yellow-dark-200, text=status-dark-yellow
danger:  bg=red-dark-100,    border=red-dark-200,    text=status-dark-red
info:    bg=blue-dark-100,   border=blue-dark-200,   text=blue-dark-400
```

### 패턴 1.4.3 — Danger 행 강조

행 전체를 빨갛게 칠하지 마세요. 좌측 2px 보더 + 매우 옅은 배경(3~4%)으로 충분합니다.

```
[Light]
border-left: 2px solid red-300
background: rgba(229, 5, 51, 0.03)

[Dark]
border-left: 2px solid status-dark-red
background: rgba(240, 96, 112, 0.04)
```

### 상태 색상 사용 원칙 요약

> **"옅은 배경 + 진한 텍스트"** 가 기본.
> 진한 배경은 매우 드물게 (긴급 알림, 출동 연결 같은 결정적 액션에만).

## 1.5 Action / Primary 색상 사용

### 기본 토큰

| 토큰 | Light | Dark |
|---|---|---|
| `--color-action-primary-default` | blue-400 (#1D6CEB) | blue-dark-300 (#3070D8) |
| `--color-action-primary-hover` | blue-450 (#2158C8) | blue-dark-250 (#2A65C8) |
| `--color-action-primary-pressed` | blue-500 (#2747B9) | blue-dark-200 (#214EA0) |
| `--color-action-primary-subtle` | blue-50 (#E2F1FF) | blue-dark-100 (#112B55) |
| `--color-action-primary-text` | white | white |

### 예외 규칙: LNB 활성 텍스트의 가독성

다크모드의 `--color-action-primary-default` (blue-dark-300)는 LNB 텍스트로
사용하면 약간 어두워서 가독성이 떨어집니다.
**LNB 활성 텍스트와 아이콘만은 한 단계 밝은 `blue-dark-400` 사용**:

```css
/* Light */
--nav-item-active-text: var(--color-action-primary-default); /* blue-400 */
--nav-item-active-icon: var(--color-action-primary-default);

/* Dark — 더 밝은 톤으로 가독성 확보 */
--nav-item-active-text: var(--color-blue-dark-400); /* #6FA5F8 */
--nav-item-active-icon: var(--color-blue-dark-400);
```

활성 상태는 항상 **`font-weight: bold` + 활성 배경(`action-primary-subtle`)** 을
함께 적용해서 명확히 구분합니다.

## 1.6 컴포넌트별 적용 패턴

### Card

```css
.card {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card-md);
}

.card-header {
  border-bottom: 1px solid var(--color-border-subtle);
}
```

### Progress Bar

```css
.progress-track {
  background: var(--color-bg-muted);   /* Light: gray-100 */
}
[data-theme="dark"] .progress-track {
  background: var(--color-bg-subtle);  /* Dark: gray-dark-200 — bg-muted는 너무 밝음 */
}

.progress-fill.info    { background: var(--color-action-primary-default); }
.progress-fill.warning { background: var(--color-status-warning); }
.progress-fill.success { background: var(--color-status-success); }
```

> 다크모드에서 progress track은 `bg-muted` 대신 `bg-subtle` 사용.
> `bg-muted`(gray-dark-300)는 너무 밝아서 카드와 구분이 안 됩니다.

### Input

```css
.input {
  background: var(--input-default-bg);
  border: 1px solid var(--input-default-border);
}

.input:focus {
  border-color: var(--input-focus-border);
}

.input::placeholder {
  color: var(--input-placeholder-text);
}
```

### Hover / Selected 상태

| 상태 | 토큰 |
|---|---|
| Hover background | `--color-bg-subtle` |
| Selected background | `--color-bg-selected` (= blue-50 / blue-dark-100) |

## 1.7 자주 하는 실수

### ❌ 실수 1. 다크모드를 영상관제 화면 기준으로 설계

영상관제는 캔버스가 화면의 90%라 컴포넌트 위계가 약해도 동작합니다.
하지만 데이터 테이블·폼이 많은 admin 화면에서는 위계가 무너집니다.
→ **가장 정보 밀도가 높은 화면(테이블)을 기준**으로 다크모드를 검증하세요.

### ❌ 실수 2. 페이지 배경과 카드를 같은 흰색으로

라이트모드에서 페이지 배경이 흰색이면 카드가 떠올라 보이지 않습니다.
→ 페이지 배경은 반드시 `--color-bg-default` (gray-0, 살짝 회색) 사용.

### ❌ 실수 3. Status 배지를 채도 높은 배경으로

WARNING/DANGER 배지를 진한 노랑/빨강 배경으로 만들면 시선이 분산됩니다.
→ **옅은 배경(50/dark-100) + 진한 텍스트(400/status-dark-\*)** 조합 사용.

### ❌ 실수 4. 다크모드 보더를 진한 회색으로

다크모드의 보더는 검은 배경 위 흰색 반투명(rgba)이어야 자연스럽습니다.
회색 컬러(gray-dark-300 등)를 보더로 직접 쓰면 분리감이 과해집니다.

### ❌ 실수 5. 텍스트 색상을 단일 톤으로

모든 텍스트를 `text-primary` 하나로 처리하면 위계가 사라집니다.
→ 제목·본문·캡션·placeholder를 4단계로 명확히 구분.

### ❌ 실수 6. Danger 행을 빨갛게 칠하기

행 전체에 빨간 배경을 깔면 시각 잡음이 됩니다.
→ **좌측 2px 보더 + 4% 옅은 배경** 으로 부드럽게 강조.

### ❌ 실수 7. LNB 다크모드에서 어두운 파랑 활성 텍스트

`action-primary-default` (blue-dark-300)는 LNB 텍스트로는 약간 어둡습니다.
→ LNB 활성 텍스트만 `blue-dark-400`으로 한 단계 밝게 사용.

## 1.8 적용 검증 체크리스트

화면을 만든 후 라이트/다크 모두 다음을 확인하세요.

```
[ ] 페이지 배경, 카드, 카드 내부 영역이 시각적으로 3단계 이상 구분되는가
[ ] 카드 보더가 너무 진하지 않고 자연스럽게 떨어지는가
[ ] 텍스트 위계 4단계가 명확히 구분되는가 (제목/본문/캡션/placeholder)
[ ] 상태 색상(success/warning/danger)이 너무 강하지 않고 차분한가
[ ] LNB 활성 메뉴의 텍스트와 아이콘이 선명하게 보이는가 (특히 다크모드)
[ ] Hover/Selected 상태가 명확히 구분되는가
[ ] 라이트와 다크에서 동일한 정보 위계가 유지되는가
[ ] 임의 HEX 색상값을 직접 사용한 곳이 없는가 (rgba overlay 제외)
```

## 1.9 작업 절차 (색상)

새 화면을 만들 때 색상 적용 순서:

1. **Surface 4단계 정의** — 페이지·카드·강조·input 영역 토큰 결정
2. **텍스트 위계 매핑** — 어느 텍스트가 primary/secondary/tertiary인지
3. **Status 사용 위치** — KPI/배지/행 강조 등에 어떤 status 패턴 적용할지
4. **라이트모드 먼저 완성**
5. **다크모드 토글 검증**
6. **체크리스트로 위계 점검**

## 1.10 부록 — Surface 위계 빠른 참조표

화면 작업 시 이 표를 참고해서 토큰을 빠르게 매핑하세요.

| 화면 영역 | Surface 단계 | 토큰 |
|---|---|---|
| 페이지 배경 (`<body>`) | 1 | `--color-bg-default` |
| 사이드바, 헤더 | 2 | `--color-surface-default` |
| 카드, 모달 | 2 | `--color-surface-default` |
| KPI 아이콘 배경 | 3 | `--color-bg-subtle` |
| AI 메시지 버블 | 3 | `--color-bg-subtle` |
| Hover 상태 배경 | 3 | `--color-bg-subtle` |
| 칩, 배지 기본 배경 | 3 | `--color-bg-subtle` |
| Selected 항목 배경 | 3 | `--color-bg-selected` |
| Input 비활성 배경 | 3 | `--color-bg-subtle` |
| Input 활성 배경 | 2 | `--color-surface-default` |
| 테이블 헤더 | 3 | `--color-bg-subtle` |
| 테이블 행 | 2 | `--color-surface-default` |
| 테이블 행 hover | 3 | `--color-bg-subtle` |
| 테이블 행 selected | 3 | `--color-bg-selected` |

---

# Chapter 2. Spacing 위계 (예정)

> 작성 예정. 다음 내용을 다룹니다:
> - section / stack / cluster / inline 사용 기준
> - 컴포넌트 내부 여백과 컴포넌트 간 여백 구분
> - 밀도(density)에 따른 spacing 선택

---

# Chapter 3. Typography 위계 (예정)

> 작성 예정. 다음 내용을 다룹니다:
> - font-size 단계별 사용 시점
> - font-weight × font-size 조합 패턴
> - line-height 적용 기준

---

# Chapter 4. Sizing 위계 (예정)

> 작성 예정. 다음 내용을 다룹니다:
> - form-control / button / chip / table-row 사이즈 단계
> - 컴포넌트별 lg/md/sm/xsm 선택 기준
> - 화면 정보 밀도에 따른 사이즈 선택

---

# Chapter 5. Radius / Border 사용 규칙 (예정)

> 작성 예정. 다음 내용을 다룹니다:
> - control / button / card / modal 별 radius 적용
> - border-width 단계와 사용 시점

---

# Chapter 6. 인터랙션 상태 (예정)

> 작성 예정. 다음 내용을 다룹니다:
> - hover / focus / pressed / disabled 처리 원칙
> - 상태별 색상 변화 규칙
> - 인터랙티브 영역의 시각적 affordance

---

# Chapter 7. 모션 / 트랜지션 (예정)

> 작성 예정. 다음 내용을 다룹니다:
> - duration / easing 토큰 사용
> - 마이크로 인터랙션 원칙
> - 페이지 전환 / 모달 open-close 패턴

---

## 변경 이력

| 버전 | 일자 | 챕터 | 내용 |
|---|---|---|---|
| 1.0.0 | 2026-05-06 | Ch.1 | 색상 위계 최초 작성 — Surface, Text, Border, Status, Action, 컴포넌트 패턴, 실수, 체크리스트 |

---

> 이 가이드는 살아있는 문서입니다.
> 작업 중 새로운 패턴이나 예외가 발견되면 해당 챕터에 추가하세요.
> 새 챕터를 작성할 때는 기존 챕터와 동일한 구조를 따릅니다:
>   **핵심 원칙 → 토큰 매핑 → 적용 패턴 → 자주 하는 실수 → 체크리스트**
