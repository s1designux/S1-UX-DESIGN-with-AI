# 2단계 — 빌드 계획 (🎩 ⭐ 오케스트레이터, 2026-09-08)

**목표:** Input 의 상태 이름 `Editing` → `Focus` 개명. 정본(Figma 변형세트 + 설치기) 쪽만 바꾼다. 웹은 이미 `focus`.
**경로:** river 지정 **A — 변형 값 이름만 개명.** 설치기 재실행으로 세트를 새로 만들지 않는다(새 세트 = 새 node id = 시안 인스턴스 끊김).

---

## 1. Figma 빌드 계획 (🏗️ figma-library-builder)

| 대상 | 작업 | 대상 확정 방법 | variant 축 | 배치·구조 |
|---|---|---|---|---|
| Input 변형세트 | **State 축의 값 이름만 `Editing`→`Focus`** | `importComponentSetByKeyAsync("14386ca6d6468f5cd8cc02edaaed512a3ff14b15")` 로 세트 확정 (정황 추정 `2386:52176` 은 대조용 참고값) | `Size × State × Message × Break` — **축 이름·개수 불변**, State 값 하나만 개명 | **변경 없음** — 좌표·크기·패킹·토큰 바인딩·폰트 전부 손대지 않는다 |

**개명 방법(빌더 지시):**
- variant 8개(`…, State=Editing, …`)의 `name` 문자열에서 `State=Editing` → `State=Focus` 로 **치환만** 한다. 다른 축 토막(`Size=`·`Message=`·`Break=`)은 글자 하나도 바꾸지 않는다.
- **금지:** 노드 생성·삭제·복제, `combineAsVariants` 재실행, 리패킹·리사이즈, fill/stroke/텍스트/폰트 수정. 이번 작업에 새 노드는 **0개**다.
- 개명 전후로 세트의 `id`·`key`·자식 variant 의 `id` 를 전부 기록해 `node-map.json` 에 남긴다 → **id 가 하나도 안 바뀌었다**는 것이 4단계 판정의 기계 근거.

**🚫 하드룰 준수:** H1① — ⭐ 는 use_figma 로 직접 손대지 않는다. 빌드=🏗️, 검증=🤖, ⭐ 는 흐름만.
**H2/H3 무관:** 색·폰트를 만들지 않는다(fills·textStyle 무편집). 그래도 4단계에서 스캔은 돌려 **무변경**을 확인한다.

### 색상 바인딩 사전 조회표
| hex 값 | 노드·속성 유형 | DS 조회 결과 | 빌드 지시 |
|---|---|---|---|
| — | — | **해당 없음** | 이번 작업은 새 fill 을 만들지 않는다. 읽어들인 raw hex 0건, 신규 바인딩 0건 |

### 허용편차 선언서
| # | 대상 | 사유 |
|---|---|---|
| — | 없음 | 의도된 차이 0건. 원본 대비 바뀌는 것은 **variant 이름 문자열 하나뿐**이다 |

---

## 2. 저장소 변경 계획 (⭐ 직접 — 기계적 문자열 치환)

### 정본 (canon)
| 파일 | 건수 | 내용 |
|---|---|---|
| `plugins/figma-vars-installer/src/build-components.ts` | 6 | :910 변형 값 `{ name: "Editing" }`→`"Focus"` · :982 `st.name === "Editing"`→`"Focus"` · 주석 4 |
| `plugins/figma-vars-installer/src/pattern-data.ts` | 6 | :165 `type InputState` · :328/338 `input(…,"Editing",…)` · :504/521/540 `pr:{ State:"Editing" }` |

> pattern-data 는 **이름으로 인스턴스를 찾는다** — build-components 와 **같은 커밋에서 함께** 바꾸지 않으면 패턴 화면 생성이 깨진다.

### 메타 (registry 가 기준)
| 파일 | 건수 |
|---|---|
| `registry/components/input.json` | 2 (:64 서술 · :213 `state`) |

### UI 라이브러리 src
| 파일 | 건수 | 내용 |
|---|---|---|
| `ui-library/src/components/input/manifest.json` | 3 | :47 `"Editing":"focus"`→`"Focus":"focus"` (**값 `focus` 는 그대로** — Gate 34 신설 0건) · :177/:265 서술 |
| `ui-library/src/components/input/input.js` | 1 | :9 주석 |

### 🔴 검사기 — 인계 목록에 없었으나 **필수**
| 파일 | 내용 | 근거 |
|---|---|---|
| `scripts/component-anatomy-check.js:39` | 정규식·라벨 `State=Editing`→`State=Focus` | 안 고치면 Gate 11 이 "매칭 variant 0개(selector 부패)" 로 **커밋 차단** |
| `scripts/design-md-agent-contract-check.js:38` | 기대 목록 `'Editing'`→`'Focus'` | DESIGN.core.md 재생성 후 값이 Focus 가 되어 **기대 불일치로 실패** |

