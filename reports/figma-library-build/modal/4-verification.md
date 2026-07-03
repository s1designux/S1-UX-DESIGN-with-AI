# 4-verification — Modal (공통 팝업) 라이브러리 빌드 검증

> 4단계 검증(🤖 component-verifier, 빌더와 분리) · 2026-07-03 · 기준: `2-plan.md`·`1-inventory.md`·`node-map.json`·`reports/modal-component-spec.md`·`registry/components/modal.json`
> 대상 파일 `cysG5U1udpQqVagYY1hWHW` (V3.0-TEST), Core 5:5706. Figma MCP whoami PASS(연결 정상).

## 판정 요약: ✅ PASS (❌(a) 0건 · BLOCKED 0건)

메인 변형세트는 구조·크기·토큰 바인딩·폰트·출처·순환참조 전부 통과. 남은 항목은 🟡(b) 허용편차 2건 + ❓(c)/범위밖 3건(사용자 확인용, 검문소 비차단).

---

## 1. variant 전수·속성·크기 — ✅ PASS (정확 대조)

세트 `763:9085` (bounds x=0 y=4652 **2540×916**) — 8 variant 전부 존재, 속성축 `Size`/`Footer` 정확, 폭 정확.

| variant | node | 폭(기대) | 폭(실측) | 푸터 버튼 | 닫기 |
|---------|------|---------|---------|----------|------|
| Size=S, Footer=Dual | 762:6121 | 360 | 360 | 취소(Sec)+확인(Pri) | 1 |
| Size=M, Footer=Dual | 763:6125 | 440 | 440 | 취소+확인 | 1 |
| Size=L, Footer=Dual | 763:6135 | 1000 | 1000 | 취소+확인 | 1 |
| Size=XL, Footer=Dual | 763:6145 | 1200 | 1200 | 취소+확인 | 1 |
| Size=S, Footer=Single | 763:9029 | 360 | 360 | 확인(Pri) | 1 |
| Size=M, Footer=Single | 763:9043 | 440 | 440 | 확인 | 1 |
| Size=L, Footer=Single | 763:9057 | 1000 | 1000 | 확인 | 1 |
| Size=XL, Footer=Single | 763:9071 | 1200 | 1200 | 확인 | 1 |

- 푸터 버튼 = 로컬 Button 인스턴스 `Size=XSM`(h34) — Dual=Secondary"취소"+Primary"확인", Single=Primary"확인". 라벨 전부 `visible:true`, characters 정확. ✅
- Dual 4개 = Secondary 4 + Primary 4, Single 4개 = Primary 4 → 세트 내 Button 12개(Sec 4·Pri 8), close 8개, 총 20 인스턴스. 규격 일치.

## 2. 패킹 붕괴 — ✅ PASS
세트 2540×916, variant 4×2 그리드(x=40/1300, y=40·264·488·712)로 정렬. 초대형 폭/좌표 없음(좌표 확산 붕괴 0).

## 3. 토큰 바인딩 스캔 — ✅ PASS (use_figma 사실추출 + 역매핑)
- 스캔 노드: 763:9085 (77노드) · 765:6149 Usage (44노드) · 768:6186 Spec Dark (6노드)
- **미바인딩 raw hex 0건 (전 노드).** 고유 hex 0종 → EXACT 0 → `figma-binding-lookup.js` 조회 대상 없음.

| 노드 | 총 노드 | 미바인딩 hex | 고유 hex | 판정 |
|------|--------|-------------|---------|------|
| 763:9085 (Modal set) | 77 | 0 | 0 | ✅ 전부 Variable 바인딩 |
| 765:6149 (Usage, Ex3/Ex4 detach 포함) | 44 | 0 | 0 | ✅ (detach 사본도 바인딩됨) |
| 768:6186 (Spec Dark) | 6 | 0 | 0 | ✅ frame fill 바인딩 |

> EXACT(정확일치 미바인딩 hex) **0건** → 검문소 통과 조건 충족. (findAll 이 INSTANCE 내부를 안 내려가, Usage Ex1/Ex2·Spec Dark 3인스턴스 내부는 세트 정의에서 상속 — 세트 77노드 전수 스캔으로 커버. Usage detach 프레임 Ex3/Ex4 는 44노드에 직접 포함되어 검사됨.)

