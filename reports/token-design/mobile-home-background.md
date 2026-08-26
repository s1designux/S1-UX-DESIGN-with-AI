# 모바일 Home 배경색(#F5F6FB) 토큰 설계 — 조사 결과와 선택지

작성: 🤖 토큰구조 검사 에이전트(token-validator) · 2026-08-25
성격: **분석·제안 문서.** 정본(`plugins/figma-vars-installer/src/vars-data.ts`)은 **수정하지 않았다.** 신설은 river 승인 사항(하드룰 H6②·Gate 34).

---

## 0. 한 줄 요약

`#F5F6FB` 는 **기존 어떤 팔레트에도 속하지 않는 "연보라기 도는 흰색"** 이다. 기존 회색(gray)에도, 푸른회색(visual-gray)에도 자연스럽게 끼워 넣을 수 없다.
따라서 **"어떤 기존 토큰으로 대체할까"가 아니라 "새 색을 어느 층에 어떤 이름으로 등록할까"** 가 실제 결정 사항이다.

---

## 1. 조사한 사실 (추측 아님 · 전부 파일에서 확인)

### 1-1. 이 색의 이력 — 3년 묵은 미결 안건이다

이 색은 처음 발견된 게 아니라, **여러 번 "결정 대기"로 남겨졌다가 잊힌 항목**이다. 저장소에 흔적이 남아 있다.

| 어디에 남아 있나 | 뭐라고 적혀 있나 |
|---|---|
| `registry/tokens/legacy/semantic.colors.json:19` | `--color-bg-home` light=`#F5F6FB` · **status: candidate** · "Foundation 팔레트에 없는 값. 검토 중" |
| `registry/tokens/canonical-token-promotion-plan.json:1128` | "**ND-4**" 라는 결정 번호까지 붙어 있음 — 선택지 A(새 Foundation 등록)/B(visual-gray/50 로 교체)/C(gray/0 로 교체) |
| `tokens/review/pending-review.md:35` | 당시 제안: `color/gray/25: #F5F6FB` 신설 |
| `assets/css/site-base.css:15` | 포털 화면 CSS 에는 이미 하드코딩으로 살아 있음 |
| `reports/changelog-archive.md` (2026-06-16) | bg/surface 토큰 편입 때 **의도적으로 제외**됨 — "제외: `--color-bg-home`(#F5F6FB raw·사용처0)" |
| `reports/figma-library-build/mobile-header/2-plan.md:51-52` | Figma 빌드 때 "**허용편차**"로 선언하고 `color/bg/level-2` 로 대체 |

**즉 지금 상태는 "아직 안 한 것"이 아니라 "두 번 미뤄둔 것"이다.** 그동안 임시 대체값(`bg/level-2` = `#F5F5F5`)이 실제 Figma 컴포넌트에 들어가 있다 — 푸른기가 전혀 없는 순회색이라 **원본과 다른 색이 나가고 있다.**

### 1-2. `#F5F6FB` 는 어떤 색인가 — visual-gray 와 계열이 다르다

색을 세 축(밝기 / 색상각 / 선명도)으로 비교했다.

| 색 | HEX | 밝기(L) | 색상각(Hue) | 색기운 세기 | 사람 눈에 |
|---|---|---|---|---|---|
| `gray/50` (지금 잘못 쓰이는 값) | `#F5F5F5` | 96.1% | 없음(무채색) | 0 | 완전한 중성 회색 |
| `gray/0` | `#FAFAFA` | 98.0% | 없음(무채색) | 0 | 아주 밝은 중성 회색 |
| `visual-gray/50` | `#F3F5F7` | 96.1% | **210°** | 약 20% | 살짝 **청록**빛 도는 회색 |
| **원본 Home 배경** | **`#F5F6FB`** | **97.3%** | **230°** | **약 43%** | 살짝 **남보라(라벤더)**빛 도는 흰색 |

