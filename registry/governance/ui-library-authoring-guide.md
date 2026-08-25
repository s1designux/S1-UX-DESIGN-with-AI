# UI 라이브러리 코드 작성 가이드

이 문서는 퍼블리셔·개발자·AI가 코어 컴포넌트를 나중에 안전하게 조합할 수 있도록 HTML·CSS·JavaScript를 만드는 기본 틀이다.

규칙 정본은 [`ui-library-code-contract.json`](ui-library-code-contract.json)이다. 이 문서는 그 계약을 사람이 쉽게 읽을 수 있게 설명한다. 두 파일이 다르면 JSON 계약을 우선하고, 설명 문서를 함께 고친다.

Contract version: `0.1.0`

이 정책의 현재 상태는 `candidate`다. Input·Button 파일럿에서 실제 제작·검수한 뒤 river 승인으로 정책을 `stable`로 승격한다. 개별 컴포넌트의 배포 상태는 별도로 `candidate → verified → approved`를 사용한다.

## 1. 가장 중요한 원칙

UI 라이브러리 코드는 사이트에서 보고 베끼지 않는다. 정본을 입력으로 만들어야 한다.

```text
컴포넌트 시각 정본 + 토큰 정본 + Registry 행동 정본
                         ↓
                    UI 원본 코드
                         ↓
       전체 묶음 · 개별 모듈 · 코드 예시 · 검수 화면
```

- 시각 값은 `build-components.ts`에서 온다.
- 색과 타이포는 `vars-data.ts`, `textstyles-data.ts`에서 온다.
- 사용 맥락·웹 의미·접근성·행동은 `registry/components/*.json`에서 온다.
- 공통 문구는 `registry/content/*.json`, 패턴 문구는 해당 패턴의 copy·content 문서에서 온다.
- 아이콘 허용 키는 `build-components.ts`의 `ICON_KEYS`와 `registry/figma/allowed-remote-keys.json`을 따른다.
- 패턴 flow는 `registry/patterns/{pattern-id}/`에서 온다.
- 사이트·코드탭·배포 파일·패턴 화면은 모두 파생 결과다.

정본에 없는 구조나 동작이 필요하면 코드 안에서 임시로 만들지 않는다. `needs-core-update` 또는 `needs-decision`으로 되돌린다.

## 2. 현재 해결해야 할 공백

이 가이드는 목표 구조다. 현재 저장소가 이미 이 구조라는 뜻은 아니다.

- `components.html`의 인라인 CSS·JavaScript는 실제 동작하는 후보 구현이지만 배포 정본이 아니다.
- UI library source·dist·build·bundle·독립 소비 테스트가 아직 없다.
- 현재 PC 행동 파일은 사이트 JavaScript를 정본으로 선언해 목표 방향과 반대다.
- 웹 root class와 size modifier 어법이 섞여 있다.
- 접근성 상태가 pending·planned·not-defined인 컴포넌트가 있다.

현재 `component-behavior.pc.json`은 사이트 JavaScript를 행동 정본으로 삼는다. 이 후보 정책은 그 선언을 즉시 덮지 않는다. Input·Button 파일럿에서 Registry 행동 계약과 runtime을 함께 만든 뒤 기존 행동 장부와 정본 목록을 한 번에 이행한다.

기존 Date Picker·Time Picker 등의 코드는 버리지 않는다. 후보 구현으로 가져와 계약에 맞게 모듈화·검증한 뒤 승격한다.

## 3. 구현을 시작할 수 있는 조건

다음 질문에 모두 “예”일 때만 코드를 만든다.

1. 이 컴포넌트가 정본 빌더 또는 승인된 원본에 있는가?
2. variant·size·state가 확정됐는가?
3. Registry에 사용법·접근성·행동 기준이 있는가?
4. 이미지로 알 수 없는 동작이 모두 결정됐는가?
5. 사용할 토큰과 아이콘이 정본에 있는가?
6. 패턴이라면 flow·states·core dependency가 등록됐는가?

하나라도 아니면 제작보다 정본 정리가 먼저다.

## 4. 목표 폴더 구조

아래 구조는 아직 구현되지 않은 목표안이다. Input·Button 파일럿에서 검증한 뒤 실제 디렉터리를 만든다.

