# Side Nav (LNB) 3세트 — 설치기 생성기 검증 (시나리오 D)

- 검증자: 🤖 component-verifier (독립) · 2026-09-30
- 대상: `plugins/figma-vars-installer/src/build-components.ts` 미커밋 diff (buildSideNavItem · buildSideNavSubItem · buildSideNav · ICON_KEYS.panelFold · 묶음/의존성/runner) + 연동 파일
- 기준: 웹 정본 `ui-library/src/components/lnb/lnb.css`(+example·manifest) · `reports/ui-library/promoted-parts-4/workflow-state.json` lnb.figmaBuildSpec ①~⑤ · 형제 빌더(buildDivider·buildExpandableCard·buildDataTag) · H1②·H2·H3·H6②

## 판정: **FAIL** — ❌(a) 1 · ❓(c) 3 · 🟡(b)/참고 4 · BLOCKED 0

Gate 13 기록은 **하지 않았다**(한 번 기록했다가 아래 ❌ 발견 후 스스로 철회 — 기록 파일 삭제, Gate 13 은 다시 ❌ 상태).

### ❌(a) 수정 대상

| # | 무엇 | 근거 | 고칠 것 |
|---|---|---|---|
| A1 | 새 부품 속성 2개(「하위메뉴 화살표」 BOOLEAN · 「아이콘」 INSTANCE_SWAP)가 정본신설 승인 추적(Gate 34)에 안 잡힌다 | Gate 34 는 `addComponentProperty("<글자>"` 형태만 센다(`scripts/canon-addition-check.js:118`). 이번 코드는 상수(`SIDE_NAV_ARROW_PROP`·`SIDE_NAV_ICON_PROP`)로 넘겨(`build-components.ts:7584`, `:7590`) 파일 전체에서 **유일하게** 추적을 빠져나간다. 실측 `CANONADD_SUMMARY added=0`. 선례 속성(설명 보임·그림·왼쪽 칸 등)은 전부 글자 그대로 쓰고 승인 기록(`canon-additions-baseline.json` approvals)을 남겼다. | 두 호출을 글자 그대로(`addComponentProperty("하위메뉴 화살표", …)` / `("아이콘", …)`)로 바꿔 Gate 34 가 보게 한 뒤, river 발화 인용으로 `--approve` 기록(부품 3종 승인 발화로 덮을지는 ⭐ 판단 — 선례는 속성마다 따로 기록). 상수는 findOne·arrowKey 에서 계속 써도 된다. |

### ❓(c) river 결정 필요 (빌드 담당 needs-decision 6건 판정 포함)

| # | 항목 | 판정 | 이유 |
|---|---|---|---|
| ① | 펼침 폭 240·280, 로고 자리 150·178 raw | ❓(c) — **기존 미결 승계** | 웹 lnb.css 도 같은 raw 값을 들고 needs-decision 1 로 대기 중. Figma 가 웹과 같다. 새 문제는 아니나 결정 전이다. |
| ② | 접힘 글자 12(원본 11) | ✅ 해소 | river 2026-09-30 "12px 그대로 둬" 확정. 웹·Figma 모두 body/12R(자간 0) = 웹 letter-spacing normal 과 일치. |
| ③ | 선택 글자 title/14B(자간 0) vs 웹 Bold+자간 tight(-0.02em) | ❓(c) | 정본 textstyles-data.ts 에 14 Bold 자간 -2% 스타일이 없다(확인: title/14B 0%, body/14M -2%). 새로 안 만든 것은 H6② 상 맞다. 14px 기준 0.28px 차이. 선택지: (A) Figma 는 title/14B 로 두고 웹도 자간 0 으로 맞춤 (B) 정본에 14B -2% 스타일 신설(승인) (C) 차이 허용 명시. |
| ④ | 다크 로고 한 색·다크 솔리드 아이콘 Figma 자동 불가 | 🟡 한계 기록 | 로고 자리는 비어 있는 자리표시라 칠할 대상이 없고, Figma 는 모드별 그림 교체가 안 된다. 세트 설명(description)에 적혀 있다. 결함 아님. |
| ⑤ | 로고 벌 머리줄 구분선 1px 사각형, 접힌 판에도 남음 | ✅ 웹과 일치 | 웹도 접힘에서 brand 머리줄 border-bottom 을 끄지 않는다(접힘 규칙은 brand·toggle·subitems·group 만 숨김). 높이는 border-width/1 바인딩, 색 line/default. |
| ⑥ | 예시 메뉴에 웹에 없는 「패턴」 추가 + 하위메뉴를 펼친 채로 보여줌 | ❓(c) | 웹 lnb.example.html 은 개요·기반 토큰·컴포넌트(하위 2개, **닫힘**)·준비 중 4칸. 코드 주석은 "웹과 같은 메뉴"라고 적어 사실과 다르다. 부품 모양·토큰 문제는 아니고 견본 글자 문제라 결정만 필요: 「패턴」 빼기/유지, 하위메뉴 펼침 유지(열린 모양을 보여주려는 의도)/닫기. |