읽는 법:
- **색상각 210° vs 230°** — 20° 차이는 배경색처럼 넓은 면적에서는 눈에 보이는 차이다. 210°는 하늘색/청록 쪽, 230°는 남보라 쪽이다. **같은 "푸른기"라는 말로 묶이지만 방향이 다르다.**
- **색기운 세기가 2배** — `#F5F6FB` 가 `visual-gray/50` 보다 색이 두 배 진하게 실려 있다.
- **더 밝다** — `#F5F6FB` 는 `visual-gray/50` 보다 밝다. 즉 visual-gray 스케일에 넣으려면 **가장 밝은 칸(50)보다 더 위**에 새 칸(`/25` 또는 `/0`)을 만들어야 한다.

**판정: `#F5F6FB` 는 visual-gray 스케일에 "자연스럽게 들어가는 색"이 아니다.** 계열(색상각)도 다르고 위치(밝기)도 스케일 밖이다. `visual-gray/25` 로 억지로 넣으면 스케일의 색상각이 50번칸 210° → 25번칸 230° 로 꺾여서, 나중에 이 스케일을 쓰는 사람이 "왜 위쪽만 색이 다른가" 하게 된다.

### 1-3. `visual-gray` 스케일은 지금 **죽어 있다**

- 정의: `vars-data.ts:288-310` — 라이트 10칸 + 다크 10칸, 주석은 "Visual Gray (Light 전용 스케일)" 한 줄뿐. **무슨 용도로 만들었는지 설명이 없다.**
- **이 스케일을 참조하는 Semantic 토큰: 0건.** (`vars-data.ts` 의 SEMANTIC_COLOR 전체를 훑어 확인)
- `assets/css/tokens.css:239-260` 에 CSS 변수로 나가긴 하지만, **그 변수를 쓰는 곳도 0건.**
- Figma 스냅샷(`registry/figma/snapshots/…`)과 승인 기준선(`canon-additions-baseline.json`)에는 등록돼 있음 = 정식 승인된 Foundation 이긴 하다.

즉 **"승인은 됐는데 한 번도 쓰이지 않은 예비 팔레트"** 다. 이건 선택지 판단에 중요하다 — 이 스케일에 뭔가를 연결하면 **잠자던 스케일을 깨우는 결정**이 되고, 안 하면 계속 자게 된다.

### 1-4. 이름 규칙 — "용도 이름"은 이미 이 저장소의 관례다

Gate 15(토큰 이름 검사기)의 기계 정본 `registry/governance/naming-rules.json` 이 금지하는 건 딱 3가지다.

| 금지 규칙 | 내용 | 우리 안건에 걸리나 |
|---|---|---|
| `no-background-segment` | 배경은 `background` 말고 **`bg`** 로 쓸 것 | ✅ 안 걸림 (우리도 `bg` 쓸 것) |
| `no-brand-in-semantic` | Semantic 층에 `brand-` 별칭 금지 | ✅ 안 걸림 |
| `kebab-case-segment` | 소문자·숫자·하이픈만 | ✅ 안 걸림 |

**"용도 고정 이름"을 금지하는 규칙은 없다.** 그리고 실제로 이미 쓰고 있다 — Semantic 그룹 18개 중 대부분이 용도/부품 이름이다:

`color/navigation/bg` · `color/modal/panel/border` · `color/pagination/…` · `color/date-picker/…` · `color/status-card/…` · `color/table/…` · `color/chip/…` · `color/dropdown/…`

특히 **`color/navigation/bg`(vars-data.ts:605)** 가 우리 안건과 판박이다 — "내비게이션이라는 특정 자리의 배경"이라는 용도 고정 이름이고, 통과해서 정본에 있다.

**판정: `color/bg/home` 같은 용도 이름은 규칙상 허용된다.** 다만 `color/bg/*` 그룹만은 성격이 다르다 — 아래 1-5 참조.

### 1-5. `color/bg/*` 그룹은 "깊이 스케일"이라 용도 이름을 섞으면 그룹이 깨진다

`vars-data.ts:476-483` 의 주석이 그룹 성격을 명시하고 있다.

