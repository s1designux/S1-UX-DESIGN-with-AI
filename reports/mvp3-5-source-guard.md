# MVP3.5 Source Guard

**Date:** 2026-05-12  
**Status:** ✅ Complete  
**Validation:** 12 errors + 4 warnings detected in bad-service fixture (all expected)

---

## Scope

External service target scanning based on SW Design System registry.
The design system repository (`S1_AI_DESIGN_GUIDE`) is the source of truth.
External projects are scanned via `--target` argument — the design system folder itself is NOT the scan target.

---

## Created

| File | Role |
|------|------|
| `scripts/guard/index.js` | CLI entry point — `--target` 옵션, scan orchestration |
| `scripts/guard/load-registry.js` | Registry JSON 로드 — allowed variants, known tokens, foundation prefixes |
| `scripts/guard/scan-target.js` | Target 파일 수집 — 재귀 탐색, 제외 폴더 처리 |
| `scripts/guard/check-colors.js` | Raw HEX / rgb() / rgba() 탐지 |
| `scripts/guard/check-css-vars.js` | Undefined var() / Foundation 직접 참조 탐지 |
| `scripts/guard/check-button-variants.js` | Ghost / deprecated Button variant 탐지 |
| `scripts/guard/check-inline-styles.js` | Inline style color 탐지 |
| `scripts/guard/report.js` | Markdown 리포트 생성 + 콘솔 요약 출력 |
| `scripts/guard/utils.js` | 공통 경로 유틸 |
| `scripts/guard/__fixtures__/bad-service/index.html` | 검증용 fixture — HTML |
| `scripts/guard/__fixtures__/bad-service/style.css` | 검증용 fixture — CSS |

## Updated

| File | 변경 내용 |
|------|-----------|
| `package.json` | `"guard": "node scripts/guard/index.js"` 스크립트 추가 |
| `README.md` | MVP3.5 Source Guard 사용법 섹션 추가 |
| `CLAUDE.md` | MVP3.5 Source Guard Rules 섹션 추가, 변경이력·완료단계 업데이트 |

---

## Checks Implemented

| 검사 항목 | 심각도 | 근거 |
|-----------|--------|------|
| Raw HEX (`#fff`, `#0072CE` 등) | error | audit-rules R02 |
| `rgb()` 직접 사용 | error | audit-rules R02 |
| `rgba()` 직접 사용 | warning | token-exceptions EX02/EX03 확인 필요 |
| Foundation color primitive 직접 참조 (`var(--color-blue-400)` 등) | warning | audit-rules R01 |
| Registry에 없는 CSS variable (`var(--unknown-token)`) | error | — |
| Deprecated Button variant (`ghost`, `danger`, `outlined`, `tertiary`) | error | audit-rules R05 |
| 혼동 가능 variant (`outline`, `line`) | warning | blue-line 혼동 가능성 |
| Unknown Button variant | warning | — |
| Inline style color (`style="color: #..."`, JSX `style={{ color: "..." }}`) | error | — |

---

## Usage

```bash
npm run guard -- --target ../service-project
```

또는 특정 파일만:

```bash
node scripts/guard/index.js --target ../service-project/src/Button.jsx
```

---

## Validation

```
$ npm run guard -- --target scripts/guard/__fixtures__/bad-service

Loading SW Design System registry...
Scanning target: scripts/guard/__fixtures__/bad-service
Found 2 file(s) to scan...

Source Guard — bad-service
══════════════════════════════════════════════════
Files scanned : 2
Errors        : 12
Warnings      : 4
Status        : ❌ FAIL
Report        : reports/source-guard-bad-service.md
```

모든 의도된 위반 항목이 탐지됨. 허용된 correct usage (`sw-button--primary`, semantic token refs)는 미탐지.

---

## Limitations

- Regex 기반 스캐닝 (MVP) — 주석·문자열 내부 오탐 가능성 존재
- AST 파서 미사용 — 동적 클래스 조합(`className={isGhost ? 'ghost' : ''}`) 미탐지
- Figma 파일 스캔 미포함
- 자동 수정 없음 — 리포트 생성 후 Human Decision 필요

---

## Exit Code

| 상황 | Exit Code |
|------|-----------|
| error 발견 | 1 |
| warning만 | 0 |
| 이슈 없음 | 0 |
| `--strict` 옵션 (TODO) | warning도 1 |

---

## Next Recommended Step

1. 실제 서비스 프로토타입 폴더에 guard 실행 후 리포트 검토
2. 디자인팀과 리포트 리뷰 후 autofix 제안 우선순위 결정
3. GitHub Actions에 target scan workflow 추가 (`--target` 은 repository secret or submodule로 관리)
4. Chip, Input 등 추가 컴포넌트 variant 검사 확장 (check-button-variants.js 모듈화)
5. `--strict` 옵션 구현으로 warning도 CI 실패 처리 가능하도록 확장

---

*Generated for MVP3.5 — Source Guard MVP*
