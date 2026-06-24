# 4단계 검증 결과 — Mobile Date Picker/Bottom Sheet (§C 라이브러리 빌드 검증)

> 검증 주체: 🤖 component-verifier (빌더 figma-library-builder 와 분리 컨텍스트)
> 대상: 컴포넌트 세트 485:7896 (V3.0 cysG5U1udpQqVagYY1hWHW · Core 페이지)
> 기준: node-map.json + 검증 지시 inline plan + provenance-scan.md(키 기반) + figma-binding-lookup.js
> ⚠️ 주의: `2-plan.md`·`1-inventory.md` 가 존재하지 않음(node-map.json 만 있음) → **허용편차 선언서 부재**. raw hex (b) 우회 조건 1(스코프 명시) 자동 실패 근거.

---

## 기계 검증 요약

| 항목 | 결과 | 비고 |
|------|------|------|
| variant 전수 | ✅ PASS | Type=Default(484:4727) / Type=Date_time(484:7742) 2개 모두 존재 |
| variant 속성 | ✅ PASS | `Type = Default \| Date_time` (variantGroupProperties 확인) |
| 패킹 정상 | ✅ PASS | 세트 780×592. v1=(0,0,360×530), v2=(420,0,360×592). 겹침·붕괴 없음 |
| 순환 참조 | ✅ PASS | 세트 자기 variant 인스턴스 0건 (circular=[]) |
| 컨테이너 fill 바인딩 | ✅ PASS | `color/date-picker/bg/panel`(8:1088) 바인딩. Light #ffffff / Dark #1c1d23 = `color/surface/default` 와 동일값. raw hex 아님 |
| radius 바인딩 | ✅ PASS | topLeft/topRight = `radius/modal/md`(8:1196)=8px 바인딩. bottomLeft/bottomRight = 0 |
| 닫기 아이콘 | ✅ 부분 | 24×24 인스턴스(raw 벡터 직삽입 아님). 글리프 fill = `color/text/title/primary` 바인딩. **단 mainComponent 키 미등록 → provenance ❓(c)** |
| 인스턴스 정합 | ✅ PASS | Calendar(480:18986)·Tab Selected(480:12819)·Tab Unselected(480:12813)·Button(480:12259) 모두 기대 mainComponent 참조·로컬(remote=false) |
| 네이밍 | ✅ PASS | 세트명 "Mobile Date Picker/Bottom Sheet", 속성 "Type" |

---

## 🔑 인스턴스 출처(provenance) 표 — 키 기반 (HARD RULE)

provenance-scan.md 의 키 스캔을 실제 실행(remote·key·name 출력). 허용목록 = allowed-remote-keys.json.

| instName | mcName | remote | key | 판정 |
|----------|--------|--------|-----|------|
| Calendar | State=Date | false | d566f24915… | LOCAL_OK ✅ |
| Calendar Cell (×다수) | Type=Standard, State=* | false | 57c8c9…/d18153…/c706f5…/34c390… | LOCAL_OK ✅ |
| chevron (Calendar 내부) | Property 1=line | true | **e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581** | ICON_OK ✅ (허용목록 chevron 키) |
| Button | Size=LG,…,Primary,Mobile | false | 2a4fea26… | LOCAL_OK ✅ |
| Tab 날짜 | Size=SM,Selected,Mobile | false | 9bf3f2cc… | LOCAL_OK ✅ |
| Tab 시간 | Size=SM,Unselected,Mobile | false | 3efe2c24… | LOCAL_OK ✅ |
| **ic_닫기** (×2, 헤더 닫기) | Property 1=Line | **true** | **2a1abbd3597b536e34fd9523fb61eade3afe9934** | **허용목록 미등록 → ❓(c)** |

- 외부 라이브러리 위반(remote=true & 미등록 & 비-아이콘) = **0건**.
- `ic_닫기` 만 remote=true & 허용목록 미등록. 이름이 `ic_*`(아이콘) → provenance-scan §위반처리 트리 2번 "아이콘인데 허용목록에 없으면 (c)애매" 규칙 적용 → **(a) 외부위반 단정 금지, (c) 사용자 확인.** 정식 V2.2 아이콘이면 build-components.ts ICON_KEYS + allowed-remote-keys.json 에 키 추가.

---

## raw hex 잔류 — (b) 우회 2단계 잠금 검사

figma-binding-lookup.js 실제 실행 결과 + 허용편차 선언 대조.

| hex 값 | 노드·속성 | 허용편차 명시 여부 | DS 조회 결과 | 판정 |
|--------|-----------|-------------------|-------------|------|
| #ffffff | Type=Default > Header fill | 미명시(선언서 부재) | EXACT: color/surface/default(=Light #fff / Dark #1c1d23) | ❌(a) |
| #ffffff | Type=Default > Calendar Area fill | 미명시 | EXACT: color/surface/default | ❌(a) |
| #ffffff | Type=Default > Button Area fill | 미명시 | EXACT: color/surface/default | ❌(a) |
| #ffffff | Type=Date_time > Header fill | 미명시 | EXACT: color/surface/default | ❌(a) |
| #ffffff | Type=Date_time > Tab Bar fill | 미명시 | EXACT: color/surface/default | ❌(a) |
| #ffffff | Type=Date_time > Calendar Area fill | 미명시 | EXACT: color/surface/default | ❌(a) |
| #ffffff | Type=Date_time > Button Area fill | 미명시 | EXACT: color/surface/default | ❌(a) |

