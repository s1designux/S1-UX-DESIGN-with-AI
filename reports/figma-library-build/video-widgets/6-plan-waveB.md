# 웨이브 B 빌드 계획 (figma-library-build 2단계) — 패턴 확장 + 원본 1:1 대조

- 타깃: SW UX GUIDE V3.0 TEST · fileKey `cysG5U1udpQqVagYY1hWHW` · 페이지 `16:1170`
- 입력: `5-inventory-waveB.md`(원본 재고조사), `node-map-modules2.json`·`node-map-templates.json`(기존 부품/모듈 provenance)
- 원칙: 색=Variable 바인딩(하드코딩 hex 금지=PreToolUse 훅), 폰트=Pretendard, 아이콘=라이브러리 인스턴스, 색은 **Semantic 경유**(foundation 직접 금지).

## 재사용할 기존 인스턴스 (타깃 파일 로컬 노드)
- **core:** Select Box MD `958:23625` · Search Input MD `958:23373` · Line Tab Set `956:18645` · Chip line `956:19900` · Table MD `958:27513` · Button(core Primary — 빌더가 타깃 파일에서 위치 확인)
- **video 부품(웨이브 A):** Widget Header On `1021:2` · List Card Row Avatar `1023:15` · List Card Row Meta `1023:22` · Summary Metric `1023:9222/9226/9231` · Segment Gauge `1023:52`

---

## 1) 신규 도메인 부품 4종 (변형세트 or 단일 컴포넌트)
새 섹션 "Video Parts 3" (예: x=2400, y=920 아래 — 기존 Parts2 `1076:356` 밑) 또는 Parts2 확장에 배치.

### 부품1 — Video/Alert (경고 토스트)
- 구조: row, padding 16/10, radius 6, border 1. `[ic_주의 16 + 메시지 Body/14R] · (spacer) · ic_닫기 16`.
- **색(Semantic 경유·양모드 flip):** 원본은 foundation `red-dark/500·400·200` 직접 바인딩(위반). → **semantic status(error) 토큰으로 바인딩**: 배경=`color/status-card/bg/error`(또는 정본 error surface), 테두리=`color/status-card/border/error`, 텍스트=`color/status-card/text/error`. 빌더: 정확한 정본 이름을 `get_variable_defs`/변수검색으로 확인 후 바인딩. **해당 semantic error 토큰이 없으면** foundation `red-dark/*` 잠정 바인딩 + `needsDecision`에 기록(임의 hex 금지).
- 아이콘: ic_주의 `28:18735` · ic_닫기 `28:18270` 인스턴스.
- variant: 단일(Type=Error) — 원본에 error만 존재. 다른 상태(info/success)는 미존재라 생성 안 함.

### 부품2 — Video/Memo Item (메모 항목)
- 구조: flex-col gap2, padding 12/10, radius 6. `제목 Body/12R` + `시간 Body/10R`. 하단 구분선 옵션.
- 색: 제목 `color/text/title/primary` · 시간 `color/text/body/secondary` · 구분선 `color/line/gray/subtle`. 전부 semantic — 그대로.
- 크기 279×52(hug).
- variant: 단일.

### 부품3 — Video/Device Tile (기기 카테고리 타일)
- 구조: flex-col justify-between, padding 10, radius `radius/4`. `[아이콘16 + 라벨 Body/14M] + 수량 값(text)`.
- 색: 라벨 `color/text/body/primary` · 값 텍스트 `color/text/title/primary`(스켈레톤 대신 실제 숫자 텍스트). 배경 = 셸 안이라 transparent 또는 `color/surface/raised`.
- 크기 137.5×144(2x2 기준, hug).
- **아이콘:** 원본 4종(ic_박스카메라·인터넷·출입관리·얼굴인증) hidden·key 미노출 → **대표 라이브러리 아이콘 1종**(예: 타깃 파일에 존재하는 카메라 계열 인스턴스)으로 슬롯 채움. 나머지 3종은 `needsDecision`/backlog(손그림 금지). variant: 단일(대표), 아이콘 교체는 인스턴스 override로 후속.

