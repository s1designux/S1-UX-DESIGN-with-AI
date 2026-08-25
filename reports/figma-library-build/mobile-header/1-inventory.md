# mobile_header (540:6112) — 1단계 재고조사

파일: SW UX GUIDE V2.4 (fileKey `yE5UCFEbmXJBlYJWB24Lz2`)
확인: `get_metadata(540:6112)` 로 파일·노드 매치 확인함 (river 가 Figma Desktop 에서 해당 파일 열어둔 상태에서 재개).
읽기 도구: `get_metadata` → `get_design_context`(5종 각각) → `get_screenshot`(5종 각각 + 부모 1장) → `get_variable_defs`(부모).

## 부모 프레임
- id `540:6112`, name `mobile_header`, 캔버스 배치 좌표 x=55 y=5072, 컨테이너 width=1601 height=266 (5개 심볼을 늘어놓은 작업용 컨테이너 — 실제 컴포넌트 치수 아님).
- 각 variant symbol 실측 크기: **전부 360×99** (metadata 실측 확인, 요청받은 대로).

## variant 목록 (Figma property1 값 그대로)

| # | property1 | nodeId | 확인방법 |
|---|---|---|---|
| 1 | standard_title | 540:6113 | design_context + screenshot |
| 2 | standard_title + close btn | 540:6137 | design_context + screenshot |
| 3 | Home title_icon 2 | 540:6157 | design_context(6113/6178/6201 응답에 동반 포함) + screenshot |
| 4 | Home title_sub title_icon 1 | 540:6178 | design_context + screenshot |
| 5 | Home titel + alt titel | 540:6201 | design_context + screenshot (오타 'titel' 원본 그대로) |

variant 속성은 Figma 컴포넌트 세트가 아니라 **컴포넌트 인스턴스 5개가 개별 심볼로 나열**된 것으로 보인다(각 get_design_context 가 "property1" prop 을 가진 동일 `MobileHeader` 함수로 반환됨 — Figma 쪽에 이미 `property1` 이라는 단일 축이 존재한다는 뜻). 다만 다섯 값이 한 세트로 combineAsVariants 돼 있는지, 개별 컴포넌트인지는 이번 읽기 범위(get_design_context/get_metadata)로는 **구분 불가 — 미확인**(라이브러리 패널 자체를 봐야 함).

## 1. 치수 · 구조 (7항목 중 1,6)

| variant | 프레임 w×h | 세로 구성 | 내부 padding(content row) | gap |
|---|---|---|---|---|
| 전 5종 공통 | 360×99 | flex-col, gap **16px** (상태바 행 ↔ 콘텐츠 행 사이 실제 여백) | — | 16 |
| standard 계열(6113,6137) | ″ | 상태바 27 + gap 16 + 콘텐츠 56 = **99** | `px-16` 좌우 대칭 | — |
| Home 계열(6157,6178,6201) | ″ | 상태바 27 + gap 16 + 콘텐츠 56 = **99** | `pl-20 pr-16` 좌우 비대칭 | — |

**높이 99 분해(항목6):** `27(상태바) + 16(행간 gap) + 56(콘텐츠 행)= 99`. 콘텐츠 행 56 은 Figma 토큰 `sizing/56`에 바인딩되어 있음(`get_variable_defs` 확인). 콘텐츠 행 56 은 "아이콘 32 + 상하 padding 12×2=24 = 56" 구조로 1줄 variant 도 2줄 variant 도 동일 높이를 쓴다 — 6178(2줄: 제목+서브타이틀)은 `h-[56px]` 를 명시로 고정해 다른 variant 와 높이를 맞춤.

상태바 행(27px)은 5종 전부 동일 구성: 좌측 `12:30`(body/12R), 우측 wifi(11.667×10)·Signal(10×10)·Battery(7.241×11.5)·`78%`(body/12R), gap 8px. — variant 축 대상 아님(고정 크롬).

## 2. 구성요소 전수 (항목2,3)

