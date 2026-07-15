# BACKLOG

## 🔍 확인 필요 (백로그 아님)

> 이 섹션은 **버그 가능성 확인 대상**이다. 백로그 부채가 아니므로 아래 우선순위 연번(1·2·…·12)과 섞지 않는다. **확인이 끝나면 이 항목은 삭제하거나, 실제 부채로 확정되면 우선순위 구간으로 번호를 붙여 내려보낸다** — 임시 항목이다.

### Calendar 세트 재사용/삭제 분기

- **성격**: 버그 가능성. 백로그가 아니라 확인 대상.
- **증상 가능성**: 설치기 실행 중 Calendar Cell/Tile 세트가 재사용됐다가 뒤 단계에서 다시 삭제될 수 있는 분기가 코드상 관측됨.
  - `build-components.ts:2858-2883` (재사용 로직)
  - `build-components.ts:4808` (삭제 분기)
- **왜 지금 보나**: 실제로 발생한다면 Calendar 컴포넌트가 설치 결과에서 누락되거나 깨진 상태로 남을 수 있음. 현재 영향 여부 미확인.
- **확인 방법**: 다음 설치기 실행 시, Calendar Cell/Tile 세트가 정상적으로 남아 있는지, 배리언트가 전부 있는지 육안 확인.
- **부수 확인**: 모듈 캐시(`_calCell` 등)가 설치 실행 사이에 초기화되는지. 초기화되지 않으면 두 번째 실행부터 동작이 달라질 수 있음.

## 📐 확정 규칙 · 확인된 버그 (③ selected-hover 관련)

### 📐 시스템 규칙 확정 — "선택된 상태 위의 hover"
기준: 선택 표시가 '배경색' 으로 되어 있는가?
(A) 선택돼도 배경이 안 채워지는 유형 — dropdown 옵션, 리스트 항목 등
    → selected 여도 일반 hover 배경(bg/hover) 이 그대로 나오는 게 맞다.
    → selected-hover 토큰 불필요.
(B) 선택되면 배경이 파랗게 채워지는 유형 — button, date-picker selected cell, chip solid
    → 이미 파란 배경이므로 회색 hover 로 덮으면 안 된다. 더 진한 파랑이 맞다.
    → selected-hover 토큰이 별도로 필요하다.

### 🐞 확인된 버그 — date-picker selected cell 이 hover 시 회색으로 덮임
위치: components-new.html 980–981
  .s1-date-picker__day:hover:not([disabled]) > .day-inner {
    background: var(--color-date-picker-cell-bg-hover);  /* gray/50 */
  }
증상: 브라우저 확인 완료. 선택된 칸(blue/400)에 마우스를 올리면 회색이 된다.
판정: date-picker selected cell 은 위 규칙의 (B) 유형 → 웹 쪽 버그.
      Figma 가 따라 그릴 스펙이 아니다.
      → ②번이 Standard 에만 Hover 를 넣은 것은 이 규칙과 일치한다 (의도한 결정).
✅ 해소됨 (작업 ③): color/date-picker/cell/bg/selected-hover 신설(light blue/500 · dark blue-dark/250,
   chip-solid selected-hover 와 동일 단계) → tokens.css·semantic.html·install-prompt 재생성 → 웹 CSS
   selected 분기 배선(일반 hover 규칙에 :not(.is-selected) 예외 + selected 전용 selected-hover 규칙).
   범위: 웹만. Figma 배리언트는 추가 안 함(chip 선례가 웹 전용이라 일관성 유지 — GUI 결정 3).

⚠️ 정정 (작업 ③ 조사 결과): chip solid 는 '우회 배선' 이 아니었다 — 아래 기록이 오판이었음.
   chip-solid-bg-selected-hover 는 vars-data.ts:443 에 이미 정의돼 있고(light blue/500 · dark blue-dark/250),
   tokens.css 의 해당 줄은 GEN:SEMANTIC 자동생성 블록 안이며(수동 직접 배선 아님) vars-data 와 같은
   커밋(6bbde8c3, 2026-07-10)에서 함께 생성됐다. 웹·semantic·install-prompt 전 표면에도 정상 반영돼 있었다.
   → chip 은 작업 ③ 에서 손대지 않았다(고칠 것 없음). date-picker 만 실제 신설 작업이었다.
   (이 항목은 chip 도 (B) 유형이라 selected-hover 가 필요하다는 규칙 판단 자체는 옳다 — 틀린 것은
    "vars-data 를 거치지 않은 우회" 라는 상태 기술뿐이다.)

