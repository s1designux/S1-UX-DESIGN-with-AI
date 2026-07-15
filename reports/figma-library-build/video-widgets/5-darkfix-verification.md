# 5단계 다크모드 핀 수정 검증 — 영상 위젯 웨이브 B (darkModePinFix)

> 🤖 원본대조 검증 에이전트(component-verifier) — 빌더(figma-library-builder)와 분리된 컨텍스트에서 수행. self-report 불신, Figma 노드 실측(get_screenshot 렌더 + use_figma 사실추출)으로 판정.
> 검증일 2026-07-13 · fileKey `cysG5U1udpQqVagYY1hWHW` · 페이지 `16:1170` (Video 준비중) · 인증계정 s1designux@gmail.com

## 대조 요약

| # | 검증 항목 | 방법 | 결과 |
|---|-----------|------|------|
| 1 | 다크 잔존 라이트 0 | get_screenshot 8개(모듈4+패턴2+대조클론2) 육안 + use_figma 스트레이 라이트핀 스캔 | ✅ PASS |
| 2 | 라이트 스펙 줄 불변 (1139:*) | get_screenshot 4개 + explicitVariableModes 실측 | ✅ PASS |
| 3 | 원본 이미지 불변 | use_figma fill/imageHash 실측 10노드 | ✅ PASS |
| 4 | 색 하드코딩 안 함 (미바인딩 hex 0) | use_figma SOLID paint 스캔 236개 | ✅ PASS |
| 5 | 웨이브 A 미변경 정당성 | use_figma 조상/핀 추적 7노드 | ✅ PASS |

## 항목별 실측

### 1. 다크 잔존 라이트 0 (핵심)
- **육안(get_screenshot):** Person Search(1136:1283)·Event Tab(1137:1320)·Device Summary(1135:1250)·Memo(1138:1373)·Filter Bar(1140:1540)·List Filter Stack(1140:10640)·대조클론 PS(1143:10700)·대조클론 ET(1143:10709) 전부 렌더 → **흰색(라이트) 표면의 Select/Search/Chip/Tab 잔존 0**. Button primary 파랑(추가)은 정상 유지.
- **데이터(use_figma):** 빌더 주장 24개 flip 노드 전수 확인 — 전부 `selfPins:[]`(자체 Light 핀 제거됨) + 부모 모듈에서 **Dark(8:2) 상속**. 
- **적대적 스캔(빌더 24-노드 목록 넘어선 독립 검증):** 8개 다크 서브트리 하위 **359개 노드 전수** 스캔 → 자체 `Light(8:1)` 핀 잔존 **0건**. 8개 루트 모두 Dark 핀 확인. `remainingLightPins_waveB: 0` 독립 확증.

### 2. 라이트 스펙 줄 불변
- 1139:1394(Device Summary Light)·1139:1408(Person Search Light)·1139:1417(Event Tab Light)·1139:1431(Memo Light): 각각 self-pin=**Light**, 다크 조상 없음, effectiveMode=Light. 렌더도 흰 표면·다크 텍스트. 핀 수정에 안 건드려짐 → 라이트 유지.

### 3. 원본 이미지 불변
- 1143:1591/1594/1597/1600 + 1116:1238~1243 (총 10노드): 전부 RECTANGLE·IMAGE fill 유지. imageHash 가 node-map 기록과 일치(예: 1143:1591=`86c4c478…`, 1143:1594=`c8123a60…`, 1143:1597=`78ebb19d…`, 1143:1600=`45e379d4…`). 변형/모드전환 흔적 없음.

### 4. 색 하드코딩 안 함
- 8개 다크 서브트리 fills+strokes SOLID paint **236개** 스캔 → boundVariables 없는 raw hex **0건**. 모드 전환만 수행됐고 Variable 바인딩 보존 확인.

### 5. 웨이브 A 미변경 정당성
- 섹션 1059:2 = "Video Widget Templates"(SECTION). 하위 7노드(1106:2 Dashboard / 1106:20 List Feed / 1106:99 Table / 1106:10037 Stat Summary / 1106:10077 Gauge Score / 1106:10284 CCTV / 1106:10311 Chart)는 **모두 섹션 직계 top-level FRAME**, 각 self-pin=**Light**, **다크 조상 없음** = 의도된 라이트 스펙 줄. 다크-의도 form-control 아님 → 미변경이 정당. (flip 했으면 의도된 라이트 디자인이 깨졌을 것.)

## ❌(a) 코드 실수 · 🟡(b) 개선 · ❓(c) 확인 요청
- 해당 없음 (0건).

## 최종 판정
**PASS** — darkModePinFix 는 clearExplicitVariableModeForCollection(모드 전환만)로 24개 라이트-핀을 정상 제거, 부모 Dark 상속으로 전부 다크 flip. 흰 입력요소 잔존 0(육안+359노드 스캔), 라이트 스펙 줄·원본 이미지 불변, 미바인딩 hex 0, 웨이브 A 미변경 정당. ❌(a)/🟡/❓ 0건.

> 한계: 색 정확도(다크 토큰 값 자체의 적정성)는 이번 검증 범위 밖 — 이번은 "라이트 핀→다크 전환이 실제로 됐고, 부작용(라이트줄·이미지·hex 유입) 없음"만 판정.
