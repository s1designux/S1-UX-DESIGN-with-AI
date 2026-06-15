# TimePicker Dropdown — 1단계 재고조사 (Inventory)

**Figma 원본:** `Tnihi6lixRR47N4RSAwUbF`
- 드롭다운 세트(패널): `1459:18597` "Dropdown List" (186×242)
- 드롭다운 요소(아이템): `1459:18526` "Time Base" (77×30, 상태 Default/Selected/Hover)

**대상 코드:** `plugins/figma-vars-installer/src/build-components.ts` → `buildTimePickerDropdown` (역방향 Figma 생성기 = 정본 스펙)

---

## 패널 구조 (1459:18597 metadata 실측)

```
Dropdown List (186×242, list/bg, list/border 1px, radius 4)
├─ Frame(186×190, y=12)               ← paddingTop 12
│  └─ Time (186×190, clip)
│     ├─ Hour   (93×210)  ← 7 rows × 30, x=0       구분선 없음
│     │  └─ row (93×30) → Time Base (77×30, x=8)   ← 좌우 8px 거터
│     └─ Minute (93×210)  ← 7 rows × 30, x=93
│        └─ row (93×30) → Time Base (77×30, x=8)
└─ Option (186×40, y=202)             ← 푸터
   └─ Text Area (x=16, w=154) → "확인" (우측정렬)
```

- 컬럼: **Hour(93) + Minute(93) = 186, 사이 구분선 없음, 좌우 패딩 없음.**
- 아이템(Time Base)은 행(93) 안에서 **77 폭으로 가운데**, 좌우 8px 거터.
- 표시 행: 7행(컬럼 210px)이나 가시영역 190px로 **clip**(≈6.3행 보임). 선택 = 첫 행.

## 아이템 상태 (1459:18526 Time Base · 3 state)

| # | state | 시각 | 비고 |
|---|-------|------|------|
| 1 | Default | label만 | 테두리·배경 없음 |
| 2 | Selected | 1px 파란 테두리 + 파란 텍스트 | **Regular weight (Bold 아님)** · 배경 변화 없음 |
| 3 | Hover | bg 채움 + hover 라벨색 | 패널 정적 합성엔 미표시(아이템 상태) |

> 아이콘: **없음**(텍스트 전용 컴포넌트).

## variant 결정 (검문소 1 — 사용자 확인 완료)

사용자가 V2.4 추가 참고 제시: `540:3506`(set: type=24h 540:3507 + type=12h 540:3536) · `540:3469`(V2.4 item 44×32).
→ **12h 유지 확정.** V2.4 세트에 24h·12h 둘 다 존재(12h=오전/오후·시·분 3컬럼).

**디자인 세대 2종 확인:**
| | GUI 신규(1459) | V2.4 구버전(540) |
|---|---|---|
| 아이템 | Time Base 77×30 | 44×32 |
| 토큰 | `dropdown/option/*` | (구) |
| 컬럼 구분선 | 없음 | 있음 |
| 확인 푸터 | accent(파랑) | 회색 |
| variant | 24h만 제공 | 24h+12h |

**합성 결정:** GUI(신규, 사용자 1차 지정) 비주얼/아이템/토큰을 정본으로, **두 변형 모두**에 적용.
- 24h = GUI 실측(2×93=186)
- 12h = GUI 컬럼 규격(93/col) 균일 적용 → 오전/오후·시·분 3컬럼(3×93=279). **12h 폭은 GUI 미제공 → 알려진 컬럼 단위 복제(파생값, 추정 아님).**

**총 variant: 2종(24h·12h).**
