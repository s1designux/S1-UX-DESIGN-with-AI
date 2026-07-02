# 2-plan.md — Mobile Bottom Nav 매핑·빌드 계획 (figma-library-builder 지시서)

> 정본 대조: `vars-data.ts` (2026-07-01 실측). 색은 Semantic 경유·Variable 바인딩 필수(하드룰).
> ⚠️ 빌드 전제: `use_figma`(쓰기 MCP) 인증 필요 — 미인증 시 이 계획은 실행 대기.

## A. 토큰 바인딩 맵 (mechanism — ⭐ 확정)

| 요소 | 원본 토큰 | → 정본 바인딩(Variable) | 정본 resolved (light/dark) | 갈래 |
|------|----------|------------------------|---------------------------|------|
| 바 배경 | `color/navigation/background` | **`color/navigation/bg`** | base/white / gray-dark/100 | (a) 레거시명 정정 |
| 아이콘 unselected | `color/icon/gray` | **`color/icon/gray`** | gray-dark/600(#55575F) / gray-dark/700 | 그대로 (값 차이=레거시, 정본 우선) |
| **아이콘 selected** | `color/control/indicator/selected` (#1d6ceb) | **`color/icon/blue`** | blue/400(#1D6CEB) / blue-dark/300 | **(a) 오참조 정정** — 원본 토큰은 우리 DS에서 base/white(knob용)라 파랑이 하얗게 나옴. 의도색과 정확히 같은 icon/blue 로. |
| 라벨 unselected | `color/navigation/label/default` | **`color/navigation/label/default`** | gray/600(#555555) / gray-dark/600 | EXACT |
| 라벨 selected | `color/navigation/label/selected` | **`color/navigation/label/selected`** | blue/400(#1D6CEB) / blue-dark/300 | EXACT |
| 라벨 타이포 | body/12M | **`body/12M`** 텍스트 스타일 바인딩 | Pretendard Medium 12 | EXACT (폰트=Pretendard 정본, Noto 금지 하드룰) |

### 기하값 (색 아님 — 고정값 허용)
- 아이템: 60×60 (원본 sizing/60). 세로 오토레이아웃, 중앙정렬(primary/counter CENTER).
- 아이콘: 32×32 (원본 sizing/icon/32 = 폐지 토큰 → 기하 고정값). `spacing/4` gap 은 Variable 바인딩 가능하면 바인딩, 아니면 4 고정.
- 좌우 패딩: `spacing/padding/inline/xxs`(8) — 있으면 바인딩.

## B. 두 갈래 분류 결과 (검증기 참고)
- (a) 코드실수 정정 2건: navigation/background→bg, control/indicator/selected→icon/blue. **정확 대조 대상(토큰 참조 구조)이라 항상 엄격** — 개선 핑계 아님, 원본이 명백히 잘못된 토큰을 참조.
- 값 차이(icon/gray #757575 vs 정본 #55577F 등)는 레거시 값 → 정본 우선(두 갈래 (b) 사전등록: 레거시 색값은 정본이 정답).
- 허용편차: 없음(파비콘 같은 raw 잔류 없음).

## C. 빌드 지시 (🏗️ figma-library-builder — use_figma 인증 후)
1. **Tab Item 컴포넌트 2개 생성** → `state=unselected`, `state=selected`.
   - 각: 세로 오토레이아웃 60×60, 중앙정렬, gap 4.
   - 아이콘: DS 아이콘 라이브러리 **home 컴포넌트 인스턴스**(키 조회). 색 = state별(gray / blue) Variable 바인딩. **라이브러리에 home 키 없으면 needs-decision(임의 벡터 금지).**
   - 라벨: TEXT "라벨", 텍스트 스타일 `body/12M` 바인딩, 색 = state별 Variable 바인딩.
2. `combineAsVariants([unselected, selected])` → 세트명 **`Mobile Bottom Nav`** (또는 `TabBar Item` — HD-3).
3. **배치: navigation 섹션 하단** (사용자 지정). Figma 파일에서 navigation 섹션 위치를 get_metadata 로 찾아 그 아래 빈 공간에 배치. 색 안 물린 하드코딩 hex 금지(figma-code-hex-check 훅이 차단).
4. (HD-1 = A 선택 시) 사용 예시 **Bar** 프레임: 탭 아이템 인스턴스 4개 가로 균등, 배경 `color/navigation/bg` 바인딩, 첫 탭만 selected.
5. 변경 노드 id 전부 node-map.json 기록. 토큰 Variable id 못 찾으면 needs-decision(임의 색 금지).

## D. 검증 지시 (🤖 component-verifier — 빌더와 분리)
- 세트 구조: state 2 variant 전수 존재·패킹 붕괴 0.
- 토큰 바인딩 스캔: 모든 fill/stroke/텍스트색이 Variable 바인딩(하드코딩 hex 0). 특히 selected 아이콘이 icon/blue 인지(base/white 아님) 확인.
- 폰트: 전 TEXT fontName=Pretendard (Noto 잔존 0, 데이터 스캔·렌더 판정 금지).
- get_screenshot 시각 대조: unselected=회색/ selected=파랑, 레이아웃 원본과 동일.

## HD (사용자 결정 — 2026-07-01 확정)
- **HD-1 ✅ (A):** 탭 아이템 세트 + **4탭 바 사용예시 함께** 만든다(첫 탭만 selected).
- **HD-2 (빌더 처리):** 아이콘 소스 = DS 아이콘 라이브러리 home 컴포넌트 인스턴스. 빌더가 라이브러리에서 home 키를 조회해 사용. **키를 못 찾으면 임의 벡터 금지 → needs-decision 으로 반환.**
- **HD-3 ✅:** 컴포넌트 세트 이름 = **`Mobile Bottom Nav`**.
