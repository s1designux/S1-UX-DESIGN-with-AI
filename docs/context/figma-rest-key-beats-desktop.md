---
name: figma-rest-key-beats-desktop
description: "Figma 판독은 파일 읽기 열쇠(.env)로 직접 내려받는다 — 데스크톱 연결은 일부만 읽혀 숫자가 틀린다"
metadata:
  type: reference
---

Figma 화면 판독은 **파일 접근 열쇠로 직접 내려받는 길**이 정답이다(`npm run pattern:fetch`). 파일을 열어둘 필요 없고, 묶음 상자(SECTION) 안까지 들어가며, 조회 한도가 없다. 열쇠는 `.env` 의 `FIGMA_TOKEN`(권한 file_content:read), 저장소에 올라가지 않는다.

**Why:** 2026-09-18 모두앱을 데스크톱 연결로 읽었을 때 547장이 나왔는데, 열쇠로 다시 읽으니 **1084장**이었다. 열어둔 페이지만, 그것도 일부만 들어온 것이다. 그 숫자로 규칙을 적고 있었다 — 판독 수단이 조용히 자료를 깎아먹는다.

**How to apply:** 새 서비스 판독은 무조건 열쇠 경로부터. 데스크톱 연결(MCP)은 "지금 고른 것 하나 보기" 용도로만. 이미 적어둔 수치가 데스크톱 판독 기반이면 다시 세어야 한다. 관련: [[figma-section-read-blindspot]] [[pattern-builder-progress]]