### 🟡 참고 (결함 아님, 기록)

1. 버전 번호 35개 부품 일괄 상승(ui-library manifest·release-log 0.14.7) — 부품 지문이 ICON_KEYS 상수 전체를 코드 구간으로 세기 때문. 실측(component-facts.json)에서 기존 세트 값 변화 0(추가만, sourceHash 1줄만 변경) 확인 → 모양 변화 없음.
2. `scripts/lib/figma-build-mock.js` 에 `description: 'IGNORED'` 추가 — 세트 설명(문서 글)을 지문에서 빼는 것. 모양 검사를 약하게 하지 않는다.
3. 하위메뉴 연 칸의 화살표를 인스턴스 안에서 rotation=90 으로 덮어쓴다(try 로 감쌈). 실제 Figma 에서 덮어쓰기가 거부되면 하위 목록은 열렸는데 화살표는 아래를 보는 모양이 된다 — **코드상 위험, 육안 미검증.**
4. Gate 32 경고 — Side Nav 크기 축(MD/LG)이 HTML 섹션과 대조 안 됨(가이드 섹션이 아직 없어서, component-page-coverage 에 예외 사유 등록됨).

## 1. 코드 대조표 (웹 lnb.css ↔ Figma 빌더 · mock 빌드 실측)

mock 빌드 결과 = `registry/components/component-guide-model.json` componentSets(생성기 mock 실행물). 세트 3개 생성, 변형 수 **8 · 3 · 8** 확인.