분리 이유: 토큰 신설 + 웹 수정 + 설치기 리빌드를 ②번 커밋에 섞지 않는다.

### 🕳️ 게이트 사각지대 — Gate 6b 가 설치기 리빌드를 강제하지 못하는 경우
Gate 6b(installer-freshness)는 zip 내부 code.js 에
vars-data 의 토큰 키가 전부 embed 됐는지만 검사한다.
→ 새 토큰을 만들지 않는 변경(기존 토큰을 컴포넌트에 배선만 하는 경우)은
  zip 이 낡아도 Gate 6b 가 통과시킨다.
실제 사례: 작업 ②(date-picker cell Hover 추가). cell/bg/hover 는 기존 토큰이라
  옛 zip 으로도 Gate 6b 통과. 리빌드를 하지 않았다면
  저장소의 배포용 zip 에 Hover 가 빠진 채 남았을 것이다.
  (이번엔 리빌드했으므로 문제없음. 선례 4e1f85f · 1f9444c 도 zip 동봉)
→ 검토 필요: 구조 변경(배리언트 추가·삭제)도 freshness 검사에 넣을 것인가.
  예: zip 내 code.js 의 해시를 build-components.ts 기준으로 대조.

## 🔴 우선순위 높음

### 1. 별칭층 철거 backlog 마무리 (8개 컴포넌트)
- 2026-07-10 `d167c7b`에서 라이브 CSS·문서탭은 정본화 완료, registry는 backlog로 남김
- 대상: textarea, table, pagination, gnb, tab, toggle, radio, checkbox
- 현재 상태: `tokens[]`의 별칭이 **낡은 범용 시맨틱**을 가리킴
  - 예) `--pagination-control-bg` → `var(--color-surface-default)` ❌
  - 정본: `--color-pagination-control-bg-default`
- **⚠️ 실해(實害) 발생 중**: `design/DESIGN.core.md` 157~162행에 이 별칭이 그대로 실려 있음
  → **AI가 이걸 읽고 죽은 별칭으로 코드를 짜고 있음**
- 함께 처리해야 할 것:
  - Gate 20 `registry-drift-baseline.json` (지금 틀린 상태를 정상으로 기록 중)
  - `DESIGN.core.md` 재생성 (Gate 24)
- 결정 필요: `tokens[]`를 (가)시맨틱 직접 / (나)별칭 유지 / (다)삭제
  - time-picker만 형태 A(시맨틱 직접). button/input/select/date-picker는 다른 필드로 분화

### 2. Gate 20 `--update-baseline` 취약점
- tokens.css 대조 없이 상태를 통째로 승인함
- 1번 작업 시 Gate 20이 대량 반응 → 무심코 승인하면 **틀린 걸 정답으로 굳힘**
- 1번보다 먼저 볼 것

## 🟡 중간

### 3. 다중 세션 인덱스 공유 사고 (2026-07-14 실제 발생)
- VS Code 세션 커밋 `05fce64`에 다른 세션의 staged 파일 7개가 쓸려 들어감
- **재발 방지**: `git commit -- <파일>` 경로 지정 커밋 사용 (인덱스 무시)
- 워크트리 `.claude/worktrees/eager-hermann-5803ee` 정체 확인 필요

### 4. gate:check 경고 9건
- pre-commit 통과하나 비차단 경고 9건 존재. 내용 미확인
- 1번 작업 시 함께 볼 것

### 5. surface/raised 면제 해제
- 작업트리에 미커밋으로 대기 중 (`intentional-unused-tokens.json`)
- 조사 완료: Gate 17이 실사용 인식함 → **빼는 게 맞음**. 안전
- 바텀시트 계열 별건이라 오늘 커밋에서 분리함

