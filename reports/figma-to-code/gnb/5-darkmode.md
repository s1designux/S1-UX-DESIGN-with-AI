# 5단계 다크모드 점검 — GNB

> figma-to-code 5단계. guide-builder(구현) + component-verifier(점검). darkModeStatus: candidate.

## 판단: 다크 = navigation 다크 토큰 상속 (Figma 라이트 전용)

- Figma `pc_gnb`(540:5942)·`slots_menu`(540:6069)는 **라이트 전용**. 다크 variant 노드 없음 → 추출할 Figma 다크 원본 없음.
- GNB는 색상을 navigation/border/action semantic으로 참조 → 전역 테마 토글 시 자동 상속.
- forced-dark 패널 없음(harness-audit RULE-2 PASS). `[data-theme="dark"]` CSS만 사용.

## 다크 resolved 값 (실측·검증)

| 역할 | 토큰 | Dark resolved |
|------|------|---------------|
| 바 배경 | --gnb-bg → navigation-bg → surface-default | #1C1D23 (gray-dark-100) ✅ 실측 rgb(28,29,35) |
| 바 하단 라인 | --gnb-border → border-subtle | #24252C (gray-dark-200) ✅ 실측 rgb(36,37,44) |
| 메뉴 라벨 default | --gnb-menu-label-default → navigation-label-default-alt | #B8BABF (gray-dark-800) — candidate |
| 메뉴 라벨 hover·selected | --gnb-menu-label-active → navigation-label-selected → action-primary | #3070D8 (blue-dark-300) |
| 메뉴 밑줄 active | --gnb-menu-underline-active → navigation-indicator-selected | #3070D8 (blue-dark-300) |
| 로고 | --gnb-logo-text → text-primary | #B8BABF (gray-dark-800) |
| 유틸 아이콘 | --gnb-icon → navigation-icon | #8A8C96 (gray-dark-700) — candidate |

## 시각 점검 (preview 다크 토글 + 스크린샷)

- 바 bg(#1C1D23) 위 기본 라벨(#B8BABF)·로고 — 대비 양호(밝은 텍스트/어두운 면).
- 유틸 아이콘 3종(globe·account·menu) 다크에서 정상 렌더(빈 박스 아님).
- active 라벨·밑줄 파란색으로 분리 인지 가능. 위계(로고 > 메뉴 > 유틸) 유지.
- 하단 border(#24252C)가 bg보다 한 단계 밝아 바 경계 인지됨.

## 🚦 검문소 5 — 개선안 먼저 (사용자 확인)

**1차안:** 상속 그대로 사용. 대비·위계 전반 양호.

**개선 제안 1건 (확정 아님):**
- **active 라벨 다크 대비** — `--color-navigation-label-selected`(active) 다크값이 `action-primary`=**blue-dark-300 #3070D8**(원래 버튼 *배경*용 값)이다. 다크 bg 위 *텍스트*로는 약간 어둡다. `text-link`=**blue-dark-400 #6FA5F8**가 텍스트 대비상 더 적합.
  - ⚠️ 단 `--color-navigation-label-selected`는 **Line Tab과 공유** semantic → 변경 시 Tab 다크에도 파급. 단독 변경 금지, **사용자 확인 필요**.
  - 선택지: (A) 현행 유지(blue-dark-300) / (B) navigation active 다크를 blue-dark-400(text-link)로 — Tab 포함 / (C) GNB 전용 active 토큰 분리.

**권장:** 1차안(상속) 유지하되, active 라벨 다크 대비는 위 (A)/(B)/(C) 중 택일 확인 후 darkModeStatus를 stable로 승격.
