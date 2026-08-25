# UI Library 3단계 제작 — Base Input · Button

- 작업일: 2026-08-25
- 상태: candidate build complete, independent verification pending
- 범위: Base Input + Button
- 후속 범위: Password Field → Search Input

## 제작 결과

| 항목 | 결과 |
|---|---|
| UI 원본 | `ui-library/src/**` |
| 전체·개별 생성 | 같은 source에서 `ui-library/dist/**` 생성 |
| 공통 CSS 의존성 | 생성된 `tokens.css`, `typography.css`를 dist에 포함 |
| JavaScript | 두 컴포넌트 모두 `jsRequired=false`; metadata module만 제공 |
| 빈 페이지 소비 | 전체 bundle·개별 component fixture 생성 |
| 검수 화면 | `pages/ui-review.html`; 실제 dist만 소비 |
| 사이트 기존 화면 | `pages/components.html` 변경 없음 |

## 구현된 계약

- Button: primary·secondary·blue-line, PC md/xsm/xxsm, Mobile lg, native hover/active/disabled, `:focus-visible` 2px outline + 2px 바깥 간격
- Base Input: label·field·control·message 공개 part, PC xxsm/xsm/md, Mobile md 48px, focus/filled/error/correct/read-only/disabled
- Password Field와 Search Input은 Base Input 내부에 임시 구현하지 않고 후속 module dependency로만 기록

## 제작자 기술 검사

- `npm run ui:build -- --check`
- `npm run ui:test -- --check`
- `npm run ui:contract`
- CSS·JavaScript 구문 검사
- 390px 검수 화면 가로 넘침 0
- 브라우저 콘솔 오류 0

위 결과는 제작자 기술 검사이며 독립 PASS가 아니다. 최종 판정은 4-verification 기록을 따른다.
