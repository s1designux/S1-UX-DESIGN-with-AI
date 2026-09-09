# @s1/ui-react

S1 디자인 시스템의 **승인된 배포본 마크업을 그대로 옮긴 React 컴포넌트**입니다.
마크업을 새로 쓰지 않았고, 값·구조·속성은 배포본 예제와 같습니다.

## 1. 준비 — CSS 를 먼저 읽힌다

컴포넌트는 배포본 CSS 로 그려집니다. 앱 진입점에서 한 번 읽히세요.

```js
import "@s1/ui/assets/css/tokens.css";
import "@s1/ui/assets/css/typography.css";
import "@s1/ui/s1-ui.css";
```

## 2. 쓰기

```jsx
import { S1Button, S1Input, S1Table } from "@s1/ui-react";

<S1Button variant="primary" size="md" parts={{ label: "확인" }} onClick={save} />

<S1Input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" />

<S1Table
  headerCells={["이름", "부서", "수량"]}
  rows={[["김하늘", "디자인", 3], ["박바다", "개발", 5]]}
/>
```

## 3. 네 가지 통로

| 통로 | 언제 쓰나 | 예 |
|---|---|---|
| `parts` | 글자·아이콘 한 칸을 갈아끼울 때 | `parts={{ label: <><Icon /> 저장</> }}` |
| 목록 prop | 표·목록에 내 데이터를 넣을 때 | `rows={[["가", "나"]]}` |
| 폼 prop | 입력값을 React 상태와 잇을 때 | `value` · `onChange` · `inputRef` |
| 나머지 속성 | 루트에 그대로 붙는다 | `id` · `onClick` · `aria-*` |

슬롯 한 칸에 속성까지 주려면 `{ content, attrs }` 로 넘깁니다.

```jsx
<S1Table rows={[{ cells: ["합계", "", { content: 8, attrs: { "data-align": "center" } }] }]} />
```

## 4. 서버 렌더링

컴포넌트는 서버에서도 같은 마크업을 냅니다. 동작 스크립트(열고 닫기·키보드)는 브라우저에서 붙습니다.

## 5. 컴포넌트와 받는 값

| 컴포넌트 | 받는 값 |
|---|---|
| `S1Input` | size(3) · breakName(pc·mobile·password·password-mobile·search·search-mobile) · value·onChange · onClear · onSearch |
| `S1Button` | variant(3) · size(4) · breakName(pc·mobile) |
| `S1Checkbox` | value·onChange |
| `S1Radio` | value·onChange |
| `S1Toggle` | parts |
| `S1Chip` | variant(2) · size(2) · breakName(pc·mobile) |
| `S1Dropdown` | variant(2) · size(3) · options · onChange |
| `S1Select` | size(3) · breakName(pc·mobile) · options · onChange · onOpen · onClose |
| `S1FilterChip` | variant(2) · size(2) · breakName(pc·mobile) · options · onChange · onOpen · onClose |
| `S1Tab` | size(3) · breakName(pc·mobile) · tabs · children |
| `S1Pagination` | pages |
| `S1Textarea` | breakName(pc·mobile) · value·onChange |
| `S1MultiToggle` | size(2) · cells · onChange |
| `S1Modal` | variant(2) · breakName(pc·mobile) · onOpen · onClose |
| `S1Table` | size(3) · headerCells · rows · onSelectionchange |
| `S1MobileBottomNav` | parts |
| `S1MobileHeader` | variant(6) |
| `S1TimePicker` | size(3) · breakName(pc·mobile) · onOpen · onClose · onChange |
| `S1DatePicker` | variant(2) · size(3) · breakName(pc·mobile) · onOpen · onClose · onChange |
| `S1AssistButton` | parts |
| `S1TextButton` | variant(2) |
| `S1ModalContent` | variant(2) · size(3) · onOpen · onClose |

## 6. 고치지 마세요

이 폴더는 자동 생성물입니다. 고치면 다음 배포에서 지워집니다.
