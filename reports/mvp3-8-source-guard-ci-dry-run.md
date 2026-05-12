# MVP3.8 Source Guard CI Dry Run

**Date:** 2026-05-12  
**Status:** ✅ Complete

---

## Scope

Run Source Guard checks and dry-run reports through GitHub Actions.

CI에서는 디자인시스템 위반 항목을 검사하고, 수정 후보와 dry-run 결과를 리포트로 남깁니다.
실제 파일 수정은 하지 않습니다.

---

## Created

| File | Role |
|------|------|
| `.github/workflows/source-guard-dry-run.yml` | GitHub Actions CI 워크플로우 |

## Updated

| File | 변경 내용 |
|------|-----------|
| `README.md` | MVP3.8 Source Guard CI Dry Run 섹션 추가 (한글 포함) |
| `CLAUDE.md` | MVP3.8 CI Rules 섹션 + 변경이력·완료단계 업데이트 |

---

## Workflow

```
.github/workflows/source-guard-dry-run.yml
```

### 실행 조건

| 트리거 | 조건 |
|--------|------|
| `workflow_dispatch` | GitHub Actions UI 수동 실행 (input: target path) |
| `pull_request` | `registry/`, `scripts/guard/`, `package.json`, `CLAUDE.md`, `README.md` 변경 시 |
| `schedule` | 매일 09:30 KST / 00:30 UTC |

### Job Steps

```
1. Checkout repository (actions/checkout@v4)
2. Setup Node 20 (actions/setup-node@v4)
3. npm install
4. Resolve target path (default: scripts/guard/__fixtures__/bad-service)
5. npm run guard -- --target <target>          [continue-on-error: true]
6. npm run guard:suggest -- --target <target>  [if: always(), continue-on-error: true]
7. npm run guard:apply -- --target <target> --dry-run  [if: always(), continue-on-error: true]
8. Upload artifact (reports/source-guard-*.md, patch-candidates-*.diff, apply-log-*.md)
9. GITHUB_STEP_SUMMARY 출력
10. Fail job if guard returned exit code 1
```

### Safety

- `--apply` 옵션은 CI에서 사용하지 않는다.
- 외부 파일 수정 없음.
- 모든 step에 `continue-on-error: true` → guard 실패해도 suggest/dry-run/artifact 실행.
- 최종 실패 판정은 guard exit code 기반 별도 step으로 처리.

---

## Commands Used in CI

```bash
# 디자인시스템 위반 항목 검사
npm run guard -- --target scripts/guard/__fixtures__/bad-service

# 수정 후보 생성
npm run guard:suggest -- --target scripts/guard/__fixtures__/bad-service

# 적용 예정 변경 미리 확인 (파일 수정 없음)
npm run guard:apply -- --target scripts/guard/__fixtures__/bad-service --dry-run
```

---

## Artifacts

GitHub Actions artifact `source-guard-reports` (30일 보관):

```
reports/source-guard-*.md
reports/patch-candidates-*.diff
reports/source-guard-apply-log-*.md
```

---

## Validation

| 검증 항목 | 결과 |
|-----------|------|
| `.github/workflows/source-guard-dry-run.yml` 생성 | ✅ |
| `workflow_dispatch` input target 있음 | ✅ |
| `pull_request` trigger 있음 | ✅ |
| `schedule` 매일 09:30 KST (00:30 UTC) | ✅ |
| `npm run guard` 실행 | ✅ (로컬 검증: 12 errors, 4 warnings) |
| `npm run guard:suggest` 실행 | ✅ (로컬 검증: 5 high, 7 review, 4 human) |
| `npm run guard:apply --dry-run` 실행 | ✅ (로컬 검증: 1 will apply, 15 skip) |
| `--apply` 사용 없음 | ✅ |
| artifact upload (`reports/source-guard-*.md`) | ✅ |
| `package.json` scripts 확인 (guard, guard:suggest, guard:apply) | ✅ (기존에 모두 존재) |
| fixture 존재 확인 | ✅ (index.html, style.css 기존 존재) |
| README.md 한글 설명 추가 | ✅ |
| CLAUDE.md MVP3.8 CI Rules 추가 | ✅ |

---

## Limitations

- CI 기본 target은 내부 fixture (`scripts/guard/__fixtures__/bad-service`)
- 실제 외부 서비스 repository는 아직 연결되지 않음
- 자동 commit/push 없음 — artifact 다운로드 후 수동 리뷰
- `--apply` 모드는 CI에서 실행되지 않음 (의도적 제한)

---

## Next Recommended Step

1. GitHub Actions UI에서 `Source Guard Dry Run` workflow를 수동 실행하여 artifact 확인
2. 실제 외부 서비스 repository를 submodule 또는 별도 checkout으로 연결
3. `workflow_dispatch` input으로 실제 서비스 경로 지정 테스트
4. PR 시 자동 실행 결과를 PR 코멘트로 남기는 기능 추가 (선택)
5. MVP4 Input / Checkbox 컴포넌트 구현 시작

---

*Generated for MVP3.8 — Source Guard CI Dry Run*