- 조건 1(허용편차 스코프 명시): 선언서 자체가 없음 → **실패**.
- 조건 2(DS 등가물 없음 확인): figma-binding-lookup = **EXACT 1종(#FFFFFF → color/surface/default)** → **실패(등가물 존재 = 무조건 ❌(a))**.
- 두 조건 모두 실패 → (b) 불가 → **❌(a) 7건**.
- 참고: 컨테이너 자체는 surface 바인딩 정상. 내부 하위 프레임(Header/Calendar Area/Button Area/Tab Bar)만 흰색 raw fill. 컨테이너와 동일 surface 토큰 바인딩 또는 fill 제거(투명·컨테이너 상속) 필요.

---

## 렌더 검증 (get_screenshot 시각 대조)

### ❌(a) 달력 우측 컬럼 클리핑 — 시각 깨짐
- Calendar 컴포넌트 **네이티브 폭 = 372px**(7열 월~일 완전 표시 + ‹ › 월 내비게이터 표시).
- datepicker 내부: Calendar Area(360px, 좌우 padding 24+24=48) → 내용폭 **312px** 로 Calendar 인스턴스를 STRETCH 압축. Calendar Area `clipsContent=true`.
- 결과(두 variant 공통): 7열 그리드가 312px 에 안 맞아 **우측 '일' 컬럼·우측 끝 날짜 잘림 + 좌측 '월' 컬럼 잘림 + ‹ › 월 내비게이터 클리핑 소실**. V2.4 원본(완전한 달력 그리드) 대비 시각 불일치.
- 원인: 고정 그리드 폭(372px) 컴포넌트를 312px 클리핑 프레임에 욱여넣음. → 패널/달력영역 좌우 padding 축소(예: 6px → 내용폭 348px) 또는 Calendar Area 폭 확대 필요. **빌드 측 레이아웃 결함 = ❌(a).**

### ✅ 정상 렌더 항목
- 헤더: "날짜 선택" + 우측 닫기(X) 아이콘 — 위치·정렬 정상.
- Date_time 탭바: 날짜(Selected, 파란 언더라인) / 시간(Unselected) — V2.4 원본 구조와 일치.
- 버튼: 하단 primary 버튼 full-width 정상 배치.

---

## ❓(c) 확인 요청 — 사용자 판단 필요

1. **닫기 아이콘 출처(ic_닫기, key 2a1abbd3…)** — remote=true 이고 allowed-remote-keys.json 미등록. 이름이 `ic_*` 라 (a) 외부위반 단정 안 함. **이 아이콘이 정식 아이콘 라이브러리 V2.2(YcBbW9e0…) 컴포넌트가 맞는지** 확인 요청. 맞으면 ICON_KEYS + allowed-remote-keys.json 에 `close: 2a1abbd3…` 키 추가하면 향후 ICON_OK 로 통과. (글리프 색은 `color/text/title/primary` 바인딩 정상이라 색은 문제없음.)
2. **버튼 라벨 "버튼" 플레이스홀더** — 두 variant Button 인스턴스 텍스트가 "버튼"(placeholder). V2.4 원본 datepicker 적용 버튼 라벨(예: "확인"/"적용")로 세팅해야 하는지, 아니면 라이브러리 컴포넌트라 소비자 오버라이드 전제로 placeholder 유지할지 확인 요청.
3. **타이틀 텍스트 스타일 미바인딩** — "날짜 선택" 타이틀이 Noto Sans KR Bold 20(font fallback)은 (b) 허용이나 `textStyleId=none`(V2.4 Pretendard 텍스트 스타일 setTextStyleIdAsync 미적용). MEMORY "패턴 텍스트는 Figma 텍스트 스타일" 규칙상 텍스트 스타일 바인딩이 권장 패턴 — 적용 여부 확인. (탭 라벨은 V2.2 인스턴스 내부라 해당 없음.)

---

## 🟡(b) 허용편차 (사전 등록·코드 유지)

1. **폰트 폴백 Noto Sans KR** — Pretendard MCP 로드 불가(Figma 빌드 제약, node-map fontFallback 명시·MEMORY 등록됨). 타이틀 Bold·탭 Medium. 코드 유지 + Figma 개선목록(추후 Pretendard 텍스트 스타일 바인딩). (단 §c-3 textStyleId 미적용은 별건으로 확인 요청.)

---

## 판정

| 결과 | 조건 | 현재 |
|------|------|------|
| FAIL | ❌(a) ≥ 1 | **❌(a) 8건** → 빌더 재작업 |

### ❌(a) 코드/빌드 실수 — 수정 대상 (8건)
- ❌(a) 1~7: 내부 하위 프레임 7개(Header·Calendar Area·Button Area ×Default, Header·Tab Bar·Calendar Area·Button Area ×Date_time) raw #ffffff fill → `color/surface/default` 바인딩 또는 fill 제거(컨테이너 상속). DS EXACT 등가물 존재·허용편차 선언서 부재로 (b) 불가.
- ❌(a) 8: 달력 우측/좌측 컬럼·월 내비게이터 클리핑(372px 고정폭 Calendar 를 312px 클리핑 프레임에 압축). 패널 좌우 padding 축소 또는 Calendar Area 폭 확대로 7열 완전 표시 복원.

### ❓(c) 확인 요청 (3건)
- ic_닫기 키 미등록(정식 V2.2 아이콘 여부) / 버튼 "버튼" placeholder 라벨 / 타이틀 textStyle 미바인딩.

### ✅ 통과 항목
- variant 전수·속성·패킹·순환참조·컨테이너 fill 바인딩·radius 바인딩·인스턴스 정합·네이밍·외부라이브러리 위반 0.

> 본 검증은 직접 수정하지 않음. ❌(a) 8건은 figma-library-builder 재작업, ❓(c) 3건은 사용자 확인 대상.
