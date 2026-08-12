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
위치: pages/components.html 980 (일반 hover) · 1007~1010 (selected-hover)
  .s1-date-picker__day:hover:not([disabled]):not(.is-selected) > .day-inner {
    background: var(--color-date-picker-cell-bg-hover);
  }
  .s1-date-picker__day.is-selected:hover:not([disabled]) > .day-inner {
    background: var(--color-date-picker-cell-bg-selected-hover);
    border-color: var(--color-date-picker-cell-bg-selected-hover);
  }
증상: 브라우저 확인 완료. 선택된 칸(blue/400)에 마우스를 올리면 회색이 된다.
판정: date-picker selected cell 은 위 규칙의 (B) 유형 → 웹 쪽 버그.
      Figma 가 따라 그릴 스펙이 아니다.
      → ②번이 Standard 에만 Hover 를 넣은 것은 이 규칙과 일치한다 (의도한 결정).
✅ 해소됨 (작업 ③): color/date-picker/cell/bg/selected-hover 신설(light blue/500 · dark blue-dark/250,
   chip-solid selected-hover 와 동일 단계) → tokens.css·semantic.html·install-prompt 재생성 → 웹 CSS
   selected 분기 배선(일반 hover 규칙에 :not(.is-selected) 예외 + selected 전용 selected-hover 규칙).
   범위: 웹만. Figma 배리언트는 추가 안 함(chip 선례가 웹 전용이라 일관성 유지 — GUI 결정 3).
   근거: pages/components.html 980 (일반 hover, :not(.is-selected) 예외) ·
         1007~1010 (selected 전용 selected-hover 규칙) — 2026-07-30 재확인

⚠️ 정정 (작업 ③ 조사 결과): chip solid 는 '우회 배선' 이 아니었다 — 아래 기록이 오판이었음.
   chip-solid-bg-selected-hover 는 plugins/figma-vars-installer/src/vars-data.ts:508 에 이미 정의돼 있고(light blue/500 · dark blue-dark/250),
   tokens.css 의 해당 줄은 GEN:SEMANTIC 자동생성 블록 안이며(수동 직접 배선 아님) vars-data 와 같은
   커밋(6bbde8c3, 2026-07-10)에서 함께 생성됐다. 웹·semantic·install-prompt 전 표면에도 정상 반영돼 있었다.
   → chip 은 작업 ③ 에서 손대지 않았다(고칠 것 없음). date-picker 만 실제 신설 작업이었다.
   (이 항목은 chip 도 (B) 유형이라 selected-hover 가 필요하다는 규칙 판단 자체는 옳다 — 틀린 것은
    "vars-data 를 거치지 않은 우회" 라는 상태 기술뿐이다.)
   근거: plugins/figma-vars-installer/src/vars-data.ts 508 ("color/chip/solid/bg/selected-hover" 엔트리) ·
         438~448 (SEMANTIC_COLOR 설명 주석 블록 — 옛 인용 443 은 이 주석 안) — 2026-07-31 재확인

분리 이유: 토큰 신설 + 웹 수정 + 설치기 리빌드를 ②번 커밋에 섞지 않는다.

### 🕳️ 게이트 사각지대 — Gate 6b 가 설치기 리빌드를 강제하지 못하는 경우
> **부분 해소 (2026-08-01, Phase 2):** Gate 6b 에 **값 검사**를 추가했다 — zip 안 code.js 의
> Foundation hex 값이 정본과 다르면 차단(적대 테스트로 확인). 따라서 "토큰 값만 바꾸고 리빌드를
> 잊는" 경로는 이제 막힌다. **아래에 적힌 '기존 토큰을 배선만 하는 변경'은 여전히 Gate 6b 밖**이며,
> 그쪽은 Gate 13(build-components.ts 해시 검증 기록)이 커밋을 막는 방식으로 커버된다.
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

### 0. 컴포넌트 CSS 배포 — guide model → `components.css` 생성기 (2026-08-12 신규)

