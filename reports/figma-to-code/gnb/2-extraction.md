# 2단계 수치 추출 — GNB

> figma-to-code 2단계. Figma MCP `get_variable_defs`(540:5942·540:6069) + `get_design_context`(슬롯 md/sm/xsm, 바 md·sm·xsm·start) 실측. 추정값 없음.
> 검문소 1 통과: 메뉴 슬롯 9 전수 + GNB 바 6개(size 3 × align 2, viewport 반응형) + 아이콘 3종.

## 색상 (Primitive → Semantic → Component)

| 역할 | Figma 원본 | resolved | Semantic(매핑) | Component(--gnb-*) | 상태 |
|------|-----------|----------|----------------|--------------------|------|
| 바 배경 | color/navigation/background | #FFFFFF | `--color-navigation-bg` (=surface-default) | `--gnb-bg` | ✅ 재사용 |
| 바 하단 라인 | color/line/gray/subtle | #E9E9E9 | `--color-border-subtle` (=gray-100) | `--gnb-border` | ✅ 재사용 |
| 메뉴 라벨 default | color/navigation/label/default-alt | #000000 | **`--color-navigation-label-default-alt`** | `--gnb-menu-label-default` | 🆕 신규 semantic |
| 메뉴 라벨 hover·selected | color/navigation/label/hover | #1D6CEB | `--color-navigation-label-selected` (=action-primary) | `--gnb-menu-label-active` | ✅ 재사용(동일값·역할) |
| 메뉴 밑줄 hover·selected | color/line/blue | #1D6CEB | `--color-navigation-indicator-selected` (=action-primary) | `--gnb-menu-underline-active` | ✅ 재사용 |
| 메뉴 밑줄 default | (투명) | transparent | — | `--gnb-menu-underline-default` | transparent |
| 로고 텍스트 | color/base/black | #000000 | (HD-GNB-1) | `--gnb-logo-text` | ❓ 색상값 결정 |
| 유틸리티 아이콘 | color/icon/gray-dark | #353535 | (HD-GNB-2) | `--gnb-icon` | ❓ 색상값 결정 |

## 크기·간격 (메뉴 슬롯)

| 속성 | md | sm | xsm | 토큰 |
|------|----|----|-----|------|
| 슬롯 높이(바 내) | 56 | 48 | 36 | sizing 56/48 · xsm 36 |
| 컨테이너 px | 24 (lg) | 20 (md) | 20 (md) | `--spacing-padding-inline-{lg/md}` |
| 내부 px / py | 16 / 12 | 12 / 12 | 12 / 12 | inline-{sm/xs} · block-xs(12) |
| min-width | 116 | 116 | 116 | raw 116 |
| 밑줄 높이 | 2 | 2 | 2 | raw 2px |
| 라벨 폰트 | Pretendard Medium 18 / lh1.3 / ls -0.36 | **18** / lh1.3 / -0.36 | **14** / lh1.3 / **0** | title/18M · title/14M |

> ⚠️ 라벨 폰트: md·sm 모두 **18px(-0.36)**, xsm만 **14px(0)**. (sm이 14px가 아님 — 원본 확인값)

## 크기·간격 (GNB 바)

| 속성 | md | sm | xsm | 비고 |
|------|----|----|-----|------|
| 바 높이 | 56 | 48 | 36 | |
| 하단 border | 1px | 1px | 1px | `--border-width-default` |
| 내부 좌/우 패딩 | pl 24(lg) / pr 20(md) | pl 24 / pr 20 | **pl 20 / pr 24** (xsm은 좌우 반전 — spacing/20·24 실측) | md/sm: inline-lg/md · xsm: raw 20/24 |
| 로고 폰트 | Pretendard Bold 20 / lh1.3 / ls0 | 20 | 20 (xsm 데모는 통근버스 로고이미지였으나 base=텍스트 20B) | Title/20B |
| 정렬 center-between | 로고 / 메뉴(인접) / 유틸 — justify-between 3분할 | | | 메뉴 슬롯 간 gap 0(각 px로 간격) |
| 정렬 start | [로고 +(gap64)+ 메뉴그룹(gap24)] 좌측 / 유틸 우측 | | | start는 로고·메뉴 묶어 좌측 |
| viewport | 1280/1440/1920 = 외곽 패딩 차이(1920=px240). **반응형 1개로 처리**(내부 토큰 패딩 pl24/pr20 사용, 바 full-width) | | | (b) 데모 캔버스 240은 미구현 |

## 유틸리티 아이콘 (3종)

| 역할 | Figma 노드 | 아이콘박스 | 아이콘크기 | 원본 SVG 출처 |
|------|-----------|-----------|-----------|--------------|
| 인터넷/언어(globe) | ic_인터넷 (150:5007) | md/sm 40 · xsm 32 | md/sm 32 · xsm 24 | **icons-data.js 재사용**(line, currentColor) |
| 계정/사용자 | ic_계정/사용자/ID (150:5086) | 〃 | 〃 | MCP 원본 fetch (viewBox 0 0 24 21.5816, 2 path, fill #353535→currentColor) |
| 메뉴(햄버거) | ic_메뉴 (150:5206) | 〃 | 〃 | MCP 원본 fetch (viewBox 0 0 24 16.9274, 3 bar, fill #353535→currentColor) |
| 유틸 그룹 gap | — | 8 (cluster-xxs) | — | `--spacing-cluster-xxs` |

> icons-data.js의 `ic_계정/사용자/ID`·`ic_메뉴`는 `svg:""` 비어 있음 → 구현 시 위 MCP 원본으로 채워 사용(규칙 2 충족).
> ⚠️ **글리프 크기 주의(정정 2026-06-06):** 위 "아이콘 32/24"는 아이콘 **컴포넌트 프레임** 크기다. 프레임 내부에 inset(좌우 12.5%)이 있어 **실제 보이는 글리프는 md/sm 24px · xsm 18px**(프레임×0.75). 인라인 SVG는 글리프 viewBox이므로 **24px/18px로 렌더**해야 Figma와 시각 일치(32px로 렌더하면 ~1.33배 커짐).

## 신규 토큰 후보 (Figma 확인됨 + 미정의)

| 토큰 | 값 | 근거 |
|------|----|------|
| `--color-navigation-label-default-alt` | #000000 (Light) | color/navigation/label/default-alt. 기존 navigation-label-default(gray-600)와 다름(GNB는 black) |
| (component) `--gnb-*` 7종 | 위 표 | --{component}-{...} 패턴 |

## 🚦 검문소 2 — 빈칸 없음. 단, 3단계 진입 전 결정 2건

수치 `MCP 미제공` **0건**. 색상값 두갈래 분류 대상 2건 확인 필요:

- **HD-GNB-1 (로고 색상):** Figma 로고 = base/black **#000000**. 코드 `--color-text-primary`는 **#202020**(off-black). → (a) text-primary로 연결(코드 기준) / (b) DS가 의도적 순black → 신규 alias / (c) 확인. **색상값이라 두갈래 대상.**
- **HD-GNB-2 (유틸 아이콘 색상):** Figma = color/icon/gray-dark **#353535**. 기존 `--color-icon-default`=#757575(불일치). 후보: 신규 `--color-navigation-icon`(=gray-800 #353535) 또는 `--color-form-control-icon-default`(#353535) 재사용. → 확인.

> variant 구성·아이콘 원본은 정확 대조로 이미 확정(엄격). 위 2건은 색상값(레거시 개선 여지)이라 확인받는다.
