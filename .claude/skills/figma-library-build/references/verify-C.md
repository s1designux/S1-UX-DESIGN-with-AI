# (C) Figma 라이브러리 빌드 검증 (figma-library-build 4단계) — 상세 절차

> `component-verifier` 전용 참조. 2026-08-12 에이전트 본문에서 이관(문장 원문 유지 — spawn 상시 로드 비용 절감).
> 공통 원칙(두갈래·정확대조·시각 매칭 2대 원리·provenance/폰트 하드룰·판정 기준)은 `.claude/agents/component-verifier.md` 본문이 정본.

> 대상: `figma-library-builder`가 만든 **Figma 라이브러리 컴포넌트/변형세트 정의 자체**. 기준 = `2-plan.md`(빌드 계획서) + 원본/의도 + `node-map.json`. 코드가 아니라 **Figma 노드**를 `use_figma` 읽기·`get_screenshot`으로 대조한다. 빌더와 **반드시 분리된 컨텍스트**에서 수행.

**기계(결정론) 대조 — 항상 엄격 ❌:**
- **variant 전수** — 계획서의 모든 variant가 세트에 존재(누락 1개라도 ❌).
- **variant 속성** — 속성 축·값이 계획대로(예: `Platform={App,Web}`). 이름이 `Prop=Value`로 정규화됐나.
- **variant 패킹** — 세트 bounds가 정상인가. **세트 폭/높이가 variant 합보다 비정상적으로 크면 ❌**(예: combineAsVariants 후 재배치 누락 → 수천 px 붕괴). 각 variant가 세트 안에서 겹치지 않고 정렬됐나.
- **토큰 바인딩 (필수 — 기계 스캔으로 사실 추출, 눈대중·카테고리 판단 금지)** — `.claude/skills/figma-library-build/references/token-binding-scan.md` 의 **2단계 스캔을 실제 실행**한다:
  1. **use_figma 바인딩 스캔** — 대상 노드의 SOLID fill·stroke 중 `boundVariables` 없는 raw hex 를 **사실 추출**(LLM 판단 0). 추출 0건이면 "스캔 안 됨" 의심(노드 id·페이지 확인).
  2. **역매핑 기계 판정** — 미바인딩 hex 를 `node scripts/figma-binding-lookup.js --stdin` 에 넘겨 vars-data 정본에 등가물이 있는지 결정론 판정. **EXACT(정확 일치 토큰 존재) 1건이라도 = 검증 통과 불가(exit 2).**
  3. **결과 표를 4-verification.md 에 필수 기록**(token-binding-scan §3). 표 없으면 HOLD.
  - 판정: **EXACT + 허용편차 미명시 → ❌(a) 토큰 바인딩 필수.** EXACT + 허용편차에 [노드명+속성유형] 명시 → 🟡(b). APPROX → ❓(c). (아래 §raw hex (b) 우회 2단계 잠금과 동일.)
  - 기존 인스턴스/토큰 컴포넌트 바인딩이 보존됐나도 함께 확인.
- **폰트 일관성 (필수 — 데이터 스캔, 렌더 판정 금지)** — `.claude/skills/figma-library-build/references/figma-font-scan.md` 의 스캔을 **실제 실행**한다. 세트 내 **전 TEXT 노드**의 `getStyledTextSegments(['fontName'])` 를 읽어 비-canonical(≠Pretendard) family 0건인지 판정(정본 `registry/governance/figma-font-policy.json`).
  1. **비-Pretendard 폰트 1건이라도 = ❌(a).** author/override 라벨을 Noto 등으로 덮어쓰고 텍스트 스타일 재바인딩을 빠뜨린 클래스(2026-06-24 datepicker 유출)를 차단. 허용편차(b)로 빼지 말 것.
  2. **렌더로 판정 금지** — MCP 렌더는 Pretendard 미설치라 Noto/Pretendard 를 둘 다 대체폰트로 그려 구분 불가. 노드 데이터(fontName/textStyleId)만 신뢰.
  3. **추출 0건(textCount=0) = ⚠️ NOT_VERIFIED**(✅ 아님 — selector 부패). 세트 id 재확인 후 재스캔.
  4. **결과(textCount·offenderCount·offenders)를 4-verification.md 에 필수 기록.** 표 없으면 HOLD.
  - author/override 라벨은 `boundStyle ≠ (none)`(텍스트 스타일 바인딩) 권장 — raw 폰트는 재편집 시 재파손 위험.
