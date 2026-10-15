---
name: installer-reinstall-skips-existing
description: Figma 설치기 재설치는 이미 있는 컴포넌트를 건너뛴다 — 정본을 고쳐도 화면엔 옛것이 남는다
metadata:
  type: project
---

`buildAllComponents` 는 캔버스에 같은 이름 세트가 있으면 그 부품을 통째로 건너뛴다(`existing.has(name)` → skipped). 그래서 정본을 고치고 설치기를 다시 빌드해도, **이미 설치된 파일에서는 옛 산출물(세트 + 그 부품의 Spec Dark 프레임)이 그대로 남는다.**

**Why:** 배치해 둔 인스턴스가 detach 되는 것을 막으려는 의도적 보존 장치다. 예외는 Calendar Cell·Calendar Tile 뿐(isDepSet).

**How to apply:** river 에게 "고쳤으니 재설치해서 봐 달라"고만 하면 **옛 화면을 보고 아직 안 고쳐졌다고 답한다**(2026-09-09 바텀시트 다크 스펙에서 실제 발생). 반드시 함께 안내한다 — ①해당 세트와 `<이름> — Spec Dark` 프레임을 지우고 [설치], 또는 ②플러그인 [재설치](전량 삭제 후 설치, 배치된 인스턴스 detach 위험). 제보 스크린샷을 받으면 **먼저 "그게 새 산출물이 맞는지"부터 확인**한다.

[[date-picker-approved]] 도 같은 함정의 사례다.
