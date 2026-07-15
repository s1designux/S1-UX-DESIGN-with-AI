# 위젯 07. 개인별 출입 이력 검색 — 재고조사

- 노드: 1965:16849 / 크기: 2902×1600
- 파일: 영상출입 통합관제 최종(KOR)_v0.0.6
- 스크린샷 관찰: 사람(개인)의 출입 이력을 검색하는 위젯. 헤더(제목) → 필터바(구분 Select + 이름 검색 Input) → 건수 라벨(`총`) → **검색 결과 리스트(세로 반복, 각 행에 아바타(숨김)+텍스트 2줄)** 구조. 같은 위젯의 **2가지 가로 사이즈 변형(1×2 / 2×2)** 이 나란히 놓여 있고, 리스트 각 행의 텍스트 자리는 회색 placeholder 사각형(더미)이다.

> **읽기 방법 표기:** 색은 get_variable_defs로 바인딩된 Variable 이름을 우선 기록(정본). Tailwind 코드의 `#RRGGBB`(예: divider fallback `#d9d9d9`)는 라이트-테마 fallback이라 실제 다크 렌더값과 다를 수 있어 참고로만 병기(Variable 이름이 정본). 텍스트는 get_design_context 원문 verbatim.

---

## 사이즈 변형 2종 (한 위젯의 가로 반응형 변형)

| 변형 | 노드 | 크기(px) | 내용 구성 |
|------|------|---------|----------|
| 1×2 | 1965:16852 (`Dashboard_Widget_007_1`) | 311×378 | 헤더 + 필터바(Select 91 + Search) + `총` 라벨 + 결과 리스트(2행, 각 57h) |
| 2×2 | 1965:16874 (`Dashboard_Widget_007_1`) | 630×378 | 헤더 + 필터바(Select 91 + Search 더 넓음) + `총` 라벨 + 결과 리스트(2행, 각 57h) |

> 두 변형의 **차이는 가로 폭(311 vs 630)뿐**: 높이(378)·행 수(2)·구조 동일. 폭이 넓어지면 Search Input(182→501)·리스트 카드 Container(239→558)가 늘어난다.
> 캔버스에는 각 변형 위에 `1x2` `2x2` 와 `Default` 라는 **주석 라벨 프레임**(문서용 태그, 컴포넌트 아님 — 위젯01의 `[1x1 size widget]` 태그와 동일 성격)이 붙어 있다. 상단에 떨어진 작은 rounded-rect(1965:16904, 28×16)도 문서용 더미 태그로 보임(관찰).

---

## 요소 트리 (verbatim)

### A. Title container (최상단 배너 — 위젯01과 동일)
노드 1965:16850 (2902×166), 텍스트 1965:16851 `위젯 07. 개인별 출입 이력 검색`. **위젯01의 Title container와 동일 구조**(문서용 대제목 배너).

### B. Widget Header (위젯 헤더 인스턴스 — 두 변형 공유)
노드: 1×2=1965:16853 / 2×2=1965:16875 (마스터 인스턴스 I…;1028:61340). **위젯01의 `Widget Header`와 동일 컴포넌트 계열**(단, 위젯01 마스터는 1024:33540 — 여기 마스터 ID 1028:61340로 **다름**, verbatim 확인).

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 위젯 타이틀 | `개인별 출입이력 검색` | `color/text/title/primary` = #ecedf0 | Title/16B (Pretendard Bold 16, lh1.3) | default | — | **캔버스 대제목(`개인별 출입 이력 검색`, 띄어쓰기)과 위젯 내부 타이틀(`개인별 출입이력 검색`, 붙임)이 다름**(관찰) |
| 헤더 우측(update) | — (비어 있음) | — | — | — | — | Header+update 영역에 갱신시각·아이콘 없음(위젯06과 달리 헤더 액션 없음) |
| 구분선 | — | line (이미지 SVG, `imgLine7`) | 폭 279(1×2)/598(2×2), h0 | — | — | 헤더 하단 divider (위젯01·06과 동일 방식) |

### C. 필터바 (구분 Select + 이름 검색 Input) — 두 변형 공통
노드: 1×2=1965:16855 / 2×2=1965:16877. 가로 배치 gap6.

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| Select Box | `전체` | 텍스트 `color/form-control/text/default` = #b8babf, bg `color/form-control/bg/default` = #1c1d23, border `color/form-control/border/default` = #3e4049 | 91×28, h28, rounded-4, pl12 pr8 | default(값 채워짐) | `ic_화살표, 더보기`(77:778) 20×20 rotate90 | 구분/유형 필터. **위젯06 Select와 달리 값(`전체`)이 채워진 default 색**(placeholder 아님) |
| Search Input | `이름 입력`(placeholder) | 텍스트 `color/form-control/text/placeholder` = #55575f, bg `form-control/bg/default` #1c1d23, border `form-control/border/default` #3e4049 | flex(1×2:182 / 2×2:501)×28, rounded-4 | default(placeholder) | `ic_찾기/조회`(1183:12766) 20×20 | 이름 검색 인풋 |