> `bg (페이지·레이아웃 배경 — 깊이 스케일)` / `level-0(가장 위, 흰/카드) → level-3(가장 깊은 배경)`

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `color/bg/level-0` | `base/white` | `gray-dark/0` |
| `color/bg/level-1` | `gray/0` (#FAFAFA) | `gray-dark/50` |
| `color/bg/level-2` | `gray/50` (#F5F5F5) | `gray-dark/100` |
| `color/bg/level-3` | `gray/100` (#E9E9E9) | `gray-dark/200` |

이 그룹은 **"0,1,2,3 번호가 곧 의미"** 인 순수 스케일이다. 여기에 `color/bg/home` 을 넣으면 "level-0~3 + home" 이라는 어긋난 목록이 되고, 다음 사람이 "home 은 몇 번째 깊이지?"를 알 수 없게 된다.

또한 `color/surface/*` 그룹은 **2026-06-30 에 의도적으로 축소**돼 `raised` 하나만 남았고, `vars-data.ts:659-661` 주석에 못이 박혀 있다: **"배경은 `color/surface/raised` 를 그대로 쓴다(이 그룹에 bg 를 만들지 않는다)"**.

**판정: river 가 후보로 든 `bg` 와 `surface` 중, `surface` 는 명시적으로 닫힌 그룹이라 제외된다. `bg` 는 열려 있지만 "번호 스케일"이라 이름 짓는 방식에 제약이 있다.**

### 1-6. 선례 — 이 저장소는 "한 군데에서만 쓰는 색"을 어떻게 다뤄왔나

| 사례 | Foundation | Semantic | 방식 |
|---|---|---|---|
| 브랜드 CI 색 (`#004097`) | **단독 항목 신설** `brand/ci` (스케일 아님) | 만들지 않음 — 빌더가 Foundation 을 직접 바인딩 | Gate 15 신설 때 `color/icon/brand-ci` 별칭을 **삭제**하고 Foundation 직결로 되돌림 (changelog 2026-06-23) |
| 모달 패널 테두리 | 신설 없음 (`gray/200` 재사용) | **신설** `color/modal/panel/border` | "값이 같아도 별도 키를 두는 것이 이 저장소 관례" (vars-data.ts:657 주석 명시) |
| 딤 위 패널 표면 | 신설 없음 | **신설** `color/surface/raised` (사용자 결정 2026-07-03) | 컴포넌트별 전용 토큰 대신 **공용 표면 1개**로 |
| 내비게이션 배경 | 신설 없음 | **신설** `color/navigation/bg` | 용도 이름 |

**읽히는 관례 두 가지:**
1. **Semantic 은 아낌없이 만든다** — "값이 같아도 별도 키를 둔다"가 명문화된 관례다. Semantic 신설은 이 저장소에서 가벼운 결정이다.
2. **Foundation 신설은 드물고 무겁다** — 새 색을 Foundation 에 넣은 건 브랜드색뿐이고, 그것도 스케일이 아니라 단독 항목이다. **`brand/ci` 가 "스케일에 안 맞는 단독 색"의 유일한 선례다.**

### 1-7. 다크모드 — 규칙대로 계산하면

`bg/level-*` 의 라이트→다크 대응 규칙: 라이트가 밝을수록 다크는 어둡다(`level-0`=흰색 → `gray-dark/0`=가장 어두움).

`#F5F6FB` 의 밝기(97.3%)는 `gray/0`(#FAFAFA, 98.0%)과 `gray/50`(#F5F5F5, 96.1%) 사이, `gray/0` 에 더 가깝다. → **`bg/level-1` 자리** → 규칙상 다크 짝은 **`gray-dark/50`(#131418)**.

그리고 이게 우연이 아니다 — **과거 문서들이 이미 같은 답을 적어놨다**: `semantic.colors.json:19`, `canonical-token-draft.json:235`, `pending-review.md:33` 모두 `--color-bg-home` 의 다크값을 `gray-dark/50`(#131418)로 기록하고 있다. **다크 대응은 사실상 이미 합의된 값이 있다.**

다만: 다크 회색(`gray-dark/*`)에는 남보라 기운이 없다. 라이트에서 라벤더빛을 준 이유가 "홈만의 분위기"라면 다크에서도 그 성격이 이어져야 하는지는 **디자인 의도의 문제**다. 만약 그 성격을 다크에서도 살리려면 `visual-gray-dark/50`(`#12141A` — 이쪽은 푸른기가 있다)가 후보가 된다.

**`darkStatus` 판정: `candidate` 가 맞다.** 모바일 Home 화면 자체가 다크 지원 여부 미정이고, 위처럼 "성격 유지 vs 중립 회색" 결정이 남아 있다. 다만 값 자체는 비워두지 말고 `gray-dark/50` 을 넣어두는 게 좋다 — 과거 기록 3곳이 이미 그 값이고, 비워두면 다크 전환 시 색이 깨진다.

---

## 2. 선택지

### 안 A — Foundation 에 단독 색 신설 + Semantic 은 깊이 스케일에 편입 ⭐ **추천**

**쉬운 말로:** "이 색은 회색 계열에 안 맞는 별종이니, 브랜드색처럼 **팔레트 맨 아래 단독 항목**으로 등록한다. 그리고 화면에서 부르는 이름은 '홈 전용'이 아니라 **'가장 얕은 배경 단계'**로 둬서, 나중에 다른 화면도 같은 배경을 쓸 수 있게 한다."

| 층 | 무엇을 하나 |
|---|---|
| **Foundation** | `"tint/lavender-50": "#F5F6FB"` 신설 (기존 gray·visual-gray 스케일 **건드리지 않음**) |
| **Semantic** | `"color/bg/level-0-tinted": { light: "tint/lavender-50", dark: "gray-dark/50" }` |

**이름을 왜 이렇게 잡았나**
- Foundation 을 `gray/25` 나 `visual-gray/25` 로 넣지 않는 이유: 1-2 에서 봤듯 **색상각이 다르고 스케일 밖 밝기**라, 넣으면 스케일이 오염된다. `brand/ci` 선례대로 **단독 항목**이 정직하다.
- Semantic 이름에 `home` 을 안 넣는 이유: `color/bg/*` 는 번호 스케일 그룹이라(1-5) 용도 이름이 섞이면 그룹이 깨진다. `level-0-tinted` 는 "level-0(가장 얕은 배경)의 색기운 있는 변종"이라는 뜻이라 스케일 문법을 지킨다.

**장점**
- 스케일 3개(gray·visual-gray·새 색) 중 어느 것도 오염되지 않는다.
- **나중에 다른 화면에서 같은 배경이 필요해지면 → 그냥 쓰면 된다.** 이름에 `home` 이 없으므로 "홈 토큰을 대시보드에 쓰는" 어색함이 생기지 않는다. 이게 이 안의 핵심 이점이다.
- 죽어 있는 visual-gray 를 건드리지 않으므로, 그 스케일의 향후 용도를 미리 못박지 않는다.

**단점**
- Foundation 에 항목이 1개 늘어난다(현재 208색 → 209색). Foundation 신설은 이 저장소에서 무거운 결정이고 Gate 34 승인 기록이 필요하다.
- `tint/` 라는 **새 계열 이름**을 만드는 것이라, 앞으로 색기운 있는 배경이 더 생기면 이 계열에 모으는 규칙을 세워야 한다(장점이기도 하다).

**다크 대응** — `gray-dark/50`(#131418), `darkStatus: candidate`. 과거 기록 3곳과 일치.

---

### 안 B — Foundation 은 손대지 않고, visual-gray/50 로 근사

**쉬운 말로:** "새 색을 등록하지 않고, 이미 있는 푸른기 회색(`visual-gray/50` = `#F3F5F7`)으로 대체한다. 죽어 있던 스케일이 이걸로 처음 깨어난다."

| 층 | 무엇을 하나 |
|---|---|
| **Foundation** | 신설 없음 |
| **Semantic** | `"color/bg/level-0-tinted": { light: "visual-gray/50", dark: "visual-gray-dark/50" }` |

**장점**
- Foundation 신설 승인이 필요 없다 — 가장 가벼운 결정.
- 잠자던 `visual-gray` 스케일에 **첫 소비자가 생긴다.** 라이트/다크가 이미 10칸씩 짝지어 있어서 다크 대응이 저절로 풀린다(`visual-gray-dark/50` = `#12141A`).
- 앞으로 색기운 배경이 더 필요하면 스케일이 이미 10칸 준비돼 있다.

**단점 — 이게 결정적이다**
- **원본 색을 바꾸는 것이다.** `#F5F6FB` → `#F3F5F7` 은 색상각 230°→210°(남보라→청록)로 **계열이 바뀌는 변경**이고, 배경처럼 넓은 면적에서는 보인다.
- CLAUDE.md 「원본 값 절대 보존」 규칙과 정면으로 부딪힌다 — "더 나은 값·표준 값을 이유로 무단 수정 금지". 이 안을 택하려면 **river 가 '원본 색을 바꾸겠다'고 명시적으로 결정**해야 하고, 그 사실이 기록돼야 한다.
- 나중에 다른 화면에서 같은 배경이 필요해지면: 문제없다(스케일이라 확장 자유). 단 **원본과 다른 색이라는 부채가 계속 따라다닌다.**

---

### 안 C — 용도 고정 이름으로 Semantic 신설 (`color/bg/home`)

**쉬운 말로:** river 가 처음 생각한 방향에 가장 가깝다 — "홈 배경"이라는 이름을 그대로 토큰으로 만든다.

| 층 | 무엇을 하나 |
|---|---|
| **Foundation** | `"tint/lavender-50": "#F5F6FB"` 신설 (안 A 와 동일) |
| **Semantic** | `"color/bg/home": { light: "tint/lavender-50", dark: "gray-dark/50" }` |

**장점**
- 이름만 봐도 어디 쓰는지 안다. 과거 기록(`--color-bg-home`)·`site-base.css`·Figma 원본 이름(`surface/base-background/home`)과 **이름이 이어진다** — 이력 추적이 쉽다.
- Gate 15 이름 규칙에 걸리지 않는다(1-4 확인 완료).

**단점**
- **`color/bg/*` 그룹의 문법을 깬다** — `level-0/1/2/3` 이라는 번호 스케일 안에 용도 이름 하나가 섞인다. 이 그룹은 1-5 에서 본 대로 "번호가 곧 의미"인 그룹이다.
- **나중에 다른 화면에서 같은 배경이 필요해지면 여기가 아프다.** 대시보드나 마이페이지가 같은 배경을 쓰게 되면 `color/bg/home` 을 홈이 아닌 곳에서 부르게 되고, 이름이 거짓말이 된다. 그때 개명하면 파생 표면 전체를 다시 만들어야 한다. (실제로 이 저장소는 `navigation/background`→`bg` 개명 같은 이름 정리 비용을 이미 치른 적이 있다.)
- 용도 이름 자체는 관례에 있지만(`color/navigation/bg`), 그것들은 **부품(컴포넌트) 단위**지 **화면 단위**가 아니다. 화면 이름이 토큰에 들어간 선례는 없다.

**다크 대응** — 안 A 와 동일.

---

## 3. 세 안 비교표

| | **안 A** (단독 Foundation + 스케일 이름) ⭐ | **안 B** (visual-gray 로 근사) | **안 C** (용도 이름 `bg/home`) |
|---|---|---|---|
| 원본 색 보존 | ✅ 그대로 | ❌ 바뀜(230°→210°) | ✅ 그대로 |
| Foundation 신설 | 1건 (`tint/lavender-50`) | 없음 | 1건 (동일) |
| 승인 부담 | 중간 (Gate 34) | 가장 가벼움 | 중간 (Gate 34) |
| 이름 규칙(Gate 15) | 통과 | 통과 | 통과 |
| `bg` 그룹 문법 | ✅ 지킴 | ✅ 지킴 | ⚠️ 깨짐 |
| **다른 화면이 같은 배경을 쓰게 되면** | ✅ 그대로 재사용 | ✅ 재사용(단 색 부채 유지) | ❌ 이름이 거짓말 → 개명 필요 |
| 다크 대응 | `gray-dark/50` (기존 기록과 일치) | `visual-gray-dark/50` (자동 짝) | `gray-dark/50` |
| 죽은 visual-gray 스케일 | 그대로 잠듦 | 깨어남 | 그대로 잠듦 |

---

## 4. 추천과 이유 — **안 A** (단, river 가 결정한다)

**추천 근거 3가지:**

1. **원본 색을 지키면서 스케일도 안 깨는 유일한 안이다.** 안 B 는 색을 바꾸고, 안 C 는 그룹 문법을 깬다. 안 A 만 둘 다 지킨다.
2. **`brand/ci` 라는 정확한 선례가 있다.** "스케일에 안 맞는 별종 색은 단독 Foundation 항목으로" — 이 저장소가 이미 한 번 내린 판단이고, `#F5F6FB` 는 같은 유형이다.
3. **미래 확장에서 가장 안전하다.** 이 색이 홈에만 남으면 안 C 와 결과가 같지만, 다른 화면으로 번지면 안 C 만 개명 비용이 발생한다. **번지지 않을 거라고 확신할 근거가 없다** — 원본 Figma 이름이 이미 `surface/base-background/home` 으로 "base-background" 를 품고 있어서, 원저자도 범용 배경으로 여겼을 가능성이 있다.

**river 가 안 B 를 고른다면** — 그건 "원본 색을 바꾼다"는 디자인 결정이므로, 문서에 그렇게 기록하고 Figma 원본도 함께 고쳐야 한다(안 그러면 원본↔코드 불일치가 계속 남는다).

**river 가 안 C 를 고른다면** — `bg` 그룹이 아니라 별도 그룹(`color/home/bg`)으로 빼는 걸 권한다. 그러면 `color/navigation/bg` 와 같은 모양이 되어 그룹 문법이 안 깨진다.

---

## 5. 파급 범위 — 어느 안이든 손대야 하는 곳

**정본 수정 (1곳 — river 승인 후):**
- `plugins/figma-vars-installer/src/vars-data.ts` — Foundation 1줄(안 A/C) + Semantic 1줄
- 승인 기록: `node scripts/canon-addition-check.js --approve --by river --reason "..."` (Gate 34)

**대체값을 쓰던 곳 정정 (안 확정 후):**
- `plugins/figma-vars-installer/src/build-components.ts:3018, 3033` — Mobile Header 의 Home 계열 배경이 `color/bg/level-2` 로 되어 있는 것을 새 토큰으로 교체.
  ⚠️ 이건 **정본 구조 변경**이라 하드룰 H1② 적용 — 🤖 `component-verifier` 독립 검증 + Gate 13 해시 기록 필요.
- `registry/components/mobile-header.json:75` — "허용편차" 주석 해소
- `reports/figma-library-build/mobile-header/2-plan.md:51-52` — 허용편차 #1·#2 해소 기록

**자동 재생성 (손편집 금지):**
```
npm run tokens:reconcile
```
→ `assets/css/tokens.css` · `pages/foundation.html` · `pages/semantic.html` · `pages/install-prompt.html` · `registry/tokens/foundation.colors.json` · `design/DESIGN.core.md` · 설치기 zip 이 전부 따라온다.

**Figma 쪽:**
- 설치기 재빌드(`npm run installer:build`) 후 Figma 에 재설치해야 새 Variable 이 생긴다.
- 그 다음 Mobile Header 컴포넌트의 Home 계열 fill 을 새 Variable 로 재바인딩.

**정리 후보(별건):**
- `assets/css/site-base.css:15` 의 하드코딩 `--color-bg-home: #F5F6FB` — 정본 토큰이 생기면 이 사본은 정본 참조로 바꾸거나 제거 대상.
- 죽어 있는 `visual-gray` 20칸 — 안 B 를 안 고를 경우, "쓰는 데가 없는 Foundation 스케일"로 계속 남는다. 별건으로 용도를 정하거나 정리 여부를 판단할 필요가 있다.
