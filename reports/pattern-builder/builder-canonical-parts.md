# Orchestrator Summary — 패턴 빌더 화면: 손그림 부품 → 정본(배포본) 부품 교체

작업일 2026-09-18 · 브랜치 `claude/component-compliance-tokens-21b399`

## 변경 내용
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| ⭐ | builder/index.html | 도구 UI 를 배포본 부품 마크업으로 교체 — Button 28·Input(검색 2·요청 2)·Tab·Multi Toggle 2·Modal Content·Textarea. 판 번호는 대응 부품이 없어 토큰 배지 |
| ⭐ | builder/ui.js (신규) | 배포본 부품 마크업 생성기 + 런타임 물리기(mount) + 값 읽기/쓰기 + 셀렉트 접근 이름 잇기 |
| ⭐ | builder/variant-markup.js (신규) | mobile-header·gnb 변형 뼈대를 **manifest 의 htmlContract.perVariantParts 를 읽어** 조립(손으로 적은 뼈대 폐기) |
| ⭐ | builder/builder.js | 네이티브 select/input/textarea/버튼 제거 → 배포본 Select·Input·Textarea·Button·Chip·Assist Button. 탭·멀티토글·모달은 부품 이벤트로 배선 |
| ⭐ | builder/builder.css | 부품을 그리던 규칙(.pb-btn·.pb-chip-btn·.pb-tab·.pb-dialog 등) 삭제. 남은 것은 빌더 틀·카드·접힘목록·알림띠·기기 크롬뿐이며 색·글자·간격은 토큰만 |
| 🤖 | (검증) | component-verifier 실제 spawn — 1차 FAIL(❌5·❓7) → 지적 8건 수정 후 재검증 요청 |

## 교체 대응표 (river 승인 목록 순서)
| # | 손그림 | 바뀐 정본 부품 |
|---|---|---|
| 1 | 모바일 헤더·GNB 뼈대 손작성 | manifest 선언으로 조립(mobile-header 6변형 · gnb 2변형) |
| 2 | 버튼 약 28개 | Button (secondary/primary · xxsm) |
| 3 | 놓는 방식 / 보기 | Multi Toggle (sm) |
| 4 | 축 고르는 칩 | Chip (line · sm) |
| 5 | 판 번호 배지 | **대응 부품 없음** — Chip 은 누르는 토글이라 토큰 배지로 (계약 위반 회피) |
| 6 | 검색창 2개 | Input (xxsm) |
| 7 | 이름·열 이름·폭 입력 | Input |
| 8 | 드롭다운 6개 | Select (xxsm + dropdown xxsm) |
| 9 | 여러 줄 입력 2개 | Textarea |
| 10 | 컴포넌트/패턴 탭 | Tab (line · xsm) |
| 11 | 새 패턴 요청 창 | Modal Content (dual) |

## 검사기 결과
| 검사기 | 결과 | 비고 |
|------|------|------|
| 🔎 gate:check (56게이트) | ✅ PASS · 93건 | 경고 17건은 모두 기존 부채 |
| 🔎 ui:contract | ✅ PASS | errors 0 (검증 에이전트 실행) |
| 렌더 확인 | ✅ | PC 1600·모바일 360 틀·라이트/다크 · 콘솔 오류 0 |

## 검증에서 잡혀 고친 것 (🤖 component-verifier 3회)
1차 FAIL → a1 표 열 "오른쪽" 정렬(배포본 미구현 값) · a2 검색칸 네이티브 ✕ 중복 · a3 Home 배경 표식이 미리보기와 내보내기에서 어긋남 · a4 변형 뼈대 폴백 미구현 · a5 죽은 bleed 규칙 · c1 Chip 을 배지로 오용 · c4 드롭다운 크기 불일치 · c5 트리거 aria-label 이 고른 값을 가림
2차 FAIL → c5 수정 회귀: 표 열 정렬 드롭다운이 접근 이름을 잃음 → 열 편집 칸을 라벨 있는 칸으로 바꾸고 열 제목까지 이름에 잇는다("열 2, 정렬, 가운데")
3차 **PASS** — 남은 지적 없음(열려 있는 것은 아래 HD 3건뿐)

## 미결 사항 (Human Decision 필요)
- HD-1: 요청 창 본문 — 배포본 모달의 "컨텐츠 영역"은 회색 빈 칸 자리다. 거기에 입력 양식을 넣으면서 그 칸의 배치를 화면 쪽에서 덮어쓰고 있다. (A) 지금처럼 화면이 덮어쓴다 (B) 모달 계약에 "본문 자리" 규칙을 추가한다. 안 정하면 A 로 둔다.
- HD-2: 셀렉트의 "값 있음" 표시를 화면이 미리 켜 둔다(data-filled). 빌더 셀렉트는 늘 값이 있어 결과는 맞지만, 원래 런타임이 켜는 표시다. (A) 그대로 (B) 런타임에 맡기고 첫 선택 전에는 빈 모양. 안 정하면 A.
- HD-3: 모바일 헤더 7번째 유형(Home / Title + 1 Icon)이 배포본 목록(manifest)에는 없고 CSS 에만 있다. 빌더는 목록을 정본으로 읽어 그 유형을 못 만든다. (A) 배포본 목록에 추가 (B) 그대로. 안 정하면 B — 빌더에 그 유형이 안 보인다.

## 검증 안 한 범위
드래그앤드롭(클릭 배치만 확인) · 패턴 불러오기(카탈로그 비어 있음) · 링크 복사(클립보드 권한) · 미리보기 캔버스의 라이트/다크 독립 전환(기존 한계, 이번 변경과 무관)