| variant | 좌측 | 타이틀 영역 | 우측(trailing) |
|---|---|---|---|
| standard_title (6113) | `ic_이전`(뒤로가기, 32×32, Figma 컴포넌트 노드 221:9893) | "스탠다드형 타이틀" 1줄 | **의문의 빈 슬롯** — 노드명 `previous`(540:6132), 32×32 자리는 잡혀있고 svg(`Layer 2`)도 물려있으나 스크린샷엔 아무것도 안 보임(투명/빈 아이콘 추정, 미확인) |
| standard_title + close btn (6137) | `ic_이전`(동일) | "스탠다드형 타이틀" 1줄 | `ic_닫기`(close, 32×32, 컴포넌트 노드 89:4927) 1개 |
| Home title_icon 2 (6157) | 없음 | "홈 타이틀" 1줄, Bold | `ic_알림(신규)`(221:9928) **2개**, gap 16px |
| Home title_sub title_icon 1 (6178) | 없음 | "홈 타이틀"(Bold, 우측에 `ic_menu_arrow_down` 24×24 인라인) + 아래 "홈 서브타이틀"(14px, gap 2px) | `ic_알림(신규)` **1개** |
| Home titel + alt titel (6201) | 없음 | "홈-alt 타이틀" 1줄, Bold | **없음(슬롯 자체가 없음 — justify-between 아님, 공간 예약 안 됨)** |

**중요 정정(항목3):** variant 이름 `Home titel + alt titel` 은 "제목+부제 2종 텍스트"를 가리키는 게 아니다. 실측 결과 텍스트 노드는 **"홈-alt 타이틀" 단일 문자열 1개뿐**이다(6178 처럼 title+subtitle 스택 구조가 아님). 구조상 6157(Home title_icon 2)과 완전히 동일하되 — 배경이 흰색(default)이고 아이콘 슬롯이 아예 없다는 점만 다르다. "alt" 는 텍스트 콘텐츠가 다르다는 뜻으로 보이나(추정), 레이아웃상 새 축은 아니다.

## 3. 텍스트 (항목3)

| variant | 텍스트 | 폰트 | 크기/weight | tracking | 색 | textStyle 바인딩 |
|---|---|---|---|---|---|---|
| 6113,6137 타이틀 | "스탠다드형 타이틀" | Pretendard **Medium** | 18 / 500 | `-0.36px`(원시 letterSpacing -2, 18px 환산) | `--color-text-title-primary` #000000 | `title/18M` |
| 6157,6178,6201 타이틀 | "홈 타이틀" / "홈 타이틀"+화살표 / "홈-alt 타이틀" | Pretendard **Bold** | 18 / (weight 값 미제공 — Bold 라벨만 확인) | 없음(0) | `--color-text-title-primary` #000000 | 공식 textStyle 매핑 **미확인**(get_design_context 응답에 `title/18M` 만 언급, Bold 전용 스타일명은 안 나옴) |
| 6178 서브타이틀 | "홈 서브타이틀" | Pretendard Regular | 14 / 400 | `-0.28px`(원시 -2) | `--color-text-body-tertiary` #757575 | `body/14R` |
| 상태바 시각/배터리 (공통) | "12:30" / "78%" | Pretendard Regular | 12 / 400 | 0 | `--color-text-body-primary` #353535 | `body/12R` |

## 4. 색 (항목4)

`get_variable_defs(540:6112)` 로 확인한 변수 전량:

| Figma 변수 | 값(hex) | 용도 |
|---|---|---|
| `surface/base-background/default` | `#ffffff` | standard 계열 + alt titel 배경 |
| `surface/base-background/home` | `#f5f6fb` | Home 계열(6157,6178) 배경 |
| `color/text/title/primary` | `#000000` | 모든 타이틀 텍스트 |
| `color/text/body/primary` | `#353535` | 상태바 시각/배터리 |
| `color/text/body/tertiary` | `#757575` | 6178 서브타이틀 |
| `color/icon/gray-dark` | `#353535` | 백/닫기 등 라인 아이콘 |
| `color/icon/red` | `#ff4554` | 알림 아이콘 내부 point(빨간 점) — 아이콘 asset 내장, 별도 레이어 아님 |
| `color/base/white` | `#ffffff` | — |
| `surface/neutral/bg/strong` | `#e9e9e9` | 이 프레임에서 직접 사용처 미확인(변수 목록엔 포함되나 5종 코드상 미사용으로 보임) |
| `sizing/icon/32`, `sizing/icon/24`, `sizing/56` | 32 / 24 / 56 | 아이콘 크기·콘텐츠 행 높이 토큰 |

