---
name: project-components-new-replaces-components
description: components-new.html이 components.html을 대체하는 Variables 정본 페이지 — 구 페이지는 폐기 예정
metadata: 
  node_type: memory
  type: project
  originSessionId: 6fe8cf3a-f1f8-4471-893a-deac2f8a24a1
---

`pages/components-new.html`이 `pages/components.html`을 대체하는 **신규 정본 컴포넌트 가이드**다. (사이드바 메뉴 "🧪 Components New")

- components-new는 컴포넌트 토큰을 **신규 Variables 정본**(`--color-control-*`, `--color-form-control-*`, `--color-chip-line/solid-*` 등)으로 직접 참조하도록 재구성한 페이지. 레이아웃 구조는 components.html과 동일하게 유지하되 토큰 연결부만 신규 Variables 적용.
- 정본 스펙 출처: `plugins/figma-vars-installer/src/build-components.ts`의 build{Checkbox,Radio,Toggle,Chip,Input} 함수 (설치기가 Figma Variables로 만드는 컴포넌트 세트 정의 = 신규 Variables 정본). legacy Figma 노드 대신 이걸 기준으로 옮긴다.
- 2026-06-11 기준 마이그레이션 완료: checkbox·radio·toggle·input·chip 5종. 남은 것: select·textarea·table·pagination·tab·gnb·button.
- **components.html은 앞으로 쓰지 않음(폐기 예정).** 사용자 확정(2026-06-11): "거기는 앞으로 안 쓸거라 안 고쳐도 돼". → components.html은 유지보수/수정하지 말 것. 모든 신규 작업은 components-new에서.

**Why:** 기존 페이지를 레트로핏하기보다 깨끗한 새 페이지에서 컴포넌트별로 Variables 정본을 적용하는 게 낫다는 판단. **How to apply:** 컴포넌트 추가/수정 요청 시 components-new.html을 대상으로 작업하고, build-components.ts를 토큰 정본으로 참조한다. components-new는 GitHub Pages(main push)로 자동 배포된다.
