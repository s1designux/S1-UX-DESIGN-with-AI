# MoDU APP 모바일 로그인 — 2단계 정본 매핑

## 기준과 스냅샷

패턴의 명세 기준은 현재 Figma 설치 결과가 아니라 아래 정본 순서다.

1. `plugins/figma-vars-installer/src/build-components.ts`
2. 위 정본에서 생성된 `registry/components/component-guide-model.json`
3. `registry/tokens/*`, `registry/content/*`, `registry/figma/allowed-remote-keys.json`
4. 대상 Figma `Core`의 로컬 컴포넌트는 위 정본과 구조가 일치할 때만 인스턴스 생성에 사용

조사 시점 스냅샷:

- Git: `b002574`
- `build-components.ts` SHA-256: `a459dc6e839746863037aa7e6cb6725a51aaf44fa95c1b0619d7a7110e1d9a26`
- `component-guide-model.json` SHA-256: `5b7c01051c4b2bee947dfc2df3cd743c7963f346e29dc0fade9b4da85807e885`
- 정본 생성 검사: 42개 컴포넌트 일치
- 설치기 구조 검사: PASS
- 대상 Figma: `cysG5U1udpQqVagYY1hWHW`
- 배치 페이지: `Patterns Mobile(준비중)` (`173:2431`)

> 설치기 재실행으로 Figma nodeId와 key가 바뀔 수 있다. 빌더는 아래 관찰 ID를 무조건 재사용하지 않고, 빌드 직전에 `Core` 페이지에서 세트 이름·변형축·`remote=false`를 다시 확인한다. 정본과 다르면 설치본을 따라가지 않고 `needs-core-sync`로 중단한다.

## 정본 ↔ 현재 설치본 구조 대조

| 정본 세트 | 정본 변형축 | 현재 로컬 세트(관찰) | 구조 | 사용 변형 |
|---|---|---|---|---|
| StatusBar | `Platform=App/Web` | `1545:6565` · local | 일치 | `Platform=App` |
| NavBar | `Platform=App/Web/App + Keyboard/Web + Keyboard` | `1545:6664` · local | 일치 | 기본 화면은 `Platform=App`, 입력 화면은 `Platform=App + Keyboard` |
| CI | `Brand=에스원/삼성`, `Color=White/Blue/Dark` | `1545:6723` · local | 일치 | `에스원 / Blue` |
| Footer | `Platform=PC/Mobile` | `1545:6826` · local | 일치 | `Platform=Mobile` |
| Button | `Size/State/Variant/Break` 48변형 | `1545:8242` · local | 일치 | `LG / Mobile` |
| Input | `Size/State/Label/Message/Break` 112변형 | `1546:10988` · local | 일치 | `MD / Mobile` |
| Modal | `Footer=Single/Dual` | `1546:17971` · local | 일치 | 문구와 버튼 수에 따라 선택 |
| Mobile Bottom Nav | `state=unselected/selected` | `1545:7537` · local | 일치 | 화면별 선택 상태 |

## 요소 → 정본 매핑

