---
name: new-component-needs-midway-confirm
description: "신규 컴포넌트를 만들 때는 끝까지 가지 말고 중간에 river 확인을 받고, 사이트나 설치기로 볼 수 있게 만들어 준다"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-09-08T05:40:12.780Z
---

**신규 컴포넌트를 새로 만들 때는 완성까지 혼자 가지 않는다.** 중간 단계에서 river 에게 확인을 받고,
그때 **river 가 실제로 볼 수 있는 형태**로 내놓는다 — 안내 사이트에 올리거나 설치기(zip)로 Figma 에서 테스트할 수 있게.

**Why:** river 지시 2026-09-08. 정본 보강 작업에서 신규 컴포넌트 4개(Assist Button · Text Button ·
GNB Sub Menu · GNB Sub Menu Item)를 river 에게 한 번도 안 보여주고 끝까지 만들었다. 그 직전에도
보조 버튼을 Button 의 variant 로 잘못 넣었다가("한 크기뿐인 것을 크기 축 4개짜리 세트에 넣음")
river 지적으로 별도 컴포넌트로 다시 뺐다 — **중간에 보여줬으면 그 왕복이 없었다.**
계획서 승인은 글이라 구조 오류가 안 보인다. 실물을 봐야 보인다.

**How to apply:**
- 「승인 → 시공 → 완료보고」가 아니라 **「승인 → 시공 → *보여주고 확인* → 마무리」** 로 간다.
- 보여주는 방법 두 가지 중 하나: ①안내 사이트(`pages/components.html`)에 올려 렌더 ②`npm run installer:build` 로 만든 zip 을 river 가 Figma 에 설치해 확인. river 가 "사이트로 만들거나 설치기로 테스트"라고 지정했다.
- 확인 전에는 커밋·파생 전파를 끝내지 않는다.
- 특히 **변형 축을 정할 때** 실물 확인이 중요하다 — 축의 값들이 그 대상에 실제로 존재하는지는 글로는 잘 안 드러난다. [[multi-session-shared-worktree-hazard]] 처럼 반복 사고로 굳기 전에 습관으로 만든다.