```text
ui-library/
├── package.json
├── src/
│   ├── components/
│   │   └── {component-id}/
│   │       ├── {component-id}.css
│   │       ├── {component-id}.js
│   │       ├── {component-id}.example.html
│   │       └── manifest.json
│   ├── index.css
│   ├── index.js
│   ├── auto-init.js
│   ├── component-token-map.json
│   └── assets/icons/
│       ├── manifest.json
│       └── {icon-id}.svg
└── dist/                         # 자동 생성, 손편집 금지
    ├── s1-ui.css
    ├── s1-ui.js
    ├── s1-ui.auto.js
    ├── components/{id}.css
    ├── components/{id}.js
    ├── assets/icons/s1-icons.svg
    ├── assets/icons/{icon-id}.svg
    └── manifest.json
```

전체 설치와 개별 설치는 같은 `src`에서 만들어야 한다. 두 벌의 원본을 유지하지 않는다.

## 5. HTML 작성법

### Root에서 시작한다

각 컴포넌트에는 Registry에 등록된 공개 root가 있어야 한다. 초기화와 상태 탐색은 항상 이 root에서 시작한다.

```html
<!-- 구조 설명용 예시. 실제 이름·part는 Registry 확정 후 사용한다. -->
<div class="s1-example" data-s1-component="example" data-size="md">
  <span data-s1-part="label">Label</span>
  <button type="button" data-s1-part="control">Action</button>
</div>
```

- 페이지마다 다른 ID로 연결하지 않는다.
- 한 화면에 같은 컴포넌트를 여러 개 넣어도 충돌하지 않아야 한다.
- `onclick` 같은 인라인 JavaScript를 넣지 않는다.
- `button`, `input`, `select`처럼 브라우저가 이미 제공하는 요소를 우선한다.
- 외부에서 바꿀 수 있는 part와 slot만 Registry에 공개한다.
- 내부 DOM은 공개 API가 아니다. 패턴이 내부 구조를 가정하면 안 된다.

### Variant와 size

새 코드는 의미를 읽기 쉬운 속성을 우선한다.

```html
<button
  class="s1-example"
  data-s1-component="example"
  data-variant="primary"
  data-size="lg">
  확인
</button>
```

실제 이름은 정본 variant와 `size-naming-policy.json`의 어휘만 사용한다. 기존 클래스 관례가 다르면 파일럿에서 호환·이행 방식을 먼저 결정하고 조용히 섞지 않는다.

### State

상태는 다음 순서로 표현한다.

1. native HTML: `disabled`, `checked`, `readonly`
2. ARIA: `aria-expanded`, `aria-selected`, `aria-invalid`
3. Registry에 공개된 `data-state`
4. 검수 화면 전용 강제 상태

`is-preview`, `is-hover` 같은 검수용 클래스는 제품 JavaScript API로 사용하지 않는다.

## 6. CSS 작성법

### 자기 root 안에서만 작동한다

```css
/* 허용: 자기 컴포넌트 root와 공개 part */
.s1-example [data-s1-part="label"] { /* ... */ }

/* 금지: 페이지 전체와 다른 코어에 영향 */
body input { /* ... */ }
#login .s1-input-field { /* ... */ }
.login-pattern .s1-button { /* 코어 시각 override */ }
```

- 전역 태그 selector, ID selector, `!important`를 컴포넌트 구현에 사용하지 않는다.
- 컴포넌트 색은 Semantic token을 경유한다.
- 색·간격·radius·타이포는 정본 토큰과 정본에서 생성된 값만 사용한다.
- 새 코드에 raw HEX를 넣지 않는다.
- `--input-*`, `--button-*` 같은 component alias는 이름만 보고 폐기·활성으로 단정하지 않는다. `deprecated.json`과 실제 배선을 확인하고, 승인 없이 신규 사용하거나 부활시키지 않는다.
- Light·Dark는 CSS 두 벌이 아니라 Semantic token mode로 처리한다.
- 검수용 CSS는 배포 파일에 포함하지 않는다.
- stable 웹 CSS는 Semantic token을 직접 사용하고 legacy `component-tokens.css`에 의존하지 않는다. 기존 alias가 승인되면 build가 Semantic mapping을 검증·해결하고 fingerprint를 남긴다.

