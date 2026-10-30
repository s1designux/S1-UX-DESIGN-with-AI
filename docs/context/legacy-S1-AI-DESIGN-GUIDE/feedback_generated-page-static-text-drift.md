---
name: feedback-generated-page-static-text-drift
description: 자동 생성 페이지의 GEN 마커 밖 손편집 텍스트(날짜·변경이력)는 토큰 변경 후 stale 됨 — 생성기가 자동 스탬프하게 만들 것
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7f8b8ff5-8456-47cc-b4c3-7cd86bcf1a53
---

자동 생성 페이지(semantic.html 등 page:gen 산출)는 **GEN 마커 사이 데이터 표만** 갱신된다. 마커 **바깥의 손편집 텍스트**(헤더 "최종 갱신" 날짜, "변경 이력" 섹션)는 어떤 자동화도 게이트도 안 건드려, 토큰을 바꿔도 옛날 그대로 남는다(2026-06-30 적발: 날짜 2026-04-28 멈춤, 변경이력이 폐지된 surface/bg-selected를 아직 "신규"로 설명).

**Why:** 손 관리 텍스트가 토큰 사실을 중복 기술 → registry 설명데이터 drift와 같은 부류. 게이트는 데이터 표 값만 보고(Gate 7 "집합 완전") prose/날짜는 사각지대.

**How to apply:** ①날짜는 생성기가 자동 스탬프 — `<span data-gen-date>`를 두고 page:gen이 **GEN 표가 실제 바뀔 때만** 오늘 날짜로 치환(무변경 시 유지, 헛 갱신 방지). gen-semantic-page.js에 구현(`new Date().toISOString().slice(0,10)`은 일반 node 스크립트라 OK). ②변경이력은 "날짜별 누적 기록"으로 못박아 현재 현황 재기술 금지(기존 항목 고치지 말고 날짜 항목 추가만). ③생성 페이지 전수 적용 현황: **semantic.html**(page:gen)·**foundation.html**(number:gen) = 일부구역 교체방식이라 헤더 `data-gen-date` 추가 + 블록 변경 시 자동 스탬프 적용함. **dashboard.html**(gen-dashboard)·**update-management.html**(gen-update-management) = 페이지 전체 재생성 방식이라 이미 `stamp`로 생성일 자동 박음(손댈 것 없음). **typography.css·tokens.css** = 날짜 표시 없는 CSS(해당 없음). 새 생성 페이지 만들 때 일부구역 교체방식이면 이 패턴 필수. [[feedback_token-truth-source-and-drift-gate]] [[project_semantic-page-generated]] [[project_foundation-number-page-generated]]
