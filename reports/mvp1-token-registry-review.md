# MVP1 Token Registry Review

> 완료일: 2026-05-11
> Phase: MVP1 — V2.4 공식 토큰 기반 Registry 정규화

## 완료된 작업

### Foundation 토큰 분리 (신규)
- [x] `registry/tokens/foundation.colors.json` — 전면 업데이트 (22개 색상 그룹, V2.4 원본 HEX 직접 반영)
  - gray(11단계) / gray-dark(11단계) / blue(10단계) / blue-dark(10단계)
  - red/orange/yellow/green/skyblue/purple/brown/visualGray (각 10단계) + dark 대응
  - coolgrayDark(8단계, tokens.css 실제값 직접 확인), statusDarkAlias, base/brand
- [x] `registry/tokens/foundation.spacing.json` — 21개 spacing 토큰 (2px–128px)
- [x] `registry/tokens/foundation.radius.json` — 10개 radius 토큰 (0–full)
- [x] `registry/tokens/foundation.typography.json` — fontSize(8), fontWeight(3), lineHeight(1)
- [x] `registry/tokens/foundation.border.json` — border-width-default(1px) / border-width-strong(2px)

### Semantic 토큰 분리 (신규)
- [x] `registry/tokens/semantic.colors.json` — 전면 업데이트 (8개 카테고리, V2.4 var() 참조 구조)
- [x] `registry/tokens/semantic.spacing.json` — 7개 그룹 (padding-block, section, stack, cluster, label-gap, inset)
- [x] `registry/tokens/semantic.sizing.json` — 5개 그룹 (form-control, button, chip, table-row, icon)
- [x] `registry/tokens/semantic.radius.json` — 5개 시맨틱 radius 토큰
- [x] `registry/tokens/semantic.border.json` — 2개 시맨틱 border-width 토큰

### Component 토큰 업데이트
- [x] `registry/tokens/component.tokens.json` — 10개 컴포넌트 그룹 (button/chip/dropdown/input/checkbox/radio/toggle/pagination/nav/table)

### Core Component 스켈레톤 추가 (9종 신규)
- [x] `registry/components/chip.json`
- [x] `registry/components/dropdown.json`
- [x] `registry/components/input.json`
- [x] `registry/components/checkbox.json`
- [x] `registry/components/radio.json`
- [x] `registry/components/toggle.json`
- [x] `registry/components/pagination.json`
- [x] `registry/components/nav.json`
- [x] `registry/components/table.json`

### Governance 업데이트
- [x] `registry/governance/token-exceptions.json` — 신규 (EX01–EX05 documented)
- [x] `registry/governance/audit-rules.json` — R07–R11 추가 (총 11개)
- [x] `registry/governance/versions.json` — v0.2.0 MVP1 항목 추가
- [x] `registry/figma/figma-map.json` — 10개 컴포넌트 skeleton 확장

### 정규 CSS 원본 등록
- [x] `registry/tokens/sw-v2.4.tokens.css` — `assets/css/tokens.css` 복사 (V2.4 공식 원본)

### Index 업데이트
- [x] `registry/index.json` — version 0.2.0, 신규 경로 전체 등록

## MVP1 핵심 원칙 변경

| 항목 | 이전 (MVP0) | MVP1 변경 |
|------|------------|----------|
| 색상 참조 원칙 | 색상은 반드시 Semantic Token 경유 | 제품 UI 컴포넌트는 Semantic/Component Token을 기본 사용 (강제 아님) |
| 예외 처리 | 없음 | `token-exceptions.json`으로 문서화된 예외 허용 |
| 예외 허용 근거 | — | EX01–EX05: foundation.colors, dark border rgba, overlay rgba, 단독 sizing, raw px 필요값 |

## 소스 참조 (값 검증 근거)
- `assets/css/tokens.css` (689줄) — V2.4 공식 구현체, 모든 var() 참조 및 HEX값 검증
- `tokens/semantic.md` — Semantic Token Light/Dark 참조 구조
- `tokens/component-tokens-extracted.md` — 9개 Component Token 그룹 구조
- `tokens/foundation.md` — Gray/Blue Dark 스텝 방향 규칙

## 실제 값 검증 — coolgrayDark (tokens.css 직접 확인)

| Step | tokens.css 실제값 | 비고 |
|------|-----------------|------|
| 150 | #252830 | |
| 200 | #353840 | |
| 250 | #484C58 | |
| 300 | #606470 | |
| 350 | #787C88 | |
| 400 | #989CA8 | |
| 450 | #B8BCC5 | |
| 500 | #D8DBE0 | |

## darkStatus 현황 — candidate 항목 (확정 대기)

| 토큰 | 현재 dark 값 | 이슈 |
|------|------------|------|
| `--color-text-disabled` | `#55575F` | `#35363F` → `#55575F` 조정 검토 중 |
| `--color-bg-home` | `var(--color-gray-dark-50)` | Home 배경 dark 값 확정 대기 |
| `--color-bg-selected` | `var(--color-blue-dark-100)` | Selected 상태 dark 확정 대기 |
| `--button-primary-disabled-bg` dark | `var(--color-border-default)` | `var(--color-bg-muted)` 참조 수정 검토 중 |
| `--button-ghost-focus-ring` | 미정의 | ghost variant dark focus ring 추가 필요 |

## 미결 사항 (MVP2 대상)

1. **HTML Portal 연동** — foundation.html / semantic.html이 registry JSON을 읽어 렌더링하도록 전환
2. **Button blue-line 토큰 추출** — Figma 설계 확정, CSS 변수 미정의 → registry 반영 후 component.tokens.json 추가
3. **Figma componentSetKey 채우기** — 10개 컴포넌트 모두 빈 문자열 상태, Figma MCP/Plugin 연동 필요
4. **Source Guard 검증** — raw HEX 직접 사용 탐지, 미등록 토큰 이름 탐지 자동화
5. **candidate → stable 전환** — darkStatus candidate 항목 md-review.html 등록 → 사용자 승인 후 반영
6. **Chip 구조 확정** — component-tokens-extracted.md: line/solid 2타입 분리 vs tokens.css: 단일 구조 중 확정

## 파일 현황 요약

| 파일 | 줄수 | 상태 |
|------|------|------|
| `registry/tokens/foundation.colors.json` | 269줄 | ✅ 완료 |
| `registry/tokens/component.tokens.json` | 158줄 | ✅ 완료 |
| `registry/tokens/semantic.colors.json` | 72줄 | ✅ 완료 |
| `registry/tokens/semantic.spacing.json` | 55줄 | ✅ 완료 |
| `registry/tokens/semantic.sizing.json` | 46줄 | ✅ 완료 |
| `registry/tokens/foundation.spacing.json` | 32줄 | ✅ 완료 |
| `registry/tokens/foundation.typography.json` | 27줄 | ✅ 완료 |
| `registry/tokens/foundation.radius.json` | 21줄 | ✅ 완료 |
| `registry/tokens/semantic.radius.json` | 17줄 | ✅ 완료 |
| `registry/tokens/semantic.border.json` | 14줄 | ✅ 완료 |
| `registry/tokens/foundation.border.json` | 13줄 | ✅ 완료 |
| `registry/components/` (10개 파일) | 309줄 | ✅ 완료 |
| `registry/governance/token-exceptions.json` | 75줄 | ✅ 완료 |
| `registry/governance/audit-rules.json` | 16줄 | ✅ 완료 (R01–R11) |