> 이건 "검사기를 통과시키려고 검사기를 약화하는 것"이 **아니다** — 규칙의 대상 이름이 바뀌었으므로 **같은 강도로 재조준**한다.
> 조준 근거는 새 기준이 아니라 `build-components.ts` 의 **실제 variant 선언**이다(4단계에서 Gate 11 이 8개 variant 를 다시 잡는지로 확인).

### 사람이 보는 표시 (주석·라벨)
| 파일 | 내용 |
|---|---|
| `assets/js/ui-library-guide.js:650` | 안내 페이지 상태표 라벨 `"Editing"`→`"Focus"` |
| `scripts/gate-check.js:414` · `pages/components.html:718-719` · `pages/ui-review.html:473` | 주석·안내 문구 |

> `pages/components-archive.html` 은 **보존용 아카이브라 건드리지 않는다.**

### 손대지 않는 것 (하드룰 H6 — 파생은 재생성)
`design/DESIGN.core.md` · `registry/components/component-facts.json` · `component-guide-model.json` · `assets/js/registry-data-bundle.js` · `ui-library/dist/**` · `assets/downloads/*.zip`

**재생성·검증 순서:**
```
npm run tokens:reconcile
npm run ui:build
npm run ui:build:check
npm run ui:test
node scripts/canon-addition-check.js      # Gate 34 — 신설 0건
npm run gate:check
```
Gate 13: 🤖 component-verifier 검증 후 `node scripts/installer-build-verify-check.js --record --by component-verifier …` 로 기록 (⭐ 자가인증 금지 — 변형 축 값 변경이므로).

---

## 3. 4단계에서 반드시 확인할 것 (🤖 component-verifier)

1. **기존 시안 인스턴스가 따라왔는가 — 이번 작업의 핵심 미확인 사항.**
   "변형 값 이름을 바꿔도 인스턴스는 내부 id 로 따라온다"는 **일반 동작이지 이 파일에서 확인된 사실이 아니다.**
   `reports/screen-rebuild/modu-app/login-mobile` · `signup-mobile-web` 의 State=Editing 인스턴스를 **실제로 열어**
   ① 컴포넌트 연결이 살아있고 ② State 속성값이 `Focus` 로 읽히고 ③ 렌더가 안 깨졌는지 확인하고, 근거(속성 조회 출력·get_screenshot)를 `4-verification.md` 에 적는다.
   **깨졌으면 즉시 멈추고 river 에게 보고 — 시안을 임의로 고치지 않는다.**
2. **node id 무변경** — 세트·variant 8개의 id 가 개명 전후 동일한가(`node-map.json` 대조). 하나라도 바뀌면 경로 A 위반 = ❌(a).
3. **살아있는 인스턴스 실제 건수** — 인계 문서의 "17곳"과 저장소 기록 12건이 다르다. Figma 를 직접 세어 확정하고, 인계 수치를 그대로 옮겨 적지 않는다.
4. **잔존 스캔** — 세트 전체에 `Editing` 문자열 0건 / 비-Pretendard 0건 / 미바인딩 raw hex **개명 전과 동일**(새로 늘지 않았는가).
5. **Gate 11 재조준 확인** — 검사기가 `State=Focus` variant 8개를 실제로 잡고 caret·remove 를 검사하는가(0개 매칭이면 검사가 죽은 것).

---

## 4. 결정 필요 (HD) — river 확인

- **HD-1: 안내 페이지의 데모용 내부 표시 키(`data-force-state="editing"`)도 같이 바꿀까요?**
  웹 안내 페이지에서 "이 칸은 입력 중 모습입니다"를 보여주려고 쓰는 **가이드 전용 표시 장치**입니다
  (`assets/js/ui-library-guide.js` + `assets/css/ui-library-guide.css` 2곳. 실제 배포되는 Input 코드에는 없습니다).
  겉에 보이는 라벨은 계획대로 `Focus` 로 바꿉니다. 문제는 뒤에 숨은 이 키만 `editing` 으로 남는다는 점입니다.
  - **(A) 같이 바꾼다** — 이름이 완전히 하나로 통일됩니다. 파일 2개 추가 수정.
  - **(B) 지금은 둔다** — river 가 정한 범위("정본만 바꾼다")에 정확히 머무릅니다.
  - **✅ river 결정 2026-09-08: (A)** — 같이 바꾼다. `assets/js/ui-library-guide.js` + `assets/css/ui-library-guide.css` 의
    `data-force-state="editing"` → `"focus"` 로 개명해 이름을 완전히 통일한다.
    (가이드 전용 표시 장치이며 배포 Input 코드·`canonicalStateMap` 의 **값** `focus` 와는 무관 — Gate 34 신설 0건 유지.)

> 다른 HD 없음. 색 신설 0건 · 구조 신설 0건 · 아이콘 신설 0건 · 배치 겹침 없음.

---

## 검문소 2 — ✅ 통과 (2026-09-08)
- HD-1 → river **(A)** 결정. 미해결 HD 0건. 3단계(🏗️ figma-library-builder) 착수.
