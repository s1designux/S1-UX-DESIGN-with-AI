# PC 웹 로그인 패턴 — 인스턴스 출처(provenance) 전수 스캔

> 🤖 Figma원본 조사 에이전트(figma-inspector) — 읽기/스캔 전용. 빌드·수정 없음.
> 파일 key: `cysG5U1udpQqVagYY1hWHW` · 페이지: Patterns PC (80:16697) · 루트 프레임: **268:369** (`웹_로그인 화면`)
> 스캔일: 2026-06-19 · 도구: use_figma(`getMainComponentAsync`·`.remote` 판정) + get_metadata + get_screenshot

## ⚠️ 핵심 결론 (한 줄)

**268:369 안의 INSTANCE 19개 전부가 `remote: true` — 즉 이 파일 밖 외부 발행 라이브러리에서 import된 인스턴스다.** 우리 로컬 V3.0 정본(`remote:false`, 173:xxxx 대) 인스턴스는 **단 하나도 없다.** input·checkbox·button·login_GNB·web tab bar·로고·아이콘 모두 외부 출처.

> 직전 검증서(4-verification.md L60)가 "remote:true = 이 파일이 참조하는 V3.0 정본"이라 판단한 것은 **오판**이다. 로컬 정본 세트(173:4668 Button 등)는 `remote:false`로 따로 존재하며, 로그인 화면의 인스턴스들은 그것과 **다른 외부 라이브러리(261:xxxx main)** 를 가리킨다. 외부 set key는 이 팀에서 `importComponentSetByKeyAsync`로 import조차 안 됨(= 외부/미발행 라이브러리).

---

## 작업 1 — 268:369 INSTANCE 19개 전수 판정표

판정: **L**=로컬 정본(remote=false) · **V2.2아이콘**=`ic_`/key `yE5UCFEbmXJBlYJWB24Lz2` · **❌외부**=그 외 remote=true

| # | 인스턴스 id | 인스턴스 name | mainComponent name | set name | set key | remote | 판정 |
|---|---|---|---|---|---|---|---|
| 1 | 268:5646 | web tab bar | Property 1=1920 | web tab bar | 7dcdbf58… | true | ❌외부 |
| 2 | I268:5646;10581:42234 | icon/tab/info | icon/tab/info | (단독) | dc0244ab… | true | ❌외부 |
| 3 | I268:5646;10581:42235 | icon/tab/close | icon/tab/close | (단독) | 1ad8a545… | true | ❌외부 |
| 4 | I268:5646;10581:42245 | previous | solid=no, state=normal | previous | 2abf3e6e… | true | ❌외부 |
| 5 | I268:5646;10581:42246 | previous | solid=no, state=normal | previous | 2abf3e6e… | true | ❌외부 |
| 6 | I268:5646;10581:42247 | refresh | solid=no, state=normal | refresh | c585ebd2… | true | ❌외부 |
| 7 | I268:5646;10581:42249 | tabel_bar | option=list | tabel_bar | 22b36b38… | true | ❌외부 |
| 8 | 268:5647 | login_GNB | state=ver1 | login_GNB | 6ffe12b8… | true | ❌외부 |
| 9 | I268:5647;8177:208696 | Samsung_Orig_Wordmark_BLACK_RGB 2 | C/IMG/Logo/Samsung | (단독) | 397c78f1… | true | ❌외부 |
| 10 | I268:5647;7575:7299 | slot_utility | language=on, full menu=off, user=off | slot_utility | a116a9e3… | true | ❌외부 |
| 11 | I268:5647;7575:7299;13248:272257 | language_set | type=korea+text | language_set | 529bcf1b… | true | ❌외부 |
| 12 | …;3339:33064 | language_set | type=globe | language_set | 529bcf1b… | true | ❌외부 |
| 13 | …;3339:33064;1980:53456 | Component 80 | Property 1=Line | **ic_인터넷** (globe) | 39fdda68… | true | ❌외부 (V2.2 아이콘 아님) |
| 14 | 280:330 | C/IMG/Logo/Samsung_30 (중앙 로고) | C/IMG/Logo/Samsung_30 | (단독) | 044498de… | true | ❌외부 |
| 15 | 269:4559 | input (아이디) | platform=pc-md, state=default, option=off | **input** | bde4077c… | true | ❌외부 |
| 16 | 269:4560 | input (비밀번호) | platform=pc-md, state=default, option=icon_1 | **input** | bde4077c… | true | ❌외부 |
| 17 | I269:4560;1980:48706 | ic_비밀번호미표시 (eye-off) | Property 1=Solid | **ic_비밀번호미표시** | 8edfaab1… | true | ❌외부 (V2.2 아이콘 아님) |
| 18 | 269:4561 | checkbox | size=pc, state=default, label=on | **checkbox** | 679a1357… | true | ❌외부 |
| 19 | 269:4562 | button | variant=primary, size=medium, state=disabled, icon=off | **button** | 2f364f54… | true | ❌외부 |

