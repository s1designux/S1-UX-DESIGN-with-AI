# 새 세션 인계 — 메커니즘 승인 9건 (HD-5 후속)

작성 2026-09-08 · 이 폴더가 이 작업의 전부다.

| 파일 | 무엇 |
|---|---|
| `HANDOFF-next-session.md` | 이 문서. 아래 §프롬프트를 새 세션에 그대로 붙여넣는다 |
| `decision-screen.html` | 결정 화면 원본. **게시본을 고치려면 이 파일을 고쳐서 같은 URL 로 다시 올린다** |

**결정 화면(게시본):** `https://claude.ai/code/artifact/a585db0e-d683-461d-87ab-8a384bbf921a`

---

## ⬇️ 붙여넣기용 프롬프트 — 아래 상자 안을 통째로 복사한다

````text
S1-UX-DESIGN-with-AI 저장소. **정본 승인 감사(`reports/canon-approval-audit-2026-09-07.md`)의 HD-5 후속 9건**을 마무리한다.
먼저 `reports/mechanism-approvals/HANDOFF-next-session.md`(이 문서) 전체를 읽어라.

### 배경 (한 줄)
정본(Figma·`build-components.ts`)에 규정이 없어 **오케스트레이터(⭐)가 임의로 정한 동작 9건**이 있다. HD-5 결정(2026-09-07)으로 이것들은 river 승인 대상이 됐다. 결정을 받으려고 화면을 만들어 river 에게 전달한 상태다.

### 할 일
1. **river 가 화면에서 고른 답을 읽는다.** Artifact 도구:
   `action:"read_db"` · `url:"https://claude.ai/code/artifact/a585db0e-d683-461d-87ab-8a384bbf921a"` · `db_op:"list"` · `collection:"decisions"`
   문서 id = `m2`·`m3`·`m4`·`m5`·`m6`·`m7`·`m8`·`m9`·`m10`
   값 = `{choice: "A" | "B" | "hold", note: "자유 메모", at: ISO시각}`
   **답이 하나도 없으면 river 가 아직 안 누른 것이다** — 재촉하지 말고 river 에게 알리고 멈춘다.
2. **결정을 감사 문서에 기록한다** — `reports/canon-approval-audit-2026-09-07.md` 에 새 절(§9)을 열고, 항목별 `choice` 와 river 메모를 적는다. §3 의 M-2~M-10 행 상태도 갱신한다.
3. **`B`(바꾼다)를 고른 것만 실제로 고친다.** `A`·미응답은 코드 변경 0건 — 기록만.
4. `A` 로 확정된 항목은 해당 컴포넌트 `manifest.json` 의 `notInCanon` 설명에 **승인일과 river 인용문**을 덧붙인다(그게 이 작업의 목적이다 — 승인이 기록에 안 남는 재발 패턴 `approval-claimed-in-comment-only` 를 끊는 것).

### 9건 — 항목별 근거 위치와, B 일 때 손댈 곳

정본에 없는 사실은 전부 각 컴포넌트 `manifest.json` 의 `notInCanon` 에 자백성 기록으로 남아 있다. **판단 전에 그 원문을 읽어라.**

| id | 무엇 | 근거 (`notInCanon` 키) | B 면 고칠 곳 |
|---|---|---|---|
| `m7` | 선택한 날짜 hover 색 | date-picker `selectedHoverToken` | **A/B 둘 다 작업 발생** — 아래 ⚠️ |
| `m2` | 휠 apply 상시 활성 | time-picker `wheelApplyAlwaysEnabled` | `ui-library/src/components/time-picker/time-picker.js` |
| `m9` | 기간 트리거 문구 | date-picker `rangeTriggerFormat` | `date-picker.js` |
| `m10` | Open×Filled 교차 시 Open 우선 | select `openFilledCross` | `select.css` |
| `m3` | 목록 세로 스크롤 | time-picker `columnScroll` | `time-picker.css` |
| `m4` | 팝오버 8px·뒤집기 | date-picker `popoverPlacement` | `date-picker.js` |
| `m5` | 화면별 이동 단위 | date-picker `monthYearNavigation` | `date-picker.js` |
| `m6` | 격자 키보드 조작 | date-picker `keyboard` | `date-picker.js` |
| `m8` | 표시 YY.MM.DD / 값 ISO | date-picker `dateFormat` | `date-picker.js` |

