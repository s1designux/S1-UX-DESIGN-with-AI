# 컴포넌트 제공 수준 재고조사

조사일: 2026-08-24  
범위: Figma 설치기 정본 → Registry 문서 → `pages/components.html` → 퍼블리셔용 CSS

## 한눈에 보는 결과

| 층 | 결과 | 의미 |
|---|---:|---|
| Figma 설치기 정본 | 42개 | `build-components.ts`의 공개 빌드 목록 기준 |
| Registry 목록 | 19개 | 설치기 42개와 1:1 목록이 아님. 주요 컴포넌트 중심 |
| 사이트 실제 예시 | 19개 컴포넌트 / 18개 섹션 | Input 섹션이 Input과 Search Input을 함께 보여줌 |
| 복사 버튼이 있는 HTML | 15개 컴포넌트 / 14개 섹션 | CSS가 배포되지 않아 이것만으로는 복붙 완성 불가 |
| HTML은 있으나 복사 버튼 없음 | 3개 | Table, Pagination, Time Picker |
| 실제 예시만 있고 HTML 없음 | 1개 | Date Picker |
| 토큰표만 있음 | 18개 | 사이트에서 형태나 복사용 코드를 확인할 수 없음 |
| 사이트 섹션도 없음 | 5개 | Dropdown List, Time Picker Mobile Bottom Sheet, Bottom Sheet, Bottom Sheet Option, Modal |
| 배포 가능한 컴포넌트 CSS | 0개 | 외부 CSS 2개는 모두 미연결이며 현재 구현의 완전한 배포본이 아님 |

> 결론: 현재 사이트는 19개 주요 컴포넌트를 “보여주는 곳”으로는 작동하지만, 어느 컴포넌트도 HTML+CSS를 함께 가져가 완성할 수 있는 배포 상태는 아니다.

## 앞선 조사에서 바로잡을 내용

1. Input에는 HTML·CSS·JavaScript 탭과 복사 버튼이 있다. Input 본체, Search Input, Password Field 예시가 각각 제공된다.
2. Footer·CI·StatusBar·NavBar·Modal은 설치기 코드 정본에 모두 존재한다. “정본 미구현”이 아니라 “사이트 예시·복사용 코드가 없거나 부족함”이 정확한 표현이다.
3. 독립적인 `360px 화면 프레임` 컴포넌트만 실제로 없다. 다만 StatusBar·NavBar·모바일 Footer 등 여러 정본 부품은 360px 폭을 사용한다.
4. 푸터의 현재 코드 정본과 콘텐츠 정본은 모두 `위치기반 서비스 이용약관`이다. `영상정보처리방침`을 쓰는 로그인 패턴 화면이 현재 정본과 다르다.

## 42개 전체 재고

표기:

- `예시+복사`: 실제 예시와 HTML 복사 버튼이 있음
- `예시+HTML`: HTML 탭은 있지만 복사 버튼이 없음
- `예시만`: 실제 예시는 있으나 HTML이 없음
- `토큰만`: 토큰표만 있고 실제 예시와 HTML이 없음
- `없음`: 사이트 섹션 자체가 없음
- 외부 CSS는 전 항목 `없음`이다. 사이트 내부 CSS 탭은 배포 파일이 아니다.

