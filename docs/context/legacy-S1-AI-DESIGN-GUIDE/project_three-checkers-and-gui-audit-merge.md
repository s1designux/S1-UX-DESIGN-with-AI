---
name: three-checkers-and-gui-audit-merge
description: river의 검수기 3종 지형(GUI검수/개발화면검수/Source Guard)과 GUI검수기를 설치기에 병합하는 결정
metadata: 
  node_type: memory
  type: project
  originSessionId: 9cbca429-3cef-420e-8302-0b66b777544b
---

river의 "검수기"는 성격이 다른 3종으로 갈린다(2026-07 확정):

1. **GUI 검수기 (= "레거시검수")** — 디자이너 Figma 산출물 검수: ①HEX 직접사용 ②가이드에 없는 컬러 ③레거시 컴포넌트 탐지+최신 변환 ④검수 리포트. 이미 별도 플러그인 `plugins/figma-component-audit/`(색상검수+컴포넌트교체 2모드)가 90% 구현. 설치기 안 "레거시 교체" 탭은 그 열등판(remote 인스턴스 이름유사도 스왑).
2. **개발화면검수기** — `~/dev-screen-qa` (별도 repo). 피그마 정답↔실제 개발화면을 **값**(색·크기·위치·글자)으로 대조. `plugin-value-qa/`가 현역. OCR용 네트워크 필요. → **별도 유지**.
3. **Source Guard** — `scripts/guard/` CLI. 외부 서비스 소스코드 HEX 검수. 완성됐으나 휴면(fixture만 검증). 퍼블리싱 검수 단계용. rgba R07 드리프트 1건 있음.

**패키징 결정(river):** 설치기 + GUI검수기 = **한 플러그인**(설치/검수 탭), 개발화면검수기는 별도. 근거: GUI검수기가 참조할 "가이드 기준"(토큰·컴포넌트 정본)이 설치기 안(`vars-data.ts`·`build-components.ts`)에 이미 있어 재사용 자연스러움. 개발화면검수는 대상·시점·네트워크가 완전히 달라 섞으면 해로움.

**저위험 근거:** 설치기 컬렉션 이름(`Foundation V2`/`Semantic Color V2`/`Semantic Number V2`)이 검수 엔진 상수 `V2_COLLECTION_NAMES`와 완전일치 → `loadV2Vars()` 무수정 재사용. 메시지 충돌은 `scan-result`·`error` 2개뿐 → 검수 계열에 `audit:` 접두사로 격리. 병합이 `build-components.ts`를 안 건드려 Gate 13/8/11 미발동.

**진행(2026-07-14 완료):** 병합 구현 완료 — 설치기 src에 `audit-engine.ts`(component-audit 엔진 verbatim 이식·export)·`audit-report.ts`(검수 결과서 캔버스 프레임 신규) 추가, code.ts 라우터에 `audit:` 접두사 분기(설치/검수 메시지 격리), ui.html [설치][검수] 2탭 재편(검수 안 색상검수/컴포넌트교체/가이드외/리포트, CSS `#audit-root` 스코프). 가이드외 색상 분류(`classifyOffGuide` Δ12)·리포트 4섹션 신규. 설치기 자체 레거시 스왑 폐지. tsc·esbuild·헤드리스렌더·전게이트 통과. **남은 결정(river):** ①구 `figma-component-audit` 플러그인 은퇴 여부(river가 별도 설치했을 수 있어 경로 안 끊음) ②죽은 레거시 UI 함수(startScan/renderScanResult 등) 정리 ③생성 리포트 프레임 라이브 시각 확인.

병합 계획 파일: `~/.claude/plans/ux-refactored-lampson.md`. [[components-new-replaces-components]] [[reverse_figma_v3]]
