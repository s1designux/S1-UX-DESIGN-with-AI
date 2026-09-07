# UI Library 1단계 재고조사 — Password Field · Search Input

- 작업일: 2026-09-04
- 판독: 📖 `source-reader` (⭐ 자기 훑기 아님 · 하드룰 H5)
- 앞선 작업: `input-button-pilot` 완료(@s1/ui 0.1.0 Base Input·Button approved). 이 둘은 그때 명시적으로 제외된 후속 범위다(HD-UILIB-01, river 2026-08-25).

## 한 줄 결론

**Password 는 새 컴포넌트가 아니라 Input 의 옵션이고, Search 는 정본상 독립 컴포넌트지만 수치는 Input 과 같다.**
river 결정으로 **웹에서는 둘 다 승인된 Input 을 조립해 만든다.**

## Password Field

| 확인 | 사실 | 출처 |
|---|---|---|
| 별도 컴포넌트인가 | **아니다.** Input 컴포넌트셋의 BOOLEAN 속성 3개 — `Password Icon` · `Password Action Hover` · `Clear Action Hover`. `buildPassword` 함수 없음 | `build-components.ts:1029-1039` |
| 크기·상태·break | Base Input 과 **완전히 동일**(7상태 × PC XXSM/XSM/MD + Mobile MD × 메시지 On/Off) — 같은 루프에서 생성 | `:907-1057` |
| 눈+지우기 동시 노출 | 있다. Editing 상태에서 trail = [눈] → [지우기], 사이 간격 2px | `:964-1000` |
| 표시(뜬 눈) 아이콘 | **정본 코드에 도형이 없다.** `ICON_KEYS.eye` 는 미표시(감긴 눈) 1개뿐이고, 표시 상태는 주석에 "인스턴스 스왑으로 교체"라고만 적혀 있다 | `:990, :1125` |
| 마스킹 문자·폰트 | 정본에 지정 없음 | 전수 grep, 매치 0 |

## Search Input

| 확인 | 사실 | 출처 |
|---|---|---|
| Input 을 재사용하나 | **아니다.** `buildSearch` 는 `buildInput` 을 부르지 않고 자체 루프로 그린다 | `:1261-1319` |
| 그런데 수치는 | 높이 28/34/44, 좌우 안쪽 여백 12/8·12/8·16/12 — **Input PC 3사이즈와 동일값** | `:917-919` vs `:1270-1274` |
| 구조 | 비-Focus: [텍스트] … [돋보기](양끝 정렬). Focus: [텍스트+커서] … [지우기][돋보기] | `:1279-1310` |
| break | **PC 만.** Mobile 코드 없음(sizes 배열에 brk 필드 자체가 없다) | `:1270-1274` |
| 상태 | Default · Focus · Filled · Disabled **4개**. Error/Correct/Read-Only 없음 | `:1264-1269` |
| 아이콘 | `search`(돋보기) · Focus 에서만 `remove`(지우기) | `:1263, :1305-1309` |
| trail 간격 | 4px (Password 의 2px 와 다름) | `:1298, :1306` |

## 재료 — 있는 것 / 없는 것

| 재료 | 상태 | 출처 |
|---|---|---|
| Figma 아이콘 키 | ✅ `search`·`eye_hide`·`eye_show`·`remove` 전부 등재 | `registry/figma/allowed-remote-keys.json:8-30` |
| **웹 아이콘 자산(SVG·manifest)** | ❌ **eye·search 둘 다 없음**(등재된 13종에 없다) | `ui-library/src/assets/icons/manifest.json` |
| 행동 계약 | ✅ `component-behavior.pc.json` Input 항목에 `setupSearchInputField`·`setupPasswordFieldInput` 인용과 이벤트가 이미 적혀 있다 | `component-behavior.pc.json:234-291` |
| registry 메타 | ⚠️ `input.json` 의 `relatedComposedFields` 에 상세히 있으나 **둘 다 `status: candidate`**(미확정) | `registry/components/input.json:222-317` |
| 슬롯 순서 | ✅ registry 메타와 정본 코드가 일치 — Search [지우기][돋보기], Password [눈][지우기] | `input.json:238-250, 288-303` |
| ui-library 소스 | ❌ `password`·`search` 디렉토리 없음. `input/manifest.json` 의 followUpModules 에 `status: not-in-this-build` 로만 예약 | `input/manifest.json:116-131` |

## 🧹 발견한 죽은 코드

`pages/components.html:3883-3948` 에 `setupSearchInputField`·`setupPasswordFieldInput` **함수와 CSS 가 이미 구현돼 있다.** 지우기 표시/숨김, 초점 클래스 토글, `input.type` password↔text 전환, `aria-label`/`aria-pressed` 동기화, 아이콘 스왑까지 들어 있다.

**그런데 이 함수들이 찾는 마크업이 파일 전체에 0건이다** — `data-related-field` · `data-search-input` · `data-password-input` · `data-visibility-toggle` · `data-icon-hidden` · `data-icon-visible` 8개 selector 를 전수 grep 한 매치가 JS 안의 문자열과 CSS 선언뿐이다. `querySelectorAll` 이 항상 빈 배열인 죽은 코드다.

이번 작업에서 **승인된 dist 를 소비하는 마크업으로 교체하며 정리한다.**

## ⛔ 착수 막힘 (B1)

**Figma MCP 인증이 끊겨 있어 아이콘 SVG 를 원본에서 가져올 수 없다.** 이 세션은 비대화형이라 OAuth 를 진행할 수 없다.
river 가 터미널에서 `claude` 실행 → `/mcp` → Figma 인증으로 풀어야 한다(D5).

폴백 도형으로 대체하지 않는다 — `reports/repeated-requests.json` 의 `icon-origin-substituted-by-fallback`(2회) 이 정확히 그 사고다.

## river 결정 (2026-09-04)

| | 결정 | 정본과의 관계 |
|---|---|---|
| D1 | Search 는 Base Input 을 베이스로, 아이콘 사양만 다르게 | 웹 구현 방식 — 정본 수치는 이미 동일 |
| D2 | 검색 실행 = Enter 키 + 돋보기 클릭 **둘 다** | 정본에 없던 것 → river 결정 |
| D3 | Search **모바일도 만든다** | 정본 신설(현재 PC만) |
| D4 | Search 상태 = 디폴트 · 값 있음 · 비활성 **3개** | 정본 변경(현재 4개) |
| D5 | 아이콘은 Figma 원본에서 — 폴백 금지 | 조달 경로 |

## 정본에 없어 만들지 않는 것

- 자동완성 목록 — 정본·registry 어디에도 없음
- Search 의 Error·Correct·Read-only 상태 — D4 로 제외 확정
- 비밀번호 마스킹 문자 지정 — 정본에 없음(브라우저 기본 `type=password` 에 맡긴다)

## 검문소

목록 누락 0건. 모르는 것은 위에 `미확인`·`없음`으로 남겼고 추측으로 채우지 않았다.
**B1(Figma 인증)이 풀리기 전에는 3-build 로 넘어가지 않는다.**
