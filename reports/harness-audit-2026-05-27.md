# Harness Audit Report — 2026-05-27

> **자동 생성:** `npm run harness:audit`  
> **대상:** `pages/components.html`  

## 요약

| 구분 | 건수 |
|------|------|
| 🔴 Error | 0 |
| 🟡 Warn  | 0  |
| ✅ Pass  | 9 |

## RULE-1 — 사이즈 HTML 분기

- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))
- ✅ [chip] 모든 사이즈 분기 존재 (md/default / sm (h28) / mobile)
- ✅ [table] 모든 사이즈 분기 존재 (md (h44) / sm (h38))
- ✅ [time-picker (input형)] 모든 사이즈 분기 존재 (default (h44) / xsm (h34) / xxsm (h28) / mobile (h48))

## RULE-2 — 인라인 forced-dark 패널

- ✅ 인라인 forced-dark 패널 없음 — 전역 테마 토글 방식 올바르게 사용 중

## RULE-3 — 아이콘 색상 일관성

- ✅ [form-control-icon-default] 아이콘 색상 일관됨 — var(--color-form-control-icon-default)
- ✅ [disabled-icon-color] disabled 아이콘 색상 — 허용 토큰 사용 중 (var(--color-icon-muted), var(--color-form-control-text-disabled))

## RULE-1b — 사이즈 CSS 탭 분기

- ✅ [table] CSS 사이즈 modifier 분기 존재
- ✅ [chip] CSS 사이즈 modifier 분기 존재

## 조치 가이드

모든 검사를 통과했습니다. 추가 조치 불필요.
