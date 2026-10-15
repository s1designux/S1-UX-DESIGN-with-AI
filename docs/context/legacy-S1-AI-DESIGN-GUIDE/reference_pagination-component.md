---
name: reference-pagination-component
description: "Pagination 컴포넌트 구성(Arrow/Number/Edge) + 테이블 footer는 이 인스턴스로 조립, next/last는 180° 회전"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 473337a4-9af1-44dd-8539-ffcf8edb25b8
---

**2026-06-25 구조 분리:** 하위 요소 셀 = **"Pagination Cell"**(set 이름 변경), 완성 바 = **"Pagination"**(신규 세트, single-variant). buildPaginationCell(셀) + buildPaginationBar(조립). 표시순서 members=[Pagination, Pagination Cell](메인→요소), BUILD_DEPENDENCIES["Pagination"]=["Pagination Cell"]. BUILT_COMPS 키는 `Pagination:Arrow/Default` 등 **그대로 유지**(Table 푸터·바 공용). Number 셀 오토레이아웃 center화(바에서 인스턴스 텍스트 1~6 override). 바 구성=홈페이지 ACTION: `[|< <](Disabled·gap4)·[1~6](gap0·1=Selected)·[> >|](gap4)`, 그룹 gap8, 폭 304. **재설치 주의:** "Pagination" 이름 재사용(옛=셀→새=바)이라 기존 캔버스에 옛 "Pagination"(셀)이 있으면 skip-if-exists 가 새 바를 건너뜀 → 옛 컴포넌트 삭제 후 재설치 또는 프레시 설치 필요.

아래는 셀(구 "Pagination", 현 "Pagination Cell") 구성 — `Element` × `State` 2축:
- `Element=Arrow` (좌향 ‹) · State=Default/Hover/Disabled — prev 는 그대로, **next 는 인스턴스 180° 회전(›)**
- `Element=Edge` (좌향+세로바 |<) · State=Default/Hover/Disabled — first 는 그대로, **last 는 180° 회전(>|)**. (2026-06-18 신설)
- `Element=Number` (28×28 숫자) · State=Default/Hover/Selected — Default text=`color/text/state/helper`, Selected=`color/text/body/secondary`
- Arrow/Edge: bg/border=`color/pagination/control/*`, icon=`color/icon/gray-dark`(Default·Hover)/`gray-light`(Disabled), 28×28·radius2·stroke1.
- 정본: `build-components.ts` `buildPagination` (Edge 도 인코딩됨 — Gate 8 통과). Figma set 노드 `173:8330`.

**Select Box**에 `Size=XXSM`(h28·font12) 사이즈 있음 — 테이블 "n개씩 보기" 셀렉트용.

**데이터 테이블 패턴 footer**(Patterns `169:76`)는 위 Pagination 인스턴스(처음=Edge Disabled·이전=Arrow Disabled·1=Number Selected·2~5=Number Default·다음=Arrow Default rot180·마지막=Edge Default rot180) + Select Box XXSM 인스턴스로 조립됨. 숫자/셀렉트 한글텍스트는 Noto 오버레이(내부 Pretendard 숨김 — [[project_figma-build-constraints]]).

**워크플로우 데모:** ①Figma 페이지에 직접 그려 시각확인(library-builder) → ②`build-components.ts` 인코딩(정식화). 단 installer 재실행은 전 컴포넌트 세트 재생성(노드ID 변경→기존 인스턴스 고아화)이므로 즉시 돌리지 않고 다음 정식 install 때 반영. 만들기=🏗️/🪞, 검증=🤖 분리.
