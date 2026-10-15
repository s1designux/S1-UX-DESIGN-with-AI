---
name: draft-must-mirror-canon
description: 검수 시안(승격 후보 화면)은 정본과 같아야 한다 — 시안·정본이 갈리면 시안을 정본에 맞춘다 (river 2026-09-30)
metadata:
  node_type: memory
  type: feedback
  modified: 2026-09-30T03:31:24.097Z
---

검수 시안은 정본(설치기 build-components.ts)을 그대로 비춰야 한다. 시안과 정본이 다르면 시안(과 웹 배포본)을 정본에 맞춘다.

**Why:** river 2026-09-30 "시안은 정본과 같아야해". 접힘카드 화살표 색·펼친 칸 줄 구성이 시안과 정본에서 갈려 있었고, 시안이 정본을 벗어나 만든 값이었다. 정본을 바꾸는 건 river 가 명시적으로 고를 때만(예: 구분선 "정본을 네벌로 맞춘다").

**How to apply:** 시안을 새로 그리거나 고칠 때 정본에 없는 줄·색·상태를 시안에서 먼저 만들지 않는다. 차이를 발견하면 기본은 시안 → 정본, 정본을 바꾸려면 river 결정을 받는다. 관련: [[legacy-part-name-is-not-our-part]]
