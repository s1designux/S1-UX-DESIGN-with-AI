# Bottom Sheet — 4단계 검증 (figma-library-build)

> 🤖 원본대조 검증 에이전트(component-verifier) 작성. 빌더와 분리된 검증자 — 직접 수정 안 함, ❌ 목록만 반환.
> 기준: `2-plan.md`(빌드 계획) + `1-inventory.md`(소스 실측) + `node-map.json`.
> 검증 대상 파일: `cysG5U1udpQqVagYY1hWHW` (V3.0-TEST). 세트: Bottom Sheet Option `786:6306`, Bottom Sheet `789:6337`.
> 레거시 원본 대조: `yE5UCFEbmXJBlYJWB24Lz2` 옵션 540:5862 / 컨테이너 540:5903.
> 검증일: 2026-07-03 · 전 스캔 use_figma 실행(눈대중·카테고리 판단 0).

---

## 1. Variant 전수·속성 (정확 대조 — 엄격)

### Bottom Sheet Option (786:6306) — 8/8 존재 ✅
| 계획 variant | 빌드 노드 | 속성명 |
|-------------|----------|--------|
| Text/Default | 786:6255 | `Type=Text, State=Default` ✅ |
| Text/Selected | 786:6257 | `Type=Text, State=Selected` ✅ |
| Checkbox/Default | 786:6262 | `Type=Checkbox, State=Default` ✅ |
| Checkbox/Selected | 786:6265 | `Type=Checkbox, State=Selected` ✅ |
| Radio/Default | 786:6271 | `Type=Radio, State=Default` ✅ |
| Radio/Selected | 786:6275 | `Type=Radio, State=Selected` ✅ |
| List/Default | 786:6280 | `Type=List, State=Default` ✅ |
| List/Disabled | 786:6294 | `Type=List, State=Disabled` ✅ |

### Bottom Sheet (789:6337) — 3/3 존재 ✅
| 계획 variant | 빌드 노드 | 속성명 |
|-------------|----------|--------|
| Footer=None | 789:6273 | `Footer=None` ✅ |
| Footer=Single | 789:6291 | `Footer=Single` ✅ |
| Footer=Dual | 789:6313 | `Footer=Dual` ✅ |

→ 전수·속성명 PASS.

## 2. 패킹 정상 (붕괴 없음)

- Option 세트 bounds 848×344 — 2열 wrap(360+gap48+360+pad40) 정상, 좌표 붕괴 없음.
- Bottom Sheet 세트 bounds 1256×456 — 3열(360×3+gap48×2+pad40) 정상.
- **컨테이너 리스트 4개 다 보임 확인** — 각 컨테이너 variant에 Bottom Sheet Option(Text) 인스턴스 4개(Default×3+Selected×1 = 총 12 across 3 variants). 리스트 잘림 없음(빌더 self-fix 실효 확인). ✅

## 3. 토큰 바인딩 스캔 (use_figma 사실 추출 + 역매핑)

- 스캔 노드: 786:6306 / 789:6337 · **미바인딩 raw hex 0건(양 세트)** → figma-binding-lookup 역매핑 대상(EXACT) 없음.
- `get_variable_defs`로 실제 바인딩 변수 확인 — 계획 매핑 전부 준수:

| 대상 | 바인딩 변수 | resolved | 계획 일치 |
|------|-------------|----------|----------|
| 시트/행 표면 | `color/bg/level-0` | #ffffff | ✅ |
| **아바타 원** | **`color/icon/gray-light`** | #c4c4c4 | ✅ **bg 아닌 icon 계열 — "bg는 배경에만" 준수** |
| 아바타 글리프 | `color/icon/white` | #ffffff | ✅ |
| 라벨(default) | `color/text/body/primary` | #202020 | ✅ |
| 서브텍스트 | `color/text/body/secondary` | #353535 | ✅ |
| selected 라벨 | `color/text/state/accent` | #1d6ceb | ✅ |
| ✓ 아이콘 | `color/icon/blue` | #1d6ceb | ✅ |
| chevron | `color/icon/gray-dark` | #353535 | ✅ |
| lock | `color/icon/gray` | #55575f | ✅ |
| 헤더 제목 | `color/text/title/primary` | #202020 | ✅ |
| close | `color/icon/gray-dark` | #353535 | ✅ |
| 상단 radius | `radius/modal/md` | 8 | ✅ 바인딩됨 |
| 푸터 버튼 | `color/button/*` + `radius/4`·`border-width/1`·`spacing/16` | — | ✅ (컴포넌트 재사용) |

