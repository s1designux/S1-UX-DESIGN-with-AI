# 2-canon-readiness — GNB Sub Menu · GNB Sub Menu Item

작성 2026-09-09 · ⭐ 오케스트레이터

## 진입 조건 (계약 `entryGates.component`)

| 조건 | 결과 |
|---|---|
| 정본 빌더가 존재한다 | ✅ `buildGNBSubMenuItem`(3697) · `buildGNBSubMenu`(3737) |
| Registry 에 사용맥락·상태·접근성·행동 계약이 있다 | ⚠️→✅ **없었다.** 2026-09-09 에 `registry/components/gnb-sub-menu-item.json` · `gnb-sub-menu.json` 을 신설하고 index 에 등재했다(registry 는 메타의 정본) |
| 정본과 Registry 가 충돌하지 않는다 | ✅ 축·수치·토큰을 정본에서 그대로 옮겼다 |
| 미결정 동작이 없다 | ✅ 1건 있었고 아래 A 에서 닫았다 |

## A. 여닫는 동작 — 배포본은 껍데기만 준다

정본에는 **패널을 여는 트리거도, 여닫는 동작도 없다.** 세트는 펼쳐진 패널의 모양만 정의한다.

→ **배포본은 패널의 모양만 제공하고, 여닫기는 쓰는 화면이 갖는다.**

근거:
- 부모 `gnb` 가 이미 같은 결이다 — `jsRequired=false`, 현재 메뉴 표시(`aria-current`)를 쓰는 화면이 넣는다(2026-09-09 배포).
- `modal-content` 도 같은 결이다 — 껍데기만 주고 안은 쓰는 쪽이 채운다(river 결정 2026-09-08).
- 정본에 없는 동작을 배포본이 지어내면 하드룰 H6② 위반이다("근거가 없을 때 규칙을 만들어 빈자리를 메우는 것").

대신 **접근성 계약에 여닫는 쪽이 지켜야 할 것을 적어 두었다**(`aria-expanded`·`aria-controls`·`hidden`·Esc 로 닫고 포커스 되돌리기·포커스 가두지 않기). 배포본이 그 동작을 구현하지는 않는다.

## B. 확정한 접근성 계약

계약 `accessibility.requiredContract` 7항목을 각각 닫았다. 전문은 두 registry 파일의 `a11y`.

| 항목 | Item | 패널 |
|---|---|---|
| native semantics | required — `<li>` 안 `<a href>`. 제목이 링크가 아니면 글자로 둔다 | required — `<ul>/<li>` |
| accessible name | required — 글자가 곧 이름 | required — 여는 메뉴의 `aria-controls` 로 연결 |
| keyboard matrix | required(단순) — Tab + Enter 네이티브만. 방향키 없음 | 여닫는 쪽 몫(Esc) |
| focus entry·return·trap | not-applicable | **가두지 않는다** — 팝업이 아니라 펼침 영역 |
| ARIA state sync | required — `aria-current="page"` 는 Selected 에만 | required — `aria-expanded` |
| error relation | not-applicable | not-applicable |
| reduced motion | not-applicable | not-applicable |

## C. 신규 토큰 · 신규 색

**0건.** `color/navigation/submenu/label/default` 는 2026-09-08 정본 보강 때 이미 신설·승인됐다.

## D. 아이콘

**0건.** 두 컴포넌트 모두 글자만 쓴다.

## E. needs-decision

**0건.**

**검문소 통과** → 3-build.
