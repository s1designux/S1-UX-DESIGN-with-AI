# 2단계 빌드 계획 — 위젯 유형 템플릿 (Tier1 틀 + Tier2 유형 2개)

- 타깃: V3.0 TEST(`cysG5U1udpQqVagYY1hWHW`) 페이지 16:1170 "Video (준비중)"
- 신규 Section **"Video Widget Templates"** @ (0, 1600) (기존 "Video Widgets" 섹션 0,0~2150×1466 아래).
- 성격: **조립 예시 프레임**(core 인스턴스 + 기존 Video 부품 인스턴스). 컴포넌트 승격은 후속(지금은 archetype 시연·river 확인용). 새로 만드는 프레임의 bg/border는 **semantic Variable**(테마 대응), 텍스트 override는 **Pretendard**.

## 조립 부품 좌표 (전부 local, createInstance)
**core:** Line Tab Set `956:18645`(MD/PC) · Chip line `956:19900` · Select Box MD `958:23625` · Search Input MD `958:23373` · Table MD `958:27513` · Button primary MD `956:19067`
**video 부품:** Widget Header On `1021:2` · Widget Shell 2x2 `1022:9`(참고) · List Card Row Meta `1023:22`/Thumbnail `1023:6`/Avatar `1023:15` · Segment Gauge `1023:32~52` · Summary Metric `1023:9222/9226/9231`

## 공통 틀 스타일 (Dashboard Widget frame)
세로 auto-layout · bg `color/surface/raised` · border 1px `color/line/gray/subtle` · radius `radius/8` · padding 16 · gap 12. (Shell 컴포넌트와 동일 스타일을 프레임으로 — 안에 인스턴스를 담기 위해 인스턴스 대신 styled frame 사용)

## 빌드 3개

### 1. Video/Dashboard Widget (틀, 기준 크기 630×378)
- child: **Widget Header On**(`1021:2`) 인스턴스(가로 fill) + **콘텐츠 슬롯**(빈 프레임, fill, 안내 라벨 "콘텐츠 영역").
- 의미: 모든 위젯의 공통 뼈대(헤더 + 콘텐츠).

### 2. Video/List Feed Widget (유형 — 위젯 5개 대표)
틀 스타일 프레임(630×약520, 세로) 안에 위→아래:
- **Widget Header On**(`1021:2`), 타이틀 오버라이드 "이상 이벤트 리스트".
- **Line Tab Set**(`956:18645`) — 탭 라벨 오버라이드 `전체 / 영상 / 출입`.
- **필터 행**(가로 auto-layout, gap 8): **Chip line**(`956:19900`, 라벨 "중복 제외") + **Select Box**(`958:23625`, "전체 유형") + **Search Input**(`958:23373`, placeholder "검색").
- **카드 리스트**(세로 gap 0): **List Card Row Meta**(`1023:22`) ×3 인스턴스.

### 3. Video/Table Widget (유형 — 위젯 4개 대표)
틀 스타일 프레임(표 폭에 맞춤, 세로) 안에:
- **Widget Header On**(`1021:2`), 타이틀 "출입문 대기열 현황".
- **필터 행**(우측 정렬): **Select Box**(`958:23625`, "전체 문그룹").
- **Table**(`958:27513`) 인스턴스 — 내부 `col-N > TEXT` 오버라이드로 예시 데이터(장소/혼잡도/대기/평균). 혼잡도 열 셀에 **Segment Gauge**(`1023:36` Congestion/2) 인스턴스를 얹을지는 빌더 재량(어려우면 텍스트만, 게이지는 생략 가능—needs-decision).

## 규칙
- 새 프레임 fill/border 색 = Variable 바인딩(surface/raised·line/gray/subtle). 하드코딩 hex 금지(훅 차단).
- 인스턴스 텍스트 override 후 Pretendard 텍스트 스타일 유지(Noto 잔존 금지).
- 인스턴스는 위 local node 로 createInstance — 원격 import 없음.
- 조립 난도 높은 부분(Table 셀에 게이지 얹기 등)은 막히면 **needs-decision** 반환(임의 처리 금지).
- node-map-templates.json 에 생성 노드·인스턴스 출처 기록.

## 검증(4단계)
component-verifier: 조립 정합(인스턴스가 실제 지정 core/video 부품인지·provenance)·새 프레임 색 semantic·양모드 렌더·Pretendard.
