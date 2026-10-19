---
name: project_foundation-number-page-generated
description: "foundation.html의 number 섹션(sizing·font-size·line-height·opacity·breakpoint)은 자동 생성, Gate 9가 전 number 토큰 페이지 노출 강제"
metadata: 
  node_type: memory
  type: project
  originSessionId: b9db804e-8ad5-4ded-b817-699af3ab2877
---

foundation.html의 number 차원 데이터 배열 `SIZING`·`FONT_SIZES`·`LINE_HEIGHTS`·`OPACITIES`·`BREAKPOINTS`는 `GEN:FOUNDATION-*` 마커 안에서 **`npm run number:gen`(scripts/gen-foundation-number.js)으로 vars-data FOUNDATION_NUMBER에서 자동 생성**된다. 손편집 금지(usage 문구만 보존됨). reconcile 3단계에 편입.

**Gate 9 (scripts/number-page-check.js)** 가 강제: (A) 위 5종 블록 = 정본 일치, (B) vars-data의 **모든** Foundation/Semantic number 토큰이 foundation.html/semantic.html에 노출(신규 토큰 추가 시 페이지 미반영을 탐지 — font-weight만 Typography 표가 담당해 제외), (C) 폐지된 컴포넌트 사이징 토큰 재유입 0건.

**배경(2026-06-12):** "색상만 자동 동기화되고 sizing·spacing 등 number는 페이지 미반영" 지적. 데이터 파이프라인(tokens.css·install-prompt·설치기 zip)은 Gate 6+3로 이미 완전했고, 사각지대는 **페이지 표시 + number 값-게이트 부재**였음. 컴포넌트별 사이징 Semantic은 전면 폐지→Foundation `--sizing-N` 직접 참조로 전환됨. [[project_semantic-page-generated]]와 같은 "정본→페이지 생성기+완전성 게이트" 패턴.