- **배경**: Design Guide Download 개발자 탭을 GitHub 저장소(`S-1-UX-DESIGN-AI-GUIDELINE`) 안내로 전환했으나, **개발자·퍼블리셔가 실제로 컴포넌트를 만들 CSS 를 못 받는다.** `.s1-btn` 등 컴포넌트 스타일 **619규칙·100KB 가 `pages/components.html` 안 `<style>` 블록에만** 존재하고, import 가능한 파일이 없다. 저장소의 CSS 3종은 "변수"만 준다.
- **하면 안 되는 방법**: `components.html` 의 `<style>` 을 그대로 뽑아 배포하는 것. 그 화면은 **손관리**라 **Gate 38 이 값 대조에서 명시적으로 제외**한다 — 정본과 일치하는지 검사하는 게이트가 없다. 2026-08-12 확인: Button·Checkbox·Toggle 3건은 정본과 일치했고 `harness:audit` 17/17 통과했으나, 이름 자동 대조로는 **43개 중 8개만** 매칭돼 **35개는 미확인**. 검증 안 된 값에 "S1 표준" 이름표를 다는 위험(river님 지적).
- **올바른 경로**: `registry/components/component-guide-model.json`(11MB) 에서 생성한다. 이 모델은 `plugins/figma-vars-installer/src/build-components.ts`(정본)에서 자동 생성되고 **Gate 38 이 드리프트를 차단**한다. 42개 컴포넌트 · 43개 세트 전 variant 에 대해 `dimensions` · `layout`(layoutMode·align·padding·gap) · `appearance`(fill 의 `__tokenKey`·cornerRadius·strokeWeight) · `text` · `children` 트리가 모두 들어있다.
- **필요한 작업**:
  1. Figma auto-layout → CSS flexbox 변환 규칙 정의 (`HORIZONTAL`+`SPACE_BETWEEN` → `display:flex; justify-content:space-between` 등)
  2. `__tokenKey`(`color/bg/level-0`) → CSS 변수(`--color-bg-level-0`) 매핑 — 기존 변환 규칙 재사용
  3. variant 축(Size·State·Variant·Break) → 클래스 네이밍 설계. **기존 `.s1-btn` 어휘와 충돌/정합 확인 필수**(`.claude/rules/pages.md` Button 표준 7번)
  4. 생성물 ↔ `components.html` 실렌더 대조 검증 (🤖 `component-verifier` 분리)
  5. 새 Gate: 생성기 출력 드리프트 차단
- **완료 판정**: 저장소에 `assets/css/components.css` 가 포함되고, **개발자 탭(현재 「준비 중」 상태 화면)** 이 실제 배포 안내로 열린다. 2026-08-12 결정 — 토큰만으로는 컴포넌트를 만들 수 없으므로 설치 안내를 자세히 두면 개발자가 "이걸로 되겠지" 하고 시작했다가 막힌다. 반쪽짜리를 완성처럼 내놓지 않기 위해 탭 내용을 비우고 준비 중으로 표기했다(river님 결정). 열 때 함께 제공: 토큰 CSS · 컴포넌트 CSS · 컴포넌트 마크업 · PC 동작 규칙.
- **부수 확인**: `components.html` 인라인 CSS 가 **사이트 전용 `site-base.css` 의 역할 토큰 11개**(`--color-text-secondary`·`--color-bg-default`·`--color-surface-default` 등)에 의존 중이다. 컴포넌트가 사이트 전용 토큰을 참조하는 상태이므로 함께 정리해야 한다 ([[site-base 정리 판정]] 진행 중 과제와 겹침).

### 1. 별칭층 철거 backlog 마무리 (8개 컴포넌트)
- 2026-07-10 `d167c7b`에서 라이브 CSS·문서탭은 정본화 완료, registry는 backlog로 남김
- 대상: textarea, table, pagination, gnb, tab, toggle, radio, checkbox
- 현재 상태: `tokens[]`의 별칭이 **낡은 범용 시맨틱**을 가리킴
  - 예) `--pagination-control-bg` → `var(--color-surface-default)` ❌
  - 정본: `--color-pagination-control-bg-default`
- **⚠️ 실해(實害) 발생 중**: `design/DESIGN.core.md` 495~500행에 별칭 2개가 실려 있음 — `--pagination-control-hover-bg`(499·500행) · `--pagination-number-text-selected`(500행). `--pagination-control-bg` 는 이 파일에 0건
  → **AI가 이걸 읽고 죽은 별칭으로 코드를 짜고 있음**
  - **수정 경로**: DESIGN.core.md 는 `scripts/gen-design-md.js` 가 `registry/components/pagination.json` 의 `tokens[]`(89행 hover-bg · 105행 number-text-selected)를 읽어 재생성하는 산출물이다. DESIGN.core.md 를 직접 고치지 말고 pagination.json 을 고친 뒤 재생성할 것
  - 근거: design/DESIGN.core.md 499·500 (pagination variant 표) ·
        registry/components/pagination.json 89·105 (tokens[] 별칭 엔트리) — 2026-07-31 재확인