### D. 건수 라벨
노드 1×2=1965:16858 / 2×2=1965:16880. 텍스트 `총` — `gray-dark/800` = #b8babf, Body/12R (Pretendard Regular 12). 리스트 위 건수 표시(관찰: `총 N건`류의 placeholder, 숫자 미포함).

### E. 검색 결과 리스트 — 핵심 반복 단위 (두 변형 공통, 2행)
리스트 컨테이너: 1×2=1965:16859 / 2×2=1965:16881 — bg `gray-dark/50` = #131418, rounded-4. 각 행 = `Button` 프레임(57h), 행 사이 divider.
예시 행 노드 1965:16860 (1×2 첫 행).

| 요소 | 텍스트(원문) | 색(Variable / fallback hex) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 행 컨테이너 | — | — | 279/598 ×57, px20 py12, gap10 | default | — | `Button` 프레임 — 클릭 가능한 결과 행처럼 보임(관찰) |
| Avatar(숨김) | `문` | — | 32×32 | hidden | — | 좌측 아바타 자리, **hidden=true → 미표시**. 내부 텍스트 `문`(이니셜 더미) |
| 이름줄 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | 239/558 ×16 | placeholder | — | 첫째 줄(이름/제목 자리) |
| 서브줄 placeholder | — (더미) | `gray-dark/300` = #2e2f38 | 239/558 ×13 | placeholder | — | 둘째 줄(부가정보 자리) |
| 행 divider | — | `Rectangle 240654738` = `color/line/gray/default` = #2e2f38 (코드 fallback #d9d9d9) | 259/578 ×1, 좌우 10 인셋 | — | — | 행 사이 구분선 |

- 행 = [아바타(숨김) + 텍스트 2줄]. 아바타가 hidden이라 현재 렌더에선 텍스트 블록만 보임. 모든 텍스트가 `gray-dark/300` placeholder(실제 이름·이력 없음).
- 1×2·2×2 모두 metadata상 결과 행 2개(`Button`)만 정의. 폭만 다르고 행 수·높이 동일.

---

## 반복/구조 관찰

1. **가로 사이즈 변형 2종**(1×2 / 2×2)이 한 컴포넌트의 가로 반응형 변형. **차이는 폭뿐**(높이·행수·구조 동일), 폭에 따라 Search Input과 결과행 Container가 늘어남.
2. **검색 결과 행(`Button` 57h)이 핵심 세로 반복 단위**. 행 = [아바타(숨김 32×32) + 이름줄 placeholder + 서브줄 placeholder]. 행 사이 divider. 리스트/검색결과처럼 보임(관찰).
3. **필터 2요소**: 구분 Select(`전체`, 값 채워진 default) + 이름 Search Input(`이름 입력`, placeholder). 위젯06과 달리 탭·Chip 없이 검색 중심.
4. **영역 구분**: ①Title container(2902 대제목 배너) ②Widget Header(제목+divider, 우측 액션 없음) ③필터바 ④`총` 건수 라벨 ⑤결과 리스트 카드. 위젯01·06과 동일한 배너+헤더+divider 프레이밍.
5. **placeholder 일관**: 결과 행의 텍스트 2줄이 `gray-dark/300`(#2e2f38) 회색 사각형(더미), 아바타는 hidden, 건수(`총`)는 숫자 없는 라벨. 실제 인물·이력 데이터는 이 시안에 없음.
6. **아이콘 처리**: 표시 아이콘은 필터의 화살표(Select)·검색(Input) 2종뿐. 아바타 아이콘/이미지는 hidden.

---

## 미확인 항목

- **결과 행 placeholder의 실제 콘텐츠**: 이름줄(×16)·서브줄(×13)이 무슨 텍스트(이름·부서·출입시각 등)인지 시안에 없음(더미) → 미확인. Avatar 내부 `문`은 이니셜 더미로 **추정**되나 hidden이라 실제 표시 방식 미확인.
- **`총` 건수 실제 값**: 라벨이 `총`(11px폭)만 있고 뒤 숫자·`건` 미포함 → 실제 검색 건수 미확인(placeholder).
- **Select `전체`의 다른 옵션**: 구분 Select가 `전체` 값만 노출. 펼침 상태·다른 옵션(임직원/방문자 등)은 이 시안에 없음(위젯06처럼 별도 Dropdown 오버레이도 없음) → 미확인.
- **결과 행 개수 정책**: 두 변형 모두 metadata상 행 2개만 정의. 실제 검색 시 행 수·스크롤 유무는 시안상 미명시(위젯06과 달리 scroll 프레임 없음) → 미확인.
- **divider·form-control 색의 다크 실제값**: divider는 코드 fallback #d9d9d9(라이트)이나 Variable은 `color/line/gray/default`(#2e2f38, 다크). Variable 이름은 확인됐으나 노드별 다크 최종 렌더값은 재확인 필요.
- **Widget Header 마스터 차이**: 위젯07 헤더 마스터(1028:61340)가 위젯01(1024:33540)·위젯06(로컬 `Header area` 프레임)과 달라, 세 위젯이 같은 헤더 컴포넌트를 공유하는지 아니면 변형·복제인지 → 매칭 판단은 Stage 2 소관(여기선 verbatim만 기록).
