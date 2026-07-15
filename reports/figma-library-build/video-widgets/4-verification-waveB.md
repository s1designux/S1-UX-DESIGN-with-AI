# 웨이브 B 빌드 검증 (figma-library-build 4단계 · component-verifier 독립 대조)

- 검증자: 🤖 component-verifier (빌더 figma-library-builder 와 분리 컨텍스트)
- 대상: fileKey `cysG5U1udpQqVagYY1hWHW` · 페이지 `16:1170` (섹션 `1131:1238` Video Parts 3 · `1135:1249` Video Widgets Wave B)
- 기준: `6-plan-waveB.md` · `5-inventory-waveB.md` · `node-map-waveB.json`
- 원본 대조 파일: `Tnihi6lixRR47N4RSAwUbF` (위젯01 `1965:14634` · 07 `1965:16852` · 08 `1965:16908` · 11 `1965:17524`)
- 방법: get_metadata(구조) + use_figma 사실추출(provenance·unbound hex·font) + get_variable_defs 모드해상 + get_screenshot 픽셀대조. 빌더 self-report 불신, 전부 실측.

---

## 대조 요약표

| 항목 | 결과 | 근거 |
|------|------|------|
| 부품 4종 = COMPONENT | ✅ | metadata: 4개 전부 `<symbol>`(COMPONENT). Alert 360×38·Memo Item 279×52·Device Tile 137.5×144·FAB 34×34 = 계획 일치 |
| 모듈 4종×2벌 조립 구성 | ✅ | Header + 계획 지정 인스턴스 전수 존재(Device Summary/Person Search/Event Tab/Memo). 다크 4 + 라이트 4 |
| 구성 패턴 3종 + 라벨 | ✅ | Filter Bar·List Filter Stack·Dashboard Grid(1×1/2×1/2×2) + 라벨 텍스트 존재 |
| 패킹 붕괴/겹침 | ✅ 없음 | 렌더 실측: 모듈·패턴·부품 정상 배치, 클리핑 없음 |
| **양모드 flip** | ✅ | 다크 explicitMode `8:2` → surface/raised=#1C1D23·text=#ECEDF0 / 라이트 `8:1` → surface=#FFFFFF·text=#202020. Variable 정상 해상 |
| **폰트 Pretendard** | ✅ | 32 TEXT 노드 전수 스캔, 비-Pretendard **0건** (데이터 스캔, 렌더 판정 아님) |
| **토큰 바인딩(부품·모듈·패턴)** | ✅ | 미바인딩 raw hex **0건** (컴포넌트·모듈·패턴·이미지 전부 Variable 바인딩). Alert red-dark 잠정도 Variable 바인딩(하드코딩 아님) |
| 순환참조 | ✅ 없음 | 부품=단일 COMPONENT, 모듈/패턴=조립 프레임. 자기포함 없음 |
| 아이콘=인스턴스(손그림 아님) | ✅ | 4 아이콘 전부 INSTANCE(importComponentByKeyAsync). 벡터 손그림 0 |
| **원본 이미지 진위(Request 2)** | ✅ **픽셀 100% 일치** | 아래 §원본 이미지 진위 |
| 인스턴스 provenance(출처) | ⚠️ | 아래 §provenance — 아이콘 4종 remote 미등록 키 |
| 섹션 래퍼 stroke | ⚠️ | 아래 ❌(a) — 섹션 2개 #000000 border |

---

## 인스턴스 provenance 스캔 (getMainComponentAsync — 키 기준)

총 95 인스턴스. 로컬 정본(remote=false) + 외부(remote=true) 분류. **키로만 판정**(이름 무시).

| class | 인스턴스 | mainComp | remote | key | count |
|-------|----------|----------|--------|-----|-------|
| LOCAL_OK | Video/Widget Header | Action=On | false | bc1b0ae6… | 12 |
| LOCAL_OK | Video/Device Tile | Video/Device Tile | false | 1a1e6907… | 12 |
| LOCAL_OK | Select Box | Size=MD… | false | d30ffb2d… | 5 |
| LOCAL_OK | Search Input | State=Default… | false | 7d3aef89… | 8 |
| LOCAL_OK | Video/List Card Row | Type=Avatar/Meta | false | 35f7ea02…/f1cca410… | 20 |
| LOCAL_OK | Line Tab Set | Size=MD | false | 59eced50… | 4 |
| LOCAL_OK | Chip | Variant=Line | false | 82229ba5… | 12 |
| LOCAL_OK | Button | Primary XXSM | false | 2475119d… | 3 |
| LOCAL_OK | Video/Memo Item | Video/Memo Item | false | ee743d5c… | 12 |
| LOCAL_OK | Video/FAB | Video/FAB | false | 7f7d8711… | 3 |
| **EXTERNAL** | ic_주의(원형) | Property 1=Line | **true** | 234ede5b… | 1 |
| **EXTERNAL** | ic_닫기 | Property 1=Line | **true** | ebbd0353… | 1 |
| **EXTERNAL** | ic_박스카메라 | Type=Line | **true** | 75a3a7e8… | 1 |
| **EXTERNAL** | ic_더하기 | Property 1=Line | **true** | f69ebcb3… | 1 |

