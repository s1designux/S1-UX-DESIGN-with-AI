# Form 섹션 3분할 마이그레이션 계획서 (영구 · 생성기 기반)

> 대상 파일: `cysG5U1udpQqVagYY1hWHW` (SW UX GUIDE V3.0) · Form 섹션 `449:48524`
> 작성: 2026-06-23 · STAGE 0 메타데이터 검증 완료분 반영

---

## 0. 핵심 전제 (STAGE 0 검증 결과 — 반드시 먼저 읽을 것)

- **이 13개 컴포넌트는 전부 설치기 생성기 `plugins/figma-vars-installer/src/build-components.ts` 의 `CATEGORIES.Form` 이 자동 생성**한다. 노드 id가 설치마다 바뀐다(391→441→449). → **영구 3분할 = 피그마 수동 이동이 아니라 생성기(CATEGORIES)를 3개 카테고리로 나누는 것.** 수동으로 옮겨도 재설치 시 옛 단일 Form 으로 되돌아간다.
- **의존 구조(이동 시 깨지면 안 됨):**
  - Date Picker `Open` 변형 → 내부 인라인 `calendar-panel` → **Calendar Cell(코어) 인스턴스**로 구성. (※ "Calendar" 패턴 세트를 통째로 품지 않음. Date Picker 는 Calendar **Cell** 에 의존.)
  - Calendar 패턴 → 날짜 그리드 = Calendar Cell, 연/월 그리드 = Calendar Tile.
  - Time Picker `Focus` 변형 → **Time Picker Dropdown** → **Time Picker Cell(코어) 인스턴스**.
- **토큰 공유:** Date Picker·Time Picker 의 닫힌 입력박스(trigger)는 `color/form-control/*`(bg·border·text) 를 Form Input 과 **동일 변수**로 참조(h44·radius4 동일). Time Picker Dropdown 은 `color/dropdown/*` 참조. → 분리해도 **변수 복제 금지**.

---

## 1. 분리 후 섹션 구조도 (3 섹션)

```
[Form]            순수 입력 컨트롤
  Core 구역 :  Input · Search Input · Text Area · Select Box · Dropdown · Dropdown List

[Date Picker]     날짜 계열
  Core 구역 :  Calendar Cell · Calendar Tile
  Pattern 구역: Calendar · Date Picker

[Time Picker]     시간 계열
  Core 구역 :  Time Picker Cell · Time Picker Dropdown
  Pattern 구역: Time Picker
```

> 생성기에서는 `CATEGORIES` 배열의 각 항목이 **이름이 같은 SECTION 1개**로 출력된다(현재 Actions·Selection·Navigation·Platform·Form·Table 각각이 섹션). 따라서 `Form` 카테고리를 위 3개 카테고리로 쪼개면 **섹션 3개가 자동 생성**된다.

---

## 2. 섹션 내부 위계 라벨 (각 섹션 안 Pattern / Core 구역)

각 섹션 상단에 구역 헤더 텍스트를 둔다(설치기 spec 라벨 규약 활용 — `decorateSetFlat`/`buildSpec` 의 title/구분).

```
Date Picker 섹션
 ├─ ── Core ──
 │    Date / Calendar Cell      (8 variant: Type=Standard/Range × State)
 │    Date / Calendar Tile      (3 variant: Default/Selected/Disabled)
 └─ ── Pattern ──
      Date / Calendar           (State=Date/Year/Month)
      Date / Date Picker        (Size × State, Open=캘린더 패널)

Time Picker 섹션
 ├─ ── Core ──
 │    Time / Time Picker Cell       (Time Picker Cell)
 │    Time / Time Picker Dropdown   (Time Picker Dropdown)
 └─ ── Pattern ──
      Time / Time Picker            (Time Picker, Focus=드롭다운)
```

> **배치 순서 원칙: Core(원자) 먼저 → Pattern(조립) 나중.** 생성기 빌드 의존성과도 일치(Pattern 이 Core 인스턴스를 써야 하므로 Core 가 먼저 빌드돼야 함 — 현재 lazy-build 로 이미 보장).

---

## 3. 리네임 매핑 표 (기존 → 새 이름) — 확정: 프리픽스 + 기존명 그대로(중복 직역)

> 사용자 결정(2026-06-23): **프리픽스와 단어가 겹쳐도 기존 이름을 그대로 둔다**(예 `Date / Date Picker`). 규칙 = `"Date / " 또는 "Time / "` + **기존 컴포넌트명 그대로**.

| 섹션 | 기존 이름 | 새 이름(확정) | 비고 |
|------|----------|--------------|------|
| Date | Calendar Cell | **Date / Calendar Cell** | core |
| Date | Calendar Tile | **Date / Calendar Tile** | core |
| Date | Calendar | **Date / Calendar** | pattern |
| Date | Date Picker | **Date / Date Picker** | pattern (중복 직역) |
| Time | Time Picker Cell | **Time / Time Picker Cell** | core (중복 직역) |
| Time | Time Picker Dropdown | **Time / Time Picker Dropdown** | core (중복 직역) |
| Time | Time Picker | **Time / Time Picker** | pattern (중복 직역) |
| Form | Input · Search Input · Text Area · Select Box · Dropdown · Dropdown List | 그대로 | 프리픽스 없음 |

