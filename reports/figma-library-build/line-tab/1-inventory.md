# 1단계 재고조사 — Line Tab (원본 재측정)

> 소스(정본 원본): **`tab` 529:16870** (사용자가 "내가 준 원본"으로 지정). 재측정자: ⭐ (figma get_design_context/get_variable_defs 직접 읽음, 9 variant 전수).
> 잘못된 기존 빌드: **`Line Tab` 508:6863** (2026-05-28, 검문소 절차 신설(2026-06-18) 이전 즉흥 제작 → 검증 0건).
> 정본 스펙: `registry/components/tab.json` — 재측정 결과 **이미 정확**(아래 표와 일치). 빌드 기준으로 사용 가능.

## 원본 구조 (모든 variant 공통)
- 루트: `flex flex-col items-center justify-center`, bg = `color/navigation/background`(#fff), `min-width = sizing/80`(80px, 가변폭 — 내용 따라 늘어남)
- 자식 1) **텍스트 컨테이너**: `flex items-center justify-center overflow-clip`, 좌우 padding 토큰, 상하 padding `spacing/4`(4px), **고정 높이**
- 자식 2) **인디케이터(밑줄) 영역**: 하단 라인. selected만 파랑 2px, 그 외 회색 1px(+위에 흰색 1px 스페이서)

## 원본 9 variant 전수 (재측정값)

| variant | 소스노드 | 텍스트높이 | 글자 | 글자색 토큰 | 좌우padding | 인디케이터(밑줄) | 전체높이 |
|---|---|---|---|---|---|---|---|
| pc-md unselected | 529:16883 | 40 | **20 Medium** | `text/title/secondary` #353535 | inline/lg=24 | 회색 1px (`indicator/default` #d9d9d9) + 흰 1px, zone 4px | 44 |
| pc-md hover | 529:16903 | 40 | **20 Bold** | `navigation/label/selected` #1d6ceb | 24 | 회색 1px + 흰 1px, zone 4px | 44 |
| pc-md selected | 529:16909 | 40 | **20 Bold** | `navigation/label/selected` #1d6ceb | 24 | **파랑 2px** (`indicator/selected` #1d6ceb, 1px×2), zone 4px | 44 |
| pc-sm unselected | 529:16889 | 40 | **16 Medium** (ls -0.32) | `text/title/secondary` #353535 | 24 | 회색 1px + 흰 1px | 42 |
| pc-sm hover | 529:16896 | 40 | **16 Bold** | `navigation/label/selected` #1d6ceb | 24 | 회색 1px + 흰 1px | 42 |
| pc-sm selected | 529:16915 | 40 | **16 Bold** | `navigation/label/selected` #1d6ceb | 24 | **파랑 2px** (1px×2 또는 2px bar) | 42 |
| mobile unselected | 529:16871 | 30 | **16 Medium** (ls -0.32) | `navigation/label/default` #555 | inline/sm=16 | 회색 1px + 흰 1px | 32 |
| mobile pressed | 529:16877 | 30 | **16 Bold** | `navigation/label/selected` #1d6ceb | 16 | **회색 1px** + 흰 1px (파랑 아님!) | 32 |
| mobile selected | 529:16920 | 30 | **16 Bold** | `navigation/label/selected` #1d6ceb | 16 | **파랑 2px** (`indicator/selected`, 1px×2) | 32 |

### 핵심 디테일 (이전 빌드가 놓친 것)
1. **선 두께**: selected = **파랑 2px**, default/hover/pressed = **회색 1px**. (기존 빌드는 전부 1px)
2. **높이**: pc-md=44 / pc-sm=42 / mobile=32. (기존 빌드 40 / 30 / 30)
3. **글자**: pc-md=20px, pc-sm=16px, mobile=16px. selected/hover/pressed=**Bold**, unselected=Medium. (기존 16/14 Medium)
4. **미선택 글자색이 PC≠모바일**: PC unselected=#353535(`text/title/secondary`), mobile unselected=#555(`navigation/label/default`).
5. **hover/pressed는 글자만 파랑 굵게, 밑줄은 회색 1px 유지.** 파랑 2px 밑줄은 selected 전용.
6. **폭 가변**(min 80). 기존 빌드 76 고정 ❌.
7. **오토레이아웃 + 패딩 토큰.** 기존 빌드 절대좌표 ❌.
8. **모바일 3번째 상태 = pressed** (기존 빌드 hover ❌).

## 토큰 (전부 기존 정본에 존재 — 임의 색 0)
| 용도 | Variable |
|---|---|
| 배경 / 스페이서 라인 | `color/navigation/background` (#ffffff) · `color/base/white` |
| 미선택 밑줄 | `color/navigation/indicator/default` (#d9d9d9) |
| 선택 밑줄 | `color/navigation/indicator/selected` (#1d6ceb) |
| 선택/hover/pressed 글자 | `color/navigation/label/selected` (#1d6ceb) |
| 모바일 미선택 글자 | `color/navigation/label/default` (#555555) |
| PC 미선택 글자 | `color/text/title/secondary` (#353535) |
| 텍스트 스타일 | title/20B · title/20R(Medium) · title/16B · title/16M |
| 사이징 | `sizing/40`(PC 텍스트高) · `sizing/30`(모바일) · `sizing/80`(min-width) · padding `inline/lg`24·`inline/sm`16·`spacing/4`4 |

## 기존 라이브러리 현황 / 충돌
- 기존 잘못된 세트 508:6863 "Line Tab": 축 = `Size(SM/MD) × State(Unselected/Hover/Selected) × Break(PC/Mobile)`, 9 variant. 절대좌표·1px·축소 높이.
- **참조 인스턴스(보존 필요):** `mobile_datepicker_bottomsheet` 세트가 508:6854(SM/Unselected/Mobile)·508:6860(SM/Selected/Mobile)를 인스턴스로 사용 중. → 변형세트 property NAME(Size/State/Break)을 유지하면 datepicker 인스턴스가 안 깨짐.
- registry figmaNodeId=540:6032 (또 다른 tab 노드) — 정리 대상(별도).

### 🚦 검문소 1 — 통과
원본 9 variant 전수 재측정 완료. 충돌 = datepicker 인스턴스 보존(축 이름 유지로 해결). 사용자 "탭 먼저 수정" 승인.
