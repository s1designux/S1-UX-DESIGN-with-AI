# 2-canon-readiness — GNB

작성 2026-09-09 · ⭐ 오케스트레이터

## 진입 조건 (계약 `entryGates.component`)

| 조건 | 결과 |
|---|---|
| 정본 빌더가 존재한다 | ✅ `buildGNB`(3515) · `fillGnbMenu`(3133) · `buildGNBUtilIcon`(3155) · `buildLanguageIcon` |
| Registry 에 사용맥락·상태·접근성·행동 계약이 있다 | ⚠️→✅ `a11yStatus` 가 `pending` 이었다. 2026-09-09 접근성 계약을 확정하고 `stable` 로 올렸다(아래 A) |
| 정본과 Registry 가 충돌하지 않는다 | ✅ 축·크기·상태가 일치한다. `gnb.json` 의 "메뉴 슬롯 9 variant + GNB 바 6 variant" 서술이 정본과 같다 |
| 미결정 동작이 없다 | ✅ GNB 는 0건. (`nav` 는 별건 — 1-inventory §C, blocker B1) |

## A. 확정한 접근성 계약

계약 `accessibility.requiredContract` 7항목을 각각 required / not-applicable 로 닫았다.

| 항목 | 판정 | 내용 |
|---|---|---|
| native semantics | required | `<nav>` + `<ul>/<li>` + `<a href>`. 링크가 아닌 동작은 `<button type="button">` |
| accessible name | required | `<nav aria-label>`, 유틸 아이콘 버튼 `aria-label`, 언어 항목은 보이는 글자가 이름 |
| keyboard matrix | required(단순) | Tab 순서 = 로고 → 메뉴 → 유틸. **방향키 이동은 만들지 않는다** — 정본에 없다 |
| focus entry·return·trap | not-applicable | 정본에 포커스 가둠·자동 이동이 없다. 포커스 표시는 브라우저 기본값 |
| ARIA state sync | required | 현재 메뉴에 `aria-current="page"`. Hover 는 시각만이고 ARIA 로 알리지 않는다 |
| error relation | not-applicable | 오류 표시가 정본에 없다 |
| reduced motion | not-applicable | 애니메이션이 정본에 없다 |

## B. 신규 토큰 · 신규 색

**0건.** GNB 가 쓰는 색은 전부 기존 semantic 토큰이다(1-inventory §B-3).

## C. 아이콘 — 유일하게 남은 준비 항목

`globe` · `account` · `menu` 3개가 웹 자산으로 없다. 셋 다 `allowed-remote-keys.json` 에 등재된 키가 있으므로
**임의 SVG 로 확정하지 않고 원본 벡터를 확보**한다(계약 `canonicalBoundaries.icons`).
`GNB_UTIL_SVGS` 의 인라인 SVG 는 설치기 폴백이라 원본이 아니다 — `search` 아이콘 선례(2026-09-04)와 같은 절차를 쓴다.

## D. needs-decision

**GNB 는 0건.** `nav` 1건(B1)은 이 컴포넌트와 무관하게 열려 있고, GNB 제작을 막지 않는다.

**검문소 통과** → 3-build.
