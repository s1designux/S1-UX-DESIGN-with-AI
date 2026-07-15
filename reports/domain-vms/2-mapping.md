# Stage 2 매핑 — 영상 위젯 요소 타입 × core (5버킷 분류)

- 입력: `reports/domain-vms/1-inventory/widget-01~11.md` (📖 source-reader 통합 판독)
- core 존재 목록(정본 `registry/components/index.json`): button · checkbox · radio · toggle · chip · input · select · textarea · date-picker · time-picker · table · pagination · dropdown · tab(Line Tab) · gnb (15개)
- 분류 기준: ✅치환 / 🧩패턴(조합) / 🔧core확장(needs-core-update) / 🆕video도메인 / ❓애매(HD). "다른 서비스도 쓸까?"↑=공통, vms특화=도메인.
- 색: 인벤토리가 색을 전부 **Variable 이름 정본**으로 기록(미바인딩 raw hex는 `#424547` 1건뿐 → APPROX visual-gray/400, w09 hidden 툴팁). → 색 역매핑은 사실상 완료(기존 바인딩 확인).

---

## ✅ Core 그대로 치환 (논의 불필요 — 내가 확정)

| 요소 타입 | → core | 근거(토큰 이미 바인딩) | 위젯 |
|---|---|---|---|
| Select Box | `select` | `color/form-control/*` 바인딩, 마스터 1027:35847 | 02·05·06·07 |
| Search Input | `input`(Search) | `color/form-control/*`, `ic_찾기/조회` | 06·07·08 |
| Chip (line) | `chip` | `color/chip/line/*` 바인딩, 마스터 1027:34274 | 06·08 |
| 추가 버튼(inline) | `button` primary | `color/button/*primary--default` | 08 |
| 아이콘 | 라이브러리 인스턴스(이미) | ic_* 노드 인스턴스 | 전 위젯 |

## 🧩 Core 조합 = 패턴 (새 컴포넌트 안 만듦)

| 패턴 | 조합 | 위젯 |
|---|---|---|
| 필터바 | Select + Search | 05·06·07·08 |
| 리스트 필터 스택 | Tab + Chip + 필터바 + 리스트 | 06·08 |

## 🔧 Core 확장 후보 (needs-core-update — **core 스펙 확인 필요, 임의 구현 금지**)

| 요소 | core | 확인할 것 | 위젯 |
|---|---|---|---|
| Tab (카운트 뱃지) | `tab`(Line Tab) | Line Tab에 **원형 카운트 뱃지** variant 있나? 없으면 보강 | 06·08 |
| Table (특수 셀) | `table` | table cell이 **임의 콘텐츠(게이지·평균 dash)** 허용? 허용=🧩조합 / 불가=cell slot 보강 | 02·04·05·10 |
| FAB(원형 플로팅) | `button` | button에 **원형/FAB** variant 있나? 없으면 보강 or 도메인 | 11 |

> 이 3건은 이번 라운드 **빌드 대상 아님**(core 재사용 항목). core 팀 확인 사항으로 기록. Stage 4 전 core 스펙 대조.

## 🆕 Video 도메인 고유 — **이번 라운드 (공유 핵심)**

| # | 컴포넌트(제안명) | 토큰(정본 Variable) | 변형 | 위젯 | 결정필요 |
|---|---|---|---|---|---|
| 1 | **Video/Widget Header** | title `text/title/primary`, 시각 `text/body/tertiary`, 아이콘 `icon/gray` | 마스터 2종(제목+시각+새로고침 / 제목+선만) → **통합+액션 variant** | 01~11 | HD-1 |
| 2 | **Video/Widget Shell** | bg `gray-dark/100`, border `line/gray/subtle`, radius 8 | 사이즈 1×1/1×2/2×1/2×2 | 01~11 | — |
| 3 | **Video/List Card Row** | placeholder `gray-dark/300`, divider `line/gray/default` | 내부 3형(썸네일/아바타/메타) | 06·07·08 | HD-3 |
| 4 | **Video/Segment Gauge** | 채움 `blue-dark/350`/`green-dark/350`, 빈칸 `gray-dark/300` | 3분할, 레벨 색 | 04·10 | HD-4 |

