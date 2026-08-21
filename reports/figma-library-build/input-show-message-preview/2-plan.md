# 2단계 빌드 계획 — `TEMP/Input — Show message Preview`

- 승인: river님 "B안(Message 축 제거 + `Show message` Boolean)으로 진행" (2026-08-21)
- 성격: **검토용 임시 세트**. 정본(`1654:42409` Input)·기존 인스턴스·코드 정본(`build-components.ts`)·Registry·설치기 ZIP **전부 무변경**.

## 대상 / 작업

| 대상 | 작업 | variant 속성축 | 소스 | 네이밍 | 배치좌표 | confidence |
|---|---|---|---|---|---|---|
| 미리보기 세트 | 신규 컴포넌트 4개 → `combineAsVariants` | `State`={Default,Error} × `Label`={Off,On} + BOOLEAN `Show message`(default false) + BOOLEAN `Password Icon`(default false) | 기존 Input MD/Mobile 실측(1-inventory) | `TEMP/Input — Show message Preview` | Core 페이지 **최상위**(섹션 밖), x=13968 · y=5645 | high |
| 조합 확인 보드 | 신규 프레임 + 인스턴스 | — | 위 세트 + 기존 Input 인스턴스 | `TEMP/Input — 조합 확인 보드` | 세트 우측 (set.x + set.width + 200) | high |

- 크기는 로그인 기준 **Size=MD / Break=Mobile(높이 48)** 1종만. (정본 반영 시에는 Size·Break 축을 그대로 유지)
- 세트 description = `정본 반영 전 미리보기 · 배포 금지`
- 라이브러리 배포(publish) 하지 않음.

## 색상 바인딩 사전 조회표 — raw hex 신규 도입 0건

미리보기는 **기존 정본 variant에서 실측한 Variable ID를 그대로 재사용**한다. 새 색을 정하지 않으므로 근사·HD 대상이 없다.

| 용도 | Variable ID | 실측 출처 | 빌드 지시 |
|---|---|---|---|
| field 배경 | `VariableID:8:1052` (form-control/bg/default) | 1654:42409 MD/Mobile | 바인딩 필수 |
| field 테두리 Default | `VariableID:8:1057` (border/default) | 동일 | 바인딩 필수 |
| field 테두리 Error | `VariableID:8:1059` (border/error) | 동일 | 바인딩 필수 |
| 라벨 글자 | `VariableID:8:1061` (label/default) | 동일 | 바인딩 필수 |
| 입력 글자 placeholder | `VariableID:8:1065` (text/placeholder) | 동일 | 바인딩 필수 (Default) |
| 입력 글자 default | `VariableID:8:1063` (text/default) | 동일 | 바인딩 필수 (Error) |
| 안내메시지 기본 | `VariableID:8:1121` (text/state/caption) | 동일 | 바인딩 필수 (Default) |
| 안내메시지 오류 | `VariableID:8:1122` (text/state/caution) | 동일 | 바인딩 필수 (Error) |
| 보드 캡션 글자 | `VariableID:8:1121` | 위와 동일 토큰 재사용 | 바인딩 필수 |
| eye 아이콘 색 | (기존 인스턴스 **clone** 으로 원본 바인딩 승계) | 1654:42409 field>trail>eye | **직접 색 지정 금지** — clone |
| 래퍼/보드/trail 프레임 | 없음 | — | `fills = []` (투명, hex 미사용) |

텍스트 스타일(실측 ID 그대로):
- 라벨 14 Medium = `S:0b8aad8ca7e2cfac03033ed19607a4d2fb76aa2a,`
- 입력 14 Regular = `S:35d6b9f34501f327f4672b8393023695d2f36c5d,`
- 안내메시지·캡션 12 Regular(body/12R) = `S:688caf7c5d281ba8b15ce89feda98adccca04d54,`

## 구조 명세 (4 variant 공통)

```
COMPONENT  name="State=<Default|Error>, Label=<Off|On>"
  VERTICAL · itemSpacing 6 · primary/counterAxisSizingMode AUTO · align MIN/MIN · fills []
  ├── (Label=On 만) TEXT "라벨"  chars "라벨" · style 14M · fill 8:1061
  ├── FRAME "field"  HORIZONTAL · resize(200,48) 먼저 → FIXED/FIXED · pad 0/12/0/16
  │     radius 4 · strokeWeight 1 · strokeAlign INSIDE · align MIN/CENTER
  │     fill 8:1052 · stroke (Default 8:1057 / Error 8:1059)
  │   ├── TEXT  Default: name "입력" chars "입력" fill 8:1065 / Error: name "텍스트" chars "텍스트" fill 8:1063
  │   │     style 14R · textAutoResize HEIGHT · append 후 layoutGrow=1 + layoutSizingHorizontal FILL
  │   └── FRAME "trail" HORIZONTAL · AUTO/AUTO · itemSpacing 2 · fills []
  │         └── "eye" = 기존 Input variant 의 eye INSTANCE **clone** · 24×24 · visible=false
  └── TEXT "안내 메세지" chars "안내 메세지" · style 12R
        fill (Default 8:1121 / Error 8:1122) · **visible = false** (4개 variant 전부에 존재)
```

