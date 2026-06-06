# Figma → 코드 워크플로우 산출물

`figma-to-code` 스킬(5단계 검문소 워크플로우)의 단계별 산출물을 컴포넌트별로 보관한다.

## 폴더 구조

```
reports/figma-to-code/{component}/
├── 1-inventory.md      # 1단계 재고조사표 (variant 목록 + 아이콘)
├── 2-extraction.md     # 2단계 수치추출표 (Primitive→Semantic→Component 매핑)
├── 4-verification.md   # 4단계 대조 결과 (component-verifier가 작성, ❌ 목록)
└── 5-darkmode.md       # 5단계 다크모드 설계·점검 (해당 시)
```

`{component}`는 `registry/components/index.json`의 컴포넌트 id를 따른다.

## 단계 ↔ 담당 에이전트

| 단계 | 담당 | 산출물 |
|------|------|--------|
| 1 재고조사 | figma-inspector | `1-inventory.md` |
| 2 수치추출 | figma-inspector + token-validator | `2-extraction.md` |
| 3 구현 | guide-builder | (코드: components.html + registry JSON) |
| 4 자가대조 | **component-verifier** (검증 전용) | `4-verification.md` |
| 5 다크모드 | guide-builder + component-verifier | `5-darkmode.md` |

> 상세 규칙: `.claude/skills/figma-to-code/SKILL.md`
