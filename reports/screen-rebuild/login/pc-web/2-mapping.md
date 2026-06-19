# screen-rebuild 2단계 — 매핑 & 허용편차 선언: PC 웹 로그인 패턴

- **원본:** 261:13153 "웹_로그인 화면" (1920×1080, 절대좌표 배치)
- **타깃:** Pattern PC 페이지 80:16697 — 신규 Section "로그인 (PC Web)" 추가 (기존 데이터테이블 Section 우측, 약 x=2642 y=146)
- **사용자 확정 결정 (검문소1 후):**
  1. 버튼 = 정본 button 인스턴스로 교체 후 **State=Disabled** 로 설정
  2. 해상도 = **1920 단일 제작 + 반응형**(리사이즈 시 줄어들도록 auto-layout FILL 구조). 1440×1000 최소해상도 안전.
  3. 브랜딩 = **제네릭 플레이스홀더**로 치환

---

## 매핑표

| # | 요소 | 분류 | 정본 세트/variant·상태 | 색 매핑(raw→토큰) | confidence | 비고 |
|---|------|------|----------------------|------------------|-----------|------|
| 1 | web tab bar | 플레이스홀더(브라우저 크롬) | (목업) | 토큰 미바인딩 raw 유지(브라우저 크롬, DS 아님) | — | 웹 컨텍스트 표시용. 원본 인스턴스 재사용. **화면 저작 raw 검사 제외**(크롬 목업) |
| 2 | login_GNB 바 | 정본 인스턴스 | login_GNB | navigation/background·line/gray/subtle (원본 바인딩 유지) | high | 인스턴스 유지, 내부 브랜딩만 override |
| 3 | GNB 로고 | **제네릭 플레이스홀더** | — | text/body/tertiary | — | Samsung 로고 → `[서비스 로고]` 플레이스홀더(텍스트/박스). nested 어려우면 needs-decision |
| 4 | GNB 서비스명 | **제네릭 플레이스홀더** | — | text/title/primary (#000000 유지) | high | `통근버스 운영 시스템` → `[서비스명]` |
| 5 | 언어 선택 `한국어` | 정본 인스턴스(유지) | (GNB 유틸) | text Gray800·globe 아이콘(원본) | high | 정적 1상태. verbatim `한국어` 유지 |
| 6 | 중앙 로고 | **제네릭 플레이스홀더** | — | text/body/tertiary | — | Samsung_30 → `[서비스 로고]` 플레이스홀더 |
| 7 | 아이디 입력 | 정본 인스턴스 | input / State=Default(empty) | form-control/bg·border·text(원본 바인딩 유지) | high | placeholder verbatim `아이디를 입력해 주세요.` |
| 8 | 비밀번호 입력 | 정본 인스턴스 | input / State=Default(empty) + eye-off | form-control 동일 | high | placeholder `비밀번호를 입력해 주세요.` + ic_비밀번호미표시(원본 아이콘) |
| 9 | 아이디 저장 체크박스 | 정본 인스턴스 | checkbox / State=Unchecked | control/bg·border·label(원본 유지) | high | 라벨 verbatim `아이디 저장` |
| 10 | 로그인 버튼 | 정본 인스턴스 | **button / State=Disabled** | button/bg·border·label disabled(원본 유지) | high | 라벨 `로그인`. FILL width(460) |
| 11 | 아이디 찾기 링크 | 토큰 프레임(텍스트) | — | text/body/tertiary #757575 | high | verbatim `아이디 찾기` |
| 12 | 구분선(링크) | 토큰 프레임(장식) | — | icon/gray-light #c4c4c4 | high | 1×12 |
| 13 | 비밀번호 찾기 링크 | 토큰 프레임(텍스트) | — | text/body/tertiary #757575 | high | verbatim `비밀번호 찾기` (노드명 무시) |
| 14 | 푸터 바 | 토큰 프레임(detached) | — | navigation/background·line/gray/subtle | high | S1 공통 푸터 — **유지**(서비스 전용 아님, S1 corp 공통). 원본 표시본 262:14385 재사용 |
| 15-17 | 약관 링크 3 | 토큰 프레임(텍스트) | — | text/body/tertiary #757575 | high | verbatim: `이용약관`·`개인정보 처리방침`·`위치기반 서비스 이용약관` |
| 18 | 푸터 구분선 ×2 | 토큰 프레임(장식) | — | icon/gray-light #c4c4c4 | high | 1×8 |
| 19 | 사업자 정보 | 토큰 프레임(텍스트) | — | text/body/tertiary #757575 | high | verbatim 유지 |
| 20 | 카피라이트 | 토큰 프레임(텍스트) | — | text/body/tertiary #757575 | high | `© S-1 Corp. All Rights Reserved.` |
| 21 | 푸터 S1 로고 | 정본 인스턴스(유지) | C/IMG/Logo/S1_g | — | high | S1 corp 로고 — 유지 |

---

## 제외 항목 (오케스트레이터 직접 결정 — 검문소1 후)

- **261:13171 푸터 스트레이 인스턴스(y=6576, 프레임 밖)** → 제외(재현 안 함)
- **261:13161 숨김 텍스트** `총 3개의 서비스를 이용하고 계세요`(hidden) → 제외
- **비밀번호 찾기** 노드명(`비밀번호 초기화`) 무시, 렌더 텍스트 verbatim `비밀번호 찾기` 사용

---

## 허용편차 선언서 (검증기는 이 항목을 빼고 대조)

1. **브랜딩 제네릭화** — Samsung 로고(GNB·중앙) → `[서비스 로고]`, 서비스명 → `[서비스명]`. (사용자 확정: 공통 패턴화)
2. **버튼 상태 = Disabled** — 정본 button 인스턴스로 교체 후 State=Disabled. (사용자 확정)
3. **반응형 재구성** — 루트 절대좌표 → vertical auto-layout + FILL. 시각 결과 동일하되 구조가 반응형. (사용자 확정)
4. **브라우저 크롬 목업(web tab bar)** = DS 아님 → raw 색 유지, Variable 바인딩 검사 제외(플레이스홀더 취급).
5. **비표준 글자크기** 발생 시 가장 가까운 토큰 크기(12/14/16/10)로 수렴. (텍스트 스타일 바인딩 정본)

> 폰트는 편차 아님 — Pretendard 텍스트 스타일(`title/*`·`body/*`·`component/*`) 바인딩이 정본.

---

## 결정 필요(HD) 목록

- **없음.** 색 매핑 전건 high(원본이 이미 V3.0 Variable 바인딩). needs-core-update 없음(버튼 disabled 정본 존재). 라이브러리 없는 아이콘 없음(원본 아이콘 그대로).
- **빌드 중 escalate 가능 항목:** GNB 로고가 GNB 인스턴스 *내부* nested instance라 플레이스홀더 치환이 막히면 → screen-rebuilder가 needs-decision 으로 반환(임의 처리 금지).

---

## 빌드 전략 (3단계 screen-rebuilder 지시 요약)

타깃: Pattern PC 80:16697 에 신규 Section "로그인 (PC Web)".

1. **루트 프레임** 1920×1080, `createAutoLayout` VERTICAL, bg = navigation/background(흰색) 바인딩. (createFrame 금지 — 100px 고정 함정)
2. **헤더 블록** (FILL width, HUG height): web tab bar 인스턴스 + login_GNB 인스턴스. 둘 다 layoutSizingHorizontal=FILL.
   - GNB 내부: 서비스명 텍스트 override `[서비스명]`, 로고 → 플레이스홀더(막히면 needs-decision).
3. **본문 블록** (FILL width, **layoutGrow=1** 마지막에 — 세로 grow): 내부 vertical auto-layout, primaryAxisAlignItems=CENTER·counterAxisAlignItems=CENTER. 중앙 로고 플레이스홀더 + 로그인 카드(460 고정폭).
   - 로그인 카드: 입력2(FILL 460)·체크박스·버튼(State=Disabled, FILL) + 하단 링크.
4. **푸터 블록** (FILL width, HUG): 원본 표시 푸터 구조 재현(약관3·구분선2·사업자·카피·S1 로고). navigation/background·line 바인딩.
5. 색은 전부 Variable 바인딩(브라우저 크롬 목업 제외). 텍스트는 Noto로 입력 후 `setTextStyleIdAsync`로 Pretendard 스타일 바인딩.
6. 모든 생성 node id → node-map.json.

> 반응형 검증: 루트 프레임 width를 1440·height 1000으로 resize 했을 때 헤더/푸터 FILL·카드 중앙·버튼 FILL 이 깨지지 않아야 함.

---

## 🚨 REVISION (2026-06-19) — 외부 라이브러리 누수 적발 · 로컬 정본 재빌드 계획

**문제:** 1차 빌드(268:369)의 인스턴스 19개 전부가 외부 UVIS시스템(관계사용) 라이브러리(remote:true)였다. 근본 원인 = screen-rebuilder가 레거시 원본 화면(261:13153, 외부 라이브러리로 제작)의 인스턴스를 clone/재사용. → skill 절대규칙 3-1·프리플라이트·검증 Layer1, component-verifier HARD RULE로 영구 차단. provenance-scan.md 참조.

**교정 소싱 원칙:** 모든 인스턴스는 **로컬 정본 COMPONENT_SET(remote=false)** 또는 **V2.2 아이콘(key yE5UCFEbmXJBlYJWB24Lz2)** 에서만. 레거시 원본 인스턴스 clone 금지.

### 로컬 정본 교체 매핑 (remote=false 확인됨)
| 요소 | 로컬 정본 SET | variant |
|------|--------------|---------|
| 버튼 | **Button 173:4668** | Variant=Primary, Size=medium, State=Disabled, Break=PC |
| 체크박스 | **Checkbox 173:4983** | State=Default(=unchecked) + 라벨 텍스트 별도 |
| GNB | **GNB 173:8681** | 슬롯 재조립(서비스명·언어) |
| 아이디/비밀번호 입력 | **Input (재설치 대기)** | platform=PC, state=Default, 라벨 없음, option off |
| eye-off·globe 아이콘 | **V2.2 아이콘 라이브러리** | importComponentByKeyAsync (`ic_비밀번호미표시`·`ic_인터넷` V2.2 key) |

### 사용자 액션 대기 (블로커 2건)
1. **설치기 플러그인 재실행** — Input(평문) 포함해 V3.0 파일에 로컬 설치. (현재 로컬 미설치, 코드 build-components.ts 2061 `"Input": buildInput`엔 존재)
2. **로컬 로고 에셋 제공** — SAMSUNG(중앙 공통·GNB), S1(푸터). 외부 이미지 컴포넌트 대체용.

### 재빌드 절차 (블로커 해소 후)
- 기존 외부-기반 프레임(268:369) **폐기 후 새로** 빌드(누적 금지).
- 로컬 정본 세트에서만 인스턴스 생성 → 빌드 종료 전 자가 프로비넌스 스캔(전 INSTANCE remote=false/V2.2) → component-verifier가 remote/key 실제 출력 대조.
- 반응형·텍스트 스타일·토큰 바인딩은 1차안 그대로 유지.

**현재 상태:** 268:369(외부-기반)는 재빌드 전까지 **잘못된 상태**로 남아 있음 — 그대로 사용 금지.
