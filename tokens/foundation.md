# Foundation Token 정의서

> 기준: CLAUDE.md · SW UX GUIDE V2.4
> 원본: Figma `Foundation` Variable Collection
> 업데이트: 2026-04-29

---

## 구조 개요

Foundation Token(Primitive)은 디자인시스템의 최하위 원자값이다.
Semantic Token과 Component Token은 반드시 이 값을 `var()`로 참조한다.
**HEX 값을 Semantic·Component 레이어에서 직접 사용하는 것은 금지한다.**

```
Foundation (Primitive)
  └─ color/gray/0 ~ 900          Light 그레이 스케일
  └─ color/gray-dark/0 ~ 900     Dark 그레이 스케일
  └─ color/blue/50 ~ 500         Light 블루 스케일
  └─ color/blue-dark/50 ~ 500    Dark 블루 스케일
  └─ color/base/white, black     순수 기준색
  └─ typography/*                폰트 크기·굵기·행간
  └─ spacing/*                   간격 스케일
  └─ radius/*                    모서리 반경
  └─ shadow/*                    그림자
```

---

## ⚠️ Dark Primitive 스텝 방향 규칙 (필수)

> **낮은 숫자 = 더 어두운 색, 높은 숫자 = 더 밝은 색**

Dark 팔레트는 Light 팔레트와 **스텝 의미가 반대**다.

| 구분 | Light 팔레트 | Dark 팔레트 |
|------|-------------|-------------|
| 낮은 스텝 (0, 50, 100…) | 밝은 색 (흰색 근처) | **어두운 색** (배경·심부) |
| 높은 스텝 (700, 800, 900) | 어두운 색 (검정 근처) | **밝은 색** (텍스트·하이라이트) |

### 이유

Dark 모드에서 배경은 어두워야 하고(낮은 스텝 = 배경), 텍스트는 밝아야 한다(높은 스텝 = 텍스트).
Light 팔레트의 스텝 방향을 그대로 따르면 Dark 배경에 어두운 텍스트가 올라오는 역전이 발생한다.

### 적용 체크리스트

새로운 Dark Primitive 팔레트를 추가할 때 반드시 확인:

- [ ] step 0 / 50 / 100 이 가장 어두운 값인가?
- [ ] step 상위 (전체 스텝의 70~80%) 이후가 밝아지는가?
- [ ] Semantic Token에서 배경(`bg-default`)이 낮은 스텝을, 텍스트(`text-primary`)가 높은 스텝을 참조하는가?
- [ ] foundation.html `DARK_PALETTES` 데이터와 semantic.md 값이 일치하는가?

---

## 1. Gray — Light

> CSS 변수 접두사: `--color-gray-{step}`

| Step | Hex | 비고 |
|------|-----|------|
| 0 | #FAFAFA | 페이지 기본 배경 |
| 50 | #F5F5F5 | 섹션·서브 배경 |
| 100 | #E9E9E9 | 구분선·Muted 배경 |
| 200 | #D9D9D9 | 테두리 기본 |
| 300 | #C4C4C4 | 테두리 강조·비활성 |
| 400 | #9D9D9D | placeholder 텍스트 |
| 500 | #757575 | 아이콘 기본·보조 텍스트 |
| 600 | #555555 | 3차 텍스트 |
| 700 | #434343 | — |
| 800 | #353535 | 2차 텍스트 |
| 900 | #202020 | 주요 텍스트 (Off-black) |

---

## 2. Gray — Dark

> CSS 변수 접두사: `--color-gray-dark-{step}`
> **규칙: 낮은 스텝 = 더 어두운 색 (배경), 높은 스텝 = 더 밝은 색 (텍스트)**

| Step | Hex | 역할 |
|------|-----|------|
| 0 | #0D0E12 | 최심부 (관제 화면 배경) |
| 50 | #131418 | 페이지 기본 배경 (`bg-default`) |
| 100 | #1C1D23 | 카드·패널 (`surface-default`) |
| 200 | #24252C | 인풋·섹션 (`bg-subtle`) |
| 300 | #2E2F38 | 구분선·테이블 헤더 (`bg-muted`) |
| 400 | #35363F | 툴바·elevated (`bg-elevated`) |
| 500 | #3E4049 | hover·active 상태 |
| 600 | #55575F | placeholder 텍스트 |
| 700 | #8A8C96 | 3차 텍스트 (AA 5.0:1) |
| 800 | #B8BABF | 보조 텍스트 |
| 900 | #ECEDF0 | 주요 텍스트 (`text-primary`) |