## 4. 폰트 일관성 스캔 — ✅ PASS (데이터 스캔, 렌더 판정 아님)

| 노드 | TEXT | 비-Pretendard | 바운드 스타일 | 판정 |
|------|------|--------------|--------------|------|
| 763:9085 | 24 | 0 | title/16B×8, body/14R×16 | ✅ PASS |
| 765:6149 | 12 | 0 | body/14M×6, title/16B×2, body/14R×4 | ✅ PASS |
| 768:6186 | 1 | 0 | body/14M×1(라벨) | ✅ PASS |

- 비-Pretendard 0건. 세트 전 텍스트가 텍스트 스타일 바인딩(`boundStyle` none 0건) — 재편집 파손 위험 낮음. ✅

## 5. 순환참조 — ✅ PASS
세트 variant 내부 인스턴스 = ic_닫기(remote) + Button(로컬, 별개 세트 687:19532)뿐. Modal 자기 인스턴스 내포 0. Usage/Spec Dark 는 세트 variant 를 인스턴스로 참조(부모→자식). 순환 없음.

## 6. 인스턴스 출처(provenance) — ✅ PASS (키 기반, 0 위반)

| 노드 | 총 인스턴스 | 외부위반 | 상세 |
|------|-----------|---------|------|
| 763:9085 | 20 | **0** | ic_닫기 ×8 (remote, key `2a1abbd…` = 허용목록 `close` ✅), Button Sec ×4·Pri ×8 (로컬 remote=false) |
| 765:6149 | 10 | **0** | Modal 인스턴스(로컬)·ic_닫기(허용)·Radio(로컬)·Button(로컬) |
| 768:6186 | 3 | **0** | Modal 인스턴스 3(로컬) |

- 닫기 = **허용목록 `close` 키(2a1abbd…) V2.2 인스턴스** — 벡터 직삽입 아님. ✅
- 참고(문서 불일치, 빌드는 정상): node-map/2-plan 은 close 키를 `fecb5506…`(세트 import 키)로 기록했으나 실제 배치된 variant 인스턴스 키는 허용목록의 `close`(2a1abbd…)다. 결과 정상 — node-map 문서만 갱신 권장.

## 7. 렌더 대조 — ✅ PASS
- **세트(Light):** 4행(S/M/L/XL)×2열(Dual/Single). 헤더(제목+✕)·본문2줄·푸터(우측정렬, Dual 2버튼/Single 1버튼) 규격대로. 버튼 라벨은 2540→축소 렌더라 육안 미세하나 데이터로 취소/확인 확인.
- **Usage:** 딤(overlay) 위 카드. Ex1 S/Single, Ex2 S/Dual, Ex3 M/Dual(다운로드+라디오2+"총 000개 항목" accent 파랑), Ex4 L/Dual(지정 노선 추가 + 지도 플레이스홀더 + 폼행 + 표헤더 + 빈상태). 크기·푸터·레이아웃 규격대로.
- **Spec Dark:** 다크 배경(bg/level-1) 위 패널=다크 표면(bg/level-0 dark), 제목·본문·✕ 라이트로 정상 반전.

---

## ❌ (a) 코드/빌드 실수 — **0건**

## 🟡 (b) 허용편차 (사전 등록) — 코드 유지
- 🟡 **Usage Ex3/Ex4 detach**: 복합 본문(라디오/지도/표) 주입 위해 Modal 인스턴스를 detach. Figma 인스턴스가 새 자식을 못 받는 **기술적 한계**이며 plan §A-2 에서 사전 예고("인스턴스화 어려운 것은 대표 목업, 검수 후 대체"). **메인 세트는 실제 인스턴스로 무영향.** → 허용.
- 🟡 **Ex4 지도·데이터표 = 대표 목업**: 지도=이미지 플레이스홀더(bg/level-2+라벨), 표=헤더텍스트+구분선(line/gray/subtle)+빈상태. plan §D 허용편차 명시. → 허용.