- 함께 처리해야 할 것:
  - Gate 20 `registry-drift-baseline.json` (지금 틀린 상태를 정상으로 기록 중)
  - `DESIGN.core.md` 재생성 (Gate 24)
- 결정 필요: `tokens[]`를 (가)시맨틱 직접 / (나)별칭 유지 / (다)삭제
  - time-picker만 형태 A(시맨틱 직접). button/input/select/date-picker는 다른 필드로 분화

### 2. Gate 20 `--update-baseline` 취약점
- tokens.css 대조 없이 상태를 통째로 승인함
- 1번 작업 시 Gate 20이 대량 반응 → 무심코 승인하면 **틀린 걸 정답으로 굳힘**
- 1번보다 먼저 볼 것

### 검수 결과서(리포트) 기능 미구현 — 죽은 코드 제거됨
- **경위**: `plugins/figma-vars-installer/src/audit-report.ts`(252줄, `buildAuditReport()`)가
  검수 결과를 캔버스 프레임으로 그리는 기능으로 작성됐으나 **어디에서도 import 되지 않았다**
  (전 저장소 참조 0건). CLAUDE.md 2026-07-14 이력은 이 기능이 '리포트 서브탭'으로 있는 것처럼
  적었으나 실제 ui.html 에는 그 탭이 없다(🤖 component-verifier 2026-08-01 실측).
- **처리**: 2026-08-01 파일 삭제(git 이력에 보존). 죽은 코드가 '있는 기능'처럼 보이는 상태를 없앴다.
- **남은 일**: 검수 결과서가 정말 필요하면 다시 만든다. 되살릴 때는 git 이력에서 구현을 참고할 수 있다
  (`git log --all -- plugins/figma-vars-installer/src/audit-report.ts`).

### 검수기 색 제안 품질 — 그림자 토큰이 검정 fill 에 exact 로 뜬다
- **증상**: Semantic Shadow V2 의 COLOR 변수는 전부 `rgba(0,0,0,*)` 인데 `rgbToHex` 가 alpha 를 버려
  `#000000` 으로 후보풀(`byHex`)에 들어간다. 그래서 검정 fill 을 검수하면 `shadow/raised/layer-a/color`
  류가 **"정확일치(exact)" 제안**으로 표시된다. (🤖 component-verifier 2026-08-01 실측)
- **현재 위험도**: 낮음 — 자동적용(high) 조건은 "exact + 후보 1개"라 실제로 자동 적용되지는 않는다.
  다만 사람이 제안 목록에서 잘못 고를 수 있다.
- **고칠 방향**: 후보풀 구성 시 alpha<1 인 변수를 제외하거나, EFFECT_COLOR scope 변수는 paint 제안에서 배제.
- **관련**: `plugins/figma-vars-installer/src/audit-engine.ts` `rgbToHex()`·`loadV2Vars()` byHex 구성부.

### 설치기 실패 시 이름 없는 부산물이 캔버스에 남는다
- **증상**: 컴포넌트 빌드가 중간에 실패하면 이름을 붙이기 전 만든 노드(TEXT·RECT·떠 있는 COMPONENT 등)가
  최상위에 남는다. 실측 26개(완성 후 실패)·16개(중간 실패). 현재 정리는 `footprint(name)` **이름이 일치하는**
  새 노드만 지우므로 이름 없는 것은 대상이 아니다.
- **영향**: 실패 지점에서 `catY` 를 전진시키지 않아 다음 컴포넌트가 같은 자리에 겹쳐 그려질 수 있고,
  재시도할 때마다 누적된다. [재설치]로는 정리된다.
- **고칠 방향(정책 판단 필요)**: id 스냅샷이 이미 있으므로 "이번 시도의 새 노드 전부"로 넓히면 완결되나,
  그러면 부모 실패 시 자식이 만든 세트까지 지우게 되어 정리 정책이 바뀐다. river 결정 사항.

