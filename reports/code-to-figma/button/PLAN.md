# 역방향(코드→Figma) Button 파일럿 — 변경 계획서

> 방향: `registry/components/button.json` + `assets/css/tokens.css`(정본) → Figma **SW-UX-GUIDE V3.0 TEST** 컴포넌트 세트
> 작성: 2026-06-10 · 파일럿 범위: **Button primary × 4 size × 4 state = 16 variant**
> 타깃 파일: https://www.figma.com/design/cysG5U1udpQqVagYY1hWHW/SW-UX-GUIDE-V3.0-TEST

## 🔍 현재 상태
- 프로젝트의 모든 워크플로우는 Figma→코드 단방향. 역방향(코드→Figma 컴포넌트 생성) capability 전무.
- `figma-vars-installer`는 Variables 3컬렉션만 설치(Foundation·Semantic Color V2·Semantic Number V2). 컴포넌트 생성 없음.
- **발견:** Semantic Color V2에 이미 `color/button/bg/primary--default` 등 버튼 슬롯 변수가 실재 → 컴포넌트 노드를 직접 바인딩 가능.

## 🎯 목표
`figma-vars-installer` 플러그인을 **2단계**로 확장. 같은 실행에서 Phase 1(Variables 설치) → Phase 2(Button primary 16-variant 세트 생성 + 방금 만든 Variable에 바인딩). V3.0 파일에서 1회 실행으로 완료.

---

## 네이밍 컨벤션 — 에스원 GUI 참고 파일 확정 (Tnihi6lixRR47N4RSAwUbF · 1459:16264)

Component Set: **Button** · Properties **4개** = `Size` · `State` · `Variant` · `Break`
(예: `Size=medium, State=Default, Variant=Primary, Break=PC`)

| 속성 | 값 | 케이스 |
|------|-----|--------|
| `Size` | xxsmall(28) · xsmall(34) · medium(44) · large(48) | 소문자 |
| `State` | Default · Hover · Pressed · Disabled | 첫자 대문자 |
| `Variant` | Primary · Secondary · Blue-Line | 첫자 대문자 |
| `Break` | PC · Mobile | 대문자 |

> **충돌 해결:** 기존 button.json valueMap은 medium·mobile이 둘 다 "Large"로 충돌. 참고 파일은 `Break`로 PC/Mobile을 분리 → medium=PC(44), large=Mobile(48). PC엔 xxsmall/xsmall/medium, Mobile엔 large만 존재.

### 참고 노드 내부 구조 (1459:16301 실측) — 동일하게 생성
`Wrapper(h44, center, hug-w) > "Button Base"(bg·border·radius·px) > "Text area"(center) > Text "버튼"`
바인딩: bg→`color/button/bg/primary--default` · border→`color/button/border/primary--default` · radius→`radius/4` · border-width→`border-width/1` · px→`spacing/16`(또는 8) · text→`color/button/label/primary--default` · 텍스트 스타일 `Body/Body-14M`(opacity 90%).

## 1단계 — 매니페스트 (생성할 variant 전수: 16개, primary 고정)

| # | Break | Size | State | # | Break | Size | State |
|---|-------|------|-------|---|-------|------|-------|
| 1 | PC | medium | Default | 9 | PC | xxsmall | Default |
| 2 | PC | medium | Hover | 10 | PC | xxsmall | Hover |
| 3 | PC | medium | Pressed | 11 | PC | xxsmall | Pressed |
| 4 | PC | medium | Disabled | 12 | PC | xxsmall | Disabled |
| 5 | PC | xsmall | Default | 13 | Mobile | large | Default |
| 6 | PC | xsmall | Hover | 14 | Mobile | large | Hover |
| 7 | PC | xsmall | Pressed | 15 | Mobile | large | Pressed |
| 8 | PC | xsmall | Disabled | 16 | Mobile | large | Disabled |

---

## 2단계 — 바인딩 해석표 (빈칸 없음 ✅)

### 색상 (components.html 311–326 검증 · pressed=hover는 코드 확인 사실)
Figma Semantic Color V2 변수에 직접 바인딩. Light/Dark는 변수가 모드별 값 보유 → 자동 전환.

| State | fill (배경) | stroke (테두리) | text fill (글자) |
|-------|------------|----------------|-----------------|
| default | `color/button/bg/primary--default` | `color/button/border/primary--default` | `color/button/label/primary--default` |
| hover | `color/button/bg/primary--hover` | `color/button/border/primary--hover` | `color/button/label/primary--hover` |
| **pressed** | = hover (`…primary--hover`) | = hover | = hover |
| disabled | `color/button/bg/disabled` | `color/button/border/disabled` | `color/button/label/disabled` |

