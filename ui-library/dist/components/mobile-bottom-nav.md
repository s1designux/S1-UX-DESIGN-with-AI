# S1MobileBottomNav — `data-s1-component="mobile-bottom-nav"`

> 자동 생성된 설명서입니다. 손으로 고치지 마세요 — 다음 배포 때 사라집니다.
> **모바일 전용 부품입니다.** PC 화면에는 쓰지 않습니다(PC 는 대응 부품을 쓰세요 — 아래 「이럴 땐 다른 걸」).

## 언제 쓰나

- 모바일 화면에서 최상위 영역 간 이동을 항상 보이게 둘 때.
- 탭 수가 3~5개로 고정된 주요 메뉴 구조일 때.

## 이럴 땐 다른 걸

- PC 화면 — PC 전역 이동은 GNB 를 쓴다.
- 항목이 자주 바뀌거나 6개 이상인 경우(더보기/드로어를 고려한다).

## 시작하기

1. 마크업은 예시 파일을 복사해서 씁니다: `examples/mobile-bottom-nav.mobile.html`
2. 겉모습: 전체 묶음 `s1-ui.css` 한 줄이면 됩니다. 이 부품만 쓰려면 `assets/css/tokens.css` · `assets/css/typography.css` · `components/mobile-bottom-nav.css` 를 읽습니다.
3. 동작(JS)은 필요 없습니다 — 마크업과 CSS 만으로 동작합니다.

## 고르는 속성

| 속성 | 뜻 | 쓸 수 있는 값 |
|---|---|---|
| `data-icon` | 종류 | `home` `search` `notification` `settings` |

예시에는 일부 값만 나옵니다. 다른 값은 속성 값만 바꾸면 됩니다.

## 마크업 규칙

- 루트: `button[type=button][data-s1-component=mobile-bottom-nav][data-icon][role=tab][aria-selected]`
- 꼭 있어야 하는 부분(`data-s1-part`): `icon` `label`
- root 자체가 role=tab 이며, 여러 아이템을 담는 role=tablist 컨테이너(화면 소유)가 바깥에 있어야 완전한 탭 구조가 된다. 배포 예시는 복사만으로 무효 ARIA 가 생기지 않도록 꾸미기 없는 <nav role="tablist"> 껍데기를 포함한다(river 결정 2026-09-02 HD-1 선택지 B) — 껍데기의 배치·배경은 여전히 화면 소유다.
- aria-selected 는 호스트 화면이 현재 경로에 맞춰 정적으로 설정한다 — 이 컴포넌트는 로컬 클릭 토글 로직을 갖지 않는다(jsRequired=false).
- 라벨 텍스트가 곧 접근성 이름이다 — 아이콘은 항상 aria-hidden="true" 로 장식 처리한다.
- data-icon 이 **예시 아이콘**을 고른다(기본값 home — 속성을 빼면 홈으로 그려진다). 예시는 home·search·notification·settings 네 가지다. 실제 화면은 대개 다른 칸 구성을 쓰므로, 받은 아이콘을 style="--s1-mobile-nav-icon: url('…')" 로 끼워 교체한다. 라벨 텍스트는 화면이 정한다.

## 접근성 — 퍼블리셔가 지킬 것

- **역할**: button[role=tab][aria-selected] — 여러 아이템을 담는 role=tablist 컨테이너는 화면이 소유하되, 배포 예시에는 꾸미기 없는 껍데기를 함께 싣는다(river 결정 2026-09-02 HD-1 B)
- **이름**: 라벨 텍스트가 접근성 이름이다. 아이콘만으로 의미를 전달하지 않는다(registry a11y).
- **키보드**: native button Enter·Space 활성화. 여러 탭 사이 화살표 키 이동은 이번 범위 밖(HD-1 선택지 A).
- **초점**: 브라우저 기본 포커스 표시를 그대로 쓴다 — 정본에 focus 표현이 없어 웹에서 만들지 않는다(2026-09-02 river 결정).
- **상태 표시**: 호스트 화면이 현재 경로에 맞춰 aria-selected 를 정적으로 설정한다. CSS 가 [aria-selected="true"] 로 색을 반영하며 별도 런타임은 필요 없다.
- **touchTarget**: 60×60 고정 크기라 최소 44px 권장치를 이미 만족한다(D4).

## 바꿀 수 있는 CSS 변수

`--s1-mobile-nav-icon` — 예: 아이콘 모양을 바꿀 때 `--s1-mobile-nav-icon: url("my-icon.svg")`.

---

정본 지문 `75282d7b2526b2960251072de14292536e4047c9ae5c560f7eefdbd93e92c6e8` · 부품 버전 0.3.6