## ❓ (c) 사용자 확인 / 범위 밖 (검문소 비차단)
- ❓ **Spec Dark 보조(secondary) 버튼이 다크에서 흰색**: Modal 은 Button 색을 override 하지 않고(로컬 Button 인스턴스·전 fill Variable 바인딩 확인), 다크는 Semantic Color 컬렉션 모드 스위치로 적용됨. 따라서 흰색은 **재사용된 Button 컴포넌트의 다크 토큰(color/button/bg/secondary--default dark)** 결과 = **Modal 범위 밖.** Modal 결함 아님. → **Button 다크 secondary 토큰 검토 필요**(CLAUDE.md 미결 "blue-line/버튼 다크 시각검증"과 동일 계열). 사용자 확인 대상.
- ❓ **Usage Ex1/Ex2 데모 문구가 placeholder**("제목이 여기에 표시됩니다"/"내용이…두 번째 줄"): plan §A-2 는 Ex1="필수 항목을 입력해주세요"(1줄 안내)·Ex2=삭제확인(2줄)로 지정. 구조(Single/Dual·딤)는 맞으나 **예시 카피가 일반 placeholder**라 콘텐츠 유형 시연 효과가 약함. Ex3/Ex4 는 plan 카피 일치. → 데모 문구만 보완 권장(컴포넌트 결함 아님). 사용자 판단.

## 검문소 판정
- ❌(a) **0건** · 🔒 BLOCKED **0건** → **검문소 4 통과.**
- 🟡(b) 2건은 코드 유지(사전 등록 허용편차). ❓(c) 3건(범위밖/데모문구)은 사용자 확인 대상이나 검문소 비차단.
- 다음: 사용자 육안 검수 OK 시 설치기(build-components.ts)·components-new.html 연동(plan §G).

---

## ⭐ 오케스트레이터 렌더 교차확인 (2026-07-03, 육안+데이터)