| 원본 요소 | 분류 | 정본 세트·변형/구현 | 색 매핑 | confidence | 아이콘 | 비고 |
|---|---|---|---|---|---|---|
| 화면 배경 | 토큰 프레임 | `360×780` 화면 프레임 | `#FFFFFF` → `color/bg/level-0` | high | — | 토큰 바인딩 |
| 상태바 | 정본 인스턴스 | `StatusBar / Platform=App` | 컴포넌트 정본 | high | 내부 정본 | 원본 27.33 → 정본 27 |
| 에스원 로고 | 정본 인스턴스 | `CI / Brand=에스원, Color=Blue` | CI 전용 토큰 | high | CI 내부 | ~~원본 78×30 → 정본 42×16~~ · ⚠️ **2026-08-21 철회** → `spec-change-2026-08-21.md` (정본 78.75×30) |
| 빈 아이디 입력 | 정본 인스턴스 | `Input / MD, Default, Label=Off, Message=Off, Mobile` | 컴포넌트 정본 | high | — | 폭 320으로 배치 |
| 입력 중 아이디·비밀번호 | 정본 인스턴스 | `Input / MD, Editing, Label=Off, Message=Off, Mobile` | 컴포넌트 정본 | high | 비밀번호는 `Password Icon=On` | 입력값 원문 유지 |
| 입력 완료 | 정본 인스턴스 | `Input / MD, Filled, Label=Off, Message=Off, Mobile` | 컴포넌트 정본 | high | 비밀번호 아이콘/지우기 정본 | 입력값 원문 유지 |
| 입력 오류 | 정본 인스턴스 | `Input / MD, Error, Label=Off, Message=On, Mobile` | `#FF4555` → `color/form-control/border/error`, 오류 텍스트 토큰 | high | 입력 정본 | 오류 문구 원문 유지 |
| 로그인 활성 버튼 | 정본 인스턴스 | `Button / LG, Default, Primary, Mobile` | `#1D6CEB` → button primary 토큰 | high | — | 폭 320, 정본 높이 48 |
| 로그인 비활성 버튼 | 정본 인스턴스 | `Button / LG, Disabled, Primary, Mobile` | button disabled 토큰 | high | — | 폭 320, 정본 높이 48 |
| 휴대전화번호 로그인 | 정본 인스턴스 | `Button / LG, Default, Secondary, Mobile` | button secondary 토큰 | high | — | 원본 화면별 문구 유지 |
| 회원가입·찾기 링크 | 토큰 프레임 | 가로 자동배치 + 텍스트 스타일 | `#646464/#7F7F7F` → `color/text/body/secondary|tertiary` | high | — | 정본에 전용 컴포넌트 없음 |
| 모바일 푸터 | 정본 인스턴스 | `Footer / Platform=Mobile` | 컴포넌트 정본 | high | — | 원본 360×94 → 정본 315×52, 중앙 배치 |
| 기기 내비 | 정본 인스턴스 | `NavBar / Platform=App` | 컴포넌트 정본 | high | 내부 정본 | 원본 48 → 정본 45 |
| 소프트 키보드 + 기기 내비 | 정본 인스턴스 | `NavBar / Platform=App + Keyboard` | `color/bg/level-0~2`, 본문·아이콘 semantic 토큰 | high | 내부 정본 | 키보드 296 + 앱 내비 45 = 360×341 |
| 팝업 딤 | 토큰 프레임 | 화면 위 overlay | `#000000` 계열 → `color/overlay` | high | — | 모달 뒤 배경 |
| 알림 팝업 | 정본 인스턴스 | `Modal / Footer=Single` | Modal 정본 토큰 | high | close 허용 key | 자동로그인 완료·신규기기 안내 등 |
| 확인 팝업 | 정본 인스턴스 | `Modal / Break=Mobile / Footer=Dual` | Modal 정본 토큰 | high | — | 자동로그인 질문·기기 등록 질문·로그아웃 확인 |
| 팝업 제목·본문·버튼 문구 | 인스턴스 내용 교체 | Modal의 제목/본문 및 내부 Button 라벨 override | Modal 내부 정본 | high | — | 원본 문구 verbatim |
| 로그아웃 메뉴 목록 | 토큰 프레임 | 서비스 전용 세로 목록 | 표면·텍스트·구분선 semantic 토큰 | high | 아래 HD-1 | 코어 컴포넌트로 정의되지 않은 서비스 화면 |
| 로그아웃 하단 탭 | 정본 인스턴스 조합 | `Mobile Bottom Nav` 4개 + 라벨/아이콘 override | 컴포넌트 정본 | medium | home/menu는 허용, 경비/video 미등록 | HD-1 |

## 화면별 핵심 변형

| 화면군 | Input | Button | Modal | 기타 |
|---|---|---|---|---|
| 최초 진입 | Default 2개 | Primary Disabled + Secondary Default | — | Footer, App NavBar |
| 입력 A/B | Editing/Filled 조합 | Primary Default + Secondary Default | — | `NavBar / Platform=App + Keyboard` 인스턴스 |
| 아이디·비밀번호 미입력 | Error Message=On + Filled | Primary Default + Secondary Default | — | 오류 문구 원문 |
| 잘못된 계정 | Filled + Error Message=On | Primary Default + Secondary Default | — | 2줄 오류 문구 |
| 자동 로그인 2종 | Filled 2개 | 배경 버튼 유지 | Single/Dual | overlay |
| 신규기기 5종 | Filled 2개 | 배경 버튼 유지 | 팝업 3종은 Single/Dual, 기본 2종은 없음 | 기본 상태 2 + 팝업 상태 3 |
| 로그아웃 확인 | — | Modal 내부 버튼 | Dual | 서비스 메뉴 + 하단 탭 |

## 토큰 매핑 원칙