→ **토큰 바인딩 PASS. EXACT 미바인딩 0. 아바타 원이 bg 토큰으로 잘못 바인딩된 사례 없음(icon/gray-light).**

## 4. 폰트 스캔 (데이터 — 렌더 판정 안 함)

- Option: textCount 10, 비-Pretendard 0 → ✅ PASS
- Bottom Sheet: textCount 18, 비-Pretendard 0 → ✅ PASS
- 전 TEXT 노드 Pretendard(body/16M·14R·title/20B). 임시 Inter→textStyle 재바인딩 완료 확인.

## 5. 재사용 무결성 / 순환참조 / 인스턴스 출처(provenance)

전 INSTANCE `getMainComponentAsync().remote`·`key`·`name` 실측:

| 인스턴스 | mainComp | remote | key(앞12) | 판정 |
|----------|----------|--------|-----------|------|
| Checkbox off | State=Default | **false** | 388366a02b0e | ✅ LOCAL |
| Checkbox on | State=Checked | **false** | 3e6ba12f750b | ✅ LOCAL |
| Radio off | State=Default | **false** | b6d2e5315db9 | ✅ LOCAL |
| Radio on | State=Selected | **false** | 97f5de4c6108 | ✅ LOCAL |
| Button primary | Size=LG…Primary…Mobile | **false** | 93dbb7ab5269 | ✅ LOCAL |
| Button secondary | …Secondary…Mobile | **false** | 842caa52692c | ✅ LOCAL |
| Bottom Sheet Option (컨테이너 내) | Text/Default·Selected | **false** | 9ba6f2…·72dc2f… | ✅ LOCAL |
| close | Property1=Line | true | 2a1abbd3597b | ✅ ICON(허용) |
| check/ic_확인 | Property1=Line | true | 5ab251e0d90a | ✅ ICON(허용) |
| account(아바타) | Property1=Line | true | a423e2e05cff | ✅ ICON(허용) |
| chevron | Property1=line | true | e1ac97aa82f4 | ✅ ICON(허용) |
| **lock (ic_잠김)** | Type=Line | **true** | **28aa6b1615f3** | ❓(c) 허용목록 미등록 |

- 체크박스/라디오/버튼 = 로컬 라이브러리 컴포넌트 **인스턴스**(raw 재현 아님) ✅. 레거시 토큰 의미역전 회피 성공.
- **순환참조 0** — Bottom Sheet가 Bottom Sheet Option(다른 세트) 인스턴스를 품음, 자기 세트 형제 미포함. ✅
- 기존 컴포넌트 리네임·remap 없음(신규 세트만). 기존 인스턴스 무손상. ✅

## 6. 렌더 대조 (built vs 레거시 원본)

- Option 8변형: 레거시 540:5862와 배치·아이콘·상태 시각 일치. 체크박스/라디오/체크아이콘/chevron/lock(+x) 전부 원본과 매칭. ✅
- 컨테이너 3변형: 레거시 540:5903과 헤더(제목+X)·리스트4행(2번째 selected)·푸터(None/Single/Dual) 시각 일치. ✅ (푸터 버튼 라벨 "버튼"은 재사용 Button 컴포넌트 기본 텍스트 — 결함 아님.)
- **차이 1건(List 행 높이):** 레거시·계획은 List 행 hug/py12(~64~65px, 셀렉션 행보다 높음). 빌드는 8변형 전부 FIXED h48(py~4). 내용(아바타40·타이틀·서브) 잘림은 없으나 원본보다 눈에 띄게 압축됨.

---

## 판정 요약

### ❌ (a) 빌드 실수 — 수정 대상 (1건)
- ❌ **List 행 높이/세로패딩:** 계획(`2-plan.md` §26 "List 행 hug, 패딩 20/12")·레거시 원본(~64~65px, 셀렉션 행보다 높음) 둘 다 일치하는데, 빌드는 List/Default·List/Disabled 를 FIXED **h48**(py~4)로 셀렉션 행과 동일 높이로 만듦. 계획과 원본이 모두 "더 높은 hug 행"으로 일치하므로 애매(c) 아님 — 빌드가 spec 미준수. → List 행을 hug + 세로패딩 12(≈64px)로 수정. (내용 잘림 없음·심각도 경미하나 원본충실성 위반.)

