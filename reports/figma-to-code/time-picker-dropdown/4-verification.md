# 4단계 자가대조 결과 — time-picker-dropdown

> 대상: `plugins/figma-vars-installer/src/build-components.ts` → `buildTimePickerDropdown` (역방향 Figma 생성기, 1326~1423행).
> 기준: `1-inventory.md` · `2-extraction.md`. 정적 코드 ↔ 표 대조 (preview 서버 해당 없음).

## 대조 요약
- variant: 2/2 (Type=24h, Type=12h) — 목표 일치
- 토큰 참조 구조: 정확 대조 6/6 일치, 구 토큰 잔존 0건
- 수치(두갈래): 전 항목 일치, 구값(ROW_H 40·푸터 45·sep) 잔존 0건

---

## 정확 대조 (두갈래 제외 — 항상 엄격)

### variant 구성
| 항목 | 기준 | 코드 | 판정 |
|------|------|------|------|
| variant 종류 | 24h·12h 2종 | `types`=[24h, 12h] (1368~1371행), `combineAsVariants` → `Type=24h`/`Type=12h` | ✅ |
| 24h 컬럼 | 시·분 2컬럼(2×93=186) | `cols:[hours, mins]`, panelW=2×93=186 | ✅ |
| 12h 컬럼 | 오전오후·시·분 3컬럼(3×93=279) | `cols:[ampm, hours, mins]`, panelW=3×93=279 | ✅ |

### 토큰 참조 구조
| 속성 | 기준 토큰 | 코드 (라인) | 판정 |
|------|----------|------------|------|
| 패널 bg | `color/dropdown/list/bg` | 1383 (+컬럼 bg 1340) | ✅ |
| 패널 border | `color/dropdown/list/border` | 1384 | ✅ |
| 선택 테두리 | `color/dropdown/option/border/selected` | 1356 | ✅ |
| 선택 라벨 | `color/dropdown/option/label/selected` | 1357 | ✅ |
| default 라벨 | `color/dropdown/option/label/default` | 1357 | ✅ |
| 확인(푸터) | `color/text/state/accent` | 1404 | ✅ |
| 구 토큰 잔존 | `line/blue`·`text/body/secondary`·accent-as-selected 없어야 | 함수 내 미존재 (grep 0건) | ✅ |

> selected 라벨에 `color/text/state/accent`를 쓰지 않고 `option/label/selected`를 사용 — accent는 푸터 전용. 잔존 없음 확인.

---

## 두갈래 분류 (수치 — 레거시가 틀렸을 수 있는 값)

| 항목 | 기준 | 코드 (라인) | 판정 |
|------|------|------------|------|
| COL_W | 93 | `COL_W=93` (1333) | ✅ |
| ITEM_W | 77 (행 안 가운데·거터 8) | `ITEM_W=77`, 행 93 안 가운데(`primaryAxisAlignItems=CENTER` 1346) | ✅ |
| ROW_H | 30 (구 40 잔존 ❌) | `ROW_H=30` (1333), 행·아이템 모두 ROW_H (1348·1355) | ✅ 구40 미존재 |
| COLS_H | 190 | `COLS_H=190` (1333), col·colsFrame 적용 (1341·1392) | ✅ |
| 패널폭 24h | 186 | `panelW`=2×93=186 (1375) | ✅ |
| 패널폭 12h | 279 | `panelW`=3×93=279 (1375) | ✅ |
| 푸터 높이 | 40 (구 45 잔존 ❌) | `footer.resize(panelW, 40)` (1403) | ✅ 구45 미존재 |
| paddingTop | 12 | `panel.paddingTop=12` (1381) | ✅ |
| radius | 4 | `panel.cornerRadius=4` (1381), item `cornerRadius=4` (1354) | ✅ |
| px (아이템 좌우패딩) | 12 | `paddingLeft/Right=12` (1354) | ✅ |
| 선택 텍스트 weight | Regular (구 Bold ❌) | `makeBoundText(..., 14, "Regular", ...)` (1358) | ✅ Bold 미존재 |
| 컬럼 사이 구분선 | 없음 (구 sep/fSep ❌) | `colsFrame.itemSpacing=0`, 컬럼만 append, sep/fSep 미존재 (grep 0건) | ✅ |
| 푸터 정렬 | 우측정렬 MAX | `footer.primaryAxisAlignItems="MAX"` (1401) | ✅ |
| 푸터 폰트 | 14 Medium | `makeBoundText("확인", 14, "Medium", ...)` (1404) | ✅ |

---

## ❌ (a) 코드 실수 — 수정 대상
- 없음.

## 🟡 (b) 의도적 개선 (사전 등록됨)
- 없음.

## ❓ (c) 확인 요청 — 사용자 판단 필요
- 없음.

## 🔒 BLOCKED
- 없음. (2단계 `MCP 미제공` 0건)

---

## 판정
- ❌(a) 0건 · ❓(c) 0건 · 🔒BLOCKED 0건 → **PASS (4단계 통과)**
- 정확 대조(variant·토큰) 전수 일치, 두갈래 수치 전수 일치, 구값/구토큰 잔존 0.