→ 9개 변수 전부 vars-data.ts SEMANTIC_COLOR에 실재 확인(line 379–399).

### 기하 (components.html 299–308 검증) — Semantic Number V2 바인딩
| Size | height | padding-x | font-size | radius | weight |
|------|--------|-----------|-----------|--------|--------|
| medium | `sizing/button-height/md`(44) | `spacing/padding-inline/sm`(16) | `font-size/14` | `radius/button/md`(4) | `font-weight/medium`(500) |
| xsmall | `sizing/button-height/xs`(34) | `spacing/padding-inline/xxs`(8) | `font-size/14` | `radius/button/md` | medium |
| xxsmall | `sizing/button-height/xxs`(28) | `spacing/padding-inline/xxs`(8) | `font-size/14` | `radius/button/md` | medium |
| mobile | `sizing/button-height/lg`(48) | `spacing/padding-inline/sm`(16) | `font-size/16` | `radius/button/md` | medium |

공통: border 1px solid(`border-width/default`), line-height 1, gap(icon-text) 2 — 파일럿은 텍스트 전용이라 gap 미사용.

---

## 🔤 텍스트 스타일 (출처 = V2.4, fileKey `yE5UCFEbmXJBlYJWB24Lz2`)

참고 버튼은 `Body/Body-14M` 텍스트 스타일을 사용. V3.0 신규 파일엔 없으므로 **함께 설치**해야 함(사용자 요구: "텍스트 스타일은 2.4에서 가져와야").

- **제약:** Figma 플러그인은 실행 중인 파일만 읽음 → V3.0에서 V2.4 스타일 직접 못 읽음. MCP도 V2.4가 "Cover" 페이지만 접근돼 전수 추출 불가.
- **해결(기존 export→install 패턴):** ① token-sync 플러그인에 텍스트 스타일 export 추가 → 사용자가 **V2.4에서 1회 실행** → 카탈로그 JSON → ② vars-installer가 V3.0에 `figma.createTextStyle`로 생성(font-size는 `font-size/*` 변수 바인딩).
- 버튼 파일럿 최소 의존: `Body/Body-14M`(PC 14px), `Body/Body-16M`(Mobile 16px).

## 📁 변경 대상 (구현 단계)
| 파일 | 변경 |
|------|------|
| `plugins/figma-token-sync/src/...` | (신규) 텍스트 스타일 export — V2.4에서 getLocalTextStylesAsync() → JSON |
| `plugins/figma-vars-installer/src/textstyles-data.ts` (신규) | V2.4 export 결과를 베이크한 텍스트 스타일 정의 |
| `plugins/figma-vars-installer/src/install-textstyles.ts` (신규) | createTextStyle + font-size 변수 바인딩 |
| `plugins/figma-vars-installer/src/build-components.ts` (신규) | 16-variant 생성·바인딩·combineAsVariants. 텍스트는 설치된 스타일 참조 |
| `plugins/figma-vars-installer/src/code.ts` | semanticColorMap·semanticNumberMap·textStyleMap 보존 후 build에 전달. 단계 토글 분기 |
| `plugins/figma-vars-installer/src/ui.html` | "Variables / +Text Styles / +Components" 선택 UI |
| `plugins/figma-vars-installer/manifest.json` | 권한 확인(컴포넌트·텍스트스타일 생성은 기본 권한으로 가능 예상) |
| `assets/downloads/s1-design-vars-installer.zip` | 재빌드 |
| `registry/figma/figma-map.json` | 생성 후 Button componentSetKey 역기록 |

## 🌗 다크모드 영향
색상은 Semantic 변수 바인딩이라 Figma 프레임 모드 토글 시 자동 전환. 별도 다크 variant 생성 불필요(5단계에서 검증).

## ⚠️ 삭제/비호환
없음. Phase 1(기존 Variables 설치)은 그대로. V3.0은 신규 파일이라 기존 작업물 영향 0.

---

## ❓ 확정 필요 (Human Decision)

- **HD-RF-1 (네이밍):** ✅ 해소 — 에스원 GUI 참고 파일 컨벤션 채택. Size/State/Variant/Break 4속성, Break로 PC/Mobile 분리.
- **HD-RF-2 (타이포):** ✅ 결정 — 텍스트 스타일도 설치(옵션2), 출처는 V2.4. export→install 파이프라인 구축.
- **HD-RF-3 (V2.4 스타일 추출 순서):** 미결 — 전체 카탈로그 export 먼저 vs 버튼 2개만 부트스트랩해 파일럿 먼저. ⇒ 사용자 확인 중.

