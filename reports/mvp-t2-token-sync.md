# MVP-T2 Token Sync Plugin Report

## 1. 목적

MVP-T1에서 구축한 CSS Token ↔ Registry Token ↔ Figma Variable mapping registry를 기반으로,
Code Token 값을 Figma Variables에 동기화하기 위한 plugin MVP 구조를 구축했다.

이 단계에서는 실제 Figma Variables를 바로 수정하지 않고,
먼저 어떤 token이 sync 가능한지 dry-run으로 점검한다.

---

## 2. 생성/수정 파일

| 파일 | 작업 |
|---|---|
| `plugins/figma-token-sync/manifest.json` | 생성 |
| `plugins/figma-token-sync/tsconfig.json` | 생성 |
| `plugins/figma-token-sync/src/code.ts` | 생성 |
| `plugins/figma-token-sync/src/ui.html` | 생성 |
| `plugins/figma-token-sync/src/sync/types.ts` | 생성 |
| `plugins/figma-token-sync/src/sync/loadRegistry.ts` | 생성 |
| `plugins/figma-token-sync/src/sync/tokenSync.ts` | 생성 |
| `package.json` | `plugin:check` + `plugin:build` 스크립트 추가, devDependencies 추가 |
| `README.md` | MVP-T2 섹션 추가 |
| `CLAUDE.md` | 변경 이력 + MVP-T2 작업 규칙 추가 |

---

## 3. 핵심 결정

| 결정 항목 | 내용 |
|---|---|
| Source of truth | Code registry. Figma Variables는 코드 토큰을 따라가는 동기화 대상 |
| 기본 동작 | dry-run / preview-first. 실제 Figma write 비활성화 |
| 분류 기준 | `stable` + 모든 참조 존재 → sync-ready. `pending` → preview-only. `needs-review` → needs-review. alias/deprecated → excluded |
| component-alias 처리 | status 무관하게 excluded (deduplication — 동일 figmaVariable을 parent semantic이 대표) |
| Figma write 게이트 | `syncStableTokens()` 는 항상 `throw`. collection ID 확정 + manifest permissions + 사람 검토 후에만 활성화 |
| Build 환경 | TypeScript 4-module 구조. `tsc --noEmit` (타입 체크) + `esbuild` (번들). vite/webpack 불필요 |
| 런타임 | esbuild가 번들 시점에 `figma-css-token-map.json` 인라인 포함 → 플러그인 런타임에 파일 접근 없음 |

---

## 4. Sync 분류 기준

| Mapping Status | Sync Status | 처리 |
|---|---|---|
| stable (all refs present) | sync-ready | 동기화 후보 — 실제 write는 `syncStableTokens()` 게이트로 차단 |
| pending | preview-only | Figma Variable 미확정 후보, 실제 sync 제외 |
| needs-review | needs-review | 수동 검토 필요 |
| deprecated | excluded | 제외 |
| category: component-alias | excluded | alias dedup — parent semantic이 Figma write 담당 |

---

## 5. 실제 분류 결과 (43개 항목 기준)

| 분류 | 수 | 대표 항목 |
|---|---|---|
| **sync-ready** | **18** | form-control.bg.default, form-control.border.selected, date-picker.cell.selected.bg, button.primary.default.bg … |
| **preview-only** | **11** | form-control.border.error, color.text.state.helper, button.primary.hover.bg … |
| **needs-review** | **1** | button.primary.default.border (Figma token 존재, code token 없음) |
| **excluded** | **13** | --input-* aliases (9 stable), pending aliases (3), input.action.icon (needs-review alias) |
| **total** | **43** | — |

> 비고: component-alias는 status 무관하게 excluded — stable 9 + pending 3 + needs-review 1 = 13

---

## 6. 빌드 방법

```bash
# 1. 의존성 설치
npm install

# 2. 타입 체크 (noEmit — 빌드 없이 타입 검증만)
npm run plugin:check

# 3. 플러그인 번들 빌드 (esbuild)
npm run plugin:build
# → plugins/figma-token-sync/dist/code.js 생성
```

---

## 7. Figma 플러그인 로드 방법

1. Figma 데스크탑 앱 실행
2. 메뉴 → Plugins → Development → Import plugin from manifest...
3. `plugins/figma-token-sync/manifest.json` 선택
4. Plugins → Development → SW DS Token Sync 실행
5. "Run Dry Check" 클릭 → sync-ready / preview-only / needs-review / excluded 분류 확인

---

## 8. 현재 한계

| 항목 | 상태 |
|---|---|
| Figma Variables API 실제 write | 비활성화 — `syncStableTokens()` 항상 throw |
| Figma Semantic collection ID | 미확정 — Variables 패널에서 직접 확인 필요 |
| pending 11개 | Figma Variable 이름 미확인 — MCP 추가 조회 필요 |
| dark mode 값 | 일부 pending 상태 — dark token 확인 필요 |

---

## 9. 동기화 활성화 조건 (Human Decision 필요)

아래 3가지 모두 충족 후 `syncStableTokens()` 구현 활성화 가능:

1. Figma Variables 패널 → Semantic 컬렉션 ID 확인 → `tokenSync.ts`에 등록
2. `manifest.json` permissions에 `"variables:write"` 추가
3. Dry-run 결과 사람이 검토·승인

```typescript
// tokenSync.ts 에서 수정할 위치
const FIGMA_SEMANTIC_COLLECTION_ID = ""; // ← 여기에 실제 ID 입력
```

```json
// manifest.json 에서 수정할 위치
{ "permissions": ["variables:write"] }
```

---

## 10. 다음 단계

1. **Figma Variables collection ID 확정** (Human) → sync-ready 18개 실제 write 활성화 가능
2. **pending 11개 Figma MCP 재조회** → stable 전환 후 sync-ready로 이동
3. **MVP-C1** — Code Component ↔ Figma Component Mapping Registry
4. **`npm install` + `npm run plugin:build` 실행** → dist/code.js 생성 후 Figma 로드 테스트