> main component id가 전부 `261:xxxx`로 보이지만, **이 파일의 노드가 아니다.** get_metadata(261:12493) = "invalid node / not in file" → 외부 라이브러리 파일의 id가 import되며 그대로 노출된 것(파일 간 id 충돌). 우리 "sample" 페이지(261:12116)의 261:xxxx와 무관.

---

## 작업 2 — 로컬 V3.0 정본 컴포넌트 세트 (이 파일, `remote:false`)

브루트 스캔(173:4000–9000) 결과 — 빌더(build-components.ts)가 설치한 로컬 정본 세트 18종:

| 컴포넌트 | 로컬 SET id | remote | variant 속성 (이름=값) |
|---|---|---|---|
| **Button** | **173:4668** | false | `Variant`[Primary/Secondary/Blue-Line] · `Size`[medium/xsmall/xxsmall/large] · `State`[Default/Hover/Pressed/Disabled] · `Break`[PC/Mobile] (48 variants) |
| **Checkbox** | **173:4983** | false | `State`[Default/Hover/Checked/Disabled/Dis+Checked] (5) — **label/size variant 없음** |
| Radio | 173:5051 | false | (10) |
| Toggle | 173:5144 | false | (4) |
| Chip | 173:5226 | false | Size/State/Variant/Break (24) |
| Filter Chip | 173:5541 | false | (20) |
| **Search Input** | **173:5979** | false | `State`[Default/Focus/Filled/Disabled] · `Size`[XSMALL/SMALL/MEDIUM] (12) — **돋보기 아이콘형. 평문 Input 아님** |
| Text Area | 173:6136 | false | `State`[Default/Focus/Filled/Disabled/Readonly] (5) |
| **Select Box** | **173:6316** | false | Size[XXSM/XSM/MD]·State[Default/Hover/Open/Filled/Disabled]·Break[PC/Mobile] (20) |
| Dropdown List | 173:6698 | false | (4) |
| Line Tab | 173:6759 | false | (9) |
| Table Cell | 173:6900 | false | (8) |
| Time Picker | 173:7072 | false | (20) |
| Time Picker Cell | 173:7380 | false | (3) |
| Time Picker Dropdown | 173:7461 | false | (2) |
| Pagination | 173:8330 | false | Element[Arrow/Number/Edge]·State (9) |
| **GNB Menu** | **173:8411** | false | `Size`[md/sm/xsm] · `State`[Default/Hover/Selected] (9) |
| **GNB** | **173:8681** | false | `Align`[Center-Between/Start] · `Size`[md/sm/xsm] (6) |

### 로그인에 쓸 로컬 variant 조합 확정

- **Button (173:4668):** `Variant=Primary, Size=medium, State=Disabled, Break=PC` → 외부 `variant=primary,size=medium,state=disabled,icon=off`(269:4562) 대체. (속성명 표기가 다름: 로컬은 첫 글자 대문자·`Break`·`icon` 속성 없음)
- **Checkbox (173:4983):** Unchecked=`State=Default` → 외부 `size=pc,state=default,label=on`(269:4561) 대체. ⚠️ 로컬엔 `label`/`size` variant가 없어 **라벨은 외부 인스턴스 자식 텍스트로 들어가 있던 것** — 로컬 교체 시 라벨을 별도 텍스트로 옆에 배치해야 함(컴포넌트 라벨 슬롯 부재).
- **GNB (173:8681):** `Align=Center-Between, Size=md` → 외부 login_GNB(268:5647) 대체. ⚠️ 단, 로컬 GNB는 슬롯 구조(로고 슬롯/슬롯_utility/language_set)가 외부 login_GNB와 다름. 로고·언어선택 배치 재조립 필요.

### ❗ 로컬 정본이 **아예 없는** 요소 (교체 불가 → 결정 필요)

