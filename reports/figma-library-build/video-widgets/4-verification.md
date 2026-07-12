# 4단계 검증 결과 — video-widgets (figma-library-build) · 웨이브 1 (도메인 부품 5세트)

- 검증자: component-verifier (빌더와 분리)
- 검증 방식: 실제 Figma 노드 조회 (metadata + use_figma 사실추출 스캔 + get_screenshot) — 빌더 self-report 불신, 원본 대조
- 대상: SW UX GUIDE V3.0 TEST · fileKey `cysG5U1udpQqVagYY1hWHW` · 페이지 16:1170 · Section "Video Widgets" 1020:2
- MCP 연결: 살아있음(whoami OK — s1designux / 삼성에스원)
- **재검증일: 2026-07-12** (이전 판정 FAIL → 재대조)

> ⚠️ 검증 범위: **웨이브 1 = 도메인 부품 5세트 한정** (parts2 / templates / modules2 는 이 문서 대상 아님).

## 대조 요약
| 항목 | 결과 | 검증 방법 |
|------|------|----------|
| variant 전수 | **18/18 ✅** (Header 2 · Shell 4 · Card 3 · Gauge 6 · Metric 3) | findAllWithCriteria COMPONENT_SET → variant 열거 |
| variant 속성축·값 | ✅ Action / Size / Type / Tone+Fill / Trend — 전부 PascalCase, 계획 일치 | 노드명 파싱 |
| 네이밍 | ✅ `Video/{Name}` 슬래시 폴더 5세트 전부 | set.name 확인 |
| 패킹 붕괴 | ✅ 없음 (최대폭 678px, variant 세로 스택·겹침 없음, 렌더 정상) | variant bounds(x/y/w/h) + get_screenshot |
| 토큰 바인딩 | ✅ **미바인딩 raw hex 0** (88노드 전 fill/stroke) | use_figma 사실추출 스캔 |
| 폰트 일관성 | ✅ PASS (전 14 TEXT 노드 Pretendard, 비-canonical 0) | getStyledTextSegments(['fontName']) 데이터 스캔 |
| 순환참조 | ✅ 0 (세트 내 형제 variant 자기포함 없음, 인스턴스=아이콘 1개뿐) | 인스턴스 전수 = 1 |
| 아이콘 손그림 | ✅ 아님 (라이브러리 INSTANCE) | provenance 스캔 |
| 아이콘 출처(provenance) | ✅ ICON_OK (refresh 키 허용목록 등록됨) | getMainComponentAsync remote/key 대조 |
| 허용편차 #1·#2 | ✅ 계획 선언대로 적용 | 바인딩 Variable 이름 역해석 |

---

## 이전 FAIL 3건 — 재확인 결과

### 1. ❌(a) → ✅ 해소: Section 1020:2 검정 테두리 미바인딩
- **독립 확인:** use_figma 로 node 1020:2 의 `strokes` 직접 조회 → **`strokeCount === 0`** (strokes 빈 배열).
- fill 은 `#FAFAFA` (bound=true → `color/bg/level-1`) 로 보존·바인딩됨.
- parts2 세션(07-11)의 "장식 크롬이라 stroke 제거" 조치가 **실제로 반영됨을 확인**. 미바인딩 raw hex 스캔(88노드)에서도 `#000000` 잔존 0건.
- → **해소.**

### 2. ❓(c) → ✅ 해소: List Card Row 높이 계획값 불일치
- river 결정 2026-07-12 **hug 채택**. 2-plan.md 3번 항목이 "높이 정책: hug 채택 (실제 279×95/63/85), river 결정 2026-07-12"로 갱신됨을 확인.
- **독립 실측:** Thumbnail 279×95 · Avatar 279×63 · Meta 279×85 — 계획서 갱신값과 정확히 일치(드리프트 0).
- → 설계 의도(hug)와 일치. **블로커 아님, 해소.**

### 3. ❓(c) → ✅ 해소: ic_새로고침 remote 키 미등록
- `registry/figma/allowed-remote-keys.json` 에 `refresh`(`e9a3d9b7e0c60b93fc10e2f6485ab77bd06329f0`)·`refresh_set` 등록 확인(커밋 031ac36).
- **독립 provenance 스캔:** 인스턴스 1건(ic_새로고침 1021:7), remote=true, key `e9a3d9b7…` → 허용목록 대조 결과 **ICON_OK**.
- → **해소.**

---

