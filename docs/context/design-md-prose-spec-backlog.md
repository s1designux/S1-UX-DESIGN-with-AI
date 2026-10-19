---
name: design-md-prose-spec-backlog
description: 9섹션 서술 필드에 구체 사양이 빠진 백로그 — _meta.notes 는 AI 프롬프트 미노출(구조적 빈칸)
metadata: 
  node_type: memory
  type: project
  modified: 2026-07-28T01:26:56.741Z
---

9섹션 확장(2026-07-21)의 서술 필드(`usage`/`anatomy`/`doDont`/`a11y`)는 **손으로 작성**된 것이라, 기존 `_meta.notes` 의 구체 사양이 자동으로 옮겨지지 않았다. 그리고 `scripts/gen-design-md.js` 의 컴포넌트 섹션 빌더는 `_meta` 중 **`description` 만** 렌더하고 **`notes` 는 렌더 대상이 아니다** → notes 에만 있는 사양은 AI 에이전트가 볼 수 없다. (2026-07-28 확인. 이번 확장으로 새로 잘린 게 아니라 **원래부터 있던 구조적 빈칸**.)

**우선순위 높음**
- `table`: 정렬 아이콘 `combobox_arrow SVG 18×18px` → `anatomy` 로 승격
- `textarea`: Figma 빌더에 helper(안내) 요소가 없음 — needs-core-update 미해결 건이 notes 에만 있음

**검토 대상** — `time-picker`(가장 많음: 노드명·사이즈별 폰트·border-disabled 변경 결정 등) · `pagination` · `select` · `dropdown`

**제외** — `toggle` 의 `--toggle-off-bg` 는 정본 tokens.css 에 없는 **죽은 별칭**(실제 웹 CSS·설치기 build-components 둘 다 `--color-control-indicator-unselected` 사용). 서술에서 빠진 게 정상.

**별도 판단 필요(미결)** — `_meta.notes` 자체를 렌더 대상에 포함할지. 포함하면 의사결정 이력(D001/HD-* 등)까지 AI 에 전달되고, 안 하면 지금처럼 사양을 서술 필드로 손수 승격해야 한다.

**Why:** AI 소비용 프롬프트가 정본의 일부만 담고 있으면, 에이전트가 사양을 모른 채 임의 구현할 위험이 있다.
**How to apply:** 승격 작업 시 값(HEX·px)은 서술이 아닌 정본 원칙을 지키되, 아이콘 원본명·요소 존재 여부 같은 **"원본을 베껴야 하는 것"** 은 서술에 명시한다. 편집 후 `npm run design:md:write` → `npm run tokens:sync-prompt`. [[design-md-9section]]
