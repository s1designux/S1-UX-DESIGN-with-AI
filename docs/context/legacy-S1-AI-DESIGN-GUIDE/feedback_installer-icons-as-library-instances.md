---
name: feedback_installer-icons-as-library-instances
description: 설치기 아이콘은 벡터 직삽입이 아니라 V2.2 라이브러리 컴포넌트 인스턴스로 넣어야 함
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 090e0edf-9177-4d2b-9db0-b1ccbc6d31a9
---

설치기(build-components.ts)가 컴포넌트에 아이콘을 넣을 때, `createNodeFromSvg`로 **raw 벡터를 직삽입하면 안 되고** V2.2 아이콘 라이브러리(`〔따로 보관: 피그마파일-4〕`)의 **컴포넌트 인스턴스**로 넣어야 한다. `figma.importComponentByKeyAsync(KEY)` → `createInstance()` → 색은 form-control 등 해당 슬롯 변수로 재바인딩(다크모드 동기화).

**Why:** 사용자가 설치 결과에서 "아이콘 컴포넌트가 아니라 벡터가 들어가 있다"고 지적 — 라이브러리와 링크돼 원본 수정 시 자동 반영되는 인스턴스를 원함.

**How to apply:** UI 아이콘은 **14.UI 섹션**(파일 YcBbW9e0…, 각 ic_ 세트의 "Property 1=Line" 변형)에 있다. 공용 `makeIconInstance(role, colorVar, size, fallbackSvg, rotation)` + `ICON_KEYS` 레지스트리(build-components.ts). 전환 완료(전 아이콘 렌더 검증): remove·search·clock·calendar·menu·account·**check(=ic_확인 97:167 ✓, ic_체크는 박스형이라 부적합)·chevron(=ic_화살표더보기 419:69, 우향 기준 1개를 회전으로 4방향)·globe(GNB 언어=ic_인터넷 35:3317)**. **Gate 12(icon-instance-policy-check)** 가 벡터 직삽입 차단 — 예외는 `// icon-vector-allow: 사유` 마커 필수.

**핵심 노하우:** ① `rebindIconColor`는 **보이는(visible) 채움/선만** 교체 — 숨김 채움(hit-area 배경)을 건드리면 아이콘이 사각형으로 깨짐. ② Figma 회전은 **반시계**(우0·상90·좌180·하270). 회전 노드는 x/y 중앙정렬이 안 되므로 **center 오토레이아웃 프레임으로 래핑**해서 반환. ③ 24px 네이티브→size 리사이즈(스케일 정상). 키는 figma-use 로 `node.key` 읽어 확보.

**벡터 유지(라이브러리 미존재/범위외, 마커 처리):** 페이지네이션 Edge(처음/마지막=쉐브론+바)=V2.2에 없음 · 휴대폰 셸 크롬(wifi/lock/refresh)=DS UI 아이콘 아님. [[project_component-leaf-key-validation]]·[[feedback_visual_verification]] 참고.