**하단 구분선(divider):** 5종 어디에도 border/stroke 클래스가 codegen 결과에 없었고 스크린샷에도 하단 경계선이 보이지 않는다 → **5종 전부 구분선 없음.**

## 5. Standard ↔ Home 구조 차이 정리 (river 질문 1)

| 항목 | Standard 계열(6113,6137) | Home 계열(6157,6178,6201) |
|---|---|---|
| 좌측 | `ic_이전`(뒤로가기) 고정 | 없음(전 3종 공통) |
| 타이틀 폰트 | Medium, tracking -0.36px | Bold, tracking 0 |
| 타이틀 정렬 | 좌측정렬(뒤로가기 아이콘 옆) | 좌측정렬(단, 왼쪽에 아무 아이콘 없어 여백만 20px) |
| 배경 | 흰색(default) — 단, 6201(Home 계열인데)도 흰색이라 배경만으론 축 구분 100% 안 됨(아래 참고) | #f5f6fb(6157,6178) / 흰색(6201) |
| 콘텐츠 padding | 16/16 대칭 | 20/16 비대칭(3종 전부 동일) |
| 높이 | 99(공통) | 99(공통) |

**주의:** 6201은 이름은 "Home"이지만 배경이 흰색(standard 와 동일)이라, "배경색"은 Standard/Home 을 가르는 결정적 신호가 아니다. **실측상 가장 일관된 차이는 (a) 콘텐츠 padding 16/16 vs 20/16, (b) 좌측 아이콘 유무, (c) 타이틀 폰트 weight(Medium vs Bold)** 세 가지이며 이 셋은 6201 을 포함해 5종 전부에서 깨지지 않는다.

## 6. Trailing(우측) 변주 (river 질문 2)

| variant | 우측 개수 | 아이콘 원본명 |
|---|---|---|
| 6113 | 0(단, 빈 슬롯 자리는 있음 — 위 "의문의 빈 슬롯" 참고) | `previous`(정체 미확인) |
| 6137 | 1 | `ic_닫기` |
| 6157 | 2 | `ic_알림(신규)` ×2 |
| 6178 | 1 | `ic_알림(신규)` ×1 |
| 6201 | 0(슬롯 자체 없음) | — |

우측은 **0(슬롯없음) / 0(빈슬롯) / 1(close) / 1(bell) / 2(bell×2)** 로 갈라져 있어, "개수" 만으로는 축이 깔끔하게 안 나뉜다 — "무엇이 오는가(닫기 vs 알림)" 와 "몇 개인가"가 같이 얽혀 있다.

## 7. 타이틀 영역 레이아웃 변주 (river 질문 3)

| variant | 구조 |
|---|---|
| 6113,6137,6201 | 1줄, 텍스트만 |
| 6157 | 1줄, 텍스트만(6113과 동일 구조, 폰트만 다름) |
| 6178 | **2줄 세로 스택**(gap 2px): 1행 = 제목+`ic_menu_arrow_down`(24×24, 제목 바로 옆 인라인 — 드롭다운 시사, **해석은 추정**) / 2행 = 서브타이틀(작고 회색) |
| 6201 | 1줄, 텍스트만("alt"는 문구만 다름 — 항목3 정정 참고) |

## 8. 흰 글자/투명 타이틀 흔적 (river 질문 4)