- 로컬 정본(V3.0) 인스턴스는 전부 remote=false ✅.
- 외부 4종은 원본 영상파일(`Tnihi6…`) published 라이브러리에서 import → remote=true, **키가 `allowed-remote-keys.json`(9키 정본)에 없음**.
- 이름이 `ic_*` 이므로 HARD RULE 예외에 따라 **❌(a) 즉단 아님 → ❓(c) 사용자 확인**.
- ⚠️ **핵심:** ic_닫기 키(`ebbd0353…`)는 정본 등록된 canonical `close` 키(`2a1abbd3…`)와 **다르다**. 즉 이 4종은 canonical V2.2 아이콘 라이브러리(`YcBbW9e…`)가 아니라 원본 영상파일의 병행 아이콘 세트다.

---

## 원본 이미지 진위 (Request 2 핵심) — get_screenshot 바이트 대조

우리 대조행의 원본 이미지 rect 를 get_screenshot 하고, 원본 파일의 실제 위젯 노드 get_screenshot 과 **MD5 대조**.

| 위젯 | 우리 이미지 rect | 원본 노드 | 치수 | MD5 | 판정 |
|------|-----------------|-----------|------|-----|------|
| 01 Device Summary | 1143:1591 | 1965:14634 | 630×378 | `4901517f…` 동일 | ✅ **byte-identical** |
| 07 Person Search | 1143:1594 | 1965:16852 | 311×378 | `519bdd98…` 동일 | ✅ **byte-identical** |
| 08 Event Tab | 1143:1597 | 1965:16908 | 311×571 | `02bf4798…` 동일 | ✅ **byte-identical** |
| 11 Memo | 1143:1600 | 1965:17524 | 311×378 | `b71a9c73…` 동일 | ✅ **byte-identical** |

→ **4개 전부 원본 위젯의 실제 스크린샷과 픽셀 100% 일치(MD5 동일).** 재구성/근사 아님, 실제 캡처 확정. 치수도 원본과 동일 스케일 1:1. **원본 이미지 진위 = PASS.**

---

## 원본 구조 충실도 (두 갈래) — 렌더 대조

우리 재구성 모듈(다크)을 원본 위젯 스크린샷과 시각 대조. 모듈은 재사용 **아키타입 템플릿**이라 값/색/라벨 일반화는 허용, 구성요소 누락은 엄격.

- **Device Summary:** 원본 = 타일별 이상상태 컬럼(4열 × 상태행) + 스켈레톤 값. 우리 = 타일 4개(실값 128/24/56/312대) + **단일 이상상태 리스트 2행**(통신오류 3·펌웨어 점검 2). 이상상태 영역 자체는 존재하나 per-tile 컬럼 → 전역 리스트로 IA 축약. **계획서에 사전 등록됨**("2x2 이상상태 리스트 ... 간이 행") → 🟡(b) 일반화. (구성요소 누락 아님 — 축약)
- **Event Tab:** 원본 탭 4(전체/조치전/조치완료/개인이력)·칩 4(영상/출입/기기/기타)·검색+추가·이벤트행. 우리 = Line Tab Set + 칩 3 + 검색+추가 + Meta 행 3. 라벨 제네릭화·칩 4→3 = 🟡(b) 일반화. 구성 골격 충실.
- **Person Search / Memo:** Header + 필터/아바타행, Header + 메모항목+FAB = 원본 골격 충실 ✅.
- 값 실현(스켈레톤 → 128대 등)·아이콘 대표화는 개선/일반화. 구조 누락 없음.

---

## ❌ (a) 코드 실수 — 수정 대상