| 분류 | 설치기 정본 컴포넌트 | Registry | 사이트 제공 | 외부 CSS | 판정 |
|---|---|---:|---|---:|---|
| Platform | StatusBar | 없음 | 토큰만 | 없음 | 부분 완비 |
| Platform | NavBar | 없음 | 토큰만 | 없음 | 부분 완비 |
| Platform | CI | 없음 | 토큰만 | 없음 | 부분 완비 |
| Platform | LoginGNB | 없음 | 토큰만 | 없음 | 부분 완비 |
| Platform | WebTabBar | 없음 | 토큰만 | 없음 | 부분 완비 |
| Platform | Footer | 없음 | 토큰만 | 없음 | 부분 완비 |
| Navigation | GNB | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Navigation | GNB Utility Icon | 없음 | 토큰만 | 없음 | 부분 완비 |
| Navigation | Language Icon | 없음 | 토큰만 | 없음 | 부분 완비 |
| Navigation | Mobile Bottom Nav | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Line Tab | Line Tab Set | 있음(`tab`) | 예시+복사 | 없음 | 부분 완비 |
| Line Tab | Line Tab | 없음 | 토큰만 | 없음 | 부분 완비 |
| Pagination | Pagination | 있음 | 예시+HTML | 없음 | 부분 완비 |
| Pagination | Pagination Cell | 없음 | 토큰만 | 없음 | 부분 완비 |
| Actions | Button | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Selection | Checkbox | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Selection | Radio | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Selection | Toggle | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Selection | Multi Toggle | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Selection | Multi Toggle Element | 없음 | 토큰만 | 없음 | 부분 완비 |
| Dropdown | Dropdown | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Dropdown | Dropdown List | 없음 | 없음 | 없음 | 부분 완비 |
| Chip | Chip | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Form Control | Input | 있음 | 예시+복사 | 없음 | 부분 완비 |
| Form Control | Search Input | 없음(공용 Input 문서) | 예시+복사(같은 섹션) | 없음 | 부분 완비 |
| Form Control | Text Area | 있음(`textarea`) | 예시+복사 | 없음 | 부분 완비 |
| Form Control | Select Box | 있음(`select`) | 예시+복사 | 없음 | 부분 완비 |
| Date Picker | Date Picker | 있음 | 예시만 | 없음 | 부분 완비 |
| Date Picker | Calendar | 없음 | 토큰만 | 없음 | 부분 완비 |
| Date Picker | Calendar Cell | 없음 | 토큰만 | 없음 | 부분 완비 |
| Date Picker | Calendar Tile | 없음 | 토큰만 | 없음 | 부분 완비 |
| Date Picker | Date Picker Mobile Bottom Sheet | 없음 | 토큰만 | 없음 | 부분 완비 |
| Time Picker | Time Picker | 있음 | 예시+HTML | 없음 | 부분 완비 |
| Time Picker | Time Picker Dropdown | 없음 | 토큰만 | 없음 | 부분 완비 |
| Time Picker | Time Picker Cell | 없음 | 토큰만 | 없음 | 부분 완비 |
| Time Picker | Time Picker Mobile Bottom Sheet | 없음 | 없음 | 없음 | 부분 완비 |
| Table | Table | 있음 | 예시+HTML | 없음 | 부분 완비 |
| Table | Table Cell | 없음 | 토큰만 | 없음 | 부분 완비 |
| Bottom Sheet | Bottom Sheet | 없음 | 없음 | 없음 | 부분 완비 |
| Bottom Sheet | Bottom Sheet Option | 없음 | 없음 | 없음 | 부분 완비 |
| Modal | Modal | 있음 | 없음 | 없음 | 불일치 |
| Filter Chip | Filter Chip | 있음 | 예시+복사 | 없음 | 부분 완비 |

설치기 정본은 42개지만 생성된 facts에는 43개가 잡힌다. `GNB Menu`가 GNB 빌더 안에서 함께 만들어지는 부수 컴포넌트이기 때문이다. 공개 빌드 목록 수에는 포함하지 않았다.

## 사이트 제공 수준 상세

### 예시와 복사 버튼이 있는 14개 섹션

Checkbox, Radio, Toggle, Multi Toggle, Input, Chip, Filter Chip, Button, Textarea, Line Tab(`tab`), GNB, Select, Dropdown, Mobile Bottom Nav.

Input 한 섹션이 Input과 Search Input을 함께 다루므로 설치기 컴포넌트로 세면 15개다. Password Field도 같은 섹션에 예시와 복사 버튼이 있지만 현재 42개 설치기 목록의 독립 컴포넌트는 아니다.

### 복사 동작의 불균일

- Table, Pagination, Time Picker는 HTML 탭이 있지만 복사 버튼이 없다.
- Date Picker는 실제 예시가 있으나 HTML 코드가 없다.
- 일부 복사 버튼은 현재 선택한 탭이 아니라 특정 PC HTML만 복사한다.
- Input의 CSS 탭은 전체 구현 CSS가 아니므로 “CSS 제공 완료”로 볼 수 없다.
- Filter Chip은 HTML과 토큰 탭만 있고 CSS 탭이 없다.

### 토큰표만 있는 18개 섹션

Line Tab 요소, StatusBar, NavBar, LoginGNB, WebTabBar, CI, Multi Toggle Element, Footer, GNB Utility Icon, Language Icon, Pagination Cell, Calendar, Calendar Cell, Calendar Tile, Date Picker Bottom Sheet, Time Picker Dropdown, Time Picker Cell, Table Cell.

이 영역은 `GEN:COMPONENT-STUBS` 자동 생성 구간이다. 컴포넌트 정본이 없다는 뜻이 아니라, 사이트가 토큰 정보만 노출한다는 뜻이다.

## CSS 배선 조사

사이트가 실제로 읽는 스타일은 다음과 같다.

1. `pages/components.html` → `assets/css/style.css`
2. `style.css` → `site-base.css`, `typography.css`
3. `pages/components.html` → `tokens.css`
4. 컴포넌트 표현 CSS → `pages/components.html` 내부 `<style>`

