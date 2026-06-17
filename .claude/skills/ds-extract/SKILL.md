---
name: ds-extract
description: 엉킨 레거시 시안(Figma)에서 컴포넌트·패턴을 데이터 기반으로 추출·수렴해 새 DS 정답지로 보내는 코퍼스 프론트엔드 워크플로우. (1) "시안에서 컴포넌트/패턴 뽑아줘", "여러 시안 분석해서 핵심 부품 골라줘" 요청 시 (2) 빈도×걸친-서비스 수로 코어/서비스/패턴 분류가 필요할 때 (3) 기존 DS와 대조해 새로 만들지 말지 판단할 때 사용. 추출·수렴까지가 이 스킬의 범위이고, 개별 컴포넌트 구현은 figma-to-code 스킬로 핸드오프한다.
---

# DS-Extract — 시안 코퍼스 추출·수렴 워크플로우

> **목표:** 토큰 안 입혀진·v1~v3 섞인·이름 제각각인 시안 더미에서, **가장 자주·여러 서비스에 쓰이는 것부터** 데이터로 골라 새 DS 하나로 수렴.
> **층위:** 이 스킬은 "무엇을·어떤 순서로 지을지"(발견·수렴)만. 개별 컴포넌트 실제 구현은 **figma-to-code** 스킬이 받는다(중복 금지).
> **입력은 읽기전용** — 시안 파일을 절대 수정하지 않는다.

## 정본·도구
- 대상 설정: `registry/figma/corpus-targets.json` (서비스=fileKey, 플로우=page nodeId, chromePatterns). **링크 없이** 여기 등록분으로 돈다.
- 엔진: `npm run ds:harvest` (한 페이지) · `npm run ds:aggregate` (합산) — `scripts/ds-extract/*`
- 산출물: `reports/ds-extract/harvest/*.json`(페이지별) · `reports/ds-extract/corpus-analysis.{json,md}`(합산)
- 기존 DS 대조: `registry/components/index.json`

## 워크플로우 (이 순서)

### S0. 대상 등록
- 새 시안 파일은 `corpus-targets.json` 의 `services[]` 에 `{id, name, fileKey, pages[]}` 추가.
- 페이지 nodeId 를 모르면 `get_metadata(fileKey)` (nodeId 생략)로 페이지 목록을 받아 등록.

### S1. 1패스 수확 (넓고 얕게) — 페이지마다
1. `get_metadata(fileKey, nodeId=page)` 호출.
2. **16만자 초과는 정상** — 결과가 파일로 저장된다(에러 메시지의 경로). 그 경로를 그대로:
   `npm run ds:harvest -- --in <savedPath> --service <id> --page <nodeId>`
3. harvest 가 인스턴스(컴포넌트)·프레임(패턴) 빈도를 JSON 으로 적재. **XML 전체를 컨텍스트에 올리지 말 것.**
- 모든 등록 페이지에 반복.

### S2. 합산·분류
- `npm run ds:aggregate` → 코퍼스 분석 생성.
- 분류 2축: **원자(컴포넌트)/조합(패턴)** × **여러 서비스/한 서비스** → 코어 컴포넌트 / 서비스 컴포넌트 / 공통 패턴 / 서비스 패턴.
- 승격 임계값(`--coreServices`,`--coreFreq`)은 **breadth 분포 히스토그램을 보고 캘리브레이트**(선험적으로 못 박지 않음).
- ⚠️ 서비스 1개만 분석하면 breadth 전부 1 → 코어 분류 불가. **여러 서비스 모여야 의미.**

### S3. 시각 확인 (이름은 못 믿는다)
- 상위 후보·애매한 클러스터의 `reprNodeId` 로 `get_screenshot` → 썸네일로 실제 정체 확인.
- **전수 금지** — 상위·대표만(비용). 예: 이름이 같아도 시각으론 "버튼 1개" vs "버튼 쌍(=패턴)"일 수 있음.

### S4. 사람 보정 (필수)
- 자동 클러스터는 **1차 초안**. 사용자가 병합/분리(이름 다른 같은 부품 합치기, 한 이름의 다른 것 쪼개기).
- 기존 DS 대조(MATCH/PARTIAL/NEW) 확정: MATCH=안 만듦 / PARTIAL=빠진 상태·변형만 보완 / NEW=신규.
- 누락 상태(hover/disabled 등)는 구조 초안 제안 → 사용자 승인.

### S5. 핸드오프
- NEW/PARTIAL 로 확정된 컴포넌트 → **figma-to-code 스킬**로 넘겨 실제 구현·검증·게이트(②토큰재조정 ③시각A/B ④인스톨러).
- 레거시 변종 → 새 DS 매핑을 기록(마이그레이션 원장).

## 절대 규칙
1. 입력(시안) 읽기전용 — 수정·리네임 금지. 네이밍 강제는 출력(새 DS)에만.
2. 분류는 데이터가 정함 — 분석 전 서비스/도메인으로 미리 가르지 않는다.
3. 큰 선택은 metadata→타겟 context 로 끊어 읽기. 한 번에 get_design_context 금지.
4. breadth 는 **서비스(제품) 단위**로 센다(파일·버전 중복 아님).
5. 추측 금지 — 시각·구조로 확인. 만드는 자(figma-to-code) ≠ 분석하는 자(이 스킬).
