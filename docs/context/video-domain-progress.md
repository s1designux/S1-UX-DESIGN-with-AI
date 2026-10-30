---
name: video-domain-progress
description: "영상서비스 대시보드 패턴/컴포넌트 도출 진행 상태 (2026-07, 다른 세션 이어받기용)"
metadata: 
  node_type: memory
  type: project
---

영상+출입 통합관제 **대시보드 시안(위젯 11개)** 을 분석해 반복 구조를 **영상 도메인 패턴/컴포넌트**로 도출. 산출 = Figma 라이브러리 + (예정)코드·포털 둘 다.
- 원본 시안: fileKey `〔따로 보관: 피그마파일-1〕` "영상출입 통합관제 최종(KOR)_v0.0.6", 위젯 01~11.
- 결과물 Figma: fileKey `〔따로 보관: 피그마파일-2〕` "SW UX GUIDE V3.0 TEST", 페이지 `16:1170` "Video (준비중)".

**핵심 방향(river 확정):** ①추출단위 = **위젯 통짜 모듈**(작은 요소는 대부분 이미 core라 도메인이 얇음 → 위젯 archetype을 패턴으로). ②패턴=위젯 모듈→`registry/patterns`, 부품→`registry/domain/video`. ③이름 `Video/{Name}`·scope `video`. ④색=semantic 토큰(테마 대응), **영상은 다크 기본+라이트 스펙**, 게이지/그래프 색만 provisional(최근접 foundation). ⑤빌드=figma-library-builder / 검증=component-verifier **분리**(하드룰).

**완료(Figma, 검증 PASS):**
- 웨이브 A 부품 8: Widget Header·Shell·List Card Row·Summary Metric·Segment Gauge (섹션 1020:2) + Type3 Block·Video Tile·Chart (섹션 1076:356).
- 웨이브 A 위젯 모듈 7: Dashboard Widget·List Feed·Table·Stat Summary·Gauge Score·CCTV·Chart (섹션 `1059:2`). 다크(기본)+라이트(스펙) 2벌.
- **웨이브 B(2026-07-12, river "종류 더/진짜 원본 붙여달라" 요청, 검증 PASS·gate:check PASSED):** 신규 부품 4(Video/Alert `1131:1267`·Memo Item `1131:10364`·Device Tile `1132:1271`·FAB `1132:10373`, 섹션 "Video Parts 3" `1131:1238`) + 신규 위젯 모듈 4×2벌(Device Summary·Person Search·Event Tab·Memo, 다크 1135:1250/1136:1283/1137:1320/1138:1373 · 라이트 1139:1394/1408/1417/1431) + 구성 패턴 3(Filter Bar·List Filter Stack·Dashboard Grid, 1140:1540/1140:10640/1141:1589) — 섹션 "Video Widgets Wave B" `1135:1249`. node-map-waveB.json.
- **원본 1:1 대조 배치(Request 2):** 기존 ref는 사실 진짜 스크린샷이었으나 멀리 뭉쳐 오해됨 → **"패턴 ↔ 원본 대조" 영역**에 `[우리 패턴(다크)|원본 시안]` 나란히 재배치. 웨이브 B 4모듈 원본은 신규 캡처(get_screenshot→upload_assets image fill). 검증기 MD5 대조 = **원본 노드와 byte-identical**(실제 캡처 확정).

**열린 결정(river 대기):**
- 웨이브 A 단순화 3곳(①List Feed 카드 ②Table 혼잡도 ③Gauge Score 표) 원본에 맞출지.
- **HD-A Alert 색:** semantic status에 error surface(bg/border) 토큰 부재 → foundation `red-dark/500·400·200` 잠정(원본이 다크 안에서 연분홍 = appearance-pin 의심). error surface 토큰 신설 vs 잠정 유지.
- **HD-C 아이콘 4종(ic_주의·닫기·박스카메라·더하기):** 원본 영상파일 라이브러리 출처(정본 V2.2 아님, remote 미등록 키). 등록 vs canonical swap. Device Tile 아이콘도 대표 1종만(나머지 3종 per-tile swap backlog: 서버 ic_인터넷 28:6269·컨트롤러 ic_출입관리 28:714·리더 ic_얼굴인증 28:1417).
- **FAB:** core button 원형/아이콘전용 variant 부재 → needs-core-update.

**다음 할 일:** ①위 결정 반영 ②**코드/포털 등록 = Stage 4B 전혀 미착수**: registry/patterns(모듈·구성패턴)·registry/domain/video(부품)·pages/video.html·SITE_NAV "Domain"·gen-design-md.js scan에 domain 추가·design:md(service 키 `video`) ③backlog: 그래프/게이지 색체계·옵션C(대시보드 공통=상단바/사이드바/페이지셸 화면레벨 패턴, 원본 섹션 `1209:15856`·`1785:5608`)·core Table/Select 다크(appearance 핀).

**읽을 파일:** 웨이브 B 계획 `.claude/plans/sunny-watching-bengio.md` · 웨이브 B 리포트 `reports/figma-library-build/video-widgets/`(5-inventory-waveB·6-plan-waveB·4-verification-waveB·node-map-waveB.json) · 웨이브 A `reports/domain-vms/`(1-inventory·2-mapping·3-patterns) + 기존 node-map*.json(부품 node id·좌표).

**함정:** Figma 다크검증은 컬렉션 모드 토글만으론 인스턴스 appearance 핀에 막힘 → 핀 clear/set 필요([[figma-darkmode-appearance-pin]]). use_figma(쓰기)는 claude.ai Figma 커넥터 인증 필요(비대화형 세션엔 없음).