### Table 이 Table Cell 컴포넌트를 재사용하지 않는다 (코어 재사용 원칙 위배)
- **실측(🤖 component-verifier 2026-08-01)**: 정상 빌드에서 Table 이 붙인 Table Cell 인스턴스 **0건**.
  `buildTable` 은 `BUILT_COMPS["TableCell:…"]` 을 읽되 없으면 plain frame 으로 그리는 fallback 이 있는데,
  `BUILD_DEPENDENCIES` 에 `"Table": ["Table Cell"]` 이 없어 **Table 이 Table Cell 보다 먼저 빌드**된다
  → `cellComp` 가 항상 undefined → 언제나 fallback. HEAD 이전부터 그랬다(신규 버그 아님).
- **영향**: CLAUDE.md §🔁 Core Component Reuse Rule("모듈은 코어 컴포넌트를 재사용한다")과 어긋난다.
  셀 스타일을 고쳐도 Table 에 반영되지 않는다.
- **고칠 방향**: `BUILD_DEPENDENCIES["Table"] = ["Table Cell"]` 추가 → 실제 인스턴스 사용.
  **단 씬그래프가 바뀐다**(raw frame → 인스턴스) → 회귀·렌더 재검증 필요한 별건 변경.
  고친 뒤에는 `ATTACH_DEPENDENCIES["Table"]` 에 `"Table Cell"` 을 다시 넣어야 열화 보고가 정확해진다
  (2026-08-01 에는 실측과 맞추려고 뺐다).

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

---

## 2026-07-28 세션에서 나온 항목

### 서술 필드 구체 사양 보강
_meta.notes 는 gen-design-md.js 렌더 대상이 아니라 AI 프롬프트에 미노출.
notes 에만 있는 구체 사양은 에이전트가 볼 수 없음 (구조적 빈칸)
- 우선: table(정렬 아이콘 combobox_arrow 18×18), textarea(helper needs-core-update)
- 검토: time-picker(가장 많음), pagination, select, dropdown
- 제외: toggle (죽은 별칭이라 빠진 게 정상)
- 별도 판단: _meta.notes 를 렌더 대상에 포함할지

### 서술 필드 검증
9섹션 서술은 손으로 작성됨. toggle 은 대조해서 맞았지만
나머지 16개는 미검증. Gate 20 은 토큰 이름만 봐서 못 잡음

### 번들 재생성 자동화
registry/components 변경 시 build:bundle 을 게이트에서 강제하거나 warn
(registry-data-bundle.js 가 186→601줄로 뒤늦게 반영된 건)

### Gate 6b 사각지대
토큰 키만 대조해서 플러그인 로직 변경을 못 잡음.
zip 반영 여부를 수동 확인해야 하는 구조

### 정리 후보
- assets/downloads/s1-design-system-installer.zip (옛 이름 잔재, 7-7)
- .gitignore 의 ds-apply 관련 규칙 3블록 통합

---

## 2026-07-29 세션에서 나온 항목

### Figma MCP 경유 변수명 슬래시 문제

- **판단: 도입 안 함 (2026-07-29 검토 종결).** codeSyntax 도입 근거 철회. 설치기 테스트 코드는 원복 완료.
- **Dev Mode 는 codeSyntax 없이도 정상**: Figma 가 CSS 패널에서 변수명의 슬래시를 하이픈으로 변환해 출력한다. **미처리 노드 `1364:46565` 와 처리 노드 `1364:49041` 을 Dev Mode 에서 직접 대조해 확인.** → 사람 개발자 대상 실익 없음.
- **슬래시가 그대로 나오는 곳은 Figma MCP `get_design_context` 출력뿐이다.**
  - before: `var(--color\/bg\/level-2, #f5f5f5)`
  - after(codeSyntax 기입 시): `var(--color-form-control-bg-default, white)`
- **해결 방법(재개 시)**: 변수에 `setVariableCodeSyntax('WEB', 'var(--{path 의 / 를 - 로})')`. 이름 변환은 기계적으로 성립 — Semantic Color V2 **170/170** 이 tokens.css 의 실제 변수와 일치. 설치기에 넣는다면 `plugins/figma-vars-installer/src/code.ts` `installSemantic()` 의 `v.scopes = colorScopes(path);` 다음 줄, 순증 3줄.
- **재검토 조건**: AI 에이전트가 Figma MCP 출력을 코드 생성에 직접 쓰는 시점.