---

## 3. Blue — Light

> CSS 변수 접두사: `--color-blue-{step}`

| Step | Hex | 비고 |
|------|-----|------|
| 50 | #E2F1FF | 선택 배경·subtle tint |
| 100 | #C8E4FF | hover tint |
| 150 | #A4D4FF | — |
| 200 | #8BC6FF | — |
| 250 | #5BB2FF | — |
| 300 | #2B9EFF | — |
| 350 | #268CF8 | Primary (Light) 기본 |
| 400 | #1D6CEB | **Primary 기본 버튼** |
| 450 | #2158C8 | hover |
| 500 | #2747B9 | pressed |

---

## 4. Blue — Dark

> CSS 변수 접두사: `--color-blue-dark-{step}`
> **규칙: 낮은 스텝 = 더 어두운 색 (배경), 높은 스텝 = 더 밝은 색 (텍스트·링크)**

| Step | Hex | 역할 |
|------|-----|------|
| 50 | #0C1D38 | 선택 배경 (deepest) |
| 100 | #112B55 | 선택 행 |
| 150 | #1A3D72 | hover accent |
| 200 | #214EA0 | pressed |
| 250 | #2A65C8 | primary hover |
| 300 | #3070D8 | **Primary 기본 버튼** (`action-primary-default`) |
| 350 | #4285E8 | primary accent / focus ring |
| 400 | #6FA5F8 | 링크 텍스트 (`text-link`) |
| 450 | #96BEF9 | soft |
| 500 | #C0D8FC | tint (lightest) |

---

## 5. 스텝 방향 대조표

두 팔레트의 방향이 서로 반전되는 것을 명확히 보여주는 대조표다.

### Gray

| Step | Light 역할 | Light Hex | Dark Hex | Dark 역할 |
|------|-----------|-----------|----------|-----------|
| 0 | 가장 밝은 배경 | #FAFAFA | #0D0E12 | 가장 어두운 배경 |
| 50 | 섹션 배경 | #F5F5F5 | #131418 | 페이지 배경 |
| 100 | Muted 배경 | #E9E9E9 | #1C1D23 | 카드 표면 |
| 400 | placeholder | #9D9D9D | #35363F | 툴바·elevated |
| 700 | — | #434343 | #8A8C96 | 3차 텍스트 |
| 900 | 주요 텍스트 | #202020 | #ECEDF0 | 주요 텍스트 |

### Blue

| Step | Light 역할 | Light Hex | Dark Hex | Dark 역할 |
|------|-----------|-----------|----------|-----------|
| 50 | 가장 밝은 tint | #E2F1FF | #0C1D38 | 가장 어두운 선택 배경 |
| 300 | — | #2B9EFF | #3070D8 | Primary 버튼 |
| 400 | Primary 버튼 | #1D6CEB | #6FA5F8 | 링크 텍스트 |
| 500 | pressed | #2747B9 | #C0D8FC | 가장 밝은 tint |

---

## 6. Foundation 등록·확장 원칙

1. **HEX 직접 사용 금지** — Semantic/Component 레이어는 항상 `var(--color-gray-dark-*)` 형식으로 참조한다.
2. **rgba 허용 예외** — `color-border-*` Dark 전용, `color-overlay` Light·Dark 공통만 허용한다.
3. **Dark Primitive 신규 추가 시** — 위 스텝 방향 규칙을 반드시 따르고, semantic.md와 foundation.html `DARK_PALETTES` 동시에 업데이트한다.
4. **스텝 값은 원본 그대로** — 반올림·보정 금지. Figma 원본 HEX를 그대로 사용한다.
5. **신규 컬러 계열 추가 시** — gray-dark / blue-dark 예시를 참고해 낮은 스텝(배경)→높은 스텝(텍스트) 방향으로 정의한다.