### 누가 무엇을 배치하는가

| 대상 | 책임 |
|---|---|
| 코어 컴포넌트 | 자기 내부 형태, 패딩, 아이콘·텍스트 관계, 상태 표현 |
| 부모 모듈·패턴 | 컴포넌트 사이 간격, 정렬, 영역 폭, 화면 반응형 |

부모가 자식의 내부 part를 선택해 모양을 바꾸면 조합이 아니라 중복 구현이다.

## 7. JavaScript 작성법

### 기본 생명주기

각 동작 모듈은 최소한 다음 두 기능을 제공한다.

```js
export function init(root, options = {}) {
  // 같은 root에 여러 번 호출돼도 이벤트가 중복 등록되지 않아야 한다.
}

export function destroy(root) {
  // init에서 등록한 이벤트, observer, timer를 해제한다.
}
```

수동 `init(root)`가 기본이다. 자동 초기화가 필요하면 별도 entry가 root를 찾아 호출한다. 동적으로 추가된 DOM은 `init(container)`를 다시 호출하는 방식부터 사용하고, MutationObserver 자동 연결은 필요성이 검증된 뒤 선택한다.

### 동작 경계

컴포넌트 JavaScript가 담당하는 것:

- 열기·닫기
- 선택·해제
- 키보드 이동
- 포커스 관리
- ARIA와 공개 state 갱신
- 외부에 필요한 이벤트 알림

컴포넌트 JavaScript가 담당하지 않는 것:

- 로그인 API 호출
- 서버 오류 문구 결정
- 페이지 이동
- 업무별 유효성 규칙
- 패턴 전체 단계 전환

외부에 상태 변화를 알릴 때는 이름과 `detail` 구조를 Registry에 함께 등록한다. 외부 코드가 내부 DOM을 뒤져 상태를 추측하게 만들지 않는다.

각 컴포넌트 manifest에는 options·events·event detail·public methods·제어 방식(controlled/uncontrolled)을 기록한다. 공개 API 제거나 의미 변경은 breaking change다.

## 8. 접근성 작성법

다음 항목이 Registry에 정의되고 실제 코드와 일치해야 한다.

- native 의미와 accessible name
- 키보드 조작표
- 포커스 진입·복귀·가두기
- ARIA 상태 동기화
- 오류 문구 연결
- 움직임 감소 설정

각 항목은 `required` 또는 `not-applicable`로 기록한다. 해당 없음에는 이유가 필요하다. 필요한 접근성 상태가 pending·planned·not-defined이면 `approved`로 승격하지 않는다.

## 9. 여러 컴포넌트를 조합하는 법

### 모듈

모듈은 코어를 배치하고 상태와 이벤트를 연결한다.

- 사용한 코어를 `dependencies.coreComponents`에 기록한다.
- 코어 CSS를 재정의하지 않는다.
- 필요한 코어 상태가 없으면 `needs-core-update`로 돌린다.
- 한 모듈의 JavaScript가 페이지의 다른 인스턴스를 전역으로 찾지 않는다.

### 패턴

패턴은 실제 업무 flow를 담당한다.

```text
패턴 HTML = 승인된 코어·모듈 조립
패턴 CSS  = 화면 레이아웃·영역·반응형
패턴 JS   = flow·업무 상태 연결
```

패턴 안에서 Input·Button·Modal의 내부 HTML·CSS·기본 동작을 다시 만들지 않는다. 이미지로 알 수 없는 flow는 구현 전에 질문하고 `registry/patterns/{id}/flow.md`에 정리한다.

## 10. 배포 방식

### 전체 묶음

```html
<!-- 1. Pretendard font -->
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="typography.css">
<link rel="stylesheet" href="s1-ui.css">
<!-- 수동 init bundle -->
<script type="module" src="s1-ui.js"></script>
<!-- 자동 init이 필요하면 s1-ui.js 대신 s1-ui.auto.js 사용 -->
```

### 선택 설치

사용하는 컴포넌트 CSS·JavaScript만 가져올 수 있어야 한다. 전체 묶음과 선택 설치의 결과는 같아야 한다. JavaScript가 필요 없는 컴포넌트는 CSS만 제공한다.