- **❌(a)-1 (섹션 래퍼 stroke, 저심각·크롬):** 섹션 `1131:1238`·`1135:1249` 둘 다 **강도 1px·SOLID·visible·#000000 border**(미바인딩). `figma-binding-lookup`: `#000000` = **EXACT `base/black`** → 결정론 판정 ❌(a). 섹션은 조직용 크롬(컴포넌트 부품 아님)이라 시각 영향 미미하나, hex 하드룰 크롬 예외는 `// figma-hex-allow:` 마커 or 바인딩을 요구하는데 **둘 다 없음**. **부품·모듈·패턴·이미지에는 미바인딩 hex 0건** — 이 지적은 섹션 2개 래퍼에 국한.
  - **수정:** 두 섹션의 stroke 제거(`strokes=[]` 또는 `strokeWeight=0`) **또는** `base/black`/line 토큰 바인딩. 1줄 수정. 후 재스캔.

---

## 🟡 (b) 의도적 일반화 (계획 사전 등록) — 유지 + 목록

- 🟡 Device Summary 이상상태 per-tile 컬럼 → 전역 2행 리스트(계획 등록, 아키타입 축약)
- 🟡 Device Tile 4타일 동일 대표 카메라 아이콘(HD-C, 원본은 4종 hidden)
- 🟡 Event Tab 칩 4→3·탭/칩/리스트 라벨 제네릭화(템플릿 일반화)
- 🟡 스켈레톤 → 실값(128/24/56/312대) 실현(개선)

---

## ❓ (c) 확인 요청 — 사용자 판단 필요

- **❓(c)-1 (아이콘 provenance):** ic_주의·ic_닫기·ic_박스카메라·ic_더하기 4종이 remote=true·**미등록 키**(원본 영상파일 라이브러리 출처). ic_닫기 키는 canonical `close`(2a1abbd3…)와 **다름**. 결정: **(A)** 정식 V2.2/DS 아이콘이면 4키를 `allowed-remote-keys.json` + `build-components.ts ICON_KEYS`에 등록(refresh 처럼) / **(B)** canonical V2.2 아이콘 라이브러리(`YcBbW9e…`) 인스턴스로 swap. 미결 시 현재대로 원본파일 아이콘 유지되나 정본 라이브러리 밖.

---

## HD (needsDecision — 이미 열림, 색방향/후속)

- **HD-A Alert 오류 색:** red-dark/500·400·200 잠정 바인딩. **바인딩은 Variable(하드코딩 아님) → 바인딩 검사 통과**, 색 방향(semantic error surface 신설 vs foundation 유지)만 HD. 렌더=연분홍 토스트(원본 1:1).
- HD-C 기기 카테고리 아이콘 4종(대표 1종만) · FAB core 원형 variant 확장 · Device Tile value title/32B 잠정.
- **KNOWN-ISSUE(빌드 결함 아님):** 다크 모듈 내 core form-control(Search Input·Chip·Line Tab·Button 라벨배경)이 라이트 외형으로 렌더 — 렌더 실측 확인. 인스턴스 자체 Variable 바인딩은 이름 기준 정상. core 컴포넌트 Dark appearance 부재/핀 문제(메모리 'Figma 다크 appearance 핀 함정'). 웨이브 A 동일 거동. **core 쪽 이슈로 분류, 웨이브 B 책임 아님.**

---

## 판정

| 결과 | 조건 | 이번 |
|------|------|------|
| ❌(a) | ≥1 → FAIL | **1건** (섹션 래퍼 stroke ×2, 크롬·1줄 수정) |
| ❓(c) | ≥1 → HOLD | **1건** (아이콘 provenance 4종) |
| BLOCKED | MCP 끊김 | 0 (전 스캔 실측 완료) |
| 원본 이미지 진위 | — | ✅ **PASS (byte-identical ×4)** |

**최종: FAIL(narrow) + HOLD.** 
- 실질 산출물(부품 4·모듈 8·패턴 3·원본이미지 4)의 **구조·바인딩·폰트·모드flip·이미지 진위는 전부 PASS.**
- 통과 차단 요소 2개: (1) ❌(a) 섹션 래퍼 #000000 stroke 2개 — 빌더가 제거/바인딩 후 재스캔. (2) ❓(c) 아이콘 4종 출처 — 사용자가 (A)키 등록 / (B)canonical swap 결정 후 반영.
- 위 2건 처리 후 재검증 시 PASS 예상(나머지 무결).
