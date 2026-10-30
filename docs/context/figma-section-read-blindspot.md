---
name: figma-section-read-blindspot
description: "Figma 를 바깥에서 노드 id 로 읽으면 안 연 페이지·SECTION 내부가 빈 채로 온다 — 플러그인으로 파일 안에서 훑어야 전부 읽힌다"
metadata:
  type: reference
---

Figma 파일을 밖에서 노드 id 로 요청하면 **한 번도 열지 않은 페이지**와 **SECTION(묶음 상자, 예: 「백업」) 내부**가 빈 canvas 로 온다. 화면이 실제로 없는 것과 구분되지 않아 "이 페이지는 비었다"고 오판하기 쉽다. 페이지를 열어둬도 달라지지 않는다.

**Why:** 2026-09-18 MoDU APP 판독에서 10장 중 5장을 "비었다"로 잘못 보고했다. 사람 손으로 SECTION 을 선택하게 하면 읽히지만, 페이지마다 반복해야 해서 river 가 감당 못 한다.

**How to apply:** 플러그인 실행(use_figma)으로 `setCurrentPageAsync` 후 children 을 훑으면 SECTION 안까지 전부 읽힌다. 페이지당 호출 1번, 여러 페이지는 한 메시지에서 병렬로. 공식 Figma MCP 의 get_metadata 도 안 연 페이지를 읽지만 seat 등급별 호출 한도가 있어 금방 막힌다. 관련: [[pattern-builder-progress]]