⚠️ **`m7` 만 예외다.** 나머지 8건은 `A`= 코드 변경 0건이지만, m7 은 **정본과 웹이 이미 어긋나 있어** 어느 쪽이든 손이 간다.
- `A`(웹이 맞다) → 정본 `build-components.ts` `buildCalendarCell` 에 `color/date-picker/cell/bg/selected-hover` 를 배선. **정본 구조 변경 → 하드룰 H1② 대상**: 빌드 후 검증은 🤖 `component-verifier` 실제 spawn → `installer-build-verify-check.js --record --by component-verifier` → Gate 13.
- `B`(안 쓴다) → `ui-library/src/components/date-picker/date-picker.css` 에서 제거 후 `npm run ui:build`.

### 지켜야 할 것
- **판정을 새로 만들지 마라.** 애매하면 (c) 로 두고 river 에게 올린다. river 가 `hold` 를 고른 항목은 그대로 둔다.
- **정본 수정은 river 승인 뒤에만.** `A`/`B` 자체가 승인이다 — 그 범위를 넘지 마라.
- **`build-components.ts` 는 다른 세션이 상시 만지고 있다.** 손대기 전 `git status --porcelain plugins/figma-vars-installer/src/build-components.ts` 로 확인하고, 더러우면 **편집하지 말고 보고만** 해라(더러운 파일을 고치면 Gate 13 이 남의 미커밋 변경까지 함께 인증한다).
- 커밋은 **내가 만든 파일만** 스테이징한다. 작업트리에 늘 다른 세션 작업이 섞여 있다.

### 이미 끝난 것 — 다시 하지 마라
- **HD-1·HD-2·HD-3·HD-4·HD-5 전부 결정 완료.** HD-2(NavBar 키보드 변형)는 유지로 확정, 근거는 감사 문서 §7.
- **M-1(타임피커 휠 수치)·M-11(드롭다운 폭)은 해소됨** — 그래서 11건이 아니라 9건이다.
- 9건의 근거 조사·화면 제작 완료. **화면을 다시 만들지 마라** — 고칠 일이 있으면 `decision-screen.html` 을 고쳐 같은 URL 로 다시 올린다(Artifact 도구에 `url` 을 넘긴다. 안 넘기면 별도 화면이 새로 생긴다).

### 이 작업과 무관하지만 같은 저장소에 열려 있는 것 (건드리지 마라)
- NavBar `Web + Keyboard` 391 → 341 (river 승인 완료, `build-components.ts` 가 비면 실행)
- `build-components.ts:2146` 주석의 `2026-08-11` → `2026-09-07` 정정
- 레거시 화면 옛 Input 20개 교체 여부 — **river 답변 대기**(`reports/figma-library-build/input-state-focus/HANDOFF-next-session.md` §1️⃣)
````

---

## 부록 — 화면을 고쳐서 다시 올리는 법

`decision-screen.html` 을 고친 뒤 Artifact 도구에 **`url` 을 반드시 넘긴다**:
`file_path:"reports/mechanism-approvals/decision-screen.html"` · `url:"https://claude.ai/code/artifact/a585db0e-d683-461d-87ab-8a384bbf921a"`

- `favicon` 은 다시 넘기지 않는다(이미 ⚖️ 로 굳었다).
- 이 화면은 `capabilities: {db:{}}` 로 게시돼 있다 — **다시 올릴 때 `capabilities` 를 생략**하면 그대로 유지된다. 비우면 저장 기능이 죽고 이미 누른 답이 안 보인다.
- 화면 구조: 9개 `.card` 가 `data-id` 로 문서 id 를 들고 있고, 버튼 `data-c` 가 `A`/`B`/`hold` 다. 「5건 한 번에 인정」 버튼(`#bulkok`)은 `m3·m4·m5·m6·m8` 을 `A` 로 만든다.
