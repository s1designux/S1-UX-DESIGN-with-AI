---
name: reference-table-border-tokens
description: 테이블 보더 — 외곽=strong #353535(구 emphasis 통합·삭제), 헤더밑줄=셀선=default light #E9E9E9
metadata: 
  node_type: memory
  type: reference
  originSessionId: 473337a4-9af1-44dd-8539-ffcf8edb25b8
---

테이블 보더 바인딩 (2026-06-30 사용자 결정으로 정정 — 이전 "헤더밑줄=strong"은 틀렸음, 레거시 원본에 맞춤):

| 라인 | Figma Variable | 값(light/dark) | 용도 |
|------|----------------|------|------|
| **외곽 프레임선** (세트 상단 2px·하단 1px) | `color/table/border/strong` | gray/800 #353535 / gray-dark/700 | 상단 2px·마지막 데이터 행 하단 1px(페이지네이션 위) 강조선. 셀과 분리·테이블 레벨(method 2). 원본 V2.4엔 없는 개선. **2026-06-30: 구 `border/emphasis` 삭제·strong으로 일원화**(strong은 헤더밑줄 light화로 비었던 슬롯, 값을 #353535로 변경). ~~emphasis~~ 토큰 없음. |
| **헤더 언더라인 = 셀 구분선** (행 하단 1px) | `color/table/border/default` | gray/100 **#E9E9E9** / gray-dark/300 | 헤더밑줄·셀선 동일 light. 원본 V2.4(540:4822)도 헤더밑줄=light. ~~strong(#C4C4C4)~~ 아님. |

추가 값(2026-06-30): **헤더 배경** `color/table/header/bg` = {light gray/0 #FAFAFA(레거시), **dark gray-dark/200 #24252c**(에스원 GUI 레퍼런스 1459:19691 다크 일치 — gray-dark/50 아님)}. **선택 행** `color/table/cell/selected` = {light blue/50 #E2F1FF(레거시), dark blue-dark/100 #112b55}. hover는 양 표면 회색 #F5F5F5 유지(원본은 파랑이나 코드 합의).

**다크모드 전체 = 에스원 GUI(`〔따로 보관: 피그마파일-1〕` 1459:19691) 레퍼런스 일치**: cell/default=gray-dark/100(#1c1d23)·hover=gray-dark/200(#24252c)·selected=blue-dark/100(#112b55)·구분선=gray-dark/300(#2e2f38)·header bg=gray-dark/200(#24252c). 웹사이트는 일반 역할토큰→테이블 전용 토큰(`--color-table-header-bg`·`--color-table-border-default`)으로 remap해 다크 일치(component-tokens.css·components-new.html 둘 다).

- `color/table/border/strong` = 이제 **외곽선(#353535)**. 구 emphasis 토큰은 삭제됨(중복). 즉 테이블 보더는 2종: default(#E9E9E9 헤더밑줄·셀선) + strong(#353535 외곽선).
- 원본(legacy) = SW UX GUIDE V2.4 `〔따로 보관: 피그마파일-3〕` / 페이지 S1 Design Component / 노드 **540:4822 "table"**(셀 단위 컴포넌트, 조립 테이블·외곽선 없음). 코드 주석의 "169:76"은 stale(존재 안 함).
- 빌더 정본: `build-components.ts` buildTable/buildTableCell. 웹사이트는 `.s1-table-wrap` border-top 2px·bottom 1px = `--color-border-emphasis`(gray-800). 설치기↔웹사이트 동기화 확인됨(2026-06-30).
- 정본=vars-data → 값 변경 시 tokens.css·semantic.html·install-prompt·zip 전파(tokens:reconcile). [[project_reverse_figma_v3]] · [[feedback_variables_source_of_truth]].
