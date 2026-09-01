# 5-human-review · 검수 화면 수정 (요구사항 A · B)

- work-id: `select-dropdown-filter-chip`
- 담당: 🤖 guide-builder (UI Gate / 검수 화면 연결 역할)
- 날짜: 2026-09-01
- 대상: `pages/ui-review.html` · `package.json` · `scripts/open-review.js` (신규)
- **PASS 판정 없음** — 이 문서는 구현·확인 기록이다. 합격 판정은 `component-verifier` 시나리오 F 소관.

---

## 1. 고친 파일과 줄 범위

| 파일 | 줄 범위 | 무엇을 |
|---|---|---|
| `pages/ui-review.html` | 222–360 | 검수 페이지 전용 크롬 CSS 추가 — 안내 박스(`.review-notice*`), 탭(`.review-tabs`/`.review-tab`/`.review-tabpanel`), 상태 배지(`.review-status-badge`). **전부 `review-` 접두사이며 `s1-*` 컴포넌트 클래스를 재정의하지 않는다.** |
| `pages/ui-review.html` | 377–394 | 안내 박스 마크업 (`#review-fallback-notice`, 기본 `hidden`) |
| `pages/ui-review.html` | 431–435 | 탭 바 (`role="tablist"` · 「이번에 볼 것」/「승인 완료(참고)」) |
| `pages/ui-review.html` | 436–511 | 검수 대기 탭 패널 — 9개 `<section>` 이 여기 들어 있고, JS 가 승인 항목만 아래 패널로 옮긴다 |
| `pages/ui-review.html` | 512–515 | 승인 완료 탭 패널 (기본 `hidden`) |
| `pages/ui-review.html` | 각 `<section class="review-section">` | `data-component-id="input|button|checkbox|radio|toggle|chip|select|dropdown|filter-chip"` 속성 추가 (장부 id 와 맞물리는 유일한 연결고리) |
| `pages/ui-review.html` | 1029–1031 | 기존 `<script type="module">` 끝에 성공 신호 `document.documentElement.dataset.reviewMounted = "1"` 1줄 추가 |
| `pages/ui-review.html` | 1034–1180 | **신규 일반 `<script>`(module 아님)** — (A) 로드 실패 안내, (B) 승인/검수대기 분류·탭 동작 |
| `package.json` | `scripts.review` | `"review": "node scripts/open-review.js"` 1줄 추가 |
| `scripts/open-review.js` | 신규 (전체) | 4173 서버 재사용/기동 + 브라우저 열기 |

`ui-library/dist/**` · `ui-library/src/**` · `pages/components.html` · `workflow-state.json` **미변경**.

---

## 2. 안내 박스가 뜨는 조건과 실제 문구

### 뜨는 조건 (셋 중 하나, 이미 떠 있으면 중복 표시 없음)

1. **`location.protocol === "file:"`** — 즉시 표시. `<script type="module">` 은 file 스킴에서 **실행 자체가 시작되지 않으므로** 모듈 안에서는 절대 잡을 수 없다. 그래서 감지·표시를 **일반 `<script>`** 로 분리했다.
2. **`window` 전역 error 캡처** (`capture: true`) — 모듈 실행 중 오류가 나면 그 메시지로 즉시 표시.
3. **3초 타임아웃** — http 인데도 3초 안에 `document.documentElement.dataset.reviewMounted === "1"` 이 안 되면 표시.

모듈이 끝까지 실행되면 `reviewMounted="1"` 이 서고, 그 뒤에는 어떤 경로로도 박스를 띄우지 않는다 → **정상(http)에서는 절대 보이지 않는다.**

### 실제 문구 (렌더 확인함)

> **화면이 비어 있습니다 — 파일을 두 번 눌러 연 상태라서 그렇습니다**
>
> 이 검수 화면은 실제 배포 파일(모듈)을 불러와서 그리는데, 파일을 바로 열면(주소가 `file://`로 시작) 브라우저가 보안 때문에 그 파일을 막습니다. 그래서 제목과 설명만 보이고 컴포넌트가 하나도 그려지지 않습니다. **화면이 잘못 만들어진 것이 아닙니다.**
>
> **이렇게 하면 바로 보입니다.**
> 1. 터미널(명령 입력 창)에서 프로젝트 폴더로 이동합니다.
> 2. 아래 명령을 한 번 실행합니다. 작은 서버가 켜지고 이 화면이 자동으로 열립니다.
> 3. 주소가 `http://localhost:4173/…` 로 바뀌어 있으면 정상입니다. 이 안내 박스도 사라집니다.
>
> [ `npm run review` ]  [명령 복사]
>
> ▸ 기술적인 원인 (개발자용) ← 접혀 있음. 펼치면 실제 오류 원문.

