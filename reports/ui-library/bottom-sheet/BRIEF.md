# 쪽지 — 바텀시트 웹 부품 만들기 (새 세션용)

작성 2026-09-15 · 요청: river "바텀시트에 대한 내용 새 세션에서 할 수 있게 쪽지줘"

## 한 줄

**정본에 이미 있는 바텀시트를 웹 배포본(`ui-library/dist`)으로 옮기는 일이다.** 새로 디자인하는 일이 아니다.

## 왜 지금 필요한가

밀도(density) 작업에서 river 가 정했다 — **"모바일에서는 드롭다운 대신 바텀시트를 제공해."**(2026-09-15)

그래서 가이드(`design/DESIGN.core.md` §8)와 검사기(`npm run ui:density`)가 이미 "모바일에서는 바텀시트를 쓰라"고 말한다. 그런데 **가져다 쓸 부품이 없다.** 지금은 날짜·시간 선택 안에 박혀 있는 시트를 손으로 베껴야 한다. 권하는 것이 없는 상태라 안내를 따르려는 사람이 막힌다.

## 어떻게 진행하나

🧩 **`ui-library-code` 스킬**로 들어간다. work-id 는 `bottom-sheet`. 상태 장부는 `reports/ui-library/bottom-sheet/workflow-state.json` 에 새로 만든다(아직 없다).

스킬이 시키는 대로 0-governance → 1-inventory → … → 6-promotion 을 밟는다. 만드는 자(`ui-library-builder`)와 검증하는 자(`component-verifier` 시나리오 F)는 반드시 나뉜다 — **스스로 통과 판정하지 않는다.**

## 이미 확인해 둔 사실 (다시 캐지 말 것)

### 정본에 있다

`plugins/figma-vars-installer/src/build-components.ts`

| 무엇 | 어디 |
|---|---|
| `buildBottomSheet` | 5152줄 · 세트 이름 `"Bottom Sheet"` |
| `buildBottomSheetOption` | 5009줄 · 세트 이름 `"Bottom Sheet Option"` |
| 등록표 | 6974~6975줄 |

`registry/components/component-facts.json` 에 두 세트의 실측이 다 있다.

### 변형 축

- **Bottom Sheet** — `Footer`: `None` · `Single` · `Dual` (3변형). 폭 360 고정, 높이는 내용에 따라 늘어난다(AUTO). 위 모서리만 8 둥글게.
- **Bottom Sheet Option** — `Type`: `Text` · `Checkbox` · `Radio` · `List` × `State`: `Default` · `Selected` · `Disabled`. 한 줄 높이 48.

### 뼈대

`content`(머리말 + 본문 슬롯) + `footer`. 머리말은 제목 ↔ 닫기 X, 좌우 여백 20. 본문은 **슬롯**이라 화면마다 갈아끼운다 — 기본값은 Option 4줄이고 두 번째가 Selected. 푸터 버튼은 Button 컴포넌트 재사용(모바일 LG 높이 48), Dual 이면 취소+적용.

### 웹에 이미 있는 비슷한 것

날짜 선택·시간 선택 안에 시트가 들어 있다. 부품 이름이 이미 정해져 있으니 **그 어휘를 그대로 쓴다**:

```
sheet · sheet-backdrop · sheet-panel · sheet-header · sheet-title · sheet-close · sheet-footer
```

CSS 는 `ui-library/src/components/date-picker/date-picker.css` 469~540줄, 마크업 예시는 같은 폴더 `date-picker.mobile.example.html`.

## 조심할 것

1. **정본에 없는 것을 만들지 않는다.** 슬롯 개념·변형 축·여백은 위 정본이 기준이다. 근거가 없는 자리는 `needs-decision` 으로 river 에게 올린다(하드룰 H6② · Gate 34).
2. **날짜·시간 선택이 새 부품을 재사용하게 만든다.** 코어 재사용 원칙이다. 다만 **이관 전후로 그 두 화면의 렌더가 같아야 한다** — 달라지면 그건 퇴행이다. 브라우저로 실측해 대조한다.
3. **모달과 겹치는 부분을 먼저 본다.** 배경 가림막·포커스 가두기·`aria-modal`·Esc·바깥 누르면 닫기는 `modal` 이 이미 갖고 있다. 같은 동작을 두 벌 만들지 말고, 어디까지 공유할지 1-inventory 단계에서 정한다.
4. **검수 화면은 실제 dist 를 소비해야 한다**(`pages/ui-review.html`). 손으로 베낀 CSS 로 화면을 만들면 검증이 무의미하다.
5. **밀도(density) 대상인지 판정한다.** 바텀시트는 한 줄에 나란히 놓이는 컨트롤이 아니므로 아마 `outOfScope` 다. 안쪽 Option 한 줄(48)은 모바일 높이와 같다 — 밀도 정책에 넣을지 판정이 필요하다. 정본은 `registry/governance/density-policy.json`.

## 끝났다고 말할 수 있는 조건

- 독립 바텀시트 부품이 `ui-library/dist` 에 있고, 전체 묶음과 개별 설치 둘 다에서 같게 동작한다
- 날짜 선택·시간 선택이 그 부품을 재사용하고, 이관 전후 렌더가 같다
- 모바일에서 드롭다운 대신 쓸 **목록 시트 예시**가 있다
- `registry/governance/density-policy.json` 의 `mobileSubstitutes.dropdown.libraryStatus` 를 `missing-component` → `available` 로 바꾸고, `npm run ui:density` 안내에서 "아직 부품이 없습니다"가 사라진다
- 🤖 `component-verifier` 시나리오 F 통과 + river UX 승인

## 관련 기록

- `BACKLOG.md` §🔴 0-b — 이 작업의 backlog 항목
- `reports/missing-inventory-audit/BRIEF.md` — **빠진 컴포넌트·토큰 전수 확인.** river 는 이 확인이 먼저라고 했다(2026-09-15). 거기서 바텀시트의 우선순위가 바뀔 수 있다
- `reports/ui-library/density-scale/6-promotion.md` — 이 일이 나온 배경
- `.claude/skills/ui-library-code/references/wiring-and-traps.md` — 착수 5분 점검·배선표·검증 함정
