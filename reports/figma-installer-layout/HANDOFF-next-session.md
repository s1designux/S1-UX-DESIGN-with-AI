# 설치기 배치·정리 결함 2건 — 해결 완료 (2026-09-09)

> 2026-09-08 인계분(결함 1·2 + 죽은 코드 청소)을 이 세션에서 전부 처리했다.
> 🤖 component-verifier 3회 검증 후 PASS, Gate 13 기록 `reports/installer-build/verifications/d3274f6df3d60912.json`.

## 무엇을 고쳤나

**결함 1 — 달력 부품 설명 시트가 재설치마다 겹쳐 쌓임**
- 옛 산출물을 지우는 `removeByNames` 가 함수 진입 시 캡처한 페이지 최상위 노드만 훑어, 첫 설치 뒤 SECTION 안으로 들어간 것을 못 봤다 → **매 호출 시점에 캔버스 2단(페이지 직속 + 섹션 직속)을 새로 읽는다**(`canvasNodes()`).
- 세트 위에 떠 있는 설명 라벨·밴드는 이름이 없어 이름 매칭에서 빠졌다 → **`<세트이름> — Spec Deco` 이름을 붙이고**(`DECO_SUFFIX`) footprint 가 함께 걷어낸다. 좌표(박스)로 지우는 방식은 경계에 걸친 남의 라벨까지 지워서 폐기했다.
- Calendar Cell·Calendar Tile 은 매번 러너가 도는 부품(빠진 크기 채우기)이라 그 **COMPONENT_SET 자체는 지우지 않는다**(`removeByNames(list, keepSets)`). 지우면 보존된 Calendar·Date Picker 인스턴스가 detach 된다.

**결함 2 — 부품 1개 실패가 페이지 배치 전체를 무너뜨림**
- layout 패스와 `wrapCategoryInSection` 이 담당 구역을 ±Infinity y밴드 · 페이지의 모든 최상위 노드로 잡던 것을 폐기하고, **소유권 장부 `ownedIds`**(이번 실행에서 이 카테고리가 만든 노드 + 옛 섹션에 있던 자식)로만 계산한다. `wrapCategoryInSection` 은 노드 목록을 직접 받는다.
- 재설치 때 옛 섹션의 자식을 **페이지로 도로 꺼내 원점을 (0, catTopY)로 맞춘다.** 섹션 자식의 x·y 는 섹션 상대좌표인데 빌더는 페이지 절대좌표를 전제로 값을 쓰기 때문이다(그대로 두면 재사용된 세트가 제 설명 시트에서 932px 떨어졌다). 섹션 폭이 회차마다 +64px 자라던 것도 같이 해소.
- 보존 부품의 y 전진이 `catY = rb + 140`(대입)이라 앞 멤버가 밀어놓은 커서를 되돌렸다 → **`Math.max(catY, rb + 140)`**.

**죽은 코드 청소** — `code.ts` 의 레거시 교체 탭 잔재(핸들러 3개 + 함수 4개 + onmessage 타입의 `mappings`) 174줄 삭제. dist·zip 재빌드 후 해당 문자열 0건.

## 검증 결과 (🤖 component-verifier 독립 재현)

| 검사 | 결과 |
|---|---|
| 6회 연속 설치 · 15개 섹션 x/폭/높이/자식수 | run1(첫 설치)~run6 **전부 동일** · 세트 49 불변 · 떠도는 노드 0 |
| 부품끼리 겹침 | 6런 전부 **0**(HEAD 는 run2 에 13건, run3 에 19건) |
| HEAD 재설치 | Date Picker 섹션 `1432x996`·자식 88→112 로 붕괴 — 신규 판에서 소멸 |
| 실패 주입 4세트(부품 3개 / Chip 전멸 / Table 전멸 / Input) | 신규 판 전부 run1=run2 동일, 타 카테고리 잠식 0 |
| HEAD 대비 회귀 대조 | 5058노드 중 543개 차이, **전부** `props.name` 신규 부여뿐 · 그 밖 속성 차이 0 |
| Gate | `npm run gate:check` **PASSED**(경고 14, error 0) |

## 남은 것

- **NOT_VERIFIED:** 2026-09-08 원 증상(Navigation 섹션이 Form Control 의 Input 을 삼킴)을 HEAD **첫 설치**에서는 mock 으로 재현하지 못했다. 재설치 붕괴 해소는 실측 확인됐다. 실패 사유 문구를 river 가 기억하지 못해(D-2 = B) **실패 원인 자체는 미확정**으로 남긴다.
- **river 결정 대기:** 사용자가 Calendar Cell/Tile 세트를 제 섹션 밖(다른 섹션·중첩 프레임)으로 끌어낸 캔버스는 `canvasNodes()` 사정거리 밖이라 소유가 안 잡혀 엉뚱한 섹션에 담길 수 있다. HEAD 도 사정거리가 같거나 더 좁았고 유실은 아니다. 막을지 둘지 결정 필요.
- **개선 적재(비차단):** 카테고리 섹션 이름과 멤버 이름이 같은 10건(Line Tab·Pagination·Chip·Dropdown·Date Picker·Time Picker·Table·Bottom Sheet·Modal·Filter Chip)에서 `regionBottom` 이 빈 옛 SECTION 박스를 집는다. `Math.max` 가 흡수해 산출 영향 0이지만 우연에 가깝다.
- **실물 미확인:** 전부 mock·코드 레벨이다. Figma 실제 캔버스 육안 확인은 사람만 가능하다 — **원본이 아니라 사본 파일**에서 확인할 것.
- 같은 파일의 **"설치기 제자리 갱신(upsertSet)"** 은 여전히 보류다(경위 `reports/figma-library-build/input-state-focus/7-installer-upsert-verification.md`).