### 부품4 — Video/FAB (플로팅 추가버튼)
- 구조: 원형 34×34(radius full), padding 7, ic_더하기 `28:18280` 20px.
- 색: 배경 `color/button/bg/primary--default`(semantic) · 아이콘 라이브러리 인스턴스.
- ⚠️ **needs-core-update 병기:** core `button` 의 원형/FAB variant 확장 후보. 이번엔 video 부품 잠정.

---

## 2) 신규 위젯 유형 모듈 4종 (조립 프레임 — 기존 모듈과 동일 스타일: fill `surface/raised`·border `line/gray/subtle`·radius8)
새 row(예: y=4300 이하, "Video Widget Templates" 섹션 `1059:2` 확장) 다크 기본 + 라이트 스펙 2벌.

| 모듈 | 원본 | 구성(인스턴스) |
|------|------|----------------|
| Video/Device Summary Widget | 위젯01 `1965:14552` | Header + Device Tile×4(row) + (2x2) 이상상태 리스트(Memo Item 유사 or 간이 행) |
| Video/Person Search Widget | 위젯07 `1965:16849` | Header + 필터바(Select+Search) + List Card Row(Avatar)×3 |
| Video/Event Tab Widget | 위젯08 `1965:16905` | Header + Line Tab Set + Chip×N + (Search+Button) + List Card Row(Meta)×N |
| Video/Memo Widget | 위젯11 `1965:17492` | Header + Memo Item×N + FAB(우하단 겹침) |

## 3) 구성 패턴 3종 (core 조합 — 별도 라벨 프레임으로 전시)
| 패턴 | 조합 |
|------|------|
| Video/Filter Bar (필터바) | Select + Search (+Chip) 가로 배치 |
| Video/List Filter Stack (리스트 필터 스택) | Line Tab + Chip + Filter Bar + List Card Row×N 세로 |
| Video/Dashboard Grid (대시보드 그리드) | Widget Shell 사이즈 변형 여러 개 배치 예시 |

> 패턴은 "조합 전시"이므로 신규 컴포넌트 승격 아님(조립 프레임). 라벨로 "구성 패턴" 표기.

---

## 4) 원본 1:1 대조 배치 (Request 2)
- **새 영역 "패턴 ↔ 원본 대조"**(예: 기존 모듈 오른쪽 여백 or 하단 전용 섹션): 패턴(모듈)마다 한 행 = `[우리 패턴(다크) | → | 원본 시안]` 나란히, **동일 높이 스케일**, 라벨("우리 패턴"/"원본 시안 위젯0N").
- 원본 이미지: **기존 ref `1116:1238~1243`(위젯06·04·03·10·09·05) 재사용**(이미 진짜 스크린샷) + **신규 캡처**: 위젯01 `1965:14552` · 위젯07 `1965:16849` · 위젯08 `1965:16905` · 위젯11 `1965:17492` → `get_screenshot`(원본 fileKey `Tnihi6…`) → `createImageAsync(url)` → 이미지 프레임.
- 멀리 뭉친 기존 클러스터(x=2500~5393)는 대조 영역으로 흡수/정렬. 추상 '틀'(Dashboard Widget 제네릭)은 1:1 원본 없어 제외.

---

## needsDecision / HD (빌드는 기본값으로 진행, 최종 보고에 모음)
- **HD-A Alert 색 방향:** 원본 red-dark가 다크 안에서 라이트-외형(appearance 핀 의심). 우리는 semantic status(error)로 바인딩(양모드 정상)해 해소 시도. semantic error 토큰 부재 시 river 확인.
- **HD-B 점수 게이지 form:** 원본 별도 form 미확인 → 기존 Segment Gauge+숫자 유지.
- **HD-C 기기 카테고리 아이콘 4종:** hidden·key 미노출 → 대표 아이콘으로 빌드, 나머지 라이브러리 키 확보는 backlog.
- **FAB core확장:** needs-core-update(원형 button variant).

## node-map 기록
빌더는 신규 부품 세트·모듈 프레임·구성 패턴·원본 이미지 노드의 id, 바인딩 Variable id, 인스턴스 아이콘 id를 `node-map-waveB.json`에 기록. selfCheck(raw hex 0·비-Pretendard 0·패킹·양모드).
