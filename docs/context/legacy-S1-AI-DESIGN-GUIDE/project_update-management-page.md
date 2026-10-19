---
name: project_update-management-page
description: 업데이트 관리 페이지 — 컴포넌트/패턴 진행상태·표면별 반영일 관리 + origin 분류가 재발방지 게이트 입력
metadata: 
  node_type: memory
  type: project
  originSessionId: be28d159-34b0-4bf3-8c91-6946483cde7c
---

**업데이트 관리(Update Management)** = 컴포넌트·패턴이 어디까지 됐고 어느 표면(Figma 설치기·tokens.css·HTML)에 언제 반영됐는지 한곳에서 보는 System 메뉴 페이지.

- 정본 데이터(수동): `registry/governance/update-management.json` — sections: components[]·patterns[]. 필드: `origin`(분류)·`sourceNode`·`verify`(+verifyDate)·`dates{installer,tokens,html}`(수동 도장)·`note`.
- 자동 필드: 진행 단계(codeStatus/harnessStatus)·다크모드(darkModeStatus)는 생성기가 각 `registry/components|patterns/{id}.json`에서 읽어 합침.
- 생성기 `scripts/gen-update-management.js` (`npm run update:gen`) → `pages/update-management.html`. 손편집 금지(생성물). SITE_NAV(main.js)·site-map.json System 그룹·dashboard 옆에 등록됨.

**핵심 원리 — origin 분류가 곧 게이트 기준 (river 결정):**
- **Ⓐ 정리완료** = 이미 최신화됨, 원본 대조 불필요(건드리지 않음). 현재 9개: checkbox·radio·toggle·date-picker·chip·dropdown·input·select·textarea.
- **Ⓑ 원본틀 필요** = 원본(레거시 V2.4 등)에서 "틀"만 가져와 최신 컴포넌트로 갈이. 탭처럼 검증절차 필요. 현재: tab(완료)·nav·pagination.
- **⏳ 미정** = river 결정 대기: table·button·gnb·time-picker(컴포넌트), modal·login(패턴).
- **원본(V2.4)은 정답이 아니다** — 틀 출발점일 뿐(두 갈래 분류). 그래서 "전부 원본 대조"가 아니라 **Ⓑ만** 대조.
- **재발방지 게이트 = Gate 16 (구현됨, 2026-06-25)**: `scripts/component-origin-gate-check.js`(`npm run origin:check`, gate:check 통합·pre-commit 강제). 마비 방지 계단식 — ❌차단: Ⓑ+codeStatus=implemented/done+verify=none(완료표시인데 원본대조0=탭클래스)·미분류 escape(registry에 있는데 분류표 없음). ⚠️경고: Ⓑ+legacy·Ⓑ+harness구현+none·tbd. 미완성 Ⓑ(skeleton/not-started)는 통과. 적대적 테스트 통과. 한계: verify=new stale(빌드 재변경) 해시잠금은 후속.

**원본 대조 검증 방식:** ✅새방식=원본 재측정 cross-file 대조(탭만) / 🟡옛방식=계획·메모 대조(원본 재측정 아님, 재확인 권장) / 🔴미검증. 옛 컴포넌트 대부분 6/18(검증 절차 신설) 이전 제작이라 미검증/옛방식.

관련: [[project_reverse_figma_v3]] · [[feedback_visual_verification]]
