# 5-webtabbar-binding-plan.md — WebTabBar(335:3099) 미바인딩 색 → 토큰 바인딩 계획

> 계기: 토큰 바인딩 스캔(use_figma) + figma-binding-lookup 역매핑으로 **미바인딩 27건·색 10종** 확정. 4-verification 이 카테고리 판단으로 (b) 통과시킨 실패를 바로잡는다. 사용자 결정(2026-06-19): **전부 토큰 바인딩**(크롬 회색=가까운 토큰 / 파비콘=brand 토큰).

## 바인딩 맵 (mechanism — ⭐ 확정, 색은 Semantic 경유)

| hex | 노드 id | 역할 | → 토큰 | 타입 | 비고 |
|-----|---------|------|--------|------|------|
| `#FFFFFF` | 336:3100, 336:3102, 335:3101 | 표면(탭마스크·파비콘bg·주소창bg) | `color/surface/default` | semantic | EXACT |
| `#353535` | 337:3099,3100,3101,3102 | nav 아이콘 stroke(뒤/앞/새로고침) | `color/icon/gray-dark` | semantic | EXACT |
| `#262626` | 337:3105,3108,3111,3112 | nav 아이콘 fill(동일 아이콘) | `color/icon/gray-dark` | semantic | 단색 통일(#353535와 합침) |
| `#000000` | 336:3113 | 탭 라벨 텍스트 | `color/text/body/primary` | semantic | 순흑→DS 글자(#202020) |
| `#DCDCDC` | 336:3098, 335:3099 | 탭 스트립 배경(크롬) | `color/scroll/bg`(=#D9D9D9) | semantic·근사 Δ4.5 | bg역할 중 값 최근접. 이름 한계 명시 |
| `#EBEBEB` | 337:3113 | 주소창 알약 배경 | `color/bg/muted`(=#E9E9E9) | semantic·근사 Δ3.5 | |
| `#EBEBEB` | 335:3102 | 하단 헤어라인 | `color/line/gray/subtle`(=#E9E9E9) | semantic·근사 Δ3.5 | line역할 |
| `#B6B6B6` | 336:3115,3116 | 탭 닫기 아이콘 | `color/icon/gray-light`(=#C4C4C4) | semantic·근사 Δ14 | icon역할 최근접 |
| `#0072CE` | 336:3104,3105,3108,3109,3111 | 파비콘 로고(파랑) | `brand/blue` | foundation | 로고=비테마, foundation 직접 정당 |
| `#FF312C` | 336:3106,3107,3110 | 파비콘 로고(빨강) | `brand/red` | foundation | 로고 |
| `#BE1E2C` | 336:3112 | 파비콘 로고(짙은빨강 디테일) | **잔류(토큰 없음)** | raw 유지 | 로고 서브색·DS 등가물 없음(red/500 Δ34) → 문서화 |

## 허용편차 선언서 (검증기는 (b)로 제외)
- **#BE1E2C (336:3112) 파비콘 로고 서브색** — DS 등가물 없음(근사 red/500 Δ34.6 = 별색). 파비콘은 샘플 서비스 로고라 임의 토큰 강제 시 로고 왜곡 → raw 유지. [노드+fill] 명시.

## 빌드 지시 (figma-library-builder)
- 위 표의 각 노드 id 의 해당 prop(fills/strokes)을 **Variable 바인딩**으로 교체. semantic 은 Semantic Color V2 컬렉션, brand 은 Foundation V2 컬렉션의 Variable.
- `setBoundVariableForPaint` 는 새 paint 반환 → 반드시 캡처·재대입(figma-use 규칙 10).
- #BE1E2C(336:3112)는 건드리지 않음(허용편차).
- 컴포넌트 정의(335:3099) 자체 fill(#DCDCDC)도 바인딩 대상.
- 변경 node id 전부 node-map 에 기록. 토큰 Variable id 못 찾으면 needs-decision(임의 색 금지).

## 검증 지시 (component-verifier)
- **토큰 바인딩 스캔 재실행**(token-binding-scan §2): use_figma 로 335:3099 재스캔 → 미바인딩 hex 가 **#BE1E2C 1종만** 남아야 PASS(나머지 9종 0건).
- 남은 #BE1E2C 가 허용편차에 명시됐는지 확인 → 🟡(b).
- `get_screenshot` 시각 대조: 바인딩 후에도 탭바 외형이 원본과 동일한지(색 미세변화 외 깨짐 0).
