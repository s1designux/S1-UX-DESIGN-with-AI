# 1-inventory — Modal (공통 팝업) 라이브러리 빌드

> 1단계 재고조사 · 2026-07-03 · 규격 정본: `reports/modal-component-spec.md` + `registry/components/modal.json`

## A. 원본(레거시) 재고조사 — 완료

레거시 파일 `P8YvnCdGkQLDNVQhW74ZZW` 3세트 분석(get_screenshot + get_variable_defs + get_metadata).

### 세트 1 — pc_modal_공통팝업 (6361:84296), 작은 모달 5종 (전부 360px)
| state | 크기 | 푸터 | 본문 |
|-------|------|------|------|
| 필수 항목 미입력 (6361:84295) | 360×174 | 1개(확인) | 한 줄 텍스트 |
| 중복 안내 (6411:169406) | 360×192 | 1개(확인) | 두 줄 텍스트 |
| 입력취소 (6388:162511) | 360×192 | 2개(아니오·네) | 두 줄 텍스트 |
| 마감취소 (8887:230223) | 360×192 | 2개(아니오·네) | 두 줄 텍스트 |
| 삭제 (6443:141123) | 360×192 | 2개(아니오·네) | 두 줄 텍스트 |

### 세트 2 — pc_modal_로그인 공통팝업 (7612:42720)
- 360px 다수: 비밀번호 조건(360×228, 불릿)·인증문자 안내(360×282, 불릿+텍스트)·비밀번호 변경 완료·아이디 찾기 실패·회원정보 불일치·인증번호 전송 완료·인증완료·인증 실패·비밀번호 찾기 실패·저장 완료 (전부 1개 버튼 확인, 텍스트/불릿)
- 다운로드 예시(이름 **"미사용-기획확인용"** = 기획검토용): 360×192 / 440×216(라디오) / 440×378(라디오+폼표: 조회기간·기간상세·시간·회사명, 날짜/시간 선택·셀렉트)

### 세트 3 — 지정 노선 추가 (6495:217531), 큰 모달 991px
- 헤더: "권선동선행초교/권선자이_K1" + ✕
- 본문(2컬럼): 좌=지도 이미지 / 우=지정노선 폼(명칭 인풋·정보 링크) + 운행정보 데이터표(차량번호·시작·종료·실운행km·지정노선등록, 빈상태 "날짜를 선택해 주세요") + 날짜 선택
- 푸터: 2개(취소·저장)

### 실측 토큰 (레거시 변수명 → 정본 매핑은 §C / registry/components/modal.json tokens)
- 제목 title/16B, color/text/title/primary · 본문 body/14R, color/text/body/primary #353535 · 닫기 color/icon/gray-dark #353535 sizing/icon/24
- radius/8 · padding inline/lg=24 · block/md=20 · 버튼사이 cluster/xxs=8
- 버튼 primary #1d6ceb / secondary #fff+border #d9d9d9, 높이 sizing/28(→규격 h34로 통일), radius/4, 라벨 body/12M
- 표: color/data/border/light #e9e9e9 / strong #353535 · 폼: color/form-control/* · 강조 color/text/state/accent #1d6ceb

## B. 빌드 대상(규격 확정본)

**변형세트: 크기 4단계 × 푸터 2종 = 8 variant (모달 껍데기)**
- size: S(360) / M(440) / L(1000) / XL(1200)
- footer: single(버튼1) / dual(버튼2)
- 껍데기 = 헤더(제목+✕) + 본문 슬롯 + 푸터. 본문은 예시 인스턴스로 콘텐츠 유형 시연.
- 세로: 고정없음+최대 85vh(초과 시 본문 스크롤) — Figma 정적 표현은 대표 높이로, 스크롤 규칙은 문서 명시.

## C. 타깃 라이브러리 현황 — 🔍 figma-inspector 조사 완료 (2026-07-03)

**읽기 MCP 한계(빌드 방식에 영향):** ①페이지 자식 라이브 나열 불가(데스크톱에 `---공통---` 80:16696 1개만 로드, 열면 빈 canvas) → 섹션 목록·빈 공간 라이브 검증 불가 ②`get_variable_defs`는 variableId 미제공·number(radius/spacing) 변수 미노출 → **variableId는 빌드 시 플러그인 API 이름 조회로 확정** ③`search_design_system`은 외부 게시본만.

| 항목 | 결과 |
|------|------|
| 페이지 | `---공통---`(80:16696)만 조회. "Core Component" 이름 페이지 미확인. 컴포넌트는 이 페이지 안 카테고리 **섹션**으로 존재 |
| Navigation 섹션(직전 빌드) | `687:18905` x=2320 y=0 w=2296 h=3084 (전역 x 2320~4616). Mobile Bottom Nav 세트 723:6 이 안 y≈2680 |
| 닫기 아이콘 | **`ic_닫기`** V2.2, **component_set**, componentKey **`fecb5506e06428f1801dbe092321a65520e856a9`** (헤더 ✕ 적합). 세트 내부 variant 축 미조회 |
| Button | 이 파일 로컬 빌드(Actions). variant 축 Size(xxsmall28·**xsmall34**·medium44·large48)·State·Variant(Primary·Secondary·Blue-line)·Break. **h34=Size=xsmall**. 이름 기반 인스턴스 참조 |
| 로컬 확인 색 토큰(navigation 바인딩 실측) | color/icon/gray-dark #353535 · color/text/title/primary **#202020** · color/text/body/primary #202020 · color/line/gray/subtle #e9e9e9 · color/bg/level-1 #131418(dark) |
| 로컬 미확인(빌더 이름조회 예정) | color/bg/level-0 · color/overlay · color/text/state/accent · button color 5종 · radius/8 · spacing/24·20·8 (설치기 정본이라 존재 유력) |
| 네이밍·배치 규약 | 슬래시 폴더(`Shell/StatusBar`), variant `Size=…,State=…` combineAsVariants, Light 세트 + `{name} — Spec Dark` 프레임(bg=bg/level-1, Dark explicit), 카테고리 SECTION 가로 컬럼, 세트 위 이름 라벨. 색=Variable 바인딩·폰트 Pretendard |

**충족도:** 규약·아이콘·Button축·주요 색토큰 확보. **미해결 = ①배치 좌표(페이지 자식 나열 불가 → HD) ②일부 토큰 로컬 존재/ID(빌더 이름조회로 확정).**

→ 검문소 1 통과: 배치 위치만 사용자 확인 필요(2-plan.md HD-A).