렌더에서 **푸터 버튼이 빈칸·Ex1/Ex2 제목/본문 미표시**로 보여 데이터 직접 조회(use_figma read-only, 노드 762:6121)로 교차확인함:
- 버튼 라벨 실재: 보조 TEXT "취소"(Pretendard Medium 14, fill VariableID:8:989 #353535 bound), 주 TEXT "확인"(fill VariableID:8:987 white bound). visible=true.
- 제목/본문도 characters·fontName(Pretendard)·textStyleId·bound fill 정상.
- **원인 = MCP 렌더 서버 Pretendard 미설치로 "인스턴스 내부 텍스트"가 렌더에서 누락**(직접 그린 노드는 표시됨). CLAUDE.md 렌더 한계와 일치 → **빌드 결함 아님. 사용자 Figma 데스크톱(Pretendard 설치)에서 정상 표시.**
- 별건(범위 밖): Spec Dark 보조버튼이 다크에서 흰 배경 → 재사용 Button 컴포넌트의 다크 secondary 토큰 소관(Modal 아님), 별도 검토.

---

## R1 재검증 (2026-07-03, 🤖 component-verifier) — 판정 HOLD (❌0, ❓c 1건)

| # | R1 항목 | 실측 | 판정 |
|---|---------|------|------|
| 1 | 세로 간격 32 | 8 variant itemSpacing=32(spacing/32). Ex3/Ex4 동일 | ✅ |
| 2 | 최소높이 184 | 8 variant minHeight=184(py20·px24) | ✅ |
| 3 | 다크 패널(781:32832 대조) | fill #1C1D23 참고일치·effects 드롭섀도우2겹 동일·stroke=color/line/gray/subtle(다크 #2E2F38, 스펙준수). Light 플랫 유지 | ✅ |
| 4 | 취소 버튼 다크 | resolved bg #1C1D23(어두움)·라벨 #B8BABF | ✅ |
| 5 | 토큰 바인딩 스캔 | 세트77·Dark45·Usage81·Ex3 20·Ex4 22 = 미바인딩 hex **0** | ✅ |
| 6 | 폰트 스캔 | 전 TEXT 비-Pretendard **0** | ✅ |
| 7 | 타이틀 스타일 | 로컬 title/16B(Bold16) — 정본 Title/16B 재바인딩 미완(런타임 폰트 미설치). 시각결함 없음 | 📋 이월 |
| 8 | variant·패킹·순환참조 | 8종·2540×1044 정상·cyclic 0 | ✅ |

**❌(a) 0 · BLOCKED 0.**

### ❓(c)-1 다크 패널 배경 = Foundation 직바인딩 (핵심 결정)
- Spec Dark 패널 #1C1D23 은 **스펙 프레임 override 로 Foundation gray-dark/100 직바인딩**해 나온 값. 컴포넌트 정의는 semantic `color/bg/level-0`(다크=#0D0E12) 바인딩 → **실사용 다크는 #0D0E12 로 렌더돼 참고 #1C1D23 과 불일치**(스펙 데모에만 #1C1D23).
- CLAUDE.md: 색은 Semantic 경유·Foundation 직접 금지. 그러나 white(light)+#1C1D23(dark) 담은 semantic 토큰 부재(level-0 다크 #0D0E12·level-1 #131418·level-2 #1C1D23).
- 선택지: (A) 모달 다크 surface 용 semantic 토큰 신설/조정(white/#1C1D23) → 스펙·생산 정합 [권장] (B) Foundation 직바인딩 유지(정책 예외) (C) semantic 유지·다크 #0D0E12 수용(참고 미일치).

---

## R2 (2026-07-03) — ❓c-1 해소: 다크 패널 semantic 토큰화

- 신규 Figma Variable **`color/modal/bg`**(VariableID:809:2, Semantic Color V2 8:963): Light=base/white(8:710) alias, Dark=gray-dark/100(8:729) alias. scopes FRAME_FILL/SHAPE_FILL. raw hex 0.
- 패널 13개(메인세트 8 컴포넌트정의 + Ex3/Ex4 + Spec Dark 3) fill → color/modal/bg 통일. **Foundation gray-dark/100 직바인딩 override 제거.**
- resolved: Light #FFFFFF · Dark #1C1D23 (스펙·실사용 동일). ⭐ 독립 read corroboration: 762:6121·768:6189 fill boundVar=VariableID:809:2, 미바인딩 hex 없음.
- **판정: ❓c-1 해소. 남은 이월 = 타이틀 정본 대문자 Title/16B 재바인딩(런타임 폰트 미설치, 데스크톱/로컬화). 코드 전파(--color-modal-bg 등)=전달 단계 token-sync.**

---

## R3 (2026-07-03) — 크기별 최소높이 (참고 540:5815)
- minHeight: S 241 / M 336 / L 587 / XL 587 (8 variant + detached Ex3 336·Ex4 587). primaryAxisSizingMode=AUTO(내용 많으면 hug 로 늘어남).
- Body layoutGrow=1 → 푸터 바닥 고정(빌더 측정 gapToBottom=20 전 크기). 세트 재패킹 2540×2011, 겹침 0, 미바인딩 hex 0.
- ⭐ 렌더 확인: 세트에서 S→M→L→XL 높이 차등 뚜렷, 푸터 우하단 바닥. (R3=최소높이/layoutGrow 한정 변경 — 구조 무결성은 R1 full verify 로 커버, 본 항목은 빌더 측정 + ⭐ 렌더 corroboration.)

---

## R4 (2026-07-03) — 순수 hug 로 교정 (R3 오류 되돌림, 참고 6706:4219)
- R3(크기별 minHeight 587 등 + body layoutGrow=1 fill)이 "넓은 모달이 빈 세로 차지" 오류 → **전 variant minHeight 제거 + Body layoutGrow=0·layoutSizingVertical=HUG**(빌더: grow=0만으론 FILL 고착, HUG 명시 필요 발견).
- 결과: 높이 = hug(내용). 8 variant 전부 196(제목1+본문2+푸터 h34, L/XL도 587→196). Usage Ex3=237·Ex4=422(내용 기반). 미바인딩 hex 0. 세트 2540×1044.
- ⭐ 렌더 확인: Usage 에서 안내(짧음)→삭제→다운로드→지정노선(큼) 내용대로 높이 차등, 본문 빈공간 없음. (R4=hug 복귀 한정, 구조 무결성 R1 full verify 커버.)
