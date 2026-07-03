# Bottom Sheet — 1단계 재고조사 (figma-library-build)

> 🤖 Figma원본 조사 에이전트(figma-inspector) 작성. 읽기·기록만 — 빌드 없음.
> 원본 파일(레거시): `yE5UCFEbmXJBlYJWB24Lz2` (SW UX GUIDE V2.4)
> 소스 노드: 옵션(행 모음) `540:5862` (bottomsheet_option) · 컨테이너 `540:5903` (mobile_bottomsheet)
> 조사일: 2026-07-03 · 값은 전부 MCP `get_design_context`+`get_variable_defs` 실측. 못 읽은 값만 `미확인`.

---

## A. 소스 요소 전수표 — 옵션 행 5종 / 8변형 (노드 540:5862)

메타데이터상 행 폭 공통 **360px**. 상태별 개별 심볼로 존재.

| # | 행 종류 | 노드 | 상태(state) | 높이 | 패딩(px/py) | 내부 배치 | 텍스트 | 아이콘/컨트롤 |
|---|---------|------|------------|------|-------------|-----------|--------|--------------|
| ① | 텍스트 선택행 default | 540:5863 | default | 48 (sizing/48) | 20 / 8 (inline-md / block-xxs) | 라벨만, items-center | "항목" body/16M, `color/text/body/primary` #353535 | 없음 |
| ①' | 텍스트 선택행 selected | 540:5893 | checked | 48 | 20 / 8 | justify-between: 라벨 ↔ 체크 | "항목" body/16M, `color/text/state/accent` #1d6ceb | 우측 ✓ "ok" 아이콘 24px (파랑) |
| ② | 체크박스 행 off | 540:5881 | default | 48 | 20 / 8 | gap 8(cluster-xxs): [체크박스] 라벨 | "항목" body/16M `color/text/body/primary` | 체크박스 18px(내부노드 540:3135) |
| ②' | 체크박스 행 on | 540:5887 | checked | 48 | 20 / 8 | gap 8: [체크박스✓] 라벨 | 동일 | 체크박스 18px 채워짐(540:3139), 내부 ✓ 16px |
| ③ | 라디오 행 off | 540:5884 | default | 48 | 20 / 8 | gap 8: [라디오] 라벨 | 동일 | 라디오 18px(540:3114) |
| ③' | 라디오 행 on | 540:5890 | checked | 48 | 20 / 8 | gap 8: [라디오●] 라벨 | 동일 | 라디오 18px(540:3118) + 점 10px(sizing/10) |
| ④ | 아바타+타이틀+서브+chevron | 540:5865 | default (text_more) | ~65 (hug) | 20 / 12 (inline-md / block-xs) | justify-between: [아바타40 + (타이틀/서브)] ↔ chevron | 타이틀 "항목 타이틀" body/16M `text/body/primary`; 서브 "항목 서브" body/14R `text/body/secondary` #555; 타이틀↔서브 gap 2 | 아바타 40px 원 + chevron(>) 24px 우측 |
| ⑤ | 아바타+타이틀+서브+lock (=disabled) | 540:5873 | default (text_state) | ~65 (hug) | 20 / 12 | justify-between: [아바타40 + (타이틀/서브)] ↔ lock | 동일 (④와 같은 텍스트 토큰) | 아바타 40px 원 + lock(잠금) 24px 우측 |

### 컨트롤/아바타 세부 (색·토큰)
| 부품 | 치수 | fill / border | raw hex | 바인딩 토큰 |
|------|------|---------------|---------|-------------|
| 체크박스 off (540:3135) | 18 (sizing/18), radius 2 (radius/control/xs) | bg / border | #ffffff / #d9d9d9 | `color/control/bg/default` / `color/control/border/default` |
| 체크박스 on (540:3139) | 18, radius 2, 내부 ✓ 16 | bg / border | #1d6ceb / #1d6ceb | `color/control/bg/selected` / `color/control/border/selected` |
| 라디오 off (540:3114) | 18, radius full | bg / border | #ffffff / #d9d9d9 | `color/control/bg/default` / `color/control/border/default` |
| 라디오 on (540:3118) | 18, radius full, 점 10 (sizing/10) | bg / border / 점 | #ffffff / #1d6ceb / #1d6ceb | bg `color/control/bg/selected-alt` · border `color/control/border/selected` · 점 `color/control/indicator/selected` |
| 아바타 원 (④⑤) | 40 (sizing/40), radius full | bg | #e9e9e9 | `surface/neutral/bg/strong` (레거시명) |
| 아이콘 공통 | 24 (sizing/icon/24) | — | — | 색은 상태별(아래) |

