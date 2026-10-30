---
name: github-guideline-repo-distribution
description: 디자인가이드 배포는 MD 붙여넣기 → 공개 GitHub 저장소 방식으로 전환됨. 컴포넌트 CSS는 아직 미제공(정본 대조 안 된 손관리 화면에서 긁으면 안 됨)
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-12T04:35:41.692Z
---

디자인가이드 배포 정본 경로는 **공개 저장소** `https://github.com/s1designux/S-1-UX-DESIGN-AI-GUIDELINE` 이다(매일 KST 03:15 원본에서 자동 동기화, 파일 18개). 2026-08-12 에 `pages/install-prompt.html` 의 AI프롬프트 탭·개발자 탭을 이 저장소 안내 방식으로 교체했다 — 종전의 4,000줄 MD 통짜 붙여넣기·tokens.css 단일 다운로드는 제거.

**Why:** river님 판단 — MD 를 통째로 붙여넣는 방식으로는 AI 가 디자인시스템을 온전히 구현하지 못했다. 저장소로 주면 AI 코딩 도구가 필요한 파일을 스스로 읽는다.

**개발자 탭은 「준비 중」 상태 화면이다(2026-08-12 river님 결정).** 내용을 의도적으로 비웠다 — 토큰만으로는 컴포넌트를 만들 수 없는데 설치 방법을 자세히 안내하면 개발자가 "이걸로 되겠지" 하고 시작했다가 막힌다. **미완성인 것을 완성처럼 내놓지 않는다.** 컴포넌트 CSS 배포(BACKLOG 0번)가 끝나야 연다. 현재 개발자용 배포 창구는 AI프롬프트 탭 하나뿐.

**How to apply:**
- 준비 중 화면이 아니라 실제로 열 때 기준: 저장소에서 **제품이 가져갈 CSS는 3종**: `tokens.css`(기본 변수 대부분) · `component-tokens.css`(버튼·인풋 상태별 별칭) · `typography.css`(`.typo-*` 유틸 19종). `style.css`·`site-base.css` 는 **가이드 사이트 전용이라 가져가면 안 된다**(포털 크롬이 딸려 옴).
- **컴포넌트 CSS(`.s1-btn` 등 619규칙·100KB)는 아직 배포하지 않는다.** 현재 `pages/components.html` 안 `<style>` 에만 있고, 그 화면은 **손관리**라 Gate 38 이 값 대조에서 명시적으로 제외한다 — 즉 정본과 일치하는지 아무도 검사하지 않는다. 거기서 긁어 배포하면 검증 안 된 값에 "S1 표준" 이름표를 다는 셈. river님이 이 위험을 먼저 지적했고, 그래서 오늘 범위를 "받기→설치"까지로 좁혔다.
- **올바른 근본 해결 경로**(미착수): `registry/components/component-guide-model.json`(11MB, `build-components.ts` 정본에서 자동 생성, **Gate 38 이 드리프트 차단**)에 42개 컴포넌트 전 variant 의 치수·레이아웃·패딩·간격·모서리·선굵기·색(`__tokenKey`)·자식구조가 다 있다. 여기서 `components.css` 를 생성하면 정본 파생 + 게이트 보호가 된다.
- `component-facts.json` 은 Figma 용어(`layoutMode`, `counterAxisSizingMode`, `color/bg/level-0`)로 적혀 있어 사람 개발자·퍼블리셔에겐 번역이 필요하다. 반면 `component-behavior.pc.json`(verified 17건)은 `on/guard/result` 구조라 개발자가 바로 읽는다.

[[token-absence-needs-value-tracing]] [[site-base-cleanup-verdicts]]