### 6. 영상위젯 도메인 커밋
- `reports/domain-vms/` (14개, 07-10)
- `reports/figma-library-build/video-widgets/` (9개, 07-11~13)
- `reports/button-sync-check.md` (날짜 스탬프)
- 전부 미커밋 대기 중

### 12. 설치기 구조 정리

- **왜 필요한가**: 컴포넌트 갱신 로직 등 공통 기능을 설치기에 추가하려 할 때, 끼워 넣을 지점이 없어 43곳을 개별 수정해야 하는 상태. 현재는 복제-배포 모델이라 급하지 않으나, 설치기에 공통 기능을 추가하는 모든 작업의 비용을 키운다.
- **부채 목록**:
  1. **배리언트 명세 형태가 함수마다 4가지 + 예외**
     - A. 배열-객체형 (states 배열) — 13곳. 명세/생성 분리됨 (양호)
     - B. 문자열 배열형 — Chip, Filter Chip, Bottom Sheet
     - C. Record 튜플형 — Calendar Cell/Tile
     - D. 함수 계산형 (switch) — Button군, MultiToggle
     - 예외. 명세와 배치가 한 몸 — buildTable, buildGNB, Calendar류
     - → 명세를 데이터로 추출하려면 함수마다 따로 짜야 함
  2. **combineAsVariants 가 공통 헬퍼 없이 43곳에서 각자 호출**
     - → 공통 처리를 끼워 넣을 "길목"이 없음. 가장 큰 제약.
  3. **바인딩 불균일**
     - 색상: Variable 바인딩 (양호. 값만 갱신하면 재설치 없이 반영)
     - 크기·간격·반경: Button만 Variable. 나머지는 raw 숫자 하드코딩
     - 텍스트: 함수 안에 한글 리터럴 하드코딩 ("라벨", "안내 메세지")
  4. **배리언트 축 불일치**
     - 축 개수 1~5개로 제각각
       - 1축: Checkbox(State), Table, Calendar Tile
       - 2축: Radio(State·Label), Toggle(Pressed·State)
       - 5축: Input(Size·State·Label·Message·Break), Filter Chip(Size·Break·Variant·Title·State)
     - 축 이름 대소문자 불일치 (대부분 `State=` 이나 GNB 유틸은 `language=` 소문자)
     - `.variantProperties` API 미사용. 이름 문자열 파싱에만 의존.
- **이미 있는 좋은 선례 (정리 시 본보기)**: `buildOne` (Button 단위 생성), `SpecOpts` 인터페이스 → 명세(데이터)와 생성(노드 만들기)이 이미 분리돼 있음.
- **착수 판단 기준**: 설치기에 공통 기능(갱신·검증·diff 등)을 추가할 필요가 생기면 그때. 단순 컴포넌트 추가/수정만 계속한다면 미룰 수 있음.

## 🟢 낮음

### 7. Dead files 정리
- `registry/tokens/component.tokens.json` (07-02 은퇴)
- `assets/css/component-tokens.css` (07-10 은퇴)
- `assets/js/registry-data-bundle.js` (위 둘의 번들 사본)
- `assets/js/component-renderer.js`, `button-harness.js` (어디서도 로드 안 됨)
- arrow 레거시 별칭이 이 안에 갇혀 있음

### 8. registry 전체 스캔
- pagination이 낡은 시맨틱을 가리켰다면 **다른 컴포넌트도 그럴 것**
- 전체 registry 대상 "정본 토큰 미사용" 1회 스캔

### 9. token-detail 기능 이식
- `_RESCUE_20260714/A-uncommitted.patch` 안에 있음
- `token-detail-gen.js` + package.json 2줄 + gate-check 배선
- **⚠️ A는 Gate 21로 붙였으나 B는 27까지 참 → Gate 28로 새로 받아야 함**

### 10. `~/.claude/settings.json` 경로 오염
- `additionalDirectories`에 옛 `S1_AI_DESIGN_GUIDE` 경로 30여 개
- 기능엔 지장 없으나 정리 필요

### 11. 메모리 네임스페이스 분리
- `-S1-AI-DESIGN-GUIDE/memory` (45개) vs `-S1-UX-DESIGN-with-AI/memory` (7개)
- 옛 네임스페이스에 누적 메모리가 묶여 있음