### 상태별 색 차이 요약
- **텍스트 행**: default 라벨 = `color/text/body/primary`(#353535) → selected 라벨 = `color/text/state/accent`(#1d6ceb) + 우측 ✓.
- **체크박스/라디오**: off = 흰 bg + 회색 보더(#d9d9d9) → on = 파랑(#1d6ceb) 채움/보더(체크박스) / 흰 bg+파랑 보더+파랑 점(라디오).
- **disabled(⑤)**: 별도 색 감산 없이 우측 아이콘이 **lock(잠금)** 으로 바뀌는 것으로 표현(텍스트 색은 ④와 동일 — 레거시가 dim 처리 안 함, 개선여지 (b) 후보).

> ⚠️ **레거시 토큰명 주의(중요):** 라디오 checked 가 쓰는 `color/control/indicator/selected`(#1d6ceb, 점) / `color/control/bg/selected-alt`(#fff) 는 **현행 vars-data 와 의미가 뒤바뀜** — 현행: `indicator/selected`=base/white, `indicator/selected-alt`=blue/400. 레거시 이름을 그대로 복사하면 색이 뒤집힌다. → **행 ②③ 은 레거시 raw 를 흉내내지 말고 라이브러리 Checkbox/Radio 컴포넌트를 인스턴스로 재사용**해야 함(재사용이 정답, 아래 needs-decision).

---

## B. 소스 요소 전수표 — 컨테이너 3변형 (노드 540:5903)

시트 공통: **width 360 고정**, 상단 radius **8** (rounded-tl/tr 8, 하단 0), bg `surface/neutral/bg/base`(#ffffff, 레거시명), overflow-clip. **드래그 핸들 바 없음. 딤/스크림 없음**(시트 노드 자체엔 미포함).

| footer 변형 | 노드 | 크기(w×h) | 상하 패딩 | 섹션 간격 | 푸터 구성 |
|-------------|------|-----------|-----------|-----------|-----------|
| off (버튼없음) | 540:5904 | 360×302 | pt 20(block-md) / pb 40(spacing/40) | 리스트블록↔(없음): section/xxl / 헤더↔리스트: section/md 24 | 없음 |
| single (풀와이드 1개) | 540:5914 | 360×378 | py 20(block-md) | 리스트블록↔푸터: section/xxl 48 / 헤더↔리스트 24 | primary 1개, flex-1 풀와이드, h48 |
| dual (2개) | 540:5926 | 360×378 | py 20 | section/xxl 48 / 헤더↔리스트 24 | secondary + primary, gap 8(cluster-xxs), 각 flex-1, h48 |

### 컨테이너 내부 구조·토큰
| 영역 | 세부 | 값 | 토큰 |
|------|------|----|------|
| 시트 표면 | fill | #ffffff | `surface/neutral/bg/base` (레거시명 → 현행 needs-decision) |
| 상단 radius | tl/tr | 8 (raw, 미바인딩) | 권장 `radius/modal/md`(=radius/8=8) |
| 헤더 행 | 패딩 px 20, justify-between | inline-md | `spacing/padding/inline/md` |
| 헤더 제목 | "헤더 타이틀" | title/20B, #000000 | `color/text/title/primary` |
| 헤더 닫기 | ic_닫기 24px | — | 아이콘색 미명시(get 결과 없음) → 관례 `color/icon/gray-dark` (미확인, needs 확인) |
| 헤더↔리스트 간격 | gap | 24 | `spacing/section/md` |
| 리스트 영역 | flex-col, 행간 gap 0(행이 세로 스택) | 0 | — |
| 리스트↔푸터 간격 | gap | 48 | `spacing/section/xxl` |
| 푸터 | 패딩 px 20, (dual) gap 8 | inline-md / cluster-xxs | `spacing/padding/inline/md` / `spacing/cluster/xxs` |
| 푸터 버튼 | h48, radius 4, border 1, px16/py16 | — | primary/secondary = `color/button/{bg,border,label}/{primary,secondary}--default`, `radius/4`, `border-width/100`, `spacing/padding/inline/sm`·`block/sm` |

- 헤더 닫기 = **ic_닫기 (main 89:4927)** — ICON_KEYS.close 와 동일.
- 푸터 버튼은 별도 컴포넌트가 아니라 시트 안에 그려진 mobile 버튼(h48). → **라이브러리 Button(Size=LG/Mobile, primary/secondary) 인스턴스 재사용 대상.**

---

## C. 기존 라이브러리 현황 (충돌·재사용·아이콘·토큰·배치)

### 이름 충돌
- 코드/registry 전수 검색: 범용 "Bottom Sheet"/"바텀시트" **컴포넌트 세트는 없음(충돌 없음)**.
- 단, 유사 선례 존재: `reports/figma-library-build/mobile-datepicker-bottomsheet/` — **DatePicker 전용** 바텀시트 세트가 **빌드 파일 `cysG5U1udpQqVagYY1hWHW`(V3.0)** 에 이미 빌드됨(세트 523:7771, `type × state` 축). 네이밍 컨벤션 참고: 세트명 소문자+underscore, variant 축은 `속성=값` 형식. 범용 바텀시트와 별개 컴포넌트로 두는 게 맞음(중복 아님).

### 재사용 대상 컴포넌트 (인스턴스로 부착)
| 대상 | 용도 | 라이브러리 key(target) | 상태 |
|------|------|------------------------|------|
| Checkbox | 행 ② off/on | figma-map.json = 빈 문자열 | **미확인** — 빌드 파일에 존재하는 Checkbox 세트 노드 id 확인 필요 |
| Radio | 행 ③ off/on | figma-map.json = 빈 문자열 | **미확인** — 동일 |
| Button primary/secondary | 푸터 single/dual | figma-map.json = 빈 문자열. 선례: datepicker 빌드가 `508:7042`(Button LG/Mobile/primary) 인스턴스 재사용 | **부분확인** — 빌드 파일 Button 세트 노드 id 로 재사용 가능 |

> 세 컴포넌트 모두 registry `componentSetKey` 가 비어 있음. **재사용은 빌드 대상 파일(cysG5U1udpQqVagYY1hWHW 로 추정) 안의 실제 컴포넌트 노드**로 해야 함 → 빌드 단계(2·3)에서 대상 파일·노드 id 확정 필요(needs-decision).

### 아이콘 라이브러리 key (build-components.ts ICON_KEYS 대조)
| 소스 아이콘 | 소스 노드 | 용도 | ICON_KEYS 매칭 | 상태 |
|------------|----------|------|----------------|------|
| ic_닫기 (X) | 89:4927 | 헤더 닫기 | `close` = 2a1abbd3…(89:4927) | ✅ 일치 |
| ic_화살표,더보기 (chevron ›) | 563:3158 (line) | ④ 우측 | `chevron` = e1ac97aa…(419:69), rotation 0 | ⚠️ 노드 id 상이(같은 계열 추정) — 확인 권장 |
| ic_확인 (체크 ✓) | 540:5895 "ok" | ①' 우측 | `check` = 5ab251e0…(97:167) | ⚠️ 노드 상이(같은 ✓ 계열) — 색 `color/icon/blue` |
| ic_계정/사용자/ID (아바타) | 150:5086 | ④⑤ 아바타 | `account` = a423e2e0…(86:58) | ⚠️ 노드 상이(다른 account 아이콘) — 확인 필요 |
| ic_잠김 (lock) | 154:7802 | ⑤ 우측 | **없음** | ❌ ICON_KEYS 미등록 — key 확보 필요 |

### 토큰 Variable 존재 확인 (vars-data.ts 교차)
| 소스 토큰(레거시명) | 용도 | 현행 vars-data | 판정 |
|---------------------|------|----------------|------|
| `color/text/body/primary` `/secondary` | 라벨·서브 | 존재(값 gray/900·gray/800) | ✅ (값은 현행 적용) |
| `color/text/title/primary` | 헤더 제목 | 존재 | ✅ |
| `color/text/state/accent` · `color/icon/blue` | selected 라벨·✓ | 존재(blue/400) | ✅ |
| `color/icon/gray`·`/gray-dark` | 아이콘 | 존재 | ✅ |
| `color/control/bg·border/default`·`/selected` | 체크박스/라디오 | 존재 | ✅ (단 라이브러리 컴포넌트 재사용 권장) |
| `color/control/indicator/selected`·`bg/selected-alt` | 라디오 점/바탕 | 존재하나 **의미 뒤바뀜** | ⚠️ 레거시명 복사 금지 → 컴포넌트 재사용 |
| `color/button/{bg,border,label}/{primary,secondary}--default` | 푸터 버튼 | 존재 | ✅ (버튼 컴포넌트 재사용) |
| `color/overlay` | 딤/스크림(빌드 시) | 존재 rgba(0,0,0,.5) | ✅ |
| radius: `radius/control/xs`(2)·`radius/4`·`radius/8`·`radius/modal/md`·`radius/full` | 각부 | 존재 | ✅ |
| spacing: `padding/inline/md·sm`·`padding/block/xxs·xs·md·sm`·`section/md·xxl`·`cluster/xxs`·`spacing/2·8·40` | 레이아웃 | 존재 | ✅ |
| sizing: `sizing/48·40·18·16·10`·`sizing/icon/24` | 각부 | 존재 | ✅ |
| border: `border-width/default`(=100, 1) | 컨트롤/버튼 | 존재 | ✅ |
| **`surface/neutral/bg/base`** (#fff 시트+행 표면) | 시트/행 바탕 | **없음**(현행 surface/* 드롭) | ❌ needs-decision → 후보 `color/bg/level-0`(base/white) |
| **`surface/neutral/bg/strong`** (#e9e9e9 아바타 원) | 아바타 바탕 | **없음** | ❌ needs-decision(≈ color/bg/level-3, 정확치 불일치) |
| **`surface/neutral/bg/subtle`** (#f5f5f5) | (변수엔 있으나 행 코드 미사용) | **없음** | ❌ needs-decision(사용처 미확인) |

### 배치 후보 좌표
- 실제 빌드 대상 파일(추정 `cysG5U1udpQqVagYY1hWHW` V3.0)의 캔버스 여백은 이 조사(소스 파일)에서 확인 불가. 선례 좌표: datepicker 세트 x=2064,y=7949 / Line Tab x=4736,y=140.
- **배치 좌표는 빌드 단계에서 대상 파일 metadata 로 빈 영역 확정 필요(needs-decision).** 권장: 기존 mobile 계열 컴포넌트(datepicker bottomsheet) 인근의 겹치지 않는 우측/하단 빈 밴드.

---

## D. 집계 및 목록

- **총 소스 요소: 11** = 옵션 행 8변형(텍스트 default/checked, 체크박스 default/checked, 라디오 default/checked, text_more, text_state) + 컨테이너 3변형(off/single/dual).
- **재사용 대상 컴포넌트: 3** (Checkbox, Radio, Button primary/secondary).
- **재사용 아이콘: 5** (close ✅ / chevron ⚠️ / check ⚠️ / account ⚠️ / lock ❌).

### 충돌
- 없음(범용 Bottom Sheet 미존재). DatePicker 전용 바텀시트와는 별개 컴포넌트.

### 미확인
1. 헤더 닫기 아이콘 색(MCP 미제공) — 관례상 `color/icon/gray-dark` 추정.
2. Checkbox/Radio/Button 재사용 대상 노드 id(빌드 파일 내) — registry key 전부 빈 문자열.
3. chevron/check/account 아이콘의 소스 노드 vs ICON_KEYS 노드 id 상이(동일 계열 여부).

### needs-decision 후보
1. **시트/행 표면색** `surface/neutral/bg/base`(#fff) → 현행 토큰 없음. 후보 `color/bg/level-0`. (전용 토큰 신설 금지 방침 → 기존 매핑 확정 필요)
2. **아바타 원 배경** `surface/neutral/bg/strong`(#e9e9e9) → 정확 매칭 토큰 없음(≈ color/bg/level-3). 아바타 행(④⑤) 자체를 세트에 포함할지 포함 여부도 결정 대상.
3. **라디오/체크박스 raw 재현 금지** — 레거시 `indicator/selected`·`bg/selected-alt` 의미 역전 → 라이브러리 컴포넌트 인스턴스 재사용으로 해결(확정 권장).
4. **lock 아이콘 key** — ICON_KEYS 미등록. ic_잠김(154:7802) key 확보 또는 ⑤ disabled 행 처리 방식 결정.
5. **상단 radius 바인딩** — 레거시 raw 8 → `radius/modal/md` 바인딩 확정 권장.
6. **드래그 핸들/딤 스크림** — 소스 시트 노드엔 없음. 세트에 포함할지(핸들 바·color/overlay 스크림) 결정 대상.
7. **빌드 대상 파일·배치 좌표** — 소스 파일에서 확인 불가. 대상 파일(V3.0) 확정 + 빈 영역 좌표.

### 토큰 방침
바텀시트 전용 토큰층 신설 안 함. 색·컴포넌트 전부 기존 재활용. 매핑 근거는 위 C·D 표에 확보. "집 없는 색"(surface/neutral/bg/*) 은 needs-decision 1·2 로 등록.
