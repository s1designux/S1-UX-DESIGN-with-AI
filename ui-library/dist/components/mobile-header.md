# S1MobileHeader — `data-s1-component="mobile-header"`

> 자동 생성된 설명서입니다. 손으로 고치지 마세요 — 다음 배포 때 사라집니다.
> **모바일 전용 부품입니다.** PC 화면에는 쓰지 않습니다(PC 는 대응 부품을 쓰세요 — 아래 「이럴 땐 다른 걸」).

## 언제 쓰나

- 모바일 앱 또는 모바일 웹 화면에서 상단 전역 크롬과 화면 이동 동작을 제공할 때.
- 회원가입처럼 앱바 안 제목을 비우고 본문 큰 제목을 사용하는 화면에는 Standard / No Title을 쓴다.

## 이럴 땐 다른 걸

- PC 화면의 전역 내비게이션에는 GNB를 쓴다.
- 모바일 화면이 아닌 PC 전용 헤더에는 사용하지 않는다.

## 시작하기

1. 마크업은 예시 파일을 복사해서 씁니다: `examples/mobile-header.mobile.html`
2. 겉모습: 전체 묶음 `s1-ui.css` 한 줄이면 됩니다. 이 부품만 쓰려면 `assets/css/tokens.css` · `assets/css/typography.css` · `components/mobile-header.css` 를 읽습니다.
3. 동작(JS)은 필요 없습니다 — 마크업과 CSS 만으로 동작합니다.

## 고르는 속성

| 속성 | 뜻 | 쓸 수 있는 값 |
|---|---|---|
| `data-variant` | 종류 | `home-title` `home-title-subtitle` `standard-title` `standard-title-close` `standard-no-title` `standard-no-title-close` |

예시에는 일부 값만 나옵니다. 다른 값은 속성 값만 바꾸면 됩니다.

## 마크업 규칙

- 루트: `header[data-s1-component=mobile-header][data-variant]`
- 꼭 있어야 하는 속성: `data-variant`
- home-title 는 back·close·spacer 슬롯이 아예 없다 — title 하나가 전체 폭을 채운다(정본 :3151-3153, appBar 가 title 한 자식만 갖는다).
- standard-no-title·standard-no-title-close 는 [data-s1-part=title] 이 비어 있는 <span> 이다(heading 아님) — 실제 페이지 제목은 본문의 h1 이 맡고, 이 자리는 back/close 대칭을 위한 레이아웃 자리표시자일 뿐이다.
- title 텍스트가 있는 변형(home-title·home-title-subtitle·standard-title·standard-title-close)은 [data-s1-part=title] 이 h1 이다 — 헤더가 화면의 주 제목 역할을 한다.
- back·close·notification 버튼의 aria-label 은 화면 맥락에 맞게 교체한다(예시는 기본값 '이전'·'닫기'·'알림').

## 접근성 — 퍼블리셔가 지킬 것

- **역할**: header[data-s1-component=mobile-header]. title 이 있는 변형은 h1, 없는 변형은 빈 span(비-heading) — river 표준안 승인 2026-09-02
- **이름**: back·close·notification 버튼은 화면 맥락에 맞는 aria-label 을 갖는다. title 이 없는 유형은 본문 h1 이 화면의 주 제목 역할을 한다.
- **키보드**: native button Enter·Space 활성화.
- **초점**: 브라우저 기본 포커스 표시를 그대로 쓴다 — 정본에 focus 표현이 없어 웹에서 만들지 않는다(2026-09-02 river 결정).
- **touchTarget**: back·close·notification 은 시각 32×32(정본 그대로, D4)이되 실제 터치 영역은 CSS ::before 로 44×44 까지 넓힌다.

---

정본 지문 `3303abdc3a7be8f46cea85599ae878aee46096c8ffd72ddfe18199a69f7421a4` · 부품 버전 0.2.4
