# 1단계 재고조사 — Input

- **Figma 파일:** `에스원 GUI` (Tnihi6lixRR47N4RSAwUbF) — 신규 기준 소스 (V2.4 교체 확정)
- **루트 노드:** `1459:18831` (Frame "Input")
- **⚠️ 프레임 표시 모드: DARK** — get_variable_defs가 다크값을 반환. 라이트값은 이 프레임에서 직접 못 읽음.
- **변형 축:** Size(XSMALL/SMALL/MEDIUM) × State(Default/Read-Only/Filled/Error/Correct/Disabled) × icon(Off/On) × Lable(Off/On) × Message(Off/On) × Break(PC/Mobile)
- **총 variant 개수: 96개** = 6 State × 4 Size·Break(XSMALL-PC / SMALL-PC / MEDIUM-PC / MEDIUM-Mobile) × Lable(2) × Message(2)

## 6 State (컬럼, 좌→우)

| State | Figma 표기 | 예시 텍스트 | 시각 (다크 기준) |
|-------|-----------|-----------|-----------------|
| Default | Default | "Placeholder" | bg #1C1D23, border #24252C, placeholder #55575F |
| Read-Only | Read-Only | "Placeholder" | bg #2E2F38(밝음), 읽기전용 |
| Filled | Filled | "내용" | text #ECEDF0 (primary) |
| Error | Error | "잘못된 값" | border #F06070, message #F06070 |
| Correct | Correct | "올바른 값" | border #4285E8, message #6FA5F8, **MEDIUM=아이콘 노출** |
| Disabled | Disabled | "비활성" | bg #131418, text #35363F |

## Size / Break

| Size | 높이 | Break | 비고 |
|------|------|-------|------|
| XSMALL | 28px | PC | |
| SMALL | 34px | PC | |
| MEDIUM | 44px | PC | |
| MEDIUM | 48px | Mobile | |

> XSMALL/SMALL은 PC만. Mobile은 MEDIUM(48px)만 존재.

## 조합 축 (각 State × Size마다)

- **Lable(라벨):** Off / On — On이면 필드 위 "Lable" 텍스트 행 추가
- **Message(안내 메세지):** Off / On — On이면 필드 아래 "안내 메세지"/"오류 메세지"/"확인 메세지" 행 추가
- **icon:** 대부분 Off. **Correct + MEDIUM**(PC·Mobile)만 icon=On (필드 우측 아이콘).

## 전체 96 variant 매핑 (State × SizeBreak × Lable × Message)

각 State 블록은 16개 (4 SizeBreak × 2 Lable × 2 Message). nodeId 시작값:

| State | nodeId 범위 | 개수 | icon |
|-------|------------|------|------|
| Default | 1459:18832 ~ 1459:19048 | 16 | off |
| Read-Only | 1459:18840 ~ 1459:19080 | 16 | off |
| Filled | 1459:19088 ~ 1459:19208 | 16 | off |
| Error | 1459:19216 ~ 1459:19336 | 16 | off |
| Correct | 1459:19344 ~ 1459:19464 | 16 | **MEDIUM만 On** (XSMALL/SMALL off) |
| Disabled | 1459:19472 ~ 1459:19592 | 16 | off |

(Default/Read-Only는 상단 블록에서 Lable/Message 조합이 인접 배치되어 nodeId가 교차함 — 상세는 get_metadata 원본 참조.)

## 사용 아이콘

| 아이콘 | 위치 | 노드/에셋 | 상태 |
|--------|------|----------|------|
| correct 아이콘 (체크/⊗ 추정) | Correct@MEDIUM 필드 우측 | 2단계 get_design_context로 노드명·SVG 확인 예정 | 미확정 |

## 읽은 변수값 (다크 모드, get_variable_defs)

| Figma 변수 | 값(다크) |
|-----------|---------|
| color/form-control/bg/default | #1C1D23 |
| color/form-control/bg/disabled | #131418 |
| color/border/default | #24252C |
| color/bg/subtle | #2E2F38 |
| color/text/primary | #ECEDF0 |
| color/text/secondary | #B8BABF |
| color/text/placeholder | #55575F |
| color/text/disabled | #35363F |
| color/border/danger | #F06070 |
| color/text/danger | #F06070 |
| color/border/correct | #4285E8 |
| color/text/correct | #6FA5F8 |
| color/icon/default | #8A8C96 |
| color/icon/white | #FFFFFF |
| radius/4 | 4 |
| border-width/1 | 1 |
| sizing/icon/24 | 24 |
| Body/Body-12R | Pretendard Regular 12 / lineHeight 1.3 |
| Body/Body-14R | Pretendard Regular 14 / lineHeight 1.3 |

## ⚠️ 확인 필요 사항 (검문소 1)

1. **프레임이 다크 모드** — 라이트 HEX를 이 프레임에서 직접 못 읽음. 기존 코드의 라이트 토큰(stable)을 유지하고, 이 소스로는 **다크값 + 구조**만 가져올지 확인 필요.
2. **다크값 코드와 불일치** — Figma `bg/default(dark)=#1C1D23` vs 코드 `#24252C`(2026-05-27 의도적 "1단계 밝게 상향"). 두 갈래 분류: (a)코드 되돌리기 / (b)코드 개선 유지 / (c)확인. → 사용자 판단 필요.
3. **기존 Input 하네스 존재** — Label/Message/states/sizes 이미 구현됨. 이번 작업 = 기존 하네스에 (Read-Only State 컬럼 · Correct 아이콘 · 다크값 정합)을 보강하는 enhancement인지 확인.
4. **Correct 아이콘이 MEDIUM에만** — XSMALL/SMALL Correct는 아이콘 없음. 의도 확인.
5. **drop-down semantic 구조 주의** — (이전 지시) 이번은 Input이지만, 연동 드롭다운/select가 있으면 --dropdown-* semantic 구조 유지.
