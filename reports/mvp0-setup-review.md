# MVP0 Setup Review

> 완료일: 2026-05-11
> Phase: MVP0 — Registry 기반 초기 구조 구축

## 완료된 작업

### registry/ 구조
- [x] registry/index.json — 마스터 인덱스
- [x] registry/tokens/foundation.colors.json — Foundation Primitive 팔레트 (gray/gray-dark/blue/blue-dark + base/brand)
- [x] registry/tokens/semantic.colors.json — Semantic Token (8개 카테고리 Light/Dark, tokens.css 실제값 반영)
- [x] registry/tokens/component.tokens.json — Component Token (Button 4variants / Input / Checkbox / Chip)
- [x] registry/components/button.json — Button Core Component 사양 (ghost variant 포함)
- [x] registry/figma/figma-map.json — Figma 노드 매핑 초안 (15개 icon section 확인)
- [x] registry/governance/versions.json
- [x] registry/governance/audit-rules.json — 6개 검증 규칙
- [x] registry/governance/deprecated.json — Danger variant 삭제 기록
- [x] registry/governance/migration.json
- [x] registry/ai/snippets.json
- [x] registry/ai/review-prompts.json

### reports/ 구조
- [x] reports/README.md
- [x] reports/token-review.md
- [x] reports/component-review.md
- [x] reports/darkmode-review.md
- [x] reports/figma-map-review.md
- [x] reports/mvp0-setup-review.md (this file)

### 기존 파일 보존
- [x] 기존 pages/, assets/, tokens/, docs/, data/ 전혀 건드리지 않음

## 소스 참조 (값 검증 근거)
- `assets/css/tokens.css` (689줄) — 실제 CSS 구현체에서 HEX 값 직접 확인
- `tokens/semantic.md` — Semantic Token Light/Dark Primitive 참조 구조 확인
- `tokens/foundation.md` — Gray/Blue Dark 스텝 방향 규칙 확인

## 실제 tokens.css와 semantic.md 간 차이점 (확인된 항목)
| 토큰 | semantic.md | tokens.css | 비고 |
|------|-------------|-----------|------|
| `--color-text-secondary` Light | #353535 | var(--color-gray-800) = #353535 | 일치 |
| `--color-status-error` Light | #E50533 (red/400) | var(--color-red-400) = #E50533 | 일치 |
| `--color-status-warning` Light | #DBA400 (yellow/400) | var(--color-yellow-400) = #DBA400 | 일치 |
| `--color-status-info` Light | #757575 (gray/500) | var(--color-gray-500) | 일치 |
| `--color-overlay` | rgba(0,0,0,0.5) | rgba(0,0,0,0.5) | 일치 |

## 미결 사항 (MVP1 대상)
1. Figma componentSetKey 채우기 (MCP/Plugin 연동 후)
2. Input / Checkbox / Chip registry/components/ 개별 파일 생성
3. candidate 다크모드 값 확정 → stable 전환
4. registry를 읽어 렌더링하는 HTML Portal 개선
5. ghost variant --button-ghost-focus-ring 토큰 추가
6. Chip 구조 확정 (line/solid 분리 vs 단일 통합)

## 구조 역할 분리
| 폴더 | 역할 |
|------|------|
| `registry/` | 기준 데이터 (Claude·Portal·Figma Plugin 모두 참조) |
| `tokens/*.md` | 인간 가독 문서 (유지) |
| `data/` | HTML Portal 전용 렌더링 데이터 |
| `reports/` | 검수·리뷰 결과물 |
| `pages/` | HTML 포털 뷰 |