### V3.0-TEST 파일에 codeSyntax 3건 잔존

- **파일**: `cysG5U1udpQqVagYY1hWHW` (SW UX GUIDE V3.0-TEST)
- **대상 변수 3개**:

  | Figma 변수 | 기입된 codeSyntax (WEB) |
  |---|---|
  | `color/form-control/bg/default` | `var(--color-form-control-bg-default)` |
  | `color/form-control/border/default` | `var(--color-form-control-border-default)` |
  | `color/form-control/text/placeholder` | `var(--color-form-control-text-placeholder)` |

- **기입 경로**: 설치기(`code.ts`) 아님. **Figma MCP 로 직접 기입.** → 설치기를 다시 돌려도 재생성되지 않고, 원복된 설치기 코드와도 무관하다.
- **영향**: 색·Light/Dark 값·scopes·바인딩 **전부 무변경**. 표시용 메타데이터만.
- **판단**: 무해하여 삭제하지 않음. **의도적으로 남긴 것.**
- **삭제 방법**: 해당 변수에 `removeVariableCodeSyntax("WEB")`

### vars-data.ts 파서의 구조적 취약성

- **발견**: 2026-07-29, shadow 토큰 인프라 신설 작업 중.
- **증상 1 — 주석 문자열이 파서를 가로챔**: `scripts/gen-semantic-tokens.js` 의 `block()` 정규식이 `vars-data.ts` **주석 안의 리터럴 문자열**에 먼저 걸려, `SEMANTIC_COLOR` 402줄이 `tokens.css` 생성물에서 소실됐다. 주석 문자열을 바꿔 복구했으나 **원인은 그대로 남아 있다.**
- **증상 2 — 선언 순서 의존**: 아래 3개 검사기가 선언 지점부터 **파일 끝까지** 슬라이스한 뒤 `{light, dark}` 정규식을 돌린다.
  - `scripts/token-sync-monitor.js:67`
  - `scripts/token-value-consistency-check.js:84`
  - `scripts/dark-divergence-check.js:73`

  이 때문에 `SEMANTIC_SHADOW` 가 `SEMANTIC_COLOR` 선언부 **앞**에 있어야만 정상 동작한다. 선언 순서를 바꾸면 검사기가 **조용히 오작동**한다. 현재는 코드 주석으로 경고만 남긴 상태다.
- **근본 원인**: TypeScript 소스를 정규식으로 긁는 구조. **주석·선언 순서 등 값과 무관한 요소가 파싱 결과를 바꾼다.**
- **후보 조치 (확정 아님)**:
  - 정규식을 `"(color\/…)"` 처럼 키 접두어로 좁힌다
  - 소스 파싱 대신 컴파일된 값을 import 해서 읽는다
- **영향**: 현재 값은 정상이다. 다만 `vars-data.ts` 를 편집할 때마다 생성물이 조용히 깨질 수 있다.

### 경로 지정 커밋에서 생성물 누락이 반복됨

- **발견**: 2026-07-29, shadow·border 작업 중 **3회**.
- **사례 1 — `ed159f7`**: `reports/installer-build/build-verification.json` 누락. 커밋 제목은 *"Gate 13 독립 검증"* 인데 **검증 기록이 없어**, 그 커밋만 체크아웃하면 Gate 13 이 stale 로 차단된다. `90be267` 로 보정.
- **사례 2 — `f76ddba`**: `assets/js/reports-bundle.js` 누락. `npm run reports:sync` 는 `data/reports-index.json` 과 `assets/js/reports-bundle.js` **두 개**를 만드는데 하나만 커밋됐다. **Gate 4 는 index 만 검사하고 번들은 안 봐서 통과했다.** 그 커밋만 체크아웃하면 포털 리포트 목록이 65건만 표시된다. `6cffe45` 로 보정.
- **사례 3 — Modal 보더 작업**: `npm run page:gen` 미실행으로 `pages/semantic.html` 미전파. **Gate 7·7b 가 error 로 잡아 사전 차단됨**(유출 없음).
- **공통 원인**: `git commit -- <경로>` 는 파일을 명시해야 하는데, **어떤 npm 명령이 어떤 생성물을 만드는지 한눈에 보는 목록이 없다.** 사례 1·2 는 게이트가 잡지 못했다.
- **후보 조치 (확정 아님)**:
  - 명령 → 생성물 대응표를 문서화한다
  - 커밋 전 `git status --porcelain` 에 남은 생성물이 있으면 경고하는 검사
  - Gate 4 가 `reports-bundle.js` 도 검사하도록 확장
  - 생성물 세트를 묶어 커밋하는 헬퍼 스크립트
