# Harness Audit Report — 2026-09-01

> **자동 생성:** `npm run harness:audit`
> **대상:** `pages/components.html`

## 요약

| 구분 | 건수 |
|------|------|
| 🔴 Error | 0 |
| 🟡 Warn  | 3  |
| ✅ Pass  | 12 |

## RULE-1 — 사이즈 HTML 분기

- 🟡 HTML 코드탭 pane "btn-pri-pc" 을 찾을 수 없음
- 🟡 HTML 코드탭 pane "chip-html" 을 찾을 수 없음
- ✅ [table] 모든 사이즈 분기 존재 (md (h44) / sm (h38))
- ✅ [time-picker (input형)] 모든 사이즈 분기 존재 (default (h44) / xsm (h34) / xxsm (h28) / mobile (h48))
- ✅ [time-picker (select형)] 모든 사이즈 분기 존재 (md (h44) / xxsm (h28))
- ✅ [tab (line tab)] 모든 사이즈 분기 존재 (pc-md (font 20px · indicator 2px) / pc-sm (font 16px · indicator 2px) / pc-xsm (h40 · font 14px · indicator 2px))
- ✅ [tab (line tab · mobile)] 모든 사이즈 분기 존재 (mobile (h32 · padding-inline 16))
- ✅ [gnb (menu slot)] 모든 사이즈 분기 존재 (md (h56 · 18px) / sm (h48 · 18px) / xsm (h36 · 14px))
- ✅ [multi-toggle] 모든 사이즈 분기 존재 (md (h44) / sm (h34))
- 🟡 HTML 코드탭 pane "ddl-html" 을 찾을 수 없음

## RULE-2 — 인라인 forced-dark 패널

- ✅ 인라인 forced-dark 패널 없음 — 전역 테마 토글 방식 올바르게 사용 중

## RULE-3 — 아이콘 색상 일관성

- ✅ [form-control-icon-default] 아이콘 색상 일관됨 — var(--color-form-control-icon-default)
- ✅ [disabled-icon-color] disabled 아이콘 색상 — 허용 토큰 사용 중 (var(--color-form-control-icon-disabled), var(--color-form-control-text-disabled))

## RULE-1b — 사이즈 CSS 탭 분기

- ✅ [table] CSS 사이즈 modifier 분기 존재
- ✅ [multi-toggle] CSS 사이즈 modifier 분기 존재

## 조치 가이드

아래 항목은 수동 수정이 필요합니다. `npm run harness:audit -- --fix` 실행 시 자동 수정 가능 항목은 별도 표시됩니다.

### [SIZE_SPLIT] button
HTML 코드탭 pane "btn-pri-pc" 을 찾을 수 없음

### [SIZE_SPLIT] chip
HTML 코드탭 pane "chip-html" 을 찾을 수 없음

### [SIZE_SPLIT] dropdown
HTML 코드탭 pane "ddl-html" 을 찾을 수 없음

