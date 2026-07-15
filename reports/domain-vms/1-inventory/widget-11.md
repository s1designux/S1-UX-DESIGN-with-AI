# 위젯 11. 메모 — 재고조사

- 노드: 1965:17492 / 크기: 2902×1600
- 파일: 영상출입 통합관제 최종(KOR)_v0.0.6
- 스크린샷 관찰: 짧은 메모/메시지를 리스트로 쌓아 보여주고 우하단 파란 `+` 버튼으로 추가하는 관제 대시보드 위젯. 같은 위젯의 **2가지 사이즈 변형(1×1 / 1×2)** 이 가로로 나란히 배치돼 있다. 메모 항목은 대부분 회색 placeholder 2줄(제목+본문 자리)이며, 각 변형의 **마지막 항목에만** 실제 예시 텍스트(`냉방기 점검 요청 접수` / `5/19 18:40`)가 들어 있다. 리스트는 세로 스크롤(우측 스크롤바), 우하단에 원형 `+`(추가) 버튼이 떠 있다.

> **읽기 방법 표기:** 색은 get_variable_defs로 바인딩된 Variable 이름을 우선 기록(정본, 다크 해석값). Tailwind 코드의 `#RRGGBB`는 라이트-테마 fallback이라 실제 다크 렌더값과 다를 수 있어 참고로만 병기. 텍스트는 get_design_context 원문 verbatim.

---

## 사이즈 변형 2종 (한 위젯의 반응형 변형)

| 변형 | 노드 | 크기(px) | 내용 구성 |
|------|------|---------|----------|
| 1×1 | 1965:17503 (`Widget_메모`) | 311×185 | 헤더 + `Scroll container`(메모 항목 3개[placeholder 2 + 실데이터 1] + 항목 사이 divider + `+`버튼 + 스크롤바) |
| 1×2 | 1965:17524 (`Widget_메모`) | 311×378 | 헤더 + `Scroll container`(메모 항목 7개[placeholder 6 + 실데이터 1] + divider + `+`버튼 + 스크롤바) |

> 캔버스에는 각 변형 좌측/상단에 `1x1` `1x2`(1965:17499/17501) 및 `[1×1 size widget]` `[1×2 size widget]`(1965:17495/17497) 주석 라벨 프레임이 붙어 있다(문서용 태그, 컴포넌트 아님). 위젯10과 달리 **2×2 변형은 없음**(관찰).

---

## 요소 트리 (verbatim)

### A. Title container (문서용 배너 — 위젯01·10과 동일 패턴)
노드 1965:17493 (2902×166). 내부 텍스트 1965:17494 (`Title text`) = 스크린샷상 `위젯11. 메모` (문서 타이틀, 위젯 본체 밖 상단 배너).

### B. Widget Header (공통 — 2개 변형이 동일 인스턴스 재사용) — **위젯01·10과 동일**
인스턴스 노드: 1×1=1965:17504 / 1×2=1965:17525 (name `Widget Header`, 위젯01·10의 Widget Header core 인스턴스와 동일 컴포넌트로 관찰).

| 요소 | 텍스트(원문) | 색(Variable / fallback) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|------|
| 위젯 타이틀 | `메모` (인스턴스 override, 스크린샷) | `color/text/title/primary` = #ecedf0 | Title/16B (Pretendard Bold 16) | default | — | 위젯01·10과 동일 헤더, 타이틀만 override |
| 갱신 시각/우측 액션 | (스크린샷상 명확히 안 보임) | — | — | — | — | 위젯01·10 헤더 구조 동일 추정(내부 인스턴스 미전개) |

> 헤더 내부 개별 노드는 인스턴스라 metadata에 펼쳐지지 않음 — 위젯01·10과 동일 구조로 관찰.

### C. Scroll container — 메모 리스트 (1×1: 1965:17505 / 1×2: 1965:17526)
컨테이너 배경 `gray-dark/50` = #131418, radius 4px, overflow-clip. 내부 `Content container`(세로 스택, gap 없음) + 우하단 `Button container`(absolute) + 우측 `scroll`(absolute).

**메모 항목 (Message item) — placeholder형 (반복 단위)**
1×1 예시 1965:17507 / 1×2 예시 1965:17528. 항목 = 세로 2줄(padding 10×12, gap 2, radius 6).
| 요소 | 색(Variable / fallback) | 크기 | 상태 | 관찰 메모 |
|------|------|------|------|------|
| 제목 줄 placeholder | `gray-dark/300` = #2e2f38 | 255×16 (w-full) | placeholder | 메모 제목 자리(관찰) |
| 본문 줄 placeholder | `gray-dark/300` = #2e2f38 | 255×13 (w-full) | placeholder | 메모 본문/시각 자리(관찰) |

**메모 항목 (Message item) — 실데이터형 (각 변형 마지막 항목만)**
1×1: 1965:17517 / 1×2: 1965:17558. verbatim:
| 요소 | 텍스트(원문) | 색(Variable / fallback) | 폰트 | 관찰 메모 |
|------|------|------|------|------|
| 메모 제목 (`Message text`) | `냉방기 점검 요청 접수` | `color/text/title/primary` = #ecedf0 (fallback #202020) | Pretendard Regular 12 (Body/12R, lh1.3) | ellipsis 처리 |
| 메모 시각 (`Message time`) | `5/19 18:40` | `color/text/body/secondary` = #b8babf (fallback #353535) | Pretendard Regular 10 (Body/10R, ls 0.2) | 제목 아래 타임스탬프 |

