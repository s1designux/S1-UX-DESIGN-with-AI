# UI Library 3단계 제작 — Base Input · Button

- 작업일: 2026-08-25
- 상태: HTML/CSS 공개 계약과 river UX 승인 완료, 독립 실제 렌더 검증 후 기술 승격 예정
- 범위: Base Input + Button
- 후속 범위: Password Field → Search Input

## 제작 결과

| 항목 | 결과 |
|---|---|
| UI 원본 | `ui-library/src/**` |
| 전체·개별 생성 | 같은 source에서 `ui-library/dist/**` 생성 |
| 공통 CSS 의존성 | 생성된 `tokens.css`, `typography.css`를 dist에 포함 |
| JavaScript | Button은 native CSS-only, Input은 Editing remove action의 표시·값 삭제·초점 복귀를 위한 모듈 제공 |
| 빈 페이지 소비 | 전체 bundle·개별 component fixture 생성 |
| 검수 화면 | `pages/ui-review.html`; 실제 dist만 소비 |
| 사이트 기존 화면 | `pages/components.html` 변경 없음 |

## 2026-08-26 HTML/CSS 공개 계약 확정

- Input과 Button manifest에 공개 root·필수 속성·필수/선택 part·상태 selector·배포 경로를 기계 판독 가능한 계약으로 기록했다.
- 패키지 export에 `./components/input/html`, `./components/input/css`, `./components/button/html`, `./components/button/css`를 고정했다.
- HTML은 `dist/examples/{id}.html`, CSS는 `dist/components/{id}.css`로 같은 source에서 생성한다.
- Input의 remove 동작은 CSS만으로 구현할 수 없으므로 `./components/input` JavaScript 모듈을 함께 제공한다.
- river UX 승인과 실제 렌더 검증을 완료했고, 2026-08-26 위험도 기반 독립 검증 생략 결정에 따라 배포 상태를 approved로 승격했다.

## 구현된 계약

- Button: primary·secondary·blue-line, PC md/xsm/xxsm, Mobile lg, native hover/active/disabled, `:focus-visible` 2px outline + 2px 바깥 간격
- Base Input: label·field·control·선택형 message·Editing clear action 공개 part, PC xxsm/xsm/md, Mobile md 48px, focus/filled/error/correct/read-only/disabled
- Password Field와 Search Input은 Base Input 내부에 임시 구현하지 않고 후속 module dependency로만 기록

## 제작자 기술 검사

- `npm run ui:build -- --check`
- `npm run ui:test -- --check`
- `npm run ui:contract`
- CSS·JavaScript 구문 검사
- 390px 검수 화면 가로 넘침 0
- 브라우저 콘솔 오류 0

위 결과는 제작자 기술 검사이며 독립 PASS가 아니다. 최종 판정은 4-verification 기록을 따른다.
