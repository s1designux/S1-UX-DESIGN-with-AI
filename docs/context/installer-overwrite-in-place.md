---
name: installer-overwrite-in-place
description: 설치기는 새 폴더·새 파일명으로 만들지 말고 항상 쓰던 자리(저장소 dist)에 덮어쓴다
metadata:
  type: feedback
---

설치기(Figma 플러그인)를 다시 빌드할 때 **새 폴더나 새 이름으로 저장하지 않는다.** 언제나 원래 쓰던 경로를 덮어쓴다 (river 지시 2026-09-23).

river 의 Figma 에 등록된 플러그인 경로는 `S1-UX-DESIGN-with-AI/plugins/figma-vars-installer/dist/manifest.json` 이고(Figma settings.json localFileExtensions 에서 확인), `npm run installer:build` 가 바로 그 자리를 덮어쓴다. 배포 zip 도 `assets/downloads/s1-ux-design-guide-installer.zip` 고정 이름이다.

**Why:** 경로가 바뀌면 river 가 Figma 에서 플러그인을 다시 등록해야 하고, 옛 폴더가 남아 어느 것이 최신인지 헷갈린다.

**How to apply:** 빌드 산출물 경로를 바꾸는 제안을 하지 않는다. 설치기를 새로 만들었다고 말할 때도 "같은 자리에 덮어썼다"고 알린다. 새 모양이 안 보이면 경로 문제가 아니라 [[installer-reinstall-skips-existing]] 쪽을 의심한다.
