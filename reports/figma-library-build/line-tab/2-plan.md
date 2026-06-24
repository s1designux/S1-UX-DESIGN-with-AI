# 2단계 빌드 계획 — Line Tab

> 목표: 잘못된 기존 세트 **508:6863**을 원본 **529:16870**과 **정확히 일치**하도록 재빌드.
> 빌드 = 🏗️ figma-library-builder. 검증 = 🤖 component-verifier(원본 529:16870 재측정 대조). ⭐는 흐름만.

## 빌드 방식 결정 (⭐ 메커니즘)
- **기존 세트 508:6863을 in-place 재작성** (신규 세트 생성 아님) — datepicker 인스턴스(508:6854/6860) 보존 위해 property 축 이름 유지.
- **variant 축 유지**: `Size={MD,SM} × State={Unselected,Hover,Selected,Pressed} × Break={PC,Mobile}`.
  - 매핑: `MD/PC`=원본 pc-md · `SM/PC`=원본 pc-sm · `SM/Mobile`=원본 mobile.
  - **State 보정**: PC variant = Unselected/Hover/Selected. **Mobile variant = Unselected/Pressed/Selected** (기존 Mobile "Hover"를 **Pressed로 변경** — 원본 일치). MD/Mobile 조합 없음(원본에도 없음). → **9 variant.**
- 각 variant **내부를 원본 구조로 전면 교체**: 절대좌표 → **오토레이아웃(flex-col)**, 텍스트컨테이너(고정높이+패딩토큰) + 인디케이터 영역.

## variant별 빌드 스펙 (원본 재측정값 = registry/components/tab.json 일치)

| Size/Break | State | 텍스트高 | 글자스타일 | 글자색 토큰 | 좌우padding | 밑줄 |
|---|---|---|---|---|---|---|
| MD/PC | Unselected | sizing/40 | title/20R(Medium 20) | text/title/secondary | inline/lg | 회색1px(indicator/default)+흰1px |
| MD/PC | Hover | sizing/40 | title/20B(Bold 20) | navigation/label/selected | inline/lg | 회색1px+흰1px |
| MD/PC | Selected | sizing/40 | title/20B | navigation/label/selected | inline/lg | **파랑2px(indicator/selected)** |
| SM/PC | Unselected | sizing/40 | title/16M(Medium 16) | text/title/secondary | inline/lg | 회색1px+흰1px |
| SM/PC | Hover | sizing/40 | title/16B(Bold 16) | navigation/label/selected | inline/lg | 회색1px+흰1px |
| SM/PC | Selected | sizing/40 | title/16B | navigation/label/selected | inline/lg | **파랑2px** |
| SM/Mobile | Unselected | sizing/30 | title/16M | navigation/label/default(#555) | inline/sm | 회색1px+흰1px |
| SM/Mobile | Pressed | sizing/30 | title/16B | navigation/label/selected | inline/sm | 회색1px+흰1px |
| SM/Mobile | Selected | sizing/30 | title/16B | navigation/label/selected | inline/sm | **파랑2px** |

- 루트: bg=`color/navigation/background`, `min-width=sizing/80`(가변폭, 고정폭 금지), 상하 padding `spacing/4`.
- 라벨 텍스트: 데모용 "라벨"(원본과 동일). 텍스트 스타일은 setTextStyleIdAsync로 바인딩(Noto 타이핑 후 V2.4 스타일 바인딩 — MEMORY 규칙).
- 인디케이터: selected = `indicator/selected` 파랑 2px(1px×2 또는 2px bar). 그 외 = 위 흰 1px(`base/white`/`navigation/background`) + 아래 `indicator/default` 회색 1px.

## 색상 바인딩 사전 조회표 (raw hex → 토큰)
| hex | 용도 | DS 조회 | 빌드 지시 |
|---|---|---|---|
| #ffffff | 배경·스페이서 | color/navigation/background·base/white ✅ | 토큰 바인딩 필수 |
| #d9d9d9 | 미선택 밑줄 | color/navigation/indicator/default ✅ | 토큰 바인딩 필수 |
| #1d6ceb | 선택 밑줄·선택/hover/pressed 글자 | color/navigation/indicator/selected · label/selected ✅ | 토큰 바인딩 필수 |
| #555555 | 모바일 미선택 글자 | color/navigation/label/default ✅ | 토큰 바인딩 필수 |
| #353535 | PC 미선택 글자 | color/text/title/secondary ✅ | 토큰 바인딩 필수 |

→ **모든 색이 정확한 토큰 등가물 존재. raw hex 잔류 0 목표. 허용편차/HD 없음.**

## 허용편차 선언서
- **폰트 폴백** #1: 모든 텍스트 노드 — 편집 시 Pretendard 로드 불가 → Noto Sans KR 임시 후 setTextStyleIdAsync로 V2.4 스타일 재바인딩(빌드 제약, MEMORY 등록). 빌더에게: 텍스트스타일 ID 바인딩 필수.

## 기존 자산 보존
- datepicker 인스턴스 508:6854(SM/Unselected/Mobile)·508:6860(SM/Selected/Mobile): 축 이름 유지 → 자동 보존. 빌더는 재빌드 후 두 인스턴스가 올바른 variant로 remap·렌더되는지 node-map에 기록.

## HD (결정 필요) — **없음**
모든 색·치수·구조가 원본/정본에서 확정. 진짜 결정사항 없음 → 사용자 "탭 먼저 수정" 승인으로 검문소 2 통과.

### 🚦 검문소 2 — 통과 (HD 0건). 3단계 빌드 위임.
