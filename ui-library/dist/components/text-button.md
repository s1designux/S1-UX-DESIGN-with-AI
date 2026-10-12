# S1TextButton — `data-s1-component="text-button"`

> 자동 생성된 설명서입니다. 손으로 고치지 마세요 — 다음 배포 때 사라집니다.

## 언제 쓰나

- 링크에 가까운 가벼운 보조 동작(더보기·자세히 등)을 텍스트만으로 표시할 때.
- Primary 는 강조가 필요한 텍스트 액션, Secondary 는 덜 중요한 텍스트 액션.

## 이럴 땐 다른 걸

- 배경·테두리가 있는 버튼이 필요하면 코어 Button 또는 Assist Button 을 쓴다.
- 페이지 이동 전용 링크는 <a> 를 우선 고려한다.

## 시작하기

1. 마크업은 예시 파일을 복사해서 씁니다: `examples/text-button.html`
2. 겉모습: 전체 묶음 `s1-ui.css` 한 줄이면 됩니다. 이 부품만 쓰려면 `assets/css/tokens.css` · `assets/css/typography.css` · `components/text-button.css` 를 읽습니다.
3. 동작(JS)은 필요 없습니다 — 마크업과 CSS 만으로 동작합니다.

## 고르는 속성

| 속성 | 뜻 | 쓸 수 있는 값 |
|---|---|---|
| `data-variant` | 종류 | `primary` `secondary` |

예시에는 일부 값만 나옵니다. 다른 값은 속성 값만 바꾸면 됩니다.

## 마크업 규칙

- 루트: `button[data-s1-component=text-button]`
- 꼭 있어야 하는 속성: `type` `data-variant`
- 꼭 있어야 하는 부분(`data-s1-part`): `label`

## 접근성 — 퍼블리셔가 지킬 것

- **역할**: button
- **이름**: visible label or aria-label
- **키보드**: native Enter and Space activation
- **초점**: 브라우저 기본 포커스 표시를 그대로 쓴다 — 정본에 focus 표현이 없어 웹에서 만들지 않는다(코어 Button 과 같은 방침).

---

정본 지문 `17da62a75a28ba51c74e6c3988f958f104245b178b76275b08bc896faf10a91e` · 부품 버전 0.2.3