## ✅ 검문소 상태
- 1단계: variant 16개 확정(primary, 4속성) ✅
- 2단계: 색·기하 바인딩 빈칸 0 ✅. 텍스트 스타일 V2.4 19개 데이터화 완료(이미지 출처) ✅
- 3단계(구현): ✅ 완료 — 플러그인 확장 빌드/타입체크 통과
- 4단계(역대조): ⏳ **사용자가 V3.0에서 플러그인 실행 후 가능** (Figma API는 내가 실행 불가 — 막히면 보고)

## 🔧 구현 결과 (2026-06-10)
신규: `textstyles-data.ts`(19) · `install-textstyles.ts` · `build-components.ts`(16-variant)
수정: `code.ts`(semanticColorMap 보존 + 텍스트스타일/컴포넌트 단계 + 플래그) · `ui.html`(옵션 2 토글)
빌드: `npm run installer:check` PASS · `npm run installer:build` → zip 갱신(code.js 50.4kb)

### 실행 방법 (사용자, V3.0에서)
1. Figma V3.0 파일에서 플러그인 import (`~/s1-design-vars-installer/manifest.json` 또는 zip)
2. 플러그인 실행 → **"Button 컴포넌트 생성"** 체크(텍스트 스타일 자동 동반) → 설치
3. 결과: Variables + Text Styles 19 + Button 16-variant 세트 생성, 화면 포커스

### 배치 (v2, 2026-06-10 — 1차 출력 wrap 난잡 피드백 반영)
- 1차: 컴포넌트 세트를 `layoutWrap:WRAP`으로 깔아 16개가 뒤죽박죽 → 정렬·모드 구분 불가 지적.
- 2차 수정: ① 컴포넌트 세트 = **깔끔한 4×4 그리드**(행=Size medium/xsmall/xxsmall/large, 열=State Default/Hover/Pressed/Disabled), 셀 132×60 가운데정렬, wrap 제거. ② **스펙 프레임** "Button / Primary — Spec" 신규 — pc_button(이미지1) 형태로 컬럼헤더(상태)·로우라벨(사이즈) + 인스턴스 매트릭스. 세트 옆에 생성, 실패해도 세트 보존(try/catch).

### 배치 (v3, 2026-06-10 — 플랫폼 구분 + 모드 연결 피드백)
- 스펙 프레임: **플랫폼(PC/Mobile) 타이틀** 먼저 → 그 하위에 사이즈(행)×상태(열). PC=medium/xsmall/xxsmall, Mobile=large. 컬럼 헤더는 플랫폼마다 반복.
- **변수 모드 연결:** 각 컴포넌트·세트·스펙 프레임·인스턴스에 `setExplicitVariableModeForCollection(Semantic Color V2, Light)` 적용 → Appearance 패널에 모드 연결됨. (figma-component-audit 동일 시그니처 (cid, modeId))

### 런타임 검증 대기 항목 (타입체크는 통과, 실제 Figma 동작은 실행 시 확인)
- `setBoundVariable("paddingLeft"/"strokeWeight"/radius)` 바인딩 적용 여부
- `combineAsVariants` 4속성(Size·State·Variant·Break) 자동 인식 + 그리드 좌표 보존
- `createInstance` 스펙 프레임 정상 배치 + 플랫폼 그룹 레이아웃
- `setExplicitVariableModeForCollection` Appearance 모드 연결 적용
- 폰트 Pretendard Regular/Medium/Bold 로드(없으면 명확한 오류 보고하도록 처리됨)

## ✅ Button 완성 (v4, 2026-06-10 — secondary·blue-line 확장)
- `primarySlots` → `variantSlots(variant, state)` 일반화. secondary·blue-line 슬롯 전부 vars-data 실재 확인(bg/border/label × default/hover + 공유 disabled), pressed=hover 동일.
- **48-variant** = 3 variant(Primary/Secondary/Blue-Line) × 4 size × 4 state. 컴포넌트 세트 12행(variant×size)×4열(state) 그리드.
- 스펙 프레임 재구성: 플랫폼 → 사이즈 소제목 → 상태 헤더 → **variant 3행**. Light/Dark 2벌.
- 함수명 `buildButtonPrimarySet` → `buildButtonSet`. installer:check·installer:build PASS.

## ⏭️ 후속
- 다음 컴포넌트 (빌더 일반형 추상화 시점)
- `figma-map.json` componentSetKey 역기록 (라이브러리 **publish 후** key 확보 가능 — 현재 미publish)
