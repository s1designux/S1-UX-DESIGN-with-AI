# 1-inventory — Table

- 작업: table
- 날짜: 2026-09-02
- 판독: ⭐ 총괄 직접 판독 (정본 `build-components.ts` 의 Table 구간을 전문 인용 — 추측 없음, 각 항목 `파일:줄` 근거). **렌더·레이아웃 주장은 이 문서에 없다.** 시각 판정은 4-verification 에서 실제 렌더로 한다.
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- Figma V3.0: 조회하지 않음 (코드 정본만으로 축·수치·토큰 확정)
- 사이트 인라인 코드(`pages/components.html`)는 **파생**이며 원본으로 복사하지 않는다(계약 `outputsAreNotCanon`).

## A. Table Cell — 정본 `buildTableCell` (build-components.ts:1960)

| 항목 | 정본 사실 | 근거 |
|---|---|---|
| 축 | Size(SM·MD) × Type(Cell·Header) × Variant(Default·Hover·Selected) = 8개. **Header 는 Default 만** | `:1961-1972` |
| 높이 | SM 38 / MD 44 | `:1967-1970` |
| 글자 | SM 13 / MD 14. Header=Medium, Cell=Regular | `:1971, :1983` |
| 글자 좌측 시작 | x = 16 (수직 가운데) | `:1985` |
| 하단 구분선 | 1px `color/table/border/default`, 셀 폭 따라 늘어남(STRETCH) | `:1986-1996` |
| 기준 폭 | 130 (Table 이 컬럼 폭으로 resize 해 씀) | `:1973, :2135` |

### 상태별 색 토큰

| Type · 상태 | 배경 | 글자 | 선 |
|---|---|---|---|
| Cell · Default | `color/table/cell/default` | `color/text/body/primary` | `color/table/border/default` |
| Cell · Hover | `color/table/cell/hover` | 좌동 | 좌동 |
| Cell · Selected | `color/table/cell/selected` | 좌동 | 좌동 |
| Header · Default | `color/table/header/bg` | `color/text/body/secondary` | 좌동 |

## B. Table(전체 조립) — 정본 `buildTable` (build-components.ts:2027)

| 항목 | 정본 사실 | 근거 |
|---|---|---|
| 축 | Size(MD 44 / SM 38) 1축 | `:2168-2171` |
| 전체 폭 | 828 = 48 + 360 + 200 + 110 + 110 | `:2093-2095` |
| 구성 | 헤더 1행 + 바디 8행 + 푸터 44 | `:2175-2190` |
| 바디 8행 상태 | Default · Hover · Selected · Default×5 | `:2173` |
| 선택 컬럼(48px) | Table Cell 미사용 전용 컬럼. **코어 Checkbox 인스턴스 재사용** (Default/Hover/Checked) | `:2113-2131` |
| 나머지 4열 | Table Cell 인스턴스를 컬럼 폭으로 resize + 텍스트 override | `:2133-2150` |
| 푸터 | 배경 `color/table/cell/default` · **Pagination 바 인스턴스**(가운데) · **SelectBox XXSM/PC/Default**(오른쪽 8px) | `:2154-2166` |
| 외곽선 | 상단 2px + 하단 1px `color/table/border/strong`. 하단선 위치 = **마지막 데이터 행 아래(=푸터 위)**, 푸터 아래가 아님 | `:2189-2196` |

## C. 토큰 — 전부 기존 정본에 존재 (신규 0건)

`vars-data.ts:562-569` — `color/table/border/default` · `border/strong` · `header/bg` · `cell/default` · `cell/hover` · `cell/selected`. Light·Dark 양쪽 값 모두 정의됨. **새 토큰 필요 없음.**

## D. Registry 메타 — `registry/components/table.json`

| 항목 | 값 | 배포 관점 |
|---|---|---|
| harnessStatus / codeStatus | implemented | 사이트 harness 존재 |
| a11yStatus | **pending** | ⚠️ 계약 `knownBlockers` 상 **approved 배포 불가** |
| darkModeStatus | stable | OK |
| 의존 코어 | checkbox (재사용 필수, 전용 체크박스 신설 금지) | checkbox=approved |
| 행동 장부 | `component-behavior.pc.json > Table` = 선택 동작만 verified. keyboard·focus·accessibility = `not-defined` | 접근성 계약 필요 |

## E. 정본 ↔ Registry ↔ 사이트 3자 차이 (판정 없이 목록만)

| # | 항목 | 정본(build-components.ts) | Registry | 사이트(파생) |
|---|---|---|---|---|
| 1 | 정렬 아이콘 | **없음** | notes: combobox_arrow 18×18 | 자체 인라인 SVG 10×14 |
| 2 | 열 정렬(가운데/왼쪽) 축 | 없음(모두 좌측 16) | `variants.header/body.align` 에 있음 | 인라인 style 로 일부 가운데 |
| 3 | 셀 좌우 여백 | 글자 x=16 | `paddingInline*` 토큰 표기 | CSS `padding: 0 12px` |
| 4 | 헤더 position(middle/last) | 없음 | variants 에 있음 | `--last` 클래스 |
| 5 | 푸터 "몇 개씩 보기" | 코어 SelectBox XXSM 인스턴스 | 언급 없음 | native `<select>` 자체 스타일 |
| 6 | 푸터 페이지네이션 | Table 컴포넌트 **안에** 포함 | 언급 없음 | 표 아래 별도 마크업 |

> 3·4 는 값·구조 차이라 **파생을 정본에 맞춘다**(하드룰 H6). 1·2·5·6 은 "정본에 없는 것을 만들지 말지"라 2-canon-readiness 의 결정거리로 올린다.

## F. 배포 의존 순서

Table 푸터는 **Pagination**(다른 세션 진행 중)과 **Select**(approved) 배포본을 재사용한다. Pagination dist 가 확정되기 전에는 3-build 의 푸터 부분을 시작하지 않는다.

## G. 미확인

- Figma V3.0 TEST 169:76 실물 대조 — 미조회(코드 정본으로 충분).
- 모바일에서 표를 어떻게 보여주는지 — **정본·Registry 모두 없음.** 이번 범위 밖으로 두거나 river 결정 필요.
