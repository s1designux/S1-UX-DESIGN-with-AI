# MVP3.4.1 — Button Documentation / Registry / Portal Sync

**Date:** 2026-05-12  
**Status:** ✅ Complete  
**Sync Check:** 37 passed · 2 warnings · 0 issues

---

## 작업 범위

Button 관련 파일 전체 정합성 점검 + Figma MCP 비교 결과 반영 + 자동화 동기화 스크립트 구축.

---

## 1. 파일 점검 결과 (MVP3.4.1 시작 시점)

### 발견된 불일치

| 파일 | 항목 | 문제 | 조치 |
|------|------|------|------|
| `registry/components/button.json` | `variants.state` | `"loading"` 누락 | 추가 |
| `registry/components/button.json` | `harness.columns` | `"loading"` 누락 | 추가 |
| `registry/components/button.json` | `harness.staticPreviewColumns` | `"loading"` 누락 | 추가 |
| `registry/components/button.json` | `harness.pcColumns` | `"loading"` 누락 | 추가 |
| `tokens/component-tokens-extracted.md` | variant 목록 | `ghost` 공식 표기, `blue-line` 미표기 | ghost deprecated 처리, blue-line 섹션 추가 |
| `tokens/component-tokens-extracted.md` | 토큰 값 | `color-border-default` 사용 (잘못됨) | `color-border-disabled`로 수정 |
| `tokens/component-tokens-extracted.md` | 상태 coverage 표 | `ghost` 컬럼, `loading` 행 누락 | blue-line으로 교체, loading 행 추가 |
| `README.md` | Button Standard 섹션 | 없음 | "Button Current Standard" 섹션 신규 추가 |
| `CLAUDE.md` | Button Standard 섹션 | 없음 | "Current Button Standard (MVP3.4.1)" 10개 규칙 추가 |

---

## 2. Figma MCP 비교 결과 반영 (MVP3.4)

Figma MCP (`mcp__plugin_figma_figma__get_design_context`, node `6440:4032`) 에서 확인한 결과를 registry/CSS에 반영.

### 확정된 수정 6건

| 토큰 | 변경 전 | 변경 후 | 근거 |
|------|---------|---------|------|
| `--button-primary-disabled-bg` | `var(--color-border-default)` | `var(--color-bg-subtle)` | Figma: `#F5F5F5` = color-bg-subtle |
| `--button-primary-disabled-border` | (없음) | `var(--color-border-disabled)` | Figma: disabled border = color/gray/200 |
| `--button-secondary-hover-border` | `var(--color-border-strong)` | 삭제 | Figma: hover border = default (변화 없음) |
| `--button-secondary-disabled-border` | `var(--color-border-subtle)` | `var(--color-border-disabled)` | Figma: 통일된 disabled border |
| `--button-blue-line-hover-border` | `var(--color-action-primary-hover)` | `var(--color-action-primary-default)` | Figma: hover border = default border (변화 없음) |
| `--button-blue-line-disabled-border` | `var(--color-border-subtle)` | `var(--color-border-disabled)` | Figma: 통일된 disabled border |

### 신규 Semantic Token — `--color-border-disabled`

Figma 확인: 모든 버튼 variant의 disabled border는 `color/button/border/disabled` → `color/gray/200` (`#D9D9D9`)로 통일.

```css
/* Light */
--color-border-disabled: var(--color-gray-200);

/* Dark */
--color-border-disabled: rgba(255, 255, 255, 0.07);
```

반영 파일:
- `assets/css/tokens.css` — Light/Dark 섹션에 추가
- `tokens/semantic.md` — 테이블 행 추가
- `pages/semantic.html` — border 데이터 배열에 추가
- `registry/tokens/component.tokens.json` — 3개 disabled-border 토큰 참조 변경

---

## 3. 동기화 자동화 구축

### 3.1 파일 목록

| 파일 | 역할 |
|------|------|
| `scripts/sync/utils.js` | readJson / readFile / writeReport / formatDate 공통 유틸 |
| `scripts/sync/button-sync-check.js` | Button 정합성 검사 스크립트 (37개 체크) |
| `package.json` | `npm run sync:button` 스크립트 정의 |
| `.github/workflows/button-sync-check.yml` | 매일 09:30 KST 자동 실행 |
| `reports/button-sync-check.md` | 검사 결과 리포트 (자동 생성) |

### 3.2 검사 항목 (37개)

| 대상 파일 | 검사 내용 |
|-----------|-----------|
| `registry/components/button.json` | 공식 variants 3종, state loading 포함, harness 6컬럼, interactiveColumn=action |
| `registry/figma/figma-map.json` | variants figma 매핑, ghost deprecated 상태, action ≠ valueMap, figmaNodeId 등록 |
| `registry/tokens/component.tokens.json` | variants 토큰 배열 존재, raw HEX 없음, ghost deprecated 처리 |
| `pages/components.html` | CSS 클래스 3종, action-cell, is-preview, ghost 미노출 |
| `README.md` | Button Current Standard 섹션, action 참조, ghost disclaimer |
| `CLAUDE.md` | Current Button Standard, action≠Figma state 규칙, ghost 규칙 |
| `assets/css/components/button.css` | sw-button 클래스 3종, loading 클래스 |

### 3.3 미결 경고 (2건 — Human Decision 필요)

| 경고 | 내용 |
|------|------|
| `is-loading` CSS | `s1-btn`에 loading 상태 CSS 미정의 — spinner/opacity/text 방식 결정 필요 |
| raw HEX in button.css | `button.css`에 `#` 문자 포함 — 컴포넌트 레벨 HEX 여부 확인 필요 |

---

## 4. GitHub Actions 워크플로우

```yaml
# .github/workflows/button-sync-check.yml
on:
  schedule:
    - cron: '30 0 * * *'   # 09:30 KST = 00:30 UTC
  workflow_dispatch:
```

- 매일 09:30 KST 자동 실행
- 이슈 발견 시 exit code 1 → CI 실패 알림
- 리포트 아티팩트 30일 보관

---

## 5. 최종 sync check 결과

```
Results: 37 passed · 2 warnings · 0 issues
Report:  reports/button-sync-check.md
```

---

*Generated for MVP3.4.1 — Button Documentation / Registry / Portal Sync*