**항목 사이 divider (Message item container)**
1×1: 1965:17510/17515 / 1×2: 1965:17531/17537/17541/17546/17551/17556. 각 1px, px 6.
| 요소 | 색(Variable / fallback) | 크기 | 관찰 메모 |
|------|------|------|------|
| 구분선 (`Message item background`) | `color/line/gray/default` = #2e2f38 (fallback #d9d9d9) | 267×1 | 항목 간 구분선 |

**추가 버튼 (Button container) — 우하단 플로팅**
1×1: 1965:17520 / 1×2: 1965:17561. absolute, 우하단.
| 요소 | 색(Variable / fallback) | 크기 | 상태 | 아이콘 | 관찰 메모 |
|------|------|------|------|------|------|
| 버튼 배경(원형) | `color/button/bg/primary--default` = #3070d8 (fallback #1d6ceb) | 34×34, padding 7, radius full | default | — | 파란 원형 FAB(관찰) |
| 더하기 아이콘 | (아이콘 fill, `base/white`=#ffffff 계열) | 20×20 | default | `ic_더하기` (28:18280, 라이브러리 인스턴스) | 메모 추가 액션 |

**스크롤바 (scroll)**
1×1: 1965:17522 / 1×2: 1965:17563. absolute 우측, 81 높이 트랙 + 썸 `Scroll bar` 4×36, `color/line/gray/strong` = #35363f (fallback #c4c4c4), radius 99.

---

## 반복/구조 관찰

1. **사이즈 변형 2종이 한 컴포넌트의 반응형 변형**(1×1 / 1×2). 헤더는 동일 `Widget Header` 인스턴스 공유 → **위젯01·10과 동일한 core "Widget Header"** 재사용. (위젯10과 달리 2×2 없음)
2. **핵심 반복 = `Message item`(메모 항목)**. 항목 = [제목 줄 + 본문/시각 줄] 2줄. 항목 사이에 1px divider(`Message item container`)가 삽입되는 [item, divider, item, divider, item…] 반복 구조. 1×1=3항목(divider 2), 1×2=7항목(divider 6).
3. **placeholder vs 실데이터**: 각 변형의 **마지막 항목만** 실제 텍스트(`냉방기 점검 요청 접수` / `5/19 18:40`), 나머지 앞 항목은 회색 2줄 placeholder(`gray-dark/300`). 실데이터형 항목은 제목=Body/12R + 시각=Body/10R 2줄 구조로, placeholder 2줄과 위치가 대응(관찰).
4. **플로팅 `+` 버튼**: 우하단 absolute 원형 버튼(`color/button/bg/primary--default`, ic_더하기). 두 변형 공통 — 메모 추가 액션(관찰).
5. **스크롤 리스트**: `Scroll container`(gray-dark/50 배경, radius 4) + 우측 스크롤바. 리스트가 컨테이너보다 길어 스크롤됨을 암시(1×2 Content 364px > 컨테이너 305px)(관찰).
6. **네이밍이 시맨틱**: 위젯10과 달리 프레임 이름이 `Message item`/`Message text`/`Message time`/`Button container`/`Scroll container` 등 의미 기반 — 정리된 컴포넌트 구조로 관찰.

---

## 미확인 항목

- **메모 항목의 실제 콘텐츠 다양성**: 실데이터가 `냉방기 점검 요청 접수`/`5/19 18:40` 1건뿐 — 다른 메모 예시·상태(읽음/미읽음 등) 시안엔 없음(나머지 placeholder) → 미확인.
- **`+` 버튼 클릭 후 동작/입력 UI**: 메모 작성 입력창·에디터·다이얼로그가 이 시안엔 없음(추가 버튼만) → 미확인. (위젯 성격상 "메모=텍스트 입력/에디터" 예상됐으나, 시안엔 **읽기 전용 리스트 + 추가 버튼**만 존재)
- **Widget Header 우측 액션**: 스크린샷상 위젯10처럼 갱신시각·새로고침이 있는지 명확히 안 보임 — 내부 인스턴스 미전개라 위젯01·10 동일 구조로 관찰만 → 부분 미확인.
- **`Message item` hover/selected/삭제 등 상태**: 각 항목의 인터랙션 상태 변형이 시안에 없음(Default 리스트만) → 미확인.
- **더하기 아이콘 색의 최종 바인딩**: `ic_더하기`가 흰색(base/white)인지 노드 개별 fill 미조회 — 파란 버튼 위 흰 아이콘으로 스크린샷 관찰, Variable 이름은 미확정 → 부분 미확인.
- **line·body 색의 최종 라이트/다크 바인딩**: 코드 fallback(#d9d9d9/#353535/#c4c4c4)은 라이트값, get_variable_defs는 다크 해석(#2e2f38/#b8babf/#35363f) — Variable 이름 확인, 노드별 최종 렌더값은 테마 컨텍스트에 따름.
