# 2-canon-readiness — 제작 전 정본 준비

작업: `bottom-sheet` · 2026-09-15

---

## 1. 만들 것 — 컴포넌트 2개

정본이 세트 2개이고, 저장소 관례도 "정본 세트 하나 = 배포 컴포넌트 하나"다(`gnb-sub-menu` ↔ `gnb-sub-menu-item`, `modal` ↔ `modal-content`). 따라서 두 개로 낸다.

| id | 무엇 | 정본 |
|---|---|---|
| `bottom-sheet` | 시트 껍데기 — 딤 + 패널 + 헤더(제목·닫기) + 본문 자리 + 푸터 | `buildBottomSheet` |
| `bottom-sheet-option` | 시트 안 한 줄 — Text · Checkbox · Radio · List | `buildBottomSheetOption` |

## 2. 공개 계약

### bottom-sheet

```
div[data-s1-component="bottom-sheet"][data-break="mobile"][data-footer="none|single|dual"][hidden]
└─ div[data-s1-part="sheet-backdrop"]
└─ div[data-s1-part="sheet-panel"][role="dialog"][aria-modal="true"][aria-labelledby][tabindex="-1"]
   ├─ div[data-s1-part="sheet-content"]            (선택 — 정본 content 프레임. 있으면 gap 24)
   │  ├─ div[data-s1-part="sheet-header"]
   │  │  ├─ span[data-s1-part="sheet-title"][id]
   │  │  └─ button[data-s1-part="sheet-close"][aria-label]
   │  └─ div[data-s1-part="sheet-body"]            (정본 SLOT "Content" 의 웹 대응 — 화면이 채운다)
   └─ div[data-s1-part="sheet-footer"]             (data-footer="none" 이면 없음)
```

- 부품 어휘는 **이미 배포된 date-picker·time-picker 시트와 같은 이름을 그대로 쓴다**(`sheet-*`).
- 루트에 `data-s1-part="sheet"` 를 함께 달 수 있다 — date-picker·time-picker 가 자기 부품으로 부르는 이름이라 그대로 두면 기존 JS 선택자가 그대로 산다.
- 정본 SLOT 은 웹에서 **빈 컨테이너**다. 기본 채움(Option 4줄, 2번째 Selected)은 컴포넌트가 아니라 **예시 마크업**이 갖는다.

### bottom-sheet-option

```
div[data-s1-component="bottom-sheet-option"][data-type="text|checkbox|radio|list"][data-state="default|selected|disabled"]
  text     → span[data-s1-part="label"] (+ selected 면 span[data-s1-part="check"])
  checkbox → div[data-s1-component="checkbox"] 코어 + span[data-s1-part="label"]
  radio    → div[data-s1-component="radio"] 코어 + span[data-s1-part="label"]
  list     → div[data-s1-part="list-left"]( div[data-s1-part="avatar"] + div[data-s1-part="list-text"]( title + sub ) )
             + span[data-s1-part="chevron"]  또는 disabled 면 span[data-s1-part="lock"]
```

**존재하지 않는 조합(`absentCombinations`)** — 정본에 없으므로 만들지 않는다: `checkbox:disabled` · `radio:disabled` · `list:selected`.

## 3. date-picker·time-picker 이관 — 렌더를 바꾸지 않는 방법

세 시트는 **서로 다른 정본 컴포넌트**이고 값이 두 군데 다르다.

| | 독립 Bottom Sheet | Date/Time Picker 시트 |
|---|---|---|
| 패널 안 간격 | 48 (content↔footer), content 안 24 | **32** (헤더↔본문↔푸터 한 층) |
| 그림자 | `shadow/raised-up` 있음 | **없음** |

그래서 공유 CSS 를 그대로 물리면 두 화면이 달라진다(= 퇴행). 해결:

`bottom-sheet.css` 가 **공개 사용자 지정 속성 2개**를 선언하고, 소비자가 자기 정본 값을 준다. 코어 내부 선택자를 덮어쓰는 것이 아니라 **선언된 조절 지점**이다.

| 속성 | 기본값(독립 시트 정본) | date-picker·time-picker 가 주는 값 |
|---|---|---|
| `--s1-bottom-sheet-gap` | `var(--spacing-48)` | `var(--spacing-32)` |
| `--s1-bottom-sheet-shadow` | `var(--shadow-raised-up)` | `none` |

두 화면은 `sheet-content` 층을 쓰지 않는다(정본이 한 층이다) — 그래서 이 부품은 **선택 부품**이다.
이관 뒤 `date-picker.css` 469~540 · `time-picker.css` 262~320·444~447 의 시트 규칙은 **지운다**(두 벌 유지 금지). 두 컴포넌트는 `dependencies.coreComponents` 에 `bottom-sheet` 를 선언한다.

## 4. 동작 계약

`modal` 과 같은 것(두 벌 만들지 않고 같은 규칙을 따른다): `hidden` 여닫기 · `role=dialog`·`aria-modal` · 제목 연결 · 초점 첫 요소 이동 · Tab 가둠 · Esc 닫기 · 초점 복귀 · 배경 스크롤 잠금.

`modal` 과 **다른 것 한 가지**: **배경(딤) 클릭으로 닫는다.** 새로 만드는 동작이 아니라 **이미 배포된 date-picker 시트가 하고 있는 동작**이며, 빼면 그 화면이 퇴행한다. 모달의 "딤 클릭 닫기 없음"은 모달 범위에 대한 결정(river 2026-09-02)이라 시트에 자동 적용되지 않는다.

이벤트: `s1:bottom-sheet:open` · `s1:bottom-sheet:close`. 메서드: `open()` · `close()` · `isOpen`. 생명주기: `init(root)` · `destroy(root)`.

## 5. 토큰

전부 정본에 있다. **새 토큰 0건.**

`color/surface/raised` · `color/overlay` · `color/text/title/primary` · `color/icon/gray-dark` · `color/text/body/primary` · `color/text/body/secondary` · `color/text/state/accent` · `color/text/state/disabled` · `color/icon/blue` · `color/icon/gray-light` · `color/icon/white` · `color/icon/gray` · `shadow/raised-up` · `radius/8` · `spacing/48·32·24·20·12·8·2`.

## 6. 밀도

`bottom-sheet` · `bottom-sheet-option` 둘 다 **outOfScope** (근거 = 1-inventory §5). `density-policy.json` 의 `outOfScope` 에 사유와 함께 적는다.

## 7. needs-decision

| id | 무엇 | 왜 결정이 필요한가 |
|---|---|---|
| **HD-1** | `Type=List, State=Disabled` 의 **잠금(자물쇠) 아이콘** | 이 칸에만 쓰이는 아이콘인데, 저장소의 "쓸 수 있는 Figma 아이콘 목록"(`registry/figma/allowed-remote-keys.json`)에 없다. 목록에 넣는 것은 지금까지 매번 river 승인 사항이었다(가장 최근 2026-09-14 하단 내비 아이콘 3개). 임의로 넣으면 하드룰 H6② 위반이다. |

**HD-1 이 닫히기 전까지**: `list:disabled` 한 칸만 빼고 나머지 8칸을 만든다. 승인이 나면 아이콘을 등록하고 그 칸을 채운다.

## 8. 검문소

- 정본에 없는 컴포넌트·variant·토큰 신설: **0건**
- 새 토큰: **0건**
- needs-decision: **1건 (HD-1)** — 그 한 칸을 제외한 범위는 착수 가능