| 원본 raw | 정본 역할 |
|---|---|
| `#FFFFFF` | `color/bg/level-0`, 컴포넌트별 surface/bg 토큰 |
| `#353535` | `color/text/title/secondary`, `color/text/body/primary`, `color/form-control/text/default` 중 요소 의미에 따라 선택 |
| `#7F7F7F`, `#646464` | `color/text/body/secondary|tertiary` |
| `#C4C4C4` | disabled 역할은 `color/form-control/text/disabled`; placeholder는 정본 Input placeholder 토큰 |
| `#DCDCDC` | `color/form-control/border/default` 또는 `color/line/gray/subtle` |
| `#F2F2F2`, `#F6F6F6` | button disabled·navigation background 등 해당 컴포넌트 역할 토큰 |
| `#1D6CEB` | `color/button/bg/primary--default` 또는 해당 action/form-control selected 역할 토큰 |
| `#004098` | 직접 바인딩하지 않고 `CI / Blue` 사용 |
| `#FF4555` | `color/form-control/border/error`, 오류 텍스트 역할 토큰 |
| `#262626` | `color/text/title/primary` 또는 `color/text/body/primary` |
| `#000000` 딤 | `color/overlay` |

같은 색을 공유하는 토큰은 HEX만으로 역매핑하지 않고 요소 의미로 선택한다.

## 허용편차 선언서

1. **정본 크기 우선** — Input·Button `50→48`, NavBar `48→45`, Footer `94→52`, ~~CI `78×30→42×16`~~ · ⚠️ **2026-08-21 철회** → `spec-change-2026-08-21.md` (정본 78.75×30).
2. **Modal 모바일 정본 우선** — 현재 정본 `Modal`의 `Break=Mobile` 300px 셸과 내부 LG Button을 사용한다. 360px 화면의 딤은 좌우 30px 패딩을 가지며, 긴 문구는 208px 최소 높이를 유지한 채 내용에 맞춰 세로로 늘어난다.
3. **원본 raw 색은 정본 semantic/component Variable로 스냅**한다.
4. **폰트는 Pretendard 정본 텍스트 스타일**을 사용한다. 비표준 크기는 가장 가까운 `title/*`, `body/*` 스타일로 수렴한다.
5. **OS 키보드는 별도 항목이 아니라 NavBar 결합 변형**으로 표현한다. 입력 화면은 `Platform=App + Keyboard` 360×341을 사용하고, 웹 입력 화면은 `Platform=Web + Keyboard` 360×391을 사용한다. 키 배열·툴바는 편집 가능한 벡터와 텍스트이며, 시각 기준 자산은 `assets/android-keyboard-reference.png`(360×296, SHA-256 `22e243659e1c5b1f0cdc45f3ae95392e6dda7d740d3d40050c388cf15d85543c`)다.
6. **가시 요소의 빈 플레이스홀더 대체는 허용편차가 아니다.** 사용자가 명시적으로 승인한 경우에만 허용한다.
7. 현재 Figma 설치본이 이후 재설치로 바뀌면, 빌드 시점 정본과 다시 대조하고 일치하는 로컬 인스턴스로 교체한다.

## 결정 필요(HD)

### HD-1 — 로그아웃 화면의 서비스 아이콘

로그아웃 확인 화면에는 `대화`, `고객센터`, `경비`, `영상`, `전체메뉴` 등의 아이콘이 있다. 현재 정본 허용목록에는 `home`, `menu`, `chevron`은 있지만 `대화`, `고객센터`, `경비`, `영상` 아이콘은 없다. 레거시 외부 인스턴스를 복제하는 것은 금지다.

- **권장:** 로그인 패턴 13개 화면을 먼저 제작하고, 로그아웃 확인 1개 화면은 별도 패턴으로 분리해 아이콘 정본 편입 후 제작한다.
- 대안: 필요한 서비스 아이콘을 정본 `ICON_KEYS`와 허용목록에 먼저 편입한 뒤 14개를 함께 제작한다. 이는 컴포넌트/설치기 동기화 업무가 추가된다.

## 검문소 2 결과

- 정본 매핑 완료: 로그인 관련 **13개 화면**
- 결정 대기: 로그아웃 확인 **1개 화면**
- 설치본과 정본의 필수 8개 세트 변형 구조: **일치**
- 빌드 시작 조건: HD-1 결정 + 빌드 직전 정본/로컬 세트 재대조
