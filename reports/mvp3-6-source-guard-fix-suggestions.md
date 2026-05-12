# MVP3.6 Source Guard Fix Suggestions

**Date:** 2026-05-12  
**Status:** ✅ Complete

---

## Scope

Generate fix suggestions for external service target violations detected by Source Guard.
외부 서비스 프로젝트의 디자인시스템 위반 항목에 대한 수정 후보를 생성합니다.
실제 파일은 수정하지 않습니다.

---

## Created

| File | Role |
|------|------|
| `scripts/guard/token-suggestion.js` | HEX → semantic token 역매핑 엔진. Foundation HEX map + Semantic HEX map 빌드. Levenshtein 기반 undefined token fuzzy match |
| `scripts/guard/fix-suggestion-rules.js` | 이슈 유형별 수정 제안 규칙 (raw-hex, raw-rgb, raw-rgba, foundation-direct, undefined-token, button-variant, inline-style) |
| `scripts/guard/patch-writer.js` | High confidence 항목만 포함한 unified diff 스타일 patch 파일 생성 |
| `scripts/guard/suggest-fixes.js` | CLI entry — `--target` 파싱, 검사 실행, 제안 생성, 리포트 출력 |

## Updated

| File | 변경 내용 |
|------|-----------|
| `package.json` | `"guard:suggest": "node scripts/guard/suggest-fixes.js"` 추가 |
| `README.md` | MVP3.6 Source Guard Fix Suggestions 사용법 섹션 추가 |
| `CLAUDE.md` | MVP3.6 Fix Suggestion Rules + Confidence 기준 추가, 변경이력·완료단계 업데이트 |

---

## Commands

```bash
# 수정 제안 생성
npm run guard:suggest -- --target ../service-project

# 사용법 확인
node scripts/guard/suggest-fixes.js
```

외부 서비스 프로젝트를 대상으로 디자인시스템 위반 항목의 수정 후보를 생성합니다. 실제 파일은 수정하지 않습니다.

---

## Suggestion Types

| 유형 | 탐지 대상 | Confidence |
|------|-----------|------------|
| Raw HEX to semantic token | `#202020`, `#FFFFFF` 등 | exact 1개 → high, 다수 → needs-review |
| RGB to semantic token | `rgb(32,32,32)` | HEX 변환 후 매핑 |
| RGBA handling | `rgba(...)` | 항상 needs-human |
| Foundation color direct | `var(--color-blue-400)` | 역매핑 → needs-review |
| Undefined token fuzzy | `var(--unknown-token)` | Levenshtein → medium |
| Button variant | `sw-button--ghost` | needs-human |
| Ambiguous variant | `btn-outline` | medium suggestion |
| Inline style color | `style="color: #..."` | HEX 기반 매핑 |

---

## Token Suggestion Engine

### HEX 역매핑 알고리즘

```
foundation.colors.json → HEX 값 추출 → foundationHexMap (hex → cssVar)
semantic.colors.json   → light 값 = var(--color-xxx) → resolve HEX via foundationHexMap
                       → semanticHexMap (hex → [{ cssVar, category }])

입력 HEX → normalizeHex → semanticHexMap 조회
  → 1개 매치: confidence=high
  → 다수 매치: confidence=needs-review, 카테고리 우선순위 정렬
  → 0개 매치 but foundation 있음: confidence=medium
  → 0개: unmapped
```

### Foundation → Semantic 역매핑

```
semantic.colors.json light 값에서 var(--color-xxx) 추출
→ foundationToSemanticMap (foundVar → [semanticCssVar])

입력 foundVar → 조회 → semantic token 후보 제안
```

### Undefined Token Fuzzy Match

```
Levenshtein 거리 기준:
- dist ≤ 3 : confidence=high (거의 오타)
- dist ≤ 8 : confidence=medium
- dist > 8 : confidence=needs-review
```

---

## Validation

fixture `scripts/guard/__fixtures__/bad-service/` 실행 결과:

```
Source Guard Fix Suggestions — bad-service
══════════════════════════════════════════════════
High confidence : 5
Needs review    : 7
Human decisions : 4
Unmapped        : 0
Report          : reports/source-guard-fix-suggestions-bad-service.md
Patch candidate : reports/patch-candidates-bad-service.diff (1 item)
```

| 검증 항목 | 결과 |
|-----------|------|
| `--target` 없으면 usage 출력 | ✅ |
| `rgb(32,32,32)` → `var(--color-text-primary)` (high) | ✅ |
| `#FFFFFF` → needs-review (다수 토큰 공유) | ✅ |
| `rgba()` → needs-human (자동 수정 없음) | ✅ |
| `sw-button--ghost` → needs-human | ✅ |
| `var(--color-blue-400)` → needs-review (foundation direct) | ✅ |
| `var(--unknown-token)` → needs-review (fuzzy match) | ✅ |
| high confidence만 patch candidate 포함 | ✅ |
| 외부 서비스 파일 직접 수정 없음 | ✅ |

---

## Report Output

- `reports/source-guard-fix-suggestions-[target].md` — 수정 제안 리포트
- `reports/patch-candidates-[target].diff` — patch 후보 (high confidence only)

---

## Patch Candidate

High confidence 항목만 포함. 적용 방법:

```bash
# 반드시 내용 검토 후 적용
patch -p0 < reports/patch-candidates-bad-service.diff
```

외부 서비스 파일은 직접 수정하지 않음. 사람이 검토 후 수동 적용.

---

## Limitations

- Regex 기반 스캐닝 (AST 미사용) — 동적 className 조합 미탐지
- 자동 파일 수정 없음 — 리포트 후 Human Decision 필요
- rgba 자동 치환 없음 — EX02/EX03 예외 확인 Human 필요
- Button variant 교체 (ghost → secondary/blue-line) Human Decision 필요
- `#FFFFFF` 같은 공통 색상은 항상 needs-review (다수 semantic token 공유)

---

## Next Recommended Step

1. 실제 서비스 폴더에 `npm run guard:suggest -- --target ../서비스폴더` 실행
2. High confidence 항목부터 디자인팀과 검토
3. Needs Review 항목은 UI 컨텍스트 확인 후 결정
4. Human Decisions Needed 항목은 디자이너·개발자 협의 후 처리
5. GitHub Actions에서 리포트 아티팩트 업로드 추가 (CI 연동)
6. Apply mode 추가 여부 결정 (승인 후 파일 직접 수정하는 `guard:apply` 옵션)

---

*Generated for MVP3.6 — Source Guard Fix Suggestions*
