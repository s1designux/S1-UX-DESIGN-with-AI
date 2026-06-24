# 4단계 검증 결과 — Mobile Date Picker/Bottom Sheet (§C 라이브러리 빌드 검증)

> 검증 주체: 🤖 component-verifier (빌더 figma-library-builder 와 분리 컨텍스트)
> 대상: 컴포넌트 세트 485:7896 (V3.0 cysG5U1udpQqVagYY1hWHW · Core 페이지)
> 기준: node-map.json + 검증 지시 inline plan + provenance-scan.md(키 기반) + allowed-remote-keys.json

---

## 2차 검증 결과 (재검증 — 빌더 rework 후)

❌(a) 수: **0건**
🟡(b) 수: 1건 (허용편차 — Pretendard→Noto fallback)
❓(c) 수: 1건 (사용자 미확정 — ic_닫기 키, 단 사용자 "허용·유지" 의사 표명됨)

| 항목 | 결과 | 세부 |
|------|------|------|
| raw fill 잔류 | ✅ | 두 variant 전체 노드 순회 — 미바인딩 흰색 fill **0건**. 이전 7건(Header/Calendar Area/Button Area/Tab Bar) 모두 fills=[] 제거 또는 바인딩 상속. 현재 모든 흰색 fill은 Variable 바인딩(color/date-picker/bg/panel·bg/today·text/selected·button/label/primary--default) |
| 달력 클리핑 해소 | ✅ | Calendar Area padding 24→**0** (두 variant), Calendar 인스턴스 FILL(360px). 렌더: 7열(월~일)·‹ › 월 내비게이터·전 날짜 클리핑 없이 완전 표시 |
| 버튼 라벨 | ✅ | 두 Button 인스턴스 characters="적용" (node name 은 "버튼" 유지=라이브러리 부품명, 표시 텍스트는 적용). 텍스트스타일 S:886ca7…(button label) 유지 |
| 텍스트 스타일 | ✅ | "날짜 선택" 타이틀 2노드 textStyleId=S:46f6df…(title/20B) 바인딩됨 |
| 컨테이너 fill 바인딩 | ✅ | 두 variant 최상위 = color/date-picker/bg/panel (8:1088). radius topLeft/topRight=radius/modal/md, bottom=0 |
| 패킹 정상 | ✅ | 세트 780×592. v1(0,0,360×530)·v2(420,0,360×592). 겹침·붕괴 없음 |
| 순환참조 | ✅ | 세트 자기 variant 인스턴스 0건 (circular=[]) |

---

## 인스턴스 출처(provenance) — 키 기반 (HARD RULE)

allowed-remote-keys.json 대조. 두 variant 하위 전체 INSTANCE 순회.

| instName | mcName | remote | key | 판정 |
|----------|--------|--------|-----|------|
| ic_닫기 (×2 헤더) | Property 1=Line | true | 2a1abbd3597b536e34fd9523fb61eade3afe9934 | 허용목록 미등록 → ❓(c) (이름 ic_*=아이콘, (a) 단정 금지) |
| chevron (Calendar 내부 ×4) | Property 1=line | true | e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581 | ICON_OK ✅ (허용목록 chevron) |
| Calendar (×2) | State=Date | false | d566f249… | LOCAL_OK ✅ |
| Calendar Cell (×다수) | Type=Standard, State=* | false | 57c8c9…/d18153…/c706f5…/34c390… | LOCAL_OK ✅ |
| Button (×2) | Size=LG,…,Primary,Mobile | false | 2a4fea26… | LOCAL_OK ✅ |
| Tab 날짜 | Size=SM,Selected,Mobile | false | 9bf3f2cc… | LOCAL_OK ✅ |
| Tab 시간 | Size=SM,Unselected,Mobile | false | 3efe2c24… | LOCAL_OK ✅ |

- 외부 라이브러리 위반(remote=true & 미등록 & 비-아이콘) = **0건**.
- ic_닫기 만 remote=true & 미등록. ic_* 아이콘 → (c). 사용자 "허용·유지" 확정(node-map 🔧5). 정식 V2.2 면 build-components.ts ICON_KEYS + allowed-remote-keys.json 에 `close: 2a1abbd3…` 추가 권장(향후 ICON_OK).

---

## 렌더 검증 (get_screenshot 시각 대조)

### ✅ Type=Default (484:4727)
- 헤더 "날짜 선택" + 우측 닫기(X) — 정상.
- 달력 7열(월~일) 완전 표시, ‹ › 월 내비게이터 양쪽 표시, 클리핑 0.
- 하단 primary 버튼 "적용" full-width 정상.

### ✅ Type=Date_time (484:7742)
- 헤더 동일 정상.
- 탭바: 날짜(Selected 파란 언더라인) / 시간(Unselected) — V2.4 구조 일치.
- 달력 완전 표시, "적용" 버튼 정상.

---

## 🟡(b) 허용편차 (사전 등록·코드 유지)
1. 폰트 폴백 — 편집 시 Noto Sans KR 일시 오버레이 후 text style 재바인딩으로 Pretendard 렌더 복원(node-map fontFallback). 타이틀 title/20B·버튼 button label 텍스트스타일 정상 바인딩. Figma 빌드 제약(MEMORY 등록).

## ❓(c) 확인 요청
1. ic_닫기(key 2a1abbd3…) — remote=true·allowed-remote-keys.json 미등록. 사용자 "허용·유지" 의사 표명됨. 정식 V2.2 아이콘이면 키 등록 시 향후 자동 ICON_OK 처리. 색은 color/text/title/primary 바인딩 정상.

---

## 판정

| 결과 | 조건 | 현재 |
|------|------|------|
| **PASS** | ❌(a) = 0 | **❌(a) 0건** → 검문소 4 통과 |

### 이전 1차 ❌(a) 8건 → 전부 해소
- ❌(a) 1~7 raw #ffffff fill 7건: 미바인딩 흰색 fill 전체 0건 확인 ✅
- ❌(a) 8 달력 클리핑: padding 0·Calendar FILL·렌더 7열 완전 표시 ✅

### ✅ 통과 항목
- variant 전수·속성·패킹·순환참조·컨테이너 fill 바인딩·radius 바인딩·raw fill 0·달력 클리핑 해소·버튼 라벨 적용·타이틀 텍스트스타일·외부라이브러리 위반 0.

> 본 검증은 직접 수정하지 않음. ❌(a) 0건으로 검문소 4 PASS. ❓(c) 1건(ic_닫기 키 등록)은 사용자가 "허용·유지" 확정한 사항으로 통과 차단 아님.
