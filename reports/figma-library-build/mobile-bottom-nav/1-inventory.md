# 1-inventory.md — Mobile Bottom Nav (모바일 하단내비바) 원본 재고조사

> 원본: SW-UX-GUIDE-V2.4, node **540:6025** (`mobile_bottom-nav`)
> figma-local(읽기) MCP 로 추출 완료 (2026-07-01). `use_figma`(쓰기)는 이 세션 미인증 → 빌드는 대기.
> 진입 스킬: `figma-library-build` (빌드=🏗️ figma-library-builder · 검증=🤖 component-verifier · ⭐ 흐름만).

## 원본 구조 (get_metadata)

```
frame 540:6025 "mobile_bottom-nav"  x=762 y=5493  360×126   (검토 프레임, bg=surface/neutral/bg/subtle #f5f5f5 장식)
├─ symbol 540:6026 "state=unselected"  60×60
└─ symbol 540:6029 "state=selected"    60×60
```

- 정본 단위 = **탭 아이템**(Tab Item) 컴포넌트. `state=` 축 1개, 값 2개(unselected/selected).
- 탭 아이템 내부(스크린샷 실측): **세로 오토레이아웃** = [아이콘(home, 32×32)] + gap + [라벨 "라벨"]. 중앙 정렬.
- 바(여러 탭을 가로로 담는 컨테이너)는 원본 검토 프레임에 별도로 없음 → 사용 예시 바는 우리가 조립(HD-1 참조).

## 원본 변수 (get_variable_defs, 540:6025)

| Figma 변수 | 원본 resolved | 용도(추정) |
|-----------|--------------|-----------|
| `color/navigation/background` | #ffffff | 바 배경 (⚠️ 레거시명 — 정본은 `bg`) |
| `color/icon/gray` | #757575 | unselected 아이콘 |
| `color/control/indicator/selected` | #1d6ceb | selected 아이콘 (⚠️ 레거시 오참조 — §2 참조) |
| `color/navigation/label/default` | #555555 | unselected 라벨 |
| `color/navigation/label/selected` | #1d6ceb | selected 라벨 |
| `body/12M` | Pretendard Medium 12 / lh 1.3 | 라벨 타이포 |
| `sizing/60` | 60 | 아이템 크기 60×60 |
| `sizing/icon/32` | 32 | 아이콘 32×32 (⚠️ 우리 정본에선 폐지된 컴포넌트 사이징 → 기하값으로) |
| `spacing/4` | 4 | 아이콘↔라벨 간격 |
| `spacing/padding/inline/xxs` | 8 | 좌우 인라인 패딩(추정) |
| `surface/neutral/bg/subtle` | #f5f5f5 | 검토 프레임 배경(장식, 컴포넌트 아님) |

## 스크린샷 소견
- unselected: 회색 home 아이콘 + 회색 "라벨"
- selected: **파란** home 아이콘 + **파란** "라벨"
- 두 상태의 유일한 차이 = 아이콘색·라벨색 (레이아웃/크기 동일).

## variant 개수 (검문소 1 — 사용자 확인 대상)
- **탭 아이템 세트 = state 2개 (unselected, selected).** 그 외 축 없음.
- (선택) 사용 예시 "Bar" = 탭 아이템 인스턴스 N개를 가로로 배치한 별도 프레임 — 컴포넌트 세트 아님.

## 미해결(needs-decision)
- **HD-1 (바 사용 예시 포함 여부):** 원본엔 탭 아이템 2상태만 있고 '바 전체'는 없음. 여러 탭을 담은 사용 예시 바(예: home/검색/마이 4탭, 하나 selected)를 함께 만들까? 아니면 탭 아이템 세트만? → §2 계획에서 A/B 제시.
- **HD-2 (아이콘 소스):** 원본 아이콘은 home 글리프. DS 아이콘 라이브러리에 home 컴포넌트 키가 있으면 인스턴스로(Gate 12 정신), 없으면 needs-decision. 빌드 시 라이브러리 조회 필요.