- **중요:** 리네임은 **컴포넌트 표시명(set.name)만** 바꾼다. **컴포넌트 key·내부 BUILT_COMPS 조회키·토큰 변수 참조는 불변** → 기존 인스턴스 링크 유지(Figma 는 rename 해도 key 보존). 생성기에서는 `set.name` 만 새 값으로, 내부 등록키(`BUILT_COMPS["CalendarCell:..."]` 등)는 그대로 둔다.
- `— Spec Dark` 동반 프레임도 새 이름 + " — Spec Dark" 로 함께.

---

## 4. 실행(이동) 순서 — Core 먼저 · Pattern 나중 · 리네임은 맨 마지막 한 번에

**전부 `build-components.ts` 편집 + 설치기 재실행으로 수행(피그마 수동 이동 아님).**

1. **(이동 1) CATEGORIES 3분할** — `Form` 멤버를 3 카테고리로 분리:
   - `Form`: Input, Search Input, Text Area, Dropdown List, Dropdown, Select Box
   - `Date Picker`: Calendar Cell, Calendar Tile, Calendar, Date Picker (Core→Pattern 순)
   - `Time Picker`: Time Picker Cell, Time Picker Dropdown, Time Picker (Core→Pattern 순)
   - 카테고리 순서는 Form → Date Picker → Time Picker. (각각 섹션 자동 생성)
2. **(검증 1)** 재설치 → 섹션 3개 생성·구역 순서 확인. 인스턴스 링크·렌더 확인. **이 단계까지 이름은 기존 그대로** 둔다.
3. **(이동 2) 구역 헤더 라벨** — 각 섹션에 Core/Pattern 구분 텍스트 추가(생성기 spec 데코).
4. **(리네임 — 마지막에 모아서)** §3 매핑대로 `set.name`(+ Spec Dark) 일괄 변경. **내부키·토큰참조 불변.** 한 번에 적용 후 재설치.
5. **(검증 2)** §6 체크리스트 전수.
6. **(publish)** 모든 이동·리네임·검증 통과 **후 1회만** 라이브러리 publish.

> 생성기 변경은 **구조 변경**이므로 ⭐ 단독 금지: 빌드=🏗️ figma-library-builder, 검증=🤖 component-verifier(Gate 13). (CLAUDE.md HARD RULE)

---

## 5. 토큰 공유 체크리스트 (분리하며 변수 복제 금지)

- [ ] Date Picker / Time Picker trigger(닫힌 입력박스)가 **`color/form-control/bg|border|text/*`** 를 Form Input 과 **같은 변수**로 참조하는지(사이즈 XXSM~MD·상태 Default/Filled/Disabled 공통). → STAGE 0 확인됨. 분리 후에도 동일 변수 유지.
- [ ] Date 계열 색은 `color/date-picker/*`, Time Picker Dropdown 은 `color/dropdown/*` 를 그대로 참조 — **섹션 분리를 이유로 `date-picker-2/*` 같은 복제 변수 만들지 말 것.**
- [ ] 사이즈/높이/라운드(`sizing/form-control/*`, `radius/control/*`) 도 공통 Foundation 변수 유지.
- [ ] 리네임 후 `npm run components:keycheck` 로 모든 빌더 키가 vars-data 정본에 존재하는지(복제·누락 0) 확인.

---

## 6. 실행 후 검증 체크리스트

- [ ] **인스턴스 링크 유지**: Date Picker(Open) → Calendar Cell, Calendar → Cell/Tile, Time Picker(Focus) → Dropdown → Cell, 그리고 **다른 화면에 쓰인 이 컴포넌트들의 인스턴스**가 detach 없이 새 세트를 가리키는지(재설치 시 `getOrBuild` 재사용 로직 유효).
- [ ] **게이트**: `npm run gate:check` — installer:check(tsc)·keycheck·anatomy·iconpolicy·Gate 13(component-verifier structural)·Gate 7(토큰값).
- [ ] **provenance**: 신규 섹션 인스턴스의 mainComponent 가 전부 로컬(remote=false) 또는 허용 V2.2 아이콘 키(`registry/figma/allowed-remote-keys.json`). 외부 라이브러리 0.
- [ ] **렌더 1회 확인**: 3섹션 각각 get_screenshot 으로 구역/순서/겹침 0 육안.
- [ ] **라이브러리 publish 시점**: 위 전부 통과한 **뒤 1회만** publish. (이동/리네임 중간 publish 금지 — 소비처가 중간 상태를 당겨감.)

---

## 부록 — 주의

- 리네임은 **반드시 이동·검증이 끝난 뒤 한 번에**(§4-4). 이동과 리네임을 섞으면 인스턴스 추적이 어려워진다.
- 네이밍 = 프리픽스 + 기존명 그대로(중복 직역) 확정(예 `Date / Date Picker`, `Time / Time Picker Cell`).
- 이 문서는 **계획서**다. 실제 생성기 편집·재설치는 별도 STAGE(승인 후)에서 빌드/검증 분리로 진행한다.
