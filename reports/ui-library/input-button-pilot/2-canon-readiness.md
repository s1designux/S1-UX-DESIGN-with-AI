# UI Library 2단계 정본 준비 — Input · Button

- 작업 ID: `input-button-pilot`
- 작성일: 2026-08-25
- 기준: 코드 시각 정본 + Registry 의미·행동 + UI Library Contract
- 상태: `approved-for-canon-work`
- 원칙: 기존 결정으로 풀리는 항목은 다시 묻지 않고, 정본 신설·UX 선택만 질문한다.

## 1. 판정 요약

| 구분 | Input | Button |
|---|---:|---:|
| 기존 근거로 자동 정리 | 10개 묶음 | 3개 묶음 |
| 새 시각·UX 결정 | 권장안 승인 완료 | 권장안 승인 완료 |
| 새 토큰 필요 | 기본 geometry·state는 없음. focus-visible 표현은 기존 토큰 대조 후 정본 후보 확정 | 기본 geometry·state는 없음. focus-visible 표현은 기존 토큰 대조 후 정본 후보 확정 |
| 제작 가능 상태 | Base Input 제작 가능. Password Field → Search Input 순차 후속 | 제작 가능 |

## 2. 질문 없이 정리할 항목

### 2.1 Input

| 항목 | 적용할 기준 | 근거 성격 |
|---|---|---|
| 상태 연결 | visual/review `Editing` ↔ native `focus`; `readonly` ↔ `Read-Only`; Filled/Error/Correct/Disabled 유지 | 코드 정본·기존 Registry alias |
| Read-Only | 정본 7상태에 포함하고 Registry 누락 보완 | 기존 resolved 상태 |
| Mobile size | `Size=MD, Break=Mobile`, 높이 48 | 코드 정본·size policy |
| Label·Message | Input의 선택 part로 등록. part가 없으면 visual axis Off | builder anatomy·기존 Input Slot 결정 |
| Search/Password 분류 | Base Input의 state variant가 아니라 related composed field | 기존 taxonomy 결정 |
| Password Icon | Base visual의 boolean capability이며 Password Field가 이를 소비 | 기존 builder property·taxonomy 양립 |
| 폭 책임 | 정본 example field 200px. 공개 root는 부모가 폭을 정하고 내부 field는 root를 채움 | UI library composition contract |
| 내부 간격 | 내용↔trail 0px, eye↔clear 2px | 코드 정본·기존 검증 PASS |
| action 시각 아이콘 | XXSM 20px, 나머지 24px | 코드 시각 정본. 과거 28×28 action box는 hit area 정본으로 보지 않고 HD-UILIB-02에서 승인 |
| password 동작 | password↔text, aria-label·aria-pressed 동기화, clear 조건부, 실행 후 input focus 복귀 | Registry·행동 장부 |
| search clear 동작 | 값 있을 때 노출, clear 후 값 삭제·숨김·input focus 복귀 | Registry·행동 장부 |
| error relation | core는 `aria-invalid`와 `aria-describedby` 연결만 제공. 오류 발생 시점은 pattern/service가 결정 | native semantics·책임 경계 |
| reduced motion | core에 임의 motion을 추가하지 않음. motion이 생기면 reduced-motion 계약을 함께 추가 | 현 정본에 motion 없음 |

Input height·padding·gap·icon·radius·border 값은 전부 기존 Foundation step으로 생성할 수 있다. 새 토큰을 만들지 않는다.

### 2.2 Button

| 항목 | 적용할 기준 | 근거 성격 |
|---|---|---|
| 공개 variant | `primary`, `secondary`, `blue-line` | 정본 일대일 mapping |
| 공개 size | PC `md/xsm/xxsm`, Mobile `lg` | 정본·size policy |
| Break | visual 정본의 `PC/Mobile`을 manifest source mapping에 기록 | 정본 축 |
| 상태 | Hover=`:hover`, Pressed=`:active`, Disabled=native `disabled` | native semantics |
| Pressed 색 | 정본대로 Hover semantic slot 재사용 | build-components·vars-data |
| legacy pressed aliases | UI library에서 export·사용하지 않고 migration 대상 `legacy-preserved`로 기록 | legacy file 비의존 계약 |
| geometry | MD/LG min 80, XSM/XXSM min 64 등 builder 값 적용 | 코드 정본 |
| anatomy | 현재 정본은 text label only. optional icon은 현 Button API에서 제외 | 정본 우선·Registry stale 정정 |
| JavaScript | `jsRequired=false`; native click/Enter/Space/disabled 사용, CustomEvent 없음 | native button 계약 |
| 승인 상태 | candidate부터 시작. 기존 implemented를 approved로 해석하지 않음 | UI library status model |

Button 기본 geometry·state는 새 토큰 없이 기존 Semantic·Foundation으로 생성할 수 있다.

## 3. 최소 공개 API 후보

아래는 정본을 웹에 연결하기 위한 candidate다. river 결정과 Registry 반영 전에는 stable API가 아니다.

### 3.1 Input