- **순환 참조 0** — 어떤 variant도 같은 세트의 형제 variant 인스턴스를 품지 않는가(품었으면 ❌ — detach 누락).
- **네이밍** — 슬래시 폴더·PascalCase·기존 컨벤션과 충돌 없나. 계획 외 이름 생성 없나.
- **기존 인스턴스 무결성** — 변형세트화/리네임 후 기존 화면의 인스턴스가 깨지지 않고 올바른 variant로 remap됐나(node-map의 remap 기록 + 대표 인스턴스 1~2개 실측).
- **원본 아이콘/이미지** — 아이콘은 라이브러리 import 원본인가(손그림 ❌). '래스터 그대로' 지정 항목은 그 이미지가 보존됐나.

**렌더 대조 (필수 — 구조 통과해도 시각 확인):**
- **각 variant를 `get_screenshot`** 으로 떠서 원본/의도와 시각 대조(글리프·정렬·치수 — §시각 매칭 2대 원리 그대로). 패킹 후에도 variant 내부 레이아웃이 안 깨졌나.
- 빌더가 보고한 `needs-decision`·비운 컨테이너(빈 Section 등)를 ❓/보고로 올린다(임의 PASS 금지).

**두갈래 적용:** variant 구성·아이콘/이미지 원본·토큰 바인딩 구조·순환참조·**폰트 정체성** = **정확 대조(항상 ❌)**. 색값·치수·타이포 = 두갈래((a)/(b)/(c)). 허용편차 선언서 항목은 (b)로 제외.

> **폰트 일관성 스캔은 (B) screen-rebuild 검증에도 동일 적용된다.** use_figma 로 캔버스에 author/override 한 텍스트가 있는 모든 빌드 결과는 위 폰트 일관성(데이터 스캔, figma-font-scan.md) 검증을 거친다 — 정본 `registry/governance/figma-font-policy.json`. (B)의 텍스트 정확일치(characters) 검증과 별개로 **폰트 family**를 데이터로 확인한다.

> ### 🚫 raw hex (b) 우회 2단계 잠금 (2026-06-19 신설 — WebTabBar 사후 차단)
> raw hex 잔류를 (b) 허용편차로 통과시키려면 **아래 두 조건을 순서대로 통과**해야 한다. 하나라도 실패하면 (b) 금지 — ❌(a) 또는 ❓(c)로 처리한다.
>
> **조건 1 — 허용편차 범위 명시 확인 (스코프 잠금)**
> 계획서(`2-plan.md`)의 허용편차 선언서에 해당 노드명 + 속성 유형(fills / strokes / text fills)이 **명시적으로 포함**돼 있어야 한다.
> - "아이콘 raster 허용"은 아이콘 노드의 fill/stroke만 커버한다. **배경(frame/component fill)·텍스트는 별도 항목으로 명시돼야만 포함**된다.
> - 컴포넌트 이름 수준의 카테고리 허용("브라우저 크롬이므로")은 (b) 근거가 되지 않는다.
>
> **조건 2 — DS 토큰 조회 결과 제시 ("등가물 없음" 확인)**
> `plugins/figma-vars-installer/src/vars-data.ts`(FOUNDATION_COLOR·SEMANTIC_COLOR)에서 해당 hex 값의 등가물을 **실제 조회**해 결과를 표에 기록해야 한다.
> - 등가물이 있으면 → **무조건 ❌(a)**. (b)로 처리 금지.
> - 등가물이 없어야만 (b) 후보. 단, 근사 토큰이 있으면(예: `#ebebeb` ≈ `gray/100`=#E9E9E9) **❓(c)로 올려 사용자가 판단**한다.
>
> **보고 형식 (raw hex 잔류가 있을 때마다 값별로 한 줄씩):**
> ```
> | hex 값 | 노드·속성 | 허용편차 명시 여부 | DS 조회 결과 | 판정 |
> |--------|-----------|-------------------|-------------|------|
> | #ffffff | address_row fill | 미명시 | color/surface/default=✅ | ❌(a) |
> | #353535 | nav icons stroke | 미명시 | color/icon/gray-dark=✅ | ❌(a) |
> | #dcdcdc | tab_row fill | 미명시 | 없음(gray/200=#D9D9D9 근사) | ❓(c) |
> ```
> (이 표가 없으면 raw hex 섹션은 검문소 4 HOLD — 통과 불가.)

산출물: `reports/figma-library-build/{target}/4-verification.md` (구조는 verify-A.md §산출물 형식 준용 + 위 항목).
