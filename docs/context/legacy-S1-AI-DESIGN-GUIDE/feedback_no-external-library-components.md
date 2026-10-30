---
name: feedback-no-external-library-components
description: "Figma 빌드 시 외부 라이브러리 컴포넌트 절대 금지 — 레거시 원본 인스턴스 clone 금지, 정본=로컬 remote:false"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 48a268a9-0d19-49d7-9b39-ec6bb9ebe383
---

사용자가 강하게 지적(2026-06-19, PC 로그인 패턴): Figma에 화면/패턴을 빌드할 때 **외부 라이브러리 컴포넌트를 절대 쓰지 말 것.** 정본 V3.0 컴포넌트는 **이 파일 로컬(`mainComponent.remote === false`)** 이고, 허용 외부 출처는 **V2.2 아이콘 라이브러리(key `〔따로 보관: 피그마파일-3〕`·`ic_`)뿐**. 그 외 모든 `remote === true` = 외부 라이브러리 = 금지.

**Why:** PC 로그인 패턴에서 인스턴스 19개 전부가 외부 "UI사양서/GUI_관계사용 UVIS시스템" 라이브러리(remote:true)로 새어들었다. 근본 원인 2가지 — ① screen-rebuilder가 **레거시 원본 화면의 인스턴스를 clone/재사용**(레거시 화면은 외부 라이브러리로 제작돼 있어 외부 참조가 그대로 전파됨). ② component-verifier가 **`remote:true`를 "참조된 V3.0 정본"으로 오판**해 통과시킴(이름이 `input`·`button`이라 로컬로 가정).

**🔑 핵심 교훈 (2026-06-19 2차):** **이름으로 판단하면 양방향으로 샌다.** 외부 라이브러리도 `input`·`button`·`ic_*` 같은 정본스러운 이름을 쓰고, 정작 허용된 V2.2 아이콘은 `ic_` 없이 `chevron`·`remove`·`menu` 로도 불린다(Core 페이지 아이콘이 이 경우라 1차 스캔에서 809개 정상을 위반으로 오탐할 뻔). **허용 여부는 오직 컴포넌트 `key` 를 허용목록과 대조해 결정.** 단일 출처 = `registry/figma/allowed-remote-keys.json`(9키, = build-components.ts ICON_KEYS). 키 기반 스캔 루틴 정식화 = `.claude/skills/screen-rebuild/references/provenance-scan.md`(빌드/검증 시 실제 실행, violationCount===0 강제). **범위는 시스템 전체** — 전체 점검 결과 Core는 깨끗하나 Patterns PC(로그인)·sample·Video·Patterns Mobile 일부가 아직 외부 레거시 라이브러리로 제작돼 있음(점진 이관 backlog).

**How to apply:**
- 빌드 시 인스턴스는 **로컬 정본 COMPONENT_SET(remote=false)에서만** 생성. `figma.root.findAll(n=>n.type==="COMPONENT_SET" && !n.remote)`로 먼저 찾는다. **레거시 원본 화면의 인스턴스를 clone()/mainComponent 재사용 금지** — 레거시는 스펙(텍스트·크기·상태) 읽기 전용.
- 아이콘은 V2.2(아이콘 라이브러리 파일 `〔따로 보관: 피그마파일-4〕`)에서 `importComponentByKeyAsync`. **`ic_` 이름 신뢰 금지 — key 가 allowed-remote-keys.json 에 있을 때만 허용.** 미등록 ic_ 아이콘은 (c)애매로 확인 후 정식이면 ICON_KEYS+allowlist 에 키 추가.
- 빌드 종료 전 + 검증 시 **모든 INSTANCE의 `getMainComponentAsync()`의 `remote`·`key`·`name`을 실제로 출력해 표로 대조**. 비-아이콘 remote:true 하나라도 있으면 FAIL. 이름·remote 플래그를 근거 없이 신뢰 금지.
- 로컬 정본이 없는 컴포넌트(예: base Input — build-components.ts 빌드맵엔 있으나 V3.0 파일 미설치)는 외부 것 끌어오지 말고 **needs-core-update**로 에스컬레이트(figma-library-build로 먼저 로컬 설치).
- 영구 반영처: `screen-rebuild/SKILL.md`(절대규칙 3-1·빌드 프리플라이트 자가 프로비넌스 스캔·검증 Layer1) + `component-verifier.md`(상단 HARD RULE). 관련 [[project_figma-build-constraints]] · [[feedback_variables_source_of_truth]].
