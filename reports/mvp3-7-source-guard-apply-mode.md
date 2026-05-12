# MVP3.7 Source Guard Apply Mode

**Date:** 2026-05-12  
**Status:** ✅ Complete

---

## Scope

Apply high-confidence Source Guard fix suggestions to external service targets with explicit approval.
외부 서비스 프로젝트의 디자인시스템 위반 항목 중 확실한 수정 후보만 실제 파일에 적용합니다.

---

## Created

| File | Role |
|------|------|
| `scripts/guard/apply-fixes.js` | CLI entry — `--dry-run` / `--apply` 분기, 전체 파이프라인 |
| `scripts/guard/apply-rules.js` | 자동 적용 가능 여부 판정. NEVER_AUTO_APPLY 항목 정의 |
| `scripts/guard/patch-utils.js` | 파일 치환 엔진 — before 검증 + indent 보존 + bottom-up 적용 |
| `scripts/guard/backup-utils.js` | --apply 시 수정 대상 파일 백업 (`reports/apply-backups/`) |

## Updated

| File | 변경 내용 |
|------|-----------|
| `package.json` | `"guard:apply": "node scripts/guard/apply-fixes.js"` 추가 |
| `README.md` | MVP3.7 Source Guard Apply Mode 사용법 + Safety Rules 추가 (한글 포함) |
| `CLAUDE.md` | MVP3.7 Apply Mode Rules + 변경이력·완료단계 업데이트 |

---

## Commands

```bash
# 적용될 변경 사항을 미리 확인합니다. 실제 파일은 수정하지 않습니다.
npm run guard:apply -- --target ../service-project --dry-run

# 확실한 수정 후보만 실제 외부 서비스 프로젝트 파일에 적용합니다.
npm run guard:apply -- --target ../service-project --apply
```

---

## Safety Rules

| 규칙 | 설명 |
|------|------|
| `--apply` 필수 | 플래그 없이는 절대 파일 수정 불가 |
| High-confidence only | `confidence=high` AND `patchable=true` 항목만 적용 |
| ghost 자동 수정 금지 | deprecated variant는 Human Decision 필수 |
| rgba 자동 수정 금지 | EX02/EX03 예외 확인 Human 필요 |
| 다의적 색상 금지 | #FFFFFF 등 여러 semantic token 공유 색상은 needs-review |
| Foundation direct 금지 | 여러 후보가 있는 경우 자동 치환 금지 |
| before 중복 시 skip | 같은 before 문자열이 파일에 2번 이상이면 skip (모호성) |
| 자동 backup | --apply 실행 시 반드시 backup 생성 후 진행 |

---

## Pipeline

```
target scan
  ↓
checkColors + checkCssVars + checkButtonVariants + checkInlineStyles
  ↓
generateSuggestion (fix-suggestion-rules.js)
  ↓
partitionApplicable (apply-rules.js) — NEVER_AUTO_APPLY 필터
  ↓
[dry-run] → console preview + apply log
[apply]   → createBackup → applyChangesToFile (patch-utils.js) → apply log
```

## apply-rules.js — NEVER_AUTO_APPLY

```js
const NEVER_AUTO_APPLY = new Set([
  'raw-rgba',
  'deprecated-button-variant',
  'unknown-button-variant',
  'ambiguous-button-variant',
  'inline-style-color',   // requires structural change
]);
```

## patch-utils.js — 치환 안전성

```
1. 대상 라인 내용이 suggestion.before와 일치하는지 검증
2. 파일 내 해당 텍스트 등장 횟수 확인 (2회 이상이면 skip)
3. 라인 앞 indentation 보존
4. 변경은 bottom-up 순서 (높은 라인 번호 먼저) — index shift 방지
5. write 실패 시 모든 applied → skipped 처리
```

---

## Validation

| 검증 항목 | 결과 |
|-----------|------|
| `--target` 없으면 usage 출력 | ✅ |
| `--apply` 없으면 mode 미지정 안내 | ✅ |
| `--dry-run` 실행 시 파일 미수정 | ✅ |
| `--apply` 없이는 파일 수정 불가 | ✅ |
| `rgb(32,32,32)` → `var(--color-text-primary)` 1건 적용 | ✅ |
| ghost variant skip (needs-human) | ✅ |
| rgba skip (needs-human) | ✅ |
| `#FFFFFF` skip (needs-review) | ✅ |
| inline-style-color skip | ✅ |
| 원본 fixture 손상 없음 | ✅ |
| backup 생성 (`reports/apply-backups/`) | ✅ |
| apply log 생성 (`reports/source-guard-apply-log-*.md`) | ✅ |

---

## dry-run 출력 예 (bad-service fixture)

```
Source Guard Apply Mode
Target: scripts/guard/__fixtures__/bad-service
Mode:   dry-run

Will apply:
  - 1 raw-rgb replacement

Will skip:
  - 5 raw-hex
  - 2 raw-rgba
  - 2 deprecated-button-variant
  - 1 ambiguous-button-variant
  - 3 inline-style-color
  - 1 foundation-color-direct
  - 1 undefined-token

No files were modified.
```

---

## Limitations

- Simple string replacement (AST 파서 미사용) — 동적 className 조합 미탐지
- JSX `style={{ }}` 치환 미지원 (HTML inline style만 지원)
- Interactive confirmation UI 없음 (dry-run → apply 2단계 수동 진행)
- `--apply` 후 rollback 명령 없음 (backup에서 수동 복구)

---

## Next Recommended Step

1. 복사된 실제 서비스 폴더에서 dry-run 실행 → 팀 리뷰
2. 검토 완료 후 apply 실행
3. apply log와 backup을 팀 공유
4. GitHub Actions dry-run report 자동 업로드 추가
5. MVP4 Input / Checkbox 컴포넌트 구현 시작

---

*Generated for MVP3.7 — Source Guard Apply Mode*