`assets/css/components/input.css`와 `button.css`는 어디에서도 불러오지 않는다.

- `input.css`: 현재 인라인 구현과 값·토큰 참조·지원 상태가 다른 오래된 부분 사본이다.
- `button.css`: 파일 주석상 비공식·폐기된 `.sw-button` 계열이며 현재 사이트의 `.s1-btn` 정본과 다르다.
- 두 파일이 기대는 `component-tokens.css`도 미연결 상태다.
- package scripts에는 컴포넌트 CSS를 생성·묶기·배포하는 명령이 없다.

따라서 외부 CSS 파일이 “존재한다”와 “배포 가능하다”를 구분해야 한다. 현재 배포 가능한 컴포넌트 CSS는 0개다.

## 발견된 불일치와 조사 도구의 사각지대

| 항목 | 현재 상태 | 영향 |
|---|---|---|
| Modal 상태 | 빌더·runner·Figma 노드가 존재하고 개별 JSON에는 검증 완료 기록, index는 `not-started` | Registry 목록 상태가 실제 정본보다 뒤처짐 |
| Line Tab 사이트 섹션 | 실제 예시 `tab`과 토큰 전용 `line-tab`이 함께 존재 | 단순 섹션 수 집계 시 중복으로 오해 가능 |
| CSS 죽은 파일 검사 | `component-tokens.css`, `input.css`만 고정 검사 | 똑같이 미연결인 `button.css`가 결과에서 빠짐 |
| 기존 재고 스캐너 | 사이트 섹션만 세며 CSS 탭 존재를 CSS 배포 가능으로 오해할 수 있음 | 42개 정본 전체와 실제 복붙 가능성을 판정하지 못함 |

Registry 19개와 설치기 42개의 차이는 곧바로 “23개 문서 누락”을 뜻하지 않는다. 42개에는 내부 요소와 플랫폼 셸이 포함되며, 현재 Gate도 이들을 별도 분류한다. 다만 Footer·CI·StatusBar·NavBar처럼 여러 화면에서 직접 재사용할 공개 부품의 문서 경계는 다음 정비 단계에서 확정할 필요가 있다.

## 권장 정비 순서

1. **배포 CSS 정본·생성 경로 확정**  
   손관리 사이트 CSS를 긁지 않고, 정본에서 퍼블리셔용 CSS를 생성·배포할 방법을 먼저 정한다.
2. **공통 모바일 부품의 코드 제공층 추가**  
   이미 정본에 있는 Footer·CI·StatusBar·NavBar·Modal을 새로 만들지 말고, 복사용 HTML과 배포 CSS에 노출한다.
3. **Registry 상태 정렬**  
   Modal의 `not-started` 드리프트를 고치고, 공개 셸과 내부 요소의 문서 등록 기준을 확정한다.
4. **코드 제공 공백 해소**  
   Date Picker HTML, Table·Pagination·Time Picker 복사 동작, 토큰 전용 및 무섹션 항목을 우선순위에 따라 보완한다.
5. **360px 화면 프레임 필요성 결정**  
   현재는 독립 정본이 없다. 여러 화면의 조립 기준으로 정말 필요한지 확인한 뒤 신규 정본 승인 대상으로 다룬다.

## 검증 결과

| 검사 | 결과 |
|---|---|
| 정본 → guide model 드리프트 | 통과 · 42개 일치 |
| 설치기 → 사이트 섹션 분류 | 통과 · 미분류 0, 섹션 누락 0 |
| 변형축 사이트 커버리지 | 통과 · 49/49 |
| 컴포넌트 토큰 키 공급 | 통과 · 누락 0 |
| 크기 이름 규칙 | 위반 0 · GNB Menu 1개는 사이트 대조 미계측 |
| CSS 연결 | 실패 수준 · 컴포넌트 배포 CSS 0, 미연결 파일 존재 |

검증 통과는 “복붙 가능한 코드가 완비됐다”는 뜻이 아니다. 현재 Gate는 정본·토큰·사이트 분류와 변형 표시를 검증하지만, HTML+CSS 배포 완결성까지 검사하지 않는다.

## 근거 파일

- `plugins/figma-vars-installer/src/build-components.ts`
- `registry/components/component-facts.json`
- `registry/components/index.json`
- `registry/components/modal.json`
- `registry/governance/component-page-coverage.json`
- `registry/content/footer.json`
- `pages/components.html`
- `assets/css/style.css`
- `assets/css/component-tokens.css`
- `assets/css/components/input.css`
- `assets/css/components/button.css`
- `scripts/component-page-coverage-check.js`
- `scripts/scan-system-map.js`

