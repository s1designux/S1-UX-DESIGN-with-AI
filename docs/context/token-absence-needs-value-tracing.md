---
name: token-absence-needs-value-tracing
description: "토큰이 \"정본에 없다\"는 판정은 이름 대조만으로 내리면 안 되고 값 배선까지 따라가야 한다"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-08-12T04:16:41.929Z
---

"정본에 이 토큰이 없다"고 판정할 때 **이름 문자열 대조만으로 결론 내리지 않는다.** 그 이름의 `value`가 무엇을 가리키는지, 그리고 **설치기(`build-components.ts`)가 그 부품을 실제로 어떤 토큰으로 바인딩하는지**까지 확인한 뒤 판정한다.

**Why:** 2026-07-31, registry 별칭 이름을 `tokens.css`와 이름 대조만 해서 "정본 신설 후보 29건(개념 부재)"이라고 보고했다. river님이 "설치기에는 값이 다 있는데 왜 없다고 하냐"고 되물어 재확인한 결과 **신설 필요 0건**이었다. 설치기는 부품 전용 토큰을 만들지 않고 기존 토큰을 재사용한다 — dropdown 트리거는 `color/form-control/*`, toggle knob은 `color/control/indicator/selected`, chip 아이콘은 registry가 이미 `color/chip/{v}/label/{state}`를 가리킨다. `vars-data.ts` SEMANTIC_COLOR와 `tokens.css` Semantic은 171:171로 완전히 같다. 잘못된 수치가 BACKLOG에 커밋됐고([[multi-session-shared-worktree-hazard]] 상황에서 다른 세션이 먼저 커밋), 정정 커밋을 따로 올려야 했다. 그대로 뒀으면 나중에 "토큰 29개 설계"라는 존재하지 않는 큰 작업을 계획했을 것이다.

**두 번째 발생 (2026-08-12) — 반대 방향의 같은 실수.** Design Guide Download 개발자 탭을 검토하며 `component-tokens.css`에 변수가 155개 "정의돼 있다"는 것만 세고 **"이 파일이 빠지면 컴포넌트가 깨진다"고 필수 판정**해, 화면에 경고 문구까지 넣었다. river님이 "이 내용만으로 충분한지 검토해줘"라고 되물어 실제 `var()` 사용을 추적하니 — `components.html` 컴포넌트 CSS가 쓰는 변수 190개 중 이 파일에**만** 있는 건 **2개**, `typography.css`에만 있는 건 **0개**였고, 정작 안내에서 빠뜨린 `site-base.css`가 **11개**를 단독 공급하고 있었다. 즉 **정의 개수 ≠ 실사용**이다. 판정 방향이 "없다"든 "필수다"든, 근거가 이름/개수 세기면 똑같이 틀린다.

**How to apply:** 이름이 정본에 없으면 그건 "값이 없다"가 아니라 대개 **"이름 배선이 다르다"**다. 판정 전 최소 2단계를 확인한다 — ① registry `value`의 `var()` 대상이 정본에 있는가 ② 설치기가 그 부품을 그릴 때 어떤 키를 `scv()`에 넘기는가(동적 조합 `` `color/x/${k}` `` 이면 전개해서 확인). 이름 대조만 한 결과를 보고할 때는 **"이름 기준 판정이며 값 배선 미확인"이라고 명시**한다.

CSS 파일이 "필수인가"를 판정할 때도 같다 — 정의 개수를 세지 말고, **소비하는 쪽이 실제로 `var()`로 쓰는 변수 집합**을 뽑아 파일별로 누가 단독 공급하는지 교차 대조한다(스크립트 10줄이면 된다). [[claudemd-token-efficiency]] [[github-guideline-repo-distribution]]