### 🟡 (b) 계획상 의도된 편차 — 유지
- 🟡 **아바타 원 색** 레거시 #e9e9e9 → 빌드 `color/icon/gray-light`(#c4c4c4). 계획에 사전 등록(사용자 지시 "bg는 배경에만, 전경은 icon 계열", #e9e9e9 정확 토큰 부재). 살짝 진해지나 의도됨. 유지.
- 🟡 **헤더 제목/라벨 색** 레거시 #000/#353535 → 현행 DS 토큰(title/primary #202020, body/primary #202020). 레거시 raw 대신 현행 토큰 사용 = 올바른 동작. 유지.
- 🟡 **컨테이너 높이 미세차** None 300(계획 302)·Single/Dual 376(계획 378) = 2px 반올림. 무시 가능.
- 🟡 **드래그 핸들·딤 스크림 미포함** — 레거시 소스에 없음(계획대로). 추후 핸들 추가는 개선여지.

### ❓ (c) 확인 요청 — 사용자 판단 (1건)
- ❓ **lock 아이콘(ic_잠김) 출처:** 인스턴스 main component = 세트 `ic_잠김`(setKey b3ccc4b2…, variant key 28aa6b1615f3…), remote=true. 이 key 가 `registry/figma/allowed-remote-keys.json` 허용목록에 **없음**. HARD RULE상 remote+미등록 key 는 원칙 ❌이나, **ic_* 이름(ic_잠김)이라 (c) 애매로 분류**(정본 note 규정). 빌더는 "V2.2 아이콘 라이브러리 게시 확인"이라 함 → 사용자가 정식 V2.2 아이콘임을 확인하면 `allowed-remote-keys.json` + `build-components.ts` ICON_KEYS 에 `lock`(variant 28aa6b… / set b3ccc4b2…) 키 추가 필요. 그 전까진 provenance 완전 green 아님. (다른 아이콘 close·check·account·chevron 은 전부 허용목록 등록·확인됨.)

### 스캔 PASS/FAIL
| 스캔 | 결과 |
|------|------|
| variant 전수·속성 | ✅ PASS (8/8, 3/3) |
| 패킹 붕괴 | ✅ PASS (붕괴 없음·리스트 4행 정상) |
| 토큰 바인딩 (미바인딩 raw hex) | ✅ PASS (0건, EXACT 없음, 아바타=icon/gray-light) |
| 폰트 (비-Pretendard) | ✅ PASS (0건, textCount 10+18) |
| 순환참조 | ✅ PASS (0) |
| 재사용 인스턴스 무결성 | ✅ PASS (컨트롤·버튼 전부 로컬 인스턴스) |
| 인스턴스 출처(provenance) | ⚠️ 1건 ❓(c) — lock ic_잠김 미등록 key |
| 렌더 대조 | ⚠️ 1건 ❌(a) — List 행 높이 48 vs hug 64 |

### 최종 판정(1차): **FAIL** (❌(a) 1건 존재)
- ❌(a) 1건 → 빌더에 반환(List 행 hug/py12 수정 후 재검증).
- ❓(c) 1건 → 사용자 확인 대기(lock 아이콘 V2.2 확인 → 허용목록 키 추가).
- 나머지 전 항목 PASS. 육안 미검증 없음(전 variant 렌더 대조 완료).

---

## 재검증 (2026-07-03, 빌더 수정 후)

빌더 수정: List/Default(786:6280)·List/Disabled(786:6294) h48 FIXED → 64px hug(세로 sizingMode=AUTO). 셀렉션 행·색·폰트·컨테이너 미변경 보고.

### 1. ❌(a) 해소 확인 ✅
| variant | 재측정 높이 | vSizing | 판정 |
|---------|-------------|---------|------|
| Type=List, State=Default | **64** | **AUTO(hug)** | ✅ 해소 |
| Type=List, State=Disabled | **64** | **AUTO(hug)** | ✅ 해소 |

