# ic_패널접기 재고조사 (읽기 전용 · 2026-09-30)

## 핵심 정정
아이콘 라이브러리는 **V2.4 파일(yE5UCF…)이 아니라 별도 파일** `YcBbW9e0MTR9T3W5Sz0Ukx` ("아이콘 라이브러리 V2.2", 페이지 0:1) 에 있다. V2.4 파일에는 ic_* 컴포넌트가 0개(768개 컴포넌트 전수 확인).

## 1. 위치
| 항목 | 값 |
|---|---|
| 파일 | YcBbW9e0MTR9T3W5Sz0Ukx, 페이지 `아이콘 라이브러리 V2.2` (0:1) |
| 대상 섹션 | `14.UI` **97:377** (x20783,y14530, 1560x935, fill=Variable 1402:27) |
| ic_메뉴 | 97:227 (COMPONENT_SET, 섹션 내 172,510) |
| ic_사용환경설정 | 97:315 (388,715) |
| ic_홈 | 97:295 (1036,510) |
| ic_날짜/근태,달력 | 70:664 — **09.비즈니스 섹션(77:847)** 에 있음 (568,510), 14.UI 아님 |

## 2. 아이콘 구조 (4개 샘플 동일)
- COMPONENT_SET, 크기 64x160, constraints MIN/MIN, clip=true, 세트 테두리 stroke 1px 보라(138,56,245) (세트 표식, fill 없음).
- variant 축 1개: **`Property 1` = Color / Line / Solid** (기본값 Solid). 이름 `Property 1=Line` 등. 라인·솔리드는 별도 이름이 아니라 같은 세트 안 variant.
- 세트 이름: `ic_한글이름` (슬래시 폴더 없음. 이름 안에 `/`·`,`·`()` 는 있음: `ic_날짜/근태,달력`, `ic_메뉴(신규)`).
- 각 variant: COMPONENT 24x24, 세트 안 위치 **Solid (20,20) · Line (20,68) · Color (20,116)**, constraints MIN/MIN, clip=true, fill 없음.
- 내부: `원본`(GROUP) > (선택 `Group`) > `Vector`(들). 벡터 constraints SCALE/SCALE. 글리프 18x18 안팎이 (3,3)부터 놓임(24 프레임 중앙).
  - ic_홈: 원본 > Vector 1개(Line 18x16.52 (3,3.74)). ic_메뉴: 원본 > Group > Vector 3개(선 18x1.06). ic_사용환경설정: Line 은 Vector 2개, Solid 는 1개.
- **벡터는 전부 fill 기반(stroke 없음)** — 외곽선화된 도형.

## 3. 색 (Variable 바인딩 있음, 벡터 fill)
| variant | Variable | 컬렉션 | id |
|---|---|---|---|
| Line | `color/icon/gray-dark` (53,53,53) | Semantic Color V2 | VariableID:1402:416 |
| Solid | `color/icon/gray` (117,117,117) | Semantic Color V2 | VariableID:1402:415 |
| Color(참고) | 샘플별 Foundation: blue/400 1402:56, blue/100 1402:50, visual-gray/200 1402:212, visual-gray/300 1402:214, base/white 1402:21 | Foundation V2 | — |

Line·Solid 는 각 샘플 전 벡터가 위 하나로 바인딩. 주의: Color variant 는 Foundation 직접 바인딩(예외 사례).

## 4. description 규칙
콤마 나열, **한글 키워드 … + 영어 키워드** : 
- ic_메뉴 `메뉴, 메뉴보기, menu, menu icon`
- ic_홈 `홈, 홈버튼, home, main screen`
- ic_사용환경설정 `사용환경, 설정, user environment setting, preferences`
- ic_날짜/근태,달력 `날짜, 근태, 달력, 일정관리, date, attendance, calendar, schedule management`
(description 은 COMPONENT_SET 에 있음. variant COMPONENT 설명은 미확인.)

## 5. 배치 (14.UI 섹션, 좌표는 섹션 기준)
- 격자: x 피치 **72** (100,172,…,1468), y 행 **100 / 305 / 510 / 715** (피치 205). 세트 64x160. 섹션 1560x935.
- 행 1(y100): x100~1396 사용(19개). 행 2(y305): 100~1396. 행 3(y510): 100~1468(ic_remove 439:87 @1468). 행 4(y715): 100~1397 사용(일부 x 1~2px 어긋남: 화살표/공유/tooltip/마지막장).
- 마지막 위치: 행 4 끝 ic_마지막장 1397,714.
- **빈 자리 후보**: (1468,100) · (1468,305) · (1468,715). 섹션 폭 1560 안(1468+64=1532). 새 아이콘 2개 → (1468,100)+(1468,305) 또는 행 4 의 (1468,715) 사용. 행 5(y920)는 섹션 높이 935를 넘으므로 섹션 확장 필요. 총 14.UI 자식 77개(세트).
- 권장: 행 1·2 끝이 "이전/다음/위…" 계열 기능 아이콘이므로 (1468,100) 이 의미상 가까움(화살표·축소/확대 행). 패널접기 라인/솔리드를 각각 별도 세트가 아니라 **세트 1개**(Line/Solid/Color variant)로 만드는 것이 기존 규칙과 일치 → 세트 1개면 자리 1개((1468,100))만 필요.

## 6. 충돌
라이브러리 전체 COMPONENT_SET 3276개 이름 검색(패널·접기·fold·collapse·panel): **0건**. 유사 후보로는 `ic_마지막장`(97 내 1407:51) 정도이나 뜻 다름. 충돌 없음.

## 7. 저장소 SVG (assets/img/candidate-icons/)
| 파일 | viewBox/크기 | 요소 | 방식 |
|---|---|---|---|
| ic_패널접기_line.svg | 0 0 24 24 / 24x24 | rect 1 + path 2 = 3 | **stroke** black 1.08, fill none. 외곽 rect(3.54,3.54,16.92²) · 세로선 x=9 · 쉐브론 `M15.8 10.3L14.05 12L15.8 13.7` linecap square |
| ic_패널접기_solid.svg | 동일 | path 2 + rect 1 = 3 | 왼쪽 판 `M3 3H9V21H3V3Z` fill black + 외곽 rect stroke 1.08 + 쉐브론 stroke |
| ic_패널접기_color.svg | 동일 | rect 2 + path 1 = 3 | 몸통 #CDD2DE · 왼쪽 판 #1D6CEB · 표식 stroke #808796 (color 도 있음 → Figma Color variant 도 필요) |
등록본: assets/icons/ic_패널접기_{line,solid,color}.png (48x48 RGBA = 24프레임 2배). 기준 ic_메뉴_{line,solid,color}.png 도 48x48 으로 동일.

대응: 웹 _line/_solid/_color.png ↔ Figma 세트의 Line/Solid/Color variant. 이름 `ic_메뉴` ↔ `ic_메뉴`. 저장소 SVG 는 **stroke 기반**, Figma 는 **fill 기반 외곽선 벡터** → Figma 쪽은 stroke→outline(또는 fills 로 그린 rect 조합) 변환 필요. 글리프 잉크 18x18 (3~21) 이 기존과 같은 폭.

## 확인 못 한 것
- variant COMPONENT 의 description·variant 에 붙은 Code Connect/플러그인 데이터.
- 벡터가 boolean union 인지 단일 path 인지(타입은 VECTOR 로만 확인).
- 행 4 일부 아이콘 1~2px 어긋남의 의도 여부.
- 14.UI 섹션 밖(history 프레임 568:32)에 변경 이력 기록 규칙이 있는지.
