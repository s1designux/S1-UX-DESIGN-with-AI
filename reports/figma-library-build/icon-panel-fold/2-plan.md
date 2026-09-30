# 2 · 빌드 계획 — ic_패널접기 (판 접기 아이콘)

- 승인: river 2026-09-30 "응 진행해줘" (계획 1회 확인 완료)
- 대상 파일: **YcBbW9e0MTR9T3W5Sz0Ukx** (아이콘 라이브러리 V2.2) — V2.4(yE5UC…)가 아님(1-inventory 정정)
- 위치: 섹션 `14.UI` (97:377), 섹션 기준 좌표 **(1468, 100)** — 빈 자리, 섹션 폭 안

## 구조 (기존 아이콘과 동일 규칙)
| 항목 | 값 |
|---|---|
| 노드 | COMPONENT_SET `ic_패널접기` 64×160, constraints MIN/MIN, clip, 세트 테두리는 이웃 세트(ic_메뉴 97:227)와 같은 스타일 |
| variant 축 | `Property 1` = Solid(기본, 20,20) · Line(20,68) · Color(20,116) |
| variant | COMPONENT 24×24, MIN/MIN, clip |
| 내부 | `원본` GROUP > `Vector`(들) · 벡터 constraints SCALE/SCALE · **fill 외곽선 도형만(stroke 금지)** |
| description | `패널접기, 판 접기, 메뉴 접기, 사이드바 접기, panel collapse, sidebar collapse, fold panel` |

## 형태 원본 (웹 아이콘 가이드 등록본 · 24 viewBox)
- Line: `assets/img/candidate-icons/ic_패널접기_line.svg` — 외곽 rect(3.54,3.54,16.92²)·세로선 x=9·쉐브론 M15.8 10.3L14.05 12L15.8 13.7, stroke 1.08 square → **stroke 를 외곽선(outline)으로 변환 후 fill**
- Solid: `..._solid.svg` — 왼쪽 판 M3 3H9V21H3V3Z fill + 외곽 rect·쉐브론 stroke → 외곽선 변환
- Color: `..._color.svg` — 몸통 rect 3,3,18² · 왼쪽 판 rect 3,3,6×18 · 쉐브론 stroke → 외곽선 변환
- 좌표는 SVG 그대로(반올림·보정 금지). 방법: `figma.createNodeFromSvg(svg)` → 각 stroke 레이어 `outlineStroke()` → 원래 stroke 레이어 제거 → `원본` 그룹으로 묶어 variant 에 (0,0) 정렬.

## 색 바인딩 사전 조회표 (전부 등가물 있음 → HD 없음)
| hex | 자리 | 라이브러리 Variable | 지시 |
|---|---|---|---|
| (line 전체) | Line 벡터 fill | color/icon/gray-dark · VariableID:1402:416 | 바인딩 필수 |
| (solid 전체) | Solid 벡터 fill | color/icon/gray · VariableID:1402:415 | 바인딩 필수 |
| #CDD2DE | Color 몸통 | visual-gray/200 · VariableID:1402:212 | 바인딩 필수 |
| #1D6CEB | Color 왼쪽 판 | blue/400 · VariableID:1402:56 | 바인딩 필수 |
| #808796 | Color 쉐브론 | visual-gray/300 · VariableID:1402:214 | 바인딩 필수 |

## 허용편차
- 허용편차 #1: `ic_패널접기` 세트(1767:44)의 **테두리 stroke 색(보라 점선)** — Figma 변형세트 표식(순수 장식 크롬). 이웃 세트 78개가 같은 raw 값을 쓰고 부품 모양·쓰임과 무관하다(하드룰 H2 예외 "순수 장식 크롬"). (빌더에게: 이웃 세트 스타일 그대로 복사 · 토큰 바인딩 대상 아님) — ⭐ 검증 후 추가 2026-09-30

## HD
- 없음. (라이브러리 게시 Publish 는 river 가 직접)
