# 4단계 검증 결과 — 텍스트 스타일 일괄 적용 (figma-library-build)

**검증자:** 🤖 원본대조 검증 에이전트(component-verifier) — 빌더와 분리 컨텍스트, Figma 직접 재읽기
**대상:** SW UX GUIDE V3.0-TEST / fileKey `cysG5U1udpQqVagYY1hWHW` / Core 페이지 `5:5706`
**기준:** `2-plan.md` + `node-map.json`
**방법:** `use_figma` 전수 스캔(표본 아님) + `get_screenshot` 렌더 대조

---

## 대조 요약 (전수 카운트)

| 항목 | 빌더 주장 | 검증 실측 | 일치 |
|------|----------|----------|------|
| 페이지 전체 TEXT | 3442 | 3442 | ✅ |
| 인스턴스 후손 (스킵) | 1718 | 1718 | ✅ |
| 비-인스턴스 mappable | 1724 | 1724 | ✅ |
| **비-인스턴스 textStyleId 미적용 잔여** | **0** | **0 (전수)** | ✅ |
| 비-인스턴스 폰트 Pretendard | 1718+정정6 | **1724 전부 Pretendard, Noto 0** | ✅ |
| 적용 실패 | 0 | (잔여 0으로 간접 확인) | ✅ |
| needs-decision | 0 | 0 | ✅ |

비-인스턴스 스타일 분포(검증 실측) = node-map `appliedByStyle_final`과 정확히 일치:
body/12M 809 · title/14B 208 · body/16M 207 · body/14R 194 · body/14M 171 · body/12R 102 · body/18M 18 · title/20B 6 · title/16B 5 · title/24B 4.

---

## 기계(결정론) 검증

### 1. 매핑 정합성 — ✅ PASS
- 비-인스턴스 1724개 전수 스캔: textStyleId 미적용 노드 **0건**(빌더 잔여 0 주장 확인).
- 적용된 10개 스타일 정의를 `getLocalTextStylesAsync()`로 읽어 size/weight 대조:
  body/14R=14/Regular · body/12M=12/Medium · body/12R=12/Regular · body/14M=14/Medium · body/16M=16/Medium · body/18M=18/Medium · title/14B=14/Bold · title/16B=16/Bold · title/20B=20/Bold · title/24B=24/Bold — **전부 매핑표 타깃과 일치**. 모두 Pretendard.

### 2. 폰트 정정 (Noto→Pretendard) — ✅ PASS
- 비-인스턴스 fontFamily 집계: **Pretendard 1724 / Noto 0 / mixed 0**.
- 이전 Noto 6개 추적: `12:30`(144:2130·177:25)·`78%`(144:2426·177:40) = body/12M·Pretendard. `Mobile Shell — 공유 크롬 컴포넌트`(144:2440) = title/16B·Pretendard. `m.s1.co.kr`(155:11563) = body/14R·Pretendard. **Noto 잔재 0 확인.**

### 3. 인스턴스 스킵 정합 — ✅ PASS
- 인스턴스 후손 1718개 전수 `overriddenFields` 검사: **textStyle override = 0건**(overrideFieldFreq 전부 빈 배열).
- 1718개 모두 textStyleId를 가지나, 이는 **메인 컴포넌트 정의가 스타일링돼 인스턴스가 상속**한 결과(예: 메인 `173:6877` styled → 인스턴스 `I173:6915;173:6877` 동일 상속). 직접 override 남발 아님 — 빌더 "인스턴스 스킵, 상속" 주장 확인.

### 4. 스냅 정합 — ✅ PASS
- Table Cell SMALL **"1층 정문"** = body/14R (14px). 메인·인스턴스 카피 다수 모두 14px body/14R.
- url바 **"m.s1.co.kr"** = body/14R (14px).
- Medium11→body/12M, Bold12/13→title/14B 타깃 모두 정의상 일치. 스냅 대상이 엉뚱한 스타일로 가지 않음.

### 5. unmapped 잔재 — ✅ PASS
- 비-인스턴스 적용 스타일이 전부 매핑표 타깃(10종) 안에만 분포. 매핑표 밖 임의 스타일 0건. 미적용 잔여 0건.

---

## 렌더 검증 (get_screenshot 육안)

| 대상 | nodeId | 결과 |
|------|--------|------|
| Table Cell 세트(13→14 스냅) | 173:6900 | ✅ "1층 정문" 모든 셀 상태(기본·연파랑·파랑·회색, 2행) 클리핑/오버플로 없음 |
| StatusBar Platform=Web (url바) | 177:41 | ✅ "m.s1.co.kr" 주소 pill 중앙 정렬·미잘림, 12:30/78% 정상 |
| Button 스펙시트 | 173:4706 | ✅ 제목·PC/Mobile 헤더·열/행 라벨·variant 라벨·"버튼" 전 셀 정상, 깨짐 없음 |

스냅으로 14px로 커진 셀/주소바 텍스트가 박스를 깨뜨리지 않음 확인.

---

## ❌(a) 빌드 실수
- 없음 (0건)

## 🟡(b) 허용편차 (사전 승인)
- 🟡 Regular13→body/14R, Medium11→body/12M, Bold12/13→title/14B 크기 스냅 — `2-plan.md` 허용편차 선언 + 사용자 결정(검문소 2) 항목. 코드 유지.
- 🟡 title↔body 시각동일 쌍(Medium16/18·Regular12)을 body 기본으로 적용 — 픽셀 영향 0, 계획서 명시. 추후 재태깅 여지.

## ❓(c) 확인 요청
- 없음 (0건)

---

## 판정: ✅ PASS

- ❌(a) 0건 · ❓(c) 0건 → 통과.
- 비-인스턴스 1724 전수: textStyleId 미적용 0 · Noto 0 · 매핑표 100% 일치 · 인스턴스 override 0 · 스냅 타깃 정확 · 렌더 무결.
- 🟡(b) 허용편차 2건은 승인 항목으로 통과에 영향 없음.