- 렌더 대조(786:6306 재촬영 vs 레거시 540:5862): List 행이 원본처럼 아바타40 상하 여백(≈12px) 확보, 셀렉션 행보다 높음. 타이틀("항목 타이틀")+서브("항목 서브") 2줄 안 잘림, 우측 chevron/lock 정렬 유지. 원본과 일치. ✅
- 트리 확인: textcol(h32=타이틀15+서브15+gap2) 온전, 아바타(40)·chevron(24)·lock(24) 정상.

### 2. 회귀 없음 ✅
| 항목 | 재측정 | 판정 |
|------|--------|------|
| 셀렉션 행 6변형(Text/Checkbox/Radio) | 전부 h48 FIXED | ✅ 미변경 |
| Option 세트 bounds | 848×**360** (344→360, List 행 +16 반영) | ✅ 정상, 붕괴 없음 |
| Option 미바인딩 raw hex | 0건 | ✅ 유지 |
| Option 비-Pretendard 폰트 | 0건 (textCount 10) | ✅ 유지 |
| Bottom Sheet 컨테이너(789:6337) | bounds 1256×456, 3변형(None 300·Single 376·Dual 376) 미변경 | ✅ 영향 없음(Text 옵션만 품음) |
| 컨테이너 미바인딩 hex / 폰트 | 0 / 0 (textCount 18) | ✅ 유지 |

### 최종 판정(재검증): **PASS** (❌(a) 0)
- ❌(a) **0건** — List 행 높이 수정 확인, 회귀 없음.
- ❓(c) 1건 **잔존** — lock 아이콘(ic_잠김, key 28aa6b…) 허용목록 미등록. 빌드 결함 아님(사용자 확인 사항). 사용자가 V2.2 확인 시 `allowed-remote-keys.json`+ICON_KEYS 에 키 추가하면 provenance 완전 green.
- 나머지 전 스캔 PASS. 전 variant 렌더 대조 완료(육안 미검증 없음).

---

# 재빌드 검증 (2026-07-03) — 소실 후 신규 노드

> 원본 빌드(786:6306 / 789:6337)가 사용자 파일 재정리 중 소실 → 계획대로 동일 재빌드.
> **신규 노드: Bottom Sheet Option `865:17` (x25800,y0) · Bottom Sheet `868:9184` (x25800,y560).**
> 원본 대비 지시된 변경: **시트·옵션행 표면을 `color/bg/level-0` → `color/surface/raised`(820:190)로 재바인딩.**
> MCP whoami 정상. 전 스캔 use_figma 실측(눈대중 0).

## 1. variant 전수·속성 ✅
- Option 8/8: Text/Default 863:6104 · Text/Selected 863:6107 · Checkbox/Default 863:6110 · Checkbox/Selected 863:6113 · Radio/Default 863:6116 · Radio/Selected 863:6119 · List/Default 864:36 · List/Disabled 864:48. 속성축 `Type×State` 정확.
- Container 3/3: None 868:6130 · Single 868:6153 · Dual 868:6178. 속성축 `Footer` 정확. 계획 1:1.

## 2. 패킹 ✅
- Option 848×360(2col wrap: 2×360+48+80=848 / 4행 48·48·48·64+3×24+80=360). List 행 hug h64, 셀렉션 행 h48.
- Container 1256×456(3×360+2×48+80 / 376+80). 좌표 붕괴·리스트 잘림 없음. Table 섹션(≤25600)과 미충돌.

## 3. 토큰 바인딩 ✅ (핵심: surface/raised 재바인딩 확인)
- 미바인딩 raw hex **0건**(865:17=34노드, 868:9184=36노드).

| 대상 | 실측 바인딩 | 지시/계획 | 판정 |
|------|-----------|-----------|------|
| 시트 표면(Footer=*) + 옵션행 표면(Type=*, 내부 Bottom Sheet Option) | `color/surface/raised` | **surface/raised(820:190), bg/level-0 아님** | ✅ 지시 준수 |
| 상단 radius tl/tr | `radius/modal/md` | modal/md | ✅ |
| 아바타 원(864:32·864:44) | `color/icon/gray-light` | icon 계열(bg 금지) | ✅ |
| 아바타 글리프 | `color/icon/white` | icon/white | ✅ |
| Text/Selected 라벨·✓ | `text/state/accent` · `icon/blue` | 동일 | ✅ |
| List 타이틀/서브 | `text/body/primary` · `/secondary` | 동일 | ✅ |
| 헤더 제목/닫기 | `text/title/primary` · `icon/gray-dark` | 동일 | ✅ |
| List/Disabled lock(864:20) | `color/icon/gray` | icon/gray | ✅ |
| 푸터 버튼 bg/label/radius | `button/bg·label/*--default` · `radius/4` | 컴포넌트 재사용 | ✅ |

