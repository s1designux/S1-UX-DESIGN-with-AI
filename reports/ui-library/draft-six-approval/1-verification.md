# 배포돼 있는데 승인 기록이 없던 부품 6종 — 승인 전 검수

검수일 2026-09-15 · 요청 river **"승인"**(재고 조사 [`1-inventory.md`](../../missing-inventory-audit/1-inventory.md) HD-6 (A)안 — 지금 검수하고 승인 기록을 남긴다)
검증자 🤖 `component-verifier` 시나리오 F · 배포본 0.6.0 · 파일은 하나도 고치지 않음(검증 전용)

## 결론

**여섯 중 둘만 승인했다.** 나머지 넷은 고친 뒤 다시 봐야 한다 — 그중 둘은 **승인하는 순간 검사기가 바로 실패**한다.

| 부품 | 판정 | 결과 |
|---|---|---|
| `assist-button` | ✅ PASS | **approved** (river 승인 2026-09-15) |
| `text-button` | ✅ PASS | **approved** (river 승인 2026-09-15) |
| `modal-content` | ❌ FAIL | draft 유지 — M-1 |
| `gnb` | ⏸ HOLD | draft 유지 — G-2 · G-1 |
| `gnb-sub-menu` | ⏸ HOLD | draft 유지 — G-2 · G-1 |
| `gnb-sub-menu-item` | ⏸ HOLD | draft 유지 — G-2 |

## 고쳐야 할 것

| 번호 | 무엇이 | 어디서 확인했나 | 왜 승인 못 하나 |
|---|---|---|---|
| **M-1** | 모달 본문을 **키보드로 스크롤할 수 없다** | 본문을 2000px 로 늘리고 초점을 닫기 버튼에 둔 뒤 PageDown·ArrowDown 을 실제로 눌렀더니 `scrollTop` 이 0 에서 안 움직였다. `content-area` 가 `overflow-y:auto` 지만 `tabindex` 가 없다(`modal-content.css:105-112`) | `registry/components/modal-content.json` 의 접근성 선언이 "키보드로도 스크롤 가능해야 한다"고 **스스로 요구**한다 — 선언과 실제가 다르다. 같은 런타임을 쓰는 확인 계열 `modal` 에도 같은 구멍이 있을 수 있다(미확인) |
| **G-2** | GNB 3종에 **React·Vue 전달본이 없다** | approved 22종은 전부 `react/*.jsx`·`vue/*.vue` 를 갖는데 verified 3종만 없다. 그런데 `dist/platform/contract.json` 에는 25종 전부 들어 있다 | `ui-library/scripts/test.mjs:762-766` 이 래퍼 대조를 `status === "approved"` 에만 건다 — **승인해서 approved 로 바꾸는 순간 `ui:test:check` 가 실패한다** |
| **G-1** | GNB **하위메뉴 링크에 키보드로 갈 수 없다** | Tab 키를 실제로 눌러 따라갔다: 공지사항(패널 열림) → 서비스(앞 패널 닫히고 새 패널 열림) → 통계 → 유틸. **초점이 패널 안으로 들어간 적이 한 번도 없다.** 패널이 `<nav>` 뒤 형제라 다음 Tab 대상이 늘 다음 메뉴이고, `gnb.js:108-116` 이 초점이 밖으로 나가면 전부 닫는다 | 정본에는 여닫는 동작 자체가 없어(river D4·D5 로 웹에만 추가된 것) **대조할 정본 규칙이 없다** → (c) 애매 · river 결정 사항 |

## 함께 드러난 것 (이 6종만의 문제가 아니다)

- **X-1 · 안내 화면 딥링크가 엉뚱한 부품을 연다.** `?platform=pc#assist-button`·`#text-button`·`#modal-content` 셋 다 **Button 섹션**이 열린다(`#gnb` 계열은 정상). 깨끗한 새 탭에서 재현했다. **river 가 링크로 이 셋을 보러 가면 다른 화면을 본다.** 배포본이 아니라 안내 화면 문제다.
- **X-2 · hover 미리보기를 배포본 밖에서 그린다.** `assist-button`·`text-button` 의 강제 hover/pressed 칸은 `assets/css/ui-library-guide.css:373-385` 가 그린다(색은 같은 dist 토큰이라 맞다). 반면 `gnb` 계열은 `data-force-state` 를 자기 dist CSS 안에 갖고 있다. 같은 파일 머리말은 "컴포넌트 시각은 오직 dist 소유"라고 적혀 있어 서로 어긋난다. 기존 approved 부품들도 같은 방식이다.
- **X-3 · registry 가 정본과 어긋난다(고칠 쪽은 registry — 하드룰 H6).** `registry/components/gnb.json` 의 sizing 이 유틸 버튼 상자 40px·xsm 아이콘 프레임 24/글리프 18 이라고 적었지만, 정본 `buildGNBUtilIcon` 은 GNB 크기를 인자로 받지 않고 **32 박스 / 24 글리프 한 종류**만 만든다. 배포본은 정본을 따른다(맞다). gnb 매니페스트의 `notInCanon` 은 xsm 축소만 적어 두고 **40px 상자 건이 빠져 있다.**
- **X-4 · 토큰 갈래 하나.** `gnb.css:42` 만 높이에 `--spacing-36` 을 쓴다(25개 dist CSS 중 유일). `--sizing-36` 은 없고(30·32·34·38 만), 값 36px 자체는 정본과 같다.

## 아직 남아 있는 어긋남

`assist-button`·`text-button` 두 건은 장부와 배포본이 이제 같은 말을 한다. **나머지 넷은 여전히 어긋난 채다** — 배포본 매니페스트는 `modal-content` = `approved`, GNB 3종 = `verified` 라고 적고 있는데 장부는 `draft` 다.

river 가 고른 것은 (A)「지금 검수하고 승인 기록을 남긴다」였고, 검수 결과 넷이 막혔으므로 **표시를 내리는 것(B안)은 하지 않았다.** 위 결함을 고치고 다시 검수하면 넷 다 장부·배포본이 맞춰진다. 그때까지는 배포본 표시를 믿으면 안 된다.

## river 가 정할 것

- **G-1 · GNB 하위메뉴 링크에 키보드로 갈 수 있게 할까요?**
  지금은 마우스로만 하위메뉴를 쓸 수 있습니다. Tab 키로는 큰 메뉴 사이만 건너뛰고 펼쳐진 목록 안으로는 들어가지 못합니다.
  (A) 목록을 Tab 순서에 넣는다 — 초점이 목록 안으로 들어가고, 밖으로 나가면 닫힙니다.
  (B) 지금처럼 마우스 전용으로 두고, 같은 링크를 다른 곳(예: 화면 안 목록)에서도 닿게 합니다.
  **안 정하면** 지금 상태가 유지됩니다 — 마우스 없이는 하위메뉴를 쓸 수 없습니다.

## 검증 한계 (정직하게)

- **Figma 캔버스 실물은 보지 않았다** — 정본은 코드와 mock 산출물로만 대조했다.
- **모바일 렌더은 대상이 아니다** — 여섯 다 정본·registry 모두 PC 전용이다(모바일 break 선언 없음).
- 다크 모드는 `assist-button`·`text-button` 만 실측했다. 확인 계열 `modal` 의 M-1 동일 증상은 범위 밖이라 보지 않았다.
- 검증 도중 다른 작업으로 `build-components.ts`·`dist` 가 다시 쓰였으나, **여섯 부품의 `.css`·`.js`·예시는 전 구간 바이트 동일**했고 매니페스트는 지문 줄만 달랐다.