```html
<div data-s1-component="input" data-size="md" data-break="pc">
  <label data-s1-part="label" for="example-input">라벨</label>
  <div data-s1-part="field">
    <input id="example-input" data-s1-part="control">
  </div>
  <p data-s1-part="message" id="example-message">안내 메시지</p>
</div>
```

- size: `xxsm | xsm | md`
- break: `pc | mobile`
- public part: `label`, `field`, `control`, `message`
- actual state: native `focus`, `readonly`, `disabled`; 값 존재는 Filled; error/correct만 documented state
- label/message On·Off는 별도 클래스가 아니라 part 존재 여부로 연결
- 부모가 root width를 정하고 field/control은 root를 채움

Password Field와 Search Input의 root·event·export는 Base Input·Button 파일럿 승인 후 각자의 별도 manifest에서 순차 정의한다.

### 3.2 Button

```html
<button
  type="button"
  data-s1-component="button"
  data-variant="primary"
  data-size="md">
  <span data-s1-part="label">버튼</span>
</button>
```

- variant: `primary | secondary | blue-line`
- size: `md | xsm | xxsm | lg`
- public part: `label`
- icon part 없음
- JavaScript module 없음
- hover/active/disabled는 native CSS pseudo-class·attribute 사용

## 4. river 결정 기록

### HD-UILIB-01 — Input 파일럿 범위

**결정 완료 · 2026-08-25 river:** Base Input + Button만 먼저 제작하고, Password Field를 바로 다음 조합 모듈로 제작한다. Search Input은 그 다음으로 분리한다.

이유: Base source·build·dist·검수 구조를 먼저 검증할 수 있고, Password/Search의 미결 동작이 코어 제작을 막지 않는다. 로그인 패턴에 필요한 Password Field는 파일럿 직후 이어갈 수 있다.

확정 순서: Base Input + Button → Password Field → Search Input.

### HD-UILIB-02 — PC·Mobile suffix action 누르는 영역

**결정 완료 · 2026-08-25 river:** Mobile은 손으로 탭하기 불편하지 않도록 실제 누르는 영역을 적용한다.

적용값은 시각 아이콘 20/24px 유지, 누르는 영역 PC 28×28px·Mobile 48×48px로 확정한다.

이유: PC 28×28은 기존 완료 구현과 일반 포인터 조작에 맞고, Mobile 48×48은 Input 높이와 맞아 시각 크기를 키우지 않으면서 누르기 편하다. Mobile에서 두 action이 함께 있으면 48×48 영역 두 개가 가로로 배치된다.

Mobile action이 두 개면 각각 독립된 48×48px hit area를 가지며, 한 action을 눌러도 다른 action이 실행되지 않아야 한다. 시각 아이콘을 48px로 키우지 않는다.

Mobile에서 suffix action이 있는 Input은 hit area가 field 밖으로 넘치지 않도록 Input 자체도 최소 48px 높이를 유지한다. 따라서 모바일용 compact Input을 별도로 만들거나, 낮은 Input 위에 48px action을 겹쳐 배치하지 않는다.

### HD-UILIB-03 — 키보드 focus-visible

> ⛔ **2026-09-02 철회** — river 확인 결과 이 승인은 **실제로 없었다.** ⭐ 가 스스로 기록한 것이며,
> 이에 근거해 만든 focus-visible 은 정본·웹 배포본 17건 전부 제거했다. 아래 원문은 사건 기록으로 남긴다.

~~**결정 완료 · 2026-08-25 river:** Button과 suffix action에 디자인시스템용 focus-visible 상태를 정본으로 추가하고, 실제 검수 화면에서 river 승인 후 확정한다.~~

이유: 현재는 과거 focus-ring 토큰이 폐기돼 승인된 표현이 없다. 브라우저 기본 outline을 그대로 두면 접근성은 확보되지만 브라우저마다 모양이 달라 UI 라이브러리의 일관성이 떨어진다.

세부 색·두께·간격은 기존 토큰과 접근성 기준을 대조해 정본 후보로 만든다. 정본 후보와 같은 코드가 검수 화면·배포본에 사용되며, river의 실제 화면 검수 전에는 stable로 승격하지 않는다.

## 5. 이번 단계에서 묻지 않는 것

- Search 실행 방식은 HD-UILIB-01에서 Search를 이번 범위에 넣을 때만 질문한다.
- Password `eye_show` 연결은 Password Field를 이번 범위에 넣을 때 정본 변경 승인 항목으로 다룬다.
- 오류가 언제 발생하는지는 서비스·패턴 책임이며 core는 상태 표현과 접근성 연결만 제공한다.
- Button icon은 현재 정본에 없으므로 이번 API에서 제외한다. 필요 시 별도 정본 변경 요청으로 시작한다.

## 6. 검문소

HD-UILIB-01·02·03의 방향 결정이 모두 완료됐다. 이제 focus-visible 정본 후보와 Registry 연결을 확정하고, 그 결과를 기준으로 `ui-library/src` 제작을 시작한다.