세트 조립:
1. `figma.combineAsVariants([4개], figma.currentPage)` → name/description 설정
2. `set.addComponentProperty("Show message","BOOLEAN",false)` → **4 variant 전부**의 `안내 메세지` 레이어에 `componentPropertyReferences = { visible: showMsgPropId }`
3. `set.addComponentProperty("Password Icon","BOOLEAN",false)` → 4 variant 전부의 `eye` 레이어 visible 바인딩 (정본과 동일 동작 유지)
4. **variant 패킹** — 2열×2행 그리드로 x/y 재배치(padding 40, gap 40) 후 세트 hug resize. (패킹 누락 = 세트 폭 붕괴 사고 재발 방지)
5. 세트 위치 x=13968 · y=5645 (Core 페이지 최상위, 모든 섹션 밖 · 최하단 y5245 대비 400 여유)

## 조합 확인 보드 (요청 6조합 전수 + 기존 대조)

VERTICAL auto-layout · itemSpacing 24 · padding 40 · fills [] · name `TEMP/Input — 조합 확인 보드`

각 행 = HORIZONTAL(itemSpacing 16, align CENTER): [캡션 TEXT 12R(폭 300 FIXED, textAutoResize HEIGHT, fill 8:1121)] + [인스턴스]

| # | 캡션 | 인스턴스 설정 |
|---|---|---|
| 1 | 라벨 있음 · State=Default · Show message=False | Label=On, State=Default, Show message=false |
| 2 | 라벨 있음 · State=Error · Show message=False | Label=On, State=Error, false |
| 3 | 라벨 있음 · State=Error · Show message=True | Label=On, State=Error, **true** |
| 4 | 라벨 없음 · State=Default · Show message=False | Label=Off, State=Default, false |
| 5 | 라벨 없음 · State=Error · Show message=False | Label=Off, State=Error, false |
| 6 | 라벨 없음 · State=Error · Show message=True | Label=Off, State=Error, **true** |

이어서 **기존 ↔ 개선 대조 블록**(HORIZONTAL 2열, 캡션 포함):
- 기존 `1654:42409` 인스턴스 3개 — (MD/Mobile/Label=Off) `State=Error,Message=On` · `State=Error,Message=Off` · `State=Default,Message=Off`
- TEMP 대응 3개 — `Error+Show message=true` · `Error+false` · `Default+false`
- 목적: 높이(48/70)·테두리색·글자·간격 동일성 육안 대조.

## 허용편차 선언서

- 허용편차 #1: **세트 이름 접두사 `TEMP/`** — 정본 네이밍 규칙(컴포넌트명 단독) 이탈. 사유: 배포 금지 임시 자산 식별. (빌더에게: 이름 그대로 사용)
- 허용편차 #2: **`Size`·`Break` 축 미포함** (MD/Mobile 1종만) — 사유: 메시지 표시 구조 검토가 목적. (빌더에게: 축 추가하지 말 것)
- 허용편차 #3: **래퍼/보드/`trail` 프레임 `fills = []`** — 사유: 배경색 없는 구조 컨테이너. 정본 `comp.fills = []` 관례 동일. (빌더에게: raw hex 대신 빈 배열)

## 결정 필요(HD) 목록

**없음(0건).** 신규 토큰 0 · 신규 아이콘 0 · 배치 겹침 0 · 정본 변경 0.

## 절대 금지(빌더 지시)

1. `1654:42409`(기존 Input 세트)와 그 하위 노드·속성 **읽기만**. 수정·삭제·리네임·속성 추가 금지.
2. 기존 인스턴스 **detach 금지**. eye 는 `clone()` (detach 아님).
3. 저장소 파일 수정 금지(`build-components.ts`·Registry·ZIP·`pages/components.html`).
4. raw hex 금지(H2) · 비-Pretendard 폰트 잔존 금지(H3, 일시 폰트 시 `setTextStyleIdAsync` 재바인딩 필수).
5. 라이브러리 publish 금지.
