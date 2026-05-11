# Dark Mode Review

> 생성: 2026-05-11 / Phase: MVP0

## candidate 항목 전체 목록

| Token | 현재 Dark값 | 대안 | 결정 |
|-------|------------|------|------|
| `--color-text-disabled` | #35363F (gray-dark/400) | #55575F (gray-dark/600) | 검토 중 |
| `--color-bg-selected` | #112B55 (blue-dark/100) | Figma 원본 확인 필요 | 미결 |
| `--color-bg-home` | #131418 (gray-dark/50) | Light Primitive 미등록 — 확정 필요 | 미결 |
| `--color-surface-overlay` | #2E2F38 (gray-dark/300) | 모달 표면 레이어 확정 필요 | 미결 |
| `--button-primary-disabled-bg` | var(--color-border-default) | var(--color-bg-muted) | 검토 중 |
| `--button-ghost-focus-ring` | 미정의 | 추가 필요 | 미결 |
| toggle tokens | MD: var(--color-text-placeholder) / CSS: var(--color-border-default) | 정합 필요 | 미결 |

## Chip 구조 미결
- component-tokens-extracted.md: line/solid 2타입 분리
- tokens.css: 단일 구조 (--chip-default-*, --chip-selected-* 통합)
- 어느 구조로 확정할지 결정 필요

## 다음 액션
각 항목을 md-review.html 결정 대기 항목으로 등록 후 승인 시 stable 전환