**데이터 확인 결과: 해당 없음.** `get_design_context` 가 반환한 5종 전부의 타이틀 텍스트 색은 `--color-text-title-primary`(#000000, 검정)이며, 흰색(#ffffff)이나 opacity 0 로 처리된 타이틀 텍스트 노드는 **5종 중 하나도 없었다.**
단, 6113의 우측 "빈 슬롯"(`previous`, 540:6132)은 텍스트가 아니라 **아이콘 svg**이며 스크린샷에 보이지 않는다 — 이건 "타이틀이 흰 글자"는 아니지만 "뭔가 숨겨진 레이어가 있다"는 river 기억과 결이 비슷할 수 있어 참고로 남긴다(성격은 다름 — 미확인 상태로 둔다. fill 값 자체를 raw API 로 못 뽑았음).

## 9. 축 후보 제안 — 관찰 기반, 결정은 river 몫 (river 질문 5)

실측만 근거로 하면 다음 3축이 자연스럽게 갈라진다:

- **Type** = `Standard` | `Home` — 좌측 아이콘 유무 + 타이틀 weight(Medium/Bold) + 콘텐츠 padding(16/16 vs 20/16) 세 신호가 함께 움직임. 6201은 이름에 "Home"이 붙어 있지만 배경만 Standard 와 같고 나머지 세 신호는 Home 쪽 — Type=Home 으로 보는 게 실측과 더 맞는다(배경은 별도 축으로 분리 권장, 아래 참고).
- **Title** = `single` | `subtitle`(6178 전용, 2줄+화살표) — 6201의 "alt"는 이 축이 아니라 콘텐츠 차이일 뿐이므로 별도 값을 만들 근거가 약하다(문구만 다른 인스턴스는 variant 축이 아니라 override 로 처리하는 게 일반적).
- **Trailing** = `none` | `close(1)` | `notify(1)` | `notify(2)` — "개수"보다는 "무엇+개수"를 합친 하나의 축으로 보는 게 실측과 맞는다(닫기와 알림은 서로 다른 의미의 액션이라 별도 boolean 2개(닫기 유무/알림 개수)로 쪼개는 것도 가능 — 이건 설계 선택이라 판단 보류).
- **Background**: white / home(#f5f6fb) — 6201이 Home인데 배경 white 인 점 때문에 Type 축과 분리해서 독립 boolean(또는 별도 축)으로 두는 편이 실측 모순을 없앤다. (river 결정 필요 지점으로 보임 — 배경까지 축으로 넣을지, 아니면 Type=Home 은 항상 home bg 로 강제하고 6201을 예외/오타로 볼지)

## 스크린샷
- 부모 프레임 5종 한 화면: (get_screenshot 540:6112, 격자 배치 이미지로 확인)
- 개별: 540:6113 / 540:6137 / 540:6157 / 540:6178 / 540:6201 각각 get_screenshot 으로 육안 대조 완료.

## 미확인 목록 (정직 고지)

1. 5종이 Figma 컴포넌트 세트(variant set, combineAsVariants)로 이미 묶여 있는지, 개별 컴포넌트 5개인지 — **미확인**(get_metadata/get_design_context 범위 밖, 라이브러리 패널 직접 확인 필요).
2. 6113 우측의 정체불명 "previous"(540:6132) 아이콘 슬롯 — 실제 svg 내용·fill·opacity **미확인**(스크린샷상 안 보인다는 것만 확인, raw API 로 opacity/fill 값을 못 뽑음).
3. Home 계열 타이틀(Bold 18px)의 공식 Figma 텍스트 스타일 이름(`title/18B` 같은) — **미확인**. `get_design_context` 응답엔 `title/18M`만 언급됐고 Bold 쪽은 별도 스타일 바인딩 여부가 안 나왔다(직접 라벨만 "Pretendard:Bold"로 하드코딩됐을 가능성 있음 — 이러면 토큰화가 안 된 상태일 수 있어 설계 시 확인 필요).
4. `surface/neutral/bg/strong`(#e9e9e9) 변수가 변수 목록엔 잡히는데 5종 코드 어디서도 실사용처를 못 찾음 — 이 프레임 범위 밖(선택 영역 인접 다른 노드) 변수일 가능성, **미확인**.
5. letterSpacing 원시값 -2 가 실제로 몇 %/px 단위인지 등가 여부(Tailwind 변환값 -0.36px/-0.28px 는 codegen 이 계산해 준 값) — 원본 raw 스펙 자체는 **참고용으로만** 신뢰, 정밀 재검증은 안 함.