| 항목 | 웹 정본 | Figma 빌더 | 바인딩 | 결과 |
|---|---|---|---|---|
| 판 폭 펼침 MD/LG | 240/280 raw | 240/280 raw | 없음(토큰 부재) | ① (c) 승계 |
| 판 폭 접힘 | sizing/80 | 80 | width=sizing/80 | ✅ |
| 판 여백 | 12 12 16 / 접힘 좌우 8 | 12·12·16 / 접힘 8 | spacing/12·16·8 | ✅ |
| 판 바탕 · 오른쪽 선 | navigation/bg · 1px line/default | 같음 | strokeRightWeight=border-width/1 | ✅ |
| 머리줄 최소 높이 | 40 / brand 48 | 40 / 48 | sizing/40·48 | ✅ |
| 머리줄 간격 | 8 | 8 | spacing/8 | ✅ |
| brand 머리줄 아래 | padding 12 + 1px 선 + margin 8 | 간격 12 + 사각형 1 + 판 간격 8 | spacing/12 · border-width/1 · spacing/8 | ✅ |
| 접힘 머리줄 아래 | 16 | 16 | spacing/16 | ✅ (figmaBuildSpec ④) |
| 로고 자리 | padding-left 10, 폭 150/178 | 같음, 높이 24 자리표시 | spacing/10 · sizing/24 | ✅ (폭은 ①) |
| 접기 단추 | 32×32 · radius/6 · 아이콘 20 icon/gray-dark · 접힘은 좌우반전 | 같음 · 접힘 180° 회전 | sizing/32 · radius/6 · sizing/20 | ✅ (그림이 위아래 대칭이라 180°=좌우반전, 폴백 SVG 좌표로 확인) |
| 펼침 칸 | 최소 높이 40 · 여백 8/10 · 간격 8 · radius/6 | 같음 | sizing/40 · spacing/8·10 · radius/6 | ✅ |
| 펼침 아이콘 | 20 | 20 | sizing/20 | ✅ |
| 펼침 글자 | 14 Medium 130% tight | body/14M (14·M·130%·-2%) | 텍스트 스타일 | ✅ |
| 선택(펼침) | 바탕 없음 · navigation/label/selected · Bold | 같음 · title/14B | — | ✅ (자간은 ③) |
| 호버 | 바탕만 navigation/bg--hover | 바탕만, 글자 text/body/secondary·아이콘 icon/gray-dark 유지 | — | ✅ figmaBuildSpec ⑤ |
| 준비 중 | text/state/disabled · icon/gray-light | 같음 | — | ✅ |
| 여닫이 화살표 | 20 · icon/gray-dark · 닫힘 아래/열림 위 | 20 · 270°/90° · 기본 숨김(BOOLEAN) | sizing/20 | ✅ (🟡3) |
| 하위 목록 들여쓰기 | sizing/20+spacing/8 = 28 | 28 | spacing/28 | ✅ |
| 하위 줄 | 상위와 같은 글자·색·호버·선택 | 같음 (아이콘 없음) | 같은 바인딩 | ✅ |
| 접힘 칸 | 64×64 · padding 2 · 아이콘 24 · 간격 2 · 12 Regular 가운데 · 두 줄 허용 | 같음 (세로 쌓기, 가운데) | sizing/64 · spacing/2 · sizing/24 · body/12R | ✅ |
| 접힘 칸 사이 | 16 | 16 | spacing/16 | ✅ |
| 접힘 선택 칸 | button/bg/primary--default + button/label/primary--default · Regular | 같음 | — | ✅ figmaBuildSpec ④ |
| 접힘 시 숨김 | 로고·화살표·하위목록 | 로고 안 만듦 · 접힘 칸에 화살표 없음 · 하위목록 안 붙임 | — | ✅ |
| 색 hex | — | 없음(폴백 SVG 의 #353535 는 rebindIconColor 로 재바인딩 — 기존 선례와 동일) | 전부 Semantic Variable | ✅ H2 |
| 폰트 | Pretendard | makeBoundText → Pretendard 로드 + 스타일 바인딩 | — | ✅ H3 |

사용 변수 존재 확인(vars-data.ts): sizing/20·24·32·40·48·64·80, spacing/2·8·10·12·16·28, border-width/1, radius/6, color/navigation/bg·bg--hover·label/selected, text/body/secondary, icon/gray-dark·gray-light, text/state/disabled, button/bg/primary--default, button/label/primary--default, line/default — 전부 실재. `components:keycheck` 누락 0.

## 2. 텍스트 스타일
body/14M(14 M 130% -2%) · title/14B(14 B 130% 0) · body/12R(12 R 130% 0) — `textstyles-data.ts:49,59,62` 실재. 새 스타일 신설 없음(textstyles-data.ts 무변경).

## 3. 아이콘 키
- `ICON_KEYS.panelFold = e185bec5…` — 공식 Figma 연결로 아이콘 라이브러리(YcBbW9e0…) 1767:32 를 직접 읽어 **key 일치 확인**(COMPONENT "Property 1=Line", 부모 세트 ic_패널접기 1767:44, 24×24). 다른 아이콘들처럼 변형 key 관례.
- `registry/figma/allowed-remote-keys.json` 에 같은 key 등록, 개수 문구 21키로 갱신 ✅. DESIGN.core.md 아이콘 목록에도 반영(재생성).
- 폴백 SVG `PANEL_FOLD_SVG` 에 `icon-fallback-not-canon` 표식 ✅, 도형은 `assets/img/candidate-icons/ic_패널접기_line.svg` 와 동일 ✅. `components:iconpolicy` 위반 0.
- 라이브러리 게시(Publish) 여부는 확인 못 함 — 미게시면 설치 때 폴백 도형으로 그려지고 「아이콘」 교체 속성도 안 생긴다.

## 4. 결정론 검사 (직접 실행, 전부 종료코드 0)
installer:check(tsc) · installer:audit · installer:coverage · installer:build(zip 재생성, 컴포넌트 56종) · installer:guidecheck · installer:tooltipcheck · installer:freshness · components:keycheck · components:anatomy · components:iconpolicy · components:variantcov(65/65) · components:sizenaming(위반 0, 미계측 경고 2) · components:geometry:check · components:guide-model:check(56) · components:facts:check · components:pagecheck(미분류 0).

`npm run gate:check`: FAILED — error 2건: Gate 13(검증 기록 없음 — 이 FAIL 로 기록 안 함) · Gate 51(GNB 키보드 순서, "크롬이 시간 안에 끝내지 못했습니다" — 이번 변경과 무관한 실행 시간 초과, 크롬 누수 의심). 경고 중 Gate 34 "사라진 항목 6건"(uistate:side-nav.* 등)은 웹 부품 이름이 side-nav→lnb 로 바뀐 이전 상태에서 온 것으로 이번 diff 밖.

## 5. 기존 부품 영향
- diff 는 추가만: 새 빌더 3개 · ICON_KEYS 1줄 추가 · Navigation 묶음 멤버 3개 추가 · BUILD/ATTACH 의존성 · runner 3줄. 다른 빌더 본문 변경 0.
- component-facts.json: 기존 세트 값 변화 0(추가 + sourceHash 만).
- ICON_KEYS 는 새 키 추가뿐, 기존 키 값 변화 0.

## 확인 못 한 것
- **실제 Figma 캔버스 렌더**(오토레이아웃 패킹·회전 화살표 덮어쓰기·교체 속성 동작·스펙시트 배치)는 이 환경에서 설치기를 돌려 볼 수 없어 **육안 미검증**. mock 빌드는 라이브러리 import 실패 경로(폴백 도형)로 돈다.
- ic_패널접기 라이브러리 게시 상태.

---

## 재검증 (델타, 2026-09-30) — 판정: **PASS** — ❌(a) 0 · ❓(c) 0 신규 · 🟡 기존 한계 유지

입력: ⭐ 총괄의 A1 수정 보고. 방식: 1차 검증 때 저장한 build-components.ts diff 와 지금 diff 를 줄 단위로 대조(승계 금지 3조건 해당 없음 — 정본 지문 외 변경분 목록 확보·검사 규칙 변경 없음).

| 항목 | 확인 | 결과 |
|---|---|---|
| A1 속성 이름 리터럴 | `addComponentProperty("하위메뉴 화살표", "BOOLEAN", false)` · `addComponentProperty("아이콘", "INSTANCE_SWAP", …)` | ✅ |
| Gate 34 추적 | tracked 690 → 692 (두 속성이 이제 보인다), added=0 | ✅ |
| 승인 기록 | baseline items + approvals 2건(by river, quote "LNB 부품도 이어서 만들어줘", 세션 증거 포함) | ✅ |
| build-components.ts 그 외 변경 | 두 줄 + 견본 메뉴 주석(사실대로: 웹 예시 바탕 + 하위메뉴 펼침 + 「패턴」 추가) 뿐. 다른 줄 변화 0 | ✅ |
| ③ 선택 글자 자간 | 웹 lnb.css 선택 규칙에 `letter-spacing: var(--letter-spacing-normal)` 추가 → 웹 = Figma title/14B(자간 0). 접힘 선택 칸은 원래 normal 이라 영향 없음 | ✅ 해소 |
| ⑥ 견본 메뉴 | 주석 사실화, 내용은 ⭐ 결정으로 유지(견본 글자, 모양·토큰 무관) | ✅ 해소 |
| ① 240·280·150·178 raw | 두 폭 제공은 river 확정, 크기 토큰 부재만 남음 — 웹 needs-decision 1 과 같은 기존 대기로 둔다 | 🟡 기존 미결 승계 |
| 재실행 검사 | installer:check · components:keycheck · components:facts:check · components:guide-model:check · components:iconpolicy 전부 exit 0 | ✅ |

**Gate 13 기록 완료** — `reports/installer-build/verifications/11ff4314f59c8a9f.json` (🤖 component-verifier · structural).
**gate:check: PASSED** (경고 27, error 0).

**이번에 재확인하지 않음(1차 PASS 승계, 해당 코드 줄 동일):** 치수·패딩·간격·반경·선두께 Number Variable 바인딩, 색 Semantic Variable, 텍스트 스타일 실재, panelFold key(1767:32) 일치, 기존 부품 영향 0, installer:build·audit·coverage 등 1차 검사 묶음.
**여전히 미검증:** 실제 Figma 캔버스 렌더(특히 펼친 하위메뉴 화살표 회전 덮어쓰기), ic_패널접기 라이브러리 게시 여부.
