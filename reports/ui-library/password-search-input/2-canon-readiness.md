# UI Library 2단계 정본 준비 — Password Field · Search Input

- 작업일: 2026-09-04
- 상태: **작성 완료 · 정본 편집은 아직 안 함**(아이콘 확보 후 3-build 에서 한 번에 반영해 검증 1회로 묶는다)
- 앞 단계: `1-inventory.md`

## 1. 공개 계약 (웹이 내보낼 것)

### Password Field — Base Input 의 옵션

정본상 별도 컴포넌트가 아니므로 **웹도 새 컴포넌트를 만들지 않는다.** `input` 컴포넌트에 옵션을 얹는다.

| 항목 | 내용 |
|---|---|
| 공개 root | `[data-s1-component="input"]` (그대로) |
| 켜는 방법 | `<input type="password">` + 눈 액션 part 존재 |
| 새 part | `[data-s1-part="action"][data-action="password"]` |
| 액션 순서 | trail = **[눈] → [지우기]**, 사이 간격 2px (정본 `:990-1000` 과 동일) |
| 크기·상태·break | Base Input 과 **완전히 동일** — 새로 정의할 것 없음 |
| 동작 | 누르면 `type` 을 password↔text 로 바꾸고 **Input 으로 초점 복귀** |
| 접근성 | `aria-pressed` 로 표시/숨김 상태, `aria-label` 을 상태에 맞춰 교체 |
| 아이콘 | 꺼짐 = 감긴 눈 · 켜짐 = 뜬 눈 (**둘 다 필요** — 정본 코드엔 감긴 눈만 있다) |

### Search Input — Base Input 조립 (river D1)

| 항목 | 내용 |
|---|---|
| 공개 root | `[data-s1-component="input"][data-mode="search"]` (별도 컴포넌트 신설 안 함) |
| 새 part | `[data-s1-part="action"][data-action="search"]` |
| 액션 순서 | trail = **[지우기] → [돋보기]**, 돋보기가 가장 오른쪽 (정본 `:1305-1309` · registry `input.json:238-250` 일치) |
| 상태 (river D4) | **디폴트**(돋보기만) · **값 있음**(지우기+돋보기) · **비활성** — 3개 |
| 초점 | 별도 상태로 두지 않고 Base Input 과 같은 초점 표시(정본 Selected 파란 테두리) |
| 크기 | PC XXSM 28 · XSM 34 · MD 44 + **Mobile MD 48**(river D3) |
| 검색 실행 (river D2) | **Enter 키 + 돋보기 클릭 둘 다** → `s1:input:search` 이벤트 1개로 내보낸다(detail 에 현재 값) |
| 안 만드는 것 | 자동완성 목록 · Error/Correct/Read-only (정본에 없음 / D4 로 제외) |

## 2. 정본에 넣을 변경 (river 승인 기록 있음)

3-build 에서 `plugins/figma-vars-installer/src/build-components.ts` 의 `buildSearch` 에 반영한다.

| # | 변경 | 근거 | 성격 |
|---|---|---|---|
| C1 | sizes 배열에 **Mobile MD(h 48 · padL 16 · padR 0)** 추가 | river D3 "모바일도 만든다" | 정본 신설 |
| C2 | 상태를 Default·Focus·Filled·Disabled(4) → **Default·Filled·Disabled(3)** | river D4 발화 그대로 | 정본 변경 |
| C3 | 누르는 영역: PC 28×28 · **Mobile 48×48** (Base Input 규칙 그대로) | HD-UILIB-02 승계 | 정본 신설 |
| C4 | `ICON_KEYS` 에 **`eye_show`** 추가 | 표시(뜬 눈)가 정본 코드에 도형 없이 키만 있었다 | 정본 신설 |

**C1~C4 는 구조 변경이다 → 하드룰 H1② 에 따라 🤖 `component-verifier` 검증 후 Gate 13 에 기록한다. ⭐ 자가인증 금지.**

Mobile padR 0 은 방금 승인된 Base Input 규칙(D29, river 2026-09-04)을 그대로 따른 것이며 새 규칙이 아니다.

## 3. registry 메타 정리

| 파일 | 지금 | 할 일 |
|---|---|---|
| `registry/components/input.json` `relatedComposedFields` | Password·Search 둘 다 **`status: candidate`**(미확정) | 위 공개 계약대로 확정하고 `stable` 로. river 결정 D1~D4 를 근거로 인용 |
| `input.json:316` `iconNote` | "visible 상태 eye-off 아이콘 Figma 노드명 미확인" | `eye_show` 키가 `allowed-remote-keys.json:15` 에 실재하므로 정정 |
| `component-behavior.pc.json` Input 항목 | `setupSearchInputField`·`setupPasswordFieldInput` 을 근거로 인용 중인데 **그 함수는 죽은 코드**다 | 근거를 새 `input.js` 런타임으로 교체 |

## 4. 아이콘 요구 (3-build 전제)

| id | 원본 | Figma 키 | 상태 |
|---|---|---|---|
| `eye_hide` | `ic_비밀번호미표시_line` | `d4e9eb5b…` | ⛔ 웹 자산 없음 |
| `eye_show` | `ic_비밀번호표시_line` | `b130623bad9bf035e273501b404bf7a245af1460` | ⛔ 웹 자산 없음 · 정본 ICON_KEYS 에도 없음 |
| `search` | `ic_찾기조회_line` | `6b764af6…` | ⛔ 웹 자산 없음 |

세 원본 모두 **저장소에 48×48 PNG 로 실재**한다(`assets/icons/`). river 결정(2026-09-04)에 따라 **Figma 인증 복구 후 원본에서 직접 가져온다.**
확보 후 `ui:icons`(frame/glyph 구조) 와 `ui:icons:origin`(원본 픽셀 대조, 임계 1.5%) 를 모두 통과해야 한다.

## 5. 정리할 죽은 코드

`pages/components.html:3883-3948` 의 `setupSearchInputField`·`setupPasswordFieldInput` 과 `:760-828` CSS.
대상 마크업이 0건이라 동작한 적이 없다. 3-build 에서 **승인된 dist 를 소비하는 마크업으로 교체**하며 제거한다.

## 검문소

- `needs-decision` **0건** — 정본에 없던 4가지(검색 실행·모바일·상태 집합·Search 기반)는 river 결정 D1~D4 로 기록됐다.
- 정본 신설 4건(C1~C4)은 모두 river 발화 인용을 근거로 갖는다.
- **⛔ 남은 막힘 1건(B1)**: 아이콘 원본 확보 — Figma 인증 대기. 이것이 풀리기 전에는 3-build 로 넘어가지 않는다.
