---
name: feedback-installer-system-naming
description: 설치기 산출물은 s1-design-system-installer 이름으로만 — vars installer가 system installer로 통합됨
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6fe8cf3a-f1f8-4471-893a-deac2f8a24a1
---

기존 "vars installer"는 이제 **시스템 전체 설치기**로 통합됐다 — code.ts가 Foundation·Semantic·Text Styles·Component Set을 선택 설치(의존성 자동 포함). manifest 이름 "에스원 디자인시스템 설치".

**규칙: 설치기 산출물(zip·홈 import 폴더·다운로드)은 `s1-design-system-installer` 이름으로만 저장한다.** `s1-design-vars-installer` 같은 옛 "vars" 네이밍을 새로 만들지 말 것.

- zip: `assets/downloads/s1-design-system-installer.zip`
- 홈 import: `~/s1-design-system-installer/`
- zip 내부 폴더·manifest: `s1-design-system-installer`
- 빌드: `npm run installer:build` (출력 전부 system 이름)

**단, 플러그인 소스 폴더 `plugins/figma-vars-installer/` 는 그대로 유지**(내부 식별자 — 2026-06-12 사용자 "A안" 결정: 사용자 대면 이름만 통일, 폴더 경로 전면 리네임은 churn 대비 실익 적음).

**Why:** 통합 후에도 산출물 이름이 vars/system 혼재해 혼란. **How to apply:** 설치기 빌드·문서·다운로드 링크 작성 시 항상 s1-design-system-installer 사용. 정본 스펙은 [[project_reverse_figma_v3]]·build-components.ts.