→ EXACT 미바인딩 0. **시트·행 표면이 지시대로 surface/raised 로 재바인딩됨(bg/level-0 아님) 확인.**

## 4. 폰트 ✅
- Option textCount 10 / offender 0 · Container textCount 18 / offender 0. **비-Pretendard 0건.**

## 5. 재사용 무결성 / provenance ✅ (lock 이제 허용키 등록)
- Option 인스턴스 10 위반 0 / Container 인스턴스 21 위반 0.
- LOCAL_OK(remote=false): Checkbox(Default/Checked)·Radio(Default/Selected)·Button(primary/secondary LG Mobile)·Bottom Sheet Option Text(Default/Selected).
- ICON_OK(remote=true·허용키): check 5ab251e0 · account a423e2e0 · chevron e1ac97aa · **lock/ic_잠김 28aa6b16(이번 lastSynced 2026-07-03 허용키 등록 — 원 검증 ❓(c) 해소)** · close 2a1abbd3.
- **외부 라이브러리 위반 0. 순환참조 0**(Bottom Sheet 는 다른 세트 인스턴스 포함, 자기포함 아님).

## 6. 렌더 대조 ✅ (레거시 540:5862/540:5903 vs 재빌드)
- 8 옵션 + 3 컨테이너 전부 원본과 구조·정렬·색 시각 일치.
- **List/Default 쉐브론: 정상('>' 얇은 쉐브론) — 검은사각형 아님. stroke-recolor 수정 확인.**
- **List/Disabled 자물쇠: 정상(padlock+x).**
- 체크박스/라디오 off·on, Selected 블루+체크, 헤더+X, 푸터 single(풀와이드)/dual(secondary+primary) 원본 매칭.

## 재빌드 판정 요약
- **❌(a) 0건.**
- 🟡(b): 아바타 원 색 레거시 #E9E9E9 → `color/icon/gray-light`(gray/300 #C4C4C4) — 계획·사용자 지시 사전등록 편차, 유지.
- ❓(c) 1건(경미·취향): 푸터 버튼 라벨 "버튼"(재사용 Button 기본값) vs 레거시 데모 "라벨" — 플레이스홀더 텍스트 차이, 구조·토큰 무관. 미수정 시 기본값 유지.
- 참고(비차단): 컨테이너 높이 None 300 / Single·Dual 376 = 토큰 hug 산출값(계획 근사 302/378 대비 2px). 결함 아님.

### 최종 판정(재빌드): **PASS** (❌(a) 0)
전 스캔 PASS. 소실 전 원본을 원본·계획대로 충실 복원 + surface/raised 재바인딩 지시 반영 확인. 전 variant 렌더 대조 완료(육안 미검증 없음).

---

# 편집 검증 (2026-07-06) — 푸터 라벨 변경 + 다크 스펙 추가

> 🤖 원본대조 검증 에이전트(component-verifier) — figma-library-build 편집 검증. 빌더와 분리·직접 수정 안 함.
> **데이터 스캔 기준**(이 PC Pretendard 미설치 → 렌더는 새 라벨을 빈칸으로 보이므로 렌더 판정 배제, 노드 데이터만 신뢰). 전 스캔 use_figma 실측(눈대중 0). MCP whoami 정상(s1design pro).
> 대상: 컨테이너 세트 `868:9184`(Single 868:6153·Dual 868:6178) + 다크 스펙 프레임 `881:2`(인스턴스 881:3/881:33/881:65).

## 1. 라벨 정확성 (characters + fontName + textStyleId) ✅

| variant | 버튼 | characters | fontName | textStyleId | 판정 |
|---------|------|-----------|----------|-------------|------|
| Single 868:6153 | primary(파랑) | **"적용"** | Pretendard Medium | S:886ca7d2…(=body/16M) | ✅ |
| Dual 868:6178 | secondary(흰색) | **"취소"** | Pretendard Medium | S:886ca7d2…(=body/16M) | ✅ |
| Dual 868:6178 | primary(파랑) | **"적용"** | Pretendard Medium | S:886ca7d2…(=body/16M) | ✅ |