패키지는 전체 import, `auto-init`, 개별 컴포넌트와 개별 CSS export를 제공한다. CSS는 side effect로 선언하고, 개별 컴포넌트의 dependency는 자동 포함하거나 명확한 설치 오류로 막는다. 조용한 누락은 허용하지 않는다.

배포 파일에는 라이브러리 버전, 정본 fingerprint, 포함 컴포넌트와 dependency를 기록한다. `dist`는 생성 결과이므로 직접 고치지 않는다.

### 아이콘

Figma 아이콘 키를 그대로 SVG 문자열로 복사하지 않는다. 웹 아이콘 manifest가 Figma source key·fingerprint와 웹 파일·sprite symbol을 연결한다. 전체 설치는 sprite를, 개별 설치는 필요한 SVG dependency를 포함한다. 둘의 시각 결과와 접근성 이름 정책은 같아야 한다.

## 11. 디자인가이드 사이트의 역할

디자인가이드 사이트는 별도 구현이 아니라 실제 배포본의 첫 소비자다.

- 검수 화면은 `dist` CSS·JavaScript를 직접 불러온다.
- 코드탭은 component example과 source에서 생성한다.
- 사이트 전용 CSS는 페이지 틀만 담당한다.
- 컴포넌트가 사이트 인라인 CSS에 기대면 검수 실패다.
- 승인 전 항목은 내부 검수 화면, 승인 후 항목은 공개 가이드에 노출한다.

## 12. 승인 흐름

```text
정본 등록
  → flow 미결정 해소
  → 후보 코드 생성
  → 독립 정본·시각·동작 검증
  → 디자인가이드 실제 배포본 검수
  → river UX 승인
  → approved 배포·패턴 사용 허용
```

river 검수 전에 독립 검증자가 정본 전수, PC·Mobile, Light·Dark, 키보드·포커스·ARIA, 다중 인스턴스, 빈 페이지 복붙, 전체·개별 설치 동일성, 사이트·dist 동일성을 통과시킨다.

river는 정본 차이를 찾는 역할이 아니라, 검증을 마친 실제 화면의 UI·UX와 사용 흐름을 승인한다.

## 13. 파일럿 적용 순서

1. Input과 Button의 정본·Registry·현재 사이트 코드를 대조한다.
2. 이 계약으로 두 컴포넌트의 source·dist 구조를 만든다.
3. 디자인가이드 내부 검수 화면이 dist를 직접 사용하게 한다.
4. 컴포넌트 검수와 간단한 Form 조합 검수를 수행한다.
5. 문제를 계약에 반영한 뒤 `candidate`를 `stable`로 승격한다.
6. Footer·CI·StatusBar·NavBar처럼 개별 Registry가 없는 공개 셸은 먼저 정본 메타·행동·접근성을 등록한다.
7. 등록·검증된 셸과 Modal을 라이브러리에 편입하고 로그인 패턴으로 확장한다.

## 14. 기존 자산 이행 원칙

- 기존 `implemented`, `stable`, `in-progress`, `promoted` 상태를 자동으로 `approved`로 바꾸거나 무효화하지 않는다.
- 기존 패턴은 `legacy-approved`로 계속 사용할 수 있지만, 신규 dependency나 큰 변경 전에 새 계약으로 재검증한다.
- 이행 상태는 향후 `registry/governance/ui-library-migration.json`에 기존 상태·새 상태·dependency·재검수 시점·근거로 기록한다.
- 기존 컴포넌트는 재고조사 후 하나씩 `candidate → verified → approved`로 옮긴다.
- 신규 패턴은 `approved` 코어만 사용한다.
- 기존 Date Picker·Time Picker JavaScript는 후보 구현으로 보존하고 모듈화·검증한다.

## 15. 빠른 금지 목록

- 사이트 인라인 CSS·JavaScript를 긁어 배포하지 않는다.
- 패턴 안에서 없는 코어를 임시 제작하지 않는다.
- 서비스 화면이 코어 내부 selector를 override하지 않는다.
- Mobile·Dark용 컴포넌트 사본을 따로 유지하지 않는다.
- 정본 미등록·flow 미결정 상태에서 구현하지 않는다.
- 검수 화면과 실제 배포본을 다른 코드로 만들지 않는다.
