# Token Review

> 생성: 2026-05-11 / Phase: MVP0

## 검증 기준
- Component Token 색상은 Semantic Token 경유 여부
- darkStatus candidate 항목 목록
- kebab-case 네이밍 준수 여부

## 결과 (MVP0 기준)

### Component → Semantic 참조 위반
현재 등록된 button / input / checkbox / chip 토큰: 모두 Semantic 경유 확인 ✅

### darkStatus: candidate 항목
| Token | Light | Dark (candidate) | 비고 |
|-------|-------|-----------------|------|
| `--color-text-disabled` | #C4C4C4 | #35363F | #35363F → #55575F 조정 검토 중 |
| `--color-bg-selected` | #E2F1FF | #112B55 | Figma 검증 전 임시값 |
| `--color-bg-home` | #F5F6FB | #131418 | Light Primitive 미등록 |
| `--color-surface-overlay` | #FFFFFF | #2E2F38 | 모달 표면 확정 필요 |
| `--button-primary-disabled-bg` dark | — | — | var(--color-border-default) → var(--color-bg-muted) 참조 수정 검토 중 |

### 네이밍 위반
없음 ✅

## 다음 액션
- candidate 항목을 md-review.html에서 사용자 승인 후 stable 전환