| 요소 | 외부 인스턴스 | 상태 |
|---|---|---|
| **평문 Input(아이디/비밀번호)** | 269:4559, 269:4560 (`input`, bde4077c) | **로컬 base "Input" 세트 부재.** build-components.ts엔 `buildInput`(set.name="Input")이 정의돼 있으나 **이 파일의 로컬 설치 배치에는 미포함**(173 전구간 스캔 결과 없음). 가장 가까운 로컬은 "Search Input"(173:5979, 돋보기형)·"Text Area"(173:6136)뿐 → 평문 입력 필드로 바로 대체 불가 |
| **web tab bar (브라우저 크롬)** | 268:5646 (web tab bar, 7dcdbf58) | **로컬 정본 없음(외부/목업).** 디자인시스템 컴포넌트가 아닌 화면 장식 크롬. 1-inventory에도 "크롬 탭바(목업)"로 기록됨 |
| **중앙 SAMSUNG 로고** | 280:330 (C/IMG/Logo/Samsung_30, 044498de) | **로컬 COMPONENT 아님 — 외부 이미지 컴포넌트** |
| **GNB 내 SAMSUNG 워드마크** | I268:5647;8177… (C/IMG/Logo/Samsung, 397c78f1) | **로컬 아님 — 외부 이미지 컴포넌트** (login_GNB 내부 nested) |
| **Date Picker** | (로그인 미사용) | 참고: 로컬 설치 배치에 Date Picker 세트도 없음(빌더엔 있으나 미설치) |

---

## 작업 3 — eye-off · globe 아이콘 출처

| 아이콘 | 인스턴스 | set name | set key | remote | V2.2 라이브러리 여부 |
|---|---|---|---|---|---|
| 비밀번호 **eye-off** | I269:4560;1980:48706 | `ic_비밀번호미표시` | 8edfaab1a0948b9b94313715df867d5ffa7a85c9 | true | **아님.** `ic_` 접두는 맞으나 key가 V2.2 아이콘 라이브러리(`yE5UCFEbmXJBlYJWB24Lz2`)가 아닌 외부 라이브러리 |
| 언어선택 **globe** | …;3339:33064;1980:53456 | `ic_인터넷` (Component 80, Property1=Line) | 39fdda68026c3b24588cb254f075d58ab88ad3bc | true | **아님.** 외부 라이브러리 globe 아이콘 |

> 둘 다 `ic_` 이름이지만 **V2.2 아이콘 라이브러리(key yE5UCFEbmXJBlYJWB24Lz2)에서 온 것이 아니다.** login_GNB/input 인스턴스를 따라 외부 라이브러리에서 import된 nested 아이콘이다.

---

## 종합 — 빌드 결정에 필요한 3가지

### (1) ❌ 외부 라이브러리 인스턴스 목록 (전부)
268:369 내 INSTANCE **19개 전부**가 외부(remote=true). 위 작업1 표 전체가 ❌ 목록이다. 핵심: input(269:4559/4560)·checkbox(269:4561)·button(269:4562)·login_GNB(268:5647)·web tab bar(268:5646)·로고 2종(280:330, nested Samsung)·아이콘(ic_비밀번호미표시·ic_인터넷·icon/tab/*·previous·refresh)·slot_utility·language_set.

### (2) 로컬 정본 교체 매핑표 (외부 → 로컬 SET id + variant)

| 외부 인스턴스 | → 로컬 정본 SET | 사용할 variant | 주의 |
|---|---|---|---|
| button 269:4562 | **Button 173:4668** | `Variant=Primary, Size=medium, State=Disabled, Break=PC` | 속성명 대소문자·Break 표기 차이 |
| checkbox 269:4561 | **Checkbox 173:4983** | `State=Default` (Unchecked) | 라벨 슬롯 없음 → 라벨 별도 텍스트 |
| login_GNB 268:5647 | **GNB 173:8681** | `Align=Center-Between, Size=md` | 슬롯 구조 상이, 로고/언어선택 재조립 |
| input 269:4559 (아이디) | **(로컬 없음)** | — | base Input 미설치 ⚠ |
| input 269:4560 (비번) | **(로컬 없음)** | — | base Input 미설치 ⚠ |

### (3) 로컬 정본이 아예 없는 요소
- **평문 Input** (아이디·비밀번호 필드) — 가장 치명적. 로컬 base "Input" 세트가 이 파일에 미설치. → **빌더로 Input 세트를 먼저 로컬 설치**하거나(figma-library-build), 임시로 form-control 토큰 바인딩 프레임을 직접 조립해야 함. 오케스트레이터 결정 필요.
- **web tab bar / 브라우저 크롬** — DS 정본 없음(화면 장식 목업). 로컬 컴포넌트화 대상 아님 → 토큰 입힌 정적 프레임으로 재현.
- **SAMSUNG 로고(중앙·GNB)** — 외부 이미지 컴포넌트. 로컬 정본 없음 → `[서비스 로고]` placeholder 텍스트/이미지로 대체(브랜딩 제거 = 허용편차).
- **eye-off / globe 아이콘** — V2.2 아이콘 라이브러리(yE5UCFEbmXJBlYJWB24Lz2)에서 재소싱 필요(현재 외부 ic_ 사용 중).

> 작업 범위: **읽기/스캔만 수행.** 빌드·수정·교체 일절 없음.
