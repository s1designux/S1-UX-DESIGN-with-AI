# UI Library 3단계 제작 — Base Input · Button

- 작업일: 2026-08-25
- 상태: **재개 중(2026-09-04)** — focus-visible 전량 철회본으로 되돌아왔다. 이전 승인·검증은 superseded(D24).
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
- (2026-08-26 시점 기록) river UX 승인과 실제 렌더 검증을 완료하고 approved로 승격했다. **이 승격은 2026-09-02 focus-visible 철회로 superseded 되었다.**

## 구현된 계약

- Button: primary·secondary·blue-line, PC md/xsm/xxsm, Mobile lg, native hover/active/disabled. **키보드 초점 표시는 정본에 없으므로 만들지 않는다 — 브라우저 기본 표시에 맡긴다(2026-09-02 river 지시).**
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

## 2026-09-04 재개 — focus-visible 제거본

2026-09-02 river 지시로 승인 없이 만들어졌던 `:focus-visible` 을 정본·웹 CSS·매니페스트·테스트에서 전량 제거했다.
그 제거본에 대한 4단계 검증을 아무도 하지 않았으므로 단계를 3-build 로 되돌리고 여기서 다시 시작한다.

### 현재 코드 상태

| 확인 | 결과 |
|---|---|
| `ui-library/src`·`ui-library/dist` 안 `focus-visible` 잔존 | **0건** |
| 정본 지문 3건 변경 영향 | Input·Button 빌더 무변경 — 지문만 갱신(D25) |

### 기계검사 (2026-09-04)

| 명령 | 종료코드 |
|---|---|
| `npm run ui:contract` | 0 |
| `npm run ui:build -- --check` | 0 |
| `npm run ui:test -- --check` | 0 |
| `npm run ui:icons` | 0 |
| `npm run ui:icons:origin` | 0 |
| `npm run ui:guide:render` | 0 |
| `npm run ui:state` | 0 |

위는 제작자 기술 검사다. 독립 PASS 가 아니며 최종 판정은 4-verification 을 따른다.
