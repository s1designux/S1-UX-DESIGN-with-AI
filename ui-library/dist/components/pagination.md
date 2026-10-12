# S1Pagination — `data-s1-component="pagination"`

> 자동 생성된 설명서입니다. 손으로 고치지 마세요 — 다음 배포 때 사라집니다.

## 언제 쓰나

- 긴 목록·표를 페이지로 나눠 이동할 때.

## 이럴 땐 다른 걸

- 무한 스크롤 UX 에는 쓰지 않는다.
- 적은 항목은 페이지네이션 없이 한 번에 보여준다.

## 시작하기

1. 마크업은 예시 파일을 복사해서 씁니다: `examples/pagination.html`
2. 겉모습: 전체 묶음 `s1-ui.css` 한 줄이면 됩니다. 이 부품만 쓰려면 `assets/css/tokens.css` · `assets/css/typography.css` · `components/pagination.css` 를 읽습니다.
3. 동작: `autoInit()` 이 이 부품을 찾아 붙입니다. 이 부품만 쓰려면 `import { init } from "./s1-ui/components/pagination.js"` 후 `const api = init(요소)` 를 부릅니다.
4. 페이지가 뜬 뒤에 넣은 마크업은 `autoInit(감쌀요소)` 를 한 번 더 부르면 붙습니다(두 번 불러도 겹치지 않습니다).

## 마크업 규칙

- 루트: `nav[data-s1-component=pagination]`
- 꼭 있어야 하는 속성: `data-total-pages` `data-page` `aria-label`
- 꼭 있어야 하는 부분(`data-s1-part`): `arrow-group` `pages` `page`

## 값·옵션 속성

| 속성 | 뜻 |
|---|---|
| `data-total-pages` | 총 쪽수(처음 값). 나중에 바꿀 때는 setTotalPages(count) 를 부른다 — 번호 창을 다시 그리고 현재 쪽 표시를 유지한다 |
| `data-page` | 현재 쪽 |

## 스크립트로 부르기

`init(요소)` 가 돌려주는 객체의 `setPage(page)` · `setTotalPages(count)` · `page` · `totalPages`.

## 접근성 — 퍼블리셔가 지킬 것

- **역할**: nav landmark with native buttons
- **이름**: pagination nav and four arrows have Korean labels; pages include their number
- **키보드**: native Tab, Enter, and Space activation
- **초점**: 브라우저 기본 포커스 표시를 그대로 쓴다 — 정본에 focus 표현이 없어 웹에서 만들지 않는다(2026-09-02 river 결정).
- **상태 표시**: runtime keeps aria-current=page, arrow disabled states, and current page label in sync

---

정본 지문 `3df9b1f45e27908f0f7a57fb0fc2c8ab49fe9b2813e212ac4f75c1f930cd3a2c` · 부품 버전 0.2.4
