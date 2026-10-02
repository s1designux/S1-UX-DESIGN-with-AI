# PC Login Box — 빌드 계획 (figma-library-build 2단계)

> river 결정 2026-10-02: 「아이디 저장은 빼고 처음에 줬던 원본처럼 회원가입, 아이디찾기, 비밀번호 찾기가 표출되도록 해주고, 이 묶음 영역은 슬롯기능 적용해줘」 → 선택지 중 「로그인 묶음 부품으로 진행해줘」.
> 범위: **패턴 전용 부품** — Figma 파일 `cysG5U1udpQqVagYY1hWHW` 의 Patterns PC 페이지(80:16697)에만 둔다. 디자인가이드 정본(`build-components.ts`·설치기 컴포넌트 목록)에는 **넣지 않는다**(river 선택).
> 1단계 재고조사 근거: `reports/screen-rebuild/login/pc-web/0-intent-sources.md` §D(로컬 정본 세트), `ref/compare.md`(기준 자료 2445:13768 수치).

## 부품 정의 — COMPONENT 1개 `PC Login Box` (변형 없음)

| 순서 | 자식 | 정본 | 값 |
|---|---|---|---|
| — | 루트 | COMPONENT | VERTICAL 오토레이아웃, 폭 300 FIXED, 높이 HUG, 가로 가운데, 채움 없음 |
| 1 | CI | CI Brand=에스원 Color=Blue | 가운데 |
| 2 | Spacer / CI-Fields | 프레임 | 높이 34 |
| 3 | Fields | 프레임 VERTICAL itemSpacing 10, FILL | 아이디 Input(Size=MD Break=PC State=Default, placeholder `아이디를 입력해 주세요.`, field FILL) · 비밀번호 Input(같고 Password Icon=true, placeholder `비밀번호를 입력해 주세요.`) |
| 4 | Spacer / Fields-Login | 프레임 | 높이 32 (기준 자료 비밀번호 칸→버튼 32) |
| 5 | Button / 로그인 | Button Variant=Primary Size=MD Break=PC State=Disabled | FILL, 문구 `로그인` |
| 6 | Spacer / Login-Links | 프레임 | 높이 16 (기준 자료 버튼→링크 16) |
| 7 | **SLOT `Links`** | `createSlot()` (설치기 `makeSlot` 과 같은 배선) | HORIZONTAL, 가로 가운데, FILL 가로·HUG 세로. 기본 내용 = Text Button(Variant=Secondary State=Default) `회원가입` · 구분선 · `아이디 찾기` · 구분선 · `비밀번호 찾기` |

- 구분선: 1×12 RECT, 색은 기준 자료 #d9d9d9 에 해당하는 Semantic 토큰(모바일 로그인 패턴의 구분선과 같은 `color/line/default` 가 맞는지 값 배선으로 확인). 링크 사이 간격은 기준 자료 2445:13768 링크 줄을 실측해 그대로.
- 슬롯 설명(description): `로그인 버튼 아래 보조 링크 자리 — 서비스마다 바꿔 끼운다`.
- 부품 위치: Patterns PC 페이지, Section `Pattern / PC Login` 왼쪽(겹치지 않게) 새 Section `Pattern / PC Login — 부품` 안.

## 화면 쪽 변경 (screen-rebuild 변경 3 — 부품 완성·검증 뒤)

7장 각각 Body 안의 `LoginBox` 프레임을 `PC Login Box` 인스턴스로 교체. 화면별 차이는 인스턴스 안 덮어쓰기로만:
- Input 상태·입력값·안내 문구, Button 상태 — 기존 `2-mapping.md` 화면별 표 그대로
- 아이디 저장 줄 없음
- 슬롯: 인스턴스에서 기본 링크 3개가 보이는지 확인. 비어 나오면 같은 내용으로 채운다.

## HD

- 0건 (river 결정 완료).