- **영향**: 현재 값은 정상이다. 다만 경로 지정 커밋을 쓰는 한 같은 누락이 반복될 수 있다.

---

## 2026-07-30 세션에서 나온 항목

### 주석 안 리터럴이 검사기를 속임 — 두 번째 발생

- **발견**: 2026-07-30, 설치기 툴팁 자동화 2단계.
- **사례 1 (기존, 위 "vars-data.ts 파서의 구조적 취약성" 에 이미 기록)**: `vars-data.ts` 주석 안의 선언부 리터럴이 `scripts/gen-semantic-tokens.js` 정규식에 먼저 걸려 **`SEMANTIC_COLOR` 402줄이 생성물에서 소실**됐다.
- **사례 2 (신규)**: `plugins/figma-vars-installer/src/ui.html` 의 **HTML 주석 안에 `{{UPDATE_NOTES}}` 리터럴**이 있어, 실제 플레이스홀더를 삭제해도 `scripts/stamp-installer-ui.js` 의 존재 검사가 주석에 속아 **통과**했다. 적대적 테스트로 발견했고, 주석에서 중괄호를 빼서 조치했다.
- **공통 형태**: 파일을 **문자열로 훑는** 검사기가 주석 안 리터럴을 실제 코드로 오인한다. **소스 종류(TypeScript · HTML)와 무관하게** 발생한다.
- **주목할 점**: 사례 2 는 **적대적 테스트를 하지 않았으면 발견되지 않았다.** 가드가 있는데 작동하지 않는 상태였다.
- **후보 조치 (확정 아님)**:
  - 문자열 훑기 대신 파싱된 구조를 검사한다
  - 검사기마다 적대적 테스트를 필수로 둔다
  - 플레이스홀더 등 마커 문자열을 주석에 쓰지 않는 규칙을 명문화한다

### 다중 세션 커밋 삼킴 재발

- **발견**: 2026-07-30.
- **사례**: `b782e62` (14:12) *"설치기 UI 0.2Ver — 앱셸 레이아웃"* 커밋에 **다른 세션의 툴팁 자동화 2단계 파일 6개**가 함께 들어갔다.
  - `scripts/lib/figma-build-mock.js`
  - `scripts/lib/installer-fingerprint.js`
  - `scripts/lib/installer-history.js`
  - `scripts/installer-update-notes.js`
  - `scripts/stamp-installer-ui.js`
  - `plugins/figma-vars-installer/src/ui.html` (플레이스홀더 전환분)
- **커밋 메시지에 툴팁 자동화 언급이 없어 이력 추적이 끊겼다.** `13fc13e` 빈 커밋으로 사실만 기록해 보완했다.
- **기존 기록과의 관계**: 위 우선순위 **"3. 다중 세션 인덱스 공유 사고 (2026-07-14 실제 발생)"** 항목과 같은 유형이다. 그 항목의 재발 방지책이 *"`git commit -- <파일>` 경로 지정 커밋 사용"* 인데 **지켜지지 않았다.**
- **코드 손실**: 없음. 파일은 온전히 커밋됐고 동작도 정상이다. **문제는 커밋 메시지와 이력 추적이다.**
- **후보 조치 (확정 아님)**:
  - 경로 지정 커밋을 기계적으로 강제하는 방법
  - 세션별 worktree 분리
  - 커밋 전 인덱스에 남의 파일이 있으면 경고

---

## 2026-07-31 세션에서 나온 항목

### 포털 사이트 정본 정합 (중단 — 우선순위 낮음)

- **상태**: 보류

**[확인된 사실 — 2026-07-31 조사]**

