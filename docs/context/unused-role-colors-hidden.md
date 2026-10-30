---
name: unused-role-colors-hidden
description: 견본 시트 역할색 판에는 공통 29개만 싣는다 — 부품 전용 155개는 Variables 패널에만 (river 결정 2026-09-23)
metadata:
  type: project
---

설치기 토큰 견본 시트의 역할색 판에는 **공통 역할색 29개**(`color/bg · surface · text · line · icon · overlay · scroll`)만 싣는다. 나머지 부품 전용 155개는 Figma Variables 패널에만 남고 견본 화면에는 안 보인다.

**Why:** river — "시멘틱 토큰은 이렇게 줄줄이 보여주니 잘 안보이고 어차피 보게 되지도 않을거같아"(2026-09-23). 원래 계획은 부품 전용 색을 각 부품 세트 아래 「쓰는 색」 꼬리표로 옮기는 것이었는데, **그 꼬리표는 같은 날 철거됐다** — 실제 Figma 에 설치해 보니 섹션이 1552×21474 로 부풀고 부품이 밀려 "누락"처럼 보였다(river 지시 "일단 삭제").

**How to apply:** 역할색 155개가 견본에 없는 것을 버그로 보고 되돌리지 말 것. 꼬리표를 되살리려면 **먼저 섹션이 부푸는 원인**부터 잡아야 한다(자리 계산 `catY`/Y밴드 레이아웃). 관련: [[installer-overwrite-in-place]]
