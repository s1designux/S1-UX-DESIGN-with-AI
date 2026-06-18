# 4단계 검증 결과 — 텍스트 스타일 일괄 적용 (figma-library-build)

> 🤖 원본대조 검증 에이전트(component-verifier) — 빌더와 분리된 컨텍스트에서 Figma 직접 재읽기로 적대적 대조. 구현 금지, ❌ 목록만 반환.
> 대상: SW UX GUIDE V3.0-TEST / fileKey `cysG5U1udpQqVagYY1hWHW` / Core 페이지 `5:5706`
> 기준: `2-plan.md` + `node-map.json`. 검증일 2026-06-18 (재검증).

## 검증 방법
- `use_figma` 읽기 2회로 Core 페이지 **전수 집계**(findAllWithCriteria TEXT 3490개) + 표본 45 + 인스턴스 override 전수(1018 인스턴스).
- `get_screenshot` 3장 육안: Button 스펙시트(`173:4706`)·Table Cell 세트(`173:6900`)·StatusBar Web(`177:41`).
- 비-인스턴스 판정 = 조상 체인에 INSTANCE 없는 TEXT (직접 ancestor walk).

## 결정적 체크 (전수)

| # | 체크 | 기준 | 실측 | 판정 |
|---|------|------|------|------|
| 1 | **잔재 0** | 비-인스턴스 TEXT 중 textStyleId 빈/없음 = 0 | `missingStyle=0` (비-인스턴스 1772 전수), mixed=0 | ✅ |
| 2 | **Noto 잔재 0** | 적용 노드 family에 Noto = 0 | `notoApplied=0`, `notoAny=0` — 3490개 전부 Pretendard | ✅ |
| 3 | **매핑 정합** | 표본 45개 스타일 size/weight가 매핑표 타깃 일치, unmapped 0 | 전 표본 일치(body/14R=14·body/12M=12·body/12R=12·body/14M=14·title/16B=16…), UNKNOWN/매핑밖 0 | ✅ |
| 4 | **스냅 스팟체크** | Table Cell "1층 정문" + url "m.s1.co.kr" = body/14R(14px) | "1층 정문" 비-인스턴스 전건 body/14R·size 14; "m.s1.co.kr" body/14R | ✅ |
| 5 | **인스턴스 override 남발** | 빌더가 textStyleId override 직접 기입 안 함(상속) | 1018 인스턴스 `textStyleId` override **0건**; 인스턴스 후손 1718개는 메인컴포넌트 스타일 **상속** | ✅ |

## 빌더 주장 대조
| 주장 | 검증 | 판정 |
|------|------|------|
| 비-인스턴스 적용 1724 / 잔여 0 / 실패 0 | 비-인스턴스 **1772** 전수 styled, missing 0. 델타 +48은 스냅샷 이후 페이지가 텍스트 48개 추가 — 모두 styled(잔재 아님) | ✅ |
| 인스턴스 후손 1718 스킵(상속) | `instText=1718` 정확 일치, override 0 = 상속 확인 | ✅ |
| 매핑(R14→body/14R, M11→body/12M*, Bold12/13→title/14B* 등) | 표본·스냅 노드 전부 매핑표대로 | ✅ |
| 폰트 Pretendard 정정(Noto 포함) | Noto 0, 3490개 전부 Pretendard | ✅ |
| 구조 변경 없음(생성/삭제/combine/detach/rename 0) | textStyleId 바인딩만, 인스턴스 override 0 — 구조 무변경 정합 | ✅ |

## 렌더 육안 (오버플로/클리핑)
- **Button 스펙시트(173:4706):** PC medium/xsmall/xxsmall × 3 variant × 4 state + Mobile large 전 매트릭스 정상. "버튼" 라벨·섹션/사이즈/변형 라벨(스냅 대상) 전부 박스 내 정렬, 클리핑·오버플로 없음.
- **Table Cell 세트(173:6900):** "1층 정문" 13→14 스냅 후에도 Default/Hover/Selected/Disabled 전 셀 수직 중앙·박스 내 정상.
- **StatusBar Web(177:41):** "12:30"·"78%"·"m.s1.co.kr"(13→14 스냅) 전부 정상, url바 pill 안 중앙 정렬.
> 스냅으로 14px로 커진 텍스트가 컨테이너를 깨는 사례 **0건**.

## 두갈래 분류
- **❌(a) 빌드 실수:** 0건.
- **🟡(b) 승인된 스냅·시각동일:** R13→body/14R·M11→body/12M·Bold12/13→title/14B 크기 스냅 = 허용편차 선언서·사용자 승인분(검문소 2). title↔body 시각동일 쌍(M16/18·R12 → body 기본)도 픽셀영향 0. → 코드 유지, ❌ 아님.
- **❓(c) 애매:** 0건.
- **needs-decision:** 빌더 보고 0건, 검증에서도 추가 발견 0.

## 관찰 (실패 아님, 기록용)
- 페이지 TEXT 총수 3490(node-map 스냅샷 3442, +48)·비-인스턴스 1772(스냅샷 1724, +48)·인스턴스 후손 1718(정확 일치). 빌드 스냅샷 이후 페이지에 비-인스턴스 텍스트 48개 추가됨 — **전부 styled**(missing 0)이므로 잔재 아님.
- styleCount도 증가(body/16M 207→219, body/14M 171→207, body/14R·body/12M·title/14B 등은 일치). 동일 원인(페이지 추가분이 매핑 규칙대로 styled). 빌드 실수 아님.
- 직전 14:19 저장된 4-verification.md는 node-map 수치(3442 등)를 그대로 옮긴 판이었음 → 본 재검증은 독립 재읽기로 실수치(3490/1772)와 델타 사유를 확정.

## 판정: ✅ PASS
- ❌(a) **0건** · ❓(c) **0건** · BLOCKED 0 → **검문소 4 통과**.
- 정확 대조(매핑·Noto·잔재·override·구조무변경) 전부 ✅. 스냅은 승인된 🟡(b)로 통과.
