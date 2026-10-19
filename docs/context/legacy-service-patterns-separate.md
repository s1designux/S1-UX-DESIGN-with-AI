---
name: legacy-service-patterns-separate
description: "운영 중인 레거시 서비스(모두앱 등)의 패턴은 정본과 분리 — 병합·인용 금지 (river 2026-09-18)"
metadata:
  type: feedback
---

이미 운영 중이고 레거시 가이드라인이 적용된 서비스(모두앱 등)의 화면·패턴 정보는 **정본에 합치지 않는다.** 그 서비스에 최신 부품을 억지로 끼워 넣지 않고, 거기서 뽑은 수치를 정본 신설 근거로 인용하지도 않는다. 반대로 정본이 바뀌어도 그 서비스를 따라 고치지 않는다.

**Why:** 운영 중 서비스를 최신 가이드로 끌어당기면 실제 화면과 어긋난다. river 가 2026-09-18 에 명시적으로 막았다 — "억지로 최신 컴포넌트를 넣거나 모두앱 패턴을 최신가이드에 병합하면 절대 안된다."

**How to apply:** 서비스별 규칙·부품은 `reports/pattern-builder/legacy/<service>/`, 판독 원자료는 `reports/pattern-builder/inventory/<service>/`. registry 아래(정본 영역)에 레거시 유래 규칙을 두지 않는다. 최신 가이드용 패턴 규칙은 레거시와 무관하게 따로 세운다. 관련: [[pattern-builder-progress]]