> **Title container(위젯 그룹 대제목 배너, 2902×166)** — 인벤토리 판독상 **"시안 문서용 태그(컴포넌트 아님)"**. → 등록 대상에서 **제외 권장**(HD-2). 5번째 자리는 아래 backlog 상위(Alert 또는 요약 지표 블록)로 대체 제안.

## 🆕 Video 도메인 고유 — **BACKLOG (다음 라운드)**

Alert 토스트(01·02·03·04, ※공통 승격 후보) · 요약 지표 블록(02·03·05·10) · 영상 타일 그리드(09, video signature) · 메모 항목(11) · 방문/등록 유형 3종(02·03) · 기기 카테고리 타일(01) · 이상상태 리스트 행(01) · 점수 게이지(10, 형태 미확인) · 지표 아이콘 타일(10) · 색 점 범례(소품)

## ❓ 애매 / 범위 밖 → HD

| 항목 | 상황 | 결정 |
|---|---|---|
| 그래프(꺾은선/막대) 03·05 | river: 차트 video 포함이나 **후속**. 단 **선·막대 색이 SVG stroke라 판독 불가(미확인)** → 색 확정하려면 figma-inspector 재조사 or 디자이너 색 지정 필요 | HD-6 |
| 툴팁(hover)·hidden 요소 | 오버레이·기기·유형 아이콘 대부분 hidden → 컴포넌트에 포함할지 | HD-7 |
| placeholder(더미) | 숫자·차트 자리 회색 더미 → 컴포넌트의 "빈 상태(empty)"로 정의할지 | HD-8 |
| w09 '이상 발생' | 이상상태를 **색으로 표현 안 함**(red/status 토큰 0) → 색으로 개선할지 | HD-9 |

---

## HD 목록 (river 결정) — ✔ 확정

- **HD-1 Widget Header 통일** ✔ — **하나로 합치고 '오른쪽 액션 있음/없음' 변형**으로. (river veto 없음)
- **HD-2 Title container 제외** ✔ — **등록에서 제외**(시안 문서용 라벨). (river 승인)
- **HD-2b 5번째 컴포넌트** ✔ — **요약 지표 블록(Summary Metric Block)**을 5번째로. (river 선택)
- **HD-3 리스트 카드 행 구조** ✔ — **하나의 컴포넌트 + 변형 3개**(썸네일/아바타/메타). (river veto 없음)
- **HD-4 게이지 레벨 색** ✔ — **컨펌 안 된 색체계라, 지금은 각 레벨을 "가장 가까운 foundation 토큰"으로 임시 매칭**(코드 주석/문서에 `provisional·미확정` 표기). 색 체계는 추후 반영. (river 결정)
- **HD-6 그래프 색(backlog)** — 꺾은선/막대 색 판독 불가(SVG). 후속 라운드 figma-inspector 재조사 or 색 지정 필요.

## ✅ 이번 라운드 최종 빌드 대상 (video 도메인 5개)
1. **Video/Widget Header** — 통합 + 액션(있음/없음) 변형
2. **Video/Widget Shell** — 사이즈 변형(1×1/1×2/2×1/2×2)
3. **Video/List Card Row** — 변형 3(썸네일/아바타/메타)
4. **Video/Segment Gauge** — 3분할, 레벨 색은 최근접 foundation 임시(provisional)
5. **Video/Summary Metric Block** — 요약 지표(전체합계·평균대비), 위젯02·03·05·10 반복

> Title container 제외. Alert·영상타일·메모항목·유형3·기기타일·점수게이지 등은 backlog. Tab뱃지·Table특수셀·FAB는 core 확인 항목(이번 빌드 아님).