- Dual allTexts 순서 `[…, 취소, 적용]` = secondary(취소) → primary(적용), 지시 순서 일치. ✅
- **textStyleId 전부 body/16M 재바인딩 확인**(node-map body/16M = S:886ca7d230530051af94…와 prefix 일치). Inter/Noto 임시폰트 잔재 없이 최종 Pretendard.

## 2. 폰트 스캔 (비-Pretendard 잔존) ✅
| 스캔 루트 | textCount | offenderCount | 판정 |
|-----------|-----------|---------------|------|
| 컨테이너 세트 868:9184 | 18 | **0** | ✅ |
| 다크 프레임 881:2 | 18 | **0** | ✅ |

- getStyledTextSegments(['fontName']) 전 세그먼트 family=Pretendard. **Noto/Inter 0건** — 임시폰트→body/16M 텍스트 스타일 재바인딩 완료. 렌더 판정 없이 데이터로 확정.

## 3. 다크 스펙 프레임 881:2 ✅
- **explicit variable mode**: `{VariableCollectionId:8:963 : 8:2}` = Semantic Color V2 컬렉션의 **Dark 모드**. ✅ 지시 준수.
- **프레임 fill**: `VariableID:687:17884` = `color/bg/level-0` 바인딩(unbound 아님). ✅ 프레임 bg=bg/level-0.
- **자식 3개 전부 INSTANCE**(detach/복제 아님):
  | 인스턴스 | mainComp | remote | parentSet | 라벨 반영 | 판정 |
  |----------|----------|--------|-----------|-----------|------|
  | 881:3 | 868:6130 Footer=None | **false** | Bottom Sheet | (푸터 없음) | ✅ |
  | 881:33 | 868:6153 Footer=Single | **false** | Bottom Sheet | ["적용"] | ✅ |
  | 881:65 | 868:6178 Footer=Dual | **false** | Bottom Sheet | ["취소","적용"] | ✅ |
- 인스턴스가 **라이트 컨테이너 변형(로컬 remote=false) 상속** → 라벨 override(적용/취소) 다크에도 반영 확인. ✅
- **미바인딩 raw hex 0건**(다크 프레임 전 노드 SOLID fill/stroke 스캔). ✅

## 4. 순환참조 / 기존 라이트 세트 무영향 ✅
- 다크 프레임은 일반 FRAME 이 Bottom Sheet 세트 변형의 인스턴스를 품음(자기 세트 형제 미포함) → 순환참조 0.
- 라벨 변경은 라이트 변형(868:6153/868:6178) 자체에 적용 = 지시된 편집(푸터 라벨 변경)이자 다크 인스턴스가 상속하는 정본. 회귀 아님.
- 컨테이너 세트 미바인딩 hex 0 / 폰트 offender 0 = 기존 바인딩·폰트 무손상.

## 판정 요약 (편집 검증)
| 스캔 | 결과 |
|------|------|
| 라벨 정확성(chars+font+style) | ✅ PASS (적용/취소/적용, Pretendard Medium, body/16M) |
| 비-Pretendard 폰트 | ✅ PASS (컨테이너 0·다크 0) |
| 다크 프레임 Dark 모드 | ✅ PASS (Semantic Color V2 → 8:2 Dark) |
| 다크 인스턴스(3변형·INSTANCE·상속) | ✅ PASS (None/Single/Dual, remote=false, 라벨 상속) |
| 미바인딩 raw hex | ✅ PASS (컨테이너 0·다크 0, 프레임 bg=bg/level-0) |
| 순환참조 / 라이트 세트 무영향 | ✅ PASS |

### 최종 판정(편집 검증): **PASS** (❌(a) 0 · ❓(c) 0)
- ❌(a) **0건**. 🟡(b)·❓(c) 없음.
- 참고(비차단·결함 아님): 편집한 Pretendard 라벨이 MCP 렌더 프리뷰에 빈칸으로 보이는 것은 이 PC Pretendard 미설치 환경 제약(hasMissingFont). 데이터(characters·fontName·textStyleId)가 정확하므로 PASS.