- `assets/css/style.css` 1,049줄: `var(--color-*)` 참조 1건(:90), 하드코딩 HEX 242건 / 고유 69색. `.s1-*` `.sw-*` 클래스 0건. 포털은 자체 크롬 클래스 + 하드코딩으로 구성됨
- `site-base.css` 49종 중 `registry/components` 참조 21종(엔트리 48건), 페이지 참조 139건
- `--color-surface-raised` 값 갈림: `tokens.css` #1C1D23 / `site-base` #35363F. `tokens.css` 를 `<link>` 하지 않는 6개 페이지에서 옛값 적용
- `pages/policy.html:314·337` 에 `--color-action-primary` 유령 참조 2건 (정의 없음. 정본은 `--color-action-primary-default`)
- `plugins/ds-apply/skills/ds-apply/references/tokens.css` 가 원본보다 4종 뒤짐 (`--color-modal-panel-border`, `--shadow-dropdown`, `--shadow-raised`, `--shadow-raised-up`)
- **정본 신설 후보 0건.** `vars-data.ts` SEMANTIC_COLOR 171종 = `tokens.css` Semantic 171종(차집합 양쪽 0). 설치기는 이 171개로 전 컴포넌트를 그리며, 부품 전용 토큰 대신 기존 토큰을 재사용한다
  - dropdown 트리거 → `color/form-control/{bg,border,text,icon}/*` (`build-components.ts:1263~1267`)
  - toggle knob → `color/control/indicator/selected` · `indicator/disabled` (`:747`)
  - gnb 밑줄 → `color/navigation/indicator/selected` (`:2500`)
  - navigation 테두리 → `color/line/gray/subtle` (`:2742`)
  - Line Tab 라벨·인디케이터 → `color/navigation/label/*` · `indicator/*` (`:1511·1524`)
  - chip 아이콘 → registry 가 이미 `color/chip/{v}/label/{state}` 를 가리킴 (`chip.json:80~85·106~111`)
