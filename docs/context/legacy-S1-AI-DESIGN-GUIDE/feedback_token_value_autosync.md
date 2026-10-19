---
name: feedback_token_value_autosync
description: 토큰 값 수정 시 연관 모든 표면 자동 동기화 — token-sync 에이전트 사용
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5cd8315b-3bdc-49c2-949a-638375c1a413
---

사용자가 **토큰 "값"을 바꾸면**(예: control-bg-disabled를 gray/50→gray/100) 별도 지시 없이 연관된 모든 표면에 일괄 동기화한다.

**Why:** 값이 tokens.css·vars-data.ts·install-prompt·semantic 문서·설치기 zip 등 여러 곳에 흩어져 있어 한 곳만 고치면 드리프트 발생. 사용자가 명시적으로 "연관된 모든 곳에 자동 동기화" 요구함(2026-06-11).

**How to apply:**
1. `npm run tokens:locate -- <token>` 으로 SOURCE/DOC/AUTO/REF 표면 결정론적 확인
2. SOURCE 수동 수정: `assets/css/tokens.css`(CSS var 형식, Light/Dark 블록 각각) + `plugins/figma-vars-installer/src/vars-data.ts`(Figma 경로 형식 `gray/100`)
3. DOC 수동 수정: locator가 hit한 semantic.html(resolved hex 하드코딩 주의)·semantic.md·semantic.colors.json만
4. AUTO 재생성: `npm run tokens:sync-prompt` → `npm run installer:build`(vars-data 변경 시)
5. 검증: `npm run gate:check` + locator 재실행
6. components.html/components-new.html은 tokens.css link로 자동 상속(REF) — 수정 안 함
- 전담 에이전트: `.claude/agents/token-sync.md`. Light/Dark 중 지정 안 한 쪽은 절대 임의 변경 금지. 값 전파만 — 네이밍/구조/새 토큰은 token-validator 소관.

**검증 주체 = Gate (에이전트 아님):** 값 동기화의 최종 검증은 `Gate 7`(`npm run tokens:consistency`, gate:check에 포함)이 기계로 판정한다. 에이전트가 전파를 빠뜨려도 Gate가 FAIL로 잡는다. Check A: tokens.css↔vars-data.ts 값 일치(설치기 drift, ERROR). Check B: semantic.html 하드코딩 hex↔tokens.css(문서 stale, ERROR). 단 semantic.md/component-tokens-extracted.md 텍스트 정합은 Gate 미커버 — 에이전트가 챙김. 사용자가 "검증·관리 주체가 에이전트냐 gate냐" 물었고, gate로 끌어올리는 쪽을 선택함(2026-06-11).

**전 표면 모니터 = Gate 7 Token Sync Monitor (2026-06-12):** `npm run tokens:monitor`(gate:check 포함)가 모든 표면 값을 resolved HEX로 정규화해 정본과 대조. **정본 2계층:** foundation+레거시 semantic=vars-data, 역할 semantic(--color-bg/surface/text/border)=`assets/css/site-base.css`(페이지가 style.css→@import). 모니터 표면: tokens.css·install-prompt·semantic.html·registry/semantic.colors.json·registry/foundation.colors.json(ERROR)·semantic.md(WARN). 추출 0건=⚠️"모니터 안 됨"(✅ 아님). 드리프트 해소=`npm run tokens:reconcile`(tokens:gen·sync-prompt·installer:build 재생성 후 잔여 손유지 표면 보고). 도입 시 registry icon-inverse dark drift(#FFFFFF→gray-dark-900) 실제 발견·정정. **주의: tokens.css Semantic 섹션은 GEN:SEMANTIC 마커 사이 = tokens:gen 생성물, 손편집 금지(vars-data 고치고 재생성).**

**강제 = hooks (집행자):** Gate·에이전트는 자동이 아니다(Gate=사람이 명령 쳐야, 에이전트=호출돼야 돔). 진짜 자동·강제는 hook뿐. 2026-06-11 설치: (1) PostToolUse 훅 `.claude/hooks/on-token-edit.sh` — tokens.css/vars-data.ts 편집 시 install-prompt 자동 재동기화 + Gate 7 검증, 불일치 exit 2로 모델 피드백(알림). (2) `.git/hooks/pre-commit`(정본 `scripts/hooks/pre-commit`, 재설치 `bash scripts/hooks/install-git-hooks.sh`) — 커밋 시 gate:check error면 차단(exit 1). 책임 3층: 전파=token-sync 에이전트 · 판정=Gate 7 · 강제=hooks. 과거 드리프트 방치 근본원인 = 자동 트리거 부재였음(유일 hook이 브라우저 새로고침뿐).
