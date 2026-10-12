# S1DatePicker — `data-s1-component="date-picker"`

> 자동 생성된 설명서입니다. 손으로 고치지 마세요 — 다음 배포 때 사라집니다.

## 언제 쓰나

- 날짜(단일/기간)를 고를 때. 트리거는 Base Input 필드.
- PC 는 팝오버 캘린더, Mobile 은 바텀시트로 표출.

## 이럴 땐 다른 걸

- 시간만 고를 때는 TimePicker.
- 자유 텍스트 날짜 입력만 필요하면 Input.

## 시작하기

1. 마크업은 예시 파일을 복사해서 씁니다: `examples/date-picker.html` · `examples/date-picker.mobile.html`
2. 겉모습: 전체 묶음 `s1-ui.css` 한 줄이면 됩니다. 이 부품만 쓰려면 `assets/css/tokens.css` · `assets/css/typography.css` · `components/button.css` · `components/bottom-sheet.css` · `components/date-picker.css` 를 읽습니다.
3. 동작: `autoInit()` 이 이 부품을 찾아 붙입니다. 이 부품만 쓰려면 `import { init } from "./s1-ui/components/date-picker.js"` 후 `const api = init(요소)` 를 부릅니다.
4. 페이지가 뜬 뒤에 넣은 마크업은 `autoInit(감쌀요소)` 를 한 번 더 부르면 붙습니다(두 번 불러도 겹치지 않습니다).

## 고르는 속성

| 속성 | 뜻 | 쓸 수 있는 값 |
|---|---|---|
| `data-mode` | 종류 | `single` `range` |
| `data-size` | 크기 | `xxsm` `xsm` `md` |
| `data-break` | 화면(PC·모바일) | `pc` `mobile` |

예시에는 일부 값만 나옵니다. 다른 값은 속성 값만 바꾸면 됩니다.

## 마크업 규칙

- 루트: `div[data-s1-component=date-picker]`
- 꼭 있어야 하는 속성: `data-size` `data-break` `data-mode`
- 꼭 있어야 하는 부분(`data-s1-part`): `trigger` `value` `icon`
- trigger aria-haspopup=dialog, aria-expanded 는 panel/sheet 표시와 동기화
- panel(PC) role=dialog, 내부 grid는 role=grid, 날짜 셀은 role=gridcell + aria-selected(+ aria-disabled)
- Esc 키로 패널/시트를 닫고 트리거로 포커스 복귀
- Mobile sheet: role=dialog[aria-modal=true], 배경 클릭·닫기 버튼·Esc 로 닫힘
- s1:date-picker:change 이벤트가 값을 실어 나른다 — 단일: {value}, 기간: {start,end}

## 값·옵션 속성

| 속성 | 뜻 |
|---|---|
| `data-value` | 단일 모드의 처음 날짜(YYYY-MM-DD) |
| `data-range-start` | 기간 모드의 처음 시작일(YYYY-MM-DD) |
| `data-range-end` | 기간 모드의 처음 종료일(YYYY-MM-DD) |
| `data-name` | 폼 전송용 숨은 입력의 name (단일: name · 기간: name-start, name-end) |

## 스크립트로 부르기

`init(요소)` 가 돌려주는 객체의 `openPanel()` · `closePanel()` · `value` · `setValue(value)`.

## 이벤트

요소에서 올라오는 사용자 정의 이벤트입니다(`element.addEventListener(...)`). 값은 `event.detail` 에 있습니다.

| 이벤트 | detail |
|---|---|
| `s1:date-picker:open` | `{}` |
| `s1:date-picker:close` | `{}` |
| `s1:date-picker:change` | `단일: { value, mode: 'single' } · 기간: { start, end, mode: 'range' } (모두 YYYY-MM-DD)` |

## 접근성 — 퍼블리셔가 지킬 것

- **역할**: button[aria-haspopup=dialog][aria-expanded] driving role=dialog panel; 날짜 격자는 role=grid/gridcell + aria-selected(+aria-disabled)
- **이름**: visible label associated with the trigger or aria-label; sheet 는 aria-labelledby(sheet-title)
- **키보드**: trigger: Enter/Space(native click)로 열기; 격자 안: 화살표=날짜 이동, Home/End=주 시작·끝, PageUp/Down=달 이동, Enter/Space=선택; Esc=닫고 트리거로 포커스 복귀(PC)/시트 닫기(Mobile)
- **초점**: PC 팝오버가 열리면 격자의 첫 활성 셀로 포커스 이동, 닫히면 트리거로 복귀. Mobile 시트는 열리면 시트 안으로, 닫히면 트리거로 복귀(모달과 동일 패턴, 별도 focus trap은 시트 안에서 Esc·배경·닫기로만 닫히는 단순 계약)
- **상태 표시**: 런타임이 aria-expanded·aria-selected·aria-disabled·data-filled·data-state·data-range-band 를 갱신하고 s1:date-picker:open·close·change 를 낸다

---

정본 지문 `934945a7ce9d7a374389cebdee02db7ed5398ae19f6abef54428bffcc65cc409` · 부품 버전 0.2.12
