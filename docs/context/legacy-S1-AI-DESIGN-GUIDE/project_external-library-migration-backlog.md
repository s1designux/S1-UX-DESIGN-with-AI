---
name: project-external-library-migration-backlog
description: V3.0 Figma 외부 라이브러리→로컬 이관 현황 + provenance 예방 시스템 위치 + 남은 backlog
metadata: 
  node_type: memory
  type: project
  originSessionId: fd44bfbb-2b02-4bcf-b9d9-d9afc5060851
---

2026-06-19: V3.0 TEST 파일(`〔따로 보관: 피그마파일-2〕`) 전체 provenance 일괄 점검 결과 — **외부 레거시 라이브러리로 만든 화면이 시스템 전반에 잔존.** 키 기반(이름 아님) 스캔으로 재발 방지 시스템을 구축하고, PC 로그인 화면을 첫 이관 사례로 완료.

**예방 시스템(정본):**
- 허용 remote 키 단일출처 = `registry/figma/allowed-remote-keys.json` (V2.2 아이콘 9 + password eye 2 = 11키). **이름 신뢰 금지, key로만 판단.**
- 재사용 스캔·교체 루틴 = `.claude/skills/screen-rebuild/references/provenance-scan.md` (빌드/검증 시 실제 실행, violationCount===0 강제). screen-rebuild 3-1 + component-verifier가 키 기반으로 교정됨. 자세한 교훈은 [[feedback_no-external-library-components]].

**완료(이관됨):** PC 로그인 화면 268:368(Patterns PC) — 인스턴스 10개 전부 로컬/허용아이콘(violation 0). 신규 로컬 컴포넌트 4종 = Shell/LoginGNB(334:1326)·Shell/WebTabBar(335:3099)·C/IMG/Logo/Samsung_30(333:165)·Login Input 세트(339:6072, 12 variant). 빌드=figma-library-builder, 검증=component-verifier 분리(HARD RULE 준수). node-map: `reports/figma-library-build/login-components/`.

**남은 backlog(미이관, 우선순위순):**
- 로그인 화면 **복제본 281:5482**(Patterns PC) — 268:368과 동일 구조, 같은 신규 로컬 4종으로 교체하면 됨.
- **sample 페이지**(~26종 외부) — 로그인/폼 샘플 화면들.
- **Video 페이지**(~18종) — Login input·pc_button·mobile_button·footer·phone_navi 등 레거시.
- **Patterns Mobile**(~17종) — 코어는 로컬 이관됐고 모바일 전용 레거시(m_Input box·m_button·appbar_sub·keyboard 등)만 잔존.
- Core·test = 깨끗(이관 불필요).

**Login Input 범위 한계:** 로그인 필요 상태만(Id + Password×Hide/Show, State Default/Editing/Filled/Error). 다른 화면 이관 시 부족하면 확장 필요. 폰트는 MCP에 Pretendard 미존재 → Noto Sans KR 오버레이([[project_figma-build-constraints]]).
