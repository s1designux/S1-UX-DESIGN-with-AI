# 5. 패턴 등록

## 결과

- 상태: `promoted`
- 패턴 ID: `pc-login`
- 이름: `PC Login`
- 등록일: 2026-10-02 (river 승인 「PC 로그인 패턴을 패턴 설치기에 넣자」, 2026-10-02)

## 승격 근거

아이디·비밀번호 입력, 입력 중 상태, 서버 판정 실패(불일치·잠금·사용 중지)는 여러 PC 웹 서비스에서 반복되는 로그인 구조다. 서비스마다 다른 것(서비스명, 보조 링크 구성, 잠금 시간 숫자)은 부품 기본 문구와 슬롯 `Links` 로 바꿔 끼우게 하고, 공통 뼈대와 상태 조합을 패턴으로 등록한다.

이 패턴은 코어 컴포넌트의 시각 스타일을 재정의하지 않는다. 코어 인스턴스(WebTabBar·LoginGNB·Footer·CI·Input·Button·Text Button)와 Semantic 토큰만 조합한다. 가운데 로그인 묶음은 **패턴 전용 부품** `PC Login Box`(COMPONENT `2730:528`) 이며 디자인가이드 정본(설치기 컴포넌트)에는 넣지 않는다(river 결정 2026-10-02).

## 코어 컴포넌트 의존성

- WebTabBar
- LoginGNB
- Footer (Platform=PC)
- CI (에스원/Blue)
- Input (Size=MD · Break=PC)
- Button (Primary · MD · PC)
- Text Button (Secondary · Default)

패턴 전용 부품: `PC Login Box` — 슬롯 `Links` (SLOT, 설명 「로그인 버튼 아래 보조 링크 자리 — 서비스마다 바꿔 끼운다」)

## 검증 근거

- 화면 7장: `4-verification.md` — pilot → 전체 7장 → 변경 1(간격) → 변경 2(WebTabBar) → 변경 3(PC Login Box 인스턴스) 델타 재검증 모두 PASS. 마지막 판정 ❌(a) 0 · ❓(c) 0 · 🟡(b) 1(링크 구분선 색).
- 패턴 부품: `reports/figma-library-build/pc-login-box/4-verification.md`
- 화면당 인스턴스 15~16개 · 외부 출처 위반 0 · 비-Pretendard 0 · 토큰 밖 색 0 (변경 3 재스캔)

## 설치기 배포 (캡처본)

- `plugins/figma-vars-installer/src/pattern-data.ts` 에 `PC_LOGIN` 추가(정본 섹션 `2703:2` + 부품 `2730:528` 을 2026-10-02 use_figma 읽기 전용으로 실측해 옮김). `PATTERNS` 목록 3번째.
- 재생기 `build-patterns.ts` 확장 — 패턴 전용 부품(`components`, 진짜 `createSlot()` 슬롯, 실패 시 경고 후 중단) · 부품 인스턴스(`local`) · 중첩 인스턴스 속성 덮어쓰기(`nestedPr`). 섹션 크기는 화면 틀 크기(PC 1920×1080)로 계산.
- 설치기는 PC 패턴도 모바일 패턴과 같은 페이지(`S-1 S/W UX Pattern`)에 넣고, 기존 규칙대로 페이지에 있는 것들 **아래**(간격 220)에 내려놓아 겹치지 않는다.

### 재생 테스트 (2026-10-02, 같은 Figma 파일 임시 페이지 — 테스트 후 삭제 확인)

| 항목 | 정본 2703:2 / 2730:528 | 재생 결과 |
|---|---|---|
| 섹션 크기 | 8440×2560 | 8440×2560 |
| 화면 순서·좌표 | 1·2·3·4 (y100) · 4a1·4a2·4a3 (y1380) | 같음 (+ 부품을 빈 칸 6440,1380 에) |
| 화면 노드 수 (1/2/3/4/4a1/4a2/4a3) | 87/96/96/87/88/88/88 | 같음 |
| 인스턴스 variant·속성·문구·보임 | — | 1·4·4a1·4a2·4a3 차이 0. 2·3 은 글자 폭 1~19px 차이뿐(아래) |
| 부품 정의 (노드 36개) | — | 차이 0 (높이 HUG 포함) |
| 슬롯 | `Links` SLOT · 설명 같음 | `Links` SLOT · 설명 같음 · 7장 모두 링크 3개 + 구분선 2개 보임 |
| 부품 출처 | 로컬 11 · 허용 원격 3~4 / 화면 | 같음 (부품 remote=false) |
| 토큰 밖 색 · 비-Pretendard 글자 | 0 · 0 | 0 · 0 |
| 재생 경고 | — | 0건 |

- 2·3 의 글자 폭 차이(입력값 `s1desig` 49→48, `••••••••` 56→37, 버튼 `로그인` 36→39)는 테스트 실행 환경에 Pretendard 가 없어 글자를 임시 폰트로 넣은 뒤 원래 글자 스타일로 되돌리면서 폭이 다시 계산되지 않은 것이다. 데이터상 폰트는 Pretendard 그대로다. Pretendard 가 설치된 데스크톱 설치기에서는 다시 확인하지 않았다.
- 같은 이유로 테스트에서는 글자 넣기만 「임시 폰트 → 원래 글자 스타일 복귀」로 감쌌다(설치기 코드 자체는 바꾸지 않음). 이 파일에는 `color/line/default` 가 옛 이름 `color/line/gray/subtle` 로만 있어 테스트에서 이 이름으로 이어 줬다.
- 하위 호환: 같은 `MOBILE_LOGIN` 캡처본을 옛 재생기(HEAD)와 새 재생기로 각각 재생해 대조 — 노드 1083 = 1083, 차이 0. 두 재생 모두 같은 종류의 환경 경고(보조 링크 글자의 Pretendard 로드 실패)만 났다.

## 등록 위치

- Registry: `registry/patterns/index.json` (`pc-login`)
- Figma: 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 `80:16697` · Section `2703:2` (화면) · Section `2730:527` (부품)

## 완성 패턴 문서

- 개요: `registry/patterns/pc-login/README.md`
- 흐름과 이유: `registry/patterns/pc-login/flow.md`
- 상태 목록: `registry/patterns/pc-login/states.md`
- 현재 문구: `registry/patterns/pc-login/copy.md`
- 콘텐츠·부품 규칙: `registry/patterns/pc-login/content-rules.md`

## 남은 것

- 링크 구분선 색 — `color/line/default` 로 확정(intent.md 변경 3, 두 갈래 (b)). 3-build.md needs-decision #1 은 이로써 닫힘.
- 정본 Input `trail` 100×100 (needs-core-update, 기존 항목).
- 이 등록·캡처본·재생기 확장은 아직 독립 검증 전이다.