- 실제 문제는 값이 아니라 **이름 배선**이다. registry 의 `name` 이 정본에 없는 별칭(예 `--chip-line-default-icon`)이고, `scripts/gen-design-md.js` 가 그 이름을 `DESIGN.core.md` 에 실어 AI 에 노출한다. 고칠 곳은 registry 의 `name` 필드 또는 `gen-design-md.js` 의 출력 방식 — 둘 중 하나
- registry 엔트리 138건 중 정본과 이름이 대응하지 않는 것 60건. 전부 이름 문제이며 값 신설은 불필요 (명명 관례 차이 포함: checked↔selected, focus↔selected, on·off↔selected·unselected, row↔cell, text↔label)
- 값이 정확히 일치하는 정본이 없는 것은 registry 참조 48건 중 3건뿐이고, 셋 다 다크값만 갈린다 — `dropdown.json:75` `--dropdown-list-bg`(surface-raised 다크 #35363F vs 정본 #1C1D23) · `textarea.json:77` `--input-readonly-text`(다크 #3E4049 vs 정본 #8A8C96) · `textarea.json:79` `--input-error-text`(라이트 red-400 vs 정본 red-300)
- **별건 발견**: 설치기 Chip 에 아이콘·닫기(X) 변형 부품이 없다(`build-components.ts:771~837` 은 fill·stroke·label 3개만). registry `chip.json:150` 은 `subVariants ["text-only","with-icon","with-close"]` 를 선언한다. 토큰 문제가 아니라 컴포넌트 커버리지 공백 — 별도 항목
- ds-apply 스킬 적용 불가 — `SKILL.md:3` 이 design-system 유지보수 작업을 명시적으로 배제

**[미확인]**

- 페이지 139건 각각의 정본 대응 여부 (미대조)
- `style.css` 69색의 정본 대응 여부 (미대조)
- `components.html` 인라인 `style=` 538건의 선택자 소속 (판정 불가)

**[결정된 방침]**

- `site-base.css` 폐지는 목표에서 제외. 사이트 정본 정합과 별개 문제다
- 분리 방식은 "정본 대응분을 정본 직접 참조로 바꿔 제거 → 잔량만 `--site-` 접두어로 개명". 전량 개명 아님 (정본을 따라야 할 토큰을 개명하면 정본 변경이 포털에 전파되지 않음)
- 개명 시점은 잔량 확정 후

**[재개 시 첫 작업]**

- registry 의 `name` 필드를 정본 이름으로 바꿀지, `gen-design-md.js` 출력 방식을 바꿀지 결정
- `style.css` 69색과 `tokens.css` 정본의 값 대조

## 설치기 — 기존 보존(skip) 시 부모가 부품을 재사용하지 못함 (2026-08-02 · 🤖 검증 실측)

**증상:** 부품 세트가 캔버스에 이미 있어 `skipped` 로 보존되면 `BUILT_COMPS` 가 비어, 그 부품을
인스턴스로 붙이는 부모가 **조용히 fallback 으로 떨어진다**(경고 없음).

**범위:** 의존 23쌍 중 **7쌍**만 해당. 나머지 16쌍은 `getBuiltSet()`(build-components.ts:66-69)·
`getReuseComp()`(:3560-3567) 이 `figma.currentPage.findOne()` 으로 캔버스의 기존 세트를 찾아
정상 부착하므로 문제 없다.

| 캔버스 fallback 이 없어 실제 공백이 생기는 7쌍 |
|---|
| Table → Table Cell(:1739) · Checkbox(:1723) · Select Box(:1796) |
| Dropdown → Dropdown List(:1432) |
| Time Picker → Time Picker Dropdown(:2056) |
| GNB Utility Icon → Language Icon(:2547) |
| Bottom Sheet → Bottom Sheet Option(:3735) |

**하지 말 것(이미 시도·되돌림):** 열화 전파 시드에 `skipped` 를 넣는 방식. 위 16쌍에 **거짓 경보**가
되고, 그 경보는 콘솔이 아니라 `ui.html:628-643` 의 주황 경고 블록으로 **디자이너 화면**에 뜨며
완료 제목을 "일부 누락"으로 바꾼다. 6종 시나리오 mock 실측으로 확인 후 원복했다.

**옳은 해법:** skip 시 캔버스의 기존 세트를 `BUILT_COMPS` 에 **재등록**해 부모가 진짜로 재사용하게
만든다 → 보고가 아니라 해결이 되고, 7쌍 전부 한 번에 해소된다. 씬그래프 탐색이 들어가므로 별건.

---

## 유실된 규칙 문서 4건 복원 (2026-08-05 등록)

CLAUDE.md 의 「🗂️ 아카이브된 휴면 규칙」 표가 아래 4개 문서를 "작업 트리거 시 반드시 Read"
하라고 지시하고 있었으나, **git 역사상 그 파일들은 한 번도 존재한 적이 없다**(`git log --all` 확인).
즉 표가 유실을 가리고 있었다. 표는 제거했고(2026-08-05 CLAUDE.md 정비), 규칙 자체의 복원은 여기 남긴다.

| 없는 문서 | 담당했어야 할 규칙 | 원래 트리거 |
|---|---|---|
| `.claude/docs/portal-harness-rules.md` | Portal 페이지 렌더링·Core Harness·Button/Dark Border 토큰 편집 (MVP2/MVP3) | Portal·Harness 작업 |
| `.claude/docs/source-guard-rules.md` | Source Guard — 외부 서비스 토큰 검수/수정/CI (MVP3.5~3.8) | Source Guard 작업 |
| `.claude/docs/input-component-rules.md` | Input·Search·Password·Unit·DatePicker 컴포넌트 편집 (MVP4.x) | 해당 컴포넌트 편집 |
| `.claude/docs/token-mapping-sync-rules.md` | Figma Variable 매핑·Token Sync 플러그인·Legacy 토큰 감사 (MVP-T1/T2/L1) | 매핑·Sync 작업 |

**복원 방법(제안):** 각 MVP 단계의 `reports/` 리포트와 `reports/changelog-archive.md`, 그리고
해당 시기 커밋 메시지에서 확정 규칙을 추려 문서화한다. **⭐ 단독으로 규칙을 새로 지어내지 않는다**
(하드룰 H6② — 구 H7) — 근거를 찾지 못한 항목은 `needs-decision` 으로 river 에게 올린다.

## 토큰 수정 제안 등록처 재설계 (2026-08-05 등록 · 종전 CLAUDE.md 본문에 있던 과제)

「토큰 수정 제안 워크플로우(Review → 승인 → 반영)」가 등록처로 지정했던 `pages/md-review.html` 은
2026-06-24 삭제되어 현재 **제안을 등록할 곳이 없다**. 리뷰 대상 유형(오타·네이밍 오류 · Semantic 참조
불일치 · 상태값 누락 · 구조 개선 · 다크모드 대응 누락)과 "사용자 승인 후에만 정본 반영" 원칙은 유효하다.
등록처를 어디로 할지(웹 페이지 재생성 / registry JSON / reports MD)가 결정 대기.