오류 원문·스택은 `<details>` 안에 작게 접어 두었다.

---

## 3. 승인/검수대기 분류를 장부에서 어떻게 읽었나

정본은 `registry/governance/ui-library-migration.json` 의 `records[].uiLibraryStatus` 하나다. 페이지에 컴포넌트 목록을 손으로 적어 두지 않았다.

- 각 섹션은 `data-component-id` 만 갖는다.
- **http 로 열면** 페이지가 `../registry/governance/ui-library-migration.json` 을 **실행 시점에 직접 fetch** 해서 `records[].id → uiLibraryStatus` 로 분류한다. 화면 하단 안내에 `(분류 출처: ui-library-migration.json 직접 읽음)` 이라고 표시된다.
- **장부를 못 읽는 환경(file://, fetch 차단)** 에서는 `<script type="application/json" id="review-migration-snapshot">` 의 스냅샷으로 되돌아간다. 이 스냅샷은 손으로 쓴 게 아니라 **같은 장부에서 기계적으로 추출**했고, 화면에 `(분류 출처: 장부 스냅샷…)` 이라고 출처를 밝힌다.
- 규칙: `uiLibraryStatus === "approved"` → 「승인 완료(참고)」 탭 · 그 외(및 **장부 미등재**) → 「이번에 볼 것」 탭.

### 실측 분류 결과 (http, 장부 직접 읽음)

| 탭 | 컴포넌트 | 장부 상태 |
|---|---|---|
| 이번에 볼 것 (기본 표시, 5개) | Toggle · Chip | `verified` |
| 이번에 볼 것 | Select · Dropdown · Filter Chip | **장부 미등재 → `unlisted`** |
| 승인 완료(참고) (기본 접힘, 4개) | Input · Button · Checkbox · Radio | `approved` |

> ⚠️ **작업 지시서와 장부가 다르다.** 지시서는 Select·Dropdown·Filter Chip 을 `verified` 로 적었지만 **장부에는 세 항목의 record 가 아직 없다**(현재 records 6건: input·button·checkbox·radio·toggle·chip). 하드코딩 금지 지시에 따라 장부를 그대로 따랐고, 미등재는 "승인된 적 없음"이므로 검수 대기로 분류했다 — 결과 배치는 지시서와 같다. **장부 등재는 이 작업의 범위가 아니어서 손대지 않았다**(아래 §6 참조).

### 그 밖의 배려

- 승인 완료 항목은 **삭제하지 않고** 뒷 탭에 그대로 둔다.
- 각 섹션 제목 옆에 배지: 「승인 완료」(회색) / 「검수 대기」(파랑 강조).
- 탭은 `role="tablist"`/`aria-selected`/좌우 화살표 키 이동을 갖춘다.
- 보고 있던 탭이 주소에 남는다(`#pending` / `#approved`) — 새로고침·링크 공유·스크린샷 촬영용.
- **컴포넌트 초기화는 탭과 무관**하다. 모듈은 문서 전체를 대상으로 `querySelectorAll` → `init` 하므로 접힌 패널 안의 컴포넌트도 초기화된다(§4-3 실측으로 확인).

---

## 4. 실제 확인 결과 (4가지 전부 실행)

| # | 확인 | 방법 | 결과 |
|---|---|---|---|
| 1 | **file:// 로 열었을 때 안내 박스** | `npm run shot -- "pages/ui-review.html" …` (Chrome headless, file 스킴) | ✅ 안내 박스 최상단 표시. 아래로는 실제로 제목·설명만 있고 컴포넌트가 비어 있어, 박스 문구가 화면 상태와 일치. 문구에 코드 약어 없음(`file://` 만 괄호 보조) |
| 2 | **http(4173) 로 열었을 때** | Chrome 실브라우저 DOM 조회 | ✅ `notice.hidden === true` · `reviewMounted === "1"` · 콘솔 오류 0건 · 기본 탭이 「이번에 볼 것」이고 5개(toggle·chip·select·dropdown·filter-chip)가 바로 보임. 승인 패널은 `hidden` |
| 3 | **탭 전환 후 컴포넌트 동작** | 「승인 완료」 클릭 후 실조작 | ✅ 4개 섹션 모두 렌더(높이 > 0) · Base Input 에 입력 → **remove(X) 아이콘 등장**(= `input.js` 런타임이 접혀 있던 패널에서도 초기화됨) · Checkbox 클릭 시 상태 전환 · Button 인스턴스 48개 렌더 |
| 4 | **`npm run review`** | 실제 실행 2회 | ✅ (a) 4173 이 이미 떠 있을 때 → `포트 4173 서버가 이미 떠 있어 그대로 사용합니다.` 로 재사용, 죽지 않음. (b) 서버를 끄고 실행 → `python3 -m http.server 4173 --bind 127.0.0.1` 기동 → 준비 확인 후 macOS `open` 으로 브라우저 열림. 페이지 `http=200` |

### 스크린샷 목록 (`reports/ui-library/select-dropdown-filter-chip/screens/`)

| 파일 | 내용 |
|---|---|
| `review-file-protocol-notice.png` | file:// — 안내 박스 상단 노출 |
| `review-file-protocol-tabs.png` | file:// — 안내 박스 + 탭이 file 스킴에서도 동작(스냅샷 출처 표시, 컴포넌트는 비어 있음) |
| `review-http-default.png` | http — 안내 박스 없음, 기본 탭 「이번에 볼 것 5개」, 첫 항목 5. Toggle(검수 대기 배지) |
| `review-http-approved-tab.png` | http — 「승인 완료(참고) 4개」 탭, 1. Base Input(승인 완료 배지) |

### 검사기

| 검사기 | 결과 |
|---|---|
| 🔎 `npm run harness:audit` (Gate 5 Harness) | 0 errors · 3 warns · 12 pass — **warn 3건은 전부 `pages/components.html` 코드탭 pane 관련 기존 항목**이며 이번 변경과 무관 |
| 🔎 `npm run layout:check` (Gate 22) | 위반 0 |

---

## 5. 미확인 (정직하게)

- **`--fix`/Gate 전체(`npm run gate:check`)는 실행하지 않았다.** 커밋 시점 검문소는 별도.
- **다크모드 전체 회귀는 보지 않았다.** 추가한 크롬(안내 박스·탭·배지)은 전부 semantic 토큰만 쓰지만, 다크 패널 안에서의 대비를 눈으로 대조하진 않았다. 크롬은 패널 바깥(페이지 배경)에만 있어 영향 범위는 좁다.
- **모바일 폭(≤520px)에서 탭 바 줄바꿈**은 CSS `flex-wrap` 으로 처리했으나 실제 좁은 뷰포트 렌더는 촬영하지 않았다.
- **Windows/Linux 에서 `npm run review`** 는 검증하지 않았다(macOS `open` 만 실측). 코드상 `start`/`xdg-open` 분기는 있으나 미실측.
- `file://` 에서 마스크 아이콘이 안 보이는 것은 도구 한계이므로 구현 오류로 보지 않았다(`wiring-and-traps.md` §2).
- **자기 결과를 PASS 로 승인하지 않았다.** 판정은 `component-verifier` 시나리오 F 소관.

## 6. needs-rebuild / needs-decision

- **needs-rebuild: 없음.** `ui-library/dist` 구현 문제는 발견되지 않았다.
- **needs-decision (HD):** 검수 화면의 「이번에 볼 것 / 승인 완료」 분류는 `ui-library-migration.json` 장부를 그대로 읽습니다. 그런데 **Select · Dropdown · Filter Chip 세 개는 아직 그 장부에 등록되어 있지 않습니다.** 지금은 "승인된 적 없음"으로 보아 「이번에 볼 것」에 넣어 두어서 화면 결과는 의도대로지만, 장부에는 세 컴포넌트의 검증 근거·재검증 조건이 비어 있습니다. (A) 지금 세 항목을 장부에 `verified` 로 등재한다 / (B) river 승인 뒤 한 번에 등재한다. 안 정하면 화면은 지금처럼 잘 동작하지만, 장부만 보고는 이 세 개가 어디까지 검증됐는지 알 수 없는 상태가 이어집니다.
- **참고(결정 아님):** `pages/ui-review.html` 은 `assets/js/main.js` SITE_NAV 와 `data/site-map.json` **어디에도 등록돼 있지 않습니다**(기존 상태). 검수 전용 화면이라 일부러 뺀 것으로 보여 이번에 등록하지 않았습니다.