## 토큰 바인딩 스캔 (use_figma 사실 추출)
- 스캔 노드: 1020:2 · 총 노드 **88** · 미바인딩 **0건** · 고유 raw hex **0종**
- 컴포넌트 5세트·전 variant 내부의 fill/stroke + 섹션 자기 fill/stroke **전부 Variable 바인딩**. 섹션 stroke 는 제거되어 검사 대상에서 사라짐(fill 은 `color/bg/level-1` 바인딩).
- (이전 라운드에서 지적한 섹션 자기 stroke #000000 은 이번 스캔에서 소멸 확인 — selfCheck 반증했던 항목 해소.)

## 폰트 스캔 (figma-font-scan.md, 데이터 — 렌더 판정 아님)
- textCount **14** · offenderCount **0** · verdict **✅ PASS** (전 텍스트 Pretendard)

## 아이콘 출처(provenance) 스캔 (getMainComponentAsync — 키 기준)
| 인스턴스 | mainComponent | remote | key | 허용목록 대조 | 판정 |
|----------|---------------|--------|-----|--------------|------|
| ic_새로고침 (1021:7) | Property 1=Line · set "ic_새로고침" | true | `e9a3d9b7e0c60b93fc10e2f6485ab77bd06329f0` | **등록됨(`refresh`)** | ✅ ICON_OK |

> 섹션 전체 인스턴스 = 1건. EXTERNAL_VIOLATION 0건. 이름이 아니라 **키**로 대조.

## 허용편차 적용 확인 (바인딩 Variable 이름 역해석)
| 허용편차 | 선언(2-plan) | 실제 바인딩 | 판정 |
|----------|--------------|-------------|------|
| #1 divider/border → subtle 통일 | Header/Card divider · Shell border = `color/line/gray/subtle` | Header.Off divider=subtle · Card.Meta divider=subtle · Shell.1x1 border=subtle | 🟡(b) 정상 |
| #2 Gauge 레벨색 provisional | Congestion=blue-dark/350 · Score=green-dark/350 (2색만) | Congestion.Fill3 filled ×3 = blue-dark/350 · Score.Fill3 filled ×3 = green-dark/350 | 🟡(b) 정상 |

## 렌더 대조 (get_screenshot 1020:2)
- Header(On: 제목+09:00:00+새로고침 / Off: 제목+divider), Shell 4크기 빈 컨테이너, Card 3종(썸네일/아바타/메타), Gauge(파랑 Congestion 3단·초록 Score 3단), Metric(None / ▲12% Up / ▼8% Down=적색) 전부 정상 표출.
- 겹침·클리핑·패킹 붕괴 없음. (코드레벨 bounds + 시각 육안 일치)

---

## ❌ (a) 빌드 실수 — 수정 대상
- **없음.** (이전 ❌(a) 섹션 stroke 미바인딩 → 해소 확인.)

## 🟡 (b) 허용편차 (2-plan 선언됨) — 코드 유지
- 🟡 List Card Row / Widget Header divider · Shell border → `color/line/gray/subtle` 통일 바인딩. (허용편차 #1)
- 🟡 Segment Gauge 레벨색 Congestion=blue-dark/350 · Score=green-dark/350 provisional (2색만). (허용편차 #2)

## ❓ (c) 확인 요청 — 사용자 판단
- **없음.** (이전 ❓(c) 2건 모두 해소: 아이콘 키 등록 완료 · Card 높이 hug 채택.)

## 🔒 BLOCKED
- 없음 (MCP 연결 정상, 전 항목 스캔 완료)

## 판정
- ❌(a) **0건** · ❓(c) **0건** · BLOCKED **0건**
- variant 전수·속성축·네이밍·패킹·토큰 바인딩·폰트·순환참조·provenance·허용편차·렌더 **전부 통과**

### 최종: **PASS** (이전 FAIL → 재검증 통과)
- 판정 근거: 이전 FAIL 3건(섹션 stroke 미바인딩 · Card 높이 · 아이콘 키) 전부 독립 재확인으로 해소. 새 ❌(a)/❓(c) 없음.
- 검증일: 2026-07-12 · 검증자: component-verifier (빌더와 분리)
- 한계: 폰트/색 정체성은 **데이터 스캔**으로 확정(렌더 판정 아님). Figma 캔버스 실제 렌더의 미세 픽셀 붕괴는 get_screenshot 육안 범위 내에서 확인(코드레벨 bounds 병행) — 이상 없음.
