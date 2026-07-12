# Stage 4 / figma-library-build 2단계 — 빌드 계획 (video 5개)

- 타깃 파일: SW UX GUIDE V3.0 TEST · 페이지 `16:1170` "Video (준비중)"
- 정본 매핑: `reports/domain-vms/2-mapping.md`, `3-patterns.md`
- 라이브러리 현황: `1-inventory.md`

## 네이밍·배치 (⭐ 결정 — 메커니즘)
- **네이밍 = `Video/{Name}` 슬래시 폴더.** core는 평문("Button")이나, 도메인 레이어 구분 + river의 'video 꼬리표' 요구를 슬래시 폴더로 충족(Figma 에셋 패널에서 Video 폴더로 그룹). variant 속성 축은 core 컨벤션(PascalCase `Size=…, State=…`) 준수.
- **배치:** Section "Video Widgets" @ (0,0). 5개 세트를 x=64부터 밴드로, 세트 간 가로 갭 120, 필요 시 2행. (빌더가 겹침 회피 후 node-map 기록)

## 컴포넌트별 빌드 스펙

### 1. Video/Widget Header  (변형세트)
- 구조: 가로 프레임 [타이틀 텍스트 · (spacer) · 액션 슬롯(아이콘)] + 하단 divider.
- **variant 축: `Action = {On, Off}`** — On: 갱신시각(`09:00:00`) + 새로고침 아이콘 / Off: 타이틀 + divider만. (원본 마스터 2종 1024:33540·1028:61340 통합)
- 토큰: 타이틀 `color/text/title/primary`, 시각 `color/text/body/tertiary`, 아이콘 `color/icon/gray`, divider `color/line/gray/subtle`.
- 아이콘: `ic_새로고침` (세트 155:11312, Line 변형 155:11313) 인스턴스.
- 치수: 타이틀 Title/16B(Pretendard Bold 16). 폭 280(가변), 헤더 높이 hug, divider 하단 1px.

### 2. Video/Widget Shell  (변형세트)
- 구조: 컨테이너 프레임(bg + 1px border + radius8 + padding16). 내용은 사용처에서 채움(빈 컨테이너).
- **variant 축: `Size = {1x1, 1x2, 2x1, 2x2}`** — 치수(원본 위젯01 기준): 1x1 311×185 · 1x2 630×185 · 2x1 311×378 · 2x2 630×378.
- 토큰: bg `color/gray-dark/100`, border `color/line/gray/subtle`, radius `radius/8`(정본 이름 확인).

### 3. Video/List Card Row  (변형세트)
- 구조: 행 프레임(padding 20×12), 우측/좌측 배치는 변형별.
- **variant 축: `Type = {Thumbnail, Avatar, Meta}`**
  - Thumbnail(w06): 상태뱃지 + 제목 + 본문2줄 placeholder + 우측 썸네일(94×53). 폭 279, 높이 hug.
  - Avatar(w07): 아바타(32×32) + 이름줄 + 서브줄. 폭 279, 높이 hug.
  - Meta(w08): 상태뱃지 + 구분점 + 제목 + 설명 + 메타줄. 폭 279, 높이 hug.
- **높이 정책: hug 채택 (실제 279×95/63/85), river 결정 2026-07-12.** 최초 계획의 고정 높이(279×77/57/77)는 폐기 — 내용에 맞춘 자연 높이(hug) 유지. (드리프트 방지: 계획서 ↔ 실제 일치)
- 토큰: placeholder `color/gray-dark/300`, divider `color/line/gray/subtle`(※원본 default/strong 은 비정본→subtle 통일, 허용편차#1), 텍스트 `color/text/*`.

### 4. Video/Segment Gauge  (변형세트)
- 구조: 3세그먼트 가로 막대(각 rect, gap1, 양끝 radius16). 채운 칸=톤색, 빈 칸=placeholder.
- **variant 축: `Tone = {Congestion, Score}` × `Fill = {1,2,3}`** (6 variant) — Congestion=`color/blue-dark/350`, Score=`color/green-dark/350`, 빈칸 `color/gray-dark/300`.
- ⚠️ 레벨 색 = **provisional(미확정)** — 원본에 '보통(파랑)·안전(녹색)'만 존재, 그 외 레벨 색 체계 미정. 지금은 최근접 foundation(blue/green-dark/350)만. 코드/문서에 `provisional` 표기. (HD-4)
- 치수: 68×8, 세그먼트 gap1.

### 5. Video/Summary Metric Block  (변형세트)
- 구조: [라벨 텍스트 + 값 placeholder + (증감 지표)].
- **variant 축: `Trend = {None, Up, Down}`** — Down 증감은 `color/red-dark/350`(하락 강조), Up/None 기본.
- 토큰: 라벨 `color/text/body/primary`/`secondary`, 값 placeholder `color/gray-dark/300`, 하락 `color/red-dark/350`.

## 색상 바인딩 사전 조회표 (필수 산출물)
> 이번 5개는 원본에서 이미 **전부 Variable 바인딩**(미바인딩 raw hex 0건 — `#424547`은 backlog w09 소관). 각 토큰의 V3.0 TEST 존재를 1-inventory에서 확인.

| 토큰(정본 이름) | V3.0 TEST 존재 | 빌드 지시 |
|---|---|---|
| color/text/title/primary · body/primary · secondary · tertiary | ✅ | 바인딩 |
| color/icon/gray | ✅ | 바인딩 |
| color/gray-dark/100 · 300 · 50 | ✅ | 바인딩 |
| color/line/gray/subtle (id 8:1076) | ✅ | 바인딩(divider 통일) |
| color/blue-dark/350 · green-dark/350 · red-dark/350 | ✅ | 바인딩(게이지·증감) |
| radius/8 (정본 이름 확인) | ✅ | 바인딩 |
| ~~color/line/gray/default·strong~~ | ❌ 비정본 | 생성 안 함 → subtle 대체(허용편차#1) |

## 허용편차 선언서
- **허용편차 #1: List Card Row / Widget Header 의 divider(border 속성)** — 원본이 쓴 `line/gray/default`·`strong` 은 현행 DS 미보유(비정본 레거시). → 정본 `color/line/gray/subtle` 로 통일 바인딩. (빌더에게: 토큰 subtle 사용)
- **허용편차 #2: Segment Gauge 레벨 색** — '보통/안전' 외 레벨 색 체계 미확정. 최근접 foundation(blue/green-dark/350)만 provisional 적용, 확장 레벨은 미생성. (빌더에게: 지정 2색만 바인딩, provisional 주석)

## 결정 필요(HD)
- **없음(신규 blocker).** 이전 라운드에서 결정 완료(5개 구성·게이지 색·Title 제외·헤더 통합·카드 3변형). 네이밍 `Video/`·배치는 ⭐ 메커니즘 결정(veto 시 조정).

## node-map 기록 지시
빌더는 생성한 Section·5 변형세트·각 variant node id·바인딩한 Variable id·인스턴스한 아이콘 node id 를 `node-map.json` 에 기록.
